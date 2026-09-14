import { createClient } from "@/lib/supabase/server";
import { getEvents } from "./events";
import type { EventRecord, PlaceRecord } from "./types";

/**
 * Retrieves all gazetteer places and venues from Supabase with strict error propagation.
 */
export async function getPlacesStrict(supabaseClient?: unknown): Promise<PlaceRecord[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = (supabaseClient !== undefined ? supabaseClient : (await createClient())) as any;
  if (!supabase) return [];

  const results: PlaceRecord[] = [];
  const seenIds = new Set<string>();
  const seenSlugs = new Set<string>();

  // 1. Fetch places with stable range pagination
  const pageSize = 1000;
  let placesPage = 0;
  let hasMorePlaces = true;

  while (hasMorePlaces) {
    const from = placesPage * pageSize;
    const to = from + pageSize - 1;
    const { data, error } = await supabase
      .from("places")
      .select("*")
      .order("city", { ascending: true })
      .order("id", { ascending: true })
      .range(from, to);

    if (error) throw error;

    if (data && data.length > 0) {
      data.forEach((p: Record<string, unknown>) => {
        seenIds.add(String(p.id));
        seenSlugs.add(String(p.slug));
        results.push({
          id: String(p.id),
          slug: String(p.slug),
          venue: String(p.venue || ""),
          city: String(p.city || "Unknown"),
          country: String(p.country || "Unknown"),
          latitude: typeof p.latitude === "number" ? p.latitude : null,
          longitude: typeof p.longitude === "number" ? p.longitude : null,
          placeType: p.place_type as PlaceRecord["placeType"],
        });
      });
    }

    if (!data || data.length < pageSize) {
      hasMorePlaces = false;
    } else {
      placesPage++;
    }
  }

  // 2. Fetch Event Model v2 venues with stable range pagination
  const allVenueRows: Array<{
    id: string;
    name: string;
    address_id?: string | null;
    latitude?: number | null;
    longitude?: number | null;
  }> = [];
  let venuesPage = 0;
  let hasMoreVenues = true;

  while (hasMoreVenues) {
    const from = venuesPage * pageSize;
    const to = from + pageSize - 1;
    const { data: venueRows, error: venueError } = await supabase
      .from("venues")
      .select("id, name, address_id, latitude, longitude")
      .order("name", { ascending: true })
      .order("id", { ascending: true })
      .range(from, to);

    if (venueError) throw venueError;

    if (venueRows && venueRows.length > 0) {
      allVenueRows.push(...venueRows);
    }

    if (!venueRows || venueRows.length < pageSize) {
      hasMoreVenues = false;
    } else {
      venuesPage++;
    }
  }

  if (allVenueRows.length > 0) {
    const addressIds = Array.from(new Set(allVenueRows.map((v) => v.address_id).filter(Boolean))) as string[];
    const addressesMap = new Map<string, { city?: string | null; country_code?: string | null }>();
    if (addressIds.length > 0) {
      const chunkSize = 200;
      for (let i = 0; i < addressIds.length; i += chunkSize) {
        const chunk = addressIds.slice(i, i + chunkSize);
        const { data: addressRows, error: addressError } = await supabase
          .from("addresses")
          .select("id, city, country_code")
          .in("id", chunk);
        if (addressError) throw addressError;
        if (addressRows) {
          addressRows.forEach((a: { id: string; city?: string | null; country_code?: string | null }) => addressesMap.set(a.id, a));
        }
      }
    }

    allVenueRows.forEach((v) => {
      if (!seenIds.has(v.id)) {
        const vSlug = v.id.replace(/^plc-|^ven-/, "");
        if (!seenSlugs.has(vSlug)) {
          const addr = v.address_id ? addressesMap.get(v.address_id) : undefined;
          seenIds.add(v.id);
          seenSlugs.add(vSlug);
          results.push({
            id: v.id,
            slug: vSlug,
            venue: v.name,
            city: addr?.city || "Unknown",
            country: addr?.country_code || "Unknown",
            latitude: v.latitude ?? null,
            longitude: v.longitude ?? null,
            placeType: "venue",
          });
        }
      }
    });
  }

  return results;
}

/**
 * Retrieves all gazetteer places and venues from Supabase.
 */
export async function getPlaces(supabaseClient?: unknown): Promise<PlaceRecord[]> {
  return await getPlacesStrict(supabaseClient);
}

/**
 * Retrieves a place by slug along with all events that took place there.
 */
export async function getPlaceBySlug(
  slug: string
): Promise<{ place: PlaceRecord; events: EventRecord[] } | null> {
  try {
    const supabase = await createClient();
    if (!supabase) return null;

    let place: PlaceRecord | null = null;

    const [{ data: p, error: placeError }, { data: v, error: venueError }] = await Promise.all([
      supabase.from("places").select("*").or(`slug.eq.${slug},id.eq.${slug}`).maybeSingle(),
      supabase.from("venues").select("id, name, address_id, latitude, longitude").or(`id.eq.${slug},id.eq.ven-${slug},id.eq.plc-${slug}`).maybeSingle(),
    ]);

    if (placeError) throw placeError;
    if (venueError) throw venueError;

    if (p) {
      place = {
        id: p.id,
        slug: p.slug,
        venue: p.venue,
        city: p.city,
        country: p.country,
        latitude: p.latitude,
        longitude: p.longitude,
        placeType: p.place_type,
      };
    } else if (v) {
      let city = "Unknown";
      let country = "Unknown";
      if (v.address_id) {
        const { data: addr, error: addressError } = await supabase
          .from("addresses")
          .select("city, country_code")
          .eq("id", v.address_id)
          .maybeSingle();
        if (addressError) throw addressError;
        if (addr) {
          city = addr.city || city;
          country = addr.country_code || country;
        }
      }
      place = {
        id: v.id,
        slug: v.id.replace(/^plc-|^ven-/, ""),
        venue: v.name,
        city,
        country,
        latitude: v.latitude ?? null,
        longitude: v.longitude ?? null,
        placeType: "venue",
      };
    }

    if (!place) return null;

    const allEvents: EventRecord[] = [];
    let page = 1;
    while (true) {
      const eventsResult = await getEvents({ placeSlug: slug, page, limit: 100 });
      if (eventsResult.error) {
        throw new Error(eventsResult.error);
      }
      if (!eventsResult.data || eventsResult.data.length === 0) break;
      allEvents.push(...eventsResult.data);
      if (page >= eventsResult.totalPages) break;
      page++;
    }

    return {
      place,
      events: allEvents,
    };
  } catch {
    return null;
  }
}
