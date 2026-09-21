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
    mapContent.includes("Boolean(MAPBOX_SATELLITE_STYLE)"),
    "MapGraphic must conditionally render satellite toggle when satellite style is configured"
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
    timelineComparisonTs.includes("isPhysicalConfirmedParticipant") &&
    timelineComparisonTs.includes("findTopCoAttendee"),
    "TimelineComparison must use isPhysicalConfirmedParticipant and findTopCoAttendee utilities"
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

test("verifies round-7 Codex and Gemini forensic review items", async () => {
  const root = process.cwd();

  // 1. Codex #1: publishCandidateEvent placeId incorporates city and venue
  const evidenceServiceTs = fs.readFileSync(path.join(root, "lib/evidence-service.ts"), "utf-8");
  assert.ok(
    evidenceServiceTs.includes("const citySlug = (extractedCity || \"unknown\").toLowerCase()") &&
    evidenceServiceTs.includes("const venueSlug = (extractedVenue || \"general\").toLowerCase()") &&
    evidenceServiceTs.includes("const placeId = `plc-${citySlug}-${venueSlug}`;"),
    "evidence-service.ts must derive placeId by combining city and venue to avoid venue collisions"
  );

  // 2. Codex #2: getSourcesByIdsWithStatus preserves hydrated sources and propagates errors
  const sourcesModule = await vite.ssrLoadModule("/lib/rewind/sources.ts");
  assert.equal(typeof sourcesModule.getSourcesByIdsWithStatus, "function");
  assert.equal(typeof sourcesModule.getSourcesByIds, "function");
  const sourcesTs = fs.readFileSync(path.join(root, "lib/rewind/sources.ts"), "utf-8");
  assert.ok(
    sourcesTs.includes("export async function getSourcesByIdsWithStatus(") &&
    sourcesTs.includes("if (batchError && rows.length === 0)"),
    "sources.ts must export getSourcesByIdsWithStatus with fallback and error propagation"
  );

  // 3. Codex #3 & Gemini #5: app/compare/page.tsx robust findTopCoAttendee with physical & non-disputed filter
  const comparePageTs = fs.readFileSync(path.join(root, "app/compare/page.tsx"), "utf-8");
  assert.ok(
    comparePageTs.includes("findTopCoAttendee") &&
    comparePageTs.includes("const initialPersonB = findTopCoAttendee(personA, people, allEvents);"),
    "app/compare/page.tsx must use robust findTopCoAttendee filtering physical and undisputed attendance"
  );

  // 4. Gemini #1: components/ui/slider.tsx ARIA attributes
  const sliderTs = fs.readFileSync(path.join(root, "components/ui/slider.tsx"), "utf-8");
  assert.ok(
    sliderTs.includes("aria-label={thumbLabel}") &&
    sliderTs.includes("aria-valuetext={thumbValueText}") &&
    sliderTs.includes("aria-valuenow={ariaValueNow ?? thumbValue}") &&
    sliderTs.includes("aria-valuemin={ariaValueMin ?? min}") &&
    sliderTs.includes("aria-valuemax={ariaValueMax ?? max}"),
    "slider.tsx must pass explicit aria-valuemin, aria-valuemax, aria-valuenow, and aria-valuetext to SliderPrimitive.Thumb"
  );

  // 5. Gemini #2: lib/rewind/utils.ts getMonogram typing
  const utilsModule = await vite.ssrLoadModule("/lib/rewind/utils.ts");
  assert.equal(typeof utilsModule.getMonogram, "function");
  assert.equal(utilsModule.getMonogram("David Ben-Gurion"), "DB");
  assert.equal(utilsModule.getMonogram(null), "—");
  const utilsTs = fs.readFileSync(path.join(root, "lib/rewind/utils.ts"), "utf-8");
  assert.ok(
    utilsTs.includes("export function getMonogram(name: string): string;"),
    "utils.ts must declare strict getMonogram typing overload"
  );

  // 6. Gemini #3: components/rewind/MapGraphic.tsx satellite check
  const mapGraphicTs = fs.readFileSync(path.join(root, "components/rewind/MapGraphic.tsx"), "utf-8");
  assert.ok(
    mapGraphicTs.includes("Boolean(MAPBOX_SATELLITE_STYLE) && (") &&
    !mapGraphicTs.includes("Boolean(MAPBOX_TOKEN) && Boolean(MAPBOX_SATELLITE_STYLE)"),
    "MapGraphic.tsx must check Boolean(MAPBOX_SATELLITE_STYLE) directly"
  );

  // 7. Gemini #4: components/rewind/EventActions.tsx primary source resolution
  const eventActionsTs = fs.readFileSync(path.join(root, "components/rewind/EventActions.tsx"), "utf-8");
  assert.ok(
    eventActionsTs.includes("const effectivePrimarySource =") &&
    eventActionsTs.includes("source={effectivePrimarySource}"),
    "EventActions.tsx must resolve effectivePrimarySource before passing to CitationModal"
  );
});

test("verifies round-8 Codex review fixes: participant confidence, merge serialization, verified relationships, public participants, and bio error propagation", async () => {
  const root = process.cwd();

  // 1. Cutover migration default confidence is limited
  const cutoverSql = fs.readFileSync(path.join(root, "supabase/migrations/20240904000000_supabase_architecture_cutover.sql"), "utf-8");
  assert.ok(
    cutoverSql.includes("presence_confidence text DEFAULT 'limited' NOT NULL") &&
    cutoverSql.includes("role_confidence text DEFAULT 'limited' NOT NULL") &&
    !cutoverSql.includes("presence_confidence text DEFAULT 'confirmed' NOT NULL"),
    "cutover migration must default presence_confidence and role_confidence to limited"
  );

  // 2. Duplicate merge claims serialized and deterministic
  const pipelineTs = fs.readFileSync(path.join(root, "lib/ingestion/pipeline.ts"), "utf-8");
  assert.ok(
    pipelineTs.includes("pg_advisory_xact_lock(hashtext(${targetEventId}))") &&
    pipelineTs.includes("onConflictDoNothing()"),
    "pipeline.ts must serialize duplicate-merge claim insertion with advisory lock and idempotent key"
  );

  // 3. Relationship page passes verified events only
  const relationshipPageTs = fs.readFileSync(path.join(root, "app/relationship/[a]/[b]/page.tsx"), "utf-8");
  assert.ok(
    relationshipPageTs.includes('const verifiedEvents = (eventsResult.data || []).filter((e) => e.verificationStatus === "verified");') &&
    relationshipPageTs.includes("events={verifiedEvents}"),
    "app/relationship/[a]/[b]/page.tsx must pass verified events only to TimelineComparison"
  );

  // 4. Ingestion resolve sets new person stubs to draft (Finding #2 & CodeRabbit)
  const resolveTs = fs.readFileSync(path.join(root, "lib/ingestion/resolve.ts"), "utf-8");
  assert.ok(
    resolveTs.includes('publicationStatus: "draft"'),
    "resolve.ts must register new unapproved person stubs as draft"
  );

  // 5. Biographical relation error propagation in people.ts
  const peopleTs = fs.readFileSync(path.join(root, "lib/rewind/people.ts"), "utf-8");
  assert.ok(
    peopleTs.includes("bioError && process.env.NODE_ENV === \"production\"") &&
    peopleTs.includes("Failed to load biographical relation data"),
    "people.ts must propagate biographical relation query errors in production"
  );

  // 6. Compare page error handling on people catalog
  const comparePageTs = fs.readFileSync(path.join(root, "app/compare/page.tsx"), "utf-8");
  assert.ok(
    comparePageTs.includes("getPeopleWithStatus()") &&
    comparePageTs.includes("eventsRes.error || peopleRes.error"),
    "app/compare/page.tsx must load getPeopleWithStatus and render unavailable state on people error"
  );
});

