import type { RawEvidenceItem, ExtractedCandidateEvent } from "../types";
import { processCandidateEvent } from "../pipeline";

export interface OfficialGazetteRecord {
  gazetteId: string; // e.g. "boe-20140619-01" or "moniteur-20130721"
  gazetteName: string; // "Boletín Oficial del Estado (BOE)" | "Moniteur Belge" | "The London Gazette" | "Journal Officiel"
  country: string; // "Spain" | "Belgium" | "United Kingdom" | "France"
  publicationDate: string; // "2014-06-19"
  documentTitle: string; // "Proclamación de Su Majestad el Rey Felipe VI ante las Cortes Generales"
  signatory: string; // "King Felipe VI"
  signatoryRole?: string; // "King of Spain"
  city?: string;
  venue?: string;
  latitude?: number;
  longitude?: number;
  text: string; // Verbatim legal decree or state announcement
  explicitQuote?: string; // Optional verbatim spoken quotation explicitly attributed to signatory
  url?: string;
}

function resolveGazetteLocation(
  country: string,
  cityOverride?: string,
  venueOverride?: string,
  latitudeOverride?: number,
  longitudeOverride?: number
) {
  // If venue or city are explicitly provided, preserve them without fabricating parliament/city/coordinates from country alone
  return {
    venue: venueOverride || "Official State Gazette",
    city: cityOverride || "National Jurisdiction",
    country: country || "International",
    latitude: latitudeOverride,
    longitude: longitudeOverride,
  };
}

/**
 * Ingests official legal gazettes and sovereign proclamations (Spain BOE, Moniteur Belge, London Gazette).
 */
export function ingestOfficialGazette(rec: OfficialGazetteRecord) {
  const cleanId = rec.gazetteId.replace(/[^a-zA-Z0-9_-]/g, "");

  const rawItem: RawEvidenceItem = {
    sourceId: `src-gazette-${cleanId}`,
    sourceTitle: `${rec.gazetteName}: ${rec.documentTitle} (${rec.publicationDate})`,
    publisher: rec.gazetteName,
    sourceType: "official-transcript",
    sourceTier: "tier-a",
    url: rec.url || undefined,
    rawText: rec.text,
    fetchedAt: new Date().toISOString(),
  };

  const loc = resolveGazetteLocation(rec.country, rec.city, rec.venue, rec.latitude, rec.longitude);

  const candidate: ExtractedCandidateEvent = {
    title: `${rec.gazetteName}: ${rec.documentTitle}`,
    summary: `${rec.signatory}${rec.signatoryRole ? ` (${rec.signatoryRole})` : ""} officially published: ${rec.documentTitle}.`,
    description: `Official state gazette publication recorded in ${rec.gazetteName} on ${rec.publicationDate}.`,
    startDate: rec.publicationDate,
    temporalPrecision: "exact-day",
    eventType: "historical-action",
    venue: loc.venue,
    city: loc.city,
    country: loc.country,
    latitude: loc.latitude,
    longitude: loc.longitude,
    participants: [
      {
        name: rec.signatory,
        role: "principal",
        presenceMode: "written",
      },
    ],
    claims: [
      {
        subjectMention: rec.signatory,
        claimType: "action",
        statement: `${rec.signatory} ratified and published state act "${rec.documentTitle}" in ${rec.gazetteName}.`,
        claimedTime: rec.publicationDate,
        claimedVenue: loc.venue,
        supportingExcerpt: rec.text.slice(0, 300),
      },
    ],
    quotes: rec.explicitQuote
      ? [
          {
            speaker: rec.signatory,
            quote: rec.explicitQuote,
            context: `${rec.gazetteName} (${rec.publicationDate})`,
          },
        ]
      : [],
    hasSensitiveLegalMatters: false,
    involvesLivingPersonPrivateMovement: false,
    involvesMinors: false,
  };

  return processCandidateEvent(candidate, rawItem);
}
