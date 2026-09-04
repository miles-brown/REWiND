import assert from "node:assert/strict";
import test, { after } from "node:test";
import { fileURLToPath } from "node:url";
import fs from "node:fs";
import path from "node:path";
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
  await vite.close();
});

test("verifies EVENT_MODEL_V2.md specification document exists and covers core architectural tenets", () => {
  const specPath = path.join(root, "docs/architecture/EVENT_MODEL_V2.md");
  assert.ok(fs.existsSync(specPath), "docs/architecture/EVENT_MODEL_V2.md must exist");
  const content = fs.readFileSync(specPath, "utf-8");

  assert.ok(
    content.includes("An event exists independently of any one person"),
    "Must articulate the central event-first thesis"
  );
  assert.ok(
    content.includes("Field Mapping Matrix"),
    "Must include the complete Field Mapping Matrix"
  );
  assert.ok(
    content.includes("Never claim greater geographic precision"),
    "Must include the golden geospatial precision rule"
  );
  assert.ok(
    content.includes("TriState"),
    "Must specify the tri-state factual indicators model"
  );
});

test("verifies db/schema-v2.ts exports all required normalized relational tables", async () => {
  const mod = await vite.ssrLoadModule("/db/schema-v2.ts");
  const expectedTables = [
    "eventSeries",
    "eventTitles",
    "addresses",
    "venues",
    "venueAreas",
    "eventPeople",
    "eventPersonLocations",
    "eventPersonLocationSources",
    "eventPersonOrganisations",
    "eventBroadcasts",
    "eventTopics",
    "eventLocationSequences",
  ];

  for (const table of expectedTables) {
    assert.ok(mod[table], `db/schema-v2.ts must export ${table}`);
  }
});

test("verifies all existing 206 historical events upgrade cleanly to Event Model v2", async () => {
  const { events } = await vite.ssrLoadModule("/data/rewind.ts");
  const { upgradeLegacyToV2, projectV2ToLegacy } = await vite.ssrLoadModule(
    "/lib/adapters/event-v2-adapter.ts"
  );

  assert.equal(events.length, 206, "Dataset must contain all 206 seed records");

  for (const legacy of events) {
    const v2 = upgradeLegacyToV2(legacy);

    // Verify core identifiers
    assert.equal(v2.id, legacy.id);
    assert.equal(v2.slug, legacy.slug);
    assert.ok(v2.canonicalTitle.length > 5, `Event ${legacy.id} must have a valid canonicalTitle`);
    assert.ok(
      !v2.canonicalTitle.startsWith("Addresses the General Assembly on the question of Palestine"),
      `Event ${legacy.id} title must be normalized`
    );

    // Verify people & locations
    assert.equal(v2.people.length, legacy.participants.length);
    if (legacy.latitude != null && legacy.longitude != null) {
      assert.ok(v2.people[0].locations.length > 0, `Participant must have a presence location record`);
      assert.equal(v2.people[0].locations[0].latitude, legacy.latitude);
      assert.equal(v2.people[0].locations[0].longitude, legacy.longitude);
      assert.equal(v2.locationType, "fixed");
    }

    // Verify Factual Flags
    assert.ok(["yes", "no", "unknown"].includes(v2.factualFlags.physicalAttendanceConfirmed));
    assert.ok(["yes", "no", "unknown"].includes(v2.factualFlags.televised));
    assert.equal(typeof v2.factualFlags.exactStartTimeKnown, "boolean");

    // Verify Round-Trip Projection Fidelity
    const projected = projectV2ToLegacy(v2);
    assert.equal(projected.id, legacy.id);
    assert.equal(projected.startDate, legacy.startDate);
    assert.equal(projected.city, legacy.city);
    assert.equal(projected.country, legacy.country);
    assert.equal(projected.latitude, legacy.latitude);
    assert.equal(projected.longitude, legacy.longitude);
    assert.equal(projected.verificationStatus, legacy.verificationStatus);
    assert.equal(projected.confidence, legacy.confidence);
    assert.deepEqual(projected.categories, legacy.categories);
    assert.deepEqual(projected.eventTypes, legacy.eventTypes);
    assert.equal(projected.platform, legacy.platform);
    assert.equal(projected.address, legacy.address);
    assert.equal(projected.scope, legacy.scope);
    assert.deepEqual(projected.medium, legacy.medium);
    assert.deepEqual(projected.quotes, legacy.quotes);
    assert.deepEqual(projected.media, legacy.media);
    assert.deepEqual(projected.provenance, legacy.provenance);
    assert.deepEqual(projected.conflictingClaims, legacy.conflictingClaims);
  }
});

