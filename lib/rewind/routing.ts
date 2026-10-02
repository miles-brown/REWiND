import type { TrajectoryPoint } from "./types";
import type { TransportMode } from "./transport";
import { computeTrajectoryFromCoordinates } from "./travel";

// In-memory cache to prevent duplicate network calls during timeline scrubs and playback
const routeCache = new Map<string, TrajectoryPoint[]>();
const inFlightRequests = new Map<string, Promise<TrajectoryPoint[]>>();

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

/**
 * Checks if a transport mode represents aerial transit (Air Force One, jet, plane, helicopter).
 */
export function isAirTransport(mode: TransportMode | string): boolean {
  const normalized = (mode || "").toLowerCase();
  return (
    normalized === "air-force-one" ||
    normalized === "private-jet" ||
    normalized === "flight" ||
    normalized === "helicopter" ||
    normalized === "plane" ||
    normalized === "jet" ||
    normalized === "airplane"
  );
}

/**
 * Checks if a transport mode represents ground or water transit (car, train, bus, boat, local).
 */
export function isGroundOrMaritimeTransport(mode: TransportMode | string): boolean {
  const normalized = (mode || "").toLowerCase();
  return (
    normalized === "car" ||
    normalized === "train" ||
    normalized === "bus" ||
    normalized === "boat" ||
    normalized === "ship" ||
    normalized === "local" ||
    normalized === "motorcade" ||
    normalized === "police-convoy" ||
    normalized === "walking"
  );
}

/**
 * Maps transport modes to Mapbox / OSRM routing profiles.
 */
export function getRoutingProfile(
  mode: TransportMode | string
): "driving" | "walking" | "transit" | "waterway" | "flight" {
  if (isAirTransport(mode)) return "flight";
  const normalized = (mode || "").toLowerCase();
  if (normalized === "boat" || normalized === "ship") return "waterway";
  if (normalized === "walking") return "walking";
  if (normalized === "train") return "transit";
  return "driving";
}

/**
 * Generates an intelligent multi-point curved spline trajectory when routing API is offline
 * or between coordinates where no road network connects them (e.g. islands, water crossings).
 * Guarantees a smooth non-straight multi-point LineString path.
 */
export function generateCurvedFallbackTrajectory(
  origin: [number, number],
  destination: [number, number],
  mode: TransportMode | string,
  numSamplePoints: number = 50
): TrajectoryPoint[] {
  const [lng1, lat1] = origin;
  const [lng2, lat2] = destination;

  const dLng = lng2 - lng1;
  const dLat = lat2 - lat1;
  const dist = Math.sqrt(dLng * dLng + dLat * dLat);

  if (dist < 0.0001) {
    return [{ lng: lng1, lat: lat1, bearing: 0, progress: 1.0 }];
  }

  // Calculate perpendicular normal vector for realistic road / waterway curve deflection
  const midLng = (lng1 + lng2) / 2;
  const midLat = (lat1 + lat2) / 2;

  // Normalized perpendicular vector [-dLat/dist, dLng/dist]
  const curvatureScale = Math.min(dist * 0.12, 0.6);
  // Slight directional bias depending on mode
  const sign = (mode === "boat" || mode === "ship" ? -1 : 1) * (dLng > 0 ? 1 : -1);
  const ctrlLng = midLng - (dLat / dist) * curvatureScale * sign;
  const ctrlLat = midLat + (dLng / dist) * curvatureScale * sign;

  // Generate quadratic/cubic Bezier control points along ground surface
  const coords: Array<[number, number]> = [];
  const steps = Math.max(numSamplePoints, 30);

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    // Quadratic Bezier: B(t) = (1-t)^2 P0 + 2(1-t)t P1 + t^2 P2
    const lng = (1 - t) * (1 - t) * lng1 + 2 * (1 - t) * t * ctrlLng + t * t * lng2;
    const lat = (1 - t) * (1 - t) * lat1 + 2 * (1 - t) * t * ctrlLat + t * t * lat2;
    coords.push([lng, lat]);
  }

  return computeTrajectoryFromCoordinates(coords, numSamplePoints);
}

/**
 * Clears the in-memory route cache.
 */
export function clearRouteCache(): void {
  routeCache.clear();
  inFlightRequests.clear();
}

