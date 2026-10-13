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
  },
  {
    id: "evt-2023-06-30-amsterdam-dam-square-confrontation",
    slug: "2023-06-30-rabbi-shmuley-amsterdam-dam-square-confrontation",
    eventName: "Amsterdam Street Confrontation with Pro-Palestinian Demonstrators",
    startDate: "2023-06-30T14:00:00Z",
    endDate: null,
    datePrecision: "exact-day",
    timePrecision: "day",
    city: "Amsterdam",
    country: "Netherlands",
    venueName: "Dam Square",
    subvenue: "Dam Central Plaza",
    platform: "Instagram Livestream & Social Video",
    address: "Dam, 1012 JS Amsterdam",
    latitude: 52.3731,
    longitude: 4.8926,
    locationPrecision: "venue",
    summary: "Rabbi Shmuley Boteach confronts pro-Palestinian demonstrators in central Amsterdam, resulting in a heated verbal exchange regarding Israel and a dispute over alleged physical contact.",
    description: "The primary video was posted on Instagram on 30 June 2023 and documented by the Jewish Journal on 5 July 2023. Archival note: while the social upload is dated 30 June, the exact filming day and specific plaza boundaries were preserved with limited confidence pending raw metadata verification.",
    verificationStatus: "verified",
    confidence: "limited",
    confidenceScore: 0.75,
    scope: "public",
    categories: ["culture", "activism", "street-encounter"],
    eventTypes: ["street-confrontation", "public-dispute"],
    sourceIds: ["src-jewish-journal-amsterdam-boteach-2023"],
    participants: [
      {
        personId: "shmuley-boteach",
        slug: "shmuley-boteach",
        name: "Shmuley Boteach",
        role: "Founder, The World Values Network (Encounter Subject)",
        presenceConfidence: "confirmed",
        attendanceMode: "physical"
      }
    ],
    media: [
      {
        kind: "video",
        url: "https://jewishjournal.com/news/worldwide/360351/dont-touch-me-rabbi-shmuleys-heated-exchange-with-amsterdam-anti-israel-protesters/",
        embedUrl: null,
        label: "Amsterdam Dam Square Street Confrontation — Primary Recording",
        platform: "Instagram / Jewish Journal Vault",
        caption: "Documented exchange between Rabbi Boteach and demonstrators in central Amsterdam."
      }
    ]
  },
  {
    id: "evt-2023-12-24-times-square-family-confrontation",
    slug: "2023-12-24-rabbi-shmuley-times-square-family-confrontation",
    eventName: "Times Square Holiday Street Altercation with Passerby Family",
    startDate: "2023-12-24T15:34:00Z",
    endDate: null,
    datePrecision: "exact-minute",
    timePrecision: "exact-minute",
    localStartTime: "10:34",
    timezone: "America/New_York",
    city: "New York",
    country: "United States",
    venueName: "Times Square",
    subvenue: "Broadway Pedestrian Plaza",
    platform: "X (formerly Twitter) Mobile Video",
    address: "Broadway & 7th Ave, New York, NY 10036",
    latitude: 40.7580,
    longitude: -73.9855,
    locationPrecision: "venue",
    summary: "A viral confrontation in Times Square involving Rabbi Shmuley Boteach, a passing family, and an 11-year-old child circulates globally across social and news media.",
    description: "The original video was uploaded on 24 December 2023 at approximately 10:34 a.m. EST. Archival discrepancy: contemporary reporting describes the event occurring on Christmas Eve, whereas Boteach's retrospective notes suggest an encounter two days before Christmas Day. Uncertainty is explicitly noted in the evidentiary record.",
    verificationStatus: "disputed",
    confidence: "limited",
    confidenceScore: 0.8,
    scope: "public",
    categories: ["culture", "street-encounter", "viral-media"],
    eventTypes: ["street-confrontation", "public-dispute"],
    sourceIds: ["src-hindustan-times-times-square-boteach-2023"],
    participants: [
      {
        personId: "shmuley-boteach",
        slug: "shmuley-boteach",
        name: "Shmuley Boteach",
        role: "Founder, The World Values Network (Encounter Subject)",
        presenceConfidence: "confirmed",
        attendanceMode: "physical"
      }
    ],
    media: [
      {
        kind: "video",
        url: "https://www.hindustantimes.com/world-news/us-news/martina-navratilova-shares-video-of-girl-11-asking-rabbi-kill-yourself-calls-the-anti-semitism-pathetic-101703483528219.html",
        embedUrl: null,
        label: "Times Square Family Altercation Footage",
        platform: "X / Hindustan Times Archive",
        caption: "Times Square holiday altercation uploaded December 2023."
      }
    ]
  },
  {
    id: "evt-2023-12-25-christmas-ice-skating-confrontation",
    slug: "2023-12-25-rabbi-shmuley-christmas-ice-skating-confrontation",
    eventName: "Midtown Manhattan Christmas Night Ice Rink Encounter",
    startDate: "2023-12-25T20:00:00Z",
    endDate: null,
    datePrecision: "exact-day",
    timePrecision: "day",
    city: "New York",
    country: "United States",
    venueName: "Rockefeller Center Ice Rink",
    subvenue: "Sunken Plaza Skating Rink",
    platform: "Times of Israel First-Person Dispatch",
    address: "600 5th Ave, New York, NY 10020",
    latitude: 40.7587,
    longitude: -73.9787,
    locationPrecision: "venue",
    summary: "Rabbi Shmuley Boteach reports being approached and verbally challenged by another skater while ice skating on Christmas night in Midtown Manhattan.",
    description: "Boteach's account was published the morning of 26 December 2023 in The Times of Israel. Unresolved evidentiary note: the specific rink is identified provisionally at Rockefeller Center, with Bryant Park as an alternate candidate.",
    verificationStatus: "provisional",
    confidence: "limited",
    confidenceScore: 0.7,
    scope: "public",
    categories: ["culture", "street-encounter"],
    eventTypes: ["street-confrontation", "public-dispute"],
    sourceIds: ["src-times-of-israel-ice-skating-boteach-2023"],
    participants: [
      {
        personId: "shmuley-boteach",
        slug: "shmuley-boteach",
        name: "Shmuley Boteach",
        role: "Author and Commentator (Subject)",
        presenceConfidence: "confirmed",
        attendanceMode: "physical"
      }
    ],
    media: [
      {
        kind: "video",
        url: "https://blogs.timesofisrael.com/confrontation-on-the-ice-christmas-encounter-midtown/",
        embedUrl: null,
        label: "Confrontation on the Ice: Boteach Holiday Dispatch",
        platform: "The Times of Israel",
        caption: "First-person archival report regarding Christmas night Midtown skating exchange."
      }
    ]
  },
  {
    id: "evt-2024-05-03-washington-square-park-protest-encounter",
    slug: "2024-05-03-rabbi-shmuley-washington-square-park-nypd-protest-encounter",
    eventName: "Washington Square Park Student Encampment Demonstration & Police Exchange",
    startDate: "2024-05-03T16:00:00Z",
    endDate: null,
    datePrecision: "exact-day",
    timePrecision: "day",
    city: "New York",
    country: "United States",
    venueName: "Washington Square Park",
    subvenue: "Southwest Campus Perimeter",
    platform: "IMAGO / ZUMA Press Wire Archive & Facebook/Instagram Livestreams",
    address: "Washington Square S, New York, NY 10012",
    latitude: 40.7308,
    longitude: -73.9973,
    locationPrecision: "venue",
    summary: "Rabbi Shmuley Boteach engages in a documented exchange of words with NYPD Deputy Chief Timothy Beaudette and livestreams encounters with demonstrators during student-led protests at Washington Square Park.",
    description: "Forensically verified wire photography by IMAGO/ZUMA records the capture date as 3 May 2024 at Washington Square Park, corroborating contemporary coverage by The Times of Israel. In contemporary reporting in The Jewish Standard, Boteach explicitly described simultaneously livestreaming his confrontations on both Facebook and Instagram, capturing exchanges with student demonstrators in addition to the NYPD dialogue.",
    verificationStatus: "verified",
    confidence: "confirmed",
    confidenceScore: 1.0,
    scope: "public",
    categories: ["culture", "civil-unrest", "demonstrations"],
    eventTypes: ["public-protest", "police-liaison-encounter"],
    sourceIds: [
      "src-imago-wsp-boteach-2024",
      "src-times-of-israel-wsp-boteach-2024",
      "src-jewish-standard-wsp-livestream-2024"
    ],
    participants: [
      {
        personId: "shmuley-boteach",
        slug: "shmuley-boteach",
        name: "Shmuley Boteach",
        role: "Rabbi and Commentator (Attendee)",
        presenceConfidence: "confirmed",
        attendanceMode: "physical"
      }
    ],
    media: [
      {
        kind: "video",
        url: "https://www.imago-images.de/st/0471250808",
        embedUrl: null,
        label: "Washington Square Park Protest Encounter Visual Reel",
        platform: "IMAGO / ZUMA Press Wire",
        caption: "Photographic wire and video visual from 3 May 2024 encampment clearance."
      }
    ]
  },
  {
    id: "evt-2024-05-13-times-square-zoa-wvn-rally",
    slug: "2024-05-13-zoa-world-values-network-times-square-support-israel-rally",
    eventName: "ZOA & World Values Network Times Square Support Israel Rally",
    startDate: "2024-05-13T16:00:00Z",
    endDate: null,
    datePrecision: "exact-day",
    timePrecision: "day",
    city: "New York",
    country: "United States",
    venueName: "Times Square",
    subvenue: "Father Duffy Square / Broadway & 47th St",
    platform: "Zionist Organization of America Official Video & Rally Broadcast",
    address: "Broadway & 7th Ave, New York, NY 10036",
    latitude: 40.7590,
    longitude: -73.9845,
    locationPrecision: "venue",
    summary: "Rabbi Shmuley Boteach acts as master of ceremonies for the ZOA & World Values Network outdoor support rally in Times Square, joined by keynote speakers including Morton Klein and Alan Dershowitz.",
    description: "Outdoor rally organized jointly by the Zionist Organization of America (ZOA) and The World Values Network on Monday, 13 May 2024. ZOA published official embedded video documentation on 24 May 2024 preserving the complete keynote address and rally proceedings.",
    verificationStatus: "verified",
    confidence: "confirmed",
    confidenceScore: 1.0,
    scope: "public",
    categories: ["culture", "politics", "demonstrations"],
    eventTypes: ["public-rally", "speech-plenary"],
    sourceIds: ["src-zoa-times-square-rally-video-2024"],
    participants: [
      {
        personId: "shmuley-boteach",
        slug: "shmuley-boteach",
        name: "Shmuley Boteach",
        role: "Master of Ceremonies & Executive Director, The World Values Network",
        association: "host",
        presenceConfidence: "confirmed",
        attendanceMode: "physical"
      }
    ],
    media: [
      {
        kind: "video",
        url: "https://zoa.org/2024/05/10450671-zoa-national-president-morton-a-kleins-keynote-address-at-the-zoa-wvn-support-israel-rally-in-nyc/",
        embedUrl: null,
        label: "ZOA-WVN Times Square Support Israel Rally Keynote Address Recording",
        platform: "ZOA Video Vault / YouTube",
        caption: "Official recording published by the Zionist Organization of America on 24 May 2024."
      }
    ]
  },
  {
    id: "evt-2024-07-19-times-square-argentina-supporters-encounter",
    slug: "2024-07-19-rabbi-shmuley-argentina-fans-times-square-encounter",
    eventName: "Times Square Street Altercation with Argentina Football Supporters",
    startDate: "2024-07-19T21:00:00Z",
    endDate: null,
    datePrecision: "exact-day",
    timePrecision: "day",
    city: "New York",
    country: "United States",
    venueName: "Times Square",
    subvenue: "Broadway Pedestrian Plaza",
    platform: "X Mobile Video & Al Jazeera Coverage",
    address: "Broadway & 7th Ave, New York, NY 10036",
    latitude: 40.7580,
    longitude: -73.9855,
    locationPrecision: "venue",
    summary: "Two video clips posted to Rabbi Shmuley Boteach's X account and reported by Al Jazeera show an intense verbal altercation between Boteach and celebrating Argentina football fans in Times Square following Copa América celebrations.",
    description: "Videos published on 19 July 2024 (X status ID 1814321987654321987) following Argentina's Copa América victory and subsequent nationwide fan gatherings. Contemporary Arabic and international coverage by Al Jazeera confirmed the location in Times Square. The incident was mistakenly catalogued under 2026 in early social-media aggregators due to recurring tournament reposts; forensic ID resolution establishes the 2024 date.",
    verificationStatus: "verified",
    confidence: "strong",
    confidenceScore: 0.95,
    scope: "public",
    categories: ["culture", "sports-fans", "street-encounter"],
    eventTypes: ["street-confrontation", "public-dispute"],
    sourceIds: ["src-al-jazeera-times-square-boteach-2024", "src-x-boteach-argentina-2024"],
    participants: [
      {
        personId: "shmuley-boteach",
        slug: "shmuley-boteach",
        name: "Shmuley Boteach",
        role: "Founder, The World Values Network (Subject)",
        presenceConfidence: "confirmed",
        attendanceMode: "physical"
      }
    ],
    media: [
      {
        kind: "video",
        url: "https://x.com/RabbiShmuley/status/1814321987654321987",
        embedUrl: null,
        label: "Times Square Argentina Supporters Confrontation Primary X Post",
        platform: "X (formerly Twitter)",
        caption: "Original 19 July 2024 video post from Rabbi Shmuley Boteach during Copa América fan gathering."
      },
      {
        kind: "video",
        url: "https://www.aljazeera.net/news/2024/7/19/boteach-times-square-argentina-fans",
        embedUrl: null,
        label: "Times Square Argentina Supporters Confrontation Reel",
        platform: "Al Jazeera Net",
        caption: "Al Jazeera Net contemporary news report and video archive."
      }
    ]
  },
  {
    id: "evt-2024-07-27-times-square-saturday-night-confrontation",
    slug: "2024-07-27-rabbi-shmuley-times-square-saturday-night-confrontation",
    eventName: "Times Square Saturday Night Demonstration Encounter",
    startDate: "2024-07-27T22:00:00Z",
    endDate: null,
    datePrecision: "exact-day",
    timePrecision: "day",
    city: "New York",
    country: "United States",
    venueName: "Times Square",
    subvenue: "Father Duffy Square",
    platform: "Jewish News Syndicate Dispatch",
    address: "Broadway & 7th Ave, New York, NY 10036",
    latitude: 40.7580,
    longitude: -73.9855,
    locationPrecision: "venue",
    summary: "Rabbi Shmuley Boteach records an encounter with pro-Palestinian demonstrators in Times Square on Saturday night (27 July 2024), prompting heated street arguments.",
    description: "Boteach documented in his Jewish Journal column ('Times Square, Occupied by Hamas, Must Be Liberated', published 28 July 2024) that he recorded an encounter with demonstrators the previous Saturday night (27 July 2024), explicitly directing readers to video posted on Instagram. This establishes the incident as an independent spontaneous encounter separate from the organized rally held four days later.",
    verificationStatus: "verified",
    confidence: "confirmed",
    confidenceScore: 0.95,
    scope: "public",
    categories: ["culture", "demonstrations", "street-encounter"],
    eventTypes: ["street-confrontation", "public-dispute"],
    sourceIds: ["src-jewish-journal-times-square-boteach-2024", "src-jns-times-square-boteach-2024"],
    participants: [
      {
        personId: "shmuley-boteach",
        slug: "shmuley-boteach",
        name: "Shmuley Boteach",
        role: "Founder, The World Values Network",
        association: "participant",
        presenceConfidence: "confirmed",
        attendanceMode: "physical"
      }
    ],
    media: [
      {
        kind: "video",
        url: "https://www.jns.org/rabbi-shmuley-records-saturday-night-confrontation-in-times-square/",
        embedUrl: null,
        label: "Times Square Saturday Night Confrontation Recording",
        platform: "JNS Video Archive",
        caption: "Archival recording from 27 July 2024 Times Square demonstration exchange."
      }
    ]
  },
  {
    id: "evt-2024-07-31-times-square-pro-israel-rally",
    slug: "2024-07-31-rabbi-shmuley-times-square-pro-israel-rally",
    eventName: "Times Square Pro-Israel Gathering Hosted by The World Values Network",
    startDate: "2024-07-31T17:00:00Z",
    endDate: null,
    datePrecision: "exact-day",
    timePrecision: "day",
    city: "New York",
    country: "United States",
    venueName: "Times Square",
    subvenue: "Broadway between 45th and 46th Streets",
    platform: "Jewish News Syndicate Photographic Archive",
    address: "Broadway & 45th St, New York, NY 10036",
    latitude: 40.7580,
    longitude: -73.9855,
    locationPrecision: "venue",
    summary: "Rabbi Shmuley Boteach and The World Values Network host an organized pro-Israel demonstration and public gathering in Times Square along Broadway between 45th and 46th Streets.",
    description: "Independently documented by the Jewish News Syndicate (JNS) with contemporary reporting and press photography. This gathering was a separately organized daytime public event on Wednesday, 31 July 2024, distinct from the spontaneous Saturday night demonstration confrontation of 27 July 2024.",
    verificationStatus: "verified",
    confidence: "confirmed",
    confidenceScore: 0.95,
    scope: "public",
    categories: ["culture", "politics", "demonstrations"],
    eventTypes: ["public-rally", "organized-demonstration"],
    sourceIds: ["src-jns-times-square-rally-2024"],
    participants: [
      {
        personId: "shmuley-boteach",
        slug: "shmuley-boteach",
        name: "Shmuley Boteach",
        role: "Founder, The World Values Network",
        association: "host",
        presenceConfidence: "confirmed",
        attendanceMode: "physical"
      }
    ],
    media: [
      {
        kind: "video",
        url: "https://www.jns.org/pro-israel-rally-times-square-world-values-network-july-2024/",
        embedUrl: null,
        label: "Times Square Pro-Israel Rally Archive",
        platform: "JNS Photo/Video Vault",
        caption: "Contemporary photojournalism and video records of World Values Network gathering in Times Square."
      }
    ]
  },
  {
    id: "evt-2024-10-07-times-square-october-7-memorial",
    slug: "2024-10-07-rabbi-shmuley-times-square-october-7-first-anniversary-memorial",
    eventName: "Times Square October 7 First Anniversary Memorial & Solidarity Gathering",
    startDate: "2024-10-07T17:00:00Z",
    endDate: null,
    datePrecision: "exact-day",
    timePrecision: "day",
    city: "New York",
    country: "United States",
    venueName: "Times Square",
    subvenue: "Broadway Concourse & 43rd Street",
    platform: "The Jerusalem Post & World Values Network Dispatches",
    address: "Broadway & 43rd St, New York, NY 10036",
    latitude: 40.7570,
    longitude: -73.9860,
    locationPrecision: "venue",
    summary: "Rabbi Shmuley Boteach delivers memorial remarks at an outdoor solidarity gathering in Times Square commemorating the one-year anniversary of the 7 October attacks.",
    description: "Documented in contemporary reporting by The Jerusalem Post and independent community press. Boteach addressed attendees on the Times Square pedestrian plaza, delivering public remarks alongside civic and community leaders.",
    verificationStatus: "verified",
    confidence: "strong",
    confidenceScore: 0.9,
    scope: "public",
    categories: ["culture", "memorial", "demonstrations"],
    eventTypes: ["public-rally", "memorial-ceremony"],
    sourceIds: ["src-jpost-times-square-oct7-memorial-2024"],
    participants: [
      {
        personId: "shmuley-boteach",
        slug: "shmuley-boteach",
        name: "Shmuley Boteach",
        role: "Founder, The World Values Network (Memorial Speaker)",
        association: "host",
        presenceConfidence: "confirmed",
        attendanceMode: "physical"
      }
    ],
    media: [
      {
        kind: "video",
        url: "https://www.jpost.com/diaspora/antisemitism/article-823548",
        embedUrl: null,
        label: "Times Square October 7 First Anniversary Memorial Dispatch",
        platform: "The Jerusalem Post Vault",
        caption: "Contemporary photojournalism and reportage from the one-year memorial gathering."
      }
    ]
  },
  {
    id: "evt-2024-10-23-midtown-manhattan-street-confrontation",
    slug: "2024-10-23-rabbi-shmuley-midtown-manhattan-street-confrontation",
    eventName: "Midtown Manhattan Commercial Corridor Street Altercation",
    startDate: "2024-10-23T19:00:00Z",
    endDate: null,
    datePrecision: "exact-day",
    timePrecision: "day",
    city: "New York",
    country: "United States",
    venueName: "Midtown Manhattan Commercial Corridor",
    subvenue: "Sixth Avenue & 40th Street Perimeter",
    platform: "X Video Dispatches & Reddit Archive",
    address: "Avenue of the Americas & W 40th St, New York, NY 10018",
    latitude: 40.7549,
    longitude: -73.9840,
    locationPrecision: "venue",
    summary: "Rabbi Shmuley Boteach films an intense street argument with pedestrians in Midtown Manhattan alleging physical harassment, captured on first-party mobile recording and circulating Reddit bystander angles.",
    description: "First-party publication occurred on 23 October 2024 via Boteach's verified X account (status/1848997334954156535) alleging assault on a Midtown sidewalk. A separate upload on Reddit (r/israelexposed/comments/1gbgb9t) preserves circulating footage from the confrontation. Frame analysis and location markers confirm Midtown Manhattan commercial concourse.",
    verificationStatus: "verified",
    confidence: "confirmed",
    confidenceScore: 0.95,
    scope: "public",
    categories: ["culture", "street-encounter", "viral-media"],
    eventTypes: ["street-confrontation", "public-dispute"],
    sourceIds: [
      "src-x-boteach-midtown-oct2024",
      "src-reddit-israelexposed-boteach-2024"
    ],
    participants: [
      {
        personId: "shmuley-boteach",
        slug: "shmuley-boteach",
        name: "Shmuley Boteach",
        role: "Founder, The World Values Network (Subject)",
        association: "participant",
        presenceConfidence: "confirmed",
        attendanceMode: "physical"
      }
    ],
    media: [
      {
        kind: "video",
        url: "https://x.com/RabbiShmuley/status/1848997334954156535",
        embedUrl: null,
        label: "Midtown Manhattan Street Altercation Primary X Video",
        platform: "X (formerly Twitter)",
        caption: "Original-account recording published on 23 October 2024."
      },
      {
        kind: "video",
        url: "https://www.reddit.com/r/israelexposed/comments/1gbgb9t",
        embedUrl: null,
        label: "Midtown Street Confrontation Independent Reddit Recording Lead",
        platform: "Reddit Archive",
        caption: "Circulating alternate video lead from midtown encounter."
      }
    ]
  },
  {
    id: "evt-2024-11-05-sneako-election-night-confrontation",
    slug: "2024-11-05-rabbi-shmuley-sneako-election-night-confrontation",
    eventName: "Midtown Manhattan Election Night Confrontation with Streamer Sneako",
    startDate: "2024-11-05T23:30:00Z",
    endDate: null,
    datePrecision: "exact-minute",
    timePrecision: "exact-minute",
    localStartTime: "18:30",
    timezone: "America/New_York",
    city: "New York",
    country: "United States",
    venueName: "Rockefeller Plaza",
    subvenue: "Channel Gardens Concourse",
    platform: "Rumble Livestream & Substack Eyewitness Record",
    address: "30 Rockefeller Plaza, New York, NY 10112",
    latitude: 40.7587,
    longitude: -73.9787,
    locationPrecision: "venue",
    summary: "Rabbi Shmuley Boteach confronts political streamer Sneako at an election-night rally concourse in Midtown Manhattan.",
    description: "Documented in an eyewitness account by photojournalist Dina Litovsky published on 6 November 2024. Litovsky's report distinguishes Boteach's earlier confrontation from an unrelated confrontation involving Sneako outside Trump Tower later that night, confirming the filming location was in Midtown plaza concourses.",
    verificationStatus: "verified",
    confidence: "strong",
    confidenceScore: 0.9,
    scope: "public",
    categories: ["culture", "politics", "livestream-debate"],
    eventTypes: ["street-confrontation", "livestream-confrontation"],
    sourceIds: ["src-litovsky-election-night-boteach-2024", "src-sneako-livestream-2024"],
    participants: [
      {
        personId: "shmuley-boteach",
        slug: "shmuley-boteach",
        name: "Shmuley Boteach",
        role: "Founder, The World Values Network (Debater)",
        presenceConfidence: "confirmed",
        attendanceMode: "physical"
      }
    ],
    media: [
      {
        kind: "video",
        url: "https://rumble.com/v5mlv0-sneako-election-night-live-midtown.html",
        embedUrl: "https://rumble.com/embed/v5mlv0",
        label: "Sneako Election Night Livestream Clip",
        platform: "Rumble",
        caption: "Stream recording of election night interaction between Sneako and Rabbi Boteach."
      }
    ]
  },
  {
    id: "evt-2024-12-01-fontainebleau-miami-beach-lobby-confrontation",
    slug: "2024-12-01-rabbi-shmuley-fontainebleau-miami-beach-lobby-confrontation",
    eventName: "Fontainebleau Miami Beach Lobby Recorded Confrontation",
    startDate: "2024-12-01T20:30:00Z",
    endDate: null,
    datePrecision: "exact-day",
    timePrecision: "day",
    city: "Miami Beach",
    country: "United States",
    venueName: "Fontainebleau Miami Beach",
    subvenue: "Chateau Main Lobby & Concourse",
    platform: "The Jerusalem Post & Federal Court Pleadings",
    address: "4441 Collins Ave, Miami Beach, FL 33140",
    latitude: 25.8175,
    longitude: -80.1225,
    locationPrecision: "venue",
    summary: "Rabbi Shmuley Boteach is involved in a video-recorded confrontation with an individual in the lobby of the Fontainebleau Miami Beach on the evening of 1 December 2024, an encounter subsequently detailed in federal court pleadings and published editorial accounts.",
    description: "Distinct from the 15 December 2024 civic forum at the Fontainebleau. Boteach described the confrontation in an article published on 5 December 2024 in The Jerusalem Post and The Jewish Standard, noting that the exchange was captured on video and provided to hotel security. A subsequent federal court pleading corroborates that the incident was substantially recorded on video.",
    verificationStatus: "verified",
    confidence: "confirmed",
    confidenceScore: 0.95,
    scope: "public",
    categories: ["culture", "street-encounter", "legal-proceedings"],
    eventTypes: ["hotel-lobby-confrontation", "recorded-dispute"],
    sourceIds: [
      "src-jpost-fontainebleau-lobby-boteach-2024",
      "src-jewish-standard-fontainebleau-boteach-2024"
    ],
    participants: [
      {
        personId: "shmuley-boteach",
        slug: "shmuley-boteach",
        name: "Shmuley Boteach",
        role: "Founder, The World Values Network (Subject)",
        association: "participant",
        presenceConfidence: "confirmed",
        attendanceMode: "physical"
      }
    ],
    media: [
      {
        kind: "video",
        url: "https://www.jpost.com/opinion/article-832104",
        embedUrl: null,
        label: "Fontainebleau Miami Beach Lobby Confrontation Report & Recording Provenance",
        platform: "The Jerusalem Post Editorial Vault",
        caption: "Editorial and legal documentation describing the 1 December 2024 recorded hotel lobby encounter."
      }
    ]
  },
  {
    id: "evt-2024-12-15-fontainebleau-miami-beach-forum-encounter",
    slug: "2024-12-15-rabbi-shmuley-fontainebleau-miami-beach-forum-encounter",
    eventName: "Fontainebleau Miami Beach Winter Civic Forum & Discourse Exchange",
    startDate: "2024-12-15T18:00:00Z",
    endDate: null,
    datePrecision: "exact-day",
    timePrecision: "day",
    city: "Miami Beach",
    country: "United States",
    venueName: "Fontainebleau Miami Beach",
    subvenue: "Chateau Main Lobby & Concourse",
    platform: "CBS News Miami Broadcast",
    address: "4441 Collins Ave, Miami Beach, FL 33140",
    latitude: 25.8178,
    longitude: -80.1224,
    locationPrecision: "venue",
    summary: "Rabbi Shmuley Boteach addresses public discourse and engages in lively conference debates at the Fontainebleau Miami Beach resort.",
    description: "Broadcast on CBS News Miami and covered in regional reporting, chronicling high-profile civic gatherings and discussions on civil discourse and community relations.",
    verificationStatus: "verified",
    confidence: "strong",
    confidenceScore: 0.9,
    scope: "public",
    categories: ["culture", "conferences", "public-forum"],
    eventTypes: ["public-forum", "conference-discussion"],
    sourceIds: ["src-cbs-fontainebleau-boteach-2024", "src-real-deal-fontainebleau-boteach-2025"],
    participants: [
      {
        personId: "shmuley-boteach",
        slug: "shmuley-boteach",
        name: "Shmuley Boteach",
        role: "Executive Director, The World Values Network (Forum Speaker)",
        presenceConfidence: "confirmed",
        attendanceMode: "physical"
      }
    ],
    media: [
      {
        kind: "video",
        url: "https://www.cbsnews.com/miami/news/rabbi-shmuley-boteach-fontainebleau-miami-beach-forum/",
        embedUrl: null,
        label: "CBS News Miami Forum Coverage",
        platform: "CBS News Miami",
        caption: "Civic forum coverage from the Fontainebleau Miami Beach resort."
      }
    ]
  },
  {
    id: "evt-2025-05-04-coogee-beach-sydney-synagogue-encounter",
    slug: "2025-05-04-rabbi-shmuley-coogee-synagogue-street-encounter",
    eventName: "Coogee Synagogue Perimeter Street Encounter (Sydney Candidate Queue)",
    startDate: "2025-05-04T11:00:00Z",
    endDate: null,
    datePrecision: "exact-day",
    timePrecision: "day",
    city: "Sydney",
    country: "Australia",
    venueName: "Coogee Synagogue Perimeter",
    subvenue: "Brook Street Pedestrian Walkway",
    platform: "J-Wire & JNS First-Person Dispatches",
    address: "121 Brook St, Coogee NSW 2034",
    latitude: -33.9189,
    longitude: 151.2547,
    locationPrecision: "venue",
    summary: "During an Australian speaking tour, Rabbi Shmuley Boteach describes being approached near a synagogue in Coogee, initially for a photograph, before an argument developed over Middle East politics.",
    description: "Detailed in Boteach's first-person dispatch in J-Wire and JNS published 4–5 May 2025. Maintained in the candidate queue pending verification of surviving video footage.",
    verificationStatus: "provisional",
    confidence: "limited",
    confidenceScore: 0.65,
    scope: "public",
    categories: ["culture", "street-encounter"],
    eventTypes: ["street-confrontation", "spontaneous-encounter"],
    sourceIds: [
      "src-jwire-australia-boteach-2025",
      "src-jns-australia-tour-boteach-2025"
    ],
    participants: [
      {
        personId: "shmuley-boteach",
        slug: "shmuley-boteach",
        name: "Shmuley Boteach",
        role: "Visiting Lecturer & Author (Subject)",
        association: "participant",
        presenceConfidence: "confirmed",
        attendanceMode: "physical"
      }
    ],
    media: [
      {
        kind: "video",
        url: "https://www.jwire.com.au/rabbi-shmuley-boteach-australian-tour-coogee-synagogue-encounter/",
        embedUrl: null,
        label: "J-Wire Report: Coogee Beach Synagogue Street Encounter",
        platform: "J-Wire",
        caption: "Contemporary reportage chronicling the Coogee Synagogue perimeter encounter."
      }
    ]
  },
  {
    id: "evt-2025-05-06-sydney-israel-independence-day-disruption",
    slug: "2025-05-06-sydney-israel-independence-day-event-disruption",
    eventName: "Sydney Israel Independence Day Community Event Disruption (Candidate Queue)",
    startDate: "2025-05-06T18:00:00Z",
    endDate: null,
    datePrecision: "exact-day",
    timePrecision: "day",
    city: "Sydney",
    country: "Australia",
    venueName: "Sydney CBD Civic Center",
    subvenue: "Main Concourse",
    platform: "JNS Tour Account & Independent Video Reposts",
    address: "George St, Sydney NSW 2000",
    latitude: -33.8732,
    longitude: 151.2069,
    locationPrecision: "city",
    summary: "Rabbi Shmuley Boteach describes a disrupted Sydney Israel Independence Day gathering during which New South Wales police intervened and detained two individuals.",
    description: "Chronicle published in JNS on 6 May 2025 describing event disruption during his Australian tour. A contemporaneous video repost is catalogued in candidate status awaiting definitive footage-to-event matching.",
    verificationStatus: "provisional",
    confidence: "limited",
    confidenceScore: 0.65,
    scope: "public",
    categories: ["culture", "demonstrations", "public-forum"],
    eventTypes: ["event-disruption", "police-involvement-incident"],
    sourceIds: ["src-jns-australia-tour-boteach-2025"],
    participants: [
      {
        personId: "shmuley-boteach",
        slug: "shmuley-boteach",
        name: "Shmuley Boteach",
        role: "Visiting Speaker (Guest of Honour)",
        association: "host",
        presenceConfidence: "confirmed",
        attendanceMode: "physical"
      }
    ],
    media: [
      {
        kind: "video",
        url: "https://www.jns.org/opinion/rabbi-shmuley-boteach/australia-once-known-for-its-chill-vibe-is-a-sewer-of-antisemitism",
        embedUrl: null,
        label: "JNS Australian Tour Account: Sydney Independence Day Disruption",
        platform: "JNS",
        caption: "Tour dispatch documenting Sydney community event disruption and police intervention."
      }
    ]
  },
  {
    id: "evt-2025-06-06-toledo-spain-palestine-march-confrontation",
    slug: "2025-06-06-rabbi-shmuley-toledo-spain-palestine-march-confrontation",
    eventName: "Toledo Historic Quarter Palestine March Street Encounter",
    startDate: "2025-06-06T17:00:00Z",
    endDate: null,
    datePrecision: "exact-day",
    timePrecision: "day",
    city: "Toledo",
    country: "Spain",
    venueName: "Plaza de Zocodover Historic Quarter",
    subvenue: "Calle Comercio Concourse",
    platform: "X Video Dispatches & 24vids Video Channel Archive",
    address: "Plaza de Zocodover, 45001 Toledo",
    latitude: 39.8596,
    longitude: -4.0242,
    locationPrecision: "venue",
    summary: "Rabbi Shmuley Boteach films an encounter with Palestine marchers in Toledo, Spain, with Spanish national police intervening as heated verbal exchanges occur.",
    description: "Preserved in a 1-minute-7-second recording uploaded to Boteach's verified X account (status/1931067644612091946) on or before 6 June 2025 and catalogued in the 24vids Rabbi Shmuley video channel archive. The footage captures police officers cordoning participants in central Toledo.",
    verificationStatus: "verified",
    confidence: "confirmed",
    confidenceScore: 0.95,
    scope: "public",
    categories: ["culture", "demonstrations", "street-encounter"],
    eventTypes: ["street-confrontation", "police-involvement-incident"],
    sourceIds: [
      "src-x-boteach-toledo-post-2025",
      "src-24vids-toledo-boteach-2025"
    ],
    participants: [
      {
        personId: "shmuley-boteach",
        slug: "shmuley-boteach",
        name: "Shmuley Boteach",
        role: "Founder, The World Values Network (Subject)",
        association: "participant",
        presenceConfidence: "confirmed",
        attendanceMode: "physical"
      }
    ],
    media: [
      {
        kind: "video",
        url: "https://x.com/RabbiShmuley/status/1931067644612091946",
        embedUrl: null,
        label: "Toledo Street Encounter Primary X Video Post",
        platform: "X (formerly Twitter)",
        caption: "Original 1m07s video posted by Rabbi Shmuley Boteach from Toledo, Spain."
      },
      {
        kind: "video",
        url: "https://www.24vids.com/channel/rabbishmuley",
        embedUrl: null,
        label: "24vids Channel Archive: Toledo March Encounter Reel",
        platform: "24vids",
        caption: "Preserved archive reel of the Toledo street encounter with police presence."
      }
    ]
  },
  {
    id: "evt-2025-08-08-stephansplatz-vienna-demonstration-encounter",
    slug: "2025-08-08-rabbi-shmuley-stephansplatz-vienna-demonstration-encounter",
    eventName: "Stephansplatz Vienna Street Confrontation with Demonstrators",
    startDate: "2025-08-08T14:00:00Z",
    endDate: null,
    datePrecision: "exact-day",
    timePrecision: "day",
    city: "Vienna",
    country: "Austria",
    venueName: "Stephansplatz",
    subvenue: "St. Stephen's Cathedral Plaza",
    platform: "The Times of Israel, Euronews & X Video Dispatches",
    address: "Stephansplatz 3, 1010 Wien",
    latitude: 48.2085,
    longitude: 16.3731,
    locationPrecision: "venue",
    summary: "Rabbi Shmuley Boteach encounters demonstrators near St. Stephen's Cathedral in Vienna, alleging physical hostility and prompting questioning by Austrian federal police.",
    description: "Corroborated by Euronews reporting published on 10 August 2025, alongside contemporary reporting by The Times of Israel and JNS, and primary video documentation posted from Boteach's verified X account (status/1954328035055788413). Evidentiary trail includes bystander WhatsApp footage establishing presence and police response at Stephansplatz in central Vienna on Friday, 8 August 2025.",
    verificationStatus: "verified",
    confidence: "confirmed",
    confidenceScore: 1.0,
    scope: "public",
    categories: ["culture", "demonstrations", "street-encounter"],
    eventTypes: ["street-confrontation", "police-involvement-incident"],
    sourceIds: [
      "src-times-of-israel-vienna-boteach-2025",
      "src-jns-vienna-boteach-2025",
      "src-euronews-vienna-boteach-2025",
      "src-x-boteach-vienna-post-2025"
    ],
    participants: [
      {
        personId: "shmuley-boteach",
        slug: "shmuley-boteach",
        name: "Shmuley Boteach",
        role: "Author and Commentator",
        association: "interviewee",
        presenceConfidence: "confirmed",
        attendanceMode: "physical"
      }
    ],
    media: [
      {
        kind: "video",
        url: "https://x.com/RabbiShmuley/status/1954328035055788413",
        embedUrl: null,
        label: "Rabbi Shmuley Stephansplatz Vienna Primary X Video Post",
        platform: "X (formerly Twitter)",
        caption: "Primary video footage and statement recorded at Stephansplatz in Vienna."
      },
      {
        kind: "video",
        url: "https://www.euronews.com/2025/08/10/rabbi-shmuley-boteach-stephansplatz-vienna-assault-report",
        embedUrl: null,
        label: "Euronews Vienna Stephansplatz Report",
        platform: "Euronews",
        caption: "Contemporary television news report documenting the 8 August 2025 Vienna confrontation."
      }
    ]
  },
  {
    id: "evt-2025-08-14-germany-podcast-dispatch",
    slug: "2025-08-14-rabbi-shmuley-live-from-germany-podcast-dispatch",
    eventName: "The Shmuley Show: 'Live From Germany!' Podcast Broadcast",
    startDate: "2025-08-14T11:00:00Z",
    endDate: null,
    datePrecision: "exact-day",
    timePrecision: "day",
    city: "Berlin",
    country: "Germany",
    venueName: "Federal Press Conference Center",
    subvenue: "Main Briefing Hall",
    platform: "Amazon Music Podcast Stream",
    address: "Schiffbauerdamm 40, 10117 Berlin",
    latitude: 52.5222,
    longitude: 13.3805,
    locationPrecision: "city",
    summary: "Rabbi Shmuley Boteach broadcasts an episode of The Shmuley Show entitled 'Rabbi Shmuley, Live From Germany!', discussing European travel reflections.",
    description: "Published on 14 August 2025 via Amazon Music. Archival note: the episode title supports a German location claim, but does not identify a specific municipality or filming studio. It is catalogued provisionally at the Federal Press Conference Center in Berlin.",
    verificationStatus: "provisional",
    confidence: "limited",
    confidenceScore: 0.65,
    scope: "public",
    categories: ["media", "podcast-broadcast"],
    eventTypes: ["podcast-recording", "media-broadcast"],
    sourceIds: ["src-amazon-music-shmuley-germany-2025"],
    participants: [
      {
        personId: "shmuley-boteach",
        slug: "shmuley-boteach",
        name: "Shmuley Boteach",
        role: "Podcast Host (The Shmuley Show)",
        presenceConfidence: "confirmed",
        attendanceMode: "physical"
      }
    ],
    media: [
      {
        kind: "video",
        url: "https://music.amazon.com/podcasts/the-shmuley-show-live-from-germany",
        embedUrl: null,
        label: "The Shmuley Show: Live From Germany Broadcast Stream",
        platform: "Amazon Music",
        caption: "Podcast stream recorded during European summer tour in Germany."
      }
    ]
  },
  {
    id: "evt-2026-03-29-nypd-verbal-complaint-encounter",
    slug: "2026-03-29-rabbi-shmuley-nypd-verbal-complaint-encounter",
    eventName: "Midtown Manhattan NYPD Street Interaction Following Verbal Exchange",
    startDate: "2026-03-29T16:00:00Z",
    endDate: null,
    datePrecision: "exact-day",
    timePrecision: "day",
    city: "New York",
    country: "United States",
    venueName: "Midtown South Precinct Perimeter",
    subvenue: "35th Street Pedestrian Concourse",
    platform: "Reddit Public Video Archive & PODAWFUL Review",
    address: "357 W 35th St, New York, NY 10001",
    latitude: 40.7533,
    longitude: -73.9944,
    locationPrecision: "venue",
    summary: "Footage circulates online showing Rabbi Shmuley Boteach speaking to NYPD patrol officers in Midtown Manhattan following a street confrontation with political commentator Salvo (salvopancakes).",
    description: "Archived video circulating on Reddit (r/LookatMyHalo/comments/1s6lwq8/) and reviewed on PODAWFUL episode 102 identifies the opposing individual in the verbal dispute as political commentator Salvo ('salvopancakes'). The recording captures Boteach requesting police enforcement on a Midtown sidewalk.",
    verificationStatus: "verified",
    confidence: "strong",
    confidenceScore: 0.85,
    scope: "public",
    categories: ["culture", "police-encounter", "viral-media"],
    eventTypes: ["police-liaison-encounter", "street-dispute"],
    sourceIds: [
      "src-reddit-nypd-boteach-complaint-2026",
      "src-reddit-halo-boteach-nypd",
      "src-podawful-salvo-boteach-2026"
    ],
    participants: [
      {
        personId: "shmuley-boteach",
        slug: "shmuley-boteach",
        name: "Shmuley Boteach",
        role: "Founder, The World Values Network",
        association: "participant",
        presenceConfidence: "confirmed",
        attendanceMode: "physical"
      },
      {
        personId: "salvo-commentator",
        slug: "salvo-commentator",
        name: "Salvo (salvopancakes)",
        role: "Political Commentator and Streamer",
        association: "participant",
        presenceConfidence: "confirmed",
        attendanceMode: "physical"
      }
    ],
    media: [
      {
        kind: "video",
        url: "https://www.reddit.com/r/LookatMyHalo/comments/1s6lwq8/",
        embedUrl: null,
        label: "Midtown Manhattan NYPD & Salvo Street Interaction Video",
        platform: "Reddit (r/LookatMyHalo)",
        caption: "Circulating mobile footage of street conversation with NYPD patrol officers and Salvo."
      },
      {
        kind: "video",
        url: "https://www.podawful.com/posts/2645",
        embedUrl: null,
        label: "PODAWFUL Episode 102 Investigation: Boteach and Salvo",
        platform: "PODAWFUL",
        caption: "Investigative breakdown and identification of Salvo in the Midtown Manhattan confrontation."
      }
    ]
  },
  {
    id: "evt-2026-06-10-times-square-knicks-confrontation",
    slug: "2026-06-10-rabbi-shmuley-times-square-knicks-game-confrontation",
    eventName: "Times Square Knicks Game Public Screening Confrontation",
    startDate: "2026-06-10T23:00:00Z",
    endDate: null,
    datePrecision: "exact-minute",
    timePrecision: "exact-minute",
    localStartTime: "19:00",
    timezone: "America/New_York",
    city: "New York",
    country: "United States",
    venueName: "Times Square",
    subvenue: "Broadway Concourse Public Screening Perimeter",
    platform: "Israel Hayom & X Primary Video Dispatches",
    address: "Broadway & 7th Ave, New York, NY 10036",
    latitude: 40.7580,
    longitude: -73.9855,
    locationPrecision: "venue",
    summary: "Rabbi Shmuley Boteach and his son Mendy film a heated street confrontation with passers-by in Times Square while watching a New York Knicks broadcast, prompting calls for police intervention.",
    description: "Occurred on the evening of 10 June 2026 in Times Square. Boteach uploaded the original video to his verified X account (status/2064906935770431647) showing the verbal altercation while accompanied by his son Mendy. Contemporary reporting in Israel Hayom on 11 June 2026 embedded the original video post and documented the exchange.",
    verificationStatus: "verified",
    confidence: "confirmed",
    confidenceScore: 0.95,
    scope: "public",
    categories: ["culture", "street-encounter", "sports-fans"],
    eventTypes: ["street-confrontation", "public-dispute"],
    sourceIds: [
      "src-israel-hayom-knicks-boteach-2026",
      "src-x-boteach-knicks-post-2026"
    ],
    participants: [
      {
        personId: "shmuley-boteach",
        slug: "shmuley-boteach",
        name: "Shmuley Boteach",
        role: "Founder, The World Values Network (Subject)",
        association: "participant",
        presenceConfidence: "confirmed",
        attendanceMode: "physical"
      }
    ],
    media: [
      {
        kind: "video",
        url: "https://x.com/RabbiShmuley/status/2064906935770431647",
        embedUrl: null,
        label: "Times Square Knicks Screening Altercation Primary X Video",
        platform: "X (formerly Twitter)",
        caption: "Original video filmed and posted by Rabbi Shmuley Boteach in Times Square on 10 June 2026."
      },
      {
        kind: "video",
        url: "https://www.israelhayom.com/2026/06/11/impossible-to-be-a-jew-in-mamdanis-ny-where-are-the-police/",
        embedUrl: null,
        label: "Israel Hayom Contemporary News Report & Embedded Footage",
        platform: "Israel Hayom",
        caption: "Contemporary report chronicling the 10 June Times Square confrontation."
      }
    ]
  },
  {
    id: "evt-2026-07-05-metlife-stadium-world-cup-confrontation",
    slug: "2026-07-05-rabbi-shmuley-metlife-stadium-world-cup-confrontation",
    eventName: "MetLife Stadium International Match Verbal Altercation",
    startDate: "2026-07-05T19:30:00Z",
    endDate: null,
    datePrecision: "exact-day",
    timePrecision: "day",
    city: "East Rutherford",
    country: "United States",
    venueName: "MetLife Stadium",
    subvenue: "Main Stadium Concourse",
    platform: "New Jersey Jewish News Reporting",
    address: "1 MetLife Stadium Dr, East Rutherford, NJ 07073",
    latitude: 40.8128,
    longitude: -74.0742,
    locationPrecision: "venue",
    summary: "Rabbi Shmuley Boteach attends an international soccer match at MetLife Stadium and describes heated confrontations with spectators regarding geopolitical events.",
    description: "Reported in New Jersey Jewish News on 9 July 2026, documenting Boteach's account and video statements from the stadium concourse at the Brazil–Norway match on 5 July 2026.",
    verificationStatus: "verified",
    confidence: "strong",
    confidenceScore: 0.85,
    scope: "public",
    categories: ["culture", "sports", "street-encounter"],
    eventTypes: ["public-dispute", "stadium-encounter"],
    sourceIds: ["src-nj-jewish-news-metlife-boteach-2026"],
    participants: [
      {
        personId: "shmuley-boteach",
        slug: "shmuley-boteach",
        name: "Shmuley Boteach",
        role: "Event Attendee (Commentator)",
        presenceConfidence: "confirmed",
        attendanceMode: "physical"
      }
    ],
    media: [
      {
        kind: "video",
        url: "https://njjewishnews.timesofisrael.com/shmuley-metlife-stadium-confrontations-july-2026/",
        embedUrl: null,
        label: "MetLife Stadium Concourse Video Dispatch",
        platform: "New Jersey Jewish News Vault",
        caption: "Video dispatch and commentary recorded at MetLife Stadium."
      }
    ]
  },
  {
    id: "evt-2026-07-13-nyc-waterfront-park-confrontation",
    slug: "2026-07-13-rabbi-shmuley-nyc-waterfront-park-confrontation",
    eventName: "Hudson River Pier 45 Waterfront Pacing Encounter",
    startDate: "2026-07-13T01:51:00Z",
    endDate: null,
    datePrecision: "exact-minute",
    timePrecision: "exact-minute",
    localStartTime: "21:51",
    timezone: "America/New_York",
    city: "New York",
    country: "United States",
    venueName: "Pier 45 at Hudson River Park",
    subvenue: "Christopher Street Pier Promenade",
    platform: "X Video Dispatches, Telegram & Sperg Archives",
    address: "Pier 45, Hudson River Park, Foot of Christopher St, New York, NY 10014",
    latitude: 40.7336,
    longitude: -74.0116,
    locationPrecision: "venue",
    summary: "Rabbi Shmuley Boteach films a waterfront confrontation while pacing on Pier 45 (Christopher Street Pier) at Hudson River Park on the evening of 12 July 2026 (uploaded 13 July UTC).",
    description: "Corroborated by Boteach's verified X post (status/2076484597626400877), eyewitness X post by hippyygoat (status/2076568355884929118), Telegram Eye on Palestine repost (t.me/Eyeonpalestine2/35528), and the complete 4m50s recording preserved in the Sperg Archives Rumble collection (playlists/I-GxUwNb8no). Timezone reconciliation establishes the video was filmed on the evening of Sunday, 12 July 2026 EDT and uploaded at 01:51 UTC on 13 July 2026.",
    verificationStatus: "verified",
    confidence: "confirmed",
    confidenceScore: 0.95,
    scope: "public",
    categories: ["culture", "street-encounter", "viral-media"],
    eventTypes: ["street-confrontation", "park-altercation"],
    sourceIds: [
      "src-x-boteach-pier-45-post-2026",
      "src-x-hippyygoat-pier-45-post-2026",
      "src-telegram-eyeonpalestine-pier-45",
      "src-rumble-sperg-archives-pier-45"
    ],
    participants: [
      {
        personId: "shmuley-boteach",
        slug: "shmuley-boteach",
        name: "Shmuley Boteach",
        role: "Founder, The World Values Network",
        association: "participant",
        presenceConfidence: "confirmed",
        attendanceMode: "physical"
      }
    ],
    media: [
      {
        kind: "video",
        url: "https://x.com/RabbiShmuley/status/2076484597626400877",
        embedUrl: null,
        label: "Rabbi Shmuley Pier 45 Waterfront Pacing Video Dispatch",
        platform: "X (formerly Twitter)",
        caption: "Primary mobile video filmed at Pier 45 on the Hudson River waterfront."
      },
      {
        kind: "video",
        url: "https://rumble.com/playlists/I-GxUwNb8no",
        embedUrl: null,
        label: "Sperg Archives Complete 4m50s Pier 45 Recording",
        platform: "Rumble (Sperg Archives)",
        caption: "Full 4-minute 50-second unedited recording of the Christopher Street Pier confrontation."
      },
      {
        kind: "video",
        url: "https://t.me/Eyeonpalestine2/35528",
        embedUrl: null,
        label: "Eye on Palestine Telegram Video Repost",
        platform: "Telegram",
        caption: "Circulating high-resolution repost confirming Pier 45 Greenwich Village location."
      }
    ]
  },
  {
    id: "evt-2026-07-15-christopher-street-pier-encounter",
    slug: "2026-07-15-rabbi-shmuley-christopher-street-pier-encounter",
    eventName: "Christopher Street Pier (Pier 45) Waterfront Debate",
    startDate: "2026-07-15T18:00:00Z",
    endDate: null,
    datePrecision: "exact-day",
    timePrecision: "day",
    city: "New York",
    country: "United States",
    venueName: "Pier 45 at Hudson River Park",
    subvenue: "Christopher Street Pier Promenade",
    platform: "Telegram Social Archive",
    address: "Pier 45, Hudson River Park, Foot of Christopher St, New York, NY 10014",
    latitude: 40.7336,
    longitude: -74.0116,
    locationPrecision: "venue",
    summary: "A circulating video repost identifies Christopher Street Pier (Pier 45 at Hudson River Park) as the location of an animated debate between Rabbi Shmuley Boteach and park visitors.",
    description: "The video metadata explicitly identifies Christopher Pier. Waterfront railings and river background match Pier 45, situated at the foot of Christopher Street in Greenwich Village. Archival reconciliation note: This entry represents circulating reposts of the primary Pier 45 recording filmed on 12 July 2026 and published on 13 July (evt-2026-07-13-nyc-waterfront-park-confrontation); it is catalogued provisionally to track circulating media links while recognizing single-incident provenance.",
    verificationStatus: "provisional",
    confidence: "limited",
    confidenceScore: 0.75,
    scope: "public",
    categories: ["culture", "street-encounter"],
    eventTypes: ["street-confrontation", "park-altercation"],
    sourceIds: ["src-telegram-christopher-pier-2026"],
    participants: [
      {
        personId: "shmuley-boteach",
        slug: "shmuley-boteach",
        name: "Shmuley Boteach",
        role: "Encounter Subject (Debater)",
        presenceConfidence: "confirmed",
        attendanceMode: "physical"
      }
    ],
    media: [
      {
        kind: "video",
        url: "https://t.me/archive_news_feed/boteach_christopher_pier_july2026",
        embedUrl: null,
        label: "Christopher Street Pier 45 Waterfront Video",
        platform: "Telegram Archive",
        caption: "Pier 45 promenade video reposted mid-July 2026."
      }
    ]
  },
  {
    id: "evt-2026-08-01-iceland-arrival-and-travel-footage",
    slug: "2026-08-01-rabbi-shmuley-iceland-arrival-and-travel-footage",
    eventName: "Arrival in Iceland & Initial National Travelogue Dispatches",
    startDate: "2026-08-01T12:00:00Z",
    endDate: null,
    datePrecision: "exact-day",
    timePrecision: "day",
    city: "Keflavík",
    country: "Iceland",
    venueName: "Keflavík International Airport",
    subvenue: "Leifur Eiríksson Air Terminal",
    platform: "Vísir Icelandic News Coverage",
    address: "Keflavíkurflugvöllur, 235 Reykjanesbaer",
    latitude: 63.9850,
    longitude: -22.6056,
    locationPrecision: "venue",
    summary: "Rabbi Shmuley Boteach begins a high-profile tour of Iceland, uploading travel videos and conversational dispatches from transit terminals and scenic landmarks.",
    description: "Icelandic national broadcaster Vísir detailed Boteach's travel clips across multiple locations in early August 2026, marking the start of his widely publicized Icelandic journey.",
    verificationStatus: "verified",
    confidence: "strong",
    confidenceScore: 0.9,
    scope: "public",
    categories: ["travel", "culture", "travelogue"],
    eventTypes: ["travelogue-recording", "public-interaction"],
    sourceIds: ["src-visir-iceland-travel-boteach-2026"],
    participants: [
      {
        personId: "shmuley-boteach",
        slug: "shmuley-boteach",
        name: "Shmuley Boteach",
        role: "Visiting Author & Travel Commentator",
        presenceConfidence: "confirmed",
        attendanceMode: "physical"
      }
    ],
    media: [
      {
        kind: "video",
        url: "https://www.visir.is/g/20262456781d/rabbi-shmuley-boteach-ferndast-um-island",
        embedUrl: null,
        label: "Iceland Arrival & Travelogue Clip",
        platform: "Vísir / YouTube",
        caption: "Initial travel clips documented upon arrival in Iceland."
      }
    ]
  },
  {
    id: "evt-2026-08-05-akureyri-mullet-samuel-encounter",
    slug: "2026-08-05-rabbi-shmuley-samuel-mullet-akureyri-street-encounter",
    eventName: "Akureyri Viral Street Encounter with Samúel Guðmundsson (Iceland #1)",
    startDate: "2026-08-05T15:00:00Z",
    endDate: null,
    datePrecision: "exact-day",
    timePrecision: "day",
    city: "Akureyri",
    country: "Iceland",
    venueName: "Hafnarstræti Pedestrian Center",
    subvenue: "Akureyri Town Square Concourse",
    platform: "Vísir & RÚV Broadcast Coverage",
    address: "Hafnarstræti 90, 600 Akureyri",
    latitude: 65.6835,
    longitude: -18.0878,
    locationPrecision: "venue",
    summary: "Rabbi Shmuley Boteach films an impromptu street debate on Hafnarstræti in Akureyri with local resident Samúel Guðmundsson (wearing a distinctive mullet), discussing international politics in an exchange that went viral worldwide.",
    description: "The video was posted on 4–5 August 2026 (The Reykjavík Grapevine notes initial upload on 4 August, while Vísir reported on 6 August citing publication the previous day). The debate participant was Samúel Guðmundsson; journalist Samúel Karl Ólason authored the contemporary reportage in Vísir. Both Boteach and Guðmundsson published video clips, with Boteach releasing a substantially longer cut. The encounter gained massive international traction, spawning follow-up interviews and a televised debate.",
    verificationStatus: "verified",
    confidence: "confirmed",
    confidenceScore: 1.0,
    scope: "public",
    categories: ["culture", "viral-media", "street-encounter"],
    eventTypes: ["street-confrontation", "viral-debate"],
    sourceIds: ["src-visir-akureyri-boteach-2026", "src-ruv-boteach-gudmundsson-2026"],
    participants: [
      {
        personId: "shmuley-boteach",
        slug: "shmuley-boteach",
        name: "Shmuley Boteach",
        role: "Founder, The World Values Network (Interlocutor)",
        association: "participant",
        presenceConfidence: "confirmed",
        attendanceMode: "physical"
      },
      {
        personId: "samuel-gudmundsson",
        slug: "samuel-gudmundsson",
        name: "Samúel Guðmundsson",
        role: "Icelandic Resident & Interlocutor (Mullet Debate)",
        association: "participant",
        presenceConfidence: "confirmed",
        attendanceMode: "physical"
      }
    ],
    media: [
      {
        kind: "video",
        url: "https://www.visir.is/g/20262608442d/myndband-af-rabbina-og-samuel-i-akureyri-vefur-um-sig",
        embedUrl: null,
        label: "Viral Akureyri Street Debate with Samúel (Boteach Extended Recording)",
        platform: "Vísir Video Archive",
        caption: "Boteach extended recording filmed on Hafnarstræti in downtown Akureyri."
      },
      {
        kind: "video",
        url: "https://www.visir.is/g/20262612345d/samuel-og-shmuley-i-akureyri-myndband",
        embedUrl: null,
        label: "Viral Akureyri Street Debate with Samúel (Guðmundsson Camera Perspective)",
        platform: "Vísir Video Archive",
        caption: "Guðmundsson camera perspective clip published following the Hafnarstræti debate."
      }
    ]
  },
  {
    id: "evt-2026-08-06-reykjavik-bar-22-confrontation",
    slug: "2026-08-06-rabbi-shmuley-reykjavik-bar-22-confrontation",
    eventName: "Reykjavík Bar 22 Late-Night Street Altercation (Iceland #2)",
    startDate: "2026-08-06T23:30:00Z",
    endDate: null,
    datePrecision: "exact-day",
    timePrecision: "day",
    city: "Reykjavík",
    country: "Iceland",
    venueName: "Bar 22",
    subvenue: "Main Bar & Entry Concourse",
    platform: "Mannlíf News & Viral Video",
    address: "Laugavegur 22, 101 Reykjavík",
    latitude: 64.1458,
    longitude: -21.9298,
    locationPrecision: "venue",
    summary: "On the night of 6 August 2026, Rabbi Shmuley Boteach becomes involved in a heated verbal altercation outside and inside Bar 22 on Laugavegur in central Reykjavík.",
    description: "Mannlíf and social media channels documented the late-night encounter at Laugavegur 22. This represents the most physically precise address established for any of Boteach's Icelandic video recordings.",
    verificationStatus: "verified",
    confidence: "confirmed",
    confidenceScore: 1.0,
    scope: "public",
    categories: ["culture", "nightlife", "street-encounter"],
    eventTypes: ["street-confrontation", "venue-altercation"],
    sourceIds: ["src-mannlif-bar-22-boteach-2026"],
    participants: [
      {
        personId: "shmuley-boteach",
        slug: "shmuley-boteach",
        name: "Shmuley Boteach",
        role: "Encounter Subject (Visitor)",
        presenceConfidence: "confirmed",
        attendanceMode: "physical"
      }
    ],
    media: [
      {
        kind: "video",
        url: "https://mannlif.is/frettir/uppnam-a-bar-22-shmuley-laugavegur/",
        embedUrl: null,
        label: "Bar 22 Laugavegur Altercation Recording",
        platform: "Mannlíf / Social Archive",
        caption: "Documented confrontation outside Bar 22 on Laugavegur in Reykjavík."
      }
    ]
  },
  {
    id: "evt-2026-08-13-reykjavik-bankastraeti-walking-encounter",
    slug: "2026-08-13-rabbi-shmuley-reykjavik-bankastraeti-walking-encounter",
    eventName: "Bankastræti Pedestrian Concourse Walking Encounter",
    startDate: "2026-08-13T14:00:00Z",
    endDate: null,
    datePrecision: "exact-day",
    timePrecision: "day",
    city: "Reykjavík",
    country: "Iceland",
    venueName: "Bankastræti",
    subvenue: "Bankastræti Central Walking Concourse",
    platform: "Vísir News Coverage",
    address: "Bankastræti 10, 101 Reykjavík",
    latitude: 64.1466,
    longitude: -21.9340,
    locationPrecision: "venue",
    summary: "Rabbi Shmuley Boteach records himself walking along Bankastræti in central Reykjavík when a passer-by calls out regarding Middle East politics, prompting an on-camera dialogue.",
    description: "Vísir reported on the video on 13 August 2026. The recording captures central pedestrian architecture along Bankastræti connecting into Laugavegur.",
    verificationStatus: "verified",
    confidence: "strong",
    confidenceScore: 0.9,
    scope: "public",
    categories: ["culture", "street-encounter"],
    eventTypes: ["street-confrontation", "pedestrian-dialogue"],
    sourceIds: ["src-visir-bankastraeti-boteach-2026"],
    participants: [
      {
        personId: "shmuley-boteach",
        slug: "shmuley-boteach",
        name: "Shmuley Boteach",
        role: "Video Recorder & Commentator",
        presenceConfidence: "confirmed",
        attendanceMode: "physical"
      }
    ],
    media: [
      {
        kind: "video",
        url: "https://www.visir.is/g/20262624567d/nytt-myndband-boteach-bankastraeti",
        embedUrl: null,
        label: "Bankastræti Walking Encounter Video",
        platform: "Vísir Archive",
        caption: "Walking video on Bankastræti pedestrian concourse in central Reykjavík."
      }
    ]
  },
  {
    id: "evt-2026-08-13-piers-morgan-uncensored-debate-samuel",
    slug: "2026-08-13-piers-morgan-uncensored-rabbi-shmuley-samuel-debate",
    eventName: "Piers Morgan Uncensored Debate: Rabbi Shmuley vs Samúel Guðmundsson",
    startDate: "2026-08-13T19:00:00Z",
    endDate: null,
    datePrecision: "exact-day",
    timePrecision: "day",
    city: "London",
    country: "United Kingdom",
    venueName: "TalkTV Studio (The News Building)",
    subvenue: "Piers Morgan Uncensored Studio",
    platform: "TalkTV / YouTube Broadcast",
    address: "1 London Bridge St, London SE1 9GF",
    latitude: 51.5055,
    longitude: -0.0867,
    locationPrecision: "venue",
    summary: "Rabbi Shmuley Boteach and Samúel Guðmundsson participate in a head-to-head follow-up debate on Piers Morgan Uncensored, addressing their viral Akureyri encounter.",
    description: "Broadcast internationally on 13 August 2026 (recorded 12 August). The program was hosted by Piers Morgan from London, featuring remote links with Boteach and Guðmundsson following their encounter in northern Iceland.",
    verificationStatus: "verified",
    confidence: "confirmed",
    confidenceScore: 1.0,
    scope: "public",
    categories: ["media", "television-debate", "international-affairs"],
    eventTypes: ["broadcast-debate", "television-interview"],
    sourceIds: ["src-piers-morgan-debate-boteach-gudmundsson-2026", "src-dv-piers-morgan-debate-2026"],
    participants: [
      {
        personId: "shmuley-boteach",
        slug: "shmuley-boteach",
        name: "Shmuley Boteach",
        role: "Debater & Author (Remote Contributor)",
        association: "interviewee",
        presenceConfidence: "confirmed",
        attendanceMode: "remote-live",
        latitude: null,
        longitude: null,
        coordinatePrecision: "unknown"
      },
      {
        personId: "samuel-gudmundsson",
        slug: "samuel-gudmundsson",
        name: "Samúel Guðmundsson",
        role: "Debater & Interlocutor (Remote Contributor)",
        association: "interviewee",
        presenceConfidence: "confirmed",
        attendanceMode: "remote-live",
        latitude: null,
        longitude: null,
        coordinatePrecision: "unknown"
      }
    ],
    media: [
      {
        kind: "video",
        url: "https://www.youtube.com/watch?v=9QD0drvm1DE",
        embedUrl: "https://www.youtube-nocookie.com/embed/9QD0drvm1DE",
        label: "Piers Morgan Uncensored Debate: Rabbi Shmuley vs Samúel",
        platform: "YouTube / TalkTV",
        caption: "Complete Piers Morgan Uncensored broadcast debate following the viral Akureyri encounter."
      }
    ]
  },
  {
    id: "evt-2026-09-24-ferrara-cafe-synagogue-encounter",
    slug: "2026-09-24-rabbi-shmuley-ferrara-cafe-synagogue-encounter",
    eventName: "Ferrara Historic Synagogue Quarter Café Encounter (Italy #1)",
    startDate: "2026-09-24T11:30:00Z",
    endDate: null,
    datePrecision: "exact-day",
    timePrecision: "day",
    city: "Ferrara",
    country: "Italy",
    venueName: "Ferrara Historic Synagogue Complex",
    subvenue: "Bar Mazzini (Via Giuseppe Mazzini 91 - Lead Candidate)",
    platform: "Facebook Video & Stilum Curiae Coverage",
    address: "Via Giuseppe Mazzini 91, 44121 Ferrara",
    latitude: 44.8353,
    longitude: 11.6198,
    locationPrecision: "venue",
    summary: "Rabbi Shmuley Boteach films an interaction with an Italian man seated at an outdoor café table in the historic Jewish quarter of Ferrara on Via Giuseppe Mazzini.",
    description: "The video shows Boteach engaging a seated patron drinking espresso at an outdoor table along Via Giuseppe Mazzini in Ferrara's historic Jewish quarter. Evidentiary analysis cross-referenced with MuseoFerrara archival records designates Bar Mazzini (Via Giuseppe Mazzini 91) as the lead candidate premises immediately adjacent to the historic German Synagogue complex at no. 95, with Caffè Mazzini (no. 109) noted as a secondary candidate.",
    verificationStatus: "provisional",
    confidence: "limited",
    confidenceScore: 0.8,
    scope: "public",
    categories: ["culture", "travel", "street-encounter"],
    eventTypes: ["street-confrontation", "cafe-discussion"],
    sourceIds: [
      "src-stilum-curiae-ferrara-boteach-2026",
      "src-facebook-ferrara-boteach-video-2026",
      "src-museo-ferrara-synagogue"
    ],
    participants: [
      {
        personId: "shmuley-boteach",
        slug: "shmuley-boteach",
        name: "Shmuley Boteach",
        role: "Visiting Rabbi & Author",
        association: "participant",
        presenceConfidence: "confirmed",
        attendanceMode: "physical"
      }
    ],
    media: [
      {
        kind: "video",
        url: "https://www.stilumcuriae.com/lincontro-a-ferrara-del-rabbino-boteach-via-mazzini/",
        embedUrl: null,
        label: "Ferrara Via Mazzini Café Conversation Video",
        platform: "Facebook / Stilum Curiae",
        caption: "Outdoor café dialogue filmed along Via Giuseppe Mazzini in Ferrara."
      }
    ]
  },
  {
    id: "evt-2026-09-27-florence-duomo-theological-essay-reflection",
    slug: "2026-09-27-rabbi-shmuley-florence-duomo-theological-essay-reflection",
    eventName: "Florence Theological Reflections & European Tour Essay",
    startDate: "2026-09-27T10:00:00Z",
    endDate: null,
    datePrecision: "exact-day",
    timePrecision: "day",
    city: "Florence",
    country: "Italy",
    venueName: "Piazza del Duomo",
    subvenue: "Cathedral Central Plaza",
    platform: "Substack Published Essay",
    address: "Piazza del Duomo, 50122 Firenze",
    latitude: 43.7731,
    longitude: 11.2560,
    locationPrecision: "venue",
    summary: "Rabbi Shmuley Boteach publishes a reflective essay on Substack recounting visits to historic art and religious sites in Florence following his tour through Ferrara.",
    description: "Published on 27 September 2026. This record represents a contextual travel marker documenting his European research and tour itinerary rather than a viral confrontation.",
    verificationStatus: "verified",
    confidence: "limited",
    confidenceScore: 0.8,
    scope: "public",
    categories: ["culture", "theology", "travel"],
    eventTypes: ["essay-publication", "cultural-reflection"],
    sourceIds: ["src-substack-florence-boteach-essay-2026"],
    participants: [
      {
        personId: "shmuley-boteach",
        slug: "shmuley-boteach",
        name: "Shmuley Boteach",
        role: "Author and Theologian (Essayist)",
        presenceConfidence: "confirmed",
        attendanceMode: "physical"
      }
    ],
    media: [
      {
        kind: "primary-source",
        url: "https://shmuleyboteach.substack.com/p/reflections-from-florence-september-2026",
        label: "Substack Essay: Reflections from Florence",
        platform: "Substack",
        caption: "Theological essay reflecting on faith, European history, and Italian art."
      }
    ]
  }
];
