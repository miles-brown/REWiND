/**
 * REWIND EVIDENCE ATLAS — SOURCE TRUST SCORE RECALCULATOR (Task 26)
 *
 * Computes dynamic epistemic trust scores for all registered primary and secondary sources:
 * 1. Base tier baseline:
 *    - tier-a (Official Transcripts & State Gazettes): 0.98
 *    - tier-b (Institutional & Diplomatic Archives): 0.88
 *    - tier-c (Verified News & Wire Reporting): 0.72
 *    - tier-d (Discovery & Provisional Accounts): 0.50
 * 2. Corroboration multiplier:
 *    - Computes co-occurrence alongside Tier A records across verified historical events.
 * 3. Contestation penalty:
 *    - Deducts penalty for claims flagged as disputed or contradicted.
 */

import path from "node:path";
import { fileURLToPath } from "node:url";
import { sourcesCorpus } from "../data/seeds/sources-corpus";
import { eventsCorpus } from "../data/seeds/events-corpus";

export interface SourceTrustCalculation {
  sourceId: string;
  sourceTitle: string;
  tier: string;
  baseScore: number;
  corroborationCount: number;
  contestedCount: number;
  computedTrustScore: number;
  epistemicCategory: "authoritative" | "verified-institutional" | "corroborated-secondary" | "provisional";
}

export function calculateSourceTrustScores(): SourceTrustCalculation[] {
  const allSources = sourcesCorpus || [];
  const allEvents = eventsCorpus || [];

  const sourceMap = new Map<string, (typeof allSources)[0]>();
  allSources.forEach((s) => {
    if (s.id && !sourceMap.has(s.id)) {
      sourceMap.set(s.id, s);
    }
  });

  // Track event co-occurrences with Tier-A sources
  const tierASourceIds = new Set(
    allSources
      .filter((s) => {
        const tier = (s as { tier?: string; sourceTier?: string }).tier || (s as { sourceTier?: string }).sourceTier;
        return tier === "tier-a" || tier === "tier-1" || s.sourceType === "official-transcript";
      })
      .map((s) => s.id)
  );

  const corroborationsPerSource = new Map<string, number>();
  const contestedPerSource = new Map<string, number>();

  allEvents.forEach((evt) => {
    const sIds = evt.sourceIds || [];
    const hasTierA = sIds.some((id) => tierASourceIds.has(id));

    sIds.forEach((id) => {
      if (hasTierA && !tierASourceIds.has(id)) {
        corroborationsPerSource.set(id, (corroborationsPerSource.get(id) || 0) + 1);
      }
    });

    // Check for contested claims
    const eventClaims = (evt as { claims?: Array<{ claimStatus?: string; contradictsClaimId?: string; sourceId?: string }> }).claims || [];
    eventClaims.forEach((c) => {
      if (c.claimStatus === "DISPUTED" || c.claimStatus === "CONTRADICTED" || c.contradictsClaimId) {
        if (c.sourceId) {
          contestedPerSource.set(c.sourceId, (contestedPerSource.get(c.sourceId) || 0) + 1);
        }
      }
    });
  });

  const calculations: SourceTrustCalculation[] = [];

  sourceMap.forEach((src) => {
    const tier = (src as { tier?: string; sourceTier?: string }).tier || (src as { sourceTier?: string }).sourceTier || "tier-c";
    let baseScore = 0.72;
    if (tier === "tier-a" || tier === "tier-1" || src.sourceType === "official-transcript") {
      baseScore = 0.98;
    } else if (tier === "tier-b" || tier === "tier-2") {
      baseScore = 0.88;
    } else if (tier === "tier-c" || tier === "tier-3") {
      baseScore = 0.72;
    } else if (tier === "tier-d" || tier === "tier-4") {
      baseScore = 0.50;
    }

    const corroborationCount = corroborationsPerSource.get(src.id) || 0;
    const contestedCount = contestedPerSource.get(src.id) || 0;

    // Apply corroboration bonus up to +0.10
    const corroborationBonus = Math.min(corroborationCount * 0.02, 0.10);
    // Apply contestation penalty up to -0.25
    const contestationPenalty = Math.min(contestedCount * 0.08, 0.25);

    let computedTrustScore = Math.max(0.1, Math.min(1.0, baseScore + corroborationBonus - contestationPenalty));
    computedTrustScore = Math.round(computedTrustScore * 100) / 100;

    let epistemicCategory: SourceTrustCalculation["epistemicCategory"] = "provisional";
    if (computedTrustScore >= 0.95) epistemicCategory = "authoritative";
    else if (computedTrustScore >= 0.85) epistemicCategory = "verified-institutional";
    else if (computedTrustScore >= 0.70) epistemicCategory = "corroborated-secondary";

    calculations.push({
      sourceId: src.id,
      sourceTitle: src.title,
      tier,
      baseScore,
      corroborationCount,
      contestedCount,
      computedTrustScore,
      epistemicCategory,
    });
  });

  calculations.sort((a, b) => b.computedTrustScore - a.computedTrustScore);
  return calculations;
}

// Run if directly executed
if (
  typeof process !== "undefined" &&
  process.argv[1] &&
  fileURLToPath(import.meta.url) === path.resolve(process.argv[1])
) {
  console.log("================================================================================");
  console.log("REWIND EVIDENCE ATLAS — Automated Source Trust Score Recalculator");
  console.log("================================================================================");

  const results = calculateSourceTrustScores();
  console.log(`Evaluated ${results.length} registered sources.\n`);

  const top10 = results.slice(0, 10);
  console.log("Top 10 High-Trust Authoritative Sources:");
  top10.forEach((r, idx) => {
    console.log(
      `${idx + 1}. [Score: ${r.computedTrustScore.toFixed(2)}] [${r.epistemicCategory}] ${r.sourceTitle.slice(0, 60)}`
    );
  });

  const categoryBreakdown = results.reduce<Record<string, number>>((acc, r) => {
    acc[r.epistemicCategory] = (acc[r.epistemicCategory] || 0) + 1;
    return acc;
  }, {});

  console.log("\nEpistemic Category Distribution:");
  Object.entries(categoryBreakdown).forEach(([cat, count]) => {
    console.log(`- ${cat}: ${count} sources`);
  });
  console.log("================================================================================");
  console.log("✅ Source trust recalculation complete.");
}
