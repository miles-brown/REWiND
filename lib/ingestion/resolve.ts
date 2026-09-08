import { getRelationalStore, getDb } from "@/lib/db/client";
import * as schema from "@/db/schema";
import { eq, or, ilike } from "drizzle-orm";

function escapeIlikePattern(str: string): string {
  return str.replace(/[%_\\]/g, "\\$&");
}

// Normalize names by removing punctuation, titles, and extra whitespace
function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\b(prime minister|president|mr\.|mrs\.|ms\.|dr\.|ambassador|secretary|rabbi|foreign minister)\b/g, "")
    .replace(/[^\w\s]/g, "")
    .trim()
    .replace(/\s+/g, " ");
}

export interface EntityResolution {
  personId: string | null;
  canonicalName: string | null;
  confidence: number;
  isApprovedSubject: boolean;
}

export async function resolveEntityAsync(
  rawName: string,
  dbInstance?: ReturnType<typeof getDb>
): Promise<EntityResolution> {
  const db = dbInstance ?? getDb();
  const normalized = normalizeName(rawName);
  if (!normalized) {
    return { personId: null, canonicalName: null, confidence: 0.0, isApprovedSubject: false };
  }

  if (db) {
    try {
      const escapedRaw = escapeIlikePattern(rawName);
      const escapedNorm = escapeIlikePattern(normalized);

      // 1. Exact ID, slug, canonical name, or display name match in live DB
      const peopleMatches = await db
        .select({
          id: schema.people.id,
          slug: schema.people.slug,
          canonicalName: schema.people.canonicalName,
          displayName: schema.people.displayName,
          publicationStatus: schema.people.publicationStatus,
        })
        .from(schema.people)
        .where(
          or(
            eq(schema.people.id, normalized),
            eq(schema.people.slug, normalized),
            ilike(schema.people.canonicalName, escapedRaw),
            ilike(schema.people.displayName, escapedRaw),
            ilike(schema.people.canonicalName, escapedNorm),
            ilike(schema.people.displayName, escapedNorm)
          )
        );

      if (peopleMatches.length === 1) {
        const p = peopleMatches[0];
        return {
          personId: p.id,
          canonicalName: p.canonicalName,
          confidence: 1.0,
          isApprovedSubject: p.publicationStatus === "published",
        };
      }

      if (peopleMatches.length > 1) {
        const exactMatch = peopleMatches.find(
          (p) =>
            p.id.toLowerCase() === normalized ||
            p.slug.toLowerCase() === normalized ||
            p.canonicalName.toLowerCase() === rawName.toLowerCase() ||
            normalizeName(p.canonicalName) === normalized
        );
        if (exactMatch) {
          return {
            personId: exactMatch.id,
            canonicalName: exactMatch.canonicalName,
            confidence: 1.0,
            isApprovedSubject: exactMatch.publicationStatus === "published",
          };
        }
      }

      // 2. Alias match in live DB
      const aliasMatches = await db
        .select({
          personId: schema.personAliases.personId,
          alias: schema.personAliases.alias,
          canonicalName: schema.people.canonicalName,
          publicationStatus: schema.people.publicationStatus,
        })
        .from(schema.personAliases)
        .innerJoin(schema.people, eq(schema.personAliases.personId, schema.people.id))
        .where(
          or(
            eq(schema.personAliases.alias, rawName),
            eq(schema.personAliases.alias, normalized),
            ilike(schema.personAliases.alias, escapedRaw),
            ilike(schema.personAliases.alias, escapedNorm)
          )
        );

      const distinctAliasPersons = Array.from(
        new Map(aliasMatches.map((a) => [a.personId, a])).values()
      );

      if (distinctAliasPersons.length === 1) {
        const a = distinctAliasPersons[0];
        return {
          personId: a.personId,
          canonicalName: a.canonicalName,
          confidence: 0.95,
          isApprovedSubject: a.publicationStatus === "published",
        };
      }

      // 3. Surname match in live DB (single-token surname)
      const parts = normalized.split(" ").filter(Boolean);
      if (parts.length === 1 && parts[0].length > 3) {
        const surname = parts[0];
        const surnamePattern = `% ${escapeIlikePattern(surname)}`;
        const surnameMatches = await db
          .select({
            id: schema.people.id,
            canonicalName: schema.people.canonicalName,
            publicationStatus: schema.people.publicationStatus,
          })
          .from(schema.people)
          .where(ilike(schema.people.canonicalName, surnamePattern));

        if (surnameMatches.length === 1) {
          const p = surnameMatches[0];
          return {
            personId: p.id,
            canonicalName: p.canonicalName,
            confidence: 0.80,
            isApprovedSubject: p.publicationStatus === "published",
          };
        }
      }
    } catch {
      // Fallback to store on DB query error
    }
  }

  return resolveEntity(rawName);
}

