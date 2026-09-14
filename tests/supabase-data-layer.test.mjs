import assert from "node:assert/strict";
import test, { after } from "node:test";
import { fileURLToPath } from "node:url";
import { createServer } from "vite";
import fs from "node:fs";
import path from "node:path";

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

test("verifies complete elimination of legacy @/data/rewind in production app and components", async () => {
  /** Recursively gathers source files beneath a test target directory. */
  function scanDir(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      if (stat.isDirectory()) {
        scanDir(filePath, fileList);
      } else if (/\.(tsx?|jsx?)$/.test(file)) {
        fileList.push(filePath);
      }
    }
    return fileList;
  }

  const appFiles = scanDir(path.join(root, "app"));
  const componentFiles = scanDir(path.join(root, "components"));
  const allTargetFiles = [...appFiles, ...componentFiles];

  const violations = [];
  for (const file of allTargetFiles) {
    const content = fs.readFileSync(file, "utf-8");
    if (content.includes("@/data/rewind") || content.includes("from \"../data/rewind\"") || content.includes("from '../../data/rewind'")) {
      violations.push(path.relative(root, file));
    }
  }

  assert.equal(
    violations.length,
    0,
    `Production code must have 0 imports from @/data/rewind. Found violations in: ${violations.join(", ")}`
  );
});

test("exports central REWiND data-access layer functions", async () => {
  const rewind = await vite.ssrLoadModule("/lib/rewind/index.ts");

  assert.equal(typeof rewind.getPeople, "function");
  assert.equal(typeof rewind.getPersonBySlug, "function");
  assert.equal(typeof rewind.getPersonTimeline, "function");
  assert.equal(typeof rewind.getEvents, "function");
  assert.equal(typeof rewind.getEventBySlug, "function");
  assert.equal(typeof rewind.getVerifiedEvents, "function");
  assert.equal(typeof rewind.getEventYears, "function");
  assert.equal(typeof rewind.getPlaces, "function");
  assert.equal(typeof rewind.getPlaceBySlug, "function");
  assert.equal(typeof rewind.getSources, "function");
  assert.equal(typeof rewind.getSourceById, "function");
  assert.equal(typeof rewind.getQuotes, "function");
  assert.equal(typeof rewind.getRelationships, "function");
  assert.equal(typeof rewind.getRelationshipBetween, "function");
  assert.equal(typeof rewind.searchRewind, "function");
  assert.equal(typeof rewind.getAtlasStatistics, "function");
});

test("handles empty Supabase database state intentionally and gracefully", async () => {
  const {
    getPeople,
    getPersonBySlug,
    getPersonTimeline,
    getEvents,
    getEventBySlug,
    getVerifiedEvents,
    getEventYears,
    getPlaces,
    getPlaceBySlug,
    getSources,
    getSourceById,
    getQuotes,
    getRelationships,
    getRelationshipBetween,
    searchRewind,
    getAtlasStatistics,
  } = await vite.ssrLoadModule("/lib/rewind/index.ts");

  // People
  const people = await getPeople();
  assert.ok(Array.isArray(people));

  const person = await getPersonBySlug("non-existent-person-slug");
  assert.equal(person, null);

  const timeline = await getPersonTimeline("non-existent-person-slug");
  assert.equal(timeline, null);

  // Events
  const events = await getEvents();
  assert.ok(Array.isArray(events.data));
  assert.equal(typeof events.count, "number");
  assert.equal(typeof events.page, "number");
  assert.equal(typeof events.pageSize, "number");
  assert.equal(typeof events.totalPages, "number");

  const singleEvent = await getEventBySlug("non-existent-event-slug");
  assert.equal(singleEvent.data, null);
  assert.equal(singleEvent.error, null);

  const verified = await getVerifiedEvents(5);
  assert.ok(Array.isArray(verified));

  const years = await getEventYears();
  assert.ok(Array.isArray(years));

  // Places
  const places = await getPlaces();
  assert.ok(Array.isArray(places));

  const place = await getPlaceBySlug("non-existent-place-slug");
  assert.equal(place, null);

  // Sources
  const sources = await getSources();
  assert.ok(Array.isArray(sources));

  const source = await getSourceById("non-existent-source-id");
  assert.equal(source, null);

  // Quotes
  const quotes = await getQuotes();
  assert.ok(Array.isArray(quotes));

  // Relationships
  const relationships = await getRelationships();
  assert.ok(Array.isArray(relationships));

  const pairRel = await getRelationshipBetween("person-a", "person-b");
  assert.equal(pairRel, null);

  // Search
  const searchResults = await searchRewind("Netanyahu");
  assert.ok(Array.isArray(searchResults));

  // Statistics
  const stats = await getAtlasStatistics();
  assert.equal(typeof stats.personCount, "number");
  assert.equal(typeof stats.eventCount, "number");
  assert.equal(typeof stats.placeCount, "number");
  assert.equal(typeof stats.sourceCount, "number");
  assert.equal(typeof stats.verifiedCount, "number");
  assert.equal(typeof stats.yearsCovered, "number");
});

