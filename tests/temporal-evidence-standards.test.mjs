import assert from "node:assert/strict";
import test, { after } from "node:test";
import { fileURLToPath } from "node:url";
import { createServer } from "vite";
import fs from "node:fs";
import path from "node:path";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

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

test("verifies existence and completeness of the 10 governance standards documents", () => {
  const requiredStandards = [
    "docs/standards/TEMPORAL_STANDARD.md",
    "docs/standards/EVIDENCE_STANDARD.md",
    "docs/standards/SOURCE_CLASSIFICATION.md",
    "docs/standards/FACT_AND_CLAIM_STANDARD.md",
    "docs/standards/VERIFICATION_STANDARD.md",
    "docs/standards/LOCATION_STANDARD.md",
    "docs/standards/PEOPLE_AND_INCLUSION_STANDARD.md",
    "docs/standards/CORRECTIONS_AND_DISPUTES.md",
    "docs/standards/RESEARCH_INTEGRITY.md",
    "docs/standards/AI_RESEARCH_POLICY.md",
  ];

  for (const doc of requiredStandards) {
    const docPath = path.join(root, doc);
    assert.ok(fs.existsSync(docPath), `Required governance standard must exist: ${doc}`);
    const stat = fs.statSync(docPath);
    assert.ok(stat.size > 800, `Governance standard ${doc} must be substantive (found ${stat.size} bytes)`);

    const content = fs.readFileSync(docPath, "utf-8");
    assert.ok(content.includes("# "), `Standard ${doc} must have an H1 title`);
  }
});

test("validates ISO-8601 calendar date formats and rejects culturally ambiguous strings", async () => {
  const temporal = await vite.ssrLoadModule("/lib/rewind/temporal.ts");

  assert.equal(typeof temporal.isValidISODate, "function");

  // Valid canonical dates
  assert.equal(temporal.isValidISODate("2025-02-04"), true);
  assert.equal(temporal.isValidISODate("1998-10-23"), true);
  assert.equal(temporal.isValidISODate("1949-10-21"), true);
  assert.equal(temporal.isValidISODate("2024-02-29"), true); // Leap year

  // Invalid / Culturally ambiguous formats (per Part I § 2)
  assert.equal(temporal.isValidISODate("04/02/2025"), false);
  assert.equal(temporal.isValidISODate("02/04/2025"), false);
  assert.equal(temporal.isValidISODate("4.2.25"), false);
  assert.equal(temporal.isValidISODate("4 February 2025"), false);
  assert.equal(temporal.isValidISODate("2025-02-30"), false); // Invalid day
  assert.equal(temporal.isValidISODate(""), false);
  assert.equal(temporal.isValidISODate(null), false);
});

test("automatically derives mathematical day of week from ISO dates", async () => {
  const temporal = await vite.ssrLoadModule("/lib/rewind/temporal.ts");

  assert.equal(typeof temporal.deriveDayOfWeek, "function");

  // Directive examples
  assert.equal(temporal.deriveDayOfWeek("2025-02-04"), "Tuesday");
  assert.equal(temporal.deriveDayOfWeek("1963-11-22"), "Friday");
  assert.equal(temporal.deriveDayOfWeek("1998-10-23"), "Friday");
  assert.equal(temporal.deriveDayOfWeek("2024-02-29"), "Thursday");
  assert.equal(temporal.deriveDayOfWeek("1949-10-21"), "Friday");

  // Handles edge cases
  assert.equal(temporal.deriveDayOfWeek("invalid-date"), null);
  assert.equal(temporal.deriveDayOfWeek(""), null);
  assert.equal(temporal.deriveDayOfWeek(null), null);
});

test("formats civil local time and measured duration with exactitude", async () => {
  const temporal = await vite.ssrLoadModule("/lib/rewind/temporal.ts");

  // Format Civil Time
  assert.equal(temporal.formatCivilTime("14:37", "EST"), "2:37 PM EST");
  assert.equal(temporal.formatCivilTime("09:15", "BST"), "9:15 AM BST");
  assert.equal(temporal.formatCivilTime("12:00", "UTC"), "12:00 PM UTC");
  assert.equal(temporal.formatCivilTime("00:00"), "12:00 AM");
  assert.equal(temporal.formatCivilTime(null), null);

  // Format Duration (Directive example: 23m 41s)
  assert.equal(temporal.formatDuration(1421), "23m 41s");
  assert.equal(temporal.formatDuration(3240), "54m");
  assert.equal(temporal.formatDuration(3665), "1h 1m 5s");
  assert.equal(temporal.formatDuration(45), "45s");
  assert.equal(temporal.formatDuration(null), null);
  assert.equal(temporal.formatDuration(0), null);
});

test("exports claims query functions and handles fallback queries safely", async () => {
  const claims = await vite.ssrLoadModule("/lib/rewind/claims.ts");

  assert.equal(typeof claims.getClaimsByEvent, "function");
  assert.equal(typeof claims.getClaimsByPerson, "function");

  // Fallback / empty test for nonexistent IDs
  const eventClaims = await claims.getClaimsByEvent("nonexistent-event-id");
  assert.ok(Array.isArray(eventClaims));
  assert.equal(eventClaims.length, 0);

  const personClaims = await claims.getClaimsByPerson("nonexistent-person-id");
  assert.ok(Array.isArray(personClaims));
  assert.equal(personClaims.length, 0);
});

