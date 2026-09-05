import { createClient } from "@/lib/supabase/server";

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
  try {
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

    const [eventsRes, peopleRes, sourcesRes, verifiedRes, placesRes, datesRes] = await Promise.all([
      supabase.from("events").select("id", { count: "exact", head: true }).eq("publication_status", "published"),
      supabase.from("people").select("id", { count: "exact", head: true }).eq("publication_status", "published"),
      supabase.from("sources").select("id", { count: "exact", head: true }),
      supabase.from("events").select("id", { count: "exact", head: true }).eq("verification_status", "verified").eq("publication_status", "published"),
      supabase.from("places").select("id", { count: "exact", head: true }),
      supabase.from("events").select("start_date").eq("publication_status", "published"),
    ]);

    const years = new Set<string>();
    (datesRes.data || []).forEach((r) => {
      if (r.start_date && r.start_date.length >= 4) {
        years.add(r.start_date.slice(0, 4));
      }
    });

    return {
      eventCount: eventsRes.count || 0,
      personCount: peopleRes.count || 0,
      sourceCount: sourcesRes.count || 0,
      verifiedCount: verifiedRes.count || 0,
      placeCount: placesRes.count || 0,
      yearsCovered: years.size,
    };
  } catch {
    return {
      eventCount: 0,
      personCount: 0,
      sourceCount: 0,
      verifiedCount: 0,
      placeCount: 0,
      yearsCovered: 0,
    };
  }
}
