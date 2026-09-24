import { getRelationalStore, getDb } from "@/lib/db/client";
import * as schema from "@/db/schema";
import { eq, desc, count, or, and, ilike, inArray, sql } from "drizzle-orm";
import { recordAuditEvent, recordAuditEventInTransaction, recordAuditEventStoreOnly } from "@/lib/ingestion/audit";
import { resolveEntity, createParticipantStubId, resolvePersonEntityInTransaction } from "@/lib/ingestion/resolve";
import { deriveEventSlug } from "@/lib/ingestion/pipeline";

export interface EvidenceStats {
  publishedEventsCount: number;
  verifiedClaimsCount: number;
  primarySourcesCount: number;
  pendingReviewCount: number;
  autoPublishedCount: number;
}

interface CandidateClaimInput {
  subjectMention?: string;
  claimType?: string;
  statement?: string;
  claimedTime?: string;
  claimedVenue?: string;
  supportingExcerpt?: string;
  confidence?: string;
  claimStatus?: string;
  epistemicClass?: string;
}

function escapeIlikePattern(str: string): string {
  return str.replace(/[\\%_]/g, "\\$&");
}

export async function getEvidentiaryStats(): Promise<EvidenceStats> {
  const db = getDb();
  if (db) {
    try {
      const [published] = await db.select({ val: count() }).from(schema.events).where(eq(schema.events.publicationStatus, "published"));
      const [autoPublished] = await db.select({ val: count() }).from(schema.events).where(eq(schema.events.publicationLane, "auto-publish"));
      const [claims] = await db
        .select({ val: count() })
        .from(schema.claims)
        .where(or(eq(schema.claims.confidence, "confirmed"), eq(schema.claims.claimStatus, "ESTABLISHED")));
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
      if (process.env.NODE_ENV === "production") {
        throw new Error(`Failed to query evidentiary stats from database: ${err instanceof Error ? err.message : String(err)}`);
      }
      console.warn("Failed to query live evidentiary stats, falling back to store:", err);
    }
  }

  const store = getRelationalStore();
  const published = store.events.filter((e) => e.publicationStatus === "published");
  const autoPublished = store.events.filter((e) => e.publicationLane === "auto-publish");
  const primarySources = store.sources.filter((s) => s.tier === "tier-a" || s.tier === "tier-b");
  const pending = store.candidateEvents.filter((c) => c.status === "pending");
  const verifiedClaims = store.claims.filter((c) => c.confidence === "confirmed" || c.claimStatus === "ESTABLISHED");

  return {
    publishedEventsCount: published.length,
    verifiedClaimsCount: verifiedClaims.length,
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
      return rows;
    } catch (err) {
      if (process.env.NODE_ENV === "production") {
        throw new Error(`Failed to query review queue from database: ${err instanceof Error ? err.message : String(err)}`);
      }
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

/**
 * Wraps an async database execution promise with initial synchronous fallback properties.
 *
 * CAUTION / ARCHITECTURAL CONTRACT:
 * The immediate synchronous properties (e.g. `result.success`) reflect initial memory store
 * fallback state. Callers awaiting the returned Promise receive the authoritative database result once the
 * async database transaction completes. Synchronous property inspection should be treated as transient
 * state while background persistence completes.
 */
function asAsyncResult<T extends Record<string, unknown>>(promise: Promise<T>, syncFallback: T): Promise<T> & T {
  return Object.assign(promise, syncFallback);
}

export function approveCandidate(candidateId: string, editorName = "Senior Historical Editor") {
  const store = getRelationalStore();
  const db = getDb();

  const syncCandidate = store.candidateEvents.find((c) => c.id === candidateId);
  const syncData = syncCandidate
    ? typeof syncCandidate.rawExtraction === "string"
      ? JSON.parse(syncCandidate.rawExtraction)
      : syncCandidate.rawExtraction
    : null;
  const syncSourceId = syncData?.sourceId;

  const syncFallback: { success: boolean; eventId?: string; error?: string } = !syncCandidate
    ? { success: false, error: "Candidate not found" }
    : syncCandidate.status !== "pending"
    ? { success: false, error: `Candidate is already ${syncCandidate.status} and cannot be approved again` }
    : !syncSourceId || syncSourceId === "src-editorial-approval"
    ? {
        success: false,
        error: "Forensic Rigor Contract: Candidate approval requires a valid verifiable primary or secondary sourceId referencing an archival record (AGENTS.md contract)",
      }
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
    const sourceId = data?.sourceId;
    if (!sourceId || sourceId === "src-editorial-approval") {
      return {
        success: false,
        error: "Forensic Rigor Contract: Candidate approval requires a valid verifiable primary or secondary sourceId referencing an archival record (AGENTS.md contract)",
      };
    }

    const extractedVenue = (data?.venue || "").trim() || (candidate.suggestedPlace ? candidate.suggestedPlace.split(",")[0]?.trim() : "") || "Unspecified Location";
    const extractedCity = (data?.city || "").trim() || (candidate.suggestedPlace ? (candidate.suggestedPlace.split(",")[1]?.trim() || candidate.suggestedPlace) : "") || "Unknown City";
    const extractedCountry = (data?.country || "").trim() || (candidate.suggestedPlace ? (candidate.suggestedPlace.split(",")[2]?.trim() || "International") : "") || "International";
    const extractedLat = typeof data?.latitude === "number" && !isNaN(data.latitude) ? data.latitude : null;
    const extractedLng = typeof data?.longitude === "number" && !isNaN(data.longitude) ? data.longitude : null;

    const baseSlug = deriveEventSlug(
      candidate.suggestedDate,
      (Array.isArray(data?.participants) ? data.participants : []).map((p: { name: string }) => resolveEntity(p.name).personId || createParticipantStubId(p.name)),
      data?.eventType || "historical-action",
      extractedCity,
      candidate.suggestedTitle
    );
    let eventSlug = baseSlug;
    const citySlug = (extractedCity || "unknown").toLowerCase().replace(/[^\w]/g, "-").replace(/-+/g, "-").replace(/^-+|-+$/g, "").slice(0, 16) || "unknown";
    const venueSlug = (extractedVenue || "general").toLowerCase().replace(/[^\w]/g, "-").replace(/-+/g, "-").replace(/^-+|-+$/g, "").slice(0, 20) || "general";
    const placeId = `plc-${citySlug}-${venueSlug}`;

    const newClaims: Array<
      typeof schema.claims.$inferInsert & { subjectMention?: string }
    > = [];
    if (Array.isArray(data.claims)) {
      data.claims.forEach(
        (
          clm: CandidateClaimInput & { confidence?: string },
          idx: number
        ) => {
          const resolvedSubject = clm.subjectMention ? resolveEntity(clm.subjectMention) : null;
          const conf = clm.confidence && ["confirmed", "strong", "moderate", "limited", "disputed"].includes(clm.confidence)
            ? clm.confidence
            : "limited";
          newClaims.push({
            id: `clm-${baseSlug}-appr-${Date.now()}-${idx}`,
            eventId: baseSlug,
            subjectId: resolvedSubject?.personId || null,
            claimType: clm.claimType || "presence",
            statement: clm.statement || `${candidate.suggestedTitle} verified by editorial review`,
            claimedTime: clm.claimedTime || candidate.suggestedDate,
            claimedVenue: clm.claimedVenue || candidate.suggestedPlace || null,
            sourceId,
            confidence: conf,
            supportingExcerpt: clm.supportingExcerpt || data.summary || null,
            subjectMention: clm.subjectMention,
          });
        }
      );
    }

    const eventPeopleRows: Array<typeof schema.eventPeople.$inferInsert & { rawName?: string }> = [];
    if (Array.isArray(data.participants)) {
      data.participants.forEach((p: { name: string; role?: string; involvementType?: string; presenceMode?: string; presenceConfidence?: string; roleConfidence?: string }, idx: number) => {
        const resolved = resolveEntity(p.name);
        const personId = createParticipantStubId(p.name, resolved.personId);
        const presenceConf = p.presenceConfidence && ["confirmed", "strong", "moderate", "limited", "disputed"].includes(p.presenceConfidence)
          ? p.presenceConfidence
          : "limited";
        const roleConf = p.roleConfidence && ["confirmed", "strong", "moderate", "limited", "disputed"].includes(p.roleConfidence)
          ? p.roleConfidence
          : "limited";
        eventPeopleRows.push({
          id: `ep-${baseSlug}-${idx}-${Date.now().toString(36).slice(-4)}`,
          eventId: baseSlug,
          personId,
          involvementType: p.involvementType || "attendee",
          roleLabel: p.role || "participant",
          presenceConfidence: presenceConf,
          roleConfidence: roleConf,
          attendanceMode: p.presenceMode || "physical",
          rawName: p.name,
        });
      });
    }

    let resolvedPlaceId = placeId;
    const persistedClaimIds = new Set<string>();
    const resolvedParticipantMap = new Map<string, string>();

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

          // 1b. Determine deterministic collision-safe event slug under transaction
          await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtext(${'rewind-slug:' + baseSlug}))`);

          const existingSlugs = new Set<string>();
          const matchingEvents = await tx
            .select({ id: schema.events.id })
            .from(schema.events)
            .where(or(eq(schema.events.id, baseSlug), ilike(schema.events.id, `${escapeIlikePattern(baseSlug)}-%`)));
          matchingEvents.forEach((e) => existingSlugs.add(e.id));
          store.events.forEach((e) => existingSlugs.add(e.id));

          let collisionIdx = 2;
          while (existingSlugs.has(eventSlug)) {
            eventSlug = `${baseSlug}-${collisionIdx++}`;
          }

          newClaims.forEach((c, idx) => {
            c.id = `clm-${eventSlug}-appr-${Date.now()}-${idx}`;
            c.eventId = eventSlug;
          });
          eventPeopleRows.forEach((ep, idx) => {
            ep.id = `ep-${eventSlug}-${idx}-${Date.now().toString(36).slice(-4)}`;
            ep.eventId = eventSlug;
          });

          // 2. Ensure source exists in schema.sources before linking
          if (sourceId) {
            const [existingSrc] = await tx
              .select({ id: schema.sources.id })
              .from(schema.sources)
              .where(eq(schema.sources.id, sourceId));
            if (!existingSrc) {
              throw new Error(`Archival source "${sourceId}" does not exist in schema.sources.`);
            }
          }

          // 3. Resolve or insert canonical place
          const basePlaceSlug = placeId.replace(/^plc-/, "");
          await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtext(${'rewind-place:' + basePlaceSlug}))`);

          const placeConditions = [
            ilike(schema.places.city, escapeIlikePattern(extractedCity)),
            ilike(schema.places.venue, escapeIlikePattern(extractedVenue)),
          ];
          if (extractedCountry && extractedCountry !== "International") {
            placeConditions.push(ilike(schema.places.country, escapeIlikePattern(extractedCountry)));
          }

          const matchingPlacesByVenueCity = extractedCity && extractedVenue
            ? await tx
                .select({ id: schema.places.id, city: schema.places.city, venue: schema.places.venue, country: schema.places.country })
                .from(schema.places)
                .where(and(...placeConditions))
            : [];

          const existingDbPlaceCandidate = matchingPlacesByVenueCity.length === 1 ? matchingPlacesByVenueCity[0] : null;
          const existingDbPlace =
            existingDbPlaceCandidate &&
            (existingDbPlaceCandidate.city || "unknown").toLowerCase() === (extractedCity || "unknown").toLowerCase() &&
            (existingDbPlaceCandidate.venue || "general").toLowerCase() === (extractedVenue || "general").toLowerCase() &&
            (existingDbPlaceCandidate.country || "international").toLowerCase() === (extractedCountry || "international").toLowerCase()
              ? existingDbPlaceCandidate
              : null;

          if (existingDbPlace) {
            resolvedPlaceId = existingDbPlace.id;
          } else {
            const existingPlaces = await tx
              .select({ id: schema.places.id, slug: schema.places.slug, city: schema.places.city, venue: schema.places.venue, country: schema.places.country })
              .from(schema.places)
              .where(
                or(
                  eq(schema.places.id, placeId),
                  ilike(schema.places.id, `${escapeIlikePattern(placeId)}-%`),
                  eq(schema.places.slug, basePlaceSlug),
                  ilike(schema.places.slug, `${escapeIlikePattern(basePlaceSlug)}-%`)
                )
              );

            const samePlace = existingPlaces.find(
              (p) =>
                (p.city || "unknown").toLowerCase() === (extractedCity || "unknown").toLowerCase() &&
                (p.venue || "general").toLowerCase() === (extractedVenue || "general").toLowerCase() &&
                (p.country || "international").toLowerCase() === (extractedCountry || "international").toLowerCase()
            );

            if (samePlace) {
              resolvedPlaceId = samePlace.id;
            } else {
              const usedIds = new Set(existingPlaces.map((p) => p.id));
              const usedSlugs = new Set(existingPlaces.map((p) => p.slug));

              let candidateSlug = basePlaceSlug;
              let candidateId = placeId;
              let suffixIdx = 2;

              while (usedIds.has(candidateId) || usedSlugs.has(candidateSlug)) {
                candidateSlug = `${basePlaceSlug}-${suffixIdx}`;
                candidateId = `plc-${candidateSlug}`;
                suffixIdx++;
              }

              resolvedPlaceId = candidateId;

              await tx
                .insert(schema.places)
                .values({
                  id: resolvedPlaceId,
                  slug: candidateSlug,
                  venue: extractedVenue,
                  city: extractedCity,
                  country: extractedCountry,
                  latitude: extractedLat,
                  longitude: extractedLng,
                  placeType: "venue",
                })
                .onConflictDoNothing();

              const [persistedPlace] = await tx
                .select({ id: schema.places.id })
                .from(schema.places)
                .where(eq(schema.places.id, resolvedPlaceId));

              if (persistedPlace) {
                resolvedPlaceId = persistedPlace.id;
              }
            }
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

          // 6. Persist approved candidate participants (Codex & Gemini: resolve person canonically and promote to published)
          if (eventPeopleRows.length > 0) {
            for (const ep of eventPeopleRows) {
              const canonicalPersonId = await resolvePersonEntityInTransaction(tx, {
                personId: ep.personId,
                rawName: ep.rawName || ep.personId.replace(/^p-/, ""),
                roleLabel: ep.roleLabel,
              });
              ep.personId = canonicalPersonId;
              if (ep.rawName) {
                resolvedParticipantMap.set(ep.rawName.toLowerCase().trim(), canonicalPersonId);
              }
              resolvedParticipantMap.set(ep.personId.toLowerCase().trim(), canonicalPersonId);
              const epRow = { ...ep };
              delete epRow.rawName;
              await tx.insert(schema.eventPeople).values(epRow);
            }
          }

          // 7. Insert claims with live database subject resolution (batched mention resolution)
          // 7. Insert claims with live database subject resolution (batched mention resolution)
          if (newClaims.length > 0) {
            // Deduplicate within newClaims batch by statement + claimedTime + subjectMention
            const seenClaims = new Set<string>();
            const dedupedNewClaims: typeof newClaims = [];
            for (const clm of newClaims) {
              const key = `${clm.statement.trim().toLowerCase()}::${clm.claimedTime || ""}::${(clm.subjectMention || clm.subjectId || "").trim().toLowerCase()}`;
              if (!seenClaims.has(key)) {
                seenClaims.add(key);
                dedupedNewClaims.push(clm);
              }
            }

            // Check against existing claims for this event
            const existingDbClaims = await tx
              .select({
                statement: schema.claims.statement,
                claimedTime: schema.claims.claimedTime,
                subjectId: schema.claims.subjectId,
              })
              .from(schema.claims)
              .where(eq(schema.claims.eventId, eventSlug));

            const existingClaimKeys = new Set(
              existingDbClaims.map(
                (c) => `${c.statement.trim().toLowerCase()}::${c.claimedTime || ""}::${(c.subjectId || "").trim().toLowerCase()}`
              )
            );

            const claimsToInsert = dedupedNewClaims.filter((clm) => {
              const key = `${clm.statement.trim().toLowerCase()}::${clm.claimedTime || ""}::${(clm.subjectId || "").trim().toLowerCase()}`;
              return !existingClaimKeys.has(key);
            });

            if (claimsToInsert.length > 0) {
              const distinctMentions = Array.from(
                new Set(
                  claimsToInsert
                    .filter((c) => !c.subjectId && c.subjectMention)
                    .map((c) => c.subjectMention!.trim())
                )
              );

              const mentionToSubjectMap = new Map<string, string | null>();

              if (distinctMentions.length > 0) {
                // ── 1. Bulk exact-slug lookup (one round-trip for all mentions) ──────────────
                const mentionToSlug = new Map<string, string>(
                  distinctMentions.map((m) => [m, m.toLowerCase().replace(/[^\w]/g, "-")])
                );
                const allSlugs = Array.from(mentionToSlug.values());
                const slugMatchedPeople = await tx
                  .select({ id: schema.people.id, slug: schema.people.slug })
                  .from(schema.people)
                  .where(inArray(schema.people.slug, allSlugs));
                const slugToPersonId = new Map(slugMatchedPeople.map((p) => [p.slug, p.id]));

                const unmatchedAfterSlug = distinctMentions.filter(
                  (m) => !slugToPersonId.has(mentionToSlug.get(m)!)
                );

                // ── 2. Bulk ILIKE lookup for unmatched names (one round-trip) ─────────────────
                let ilikeMatchedPeople: Array<{ id: string; canonicalName: string; displayName: string }> = [];
                if (unmatchedAfterSlug.length > 0) {
                  ilikeMatchedPeople = await tx
                    .select({ id: schema.people.id, canonicalName: schema.people.canonicalName, displayName: schema.people.displayName })
                    .from(schema.people)
                    .where(
                      or(
                        ...unmatchedAfterSlug.flatMap((m) => {
                          const escaped = escapeIlikePattern(m);
                          return [ilike(schema.people.canonicalName, escaped), ilike(schema.people.displayName, escaped)];
                        })
                      )
                    );
                }

                // Build mention → matched person IDs map (in-memory join)
                const mentionToIlikeIds = new Map<string, string[]>();
                for (const m of unmatchedAfterSlug) {
                  const mLower = m.toLowerCase();
                  const ids = Array.from(
                    new Set(
                      ilikeMatchedPeople
                        .filter((p) => p.canonicalName.toLowerCase() === mLower || p.displayName.toLowerCase() === mLower)
                        .map((p) => p.id)
                    )
                  );
                  mentionToIlikeIds.set(m, ids);
                }

                // Mentions still unresolved after ILIKE (zero matches; skip ambiguous multi-matches)
                const unmatchedForAlias = unmatchedAfterSlug.filter((m) => (mentionToIlikeIds.get(m) || []).length === 0);

                // ── 3. Bulk alias lookup for still-unmatched mentions (one round-trip) ─────────
                let aliasRows: Array<{ personId: string; alias: string }> = [];
                if (unmatchedForAlias.length > 0) {
                  aliasRows = await tx
                    .select({ personId: schema.personAliases.personId, alias: schema.personAliases.alias })
                    .from(schema.personAliases)
                    .where(
                      or(
                        ...unmatchedForAlias.flatMap((m) => {
                          const escaped = escapeIlikePattern(m);
                          return [ilike(schema.personAliases.alias, escaped), eq(schema.personAliases.alias, m)];
                        })
                      )
                    );
                }

                // ── Resolve each mention from the collected results ───────────────────────────
                for (const m of distinctMentions) {
                  const normalizedSlug = mentionToSlug.get(m)!;

                  // Priority 1: exact slug match
                  if (slugToPersonId.has(normalizedSlug)) {
                    mentionToSubjectMap.set(m, slugToPersonId.get(normalizedSlug)!);
                    continue;
                  }

                  // Priority 2: ILIKE name match (only when exactly one result)
                  const ilikeIds = mentionToIlikeIds.get(m) || [];
                  if (ilikeIds.length === 1) {
                    mentionToSubjectMap.set(m, ilikeIds[0]);
                    continue;
                  }
                  if (ilikeIds.length > 1) {
                    mentionToSubjectMap.set(m, null); // ambiguous
                    continue;
                  }

                  // Priority 3: alias match (only when exactly one person has this alias)
                  const mLower = m.toLowerCase();
                  const matchingAliases = aliasRows.filter((a) => a.alias.toLowerCase() === mLower || a.alias === m);
                  const distinctAliasPersonIds = Array.from(new Set(matchingAliases.map((a) => a.personId)));
                  mentionToSubjectMap.set(m, distinctAliasPersonIds.length === 1 ? distinctAliasPersonIds[0] : null);
                }
              }

              const dbClaims = claimsToInsert.map((clm) => {
                let resolvedDbSubjectId = clm.subjectId;
                if (!resolvedDbSubjectId && clm.subjectMention) {
                  resolvedDbSubjectId = mentionToSubjectMap.get(clm.subjectMention.trim()) ?? null;
                }
                const dbRow = { ...clm };
                delete dbRow.subjectMention;
                return {
                  ...dbRow,
                  subjectId: resolvedDbSubjectId,
                  subjectEntityType: resolvedDbSubjectId ? "person" : "event",
                  subjectEntityId: resolvedDbSubjectId || eventSlug,
                  claimStatus: dbRow.claimStatus || "PROVISIONAL",
                  epistemicClass: dbRow.epistemicClass || "unknown",
                };
              });
              await tx.insert(schema.claims).values(dbClaims);
              for (const c of dbClaims) {
                persistedClaimIds.add(c.id);
              }
              const claimEvidenceRows = dbClaims.map((c) => ({
                id: `evd-${c.id}`,
                claimId: c.id,
                sourceId: sourceId || "src-editorial-corroboration",
                evidenceForm: "direct-citation",
                evidenceStrength: null,
                directness: null,
                citationLocator: null,
                supportingExcerpt: c.supportingExcerpt || null,
                contradictsClaim: false,
              }));
              await tx.insert(schema.claimEvidence).values(claimEvidenceRows);
            }
          }

          // 8. Insert review decision
          await tx.insert(schema.reviewDecisions).values({
            candidateId,
            decision: "approved",
            decidedBy: editorName,
            notes: "Editorial review sign-off",
          });

          // 9. Persist audit log entry within the same database transaction (Finding #53)
          await recordAuditEventInTransaction(
            tx,
            "reviewed-approved",
            "REW-REV-MANUAL-SIGN-OFF",
            {
              candidateId,
              publishedEventId: eventSlug,
              approvedBy: editorName,
              sourceId,
              claimsAddedCount: persistedClaimIds.size,
            },
            eventSlug,
            candidateId
          );
        });
      } catch (err) {
        console.error("Live DB transaction failed on approveCandidate:", err);
        return { success: false, error: err instanceof Error ? err.message : "Database transaction failed" };
      }
    }

    if (!db) {
      let collisionIdx = 2;
      while (store.events.some((e) => e.id === eventSlug)) {
        eventSlug = `${baseSlug}-${collisionIdx++}`;
      }
      newClaims.forEach((c, idx) => {
        c.id = `clm-${eventSlug}-appr-${Date.now()}-${idx}`;
        c.eventId = eventSlug;
      });
      eventPeopleRows.forEach((ep, idx) => {
        ep.id = `ep-${eventSlug}-${idx}-${Date.now().toString(36).slice(-4)}`;
        ep.eventId = eventSlug;
      });
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
      participants: (Array.isArray(data.participants) ? data.participants : []).map((p: { name: string; role?: string; presenceMode?: string }) => {
        const canonicalId =
          resolvedParticipantMap.get(p.name?.toLowerCase().trim()) ||
          resolveEntity(p.name).personId ||
          createParticipantStubId(p.name);
        return {
          personId: canonicalId,
          name: p.name,
          role: p.role,
          presenceMode: p.presenceMode || "physical",
        };
      }),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const existingPlace = store.places.find((p) => p.id === resolvedPlaceId);
    if (!existingPlace) {
      store.places.push({
        id: resolvedPlaceId,
        slug: resolvedPlaceId.replace(/^plc-/, ""),
        venue: extractedVenue,
        city: extractedCity,
        country: extractedCountry,
        latitude: extractedLat,
        longitude: extractedLng,
        placeType: "venue",
      });
    }

    const claimsToSync = persistedClaimIds.size > 0
      ? newClaims.filter((clm) => persistedClaimIds.has(clm.id))
      : db ? [] : newClaims;

    claimsToSync.forEach((clm) => {
      const inMem = {
        id: clm.id,
        eventId: clm.eventId || null,
        sourceId: clm.sourceId || null,
        subjectId: clm.subjectId || null,
        subjectEntityType: clm.subjectId ? "person" : "event",
        subjectEntityId: clm.subjectId || eventSlug,
        claimType: clm.claimType,
        statement: clm.statement,
        claimedTime: clm.claimedTime || null,
        claimedVenue: clm.claimedVenue || null,
        confidence: clm.confidence || "limited",
        claimStatus: clm.claimStatus || (clm.confidence === "confirmed" ? "ESTABLISHED" : "PROVISIONAL"),
        epistemicClass: clm.epistemicClass || (clm.confidence === "confirmed" ? "documented fact" : "unknown"),
        supportingExcerpt: clm.supportingExcerpt || null,
      };
      if (!store.claims.some((c) => c.id === inMem.id)) {
        store.claims.push(inMem);
      }
    });

    const recordApprovalAudit = db ? recordAuditEventStoreOnly : recordAuditEvent;
    await recordApprovalAudit(
      "reviewed-approved",
      "REW-REV-MANUAL-SIGN-OFF",
      {
        candidateId,
        publishedEventId: eventSlug,
        approvedBy: editorName,
        sourceId,
        claimsAddedCount: persistedClaimIds.size > 0 ? persistedClaimIds.size : claimsToSync.length,
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
  const syncData = syncCandidate
    ? typeof syncCandidate.rawExtraction === "string"
      ? JSON.parse(syncCandidate.rawExtraction)
      : syncCandidate.rawExtraction
    : null;
  const syncSourceId = syncData?.sourceId;

  const syncFallback:
    | { success: false; error: string }
    | { success: true; targetEventId: string; claimsAddedCount: number } = !syncCandidate || !syncTarget
    ? { success: false, error: "Candidate or target event not found" }
    : syncCandidate.status !== "pending"
    ? { success: false, error: `Candidate is already ${syncCandidate.status} and cannot be merged` }
    : !syncSourceId || syncSourceId === "src-editorial-corroboration"
    ? {
        success: false,
        error: "Forensic Rigor Contract: Merging candidate requires a valid verifiable primary or secondary sourceId referencing an archival record (AGENTS.md contract)",
      }
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
    const sourceId = data?.sourceId;
    if (!sourceId || sourceId === "src-editorial-corroboration") {
      return {
        success: false,
        error: "Forensic Rigor Contract: Merging candidate requires a valid verifiable primary or secondary sourceId referencing an archival record (AGENTS.md contract)",
      };
    }

    const mergedParticipants: string[] = [];
    if (Array.isArray(data.participants)) {
      data.participants.forEach((p: { name: string }) => {
        const resolved = resolveEntity(p.name);
        if (resolved.canonicalName) {
          mergedParticipants.push(resolved.canonicalName);
        } else if (p.name) {
          mergedParticipants.push(p.name);
        }
      });
    }

    const claimsToInsert: Array<
      ReturnType<typeof getRelationalStore>["claims"][0] & { subjectMention?: string }
    > = [];
    const seenInMemory = new Set<string>();
    if (Array.isArray(data.claims)) {
      data.claims.forEach((clm: CandidateClaimInput, idx: number) => {
        const resolvedSubject = clm.subjectMention ? resolveEntity(clm.subjectMention) : null;
        const subjectId = resolvedSubject?.personId || null;
        const statement = clm.statement || "Corroborating claim";
        const stmtNorm = statement.trim().toLowerCase();
        const dedupeKey = `${subjectId || "none"}::${stmtNorm}`;

        const isDuplicateClaim = store.claims.some(
          (existing) =>
            existing.eventId === targetEventId &&
            existing.statement.toLowerCase().trim() === stmtNorm &&
            existing.subjectId === subjectId
        );

        if (!isDuplicateClaim && !seenInMemory.has(dedupeKey)) {
          seenInMemory.add(dedupeKey);
          claimsToInsert.push({
            id: `clm-${targetEventId}-mrg-${Date.now()}-${idx}`,
            eventId: targetEventId,
            subjectId,
            subjectEntityType: subjectId ? "person" : "event",
            subjectEntityId: subjectId || targetEventId,
            claimType: clm.claimType || "presence",
            statement,
            claimedTime: clm.claimedTime || null,
            claimedVenue: clm.claimedVenue || null,
            sourceId,
            confidence: clm.confidence && ["confirmed", "strong", "moderate", "limited", "disputed"].includes(clm.confidence) ? clm.confidence : "limited",
            claimStatus: clm.claimStatus || "PROVISIONAL",
            epistemicClass: clm.epistemicClass || "unknown",
            supportingExcerpt: clm.supportingExcerpt || null,
            subjectMention: clm.subjectMention,
          });
        }
      });
    }

    const resolvedParticipantMap = new Map<string, string>();

    const dbResult: { persistedClaimIds: string[] | null } = { persistedClaimIds: null };

    if (db) {
      try {
        await db.transaction(async (tx) => {
          // 1. Claim pending candidate atomically (Codex Issue 5)
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

          // Lock target event under transaction to serialize concurrent candidate merges
          await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtext(${targetEventId}))`);

          // 1. Ensure Source exists in DB
          if (sourceId) {
            const [existingSrc] = await tx
              .select({ id: schema.sources.id })
              .from(schema.sources)
              .where(eq(schema.sources.id, sourceId));
            if (!existingSrc) {
              throw new Error(`Archival source "${sourceId}" does not exist in schema.sources.`);
            }
          }

          // 2. Link Source to Event if not already linked
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

          // 3. Upsert participants from merged candidate into schema.eventPeople
          if (Array.isArray(data.participants)) {
            const participantConfidence = candidate.primarySourceTier === "tier-a" ? "confirmed" : "limited";
            for (let i = 0; i < data.participants.length; i++) {
              const p = data.participants[i];
              if (!p || !p.name) continue;
              const resolved = resolveEntity(p.name);
              const stubId = createParticipantStubId(p.name, resolved.personId);
              const personId = await resolvePersonEntityInTransaction(tx, {
                personId: stubId,
                rawName: p.name,
                roleLabel: p.role,
              });
              resolvedParticipantMap.set(p.name.toLowerCase().trim(), personId);

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
                  presenceConfidence: p.confidence && ["confirmed", "strong", "moderate", "limited", "disputed"].includes(p.confidence) ? p.confidence : participantConfidence,
                  roleConfidence: p.confidence && ["confirmed", "strong", "moderate", "limited", "disputed"].includes(p.confidence) ? p.confidence : participantConfidence,
                  attendanceMode: p.presenceMode || "physical",
                });
              }
            }
          }

          if (claimsToInsert.length > 0) {
            const distinctMentions = Array.from(
              new Set(
                claimsToInsert
                  .filter((c) => !c.subjectId && c.subjectMention)
                  .map((c) => c.subjectMention!.trim())
              )
            );

            const mentionToSubjectMap = new Map<string, string | null>();

            if (distinctMentions.length > 0) {
              // ── 1. Bulk exact-slug lookup (one round-trip for all mentions) ──────────────
              const mentionToSlug = new Map<string, string>(
                distinctMentions.map((m) => [m, m.toLowerCase().replace(/[^\w]/g, "-")])
              );
              const allSlugs = Array.from(mentionToSlug.values());
              const slugMatchedPeople = await tx
                .select({ id: schema.people.id, slug: schema.people.slug })
                .from(schema.people)
                .where(inArray(schema.people.slug, allSlugs));
              const slugToPersonId = new Map(slugMatchedPeople.map((p) => [p.slug, p.id]));

              const unmatchedAfterSlug = distinctMentions.filter(
                (m) => !slugToPersonId.has(mentionToSlug.get(m)!)
              );

              // ── 2. Bulk ILIKE lookup for unmatched names (one round-trip) ─────────────────
              let ilikeMatchedPeople: Array<{ id: string; canonicalName: string; displayName: string }> = [];
              if (unmatchedAfterSlug.length > 0) {
                ilikeMatchedPeople = await tx
                  .select({ id: schema.people.id, canonicalName: schema.people.canonicalName, displayName: schema.people.displayName })
                  .from(schema.people)
                  .where(
                    or(
                      ...unmatchedAfterSlug.flatMap((m) => {
                        const escaped = escapeIlikePattern(m);
                        return [ilike(schema.people.canonicalName, escaped), ilike(schema.people.displayName, escaped)];
                      })
                    )
                  );
              }

              // Build mention → matched person IDs map (in-memory join)
              const mentionToIlikeIds = new Map<string, string[]>();
              for (const m of unmatchedAfterSlug) {
                const mLower = m.toLowerCase();
                const ids = Array.from(
                  new Set(
                    ilikeMatchedPeople
                      .filter((p) => p.canonicalName.toLowerCase() === mLower || p.displayName.toLowerCase() === mLower)
                      .map((p) => p.id)
                  )
                );
                mentionToIlikeIds.set(m, ids);
              }

              // Mentions still unresolved after ILIKE (zero matches; skip ambiguous multi-matches)
              const unmatchedForAlias = unmatchedAfterSlug.filter((m) => (mentionToIlikeIds.get(m) || []).length === 0);

              // ── 3. Bulk alias lookup for still-unmatched mentions (one round-trip) ─────────
              let aliasRows: Array<{ personId: string; alias: string }> = [];
              if (unmatchedForAlias.length > 0) {
                aliasRows = await tx
                  .select({ personId: schema.personAliases.personId, alias: schema.personAliases.alias })
                  .from(schema.personAliases)
                  .where(
                    or(
                      ...unmatchedForAlias.flatMap((m) => {
                        const escaped = escapeIlikePattern(m);
                        return [ilike(schema.personAliases.alias, escaped), eq(schema.personAliases.alias, m)];
                      })
                    )
                  );
              }

              // ── Resolve each mention from the collected results ───────────────────────────
              for (const m of distinctMentions) {
                const normalizedSlug = mentionToSlug.get(m)!;

                // Priority 1: exact slug match
                if (slugToPersonId.has(normalizedSlug)) {
                  mentionToSubjectMap.set(m, slugToPersonId.get(normalizedSlug)!);
                  continue;
                }

                // Priority 2: ILIKE name match (only when exactly one result)
                const ilikeIds = mentionToIlikeIds.get(m) || [];
                if (ilikeIds.length === 1) {
                  mentionToSubjectMap.set(m, ilikeIds[0]);
                  continue;
                }
                if (ilikeIds.length > 1) {
                  mentionToSubjectMap.set(m, null); // ambiguous
                  continue;
                }

                // Priority 3: alias match (only when exactly one person has this alias)
                const mLower = m.toLowerCase();
                const matchingAliases = aliasRows.filter((a) => a.alias.toLowerCase() === mLower || a.alias === m);
                const distinctAliasPersonIds = Array.from(new Set(matchingAliases.map((a) => a.personId)));
                mentionToSubjectMap.set(m, distinctAliasPersonIds.length === 1 ? distinctAliasPersonIds[0] : null);
              }
            }

            const existingDbClaims = await tx
              .select({
                subjectId: schema.claims.subjectId,
                statement: schema.claims.statement,
              })
              .from(schema.claims)
              .where(eq(schema.claims.eventId, targetEventId));

            const resolvedDbClaims: Array<typeof schema.claims.$inferInsert> = [];
            const seenInBatch = new Set<string>();

            for (const clm of claimsToInsert) {
              let resolvedDbSubjectId = clm.subjectId;
              if (!resolvedDbSubjectId && clm.subjectMention) {
                resolvedDbSubjectId = mentionToSubjectMap.get(clm.subjectMention.trim()) ?? null;
              }

              clm.subjectId = resolvedDbSubjectId;
              const stmtNorm = clm.statement.trim().toLowerCase();
              const dedupeKey = `${resolvedDbSubjectId || "none"}::${stmtNorm}`;

              const isDbDuplicate = existingDbClaims.some(
                (ec) =>
                  ec.statement.trim().toLowerCase() === stmtNorm &&
                  ec.subjectId === resolvedDbSubjectId
              );

              if (!isDbDuplicate && !seenInBatch.has(dedupeKey)) {
                seenInBatch.add(dedupeKey);
                resolvedDbClaims.push({
                  id: clm.id,
                  eventId: clm.eventId,
                  subjectId: resolvedDbSubjectId,
                  subjectEntityType: resolvedDbSubjectId ? "person" : "event",
                  subjectEntityId: resolvedDbSubjectId || targetEventId,
                  claimType: clm.claimType,
                  statement: clm.statement,
                  claimedTime: clm.claimedTime,
                  claimedVenue: clm.claimedVenue,
                  sourceId: clm.sourceId,
                  confidence: clm.confidence,
                  claimStatus: clm.claimStatus || "PROVISIONAL",
                  epistemicClass: clm.epistemicClass || "unknown",
                  supportingExcerpt: clm.supportingExcerpt,
                });
              }
            }

            if (resolvedDbClaims.length > 0) {
              await tx.insert(schema.claims).values(resolvedDbClaims);
              dbResult.persistedClaimIds = resolvedDbClaims.map((c) => c.id!).filter(Boolean);
              const claimEvidenceRows = resolvedDbClaims.map((c) => ({
                id: `evd-${c.id}`,
                claimId: c.id!,
                sourceId: sourceId || "src-editorial-corroboration",
                evidenceForm: "direct-citation",
                evidenceStrength: null,
                directness: null,
                citationLocator: null,
                supportingExcerpt: c.supportingExcerpt || null,
                contradictsClaim: false,
              }));
              await tx.insert(schema.claimEvidence).values(claimEvidenceRows);
            } else {
              dbResult.persistedClaimIds = [];
            }
          }

          await tx.insert(schema.reviewDecisions).values({
            candidateId,
            decision: "merged",
            decidedBy: editorName,
            notes: `Merged into ${targetEventId}`,
          });

          await recordAuditEventInTransaction(
            tx,
            "reviewed-merged",
            "REW-REV-MANUAL-MERGE",
            {
              candidateId,
              targetEventId,
              mergedBy: editorName,
              sourceId,
              claimsAddedCount: dbResult.persistedClaimIds?.length ?? claimsToInsert.length,
              mergedParticipants,
              similarityScore: candidate.duplicateSimilarity,
            },
            targetEventId,
            candidateId
          );
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
    if (memTargetEvent) {
      if ("sourceIds" in memTargetEvent && Array.isArray((memTargetEvent as { sourceIds?: string[] }).sourceIds)) {
        const sIds = (memTargetEvent as { sourceIds: string[] }).sourceIds;
        if (!sIds.includes(sourceId)) {
          sIds.push(sourceId);
        }
      }
      if ("people" in memTargetEvent && Array.isArray((memTargetEvent as { people?: string[] }).people)) {
        const peopleList = (memTargetEvent as { people: string[] }).people;
        mergedParticipants.forEach((p) => {
          if (!peopleList.includes(p)) {
            peopleList.push(p);
          }
        });
      }
      if (!Array.isArray(memTargetEvent.participants)) {
        memTargetEvent.participants = [];
      }
      if (Array.isArray(data.participants)) {
        data.participants.forEach((p: { name: string; role?: string; presenceMode?: string }) => {
          const resolved = resolveEntity(p.name);
          const pId =
            resolvedParticipantMap.get(p.name.toLowerCase().trim()) ||
            resolved.personId ||
            createParticipantStubId(p.name);
          if (!memTargetEvent.participants!.some((ep) => ep.personId === pId || (ep.name && ep.name.toLowerCase() === p.name.toLowerCase()))) {
            memTargetEvent.participants!.push({
              personId: pId,
              name: p.name,
              role: p.role,
              presenceMode: p.presenceMode || "physical",
            });
          }
        });
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

    const persistedIds = dbResult.persistedClaimIds;
    const claimsToSync = persistedIds !== null
      ? claimsToInsert.filter((c) => persistedIds.includes(c.id))
      : claimsToInsert;

    claimsToSync.forEach((c) => {
      const inMem = { ...c };
      delete inMem.subjectMention;
      store.claims.push(inMem);
    });

    const actualAddedCount = persistedIds !== null ? persistedIds.length : claimsToInsert.length;

    const recordMergeAudit = db ? recordAuditEventStoreOnly : recordAuditEvent;
    await recordMergeAudit(
      "reviewed-merged",
      "REW-REV-MANUAL-MERGE",
      {
        candidateId,
        targetEventId,
        mergedBy: editorName,
        sourceId,
        claimsAddedCount: actualAddedCount,
        mergedParticipants,
        similarityScore: candidate.duplicateSimilarity,
      },
      targetEventId,
      candidateId
    );

    if (syncFallback.success) {
      syncFallback.claimsAddedCount = actualAddedCount;
    }
    return { success: true, targetEventId, claimsAddedCount: actualAddedCount };
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

          await recordAuditEventInTransaction(
            tx,
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

    const recordRejectionAudit = db ? recordAuditEventStoreOnly : recordAuditEvent;
    await recordRejectionAudit(
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
