"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Compass, Layers, ZoomIn, ZoomOut } from "lucide-react";
import type { GeoJSONSource, Map as MapLibreMap, Marker as MapLibreMarker } from "maplibre-gl";
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

  // Initialize MapLibre GL instance
  useEffect(() => {
    if (mapMode !== "webgl" || typeof window === "undefined" || !mapContainerRef.current) return;

    let isCancelled = false;

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
          : [35.2137, 31.7683]; // Jerusalem default

        const map = new Map({
          container: mapContainerRef.current,
          style: CARTO_DARK_MATTER_STYLE,
          center: initialCenter,
          zoom: 3.5,
          pitch: 25,
          attributionControl: false,
        });

        map.on("load", () => {
          if (isCancelled) return;
          mapInstanceRef.current = map;
          setMapLoaded(true);

          // Add trajectory line source and layer
          const lineCoordinates = points.map((p) => [p.longitude!, p.latitude!]);
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
              "line-opacity": 0.3,
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
              "line-width": 1.5,
              "line-opacity": 0.85,
              "line-dasharray": [2, 1],
            },
          });
        });
      } catch (err) {
        console.warn("MapLibre GL failed to initialize, falling back to SVG vector view:", err);
        setWebGlSupported(false);
        setMapMode("svg");
      }
    }

    initMap();

    return () => {
      isCancelled = true;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [mapMode, points, selectedEvent]);

  // Update MapLibre markers when points or selection change
  useEffect(() => {
    if (mapMode !== "webgl" || !mapInstanceRef.current || !mapLoaded) return;

    // Clear old markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    import("maplibre-gl").then(({ Marker }) => {
      const map = mapInstanceRef.current;
      if (!map) return;

      // Group nearby points for WebGL markers
      const webGlClusters = new Map<string, EventRecord[]>();
      points.forEach((p) => {
        const key = `${p.latitude!.toFixed(2)}_${p.longitude!.toFixed(2)}`;
        const list = webGlClusters.get(key) || [];
        list.push(p);
        webGlClusters.set(key, list);
      });

      webGlClusters.forEach((clusterEvents) => {
        const topEvent = clusterEvents.find((e) => e.id === selected) || clusterEvents[clusterEvents.length - 1];
        const isSelected = clusterEvents.some((e) => e.id === selected);

        const el = document.createElement("div");
        el.className = `webgl-map-marker ${isSelected ? "selected" : ""} ${
          topEvent.verificationStatus === "verified" ? "verified" : "provisional"
        }`;
        el.innerHTML = `
          <div class="marker-dot"></div>
          ${clusterEvents.length > 1 ? `<span class="marker-count">${clusterEvents.length}</span>` : ""}
          <span class="marker-tooltip">${topEvent.city}</span>
        `;

        el.addEventListener("click", () => {
          onSelect?.(topEvent.id);
        });

        const marker = new Marker({ element: el })
          .setLngLat([topEvent.longitude!, topEvent.latitude!])
          .addTo(map);

        markersRef.current.push(marker);
      });

      // Update trajectory line coordinates
      const source = map.getSource("trajectories") as GeoJSONSource | undefined;
      if (source && "setData" in source) {
        source.setData({
          type: "Feature",
          properties: {},
          geometry: {
            type: "LineString",
            coordinates: points.map((p) => [p.longitude!, p.latitude!]),
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
      duration: 1200,
      essential: true,
    });
  }, [selectedEvent, mapMode]);

  return (
    <div
      className="evidence-map-wrapper"
      role="group"
      aria-label={`Geospatial map showing ${points.length} documented event locations`}
    >
      {/* Map Control Actions Toolbar */}
      <div className="map-toolbar">
        {webGlSupported && (
          <button
            className={`map-tool-btn ${mapMode === "webgl" ? "active" : ""}`}
            onClick={() => setMapMode(mapMode === "webgl" ? "svg" : "webgl")}
            title={mapMode === "webgl" ? "Switch to Schematic Basemap" : "Switch to 3D WebGL Vector Map"}
          >
            <Layers size={13} />
            <span>{mapMode === "webgl" ? "3D Vector" : "Schematic"}</span>
          </button>
        )}

        {mapMode === "webgl" && (
          <>
            <button
              className="map-tool-btn icon-only"
              onClick={() => mapInstanceRef.current?.zoomIn()}
              aria-label="Zoom in"
            >
              <ZoomIn size={13} />
            </button>
            <button
              className="map-tool-btn icon-only"
              onClick={() => mapInstanceRef.current?.zoomOut()}
              aria-label="Zoom out"
            >
              <ZoomOut size={13} />
            </button>
            <button
              className="map-tool-btn icon-only"
              onClick={() => {
                if (selectedEvent) {
                  mapInstanceRef.current?.flyTo({
                    center: [selectedEvent.longitude!, selectedEvent.latitude!],
                    zoom: 3.5,
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

      {/* Legend */}
      <div className="map-legend">
        <span><i className="confirmed-dot" /> Verified Record</span>
        <span><i className="provisional-dot" /> Provisional</span>
        <span><i className="arc-indicator" /> Trajectory Arc</span>
      </div>
    </div>
  );
}
