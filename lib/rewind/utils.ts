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

const ROYAL_NAME_OVERRIDES: Record<string, string> = {
  "charles-iii": "King Charles III",
  "king-charles-iii": "King Charles III",
  "david-armstrong-jones-snowdon": "David Armstrong-Jones",
  "peter-phillips": "Peter Phillips",
  "zara-tindall": "Zara Tindall",
  "lady-sarah-chatto": "Lady Sarah Chatto",
  "lady-louise-windsor": "Lady Louise Windsor",
  "james-earl-of-wessex": "James Mountbatten-Windsor",
  "prince-edward-duke-of-kent": "Prince Edward of Kent",
  "nicholas-medforth-mills": "Nicholas Medforth-Mills",
  "karl-von-habsburg": "Karl von Habsburg",
  "georg-von-habsburg": "Georg von Habsburg",
  "ferdinand-zvonimir-habsburg": "Ferdinand Zvonimir von Habsburg",
  "archduke-eduard-of-austria": "Archduke Eduard",
  "archduke-lorenz-of-austria-este": "Archduke Lorenz",
  "archduke-martin-of-austria-este": "Archduke Martin",
  "joan-enric-vives-sicilia": "Joan-Enric Vives i Sicília",
  "margareta-custodian-of-the-crown-romania": "Princess Margareta",
  "heinrich-donatus-landgrave-of-hesse": "Landgrave Donatus",
  "bernhard-margrave-of-baden": "Margrave Bernhard",
  "jean-count-of-paris": "Prince Jean d'Orléans",
  "philomena-countess-of-paris": "Countess Philomena d'Orléans",
  "prince-gaston-of-orleans": "Prince Gaston d'Orléans",
  "louis-alphonse-duke-of-anjou": "Prince Louis Alphonse",
  "marie-marguerite-duchess-of-anjou": "Duchess Marie-Marguerite",
  "jean-christophe-prince-napoleon": "Prince Jean-Christophe Napoléon",
  "olympia-princess-napoleon": "Princess Olympia Napoléon",
  "franz-duke-of-bavaria": "Duke Franz of Bavaria",
  "duarte-pio-duke-of-braganza": "Duke Duarte Pio",
  "isabel-duchess-of-braganza": "Duchess Isabel",
  "afonso-prince-of-beira": "Prince Afonso",
  "camilla-duchess-of-castro": "Princess Camilla of Bourbon-Two Sicilies",
  "carlo-duke-of-castro": "Prince Carlo of Bourbon-Two Sicilies",
  "pedro-duke-of-calabria": "Prince Pedro of Bourbon-Two Sicilies",
  "carlos-duke-of-parma": "Prince Carlos of Bourbon-Parma",
  "aimone-duke-of-aosta": "Prince Aimone of Savoy",
  "princess-olga-of-savoy-aosta": "Princess Olga of Savoy",
  "emanuele-filiberto-of-savoy": "Prince Emanuele Filiberto of Savoy",
  "sophie-princess-of-prussia": "Princess Sophie of Prussia",
  "sophie-hereditary-princess-liechtenstein": "Hereditary Princess Sophie",
};

const ROYAL_TITLE_START_REGEX =
  /^(King|Queen|Crown\s+Prince|Crown\s+Princess|Hereditary\s+Grand\s+Duke|Hereditary\s+Grand\s+Duchess|Hereditary\s+Prince|Hereditary\s+Princess|Grand\s+Duke|Grand\s+Duchess|Prince|Princess|Infanta|Infante|Archduke|Archduchess|Duke|Duchess|Count|Countess|Margrave|Landgrave|Tsar)\b/i;

/**
 * Formats a person's display name according to the REWiND Universal Naming Standard:
 * - Standard figures use clean personal + surname ("Benjamin Netanyahu", "David Armstrong-Jones").
 * - Royal family members ("monarch-royal") use a single uniform "[Primary Title] [Given Name]" format
 *   without comma-chained subsidiary titles, married styles ("Mrs ..."), or lengthy territorial suffixes,
 *   preserving fuller titles and styles for their profile page biography and aliases.
 */
export function formatStandardPersonName(person: {
  slug?: string;
  id?: string;
  name?: string;
  displayName?: string;
  canonicalName?: string;
  classification?: string;
}): string {
  const key = (person.slug || person.id || "").trim();
  if (key && ROYAL_NAME_OVERRIDES[key]) {
    return ROYAL_NAME_OVERRIDES[key];
  }

  let raw = (person.displayName || person.canonicalName || person.name || "").trim();
  if (!raw) return "";

  const isRoyal =
    person.classification === "monarch-royal" ||
    ROYAL_TITLE_START_REGEX.test(raw) ||
    /,\s*(Crown\s+Prince|Crown\s+Princess|Hereditary\s+Grand\s+Duke|Hereditary\s+Grand\s+Duchess|Hereditary\s+Prince|Hereditary\s+Princess|Grand\s+Duke|Grand\s+Duchess|Prince|Princess|Duchess|Duke|Countess|Count|Margrave|Landgrave|Earl|Custodian)\b/i.test(
      raw
    );

  if (!isRoyal) return raw;

  if (raw.includes(",")) {
    const [firstPart, secondPart] = raw.split(",").map((s) => s.trim());
    if (ROYAL_TITLE_START_REGEX.test(firstPart)) {
      raw = firstPart;
    } else {
      const titleMatch = secondPart.match(
        /^(Crown\s+Princess|Crown\s+Prince|Hereditary\s+Grand\s+Duchess|Hereditary\s+Grand\s+Duke|Hereditary\s+Princess|Hereditary\s+Prince|Grand\s+Duchess|Grand\s+Duke|Princess|Prince|Duchess|Duke|Countess|Count|Margrave|Landgrave|Earl|Custodian)\b/i
      );
      const title = titleMatch
        ? titleMatch[1].toLowerCase() === "custodian"
          ? "Princess"
          : titleMatch[1]
        : "Prince";
      raw = `${title} ${firstPart}`;
    }
  }

  return raw.replace(/\s+of\s+.+$/i, "").trim();
}

