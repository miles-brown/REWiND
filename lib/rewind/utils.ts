/**
 * Utility functions for REWiND Evidence Atlas
 */

const TITLE_HONORIFIC_PREFIX_REGEX =
  /^(King|Queen|Prince|Princess|Duke|Duchess|Grand\s+Duke|Grand\s+Duchess|Count|Countess|Pope|Archbishop|Infanta|Infante|Rabbi|Father|Pastor|Sheikh|Ayatollah|President|Prime\s+Minister|Senator|Governor|Ambassador|General|Admiral|Justice|Judge|Secretary|Director|Sir|Lord|Lady|Dame|Dr|Dr\.)\s+/i;

const REGNAL_ORDINAL_REGEX =
  /^(I|II|III|IV|V|VI|VII|VIII|IX|X|XI|XII|XIII|XIV|XV|XVI|XVII|XVIII|XIX|XX|1st|2nd|3rd|4th|5th|6th|7th|8th|9th|10th)$/i;

/**
 * Generates a 2-character uppercase monogram for a person or entity name.
 * Strips titles, honorifics, and regnal ordinals so e.g. "King Charles III" -> "CH", "Queen Elizabeth II" -> "EL", "Pope John Paul II" -> "JP".
 * e.g. "Benjamin Netanyahu" -> "BN", "David Ben-Gurion" -> "DB", "Churchill" -> "CH"
 */
export function getMonogram(name: string): string;
export function getMonogram(name?: string | null): string;
export function getMonogram(name?: string | null): string {
  if (!name || typeof name !== "string") return "—";
  const trimmed = name.trim();
  if (!trimmed) return "—";

  // Handle comma-separated royal/titular styles: "Margareta, Custodian of the Crown of Romania" -> "Margareta Romania"
  let workingName = trimmed;
  if (workingName.includes(",")) {
    const [firstPart, rest] = workingName.split(",").map((s) => s.trim());
    const cleanFirst = firstPart.replace(TITLE_HONORIFIC_PREFIX_REGEX, "").trim();
    const ofTokens = rest.split(/\bof\s+/i);
    const place = ofTokens.length > 1 ? ofTokens[ofTokens.length - 1].trim() : rest;
    workingName = `${cleanFirst} ${place}`;
  }

  const tokens = workingName.split(/\s+/).filter(Boolean);
  const cleanTokens = tokens.filter(
    (t) =>
      !/^(King|Queen|Prince|Princess|Duke|Duchess|Grand|Tsar|Emperor|Empress|Archbishop|Pope|Sir|Lord|Lady|Dame|Infanta|Infante|Rabbi|Father|Pastor|Sheikh|Ayatollah|President|Prime|Minister|Senator|Governor|Ambassador|General|Admiral|Justice|Judge|Secretary|Director|Dr|Dr\.)$/i.test(
        t
      ) && !REGNAL_ORDINAL_REGEX.test(t)
  );

  const effectiveTokens = cleanTokens.length > 0 ? cleanTokens : tokens;
  if (effectiveTokens.length === 0) return "—";
  if (effectiveTokens.length === 1) return effectiveTokens[0].slice(0, 2).toUpperCase() || "—";

  const first = effectiveTokens[0][0] || "";
  const last = effectiveTokens[effectiveTokens.length - 1][0] || "";
  const res = (first + last).toUpperCase();
  return res || "—";
}

/**
 * Formats the venue and subvenue details for display across UI components and PDF exports.
 * E.g., venue: "The White House", subvenue: "East Room" => "The White House (East Room)"
 */
export function formatEventVenue(event: { venueName?: string | null; subvenue?: string | null; city?: string | null }): string {
  const venue = event.venueName?.trim();
  const sub = event.subvenue?.trim();
  const city = event.city?.trim() || "";

  if (venue && sub) {
    if (venue.toLowerCase().includes(sub.toLowerCase())) {
      return venue;
    }
    return `${venue} (${sub})`;
  }
  return venue || city || "Unspecified Location";
}

/**
 * Formats the complete event location including venue, subvenue, city, and country.
 */
