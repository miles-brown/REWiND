"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Compass, Globe, Layers, Map as MapIcon, MapPin, Maximize2, Minimize2, ZoomIn, ZoomOut } from "lucide-react";
import type { GeoJSONSource, Map as MapLibreMap, Marker as MapLibreMarker, StyleSpecification } from "maplibre-gl";
import type { EventRecord } from "@/lib/rewind";
import { resolveJourneyTransport } from "@/lib/rewind/transport";
import { interpolateGreatCircle } from "@/lib/rewind/travel";

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

// Geopolitical Vector Style with natural blue oceans, political borders, relief, and readable city labels (CARTO Voyager / Mapbox Streets)
const CARTO_VOYAGER_STYLE =
  process.env.NEXT_PUBLIC_MAPBOX_VOYAGER_STYLE ||
  process.env.NEXT_PUBLIC_MAPBOX_STREETS_STYLE ||
  (MAPBOX_TOKEN
    ? `https://api.mapbox.com/styles/v1/mapbox/streets-v12?access_token=${MAPBOX_TOKEN}`
    : CARTO_API_KEY
      ? `https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json?key=${CARTO_API_KEY}`
      : "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json");

// Mapbox Vector Styles (when token is provided or environment override set)
const MAPBOX_DARK_STYLE =
  process.env.NEXT_PUBLIC_MAPBOX_DARK_STYLE ||
  (MAPBOX_TOKEN
    ? `https://api.mapbox.com/styles/v1/mapbox/dark-v11?access_token=${MAPBOX_TOKEN}`
    : CARTO_API_KEY
      ? `https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json?key=${CARTO_API_KEY}`
      : "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json");

const MAPBOX_SATELLITE_STYLE =
  process.env.NEXT_PUBLIC_MAPBOX_SATELLITE_STYLE ||
  (MAPBOX_TOKEN
    ? `https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v12?access_token=${MAPBOX_TOKEN}`
    : "");

// Fallback raster tile style specification for Geopolitical Voyager (natural blue oceans & clear labels)
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

