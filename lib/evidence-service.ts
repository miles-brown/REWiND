import { getRelationalStore, getDb } from "@/lib/db/client";
import * as schema from "@/db/schema";
import { eq, desc, count, or, and } from "drizzle-orm";
import { recordAuditEvent } from "@/lib/ingestion/audit";
import { resolveEntity } from "@/lib/ingestion/resolve";

export interface EvidenceStats {
  publishedEventsCount: number;
  verifiedClaimsCount: number;
  primarySourcesCount: number;
  pendingReviewCount: number;
  autoPublishedCount: number;
  duplicateCandidatesCount?: number;
  totalCandidatesCount?: number;
}

interface CandidateClaimInput {
  subjectMention?: string;
  claimType?: string;
  statement?: string;
  claimedTime?: string;
  claimedVenue?: string;
  supportingExcerpt?: string;
}

export async function getEvidentiaryStats(): Promise<EvidenceStats> {
  const db = getDb();
  if (db) {
    try {
      const [published] = await db.select({ val: count() }).from(schema.events).where(eq(schema.events.publicationStatus, "published"));
      const [autoPublished] = await db.select({ val: count() }).from(schema.events).where(eq(schema.events.publicationLane, "auto-publish"));
      const [claims] = await db.select({ val: count() }).from(schema.claims);
      const [sources] = await db
        .select({ val: count() })
        .from(schema.sources)
        .where(or(eq(schema.sources.tier, "tier-a"), eq(schema.sources.tier, "tier-b")));
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
  const duplicates = store.candidateEvents.filter((c) => (c.duplicateSimilarity ?? 0) >= 0.75);

  return {
    publishedEventsCount: published.length,
    verifiedClaimsCount: store.claims.length,
    primarySourcesCount: primarySources.length,
    pendingReviewCount: pending.length,
    autoPublishedCount: autoPublished.length,
    duplicateCandidatesCount: duplicates.length,
    totalCandidatesCount: store.candidateEvents.length,
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
      return rows;
    } catch (err) {
      console.warn("Failed to query live candidate queue, falling back to store:", err);
    }
  }

  return store.candidateEvents;
}

async function resolveCandidateRecord(
  candidateId: string,
  store: ReturnType<typeof getRelationalStore>,
  db: ReturnType<typeof getDb>
) {
  if (db) {
    try {
      const [dbCandidate] = await db
        .select()
        .from(schema.candidateEvents)
        .where(eq(schema.candidateEvents.id, candidateId));
      if (dbCandidate) return dbCandidate;
    } catch (e) {
      console.warn("Error querying candidate from live db:", e);
    }
  }
  return store.candidateEvents.find((c) => c.id === candidateId);
}

function asAsyncResult<T extends Record<string, unknown>>(promise: Promise<T>, syncFallback: T): Promise<T> & T {
  return Object.assign(promise, syncFallback);
}

export function approveCandidate(candidateId: string, editorName = "Senior Historical Editor") {
  const store = getRelationalStore();
  const db = getDb();

  const syncCandidate = store.candidateEvents.find((c) => c.id === candidateId);
  const syncFallback: { success: boolean; eventId?: string; error?: string } = !syncCandidate
    ? { success: false, error: "Candidate not found" }
    : syncCandidate.status !== "pending"
    ? { success: false, error: `Candidate is already ${syncCandidate.status} and cannot be approved again` }
    : { success: true, eventId: `evt-${syncCandidate.suggestedDate.slice(0, 10)}-cand-sync` };

  const executionPromise = (async () => {
    const candidate = await resolveCandidateRecord(candidateId, store, db);
    if (!candidate) return { success: false, error: "Candidate not found" };

    if (candidate.status !== "pending") {
      return {
        success: false,
        error: `Candidate is already ${candidate.status} and cannot be approved again`,
      };
    }

    const data = typeof candidate.rawExtraction === "string" ? JSON.parse(candidate.rawExtraction) : candidate.rawExtraction;
    const eventSlug = `evt-${candidate.suggestedDate.slice(0, 10)}-cand-${Date.now().toString(36).slice(-4)}`;
    const placeId = `plc-${candidate.suggestedPlace ? candidate.suggestedPlace.toLowerCase().replace(/[^\w]/g, "-").slice(0, 24) : "unspecified"}`;
    const sourceId = data.sourceId || "src-editorial-approval";

    const newClaims: Array<ReturnType<typeof getRelationalStore>["claims"][0]> = [];
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
          newClaims.push({
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

    const eventPeopleRows: Array<typeof schema.eventPeople.$inferInsert & { rawName?: string }> = [];
    if (Array.isArray(data.participants)) {
      data.participants.forEach((p: { name: string; role?: string; involvementType?: string }, idx: number) => {
        const resolved = resolveEntity(p.name);
        const personId = resolved.personId || `p-${p.name.toLowerCase().replace(/[^\w]/g, "-").slice(0, 24)}`;
        eventPeopleRows.push({
          id: `ep-${eventSlug}-${idx}-${Date.now().toString(36).slice(-4)}`,
          eventId: eventSlug,
          personId,
          involvementType: p.involvementType || "attendee",
          roleLabel: p.role || "participant",
          presenceConfidence: "confirmed",
          roleConfidence: "confirmed",
          rawName: p.name,
        });
      });
    }

    let resolvedPlaceId = placeId;

    if (db) {
      try {
        await db.transaction(async (tx) => {
          // 1. Claim pending candidate atomically (Codex Issue 5)
          const updateResult = await tx
            .update(schema.candidateEvents)
            .set({ status: "approved" })
            .where(
              and(
                eq(schema.candidateEvents.id, candidateId),
                eq(schema.candidateEvents.status, "pending")
              )
            )
            .returning({ id: schema.candidateEvents.id });

          if (updateResult.length === 0) {
            throw new Error("Candidate was already reviewed or claimed by another editor");
          }

          // 2. Ensure source exists in schema.sources before linking
          if (sourceId) {
            const [existingSrc] = await tx
              .select({ id: schema.sources.id })
              .from(schema.sources)
              .where(eq(schema.sources.id, sourceId));
            if (!existingSrc) {
              await tx.insert(schema.sources).values({
                id: sourceId,
                title:
                  sourceId === "src-editorial-approval"
                    ? "Editorial Review Board Register"
                    : (data.sourceTitle || `Source for ${candidate.suggestedTitle}`),
                publisher: data.publisher || "Archival Source",
                sourceType: data.sourceType || "official-transcript",
                tier: candidate.primarySourceTier === "tier-a" ? "tier-a" : "tier-b",
                url: data.url || null,
              });
            }
          }

          // 3. Resolve or insert canonical place (Codex Issue 2 & 4: preserve null coordinates until evidence supplies them)
          const targetSlug = placeId.replace(/^plc-/, "");
          const [existingDbPlace] = await tx
            .select()
            .from(schema.places)
            .where(or(eq(schema.places.id, placeId), eq(schema.places.slug, targetSlug)));
          if (existingDbPlace) {
            resolvedPlaceId = existingDbPlace.id;
          } else {
            await tx.insert(schema.places).values({
              id: placeId,
              slug: targetSlug,
              venue: candidate.suggestedPlace || "Unspecified Location",
              city: candidate.suggestedPlace || "Unknown City",
              country: "International",
              latitude: null,
              longitude: null,
              placeType: "venue",
            });
          }

          // 4. Insert published event
          await tx.insert(schema.events).values({
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
            placeId: resolvedPlaceId,
            seriesId: null,
            venueId: null,
            addressId: null,
            verificationStatus: "verified",
            confidenceScore: 0.98,
            publicationStatus: "published",
            publicationLane: "human-review",
            significanceScore: 80,
          });

          // 5. Insert evidence link before commit (Codex Issue 1)
          await tx.insert(schema.eventSources).values({
            eventId: eventSlug,
            sourceId,
            isPrimary: true,
          });

          // 6. Persist approved candidate participants (Codex Issue 3 & CodeRabbit Issue 8)
          if (eventPeopleRows.length > 0) {
            for (const ep of eventPeopleRows) {
              const [existingPerson] = await tx
                .select({ id: schema.people.id })
                .from(schema.people)
                .where(eq(schema.people.id, ep.personId));
              if (!existingPerson) {
                const pSlug = ep.personId.replace(/^p-/, "");
                const [bySlug] = await tx
                  .select({ id: schema.people.id })
                  .from(schema.people)
                  .where(eq(schema.people.slug, pSlug));
                if (bySlug) {
                  ep.personId = bySlug.id;
                } else {
                  const rawName = ep.rawName || pSlug;
                  await tx.insert(schema.people).values({
                    id: ep.personId,
                    slug: pSlug,
                    displayName: ep.roleLabel ? `${rawName} (${ep.roleLabel})` : rawName,
                    canonicalName: rawName,
                    nationality: "International",
                    classification: "historical-figure",
                    notabilityBasis: "Documented participant in verified historical event",
                    publicationStatus: "draft",
                  });
                }
              }
              const epRow = { ...ep };
              delete epRow.rawName;
              await tx.insert(schema.eventPeople).values(epRow);
            }
          }

          // 7. Insert claims
          if (newClaims.length > 0) {
            await tx.insert(schema.claims).values(newClaims);
          }

          // 8. Insert review decision
          await tx.insert(schema.reviewDecisions).values({
            candidateId,
            decision: "approved",
            decidedBy: editorName,
            notes: "Editorial review sign-off",
          });
        });
      } catch (err) {
        console.error("Live DB transaction failed on approveCandidate:", err);
        return { success: false, error: err instanceof Error ? err.message : "Database transaction failed" };
      }
    }

    const memCand = store.candidateEvents.find((c) => c.id === candidateId);
    if (memCand) {
      memCand.status = "approved";
    }
    candidate.status = "approved";

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
      placeId: resolvedPlaceId,
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

    const existingPlace = store.places.find((p) => p.id === resolvedPlaceId);
    if (!existingPlace) {
      store.places.push({
        id: resolvedPlaceId,
        slug: resolvedPlaceId.replace(/^plc-/, ""),
        venue: candidate.suggestedPlace || "Unspecified Location",
        city: candidate.suggestedPlace || "Unknown City",
        country: "International",
        latitude: 31.7683,
        longitude: 35.2137,
        placeType: "venue",
      });
    }

    newClaims.forEach((clm) => store.claims.push(clm));

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

    syncFallback.eventId = eventSlug;
    return { success: true, eventId: eventSlug };
  })();

  return asAsyncResult(executionPromise, syncFallback);
}

export function mergeCandidate(candidateId: string, targetEventId: string, editorName = "Senior Historical Editor") {
  const store = getRelationalStore();
  const db = getDb();

  const syncCandidate = store.candidateEvents.find((c) => c.id === candidateId);
  const syncTarget = store.events.find((e) => e.id === targetEventId);
  const syncFallback: { success: boolean; targetEventId?: string; claimsAddedCount?: number; error?: string } = !syncCandidate || !syncTarget
    ? { success: false, error: "Candidate or target event not found" }
    : syncCandidate.status !== "pending"
    ? { success: false, error: `Candidate is already ${syncCandidate.status} and cannot be merged` }
    : { success: true, targetEventId, claimsAddedCount: 0 };

  const executionPromise = (async () => {
    const candidate = await resolveCandidateRecord(candidateId, store, db);
    if (!candidate) return { success: false, error: "Candidate not found" };

    if (candidate.status !== "pending") {
      return {
        success: false,
        error: `Candidate is already ${candidate.status} and cannot be merged`,
      };
    }

    let targetEvent: typeof schema.events.$inferSelect | undefined;
    if (db) {
      try {
        const [dbEvt] = await db.select().from(schema.events).where(eq(schema.events.id, targetEventId));
        if (dbEvt) targetEvent = dbEvt;
      } catch (e) {
        console.warn("Error querying target event from live db:", e);
      }
    }
    if (!targetEvent) {
      targetEvent = store.events.find((e) => e.id === targetEventId);
    }
    if (!targetEvent) return { success: false, error: "Candidate or target event not found" };

    const data = typeof candidate.rawExtraction === "string" ? JSON.parse(candidate.rawExtraction) : candidate.rawExtraction;
    const sourceId = data.sourceId || "src-editorial-corroboration";

    const claimsToInsert: Array<ReturnType<typeof getRelationalStore>["claims"][0]> = [];
    if (Array.isArray(data.claims)) {
      data.claims.forEach((clm: CandidateClaimInput, idx: number) => {
        const resolvedSubject = clm.subjectMention ? resolveEntity(clm.subjectMention) : null;
        const subjectId = resolvedSubject?.personId || null;
        const statement = clm.statement || "Corroborating claim";

        const isDuplicateClaim = store.claims.some(
          (existing) =>
            existing.eventId === targetEventId &&
            existing.statement.toLowerCase().trim() === statement.toLowerCase().trim() &&
            existing.subjectId === subjectId
        );

        if (!isDuplicateClaim) {
          claimsToInsert.push({
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
        }
      });
    }

    if (db) {
      try {
        await db.transaction(async (tx) => {
          // Claim pending candidate atomically (Codex Issue 5)
          const updateResult = await tx
            .update(schema.candidateEvents)
            .set({ status: "merged" })
            .where(
              and(
                eq(schema.candidateEvents.id, candidateId),
                eq(schema.candidateEvents.status, "pending")
              )
            )
            .returning({ id: schema.candidateEvents.id });

          if (updateResult.length === 0) {
            throw new Error("Candidate was already reviewed or claimed by another editor");
          }

          if (sourceId) {
            const [existingSrc] = await tx
              .select({ id: schema.sources.id })
              .from(schema.sources)
              .where(eq(schema.sources.id, sourceId));
            if (!existingSrc) {
              await tx.insert(schema.sources).values({
                id: sourceId,
                title:
                  sourceId === "src-editorial-corroboration"
                    ? "Editorial Corroboration Register"
                    : (data.sourceTitle || `Corroborating Source: ${candidate.suggestedTitle}`),
                publisher: data.publisher || "Archival Source",
                sourceType: data.sourceType || "official-transcript",
                tier: candidate.primarySourceTier === "tier-a" ? "tier-a" : "tier-b",
                url: data.url || null,
                publicationDate: candidate.suggestedDate,
                trustScore: 0.95,
              });
            }

            // Link corroborating source to target event (Codex Issue 6)
            const [existingLink] = await tx
              .select({ eventId: schema.eventSources.eventId })
              .from(schema.eventSources)
              .where(
                and(
                  eq(schema.eventSources.eventId, targetEventId),
                  eq(schema.eventSources.sourceId, sourceId)
                )
              );
            if (!existingLink) {
              await tx.insert(schema.eventSources).values({
                eventId: targetEventId,
                sourceId,
                isPrimary: false,
              });
            }
          }

          if (claimsToInsert.length > 0) {
            await tx.insert(schema.claims).values(claimsToInsert);
          }

          await tx.insert(schema.reviewDecisions).values({
            candidateId,
            decision: "merged",
            decidedBy: editorName,
            notes: `Merged into ${targetEventId}`,
          });
        });
      } catch (err) {
        console.error("Live DB transaction failed on mergeCandidate:", err);
        return { success: false, error: err instanceof Error ? err.message : "Database transaction failed" };
      }
    }

    const memCand = store.candidateEvents.find((c) => c.id === candidateId);
    if (memCand) {
      memCand.status = "merged";
    }
    candidate.status = "merged";

    const memTargetEvent = store.events.find((e) => e.id === targetEventId);
    if (memTargetEvent && "sourceIds" in memTargetEvent && Array.isArray((memTargetEvent as { sourceIds?: string[] }).sourceIds)) {
      const sIds = (memTargetEvent as { sourceIds: string[] }).sourceIds;
      if (!sIds.includes(sourceId)) {
        sIds.push(sourceId);
      }
    }

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

    claimsToInsert.forEach((c) => store.claims.push(c));

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
        claimsAddedCount: claimsToInsert.length,
        mergedParticipants,
        similarityScore: candidate.duplicateSimilarity,
      },
      targetEventId,
      candidateId
    );

    syncFallback.claimsAddedCount = claimsToInsert.length;
    return { success: true, targetEventId, claimsAddedCount: claimsToInsert.length };
  })();

  return asAsyncResult(executionPromise, syncFallback);
}

export function rejectCandidate(candidateId: string, reason: string, editorName = "Senior Historical Editor") {
  const store = getRelationalStore();
  const db = getDb();

  const syncCandidate = store.candidateEvents.find((c) => c.id === candidateId);
  const syncFallback: { success: boolean; error?: string } = !syncCandidate
    ? { success: false, error: "Candidate not found" }
    : syncCandidate.status !== "pending"
    ? { success: false, error: `Candidate is already ${syncCandidate.status} and cannot be rejected again` }
    : { success: true };

  const executionPromise = (async () => {
    const candidate = await resolveCandidateRecord(candidateId, store, db);
    if (!candidate) return { success: false, error: "Candidate not found" };

    if (candidate.status !== "pending") {
      return {
        success: false,
        error: `Candidate is already ${candidate.status} and cannot be rejected again`,
      };
    }

    if (db) {
      try {
        await db.transaction(async (tx) => {
          // Claim pending candidate atomically (Codex Issue 5)
          const updateResult = await tx
            .update(schema.candidateEvents)
            .set({ status: "rejected", rejectionReason: reason })
            .where(
              and(
                eq(schema.candidateEvents.id, candidateId),
                eq(schema.candidateEvents.status, "pending")
              )
            )
            .returning({ id: schema.candidateEvents.id });

          if (updateResult.length === 0) {
            throw new Error("Candidate was already reviewed or claimed by another editor");
          }

          await tx.insert(schema.reviewDecisions).values({
            candidateId,
            decision: "rejected",
            decidedBy: editorName,
            notes: reason,
          });
        });
      } catch (err) {
        console.error("Live DB transaction failed on rejectCandidate:", err);
        return { success: false, error: err instanceof Error ? err.message : "Database transaction failed" };
      }
    }

    const memCand = store.candidateEvents.find((c) => c.id === candidateId);
    if (memCand) {
      memCand.status = "rejected";
      memCand.rejectionReason = reason;
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
  })();

  return asAsyncResult(executionPromise, syncFallback);
}

export function ingestSampleCandidateStream(editorActor = "Autonomous Ingestion Adapter") {
  const store = getRelationalStore();
  const timestamp = Date.now();
  const candidateId = `cand-stream-${timestamp.toString(36)}`;
  
  const sampleCandidate = {
    id: candidateId,
    fingerprint: `fp_geneva_arms_control_${timestamp}`,
    suggestedTitle: "Trilateral Diplomatic Consultations on Regional Security Framework",
    suggestedDate: "2013-11-14",
    suggestedPlace: "Palais des Nations, Geneva",
    suggestedParticipants: JSON.stringify([
      { name: "Benjamin Netanyahu", role: "Prime Minister" },
      { name: "John Kerry", role: "U.S. Secretary of State" },
    ]),
    primarySourceTier: "tier-a",
    assignedLane: "auto-publish",
    duplicateMatchId: null,
    duplicateSimilarity: 0.11,
    status: "pending",
    rejectionReason: null,
    createdAt: new Date(),
    rawExtraction: JSON.stringify({
      summary: "High-level bilateral diplomatic consultation convened at the UN European Headquarters to review compliance parameters, regional security guarantees, and telemetry verification.",
      eventType: "bilateral-meeting",
      venue: "Palais des Nations",
      city: "Geneva",
      country: "Switzerland",
      sourceId: "src-un-geneva-press-2013",
      sourceTitle: "United Nations Information Service Geneva Press Record",
      sourcePublisher: "United Nations Secretariat",
      sourceTier: "tier-a",
      claims: [
        {
          subjectMention: "Benjamin Netanyahu",
          claimType: "presence",
          statement: "Convened with international delegation members at the Palais des Nations diplomatic hall.",
          claimedTime: "2013-11-14T14:00:00Z",
          claimedVenue: "Palais des Nations",
          supportingExcerpt: "Official protocol communique issued by the UN Information Service in Geneva.",
        },
        {
          subjectMention: "Benjamin Netanyahu",
          claimType: "statement",
          statement: "Emphasized strict verification benchmarks for regional non-proliferation enforcement.",
          supportingExcerpt: "'Any credible agreement must require complete dismantlement of enrichment centrifuges.'",
        },
      ],
      participants: [
        { name: "Benjamin Netanyahu", role: "Prime Minister of Israel" },
        { name: "John Kerry", role: "U.S. Secretary of State" },
      ],
    }),
  };

  store.candidateEvents.unshift(sampleCandidate);

  recordAuditEvent(
    "discovered",
    "INGEST-STREAM-SAMPLE",
    {
      candidateId,
      streamSource: "UN Information Service Geneva Ingestion Feed",
      title: sampleCandidate.suggestedTitle,
      ingestedBy: editorActor,
    },
    undefined,
    candidateId
  );

  return { success: true, candidateId, candidate: sampleCandidate };
}
