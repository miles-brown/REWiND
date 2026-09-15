import { createHash } from "node:crypto";
import { getRelationalStore, getDb } from "@/lib/db/client";
import * as schema from "@/db/schema";
import { eq, or, ilike, and } from "drizzle-orm";

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

/**
 * Derives a collision-resistant participant ID for unresolved names.
 * Ensures non-ASCII names, long names with identical prefixes, and symbolic names
 * produce unique, stable IDs.
 */
export function createParticipantStubId(name: string, resolvedPersonId?: string | null): string {
  if (resolvedPersonId) return resolvedPersonId;
  const nameKey = name.toLowerCase().trim();
  const nameDigest = createHash("sha256").update(nameKey).digest("hex").slice(0, 8);
  const normalizedBase =
    nameKey.replace(/[^\w]/g, "-").replace(/-+/g, "-").replace(/^-+|-+$/g, "").slice(0, 16) || "unknown";
  return `p-${normalizedBase}-${nameDigest}`;
}

type TransactionClient = Parameters<Parameters<NonNullable<ReturnType<typeof getDb>>["transaction"]>[0]>[0];

/**
 * Resolves or registers a person entity within a PostgreSQL transaction:
 * 1. Checks if a person row exists by canonical ID; promotes to published if draft.
 * 2. Checks if a person row exists by slug, returning its canonical ID.
 * 3. Checks exact canonical/display name and alias matches.
 * 4. Creates a new published person record if no match exists.
 */
export async function resolvePersonEntityInTransaction(
  tx: TransactionClient,
  options: {
    personId: string;
    rawName: string;
    roleLabel?: string;
  }
): Promise<string> {
  const { personId, rawName } = options;
  const effectivePersonId = personId;

  // 1. Exact ID match
  const [existingPerson] = await tx
    .select({ id: schema.people.id, publicationStatus: schema.people.publicationStatus })
    .from(schema.people)
    .where(eq(schema.people.id, effectivePersonId));

  if (existingPerson) {
    return existingPerson.id;
  }

  // 2. Slug match (reusing existing canonical ID if different from generated ID)
  const pSlug = effectivePersonId.replace(/^p-/, "");
  const [bySlug] = await tx
    .select({ id: schema.people.id, publicationStatus: schema.people.publicationStatus })
    .from(schema.people)
    .where(eq(schema.people.slug, pSlug));

  if (bySlug) {
    return bySlug.id;
  }

  // 3. Name match via canonicalName or displayName (exact or normalized)
  const escapedName = escapeIlikePattern(rawName);
  const escapedNormalizedName = escapeIlikePattern(normalizeName(rawName));
  const matchingByName = await tx
    .select({ id: schema.people.id, publicationStatus: schema.people.publicationStatus })
    .from(schema.people)
    .where(
      or(
        ilike(schema.people.canonicalName, escapedName),
        ilike(schema.people.displayName, escapedName),
        ilike(schema.people.canonicalName, escapedNormalizedName),
        ilike(schema.people.displayName, escapedNormalizedName)
      )
    );

  const distinctNameMatches: string[] = Array.from(new Set(matchingByName.map((p: { id: string }) => p.id)));
  if (distinctNameMatches.length === 1) {
    return distinctNameMatches[0];
  }

  // 4. Alias match
  if (distinctNameMatches.length === 0) {
    const aliasRows = await tx
      .select({ personId: schema.personAliases.personId })
      .from(schema.personAliases)
      .where(
        or(
          ilike(schema.personAliases.alias, escapedName),
          ilike(schema.personAliases.alias, escapedNormalizedName),
          eq(schema.personAliases.alias, rawName)
        )
      );
    const distinctPersonIds: string[] = Array.from(new Set(aliasRows.map((r: { personId: string }) => r.personId)));
    if (distinctPersonIds.length === 1) {
      return distinctPersonIds[0];
    }
  }

  // 5. Insert new person record as draft (idempotent for concurrent inserts)
  await tx
    .insert(schema.people)
    .values({
      id: effectivePersonId,
      slug: pSlug,
      displayName: rawName,
      canonicalName: rawName,
      nationality: "International",
      classification: "historical-figure",
      notabilityBasis: "Documented participant in verified historical event",
      publicationStatus: "draft",
    })
    .onConflictDoNothing();

  const [canonicalPerson] = await tx
    .select({ id: schema.people.id })
    .from(schema.people)
    .where(or(eq(schema.people.id, effectivePersonId), eq(schema.people.slug, pSlug)));

  return canonicalPerson ? canonicalPerson.id : effectivePersonId;
}

