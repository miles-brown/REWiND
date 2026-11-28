-- Migration: 20260904120000_archive_delegation_placeholder_rpc.sql
-- Description: Atomic optimistic archival update RPC for delegation placeholder records.
-- Evaluates expected summary, role, and revision token via request body to prevent URL overflow.

CREATE OR REPLACE FUNCTION public.archive_delegation_placeholder(
  p_id TEXT,
  p_expected_primary_role TEXT DEFAULT NULL,
  p_expected_summary TEXT DEFAULT NULL,
  p_expected_updated_at TIMESTAMPTZ DEFAULT NULL,
  p_classification TEXT DEFAULT 'delegation',
  p_primary_role TEXT DEFAULT 'Official Delegation',
  p_notability_basis TEXT DEFAULT 'diplomatic-delegation-composite',
  p_publication_status TEXT DEFAULT 'archived',
  p_summary TEXT DEFAULT NULL,
  p_updated_at TIMESTAMPTZ DEFAULT NOW()
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_updated INT;
BEGIN
  UPDATE public.people
  SET
    classification = p_classification,
    primary_role = p_primary_role,
    notability_basis = p_notability_basis,
    publication_status = p_publication_status,
    summary = p_summary,
    updated_at = p_updated_at
  WHERE id = p_id
    AND (
      (p_expected_primary_role IS NULL AND primary_role IS NULL)
      OR primary_role = p_expected_primary_role
    )
    AND (
      (p_expected_summary IS NULL AND summary IS NULL)
      OR summary = p_expected_summary
    )
    AND (
      (p_expected_updated_at IS NULL AND updated_at IS NULL)
      OR updated_at = p_expected_updated_at
    );

  GET DIAGNOSTICS v_updated = ROW_COUNT;
  RETURN v_updated > 0;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.archive_delegation_placeholder(
  TEXT, TEXT, TEXT, TIMESTAMPTZ, TEXT, TEXT, TEXT, TEXT, TEXT, TIMESTAMPTZ
) FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.archive_delegation_placeholder(
  TEXT, TEXT, TEXT, TIMESTAMPTZ, TEXT, TEXT, TEXT, TEXT, TEXT, TIMESTAMPTZ
) TO service_role;

