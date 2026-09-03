import { getRelationalStore } from "@/lib/db/client";
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
function tokenSimilarity(strA: string, strB: string): number {
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

  for (const existing of store.events) {
    const existingDate = existing.startDate.slice(0, 10);
    const existingPlace = store.places.find((p) => p.id === existing.placeId);
    const existingCity = existingPlace?.city.toLowerCase().replace(/[^\w\s]/g, "").trim() || "";

    const cityMatches =
      !existingCity ||
      !candCity ||
      existingCity === candCity ||
      existingCity.includes(candCity) ||
      candCity.includes(existingCity);

    // Check same date and matching city
    if (existingDate === candidateDate && cityMatches) {
      // Calculate title / summary lexical similarity
      const titleSim = tokenSimilarity(candidate.title, existing.title);
      const summarySim = tokenSimilarity(candidate.summary, existing.summary);
      const textSim = Math.max(titleSim, summarySim);

      // Same event type
      const typeMatch = existing.eventType === candidate.eventType ? 0.3 : 0.0;
      const combinedScore = 0.4 + (textSim * 0.4) + typeMatch;

      if (combinedScore >= 0.65) {
        return {
          isDuplicate: true,
          similarity: Math.min(1.0, combinedScore),
          matchedEventId: existing.id,
          matchedEventTitle: existing.title,
        };
      }
    }
  }

  return {
    isDuplicate: false,
    similarity: 0.0,
  };
}
