-- Migration: 20260904110000_validate_remote_coords_visibility_check.sql
-- Description: Validate the updated event_people_remote_coords_visibility_check constraint in a separate migration transaction.

ALTER TABLE event_people VALIDATE CONSTRAINT event_people_remote_coords_visibility_check;

