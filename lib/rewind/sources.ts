import { createClient } from "@/lib/supabase/server";
import { getEvents } from "./events";
import type { EventRecord, SourceRecord } from "./types";

/**
 * Retrieves primary and corroborating sources from Supabase with optional filters.
 */
export async function getSources(
  filters: { tier?: string; type?: string; search?: string } = {}
): Promise<SourceRecord[]> {
  try {
    const supabase = await createClient();
    if (!supabase) return [];

    let query = supabase
      .from("sources")
      .select("*")
      .order("trust_score", { ascending: false });

    if (filters.tier) {
      query = query.eq("tier", filters.tier);
    }

    if (filters.type) {
      query = query.eq("source_type", filters.type);
    }

    if (filters.search && filters.search.trim()) {
      const term = filters.search.trim();
      query = query.or(`title.ilike.%${term}%,publisher.ilike.%${term}%`);
    }

    const { data, error } = await query;
    if (error || !data) return [];

    return data.map((s) => ({
      id: s.id,
      title: s.title,
      publisher: s.publisher,
      sourceType: s.source_type,
      classification: s.tier === "tier-a" || s.tier === "tier-b" ? "primary" : "secondary",
      tier: s.tier,
      url: s.url || undefined,
      archiveUrl: s.archive_url || undefined,
      author: s.author || undefined,
      publicationDate: s.publication_date || undefined,
      trustScore: s.trust_score,
    }));
  } catch {
    return [];
  }
}

/**
 * Retrieves a single source by ID along with events that reference it.
 */
export async function getSourceById(
  id: string
): Promise<{ source: SourceRecord; events: EventRecord[] } | null> {
  try {
    const supabase = await createClient();
    if (!supabase) return null;

    const { data: s, error } = await supabase
      .from("sources")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error || !s) return null;

    const source: SourceRecord = {
      id: s.id,
      title: s.title,
      publisher: s.publisher,
      sourceType: s.source_type,
      classification: s.tier === "tier-a" || s.tier === "tier-b" ? "primary" : "secondary",
      tier: s.tier,
      url: s.url || undefined,
      archiveUrl: s.archive_url || undefined,
      author: s.author || undefined,
      publicationDate: s.publication_date || undefined,
      trustScore: s.trust_score,
    };

    // Find referencing events
    const { data: eventSources } = await supabase
      .from("event_sources")
      .select("event_id")
      .eq("source_id", id);

    const eventIds = (eventSources || []).map((es) => es.event_id);
    let events: EventRecord[] = [];
    if (eventIds.length > 0) {
      const allEvents = await getEvents({ limit: 100 });
      events = allEvents.data.filter((e) => eventIds.includes(e.id));
    }

    return {
      source,
      events,
    };
  } catch {
    return null;
  }
}
