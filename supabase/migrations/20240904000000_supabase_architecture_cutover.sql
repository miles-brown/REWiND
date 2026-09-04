-- ==============================================================================
-- REWIND EVIDENCE ATLAS — CANONICAL SUPABASE SCHEMA (EVENT MODEL V2)
-- Architecture Cutover Migration (Milestone A)
-- Migration Timestamp: 20240904000000 (Conventional ISO-8601 YYYYMMDDHHMMSS sequence)
-- ==============================================================================
-- Strict Rule: Architecture Cutover only. Zero records imported from prototype.

-- 1. Coverage Programmes & Organisations
CREATE TABLE IF NOT EXISTS public.organisations (
  id text PRIMARY KEY,
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  category text NOT NULL,
  country text,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.coverage_programmes (
  id text PRIMARY KEY,
  name text NOT NULL,
  description text,
  criteria text,
  auto_qualify boolean DEFAULT false NOT NULL,
  is_active boolean DEFAULT true NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- 2. People, Aliases & Roles
CREATE TABLE IF NOT EXISTS public.people (
  id text PRIMARY KEY,
  slug text UNIQUE NOT NULL,
  canonical_name text NOT NULL,
  display_name text NOT NULL,
  native_name text,
  birth_date text,
  death_date text,
  date_precision text DEFAULT 'exact-day' NOT NULL,
  nationality text,
  primary_role text,
  classification text NOT NULL,
  notability_basis text NOT NULL,
  programme_id text REFERENCES public.coverage_programmes(id),
  is_living boolean DEFAULT true NOT NULL,
  monitoring_priority text DEFAULT 'normal' NOT NULL,
  publication_status text DEFAULT 'draft' NOT NULL CHECK (publication_status IN ('draft', 'provisional', 'published', 'archived', 'withdrawn')),
  wikidata_id text,
  viaf_id text,
  avatar_url text,
  summary text,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.person_aliases (
  id serial PRIMARY KEY,
  person_id text NOT NULL REFERENCES public.people(id) ON DELETE CASCADE,
  alias text NOT NULL,
  alias_type text DEFAULT 'transliteration' NOT NULL
);

CREATE TABLE IF NOT EXISTS public.person_roles (
  id serial PRIMARY KEY,
  person_id text NOT NULL REFERENCES public.people(id) ON DELETE CASCADE,
  title text NOT NULL,
  organisation_id text REFERENCES public.organisations(id),
  start_date text,
  end_date text,
  is_current boolean DEFAULT false NOT NULL
);

-- 3. Multi-tier Geospatial: Addresses, Venues & Places
CREATE TABLE IF NOT EXISTS public.addresses (
  id text PRIMARY KEY,
  country_code text NOT NULL,
  building_name text,
  sub_building text,
  street_number text,
  street_name text,
  district text,
  neighbourhood text,
  locality text,
  dependent_locality text,
  city text,
  administrative_area text,
  postal_code text,
  formatted_local text NOT NULL,
  formatted_english text,
  descriptive_location text,
  latitude double precision,
  longitude double precision
);

CREATE TABLE IF NOT EXISTS public.venues (
  id text PRIMARY KEY,
  name text NOT NULL,
  parent_venue_id text REFERENCES public.venues(id),
  organisation_id text REFERENCES public.organisations(id),
  address_id text REFERENCES public.addresses(id),
  latitude double precision,
  longitude double precision
);

CREATE TABLE IF NOT EXISTS public.venue_areas (
  id text PRIMARY KEY,
  venue_id text NOT NULL REFERENCES public.venues(id) ON DELETE CASCADE,
  parent_area_id text REFERENCES public.venue_areas(id),
  name text NOT NULL,
  area_type text DEFAULT 'room' NOT NULL,
  latitude double precision,
  longitude double precision
);

CREATE TABLE IF NOT EXISTS public.places (
  id text PRIMARY KEY,
  slug text UNIQUE NOT NULL,
  venue text NOT NULL,
  city text NOT NULL,
  country text NOT NULL,
  latitude double precision,
  longitude double precision,
  place_type text DEFAULT 'venue' NOT NULL
);

CREATE TABLE IF NOT EXISTS public.place_aliases (
  id serial PRIMARY KEY,
  place_id text NOT NULL REFERENCES public.places(id) ON DELETE CASCADE,
  alias text NOT NULL
);

-- 4. Event Series & Hierarchy
CREATE TABLE IF NOT EXISTS public.event_series (
  id text PRIMARY KEY,
  canonical_name text NOT NULL,
  official_name text,
  organiser_organisation_id text REFERENCES public.organisations(id),
  description text,
  started_date text,
  ended_date text,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.events (
  id text PRIMARY KEY,
  slug text UNIQUE NOT NULL,
  parent_id text REFERENCES public.events(id),
  series_id text REFERENCES public.event_series(id),
  event_type text NOT NULL,
  title text NOT NULL,
  summary text NOT NULL,
  description text,
  start_date text NOT NULL,
  end_date text,
  temporal_precision text DEFAULT 'exact-day' NOT NULL,
  place_id text REFERENCES public.places(id),
  venue_id text REFERENCES public.venues(id),
  address_id text REFERENCES public.addresses(id),
  verification_status text DEFAULT 'provisional' NOT NULL CHECK (verification_status IN ('unverified', 'provisional', 'verified', 'disputed', 'retracted')),
  confidence_score double precision DEFAULT 1.0 NOT NULL,
  publication_status text DEFAULT 'draft' NOT NULL CHECK (publication_status IN ('draft', 'provisional', 'published', 'archived', 'withdrawn')),
  publication_lane text DEFAULT 'human-review' NOT NULL CHECK (publication_lane IN ('auto-publish', 'human-review', 'quarantine', 'withheld')),
  significance_score integer DEFAULT 80 NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.event_titles (
  id serial PRIMARY KEY,
  event_id text NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  title text NOT NULL,
  title_type text NOT NULL,
  language text DEFAULT 'en' NOT NULL,
  organisation_id text REFERENCES public.organisations(id),
  broadcaster_id text REFERENCES public.organisations(id),
  source_id text,
  is_preferred boolean DEFAULT false NOT NULL
);

-- 5. Participation, Representation & Precise Presence
CREATE TABLE IF NOT EXISTS public.event_people (
  id text PRIMARY KEY,
  event_id text NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  person_id text NOT NULL REFERENCES public.people(id) ON DELETE CASCADE,
  involvement_type text NOT NULL,
  role_label text NOT NULL,
  capacity_title text,
  attendance_mode text DEFAULT 'physical' NOT NULL,
  presence_extent text DEFAULT 'entire-event' NOT NULL,
  arrival_time text,
  departure_time text,
  presence_confidence text DEFAULT 'confirmed' NOT NULL,
  role_confidence text DEFAULT 'confirmed' NOT NULL,
  notes text
);

CREATE TABLE IF NOT EXISTS public.event_person_locations (
  id serial PRIMARY KEY,
  event_person_id text NOT NULL REFERENCES public.event_people(id) ON DELETE CASCADE,
  place_id text REFERENCES public.places(id),
  venue_id text REFERENCES public.venues(id),
  venue_area_id text REFERENCES public.venue_areas(id),
  latitude double precision NOT NULL,
  longitude double precision NOT NULL,
  coordinate_precision text NOT NULL,
  uncertainty_radius_metres integer,
  local_start_time text,
  local_end_time text,
  is_principal_location boolean DEFAULT true NOT NULL,
  location_basis text DEFAULT 'archival-record' NOT NULL,
  confidence text DEFAULT 'confirmed' NOT NULL,
  public_visibility text DEFAULT 'public-exact' NOT NULL
);

CREATE TABLE IF NOT EXISTS public.event_person_organisations (
  id serial PRIMARY KEY,
  event_person_id text NOT NULL REFERENCES public.event_people(id) ON DELETE CASCADE,
  organisation_id text NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
  relationship_type text NOT NULL,
  role_label text,
  confidence text DEFAULT 'confirmed' NOT NULL
);

CREATE TABLE IF NOT EXISTS public.event_organisations (
  id serial PRIMARY KEY,
  event_id text NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  organisation_id text NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
  relationship_type text NOT NULL CHECK (relationship_type IN (
    'organiser', 'co-organiser', 'host', 'institutional-host', 'producer',
    'co-producer', 'promoter', 'commissioner', 'sponsor', 'partner',
    'participant', 'delegation', 'venue-owner', 'venue-operator', 'security',
    'press', 'broadcaster', 'streamer', 'publisher', 'governing-body',
    'affiliate', 'other'
  )),
  role_label text
);

CREATE TABLE IF NOT EXISTS public.event_broadcasts (
  id serial PRIMARY KEY,
  event_id text NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  broadcaster_organisation_id text NOT NULL REFERENCES public.organisations(id),
  channel_or_service text,
  programme_name text,
  broadcast_title text,
  broadcast_type text DEFAULT 'television' NOT NULL,
  local_start_time text,
  local_end_time text,
  territory text,
  language text DEFAULT 'en',
  live_status text DEFAULT 'live' NOT NULL,
  source_id text
);

CREATE TABLE IF NOT EXISTS public.event_topics (
  id serial PRIMARY KEY,
  event_id text NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  topic_id text NOT NULL,
  relationship_type text NOT NULL,
  relevance double precision DEFAULT 1.0 NOT NULL
);

CREATE TABLE IF NOT EXISTS public.event_location_sequences (
  id serial PRIMARY KEY,
  event_id text NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  sequence_index integer NOT NULL,
  label text NOT NULL,
  latitude double precision NOT NULL,
  longitude double precision NOT NULL,
  timestamp text,
  precision text DEFAULT 'building' NOT NULL
);

-- 6. Sources, Corroboration & Claims
CREATE TABLE IF NOT EXISTS public.sources (
  id text PRIMARY KEY,
  title text NOT NULL,
  publisher text NOT NULL,
  source_type text NOT NULL,
  tier text NOT NULL,
  url text,
  archive_url text,
  author text,
  publication_date text,
  trust_score double precision DEFAULT 1.0 NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.source_fetches (
  id serial PRIMARY KEY,
  source_id text NOT NULL REFERENCES public.sources(id) ON DELETE CASCADE,
  url text NOT NULL,
  sha256 text NOT NULL,
  http_status integer,
  raw_content text,
  content_type text,
  fetched_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.event_sources (
  id serial PRIMARY KEY,
  event_id text NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  source_id text NOT NULL REFERENCES public.sources(id) ON DELETE CASCADE,
  is_primary boolean DEFAULT true NOT NULL
);

CREATE TABLE IF NOT EXISTS public.event_person_location_sources (
  id serial PRIMARY KEY,
  event_person_location_id integer NOT NULL REFERENCES public.event_person_locations(id) ON DELETE CASCADE,
  source_id text NOT NULL REFERENCES public.sources(id) ON DELETE CASCADE,
  is_primary boolean DEFAULT true NOT NULL,
  CONSTRAINT uq_event_person_location_sources UNIQUE (event_person_location_id, source_id)
);

-- Foreign key constraints for source references on prior tables
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_event_titles_source') THEN
    ALTER TABLE public.event_titles
      ADD CONSTRAINT fk_event_titles_source
      FOREIGN KEY (source_id) REFERENCES public.sources(id)
      ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_event_broadcasts_source') THEN
    ALTER TABLE public.event_broadcasts
      ADD CONSTRAINT fk_event_broadcasts_source
      FOREIGN KEY (source_id) REFERENCES public.sources(id)
      ON DELETE SET NULL;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.claims (
  id text PRIMARY KEY,
  event_id text NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  subject_id text REFERENCES public.people(id),
  claim_type text NOT NULL,
  statement text NOT NULL,
  claimed_time text,
  claimed_venue text,
  source_id text REFERENCES public.sources(id),
  confidence text DEFAULT 'confirmed' NOT NULL,
  supporting_excerpt text,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.quotes (
  id text PRIMARY KEY,
  event_id text NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  speaker_id text NOT NULL REFERENCES public.people(id),
  quote text NOT NULL,
  context text,
  language text DEFAULT 'en' NOT NULL,
  source_id text REFERENCES public.sources(id),
  timestamp_in_media text,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.media_assets (
  id text PRIMARY KEY,
  event_id text NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  media_type text NOT NULL,
  url text NOT NULL,
  thumbnail_url text,
  caption text,
  source_id text REFERENCES public.sources(id),
  duration_seconds integer,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- 7. Ingestion & Review Queues
CREATE TABLE IF NOT EXISTS public.candidate_events (
  id text PRIMARY KEY,
  fingerprint text NOT NULL,
  raw_extraction text NOT NULL,
  suggested_title text NOT NULL,
  suggested_date text NOT NULL,
  suggested_place text,
  suggested_participants text,
  primary_source_tier text NOT NULL,
  assigned_lane text NOT NULL,
  duplicate_match_id text REFERENCES public.events(id),
  duplicate_similarity double precision,
  status text DEFAULT 'pending' NOT NULL,
  rejection_reason text,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.review_decisions (
  id serial PRIMARY KEY,
  candidate_id text NOT NULL REFERENCES public.candidate_events(id) ON DELETE CASCADE,
  decision text NOT NULL,
  decided_by text NOT NULL,
  notes text,
  decided_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.audit_log (
  id serial PRIMARY KEY,
  event_id text,
  candidate_id text,
  action text NOT NULL,
  rule_id text,
  details text NOT NULL,
  recorded_at timestamp with time zone DEFAULT now() NOT NULL
);

-- ==============================================================================
-- INDEXES (Performance optimization according to Supabase best practices)
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_people_slug ON public.people(slug);
CREATE INDEX IF NOT EXISTS idx_people_publication_status ON public.people(publication_status);

CREATE INDEX IF NOT EXISTS idx_events_slug ON public.events(slug);
CREATE INDEX IF NOT EXISTS idx_events_start_date ON public.events(start_date);
CREATE INDEX IF NOT EXISTS idx_events_place_id ON public.events(place_id);
CREATE INDEX IF NOT EXISTS idx_events_publication_status ON public.events(publication_status);

CREATE INDEX IF NOT EXISTS idx_places_slug ON public.places(slug);
CREATE INDEX IF NOT EXISTS idx_event_titles_event_id ON public.event_titles(event_id);
CREATE INDEX IF NOT EXISTS idx_event_people_event_id ON public.event_people(event_id);
CREATE INDEX IF NOT EXISTS idx_event_people_person_id ON public.event_people(person_id);
CREATE INDEX IF NOT EXISTS idx_event_person_locations_event_person_id ON public.event_person_locations(event_person_id);
CREATE INDEX IF NOT EXISTS idx_event_person_orgs_event_person_id ON public.event_person_organisations(event_person_id);
CREATE INDEX IF NOT EXISTS idx_event_organisations_event_id ON public.event_organisations(event_id);
CREATE INDEX IF NOT EXISTS idx_event_broadcasts_event_id ON public.event_broadcasts(event_id);
CREATE INDEX IF NOT EXISTS idx_event_topics_event_id ON public.event_topics(event_id);
CREATE INDEX IF NOT EXISTS idx_event_location_seq_event_id ON public.event_location_sequences(event_id);

CREATE INDEX IF NOT EXISTS idx_event_sources_event_id ON public.event_sources(event_id);
CREATE INDEX IF NOT EXISTS idx_event_sources_source_id ON public.event_sources(source_id);
CREATE INDEX IF NOT EXISTS idx_event_person_location_sources_loc_id ON public.event_person_location_sources(event_person_location_id);
CREATE INDEX IF NOT EXISTS idx_event_person_location_sources_source_id ON public.event_person_location_sources(source_id);
CREATE INDEX IF NOT EXISTS idx_claims_event_id ON public.claims(event_id);
CREATE INDEX IF NOT EXISTS idx_claims_subject_id ON public.claims(subject_id);
CREATE INDEX IF NOT EXISTS idx_quotes_event_id ON public.quotes(event_id);
CREATE INDEX IF NOT EXISTS idx_quotes_speaker_id ON public.quotes(speaker_id);
CREATE INDEX IF NOT EXISTS idx_media_assets_event_id ON public.media_assets(event_id);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) & ACCESS CONTROL
-- ==============================================================================
-- Enable RLS on all tables
ALTER TABLE public.organisations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coverage_programmes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.people ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.person_aliases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.person_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venue_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.places ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.place_aliases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_series ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_titles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_people ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_person_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_person_organisations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_organisations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_broadcasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_location_sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.source_fetches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_person_location_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Public read policies for published material (anon and authenticated)
DO $$
BEGIN
  -- People: only published
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'people' AND policyname = 'Allow public read on published people') THEN
    CREATE POLICY "Allow public read on published people" ON public.people FOR SELECT TO anon, authenticated USING (publication_status = 'published');
  END IF;

  -- Events: only published
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'events' AND policyname = 'Allow public read on published events') THEN
    CREATE POLICY "Allow public read on published events" ON public.events FOR SELECT TO anon, authenticated USING (publication_status = 'published');
  END IF;

  -- Lookup / reference tables: unrestricted public select
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'organisations' AND policyname = 'Allow public read on organisations') THEN
    CREATE POLICY "Allow public read on organisations" ON public.organisations FOR SELECT TO anon, authenticated USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'coverage_programmes' AND policyname = 'Allow public read on coverage_programmes') THEN
    CREATE POLICY "Allow public read on coverage_programmes" ON public.coverage_programmes FOR SELECT TO anon, authenticated USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'person_aliases' AND policyname = 'Allow public read on person_aliases') THEN
    CREATE POLICY "Allow public read on person_aliases" ON public.person_aliases FOR SELECT TO anon, authenticated
      USING (EXISTS (SELECT 1 FROM public.people p WHERE p.id = person_aliases.person_id AND p.publication_status = 'published'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'person_roles' AND policyname = 'Allow public read on person_roles') THEN
    CREATE POLICY "Allow public read on person_roles" ON public.person_roles FOR SELECT TO anon, authenticated
      USING (EXISTS (SELECT 1 FROM public.people p WHERE p.id = person_roles.person_id AND p.publication_status = 'published'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'venues' AND policyname = 'Allow public read on venues') THEN
    CREATE POLICY "Allow public read on venues" ON public.venues FOR SELECT TO anon, authenticated
      USING (
        EXISTS (SELECT 1 FROM public.events e WHERE e.venue_id = venues.id AND e.publication_status = 'published')
        OR EXISTS (
          SELECT 1 FROM public.event_person_locations epl
          JOIN public.event_people ep ON ep.id = epl.event_person_id
          JOIN public.events e ON e.id = ep.event_id
          WHERE epl.venue_id = venues.id
          AND e.publication_status = 'published'
          AND epl.public_visibility IN ('public-exact', 'public-venue', 'public-city')
        )
      );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'venue_areas' AND policyname = 'Allow public read on venue_areas') THEN
    CREATE POLICY "Allow public read on venue_areas" ON public.venue_areas FOR SELECT TO anon, authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.event_person_locations epl
          JOIN public.event_people ep ON ep.id = epl.event_person_id
          JOIN public.events e ON e.id = ep.event_id
          WHERE epl.venue_area_id = venue_areas.id
          AND e.publication_status = 'published'
          AND epl.public_visibility IN ('public-exact', 'public-venue', 'public-city')
        )
      );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'addresses' AND policyname = 'Allow public read on addresses') THEN
    CREATE POLICY "Allow public read on addresses" ON public.addresses FOR SELECT TO anon, authenticated
      USING (
        EXISTS (SELECT 1 FROM public.events e WHERE e.address_id = addresses.id AND e.publication_status = 'published')
        OR EXISTS (
          SELECT 1 FROM public.venues v
          WHERE v.address_id = addresses.id
          AND (
            EXISTS (SELECT 1 FROM public.events e WHERE e.venue_id = v.id AND e.publication_status = 'published')
            OR EXISTS (
              SELECT 1 FROM public.event_person_locations epl
              JOIN public.event_people ep ON ep.id = epl.event_person_id
              JOIN public.events e ON e.id = ep.event_id
              WHERE epl.venue_id = v.id
              AND e.publication_status = 'published'
              AND epl.public_visibility IN ('public-exact', 'public-venue', 'public-city')
            )
          )
        )
      );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'places' AND policyname = 'Allow public read on places') THEN
    CREATE POLICY "Allow public read on places" ON public.places FOR SELECT TO anon, authenticated USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'place_aliases' AND policyname = 'Allow public read on place_aliases') THEN
    CREATE POLICY "Allow public read on place_aliases" ON public.place_aliases FOR SELECT TO anon, authenticated USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'event_series' AND policyname = 'Allow public read on event_series') THEN
    CREATE POLICY "Allow public read on event_series" ON public.event_series FOR SELECT TO anon, authenticated USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'event_titles' AND policyname = 'Allow public read on event_titles') THEN
    CREATE POLICY "Allow public read on event_titles" ON public.event_titles FOR SELECT TO anon, authenticated
      USING (EXISTS (SELECT 1 FROM public.events e WHERE e.id = event_titles.event_id AND e.publication_status = 'published'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'event_people' AND policyname = 'Allow public read on event_people') THEN
    CREATE POLICY "Allow public read on event_people" ON public.event_people FOR SELECT TO anon, authenticated
      USING (EXISTS (SELECT 1 FROM public.events e WHERE e.id = event_people.event_id AND e.publication_status = 'published'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'event_person_locations' AND policyname = 'Allow public read on event_person_locations') THEN
    CREATE POLICY "Allow public read on event_person_locations" ON public.event_person_locations FOR SELECT TO anon, authenticated
      USING (
        public_visibility IN ('public-exact', 'public-venue', 'public-city')
        AND EXISTS (
          SELECT 1 FROM public.event_people ep
          JOIN public.events e ON e.id = ep.event_id
          WHERE ep.id = event_person_locations.event_person_id
          AND e.publication_status = 'published'
        )
      );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'event_person_organisations' AND policyname = 'Allow public read on event_person_organisations') THEN
    CREATE POLICY "Allow public read on event_person_organisations" ON public.event_person_organisations FOR SELECT TO anon, authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.event_people ep
          JOIN public.events e ON e.id = ep.event_id
          WHERE ep.id = event_person_organisations.event_person_id
          AND e.publication_status = 'published'
        )
      );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'event_organisations' AND policyname = 'Allow public read on event_organisations') THEN
    CREATE POLICY "Allow public read on event_organisations" ON public.event_organisations FOR SELECT TO anon, authenticated
      USING (EXISTS (SELECT 1 FROM public.events e WHERE e.id = event_organisations.event_id AND e.publication_status = 'published'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'event_broadcasts' AND policyname = 'Allow public read on event_broadcasts') THEN
    CREATE POLICY "Allow public read on event_broadcasts" ON public.event_broadcasts FOR SELECT TO anon, authenticated
      USING (EXISTS (SELECT 1 FROM public.events e WHERE e.id = event_broadcasts.event_id AND e.publication_status = 'published'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'event_topics' AND policyname = 'Allow public read on event_topics') THEN
    CREATE POLICY "Allow public read on event_topics" ON public.event_topics FOR SELECT TO anon, authenticated
      USING (EXISTS (SELECT 1 FROM public.events e WHERE e.id = event_topics.event_id AND e.publication_status = 'published'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'event_location_sequences' AND policyname = 'Allow public read on event_location_sequences') THEN
    CREATE POLICY "Allow public read on event_location_sequences" ON public.event_location_sequences FOR SELECT TO anon, authenticated
      USING (EXISTS (SELECT 1 FROM public.events e WHERE e.id = event_location_sequences.event_id AND e.publication_status = 'published'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'sources' AND policyname = 'Allow public read on sources') THEN
    CREATE POLICY "Allow public read on sources" ON public.sources FOR SELECT TO anon, authenticated USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'event_sources' AND policyname = 'Allow public read on event_sources') THEN
    CREATE POLICY "Allow public read on event_sources" ON public.event_sources FOR SELECT TO anon, authenticated
      USING (EXISTS (SELECT 1 FROM public.events e WHERE e.id = event_sources.event_id AND e.publication_status = 'published'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'event_person_location_sources' AND policyname = 'Allow public read on event_person_location_sources') THEN
    CREATE POLICY "Allow public read on event_person_location_sources" ON public.event_person_location_sources FOR SELECT TO anon, authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.event_person_locations epl
          JOIN public.event_people ep ON ep.id = epl.event_person_id
          JOIN public.events e ON e.id = ep.event_id
          WHERE epl.id = event_person_location_sources.event_person_location_id
          AND e.publication_status = 'published'
          AND epl.public_visibility IN ('public-exact', 'public-venue', 'public-city')
        )
      );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'claims' AND policyname = 'Allow public read on claims') THEN
    CREATE POLICY "Allow public read on claims" ON public.claims FOR SELECT TO anon, authenticated
      USING (event_id IS NULL OR EXISTS (SELECT 1 FROM public.events e WHERE e.id = claims.event_id AND e.publication_status = 'published'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'quotes' AND policyname = 'Allow public read on quotes') THEN
    CREATE POLICY "Allow public read on quotes" ON public.quotes FOR SELECT TO anon, authenticated
      USING (event_id IS NULL OR EXISTS (SELECT 1 FROM public.events e WHERE e.id = quotes.event_id AND e.publication_status = 'published'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'media_assets' AND policyname = 'Allow public read on media_assets') THEN
    CREATE POLICY "Allow public read on media_assets" ON public.media_assets FOR SELECT TO anon, authenticated
      USING (event_id IS NULL OR EXISTS (SELECT 1 FROM public.events e WHERE e.id = media_assets.event_id AND e.publication_status = 'published'));
  END IF;
END $$;

-- Explicit Grants for PostgREST Data API exposure
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon, authenticated;

-- Revoke access to internal administrative/review tables from public and authenticated roles
REVOKE ALL ON public.candidate_events FROM anon, authenticated;
REVOKE ALL ON public.review_decisions FROM anon, authenticated;
REVOKE ALL ON public.audit_log FROM anon, authenticated;
REVOKE ALL ON public.source_fetches FROM anon, authenticated;
