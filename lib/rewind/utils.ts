/**
 * Utility functions for REWiND Evidence Atlas
 */

/**
 * Generates a 2-character uppercase monogram for a person or entity name.
 * e.g. "Benjamin Netanyahu" -> "BN", "Churchill" -> "CH"
 */
export function getMonogram(name: string): string {
  if (!name) return "—";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "—";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
