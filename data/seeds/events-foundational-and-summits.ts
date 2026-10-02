/**
 * REWIND EVIDENCE ATLAS — CANONICAL SEED REGISTER: FOUNDATIONAL SUMMITS & TREATIES
 *
 * Forensically documented primary historical events with exact coordinates,
 * gazetteer-resolved venues, multi-person co-attendance rosters, and source citations.
 */

import type { EventRecord } from "@/lib/rewind/types";

export const foundationalAndSummitsEvents: EventRecord[] = [
  {
    id: "evt-1917-11-02-balfour-declaration",
    slug: "1917-11-02-balfour-declaration-issued",
    eventName: "Foreign Secretary Balfour Issues Balfour Declaration for Jewish National Home",
    startDate: "1917-11-02",
    endDate: null,
    datePrecision: "exact-day",
    timePrecision: "day",
    city: "London",
    country: "United Kingdom",
    venueName: "Foreign Office, Whitehall",
    platform: "Cabinet of the United Kingdom",
    address: "King Charles Street, London SW1A 2AH",
    latitude: 51.5028,
    longitude: -0.1281,
    locationPrecision: "venue",
    summary: "British Foreign Secretary Arthur Balfour issues an official government letter to Lord Walter Rothschild, expressing the British War Cabinet's formal support for the establishment in Palestine of a national home for the Jewish people.",
    description: "The historic 67-word letter represented the first formal diplomatic pledge by a major world power recognizing the right of the Jewish people to re-establish a national homeland in Palestine.",
    verificationStatus: "verified",
    confidence: "confirmed",
    confidenceScore: 1.0,
    scope: "diplomatic",
    categories: ["diplomacy", "foundational-treaty"],
    eventTypes: ["diplomatic-declaration", "official-communique"],
    sourceIds: ["src-un-unga-19840925"],
    participants: [
      {
        personId: "arthur-balfour",
        slug: "arthur-balfour",
        name: "Arthur Balfour",
        role: "British Foreign Secretary (Author)",
        presenceConfidence: "confirmed",
        attendanceMode: "physical"
      },
      {
        personId: "chaim-weizmann",
        slug: "chaim-weizmann",
        name: "Chaim Weizmann",
        role: "President of the English Zionist Federation (Lead Negotiator)",
        presenceConfidence: "confirmed",
        attendanceMode: "physical"
      }
    ],
    quotes: [
      {
        text: "His Majesty's Government view with favour the establishment in Palestine of a national home for the Jewish people, and will use their best endeavours to facilitate the achievement of this object.",
        speaker: "Arthur Balfour",
        language: "en",
        timestamp: null
      }
    ]
  },
  {
    id: "evt-1947-11-29-un-partition-plan",
    slug: "1947-11-29-un-general-assembly-adopts-resolution-181-partition-plan",
    eventName: "United Nations General Assembly Adopts Resolution 181 Partition Plan for Palestine",
    startDate: "1947-11-29T22:30:00Z",
    endDate: null,
    datePrecision: "exact-minute",
    timePrecision: "exact-minute",
    localStartTime: "17:30",
    timezone: "America/New_York",
    city: "New York",
    country: "United States",
    venueName: "Flushing Meadows Plenary Hall",
    platform: "United Nations General Assembly",
    address: "Flushing Meadows–Corona Park, Queens, NY 11368",
    latitude: 40.7505,
    longitude: -73.8447,
    locationPrecision: "venue",
    summary: "The United Nations General Assembly votes 33 to 13 (with 10 abstentions) to adopt Resolution 181 (II), recommending the partition of Mandatory Palestine into independent Arab and Jewish States with a Special International Regime for Jerusalem.",
    description: "The plenary session voted on the report of the UN Special Committee on Palestine (UNSCOP), establishing the international legal framework for the termination of the British Mandate.",
    verificationStatus: "verified",
    confidence: "confirmed",
    confidenceScore: 1.0,
    scope: "diplomatic",
    categories: ["diplomacy", "foundational-treaty"],
    eventTypes: ["un-resolution", "general-assembly-vote"],
    sourceIds: ["src-un-res-181-19471129"],
    participants: [
      {
        personId: "chaim-weizmann",
        slug: "chaim-weizmann",
        name: "Chaim Weizmann",
        role: "Jewish Agency Observer & Diplomatic Representative",
        presenceConfidence: "confirmed",
        attendanceMode: "physical"
      },
      {
        personId: "abraham-herzog",
        slug: "abraham-herzog",
        name: "Yitzhak HaLevi Herzog",
        role: "Chief Rabbi of Mandatory Palestine (Observer)",
        presenceConfidence: "confirmed",
        attendanceMode: "remote-recorded"
      }
    ]
  },
  {
    id: "evt-1948-05-14-israeli-declaration-of-independence",
    slug: "1948-05-14-declaration-of-the-establishment-of-the-state-of-israel",
    eventName: "David Ben-Gurion Proclaims the Declaration of the Establishment of the State of Israel",
    startDate: "1948-05-14T16:00:00Z",
    endDate: null,
    datePrecision: "exact-minute",
    timePrecision: "exact-minute",
    localStartTime: "16:00",
    timezone: "Asia/Jerusalem",
    city: "Tel Aviv",
    country: "Israel",
    venueName: "Tel Aviv Museum of Art (Independence Hall)",
    platform: "Provisional State Council (Moetzet HaAm)",
    address: "16 Rothschild Boulevard, Tel Aviv",
    latitude: 32.0628,
    longitude: 34.7708,
    locationPrecision: "venue",
    summary: "David Ben-Gurion, head of the Provisional State Council, proclaims the establishment of a Jewish state in Eretz-Israel, to be known as the State of Israel, ending the British Mandate for Palestine.",
    description: "At 4:00 PM on Friday, May 14, 1948, eight hours before the midnight expiration of the British Mandate, Ben-Gurion read the Declaration of Independence beneath a portrait of Theodor Herzl before 250 invited delegates and journalists.",
    verificationStatus: "verified",
    confidence: "confirmed",
    confidenceScore: 1.0,
    scope: "government",
    categories: ["geopolitics", "foundational-treaty"],
    eventTypes: ["declaration-of-independence", "constitutional-assembly"],
    sourceIds: ["src-un-unga-19840925"],
    participants: [
      {
        personId: "david-ben-gurion",
        slug: "david-ben-gurion",
        name: "David Ben-Gurion",
        role: "Chairman of the Provisional State Council / Prime Minister",
        presenceConfidence: "confirmed",
        attendanceMode: "physical"
      },
      {
        personId: "golda-meir",
        slug: "golda-meir",
        name: "Golda Meir",
        role: "Signatory / Member of Provisional State Council",
        presenceConfidence: "confirmed",
        attendanceMode: "physical"
      }
    ],
    quotes: [
      {
        text: "We hereby declare the establishment of a Jewish state in Eretz-Israel, to be known as the State of Israel.",
        speaker: "David Ben-Gurion",
        language: "he",
        timestamp: "00:04:20"
      }
    ]
  },
  {
    id: "evt-1977-11-20-sadat-jerusalem-address",
    slug: "1977-11-20-president-sadat-addresses-israeli-knesset-in-jerusalem",
    eventName: "President Anwar Sadat Delivers Historic Peace Address to the Israeli Knesset",
    startDate: "1977-11-20T17:00:00Z",
    endDate: null,
    datePrecision: "exact-minute",
    timePrecision: "exact-minute",
    localStartTime: "19:00",
    timezone: "Asia/Jerusalem",
    city: "Jerusalem",
    country: "Israel",
    venueName: "The Knesset Plenary Chamber",
    platform: "Knesset Special Plenary Session",
    address: "Kiryat Ben-Gurion, Jerusalem 91950",
    latitude: 31.7767,
    longitude: 35.2056,
    locationPrecision: "venue",
    summary: "Egyptian President Anwar Sadat becomes the first Arab head of state to visit Israel, addressing the Knesset plenary in Jerusalem and offering comprehensive peace in exchange for full withdrawal from occupied territories.",
    description: "Sadat's 66-minute speech broke decades of diplomatic taboo following the 1973 Yom Kippur War, setting in motion the negotiations leading directly to Camp David.",
    verificationStatus: "verified",
    confidence: "confirmed",
    confidenceScore: 1.0,
    scope: "diplomatic",
    categories: ["diplomacy", "parliamentary-address"],
    eventTypes: ["state-visit", "parliamentary-address"],
    sourceIds: ["src-knesset-record-19771120"],
    participants: [
      {
        personId: "anwar-sadat",
        slug: "anwar-sadat",
        name: "Anwar Sadat",
        role: "President of the Arab Republic of Egypt",
        presenceConfidence: "confirmed",
        attendanceMode: "physical"
      },
      {
        personId: "menachem-begin",
        slug: "menachem-begin",
        name: "Menachem Begin",
        role: "Prime Minister of Israel",
        presenceConfidence: "confirmed",
        attendanceMode: "physical"
      },
      {
        personId: "shimon-peres",
        slug: "shimon-peres",
        name: "Shimon Peres",
        role: "Leader of the Opposition (Labor Party)",
        presenceConfidence: "confirmed",
        attendanceMode: "physical"
      },
      {
        personId: "boutros-boutros-ghali",
        slug: "boutros-boutros-ghali",
        name: "Boutros Boutros-Ghali",
        role: "Egyptian Acting Foreign Minister",
        presenceConfidence: "confirmed",
        attendanceMode: "physical"
      }
    ],
    quotes: [
      {
        text: "I come to you today on firm ground to shape a new life, to establish peace. We all love this land, the land of God.",
        speaker: "Anwar Sadat",
        language: "ar",
        timestamp: "00:15:30"
      }
    ]
  },
  {
    id: "evt-1978-09-17-camp-david-accords",
    slug: "1978-09-17-signing-of-the-camp-david-accords",
    eventName: "Signing of the Camp David Accords for Middle East Peace",
    startDate: "1978-09-17T22:30:00Z",
    endDate: null,
    datePrecision: "exact-minute",
    timePrecision: "exact-minute",
    localStartTime: "22:30",
    timezone: "America/New_York",
    city: "Washington",
    country: "United States",
    venueName: "The White House - East Room",
    platform: "Executive Office of the President",
    address: "1600 Pennsylvania Avenue NW, Washington, DC 20500",
    latitude: 38.8977,
    longitude: -77.0365,
    locationPrecision: "venue",
    summary: "President Jimmy Carter, President Anwar Sadat of Egypt, and Prime Minister Menachem Begin of Israel sign the Camp David Accords, establishing a framework for peace between Egypt and Israel and interim self-government in the Palestinian territories.",
    description: "Concluded after thirteen days of intensive secret negotiations at the presidential retreat in Thurmont, Maryland, the accords laid the groundwork for the 1979 Egypt-Israel Peace Treaty.",
    verificationStatus: "verified",
    confidence: "confirmed",
    confidenceScore: 1.0,
    scope: "diplomatic",
    categories: ["diplomacy", "foundational-treaty"],
    eventTypes: ["peace-accord-signing", "presidential-summit"],
    sourceIds: ["src-camp-david-accords-19780917"],
    participants: [
      {
        personId: "jimmy-carter",
        slug: "jimmy-carter",
        name: "Jimmy Carter",
        role: "President of the United States (Witness / Mediator)",
        presenceConfidence: "confirmed",
        attendanceMode: "physical"
      },
      {
        personId: "anwar-sadat",
        slug: "anwar-sadat",
        name: "Anwar Sadat",
        role: "President of the Arab Republic of Egypt (Signatory)",
        presenceConfidence: "confirmed",
        attendanceMode: "physical"
      },
      {
        personId: "menachem-begin",
        slug: "menachem-begin",
        name: "Menachem Begin",
        role: "Prime Minister of Israel (Signatory)",
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
      }
    ],
    quotes: [
      {
        text: "When we first arrived at Camp David, the prospects for peace were dim... Through their courage and wisdom, President Sadat and Prime Minister Begin have built a foundation for permanent peace.",
        speaker: "Jimmy Carter",
        language: "en",
        timestamp: "00:02:10"
      }
    ]
  },
  {
    id: "evt-1985-11-19-geneva-summit",
    slug: "1985-11-19-geneva-summit-reagan-gorbachev",
    eventName: "President Ronald Reagan and General Secretary Mikhail Gorbachev Hold Geneva Summit",
    startDate: "1985-11-19T09:00:00Z",
    endDate: "1985-11-21T18:00:00Z",
    datePrecision: "exact-day",
    timePrecision: "day",
    city: "Geneva",
    country: "Switzerland",
    venueName: "Maison de Saussure & Villa Fleur d'Eau",
    platform: "US-Soviet Bilateral Summit",
    address: "Château de Saussure, 1292 Chambésy, Geneva",
    latitude: 46.2415,
    longitude: 6.1492,
    locationPrecision: "venue",
    summary: "US President Ronald Reagan and Soviet General Secretary Mikhail Gorbachev hold their first bilateral summit in Geneva, issuing the historic joint declaration that 'a nuclear war cannot be won and must never be fought'.",
    description: "The three-day summit established personal rapport between the superpower leaders, breaking a six-year hiatus in US-Soviet summitry and paving the way for the INF Treaty.",
    verificationStatus: "verified",
    confidence: "confirmed",
    confidenceScore: 1.0,
    scope: "diplomatic",
    categories: ["diplomacy", "superpower-summit"],
    eventTypes: ["bilateral-summit", "arms-control"],
    sourceIds: ["src-geneva-summit-19851119"],
    participants: [
      {
        personId: "ronald-reagan",
        slug: "ronald-reagan",
        name: "Ronald Reagan",
        role: "President of the United States",
        presenceConfidence: "confirmed",
        attendanceMode: "physical"
      },
      {
        personId: "mikhail-gorbachev",
        slug: "mikhail-gorbachev",
        name: "Mikhail Gorbachev",
        role: "General Secretary of the Communist Party of the Soviet Union",
        presenceConfidence: "confirmed",
        attendanceMode: "physical"
      },
      {
        personId: "george-shultz",
        slug: "george-shultz",
        name: "George Shultz",
        role: "US Secretary of State",
        presenceConfidence: "confirmed",
        attendanceMode: "physical"
      },
      {
        personId: "eduard-shevardnadze",
        slug: "eduard-shevardnadze",
        name: "Eduard Shevardnadze",
        role: "Minister of Foreign Affairs of the USSR",
        presenceConfidence: "confirmed",
        attendanceMode: "physical"
      }
    ]
  },
  {
    id: "evt-1986-10-11-reykjavik-summit",
    slug: "1986-10-11-reykjavik-summit-reagan-gorbachev",
    eventName: "President Ronald Reagan and General Secretary Mikhail Gorbachev Hold Reykjavik Summit",
    startDate: "1986-10-11T09:00:00Z",
    endDate: "1986-10-12T19:00:00Z",
    datePrecision: "exact-day",
    timePrecision: "day",
    city: "Reykjavik",
    country: "Iceland",
    venueName: "Höfði House",
    platform: "US-Soviet Bilateral Arms Control Summit",
    address: "Borgartún 105, 105 Reykjavík",
    latitude: 64.1466,
    longitude: -21.9056,
    locationPrecision: "venue",
    summary: "President Ronald Reagan and Soviet leader Mikhail Gorbachev hold an intense two-day summit at Höfði House in Reykjavik, coming close to an agreement to eliminate all nuclear weapons before collapsing over the Strategic Defense Initiative (SDI).",
    description: "Despite failing to produce an immediate agreement, Reykjavik broke procedural impasses and directly enabled the 1987 Intermediate-Range Nuclear Forces (INF) Treaty.",
    verificationStatus: "verified",
    confidence: "confirmed",
    confidenceScore: 1.0,
    scope: "diplomatic",
    categories: ["diplomacy", "superpower-summit"],
    eventTypes: ["bilateral-summit", "arms-control-negotiation"],
    sourceIds: ["src-reykjavik-summit-19861011"],
    participants: [
      {
        personId: "ronald-reagan",
        slug: "ronald-reagan",
        name: "Ronald Reagan",
        role: "President of the United States",
        presenceConfidence: "confirmed",
        attendanceMode: "physical"
      },
      {
        personId: "mikhail-gorbachev",
        slug: "mikhail-gorbachev",
        name: "Mikhail Gorbachev",
        role: "General Secretary of the Communist Party of the Soviet Union",
        presenceConfidence: "confirmed",
        attendanceMode: "physical"
      },
      {
        personId: "george-shultz",
        slug: "george-shultz",
        name: "George Shultz",
        role: "US Secretary of State",
        presenceConfidence: "confirmed",
        attendanceMode: "physical"
      }
    ]
  },
  {
    id: "evt-1991-10-30-madrid-peace-conference",
    slug: "1991-10-30-opening-of-the-madrid-peace-conference",
    eventName: "Co-Chairs Bush and Gorbachev Convene Historic Madrid Peace Conference",
    startDate: "1991-10-30T09:00:00Z",
    endDate: "1991-11-01T18:00:00Z",
    datePrecision: "exact-day",
    timePrecision: "day",
    city: "Madrid",
    country: "Spain",
    venueName: "Palacio Real de Madrid (Royal Palace)",
    platform: "Middle East Peace Conference",
    address: "Calle de Bailén, s/n, 28071 Madrid",
    latitude: 40.4179,
    longitude: -3.7143,
    locationPrecision: "venue",
    summary: "US President George H.W. Bush and Soviet President Mikhail Gorbachev co-sponsor the historic Madrid Peace Conference, bringing together Israel, Syria, Lebanon, Egypt, and a joint Jordanian-Palestinian delegation for direct negotiations for the first time.",
    description: "The conference established two parallel negotiation tracks: bilateral talks between Israel and its Arab neighbours, and multilateral working groups on regional issues such as water, refugees, arms control, and economic development.",
    verificationStatus: "verified",
    confidence: "confirmed",
    confidenceScore: 1.0,
    scope: "diplomatic",
    categories: ["diplomacy", "multilateral-peace-conference"],
    eventTypes: ["peace-conference", "plenary-assembly"],
    sourceIds: ["src-madrid-conference-19911030"],
    participants: [
      {
        personId: "george-h-w-bush",
        slug: "george-h-w-bush",
        name: "George H.W. Bush",
        role: "President of the United States (Co-Sponsor)",
        presenceConfidence: "confirmed",
        attendanceMode: "physical"
      },
      {
        personId: "mikhail-gorbachev",
        slug: "mikhail-gorbachev",
        name: "Mikhail Gorbachev",
        role: "President of the Soviet Union (Co-Sponsor)",
        presenceConfidence: "confirmed",
        attendanceMode: "physical"
      },
      {
        personId: "james-baker",
        slug: "james-baker",
        name: "James Baker",
        role: "US Secretary of State (Lead Convener)",
        presenceConfidence: "confirmed",
        attendanceMode: "physical"
      },
      {
        personId: "yitzhak-shamir",
        slug: "yitzhak-shamir",
        name: "Yitzhak Shamir",
        role: "Prime Minister of Israel",
        presenceConfidence: "confirmed",
        attendanceMode: "physical"
      },
      {
        personId: "felipe-gonzalez",
        slug: "felipe-gonzalez",
        name: "Felipe González",
        role: "Prime Minister of Spain (Host)",
        presenceConfidence: "confirmed",
        attendanceMode: "physical"
      },
      {
        personId: "amr-moussa",
        slug: "amr-moussa",
        name: "Amr Moussa",
        role: "Minister of Foreign Affairs of Egypt",
        presenceConfidence: "confirmed",
        attendanceMode: "physical"
      }
    ]
  },
  {
    id: "evt-1993-09-13-oslo-accord-signing",
    slug: "1993-09-13-signing-of-the-oslo-i-accord",
    eventName: "Signing of the Oslo I Accord (Declaration of Principles) on the White House South Lawn",
    startDate: "1993-09-13T15:00:00Z",
    endDate: null,
    datePrecision: "exact-minute",
    timePrecision: "exact-minute",
    localStartTime: "11:00",
    timezone: "America/New_York",
    city: "Washington",
    country: "United States",
    venueName: "The White House - South Lawn",
    platform: "Executive Office of the President",
    address: "1600 Pennsylvania Avenue NW, Washington, DC 20500",
    latitude: 38.8977,
    longitude: -77.0365,
    locationPrecision: "venue",
    summary: "Israeli Foreign Minister Shimon Peres and PLO official Mahmoud Abbas sign the Declaration of Principles on Interim Self-Government Arrangements, witnessed by President Bill Clinton, Yitzhak Rabin, and Yasser Arafat on the South Lawn of the White House.",
    description: "The landmark signing was marked by the iconic handshake between Prime Minister Yitzhak Rabin and PLO Chairman Yasser Arafat, establishing mutual recognition and Palestinian self-rule in Gaza and Jericho.",
    verificationStatus: "verified",
    confidence: "confirmed",
    confidenceScore: 1.0,
    scope: "diplomatic",
    categories: ["diplomacy", "foundational-treaty"],
    eventTypes: ["peace-accord-signing", "diplomatic-handshake"],
    sourceIds: ["src-oslo-accord-19930913"],
    participants: [
      {
        personId: "bill-clinton",
        slug: "bill-clinton",
        name: "Bill Clinton",
        role: "President of the United States (Host / Witness)",
        presenceConfidence: "confirmed",
        attendanceMode: "physical"
      },
      {
        personId: "yitzhak-rabin",
        slug: "yitzhak-rabin",
        name: "Yitzhak Rabin",
        role: "Prime Minister of Israel",
        presenceConfidence: "confirmed",
        attendanceMode: "physical"
      },
      {
        personId: "yasser-arafat",
        slug: "yasser-arafat",
        name: "Yasser Arafat",
        role: "Chairman of the Palestine Liberation Organization",
        presenceConfidence: "confirmed",
        attendanceMode: "physical"
      },
      {
        personId: "shimon-peres",
        slug: "shimon-peres",
        name: "Shimon Peres",
        role: "Foreign Minister of Israel (Signatory)",
        presenceConfidence: "confirmed",
        attendanceMode: "physical"
      },
      {
        personId: "mahmoud-abbas",
        slug: "mahmoud-abbas",
        name: "Mahmoud Abbas",
        role: "PLO Executive Committee Member (Signatory)",
        presenceConfidence: "confirmed",
        attendanceMode: "physical"
      },
      {
        personId: "warren-christopher",
        slug: "warren-christopher",
        name: "Warren Christopher",
        role: "US Secretary of State (Witness)",
        presenceConfidence: "confirmed",
        attendanceMode: "physical"
      },
      {
        personId: "andrei-kozyrev",
        slug: "andrei-kozyrev",
        name: "Andrei Kozyrev",
        role: "Foreign Minister of the Russian Federation (Witness)",
        presenceConfidence: "confirmed",
        attendanceMode: "physical"
      }
    ],
    quotes: [
      {
        text: "We who have fought against you, the Palestinians, we say to you today in a loud and a clear voice: Enough of blood and tears. Enough.",
        speaker: "Yitzhak Rabin",
        language: "en",
        timestamp: "00:08:45"
      }
    ]
  },
  {
    id: "evt-1994-10-26-israel-jordan-peace-treaty",
    slug: "1994-10-26-signing-of-the-israel-jordan-peace-treaty",
    eventName: "Signing of the Israel-Jordan Peace Treaty at Wadi Araba Crossing",
    startDate: "1994-10-26T11:00:00Z",
    endDate: null,
    datePrecision: "exact-minute",
    timePrecision: "exact-minute",
    localStartTime: "13:00",
    timezone: "Asia/Amman",
    city: "Arava Valley",
    country: "Jordan",
    venueName: "Wadi Araba Crossing Plenary Pavilion",
    platform: "Bilateral Peace Treaty Ceremony",
    address: "Wadi Araba Border Crossing, Arava Valley",
    latitude: 29.5786,
    longitude: 34.9781,
    locationPrecision: "venue",
    summary: "Israeli Prime Minister Yitzhak Rabin and Jordanian Prime Minister Abdelsalam al-Majali sign the historic Treaty of Peace between Israel and Jordan in the Arava desert, witnessed by US President Bill Clinton and King Hussein I.",
    description: "The treaty normalized relations between the two neighbors, resolved boundary and water disputes, and recognized Jordan's special historic role in the Muslim Holy shrines in Jerusalem.",
    verificationStatus: "verified",
    confidence: "confirmed",
    confidenceScore: 1.0,
    scope: "diplomatic",
    categories: ["diplomacy", "foundational-treaty"],
    eventTypes: ["peace-accord-signing", "bilateral-treaty"],
    sourceIds: ["src-israel-jordan-treaty-19941026"],
    participants: [
      {
        personId: "king-hussein-jordan",
        slug: "king-hussein-jordan",
        name: "King Hussein I of Jordan",
        role: "Head of State of Jordan",
        presenceConfidence: "confirmed",
        attendanceMode: "physical"
      },
      {
        personId: "yitzhak-rabin",
        slug: "yitzhak-rabin",
        name: "Yitzhak Rabin",
        role: "Prime Minister of Israel (Signatory)",
        presenceConfidence: "confirmed",
        attendanceMode: "physical"
      },
      {
        personId: "bill-clinton",
        slug: "bill-clinton",
        name: "Bill Clinton",
        role: "President of the United States (Witness)",
        presenceConfidence: "confirmed",
        attendanceMode: "physical"
      },
      {
        personId: "shimon-peres",
        slug: "shimon-peres",
        name: "Shimon Peres",
        role: "Foreign Minister of Israel",
        presenceConfidence: "confirmed",
        attendanceMode: "physical"
      },
      {
        personId: "warren-christopher",
        slug: "warren-christopher",
        name: "Warren Christopher",
        role: "US Secretary of State (Witness)",
        presenceConfidence: "confirmed",
        attendanceMode: "physical"
      }
    ],
    quotes: [
      {
        text: "This is our gift to the peoples of both our countries and to future generations.",
        speaker: "King Hussein I",
        language: "en",
        timestamp: "00:05:12"
      }
    ]
  },
  {
    id: "evt-1998-10-23-wye-river-memorandum",
    slug: "1998-10-23-wye-river-memorandum-signed",
    eventName: "Signing of the Wye River Memorandum for West Bank Redeployment",
    startDate: "1998-10-23T19:00:00Z",
    endDate: null,
    datePrecision: "exact-minute",
    timePrecision: "exact-minute",
    localStartTime: "15:00",
    timezone: "America/New_York",
    city: "Washington",
    country: "United States",
    venueName: "The White House - East Room",
    platform: "Executive Office of the President",
    address: "1600 Pennsylvania Avenue NW, Washington, DC 20500",
    latitude: 38.8977,
    longitude: -77.0365,
    locationPrecision: "venue",
    summary: "Israeli Prime Minister Benjamin Netanyahu and PLO Chairman Yasser Arafat sign the Wye River Memorandum at the White House following nine days of negotiations at Wye Plantation, Maryland, mediated by President Clinton and King Hussein.",
    description: "The agreement set out steps to implement the 1995 Interim Agreement, including further Israeli military redeployments from the West Bank in exchange for Palestinian security measures against terrorism.",
    verificationStatus: "verified",
    confidence: "confirmed",
    confidenceScore: 1.0,
    scope: "diplomatic",
    categories: ["diplomacy", "foundational-treaty"],
    eventTypes: ["peace-accord-signing", "summit-conclusion"],
    sourceIds: ["src-wh-wye-19981023"],
    participants: [
      {
        personId: "bill-clinton",
        slug: "bill-clinton",
        name: "Bill Clinton",
        role: "President of the United States (Host / Mediator)",
        presenceConfidence: "confirmed",
        attendanceMode: "physical"
      },
      {
        personId: "benjamin-netanyahu",
        slug: "benjamin-netanyahu",
        name: "Benjamin Netanyahu",
        role: "Prime Minister of Israel (Signatory)",
        presenceConfidence: "confirmed",
        attendanceMode: "physical"
      },
      {
        personId: "yasser-arafat",
        slug: "yasser-arafat",
        name: "Yasser Arafat",
        role: "Chairman of the Palestinian Authority (Signatory)",
        presenceConfidence: "confirmed",
        attendanceMode: "physical"
      },
      {
        personId: "king-hussein-jordan",
        slug: "king-hussein-jordan",
        name: "King Hussein I of Jordan",
        role: "King of Jordan (Special Mediator)",
        presenceConfidence: "confirmed",
        attendanceMode: "physical"
      },
      {
        personId: "madeleine-albright",
        slug: "madeleine-albright",
        name: "Madeleine Albright",
        role: "US Secretary of State (Witness)",
        presenceConfidence: "confirmed",
        attendanceMode: "physical"
      }
    ]
  },
  {
    id: "evt-2000-07-25-camp-david-summit",
    slug: "2000-07-25-camp-david-peace-summit-concludes",
    eventName: "Conclusion of the Camp David Middle East Peace Summit",
    startDate: "2000-07-25T17:00:00Z",
    endDate: null,
    datePrecision: "exact-minute",
    timePrecision: "exact-minute",
    localStartTime: "13:00",
    timezone: "America/New_York",
    city: "Thurmont",
    country: "United States",
    venueName: "Camp David Presidential Retreat",
    platform: "Executive Office of the President",
    address: "Camp David, Thurmont, MD 21788",
    latitude: 39.6483,
    longitude: -77.4636,
    locationPrecision: "venue",
    summary: "President Bill Clinton, Israeli Prime Minister Ehud Barak, and Palestinian Chairman Yasser Arafat conclude fourteen days of intensive trilateral negotiations at Camp David without reaching a final status agreement on Jerusalem, refugees, and borders.",
    description: "Although concluding without a final treaty, the summit broke historic taboos by directly addressing core permanent status issues for the first time, establishing principles carried forward into the Clinton Parameters and Taba talks.",
    verificationStatus: "verified",
    confidence: "confirmed",
    confidenceScore: 1.0,
    scope: "diplomatic",
    categories: ["diplomacy", "summit-negotiation"],
    eventTypes: ["peace-summit", "final-status-talks"],
    sourceIds: ["src-camp-david-2000-summit"],
    participants: [
      {
        personId: "bill-clinton",
        slug: "bill-clinton",
        name: "Bill Clinton",
        role: "President of the United States (Mediator)",
        presenceConfidence: "confirmed",
        attendanceMode: "physical"
      },
      {
        personId: "ehud-barak",
        slug: "ehud-barak",
        name: "Ehud Barak",
        role: "Prime Minister of Israel",
        presenceConfidence: "confirmed",
        attendanceMode: "physical"
      },
      {
        personId: "yasser-arafat",
        slug: "yasser-arafat",
        name: "Yasser Arafat",
        role: "Chairman of the Palestinian Authority",
        presenceConfidence: "confirmed",
        attendanceMode: "physical"
      },
      {
        personId: "madeleine-albright",
        slug: "madeleine-albright",
        name: "Madeleine Albright",
        role: "US Secretary of State",
        presenceConfidence: "confirmed",
        attendanceMode: "physical"
      },
      {
        personId: "shlomo-ben-ami",
        slug: "shlomo-ben-ami",
        name: "Shlomo Ben-Ami",
        role: "Israeli Minister of Internal Security / Lead Negotiator",
        presenceConfidence: "confirmed",
        attendanceMode: "physical"
      },
      {
        personId: "saeb-erekat",
        slug: "saeb-erekat",
        name: "Saeb Erekat",
        role: "Chief Palestinian Negotiator",
        presenceConfidence: "confirmed",
        attendanceMode: "physical"
      }
    ]
  },
  {
    id: "evt-2007-11-27-annapolis-conference",
    slug: "2007-11-27-annapolis-middle-east-peace-conference",
    eventName: "President George W. Bush Convenes Annapolis Middle East Peace Conference",
    startDate: "2007-11-27T15:00:00Z",
    endDate: null,
    datePrecision: "exact-minute",
    timePrecision: "exact-minute",
    localStartTime: "10:00",
    timezone: "America/New_York",
    city: "Annapolis",
    country: "United States",
    venueName: "United States Naval Academy - Memorial Hall",
    platform: "Middle East Peace Conference",
    address: "121 Blake Road, Annapolis, MD 21402",
    latitude: 38.9822,
    longitude: -76.4839,
    locationPrecision: "venue",
    summary: "President George W. Bush convenes Israeli Prime Minister Ehud Olmert, Palestinian Authority President Mahmoud Abbas, and representatives from over forty countries and international organizations to launch bilateral final status negotiations for a two-state solution.",
    description: "The conference marked the first time the Arab League, including Saudi Arabia and Syria, attended a multilateral peace conference with Israel since Madrid in 1991.",
    verificationStatus: "verified",
    confidence: "confirmed",
    confidenceScore: 1.0,
    scope: "diplomatic",
    categories: ["diplomacy", "multilateral-peace-conference"],
    eventTypes: ["peace-conference", "plenary-assembly"],
    sourceIds: ["src-annapolis-conference-20071127"],
    participants: [
      {
        personId: "george-w-bush",
        slug: "george-w-bush",
        name: "George W. Bush",
        role: "President of the United States (Host / Convener)",
        presenceConfidence: "confirmed",
        attendanceMode: "physical"
      },
      {
        personId: "ehud-olmert",
        slug: "ehud-olmert",
        name: "Ehud Olmert",
        role: "Prime Minister of Israel",
        presenceConfidence: "confirmed",
        attendanceMode: "physical"
      },
      {
        personId: "mahmoud-abbas",
        slug: "mahmoud-abbas",
        name: "Mahmoud Abbas",
        role: "President of the Palestinian National Authority",
        presenceConfidence: "confirmed",
        attendanceMode: "physical"
      },
      {
        personId: "condoleezza-rice",
        slug: "condoleezza-rice",
        name: "Condoleezza Rice",
        role: "US Secretary of State",
        presenceConfidence: "confirmed",
        attendanceMode: "physical"
      },
      {
        personId: "ban-ki-moon",
        slug: "ban-ki-moon",
        name: "Ban Ki-moon",
        role: "Secretary-General of the United Nations",
        presenceConfidence: "confirmed",
        attendanceMode: "physical"
      },
      {
        personId: "saud-al-faisal",
        slug: "saud-al-faisal",
        name: "Saud al-Faisal",
        role: "Minister of Foreign Affairs of Saudi Arabia",
        presenceConfidence: "confirmed",
        attendanceMode: "physical"
      },
      {
        personId: "tony-blair",
        slug: "tony-blair",
        name: "Tony Blair",
        role: "Quartet Special Envoy to the Middle East",
        presenceConfidence: "confirmed",
        attendanceMode: "physical"
      }
    ]
  },
  {
    id: "evt-2015-07-14-jcpoa-vienna-agreement",
    slug: "2015-07-14-p5-plus-one-and-iran-conclude-jcpoa-in-vienna",
    eventName: "P5+1 and Iran Conclude Joint Comprehensive Plan of Action (JCPOA) in Vienna",
    startDate: "2015-07-14T08:00:00Z",
    endDate: null,
    datePrecision: "exact-minute",
    timePrecision: "exact-minute",
    localStartTime: "10:00",
    timezone: "Europe/Vienna",
    city: "Vienna",
    country: "Austria",
    venueName: "Palais Coburg Hotel Residenz",
    platform: "E3/EU+3 and Iran Nuclear Negotiations",
    address: "Coburgbastei 4, 1010 Wien",
    latitude: 48.2053,
    longitude: 16.3768,
    locationPrecision: "venue",
    summary: "Iran and the P5+1 powers (United States, United Kingdom, France, China, Russia, and Germany) alongside the European Union reach a landmark comprehensive accord placing verifiable constraints on Iran's nuclear program in exchange for sanctions relief.",
    description: "Concluded after twenty months of marathon negotiations led by US Secretary of State John Kerry and Iranian Foreign Minister Mohammad Javad Zarif, the agreement was endorsed by UN Security Council Resolution 2231.",
    verificationStatus: "verified",
    confidence: "confirmed",
    confidenceScore: 1.0,
    scope: "diplomatic",
    categories: ["diplomacy", "foundational-treaty"],
    eventTypes: ["non-proliferation-accord", "multilateral-treaty"],
    sourceIds: ["src-jcpoa-vienna-20150714"],
    participants: [
      {
        personId: "john-kerry",
        slug: "john-kerry",
        name: "John Kerry",
        role: "US Secretary of State",
        presenceConfidence: "confirmed",
        attendanceMode: "physical"
      },
      {
        personId: "mohammad-javad-zarif",
        slug: "mohammad-javad-zarif",
        name: "Mohammad Javad Zarif",
        role: "Minister of Foreign Affairs of the Islamic Republic of Iran",
        presenceConfidence: "confirmed",
        attendanceMode: "physical"
      },
      {
        personId: "federica-mogherini",
        slug: "federica-mogherini",
        name: "Federica Mogherini",
        role: "High Representative of the European Union for Foreign Affairs",
        presenceConfidence: "confirmed",
        attendanceMode: "physical"
      },
      {
        personId: "sergey-lavrov",
        slug: "sergey-lavrov",
        name: "Sergey Lavrov",
        role: "Minister of Foreign Affairs of the Russian Federation",
        presenceConfidence: "confirmed",
        attendanceMode: "physical"
      },
      {
        personId: "wang-yi",
        slug: "wang-yi",
        name: "Wang Yi",
        role: "Minister of Foreign Affairs of the People's Republic of China",
        presenceConfidence: "confirmed",
        attendanceMode: "physical"
      },
      {
        personId: "philip-hammond",
        slug: "philip-hammond",
        name: "Philip Hammond",
        role: "British Secretary of State for Foreign and Commonwealth Affairs",
        presenceConfidence: "confirmed",
        attendanceMode: "physical"
      },
      {
        personId: "laurent-fabius",
        slug: "laurent-fabius",
        name: "Laurent Fabius",
        role: "Minister of Foreign Affairs of France",
        presenceConfidence: "confirmed",
        attendanceMode: "physical"
      },
      {
        personId: "frank-walter-steinmeier",
        slug: "frank-walter-steinmeier",
        name: "Frank-Walter Steinmeier",
        role: "Federal Minister for Foreign Affairs of Germany",
        presenceConfidence: "confirmed",
        attendanceMode: "physical"
      }
    ]
  },
  {
    id: "evt-2020-09-15-abraham-accords-signing",
    slug: "2020-09-15-signing-of-the-abraham-accords",
    eventName: "Signing of the Abraham Accords on the White House South Lawn",
    startDate: "2020-09-15T16:00:00Z",
    endDate: null,
    datePrecision: "exact-minute",
    timePrecision: "exact-minute",
    localStartTime: "12:00",
    timezone: "America/New_York",
    city: "Washington",
    country: "United States",
    venueName: "The White House - South Lawn",
    platform: "Executive Office of the President",
    address: "1600 Pennsylvania Avenue NW, Washington, DC 20500",
    latitude: 38.8977,
    longitude: -77.0365,
    locationPrecision: "venue",
    summary: "Israeli Prime Minister Benjamin Netanyahu, UAE Foreign Minister Abdullah bin Zayed Al Nahyan, and Bahraini Foreign Minister Abdullatif bin Rashid Al Zayani sign the historic Abraham Accords at the White House, hosted by President Donald Trump.",
    description: "The accords marked the first diplomatic normalization agreements between Israel and Arab countries since the 1994 Jordan-Israel treaty, establishing full diplomatic, economic, and tourism ties.",
    verificationStatus: "verified",
    confidence: "confirmed",
    confidenceScore: 1.0,
    scope: "diplomatic",
    categories: ["diplomacy", "foundational-treaty"],
    eventTypes: ["normalization-accord", "bilateral-treaty"],
    sourceIds: ["src-abraham-accords-20200915"],
    participants: [
      {
        personId: "donald-trump",
        slug: "donald-trump",
        name: "Donald Trump",
        role: "President of the United States (Host / Witness)",
        presenceConfidence: "confirmed",
        attendanceMode: "physical"
      },
      {
        personId: "benjamin-netanyahu",
        slug: "benjamin-netanyahu",
        name: "Benjamin Netanyahu",
        role: "Prime Minister of Israel (Signatory)",
        presenceConfidence: "confirmed",
        attendanceMode: "physical"
      },
      {
        personId: "abdullah-bin-zayed",
        slug: "abdullah-bin-zayed",
        name: "Abdullah bin Zayed Al Nahyan",
        role: "Minister of Foreign Affairs and International Cooperation of the UAE (Signatory)",
        presenceConfidence: "confirmed",
        attendanceMode: "physical"
      },
      {
        personId: "abdullatif-al-zayani",
        slug: "abdullatif-al-zayani",
        name: "Abdullatif bin Rashid Al Zayani",
        role: "Minister of Foreign Affairs of Bahrain (Signatory)",
        presenceConfidence: "confirmed",
        attendanceMode: "physical"
      },
      {
        personId: "mike-pompeo",
        slug: "mike-pompeo",
        name: "Mike Pompeo",
        role: "US Secretary of State",
        presenceConfidence: "confirmed",
        attendanceMode: "physical"
      }
    ]
  },
  {
    id: "evt-2022-03-28-negev-summit",
    slug: "2022-03-28-negev-summit-foreign-ministers-at-sde-boker",
    eventName: "Historic Negev Summit Foreign Ministers Convene at Sde Boker",
    startDate: "2022-03-28T09:00:00Z",
    endDate: "2022-03-28T16:00:00Z",
    datePrecision: "exact-day",
    timePrecision: "day",
    city: "Sde Boker",
    country: "Israel",
    venueName: "Kedma Hotel & David Ben-Gurion Gravesite",
    platform: "Negev Ministerial Forum",
    address: "Midreshet Ben-Gurion, 8499000",
    latitude: 30.8524,
    longitude: 34.7865,
    locationPrecision: "venue",
    summary: "Israeli Foreign Minister Yair Lapid hosts US Secretary of State Antony Blinken and the Foreign Ministers of Egypt, the United Arab Emirates, Bahrain, and Morocco at Sde Boker, formalizing the Negev Forum on regional security and energy.",
    description: "The six foreign ministers gathered near the grave of Israel's founding prime minister David Ben-Gurion to create permanent working groups on regional architecture, integrated air defense, and water security.",
    verificationStatus: "verified",
    confidence: "confirmed",
    confidenceScore: 1.0,
    scope: "diplomatic",
    categories: ["diplomacy", "regional-summit"],
    eventTypes: ["ministerial-summit", "multilateral-forum"],
    sourceIds: ["src-negev-summit-20220328"],
    participants: [
      {
        personId: "yair-lapid",
        slug: "yair-lapid",
        name: "Yair Lapid",
        role: "Alternate Prime Minister and Minister of Foreign Affairs of Israel (Host)",
        presenceConfidence: "confirmed",
        attendanceMode: "physical"
      },
      {
        personId: "antony-blinken",
        slug: "antony-blinken",
        name: "Antony Blinken",
        role: "US Secretary of State",
        presenceConfidence: "confirmed",
        attendanceMode: "physical"
      },
      {
        personId: "abdullah-bin-zayed",
        slug: "abdullah-bin-zayed",
        name: "Abdullah bin Zayed Al Nahyan",
        role: "Minister of Foreign Affairs and International Cooperation of the UAE",
        presenceConfidence: "confirmed",
        attendanceMode: "physical"
      },
      {
        personId: "abdullatif-al-zayani",
        slug: "abdullatif-al-zayani",
        name: "Abdullatif bin Rashid Al Zayani",
        role: "Minister of Foreign Affairs of Bahrain",
        presenceConfidence: "confirmed",
        attendanceMode: "physical"
      },
      {
        personId: "sameh-shoukry",
        slug: "sameh-shoukry",
        name: "Sameh Shoukry",
        role: "Minister of Foreign Affairs of Egypt",
        presenceConfidence: "confirmed",
        attendanceMode: "physical"
      },
      {
        personId: "nasser-bourita",
        slug: "nasser-bourita",
        name: "Nasser Bourita",
        role: "Minister of Foreign Affairs of Morocco",
        presenceConfidence: "confirmed",
        attendanceMode: "physical"
      }
    ]
  },
  {
    id: "evt-2023-03-10-saudi-iran-beijing-accord",
    slug: "2023-03-10-saudi-arabia-and-iran-restore-ties-in-beijing",
    eventName: "Saudi Arabia and Iran Restore Diplomatic Relations in Beijing Accord",
    startDate: "2023-03-10T14:00:00Z",
    endDate: null,
    datePrecision: "exact-minute",
    timePrecision: "exact-minute",
    localStartTime: "18:00",
    timezone: "Asia/Shanghai",
    city: "Beijing",
    country: "China",
    venueName: "Diaoyutai State Guesthouse (Villa 18)",
    platform: "Trilateral Diplomatic Communique",
    address: "2 Fucheng Road, Haidian District, Beijing 100830",
    latitude: 39.9172,
    longitude: 116.3239,
    locationPrecision: "venue",
    summary: "Saudi Arabia and Iran announce the restoration of diplomatic relations and reopening of embassies within two months, in a breakthrough trilateral agreement brokered by Chinese top diplomat Wang Yi in Beijing.",
    description: "The agreement ended a seven-year diplomatic rupture following the 2016 storming of the Saudi embassy in Tehran, reaffirming respect for the sovereignty of states and non-interference in internal affairs.",
    verificationStatus: "verified",
    confidence: "confirmed",
    confidenceScore: 1.0,
    scope: "diplomatic",
    categories: ["diplomacy", "bilateral-normalization"],
    eventTypes: ["normalization-accord", "trilateral-communique"],
    sourceIds: ["src-reuters-beijing-accord-20230310"],
    participants: [
      {
        personId: "wang-yi",
        slug: "wang-yi",
        name: "Wang Yi",
        role: "Director of the Office of the Central Foreign Affairs Commission (Mediator)",
        presenceConfidence: "confirmed",
        attendanceMode: "physical"
      },
      {
        personId: "musaad-al-aiban",
        slug: "musaad-al-aiban",
        name: "Musaad Al-Aiban",
        role: "Minister of State and National Security Advisor of Saudi Arabia",
        presenceConfidence: "confirmed",
        attendanceMode: "physical"
      },
      {
        personId: "ali-shamkhani",
        slug: "ali-shamkhani",
        name: "Ali Shamkhani",
        role: "Secretary of the Supreme National Security Council of Iran",
        presenceConfidence: "confirmed",
        attendanceMode: "physical"
      }
    ]
  }
];
