import { createClient } from "@/lib/supabase/server";
import { events as fallbackEvents, people as fallbackPeople, sources as fallbackSources } from "@/archive/legacy-data/rewind";
import { mapDatabaseSource } from "./sources";
import type { Confidence, EventFilters, EventRecord, PaginatedResult, Participant, Precision, SourceRecord } from "./types";

const fallbackSourceMap = new Map<string, SourceRecord>(
  (fallbackSources || []).map((s) => [
    s.id,
    {
      id: s.id,
      title: s.title,
      publisher: s.publisher,
      sourceType: s.sourceType,
      classification: s.classification as "primary" | "secondary",
      tier: (s.classification === "primary" ? "tier-a" : "tier-c") as SourceRecord["tier"],
      url: s.url,
      publicationDate: s.publicationDate,
      accessedDate: s.accessedDate,
      language: s.language,
    },
  ])
);

function mapFallbackEvent(e: (typeof fallbackEvents)[0]): EventRecord {
  const sources = (e.sourceIds || [])
    .map((sId) => fallbackSourceMap.get(sId))
    .filter((s): s is SourceRecord => Boolean(s));

  return {
    id: e.id,
    slug: e.slug,
    eventName: e.eventName,
    startDate: e.startDate,
    endDate: e.endDate || null,
    datePrecision: (e.datePrecision || "exact-day") as Precision,
    city: e.city || "Unknown",
    country: e.country || "Unknown",
    venueName: e.venueName || null,
    latitude: e.latitude ?? null,
    longitude: e.longitude ?? null,
    summary: e.summary,
    description: e.summary || null,
    verificationStatus: e.verificationStatus,
    confidence: e.verificationStatus === "verified" ? "confirmed" : "moderate",
    confidenceScore: e.verificationStatus === "verified" ? 1.0 : 0.8,
    sourceIds: e.sourceIds || [],
    sources: sources.length > 0 ? sources : undefined,
    participants: (e.participants || []).map((p) => ({
      personId: p.personId,
      name: p.name,
      role: p.role,
      presenceConfidence: p.presenceConfidence,
    })),
    categories: e.categories || ["diplomatic"],
    eventTypes: e.eventTypes || ["historical-action"],
    quotes: e.quotes,
  };
}

function getFallbackEventsResult(params: EventFilters = {}): PaginatedResult<EventRecord> {
  const page = Math.max(1, params.page || 1);
  const pageSize = Math.min(100, Math.max(1, params.limit || 50));
  const offset = (page - 1) * pageSize;

  let filtered = fallbackEvents.slice();

  if (params.search && params.search.trim()) {
    const term = params.search.trim().toLowerCase();
    filtered = filtered.filter((e) =>
      e.eventName.toLowerCase().includes(term) ||
      e.summary.toLowerCase().includes(term) ||
      e.city.toLowerCase().includes(term) ||
      e.country.toLowerCase().includes(term)
    );
  }

  if (params.year) {
    filtered = filtered.filter((e) => e.startDate.startsWith(params.year!));
  }

  if (params.verification) {
    filtered = filtered.filter((e) => e.verificationStatus === params.verification);
  }

  if (params.category && params.category !== "All") {
    const catLower = params.category.toLowerCase();
    filtered = filtered.filter((e) =>
      (e.eventTypes || []).some((t) => t.toLowerCase().includes(catLower)) ||
      (e.categories || []).some((c) => c.toLowerCase().includes(catLower))
    );
  }

  if (params.personSlug) {
    const person = fallbackPeople.find((p) => p.slug === params.personSlug || p.id === params.personSlug);
    if (!person) {
      return { data: [], count: 0, page, pageSize, totalPages: 0, error: null };
    }
    filtered = filtered.filter((e) =>
      (e.participants || []).some((p) => p.personId === person.id || p.personId === person.slug)
    );
  }

  if (params.placeSlug) {
    filtered = filtered.filter((e) => {
      const slug = `${(e.city || "unknown").toLowerCase().replace(/\s+/g, "-")}-${(e.venueName || "general").toLowerCase().replace(/[^\w]/g, "-").slice(0, 20)}`;
      return slug === params.placeSlug || e.city.toLowerCase().includes(params.placeSlug!.toLowerCase());
    });
  }

  filtered.sort((a, b) => b.startDate.localeCompare(a.startDate));

  const total = filtered.length;
  const sliced = filtered.slice(offset, offset + pageSize).map(mapFallbackEvent);

  return {
    data: sliced,
    count: total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
    error: null,
  };
}

