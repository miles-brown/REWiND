import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@/db/schema";
import { people, events, sources } from "@/archive/legacy-data/rewind";

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
  people: (typeof schema.people.$inferSelect)[];
  personAliases: (typeof schema.personAliases.$inferSelect)[];
  places: (typeof schema.places.$inferSelect)[];
  events: (typeof schema.events.$inferSelect)[];
  sources: (typeof schema.sources.$inferSelect)[];
  claims: (typeof schema.claims.$inferSelect)[];
  candidateEvents: (typeof schema.candidateEvents.$inferSelect)[];
  auditLog: (typeof schema.auditLog.$inferSelect)[];
}

function resolvePersonMetadata(p: (typeof people)[0]): {
  nationality: string;
  classification: string;
  programmeId: string;
  notabilityBasis: string;
} {
  const nameLower = p.name.toLowerCase();
  const descLower = p.description.toLowerCase();

  if (nameLower.includes("clinton") || nameLower.includes("obama") || nameLower.includes("biden") || nameLower.includes("bush") || nameLower.includes("trump")) {
    return {
      nationality: "United States",
      classification: "head-of-state",
      programmeId: "prog-heads-of-state",
      notabilityBasis: "President of the United States",
    };
  }
  if (nameLower.includes("arafat") || nameLower.includes("abbas")) {
    return {
      nationality: "State of Palestine",
      classification: "head-of-state",
      programmeId: "prog-heads-of-state",
      notabilityBasis: "Chairman of the PLO / President of Palestinian National Authority",
    };
  }
  if (nameLower.includes("hussein") || nameLower.includes("abdullah")) {
    return {
      nationality: "Jordan",
      classification: "monarch",
      programmeId: "prog-heads-of-state",
      notabilityBasis: "King of the Hashemite Kingdom of Jordan",
    };
  }
  if (nameLower.includes("sadat") || nameLower.includes("mubarak") || nameLower.includes("sisi")) {
    return {
      nationality: "Egypt",
      classification: "head-of-state",
      programmeId: "prog-heads-of-state",
      notabilityBasis: "President of the Arab Republic of Egypt",
    };
  }

  // Israeli Prime Ministers & Leaders
  return {
    nationality: "Israel",
    classification: descLower.includes("president") ? "head-of-state" : "prime-minister",
    programmeId: descLower.includes("president") ? "prog-heads-of-state" : "prog-heads-of-government",
    notabilityBasis: `Served as recognized national ${descLower.includes("president") ? "President" : "Prime Minister"} of Israel`,
  };
}

function mapToCanonicalEventType(categories: string[], types: string[]): "bilateral-meeting" | "multilateral-summit" | "speech-plenary" | "press-conference" | "interview" | "official-visit" | "signing-ceremony" | "parliamentary-debate" | "historical-action" {
  const allTags = [...(categories || []), ...(types || [])].map((t) => t.toLowerCase()).join(" ");

  if (allTags.includes("speech") || allTags.includes("address") || allTags.includes("knesset") || allTags.includes("plenary")) {
    return "speech-plenary";
  }
  if (allTags.includes("summit") || allTags.includes("treaty") || allTags.includes("accord") || allTags.includes("peace")) {
    return "multilateral-summit";
  }
  if (allTags.includes("bilateral") || allTags.includes("meeting") || allTags.includes("talks") || allTags.includes("diplomatic")) {
    return "bilateral-meeting";
  }
  if (allTags.includes("press") || allTags.includes("conference") || allTags.includes("briefing")) {
    return "press-conference";
  }
  if (allTags.includes("signing") || allTags.includes("ceremony")) {
    return "signing-ceremony";
  }
  if (allTags.includes("visit") || allTags.includes("trip") || allTags.includes("travel")) {
    return "official-visit";
  }
  if (allTags.includes("interview")) {
    return "interview";
  }
  if (allTags.includes("parliament") || allTags.includes("debate") || allTags.includes("legislation")) {
    return "parliamentary-debate";
  }

  return "historical-action";
}

function initializeSeedStore(): MemoryRelationalStore {
  const personIdToSlug = new Map((people || []).map((p) => [p.id, p.slug]));

  const seedPeople: (typeof schema.people.$inferSelect)[] = (people || []).map((p) => {
    const meta = resolvePersonMetadata(p);
    return {
      id: p.slug,
      slug: p.slug,
      canonicalName: p.name,
      displayName: p.name,
      nativeName: null,
      birthDate: p.birth,
      deathDate: p.death || null,
      datePrecision: "exact-day",
      nationality: meta.nationality,
      primaryRole: p.description,
      classification: meta.classification,
      notabilityBasis: meta.notabilityBasis,
      programmeId: meta.programmeId,
      isLiving: p.death == null,
      monitoringPriority: "normal",
      publicationStatus: "published",
      wikidataId: null,
      viafId: null,
      avatarUrl: null,
      summary: p.description,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  });

  let aliasCounter = 1;
  const seedAliases: (typeof schema.personAliases.$inferSelect)[] = (people || []).flatMap((p) => [
    {
      id: aliasCounter++,
      personId: p.slug,
      alias: p.name,
      aliasType: "name",
    },
    {
      id: aliasCounter++,
      personId: p.slug,
      alias: p.id,
      aliasType: "id",
    },
  ]);

  const seedPlaces: (typeof schema.places.$inferSelect)[] = Array.from(
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

  const seedSources: (typeof schema.sources.$inferSelect)[] = (sources || []).map((s) => ({
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

  const seedEvents: (typeof schema.events.$inferSelect)[] = (events || []).map((e) => {
    const placeSlug = `${(e.city || "unknown").toLowerCase().replace(/\s+/g, "-")}-${(e.venueName || "general").toLowerCase().replace(/[^\w]/g, "-").slice(0, 20)}`;
    const canonicalType = mapToCanonicalEventType(e.categories, e.eventTypes);
    return {
      id: e.id,
      slug: e.slug,
      parentId: null,
      eventType: canonicalType,
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

  const seedClaims: (typeof schema.claims.$inferSelect)[] = (events || []).flatMap((e) =>
    (e.participants || []).map((p, idx) => ({
      id: `clm-${e.id}-${idx}`,
      eventId: e.id,
      subjectId: personIdToSlug.get(p.personId) || p.personId,
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
    personAliases: seedAliases,
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
