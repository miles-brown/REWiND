import { createHash } from "node:crypto";
import { getRelationalStore, getDb } from "@/lib/db/client";
import * as schema from "@/db/schema";
import { eq, and, or, sql } from "drizzle-orm";
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
  resolvePlaceAsync,
  createParticipantStubId,
  resolvePersonEntityInTransaction,
} from "./resolve";
import {
  calculateEventFingerprint,
  findDuplicateEvent,
  findDuplicateEventAsync,
  tokenSimilarity,
} from "./deduplicate";
import { evaluatePublicationPolicy } from "./policy-evaluator";
import {
  recordAuditEvent,
  recordAuditEventInTransaction,
  recordAuditEventStoreOnly,
} from "./audit";

/**
 * Generates a collision-resistant deterministic slug for an event.
 * Incorporates date, participant IDs, event type, city, and a title hash
 * so distinct same-day events for the same participants do not collide.
 */
function deriveEventSlug(
  startDate: string,
  participantIds: string[],
  eventType: string,
  city: string,
  title: string
): string {
  const normType = (eventType || "event").toLowerCase().replace(/[^\w]/g, "-");
  const titleHash = createHash("sha256")
    .update(`${title.trim().toLowerCase()}::${normType}`)
    .digest("hex")
    .slice(0, 6);
  const pIds = participantIds.length > 0 ? participantIds.join("-") : "general";
  const citySlug = (city || "unknown").toLowerCase().replace(/[^\w]/g, "-").slice(0, 20);
  return `evt-${startDate.slice(0, 10)}-${pIds}-${normType}-${citySlug}-${titleHash}`;
}

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

  const resolveParticipantOrMentionSync = (mention: string): string | null => {
    const norm = mention.toLowerCase().trim();
    for (let i = 0; i < candidate.participants.length; i++) {
      const p = candidate.participants[i];
      const res = entityResolutions[i];
      if (
        p.name.toLowerCase().trim() === norm ||
        (res?.canonicalName && res.canonicalName.toLowerCase().trim() === norm) ||
        (res?.personId && res.personId.toLowerCase().trim() === norm)
      ) {
        return res?.personId || null;
      }
    }
    return resolveEntity(mention)?.personId || null;
  };

  // 2. Resolve Place Synchronously
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
  let candidateId = `cand-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

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

  // 7. Action Based on Policy Lane (In-Memory Store only when db is absent)
  if (!db) {
    if (policy.lane === "auto-publish" || policy.lane === "provisional") {
      if (deduplication.isDuplicate && deduplication.matchedEventId) {
        // MERGE PATH: Attach additional evidence and claims to existing event
        publishedEventId = deduplication.matchedEventId;

        const existingClaims = store.claims.filter((c) => c.eventId === publishedEventId);
        const seenMemClaimKeys = new Set<string>();
        const claimsToInsert = candidate.claims.filter((clm) => {
          const normStatement = clm.statement.trim().toLowerCase();
          const subId = resolveParticipantOrMentionSync(clm.subjectMention);
          const key = `${subId ?? ""}::${normStatement}`;
          if (seenMemClaimKeys.has(key)) return false;
          seenMemClaimKeys.add(key);
          return !existingClaims.some(
            (ec) =>
              ec.statement.trim().toLowerCase() === normStatement &&
              ec.subjectId === subId
          );
        });

        claimsToInsert.forEach((clm, idx) => {
          const subId = resolveParticipantOrMentionSync(clm.subjectMention);
          store.claims.push({
            id: `clm-${publishedEventId}-${Date.now()}-${idx}`,
            eventId: publishedEventId!,
            subjectId: subId,
            subjectEntityType: subId ? "person" : "event",
            subjectEntityId: subId || publishedEventId!,
            claimType: clm.claimType,
            statement: clm.statement,
            claimedTime: clm.claimedTime || null,
            claimedVenue: clm.claimedVenue || null,
            sourceId: source.sourceId,
            confidence: policy.lane === "auto-publish" ? "confirmed" : "limited",
            claimStatus: policy.lane === "auto-publish" ? "ESTABLISHED" : "PROVISIONAL",
            epistemicClass: policy.lane === "auto-publish" ? "documented fact" : "attributed assertion",
            supportingExcerpt: clm.supportingExcerpt || null,
          });
        });

        // Merge participant identity into existing in-memory event if present
        const targetEvent = store.events.find((e) => e.id === publishedEventId);
        if (targetEvent) {
          if (!Array.isArray(targetEvent.participants)) {
            targetEvent.participants = [];
          }
          candidate.participants.forEach((p, idx) => {
            const pId = resolvedParticipantIds[idx] || resolveEntity(p.name).personId;
            if (!targetEvent.participants!.some((ep) => ep.personId === pId || (ep.name && ep.name.toLowerCase() === p.name.toLowerCase()))) {
              targetEvent.participants!.push({
                personId: pId,
                name: p.name,
                role: p.role,
                presenceMode: p.presenceMode || "physical",
              });
            }
          });
        }

        auditPromise = recordAuditEvent(
          "merged",
          policy.ruleId,
          {
            matchedEventId: publishedEventId,
            sourceId: source.sourceId,
            similarity: deduplication.similarity,
            claimsAdded: claimsToInsert.length,
          },
          publishedEventId,
          candidateId
        );
        auditPromise.catch(() => {});
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

        const baseSlug = deriveEventSlug(
          candidate.startDate,
          resolvedParticipantIds,
          candidate.eventType,
          candidate.city,
          candidate.title
        );
        let eventSlug = baseSlug;
        let collisionIdx = 2;
        while (store.events.some((event) => event.id === eventSlug)) {
          eventSlug = `${baseSlug}-${collisionIdx++}`;
        }
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
          confidenceScore: policy.lane === "auto-publish" ? 0.98 : 0.5,
          publicationStatus: "published",
          publicationLane: policy.lane,
          significanceScore: 85,
          participants: candidate.participants.map((p, idx) => ({
            personId: resolvedParticipantIds[idx] || resolveEntity(p.name).personId,
            name: p.name,
            role: p.role,
            presenceMode: p.presenceMode || "physical",
          })),
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        // Add claims
        candidate.claims.forEach((clm, idx) => {
          const subId = resolveParticipantOrMentionSync(clm.subjectMention);
          store.claims.push({
            id: `clm-${eventSlug}-${idx}`,
            eventId: eventSlug,
            subjectId: subId,
            subjectEntityType: subId ? "person" : "event",
            subjectEntityId: subId || eventSlug,
            claimType: clm.claimType,
            statement: clm.statement,
            claimedTime: clm.claimedTime || null,
            claimedVenue: clm.claimedVenue || null,
            sourceId: source.sourceId,
            confidence: policy.lane === "auto-publish" ? "confirmed" : "limited",
            claimStatus: policy.lane === "auto-publish" ? "ESTABLISHED" : "PROVISIONAL",
            epistemicClass: policy.lane === "auto-publish" ? "documented fact" : "attributed assertion",
            supportingExcerpt: clm.supportingExcerpt || null,
          });
        });

        // Add quotes
        if (candidate.quotes && candidate.quotes.length > 0) {
          candidate.quotes.forEach((q, idx) => {
            const spkId = resolveParticipantOrMentionSync(q.speaker);
            store.quotes.push({
              id: `quo-${eventSlug}-${idx}`,
              eventId: eventSlug,
              speakerId: spkId || createParticipantStubId(q.speaker),
              quote: q.quote,
              context: q.context || null,
              language: "en",
              sourceId: source.sourceId,
              timestampInMedia: null,
            });
          });
        }

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
        auditPromise.catch(() => {});
      }
    } else {
      const existingPending = store.candidateEvents.find(
        (c) => c.fingerprint === fingerprint && c.status === "pending"
      );

      if (existingPending) {
        candidateId = existingPending.id;
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
      } else {
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
        auditPromise.catch(() => {});
      }
    }
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

    // In live DB execution: resolve entities against PostgreSQL
    const liveEntityResolutions = await Promise.all(
      candidate.participants.map((p) => resolveEntityAsync(p.name, db))
    );
    const liveResolvedParticipantIds = liveEntityResolutions
      .map((e) => e.personId)
      .filter((id): id is string => id !== null);

    // Resolve place live against database gazetteer
    const livePlaceResolution = await resolvePlaceAsync(
      candidate.venue,
      candidate.city,
      candidate.country,
      candidate.latitude,
      candidate.longitude,
      db
    );

    // Deduplicate against live PostgreSQL database events
    const liveDeduplication = await findDuplicateEventAsync(candidate, db);
    syncResult.deduplication = liveDeduplication;

    const livePolicy = evaluatePublicationPolicy(candidate, source.sourceTier, liveEntityResolutions);
    const liveFingerprint = calculateEventFingerprint(
      liveResolvedParticipantIds,
      candidate.startDate,
      candidate.city,
      candidate.eventType
    );

    syncResult.lane = livePolicy.lane;
    syncResult.policy = livePolicy;
    syncResult.fingerprint = liveFingerprint;

    const resolveParticipantOrMentionLive = async (mention: string): Promise<string | null> => {
      const norm = mention.toLowerCase().trim();
      for (let i = 0; i < candidate.participants.length; i++) {
        const p = candidate.participants[i];
        const res = liveEntityResolutions[i];
        if (
          p.name.toLowerCase().trim() === norm ||
          (res?.canonicalName && res.canonicalName.toLowerCase().trim() === norm) ||
          (res?.personId && res.personId.toLowerCase().trim() === norm)
        ) {
          return res?.personId || null;
        }
      }
      const direct = await resolveEntityAsync(mention, db);
      return direct?.personId || null;
    };

    let livePersistedClaimsAdded = candidate.claims.length;

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
          publicationDate: null,
          trustScore: source.sourceTier === "tier-a" ? 1.0 : source.sourceTier === "tier-b" ? 0.9 : 0.8,
        });
      }

      // 2. Hash and preserve fetched source payload in schema.sourceFetches only when fetch evidence exists (SOURCE_POLICY.md)
      if (source.rawText) {
        const rawText = source.rawText;
        const sha256 = createHash("sha256").update(rawText).digest("hex");
        const [existingFetch] = await tx
          .select({ id: schema.sourceFetches.id })
          .from(schema.sourceFetches)
          .where(
            and(
              eq(schema.sourceFetches.sourceId, source.sourceId),
              eq(schema.sourceFetches.sha256, sha256)
            )
          );
        if (!existingFetch) {
          await tx.insert(schema.sourceFetches).values({
            sourceId: source.sourceId,
            url: source.url || `urn:source:${source.sourceId}`,
            sha256,
            httpStatus: 200,
            rawContent: rawText,
            contentType: "text/plain",
            fetchedAt: source.fetchedAt ? new Date(source.fetchedAt) : new Date(),
          });
        }
      }

      if (livePolicy.lane === "auto-publish" || livePolicy.lane === "provisional") {
        const isLiveDuplicate = liveDeduplication.isDuplicate && Boolean(liveDeduplication.matchedEventId);
        if (isLiveDuplicate) {
          const targetEventId = liveDeduplication.matchedEventId!;

          // Serialize concurrent duplicate-merge transactions on target event
          await tx.execute(
            sql`SELECT pg_advisory_xact_lock(hashtext(${targetEventId}))`
          );

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

          // Upsert participants into eventPeople
          const participantConfidence =
            livePolicy.lane === "provisional" || source.sourceTier === "tier-c"
              ? "limited"
              : "confirmed";

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
                  eq(schema.eventPeople.eventId, targetEventId),
                  eq(schema.eventPeople.personId, personId)
                )
              );

            if (!existingEp) {
              await tx.insert(schema.eventPeople).values({
                id: `ep-${targetEventId}-${i}-${Date.now().toString(36).slice(-4)}`,
                eventId: targetEventId,
                personId,
                involvementType: "attendee",
                roleLabel: p.role || "participant",
                presenceConfidence: participantConfidence,
                roleConfidence: participantConfidence,
                attendanceMode: p.presenceMode || "physical",
              });
            }
          }

          const existingClaims = await tx
            .select({
              id: schema.claims.id,
              subjectId: schema.claims.subjectId,
              statement: schema.claims.statement,
            })
            .from(schema.claims)
            .where(eq(schema.claims.eventId, targetEventId));

          const resolvedMergeClaims = await Promise.all(
            candidate.claims.map(async (clm) => ({
              clm,
              subjectId: await resolveParticipantOrMentionLive(clm.subjectMention),
            }))
          );

          const seenMergeClaimKeys = new Set<string>();
          const newClaimRows: Array<typeof schema.claims.$inferInsert> = [];
          const evidenceRows: Array<typeof schema.claimEvidence.$inferInsert> = [];

          for (const { clm, subjectId } of resolvedMergeClaims) {
            const normStatement = clm.statement.trim().toLowerCase();
            const key = `${subjectId ?? ""}::${normStatement}`;
            if (seenMergeClaimKeys.has(key)) continue;
            seenMergeClaimKeys.add(key);

            const existingClaim = existingClaims.find(
              (ec) =>
                ec.statement.trim().toLowerCase() === normStatement &&
                ec.subjectId === subjectId
            );

            let claimId: string;
            if (existingClaim) {
              claimId = existingClaim.id;
            } else {
              const claimKey = `${targetEventId}::${subjectId ?? ""}::${normStatement}`;
              const claimHash = createHash("sha256").update(claimKey).digest("hex").slice(0, 12);
              claimId = `clm-${targetEventId.replace(/^evt-/, "")}-${claimHash}`;
              newClaimRows.push({
                id: claimId,
                eventId: targetEventId,
                subjectId,
                subjectEntityType: subjectId ? "person" : "event",
                subjectEntityId: subjectId || targetEventId,
                claimType: clm.claimType,
                statement: clm.statement,
                claimedTime: clm.claimedTime || null,
                claimedVenue: clm.claimedVenue || null,
                sourceId: source.sourceId,
                confidence: livePolicy.lane === "auto-publish" ? "confirmed" : "limited",
                claimStatus: livePolicy.lane === "auto-publish" ? "ESTABLISHED" : "PROVISIONAL",
                epistemicClass: livePolicy.lane === "auto-publish" ? "documented fact" : "allegation",
                supportingExcerpt: clm.supportingExcerpt || null,
              });
            }

            evidenceRows.push({
              id: `ev-${claimId}-${source.sourceId}`,
              claimId,
              sourceId: source.sourceId,
              evidenceForm: source.sourceType || "direct-citation",
              evidenceStrength: null,
              directness: null,
              citationLocator: null,
              supportingExcerpt: clm.supportingExcerpt || null,
              contradictsClaim: false,
            });
          }

          livePersistedClaimsAdded = newClaimRows.length;

          if (newClaimRows.length > 0) {
            await tx.insert(schema.claims).values(newClaimRows).onConflictDoNothing();
          }
          if (evidenceRows.length > 0) {
            await tx.insert(schema.claimEvidence).values(evidenceRows).onConflictDoNothing();
          }

          // Insert quotes into schema.quotes on merge
          if (candidate.quotes && candidate.quotes.length > 0) {
            const existingQuotes = await tx
              .select({
                id: schema.quotes.id,
                speakerId: schema.quotes.speakerId,
                quote: schema.quotes.quote,
              })
              .from(schema.quotes)
              .where(eq(schema.quotes.eventId, targetEventId));

            const seenBatchQuoteKeys = new Set<string>();
            for (const q of candidate.quotes) {
              const matchingSpeakerId = await resolveParticipantOrMentionLive(q.speaker);
              const speakerStubId = createParticipantStubId(q.speaker, matchingSpeakerId);
              const speakerId = await resolvePersonEntityInTransaction(tx, {
                personId: speakerStubId,
                rawName: q.speaker,
              });

              const normQuoteText = q.quote.trim().toLowerCase();
              const quoteBatchKey = `${speakerId}::${normQuoteText}`;
              if (seenBatchQuoteKeys.has(quoteBatchKey)) {
                continue;
              }
              seenBatchQuoteKeys.add(quoteBatchKey);

              const isDupQuote = existingQuotes.some(
                (eqRow) =>
                  eqRow.speakerId === speakerId &&
                  eqRow.quote.trim().toLowerCase() === normQuoteText
              );

              if (!isDupQuote) {
                const contentKey = `${speakerId}::${q.quote}`.toLowerCase().trim();
                const hash = Array.from(contentKey).reduce((h, c) => ((h * 31 + c.charCodeAt(0)) >>> 0), 0);
                const quoteId = `quo-${targetEventId}-${hash.toString(36)}`;
                await tx.insert(schema.quotes).values({
                  id: quoteId,
                  eventId: targetEventId,
                  speakerId,
                  quote: q.quote,
                  context: q.context || null,
                  language: "en",
                  sourceId: source.sourceId,
                });
              }
            }
          }

          await recordAuditEventInTransaction(
            tx,
            "merged",
            livePolicy.ruleId,
            {
              matchedEventId: targetEventId,
              sourceId: source.sourceId,
              similarity: liveDeduplication.similarity,
              claimsAdded: newClaimRows.length,
            },
            targetEventId,
            candidateId
          );

          syncResult.publishedEventId = targetEventId;
        } else {
          const baseSlug = deriveEventSlug(
            candidate.startDate,
            liveResolvedParticipantIds,
            candidate.eventType,
            candidate.city,
            candidate.title
          );
          const targetSlug = livePlaceResolution.placeId.replace(/^plc-/, "");

          const [existingDbPlace] = await tx
            .select({ id: schema.places.id })
            .from(schema.places)
            .where(
              or(
                eq(schema.places.id, livePlaceResolution.placeId),
                eq(schema.places.slug, targetSlug)
              )
            );

          let effectivePlaceId = livePlaceResolution.placeId;
          if (existingDbPlace) {
            effectivePlaceId = existingDbPlace.id;
          } else {
            await tx
              .insert(schema.places)
              .values({
                id: livePlaceResolution.placeId,
                slug: targetSlug,
                venue: livePlaceResolution.venue,
                city: livePlaceResolution.city,
                country: livePlaceResolution.country,
                latitude: livePlaceResolution.latitude ?? (candidate.latitude !== undefined ? candidate.latitude : null),
                longitude: livePlaceResolution.longitude ?? (candidate.longitude !== undefined ? candidate.longitude : null),
                placeType: "venue",
              })
              .onConflictDoNothing();

            const [persistedPlace] = await tx
              .select({ id: schema.places.id })
              .from(schema.places)
              .where(
                or(
                  eq(schema.places.id, livePlaceResolution.placeId),
                  eq(schema.places.slug, targetSlug)
                )
              );
            if (persistedPlace) {
              effectivePlaceId = persistedPlace.id;
            }
          }

          await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtext(${'rewind-slug:' + baseSlug}))`);

          let eventSlug = baseSlug;
          let [existingDbEvent] = await tx
            .select({ id: schema.events.id, title: schema.events.title, eventType: schema.events.eventType })
            .from(schema.events)
            .where(eq(schema.events.id, eventSlug));

          if (existingDbEvent) {
            const titleSim = tokenSimilarity(candidate.title, existingDbEvent.title);
            const isSemanticMatch = titleSim >= 0.3 || candidate.title.toLowerCase().trim() === existingDbEvent.title.toLowerCase().trim();
            if (!isSemanticMatch) {
              // Disambiguate slug collision between distinct historical events on the same day
              let collisionIdx = 2;
              while (existingDbEvent) {
                eventSlug = `${baseSlug}-${collisionIdx++}`;
                [existingDbEvent] = await tx
                  .select({ id: schema.events.id, title: schema.events.title, eventType: schema.events.eventType })
                  .from(schema.events)
                  .where(eq(schema.events.id, eventSlug));
              }
            }
          }

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
              placeId: effectivePlaceId,
              seriesId: null,
              venueId: null,
              addressId: null,
              verificationStatus: livePolicy.lane === "auto-publish" ? "verified" : "provisional",
              confidenceScore: livePolicy.lane === "auto-publish" ? 0.98 : 0.5,
              publicationStatus: "published",
              publicationLane: livePolicy.lane,
              significanceScore: 85,
            });
          }

          syncResult.publishedEventId = eventSlug;

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

          const participantConfidence =
            livePolicy.lane === "provisional" || source.sourceTier === "tier-c"
              ? "limited"
              : "confirmed";

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
                presenceConfidence: participantConfidence,
                roleConfidence: participantConfidence,
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

          const resolvedPubClaims = await Promise.all(
            candidate.claims.map(async (clm) => ({
              clm,
              subjectId: await resolveParticipantOrMentionLive(clm.subjectMention),
            }))
          );

          const seenPubClaimKeys = new Set<string>();
          const claimsToInsert = resolvedPubClaims.filter(({ clm, subjectId }) => {
            const normStatement = clm.statement.trim().toLowerCase();
            const key = `${subjectId ?? ""}::${normStatement}`;
            if (seenPubClaimKeys.has(key)) return false;
            seenPubClaimKeys.add(key);
            return !existingClaims.some(
              (ec) =>
                ec.statement.trim().toLowerCase() === normStatement &&
                ec.subjectId === subjectId
            );
          });

          livePersistedClaimsAdded = claimsToInsert.length;

          if (claimsToInsert.length > 0) {
            const claimRows = claimsToInsert.map(({ clm, subjectId }) => {
              const contentKey = `${clm.subjectMention ?? ""}::${clm.statement}`.toLowerCase().trim();
              const hash = Array.from(contentKey).reduce((h, c) => ((h * 31 + c.charCodeAt(0)) >>> 0), 0);
              const stableId = `clm-${eventSlug}-${hash.toString(36)}`;
              return {
                claim: {
                  id: stableId,
                  eventId: eventSlug,
                  subjectId,
                  subjectEntityType: subjectId ? "person" : "event",
                  subjectEntityId: subjectId || eventSlug,
                  claimType: clm.claimType,
                  statement: clm.statement,
                  claimedTime: clm.claimedTime || null,
                  claimedVenue: clm.claimedVenue || null,
                  sourceId: source.sourceId,
                  confidence: livePolicy.lane === "auto-publish" ? "confirmed" : "limited",
                  claimStatus: livePolicy.lane === "auto-publish" ? "ESTABLISHED" : "PROVISIONAL",
                  epistemicClass: livePolicy.lane === "auto-publish" ? "documented fact" : "allegation",
                  supportingExcerpt: clm.supportingExcerpt || null,
                },
                evidence: {
                  id: `ev-${stableId}-${source.sourceId}`,
                  claimId: stableId,
                  sourceId: source.sourceId,
                  evidenceForm: source.sourceType || "direct-citation",
                  evidenceStrength: null,
                  directness: null,
                  citationLocator: null,
                  supportingExcerpt: clm.supportingExcerpt || null,
                  contradictsClaim: false,
                },
              };
            });

            await tx.insert(schema.claims).values(claimRows.map((r) => r.claim)).onConflictDoNothing();
            await tx.insert(schema.claimEvidence).values(claimRows.map((r) => r.evidence)).onConflictDoNothing();
          }

          // Insert quotes into schema.quotes
          if (candidate.quotes && candidate.quotes.length > 0) {
            const existingQuotes = await tx
              .select({
                id: schema.quotes.id,
                speakerId: schema.quotes.speakerId,
                quote: schema.quotes.quote,
              })
              .from(schema.quotes)
              .where(eq(schema.quotes.eventId, eventSlug));

            const seenBatchQuoteKeys = new Set<string>();
            for (const q of candidate.quotes) {
              const matchingSpeakerId = await resolveParticipantOrMentionLive(q.speaker);
              const speakerStubId = createParticipantStubId(q.speaker, matchingSpeakerId);
              const speakerId = await resolvePersonEntityInTransaction(tx, {
                personId: speakerStubId,
                rawName: q.speaker,
              });

              const normQuoteText = q.quote.trim().toLowerCase();
              const quoteBatchKey = `${speakerId}::${normQuoteText}`;
              if (seenBatchQuoteKeys.has(quoteBatchKey)) {
                continue;
              }
              seenBatchQuoteKeys.add(quoteBatchKey);

              const isDupQuote = existingQuotes.some(
                (eqRow) =>
                  eqRow.speakerId === speakerId &&
                  eqRow.quote.trim().toLowerCase() === normQuoteText
              );

              if (!isDupQuote) {
                const contentKey = `${speakerId}::${q.quote}`.toLowerCase().trim();
                const hash = Array.from(contentKey).reduce((h, c) => ((h * 31 + c.charCodeAt(0)) >>> 0), 0);
                const quoteId = `quo-${eventSlug}-${hash.toString(36)}`;
                await tx.insert(schema.quotes).values({
                  id: quoteId,
                  eventId: eventSlug,
                  speakerId,
                  quote: q.quote,
                  context: q.context || null,
                  language: "en",
                  sourceId: source.sourceId,
                });
              }
            }
          }

          // Transactional audit log for auto-published event
          await recordAuditEventInTransaction(
            tx,
            "auto-published",
            livePolicy.ruleId,
            {
              eventId: eventSlug,
              sourceId: source.sourceId,
              sourceTier: source.sourceTier,
              lane: livePolicy.lane,
            },
            eventSlug,
            candidateId
          );
        }
      } else {
        const rawPayload = JSON.stringify({ ...candidate, sourceId: source.sourceId });
        const [existingCand] = await tx
          .select({ id: schema.candidateEvents.id })
          .from(schema.candidateEvents)
          .where(
            and(
              eq(schema.candidateEvents.fingerprint, liveFingerprint),
              eq(schema.candidateEvents.status, "pending")
            )
          );

        if (existingCand) {
          syncResult.candidateId = existingCand.id;
          candidateId = existingCand.id;
        } else {
          await tx.insert(schema.candidateEvents).values({
            id: candidateId,
            fingerprint: liveFingerprint,
            rawExtraction: rawPayload,
            suggestedTitle: candidate.title,
            suggestedDate: candidate.startDate,
            suggestedPlace: `${candidate.venue}, ${candidate.city}, ${candidate.country}`,
            suggestedParticipants: JSON.stringify(candidate.participants),
            primarySourceTier: source.sourceTier,
            assignedLane: livePolicy.lane,
            duplicateMatchId: liveDeduplication.matchedEventId || null,
            duplicateSimilarity: liveDeduplication.similarity,
            status: "pending",
            rejectionReason: null,
          });
        }

        // Transactional audit log for queued candidate
        await recordAuditEventInTransaction(
          tx,
          "queued-for-review",
          livePolicy.ruleId,
          {
            candidateId,
            sourceId: source.sourceId,
            reason: livePolicy.reason,
          },
          undefined,
          candidateId
        );
      }
    });

    // Authoritative In-Memory Audit Logging for store synchronization
    if (livePolicy.lane === "auto-publish" || livePolicy.lane === "provisional") {
      if (liveDeduplication.isDuplicate && liveDeduplication.matchedEventId) {
        recordAuditEventStoreOnly(
          "merged",
          livePolicy.ruleId,
          {
            matchedEventId: liveDeduplication.matchedEventId,
            sourceId: source.sourceId,
            similarity: liveDeduplication.similarity,
            claimsAdded: livePersistedClaimsAdded,
          },
          liveDeduplication.matchedEventId,
          candidateId
        );
      } else {
        const publishedId = syncResult.publishedEventId!;
        recordAuditEventStoreOnly(
          "auto-published",
          livePolicy.ruleId,
          {
            eventId: publishedId,
            sourceId: source.sourceId,
            sourceTier: source.sourceTier,
            lane: livePolicy.lane,
          },
          publishedId,
          candidateId
        );
      }
    } else {
      recordAuditEventStoreOnly(
        "queued-for-review",
        livePolicy.ruleId,
        {
          candidateId,
          sourceId: source.sourceId,
          reason: livePolicy.reason,
        },
        undefined,
        candidateId
      );
    }

    return syncResult;
  })();

  asyncPromise.catch(() => {});

  return Object.assign(asyncPromise, syncResult);
}
