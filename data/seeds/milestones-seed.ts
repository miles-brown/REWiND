export interface MilestoneSeed {
  id: string;
  personId: string;
  title: string;
  category: "achievement" | "record" | "statistic" | "honor" | "landmark-fact";
  date: string;
  year: number;
  description: string;
  metricOrStat: string;
  sourceId?: string;
}

export const milestonesSeed: MilestoneSeed[] = [
  // Benjamin Netanyahu
  {
    id: "mlst-netanyahu-1984-un-address",
    personId: "benjamin-netanyahu",
    title: "Delivered First Major UN General Assembly Address on Palestine",
    category: "achievement",
    date: "1984-12-11",
    year: 1984,
    description: "Represented Israel at the 39th UN General Assembly debate, establishing a high-profile diplomatic presence.",
    metricOrStat: "39th UN General Assembly Debate"
  },
  {
    id: "mlst-netanyahu-1996-youngest-pm",
    personId: "benjamin-netanyahu",
    title: "Elected Youngest Prime Minister in Israeli History",
    category: "record",
    date: "1996-05-29",
    year: 1996,
    description: "Won the first direct election for Prime Minister of Israel at age 46, becoming the first PM born in Israel after independence.",
    metricOrStat: "Age 46 (Youngest PM)"
  },
  {
    id: "mlst-netanyahu-longest-serving-pm",
    personId: "benjamin-netanyahu",
    title: "Surpassed David Ben-Gurion as Longest-Serving Israeli Prime Minister",
    category: "record",
    date: "2019-07-20",
    year: 2019,
    description: "Reached 4,876 total days in office, exceeding founding Prime Minister David Ben-Gurion's tenure.",
    metricOrStat: "16+ Years Total Tenure"
  },
  {
    id: "mlst-netanyahu-abraham-accords-2020",
    personId: "benjamin-netanyahu",
    title: "Signed the Landmark 2020 Abraham Accords at the White House",
    category: "achievement",
    date: "2020-09-15",
    year: 2020,
    description: "Signed bilateral normalization treaties with the United Arab Emirates and Bahrain in Washington, D.C.",
    metricOrStat: "4 Normalization Accords"
  },

  // Shimon Peres & Yitzhak Rabin
  {
    id: "mlst-rabin-nobel-1994",
    personId: "yitzhak-rabin",
    title: "Awarded 1994 Nobel Peace Prize for the Oslo Accords",
    category: "honor",
    date: "1994-12-10",
    year: 1994,
    description: "Co-awarded the Nobel Peace Prize alongside Shimon Peres and Yasser Arafat in Oslo, Norway.",
    metricOrStat: "1994 Nobel Peace Prize"
  },
  {
    id: "mlst-peres-nobel-1994",
    personId: "shimon-peres",
    title: "Awarded 1994 Nobel Peace Prize for Diplomatic Peace Initiatives",
    category: "honor",
    date: "1994-12-10",
    year: 1994,
    description: "Co-awarded the Nobel Peace Prize alongside Yitzhak Rabin and Yasser Arafat.",
    metricOrStat: "1994 Nobel Peace Prize"
  },
  {
    id: "mlst-arafat-nobel-1994",
    personId: "yasser-arafat",
    title: "Co-awarded 1994 Nobel Peace Prize for Historic Middle East Peace Accords",
    category: "honor",
    date: "1994-12-10",
    year: 1994,
    description: "Received Nobel Peace Prize alongside Yitzhak Rabin and Shimon Peres.",
    metricOrStat: "1994 Nobel Peace Prize"
  },

  // Jared Kushner
  {
    id: "mlst-kushner-abraham-accords",
    personId: "jared-kushner",
    title: "Brokered 2020 Abraham Accords Diplomatic Normalization Agreements",
    category: "achievement",
    date: "2020-09-15",
    year: 2020,
    description: "Led diplomatic negotiations resulting in peace and normalization accords between Israel, UAE, Bahrain, Sudan, and Morocco.",
    metricOrStat: "5 Sovereign Accord Signatories"
  },

  // Larry King
  {
    id: "mlst-larry-king-50k-interviews",
    personId: "larry-king",
    title: "Conducted Over 50,000 On-Air Interviews Across 5 Decades",
    category: "statistic",
    date: "2010-12-16",
    year: 2010,
    description: "Completed 25 continuous years hosting Larry King Live on CNN with over 50,000 interview records.",
    metricOrStat: "50,000+ Interviews Conducted"
  },

  // Elon Musk
  {
    id: "mlst-musk-doge-2025",
    personId: "elon-musk",
    title: "Appointed Co-Lead of US Department of Government Efficiency (DOGE)",
    category: "landmark-fact",
    date: "2025-01-20",
    year: 2025,
    description: "Appointed by President Donald Trump to direct federal agency efficiency audits and expenditure restructuring.",
    metricOrStat: "Co-Lead Federal Advisory Commission"
  },

  // Sir Keir Starmer
  {
    id: "mlst-starmer-2024-landslide",
    personId: "keir-starmer",
    title: "Led Labour Party to 412-Seat Landslide Victory in 2024 General Election",
    category: "record",
    date: "2024-07-04",
    year: 2024,
    description: "Secured a 174-seat majority in the UK House of Commons, ending 14 years of Conservative rule.",
    metricOrStat: "412 Parliamentary Seats Won"
  },

  // Barack Obama
  {
    id: "mlst-obama-2009-nobel",
    personId: "barack-obama",
    title: "Awarded 2009 Nobel Peace Prize for International Diplomacy",
    category: "honor",
    date: "2009-10-09",
    year: 2009,
    description: "Awarded the Nobel Peace Prize for extraordinary efforts to strengthen international diplomacy and cooperation between peoples.",
    metricOrStat: "2009 Nobel Peace Prize"
  }
];
