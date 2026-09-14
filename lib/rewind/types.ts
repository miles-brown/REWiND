export type Precision = "exact" | "exact-day" | "exact-minute" | "day" | "month" | "year" | "decade" | "range" | "unknown";
export type Verification = "verified" | "provisional" | "disputed";
export type Confidence = "confirmed" | "strong" | "moderate" | "limited";
export type LocationPrecision = "venue" | "city" | "country" | "unknown";
export type EventScope = "public" | "press" | "diplomatic" | "government" | "electoral" | "religious" | "media";

export type ClaimStatus =
  | "ESTABLISHED"
  | "STRONGLY SUPPORTED"
  | "SUPPORTED"
  | "PROVISIONAL"
  | "UNVERIFIED"
  | "DISPUTED"
  | "CONTRADICTED"
  | "DEMONSTRABLY FALSE"
  | "UNKNOWN";

export type EpistemicClass =
  | "observed fact"
  | "documented fact"
  | "derived/computed fact"
  | "attributed assertion"
  | "expert interpretation"
  | "editorial inference"
  | "opinion"
  | "allegation"
  | "disputed proposition"
  | "unknown";

export interface Participant {
  personId: string;
  slug?: string;
  name: string;
  role?: string;
  presenceConfidence?: string;
  roleConfidence?: string;
  capacityTitle?: string;
  attendanceMode?: string;
  latitude?: number | null;
  longitude?: number | null;
  coordinatePrecision?: string;
}

export interface ClaimEvidenceRecord {
  id: string;
  claimId: string;
  sourceId: string;
  sourceTitle?: string;
  sourcePublisher?: string;
  sourceUrl?: string;
  evidenceForm: string;
  evidenceStrength: string;
  directness: "direct" | "inferential";
  citationLocator?: string;
  supportingExcerpt?: string;
  contradictsClaim: boolean;
}

export interface ClaimRecord {
  id: string;
  eventId?: string;
  subjectEntityType?: string;
  subjectEntityId?: string;
  claimType: string;
  statement: string;
  claimedTime?: string;
  claimedVenue?: string;
  sourceId?: string;
  confidence: string;
  claimStatus: ClaimStatus;
  epistemicClass: EpistemicClass;
  legalStatus?: string;
  isAttributedOnly: boolean;
  attributionSpeakerId?: string;
  supportingExcerpt?: string;
  evidence?: ClaimEvidenceRecord[];
}

export interface EventRecord {
  id: string;
  slug: string;
  eventName: string;
  /**
   * Machine-readable ISO-8601 formatted start date/timestamp string (e.g. 'YYYY-MM-DD', 'YYYY-MM-DDTHH:mm:ssZ', 'YYYY-MM', 'YYYY').
   * Guarantees unambiguous chronological sorting and machine readability across the platform.
   */
  startDate: string;
  /**
   * Machine-readable ISO-8601 formatted end date/timestamp string (optional).
   */
  endDate?: string | null;
  /**
   * Temporal resolution of the event start date (e.g. 'exact', 'day', 'month', 'year', 'exact-day').
   * Normalized with a sensible default ('exact-day') by the data mapping layer.
   */
  datePrecision?: Precision;
  timePrecision?: Precision;
  localStartTime?: string | null;
  localEndTime?: string | null;
  utcStartTime?: string | null;
  utcEndTime?: string | null;
  dayOfWeek?: string | null;
  timezone?: string | null;
  timezoneId?: string | null;
  utcOffsetSeconds?: number | null;
  timezoneAbbreviation?: string | null;
  dstObserved?: boolean | null;
  timezoneConfidence?: string | null;
  timeConversionMethod?: string | null;
  timeStandard?: string | null;
  durationSeconds?: number | null;
  durationPrecision?: string | null;
  durationBasis?: string | null;
  holidayApplicable?: boolean | null;
  holidayName?: string | null;
  holidayType?: string | null;
  holidayJurisdiction?: string | null;
  locationPrecision?: LocationPrecision;
  city: string;
  region?: string | null;
  country: string;
  venueName?: string | null;
  address?: string | null;
  platform?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  summary: string;
  description?: string | null;
  verificationStatus: Verification;
  confidenceScore?: number;
  /**
   * Evaluated confidence tier for this event record.
   * Normalized by the data layer to 'confirmed', 'strong', 'moderate', or 'limited'.
   */
  confidence?: Confidence | null;
  scope?: EventScope;
  organisations?: string[];
  sourceIds: string[];
  participants: Participant[];
  /**
   * @deprecated Legacy categorization tags retained strictly for backward compatibility with historical registers.
   * Primary application features, search filters, and UI badges should consume canonical `eventTypes`.
   */
  categories?: string[] | undefined;
  /**
   * Canonical event taxonomy tags (e.g. 'diplomatic', 'press-conference', 'investigation').
   * Populated as the primary taxonomy by the data mapping layer.
   */
  eventTypes?: string[] | undefined;
  medium?: string[] | undefined;
  notes?: string | null;
  provenance?: string[] | undefined;
  reviewedAt?: string;
  sources?: SourceRecord[] | undefined;
  media?: { kind: string; label: string; url: string }[] | undefined;
  conflictingClaims?: string[] | undefined;
  claims?: ClaimRecord[] | undefined;
  quotes?: {
    text: string;
    speaker: string;
    language: string;
    timestamp?: string | null;
  }[] | undefined;
}

