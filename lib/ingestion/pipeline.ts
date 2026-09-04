import { getRelationalStore } from "@/lib/db/client";
import {
  ExtractedCandidateEventSchema,
  type ExtractedCandidateEvent,
  type RawEvidenceItem,
  type IngestionResult,
} from "./types";
import { resolveEntity, resolvePlace } from "./resolve";
import { calculateEventFingerprint, findDuplicateEvent } from "./deduplicate";
import { evaluatePublicationPolicy } from "./policy-evaluator";
import { recordAuditEvent } from "./audit";

export function processCandidateEvent(
  rawCandidate: ExtractedCandidateEvent,
  source: RawEvidenceItem
): IngestionResult {
  // Validate candidate schema strictly (calendar dates, range validation, field lengths)
  const candidate = ExtractedCandidateEventSchema.parse(rawCandidate);
  const store = getRelationalStore();

  // 1. Resolve Entities
  const entityResolutions = candidate.participants.map((p) => resolveEntity(p.name));
  const resolvedParticipantIds = entityResolutions
    .map((e) => e.personId)
    .filter((id): id is string => id !== null);

  // 2. Resolve Place
  const placeResolution = resolvePlace(candidate.venue, candidate.city, candidate.country);

  // 3. Check for Duplicate Events
  const deduplication = findDuplicateEvent(candidate);

  // 4. Evaluate Policy Lane
  const policy = evaluatePublicationPolicy(candidate, source.sourceTier, entityResolutions);

  // 5. Generate Candidate ID and Fingerprint
  const fingerprint = calculateEventFingerprint(
    resolvedParticipantIds,
    candidate.startDate,
    candidate.city,
    candidate.eventType
  );
  const candidateId = `cand-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

  let publishedEventId: string | undefined;

  // 6. Ensure Source is Registered
  let existingSource = store.sources.find((s) => s.id === source.sourceId);
  if (!existingSource) {
    existingSource = {
      id: source.sourceId,
      title: source.sourceTitle,
      publisher: source.publisher,
      sourceType: source.sourceType,
      tier: source.sourceTier,
      url: source.url || null,
      archiveUrl: null,
      author: null,
      publicationDate: candidate.startDate,
      trustScore: source.sourceTier === "tier-a" ? 1.0 : source.sourceTier === "tier-b" ? 0.9 : 0.8,
    };
    store.sources.push(existingSource);
  }

  // 7. Action Based on Policy Lane
  if (policy.lane === "auto-publish" || policy.lane === "provisional") {
    if (deduplication.isDuplicate && deduplication.matchedEventId) {
      // MERGE PATH: Attach additional evidence and claims to existing event
      publishedEventId = deduplication.matchedEventId;

      candidate.claims.forEach((clm, idx) => {
        const matchingSubject = entityResolutions.find(
          (e) => e.canonicalName?.toLowerCase() === clm.subjectMention.toLowerCase()
        );
        store.claims.push({
          id: `clm-${publishedEventId}-${Date.now()}-${idx}`,
          eventId: publishedEventId!,
          subjectId: matchingSubject?.personId || null,
          claimType: clm.claimType,
          statement: clm.statement,
          claimedTime: clm.claimedTime || null,
          claimedVenue: clm.claimedVenue || null,
          sourceId: source.sourceId,
          confidence: policy.lane === "auto-publish" ? "confirmed" : "reported",
          supportingExcerpt: clm.supportingExcerpt || null,
        });
      });

      recordAuditEvent(
        "merged",
        policy.ruleId,
        {
          matchedEventId: publishedEventId,
          sourceId: source.sourceId,
          similarity: deduplication.similarity,
          claimsAdded: candidate.claims.length,
        },
        publishedEventId,
        candidateId
      );
    } else {
      // NEW EVENT PATH: Create new verified/provisional record
      let existingPlace = store.places.find((p) => p.id === placeResolution.placeId);
      if (!existingPlace) {
        existingPlace = {
          id: placeResolution.placeId,
          slug: placeResolution.placeId.replace(/^plc-/, ""),
          venue: placeResolution.venue,
          city: placeResolution.city,
          country: placeResolution.country,
          latitude: placeResolution.latitude ?? null,
          longitude: placeResolution.longitude ?? null,
          placeType: "venue",
        };
        store.places.push(existingPlace);
      }

      const eventSlug = `evt-${candidate.startDate.slice(0, 10)}-${resolvedParticipantIds.join("-")}-${candidate.city.toLowerCase().replace(/\s+/g, "-")}`;
      publishedEventId = eventSlug;

      store.events.push({
        id: eventSlug,
        slug: eventSlug,
        parentId: null,
        eventType: candidate.eventType,
        title: candidate.title,
        summary: candidate.summary,
        description: candidate.description || null,
        startDate: candidate.startDate,
        endDate: candidate.endDate || null,
        temporalPrecision: candidate.temporalPrecision,
        placeId: placeResolution.placeId,
        seriesId: null,
        venueId: null,
        addressId: null,
        verificationStatus: policy.lane === "auto-publish" ? "verified" : "provisional",
        confidenceScore: policy.lane === "auto-publish" ? 0.98 : 0.85,
        publicationStatus: "published",
        publicationLane: policy.lane,
        significanceScore: 85,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Add claims
      candidate.claims.forEach((clm, idx) => {
        const matchingSubject = entityResolutions.find(
          (e) => e.canonicalName?.toLowerCase() === clm.subjectMention.toLowerCase()
        );
        store.claims.push({
          id: `clm-${eventSlug}-${idx}`,
          eventId: eventSlug,
          subjectId: matchingSubject?.personId || null,
          claimType: clm.claimType,
          statement: clm.statement,
          claimedTime: clm.claimedTime || null,
          claimedVenue: clm.claimedVenue || null,
          sourceId: source.sourceId,
          confidence: policy.lane === "auto-publish" ? "confirmed" : "reported",
          supportingExcerpt: clm.supportingExcerpt || null,
        });
      });

      recordAuditEvent(
        "auto-published",
        policy.ruleId,
        {
          eventId: eventSlug,
          sourceId: source.sourceId,
          sourceTier: source.sourceTier,
          lane: policy.lane,
        },
        eventSlug,
        candidateId
      );
    }
  } else {
    // HUMAN REVIEW QUEUE PATH: Idempotent insertion by fingerprint
    const existingPending = store.candidateEvents.find(
      (c) => c.fingerprint === fingerprint && c.status === "pending"
    );

    if (existingPending) {
      // Reuse existing pending candidate without duplicating queue
      const auditEntry = store.auditLog[0];
      return {
        candidateId: existingPending.id,
        fingerprint,
        lane: policy.lane,
        publishedEventId: undefined,
        deduplication,
        policy,
        auditId: auditEntry ? auditEntry.id : 0,
      };
    }

    // Embed sourceId with rawExtraction payload so approval preserves citation
    const rawPayload = JSON.stringify({ ...candidate, sourceId: source.sourceId });

    store.candidateEvents.unshift({
      id: candidateId,
      fingerprint,
      rawExtraction: rawPayload,
      suggestedTitle: candidate.title,
      suggestedDate: candidate.startDate,
      suggestedPlace: `${candidate.venue}, ${candidate.city}, ${candidate.country}`,
      suggestedParticipants: JSON.stringify(candidate.participants),
      primarySourceTier: source.sourceTier,
      assignedLane: policy.lane,
      duplicateMatchId: deduplication.matchedEventId || null,
      duplicateSimilarity: deduplication.similarity,
      status: "pending",
      rejectionReason: null,
      createdAt: new Date(),
    });

    recordAuditEvent(
      "queued-for-review",
      policy.ruleId,
      {
        candidateId,
        sourceId: source.sourceId,
        reason: policy.reason,
      },
      undefined,
      candidateId
    );
  }

  const auditEntry = store.auditLog[0];

  return {
    candidateId,
    fingerprint,
    lane: policy.lane,
    publishedEventId,
    deduplication,
    policy,
    auditId: auditEntry ? auditEntry.id : 0,
  };
}
