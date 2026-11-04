-- Migration: 20260904060000_remote_attendance_and_places_fix.sql
-- Description: Clean up compound places (Saudi Arabia / Israel), enforce single sovereign country constraint, and add remote attendance & precedence columns to event_people.

-- 1. Ensure canonical King Khalid International Airport place exists
INSERT INTO places (id, slug, venue, city, country, latitude, longitude, place_type)
VALUES (
  'plc-riyadh-king-khalid-international',
  'riyadh-king-khalid-international',
  'King Khalid International Airport',
  'Riyadh',
  'Saudi Arabia',
  24.9576,
  46.6988,
  'venue'
)
ON CONFLICT (id) DO UPDATE SET
  venue = EXCLUDED.venue,
  city = EXCLUDED.city,
  country = EXCLUDED.country,
  latitude = EXCLUDED.latitude,
  longitude = EXCLUDED.longitude;

-- 2. Repoint any events, participant locations, and aliases referencing the compound place
UPDATE events
SET place_id = 'plc-riyadh-king-khalid-international'
WHERE place_id = 'plc-riyadh-to-tel-aviv-king-khalid-international';

UPDATE event_person_locations
SET place_id = 'plc-riyadh-king-khalid-international'
WHERE place_id = 'plc-riyadh-to-tel-aviv-king-khalid-international';

DELETE FROM place_aliases old_alias
WHERE old_alias.place_id = 'plc-riyadh-to-tel-aviv-king-khalid-international'
  AND EXISTS (
    SELECT 1 FROM place_aliases existing
    WHERE existing.place_id = 'plc-riyadh-king-khalid-international'
      AND lower(existing.alias) = lower(old_alias.alias)
  );

UPDATE place_aliases
SET place_id = 'plc-riyadh-king-khalid-international'
WHERE place_id = 'plc-riyadh-to-tel-aviv-king-khalid-international';

-- 3. Purge duplicate compound place and normalize any remaining compound / slash country places
DELETE FROM places
WHERE id = 'plc-riyadh-to-tel-aviv-king-khalid-international';

UPDATE places p
SET country = COALESCE(
  (
    SELECT btrim(part)
    FROM regexp_split_to_table(regexp_replace(p.country, ';', '/', 'g'), '/') AS part
    WHERE btrim(part) <> ''
    LIMIT 1
  ),
  'Unknown'
)
WHERE p.country LIKE '%/%' OR p.country LIKE '%;%' OR btrim(p.country) = '';

-- 4. Enforce invariant: places.country must never contain compound delimiters or blank values
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'places_country_no_compound_slash'
  ) THEN
    ALTER TABLE places ADD CONSTRAINT places_country_no_compound_slash
      CHECK (country NOT LIKE '%/%' AND country NOT LIKE '%;%' AND btrim(country) <> '') NOT VALID;
  END IF;
END $$;

-- 5. Add remote attendance, precedence and capacity columns to event_people
ALTER TABLE event_people ADD COLUMN IF NOT EXISTS is_central_figure boolean DEFAULT false NOT NULL;
ALTER TABLE event_people ADD COLUMN IF NOT EXISTS precedence_order integer;
ALTER TABLE event_people ADD COLUMN IF NOT EXISTS prominence text DEFAULT 'participant' NOT NULL;
ALTER TABLE event_people ADD COLUMN IF NOT EXISTS remote_location jsonb;

-- Strip restricted descriptive fields and ungated coordinates from remote_location JSONB before enforcing visibility check
UPDATE event_people
SET remote_location = remote_location
  - 'venueName'
  - 'city'
  - 'country'
  - 'label'
  - 'overlayText'
  - 'visibleLocationNotes'
  - 'latitude'
  - 'longitude'
WHERE remote_location IS NOT NULL
  AND coalesce(remote_location->>'publicVisibility', remote_location->>'public_visibility', '') IN ('restricted', 'internal', 'private');

UPDATE event_people
SET remote_location = remote_location - 'latitude' - 'longitude'
WHERE remote_location IS NOT NULL
  AND (
    (remote_location->>'latitude') IS NOT NULL
    OR (remote_location->>'longitude') IS NOT NULL
  )
  AND coalesce(remote_location->>'publicVisibility', remote_location->>'public_visibility', '') <> 'public-exact';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'event_people_remote_coords_visibility_check'
  ) THEN
    ALTER TABLE event_people ADD CONSTRAINT event_people_remote_coords_visibility_check
      CHECK (
        remote_location IS NULL
        OR (
          (
            (
              (remote_location->>'latitude') IS NULL
              AND (remote_location->>'longitude') IS NULL
            )
            OR coalesce(remote_location->>'publicVisibility', remote_location->>'public_visibility') = 'public-exact'
          )
          AND (
            coalesce(remote_location->>'publicVisibility', remote_location->>'public_visibility', '') NOT IN ('restricted', 'internal', 'private')
            OR (
              (remote_location->>'venueName') IS NULL
              AND (remote_location->>'city') IS NULL
              AND (remote_location->>'country') IS NULL
              AND (remote_location->>'label') IS NULL
              AND (remote_location->>'overlayText') IS NULL
              AND (remote_location->>'visibleLocationNotes') IS NULL
            )
          )
        )
      ) NOT VALID;
  END IF;
END $$;

-- Public-safe remote location sanitizer and view following the event_person_locations visibility policy pattern
CREATE OR REPLACE FUNCTION public.sanitize_public_remote_location(p_remote_location jsonb)
RETURNS jsonb
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE
    WHEN p_remote_location IS NULL THEN NULL
    WHEN coalesce(p_remote_location->>'publicVisibility', p_remote_location->>'public_visibility', '') IN ('restricted', 'internal', 'private') THEN
      jsonb_strip_nulls(
        jsonb_build_object(
          'connectionType', p_remote_location->'connectionType',
          'publicVisibility', coalesce(p_remote_location->'publicVisibility', p_remote_location->'public_visibility')
        )
      )
    WHEN coalesce(p_remote_location->>'publicVisibility', p_remote_location->>'public_visibility', '') = 'public-exact' THEN
      p_remote_location
    ELSE
      p_remote_location - 'latitude' - 'longitude'
  END;
$$;

CREATE OR REPLACE VIEW public.public_event_people
WITH (security_invoker = true)
AS
SELECT
  ep.id,
  ep.event_id,
  ep.person_id,
  ep.involvement_type,
  ep.role_label,
  ep.capacity_title,
  ep.attendance_mode,
  ep.presence_confidence,
  ep.role_confidence,
  ep.is_central_figure,
  ep.precedence_order,
  ep.prominence,
  public.sanitize_public_remote_location(ep.remote_location) AS remote_location,
  ep.notes
FROM public.event_people ep
WHERE EXISTS (
  SELECT 1 FROM public.events e
  WHERE e.id = ep.event_id AND e.publication_status = 'published'
)
AND EXISTS (
  SELECT 1 FROM public.people p
  WHERE p.id = ep.person_id AND p.publication_status = 'published'
);

GRANT SELECT ON public.public_event_people TO anon, authenticated;

-- 6. Ensure index on is_central_figure and prominence for fast query performance
CREATE INDEX IF NOT EXISTS idx_event_people_central ON event_people(event_id, is_central_figure);
CREATE INDEX IF NOT EXISTS idx_event_people_precedence ON event_people(event_id, precedence_order);
