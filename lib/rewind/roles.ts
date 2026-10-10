import { getDb, getRelationalStore } from "@/lib/db/client";
import { createClient } from "@/lib/supabase/server";
import * as schema from "@/db/schema";
import { eq, or } from "drizzle-orm";

export interface PersonRoleRecord {
  id: number;
  personId: string;
  title: string;
  organisationId: string | null;
  organisationName?: string | null;
  startDate: string | null;
  endDate: string | null;
  isCurrent: boolean;
}

export async function getPersonRoles(
  personSlugOrId: string,
  supabaseClient?: unknown
): Promise<PersonRoleRecord[]> {
  const db = getDb();
  if (db) {
    try {
      const matchedPeople = await db
        .select({ id: schema.people.id, slug: schema.people.slug })
        .from(schema.people)
        .where(or(eq(schema.people.slug, personSlugOrId), eq(schema.people.id, personSlugOrId)))
        .limit(1);

      const person = matchedPeople[0];
      if (person) {
        const rows = await db
          .select({
            id: schema.personRoles.id,
            personId: schema.personRoles.personId,
            title: schema.personRoles.title,
            organisationId: schema.personRoles.organisationId,
            organisationName: schema.organisations.name,
            startDate: schema.personRoles.startDate,
            endDate: schema.personRoles.endDate,
            isCurrent: schema.personRoles.isCurrent,
          })
          .from(schema.personRoles)
          .leftJoin(schema.organisations, eq(schema.personRoles.organisationId, schema.organisations.id))
          .where(or(eq(schema.personRoles.personId, person.id), eq(schema.personRoles.personId, person.slug)));

        if (rows.length > 0 || process.env.NODE_ENV === "production") {
          return rows.map((r) => ({
            id: r.id,
            personId: r.personId,
            title: r.title,
            organisationId: r.organisationId,
            organisationName: r.organisationName || null,
            startDate: r.startDate,
            endDate: r.endDate,
            isCurrent: r.isCurrent,
          })).sort((a, b) => (a.startDate || "").localeCompare(b.startDate || ""));
        }
      } else if (process.env.NODE_ENV === "production") {
        return [];
      }
    } catch {
      if (process.env.NODE_ENV === "production") {
        return [];
      }
    }
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = (supabaseClient !== undefined ? supabaseClient : (await createClient())) as any;
    if (supabase) {
      const { data: p } = await supabase
        .from("people")
        .select("id, slug")
        .or(`slug.eq.${personSlugOrId},id.eq.${personSlugOrId}`)
        .maybeSingle();

      if (p) {
        const { data: roleRows } = await supabase
          .from("person_roles")
          .select("id, person_id, title, organisation_id, start_date, end_date, is_current, organisations(name)")
          .or(`person_id.eq.${p.id},person_id.eq.${p.slug}`)
          .order("start_date", { ascending: true });

        if (roleRows && (roleRows.length > 0 || process.env.NODE_ENV === "production")) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          return roleRows.map((r: any) => ({
            id: r.id,
            personId: r.person_id,
            title: r.title,
            organisationId: r.organisation_id || null,
            organisationName: (Array.isArray(r.organisations) ? r.organisations[0]?.name : r.organisations?.name) || null,
            startDate: r.start_date || null,
            endDate: r.end_date || null,
            isCurrent: Boolean(r.is_current),
          }));
        }
      } else if (process.env.NODE_ENV === "production") {
        return [];
      }
    }
  } catch {
    if (process.env.NODE_ENV === "production") {
      return [];
    }
  }

  // Fallback in-memory store
  const store = getRelationalStore();
  const person = store.people.find((p) => p.slug === personSlugOrId || p.id === personSlugOrId);
  if (!person) return [];

  const roles = store.personRoles.filter((r) => r.personId === person.id || r.personId === person.slug);
  return roles.map((r) => ({
    id: r.id,
    personId: r.personId,
    title: r.title,
    organisationId: r.organisationId,
    organisationName: r.organisationName || null,
    startDate: r.startDate,
    endDate: r.endDate,
    isCurrent: r.isCurrent,
  })).sort((a, b) => (a.startDate || "").localeCompare(b.startDate || ""));
}
