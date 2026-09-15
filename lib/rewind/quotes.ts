import { createClient } from "@/lib/supabase/server";
import type { QuoteRecord } from "./types";

/**
 * Retrieves archival quotes linked to historical events and speakers with status and error reporting.
 */
export async function getQuotesWithStatus(): Promise<{ data: QuoteRecord[]; error: string | null }> {
  try {
    const supabase = await createClient();
    if (!supabase) {
      return { data: [], error: "Supabase connection is not configured." };
    }

    const quotesData: Array<{
      id: string;
      event_id: string;
      speaker_id: string;
      quote: string;
      context?: string | null;
      language?: string | null;
      source_id?: string | null;
      timestamp_in_media?: string | null;
    }> = [];
    const pageSize = 1000;
    let from = 0;
    let hasMore = true;

    while (hasMore) {
      const { data, error } = await supabase
        .from("quotes")
        .select("*, people!inner(publication_status), events!inner(publication_status)")
        .eq("people.publication_status", "published")
        .eq("events.publication_status", "published")
        .order("created_at", { ascending: false })
        .order("id", { ascending: true })
        .range(from, from + pageSize - 1);

      if (error) {
        return { data: [], error: error.message };
      }

      if (data && data.length > 0) {
        quotesData.push(...data);
      }

      if (!data || data.length < pageSize) {
        hasMore = false;
      } else {
        from += pageSize;
      }
    }

    if (quotesData.length === 0) {
      return { data: [], error: null };
    }

    const speakerIds = Array.from(new Set(quotesData.map((q) => q.speaker_id)));
    const eventIds = Array.from(new Set(quotesData.map((q) => q.event_id)));

    const CHUNK_SIZE = 500;
    const speakerMap = new Map<string, string>();
    for (let i = 0; i < speakerIds.length; i += CHUNK_SIZE) {
      const chunk = speakerIds.slice(i, i + CHUNK_SIZE);
      const { data: people, error: peopleError } = await supabase
        .from("people")
        .select("id, display_name, canonical_name")
        .in("id", chunk);
      if (peopleError) {
        return { data: [], error: peopleError.message };
      }
      (people || []).forEach((p) => speakerMap.set(p.id, p.display_name || p.canonical_name));
    }

    const eventMap = new Map<string, { slug: string; title: string; date: string }>();
    for (let i = 0; i < eventIds.length; i += CHUNK_SIZE) {
      const chunk = eventIds.slice(i, i + CHUNK_SIZE);
      const { data: events, error: eventsError } = await supabase
        .from("events")
        .select("id, slug, title, start_date")
        .in("id", chunk);
      if (eventsError) {
        return { data: [], error: eventsError.message };
      }
      (events || []).forEach((e) => eventMap.set(e.id, { slug: e.slug, title: e.title, date: e.start_date }));
    }

    const records = quotesData.map((q) => {
      const evt = eventMap.get(q.event_id);
      return {
        id: q.id,
        eventId: q.event_id,
        eventSlug: evt?.slug,
        speakerId: q.speaker_id,
        speakerName: speakerMap.get(q.speaker_id) || q.speaker_id,
        quote: q.quote,
        context: q.context || undefined,
        language: q.language || "en",
        sourceId: q.source_id || undefined,
        timestampInMedia: q.timestamp_in_media || undefined,
        eventTitle: evt?.title,
        eventDate: evt?.date,
      };
    });

    return { data: records, error: null };
  } catch (err) {
    return { data: [], error: err instanceof Error ? err.message : "Unknown database error" };
  }
}

/**
 * Retrieves archival quotes linked to historical events and speakers.
 */
export async function getQuotes(): Promise<QuoteRecord[]> {
  const res = await getQuotesWithStatus();
  return res.data;
}
