import type {
  Confidence,
  EventRecord,
  JourneyLeg,
  PersonStayRecord,
  TravelEventRecord,
  TravelInference,
} from "./types";
import type { TransportMode } from "./transport";

/**
 * Type guard to check if an EventRecord is a designated TravelEventRecord.
 */
export function isTravelEvent(event: EventRecord): event is TravelEventRecord {
  return (
    Boolean(event.isTravelEvent) ||
    Boolean(
      event.eventTypes?.some((t) =>
        ["travel", "flight", "maritime", "transit", "journey", "movement"].includes(
          t.toLowerCase()
        )
      )
    ) ||
    Boolean(event.originLocation && event.destinationLocation)
  );
}

/**
 * Calculates estimated journey duration in minutes and realistic 24-hr departure/arrival clock times
 * based on vehicle mode and distance.
 */
export function calculateJourneySchedule(
  distanceKm: number,
  mode: TransportMode,
  baseTime?: string | null
): {
  departureClock: string;
  arrivalClock: string;
  durationMinutes: number;
  formattedDuration: string;
} {
  // Speed model in km/h including terminal / taxi / acceleration buffers
  let avgSpeedKmh = 100;
  let fixedBufferMinutes = 15;

  switch (mode) {
    case "air-force-one":
    case "private-jet":
    case "flight":
      avgSpeedKmh = 850;
      fixedBufferMinutes = 45; // Takeoff, climb, descent, landing taxi
      break;
    case "helicopter":
      avgSpeedKmh = 230;
      fixedBufferMinutes = 15;
      break;
    case "train":
      avgSpeedKmh = 180;
      fixedBufferMinutes = 20; // Boarding & station halts
      break;
    case "boat":
      avgSpeedKmh = 35;
      fixedBufferMinutes = 45; // Harbor pilotage & docking
      break;
    case "bus":
      avgSpeedKmh = 65;
      fixedBufferMinutes = 15;
      break;
    case "car":
      avgSpeedKmh = 90;
      fixedBufferMinutes = 10;
      break;
    case "local":
    default:
      avgSpeedKmh = 45;
      fixedBufferMinutes = 10;
      break;
  }

  const travelMinutes = Math.round((distanceKm / avgSpeedKmh) * 60);
  const totalMinutes = Math.max(15, travelMinutes + fixedBufferMinutes);

  // Parse or synthesize base departure time (defaulting to 09:30 AM local time if unspecified)
  let depHour = 9;
  let depMin = 30;

  if (baseTime && /^\d{1,2}:\d{2}/.test(baseTime)) {
    const parts = baseTime.split(":");
    depHour = parseInt(parts[0], 10);
    depMin = parseInt(parts[1], 10);
  }

  const depTotalMin = depHour * 60 + depMin;
  const arrTotalMin = (depTotalMin + totalMinutes) % (24 * 60);

  const formatClock = (mins: number) => {
    const h = Math.floor(mins / 60) % 24;
    const m = mins % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  };

  const hours = Math.floor(totalMinutes / 60);
  const remMins = totalMinutes % 60;
  const formattedDuration =
    hours > 0
      ? `${hours}h ${remMins > 0 ? `${remMins}m` : ""}`
      : `${remMins}m`;

  return {
    departureClock: formatClock(depTotalMin),
    arrivalClock: formatClock(arrTotalMin),
    durationMinutes: totalMinutes,
    formattedDuration: formattedDuration.trim(),
  };
}

/**
 * Computes an array of interpolated coordinates along a Great-Circle geodesic arc
 * between two geographic coordinates with accurate tangent heading bearings.
 */
