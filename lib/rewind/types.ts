export type Precision = "exact" | "day" | "month" | "year" | "range" | "unknown";
export type Verification = "verified" | "provisional" | "disputed";
export type Confidence = "confirmed" | "strong" | "moderate" | "limited";

export interface Participant {
  personId: string;
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
  endDate?: string;
  datePrecision?: string;
  timePrecision?: string;
  localStartTime?: string;
  locationPrecision?: string;
  city: string;
  country: string;
  venueName?: string;
  latitude?: number | null;
  longitude?: number | null;
  summary: string;
  description?: string;
  verificationStatus: Verification;
  confidenceScore?: number;
  confidence?: string;
  sourceIds: string[];
  participants: Participant[];
  categories?: string[];
  eventTypes?: string[];
  medium?: string[];
  notes?: string;
  provenance?: string[];
  reviewedAt?: string;
  sources?: SourceRecord[];
  quotes?: {
    text: string;
    speaker: string;
    language: string;
    timestamp?: string;
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
