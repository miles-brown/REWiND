import test, { after } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createServer } from "vite";

const root = fileURLToPath(new URL("..", import.meta.url));

const vite = await createServer({
  appType: "custom",
  configFile: false,
  root,
  resolve: { alias: { "@": root } },
  server: { middlewareMode: true },
});

after(async () => {
  if (vite) await vite.close();
});

test("verifies interpolateGreatCircle computes smooth geodesic curve with headings", async () => {
  const { interpolateGreatCircle } = await vite.ssrLoadModule("/lib/rewind/travel.ts");
  assert.equal(typeof interpolateGreatCircle, "function");

  // New York (JFK: -73.7781, 40.6413) to London (LHR: -0.4543, 51.4700)
  const points = interpolateGreatCircle(-73.7781, 40.6413, -0.4543, 51.47, 20);
  assert.equal(points.length, 21, "Must generate 21 points for numPoints = 20");
  assert.ok(Math.abs(points[0].lng - (-73.7781)) < 0.01, "Origin longitude must match JFK");
  assert.ok(Math.abs(points[20].lng - (-0.4543)) < 0.01, "Destination longitude must match LHR");

  // Great circle heading from NY to London starts in northeast quadrant (~45-60 deg)
  assert.ok(points[0].bearing >= 40 && points[0].bearing <= 75, "Initial heading must be northeast");
});

test("verifies calculateJourneySchedule models transit speeds and 24-hr clock transitions", async () => {
  const { calculateJourneySchedule } = await vite.ssrLoadModule("/lib/rewind/travel.ts");
  assert.equal(typeof calculateJourneySchedule, "function");

  // Transatlantic Flight: 5500 km at ~850 km/h + 45 min buffer ~ 433 min (~7h 13m)
  const flightSchedule = calculateJourneySchedule(5500, "flight", "10:00");
  assert.equal(flightSchedule.departureClock, "10:00");
  assert.ok(flightSchedule.durationMinutes >= 400 && flightSchedule.durationMinutes <= 460);
  assert.ok(flightSchedule.formattedDuration.includes("h"));

  // Train journey: 300 km at ~180 km/h + 20 min buffer ~ 120 min (2h)
  const trainSchedule = calculateJourneySchedule(300, "train", "14:15");
  assert.equal(trainSchedule.departureClock, "14:15");
  assert.ok(trainSchedule.arrivalClock.startsWith("16:"));
});

test("verifies extractTravelInferences identifies flight logs, radar, photo, and AIS marine evidence", async () => {
  const { extractTravelInferences } = await vite.ssrLoadModule("/lib/rewind/travel.ts");
  assert.equal(typeof extractTravelInferences, "function");

  const flightEvent = {
    id: "evt-test-flight",
    slug: "flight-jfk-lhr",
    eventName: "Charter Flight to London",
    startDate: "2018-06-15",
    city: "London",
    country: "United Kingdom",
    summary: "Passenger flight log recorded private jet departure with ADS-B radar transponder track.",
    verificationStatus: "verified",
    sourceIds: ["src-1"],
    participants: [],
  };

  const inferences = extractTravelInferences(flightEvent);
  assert.ok(inferences.some((inf) => inf.inferenceType === "flight_manifest"), "Must detect flight log manifest");
  assert.ok(inferences.some((inf) => inf.inferenceType === "adsb_radar"), "Must detect ADS-B radar");
});

test("verifies MapGraphic.tsx defines CARTO Voyager geopolitical basemap with blue oceans", () => {
  const mapGraphicContent = fs.readFileSync(path.join(root, "components/rewind/MapGraphic.tsx"), "utf-8");
  assert.ok(
    mapGraphicContent.includes("voyager-gl-style") || mapGraphicContent.includes("CARTO_VOYAGER_STYLE"),
    "MapGraphic.tsx must define CARTO Voyager style for geopolitical basemap"
  );
  assert.ok(
    mapGraphicContent.includes("FALLBACK_RASTER_VOYAGER_STYLE"),
    "MapGraphic.tsx must include fallback raster tiles for Voyager"
  );
  assert.ok(
    mapGraphicContent.includes("resolveRouteTrajectory") || mapGraphicContent.includes("interpolateGreatCircle"),
    "MapGraphic.tsx must compute route trajectories or Great-Circle curves"
  );
});

