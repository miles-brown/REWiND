import { createClient } from "@/lib/supabase/server";
import { people as fallbackPeople } from "@/archive/legacy-data/rewind";
import { getEventsByPerson } from "./events";
import type { EventRecord, PersonRecord } from "./types";

function mapFallbackPerson(p: (typeof fallbackPeople)[0]): PersonRecord {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    canonicalName: p.name,
    displayName: p.name,
    description: p.description,
    birth: p.birth,
    death: p.death,
    classification: (p as { classification?: string }).classification || "unknown",
  };
}

/**
 * Retrieves all monitored historical people from Supabase.
 */
export async function getPeople(params: { limit?: number } = {}): Promise<PersonRecord[]> {
  try {
    const supabase = await createClient();
    if (supabase) {
      let query = supabase
        .from("people")
        .select("*")
        .eq("publication_status", "published")
        .order("canonical_name", { ascending: true });

      if (params.limit) {
        query = query.limit(params.limit);
      }

      const { data, error } = await query;
      if (!error && data) {
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
          classification: p.classification || "unknown",
          avatarUrl: p.avatar_url || undefined,
        }));
      }
    }

    const fallbackList = fallbackPeople.map(mapFallbackPerson);
    return params.limit ? fallbackList.slice(0, params.limit) : fallbackList;
  } catch {
    const fallbackList = fallbackPeople.map(mapFallbackPerson);
    return params.limit ? fallbackList.slice(0, params.limit) : fallbackList;
  }
}

/**
 * Retrieves a single person by slug.
 */
export async function getPersonBySlug(slug: string, supabaseClient?: unknown): Promise<PersonRecord | null> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = (supabaseClient !== undefined ? supabaseClient : (await createClient())) as any;
    if (supabase) {
      const { data: p, error } = await supabase
        .from("people")
        .select("*")
        .eq("slug", slug)
        .eq("publication_status", "published")
        .maybeSingle();

      if (error) {
        const fb = fallbackPeople.find((x) => x.slug === slug || x.id === slug);
        return fb ? mapFallbackPerson(fb) : null;
      }

      if (p) {
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
          classification: p.classification || "unknown",
          avatarUrl: p.avatar_url || undefined,
        };
      }

      const fb = fallbackPeople.find((x) => x.slug === slug || x.id === slug);
      return fb ? mapFallbackPerson(fb) : null;
    }

    const fb = fallbackPeople.find((x) => x.slug === slug || x.id === slug);
    return fb ? mapFallbackPerson(fb) : null;
  } catch {
    const fb = fallbackPeople.find((x) => x.slug === slug || x.id === slug);
    return fb ? mapFallbackPerson(fb) : null;
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
