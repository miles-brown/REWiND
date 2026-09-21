import { createClient } from "@/lib/supabase/server";
import { getPlacesStrict } from "./places";

export interface AtlasStatistics {
  eventCount: number;
  personCount: number;
  sourceCount: number;
  verifiedCount: number;
  provisionalCount: number;
  disputedCount: number;
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
      provisionalCount: 0,
      disputedCount: 0,
      placeCount: 0,
      yearsCovered: 0,
    };
  }

  const [eventsRes, peopleRes, sourcesRes, verifiedRes, provisionalRes, disputedRes, places, minYearRes, maxYearRes] = await Promise.all([
    supabase.from("events").select("id", { count: "exact", head: true }).eq("publication_status", "published"),
    supabase.from("people").select("id", { count: "exact", head: true }).eq("publication_status", "published"),
    supabase.from("sources").select("id", { count: "exact", head: true }),
    supabase.from("events").select("id", { count: "exact", head: true }).eq("verification_status", "verified").eq("publication_status", "published"),
    supabase.from("events").select("id", { count: "exact", head: true }).eq("verification_status", "provisional").eq("publication_status", "published"),
    supabase.from("events").select("id", { count: "exact", head: true }).eq("verification_status", "disputed").eq("publication_status", "published"),
    getPlacesStrict(supabase),
    supabase.from("events").select("start_date").eq("publication_status", "published").order("start_date", { ascending: true }).limit(1),
    supabase.from("events").select("start_date").eq("publication_status", "published").order("start_date", { ascending: false }).limit(1),
  ]);

  // Any failed count query returns { count: null, error } — do not convert failures
  // into zero counts which would make a DB outage look like an empty-but-healthy atlas.
  if (eventsRes.error || peopleRes.error || sourcesRes.error || verifiedRes.error || provisionalRes.error || disputedRes.error || minYearRes.error || maxYearRes.error) {
    const firstError = eventsRes.error ?? peopleRes.error ?? sourcesRes.error ?? verifiedRes.error ?? provisionalRes.error ?? disputedRes.error ?? minYearRes.error ?? maxYearRes.error;
    throw new Error(`Atlas statistics query failed: ${firstError?.message ?? "unknown error"}`);
  }

  let yearsCovered = 0;
  const minDate = minYearRes.data?.[0]?.start_date;
  const maxDate = maxYearRes.data?.[0]?.start_date;
  if (minDate && maxDate) {
    const startY = parseInt(minDate.slice(0, 4), 10);
    const endY = parseInt(maxDate.slice(0, 4), 10);
    if (!isNaN(startY) && !isNaN(endY) && endY >= startY) {
      yearsCovered = endY - startY + 1;
    }
  }

  return {
    eventCount: eventsRes.count ?? 0,
    personCount: peopleRes.count ?? 0,
    sourceCount: sourcesRes.count ?? 0,
    verifiedCount: verifiedRes.count ?? 0,
    provisionalCount: provisionalRes.count ?? 0,
    disputedCount: disputedRes.count ?? 0,
    placeCount: places.length,
    yearsCovered,
  };
}