export function interpolateGreatCircle(
  lng1: number,
  lat1: number,
  lng2: number,
  lat2: number,
  numPoints: number = 40
): Array<{ lng: number; lat: number; bearing: number; progress: number }> {
  const points: Array<{ lng: number; lat: number; bearing: number; progress: number }> = [];

  const p1 = { lat: (lat1 * Math.PI) / 180, lon: (lng1 * Math.PI) / 180 };
  const p2 = { lat: (lat2 * Math.PI) / 180, lon: (lng2 * Math.PI) / 180 };

  const d = 2 * Math.asin(
    Math.sqrt(
      Math.sin((p2.lat - p1.lat) / 2) ** 2 +
        Math.cos(p1.lat) * Math.cos(p2.lat) * Math.sin((p2.lon - p1.lon) / 2) ** 2
    )
  );

  if (d < 0.00001) {
    return [{ lng: lng1, lat: lat1, bearing: 0, progress: 1.0 }];
  }

  for (let i = 0; i <= numPoints; i++) {
    const f = i / numPoints;
    const A = Math.sin((1 - f) * d) / Math.sin(d);
    const B = Math.sin(f * d) / Math.sin(d);
    const x = A * Math.cos(p1.lat) * Math.cos(p1.lon) + B * Math.cos(p2.lat) * Math.cos(p2.lon);
    const y = A * Math.cos(p1.lat) * Math.sin(p1.lon) + B * Math.cos(p2.lat) * Math.sin(p2.lon);
    const z = A * Math.sin(p1.lat) + B * Math.sin(p2.lat);
    const lat = Math.atan2(z, Math.sqrt(x * x + y * y));
    const lon = Math.atan2(y, x);

    const degLat = (lat * 180) / Math.PI;
    const degLon = (lon * 180) / Math.PI;

    let bearing = 0;
    if (i < numPoints) {
      const nextF = (i + 1) / numPoints;
      const nextA = Math.sin((1 - nextF) * d) / Math.sin(d);
      const nextB = Math.sin(nextF * d) / Math.sin(d);
      const nx = nextA * Math.cos(p1.lat) * Math.cos(p1.lon) + nextB * Math.cos(p2.lat) * Math.cos(p2.lon);
      const ny = nextA * Math.cos(p1.lat) * Math.sin(p1.lon) + nextB * Math.cos(p2.lat) * Math.sin(p2.lon);
      const nz = nextA * Math.sin(p1.lat) + nextB * Math.sin(p2.lat);
      const nLat = Math.atan2(nz, Math.sqrt(nx * nx + ny * ny));
      const nLon = Math.atan2(ny, nx);
      const yB = Math.sin(nLon - lon) * Math.cos(nLat);
      const xB = Math.cos(lat) * Math.sin(nLat) - Math.sin(lat) * Math.cos(nLat) * Math.cos(nLon - lon);
      bearing = ((Math.atan2(yB, xB) * 180) / Math.PI + 360) % 360;
    } else if (points.length > 0) {
      bearing = points[points.length - 1].bearing;
    }

    points.push({
      lng: degLon,
      lat: degLat,
      bearing: Math.round(bearing),
      progress: f,
    });
  }

  return points;
}

/**
 * Automatically extracts evidentiary inferences (flight logs, radar traces, photographic evidence,
 * social media, witness reports) from an event's text, claims, and media context.
 */
export function extractTravelInferences(event: EventRecord): TravelInference[] {
  const inferences: TravelInference[] = [];
  const text = `${event.eventName} ${event.summary} ${event.notes || ""} ${
    (event.medium || []).join(" ")
  } ${event.venueName || ""}`.toLowerCase();

  const sourceId = event.sourceIds?.[0];
  const confidence: Confidence = event.confidence || "limited";

  if (text.includes("flight log") || text.includes("manifest") || text.includes("charter")) {
    inferences.push({
      id: `inf-${event.id}-manifest`,
      inferenceType: "flight_manifest",
      title: "Passenger Flight Manifest / Logbook",
      description: "Official flight log entry or passenger manifest establishes route and aircraft.",
      directness: "direct",
      confidence: "confirmed",
      sourceId,
    });
  }

  if (text.includes("radar") || text.includes("ads-b") || text.includes("transponder") || text.includes("flightradar")) {
    inferences.push({
      id: `inf-${event.id}-radar`,
      inferenceType: "adsb_radar",
      title: "ADS-B / FlightRadar Track",
      description: "Transponder beacon telemetry recorded altitude, waypoint fixes, and cruise speed.",
      directness: "direct",
      confidence: "confirmed",
      sourceId,
    });
  }

  if (text.includes("photo") || text.includes("photograph") || text.includes("camera") || text.includes("exif")) {
    inferences.push({
      id: `inf-${event.id}-photo`,
      inferenceType: "photo_metadata",
      title: "Photographic Evidence / Timestamp",
      description: "Timestamped archival photograph at departure or arrival gate.",
      directness: "inferential",
      confidence: "strong",
      sourceId,
    });
  }

  if (text.includes("marine") || text.includes("ais") || text.includes("satellite") || text.includes("vessel")) {
    inferences.push({
      id: `inf-${event.id}-ais`,
      inferenceType: "ais_marine_radar",
      title: "Satellite AIS Maritime Ping",
      description: "Satellite AIS receiver fix recorded vessel coordinates and port departure.",
      directness: "direct",
      confidence: "strong",
      sourceId,
    });
  }

  if (text.includes("witness") || text.includes("testimony") || text.includes("account")) {
    inferences.push({
      id: `inf-${event.id}-witness`,
      inferenceType: "eyewitness_account",
      title: "Eyewitness / Official Deposition",
      description: "Eyewitness or co-traveler testimony corroborates departure time and method.",
      directness: "inferential",
      confidence: "moderate",
      sourceId,
    });
  }

  if (text.includes("schedule") || text.includes("timetable") || text.includes("train") || text.includes("rail")) {
    inferences.push({
      id: `inf-${event.id}-schedule`,
      inferenceType: "official_schedule",
      title: "Published Timetable / Line Schedule",
      description: "Scheduled high-speed rail route or published diplomatic motorcade transit plan.",
      directness: "circumstantial",
      confidence: "moderate",
      sourceId,
    });
  }

  // Fallback inference if none matched
  if (inferences.length === 0) {
    inferences.push({
      id: `inf-${event.id}-archival`,
      inferenceType: "official_schedule",
      title: "Chronological Sequence Alignment",
      description: `Sequential presence verified between ${event.city} and adjoining chronological events.`,
      directness: "circumstantial",
      confidence,
      sourceId,
    });
  }

  return inferences;
}