/**
 * Maps raw database event row and related joins into an application EventRecord.
 */
function mapDatabaseEvent(
  row: Record<string, unknown>,
  placesMap: Map<string, { venue?: string; city?: string; country?: string; latitude?: number | null; longitude?: number | null }>,
  participantsMap: Map<string, Participant[]>,
  sourcesMap: Map<string, string[]>,
  sourceEntitiesMap?: Map<string, SourceRecord>
): EventRecord {
  const id = String(row.id || "");
  const placeId = row.place_id ? String(row.place_id) : "";
  const place = (placeId && placesMap.get(placeId)) || {};
  const participants = participantsMap.get(id) || [];
  const sourceIds = sourcesMap.get(id) || [];
  const sources = sourceEntitiesMap
    ? sourceIds.map((sId) => sourceEntitiesMap.get(sId)).filter((s): s is SourceRecord => Boolean(s))
    : undefined;

  return {
    id,
    slug: String(row.slug || id),
    eventName: String(row.title || "Untitled Event"),
    startDate: String(row.start_date || ""),
    endDate: row.end_date ? String(row.end_date) : undefined,
    datePrecision: (String(row.temporal_precision || "exact-day")) as Precision,
    city: place.city || "Unknown",
    country: place.country || "Unknown",
    venueName: place.venue || undefined,
    latitude: typeof place.latitude === "number" ? place.latitude : (typeof row.latitude === "number" ? row.latitude : null),
    longitude: typeof place.longitude === "number" ? place.longitude : (typeof row.longitude === "number" ? row.longitude : null),
    summary: String(row.summary || ""),
    description: row.description ? String(row.description) : undefined,
    verificationStatus: (row.verification_status as "verified" | "provisional" | "disputed") || "verified",
    confidence: (row.confidence as Confidence) || (typeof row.confidence_score === "number" && row.confidence_score < 0.7 ? "moderate" : "confirmed"),
    confidenceScore: typeof row.confidence_score === "number" ? row.confidence_score : 1.0,
    sourceIds,
    sources,
    participants,
    categories: [String(row.event_type || "diplomatic")],
    eventTypes: [String(row.event_type || "historical-action")],
  };
}

/**
 * Hydrates an array of raw event rows with places, participants, and source references.
 */
