-- ==============================================================================
-- REWiND — Quote, Claim & Evidence RLS Hardening (Migration 20260904030000)
-- Migration: 20260904030000_quote_and_claim_rls_hardening.sql
-- ==============================================================================

-- 1. Hardened Quotes RLS Policy (Speaker Must Be Published for Event Quotes)
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

-- 2. Hardened Claims RLS Policy (ALL Referenced Events & Subjects Must Be Published)
DROP POLICY IF EXISTS "Public read claims" ON public.claims;
DROP POLICY IF EXISTS "Allow public read on claims" ON public.claims;
CREATE POLICY "Allow public read on claims"
  ON public.claims FOR SELECT
  TO anon, authenticated
  USING (
    (
      claims.attribution_speaker_id IS NULL OR EXISTS (
        SELECT 1 FROM public.people p WHERE p.id = claims.attribution_speaker_id AND p.publication_status = 'published'
      )
    )
    AND
    (
      (
        -- Case 1: Event-linked claim (event_id is present or subject is event) -> ALL referenced events MUST be published; if subject person is specified, person MUST also be published
        (claims.event_id IS NOT NULL OR (claims.subject_entity_type = 'event' AND claims.subject_entity_id IS NOT NULL))
        AND
        (claims.event_id IS NULL OR EXISTS (
          SELECT 1 FROM public.events e WHERE e.id = claims.event_id AND e.publication_status = 'published'
        ))
        AND
        (claims.subject_entity_type <> 'event' OR claims.subject_entity_id IS NULL OR EXISTS (
          SELECT 1 FROM public.events e WHERE (e.id = claims.subject_entity_id OR e.slug = claims.subject_entity_id) AND e.publication_status = 'published'
        ))
        AND
        (claims.subject_id IS NULL OR EXISTS (
          SELECT 1 FROM public.people p WHERE p.id = claims.subject_id AND p.publication_status = 'published'
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
            SELECT 1 FROM public.people p WHERE p.id = claims.subject_id AND p.publication_status = 'published'
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
          SELECT 1 FROM public.organisations o WHERE (o.id = claims.subject_entity_id OR o.slug = claims.subject_entity_id)
        )
      )
    )
  );

-- 3. Hardened Claim Evidence RLS Policy
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
            SELECT 1 FROM public.people p WHERE p.id = c.attribution_speaker_id AND p.publication_status = 'published'
          )
        )
        AND (
          (
            -- Case 1: Event-linked claim -> ALL referenced events MUST be published; if subject person is specified, person MUST also be published
            (c.event_id IS NOT NULL OR (c.subject_entity_type = 'event' AND c.subject_entity_id IS NOT NULL))
            AND
            (c.event_id IS NULL OR EXISTS (
              SELECT 1 FROM public.events e WHERE e.id = c.event_id AND e.publication_status = 'published'
            ))
            AND
            (c.subject_entity_type <> 'event' OR c.subject_entity_id IS NULL OR EXISTS (
              SELECT 1 FROM public.events e WHERE (e.id = c.subject_entity_id OR e.slug = c.subject_entity_id) AND e.publication_status = 'published'
            ))
            AND
            (c.subject_id IS NULL OR EXISTS (
              SELECT 1 FROM public.people p WHERE p.id = c.subject_id AND p.publication_status = 'published'
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
                SELECT 1 FROM public.people p WHERE p.id = c.subject_id AND p.publication_status = 'published'
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
              SELECT 1 FROM public.organisations o WHERE (o.id = c.subject_entity_id OR o.slug = c.subject_entity_id)
            )
          )
        )
    )
  );

-- 4. Hardened Event Participant & Location RLS Policies (Requires both Published Event & Published Participant)
DROP POLICY IF EXISTS "Allow public read on event_people" ON public.event_people;
CREATE POLICY "Allow public read on event_people"
  ON public.event_people FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (SELECT 1 FROM public.events e WHERE e.id = event_people.event_id AND e.publication_status = 'published')
    AND EXISTS (SELECT 1 FROM public.people p WHERE p.id = event_people.person_id AND p.publication_status = 'published')
  );

DROP POLICY IF EXISTS "Allow public read on event_person_locations" ON public.event_person_locations;
CREATE POLICY "Allow public read on event_person_locations"
  ON public.event_person_locations FOR SELECT
  TO anon, authenticated
  USING (
    public_visibility = 'public-exact'
    AND EXISTS (
      SELECT 1 FROM public.event_people ep
      JOIN public.events e ON e.id = ep.event_id
      JOIN public.people p ON p.id = ep.person_id
      WHERE ep.id = event_person_locations.event_person_id
        AND e.publication_status = 'published'
        AND p.publication_status = 'published'
    )
  );

DROP POLICY IF EXISTS "Allow public read on event_person_organisations" ON public.event_person_organisations;
CREATE POLICY "Allow public read on event_person_organisations"
  ON public.event_person_organisations FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.event_people ep
      JOIN public.events e ON e.id = ep.event_id
      JOIN public.people p ON p.id = ep.person_id
      WHERE ep.id = event_person_organisations.event_person_id
        AND e.publication_status = 'published'
        AND p.publication_status = 'published'
    )
  );

DROP POLICY IF EXISTS "Allow public read on event_person_location_sources" ON public.event_person_location_sources;
CREATE POLICY "Allow public read on event_person_location_sources"
  ON public.event_person_location_sources FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.event_person_locations epl
      JOIN public.event_people ep ON ep.id = epl.event_person_id
      JOIN public.events e ON e.id = ep.event_id
      JOIN public.people p ON p.id = ep.person_id
      WHERE epl.id = event_person_location_sources.event_person_location_id
        AND e.publication_status = 'published'
        AND p.publication_status = 'published'
        AND epl.public_visibility = 'public-exact'
    )
  );

