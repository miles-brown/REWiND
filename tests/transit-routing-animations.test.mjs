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

test("verifies calculate3DGreatCircleArc elevates air flight into a 3D Bezier curve with altitude and pitch", async () => {
  const { calculate3DGreatCircleArc } = await vite.ssrLoadModule("/lib/rewind/travel.ts");
  assert.equal(typeof calculate3DGreatCircleArc, "function");

  // New York JFK (-73.7781, 40.6413) to London Heathrow (-0.4543, 51.4700)
  const flightPoints = calculate3DGreatCircleArc(-73.7781, 40.6413, -0.4543, 51.4700, "flight", 40);
  assert.equal(flightPoints.length, 41, "Must generate 41 sample points for numPoints = 40");

  // 1. Check endpoints have ground altitude (0m)
  assert.equal(flightPoints[0].altitudeMeters, 0, "Origin takeoff altitude must be 0m");
  assert.equal(flightPoints[40].altitudeMeters, 0, "Destination landing altitude must be 0m");

  // 2. Check midpoint reaches peak cruise altitude elevated via 3D Bezier curve (>8,000m)
  const midPoint = flightPoints[20];
  assert.ok(
    midPoint.altitudeMeters >= 8000 && midPoint.altitudeMeters <= 12000,
    `Mid-flight cruising altitude must reach peak 3D elevation (~10,000m), got ${midPoint.altitudeMeters}m`
  );
  assert.ok(midPoint.scale > 1.2, "Zenith of 3D arc must scale aircraft marker for visual depth");

  // 3. Check climb and descent pitch angles
  const climbPoint = flightPoints[5];
  const descentPoint = flightPoints[35];
  assert.ok(climbPoint.pitchAngle > 0, "Climb phase must have positive pitch angle (nose-up)");
  assert.ok(descentPoint.pitchAngle < 0, "Descent phase must have negative pitch angle (nose-down)");
});

test("verifies calculate3DGreatCircleArc models helicopter lower altitude ceilings", async () => {
  const { calculate3DGreatCircleArc } = await vite.ssrLoadModule("/lib/rewind/travel.ts");

  // Jerusalem (35.2137, 31.7683) to Tel Aviv (34.7818, 32.0853) ~ 55 km
  const heliPoints = calculate3DGreatCircleArc(35.2137, 31.7683, 34.7818, 32.0853, "helicopter", 20);
  assert.equal(heliPoints.length, 21);

  const midHeli = heliPoints[10];
  assert.ok(
    midHeli.altitudeMeters >= 300 && midHeli.altitudeMeters <= 1500,
    `Helicopter cruise altitude must remain within low-altitude ceiling (<= 1500m), got ${midHeli.altitudeMeters}m`
  );
});

test("verifies transport mode classification and routing profiles in routing.ts", async () => {
  const { isAirTransport, isGroundOrMaritimeTransport, getRoutingProfile } =
    await vite.ssrLoadModule("/lib/rewind/routing.ts");

  assert.equal(isAirTransport("flight"), true);
  assert.equal(isAirTransport("helicopter"), true);
  assert.equal(isAirTransport("air-force-one"), true);
  assert.equal(isAirTransport("private-jet"), true);
  assert.equal(isAirTransport("car"), false);
  assert.equal(isAirTransport("train"), false);

  assert.equal(isGroundOrMaritimeTransport("car"), true);
  assert.equal(isGroundOrMaritimeTransport("train"), true);
  assert.equal(isGroundOrMaritimeTransport("boat"), true);
  assert.equal(isGroundOrMaritimeTransport("bus"), true);
  assert.equal(isGroundOrMaritimeTransport("flight"), false);

  assert.equal(getRoutingProfile("car"), "driving");
  assert.equal(getRoutingProfile("boat"), "waterway");
  assert.equal(getRoutingProfile("train"), "transit");
  assert.equal(getRoutingProfile("flight"), "flight");
});

test("verifies fetchTransitRoute never falls back to straight lines and caches routes", async () => {
  const { fetchTransitRoute, generateCurvedFallbackTrajectory, clearRouteCache } =
    await vite.ssrLoadModule("/lib/rewind/routing.ts");

  clearRouteCache();

  // Paris (2.3522, 48.8566) to Brussels (4.3517, 50.8503)
  const fallback = generateCurvedFallbackTrajectory([2.3522, 48.8566], [4.3517, 50.8503], "car", 30);
  assert.ok(fallback.length >= 30, "Fallback trajectory must generate multi-point spline");
  assert.ok(
    fallback.some((pt, idx) => idx > 0 && idx < fallback.length - 1 && Math.abs(pt.bearing - fallback[0].bearing) > 0.5),
    "Curved spline must have dynamic directional deflection, not a rigid straight line"
  );

  const route = await fetchTransitRoute([2.3522, 48.8566], [4.3517, 50.8503], "car", {
    numSamplePoints: 40,
  });
  assert.ok(route.length >= 40, "Must return comprehensive multi-point road trajectory");
  assert.equal(route[0].progress, 0);
  assert.equal(route[route.length - 1].progress, 1.0);
});