export interface EntityResolution {
  personId: string | null;
  canonicalName: string | null;
  confidence: number;
  isApprovedSubject: boolean;
}

export async function resolveEntityAsync(
  rawName: string,
  dbInstance?: NonNullable<ReturnType<typeof getDb>> | TransactionClient | null
): Promise<EntityResolution> {
  const db = dbInstance === undefined ? getDb() : dbInstance;
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

function sanitizeCoordinates(lat?: number, lng?: number): { latitude?: number; longitude?: number } {
  if (
    typeof lat === "number" &&
    typeof lng === "number" &&
    !Number.isNaN(lat) &&
    !Number.isNaN(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  ) {
    return { latitude: lat, longitude: lng };
  }
  return { latitude: undefined, longitude: undefined };
}

function resolveMatchedCoordinates(
  storedLat: number | null | undefined,
  storedLng: number | null | undefined,
  candidateCoords: { latitude?: number; longitude?: number }
): { latitude?: number; longitude?: number } {
  const sanitizedStored = sanitizeCoordinates(storedLat ?? undefined, storedLng ?? undefined);
  if (sanitizedStored.latitude !== undefined && sanitizedStored.longitude !== undefined) {
    return sanitizedStored;
  }
  return { latitude: candidateCoords.latitude, longitude: candidateCoords.longitude };
}

export function resolvePlace(
  venue?: string,
  city?: string,
  country?: string,
  latitude?: number,
  longitude?: number
): PlaceResolution {
  const store = getRelationalStore();
  const safeCity = city || "";
  const safeVenue = venue || "";
  const safeCountry = country || "";
  const coords = sanitizeCoordinates(latitude, longitude);

  const normCity = safeCity.toLowerCase().replace(/[^\w\s]/g, "").trim();
  const normVenue = safeVenue.toLowerCase().replace(/[^\w\s]/g, "").trim();

  // If both city and venue are empty, do not fabricate gazetteer matches
  if (!normCity && !normVenue) {
    return {
      placeId: "plc-unknown-general",
      venue: "General",
      city: "Unknown",
      country: safeCountry || "International",
      latitude: coords.latitude,
      longitude: coords.longitude,
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
      const resolvedCoords = resolveMatchedCoordinates(pl.latitude, pl.longitude, coords);
      return {
        placeId: pl.id,
        venue: pl.venue,
        city: pl.city,
        country: pl.country,
        latitude: resolvedCoords.latitude,
        longitude: resolvedCoords.longitude,
        confidence: 0.98,
      };
    }

    if (cityMatches) {
      const resolvedCoords = resolveMatchedCoordinates(pl.latitude, pl.longitude, coords);
      return {
        placeId: pl.id,
        venue: safeVenue || pl.venue,
        city: pl.city,
        country: pl.country,
        latitude: resolvedCoords.latitude,
        longitude: resolvedCoords.longitude,
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
    latitude: coords.latitude,
    longitude: coords.longitude,
    confidence: 0.85,
  };
}

export async function resolvePlaceAsync(
  venue?: string,
  city?: string,
  country?: string,
  latitude?: number,
  longitude?: number,
  dbInstance?: ReturnType<typeof getDb>
): Promise<PlaceResolution> {
  const db = dbInstance !== undefined ? dbInstance : getDb();
  const safeCity = city || "";
  const safeVenue = venue || "";
  const safeCountry = country || "";
  const coords = sanitizeCoordinates(latitude, longitude);

  const normCity = safeCity.toLowerCase().replace(/[^\w\s]/g, "").trim();
  const normVenue = safeVenue.toLowerCase().replace(/[^\w\s]/g, "").trim();

  // If both city and venue are empty, do not fabricate gazetteer matches
  if (!normCity && !normVenue) {
    return {
      placeId: "plc-unknown-general",
      venue: "General",
      city: "Unknown",
      country: safeCountry || "International",
      latitude: coords.latitude,
      longitude: coords.longitude,
      confidence: 0.5,
    };
  }

  if (db) {
    try {
      const escapedVenue = escapeIlikePattern(safeVenue);
      const escapedCity = escapeIlikePattern(safeCity);
      const escapedCountry = escapeIlikePattern(safeCountry);

      // 1. Exact match on both venue and city
      if (safeVenue && safeCity) {
        const bothConditions = [
          ilike(schema.places.venue, escapedVenue),
          ilike(schema.places.city, escapedCity),
        ];
        if (safeCountry) {
          bothConditions.push(ilike(schema.places.country, escapedCountry));
        }

        const bothMatches = await db
          .select()
          .from(schema.places)
          .where(and(...bothConditions));

        const distinctPlaceIds = Array.from(new Set(bothMatches.map((pl) => pl.id)));
        if (distinctPlaceIds.length === 1) {
          const pl = bothMatches.find((p) => p.id === distinctPlaceIds[0])!;
          const resolvedCoords = resolveMatchedCoordinates(pl.latitude, pl.longitude, coords);
          return {
            placeId: pl.id,
            venue: pl.venue,
            city: pl.city,
            country: pl.country,
            latitude: resolvedCoords.latitude,
            longitude: resolvedCoords.longitude,
            confidence: 0.98,
          };
        }
      }

      // 2. Place alias match (venue alias lookup)
      if (safeVenue) {
        const aliasConditions = [
          or(
            ilike(schema.placeAliases.alias, escapedVenue),
            eq(schema.placeAliases.alias, safeVenue)
          ),
        ];
        if (safeCity) {
          aliasConditions.push(ilike(schema.places.city, escapedCity));
        }
        if (safeCountry) {
          aliasConditions.push(ilike(schema.places.country, escapedCountry));
        }

        const aliasMatches = await db
          .select({
            placeId: schema.placeAliases.placeId,
            alias: schema.placeAliases.alias,
            venue: schema.places.venue,
            city: schema.places.city,
            country: schema.places.country,
            latitude: schema.places.latitude,
            longitude: schema.places.longitude,
          })
          .from(schema.placeAliases)
          .innerJoin(schema.places, eq(schema.placeAliases.placeId, schema.places.id))
          .where(and(...aliasConditions));

        const distinctAliasPlaceIds = Array.from(new Set(aliasMatches.map((pl) => pl.placeId)));
        if (distinctAliasPlaceIds.length === 1) {
          const pl = aliasMatches.find((p) => p.placeId === distinctAliasPlaceIds[0])!;
          const resolvedCoords = resolveMatchedCoordinates(pl.latitude, pl.longitude, coords);
          return {
            placeId: pl.placeId,
            venue: pl.venue,
            city: pl.city,
            country: pl.country,
            latitude: resolvedCoords.latitude,
            longitude: resolvedCoords.longitude,
            confidence: 0.95,
          };
        }
      }

      // 3. Match city only (when venue is empty or no specific venue matched)
      if (safeCity) {
        const cityConditions = [ilike(schema.places.city, escapedCity)];
        if (safeCountry) {
          cityConditions.push(ilike(schema.places.country, escapedCountry));
        }

        const cityMatches = await db
          .select()
          .from(schema.places)
          .where(and(...cityConditions));

        const distinctCityPlaceIds = Array.from(new Set(cityMatches.map((pl) => pl.id)));
        if (distinctCityPlaceIds.length === 1) {
          const pl = cityMatches[0];
          const resolvedCoords = resolveMatchedCoordinates(pl.latitude, pl.longitude, coords);
          return {
            placeId: pl.id,
            venue: safeVenue || pl.venue,
            city: pl.city,
            country: pl.country,
            latitude: resolvedCoords.latitude,
            longitude: resolvedCoords.longitude,
            confidence: 0.92,
          };
        } else if (cityMatches.length > 1) {
          // If multiple places exist in the city, check for a general city marker or exact venue match
          const specificMatch = cityMatches.find(
            (pl) =>
              (safeVenue && pl.venue.toLowerCase() === normVenue) ||
              pl.venue.toLowerCase() === "general" ||
              pl.venue.toLowerCase() === normCity
          );
          if (specificMatch) {
            const resolvedCoords = resolveMatchedCoordinates(specificMatch.latitude, specificMatch.longitude, coords);
            return {
              placeId: specificMatch.id,
              venue: safeVenue || specificMatch.venue,
              city: specificMatch.city,
              country: specificMatch.country,
              latitude: resolvedCoords.latitude,
              longitude: resolvedCoords.longitude,
              confidence: 0.92,
            };
          }
        }
      }
    } catch {
      // Fallback to in-memory store on DB query error
    }
  }

  return resolvePlace(venue, city, country, latitude, longitude);
}