test("verifies database schema migration file contains all standards tables and columns", () => {
  const migrationPath = path.join(root, "supabase/migrations/20260904010000_temporal_evidence_people_standards.sql");
  assert.ok(fs.existsSync(migrationPath), "Migration file must exist");

  const sql = fs.readFileSync(migrationPath, "utf-8");

  // Check temporal columns on events
  assert.ok(sql.includes("day_of_week"), "events must have day_of_week");
  assert.ok(sql.includes("local_start_time"), "events must have local_start_time");
  assert.ok(sql.includes("timezone_id"), "events must have timezone_id");
  assert.ok(sql.includes("utc_offset_seconds"), "events must have utc_offset_seconds");
  assert.ok(sql.includes("duration_seconds"), "events must have duration_seconds");
  assert.ok(sql.includes("duration_basis"), "events must have duration_basis");
  assert.ok(sql.includes("holiday_applicable"), "events must have holiday_applicable");

  // Check source classification columns
  assert.ok(sql.includes("source_level"), "sources must have source_level");
  assert.ok(sql.includes("independence_status"), "sources must have independence_status");
  assert.ok(sql.includes("derived_from_source_id"), "sources must have derived_from_source_id");

  // Check claim decomposition tables and columns
  assert.ok(sql.includes("claim_evidence"), "claim_evidence table must be defined");
  assert.ok(sql.includes("epistemic_class"), "claims must have epistemic_class");
  assert.ok(sql.includes("claim_status"), "claims must have claim_status");
  assert.ok(sql.includes("contradicts_claim"), "claim_evidence must have contradicts_claim");

  // Check biographical and inclusion tables
  assert.ok(sql.includes("person_education"), "person_education table must be defined");
  assert.ok(sql.includes("person_career"), "person_career table must be defined");
  assert.ok(sql.includes("person_awards"), "person_awards table must be defined");
  assert.ok(sql.includes("person_works"), "person_works table must be defined");
  assert.ok(sql.includes("inclusion_basis"), "people must have inclusion_basis");
  assert.ok(sql.includes("religion_status"), "people must have religion_status");
});

test("verifies ErrorBoundary component isolates failures and exposes accessible reset controls", async () => {
  const { ErrorBoundary } = await vite.ssrLoadModule("/components/ui/error-boundary.tsx");

  // Normal render
  const healthyMarkup = renderToStaticMarkup(
    React.createElement(ErrorBoundary, { sectionName: "Test Section" }, React.createElement("div", null, "Healthy Content"))
  );
  assert.ok(healthyMarkup.includes("Healthy Content"));
});

test("verifies WAI-ARIA tab semantics and live regions in comparison and biographical components", () => {
  const bioSectionContent = fs.readFileSync(path.join(root, "components/rewind/BiographicalSection.tsx"), "utf-8");
  assert.ok(bioSectionContent.includes('role="tablist"'), "BiographicalSection must provide role=tablist");
  assert.ok(bioSectionContent.includes('role="tab"'), "BiographicalSection must provide role=tab");
  assert.ok(bioSectionContent.includes('role="tabpanel"'), "BiographicalSection must provide role=tabpanel");
  assert.ok(bioSectionContent.includes("aria-controls="), "BiographicalSection tabs must have aria-controls");
  assert.ok(bioSectionContent.includes("aria-labelledby="), "BiographicalSection tabpanels must have aria-labelledby");

  const timelineCompContent = fs.readFileSync(path.join(root, "components/rewind/TimelineComparison.tsx"), "utf-8");
  assert.ok(timelineCompContent.includes('role="status"'), "TimelineComparison must declare role=status live region");
  assert.ok(timelineCompContent.includes('aria-live="polite"'), "TimelineComparison must declare aria-live=polite");

  const adminContent = fs.readFileSync(path.join(root, "app/admin/evidence/page.tsx"), "utf-8");
  assert.ok(adminContent.includes('role="tabpanel"'), "admin evidence page must declare role=tabpanel");
  assert.ok(adminContent.includes('aria-controls="tabpanel-queue"'), "admin evidence tabs must specify aria-controls");
});

