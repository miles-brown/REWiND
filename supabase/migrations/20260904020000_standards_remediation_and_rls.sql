-- ==============================================================================
-- REWiND — Standards Remediation, Conservative Evidence Defaults & Polymorphic RLS
-- Migration: 20260904020000_standards_remediation_and_rls.sql
-- ==============================================================================

-- 1. Drop Inadvertent Defaults & Remediate Unassessed Event Timezone Metadata
ALTER TABLE public.events
  ALTER COLUMN dst_observed DROP DEFAULT,
  ALTER COLUMN timezone_confidence DROP DEFAULT,
  ALTER COLUMN time_standard DROP DEFAULT;

UPDATE public.events
SET dst_observed = NULL,
    timezone_confidence = NULL,
    time_standard = NULL
WHERE timezone_id IS NULL AND local_start_time IS NULL;

-- 2. Drop Inadvertent Defaults & Remediate Unassessed Sources
ALTER TABLE public.sources
  ALTER COLUMN source_level DROP DEFAULT,
  ALTER COLUMN independence_status DROP DEFAULT,
  ALTER COLUMN source_quality DROP DEFAULT;

-- 3. Drop Defaults on Claim Evidence Strength and Directness
ALTER TABLE public.claim_evidence
  ALTER COLUMN evidence_strength DROP DEFAULT,
  ALTER COLUMN evidence_strength DROP NOT NULL,
  ALTER COLUMN directness DROP DEFAULT,
  ALTER COLUMN directness DROP NOT NULL;

-- 4. Remediate Legacy Refuted and Contradicted Claims Status
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

