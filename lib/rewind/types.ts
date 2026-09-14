export type Precision = "exact" | "exact-day" | "exact-minute" | "day" | "month" | "year" | "decade" | "range" | "unknown";
export type Verification = "verified" | "provisional" | "disputed";
export type Confidence = "confirmed" | "strong" | "moderate" | "limited";
export type LocationPrecision = "venue" | "city" | "country" | "unknown";
export type EventScope = "public" | "press" | "diplomatic" | "government" | "electoral" | "religious" | "media";

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
  timezone?: string | null;
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
  quotes?: {
    text: string;
    speaker: string;
    language: string;
    timestamp?: string | null;
  }[] | undefined;
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
  type: "event" | "person" | "place" | "source" | "quote";
  url: string;
  date?: string;
  badge?: string;
}
