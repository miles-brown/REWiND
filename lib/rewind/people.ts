import { createClient } from "@/lib/supabase/server";
import { getEventsByPerson } from "./events";
import type { EventRecord, PersonRecord } from "./types";

/**
 * Retrieves all monitored historical people from Supabase.
 */
export async function getPeople(params: { limit?: number } = {}): Promise<PersonRecord[]> {
  try {
    const supabase = await createClient();
    if (!supabase) return [];

    let query = supabase
      .from("people")
      .select("*")
      .eq("publication_status", "published")
      .order("canonical_name", { ascending: true });

    if (params.limit) {
      query = query.limit(params.limit);
    }

    const { data, error } = await query;
    if (error || !data) return [];

    return data.map((p) => ({
      id: p.id,
      slug: p.slug,
      name: p.display_name || p.canonical_name,
      canonicalName: p.canonical_name,
      displayName: p.display_name,
      description: p.primary_role || p.summary || "",
      birth: p.birth_date || undefined,
      death: p.death_date || undefined,
      nationality: p.nationality || undefined,
      classification: p.classification,
      avatarUrl: p.avatar_url || undefined,
    }));
  } catch {
    return [];
  }
}

/**
 * Retrieves a single person by slug.
 */
export async function getPersonBySlug(slug: string): Promise<PersonRecord | null> {
  try {
    const supabase = await createClient();
    if (!supabase) return null;

    const { data: p, error } = await supabase
      .from("people")
      .select("*")
      .eq("slug", slug)
      .eq("publication_status", "published")
      .maybeSingle();

    if (error || !p) return null;

    return {
      id: p.id,
      slug: p.slug,
      name: p.display_name || p.canonical_name,
      canonicalName: p.canonical_name,
      displayName: p.display_name,
      description: p.primary_role || p.summary || "",
      birth: p.birth_date || undefined,
      death: p.death_date || undefined,
      nationality: p.nationality || undefined,
      classification: p.classification,
      avatarUrl: p.avatar_url || undefined,
    };
  } catch {
    return null;
  }
}

/**
 * Retrieves the complete chronological dossier and event timeline for a person.
 */
export async function getPersonTimeline(
  slug: string,
  options: { year?: string } = {}
): Promise<{
  person: PersonRecord;
  events: EventRecord[];
  years: number[];
} | null> {
  const person = await getPersonBySlug(slug);
  if (!person) return null;

  let events = await getEventsByPerson(slug);

  const yearsSet = new Set<number>();
  events.forEach((e) => {
    if (e.startDate && e.startDate.length >= 4) {
      const y = parseInt(e.startDate.slice(0, 4), 10);
      if (!isNaN(y)) yearsSet.add(y);
    }
  });
  const years = Array.from(yearsSet).sort((a, b) => a - b);

  if (options.year) {
    events = events.filter((e) => e.startDate.startsWith(options.year!));
  }

  return {
    person,
    events,
    years,
  };
}