test("verifies canonical title derivation for person-centric historical events", async () => {
  const { deriveCanonicalTitle } = await vite.ssrLoadModule("/lib/adapters/event-v2-adapter.ts");

  const unCredentials = deriveCanonicalTitle(
    "Presents credentials as Israel's UN Representative",
    "United Nations Headquarters"
  );
  assert.equal(
    unCredentials,
    "Presentation of Credentials — Permanent Representative of Israel to the United Nations"
  );

  const schneerson = deriveCanonicalTitle(
    "First documented meeting with Menachem Mendel Schneerson",
    "770 Eastern Parkway"
  );
  assert.equal(
    schneerson,
    "Benjamin Netanyahu and Menachem Mendel Schneerson — Meeting at 770 Eastern Parkway"
  );

  const unPalestine = deriveCanonicalTitle(
    "Addresses the General Assembly on the question of Palestine",
    "United Nations Headquarters"
  );
  assert.equal(
    unPalestine,
    "United Nations General Assembly — Question of Palestine"
  );
});

test("verifies EventPersonSchema and EventPersonOrganisationSchema preserve representations", async () => {
  const { EventPersonSchema } = await vite.ssrLoadModule("/lib/models/event-v2.ts");

  const personWithRep = {
    id: "ep-test-1",
    eventId: "evt-test",
    personId: "p-netanyahu",
    involvementType: "speaker",
    roleLabel: "Permanent Representative",
    attendanceMode: "physical",
    presenceConfidence: "confirmed",
    roleConfidence: "confirmed",
    representations: [
      {
        id: "rep-1",
        eventPersonId: "ep-test-1",
        organisationId: "org-state-of-israel",
        relationshipType: "represents",
        roleLabel: "Permanent Representative of Israel",
        confidence: "confirmed",
      },
    ],
  };

  const parsed = EventPersonSchema.parse(personWithRep);
  assert.ok(parsed.representations, "Parsed EventPerson must retain representations");
  assert.equal(parsed.representations.length, 1);
  assert.equal(parsed.representations[0].organisationId, "org-state-of-israel");
  assert.equal(parsed.representations[0].relationshipType, "represents");
});

test("verifies EventPersonLocationSchema enforces geographic coordinate bounds [-90, 90] and [-180, 180]", async () => {
  const { EventPersonLocationSchema } = await vite.ssrLoadModule("/lib/models/event-v2.ts");

  const validLocation = {
    id: "epl-valid",
    eventPersonId: "ep-1",
    latitude: 31.7683,
    longitude: 35.2137,
    coordinatePrecision: "building",
    isPrincipalLocation: true,
    locationBasis: "archival-record",
    confidence: "confirmed",
    sourceIds: ["src-1"],
    publicVisibility: "public-exact",
  };
  assert.ok(EventPersonLocationSchema.safeParse(validLocation).success);

  // Rejects latitude > 90
  const invalidLat = { ...validLocation, latitude: 91 };
  assert.equal(EventPersonLocationSchema.safeParse(invalidLat).success, false);

  // Rejects latitude < -90
  const invalidLatMin = { ...validLocation, latitude: -90.1 };
  assert.equal(EventPersonLocationSchema.safeParse(invalidLatMin).success, false);

  // Rejects longitude > 180
  const invalidLng = { ...validLocation, longitude: 180.1 };
  assert.equal(EventPersonLocationSchema.safeParse(invalidLng).success, false);

  // Rejects longitude < -180
  const invalidLngMin = { ...validLocation, longitude: -181 };
  assert.equal(EventPersonLocationSchema.safeParse(invalidLngMin).success, false);
});

