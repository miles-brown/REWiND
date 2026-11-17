/**
 * REWIND EVIDENCE ATLAS — DATABASE ENRICHMENT AND FIELD POPULATION SCRIPT
 *
 * Forensically populates all missing fields across the live Supabase PostgreSQL database:
 * 1. Physical Addresses (public.addresses)
 * 2. Canonical Venues (public.venues)
 * 3. Sub-Venue Areas (public.venue_areas)
 * 4. Event Venue & Address Links + Descriptions (public.events)
 * 5. Complete People Demographics & Inclusion Data (public.people)
 *    - 28 Royal Aliases demographic sync
 *    - 45 Statesmen, Diplomats, Jurists & Political Figures
 *    - Master Seed inclusion and cultural impact enrichment
 *    - Legacy p-* records inclusion basis & rationale
 * 6. Official Career Roles (public.person_roles)
 * 7. Verification Audit across all tables
 */

import postgres from "postgres";
import { getPostgresSslConfig } from "../lib/db/client";
import { generateAllEnrichmentSql } from "./generate-enrichment-sql";

if (typeof (process as unknown as { loadEnvFile?: (path?: string) => void }).loadEnvFile === "function") {
  try {
    (process as unknown as { loadEnvFile: (path?: string) => void }).loadEnvFile(".env.local");
  } catch {}
  try {
    (process as unknown as { loadEnvFile: (path?: string) => void }).loadEnvFile();
  } catch {}
}

const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;

if (!connectionString) {
  console.error("❌ ERROR: DATABASE_URL or POSTGRES_URL is not set.");
  process.exit(1);
}

const isLocal =
  connectionString.includes("localhost") ||
  connectionString.includes("127.0.0.1") ||
  connectionString.includes("::1");

const sql = postgres(connectionString, {
  max: 5,
  idle_timeout: 30,
  connect_timeout: 20,
  ssl: getPostgresSslConfig(isLocal),
});

