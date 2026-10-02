import { createClient } from "@/lib/supabase/server";
import { getEvents } from "./events";
import type { EventRecord, PlaceRecord } from "./types";

/**
 * Authoritative WGS-84 coordinate gazetteer for verified cities, diplomatic venues, and geographical landmarks.
 * Format: [latitude, longitude]
 */
export const GLOBAL_GAZETTEER_COORDINATES: Record<string, [number, number]> = {
  // Diplomatic & Governmental Venues
  "united nations headquarters": [40.7499, -73.9674],
  "un headquarters": [40.7499, -73.9674],
  "white house": [38.8977, -77.0365],
  "state dining room, white house": [38.8977, -77.0365],
  "oval office, white house": [38.8977, -77.0365],
  "us capitol": [38.8899, -77.0090],
  "knesset": [31.7766, 35.2052],
  "prime minister’s office": [31.7818, 35.2012],
  "prime minister's office": [31.7818, 35.2012],
  "prime minister’s office (remote broadcast)": [31.7818, 35.2012],
  "prime minister's official media channels": [31.7818, 35.2012],
  "mar-a-lago club": [26.6771, -80.0370],
  "mar-a-lago": [26.6771, -80.0370],
  "770 eastern parkway": [40.6689, -73.9427],
  "royal palace of madrid": [40.4179, -3.7143],
  "mount herzl": [31.7744, 35.1806],
  "yad vashem": [31.7742, 35.1754],
  "weizmann institute of science": [31.9056, 34.8094],
  "ben-gurion international airport": [32.0005, 34.8707],
  "national press club": [38.8972, -77.0315],
  "wye river conference center": [38.9440, -76.0810],
  "camp david": [39.6483, -77.4639],
  
  // Cities & Districts
  "jerusalem": [31.7683, 35.2137],
  "tel aviv": [32.0853, 34.7818],
  "lod area": [31.9870, 34.8860],
  "lod": [31.9514, 34.8881],
  "rehovot": [31.8928, 34.8113],
  "erez": [31.5608, 34.5678],
  "gaza": [31.5017, 34.4668],
  "maale adumim": [31.7772, 35.2979],
  "haifa": [32.7940, 34.9896],
  "beersheba": [31.2529, 34.7915],
  "ramallah": [31.9038, 35.2034],
  "new york": [40.7128, -74.0060],
  "brooklyn": [40.6782, -73.9442],
  "washington": [38.9072, -77.0369],
  "washington dc": [38.9072, -77.0369],
  "washington, d.c.": [38.9072, -77.0369],
  "palm beach": [26.7056, -80.0364],
  "wye": [38.9440, -76.0810],
  "london": [51.5072, -0.1276],
  "paris": [48.8566, 2.3522],
  "madrid": [40.4168, -3.7038],
  "cairo": [30.0444, 31.2357],
  "tokyo": [35.6762, 139.6503],
  "moscow": [55.7558, 37.6173],
  "bucharest": [44.4268, 26.1025],
  "mexico city": [19.4326, -99.1332],
  "rome": [41.9028, 12.4964],
  "berlin": [52.5200, 13.4050],
  "geneva": [46.2044, 6.1432],
  "brussels": [50.8503, 4.3517],
  "vienna": [48.2082, 16.3738],
  "riyadh": [24.7136, 46.6753],
  "doha": [25.2854, 51.5310],
  "abu dhabi": [24.4539, 54.3773],
  "dubai": [25.2048, 55.2708],
  "amman": [31.9454, 35.9284],
  "beirut": [33.8938, 35.5018],
  "ankara": [39.9334, 32.8597],
  "istanbul": [41.0082, 28.9784],
  "beijing": [39.9042, 116.4074],
  "singapore": [1.3521, 103.8198],
  "seoul": [37.5665, 126.9780],
  "ottawa": [45.4215, -75.6972],
  "canberra": [-35.2809, 149.1300],
  "sydney": [-33.8688, 151.2093],
};

/**
 * Resolves WGS-84 coordinates for a place, venue, or city using the authoritative gazetteer.
 */
export function resolveGazetteerCoordinates(location: {
  venue?: string | null;
  city?: string | null;
  country?: string | null;
}): { latitude: number; longitude: number; source: "venue" | "city" } | null {
  if (typeof location.venue === "string" && location.venue.trim()) {
    const venueNorm = location.venue.trim().toLowerCase();
    if (Object.prototype.hasOwnProperty.call(GLOBAL_GAZETTEER_COORDINATES, venueNorm)) {
      const coords = GLOBAL_GAZETTEER_COORDINATES[venueNorm];
      if (Array.isArray(coords) && typeof coords[0] === "number" && typeof coords[1] === "number") {
        return { latitude: coords[0], longitude: coords[1], source: "venue" };
      }
    }
  }

  if (typeof location.city === "string" && location.city.trim()) {
    const cityNorm = location.city.trim().toLowerCase();
    if (Object.prototype.hasOwnProperty.call(GLOBAL_GAZETTEER_COORDINATES, cityNorm)) {
      const coords = GLOBAL_GAZETTEER_COORDINATES[cityNorm];
      if (Array.isArray(coords) && typeof coords[0] === "number" && typeof coords[1] === "number") {
        return { latitude: coords[0], longitude: coords[1], source: "city" };
      }
    }
  }

  return null;
}

/**
 * Retrieves all gazetteer places and venues from Supabase with strict error propagation.
 */
export async function getPlacesStrict(supabaseClient?: unknown): Promise<PlaceRecord[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = (supabaseClient !== undefined ? supabaseClient : (await createClient())) as any;
  if (!supabase) {
    throw new Error("Supabase client is unavailable");
  }

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
 * Retrieves all gazetteer places and venues from Supabase with graceful fallback.
 */
export async function getPlaces(supabaseClient?: unknown): Promise<PlaceRecord[]> {
  try {
    return await getPlacesStrict(supabaseClient);
  } catch {
    return [];
  }
}

/**
 * Retrieves all gazetteer places with explicit query status.
 */
export async function getPlacesWithStatus(supabaseClient?: unknown): Promise<{ data: PlaceRecord[]; error: string | null }> {
  try {
    const data = await getPlacesStrict(supabaseClient);
    return { data, error: null };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to load places";
    return { data: [], error: msg };
  }
}

/**
 * Retrieves a place by slug along with all events that took place there.
 */
export async function getPlaceBySlug(
  slug: string
): Promise<{ data: { place: PlaceRecord; events: EventRecord[] } | null; error: string | null }> {
  if (!slug || !/^[a-zA-Z0-9_-]+$/.test(slug)) {
    return { data: null, error: "Invalid place slug" };
  }

  try {
    const supabase = await createClient();
    if (!supabase) {
      return { data: null, error: "Database configuration unavailable" };
    }

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

    if (!place) return { data: null, error: null };

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
      data: {
        place,
        events: allEvents,
      },
      error: null,
    };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : "Failed to load place",
    };
  }
}
