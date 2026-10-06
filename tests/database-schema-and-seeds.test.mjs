import test, { after } from "node:test";
import assert from "node:assert/strict";
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

const { masterPeopleSeed } = await vite.ssrLoadModule("/data/seeds/index.ts");
const { eventsCorpus } = await vite.ssrLoadModule("/data/seeds/events-corpus.ts");
const { sourcesCorpus } = await vite.ssrLoadModule("/data/seeds/sources-corpus.ts");
const { getPeople, getPersonBySlug } = await vite.ssrLoadModule("/lib/rewind/people.ts");
const { getEventsByPerson, getFallbackEventsResult } = await vite.ssrLoadModule("/lib/rewind/events.ts");

const VALID_RELIGION_STATUSES = new Set([
  "self-identified",
  "scholarly-consensus",
  "historical-affiliation-only",
  "not-publicly-stated",
  "disputed",
  "unspecified",
]);

const VALID_CONFIDENCES = new Set([
  "confirmed",
  "strong",
  "moderate",
  "limited",
  "disputed",
]);

test("verifies Canonical Master People Seeds (200+ Figure Corpus)", () => {
  assert.ok(masterPeopleSeed.length >= 200, `Expected >= 200 figures, found ${masterPeopleSeed.length}`);
  const slugSet = new Set(masterPeopleSeed.map((p) => p.slug));
  assert.equal(slugSet.size, masterPeopleSeed.length, "All person slugs must be strictly unique");

  masterPeopleSeed.forEach((p) => {
    assert.ok(p.id, `Person must have id: ${JSON.stringify(p)}`);
    assert.ok(p.slug, `Person ${p.id} must have slug`);
    assert.ok(p.canonicalName, `Person ${p.slug} must have canonicalName`);
    assert.ok(p.displayName, `Person ${p.slug} must have displayName`);
    assert.ok(p.birthDate, `Person ${p.slug} must have birthDate`);
    assert.ok(p.classification, `Person ${p.slug} must have classification`);
    assert.ok(p.summary && p.summary.length >= 20, `Person ${p.slug} must have substantive summary`);
  });
});

test("enforces strict evidentiary standards for sensitive demographics (Religion & Status)", () => {
  masterPeopleSeed.forEach((p) => {
    if (p.religionStatus) {
      assert.ok(
        VALID_RELIGION_STATUSES.has(p.religionStatus),
        `Invalid religionStatus '${p.religionStatus}' on person ${p.slug}`
      );
    }
    if (p.religion && p.religion.trim().length > 0) {
      assert.ok(
        p.religionStatus != null && p.religionStatus !== "not-publicly-stated",
        `Person ${p.slug} with religion '${p.religion}' must specify valid affirmative religionStatus (not 'not-publicly-stated')`
      );
    }
  });
});

test("verifies geographic identity rigor (citizenship vs national identity vs ethnicity)", () => {
  masterPeopleSeed.forEach((p) => {
    if (p.citizenship) {
      assert.ok(Array.isArray(p.citizenship), `citizenship must be array on ${p.slug}`);
      p.citizenship.forEach((c) => assert.equal(typeof c, "string", `citizenship elements must be strings on ${p.slug}`));
    }
    if (p.languages) {
      assert.ok(Array.isArray(p.languages), `languages must be array on ${p.slug}`);
    }
  });
});

