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

  // Attempt JavaScript Date parse as a final fallback
  try {
    const parsed = new Date(trimmed);
    if (!isNaN(parsed.getTime())) {
      return parsed.toISOString();
    }
  } catch {
    // Fallback below
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
  const d = parseIsoDate(dateStr);
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

  const d = parseIsoDate(trimmed);
  if (!d) {
    return trimmed;
  }

  try {
    const prec = (precision || "").toLowerCase();
    // If explicit year precision or only 4-digit year string
    if (prec === "year" || /^\d{4}$/.test(trimmed)) {
      return d.toLocaleDateString("en-GB", { year: "numeric" });
    }
    // If explicit month precision or YYYY-MM string
    if (prec === "month" || /^\d{4}-\d{2}$/.test(trimmed)) {
      return d.toLocaleDateString("en-GB", { month: options.month === "long" ? "long" : "short", year: "numeric" });
    }
    // Default to provided options (day, month, year)
    return d.toLocaleDateString("en-GB", options);
  } catch {
    return trimmed;
  }
}


