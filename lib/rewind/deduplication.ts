/**
 * REWIND EVIDENCE ATLAS — INTELLIGENT DEDUPLICATION & STUB RESOLUTION ENGINE
 *
 * Implements multi-signal forensic verification to determine whether an incoming
 * historical event or person appearance is an exact duplicate, an existing stub
 * requiring enrichment, a distinct same-day event, or a new record, without
 * assuming either way.
 */

import type { EventRecord } from "./types";

export type DeduplicationClassification =
  | "exact-duplicate"
  | "potential-stub-enrichment"
  | "distinct-same-day"
  | "new-independent-record";

export interface VerificationSignal {
  category: "temporal" | "geographic" | "lexical" | "participant" | "stub-quality";
  label: string;
  score: number; // 0.0 to 1.0
  passed: boolean;
  rationale: string;
}

export interface CandidateEventInput {
  personSlug?: string;
  startDate: string; // ISO-8601 YYYY-MM-DD or full timestamp
  title: string;
  summary?: string;
  venueName?: string;
  city: string;
  country: string;
  eventType?: string;
  timeOfDay?: "morning" | "afternoon" | "evening" | "night" | "all-day";
  sourceIds?: string[];
  participants?: Array<{
    personId: string;
    name: string;
    role?: string;
    association?: string;
  }>;
}

export interface StubAnalysisResult {
  isStub: boolean;
  completenessScore: number; // 0.0 to 1.0
  missingFields: string[];
}

export interface VerificationAssessment {
  classification: DeduplicationClassification;
  confidenceScore: number; // 0.0 to 1.0
  matchedEventId?: string;
  matchedEventSlug?: string;
  matchedEventTitle?: string;
  signals: VerificationSignal[];
  recommendation: string;
  stubAnalysis?: StubAnalysisResult;
}

/**
 * Token similarity using Jaccard coefficient over alphanumeric word tokens.
 */