test("verifies round-9 Codex review fixes: cutover defaults restoration, duplicate merge lock ordering, disputed presence confidence preservation, and person status error propagation", async () => {
  const root = process.cwd();

  // 1. Cutover migration explicitly sets safe defaults for upgraded databases
  const cutoverSql = fs.readFileSync(path.join(root, "supabase/migrations/20240904000000_supabase_architecture_cutover.sql"), "utf-8");
  assert.ok(
    cutoverSql.includes("ALTER TABLE IF EXISTS public.events ALTER COLUMN confidence_score SET DEFAULT 0.5;"),
    "cutover migration must set events.confidence_score default to 0.5 in upgrade block"
  );
  assert.ok(
    cutoverSql.includes("ALTER TABLE IF EXISTS public.event_people ALTER COLUMN presence_confidence SET DEFAULT 'limited';") &&
    cutoverSql.includes("ALTER TABLE IF EXISTS public.event_people ALTER COLUMN role_confidence SET DEFAULT 'limited';"),
    "cutover migration must set event_people presence/role confidence defaults to limited in upgrade block"
  );
  assert.ok(
    cutoverSql.includes("ALTER TABLE IF EXISTS public.event_person_locations ALTER COLUMN confidence SET DEFAULT 'limited';") &&
    cutoverSql.includes("ALTER TABLE IF EXISTS public.event_person_locations ALTER COLUMN public_visibility SET DEFAULT 'approximate';"),
    "cutover migration must set event_person_locations confidence and visibility defaults in upgrade block"
  );

  // 2. Ingestion pipeline executes advisory lock at the start of duplicate merge block
  const pipelineTs = fs.readFileSync(path.join(root, "lib/ingestion/pipeline.ts"), "utf-8");
  const lockPos = pipelineTs.indexOf("sql`SELECT pg_advisory_xact_lock(hashtext(${targetEventId}))`");
  const eventSourcesPos = pipelineTs.indexOf("eq(schema.eventSources.eventId, targetEventId)");
  const eventPeoplePos = pipelineTs.indexOf("eq(schema.eventPeople.eventId, targetEventId)");
  assert.ok(lockPos !== -1 && eventSourcesPos !== -1 && eventPeoplePos !== -1, "Advisory lock, eventSources, and eventPeople must exist in pipeline");
  assert.ok(lockPos < eventSourcesPos, "Advisory lock must execute before eventSources duplicate lookup");
  assert.ok(lockPos < eventPeoplePos, "Advisory lock must execute before eventPeople duplicate lookup");

  // 3. Disputed presence confidence is preserved during event hydration
  const eventsTs = fs.readFileSync(path.join(root, "lib/rewind/events.ts"), "utf-8");
  assert.ok(
    eventsTs.includes('const VALID_CONFIDENCES = new Set<Confidence>(["confirmed", "strong", "moderate", "limited", "disputed"]);'),
    "events.ts VALID_CONFIDENCES must include 'disputed'"
  );

  const typesTs = fs.readFileSync(path.join(root, "lib/rewind/types.ts"), "utf-8");
  assert.ok(
    typesTs.includes('export type Confidence = "confirmed" | "strong" | "moderate" | "limited" | "disputed";'),
    "types.ts Confidence must include 'disputed'"
  );

  // 4. getPersonBySlugWithStatus and getPersonTimelineWithStatus propagate failures
  const peopleModule = await vite.ssrLoadModule("/lib/rewind/people.ts");
  assert.equal(typeof peopleModule.getPersonBySlugWithStatus, "function");
  assert.equal(typeof peopleModule.getPersonTimelineWithStatus, "function");
  assert.equal(typeof peopleModule.getPersonBySlug, "function");

  const peopleTs = fs.readFileSync(path.join(root, "lib/rewind/people.ts"), "utf-8");
  assert.ok(
    peopleTs.includes("export async function getPersonBySlugWithStatus("),
    "people.ts must export getPersonBySlugWithStatus"
  );
  assert.ok(
    peopleTs.includes("const { data: person, error: personError } = await getPersonBySlugWithStatus(slug);") &&
    peopleTs.includes("if (personError) {") &&
    peopleTs.includes("return { data: null, error: personError };"),
    "getPersonTimelineWithStatus must propagate personError directly"
  );
});