test("verifies decomposeCompositeJourney breaks state trips into multi-leg stages", async () => {
  const { decomposeCompositeJourney } = await vite.ssrLoadModule("/lib/rewind/travel.ts");
  assert.equal(typeof decomposeCompositeJourney, "function");

  const prevEvent = {
    id: "evt-dc-whitehouse",
    slug: "whitehouse-departure",
    eventName: "Departure from White House",
    startDate: "2019-06-03",
    city: "Washington",
    country: "United States",
    venueName: "The White House",
    latitude: 38.8977,
    longitude: -77.0365,
    summary: "Presidential departure for UK State Visit.",
    verificationStatus: "verified",
    sourceIds: ["src-1"],
    participants: [],
  };

  const currEvent = {
    id: "evt-london-buckingham",
    slug: "buckingham-state-banquet",
    eventName: "State Visit Arrival and Banquet",
    startDate: "2019-06-03",
    city: "London",
    country: "United Kingdom",
    venueName: "Buckingham Palace",
    latitude: 51.5014,
    longitude: -0.1419,
    summary: "Presidential motorcade arrival for state banquet at Buckingham Palace following Air Force One flight.",
    verificationStatus: "verified",
    sourceIds: ["src-2"],
    participants: [],
  };

  const legs = decomposeCompositeJourney(currEvent, prevEvent);
  assert.ok(legs.length >= 3, "State trip must decompose into at least 3 sub-travel legs");
  assert.equal(legs[0].transportMode, "car", "Leg 1 must be ground motorcade to airfield");
  assert.ok(legs[1].transportMode.includes("flight") || legs[1].transportMode.includes("air-force-one"), "Leg 2 must be air transit");
  assert.equal(legs[2].transportMode, "car", "Leg 3 must be arrival diplomatic motorcade");
});

test("verifies resolveActiveStay finds accommodation within date window", async () => {
  const { resolveActiveStay } = await vite.ssrLoadModule("/lib/rewind/travel.ts");
  assert.equal(typeof resolveActiveStay, "function");

  const stays = [
    {
      id: "stay-1",
      personId: "p-potus",
      venueName: "Winfield House (US Ambassador Residence)",
      stayType: "diplomatic_guest_house",
      city: "London",
      country: "United Kingdom",
      latitude: 51.5312,
      longitude: -0.1623,
      startDate: "2019-06-03",
      endDate: "2019-06-05",
      isBaseOfOperations: true,
      sourceIds: ["src-stay-1"],
    },
  ];

  const active = resolveActiveStay(stays, "2019-06-04");
  assert.ok(active, "Must resolve active stay on 2019-06-04");
  assert.equal(active.venueName, "Winfield House (US Ambassador Residence)");

  const outside = resolveActiveStay(stays, "2019-06-10");
  assert.equal(outside, null, "Must return null for date outside stay window");
});

test("verifies PersonTimeline.tsx renders 24-hr transit clocks, journey legs, and evidence basis pills", () => {
  const timelineContent = fs.readFileSync(path.join(root, "components/rewind/PersonTimeline.tsx"), "utf-8");
  assert.ok(
    timelineContent.includes("journey-chrono-badge") || timelineContent.includes("departureClock"),
    "PersonTimeline.tsx must display 24-hr transit departure and arrival clocks"
  );
  assert.ok(
    timelineContent.includes("journey-inferences-row") || timelineContent.includes("inference-pill"),
    "PersonTimeline.tsx must render evidentiary inferences pills"
  );
  assert.ok(
    timelineContent.includes("journey-legs-block") || timelineContent.includes("journeyLegs"),
    "PersonTimeline.tsx must render multi-leg journey breakdown"
  );
  assert.ok(
    timelineContent.includes("road-telemetry") || timelineContent.includes("MOTOR VEHICLE & CONVOY"),
    "PersonTimeline.tsx must render motor vehicle and convoy telemetry"
  );
});

