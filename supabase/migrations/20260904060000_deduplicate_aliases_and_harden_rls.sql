-- Migration: 20260904060000_deduplicate_aliases_and_harden_rls.sql
-- Description: Deduplicate person_aliases, add UNIQUE constraint, and harden RLS on citations and legacy reference tables without touching other project data.

-- 1. Deduplicate person_aliases, keeping the earliest row (lowest id) for each (person_id, alias)
DELETE FROM person_aliases
WHERE id IN (
  SELECT id
  FROM (
    SELECT id, ROW_NUMBER() OVER (PARTITION BY person_id, lower(alias) ORDER BY id ASC) as rnum
    FROM person_aliases
  ) sub
  WHERE rnum > 1
);

-- 2. Add UNIQUE constraint on (person_id, alias) to support idempotent upserts and onConflictDoNothing
ALTER TABLE person_aliases
  DROP CONSTRAINT IF EXISTS person_aliases_person_id_alias_key;

ALTER TABLE person_aliases
  ADD CONSTRAINT person_aliases_person_id_alias_key UNIQUE (person_id, alias);

CREATE UNIQUE INDEX IF NOT EXISTS idx_person_aliases_unique_lower
  ON person_aliases (person_id, lower(alias));

-- 3. Harden RLS on REWiND's citations table (guard if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'citations') THEN
    ALTER TABLE citations ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Allow public read on citations" ON citations;
    CREATE POLICY "Allow public read on citations" ON citations FOR SELECT USING (true);
  END IF;
END $$;

-- 4. Harden RLS on legacy reference tables with permissive non-blocking policies
-- (Ensures zero data is overwritten or modified while satisfying Supabase linter 0013_rls_disabled_in_public)
DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'architecture_types',
    'charles_booth_data',
    'community_posts',
    'contributions',
    'historical_periods',
    'notable_buildings',
    'post_replies',
    'postal_areas',
    'postal_districts',
    'street_citations',
    'street_name_history',
    'street_name_history_citations',
    'streets'
  ] LOOP
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = t) THEN
      EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY;', t);
      EXECUTE format('DROP POLICY IF EXISTS %I ON %I;', 'allow_read_' || t, t);
      EXECUTE format('CREATE POLICY %I ON %I FOR SELECT USING (true);', 'allow_read_' || t, t);

      -- For user-submitted tables, allow insert for authenticated users with valid auth identity
      IF t IN ('community_posts', 'contributions', 'post_replies') THEN
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I;', 'allow_insert_' || t, t);
        EXECUTE format('CREATE POLICY %I ON %I FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);', 'allow_insert_' || t, t);
      END IF;
    END IF;
  END LOOP;
END $$;
