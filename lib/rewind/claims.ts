import { createClient } from "@/lib/supabase/server";
import type { ClaimRecord, ClaimEvidenceRecord, ClaimStatus, EpistemicClass } from "./types";

const ALLOWED_CLAIM_STATUSES = new Set<ClaimStatus>([
  "ESTABLISHED",
  "STRONGLY SUPPORTED",
  "SUPPORTED",
  "PROVISIONAL",
  "UNVERIFIED",
  "DISPUTED",
  "CONTRADICTED",
  "DEMONSTRABLY FALSE",
  "UNKNOWN",
]);

const ALLOWED_EPISTEMIC_CLASSES = new Set<EpistemicClass>([
  "observed fact",
  "documented fact",
  "derived/computed fact",
  "attributed assertion",
  "expert interpretation",
  "editorial inference",
  "opinion",
  "allegation",
  "disputed proposition",
  "unknown",
]);

function parseClaimStatus(status?: string | null): ClaimStatus {
  if (!status) return "PROVISIONAL";
  const upper = status.trim().toUpperCase();
  if (upper === "REFUTED") return "CONTRADICTED";
  if (ALLOWED_CLAIM_STATUSES.has(upper as ClaimStatus)) {
    return upper as ClaimStatus;
  }
  return "PROVISIONAL";
}

function parseEpistemicClass(epistemic?: string | null): EpistemicClass {
  if (epistemic && ALLOWED_EPISTEMIC_CLASSES.has(epistemic as EpistemicClass)) {
    return epistemic as EpistemicClass;
  }
  return "unknown";
}

/**
 * Retrieves all factual claims associated with a specific event, including their evidential attachments.
 */
