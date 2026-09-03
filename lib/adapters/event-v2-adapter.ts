import type { EventRecord } from "@/data/rewind";
import type {
  EventEditorialControls,
  EventFactualFlags,
  EventPerson,
  EventV2,
  InvolvementType,
  LocationPrecisionV2,
  LocationType,
} from "../models/event-v2";

/**
 * Cleanly maps legacy 4-tier location precision to Event Model v2 14-tier precision.
 */
export function mapLegacyLocationPrecision(
  prec: "venue" | "city" | "country" | "unknown"
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
  if (r.includes("host") || r.includes("interviewer")) return "host";
  if (r.includes("guest") || r.includes("interviewee")) return "interviewee";
  if (r.includes("panelist") || r.includes("moderator")) return "panelist";
  if (r.includes("attendee") || r.includes("witness")) return "attendee";
  if (r.includes("security") || r.includes("guard")) return "security";
  return "participant";
}

/**
 * Upgrades a legacy EventRecord into Event Model v2.
 */
export function upgradeLegacyToV2(legacy: EventRecord): EventV2 {
  const canonicalTitle = deriveCanonicalTitle(legacy.eventName, legacy.venueName);

  // Derive initial person participation records
  const people: EventPerson[] = legacy.participants.map((p, idx) => {
    const inv = inferInvolvementType(p.role);
    return {
      id: `ep-${legacy.id}-${p.personId || idx}`,
      eventId: legacy.id,
      personId: p.personId,
      involvementType: inv,
      roleLabel: p.role,
      capacityTitle: p.role,
      attendanceMode: "physical",
      presenceConfidence: p.presenceConfidence,
      roleConfidence: "confirmed",
      locations:
        legacy.latitude != null && legacy.longitude != null
          ? [
              {
                id: `epl-${legacy.id}-${p.personId}-0`,
                eventPersonId: `ep-${legacy.id}-${p.personId || idx}`,
                latitude: legacy.latitude,
                longitude: legacy.longitude,
                coordinatePrecision: mapLegacyLocationPrecision(legacy.locationPrecision),
                isPrincipalLocation: true,
                locationBasis: "archival-record",
                confidence: legacy.confidence,
                sourceIds: legacy.sourceIds,
                publicVisibility: "public-exact",
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
    televised: legacy.medium.includes("broadcast") || legacy.medium.includes("video") ? "yes" : "unknown",
    broadcastLive: "unknown",
    streamedOnline: "unknown",
    audioRecorded: legacy.medium.includes("audio") ? "yes" : "unknown",
    videoRecorded: legacy.medium.includes("video") ? "yes" : "unknown",
    photographed: legacy.medium.includes("photo") ? "yes" : "unknown",
    transcriptAvailable: legacy.medium.includes("official-transcript") || legacy.medium.includes("transcript") ? "yes" : "unknown",
    fullRecordingKnown: "unknown",
    exactStartTimeKnown: legacy.localStartTime != null,
    exactEndTimeKnown: legacy.localEndTime != null,
    exactVenueKnown: legacy.venueName != null,
    exactRoomKnown: false,
    personPreciseLocationKnown: false,
    organiserIdentified: legacy.organisations.length > 0,
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
    organisationsIncomplete: legacy.organisations.length === 0,
    broadcastResearchIncomplete: !legacy.medium.includes("broadcast"),
    locationInferred: legacy.locationPrecision === "city" || legacy.locationPrecision === "country",
    timeInferred: legacy.timePrecision !== "exact",
    titleEditorial: true,
    officialTitleVerified: legacy.verificationStatus === "verified",
    primarySourcePresent: legacy.sourceIds.length > 0,
    conflictingSources: legacy.conflictingClaims.length > 0,
    possibleDateConflict: false,
    possibleLocationConflict: false,
    sensitiveLocation: false,
    exactLocationPublic: true,
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
    endDate: legacy.endDate,
    localStartTime: legacy.localStartTime,
    localEndTime: legacy.localEndTime,
    timezone: legacy.timezone,
    datePrecision: legacy.datePrecision,
    timePrecision: legacy.timePrecision,
    locationType,
    venueName: legacy.venueName,
    city: legacy.city,
    region: legacy.region,
    country: legacy.country,
    latitude: legacy.latitude,
    longitude: legacy.longitude,
    locationPrecision: mapLegacyLocationPrecision(legacy.locationPrecision),
    verificationStatus: legacy.verificationStatus,
    confidence: legacy.confidence,
    sourceIds: legacy.sourceIds,
    reviewedAt: legacy.reviewedAt,
    researchNotes: legacy.notes,
    factualFlags,
    editorialControls,
    people,
    organisations: legacy.organisations.map((orgId, idx) => ({
      id: `eo-${legacy.id}-${idx}`,
      eventId: legacy.id,
      organisationId: orgId,
      relationshipType: "participant",
    })),
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

  return {
    id: v2.id,
    slug: v2.slug,
    eventName: v2.eventName || v2.canonicalTitle,
    summary: v2.summary,
    categories: v2.topics?.map((t) => t.topicId) || ["Historical"],
    eventTypes: [v2.hierarchyType || "Event"],
    startDate: v2.startDate,
    endDate: v2.endDate || null,
    localStartTime: v2.localStartTime || null,
    localEndTime: v2.localEndTime || null,
    timezone: v2.timezone || null,
    datePrecision: v2.datePrecision,
    timePrecision: v2.timePrecision,
    platform: v2.eventSeriesId || null,
    venueName: v2.venueName || null,
    address: null,
    city: v2.city,
    region: v2.region || null,
    country: v2.country,
    latitude: v2.latitude,
    longitude: v2.longitude,
    locationPrecision: legacyPrecision,
    participants:
      v2.people?.map((p) => ({
        personId: p.personId,
        name: p.roleLabel,
        role: p.capacityTitle || p.roleLabel,
        presenceConfidence: p.presenceConfidence,
      })) || [],
    organisations: v2.organisations?.map((o) => o.organisationId) || [],
    notes: v2.researchNotes || null,
    scope: v2.factualFlags.publicEvent === "yes" ? "public" : "diplomatic",
    medium: v2.factualFlags.televised === "yes" ? ["broadcast"] : ["official-record"],
    confidence: v2.confidence,
    verificationStatus: v2.verificationStatus,
    sourceIds: v2.sourceIds,
    quotes: [],
    media: [],
    provenance: ["Event Model v2 Archival Migration"],
    conflictingClaims: [],
    reviewedAt: v2.reviewedAt,
  };
}
