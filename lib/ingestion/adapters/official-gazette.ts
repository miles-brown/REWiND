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
  text: string; // Verbatim legal decree or state announcement
  url?: string;
}

function resolveGazetteLocation(country: string, cityOverride?: string, venueOverride?: string) {
  const normCountry = (country || "").toLowerCase();

  if (normCountry.includes("spain") || normCountry.includes("españa")) {
    return {
      venue: venueOverride || "Palacio de las Cortes",
      city: cityOverride || "Madrid",
      country: "Spain",
      latitude: 40.4165,
      longitude: -3.6967,
    };
  }

  if (normCountry.includes("belgium") || normCountry.includes("belgique")) {
    return {
      venue: venueOverride || "Palais de la Nation (Federal Parliament)",
      city: cityOverride || "Brussels",
      country: "Belgium",
      latitude: 50.8466,
      longitude: 4.3644,
    };
  }

  if (normCountry.includes("france")) {
    return {
      venue: venueOverride || "Palais Bourbon",
      city: cityOverride || "Paris",
      country: "France",
      latitude: 48.8619,
      longitude: 2.3186,
    };
  }

  // Default to London, United Kingdom
  return {
    venue: venueOverride || "Palace of Westminster",
    city: cityOverride || "London",
    country: "United Kingdom",
    latitude: 51.4995,
    longitude: -0.1248,
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
    url: rec.url || "https://boe.es",
    rawText: rec.text,
    fetchedAt: new Date().toISOString(),
  };

  const loc = resolveGazetteLocation(rec.country, rec.city, rec.venue);

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
        presenceMode: "physical",
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
    quotes: [
      {
        speaker: rec.signatory,
        quote: rec.text.slice(0, 200),
        context: `${rec.gazetteName} (${rec.publicationDate})`,
      },
    ],
    hasSensitiveLegalMatters: false,
    involvesLivingPersonPrivateMovement: false,
    involvesMinors: false,
  };

  return processCandidateEvent(candidate, rawItem);
}