export function formatEventLocation(event: { venueName?: string | null; subvenue?: string | null; city?: string | null; country?: string | null }): string {
  const venueStr = formatEventVenue(event);
  const cityStr = event.city?.trim();
  const countryStr = event.country?.trim();

  const parts: string[] = [];
  if (venueStr) {
    parts.push(venueStr);
  }

  if (
    cityStr &&
    cityStr.toLowerCase() !== venueStr.toLowerCase() &&
    !venueStr.toLowerCase().endsWith(`, ${cityStr.toLowerCase()}`)
  ) {
    parts.push(cityStr);
  }

  if (
    countryStr &&
    countryStr.toLowerCase() !== venueStr.toLowerCase() &&
    countryStr.toLowerCase() !== cityStr?.toLowerCase() &&
    !venueStr.toLowerCase().endsWith(`, ${countryStr.toLowerCase()}`)
  ) {
    parts.push(countryStr);
  }

  return parts.filter(Boolean).join(", ") || "Recorded Location";
}

/**
 * Extracts first name, last name, and display name for sorting and display.
 * Handles titular suffixes, commas, and royal honorifics.
 */
export function extractPersonNameParts(person: {
  name?: string;
  canonicalName?: string;
  displayName?: string;
  fullBirthName?: string | null;
}): { firstName: string; lastName: string; displayName: string } {
  const displayName = (person.displayName || person.canonicalName || person.name || "").trim();

  if (displayName.includes(",")) {
    const [firstPart, rest] = displayName.split(",").map((s) => s.trim());
    const firstName = firstPart.replace(
      /^(King|Queen|Prince|Princess|Duke|Duchess|Grand Duke|Grand Duchess|Count|Countess|Pope|Archbishop|Infanta|Infante|Rabbi|Sir|Lord|Lady|Dame)\s+/i,
      ""
    );
    const ofTokens = rest.split(/\bof\s+/i);
    const lastName = ofTokens.length > 1 ? ofTokens[ofTokens.length - 1].trim() : rest;
    return { firstName, lastName, displayName };
  }

  const tokens = displayName.split(/\s+/).filter(Boolean);
  const cleanTokens = tokens.filter(
    (t) =>
      !/^(King|Queen|Prince|Princess|Duke|Duchess|Grand|Tsar|Emperor|Empress|Archbishop|Pope|Sir|Lord|Lady|Dame|Infanta|Infante|Rabbi|Father|Pastor|Sheikh|Ayatollah|President|Prime|Minister|Senator|Governor|Ambassador|General|Admiral|Justice|Judge|Secretary|Director|Dr|Dr\.)$/i.test(
        t
      ) && !REGNAL_ORDINAL_REGEX.test(t)
  );

  if (cleanTokens.length === 0) {
    return { firstName: tokens[0] || displayName, lastName: tokens[tokens.length - 1] || displayName, displayName };
  }

  if (cleanTokens.length === 1) {
    return { firstName: cleanTokens[0], lastName: cleanTokens[0], displayName };
  }

  const firstName = cleanTokens[0];
  const lastName = cleanTokens[cleanTokens.length - 1];

  return { firstName, lastName, displayName };
}

import type { EventRecord, PersonRecord } from "./types";

/**
 * Checks whether a participant's attendance record qualifies as verified physical presence.
 * Filters out remote/virtual attendance, written statements, proxy attendance, and disputed presence.
 */
export function isPhysicalConfirmedParticipant(p: { attendanceMode?: string; presenceConfidence?: string }): boolean {
  const isPhysical = !p.attendanceMode || p.attendanceMode === "physical";
  const isNotDisputed = !p.presenceConfidence || p.presenceConfidence !== "disputed";
  return isPhysical && isNotDisputed;
}

/**
 * Discovers the top physical, undisputed co-attendee for a primary figure across verified historical events.
 *
 * Edge cases handled:
 * - Empty events or empty people list: returns fallback (next person or undefined)
 * - Self-pairs: strictly excludes Person A by id and slug from being selected as Person B
 * - Disputed or remote presences: filtered out so only physical confirmed meetings count toward co-attendance
 * - Zero co-attendees: gracefully falls back to the next distinct person in the register (or undefined)
 */