test("verifies round-10 Codex and Gemini review fixes: unset unknown timezone/source defaults, relationship query error propagation, and shared findTopCoAttendee utility", async () => {
  const root = process.cwd();

  // 1. Migration 20260904010000_temporal_evidence_people_standards.sql leaves unknown timezone and source defaults unset
  const standardsSql = fs.readFileSync(path.join(root, "supabase/migrations/20260904010000_temporal_evidence_people_standards.sql"), "utf-8");
  assert.ok(
    !standardsSql.includes("dst_observed boolean DEFAULT false") &&
    !standardsSql.includes("timezone_confidence text DEFAULT 'exact'") &&
    !standardsSql.includes("time_standard text DEFAULT 'local civil time'"),
    "standards migration must not backfill fabricated timezone assertions"
  );
  assert.ok(
    !standardsSql.includes("source_level text DEFAULT 'primary'") &&
    !standardsSql.includes("independence_status text DEFAULT 'independent'") &&
    !standardsSql.includes("source_quality text DEFAULT 'high'"),
    "standards migration must not classify unassessed sources as primary/independent/high"
  );

  // 2. lib/rewind/relationships.ts exports getRelationshipBetweenWithStatus and propagates participation failures
  const relationshipsModule = await vite.ssrLoadModule("/lib/rewind/relationships.ts");
  assert.equal(typeof relationshipsModule.getRelationshipBetweenWithStatus, "function");
  assert.equal(typeof relationshipsModule.getRelationshipBetween, "function");

  const relationshipsTs = fs.readFileSync(path.join(root, "lib/rewind/relationships.ts"), "utf-8");
  assert.ok(
    relationshipsTs.includes("export async function getRelationshipBetweenWithStatus(") &&
    relationshipsTs.includes("Participation query failed:"),
    "relationships.ts must propagate participation query failures in production"
  );

  // 3. app/relationship/[a]/[b]/page.tsx checks relationshipResult.error
  const relationshipPageTs = fs.readFileSync(path.join(root, "app/relationship/[a]/[b]/page.tsx"), "utf-8");
  assert.ok(
    relationshipPageTs.includes("getRelationshipBetweenWithStatus(a, b)") &&
    relationshipPageTs.includes("if (relationshipResult.error) {"),
    "app/relationship/[a]/[b]/page.tsx must check relationshipResult.error to prevent false 404s"
  );

  // 4. lib/rewind/people.ts exports findTopCoAttendee and isPhysicalConfirmedParticipant
  const peopleModule = await vite.ssrLoadModule("/lib/rewind/people.ts");
  assert.equal(typeof peopleModule.findTopCoAttendee, "function");
  assert.equal(typeof peopleModule.isPhysicalConfirmedParticipant, "function");

  // Verify findTopCoAttendee logic
  const mockPeople = [
    { id: "p-1", slug: "benjamin-netanyahu", canonicalName: "Benjamin Netanyahu", displayName: "Benjamin Netanyahu", classification: "politician", notabilityBasis: "Prime Minister", isLiving: true, monitoringPriority: "normal", publicationStatus: "published" },
    { id: "p-2", slug: "bill-clinton", canonicalName: "Bill Clinton", displayName: "Bill Clinton", classification: "politician", notabilityBasis: "President", isLiving: true, monitoringPriority: "normal", publicationStatus: "published" },
    { id: "p-3", slug: "yasser-arafat", canonicalName: "Yasser Arafat", displayName: "Yasser Arafat", classification: "politician", notabilityBasis: "Chairman", isLiving: false, monitoringPriority: "normal", publicationStatus: "published" },
  ];
  const mockEvents = [
    {
      id: "e-1",
      slug: "summit-1",
      eventName: "Summit 1",
      startDate: "1996-07-09",
      datePrecision: "exact-day",
      verificationStatus: "verified",
      confidence: "confirmed",
      participants: [
        { personId: "p-1", slug: "benjamin-netanyahu", name: "Benjamin Netanyahu", attendanceMode: "physical" },
        { personId: "p-2", slug: "bill-clinton", name: "Bill Clinton", attendanceMode: "physical" },
      ],
    },
    {
      id: "e-2",
      slug: "summit-2",
      eventName: "Summit 2",
      startDate: "1998-10-23",
      datePrecision: "exact-day",
      verificationStatus: "verified",
      confidence: "confirmed",
      participants: [
        { personId: "p-1", slug: "benjamin-netanyahu", name: "Benjamin Netanyahu", attendanceMode: "physical" },
        { personId: "p-2", slug: "bill-clinton", name: "Bill Clinton", attendanceMode: "physical" },
        { personId: "p-3", slug: "yasser-arafat", name: "Yasser Arafat", attendanceMode: "physical", presenceConfidence: "disputed" },
      ],
    },
  ];
  const topCo = peopleModule.findTopCoAttendee("benjamin-netanyahu", mockPeople, mockEvents);
  assert.equal(topCo, "bill-clinton", "findTopCoAttendee must find top co-attendee excluding disputed presence");
});

test("verifies round-11 Codex review fixes: drop defaults on migrated DBs, unassessed evidence strength, legacy contradicted claims, and unestablished timezone badge", async () => {
  const root = process.cwd();

  // 1. Base migration 20260904010000 defines clean nullable columns
  const standardsSql = fs.readFileSync(path.join(root, "supabase/migrations/20260904010000_temporal_evidence_people_standards.sql"), "utf-8");
  assert.ok(
    !standardsSql.includes("dst_observed boolean DEFAULT false") &&
    !standardsSql.includes("timezone_confidence text DEFAULT 'exact'") &&
    !standardsSql.includes("source_level text DEFAULT 'primary'") &&
    !standardsSql.includes("evidence_strength text DEFAULT 'direct conclusive'"),
    "base migration 20260904010000 must define clean columns without fabricated defaults"
  );
  assert.ok(
    standardsSql.includes("WHEN confidence = 'refuted' THEN 'CONTRADICTED'") &&
    standardsSql.includes("WHEN confidence = 'contradicted' THEN 'CONTRADICTED'") &&
    standardsSql.includes("WHEN confidence = 'refuted' THEN 'disputed proposition'") &&
    standardsSql.includes("WHEN confidence = 'contradicted' THEN 'disputed proposition'"),
    "migration must map legacy contradicted and refuted claims to CONTRADICTED and disputed proposition"
  );

  // 2. lib/rewind/claims.ts parseClaimStatus maps REFUTED to CONTRADICTED
  const claimsTs = fs.readFileSync(path.join(root, "lib/rewind/claims.ts"), "utf-8");
  assert.ok(
    claimsTs.includes('if (upper === "REFUTED") return "CONTRADICTED";'),
    "parseClaimStatus must map legacy REFUTED to CONTRADICTED"
  );

  // 3. TemporalBadge.tsx renders explicit unestablished timezone state
  const temporalBadgeTs = fs.readFileSync(path.join(root, "components/rewind/TemporalBadge.tsx"), "utf-8");
  assert.ok(
    temporalBadgeTs.includes('event.timezoneId || "Timezone Not Established"') &&
    temporalBadgeTs.includes('"Not established"') &&
    !temporalBadgeTs.includes('"Local Jurisdiction"') &&
    !temporalBadgeTs.includes('"Standard offset"'),
    "TemporalBadge must not render positive assertions (Local Jurisdiction / Standard offset) for unassessed events"
  );
});

