import { getRelationalStore } from "@/lib/db/client";
import { recordAuditEvent } from "@/lib/ingestion/audit";
import { resolveEntity } from "@/lib/ingestion/resolve";

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

  // Ensure one-time pending-to-terminal transition
  if (candidate.status !== "pending") {
    return {
      success: false,
      error: `Candidate is already ${candidate.status} and cannot be approved again`,
    };
  }

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

  // Persist reviewed claims and source attribution during approval
  const sourceId = data.sourceId || "src-editorial-approval";
  if (Array.isArray(data.claims)) {
    data.claims.forEach(
      (
        clm: {
          subjectMention?: string;
          claimType?: string;
          statement?: string;
          claimedTime?: string;
          claimedVenue?: string;
          supportingExcerpt?: string;
        },
        idx: number
      ) => {
        const resolvedSubject = clm.subjectMention ? resolveEntity(clm.subjectMention) : null;
        store.claims.push({
          id: `clm-${eventSlug}-appr-${Date.now()}-${idx}`,
          eventId: eventSlug,
          subjectId: resolvedSubject?.personId || null,
          claimType: clm.claimType || "presence",
          statement: clm.statement || `${candidate.suggestedTitle} verified by editorial review`,
          claimedTime: clm.claimedTime || candidate.suggestedDate,
          claimedVenue: clm.claimedVenue || candidate.suggestedPlace || null,
          sourceId,
          confidence: "confirmed",
          supportingExcerpt: clm.supportingExcerpt || data.summary || null,
        });
      }
    );
  }

  recordAuditEvent(
    "reviewed-approved",
    "REW-REV-MANUAL-SIGN-OFF",
    {
      candidateId,
      publishedEventId: eventSlug,
      approvedBy: editorName,
      sourceId,
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

  if (candidate.status !== "pending") {
    return {
      success: false,
      error: `Candidate is already ${candidate.status} and cannot be merged`,
    };
  }

  candidate.status = "merged";

  const data = JSON.parse(candidate.rawExtraction);
  const sourceId = data.sourceId || "src-editorial-corroboration";

  // Ensure source is registered in the sources catalog
  let existingSource = store.sources.find((s) => s.id === sourceId);
  if (!existingSource && sourceId !== "src-editorial-corroboration") {
    existingSource = {
      id: sourceId,
      title: data.sourceTitle || `Corroborating Source: ${candidate.suggestedTitle}`,
      publisher: data.publisher || "Archival Source",
      sourceType: data.sourceType || "official-transcript",
      tier: candidate.primarySourceTier === "tier-a" ? "tier-a" : "tier-b",
      url: data.url || null,
      archiveUrl: null,
      author: null,
      publicationDate: candidate.suggestedDate,
      trustScore: 0.95,
    };
    store.sources.push(existingSource);
  }

  // 1. Merge Claims with entity resolution and deduplication
  let claimsAddedCount = 0;
  if (Array.isArray(data.claims)) {
    data.claims.forEach(
      (
        clm: {
          subjectMention?: string;
          claimType?: string;
          statement?: string;
          claimedTime?: string;
          claimedVenue?: string;
          supportingExcerpt?: string;
        },
        idx: number
      ) => {
        const resolvedSubject = clm.subjectMention ? resolveEntity(clm.subjectMention) : null;
        const subjectId = resolvedSubject?.personId || null;
        const statement = clm.statement || "Corroborating claim";

        // Avoid exact duplicate claims on the target event
        const isDuplicateClaim = store.claims.some(
          (existing) =>
            existing.eventId === targetEventId &&
            existing.statement.toLowerCase().trim() === statement.toLowerCase().trim() &&
            existing.subjectId === subjectId
        );

        if (!isDuplicateClaim) {
          store.claims.push({
            id: `clm-${targetEventId}-mrg-${Date.now()}-${idx}`,
            eventId: targetEventId,
            subjectId,
            claimType: clm.claimType || "presence",
            statement,
            claimedTime: clm.claimedTime || null,
            claimedVenue: clm.claimedVenue || null,
            sourceId,
            confidence: "confirmed",
            supportingExcerpt: clm.supportingExcerpt || null,
          });
          claimsAddedCount++;
        }
      }
    );
  }

  // 2. Resolve participants for comprehensive audit attribution
  const mergedParticipants: string[] = [];
  if (Array.isArray(data.participants)) {
    data.participants.forEach((p: { name: string; role?: string }) => {
      const res = resolveEntity(p.name);
      if (res.canonicalName) {
        mergedParticipants.push(res.canonicalName);
      }
    });
  }

  recordAuditEvent(
    "reviewed-merged",
    "REW-REV-MANUAL-MERGE",
    {
      candidateId,
      targetEventId,
      mergedBy: editorName,
      sourceId,
      claimsAddedCount,
      mergedParticipants,
      similarityScore: candidate.duplicateSimilarity,
    },
    targetEventId,
    candidateId
  );

  return { success: true, targetEventId, claimsAddedCount };
}

export function rejectCandidate(candidateId: string, reason: string, editorName = "Senior Historical Editor") {
  const store = getRelationalStore();
  const candidate = store.candidateEvents.find((c) => c.id === candidateId);
  if (!candidate) return { success: false, error: "Candidate not found" };

  if (candidate.status !== "pending") {
    return {
      success: false,
      error: `Candidate is already ${candidate.status} and cannot be rejected again`,
    };
  }

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