test("verifies computeTrajectoryFromCoordinates and resolveRouteTrajectory follow exact coordinate plots", async () => {
  const { computeTrajectoryFromCoordinates, resolveRouteTrajectory } = await vite.ssrLoadModule("/lib/rewind/travel.ts");
  assert.equal(typeof computeTrajectoryFromCoordinates, "function");
  assert.equal(typeof resolveRouteTrajectory, "function");

  // Multi-point ADS-B flight radar or road GPS track: Paris -> Brussels -> Amsterdam
  const multiPlot = [
    [2.3522, 48.8566], // Paris
    [4.3517, 50.8503], // Brussels
    [4.9041, 52.3676], // Amsterdam
  ];

  const traj = computeTrajectoryFromCoordinates(multiPlot, 30);
  assert.ok(traj.length >= 30, "Trajectory must contain at least 30 samples");
  assert.ok(Math.abs(traj[0].lng - 2.3522) < 0.001, "First point must match Paris");
  assert.ok(Math.abs(traj[traj.length - 1].lng - 4.9041) < 0.001, "Last point must match Amsterdam");

  // Event with explicit roadDetails routeCoordinates
  const roadEvent = {
    id: "evt-convoy-paris-brussels",
    slug: "diplomatic-convoy",
    eventName: "State Diplomatic Convoy",
    startDate: "2020-09-12",
    city: "Brussels",
    country: "Belgium",
    summary: "Diplomatic armored motorcade across border.",
    verificationStatus: "verified",
    sourceIds: ["src-convoy"],
    participants: [],
    roadDetails: {
      make: "Cadillac",
      model: "One ('The Beast')",
      licensePlate: "800-002",
      vehicleClassification: "head_of_state_limousine",
      occupantStatus: "driven_passenger",
      armoringLevel: "B7 / VR10 Ballistic Armor",
      routeCoordinates: multiPlot,
    },
  };

  const resolved = resolveRouteTrajectory(roadEvent);
  assert.ok(resolved.length >= 2, "Must resolve trajectory from roadDetails.routeCoordinates");
  assert.ok(Math.abs(resolved[0].lat - 48.8566) < 0.01, "Starts in Paris latitude");
  assert.ok(Math.abs(resolved[resolved.length - 1].lat - 52.3676) < 0.01, "Ends in Amsterdam latitude");
});

test("verifies forensic coordinate integrity, unknown location nulls, and gazetteer resolution", async () => {
  const { events } = await vite.ssrLoadModule("/archive/legacy-data/rewind.ts");
  const { resolveGazetteerCoordinates } = await vite.ssrLoadModule("/lib/rewind/places.ts");

  assert.ok(Array.isArray(events) && events.length > 0, "Must have indexed events");
  
  // Events with established locations must have valid WGS-84 coordinates
  const established = events.filter((e) => e.city !== "Location not established");
  const missingEstablished = established.filter((e) => e.latitude == null || e.longitude == null);
  assert.equal(
    missingEstablished.length,
    0,
    `Every historical event with established city must have valid WGS-84 coordinates, found ${missingEstablished.length} missing`
  );

  // Events with 'Location not established' must NOT fabricate coordinates (must be null and precision 'unknown')
  const unknownLocationEvents = events.filter((e) => e.city === "Location not established");
  assert.ok(unknownLocationEvents.length > 0, "Must have records with Location not established");
  for (const unk of unknownLocationEvents) {
    assert.equal(unk.latitude, null, `Event '${unk.slug}' with Location not established must have null latitude`);
    assert.equal(unk.longitude, null, `Event '${unk.slug}' with Location not established must have null longitude`);
    assert.equal(unk.locationPrecision, "unknown", `Event '${unk.slug}' must have locationPrecision='unknown'`);
    assert.equal(unk.country, "Unknown", `Event '${unk.slug}' must have country='Unknown'`);
  }

  // Verify gazetteer resolution for known places
  const pmoCoords = resolveGazetteerCoordinates({ venue: "Prime Minister’s Office", city: "Jerusalem" });
  assert.ok(pmoCoords && typeof pmoCoords.latitude === "number" && typeof pmoCoords.longitude === "number");
  assert.equal(pmoCoords.source, "venue");
  assert.ok(Math.abs(pmoCoords.latitude - 31.7818) < 0.01);

  const unCoords = resolveGazetteerCoordinates({ venue: "United Nations Headquarters", city: "New York" });
  assert.ok(unCoords && Math.abs(unCoords.latitude - 40.7499) < 0.01);
  assert.equal(unCoords.source, "venue");

  const maralagoCoords = resolveGazetteerCoordinates({ venue: "Mar-a-Lago Club", city: "Palm Beach" });
  assert.ok(maralagoCoords && Math.abs(maralagoCoords.latitude - 26.6771) < 0.01);
  assert.equal(maralagoCoords.source, "venue");

  // Verify prototype safety (should return null, never throw or return prototype methods)
  const protoCoords = resolveGazetteerCoordinates({ venue: "toString", city: "valueOf" });
  assert.equal(protoCoords, null, "Must safely return null for inherited Object prototype keys");

  // Verify type resilience with non-string inputs
  const invalidCoords = resolveGazetteerCoordinates({ venue: 123, city: null });
  assert.equal(invalidCoords, null, "Must handle non-string inputs safely");
});

