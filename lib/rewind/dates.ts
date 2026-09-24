/**
 * REWiND Strict ISO-8601 Date Parsing & Normalization Utilities
 *
 * Ensures all dates originating from Supabase and client consumers are strictly ISO-8601 compliant
 * to prevent cross-browser discrepancies (e.g. Safari Invalid Date) and maintain archival rigor.
 */

const ISO_DATE_PATTERN = /^\d{4}(-\d{2}(-\d{2}(T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:?\d{2})?)?)?)?$/;

/**
 * Normalizes a date input to a strict ISO-8601 compliant string.
 * Supports:
 * - Full ISO timestamps: 2023-10-07T14:30:00Z
 * - Calendar dates: 2023-10-07
 * - Year-month: 2023-10
 * - Year: 2023
 * Also repairs common formatting quirks such as space-separated datetimes (2023-10-07 12:00:00)
 * and unpadded months/days (2023-5-7 -> 2023-05-07).
 */
export function normalizeIsoDate(input?: unknown): string {
  if (!input || typeof input !== "string") {
    if (input instanceof Date && !isNaN(input.getTime())) {
      return input.toISOString();
    }
    return "";
  }

  const trimmed = input.trim();
  if (!trimmed) return "";

  // If already strict ISO matching, return trimmed
  if (ISO_DATE_PATTERN.test(trimmed)) {
    return trimmed;
  }

  // Handle space separator instead of 'T' (e.g. "2023-10-07 12:00:00")
  const spaceReplaced = trimmed.replace(/^(\d{4}-\d{1,2}-\d{1,2})\s+(\d{2}:\d{2}(:\d{2})?.*)$/, "$1T$2");
  if (ISO_DATE_PATTERN.test(spaceReplaced)) {
    return spaceReplaced;
  }

  // Handle unpadded dates: e.g. "2023-5-7" -> "2023-05-07"
  const unpaddedMatch = trimmed.match(/^(\d{4})-(\d{1,2})(-(\d{1,2}))?$/);
  if (unpaddedMatch) {
    const year = unpaddedMatch[1];
    const month = unpaddedMatch[2].padStart(2, "0");
    const day = unpaddedMatch[4] ? unpaddedMatch[4].padStart(2, "0") : null;
    return day ? `${year}-${month}-${day}` : `${year}-${month}`;
  }

  return trimmed;
}

/**
 * Safely parses an ISO date string into a Date object without risking runtime NaN issues.
 * Returns null if parsing fails or input is invalid.
 */
export function parseIsoDate(dateStr?: string | null): Date | null {
  if (!dateStr || typeof dateStr !== "string") return null;
  const normalized = normalizeIsoDate(dateStr);
  if (!normalized) return null;

  try {
    // If input contains a time component, validate the calendar date portion first
    // to prevent JS Date rollover on invalid calendar dates (e.g. "2023-02-30T10:00:00Z")
    if (normalized.includes("T")) {
      const datePart = normalized.split("T")[0];
      const dateParts = datePart.split("-");
      if (dateParts.length === 3) {
        if (!/^\d{4}$/.test(dateParts[0]) || !/^\d{2}$/.test(dateParts[1]) || !/^\d{2}$/.test(dateParts[2])) {
          return null;
        }
        const year = parseInt(dateParts[0], 10);
        const month = parseInt(dateParts[1], 10) - 1;
        const day = parseInt(dateParts[2], 10);
        if (month < 0 || month > 11 || day < 1 || day > 31) return null;
        const checkDate = new Date(year, month, day, 12, 0, 0);
        checkDate.setFullYear(year);
        if (checkDate.getFullYear() !== year || checkDate.getMonth() !== month || checkDate.getDate() !== day) {
          return null;
        }
      }
      const d = new Date(normalized);
      return isNaN(d.getTime()) ? null : d;
    }

    // For date-only strings (YYYY-MM-DD, YYYY-MM, YYYY), construct date at local noon
    // to prevent UTC-midnight timezone shifting
    const parts = normalized.split("-");
    if (parts.length === 3) {
      if (!/^\d{4}$/.test(parts[0]) || !/^\d{2}$/.test(parts[1]) || !/^\d{2}$/.test(parts[2])) {
        return null;
      }
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      if (month < 0 || month > 11 || day < 1 || day > 31) return null;
      const d = new Date(year, month, day, 12, 0, 0);
      d.setFullYear(year);
      if (isNaN(d.getTime())) return null;
      if (d.getFullYear() !== year || d.getMonth() !== month || d.getDate() !== day) {
        return null;
      }
      return d;
    }
    if (parts.length === 2) {
      if (!/^\d{4}$/.test(parts[0]) || !/^\d{2}$/.test(parts[1])) {
        return null;
      }
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      if (month < 0 || month > 11) return null;
      const d = new Date(year, month, 1, 12, 0, 0);
      d.setFullYear(year);
      if (isNaN(d.getTime())) return null;
      if (d.getFullYear() !== year || d.getMonth() !== month) {
        return null;
      }
      return d;
    }
    if (parts.length === 1 && /^\d{4}$/.test(parts[0])) {
      const year = parseInt(parts[0], 10);
      const d = new Date(year, 0, 1, 12, 0, 0);
      d.setFullYear(year);
      if (isNaN(d.getTime())) return null;
      if (d.getFullYear() !== year) return null;
      return d;
    }

    const d = new Date(normalized);
    return isNaN(d.getTime()) ? null : d;
  } catch {
    return null;
  }
}

