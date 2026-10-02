/**
 * REWIND EVIDENCE ATLAS — CANONICAL SEED REGISTER: PRESIDENTIAL & EXECUTIVE ACTIONS
 *
 * Forensically documented primary historical events with exact coordinates,
 * gazetteer-resolved venues, multi-person co-attendance rosters, and source citations.
 */

import type { EventRecord } from "@/lib/rewind/types";

export const presidentialActionsEvents: EventRecord[] = [
  {
    id: "evt-1948-05-14-us-recognition-of-israel",
    slug: "1948-05-14-president-truman-grants-de-facto-recognition-to-israel",
    eventName: "President Harry S. Truman Grants De Facto US Recognition to the State of Israel",
    startDate: "1948-05-14T22:11:00Z",
    endDate: null,
    datePrecision: "exact-minute",
    timePrecision: "exact-minute",
    localStartTime: "18:11",
    timezone: "America/New_York",
    city: "Washington",
    country: "United States",
    venueName: "The White House - Oval Office",
    platform: "Executive Office of the President",
    address: "1600 Pennsylvania Avenue NW, Washington, DC 20500",
    latitude: 38.8977,
    longitude: -77.0365,
    locationPrecision: "venue",
    summary: "President Harry S. Truman issues an official White House statement recognizing the provisional government as the de facto authority of the new State of Israel, exactly eleven minutes after the Israeli declaration took effect.",
    description: "Overriding intense objections from Secretary of State George C. Marshall and the State Department Arabists, Truman signed the official press release declaring US recognition of the newborn state.",
    verificationStatus: "verified",
    confidence: "confirmed",
    confidenceScore: 1.0,
    scope: "diplomatic",
    categories: ["diplomacy", "bilateral-recognition"],
    eventTypes: ["diplomatic-recognition", "presidential-action"],
    sourceIds: ["src-un-unga-19840925"],
    participants: [
      {
        personId: "harry-s-truman",
        slug: "harry-s-truman",
        name: "Harry S. Truman",
        role: "President of the United States",
        presenceConfidence: "confirmed",
        attendanceMode: "physical"
      }
    ],
    quotes: [
      {
        text: "This Government has been informed that a Jewish state has been proclaimed in Palestine, and recognition has been requested by the provisional government thereof. The United States recognizes the provisional government as the de facto authority of the new State of Israel.",
        speaker: "Harry S. Truman",
        language: "en",
        timestamp: null
      }
    ]
  },
  {
    id: "evt-1996-07-09-netanyahu-clinton-white-house",
    slug: "1996-07-09-prime-minister-netanyahu-first-official-white-house-meeting",
    eventName: "Prime Minister Benjamin Netanyahu Holds First Bilateral White House Meeting With President Clinton",
    startDate: "1996-07-09T16:00:00Z",
    endDate: null,
    datePrecision: "exact-minute",
    timePrecision: "exact-minute",
    localStartTime: "12:00",
    timezone: "America/New_York",
    city: "Washington",
    country: "United States",
    venueName: "The White House - Oval Office",
    platform: "Executive Office of the President",
    address: "1600 Pennsylvania Avenue NW, Washington, DC 20500",
    latitude: 38.8977,
    longitude: -77.0365,
    locationPrecision: "venue",
    summary: "Prime Minister Benjamin Netanyahu makes his first official state visit to the United States following his election victory, meeting with President Bill Clinton in the Oval Office to discuss the Middle East peace process and counter-terrorism cooperation.",
    description: "The leaders held intensive private consultations before convening an extended joint press conference in the White House briefing room.",
    verificationStatus: "verified",
    confidence: "confirmed",
    confidenceScore: 1.0,
    scope: "diplomatic",
    categories: ["diplomacy", "bilateral-summit"],
    eventTypes: ["state-visit", "bilateral-meeting"],
    sourceIds: ["src-wh-transcript-19960709"],
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
        personId: "benjamin-netanyahu",
        slug: "benjamin-netanyahu",
        name: "Benjamin Netanyahu",
        role: "Prime Minister of Israel",
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
    ],
    quotes: [
      {
        text: "We want to broaden the circle of peace to include all our neighbors, but peace must be accompanied by security.",
        speaker: "Benjamin Netanyahu",
        language: "en",
        timestamp: null
      }
    ]
  },
  {
    id: "evt-1996-07-10-netanyahu-congress-address",
    slug: "1996-07-10-prime-minister-netanyahu-first-address-to-joint-meeting-of-congress",
    eventName: "Prime Minister Benjamin Netanyahu Delivers First Address to Joint Meeting of Congress",
    startDate: "1996-07-10T15:00:00Z",
    endDate: null,
    datePrecision: "exact-minute",
    timePrecision: "exact-minute",
    localStartTime: "11:00",
    timezone: "America/New_York",
    city: "Washington",
    country: "United States",
    venueName: "United States Capitol - House Chamber",
    platform: "Joint Meeting of the United States Congress",
    address: "First St SE, Washington, DC 20004",
    latitude: 38.8899,
    longitude: -77.0091,
    locationPrecision: "venue",
    summary: "Prime Minister Benjamin Netanyahu addresses a joint meeting of the US Congress, outlining his vision of 'peace with security', economic self-reliance, and the strategic alliance between Israel and the United States.",
    description: "Netanyahu's 42-minute speech received dozens of standing ovations, where he pledged that Israel would begin phasing out US civilian economic aid to stand on its own economic footing.",
    verificationStatus: "verified",
    confidence: "confirmed",
    confidenceScore: 1.0,
    scope: "government",
    categories: ["government", "parliamentary-address"],
    eventTypes: ["congressional-address", "joint-meeting"],
    sourceIds: ["src-cspan-19960710-joint-meeting"],
    participants: [
      {
        personId: "benjamin-netanyahu",
        slug: "benjamin-netanyahu",
        name: "Benjamin Netanyahu",
        role: "Prime Minister of Israel (Keynote Speaker)",
        presenceConfidence: "confirmed",
        attendanceMode: "physical"
      },
      {
        personId: "newt-gingrich",
        slug: "newt-gingrich",
        name: "Newt Gingrich",
        role: "Speaker of the United States House of Representatives (Co-Presiding)",
        presenceConfidence: "confirmed",
        attendanceMode: "physical"
      },
      {
        personId: "al-gore",
        slug: "al-gore",
        name: "Al Gore",
        role: "Vice President of the United States / President of the Senate (Co-Presiding)",
        presenceConfidence: "confirmed",
        attendanceMode: "physical"
      }
    ],
    quotes: [
      {
        text: "There is no other democracy in the Middle East. There is no other ally like Israel.",
        speaker: "Benjamin Netanyahu",
        language: "en",
        timestamp: "00:18:40"
      }
    ]
  },
  {
    id: "evt-2011-05-24-netanyahu-congress-address",
    slug: "2011-05-24-prime-minister-netanyahu-second-address-to-joint-meeting-of-congress",
    eventName: "Prime Minister Benjamin Netanyahu Delivers Second Address to Joint Meeting of Congress",
    startDate: "2011-05-24T15:10:00Z",
    endDate: null,
    datePrecision: "exact-minute",
    timePrecision: "exact-minute",
    localStartTime: "11:10",
    timezone: "America/New_York",
    city: "Washington",
    country: "United States",
    venueName: "United States Capitol - House Chamber",
    platform: "Joint Meeting of the United States Congress",
    address: "First St SE, Washington, DC 20004",
    latitude: 38.8899,
    longitude: -77.0091,
    locationPrecision: "venue",
    summary: "Prime Minister Benjamin Netanyahu addresses a joint meeting of the US Congress, addressing the Arab Spring uprisings, Middle East peace parameters, and the strategic danger of a nuclear-armed Iran.",
    description: "Netanyahu emphasized Israel's willingness to make painful compromises for genuine peace while rejecting a return to the indefensible 1967 armistice lines.",
    verificationStatus: "verified",
    confidence: "confirmed",
    confidenceScore: 1.0,
    scope: "government",
    categories: ["government", "parliamentary-address"],
    eventTypes: ["congressional-address", "joint-meeting"],
    sourceIds: ["src-cspan-20110524-netanyahu-congress"],
    participants: [
      {
        personId: "benjamin-netanyahu",
        slug: "benjamin-netanyahu",
        name: "Benjamin Netanyahu",
        role: "Prime Minister of Israel (Keynote Speaker)",
        presenceConfidence: "confirmed",
        attendanceMode: "physical"
      },
      {
        personId: "john-boehner",
        slug: "john-boehner",
        name: "John Boehner",
        role: "Speaker of the United States House of Representatives (Co-Presiding)",
        presenceConfidence: "confirmed",
        attendanceMode: "physical"
      },
      {
        personId: "joe-biden",
        slug: "joe-biden",
        name: "Joe Biden",
        role: "Vice President of the United States / President of the Senate (Co-Presiding)",
        presenceConfidence: "confirmed",
        attendanceMode: "physical"
      }
    ]
  },
  {
    id: "evt-2015-03-03-netanyahu-congress-iran",
    slug: "2015-03-03-prime-minister-netanyahu-addresses-congress-on-iran-nuclear-deal",
    eventName: "Prime Minister Benjamin Netanyahu Addresses Joint Meeting of Congress on Iran Nuclear Deal",
    startDate: "2015-03-03T15:45:00Z",
    endDate: null,
    datePrecision: "exact-minute",
    timePrecision: "exact-minute",
    localStartTime: "10:45",
    timezone: "America/New_York",
    city: "Washington",
    country: "United States",
    venueName: "United States Capitol - House Chamber",
    platform: "Joint Meeting of the United States Congress",
    address: "First St SE, Washington, DC 20004",
    latitude: 38.8899,
    longitude: -77.0091,
    locationPrecision: "venue",
    summary: "Prime Minister Benjamin Netanyahu delivers his historic third address to a joint meeting of the US Congress, warning against the emerging JCPOA nuclear framework with Iran as a 'very bad deal' that paves Iran's path to the bomb.",
    description: "Accepted upon the invitation of House Speaker John Boehner without White House coordination, the speech highlighted geopolitical tensions between the Obama administration and Netanyahu's government.",
    verificationStatus: "verified",
    confidence: "confirmed",
    confidenceScore: 1.0,
    scope: "government",
    categories: ["government", "parliamentary-address"],
    eventTypes: ["congressional-address", "foreign-policy-speech"],
    sourceIds: ["src-cspan-20150303-netanyahu-congress"],
    participants: [
      {
        personId: "benjamin-netanyahu",
        slug: "benjamin-netanyahu",
        name: "Benjamin Netanyahu",
        role: "Prime Minister of Israel (Keynote Speaker)",
        presenceConfidence: "confirmed",
        attendanceMode: "physical"
      },
      {
        personId: "john-boehner",
        slug: "john-boehner",
        name: "John Boehner",
        role: "Speaker of the United States House of Representatives (Host / Presiding)",
        presenceConfidence: "confirmed",
        attendanceMode: "physical"
      },
      {
        personId: "orrin-hatch",
        slug: "orrin-hatch",
        name: "Orrin Hatch",
        role: "President pro tempore of the United States Senate (Presiding)",
        presenceConfidence: "confirmed",
        attendanceMode: "physical"
      }
    ],
    quotes: [
      {
        text: "This deal won't prevent Iran from acquiring nuclear weapons; it will practically guarantee that it does.",
        speaker: "Benjamin Netanyahu",
        language: "en",
        timestamp: "00:21:10"
      }
    ]
  },
  {
    id: "evt-2017-12-06-trump-jerusalem-recognition",
    slug: "2017-12-06-president-trump-recognizes-jerusalem-as-capital-of-israel",
    eventName: "President Donald Trump Formally Recognizes Jerusalem as Israel's Capital",
    startDate: "2017-12-06T18:00:00Z",
    endDate: null,
    datePrecision: "exact-minute",
    timePrecision: "exact-minute",
    localStartTime: "13:00",
    timezone: "America/New_York",
    city: "Washington",
    country: "United States",
    venueName: "The White House - Diplomatic Reception Room",
    platform: "Executive Office of the President",
    address: "1600 Pennsylvania Avenue NW, Washington, DC 20500",
    latitude: 38.8977,
    longitude: -77.0365,
    locationPrecision: "venue",
    summary: "President Donald Trump formally recognizes Jerusalem as the capital of the State of Israel and directs the Department of State to begin preparations to move the American Embassy from Tel Aviv to Jerusalem pursuant to the 1995 Jerusalem Embassy Act.",
    description: "The presidential proclamation reversed seven decades of American foreign policy precedent regarding the contested status of Jerusalem, drawing international support from Israel and condemnation across the Arab League.",
    verificationStatus: "verified",
    confidence: "confirmed",
    confidenceScore: 1.0,
    scope: "diplomatic",
    categories: ["diplomacy", "presidential-proclamation"],
    eventTypes: ["presidential-address", "foreign-policy-declaration"],
    sourceIds: ["src-wh-jerusalem-proclamation-20171206"],
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
        personId: "mike-pence",
        slug: "mike-pence",
        name: "Mike Pence",
        role: "Vice President of the United States",
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
      }
    ],
    quotes: [
      {
        text: "I have determined that it is time to officially recognize Jerusalem as the capital of Israel.",
        speaker: "Donald Trump",
        language: "en",
        timestamp: "00:03:40"
      }
    ]
  },
  {
    id: "evt-2024-07-24-netanyahu-congress-address",
    slug: "2024-07-24-prime-minister-netanyahu-fourth-address-to-joint-meeting-of-congress",
    eventName: "Prime Minister Benjamin Netanyahu Delivers Record Fourth Address to Joint Meeting of Congress",
    startDate: "2024-07-24T18:00:00Z",
    endDate: null,
    datePrecision: "exact-minute",
    timePrecision: "exact-minute",
    localStartTime: "14:00",
    timezone: "America/New_York",
    city: "Washington",
    country: "United States",
    venueName: "United States Capitol - House Chamber",
    platform: "Joint Meeting of the United States Congress",
    address: "First St SE, Washington, DC 20004",
    latitude: 38.8899,
    longitude: -77.0091,
    locationPrecision: "venue",
    summary: "Prime Minister Benjamin Netanyahu addresses a joint meeting of the US Congress for a historic fourth time, surpassing Winston Churchill's previous record, speaking during the ongoing Israel-Hamas war and calling for total victory.",
    description: "Invited by bipartisan congressional leadership, Netanyahu addressed the war in Gaza, regional threats from Iran's axis of resistance, and outlined a vision for a demilitarized and deradicalized post-war Gaza.",
    verificationStatus: "verified",
    confidence: "confirmed",
    confidenceScore: 1.0,
    scope: "government",
    categories: ["government", "parliamentary-address"],
    eventTypes: ["congressional-address", "wartime-speech"],
    sourceIds: ["src-cspan-20240724-netanyahu-congress"],
    participants: [
      {
        personId: "benjamin-netanyahu",
        slug: "benjamin-netanyahu",
        name: "Benjamin Netanyahu",
        role: "Prime Minister of Israel (Keynote Speaker)",
        presenceConfidence: "confirmed",
        attendanceMode: "physical"
      },
      {
        personId: "mike-johnson",
        slug: "mike-johnson",
        name: "Mike Johnson",
        role: "Speaker of the United States House of Representatives (Host / Presiding)",
        presenceConfidence: "confirmed",
        attendanceMode: "physical"
      },
      {
        personId: "ben-cardin",
        slug: "ben-cardin",
        name: "Ben Cardin",
        role: "Chairman of the Senate Foreign Relations Committee (Presiding)",
        presenceConfidence: "confirmed",
        attendanceMode: "physical"
      }
    ],
    quotes: [
      {
        text: "America and Israel must stand together. When we stand together, something very simple happens: We win. They lose.",
        speaker: "Benjamin Netanyahu",
        language: "en",
        timestamp: "00:04:15"
      }
    ]
  }
];