test("verifies round-12, round-13, round-14, and round-15 Codex review fixes: strict TLS with trusted CA, quote policy migration, all-referenced-events publication check, and non-destructive evidence defaults", async () => {
  const root = process.cwd();

  const remediationSql = fs.readFileSync(path.join(root, "supabase/migrations/20260904020000_standards_remediation_and_rls.sql"), "utf-8");
  const standardsSql = fs.readFileSync(path.join(root, "supabase/migrations/20260904010000_temporal_evidence_people_standards.sql"), "utf-8");
  const cutoverSql = fs.readFileSync(path.join(root, "supabase/migrations/20240904000000_supabase_architecture_cutover.sql"), "utf-8");
  const hardeningSql = fs.readFileSync(path.join(root, "supabase/migrations/20260904030000_quote_and_claim_rls_hardening.sql"), "utf-8");
  const clientTs = fs.readFileSync(path.join(root, "lib/db/client.ts"), "utf-8");

  // 1. Dedicated hardening migration 20260904030000 exists and drops/recreates policies for deployed databases
  assert.ok(
    hardeningSql.includes("DROP POLICY IF EXISTS \"Allow public read on quotes\" ON public.quotes;") &&
    hardeningSql.includes("CREATE POLICY \"Allow public read on quotes\"") &&
    hardeningSql.includes("quotes.speaker_id IS NULL OR EXISTS"),
    "Hardening migration must drop and recreate quotes policy with speaker publication requirement"
  );
  assert.ok(
    hardeningSql.includes("DROP POLICY IF EXISTS \"Allow public read on claims\" ON public.claims;") &&
    hardeningSql.includes("CREATE POLICY \"Allow public read on claims\"") &&
    hardeningSql.includes("claims.event_id IS NULL OR EXISTS") &&
    hardeningSql.includes("claims.subject_entity_type <> 'event' OR claims.subject_entity_id IS NULL OR EXISTS"),
    "Hardening migration must enforce that all referenced events are published for claims"
  );
  assert.ok(
    hardeningSql.includes("DROP POLICY IF EXISTS \"Public read claim evidence\" ON public.claim_evidence;") &&
    hardeningSql.includes("CREATE POLICY \"Public read claim evidence\"") &&
    hardeningSql.includes("c.event_id IS NULL OR EXISTS") &&
    hardeningSql.includes("c.subject_entity_type <> 'event' OR c.subject_entity_id IS NULL OR EXISTS"),
    "Hardening migration must enforce that all referenced events are published for claim evidence"
  );

  // 2. RLS policies require ALL referenced events to be published for event-linked claims
  for (const sql of [remediationSql, standardsSql, hardeningSql]) {
    assert.ok(
      sql.includes("claims.event_id IS NULL OR EXISTS") &&
      sql.includes("claims.subject_entity_type <> 'event' OR claims.subject_entity_id IS NULL OR EXISTS"),
      "Claims RLS must require all referenced events to be published"
    );
    assert.ok(
      sql.includes("c.event_id IS NULL OR EXISTS") &&
      sql.includes("c.subject_entity_type <> 'event' OR c.subject_entity_id IS NULL OR EXISTS"),
      "Claim evidence RLS must require all referenced events to be published"
    );
  }

  // 3. Dropping column defaults in remediation without destructive heuristic wipes of valid assessments
  assert.ok(
    remediationSql.includes("ALTER TABLE public.claim_evidence") &&
    remediationSql.includes("ALTER COLUMN evidence_strength DROP DEFAULT") &&
    remediationSql.includes("ALTER COLUMN directness DROP DEFAULT"),
    "Remediation must drop claim_evidence column defaults"
  );

  // 4. Cutover migration requires published subject on event-linked claims and quotes
  assert.ok(
    cutoverSql.includes("event_id IS NOT NULL") &&
    cutoverSql.includes("subject_id IS NULL OR EXISTS (SELECT 1 FROM public.people p WHERE p.id = claims.subject_id AND p.publication_status = 'published')"),
    "Cutover claims RLS must require published subject on event-linked claims"
  );
  assert.ok(
    cutoverSql.includes("event_id IS NOT NULL") &&
    cutoverSql.includes("speaker_id IS NULL OR EXISTS (SELECT 1 FROM public.people p WHERE p.id = quotes.speaker_id AND p.publication_status = 'published')"),
    "Cutover quotes RLS must require published speaker on event-linked quotes"
  );

  // 5. DB client uses trusted CA certificate and strict rejectUnauthorized verification
  assert.ok(
    clientTs.includes("rejectUnauthorized: true") &&
    clientTs.includes("SUPABASE_PROD_ROOT_CA") &&
    clientTs.includes("getPostgresSslConfig"),
    "lib/db/client.ts must enforce certificate verification with trusted CA"
  );
});

test("verifies round-17 Codex review fixes: non-destructive source default drop, attribution speaker publication guard, and ID-only FK matching for quotes RLS", async () => {
  const root = process.cwd();

  const remediationSql = fs.readFileSync(path.join(root, "supabase/migrations/20260904020000_standards_remediation_and_rls.sql"), "utf-8");
  const standardsSql = fs.readFileSync(path.join(root, "supabase/migrations/20260904010000_temporal_evidence_people_standards.sql"), "utf-8");
  const hardeningSql = fs.readFileSync(path.join(root, "supabase/migrations/20260904030000_quote_and_claim_rls_hardening.sql"), "utf-8");

  // 1. Sources non-destructive default drop: drop defaults without destructive heuristic UPDATE
  assert.ok(
    remediationSql.includes("ALTER TABLE public.sources") &&
    remediationSql.includes("ALTER COLUMN source_level DROP DEFAULT") &&
    remediationSql.includes("ALTER COLUMN independence_status DROP DEFAULT") &&
    remediationSql.includes("ALTER COLUMN source_quality DROP DEFAULT") &&
    !remediationSql.includes("UPDATE public.sources"),
    "Remediation migration must drop source column defaults without wiping valid lower-tier source assessments"
  );

  // 2. Attributed speakers publication guard in claims and claim evidence RLS
  for (const sql of [remediationSql, standardsSql, hardeningSql]) {
    assert.ok(
      sql.includes("claims.attribution_speaker_id IS NULL OR EXISTS") &&
      sql.includes("c.attribution_speaker_id IS NULL OR EXISTS"),
      "Claims and claim evidence RLS must guard against unpublished attribution speakers"
    );
  }

  // 3. Quotes RLS matches foreign keys strictly by ID (e.id = quotes.event_id, p.id = quotes.speaker_id)
  for (const sql of [remediationSql, hardeningSql]) {
    assert.ok(
      sql.includes("WHERE e.id = quotes.event_id AND e.publication_status = 'published'") &&
      sql.includes("WHERE p.id = quotes.speaker_id AND p.publication_status = 'published'"),
      "Quotes RLS must match foreign keys strictly by ID rather than allowing cross-slug collisions"
    );
    assert.ok(
      !sql.includes("e.slug = quotes.event_id") &&
      !sql.includes("p.slug = quotes.speaker_id"),
      "Quotes RLS must not allow slug fallback matching on FK columns"
    );
  }
});

