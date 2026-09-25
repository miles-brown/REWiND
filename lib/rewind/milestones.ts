import { getRelationalStore } from "@/lib/db/client";

export interface PersonMilestoneRecord {
  id: string;
  personId: string;
  title: string;
  category: "achievement" | "record" | "statistic" | "honor" | "landmark-fact";
  date: string;
  year: number;
  description: string | null;
  metricOrStat: string | null;
  sourceId: string | null;
}

const VALID_MILESTONE_CATEGORIES: Set<PersonMilestoneRecord["category"]> = new Set([
  "achievement",
  "record",
  "statistic",
  "honor",
  "landmark-fact",
]);

export function parseMilestoneCategory(cat: string | null | undefined): PersonMilestoneRecord["category"] {
  if (cat && VALID_MILESTONE_CATEGORIES.has(cat as PersonMilestoneRecord["category"])) {
    return cat as PersonMilestoneRecord["category"];
  }
  return "achievement";
}

export async function getPersonMilestones(personSlugOrId: string): Promise<PersonMilestoneRecord[]> {
  const store = getRelationalStore();
  const person = store.people.find((p) => p.slug === personSlugOrId || p.id === personSlugOrId);
  if (!person) return [];

  const milestones = store.personMilestones.filter((m) => m.personId === person.id || m.personId === person.slug);
  return milestones.map((m) => ({
    id: m.id,
    personId: m.personId,
    title: m.title,
    category: parseMilestoneCategory(m.category),
    date: m.date,
    year: m.year,
    description: m.description,
    metricOrStat: m.metricOrStat,
    sourceId: m.sourceId,
  })).sort((a, b) => a.date.localeCompare(b.date));
}

