import type {
  Confidence,
  EventRecord,
  JourneyLeg,
  PersonStayRecord,
  TrajectoryPoint,
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
  departureClock?: string;
  arrivalClock?: string;
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

  const hours = Math.floor(totalMinutes / 60);
  const remMins = totalMinutes % 60;
  const formattedDuration =
    hours > 0
      ? `${hours}h ${remMins > 0 ? `${remMins}m` : ""}`
      : `${remMins}m`;

  let departureClock: string | undefined;
  let arrivalClock: string | undefined;

  if (baseTime && /^\d{1,2}:\d{2}/.test(baseTime)) {
    const parts = baseTime.split(":");
    const rawHour = parseInt(parts[0], 10);
    const rawMin = parseInt(parts[1], 10);

    const depHour = Number.isFinite(rawHour) ? Math.min(Math.max(rawHour, 0), 23) : 9;
    const depMin = Number.isFinite(rawMin) ? Math.min(Math.max(rawMin, 0), 59) : 30;

    const depTotalMin = depHour * 60 + depMin;
    const arrTotalMin = (depTotalMin + totalMinutes) % (24 * 60);

    const formatClock = (mins: number) => {
      const h = Math.floor(mins / 60) % 24;
      const m = mins % 60;
      return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
    };

    departureClock = formatClock(depTotalMin);
    arrivalClock = formatClock(arrTotalMin);
  }

  return {
    departureClock,
    arrivalClock,
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
 * Calculates a Great Circle route between the origin and destination coordinates,
 * elevated into a 3D arc using a Bezier curve altitude profile.
 */
export function calculate3DGreatCircleArc(
  lng1: number,
  lat1: number,
  lng2: number,
  lat2: number,
  mode: TransportMode | string = "flight",
  numPoints: number = 60
): TrajectoryPoint[] {
  const isHeli = (mode || "").toLowerCase() === "helicopter";
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distKm = Math.round(6371 * c);

  // Peak cruising altitude in meters based on vehicle type and transit distance
  const maxAltitudeMeters = isHeli
    ? Math.min(1500, Math.max(400, distKm * 6))
    : Math.min(11500, Math.max(2500, distKm * 10));

  const gcPoints = interpolateGreatCircle(lng1, lat1, lng2, lat2, numPoints);

  return gcPoints.map((pt) => {
    const t = pt.progress;
    // Parabolic / Bezier curve elevation: h(t) = 4 * H_max * t * (1 - t)
    const altitude = Math.round(4 * maxAltitudeMeters * t * (1 - t));
    // Scale factor between 1.0 (ground) and 1.35 (zenith of 3D arc)
    const scale = 1.0 + 0.35 * (altitude / Math.max(maxAltitudeMeters, 1));
    // Climb / descent pitch angle (-10 deg to +12 deg)
    const pitchAngle = t < 0.25 ? 10 : t > 0.75 ? -8 : 0;

    return {
      lng: pt.lng,
      lat: pt.lat,
      altitudeMeters: altitude,
      bearing: pt.bearing,
      progress: pt.progress,
      pitchAngle,
      scale,
    };
  });
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

  if (/\b(?:flight\s+log|manifest|charter)\b/i.test(text)) {
    inferences.push({
      id: `inf-${event.id}-manifest`,
      inferenceType: "flight_manifest",
      title: "Passenger Flight Manifest / Logbook",
      description: "Official flight log entry or passenger manifest establishes route and aircraft.",
      directness: "direct",
      confidence,
      sourceId,
    });
  }

  if (/\b(?:radar|ads-b|transponder|flightradar)\b/i.test(text)) {
    inferences.push({
      id: `inf-${event.id}-radar`,
      inferenceType: "adsb_radar",
      title: "ADS-B / FlightRadar Track",
      description: "Transponder beacon telemetry recorded altitude, waypoint fixes, and cruise speed.",
      directness: "direct",
      confidence,
      sourceId,
    });
  }

  if (/\b(?:photo|photograph|camera|exif)\b/i.test(text)) {
    inferences.push({
      id: `inf-${event.id}-photo`,
      inferenceType: "photo_metadata",
      title: "Photographic Evidence / Timestamp",
      description: "Timestamped archival photograph at departure or arrival gate.",
      directness: "inferential",
      confidence,
      sourceId,
    });
  }

  if (/\b(?:marine|ais|satellite|vessel)\b/i.test(text)) {
    inferences.push({
      id: `inf-${event.id}-ais`,
      inferenceType: "ais_marine_radar",
      title: "Satellite AIS Maritime Ping",
      description: "Satellite AIS receiver fix recorded vessel coordinates and port departure.",
      directness: "direct",
      confidence,
      sourceId,
    });
  }

  if (/\b(?:witness|testimony|deposition|account)\b/i.test(text)) {
    inferences.push({
      id: `inf-${event.id}-witness`,
      inferenceType: "eyewitness_account",
      title: "Eyewitness / Official Deposition",
      description: "Eyewitness or co-traveler testimony corroborates departure time and method.",
      directness: "inferential",
      confidence,
      sourceId,
    });
  }

  if (/\b(?:schedule|timetable|train|rail)\b/i.test(text)) {
    inferences.push({
      id: `inf-${event.id}-schedule`,
      inferenceType: "official_schedule",
      title: "Published Timetable / Line Schedule",
      description: "Scheduled high-speed rail route or published diplomatic motorcade transit plan.",
      directness: "circumstantial",
      confidence,
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
      certainty: currEvent.flightDetails ? "documented_exact" : "inferred_likely",
      flightDetails: {
        flightCategory: isPrivateOrState ? "government-state" : "commercial",
        flightClassification: isStateOrMilitary ? "diplomatic" : "vip-private",
        flightNumber: currEvent.flightDetails?.flightNumber,
        aircraftManufacturer: currEvent.flightDetails?.aircraftManufacturer,
        aircraftModel: currEvent.flightDetails?.aircraftModel,
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
    const isDirectDocumented = isInterCity
      ? Boolean(currEvent.flightDetails)
      : Boolean(currEvent.roadDetails);

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
      certainty: isDirectDocumented ? "documented_exact" : "inferred_likely",
      inferences: extractTravelInferences(currEvent),
    });
  }

  return legs;
}

/**
 * Computes a fine-grained sequence of trajectory points from an exact series of coordinates
 * (e.g. FlightRadar24 ADS-B plots, Marine AIS track pings, GPX tracks, or road turn-by-turn vectors).
 */
export function computeTrajectoryFromCoordinates(
  rawCoords: Array<[number, number] | [number, number, number]>,
  targetPoints: number = 50
): TrajectoryPoint[] {
  if (!rawCoords || rawCoords.length === 0) return [];
  if (rawCoords.length === 1) {
    return [
      {
        lng: rawCoords[0][0],
        lat: rawCoords[0][1],
        altitudeMeters: rawCoords[0][2],
        bearing: 0,
        progress: 1.0,
      },
    ];
  }

  // Calculate cumulative segment distances
  const segDistances: number[] = [0];
  let totalDist = 0;

  for (let i = 0; i < rawCoords.length - 1; i++) {
    const p1 = rawCoords[i];
    const p2 = rawCoords[i + 1];
    const dLat = ((p2[1] - p1[1]) * Math.PI) / 180;
    const dLon = ((p2[0] - p1[0]) * Math.PI) / 180;
    const lat1 = (p1[1] * Math.PI) / 180;
    const lat2 = (p2[1] * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const dist = 6371000 * c; // meters
    totalDist += Math.max(dist, 1);
    segDistances.push(totalDist);
  }

  const result: TrajectoryPoint[] = [];
  const numSteps = Math.max(targetPoints, rawCoords.length);

  for (let i = 0; i <= numSteps; i++) {
    const targetDist = (i / numSteps) * totalDist;

    // Find bounding segment
    let segIdx = 0;
    while (segIdx < segDistances.length - 1 && segDistances[segIdx + 1] < targetDist) {
      segIdx++;
    }

    const segStartDist = segDistances[segIdx];
    const segEndDist = segDistances[segIdx + 1] ?? totalDist;
    const segSpan = Math.max(segEndDist - segStartDist, 1);
    const segFrac = Math.min(Math.max((targetDist - segStartDist) / segSpan, 0), 1);

    const pA = rawCoords[segIdx];
    const pB = rawCoords[Math.min(segIdx + 1, rawCoords.length - 1)];

    const curLng = pA[0] + (pB[0] - pA[0]) * segFrac;
    const curLat = pA[1] + (pB[1] - pA[1]) * segFrac;
    const curAlt =
      pA[2] != null && pB[2] != null
        ? pA[2] + (pB[2] - pA[2]) * segFrac
        : pA[2] ?? pB[2];

    // Compute tangent bearing
    const yB = Math.sin(((pB[0] - pA[0]) * Math.PI) / 180) * Math.cos((pB[1] * Math.PI) / 180);
    const xB =
      Math.cos((pA[1] * Math.PI) / 180) * Math.sin((pB[1] * Math.PI) / 180) -
      Math.sin((pA[1] * Math.PI) / 180) *
        Math.cos((pB[1] * Math.PI) / 180) *
        Math.cos(((pB[0] - pA[0]) * Math.PI) / 180);
    const rawBearing = ((Math.atan2(yB, xB) * 180) / Math.PI + 360) % 360;

    const progressFrac = i / numSteps;
    const fallbackAlt = Math.round(10500 * Math.sin(progressFrac * Math.PI));
    const effectiveAlt = curAlt != null ? curAlt : (rawCoords.length >= 2 ? fallbackAlt : 0);
    const scale = 1.0 + 0.35 * Math.sin(progressFrac * Math.PI);

    result.push({
      lng: curLng,
      lat: curLat,
      altitudeMeters: effectiveAlt,
      bearing: Math.round(rawBearing),
      progress: progressFrac,
      scale,
    });
  }

  return result;
}

/**
 * Resolves the full route trajectory (exact multi-point coordinate track or geodesic arc)
 * between the previous event and the current event across all travel modalities (air, water, road, rail).
 */
export function resolveRouteTrajectory(
  currEvent: EventRecord,
  prevEvent?: EventRecord | null,
  numSamplePoints: number = 50
): TrajectoryPoint[] {
  // 1. Check if exact route coordinates are supplied on the event or specific metadata schemas
  if (currEvent.routeCoordinates && currEvent.routeCoordinates.length >= 2) {
    return computeTrajectoryFromCoordinates(currEvent.routeCoordinates, numSamplePoints);
  }

  if (currEvent.roadDetails?.routeCoordinates && currEvent.roadDetails.routeCoordinates.length >= 2) {
    return computeTrajectoryFromCoordinates(currEvent.roadDetails.routeCoordinates, numSamplePoints);
  }

  if (currEvent.maritimeDetails?.routeCoordinates && currEvent.maritimeDetails.routeCoordinates.length >= 2) {
    return computeTrajectoryFromCoordinates(currEvent.maritimeDetails.routeCoordinates, numSamplePoints);
  }

  if (currEvent.railDetails?.routeCoordinates && currEvent.railDetails.routeCoordinates.length >= 2) {
    return computeTrajectoryFromCoordinates(currEvent.railDetails.routeCoordinates, numSamplePoints);
  }

  // 2. Check if multiple intermediate waypoints are specified
  if (currEvent.waypoints && currEvent.waypoints.length >= 2) {
    const waypointCoords: Array<[number, number]> = currEvent.waypoints.map((w) => [
      w.longitude,
      w.latitude,
    ]);
    return computeTrajectoryFromCoordinates(waypointCoords, numSamplePoints);
  }

  // 3. Fallback to start-to-end great-circle geodesic curve
  if (
    prevEvent &&
    prevEvent.longitude != null &&
    prevEvent.latitude != null &&
    currEvent.longitude != null &&
    currEvent.latitude != null
  ) {
    return interpolateGreatCircle(
      prevEvent.longitude,
      prevEvent.latitude,
      currEvent.longitude,
      currEvent.latitude,
      numSamplePoints
    );
  }

  // 4. Single point fallback
  if (currEvent.longitude != null && currEvent.latitude != null) {
    return [
      {
        lng: currEvent.longitude,
        lat: currEvent.latitude,
        bearing: 0,
        progress: 1.0,
      },
    ];
  }

  return [];
}

/**
 * Resolves the flight corridor trajectory for aerial transit.
 * 
 * Precedence Rule:
 * 1. If the event record contains real flight telemetry, manifest waypoints, ADS-B plots,
 *    or routeCoordinates, that documented flight data takes strict precedence.
 * 2. If no explicit route coordinates are authored, it automatically defaults to the
 *    most realistic standard Great-Circle airway corridor elevated into a 3D Bezier arc.
 */
export function resolveFlightCorridorTrajectory(
  currEvent: EventRecord,
  prevEvent?: EventRecord | null,
  mode: TransportMode | string = "flight",
  numSamplePoints: number = 60
): TrajectoryPoint[] {
  // 1. Level 1: Documented real flight coordinates
  if (currEvent.routeCoordinates && currEvent.routeCoordinates.length >= 2) {
    return computeTrajectoryFromCoordinates(currEvent.routeCoordinates, numSamplePoints);
  }

  if (currEvent.flightDetails?.routeCoordinates && currEvent.flightDetails.routeCoordinates.length >= 2) {
    return computeTrajectoryFromCoordinates(currEvent.flightDetails.routeCoordinates, numSamplePoints);
  }

  if (currEvent.waypoints && currEvent.waypoints.length >= 2) {
    const coords: Array<[number, number]> = currEvent.waypoints.map((w) => [w.longitude, w.latitude]);
    return computeTrajectoryFromCoordinates(coords, numSamplePoints);
  }

  // 2. Level 2: Auto-suggested standard Great-Circle 3D airway corridor
  if (
    prevEvent &&
    prevEvent.longitude != null &&
    prevEvent.latitude != null &&
    currEvent.longitude != null &&
    currEvent.latitude != null
  ) {
    return calculate3DGreatCircleArc(
      prevEvent.longitude,
      prevEvent.latitude,
      currEvent.longitude,
      currEvent.latitude,
      mode,
      numSamplePoints
    );
  }

  return resolveRouteTrajectory(currEvent, prevEvent, numSamplePoints);
}

