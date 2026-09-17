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
  ADD COLUMN IF NOT EXISTS dst_observed boolean,
  ADD COLUMN IF NOT EXISTS timezone_confidence text,
  ADD COLUMN IF NOT EXISTS time_conversion_method text,
  ADD COLUMN IF NOT EXISTS time_standard text,
  ADD COLUMN IF NOT EXISTS duration_seconds integer,
  ADD COLUMN IF NOT EXISTS duration_precision text,
  ADD COLUMN IF NOT EXISTS duration_basis text,
  ADD COLUMN IF NOT EXISTS holiday_applicable boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS holiday_name text,
  ADD COLUMN IF NOT EXISTS holiday_type text,
  ADD COLUMN IF NOT EXISTS holiday_jurisdiction text;

-- 2. Extend Sources with Independence and Level Taxonomy
ALTER TABLE public.sources
  ADD COLUMN IF NOT EXISTS source_level text,
  ADD COLUMN IF NOT EXISTS independence_status text,
  ADD COLUMN IF NOT EXISTS derived_from_source_id text REFERENCES public.sources(id),
  ADD COLUMN IF NOT EXISTS source_quality text;

-- 3. Extend Claims to General Purpose Epistemic Architecture
ALTER TABLE public.claims
  ALTER COLUMN event_id DROP NOT NULL,
  ADD COLUMN IF NOT EXISTS subject_entity_type text DEFAULT 'event',
  ADD COLUMN IF NOT EXISTS subject_entity_id text,
  ADD COLUMN IF NOT EXISTS claim_status text DEFAULT 'PROVISIONAL',
  ADD COLUMN IF NOT EXISTS epistemic_class text DEFAULT 'allegation',
  ADD COLUMN IF NOT EXISTS legal_status text,
  ADD COLUMN IF NOT EXISTS is_attributed_only boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS attribution_speaker_id text REFERENCES public.people(id);

-- Backfill claim_status and epistemic_class based on existing claim confidence
UPDATE public.claims
SET
  claim_status = CASE
    WHEN confidence = 'confirmed' THEN 'ESTABLISHED'
    WHEN confidence = 'disputed' THEN 'DISPUTED'
    WHEN confidence = 'refuted' THEN 'CONTRADICTED'
    WHEN confidence = 'contradicted' THEN 'CONTRADICTED'
    ELSE 'PROVISIONAL'
  END,
  epistemic_class = CASE
    WHEN confidence = 'confirmed' THEN 'documented fact'
    WHEN confidence = 'disputed' THEN 'disputed proposition'
    WHEN confidence = 'refuted' THEN 'disputed proposition'
    WHEN confidence = 'contradicted' THEN 'disputed proposition'
    ELSE 'allegation'
  END
WHERE claim_status IS NULL OR claim_status = 'PROVISIONAL' OR claim_status = 'REFUTED';

