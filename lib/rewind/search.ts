import { createClient } from "@/lib/supabase/server";
import type { SearchResultItem } from "./types";

/**
 * Escapes characters that have special meaning in PostgREST filter expressions.
 */
export function escapePostgrestValue(val: string): string {
  return val.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

/**
 * Escapes wildcard characters in SQL ILIKE patterns.
 */
export function escapeIlikePattern(val: string): string {
  return val.replace(/[%_\\]/g, "\\$&");
}

/**
 * Parsed search qualifiers for structured omnisearch queries (e.g. type:person, year:2023, country:spain, tier:t1).
 */
export interface SearchQualifiers {
  rawQuery: string;
  cleanedQuery: string;
  type?: "event" | "person" | "place" | "source" | "quote" | string;
  year?: string;
  country?: string;
  tier?: string;
}

/**
 * Extracts filter qualifiers from a raw search query string.
 */
export function parseSearchQualifiers(query: string): SearchQualifiers {
  let cleaned = query.trim();
  let type: string | undefined;
  let year: string | undefined;
  let country: string | undefined;
  let tier: string | undefined;

  const typeMatch = cleaned.match(/\b(?:type|kind|category):([a-zA-Z_-]+)\b/i);
  if (typeMatch) {
    type = typeMatch[1].toLowerCase();
    cleaned = cleaned.replace(typeMatch[0], "").trim();
  }

  const yearMatch = cleaned.match(/\byear:(\d{4})\b/i);
  if (yearMatch) {
    year = yearMatch[1];
    cleaned = cleaned.replace(yearMatch[0], "").trim();
  }

  const countryMatch = cleaned.match(/\bcountry:([a-zA-Z_-]+)\b/i);
  if (countryMatch) {
    country = countryMatch[1].toLowerCase();
    cleaned = cleaned.replace(countryMatch[0], "").trim();
  }

  const tierMatch = cleaned.match(/\btier:(t?[1-4]|tier-[a-d])\b/i);
  if (tierMatch) {
    tier = tierMatch[1].toLowerCase();
    cleaned = cleaned.replace(tierMatch[0], "").trim();
  }

  return {
    rawQuery: query,
    cleanedQuery: cleaned,
    type,
    year,
    country,
    tier,
  };
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
  if (!Number.isInteger(limit) || limit < 1 || limit > 30) return [];

  const supabase = await createClient();
  if (!supabase) {
    throw new Error("Supabase search client is unavailable");
  }

  const { cleanedQuery, type, year, country, tier } = parseSearchQualifiers(term);
  const effectiveTerm = cleanedQuery || term;

  const ilikeEscaped = escapeIlikePattern(effectiveTerm);
  const postgrestIlikeEscaped = escapePostgrestValue(ilikeEscaped);

  const [eventsRes, peopleRes, placesRes, venuesRes, sourcesRes, quotesRes] = await Promise.all([
    supabase
      .from("events")
      .select("id, slug, title, start_date, summary")
      .eq("publication_status", "published")
      .or(`title.ilike."%${postgrestIlikeEscaped}%",summary.ilike."%${postgrestIlikeEscaped}%"`)
      .limit(limit),
    supabase
      .from("people")
      .select("id, slug, display_name, canonical_name, primary_role")
      .eq("publication_status", "published")
      .or(`canonical_name.ilike."%${postgrestIlikeEscaped}%",display_name.ilike."%${postgrestIlikeEscaped}%"`)
      .limit(limit),
    supabase
      .from("places")
      .select("id, slug, venue, city, country")
      .or(`venue.ilike."%${postgrestIlikeEscaped}%",city.ilike."%${postgrestIlikeEscaped}%",country.ilike."%${postgrestIlikeEscaped}%"`)
      .limit(limit),
    supabase
      .from("venues")
      .select("id, name, address_id")
      .ilike("name", `%${ilikeEscaped}%`)
      .limit(limit),
    supabase
      .from("sources")
      .select("id, title, publisher, tier")
      .or(`title.ilike."%${postgrestIlikeEscaped}%",publisher.ilike."%${postgrestIlikeEscaped}%"`)
      .limit(limit),
    supabase
      .from("quotes")
      .select("id, quote, context, speaker_id, event_id")
      .or(`quote.ilike."%${postgrestIlikeEscaped}%",context.ilike."%${postgrestIlikeEscaped}%"`)
      .limit(limit),
  ]);

  const searchError = eventsRes.error || peopleRes.error || placesRes.error || venuesRes.error || sourcesRes.error || quotesRes.error;
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
          .filter((id): id is string => Boolean(id) && !eventsRes.data?.some((e) => e.id === id || e.slug === id))
      )
    );
    const neededSpeakerIds = Array.from(
      new Set(
        quoteRows
          .map((q) => q.speaker_id)
          .filter((id): id is string => Boolean(id) && !peopleRes.data?.some((p) => p.id === id || p.slug === id))
      )
    );

    const [extraEventsRes, extraPeopleRes] = await Promise.all([
      neededEventIds.length > 0
        ? supabase
            .from("events")
            .select("id, slug, title")
            .or(`id.in.(${neededEventIds.map(escapePostgrestValue).join(",")}),slug.in.(${neededEventIds.map(escapePostgrestValue).join(",")})`)
        : Promise.resolve({ data: [], error: null }),
      neededSpeakerIds.length > 0
        ? supabase
            .from("people")
            .select("id, slug, display_name, canonical_name")
            .or(`id.in.(${neededSpeakerIds.map(escapePostgrestValue).join(",")}),slug.in.(${neededSpeakerIds.map(escapePostgrestValue).join(",")})`)
        : Promise.resolve({ data: [], error: null }),
    ]);

    const relatedLookupError = extraEventsRes.error || extraPeopleRes.error;
    if (relatedLookupError) {
      throw new Error(`Supabase related search query failed: ${relatedLookupError.message}`);
    }

    const eventSlugMap = new Map<string, { slug: string; title: string }>();
    (eventsRes.data || []).forEach((e) => {
      eventSlugMap.set(e.id, { slug: e.slug, title: e.title });
      if (e.slug) eventSlugMap.set(e.slug, { slug: e.slug, title: e.title });
    });
    (extraEventsRes.data || []).forEach((e) => {
      eventSlugMap.set(e.id, { slug: e.slug, title: e.title });
      if (e.slug) eventSlugMap.set(e.slug, { slug: e.slug, title: e.title });
    });

    const speakerNameMap = new Map<string, string>();
    (peopleRes.data || []).forEach((p) => {
      const name = p.display_name || p.canonical_name;
      speakerNameMap.set(p.id, name);
      if (p.slug) speakerNameMap.set(p.slug, name);
    });
    (extraPeopleRes.data || []).forEach((p) => {
      const name = p.display_name || p.canonical_name;
      speakerNameMap.set(p.id, name);
      if (p.slug) speakerNameMap.set(p.slug, name);
    });

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

  const placeItems: SearchResultItem[] = [];
  const seenPlaceIds = new Set<string>();
  const seenPlaceSlugs = new Set<string>();

  (placesRes.data || []).forEach((pl) => {
    seenPlaceIds.add(pl.id);
    seenPlaceSlugs.add(pl.slug);
    placeItems.push({
      id: `place-${pl.id}`,
      title: pl.venue || pl.city,
      subtitle: `${pl.city}, ${pl.country}`,
      type: "place",
      url: `/place/${pl.slug}`,
      badge: "Place",
    });
  });

  const venueRows = venuesRes.data || [];
  if (venueRows.length > 0) {
    const addressIds = Array.from(new Set(venueRows.map((v) => v.address_id).filter(Boolean))) as string[];
    const addressesMap = new Map<string, { city?: string | null; country_code?: string | null }>();
    if (addressIds.length > 0) {
      const { data: addressRows, error: addressError } = await supabase
        .from("addresses")
        .select("id, city, country_code")
        .in("id", addressIds);
      if (addressError) {
        throw new Error(`Supabase search query failed: ${addressError.message}`);
      }
      (addressRows || []).forEach((a: { id: string; city?: string | null; country_code?: string | null }) => addressesMap.set(a.id, a));
    }

    venueRows.forEach((v) => {
      const vSlug = v.id.replace(/^plc-|^ven-/, "");
      if (!seenPlaceIds.has(v.id) && !seenPlaceSlugs.has(vSlug)) {
        seenPlaceIds.add(v.id);
        seenPlaceSlugs.add(vSlug);
        const addr = v.address_id ? addressesMap.get(v.address_id) : undefined;
        const loc = [addr?.city, addr?.country_code].filter(Boolean).join(", ") || "Venue";
        placeItems.push({
          id: `place-${v.id}`,
          title: v.name,
          subtitle: loc,
          type: "place",
          url: `/place/${vSlug}`,
          badge: "Place",
        });
      }
    });
  }

  const sourceItems: SearchResultItem[] = (sourcesRes.data || []).map((s) => ({
    id: `source-${s.id}`,
    title: s.title,
    subtitle: s.publisher,
    type: "source",
    url: `/source/${s.id}`,
    badge: s.tier ? s.tier.toUpperCase() : "Source",
  }));

  let filteredSourceItems = sourceItems;
  if (tier) {
    filteredSourceItems = sourceItems.filter((s) => s.badge?.toLowerCase().includes(tier));
  }

  let filteredEventItems = eventItems;
  if (year) {
    filteredEventItems = eventItems.filter((e) => e.date?.startsWith(year));
  }

  let filteredPlaceItems = placeItems;
  if (country) {
    filteredPlaceItems = placeItems.filter((p) => p.subtitle?.toLowerCase().includes(country));
  }

  let categoryGroups = [filteredEventItems, peopleItems, filteredPlaceItems, filteredSourceItems, quoteItems];

  if (type) {
    if (type === "person" || type === "people" || type === "figure" || type === "monarch") {
      categoryGroups = [peopleItems, filteredEventItems, quoteItems, filteredPlaceItems, filteredSourceItems];
    } else if (type === "event" || type === "events") {
      categoryGroups = [filteredEventItems, peopleItems, filteredPlaceItems, quoteItems, filteredSourceItems];
    } else if (type === "place" || type === "places" || type === "venue") {
      categoryGroups = [filteredPlaceItems, filteredEventItems, peopleItems, filteredSourceItems, quoteItems];
    } else if (type === "source" || type === "sources") {
      categoryGroups = [filteredSourceItems, filteredEventItems, peopleItems, filteredPlaceItems, quoteItems];
    } else if (type === "quote" || type === "quotes") {
      categoryGroups = [quoteItems, filteredEventItems, peopleItems, filteredPlaceItems, filteredSourceItems];
    }
  }

  return interleaveSearchResults(
    categoryGroups,
    limit
  );
}