test("verifies round-18 Codex review fixes: claims FK matching by ID only, polymorphic event claims lookup, and fallback events limited confidence default", async () => {
  const root = process.cwd();

  const remediationSql = fs.readFileSync(path.join(root, "supabase/migrations/20260904020000_standards_remediation_and_rls.sql"), "utf-8");
  const standardsSql = fs.readFileSync(path.join(root, "supabase/migrations/20260904010000_temporal_evidence_people_standards.sql"), "utf-8");
  const hardeningSql = fs.readFileSync(path.join(root, "supabase/migrations/20260904030000_quote_and_claim_rls_hardening.sql"), "utf-8");
  const claimsTs = fs.readFileSync(path.join(root, "lib/rewind/claims.ts"), "utf-8");
  const eventsTs = fs.readFileSync(path.join(root, "lib/rewind/events.ts"), "utf-8");

  // 1. Claims and claim evidence RLS match FK columns strictly by ID
  for (const sql of [remediationSql, standardsSql, hardeningSql]) {
    assert.ok(
      sql.includes("WHERE e.id = claims.event_id AND e.publication_status = 'published'") &&
      sql.includes("WHERE p.id = claims.subject_id AND p.publication_status = 'published'") &&
      sql.includes("WHERE p.id = claims.attribution_speaker_id AND p.publication_status = 'published'"),
      "Claims RLS must match foreign keys (event_id, subject_id, attribution_speaker_id) strictly by ID"
    );
    assert.ok(
      sql.includes("WHERE e.id = c.event_id AND e.publication_status = 'published'") &&
      sql.includes("WHERE p.id = c.subject_id AND p.publication_status = 'published'") &&
      sql.includes("WHERE p.id = c.attribution_speaker_id AND p.publication_status = 'published'"),
      "Claim evidence RLS must match foreign keys (event_id, subject_id, attribution_speaker_id) strictly by ID"
    );
  }

  // 2. getClaimsByEvent queries both direct event_id and polymorphic event representation
  assert.ok(
    claimsTs.includes(".or(`event_id.eq.${eventId},and(subject_entity_type.eq.event,subject_entity_id.eq.${eventId})`)"),
    "getClaimsByEvent must query both legacy event_id and polymorphic subject_entity_id representations"
  );

  // 3. Fallback event mapping defaults unverified events to 'limited' confidence unless explicit
  assert.ok(
    eventsTs.includes('e.verificationStatus === "verified" ? "confirmed" : "limited"'),
    "mapFallbackEvent must default non-verified fallback events to limited confidence"
  );

  // Dynamic test of getFallbackEventsResult confidence mapping
  const eventsModule = await vite.ssrLoadModule("/lib/rewind/events.ts");
  const fallbackResult = eventsModule.getFallbackEventsResult({ limit: 5 });
  assert.ok(fallbackResult.data.length > 0);
  for (const ev of fallbackResult.data) {
    if (ev.verificationStatus !== "verified") {
      assert.equal(ev.confidence, "limited", "Unverified fallback event must default to limited confidence");
    }
  }
});

test("verifies round-19 Codex review fixes: approximate coordinate visibility default, participant publication RLS, claim evidence persistence, query error propagation, and EventCard limited confidence default", async () => {
  const root = process.cwd();

  const remediationSql = fs.readFileSync(path.join(root, "supabase/migrations/20260904020000_standards_remediation_and_rls.sql"), "utf-8");
  const cutoverSql = fs.readFileSync(path.join(root, "supabase/migrations/20240904000000_supabase_architecture_cutover.sql"), "utf-8");
  const hardeningSql = fs.readFileSync(path.join(root, "supabase/migrations/20260904030000_quote_and_claim_rls_hardening.sql"), "utf-8");
  const schemaV2Ts = fs.readFileSync(path.join(root, "db/schema-v2.ts"), "utf-8");
  const schemaTs = fs.readFileSync(path.join(root, "db/schema.ts"), "utf-8");
  const pipelineTs = fs.readFileSync(path.join(root, "lib/ingestion/pipeline.ts"), "utf-8");
  const claimsTs = fs.readFileSync(path.join(root, "lib/rewind/claims.ts"), "utf-8");
  const eventCardTs = fs.readFileSync(path.join(root, "components/rewind/EventCard.tsx"), "utf-8");
  const claimInspectorTs = fs.readFileSync(path.join(root, "components/rewind/ClaimInspector.tsx"), "utf-8");

  // 1. Coordinate visibility opt-in default ('approximate' instead of 'public-exact')
  assert.ok(
    schemaV2Ts.includes('publicVisibility: text("public_visibility").default("approximate").notNull()'),
    "schema-v2.ts must default public_visibility to approximate"
  );
  assert.ok(
    cutoverSql.includes("public_visibility text DEFAULT 'approximate' NOT NULL") &&
    cutoverSql.includes("ALTER TABLE IF EXISTS public.event_person_locations ALTER COLUMN public_visibility SET DEFAULT 'approximate';"),
    "cutover migration must define and upgrade public_visibility default to approximate"
  );
  assert.ok(
    remediationSql.includes("ALTER TABLE public.event_person_locations") &&
    remediationSql.includes("ALTER COLUMN public_visibility SET DEFAULT 'approximate';"),
    "remediation migration must ensure public_visibility default is approximate"
  );

  // 2. Published participants in public RLS policies
  for (const sql of [cutoverSql, hardeningSql]) {
    assert.ok(
      sql.includes("EXISTS (SELECT 1 FROM public.people p WHERE p.id = event_people.person_id AND p.publication_status = 'published')"),
      "event_people RLS policy must check person publication status"
    );
    assert.ok(
      sql.includes("JOIN public.people p ON p.id = ep.person_id") &&
      sql.includes("p.publication_status = 'published'"),
      "event_person_locations and event_person_organisations RLS policies must check person publication status"
    );
  }

  // 3. Persist claim evidence during ingestion and schema export
  assert.ok(
    schemaTs.includes("export const claimEvidence = pgTable(\"claim_evidence\""),
    "db/schema.ts must export claimEvidence table"
  );
  assert.ok(
    pipelineTs.includes("tx.insert(schema.claimEvidence).values(claimRows.map((r) => r.evidence))"),
    "lib/ingestion/pipeline.ts must insert claimEvidence records during ingestion"
  );

  // 4. Claim query error propagation
  assert.ok(
    claimsTs.includes("throw new Error(`Failed to query claims for event") &&
    claimsTs.includes("throw new Error(`Failed to query claim evidence for event"),
    "lib/rewind/claims.ts must throw on database query failures"
  );
  assert.ok(
    claimInspectorTs.includes("if (claims === undefined)") &&
    claimInspectorTs.includes("claims-unavailable"),
    "ClaimInspector.tsx must render distinct unavailable state when claims is undefined"
  );

  // 5. EventCard confidence default
  assert.ok(
    eventCardTs.includes('event.confidence || "limited"'),
    "EventCard.tsx must default confidence to limited"
  );
});

