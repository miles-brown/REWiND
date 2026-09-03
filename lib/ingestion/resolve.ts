import { getRelationalStore } from "@/lib/db/client";

// Normalize names by removing punctuation, titles, and extra whitespace
function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\b(prime minister|president|mr\.|mrs\.|dr\.|ambassador|secretary|rabbi)\b/g, "")
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

export function resolveEntity(rawName: string): EntityResolution {
  const store = getRelationalStore();
  const normalized = normalizeName(rawName);

  // 1. Direct ID or Canonical Name Match
  for (const p of store.people) {
    if (
      p.id.toLowerCase() === normalized ||
      p.canonicalName.toLowerCase() === rawName.toLowerCase() ||
      normalizeName(p.canonicalName) === normalized
    ) {
      return {
        personId: p.id,
        canonicalName: p.canonicalName,
        confidence: 1.0,
        isApprovedSubject: p.publicationStatus === "published",
      };
    }

    // Substring / Last name match
    const parts = normalized.split(" ");
    const canonicalParts = normalizeName(p.canonicalName).split(" ");
    const lastName = parts[parts.length - 1];
    const canonicalLastName = canonicalParts[canonicalParts.length - 1];

    if (lastName === canonicalLastName && lastName.length > 3) {
      return {
        personId: p.id,
        canonicalName: p.canonicalName,
        confidence: 0.96,
        isApprovedSubject: p.publicationStatus === "published",
      };
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

  // Match against existing gazetteer
  for (const pl of store.places) {
    const plCity = (pl.city || "").toLowerCase().replace(/[^\w\s]/g, "").trim();
    const plVenue = (pl.venue || "").toLowerCase().replace(/[^\w\s]/g, "").trim();

    if (
      plCity &&
      (plCity === normCity || plCity.includes(normCity) || (normCity.length > 3 && normCity.includes(plCity))) &&
      (plVenue.includes(normVenue) || (normVenue.length > 3 && normVenue.includes(plVenue)))
    ) {
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

    if (plCity && (plCity === normCity || plCity.includes(normCity) || (normCity.length > 3 && normCity.includes(plCity)))) {
      return {
        placeId: pl.id,
        venue: safeVenue,
        city: pl.city,
        country: pl.country,
        latitude: pl.latitude ?? undefined,
        longitude: pl.longitude ?? undefined,
        confidence: 0.92,
      };
    }
  }

  // Create a slugged gazetteer entry if new
  const fallbackSlug = `plc-${safeCity.toLowerCase().replace(/[^\w]/g, "-")}-${safeVenue.toLowerCase().replace(/[^\w]/g, "-").slice(0, 20)}`;
  return {
    placeId: fallbackSlug,
    venue: safeVenue,
    city: safeCity,
    country: safeCountry,
    confidence: 0.85,
  };
}
