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
  subjectMention: z.string().min(1),
  claimType: z.enum(["presence", "start-time", "statement-quote", "agreement", "action"]),
  statement: z.string().min(1),
  claimedTime: z.string().optional(),
  claimedVenue: z.string().optional(),
  supportingExcerpt: z.string().optional(),
});

function isValidCalendarDate(val: string): boolean {
  // Accepted formats: YYYY, YYYY-MM, YYYY-MM-DD, YYYY-MM-DDTHH:mm, YYYY-MM-DDTHH:mm:ss, YYYY-MM-DDTHH:mm:ssZ
  const match = val.match(/^(\d{4})(?:-(\d{2})(?:-(\d{2})(?:T(\d{2}):(\d{2})(?::(\d{2}))?Z?)?)?)?$/);
  if (!match) return false;

  const year = parseInt(match[1], 10);
  const month = match[2] ? parseInt(match[2], 10) : undefined;
  const day = match[3] ? parseInt(match[3], 10) : undefined;
  const hour = match[4] ? parseInt(match[4], 10) : undefined;
  const min = match[5] ? parseInt(match[5], 10) : undefined;
  const sec = match[6] ? parseInt(match[6], 10) : undefined;

  if (year < 1800 || year > 2100) return false;

  if (month !== undefined) {
    if (month < 1 || month > 12) return false;
  }

  if (day !== undefined && month !== undefined) {
    if (day < 1 || day > 31) return false;
    // Check days in month
    const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
    if (day > daysInMonth) return false;
  }

  if (hour !== undefined) {
    if (hour < 0 || hour > 23) return false;
    if (min === undefined || min < 0 || min > 59) return false;
    if (sec !== undefined && (sec < 0 || sec > 59)) return false;
  }

  return true;
}

const DateStringValidator = z.string().refine(isValidCalendarDate, {
  message: "Date must be a valid ISO-8601 calendar date (e.g. YYYY, YYYY-MM, YYYY-MM-DD, or ISO timestamp)",
});

export const ExtractedCandidateEventSchema = z
  .object({
    title: z.string().min(5),
    summary: z.string().min(10),
    description: z.string().optional(),
    startDate: DateStringValidator,
    endDate: DateStringValidator.optional(),
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
        name: z.string().min(1),
        role: z.enum(["principal", "co-principal", "secondary", "attendee"]).default("principal"),
        presenceMode: z.enum(["physical", "remote-live", "remote-recorded", "telephone", "written"]).default("physical"),
      })
    ),
    claims: z.array(ExtractedClaimSchema).default([]),
    quotes: z.array(
      z.object({
        speaker: z.string().min(1),
        quote: z.string().min(1),
        context: z.string().optional(),
      })
    ).default([]),
    hasSensitiveLegalMatters: z.boolean().default(false),
    involvesLivingPersonPrivateMovement: z.boolean().default(false),
    involvesMinors: z.boolean().default(false),
  })
  .refine(
    (data) => {
      if (!data.endDate) return true;
      return data.startDate <= data.endDate;
    },
    {
      message: "endDate must not precede startDate",
      path: ["endDate"],
    }
  );

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
