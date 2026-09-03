import { getRelationalStore } from "@/lib/db/client";
import { recordAuditEvent } from "@/lib/ingestion/audit";

export interface EvidenceStats {
  publishedEventsCount: number;
  verifiedClaimsCount: number;
  primarySourcesCount: number;
  pendingReviewCount: number;
  autoPublishedCount: number;
}

export function getEvidentiaryStats(): EvidenceStats {
  const store = getRelationalStore();
  const published = store.events.filter((e) => e.publicationStatus === "published");
  const autoPublished = store.events.filter((e) => e.publicationLane === "auto-publish");
  const primarySources = store.sources.filter((s) => s.tier === "tier-a" || s.tier === "tier-b");
  const pending = store.candidateEvents.filter((c) => c.status === "pending");

  return {
    publishedEventsCount: published.length,
    verifiedClaimsCount: store.claims.length,
    primarySourcesCount: primarySources.length,
    pendingReviewCount: pending.length,
    autoPublishedCount: autoPublished.length,
  };
}

export function getCandidateQueue() {
  const store = getRelationalStore();
  return store.candidateEvents;
}

export function approveCandidate(candidateId: string, editorName = "Senior Historical Editor") {
  const store = getRelationalStore();
  const candidate = store.candidateEvents.find((c) => c.id === candidateId);
  if (!candidate) return { success: false, error: "Candidate not found" };

  candidate.status = "approved";

  // Parse candidate extraction
  const data = JSON.parse(candidate.rawExtraction);
  const eventSlug = `evt-${candidate.suggestedDate.slice(0, 10)}-cand-${Date.now().toString(36).slice(-4)}`;

  // Find or create place
  const placeId = `plc-${candidate.suggestedPlace ? candidate.suggestedPlace.toLowerCase().replace(/[^\w]/g, "-").slice(0, 24) : "unspecified"}`;

  store.events.unshift({
    id: eventSlug,
    slug: eventSlug,
    parentId: null,
    eventType: data.eventType || "historical-action",
    title: candidate.suggestedTitle,
    summary: data.summary || candidate.suggestedTitle,
    description: data.description || null,
    startDate: candidate.suggestedDate,
    endDate: data.endDate || null,
    temporalPrecision: data.temporalPrecision || "exact-day",
    placeId,
    verificationStatus: "verified",
    confidenceScore: 0.98,
    publicationStatus: "published",
    publicationLane: "human-review",
    significanceScore: 80,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  recordAuditEvent(
    "reviewed-approved",
    "REW-REV-MANUAL-SIGN-OFF",
    {
      candidateId,
      publishedEventId: eventSlug,
      approvedBy: editorName,
    },
    eventSlug,
    candidateId
  );

  return { success: true, eventId: eventSlug };
}

export function mergeCandidate(candidateId: string, targetEventId: string, editorName = "Senior Historical Editor") {
  const store = getRelationalStore();
  const candidate = store.candidateEvents.find((c) => c.id === candidateId);
  const targetEvent = store.events.find((e) => e.id === targetEventId);

  if (!candidate || !targetEvent) return { success: false, error: "Candidate or target event not found" };

  candidate.status = "merged";

  const data = JSON.parse(candidate.rawExtraction);
  if (Array.isArray(data.claims)) {
    data.claims.forEach((clm: { claimType?: string; statement?: string; claimedTime?: string; claimedVenue?: string; supportingExcerpt?: string }, idx: number) => {
      store.claims.push({
        id: `clm-${targetEventId}-mrg-${Date.now()}-${idx}`,
        eventId: targetEventId,
        subjectId: null,
        claimType: clm.claimType || "presence",
        statement: clm.statement || "Corroborating claim",
        claimedTime: clm.claimedTime || null,
        claimedVenue: clm.claimedVenue || null,
        sourceId: null,
        confidence: "confirmed",
        supportingExcerpt: clm.supportingExcerpt || null,
      });
    });
  }

  recordAuditEvent(
    "reviewed-merged",
    "REW-REV-MANUAL-MERGE",
    {
      candidateId,
      targetEventId,
      mergedBy: editorName,
    },
    targetEventId,
    candidateId
  );

  return { success: true, targetEventId };
}

export function rejectCandidate(candidateId: string, reason: string, editorName = "Senior Historical Editor") {
  const store = getRelationalStore();
  const candidate = store.candidateEvents.find((c) => c.id === candidateId);
  if (!candidate) return { success: false, error: "Candidate not found" };

  candidate.status = "rejected";
  candidate.rejectionReason = reason;

  recordAuditEvent(
    "reviewed-rejected",
    "REW-REV-MANUAL-REJECT",
    {
      candidateId,
      reason,
      rejectedBy: editorName,
    },
    undefined,
    candidateId
  );

  return { success: true };
}
