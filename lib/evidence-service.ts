import { createHash } from "node:crypto";
import { getRelationalStore, getDb } from "@/lib/db/client";
import * as schema from "@/db/schema";
import { eq, desc, count, or, and, ilike, inArray } from "drizzle-orm";
import { recordAuditEvent } from "@/lib/ingestion/audit";
import { resolveEntity, createParticipantStubId, resolvePersonEntityInTransaction } from "@/lib/ingestion/resolve";
import { findDuplicateEvent, findDuplicateEventAsync, tokenSimilarity } from "@/lib/ingestion/deduplicate";
import { deriveEventSlug } from "@/lib/ingestion/pipeline";
import type { ExtractedCandidateEvent } from "@/lib/ingestion/types";

export interface EvidenceStats {
  publishedEventsCount: number;
  verifiedClaimsCount: number;
  primarySourcesCount: number;
  pendingReviewCount: number;
  autoPublishedCount: number;
}

export interface CandidateClaimInput {
  subjectMention?: string;
  claimType?: string;
  statement?: string;
  claimedTime?: string;
  claimedVenue?: string;
  supportingExcerpt?: string;
  confidence?: "confirmed" | "supported" | "reported" | "limited" | "disputed";
}

export interface CandidateParticipantInput {
  name: string;
  role?: string;
  involvementType?: string;
  presenceMode?: string;
  presenceConfidence?: string;
  roleConfidence?: string;
}

export interface CandidateExtractionPayload {
  title?: string;
  summary?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  temporalPrecision?: string;
  venue?: string;
  city?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  eventType?: string;
  sourceId?: string;
  sourceTitle?: string;
  publisher?: string;
  sourceType?: string;
  url?: string;
  claims?: CandidateClaimInput[];
  participants?: CandidateParticipantInput[];
  quotes?: Array<{ speaker: string; quote: string; context?: string }>;
}

