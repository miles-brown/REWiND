import { createClient } from "@/lib/supabase/server";
import { sources as fallbackSources } from "@/archive/legacy-data/rewind";
import { isStandardIsoDate, normalizeIsoDate } from "./dates";
import type { EventRecord, SourceRecord } from "./types";

export function mapDatabaseSource(s: Record<string, unknown>): SourceRecord {
  const pubDateNorm = s.publication_date ? normalizeIsoDate(s.publication_date) : undefined;
  const accDateNorm = s.accessed_date
    ? normalizeIsoDate(s.accessed_date)
    : s.accessedDate
    ? normalizeIsoDate(s.accessedDate)
    : undefined;

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
    publicationDate: pubDateNorm && isStandardIsoDate(pubDateNorm) ? pubDateNorm : undefined,
    accessedDate: accDateNorm && isStandardIsoDate(accDateNorm) ? accDateNorm : undefined,
    language: s.language ? String(s.language) : undefined,
    trustScore: typeof s.trust_score === "number" ? s.trust_score : undefined,
  };
}

export function mapArchiveSource(s: (typeof fallbackSources)[0]): SourceRecord {
  return {
    id: s.id,
    title: s.title,
    publisher: s.publisher,
    sourceType: s.sourceType as SourceRecord["sourceType"],
    classification: s.classification,
    tier: (s.classification === "primary" ? "tier-a" : "tier-c") as SourceRecord["tier"],
    url: s.url,
    publicationDate: s.publicationDate,
    accessedDate: s.accessedDate,
    language: s.language,
  };
}

function getFallbackSources(filters: { tier?: string; type?: string; search?: string } = {}): SourceRecord[] {
  let fb = (fallbackSources || []).map(mapArchiveSource);

  if (filters.tier) {
    fb = fb.filter((s) => s.tier === filters.tier);
  }
  if (filters.type) {
    fb = fb.filter((s) => s.sourceType === filters.type);
  }
  if (filters.search && filters.search.trim()) {
    const term = filters.search.trim().toLowerCase();
    fb = fb.filter((s) => s.title.toLowerCase().includes(term) || s.publisher.toLowerCase().includes(term));
  }
  return fb;
}

/**
 * Retrieves primary and corroborating sources from Supabase with status and error reporting.
 */
export async function getSourcesWithStatus(
  filters: { tier?: string; type?: string; search?: string } = {}
): Promise<{ data: SourceRecord[]; error: string | null }> {
  try {
    const supabase = await createClient();
    if (supabase) {
      const allRows: Record<string, unknown>[] = [];
      const pageSize = 1000;
      let from = 0;
      let hasMore = true;

      while (hasMore) {
        let query = supabase
          .from("sources")
          .select("*")
          .order("created_at", { ascending: false })
          .order("id", { ascending: true })
          .range(from, from + pageSize - 1);

        if (filters.tier) {
          query = query.eq("tier", filters.tier);
        }

        if (filters.type) {
          query = query.eq("source_type", filters.type);
        }

        if (filters.search && filters.search.trim()) {
          const term = filters.search.trim();
          const escaped = term.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
          query = query.or(`title.ilike."%${escaped}%",publisher.ilike."%${escaped}%"`);
        }

        const { data, error } = await query;
        if (error) {
          return { data: [], error: error.message };
        }
        if (!data || data.length === 0) {
          break;
        }

        allRows.push(...data);
        if (data.length < pageSize) {
          hasMore = false;
        } else {
          from += pageSize;
        }
      }

      return { data: allRows.map(mapDatabaseSource), error: null };
    }

    if (process.env.NODE_ENV === "production") {
      return {
        data: [],
        error: "Database configuration unavailable in production environment",
      };
    }
    return { data: getFallbackSources(filters), error: null };
  } catch (err) {
    return {
      data: [],
      error: err instanceof Error ? err.message : "Failed to load sources",
    };
  }
}

/**
 * Retrieves primary and corroborating sources from Supabase with optional filters.
 */
export async function getSources(
  filters: { tier?: string; type?: string; search?: string } = {}
): Promise<SourceRecord[]> {
  const res = await getSourcesWithStatus(filters);
  return res.data;
}

