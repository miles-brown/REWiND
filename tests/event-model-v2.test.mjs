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
