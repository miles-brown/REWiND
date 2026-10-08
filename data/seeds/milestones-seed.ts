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
  // 1. Benjamin Netanyahu
  {
    id: "mlst-netanyahu-1972-operation-isotope",
    personId: "benjamin-netanyahu",
    title: "Decorated for Valor in Sabena Flight 571 Counter-Terrorist Hostage Rescue",
    category: "honor",
    date: "1972-05-09",
    year: 1972,
    description: "Led Sayeret Matkal assault team storming hijacked aircraft at Lod Airport, sustaining a gunshot wound during the successful rescue of 100 passengers.",
    metricOrStat: "100 Hostages Rescued"
  },
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
    id: "mlst-netanyahu-1997-hebron",
    personId: "benjamin-netanyahu",
    title: "Signed the Protocol Concerning the Redeployment in Hebron",
    category: "achievement",
    date: "1997-01-17",
    year: 1997,
    description: "Concluded the Hebron Protocol transferring civil authority and military control of Area H-1 to the Palestinian National Authority.",
    metricOrStat: "Hebron Redeployment Protocol"
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
  {
    id: "mlst-netanyahu-2024-congress-record",
    personId: "benjamin-netanyahu",
    title: "Addressed Joint Session of US Congress for a Record 4th Time",
    category: "record",
    date: "2024-07-24",
    year: 2024,
    description: "Became the first foreign world leader in history to address a Joint Meeting of the United States Congress four times, surpassing Winston Churchill.",
    metricOrStat: "4 Joint Congressional Addresses"
  },

  // 2. Ehud Barak
  {
    id: "mlst-barak-most-decorated",
    personId: "ehud-barak",
    title: "Became Most Decorated Soldier in Israel Defense Forces History",
    category: "record",
    date: "1973-10-01",
    year: 1973,
    description: "Awarded the Order of Distinguished Service and four Chief of General Staff citations for valor and covert operations.",
    metricOrStat: "5 Valor Medals / Citations"
  },
  {
    id: "mlst-barak-camp-david-2000",
    personId: "ehud-barak",
    title: "Led Israeli Delegation at Camp David 2000 Peace Summit",
    category: "achievement",
    date: "2000-07-11",
    year: 2000,
    description: "Negotiated comprehensive final status peace proposals alongside US President Bill Clinton and Palestinian Chairman Yasser Arafat.",
    metricOrStat: "14-Day Trilateral Peace Summit"
  },

  // 3. Yitzhak Rabin
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
    id: "mlst-rabin-jordan-treaty-1994",
    personId: "yitzhak-rabin",
    title: "Signed the 1994 Israel–Jordan Peace Treaty with King Hussein",
    category: "achievement",
    date: "1994-10-26",
    year: 1994,
    description: "Concluded historic peace treaty ending 46 years of official war between the Hashemite Kingdom of Jordan and the State of Israel.",
    metricOrStat: "Sovereign Peace Treaty Signed"
  },

  // 4. Shimon Peres
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
    id: "mlst-peres-us-gold-medal",
    personId: "shimon-peres",
    title: "Awarded US Congressional Gold Medal and Presidential Medal of Freedom",
    category: "honor",
    date: "2014-06-26",
    year: 2014,
    description: "One of only nine people in history to receive both the Nobel Peace Prize and the highest two civilian honors of the United States.",
    metricOrStat: "Triple Historic Honors"
  },

  // 5. Avigdor Lieberman
  {
    id: "mlst-lieberman-yisrael-beiteinu-2009",
    personId: "avigdor-lieberman",
    title: "Led Yisrael Beiteinu to 15 Knesset Seats in 2009 Elections",
    category: "achievement",
    date: "2009-02-10",
    year: 2009,
    description: "Propelled his party to become the third-largest faction in the Knesset, reshaping Israeli coalition politics.",
    metricOrStat: "15 Parliamentary Seats"
  },

  // 6. Ron Dermer
  {
    id: "mlst-dermer-mou-2016",
    personId: "ron-dermer",
    title: "Negotiated Record 10-Year $38 Billion US–Israel Defense MOU",
    category: "achievement",
    date: "2016-09-14",
    year: 2016,
    description: "Concluded the largest bilateral military assistance memorandum of understanding in United States history.",
    metricOrStat: "$38 Billion Defense Agreement"
  },

  // 7. Mahmoud Abbas
  {
    id: "mlst-abbas-un-upgrade-2012",
    personId: "mahmoud-abbas",
    title: "Secured UN Non-Member Observer State Status for Palestine",
    category: "landmark-fact",
    date: "2012-11-29",
    year: 2012,
    description: "Achieved diplomatic milestone with UN General Assembly Resolution 67/19 passing with 138 votes in favor.",
    metricOrStat: "138 UNGA Member Votes"
  },

  // 8. Yasser Arafat
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
  {
    id: "mlst-arafat-1974-unga-speech",
    personId: "yasser-arafat",
    title: "Delivered Historic Olive Branch Address to the UN General Assembly",
    category: "achievement",
    date: "1974-11-13",
    year: 1974,
    description: "Became the first representative of a non-governmental organization to address a plenary session of the UN General Assembly.",
    metricOrStat: "First Non-State UNGA Plenary"
  },

  // 9. Saeb Erekat
  {
    id: "mlst-erekat-25-years-negotiator",
    personId: "saeb-erekat",
    title: "Led Palestinian Negotiations Across 25 Continuous Years",
    category: "statistic",
    date: "2019-10-01",
    year: 2019,
    description: "Participated in and directed negotiations for the Madrid Conference, Oslo Accords, Wye River, Camp David, and Taba.",
    metricOrStat: "25+ Years Chief Negotiator"
  },

  // 10. Ismail Haniyeh
  {
    id: "mlst-haniyeh-2006-election",
    personId: "ismail-haniyeh",
    title: "Led Change and Reform List to Majority in 2006 Palestinian Elections",
    category: "achievement",
    date: "2006-01-25",
    year: 2006,
    description: "Won 74 of 132 seats in the Palestinian Legislative Council, leading to his appointment as Prime Minister.",
    metricOrStat: "74 of 132 PLC Seats"
  },

  // 11. Khaled Mashal
  {
    id: "mlst-mashal-1997-assassination-survival",
    personId: "khaled-mashal",
    title: "Survived 1997 Mossad Fentanyl Inoculation Assassination Attempt",
    category: "landmark-fact",
    date: "1997-09-25",
    year: 1997,
    description: "Following diplomatic intervention by King Hussein of Jordan, Israel provided the antidote and released Ahmed Yassin.",
    metricOrStat: "Major Geopolitical Crisis"
  },

  // 12. Marwan Barghouti
  {
    id: "mlst-barghouti-central-committee-vote",
    personId: "marwan-barghouti",
    title: "Elected to Fatah Central Committee While Incarcerated",
    category: "record",
    date: "2009-08-09",
    year: 2009,
    description: "Secured the highest number of votes of any candidate at the 6th Fatah Congress in Bethlehem.",
    metricOrStat: "Top Vote at 6th Fatah Congress"
  },

  // 13. Joe Biden
  {
    id: "mlst-biden-2020-record-votes",
    personId: "joe-biden",
    title: "Won 2020 US Presidential Election with Record 81.2 Million Votes",
    category: "record",
    date: "2020-11-03",
    year: 2020,
    description: "Received 81,283,501 popular votes, the highest total ever cast for a presidential candidate in United States history.",
    metricOrStat: "81.28 Million Popular Votes"
  },
  {
    id: "mlst-biden-vawa-1994",
    personId: "joe-biden",
    title: "Authored and Enacted the Violence Against Women Act (VAWA)",
    category: "achievement",
    date: "1994-09-13",
    year: 1994,
    description: "Landmark federal legislation providing $1.6 billion toward the investigation and prosecution of violent crimes against women.",
    metricOrStat: "Landmark Federal Statute"
  },

  // 14. Donald Trump
  {
    id: "mlst-trump-2016-electoral-victory",
    personId: "donald-trump",
    title: "Won 2016 US Presidential Election with 304 Electoral Votes",
    category: "achievement",
    date: "2016-11-08",
    year: 2016,
    description: "Elected 45th President of the United States, becoming the first president without prior military or government service.",
    metricOrStat: "304 Electoral Votes"
  },
  {
    id: "mlst-trump-abraham-accords-2020",
    personId: "donald-trump",
    title: "Brokered the Historic 2020 Abraham Accords",
    category: "achievement",
    date: "2020-09-15",
    year: 2020,
    description: "Presided over the signing of bilateral normalization treaties between Israel, the United Arab Emirates, and Bahrain at the White House.",
    metricOrStat: "2 Sovereign Normalization Accords"
  },
  {
    id: "mlst-trump-2024-election",
    personId: "donald-trump",
    title: "Elected 47th President of the United States in Non-Consecutive Term",
    category: "record",
    date: "2024-11-05",
    year: 2024,
    description: "Became only the second president in US history after Grover Cleveland to win non-consecutive presidential terms.",
    metricOrStat: "312 Electoral Votes"
  },

  // 15. Barack Obama
  {
    id: "mlst-obama-2009-nobel",
    personId: "barack-obama",
    title: "Awarded 2009 Nobel Peace Prize for International Diplomacy",
    category: "honor",
    date: "2009-10-09",
    year: 2009,
    description: "Awarded the Nobel Peace Prize for extraordinary efforts to strengthen international diplomacy and cooperation between peoples.",
    metricOrStat: "2009 Nobel Peace Prize"
  },
  {
    id: "mlst-obama-aca-2010",
    personId: "barack-obama",
    title: "Signed the Affordable Care Act into Federal Law",
    category: "achievement",
    date: "2010-03-23",
    year: 2010,
    description: "Enacted the most significant regulatory overhaul of the US healthcare system since Medicare and Medicaid in 1965.",
    metricOrStat: "20+ Million Americans Insured"
  },

  // 16. Bill Clinton
  {
    id: "mlst-bill-clinton-longest-expansion",
    personId: "bill-clinton",
    title: "Presided Over 115 Months of Continuous Peacetime Economic Expansion",
    category: "record",
    date: "2001-01-20",
    year: 2001,
    description: "Created over 22 million jobs, achieving consecutive federal budget surpluses for the first time in three decades.",
    metricOrStat: "22.7 Million Jobs Created"
  },
  {
    id: "mlst-bill-clinton-oslo-1993",
    personId: "bill-clinton",
    title: "Hosted the White House Handshake for 1993 Oslo Accords",
    category: "achievement",
    date: "1993-09-13",
    year: 1993,
    description: "Presided over the signing of the Declaration of Principles on the South Lawn between Yitzhak Rabin and Yasser Arafat.",
    metricOrStat: "Historic South Lawn Accord"
  },

  // 17. Hillary Clinton
  {
    id: "mlst-hillary-beijing-1995",
    personId: "hillary-clinton",
    title: "Delivered Landmark 'Women's Rights Are Human Rights' UN Address",
    category: "landmark-fact",
    date: "1995-09-05",
    year: 1995,
    description: "Addressed the UN Fourth World Conference on Women in Beijing, establishing a global human rights doctrine.",
    metricOrStat: "189 Participating Nations"
  },
  {
    id: "mlst-hillary-2016-nomination",
    personId: "hillary-clinton",
    title: "First Woman Nominated for President by Major US Political Party",
    category: "record",
    date: "2016-07-26",
    year: 2016,
    description: "Won the Democratic Party presidential nomination, winning 65.8 million votes in the general election.",
    metricOrStat: "65.8 Million General Election Votes"
  },

  // 18. Kamala Harris
  {
    id: "mlst-harris-first-female-vp",
    personId: "kamala-harris",
    title: "Inaugurated First Female, African American, and South Asian Vice President",
    category: "record",
    date: "2021-01-20",
    year: 2021,
    description: "Sworn in as 49th Vice President of the United States, the highest-ranking female elected official in US history.",
    metricOrStat: "Historic First in 232 Years"
  },
  {
    id: "mlst-harris-senate-tiebreaks",
    personId: "kamala-harris",
    title: "Cast Record 33 Tie-Breaking Votes in the United States Senate",
    category: "record",
    date: "2023-12-05",
    year: 2023,
    description: "Surpassed John C. Calhoun's 191-year record for the most tie-breaking votes cast by a Vice President.",
    metricOrStat: "33 Senate Tie-Breakers (All-Time Record)"
  },

  // 19. Dick Cheney
  {
    id: "mlst-cheney-desert-storm",
    personId: "dick-cheney",
    title: "Directed Defense Operations for 1991 Operation Desert Storm",
    category: "achievement",
    date: "1991-02-28",
    year: 1991,
    description: "Coordinated coalition military campaign liberating Kuwait with minimal coalition casualties, awarded Presidential Medal of Freedom.",
    metricOrStat: "35-Nation Coalition Campaign"
  },

  // 20. Mike Pompeo
  {
    id: "mlst-pompeo-pyongyang-2018",
    personId: "mike-pompeo",
    title: "Conducted High-Stakes Direct Diplomacy with Kim Jong Un in Pyongyang",
    category: "achievement",
    date: "2018-05-09",
    year: 2018,
    description: "Secured release of three American detainees and laid groundwork for the historic 2018 Singapore Summit.",
    metricOrStat: "3 Detainees Liberated"
  },

  // 21. Nancy Pelosi
  {
    id: "mlst-pelosi-first-female-speaker",
    personId: "nancy-pelosi",
    title: "First Female Speaker of the United States House of Representatives",
    category: "record",
    date: "2007-01-04",
    year: 2007,
    description: "Became the first woman in American history to wield the Speaker's gavel and stand second in presidential succession.",
    metricOrStat: "52nd Speaker of the House"
  },

  // 22. Chuck Schumer
  {
    id: "mlst-schumer-ira-2022",
    personId: "chuck-schumer",
    title: "Orchestrated Passage of the 2022 Inflation Reduction Act",
    category: "achievement",
    date: "2022-08-07",
    year: 2022,
    description: "Secured 51–50 Senate passage with Vice President Kamala Harris casting the tie-breaking vote for the largest federal investment in climate and energy in US history.",
    metricOrStat: "$369 Billion Climate & Energy Statute"
  },

  // 23. Mitch McConnell
  {
    id: "mlst-mcconnell-longest-serving-leader",
    personId: "mitch-mcconnell",
    title: "Longest-Serving Senate Party Leader in United States History",
    category: "record",
    date: "2023-01-03",
    year: 2023,
    description: "Surpassed Senator Mike Mansfield's 16-year record, serving over 18 continuous years as Republican Leader in the Senate.",
    metricOrStat: "18+ Years Senate Party Leadership"
  },

  // 24. Bernie Sanders
  {
    id: "mlst-sanders-grassroots-fundraising",
    personId: "bernie-sanders",
    title: "Raised Record $228 Million via Small-Dollar Individual Donations",
    category: "record",
    date: "2016-06-07",
    year: 2016,
    description: "Set historic record with over 8 million individual campaign contributions averaging $27 during the 2016 primary campaign.",
    metricOrStat: "8+ Million Individual Contributions"
  },

  // 25. Thomas Massie
  {
    id: "mlst-massie-lemelson-mit",
    personId: "thomas-massie",
    title: "Won Lemelson-MIT Student Prize for Haptic Robotic Invention",
    category: "honor",
    date: "1995-05-01",
    year: 1995,
    description: "Awarded $30,000 national collegiate invention award at MIT for creating the PHANToM haptic interface device.",
    metricOrStat: "Lemelson-MIT Invention Prize"
  },

  // 26. Randy Fine
  {
    id: "mlst-fine-anti-bds-legislation",
    personId: "randy-fine",
    title: "Authored Comprehensive Florida Anti-BDS State Legislation",
    category: "achievement",
    date: "2018-03-09",
    year: 2018,
    description: "Authored HB 545 prohibiting state contracting with entities boycotting Israel, enacted into law.",
    metricOrStat: "Statewide Enacted Statute"
  },

  // 27. Jared Kushner
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

  // 28. Sir Keir Starmer
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

  // 29. Tony Blair
  {
    id: "mlst-blair-good-friday-1998",
    personId: "tony-blair",
    title: "Co-brokered the 1998 Good Friday Agreement in Northern Ireland",
    category: "achievement",
    date: "1998-04-10",
    year: 1998,
    description: "Concluded historic peace accord ending three decades of The Troubles in Northern Ireland, ratified by referendum.",
    metricOrStat: "Belfast Agreement Ratified (71.1% Yes)"
  },

  // 30. Jeremy Corbyn
  {
    id: "mlst-corbyn-2015-landslide",
    personId: "jeremy-corbyn",
    title: "Won Labour Leadership Election with Record 59.5% Mandate",
    category: "record",
    date: "2015-09-12",
    year: 2015,
    description: "Elected Leader of the Labour Party with 251,417 votes on the first ballot from 200/1 outsider odds.",
    metricOrStat: "59.5% First-Round Mandate"
  },

  // 31. George Galloway
  {
    id: "mlst-galloway-senate-2005",
    personId: "george-galloway",
    title: "Testified Before US Senate Permanent Subcommittee on Investigations",
    category: "landmark-fact",
    date: "2005-05-17",
    year: 2005,
    description: "Confronted US Senators Norm Coleman and Carl Levin in televised hearing rebutting Iraq oil-for-food allegations.",
    metricOrStat: "Televised Senate Hearing"
  },

  // 32. Ken Livingstone
  {
    id: "mlst-livingstone-congestion-charge",
    personId: "ken-livingstone",
    title: "Implemented the London Congestion Charge Scheme",
    category: "achievement",
    date: "2003-02-17",
    year: 2003,
    description: "Pioneered world's largest urban congestion charging zone in central London, cutting traffic by 15% and funding bus transport.",
    metricOrStat: "15% Traffic Reduction in Central London"
  },

  // 33. Jack Straw
  {
    id: "mlst-straw-human-rights-act",
    personId: "jack-straw",
    title: "Piloted the Human Rights Act 1998 into UK Law",
    category: "achievement",
    date: "1998-11-09",
    year: 1998,
    description: "Incorporated the European Convention on Human Rights into domestic UK law as Home Secretary.",
    metricOrStat: "Foundational Constitutional Statute"
  },

  // 34. Elon Musk
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
  {
    id: "mlst-musk-falcon9-landing",
    personId: "elon-musk",
    title: "Achieved First Vertical Landing of an Orbital Rocket Booster",
    category: "record",
    date: "2015-12-21",
    year: 2015,
    description: "SpaceX Falcon 9 Flight 20 successfully returned and landed vertically at Landing Zone 1, revolutionizing rocket reusability.",
    metricOrStat: "First Orbital Class Landing"
  },

  // 35. Michael Bloomberg
  {
    id: "mlst-bloomberg-three-terms",
    personId: "michael-bloomberg",
    title: "Served Three Consecutive Terms as Mayor of New York City",
    category: "statistic",
    date: "2013-12-31",
    year: 2013,
    description: "Led New York City for 12 continuous years following 9/11, rebuilding the World Trade Center site and lowering crime rates.",
    metricOrStat: "12 Continuous Years Mayoral Service"
  },

  // 36. Larry King
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

  // 37. Barbara Walters
  {
    id: "mlst-walters-first-evening-co-anchor",
    personId: "barbara-walters",
    title: "First Female Co-Anchor of Network Evening News Broadcast",
    category: "record",
    date: "1976-10-04",
    year: 1976,
    description: "Joined Harry Reasoner as co-anchor of ABC Evening News on unprecedented $1 million per year contract.",
    metricOrStat: "First Female Network Evening Anchor"
  },

  // 38. Christiane Amanpour
  {
    id: "mlst-amanpour-four-peabody-awards",
    personId: "christiane-amanpour",
    title: "Awarded Four George Foster Peabody Awards for Conflict Reporting",
    category: "honor",
    date: "2018-05-19",
    year: 2018,
    description: "Honored for coverage across the Balkans, Middle East, Rwanda, and global women's rights.",
    metricOrStat: "4 Peabody Awards"
  },
  // 39. Tucker Carlson
  {
    id: "mlst-carlson-highest-cable-rating",
    personId: "tucker-carlson",
    title: "Achieved Highest-Rated Quarter in Cable News History",
    category: "record",
    date: "2020-07-01",
    year: 2020,
    description: "Tucker Carlson Tonight averaged 4.33 million nightly viewers in Q2 2020, breaking the all-time cable news viewership record.",
    metricOrStat: "4.33 Million Nightly Viewers"
  },

  // 40. Candace Owens
  {
    id: "mlst-owens-blexit-foundation",
    personId: "candace-owens",
    title: "Founded BLEXIT Movement for Economic Independence",
    category: "achievement",
    date: "2018-10-27",
    year: 2018,
    description: "Established nationwide grassroots organization advocating school choice, entrepreneurship, and alternative political allegiance.",
    metricOrStat: "National Grassroots Non-Profit"
  },

  // 41. Charlie Kirk
  {
    id: "mlst-kirk-tpusa-expansion",
    personId: "charlie-kirk",
    title: "Expanded Turning Point USA to Over 3,500 College and High School Chapters",
    category: "statistic",
    date: "2023-12-01",
    year: 2023,
    description: "Built largest conservative youth organization in the United States hosting thousands of student attendees at annual summits.",
    metricOrStat: "3,500+ Active Student Chapters"
  },

  // 42. Ben Shapiro
  {
    id: "mlst-shapiro-youngest-syndicated",
    personId: "ben-shapiro",
    title: "Youngest Nationally Syndicated Columnist in United States at Age 17",
    category: "record",
    date: "2001-05-01",
    year: 2001,
    description: "Signed national syndication contract with Creators Syndicate while a high school student.",
    metricOrStat: "Age 17 National Syndication"
  },

  // 43. Andrew Neil
  {
    id: "mlst-neil-sky-launch-1989",
    personId: "andrew-neil",
    title: "Launched Sky Television as Founding Executive Chairman",
    category: "achievement",
    date: "1989-02-05",
    year: 1989,
    description: "Supervised the launch of Britain's first multi-channel satellite television network for Rupert Murdoch's News International.",
    metricOrStat: "4-Channel Satellite Network Launch"
  },

  // 44. Anderson Cooper
  {
    id: "mlst-cooper-18-emmy-awards",
    personId: "anderson-cooper",
    title: "Recipient of 18 National News and Documentary Emmy Awards",
    category: "honor",
    date: "2023-09-27",
    year: 2023,
    description: "Recognized for reporting on wars, earthquakes, political summits, and 60 Minutes investigative journalism.",
    metricOrStat: "18 Emmy Awards"
  },

  // 45. Tom Brokaw
  {
    id: "mlst-brokaw-berlin-wall",
    personId: "tom-brokaw",
    title: "Only American Anchor to Broadcast Live from Berlin Wall on Night of Its Fall",
    category: "landmark-fact",
    date: "1989-11-09",
    year: 1989,
    description: "Conducted live satellite broadcast from the Brandenburg Gate as East Berliners crossed the border.",
    metricOrStat: "Live Historic Global Broadcast"
  },

  // 46. Peter Jennings
  {
    id: "mlst-jennings-25-hours-911",
    personId: "peter-jennings",
    title: "Anchored 25 Continuous Hours of Live Coverage Following 9/11",
    category: "record",
    date: "2001-09-12",
    year: 2001,
    description: "Anchored ABC News coverage without interruption through the attacks on the World Trade Center and Pentagon.",
    metricOrStat: "25+ Continuous Broadcast Hours"
  },

  // 47. Lester Holt
  {
    id: "mlst-holt-record-debate-viewers",
    personId: "lester-holt",
    title: "Moderated Most-Watched Presidential Debate in Television History",
    category: "record",
    date: "2016-09-26",
    year: 2016,
    description: "Solo moderated the first presidential debate between Donald Trump and Hillary Clinton, watched by 84 million viewers.",
    metricOrStat: "84 Million Live Viewers"
  },

  // 48. Diane Sawyer
  {
    id: "mlst-sawyer-first-female-60-minutes",
    personId: "diane-sawyer",
    title: "First Female Correspondent on CBS News' 60 Minutes",
    category: "record",
    date: "1984-09-23",
    year: 1984,
    description: "Joined Mike Wallace, Morley Safer, Harry Reasoner, and Ed Bradley as the broadcast's first female investigative correspondent.",
    metricOrStat: "Historic First for Flagship News Magazine"
  },

  // 49. Emmanuel Macron
  {
    id: "mlst-macron-youngest-french-president",
    personId: "emmanuel-macron",
    title: "Elected Youngest President in French Republic History at Age 39",
    category: "record",
    date: "2017-05-07",
    year: 2017,
    description: "Won 66.1% of the vote in the second round, founding En Marche! and breaking the traditional party duopoly.",
    metricOrStat: "Age 39 (66.1% Second-Round Vote)"
  },

  // 50. Vladimir Putin
  {
    id: "mlst-putin-longest-serving-leader",
    personId: "vladimir-putin",
    title: "Became Longest-Serving Russian/Soviet Leader Since Joseph Stalin",
    category: "record",
    date: "2024-05-07",
    year: 2024,
    description: "Commenced fifth presidential term in office, exceeding 24 continuous years as President and Prime Minister.",
    metricOrStat: "24+ Years Supreme State Leadership"
  },

  // 51. Jeffrey Epstein
  {
    id: "mlst-epstein-2019-indictment",
    personId: "jeffrey-epstein",
    title: "Arrested and Indicted on Federal Sex Trafficking Charges by SDNY",
    category: "landmark-fact",
    date: "2019-07-06",
    year: 2019,
    description: "Arrested at Teterboro Airport by the FBI on sex trafficking conspiracy charges resulting in global geopolitical and financial inquiries.",
    metricOrStat: "Federal Grand Jury Indictment"
  },

  // 52. Tenzin Gyatso (Dalai Lama)
  {
    id: "mlst-dalai-lama-1940-enthronement",
    personId: "dalai-lama",
    title: "Formally Enthroned as 14th Dalai Lama in Lhasa",
    category: "achievement",
    date: "1940-02-22",
    year: 1940,
    description: "Formally enthroned as the spiritual and temporal leader of Tibet at the Potala Palace in Lhasa.",
    metricOrStat: "Enthroned at Age 4"
  },
  {
    id: "mlst-dalai-lama-1989-nobel",
    personId: "dalai-lama",
    title: "Awarded 1989 Nobel Peace Prize for Non-Violent Advocacy",
    category: "honor",
    date: "1989-12-10",
    year: 1989,
    description: "Awarded the Nobel Peace Prize in Oslo for his consistent opposition to the use of violence in his struggle for Tibetan autonomy.",
    metricOrStat: "1989 Nobel Peace Prize"
  },
  {
    id: "mlst-dalai-lama-2007-gold-medal",
    personId: "dalai-lama",
    title: "Awarded US Congressional Gold Medal in Washington, D.C.",
    category: "honor",
    date: "2007-10-17",
    year: 2007,
    description: "Conferred the highest civilian honor bestowed by the United States Congress in recognition of his human rights and interfaith leadership.",
    metricOrStat: "US Congressional Gold Medal"
  }
];


