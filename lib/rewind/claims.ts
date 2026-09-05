import { createClient } from "@/lib/supabase/server";
import type { ClaimRecord, ClaimEvidenceRecord, ClaimStatus, EpistemicClass } from "./types";

/**
 * Retrieves all factual claims associated with a specific event, including their evidential attachments.
 */
export async function getClaimsByEvent(eventId: string): Promise<ClaimRecord[]> {
  try {
    const supabase = await createClient();
    if (!supabase) return [];

    const { data: claimsData, error: claimsError } = await supabase
      .from("claims")
      .select("*")
      .eq("event_id", eventId);

    if (claimsError || !claimsData || claimsData.length === 0) {
      return [];
    }

    const claimIds = claimsData.map((c) => c.id);
    const { data: evidenceData } = await supabase
      .from("claim_evidence")
      .select("*, sources(id, title, publisher, url)")
      .in("claim_id", claimIds);

    const evidenceMap = new Map<string, ClaimEvidenceRecord[]>();
    (evidenceData || []).forEach((ev) => {
      const list = evidenceMap.get(ev.claim_id) || [];
      const src = Array.isArray(ev.sources) ? ev.sources[0] : ev.sources;
      list.push({
        id: ev.id,
        claimId: ev.claim_id,
        sourceId: ev.source_id,
        sourceTitle: src?.title,
        sourcePublisher: src?.publisher,
        sourceUrl: src?.url,
        evidenceForm: ev.evidence_form,
        evidenceStrength: ev.evidence_strength,
        directness: (ev.directness as "direct" | "inferential") || "direct",
        citationLocator: ev.citation_locator || undefined,
        supportingExcerpt: ev.supporting_excerpt || undefined,
        contradictsClaim: Boolean(ev.contradicts_claim),
      });
      evidenceMap.set(ev.claim_id, list);
    });

    return claimsData.map((c) => ({
      id: c.id,
      eventId: c.event_id,
      subjectEntityType: c.subject_entity_type || "event",
      subjectEntityId: c.subject_entity_id || undefined,
      claimType: c.claim_type,
      statement: c.statement,
      claimedTime: c.claimed_time || undefined,
      claimedVenue: c.claimed_venue || undefined,
      sourceId: c.source_id || undefined,
      confidence: c.confidence,
      claimStatus: (c.claim_status as ClaimStatus) || "ESTABLISHED",
      epistemicClass: (c.epistemic_class as EpistemicClass) || "documented fact",
      legalStatus: c.legal_status || undefined,
      isAttributedOnly: Boolean(c.is_attributed_only),
      attributionSpeakerId: c.attribution_speaker_id || undefined,
      supportingExcerpt: c.supporting_excerpt || undefined,
      evidence: evidenceMap.get(c.id) || [],
    }));
  } catch {
    return [];
  }
}

/**
 * Retrieves biographical or event claims concerning a specific person.
 */
export async function getClaimsByPerson(personId: string): Promise<ClaimRecord[]> {
  try {
    const supabase = await createClient();
    if (!supabase) return [];

    const { data: claimsData, error } = await supabase
      .from("claims")
      .select("*")
      .or(`subject_id.eq.${personId},subject_entity_id.eq.${personId}`);

    if (error || !claimsData) return [];

    return claimsData.map((c) => ({
      id: c.id,
      eventId: c.event_id || undefined,
      subjectEntityType: c.subject_entity_type || "person",
      subjectEntityId: c.subject_entity_id || c.subject_id,
      claimType: c.claim_type,
      statement: c.statement,
      claimedTime: c.claimed_time || undefined,
      claimedVenue: c.claimed_venue || undefined,
      sourceId: c.source_id || undefined,
      confidence: c.confidence,
      claimStatus: (c.claim_status as ClaimStatus) || "ESTABLISHED",
      epistemicClass: (c.epistemic_class as EpistemicClass) || "documented fact",
      legalStatus: c.legal_status || undefined,
      isAttributedOnly: Boolean(c.is_attributed_only),
      attributionSpeakerId: c.attribution_speaker_id || undefined,
      supportingExcerpt: c.supporting_excerpt || undefined,
    }));
  } catch {
    return [];
  }
}
