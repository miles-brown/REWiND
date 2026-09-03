import type { ExtractedCandidateEvent, PolicyEvaluationResult } from "./types";
import type { EntityResolution } from "./resolve";

export function evaluatePublicationPolicy(
  candidate: ExtractedCandidateEvent,
  sourceTier: "tier-a" | "tier-b" | "tier-c" | "tier-d",
  entityResolutions: EntityResolution[]
): PolicyEvaluationResult {
  // 1. Mandatory Human Review Edge Cases
  if (candidate.hasSensitiveLegalMatters) {
    return {
      lane: "human-review",
      ruleId: "REW-POL-SENSITIVE-LEGAL",
      reason: "Involves sensitive legal or criminal matters requiring human editorial sign-off.",
      isEligible: false,
    };
  }

  if (candidate.involvesMinors) {
    return {
      lane: "human-review",
      ruleId: "REW-POL-MINOR-PROTECTION",
      reason: "Involves minors; autonomous publication is strictly prohibited under child protection policy.",
      isEligible: false,
    };
  }

  if (candidate.involvesLivingPersonPrivateMovement) {
    return {
      lane: "human-review",
      ruleId: "REW-POL-LIVING-EMBARGO",
      reason: "Involves private location information of a living figure; held under 48-hour embargo policy.",
      isEligible: false,
    };
  }

  // 2. Unresolved or Low-Confidence Entities
  const hasUnresolvedEntity = entityResolutions.some((e) => !e.personId || e.confidence < 0.95);
  if (hasUnresolvedEntity) {
    return {
      lane: "human-review",
      ruleId: "REW-POL-UNRESOLVED-ENTITY",
      reason: "One or more participants could not be resolved to an approved REWIND Subject with high confidence.",
      isEligible: false,
    };
  }

  // 3. Discovery Tier (Tier D)
  if (sourceTier === "tier-d") {
    return {
      lane: "human-review",
      ruleId: "REW-POL-TIER-D-DISCOVERY",
      reason: "Discovery tier sources cannot verify an event alone; held for primary evidence discovery.",
      isEligible: false,
    };
  }

  // 4. Primary Evidence (Tier A or B) -> Auto-Publish
  if (sourceTier === "tier-a" || sourceTier === "tier-b") {
    return {
      lane: "auto-publish",
      ruleId: "REW-PUB-TIER-A-PRIMARY",
      reason: "Backed by verified primary government or institutional record; all entities and timestamps resolved.",
      isEligible: true,
    };
  }

  // 5. Contemporary Secondary Evidence (Tier C) -> Provisional
  if (sourceTier === "tier-c") {
    return {
      lane: "provisional",
      ruleId: "REW-PUB-TIER-C-PROVISIONAL",
      reason: "Backed by contemporary secondary wire reporting; published provisionally pending archival transcript.",
      isEligible: true,
    };
  }

  return {
    lane: "human-review",
    ruleId: "REW-POL-DEFAULT-HOLD",
    reason: "Held in review queue for standard verification.",
    isEligible: false,
  };
}
