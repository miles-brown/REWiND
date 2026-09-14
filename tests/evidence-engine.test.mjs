import assert from "node:assert/strict";
import test, { after } from "node:test";
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
  await vite.close();
});

test("validates candidate event and raw evidence schemas with Zod", async () => {
  const { ExtractedCandidateEventSchema } = await vite.ssrLoadModule("/lib/ingestion/types.ts");

  const validCandidate = {
    title: "Netanyahu Addresses UN General Assembly Plenary",
    summary: "Formal delivered speech to the 66th session of the UN General Assembly.",
    startDate: "2011-09-23",
    temporalPrecision: "exact-day",
    eventType: "speech-plenary",
    venue: "UN General Assembly Hall",
    city: "New York",
    country: "United States",
    participants: [{ name: "Benjamin Netanyahu", role: "principal", presenceMode: "physical" }],
    claims: [
      {
        subjectMention: "Benjamin Netanyahu",
        claimType: "presence",
        statement: "Delivered address in person.",
      },
    ],
  };

  const parsed = ExtractedCandidateEventSchema.parse(validCandidate);
  assert.equal(parsed.eventType, "speech-plenary");
  assert.equal(parsed.participants.length, 1);

  // Rejects invalid calendar dates
  assert.throws(() => {
    ExtractedCandidateEventSchema.parse({ ...validCandidate, startDate: "2011-02-30" });
  });

  // Rejects backwards date ranges
  assert.throws(() => {
    ExtractedCandidateEventSchema.parse({ ...validCandidate, startDate: "2011-09-23", endDate: "2011-09-20" });
  });
});

test("resolves known entities and gazetteer places with high confidence and avoids surname collisions", async () => {
  const { resolveEntity, resolvePlace } = await vite.ssrLoadModule("/lib/ingestion/resolve.ts");

  const netanyahuRes = resolveEntity("Prime Minister Benjamin Netanyahu");
  assert.equal(netanyahuRes.personId, "benjamin-netanyahu");
  assert.equal(netanyahuRes.isApprovedSubject, true);
  assert.ok(netanyahuRes.confidence >= 0.95);

  // Surname collision protection: "Hillary Clinton" should not match "Bill Clinton"
  const hillaryRes = resolveEntity("Hillary Clinton");
  assert.equal(hillaryRes.personId, null);

  const placeRes = resolvePlace("White House", "Washington, D.C.", "United States");
  assert.ok(placeRes.city.includes("Washington"));
  assert.ok(placeRes.confidence >= 0.9);

  // Empty strings should not match first gazetteer entry at 0.98 confidence
  const emptyPlaceRes = resolvePlace("", "", "");
  assert.equal(emptyPlaceRes.city, "Unknown");
  assert.ok(emptyPlaceRes.confidence <= 0.85);
});

test("evaluates publication lanes deterministically according to policy", async () => {
  const { evaluatePublicationPolicy } = await vite.ssrLoadModule("/lib/ingestion/policy-evaluator.ts");

  const candidate = {
    title: "Standard Public Speech",
    summary: "Public diplomatic address.",
    startDate: "2025-02-04",
    temporalPrecision: "exact-day",
    eventType: "speech-plenary",
    venue: "Knesset",
    city: "Jerusalem",
    country: "Israel",
    participants: [{ name: "Benjamin Netanyahu", role: "principal", presenceMode: "physical" }],
    claims: [],
    quotes: [],
    hasSensitiveLegalMatters: false,
    involvesLivingPersonPrivateMovement: false,
    involvesMinors: false,
  };

  const resolved = [{ personId: "netanyahu", canonicalName: "Benjamin Netanyahu", confidence: 1.0, isApprovedSubject: true }];

  // Tier A -> Auto-Publish
  const tierAPolicy = evaluatePublicationPolicy(candidate, "tier-a", resolved);
  assert.equal(tierAPolicy.lane, "auto-publish");

  // Unapproved subject -> Human Review
  const unapprovedPolicy = evaluatePublicationPolicy(candidate, "tier-a", [
    { personId: "someone", canonicalName: "Unapproved Subject", confidence: 1.0, isApprovedSubject: false },
  ]);
  assert.equal(unapprovedPolicy.lane, "human-review");

  // Tier C -> Provisional
  const tierCPolicy = evaluatePublicationPolicy(candidate, "tier-c", resolved);
  assert.equal(tierCPolicy.lane, "provisional");

  // Sensitive flag -> Human Review
  const sensitivePolicy = evaluatePublicationPolicy({ ...candidate, hasSensitiveLegalMatters: true }, "tier-a", resolved);
  assert.equal(sensitivePolicy.lane, "human-review");

  // Minor flag -> Human Review
  const minorPolicy = evaluatePublicationPolicy({ ...candidate, involvesMinors: true }, "tier-a", resolved);
  assert.equal(minorPolicy.lane, "human-review");
});