async function hydrateEventRows(
  supabase: NonNullable<Awaited<ReturnType<typeof createClient>>>,
  eventRows: Record<string, unknown>[]
): Promise<EventRecord[]> {
  if (!eventRows || eventRows.length === 0) return [];

  const eventIds = eventRows.map((e) => String(e.id || ""));
  const placeIds = Array.from(new Set(eventRows.map((e) => e.place_id ? String(e.place_id) : "").filter(Boolean)));

  // Fetch places
  const placesMap = new Map();
  if (placeIds.length > 0) {
    const { data: placeRows } = await supabase
      .from("places")
      .select("id, venue, city, country, latitude, longitude")
      .in("id", placeIds);
    (placeRows || []).forEach((p) => placesMap.set(p.id, p));
  }

  // Fetch participants with pagination to exceed Supabase 1,000-row limit
  const participantsMap = new Map<string, Participant[]>();
  let participantRows: Record<string, unknown>[] = [];
  {
    const batchSize = 1000;
    let page = 0;
    let hasMore = true;
    while (hasMore) {
      const from = page * batchSize;
      const to = from + batchSize - 1;
      const { data, error } = await supabase
        .from("event_people")
        .select("event_id, person_id, role_label, presence_confidence, capacity_title, attendance_mode")
        .in("event_id", eventIds)
        .range(from, to);
      if (error || !data || data.length === 0) {
        break;
      }
      participantRows = participantRows.concat(data);
      if (data.length < batchSize) {
        hasMore = false;
      } else {
        page++;
      }
    }
  }

  const typedParticipants = participantRows as {
    event_id: string;
    person_id: string;
    role_label?: string;
    presence_confidence?: string;
    capacity_title?: string;
    attendance_mode?: string;
  }[];

  const personIds = Array.from(new Set(typedParticipants.map((p) => p.person_id)));
  const personNames = new Map<string, string>();
  const personSlugs = new Map<string, string>();
  if (personIds.length > 0) {
    const { data: peopleData } = await supabase
      .from("people")
      .select("id, slug, canonical_name, display_name")
      .in("id", personIds);
    (peopleData || []).forEach((p) => {
      personNames.set(p.id, p.display_name || p.canonical_name);
      personSlugs.set(p.id, p.slug);
    });
  }

  typedParticipants.forEach((p) => {
    const list = participantsMap.get(p.event_id) || [];
    list.push({
      personId: p.person_id,
      slug: personSlugs.get(p.person_id),
      name: personNames.get(p.person_id) || p.person_id,
      role: p.role_label,
      presenceConfidence: p.presence_confidence,
      capacityTitle: p.capacity_title || undefined,
      attendanceMode: p.attendance_mode || "physical",
    });
    participantsMap.set(p.event_id, list);
  });

  // Fetch source IDs and source records with pagination to exceed 1,000-row limit
  const sourcesMap = new Map<string, string[]>();
  const allSourceIds = new Set<string>();
  let sourceRows: Record<string, unknown>[] = [];
  {
    const batchSize = 1000;
    let page = 0;
    let hasMore = true;
    while (hasMore) {
      const from = page * batchSize;
      const to = from + batchSize - 1;
      const { data, error } = await supabase
        .from("event_sources")
        .select("event_id, source_id")
        .in("event_id", eventIds)
        .range(from, to);
      if (error || !data || data.length === 0) {
        break;
      }
      sourceRows = sourceRows.concat(data);
      if (data.length < batchSize) {
        hasMore = false;
      } else {
        page++;
      }
    }
  }
  (sourceRows as { event_id: string; source_id: string }[]).forEach((s) => {
    const list = sourcesMap.get(s.event_id) || [];
    list.push(s.source_id);
    sourcesMap.set(s.event_id, list);
    allSourceIds.add(s.source_id);
  });

  const sourceEntitiesMap = new Map<string, SourceRecord>();
  if (allSourceIds.size > 0) {
    const { data: rawSources } = await supabase
      .from("sources")
      .select("*")
      .in("id", Array.from(allSourceIds));
    (rawSources || []).forEach((src) => {
      sourceEntitiesMap.set(src.id, mapDatabaseSource(src));
    });
  }

  return eventRows.map((row) =>
    mapDatabaseEvent(row, placesMap, participantsMap, sourcesMap, sourceEntitiesMap)
  );
}

/**
 * Retrieves a paginated list of published events with optional filtering.
 */
