export type Precision = "exact" | "exact-day" | "exact-minute" | "day" | "month" | "year" | "decade" | "range" | "unknown";
export type Verification = "verified" | "provisional" | "disputed";
export type Confidence = "confirmed" | "strong" | "moderate" | "limited" | "disputed";
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

export type AttendanceMode =
  | "physical"
  | "remote-live"
  | "remote-recorded"
  | "telephone"
  | "written"
  | "proxy";

export interface Participant {
  personId: string;
  slug?: string;
  name: string;
  role?: string;
  presenceConfidence?: Confidence;
  roleConfidence?: Confidence;
  capacityTitle?: string;
  attendanceMode?: AttendanceMode;
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
  evidenceStrength?: string;
  directness?: "direct" | "inferential" | "unknown";
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
  isTravelEvent?: boolean;
  travelMode?: string;
  originLocation?: TravelWaypoint;
  destinationLocation?: TravelWaypoint;
  waypoints?: TravelWaypoint[];
  routeCoordinates?: Array<[number, number]>;
  inferences?: TravelInference[];
  flightDetails?: FlightTravelMetadata;
  maritimeDetails?: MaritimeTravelMetadata;
  railDetails?: RailTravelMetadata;
  roadDetails?: RoadTravelMetadata;
  departureTimestamp?: string;
  arrivalTimestamp?: string;
  estimatedDurationMinutes?: number;
  legs?: JourneyLeg[];
  stayId?: string;
}

export type TravelInferenceType =
  | "flight_manifest"
  | "adsb_radar"
  | "ais_marine_radar"
  | "train_timetable"
  | "photo_metadata"
  | "eyewitness_account"
  | "social_media_post"
  | "official_schedule"
  | "customs_border_log"
  | "hotel_receipt"
  | "documentary_film"
  | "news_dispatch";

export interface TravelInference {
  id: string;
  inferenceType: TravelInferenceType;
  title: string;
  description: string;
  directness: "direct" | "inferential" | "circumstantial";
  confidence: Confidence;
  sourceId?: string;
  supportingExcerpt?: string;
  capturedAt?: string;
  mediaUrl?: string;
}

export type FlightCategory =
  | "scheduled"
  | "chartered"
  | "private-jet"
  | "government-state"
  | "military"
  | "commercial"
  | "air-taxi";

export type FlightClassification =
  | "presidential"
  | "diplomatic"
  | "military-transport"
  | "commercial-passenger"
  | "vip-private"
  | "cargo"
  | "unknown";

export type LegCertainty =
  | "documented_exact"
  | "inferred_likely"
  | "standard_protocol"
  | "provisional";

export type StayType =
  | "hotel"
  | "official_residence"
  | "private_home"
  | "diplomatic_guest_house"
  | "embassy"
  | "military_base"
  | "yacht_berth"
  | "temporary_quarters";

export interface TravelWaypoint {
  name: string;
  venueType?: "official_residence" | "helipad" | "airbase" | "airport" | "hotel" | "train_station" | "port" | "embassy" | "venue";
  city?: string;
  country?: string;
  iataCode?: string;
  icaoCode?: string;
  terminal?: string;
  latitude: number;
  longitude: number;
  arrivalTime?: string;
  departureTime?: string;
  stopType: "origin" | "destination" | "layover" | "fuel_stop" | "radar_fix" | "station_stop" | "port_call" | "checkpoint";
  notes?: string;
}