test("verifies Historical Events Corpus & Spatial/Evidence Integrity", () => {
  eventsCorpus.forEach((e) => {
    assert.ok(e.id, `Event must have id`);
    assert.ok(e.slug, `Event ${e.id} must have slug`);
    assert.ok(e.eventName, `Event ${e.id} must have eventName`);
    assert.ok(e.startDate, `Event ${e.id} must have startDate`);
    assert.match(e.startDate, /^\d{4}/, `Event ${e.id} startDate must start with 4-digit year`);

    const hasLat = e.latitude != null;
    const hasLng = e.longitude != null;
    assert.equal(hasLat, hasLng, `Event ${e.id} must specify both latitude and longitude or neither`);
    if (hasLat && hasLng) {
      assert.ok(
        Number.isFinite(e.latitude) && e.latitude >= -90 && e.latitude <= 90,
        `Event ${e.id} latitude ${e.latitude} out of bounds [-90, 90]`
      );
      assert.ok(
        Number.isFinite(e.longitude) && e.longitude >= -180 && e.longitude <= 180,
        `Event ${e.id} longitude ${e.longitude} out of bounds [-180, 180]`
      );
    }
  });
});

test("verifies all event sourceIds reference valid catalogued sources", () => {
  const sourceIdSet = new Set(sourcesCorpus.map((s) => s.id));
  eventsCorpus.forEach((e) => {
    assert.ok(Array.isArray(e.sourceIds) && e.sourceIds.length > 0, `Event ${e.id} must have sourceIds`);
    e.sourceIds.forEach((sId) => {
      assert.ok(sourceIdSet.has(sId), `Event ${e.id} references non-existent sourceId '${sId}'`);
    });
  });
});

test("verifies participant presence confidence and co-attendance rosters", () => {
  eventsCorpus.forEach((e) => {
    if (e.participants && e.participants.length > 0) {
      e.participants.forEach((p) => {
        assert.ok(p.personId || p.slug, `Participant in ${e.id} must have person identifier`);
        assert.ok(p.name, `Participant in ${e.id} must have name`);
        if (p.presenceConfidence) {
          assert.ok(
            VALID_CONFIDENCES.has(p.presenceConfidence),
            `Invalid presenceConfidence '${p.presenceConfidence}' on participant ${p.name} in ${e.id}`
          );
        }
      });
    }
  });
});

test("verifies travel corridor events contain valid origin/destination waypoints", () => {
  const travelEvents = eventsCorpus.filter((e) => e.isTravelEvent);
  assert.ok(travelEvents.length > 0, "Should have documented travel corridor events");
  travelEvents.forEach((t) => {
    assert.ok(t.originWaypoint, `Travel event ${t.id} must have originWaypoint`);
    assert.ok(t.destinationWaypoint, `Travel event ${t.id} must have destinationWaypoint`);
    assert.ok(
      Number.isFinite(t.originWaypoint.latitude) &&
      t.originWaypoint.latitude >= -90 && t.originWaypoint.latitude <= 90 &&
      Number.isFinite(t.originWaypoint.longitude) &&
      t.originWaypoint.longitude >= -180 && t.originWaypoint.longitude <= 180,
      `Travel event ${t.id} must have valid numeric origin coordinates`
    );
    assert.ok(
      Number.isFinite(t.destinationWaypoint.latitude) &&
      t.destinationWaypoint.latitude >= -90 && t.destinationWaypoint.latitude <= 90 &&
      Number.isFinite(t.destinationWaypoint.longitude) &&
      t.destinationWaypoint.longitude >= -180 && t.destinationWaypoint.longitude <= 180,
      `Travel event ${t.id} must have valid numeric destination coordinates`
    );
  });
});

test("retrieves full people corpus with fallback hydration", async () => {
  const people = await getPeople();
  assert.ok(people.length >= 200, `Expected >= 200 people, got ${people.length}`);
  const benjamin = await getPersonBySlug("benjamin-netanyahu");
  assert.ok(benjamin, "Expected to retrieve benjamin-netanyahu");
  assert.equal(benjamin.canonicalName, "Benjamin Netanyahu");
  assert.equal(benjamin.religion, "Judaism");
  assert.equal(benjamin.religionStatus, "self-identified");
});