/**
 * Fetches actual geographic LineString path from Mapbox Directions API or OSRM routing service
 * for ground, rail, boat, and local transit.
 * 
 * Features:
 * 1. Mapbox Directions API when NEXT_PUBLIC_MAPBOX_TOKEN is configured.
 * 2. OSRM (Open Source Routing Machine) public router as resilient primary/fallback.
 * 3. In-memory LRU caching to eliminate repeated API latency during timeline scrubs.
 * 4. Graceful timeout & offline handling with multi-point curved spline fallback (never straight lines).
 */
export async function fetchTransitRoute(
  origin: [number, number],
  destination: [number, number],
  mode: TransportMode | string,
  options?: {
    signal?: AbortSignal;
    numSamplePoints?: number;
    mapboxToken?: string;
  }
): Promise<TrajectoryPoint[]> {
  const [lng1, lat1] = origin;
  const [lng2, lat2] = destination;
  const numSamplePoints = options?.numSamplePoints ?? 60;
  const token = options?.mapboxToken || MAPBOX_TOKEN;

  // Validate coordinates
  if (!Number.isFinite(lng1) || !Number.isFinite(lat1) || !Number.isFinite(lng2) || !Number.isFinite(lat2)) {
    return [];
  }

  const cacheKey = `${mode}:${lng1.toFixed(5)},${lat1.toFixed(5)}->${lng2.toFixed(5)},${lat2.toFixed(5)}`;

  if (routeCache.has(cacheKey)) {
    return routeCache.get(cacheKey)!;
  }

  if (inFlightRequests.has(cacheKey)) {
    return inFlightRequests.get(cacheKey)!;
  }

  const fetchPromise = (async (): Promise<TrajectoryPoint[]> => {
    // 1. Waterway / Boat handling: Use custom curved waterway route (OSRM is for land roads)
    if (mode === "boat" || mode === "ship") {
      const waterwayTrajectory = generateCurvedFallbackTrajectory(
        origin,
        destination,
        mode,
        numSamplePoints
      );
      routeCache.set(cacheKey, waterwayTrajectory);
      return waterwayTrajectory;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    // Combine caller signal with internal timeout signal if provided
    if (options?.signal) {
      options.signal.addEventListener("abort", () => controller.abort(), { once: true });
    }

    try {
      let geojsonCoords: Array<[number, number]> | null = null;

      // Try Mapbox Directions API if access token is configured
      if (token) {
        const profile = mode === "walking" ? "mapbox/walking" : "mapbox/driving";
        const mapboxUrl = `https://api.mapbox.com/directions/v5/${profile}/${lng1},${lat1};${lng2},${lat2}?geometries=geojson&overview=full&access_token=${token}`;

        try {
          const res = await fetch(mapboxUrl, { signal: controller.signal });
          if (res.ok) {
            const data = await res.json();
            if (data?.routes?.[0]?.geometry?.coordinates?.length >= 2) {
              geojsonCoords = data.routes[0].geometry.coordinates as Array<[number, number]>;
            }
          }
        } catch {
          // Fall through to OSRM
        }
      }

      // Try OSRM public router if Mapbox was not used or didn't return coordinates
      if (!geojsonCoords) {
        const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${lng1},${lat1};${lng2},${lat2}?overview=full&geometries=geojson`;
        try {
          const res = await fetch(osrmUrl, { signal: controller.signal });
          if (res.ok) {
            const data = await res.json();
            if (data?.code === "Ok" && data?.routes?.[0]?.geometry?.coordinates?.length >= 2) {
              geojsonCoords = data.routes[0].geometry.coordinates as Array<[number, number]>;
            }
          }
        } catch {
          // Fallback handled below
        }
      }

      clearTimeout(timeoutId);

      if (geojsonCoords && geojsonCoords.length >= 2) {
        const trajectory = computeTrajectoryFromCoordinates(geojsonCoords, numSamplePoints);
        routeCache.set(cacheKey, trajectory);
        return trajectory;
      }
    } catch {
      clearTimeout(timeoutId);
    }

    // Fallback: Generate smooth multi-point curved spline trajectory (never straight 2-point lines)
    const fallbackTrajectory = generateCurvedFallbackTrajectory(
      origin,
      destination,
      mode,
      numSamplePoints
    );
    routeCache.set(cacheKey, fallbackTrajectory);
    return fallbackTrajectory;
  })();

  inFlightRequests.set(cacheKey, fetchPromise);

  try {
    const result = await fetchPromise;
    inFlightRequests.delete(cacheKey);
    return result;
  } catch {
    inFlightRequests.delete(cacheKey);
    return generateCurvedFallbackTrajectory(origin, destination, mode, numSamplePoints);
  }
}
