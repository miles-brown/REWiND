/**
 * Utility functions for REWiND Evidence Atlas
 */

/**
 * Generates a 2-character uppercase monogram for a person or entity name.
 * e.g. "Benjamin Netanyahu" -> "BN", "Churchill" -> "CH"
 */
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

export const getPersonInitials = getMonogram;

/**
 * Resolves the primary taxonomy tags for an event, prioritizing canonical `eventTypes`
 * over legacy `categories`.
 */
export function getEventTaxonomyTags(event?: { eventTypes?: string[]; categories?: string[] } | null): string[] {
  if (!event) return [];
  if (Array.isArray(event.eventTypes) && event.eventTypes.length > 0) {
    return event.eventTypes;
  }
  if (Array.isArray(event.categories) && event.categories.length > 0) {
    return event.categories;
  }
  return [];
}