test("verifies locationPrecision coarse mapping for city and country maintains coarse precision, non-exact visibility, and non-public exact flag", async () => {
  const { upgradeLegacyToV2 } = await vite.ssrLoadModule("/lib/adapters/event-v2-adapter.ts");

  const baseLegacy = {
    id: "evt-test-city",
    slug: "test-city",
    eventName: "Test Event in Geneva",
    summary: "Test summary",
    categories: ["Diplomacy"],
    eventTypes: ["Conference"],
    startDate: "1985-05-10",
    endDate: null,
    localStartTime: null,
    localEndTime: null,
    timezone: "Europe/Geneva",
    datePrecision: "exact",
    timePrecision: "approximate",
    platform: null,
    venueName: null,
    address: null,
    city: "Geneva",
    region: null,
    country: "Switzerland",
    latitude: 46.2044,
    longitude: 6.1432,
    locationPrecision: "city",
    participants: [{ personId: "p-1", name: "Speaker", role: "Speaker", presenceConfidence: "confirmed" }],
    organisations: [],
    notes: null,
    scope: "diplomatic",
    medium: ["official-record"],
    confidence: "confirmed",
    verificationStatus: "verified",
    sourceIds: ["src-un-1"],
    quotes: [],
    media: [],
    provenance: ["Test"],
    conflictingClaims: [],
    reviewedAt: "2026-09-01T00:00:00Z",
  };

  const cityV2 = upgradeLegacyToV2(baseLegacy);
  assert.equal(cityV2.locationPrecision, "city");
  assert.equal(cityV2.people[0].locations[0].coordinatePrecision, "city");
  assert.equal(cityV2.people[0].locations[0].publicVisibility, "public-city");
  assert.equal(cityV2.editorialControls.exactLocationPublic, false);

  const countryV2 = upgradeLegacyToV2({ ...baseLegacy, id: "evt-test-country", locationPrecision: "country" });
  assert.equal(countryV2.locationPrecision, "country");
  assert.equal(countryV2.people[0].locations[0].coordinatePrecision, "country");
  assert.equal(countryV2.people[0].locations[0].publicVisibility, "public-city");
  assert.equal(countryV2.editorialControls.exactLocationPublic, false);
});

test("verifies inferInvolvementType returns distinct InvolvementType for each supported role", async () => {
  const { inferInvolvementType } = await vite.ssrLoadModule("/lib/adapters/event-v2-adapter.ts");

  assert.equal(inferInvolvementType("Host of the Gala"), "host");
  assert.equal(inferInvolvementType("Interviewer on BBC Newsnight"), "interviewer");
  assert.equal(inferInvolvementType("Interviewee on Meet the Press"), "interviewee");
  assert.equal(inferInvolvementType("Special Guest Speaker"), "speaker");
  assert.equal(inferInvolvementType("Special Guest"), "guest");
  assert.equal(inferInvolvementType("Panel Moderator"), "moderator");
  assert.equal(inferInvolvementType("Panelist on Middle East Policy"), "panelist");
  assert.equal(inferInvolvementType("Witness to Signing"), "witness");
  assert.equal(inferInvolvementType("Conference Attendee"), "attendee");
  assert.equal(inferInvolvementType("Session Chair"), "chair");
  assert.equal(inferInvolvementType("Official Delegate"), "delegate");
  assert.equal(inferInvolvementType("Security Detail"), "security");
});

test("verifies EventPersonLocation normalizes and persists location-to-source relations", async () => {
  const { upgradeLegacyToV2 } = await vite.ssrLoadModule("/lib/adapters/event-v2-adapter.ts");
  const { events } = await vite.ssrLoadModule("/data/rewind.ts");

  const sample = events.find((e) => e.latitude != null && e.sourceIds.length > 0);
  assert.ok(sample, "Sample event with coordinates and sourceIds must exist");

  const v2 = upgradeLegacyToV2(sample);
  const loc = v2.people[0].locations[0];
  assert.ok(loc.sources, "Location must contain normalized sources relation");
  assert.equal(loc.sources.length, sample.sourceIds.length);
  assert.equal(loc.sources[0].sourceId, sample.sourceIds[0]);
  assert.equal(loc.sources[0].eventPersonLocationId, loc.id);
});

