import { createClient } from "@/lib/supabase/server";
import { getEventsByIds } from "./events";
import type { EventRecord, SourceRecord } from "./types";

function mapDatabaseSource(s: Record<string, unknown>): SourceRecord {
  return {
    id: String(s.id || ""),
    title: String(s.title || ""),
    publisher: String(s.publisher || ""),
    sourceType: (s.source_type as SourceRecord["sourceType"]) || "official-record",
    classification: s.tier === "tier-a" || s.tier === "tier-b" ? "primary" : "secondary",
    tier: s.tier as SourceRecord["tier"],
    url: s.url ? String(s.url) : undefined,
    archiveUrl: s.archive_url ? String(s.archive_url) : undefined,
    author: s.author ? String(s.author) : undefined,
    publicationDate: s.publication_date ? String(s.publication_date) : undefined,
    accessedDate: s.accessed_date ? String(s.accessed_date) : s.accessedDate ? String(s.accessedDate) : undefined,
    language: s.language ? String(s.language) : undefined,
    trustScore: typeof s.trust_score === "number" ? s.trust_score : undefined,
  };
}

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

    return data.map(mapDatabaseSource);
  } catch {
    return [];
  }
}

/**
 * Retrieves multiple sources by their IDs in a single batch query.
 */
export async function getSourcesByIds(ids: string[]): Promise<SourceRecord[]> {
  if (!ids || ids.length === 0) return [];
  try {
    const supabase = await createClient();
    if (!supabase) return [];

    const { data, error } = await supabase
      .from("sources")
      .select("*")
      .in("id", ids);

    if (error || !data) return [];
    return data.map(mapDatabaseSource);
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

    const source = mapDatabaseSource(s);

    // Find referencing events via relational join
    const { data: eventSources } = await supabase
      .from("event_sources")
      .select("event_id")
      .eq("source_id", id);

    const eventIds = (eventSources || []).map((es) => es.event_id);
    const events = eventIds.length > 0 ? await getEventsByIds(eventIds) : [];

    return {
      source,
      events,
    };
  } catch {
    return null;
  }
}