export interface PersonEducation {
  id: string;
  personId: string;
  institution: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  qualification?: string;
  subject?: string;
  degree?: string;
  honours?: string;
  completedStatus: "completed" | "not completed" | "honorary" | "in progress";
  sourceId?: string;
}

export interface PersonCareer {
  id: string;
  personId: string;
  organisationName: string;
  positionTitle: string;
  occupationCategory?: string;
  startDate?: string;
  endDate?: string;
  location?: string;
  appointmentMethod?: string;
  predecessor?: string;
  successor?: string;
  notes?: string;
  sourceId?: string;
}

export interface PersonAward {
  id: string;
  personId: string;
  awardName: string;
  awardingBody: string;
  category?: string;
  awardYear?: number;
  result: "winner" | "honouree" | "nominee" | "finalist";
  citationReason?: string;
  sourceId?: string;
}

export interface PersonWork {
  id: string;
  personId: string;
  workTitle: string;
  workType: string;
  releaseDate?: string;
  publisherOrVenue?: string;
  significanceNote?: string;
  sourceId?: string;
}

export interface PersonRecord {
  id: string;
  slug: string;
  name: string;
  canonicalName: string;
  displayName: string;
  description: string;
  fullBirthName?: string;
  birth?: string;
  death?: string;
  nationality?: string;
  citizenship?: string[];
  nationalIdentity?: string;
  ethnicity?: string;
  ancestry?: string;
  religion?: string;
  religiousDenomination?: string;
  religionStatus?: string;
  languages?: string[];
  classification: string;
  notabilityBasis?: string;
  inclusionBasis?: string[];
  inclusionRationale?: string;
  culturalImpactSummary?: string;
  achievements?: { milestone: string; year?: number; evidence?: string }[];
  avatarUrl?: string;
  eventCount?: number;
  education?: PersonEducation[];
  career?: PersonCareer[];
  awards?: PersonAward[];
  works?: PersonWork[];
}

export interface PlaceRecord {
  id: string;
  slug: string;
  venue: string;
  city: string;
  country: string;
  latitude?: number | null;
  longitude?: number | null;
  placeType: string;
  eventCount?: number;
}

export interface SourceRecord {
  id: string;
  title: string;
  publisher: string;
  url?: string;
  archiveUrl?: string;
  author?: string;
  sourceType: string;
  classification: "primary" | "secondary";
  sourceLevel?: "primary" | "near-primary" | "secondary" | "tertiary" | "discovery-only";
  tier?: string;
  publicationDate?: string;
  accessedDate?: string;
  language?: string;
  trustScore?: number;
  independenceStatus?: "independent" | "partially independent" | "syndicated" | "derived from another source" | "same organisation" | "official self-report" | "unknown";
  derivedFromSourceId?: string;
  sourceQuality?: string;
}

export interface QuoteRecord {
  id: string;
  eventId: string;
  eventSlug?: string;
  speakerId: string;
  speakerName?: string;
  quote: string;
  context?: string;
  language?: string;
  sourceId?: string;
  timestampInMedia?: string;
  eventTitle?: string;
  eventDate?: string;
}

export interface PaginatedResult<T> {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
  error: string | null;
}

export interface EventFilters {
  page?: number;
  limit?: number;
  search?: string;
  year?: string;
  personSlug?: string;
  placeSlug?: string;
  verification?: string;
  category?: string;
}

export interface SearchResultItem {
  id: string;
  title: string;
  subtitle?: string;
  type: "event" | "person" | "place" | "source" | "quote";
  url: string;
  date?: string;
  badge?: string;
}
