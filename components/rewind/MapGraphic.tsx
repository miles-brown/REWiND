"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Compass, Globe, Layers, Map as MapIcon, MapPin, Maximize2, Minimize2, ZoomIn, ZoomOut } from "lucide-react";
import type { GeoJSONSource, Map as MapLibreMap, Marker as MapLibreMarker, StyleSpecification } from "maplibre-gl";
import type { EventRecord, TrajectoryPoint } from "@/lib/rewind";
import { resolveJourneyTransport } from "@/lib/rewind/transport";
import { resolveFlightCorridorTrajectory, resolveRouteTrajectory } from "@/lib/rewind/travel";
import { isAirTransport, fetchTransitRoute } from "@/lib/rewind/routing";

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
const CARTO_API_KEY =
  process.env.NEXT_PUBLIC_CARTO_API_KEY ||
  process.env.NEXT_PUBLIC_CARTO_BASEMAPS_API_KEY ||
  "";

// Module-level cache for known-missing vehicle asset URLs to avoid duplicate onerror triggers
const failedVehicleAssets = new Set<string>();

// 1. Fallback raster tile style specification for Geopolitical Voyager (natural blue oceans & clear labels)
const FALLBACK_RASTER_VOYAGER_STYLE: StyleSpecification = {
  version: 8,
  sources: {
    "carto-voyager-raster": {
      type: "raster",
      tiles: [
        CARTO_API_KEY
          ? `https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png?key=${CARTO_API_KEY}`
          : "https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png",
        CARTO_API_KEY
          ? `https://b.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png?key=${CARTO_API_KEY}`
          : "https://b.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png",
        CARTO_API_KEY
          ? `https://c.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png?key=${CARTO_API_KEY}`
          : "https://c.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png",
        CARTO_API_KEY
          ? `https://d.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png?key=${CARTO_API_KEY}`
          : "https://d.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png",
      ],
      tileSize: 256,
      attribution: "© OpenStreetMap contributors, © CARTO",
    },
  },
  layers: [
    {
      id: "carto-voyager-base",
      type: "raster",
      source: "carto-voyager-raster",
      minzoom: 0,
      maxzoom: 20,
    },
  ],
};

