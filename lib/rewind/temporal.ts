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
  if (!isoDate || !/^(\d{4})-(\d{2})-(\d{2})(?:T.*)?$/.test(isoDate)) {
    return null;
  }
  const match = isoDate.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return null;
  const year = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  const day = parseInt(match[3], 10);
  if (isNaN(year) || isNaN(month) || isNaN(day)) return null;
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;

  // JavaScript months are 0-indexed (0 = January)
  const d = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
  if (isNaN(d.getTime())) return null;

  if (
    d.getUTCFullYear() !== year ||
    d.getUTCMonth() !== month - 1 ||
    d.getUTCDate() !== day
  ) {
    return null;
  }

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
 * Supports seconds (s), minutes (m), hours (h), and multi-day durations (d).
 */
export function formatDuration(seconds?: number | null): string | null {
  if (seconds == null || isNaN(seconds) || seconds <= 0) return null;
  const days = Math.floor(seconds / 86400);
  const remainingAfterDays = seconds % 86400;
  const hours = Math.floor(remainingAfterDays / 3600);
  const minutes = Math.floor((remainingAfterDays % 3600) / 60);
  const remainingSeconds = remainingAfterDays % 60;

  if (days > 0) {
    let result = `${days}d`;
    if (hours > 0) result += ` ${hours}h`;
    if (minutes > 0) result += ` ${minutes}m`;
    if (remainingSeconds > 0 && hours === 0 && minutes === 0) result += ` ${remainingSeconds}s`;
    return result;
  }
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
  if (!match) return null;

  let hour = parseInt(match[1], 10);
  const minNum = parseInt(match[2], 10);
  const secNum = match[3] ? parseInt(match[3], 10) : 0;

  if (hour < 0 || hour > 23 || minNum < 0 || minNum > 59 || secNum < 0 || secNum > 59) {
    return null;
  }

  const min = match[2];
  const ampm = hour >= 12 ? "PM" : "AM";
  hour = hour % 12;
  if (hour === 0) hour = 12;

  const tz = timezoneAbbreviation ? ` ${timezoneAbbreviation}` : "";
  return `${hour}:${min} ${ampm}${tz}`;
}