test("queries events by person slug and returns chronologically sorted results", async () => {
  const bEvents = await getEventsByPerson("benjamin-netanyahu");
  assert.ok(bEvents.length > 0, "Expected events for benjamin-netanyahu");
  for (let i = 1; i < bEvents.length; i++) {
    assert.ok(
      bEvents[i - 1].startDate <= bEvents[i].startDate,
      `Events must be sorted chronologically ascending: ${bEvents[i - 1].startDate} <= ${bEvents[i].startDate}`
    );
  }
});

test("supports search filtering across fallback events result", () => {
  const res = getFallbackEventsResult({ search: "Jerusalem" });
  assert.ok(res.data.length > 0, "Search for 'Jerusalem' should return matching events");
  assert.ok(res.count > 0);
});

test("verifies European Reigning and Historic Royal Families Seeds", async () => {
  const charles = await getPersonBySlug("charles-iii");
  assert.ok(charles, "Expected Charles III to be registered");
  assert.equal(charles.canonicalName, "Charles III");
  assert.equal(charles.nationality, "British");
  assert.equal(charles.classification, "monarch-royal");
  assert.ok(charles.achievements && charles.achievements.length >= 4);

  const felipe = await getPersonBySlug("felipe-vi-spain");
  assert.ok(felipe, "Expected King Felipe VI to be registered");
  assert.equal(felipe.nationality, "Spanish");

  const leonor = await getPersonBySlug("leonor-princess-of-asturias");
  assert.ok(leonor, "Expected Princess Leonor to be registered");

  const jeanCount = await getPersonBySlug("jean-count-of-paris");
  assert.ok(jeanCount, "Expected Jean Count of Paris to be registered");

  const napoleon = await getPersonBySlug("jean-christophe-prince-napoleon");
  assert.ok(napoleon, "Expected Prince Jean-Christophe Napoléon to be registered");

  const habsburg = await getPersonBySlug("karl-von-habsburg");
  assert.ok(habsburg, "Expected Karl von Habsburg to be registered");
});

test("verifies Royal Historical Events Corpus with Co-attendance Rosters", () => {
  const coronation = eventsCorpus.find((e) => e.id === "evt-2023-05-06-coronation-charles-camilla");
  assert.ok(coronation, "Coronation event must exist in eventsCorpus");
  assert.equal(coronation.city, "London");
  assert.equal(coronation.venueName, "Westminster Abbey");
  assert.ok(coronation.participants.length >= 10, "Coronation must have extensive participant roster");

  const dday = eventsCorpus.find((e) => e.id === "evt-2024-06-06-dday-80-international-ceremony");
  assert.ok(dday, "80th D-Day event must exist in eventsCorpus");
  assert.equal(dday.city, "Saint-Laurent-sur-Mer");
  assert.ok(dday.participants.some((p) => p.personId === "charles-iii"));
  assert.ok(dday.participants.some((p) => p.personId === "frederik-x-denmark"));
});