/**
 * Returns true if the date string strictly matches the ISO-8601 format and parses into a valid calendar date.
 * Allows UI components to distinguish between standard formatted dates and non-standard archival fallbacks.
 */
export function isStandardIsoDate(dateStr?: string | null): boolean {
  if (!dateStr || typeof dateStr !== "string") return false;
  const trimmed = dateStr.trim();
  if (!ISO_DATE_PATTERN.test(trimmed)) return false;
  return parseIsoDate(trimmed) !== null;
}

/**
 * Safely formats an ISO date string into a localized string with fallback.
 */
export function formatIsoDate(
  dateStr?: string | null,
  options: Intl.DateTimeFormatOptions = { day: "2-digit", month: "short", year: "numeric" },
  locale = "en-GB"
): string {
  if (!dateStr) return "";
  const trimmed = dateStr.trim();
  if (!isStandardIsoDate(trimmed)) return dateStr;

  const datePart = trimmed.split("T")[0];
  const parts = datePart.split("-");
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    const d = new Date(year, month, day, 12, 0, 0);
    d.setFullYear(year);
    try {
      return d.toLocaleDateString(locale, options);
    } catch {
      return dateStr;
    }
  }

  const d = parseIsoDate(trimmed);
  if (!d) return dateStr;
  try {
    return d.toLocaleDateString(locale, options);
  } catch {
    return dateStr;
  }
}

/**
 * Formats historical dates with precision awareness (exact-day, month, year).
 * Preserves raw archival strings when parsing fails without constructing invalid Date objects
 * or substituting current timestamps.
 */
export function formatTimelineDate(
  dateStr?: string | null,
  precision?: string,
  options: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" }
): string {
  if (!dateStr || typeof dateStr !== "string") return "";
  const trimmed = dateStr.trim();
  if (!trimmed) return "";

  // If not standard ISO (e.g. "Spring 1999", "Circa 1985"), preserve raw archival value
  if (!isStandardIsoDate(trimmed)) {
    return trimmed;
  }

  const prec = (precision || "").toLowerCase();
  const datePart = trimmed.split("T")[0];
  const parts = datePart.split("-");

  try {
    // If explicit year precision or only 4-digit year string
    if (prec === "year" || /^\d{4}$/.test(trimmed) || parts.length === 1) {
      const year = parseInt(parts[0], 10);
      const d = new Date(year, 0, 1, 12, 0, 0);
      d.setFullYear(year);
      return d.toLocaleDateString("en-GB", { year: "numeric" });
    }
    // If explicit month precision or YYYY-MM string
    if (prec === "month" || /^\d{4}-\d{2}$/.test(trimmed) || parts.length === 2) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const d = new Date(year, month, 1, 12, 0, 0);
      d.setFullYear(year);
      return d.toLocaleDateString("en-GB", { month: options.month === "long" ? "long" : "short", year: "numeric" });
    }
    // Default to provided options (day, month, year) using calendar date part
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const d = new Date(year, month, day, 12, 0, 0);
      d.setFullYear(year);
      return d.toLocaleDateString("en-GB", options);
    }
    const d = parseIsoDate(trimmed);
    if (!d) return trimmed;
    return d.toLocaleDateString("en-GB", options);
  } catch {
    return trimmed;
  }
}

