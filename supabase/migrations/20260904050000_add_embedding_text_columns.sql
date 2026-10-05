-- ============================================================================
-- REWiND Evidence Atlas: Forward Migration for Semantic Text Embeddings
-- Version: 20260904050000_add_embedding_text_columns.sql
-- Description: Adds nullable text embedding columns to people and events
-- ============================================================================

ALTER TABLE IF EXISTS public.people 
  ADD COLUMN IF NOT EXISTS embedding text;

ALTER TABLE IF EXISTS public.events 
  ADD COLUMN IF NOT EXISTS embedding text;
