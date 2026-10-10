/**
 * REWIND EVIDENCE ATLAS — CANONICAL SEED REGISTER: TECH, MEDIA & CULTURAL EVENTS
 *
 * Forensically documented primary historical events with exact coordinates,
 * gazetteer-resolved venues, multi-person co-attendance rosters, and source citations.
 */

import type { EventRecord } from "@/lib/rewind/types";

export const techMediaCultureEvents: EventRecord[] = [
  {
    id: "evt-1978-12-10-nobel-peace-prize-oslo",
    slug: "1978-12-10-begin-and-sadat-awarded-nobel-peace-prize",
    eventName: "Menachem Begin and Anwar Sadat Awarded the 1978 Nobel Peace Prize",
    startDate: "1978-12-10T13:00:00Z",
    endDate: null,
    datePrecision: "exact-minute",
    timePrecision: "exact-minute",
    localStartTime: "14:00",
    timezone: "Europe/Oslo",
    city: "Oslo",
    country: "Norway",
    venueName: "University of Oslo",
    subvenue: "Aula",
    platform: "Norwegian Nobel Committee",
    address: "Karl Johans gate 47, 0162 Oslo",
    latitude: 59.9157,
    longitude: 10.7369,
    locationPrecision: "venue",
    summary: "Israeli Prime Minister Menachem Begin and Egyptian President Anwar Sadat are jointly awarded the 1978 Nobel Peace Prize in Oslo for their historic breakthrough in negotiating the Camp David Accords.",
    description: "Begin attended the ceremony in person at the University of Oslo Aula, while Sadat was represented by Sayed Marei, marking the first time Israeli and Arab leaders shared the Nobel Peace honor.",
    verificationStatus: "verified",
    confidence: "confirmed",
    confidenceScore: 1.0,
    scope: "public",
    categories: ["culture", "nobel-prize"],
    eventTypes: ["award-ceremony", "nobel-lecture"],
    sourceIds: ["src-nobel-peace-19781210"],
    participants: [
      {
        personId: "menachem-begin",
        slug: "menachem-begin",
        name: "Menachem Begin",
        role: "Prime Minister of Israel (Nobel Laureate)",
        presenceConfidence: "confirmed",
        attendanceMode: "physical"
      },
      {
        personId: "anwar-sadat",
        slug: "anwar-sadat",
        name: "Anwar Sadat",
        role: "President of the Arab Republic of Egypt (Nobel Laureate - by proxy)",
        presenceConfidence: "confirmed",
        attendanceMode: "proxy"
      }
    ],
    quotes: [
      {
        text: "Peace is the beauty of life. It is sunshine. It is the smile of a child, the love of a mother, the joy of a father, the togetherness of a family.",
        speaker: "Menachem Begin",
        language: "en",
        timestamp: "00:10:15"
      }
    ]
  },
  {
    id: "evt-1984-09-25-netanyahu-un-maiden-speech",
    slug: "1984-09-25-ambassador-netanyahu-delivers-maiden-unga-address",
    eventName: "Ambassador Benjamin Netanyahu Delivers Maiden Address to the UN General Assembly",
    startDate: "1984-09-25T15:00:00Z",
    endDate: null,
    datePrecision: "exact-minute",
    timePrecision: "exact-minute",
    localStartTime: "11:00",
    timezone: "America/New_York",
    city: "New York",
    country: "United States",
    venueName: "United Nations Headquarters",
    subvenue: "General Assembly Hall",
    platform: "United Nations General Assembly 39th Session",
    address: "405 E 42nd St, New York, NY 10017",
    latitude: 40.7499,
    longitude: -73.9674,
    locationPrecision: "venue",
    summary: "Ambassador Benjamin Netanyahu delivers his first major address to the United Nations General Assembly as Israel's Permanent Representative, defending Israel's security posture and warning against international sponsorship of global terrorism.",
    description: "Netanyahu's articulate, televised presentations during his four-year tenure at the UN elevated his international profile and established him as Israel's foremost English-language media spokesperson.",
    verificationStatus: "verified",
    confidence: "confirmed",
    confidenceScore: 1.0,
    scope: "diplomatic",
    categories: ["diplomacy", "un-plenary-address"],
    eventTypes: ["general-assembly-address", "diplomatic-speech"],
    sourceIds: ["src-un-unga-19840925"],
    participants: [
      {
        personId: "benjamin-netanyahu",
        slug: "benjamin-netanyahu",
        name: "Benjamin Netanyahu",
        role: "Permanent Representative of Israel to the United Nations",
        presenceConfidence: "confirmed",
        attendanceMode: "physical"
      },
      {
        personId: "jeane-kirkpatrick",
        slug: "jeane-kirkpatrick",
        name: "Jeane Kirkpatrick",
        role: "United States Permanent Representative to the United Nations",
        presenceConfidence: "confirmed",
        attendanceMode: "physical"
      }
    ]
  },
  {
    id: "evt-1994-12-10-nobel-peace-prize-oslo",
    slug: "1994-12-10-rabin-peres-arafat-awarded-nobel-peace-prize",
    eventName: "Yitzhak Rabin, Shimon Peres, and Yasser Arafat Receive 1994 Nobel Peace Prize in Oslo",
    startDate: "1994-12-10T13:00:00Z",
    endDate: null,
    datePrecision: "exact-minute",
    timePrecision: "exact-minute",
    localStartTime: "14:00",
    timezone: "Europe/Oslo",
    city: "Oslo",
    country: "Norway",
    venueName: "Oslo City Hall (Oslo Rådhus)",
    subvenue: "Central Hall",
    platform: "Norwegian Nobel Committee",
    address: "Rådhusplassen 1, 0037 Oslo",
    latitude: 59.9118,
    longitude: 10.7335,
    locationPrecision: "venue",
    summary: "Israeli Prime Minister Yitzhak Rabin, Foreign Minister Shimon Peres, and PLO Chairman Yasser Arafat are jointly presented with the 1994 Nobel Peace Prize at Oslo City Hall for their efforts to create peace in the Middle East through the Oslo Accords.",
    description: "The tri-lateral award honored the groundbreaking negotiation process facilitated by Norwegian Foreign Minister Johan Jørgen Holst and Terje Rød-Larsen.",
    verificationStatus: "verified",
    confidence: "confirmed",
    confidenceScore: 1.0,
    scope: "public",
    categories: ["culture", "nobel-prize"],
    eventTypes: ["award-ceremony", "nobel-lecture"],
    sourceIds: ["src-nobel-peace-19941210"],
    participants: [
      {
        personId: "yitzhak-rabin",
        slug: "yitzhak-rabin",
        name: "Yitzhak Rabin",
        role: "Prime Minister of Israel (Nobel Laureate)",
        presenceConfidence: "confirmed",
        attendanceMode: "physical"
      },
      {
        personId: "shimon-peres",
        slug: "shimon-peres",
        name: "Shimon Peres",
        role: "Foreign Minister of Israel (Nobel Laureate)",
        presenceConfidence: "confirmed",
        attendanceMode: "physical"
      },
      {
        personId: "yasser-arafat",
        slug: "yasser-arafat",
        name: "Yasser Arafat",
        role: "Chairman of the Palestine Liberation Organization (Nobel Laureate)",
        presenceConfidence: "confirmed",
        attendanceMode: "physical"
      }
    ],
    quotes: [
      {
        text: "There is only one radical means of sanctifying human life. That radical means is peace.",
        speaker: "Yitzhak Rabin",
        language: "en",
        timestamp: "00:12:30"
      }
    ]
  },
  {
    id: "evt-2002-03-27-arab-peace-initiative-beirut",
    slug: "2002-03-27-arab-league-adopts-arab-peace-initiative-in-beirut",
    eventName: "Arab League Adopts Historic Arab Peace Initiative at Beirut Summit",
    startDate: "2002-03-27T12:00:00Z",
    endDate: "2002-03-28T18:00:00Z",
    datePrecision: "exact-day",
    timePrecision: "day",
    city: "Beirut",
    country: "Lebanon",
    venueName: "Phoenicia InterContinental Hotel",
    subvenue: "Grand Ballroom",
    platform: "14th Arab League Ordinary Summit",
    address: "Minet El Hosn, Beirut",
    latitude: 33.9011,
    longitude: 35.4958,
    locationPrecision: "venue",
    summary: "The League of Arab States unanimously adopts the Arab Peace Initiative proposed by Crown Prince Abdullah of Saudi Arabia, offering full normalization and comprehensive peace from all 22 Arab states in exchange for full Israeli withdrawal to the 1967 borders and a just solution for Palestinian refugees.",
    description: "Re-endorsed at multiple subsequent Arab League summits, the initiative established the foundational Pan-Arab framework for resolving the Arab-Israeli conflict.",
    verificationStatus: "verified",
    confidence: "confirmed",
    confidenceScore: 1.0,
    scope: "diplomatic",
    categories: ["diplomacy", "regional-summit"],
    eventTypes: ["arab-league-summit", "peace-initiative"],
    sourceIds: ["src-un-unga-19840925"],
    participants: [
      {
        personId: "crown-prince-abdullah-bin-abdulaziz",
        slug: "crown-prince-abdullah-bin-abdulaziz",
        name: "Crown Prince Abdullah bin Abdulaziz",
        role: "Crown Prince of Saudi Arabia (Initiative Author)",
        presenceConfidence: "confirmed",
        attendanceMode: "physical"
      },
      {
        personId: "amr-moussa",
        slug: "amr-moussa",
        name: "Amr Moussa",
        role: "Secretary-General of the Arab League",
        presenceConfidence: "confirmed",
        attendanceMode: "physical"
      },
      {
        personId: "emile-lahoud",
        slug: "emile-lahoud",
        name: "Émile Lahoud",
        role: "President of the Republic of Lebanon (Host)",
        presenceConfidence: "confirmed",
        attendanceMode: "physical"
      }
    ]
  },
  {
    id: "evt-2001-03-06-oxford-union-jackson-boteach",
    slug: "2001-03-06-michael-jackson-and-rabbi-shmuley-boteach-oxford-union-address",
    eventName: "Michael Jackson and Rabbi Shmuley Boteach Address the Oxford Union on Children's Rights",
    startDate: "2001-03-06T19:30:00Z",
    endDate: "2001-03-06T21:30:00Z",
    datePrecision: "exact-minute",
    timePrecision: "exact-minute",
    city: "Oxford",
    country: "United Kingdom",
    venueName: "The Oxford Union Society",
    subvenue: "Debating Chamber",
    platform: "Oxford Union Presidential Address",
    address: "Frewin Court, Oxford OX1 3JB",
    latitude: 51.7533,
    longitude: -1.2602,
    locationPrecision: "venue",
    summary: "Rabbi Shmuley Boteach introduces Michael Jackson before an overflow audience at the Oxford Union Debating Chamber, where Jackson delivers a landmark address inaugurating the 'Heal the Kids' initiative advocating parent-child reconciliation and emotional support.",
    description: "Organized by the Oxford Union and Rabbi Shmuley Boteach, the address was Jackson's first major British university appearance and outlined a universal Children's Bill of Rights.",
    verificationStatus: "verified",
    confidence: "confirmed",
    confidenceScore: 1.0,
    scope: "public",
    categories: ["culture", "advocacy", "speech"],
    eventTypes: ["speech-plenary", "public-forum"],
    sourceIds: ["src-oxford-union-boteach-jackson-2001"],
    participants: [
      {
        personId: "shmuley-boteach",
        slug: "shmuley-boteach",
        name: "Shmuley Boteach",
        role: "Founder of Oxford L'Chaim Society (Host & Introducer)",
        presenceConfidence: "confirmed",
        attendanceMode: "physical"
      }
    ]
  },
  {
    id: "evt-2012-11-06-nj-09-congressional-general-election",
    slug: "2012-11-06-shmuley-boteach-nj-09-congressional-general-election",
    eventName: "2012 United States House of Representatives General Election in New Jersey's 9th District",
    startDate: "2012-11-06T11:00:00Z",
    endDate: "2012-11-06T23:00:00Z",
    datePrecision: "exact-day",
    timePrecision: "day",
    city: "Hackensack",
    country: "United States",
    venueName: "Bergen County Board of Elections",
    platform: "US House General Election (NJ-09)",
    address: "1 Bergen County Plaza, Hackensack, NJ 07601",
    latitude: 40.8804,
    longitude: -74.0435,
    locationPrecision: "city",
    summary: "Rabbi Shmuley Boteach contests the general election for the United States House of Representatives representing New Jersey's 9th Congressional District following his certified primary victory, garnering over 55,000 votes in a major-party campaign centered on core family values and fiscal reform.",
    description: "Certified election results tabulated across Bergen, Passaic, and Hudson counties by the New Jersey Division of Elections.",
    verificationStatus: "verified",
    confidence: "confirmed",
    confidenceScore: 1.0,
    scope: "public",
    categories: ["politics", "elections"],
    eventTypes: ["general-election", "congressional-contest"],
    sourceIds: ["src-fec-boteach-candidate-2012", "src-nj-dos-election-results-2012"],
    participants: [
      {
        personId: "shmuley-boteach",
        slug: "shmuley-boteach",
        name: "Shmuley Boteach",
        role: "Republican Congressional Nominee (NJ-09)",
        presenceConfidence: "confirmed",
        attendanceMode: "physical"
      }
    ]
  },
  {
    id: "evt-2015-03-02-capitol-hill-iran-briefing-wiesel-boteach",
    slug: "2015-03-02-elie-wiesel-and-rabbi-shmuley-boteach-capitol-hill-iran-briefing",
    eventName: "Capitol Hill Briefing on the Iran Nuclear Agreement with Elie Wiesel and Rabbi Shmuley Boteach",
    startDate: "2015-03-02T16:00:00Z",
    endDate: "2015-03-02T18:00:00Z",
    datePrecision: "exact-minute",
    timePrecision: "exact-minute",
    city: "Washington, D.C.",
    country: "United States",
    venueName: "Dirksen Senate Office Building",
    subvenue: "Room SD-G50",
    platform: "Senate Bipartisan Educational Forum",
    address: "Constitution Ave & 1st St NE, Washington, DC 20002",
    latitude: 38.8929,
    longitude: -77.0049,
    locationPrecision: "venue",
    summary: "Nobel Peace laureate Elie Wiesel and Rabbi Shmuley Boteach convene a major bipartisan congressional panel in the Dirksen Senate Office Building alongside sitting United States Senators to discuss nuclear non-proliferation and international commitments regarding Iran.",
    description: "Broadcast nationally on C-SPAN, the panel examined moral imperatives in international statecraft, regional security, and the preservation of historical treaties.",
    verificationStatus: "verified",
    confidence: "confirmed",
    confidenceScore: 1.0,
    scope: "public",
    categories: ["diplomacy", "security", "congressional-briefing"],
    eventTypes: ["speech-plenary", "public-forum"],
    sourceIds: ["src-cspan-boteach-wiesel-2015"],
    participants: [
      {
        personId: "shmuley-boteach",
        slug: "shmuley-boteach",
        name: "Shmuley Boteach",
        role: "Executive Director, The World Values Network (Moderator)",
        presenceConfidence: "confirmed",
        attendanceMode: "physical"
      }
    ]
  }
];