/** Parses a candidate extraction payload from serialized or object input. */
export function parseCandidatePayload(raw: unknown): CandidateExtractionPayload | null {
  if (!raw) return null;
  let parsed: unknown = raw;
  if (typeof raw === "string") {
    try {
      parsed = JSON.parse(raw);
    } catch {
      return null;
    }
  }
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    return null;
  }
  const obj = parsed as Record<string, unknown>;

  // Validate participants array if present
  let participants: CandidateParticipantInput[] | undefined;
  if (Array.isArray(obj.participants)) {
    participants = [];
    for (const p of obj.participants) {
      if (typeof p === "object" && p !== null && !Array.isArray(p)) {
        const pObj = p as Record<string, unknown>;
        if (typeof pObj.name === "string" && pObj.name.trim()) {
          participants.push({
            name: pObj.name.trim(),
            role: typeof pObj.role === "string" ? pObj.role : undefined,
            involvementType: typeof pObj.involvementType === "string" ? pObj.involvementType : undefined,
            presenceMode: typeof pObj.presenceMode === "string" ? pObj.presenceMode : undefined,
            presenceConfidence: typeof pObj.presenceConfidence === "string" ? pObj.presenceConfidence : undefined,
            roleConfidence: typeof pObj.roleConfidence === "string" ? pObj.roleConfidence : undefined,
          });
        }
      }
    }
  }

  // Validate claims array if present
  let claims: CandidateClaimInput[] | undefined;
  if (Array.isArray(obj.claims)) {
    claims = [];
    for (const c of obj.claims) {
      if (typeof c === "object" && c !== null && !Array.isArray(c)) {
        const cObj = c as Record<string, unknown>;
        const rawConf = typeof cObj.confidence === "string" ? cObj.confidence : undefined;
        const validConf =
          rawConf === "confirmed" ||
          rawConf === "supported" ||
          rawConf === "reported" ||
          rawConf === "limited" ||
          rawConf === "disputed"
            ? rawConf
            : undefined;
        claims.push({
          subjectMention: typeof cObj.subjectMention === "string" ? cObj.subjectMention : undefined,
          claimType: typeof cObj.claimType === "string" ? cObj.claimType : undefined,
          statement: typeof cObj.statement === "string" ? cObj.statement : undefined,
          claimedTime: typeof cObj.claimedTime === "string" ? cObj.claimedTime : undefined,
          claimedVenue: typeof cObj.claimedVenue === "string" ? cObj.claimedVenue : undefined,
          supportingExcerpt: typeof cObj.supportingExcerpt === "string" ? cObj.supportingExcerpt : undefined,
          confidence: validConf,
        });
      }
    }
  }

  // Validate quotes array if present
  let quotes: Array<{ speaker: string; quote: string; context?: string }> | undefined;
  if (Array.isArray(obj.quotes)) {
    quotes = [];
    for (const q of obj.quotes) {
      if (typeof q === "object" && q !== null && !Array.isArray(q)) {
        const qObj = q as Record<string, unknown>;
        if (typeof qObj.speaker === "string" && typeof qObj.quote === "string") {
          quotes.push({
            speaker: qObj.speaker,
            quote: qObj.quote,
            context: typeof qObj.context === "string" ? qObj.context : undefined,
          });
        }
      }
    }
  }

  return {
    title: typeof obj.title === "string" ? obj.title : undefined,
    summary: typeof obj.summary === "string" ? obj.summary : undefined,
    description: typeof obj.description === "string" ? obj.description : undefined,
    startDate: typeof obj.startDate === "string" ? obj.startDate : undefined,
    endDate: typeof obj.endDate === "string" ? obj.endDate : undefined,
    temporalPrecision: typeof obj.temporalPrecision === "string" ? obj.temporalPrecision : undefined,
    venue: typeof obj.venue === "string" ? obj.venue : undefined,
    city: typeof obj.city === "string" ? obj.city : undefined,
    country: typeof obj.country === "string" ? obj.country : undefined,
    latitude: typeof obj.latitude === "number" ? obj.latitude : undefined,
    longitude: typeof obj.longitude === "number" ? obj.longitude : undefined,
    eventType: typeof obj.eventType === "string" ? obj.eventType : undefined,
    sourceId: typeof obj.sourceId === "string" ? obj.sourceId : undefined,
    sourceTitle: typeof obj.sourceTitle === "string" ? obj.sourceTitle : undefined,
    publisher: typeof obj.publisher === "string" ? obj.publisher : undefined,
    sourceType: typeof obj.sourceType === "string" ? obj.sourceType : undefined,
    url: typeof obj.url === "string" ? obj.url : undefined,
    claims,
    participants,
    quotes,
  };
}

/** Builds a deterministic claim identifier from its event, subject, statement, and source. */
function createClaimId(
  eventSlug: string,
  subjectMentionOrId: string | null | undefined,
  statement: string,
  sourceId: string,
  idx: number
): string {
  const normStmt = statement.trim().toLowerCase();
  const subj = (subjectMentionOrId || "none").trim().toLowerCase();
  const hash = createHash("sha256")
    .update(`${eventSlug}::${subj}::${normStmt}::${sourceId}`)
    .digest("hex")
    .slice(0, 8);
  return `clm-${eventSlug}-${hash}-${idx}`;
}

/** Escapes PostgreSQL ILIKE wildcard characters for literal matching. */
function escapeIlikePattern(str: string): string {
  return str.replace(/[\\%_]/g, "\\$&");
}

/** Returns current evidence-review statistics from PostgreSQL or the local fallback store. */
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

  return {
    publishedEventsCount: published.length,
    verifiedClaimsCount: store.claims.length,
    primarySourcesCount: primarySources.length,
    pendingReviewCount: pending.length,
    autoPublishedCount: autoPublished.length,
  };
}

/** Returns evidence candidates ordered for editorial review. */
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

/** Resolves a candidate from PostgreSQL, falling back to the in-memory store. */
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

