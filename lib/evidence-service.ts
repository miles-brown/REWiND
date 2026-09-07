import { getRelationalStore, getDb } from "@/lib/db/client";
import * as schema from "@/db/schema";
import { eq, desc, count } from "drizzle-orm";
import { recordAuditEvent } from "@/lib/ingestion/audit";
import { resolveEntity } from "@/lib/ingestion/resolve";

export interface EvidenceStats {
  publishedEventsCount: number;
  verifiedClaimsCount: number;
  primarySourcesCount: number;
  pendingReviewCount: number;
  autoPublishedCount: number;
}

export async function getEvidentiaryStats(): Promise<EvidenceStats> {
  const db = getDb();
  if (db) {
    try {
      const [published] = await db.select({ val: count() }).from(schema.events).where(eq(schema.events.publicationStatus, "published"));
      const [autoPublished] = await db.select({ val: count() }).from(schema.events).where(eq(schema.events.publicationLane, "auto-publish"));
      const [claims] = await db.select({ val: count() }).from(schema.claims);
      const [sources] = await db.select({ val: count() }).from(schema.sources);
      const [pending] = await db.select({ val: count() }).from(schema.candidateEvents).where(eq(schema.candidateEvents.status, "pending"));

      return {
        publishedEventsCount: Number(published?.val ?? 0),
        verifiedClaimsCount: Number(claims?.val ?? 0),
        primarySourcesCount: Number(sources?.val ?? 0),
        pendingReviewCount: Number(pending?.val ?? 0),
        autoPublishedCount: Number(autoPublished?.val ?? 0),
      };
    } catch (err) {
      console.warn("Failed to query live evidentiary stats, falling back to store:", err);
    }
  }

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

export async function getCandidateQueue() {
  const db = getDb();
  const store = getRelationalStore();

  if (db) {
    try {
      const rows = await db
        .select()
        .from(schema.candidateEvents)
        .orderBy(desc(schema.candidateEvents.createdAt));
      if (rows && rows.length > 0) {
        return rows;
      }
    } catch (err) {
      console.warn("Failed to query live candidate queue, falling back to store:", err);
    }
  }

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
    seriesId: null,
    venueId: null,
    addressId: null,
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

  const db = getDb();
  if (db) {
    db.update(schema.candidateEvents)
      .set({ status: "approved" })
      .where(eq(schema.candidateEvents.id, candidateId))
      .catch((e) => console.warn("Live DB error on candidate approval:", e));

    db.insert(schema.events)
      .values({
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
        seriesId: null,
        venueId: null,
        addressId: null,
        verificationStatus: "verified",
        confidenceScore: 0.98,
        publicationStatus: "published",
        publicationLane: "human-review",
        significanceScore: 80,
      })
      .catch((e) => console.warn("Live DB error on event insertion:", e));

    db.insert(schema.reviewDecisions)
      .values({
        candidateId,
        decision: "approved",
        decidedBy: editorName,
        notes: "Editorial review sign-off",
      })
      .catch((e) => console.warn("Live DB error on review decision insertion:", e));
  }

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
          const claimObj = {
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
          };
          store.claims.push(claimObj);
          claimsAddedCount++;

          const db = getDb();
          if (db) {
            db.insert(schema.claims)
              .values(claimObj)
              .catch((e) => console.warn("Live DB error on merged claim insert:", e));
          }
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

  const db = getDb();
  if (db) {
    db.update(schema.candidateEvents)
      .set({ status: "merged" })
      .where(eq(schema.candidateEvents.id, candidateId))
      .catch((e) => console.warn("Live DB error on candidate merge:", e));

    db.insert(schema.reviewDecisions)
      .values({
        candidateId,
        decision: "merged",
        decidedBy: editorName,
        notes: `Merged into ${targetEventId}`,
      })
      .catch((e) => console.warn("Live DB error on merge review decision:", e));
  }

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

  const db = getDb();
  if (db) {
    db.update(schema.candidateEvents)
      .set({ status: "rejected", rejectionReason: reason })
      .where(eq(schema.candidateEvents.id, candidateId))
      .catch((e) => console.warn("Live DB error on candidate reject:", e));

    db.insert(schema.reviewDecisions)
      .values({
        candidateId,
        decision: "rejected",
        decidedBy: editorName,
        notes: reason,
      })
      .catch((e) => console.warn("Live DB error on reject review decision:", e));
  }

  return { success: true };
}
