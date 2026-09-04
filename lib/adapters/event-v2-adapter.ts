import type { EventRecord, Confidence, Precision } from "@/lib/rewind";
import type {
  EventEditorialControls,
  EventFactualFlags,
  EventPerson,
  EventV2,
  InvolvementType,
  LocationPrecisionV2,
  LocationType,
  VisibilityLevel,
} from "../models/event-v2";

/**
 * Cleanly maps legacy 4-tier location precision to Event Model v2 14-tier precision.
 */
export function mapLegacyLocationPrecision(
  prec?: "venue" | "city" | "country" | "unknown" | string
): LocationPrecisionV2 {
  switch (prec) {
    case "venue":
      return "building";
    case "city":
      return "city";
    case "country":
      return "country";
    default:
      return "unknown";
  }
}

/**
 * Derives a neutral canonical event title from legacy person-centric titles.
 */
export function deriveCanonicalTitle(legacyName: string, venueName?: string | null): string {
  // Known high-profile historical renames
  if (legacyName.includes("Presents credentials")) {
    return "Presentation of Credentials — Permanent Representative of Israel to the United Nations";
  }
  if (legacyName.includes("Holds press conference at UN")) {
    return "United Nations Press Conference — Permanent Representative of Israel";
  }
  if (legacyName.includes("meeting with Menachem Mendel Schneerson")) {
    return "Benjamin Netanyahu and Menachem Mendel Schneerson — Meeting at 770 Eastern Parkway";
  }
  if (legacyName.includes("Addresses the General Assembly on the Middle East")) {
    return "United Nations General Assembly — Situation in the Middle East";
  }
  if (legacyName.includes("Addresses the General Assembly on the question of Palestine")) {
    return "United Nations General Assembly — Question of Palestine";
  }
  if (legacyName.includes("Addresses the Security Council on Lebanon")) {
    return "United Nations Security Council — Situation in Lebanon";
  }

  // General heuristics: strip 3rd-person singular verbs at start (e.g. "Addresses ", "Meets with ")
  let title = legacyName;
  if (/^Addresses\s+/i.test(title)) {
    title = title.replace(/^Addresses\s+/i, "Address to ");
  } else if (/^Meets with\s+/i.test(title)) {
    title = title.replace(/^Meets with\s+/i, "Meeting with ");
  } else if (/^Attends\s+/i.test(title)) {
    title = title.replace(/^Attends\s+/i, "Attendance at ");
  }

  if (venueName && !title.toLowerCase().includes(venueName.toLowerCase())) {
    return `${title} — ${venueName}`;
  }

  return title;
}

/**
 * Maps participant role string to structured involvementType.
 */
export function inferInvolvementType(role: string): InvolvementType {
  const r = role.toLowerCase();
  if (r.includes("speaker") || r.includes("orator") || r.includes("keynote")) return "speaker";
  if (r.includes("chair") || r.includes("president") || r.includes("presiding")) return "chair";
  if (r.includes("delegate") || r.includes("envoy")) return "delegate";
  if (r.includes("interviewer")) return "interviewer";
  if (r.includes("host")) return "host";
  if (r.includes("interviewee")) return "interviewee";
  if (r.includes("guest")) return "guest";
  if (r.includes("moderator")) return "moderator";
  if (r.includes("panelist")) return "panelist";
  if (r.includes("witness")) return "witness";
  if (r.includes("attendee")) return "attendee";
  if (r.includes("security") || r.includes("guard")) return "security";
  return "participant";
}

/**
 * Upgrades a legacy EventRecord into Event Model v2.
 */
