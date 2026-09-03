import type { RawEvidenceItem, ExtractedCandidateEvent } from "../types";
import { processCandidateEvent } from "../pipeline";

export interface WireDispatch {
  dispatchId: string;
  wireService: "Associated Press" | "Reuters" | "Agence France-Presse";
  headline: string;
  datelineCity: string;
  datelineDate: string; // "1998-10-23"
  participants: string[];
  eventType: "bilateral-meeting" | "signing-ceremony" | "press-conference";
  venue: string;
  country: string;
  articleText: string;
  url?: string;
}

export function ingestWireDispatch(dispatch: WireDispatch) {
  const rawItem: RawEvidenceItem = {
    sourceId: `src-wire-${dispatch.wireService.toLowerCase().replace(/\s+/g, "-")}-${dispatch.dispatchId}`,
    sourceTitle: `${dispatch.wireService} Wire Dispatch: ${dispatch.headline}`,
    publisher: dispatch.wireService,
    sourceType: "wire-report",
    sourceTier: "tier-c",
    url: dispatch.url,
    rawText: dispatch.articleText,
    fetchedAt: new Date().toISOString(),
  };

  const candidate: ExtractedCandidateEvent = {
    title: dispatch.headline,
    summary: `${dispatch.wireService} contemporary report on ${dispatch.headline} in ${dispatch.datelineCity}.`,
    startDate: dispatch.datelineDate,
    temporalPrecision: "exact-day",
    eventType: dispatch.eventType,
    venue: dispatch.venue,
    city: dispatch.datelineCity,
    country: dispatch.country,
    participants: dispatch.participants.map((p) => ({
      name: p,
      role: "principal" as const,
      presenceMode: "physical" as const,
    })),
    claims: dispatch.participants.map((p) => ({
      subjectMention: p,
      claimType: "presence" as const,
      statement: `Reported present by ${dispatch.wireService} at ${dispatch.venue}.`,
      claimedTime: dispatch.datelineDate,
      claimedVenue: dispatch.venue,
      supportingExcerpt: dispatch.articleText.slice(0, 180),
    })),
    quotes: [],
    hasSensitiveLegalMatters: false,
    involvesLivingPersonPrivateMovement: false,
    involvesMinors: false,
  };

  return processCandidateEvent(candidate, rawItem);
}
