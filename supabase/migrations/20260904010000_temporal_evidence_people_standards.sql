-- ==============================================================================
-- REWiND — Temporal, Evidence, Fact & People Standards Migration
-- ==============================================================================

-- 1. Extend Events with Rich Temporal, Time Zone, Duration and Holiday Context
ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS day_of_week text,
  ADD COLUMN IF NOT EXISTS local_start_time text,
  ADD COLUMN IF NOT EXISTS local_end_time text,
  ADD COLUMN IF NOT EXISTS utc_start_time text,
  ADD COLUMN IF NOT EXISTS utc_end_time text,
  ADD COLUMN IF NOT EXISTS timezone_id text,
  ADD COLUMN IF NOT EXISTS utc_offset_seconds integer,
  ADD COLUMN IF NOT EXISTS timezone_abbreviation text,
  ADD COLUMN IF NOT EXISTS dst_observed boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS timezone_confidence text DEFAULT 'exact',
  ADD COLUMN IF NOT EXISTS time_conversion_method text,
  ADD COLUMN IF NOT EXISTS time_standard text DEFAULT 'local civil time',
  ADD COLUMN IF NOT EXISTS duration_seconds integer,
  ADD COLUMN IF NOT EXISTS duration_precision text,
  ADD COLUMN IF NOT EXISTS duration_basis text,
  ADD COLUMN IF NOT EXISTS holiday_applicable boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS holiday_name text,
  ADD COLUMN IF NOT EXISTS holiday_type text,
  ADD COLUMN IF NOT EXISTS holiday_jurisdiction text;

-- 2. Extend Sources with Independence and Level Taxonomy
ALTER TABLE public.sources
  ADD COLUMN IF NOT EXISTS source_level text DEFAULT 'primary',
  ADD COLUMN IF NOT EXISTS independence_status text DEFAULT 'independent',
  ADD COLUMN IF NOT EXISTS derived_from_source_id text REFERENCES public.sources(id),
  ADD COLUMN IF NOT EXISTS source_quality text DEFAULT 'high';

-- 3. Extend Claims to General Purpose Epistemic Architecture
ALTER TABLE public.claims
  ADD COLUMN IF NOT EXISTS subject_entity_type text DEFAULT 'event',
  ADD COLUMN IF NOT EXISTS subject_entity_id text,
  ADD COLUMN IF NOT EXISTS claim_status text DEFAULT 'ESTABLISHED',
  ADD COLUMN IF NOT EXISTS epistemic_class text DEFAULT 'documented fact',
  ADD COLUMN IF NOT EXISTS legal_status text,
  ADD COLUMN IF NOT EXISTS is_attributed_only boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS attribution_speaker_id text REFERENCES public.people(id);

-- 4. Create Claim Evidence Table (Linking Claims to Supporting or Contradictory Proof)
CREATE TABLE IF NOT EXISTS public.claim_evidence (
  id text PRIMARY KEY,
  claim_id text NOT NULL REFERENCES public.claims(id) ON DELETE CASCADE,
  source_id text NOT NULL REFERENCES public.sources(id) ON DELETE CASCADE,
  evidence_form text NOT NULL,
  evidence_strength text DEFAULT 'direct conclusive' NOT NULL,
  directness text DEFAULT 'direct' NOT NULL,
  citation_locator text,
  supporting_excerpt text,
  contradicts_claim boolean DEFAULT false NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- 5. Extend People with Structured Identity, Sensitive Demographics & Inclusion Basis
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
  ADD COLUMN IF NOT EXISTS inclusion_basis text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS inclusion_rationale text,
  ADD COLUMN IF NOT EXISTS cultural_impact_summary text,
  ADD COLUMN IF NOT EXISTS achievements jsonb DEFAULT '[]';

-- 6. Create Relational Biographical Tables
CREATE TABLE IF NOT EXISTS public.person_education (
  id text PRIMARY KEY,
  person_id text NOT NULL REFERENCES public.people(id) ON DELETE CASCADE,
  institution text NOT NULL,
  location text,
  start_date text,
  end_date text,
  qualification text,
  subject text,
  degree text,
  honours text,
  completed_status text DEFAULT 'completed' NOT NULL,
  source_id text REFERENCES public.sources(id),
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.person_career (
  id text PRIMARY KEY,
  person_id text NOT NULL REFERENCES public.people(id) ON DELETE CASCADE,
  organisation_name text NOT NULL,
  position_title text NOT NULL,
  occupation_category text,
  start_date text,
  end_date text,
  location text,
  appointment_method text,
  predecessor text,
  successor text,
  notes text,
  source_id text REFERENCES public.sources(id),
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.person_awards (
  id text PRIMARY KEY,
  person_id text NOT NULL REFERENCES public.people(id) ON DELETE CASCADE,
  award_name text NOT NULL,
  awarding_body text NOT NULL,
  category text,
  award_year integer,
  result text DEFAULT 'winner' NOT NULL,
  citation_reason text,
  source_id text REFERENCES public.sources(id),
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.person_works (
  id text PRIMARY KEY,
  person_id text NOT NULL REFERENCES public.people(id) ON DELETE CASCADE,
  work_title text NOT NULL,
  work_type text NOT NULL,
  release_date text,
  publisher_or_venue text,
  significance_note text,
  source_id text REFERENCES public.sources(id),
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- 7. Indexes for Query Performance
CREATE INDEX IF NOT EXISTS idx_events_day_of_week ON public.events(day_of_week);
CREATE INDEX IF NOT EXISTS idx_events_timezone_id ON public.events(timezone_id);
CREATE INDEX IF NOT EXISTS idx_claims_status ON public.claims(claim_status);
CREATE INDEX IF NOT EXISTS idx_claims_subject_entity ON public.claims(subject_entity_type, subject_entity_id);
CREATE INDEX IF NOT EXISTS idx_claim_evidence_claim ON public.claim_evidence(claim_id);
CREATE INDEX IF NOT EXISTS idx_claim_evidence_source ON public.claim_evidence(source_id);
CREATE INDEX IF NOT EXISTS idx_person_education_person ON public.person_education(person_id);
CREATE INDEX IF NOT EXISTS idx_person_career_person ON public.person_career(person_id);
CREATE INDEX IF NOT EXISTS idx_person_awards_person ON public.person_awards(person_id);
CREATE INDEX IF NOT EXISTS idx_person_works_person ON public.person_works(person_id);

-- 8. Enable Row Level Security (RLS) on New Tables
ALTER TABLE public.claim_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.person_education ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.person_career ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.person_awards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.person_works ENABLE ROW LEVEL SECURITY;

-- 9. Create Public Read Policies
DROP POLICY IF EXISTS "Public read claim evidence" ON public.claim_evidence;
CREATE POLICY "Public read claim evidence"
  ON public.claim_evidence FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Public read person education" ON public.person_education;
CREATE POLICY "Public read person education"
  ON public.person_education FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Public read person career" ON public.person_career;
CREATE POLICY "Public read person career"
  ON public.person_career FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Public read person awards" ON public.person_awards;
CREATE POLICY "Public read person awards"
  ON public.person_awards FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Public read person works" ON public.person_works;
CREATE POLICY "Public read person works"
  ON public.person_works FOR SELECT
  USING (true);

-- 10. Grant Privileges to Public Client Roles
GRANT SELECT ON public.claim_evidence TO anon, authenticated;
GRANT SELECT ON public.person_education TO anon, authenticated;
GRANT SELECT ON public.person_career TO anon, authenticated;
GRANT SELECT ON public.person_awards TO anon, authenticated;
GRANT SELECT ON public.person_works TO anon, authenticated;
