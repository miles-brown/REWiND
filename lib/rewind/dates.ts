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
    // For date-only strings (YYYY-MM-DD), split parts to avoid UTC-midnight timezone shifting
    const parts = normalized.split("T")[0].split("-");
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const d = new Date(year, month, day, 12, 0, 0);
      return isNaN(d.getTime()) ? null : d;
    }
    if (parts.length === 2) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const d = new Date(year, month, 1, 12, 0, 0);
      return isNaN(d.getTime()) ? null : d;
    }
    if (parts.length === 1 && /^\d{4}$/.test(parts[0])) {
      const d = new Date(parseInt(parts[0], 10), 0, 1, 12, 0, 0);
      return isNaN(d.getTime()) ? null : d;
    }

    const d = new Date(normalized);
    return isNaN(d.getTime()) ? null : d;
  } catch {
    return null;
  }
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