/** Approves a pending candidate and persists its event, participants, claims, and sources. */
export function approveCandidate(candidateId: string, editorName = "Senior Historical Editor") {
  const store = getRelationalStore();
  const db = getDb();

  const syncCandidate = store.candidateEvents.find((c) => c.id === candidateId);
  const syncData = parseCandidatePayload(syncCandidate?.rawExtraction);
  const syncSourceId = syncData?.sourceId;
  const syncDate = (syncCandidate?.suggestedDate || syncData?.startDate || "").trim();

  const syncFallback: { success: boolean; eventId?: string; persistedClaimIds?: string[]; error?: string } = !syncCandidate
    ? { success: false, error: "Candidate not found" }
    : syncCandidate.status !== "pending"
    ? { success: false, error: `Candidate is already ${syncCandidate.status} and cannot be approved again` }
    : !syncSourceId || syncSourceId === "src-editorial-approval"
    ? {
        success: false,
        error: "Forensic Rigor Contract: Candidate approval requires a valid verifiable primary or secondary sourceId referencing an archival record (AGENTS.md contract)",
      }
    : !syncDate
    ? {
        success: false,
        error: "Forensic Rigor Contract: Candidate approval requires an established historical date (startDate or suggestedDate). Cannot approve records with missing dates.",
      }
    : { success: true, eventId: `evt-${syncDate.slice(0, 10)}-cand-sync` };

  const executionPromise = (async () => {
    const candidate = await resolveCandidateRecord(candidateId, store, db);
    if (!candidate) return { success: false, error: "Candidate not found" };

    if (candidate.status !== "pending") {
      return {
        success: false,
        error: `Candidate is already ${candidate.status} and cannot be approved again`,
      };
    }

    const data = parseCandidatePayload(candidate.rawExtraction) || {};
    const sourceId = data.sourceId;
    if (!sourceId || sourceId === "src-editorial-approval") {
      return {
        success: false,
        error: "Forensic Rigor Contract: Candidate approval requires a valid verifiable primary or secondary sourceId referencing an archival record (AGENTS.md contract)",
      };
    }

    const title = candidate.suggestedTitle || data.title || "Approved Event";
    const rawDate = (candidate.suggestedDate || data.startDate || "").trim();
    if (!rawDate) {
      return {
        success: false,
        error: "Forensic Rigor Contract: Candidate approval requires an established historical date (startDate or suggestedDate). Cannot approve records with missing dates.",
      };
    }
    const startDate = rawDate;
    const eventType = data.eventType || "historical-action";
    const venue = data.venue || candidate.suggestedPlace || "Unspecified Location";
    const city = data.city || candidate.suggestedPlace || "Unknown City";
    const country = data.country || "International";

    // 1. Resolve participants
    let candidateParticipants: CandidateParticipantInput[] = [];
    if (Array.isArray(data.participants) && data.participants.length > 0) {
      candidateParticipants = data.participants;
    } else if (candidate.suggestedParticipants) {
      try {
        const parsedP = JSON.parse(candidate.suggestedParticipants);
        if (Array.isArray(parsedP)) candidateParticipants = parsedP;
      } catch {}
    }

    const resolvedEntities = candidateParticipants.map((p) => resolveEntity(p.name));
    const resolvedParticipantIds = resolvedEntities
      .map((r) => r.personId)
      .filter((id): id is string => id !== null);

    // 2. Deduplication check against published records
    const rawTemporal = data.temporalPrecision;
    const temporalPrecision: ExtractedCandidateEvent["temporalPrecision"] =
      rawTemporal === "exact-minute" ||
      rawTemporal === "exact-day" ||
      rawTemporal === "month" ||
      rawTemporal === "year" ||
      rawTemporal === "decade"
        ? rawTemporal
        : "exact-day";

    const allowedEventTypes: ReadonlyArray<ExtractedCandidateEvent["eventType"]> = [
      "bilateral-meeting",
      "multilateral-summit",
      "speech-plenary",
      "press-conference",
      "interview",
      "official-visit",
      "signing-ceremony",
      "parliamentary-debate",
      "historical-action",
    ];
    const validatedEventType: ExtractedCandidateEvent["eventType"] = allowedEventTypes.includes(
      eventType as ExtractedCandidateEvent["eventType"]
    )
      ? (eventType as ExtractedCandidateEvent["eventType"])
      : "historical-action";

    const candidateEventObj: ExtractedCandidateEvent = {
      title,
      summary: data.summary && data.summary.length >= 10 ? data.summary : title.length >= 10 ? title : `${title} - historical record`,
      description: data.description,
      startDate,
      endDate: data.endDate,
      temporalPrecision,
      venue,
      city,
      country,
      latitude: data.latitude,
      longitude: data.longitude,
      eventType: validatedEventType,
      participants: candidateParticipants.map((p) => ({
        name: p.name,
        role:
          p.role === "principal" || p.role === "co-principal" || p.role === "secondary" || p.role === "attendee"
            ? p.role
            : "attendee",
        presenceMode:
          p.presenceMode === "physical" ||
          p.presenceMode === "remote-live" ||
          p.presenceMode === "remote-recorded" ||
          p.presenceMode === "telephone" ||
          p.presenceMode === "written"
            ? p.presenceMode
            : "physical",
      })),
      claims: (data.claims || []).map((c) => {
        const ct = c.claimType;
        const validatedClaimType =
          ct === "presence" || ct === "start-time" || ct === "statement-quote" || ct === "agreement" || ct === "action"
            ? ct
            : "presence";
        return {
          subjectMention: c.subjectMention || title,
          claimType: validatedClaimType,
          statement: c.statement || title,
          claimedTime: c.claimedTime,
          claimedVenue: c.claimedVenue,
          supportingExcerpt: c.supportingExcerpt,
        };
      }),
      quotes: (data.quotes || []).map((q) => ({
        speaker: q.speaker,
        quote: q.quote,
        context: q.context,
      })),
      hasSensitiveLegalMatters: false,
      involvesLivingPersonPrivateMovement: false,
      involvesMinors: false,
    };

    let deduplicationMatch = findDuplicateEvent(candidateEventObj);
    if (db) {
      try {
        const dbDup = await findDuplicateEventAsync(candidateEventObj, db);
        if (dbDup.isDuplicate) {
          deduplicationMatch = dbDup;
        }
      } catch (err) {
        console.warn("Error running async deduplication check in approveCandidate:", err);
      }
    }

    const baseSlug = deriveEventSlug(
      startDate,
      resolvedParticipantIds,
      validatedEventType,
      city,
      title
    );

    let eventSlug = baseSlug;
    if (deduplicationMatch.isDuplicate && deduplicationMatch.matchedEventId) {
      eventSlug = deduplicationMatch.matchedEventId;
    } else if (!db) {
      let memSlug = baseSlug;
      let collisionIdx = 2;
      while (store.events.some((e) => e.id === memSlug)) {
        memSlug = `${baseSlug}-${collisionIdx++}`;
      }
      eventSlug = memSlug;
    }

    const placeId = `plc-${venue ? venue.toLowerCase().replace(/[^\w]/g, "-").slice(0, 24) : "unspecified"}`;

    const newClaims: Array<
      ReturnType<typeof getRelationalStore>["claims"][0] & { subjectMention?: string }
    > = [];
    if (Array.isArray(data.claims)) {
      data.claims.forEach((clm, idx) => {
        const resolvedSubject = clm.subjectMention ? resolveEntity(clm.subjectMention) : null;
        const claimId = createClaimId(eventSlug, resolvedSubject?.personId || clm.subjectMention, clm.statement || title, sourceId, idx);
        newClaims.push({
          id: claimId,
          eventId: eventSlug,
          subjectId: resolvedSubject?.personId || null,
          claimType: clm.claimType || "presence",
          statement: clm.statement || `${candidate.suggestedTitle} verified by editorial review`,
          claimedTime: clm.claimedTime || candidate.suggestedDate,
          claimedVenue: clm.claimedVenue || candidate.suggestedPlace || null,
          sourceId,
          confidence: clm.confidence || "limited",
          supportingExcerpt: clm.supportingExcerpt || data.summary || null,
          subjectMention: clm.subjectMention,
        });
      });
    }

    const eventPeopleRows: Array<typeof schema.eventPeople.$inferInsert & { rawName?: string }> = [];
    candidateParticipants.forEach((p, idx) => {
      const resolved = resolveEntity(p.name);
      const personId = createParticipantStubId(p.name, resolved.personId);
      const epHash = createHash("sha256").update(`${eventSlug}::${personId}`).digest("hex").slice(0, 6);
      eventPeopleRows.push({
        id: `ep-${eventSlug}-${epHash}-${idx}`,
        eventId: eventSlug,
        personId,
        involvementType: p.involvementType || "attendee",
        roleLabel: p.role || "participant",
        presenceConfidence: p.presenceConfidence || "limited",
        roleConfidence: p.roleConfidence || "limited",
        attendanceMode: p.presenceMode || "physical",
        rawName: p.name,
      });
    });

    let resolvedPlaceId = placeId;
    const persistedClaimIds: string[] = [];

    if (db) {
      try {
        await db.transaction(async (tx) => {
          // 1. Claim pending candidate atomically
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
                title: data.sourceTitle || `Source for ${candidate.suggestedTitle}`,
                publisher: data.publisher || "Archival Source",
                sourceType: data.sourceType || "official-transcript",
                tier: candidate.primarySourceTier === "tier-a" ? "tier-a" : "tier-b",
                url: data.url || null,
              });
            }
          }

          // 3. Resolve or insert canonical place
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
              venue: venue,
              city: city,
              country: country,
              latitude: data.latitude ?? null,
              longitude: data.longitude ?? null,
              placeType: "venue",
            });
          }

          // 4. Deterministic collision suffixing if baseSlug is taken by a distinct event
          if (!deduplicationMatch.isDuplicate) {
            let [existingDbEvent] = await tx
              .select({ id: schema.events.id, title: schema.events.title })
              .from(schema.events)
              .where(eq(schema.events.id, eventSlug));

            if (existingDbEvent) {
              const titleSim = tokenSimilarity(title, existingDbEvent.title);
              const isMatch = titleSim >= 0.3 || title.toLowerCase().trim() === existingDbEvent.title.toLowerCase().trim();
              if (!isMatch) {
                let collisionIdx = 2;
                while (existingDbEvent) {
                  eventSlug = `${baseSlug}-${collisionIdx++}`;
                  [existingDbEvent] = await tx
                    .select({ id: schema.events.id, title: schema.events.title })
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
                eventType: validatedEventType,
                title,
                summary: data.summary || title,
                description: data.description || null,
                startDate,
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
            }
          }

          // 5. Insert evidence link before commit
          const [existingEventSource] = await tx
            .select({ eventId: schema.eventSources.eventId })
            .from(schema.eventSources)
            .where(
              and(
                eq(schema.eventSources.eventId, eventSlug),
                eq(schema.eventSources.sourceId, sourceId)
              )
            );
          if (!existingEventSource) {
            await tx.insert(schema.eventSources).values({
              eventId: eventSlug,
              sourceId,
              isPrimary: true,
            });
          }

          // 6. Persist approved candidate participants
          if (eventPeopleRows.length > 0) {
            for (const ep of eventPeopleRows) {
              ep.eventId = eventSlug;
              const canonicalPersonId = await resolvePersonEntityInTransaction(tx, {
                personId: ep.personId,
                rawName: ep.rawName || ep.personId.replace(/^p-/, ""),
                roleLabel: ep.roleLabel,
              });
              ep.personId = canonicalPersonId;
              const epRow = { ...ep };
              delete epRow.rawName;
              const [existingEp] = await tx
                .select({ id: schema.eventPeople.id })
                .from(schema.eventPeople)
                .where(
                  and(
                    eq(schema.eventPeople.eventId, eventSlug),
                    eq(schema.eventPeople.personId, canonicalPersonId)
                  )
                );
              if (!existingEp) {
                await tx.insert(schema.eventPeople).values(epRow).onConflictDoNothing();
              }
            }
          }

          // 7. Insert claims with live database subject resolution & claim deduplication
          if (newClaims.length > 0) {
            newClaims.forEach((c) => {
              c.eventId = eventSlug;
            });
            const distinctMentions = Array.from(
              new Set(
                newClaims
                  .filter((c) => !c.subjectId && c.subjectMention)
                  .map((c) => c.subjectMention!.trim())
              )
            );

            const mentionToSubjectMap = new Map<string, string | null>();

            if (distinctMentions.length > 0) {
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

              const unmatchedForAlias = unmatchedAfterSlug.filter((m) => (mentionToIlikeIds.get(m) || []).length === 0);

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

              for (const m of distinctMentions) {
                const normalizedSlug = mentionToSlug.get(m)!;
                if (slugToPersonId.has(normalizedSlug)) {
                  mentionToSubjectMap.set(m, slugToPersonId.get(normalizedSlug)!);
                  continue;
                }
                const ilikeIds = mentionToIlikeIds.get(m) || [];
                if (ilikeIds.length === 1) {
                  mentionToSubjectMap.set(m, ilikeIds[0]);
                  continue;
                }
                if (ilikeIds.length > 1) {
                  mentionToSubjectMap.set(m, null);
                  continue;
                }
                const mLower = m.toLowerCase();
                const matchingAliases = aliasRows.filter((a) => a.alias.toLowerCase() === mLower || a.alias === m);
                const distinctAliasPersonIds = Array.from(new Set(matchingAliases.map((a) => a.personId)));
                mentionToSubjectMap.set(m, distinctAliasPersonIds.length === 1 ? distinctAliasPersonIds[0] : null);
              }
            }

            const dbClaims = newClaims.map((clm) => {
              let resolvedDbSubjectId = clm.subjectId;
              if (!resolvedDbSubjectId && clm.subjectMention) {
                resolvedDbSubjectId = mentionToSubjectMap.get(clm.subjectMention.trim()) ?? null;
              }
              clm.subjectId = resolvedDbSubjectId;
              const dbRow = { ...clm };
              delete dbRow.subjectMention;
              return {
                ...dbRow,
                subjectId: resolvedDbSubjectId,
              };
            });

            // Prevent duplicate claim insertions via persistedClaimIds verification
            const existingDbClaims = await tx
              .select({ id: schema.claims.id })
              .from(schema.claims)
              .where(eq(schema.claims.eventId, eventSlug));
            const existingClaimIdSet = new Set(existingDbClaims.map((c) => c.id));

            const claimsToInsert = dbClaims.filter((c) => !existingClaimIdSet.has(c.id));
            if (claimsToInsert.length > 0) {
              await tx.insert(schema.claims).values(claimsToInsert);
            }
            persistedClaimIds.push(...dbClaims.map((c) => c.id));
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

    // In-memory store updates
    const memCand = store.candidateEvents.find((c) => c.id === candidateId);
    if (memCand) {
      memCand.status = "approved";
    }
    candidate.status = "approved";

    // Deduplicate in-memory events if not already present
    if (deduplicationMatch.isDuplicate && deduplicationMatch.matchedEventId) {
      const canonicalId = deduplicationMatch.matchedEventId;
      eventSlug = canonicalId;
      if (!store.events.some((e) => e.id === canonicalId)) {
        if (db) {
          try {
            const [dbEvt] = await db.select().from(schema.events).where(eq(schema.events.id, canonicalId));
            if (dbEvt) {
              store.events.unshift({
                ...dbEvt,
                createdAt: new Date(),
                updatedAt: new Date(),
              });
            }
          } catch (err) {
            console.warn("Failed to hydrate canonical DB event into store:", err);
          }
        }
      }
    } else if (!store.events.some((e) => e.id === eventSlug)) {
      let memSlug = eventSlug;
      let collisionIdx = 2;
      while (store.events.some((e) => e.id === memSlug)) {
        memSlug = `${eventSlug}-${collisionIdx++}`;
      }
      eventSlug = memSlug;

      store.events.unshift({
        id: eventSlug,
        slug: eventSlug,
        parentId: null,
        eventType: validatedEventType,
        title,
        summary: data.summary || title,
        description: data.description || null,
        startDate,
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
    }

    const canonicalEventPresent = store.events.some((e) => e.id === eventSlug);

    const existingPlace = store.places.find((p) => p.id === resolvedPlaceId);
    if (!existingPlace) {
      store.places.push({
        id: resolvedPlaceId,
        slug: resolvedPlaceId.replace(/^plc-/, ""),
        venue,
        city,
        country,
        latitude: data.latitude ?? null,
        longitude: data.longitude ?? null,
        placeType: "venue",
      });
    }

    if (canonicalEventPresent) {
      newClaims.forEach((clm) => {
        clm.eventId = eventSlug;
        const inMem = { ...clm };
        delete inMem.subjectMention;
        if (!store.claims.some((c) => c.id === inMem.id)) {
          store.claims.push(inMem);
        }
        if (!persistedClaimIds.includes(inMem.id)) {
          persistedClaimIds.push(inMem.id);
        }
      });
    }

    await recordAuditEvent(
      "reviewed-approved",
      "REW-REV-MANUAL-SIGN-OFF",
      {
        candidateId,
        publishedEventId: eventSlug,
        approvedBy: editorName,
        sourceId,
        claimsAddedCount: newClaims.length,
        persistedClaimIds,
      },
      eventSlug,
      candidateId
    );

    syncFallback.eventId = eventSlug;
    syncFallback.persistedClaimIds = persistedClaimIds;
    return { success: true, eventId: eventSlug, persistedClaimIds };
  })();

  return asAsyncResult(executionPromise, syncFallback);
}

/** Merges a pending candidate's evidence into an existing canonical event. */
export function mergeCandidate(candidateId: string, targetEventId: string, editorName = "Senior Historical Editor") {
  const store = getRelationalStore();
  const db = getDb();

  const syncCandidate = store.candidateEvents.find((c) => c.id === candidateId);
  const syncTarget = store.events.find((e) => e.id === targetEventId);
  const syncData = parseCandidatePayload(syncCandidate?.rawExtraction);
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

    const data = parseCandidatePayload(candidate.rawExtraction) || {};
    const sourceId = data.sourceId;
    if (!sourceId || sourceId === "src-editorial-corroboration") {
      return {
        success: false,
        error: "Forensic Rigor Contract: Merging candidate requires a valid verifiable primary or secondary sourceId referencing an archival record (AGENTS.md contract)",
      };
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
          const claimId = createClaimId(targetEventId, subjectId || clm.subjectMention, statement, sourceId, idx);
          claimsToInsert.push({
            id: claimId,
            eventId: targetEventId,
            subjectId,
            claimType: clm.claimType || "presence",
            statement,
            claimedTime: clm.claimedTime || null,
            claimedVenue: clm.claimedVenue || null,
            sourceId,
            confidence: clm.confidence || "limited",
            supportingExcerpt: clm.supportingExcerpt || null,
            subjectMention: clm.subjectMention,
          });
        }
      });
    }

    const dbResult: { persistedClaimIds: string[] | null } = { persistedClaimIds: null };

    if (db) {
      try {
        // targetEvent already resolved above (lines 617-623); no second lookup needed.

        await db.transaction(async (tx) => {
          // Atomically update candidate status inside database transaction (Codex Issue)
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

          // 1. Ensure Source exists in DB
          const [existingSrc] = await tx
            .select({ id: schema.sources.id })
            .from(schema.sources)
            .where(eq(schema.sources.id, sourceId));
          if (!existingSrc) {
            await tx.insert(schema.sources).values({
              id: sourceId,
              title: data.sourceTitle || `Corroborating Source: ${candidate.suggestedTitle}`,
              publisher: data.publisher || "Archival Source",
              sourceType: data.sourceType || "official-transcript",
              tier: candidate.primarySourceTier === "tier-a" ? "tier-a" : "tier-b",
              url: data.url || null,
              archiveUrl: null,
              author: null,
              publicationDate: candidate.suggestedDate,
              trustScore: candidate.primarySourceTier === "tier-a" ? 1.0 : 0.9,
            });
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
                  claimType: clm.claimType,
                  statement: clm.statement,
                  claimedTime: clm.claimedTime,
                  claimedVenue: clm.claimedVenue,
                  sourceId: clm.sourceId,
                  confidence: clm.confidence,
                  supportingExcerpt: clm.supportingExcerpt,
                });
              }
            }

            if (resolvedDbClaims.length > 0) {
              await tx.insert(schema.claims).values(resolvedDbClaims);
              dbResult.persistedClaimIds = resolvedDbClaims.map((c) => c.id!).filter(Boolean);
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

    const mergedParticipants: string[] = [];
    if (Array.isArray(data.participants)) {
      data.participants.forEach((p: { name: string; role?: string }) => {
        const res = resolveEntity(p.name);
        if (res.canonicalName) {
          mergedParticipants.push(res.canonicalName);
        }
      });
    }

    await recordAuditEvent(
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

/** Rejects a pending evidence candidate and records the editorial decision. */
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

    await recordAuditEvent(
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
