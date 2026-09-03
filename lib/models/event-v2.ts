import { z } from "zod";
import type { Confidence, Precision, Verification } from "@/data/rewind";

// ==========================================
// 1. Enums & Core Tri-State Types
// ==========================================

export type TriState = "yes" | "no" | "unknown";

export type TitleType =
  | "canonical"
  | "short"
  | "official"
  | "formal"
  | "broadcast"
  | "programme"
  | "archive"
  | "press-release"
  | "source"
  | "alternate"
  | "historic"
  | "translated"
  | "working";

export type HierarchyType =
  | "series"
  | "edition"
  | "day"
  | "session"
  | "programme"
  | "segment"
  | "performance"
  | "ceremony"
  | "sub-event"
  | "speech"
  | "meeting";

export type InvolvementType =
  | "speaker"
  | "attendee"
  | "host"
  | "guest"
  | "visitor"
  | "interviewee"
  | "interviewer"
  | "moderator"
  | "panelist"
  | "performer"
  | "presenter"
  | "chair"
  | "delegate"
  | "signatory"
  | "witness"
  | "audience-member"
  | "staff"
  | "producer"
  | "director"
  | "crew"
  | "camera-operator"
  | "photographer"
  | "security"
  | "official"
  | "advisor"
  | "aide"
  | "translator"
  | "representative"
  | "participant"
  | "other";

export type LocationPrecisionV2 =
  | "exact-position"
  | "room"
  | "stage"
  | "venue-section"
  | "building"
  | "venue"
  | "complex"
  | "street-address"
  | "neighbourhood"
  | "city"
  | "region"
  | "country"
  | "route"
  | "unknown";

export type LocationType =
  | "fixed"
  | "multi-location"
  | "route"
  | "remote"
  | "hybrid"
  | "virtual"
  | "unknown";

export type EpistemicBasis =
  | "official"
  | "directly-observed"
  | "contemporary-report"
  | "archival-record"
  | "derived"
  | "inferred"
  | "estimated"
  | "user-entered"
  | "unknown";

export type VisibilityLevel =
  | "public-exact"
  | "public-venue"
  | "public-city"
  | "restricted"
  | "internal-only";

export type OrganisationRelationshipType =
  | "organiser"
  | "co-organiser"
  | "host"
  | "institutional-host"
  | "producer"
  | "co-producer"
  | "promoter"
  | "commissioner"
  | "sponsor"
  | "partner"
  | "participant"
  | "delegation"
  | "venue-owner"
  | "venue-operator"
  | "security"
  | "press"
  | "broadcaster"
  | "streamer"
  | "publisher"
  | "governing-body"
  | "affiliate"
  | "other";

export type PersonOrganisationRelationshipType =
  | "represents"
  | "employed-by"
  | "member-of"
  | "delegation-of"
  | "appearing-for"
  | "affiliated-with"
  | "commissioned-by"
  | "sponsored-by"
  | "agency"
  | "production-company"
  | "other";

export type TopicRelationshipType =
  | "official-theme"
  | "primary-topic"
  | "secondary-topic"
  | "mentioned"
  | "incidental";

// ==========================================
// 2. Entity Interfaces
// ==========================================

export interface EventSeries {
  id: string;
  canonicalName: string;
  officialName?: string;
  organiserOrganisationId?: string;
  description?: string;
  startedDate?: string;
  endedDate?: string;
}

export interface EventTitle {
  id: string;
  eventId: string;
  title: string;
  titleType: TitleType;
  language: string;
  organisationId?: string;
  broadcasterId?: string;
  sourceId?: string;
  isPreferred: boolean;
}

export interface Address {
  id: string;
  countryCode: string;
  buildingName?: string;
  subBuilding?: string;
  streetNumber?: string;
  streetName?: string;
  district?: string;
  neighbourhood?: string;
  locality?: string;
  dependentLocality?: string;
  city?: string;
  administrativeArea?: string;
  postalCode?: string;
  formattedLocal: string;
  formattedEnglish?: string;
  descriptiveLocation?: string;
  latitude?: number;
  longitude?: number;
}

export interface Venue {
  id: string;
  name: string;
  parentVenueId?: string;
  organisationId?: string;
  addressId?: string;
  latitude?: number;
  longitude?: number;
}

