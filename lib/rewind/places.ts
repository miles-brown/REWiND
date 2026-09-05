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

    if (error || !data) return [];

    return data.map((p) => ({
      id: p.id,
      slug: p.slug,
      venue: p.venue,
      city: p.city,
      country: p.country,
      latitude: p.latitude,
      longitude: p.longitude,
      placeType: p.place_type,
    }));
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

    const { data: p, error } = await supabase
      .from("places")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();

    if (error || !p) return null;

    const place: PlaceRecord = {
      id: p.id,
      slug: p.slug,
      venue: p.venue,
      city: p.city,
      country: p.country,
      latitude: p.latitude,
      longitude: p.longitude,
      placeType: p.place_type,
    };

    const eventsResult = await getEvents({ placeSlug: slug, limit: 100 });

    return {
      place,
      events: eventsResult.data,
    };
  } catch {
    return null;
  }
}
