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
  const appResult = approveCandidate(testCandId, "Senior Editor");
  assert.equal(appResult.success, true);
  assert.ok(appResult.eventId);

  // Claims must be persisted
  const persistedClaim = store.claims.find((c) => c.eventId === appResult.eventId);
  assert.ok(persistedClaim, "Approved candidate claims must be persisted to store.claims");

  // 2. Second approval on same candidate must be rejected
  const reApproveResult = approveCandidate(testCandId, "Senior Editor");
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
  const mergeResult = mergeCandidate(testMergeCandId, targetEvtId, "Senior Editor");
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
  const reMergeResult = mergeCandidate(testMergeCandId, targetEvtId, "Senior Editor");
  assert.equal(reMergeResult.success, false);
  assert.match(reMergeResult.error, /already merged/);
});