// 2. Fallback raster tile style specification for Dark Matter basemap (obsidian dark)
const FALLBACK_RASTER_DARK_STYLE: StyleSpecification = {
  version: 8,
  sources: {
    "carto-dark-raster": {
      type: "raster",
      tiles: [
        CARTO_API_KEY
          ? `https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png?key=${CARTO_API_KEY}`
          : "https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png",
        CARTO_API_KEY
          ? `https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png?key=${CARTO_API_KEY}`
          : "https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png",
        CARTO_API_KEY
          ? `https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png?key=${CARTO_API_KEY}`
          : "https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png",
        CARTO_API_KEY
          ? `https://d.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png?key=${CARTO_API_KEY}`
          : "https://d.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png",
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

// 3. Fallback high-resolution Satellite Imagery style specification
const FALLBACK_RASTER_SATELLITE_STYLE: StyleSpecification = {
  version: 8,
  sources: {
    "satellite-raster": {
      type: "raster",
      tiles: [
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      ],
      tileSize: 256,
      attribution: "© Esri, Maxar, Earthstar Geographics, USDA, USGS, AeroGRID, IGN, and the GIS User Community",
      maxzoom: 19,
    },
  },
  layers: [
    {
      id: "satellite-base",
      type: "raster",
      source: "satellite-raster",
      minzoom: 0,
      maxzoom: 20,
    },
  ],
};

// Primary Geopolitical Voyager Style (vector or fallback raster)
const CARTO_VOYAGER_STYLE =
  process.env.NEXT_PUBLIC_MAPBOX_VOYAGER_STYLE ||
  process.env.NEXT_PUBLIC_MAPBOX_STREETS_STYLE ||
  (MAPBOX_TOKEN
    ? `https://api.mapbox.com/styles/v1/mapbox/streets-v12?access_token=${MAPBOX_TOKEN}`
    : CARTO_API_KEY
      ? `https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json?key=${CARTO_API_KEY}`
      : "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json");

// Primary Dark Matter Style (vector or fallback raster)
const MAPBOX_DARK_STYLE =
  process.env.NEXT_PUBLIC_MAPBOX_DARK_STYLE ||
  (MAPBOX_TOKEN
    ? `https://api.mapbox.com/styles/v1/mapbox/dark-v11?access_token=${MAPBOX_TOKEN}`
    : CARTO_API_KEY
      ? `https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json?key=${CARTO_API_KEY}`
      : "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json");

// Primary Satellite Style (Mapbox or high-res Esri satellite raster)
const MAPBOX_SATELLITE_STYLE =
  process.env.NEXT_PUBLIC_MAPBOX_SATELLITE_STYLE ||
  (MAPBOX_TOKEN
    ? `https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v12?access_token=${MAPBOX_TOKEN}`
    : "satellite-raster");

function getVehicleAssetPath(iconName: string, mode: string): string {
  const norm = (iconName || mode || "").toLowerCase();
  if (
    norm === "plane" ||
    norm === "jet" ||
    norm === "flight" ||
    norm === "airplane" ||
    norm === "air-force-one" ||
    norm === "private-jet"
  ) {
    return "/assets/vehicles/airplane.svg";
  }
  if (norm === "helicopter") {
    return "/assets/vehicles/helicopter.svg";
  }
  if (norm === "ship" || norm === "boat") {
    return "/assets/vehicles/boat.svg";
  }
  if (norm === "train" || norm === "rail") {
    return "/assets/vehicles/train.svg";
  }
  if (norm === "bus") {
    return "/assets/vehicles/bus.svg";
  }
  if (norm === "walking") {
    return "/assets/vehicles/walking.svg";
  }
  if (norm.includes("motorcade")) {
    return "/assets/vehicles/motorcade.svg";
  }
  if (norm.includes("convoy")) {
    return "/assets/vehicles/police-convoy.svg";
  }
  return "/assets/vehicles/car.svg";
}

/**
 * Returns distinct cinematic camera parameters (pitch, bearing, duration)
 * tailored for each specific basemap theme and transit modality.
 */
function getThemeCameraSettings(
  theme: "geopolitical" | "dark" | "satellite",
  isAir: boolean,
  bearing: number = 0
): { pitch: number; bearing: number; duration: number } {
  if (theme === "satellite") {
    // Cinematic 3D chase camera angle showcasing earth horizon, photorealistic terrain, and mountains
    return {
      pitch: isAir ? 58 : 50,
      bearing: isAir ? (bearing ? (bearing + 18) % 360 : 25) : 15,
      duration: 1200,
    };
  }
  if (theme === "dark") {
    // Isometric surveillance perspective highlighting glowing neon vectors against pitch-black terrain
    return {
      pitch: isAir ? 52 : 44,
      bearing: 18,
      duration: 1000,
    };
  }
  // Geopolitical: Strategic North-up perspective for crisp border, territorial, and label legibility
  return {
    pitch: isAir ? 46 : 36,
    bearing: 0,
    duration: 1000,
  };
}

function addTrajectoriesToMap(
  map: MapLibreMap,
  points: EventRecord[],
  theme: "geopolitical" | "satellite" | "dark"
) {
  const lineCoordinates =
    points.length >= 2
      ? points
          .filter(
            (p): p is typeof p & { longitude: number; latitude: number } =>
              p.longitude != null && p.latitude != null
          )
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
  }

  const trajectoryColor =
    theme === "satellite"
      ? "#38bdf8"
      : theme === "geopolitical"
      ? "#2563eb"
      : "#fbbf24";

  if (map.getSource("trajectories") && !map.getLayer("trajectory-line")) {
    map.addLayer({
      id: "trajectory-line",
      type: "line",
      source: "trajectories",
      layout: {
        "line-join": "round",
        "line-cap": "round",
      },
      paint: {
        "line-color": trajectoryColor,
        "line-width": 2.5,
        "line-opacity": 0.95,
        "line-dasharray": [2, 1],
      },
    });
  } else if (map.getLayer("trajectory-line")) {
    map.setPaintProperty("trajectory-line", "line-color", trajectoryColor);
  }
}

function updateActiveLegRoute(
  map: MapLibreMap,
  curvePoints: Array<{ lng: number; lat: number }>,
  mode: string,
  progressIndex?: number
) {
  if (!map.isStyleLoaded()) return;
  const fullLineCoords = curvePoints.map((p) => [p.lng, p.lat]);
  const isAir = isAirTransport(mode);

  // Progressive coordinates up to current animation point
  const activeCoords =
    typeof progressIndex === "number" && progressIndex >= 0 && !isAir
      ? fullLineCoords.slice(0, Math.max(progressIndex + 1, 2))
      : fullLineCoords;

  let color = "#38bdf8"; // cyan for air / flight
  if (mode === "car" || mode === "bus" || mode === "motorcade" || mode === "police-convoy") {
    color = "#f59e0b"; // gold/amber for road/convoy
  } else if (mode === "boat" || mode === "ship") {
    color = "#0284c7"; // deep ocean blue for maritime
  } else if (mode === "train") {
    color = "#c084fc"; // purple for rail
  } else if (mode === "helicopter") {
    color = "#34d399"; // emerald for helicopter
  }

  // 1. Planned background network guide layer
  const plannedSource = map.getSource("active-leg-planned") as GeoJSONSource | undefined;
  if (plannedSource && "setData" in plannedSource) {
    plannedSource.setData({
      type: "Feature",
      properties: {},
      geometry: { type: "LineString", coordinates: fullLineCoords },
    });
  } else if (!plannedSource && fullLineCoords.length >= 2) {
    map.addSource("active-leg-planned", {
      type: "geojson",
      data: {
        type: "Feature",
        properties: {},
        geometry: { type: "LineString", coordinates: fullLineCoords },
      },
    });
  }

  if (map.getSource("active-leg-planned") && !map.getLayer("active-leg-planned-line")) {
    map.addLayer({
      id: "active-leg-planned-line",
      type: "line",
      source: "active-leg-planned",
      layout: { "line-join": "round", "line-cap": "round" },
      paint: {
        "line-color": color,
        "line-width": isAir ? 2.5 : 3.0,
        "line-opacity": isAir ? 0.35 : 0.25,
        "line-dasharray": isAir ? [2, 2] : [1, 0],
      },
    });
  } else if (map.getLayer("active-leg-planned-line")) {
    map.setPaintProperty("active-leg-planned-line", "line-color", color);
    map.setPaintProperty("active-leg-planned-line", "line-opacity", isAir ? 0.35 : 0.25);
  }

  // 2. Active solid drawn path layer
  const existingSource = map.getSource("active-leg-route") as GeoJSONSource | undefined;

  if (existingSource && "setData" in existingSource) {
    existingSource.setData({
      type: "Feature",
      properties: {},
      geometry: {
        type: "LineString",
        coordinates: activeCoords,
      },
    });
  } else if (!existingSource && activeCoords.length >= 2) {
    map.addSource("active-leg-route", {
      type: "geojson",
      data: {
        type: "Feature",
        properties: {},
        geometry: {
          type: "LineString",
          coordinates: activeCoords,
        },
      },
    });
  }

  if (map.getSource("active-leg-route") && !map.getLayer("active-leg-line")) {
    map.addLayer({
      id: "active-leg-line",
      type: "line",
      source: "active-leg-route",
      layout: {
        "line-join": "round",
        "line-cap": "round",
      },
      paint: {
        "line-color": color,
        "line-width": isAir ? 4.0 : 4.5,
        "line-opacity": 0.95,
      },
    });
  } else if (map.getLayer("active-leg-line")) {
    map.setPaintProperty("active-leg-line", "line-color", color);
    map.setPaintProperty("active-leg-line", "line-width", isAir ? 4.0 : 4.5);
  }
}

export function MapGraphic({
  events,
  allEvents,
  currentIndex,
  selected,
  onSelect,
}: {
  events: EventRecord[];
  allEvents?: EventRecord[];
  currentIndex?: number;
  selected?: string;
  onSelect?: (id: string) => void;
}) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<MapLibreMap | null>(null);
  const markersRef = useRef<MapLibreMarker[]>([]);
  const animFrameRef = useRef<number | null>(null);
  const activeLegRouteRef = useRef<{ curvePoints: Array<{ lng: number; lat: number }>; mode: string } | null>(null);
  const [webGlSupported, setWebGlSupported] = useState<boolean>(false);
  const [mapMode, setMapMode] = useState<"webgl" | "svg">("svg");
  // Default to geopolitical theme for natural blue oceans and crisp political features
  const [mapTheme, setMapTheme] = useState<"geopolitical" | "dark" | "satellite">("geopolitical");
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

  // All valid points across the subject's entire documented life
  const points = useMemo(
    () => (allEvents && allEvents.length > 0 ? allEvents : events).filter((e) => e.latitude != null && e.longitude != null),
    [allEvents, events]
  );

  // Chronological points reached up to the active timeline index
  const chronologicalPoints = useMemo(
    () => events.filter((e) => e.latitude != null && e.longitude != null),
    [events]
  );

  const coords = useMemo(
    () => points.map((e) => ({ ...project(e.latitude!, e.longitude!), e })),
    [points]
  );

  const selectedEvent = useMemo(() => {
    if (selected) {
      const found = points.find((p) => p.id === selected);
      if (found) return found;
    }
    return chronologicalPoints[chronologicalPoints.length - 1] || points[points.length - 1] || null;
  }, [points, chronologicalPoints, selected]);

  const selectedIndex = useMemo(() => {
    if (!chronologicalPoints.length) return -1;
    if (selected) {
      const idx = chronologicalPoints.findIndex((p) => p.id === selected || p.slug === selected);
      if (idx !== -1) return idx;
    }
    if (typeof currentIndex === "number" && currentIndex >= 0) {
      const target = (allEvents && allEvents[currentIndex]) || events[currentIndex];
      if (target) {
        const idx = chronologicalPoints.findIndex((p) => p.id === target.id || p.slug === target.slug);
        if (idx !== -1) return idx;
      }
      return Math.min(currentIndex, chronologicalPoints.length - 1);
    }
    return chronologicalPoints.length - 1;
  }, [allEvents, events, chronologicalPoints, selected, currentIndex]);

  const prevEvent = selectedIndex > 0 ? chronologicalPoints[selectedIndex - 1] : null;
  const currEvent = selectedIndex >= 0 ? chronologicalPoints[selectedIndex] : null;

  const activeJourney = useMemo(
    () => resolveJourneyTransport(prevEvent, currEvent),
    [prevEvent, currEvent]
  );

  const pointsRef = useRef(points);
  const mapThemeRef = useRef(mapTheme);
  const selectedEventRef = useRef(selectedEvent);
  const activeJourneyRef = useRef(activeJourney);

  useEffect(() => {
    pointsRef.current = points;
    mapThemeRef.current = mapTheme;
    selectedEventRef.current = selectedEvent;
    activeJourneyRef.current = activeJourney;
  }, [points, mapTheme, selectedEvent, activeJourney]);

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

  // Active Journey SVG arc path
  const activeSvgArc = useMemo(() => {
    if (!activeJourney.isJourney || !prevEvent || !currEvent || prevEvent.latitude == null || prevEvent.longitude == null || currEvent.latitude == null || currEvent.longitude == null) {
      return "";
    }
    const p1 = project(prevEvent.latitude, prevEvent.longitude);
    const p2 = project(currEvent.latitude, currEvent.longitude);
    const mx = (p1.x + p2.x) / 2;
    const my = Math.min(p1.y, p2.y) - 8;
    return `M ${p1.x} ${p1.y} Q ${mx} ${my} ${p2.x} ${p2.y}`;
  }, [activeJourney.isJourney, prevEvent, currEvent]);

  // Transform Request to attach Mapbox access token or CARTO key to resource requests
  const transformRequest = useCallback((url: string) => {
    if (MAPBOX_TOKEN && (url.startsWith("mapbox://") || url.includes("mapbox.com"))) {
      if (!url.includes("access_token=")) {
        const separator = url.includes("?") ? "&" : "?";
        return { url: `${url}${separator}access_token=${MAPBOX_TOKEN}` };
      }
    }
    if (CARTO_API_KEY && (url.includes("cartocdn.com") || url.includes("carto.com"))) {
      if (!url.includes("key=") && !url.includes("api_key=")) {
        const separator = url.includes("?") ? "&" : "?";
        return { url: `${url}${separator}key=${CARTO_API_KEY}` };
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
            : pointsRef.current.length > 0 &&
              pointsRef.current[pointsRef.current.length - 1].longitude != null &&
              pointsRef.current[pointsRef.current.length - 1].latitude != null
            ? [
                pointsRef.current[pointsRef.current.length - 1].longitude!,
                pointsRef.current[pointsRef.current.length - 1].latitude!,
              ]
            : [35.2137, 31.7683]; // Default Levant coordinates

        const initialStyle =
          mapThemeRef.current === "satellite"
            ? (MAPBOX_TOKEN && !MAPBOX_SATELLITE_STYLE.includes("satellite-raster")
                ? MAPBOX_SATELLITE_STYLE
                : FALLBACK_RASTER_SATELLITE_STYLE)
            : mapThemeRef.current === "dark"
            ? (MAPBOX_TOKEN ? MAPBOX_DARK_STYLE : FALLBACK_RASTER_DARK_STYLE)
            : (MAPBOX_TOKEN ? CARTO_VOYAGER_STYLE : FALLBACK_RASTER_VOYAGER_STYLE);

        const isAir = isAirTransport(activeJourneyRef.current.mode);
        const cam = getThemeCameraSettings(mapThemeRef.current, isAir, activeJourneyRef.current.bearing);

        const map = new Map({
          container: mapContainerRef.current,
          style: initialStyle,
          center: initialCenter,
          zoom: 4.2,
          pitch: cam.pitch,
          bearing: cam.bearing,
          attributionControl: { compact: true },
          transformRequest,
        });

        localMap = map;
        mapInstanceRef.current = map;

        map.on("error", (e) => {
          if (
            !fallbackAttempted &&
            (e.error?.message?.includes("style") || e.error?.message?.includes("fetch"))
          ) {
            fallbackAttempted = true;
            console.warn(
              `Switching map to resilient fallback raster style for theme '${mapThemeRef.current}' due to style loading notice:`,
              e.error
            );
            try {
              if (mapThemeRef.current === "dark") {
                map.setStyle(FALLBACK_RASTER_DARK_STYLE);
              } else if (mapThemeRef.current === "satellite") {
                map.setStyle(FALLBACK_RASTER_SATELLITE_STYLE);
              } else {
                map.setStyle(FALLBACK_RASTER_VOYAGER_STYLE);
              }
            } catch {
              setWebGlSupported(false);
              setMapMode("svg");
            }
          }
        });

        const setupMapLayers = () => {
          if (isCancelled) return;
          setMapLoaded(true);
          addTrajectoriesToMap(map, pointsRef.current, mapThemeRef.current);
          if (activeLegRouteRef.current) {
            updateActiveLegRoute(map, activeLegRouteRef.current.curvePoints, activeLegRouteRef.current.mode);
          }
          map.resize();
        };

        map.on("load", setupMapLayers);
        map.on("style.load", () => {
          if (!isCancelled) {
            addTrajectoriesToMap(map, pointsRef.current, mapThemeRef.current);
            if (activeLegRouteRef.current) {
              updateActiveLegRoute(map, activeLegRouteRef.current.curvePoints, activeLegRouteRef.current.mode);
            }
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
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
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

  // Switch map themes with distinct cinematic camera angles & positions
  const handleThemeChange = (nextTheme: "geopolitical" | "dark" | "satellite") => {
    if (!mapInstanceRef.current) return;
    setMapTheme(nextTheme);

    const targetStyle =
      nextTheme === "satellite"
        ? (MAPBOX_TOKEN && !MAPBOX_SATELLITE_STYLE.includes("satellite-raster")
            ? MAPBOX_SATELLITE_STYLE
            : FALLBACK_RASTER_SATELLITE_STYLE)
        : nextTheme === "dark"
        ? (MAPBOX_TOKEN ? MAPBOX_DARK_STYLE : FALLBACK_RASTER_DARK_STYLE)
        : (MAPBOX_TOKEN ? CARTO_VOYAGER_STYLE : FALLBACK_RASTER_VOYAGER_STYLE);

    mapInstanceRef.current.setStyle(targetStyle);

    // Apply distinct camera perspective tailored for each theme
    const isAir = isAirTransport(activeJourney.mode);
    const cam = getThemeCameraSettings(nextTheme, isAir, activeJourney.bearing);
    mapInstanceRef.current.easeTo({
      pitch: cam.pitch,
      bearing: cam.bearing,
      duration: cam.duration,
    });
  };

  // Update Map markers and run dynamic transit animation based on transport mode
  useEffect(() => {
    if (mapMode !== "webgl" || !mapInstanceRef.current || !mapLoaded) return;

    let isCancelled = false;
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }

    const map = mapInstanceRef.current;

    // Remove existing markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    import("maplibre-gl").then(async ({ Marker }) => {
      if (isCancelled) return;

      // Group points by location proximity for clean clustering
      const grouped = new Map<string, typeof points>();
      points.forEach((p) => {
        const key = `${p.latitude?.toFixed(2)}_${p.longitude?.toFixed(2)}`;
        const list = grouped.get(key) || [];
        list.push(p);
        grouped.set(key, list);
      });

      const visitedIdSet = new Set(chronologicalPoints.map((cp) => cp.id));

      grouped.forEach((eventList) => {
        const rep = eventList.find((e) => e.id === selected) || eventList[eventList.length - 1];
        if (rep.latitude == null || rep.longitude == null) return;
        const { longitude, latitude } = rep;

        const isSelected = eventList.some((e) => e.id === selected);
        const isVisited = eventList.some((e) => visitedIdSet.has(e.id));
        const isVerified = eventList.every((e) => e.verificationStatus === "verified");

        const el = document.createElement("button");
        el.type = "button";
        el.className = `webgl-map-marker forensic-pin ${isSelected ? "selected active-focus" : isVisited ? "visited" : "future-location"} ${
          isVerified ? "verified" : "provisional"
        } ${mapTheme === "satellite" ? "satellite-theme" : mapTheme === "geopolitical" ? "geopolitical-theme" : ""}`;
        const tooltipText = `${rep.city} · ${
          eventList.length > 1 ? `${eventList.length} events` : rep.eventName
        }`;
        const ariaLabelText = `${isSelected ? "Selected location: " : ""}${rep.eventName}, ${
          rep.city
        } (${eventList.length} documented record${eventList.length > 1 ? "s" : ""})${
          rep.venueName ? `, Venue: ${rep.venueName}` : ""
        }`;

        el.setAttribute("aria-label", ariaLabelText);
        el.setAttribute("aria-pressed", isSelected ? "true" : "false");

        const pinWrap = document.createElement("div");
        pinWrap.className = "pin-visual-wrapper";

        // Forensic Pin SVG teardrop with center dot
        const pinSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        pinSvg.setAttribute("class", "forensic-pin-svg");
        pinSvg.setAttribute("viewBox", "0 0 24 32");
        pinSvg.setAttribute("width", isSelected ? "26" : "22");
        pinSvg.setAttribute("height", isSelected ? "34" : "30");
        pinSvg.setAttribute("fill", "none");
        pinSvg.setAttribute("aria-hidden", "true");

        const pinPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
        pinPath.setAttribute(
          "d",
          "M12 0C5.373 0 0 5.373 0 12c0 8.5 10.5 18.5 11.4 19.4.3.3.9.3 1.2 0C13.5 30.5 24 20.5 24 12c0-6.627-5.373-12-12-12z"
        );
        pinPath.setAttribute("class", "pin-drop-body");

        const pinCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        pinCircle.setAttribute("cx", "12");
        pinCircle.setAttribute("cy", "11.5");
        pinCircle.setAttribute("r", "4");
        pinCircle.setAttribute("class", "pin-center-dot");

        pinSvg.appendChild(pinPath);
        pinSvg.appendChild(pinCircle);
        pinWrap.appendChild(pinSvg);

        if (isSelected) {
          const pulseRing = document.createElement("span");
          pulseRing.className = "pin-pulse-wave";
          pulseRing.setAttribute("aria-hidden", "true");
          pinWrap.appendChild(pulseRing);
        }

        const dot = document.createElement("span");
        dot.className = "marker-dot";
        dot.setAttribute("aria-hidden", "true");
        pinWrap.appendChild(dot);

        if (eventList.length > 1) {
          const countBadge = document.createElement("span");
          countBadge.className = "marker-count";
          countBadge.textContent = String(eventList.length);
          countBadge.setAttribute("aria-hidden", "true");
          pinWrap.appendChild(countBadge);
        }

        el.appendChild(pinWrap);

        const tooltip = document.createElement("span");
        tooltip.className = "marker-tooltip";
        tooltip.textContent = tooltipText;
        tooltip.setAttribute("aria-hidden", "true");
        el.appendChild(tooltip);

        const cityLabel = document.createElement("span");
        cityLabel.className = "marker-city-pill";
        cityLabel.textContent = rep.city;
        cityLabel.setAttribute("aria-hidden", "true");
        el.appendChild(cityLabel);

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

        const marker = new Marker({ element: el, anchor: "bottom" })
          .setLngLat([longitude, latitude])
          .addTo(map);

        markersRef.current.push(marker);
      });

      // Dynamic Transit Animation: Air/Helicopter 3D Arc vs Ground Progressively Drawn Network Path
      if (
        activeJourney.isJourney &&
        prevEvent &&
        currEvent &&
        prevEvent.longitude != null &&
        prevEvent.latitude != null &&
        currEvent.longitude != null &&
        currEvent.latitude != null
      ) {
        const isAir = isAirTransport(activeJourney.mode);
        let curvePoints: TrajectoryPoint[] = [];

        if (isAir) {
          // Mode 1: Air & Helicopter Transit
          // Resolves documented real flight coordinates if available; otherwise auto-defaults to standard Great-Circle 3D airway corridor
          curvePoints = resolveFlightCorridorTrajectory(
            currEvent,
            prevEvent,
            activeJourney.mode,
            60
          );
        } else {
          // Mode 2: Car, Rail, Boat, & Ground Transit
          // Fetch actual geographic LineString path from routing service (Mapbox Directions / OSRM)
          try {
            curvePoints = await fetchTransitRoute(
              [prevEvent.longitude, prevEvent.latitude],
              [currEvent.longitude, currEvent.latitude],
              activeJourney.mode,
              { numSamplePoints: 60 }
            );
          } catch {
            curvePoints = resolveRouteTrajectory(currEvent, prevEvent, 60);
          }
        }

        if (isCancelled || !curvePoints.length) return;

        activeLegRouteRef.current = { curvePoints, mode: activeJourney.iconName };

        // Initialize active leg route layer
        updateActiveLegRoute(map, curvePoints, activeJourney.iconName, isAir ? undefined : 0);

        // Calculate theme-specific 3D camera angles and positions
        const minLng = Math.min(prevEvent.longitude, currEvent.longitude);
        const maxLng = Math.max(prevEvent.longitude, currEvent.longitude);
        const minLat = Math.min(prevEvent.latitude, currEvent.latitude);
        const maxLat = Math.max(prevEvent.latitude, currEvent.latitude);

        const themeCam = getThemeCameraSettings(mapTheme, isAir, activeJourney.bearing);

        try {
          map.fitBounds(
            [
              [minLng, minLat],
              [maxLng, maxLat],
            ],
            {
              padding: { top: 90, bottom: 90, left: 90, right: 90 },
              pitch: themeCam.pitch,
              bearing: themeCam.bearing,
              duration: themeCam.duration,
              maxZoom: 13,
              essential: true,
            }
          );
        } catch {
          // Ignore if map bounds calculation was interrupted
        }

        // Create Animated Vehicle Marker
        const vehicleEl = document.createElement("div");
        vehicleEl.className = `moving-vehicle-marker mode-${activeJourney.iconName} mode-${activeJourney.mode} animated-travel ${
          isAir ? "vehicle-air-3d" : "vehicle-ground"
        }`;
        vehicleEl.setAttribute("role", "img");
        vehicleEl.setAttribute("aria-label", activeJourney.description);
        vehicleEl.title = activeJourney.description;

        // Dynamic 3D altitude shadow element for air transit
        if (isAir) {
          const shadowEl = document.createElement("div");
          shadowEl.className = "vehicle-altitude-shadow";
          shadowEl.setAttribute("aria-hidden", "true");
          vehicleEl.appendChild(shadowEl);
        }

        const iconWrap = document.createElement("div");
        iconWrap.className = "vehicle-icon-bubble";
        iconWrap.style.transform = `rotate(${curvePoints[0]?.bearing ?? activeJourney.bearing}deg)`;
        iconWrap.setAttribute("aria-hidden", "true");

        // Custom SVG / image asset renderer with emoji fallback and failure caching
        const iconSrc = getVehicleAssetPath(activeJourney.iconName, activeJourney.mode);
        if (failedVehicleAssets.has(iconSrc)) {
          const symbol = document.createElement("span");
          symbol.className = "vehicle-symbol";
          symbol.textContent = activeJourney.emoji;
          iconWrap.appendChild(symbol);
        } else {
          const iconImg = document.createElement("img");
          iconImg.className = "vehicle-icon-asset";
          iconImg.src = iconSrc;
          iconImg.alt = activeJourney.label;
          iconImg.onerror = () => {
            iconImg.onerror = null;
            failedVehicleAssets.add(iconSrc);
            iconImg.remove();
            if (!iconWrap.querySelector(".vehicle-symbol")) {
              const symbol = document.createElement("span");
              symbol.className = "vehicle-symbol";
              symbol.textContent = activeJourney.emoji;
              iconWrap.appendChild(symbol);
            }
          };
          iconWrap.appendChild(iconImg);
        }
        vehicleEl.appendChild(iconWrap);

        const tag = document.createElement("div");
        tag.className = "vehicle-journey-tag";
        tag.setAttribute("aria-hidden", "true");

        const modeSpan = document.createElement("span");
        modeSpan.textContent = activeJourney.label;
        const distSmall = document.createElement("small");
        distSmall.textContent = `${activeJourney.formattedDistance}${
          activeJourney.formattedDuration ? ` · ${activeJourney.formattedDuration}` : ""
        }`;

        tag.appendChild(modeSpan);
        tag.appendChild(distSmall);
        vehicleEl.appendChild(tag);

        const initialPoint = curvePoints[0] || {
          lng: (prevEvent.longitude + currEvent.longitude) / 2,
          lat: (prevEvent.latitude + currEvent.latitude) / 2,
          bearing: activeJourney.bearing,
        };

        const vehicleMarker = new Marker({ element: vehicleEl, anchor: "center" })
          .setLngLat([initialPoint.lng, initialPoint.lat])
          .addTo(map);

        markersRef.current.push(vehicleMarker);

        // Check for user preference for reduced motion
        const prefersReducedMotion =
          typeof window !== "undefined" &&
          window.matchMedia &&
          window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        if (prefersReducedMotion) {
          const finalPt = curvePoints[curvePoints.length - 1];
          if (finalPt && vehicleMarker) {
            vehicleMarker.setLngLat([finalPt.lng, finalPt.lat]);
            iconWrap.style.transform = `rotate(${finalPt.bearing}deg)`;
            updateActiveLegRoute(map, curvePoints, activeJourney.iconName);
          }
        } else {
          // Dynamic Transit Animation Sequence
          let startTimestamp: number | null = null;
          const animDuration = 2600; // ms

          const animateLeg = (timestamp: number) => {
            if (isCancelled) return;
            if (!startTimestamp) startTimestamp = timestamp;
            const elapsed = timestamp - startTimestamp;
            const rawProgress = Math.min(elapsed / animDuration, 1.0);
            // Smooth easeInOutQuad easing
            const p =
              rawProgress < 0.5
                ? 2 * rawProgress * rawProgress
                : 1 - Math.pow(-2 * rawProgress + 2, 2) / 2;
            const ptIndex = Math.min(
              Math.floor(p * (curvePoints.length - 1)),
              curvePoints.length - 1
            );
            const currPt = curvePoints[ptIndex];

            if (currPt && vehicleMarker) {
              vehicleMarker.setLngLat([currPt.lng, currPt.lat]);
              iconWrap.style.transform = `rotate(${currPt.bearing}deg)`;

              if (isAir) {
                // 3D Arc elevation visual translation and scaling
                const maxAlt = activeJourney.mode === "helicopter" ? 1500 : 11500;
                const alt = currPt.altitudeMeters || 0;
                const elevFraction = alt / Math.max(maxAlt, 1);
                const elevationPx = Math.round(28 * elevFraction);
                const scale = currPt.scale || (1.0 + 0.3 * elevFraction);
                iconWrap.style.transform = `translateY(-${elevationPx}px) scale(${scale}) rotate(${currPt.bearing}deg)`;

                const shadowEl = vehicleEl.querySelector(".vehicle-altitude-shadow") as HTMLElement | null;
                if (shadowEl) {
                  const shadowScale = 1.0 + 0.5 * elevFraction;
                  const shadowOpacity = Math.max(0.2, 0.7 - 0.4 * elevFraction);
                  shadowEl.style.transform = `scale(${shadowScale})`;
                  shadowEl.style.opacity = String(shadowOpacity);
                }
              } else {
                // Progressive solid route line drawing along exact road/rail network
                updateActiveLegRoute(map, curvePoints, activeJourney.iconName, ptIndex);
              }

              // Smooth camera panning to follow transit along travel route
              if (rawProgress < 1.0 && activeJourney.distanceKm > 150) {
                map.easeTo({
                  center: [currPt.lng, currPt.lat],
                  pitch: themeCam.pitch,
                  bearing: themeCam.bearing,
                  duration: 80,
                  essential: false,
                });
              }
            }

            if (rawProgress < 1.0) {
              animFrameRef.current = requestAnimationFrame(animateLeg);
            } else {
              // Ensure complete solid line is finalized on arrival
              updateActiveLegRoute(map, curvePoints, activeJourney.iconName);
            }
          };

          animFrameRef.current = requestAnimationFrame(animateLeg);
        }
      }

      // Update trajectory line coordinates for chronological route
      const source = map.getSource("trajectories") as GeoJSONSource | undefined;
      if (source && "setData" in source) {
        const lineCoords =
          chronologicalPoints.length >= 2
            ? chronologicalPoints
                .filter(
                  (p): p is typeof p & { longitude: number; latitude: number } =>
                    p.longitude != null && p.latitude != null
                )
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

    return () => {
      isCancelled = true;
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
    };
  }, [points, chronologicalPoints, selected, mapLoaded, mapMode, mapTheme, onSelect, activeJourney, prevEvent, currEvent]);

  // Smooth fly-to camera movement on selection change when not in active multi-city journey
  useEffect(() => {
    if (mapMode !== "webgl" || !mapInstanceRef.current || !selectedEvent) return;
    if (selectedEvent.longitude == null || selectedEvent.latitude == null) return;
    if (activeJourney.isJourney) return; // Managed by journey camera framing

    const isAir = isAirTransport(activeJourney.mode);
    const cam = getThemeCameraSettings(mapTheme, isAir, 0);

    mapInstanceRef.current.flyTo({
      center: [selectedEvent.longitude, selectedEvent.latitude],
      zoom: 5.5,
      pitch: cam.pitch,
      bearing: cam.bearing,
      duration: 1100,
      essential: true,
    });
  }, [selectedEvent, mapMode, mapTheme, activeJourney.isJourney, activeJourney.mode]);

  return (
    <div
      className={`evidence-map-wrapper ${isExpanded ? "expanded-view" : ""} ${
        mapTheme === "satellite"
          ? "satellite-active"
          : mapTheme === "geopolitical"
          ? "geopolitical-active"
          : "dark-active"
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

      {/* Map Control Actions Toolbar - Top Right */}
      <div className="map-toolbar" role="toolbar" aria-label="Map view controls">
        {/* Basemap Switcher: Geopolitical (Voyager / Blue Water) vs Dark Matter vs Satellite */}
        {webGlSupported && mapMode === "webgl" && (
          <div className="map-theme-group" role="group" aria-label="Basemap style selection">
            <button
              type="button"
              className={`map-tool-btn ${mapTheme === "geopolitical" ? "active" : ""}`}
              onClick={() => handleThemeChange("geopolitical")}
              aria-pressed={mapTheme === "geopolitical"}
              title="Geopolitical Map: Blue oceans, physical features & clear political borders"
              aria-label="Geopolitical map with blue oceans"
            >
              <MapIcon size={13} />
              <span>Geopolitical</span>
            </button>

            <button
              type="button"
              className={`map-tool-btn ${mapTheme === "dark" ? "active" : ""}`}
              onClick={() => handleThemeChange("dark")}
              aria-pressed={mapTheme === "dark"}
              title="Dark Forensic Basemap"
              aria-label="Dark forensic map"
            >
              <Layers size={13} />
              <span>Dark</span>
            </button>

            {Boolean(MAPBOX_SATELLITE_STYLE) && (
              <button
                type="button"
                className={`map-tool-btn ${mapTheme === "satellite" ? "active" : ""}`}
                onClick={() => handleThemeChange("satellite")}
                aria-pressed={mapTheme === "satellite"}
                disabled={!MAPBOX_SATELLITE_STYLE}
                title="Satellite Imagery"
                aria-label="Satellite layer"
              >
                <Globe size={13} />
                <span>Satellite</span>
              </button>
            )}
          </div>
        )}

        {/* Fallback Schematic SVG toggle */}
        {webGlSupported && (
          <button
            type="button"
            className={`map-tool-btn ${mapMode === "svg" ? "active" : ""}`}
            onClick={() => setMapMode(mapMode === "webgl" ? "svg" : "webgl")}
            aria-pressed={mapMode === "svg"}
            title={mapMode === "webgl" ? "Switch to Schematic Tactical Wireframe" : "Switch to Interactive Map View"}
            aria-label="Schematic vector map mode"
          >
            <MapPin size={13} />
            <span>{mapMode === "svg" ? "Live Map" : "Schematic"}</span>
          </button>
        )}
      </div>

      {/* Floating Vertical Navigation Controls - Bottom Right */}
      <div className="map-floating-controls" role="toolbar" aria-label="Map navigation controls">
        <button
          type="button"
          className="map-float-btn"
          onClick={() => {
            setIsExpanded((prev) => !prev);
            setTimeout(() => mapInstanceRef.current?.resize(), 100);
          }}
          aria-pressed={isExpanded}
          title={isExpanded ? "Collapse Map" : "Enlarge Map"}
          aria-label={isExpanded ? "Collapse map view" : "Enlarge map view"}
        >
          {isExpanded ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
        </button>

        {mapMode === "webgl" && (
          <>
            <button
              type="button"
              className="map-float-btn"
              onClick={() => mapInstanceRef.current?.zoomIn()}
              aria-label="Zoom in"
              title="Zoom In"
            >
              <ZoomIn size={15} />
            </button>
            <button
              type="button"
              className="map-float-btn"
              onClick={() => mapInstanceRef.current?.zoomOut()}
              aria-label="Zoom out"
              title="Zoom Out"
            >
              <ZoomOut size={15} />
            </button>
            <button
              type="button"
              className="map-float-btn"
              onClick={() => {
                if (!mapInstanceRef.current) return;
                const isAir = isAirTransport(activeJourney.mode);
                const cam = getThemeCameraSettings(mapTheme, isAir, 0);
                const flyOptions: {
                  pitch: number;
                  bearing: number;
                  center?: [number, number];
                  zoom?: number;
                } = {
                  pitch: cam.pitch,
                  bearing: cam.bearing,
                };
                if (
                  selectedEvent &&
                  selectedEvent.longitude != null &&
                  selectedEvent.latitude != null
                ) {
                  flyOptions.center = [selectedEvent.longitude, selectedEvent.latitude];
                  flyOptions.zoom = 4.2;
                }
                mapInstanceRef.current.flyTo(flyOptions);
              }}
              aria-label="Reset orientation to North"
              title="Reset North Orientation"
            >
              <Compass size={15} />
            </button>
          </>
        )}
      </div>

      {/* WebGL Interactive Map Container */}
      {mapMode === "webgl" ? (
        <div
          ref={mapContainerRef}
          className="webgl-map-container"
          role="region"
          aria-label="Interactive geospatial map surface"
        />
      ) : (
        /* Schematic SVG Tactical Situation Room Wireframe Map View */
        <div className="svg-map-fallback" role="region" aria-label="Schematic vector map fallback">
          <svg
            className="vector-map-canvas"
            viewBox="0 0 100 100"
            preserveAspectRatio="xMidYMid slice"
            aria-hidden="true"
          >
            {/* World Continent Tactical Landmass Outlines (Equirectangular Projection) */}
            <g className="continent-group">
              {/* North America */}
              <path
                className="continent-land"
                d="M 12 18 Q 18 12 30 14 Q 38 10 44 18 Q 42 28 35 34 Q 30 38 28 46 Q 24 48 20 44 Q 16 38 12 32 Z"
              />
              {/* South America */}
              <path
                className="continent-land"
                d="M 28 50 Q 38 48 42 58 Q 38 72 34 82 Q 30 84 28 76 Q 26 62 28 50 Z"
              />
              {/* Europe */}
              <path
                className="continent-land"
                d="M 46 22 Q 54 18 58 24 Q 56 32 50 36 Q 44 34 46 22 Z"
              />
              {/* Africa */}
              <path
                className="continent-land"
                d="M 46 38 Q 58 36 62 48 Q 60 64 54 72 Q 48 70 46 56 Q 44 46 46 38 Z"
              />
              {/* Asia */}
              <path
                className="continent-land"
                d="M 56 16 Q 74 12 88 20 Q 86 36 78 44 Q 68 46 62 38 Q 58 28 56 16 Z"
              />
              {/* Australia */}
              <path
                className="continent-land"
                d="M 80 66 Q 92 64 92 76 Q 86 82 78 78 Q 76 70 80 66 Z"
              />
              {/* Antarctica */}
              <path
                className="continent-land"
                d="M 6 92 Q 50 88 94 92 Q 80 97 20 97 Z"
              />
            </g>

            {/* Tactical Grid references */}
            <line x1="0" y1="20" x2="100" y2="20" className="grid-lat arctic" />
            <line x1="0" y1="35" x2="100" y2="35" className="grid-lat tropic-cancer" />
            <line x1="0" y1="50" x2="100" y2="50" className="grid-lat equator" />
            <line x1="0" y1="65" x2="100" y2="65" className="grid-lat tropic-capricorn" />
            <line x1="0" y1="80" x2="100" y2="80" className="grid-lat antarctic" />
            <line x1="25" y1="0" x2="25" y2="100" className="grid-lon" />
            <line x1="50" y1="0" x2="50" y2="100" className="grid-lon prime-meridian" />
            <line x1="75" y1="0" x2="75" y2="100" className="grid-lon" />

            {/* Geodesic Flight & Transit Arcs */}
            {arcs && <path d={arcs} className="svg-trajectory-arc" />}

            {/* Active Highlighted Journey Arc */}
            {activeSvgArc && (
              <path d={activeSvgArc} className="svg-active-journey-arc svg-active-route-pulse" />
            )}
          </svg>

          {/* SVG Cluster Pins */}
          {clusters.map((c) => {
            const isSelected = c.hasSelected;
            return (
              <button
                key={`${c.x}-${c.y}`}
                type="button"
                className={`forensic-svg-pin ${isSelected ? "selected" : ""} ${
                  c.allVerified ? "verified" : "provisional"
                }`}
                style={{ left: `${c.x}%`, top: `${c.y}%` }}
                onClick={() => onSelect?.(c.event.id)}
                aria-label={`${isSelected ? "Selected: " : ""}${c.event.city}, ${c.event.eventName} (${c.count} records)`}
                aria-pressed={isSelected}
              >
                <div className="svg-pin-wrapper">
                  <svg
                    className="svg-pin-graphic"
                    viewBox="0 0 24 32"
                    width={isSelected ? 22 : 16}
                    height={isSelected ? 28 : 22}
                    aria-hidden="true"
                  >
                    <path
                      d="M12 0C5.373 0 0 5.373 0 12c0 8.5 10.5 18.5 11.4 19.4.3.3.9.3 1.2 0C13.5 30.5 24 20.5 24 12c0-6.627-5.373-12-12-12z"
                      className="pin-body-shape"
                    />
                    <circle cx="12" cy="11.5" r="4" className="pin-dot-shape" />
                  </svg>
                  {isSelected && <span className="svg-pulse-wave" aria-hidden="true" />}
                </div>
                <span className="svg-pin-city" aria-hidden="true">
                  {c.event.city}
                </span>
              </button>
            );
          })}

          {/* Active SVG Moving Transport Vehicle */}
          {activeJourney.isJourney && prevEvent && currEvent && (
            <div
              className="svg-moving-vehicle"
              style={{
                left: `${(project(prevEvent.latitude!, prevEvent.longitude!).x + project(currEvent.latitude!, currEvent.longitude!).x) / 2}%`,
                top: `${(project(prevEvent.latitude!, prevEvent.longitude!).y + project(currEvent.latitude!, currEvent.longitude!).y) / 2}%`,
              }}
              role="img"
              aria-label={activeJourney.description}
            >
              <div className="svg-vehicle-icon-wrap" aria-hidden="true">
                <span>{activeJourney.emoji}</span>
              </div>
              <div className="svg-vehicle-badge" aria-hidden="true">
                {activeJourney.label}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
