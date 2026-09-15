import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../db/schema";
import { people, events, sources } from "../data/rewind";

async function main() {
  const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;

  if (!connectionString) {
    console.error("❌ ERROR: DATABASE_URL is not set in environment or .env.local.");
    console.error("Please add your Supabase connection string to .env.local: e.g. DATABASE_URL=\"postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres\"");
    process.exit(1);
  }

  console.log("🚀 Connecting to Supabase PostgreSQL database...");
  const client = postgres(connectionString, { max: 5 });
  const db = drizzle(client, { schema });

  try {
    console.log("📦 1. Seeding Coverage Programmes...");
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

    console.log(`👤 2. Seeding ${people.length} People Records...`);
    const seedPeople = people.map((p) => ({
      id: p.slug,
      slug: p.slug,
      canonicalName: p.name,
      displayName: p.name,
      nativeName: null,
      birthDate: p.birth,
      deathDate: p.death || null,
      datePrecision: "exact-day",
      nationality: "Israel",
      primaryRole: p.description,
      classification: "politician",
      notabilityBasis: "Served as recognized national Prime Minister / Head of Government",
      programmeId: "prog-heads-of-government",
      isLiving: p.death == null,
      monitoringPriority: "normal",
      publicationStatus: "published",
      summary: p.description,
    }));
    for (const person of seedPeople) {
      await db.insert(schema.people).values(person).onConflictDoNothing();
    }

    console.log("📍 3. Seeding Places Gazetteer...");
    const seedPlaces = Array.from(
      new Map(
        events.map((e) => {
          const slug = `${(e.city || "unknown").toLowerCase().replace(/\s+/g, "-")}-${(e.venueName || "general").toLowerCase().replace(/[^\w]/g, "-").slice(0, 20)}`;
          return [
            slug,
            {
              id: `plc-${slug}`,
              slug,
              venue: e.venueName || e.city || "Venue",
              city: e.city || "Unknown",
              country: e.country || "Unknown",
              latitude: e.latitude ?? null,
              longitude: e.longitude ?? null,
              placeType: "venue",
            },
          ];
        })
      ).values()
    );
    for (const place of seedPlaces) {
      await db.insert(schema.places).values(place).onConflictDoNothing();
    }

    console.log(`📚 4. Seeding ${sources.length} Primary Sources...`);
    const seedSources = sources.map((s) => ({
      id: s.id,
      title: s.title,
      publisher: s.publisher,
      sourceType: s.sourceType,
      tier: s.classification === "primary" ? "tier-a" : "tier-c",
      url: s.url || null,
      publicationDate: s.publicationDate || s.accessedDate || null,
      trustScore: s.classification === "primary" ? 1.0 : 0.8,
    }));
    for (const source of seedSources) {
      await db.insert(schema.sources).values(source).onConflictDoNothing();
    }

    console.log(`🗓️ 5. Seeding ${events.length} Historical Events...`);
    const seedEvents = events.map((e) => {
      const placeSlug = `${(e.city || "unknown").toLowerCase().replace(/\s+/g, "-")}-${(e.venueName || "general").toLowerCase().replace(/[^\w]/g, "-").slice(0, 20)}`;
      return {
        id: e.id,
        slug: e.slug,
        eventType: e.eventTypes[0] || "historical-action",
        title: e.eventName,
        summary: e.summary,
        description: e.summary || null,
        startDate: e.startDate,
        endDate: e.endDate || null,
        temporalPrecision: "exact-day",
        placeId: `plc-${placeSlug}`,
        verificationStatus: e.verificationStatus,
        confidenceScore: e.verificationStatus === "verified" ? 1.0 : 0.8,
        publicationStatus: "published",
        publicationLane: "auto-publish",
        significanceScore: 80,
      };
    });
    for (const event of seedEvents) {
      await db.insert(schema.events).values(event).onConflictDoNothing();
    }

    console.log("⚖️ 6. Seeding Atomic Evidence Claims...");
    const seedClaims = events.flatMap((e) =>
      (e.participants || []).map((p, idx) => ({
        id: `clm-${e.id}-${idx}`,
        eventId: e.id,
        subjectId: p.personId,
        claimType: "presence",
        statement: `${p.name} was present at ${e.eventName} in ${e.city}`,
        claimedTime: e.startDate,
        claimedVenue: e.venueName || e.city,
        sourceId: e.sourceIds[0] || null,
        confidence: p.presenceConfidence === "confirmed" ? "confirmed" : "reported",
        supportingExcerpt: e.summary,
      }))
    );
    for (const claim of seedClaims) {
      await db.insert(schema.claims).values(claim).onConflictDoNothing();
    }

    console.log("✅ Supabase Database Successfully Seeded & Synchronized!");
  } catch (err) {
    console.error("❌ Seed Error:", err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