test("verifies participants with empty personId receive unique namespaced keys and non-colliding location IDs", async () => {
  const { upgradeLegacyToV2 } = await vite.ssrLoadModule("/lib/adapters/event-v2-adapter.ts");

  const legacyWithEmptyPersonIds = {
    id: "evt-empty-person-test",
    slug: "empty-person-test",
    eventName: "Bilateral Diplomatic Briefing",
    summary: "Briefing with anonymous delegates",
    categories: ["Diplomacy"],
    eventTypes: ["Meeting"],
    startDate: "1990-04-12",
    endDate: null,
    localStartTime: null,
    localEndTime: null,
    timezone: "America/New_York",
    datePrecision: "exact",
    timePrecision: "approximate",
    platform: null,
    venueName: "UN Headquarters",
    address: "New York, NY",
    city: "New York",
    region: "NY",
    country: "United States",
    latitude: 40.7499,
    longitude: -73.9674,
    locationPrecision: "venue",
    participants: [
      { personId: "", name: "Anonymous Delegate A", role: "delegate", presenceConfidence: "confirmed" },
      { personId: "", name: "Anonymous Delegate B", role: "attendee", presenceConfidence: "confirmed" },
      { personId: "participant-0", name: "Known Delegate Named participant-0", role: "speaker", presenceConfidence: "confirmed" },
    ],
    organisations: [],
    notes: null,
    scope: "diplomatic",
    medium: ["official-record"],
    confidence: "confirmed",
    verificationStatus: "verified",
    sourceIds: ["src-1", "src-2"],
    quotes: [],
    media: [],
    provenance: ["UN Archives"],
    conflictingClaims: [],
    reviewedAt: "2026-09-01T00:00:00Z",
  };

  const v2 = upgradeLegacyToV2(legacyWithEmptyPersonIds);
  assert.equal(v2.people.length, 3);

  const [p0, p1, p2] = v2.people;
  assert.notEqual(p0.id, p1.id, "Participant IDs must be distinct");
  assert.notEqual(p0.id, p2.id, "Fallback ID must not collide with explicit ID matching fallback pattern");
  assert.notEqual(p1.id, p2.id, "Participant IDs must be distinct");
  assert.equal(p0.id, "ep-evt-empty-person-test-fallback-0");
  assert.equal(p1.id, "ep-evt-empty-person-test-fallback-1");
  assert.equal(p2.id, "ep-evt-empty-person-test-p-participant-0");

  assert.equal(p0.locations.length, 1);
  assert.equal(p1.locations.length, 1);
  assert.equal(p2.locations.length, 1);

  const loc0 = p0.locations[0];
  const loc1 = p1.locations[0];
  const loc2 = p2.locations[0];
  assert.notEqual(loc0.id, loc1.id, "Location IDs must be distinct");
  assert.notEqual(loc0.id, loc2.id, "Location IDs must not collide");
  assert.equal(loc0.id, "epl-evt-empty-person-test-fallback-0-0");
  assert.equal(loc1.id, "epl-evt-empty-person-test-fallback-1-0");
  assert.equal(loc2.id, "epl-evt-empty-person-test-p-participant-0-0");
  assert.equal(loc0.eventPersonId, p0.id);
  assert.equal(loc1.eventPersonId, p1.id);
  assert.equal(loc2.eventPersonId, p2.id);

  // Check location sources
  assert.equal(loc0.sources[0].eventPersonLocationId, loc0.id);
  assert.equal(loc1.sources[0].eventPersonLocationId, loc1.id);
  assert.equal(loc2.sources[0].eventPersonLocationId, loc2.id);
  assert.notEqual(loc0.sources[0].id, loc1.sources[0].id, "Location source IDs must be distinct");
  assert.notEqual(loc0.sources[0].id, loc2.sources[0].id, "Location source IDs must be distinct");
});

test("defensively handles null and undefined array fields in legacy records without crashing", async () => {
  const { upgradeLegacyToV2, projectV2ToLegacy } = await vite.ssrLoadModule("/lib/adapters/event-v2-adapter.ts");

  const dirtyLegacy = {
    id: "evt-dirty-data",
    slug: "dirty-data",
    eventName: "Conference on Middle East Peace",
    summary: "Diplomatic conference summary",
    startDate: "1991-10-30",
    city: "Madrid",
    country: "Spain",
    verificationStatus: "verified",
    // Intentionally pass undefined or null fields that might occur in unclean legacy migrations
    eventTypes: undefined,
    categories: null,
    medium: undefined,
    organisations: null,
    sourceIds: undefined,
    quotes: null,
    media: undefined,
    provenance: null,
    conflictingClaims: undefined,
    participants: undefined,
  };

  // Must not throw TypeError on nullish/undefined fields
  const v2 = upgradeLegacyToV2(dirtyLegacy);
  assert.ok(v2);
  assert.ok(Array.isArray(v2.sourceIds));
  assert.ok(Array.isArray(v2.people));
  assert.ok(Array.isArray(v2.organisations));
  assert.ok(Array.isArray(v2.topics));
  assert.ok(Array.isArray(v2.compatibilityPayload.eventTypes));
  assert.ok(Array.isArray(v2.compatibilityPayload.medium));

  // Must project back to legacy cleanly with all required array fields populated
  const projected = projectV2ToLegacy(v2);
  assert.ok(projected);
  assert.ok(Array.isArray(projected.sourceIds));
  assert.ok(Array.isArray(projected.categories));
  assert.ok(Array.isArray(projected.eventTypes));
  assert.ok(Array.isArray(projected.participants));
  assert.ok(Array.isArray(projected.organisations));
  assert.ok(Array.isArray(projected.medium));
  assert.ok(Array.isArray(projected.quotes));
  assert.ok(Array.isArray(projected.conflictingClaims));
  assert.equal(projected.confidence, "confirmed");
  assert.equal(projected.datePrecision, "exact");
});

