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
      if (!error && data && data.length > 0) {
        return data.map((p) => ({
          id: p.id,
          slug: p.slug,
          name: p.display_name || p.canonical_name,
          canonicalName: p.canonical_name,
          displayName: p.display_name,
          description: p.primary_role || p.summary || "",
          fullBirthName: p.full_birth_name || undefined,
          birth: p.birth_date || undefined,
          death: p.death_date || undefined,
          nationality: p.nationality || undefined,
          citizenship: Array.isArray(p.citizenship) ? p.citizenship : [],
          nationalIdentity: p.national_identity || undefined,
          ethnicity: p.ethnicity || undefined,
          ancestry: p.ancestry || undefined,
          religion: p.religion || undefined,
          religiousDenomination: p.religious_denomination || undefined,
          religionStatus: p.religion_status || undefined,
          languages: Array.isArray(p.languages) ? p.languages : [],
          classification: p.classification || "unknown",
          notabilityBasis: p.notability_basis || undefined,
          inclusionBasis: Array.isArray(p.inclusion_basis) ? p.inclusion_basis : [],
          inclusionRationale: p.inclusion_rationale || undefined,
          culturalImpactSummary: p.cultural_impact_summary || undefined,
          achievements: Array.isArray(p.achievements) ? p.achievements : [],
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
 * Retrieves a single person by slug, including structured biographical relations.
 */
export async function getPersonBySlug(slug: string): Promise<PersonRecord | null> {
  try {
    const supabase = await createClient();
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
        const [eduRes, careerRes, awardsRes, worksRes] = await Promise.all([
          supabase.from("person_education").select("*").eq("person_id", p.id).order("start_date", { ascending: true }),
          supabase.from("person_career").select("*").eq("person_id", p.id).order("start_date", { ascending: true }),
          supabase.from("person_awards").select("*").eq("person_id", p.id).order("award_year", { ascending: false }),
          supabase.from("person_works").select("*").eq("person_id", p.id).order("release_date", { ascending: false }),
        ]);

        const education = (eduRes.data || []).map((e) => ({
          id: e.id,
          personId: e.person_id,
          institution: e.institution,
          location: e.location || undefined,
          startDate: e.start_date || undefined,
          endDate: e.end_date || undefined,
          qualification: e.qualification || undefined,
          subject: e.subject || undefined,
          degree: e.degree || undefined,
          honours: e.honours || undefined,
          completedStatus: (e.completed_status as "completed" | "not completed" | "honorary" | "in progress") || "completed",
          sourceId: e.source_id || undefined,
        }));

        const career = (careerRes.data || []).map((c) => ({
          id: c.id,
          personId: c.person_id,
          organisationName: c.organisation_name,
          positionTitle: c.position_title,
          occupationCategory: c.occupation_category || undefined,
          startDate: c.start_date || undefined,
          endDate: c.end_date || undefined,
          location: c.location || undefined,
          appointmentMethod: c.appointment_method || undefined,
          predecessor: c.predecessor || undefined,
          successor: c.successor || undefined,
          notes: c.notes || undefined,
          sourceId: c.source_id || undefined,
        }));

        const awards = (awardsRes.data || []).map((a) => ({
          id: a.id,
          personId: a.person_id,
          awardName: a.award_name,
          awardingBody: a.awarding_body,
          category: a.category || undefined,
          awardYear: a.award_year || undefined,
          result: (a.result as "winner" | "honouree" | "nominee" | "finalist") || "winner",
          citationReason: a.citation_reason || undefined,
          sourceId: a.source_id || undefined,
        }));

        const works = (worksRes.data || []).map((w) => ({
          id: w.id,
          personId: w.person_id,
          workTitle: w.work_title,
          workType: w.work_type,
          releaseDate: w.release_date || undefined,
          publisherOrVenue: w.publisher_or_venue || undefined,
          significanceNote: w.significance_note || undefined,
          sourceId: w.source_id || undefined,
        }));

        return {
          id: p.id,
          slug: p.slug,
          name: p.display_name || p.canonical_name,
          canonicalName: p.canonical_name,
          displayName: p.display_name,
          description: p.primary_role || p.summary || "",
          fullBirthName: p.full_birth_name || undefined,
          birth: p.birth_date || undefined,
          death: p.death_date || undefined,
          nationality: p.nationality || undefined,
          citizenship: Array.isArray(p.citizenship) ? p.citizenship : [],
          nationalIdentity: p.national_identity || undefined,
          ethnicity: p.ethnicity || undefined,
          ancestry: p.ancestry || undefined,
          religion: p.religion || undefined,
          religiousDenomination: p.religious_denomination || undefined,
          religionStatus: p.religion_status || undefined,
          languages: Array.isArray(p.languages) ? p.languages : [],
          classification: p.classification,
          notabilityBasis: p.notability_basis || undefined,
          inclusionBasis: Array.isArray(p.inclusion_basis) ? p.inclusion_basis : [],
          inclusionRationale: p.inclusion_rationale || undefined,
          culturalImpactSummary: p.cultural_impact_summary || undefined,
          achievements: Array.isArray(p.achievements) ? p.achievements : [],
          avatarUrl: p.avatar_url || undefined,
          education,
          career,
          awards,
          works,
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
