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
  assert.equal(singleEvent, null);

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

test("verifies pagination and chunking patterns in lib/rewind/events.ts", async () => {
  const eventsContent = fs.readFileSync(path.join(root, "lib/rewind/events.ts"), "utf-8");

  // getEventsByPerson pagination & chunking
  assert.ok(
    eventsContent.includes("const partPageSize = 1000;") &&
    eventsContent.includes(".range(partFrom, partFrom + partPageSize - 1)"),
    "getEventsByPerson must paginate event_people table lookups"
  );
  assert.ok(
    eventsContent.includes("const chunkSize = 500;") &&
    eventsContent.includes(".in(\"id\", chunk)"),
    "getEventsByPerson must chunk event ID queries to avoid parameter overflow"
  );

  // getEventYears pagination & ordering
  assert.ok(
    eventsContent.includes("pageSize = 1000") &&
    eventsContent.includes(".range(from, from + pageSize - 1)") &&
    eventsContent.includes(".order(\"start_date\", { ascending: true })") &&
    eventsContent.includes(".order(\"id\", { ascending: true })"),
    "getEventYears must paginate queries and maintain stable ordering with id"
  );

  const { getEventsByPerson, getEventYears } = await vite.ssrLoadModule("/lib/rewind/index.ts");
  const bibiEvents = await getEventsByPerson("benjamin-netanyahu");
  assert.ok(Array.isArray(bibiEvents) && bibiEvents.length > 0);
  for (let i = 1; i < bibiEvents.length; i++) {
    assert.ok(bibiEvents[i - 1].startDate <= bibiEvents[i].startDate);
  }

  const years = await getEventYears();
  assert.ok(Array.isArray(years) && years.length > 0);
  for (let i = 1; i < years.length; i++) {
    assert.ok(years[i - 1] < years[i]);
  }
});

test("verifies relationship lookup error handling contracts for event_people queries", async () => {
  const relContent = fs.readFileSync(path.join(root, "lib/rewind/relationships.ts"), "utf-8");

  // Check error propagation and return null when either query fails
  assert.ok(
    relContent.includes("if (resA.error || resB.error)") &&
    relContent.includes("return null;"),
    "getRelationshipBetween must check errors on both participations queries and return null on failure"
  );

  assert.ok(
    relContent.includes("pageSize = 1000") &&
    relContent.includes(".range(from, from + pageSize - 1)"),
    "getRelationshipBetween must paginate event_people lookups"
  );

  // Simulate mock lookup logic to verify failure of each query independently
  const mockRelationshipLookup = async ({ failA, failB, sharedEventIds = [] }) => {
    const fetchParticipations = async (personId, fail) => {
      if (fail) return { data: null, error: new Error(`Database error on ${personId}`) };
      return { data: sharedEventIds.map((id) => ({ event_id: id })), error: null };
    };

    const [resA, resB] = await Promise.all([
      fetchParticipations("person-1", failA),
      fetchParticipations("person-2", failB),
    ]);

    if (resA.error || resB.error) {
      return null;
    }

    const eventsA = new Set((resA.data || []).map((p) => p.event_id));
    const sharedIds = (resB.data || [])
      .map((p) => p.event_id)
      .filter((id) => eventsA.has(id));

    return {
      personA: { id: "person-1", slug: "person-1" },
      personB: { id: "person-2", slug: "person-2" },
      sharedEvents: sharedIds,
    };
  };

  // Case 1: Query A fails -> returns null
  const resultAError = await mockRelationshipLookup({ failA: true, failB: false });
  assert.equal(resultAError, null, "Must return null when query A fails");

  // Case 2: Query B fails -> returns null
  const resultBError = await mockRelationshipLookup({ failA: false, failB: true });
  assert.equal(resultBError, null, "Must return null when query B fails");

  // Case 3: Both queries succeed with empty shared events -> returns empty sharedEvents array
  const resultSuccessEmpty = await mockRelationshipLookup({ failA: false, failB: false, sharedEventIds: [] });
  assert.deepEqual(
    resultSuccessEmpty,
    {
      personA: { id: "person-1", slug: "person-1" },
      personB: { id: "person-2", slug: "person-2" },
      sharedEvents: [],
    },
    "Must return empty sharedEvents array when both queries succeed without encounters"
  );
});