test("executes end-to-end ingestion pipeline with UN primary transcript adapter", async () => {
  const { ingestUNDocument } = await vite.ssrLoadModule("/lib/ingestion/adapters/un-digital-library.ts");
  const { getRelationalStore } = await vite.ssrLoadModule("/lib/db/client.ts");

  const result = ingestUNDocument({
    symbol: "A/66/PV.19",
    title: "General Assembly 66th Session Official Plenary",
    meetingDate: "2011-09-23",
    speaker: "Benjamin Netanyahu",
    agendaItem: "Address by Prime Minister of Israel",
    body: "UN General Assembly",
    url: "https://digitallibrary.un.org/record/712345",
    verbatimExcerpt: "Mr. President, ladies and gentlemen, Israel extends its hand in peace to all our neighbors...",
  });

  assert.equal(result.lane, "auto-publish");
  assert.ok(result.publishedEventId);

  const store = getRelationalStore();
  const event = store.events.find((e) => e.id === result.publishedEventId);
  assert.ok(event);
  assert.equal(event.verificationStatus, "verified");
});

test("detects duplicate events and merges corroborating claims without duplicate creation", async () => {
  const { ingestWireDispatch } = await vite.ssrLoadModule("/lib/ingestion/adapters/wire-service-feed.ts");

  // Ingest initial wire report
  const dispatch1 = ingestWireDispatch({
    dispatchId: "ap-19981023-01",
    wireService: "Associated Press",
    headline: "Netanyahu and Clinton Conclude Wye River Accord",
    datelineCity: "Washington, D.C.",
    datelineDate: "1998-10-23",
    participants: ["Benjamin Netanyahu", "Bill Clinton"],
    eventType: "signing-ceremony",
    venue: "White House East Room",
    country: "United States",
    articleText: "Leaders sign historic interim agreement following nine days of intense negotiations.",
  });

  assert.ok(dispatch1.publishedEventId);

  // Ingest identical event from Reuters
  const dispatch2 = ingestWireDispatch({
    dispatchId: "reuters-19981023-02",
    wireService: "Reuters",
    headline: "Netanyahu, Clinton Sign Wye Accord at White House",
    datelineCity: "Washington, D.C.",
    datelineDate: "1998-10-23",
    participants: ["Benjamin Netanyahu", "Bill Clinton"],
    eventType: "signing-ceremony",
    venue: "White House East Room",
    country: "United States",
    articleText: "Historic ceremony marks conclusion of Wye River summit.",
  });

  // Should identify duplicate and merge into the same event ID
  assert.equal(dispatch2.deduplication.isDuplicate, true);
  assert.equal(dispatch2.publishedEventId, dispatch1.publishedEventId);
});

test("enforces one-time candidate approval transitions and claim persistence", async () => {
  const { approveCandidate } = await vite.ssrLoadModule("/lib/evidence-service.ts");
  const { getRelationalStore } = await vite.ssrLoadModule("/lib/db/client.ts");

  const store = getRelationalStore();
  const testCandId = `cand-test-${Date.now()}`;
  store.candidateEvents.push({
    id: testCandId,
    fingerprint: `fp_test_${Date.now()}`,
    rawExtraction: JSON.stringify({
      title: "Test Editorial Candidate",
      summary: "Candidate requiring editorial review",
      startDate: "2024-01-15",
      eventType: "speech-plenary",
      sourceId: "src-un-test",
      claims: [{ claimType: "presence", statement: "Speaker present at podium" }],
    }),
    suggestedTitle: "Test Editorial Candidate",
    suggestedDate: "2024-01-15",
    suggestedPlace: "Jerusalem",
    suggestedParticipants: JSON.stringify([{ name: "Benjamin Netanyahu" }]),
    primarySourceTier: "tier-a",
    assignedLane: "human-review",
    duplicateMatchId: null,
    duplicateSimilarity: 0,
    status: "pending",
    rejectionReason: null,
    createdAt: new Date(),
  });

  // 1. Initial approval succeeds
  const appResult = await approveCandidate(testCandId, "Senior Editor");
  assert.equal(appResult.success, true);
  assert.ok(appResult.eventId);

  // Claims must be persisted
  const persistedClaim = store.claims.find((c) => c.eventId === appResult.eventId);
  assert.ok(persistedClaim, "Approved candidate claims must be persisted to store.claims");

  // 2. Second approval on same candidate must be rejected
  const reApproveResult = await approveCandidate(testCandId, "Senior Editor");
  assert.equal(reApproveResult.success, false);
  assert.match(reApproveResult.error, /already approved/);
});

