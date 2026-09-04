import { createClient } from "@/lib/supabase/server";
import type { EventFilters, EventRecord, PaginatedResult, Participant } from "./types";

/**
 * Maps raw database event row and related joins into an application EventRecord.
 */
function mapDatabaseEvent(
  row: Record<string, unknown>,
  placesMap: Map<string, { venue?: string; city?: string; country?: string; latitude?: number | null; longitude?: number | null }>,
  participantsMap: Map<string, Participant[]>,
  sourcesMap: Map<string, string[]>
): EventRecord {
  const id = String(row.id || "");
  const placeId = row.place_id ? String(row.place_id) : "";
  const place = placesMap.get(placeId) || {};
  const participants = participantsMap.get(id) || [];
  const sourceIds = sourcesMap.get(id) || [];

  return {
    id,
    slug: String(row.slug || id),
    eventName: String(row.title || "Untitled Event"),
    startDate: String(row.start_date || ""),
    endDate: row.end_date ? String(row.end_date) : undefined,
    datePrecision: String(row.temporal_precision || "exact-day"),
    city: place.city || "Unknown",
    country: place.country || "Unknown",
    venueName: place.venue || undefined,
    latitude: typeof place.latitude === "number" ? place.latitude : (typeof row.latitude === "number" ? row.latitude : null),
    longitude: typeof place.longitude === "number" ? place.longitude : (typeof row.longitude === "number" ? row.longitude : null),
    summary: String(row.summary || ""),
    description: row.description ? String(row.description) : undefined,
    verificationStatus: (row.verification_status as "verified" | "provisional" | "disputed") || "verified",
    confidenceScore: typeof row.confidence_score === "number" ? row.confidence_score : 1.0,
    sourceIds,
    participants,
    categories: [String(row.event_type || "diplomatic")],
    eventTypes: [String(row.event_type || "historical-action")],
  };
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
      return {
        data: [],
        count: 0,
        page,
        pageSize,
        totalPages: 0,
        error: "Supabase connection is not configured.",
      };
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

    if (params.placeSlug) {
      const { data: placeData } = await supabase
        .from("places")
        .select("id")
        .eq("slug", params.placeSlug)
        .maybeSingle();
      if (placeData) {
        query = query.eq("place_id", placeData.id);
      }
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
      return {
        data: [],
        count: 0,
        page,
        pageSize,
        totalPages: 0,
        error: null,
      };
    }

    const eventIds = eventRows.map((e) => e.id);
    const placeIds = Array.from(new Set(eventRows.map((e) => e.place_id).filter(Boolean)));

    // Fetch places
    const placesMap = new Map();
    if (placeIds.length > 0) {
      const { data: placeRows } = await supabase
        .from("places")
        .select("id, venue, city, country, latitude, longitude")
        .in("id", placeIds);
      (placeRows || []).forEach((p) => placesMap.set(p.id, p));
    }

    // Fetch participants
    const participantsMap = new Map<string, Participant[]>();
    const { data: participantRows } = await supabase
      .from("event_people")
      .select("event_id, person_id, role_label, presence_confidence, capacity_title, attendance_mode")
      .in("event_id", eventIds);

    const personIds = Array.from(new Set((participantRows || []).map((p) => p.person_id)));
    const personNames = new Map<string, string>();
    if (personIds.length > 0) {
      const { data: peopleData } = await supabase
        .from("people")
        .select("id, canonical_name, display_name")
        .in("id", personIds);
      (peopleData || []).forEach((p) => personNames.set(p.id, p.display_name || p.canonical_name));
    }

    (participantRows || []).forEach((p) => {
      const list = participantsMap.get(p.event_id) || [];
      list.push({
        personId: p.person_id,
        name: personNames.get(p.person_id) || p.person_id,
        role: p.role_label,
        presenceConfidence: p.presence_confidence,
        capacityTitle: p.capacity_title || undefined,
        attendanceMode: p.attendance_mode || "physical",
      });
      participantsMap.set(p.event_id, list);
    });

    // Fetch source IDs
    const sourcesMap = new Map<string, string[]>();
    const { data: sourceRows } = await supabase
      .from("event_sources")
      .select("event_id, source_id")
      .in("event_id", eventIds);
    (sourceRows || []).forEach((s) => {
      const list = sourcesMap.get(s.event_id) || [];
      list.push(s.source_id);
      sourcesMap.set(s.event_id, list);
    });

    const total = count || 0;
    const events = eventRows.map((row) =>
      mapDatabaseEvent(row, placesMap, participantsMap, sourcesMap)
    );

    return {
      data: events,
      count: total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
      error: null,
    };
  } catch (err) {
    return {
      data: [],
      count: 0,
      page,
      pageSize,
      totalPages: 0,
      error: err instanceof Error ? err.message : "Unknown database error",
    };
  }
}

/**
 * Retrieves a single event by slug with full participants, coordinates, sources, and quotes.
 */
export async function getEventBySlug(slug: string): Promise<EventRecord | null> {
  try {
    const supabase = await createClient();
    if (!supabase) return null;

    const { data: eventRow, error } = await supabase
      .from("events")
      .select("*")
      .eq("slug", slug)
      .eq("publication_status", "published")
      .maybeSingle();

    if (error || !eventRow) return null;

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
    if (personIds.length > 0) {
      const { data: peopleData } = await supabase
        .from("people")
        .select("id, canonical_name, display_name")
        .in("id", personIds);
      (peopleData || []).forEach((p) => personNames.set(p.id, p.display_name || p.canonical_name));
    }

    const participants: Participant[] = (participantRows || []).map((p) => {
      const loc = locationsMap.get(p.id);
      return {
        personId: p.person_id,
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

    const placesMap = new Map([[eventRow.place_id, placeData]]);
    const participantsMap = new Map([[eventId, participants]]);
    const sourcesMap = new Map([[eventId, sourceIds]]);

    return mapDatabaseEvent(eventRow, placesMap, participantsMap, sourcesMap);
  } catch {
    return null;
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
 * Retrieves events associated with a specific person slug.
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

    if (!eventRows || eventRows.length === 0) return [];

    const placeIds = Array.from(new Set(eventRows.map((e) => e.place_id).filter(Boolean)));
    const placesMap = new Map();
    if (placeIds.length > 0) {
      const { data: placeRows } = await supabase
        .from("places")
        .select("id, venue, city, country, latitude, longitude")
        .in("id", placeIds);
      (placeRows || []).forEach((p) => placesMap.set(p.id, p));
    }

    return eventRows.map((row) =>
      mapDatabaseEvent(row, placesMap, new Map(), new Map())
    );
  } catch {
    return [];
  }
}

/**
 * Retrieves distinct event calendar years from the database.
 */
export async function getEventYears(): Promise<number[]> {
  try {
    const supabase = await createClient();
    if (!supabase) return [];

    const { data } = await supabase
      .from("events")
      .select("start_date")
      .eq("publication_status", "published")
      .order("start_date", { ascending: true });

    if (!data || data.length === 0) return [];

    const years = new Set<number>();
    data.forEach((row) => {
      if (row.start_date && row.start_date.length >= 4) {
        const year = parseInt(row.start_date.slice(0, 4), 10);
        if (!isNaN(year)) years.add(year);
      }
    });

    return Array.from(years).sort((a, b) => a - b);
  } catch {
    return [];
  }
}
