-- Migration: 20260904050000_add_subvenue_to_events.sql
-- Description: Add subvenue column to the events table to reflect subvenue support in EventRecord

ALTER TABLE events ADD COLUMN IF NOT EXISTS subvenue text;
