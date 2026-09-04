"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Compass, Globe, Layers, MapPin, Maximize2, Minimize2, ZoomIn, ZoomOut } from "lucide-react";
import type { GeoJSONSource, Map as MapLibreMap, Marker as MapLibreMarker, StyleSpecification } from "maplibre-gl";
import type { EventRecord } from "@/data/rewind";

// Standard equirectangular projection helper for SVG fallback mode
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

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

// Mapbox Vector Styles (when token is provided)
const MAPBOX_DARK_STYLE = MAPBOX_TOKEN
  ? `https://api.mapbox.com/styles/v1/mapbox/dark-v11?access_token=${MAPBOX_TOKEN}`
  : "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";

const MAPBOX_SATELLITE_STYLE = MAPBOX_TOKEN
  ? `https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v12?access_token=${MAPBOX_TOKEN}`
  : "";

// Fallback raster tile style specification if vector GL JSON fails or is offline
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
      maxzoom: 20,
    },
  ],
};

function addTrajectoriesToMap(map: MapLibreMap, points: EventRecord[], isSatellite: boolean) {
  const lineCoordinates = points.length >= 2
    ? points
        .filter((p): p is typeof p & { longitude: number; latitude: number } => p.longitude != null && p.latitude != null)
        .map(({ longitude, latitude }) => [longitude, latitude])
    : [];

  const existingSource = map.getSource("trajectories") as GeoJSONSource | undefined;
  if (existingSource && "setData" in existingSource) {
    existingSource.setData({
      type: "Feature",
      properties: {},
      geometry: {
        type: "LineString",
        coordinates: lineCoordinates,
      },
    });
  } else if (!existingSource) {
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
      id: "trajectory-line",
      type: "line",
      source: "trajectories",
      layout: {
        "line-join": "round",
        "line-cap": "round",
      },
      paint: {
        "line-color": isSatellite ? "#7dd3fc" : "#fbbf24",
        "line-width": 2,
        "line-opacity": 0.95,
        "line-dasharray": [2, 1],
      },
    });
  }
}

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
  const [webGlSupported, setWebGlSupported] = useState<boolean>(false);
  const [mapMode, setMapMode] = useState<"webgl" | "svg">("svg");
  const [mapTheme, setMapTheme] = useState<"dark" | "satellite">("dark");
  const [mapLoaded, setMapLoaded] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Mount-only detection of WebGL to ensure consistent SSR and client hydration
  useEffect(() => {
    const handle = requestAnimationFrame(() => {
      const supported = isWebGLAvailable();
      if (supported) {
        setWebGlSupported(true);
        setMapMode("webgl");
      }
    });
    return () => cancelAnimationFrame(handle);
  }, []);

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

  const pointsRef = useRef(points);
  const mapThemeRef = useRef(mapTheme);
  const selectedEventRef = useRef(selectedEvent);

  useEffect(() => {
    pointsRef.current = points;
    mapThemeRef.current = mapTheme;
    selectedEventRef.current = selectedEvent;
  }, [points, mapTheme, selectedEvent]);

  // Escape key collapses expanded map view
  useEffect(() => {
    if (!isExpanded) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsExpanded(false);
        setTimeout(() => mapInstanceRef.current?.resize(), 100);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isExpanded]);

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
      const hasSelected = group.some((p) => p.e.id === selected);
      const allVerified = group.every((p) => p.e.verificationStatus === "verified");
      return {
        x: topPt.x,
        y: topPt.y,
        event: topPt.e,
        count: group.length,
        hasSelected,
        allVerified,
      };
    });
  }, [coords, selected]);

  const arcs = useMemo(() => {
    if (coords.length < 2) return "";
    return coords.reduce((acc, curr, i, arr) => {
      if (i === 0) return `M ${curr.x} ${curr.y}`;
      const prev = arr[i - 1];
      const mx = (prev.x + curr.x) / 2;
      const my = Math.min(prev.y, curr.y) - 6;
      return `${acc} Q ${mx} ${my} ${curr.x} ${curr.y}`;
    }, "");
  }, [coords]);

  // Transform Request to attach Mapbox access token to all resource requests
  const transformRequest = useCallback((url: string) => {
    if (MAPBOX_TOKEN && (url.startsWith("mapbox://") || url.includes("mapbox.com"))) {
      if (!url.includes("access_token=")) {
        const separator = url.includes("?") ? "&" : "?";
        return { url: `${url}${separator}access_token=${MAPBOX_TOKEN}` };
      }
    }
    return { url };
  }, []);

  // Initialize MapLibre / Mapbox WebGL instance
  useEffect(() => {
    if (mapMode !== "webgl") return;

    let isCancelled = false;
    let localMap: MapLibreMap | null = null;
    let fallbackAttempted = false;

    async function initMap() {
      try {
        const { Map } = await import("maplibre-gl");
        if (isCancelled || !mapContainerRef.current) return;

        const initialCenter: [number, number] =
          selectedEventRef.current?.longitude != null && selectedEventRef.current?.latitude != null
            ? [selectedEventRef.current.longitude, selectedEventRef.current.latitude]
            : [35.2137, 31.7683]; // Default Levant coordinates

        const initialStyle = mapThemeRef.current === "satellite" && MAPBOX_SATELLITE_STYLE
          ? MAPBOX_SATELLITE_STYLE
          : MAPBOX_DARK_STYLE;

        const map = new Map({
          container: mapContainerRef.current,
          style: initialStyle,
          center: initialCenter,
          zoom: 4.2,
          pitch: mapThemeRef.current === "satellite" ? 42 : 25,
          attributionControl: { compact: true },
          transformRequest,
        });

        localMap = map;
        mapInstanceRef.current = map;

        map.on("error", (e) => {
          if (!fallbackAttempted && (e.error?.message?.includes("style") || e.error?.message?.includes("fetch"))) {
            fallbackAttempted = true;
            console.warn("Switching map to resilient fallback dark style due to remote style error:", e.error);
            try {
              map.setStyle(FALLBACK_RASTER_DARK_STYLE);
              setMapTheme("dark");
            } catch {
              setWebGlSupported(false);
              setMapMode("svg");
            }
          }
        });

        const setupMapLayers = () => {
          if (isCancelled) return;
          setMapLoaded(true);
          addTrajectoriesToMap(map, pointsRef.current, mapThemeRef.current === "satellite");
          map.resize();
        };

        map.on("load", setupMapLayers);
        map.on("style.load", () => {
          if (!isCancelled) {
            addTrajectoriesToMap(map, pointsRef.current, mapThemeRef.current === "satellite");
          }
        });

        setTimeout(() => {
          if (!isCancelled && mapInstanceRef.current) {
            mapInstanceRef.current.resize();
          }
        }, 150);
      } catch (err) {
        console.warn("WebGL Map failed to initialize, falling back to SVG vector view:", err);
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
  }, [mapMode, transformRequest]);

  // Keep map canvas dimensions synchronized with container layout shifts
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

  // Toggle between Dark Basemap and Satellite 3D View
  const toggleMapTheme = () => {
    if (!mapInstanceRef.current || !MAPBOX_TOKEN) return;
    const nextTheme = mapTheme === "dark" ? "satellite" : "dark";
    setMapTheme(nextTheme);

    const targetStyle = nextTheme === "satellite" ? MAPBOX_SATELLITE_STYLE : MAPBOX_DARK_STYLE;
    if (targetStyle) {
      mapInstanceRef.current.setStyle(targetStyle);
    }

    if (nextTheme === "satellite") {
      mapInstanceRef.current.easeTo({ pitch: 45, duration: 800 });
    } else {
      mapInstanceRef.current.easeTo({ pitch: 25, duration: 800 });
    }
  };

  // Update Map markers when points or selection change
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

        const el = document.createElement("button");
        el.type = "button";
        el.className = `webgl-map-marker ${isSelected ? "selected" : ""} ${
          isVerified ? "verified" : "provisional"
        } ${mapTheme === "satellite" ? "satellite-theme" : ""}`;
        const tooltipText = `${rep.city} · ${eventList.length > 1 ? `${eventList.length} events` : rep.eventName}`;
        const ariaLabelText = `${isSelected ? "Selected location: " : ""}${rep.eventName}, ${rep.city} (${eventList.length} documented record${
          eventList.length > 1 ? "s" : ""
        })${rep.venueName ? `, Venue: ${rep.venueName}` : ""}`;

        el.setAttribute("aria-label", ariaLabelText);
        el.setAttribute("aria-pressed", isSelected ? "true" : "false");

        const dot = document.createElement("span");
        dot.className = "marker-dot";
        dot.setAttribute("aria-hidden", "true");
        el.appendChild(dot);

        if (eventList.length > 1) {
          const countBadge = document.createElement("span");
          countBadge.className = "marker-count";
          countBadge.textContent = String(eventList.length);
          countBadge.setAttribute("aria-hidden", "true");
          el.appendChild(countBadge);
        }

        const tooltip = document.createElement("span");
        tooltip.className = "marker-tooltip";
        tooltip.textContent = tooltipText;
        tooltip.setAttribute("aria-hidden", "true");
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
  }, [points, selected, mapLoaded, mapMode, mapTheme, onSelect]);

  // Smooth fly-to camera movement on selection change
  useEffect(() => {
    if (mapMode !== "webgl" || !mapInstanceRef.current || !selectedEvent) return;
    if (selectedEvent.longitude == null || selectedEvent.latitude == null) return;
    mapInstanceRef.current.flyTo({
      center: [selectedEvent.longitude, selectedEvent.latitude],
      zoom: 5.5,
      pitch: mapTheme === "satellite" ? 45 : 35,
      duration: 1100,
      essential: true,
    });
  }, [selectedEvent, mapMode, mapTheme]);

  return (
    <div
      className={`evidence-map-wrapper ${isExpanded ? "expanded-view" : ""} ${
        mapTheme === "satellite" ? "satellite-active" : ""
      }`}
      role="group"
      aria-label={`Geospatial map showing ${points.length} documented event locations and chronological trajectories`}
    >
      {/* Live Region for Screen Readers */}
      <div className="sr-only" role="status" aria-live="polite">
        {selected && selectedEvent && selectedEvent.id === selected
          ? `Selected event: ${selectedEvent.eventName}, ${selectedEvent.city}, ${selectedEvent.startDate}`
          : ""}
      </div>

      {/* Map Control Actions Toolbar */}
      <div className="map-toolbar" role="toolbar" aria-label="Map view controls">
        {/* Layer Theme Toggle: Satellite vs Dark Basemap */}
        {webGlSupported && mapMode === "webgl" && (
          <button
            type="button"
            className={`map-tool-btn theme-toggle ${mapTheme === "satellite" ? "active" : ""}`}
            onClick={MAPBOX_TOKEN ? toggleMapTheme : undefined}
            disabled={!MAPBOX_TOKEN}
            aria-pressed={mapTheme === "satellite"}
            title={
              !MAPBOX_TOKEN
                ? "Satellite view requires Mapbox token"
                : mapTheme === "satellite"
                ? "Switch to Dark Forensic Basemap"
                : "Switch to Mapbox Satellite 3D View"
            }
            aria-label={
              !MAPBOX_TOKEN
                ? "Satellite view requires Mapbox token"
                : mapTheme === "satellite"
                ? "Switch to Dark Forensic Basemap"
                : "Switch to Mapbox Satellite 3D View"
            }
          >
            {mapTheme === "satellite" ? <Layers size={13} /> : <Globe size={13} />}
            <span>{mapTheme === "satellite" ? "Dark Map" : "Satellite"}</span>
          </button>
        )}

        {/* Fallback Schematic SVG toggle */}
        {webGlSupported && (
          <button
            type="button"
            className={`map-tool-btn ${mapMode === "svg" ? "active" : ""}`}
            onClick={() => setMapMode(mapMode === "webgl" ? "svg" : "webgl")}
            aria-pressed={mapMode === "svg"}
            title={mapMode === "webgl" ? "Switch to Schematic Outline" : "Switch to Interactive Mapbox View"}
            aria-label={mapMode === "webgl" ? "Switch to Schematic Outline" : "Switch to Interactive Mapbox View"}
          >
            <MapPin size={13} />
            <span>{mapMode === "svg" ? "Live Map" : "Schematic"}</span>
          </button>
        )}

        {/* Enlarge / Collapse */}
        <button
          type="button"
          className="map-tool-btn icon-only"
          onClick={() => {
            setIsExpanded((prev) => !prev);
            setTimeout(() => mapInstanceRef.current?.resize(), 100);
          }}
          aria-pressed={isExpanded}
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
              title="Zoom In"
            >
              <ZoomIn size={13} />
            </button>
            <button
              type="button"
              className="map-tool-btn icon-only"
              onClick={() => mapInstanceRef.current?.zoomOut()}
              aria-label="Zoom out"
              title="Zoom Out"
            >
              <ZoomOut size={13} />
            </button>
            <button
              type="button"
              className="map-tool-btn icon-only"
              onClick={() => {
                if (selectedEvent && selectedEvent.longitude != null && selectedEvent.latitude != null) {
                  mapInstanceRef.current?.flyTo({
                    center: [selectedEvent.longitude, selectedEvent.latitude],
                    zoom: 4.2,
                    pitch: mapTheme === "satellite" ? 45 : 0,
                    bearing: 0,
                  });
                }
              }}
              aria-label="Reset orientation to North"
              title="Reset North Orientation"
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
                aria-pressed={isSelected}
                aria-label={`${cluster.event.startDate}, ${cluster.event.eventName}, ${cluster.event.city}`}
              >
                <title>{`${cluster.event.startDate}, ${cluster.event.eventName}, ${cluster.event.city}`}</title>
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
    </div>
  );
}
