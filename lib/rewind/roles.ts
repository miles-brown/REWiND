import { getRelationalStore } from "@/lib/db/client";

export interface PersonRoleRecord {
  id: number;
  personId: string;
  title: string;
  organisationId: string | null;
  startDate: string | null;
  endDate: string | null;
  isCurrent: boolean;
}

export async function getPersonRoles(personSlugOrId: string): Promise<PersonRoleRecord[]> {
  const store = getRelationalStore();
  const person = store.people.find((p) => p.slug === personSlugOrId || p.id === personSlugOrId);
  if (!person) return [];

  const roles = store.personRoles.filter((r) => r.personId === person.id || r.personId === person.slug);
  return roles.map((r) => ({
    id: r.id,
    personId: r.personId,
    title: r.title,
    organisationId: r.organisationId,
    startDate: r.startDate,
    endDate: r.endDate,
    isCurrent: r.isCurrent,
  })).sort((a, b) => (a.startDate || "").localeCompare(b.startDate || ""));
}
