"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Compass, Layers, Maximize2, Minimize2, ZoomIn, ZoomOut } from "lucide-react";
import type { GeoJSONSource, Map as MapLibreMap, Marker as MapLibreMarker, StyleSpecification } from "maplibre-gl";
import type { EventRecord } from "@/data/rewind";

// Standard equirectangular projection helper for SVG mode
function project(lat: number, lon: number) {
  return {
    x: ((lon + 180) / 360) * 100,
    y: ((90 - lat) / 180) * 100,
  };
}

function isWebGLAvailable() {
  if (typeof window === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
    );
  } catch {
    return false;
  }
}

const CARTO_DARK_MATTER_STYLE = "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";

// Fallback raster tile style specification if vector GL JSON fails or is blocked
const FALLBACK_RASTER_DARK_STYLE: StyleSpecification = {
  version: 8,
  sources: {
    "carto-dark-raster": {
      type: "raster",
      tiles: [
        "https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png",
        "https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png",
        "https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png",
        "https://d.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png",
      ],
      tileSize: 256,
      attribution: "© OpenStreetMap contributors, © CARTO",
    },
  },
  layers: [
    {
      id: "carto-dark-base",
      type: "raster",
      source: "carto-dark-raster",
      minzoom: 0,
      maxzoom: 19,
    },
  ],
};