export function calculateTokenSimilarity(strA: string, strB: string): number {
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

/**
 * Evaluates whether an existing event record is a "stub" (placeholder or sparse entry).
 */
export function evaluateEventStubCompleteness(event: EventRecord): StubAnalysisResult {
  const missingFields: string[] = [];
  let score = 0;

  // 1. Summary quality
  if (event.summary && event.summary.trim().length >= 80) {
    score += 0.25;
  } else if (event.summary && event.summary.trim().length > 20) {
    score += 0.15;
  } else {
    missingFields.push("detailed-summary");
  }

  // 2. Venue / place precision
  if (event.venueName && event.venueName.trim().length > 0 && event.venueName.toLowerCase() !== "unknown") {
    score += 0.25;
  } else {
    missingFields.push("specific-venue");
  }

  // 3. Primary sources attached
  if (event.sourceIds && event.sourceIds.length > 0) {
    score += 0.25;
  } else {
    missingFields.push("primary-sources");
  }

  // 4. Participants roster completeness
  if (event.participants && event.participants.length >= 2) {
    score += 0.25;
  } else if (event.participants && event.participants.length === 1) {
    score += 0.15;
  } else {
    missingFields.push("participant-roster");
  }

  return {
    isStub: score < 0.50,
    completenessScore: score,
    missingFields,
  };
}

/**
 * Intelligently evaluates an incoming candidate event against existing records,
 * returning a 4-tier explainable assessment without assuming duplicate or non-duplicate.
 */
export function evaluateCandidateDuplicateOrStub(
  candidate: CandidateEventInput,
  existingEvents: EventRecord[]
): VerificationAssessment {
  const candidateDay = candidate.startDate.slice(0, 10);
  const candCityNorm = candidate.city.toLowerCase().replace(/[^\w\s]/g, "").trim();

  // Find all existing records on the exact same calendar date
  const sameDayEvents = existingEvents.filter(
    (e) => e.startDate.slice(0, 10) === candidateDay
  );

  if (sameDayEvents.length === 0) {
    return {
      classification: "new-independent-record",
      confidenceScore: 0.95,
      signals: [
        {
          category: "temporal",
          label: "Zero Date Collisions",
          score: 1.0,
          passed: true,
          rationale: `No existing records found on ${candidateDay}. Safe for independent insertion.`,
        },
      ],
      recommendation: "Proceed with clean record creation. No duplicate or stub collision detected.",
    };
  }

  let topAssessment: VerificationAssessment | null = null;
  let highestMatchScore = -1;

  for (const existing of sameDayEvents) {
    const signals: VerificationSignal[] = [];

    // 1. Geographic match
    const existingCityNorm = (existing.city || "").toLowerCase().replace(/[^\w\s]/g, "").trim();
    const cityMatches =
      Boolean(existingCityNorm && candCityNorm) &&
      (existingCityNorm === candCityNorm ||
        existingCityNorm.includes(candCityNorm) ||
        candCityNorm.includes(existingCityNorm));

    signals.push({
      category: "geographic",
      label: "City / Theatre Alignment",
      score: cityMatches ? 0.25 : 0.05,
      passed: cityMatches,
      rationale: cityMatches
        ? `Both events share the same theatre (${existing.city}).`
        : `Events occur in different municipalities (${existing.city} vs ${candidate.city}).`,
    });

    // 2. Lexical & Subject Overlap
    const existingTitle = existing.eventName || (existing as { title?: string }).title || "";
    const titleSim = calculateTokenSimilarity(candidate.title, existingTitle);
    const summarySim = calculateTokenSimilarity(candidate.summary || "", existing.summary || "");
    const textSim = Math.max(titleSim, summarySim);

    signals.push({
      category: "lexical",
      label: "Title & Subject Semantic Overlap",
      score: textSim * 0.35,
      passed: textSim >= 0.40,
      rationale: `Token similarity is ${(textSim * 100).toFixed(1)}% between titles and narrative summaries.`,
    });

    // 3. Stub Analysis of Existing Record
    const stubResult = evaluateEventStubCompleteness(existing);
    signals.push({
      category: "stub-quality",
      label: "Existing Record Stub Quality",
      score: 1.0 - stubResult.completenessScore,
      passed: stubResult.isStub,
      rationale: stubResult.isStub
        ? `Existing record '${existing.eventName}' is a sparse stub (${(stubResult.completenessScore * 100).toFixed(0)}% complete; missing ${stubResult.missingFields.join(", ")}).`
        : `Existing record is fully articulated (${(stubResult.completenessScore * 100).toFixed(0)}% complete).`,
    });

    // 4. Participant Overlap & Capacity
    const existingPIds = new Set((existing.participants || []).map((p) => p.personId || p.slug).filter(Boolean));
    const candidatePIds = (candidate.participants || []).map((p) => p.personId).filter(Boolean);

    let participantOverlap = false;
    if (candidate.personSlug && existingPIds.has(candidate.personSlug)) {
      participantOverlap = true;
    } else if (candidatePIds.some((pId) => existingPIds.has(pId))) {
      participantOverlap = true;
    }

    signals.push({
      category: "participant",
      label: "Participant Roster Overlap",
      score: participantOverlap ? 0.25 : 0.05,
      passed: participantOverlap,
      rationale: participantOverlap
        ? "Target figure is documented on both records."
        : "Participant rosters appear distinct on this date.",
    });

    // 5. Temporal Session / Time of Day Disambiguation
    const existingTime = existing.startDate.includes("T") ? existing.startDate.slice(11, 16) : null;
    const candidateTime = candidate.startDate.includes("T") ? candidate.startDate.slice(11, 16) : null;
    const hasDifferentTimes = Boolean(existingTime && candidateTime && existingTime !== candidateTime);

    // Compute Composite Assessment
    const totalScore = signals.reduce((acc, s) => acc + s.score, 0);

    let classification: DeduplicationClassification;
    let recommendation: string;

    if (cityMatches && participantOverlap && textSim >= 0.65 && !hasDifferentTimes) {
      classification = "exact-duplicate";
      recommendation = `Record appears to duplicate existing event '${existing.eventName}'. Do not create a new event; corroborate claims and append sources to the existing record.`;
    } else if (cityMatches && participantOverlap && stubResult.isStub && textSim >= 0.20) {
      classification = "potential-stub-enrichment";
      recommendation = `Existing event '${existing.eventName}' is an incomplete stub. Recommend enriching this stub with the candidate's verified sources and details rather than creating a duplicate.`;
    } else if (participantOverlap && (hasDifferentTimes || textSim < 0.25 || !cityMatches)) {
      classification = "distinct-same-day";
      recommendation = `Target figure has an existing event on ${candidateDay}, but evidence indicates a distinct appearance (different session, agenda, or location). Proceed with creation using collision-safe suffix.`;
    } else {
      classification = "distinct-same-day";
      recommendation = `Disjoint agendas detected on ${candidateDay}. Proceed as independent milestone.`;
    }

    const assessment: VerificationAssessment = {
      classification,
      confidenceScore: Math.min(1.0, totalScore),
      matchedEventId: existing.id,
      matchedEventSlug: existing.slug,
      matchedEventTitle: existing.eventName || (existing as { title?: string }).title,
      signals,
      recommendation,
      stubAnalysis: stubResult,
    };

    if (totalScore > highestMatchScore) {
      highestMatchScore = totalScore;
      topAssessment = assessment;
    }
  }

  return (
    topAssessment || {
      classification: "new-independent-record",
      confidenceScore: 0.90,
      signals: [],
      recommendation: "Clean insertion.",
    }
  );
}
