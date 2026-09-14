import { createRequire } from "node:module";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@/db/schema";
import type { TestPerson, TestEvent, TestSource } from "./test-fixtures";

export function isLocalDatabaseHost(connStr: string): boolean {
  try {
    const url = new URL(connStr);
    const host = url.hostname.replace(/^\[|\]$/g, "").toLowerCase();
    return (
      host === "localhost" ||
      host === "127.0.0.1" ||
      host === "::1"
    );
  } catch {
    return false;
  }
}

const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;

export const isLiveDbConnected = Boolean(
  connectionString && (connectionString.startsWith("postgres://") || connectionString.startsWith("postgresql://"))
);

// Global Drizzle ORM client connected to live PostgreSQL / Supabase
let liveDb: ReturnType<typeof drizzle<typeof schema>> | null = null;
let isDbTemporarilyUnreachable = false;

export function markDbUnreachable() {
  isDbTemporarilyUnreachable = true;
  liveDb = null;
}

/**
 * Returns the singleton Drizzle ORM client connected to live PostgreSQL.
 *
 * Security & Forensic Data Integrity Note:
 * - Production / Remote Environments (Supabase, AWS RDS, etc.): Strict TLS certificate
 *   verification (`ssl: "verify-full"`) is strictly enforced to prevent man-in-the-middle (MITM)
 *   eavesdropping and ensure evidentiary integrity of historical records in transit.
 * - Local Development: `ssl: false` is conditionally allowed ONLY for local loopback hosts
 *   (`localhost`, `127.0.0.1`, `::1`) where local PostgreSQL instances operate without TLS.
 *   Non-local environments MUST never disable SSL.
 */
