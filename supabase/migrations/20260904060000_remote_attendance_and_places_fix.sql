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

-- 2. Repoint any events referencing the compound place
UPDATE events
SET place_id = 'plc-riyadh-king-khalid-international'
WHERE place_id = 'plc-riyadh-to-tel-aviv-king-khalid-international';

-- 3. Purge compound / slash country places
DELETE FROM places
WHERE id = 'plc-riyadh-to-tel-aviv-king-khalid-international'
   OR country LIKE '%/%'
   OR country LIKE '%;%';

-- 4. Enforce invariant: places.country must never contain compound delimiters
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'places_country_no_compound_slash'
  ) THEN
    ALTER TABLE places ADD CONSTRAINT places_country_no_compound_slash
      CHECK (country NOT LIKE '%/%' AND country NOT LIKE '%;%');
  END IF;
END $$;

-- 5. Add remote attendance, precedence and capacity columns to event_people
ALTER TABLE event_people ADD COLUMN IF NOT EXISTS is_central_figure boolean DEFAULT false NOT NULL;
ALTER TABLE event_people ADD COLUMN IF NOT EXISTS precedence_order integer;
ALTER TABLE event_people ADD COLUMN IF NOT EXISTS prominence text DEFAULT 'participant' NOT NULL;
ALTER TABLE event_people ADD COLUMN IF NOT EXISTS remote_location jsonb;

-- 6. Ensure index on is_central_figure and prominence for fast query performance
CREATE INDEX IF NOT EXISTS idx_event_people_central ON event_people(event_id, is_central_figure);
CREATE INDEX IF NOT EXISTS idx_event_people_precedence ON event_people(event_id, precedence_order);