-- 5. Update RLS Policies to Authorize Published Polymorphic Subjects & Require ALL Referenced Events to be Published
DROP POLICY IF EXISTS "Public read claims" ON public.claims;
DROP POLICY IF EXISTS "Allow public read on claims" ON public.claims;
CREATE POLICY "Allow public read on claims"
  ON public.claims FOR SELECT
  TO anon, authenticated
  USING (
    (
      claims.attribution_speaker_id IS NULL OR EXISTS (
        SELECT 1 FROM public.people p WHERE (p.id = claims.attribution_speaker_id OR p.slug = claims.attribution_speaker_id) AND p.publication_status = 'published'
      )
    )
    AND
    (
      (
        -- Case 1: Event-linked claim (event_id is present or subject is event) -> ALL referenced events MUST be published; if subject person is specified, person MUST also be published
        (claims.event_id IS NOT NULL OR (claims.subject_entity_type = 'event' AND claims.subject_entity_id IS NOT NULL))
        AND
        (claims.event_id IS NULL OR EXISTS (
          SELECT 1 FROM public.events e WHERE (e.id = claims.event_id OR e.slug = claims.event_id) AND e.publication_status = 'published'
        ))
        AND
        (claims.subject_entity_type <> 'event' OR claims.subject_entity_id IS NULL OR EXISTS (
          SELECT 1 FROM public.events e WHERE (e.id = claims.subject_entity_id OR e.slug = claims.subject_entity_id) AND e.publication_status = 'published'
        ))
        AND
        (claims.subject_id IS NULL OR EXISTS (
          SELECT 1 FROM public.people p WHERE (p.id = claims.subject_id OR p.slug = claims.subject_id) AND p.publication_status = 'published'
        ))
        AND
        (claims.subject_entity_type <> 'person' OR claims.subject_entity_id IS NULL OR EXISTS (
          SELECT 1 FROM public.people p WHERE (p.id = claims.subject_entity_id OR p.slug = claims.subject_entity_id) AND p.publication_status = 'published'
        ))
      )
      OR
      (
        -- Case 2: Standalone Person Biographical Claim (event_id is NULL and subject_entity_type is NOT event) -> Person MUST be published
        claims.event_id IS NULL
        AND (claims.subject_entity_type IS NULL OR claims.subject_entity_type <> 'event')
        AND (
          (claims.subject_entity_type = 'person' AND claims.subject_entity_id IS NOT NULL AND EXISTS (
            SELECT 1 FROM public.people p WHERE (p.id = claims.subject_entity_id OR p.slug = claims.subject_entity_id) AND p.publication_status = 'published'
          ))
          OR
          (claims.subject_id IS NOT NULL AND EXISTS (
            SELECT 1 FROM public.people p WHERE (p.id = claims.subject_id OR p.slug = claims.subject_id) AND p.publication_status = 'published'
          ))
        )
      )
      OR
      (
        -- Case 3: Standalone Organisation Claim (event_id is NULL and subject_entity_type is organisation) -> Organisation must exist
        claims.event_id IS NULL
        AND claims.subject_entity_type = 'organisation'
        AND claims.subject_entity_id IS NOT NULL
        AND EXISTS (
          SELECT 1 FROM public.organisations o WHERE o.id = claims.subject_entity_id OR o.slug = claims.subject_entity_id
        )
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
          c.attribution_speaker_id IS NULL OR EXISTS (
            SELECT 1 FROM public.people p WHERE (p.id = c.attribution_speaker_id OR p.slug = c.attribution_speaker_id) AND p.publication_status = 'published'
          )
        )
        AND (
          (
            -- Case 1: Event-linked claim -> ALL referenced events MUST be published; if subject person is specified, person MUST also be published
            (c.event_id IS NOT NULL OR (c.subject_entity_type = 'event' AND c.subject_entity_id IS NOT NULL))
            AND
            (c.event_id IS NULL OR EXISTS (
              SELECT 1 FROM public.events e WHERE (e.id = c.event_id OR e.slug = c.event_id) AND e.publication_status = 'published'
            ))
            AND
            (c.subject_entity_type <> 'event' OR c.subject_entity_id IS NULL OR EXISTS (
              SELECT 1 FROM public.events e WHERE (e.id = c.subject_entity_id OR e.slug = c.subject_entity_id) AND e.publication_status = 'published'
            ))
            AND
            (c.subject_id IS NULL OR EXISTS (
              SELECT 1 FROM public.people p WHERE (p.id = c.subject_id OR p.slug = c.subject_id) AND p.publication_status = 'published'
            ))
            AND
            (c.subject_entity_type <> 'person' OR c.subject_entity_id IS NULL OR EXISTS (
              SELECT 1 FROM public.people p WHERE (p.id = c.subject_entity_id OR p.slug = c.subject_entity_id) AND p.publication_status = 'published'
            ))
          )
          OR
          (
            -- Case 2: Standalone Person Biographical Claim (event_id is NULL and subject_entity_type is NOT event) -> Person MUST be published
            c.event_id IS NULL
            AND (c.subject_entity_type IS NULL OR c.subject_entity_type <> 'event')
            AND (
              (c.subject_entity_type = 'person' AND c.subject_entity_id IS NOT NULL AND EXISTS (
                SELECT 1 FROM public.people p WHERE (p.id = c.subject_entity_id OR p.slug = c.subject_entity_id) AND p.publication_status = 'published'
              ))
              OR
              (c.subject_id IS NOT NULL AND EXISTS (
                SELECT 1 FROM public.people p WHERE (p.id = c.subject_id OR p.slug = c.subject_id) AND p.publication_status = 'published'
              ))
            )
          )
          OR
          (
            -- Case 3: Standalone Organisation Claim (event_id is NULL and subject_entity_type is organisation) -> Organisation must exist
            c.event_id IS NULL
            AND c.subject_entity_type = 'organisation'
            AND c.subject_entity_id IS NOT NULL
            AND EXISTS (
              SELECT 1 FROM public.organisations o WHERE o.id = c.subject_entity_id OR o.slug = c.subject_entity_id
            )
          )
        )
    )
  );

-- 6. Authorize Published Quotes with Published Speakers
DROP POLICY IF EXISTS "Public read quotes" ON public.quotes;
DROP POLICY IF EXISTS "Allow public read on quotes" ON public.quotes;
CREATE POLICY "Allow public read on quotes"
  ON public.quotes FOR SELECT
  TO anon, authenticated
  USING (
    (
      -- Case 1: Event-linked quote -> Event MUST be published; if speaker is specified, speaker MUST also be published
      quotes.event_id IS NOT NULL
      AND EXISTS (
        SELECT 1 FROM public.events e WHERE e.id = quotes.event_id AND e.publication_status = 'published'
      )
      AND (
        quotes.speaker_id IS NULL OR EXISTS (
          SELECT 1 FROM public.people p WHERE p.id = quotes.speaker_id AND p.publication_status = 'published'
        )
      )
    )
    OR
    (
      -- Case 2: Standalone quote (event_id is NULL) -> Speaker MUST be published
      quotes.event_id IS NULL
      AND quotes.speaker_id IS NOT NULL
      AND EXISTS (
        SELECT 1 FROM public.people p WHERE p.id = quotes.speaker_id AND p.publication_status = 'published'
      )
    )
  );