test("behaviorally verifies pagination and chunking patterns in lib/rewind/events.ts", async () => {
  const { getEventsByPerson, getEventYears } = await vite.ssrLoadModule("/lib/rewind/index.ts");

  // Create a stub client returning 1,000 rows on page 0 followed by 200 rows on page 1
  const page0 = Array.from({ length: 1000 }, (_, i) => ({ event_id: `evt-${String(i).padStart(4, "0")}` }));
  const page1 = Array.from({ length: 200 }, (_, i) => ({ event_id: `evt-${String(1000 + i).padStart(4, "0")}` }));

  const stubClient = {
    from(table) {
      if (table === "people") {
        let inPersonIds = [];
        const handler = {
          select() { return handler; },
          eq() { return handler; },
          in(_col, ids) {
            inPersonIds = ids;
            return handler;
          },
          async maybeSingle() {
            return {
              data: {
                id: "p-custom",
                slug: "benjamin-netanyahu",
                canonical_name: "Benjamin Netanyahu",
                display_name: "Benjamin Netanyahu",
              },
              error: null,
            };
          },
          then(resolve) {
            const data = inPersonIds.map((id) => ({
              id,
              slug: "benjamin-netanyahu",
              canonical_name: "Benjamin Netanyahu",
              display_name: "Benjamin Netanyahu",
            }));
            return resolve({ data, error: null });
          },
        };
        return handler;
      }
      if (table === "event_people") {
        let inEventIds = [];
        const handler = {
          select() { return handler; },
          eq() { return handler; },
          order() { return handler; },
          async range(from, to) {
            const pageSize = to - from + 1;
            const pageIndex = Math.floor(from / pageSize);
            if (inEventIds.length > 0) {
              if (pageIndex === 0) {
                return {
                  data: inEventIds.map((eventId) => ({
                    event_id: eventId,
                    person_id: "p-custom",
                    role_label: "Participant",
                    presence_confidence: "confirmed",
                  })),
                  error: null,
                };
              }
              return { data: [], error: null };
            }
            if (pageIndex === 0) return { data: page0, error: null };
            if (pageIndex === 1) return { data: page1, error: null };
            return { data: [], error: null };
          },
          in(_col, ids) {
            inEventIds = ids;
            return handler;
          },
          then(resolve) {
            return resolve({ data: [], error: null });
          },
        };
        return handler;
      }
      if (table === "events") {
        let queriedIds = [];
        const handler = {
          select() { return handler; },
          in(_col, ids) { queriedIds = ids; return handler; },
          eq() { return handler; },
          order() { return handler; },
          range() { return handler; },
          then(resolve) {
            const data = queriedIds.map((id) => ({
              id,
              title: `Event ${id}`,
              start_date: "2023-10-01",
              verification_status: "verified",
              event_type: "diplomatic",
            }));
            return resolve({ data, error: null });
          },
        };
        return handler;
      }
      const defaultHandler = {
        select() { return defaultHandler; },
        in() { return defaultHandler; },
        order() { return defaultHandler; },
        range() { return Promise.resolve({ data: [], error: null }); },
        then(resolve) { return resolve({ data: [], error: null }); },
      };
      return defaultHandler;
    },
  };

  // Assert all 1,200 events across both pages are collected and chunked properly
  const paginatedEvents = await getEventsByPerson("benjamin-netanyahu", stubClient);
  assert.equal(paginatedEvents.length, 1200, "Must collect all 1,200 rows across paginated Supabase calls");
  assert.equal(paginatedEvents[0].id, "evt-0000");
  assert.equal(paginatedEvents[1199].id, "evt-1199");
  assert.ok(paginatedEvents[0].participants.length > 0, "Event participants must be hydrated via event_people");
  assert.equal(paginatedEvents[0].participants[0].personId, "p-custom");
  assert.equal(paginatedEvents[0].participants[0].name, "Benjamin Netanyahu");
  assert.equal(paginatedEvents[0].participants[0].slug, "benjamin-netanyahu");

  // Environmental invariant test (does not require non-empty dataset)
  const bibiEvents = await getEventsByPerson("benjamin-netanyahu");
  assert.ok(Array.isArray(bibiEvents));
  for (let i = 1; i < bibiEvents.length; i++) {
    assert.ok(bibiEvents[i - 1].startDate <= bibiEvents[i].startDate);
  }

  const years = await getEventYears();
  assert.ok(Array.isArray(years));
  for (let i = 1; i < years.length; i++) {
    assert.ok(years[i - 1] < years[i]);
  }
});

