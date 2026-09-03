import {
  type AnyPgColumn,
  boolean,
  doublePrecision,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";


// ==========================================
// 1. Coverage Programmes & Person Entities
// ==========================================

export const coverageProgrammes = pgTable("coverage_programmes", {
  id: text("id").primaryKey(), // e.g. "prog-heads-of-government"
  name: text("name").notNull(),
  description: text("description"),
  criteria: text("criteria"),
  autoQualify: boolean("auto_qualify").default(false).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const people = pgTable("people", {
  id: text("id").primaryKey(), // e.g. "netanyahu", "clinton", "rabin", "schneerson"
  slug: text("slug").unique().notNull(),
  canonicalName: text("canonical_name").notNull(),
  displayName: text("display_name").notNull(),
  nativeName: text("native_name"),
  birthDate: text("birth_date"),
  deathDate: text("death_date"),
  datePrecision: text("date_precision").default("exact-day").notNull(),
  nationality: text("nationality"),
  primaryRole: text("primary_role"),
  classification: text("classification").notNull(), // politician, diplomat, religious-leader, etc.
  notabilityBasis: text("notability_basis").notNull(),
  programmeId: text("programme_id").references(() => coverageProgrammes.id),
  isLiving: boolean("is_living").default(true).notNull(),
  monitoringPriority: text("monitoring_priority").default("normal").notNull(), // intensive, normal, historical-only
  publicationStatus: text("publication_status").default("published").notNull(), // published, staging, private
  wikidataId: text("wikidata_id"),
  viafId: text("viaf_id"),
  avatarUrl: text("avatar_url"),
  summary: text("summary"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const personAliases = pgTable("person_aliases", {
  id: serial("id").primaryKey(),
  personId: text("person_id")
    .references(() => people.id, { onDelete: "cascade" })
    .notNull(),
  alias: text("alias").notNull(),
  aliasType: text("alias_type").default("transliteration").notNull(), // transliteration, former-name, misspelling, title
});

export const organisations = pgTable("organisations", {
  id: text("id").primaryKey(),
  slug: text("slug").unique().notNull(),
  name: text("name").notNull(),
  category: text("category").notNull(), // government, international-body, legislative, media
  country: text("country"),
});

export const personRoles = pgTable("person_roles", {
  id: serial("id").primaryKey(),
  personId: text("person_id")
    .references(() => people.id, { onDelete: "cascade" })
    .notNull(),
  title: text("title").notNull(),
  organisationId: text("organisation_id").references(() => organisations.id),
  startDate: text("start_date"),
  endDate: text("end_date"),
  isCurrent: boolean("is_current").default(false).notNull(),
});

// ==========================================
// 2. Gazetteer & Places
// ==========================================

export const places = pgTable("places", {
  id: text("id").primaryKey(), // e.g. "plc-jerusalem-knesset", "plc-dc-white-house"
  slug: text("slug").unique().notNull(),
  venue: text("venue").notNull(),
  city: text("city").notNull(),
  country: text("country").notNull(),
  latitude: doublePrecision("latitude"),
  longitude: doublePrecision("longitude"),
  placeType: text("place_type").default("venue").notNull(), // parliament, executive-residence, summit-center, airport
});

export const placeAliases = pgTable("place_aliases", {
  id: serial("id").primaryKey(),
  placeId: text("place_id")
    .references(() => places.id, { onDelete: "cascade" })
    .notNull(),
  alias: text("alias").notNull(),
});

// ==========================================
// 3. Events Hierarchy (Parent & Child)
// ==========================================

export const events = pgTable("events", {
  id: text("id").primaryKey(), // e.g. "evt-1996-07-09-netanyahu-clinton-wh"
  slug: text("slug").unique().notNull(),
  parentId: text("parent_id").references((): AnyPgColumn => events.id), // Self-referencing parent summit or state visit

  eventType: text("event_type").notNull(), // bilateral-meeting, multilateral-summit, speech-plenary, etc.
  title: text("title").notNull(),
  summary: text("summary").notNull(),
  description: text("description"),
  startDate: text("start_date").notNull(),
  endDate: text("end_date"),
  temporalPrecision: text("temporal_precision").default("exact-day").notNull(),
  placeId: text("place_id").references(() => places.id),
  verificationStatus: text("verification_status").default("verified").notNull(), // verified, provisional, disputed
  confidenceScore: doublePrecision("confidence_score").default(1.0).notNull(),
  publicationStatus: text("publication_status").default("published").notNull(), // published, provisional, queued, rejected
  publicationLane: text("publication_lane").default("auto-publish").notNull(), // auto-publish, provisional, human-review
  significanceScore: integer("significance_score").default(80).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const eventParticipants = pgTable("event_participants", {
  id: serial("id").primaryKey(),
  eventId: text("event_id")
    .references(() => events.id, { onDelete: "cascade" })
    .notNull(),
  personId: text("person_id")
    .references(() => people.id, { onDelete: "cascade" })
    .notNull(),
  role: text("role").default("principal").notNull(), // principal, co-principal, secondary, attendee
  presenceMode: text("presence_mode").default("physical").notNull(), // physical, remote-live, remote-recorded, telephone, written
});

export const eventOrganisations = pgTable("event_organisations", {
  id: serial("id").primaryKey(),
  eventId: text("event_id")
    .references(() => events.id, { onDelete: "cascade" })
    .notNull(),
  organisationId: text("organisation_id")
    .references(() => organisations.id, { onDelete: "cascade" })
    .notNull(),
});

// ==========================================
// 4. Sources, Evidence & Claims Model
// ==========================================

export const sources = pgTable("sources", {
  id: text("id").primaryKey(), // e.g. "src-wh-transcript-19960709"
  title: text("title").notNull(),
  publisher: text("publisher").notNull(),
  sourceType: text("source_type").notNull(), // official-transcript, government-record, broadcast-video, wire-report
  tier: text("tier").notNull(), // tier-a, tier-b, tier-c, tier-d
  url: text("url"),
  archiveUrl: text("archive_url"),
  author: text("author"),
  publicationDate: text("publication_date"),
  trustScore: doublePrecision("trust_score").default(1.0).notNull(),
});

export const sourceFetches = pgTable("source_fetches", {
  id: serial("id").primaryKey(),
  sourceId: text("source_id")
    .references(() => sources.id, { onDelete: "cascade" })
    .notNull(),
  url: text("url").notNull(),
  sha256: text("sha256").notNull(),
  httpStatus: integer("http_status"),
  rawContent: text("raw_content"),
  contentType: text("content_type"),
  fetchedAt: timestamp("fetched_at").defaultNow().notNull(),
});

export const eventSources = pgTable("event_sources", {
  id: serial("id").primaryKey(),
  eventId: text("event_id")
    .references(() => events.id, { onDelete: "cascade" })
    .notNull(),
  sourceId: text("source_id")
    .references(() => sources.id, { onDelete: "cascade" })
    .notNull(),
  isPrimary: boolean("is_primary").default(true).notNull(),
});

// Atomic Claim Layer: Source -> Evidence -> Claim -> Event
export const claims = pgTable("claims", {
  id: text("id").primaryKey(),
  eventId: text("event_id")
    .references(() => events.id, { onDelete: "cascade" })
    .notNull(),
  subjectId: text("subject_id").references(() => people.id),
  claimType: text("claim_type").notNull(), // presence, start-time, statement-quote, agreement, action
  statement: text("statement").notNull(),
  claimedTime: text("claimed_time"),
  claimedVenue: text("claimed_venue"),
  sourceId: text("source_id").references(() => sources.id),
  confidence: text("confidence").default("confirmed").notNull(), // confirmed, reported, disputed, contradicted
  supportingExcerpt: text("supporting_excerpt"),
});

export const quotes = pgTable("quotes", {
  id: text("id").primaryKey(),
  eventId: text("event_id")
    .references(() => events.id, { onDelete: "cascade" })
    .notNull(),
  speakerId: text("speaker_id")
    .references(() => people.id)
    .notNull(),
  quote: text("quote").notNull(),
  context: text("context"),
  language: text("language").default("en").notNull(),
  sourceId: text("source_id").references(() => sources.id),
  timestampInMedia: text("timestamp_in_media"),
});

export const mediaAssets = pgTable("media_assets", {
  id: text("id").primaryKey(),
  eventId: text("event_id")
    .references(() => events.id, { onDelete: "cascade" })
    .notNull(),
  mediaType: text("media_type").notNull(), // audio, video, image, document-scan
  url: text("url").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  caption: text("caption"),
  sourceId: text("source_id").references(() => sources.id),
  durationSeconds: integer("duration_seconds"),
});

// ==========================================
// 5. Ingestion Engine & Review Queues
// ==========================================

export const candidateEvents = pgTable("candidate_events", {
  id: text("id").primaryKey(), // e.g. "cand-un-20260903-001"
  fingerprint: text("fingerprint").notNull(),
  rawExtraction: text("raw_extraction").notNull(), // JSON payload
  suggestedTitle: text("suggested_title").notNull(),
  suggestedDate: text("suggested_date").notNull(),
  suggestedPlace: text("suggested_place"),
  suggestedParticipants: text("suggested_participants"), // JSON array
  primarySourceTier: text("primary_source_tier").notNull(),
  assignedLane: text("assigned_lane").notNull(), // auto-publish, provisional, human-review
  duplicateMatchId: text("duplicate_match_id").references(() => events.id),
  duplicateSimilarity: doublePrecision("duplicate_similarity"),
  status: text("status").default("pending").notNull(), // pending, approved, merged, rejected
  rejectionReason: text("rejection_reason"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const reviewDecisions = pgTable("review_decisions", {
  id: serial("id").primaryKey(),
  candidateId: text("candidate_id")
    .references(() => candidateEvents.id, { onDelete: "cascade" })
    .notNull(),
  decision: text("decision").notNull(), // approved, merged, rejected, edited
  decidedBy: text("decided_by").notNull(),
  notes: text("notes"),
  decidedAt: timestamp("decided_at").defaultNow().notNull(),
});

export const auditLog = pgTable("audit_log", {
  id: serial("id").primaryKey(),
  eventId: text("event_id"),
  candidateId: text("candidate_id"),
  action: text("action").notNull(), // discovered, extracted, deduplicated, auto-published, reviewed, merged, updated, unpublished
  ruleId: text("rule_id"),
  details: text("details").notNull(), // JSON string
  recordedAt: timestamp("recorded_at").defaultNow().notNull(),
});
