import type { RawEvidenceItem, ExtractedCandidateEvent } from "../types";
import { processCandidateEvent } from "../pipeline";

export interface UNDocumentRecord {
  symbol: string; // e.g. "A/66/PV.19"
  title: string;
  meetingDate: string; // "2011-09-23"
  speaker: string; // "Benjamin Netanyahu"
  agendaItem: string;
  body: string; // "General Assembly 66th session plenary"
  url: string;
  verbatimExcerpt: string;
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

  const candidate: ExtractedCandidateEvent = {
    title: doc.title,
    summary: `${doc.speaker} addresses the ${doc.body} regarding ${doc.agendaItem}.`,
    description: `Official plenary record ${doc.symbol} from the UN General Assembly records.`,
    startDate: doc.meetingDate,
    temporalPrecision: "exact-day",
    eventType: "speech-plenary",
    venue: "United Nations Headquarters — General Assembly Hall",
    city: "New York",
    country: "United States",
    latitude: 40.7499,
    longitude: -73.9674,
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
        statement: `Delivered formal address on ${doc.agendaItem} to the UN General Assembly.`,
        claimedTime: doc.meetingDate,
        claimedVenue: "United Nations Headquarters",
        supportingExcerpt: doc.verbatimExcerpt.slice(0, 300),
      },
    ],
    quotes: [
      {
        speaker: doc.speaker,
        quote: doc.verbatimExcerpt.slice(0, 180),
        context: `Delivered during UN Plenary ${doc.symbol}`,
      },
    ],
    hasSensitiveLegalMatters: false,
    involvesLivingPersonPrivateMovement: false,
    involvesMinors: false,
  };

  return processCandidateEvent(candidate, rawItem);
}
