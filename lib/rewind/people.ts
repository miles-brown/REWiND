import { createClient } from "@/lib/supabase/server";
import { masterPeopleSeed, type CanonicalPersonSeed } from "@/data/seeds/index";
import { officialRolesSeed } from "@/data/seeds/roles-seed";
import { milestonesSeed } from "@/data/seeds/milestones-seed";
import {
  royalEducationSeed,
  royalCareerSeed,
  royalAwardsSeed,
  royalWorksSeed,
  royalStaysSeed,
} from "@/data/seeds/royal-bio-details-seed";
import { getEventsByPersonWithStatus } from "./events";
import { extractPersonNameParts } from "./utils";
import type { EventRecord, PersonRecord } from "./types";

export { extractPersonNameParts };

function mapFallbackPerson(p: CanonicalPersonSeed): PersonRecord {
  const pEdu = royalEducationSeed
    .filter((e) => e.personId === p.id || e.personId === p.slug)
    .map((e) => ({
      id: e.id,
      personId: e.personId,
      institution: e.institution,
      startDate: e.startYear,
      endDate: e.endYear,
      degree: e.degree,
      subject: e.fieldOfStudy,
      completedStatus: "completed" as const,
      sourceId: e.sourceId,
    }));

  const pCareer = royalCareerSeed
    .filter((c) => c.personId === p.id || c.personId === p.slug)
    .map((c) => ({
      id: c.id,
      personId: c.personId,
      organisationName: c.organisationName,
      positionTitle: c.roleTitle,
      startDate: c.startDate,
      endDate: c.endDate,
      notes: c.notes,
      sourceId: c.sourceId,
    }));

  const officialRoles = officialRolesSeed
    .filter((r) => r.personId === p.id || r.personId === p.slug)
    .map((r) => ({
      id: `role-${r.id}`,
      personId: r.personId,
      organisationName: r.organisationName,
      positionTitle: r.title,
      startDate: r.startDate,
      endDate: r.endDate ?? undefined,
    }));

  const allCareer = [...pCareer, ...officialRoles];

  const officialMilestones = milestonesSeed
    .filter((m) => m.personId === p.id || m.personId === p.slug)
    .map((m) => ({
      milestone: m.title,
      year: m.year || (m.date ? parseInt(m.date.slice(0, 4), 10) : undefined),
      evidence: m.description,
    }));
  const achievements = [...(p.achievements || []), ...officialMilestones];

  const pAwards = royalAwardsSeed
    .filter((a) => a.personId === p.id || a.personId === p.slug)
    .map((a) => ({
      id: a.id,
      personId: a.personId,
      awardName: a.awardName,
      awardingBody: a.awardingBody,
      awardYear: a.yearReceived ? parseInt(a.yearReceived, 10) : undefined,
      result: "winner" as const,
      citationReason: a.citation,
      sourceId: a.sourceId,
    }));

  const pWorks = royalWorksSeed
    .filter((w) => w.personId === p.id || w.personId === p.slug)
    .map((w) => ({
      id: w.id,
      personId: w.personId,
      workTitle: w.title,
      workType: w.workType,
      releaseDate: w.publicationYear,
      publisherOrVenue: w.publisher,
      significanceNote: w.notes,
      sourceId: w.sourceId,
    }));

  const pStays = royalStaysSeed
    .filter((s) => s.personId === p.id || s.personId === p.slug)
    .map((s) => ({
      id: s.id,
      personId: s.personId,
      venueName: s.venueName,
      stayName: s.stayName,
      stayType: s.stayType,
      city: s.city,
      country: s.country,
      latitude: s.latitude,
      longitude: s.longitude,
      startDate: s.startDate,
      endDate: s.endDate ?? undefined,
      isBaseOfOperations: s.isBaseOfOperations,
      isPrimaryResidence: s.isPrimaryResidence,
      notes: s.notes,
      sourceIds: s.sourceId ? [s.sourceId] : [],
    }));

  return {
    id: p.id,
    slug: p.slug,
    name: p.displayName || p.canonicalName,
    canonicalName: p.canonicalName,
    displayName: p.displayName || p.canonicalName,
    description: p.primaryRole || p.summary || "",
    fullBirthName: p.fullBirthName ?? undefined,
    birth: p.birthDate,
    death: p.deathDate ?? undefined,
    nationality: p.nationality,
    citizenship: p.citizenship,
    nationalIdentity: p.nationalIdentity ?? undefined,
    ethnicity: p.ethnicity ?? undefined,
    ancestry: p.ancestry ?? undefined,
    religion: p.religion ?? undefined,
    religiousDenomination: p.religiousDenomination ?? undefined,
    religionStatus: p.religionStatus ?? undefined,
    languages: p.languages,
    classification: p.classification || p.primaryFigureCategory || "unknown",
    notabilityBasis: p.notabilityBasis ?? undefined,
    inclusionBasis: p.inclusionBasis,
    inclusionRationale: p.inclusionRationale ?? undefined,
    culturalImpactSummary: p.culturalImpactSummary ?? undefined,
    achievements: achievements.length > 0 ? achievements : undefined,
    avatarUrl: p.avatarUrl ?? undefined,
    education: pEdu.length > 0 ? pEdu : undefined,
    career: allCareer.length > 0 ? allCareer : undefined,
    awards: pAwards.length > 0 ? pAwards : undefined,
    works: pWorks.length > 0 ? pWorks : undefined,
    stays: pStays.length > 0 ? pStays : undefined,
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
      const fallbackList = masterPeopleSeed.map(mapFallbackPerson);
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
        const fallbackList = masterPeopleSeed.map(mapFallbackPerson);
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
        const fallbackList = masterPeopleSeed.map(mapFallbackPerson);
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
    const fallbackList = masterPeopleSeed.map(mapFallbackPerson);
    return { data: params.limit ? fallbackList.slice(0, params.limit) : fallbackList, error: null };
  }
}

