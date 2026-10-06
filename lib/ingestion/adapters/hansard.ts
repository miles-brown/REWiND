import type { RawEvidenceItem, ExtractedCandidateEvent } from "../types";
import { processCandidateEvent } from "../pipeline";

export interface HansardDebateRecord {
  debateId: string; // e.g. "hansard-hc-19980410"
  chamber: "House of Commons" | "House of Lords" | "Westminster Hall" | "Joint Committee";
  date: string; // "1998-04-10"
  title: string; // "Good Friday Agreement: Statement by the Prime Minister"
  speaker: string; // "Tony Blair"
  speakerRole?: string; // "The Prime Minister (Mr. Tony Blair)"
  topic?: string; // "Northern Ireland Peace Process"
  column?: string; // "vol 310 cc145-152"
  text: string; // Verbatim speech or parliamentary exchange
  url?: string;
}

/**
 * Ingests official parliamentary speeches and debates from the UK Hansard Archive.
 */
export function ingestHansardDebate(rec: HansardDebateRecord) {
  const cleanId = rec.debateId.replace(/[^a-zA-Z0-9_-]/g, "");
  const columnLocator = rec.column ? ` [${rec.column}]` : "";

  const rawItem: RawEvidenceItem = {
    sourceId: `src-hansard-${cleanId}`,
    sourceTitle: `UK Parliament Hansard: ${rec.chamber} — ${rec.title}${columnLocator}`,
    publisher: "UK Parliamentary Hansard",
    sourceType: "official-transcript",
    sourceTier: "tier-a",
    url: rec.url || "https://hansard.parliament.uk",
    rawText: rec.text,
    fetchedAt: new Date().toISOString(),
  };

  const venueTitle = `Palace of Westminster — ${rec.chamber}`;
  const candidate: ExtractedCandidateEvent = {
    title: `${rec.chamber}: ${rec.title}`,
    summary: `${rec.speaker}${rec.speakerRole ? ` (${rec.speakerRole})` : ""} addresses the ${rec.chamber} regarding ${rec.title}.`,
    description: `Official UK Parliamentary debate transcript recorded in Hansard (${rec.chamber}) on ${rec.date}.${rec.column ? ` Column: ${rec.column}.` : ""}`,
    startDate: rec.date,
    temporalPrecision: "exact-day",
    eventType: "parliamentary-debate",
    venue: venueTitle,
    city: "London",
    country: "United Kingdom",
    latitude: 51.4995,
    longitude: -0.1248,
    participants: [
      {
        name: rec.speaker,
        role: "principal",
        presenceMode: "physical",
      },
    ],
    claims: [
      {
        subjectMention: rec.speaker,
        claimType: "statement-quote",
        statement: `Delivered address in the ${rec.chamber} on "${rec.title}" as recorded in official Hansard proceedings.`,
        claimedTime: rec.date,
        claimedVenue: venueTitle,
        supportingExcerpt: rec.text.slice(0, 300),
      },
    ],
    quotes: [
      {
        speaker: rec.speaker,
        quote: rec.text.slice(0, 200),
        context: `Hansard ${rec.chamber} (${rec.date})${columnLocator}`,
      },
    ],
    hasSensitiveLegalMatters: false,
    involvesLivingPersonPrivateMovement: false,
    involvesMinors: false,
  };

  return processCandidateEvent(candidate, rawItem);
}