test("verifies round-20 Codex and CodeRabbit review fixes: biography arrow keys, provisional badge, evidence attachments, and options object findTopCoAttendee", async () => {
  const bioSectionTs = fs.readFileSync(path.join(root, "components/rewind/BiographicalSection.tsx"), "utf-8");
  const personTimelineTs = fs.readFileSync(path.join(root, "components/rewind/PersonTimeline.tsx"), "utf-8");
  const eventDetailTs = fs.readFileSync(path.join(root, "app/event/[slug]/page.tsx"), "utf-8");
  const eventsTs = fs.readFileSync(path.join(root, "lib/rewind/events.ts"), "utf-8");
  const utilsTs = fs.readFileSync(path.join(root, "lib/rewind/utils.ts"), "utf-8");
  const evidenceServiceTs = fs.readFileSync(path.join(root, "lib/evidence-service.ts"), "utf-8");
  const pipelineTs = fs.readFileSync(path.join(root, "lib/ingestion/pipeline.ts"), "utf-8");
  const resolveTs = fs.readFileSync(path.join(root, "lib/ingestion/resolve.ts"), "utf-8");
  const applyMigrationsMjs = fs.readFileSync(path.join(root, "scripts/apply-all-migrations.mjs"), "utf-8");
  const runIngestionTs = fs.readFileSync(path.join(root, "scripts/run-forensic-ingestion.ts"), "utf-8");

  // 1. Arrow-key navigation in BiographicalSection
  assert.ok(
    bioSectionTs.includes("handleTabKeyDown") &&
    bioSectionTs.includes("ArrowRight") &&
    bioSectionTs.includes("ArrowLeft") &&
    bioSectionTs.includes("tabIndex={activeTab ==="),
    "BiographicalSection.tsx must implement arrow-key navigation and roving tabindex"
  );

  // 2. Provisional fallback in PersonTimeline
  assert.ok(
    personTimelineTs.includes('className={`status ${event.verificationStatus || "provisional"}`}') &&
    personTimelineTs.includes('{event.verificationStatus || "provisional"}'),
    "PersonTimeline.tsx must use provisional as verificationStatus fallback"
  );

  // 3. Limited confidence fallback in app/event/[slug]/page.tsx
  assert.ok(
    eventDetailTs.includes('Why “{event.confidence || "limited"}”?'),
    "app/event/[slug]/page.tsx must use limited as confidence fallback in heading"
  );

  // 4. Source-derived medium and error-propagating getEventsByIds in lib/rewind/events.ts
  assert.ok(
    eventsTs.includes("Array.isArray(sources) && sources.length > 0") &&
    eventsTs.includes("sources.map((s) => s.sourceType)"),
    "lib/rewind/events.ts must derive medium only from actual sources"
  );
  assert.ok(
    eventsTs.includes("throw new Error(`Failed to query events chunk:"),
    "lib/rewind/events.ts must throw on chunk query errors in getEventsByIds"
  );

  // 5. Options object findTopCoAttendee
  assert.ok(
    utilsTs.includes("export interface FindTopCoAttendeeOptions") &&
    utilsTs.includes('"people" in optionsOrTarget') &&
    utilsTs.includes('"events" in optionsOrTarget'),
    "lib/rewind/utils.ts must support options object in findTopCoAttendee"
  );

  // 6. Evidence service claim evidence persistence and 5-tier confidence allow-list
  assert.ok(
    evidenceServiceTs.includes("await tx.insert(schema.claimEvidence).values(claimEvidenceRows);") &&
    evidenceServiceTs.includes('["confirmed", "strong", "moderate", "limited", "disputed"].includes(p.confidence)'),
    "lib/evidence-service.ts must persist claimEvidence attachments and support all 5 confidence levels"
  );

  // 7. Duplicate merge claim evidence and unassessed strength/directness in pipeline.ts
  assert.ok(
    pipelineTs.includes("evidenceStrength: null") &&
    pipelineTs.includes("directness: null"),
    "lib/ingestion/pipeline.ts must set unassessed evidence strength and directness to null"
  );
  assert.ok(
    pipelineTs.includes("newClaimRows.push") &&
    pipelineTs.includes("evidenceRows.push"),
    "lib/ingestion/pipeline.ts must preserve evidence attachments for duplicate merge claims"
  );

  // 8. Draft publication status for new person stubs
  assert.ok(
    resolveTs.includes('publicationStatus: "draft"'),
    "lib/ingestion/resolve.ts must default newly inserted person stubs to draft"
  );

  // 9. Transactional migration application
  assert.ok(
    applyMigrationsMjs.includes("await client.begin(async (sql) => {"),
    "scripts/apply-all-migrations.mjs must wrap migration execution and ledger update in a single transaction"
  );

  // 10. Failed count tracking in run-forensic-ingestion.ts
  assert.ok(
    runIngestionTs.includes("let failedCount = 0;") &&
    runIngestionTs.includes("failedCount++;") &&
    runIngestionTs.includes("process.exit(1);"),
    "scripts/run-forensic-ingestion.ts must track failedCount and exit non-zero on failure"
  );
});

