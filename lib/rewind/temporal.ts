const DAYS_OF_WEEK = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

/**
 * Derives the day of the week mathematically from an ISO calendar date (YYYY-MM-DD).
 * Never relies on manual entry to prevent human error.
 */
export function deriveDayOfWeek(isoDate: string): string | null {
  if (!isoDate || !/^\d{4}-\d{2}-\d{2}/.test(isoDate)) {
    return null;
  }
  const [year, month, day] = isoDate.split("-").map((n) => parseInt(n, 10));
  if (isNaN(year) || isNaN(month) || isNaN(day)) return null;

  // JavaScript months are 0-indexed (0 = January)
  const d = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
  if (isNaN(d.getTime())) return null;

  return DAYS_OF_WEEK[d.getUTCDay()] || null;
}

/**
 * Validates whether a date string strictly matches standard ISO 8601 YYYY-MM-DD.
 */
export function isValidISODate(dateStr: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;
  const [y, m, d] = dateStr.split("-").map(Number);
  if (m < 1 || m > 12 || d < 1 || d > 31) return false;

  const date = new Date(Date.UTC(y, m - 1, d));
  return (
    date.getUTCFullYear() === y &&
    date.getUTCMonth() === m - 1 &&
    date.getUTCDate() === d
  );
}

/**
 * Formats duration seconds into human-readable duration notation.
 */
export function formatDuration(seconds?: number | null): string | null {
  if (seconds == null || isNaN(seconds) || seconds <= 0) return null;
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m${remainingSeconds > 0 ? ` ${remainingSeconds}s` : ""}`;
  }
  if (minutes > 0) {
    return `${minutes}m${remainingSeconds > 0 ? ` ${remainingSeconds}s` : ""}`;
  }
  return `${remainingSeconds}s`;
}

/**
 * Humanizes civil local time with optional IANA timezone abbreviation.
 */
export function formatCivilTime(
  localTime?: string | null,
  timezoneAbbreviation?: string | null
): string | null {
  if (!localTime) return null;
  const match = localTime.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if (!match) return localTime;

  let hour = parseInt(match[1], 10);
  const min = match[2];
  const ampm = hour >= 12 ? "PM" : "AM";
  hour = hour % 12;
  if (hour === 0) hour = 12;

  const tz = timezoneAbbreviation ? ` ${timezoneAbbreviation}` : "";
  return `${hour}:${min} ${ampm}${tz}`;
}

