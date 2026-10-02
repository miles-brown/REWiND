-- ==============================================================================
-- REWiND — Schema Perfection, Travel Corridors & Person Stays (Migration 20260904040000)
-- Migration: 20260904040000_schema_perfection_and_travel_corridors.sql
-- ==============================================================================

-- 1. Extend People with Full Demographic & Inclusion Attributes
ALTER TABLE public.people
  ADD COLUMN IF NOT EXISTS full_birth_name text,
  ADD COLUMN IF NOT EXISTS citizenship text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS national_identity text,
  ADD COLUMN IF NOT EXISTS ethnicity text,
  ADD COLUMN IF NOT EXISTS ancestry text,
  ADD COLUMN IF NOT EXISTS religion text,
  ADD COLUMN IF NOT EXISTS religious_denomination text,
  ADD COLUMN IF NOT EXISTS religion_status text DEFAULT 'unspecified',
  ADD COLUMN IF NOT EXISTS languages text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS primary_figure_category text DEFAULT 'historical-figure',
  ADD COLUMN IF NOT EXISTS inclusion_basis text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS inclusion_rationale text,
  ADD COLUMN IF NOT EXISTS cultural_impact_summary text,
  ADD COLUMN IF NOT EXISTS achievements jsonb DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS inclusion_contested boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS inclusion_contestation_note text;

-- 2. Extend Events with Travel, Flight Corridors & Navigation Waypoints
ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS is_travel_event boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS transport_mode text,
  ADD COLUMN IF NOT EXISTS flight_identifier text,
  ADD COLUMN IF NOT EXISTS is_documented_flight boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS flight_corridor text,
  ADD COLUMN IF NOT EXISTS departure_airport_iata text,
  ADD COLUMN IF NOT EXISTS arrival_airport_iata text,
  ADD COLUMN IF NOT EXISTS origin_waypoint jsonb,
  ADD COLUMN IF NOT EXISTS destination_waypoint jsonb,
  ADD COLUMN IF NOT EXISTS route_coordinates jsonb,
  ADD COLUMN IF NOT EXISTS travel_inferences jsonb DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS journey_legs jsonb DEFAULT '[]';

-- 3. Create Person Stays Table (Bases of Operations, Residencies, Hotels)
CREATE TABLE IF NOT EXISTS public.person_stays (
  id text PRIMARY KEY,
  person_id text NOT NULL REFERENCES public.people(id) ON DELETE CASCADE,
  venue_name text NOT NULL,
  stay_name text,
  stay_type text DEFAULT 'official_residence' NOT NULL,
  city text NOT NULL,
  country text NOT NULL,
  latitude double precision NOT NULL,
  longitude double precision NOT NULL,
  start_date text NOT NULL,
  end_date text,
  is_base_of_operations boolean DEFAULT false NOT NULL,
  is_primary_residence boolean DEFAULT false NOT NULL,
  security_level text,
  notes text,
  source_id text REFERENCES public.sources(id),
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- 3b. Create Topics and Person Milestones Tables
CREATE TABLE IF NOT EXISTS public.topics (
  id text PRIMARY KEY,
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  category text NOT NULL,
  summary text,
  started_date text,
  ended_date text,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.person_milestones (
  id text PRIMARY KEY,
  person_id text NOT NULL REFERENCES public.people(id) ON DELETE CASCADE,
  title text NOT NULL,
  category text NOT NULL,
  date text,
  year integer NOT NULL,
  description text,
  metric_or_stat text,
  source_id text REFERENCES public.sources(id),
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- 4. Enable RLS and Configure Read Policies
ALTER TABLE public.person_stays ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.person_milestones ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read on topics" ON public.topics;
CREATE POLICY "Allow public read on topics" ON public.topics FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read on person_milestones" ON public.person_milestones;
CREATE POLICY "Allow public read on person_milestones" ON public.person_milestones FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read person stays" ON public.person_stays;
DROP POLICY IF EXISTS "Allow public read on person stays" ON public.person_stays;
CREATE POLICY "Allow public read on person stays"
  ON public.person_stays FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.people p
      WHERE p.id = person_stays.person_id
        AND p.publication_status = 'published'
    )
  );

-- 5. Backfill Defaults for Non-Null Integrity
UPDATE public.people SET religion_status = 'unspecified' WHERE religion_status IS NULL;
UPDATE public.people SET inclusion_contested = FALSE WHERE inclusion_contested IS NULL;
UPDATE public.events SET is_travel_event = FALSE WHERE is_travel_event IS NULL;
UPDATE public.events SET is_documented_flight = FALSE WHERE is_documented_flight IS NULL;

-- 6. Performance Indexes for Forensic Queries & Filters
CREATE INDEX IF NOT EXISTS idx_people_slug ON public.people (slug);
CREATE INDEX IF NOT EXISTS idx_people_pub_status ON public.people (publication_status);
CREATE INDEX IF NOT EXISTS idx_events_start_date ON public.events (start_date);
CREATE INDEX IF NOT EXISTS idx_events_place_id ON public.events (place_id);
CREATE INDEX IF NOT EXISTS idx_claims_subject_id ON public.claims (subject_id);
CREATE INDEX IF NOT EXISTS idx_quotes_speaker_id ON public.quotes (speaker_id);
CREATE INDEX IF NOT EXISTS idx_person_stays_person ON public.person_stays (person_id);

