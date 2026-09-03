import type { RawEvidenceItem, ExtractedCandidateEvent } from "../types";
import { processCandidateEvent } from "../pipeline";

export interface CSPANProgramRecord {
  programId: string; // e.g. "cspan-73489"
  programTitle: string;
  airDate: string; // "1996-07-09"
  recordedDate?: string; // "1996-07-09"
  location: string; // e.g. "Washington, District of Columbia" or "Geneva, Switzerland"
  venue: string; // "White House"
  speakers: string[]; // ["Benjamin Netanyahu", "Bill Clinton"]
  format: "bilateral-meeting" | "press-conference" | "speech-plenary";
  summary: string;
  url: string;
  keyExcerpt: string;
}

function parseLocation(locStr: string): { city: string; country: string; latitude?: number; longitude?: number } {
  const norm = (locStr || "").trim();

  if (/washington/i.test(norm)) {
    return { city: "Washington, D.C.", country: "United States", latitude: 38.8977, longitude: -77.0365 };
  }
  if (/jerusalem/i.test(norm)) {
    return { city: "Jerusalem", country: "Israel", latitude: 31.7683, longitude: 35.2137 };
  }
  if (/geneva/i.test(norm)) {
    return { city: "Geneva", country: "Switzerland", latitude: 46.2044, longitude: 6.1432 };
  }
  if (/new york/i.test(norm)) {
    return { city: "New York", country: "United States", latitude: 40.7128, longitude: -74.006 };
  }
  if (/london/i.test(norm)) {
    return { city: "London", country: "United Kingdom", latitude: 51.5074, longitude: -0.1278 };
  }
  if (/paris/i.test(norm)) {
    return { city: "Paris", country: "France", latitude: 48.8566, longitude: 2.3522 };
  }
  if (/cairo/i.test(norm)) {
    return { city: "Cairo", country: "Egypt", latitude: 30.0444, longitude: 31.2357 };
  }
  if (/amman/i.test(norm)) {
    return { city: "Amman", country: "Jordan", latitude: 31.9454, longitude: 35.9284 };
  }

  const parts = norm.split(",").map((p) => p.trim());
  const city = parts[0] || "Unknown Location";
  const country = parts[parts.length - 1] || "International";

  return { city, country };
}

export function ingestCSPANRecording(rec: CSPANProgramRecord) {
  const rawItem: RawEvidenceItem = {
    sourceId: `src-cspan-${rec.programId.replace(/[^\w-]/g, "")}`,
    sourceTitle: `C-SPAN Archival Broadcast: ${rec.programTitle}`,
    publisher: "C-SPAN Video Archive",
    sourceType: "broadcast-video",
    sourceTier: "tier-a",
    url: rec.url,
    rawText: rec.keyExcerpt,
    fetchedAt: new Date().toISOString(),
  };

  const loc = parseLocation(rec.location);

  const candidate: ExtractedCandidateEvent = {
    title: rec.programTitle,
    summary: rec.summary,
    startDate: rec.recordedDate || rec.airDate,
    temporalPrecision: "exact-day",
    eventType: rec.format,
    venue: rec.venue || "Official Venue",
    city: loc.city,
    country: loc.country,
    latitude: loc.latitude,
    longitude: loc.longitude,
    participants: rec.speakers.map((s) => ({
      name: s,
      role: "principal" as const,
      presenceMode: "physical" as const,
    })),
    claims: rec.speakers.map((s) => ({
      subjectMention: s,
      claimType: "presence" as const,
      statement: `${s} was physically recorded present at ${rec.venue || loc.city} in ${loc.city}`,
      claimedTime: rec.recordedDate || rec.airDate,
      claimedVenue: rec.venue || loc.city,
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