export async function getPeople(params: { limit?: number } = {}): Promise<PersonRecord[]> {
  const res = await getPeopleWithStatus(params);
  return res.data;
}

/**
 * Retrieves a single person by slug, including structured biographical relations, returning status.
 */
export async function getPersonBySlugWithStatus(
  slug: string,
  supabaseClient?: unknown
): Promise<{ data: PersonRecord | null; error: string | null }> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = (supabaseClient !== undefined ? supabaseClient : (await createClient())) as any;
    if (supabase) {
      const { data: p, error } = await supabase
        .from("people")
        .select("*")
        .or(`slug.eq.${slug},id.eq.${slug}`)
        .eq("publication_status", "published")
        .maybeSingle();

      if (error) {
        if (process.env.NODE_ENV === "production") {
          return { data: null, error: error.message };
        }
        const fb = masterPeopleSeed.find((x) => x.slug === slug || x.id === slug);
        return { data: fb ? mapFallbackPerson(fb) : null, error: null };
      }

      if (p) {
        let eduData: Record<string, unknown>[] = [];
        let careerData: Record<string, unknown>[] = [];
        let awardsData: Record<string, unknown>[] = [];
        let worksData: Record<string, unknown>[] = [];
        let staysData: Record<string, unknown>[] = [];

        try {
          const [eduRes, careerRes, awardsRes, worksRes, staysRes] = await Promise.all([
            Promise.resolve(supabase.from?.("person_education")?.select?.("*")?.eq?.("person_id", p.id)?.order?.("start_date", { ascending: true }) ?? { data: [] }),
            Promise.resolve(supabase.from?.("person_career")?.select?.("*")?.eq?.("person_id", p.id)?.order?.("start_date", { ascending: true }) ?? { data: [] }),
            Promise.resolve(supabase.from?.("person_awards")?.select?.("*")?.eq?.("person_id", p.id)?.order?.("award_year", { ascending: false }) ?? { data: [] }),
            Promise.resolve(supabase.from?.("person_works")?.select?.("*")?.eq?.("person_id", p.id)?.order?.("release_date", { ascending: false }) ?? { data: [] }),
            Promise.resolve(supabase.from?.("person_stays")?.select?.("*")?.eq?.("person_id", p.id)?.order?.("start_date", { ascending: true }) ?? { data: [] }),
          ]);

          const bioError = eduRes?.error || careerRes?.error || awardsRes?.error || worksRes?.error || staysRes?.error;
          if (bioError && process.env.NODE_ENV === "production") {
            return { data: null, error: `Failed to load biographical relation data: ${bioError.message}` };
          }

          eduData = (eduRes?.data || []) as Record<string, unknown>[];
          careerData = (careerRes?.data || []) as Record<string, unknown>[];
          awardsData = (awardsRes?.data || []) as Record<string, unknown>[];
          worksData = (worksRes?.data || []) as Record<string, unknown>[];
          staysData = (staysRes?.data || []) as Record<string, unknown>[];
        } catch (err) {
          if (process.env.NODE_ENV === "production") {
            return { data: null, error: err instanceof Error ? err.message : "Biographical query error" };
          }
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

        const stays = staysData.map((s: Record<string, unknown>) => ({
          id: String(s.id || ""),
          personId: String(s.person_id || ""),
          venueName: String(s.venue_name || ""),
          stayName: s.stay_name ? String(s.stay_name) : undefined,
          stayType: (s.stay_type as "hotel" | "official_residence" | "private_home" | "embassy" | "military_base") || "official_residence",
          city: String(s.city || ""),
          country: String(s.country || ""),
          latitude: typeof s.latitude === "number" ? s.latitude : (parseFloat(String(s.latitude)) || 0),
          longitude: typeof s.longitude === "number" ? s.longitude : (parseFloat(String(s.longitude)) || 0),
          startDate: String(s.start_date || ""),
          endDate: s.end_date ? String(s.end_date) : null,
          isBaseOfOperations: Boolean(s.is_base_of_operations),
          isPrimaryResidence: Boolean(s.is_primary_residence),
          securityLevel: s.security_level ? String(s.security_level) : undefined,
          notes: s.notes ? String(s.notes) : undefined,
          sourceIds: s.source_id ? [String(s.source_id)] : (Array.isArray(s.source_ids) ? s.source_ids.map(String) : []),
        }));

        return {
          data: {
            ...mapDatabasePerson(p),
            education,
            career,
            awards,
            works,
            stays,
          },
          error: null,
        };
      }

      // Successful Supabase query with no matching record: return null canonical miss
      return { data: null, error: null };
    }

    if (process.env.NODE_ENV === "production") {
      return { data: null, error: "Database client unavailable" };
    }
    const fb = masterPeopleSeed.find((x) => x.slug === slug || x.id === slug);
    return { data: fb ? mapFallbackPerson(fb) : null, error: null };
  } catch (err) {
    if (process.env.NODE_ENV === "production") {
      return { data: null, error: err instanceof Error ? err.message : "Database error" };
    }
    const fb = masterPeopleSeed.find((x) => x.slug === slug || x.id === slug);
    return { data: fb ? mapFallbackPerson(fb) : null, error: null };
  }
}

/**
 * Retrieves a single person by slug, including structured biographical relations.
 */
export async function getPersonBySlug(slug: string, supabaseClient?: unknown): Promise<PersonRecord | null> {
  const res = await getPersonBySlugWithStatus(slug, supabaseClient);
  if (res.error && process.env.NODE_ENV === "production") {
    throw new Error(res.error);
  }
  return res.data;
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

  const { data: person, error: personError } = await getPersonBySlugWithStatus(slug);
  if (personError) {
    return { data: null, error: personError };
  }
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

export { isPhysicalConfirmedParticipant, findTopCoAttendee } from "./utils";

