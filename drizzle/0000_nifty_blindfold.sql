CREATE TABLE "addresses" (
	"id" text PRIMARY KEY NOT NULL,
	"country_code" text NOT NULL,
	"building_name" text,
	"sub_building" text,
	"street_number" text,
	"street_name" text,
	"district" text,
	"neighbourhood" text,
	"locality" text,
	"dependent_locality" text,
	"city" text,
	"administrative_area" text,
	"postal_code" text,
	"formatted_local" text NOT NULL,
	"formatted_english" text,
	"descriptive_location" text,
	"latitude" double precision,
	"longitude" double precision
);
--> statement-breakpoint
CREATE TABLE "audit_log" (
	"id" serial PRIMARY KEY NOT NULL,
	"event_id" text,
	"candidate_id" text,
	"action" text NOT NULL,
	"rule_id" text,
	"details" text NOT NULL,
	"recorded_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "candidate_events" (
	"id" text PRIMARY KEY NOT NULL,
	"fingerprint" text NOT NULL,
	"raw_extraction" text NOT NULL,
	"suggested_title" text NOT NULL,
	"suggested_date" text NOT NULL,
	"suggested_place" text,
	"suggested_participants" text,
	"primary_source_tier" text NOT NULL,
	"assigned_lane" text NOT NULL,
	"duplicate_match_id" text,
	"duplicate_similarity" double precision,
	"status" text DEFAULT 'pending' NOT NULL,
	"rejection_reason" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "claim_evidence" (
	"id" text PRIMARY KEY NOT NULL,
	"claim_id" text NOT NULL,
	"source_id" text NOT NULL,
	"evidence_form" text NOT NULL,
	"evidence_strength" text,
	"directness" text,
	"citation_locator" text,
	"supporting_excerpt" text,
	"contradicts_claim" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "claims" (
	"id" text PRIMARY KEY NOT NULL,
	"event_id" text,
	"subject_id" text,
	"subject_entity_type" text DEFAULT 'event',
	"subject_entity_id" text,
	"claim_type" text NOT NULL,
	"statement" text NOT NULL,
	"claimed_time" text,
	"claimed_venue" text,
	"source_id" text,
	"confidence" text DEFAULT 'limited' NOT NULL,
	"claim_status" text DEFAULT 'PROVISIONAL' NOT NULL,
	"epistemic_class" text DEFAULT 'unknown' NOT NULL,
	"supporting_excerpt" text,
	"contradicts_claim_id" text,
	"contestation_notes" text
);
--> statement-breakpoint
CREATE TABLE "coverage_programmes" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"criteria" text,
	"auto_qualify" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "event_organisations" (
	"id" serial PRIMARY KEY NOT NULL,
	"event_id" text NOT NULL,
	"organisation_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "event_participants" (
	"id" serial PRIMARY KEY NOT NULL,
	"event_id" text NOT NULL,
	"person_id" text NOT NULL,
	"role" text DEFAULT 'principal' NOT NULL,
	"presence_mode" text DEFAULT 'physical' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "event_people" (
	"id" text PRIMARY KEY NOT NULL,
	"event_id" text NOT NULL,
	"person_id" text NOT NULL,
	"involvement_type" text NOT NULL,
	"role_label" text NOT NULL,
	"capacity_title" text,
	"attendance_mode" text DEFAULT 'physical' NOT NULL,
	"presence_extent" text DEFAULT 'entire-event' NOT NULL,
	"arrival_time" text,
	"departure_time" text,
	"presence_confidence" text DEFAULT 'limited' NOT NULL,
	"role_confidence" text DEFAULT 'limited' NOT NULL,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "event_person_locations" (
	"id" serial PRIMARY KEY NOT NULL,
	"event_person_id" text NOT NULL,
	"place_id" text,
	"venue_id" text,
	"latitude" double precision NOT NULL,
	"longitude" double precision NOT NULL,
	"coordinate_precision" text DEFAULT 'exact-position' NOT NULL,
	"uncertainty_radius_metres" integer,
	"local_start_time" text,
	"local_end_time" text,
	"is_principal_location" boolean DEFAULT true NOT NULL,
	"location_basis" text DEFAULT 'archival-record' NOT NULL,
	"confidence" text DEFAULT 'limited' NOT NULL,
	"public_visibility" text DEFAULT 'approximate' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "event_series" (
	"id" text PRIMARY KEY NOT NULL,
	"canonical_name" text NOT NULL,
	"official_name" text,
	"organiser_organisation_id" text,
	"description" text,
	"started_date" text,
	"ended_date" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "event_sources" (
	"id" serial PRIMARY KEY NOT NULL,
	"event_id" text NOT NULL,
	"source_id" text NOT NULL,
	"is_primary" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "event_topics" (
	"id" serial PRIMARY KEY NOT NULL,
	"event_id" text NOT NULL,
	"topic_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"parent_id" text,
	"event_type" text NOT NULL,
	"title" text NOT NULL,
	"summary" text NOT NULL,
	"description" text,
	"start_date" text NOT NULL,
	"end_date" text,
	"temporal_precision" text DEFAULT 'exact-day' NOT NULL,
	"day_of_week" text,
	"local_start_time" text,
	"local_end_time" text,
	"utc_start_time" text,
	"utc_end_time" text,
	"timezone_id" text,
	"utc_offset_seconds" integer,
	"timezone_abbreviation" text,
	"dst_observed" boolean,
	"timezone_confidence" text,
	"time_conversion_method" text,
	"time_standard" text,
	"duration_seconds" integer,
	"duration_precision" text,
	"duration_basis" text,
	"holiday_applicable" boolean DEFAULT false,
	"holiday_name" text,
	"holiday_type" text,
	"holiday_jurisdiction" text,
	"is_travel_event" boolean DEFAULT false NOT NULL,
	"transport_mode" text,
	"flight_identifier" text,
	"is_documented_flight" boolean DEFAULT false NOT NULL,
	"flight_corridor" text,
	"departure_airport_iata" text,
	"arrival_airport_iata" text,
	"origin_waypoint" jsonb,
	"destination_waypoint" jsonb,
	"route_coordinates" jsonb,
	"travel_inferences" jsonb,
	"journey_legs" jsonb,
	"place_id" text,
	"series_id" text,
	"venue_id" text,
	"subvenue" text,
	"address_id" text,
	"verification_status" text DEFAULT 'provisional' NOT NULL,
	"confidence_score" double precision DEFAULT 0.5 NOT NULL,
	"publication_status" text DEFAULT 'draft' NOT NULL,
	"publication_lane" text DEFAULT 'human-review' NOT NULL,
	"significance_score" integer DEFAULT 80 NOT NULL,
	"embedding" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "events_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "media_assets" (
	"id" text PRIMARY KEY NOT NULL,
	"event_id" text NOT NULL,
	"media_type" text NOT NULL,
	"url" text NOT NULL,
	"thumbnail_url" text,
	"caption" text,
	"source_id" text,
	"duration_seconds" integer
);
--> statement-breakpoint
CREATE TABLE "organisations" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"category" text NOT NULL,
	"country" text,
	CONSTRAINT "organisations_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "people" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"canonical_name" text NOT NULL,
	"display_name" text NOT NULL,
	"native_name" text,
	"full_birth_name" text,
	"birth_date" text,
	"death_date" text,
	"date_precision" text DEFAULT 'exact-day' NOT NULL,
	"nationality" text,
	"citizenship" text[],
	"national_identity" text,
	"ethnicity" text,
	"ancestry" text,
	"religion" text,
	"religious_denomination" text,
	"religion_status" text DEFAULT 'unspecified' NOT NULL,
	"languages" text[],
	"primary_role" text,
	"classification" text NOT NULL,
	"primary_figure_category" text DEFAULT 'historical-figure',
	"notability_basis" text NOT NULL,
	"inclusion_basis" text[],
	"inclusion_rationale" text,
	"cultural_impact_summary" text,
	"achievements" jsonb,
	"inclusion_contested" boolean DEFAULT false NOT NULL,
	"inclusion_contestation_note" text,
	"programme_id" text,
	"is_living" boolean DEFAULT true NOT NULL,
	"monitoring_priority" text DEFAULT 'normal' NOT NULL,
	"publication_status" text DEFAULT 'draft' NOT NULL,
	"wikidata_id" text,
	"viaf_id" text,
	"avatar_url" text,
	"summary" text,
	"embedding" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "people_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "person_aliases" (
	"id" serial PRIMARY KEY NOT NULL,
	"person_id" text NOT NULL,
	"alias" text NOT NULL,
	"alias_type" text DEFAULT 'transliteration' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "person_awards" (
	"id" text PRIMARY KEY NOT NULL,
	"person_id" text NOT NULL,
	"award_name" text NOT NULL,
	"awarding_body" text,
	"category" text,
	"award_year" integer,
	"result" text DEFAULT 'winner',
	"citation_reason" text,
	"source_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "person_career" (
	"id" text PRIMARY KEY NOT NULL,
	"person_id" text NOT NULL,
	"organisation_name" text,
	"position_title" text NOT NULL,
	"occupation_category" text,
	"start_date" text,
	"end_date" text,
	"location" text,
	"appointment_method" text,
	"predecessor" text,
	"successor" text,
	"notes" text,
	"is_current" boolean DEFAULT false,
	"source_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "person_education" (
	"id" text PRIMARY KEY NOT NULL,
	"person_id" text NOT NULL,
	"institution" text NOT NULL,
	"location" text,
	"start_date" text,
	"end_date" text,
	"qualification" text,
	"subject" text,
	"degree" text,
	"honours" text,
	"completed_status" text DEFAULT 'completed',
	"source_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "person_milestones" (
	"id" serial PRIMARY KEY NOT NULL,
	"person_id" text NOT NULL,
	"title" text NOT NULL,
	"category" text NOT NULL,
	"date" text NOT NULL,
	"year" integer NOT NULL,
	"description" text,
	"metric_or_stat" text,
	"source_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "person_roles" (
	"id" serial PRIMARY KEY NOT NULL,
	"person_id" text NOT NULL,
	"title" text NOT NULL,
	"organisation_id" text,
	"start_date" text,
	"end_date" text,
	"is_current" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "person_stays" (
	"id" text PRIMARY KEY NOT NULL,
	"person_id" text NOT NULL,
	"venue_name" text NOT NULL,
	"stay_name" text,
	"stay_type" text DEFAULT 'official_residence' NOT NULL,
	"city" text NOT NULL,
	"country" text NOT NULL,
	"latitude" double precision NOT NULL,
	"longitude" double precision NOT NULL,
	"start_date" text NOT NULL,
	"end_date" text,
	"is_base_of_operations" boolean DEFAULT false NOT NULL,
	"is_primary_residence" boolean DEFAULT false NOT NULL,
	"security_level" text,
	"notes" text,
	"source_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "person_works" (
	"id" text PRIMARY KEY NOT NULL,
	"person_id" text NOT NULL,
	"work_title" text NOT NULL,
	"work_type" text NOT NULL,
	"release_date" text,
	"publisher_or_venue" text,
	"significance_note" text,
	"source_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "place_aliases" (
	"id" serial PRIMARY KEY NOT NULL,
	"place_id" text NOT NULL,
	"alias" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "places" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"venue" text NOT NULL,
	"city" text NOT NULL,
	"country" text NOT NULL,
	"latitude" double precision,
	"longitude" double precision,
	"place_type" text DEFAULT 'venue' NOT NULL,
	CONSTRAINT "places_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "quotes" (
	"id" text PRIMARY KEY NOT NULL,
	"event_id" text NOT NULL,
	"speaker_id" text NOT NULL,
	"quote" text NOT NULL,
	"context" text,
	"language" text DEFAULT 'en' NOT NULL,
	"source_id" text,
	"timestamp_in_media" text
);
--> statement-breakpoint
CREATE TABLE "review_decisions" (
	"id" serial PRIMARY KEY NOT NULL,
	"candidate_id" text NOT NULL,
	"decision" text NOT NULL,
	"decided_by" text NOT NULL,
	"notes" text,
	"decided_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "source_fetches" (
	"id" serial PRIMARY KEY NOT NULL,
	"source_id" text NOT NULL,
	"url" text NOT NULL,
	"sha256" text NOT NULL,
	"http_status" integer,
	"raw_content" text,
	"content_type" text,
	"fetched_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sources" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"publisher" text NOT NULL,
	"source_type" text NOT NULL,
	"tier" text NOT NULL,
	"url" text,
	"archive_url" text,
	"author" text,
	"publication_date" text,
	"trust_score" double precision DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "topics" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"category" text NOT NULL,
	"summary" text,
	"started_date" text,
	"ended_date" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "topics_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "venue_areas" (
	"id" text PRIMARY KEY NOT NULL,
	"venue_id" text NOT NULL,
	"parent_area_id" text,
	"name" text NOT NULL,
	"area_type" text DEFAULT 'room' NOT NULL,
	"latitude" double precision,
	"longitude" double precision
);
--> statement-breakpoint
CREATE TABLE "venues" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"parent_venue_id" text,
	"organisation_id" text,
	"address_id" text,
	"latitude" double precision,
	"longitude" double precision
);
--> statement-breakpoint
ALTER TABLE "candidate_events" ADD CONSTRAINT "candidate_events_duplicate_match_id_events_id_fk" FOREIGN KEY ("duplicate_match_id") REFERENCES "public"."events"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "claim_evidence" ADD CONSTRAINT "claim_evidence_source_id_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."sources"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "claims" ADD CONSTRAINT "claims_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "claims" ADD CONSTRAINT "claims_subject_id_people_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."people"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "claims" ADD CONSTRAINT "claims_source_id_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."sources"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_organisations" ADD CONSTRAINT "event_organisations_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_organisations" ADD CONSTRAINT "event_organisations_organisation_id_organisations_id_fk" FOREIGN KEY ("organisation_id") REFERENCES "public"."organisations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_participants" ADD CONSTRAINT "event_participants_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_participants" ADD CONSTRAINT "event_participants_person_id_people_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."people"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_people" ADD CONSTRAINT "event_people_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_people" ADD CONSTRAINT "event_people_person_id_people_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."people"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_person_locations" ADD CONSTRAINT "event_person_locations_event_person_id_event_people_id_fk" FOREIGN KEY ("event_person_id") REFERENCES "public"."event_people"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_person_locations" ADD CONSTRAINT "event_person_locations_place_id_places_id_fk" FOREIGN KEY ("place_id") REFERENCES "public"."places"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_person_locations" ADD CONSTRAINT "event_person_locations_venue_id_venues_id_fk" FOREIGN KEY ("venue_id") REFERENCES "public"."venues"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_series" ADD CONSTRAINT "event_series_organiser_organisation_id_organisations_id_fk" FOREIGN KEY ("organiser_organisation_id") REFERENCES "public"."organisations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_sources" ADD CONSTRAINT "event_sources_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_sources" ADD CONSTRAINT "event_sources_source_id_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."sources"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_topics" ADD CONSTRAINT "event_topics_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_topics" ADD CONSTRAINT "event_topics_topic_id_topics_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."topics"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_parent_id_events_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."events"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_place_id_places_id_fk" FOREIGN KEY ("place_id") REFERENCES "public"."places"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_series_id_event_series_id_fk" FOREIGN KEY ("series_id") REFERENCES "public"."event_series"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_venue_id_venues_id_fk" FOREIGN KEY ("venue_id") REFERENCES "public"."venues"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_address_id_addresses_id_fk" FOREIGN KEY ("address_id") REFERENCES "public"."addresses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media_assets" ADD CONSTRAINT "media_assets_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media_assets" ADD CONSTRAINT "media_assets_source_id_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."sources"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "people" ADD CONSTRAINT "people_programme_id_coverage_programmes_id_fk" FOREIGN KEY ("programme_id") REFERENCES "public"."coverage_programmes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "person_aliases" ADD CONSTRAINT "person_aliases_person_id_people_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."people"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "person_awards" ADD CONSTRAINT "person_awards_person_id_people_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."people"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "person_awards" ADD CONSTRAINT "person_awards_source_id_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."sources"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "person_career" ADD CONSTRAINT "person_career_person_id_people_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."people"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "person_career" ADD CONSTRAINT "person_career_source_id_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."sources"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "person_education" ADD CONSTRAINT "person_education_person_id_people_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."people"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "person_education" ADD CONSTRAINT "person_education_source_id_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."sources"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "person_milestones" ADD CONSTRAINT "person_milestones_person_id_people_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."people"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "person_milestones" ADD CONSTRAINT "person_milestones_source_id_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."sources"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "person_roles" ADD CONSTRAINT "person_roles_person_id_people_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."people"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "person_roles" ADD CONSTRAINT "person_roles_organisation_id_organisations_id_fk" FOREIGN KEY ("organisation_id") REFERENCES "public"."organisations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "person_stays" ADD CONSTRAINT "person_stays_person_id_people_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."people"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "person_stays" ADD CONSTRAINT "person_stays_source_id_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."sources"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "person_works" ADD CONSTRAINT "person_works_person_id_people_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."people"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "person_works" ADD CONSTRAINT "person_works_source_id_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."sources"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "place_aliases" ADD CONSTRAINT "place_aliases_place_id_places_id_fk" FOREIGN KEY ("place_id") REFERENCES "public"."places"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quotes" ADD CONSTRAINT "quotes_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quotes" ADD CONSTRAINT "quotes_speaker_id_people_id_fk" FOREIGN KEY ("speaker_id") REFERENCES "public"."people"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quotes" ADD CONSTRAINT "quotes_source_id_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."sources"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_decisions" ADD CONSTRAINT "review_decisions_candidate_id_candidate_events_id_fk" FOREIGN KEY ("candidate_id") REFERENCES "public"."candidate_events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "source_fetches" ADD CONSTRAINT "source_fetches_source_id_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."sources"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "venue_areas" ADD CONSTRAINT "venue_areas_venue_id_venues_id_fk" FOREIGN KEY ("venue_id") REFERENCES "public"."venues"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "venue_areas" ADD CONSTRAINT "venue_areas_parent_area_id_venue_areas_id_fk" FOREIGN KEY ("parent_area_id") REFERENCES "public"."venue_areas"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "venues" ADD CONSTRAINT "venues_parent_venue_id_venues_id_fk" FOREIGN KEY ("parent_venue_id") REFERENCES "public"."venues"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "venues" ADD CONSTRAINT "venues_organisation_id_organisations_id_fk" FOREIGN KEY ("organisation_id") REFERENCES "public"."organisations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "venues" ADD CONSTRAINT "venues_address_id_addresses_id_fk" FOREIGN KEY ("address_id") REFERENCES "public"."addresses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "person_milestones_person_title_year_idx" ON "person_milestones" USING btree ("person_id","title","year");