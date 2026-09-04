import { createClient } from "@/lib/supabase/server";
import { events as fallbackEvents, people as fallbackPeople } from "@/archive/legacy-data/rewind";
import { getPersonBySlug } from "./people";
import type { EventRecord, PersonRecord } from "./types";
import { getEventsByIds, getAllEvents } from "./events";

export interface RelationshipItem {
  id: string;
  source: string;
  target: string;
  sourceName: string;
  targetName: string;
  sharedEventsCount: number;
  latestEventDate?: string;
  types: string[];
}

export interface PairwiseRelationshipData {
  personA: PersonRecord;
  personB: PersonRecord;
  sharedEvents: EventRecord[];
}

function getFallbackRelationships(): RelationshipItem[] {
  const personSlugToName = new Map(fallbackPeople.map((p) => [p.slug, p.name]));
  const personIdToSlug = new Map(fallbackPeople.map((p) => [p.id, p.slug]));

  const pairCounts = new Map<string, number>();
  for (const e of fallbackEvents) {
    if (e.verificationStatus !== "verified") continue;
    const pSlugs = Array.from(
      new Set(
        (e.participants || [])
          .map((p) => personIdToSlug.get(p.personId) || p.personId)
          .filter((s) => personSlugToName.has(s))
      )
    );
    if (pSlugs.length < 2) continue;
    for (let i = 0; i < pSlugs.length; i++) {
      for (let j = i + 1; j < pSlugs.length; j++) {
        const [a, b] = [pSlugs[i], pSlugs[j]].sort();
        const key = `${a}::${b}`;
        pairCounts.set(key, (pairCounts.get(key) || 0) + 1);
      }
    }
  }

  const relationships: RelationshipItem[] = [];
  for (const [key, count] of pairCounts.entries()) {
    const [slugA, slugB] = key.split("::");
    relationships.push({
      id: `${slugA}-${slugB}`,
      source: slugA,
      target: slugB,
      sourceName: personSlugToName.get(slugA) || slugA,
      targetName: personSlugToName.get(slugB) || slugB,
      sharedEventsCount: count,
      types: ["diplomatic-meeting"],
    });
  }

  return relationships.sort((a, b) => b.sharedEventsCount - a.sharedEventsCount);
}

/**
 * Retrieves the diplomatic co-appearance network across all monitored individuals,
 * restricted strictly to verified and published events.
 */
export async function getRelationships(): Promise<RelationshipItem[]> {
  try {
    const supabase = await createClient();
    if (supabase) {
      // Filter participations by verified and published events
      const { data: participations, error } = await supabase
        .from("event_people")
        .select("event_id, person_id, role_label, events!inner(id, verification_status, publication_status)")
        .eq("events.verification_status", "verified")
        .eq("events.publication_status", "published");

      if (error) {
        return getFallbackRelationships();
      }

      if (participations) {
        // Group persons by event
        const eventPersons = new Map<string, string[]>();
        participations.forEach((p) => {
          const list = eventPersons.get(p.event_id) || [];
          if (!list.includes(p.person_id)) list.push(p.person_id);
          eventPersons.set(p.event_id, list);
        });

        // Pairwise counts
        const pairCounts = new Map<string, number>();
        for (const persons of eventPersons.values()) {
          if (persons.length < 2) continue;
          for (let i = 0; i < persons.length; i++) {
            for (let j = i + 1; j < persons.length; j++) {
              const [a, b] = [persons[i], persons[j]].sort();
              const key = `${a}::${b}`;
              pairCounts.set(key, (pairCounts.get(key) || 0) + 1);
            }
          }
        }

        if (pairCounts.size === 0) {
          return [];
        }

        // Fetch person names
        const allPersonIds = Array.from(
          new Set(
            Array.from(pairCounts.keys()).flatMap((k) => k.split("::"))
          )
        );
        const { data: people } = await supabase
          .from("people")
          .select("id, slug, display_name, canonical_name")
          .in("id", allPersonIds);

        const personMap = new Map<string, { slug: string; name: string }>();
        (people || []).forEach((p) => {
          personMap.set(p.id, {
            slug: p.slug,
            name: p.display_name || p.canonical_name,
          });
        });

        const relationships: RelationshipItem[] = [];
        for (const [key, count] of pairCounts.entries()) {
          const [idA, idB] = key.split("::");
          const personA = personMap.get(idA);
          const personB = personMap.get(idB);
          if (!personA || !personB) continue;

          relationships.push({
            id: `${personA.slug}-${personB.slug}`,
            source: personA.slug,
            target: personB.slug,
            sourceName: personA.name,
            targetName: personB.name,
            sharedEventsCount: count,
            types: ["diplomatic-meeting"],
          });
        }

        return relationships.sort((a, b) => b.sharedEventsCount - a.sharedEventsCount);
      }
    }

    return getFallbackRelationships();
  } catch {
    return getFallbackRelationships();
  }
}

/**
 * Retrieves the pairwise bilateral relationship and shared events between two individuals.
 */
export async function getRelationshipBetween(
  slugA: string,
  slugB: string
): Promise<PairwiseRelationshipData | null> {
  try {
    const [personA, personB] = await Promise.all([
      getPersonBySlug(slugA),
      getPersonBySlug(slugB),
    ]);

    if (!personA || !personB) return null;

    const supabase = await createClient();
    if (supabase) {
      // Find events where both personA.id and personB.id participate
      const { data: partA } = await supabase
        .from("event_people")
        .select("event_id")
        .eq("person_id", personA.id);
      const { data: partB } = await supabase
        .from("event_people")
        .select("event_id")
        .eq("person_id", personB.id);

      const eventsA = new Set((partA || []).map((p) => p.event_id));
      const sharedIds = (partB || [])
        .map((p) => p.event_id)
        .filter((id) => eventsA.has(id));

      if (sharedIds.length > 0) {
        const fetchedEvents = await getEventsByIds(sharedIds);
        const sharedEvents: EventRecord[] = fetchedEvents.filter(
          (e) => e.verificationStatus === "verified"
        );
        return { personA, personB, sharedEvents };
      }

      return { personA, personB, sharedEvents: [] };
    }

    // Fallback: check shared events across all events
    const all = await getAllEvents();
    const shared = all.filter(
      (e) =>
        e.verificationStatus === "verified" &&
        (e.participants || []).some((p) => p.personId === personA.id || p.personId === personA.slug) &&
        (e.participants || []).some((p) => p.personId === personB.id || p.personId === personB.slug)
    );

    return {
      personA,
      personB,
      sharedEvents: shared,
    };
  } catch {
    return null;
  }
}