export interface VenueArea {
  id: string;
  venueId: string;
  parentAreaId?: string;
  name: string;
  areaType?: "hall" | "stage" | "podium" | "room" | "compound" | "press-room" | "backstage";
  latitude?: number;
  longitude?: number;
}

export interface EventPersonLocation {
  id: string;
  eventPersonId: string;
  placeId?: string;
  venueId?: string;
  venueAreaId?: string;
  latitude: number;
  longitude: number;
  coordinatePrecision: LocationPrecisionV2;
  uncertaintyRadiusMetres?: number;
  localStartTime?: string;
  localEndTime?: string;
  isPrincipalLocation: boolean;
  locationBasis: EpistemicBasis;
  confidence: Confidence;
  sourceIds: string[];
  publicVisibility: VisibilityLevel;
}

export interface EventPersonOrganisation {
  id: string;
  eventPersonId: string;
  organisationId: string;
  relationshipType: PersonOrganisationRelationshipType;
  roleLabel?: string;
  confidence: Confidence;
}

export interface EventPerson {
  id: string;
  eventId: string;
  personId: string;
  involvementType: InvolvementType;
  roleLabel: string;
  capacityTitle?: string;
  attendanceMode: "physical" | "remote-live" | "remote-recorded" | "telephone" | "written" | "proxy";
  presenceExtent?: "entire-event" | "partial" | "keynote-only" | "opening-ceremony" | "arrival-only";
  arrivalTime?: string;
  departureTime?: string;
  presenceConfidence: Confidence;
  roleConfidence: Confidence;
  notes?: string;
  locations?: EventPersonLocation[];
  representations?: EventPersonOrganisation[];
}

export interface EventOrganisation {
  id: string;
  eventId: string;
  organisationId: string;
  relationshipType: OrganisationRelationshipType;
  roleLabel?: string;
}

export interface EventBroadcast {
  id: string;
  eventId: string;
  broadcasterOrganisationId: string;
  channelOrService?: string;
  programmeName?: string;
  broadcastTitle?: string;
  broadcastType: "television" | "radio" | "livestream" | "newsreel" | "satellite-feed";
  localStartTime?: string;
  localEndTime?: string;
  territory?: string;
  language?: string;
  liveStatus: "live" | "tape-delayed" | "recorded-highlights" | "rebroadcast";
  sourceId?: string;
}

export interface EventTopic {
  id: string;
  eventId: string;
  topicId: string;
  relationshipType: TopicRelationshipType;
  relevance?: number; // 0.0 - 1.0
}

export interface EventLocationSequence {
  id: string;
  eventId: string;
  sequenceIndex: number;
  label: string; // "Departure from Tel Aviv", "Arrival at Andrews AFB"
  latitude: number;
  longitude: number;
  timestamp?: string;
  precision: LocationPrecisionV2;
}

export interface EventFactualFlags {
  physicalAttendanceConfirmed: TriState;
  remoteParticipation: TriState;
  publicEvent: TriState;
  openToPress: TriState;
  ticketed: TriState;
  invitationOnly: TriState;
  televised: TriState;
  broadcastLive: TriState;
  streamedOnline: TriState;
  audioRecorded: TriState;
  videoRecorded: TriState;
  photographed: TriState;
  transcriptAvailable: TriState;
  fullRecordingKnown: TriState;
  exactStartTimeKnown: boolean;
  exactEndTimeKnown: boolean;
  exactVenueKnown: boolean;
  exactRoomKnown: boolean;
  personPreciseLocationKnown: boolean;
  organiserIdentified: boolean;
  attendanceListKnown: TriState;
  officialProgrammeAvailable: TriState;
  eventCancelled: boolean;
  eventPostponed: boolean;
  occurredAsScheduled: TriState;
}

