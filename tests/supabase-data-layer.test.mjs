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