export function MapGraphic({
  events,
  selected,
  onSelect,
}: {
  events: EventRecord[];
  selected?: string;
  onSelect?: (id: string) => void;
}) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<MapLibreMap | null>(null);
  const markersRef = useRef<MapLibreMarker[]>([]);
  const [mapMode, setMapMode] = useState<"webgl" | "svg">("webgl");
  const [webGlSupported, setWebGlSupported] = useState(true);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const points = useMemo(
    () => events.filter((e) => e.latitude != null && e.longitude != null),
    [events]
  );

  const coords = useMemo(
    () => points.map((e) => ({ ...project(e.latitude!, e.longitude!), e })),
    [points]
  );

  const selectedEvent = useMemo(
    () => points.find((e) => e.id === selected) || points[points.length - 1],
    [points, selected]
  );

  // Group overlapping points by proximity for SVG view
  const clusters = useMemo(() => {
    const map = new Map<string, typeof coords>();
    coords.forEach((pt) => {
      const key = `${pt.x.toFixed(1)}_${pt.y.toFixed(1)}`;
      const existing = map.get(key) || [];
      existing.push(pt);
      map.set(key, existing);
    });
    return Array.from(map.values()).map((group) => {
      const topPt = group.find((p) => p.e.id === selected) || group[group.length - 1];
      return {
        x: topPt.x,
        y: topPt.y,
        event: topPt.e,
        count: group.length,
        hasSelected: group.some((p) => p.e.id === selected),
        allVerified: group.every((p) => p.e.verificationStatus === "verified"),
      };
    });
  }, [coords, selected]);

  // Construct curved trajectory arcs between consecutive chronological locations (SVG)
  const arcs = useMemo(() => {
    if (coords.length < 2) return "";
    let d = "";
    for (let i = 0; i < coords.length - 1; i++) {
      const p1 = coords[i];
      const p2 = coords[i + 1];
      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 0.5) continue;

      const midX = (p1.x + p2.x) / 2;
      const midY = (p1.y + p2.y) / 2 - Math.min(12, dist * 0.25);

      d += `${d ? " " : ""}M${p1.x.toFixed(2)},${p1.y.toFixed(2)} Q${midX.toFixed(2)},${midY.toFixed(2)} ${p2.x.toFixed(2)},${p2.y.toFixed(2)}`;
    }
    return d;
  }, [coords]);

  // Initialize MapLibre GL instance strictly tied to mapMode lifecycle
  useEffect(() => {
    if (mapMode !== "webgl" || typeof window === "undefined" || !mapContainerRef.current) return;

    let isCancelled = false;
    let localMap: MapLibreMap | null = null;
    let fallbackAttempted = false;

    async function initMap() {
      try {
        if (!isWebGLAvailable()) {
          setWebGlSupported(false);
          setMapMode("svg");
          return;
        }

        const { Map } = await import("maplibre-gl");
        if (isCancelled || !mapContainerRef.current) return;

        const initialCenter: [number, number] = selectedEvent
          ? [selectedEvent.longitude!, selectedEvent.latitude!]
          : [35.2137, 31.7683]; // Default Levant / Jerusalem coordinates

        const map = new Map({
          container: mapContainerRef.current,
          style: CARTO_DARK_MATTER_STYLE,
          center: initialCenter,
          zoom: 3.8,
          pitch: 25,
          attributionControl: { compact: true },
        });

        localMap = map;
        mapInstanceRef.current = map;

        // Register style and network error handler to fallback gracefully
        map.on("error", (e) => {
          if (!fallbackAttempted && (e.error?.message?.includes("style") || e.error?.message?.includes("fetch"))) {
            fallbackAttempted = true;
            console.warn("Switching MapLibre to resilient fallback dark style due to remote style error:", e.error);
            try {
              map.setStyle(FALLBACK_RASTER_DARK_STYLE);
            } catch {
              setWebGlSupported(false);
              setMapMode("svg");
            }
          }
        });

        map.on("load", () => {
          if (isCancelled) return;
          setMapLoaded(true);

          if (!map.getSource("trajectories")) {
            const lineCoordinates = points.length >= 2
              ? points.map((p) => [p.longitude!, p.latitude!])
              : [];

            map.addSource("trajectories", {
              type: "geojson",
              data: {
                type: "Feature",
                properties: {},
                geometry: {
                  type: "LineString",
                  coordinates: lineCoordinates,
                },
              },
            });

            map.addLayer({
              id: "trajectory-line-glow",
              type: "line",
              source: "trajectories",
              layout: {
                "line-join": "round",
                "line-cap": "round",
              },
              paint: {
                "line-color": "#f59e0b",
                "line-width": 4,
                "line-opacity": 0.35,
                "line-blur": 3,
              },
            });

            map.addLayer({
              id: "trajectory-line",
              type: "line",
              source: "trajectories",
              layout: {
                "line-join": "round",
                "line-cap": "round",
              },
              paint: {
                "line-color": "#fbbf24",
                "line-width": 2,
                "line-opacity": 0.9,
                "line-dasharray": [2, 1],
              },
            });
          }

          map.resize();
        });

        // Trigger safe resize after initial layout render
        setTimeout(() => {
          if (!isCancelled && mapInstanceRef.current) {
            mapInstanceRef.current.resize();
          }
        }, 200);
      } catch (err) {
        console.warn("MapLibre GL failed to initialize, falling back to SVG vector view:", err);
        setWebGlSupported(false);
        setMapMode("svg");
      }
    }

    initMap();

    return () => {
      isCancelled = true;
      if (localMap) {
        localMap.remove();
        localMap = null;
      }
      mapInstanceRef.current = null;
      setMapLoaded(false);
    };
  }, [mapMode, points, selectedEvent]);

  // Keep MapLibre canvas dimensions in sync with CSS container layout
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const observer = new ResizeObserver(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.resize();
      }
    });

    observer.observe(mapContainerRef.current);
    return () => observer.disconnect();
  }, [isExpanded]);

  // Update MapLibre markers when points or selection change
  useEffect(() => {
    if (mapMode !== "webgl" || !mapInstanceRef.current || !mapLoaded) return;

    const map = mapInstanceRef.current;

    // Remove existing markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    import("maplibre-gl").then(({ Marker }) => {
      // Group points by location proximity for clean clustering
      const grouped = new Map<string, typeof points>();
      points.forEach((p) => {
        const key = `${p.latitude?.toFixed(2)}_${p.longitude?.toFixed(2)}`;
        const list = grouped.get(key) || [];
        list.push(p);
        grouped.set(key, list);
      });

      grouped.forEach((eventList) => {
        const rep = eventList.find((e) => e.id === selected) || eventList[eventList.length - 1];
        if (rep.latitude == null || rep.longitude == null) return;
        const { longitude, latitude } = rep;

        const isSelected = eventList.some((e) => e.id === selected);
        const isVerified = eventList.every((e) => e.verificationStatus === "verified");

        // Semantic, accessible button element for WCAG AA keyboard operability
        const el = document.createElement("button");
        el.type = "button";
        el.className = `webgl-map-marker ${isSelected ? "selected" : ""} ${
          isVerified ? "verified" : "provisional"
        }`;
        el.setAttribute(
          "aria-label",
          `${rep.eventName}, ${rep.city} (${eventList.length} documented record${
            eventList.length > 1 ? "s" : ""
          })`
        );

        const dot = document.createElement("span");
        dot.className = "marker-dot";
        el.appendChild(dot);

        if (eventList.length > 1) {
          const countBadge = document.createElement("span");
          countBadge.className = "marker-count";
          countBadge.textContent = String(eventList.length);
          el.appendChild(countBadge);
        }

        const tooltip = document.createElement("span");
        tooltip.className = "marker-tooltip";
        tooltip.textContent = `${rep.city} · ${eventList.length > 1 ? `${eventList.length} events` : rep.eventName}`;
        el.appendChild(tooltip);

        const handleActivate = () => {
          onSelect?.(rep.id);
        };

        el.addEventListener("click", handleActivate);
        el.addEventListener("keydown", (evt) => {
          if (evt.key === "Enter" || evt.key === " ") {
            evt.preventDefault();
            handleActivate();
          }
        });

        const marker = new Marker({ element: el })
          .setLngLat([longitude, latitude])
          .addTo(map);

        markersRef.current.push(marker);
      });

      // Update trajectory line coordinates
      const source = map.getSource("trajectories") as GeoJSONSource | undefined;
      if (source && "setData" in source) {
        const lineCoords = points.length >= 2
          ? points
              .filter((p): p is typeof p & { longitude: number; latitude: number } => p.longitude != null && p.latitude != null)
              .map(({ longitude, latitude }) => [longitude, latitude])
          : [];
        source.setData({
          type: "Feature",
          properties: {},
          geometry: {
            type: "LineString",
            coordinates: lineCoords,
          },
        });
      }

    });
  }, [points, selected, mapLoaded, mapMode, onSelect]);

  // Smooth fly-to camera movement on selection change
  useEffect(() => {
    if (mapMode !== "webgl" || !mapInstanceRef.current || !selectedEvent) return;
    mapInstanceRef.current.flyTo({
      center: [selectedEvent.longitude!, selectedEvent.latitude!],
      zoom: 5.5,
      pitch: 35,
      duration: 1100,
      essential: true,
    });
  }, [selectedEvent, mapMode]);

  return (
    <div
      className={`evidence-map-wrapper ${isExpanded ? "expanded-view" : ""}`}
      role="group"
      aria-label={`Geospatial map showing ${points.length} documented event locations`}
    >
      {/* Map Control Actions Toolbar */}
      <div className="map-toolbar">
        {webGlSupported && (
          <button
            type="button"
            className={`map-tool-btn ${mapMode === "webgl" ? "active" : ""}`}
            onClick={() => setMapMode(mapMode === "webgl" ? "svg" : "webgl")}
            title={mapMode === "webgl" ? "Switch to Schematic Basemap" : "Switch to 3D WebGL Vector Map"}
          >
            <Layers size={13} />
            <span>{mapMode === "webgl" ? "3D Vector" : "Schematic"}</span>
          </button>
        )}

        <button
          type="button"
          className="map-tool-btn icon-only"
          onClick={() => {
            setIsExpanded((prev) => !prev);
            setTimeout(() => mapInstanceRef.current?.resize(), 100);
          }}
          title={isExpanded ? "Collapse Map" : "Enlarge Map"}
          aria-label={isExpanded ? "Collapse map view" : "Enlarge map view"}
        >
          {isExpanded ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
        </button>

        {mapMode === "webgl" && (
          <>
            <button
              type="button"
              className="map-tool-btn icon-only"
              onClick={() => mapInstanceRef.current?.zoomIn()}
              aria-label="Zoom in"
            >
              <ZoomIn size={13} />
            </button>
            <button
              type="button"
              className="map-tool-btn icon-only"
              onClick={() => mapInstanceRef.current?.zoomOut()}
              aria-label="Zoom out"
            >
              <ZoomOut size={13} />
            </button>
            <button
              type="button"
              className="map-tool-btn icon-only"
              onClick={() => {
                if (selectedEvent) {
                  mapInstanceRef.current?.flyTo({
                    center: [selectedEvent.longitude!, selectedEvent.latitude!],
                    zoom: 3.8,
                    pitch: 0,
                  });
                }
              }}
              aria-label="Reset orientation"
            >
              <Compass size={13} />
            </button>
          </>
        )}
      </div>

      {/* WebGL Interactive Map Container */}
      {mapMode === "webgl" ? (
        <div ref={mapContainerRef} className="webgl-map-container" />
      ) : (
        /* SVG Vector Schematic Map Mode */
        <div className="evidence-map">
          <div className="map-grid" />
          <svg className="basemap-vectors" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            <path
              className="coastline"
              d="M 15 22 Q 18 18 24 16 Q 30 20 28 32 Q 25 38 22 45 Q 26 48 24 55 Q 20 52 18 42 Z"
            />
            <path
              className="coastline"
              d="M 28 55 Q 35 58 34 70 Q 30 82 28 90 Q 25 80 26 62 Z"
            />
            <path
              className="coastline"
              d="M 48 24 Q 54 22 56 30 Q 52 38 46 36 Q 44 28 48 24 Z"
            />
            <path
              className="coastline focal"
              d="M 46 36 Q 58 35 62 38 Q 60 44 55 42 Q 48 42 46 36 Z"
            />
            <path
              className="coastline"
              d="M 46 42 Q 60 42 58 60 Q 55 78 50 82 Q 42 65 44 48 Z"
            />
            <path
              className="coastline focal"
              d="M 58 32 Q 70 28 85 30 Q 82 45 74 52 Q 64 48 58 40 Z"
            />
            {arcs && <path className="travel-path animated-arc" d={arcs} />}
          </svg>

          <span className="map-label north-america">NORTH<br />AMERICA</span>
          <span className="map-label europe">EUROPE</span>
          <span className="map-label asia">WEST ASIA / LEVANT</span>
          <span className="map-label atlantic">NORTH ATLANTIC</span>

          {clusters.map((cluster) => {
            const isSelected = cluster.hasSelected;
            return (
              <button
                type="button"
                key={cluster.event.id}
                onClick={() => onSelect?.(cluster.event.id)}
                style={{ left: `${cluster.x}%`, top: `${cluster.y}%` }}
                className={`map-point ${isSelected ? "selected" : ""} ${
                  cluster.allVerified ? "verified" : "provisional"
                }`}
                aria-label={`${cluster.event.startDate}, ${cluster.event.eventName}, ${cluster.event.city}`}
              >
                <i />
                {cluster.count > 1 && <b className="cluster-badge">{cluster.count}</b>}
                <span>
                  {isSelected
                    ? `${cluster.event.city} (${cluster.count})`
                    : cluster.count > 3
                    ? cluster.event.city
                    : ""}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Legend & Attribution */}
      <div className="map-legend">
        <span><i className="confirmed-dot" /> Verified</span>
        <span><i className="provisional-dot" /> Provisional</span>
        <span><i className="arc-indicator" /> Trajectory Arc</span>
        <span className="map-attribution">© OpenStreetMap, © CARTO</span>
      </div>
    </div>
  );
}