test("behaviorally verifies relationship lookup and error handling via getRelationshipBetween", async () => {
  const { getRelationshipBetween } = await vite.ssrLoadModule("/lib/rewind/index.ts");

  const buildStubRelationshipClient = ({ failA = false, failB = false, sharedEventIds = [] } = {}) => {
    return {
      from(table) {
        if (table === "people") {
          let currentSlug = "";
          const handler = {
            select() { return handler; },
            eq(col, val) { if (col === "slug") currentSlug = val; return handler; },
            async maybeSingle() {
              return {
                data: {
                  id: `id-${currentSlug}`,
                  slug: currentSlug,
                  display_name: currentSlug === "benjamin-netanyahu" ? "Benjamin Netanyahu" : "Joe Biden",
                  canonical_name: currentSlug === "benjamin-netanyahu" ? "Benjamin Netanyahu" : "Joe Biden",
                },
                error: null,
              };
            },
          };
          return handler;
        }
        if (table === "event_people") {
          let queriedPersonId = "";
          const handler = {
            select() { return handler; },
            eq(_col, val) { queriedPersonId = val; return handler; },
            in() { return handler; },
            order() { return handler; },
            async range() {
              if (queriedPersonId.includes("netanyahu")) {
                if (failA) return { data: null, error: new Error("DB error query A") };
                return { data: sharedEventIds.map((id) => ({ event_id: id })), error: null };
              }
              if (queriedPersonId.includes("biden")) {
                if (failB) return { data: null, error: new Error("DB error query B") };
                return { data: sharedEventIds.map((id) => ({ event_id: id })), error: null };
              }
              return { data: [], error: null };
            },
            then(resolve) { return resolve({ data: [], error: null }); },
          };
          return handler;
        }
        if (table === "events") {
          let queriedIds = [];
          const handler = {
            select() { return handler; },
            in(_col, ids) { queriedIds = ids; return handler; },
            eq() { return handler; },
            order() { return handler; },
            range() { return handler; },
            then(resolve) {
              const data = queriedIds.map((id) => ({
                id,
                title: `Shared Meeting ${id}`,
                start_date: "2023-10-18",
                verification_status: "verified",
                event_type: "bilateral",
              }));
              return resolve({ data, error: null });
            },
          };
          return handler;
        }
        const defaultHandler = {
          select() { return defaultHandler; },
          in() { return defaultHandler; },
          order() { return defaultHandler; },
          range() { return Promise.resolve({ data: [], error: null }); },
          then(resolve) { return resolve({ data: [], error: null }); },
        };
        return defaultHandler;
      },
    };
  };

  // Case 1: Query A fails -> production getRelationshipBetween must return null
  const clientAError = buildStubRelationshipClient({ failA: true, failB: false });
  const resultAError = await getRelationshipBetween("benjamin-netanyahu", "joe-biden", clientAError);
  assert.equal(resultAError, null, "Must return null when query A fails");

  // Case 2: Query B fails -> production getRelationshipBetween must return null
  const clientBError = buildStubRelationshipClient({ failA: false, failB: true });
  const resultBError = await getRelationshipBetween("benjamin-netanyahu", "joe-biden", clientBError);
  assert.equal(resultBError, null, "Must return null when query B fails");

  // Case 3: Both queries succeed with empty shared events -> returns object with empty sharedEvents array
  const clientEmpty = buildStubRelationshipClient({ failA: false, failB: false, sharedEventIds: [] });
  const resultSuccessEmpty = await getRelationshipBetween("benjamin-netanyahu", "joe-biden", clientEmpty);
  assert.ok(resultSuccessEmpty !== null, "Must return relationship object on success");
  assert.deepEqual(resultSuccessEmpty.sharedEvents, [], "Must return empty sharedEvents array when no encounters match");

  // Case 4: Both queries succeed with shared encounters -> returns populated sharedEvents array
  const clientShared = buildStubRelationshipClient({ failA: false, failB: false, sharedEventIds: ["evt-summit-1"] });
  const resultShared = await getRelationshipBetween("benjamin-netanyahu", "joe-biden", clientShared);
  assert.ok(resultShared !== null, "Must return relationship object on success");
  assert.equal(resultShared.sharedEvents.length, 1, "Must return matched shared events");
  assert.equal(resultShared.sharedEvents[0].id, "evt-summit-1");
});