export async function getEvents(params: EventFilters = {}): Promise<PaginatedResult<EventRecord>> {
  const page = Math.max(1, params.page || 1);
  const pageSize = Math.min(100, Math.max(1, params.limit || 50));
  const offset = (page - 1) * pageSize;

  try {
    const supabase = await createClient();
    if (!supabase) {
      return getFallbackEventsResult(params);
    }

    let query = supabase
      .from("events")
      .select("*", { count: "exact" })
      .eq("publication_status", "published")
      .order("start_date", { ascending: false });

    if (params.search && params.search.trim()) {
      const term = params.search.trim();
      query = query.or(`title.ilike.%${term}%,summary.ilike.%${term}%`);
    }

    if (params.year) {
      query = query.gte("start_date", `${params.year}-01-01`).lte("start_date", `${params.year}-12-31T23:59:59Z`);
    }

    if (params.verification) {
      query = query.eq("verification_status", params.verification);
    }

    if (params.category && params.category !== "All") {
      query = query.or(`event_type.ilike.%${params.category}%,title.ilike.%${params.category}%`);
    }

    if (params.personSlug) {
      const { data: personData } = await supabase
        .from("people")
        .select("id")
        .eq("slug", params.personSlug)
        .maybeSingle();

      if (!personData) {
        return {
          data: [],
          count: 0,
          page,
          pageSize,
          totalPages: 0,
          error: null,
        };
      }

      const { data: participation } = await supabase
        .from("event_people")
        .select("event_id")
        .eq("person_id", personData.id);

      const eventIds = (participation || []).map((p) => p.event_id);
      if (eventIds.length === 0) {
        return {
          data: [],
          count: 0,
          page,
          pageSize,
          totalPages: 0,
          error: null,
        };
      }
      query = query.in("id", eventIds);
    }

    if (params.placeSlug) {
      const { data: placeData } = await supabase
        .from("places")
        .select("id")
        .eq("slug", params.placeSlug)
        .maybeSingle();
      if (!placeData) {
        return {
          data: [],
          count: 0,
          page,
          pageSize,
          totalPages: 0,
          error: null,
        };
      }
      query = query.eq("place_id", placeData.id);
    }

    query = query.range(offset, offset + pageSize - 1);

    const { data: eventRows, count, error } = await query;

    if (error) {
      return {
        data: [],
        count: 0,
        page,
        pageSize,
        totalPages: 0,
        error: error.message,
      };
    }

    if (!eventRows || eventRows.length === 0) {
      return getFallbackEventsResult(params);
    }

    const events = await hydrateEventRows(supabase, eventRows);
    const total = count || 0;

    return {
      data: events,
      count: total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
      error: null,
    };
  } catch {
    return getFallbackEventsResult(params);
  }
}

/**
 * Retrieves events by an array of event IDs, fully hydrated.
 */
export async function getEventsByIds(ids: string[]): Promise<EventRecord[]> {
  if (!ids || ids.length === 0) return [];
  try {
    const supabase = await createClient();
    if (!supabase) return [];

    const { data: eventRows, error } = await supabase
      .from("events")
      .select("*")
      .in("id", ids)
      .eq("publication_status", "published")
      .order("start_date", { ascending: false });

    if (error || !eventRows) return [];
    return hydrateEventRows(supabase, eventRows);
  } catch {
    return [];
  }
}

/**
 * Retrieves a single event by slug with full participants, coordinates, sources, and quotes.
 */
export async function getEventBySlug(slug: string): Promise<EventRecord | null> {
  try {
    const supabase = await createClient();
    if (supabase) {
      const { data: eventRow, error } = await supabase
        .from("events")
        .select("*")
        .eq("slug", slug)
        .eq("publication_status", "published")
        .maybeSingle();

      if (!error && eventRow) {
        const eventId = eventRow.id;

        // Fetch place
        let placeData: { venue?: string; city?: string; country?: string; latitude?: number | null; longitude?: number | null } = {};
        if (eventRow.place_id) {
          const { data: p } = await supabase
            .from("places")
            .select("venue, city, country, latitude, longitude")
            .eq("id", eventRow.place_id)
            .maybeSingle();
          if (p) placeData = p;
        }

        // Fetch participants and precise location coords
        const { data: participantRows } = await supabase
          .from("event_people")
          .select("id, person_id, role_label, presence_confidence, capacity_title, attendance_mode")
          .eq("event_id", eventId);

        const eventPersonIds = (participantRows || []).map((p) => p.id);
        const locationsMap = new Map();
        if (eventPersonIds.length > 0) {
          const { data: locRows } = await supabase
            .from("event_person_locations")
            .select("event_person_id, latitude, longitude, coordinate_precision")
            .in("event_person_id", eventPersonIds)
            .eq("is_principal_location", true);
          (locRows || []).forEach((loc) => locationsMap.set(loc.event_person_id, loc));
        }

        const personIds = (participantRows || []).map((p) => p.person_id);
        const personNames = new Map<string, string>();
        const personSlugs = new Map<string, string>();
        if (personIds.length > 0) {
          const { data: peopleData } = await supabase
            .from("people")
            .select("id, slug, canonical_name, display_name")
            .in("id", personIds);
          (peopleData || []).forEach((p) => {
            personNames.set(p.id, p.display_name || p.canonical_name);
            personSlugs.set(p.id, p.slug);
          });
        }

        const participants: Participant[] = (participantRows || []).map((p) => {
          const loc = locationsMap.get(p.id);
          return {
            personId: p.person_id,
            slug: personSlugs.get(p.person_id),
            name: personNames.get(p.person_id) || p.person_id,
            role: p.role_label,
            presenceConfidence: p.presence_confidence,
            capacityTitle: p.capacity_title || undefined,
            attendanceMode: p.attendance_mode || "physical",
            latitude: loc?.latitude ?? null,
            longitude: loc?.longitude ?? null,
            coordinatePrecision: loc?.coordinate_precision,
          };
        });

        // Fetch sources
        const { data: eventSourcesRows } = await supabase
          .from("event_sources")
          .select("source_id")
          .eq("event_id", eventId);
        const sourceIds = (eventSourcesRows || []).map((s) => s.source_id);

        const sourceEntitiesMap = new Map<string, SourceRecord>();
        if (sourceIds.length > 0) {
          const { data: rawSources } = await supabase
            .from("sources")
            .select("*")
            .in("id", sourceIds);
          (rawSources || []).forEach((src) => {
            sourceEntitiesMap.set(src.id, mapDatabaseSource(src));
          });
        }

        const placesMap = new Map([[eventRow.place_id, placeData]]);
        const participantsMap = new Map([[eventId, participants]]);
        const sourcesMap = new Map([[eventId, sourceIds]]);

        return mapDatabaseEvent(eventRow, placesMap, participantsMap, sourcesMap, sourceEntitiesMap);
      }
    }

    const fb = fallbackEvents.find((e) => e.slug === slug || e.id === slug);
    return fb ? mapFallbackEvent(fb) : null;
  } catch {
    const fb = fallbackEvents.find((e) => e.slug === slug || e.id === slug);
    return fb ? mapFallbackEvent(fb) : null;
  }
}

