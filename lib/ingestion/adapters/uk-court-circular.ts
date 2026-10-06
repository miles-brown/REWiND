import type { RawEvidenceItem, ExtractedCandidateEvent } from "../types";
import { processCandidateEvent } from "../pipeline";

export interface CourtCircularEntry {
  entryId: string; // e.g. "cc-19940506-01"
  date: string; // "1994-05-06"
  courtLocation: string; // "Buckingham Palace" | "Windsor Castle" | "Palace of Holyroodhouse" | etc.
  text: string; // Full entry paragraph
  principals: string[]; // ["Queen Elizabeth II", "The Duke of Edinburgh"]
  eventType?: "official-visit" | "bilateral-meeting" | "signing-ceremony" | "historical-action" | "speech-plenary";
  venue?: string;
  city?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  url?: string;
}

interface VenueGeocoding {
  venue: string;
  city: string;
  country: string;
  latitude?: number;
  longitude?: number;
}

function resolveCourtCircularLocation(courtLocation: string, text: string, venueOverride?: string): VenueGeocoding {
  const normLoc = (courtLocation || "").toLowerCase();
  const normText = text || "";

  // Explicit residences & palace locations (skip text geocoding if courtLocation is known)
  if (normLoc.includes("windsor")) {
    return {
      venue: venueOverride || "Windsor Castle",
      city: "Windsor",
      country: "United Kingdom",
      latitude: 51.4839,
      longitude: -0.6044,
    };
  }

  if (normLoc.includes("holyrood")) {
    return {
      venue: venueOverride || "Palace of Holyroodhouse",
      city: "Edinburgh",
      country: "United Kingdom",
      latitude: 55.9527,
      longitude: -3.1723,
    };
  }

  if (normLoc.includes("balmoral")) {
    return {
      venue: venueOverride || "Balmoral Castle",
      city: "Crathie",
      country: "United Kingdom",
      latitude: 57.0397,
      longitude: -3.2282,
    };
  }

  if (normLoc.includes("sandringham")) {
    return {
      venue: venueOverride || "Sandringham House",
      city: "Sandringham",
      country: "United Kingdom",
      latitude: 52.8296,
      longitude: 0.5142,
    };
  }

  if (normLoc.includes("st james") || normLoc.includes("st. james")) {
    return {
      venue: venueOverride || "St James's Palace",
      city: "London",
      country: "United Kingdom",
      latitude: 51.5048,
      longitude: -0.1378,
    };
  }

  if (normLoc.includes("kensington")) {
    return {
      venue: venueOverride || "Kensington Palace",
      city: "London",
      country: "United Kingdom",
      latitude: 51.505,
      longitude: -0.1877,
    };
  }

  if (normLoc.includes("clarence")) {
    return {
      venue: venueOverride || "Clarence House",
      city: "London",
      country: "United Kingdom",
      latitude: 51.5039,
      longitude: -0.1386,
    };
  }

  if (normLoc.includes("buckingham")) {
    return {
      venue: venueOverride || "Buckingham Palace",
      city: "London",
      country: "United Kingdom",
      latitude: 51.5014,
      longitude: -0.1419,
    };
  }

  // Overseas state visit targets parsed from entry text (whole-word matching)
  if (/\b(paris|élysée|elysee)\b/i.test(normText)) {
    return {
      venue: venueOverride || "Élysée Palace",
      city: "Paris",
      country: "France",
      latitude: 48.8704,
      longitude: 2.3166,
    };
  }

  if (/\b(washington|white house)\b/i.test(normText)) {
    return {
      venue: venueOverride || "The White House",
      city: "Washington, D.C.",
      country: "United States",
      latitude: 38.8977,
      longitude: -77.0365,
    };
  }

  if (/\b(rome|quirinale|vatican)\b/i.test(normText)) {
    return {
      venue: venueOverride || "Quirinal Palace",
      city: "Rome",
      country: "Italy",
      latitude: 41.9001,
      longitude: 12.4871,
    };
  }

  if (/\b(berlin|bellevue)\b/i.test(normText)) {
    return {
      venue: venueOverride || "Bellevue Palace",
      city: "Berlin",
      country: "Germany",
      latitude: 52.5178,
      longitude: 13.3533,
    };
  }

  if (/\b(madrid|zarzuela|palacio real)\b/i.test(normText)) {
    return {
      venue: venueOverride || "Palacio Real de Madrid",
      city: "Madrid",
      country: "Spain",
      latitude: 40.418,
      longitude: -3.7143,
    };
  }

  // Default to Buckingham Palace, London
  return {
    venue: venueOverride || "Buckingham Palace",
    city: "London",
    country: "United Kingdom",
    latitude: 51.5014,
    longitude: -0.1419,
  };
}

