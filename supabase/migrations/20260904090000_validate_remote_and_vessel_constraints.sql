-- Migration: 20260904090000_validate_remote_and_vessel_constraints.sql
-- Description: Validate NOT VALID CHECK constraints added for places, event_people, and mobile venues in a separate migration transaction to avoid holding ACCESS EXCLUSIVE locks during table scans.

ALTER TABLE places VALIDATE CONSTRAINT places_country_no_compound_slash;
ALTER TABLE event_people VALIDATE CONSTRAINT event_people_remote_coords_visibility_check;
ALTER TABLE venues VALIDATE CONSTRAINT venues_mobile_vessel_no_address_check;

