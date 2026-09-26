import type { EventRecord } from "./types";

export type TransportMode =
  | "air-force-one"
  | "private-jet"
  | "flight"
  | "helicopter"
  | "train"
  | "car"
  | "bus"
  | "boat"
  | "local";

export interface JourneyTransport {
  mode: TransportMode;
  label: string;
  iconName: "plane" | "jet" | "helicopter" | "car" | "train" | "bus" | "ship";
  emoji: string;
  distanceKm: number;
  formattedDistance: string;
  originCity: string;
  destinationCity: string;
  originCoords?: [number, number]; // [lng, lat]
  destinationCoords?: [number, number]; // [lng, lat]
  bearing: number;
  isJourney: boolean;
  description: string;
}

/**
 * Calculates the great-circle distance between two geographic points using the Haversine formula.
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

/**
 * Calculates the initial compass bearing from Point A to Point B in degrees (0° to 360°).
 */
export function calculateBearing(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x =
    Math.cos(φ1) * Math.sin(φ2) -
    Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  const θ = Math.atan2(y, x);
  const bearing = ((θ * 180) / Math.PI + 360) % 360;
  return Math.round(bearing);
}

/**
 * Derives the forensic method of transport, distance, bearing, and journey context
 * between two sequential historical events.
 */
export function resolveJourneyTransport(
  prevEvent?: EventRecord | null,
  currEvent?: EventRecord | null
): JourneyTransport {
  if (!prevEvent || !currEvent) {
    return {
      mode: "local",
      label: "Initial Location",
      iconName: "car",
      emoji: "📍",
      distanceKm: 0,
      formattedDistance: "0 km",
      originCity: currEvent?.city || "",
      destinationCity: currEvent?.city || "",
      bearing: 0,
      isJourney: false,
      description: currEvent ? `First indexed location: ${currEvent.city}` : "No event selected",
    };
  }

  const hasPrevCoords = prevEvent.latitude != null && prevEvent.longitude != null;
  const hasCurrCoords = currEvent.latitude != null && currEvent.longitude != null;

  const distanceKm =
    hasPrevCoords && hasCurrCoords
      ? calculateDistanceKm(
          prevEvent.latitude!,
          prevEvent.longitude!,
          currEvent.latitude!,
          currEvent.longitude!
        )
      : 0;

  const bearing =
    hasPrevCoords && hasCurrCoords
      ? calculateBearing(
          prevEvent.latitude!,
          prevEvent.longitude!,
          currEvent.latitude!,
          currEvent.longitude!
        )
      : 0;

  const originCity = prevEvent.city || "Unknown";
  const destinationCity = currEvent.city || "Unknown";
  const isSameLocation =
    distanceKm < 15 && originCity.toLowerCase() === destinationCity.toLowerCase();

  const combinedContext = [
    currEvent.eventName,
    currEvent.summary,
    currEvent.notes || "",
    ...(currEvent.medium || []),
    ...(currEvent.eventTypes || []),
    ...(currEvent.categories || []),
    currEvent.venueName || "",
  ]
    .join(" ")
    .toLowerCase();

  // Mode resolution based on forensic text evidence and distance heuristics
  let mode: TransportMode = "local";
  let label = "Local Transit";
  let iconName: "plane" | "jet" | "helicopter" | "car" | "train" | "bus" | "ship" = "car";
  let emoji = "🚗";

  const hasTerm = (text: string, terms: readonly string[]): boolean =>
    terms.some((t) =>
      new RegExp(`\\b${t.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&")}\\b`, "i").test(text)
    );

  if (
    hasTerm(combinedContext, [
      "air force one",
      "air force 1",
      "sam 28000",
      "sam 29000",
      "state aircraft",
      "presidential flight",
    ])
  ) {
    mode = "air-force-one";
    label = "Air Force One / State Aircraft";
    iconName = "plane";
    emoji = "🛫";
  } else if (
    hasTerm(combinedContext, [
      "helicopter",
      "helicopters",
      "marine one",
      "chopper",
      "choppers",
      "helipad",
    ])
  ) {
    mode = "helicopter";
    label = "Helicopter Transfer";
    iconName = "helicopter";
    emoji = "🚁";
  } else if (
    hasTerm(combinedContext, [
      "private jet",
      "private jets",
      "lolita express",
      "gulfstream",
      "flight log",
      "charter flight",
      "charter flights",
      "private flight",
      "private flights",
      "boeing 727-23",
    ])
  ) {
    mode = "private-jet";
    label = "Private Jet Flight";
    iconName = "jet";
    emoji = "🛩️";
  } else if (
    hasTerm(combinedContext, [
      "train",
      "trains",
      "railway",
      "railways",
      "railroad",
      "railroads",
      "eurostar",
      "amtrak",
      "bullet train",
      "high-speed rail",
      "rail",
    ])
  ) {
    mode = "train";
    label = "High-Speed Rail";
    iconName = "train";
    emoji = "🚆";
  } else if (
    hasTerm(combinedContext, [
      "yacht",
      "yachts",
      "superyacht",
      "superyachts",
      "boat",
      "boats",
      "vessel",
      "vessels",
      "ship",
      "ships",
      "ferry",
      "ferries",
      "cruise",
      "cruises",
      "maritime",
      "sailboat",
    ])
  ) {
    mode = "boat";
    label = "Maritime Vessel / Yacht";
    iconName = "ship";
    emoji = "🚢";
  } else if (
    hasTerm(combinedContext, [
      "bus",
      "buses",
      "coach",
      "coaches",
      "public transit",
      "bus transit",
    ])
  ) {
    mode = "bus";
    label = "Ground Transit / Coach";
    iconName = "bus";
    emoji = "🚌";
  } else if (
    hasTerm(combinedContext, [
      "motorcade",
      "motorcades",
      "convoy",
      "convoys",
      "limousine",
      "limousines",
      "official vehicle",
      "official vehicles",
      "presidential motorcade",
    ])
  ) {
    mode = "car";
    label = "Official Motorcade";
    iconName = "car";
    emoji = "🚘";
  } else {
    // Distance-derived heuristic
    if (distanceKm >= 350) {
      mode = "flight";
      label = "Flight Transit";
      iconName = "plane";
      emoji = "✈️";
    } else if (distanceKm >= 75) {
      mode = "train";
      label = "Regional Transit";
      iconName = "train";
      emoji = "🚆";
    } else if (distanceKm >= 15) {
      mode = "car";
      label = "Motorcade / Ground Travel";
      iconName = "car";
      emoji = "🚗";
    } else {
      mode = "local";
      label = isSameLocation ? "Same Venue / City" : "Local Ground Transfer";
      iconName = "car";
      emoji = isSameLocation ? "📍" : "🚗";
    }
  }

  const formattedDistance = distanceKm > 0 ? `${distanceKm.toLocaleString()} km` : "Local";
  const isJourney = distanceKm >= 5 && !isSameLocation;

  const description = isJourney
    ? `${emoji} ${label}: ${originCity} → ${destinationCity} (${formattedDistance})`
    : `📍 ${originCity}: ${label}`;

  return {
    mode,
    label,
    iconName,
    emoji,
    distanceKm,
    formattedDistance,
    originCity,
    destinationCity,
    originCoords: hasPrevCoords ? [prevEvent.longitude!, prevEvent.latitude!] : undefined,
    destinationCoords: hasCurrCoords ? [currEvent.longitude!, currEvent.latitude!] : undefined,
    bearing,
    isJourney,
    description,
  };
}