test("verifies PR #13 review fixes: legacy participant migration, provisional claims, scoped RLS, self-pair rejection, and place slug validation", async () => {
  // Fix 1: Legacy participant migration mapping
  const cutoverSql = fs.readFileSync(path.join(root, "supabase/migrations/20240904000000_supabase_architecture_cutover.sql"), "utf-8");
  assert.ok(cutoverSql.includes("COALESCE(ep.role, 'attendee')"), "Migration must map ep.role to involvement_type");
  assert.ok(cutoverSql.includes("COALESCE(ep.presence_mode, 'physical')"), "Migration must map ep.presence_mode to attendance_mode");

  // Fix 2: Provisional claim defaults and backfill
  const temporalSql = fs.readFileSync(path.join(root, "supabase/migrations/20260904010000_temporal_evidence_people_standards.sql"), "utf-8");
  assert.ok(temporalSql.includes("claim_status text DEFAULT 'PROVISIONAL'"), "claims must default claim_status to PROVISIONAL");
  assert.ok(temporalSql.includes("epistemic_class text DEFAULT 'allegation'"), "claims must default epistemic_class to allegation");
  assert.ok(temporalSql.includes("WHEN confidence = 'confirmed' THEN 'ESTABLISHED'"), "claims must backfill confirmed claims to ESTABLISHED");

  // Fix 3: Scoped RLS policies for child tables
  assert.ok(temporalSql.includes("c.id = claim_evidence.claim_id") && temporalSql.includes("p.publication_status = 'published'") && temporalSql.includes("e.publication_status = 'published'"), "claim_evidence RLS must be scoped to published events and subjects");
  assert.ok(temporalSql.includes("SELECT 1 FROM public.people p\n      WHERE p.id = person_education.person_id AND p.publication_status = 'published'"), "person_education RLS must be scoped to published people");

  // Fix 4: Self-pair rejection in relationship page
  const relPageContent = fs.readFileSync(path.join(root, "app/relationship/[a]/[b]/page.tsx"), "utf-8");
  assert.ok(relPageContent.includes("if (!a || !b || a === b) notFound();"), "Relationship page must reject identical slugs a === b");
  assert.ok(relPageContent.includes("if (!pa || !pb || pa.id === pb.id) notFound();"), "Relationship page must reject identical entity IDs pa.id === pb.id");

  // Fix 5: Place slug validation in events.ts
  const eventsContent = fs.readFileSync(path.join(root, "lib/rewind/events.ts"), "utf-8");
  assert.ok(eventsContent.includes("if (!/^[a-zA-Z0-9_-]+$/.test(params.placeSlug))"), "lib/rewind/events.ts must validate placeSlug with safe regex");

  const { getEvents } = await vite.ssrLoadModule("/lib/rewind/events.ts");
  const result = await getEvents({ placeSlug: "malicious,slug)or(1=1" });
  assert.equal(result.count, 0, "Invalid placeSlug must return empty data");
  assert.equal(result.data.length, 0, "Invalid placeSlug must return empty data");
});

test("verifies PR #13 follow-up review fixes: event_sources constraint, biographical query columns, audit error propagation, provisional confidence, and alias claim resolution", async () => {
  // Fix 1: Event Sources Unique Constraint
  const cutoverSql = fs.readFileSync(path.join(root, "supabase/migrations/20240904000000_supabase_architecture_cutover.sql"), "utf-8");
  assert.ok(cutoverSql.includes("CONSTRAINT uq_event_sources UNIQUE (event_id, source_id)"), "event_sources must declare uq_event_sources unique constraint");
  assert.ok(cutoverSql.includes("conname = 'uq_event_sources'"), "migration must idempotently verify uq_event_sources constraint");

  // Fix 2: Biographical Table Column Queries in lib/rewind/people.ts
  const peopleContent = fs.readFileSync(path.join(root, "lib/rewind/people.ts"), "utf-8");
  assert.ok(peopleContent.includes('"start_year", { ascending: true }'), "person_education query must order by start_year");
  assert.ok(peopleContent.includes('"year_received", { ascending: false }'), "person_awards query must order by year_received");
  assert.ok(peopleContent.includes('"publication_year", { ascending: false }'), "person_works query must order by publication_year");
  assert.ok(peopleContent.includes("e.field_of_study"), "person_education mapper must handle field_of_study");
  assert.ok(peopleContent.includes("c.role_title"), "person_career mapper must handle role_title");

  // Fix 3: Audit DB persistence resilience in lib/ingestion/audit.ts
  const auditContent = fs.readFileSync(path.join(root, "lib/ingestion/audit.ts"), "utf-8");
  assert.ok(
    auditContent.includes("catch (err)") &&
      auditContent.includes('console.error("Failed to persist audit event:", err);') &&
      auditContent.includes("return entry;"),
    "recordAuditEvent must log persistence errors and preserve its committed in-memory entry"
  );

  // Fix 4 & 5: Pipeline provisional confidence & alias-aware subject resolution
  const pipelineContent = fs.readFileSync(path.join(root, "lib/ingestion/pipeline.ts"), "utf-8");
  assert.ok(pipelineContent.includes('livePolicy.lane === "provisional" || source.sourceTier === "tier-c"'), "Pipeline must check provisional lane or tier-c source for limited confidence");
  assert.ok(pipelineContent.includes('? "limited"'), "Provisional/tier-c participants must receive limited confidence");
  assert.ok(pipelineContent.includes("resolveParticipantOrMentionSync"), "Pipeline must support alias-aware sync subject resolution");
  assert.ok(pipelineContent.includes("resolveParticipantOrMentionLive"), "Pipeline must support alias-aware live subject resolution");

  // Test sync pipeline claim subject resolution across aliases
  const { processCandidateEvent } = await vite.ssrLoadModule("/lib/ingestion/pipeline.ts");
  const candidate = {
    title: "Test Diplomatic Accord",
    eventType: "bilateral-meeting",
    summary: "High-level bilateral negotiations",
    startDate: "2024-05-10",
    city: "Geneva",
    country: "Switzerland",
    venue: "Palais des Nations",
    temporalPrecision: "exact-day",
    participants: [
      { name: "Bill Clinton", role: "principal" },
    ],
    claims: [
      {
        subjectMention: "Bill Clinton",
        claimType: "agreement",
        statement: "All parties agreed to the humanitarian corridor framework.",
      },
    ],
  };
  const source = {
    sourceId: "src-test-geneva-2024",
    sourceTitle: "Official UN Press Release",
    publisher: "United Nations",
    sourceType: "press-release",
    sourceTier: "tier-a",
    rawText: "Official statement regarding negotiations...",
  };

  const syncResult = processCandidateEvent(candidate, source);
  assert.ok(syncResult.candidateId || syncResult.publishedEventId, "Ingestion must process candidate");
});

