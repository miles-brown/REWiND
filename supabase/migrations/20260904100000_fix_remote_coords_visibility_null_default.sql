-- Migration: 20260904100000_fix_remote_coords_visibility_null_default.sql
-- Description: Replace event_people_remote_coords_visibility_check so missing publicVisibility defaults to '' in the CHECK comparison and rejects ungated coordinates.

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
  AND coalesce(remote_location->>'publicVisibility', remote_location->>'public_visibility', '') IN ('restricted', 'internal', 'private');

UPDATE event_people
SET remote_location = remote_location - 'latitude' - 'longitude'
WHERE remote_location IS NOT NULL
  AND (
    (remote_location->>'latitude') IS NOT NULL
    OR (remote_location->>'longitude') IS NOT NULL
  )
  AND coalesce(remote_location->>'publicVisibility', remote_location->>'public_visibility', '') <> 'public-exact';

ALTER TABLE event_people ADD CONSTRAINT event_people_remote_coords_visibility_check
  CHECK (
    remote_location IS NULL
    OR (
      (
        (
          (remote_location->>'latitude') IS NULL
          AND (remote_location->>'longitude') IS NULL
        )
        OR coalesce(remote_location->>'publicVisibility', remote_location->>'public_visibility', '') = 'public-exact'
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