export interface EventEditorialControls {
  needsReview: boolean;
  needsGeocodeReview: boolean;
  geocodeReviewed: boolean;
  possibleDuplicate: boolean;
  duplicateReviewed: boolean;
  likelyPartOfLargerEvent: boolean;
  parentEventNeeded: boolean;
  personRolesIncomplete: boolean;
  organisationsIncomplete: boolean;
  broadcastResearchIncomplete: boolean;
  locationInferred: boolean;
  timeInferred: boolean;
  titleEditorial: boolean;
  officialTitleVerified: boolean;
  primarySourcePresent: boolean;
  conflictingSources: boolean;
  possibleDateConflict: boolean;
  possibleLocationConflict: boolean;
  sensitiveLocation: boolean;
  exactLocationPublic: boolean;
  readyForPublication: boolean;
  featuredEvent: boolean;
  dataCompletenessScore: number; // 0 - 100
}

export interface EventV2 {
  id: string;
  slug: string;
  canonicalTitle: string;
  shortTitle?: string;
  officialTitle?: string;
  formalFullTitle?: string;
  descriptiveTitle?: string;
  summary: string;

  // Hierarchy & Family
  parentEventId?: string | null;
  eventSeriesId?: string | null;
  hierarchyType?: HierarchyType;
  editionNumber?: number;
  sessionNumber?: number;
  dayNumber?: number;

  // Temporal Attributes
  startDate: string;
  endDate?: string | null;
  localStartTime?: string | null;
  localEndTime?: string | null;
  timezone?: string | null;
  datePrecision: Precision;
  timePrecision: Precision;
  timeBasis?: EpistemicBasis;
  durationSeconds?: number;

  // Primary Geospatial Attributes
  locationType: LocationType;
  venueId?: string | null;
  venueName?: string | null;
  addressId?: string | null;
  city: string;
  region?: string | null;
  country: string;
  latitude: number | null;
  longitude: number | null;
  locationPrecision: LocationPrecisionV2;
  uncertaintyRadiusMetres?: number;

  // Evidentiary & Status
  verificationStatus: Verification;
  confidence: Confidence;
  sourceIds: string[];
  reviewedAt: string;
  reviewedBy?: string;
  researchNotes?: string | null;

  // Flags & Controls
  factualFlags: EventFactualFlags;
  editorialControls: EventEditorialControls;

  // Relational Collections (Loaded or linked)
  titles?: EventTitle[];
  people?: EventPerson[];
  organisations?: EventOrganisation[];
  topics?: EventTopic[];
  broadcasts?: EventBroadcast[];
  routeSequences?: EventLocationSequence[];

  // Backward compatibility alias
  eventName?: string;
}

// ==========================================
// 3. Runtime Zod Validation Schemas
// ==========================================

export const TriStateSchema = z.enum(["yes", "no", "unknown"]);

export const LocationPrecisionV2Schema = z.enum([
  "exact-position",
  "room",
  "stage",
  "venue-section",
  "building",
  "venue",
  "complex",
  "street-address",
  "neighbourhood",
  "city",
  "region",
  "country",
  "route",
  "unknown",
]);

export const EventPersonLocationSchema = z.object({
  id: z.string(),
  eventPersonId: z.string(),
  placeId: z.string().optional(),
  venueId: z.string().optional(),
  venueAreaId: z.string().optional(),
  latitude: z.number(),
  longitude: z.number(),
  coordinatePrecision: LocationPrecisionV2Schema,
  uncertaintyRadiusMetres: z.number().optional(),
  localStartTime: z.string().optional(),
  localEndTime: z.string().optional(),
  isPrincipalLocation: z.boolean(),
  locationBasis: z.string(),
  confidence: z.enum(["confirmed", "strong", "moderate", "limited"]),
  sourceIds: z.array(z.string()),
  publicVisibility: z.enum(["public-exact", "public-venue", "public-city", "restricted", "internal-only"]),
});

export const EventPersonSchema = z.object({
  id: z.string(),
  eventId: z.string(),
  personId: z.string(),
  involvementType: z.string(),
  roleLabel: z.string(),
  capacityTitle: z.string().optional(),
  attendanceMode: z.enum(["physical", "remote-live", "remote-recorded", "telephone", "written", "proxy"]),
  presenceConfidence: z.enum(["confirmed", "strong", "moderate", "limited"]),
  roleConfidence: z.enum(["confirmed", "strong", "moderate", "limited"]),
  locations: z.array(EventPersonLocationSchema).optional(),
});