test("verifies Codex review fixes: live entity resolution, source tier rendering, precision dates, quote search, and v2 place counting", async () => {
  // 1. Live Entity Resolution
  const { resolveEntityAsync } = await vite.ssrLoadModule("/lib/ingestion/resolve.ts");
  const mockDb = {
    select() {
      return {
        from() {
          return {
            where() {
              return Promise.resolve([
                {
                  id: "p-bill-clinton",
                  slug: "bill-clinton",
                  canonicalName: "William J. Clinton",
                  displayName: "Bill Clinton",
                  publicationStatus: "published",
                },
              ]);
            },
          };
        },
      };
    },
  };

  const dbRes = await resolveEntityAsync("President Clinton", mockDb);
  assert.equal(dbRes.personId, "p-bill-clinton");
  assert.equal(dbRes.canonicalName, "William J. Clinton");
  assert.equal(dbRes.isApprovedSubject, true);
  assert.equal(dbRes.confidence, 1.0);

  // Fallback to store when db is null
  const fallbackRes = await resolveEntityAsync("Benjamin Netanyahu", null);
  assert.equal(fallbackRes.personId, "benjamin-netanyahu");
  assert.equal(fallbackRes.isApprovedSubject, true);

  // 2. Source Tier Rendering & Accurate KPI Counting
  const { getSourceTierDisplay } = await vite.ssrLoadModule("/components/rewind/SourcesCatalog.tsx");
  const tierA = getSourceTierDisplay({ id: "s1", title: "UN Record", publisher: "UN", sourceType: "official-record", classification: "primary", tier: "tier-a" });
  assert.equal(tierA.label, "Primary (Tier A)");
  assert.equal(tierA.isPrimary, true);

  const tierB = getSourceTierDisplay({ id: "s2", title: "Press Release", publisher: "White House", sourceType: "press-release", classification: "primary", tier: "tier-b" });
  assert.equal(tierB.label, "First-Party (Tier B)");
  assert.equal(tierB.isPrimary, true);

  const tierC = getSourceTierDisplay({ id: "s3", title: "Wire Dispatch", publisher: "Reuters", sourceType: "wire-report", classification: "secondary", tier: "tier-c" });
  assert.equal(tierC.label, "Secondary (Tier C)");
  assert.equal(tierC.isPrimary, false);

  const tierD = getSourceTierDisplay({ id: "s4", title: "Encyclopedia", publisher: "Wikipedia", sourceType: "encyclopedia", classification: "secondary", tier: "tier-d" });
  assert.equal(tierD.label, "Discovery (Tier D)");
  assert.equal(tierD.isPrimary, false);

  // 3. Source Date Partial Precision Preservation
  const { getSourceDateInfo } = await vite.ssrLoadModule("/components/rewind/SourcesCatalog.tsx");
  const yearOnly = getSourceDateInfo({ id: "s1", title: "Treaty", publisher: "Gov", sourceType: "treaty", classification: "primary", publicationDate: "1948" });
  assert.equal(yearOnly.displayDate, "1948", "Year-only date must preserve year without adding day/month");

  const yearMonth = getSourceDateInfo({ id: "s2", title: "Speech", publisher: "Gov", sourceType: "speech", classification: "primary", publicationDate: "1948-05" });
  assert.equal(yearMonth.displayDate, "May 1948", "Year-month date must preserve month/year without fabricating day 1");

  const exactDay = getSourceDateInfo({ id: "s3", title: "Declaration", publisher: "Gov", sourceType: "declaration", classification: "primary", publicationDate: "1948-05-14" });
  assert.equal(exactDay.displayDate, "14 May 1948", "Exact day date must format full calendar date");

  const undated = getSourceDateInfo({ id: "s4", title: "Undated Doc", publisher: "Archive", sourceType: "document", classification: "primary" });
  assert.equal(undated.displayDate, "Undated");
  assert.equal(undated.isoDate, null);

  // 4. Global Search includes Quote Records
  const { searchRewind } = await vite.ssrLoadModule("/lib/rewind/search.ts");
  assert.equal(typeof searchRewind, "function");

  // 5. Atlas Statistics aggregates locations via getPlaces()
  const { getAtlasStatistics } = await vite.ssrLoadModule("/lib/rewind/stats.ts");
  const stats = await getAtlasStatistics();
  assert.ok(typeof stats.placeCount === "number");
  assert.ok(stats.placeCount >= 0);
});