export function upgradeLegacyToV2(legacy: EventRecord): EventV2 {
  const canonicalTitle = deriveCanonicalTitle(legacy.eventName, legacy.venueName);

  const isCoarseLocation =
    legacy.locationPrecision === "city" || legacy.locationPrecision === "country";
  const locationPublicVis: VisibilityLevel = isCoarseLocation ? "public-city" : "public-exact";

  // Derive initial person participation records
  const people: EventPerson[] = (legacy.participants || []).map((p, idx) => {
    const role = p.role || "participant";
    const inv = inferInvolvementType(role);
    const participantKey = p.personId ? `p-${p.personId}` : `fallback-${idx}`;
    return {
      id: `ep-${legacy.id}-${participantKey}`,
      eventId: legacy.id,
      personId: p.personId,
      personName: p.name,
      involvementType: inv,
      roleLabel: role,
      capacityTitle: role,
      attendanceMode: "physical",
      presenceConfidence: (p.presenceConfidence as Confidence) || "confirmed",
      roleConfidence: "confirmed",
      locations:
        legacy.latitude != null && legacy.longitude != null
          ? [
              {
                id: `epl-${legacy.id}-${participantKey}-0`,
                eventPersonId: `ep-${legacy.id}-${participantKey}`,
                latitude: legacy.latitude,
                longitude: legacy.longitude,
                coordinatePrecision: mapLegacyLocationPrecision(legacy.locationPrecision),
                isPrincipalLocation: true,
                locationBasis: "archival-record",
                confidence: (legacy.confidence as Confidence) || "confirmed",
                sourceIds: Array.isArray(legacy.sourceIds) ? [...legacy.sourceIds] : [],
                sources: (legacy.sourceIds || []).map((sid, sIdx) => ({
                  id: `epls-${legacy.id}-${participantKey}-0-${sIdx}`,
                  eventPersonLocationId: `epl-${legacy.id}-${participantKey}-0`,
                  sourceId: sid,
                  confidence: (legacy.confidence as Confidence) || "confirmed",
                })),
                publicVisibility: locationPublicVis,
              },
            ]
          : [],
    };
  });

  const factualFlags: EventFactualFlags = {
    physicalAttendanceConfirmed: people.length > 0 ? "yes" : "unknown",
    remoteParticipation: "no",
    publicEvent: legacy.scope === "public" ? "yes" : legacy.scope === "diplomatic" ? "no" : "unknown",
    openToPress: legacy.scope === "press" || legacy.scope === "public" ? "yes" : "unknown",
    ticketed: "unknown",
    invitationOnly: legacy.scope === "diplomatic" ? "yes" : "unknown",
    televised: (legacy.medium || []).some((m) => /broadcast|video|television/i.test(m)) ? "yes" : "unknown",
    broadcastLive: "unknown",
    streamedOnline: "unknown",
    audioRecorded: (legacy.medium || []).some((m) => /audio|radio/i.test(m)) ? "yes" : "unknown",
    videoRecorded: (legacy.medium || []).some((m) => /video|broadcast|television/i.test(m)) ? "yes" : "unknown",
    photographed: (legacy.medium || []).some((m) => /photo/i.test(m)) ? "yes" : "unknown",
    transcriptAvailable: (legacy.medium || []).some((m) => /transcript/i.test(m)) ? "yes" : "unknown",
    fullRecordingKnown: "unknown",
    exactStartTimeKnown: legacy.localStartTime != null,
    exactEndTimeKnown: legacy.localEndTime != null,
    exactVenueKnown: legacy.venueName != null,
    exactRoomKnown: false,
    personPreciseLocationKnown: false,
    organiserIdentified: (legacy.organisations?.length ?? 0) > 0,
    attendanceListKnown: people.length > 0 ? "yes" : "unknown",
    officialProgrammeAvailable: "unknown",
    eventCancelled: false,
    eventPostponed: false,
    occurredAsScheduled: "yes",
  };

  const editorialControls: EventEditorialControls = {
    needsReview: legacy.verificationStatus === "provisional",
    needsGeocodeReview: legacy.latitude == null,
    geocodeReviewed: legacy.latitude != null,
    possibleDuplicate: false,
    duplicateReviewed: true,
    likelyPartOfLargerEvent: false,
    parentEventNeeded: false,
    personRolesIncomplete: people.some((p) => !p.roleLabel),
    organisationsIncomplete: (legacy.organisations?.length ?? 0) === 0,
    broadcastResearchIncomplete: !(legacy.medium || []).includes("broadcast"),
    locationInferred: legacy.locationPrecision === "city" || legacy.locationPrecision === "country",
    timeInferred: legacy.timePrecision !== "exact",
    titleEditorial: true,
    officialTitleVerified: legacy.verificationStatus === "verified",
    primarySourcePresent: (legacy.sourceIds?.length ?? 0) > 0,
    conflictingSources: (legacy.conflictingClaims?.length ?? 0) > 0,
    possibleDateConflict: false,
    possibleLocationConflict: false,
    sensitiveLocation: false,
    exactLocationPublic: !isCoarseLocation && legacy.locationPrecision !== "unknown",
    readyForPublication: legacy.verificationStatus === "verified",
    featuredEvent: legacy.confidence === "confirmed",
    dataCompletenessScore: 85,
  };

  const locationType: LocationType =
    legacy.latitude != null && legacy.longitude != null ? "fixed" : "unknown";

  return {
    id: legacy.id,
    slug: legacy.slug,
    canonicalTitle,
    summary: legacy.summary,
    startDate: legacy.startDate,
    endDate: legacy.endDate ?? null,
    localStartTime: legacy.localStartTime ?? null,
    localEndTime: legacy.localEndTime ?? null,
    timezone: legacy.timezone ?? null,
    datePrecision: (legacy.datePrecision as Precision) || "exact",
    timePrecision: (legacy.timePrecision as Precision) || "exact",
    locationType,
    venueName: legacy.venueName ?? null,
    city: legacy.city,
    region: legacy.region ?? null,
    country: legacy.country,
    latitude: legacy.latitude ?? null,
    longitude: legacy.longitude ?? null,
    locationPrecision: mapLegacyLocationPrecision(legacy.locationPrecision || "unknown"),
    verificationStatus: legacy.verificationStatus,
    confidence: (legacy.confidence as Confidence) || "confirmed",
    sourceIds: Array.isArray(legacy.sourceIds) ? [...legacy.sourceIds] : [],
    reviewedAt: legacy.reviewedAt || new Date().toISOString(),
    researchNotes: legacy.notes ?? null,
    factualFlags,
    editorialControls,
    people,
    organisations: (legacy.organisations || []).map((orgId, idx) => ({
      id: `eo-${legacy.id}-${idx}`,
      eventId: legacy.id,
      organisationId: orgId,
      relationshipType: "participant",
    })),
    topics: (legacy.categories || []).map((cat, idx) => ({
      id: `et-${legacy.id}-${idx}`,
      eventId: legacy.id,
      topicId: cat,
      relationshipType: "primary-topic",
    })),
    compatibilityPayload: {
      categories: Array.isArray(legacy.categories) ? [...legacy.categories] : [],
      eventTypes: Array.isArray(legacy.eventTypes) ? [...legacy.eventTypes] : [],
      platform: legacy.platform ?? null,
      address: legacy.address ?? null,
      scope: legacy.scope,
      medium: Array.isArray(legacy.medium) ? [...legacy.medium] : [],
      quotes: Array.isArray(legacy.quotes) ? [...legacy.quotes] : [],
      media: Array.isArray(legacy.media) ? [...legacy.media] : [],
      provenance: Array.isArray(legacy.provenance) ? [...legacy.provenance] : [],
      conflictingClaims: Array.isArray(legacy.conflictingClaims) ? [...legacy.conflictingClaims] : [],
    },
    eventName: legacy.eventName, // preserved for backward-compatibility
  };
}

