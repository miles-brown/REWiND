import { createClient } from "@/lib/supabase/server";
import { people as fallbackPeople } from "@/archive/legacy-data/rewind";
import { getEventsByPersonWithStatus } from "./events";
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

function mapDatabasePerson(p: Record<string, unknown>): PersonRecord {
  return {
    id: String(p.id),
    slug: String(p.slug),
    name: String(p.display_name || p.canonical_name || ""),
    canonicalName: String(p.canonical_name || ""),
    displayName: String(p.display_name || p.canonical_name || ""),
    description: String(p.primary_role || p.summary || ""),
    fullBirthName: p.full_birth_name ? String(p.full_birth_name) : undefined,
    birth: p.birth_date ? String(p.birth_date) : undefined,
    death: p.death_date ? String(p.death_date) : undefined,
    nationality: p.nationality ? String(p.nationality) : undefined,
    citizenship: Array.isArray(p.citizenship) ? p.citizenship.map(String) : [],
    nationalIdentity: p.national_identity ? String(p.national_identity) : undefined,
    ethnicity: p.ethnicity ? String(p.ethnicity) : undefined,
    ancestry: p.ancestry ? String(p.ancestry) : undefined,
    religion: p.religion ? String(p.religion) : undefined,
    religiousDenomination: p.religious_denomination ? String(p.religious_denomination) : undefined,
    religionStatus: p.religion_status ? String(p.religion_status) : undefined,
    languages: Array.isArray(p.languages) ? p.languages.map(String) : [],
    classification: String(p.classification || "unknown"),
    notabilityBasis: p.notability_basis ? String(p.notability_basis) : undefined,
    inclusionBasis: Array.isArray(p.inclusion_basis) ? p.inclusion_basis.map(String) : [],
    inclusionRationale: p.inclusion_rationale ? String(p.inclusion_rationale) : undefined,
    culturalImpactSummary: p.cultural_impact_summary ? String(p.cultural_impact_summary) : undefined,
    achievements: Array.isArray(p.achievements)
      ? (p.achievements as Array<Record<string, unknown> | string>).map((ach) =>
          typeof ach === "string"
            ? { milestone: ach }
            : {
                milestone: String(ach.milestone || ""),
                year: typeof ach.year === "number" ? ach.year : undefined,
                evidence: ach.evidence ? String(ach.evidence) : undefined,
              }
        )
      : undefined,
    avatarUrl: p.avatar_url ? String(p.avatar_url) : undefined,
  };
}

/**
 * Retrieves all monitored historical people from Supabase.
 */
export async function getPeopleWithStatus(params: { limit?: number } = {}): Promise<{ data: PersonRecord[]; error: string | null }> {
  try {
    const supabase = await createClient();
    if (!supabase) {
      if (process.env.NODE_ENV === "production") {
        return { data: [], error: "Supabase client unavailable in production" };
      }
      const fallbackList = fallbackPeople.map(mapFallbackPerson);
      return { data: params.limit ? fallbackList.slice(0, params.limit) : fallbackList, error: null };
    }

    if (params.limit) {
      const { data, error } = await supabase
        .from("people")
        .select("*")
        .eq("publication_status", "published")
        .order("canonical_name", { ascending: true })
        .order("id", { ascending: true })
        .limit(params.limit);

      if (error) {
        if (process.env.NODE_ENV === "production") {
          return { data: [], error: error.message };
        }
        const fallbackList = fallbackPeople.map(mapFallbackPerson);
        return { data: params.limit ? fallbackList.slice(0, params.limit) : fallbackList, error: null };
      }
      return { data: (data || []).map((p) => mapDatabasePerson(p as Record<string, unknown>)), error: null };
    }

    const allPeople: Record<string, unknown>[] = [];
    const pageSize = 1000;
    let from = 0;
    while (true) {
      const { data, error } = await supabase
        .from("people")
        .select("*")
        .eq("publication_status", "published")
        .order("canonical_name", { ascending: true })
        .order("id", { ascending: true })
        .range(from, from + pageSize - 1);
      if (error) {
        if (process.env.NODE_ENV === "production") {
          return { data: [], error: error.message };
        }
        const fallbackList = fallbackPeople.map(mapFallbackPerson);
        return { data: params.limit ? fallbackList.slice(0, params.limit) : fallbackList, error: null };
      }
      if (!data || data.length === 0) break;
      allPeople.push(...data);
      if (data.length < pageSize) break;
      from += pageSize;
    }
    return { data: allPeople.map((p) => mapDatabasePerson(p)), error: null };
  } catch (err) {
    if (process.env.NODE_ENV === "production") {
      return { data: [], error: err instanceof Error ? err.message : "Database error" };
    }
    const fallbackList = fallbackPeople.map(mapFallbackPerson);
    return { data: params.limit ? fallbackList.slice(0, params.limit) : fallbackList, error: null };
  }
}

