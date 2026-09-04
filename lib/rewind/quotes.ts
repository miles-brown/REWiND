import { createClient } from "@/lib/supabase/server";
import type { QuoteRecord } from "./types";

/**
 * Retrieves archival quotes linked to historical events and speakers.
 */
export async function getQuotes(): Promise<QuoteRecord[]> {
  try {
    const supabase = await createClient();
    if (!supabase) return [];

    const { data: quotesData, error } = await supabase
      .from("quotes")
      .select("*")
      .order("created_at", { ascending: false });

    if (error || !quotesData || quotesData.length === 0) return [];

    const speakerIds = Array.from(new Set(quotesData.map((q) => q.speaker_id)));
    const eventIds = Array.from(new Set(quotesData.map((q) => q.event_id)));

    const speakerMap = new Map<string, string>();
    if (speakerIds.length > 0) {
      const { data: people } = await supabase
        .from("people")
        .select("id, display_name, canonical_name")
        .in("id", speakerIds);
      (people || []).forEach((p) => speakerMap.set(p.id, p.display_name || p.canonical_name));
    }

    const eventMap = new Map<string, { title: string; date: string }>();
    if (eventIds.length > 0) {
      const { data: events } = await supabase
        .from("events")
        .select("id, title, start_date")
        .in("id", eventIds);
      (events || []).forEach((e) => eventMap.set(e.id, { title: e.title, date: e.start_date }));
    }

    return quotesData.map((q) => {
      const evt = eventMap.get(q.event_id);
      return {
        id: q.id,
        eventId: q.event_id,
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
  } catch {
    return [];
  }
}
