import { createClient } from "@/lib/supabase/server";
import { getEvents } from "./events";
import type { EventRecord, PlaceRecord } from "./types";

/**
 * Retrieves all gazetteer places and venues from Supabase.
 */
export async function getPlaces(): Promise<PlaceRecord[]> {
  try {
    const supabase = await createClient();
    if (!supabase) return [];

    const { data, error } = await supabase
      .from("places")
      .select("*")
      .order("city", { ascending: true });

    if (error) throw error;

    const results: PlaceRecord[] = [];
    const seenIds = new Set<string>();
    const seenSlugs = new Set<string>();

    if (data) {
      data.forEach((p) => {
        seenIds.add(p.id);
        seenSlugs.add(p.slug);
        results.push({
          id: p.id,
          slug: p.slug,
          venue: p.venue,
          city: p.city,
          country: p.country,
          latitude: p.latitude,
          longitude: p.longitude,
          placeType: p.place_type,
        });
      });
    }

    // Include Event Model v2 venues & locations (Codex Issue 7)
    const { data: venueRows, error: venueError } = await supabase
      .from("venues")
      .select("id, name, address_id, latitude, longitude");

    if (venueError) throw venueError;

    if (venueRows && venueRows.length > 0) {
      const addressIds = Array.from(new Set(venueRows.map((v) => v.address_id).filter(Boolean)));
      const addressesMap = new Map<string, { city?: string | null; country_code?: string | null }>();
      if (addressIds.length > 0) {
        const { data: addressRows, error: addressError } = await supabase
          .from("addresses")
          .select("id, city, country_code")
          .in("id", addressIds);
        if (addressError) throw addressError;
        if (addressRows) {
          addressRows.forEach((a) => addressesMap.set(a.id, a));
        }
      }

      venueRows.forEach((v) => {
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
  } catch {
    return [];
  }
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

    const { data: p, error: placeError } = await supabase
      .from("places")
      .select("*")
      .or(`slug.eq.${slug},id.eq.${slug}`)
      .maybeSingle();

    if (placeError) throw placeError;

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
    } else {
      // Check Event Model v2 venues (Codex Issue 7)
      const { data: v, error: venueError } = await supabase
        .from("venues")
        .select("id, name, address_id, latitude, longitude")
        .or(`id.eq.${slug},id.eq.ven-${slug},id.eq.plc-${slug}`)
        .maybeSingle();

      if (venueError) throw venueError;

      if (v) {
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