export async function getPeople(params: { limit?: number } = {}): Promise<PersonRecord[]> {
  const res = await getPeopleWithStatus(params);
  return res.data;
}

/**
 * Retrieves a single person by slug, including structured biographical relations.
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
        console.log("DEBUG getPersonBySlug error:", { slug, error });
        if (process.env.NODE_ENV === "production") {
          return null;
        }
        const fb = fallbackPeople.find((x) => x.slug === slug || x.id === slug);
        return fb ? mapFallbackPerson(fb) : null;
      }

      if (!p) {
        console.log("DEBUG getPersonBySlug no p:", { slug });
      }

      if (p) {
        let eduData: Record<string, unknown>[] = [];
        let careerData: Record<string, unknown>[] = [];
        let awardsData: Record<string, unknown>[] = [];
        let worksData: Record<string, unknown>[] = [];

        try {
          const [eduRes, careerRes, awardsRes, worksRes] = await Promise.all([
            Promise.resolve(supabase.from?.("person_education")?.select?.("*")?.eq?.("person_id", p.id)?.order?.("start_year", { ascending: true }) ?? { data: [] }),
            Promise.resolve(supabase.from?.("person_career")?.select?.("*")?.eq?.("person_id", p.id)?.order?.("start_date", { ascending: true }) ?? { data: [] }),
            Promise.resolve(supabase.from?.("person_awards")?.select?.("*")?.eq?.("person_id", p.id)?.order?.("year_received", { ascending: false }) ?? { data: [] }),
            Promise.resolve(supabase.from?.("person_works")?.select?.("*")?.eq?.("person_id", p.id)?.order?.("publication_year", { ascending: false }) ?? { data: [] }),
          ]);
          eduData = (eduRes?.data || []) as Record<string, unknown>[];
          careerData = (careerRes?.data || []) as Record<string, unknown>[];
          awardsData = (awardsRes?.data || []) as Record<string, unknown>[];
          worksData = (worksRes?.data || []) as Record<string, unknown>[];
        } catch {
          // Biographical relations optional or not present in client stub
        }

        const education = eduData.map((e: Record<string, unknown>) => ({
          id: String(e.id || ""),
          personId: String(e.person_id || ""),
          institution: String(e.institution || ""),
          location: e.location ? String(e.location) : undefined,
          startDate: e.start_year ? String(e.start_year) : (e.start_date ? String(e.start_date) : undefined),
          endDate: e.end_year ? String(e.end_year) : (e.end_date ? String(e.end_date) : undefined),
          qualification: e.qualification ? String(e.qualification) : undefined,
          subject: e.field_of_study ? String(e.field_of_study) : (e.subject ? String(e.subject) : undefined),
          degree: e.degree ? String(e.degree) : undefined,
          honours: e.honours ? String(e.honours) : undefined,
          completedStatus: (e.completed_status as "completed" | "not completed" | "honorary" | "in progress") || "completed",
          sourceId: e.source_id ? String(e.source_id) : undefined,
        }));

        const career = careerData.map((c: Record<string, unknown>) => ({
          id: String(c.id || ""),
          personId: String(c.person_id || ""),
          organisationName: String(c.organisation_name || ""),
          positionTitle: String(c.role_title || c.position_title || ""),
          occupationCategory: c.occupation_category ? String(c.occupation_category) : undefined,
          startDate: c.start_date ? String(c.start_date) : undefined,
          endDate: c.end_date ? String(c.end_date) : undefined,
          location: c.location ? String(c.location) : undefined,
          appointmentMethod: c.appointment_method ? String(c.appointment_method) : undefined,
          predecessor: c.predecessor ? String(c.predecessor) : undefined,
          successor: c.successor ? String(c.successor) : undefined,
          notes: c.notes ? String(c.notes) : undefined,
          sourceId: c.source_id ? String(c.source_id) : undefined,
        }));

        const awards = awardsData.map((a: Record<string, unknown>) => ({
          id: String(a.id || ""),
          personId: String(a.person_id || ""),
          awardName: String(a.award_name || ""),
          awardingBody: String(a.awarding_body || ""),
          category: a.category ? String(a.category) : undefined,
          awardYear: typeof a.year_received === "number"
            ? a.year_received
            : (a.year_received ? parseInt(String(a.year_received), 10) || undefined : (typeof a.award_year === "number" ? a.award_year : undefined)),
          result: (a.result as "winner" | "honouree" | "nominee" | "finalist") || "winner",
          citationReason: a.citation ? String(a.citation) : (a.citation_reason ? String(a.citation_reason) : undefined),
          sourceId: a.source_id ? String(a.source_id) : undefined,
        }));

        const works = worksData.map((w: Record<string, unknown>) => ({
          id: String(w.id || ""),
          personId: String(w.person_id || ""),
          workTitle: String(w.title || w.work_title || ""),
          workType: String(w.work_type || ""),
          releaseDate: w.publication_year ? String(w.publication_year) : (w.release_date ? String(w.release_date) : undefined),
          publisherOrVenue: w.publisher ? String(w.publisher) : (w.publisher_or_venue ? String(w.publisher_or_venue) : undefined),
          significanceNote: w.notes ? String(w.notes) : (w.significance_note ? String(w.significance_note) : undefined),
          sourceId: w.source_id ? String(w.source_id) : undefined,
        }));

        return {
          ...mapDatabasePerson(p),
          education,
          career,
          awards,
          works,
        };
      }

      // Successful Supabase query with no matching record: return null canonical miss
      return null;
    }

    if (process.env.NODE_ENV === "production") {
      return null;
    }
    const fb = fallbackPeople.find((x) => x.slug === slug || x.id === slug);
    return fb ? mapFallbackPerson(fb) : null;
  } catch {
    if (process.env.NODE_ENV === "production") {
      return null;
    }
    const fb = fallbackPeople.find((x) => x.slug === slug || x.id === slug);
    return fb ? mapFallbackPerson(fb) : null;
  }
}

/**
 * Retrieves the complete chronological dossier and event timeline for a person with status.
 */
export async function getPersonTimelineWithStatus(
  slug: string,
  options: { year?: string } = {}
): Promise<{
  data: {
    person: PersonRecord;
    events: EventRecord[];
    years: number[];
  } | null;
  error: string | null;
}> {
  if (options.year !== undefined && !/^\d{4}$/.test(options.year)) {
    return { data: null, error: "Invalid year parameter" };
  }

  const person = await getPersonBySlug(slug);
  if (!person) return { data: null, error: null };

  const { data: events, error: eventsError } = await getEventsByPersonWithStatus(slug);
  if (eventsError) {
    return { data: null, error: eventsError };
  }

  const yearsSet = new Set<number>();
  events.forEach((e) => {
    if (e.startDate && e.startDate.length >= 4) {
      const y = parseInt(e.startDate.slice(0, 4), 10);
      if (!isNaN(y)) yearsSet.add(y);
    }
  });
  const years = Array.from(yearsSet).sort((a, b) => a - b);

  const filteredEvents = options.year
    ? events.filter((e) => e.startDate.startsWith(options.year!))
    : events;

  return {
    data: {
      person,
      events: filteredEvents,
      years,
    },
    error: null,
  };
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
  const res = await getPersonTimelineWithStatus(slug, options);
  return res.data;
}