/**
 * Retrieves adjacent chronological events around a specific event.
 */
export async function getAdjacentEvents(
  startDate: string,
  currentId: string
): Promise<{ prev: EventRecord | null; next: EventRecord | null }> {
  try {
    const supabase = await createClient();
    if (!supabase) return { prev: null, next: null };

    // Previous event (earlier in time)
    const { data: prevRows } = await supabase
      .from("events")
      .select("*")
      .eq("publication_status", "published")
      .or(`start_date.lt.${startDate},and(start_date.eq.${startDate},id.lt.${currentId})`)
      .order("start_date", { ascending: false })
      .order("id", { ascending: false })
      .limit(1);

    // Next event (later in time)
    const { data: nextRows } = await supabase
      .from("events")
      .select("*")
      .eq("publication_status", "published")
      .or(`start_date.gt.${startDate},and(start_date.eq.${startDate},id.gt.${currentId})`)
      .order("start_date", { ascending: true })
      .order("id", { ascending: true })
      .limit(1);

    const [prevEvents, nextEvents] = await Promise.all([
      hydrateEventRows(supabase, prevRows || []),
      hydrateEventRows(supabase, nextRows || []),
    ]);

    return {
      prev: prevEvents[0] || null,
      next: nextEvents[0] || null,
    };
  } catch {
    return { prev: null, next: null };
  }
}

/**
 * Retrieves verified events for home highlights.
 */
export async function getVerifiedEvents(limit = 10): Promise<EventRecord[]> {
  const result = await getEvents({ limit, verification: "verified" });
  return result.data;
}

/**
 * Retrieves events associated with a specific person slug, fully hydrated.
 */