test("verifies vehicle vector icon assets exist for all transit modes", () => {
  const modes = ["airplane", "helicopter", "car", "police-convoy", "motorcade", "train", "boat", "bus", "walking"];
  for (const mode of modes) {
    const assetPath = path.join(root, `public/assets/vehicles/${mode}.svg`);
    assert.ok(fs.existsSync(assetPath), `Vehicle SVG asset for mode '${mode}' must exist at ${assetPath}`);
    const svgContent = fs.readFileSync(assetPath, "utf-8");
    assert.ok(svgContent.includes("<svg") && svgContent.includes("</svg>"), `Vehicle asset '${mode}.svg' must be valid SVG`);
  }
});

test("verifies PersonTimeline.tsx and MapGraphic.tsx layout non-collision and Base of Operations badge", () => {
  const timelineContent = fs.readFileSync(path.join(root, "components/rewind/PersonTimeline.tsx"), "utf-8");
  const mapContent = fs.readFileSync(path.join(root, "components/rewind/MapGraphic.tsx"), "utf-8");
  const cssContent = fs.readFileSync(path.join(root, "app/globals.css"), "utf-8");

  // Both badge conditions must be satisfied in PersonTimeline.tsx
  assert.ok(
    timelineContent.includes("base-of-operations-pill"),
    "PersonTimeline.tsx must include base-of-operations-pill class"
  );
  assert.ok(
    timelineContent.includes("activeStay"),
    "PersonTimeline.tsx must check activeStay state"
  );
  assert.ok(
    timelineContent.includes("aria-hidden=\"true\">🏨"),
    "PersonTimeline.tsx must wrap emoji in aria-hidden for screen reader accessibility"
  );
  assert.ok(
    timelineContent.includes("allEvents={ordered}"),
    "PersonTimeline.tsx must pass allEvents to MapGraphic for full lifetime pin rendering"
  );
  assert.ok(
    timelineContent.includes("events={visibleEvents}"),
    "PersonTimeline.tsx must pass memoized visibleEvents to MapGraphic"
  );
  assert.ok(
    mapContent.includes("map-floating-controls"),
    "MapGraphic.tsx must render dedicated floating vertical navigation controls"
  );
  assert.ok(
    mapContent.includes("failedVehicleAssets"),
    "MapGraphic.tsx must cache failed vehicle assets to avoid duplicate onerror handlers"
  );
  assert.ok(
    mapContent.includes("visitedIdSet"),
    "MapGraphic.tsx must use Set for O(1) visited event lookup"
  );
  assert.ok(
    cssContent.includes(".map-floating-controls"),
    "globals.css must define floating vertical navigation controls"
  );
  assert.ok(
    cssContent.includes(".map-stage-label .base-of-operations-pill"),
    "globals.css must define Base of Operations styling with high specificity"
  );
  assert.ok(
    cssContent.includes(".webgl-map-marker.forensic-pin:focus-visible .pin-visual-wrapper"),
    "globals.css must define high-contrast focus-visible ring for keyboard accessibility on forensic pins"
  );
});