export function getDb() {
  if (isDbTemporarilyUnreachable) return null;
  if (liveDb) return liveDb;
  if (isLiveDbConnected && connectionString) {
    try {
      const isLocal = isLocalDatabaseHost(connectionString);
      const client = postgres(connectionString, {
        max: 5,
        connect_timeout: 2,
        idle_timeout: 5,
        prepare: false,
        ssl: isLocal ? false : "verify-full",
      });
      liveDb = drizzle(client, { schema });
      return liveDb;
    } catch {
      isDbTemporarilyUnreachable = true;
      return null;
    }
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
  quotes: (typeof schema.quotes.$inferSelect)[];
}

function resolvePersonMetadata(p: TestPerson): {
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
  // In production, fallback in-memory store is empty to ensure no prototype records enter the production path
  if (process.env.NODE_ENV === "production") {
    return {
      people: [],
      personAliases: [],
      places: [],
      events: [],
      sources: [],
      claims: [],
      candidateEvents: [],
      auditLog: [],
      quotes: [],
    };
  }

  // Load test fixtures dynamically in non-production environments to avoid polluting production bundles
  const nodeRequire = createRequire(import.meta.url);
  let fixtures: {
    testPeople: TestPerson[];
    testEvents: TestEvent[];
    testSources: TestSource[];
  } = { testPeople: [], testEvents: [], testSources: [] };

  try {
    const fs = nodeRequire("node:fs");
    const path = nodeRequire("node:path");
    const resolvedPath = path.resolve(process.cwd(), "lib/db/test-fixtures.json");
    if (fs.existsSync(resolvedPath)) {
      fixtures = JSON.parse(fs.readFileSync(resolvedPath, "utf-8"));
    } else {
      fixtures = nodeRequire("./test-fixtures.json");
    }
  } catch {
    try {
      fixtures = nodeRequire("./test-fixtures.json");
    } catch (e) {
      console.warn("Failed to load test-fixtures.json:", e);
    }
  }
  const people = fixtures.testPeople;
  const events = fixtures.testEvents;
  const sources = fixtures.testSources;

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
      seriesId: null,
      venueId: null,
      addressId: null,
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

  const seedCandidateEvents: (typeof schema.candidateEvents.$inferSelect)[] = [
    {
      id: "cand-un-20110923-001",
      fingerprint: "fp_unga_20110923_netanyahu_plenary",
      suggestedTitle: "Netanyahu Addresses 66th Session of UN General Assembly",
      suggestedDate: "2011-09-23",
      suggestedPlace: "UN General Assembly Hall, New York",
      suggestedParticipants: JSON.stringify([{ name: "Benjamin Netanyahu", role: "speaker" }, { name: "Ban Ki-moon", role: "un-secretary-general" }]),
      primarySourceTier: "tier-a",
      assignedLane: "auto-publish",
      duplicateMatchId: null,
      duplicateSimilarity: 0.08,
      status: "pending",
      rejectionReason: null,
      createdAt: new Date(Date.now() - 3600000 * 2),
      rawExtraction: JSON.stringify({
        summary: "Prime Minister Benjamin Netanyahu delivers an official plenary address before the 66th UN General Assembly, articulating proposals for immediate bilateral negotiations.",
        eventType: "speech-plenary",
        venue: "UN General Assembly Hall",
        city: "New York",
        country: "United States",
        sourceId: "src-un-ga-66-plenary",
        sourceTitle: "United Nations Official Records: 66th Plenary Meeting",
        sourcePublisher: "United Nations Secretariat",
        sourceTier: "tier-a",
        claims: [
          {
            subjectMention: "Benjamin Netanyahu",
            claimType: "presence",
            statement: "Physically addressed the 66th session of the United Nations General Assembly in New York.",
            claimedTime: "2011-09-23T15:30:00Z",
            claimedVenue: "General Assembly Hall",
            supportingExcerpt: "Prime Minister Netanyahu: 'I have come to New York to speak the truth... I extend my hand to President Abbas.'",
          },
          {
            subjectMention: "Benjamin Netanyahu",
            claimType: "statement",
            statement: "Proposed direct and unconditional bilateral peace negotiations in Jerusalem and Ramallah.",
            supportingExcerpt: "'Let us meet today in the United Nations... Let us talk peace.'",
          },
        ],
        participants: [
          { name: "Benjamin Netanyahu", role: "Prime Minister of Israel" },
          { name: "Ban Ki-moon", role: "UN Secretary General" },
        ],
      }),
    },
    {
      id: "cand-wye-19981023-002",
      fingerprint: "fp_wye_river_19981023_concluding_summit",
      suggestedTitle: "Wye River Summit Bilateral Accord Signing",
      suggestedDate: "1998-10-23",
      suggestedPlace: "Wye River Conference Center, Queenstown, MD",
      suggestedParticipants: JSON.stringify([{ name: "Benjamin Netanyahu" }, { name: "Yasser Arafat" }, { name: "Bill Clinton" }]),
      primarySourceTier: "tier-a",
      assignedLane: "provisional",
      duplicateMatchId: "evt-1998-10-23-wye-river",
      duplicateSimilarity: 0.92,
      status: "pending",
      rejectionReason: null,
      createdAt: new Date(Date.now() - 3600000 * 5),
      rawExtraction: JSON.stringify({
        summary: "Concluding plenary ceremony of the Wye River Summit with President Clinton and Chairman Arafat, agreeing to reciprocal implementation steps.",
        eventType: "signing-ceremony",
        venue: "Wye River Conference Center",
        city: "Queenstown",
        country: "United States",
        sourceId: "src-state-dept-wye-1998",
        sourceTitle: "U.S. Department of State Archive: The Wye River Memorandum",
        sourcePublisher: "U.S. Department of State",
        sourceTier: "tier-a",
        claims: [
          {
            subjectMention: "Benjamin Netanyahu",
            claimType: "presence",
            statement: "Signed the Wye River Memorandum alongside Chairman Yasser Arafat and President Bill Clinton.",
            claimedTime: "1998-10-23T18:00:00Z",
            claimedVenue: "Wye River Conference Center",
            supportingExcerpt: "Ceremony concluding nine days of intensive negotiations at the Aspen Institute Wye River facility.",
          },
        ],
        participants: [
          { name: "Benjamin Netanyahu", role: "Prime Minister of Israel" },
          { name: "Yasser Arafat", role: "Chairman, PLO" },
          { name: "Bill Clinton", role: "President of the United States" },
        ],
      }),
    },
    {
      id: "cand-amm-19970116-003",
      fingerprint: "fp_amman_palace_19970116_hebron_consult",
      suggestedTitle: "Consultative Bilateral Session with King Hussein on Hebron Redeployment",
      suggestedDate: "1997-01-16",
      suggestedPlace: "Raghadan Palace, Amman",
      suggestedParticipants: JSON.stringify([{ name: "Benjamin Netanyahu" }, { name: "King Hussein of Jordan" }]),
      primarySourceTier: "tier-b",
      assignedLane: "human-review",
      duplicateMatchId: null,
      duplicateSimilarity: 0.14,
      status: "pending",
      rejectionReason: null,
      createdAt: new Date(Date.now() - 3600000 * 8),
      rawExtraction: JSON.stringify({
        summary: "Direct bilateral meeting between Prime Minister Netanyahu and King Hussein of Jordan regarding the implementation of the Hebron Protocol and regional security coordination.",
        eventType: "bilateral-meeting",
        venue: "Raghadan Palace",
        city: "Amman",
        country: "Jordan",
        sourceId: "src-ap-1997-hebron-amman",
        sourceTitle: "Associated Press Archival Wire: Jordan-Israel High Level Summit",
        sourcePublisher: "Associated Press",
        sourceTier: "tier-b",
        claims: [
          {
            subjectMention: "Benjamin Netanyahu",
            claimType: "presence",
            statement: "Arrived in Amman for official royal consultations following the ratification of the Hebron Protocol.",
            claimedTime: "1997-01-16T11:00:00Z",
            claimedVenue: "Raghadan Palace",
            supportingExcerpt: "King Hussein greeted Prime Minister Netanyahu at the royal palace for three hours of private strategic deliberations.",
          },
        ],
        participants: [
          { name: "Benjamin Netanyahu", role: "Prime Minister of Israel" },
          { name: "King Hussein", role: "King of Jordan" },
        ],
      }),
    },
    {
      id: "cand-kns-20150506-004",
      fingerprint: "fp_knesset_plenary_20150506_34th_gov",
      suggestedTitle: "Inaugural Government Address to the 20th Knesset Plenary",
      suggestedDate: "2015-05-06",
      suggestedPlace: "Knesset Plenary Hall, Jerusalem",
      suggestedParticipants: JSON.stringify([{ name: "Benjamin Netanyahu" }]),
      primarySourceTier: "tier-a",
      assignedLane: "auto-publish",
      duplicateMatchId: null,
      duplicateSimilarity: 0.04,
      status: "pending",
      rejectionReason: null,
      createdAt: new Date(Date.now() - 3600000 * 12),
      rawExtraction: JSON.stringify({
        summary: "Official presentation of the 34th Government of Israel to the Knesset plenum, detailing legislative priorities and national security doctrine.",
        eventType: "speech-plenary",
        venue: "Knesset Plenary Hall",
        city: "Jerusalem",
        country: "Israel",
        sourceId: "src-knesset-records-20-plenary",
        sourceTitle: "Knesset Official Parliamentary Records (Divrei HaKnesset)",
        sourcePublisher: "Knesset Stenographic Archive",
        sourceTier: "tier-a",
        claims: [
          {
            subjectMention: "Benjamin Netanyahu",
            claimType: "presence",
            statement: "Delivered formal address introducing the ministerial cabinet in the Knesset plenum.",
            claimedTime: "2015-05-06T17:00:00Z",
            claimedVenue: "Knesset Plenary Hall",
            supportingExcerpt: "Official stenographic record of the 20th Knesset opening ministerial confidence vote.",
          },
        ],
        participants: [
          { name: "Benjamin Netanyahu", role: "Prime Minister of Israel" },
        ],
      }),
    },
  ];

  const seedAuditLog: (typeof schema.auditLog.$inferSelect)[] = [
    {
      id: 1,
      eventId: "evt-2011-09-23-unga-plenary",
      candidateId: "cand-un-20110923-001",
      action: "discovered",
      ruleId: "POLICY-T1-AUTOPUB",
      details: JSON.stringify({
        policyLane: "auto-publish",
        sourceTier: "tier-a",
        confidence: 0.99,
        title: "Netanyahu Addresses UN General Assembly Plenary",
        verificationReason: "Primary transcript from UN Secretariat meeting record 714196",
      }),
      recordedAt: new Date(Date.now() - 3600000 * 4),
    },
    {
      id: 2,
      eventId: "evt-1998-10-23-wye-river",
      candidateId: "cand-wye-19981023-002",
      action: "deduplicated",
      ruleId: "DEDUP-SPACETIME-092",
      details: JSON.stringify({
        matchedEventId: "evt-1998-10-23-wye-river",
        matchedEventSlug: "wye-river-memorandum-signing",
        similarity: 0.92,
        sourceTitle: "U.S. Department of State Archive: Wye River Memorandum",
        claimsToMerge: 1,
      }),
      recordedAt: new Date(Date.now() - 3600000 * 2),
    },
    {
      id: 3,
      eventId: null,
      candidateId: "cand-amm-19970116-003",
      action: "queued-for-review",
      ruleId: "POLICY-T2-CONTEMPORARY",
      details: JSON.stringify({
        assignedLane: "human-review",
        reason: "Contemporary secondary wire source requires senior editorial cross-examination",
        primarySourceTier: "tier-b",
      }),
      recordedAt: new Date(Date.now() - 3600000 * 1),
    },
  ];

  return {
    people: seedPeople,
    personAliases: seedAliases,
    places: seedPlaces,
    events: seedEvents,
    sources: seedSources,
    claims: seedClaims,
    candidateEvents: seedCandidateEvents,
    auditLog: seedAuditLog,
    quotes: [],
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