export interface FlightTravelMetadata {
  flightCategory?: FlightCategory;
  flightClassification?: FlightClassification;
  flightNumber?: string;
  callsign?: string;
  transponderHex?: string; // ICAO 24-bit Mode S transponder hex code (e.g. ADFDF8, 400892)
  aircraftManufacturer?: string; // e.g. Boeing, Gulfstream Aerospace, Bombardier, Airbus
  aircraftModel?: string; // e.g. 747-200B (VC-25A), Gulfstream G550, Boeing 727-23
  aircraftTypeIcao?: string; // e.g. B742, GLF5, B722, GL6T
  aircraftCode?: string;
  tailNumber?: string; // Aircraft registration / serial (e.g. 92-9000, N212JE, VP-BMS)
  serialNumberMsn?: string;
  operator?: string; // e.g. US Air Force 89th Airlift Wing, NetJets, British Airways
  airlineInfo?: string;
  departureAirportName?: string;
  departureAirportIata?: string;
  departureAirportIcao?: string;
  departureCity?: string;
  departureCountry?: string;
  departureTerminal?: string;
  arrivalAirportName?: string;
  arrivalAirportIata?: string;
  arrivalAirportIcao?: string;
  arrivalCity?: string;
  arrivalCountry?: string;
  arrivalTerminal?: string;
  coTravelers?: Array<{ personId?: string; name: string; role?: string; slug?: string }>;
  passengerManifestSource?: string;
  seatAssignment?: string;
  expectedDurationMinutes?: number;
  actualDurationMinutes?: number;
  cruisingAltitudeFeet?: number;
  cruiseSpeedKnots?: number;
  routeAirways?: string;
  radarTrackUrl?: string; // FlightRadar24 / ADS-B Exchange / FlightAware replay link
  identifyingMarkers?: string[];
}

export interface MaritimeTravelMetadata {
  vesselName?: string;
  vesselType?: string;
  mmsi?: string;
  imoNumber?: string;
  flagState?: string;
  portOfDeparture?: string;
  portOfArrival?: string;
  coTravelers?: Array<{ personId?: string; name: string; role?: string; slug?: string }>;
  satelliteTrackUrl?: string;
  speedKnots?: number;
}

export interface RailTravelMetadata {
  railOperator?: string;
  trainNumber?: string;
  lineName?: string;
  departureStation?: string;
  arrivalStation?: string;
  scheduledStops?: string[];
  classOfTravel?: string;
}

export interface ConvoyMetadata {
  vehicleCount?: number;
  policeEscort?: boolean;
  motorcadeType?: "presidential_full" | "diplomatic_secure" | "executive_convoy" | "standard_transfer";
  armoredLimousine?: boolean;
  leadVehicle?: string;
  notes?: string;
}

export interface RoadTravelMetadata {
  convoyType?: string;
  vehicleModel?: string;
  licensePlate?: string;
  highwayRoute?: string;
  checkpointsPassed?: string[];
  convoyDetails?: ConvoyMetadata;
}

/**
 * Represents a single sub-travel leg within a multi-leg composite journey.
 * (e.g. Residence -> Helipad -> Airbase -> Airport -> Hotel)
 */
export interface JourneyLeg {
  id: string;
  legIndex: number;
  legTitle: string;
  originVenue: TravelWaypoint;
  destinationVenue: TravelWaypoint;
  transportMode: string;
  certainty: LegCertainty;
  departureTime?: string;
  arrivalTime?: string;
  estimatedDurationMinutes?: number;
  distanceKm?: number;
  flightDetails?: FlightTravelMetadata;
  maritimeDetails?: MaritimeTravelMetadata;
  railDetails?: RailTravelMetadata;
  roadDetails?: RoadTravelMetadata;
  inferences?: TravelInference[];
  sourceIds?: string[];
}

/**
 * Represents a person's documented accommodation, official residence, or hotel stay.
 * Visualized on map journeys without polluting the chronological event stream as repetitive daily items.
 */
export interface PersonStayRecord {
  id: string;
  personId: string;
  venueName: string;
  stayType: StayType;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  startDate: string; // ISO-8601
  endDate?: string | null;
  isBaseOfOperations?: boolean;
  isPrimaryResidence?: boolean;
  securityLevel?: string;
  notes?: string;
  sourceIds: string[];
}

export interface TravelEventRecord extends EventRecord {
  isTravelEvent: true;
  travelMode: string;
  originLocation: TravelWaypoint;
  destinationLocation: TravelWaypoint;
  waypoints?: TravelWaypoint[];
  routeCoordinates?: Array<[number, number]>;
  inferences?: TravelInference[];
  legs?: JourneyLeg[];
  activeStayLocation?: PersonStayRecord;
  flightDetails?: FlightTravelMetadata;
  maritimeDetails?: MaritimeTravelMetadata;
  railDetails?: RailTravelMetadata;
  roadDetails?: RoadTravelMetadata;
  departureTimestamp?: string;
  arrivalTimestamp?: string;
  estimatedDurationMinutes?: number;
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

export interface ApiErrorResponse {
  success?: false;
  error: string;
  message?: string;
  code?: string;
  details?: unknown;
}

export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data?: T;
  message?: string;
}