export async function getEventsByPerson(personSlug: string): Promise<EventRecord[]> {
  try {
    const supabase = await createClient();
    if (!supabase) return [];

    const { data: person } = await supabase
      .from("people")
      .select("id")
      .eq("slug", personSlug)
      .maybeSingle();

    if (!person) return [];

    const { data: participations } = await supabase
      .from("event_people")
      .select("event_id")
      .eq("person_id", person.id);

    const eventIds = (participations || []).map((p) => p.event_id);
    if (eventIds.length === 0) return [];

    const { data: eventRows } = await supabase
      .from("events")
      .select("*")
      .in("id", eventIds)
      .eq("publication_status", "published")
      .order("start_date", { ascending: true });

    if (!eventRows || eventRows.length === 0) {
      const fbPerson = fallbackPeople.find((p) => p.slug === personSlug || p.id === personSlug);
      if (fbPerson) {
        return fallbackEvents
          .filter((e) =>
            (e.participants || []).some(
              (p) => p.personId === fbPerson.id || p.personId === fbPerson.slug
            )
          )
          .map(mapFallbackEvent)
          .sort((a, b) => a.startDate.localeCompare(b.startDate));
      }
      return [];
    }
    return hydrateEventRows(supabase, eventRows);
  } catch {
    const fbPerson = fallbackPeople.find((p) => p.slug === personSlug || p.id === personSlug);
    if (fbPerson) {
      return fallbackEvents
        .filter((e) =>
          (e.participants || []).some(
            (p) => p.personId === fbPerson.id || p.personId === fbPerson.slug
          )
        )
        .map(mapFallbackEvent)
        .sort((a, b) => a.startDate.localeCompare(b.startDate));
    }
    return [];
  }
}

/**
 * Retrieves distinct event calendar years from the database.
 */
export async function getEventYears(): Promise<number[]> {
  try {
    const supabase = await createClient();
    if (supabase) {
      const { data } = await supabase
        .from("events")
        .select("start_date")
        .eq("publication_status", "published")
        .order("start_date", { ascending: true });

      if (data && data.length > 0) {
        const years = new Set<number>();
        data.forEach((row) => {
          if (row.start_date && row.start_date.length >= 4) {
            const year = parseInt(row.start_date.slice(0, 4), 10);
            if (!isNaN(year)) years.add(year);
          }
        });
        return Array.from(years).sort((a, b) => a - b);
      }
    }

    const years = new Set<number>();
    fallbackEvents.forEach((e) => {
      if (e.startDate && e.startDate.length >= 4) {
        const year = parseInt(e.startDate.slice(0, 4), 10);
        if (!isNaN(year)) years.add(year);
      }
    });
    return Array.from(years).sort((a, b) => a - b);
  } catch {
    const years = new Set<number>();
    fallbackEvents.forEach((e) => {
      if (e.startDate && e.startDate.length >= 4) {
        const year = parseInt(e.startDate.slice(0, 4), 10);
        if (!isNaN(year)) years.add(year);
      }
    });
    return Array.from(years).sort((a, b) => a - b);
  }
}

/**
 * Retrieves all published events with explicit status and error reporting.
 */
export async function getAllEventsWithStatus(): Promise<{ data: EventRecord[]; error: string | null }> {
  try {
    const supabase = await createClient();
    if (supabase) {
      let allRows: Record<string, unknown>[] = [];
      const pageSize = 1000;
      let page = 0;
      let hasMore = true;
      let queryError: string | null = null;

      while (hasMore) {
        const from = page * pageSize;
        const to = from + pageSize - 1;
        const { data, error } = await supabase
          .from("events")
          .select("*")
          .eq("publication_status", "published")
          .order("start_date", { ascending: false })
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

        allRows = allRows.concat(data);
        if (data.length < pageSize) {
          hasMore = false;
        } else {
          page++;
        }
      }

      if (queryError) {
        return {
          data: fallbackEvents.map(mapFallbackEvent).sort((a, b) => b.startDate.localeCompare(a.startDate)),
          error: queryError,
        };
      }

      if (allRows.length > 0) {
        const hydrated = await hydrateEventRows(supabase, allRows);
        return { data: hydrated, error: null };
      }
    }

    return {
      data: fallbackEvents.map(mapFallbackEvent).sort((a, b) => b.startDate.localeCompare(a.startDate)),
      error: null,
    };
  } catch (err) {
    return {
      data: fallbackEvents.map(mapFallbackEvent).sort((a, b) => b.startDate.localeCompare(a.startDate)),
      error: err instanceof Error ? err.message : "Failed to load events",
    };
  }
}

/**
 * Retrieves all published events, automatically paginating internally.
 */
export async function getAllEvents(): Promise<EventRecord[]> {
  const res = await getAllEventsWithStatus();
  return res.data;
}
