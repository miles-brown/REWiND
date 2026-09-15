import { getRelationalStore, getDb } from "@/lib/db/client";
import * as schema from "@/db/schema";
import { inArray, like } from "drizzle-orm";
import type { ExtractedCandidateEvent, DeduplicationMatch } from "./types";

// Generate deterministic fingerprint for strict matching
export function calculateEventFingerprint(
  participants: string[],
  startDate: string,
  city: string,
  eventType: string
): string {
  const sortedP = [...participants].sort().join(",");
  const dateDay = startDate.slice(0, 10);
  const normCity = city.toLowerCase().replace(/\s+/g, "");
  return `fp_${sortedP}_${dateDay}_${normCity}_${eventType}`;
}

// Calculate token similarity between two strings (Jaccard)
export function tokenSimilarity(strA: string, strB: string): number {
  const setA = new Set(strA.toLowerCase().split(/\W+/).filter(Boolean));
  const setB = new Set(strB.toLowerCase().split(/\W+/).filter(Boolean));

  if (setA.size === 0 || setB.size === 0) return 0;

  let intersection = 0;
  for (const token of setA) {
    if (setB.has(token)) intersection++;
  }

  const union = new Set([...setA, ...setB]).size;
  return intersection / union;
}

export function findDuplicateEvent(
  candidate: ExtractedCandidateEvent
): DeduplicationMatch {
  const store = getRelationalStore();
  const candidateDate = candidate.startDate.slice(0, 10);
  const candCity = candidate.city.toLowerCase().replace(/[^\w\s]/g, "").trim();

  let highestMatch: DeduplicationMatch = { isDuplicate: false, similarity: 0.0 };

  for (const existing of store.events) {
    const existingDate = existing.startDate.slice(0, 10);
    const existingPlace = store.places.find((p) => p.id === existing.placeId);
    const existingCity = existingPlace?.city.toLowerCase().replace(/[^\w\s]/g, "").trim() || "";

    // 1. Date match (required base prerequisite)
    if (existingDate !== candidateDate) continue;
    const dateScore = 0.30;

    // 2. City match
    let cityScore = 0.0;
    if (existingCity && candCity) {
      if (existingCity === candCity || existingCity.includes(candCity) || candCity.includes(existingCity)) {
        cityScore = 0.20;
      }
    } else {
      cityScore = 0.05; // Neutral when city is unspecified
    }

    // 3. Event Type match
    const typeScore = existing.eventType === candidate.eventType ? 0.15 : 0.0;

    // 4. Text / lexical similarity
    const titleSim = tokenSimilarity(candidate.title, existing.title);
    const summarySim = tokenSimilarity(candidate.summary, existing.summary || "");
    const textSim = Math.max(titleSim, summarySim);
    const textScore = textSim * 0.35;

    const combinedScore = dateScore + cityScore + typeScore + textScore;

    // Enforce minimum lexical text similarity (0.20) or near-identical title to prevent collapsing distinct same-day events
    const hasSufficientLexicalAgreement = textSim >= 0.20 || candidate.title.toLowerCase() === existing.title.toLowerCase();

    if (combinedScore >= 0.70 && hasSufficientLexicalAgreement) {
      if (combinedScore > highestMatch.similarity) {
        highestMatch = {
          isDuplicate: true,
          similarity: Math.min(1.0, combinedScore),
          matchedEventId: existing.id,
          matchedEventTitle: existing.title,
        };
      }
    }
  }

  return highestMatch;
}

type DatabaseClient =
  | NonNullable<ReturnType<typeof getDb>>
  | Parameters<Parameters<NonNullable<ReturnType<typeof getDb>>["transaction"]>[0]>[0];

/**
 * Deduplicates an extracted candidate event against live PostgreSQL database records.
 * Falls back to in-memory store when database is not connected.
 */
export async function findDuplicateEventAsync(
  candidate: ExtractedCandidateEvent,
  dbInstance?: DatabaseClient | null
): Promise<DeduplicationMatch> {
  const db = dbInstance !== undefined ? dbInstance : getDb();
  if (!db) {
    return findDuplicateEvent(candidate);
  }

  const candidateDate = candidate.startDate.slice(0, 10);
  const candCity = candidate.city.toLowerCase().replace(/[^\w\s]/g, "").trim();

  // Query events on candidate date from DB
  const matchingDateEvents = await db
    .select({
      id: schema.events.id,
      title: schema.events.title,
      summary: schema.events.summary,
      eventType: schema.events.eventType,
      startDate: schema.events.startDate,
      placeId: schema.events.placeId,
    })
    .from(schema.events)
    .where(like(schema.events.startDate, `${candidateDate}%`));

  if (matchingDateEvents.length === 0) {
    return { isDuplicate: false, similarity: 0.0 };
  }

  // Load places for matching events to check city alignment
  const placeIds = Array.from(new Set(matchingDateEvents.map((e) => e.placeId).filter(Boolean))) as string[];
  const places = placeIds.length > 0
    ? await db
        .select({ id: schema.places.id, city: schema.places.city })
        .from(schema.places)
        .where(inArray(schema.places.id, placeIds))
    : [];
  const placeMap = new Map(places.map((p) => [p.id, p.city]));

  let highestMatch: DeduplicationMatch = { isDuplicate: false, similarity: 0.0 };

  for (const existing of matchingDateEvents) {
    const existingDate = existing.startDate.slice(0, 10);
    const existingCity = (placeMap.get(existing.placeId || "") || "").toLowerCase().replace(/[^\w\s]/g, "").trim();

    if (existingDate !== candidateDate) continue;
    const dateScore = 0.30;

    let cityScore = 0.0;
    if (existingCity && candCity) {
      if (existingCity === candCity || existingCity.includes(candCity) || candCity.includes(existingCity)) {
        cityScore = 0.20;
      }
    } else {
      cityScore = 0.05;
    }

    const typeScore = existing.eventType === candidate.eventType ? 0.15 : 0.0;

    const titleSim = tokenSimilarity(candidate.title, existing.title);
    const summarySim = tokenSimilarity(candidate.summary, existing.summary || "");
    const textSim = Math.max(titleSim, summarySim);
    const textScore = textSim * 0.35;

    const combinedScore = dateScore + cityScore + typeScore + textScore;
    const hasSufficientLexicalAgreement = textSim >= 0.20 || candidate.title.toLowerCase() === existing.title.toLowerCase();

    if (combinedScore >= 0.70 && hasSufficientLexicalAgreement) {
      if (combinedScore > highestMatch.similarity) {
        highestMatch = {
          isDuplicate: true,
          similarity: Math.min(1.0, combinedScore),
          matchedEventId: existing.id,
          matchedEventTitle: existing.title,
        };
      }
    }
  }

  return highestMatch;
}