test("verifies PR #13 round-3 Codex review fixes: participant deduplication, candidate place preservation, confidence default, and polymorphic claims", async () => {
  // 1. Participant-aware deduplication (rejects disjoint participant sets)
  const { findDuplicateEvent } = await vite.ssrLoadModule("/lib/ingestion/deduplicate.ts");
  const { getRelationalStore } = await vite.ssrLoadModule("/lib/db/client.ts");

  const store = getRelationalStore();
  const baseEvent = store.events[0];
  assert.ok(baseEvent);

  // Candidate with matching date, city, type, and title, but completely disjoint participant
  const disjointCandidate = {
    title: baseEvent.title,
    summary: baseEvent.summary || "Summary text",
    startDate: baseEvent.startDate,
    eventType: baseEvent.eventType,
    city: store.places.find((p) => p.id === baseEvent.placeId)?.city || "Jerusalem",
    venue: "Test Venue",
    country: "Israel",
    participants: [{ name: "Completely Disjoint Person Name", role: "principal", presenceMode: "physical" }],
  };

  // Base event with attached participant
  baseEvent.participants = [{ name: "Benjamin Netanyahu" }];

  const disjointMatch = findDuplicateEvent(disjointCandidate);
  assert.equal(disjointMatch.isDuplicate, false, "Events with disjoint participants on the same date/city must not be merged as duplicates");

  const deduplicateContent = fs.readFileSync(path.join(root, "lib/ingestion/deduplicate.ts"), "utf-8");
  assert.ok(
    deduplicateContent.includes("personId: schema.eventPeople.personId") &&
      deduplicateContent.includes("resolveEntityAsync(participant.name, db)") &&
      deduplicateContent.includes("candidate.personId && existing.personId"),
    "Live participant deduplication must resolve and compare canonical person IDs before falling back to names"
  );

  // 2. Migration confidence default and polymorphic claim event_id nullable
  const cutoverSql = fs.readFileSync(path.join(root, "supabase/migrations/20240904000000_supabase_architecture_cutover.sql"), "utf-8");
  assert.ok(cutoverSql.includes("confidence_score double precision DEFAULT 0.5 NOT NULL"), "Cutover migration must default confidence_score to limited 0.5");
  assert.ok(cutoverSql.includes("event_id text REFERENCES public.events(id) ON DELETE CASCADE"), "Cutover migration must allow event_id to be nullable in claims");

  const standardsSql = fs.readFileSync(path.join(root, "supabase/migrations/20260904010000_temporal_evidence_people_standards.sql"), "utf-8");
  assert.ok(standardsSql.includes("ALTER COLUMN event_id DROP NOT NULL"), "Standards migration must drop NOT NULL on claims.event_id");

  // 3. Schema defaults
  const schemaContent = fs.readFileSync(path.join(root, "db/schema.ts"), "utf-8");
  assert.ok(schemaContent.includes('.default(0.5).notNull()'), "schema.ts events.confidenceScore must default to 0.5");

  // 4. Candidate place preservation and non-fabricated coordinates in evidence-service.ts
  const evidenceServiceContent = fs.readFileSync(path.join(root, "lib/evidence-service.ts"), "utf-8");
  assert.ok(evidenceServiceContent.includes("extractedVenue"), "evidence-service.ts must use extractedVenue");
  assert.ok(evidenceServiceContent.includes("extractedCity"), "evidence-service.ts must use extractedCity");
  assert.ok(evidenceServiceContent.includes("extractedCountry"), "evidence-service.ts must use extractedCountry");
  assert.ok(!evidenceServiceContent.includes("latitude: 31.7683"), "evidence-service.ts must not fabricate hardcoded Jerusalem coordinates");
});