/**
 * Projects an Event Model v2 object back to a legacy EventRecord.
 * Ensures 100% backward compatibility with all existing atlas components.
 */
export function projectV2ToLegacy(v2: EventV2): EventRecord {
  // Map back location precision
  let legacyPrecision: "venue" | "city" | "country" | "unknown" = "unknown";
  if (v2.locationPrecision === "building" || v2.locationPrecision === "venue" || v2.locationPrecision === "room" || v2.locationPrecision === "stage" || v2.locationPrecision === "exact-position") {
    legacyPrecision = "venue";
  } else if (v2.locationPrecision === "city" || v2.locationPrecision === "neighbourhood") {
    legacyPrecision = "city";
  } else if (v2.locationPrecision === "country" || v2.locationPrecision === "region") {
    legacyPrecision = "country";
  }

  const compat = v2.compatibilityPayload;

  return {
    id: v2.id,
    slug: v2.slug,
    eventName: v2.eventName || v2.canonicalTitle,
    summary: v2.summary,
    categories: Array.isArray(compat?.categories)
      ? [...compat.categories]
      : (v2.topics?.map((t) => t.topicId) || ["Historical"]),
    eventTypes: Array.isArray(compat?.eventTypes)
      ? [...compat.eventTypes]
      : [v2.hierarchyType || "Event"],
    startDate: v2.startDate,
    endDate: v2.endDate || null,
    localStartTime: v2.localStartTime || null,
    localEndTime: v2.localEndTime || null,
    timezone: v2.timezone || null,
    datePrecision: v2.datePrecision || "exact-day",
    timePrecision: v2.timePrecision || v2.datePrecision || "exact-day",
    platform: compat ? compat.platform : (v2.eventSeriesId || null),
    venueName: v2.venueName || null,
    address: compat ? compat.address : null,
    city: v2.city,
    region: v2.region || null,
    country: v2.country,
    latitude: v2.latitude,
    longitude: v2.longitude,
    locationPrecision: legacyPrecision,
    participants: Array.isArray(v2.people)
      ? v2.people.map((p) => ({
          personId: p.personId,
          name: p.personName || p.personId || p.roleLabel,
          role: p.capacityTitle || p.roleLabel,
          presenceConfidence: p.presenceConfidence,
        }))
      : [],
    organisations: Array.isArray(v2.organisations)
      ? v2.organisations.map((o) => o.organisationId)
      : [],
    notes: v2.researchNotes || null,
    scope: compat?.scope || (v2.factualFlags?.publicEvent === "yes" ? "public" : "diplomatic"),
    medium: Array.isArray(compat?.medium)
      ? [...compat.medium]
      : (v2.factualFlags?.televised === "yes" ? ["broadcast"] : ["official-record"]),
    confidence: v2.confidence || "confirmed",
    verificationStatus: v2.verificationStatus || "unverified",
    sourceIds: Array.isArray(v2.sourceIds) ? [...v2.sourceIds] : [],
    quotes: Array.isArray(compat?.quotes) ? [...compat.quotes] : [],
    media: Array.isArray(compat?.media) ? [...compat.media] : [],
    provenance: Array.isArray(compat?.provenance)
      ? [...compat.provenance]
      : ["Event Model v2 Archival Migration"],
    conflictingClaims: Array.isArray(compat?.conflictingClaims)
      ? [...compat.conflictingClaims]
      : [],
    reviewedAt: v2.reviewedAt || new Date().toISOString(),
  };
}
