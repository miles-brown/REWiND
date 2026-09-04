import { createClient } from "@/lib/supabase/server";
import { getPersonBySlug } from "./people";
import type { EventRecord, PersonRecord } from "./types";
import { getEvents } from "./events";

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

/**
 * Retrieves the diplomatic co-appearance network across all monitored individuals.
 */
export async function getRelationships(): Promise<RelationshipItem[]> {
  try {
    const supabase = await createClient();
    if (!supabase) return [];

    const { data: participations, error } = await supabase
      .from("event_people")
      .select("event_id, person_id, role_label");

    if (error || !participations || participations.length === 0) return [];

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

    if (pairCounts.size === 0) return [];

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
  } catch {
    return [];
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
    if (!supabase) {
      return { personA, personB, sharedEvents: [] };
    }

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

    let sharedEvents: EventRecord[] = [];
    if (sharedIds.length > 0) {
      const allEvents = await getEvents({ limit: 100 });
      sharedEvents = allEvents.data.filter((e) => sharedIds.includes(e.id));
    }

    return {
      personA,
      personB,
      sharedEvents,
    };
  } catch {
    return null;
  }
}
