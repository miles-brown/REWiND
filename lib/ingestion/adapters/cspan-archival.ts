import type { RawEvidenceItem, ExtractedCandidateEvent } from "../types";
import { processCandidateEvent } from "../pipeline";

export interface CSPANProgramRecord {
  programId: string; // e.g. "cspan-73489"
  programTitle: string;
  airDate: string; // "1996-07-09"
  recordedDate?: string; // "1996-07-09"
  location: string; // "Washington, District of Columbia"
  venue: string; // "White House"
  speakers: string[]; // ["Benjamin Netanyahu", "Bill Clinton"]
  format: "bilateral-meeting" | "press-conference" | "speech-plenary";
  summary: string;
  url: string;
  keyExcerpt: string;
}

export function ingestCSPANRecording(rec: CSPANProgramRecord) {
  const rawItem: RawEvidenceItem = {
    sourceId: `src-cspan-${rec.programId}`,
    sourceTitle: `C-SPAN Archival Broadcast: ${rec.programTitle}`,
    publisher: "C-SPAN Video Archive",
    sourceType: "broadcast-video",
    sourceTier: "tier-a",
    url: rec.url,
    rawText: rec.keyExcerpt,
    fetchedAt: new Date().toISOString(),
  };

  const candidate: ExtractedCandidateEvent = {
    title: rec.programTitle,
    summary: rec.summary,
    startDate: rec.recordedDate || rec.airDate,
    temporalPrecision: "exact-day",
    eventType: rec.format,
    venue: rec.venue,
    city: "Washington, D.C.",
    country: "United States",
    latitude: 38.8977,
    longitude: -77.0365,
    participants: rec.speakers.map((s) => ({
      name: s,
      role: "principal" as const,
      presenceMode: "physical" as const,
    })),
    claims: rec.speakers.map((s) => ({
      subjectMention: s,
      claimType: "presence" as const,
      statement: `${s} was physically recorded present at ${rec.venue} in Washington, D.C.`,
      claimedTime: rec.recordedDate || rec.airDate,
      claimedVenue: rec.venue,
      supportingExcerpt: rec.keyExcerpt.slice(0, 200),
    })),
    quotes: [
      {
        speaker: rec.speakers[0] || "Speaker",
        quote: rec.keyExcerpt.slice(0, 160),
        context: `C-SPAN Recording ID ${rec.programId}`,
      },
    ],
    hasSensitiveLegalMatters: false,
    involvesLivingPersonPrivateMovement: false,
    involvesMinors: false,
  };

  return processCandidateEvent(candidate, rawItem);
}