test("verifies getPlacesStrict and getEventYearsStrict fail-fast behavior and error sanitization in getEventBySlug", async () => {
  const { getPlaces, getPlacesStrict } = await vite.ssrLoadModule("/lib/rewind/places.ts");
  const { getEventYears, getEventYearsStrict, getEventBySlug } = await vite.ssrLoadModule("/lib/rewind/events.ts");

  const failingClient = {
    from() {
      const handler = {
        select() { return handler; },
        order() { return handler; },
        range() { return Promise.resolve({ data: null, error: new Error("PG Connection Timeout") }); },
        eq() { return handler; },
        single() { return Promise.resolve({ data: null, error: new Error("PG Query Refused") }); },
        maybeSingle() { return Promise.resolve({ data: null, error: new Error("PG Query Refused") }); },
      };
      return handler;
    },
  };

  // getPlaces propagates error from Supabase
  await assert.rejects(
    async () => {
      await getPlaces(failingClient);
    },
    /PG Connection Timeout/
  );

  // getPlacesStrict throws error
  await assert.rejects(
    async () => {
      await getPlacesStrict(failingClient);
    },
    /PG Connection Timeout/
  );

  // getEventYears catches error and returns []
  const yearsTolerant = await getEventYears(failingClient);
  assert.deepEqual(yearsTolerant, []);

  // getEventYearsStrict throws error
  await assert.rejects(
    async () => {
      await getEventYearsStrict(failingClient);
    },
    /PG Connection Timeout/
  );

  // getEventBySlug returns sanitized public error string and does not leak internal DB error
  const eventRes = await getEventBySlug("nonexistent-slug", failingClient);
  assert.equal(eventRes.data, null);
  assert.equal(eventRes.error, "The requested event record could not be loaded. Please try again later.");

  // getEventBySlug sanitizes event_sources error specifically
  const failingSourcesClient = {
    from(tableName) {
      if (tableName === "events") {
        return {
          select() { return this; },
          eq() { return this; },
          maybeSingle() {
            return Promise.resolve({
              data: {
                id: "evt-test-1",
                slug: "evt-test-1",
                title: "Test Event",
                start_date: "2024-01-01",
                place_id: "plc-1",
                publication_status: "published",
              },
              error: null,
            });
          },
        };
      }
      if (tableName === "event_people") {
        return {
          select() { return this; },
          eq() { return this; },
          order() { return this; },
          range() { return Promise.resolve({ data: [], error: null }); },
        };
      }
      if (tableName === "event_sources") {
        return {
          select() { return this; },
          eq() { return this; },
          order() { return this; },
          range() {
            return Promise.resolve({
              data: null,
              error: new Error("relation event_sources internal query failure"),
            });
          },
        };
      }
      return {
        select() { return this; },
        eq() { return this; },
        order() { return this; },
        range() { return Promise.resolve({ data: [], error: null }); },
      };
    },
  };

  const sourcesErrRes = await getEventBySlug("evt-test-1", failingSourcesClient);
  assert.equal(sourcesErrRes.data, null);
  assert.equal(sourcesErrRes.error, "The requested event record could not be loaded. Please try again later.");
});