function detectCourtCircularEventType(text: string): "official-visit" | "bilateral-meeting" | "signing-ceremony" | "speech-plenary" | "historical-action" {
  const norm = text.toLowerCase();
  if (norm.includes("state visit") || norm.includes("official visit") || norm.includes("arrived in") || norm.includes("departed for")) {
    return "official-visit";
  }
  if (norm.includes("treaty") || norm.includes("signing") || norm.includes("ratified") || norm.includes("declaration")) {
    return "signing-ceremony";
  }
  if (norm.includes("audience") || norm.includes("received") || norm.includes("meeting") || norm.includes("summit") || norm.includes("bilateral")) {
    return "bilateral-meeting";
  }
  if (norm.includes("address") || norm.includes("speech") || norm.includes("opened parliament") || norm.includes("plenary")) {
    return "speech-plenary";
  }
  return "historical-action";
}

/**
 * Ingests an official entry from The Court Circular (The Royal Household).
 */
export function ingestCourtCircularEntry(entry: CourtCircularEntry) {
  const cleanId = entry.entryId.replace(/[^a-zA-Z0-9_-]/g, "");
  const rawItem: RawEvidenceItem = {
    sourceId: `src-court-circular-${cleanId}`,
    sourceTitle: `The Court Circular: ${entry.courtLocation} (${entry.date})`,
    publisher: "The Royal Household — Court Circular",
    sourceType: "official-transcript",
    sourceTier: "tier-a",
    url: entry.url || "https://www.royal.uk/court-circular",
    rawText: entry.text,
    fetchedAt: new Date().toISOString(),
  };

  const geocoding = entry.city && entry.country && entry.latitude !== undefined && entry.longitude !== undefined
    ? {
        venue: entry.venue || entry.courtLocation,
        city: entry.city,
        country: entry.country,
        latitude: entry.latitude,
        longitude: entry.longitude,
      }
    : resolveCourtCircularLocation(entry.courtLocation, entry.text, entry.venue);

  const eventType = entry.eventType || detectCourtCircularEventType(entry.text);
  if (!entry.principals || entry.principals.length === 0) {
    return {
      success: false,
      eventId: null,
      error: "Court circular entry has no specified principals for participant attribution.",
      persistedClaimsCount: 0,
      requiresHumanReview: true,
    };
  }
  const participantsList = entry.principals.map((p) => ({
    name: p,
    role: "principal" as const,
    presenceMode: "physical" as const,
  }));

  const candidate: ExtractedCandidateEvent = {
    title: `The Court Circular: ${entry.courtLocation} (${entry.date})`,
    summary: entry.text.slice(0, 300),
    description: `Official Court Circular record published by the British Royal Household for ${entry.date} at ${entry.courtLocation}.`,
    startDate: entry.date,
    temporalPrecision: "exact-day",
    eventType,
    venue: geocoding.venue,
    city: geocoding.city,
    country: geocoding.country,
    latitude: geocoding.latitude,
    longitude: geocoding.longitude,
    participants: participantsList,
    claims: participantsList.map((p) => ({
      subjectMention: p.name,
      claimType: "presence" as const,
      statement: `${p.name} conducted official royal duties at ${geocoding.venue} in ${geocoding.city}, recorded in the Court Circular.`,
      claimedTime: entry.date,
      claimedVenue: geocoding.venue,
      supportingExcerpt: entry.text.slice(0, 240),
    })),
    quotes: [],
    hasSensitiveLegalMatters: false,
    involvesLivingPersonPrivateMovement: false,
    involvesMinors: false,
  };

  return processCandidateEvent(candidate, rawItem);
}