export async function getClaimsByEvent(eventId: string, supabaseClient?: unknown): Promise<ClaimRecord[]> {
  if (!eventId || typeof eventId !== "string" || !/^[a-zA-Z0-9_-]+$/.test(eventId)) {
    return [];
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = (supabaseClient !== undefined ? supabaseClient : (await createClient())) as any;
  if (!supabase) return [];

  const { data: claimsData, error: claimsError } = await supabase
    .from("claims")
    .select("*")
    .or(`event_id.eq.${eventId},and(subject_entity_type.eq.event,subject_entity_id.eq.${eventId})`);

  if (claimsError) {
    console.error(`Error querying claims for event ${eventId}:`, claimsError);
    throw new Error(`Failed to query claims for event ${eventId}: ${claimsError.message || String(claimsError)}`);
  }

  if (!claimsData || claimsData.length === 0) {
    return [];
  }

  const claimIds = claimsData.map((c: { id: string }) => c.id);
  const { data: evidenceData, error: evidenceError } = await supabase
    .from("claim_evidence")
    .select("*, sources(id, title, publisher, url)")
    .in("claim_id", claimIds);

  if (evidenceError) {
    console.error("Error retrieving claim evidence:", evidenceError);
    throw new Error(`Failed to query claim evidence for event ${eventId}: ${evidenceError.message || String(evidenceError)}`);
  }

  const evidenceMap = new Map<string, ClaimEvidenceRecord[]>();
  (evidenceData || []).forEach((ev: Record<string, unknown>) => {
    const list = evidenceMap.get(String(ev.claim_id)) || [];
    const src = (Array.isArray(ev.sources) ? ev.sources[0] : ev.sources) as Record<string, unknown> | undefined;
    list.push({
      id: String(ev.id),
      claimId: String(ev.claim_id),
      sourceId: String(ev.source_id || ""),
      sourceTitle: src?.title ? String(src.title) : undefined,
      sourcePublisher: src?.publisher ? String(src.publisher) : undefined,
      sourceUrl: src?.url ? String(src.url) : undefined,
      evidenceForm: String(ev.evidence_form || "direct-citation"),
      evidenceStrength: ev.evidence_strength ? String(ev.evidence_strength) : undefined,
      directness: ev.directness ? (ev.directness as "direct" | "inferential" | "unknown") : undefined,
      citationLocator: ev.citation_locator ? String(ev.citation_locator) : undefined,
      supportingExcerpt: ev.supporting_excerpt ? String(ev.supporting_excerpt) : undefined,
      contradictsClaim: Boolean(ev.contradicts_claim),
    });
    evidenceMap.set(String(ev.claim_id), list);
  });

  return claimsData.map((c: Record<string, unknown>) => {
    const entityType = c.subject_entity_id
      ? c.subject_entity_type
      : (c.subject_id ? "person" : (c.subject_entity_type || "event"));
    return {
      id: String(c.id),
      eventId: c.event_id ? String(c.event_id) : undefined,
      subjectEntityType: (entityType as "event" | "person" | "organisation") || "event",
      subjectEntityId: c.subject_entity_id ? String(c.subject_entity_id) : (c.subject_id ? String(c.subject_id) : undefined),
      claimType: String(c.claim_type),
      statement: String(c.statement),
      claimedTime: c.claimed_time ? String(c.claimed_time) : undefined,
      claimedVenue: c.claimed_venue ? String(c.claimed_venue) : undefined,
      sourceId: c.source_id ? String(c.source_id) : undefined,
      confidence: (c.confidence as ClaimRecord["confidence"]) || "limited",
      claimStatus: parseClaimStatus(c.claim_status ? String(c.claim_status) : undefined),
      epistemicClass: parseEpistemicClass(c.epistemic_class ? String(c.epistemic_class) : undefined),
      legalStatus: c.legal_status ? String(c.legal_status) : undefined,
      isAttributedOnly: Boolean(c.is_attributed_only),
      attributionSpeakerId: c.attribution_speaker_id ? String(c.attribution_speaker_id) : undefined,
      supportingExcerpt: c.supporting_excerpt ? String(c.supporting_excerpt) : undefined,
      evidence: evidenceMap.get(String(c.id)) || [],
    };
  });
}

/**
 * Retrieves biographical or event claims concerning a specific person.
 */
export async function getClaimsByPerson(personId: string, supabaseClient?: unknown): Promise<ClaimRecord[]> {
  if (!personId || typeof personId !== "string" || !/^[a-zA-Z0-9_-]+$/.test(personId)) {
    return [];
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = (supabaseClient !== undefined ? supabaseClient : (await createClient())) as any;
  if (!supabase) return [];

  const { data: claimsData, error } = await supabase
    .from("claims")
    .select("*")
    .or(`subject_id.eq.${personId},and(subject_entity_type.eq.person,subject_entity_id.eq.${personId})`);

  if (error) {
    console.error(`Error querying claims for person ${personId}:`, error);
    throw new Error(`Failed to query claims for person ${personId}: ${error.message || String(error)}`);
  }

  if (!claimsData || claimsData.length === 0) {
    return [];
  }

  const claimIds = claimsData.map((c: { id: string }) => c.id);
  const { data: evidenceData, error: evidenceError } = await supabase
    .from("claim_evidence")
    .select("*, sources(id, title, publisher, url)")
    .in("claim_id", claimIds);

  if (evidenceError) {
    console.error(`Error retrieving claim evidence for person ${personId}:`, evidenceError);
    throw new Error(`Failed to query claim evidence for person ${personId}: ${evidenceError.message || String(evidenceError)}`);
  }

  const evidenceMap = new Map<string, ClaimEvidenceRecord[]>();
  (evidenceData || []).forEach((ev: Record<string, unknown>) => {
    const list = evidenceMap.get(String(ev.claim_id)) || [];
    const src = (Array.isArray(ev.sources) ? ev.sources[0] : ev.sources) as Record<string, unknown> | undefined;
    list.push({
      id: String(ev.id),
      claimId: String(ev.claim_id),
      sourceId: String(ev.source_id || ""),
      sourceTitle: src?.title ? String(src.title) : undefined,
      sourcePublisher: src?.publisher ? String(src.publisher) : undefined,
      sourceUrl: src?.url ? String(src.url) : undefined,
      evidenceForm: String(ev.evidence_form || "direct-citation"),
      evidenceStrength: ev.evidence_strength ? String(ev.evidence_strength) : undefined,
      directness: ev.directness ? (ev.directness as "direct" | "inferential" | "unknown") : undefined,
      citationLocator: ev.citation_locator ? String(ev.citation_locator) : undefined,
      supportingExcerpt: ev.supporting_excerpt ? String(ev.supporting_excerpt) : undefined,
      contradictsClaim: Boolean(ev.contradicts_claim),
    });
    evidenceMap.set(String(ev.claim_id), list);
  });

  return claimsData.map((c: Record<string, unknown>) => {
    const entityType = c.subject_entity_id
      ? c.subject_entity_type
      : (c.subject_id ? "person" : (c.subject_entity_type || "person"));
    return {
      id: String(c.id),
      eventId: c.event_id ? String(c.event_id) : undefined,
      subjectEntityType: (entityType as "event" | "person" | "organisation") || "person",
      subjectEntityId: c.subject_entity_id ? String(c.subject_entity_id) : (c.subject_id ? String(c.subject_id) : undefined),
      claimType: String(c.claim_type),
      statement: String(c.statement),
      claimedTime: c.claimed_time ? String(c.claimed_time) : undefined,
      claimedVenue: c.claimed_venue ? String(c.claimed_venue) : undefined,
      sourceId: c.source_id ? String(c.source_id) : undefined,
      confidence: (c.confidence as ClaimRecord["confidence"]) || "limited",
      claimStatus: parseClaimStatus(c.claim_status ? String(c.claim_status) : undefined),
      epistemicClass: parseEpistemicClass(c.epistemic_class ? String(c.epistemic_class) : undefined),
      legalStatus: c.legal_status ? String(c.legal_status) : undefined,
      isAttributedOnly: Boolean(c.is_attributed_only),
      attributionSpeakerId: c.attribution_speaker_id ? String(c.attribution_speaker_id) : undefined,
      supportingExcerpt: c.supporting_excerpt ? String(c.supporting_excerpt) : undefined,
      evidence: evidenceMap.get(String(c.id)) || [],
    };
  });
}
