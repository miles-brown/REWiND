/**
 * REWIND EVIDENCE ATLAS — CANONICAL SEED REGISTER: TRAVEL & FLIGHT CORRIDORS
 *
 * Forensically documented primary travel events with exact coordinates,
 * gazetteer-resolved airports, origin/destination waypoints, and transit metadata.
 */

import type { EventRecord } from "@/lib/rewind/types";

export const travelCorridorsEvents: EventRecord[] = [
  {
    id: "evt-1979-03-08-carter-cairo-telaviv-shuttle",
    slug: "1979-03-08-president-carter-flies-air-force-one-peace-shuttle",
    eventName: "President Jimmy Carter Operates Air Force One Peace Mission to Cairo and Tel Aviv",
    startDate: "1979-03-08T12:00:00Z",
    endDate: "1979-03-13T20:00:00Z",
    datePrecision: "exact-day",
    timePrecision: "day",
    city: "Cairo",
    country: "Egypt",
    venueName: "Cairo International Airport",
    platform: "Air Force One (SAM 27000)",
    address: "Cairo International Airport, Heliopolis, Cairo",
    latitude: 30.1219,
    longitude: 31.4056,
    locationPrecision: "venue",
    summary: "President Jimmy Carter departs Andrews AFB aboard Air Force One on a high-stakes diplomatic shuttle to Cairo and Jerusalem to resolve final impasses holding up the formal Egypt-Israel Peace Treaty.",
    description: "Carter's personal intervention with President Sadat at Kubbeh Palace and Prime Minister Begin at the King David Hotel finalized treaty language for the White House signing two weeks later.",
    verificationStatus: "verified",
    confidence: "confirmed",
    confidenceScore: 1.0,
    scope: "diplomatic",
    categories: ["diplomacy", "presidential-travel"],
    eventTypes: ["state-flight", "diplomatic-mission"],
    sourceIds: ["src-camp-david-accords-19780917"],
    isTravelEvent: true,
    transportMode: "air",
    flightIdentifier: "SAM 27000 (Air Force One)",
    isDocumentedFlight: true,
    flightCorridor: "KADW -> HECA -> LLBG -> KADW",
    departureAirportIata: "ADW",
    arrivalAirportIata: "CAI",
    originWaypoint: {
      name: "Joint Base Andrews",
      city: "Camp Springs",
      country: "United States",
      iataCode: "ADW",
      latitude: 38.8108,
      longitude: -76.867,
      stopType: "origin"
    },
    destinationWaypoint: {
      name: "Cairo International Airport",
      city: "Cairo",
      country: "Egypt",
      iataCode: "CAI",
      latitude: 30.1219,
      longitude: 31.4056,
      stopType: "destination"
    },
    routeCoordinates: [
      [38.8108, -76.867],
      [42.3601, -71.0589],
      [49.0097, 2.5479],
      [37.9838, 23.7275],
      [30.1219, 31.4056]
    ],
    participants: [
      {
        personId: "jimmy-carter",
        slug: "jimmy-carter",
        name: "Jimmy Carter",
        role: "President of the United States",
        presenceConfidence: "confirmed",
        attendanceMode: "physical"
      },
      {
        personId: "cyrus-vance",
        slug: "cyrus-vance",
        name: "Cyrus Vance",
        role: "US Secretary of State",
        presenceConfidence: "confirmed",
        attendanceMode: "physical"
      },
      {
        personId: "anwar-sadat",
        slug: "anwar-sadat",
        name: "Anwar Sadat",
        role: "President of Egypt (Greeting Dignitary)",
        presenceConfidence: "confirmed",
        attendanceMode: "physical"
      }
    ]
  },
  {
    id: "evt-1994-10-26-clinton-air-force-one-wadi-araba",
    slug: "1994-10-26-president-clinton-flies-to-wadi-araba-treaty-signing",
    eventName: "President Bill Clinton Flies Aboard Air Force One to Jordan for Peace Treaty Signing",
    startDate: "1994-10-26T06:00:00Z",
    endDate: null,
    datePrecision: "exact-minute",
    timePrecision: "exact-minute",
    localStartTime: "08:00",
    timezone: "Asia/Amman",
    city: "Aqaba",
    country: "Jordan",
    venueName: "King Hussein International Airport",
    platform: "Air Force One (SAM 28000 / VC-25A)",
    address: "Peace Way, Aqaba",
    latitude: 29.6116,
    longitude: 35.0181,
    locationPrecision: "venue",
    summary: "President Bill Clinton lands aboard Air Force One at King Hussein International Airport in Aqaba before motoring to the desert border crossing at Wadi Araba to witness the signing of the Israel-Jordan Peace Treaty.",
    description: "Clinton became the first sitting US President to address the Jordanian Parliament in Amman immediately following the ceremony.",
    verificationStatus: "verified",
    confidence: "confirmed",
    confidenceScore: 1.0,
    scope: "diplomatic",
    categories: ["diplomacy", "presidential-travel"],
    eventTypes: ["state-flight", "presidential-visit"],
    sourceIds: ["src-israel-jordan-treaty-19941026"],
    isTravelEvent: true,
    transportMode: "air",
    flightIdentifier: "SAM 28000 (Air Force One)",
    isDocumentedFlight: true,
    flightCorridor: "KADW -> OJAQ",
    departureAirportIata: "ADW",
    arrivalAirportIata: "AQJ",
    originWaypoint: {
      name: "Joint Base Andrews",
      city: "Camp Springs",
      country: "United States",
      iataCode: "ADW",
      latitude: 38.8108,
      longitude: -76.867,
      stopType: "origin"
    },
    destinationWaypoint: {
      name: "King Hussein International Airport",
      city: "Aqaba",
      country: "Jordan",
      iataCode: "AQJ",
      latitude: 29.6116,
      longitude: 35.0181,
      stopType: "destination"
    },
    routeCoordinates: [
      [38.8108, -76.867],
      [51.1537, -0.1821],
      [41.8003, 12.2389],
      [32.0055, 34.8854],
      [29.6116, 35.0181]
    ],
    participants: [
      {
        personId: "bill-clinton",
        slug: "bill-clinton",
        name: "Bill Clinton",
        role: "President of the United States",
        presenceConfidence: "confirmed",
        attendanceMode: "physical"
      },
      {
        personId: "warren-christopher",
        slug: "warren-christopher",
        name: "Warren Christopher",
        role: "US Secretary of State",
        presenceConfidence: "confirmed",
        attendanceMode: "physical"
      }
    ]
  },
  {
    id: "evt-2017-05-22-trump-historic-direct-flight-riyadh-telaviv",
    slug: "2017-05-22-president-trump-flies-historic-direct-flight-riyadh-to-tel-aviv",
    eventName: "President Donald Trump Flies Historic First Direct Flight From Riyadh to Tel Aviv",
    startDate: "2017-05-22T07:15:00Z",
    endDate: "2017-05-22T09:40:00Z",
    datePrecision: "exact-minute",
    timePrecision: "exact-minute",
    localStartTime: "10:15",
    timezone: "Asia/Riyadh",
    city: "Riyadh",
    country: "Saudi Arabia",
    venueName: "King Khalid International Airport",
    platform: "Air Force One (SAM 29000 / VC-25A)",
    address: "King Khalid Airport Road, Riyadh",
    latitude: 24.9576,
    longitude: 46.6988,
    locationPrecision: "venue",
    summary: "President Donald Trump flies aboard Air Force One directly from King Khalid International Airport in Riyadh to Ben Gurion Airport in Tel Aviv, making the first publicly acknowledged direct flight between Saudi Arabia and Israel.",
    description: "The historic flight connected the Riyadh Arab Islamic American Summit directly with Israel, presaging the regional normalization architecture later embodied in the Abraham Accords.",
    verificationStatus: "verified",
    confidence: "confirmed",
    confidenceScore: 1.0,
    scope: "diplomatic",
    categories: ["diplomacy", "presidential-travel"],
    eventTypes: ["state-flight", "historic-aviation-corridor"],
    sourceIds: ["src-abraham-accords-20200915"],
    isTravelEvent: true,
    transportMode: "air",
    flightIdentifier: "SAM 29000 (Air Force One)",
    isDocumentedFlight: true,
    flightCorridor: "OERK -> LLBG",
    departureAirportIata: "RUH",
    arrivalAirportIata: "TLV",
    originWaypoint: {
      name: "King Khalid International Airport",
      city: "Riyadh",
      country: "Saudi Arabia",
      iataCode: "RUH",
      latitude: 24.9576,
      longitude: 46.6988,
      stopType: "origin"
    },
    destinationWaypoint: {
      name: "Ben Gurion Airport",
      city: "Tel Aviv",
      country: "Israel",
      iataCode: "TLV",
      latitude: 32.0055,
      longitude: 34.8854,
      stopType: "destination"
    },
    routeCoordinates: [
      [24.9576, 46.6988],
      [27.5114, 41.6907],
      [29.5647, 35.0068],
      [31.2589, 34.7997],
      [32.0055, 34.8854]
    ],
    participants: [
      {
        personId: "donald-trump",
        slug: "donald-trump",
        name: "Donald Trump",
        role: "President of the United States",
        presenceConfidence: "confirmed",
        attendanceMode: "physical"
      },
      {
        personId: "rex-tillerson",
        slug: "rex-tillerson",
        name: "Rex Tillerson",
        role: "US Secretary of State",
        presenceConfidence: "confirmed",
        attendanceMode: "physical"
      },
      {
        personId: "reuven-rivlin",
        slug: "reuven-rivlin",
        name: "Reuven Rivlin",
        role: "President of the State of Israel (Greeting Dignitary)",
        presenceConfidence: "confirmed",
        attendanceMode: "physical"
      },
      {
        personId: "benjamin-netanyahu",
        slug: "benjamin-netanyahu",
        name: "Benjamin Netanyahu",
        role: "Prime Minister of Israel (Greeting Dignitary)",
        presenceConfidence: "confirmed",
        attendanceMode: "physical"
      }
    ]
  }
];