test("verifies PR 33 Codex review fixes: MCP config, milestone date NOT NULL, PlacesExplorer buttons, and Leonor citation", async () => {
  const fs = await import("node:fs");

  // 1. .mcp.json has type: http
  const mcpConfig = JSON.parse(fs.readFileSync(".mcp.json", "utf8"));
  assert.equal(mcpConfig.mcpServers?.supabase?.type, "http", ".mcp.json supabase server must specify type: http");

  // 2. Migration SQL person_milestones.date NOT NULL
  const migrationSql = fs.readFileSync("supabase/migrations/20260904040000_schema_perfection_and_travel_corridors.sql", "utf8");
  assert.match(migrationSql, /CREATE TABLE IF NOT EXISTS public\.person_milestones \([\s\S]*?date text NOT NULL,/);

  // 3. PlacesExplorer tree nodes use separate node-toggle-btn buttons
  const placesExplorer = fs.readFileSync("components/rewind/PlacesExplorer.tsx", "utf8");
  assert.ok(placesExplorer.includes('className="node-toggle-btn"'));
  assert.ok(!placesExplorer.includes('className="tree-node-header country-node"\n                      onClick='));

  // 4. Princess Leonor Golden Fleece citation clarity
  const leonor = await getPersonBySlug("leonor-princess-of-asturias");
  assert.ok(leonor);
  const goldenFleece = leonor.achievements?.find((a) => a.milestone.includes("Golden Fleece"));
  assert.ok(goldenFleece, "Golden Fleece milestone must be present for Leonor");
  assert.match(goldenFleece.evidence, /Real Decreto 978\/2015 \(BOE-A-2015-11718, conceded 30 Oct 2015\)/);
  assert.match(goldenFleece.evidence, /30 Jan 2018/);
});

test("verifies PR 33 review refinements: EventMedia typing, PDF ISO-8601 headers, and PlacesExplorer empty child states", async () => {
  const fs = await import("node:fs");

  // 1. MediaDrawer uses typed timestamp without type casting
  const mediaDrawer = fs.readFileSync("components/rewind/MediaDrawer.tsx", "utf8");
  assert.ok(!mediaDrawer.includes("as { timestamp?: string }"), "MediaDrawer should not contain ad-hoc type assertion");

  // 2. Types define EventMedia
  const typesContent = fs.readFileSync("lib/rewind/types.ts", "utf8");
  assert.ok(typesContent.includes("export interface EventMedia"));

  // 3. PDF routes include ISO-8601 header and timestamp
  const eventPdf = fs.readFileSync("app/api/export/event/[slug]/pdf/route.ts", "utf8");
  assert.ok(eventPdf.includes('"X-Forensic-Timestamp": exportedAt'));
  assert.ok(eventPdf.includes("Timestamp (ISO-8601):"));

  const personPdf = fs.readFileSync("app/api/export/person/[slug]/pdf/route.ts", "utf8");
  assert.ok(personPdf.includes('"X-Forensic-Timestamp": exportedAt'));
  assert.ok(personPdf.includes("Timestamp (ISO-8601):"));

  // 4. PlacesExplorer has empty nested hints for filtered branches
  const placesExplorer = fs.readFileSync("components/rewind/PlacesExplorer.tsx", "utf8");
  assert.ok(placesExplorer.includes("tree-empty-nested-hint"));
});

test("verifies CodeRabbit review fixes: evaluateQueryResult falsy values, isSameCity canonical matching, and venue keys", async () => {
  const { evaluateQueryResult } = await vite.ssrLoadModule("/lib/rewind/result.ts");
  const { isSameCity } = await vite.ssrLoadModule("/lib/rewind/places.ts");
  const fs = await import("node:fs");

  // 1. evaluateQueryResult correctly preserves valid falsy data
  const falsyZeroResult = evaluateQueryResult({ data: 0, error: null });
  assert.equal(falsyZeroResult.isSuccess, true, "0 should be considered successful data");
  assert.equal(falsyZeroResult.isNotFound, false);

  const falsyEmptyStrResult = evaluateQueryResult({ data: "", error: null });
  assert.equal(falsyEmptyStrResult.isSuccess, true, "Empty string should be considered successful data");

  // 2. isSameCity does not match substring containment falsely
  assert.equal(isSameCity("New York", "York"), false, "New York should not match York");
  assert.equal(isSameCity("London", "City of Westminster"), true, "London should match Westminster alias");
  assert.equal(isSameCity("Madrid", "Madrid"), true);

  // 3. PlacesExplorer uses vName as unique React key
  const placesExplorer = fs.readFileSync("components/rewind/PlacesExplorer.tsx", "utf8");
  assert.ok(placesExplorer.includes("<li key={vName}>🏛️ {vName}</li>"));
});

test("verifies Cross-Seed Data Integrity: zero ID collisions and valid entity foreign keys", async () => {
  const { allCanonicalPeopleSeed } = await vite.ssrLoadModule("/data/seeds/index.ts");
  const { sourcesCorpus } = await vite.ssrLoadModule("/data/seeds/sources-corpus.ts");
  const { eventsCorpus } = await vite.ssrLoadModule("/data/seeds/events-corpus.ts");
  const { GLOBAL_GAZETTEER_COORDINATES } = await vite.ssrLoadModule("/lib/rewind/places.ts");

  // 1. Verify allCanonicalPeopleSeed has zero ID collisions and zero slug collisions
  const personIdMap = new Map();
  const personSlugMap = new Map();

  allCanonicalPeopleSeed.forEach((p, idx) => {
    assert.ok(p.id, `Person at index ${idx} missing id`);
    assert.ok(p.slug, `Person at index ${idx} missing slug`);

    if (personIdMap.has(p.id)) {
      assert.fail(`Duplicate person ID detected across seed files: '${p.id}'`);
    }
    personIdMap.set(p.id, p);

    if (personSlugMap.has(p.slug)) {
      assert.fail(`Duplicate person slug detected across seed files: '${p.slug}'`);
    }
    personSlugMap.set(p.slug, p);
  });

  // 2. Verify all sources in sourcesCorpus have unique IDs
  const sourceIdMap = new Map();
  sourcesCorpus.forEach((s) => {
    assert.ok(s.id, `Source missing id: ${JSON.stringify(s)}`);
    if (sourceIdMap.has(s.id)) {
      assert.fail(`Duplicate source ID detected in sourcesCorpus: '${s.id}'`);
    }
    sourceIdMap.set(s.id, s);
  });

  // 3. Verify all events have unique IDs and slugs
  const eventIdMap = new Map();
  const eventSlugMap = new Map();
  eventsCorpus.forEach((e) => {
    assert.ok(e.id, `Event missing id`);
    assert.ok(e.slug, `Event ${e.id} missing slug`);
    if (eventIdMap.has(e.id)) {
      assert.fail(`Duplicate event ID detected: '${e.id}'`);
    }
    eventIdMap.set(e.id, e);

    if (eventSlugMap.has(e.slug)) {
      assert.fail(`Duplicate event slug detected: '${e.slug}'`);
    }
    eventSlugMap.set(e.slug, e);
  });

  // 4. Verify all event participants have valid names and valid presence confidence
  // Royal event participants are strictly mapped to master seeds; general historical participants have valid slugs/names
  const { royalEventsCorpus } = await vite.ssrLoadModule("/data/seeds/royal-events-corpus.ts");
  royalEventsCorpus.forEach((e) => {
    (e.participants || []).forEach((p) => {
      assert.ok(p.name && p.name.trim().length > 0, `Royal participant in event ${e.id} must have a valid name`);
      assert.ok(p.presenceConfidence, `Royal participant ${p.name} in event ${e.id} must have presenceConfidence`);
      if (p.personId) {
        const exists = personIdMap.has(p.personId);
        assert.ok(
          exists,
          `Royal participant '${p.name}' (personId: ${p.personId}) in event '${e.id}' references unregistered person ID`
        );
      }
    });
  });

  eventsCorpus.forEach((e) => {
    (e.participants || []).forEach((p) => {
      assert.ok(p.name && p.name.trim().length > 0, `Participant in event ${e.id} must have a valid name`);
      assert.ok(p.presenceConfidence, `Participant ${p.name} in event ${e.id} must have presenceConfidence`);
      if (p.personId) {
        assert.match(p.personId, /^[a-z0-9-]+$/, `Participant personId '${p.personId}' in event '${e.id}' must be a valid kebab-case slug`);
      }
    });
  });

  // 5. Verify all gazetteer coordinates are valid WGS-84 numbers
  Object.entries(GLOBAL_GAZETTEER_COORDINATES).forEach(([name, coords]) => {
    assert.ok(Array.isArray(coords) && coords.length === 2, `Gazetteer entry ${name} must be [lat, lng]`);
    const [lat, lng] = coords;
    assert.ok(Number.isFinite(lat) && lat >= -90 && lat <= 90, `Gazetteer ${name} lat ${lat} out of range`);
    assert.ok(Number.isFinite(lng) && lng >= -180 && lng <= 180, `Gazetteer ${name} lng ${lng} out of range`);
  });
});

test("verifies Migration SQL and DB Schema Foreign Key Integrity & Constraints", async () => {
  const fs = await import("node:fs");
  const migrationSql = fs.readFileSync("supabase/migrations/20260904040000_schema_perfection_and_travel_corridors.sql", "utf8");
  const schemaFile = fs.readFileSync("db/schema.ts", "utf8");

  // Verify CASCADE actions on person foreign keys
  assert.ok(migrationSql.includes("person_id text NOT NULL REFERENCES public.people(id) ON DELETE CASCADE"));
  assert.ok(schemaFile.includes('.references(() => people.id, { onDelete: "cascade" })'));

  // Verify RLS is enabled on all tables
  const tables = [
    "person_stays",
    "topics",
    "person_milestones",
    "person_education",
    "person_career",
    "person_awards",
    "person_works",
    "event_person_locations",
  ];
  tables.forEach((tbl) => {
    assert.ok(
      migrationSql.includes(`ALTER TABLE public.${tbl} ENABLE ROW LEVEL SECURITY;`),
      `RLS must be enabled on ${tbl}`
    );
  });

  // Verify fail-closed visibility and public-exact RLS
  assert.ok(migrationSql.includes("public_visibility = 'public-exact'"));
});

test("verifies Print-to-PDF Toolbar, Auto-Print trigger, and Media Styles", async () => {
  const fs = await import("node:fs");

  const eventPdf = fs.readFileSync("app/api/export/event/[slug]/pdf/route.ts", "utf8");
  assert.ok(eventPdf.includes('class="print-action-bar"'));
  assert.ok(eventPdf.includes('onclick="window.print()"'));
  assert.ok(eventPdf.includes('@media screen'));
  assert.ok(eventPdf.includes('@media print'));
  assert.ok(eventPdf.includes('.print-action-bar { display: none !important; }'));
  assert.ok(eventPdf.includes('autoPrint'));

  const personPdf = fs.readFileSync("app/api/export/person/[slug]/pdf/route.ts", "utf8");
  assert.ok(personPdf.includes('class="print-action-bar"'));
  assert.ok(personPdf.includes('onclick="window.print()"'));
  assert.ok(personPdf.includes('@media screen'));
  assert.ok(personPdf.includes('@media print'));
  assert.ok(personPdf.includes('.print-action-bar { display: none !important; }'));
  assert.ok(personPdf.includes('autoPrint'));
});

test("verifies OpenGraph Image Fallback titles with robust empty/malformed slug safety", async () => {
  const fs = await import("node:fs");

  const eventOg = fs.readFileSync("app/event/[slug]/opengraph-image.tsx", "utf8");
  assert.ok(eventOg.includes("REWIND Historical Event Record"));
  assert.ok(eventOg.includes(".replace(/^evt-\\d{4}-\\d{2}-\\d{2}-|^evt-/, \"\")"));

  const personOg = fs.readFileSync("app/person/[slug]/opengraph-image.tsx", "utf8");
  assert.ok(personOg.includes("REWIND Person Dossier"));
});

test("verifies MediaDrawer audio error cleaner formatting", async () => {
  const fs = await import("node:fs");
  const mediaDrawer = fs.readFileSync("components/rewind/MediaDrawer.tsx", "utf8");

  assert.ok(mediaDrawer.includes("formatAudioPlaybackError"));
  assert.ok(mediaDrawer.includes("Unable to play archival recording: ${err.message.trim()}"));
  assert.ok(mediaDrawer.includes("Unable to play archival recording. The audio stream may be unavailable."));
  assert.ok(!mediaDrawer.includes("${detail}"));
});