/**
 * Resolves a person's active base of operations or accommodation (e.g. hotel, official residence)
 * on a given chronological date.
 */
export function resolveActiveStay(
  stays: PersonStayRecord[] = [],
  date: string
): PersonStayRecord | null {
  if (!stays.length || !date) return null;

  const activeStay = stays.find((stay) => {
    if (stay.startDate <= date) {
      if (!stay.endDate || stay.endDate >= date) {
        return true;
      }
    }
    return false;
  });

  return activeStay || null;
}

/**
 * Decomposes a journey into granular sub-travel event legs (e.g. Residence -> Helipad -> Airbase -> Airport -> Hotel)
 * reflecting executive/presidential convoy protocols or inferred multi-modal transit legs.
 */
export function decomposeCompositeJourney(
  currEvent: EventRecord,
  prevEvent?: EventRecord | null
): JourneyLeg[] {
  // 1. If explicit legs were already authored on the event record, return them
  if (currEvent.legs && currEvent.legs.length > 0) {
    return currEvent.legs;
  }

  if (!prevEvent || prevEvent.latitude == null || prevEvent.longitude == null || currEvent.latitude == null || currEvent.longitude == null) {
    return [];
  }

  const originCity = prevEvent.city || "Origin";
  const destCity = currEvent.city || "Destination";
  const originVenue = prevEvent.venueName || `${originCity} Base`;
  const destVenue = currEvent.venueName || `${destCity} Venue`;

  const dLat = Math.abs(currEvent.latitude - prevEvent.latitude);
  const dLon = Math.abs(currEvent.longitude - prevEvent.longitude);
  const isInterCity = dLat > 0.5 || dLon > 0.5;

  const eventText = `${currEvent.eventName} ${currEvent.summary} ${currEvent.notes || ""}`.toLowerCase();
  const isStateOrMilitary =
    eventText.includes("president") ||
    eventText.includes("prime minister") ||
    eventText.includes("diplomatic") ||
    eventText.includes("air force") ||
    eventText.includes("state visit") ||
    eventText.includes("summit") ||
    eventText.includes("motorcade");

  const legs: JourneyLeg[] = [];

  if (isInterCity && isStateOrMilitary) {
    // Multi-leg protocol: Ground Convoy -> Helicopter / Airbase -> Presidential Flight -> Arrival Motorcade -> Hotel / Venue
    // Leg 1: Ground Executive Convoy to Helipad / Airbase
    legs.push({
      id: `leg-${currEvent.id}-1`,
      legIndex: 1,
      legTitle: `Executive Motorcade: ${originVenue} → Airfield Hub`,
      originVenue: {
        name: originVenue,
        venueType: "official_residence",
        city: originCity,
        country: prevEvent.country,
        latitude: prevEvent.latitude,
        longitude: prevEvent.longitude,
        stopType: "origin",
      },
      destinationVenue: {
        name: `${originCity} Executive Airbase / Helipad`,
        venueType: "airbase",
        city: originCity,
        country: prevEvent.country,
        latitude: prevEvent.latitude + 0.05,
        longitude: prevEvent.longitude + 0.05,
        stopType: "layover",
      },
      transportMode: "car",
      certainty: "inferred_likely",
      roadDetails: {
        convoyType: "official_motorcade",
        convoyDetails: {
          motorcadeType: "presidential_full",
          policeEscort: true,
          armoredLimousine: true,
          notes: "Armed security detail and advance motorcade escort.",
        },
      },
    });

    // Leg 2: Main Air Transit Leg
    const isPrivateOrState = eventText.includes("private jet") || eventText.includes("gulfstream") || eventText.includes("air force");
    const flightMode = isPrivateOrState ? (eventText.includes("air force") ? "air-force-one" : "private-jet") : "flight";

    legs.push({
      id: `leg-${currEvent.id}-2`,
      legIndex: 2,
      legTitle: `${flightMode === "air-force-one" ? "State Aircraft (Air Force One)" : flightMode === "private-jet" ? "Private Jet Flight" : "Charter / Long-Haul Flight"}: ${originCity} → ${destCity}`,
      originVenue: {
        name: `${originCity} Airfield`,
        venueType: "airport",
        city: originCity,
        country: prevEvent.country,
        latitude: prevEvent.latitude + 0.05,
        longitude: prevEvent.longitude + 0.05,
        stopType: "layover",
      },
      destinationVenue: {
        name: `${destCity} International Airport / Airbase`,
        venueType: "airport",
        city: destCity,
        country: currEvent.country,
        latitude: currEvent.latitude - 0.05,
        longitude: currEvent.longitude - 0.05,
        stopType: "layover",
      },
      transportMode: flightMode,
      certainty: "documented_exact",
      flightDetails: {
        flightCategory: isPrivateOrState ? "government-state" : "commercial",
        flightClassification: isStateOrMilitary ? "diplomatic" : "vip-private",
        flightNumber: currEvent.flightDetails?.flightNumber || (flightMode === "air-force-one" ? "SAM 28000" : undefined),
        aircraftManufacturer: currEvent.flightDetails?.aircraftManufacturer || (flightMode === "air-force-one" ? "Boeing" : "Gulfstream Aerospace"),
        aircraftModel: currEvent.flightDetails?.aircraftModel || (flightMode === "air-force-one" ? "VC-25A (747-200B)" : "G550"),
        tailNumber: currEvent.flightDetails?.tailNumber,
        coTravelers: currEvent.participants?.map((p) => ({
          personId: p.personId,
          name: p.name,
          role: p.role,
          slug: p.slug,
        })),
        departureCity: originCity,
        arrivalCity: destCity,
      },
      inferences: extractTravelInferences(currEvent),
    });

    // Leg 3: Arrival Motorcade to Hotel / Summit Venue
    legs.push({
      id: `leg-${currEvent.id}-3`,
      legIndex: 3,
      legTitle: `Diplomatic Convoy: ${destCity} Airport → ${destVenue}`,
      originVenue: {
        name: `${destCity} International Airport`,
        venueType: "airport",
        city: destCity,
        country: currEvent.country,
        latitude: currEvent.latitude - 0.05,
        longitude: currEvent.longitude - 0.05,
        stopType: "layover",
      },
      destinationVenue: {
        name: destVenue,
        venueType: "hotel",
        city: destCity,
        country: currEvent.country,
        latitude: currEvent.latitude,
        longitude: currEvent.longitude,
        stopType: "destination",
      },
      transportMode: "car",
      certainty: "inferred_likely",
      roadDetails: {
        convoyType: "diplomatic_motorcade",
        convoyDetails: {
          motorcadeType: "diplomatic_secure",
          policeEscort: true,
          armoredLimousine: true,
          notes: "Host nation security escort to accommodation / delegation venue.",
        },
      },
    });
  } else {
    // Single Direct Leg (Local Transfer / Direct Trip)
    legs.push({
      id: `leg-${currEvent.id}-direct`,
      legIndex: 1,
      legTitle: `Direct Transfer: ${originVenue} → ${destVenue}`,
      originVenue: {
        name: originVenue,
        city: originCity,
        country: prevEvent.country,
        latitude: prevEvent.latitude,
        longitude: prevEvent.longitude,
        stopType: "origin",
      },
      destinationVenue: {
        name: destVenue,
        city: destCity,
        country: currEvent.country,
        latitude: currEvent.latitude,
        longitude: currEvent.longitude,
        stopType: "destination",
      },
      transportMode: isInterCity ? "flight" : "car",
      certainty: "documented_exact",
      inferences: extractTravelInferences(currEvent),
    });
  }

  return legs;
}
