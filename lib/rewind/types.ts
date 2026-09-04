export type Precision = "exact" | "day" | "month" | "year" | "range" | "unknown";
export type Verification = "verified" | "provisional" | "disputed";
export type Confidence = "confirmed" | "strong" | "moderate" | "limited";

export interface Participant {
  personId: string;
  slug?: string;
  name: string;
  role?: string;
  presenceConfidence?: string;
  capacityTitle?: string;
  attendanceMode?: string;
  latitude?: number | null;
  longitude?: number | null;
  coordinatePrecision?: string;
}

export interface EventRecord {
  id: string;
  slug: string;
  eventName: string;
  startDate: string;
  endDate?: string | null;
  /**
   * Temporal resolution of the event start date (e.g. 'exact', 'day', 'month', 'year', 'exact-day').
   * Normalized with a sensible default ('exact-day') by the data mapping layer.
   */
  datePrecision?: Precision | string;
  timePrecision?: Precision | string;
  localStartTime?: string | null;
  localEndTime?: string | null;
  timezone?: string | null;
  locationPrecision?: "venue" | "city" | "country" | "unknown" | string;
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
  confidence?: Confidence | string | null;
  scope?: "public" | "press" | "diplomatic" | "government" | "electoral" | "religious" | "media" | string;
  organisations?: string[];
  sourceIds: string[];
  participants: Participant[];
  /**
   * Legacy categorization tags retained for backward compatibility with historical registers.
   * New consumers should prefer canonical `eventTypes`.
   */
  categories?: string[];
  /**
   * Canonical event taxonomy tags (e.g. 'diplomatic', 'press-conference', 'investigation').
   * Populated as the primary taxonomy by the data mapping layer.
   */
  eventTypes?: string[];
  medium?: string[];
  notes?: string | null;
  provenance?: string[];
  reviewedAt?: string;
  sources?: SourceRecord[];
  media?: { kind: string; label: string; url: string }[];
  conflictingClaims?: string[];
  quotes?: {
    text: string;
    speaker: string;
    language: string;
    timestamp?: string | null;
  }[];
}

export interface PersonRecord {
  id: string;
  slug: string;
  name: string;
  canonicalName: string;
  displayName: string;
  description: string;
  birth?: string;
  death?: string;
  nationality?: string;
  classification: string;
  avatarUrl?: string;
  eventCount?: number;
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
  tier?: string;
  publicationDate?: string;
  accessedDate?: string;
  language?: string;
  trustScore?: number;
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
  type: "event" | "person" | "place" | "source";
  url: string;
  date?: string;
  badge?: string;
}
