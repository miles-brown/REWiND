import { sql } from "drizzle-orm";
import {
  type AnyPgColumn,
  boolean,
  check,
  doublePrecision,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { events, organisations, people, places, sources } from "./schema";

// ==========================================
// 1. Event Series & Hierarchy
// ==========================================

export const eventSeries = pgTable("event_series", {
  id: text("id").primaryKey(), // e.g. "series-unga", "series-glastonbury", "series-davos"
  canonicalName: text("canonical_name").notNull(),
  officialName: text("official_name"),
  organiserOrganisationId: text("organiser_organisation_id").references(() => organisations.id),
  description: text("description"),
  startedDate: text("started_date"),
  endedDate: text("ended_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Unlimited Alternate & Archive Titles
export const eventTitles = pgTable("event_titles", {
  id: serial("id").primaryKey(),
  eventId: text("event_id")
    .references(() => events.id, { onDelete: "cascade" })
    .notNull(),
  title: text("title").notNull(),
  titleType: text("title_type").notNull(), // canonical, short, official, formal, broadcast, archive, etc.
  language: text("language").default("en").notNull(),
  organisationId: text("organisation_id").references(() => organisations.id),
  broadcasterId: text("broadcaster_id").references(() => organisations.id),
  sourceId: text("source_id").references(() => sources.id),
  isPreferred: boolean("is_preferred").default(false).notNull(),
});

// ==========================================
// 2. Multi-tier Geospatial: Venues & Areas
// ==========================================

export const addresses = pgTable("addresses", {
  id: text("id").primaryKey(),
  countryCode: text("country_code").notNull(), // ISO-3166-1 alpha-2
  buildingName: text("building_name"),
  subBuilding: text("sub_building"),
  streetNumber: text("street_number"),
  streetName: text("street_name"),
  district: text("district"),
  neighbourhood: text("neighbourhood"),
  locality: text("locality"),
  dependentLocality: text("dependent_locality"),
  city: text("city"),
  administrativeArea: text("administrative_area"),
  postalCode: text("postal_code"),
  formattedLocal: text("formatted_local").notNull(),
  formattedEnglish: text("formatted_english"),
  descriptiveLocation: text("descriptive_location"),
  latitude: doublePrecision("latitude"),
  longitude: doublePrecision("longitude"),
});

export const venues = pgTable("venues", {
  id: text("id").primaryKey(), // e.g. "ven-un-hq-nyc", "ven-knesset"
  name: text("name").notNull(),
  parentVenueId: text("parent_venue_id").references((): AnyPgColumn => venues.id),
  organisationId: text("organisation_id").references(() => organisations.id),
  addressId: text("address_id").references(() => addresses.id),
  latitude: doublePrecision("latitude"),
  longitude: doublePrecision("longitude"),
});

export const venueAreas = pgTable("venue_areas", {
  id: text("id").primaryKey(), // e.g. "area-un-ga-hall", "area-un-podium"
  venueId: text("venue_id")
    .references(() => venues.id, { onDelete: "cascade" })
    .notNull(),
  parentAreaId: text("parent_area_id").references((): AnyPgColumn => venueAreas.id),
  name: text("name").notNull(),
  areaType: text("area_type").default("room").notNull(), // hall, stage, podium, room, compound
  latitude: doublePrecision("latitude"),
  longitude: doublePrecision("longitude"),
});

// ==========================================
// 3. Person Participation & Specific Presence
// ==========================================

export const eventPeople = pgTable("event_people", {
  id: text("id").primaryKey(),
  eventId: text("event_id")
    .references(() => events.id, { onDelete: "cascade" })
    .notNull(),
  personId: text("person_id")
    .references(() => people.id, { onDelete: "cascade" })
    .notNull(),
  involvementType: text("involvement_type").notNull(), // speaker, attendee, chair, delegate, etc.
  roleLabel: text("role_label").notNull(),
  capacityTitle: text("capacity_title"),
  attendanceMode: text("attendance_mode").default("physical").notNull(),
  presenceExtent: text("presence_extent").default("entire-event").notNull(),
  arrivalTime: text("arrival_time"),
  departureTime: text("departure_time"),
  presenceConfidence: text("presence_confidence").default("confirmed").notNull(),
  roleConfidence: text("role_confidence").default("confirmed").notNull(),
  notes: text("notes"),
});

// Individual Person's Documented Coordinates within Event
export const eventPersonLocations = pgTable(
  "event_person_locations",
  {
    id: serial("id").primaryKey(),
    eventPersonId: text("event_person_id")
      .references(() => eventPeople.id, { onDelete: "cascade" })
      .notNull(),
    placeId: text("place_id").references(() => places.id),
    venueId: text("venue_id").references(() => venues.id),
    venueAreaId: text("venue_area_id").references(() => venueAreas.id),
    latitude: doublePrecision("latitude").notNull(),
    longitude: doublePrecision("longitude").notNull(),
    coordinatePrecision: text("coordinate_precision").notNull(), // exact-position, room, stage, building, etc.
    uncertaintyRadiusMetres: integer("uncertainty_radius_metres"),
    localStartTime: text("local_start_time"),
    localEndTime: text("local_end_time"),
    isPrincipalLocation: boolean("is_principal_location").default(true).notNull(),
    locationBasis: text("location_basis").default("archival-record").notNull(),
    confidence: text("confidence").default("confirmed").notNull(),
    publicVisibility: text("public_visibility").default("public-exact").notNull(),
  },
  (table) => [
    check(
      "event_person_locations_latitude_check",
      sql`${table.latitude} >= -90.0 AND ${table.latitude} <= 90.0`
    ),
    check(
      "event_person_locations_longitude_check",
      sql`${table.longitude} >= -180.0 AND ${table.longitude} <= 180.0`
    ),
  ]
);

// Normalized Location-to-Source Relation for EventPersonLocation
export const eventPersonLocationSources = pgTable("event_person_location_sources", {
  id: serial("id").primaryKey(),
  eventPersonLocationId: integer("event_person_location_id")
    .references(() => eventPersonLocations.id, { onDelete: "cascade" })
    .notNull(),
  sourceId: text("source_id")
    .references(() => sources.id, { onDelete: "cascade" })
    .notNull(),
  confidence: text("confidence").default("confirmed").notNull(),
});

// Person Representation within Specific Event
export const eventPersonOrganisations = pgTable("event_person_organisations", {
  id: serial("id").primaryKey(),
  eventPersonId: text("event_person_id")
    .references(() => eventPeople.id, { onDelete: "cascade" })
    .notNull(),
  organisationId: text("organisation_id")
    .references(() => organisations.id, { onDelete: "cascade" })
    .notNull(),
  relationshipType: text("relationship_type").notNull(), // represents, delegation-of, employed-by
  roleLabel: text("role_label"),
  confidence: text("confidence").default("confirmed").notNull(),
});

// ==========================================
// 4. Broadcasts, Manifestations & Sequences
// ==========================================

export const eventBroadcasts = pgTable("event_broadcasts", {
  id: serial("id").primaryKey(),
  eventId: text("event_id")
    .references(() => events.id, { onDelete: "cascade" })
    .notNull(),
  broadcasterOrganisationId: text("broadcaster_organisation_id")
    .references(() => organisations.id)
    .notNull(),
  channelOrService: text("channel_or_service"),
  programmeName: text("programme_name"),
  broadcastTitle: text("broadcast_title"),
  broadcastType: text("broadcast_type").default("television").notNull(),
  localStartTime: text("local_start_time"),
  localEndTime: text("local_end_time"),
  territory: text("territory"),
  language: text("language").default("en"),
  liveStatus: text("live_status").default("live").notNull(),
  sourceId: text("source_id").references(() => sources.id),
});

export const eventTopics = pgTable("event_topics", {
  id: serial("id").primaryKey(),
  eventId: text("event_id")
    .references(() => events.id, { onDelete: "cascade" })
    .notNull(),
  topicId: text("topic_id").notNull(),
  relationshipType: text("relationship_type").notNull(), // official-theme, primary-topic, secondary-topic
  relevance: doublePrecision("relevance").default(1.0).notNull(),
});

export const eventLocationSequences = pgTable("event_location_sequences", {
  id: serial("id").primaryKey(),
  eventId: text("event_id")
    .references(() => events.id, { onDelete: "cascade" })
    .notNull(),
  sequenceIndex: integer("sequence_index").notNull(),
  label: text("label").notNull(),
  latitude: doublePrecision("latitude").notNull(),
  longitude: doublePrecision("longitude").notNull(),
  timestamp: text("timestamp"),
  precision: text("precision").default("building").notNull(),
});

// ==========================================
// 5. Claim Evidence & Biographical Relations
// ==========================================

export const claimEvidence = pgTable("claim_evidence", {
  id: text("id").primaryKey(),
  claimId: text("claim_id").notNull(),
  sourceId: text("source_id")
    .references(() => sources.id, { onDelete: "cascade" })
    .notNull(),
  evidenceForm: text("evidence_form").notNull(),
  evidenceStrength: text("evidence_strength").default("direct conclusive").notNull(),
  directness: text("directness").default("direct").notNull(),
  citationLocator: text("citation_locator"),
  supportingExcerpt: text("supporting_excerpt"),
  contradictsClaim: boolean("contradicts_claim").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const personEducation = pgTable("person_education", {
  id: text("id").primaryKey(),
  personId: text("person_id")
    .references(() => people.id, { onDelete: "cascade" })
    .notNull(),
  institution: text("institution").notNull(),
  location: text("location"),
  startDate: text("start_date"),
  endDate: text("end_date"),
  qualification: text("qualification"),
  subject: text("subject"),
  degree: text("degree"),
  honours: text("honours"),
  completedStatus: text("completed_status").default("completed").notNull(),
  sourceId: text("source_id").references(() => sources.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const personCareer = pgTable("person_career", {
  id: text("id").primaryKey(),
  personId: text("person_id")
    .references(() => people.id, { onDelete: "cascade" })
    .notNull(),
  organisationName: text("organisation_name").notNull(),
  positionTitle: text("position_title").notNull(),
  occupationCategory: text("occupation_category"),
  startDate: text("start_date"),
  endDate: text("end_date"),
  location: text("location"),
  appointmentMethod: text("appointment_method"),
  predecessor: text("predecessor"),
  successor: text("successor"),
  notes: text("notes"),
  sourceId: text("source_id").references(() => sources.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const personAwards = pgTable("person_awards", {
  id: text("id").primaryKey(),
  personId: text("person_id")
    .references(() => people.id, { onDelete: "cascade" })
    .notNull(),
  awardName: text("award_name").notNull(),
  awardingBody: text("awarding_body").notNull(),
  category: text("category"),
  awardYear: integer("award_year"),
  result: text("result").default("winner").notNull(),
  citationReason: text("citation_reason"),
  sourceId: text("source_id").references(() => sources.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const personWorks = pgTable("person_works", {
  id: text("id").primaryKey(),
  personId: text("person_id")
    .references(() => people.id, { onDelete: "cascade" })
    .notNull(),
  workTitle: text("work_title").notNull(),
  workType: text("work_type").notNull(),
  releaseDate: text("release_date"),
  publisherOrVenue: text("publisher_or_venue"),
  significanceNote: text("significance_note"),
  sourceId: text("source_id").references(() => sources.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

