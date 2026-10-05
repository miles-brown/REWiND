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
  const normText = (text || "").toLowerCase();

  // Explicit residences & palace locations
  if (normLoc.includes("windsor") || normText.includes("windsor castle")) {
    return {
      venue: venueOverride || "Windsor Castle",
      city: "Windsor",
      country: "United Kingdom",
      latitude: 51.4839,
      longitude: -0.6044,
    };
  }

  if (normLoc.includes("holyrood") || normText.includes("palace of holyroodhouse")) {
    return {
      venue: venueOverride || "Palace of Holyroodhouse",
      city: "Edinburgh",
      country: "United Kingdom",
      latitude: 55.9527,
      longitude: -3.1723,
    };
  }

  if (normLoc.includes("balmoral") || normText.includes("balmoral castle")) {
    return {
      venue: venueOverride || "Balmoral Castle",
      city: "Crathie",
      country: "United Kingdom",
      latitude: 57.0397,
      longitude: -3.2282,
    };
  }

  if (normLoc.includes("sandringham") || normText.includes("sandringham house")) {
    return {
      venue: venueOverride || "Sandringham House",
      city: "Sandringham",
      country: "United Kingdom",
      latitude: 52.8296,
      longitude: 0.5142,
    };
  }

  if (normLoc.includes("st james") || normLoc.includes("st. james") || normText.includes("st james's palace")) {
    return {
      venue: venueOverride || "St James's Palace",
      city: "London",
      country: "United Kingdom",
      latitude: 51.5048,
      longitude: -0.1378,
    };
  }

  if (normLoc.includes("kensington") || normText.includes("kensington palace")) {
    return {
      venue: venueOverride || "Kensington Palace",
      city: "London",
      country: "United Kingdom",
      latitude: 51.505,
      longitude: -0.1877,
    };
  }

  if (normLoc.includes("clarence") || normText.includes("clarence house")) {
    return {
      venue: venueOverride || "Clarence House",
      city: "London",
      country: "United Kingdom",
      latitude: 51.5039,
      longitude: -0.1386,
    };
  }

  // Overseas state visit targets parsed from entry text
  if (normText.includes("paris") || normText.includes("elysée") || normText.includes("elysee")) {
    return {
      venue: venueOverride || "Élysée Palace",
      city: "Paris",
      country: "France",
      latitude: 48.8704,
      longitude: 2.3166,
    };
  }

  if (normText.includes("washington") || normText.includes("white house")) {
    return {
      venue: venueOverride || "The White House",
      city: "Washington, D.C.",
      country: "United States",
      latitude: 38.8977,
      longitude: -77.0365,
    };
  }

  if (normText.includes("rome") || normText.includes("quirinale") || normText.includes("vatican")) {
    return {
      venue: venueOverride || "Quirinal Palace",
      city: "Rome",
      country: "Italy",
      latitude: 41.9001,
      longitude: 12.4871,
    };
  }

  if (normText.includes("berlin") || normText.includes("bellevue")) {
    return {
      venue: venueOverride || "Bellevue Palace",
      city: "Berlin",
      country: "Germany",
      latitude: 52.5178,
      longitude: 13.3533,
    };
  }

  if (normText.includes("madrid") || normText.includes("zarzuela") || normText.includes("palacio real")) {
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
  const participantsList = (entry.principals && entry.principals.length > 0 ? entry.principals : ["The Sovereign"]).map((p) => ({
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