// Fallback raster tile style specification if vector GL JSON fails or is offline
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
  const animFrameRef = useRef<number | null>(null);
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

  const points = useMemo(
    () => events.filter((e) => e.latitude != null && e.longitude != null),
    [events]
  );

  const coords = useMemo(
    () => points.map((e) => ({ ...project(e.latitude!, e.longitude!), e })),
    [points]
  );

  const selectedIndex = useMemo(() => {
    if (!points.length) return -1;
    if (!selected) return points.length - 1;
    return points.findIndex((p) => p.id === selected);
  }, [points, selected]);

  const selectedEvent = useMemo(
    () =>
      selectedIndex >= 0
        ? points[selectedIndex]
        : selected
        ? null
        : points[points.length - 1],
    [points, selectedIndex, selected]
  );

  const prevEvent = selectedIndex > 0 ? points[selectedIndex - 1] : null;
  const currEvent = selectedIndex >= 0 ? points[selectedIndex] : null;

  const activeJourney = useMemo(
    () => resolveJourneyTransport(prevEvent, currEvent),
    [prevEvent, currEvent]
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
          mapThemeRef.current === "satellite" && MAPBOX_SATELLITE_STYLE
            ? MAPBOX_SATELLITE_STYLE
            : mapThemeRef.current === "dark"
            ? MAPBOX_DARK_STYLE
            : CARTO_VOYAGER_STYLE;

        const map = new Map({
          container: mapContainerRef.current,
          style: initialStyle,
          center: initialCenter,
          zoom: 4.2,
          pitch: mapThemeRef.current === "satellite" ? 42 : 20,
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
              "Switching map to resilient fallback raster style due to remote style error:",
              e.error
            );
            try {
              if (mapThemeRef.current === "dark") {
                map.setStyle(FALLBACK_RASTER_DARK_STYLE);
              } else {
                map.setStyle(FALLBACK_RASTER_VOYAGER_STYLE);
                setMapTheme("geopolitical");
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
          map.resize();
        };

        map.on("load", setupMapLayers);
        map.on("style.load", () => {
          if (!isCancelled) {
            addTrajectoriesToMap(map, pointsRef.current, mapThemeRef.current);
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

  // Switch map themes with smooth camera adjustment
  const handleThemeChange = (nextTheme: "geopolitical" | "dark" | "satellite") => {
    if (!mapInstanceRef.current) return;
    setMapTheme(nextTheme);

    const targetStyle =
      nextTheme === "satellite" && MAPBOX_SATELLITE_STYLE
        ? MAPBOX_SATELLITE_STYLE
        : nextTheme === "dark"
        ? MAPBOX_DARK_STYLE
        : CARTO_VOYAGER_STYLE;

    if (targetStyle) {
      mapInstanceRef.current.setStyle(targetStyle);
    }

    if (nextTheme === "satellite") {
      mapInstanceRef.current.easeTo({ pitch: 45, duration: 800 });
    } else {
      mapInstanceRef.current.easeTo({ pitch: 20, duration: 800 });
    }
  };

  // Update Map markers and run smooth Great-Circle animated vehicle flight sequence
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

    import("maplibre-gl").then(({ Marker }) => {
      if (isCancelled) return;

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
        el.className = `webgl-map-marker forensic-pin ${isSelected ? "selected" : ""} ${
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

      // Add dynamic animated moving transport vehicle along Great-Circle route
      if (
        activeJourney.isJourney &&
        prevEvent &&
        currEvent &&
        prevEvent.longitude != null &&
        prevEvent.latitude != null &&
        currEvent.longitude != null &&
        currEvent.latitude != null
      ) {
        // Calculate smooth Great-Circle curve coordinates with heading bearings
        const curvePoints = interpolateGreatCircle(
          prevEvent.longitude,
          prevEvent.latitude,
          currEvent.longitude,
          currEvent.latitude,
          50
        );

        const vehicleEl = document.createElement("div");
        vehicleEl.className = `moving-vehicle-marker mode-${activeJourney.iconName} animated-travel`;
        vehicleEl.setAttribute("role", "img");
        vehicleEl.setAttribute("aria-label", activeJourney.description);
        vehicleEl.title = activeJourney.description;

        const iconWrap = document.createElement("div");
        iconWrap.className = "vehicle-icon-bubble";
        iconWrap.style.transform = `rotate(${curvePoints[0]?.bearing ?? activeJourney.bearing}deg)`;
        iconWrap.setAttribute("aria-hidden", "true");

        const symbol = document.createElement("span");
        symbol.className = "vehicle-symbol";
        symbol.textContent = activeJourney.emoji;
        iconWrap.appendChild(symbol);
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

        // Smooth Great-Circle animated trajectory sequence
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
          }

          if (rawProgress < 1.0) {
            animFrameRef.current = requestAnimationFrame(animateLeg);
          }
        };

        animFrameRef.current = requestAnimationFrame(animateLeg);
      }

      // Update trajectory line coordinates
      const source = map.getSource("trajectories") as GeoJSONSource | undefined;
      if (source && "setData" in source) {
        const lineCoords =
          points.length >= 2
            ? points
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
  }, [points, selected, mapLoaded, mapMode, mapTheme, onSelect, activeJourney, prevEvent, currEvent]);

  // Smooth fly-to camera movement on selection change
  useEffect(() => {
    if (mapMode !== "webgl" || !mapInstanceRef.current || !selectedEvent) return;
    if (selectedEvent.longitude == null || selectedEvent.latitude == null) return;
    mapInstanceRef.current.flyTo({
      center: [selectedEvent.longitude, selectedEvent.latitude],
      zoom: 5.5,
      pitch: mapTheme === "satellite" ? 45 : 25,
      duration: 1100,
      essential: true,
    });
  }, [selectedEvent, mapMode, mapTheme]);

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

      {/* Map Control Actions Toolbar */}
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
            title={mapMode === "webgl" ? "Switch to Schematic Outline" : "Switch to Interactive Map View"}
            aria-label="Schematic vector map mode"
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
                if (!mapInstanceRef.current) return;
                const flyOptions: {
                  pitch: number;
                  bearing: number;
                  center?: [number, number];
                  zoom?: number;
                } = {
                  pitch: mapTheme === "satellite" ? 45 : 20,
                  bearing: 0,
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
              <Compass size={13} />
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
        /* SVG Vector Schematic Map Mode with natural blue water bodies */
        <div className="evidence-map geopolitical-svg">
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

          {/* SVG Trajectory Moving Vehicle */}
          {activeJourney.isJourney &&
            prevEvent &&
            currEvent &&
            prevEvent.latitude != null &&
            prevEvent.longitude != null &&
            currEvent.latitude != null &&
            currEvent.longitude != null && (
              <div
                className="svg-moving-vehicle"
                style={{
                  left: `${
                    (project(prevEvent.latitude, prevEvent.longitude).x +
                      project(currEvent.latitude, currEvent.longitude).x) /
                    2
                  }%`,
                  top: `${
                    (project(prevEvent.latitude, prevEvent.longitude).y +
                      project(currEvent.latitude, currEvent.longitude).y) /
                    2
                  }%`,
                }}
                title={activeJourney.description}
                aria-hidden="true"
              >
                <div
                  className="svg-vehicle-icon-wrap"
                  style={{ transform: `rotate(${activeJourney.bearing}deg)` }}
                >
                  <span>{activeJourney.emoji}</span>
                </div>
                <span className="svg-vehicle-badge">
                  {activeJourney.label} · {activeJourney.formattedDistance}
                </span>
              </div>
            )}

          {clusters.map((cluster) => {
            const isSelected = cluster.hasSelected;
            return (
              <button
                type="button"
                key={cluster.event.id}
                onClick={() => onSelect?.(cluster.event.id)}
                style={{ left: `${cluster.x}%`, top: `${cluster.y}%` }}
                className={`forensic-svg-pin ${isSelected ? "selected" : ""} ${
                  cluster.allVerified ? "verified" : "provisional"
                }`}
                aria-pressed={isSelected}
                aria-label={`${cluster.event.startDate}, ${cluster.event.eventName}, ${
                  cluster.event.city
                } (${cluster.count} documented event${cluster.count > 1 ? "s" : ""})`}
              >
                <title>{`${cluster.event.startDate}, ${cluster.event.eventName}, ${cluster.event.city}`}</title>
                <div className="svg-pin-wrapper">
                  <svg
                    viewBox="0 0 24 32"
                    width="20"
                    height="26"
                    fill="none"
                    aria-hidden="true"
                    className="svg-pin-graphic"
                  >
                    <path
                      d="M12 0C5.373 0 0 5.373 0 12c0 8.5 10.5 18.5 11.4 19.4.3.3.9.3 1.2 0C13.5 30.5 24 20.5 24 12c0-6.627-5.373-12-12-12z"
                      className="pin-body-shape"
                    />
                    <circle cx="12" cy="11.5" r="4" className="pin-dot-shape" />
                  </svg>
                  {isSelected && <span className="svg-pulse-wave" />}
                </div>
                <i />
                {cluster.count > 1 && <b className="cluster-badge">{cluster.count}</b>}
                <span className="svg-pin-city">
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