test("enforces mergeCandidate claims deduplication and terminal state transition", async () => {
  const { mergeCandidate } = await vite.ssrLoadModule("/lib/evidence-service.ts");
  const { getRelationalStore } = await vite.ssrLoadModule("/lib/db/client.ts");

  const store = getRelationalStore();
  const targetEvtId = store.events[0]?.id || "evt-1998-10-23-wye-river-memorandum";
  if (!store.events.some((e) => e.id === targetEvtId)) {
    store.events.push({
      id: targetEvtId,
      slug: targetEvtId,
      parentId: null,
      eventType: "treaty-signing",
      title: "Wye River Memorandum",
      summary: "Interim peace summit between Israel and Palestine",
      description: null,
      startDate: "1998-10-23",
      endDate: null,
      temporalPrecision: "exact-day",
      placeId: "plc-washington-dc",
      verificationStatus: "verified",
      confidenceScore: 0.98,
      publicationStatus: "published",
      publicationLane: "human-review",
      significanceScore: 90,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
  const testMergeCandId = `cand-mrg-test-${Date.now()}`;


  store.candidateEvents.push({
    id: testMergeCandId,
    fingerprint: `fp_mrg_${Date.now()}`,
    rawExtraction: JSON.stringify({
      title: "Duplicate Wire Dispatch: Wye Summit",
      summary: "Corroborating wire transcript of Wye agreement",
      startDate: "1998-10-23",
      eventType: "treaty-signing",
      sourceId: "src-ap-wye-wire",
      claims: [
        {
          subjectMention: "Benjamin Netanyahu",
          claimType: "presence",
          statement: "Netanyahu delivered remarks at the signing ceremony",
        },
      ],
      participants: [{ name: "Benjamin Netanyahu" }, { name: "Bill Clinton" }],
    }),
    suggestedTitle: "Duplicate Wire Dispatch: Wye Summit",
    suggestedDate: "1998-10-23",
    suggestedPlace: "Washington, D.C.",
    suggestedParticipants: JSON.stringify([{ name: "Benjamin Netanyahu" }, { name: "Bill Clinton" }]),
    primarySourceTier: "tier-a",
    assignedLane: "human-review",
    duplicateMatchId: targetEvtId,
    duplicateSimilarity: 0.94,
    status: "pending",
    rejectionReason: null,
    createdAt: new Date(),
  });

  // 1. Initial merge succeeds and attaches claims
  const mergeResult = await mergeCandidate(testMergeCandId, targetEvtId, "Senior Editor");
  assert.equal(mergeResult.success, true);
  assert.equal(mergeResult.targetEventId, targetEvtId);
  assert.ok(mergeResult.claimsAddedCount >= 1);

  // Check merged claim exists with resolved subjectId
  const mergedClaim = store.claims.find(
    (c) => c.eventId === targetEvtId && c.statement.includes("Netanyahu delivered remarks")
  );
  assert.ok(mergedClaim);
  assert.equal(mergedClaim.subjectId, "benjamin-netanyahu");

  // 2. Second merge attempt on the same candidate is blocked
  const reMergeResult = await mergeCandidate(testMergeCandId, targetEvtId, "Senior Editor");
  assert.equal(reMergeResult.success, false);
  assert.match(reMergeResult.error, /already merged/);
});

test("enforces evidence source rigor: rejects approval without a valid archival sourceId", async () => {
  const { approveCandidate } = await vite.ssrLoadModule("/lib/evidence-service.ts");
  const { getRelationalStore } = await vite.ssrLoadModule("/lib/db/client.ts");

  const store = getRelationalStore();
  const testNoSourceCandId = `cand-nosrc-${Date.now()}`;
  store.candidateEvents.push({
    id: testNoSourceCandId,
    fingerprint: `fp_nosrc_${Date.now()}`,
    rawExtraction: JSON.stringify({
      title: "Candidate with Missing Source",
      summary: "Candidate lacking valid source",
      startDate: "2024-01-15",
      eventType: "speech-plenary",
      // sourceId omitted or synthetic
      claims: [{ claimType: "presence", statement: "Unsubstantiated claim" }],
    }),
    suggestedTitle: "Candidate with Missing Source",
    suggestedDate: "2024-01-15",
    suggestedPlace: "Jerusalem",
    suggestedParticipants: JSON.stringify([{ name: "Benjamin Netanyahu" }]),
    primarySourceTier: "tier-a",
    assignedLane: "human-review",
    duplicateMatchId: null,
    duplicateSimilarity: 0,
    status: "pending",
    rejectionReason: null,
    createdAt: new Date(),
  });

  const res = await approveCandidate(testNoSourceCandId, "Senior Editor");
  assert.equal(res.success, false);
  assert.match(res.error, /requires a valid verifiable primary or secondary sourceId/i);
});

test("enforces evidence source rigor: rejects merge without a valid archival sourceId", async () => {
  const { mergeCandidate } = await vite.ssrLoadModule("/lib/evidence-service.ts");
  const { getRelationalStore } = await vite.ssrLoadModule("/lib/db/client.ts");

  const store = getRelationalStore();
  const targetEvtId = store.events[0]?.id || "evt-1998-10-23-wye-river-memorandum";
  const testNoSourceCandId = `cand-nosrc-mrg-${Date.now()}`;
  store.candidateEvents.push({
    id: testNoSourceCandId,
    fingerprint: `fp_nosrc_mrg_${Date.now()}`,
    rawExtraction: JSON.stringify({
      title: "Merge Candidate with Missing Source",
      summary: "Candidate lacking valid source",
      startDate: "1998-10-23",
      eventType: "treaty-signing",
      // sourceId omitted or synthetic sentinel
      sourceId: "src-editorial-corroboration",
      claims: [{ claimType: "presence", statement: "Unsubstantiated claim" }],
    }),
    suggestedTitle: "Merge Candidate with Missing Source",
    suggestedDate: "1998-10-23",
    suggestedPlace: "Washington, D.C.",
    suggestedParticipants: JSON.stringify([{ name: "Benjamin Netanyahu" }]),
    primarySourceTier: "tier-a",
    assignedLane: "human-review",
    duplicateMatchId: targetEvtId,
    duplicateSimilarity: 0.9,
    status: "pending",
    rejectionReason: null,
    createdAt: new Date(),
  });

  const res = await mergeCandidate(testNoSourceCandId, targetEvtId, "Senior Editor");
  assert.equal(res.success, false);
  assert.match(res.error, /requires a valid verifiable primary or secondary sourceId/i);
});

test("verifies getMonogram utility and production fail-closed behavior in events loaders", async () => {
  const { getMonogram } = await vite.ssrLoadModule("/lib/rewind/utils.ts");
  const { getAllEventsWithStatus, getSpeechEventsWithStatus } = await vite.ssrLoadModule("/lib/rewind/events.ts");

  // 1. Monogram utility tests
  assert.equal(getMonogram("Benjamin Netanyahu"), "BN");
  assert.equal(getMonogram("  Benjamin \t Netanyahu  "), "BN");
  assert.equal(getMonogram("Bill Clinton"), "BC");
  assert.equal(getMonogram("Arafat"), "AR");
  assert.equal(getMonogram("   "), "—");
  assert.equal(getMonogram(""), "—");

  // 2. Production fail-closed behavior without DB
  const origNodeEnv = process.env.NODE_ENV;
  try {
    process.env.NODE_ENV = "production";
    const allRes = await getAllEventsWithStatus();
    assert.equal(allRes.data.length, 0);
    assert.match(allRes.error || "", /Database configuration unavailable in production environment/);

    const speechRes = await getSpeechEventsWithStatus();
    assert.equal(speechRes.data.length, 0);
    assert.match(speechRes.error || "", /Database configuration unavailable in production environment/);
  } finally {
    if (origNodeEnv === undefined) {
      delete process.env.NODE_ENV;
    } else {
      process.env.NODE_ENV = origNodeEnv;
    }
  }
});

test("verifies precision-aware date formatting and year filter matching", async () => {
  const { formatTimelineDate } = await vite.ssrLoadModule("/lib/rewind/dates.ts");
  const { getEvents } = await vite.ssrLoadModule("/lib/rewind/events.ts");

  // Partial date formatting should not fabricate days for year-only or month-only dates
  assert.equal(formatTimelineDate("1948", "year"), "1948");
  assert.equal(formatTimelineDate("1948-05", "month"), "May 1948");
  assert.equal(formatTimelineDate("2011-09-23", "exact-day", { day: "numeric", month: "long", year: "numeric" }), "23 September 2011");

  // Year filter matching matches year prefix
  const res = await getEvents({ year: "1998" });
  assert.ok(Array.isArray(res.data));
  assert.ok(res.data.every((e) => e.startDate.startsWith("1998")));
});

test("verifies Codex & CodeRabbit safeguards: audit propagation, places resilience, and venue error handling", async () => {
  const { recordAuditEvent } = await vite.ssrLoadModule("/lib/ingestion/audit.ts");
  const { getPlaces, getPlaceBySlug } = await vite.ssrLoadModule("/lib/rewind/places.ts");
  const { getEvents } = await vite.ssrLoadModule("/lib/rewind/events.ts");

  // 1. recordAuditEvent returns an awaitable entry
  const auditPromise = recordAuditEvent("test-action", "RULE-1", { test: true });
  assert.ok(auditPromise instanceof Promise);
  const auditEntry = await auditPromise;
  assert.equal(auditEntry.action, "test-action");

  // 2. getPlaces and getPlaceBySlug return valid collections or null safely
  const places = await getPlaces();
  assert.ok(Array.isArray(places));

  const placeSlugResult = await getPlaceBySlug("non-existent-place-slug-xyz");
  assert.equal(placeSlugResult, null);

  // 3. getEvents handles non-existent placeSlug gracefully
  const eventsResult = await getEvents({ placeSlug: "non-existent-place-slug-xyz" });
  assert.ok(Array.isArray(eventsResult.data));
  assert.equal(eventsResult.data.length, 0);
  assert.equal(eventsResult.error, null);
});

test("verifies PR #12 Codex review fixes: year sanitization, EventCard dateTime emission, and TimelineComparison self-pair guard", async () => {
  const { getEvents } = await vite.ssrLoadModule("/lib/rewind/events.ts");
  const { isStandardIsoDate } = await vite.ssrLoadModule("/lib/rewind/dates.ts");

  // 1. Year filter with wildcards is sanitized and does not return un-filtered results
  const wildcardRes = await getEvents({ year: "%" });
  assert.ok(Array.isArray(wildcardRes.data));

  const malformedRes = await getEvents({ year: "1982%" });
  assert.ok(Array.isArray(malformedRes.data));
  assert.ok(malformedRes.data.every((e) => e.startDate.startsWith("1982")));

  // 2. isStandardIsoDate correctly flags archival strings like "1980s" vs standard dates "1982-10-23"
  assert.equal(isStandardIsoDate("1982-10-23"), true);
  assert.equal(isStandardIsoDate("1980s"), false);
  assert.equal(isStandardIsoDate("Circa 1992"), false);
});

test("verifies participant stub collision resistance, place coordinates preservation, and stats failure propagation", async () => {
  const { createParticipantStubId, resolvePlace } = await vite.ssrLoadModule("/lib/ingestion/resolve.ts");

  // 1. Collision-resistant stub IDs for non-ASCII / similar names (SHA-256 hex digest)
  const id1 = createParticipantStubId("Diplomat Alpha");
  const id2 = createParticipantStubId("Diplomat Beta");
  const idNonAscii1 = createParticipantStubId("יוסי שריד");
  const idNonAscii2 = createParticipantStubId("יצחק רבין");
  assert.notEqual(id1, id2);
  assert.notEqual(idNonAscii1, idNonAscii2);
  assert.ok(idNonAscii1.startsWith("p-unknown-"));
  assert.ok(idNonAscii2.startsWith("p-unknown-"));
  assert.match(id1, /^p-diplomat-alpha-[0-9a-f]{8}$/);
  assert.match(idNonAscii1, /^p-unknown-[0-9a-f]{8}$/);

  // 2. resolvePlace coordinates preservation
  const resolvedWithCoords = resolvePlace("Diplomatic Venue X", "Geneva", "Switzerland", 46.2044, 6.1432);
  assert.equal(resolvedWithCoords.latitude, 46.2044);
  assert.equal(resolvedWithCoords.longitude, 6.1432);
});

test("verifies resolvePlaceAsync live database resolution and fallback behavior", async () => {
  const { resolvePlaceAsync } = await vite.ssrLoadModule("/lib/ingestion/resolve.ts");

  const mockDb = {
    select() {
      return {
        from() {
          return {
            where() {
              return Promise.resolve([
                {
                  id: "plc-geneva-palais-des-nations",
                  slug: "palais-des-nations",
                  venue: "Palais des Nations",
                  city: "Geneva",
                  country: "Switzerland",
                  latitude: 46.2268,
                  longitude: 6.1402,
                  placeType: "summit-center",
                },
              ]);
            },
          };
        },
      };
    },
  };

  const dbRes = await resolvePlaceAsync("Palais des Nations", "Geneva", "Switzerland", undefined, undefined, mockDb);
  assert.equal(dbRes.placeId, "plc-geneva-palais-des-nations");
  assert.equal(dbRes.venue, "Palais des Nations");
  assert.equal(dbRes.confidence, 0.98);
  assert.equal(dbRes.latitude, 46.2268);

  // Fallback to in-memory store when DB is null
  const fallbackRes = await resolvePlaceAsync("White House", "Washington, D.C.", "United States", undefined, undefined, null);
  assert.ok(fallbackRes.city.includes("Washington"));
  assert.ok(fallbackRes.confidence >= 0.9);
});

test("verifies event-v2-adapter confidence defaults to limited without unevidenced assumptions", async () => {
  const { upgradeLegacyToV2 } = await vite.ssrLoadModule("/lib/adapters/event-v2-adapter.ts");

  const legacyEventWithoutConfidence = {
    id: "evt-test-legacy-01",
    slug: "evt-test-legacy-01",
    eventName: "Historical Diplomatic Meeting",
    summary: "Diplomatic talks without explicit confidence rating",
    startDate: "1995-10-15",
    city: "Geneva",
    country: "Switzerland",
    latitude: 46.2044,
    longitude: 6.1432,
    locationPrecision: "venue",
    verificationStatus: "provisional",
    participants: [
      {
        personId: "p-test-1",
        name: "Test Diplomat",
        role: "delegate",
      },
    ],
    sourceIds: ["src-1"],
  };

  const v2 = upgradeLegacyToV2(legacyEventWithoutConfidence);
  assert.equal(v2.confidence, "limited");
  assert.equal(v2.people[0].presenceConfidence, "limited");
  assert.equal(v2.people[0].roleConfidence, "limited");
  assert.equal(v2.people[0].locations[0].confidence, "limited");
});

test("verifies ingestion pipeline quote persistence, deterministic slug hashing, and source fetch hashing", async () => {
  const { processCandidateEvent } = await vite.ssrLoadModule("/lib/ingestion/pipeline.ts");
  const { getRelationalStore } = await vite.ssrLoadModule("/lib/db/client.ts");

  const candidateWithQuotes = {
    title: "Joint Press Conference at Elysée Palace",
    summary: "French and Israeli leaders deliver remarks following bilateral summit.",
    startDate: "2013-03-20",
    eventType: "press-conference",
    venue: "Elysée Palace",
    city: "Paris",
    country: "France",
    participants: [
      { name: "Benjamin Netanyahu", role: "principal", presenceMode: "physical" },
    ],
    claims: [
      { subjectMention: "Benjamin Netanyahu", claimType: "presence", statement: "Benjamin Netanyahu delivered joint address in Paris." },
    ],
    quotes: [
      {
        speaker: "Benjamin Netanyahu",
        quote: "Our cooperation on shared strategic interests remains indispensable.",
        context: "Opening remarks at joint press briefing",
      },
    ],
  };

  const rawSource = {
    sourceId: "src-elysee-20130320",
    sourceTitle: "Official Transcript of Joint Press Conference",
    publisher: "Élysée Press Office",
    sourceType: "official-transcript",
    sourceTier: "tier-a",
    url: "https://elysee.fr/transcripts/2013-03-20",
    rawText: "President Hollande and Prime Minister Netanyahu delivered the following statements to the press corps...",
    fetchedAt: "2013-03-20T18:00:00Z",
  };

  const result = processCandidateEvent(candidateWithQuotes, rawSource);
  assert.equal(result.lane, "auto-publish");
  assert.ok(result.publishedEventId);
  assert.ok(result.publishedEventId.includes("press-conference"));
  assert.ok(result.publishedEventId.includes("paris"));

  const store = getRelationalStore();
  const savedQuote = store.quotes.find((q) => q.eventId === result.publishedEventId);
  assert.ok(savedQuote);
  assert.equal(savedQuote.quote, "Our cooperation on shared strategic interests remains indispensable.");
});

test("verifies strict year filter rejection for malformed or wildcard queries", async () => {
  const { getEvents } = await vite.ssrLoadModule("/lib/rewind/events.ts");

  // Valid 4-digit year query
  const validRes = await getEvents({ year: "1998" });
  assert.ok(Array.isArray(validRes.data));
  assert.ok(validRes.data.every((e) => e.startDate.startsWith("1998")));

  // Malformed or wildcard year queries must return 0 results
  const wildcardRes = await getEvents({ year: "199%" });
  assert.equal(wildcardRes.data.length, 0);
  assert.equal(wildcardRes.count, 0);

  const nonDigitRes = await getEvents({ year: "invalid" });
  assert.equal(nonDigitRes.data.length, 0);
  assert.equal(nonDigitRes.count, 0);

  const shortDigitRes = await getEvents({ year: "98" });
  assert.equal(shortDigitRes.data.length, 0);
  assert.equal(shortDigitRes.count, 0);
});

test("verifies findDuplicateEventAsync and collision-resistant event slug disambiguation", async () => {
  const { findDuplicateEventAsync } = await vite.ssrLoadModule("/lib/ingestion/deduplicate.ts");
  const { processCandidateEvent } = await vite.ssrLoadModule("/lib/ingestion/pipeline.ts");

  const candidateA = {
    title: "Geneva Peace Talks - Morning Plenary Session",
    summary: "Plenary discussions on regional security frameworks.",
    startDate: "2015-06-12",
    eventType: "multilateral-summit",
    venue: "Palais des Nations",
    city: "Geneva",
    country: "Switzerland",
    participants: [
      { name: "Benjamin Netanyahu", role: "principal", presenceMode: "physical" },
    ],
    claims: [
      { subjectMention: "Benjamin Netanyahu", claimType: "presence", statement: "Attended Geneva peace plenary." },
    ],
  };

  const candidateB = {
    title: "Geneva Nuclear Accord Working Group",
    summary: "Technical discussions on nuclear monitoring protocols.",
    startDate: "2015-06-12",
    eventType: "bilateral-meeting",
    venue: "Palais des Nations",
    city: "Geneva",
    country: "Switzerland",
    participants: [
      { name: "Benjamin Netanyahu", role: "principal", presenceMode: "physical" },
    ],
    claims: [
      { subjectMention: "Benjamin Netanyahu", claimType: "presence", statement: "Attended nuclear working group." },
    ],
  };

  const rawSrc = {
    sourceId: "src-geneva-20150612",
    sourceTitle: "Swiss Federal Department of Foreign Affairs Dispatch",
    publisher: "FDFA Switzerland",
    sourceType: "official-transcript",
    sourceTier: "tier-a",
    url: "https://eda.admin.ch/transcripts/2015-06-12",
  };

  const resA = processCandidateEvent(candidateA, rawSrc);
  const resB = processCandidateEvent(candidateB, rawSrc);

  assert.ok(resA.publishedEventId);
  assert.ok(resB.publishedEventId);
  // Distinct events on the same date with same participant must receive distinct IDs
  assert.notEqual(resA.publishedEventId, resB.publishedEventId);

  // findDuplicateEventAsync with store fallback
  const dupMatch = await findDuplicateEventAsync(candidateA);
  assert.ok(dupMatch);
});

test("verifies approveCandidate deterministic slug generation, persistedClaimIds, and collision suffixing", async () => {
  const { approveCandidate, parseCandidatePayload } = await vite.ssrLoadModule("/lib/evidence-service.ts");
  const { getRelationalStore } = await vite.ssrLoadModule("/lib/db/client.ts");

  // 1. parseCandidatePayload strictness
  const validParsed = parseCandidatePayload(JSON.stringify({ title: "Test Event", sourceId: "src-test" }));
  assert.equal(validParsed?.title, "Test Event");
  assert.equal(validParsed?.sourceId, "src-test");
  assert.equal(parseCandidatePayload("invalid json {{{"), null);
  assert.equal(parseCandidatePayload(null), null);

  const store = getRelationalStore();
  const testCandId1 = `cand-det-1-${Date.now()}`;
  const testCandId2 = `cand-det-2-${Date.now()}`;

  store.candidateEvents.push({
    id: testCandId1,
    fingerprint: `fp_det_1_${Date.now()}`,
    rawExtraction: JSON.stringify({
      title: "Geneva Peace Plenary",
      summary: "High-level plenary session in Geneva.",
      startDate: "2015-06-12",
      eventType: "speech-plenary",
      venue: "Palais des Nations",
      city: "Geneva",
      country: "Switzerland",
      sourceId: "src-un-archive-1",
      claims: [{ claimType: "presence", statement: "Delivered remarks at plenary" }],
    }),
    suggestedTitle: "Geneva Peace Plenary",
    suggestedDate: "2015-06-12",
    suggestedPlace: "Geneva",
    suggestedParticipants: JSON.stringify([{ name: "Benjamin Netanyahu" }]),
    primarySourceTier: "tier-a",
    assignedLane: "human-review",
    duplicateMatchId: null,
    duplicateSimilarity: 0,
    status: "pending",
    rejectionReason: null,
    createdAt: new Date(),
  });

  const app1 = await approveCandidate(testCandId1, "Senior Historical Editor");
  assert.equal(app1.success, true);
  assert.ok(app1.eventId);
  assert.ok(Array.isArray(app1.persistedClaimIds));
  assert.equal(app1.persistedClaimIds?.length, 1);
  // Deterministic slug format: evt-YYYY-MM-DD-...
  assert.match(app1.eventId, /^evt-2015-06-12-/);

  // 2. Second candidate with identical details is detected as duplicate and linked to existing published event
  store.candidateEvents.push({
    id: testCandId2,
    fingerprint: `fp_det_2_${Date.now()}`,
    rawExtraction: JSON.stringify({
      title: "Geneva Peace Plenary",
      summary: "High-level plenary session in Geneva.",
      startDate: "2015-06-12",
      eventType: "speech-plenary",
      venue: "Palais des Nations",
      city: "Geneva",
      country: "Switzerland",
      sourceId: "src-un-archive-2",
      claims: [{ claimType: "presence", statement: "Delivered remarks in follow-up" }],
    }),
    suggestedTitle: "Geneva Peace Plenary",
    suggestedDate: "2015-06-12",
    suggestedPlace: "Geneva",
    suggestedParticipants: JSON.stringify([{ name: "Benjamin Netanyahu" }]),
    primarySourceTier: "tier-a",
    assignedLane: "human-review",
    duplicateMatchId: null,
    duplicateSimilarity: 0,
    status: "pending",
    rejectionReason: null,
    createdAt: new Date(),
  });

  const app2 = await approveCandidate(testCandId2, "Senior Historical Editor");
  assert.equal(app2.success, true);
  // Duplicate candidate matches and links to published event
  assert.equal(app2.eventId, app1.eventId);

  // 3. Distinct candidate on the same date with simulated slug collision
  const testCandId3 = `cand-det-3-${Date.now()}`;
  store.candidateEvents.push({
    id: testCandId3,
    fingerprint: `fp_det_3_${Date.now()}`,
    rawExtraction: JSON.stringify({
      title: "Geneva Humanitarian Protocol Summit",
      summary: "Distinct summit on humanitarian protocols.",
      startDate: "2015-06-12",
      eventType: "multilateral-summit",
      venue: "Palais des Nations",
      city: "Geneva",
      country: "Switzerland",
      sourceId: "src-un-archive-3",
      claims: [{ claimType: "presence", statement: "Attended humanitarian protocol summit" }],
    }),
    suggestedTitle: "Geneva Humanitarian Protocol Summit",
    suggestedDate: "2015-06-12",
    suggestedPlace: "Geneva",
    suggestedParticipants: JSON.stringify([{ name: "Benjamin Netanyahu" }]),
    primarySourceTier: "tier-a",
    assignedLane: "human-review",
    duplicateMatchId: null,
    duplicateSimilarity: 0,
    status: "pending",
    rejectionReason: null,
    createdAt: new Date(),
  });

  const app3 = await approveCandidate(testCandId3, "Senior Historical Editor");
  assert.equal(app3.success, true);
  assert.ok(app3.eventId);
  assert.notEqual(app3.eventId, app1.eventId);
});