async function main() {
  console.log("================================================================================");
  console.log("REWiND Evidence Atlas — Database Enrichment & Field Population");
  console.log("================================================================================");

  const sqls = generateAllEnrichmentSql();

  // 0. Synchronize Places prerequisites
  if (sqls.placesSql.length > 0) {
    console.log(`\n📍 0. Synchronizing ${sqls.placesSql.length} Prerequisite Places...`);
    await sql.begin(async (tx) => {
      for (const stmt of sqls.placesSql) {
        await tx.unsafe(stmt);
      }
    });
    console.log("   ✅ Prerequisite places synchronized.");
  }

  // 1. Synchronize Addresses
  console.log(`\n📮 1. Synchronizing ${sqls.addressesSql.length} Physical Addresses...`);
  await sql.begin(async (tx) => {
    for (const stmt of sqls.addressesSql) {
      await tx.unsafe(stmt);
    }
  });
  const addrCount = await sql`SELECT count(*) FROM public.addresses`;
  console.log(`   ✅ Addresses synchronized: ${addrCount[0].count} total rows in public.addresses.`);

  // 2. Synchronize Venues
  console.log(`\n🏛️ 2. Synchronizing ${sqls.venuesSql.length} Canonical Venues...`);
  await sql.begin(async (tx) => {
    for (const stmt of sqls.venuesSql) {
      await tx.unsafe(stmt);
    }
  });
  const venCount = await sql`SELECT count(*) FROM public.venues`;
  console.log(`   ✅ Venues synchronized: ${venCount[0].count} total rows in public.venues.`);

  // 3. Synchronize Venue Areas
  console.log(`\n🚪 3. Synchronizing ${sqls.venueAreasSql.length} Venue Sub-Areas...`);
  await sql.begin(async (tx) => {
    for (const stmt of sqls.venueAreasSql) {
      await tx.unsafe(stmt);
    }
  });
  const areaCount = await sql`SELECT count(*) FROM public.venue_areas`;
  console.log(`   ✅ Venue Areas synchronized: ${areaCount[0].count} total rows in public.venue_areas.`);

  // 4. Synchronize Events (venue_id, address_id, description)
  console.log(`\n🗓️ 4. Synchronizing ${sqls.eventsSql.length} Events (venue_id, address_id, description)...`);
  await sql.begin(async (tx) => {
    for (const stmt of sqls.eventsSql) {
      await tx.unsafe(stmt);
    }
  });
  const evtStats = await sql`
    SELECT 
      count(*) as total,
      count(*) FILTER (WHERE venue_id IS NOT NULL) as with_venue,
      count(*) FILTER (WHERE venue_id IS NULL) as null_venue,
      count(*) FILTER (WHERE description IS NOT NULL) as with_desc,
      count(*) FILTER (WHERE description IS NULL) as null_desc
    FROM public.events
  `;
  console.log(`   ✅ Events updated: ${evtStats[0].with_venue}/${evtStats[0].total} linked to venues (Null venue: ${evtStats[0].null_venue}).`);
  console.log(`   ✅ Event Descriptions: ${evtStats[0].with_desc}/${evtStats[0].total} populated (Null desc: ${evtStats[0].null_desc}).`);

  // 5. Synchronize People (Demographics, Inclusion Basis, Rationale, Royal Aliases, Statesmen)
  console.log(`\n👤 5. Synchronizing ${sqls.peopleSql.length} People demographic & inclusion updates...`);
  await sql.begin(async (tx) => {
    for (const stmt of sqls.peopleSql) {
      await tx.unsafe(stmt);
    }
  });
  const peopleStats = await sql`
    SELECT 
      count(*) as total,
      count(*) FILTER (WHERE birth_date IS NULL) as null_birth_date,
      count(*) FILTER (WHERE nationality IS NULL OR nationality = 'International') as null_or_intl_nat,
      count(*) FILTER (WHERE cardinality(inclusion_basis) = 0) as empty_inclusion_basis,
      count(*) FILTER (WHERE inclusion_rationale IS NULL) as null_inclusion_rationale,
      count(*) FILTER (WHERE summary IS NULL) as null_summary
    FROM public.people
  `;
  console.log(`   ✅ People updated: ${peopleStats[0].total} total rows.`);
  console.log(`   - Null Birth Dates:          ${peopleStats[0].null_birth_date}`);
  console.log(`   - Null/Intl Nationalities:   ${peopleStats[0].null_or_intl_nat}`);
  console.log(`   - Empty Inclusion Basis:     ${peopleStats[0].empty_inclusion_basis}`);
  console.log(`   - Null Inclusion Rationale:  ${peopleStats[0].null_inclusion_rationale}`);
  console.log(`   - Null Summaries:            ${peopleStats[0].null_summary}`);

  // 6. Synchronize Roles
  console.log(`\n🎖️ 6. Synchronizing ${sqls.rolesSql.length} Official Career Roles...`);
  await sql.begin(async (tx) => {
    for (const stmt of sqls.rolesSql) {
      await tx.unsafe(stmt);
    }
  });
  try {
    await sql`SELECT setval(pg_get_serial_sequence('public.person_roles', 'id'), COALESCE(max(id), 1) + 1, false) FROM public.person_roles;`;
  } catch (err) {
    console.warn("   ⚠️ Sequence setval skipped:", (err as Error).message);
  }
  const roleCount = await sql`SELECT count(*) FROM public.person_roles`;
  console.log(`   ✅ Official Roles synchronized: ${roleCount[0].count} total rows in public.person_roles.`);

  // 7. Final Verification Audit
  console.log("\n================================================================================");
  console.log("📊 FORENSIC DATABASE VERIFICATION AUDIT:");
  console.log("================================================================================");
  const audit = await sql`
    SELECT
      (SELECT count(*) FROM public.people) as people_total,
      (SELECT count(*) FROM public.people WHERE birth_date IS NULL) as people_null_birth,
      (SELECT count(*) FROM public.people WHERE nationality IS NULL OR nationality = 'International') as people_null_nat,
      (SELECT count(*) FROM public.people WHERE cardinality(inclusion_basis) = 0) as people_empty_basis,
      (SELECT count(*) FROM public.places) as places_total,
      (SELECT count(*) FROM public.venues) as venues_total,
      (SELECT count(*) FROM public.addresses) as addresses_total,
      (SELECT count(*) FROM public.venue_areas) as venue_areas_total,
      (SELECT count(*) FROM public.events) as events_total,
      (SELECT count(*) FROM public.events WHERE venue_id IS NULL) as events_null_venue,
      (SELECT count(*) FROM public.events WHERE description IS NULL) as events_null_desc,
      (SELECT count(*) FROM public.sources) as sources_total,
      (SELECT count(*) FROM public.person_roles) as roles_total,
      (SELECT count(*) FROM public.person_milestones) as milestones_total
  `;

  console.log(`- People Records:         ${audit[0].people_total} (Null Birth: ${audit[0].people_null_birth}, Null Nat: ${audit[0].people_null_nat}, Empty Basis: ${audit[0].people_empty_basis})`);
  console.log(`- Places:                 ${audit[0].places_total}`);
  console.log(`- Canonical Venues:       ${audit[0].venues_total}`);
  console.log(`- Physical Addresses:     ${audit[0].addresses_total}`);
  console.log(`- Venue Sub-Areas:        ${audit[0].venue_areas_total}`);
  console.log(`- Historical Events:      ${audit[0].events_total} (Null Venue: ${audit[0].events_null_venue}, Null Desc: ${audit[0].events_null_desc})`);
  console.log(`- Sources Catalog:        ${audit[0].sources_total}`);
  console.log(`- Person Roles:           ${audit[0].roles_total}`);
  console.log(`- Person Milestones:      ${audit[0].milestones_total}`);
  console.log("================================================================================");
  console.log("🎉 Database enrichment and missing fields population completed successfully!");

  await sql.end();
}

main().catch(async (err) => {
  console.error("❌ Fatal enrichment error:", err);
  await sql.end();
  process.exit(1);
});
