import { z } from "zod";

export const RawEvidenceItemSchema = z.object({
  sourceId: z.string(),
  sourceTitle: z.string(),
  publisher: z.string(),
  sourceType: z.enum([
    "official-transcript",
    "government-record",
    "broadcast-video",
    "wire-report",
    "press-release",
    "discovery-aggregator",
  ]),
  sourceTier: z.enum(["tier-a", "tier-b", "tier-c", "tier-d"]),
  url: z.string().url().optional(),
  rawText: z.string().min(10),
  fetchedAt: z.string().optional(),
});

export type RawEvidenceItem = z.infer<typeof RawEvidenceItemSchema>;

export const ExtractedClaimSchema = z.object({
  subjectMention: z.string(),
  claimType: z.enum(["presence", "start-time", "statement-quote", "agreement", "action"]),
  statement: z.string(),
  claimedTime: z.string().optional(),
  claimedVenue: z.string().optional(),
  supportingExcerpt: z.string().optional(),
});

export const ExtractedCandidateEventSchema = z.object({
  title: z.string().min(5),
  summary: z.string().min(10),
  description: z.string().optional(),
  startDate: z.string().regex(/^\d{4}(-\d{2}(-\d{2}(T\d{2}:\d{2}(:\d{2})?Z?)?)?)?$/),
  endDate: z.string().optional(),
  temporalPrecision: z.enum(["exact-minute", "exact-day", "month", "year", "decade"]).default("exact-day"),
  eventType: z.enum([
    "bilateral-meeting",
    "multilateral-summit",
    "speech-plenary",
    "press-conference",
    "interview",
    "official-visit",
    "signing-ceremony",
    "parliamentary-debate",
    "historical-action",
  ]),
  venue: z.string(),
  city: z.string(),
  country: z.string(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  participants: z.array(
    z.object({
      name: z.string(),
      role: z.enum(["principal", "co-principal", "secondary", "attendee"]).default("principal"),
      presenceMode: z.enum(["physical", "remote-live", "remote-recorded", "telephone", "written"]).default("physical"),
    })
  ),
  claims: z.array(ExtractedClaimSchema).default([]),
  quotes: z.array(
    z.object({
      speaker: z.string(),
      quote: z.string(),
      context: z.string().optional(),
    })
  ).default([]),
  hasSensitiveLegalMatters: z.boolean().default(false),
  involvesLivingPersonPrivateMovement: z.boolean().default(false),
  involvesMinors: z.boolean().default(false),
});

export type ExtractedCandidateEvent = z.infer<typeof ExtractedCandidateEventSchema>;

export interface DeduplicationMatch {
  isDuplicate: boolean;
  similarity: number;
  matchedEventId?: string;
  matchedEventTitle?: string;
}

export interface PolicyEvaluationResult {
  lane: "auto-publish" | "provisional" | "human-review";
  ruleId: string;
  reason: string;
  isEligible: boolean;
}

export interface IngestionResult {
  candidateId: string;
  fingerprint: string;
  lane: "auto-publish" | "provisional" | "human-review";
  publishedEventId?: string;
  deduplication: DeduplicationMatch;
  policy: PolicyEvaluationResult;
  auditId: number;
}