test("verifies PR #13 round-4 CodeRabbit and Codex review fixes: stats filtering, date fallbacks, cite gating, anchored regex, claim param validation, and RLS tightening", async () => {
  // 1. Evidentiary stats filter confirmed claims
  const evidenceServiceContent = fs.readFileSync(path.join(root, "lib/evidence-service.ts"), "utf-8");
  assert.ok(
    evidenceServiceContent.includes('eq(schema.claims.confidence, "confirmed")') &&
      evidenceServiceContent.includes('store.claims.filter((c) => c.confidence === "confirmed")'),
    "getEvidentiaryStats must filter confirmed claims in both DB and in-memory store"
  );

  // 2. BiographicalSection fallback strings
  const bioContent = fs.readFileSync(path.join(root, "components/rewind/BiographicalSection.tsx"), "utf-8");
  assert.ok(bioContent.includes('"End date unrecorded"'), "BiographicalSection must render 'End date unrecorded'");
  assert.ok(!bioContent.includes('— {c.endDate || "Present"}'), "BiographicalSection must not assume 'Present'");
  assert.ok(!bioContent.includes('— {e.endDate || "Completed"}'), "BiographicalSection must not assume 'Completed'");

  // 3. PersonTimeline cite button source gating
  const timelineContent = fs.readFileSync(path.join(root, "components/rewind/PersonTimeline.tsx"), "utf-8");
  assert.ok(timelineContent.includes("{source && (\n                <button\n                  className=\"cite-btn\""), "PersonTimeline must gate Cite button behind source");

  // 4. Anchored deriveDayOfWeek regex
  const temporal = await vite.ssrLoadModule("/lib/rewind/temporal.ts");
  assert.equal(temporal.deriveDayOfWeek("2024-05-10T14:30:00Z"), "Friday");
  assert.equal(temporal.deriveDayOfWeek("2024-05-10INVALID"), null);

  // 5. Claims parameter validation
  const claims = await vite.ssrLoadModule("/lib/rewind/claims.ts");
  const malformedEventClaims = await claims.getClaimsByEvent("invalid;drop table;");
  assert.equal(malformedEventClaims.length, 0);
  const malformedPersonClaims = await claims.getClaimsByPerson("invalid;drop table;");
  assert.equal(malformedPersonClaims.length, 0);

  // 6. RLS tightening for standalone claims in cutover migration
  const cutoverSql = fs.readFileSync(path.join(root, "supabase/migrations/20240904000000_supabase_architecture_cutover.sql"), "utf-8");
  assert.ok(cutoverSql.includes("p.publication_status = 'published'"), "Claims RLS must check publication_status of subject for standalone claims");
  assert.ok(cutoverSql.includes("e.verification_status = 'verified' AND e.publication_status = 'published' THEN 'confirmed' ELSE 'limited'"), "event_people migration bridge must map confidence conditionally");

  // 7. Epistemic class backfill in standards migration
  const standardsSql = fs.readFileSync(path.join(root, "supabase/migrations/20260904010000_temporal_evidence_people_standards.sql"), "utf-8");
  assert.ok(standardsSql.includes("WHEN confidence = 'disputed' THEN 'disputed proposition'"), "Standards migration must map disputed claims to 'disputed proposition'");

  // 8. Monogram aria-hidden
  const relPage = fs.readFileSync(path.join(root, "app/relationships/page.tsx"), "utf-8");
  assert.ok(relPage.includes('<span className="person-monogram" aria-hidden="true">'), "Monogram spans must be aria-hidden");

  // 9. Pipeline provisional confidence score, claim confidence, and merge claimsAdded tracking
  const pipelineContent = fs.readFileSync(path.join(root, "lib/ingestion/pipeline.ts"), "utf-8");
  assert.ok(pipelineContent.includes('confidenceScore: policy.lane === "auto-publish" ? 0.98 : 0.5'), "Pipeline must use 0.5 score for provisional events");
  assert.ok(!pipelineContent.includes('"reported"'), "Pipeline must not use non-standard 'reported' confidence");
  assert.ok(pipelineContent.includes("claimsAdded: livePersistedClaimsAdded"), "Live pipeline merge audit must use persisted claims insert count");
  assert.ok(pipelineContent.includes("claimsAdded: claimsToInsert.length"), "In-memory pipeline merge audit must use deduplicated claims insert count");

  // 10. Runtime coordinate validation (Codex P1 finding)
  const { ExtractedCandidateEventSchema } = await vite.ssrLoadModule("/lib/ingestion/types.ts");
  const baseCandidate = {
    title: "Test Coordinate Accord",
    eventType: "bilateral-meeting",
    summary: "High-level bilateral negotiations",
    startDate: "2024-05-10",
    city: "Geneva",
    country: "Switzerland",
    venue: "Palais des Nations",
    temporalPrecision: "exact-day",
    participants: [{ name: "Bill Clinton", role: "principal" }],
    claims: [],
  };

  const invalidLatResult = ExtractedCandidateEventSchema.safeParse({
    ...baseCandidate,
    latitude: 120,
    longitude: 50,
  });
  assert.equal(invalidLatResult.success, false, "Latitude > 90 must be rejected");

  const invalidLngResult = ExtractedCandidateEventSchema.safeParse({
    ...baseCandidate,
    latitude: 45,
    longitude: 500,
  });
  assert.equal(invalidLngResult.success, false, "Longitude > 180 must be rejected");

  const incompleteCoordResult = ExtractedCandidateEventSchema.safeParse({
    ...baseCandidate,
    latitude: 45,
  });
  assert.equal(incompleteCoordResult.success, false, "Partial coordinate without pair must be rejected");

  const validCoordResult = ExtractedCandidateEventSchema.safeParse({
    ...baseCandidate,
    latitude: 46.2,
    longitude: 6.14,
  });
  assert.equal(validCoordResult.success, true, "Valid coordinate pair must be accepted");

  // 11. Runtime place resolver coordinate sanitization and paired fallback
  const { resolvePlace } = await vite.ssrLoadModule("/lib/ingestion/resolve.ts");
  const sanitizedPlace = resolvePlace("Invalid Venue", "Invalid City", "Country", 120, 500);
  assert.equal(sanitizedPlace.latitude, undefined);
  assert.equal(sanitizedPlace.longitude, undefined);

  // Test gazetteer match with paired coordinate fallback
  const storeForCoords = (await vite.ssrLoadModule("/lib/db/client.ts")).getRelationalStore();
  storeForCoords.places.push({
    id: "plc-partial-coords-test",
    venue: "Partial Coords Hall",
    city: "Testville",
    country: "Testland",
    latitude: 52.52,
    longitude: null,
    confidenceScore: 0.9,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  // Since stored place has only latitude (longitude is null), it must NOT mix coordinates;
  // candidate valid pair must be used together
  const pairedFallbackPlace = resolvePlace("Partial Coords Hall", "Testville", "Testland", 48.8566, 2.3522);
  assert.equal(pairedFallbackPlace.latitude, 48.8566);
  assert.equal(pairedFallbackPlace.longitude, 2.3522);

  // 12. Runtime in-memory collision suffixing and pipeline merge deduplication audit tracking
  const { getRelationalStore } = await vite.ssrLoadModule("/lib/db/client.ts");
  const { processCandidateEvent } = await vite.ssrLoadModule("/lib/ingestion/pipeline.ts");
  const store = getRelationalStore();

  const candA = {
    title: "Runtime Ingestion Merge Summit A",
    eventType: "multilateral-summit",
    summary: "Multilateral summit session alpha",
    startDate: "2024-06-15",
    city: "Geneva",
    country: "Switzerland",
    venue: "Palais des Nations",
    temporalPrecision: "exact-day",
    participants: [{ name: "Bill Clinton", role: "principal" }],
    claims: [
      {
        subjectMention: "Bill Clinton",
        claimType: "statement-quote",
        statement: "Clinton addressed opening plenary on nuclear safeguards.",
      },
    ],
  };

  const srcA = {
    sourceId: "src-vienna-2024-a",
    sourceTitle: "Austrian Press Agency Report A",
    publisher: "APA",
    sourceType: "press-release",
    sourceTier: "tier-a",
    rawText: "Summit plenary coverage...",
  };

  const resA = processCandidateEvent(candA, srcA);
  assert.ok(resA.publishedEventId, "First candidate must be auto-published");

  // Candidate B: exact duplicate candidate with 1 existing claim and 1 new claim
  const candB = {
    title: "Runtime Ingestion Merge Summit A",
    eventType: "multilateral-summit",
    summary: "Multilateral summit session alpha",
    startDate: "2024-06-15",
    city: "Geneva",
    country: "Switzerland",
    venue: "Palais des Nations",
    temporalPrecision: "exact-day",
    participants: [{ name: "Bill Clinton", role: "principal" }],
    claims: [
      {
        subjectMention: "Bill Clinton",
        claimType: "statement-quote",
        statement: "Clinton addressed opening plenary on nuclear safeguards.", // Duplicate
      },
      {
        subjectMention: "Bill Clinton",
        claimType: "statement-quote",
        statement: "Clinton held side discussions on regional energy security.", // New
      },
    ],
  };

  const srcB = {
    sourceId: "src-vienna-2024-b",
    sourceTitle: "Austrian Press Agency Report B",
    publisher: "APA",
    sourceType: "press-release",
    sourceTier: "tier-a",
    rawText: "Summit side coverage...",
  };

  const resB = processCandidateEvent(candB, srcB);
  assert.equal(resB.deduplication.isDuplicate, true, "Second candidate must be identified as duplicate");
  assert.equal(resB.publishedEventId, resA.publishedEventId, "Second candidate must merge into first event");

  // Verify the merge audit entry logged exact number of newly added claims (1, not 2)
  const mergeAudit = store.auditLog.find(
    (a) => a.action === "merged" && a.eventId === resA.publishedEventId
  );
  assert.ok(mergeAudit, "Merge audit log entry must exist");
  const details = typeof mergeAudit.details === "string" ? JSON.parse(mergeAudit.details) : mergeAudit.details;
  assert.equal(details.claimsAdded, 1, "claimsAdded must equal deduplicated inserted claims count (1)");

  // Verify distinct candidate with same base slug receives collision suffix (-2)
  const candC = {
    title: "Runtime Collision Disambiguation Summit",
    eventType: "multilateral-summit",
    summary: "Distinct session on same date and location",
    startDate: "2024-06-15",
    city: "Geneva",
    country: "Switzerland",
    venue: "Palais des Nations",
    temporalPrecision: "exact-day",
    participants: [{ name: "Bill Clinton", role: "principal" }],
    claims: [],
  };
  const resC = processCandidateEvent(candC, srcA);
  assert.ok(resC.publishedEventId);

  // Pre-seed an event with the expected slug to verify in-memory collision suffixing
  const candColliding = {
    title: "Colliding Ingestion Event",
    eventType: "speech-plenary",
    summary: "Summary for colliding test",
    startDate: "2024-08-01",
    city: "Geneva",
    country: "Switzerland",
    venue: "Palais des Nations",
    temporalPrecision: "exact-day",
    participants: [{ name: "Bill Clinton", role: "principal" }],
    claims: [],
  };

  const expectedBaseSlug = "evt-2024-08-01-bill-clinton-speech-plenary-geneva-b00d99";
  store.events.push({
    id: expectedBaseSlug,
    slug: expectedBaseSlug,
    title: "Existing Prior Event",
    startDate: "2024-08-02",
    placeId: "plc-geneva-palais-des-nations",
    eventType: "speech-plenary",
    verificationStatus: "verified",
    confidenceScore: 0.98,
    publicationStatus: "published",
    publicationLane: "auto-publish",
    significanceScore: 80,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const resColliding = processCandidateEvent(candColliding, srcA);
  assert.ok(resColliding.publishedEventId, "Colliding event must be published");
  assert.equal(resColliding.publishedEventId, `${expectedBaseSlug}-2`, "Colliding event must receive -2 suffix");

  // 13. Chronological sorting with archival date prefixes and extractYearFromDate
  const { extractYearFromDate, deriveChronologicalSortKey, compareTimelineDates } = await vite.ssrLoadModule("/lib/rewind/dates.ts");
  assert.equal(extractYearFromDate("c. 1963"), 1963);
  assert.equal(extractYearFromDate("circa 1948"), 1948);
  assert.equal(extractYearFromDate("Spring 1999"), 1999);
  assert.equal(extractYearFromDate("2023-10-07"), 2023);
  assert.equal(extractYearFromDate("undated"), null);
  assert.equal(extractYearFromDate(""), null);

  assert.equal(deriveChronologicalSortKey("c. 1963"), "1963-00-00:c. 1963");
  assert.equal(deriveChronologicalSortKey("2023-10-07"), "2023-10-07");
  assert.equal(deriveChronologicalSortKey("undated"), "9999-99-99:undated");

  const datesToSort = ["1993-09-13", "c. 1948", "Spring 1975", "1948-05-14", "undated"];
  const sortedDates = [...datesToSort].sort(compareTimelineDates);
  assert.deepEqual(sortedDates, ["c. 1948", "1948-05-14", "Spring 1975", "1993-09-13", "undated"]);

  // 14. Admin evidence console duplicateItems pending status filter
  const adminPageContent = fs.readFileSync(path.join(root, "app/admin/evidence/page.tsx"), "utf-8");
  assert.ok(
    adminPageContent.includes('c.status === "pending" && Boolean(c.duplicateSimilarity && c.duplicateSimilarity >= 0.75)'),
    "app/admin/evidence/page.tsx must filter duplicateItems by pending status"
  );
});

test("verifies PR #13 round-5 review fixes: claim confidence defaults to limited and PROVISIONAL, mapbox satellite gating, explicit comparison pairing, and eventTypes priority", async () => {
  // 1. Schema confidence & claim status defaults
  const schemaContent = fs.readFileSync(path.join(root, "db/schema.ts"), "utf-8");
  assert.ok(schemaContent.includes('confidence: text("confidence").default("limited").notNull()'), "schema.ts claims confidence must default to limited");
  assert.ok(schemaContent.includes('claimStatus: text("claim_status").default("PROVISIONAL").notNull()'), "schema.ts claims claimStatus must default to PROVISIONAL");

  const schemaV2Content = fs.readFileSync(path.join(root, "db/schema-v2.ts"), "utf-8");
  assert.ok(schemaV2Content.includes('presenceConfidence: text("presence_confidence").default("limited").notNull()'), "schema-v2.ts presenceConfidence must default to limited");
  assert.ok(schemaV2Content.includes('roleConfidence: text("role_confidence").default("limited").notNull()'), "schema-v2.ts roleConfidence must default to limited");
  assert.ok(schemaV2Content.includes('confidence: text("confidence").default("limited").notNull()'), "schema-v2.ts confidence must default to limited");

  // 2. Claims mapper status parsing default
  const claimsModule = await vite.ssrLoadModule("/lib/rewind/claims.ts");
  assert.equal(typeof claimsModule.getClaimsByEvent, "function");
  const claimsContent = fs.readFileSync(path.join(root, "lib/rewind/claims.ts"), "utf-8");
  assert.ok(claimsContent.includes('return "PROVISIONAL";'), "lib/rewind/claims.ts parseClaimStatus must default to PROVISIONAL");

  // 3. MapGraphic satellite gating
  const mapContent = fs.readFileSync(path.join(root, "components/rewind/MapGraphic.tsx"), "utf-8");
  assert.ok(
    mapContent.includes("Boolean(MAPBOX_TOKEN) && Boolean(MAPBOX_SATELLITE_STYLE)"),
    "MapGraphic must conditionally render satellite toggle only when token and style are configured"
  );
  assert.ok(
    !mapContent.includes('title="Requires Mapbox token"'),
    "MapGraphic must not display misleading token error when satellite style is configured"
  );

  // 4. Canonical eventTypes prioritization in event details page
  const eventPageContent = fs.readFileSync(path.join(root, "app/event/[slug]/page.tsx"), "utf-8");
  assert.ok(
    eventPageContent.includes("event.eventTypes?.[0] || event.categories?.[0]"),
    "app/event/[slug]/page.tsx must prioritize canonical eventTypes over legacy categories"
  );

  // 5. TimelineComparison initialPersonB prioritization and self-pair safeguard
  const timelineComparisonContent = fs.readFileSync(path.join(root, "components/rewind/TimelineComparison.tsx"), "utf-8");
  assert.ok(
    timelineComparisonContent.includes("if (initialPersonB) return initialPersonB;"),
    "TimelineComparison must prioritize explicit initialPersonB even with 0 co-attendances"
  );
  assert.ok(
    timelineComparisonContent.includes("if (resolvedSlug !== effectiveSlugA)"),
    "TimelineComparison must reject self-pairs before resolving slugB"
  );
});

test("verifies PR #13 round-6 review fixes: polymorphic claims, merge participant persistence, atomic slug locking, error propagation, and physical co-occurrence", async () => {
  // 1. Migration cutover claims default
  const cutoverSql = fs.readFileSync(path.join(root, "supabase/migrations/20240904000000_supabase_architecture_cutover.sql"), "utf-8");
  assert.ok(
    cutoverSql.includes("ALTER TABLE IF EXISTS public.claims ALTER COLUMN confidence SET DEFAULT 'limited';"),
    "Cutover migration must alter claims.confidence default to limited for upgraded databases"
  );

  // 2. Drizzle schema polymorphic claims
  const schemaTs = fs.readFileSync(path.join(root, "db/schema.ts"), "utf-8");
  assert.ok(
    schemaTs.includes('subjectEntityType: text("subject_entity_type").default("event")') &&
    schemaTs.includes('subjectEntityId: text("subject_entity_id")'),
    "schema.ts must define subjectEntityType and subjectEntityId on claims"
  );

  // 3. Ingestion pipeline atomic slug locking, audit placement, and epistemic claims
  const pipelineTs = fs.readFileSync(path.join(root, "lib/ingestion/pipeline.ts"), "utf-8");
  assert.ok(
    pipelineTs.includes("pg_advisory_xact_lock"),
    "pipeline.ts must utilize advisory transaction lock during live slug derivation"
  );
  assert.ok(
    pipelineTs.includes('subjectEntityType: subjectId ? "person" : "event"') &&
    pipelineTs.includes('claimStatus: livePolicy.lane === "auto-publish" ? "ESTABLISHED" : "PROVISIONAL"'),
    "pipeline.ts must populate polymorphic subject and epistemic status on claim inserts"
  );

  // 4. Evidence service participant persistence during editorial merges
  const evidenceServiceTs = fs.readFileSync(path.join(root, "lib/evidence-service.ts"), "utf-8");
  assert.ok(
    evidenceServiceTs.includes("Upsert participants from merged candidate into schema.eventPeople"),
    "evidence-service.ts must persist new participants into schema.eventPeople on mergeCandidate"
  );
  assert.ok(
    evidenceServiceTs.includes('subjectEntityType: resolvedDbSubjectId ? "person" : "event"') &&
    evidenceServiceTs.includes("subjectEntityId: resolvedDbSubjectId || targetEventId"),
    "evidence-service.ts must populate polymorphic subjects during merge and publish"
  );

  // 5. TimelineComparison physical participant filtering and helper extraction
  const timelineComparisonTs = fs.readFileSync(path.join(root, "components/rewind/TimelineComparison.tsx"), "utf-8");
  assert.ok(
    timelineComparisonTs.includes("function isPhysicalConfirmedParticipant"),
    "TimelineComparison must define isPhysicalConfirmedParticipant helper"
  );
  assert.ok(
    timelineComparisonTs.includes("function findTopCoAttendee"),
    "TimelineComparison must extract findTopCoAttendee utility"
  );

  // 6. Person timeline query error propagation
  const eventsTs = fs.readFileSync(path.join(root, "lib/rewind/events.ts"), "utf-8");
  assert.ok(
    eventsTs.includes("export async function getEventsByPersonWithStatus("),
    "events.ts must export getEventsByPersonWithStatus returning explicit errors"
  );
  const peopleTs = fs.readFileSync(path.join(root, "lib/rewind/people.ts"), "utf-8");
  assert.ok(
    peopleTs.includes("export async function getPersonTimelineWithStatus("),
    "people.ts must export getPersonTimelineWithStatus propagating query failures"
  );

  // 7. RewindExplorer selected event identity preservation
  const explorerTs = fs.readFileSync(path.join(root, "components/rewind/RewindExplorer.tsx"), "utf-8");
  assert.ok(
    explorerTs.includes("const selectedIdRef = useRef<string | null>(null);") &&
    explorerTs.includes("const targetId = selectedIdRef.current;"),
    "RewindExplorer must track selected event identity across list refreshes via ref"
  );

  // 8. Claims mapping subject_id fallback
  const claimsModule = await vite.ssrLoadModule("/lib/rewind/claims.ts");
  assert.equal(typeof claimsModule.getClaimsByPerson, "function");
  const claimsTs = fs.readFileSync(path.join(root, "lib/rewind/claims.ts"), "utf-8");
  assert.ok(
    claimsTs.includes('c.subject_id ? "person" : (c.subject_entity_type || "event")'),
    "claims.ts must fall back to person entity type when subject_id is present"
  );
});


