import type { RawEvidenceItem, ExtractedCandidateEvent } from "../types";
import { processCandidateEvent } from "../pipeline";

export interface UNDocumentRecord {
  symbol: string; // e.g. "A/66/PV.19" or "S/PV.8900"
  title: string;
  meetingDate: string; // "2011-09-23"
  speaker: string; // "Benjamin Netanyahu"
  agendaItem: string;
  body: string; // "General Assembly 66th session plenary" or "Security Council"
  location?: string; // e.g. "New York" or "Geneva" or "The Hague"
  venue?: string;
  url: string;
  verbatimExcerpt: string;
}

function resolveUNLocation(body: string, location?: string, venue?: string) {
  const normLoc = (location || "").toLowerCase();
  const normBody = (body || "").toLowerCase();

  if (normLoc.includes("geneva") || normBody.includes("geneva")) {
    return {
      venue: venue || "Palais des Nations",
      city: "Geneva",
      country: "Switzerland",
      latitude: 46.2266,
      longitude: 6.1408,
    };
  }

  if (normLoc.includes("hague") || normBody.includes("icj") || normBody.includes("court of justice")) {
    return {
      venue: venue || "Peace Palace",
      city: "The Hague",
      country: "Netherlands",
      latitude: 52.0866,
      longitude: 4.2956,
    };
  }

  if (normLoc.includes("vienna") || normBody.includes("iaea") || normBody.includes("vienna")) {
    return {
      venue: venue || "Vienna International Centre",
      city: "Vienna",
      country: "Austria",
      latitude: 48.2348,
      longitude: 16.4168,
    };
  }

  // Default to UNHQ New York
  const defaultVenue = normBody.includes("security council")
    ? "United Nations Headquarters — Security Council Chamber"
    : "United Nations Headquarters — General Assembly Hall";

  return {
    venue: venue || defaultVenue,
    city: "New York",
    country: "United States",
    latitude: 40.7499,
    longitude: -73.9674,
  };
}

export function ingestUNDocument(doc: UNDocumentRecord) {
  const rawItem: RawEvidenceItem = {
    sourceId: `src-un-${doc.symbol.replace(/[\/\.]/g, "-")}`,
    sourceTitle: `UN Official Records: ${doc.symbol} (${doc.title})`,
    publisher: "United Nations Digital Library",
    sourceType: "official-transcript",
    sourceTier: "tier-a",
    url: doc.url,
    rawText: doc.verbatimExcerpt,
    fetchedAt: new Date().toISOString(),
  };

  const loc = resolveUNLocation(doc.body, doc.location, doc.venue);

  const candidate: ExtractedCandidateEvent = {
    title: doc.title,
    summary: `${doc.speaker} addresses the ${doc.body} regarding ${doc.agendaItem}.`,
    description: `Official record ${doc.symbol} from the United Nations digital archives.`,
    startDate: doc.meetingDate,
    temporalPrecision: "exact-day",
    eventType: "speech-plenary",
    venue: loc.venue,
    city: loc.city,
    country: loc.country,
    latitude: loc.latitude,
    longitude: loc.longitude,
    participants: [
      {
        name: doc.speaker,
        role: "principal",
        presenceMode: "physical",
      },
    ],
    claims: [
      {
        subjectMention: doc.speaker,
        claimType: "statement-quote",
        statement: `Delivered formal address on ${doc.agendaItem} to the ${doc.body}.`,
        claimedTime: doc.meetingDate,
        claimedVenue: loc.venue,
        supportingExcerpt: doc.verbatimExcerpt.slice(0, 300),
      },
    ],
    quotes: [
      {
        speaker: doc.speaker,
        quote: doc.verbatimExcerpt.slice(0, 180),
        context: `Delivered during UN Meeting ${doc.symbol}`,
      },
    ],
    hasSensitiveLegalMatters: false,
    involvesLivingPersonPrivateMovement: false,
    involvesMinors: false,
  };

  return processCandidateEvent(candidate, rawItem);
}
