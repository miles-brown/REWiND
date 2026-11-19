/**
 * REWIND EVIDENCE ATLAS — OFFICES & SUCCESSION LINEAGES DOMAIN MODULE
 *
 * Provides access to prominent constitutional offices, sovereign succession lines,
 * and officeholder chronologies across the atlas.
 */

import { prominentOfficesSeed, type ProminentOffice, type OfficeholderRecord } from "../../data/seeds/prominent-offices";

export type { ProminentOffice, OfficeholderRecord };

/**
 * Returns all registered prominent offices.
 */
export async function getProminentOffices(): Promise<ProminentOffice[]> {
  return prominentOfficesSeed;
}

/**
 * Retrieves a single prominent office by its unique slug ID.
 */
export async function getProminentOfficeBySlug(slug: string): Promise<ProminentOffice | null> {
  const match = prominentOfficesSeed.find(
    (office) => office.id === slug || office.shortTitle.toLowerCase().replace(/\s+/g, "-") === slug
  );
  return match || null;
}

/**
 * Returns all holders for a given office ordered chronologically.
 */
export async function getOfficeHolders(officeSlug: string): Promise<OfficeholderRecord[]> {
  const office = await getProminentOfficeBySlug(officeSlug);
  if (!office) return [];
  return [...office.holders].sort((a, b) => a.startDate.localeCompare(b.startDate));
}
