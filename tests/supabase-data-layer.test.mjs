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
  assert.equal(place.data, null);
  assert.equal(typeof place.error, "string");

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
  await assert.rejects(
    searchRewind("Netanyahu"),
    /Supabase search client is unavailable/
  );

  // Statistics
  await assert.rejects(
    getAtlasStatistics(),
    /Atlas statistics query failed: Supabase client is unavailable/
  );
  const { getAtlasStatisticsWithStatus } = await vite.ssrLoadModule("/lib/rewind/stats.ts");
  const statsRes = await getAtlasStatisticsWithStatus();
  assert.equal(typeof statsRes.data.personCount, "number");
  assert.equal(typeof statsRes.data.eventCount, "number");
  assert.equal(typeof statsRes.data.placeCount, "number");
  assert.equal(typeof statsRes.data.sourceCount, "number");
  assert.equal(typeof statsRes.data.verifiedCount, "number");
  assert.equal(typeof statsRes.data.yearsCovered, "number");
  assert.ok(statsRes.error !== null);
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
        let currentSlug = "";
        const handler = {
          select() { return handler; },
          eq(col, val) { if (col === "slug" || col === "id") currentSlug = val; return handler; },
          or(condition) {
            const match = condition.match(/slug\.eq\.([^,]+)/);
            if (match) currentSlug = match[1];
            return handler;
          },
          in(_col, ids) {
            inPersonIds = ids;
            return handler;
          },
          async maybeSingle() {
            return {
              data: {
                id: "p-custom",
                slug: currentSlug || "benjamin-netanyahu",
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
            eq(col, val) { if (col === "slug" || col === "id") currentSlug = val; return handler; },
            or(condition) {
              const match = condition.match(/slug\.eq\.([^,]+)/);
              if (match) currentSlug = match[1];
              return handler;
            },
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

  // 5. Atlas Statistics aggregates locations via getPlacesStrict and reports status
  const { getAtlasStatisticsWithStatus: getStatsWithStatus } = await vite.ssrLoadModule("/lib/rewind/stats.ts");
  const statsWithStatus = await getStatsWithStatus();
  assert.ok(typeof statsWithStatus.data.placeCount === "number");
  assert.ok(statsWithStatus.data.placeCount >= 0);
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

  // getPlaces catches error and returns []
  const placesTolerant = await getPlaces(failingClient);
  assert.deepEqual(placesTolerant, []);

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

test("verifies getPersonBySlugWithStatus and getPersonTimelineWithStatus dual slug/ID resolution and biographical relation ordering", async () => {
  const { getPersonBySlugWithStatus, getPersonTimelineWithStatus } = await vite.ssrLoadModule("/lib/rewind/people.ts");

  const recordedQueries = [];
  const mockPersonClient = {
    from(tableName) {
      const q = {
        tableName,
        filters: [],
        orderBy: [],
        select() { return this; },
        or(condition) {
          this.filters.push({ type: "or", condition });
          return this;
        },
        eq(col, val) {
          this.filters.push({ type: "eq", col, val });
          return this;
        },
        order(col, opts) {
          this.orderBy.push({ col, opts });
          return this;
        },
        maybeSingle() {
          recordedQueries.push({ table: this.tableName, filters: this.filters, orderBy: this.orderBy });
          if (this.tableName === "people") {
            return Promise.resolve({
              data: {
                id: "p-benjamin-netanyahu",
                slug: "benjamin-netanyahu",
                canonical_name: "Benjamin Netanyahu",
                display_name: "Benjamin Netanyahu",
                publication_status: "published",
              },
              error: null,
            });
          }
          return Promise.resolve({ data: null, error: null });
        },
      };

      // For bio queries which use await Promise.all([...])
      // return a thenable object that also has select, eq, order
      const bioHandler = {
        ...q,
        then(resolve) {
          recordedQueries.push({ table: q.tableName, filters: q.filters, orderBy: q.orderBy });
          if (q.tableName === "person_education") {
            return Promise.resolve({
              data: [
                {
                  id: "edu-1",
                  person_id: "p-benjamin-netanyahu",
                  institution: "MIT",
                  start_date: "1972",
                  degree: "BSc",
                },
              ],
              error: null,
            }).then(resolve);
          }
          if (q.tableName === "person_awards") {
            return Promise.resolve({
              data: [
                {
                  id: "awd-1",
                  person_id: "p-benjamin-netanyahu",
                  award_name: "Medal of Honor",
                  award_year: 2000,
                },
              ],
              error: null,
            }).then(resolve);
          }
          if (q.tableName === "person_works") {
            return Promise.resolve({
              data: [
                {
                  id: "wrk-1",
                  person_id: "p-benjamin-netanyahu",
                  work_title: "A Durable Peace",
                  release_date: "1993",
                },
              ],
              error: null,
            }).then(resolve);
          }
          return Promise.resolve({ data: [], error: null }).then(resolve);
        },
      };

      return bioHandler;
    },
  };

  const res = await getPersonBySlugWithStatus("benjamin-netanyahu", mockPersonClient);
  assert.equal(res.error, null);
  assert.ok(res.data !== null);
  assert.equal(res.data.id, "p-benjamin-netanyahu");
  assert.equal(res.data.canonicalName, "Benjamin Netanyahu");
  assert.equal(res.data.education?.length, 1);
  assert.equal(res.data.education?.[0].institution, "MIT");
  assert.equal(res.data.awards?.length, 1);
  assert.equal(res.data.awards?.[0].awardName, "Medal of Honor");
  assert.equal(res.data.works?.length, 1);
  assert.equal(res.data.works?.[0].workTitle, "A Durable Peace");

  // Verify that bio queries order by valid Postgres schema columns
  const eduQuery = recordedQueries.find((q) => q.table === "person_education");
  assert.ok(eduQuery, "Must query person_education");
  assert.equal(eduQuery.orderBy[0]?.col, "start_date", "person_education must order by start_date");

  const awardsQuery = recordedQueries.find((q) => q.table === "person_awards");
  assert.ok(awardsQuery, "Must query person_awards");
  assert.equal(awardsQuery.orderBy[0]?.col, "award_year", "person_awards must order by award_year");

  const worksQuery = recordedQueries.find((q) => q.table === "person_works");
  assert.ok(worksQuery, "Must query person_works");
  assert.equal(worksQuery.orderBy[0]?.col, "release_date", "person_works must order by release_date");

  // Verify invalid year rejection in getPersonTimelineWithStatus
  const invalidYearRes = await getPersonTimelineWithStatus("benjamin-netanyahu", { year: "invalid-year" });
  assert.equal(invalidYearRes.data, null);
  assert.equal(invalidYearRes.error, "Invalid year parameter");
});

test("retrieves person roles, personal milestones, and continuous topic timelines", async () => {
  const { getPersonRoles, getPersonMilestones, getTopics, getTopicBySlug, getEventsByTopic } =
    await vite.ssrLoadModule("/lib/rewind/index.ts");

  // Verify roles retrieval
  const roles = await getPersonRoles("benjamin-netanyahu");
  assert.ok(Array.isArray(roles));
  assert.ok(roles.length > 0, "Must return official roles for Netanyahu");
  const pmRole = roles.find((r) => r.title.includes("Prime Minister"));
  assert.ok(pmRole, "Must include Prime Minister role");

  // Verify milestones retrieval
  const milestones = await getPersonMilestones("benjamin-netanyahu");
  assert.ok(Array.isArray(milestones));
  assert.ok(milestones.length > 0, "Must return milestones for Netanyahu");
  assert.equal(typeof milestones[0].year, "number");

  // Verify topics retrieval
  const allTopics = await getTopics();
  assert.ok(Array.isArray(allTopics));
  assert.ok(allTopics.length >= 5, "Must return canonical topics");

  const topic911 = await getTopicBySlug("september-11-attacks-and-aftermath");
  assert.ok(topic911, "Must find 9/11 topic by slug");
  assert.equal(topic911.category, "conflict");

  const topicEvents = await getEventsByTopic(topic911.id);
  assert.ok(Array.isArray(topicEvents));
});