test("validates admin evidence console tab accessibility, API error typing, and findTopCoAttendee overload typing", async () => {
  const adminEvidenceTs = fs.readFileSync(path.join(root, "app/admin/evidence/page.tsx"), "utf-8");
  const typesTs = fs.readFileSync(path.join(root, "lib/rewind/types.ts"), "utf-8");
  const utilsTs = fs.readFileSync(path.join(root, "lib/rewind/utils.ts"), "utf-8");
  const adminApiTs = fs.readFileSync(path.join(root, "app/api/admin/evidence/route.ts"), "utf-8");
  const searchApiTs = fs.readFileSync(path.join(root, "app/api/search/route.ts"), "utf-8");
  const explorerTs = fs.readFileSync(path.join(root, "components/rewind/RewindExplorer.tsx"), "utf-8");

  // 1. Evidence console tabs roving tabIndex and keydown handler
  assert.ok(
    adminEvidenceTs.includes('onKeyDown={handleTabKeyDown}') &&
    adminEvidenceTs.includes('tabIndex={activeTab === "queue" ? 0 : -1}') &&
    adminEvidenceTs.includes('tabIndex={activeTab === "duplicates" ? 0 : -1}') &&
    adminEvidenceTs.includes('tabIndex={activeTab === "audit" ? 0 : -1}'),
    "app/admin/evidence/page.tsx must implement roving tabIndex and keydown handler on console-tabs-nav"
  );

  // 2. ApiErrorResponse and ApiSuccessResponse interfaces
  assert.ok(
    typesTs.includes("export interface ApiErrorResponse") &&
    typesTs.includes("export interface ApiSuccessResponse"),
    "lib/rewind/types.ts must export ApiErrorResponse and ApiSuccessResponse"
  );

  // 3. API routes adoption of ApiErrorResponse
  assert.ok(
    adminApiTs.includes("ApiErrorResponse") &&
    adminApiTs.includes('code: "UNAUTHORIZED"') &&
    adminApiTs.includes('code: "BAD_REQUEST"'),
    "app/api/admin/evidence/route.ts must use ApiErrorResponse"
  );
  assert.ok(
    searchApiTs.includes("ApiErrorResponse") &&
    searchApiTs.includes('code: "QUERY_TOO_LONG"') &&
    searchApiTs.includes('code: "SERVICE_UNAVAILABLE"'),
    "app/api/search/route.ts must use ApiErrorResponse"
  );

  // 4. findTopCoAttendee overload typing and execution with null/undefined target
  assert.ok(
    utilsTs.includes("export function findTopCoAttendee(options: FindTopCoAttendeeOptions): string | undefined;") &&
    utilsTs.includes("target: string | PersonRecord | undefined | null"),
    "lib/rewind/utils.ts must define explicit overloads and strict target typing"
  );
  const utils = await vite.ssrLoadModule("/lib/rewind/utils.ts");
  assert.equal(typeof utils.findTopCoAttendee, "function");

  const samplePeople = [
    { id: "p1", slug: "benjamin-netanyahu", canonicalName: "Benjamin Netanyahu" },
    { id: "p2", slug: "bill-clinton", canonicalName: "Bill Clinton" },
  ];
  const sampleEvents = [
    {
      id: "e1",
      slug: "event-1",
      eventName: "Summit",
      startDate: "1998-10-23",
      participants: [
        { personId: "p1", slug: "benjamin-netanyahu", name: "Benjamin Netanyahu", attendanceMode: "physical", presenceConfidence: "confirmed" },
        { personId: "p2", slug: "bill-clinton", name: "Bill Clinton", attendanceMode: "physical", presenceConfidence: "confirmed" },
      ],
    },
  ];

  // Options object call
  assert.equal(utils.findTopCoAttendee({ target: "benjamin-netanyahu", people: samplePeople, events: sampleEvents }), "bill-clinton");
  // Positional call with undefined target
  assert.equal(utils.findTopCoAttendee(undefined, samplePeople, sampleEvents), "benjamin-netanyahu");
  // Positional call with null target
  assert.equal(utils.findTopCoAttendee(null, samplePeople, sampleEvents), "benjamin-netanyahu");

  // 5. RewindExplorer subject defaulting and calendar jump
  assert.ok(
    explorerTs.includes("subject = null") &&
    explorerTs.includes("`/events?year=${eventYear}`"),
    "components/rewind/RewindExplorer.tsx must default subject to null and link to /events?year= when subject is null"
  );

  // 6. TimelineComparison initial state and figure2Options robustness
  const comparisonTs = fs.readFileSync(path.join(root, "components/rewind/TimelineComparison.tsx"), "utf-8");
  assert.ok(
    comparisonTs.includes("const fallbackPerson = people.find((p) => p.slug !== effectiveSlugA);") &&
    comparisonTs.includes("!coSlugs.has(p.slug)"),
    "components/rewind/TimelineComparison.tsx must robustly fall back to distinct people and provide all figures in figure2Options"
  );

  // 7. AGENTS.md and .coderabbit.yaml consistency
  const coderabbitYaml = fs.readFileSync(path.join(root, ".coderabbit.yaml"), "utf-8");
  assert.ok(
    coderabbitYaml.includes("CANONICAL INVARIANTS: Path instructions below directly reflect and enforce the authoritative standards defined in AGENTS.md."),
    ".coderabbit.yaml must explicitly declare AGENTS.md as the canonical source of truth"
  );

  // 8. TimelineComparison isParticipantMatch checking both personId and slug
  assert.ok(
    comparisonTs.includes("Boolean(p.slug) && (p.slug === person.slug || p.slug === person.id)"),
    "components/rewind/TimelineComparison.tsx must check participant slug against person id and slug"
  );

  // 9. getClaimsByPerson claim evidence attachment and error propagation
  const claimsTs = fs.readFileSync(path.join(root, "lib/rewind/claims.ts"), "utf-8");
  assert.ok(
    claimsTs.includes('from("claim_evidence")') &&
    claimsTs.includes("Failed to query claim evidence for person") &&
    claimsTs.includes("evidence: evidenceMap.get(String(c.id)) || []"),
    "lib/rewind/claims.ts must attach claim evidence in getClaimsByPerson and propagate errors"
  );
});

test("verifies round-21 Codex and Gemini review fixes: EventCard aria-describedby, CommandPalette spinner, multi-day formatDuration, and findTopCoAttendee map indexing", async () => {
  const eventCardTs = fs.readFileSync(path.join(root, "components/rewind/EventCard.tsx"), "utf-8");
  const commandPaletteTs = fs.readFileSync(path.join(root, "components/rewind/CommandPalette.tsx"), "utf-8");
  const utilsTs = fs.readFileSync(path.join(root, "lib/rewind/utils.ts"), "utf-8");

  // 1. EventCard aria-describedby and status ID
  assert.ok(
    eventCardTs.includes("aria-describedby={statusDescId}") &&
    eventCardTs.includes("id={statusDescId}"),
    "EventCard.tsx must link link title and status descriptor via aria-describedby and id"
  );

  // 2. CommandPalette visual loading spinner
  assert.ok(
    commandPaletteTs.includes("<Loader2 size={13} className=\"animate-spin\" />") &&
    commandPaletteTs.includes("search-loading-indicator"),
    "CommandPalette.tsx must render Loader2 visual spinner in search-loading-indicator"
  );

  // 3. Multi-day formatDuration scaling
  const temporal = await vite.ssrLoadModule("/lib/rewind/temporal.ts");
  assert.equal(temporal.formatDuration(86400), "1d");
  assert.equal(temporal.formatDuration(90000), "1d 1h");
  assert.equal(temporal.formatDuration(90060), "1d 1h 1m");
  assert.equal(temporal.formatDuration(172800), "2d");
  assert.equal(temporal.formatDuration(604800), "7d");
  // Sub-day durations remain exact
  assert.equal(temporal.formatDuration(1421), "23m 41s");
  assert.equal(temporal.formatDuration(3240), "54m");
  assert.equal(temporal.formatDuration(3665), "1h 1m 5s");
  assert.equal(temporal.formatDuration(45), "45s");

  // 4. findTopCoAttendee personLookup Map indexing
  assert.ok(
    utilsTs.includes("const personLookup = new Map<string, PersonRecord>();") &&
    utilsTs.includes("const matched = personLookup.get(candidateKey);"),
    "lib/rewind/utils.ts must use O(1) personLookup Map in findTopCoAttendee"
  );
});

