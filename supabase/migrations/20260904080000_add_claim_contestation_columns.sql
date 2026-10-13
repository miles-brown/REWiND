-- ==============================================================================
-- REWiND — Add Claim Contestation & Contradiction Columns (Migration 20260904080000)
-- Migration: 20260904080000_add_claim_contestation_columns.sql
-- ==============================================================================

ALTER TABLE public.claims
  ADD COLUMN IF NOT EXISTS contradicts_claim_id TEXT,
  ADD COLUMN IF NOT EXISTS contestation_notes TEXT;
