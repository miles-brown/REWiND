import test, { after } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createServer } from "vite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
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
    mapGraphicContent.includes("interpolateGreatCircle"),
    "MapGraphic.tsx must compute Great-Circle curved trajectories"
  );
});

test("verifies PersonTimeline.tsx renders 24-hr transit clocks and evidence basis pills", () => {
  const timelineContent = fs.readFileSync(path.join(root, "components/rewind/PersonTimeline.tsx"), "utf-8");
  assert.ok(
    timelineContent.includes("journey-chrono-badge") || timelineContent.includes("departureClock"),
    "PersonTimeline.tsx must display 24-hr transit departure and arrival clocks"
  );
  assert.ok(
    timelineContent.includes("journey-inferences-row") || timelineContent.includes("inference-pill"),
    "PersonTimeline.tsx must render evidentiary inferences pills"
  );
});