/**
 * Fast aggregate query returning counts of published events linked to each source ID with error reporting.
 */
export async function getSourceEventCountsWithStatus(): Promise<{
  data: Record<string, number>;
  error: string | null;
}> {
  try {
    const supabase = await createClient();
    if (!supabase) return { data: {}, error: null };

    let allRows: { source_id: string }[] = [];
    const batchSize = 1000;
    let page = 0;
    let hasMore = true;
    let queryError: string | null = null;

    while (hasMore) {
      const from = page * batchSize;
      const to = from + batchSize - 1;
      const { data, error } = await supabase
        .from("event_sources")
        .select("source_id, events!inner(publication_status)")
        .eq("events.publication_status", "published")
        .order("id", { ascending: true })
        .range(from, to);

      if (error) {
        queryError = error.message;
        hasMore = false;
        break;
      }

      if (!data || data.length === 0) {
        hasMore = false;
        break;
      }

      allRows = allRows.concat(data as { source_id: string }[]);
      if (data.length < batchSize) {
        hasMore = false;
      } else {
        page++;
      }
    }

    if (queryError) {
      return { data: {}, error: queryError };
    }

    const counts: Record<string, number> = {};
    for (const row of allRows) {
      const sId = String(row.source_id);
      counts[sId] = (counts[sId] || 0) + 1;
    }
    return { data: counts, error: null };
  } catch (err) {
    return { data: {}, error: err instanceof Error ? err.message : "Failed to load source counts" };
  }
}

/**
 * Fast aggregate query returning counts of published events linked to each source ID.
 */
export async function getSourceEventCounts(): Promise<Record<string, number>> {
  const res = await getSourceEventCountsWithStatus();
  return res.data;
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

export async function getArchiveSourceById(
  id: string
): Promise<{ source: SourceRecord; events: EventRecord[] } | null> {
  const fbSrc = fallbackSources.find((s) => s.id === id);
  if (!fbSrc) return null;
  const { getAllEvents } = await import("./events");
  const all = await getAllEvents();
  const linked = all.filter((e) => e.sourceIds.includes(id));
  return {
    source: mapArchiveSource(fbSrc),
    events: linked,
  };
}

/**
 * Retrieves a single source by ID along with events that reference it.
 */
export async function getSourceById(
  id: string
): Promise<{ source: SourceRecord; events: EventRecord[] } | null> {
  try {
    const supabase = await createClient();
    if (supabase) {
      const { data: s, error } = await supabase
        .from("sources")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (!error && s) {
        const source = mapDatabaseSource(s);

        // Find referencing events via relational join with full pagination
        const eventIds: string[] = [];
        {
          const batchSize = 1000;
          let esPage = 0;
          let hasMore = true;
          while (hasMore) {
            const from = esPage * batchSize;
            const to = from + batchSize - 1;
            const { data: eventSources, error: esError } = await supabase
              .from("event_sources")
              .select("event_id")
              .eq("source_id", id)
              .order("event_id", { ascending: true })
              .range(from, to);

            if (esError) {
              throw esError;
            }
            if (!eventSources || eventSources.length === 0) {
              break;
            }
            eventSources.forEach((es) => eventIds.push(es.event_id));
            if (eventSources.length < batchSize) {
              hasMore = false;
            } else {
              esPage++;
            }
          }
        }

        let events: EventRecord[] = [];
        if (eventIds.length > 0) {
          const { getEventsByIds } = await import("./events");
          events = await getEventsByIds(eventIds);
        }

        return {
          source,
          events,
        };
      }

      if (error) {
        if (process.env.NODE_ENV === "production") {
          throw error;
        }
        return await getArchiveSourceById(id);
      }

      if (!s) {
        // Successful Supabase query with no matching source: return canonical miss
        return null;
      }
    }

    if (process.env.NODE_ENV === "production") {
      throw new Error("Database client unavailable in production");
    }
    return await getArchiveSourceById(id);
  } catch (err) {
    if (process.env.NODE_ENV === "production") {
      throw err;
    }
    return await getArchiveSourceById(id);
  }
}
