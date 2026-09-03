import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@/db/schema";
import { people, events, sources } from "@/data/rewind";

const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;

export const isLiveDbConnected = Boolean(
  connectionString && (connectionString.startsWith("postgres://") || connectionString.startsWith("postgresql://"))
);

// Global Drizzle ORM client connected to live PostgreSQL / Supabase
let liveDb: ReturnType<typeof drizzle<typeof schema>> | null = null;

export function getDb() {
  if (liveDb) return liveDb;
  if (isLiveDbConnected && connectionString) {
    const client = postgres(connectionString, { max: 10, prepare: false });
    liveDb = drizzle(client, { schema });
    return liveDb;
  }
  return null;
}

// In-memory relational state cache used when a live PostgreSQL instance is not configured
export interface MemoryRelationalStore {
  people: typeof schema.people.$inferSelect[];
  places: typeof schema.places.$inferSelect[];
  events: typeof schema.events.$inferSelect[];
  sources: typeof schema.sources.$inferSelect[];
  claims: typeof schema.claims.$inferSelect[];
  candidateEvents: typeof schema.candidateEvents.$inferSelect[];
  auditLog: typeof schema.auditLog.$inferSelect[];
}

function initializeSeedStore(): MemoryRelationalStore {
  const seedPeople: typeof schema.people.$inferSelect[] = (people || []).map((p) => ({
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
    wikidataId: null,
    viafId: null,
    avatarUrl: null,
    summary: p.description,
    createdAt: new Date(),
    updatedAt: new Date(),
  }));

  const seedPlaces: typeof schema.places.$inferSelect[] = Array.from(
    new Map(
      (events || []).map((e) => {
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

  const seedSources: typeof schema.sources.$inferSelect[] = (sources || []).map((s) => ({
    id: s.id,
    title: s.title,
    publisher: s.publisher,
    sourceType: s.sourceType,
    tier: s.classification === "primary" ? "tier-a" : "tier-c",
    url: s.url || null,
    archiveUrl: null,
    author: null,
    publicationDate: s.publicationDate || s.accessedDate || null,
    trustScore: s.classification === "primary" ? 1.0 : 0.8,
  }));

  const seedEvents: typeof schema.events.$inferSelect[] = (events || []).map((e) => {
    const placeSlug = `${(e.city || "unknown").toLowerCase().replace(/\s+/g, "-")}-${(e.venueName || "general").toLowerCase().replace(/[^\w]/g, "-").slice(0, 20)}`;
    return {
      id: e.id,
      slug: e.slug,
      parentId: null,
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
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  });

  const seedClaims: typeof schema.claims.$inferSelect[] = (events || []).flatMap((e) =>
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

  return {
    people: seedPeople,
    places: seedPlaces,
    events: seedEvents,
    sources: seedSources,
    claims: seedClaims,
    candidateEvents: [],
    auditLog: [],
  };
}

// Global persistent instance in Node runtime
const globalStoreKey = Symbol.for("rewind.relational.store");
const globalObj = globalThis as unknown as { [key: symbol]: MemoryRelationalStore };

export function getRelationalStore(): MemoryRelationalStore {
  if (!globalObj[globalStoreKey]) {
    globalObj[globalStoreKey] = initializeSeedStore();
  }
  return globalObj[globalStoreKey];
}