/**
 * Extracts first name, last name, and display name for sorting and display.
 * Handles titular suffixes, commas, and royal honorifics.
 * For royal family members without a civil family surname, both firstName and lastName
 * resolve to their personal given name so they sort predictably under their known name.
 */
export function extractPersonNameParts(person: {
  slug?: string;
  id?: string;
  name?: string;
  canonicalName?: string;
  displayName?: string;
  fullBirthName?: string | null;
  classification?: string;
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

  // Strip trailing "of <Territory>" on royal title names (e.g. "Prince Edward of Kent" -> "Prince Edward")
  const isRoyal = person.classification === "monarch-royal";
  const hasRoyalTitlePrefix =
    ROYAL_TITLE_START_REGEX.test(displayName) ||
    (Boolean(isRoyal) && /^Earl\b/i.test(displayName));

  const baseForTokens = (isRoyal || hasRoyalTitlePrefix)
    ? displayName.replace(/\s+of\s+.+$/i, "").trim()
    : displayName;

  const tokens = baseForTokens.split(/\s+/).filter(Boolean);

  // Strip leading honorific/title tokens ONLY from the start of the token array.
  // When person is not classified as royal, "Earl" is treated as a personal given name (e.g. "Earl Warren"),
  // and tokens at later positions are preserved (e.g. "Sam Earl" -> lastName: "Earl").
  let startIndex = 0;
  while (startIndex < tokens.length - 1) {
    const t = tokens[startIndex];
    if (REGNAL_ORDINAL_REGEX.test(t)) {
      startIndex++;
      continue;
    }
    if (/^Earl$/i.test(t)) {
      if (isRoyal) {
        startIndex++;
        continue;
      }
      break;
    }
    if (
      /^(King|Queen|Prince|Princess|Duke|Duchess|Grand|Crown|Hereditary|Tsar|Emperor|Empress|Archduke|Archduchess|Margrave|Landgrave|Count|Countess|Archbishop|Pope|Sir|Lord|Lady|Dame|Infanta|Infante|Rabbi|Father|Pastor|Sheikh|Ayatollah|President|Prime|Minister|Senator|Governor|Ambassador|General|Admiral|Justice|Judge|Secretary|Director|Dr|Dr\.)$/i.test(
        t
      )
    ) {
      startIndex++;
      continue;
    }
    break;
  }

  // Also strip trailing regnal ordinals from the end of name tokens (e.g. "King Charles III" -> "Charles")
  let endIndex = tokens.length;
  while (endIndex > startIndex + 1) {
    const last = tokens[endIndex - 1];
    if (REGNAL_ORDINAL_REGEX.test(last)) {
      endIndex--;
    } else {
      break;
    }
  }

  const cleanTokens = tokens.slice(startIndex, endIndex);

  if (cleanTokens.length === 0) {
    return { firstName: tokens[0] || displayName, lastName: tokens[tokens.length - 1] || displayName, displayName };
  }

  if (cleanTokens.length === 1) {
    return { firstName: cleanTokens[0], lastName: cleanTokens[0], displayName };
  }

  // Royals with a title prefix (unless bearing an explicit dynastic surname like d'Orléans or Napoléon)
  // use compound given names ("King Juan Carlos I", "King Carl XVI Gustaf", "Princess Ingrid Alexandra")
  // and should sort by their given name under both First Name and Last Name sort modes.
  const lastToken = cleanTokens[cleanTokens.length - 1];
  const hasDynasticSurname = /^(d'Orléans|Napoléon|Windsor|Mountbatten-Windsor|Chatto|Phillips|Tindall|Armstrong-Jones|Habsburg|Medforth-Mills)$/i.test(
    lastToken
  );
  if ((isRoyal || hasRoyalTitlePrefix) && !hasDynasticSurname) {
    const givenName = cleanTokens.join(" ");
    return { firstName: givenName, lastName: givenName, displayName };
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

/**
 * Deterministically sanitizes place, city, and country strings into URL-safe canonical slugs.
 */
export function sanitizePlaceSlug(str: string): string {
  return (
    str
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9_-]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "") || "unknown"
  );
}
