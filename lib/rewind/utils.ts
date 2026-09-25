/**
 * Utility functions for REWiND Evidence Atlas
 */

/**
 * Generates a 2-character uppercase monogram for a person or entity name.
 * e.g. "Benjamin Netanyahu" -> "BN", "Churchill" -> "CH"
 */
export function getMonogram(name: string): string;
export function getMonogram(name?: string | null): string;
export function getMonogram(name?: string | null): string {
  if (!name || typeof name !== "string") return "—";
  const trimmed = name.trim();
  if (!trimmed) return "—";
  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "—";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase() || "—";
  const first = parts[0][0] || "";
  const last = parts[parts.length - 1][0] || "";
  const res = (first + last).toUpperCase();
  return res || "—";
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
