/**
 * Development and test fixtures for the in-memory relational store.
 * Strictly isolated for local testing and non-production execution.
 */

export interface TestPerson {
  id: string;
  slug: string;
  name: string;
  birth: string;
  death?: string | null;
  description: string;
  classification?: string;
}

export interface TestSource {
  id: string;
  title: string;
  publisher: string;
  sourceType: string;
  classification: "primary" | "secondary";
  url?: string | null;
  publicationDate?: string | null;
  accessedDate?: string | null;
}

export interface TestEvent {
  id: string;
  slug: string;
  eventName: string;
  summary: string;
  startDate: string;
  endDate?: string | null;
  city: string;
  venueName?: string | null;
  country: string;
  latitude?: number | null;
  longitude?: number | null;
  verificationStatus: "verified" | "provisional" | "disputed";
  categories: string[];
  eventTypes: string[];
  sourceIds: string[];
  participants?: Array<{
    personId: string;
    name: string;
    presenceConfidence?: "confirmed" | "strong" | "moderate" | "limited";
  }>;
}

export const testPeople: TestPerson[] = [
  {
    id: "person-netanyahu",
    slug: "benjamin-netanyahu",
    name: "Benjamin Netanyahu",
    birth: "1949-10-21",
    death: null,
    description: "Prime Minister of Israel",
    classification: "prime-minister",
  },
  {
    id: "person-clinton",
    slug: "bill-clinton",
    name: "Bill Clinton",
    birth: "1946-08-19",
    death: null,
    description: "42nd President of the United States",
    classification: "head-of-state",
  },
  {
    id: "person-rabin",
    slug: "yitzhak-rabin",
    name: "Yitzhak Rabin",
    birth: "1922-03-01",
    death: "1995-11-04",
    description: "Prime Minister of Israel",
    classification: "prime-minister",
  },
  {
    id: "person-arafat",
    slug: "yasser-arafat",
    name: "Yasser Arafat",
    birth: "1929-08-24",
    death: "2004-11-11",
    description: "Chairman of the Palestine Liberation Organization",
    classification: "head-of-state",
  },
  {
    id: "person-sadat",
    slug: "anwar-sadat",
    name: "Anwar Sadat",
    birth: "1918-12-25",
    death: "1981-10-06",
    description: "President of Egypt",
    classification: "head-of-state",
  },
  {
    id: "person-mubarak",
    slug: "hosni-mubarak",
    name: "Hosni Mubarak",
    birth: "1928-05-04",
    death: "2020-02-25",
    description: "President of Egypt",
    classification: "head-of-state",
  },
  {
    id: "person-hussein",
    slug: "king-hussein",
    name: "King Hussein",
    birth: "1935-11-14",
    death: "1999-02-07",
    description: "King of the Hashemite Kingdom of Jordan",
    classification: "head-of-state",
  },
];

export const testSources: TestSource[] = [
  {
    id: "src-un-record-01",
    title: "United Nations Digital Library General Assembly Official Record",
    publisher: "United Nations",
    sourceType: "official-record",
    classification: "primary",
    url: "https://digitallibrary.un.org/record/712345",
    publicationDate: "2011-09-23",
  },
  {
    id: "src-wh-briefing-01",
    title: "White House Press Briefing and Transcript Register",
    publisher: "The White House Historical Office",
    sourceType: "official-record",
    classification: "primary",
    url: "https://www.whitehouse.gov/briefing-room",
    publicationDate: "1998-10-23",
  },
  {
    id: "src-ap-archive-01",
    title: "Associated Press Diplomatic Wire Dispatch",
    publisher: "Associated Press",
    sourceType: "contemporary-report",
    classification: "secondary",
    url: "https://apnews.com/archive",
    publicationDate: "1998-10-23",
  },
];

export const testEvents: TestEvent[] = [
  {
    id: "evt-1998-10-23-wye-river",
    slug: "wye-river-memorandum-signing",
    eventName: "Wye River Memorandum Signing Ceremony",
    summary: "President Bill Clinton and Prime Minister Benjamin Netanyahu sign the interim agreement at the White House.",
    startDate: "1998-10-23",
    endDate: "1998-10-23",
    city: "Washington, D.C.",
    venueName: "White House East Room",
    country: "United States",
    latitude: 38.8977,
    longitude: -77.0365,
    verificationStatus: "verified",
    categories: ["diplomacy", "treaty"],
    eventTypes: ["signing-ceremony"],
    sourceIds: ["src-wh-briefing-01", "src-ap-archive-01"],
    participants: [
      { personId: "benjamin-netanyahu", name: "Benjamin Netanyahu", presenceConfidence: "confirmed" },
      { personId: "bill-clinton", name: "Bill Clinton", presenceConfidence: "confirmed" },
      { personId: "yasser-arafat", name: "Yasser Arafat", presenceConfidence: "confirmed" },
      { personId: "king-hussein", name: "King Hussein", presenceConfidence: "confirmed" },
    ],
  },
  {
    id: "evt-2011-09-23-unga-plenary",
    slug: "netanyahu-unga-address-2011",
    eventName: "UN General Assembly 66th Session Address",
    summary: "Prime Minister Benjamin Netanyahu addresses the United Nations General Assembly in New York.",
    startDate: "2011-09-23",
    endDate: "2011-09-23",
    city: "New York",
    venueName: "UN General Assembly Hall",
    country: "United States",
    latitude: 40.7499,
    longitude: -73.968,
    verificationStatus: "verified",
    categories: ["diplomacy", "speech"],
    eventTypes: ["speech-plenary"],
    sourceIds: ["src-un-record-01"],
    participants: [
      { personId: "benjamin-netanyahu", name: "Benjamin Netanyahu", presenceConfidence: "confirmed" },
    ],
  },
];