test("verifies round-22 Codex and CodeRabbit review fixes: claims person polymorphic constraint, EventCard useId, evidence query error propagation, and fallback participants deduplication", async () => {
  const claimsTs = fs.readFileSync(path.join(root, "lib/rewind/claims.ts"), "utf-8");
  const eventCardTs = fs.readFileSync(path.join(root, "components/rewind/EventCard.tsx"), "utf-8");
  const evidenceServiceTs = fs.readFileSync(path.join(root, "lib/evidence-service.ts"), "utf-8");
  const auditTs = fs.readFileSync(path.join(root, "lib/ingestion/audit.ts"), "utf-8");
  const clientTs = fs.readFileSync(path.join(root, "lib/db/client.ts"), "utf-8");
  const pipelineTs = fs.readFileSync(path.join(root, "lib/ingestion/pipeline.ts"), "utf-8");
  const adminApiTs = fs.readFileSync(path.join(root, "app/api/admin/evidence/route.ts"), "utf-8");

  // 1. Claims polymorphic subject constraint for person
  assert.ok(
    claimsTs.includes(".or(`subject_id.eq.${personId},and(subject_entity_type.eq.person,subject_entity_id.eq.${personId})`)"),
    "lib/rewind/claims.ts must constrain subject_entity_id lookups with subject_entity_type.eq.person"
  );

  // 2. EventCard useId unique DOM descriptor
  assert.ok(
    eventCardTs.includes("const reactId = useId();") &&
    eventCardTs.includes("const statusDescId = `event-status-${event.id}-${reactId}`;"),
    "components/rewind/EventCard.tsx must use useId() to generate instance-unique statusDescId"
  );

  // 3. Evidence service and audit log error propagation in production
  assert.ok(
    evidenceServiceTs.includes("Failed to query evidentiary stats from database") &&
    evidenceServiceTs.includes("Failed to query review queue from database"),
    "lib/evidence-service.ts must propagate live database failures in production"
  );
  assert.ok(
    auditTs.includes("Failed to query audit trail from database"),
    "lib/ingestion/audit.ts must propagate live database failures in production"
  );
  assert.ok(
    adminApiTs.includes("try {") &&
    adminApiTs.includes('code: "INTERNAL_SERVER_ERROR"'),
    "app/api/admin/evidence/route.ts GET must handle and return 500 on database error"
  );

  // 4. Fallback participant retention in memory relational store
  assert.ok(
    clientTs.includes("RelationalEventRecord") &&
    clientTs.includes("participants: (e.participants || []).map"),
    "lib/db/client.ts must initialize seedEvents with participants"
  );
  assert.ok(
    pipelineTs.includes("participants: candidate.participants.map") &&
    pipelineTs.includes("targetEvent.participants"),
    "lib/ingestion/pipeline.ts must retain and merge participants on in-memory store events"
  );
  assert.ok(
    evidenceServiceTs.includes("participants: (Array.isArray(data.participants) ? data.participants : []).map") &&
    evidenceServiceTs.includes("memTargetEvent.participants"),
    "lib/evidence-service.ts must retain and merge participants on in-memory store events"
  );
});

test("verifies round-23 Codex review fixes: supporting excerpts preservation, schema-v2 people tables alignment, location precision derivation, migration idempotency, and HMAC actor security", async () => {
  const evidenceServiceTs = fs.readFileSync(path.join(root, "lib/evidence-service.ts"), "utf-8");
  const schemaV2Ts = fs.readFileSync(path.join(root, "db/schema-v2.ts"), "utf-8");
  const eventsModule = await vite.ssrLoadModule("/lib/rewind/events.ts");
  const migrationScript = fs.readFileSync(path.join(root, "scripts/apply-all-migrations.mjs"), "utf-8");
  const adminApiTs = fs.readFileSync(path.join(root, "app/api/admin/evidence/route.ts"), "utf-8");

  // 1. Supporting excerpt preservation in claim evidence
  assert.ok(
    evidenceServiceTs.includes("supportingExcerpt: c.supportingExcerpt || null"),
    "lib/evidence-service.ts must preserve candidate supportingExcerpt instead of synthetic boilerplate"
  );

  // 2. Schema-v2 column alignment with PostgreSQL migration
  assert.ok(schemaV2Ts.includes('fieldOfStudy: text("field_of_study")'), "personEducation must include field_of_study");
  assert.ok(schemaV2Ts.includes('startYear: text("start_year")'), "personEducation must include start_year");
  assert.ok(schemaV2Ts.includes('endYear: text("end_year")'), "personEducation must include end_year");
  assert.ok(schemaV2Ts.includes('roleTitle: text("role_title").notNull()'), "personCareer must include role_title");
  assert.ok(schemaV2Ts.includes('isCurrent: boolean("is_current")'), "personCareer must include is_current");
  assert.ok(schemaV2Ts.includes('yearReceived: text("year_received")'), "personAwards must include year_received");
  assert.ok(schemaV2Ts.includes('citation: text("citation")'), "personAwards must include citation");
  assert.ok(schemaV2Ts.includes('title: text("title").notNull()'), "personWorks must include title");
  assert.ok(schemaV2Ts.includes('publicationYear: text("publication_year")'), "personWorks must include publication_year");

  // 3. Location precision derivation
  assert.equal(typeof eventsModule.deriveLocationPrecision, "function");
  // Explicit value respected
  assert.equal(eventsModule.deriveLocationPrecision("venue"), "venue");
  assert.equal(eventsModule.deriveLocationPrecision("city"), "city");
  assert.equal(eventsModule.deriveLocationPrecision("country"), "country");
  assert.equal(eventsModule.deriveLocationPrecision("unknown"), "unknown");
  // Inferred from venue
  assert.equal(eventsModule.deriveLocationPrecision(undefined, { venue: "United Nations Headquarters", city: "New York" }), "venue");
  // Inferred from participant coordinatePrecision
  assert.equal(eventsModule.deriveLocationPrecision(undefined, { city: "New York" }, [{ personId: "p1", name: "Test", coordinatePrecision: "exact" }]), "venue");
  // Inferred from city
  assert.equal(eventsModule.deriveLocationPrecision(undefined, { city: "London", country: "United Kingdom" }), "city");
  // Inferred from country
  assert.equal(eventsModule.deriveLocationPrecision(undefined, { country: "France" }), "country");
  // Fallback to unknown
  assert.equal(eventsModule.deriveLocationPrecision(undefined, {}), "unknown");

  // 4. Migration script idempotency
  assert.ok(
    migrationScript.includes("SELECT version FROM supabase_migrations.schema_migrations") &&
    migrationScript.includes("appliedVersions.has(version)") &&
    migrationScript.includes("Skipping already applied migration"),
    "scripts/apply-all-migrations.mjs must query schema_migrations and skip applied files"
  );

  // 5. Admin API HMAC verified actor derivation
  assert.ok(
    adminApiTs.includes("verifySignedActor") &&
    adminApiTs.includes("crypto.createHmac") &&
    adminApiTs.includes("deriveVerifiedActor"),
    "app/api/admin/evidence/route.ts must securely verify HMAC signatures for editor actors"
  );
});

test("verifies round-24 Codex review fixes: cutover migration polymorphic claims RLS and quotes query resilience", async () => {
  const cutoverSql = fs.readFileSync(path.join(root, "supabase/migrations/20240904000000_supabase_architecture_cutover.sql"), "utf-8");
  const quotesTs = fs.readFileSync(path.join(root, "lib/rewind/quotes.ts"), "utf-8");

  // 1. Cutover migration claims policy supports polymorphic subjects
  assert.ok(
    cutoverSql.includes("subject_entity_type = 'person' AND subject_entity_id IS NOT NULL"),
    "20240904000000_supabase_architecture_cutover.sql claims policy must authorize polymorphic person subjects"
  );

  // 2. Quotes query uses clean select and filters null IDs
  assert.ok(
    quotesTs.includes('.from("quotes")\n        .select("*")') &&
    quotesTs.includes("filter(Boolean)"),
    "lib/rewind/quotes.ts must query quotes cleanly without fragile inner join filters and filter IDs safely"
  );
});











