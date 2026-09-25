/**
 * REWIND EVIDENCE ATLAS — SEED SCRIPT: EXPANSION PEOPLE
 *
 * Populates PostgreSQL / Supabase with all canonical public figures from masterPeopleSeed.
 */

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../db/schema";
import { masterPeopleSeed } from "../data/seeds";

async function main() {
  const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;

  if (!connectionString) {
    console.warn("⚠️ DATABASE_URL is not set. Skipping live Supabase DB population. In-memory store updated.");
    return;
  }

  console.log("🚀 Connecting to Supabase PostgreSQL database...");
  const client = postgres(connectionString, { max: 5 });
  const db = drizzle(client, { schema });

  try {
    console.log("📦 1. Ensuring Coverage Programmes exist...");
    const programmeValues = [
      {
        id: "prog-heads-of-government",
        name: "Heads of Government & Prime Ministers",
        description: "Official public timeline coverage of recognized national Prime Ministers and Heads of Government.",
        criteria: "Hold recognized national Head of Government mandate",
        autoQualify: true,
        isActive: true,
      },
      {
        id: "prog-senior-diplomats",
        name: "Foreign Ministers & Senior Diplomats",
        description: "Coverage of bilateral treaties, multilateral summits, and diplomatic envoys.",
        criteria: "Credentialed treaty signatory or special envoy",
        autoQualify: false,
        isActive: true,
      },
      {
        id: "prog-religious-leaders",
        name: "Major Religious Authorities",
        description: "Coverage of Chief Rabbis, Papal delegations, and major denominational heads.",
        criteria: "Recognized titular leader of major denomination",
        autoQualify: false,
        isActive: true,
      },
    ];
    for (const prog of programmeValues) {
      await db.insert(schema.coverageProgrammes).values(prog).onConflictDoNothing();
    }

    console.log(`👤 2. Ingesting ${masterPeopleSeed.length} Master Public Figure Records...`);
    for (const p of masterPeopleSeed) {
      await db.insert(schema.people).values({
        id: p.id,
        slug: p.slug,
        canonicalName: p.canonicalName,
        displayName: p.displayName,
        nativeName: p.nativeName,
        birthDate: p.birthDate,
        deathDate: p.deathDate,
        datePrecision: p.datePrecision,
        nationality: p.nationality,
        primaryRole: p.primaryRole,
        classification: p.classification,
        notabilityBasis: p.notabilityBasis,
        programmeId: p.programmeId,
        isLiving: p.isLiving,
        monitoringPriority: p.monitoringPriority,
        publicationStatus: p.publicationStatus,
        wikidataId: p.wikidataId,
        viafId: p.viafId,
        avatarUrl: p.avatarUrl,
        summary: p.summary,
      }).onConflictDoNothing();

      // Insert aliases
      for (const alias of p.aliases) {
        await db.insert(schema.personAliases).values({
          personId: p.id,
          alias: alias,
          aliasType: "transliteration",
        }).onConflictDoNothing();
      }
    }

    console.log(`✅ Master Expansion Public Figures (${masterPeopleSeed.length} Records) Successfully Ingested!`);
  } catch (err) {
    console.error("❌ Ingestion Error:", err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
