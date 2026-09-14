import { createClient } from "@/lib/supabase/server";
import { getEventYearsStrict } from "./events";
import { getPlacesStrict } from "./places";

export interface AtlasStatistics {
  eventCount: number;
  personCount: number;
  sourceCount: number;
  verifiedCount: number;
  placeCount: number;
  yearsCovered: number;
}

/**
 * Retrieves aggregate statistics directly from the canonical Supabase database.
 */
export async function getAtlasStatistics(): Promise<AtlasStatistics> {
  const supabase = await createClient();
  if (!supabase) {
    return {
      eventCount: 0,
      personCount: 0,
      sourceCount: 0,
      verifiedCount: 0,
      placeCount: 0,
      yearsCovered: 0,
    };
  }

  const [eventsRes, peopleRes, sourcesRes, verifiedRes, places, eventYears] = await Promise.all([
    supabase.from("events").select("id", { count: "exact", head: true }).eq("publication_status", "published"),
    supabase.from("people").select("id", { count: "exact", head: true }).eq("publication_status", "published"),
    supabase.from("sources").select("id", { count: "exact", head: true }),
    supabase.from("events").select("id", { count: "exact", head: true }).eq("verification_status", "verified").eq("publication_status", "published"),
    getPlacesStrict(supabase),
    getEventYearsStrict(supabase),
  ]);

  // Any failed count query returns { count: null, error } — do not convert failures
  // into zero counts which would make a DB outage look like an empty-but-healthy atlas.
  if (eventsRes.error || peopleRes.error || sourcesRes.error || verifiedRes.error) {
    const firstError = eventsRes.error ?? peopleRes.error ?? sourcesRes.error ?? verifiedRes.error;
    throw new Error(`Atlas statistics query failed: ${firstError?.message ?? "unknown error"}`);
  }

  return {
    eventCount: eventsRes.count ?? 0,
    personCount: peopleRes.count ?? 0,
    sourceCount: sourcesRes.count ?? 0,
    verifiedCount: verifiedRes.count ?? 0,
    placeCount: places.length,
    yearsCovered: eventYears.length,
  };
}

