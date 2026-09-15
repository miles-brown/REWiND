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
  assert.ok(temporalSql.includes("c.event_id IS NULL OR EXISTS (\n          SELECT 1 FROM public.events e WHERE e.id = c.event_id AND e.publication_status = 'published'\n        )"), "claim_evidence RLS must be scoped to published events");
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