/**
 * Extracts a calendar year (including archival dates, negative years, BCE, multi-year spans) from an ISO or archival date string.
 * Returns null if no valid calendar year can be extracted.
 */
export function extractYearFromDate(dateStr?: string | null): number | null {
  if (!dateStr || typeof dateStr !== "string") return null;
  const trimmed = dateStr.trim();
  if (!trimmed) return null;

  // Check for negative year prefix (e.g. "-0500", "-44", "-1200")
  const negativeMatch = trimmed.match(/^-(\d{1,6})\b/);
  if (negativeMatch) {
    const y = parseInt(negativeMatch[1], 10);
    return isNaN(y) ? null : -y;
  }

  // Check for BCE / BC notation (e.g. "753 BCE", "44 BC", "500 B.C.E.", "c. 300 BC")
  const isBce = /\b(bce|bc|b\.c\.e\.|b\.c\.)\b/i.test(trimmed);
  if (isBce) {
    const numMatch = trimmed.match(/\b(\d{1,6})\b/);
    if (numMatch) {
      const y = parseInt(numMatch[1], 10);
      return isNaN(y) ? null : -y;
    }
  }

  // Check for standard 4-digit year or multi-year span (e.g. "1993-1995", "1993–1995", "1993/1995", "1993-09-13", "c. 1963")
  const fourDigitMatch = trimmed.match(/\b(\d{4})\b/);
  if (fourDigitMatch) {
    const y = parseInt(fourDigitMatch[1], 10);
    return isNaN(y) ? null : y;
  }

  // Check for 1-3 digit years with CE/AD or circa prefix (e.g. "AD 70", "70 CE", "c. 800", "800 AD")
  const eraMatch =
    trimmed.match(/\b(?:ce|ad|a\.d\.|c\.e\.|c\.|circa)\s*(\d{1,4})\b/i) ||
    trimmed.match(/\b(\d{1,4})\s*(?:ce|ad|a\.d\.|c\.e\.)\b/i);
  if (eraMatch) {
    const y = parseInt(eraMatch[1], 10);
    return isNaN(y) ? null : y;
  }

  // Standalone 1-3 digit year
  const standaloneMatch = trimmed.match(/^(\d{1,4})$/);
  if (standaloneMatch) {
    const y = parseInt(standaloneMatch[1], 10);
    return isNaN(y) ? null : y;
  }

  return null;
}

/**
 * Derives a normalized chronological sort key from an ISO or archival date string.
 * Standard ISO dates: returns "1993-09-13" etc.
 * Archival dates with year (e.g. "c. 1963", "Spring 1999"): returns "1963-00-00:c. 1963"
 * BCE / negative dates: returns "-09247-00-00:753 BCE" etc.
 * Yearless / empty dates: returns "9999-99-99:<raw>"
 */
export function deriveChronologicalSortKey(dateStr?: string | null): string {
  if (!dateStr || typeof dateStr !== "string") return "9999-99-99";
  const trimmed = dateStr.trim();
  if (!trimmed) return "9999-99-99";

  if (isStandardIsoDate(trimmed)) {
    return trimmed;
  }

  const year = extractYearFromDate(trimmed);
  if (year !== null) {
    if (year < 0) {
      // Map negative years into sortable string: 10000 + year (e.g. -753 -> "-09247", -44 -> "-09956")
      const invertedOffset = 10000 + year;
      const safeOffset = invertedOffset >= 0 ? invertedOffset : 0;
      return `-${String(safeOffset).padStart(5, "0")}-00-00:${trimmed}`;
    }
    return `${String(year).padStart(4, "0")}-00-00:${trimmed}`;
  }

  return `9999-99-99:${trimmed}`;
}

/**
 * Chronological comparator for sorting historical events by startDate.
 * Correctly orders ISO-8601 dates, non-standard archival dates, BCE dates, and year spans.
 */
export function compareTimelineDates(dateA?: string | null, dateB?: string | null): number {
  const keyA = deriveChronologicalSortKey(dateA);
  const keyB = deriveChronologicalSortKey(dateB);
  if (keyA < keyB) return -1;
  if (keyA > keyB) return 1;
  return 0;
}
