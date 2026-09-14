import { createClient } from "@/lib/supabase/server";
import { events as fallbackEvents, people as fallbackPeople, sources as fallbackSources } from "@/archive/legacy-data/rewind";
import { mapDatabaseSource } from "./sources";
import { normalizeIsoDate } from "./dates";
import { escapePostgrestValue } from "./search";
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

/** Maps an archived event fixture into the canonical application event shape. */
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
    confidence: (e.verificationStatus === "verified" ? "confirmed" : "moderate") as Confidence,
    confidenceScore: e.verificationStatus === "verified" ? 1.0 : 0.8,
    sourceIds: e.sourceIds || [],
    sources: sources,
    participants: (e.participants || []).map((p) => ({
      personId: p.personId,
      slug: (p as { slug?: string }).slug || p.personId.replace(/^p-/, ""),
      name: p.name,
      role: p.role,
      presenceConfidence: p.presenceConfidence,
    })),
    categories: e.categories || ["diplomatic"],
    eventTypes: e.eventTypes || ["historical-action"],
    quotes: e.quotes,
  };
}

/** Filters archived events when the canonical Supabase data source is unavailable. */
export function getFallbackEventsResult(params: EventFilters = {}): PaginatedResult<EventRecord> {
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
    const yr = params.year.trim();
    if (!/^\d{4}$/.test(yr)) {
      return { data: [], count: 0, page, pageSize, totalPages: 0, error: null };
    }
    filtered = filtered.filter((e) => e.startDate.startsWith(yr));
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
export function mapDatabaseEvent(
  row: Record<string, unknown>,
  placesMap: Map<string, { venue?: string; city?: string; country?: string; latitude?: number | null; longitude?: number | null }> = new Map(),
  participantsMap: Map<string, Participant[]> = new Map(),
  sourcesMap: Map<string, string[]> = new Map(),
  sourceEntitiesMap?: Map<string, SourceRecord>,
  quotesMap?: Map<string, { text: string; speaker: string; language: string; timestamp?: string | null }[]>
): EventRecord {
  const id = String(row.id || "");
  const placeId = row.place_id ? String(row.place_id) : "";
  const venueId = row.venue_id ? String(row.venue_id) : "";
  const addressId = row.address_id ? String(row.address_id) : "";
  const place = (placeId && placesMap.get(placeId)) || (venueId && placesMap.get(venueId)) || (addressId && placesMap.get(addressId)) || {};
  const participants = participantsMap.get(id) || [];
  const sourceIds = sourcesMap.get(id) || [];
  const sources = sourceEntitiesMap
    ? sourceIds.map((sId) => sourceEntitiesMap.get(sId)).filter((s): s is SourceRecord => Boolean(s))
    : [];

  return {
    id,
    slug: String(row.slug || id),
    eventName: String(row.title || "Untitled Event"),
    startDate: normalizeIsoDate(row.start_date || ""),
    endDate: row.end_date ? normalizeIsoDate(row.end_date) : undefined,
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
    sourceIds: Array.isArray(sourceIds) ? sourceIds : [],
    sources: Array.isArray(sources) ? sources : [],
    participants: Array.isArray(participants) ? participants : [],
    categories: [String(row.event_type || "diplomatic")],
    eventTypes: [String(row.event_type || "historical-action")],
    quotes: quotesMap?.get(id) || [],
    organisations: [],
    medium: Array.isArray(row.medium)
      ? row.medium.map((value) => String(value))
      : row.medium
        ? [String(row.medium)]
        : [],
    media: [],
    provenance: [],
    conflictingClaims: [],
  };
}

/**
 * Hydrates an array of raw event rows with places, venues, addresses, participants, and source references.
 */
async function hydrateEventRows(
  supabase: NonNullable<Awaited<ReturnType<typeof createClient>>>,
  eventRows: Record<string, unknown>[]
): Promise<EventRecord[]> {
  if (!eventRows || eventRows.length === 0) return [];

  const eventIds = eventRows.map((e) => String(e.id || ""));
  const placeIds = Array.from(new Set(eventRows.map((e) => e.place_id ? String(e.place_id) : "").filter(Boolean)));
  const venueIds = Array.from(new Set(eventRows.map((e) => e.venue_id ? String(e.venue_id) : "").filter(Boolean)));
  const directAddressIds = Array.from(new Set(eventRows.map((e) => e.address_id ? String(e.address_id) : "").filter(Boolean)));

  // Fetch places with chunking
  const placesMap = new Map<string, { venue?: string; city?: string; country?: string; latitude?: number | null; longitude?: number | null }>();
  if (placeIds.length > 0) {
    const chunkSize = 500;
    for (let i = 0; i < placeIds.length; i += chunkSize) {
      const chunk = placeIds.slice(i, i + chunkSize);
      const { data: placeRows, error: placeError } = await supabase
        .from("places")
        .select("id, venue, city, country, latitude, longitude")
        .in("id", chunk);
      if (placeError) {
        throw placeError;
      }
      (placeRows || []).forEach((p) => placesMap.set(p.id, p));
    }
  }

  // Fetch Event Model v2 venues and linked addresses
  const venueAddressIds = new Set<string>();
  const venuesMap = new Map<string, { id: string; name: string; address_id?: string | null; latitude?: number | null; longitude?: number | null }>();
  if (venueIds.length > 0) {
    const chunkSize = 500;
    for (let i = 0; i < venueIds.length; i += chunkSize) {
      const chunk = venueIds.slice(i, i + chunkSize);
      const { data: venueRows, error: venueError } = await supabase
        .from("venues")
        .select("id, name, address_id, latitude, longitude")
        .in("id", chunk);
      if (venueError) {
        throw venueError;
      } else if (venueRows) {
        venueRows.forEach((v) => {
          venuesMap.set(v.id, v);
          if (v.address_id) venueAddressIds.add(v.address_id);
        });
      }
    }
  }

  // Fetch Event Model v2 addresses
  const allAddressIds = Array.from(new Set([...directAddressIds, ...venueAddressIds]));
  const addressesMap = new Map<string, { id: string; city?: string | null; country?: string | null; latitude?: number | null; longitude?: number | null; formatted_english?: string | null; descriptive_location?: string | null }>();
  if (allAddressIds.length > 0) {
    const chunkSize = 500;
    for (let i = 0; i < allAddressIds.length; i += chunkSize) {
      const chunk = allAddressIds.slice(i, i + chunkSize);
      const { data: addressRows, error: addressError } = await supabase
        .from("addresses")
        .select("id, city, country_code, latitude, longitude, formatted_english, descriptive_location")
        .in("id", chunk);
      if (addressError) {
        throw addressError;
      } else if (addressRows) {
        addressRows.forEach((a) => {
          addressesMap.set(a.id, {
            ...a,
            country: (a as { country_code?: string | null }).country_code || null,
          });
        });
      }
    }
  }

  // Synthesize venues and addresses into placesMap for unified location resolution
  venuesMap.forEach((v) => {
    const addr = v.address_id ? addressesMap.get(v.address_id) : undefined;
    placesMap.set(v.id, {
      venue: v.name,
      city: addr?.city || "Unknown",
      country: addr?.country || "Unknown",
      latitude: typeof v.latitude === "number" ? v.latitude : (typeof addr?.latitude === "number" ? addr.latitude : null),
      longitude: typeof v.longitude === "number" ? v.longitude : (typeof addr?.longitude === "number" ? addr.longitude : null),
    });
  });

  addressesMap.forEach((a) => {
    if (!placesMap.has(a.id)) {
      placesMap.set(a.id, {
        venue: a.descriptive_location || a.formatted_english || undefined,
        city: a.city || "Unknown",
        country: a.country || "Unknown",
        latitude: typeof a.latitude === "number" ? a.latitude : null,
        longitude: typeof a.longitude === "number" ? a.longitude : null,
      });
    }
  });

  // Fetch participants with bounded eventId chunking to prevent URL length overflow
  const participantsMap = new Map<string, Participant[]>();
  let participantRows: Record<string, unknown>[] = [];
  const EVENT_ID_CHUNK_SIZE = 100;
  for (let eIdx = 0; eIdx < eventIds.length; eIdx += EVENT_ID_CHUNK_SIZE) {
    const eventIdChunk = eventIds.slice(eIdx, eIdx + EVENT_ID_CHUNK_SIZE);
    const batchSize = 1000;
    let page = 0;
    let hasMore = true;
    while (hasMore) {
      const from = page * batchSize;
      const to = from + batchSize - 1;
      const { data, error } = await supabase
        .from("event_people")
        .select("event_id, person_id, role_label, presence_confidence, capacity_title, attendance_mode")
        .in("event_id", eventIdChunk)
        .order("event_id", { ascending: true })
        .order("person_id", { ascending: true })
        .range(from, to);
      if (error) {
        throw error;
      }
      if (!data || data.length === 0) {
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
    const chunkSize = 1000;
    for (let i = 0; i < personIds.length; i += chunkSize) {
      const chunk = personIds.slice(i, i + chunkSize);
      const { data: peopleData, error: peopleError } = await supabase
        .from("people")
        .select("id, slug, canonical_name, display_name")
        .in("id", chunk);
      if (peopleError) {
        throw peopleError;
      }
      (peopleData || []).forEach((p) => {
        personNames.set(p.id, p.display_name || p.canonical_name);
        personSlugs.set(p.id, p.slug);
      });
    }
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

  // Fetch source IDs and source records with bounded eventId chunking
  const sourcesMap = new Map<string, string[]>();
  const allSourceIds = new Set<string>();
  let sourceRows: Record<string, unknown>[] = [];
  for (let eIdx = 0; eIdx < eventIds.length; eIdx += EVENT_ID_CHUNK_SIZE) {
    const eventIdChunk = eventIds.slice(eIdx, eIdx + EVENT_ID_CHUNK_SIZE);
    const batchSize = 1000;
    let page = 0;
    let hasMore = true;
    while (hasMore) {
      const from = page * batchSize;
      const to = from + batchSize - 1;
      const { data, error } = await supabase
        .from("event_sources")
        .select("event_id, source_id")
        .in("event_id", eventIdChunk)
        .order("event_id", { ascending: true })
        .order("source_id", { ascending: true })
        .range(from, to);
      if (error) {
        throw error;
      }
      if (!data || data.length === 0) {
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
    const sourceIdList = Array.from(allSourceIds);
    const chunkSize = 1000;
    for (let i = 0; i < sourceIdList.length; i += chunkSize) {
      const chunk = sourceIdList.slice(i, i + chunkSize);
      const { data: rawSources, error: sourcesError } = await supabase
        .from("sources")
        .select("*")
        .in("id", chunk);
      if (sourcesError) {
        throw sourcesError;
      }
      (rawSources || []).forEach((src) => {
        sourceEntitiesMap.set(src.id, mapDatabaseSource(src));
      });
    }
  }

  // Fetch quotes with bounded eventId chunking and range pagination
  const quotesMap = new Map<string, { text: string; speaker: string; language: string; timestamp?: string | null }[]>();
  let quoteRows: Record<string, unknown>[] = [];
  for (let eIdx = 0; eIdx < eventIds.length; eIdx += EVENT_ID_CHUNK_SIZE) {
    const eventIdChunk = eventIds.slice(eIdx, eIdx + EVENT_ID_CHUNK_SIZE);
    const batchSize = 1000;
    let qPage = 0;
    let hasMoreQuotes = true;
    while (hasMoreQuotes) {
      const from = qPage * batchSize;
      const to = from + batchSize - 1;
      const { data: rawQuotes, error: quotesError } = await supabase
        .from("quotes")
        .select("event_id, quote, speaker_id, language, timestamp_in_media")
        .in("event_id", eventIdChunk)
        .order("event_id", { ascending: true })
        .order("id", { ascending: true })
        .range(from, to);
      if (quotesError) {
        throw quotesError;
      }
      if (!rawQuotes || rawQuotes.length === 0) {
        break;
      }
      quoteRows = quoteRows.concat(rawQuotes);
      if (rawQuotes.length < batchSize) {
        hasMoreQuotes = false;
      } else {
        qPage++;
      }
    }
  }

  // Resolve any extra speaker names from quotes if not already in personNames
  const extraSpeakerIds = Array.from(new Set(quoteRows.map((q) => String(q.speaker_id || "")).filter((sId) => sId && !personNames.has(sId))));
  if (extraSpeakerIds.length > 0) {
    const chunkSize = 1000;
    for (let i = 0; i < extraSpeakerIds.length; i += chunkSize) {
      const chunk = extraSpeakerIds.slice(i, i + chunkSize);
      const { data: speakerPeople, error: speakerError } = await supabase
        .from("people")
        .select("id, canonical_name, display_name")
        .in("id", chunk);
      if (speakerError) throw speakerError;
      (speakerPeople || []).forEach((p) => {
        personNames.set(p.id, p.display_name || p.canonical_name);
      });
    }
  }

  quoteRows.forEach((q) => {
    const evId = String(q.event_id || "");
    const list = quotesMap.get(evId) || [];
    const speakerId = String(q.speaker_id || "");
    list.push({
      text: String(q.quote || ""),
      speaker: personNames.get(speakerId) || speakerId || "Unknown Speaker",
      language: String(q.language || "en"),
      timestamp: q.timestamp_in_media ? String(q.timestamp_in_media) : null,
    });
    quotesMap.set(evId, list);
  });

  return eventRows.map((row) =>
    mapDatabaseEvent(row, placesMap, participantsMap, sourcesMap, sourceEntitiesMap, quotesMap)
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
      if (process.env.NODE_ENV === "production") {
        return {
          data: [],
          count: 0,
          page,
          pageSize,
          totalPages: 0,
          error: "Database configuration unavailable in production environment",
        };
      }
      return getFallbackEventsResult(params);
    }

    const selectColumns = params.personSlug
      ? "*, event_people!inner(person_id)"
      : "*";

    let query = supabase
      .from("events")
      .select(selectColumns, { count: "exact" })
      .eq("publication_status", "published")
      .order("start_date", { ascending: false })
      .order("id", { ascending: true });

    if (params.search && params.search.trim()) {
      const escaped = escapePostgrestValue(params.search.trim());
      query = query.or(`title.ilike."%${escaped}%",summary.ilike."%${escaped}%"`);
    }

    if (params.year) {
      const yr = params.year.trim();
      if (!/^\d{4}$/.test(yr)) {
        return { data: [], count: 0, page, pageSize, totalPages: 0, error: null };
      }
      query = query.like("start_date", `${yr}%`);
    }

    if (params.verification) {
      query = query.eq("verification_status", params.verification);
    }

    if (params.category && params.category !== "All") {
      const escaped = escapePostgrestValue(params.category.trim());
      query = query.or(`event_type.ilike."%${escaped}%",title.ilike."%${escaped}%"`);
    }

    if (params.personSlug) {
      const { data: personData, error: personError } = await supabase
        .from("people")
        .select("id")
        .eq("slug", params.personSlug)
        .maybeSingle();

      if (personError) {
        return {
          data: [],
          count: 0,
          page,
          pageSize,
          totalPages: 0,
          error: personError.message,
        };
      }

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

      query = query.eq("event_people.person_id", personData.id);
    }

    if (params.placeSlug) {
      const [{ data: placeData, error: placeError }, { data: venueData, error: venueError }] = await Promise.all([
        supabase
          .from("places")
          .select("id")
          .or(`slug.eq.${params.placeSlug},id.eq.${params.placeSlug}`)
          .maybeSingle(),
        supabase
          .from("venues")
          .select("id")
          .or(`id.eq.${params.placeSlug},id.eq.ven-${params.placeSlug},id.eq.plc-${params.placeSlug}`)
          .maybeSingle(),
      ]);

      if (placeError) {
        return {
          data: [],
          count: 0,
          page,
          pageSize,
          totalPages: 0,
          error: placeError.message,
        };
      }

      if (venueError) {
        return {
          data: [],
          count: 0,
          page,
          pageSize,
          totalPages: 0,
          error: venueError.message,
        };
      }

      const pId = placeData?.id;
      const vId = venueData?.id;

      if (pId && vId) {
        query = query.or(`place_id.eq.${pId},venue_id.eq.${vId}`);
      } else if (pId) {
        query = query.eq("place_id", pId);
      } else if (vId) {
        query = query.eq("venue_id", vId);
      } else {
        return {
          data: [],
          count: 0,
          page,
          pageSize,
          totalPages: 0,
          error: null,
        };
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
      const total = count || 0;
      return {
        data: [],
        count: total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
        error: null,
      };
    }

    try {
      const events = await hydrateEventRows(supabase, eventRows as unknown as Record<string, unknown>[]);
      const total = count || 0;

      return {
        data: events,
        count: total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
        error: null,
      };
    } catch (hydrateError: unknown) {
      return {
        data: [],
        count: count || 0,
        page,
        pageSize,
        totalPages: Math.ceil((count || 0) / pageSize),
        error: hydrateError instanceof Error ? hydrateError.message : "Failed to hydrate events",
      };
    }
  } catch (err: unknown) {
    if (process.env.NODE_ENV === "production") {
      return {
        data: [],
        count: 0,
        page,
        pageSize,
        totalPages: 0,
        error: err instanceof Error ? err.message : "Internal database error",
      };
    }
    return getFallbackEventsResult(params);
  }
}

/**
 * Retrieves events by an array of event IDs, fully hydrated.
 */
export async function getEventsByIds(ids: string[], supabaseClient?: unknown): Promise<EventRecord[]> {
  if (!ids || ids.length === 0) return [];
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = (supabaseClient !== undefined ? supabaseClient : (await createClient())) as any;
    if (!supabase) return [];

    const CHUNK_SIZE = 500;
    const allEventRows: Record<string, unknown>[] = [];

    for (let i = 0; i < ids.length; i += CHUNK_SIZE) {
      const chunk = ids.slice(i, i + CHUNK_SIZE);
      const { data: eventRows, error } = await supabase
        .from("events")
        .select("*")
        .in("id", chunk)
        .eq("publication_status", "published")
        .order("start_date", { ascending: false });

      if (error) {
        console.error("Error querying events by IDs chunk:", error);
        return [];
      }
      if (eventRows) {
        allEventRows.push(...eventRows);
      }
    }

    if (allEventRows.length === 0) return [];
    allEventRows.sort((a, b) =>
      String(b.start_date || "").localeCompare(String(a.start_date || ""))
    );

    const HYDRATE_CHUNK_SIZE = 500;
    const hydratedEvents: EventRecord[] = [];
    for (let i = 0; i < allEventRows.length; i += HYDRATE_CHUNK_SIZE) {
      const batch = allEventRows.slice(i, i + HYDRATE_CHUNK_SIZE);
      const hydratedBatch = await hydrateEventRows(supabase, batch);
      hydratedEvents.push(...hydratedBatch);
    }
    return hydratedEvents;
  } catch {
    return [];
  }
}

/**
 * Retrieves a single event by slug with full participants, coordinates, sources, and quotes.
 * Returns a discriminated { data, error } result preserving database and query failures.
 */
export async function getEventBySlug(
  slug: string,
  supabaseClient?: unknown
): Promise<{ data: EventRecord | null; error: string | null }> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = (supabaseClient !== undefined ? supabaseClient : (await createClient())) as any;
    if (supabase) {
      const { data: eventRow, error } = await supabase
        .from("events")
        .select("*")
        .eq("slug", slug)
        .eq("publication_status", "published")
        .maybeSingle();

      if (error) {
        console.error("Failed to query event by slug from database:", error);
        return { data: null, error: "The requested event record could not be loaded. Please try again later." };
      }
      if (!eventRow) {
        return { data: null, error: null };
      }

      const eventId = eventRow.id;

      // Fetch place, venue, or address location
      let placeData: { venue?: string; city?: string; country?: string; latitude?: number | null; longitude?: number | null } = {};
      if (eventRow.place_id) {
        const { data: p, error: pError } = await supabase
          .from("places")
          .select("venue, city, country, latitude, longitude")
          .eq("id", eventRow.place_id)
          .maybeSingle();
        if (pError) {
          console.error("Failed to query place for event:", pError);
          return { data: null, error: "The requested event record could not be loaded. Please try again later." };
        }
        if (p) placeData = p;
      } else if (eventRow.venue_id) {
        const { data: v, error: vError } = await supabase
          .from("venues")
          .select("name, address_id, latitude, longitude")
          .eq("id", eventRow.venue_id)
          .maybeSingle();
        if (vError) {
          console.error("Failed to query venue for event:", vError);
          return { data: null, error: "The requested event record could not be loaded. Please try again later." };
        }
        if (v) {
          let addr: { city?: string | null; country?: string | null; latitude?: number | null; longitude?: number | null } | null = null;
          if (v.address_id) {
            const { data: a, error: aError } = await supabase
              .from("addresses")
              .select("city, country_code, latitude, longitude")
              .eq("id", v.address_id)
              .maybeSingle();
            if (aError) {
              console.error("Failed to query address for venue:", aError);
              return { data: null, error: "The requested event record could not be loaded. Please try again later." };
            }
            addr = a ? { city: a.city, country: a.country_code, latitude: a.latitude, longitude: a.longitude } : null;
          }
          placeData = {
            venue: v.name,
            city: addr?.city || "Unknown",
            country: addr?.country || "Unknown",
            latitude: typeof v.latitude === "number" ? v.latitude : (typeof addr?.latitude === "number" ? addr.latitude : null),
            longitude: typeof v.longitude === "number" ? v.longitude : (typeof addr?.longitude === "number" ? addr.longitude : null),
          };
        }
      } else if (eventRow.address_id) {
        const { data: a, error: aError } = await supabase
          .from("addresses")
          .select("city, country_code, latitude, longitude, formatted_english, descriptive_location")
          .eq("id", eventRow.address_id)
          .maybeSingle();
        if (aError) {
          console.error("Failed to query address for event:", aError);
          return { data: null, error: "The requested event record could not be loaded. Please try again later." };
        }
        if (a) {
          placeData = {
            venue: a.descriptive_location || a.formatted_english || undefined,
            city: a.city || "Unknown",
            country: a.country_code || "Unknown",
            latitude: typeof a.latitude === "number" ? a.latitude : null,
            longitude: typeof a.longitude === "number" ? a.longitude : null,
          };
        }
      }

      // Fetch participants and precise location coords
      let participantRows: Array<{
        id: string;
        person_id: string;
        role_label: string | null;
        presence_confidence: string | null;
        capacity_title: string | null;
        attendance_mode: string | null;
      }> = [];
      {
        const batchSize = 1000;
        let page = 0;
        let hasMoreParticipants = true;
        while (hasMoreParticipants) {
          const from = page * batchSize;
          const to = from + batchSize - 1;
          const { data, error: partError } = await supabase
            .from("event_people")
            .select("id, person_id, role_label, presence_confidence, capacity_title, attendance_mode")
            .eq("event_id", eventId)
            .order("id", { ascending: true })
            .range(from, to);
          if (partError) {
            console.error("Failed to query event participants:", partError);
            return { data: null, error: "The requested event record could not be loaded. Please try again later." };
          }
          if (!data || data.length === 0) break;
          participantRows = participantRows.concat(data);
          if (data.length < batchSize) {
            hasMoreParticipants = false;
          } else {
            page++;
          }
        }
      }

      const eventPersonIds = participantRows.map((p) => p.id);
      const locationsMap = new Map();
      if (eventPersonIds.length > 0) {
        for (let i = 0; i < eventPersonIds.length; i += 500) {
          const chunk = eventPersonIds.slice(i, i + 500);
          const { data: locRows, error: locError } = await supabase
            .from("event_person_locations")
            .select("event_person_id, latitude, longitude, coordinate_precision")
            .in("event_person_id", chunk)
            .eq("is_principal_location", true);
          if (locError) {
            console.error("Failed to query event person locations:", locError);
            return { data: null, error: "The requested event record could not be loaded. Please try again later." };
          }
          (locRows || []).forEach((loc: Record<string, unknown>) =>
            locationsMap.set(String(loc.event_person_id), loc)
          );
        }
      }

      const personIds = Array.from(new Set(participantRows.map((p) => p.person_id)));
      const personNames = new Map<string, string>();
      const personSlugs = new Map<string, string>();
      if (personIds.length > 0) {
        for (let i = 0; i < personIds.length; i += 500) {
          const chunk = personIds.slice(i, i + 500);
          const { data: peopleData, error: peopleError } = await supabase
            .from("people")
            .select("id, slug, canonical_name, display_name")
            .in("id", chunk);
          if (peopleError) {
            console.error("Failed to query people for event:", peopleError);
            return { data: null, error: "The requested event record could not be loaded. Please try again later." };
          }
          (peopleData || []).forEach((p: { id: string; display_name?: string | null; canonical_name?: string | null; slug?: string }) => {
            personNames.set(p.id, p.display_name || p.canonical_name || p.id);
            if (p.slug) personSlugs.set(p.id, p.slug);
          });
        }
      }

      const participants: Participant[] = participantRows.map((p) => {
        const loc = locationsMap.get(p.id);
        return {
          personId: p.person_id,
          slug: personSlugs.get(p.person_id),
          name: personNames.get(p.person_id) || p.person_id,
          role: p.role_label || undefined,
          presenceConfidence: p.presence_confidence || undefined,
          capacityTitle: p.capacity_title || undefined,
          attendanceMode: p.attendance_mode || "physical",
          latitude: loc?.latitude ?? null,
          longitude: loc?.longitude ?? null,
          coordinatePrecision: loc?.coordinate_precision,
        };
      });

      // Fetch sources
      let eventSourcesRows: Array<{ source_id: string }> = [];
      {
        const batchSize = 1000;
        let page = 0;
        let hasMoreSources = true;
        while (hasMoreSources) {
          const from = page * batchSize;
          const to = from + batchSize - 1;
          const { data, error: esError } = await supabase
            .from("event_sources")
            .select("source_id")
            .eq("event_id", eventId)
            .order("id", { ascending: true })
            .range(from, to);
          if (esError) {
            console.error("Failed to query event sources:", esError);
            return {
              data: null,
              error: "The requested event record could not be loaded. Please try again later.",
            };
          }
          if (!data || data.length === 0) break;
          eventSourcesRows = eventSourcesRows.concat(data);
          if (data.length < batchSize) {
            hasMoreSources = false;
          } else {
            page++;
          }
        }
      }

      const sourceIds = Array.from(new Set((eventSourcesRows || []).map((s) => s.source_id)));
      const sourceEntitiesMap = new Map<string, SourceRecord>();
      if (sourceIds.length > 0) {
        for (let i = 0; i < sourceIds.length; i += 500) {
          const chunk = sourceIds.slice(i, i + 500);
          const { data: rawSources, error: srcError } = await supabase
            .from("sources")
            .select("*")
            .in("id", chunk);
          if (srcError) {
            console.error("Failed to query sources for event:", srcError);
            return { data: null, error: "The requested event record could not be loaded. Please try again later." };
          }
          (rawSources || []).forEach((src: Record<string, unknown>) => {
            sourceEntitiesMap.set(String(src.id), mapDatabaseSource(src));
          });
        }
      }

      // Fetch quotes with pagination and deterministic ordering
      let quotesRows: Record<string, unknown>[] = [];
      {
        const batchSize = 1000;
        let qPage = 0;
        let hasMoreQuotes = true;
        while (hasMoreQuotes) {
          const from = qPage * batchSize;
          const to = from + batchSize - 1;
          const { data: qData, error: quotesError } = await supabase
            .from("quotes")
            .select("quote, speaker_id, language, timestamp_in_media")
            .eq("event_id", eventId)
            .order("id", { ascending: true })
            .range(from, to);
          if (quotesError) {
            console.error("Failed to query quotes for event:", quotesError);
            return { data: null, error: "The requested event record could not be loaded. Please try again later." };
          }
          if (!qData || qData.length === 0) break;
          quotesRows = quotesRows.concat(qData);
          if (qData.length < batchSize) {
            hasMoreQuotes = false;
          } else {
            qPage++;
          }
        }
      }

      // Resolve any extra speaker names from quotes if not already in personNames
      const extraSpeakerIds = Array.from(
        new Set(
          quotesRows
            .map((q) => String(q.speaker_id || ""))
            .filter((sId) => sId && !personNames.has(sId))
        )
      );
      if (extraSpeakerIds.length > 0) {
        for (let i = 0; i < extraSpeakerIds.length; i += 500) {
          const chunk = extraSpeakerIds.slice(i, i + 500);
          const { data: speakerPeople, error: speakerError } = await supabase
            .from("people")
            .select("id, canonical_name, display_name")
            .in("id", chunk);
          if (speakerError) {
            console.error("Failed to query speaker people for event quotes:", speakerError);
            return { data: null, error: "The requested event record could not be loaded. Please try again later." };
          }
          (speakerPeople || []).forEach((p: { id: string; display_name?: string | null; canonical_name?: string | null }) => {
            personNames.set(p.id, p.display_name || p.canonical_name || p.id);
          });
        }
      }

      const quotesMap = new Map<string, { text: string; speaker: string; language: string; timestamp?: string | null }[]>();
      if (quotesRows && quotesRows.length > 0) {
        const quotesList = quotesRows.map((q) => {
          const speakerId = String(q.speaker_id || "");
          return {
            text: String(q.quote || ""),
            speaker: personNames.get(speakerId) || speakerId || "Unknown Speaker",
            language: String(q.language || "en"),
            timestamp: q.timestamp_in_media ? String(q.timestamp_in_media) : null,
          };
        });
        quotesMap.set(eventId, quotesList);
      }

      const locationKey = String(eventRow.place_id || eventRow.venue_id || eventRow.address_id || "");
      const placesMap = new Map([[locationKey, placeData]]);
      const participantsMap = new Map([[eventId, participants]]);
      const sourcesMap = new Map([[eventId, sourceIds]]);

      return {
        data: mapDatabaseEvent(eventRow, placesMap, participantsMap, sourcesMap, sourceEntitiesMap, quotesMap),
        error: null,
      };
    }

    if (process.env.NODE_ENV === "production") {
      return { data: null, error: "Database configuration unavailable in production environment" };
    }
    const fb = fallbackEvents.find((e) => e.slug === slug || e.id === slug);
    return { data: fb ? mapFallbackEvent(fb) : null, error: null };
  } catch (err) {
    console.error("Unexpected error loading event by slug:", err);
    return { data: null, error: "The requested event record could not be loaded. Please try again later." };
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
export async function getEventsByPerson(personSlug: string, supabaseClient?: unknown): Promise<EventRecord[]> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = (supabaseClient !== undefined ? supabaseClient : (await createClient())) as any;
    if (supabase) {
      const { data: person, error: personError } = await supabase
        .from("people")
        .select("id")
        .eq("slug", personSlug)
        .maybeSingle();

      if (personError || !person) return [];

      const participations: { event_id: string }[] = [];
      const partPageSize = 1000;
      let partFrom = 0;
      let partHasMore = true;

      while (partHasMore) {
        const { data: partRows, error: partError } = await supabase
          .from("event_people")
          .select("event_id")
          .eq("person_id", person.id)
          .order("event_id", { ascending: true })
          .range(partFrom, partFrom + partPageSize - 1);

        if (partError || !partRows) return [];
        participations.push(...partRows);

        if (partRows.length < partPageSize) {
          partHasMore = false;
        } else {
          partFrom += partPageSize;
        }
      }

      const eventIds = Array.from(new Set(participations.map((p) => p.event_id)));
      if (eventIds.length === 0) return [];

      const eventRows: Record<string, unknown>[] = [];
      const chunkSize = 500;
      for (let i = 0; i < eventIds.length; i += chunkSize) {
        const chunk = eventIds.slice(i, i + chunkSize);
        const { data: chunkRows, error: eventsError } = await supabase
          .from("events")
          .select("*")
          .in("id", chunk)
          .eq("publication_status", "published")
          .order("start_date", { ascending: true })
          .order("id", { ascending: true });

        if (eventsError || !chunkRows) return [];
        eventRows.push(...chunkRows);
      }

      if (eventRows.length === 0) {
        return [];
      }

      eventRows.sort((a, b) => {
        const dateCmp = String(a.start_date || "").localeCompare(String(b.start_date || ""));
        return dateCmp !== 0 ? dateCmp : String(a.id || "").localeCompare(String(b.id || ""));
      });

      const HYDRATE_CHUNK_SIZE = 500;
      const hydratedEvents: EventRecord[] = [];
      for (let i = 0; i < eventRows.length; i += HYDRATE_CHUNK_SIZE) {
        const batch = eventRows.slice(i, i + HYDRATE_CHUNK_SIZE);
        const hydratedBatch = await hydrateEventRows(supabase, batch);
        hydratedEvents.push(...hydratedBatch);
      }
      return hydratedEvents;
    }

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
  } catch {
    return [];
  }
}

/**
 * Retrieves distinct event calendar years from the database.
 */
export async function getEventYearsStrict(supabaseClient?: unknown): Promise<number[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = (supabaseClient !== undefined ? supabaseClient : (await createClient())) as any;
  if (supabase) {
    const allRows: { start_date: string }[] = [];
    const pageSize = 1000;
    let from = 0;
    let hasMore = true;

    while (hasMore) {
      const { data, error } = await supabase
        .from("events")
        .select("start_date")
        .eq("publication_status", "published")
        .order("start_date", { ascending: true })
        .order("id", { ascending: true })
        .range(from, from + pageSize - 1);

      if (error) {
        throw new Error(`Failed to query event years: ${error.message}`);
      }

      if (data) {
        allRows.push(...data);
      }

      if (!data || data.length < pageSize) {
        hasMore = false;
      } else {
        from += pageSize;
      }
    }

    const years = new Set<number>();
    allRows.forEach((row) => {
      if (row.start_date && row.start_date.length >= 4) {
        const year = parseInt(row.start_date.slice(0, 4), 10);
        if (!isNaN(year)) years.add(year);
      }
    });
    return Array.from(years).sort((a, b) => a - b);
  }

  const years = new Set<number>();
  fallbackEvents.forEach((e) => {
    if (e.startDate && e.startDate.length >= 4) {
      const year = parseInt(e.startDate.slice(0, 4), 10);
      if (!isNaN(year)) years.add(year);
    }
  });
  return Array.from(years).sort((a, b) => a - b);
}

/** Returns distinct indexed event years in descending order. */
export async function getEventYears(supabaseClient?: unknown): Promise<number[]> {
  try {
    return await getEventYearsStrict(supabaseClient);
  } catch {
    return [];
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

        allRows = allRows.concat(data);
        if (data.length < pageSize) {
          hasMore = false;
        } else {
          page++;
        }
      }

      if (queryError) {
        return {
          data: [],
          error: queryError,
        };
      }

      if (allRows.length === 0) {
        return { data: [], error: null };
      }

      try {
        const hydrated = await hydrateEventRows(supabase, allRows);
        return { data: hydrated, error: null };
      } catch (hydrationError) {
        return {
          data: [],
          error: hydrationError instanceof Error ? hydrationError.message : "Failed to hydrate events",
        };
      }
    }

    if (process.env.NODE_ENV === "production") {
      return {
        data: [],
        error: "Database configuration unavailable in production environment",
      };
    }

    return {
      data: fallbackEvents.map(mapFallbackEvent).sort((a, b) => b.startDate.localeCompare(a.startDate)),
      error: null,
    };
  } catch (err) {
    return {
      data: [],
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

/**
 * Retrieves all published speech events matching speech/statement/interview/press/bilateral/plenary patterns.
 */
export async function getSpeechEventsWithStatus(): Promise<{ data: EventRecord[]; error: string | null }> {
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
          .or('event_type.ilike."%speech%",event_type.ilike."%statement%",event_type.ilike."%interview%",event_type.ilike."%press%",event_type.ilike."%bilateral%",event_type.ilike."%plenary%"')
          .order("start_date", { ascending: false })
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

        allRows = allRows.concat(data);
        if (data.length < pageSize) {
          hasMore = false;
        } else {
          page++;
        }
      }

      if (queryError) {
        return { data: [], error: queryError };
      }

      const hydrated = await hydrateEventRows(supabase, allRows);
      return { data: hydrated, error: null };
    }
  } catch (err: unknown) {
    return {
      data: [],
      error: err instanceof Error ? err.message : "Failed to load speech events",
    };
  }

  if (process.env.NODE_ENV === "production") {
    return {
      data: [],
      error: "Database configuration unavailable in production environment",
    };
  }

  // Fallback if Supabase not configured in non-production
  const fallback = fallbackEvents
    .map(mapFallbackEvent)
    .filter((e) =>
      (e.eventTypes || []).some((t) => /Speech|Statement|Interview|Press|bilateral|plenary/i.test(t))
    );
  return { data: fallback, error: null };
}