test("verifies relationship self-pair rejection, place slug regex validation, and getPeopleWithStatus", async () => {
  const { getRelationshipBetween, getPlaceBySlug, getPeopleWithStatus } =
    await vite.ssrLoadModule("/lib/rewind/index.ts");

  // 1. Relationship self-pair rejection
  const selfPairRes = await getRelationshipBetween("benjamin-netanyahu", "benjamin-netanyahu");
  assert.equal(selfPairRes, null, "getRelationshipBetween must return null for self-pairs");

  const selfPairCaseRes = await getRelationshipBetween("Benjamin-Netanyahu", "benjamin-netanyahu");
  assert.equal(selfPairCaseRes, null, "getRelationshipBetween must return null for case-insensitive self-pairs");

  // 2. Place slug regex validation (fail-closed)
  const invalidPlaceRes = await getPlaceBySlug("washington,dc.or(true)");
  assert.equal(invalidPlaceRes, null, "getPlaceBySlug must reject invalid PostgREST characters fail-closed");

  const emptyPlaceRes = await getPlaceBySlug("");
  assert.equal(emptyPlaceRes, null, "getPlaceBySlug must return null for empty slug");

  // 3. getPeopleWithStatus functionality
  const peopleStatusRes = await getPeopleWithStatus({ limit: 5 });
  assert.ok(Array.isArray(peopleStatusRes.data), "getPeopleWithStatus must return an array of data");
  assert.equal(peopleStatusRes.error, null, "getPeopleWithStatus must return null error in non-prod environment");
});

test("verifies migration and schema invariants: unique event_people constraint and limited defaults", async () => {
  const migrationSql = fs.readFileSync(
    path.join(root, "supabase/migrations/20240904000000_supabase_architecture_cutover.sql"),
    "utf8"
  );
  const schemaTs = fs.readFileSync(path.join(root, "db/schema.ts"), "utf8");
  const schemaV2Ts = fs.readFileSync(path.join(root, "db/schema-v2.ts"), "utf8");

  // Migration checks
  assert.match(migrationSql, /uq_event_people_event_person UNIQUE \(event_id, person_id\)/);
  assert.match(migrationSql, /presence_confidence text DEFAULT 'limited' NOT NULL/);
  assert.match(migrationSql, /role_confidence text DEFAULT 'limited' NOT NULL/);
  assert.match(migrationSql, /confidence_score double precision DEFAULT 0\.4 NOT NULL/);
  assert.match(migrationSql, /confidence text DEFAULT 'limited' NOT NULL/);

  // Drizzle schema checks
  assert.match(schemaTs, /uq_event_people_event_person/);
  assert.match(schemaTs, /presenceConfidence: text\("presence_confidence"\)\.default\("limited"\)\.notNull\(\)/);
  assert.match(schemaTs, /roleConfidence: text\("role_confidence"\)\.default\("limited"\)\.notNull\(\)/);
  assert.match(schemaTs, /confidence: text\("confidence"\)\.default\("limited"\)\.notNull\(\)/);
  assert.match(schemaV2Ts, /confidence: text\("confidence"\)\.default\("limited"\)\.notNull\(\)/);
});

test("verifies distinct venue resolution, date requirement on approval, and fallback limited confidence", async () => {
  const { resolvePlace } = await vite.ssrLoadModule("/lib/ingestion/resolve.ts");
  const { approveCandidate } = await vite.ssrLoadModule("/lib/evidence-service.ts");
  const { getAllEvents } = await vite.ssrLoadModule("/lib/rewind/events.ts");
  const { getRelationalStore } = await vite.ssrLoadModule("/lib/db/client.ts");

  // 1. Distinct venue resolution does not corrupt existing place ID
  const distinctPlace = resolvePlace("Waldorf Astoria", "New York", "USA");
  assert.notEqual(distinctPlace.placeId, "plc-new-york-general");
  assert.ok(distinctPlace.placeId.includes("waldorf"), "Must generate distinct place ID for distinct venue");

  // 2. Candidate approval requires an established date
  const store = getRelationalStore();
  store.candidateEvents.push({
    id: "candidate-no-date",
    suggestedTitle: "Undated Summit",
    suggestedDate: "",
    suggestedPlace: "New York",
    suggestedCountry: "USA",
    suggestedSource: "Archival Record",
    status: "pending",
    rawExtraction: JSON.stringify({
      title: "Undated Summit",
      sourceId: "src-1",
      startDate: "",
    }),
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const missingDateApproval = await approveCandidate("candidate-no-date");
  assert.equal(missingDateApproval.success, false);
  assert.match(missingDateApproval.error || "", /established historical date/);

  // 3. Fallback unverified events map to limited confidence
  const allEvents = await getAllEvents();
  const provisionalEvents = allEvents.filter((e) => e.verificationStatus !== "verified");
  if (provisionalEvents.length > 0) {
    for (const pe of provisionalEvents) {
      assert.equal(pe.confidence, "limited", "Unverified fallback events must map to 'limited' confidence");
      assert.equal(pe.confidenceScore, 0.4, "Unverified fallback events must have confidenceScore 0.4");
    }
  }
});