-- 4. Create Claim Evidence Table (Linking Claims to Supporting or Contradictory Proof)
CREATE TABLE IF NOT EXISTS public.claim_evidence (
  id text PRIMARY KEY,
  claim_id text NOT NULL REFERENCES public.claims(id) ON DELETE CASCADE,
  source_id text NOT NULL REFERENCES public.sources(id) ON DELETE CASCADE,
  evidence_form text NOT NULL,
  evidence_strength text,
  directness text,
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
  ADD COLUMN IF NOT EXISTS achievements jsonb DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS inclusion_contested boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS inclusion_contestation_note text,
  ADD COLUMN IF NOT EXISTS primary_figure_category text DEFAULT 'historical-figure';

-- 6. Create Modular Demographic Extension Tables (Education, Career, Awards, Works)
CREATE TABLE IF NOT EXISTS public.person_education (
  id text PRIMARY KEY,
  person_id text NOT NULL REFERENCES public.people(id) ON DELETE CASCADE,
  institution text NOT NULL,
  degree text,
  field_of_study text,
  start_year text,
  end_year text,
  notes text,
  source_id text REFERENCES public.sources(id),
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.person_career (
  id text PRIMARY KEY,
  person_id text NOT NULL REFERENCES public.people(id) ON DELETE CASCADE,
  organisation_id text REFERENCES public.organisations(id),
  organisation_name text,
  role_title text NOT NULL,
  start_date text,
  end_date text,
  is_current boolean DEFAULT false,
  notes text,
  source_id text REFERENCES public.sources(id),
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.person_awards (
  id text PRIMARY KEY,
  person_id text NOT NULL REFERENCES public.people(id) ON DELETE CASCADE,
  award_name text NOT NULL,
  awarding_body text,
  year_received text,
  citation text,
  source_id text REFERENCES public.sources(id),
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.person_works (
  id text PRIMARY KEY,
  person_id text NOT NULL REFERENCES public.people(id) ON DELETE CASCADE,
  title text NOT NULL,
  work_type text NOT NULL,
  publication_year text,
  publisher text,
  url text,
  notes text,
  source_id text REFERENCES public.sources(id),
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- 7. Add High-Performance Foreign Key & Filtering Indexes
CREATE INDEX IF NOT EXISTS idx_events_day_of_week ON public.events(day_of_week);
CREATE INDEX IF NOT EXISTS idx_events_timezone_id ON public.events(timezone_id);
CREATE INDEX IF NOT EXISTS idx_claims_status ON public.claims(claim_status);
CREATE INDEX IF NOT EXISTS idx_claims_epistemic_class ON public.claims(epistemic_class);
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

-- 9. Create Scoped Public Read Policies
DROP POLICY IF EXISTS "Public read claims" ON public.claims;
DROP POLICY IF EXISTS "Allow public read on claims" ON public.claims;
CREATE POLICY "Allow public read on claims"
  ON public.claims FOR SELECT
  TO anon, authenticated
  USING (
    (
      -- Polymorphic or legacy person subject
      (
        (claims.subject_entity_type = 'person' AND claims.subject_entity_id IS NOT NULL AND EXISTS (
          SELECT 1 FROM public.people p WHERE (p.id = claims.subject_entity_id OR p.slug = claims.subject_entity_id) AND p.publication_status = 'published'
        ))
        OR
        (claims.event_id IS NULL AND claims.subject_id IS NOT NULL AND EXISTS (
          SELECT 1 FROM public.people p WHERE (p.id = claims.subject_id OR p.slug = claims.subject_id) AND p.publication_status = 'published'
        ))
      )
    )
    OR
    (
      -- Polymorphic organisation subject
      (claims.subject_entity_type = 'organisation' AND claims.subject_entity_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM public.organisations o WHERE o.id = claims.subject_entity_id OR o.slug = claims.subject_entity_id
      ))
    )
    OR
    (
      -- Event-scoped claim (via event_id or polymorphic subject_entity_id)
      (
        (claims.event_id IS NOT NULL AND EXISTS (
          SELECT 1 FROM public.events e WHERE (e.id = claims.event_id OR e.slug = claims.event_id) AND e.publication_status = 'published'
        ))
        OR
        (claims.subject_entity_type = 'event' AND claims.subject_entity_id IS NOT NULL AND EXISTS (
          SELECT 1 FROM public.events e WHERE (e.id = claims.subject_entity_id OR e.slug = claims.subject_entity_id) AND e.publication_status = 'published'
        ))
      )
    )
  );

DROP POLICY IF EXISTS "Public read claim evidence" ON public.claim_evidence;
CREATE POLICY "Public read claim evidence"
  ON public.claim_evidence FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.claims c
      WHERE c.id = claim_evidence.claim_id
        AND (
          -- Polymorphic or legacy person subject
          (
            (c.subject_entity_type = 'person' AND c.subject_entity_id IS NOT NULL AND EXISTS (
              SELECT 1 FROM public.people p WHERE (p.id = c.subject_entity_id OR p.slug = c.subject_entity_id) AND p.publication_status = 'published'
            ))
            OR
            (c.event_id IS NULL AND c.subject_id IS NOT NULL AND EXISTS (
              SELECT 1 FROM public.people p WHERE (p.id = c.subject_id OR p.slug = c.subject_id) AND p.publication_status = 'published'
            ))
          )
          OR
          -- Polymorphic organisation subject
          (
            c.subject_entity_type = 'organisation' AND c.subject_entity_id IS NOT NULL AND EXISTS (
              SELECT 1 FROM public.organisations o WHERE o.id = c.subject_entity_id OR o.slug = c.subject_entity_id
            )
          )
          OR
          -- Event-scoped claim
          (
            (c.event_id IS NOT NULL AND EXISTS (
              SELECT 1 FROM public.events e WHERE (e.id = c.event_id OR e.slug = c.event_id) AND e.publication_status = 'published'
            ))
            OR
            (c.subject_entity_type = 'event' AND c.subject_entity_id IS NOT NULL AND EXISTS (
              SELECT 1 FROM public.events e WHERE (e.id = c.subject_entity_id OR e.slug = c.subject_entity_id) AND e.publication_status = 'published'
            ))
          )
        )
    )
  );

DROP POLICY IF EXISTS "Public read person education" ON public.person_education;
CREATE POLICY "Public read person education"
  ON public.person_education FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.people p
      WHERE p.id = person_education.person_id AND p.publication_status = 'published'
    )
  );

DROP POLICY IF EXISTS "Public read person career" ON public.person_career;
CREATE POLICY "Public read person career"
  ON public.person_career FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.people p
      WHERE p.id = person_career.person_id AND p.publication_status = 'published'
    )
  );

DROP POLICY IF EXISTS "Public read person awards" ON public.person_awards;
CREATE POLICY "Public read person awards"
  ON public.person_awards FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.people p
      WHERE p.id = person_awards.person_id AND p.publication_status = 'published'
    )
  );

DROP POLICY IF EXISTS "Public read person works" ON public.person_works;
CREATE POLICY "Public read person works"
  ON public.person_works FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.people p
      WHERE p.id = person_works.person_id AND p.publication_status = 'published'
    )
  );

-- 10. Grant Privileges to Public Client Roles
GRANT SELECT ON public.claim_evidence TO anon, authenticated;
GRANT SELECT ON public.person_education TO anon, authenticated;
GRANT SELECT ON public.person_career TO anon, authenticated;
GRANT SELECT ON public.person_awards TO anon, authenticated;
GRANT SELECT ON public.person_works TO anon, authenticated;
