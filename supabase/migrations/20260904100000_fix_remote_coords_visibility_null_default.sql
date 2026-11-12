-- Migration: 20260904100000_fix_remote_coords_visibility_null_default.sql
-- Description: Replace event_people_remote_coords_visibility_check and sanitize_public_remote_location so blank or missing publicVisibility falls back to public_visibility and defaults to '' in the CHECK comparison, rejecting ungated coordinates and restricted descriptive fields.

ALTER TABLE event_people DROP CONSTRAINT IF EXISTS event_people_remote_coords_visibility_check;

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
  AND coalesce(
    nullif(btrim(remote_location->>'publicVisibility'), ''),
    nullif(btrim(remote_location->>'public_visibility'), ''),
    ''
  ) IN ('restricted', 'internal', 'private');

UPDATE event_people
SET remote_location = remote_location - 'latitude' - 'longitude'
WHERE remote_location IS NOT NULL
  AND (
    (remote_location->>'latitude') IS NOT NULL
    OR (remote_location->>'longitude') IS NOT NULL
  )
  AND coalesce(
    nullif(btrim(remote_location->>'publicVisibility'), ''),
    nullif(btrim(remote_location->>'public_visibility'), ''),
    ''
  ) <> 'public-exact';

ALTER TABLE event_people ADD CONSTRAINT event_people_remote_coords_visibility_check
  CHECK (
    remote_location IS NULL
    OR (
      (
        (
          (remote_location->>'latitude') IS NULL
          AND (remote_location->>'longitude') IS NULL
        )
        OR coalesce(
          nullif(btrim(remote_location->>'publicVisibility'), ''),
          nullif(btrim(remote_location->>'public_visibility'), ''),
          ''
        ) = 'public-exact'
      )
      AND (
        coalesce(
          nullif(btrim(remote_location->>'publicVisibility'), ''),
          nullif(btrim(remote_location->>'public_visibility'), ''),
          ''
        ) NOT IN ('restricted', 'internal', 'private')
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

CREATE OR REPLACE FUNCTION public.sanitize_public_remote_location(p_remote_location jsonb)
RETURNS jsonb
LANGUAGE sql
IMMUTABLE
SET search_path = pg_catalog
AS $$
  SELECT CASE
    WHEN p_remote_location IS NULL THEN NULL
    WHEN coalesce(
      nullif(btrim(p_remote_location->>'publicVisibility'), ''),
      nullif(btrim(p_remote_location->>'public_visibility'), ''),
      ''
    ) = 'public-exact' THEN
      p_remote_location
    ELSE
      jsonb_strip_nulls(
        jsonb_build_object(
          'connectionType', p_remote_location->'connectionType',
          'publicVisibility', to_jsonb(
            coalesce(
              nullif(btrim(p_remote_location->>'publicVisibility'), ''),
              nullif(btrim(p_remote_location->>'public_visibility'), '')
            )
          )
        )
      )
  END;
$$;

