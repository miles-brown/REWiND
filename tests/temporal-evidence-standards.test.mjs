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