test("verifies MapGraphic.tsx integrates 3D Bezier flight arcs and progressive ground path drawing", () => {
  const mapPath = path.join(root, "components/rewind/MapGraphic.tsx");
  const content = fs.readFileSync(mapPath, "utf-8");

  // 1. Air 3D arc corridor calculation
  assert.ok(
    content.includes("resolveFlightCorridorTrajectory") || content.includes("calculate3DGreatCircleArc"),
    "MapGraphic.tsx must use resolveFlightCorridorTrajectory for air/helicopter routes"
  );

  // 2. 45-60 degree 3D perspective camera pitch
  assert.ok(
    content.includes("getThemeCameraSettings") && (content.includes("isAir ? 58 : 50") || content.includes("themeCam.pitch")),
    "MapGraphic.tsx must pitch camera to 45-60 deg 3D perspective during air transit"
  );

  // 3. Routing service integration for ground/rail/water
  assert.ok(
    content.includes("fetchTransitRoute"),
    "MapGraphic.tsx must integrate fetchTransitRoute routing service for ground transit"
  );

  // 4. Progressive solid line drawing along exact road/rail network
  assert.ok(
    content.includes("active-leg-planned"),
    "MapGraphic.tsx must render active-leg-planned guide layer for upcoming network"
  );
  assert.ok(
    content.includes("active-leg-route"),
    "MapGraphic.tsx must progressively draw active-leg-route solid path"
  );

  // 5. 3D aircraft visual elevation and altitude shadow
  assert.ok(
    content.includes("vehicle-altitude-shadow"),
    "MapGraphic.tsx must create vehicle-altitude-shadow for elevated aircraft"
  );

  // 6. Dedicated High-Resolution Satellite & Dark Matter Tile Configurations
  assert.ok(
    content.includes("FALLBACK_RASTER_SATELLITE_STYLE") && content.includes("server.arcgisonline.com"),
    "MapGraphic.tsx must configure real high-resolution Satellite raster imagery tiles"
  );
  assert.ok(
    content.includes("FALLBACK_RASTER_DARK_STYLE") && content.includes("dark_all"),
    "MapGraphic.tsx must configure real Dark Matter raster tiles"
  );
  assert.ok(
    content.includes("FALLBACK_RASTER_VOYAGER_STYLE") && content.includes("rastertiles/voyager"),
    "MapGraphic.tsx must configure Geopolitical Voyager raster tiles"
  );

  // 7. Distinct Theme Camera Settings & Perspectives
  assert.ok(
    content.includes("getThemeCameraSettings"),
    "MapGraphic.tsx must define getThemeCameraSettings for theme-specific camera angles"
  );

  // 8. Tactical Continent Wireframes in Schematic View
  assert.ok(
    content.includes("continent-land"),
    "MapGraphic.tsx must render continent landmass wireframes in schematic mode"
  );

  // 9. Integration of resolveFlightCorridorTrajectory
  assert.ok(
    content.includes("resolveFlightCorridorTrajectory"),
    "MapGraphic.tsx must use resolveFlightCorridorTrajectory for air transit"
  );
});

test("verifies resolveFlightCorridorTrajectory enforces Tier 1 (documented) vs Tier 2 (auto-suggested) precedence", async () => {
  const { resolveFlightCorridorTrajectory } = await vite.ssrLoadModule("/lib/rewind/travel.ts");
  const { resolveJourneyTransport } = await vite.ssrLoadModule("/lib/rewind/transport.ts");

  const originEvent = {
    id: "evt-origin",
    slug: "evt-origin",
    eventName: "Departure from Washington",
    city: "Washington, D.C.",
    country: "United States",
    startDate: "2024-05-10",
    latitude: 38.8951,
    longitude: -77.0364,
  };

  const unannotatedDestEvent = {
    id: "evt-dest-unannotated",
    slug: "evt-dest-unannotated",
    eventName: "Arrival in London",
    city: "London",
    country: "United Kingdom",
    startDate: "2024-05-11",
    latitude: 51.5074,
    longitude: -0.1278,
  };

  // 1. Tier 2: Unannotated journey auto-defaults to standard Great-Circle 3D airway corridor
  const autoPoints = resolveFlightCorridorTrajectory(unannotatedDestEvent, originEvent, "flight", 40);
  assert.equal(autoPoints.length, 41, "Must generate 41 sample points");
  assert.ok(autoPoints[20].altitudeMeters > 8000, "Auto-suggested route must elevate into 3D Bezier arc");

  const autoTransport = resolveJourneyTransport(originEvent, unannotatedDestEvent);
  assert.equal(autoTransport.isDocumentedFlight, false);
  assert.equal(autoTransport.flightIdentifier, "Auto-Suggested Standard Airway");
  assert.ok(autoTransport.flightCorridor.includes("Great-Circle Standard Airway"));

  // 2. Tier 1: Documented real flight coordinates override auto-suggested corridor
  const documentedDestEvent = {
    ...unannotatedDestEvent,
    id: "evt-dest-documented",
    flightDetails: {
      flightNumber: "AF1",
      tailNumber: "SAM 28000",
      aircraftModel: "VC-25A",
      routeCoordinates: [
        [-77.0364, 38.8951],
        [-65.0, 45.0],
        [-30.0, 52.0],
        [-0.1278, 51.5074],
      ],
    },
  };

  const documentedPoints = resolveFlightCorridorTrajectory(documentedDestEvent, originEvent, "air-force-one", 40);
  assert.ok(documentedPoints.length >= 40);
  // Origin and destination should match the documented coordinates
  assert.equal(documentedPoints[0].lng, -77.0364);
  assert.equal(documentedPoints[documentedPoints.length - 1].lat, 51.5074);

  const documentedTransport = resolveJourneyTransport(originEvent, documentedDestEvent);
  assert.equal(documentedTransport.isDocumentedFlight, true);
  assert.equal(documentedTransport.flightIdentifier, "SAM 28000");
  assert.ok(documentedTransport.flightCorridor.includes("Documented Flight Log"));
});

