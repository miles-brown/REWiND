-- Migration: 20260904070000_mobile_venues_and_vessel_architecture.sql
-- Description: Add mobile vessel support to venues (Air Force One, Marine One, Royal Train), seed canonical mobile craft and interior venue areas.

-- 1. Add mobile vessel columns to venues table
ALTER TABLE venues ADD COLUMN IF NOT EXISTS is_mobile_vessel boolean DEFAULT false NOT NULL;
ALTER TABLE venues ADD COLUMN IF NOT EXISTS home_base_place_id text REFERENCES places(id);
ALTER TABLE venues ADD COLUMN IF NOT EXISTS vessel_type text; -- aircraft, train, ship, motorcade, submarine
ALTER TABLE venues ADD COLUMN IF NOT EXISTS callsign_or_registration text;

-- 2. Index mobile venues for fast geospatial and timeline filtering
CREATE INDEX IF NOT EXISTS idx_venues_mobile_vessel ON venues(is_mobile_vessel) WHERE is_mobile_vessel = true;

-- 3. Ensure Joint Base Andrews and MCAF Quantico home base places exist, resolving existing rows by id or slug
DO $$
DECLARE
  v_andrews_id text;
  v_quantico_id text;
BEGIN
  SELECT id INTO v_andrews_id
  FROM places
  WHERE id = 'plc-joint-base-andrews' OR slug = 'joint-base-andrews'
  ORDER BY (id = 'plc-joint-base-andrews') DESC
  LIMIT 1;

  IF v_andrews_id IS NULL THEN
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
    RETURNING id INTO v_andrews_id;
  ELSE
    UPDATE places
    SET
      venue = 'Joint Base Andrews',
      city = 'Camp Springs',
      country = 'United States',
      latitude = 38.8108,
      longitude = -76.8670
    WHERE id = v_andrews_id;
  END IF;

  SELECT id INTO v_quantico_id
  FROM places
  WHERE id = 'plc-mcaf-quantico' OR slug = 'mcaf-quantico'
  ORDER BY (id = 'plc-mcaf-quantico') DESC
  LIMIT 1;

  IF v_quantico_id IS NULL THEN
    INSERT INTO places (id, slug, venue, city, country, latitude, longitude, place_type)
    VALUES (
      'plc-mcaf-quantico',
      'mcaf-quantico',
      'Marine Corps Air Facility Quantico',
      'Quantico',
      'United States',
      38.5035,
      -77.3053,
      'venue'
    )
    RETURNING id INTO v_quantico_id;
  ELSE
    UPDATE places
    SET
      venue = 'Marine Corps Air Facility Quantico',
      city = 'Quantico',
      country = 'United States',
      latitude = 38.5035,
      longitude = -77.3053
    WHERE id = v_quantico_id;
  END IF;

  -- 4. Seed Canonical Mobile Venues (leave mobile venue coordinates NULL so transit events use per-event coordinates)
  INSERT INTO venues (id, name, address_id, is_mobile_vessel, home_base_place_id, vessel_type, callsign_or_registration, latitude, longitude)
  VALUES
    (
      'ven-usaf-air-force-one',
      'Air Force One (Boeing VC-25A / SAM 28000 / SAM 29000)',
      NULL,
      true,
      v_andrews_id,
      'aircraft',
      'SAM 28000 / SAM 29000',
      NULL,
      NULL
    ),
    (
      'ven-usmc-marine-one',
      'Marine One (Sikorsky VH-3D / VH-92A)',
      NULL,
      true,
      v_quantico_id,
      'aircraft',
      'Nighthawk',
      NULL,
      NULL
    ),
    (
      'ven-uk-royal-train',
      'British Royal Train',
      NULL,
      true,
      NULL,
      'train',
      'Class 67',
      NULL,
      NULL
    )
  ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    is_mobile_vessel = EXCLUDED.is_mobile_vessel,
    home_base_place_id = EXCLUDED.home_base_place_id,
    vessel_type = EXCLUDED.vessel_type,
    callsign_or_registration = EXCLUDED.callsign_or_registration,
    latitude = NULL,
    longitude = NULL;
END $$;

-- 5. Seed Canonical Interior Venue Areas for Air Force One (coordinates NULL on mobile interior areas)
INSERT INTO venue_areas (id, venue_id, name, area_type, latitude, longitude)
VALUES
  (
    'area-afo-presidential-suite',
    'ven-usaf-air-force-one',
    'Presidential Executive Stateroom & Office',
    'office',
    NULL,
    NULL
  ),
  (
    'area-afo-conference-room',
    'ven-usaf-air-force-one',
    'Airborne Conference & Briefing Room',
    'room',
    NULL,
    NULL
  ),
  (
    'area-afo-press-cabin',
    'ven-usaf-air-force-one',
    'Aft Press Pool & Media Cabin',
    'room',
    NULL,
    NULL
  ),
  (
    'area-afo-cockpit',
    'ven-usaf-air-force-one',
    'Flight Operations Deck',
    'cockpit',
    NULL,
    NULL
  )
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  area_type = EXCLUDED.area_type,
  latitude = NULL,
  longitude = NULL;
