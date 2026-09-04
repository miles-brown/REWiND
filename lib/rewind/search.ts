import { createClient } from "@/lib/supabase/server";
import type { SearchResultItem } from "./types";

/**
 * Searches across events, people, places, and sources in Supabase.
 */
export async function searchRewind(
  query: string,
  limit = 10
): Promise<SearchResultItem[]> {
  const term = query.trim();
  if (!term) return [];

  try {
    const supabase = await createClient();
    if (!supabase) return [];

    const [eventsRes, peopleRes, placesRes, sourcesRes] = await Promise.all([
      supabase
        .from("events")
        .select("id, slug, title, start_date, summary")
        .eq("publication_status", "published")
        .or(`title.ilike.%${term}%,summary.ilike.%${term}%`)
        .limit(limit),
      supabase
        .from("people")
        .select("id, slug, display_name, canonical_name, primary_role")
        .eq("publication_status", "published")
        .or(`canonical_name.ilike.%${term}%,display_name.ilike.%${term}%`)
        .limit(limit),
      supabase
        .from("places")
        .select("id, slug, venue, city, country")
        .or(`venue.ilike.%${term}%,city.ilike.%${term}%,country.ilike.%${term}%`)
        .limit(limit),
      supabase
        .from("sources")
        .select("id, title, publisher, tier")
        .or(`title.ilike.%${term}%,publisher.ilike.%${term}%`)
        .limit(limit),
    ]);

    const results: SearchResultItem[] = [];

    (peopleRes.data || []).forEach((p) => {
      results.push({
        id: `person-${p.id}`,
        title: p.display_name || p.canonical_name,
        subtitle: p.primary_role || "Monitored Figure",
        type: "person",
        url: `/person/${p.slug}`,
        badge: "Person",
      });
    });

    (eventsRes.data || []).forEach((e) => {
      results.push({
        id: `event-${e.id}`,
        title: e.title,
        subtitle: e.summary?.slice(0, 100),
        type: "event",
        url: `/event/${e.slug}`,
        date: e.start_date,
        badge: "Event",
      });
    });

    (placesRes.data || []).forEach((pl) => {
      results.push({
        id: `place-${pl.id}`,
        title: pl.venue || pl.city,
        subtitle: `${pl.city}, ${pl.country}`,
        type: "place",
        url: `/place/${pl.slug}`,
        badge: "Place",
      });
    });

    (sourcesRes.data || []).forEach((s) => {
      results.push({
        id: `source-${s.id}`,
        title: s.title,
        subtitle: s.publisher,
        type: "source",
        url: `/source/${s.id}`,
        badge: s.tier ? s.tier.toUpperCase() : "Source",
      });
    });

    return results.slice(0, limit);
  } catch {
    return [];
  }
}
