-- Migration: 20260904070000_mobile_venues_and_vessel_architecture.sql
-- Description: Add mobile vessel support to venues (Air Force One, Marine One, Royal Train), seed canonical mobile craft and interior venue areas.

-- 1. Add mobile vessel columns to venues table
ALTER TABLE venues ADD COLUMN IF NOT EXISTS is_mobile_vessel boolean DEFAULT false NOT NULL;
ALTER TABLE venues ADD COLUMN IF NOT EXISTS home_base_place_id text REFERENCES places(id);
ALTER TABLE venues ADD COLUMN IF NOT EXISTS vessel_type text; -- aircraft, train, ship, motorcade, submarine
ALTER TABLE venues ADD COLUMN IF NOT EXISTS callsign_or_registration text;

-- 2. Index mobile venues for fast geospatial and timeline filtering
CREATE INDEX IF NOT EXISTS idx_venues_mobile_vessel ON venues(is_mobile_vessel) WHERE is_mobile_vessel = true;

-- 3. Ensure Joint Base Andrews home base place exists
INSERT INTO places (id, slug, venue, city, country, latitude, longitude, place_type)
VALUES (
  'plc-joint-base-andrews',
  'joint-base-andrews',
  'Joint Base Andrews',
  'Camp Springs',
  'United States',
  38.8108,
  -76.8670,
  'venue'
)
ON CONFLICT (id) DO UPDATE SET
  venue = EXCLUDED.venue,
  city = EXCLUDED.city,
  country = EXCLUDED.country,
  latitude = EXCLUDED.latitude,
  longitude = EXCLUDED.longitude;

-- 4. Seed Canonical Mobile Venues
INSERT INTO venues (id, name, address_id, is_mobile_vessel, home_base_place_id, vessel_type, callsign_or_registration, latitude, longitude)
VALUES
  (
    'ven-usaf-air-force-one',
    'Air Force One (Boeing VC-25A / SAM 28000 / SAM 29000)',
    NULL,
    true,
    'plc-joint-base-andrews',
    'aircraft',
    'SAM 28000 / SAM 29000',
    38.8108,
    -76.8670
  ),
  (
    'ven-usmc-marine-one',
    'Marine One (Sikorsky VH-3D / VH-92A)',
    NULL,
    true,
    'plc-joint-base-andrews',
    'aircraft',
    'Nighthawk',
    38.8108,
    -76.8670
  ),
  (
    'ven-uk-royal-train',
    'British Royal Train',
    NULL,
    true,
    NULL,
    'train',
    'Class 67',
    51.5074,
    -0.1278
  )
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  is_mobile_vessel = EXCLUDED.is_mobile_vessel,
  home_base_place_id = EXCLUDED.home_base_place_id,
  vessel_type = EXCLUDED.vessel_type,
  callsign_or_registration = EXCLUDED.callsign_or_registration;

-- 5. Seed Canonical Interior Venue Areas for Air Force One
INSERT INTO venue_areas (id, venue_id, name, area_type, latitude, longitude)
VALUES
  (
    'area-afo-presidential-suite',
    'ven-usaf-air-force-one',
    'Presidential Executive Stateroom & Office',
    'office',
    38.8108,
    -76.8670
  ),
  (
    'area-afo-conference-room',
    'ven-usaf-air-force-one',
    'Airborne Conference & Briefing Room',
    'room',
    38.8108,
    -76.8670
  ),
  (
    'area-afo-press-cabin',
    'ven-usaf-air-force-one',
    'Aft Press Pool & Media Cabin',
    'room',
    38.8108,
    -76.8670
  ),
  (
    'area-afo-cockpit',
    'ven-usaf-air-force-one',
    'Flight Operations Deck',
    'cockpit',
    38.8108,
    -76.8670
  )
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  area_type = EXCLUDED.area_type;
