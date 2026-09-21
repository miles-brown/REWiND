import { createClient } from "@/lib/supabase/server";
import type { SearchResultItem } from "./types";

/**
 * Escapes characters that have special meaning in PostgREST filter expressions.
 */
export function escapePostgrestValue(val: string): string {
  return val.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

/**
 * Interleaves search result categories round-robin to preserve diversity and avoid category starvation.
 */
export function interleaveSearchResults(
  categories: SearchResultItem[][],
  limit: number
): SearchResultItem[] {
  const results: SearchResultItem[] = [];
  let idx = 0;
  let hasMore = true;

  while (hasMore && results.length < limit) {
    hasMore = false;
    for (const cat of categories) {
      if (idx < cat.length) {
        results.push(cat[idx]);
        hasMore = true;
        if (results.length >= limit) break;
      }
    }
    idx++;
  }

  return results;
}

/**
 * Searches across events, people, places, and sources in Supabase.
 */
export async function searchRewind(
  query: string,
  limit = 10
): Promise<SearchResultItem[]> {
  const term = query.trim();
  if (!term) return [];

  const supabase = await createClient();
  if (!supabase) {
    throw new Error("Supabase search client is unavailable");
  }

  const escaped = escapePostgrestValue(term);

  const [eventsRes, peopleRes, placesRes, sourcesRes, quotesRes] = await Promise.all([
    supabase
      .from("events")
      .select("id, slug, title, start_date, summary")
      .eq("publication_status", "published")
      .or(`title.ilike."%${escaped}%",summary.ilike."%${escaped}%"`)
      .limit(limit),
    supabase
      .from("people")
      .select("id, slug, display_name, canonical_name, primary_role")
      .eq("publication_status", "published")
      .or(`canonical_name.ilike."%${escaped}%",display_name.ilike."%${escaped}%"`)
      .limit(limit),
    supabase
      .from("places")
      .select("id, slug, venue, city, country")
      .or(`venue.ilike."%${escaped}%",city.ilike."%${escaped}%",country.ilike."%${escaped}%"`)
      .limit(limit),
    supabase
      .from("sources")
      .select("id, title, publisher, tier")
      .or(`title.ilike."%${escaped}%",publisher.ilike."%${escaped}%"`)
      .limit(limit),
    supabase
      .from("quotes")
      .select("id, quote, context, speaker_id, event_id")
      .or(`quote.ilike."%${escaped}%",context.ilike."%${escaped}%"`)
      .limit(limit),
  ]);

  const searchError = eventsRes.error || peopleRes.error || placesRes.error || sourcesRes.error || quotesRes.error;
  if (searchError) {
    throw new Error(`Supabase search query failed: ${searchError.message}`);
  }

  const peopleItems: SearchResultItem[] = (peopleRes.data || []).map((p) => ({
    id: `person-${p.id}`,
    title: p.display_name || p.canonical_name,
    subtitle: p.primary_role || "Monitored Figure",
    type: "person",
    url: `/person/${p.slug}`,
    badge: "Person",
  }));

  const eventItems: SearchResultItem[] = (eventsRes.data || []).map((e) => ({
    id: `event-${e.id}`,
    title: e.title,
    subtitle: e.summary?.slice(0, 100),
    type: "event",
    url: `/event/${e.slug}`,
    date: e.start_date,
    badge: "Event",
  }));

  const quoteItems: SearchResultItem[] = [];

  // Resolve speaker attribution and event slugs for matched quotes
  const quoteRows = quotesRes.data || [];
  if (quoteRows.length > 0) {
    const neededEventIds = Array.from(
      new Set(
        quoteRows
          .map((q) => q.event_id)
          .filter((id) => id && !eventsRes.data?.some((e) => e.id === id || e.slug === id))
      )
    );
    const neededSpeakerIds = Array.from(
      new Set(
        quoteRows
          .map((q) => q.speaker_id)
          .filter((id) => id && !peopleRes.data?.some((p) => p.id === id || p.slug === id))
      )
    );

    const [extraEventsRes, extraPeopleRes] = await Promise.all([
      neededEventIds.length > 0
        ? supabase.from("events").select("id, slug, title").in("id", neededEventIds)
        : Promise.resolve({ data: [], error: null }),
      neededSpeakerIds.length > 0
        ? supabase.from("people").select("id, slug, display_name, canonical_name").in("id", neededSpeakerIds)
        : Promise.resolve({ data: [], error: null }),
    ]);

    const relatedLookupError = extraEventsRes.error || extraPeopleRes.error;
    if (relatedLookupError) {
      throw new Error(`Supabase related search query failed: ${relatedLookupError.message}`);
    }

    const eventSlugMap = new Map<string, { slug: string; title: string }>();
    (eventsRes.data || []).forEach((e) => eventSlugMap.set(e.id, { slug: e.slug, title: e.title }));
    (extraEventsRes.data || []).forEach((e) => eventSlugMap.set(e.id, { slug: e.slug, title: e.title }));

    const speakerNameMap = new Map<string, string>();
    (peopleRes.data || []).forEach((p) => speakerNameMap.set(p.id, p.display_name || p.canonical_name));
    (extraPeopleRes.data || []).forEach((p) => speakerNameMap.set(p.id, p.display_name || p.canonical_name));

    quoteRows.forEach((q) => {
      const evt = eventSlugMap.get(q.event_id);
      const speaker = speakerNameMap.get(q.speaker_id) || q.speaker_id;
      const cleanQuote = q.quote.replace(/^["“]|["”]$/g, "");
      const truncated = cleanQuote.length > 90 ? `${cleanQuote.slice(0, 87)}...` : cleanQuote;

      quoteItems.push({
        id: `quote-${q.id}`,
        title: `“${truncated}”`,
        subtitle: speaker ? `${speaker}${evt?.title ? ` • ${evt.title}` : ""}` : q.context || "Archival Quote",
        type: "quote",
        url: evt?.slug ? `/event/${evt.slug}` : `/quotes`,
        badge: "Quote",
      });
    });
  }

  const placeItems: SearchResultItem[] = (placesRes.data || []).map((pl) => ({
    id: `place-${pl.id}`,
    title: pl.venue || pl.city,
    subtitle: `${pl.city}, ${pl.country}`,
    type: "place",
    url: `/place/${pl.slug}`,
    badge: "Place",
  }));

  const sourceItems: SearchResultItem[] = (sourcesRes.data || []).map((s) => ({
    id: `source-${s.id}`,
    title: s.title,
    subtitle: s.publisher,
    type: "source",
    url: `/source/${s.id}`,
    badge: s.tier ? s.tier.toUpperCase() : "Source",
  }));

  return interleaveSearchResults(
    [eventItems, peopleItems, placeItems, sourceItems, quoteItems],
    limit
  );
}
