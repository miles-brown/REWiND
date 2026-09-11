import { getRelationalStore, getDb } from "@/lib/db/client";
import * as schema from "@/db/schema";
import { eq, and, or } from "drizzle-orm";
import {
  ExtractedCandidateEventSchema,
  type ExtractedCandidateEvent,
  type RawEvidenceItem,
  type IngestionResult,
} from "./types";
import {
  resolveEntity,
  resolveEntityAsync,
  resolvePlace,
  createParticipantStubId,
  resolvePersonEntityInTransaction,
} from "./resolve";
import { calculateEventFingerprint, findDuplicateEvent } from "./deduplicate";
import { evaluatePublicationPolicy } from "./policy-evaluator";
import { recordAuditEvent } from "./audit";

export function processCandidateEvent(
  rawCandidate: ExtractedCandidateEvent,
  source: RawEvidenceItem
): Promise<IngestionResult> & IngestionResult {
  // Validate candidate schema strictly (calendar dates, range validation, field lengths)
  const candidate = ExtractedCandidateEventSchema.parse(rawCandidate);
  const store = getRelationalStore();
  const db = getDb();

  // 1. Resolve Entities Synchronously from Store (for sync return and test fallback)
  const entityResolutions = candidate.participants.map((p) => resolveEntity(p.name));
  const resolvedParticipantIds = entityResolutions
    .map((e) => e.personId)
    .filter((id): id is string => id !== null);

  // 2. Resolve Place
  const placeResolution = resolvePlace(
    candidate.venue,
    candidate.city,
    candidate.country,
    candidate.latitude,
    candidate.longitude
  );

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
  let auditPromise: Promise<unknown> | undefined;

  // 6. Ensure Source is Registered in Memory Store
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
      // Do not copy the event date; source publication date is unknown unless explicitly supplied.
      publicationDate: null,
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

      auditPromise = recordAuditEvent(
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
          latitude: placeResolution.latitude ?? (candidate.latitude !== undefined ? candidate.latitude : null),
          longitude: placeResolution.longitude ?? (candidate.longitude !== undefined ? candidate.longitude : null),
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

      auditPromise = recordAuditEvent(
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
      const syncResult: IngestionResult = {
        candidateId: existingPending.id,
        fingerprint,
        lane: policy.lane,
        publishedEventId: undefined,
        deduplication,
        policy,
        auditId: auditEntry ? auditEntry.id : 0,
      };
      return Object.assign(Promise.resolve(syncResult), syncResult);
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

    auditPromise = recordAuditEvent(
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
  const syncResult: IngestionResult = {
    candidateId,
    fingerprint,
    lane: policy.lane,
    publishedEventId,
    deduplication,
    policy,
    auditId: auditEntry ? auditEntry.id : 0,
  };

  const asyncPromise = (async () => {
    if (auditPromise) {
      await auditPromise;
    }

    if (!db) {
      return syncResult;
    }

    // In live DB execution: resolve entities against PostgreSQL to prevent false REW-POL-UNRESOLVED-ENTITY
    const liveEntityResolutions = await Promise.all(
      candidate.participants.map((p) => resolveEntityAsync(p.name, db))
    );
    const liveResolvedParticipantIds = liveEntityResolutions
      .map((e) => e.personId)
      .filter((id): id is string => id !== null);

    const livePolicy = evaluatePublicationPolicy(candidate, source.sourceTier, liveEntityResolutions);

    syncResult.lane = livePolicy.lane;
    syncResult.policy = livePolicy;

    await db.transaction(async (tx) => {
      // 1. Ensure Source exists in DB
      const [existingSrc] = await tx
        .select({ id: schema.sources.id })
        .from(schema.sources)
        .where(eq(schema.sources.id, source.sourceId));
      if (!existingSrc) {
        await tx.insert(schema.sources).values({
          id: source.sourceId,
          title: source.sourceTitle,
          publisher: source.publisher,
          sourceType: source.sourceType,
          tier: source.sourceTier,
          url: source.url || null,
          archiveUrl: null,
          author: null,
          // Do not copy the event date; source publication date is unknown unless explicitly supplied.
          publicationDate: null,
          trustScore: source.sourceTier === "tier-a" ? 1.0 : source.sourceTier === "tier-b" ? 0.9 : 0.8,
        });
      }

      if (livePolicy.lane === "auto-publish" || livePolicy.lane === "provisional") {
        if (deduplication.isDuplicate && deduplication.matchedEventId) {
          const targetEventId = deduplication.matchedEventId;
          const [existingLink] = await tx
            .select({ eventId: schema.eventSources.eventId })
            .from(schema.eventSources)
            .where(
              and(
                eq(schema.eventSources.eventId, targetEventId),
                eq(schema.eventSources.sourceId, source.sourceId)
              )
            );
          if (!existingLink) {
            await tx.insert(schema.eventSources).values({
              eventId: targetEventId,
              sourceId: source.sourceId,
              isPrimary: false,
            });
          }

          const existingClaims = await tx
            .select({
              subjectId: schema.claims.subjectId,
              statement: schema.claims.statement,
            })
            .from(schema.claims)
            .where(eq(schema.claims.eventId, targetEventId));

          const claimsToInsert = candidate.claims.filter((clm) => {
            const matchingSubject = liveEntityResolutions.find(
              (e) => e.canonicalName?.toLowerCase() === clm.subjectMention.toLowerCase()
            );
            const subId = matchingSubject?.personId || null;
            return !existingClaims.some(
              (ec) =>
                ec.statement.trim().toLowerCase() === clm.statement.trim().toLowerCase() &&
                ec.subjectId === subId
            );
          });

          if (claimsToInsert.length > 0) {
            await tx.insert(schema.claims).values(
              claimsToInsert.map((clm, idx) => {
                const matchingSubject = liveEntityResolutions.find(
                  (e) => e.canonicalName?.toLowerCase() === clm.subjectMention.toLowerCase()
                );
                return {
                  id: `clm-${targetEventId}-${Date.now()}-${idx}`,
                  eventId: targetEventId,
                  subjectId: matchingSubject?.personId || null,
                  claimType: clm.claimType,
                  statement: clm.statement,
                  claimedTime: clm.claimedTime || null,
                  claimedVenue: clm.claimedVenue || null,
                  sourceId: source.sourceId,
                  confidence: livePolicy.lane === "auto-publish" ? "confirmed" : "reported",
                  supportingExcerpt: clm.supportingExcerpt || null,
                };
              })
            );
          }
        } else {
          const eventSlug = `evt-${candidate.startDate.slice(0, 10)}-${liveResolvedParticipantIds.join("-")}-${candidate.city.toLowerCase().replace(/\s+/g, "-")}`;
          const targetSlug = placeResolution.placeId.replace(/^plc-/, "");

          const [existingDbPlace] = await tx
            .select({ id: schema.places.id })
            .from(schema.places)
            .where(or(eq(schema.places.id, placeResolution.placeId), eq(schema.places.slug, targetSlug)));

          if (!existingDbPlace) {
            await tx.insert(schema.places).values({
              id: placeResolution.placeId,
              slug: targetSlug,
              venue: placeResolution.venue,
              city: placeResolution.city,
              country: placeResolution.country,
              latitude: placeResolution.latitude ?? (candidate.latitude !== undefined ? candidate.latitude : null),
              longitude: placeResolution.longitude ?? (candidate.longitude !== undefined ? candidate.longitude : null),
              placeType: "venue",
            });
          }

          const [existingDbEvent] = await tx
            .select({ id: schema.events.id })
            .from(schema.events)
            .where(eq(schema.events.id, eventSlug));

          if (!existingDbEvent) {
            await tx.insert(schema.events).values({
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
              verificationStatus: livePolicy.lane === "auto-publish" ? "verified" : "provisional",
              confidenceScore: livePolicy.lane === "auto-publish" ? 0.98 : 0.85,
              publicationStatus: "published",
              publicationLane: livePolicy.lane,
              significanceScore: 85,
            });

            syncResult.publishedEventId = eventSlug;
          } else {
            syncResult.publishedEventId = eventSlug;
          }

          // Link source to event
          const [existingLink] = await tx
            .select({ eventId: schema.eventSources.eventId })
            .from(schema.eventSources)
            .where(
              and(
                eq(schema.eventSources.eventId, eventSlug),
                eq(schema.eventSources.sourceId, source.sourceId)
              )
            );
          if (!existingLink) {
            await tx.insert(schema.eventSources).values({
              eventId: eventSlug,
              sourceId: source.sourceId,
              isPrimary: !existingDbEvent,
            });
          }

          for (let i = 0; i < candidate.participants.length; i++) {
            const p = candidate.participants[i];
            const res = liveEntityResolutions[i];
            const stubId = createParticipantStubId(p.name, res?.personId);
            const personId = await resolvePersonEntityInTransaction(tx, {
              personId: stubId,
              rawName: p.name,
              roleLabel: p.role,
            });

            const [existingEp] = await tx
              .select({ id: schema.eventPeople.id })
              .from(schema.eventPeople)
              .where(
                and(
                  eq(schema.eventPeople.eventId, eventSlug),
                  eq(schema.eventPeople.personId, personId)
                )
              );

            if (!existingEp) {
              await tx.insert(schema.eventPeople).values({
                id: `ep-${eventSlug}-${i}-${Date.now().toString(36).slice(-4)}`,
                eventId: eventSlug,
                personId,
                involvementType: "attendee",
                roleLabel: p.role || "participant",
                presenceConfidence: "confirmed",
                roleConfidence: "confirmed",
                attendanceMode: p.presenceMode || "physical",
              });
            }
          }

          const existingClaims = await tx
            .select({
              subjectId: schema.claims.subjectId,
              statement: schema.claims.statement,
            })
            .from(schema.claims)
            .where(eq(schema.claims.eventId, eventSlug));

          const claimsToInsert = candidate.claims.filter((clm) => {
            const matchingSubject = liveEntityResolutions.find(
              (e) => e.canonicalName?.toLowerCase() === clm.subjectMention.toLowerCase()
            );
            const subId = matchingSubject?.personId || null;
            return !existingClaims.some(
              (ec) =>
                ec.statement.trim().toLowerCase() === clm.statement.trim().toLowerCase() &&
                ec.subjectId === subId
            );
          });

          if (claimsToInsert.length > 0) {
            await tx.insert(schema.claims).values(
              claimsToInsert.map((clm) => {
                const matchingSubject = liveEntityResolutions.find(
                  (e) => e.canonicalName?.toLowerCase() === clm.subjectMention.toLowerCase()
                );
                // Derive a stable claim ID from the claim's content so re-ingestion cannot
                // generate a duplicate PK (Codex P2: claim ID must survive re-ingestion).
                // Use a simple djb2-style hash of the normalised statement + subject.
                const contentKey = `${clm.subjectMention ?? ""}::${clm.statement}`.toLowerCase().trim();
                const hash = Array.from(contentKey).reduce((h, c) => ((h * 31 + c.charCodeAt(0)) >>> 0), 0);
                const stableId = `clm-${eventSlug}-${hash.toString(36)}`;
                return {
                  id: stableId,
                  eventId: eventSlug,
                  subjectId: matchingSubject?.personId || null,
                  claimType: clm.claimType,
                  statement: clm.statement,
                  claimedTime: clm.claimedTime || null,
                  claimedVenue: clm.claimedVenue || null,
                  sourceId: source.sourceId,
                  confidence: livePolicy.lane === "auto-publish" ? "confirmed" : "reported",
                  supportingExcerpt: clm.supportingExcerpt || null,
                };
              })
            );
          }
        }
      } else {
        const rawPayload = JSON.stringify({ ...candidate, sourceId: source.sourceId });
        const [existingCand] = await tx
          .select({ id: schema.candidateEvents.id })
          .from(schema.candidateEvents)
          .where(
            and(
              eq(schema.candidateEvents.fingerprint, fingerprint),
              eq(schema.candidateEvents.status, "pending")
            )
          );

        if (!existingCand) {
          await tx.insert(schema.candidateEvents).values({
            id: candidateId,
            fingerprint,
            rawExtraction: rawPayload,
            suggestedTitle: candidate.title,
            suggestedDate: candidate.startDate,
            suggestedPlace: `${candidate.venue}, ${candidate.city}, ${candidate.country}`,
            suggestedParticipants: JSON.stringify(candidate.participants),
            primarySourceTier: source.sourceTier,
            assignedLane: livePolicy.lane,
            duplicateMatchId: deduplication.matchedEventId || null,
            duplicateSimilarity: deduplication.similarity,
            status: "pending",
            rejectionReason: null,
          });
        }
      }
    });

    return syncResult;
  })();

  asyncPromise.catch(() => {});

  return Object.assign(asyncPromise, syncResult);
}