export interface FindTopCoAttendeeOptions {
  target?: string | PersonRecord | null;
  people: PersonRecord[];
  events: EventRecord[];
}

export function findTopCoAttendee(options: FindTopCoAttendeeOptions): string | undefined;
export function findTopCoAttendee(
  target: string | PersonRecord | undefined | null,
  people?: PersonRecord[],
  events?: EventRecord[]
): string | undefined;
export function findTopCoAttendee(
  optionsOrTarget: FindTopCoAttendeeOptions | string | PersonRecord | undefined | null,
  arg2?: PersonRecord[] | EventRecord[],
  arg3?: PersonRecord[] | EventRecord[]
): string | undefined {
  let target: string | PersonRecord | undefined | null;
  let people: PersonRecord[] = [];
  let events: EventRecord[] = [];

  if (
    optionsOrTarget &&
    typeof optionsOrTarget === "object" &&
    "people" in optionsOrTarget &&
    "events" in optionsOrTarget
  ) {
    target = optionsOrTarget.target;
    people = Array.isArray(optionsOrTarget.people) ? optionsOrTarget.people : [];
    events = Array.isArray(optionsOrTarget.events) ? optionsOrTarget.events : [];
  } else {
    target = optionsOrTarget as string | PersonRecord | undefined;
    const isArg2People =
      Array.isArray(arg2) &&
      arg2.length > 0 &&
      ("canonicalName" in (arg2[0] as object) || "notabilityBasis" in (arg2[0] as object));
    const isArg3People =
      Array.isArray(arg3) &&
      arg3.length > 0 &&
      ("canonicalName" in (arg3[0] as object) || "notabilityBasis" in (arg3[0] as object));

    people = isArg2People
      ? (arg2 as PersonRecord[])
      : isArg3People
      ? (arg3 as PersonRecord[])
      : ((arg2 as PersonRecord[]) || []);

    events = isArg2People
      ? (arg3 as EventRecord[])
      : isArg3People
      ? ((arg2 as EventRecord[]) || [])
      : ((arg3 as EventRecord[]) || (arg2 as EventRecord[]) || []);
  }

  if (!target || events.length === 0) {
    const targetSlug = typeof target === "string" ? target : target?.slug;
    const targetId = typeof target === "string" ? target : target?.id;
    return people.length > 1 ? people.find((p) => p.slug !== targetSlug && p.id !== targetId)?.slug : undefined;
  }

  const targetSlug = typeof target === "string" ? target : target.slug;
  const targetId = typeof target === "string" ? target : target.id;
  const coCounts = new Map<string, number>();

  for (const e of events) {
    const participants = (e.participants || []).filter(isPhysicalConfirmedParticipant);
    const hasTarget = participants.some(
      (p) => p.personId === targetId || p.personId === targetSlug || p.slug === targetSlug || p.slug === targetId
    );

    if (hasTarget) {
      for (const p of participants) {
        const pId = p.personId;
        const pSlug = p.slug;
        const isSelf =
          pId === targetId ||
          pId === targetSlug ||
          pSlug === targetSlug ||
          pSlug === targetId;

        if (!isSelf && (pSlug || pId)) {
          const key = pSlug || pId;
          coCounts.set(key, (coCounts.get(key) || 0) + 1);
        }
      }
    }
  }

  if (coCounts.size > 0) {
    const personLookup = new Map<string, PersonRecord>();
    for (const p of people) {
      if (p.slug && !personLookup.has(p.slug)) personLookup.set(p.slug, p);
      if (p.id && !personLookup.has(p.id)) personLookup.set(p.id, p);
    }

    const sortedCoAttendees = Array.from(coCounts.entries()).sort((a, b) => b[1] - a[1]);
    for (const [candidateKey] of sortedCoAttendees) {
      const matched = personLookup.get(candidateKey);
      if (matched && matched.slug !== targetSlug && matched.id !== targetId) {
        return matched.slug;
      }
    }
  }

  // Graceful fallback: return the next distinct person in the register if no co-attendees exist
  return people.find((p) => p.slug !== targetSlug && p.id !== targetId)?.slug;
}