export function resolveEntity(rawName: string): EntityResolution {
  const store = getRelationalStore();
  const normalized = normalizeName(rawName);
  if (!normalized) {
    return { personId: null, canonicalName: null, confidence: 0.0, isApprovedSubject: false };
  }

  // 1. Exact ID or Exact Canonical Name Match
  for (const p of store.people) {
    const normCanonical = normalizeName(p.canonicalName);
    if (
      p.id.toLowerCase() === normalized ||
      p.canonicalName.toLowerCase() === rawName.toLowerCase() ||
      normCanonical === normalized
    ) {
      return {
        personId: p.id,
        canonicalName: p.canonicalName,
        confidence: 1.0,
        isApprovedSubject: p.publicationStatus === "published",
      };
    }
  }

  // 2. Alias match
  for (const alias of store.personAliases || []) {
    if (normalizeName(alias.alias) === normalized) {
      const p = store.people.find((person) => person.id === alias.personId);
      if (p) {
        return {
          personId: p.id,
          canonicalName: p.canonicalName,
          confidence: 0.95,
          isApprovedSubject: p.publicationStatus === "published",
        };
      }
    }
  }

  // 3. Surname match (only if single-token surname or first names do not conflict)
  const parts = normalized.split(" ").filter(Boolean);
  if (parts.length === 1 && parts[0].length > 3) {
    const surname = parts[0];
    for (const p of store.people) {
      const canonicalParts = normalizeName(p.canonicalName).split(" ").filter(Boolean);
      const canonicalLastName = canonicalParts[canonicalParts.length - 1];
      if (surname === canonicalLastName) {
        return {
          personId: p.id,
          canonicalName: p.canonicalName,
          confidence: 0.80, // Lower confidence for surname-only match, requiring confirmation
          isApprovedSubject: p.publicationStatus === "published",
        };
      }
    }
  }

  return {
    personId: null,
    canonicalName: null,
    confidence: 0.0,
    isApprovedSubject: false,
  };
}

export interface PlaceResolution {
  placeId: string;
  venue: string;
  city: string;
  country: string;
  latitude?: number;
  longitude?: number;
  confidence: number;
}

export function resolvePlace(venue?: string, city?: string, country?: string): PlaceResolution {
  const store = getRelationalStore();
  const safeCity = city || "";
  const safeVenue = venue || "";
  const safeCountry = country || "";

  const normCity = safeCity.toLowerCase().replace(/[^\w\s]/g, "").trim();
  const normVenue = safeVenue.toLowerCase().replace(/[^\w\s]/g, "").trim();

  // If both city and venue are empty, do not fabricate gazetteer matches
  if (!normCity && !normVenue) {
    return {
      placeId: "plc-unknown-general",
      venue: "General",
      city: "Unknown",
      country: safeCountry || "International",
      confidence: 0.5,
    };
  }

  // Match against existing gazetteer
  for (const pl of store.places) {
    const plCity = (pl.city || "").toLowerCase().replace(/[^\w\s]/g, "").trim();
    const plVenue = (pl.venue || "").toLowerCase().replace(/[^\w\s]/g, "").trim();

    const cityMatches =
      normCity.length >= 2 &&
      plCity.length >= 2 &&
      (plCity === normCity || (normCity.length > 3 && plCity.includes(normCity)) || (plCity.length > 3 && normCity.includes(plCity)));

    const venueMatches =
      normVenue.length >= 2 &&
      plVenue.length >= 2 &&
      (plVenue === normVenue || plVenue.includes(normVenue) || normVenue.includes(plVenue));

    if (cityMatches && venueMatches) {
      return {
        placeId: pl.id,
        venue: pl.venue,
        city: pl.city,
        country: pl.country,
        latitude: pl.latitude ?? undefined,
        longitude: pl.longitude ?? undefined,
        confidence: 0.98,
      };
    }

    if (cityMatches) {
      return {
        placeId: pl.id,
        venue: safeVenue || pl.venue,
        city: pl.city,
        country: pl.country,
        latitude: pl.latitude ?? undefined,
        longitude: pl.longitude ?? undefined,
        confidence: 0.92,
      };
    }
  }

  // Create a slugged gazetteer entry if new
  const citySlug = safeCity ? safeCity.toLowerCase().replace(/[^\w]/g, "-") : "unknown";
  const venueSlug = safeVenue ? safeVenue.toLowerCase().replace(/[^\w]/g, "-").slice(0, 20) : "general";
  const fallbackSlug = `plc-${citySlug}-${venueSlug}`;

  return {
    placeId: fallbackSlug,
    venue: safeVenue || "General",
    city: safeCity || "Unknown",
    country: safeCountry,
    confidence: 0.85,
  };
}
