/**
 * REWIND EVIDENCE ATLAS — CANONICAL SEED REGISTER: ROYAL HISTORICAL EVENTS CORPUS
 *
 * Forensically documented state visits, accessions, coronations, royal weddings,
 * state funerals, jubilees, and international commemorations across European monarchies
 * and historic royal houses.
 */

import type { EventRecord } from "@/lib/rewind/types";

export const royalEventsCorpus: EventRecord[] = [
  // =========================================================================
  // 1. CORONATION OF KING CHARLES III & QUEEN CAMILLA (2023)
  // =========================================================================
  {
    id: "evt-2023-05-06-coronation-charles-camilla",
    slug: "coronation-king-charles-iii-queen-camilla-westminster",
    eventName: "The Coronation of King Charles III and Queen Camilla",
    startDate: "2023-05-06",
    endDate: "2023-05-06",
    datePrecision: "exact-day",
    city: "London",
    country: "United Kingdom",
    venueName: "Westminster Abbey",
    subvenue: "Coronation Theatre (The Crossing)",
    address: "Dean's Yard, Westminster, London SW1P 3PA, United Kingdom",
    latitude: 51.4993,
    longitude: -0.1273,
    summary: "King Charles III and Queen Camilla were solemnly crowned at Westminster Abbey by the Archbishop of Canterbury Justin Welby in the first British coronation ceremony since 1953, attended by international royalty and foreign heads of state.",
    description: "The official coronation service encompassed the Recognition, the Oath, the Anointing behind screens with holy chrism oil, the Investiture with the regalia (including St Edward's Crown for the King and Queen Mary's Crown for the Queen), and the Enthronement and Homage.",
    verificationStatus: "verified",
    confidenceScore: 1.0,
    confidence: "confirmed",
    scope: "government",
    eventTypes: ["monarchical-ceremony", "state-ceremony", "religious-service"],
    categories: ["monarchical-ceremony", "state-ceremony"],
    sourceIds: [
      "src-uk-court-circular-20230506",
      "src-uk-london-gazette-20220910-accession"
    ],
    participants: [
      { personId: "charles-iii", name: "King Charles III", role: "Sovereign Crowned", presenceConfidence: "confirmed" },
      { personId: "queen-camilla", name: "Queen Camilla", role: "Queen Consort Crowned", presenceConfidence: "confirmed" },
      { personId: "prince-william", name: "Prince William", role: "Prince of Wales & Homage of Royal Blood", presenceConfidence: "confirmed" },
      { personId: "catherine-princess-of-wales", name: "Catherine, Princess of Wales", role: "Princess of Wales", presenceConfidence: "confirmed" },
      { personId: "prince-george", name: "Prince George", role: "Page of Honour", presenceConfidence: "confirmed" },
      { personId: "princess-charlotte", name: "Princess Charlotte", role: "Royal Family Attendee", presenceConfidence: "confirmed" },
      { personId: "prince-louis", name: "Prince Louis", role: "Royal Family Attendee", presenceConfidence: "confirmed" },
      { personId: "prince-harry", name: "Prince Harry", role: "Duke of Sussex", presenceConfidence: "confirmed" },
      { personId: "princess-anne", name: "Princess Anne", role: "Gold Stick in Waiting", presenceConfidence: "confirmed" },
      { personId: "prince-edward", name: "Prince Edward", role: "Duke of Edinburgh", presenceConfidence: "confirmed" },
      { personId: "sophie-duchess-of-edinburgh", name: "Sophie, Duchess of Edinburgh", role: "Duchess of Edinburgh", presenceConfidence: "confirmed" },
      { personId: "king-felipe-vi", name: "King Felipe VI", role: "Foreign Sovereign Guest", presenceConfidence: "confirmed" },
      { personId: "queen-letizia", name: "Queen Letizia", role: "Foreign Queen Consort Guest", presenceConfidence: "confirmed" },
      { personId: "king-philippe-belgium", name: "King Philippe", role: "Foreign Sovereign Guest", presenceConfidence: "confirmed" },
      { personId: "queen-mathilde-belgium", name: "Queen Mathilde", role: "Foreign Queen Consort Guest", presenceConfidence: "confirmed" },
      { personId: "king-willem-alexander", name: "King Willem-Alexander", role: "Foreign Sovereign Guest", presenceConfidence: "confirmed" },
      { personId: "queen-maxima", name: "Queen Máxima", role: "Foreign Queen Consort Guest", presenceConfidence: "confirmed" },
      { personId: "king-carl-xvi-gustaf", name: "King Carl XVI Gustaf", role: "Foreign Sovereign Guest", presenceConfidence: "confirmed" },
      { personId: "crown-princess-victoria", name: "Crown Princess Victoria", role: "Foreign Heir Apparent Guest", presenceConfidence: "confirmed" },
      { personId: "crown-prince-haakon", name: "Crown Prince Haakon", role: "Foreign Heir Apparent Guest", presenceConfidence: "confirmed" },
      { personId: "king-frederik-x", name: "King Frederik X", role: "Foreign Heir Apparent Guest", presenceConfidence: "confirmed" },
      { personId: "queen-mary-denmark", name: "Queen Mary", role: "Foreign Crown Princess Guest", presenceConfidence: "confirmed" },
      { personId: "prince-albert-ii", name: "Prince Albert II", role: "Foreign Sovereign Guest", presenceConfidence: "confirmed" },
      { personId: "princess-charlene", name: "Princess Charlene", role: "Foreign Princess Consort Guest", presenceConfidence: "confirmed" },
      { personId: "grand-duke-henri", name: "Grand Duke Henri", role: "Foreign Sovereign Guest", presenceConfidence: "confirmed" },
      { personId: "grand-duchess-maria-teresa", name: "Grand Duchess Maria Teresa", role: "Foreign Grand Duchess Consort Guest", presenceConfidence: "confirmed" },
      { personId: "hereditary-prince-alois", name: "Hereditary Prince Alois", role: "Foreign Sovereign Regent Guest", presenceConfidence: "confirmed" },
      { personId: "joan-enric-vives-sicilia", name: "Archbishop Joan-Enric Vives i Sicília", role: "Foreign Co-Prince of Andorra Guest", presenceConfidence: "confirmed" },
      { personId: "karl-von-habsburg", name: "Karl von Habsburg", role: "Dynastic Head Guest", presenceConfidence: "confirmed" },
      { personId: "margareta-custodian-of-the-crown-romania", name: "Margareta, Custodian of the Crown", role: "Dynastic Head Guest", presenceConfidence: "confirmed" },
      { personId: "alexander-crown-prince-yugoslavia", name: "Crown Prince Alexander", role: "Dynastic Head Guest", presenceConfidence: "confirmed" },
      { personId: "pavlos-crown-prince-greece", name: "Crown Prince Pavlos", role: "Dynastic Head Guest", presenceConfidence: "confirmed" }
    ]
  },

  // =========================================================================
  // 2. STATE FUNERAL OF QUEEN ELIZABETH II (2022)
  // =========================================================================
  {
    id: "evt-2022-09-19-state-funeral-queen-elizabeth-ii",
    slug: "state-funeral-queen-elizabeth-ii-westminster-windsor",
    eventName: "State Funeral of Her Majesty Queen Elizabeth II",
    startDate: "2022-09-19",
    endDate: "2022-09-19",
    datePrecision: "exact-day",
    city: "London",
    country: "United Kingdom",
    venueName: "Westminster Abbey",
    subvenue: "The High Altar & Nave",
    address: "Dean's Yard, Westminster, London SW1P 3PA, United Kingdom",
    latitude: 51.4993,
    longitude: -0.1273,
    summary: "The State Funeral of Queen Elizabeth II took place at Westminster Abbey followed by a committal service at St George's Chapel Windsor, bringing together monarchs and heads of state from over 160 nations.",
    description: "The funeral concluded 10 days of national mourning following the Queen's death at Balmoral Castle on 8 September 2022, marking the end of her historic 70-year reign.",
    verificationStatus: "verified",
    confidenceScore: 1.0,
    confidence: "confirmed",
    scope: "government",
    eventTypes: ["state-funeral", "state-ceremony", "religious-service"],
    categories: ["state-funeral", "state-ceremony"],
    sourceIds: [
      "src-uk-court-circular-20220919",
      "src-uk-london-gazette-20220910-accession"
    ],
    participants: [
      { personId: "charles-iii", name: "King Charles III", role: "Chief Mourner / Sovereign", presenceConfidence: "confirmed" },
      { personId: "queen-camilla", name: "Queen Camilla", role: "Queen Consort", presenceConfidence: "confirmed" },
      { personId: "prince-william", name: "Prince William", role: "Prince of Wales", presenceConfidence: "confirmed" },
      { personId: "catherine-princess-of-wales", name: "Catherine, Princess of Wales", role: "Princess of Wales", presenceConfidence: "confirmed" },
      { personId: "prince-george", name: "Prince George", role: "Royal Family Mourner", presenceConfidence: "confirmed" },
      { personId: "princess-charlotte", name: "Princess Charlotte", role: "Royal Family Mourner", presenceConfidence: "confirmed" },
      { personId: "prince-harry", name: "Prince Harry", role: "Duke of Sussex", presenceConfidence: "confirmed" },
      { personId: "meghan-duchess-of-sussex", name: "Meghan, Duchess of Sussex", role: "Duchess of Sussex", presenceConfidence: "confirmed" },
      { personId: "princess-anne", name: "Princess Anne", role: "Princess Royal", presenceConfidence: "confirmed" },
      { personId: "prince-edward", name: "Prince Edward", role: "Earl of Wessex", presenceConfidence: "confirmed" },
      { personId: "sophie-duchess-of-edinburgh", name: "Sophie, Duchess of Edinburgh", role: "Countess of Wessex", presenceConfidence: "confirmed" },
      { personId: "king-felipe-vi", name: "King Felipe VI", role: "Visiting Sovereign Mourner", presenceConfidence: "confirmed" },
      { personId: "queen-letizia", name: "Queen Letizia", role: "Visiting Queen Consort Mourner", presenceConfidence: "confirmed" },
      { personId: "king-philippe-belgium", name: "King Philippe", role: "Visiting Sovereign Mourner", presenceConfidence: "confirmed" },
      { personId: "queen-mathilde-belgium", name: "Queen Mathilde", role: "Visiting Queen Consort Mourner", presenceConfidence: "confirmed" },
      { personId: "king-willem-alexander", name: "King Willem-Alexander", role: "Visiting Sovereign Mourner", presenceConfidence: "confirmed" },
      { personId: "queen-maxima", name: "Queen Máxima", role: "Visiting Queen Consort Mourner", presenceConfidence: "confirmed" },
      { personId: "king-carl-xvi-gustaf", name: "King Carl XVI Gustaf", role: "Visiting Sovereign Mourner", presenceConfidence: "confirmed" },
      { personId: "queen-silvia-sweden", name: "Queen Silvia", role: "Visiting Queen Consort Mourner", presenceConfidence: "confirmed" },
      { personId: "king-harald-v", name: "King Harald V", role: "Visiting Sovereign Mourner", presenceConfidence: "confirmed" },
      { personId: "queen-sonja-norway", name: "Queen Sonja", role: "Visiting Queen Consort Mourner", presenceConfidence: "confirmed" },
      { personId: "queen-margrethe-ii", name: "Queen Margrethe II", role: "Visiting Sovereign Mourner", presenceConfidence: "confirmed" },
      { personId: "king-frederik-x", name: "King Frederik X", role: "Visiting Crown Prince Mourner", presenceConfidence: "confirmed" },
      { personId: "prince-albert-ii", name: "Prince Albert II", role: "Visiting Sovereign Mourner", presenceConfidence: "confirmed" },
      { personId: "princess-charlene", name: "Princess Charlene", role: "Visiting Princess Consort Mourner", presenceConfidence: "confirmed" },
      { personId: "grand-duke-henri", name: "Grand Duke Henri", role: "Visiting Sovereign Mourner", presenceConfidence: "confirmed" },
      { personId: "grand-duchess-maria-teresa", name: "Grand Duchess Maria Teresa", role: "Visiting Grand Duchess Mourner", presenceConfidence: "confirmed" },
      { personId: "hereditary-prince-alois", name: "Hereditary Prince Alois", role: "Visiting Sovereign Regent Mourner", presenceConfidence: "confirmed" },
      { personId: "margareta-custodian-romanian-crown", name: "Margareta, Custodian of the Crown", role: "Dynastic Head Mourner", presenceConfidence: "confirmed" },
      { personId: "tsar-simeon-ii-bulgaria", name: "Tsar Simeon II", role: "Former Monarch Mourner", presenceConfidence: "confirmed" },
      { personId: "crown-prince-alexander-serbia", name: "Crown Prince Alexander", role: "Dynastic Head Mourner", presenceConfidence: "confirmed" },
      { personId: "crown-prince-pavlos-greece", name: "Crown Prince Pavlos", role: "Dynastic Head Mourner", presenceConfidence: "confirmed" },
      { personId: "karl-von-habsburg", name: "Karl von Habsburg", role: "Dynastic Head Mourner", presenceConfidence: "confirmed" }
    ]
  },

  // =========================================================================
  // 3. 80TH D-DAY INTERNATIONAL COMMEMORATION (2024)
  // =========================================================================
  {
    id: "evt-2024-06-06-dday-80-international-ceremony",
    slug: "80th-dday-commemoration-omaha-beach-normandy",
    eventName: "80th Anniversary International D-Day Commemoration at Omaha Beach",
    startDate: "2024-06-06",
    endDate: "2024-06-06",
    datePrecision: "exact-day",
    city: "Saint-Laurent-sur-Mer",
    country: "France",
    venueName: "Omaha Beach Memorial Tribune",
    subvenue: "Main Commemorative Tribune",
    address: "Avenue de la Libération, 14710 Saint-Laurent-sur-Mer, France",
    latitude: 49.3697,
    longitude: -0.8711,
    summary: "Heads of state and sovereign monarchs of Allied nations gathered on Omaha Beach to commemorate the 80th anniversary of the Normandy Landings in Operation Overlord.",
    description: "Hosted by French President Emmanuel Macron, the international ceremony featured speeches, a military flypast, and personal honours presented to surviving veterans of the 1944 liberation of Europe.",
    verificationStatus: "verified",
    confidenceScore: 1.0,
    confidence: "confirmed",
    scope: "diplomatic",
    eventTypes: ["international-commemoration", "diplomatic-summit", "state-ceremony"],
    categories: ["international-commemoration", "state-ceremony"],
    sourceIds: [
      "src-france-elysee-20240606",
      "src-uk-court-circular-20230506"
    ],
    participants: [
      { personId: "charles-iii", name: "King Charles III", role: "Head of State of the United Kingdom", presenceConfidence: "confirmed" },
      { personId: "queen-camilla", name: "Queen Camilla", role: "Queen Consort of the United Kingdom", presenceConfidence: "confirmed" },
      { personId: "prince-william", name: "Prince William", role: "Prince of Wales", presenceConfidence: "confirmed" },
      { personId: "king-philippe-belgium", name: "King Philippe", role: "King of the Belgians", presenceConfidence: "confirmed" },
      { personId: "queen-mathilde-belgium", name: "Queen Mathilde", role: "Queen of the Belgians", presenceConfidence: "confirmed" },
      { personId: "king-willem-alexander", name: "King Willem-Alexander", role: "King of the Netherlands", presenceConfidence: "confirmed" },
      { personId: "queen-maxima", name: "Queen Máxima", role: "Queen of the Netherlands", presenceConfidence: "confirmed" },
      { personId: "king-frederik-x", name: "King Frederik X", role: "King of Denmark", presenceConfidence: "confirmed" },
      { personId: "grand-duke-henri", name: "Grand Duke Henri", role: "Grand Duke of Luxembourg", presenceConfidence: "confirmed" },
      { personId: "crown-prince-haakon", name: "Crown Prince Haakon", role: "Crown Prince of Norway", presenceConfidence: "confirmed" }
    ]
  },

  // =========================================================================
  // 4. PROCLAMATION OF KING FELIPE VI OF SPAIN (2014)
  // =========================================================================
  {
    id: "evt-2014-06-19-proclamation-felipe-vi-madrid",
    slug: "proclamation-king-felipe-vi-cortes-generales-madrid",
    eventName: "Proclamation and Constitutional Swearing-In of King Felipe VI of Spain",
    startDate: "2014-06-19",
    endDate: "2014-06-19",
    datePrecision: "exact-day",
    city: "Madrid",
    country: "Spain",
    venueName: "Palacio de las Cortes",
    subvenue: "Salón de Sesiones (Congreso de los Diputados)",
    address: "Plaza de las Cortes 1, 28014 Madrid, Spain",
    latitude: 40.4165,
    longitude: -3.6968,
    summary: "Following the abdication of King Juan Carlos I, King Felipe VI was proclaimed King of Spain before the Cortes Generales and took the constitutional oath to uphold the Constitution of 1978.",
    description: "In his solemn address to the joint session of Parliament, King Felipe VI outlined his vision for a renewed monarchy committed to transparency, constitutional integrity, and national unity.",
    verificationStatus: "verified",
    confidenceScore: 1.0,
    confidence: "confirmed",
    scope: "government",
    eventTypes: ["monarchical-ceremony", "parliamentary-session", "state-ceremony"],
    categories: ["monarchical-ceremony", "state-ceremony"],
    sourceIds: [
      "src-spain-boe-20140619"
    ],
    participants: [
      { personId: "king-felipe-vi", name: "King Felipe VI", role: "Sovereign Proclaimed", presenceConfidence: "confirmed" },
      { personId: "queen-letizia", name: "Queen Letizia", role: "Queen Consort of Spain", presenceConfidence: "confirmed" },
      { personId: "princess-leonor", name: "Princess Leonor", role: "Princess of Asturias / Heir Apparent", presenceConfidence: "confirmed" },
      { personId: "infanta-sofia", name: "Infanta Sofía", role: "Infanta of Spain", presenceConfidence: "confirmed" }
    ]
  },

  // =========================================================================
  // 5. CONSTITUTIONAL OATH OF PRINCESS LEONOR (2023)
  // =========================================================================
  {
    id: "evt-2023-10-31-leonor-princess-of-asturias-oath-madrid",
    slug: "constitutional-oath-princess-leonor-cortes-madrid",
    eventName: "Constitutional Swearing-In of Leonor, Princess of Asturias",
    startDate: "2023-10-31",
    endDate: "2023-10-31",
    datePrecision: "exact-day",
    city: "Madrid",
    country: "Spain",
    venueName: "Palacio de las Cortes",
    subvenue: "Salón de Sesiones (Congreso de los Diputados)",
    address: "Plaza de las Cortes 1, 28014 Madrid, Spain",
    latitude: 40.4165,
    longitude: -3.6968,
    summary: "Upon turning 18, Leonor, Princess of Asturias solemnly swore allegiance to the Spanish Constitution before the Cortes Generales, cementing her constitutional role as heir apparent to the Crown of Spain.",
    description: "The ceremony was followed by the presentation of the Collar of the Order of Charles III at the Royal Palace of Madrid in the presence of the Government and State authorities.",
    verificationStatus: "verified",
    confidenceScore: 1.0,
    confidence: "confirmed",
    scope: "government",
    eventTypes: ["state-ceremony", "parliamentary-session"],
    categories: ["state-ceremony", "monarchical-ceremony"],
    sourceIds: [
      "src-spain-boe-20231031"
    ],
    participants: [
      { personId: "princess-leonor", name: "Princess Leonor", role: "Heir Apparent Sworn In", presenceConfidence: "confirmed" },
      { personId: "king-felipe-vi", name: "King Felipe VI", role: "Sovereign of Spain", presenceConfidence: "confirmed" },
      { personId: "queen-letizia", name: "Queen Letizia", role: "Queen Consort of Spain", presenceConfidence: "confirmed" },
      { personId: "infanta-sofia", name: "Infanta Sofía", role: "Infanta of Spain", presenceConfidence: "confirmed" }
    ]
  },

  // =========================================================================
  // 6. ACCESSION & PROCLAMATION OF KING FREDERIK X OF DENMARK (2024)
  // =========================================================================
  {
    id: "evt-2024-01-14-proclamation-frederik-x-copenhagen",
    slug: "proclamation-king-frederik-x-christiansborg-copenhagen",
    eventName: "Accession and Proclamation of King Frederik X of Denmark",
    startDate: "2024-01-14",
    endDate: "2024-01-14",
    datePrecision: "exact-day",
    city: "Copenhagen",
    country: "Denmark",
    venueName: "Christiansborg Palace",
    subvenue: "Council of State Chamber & Balcony",
    address: "Prins Jørgens Gård 1, 1218 Copenhagen, Denmark",
    latitude: 55.6761,
    longitude: 12.5805,
    summary: "Following the historic abdication of Queen Margrethe II after 52 years of reign, Frederik X was proclaimed King of Denmark from the balcony of Christiansborg Palace by Prime Minister Mette Frederiksen.",
    description: "The Council of State meeting in Christiansborg Palace ratified the signing of the instrument of abdication, transferring the crown to Frederik X with Queen Mary beside him.",
    verificationStatus: "verified",
    confidenceScore: 1.0,
    confidence: "confirmed",
    scope: "government",
    eventTypes: ["monarchical-ceremony", "state-ceremony"],
    categories: ["monarchical-ceremony", "state-ceremony"],
    sourceIds: [
      "src-denmark-statsministeriet-20240114"
    ],
    participants: [
      { personId: "king-frederik-x", name: "King Frederik X", role: "Sovereign Proclaimed", presenceConfidence: "confirmed" },
      { personId: "queen-mary-denmark", name: "Queen Mary", role: "Queen Consort of Denmark", presenceConfidence: "confirmed" },
      { personId: "queen-margrethe-ii", name: "Queen Margrethe II", role: "Abdicating Sovereign", presenceConfidence: "confirmed" }
    ]
  },

  // =========================================================================
  // 7. ACCESSION & SWEARING-IN OF KING PHILIPPE OF THE BELGIANS (2013)
  // =========================================================================
  {
    id: "evt-2013-07-21-accession-philippe-king-of-the-belgians",
    slug: "constitutional-swearing-in-king-philippe-brussels",
    eventName: "Constitutional Swearing-In of King Philippe, King of the Belgians",
    startDate: "2013-07-21",
    endDate: "2013-07-21",
    datePrecision: "exact-day",
    city: "Brussels",
    country: "Belgium",
    venueName: "Palace of the Nation (Belgian Federal Parliament)",
    subvenue: "Federal Parliament Chamber",
    address: "Place de la Nation 1, 1000 Brussels, Belgium",
    latitude: 50.8466,
    longitude: 4.3644,
    summary: "Following the abdication of King Albert II on Belgian National Day, Philippe took the constitutional oath before the joint Chambers of Parliament as the seventh King of the Belgians.",
    description: "Philippe swore in three national languages (French, Dutch, and German) to observe the Constitution and laws of the Belgian people, accompanied by Queen Mathilde and Duchess of Brabant Elisabeth.",
    verificationStatus: "verified",
    confidenceScore: 1.0,
    confidence: "confirmed",
    scope: "government",
    eventTypes: ["monarchical-ceremony", "parliamentary-session", "state-ceremony"],
    categories: ["monarchical-ceremony", "state-ceremony"],
    sourceIds: [
      "src-belgium-moniteur-20130721"
    ],
    participants: [
      { personId: "king-philippe-belgium", name: "King Philippe", role: "Sovereign Sworn In", presenceConfidence: "confirmed" },
      { personId: "queen-mathilde-belgium", name: "Queen Mathilde", role: "Queen Consort of the Belgians", presenceConfidence: "confirmed" },
      { personId: "princess-elisabeth-belgium", name: "Princess Elisabeth", role: "Duchess of Brabant / Heir Apparent", presenceConfidence: "confirmed" }
    ]
  },

  // =========================================================================
  // 8. INAUGURATION OF KING WILLEM-ALEXANDER OF THE NETHERLANDS (2013)
  // =========================================================================
  {
    id: "evt-2013-04-30-inauguration-willem-alexander-amsterdam",
    slug: "inauguration-king-willem-alexander-nieuwe-kerk-amsterdam",
    eventName: "Inauguration of King Willem-Alexander of the Netherlands",
    startDate: "2013-04-30",
    endDate: "2013-04-30",
    datePrecision: "exact-day",
    city: "Amsterdam",
    country: "Netherlands",
    venueName: "De Nieuwe Kerk",
    subvenue: "Sanctuary of De Nieuwe Kerk",
    address: "De Dam, 1012 NL Amsterdam, Netherlands",
    latitude: 52.3738,
    longitude: 4.8917,
    summary: "Following the abdication of Queen Beatrix, Willem-Alexander was inaugurated as King of the Netherlands in a joint session of the States General in the Nieuwe Kerk.",
    description: "The inauguration ceremony brought together European heirs apparent and foreign dignitaries, marking the first male Dutch monarch since 1890.",
    verificationStatus: "verified",
    confidenceScore: 1.0,
    confidence: "confirmed",
    scope: "government",
    eventTypes: ["monarchical-ceremony", "state-ceremony"],
    categories: ["monarchical-ceremony", "state-ceremony"],
    sourceIds: [
      "src-netherlands-staatscourant-20130430"
    ],
    participants: [
      { personId: "king-willem-alexander", name: "King Willem-Alexander", role: "Sovereign Inaugurated", presenceConfidence: "confirmed" },
      { personId: "queen-maxima", name: "Queen Máxima", role: "Queen Consort of the Netherlands", presenceConfidence: "confirmed" },
      { personId: "princess-catharina-amalia", name: "Princess Catharina-Amalia", role: "Princess of Orange / Heir Apparent", presenceConfidence: "confirmed" },
      { personId: "charles-iii", name: "Prince Charles (later Charles III)", role: "Visiting Heir Apparent", presenceConfidence: "confirmed" },
      { personId: "queen-camilla", name: "Camilla, Duchess of Cornwall", role: "Visiting Consort", presenceConfidence: "confirmed" },
      { personId: "king-felipe-vi", name: "Prince Felipe (later Felipe VI)", role: "Visiting Heir Apparent", presenceConfidence: "confirmed" },
      { personId: "queen-letizia", name: "Princess Letizia", role: "Visiting Consort", presenceConfidence: "confirmed" },
      { personId: "king-philippe-belgium", name: "Prince Philippe (later Philippe I)", role: "Visiting Heir Apparent", presenceConfidence: "confirmed" },
      { personId: "queen-mathilde-belgium", name: "Princess Mathilde", role: "Visiting Consort", presenceConfidence: "confirmed" },
      { personId: "king-frederik-x", name: "Crown Prince Frederik", role: "Visiting Heir Apparent", presenceConfidence: "confirmed" },
      { personId: "queen-mary-denmark", name: "Crown Princess Mary", role: "Visiting Consort", presenceConfidence: "confirmed" },
      { personId: "crown-princess-victoria", name: "Crown Princess Victoria", role: "Visiting Heir Apparent", presenceConfidence: "confirmed" },
      { personId: "crown-prince-haakon", name: "Crown Prince Haakon", role: "Visiting Heir Apparent", presenceConfidence: "confirmed" },
      { personId: "hereditary-grand-duke-guillaume", name: "Hereditary Grand Duke Guillaume", role: "Visiting Heir Apparent", presenceConfidence: "confirmed" },
      { personId: "hereditary-prince-alois", name: "Hereditary Prince Alois", role: "Visiting Sovereign Regent", presenceConfidence: "confirmed" }
    ]
  },

  // =========================================================================
  // 9. GOLDEN JUBILEE OF KING CARL XVI GUSTAF OF SWEDEN (2023)
  // =========================================================================
  {
    id: "evt-2023-09-15-carl-xvi-gustaf-golden-jubilee-stockholm",
    slug: "golden-jubilee-king-carl-xvi-gustaf-stockholm-palace",
    eventName: "Golden Jubilee of King Carl XVI Gustaf (50th Reign Anniversary)",
    startDate: "2023-09-15",
    endDate: "2023-09-15",
    datePrecision: "exact-day",
    city: "Stockholm",
    country: "Sweden",
    venueName: "Royal Palace of Stockholm",
    subvenue: "Royal Chapel (Slottskyrkan) & State Hall",
    address: "Kungliga Slottet, 107 70 Stockholm, Sweden",
    latitude: 59.3268,
    longitude: 18.0717,
    summary: "King Carl XVI Gustaf celebrated 50 years on the Swedish throne with a Te Deum service in the Royal Chapel, an address to the Riksdag, and a banquet with Scandinavian and Nordic monarchs.",
    description: "Marking the longest reign in Swedish history, the golden jubilee gathered the royal families of Denmark and Norway in celebration of Nordic monarchical ties.",
    verificationStatus: "verified",
    confidenceScore: 1.0,
    confidence: "confirmed",
    scope: "government",
    eventTypes: ["monarchical-ceremony", "state-ceremony", "jubilee"],
    categories: ["monarchical-ceremony", "state-ceremony"],
    sourceIds: [
      "src-sweden-kungahuset-20230915"
    ],
    participants: [
      { personId: "king-carl-xvi-gustaf", name: "King Carl XVI Gustaf", role: "Sovereign Jubilarian", presenceConfidence: "confirmed" },
      { personId: "queen-silvia-sweden", name: "Queen Silvia", role: "Queen Consort of Sweden", presenceConfidence: "confirmed" },
      { personId: "crown-princess-victoria", name: "Crown Princess Victoria", role: "Crown Princess of Sweden", presenceConfidence: "confirmed" },
      { personId: "queen-margrethe-ii", name: "Queen Margrethe II", role: "Visiting Sovereign (Denmark)", presenceConfidence: "confirmed" },
      { personId: "king-frederik-x", name: "Crown Prince Frederik (later Frederik X)", role: "Visiting Heir Apparent", presenceConfidence: "confirmed" },
      { personId: "queen-mary-denmark", name: "Crown Princess Mary", role: "Visiting Consort", presenceConfidence: "confirmed" },
      { personId: "king-harald-v", name: "King Harald V", role: "Visiting Sovereign (Norway)", presenceConfidence: "confirmed" },
      { personId: "queen-sonja-norway", name: "Queen Sonja", role: "Visiting Queen Consort", presenceConfidence: "confirmed" }
    ]
  },

  // =========================================================================
  // 10. ROYAL WEDDING OF PRINCE WILLIAM & CATHERINE MIDDLETON (2011)
  // =========================================================================
  {
    id: "evt-2011-04-29-wedding-william-catherine-westminster",
    slug: "royal-wedding-prince-william-catherine-middleton-westminster",
    eventName: "The Marriage of Prince William and Catherine Middleton",
    startDate: "2011-04-29",
    endDate: "2011-04-29",
    datePrecision: "exact-day",
    city: "London",
    country: "United Kingdom",
    venueName: "Westminster Abbey",
    subvenue: "The Great Sanctuary",
    address: "Dean's Yard, Westminster, London SW1P 3PA, United Kingdom",
    latitude: 51.4993,
    longitude: -0.1273,
    summary: "Prince William, Duke of Cambridge, and Catherine Middleton were married at Westminster Abbey in a royal ceremony conducted by the Archbishop of Canterbury Rowan Williams.",
    description: "The wedding was watched by an estimated global broadcast audience of two billion people and attended by sovereign monarchs and dynastic heirs from across Europe.",
    verificationStatus: "verified",
    confidenceScore: 1.0,
    confidence: "confirmed",
    scope: "public",
    eventTypes: ["royal-wedding", "monarchical-ceremony", "state-ceremony"],
    categories: ["royal-wedding", "monarchical-ceremony"],
    sourceIds: [
      "src-uk-court-circular-20110429"
    ],
    participants: [
      { personId: "prince-william", name: "Prince William", role: "Royal Groom", presenceConfidence: "confirmed" },
      { personId: "catherine-princess-of-wales", name: "Catherine Middleton (Duchess of Cambridge)", role: "Royal Bride", presenceConfidence: "confirmed" },
      { personId: "charles-iii", name: "King Charles III (then Prince of Wales)", role: "Father of the Groom", presenceConfidence: "confirmed" },
      { personId: "queen-camilla", name: "Queen Camilla (then Duchess of Cornwall)", role: "Stepmother of the Groom", presenceConfidence: "confirmed" },
      { personId: "prince-harry", name: "Prince Harry", role: "Best Man", presenceConfidence: "confirmed" },
      { personId: "princess-anne", name: "Princess Anne", role: "Royal Family Guest", presenceConfidence: "confirmed" },
      { personId: "prince-edward", name: "Prince Edward", role: "Royal Family Guest", presenceConfidence: "confirmed" },
      { personId: "king-felipe-vi", name: "Prince Felipe (later Felipe VI)", role: "Visiting Heir Apparent", presenceConfidence: "confirmed" },
      { personId: "queen-letizia", name: "Princess Letizia", role: "Visiting Consort", presenceConfidence: "confirmed" },
      { personId: "queen-margrethe-ii", name: "Queen Margrethe II", role: "Visiting Sovereign", presenceConfidence: "confirmed" },
      { personId: "king-harald-v", name: "King Harald V", role: "Visiting Sovereign", presenceConfidence: "confirmed" },
      { personId: "queen-sonja-norway", name: "Queen Sonja", role: "Visiting Queen Consort", presenceConfidence: "confirmed" },
      { personId: "prince-albert-ii", name: "Prince Albert II", role: "Visiting Sovereign", presenceConfidence: "confirmed" },
      { personId: "princess-charlene", name: "Charlene Wittstock", role: "Visiting Fiancée", presenceConfidence: "confirmed" },
      { personId: "grand-duke-henri", name: "Grand Duke Henri", role: "Visiting Sovereign", presenceConfidence: "confirmed" },
      { personId: "margareta-custodian-romanian-crown", name: "Margareta of Romania", role: "Dynastic Head Guest", presenceConfidence: "confirmed" },
      { personId: "crown-prince-alexander-serbia", name: "Crown Prince Alexander", role: "Dynastic Head Guest", presenceConfidence: "confirmed" },
      { personId: "karl-von-habsburg", name: "Karl von Habsburg", role: "Dynastic Head Guest", presenceConfidence: "confirmed" }
    ]
  },

  // =========================================================================
  // 11. PRINCELY WEDDING OF PRINCE ALBERT II OF MONACO & CHARLENE WITTSTOCK (2011)
  // =========================================================================
  {
    id: "evt-2011-07-02-wedding-albert-charlene-monaco",
    slug: "wedding-prince-albert-ii-charlene-wittstock-monaco",
    eventName: "The Princely Wedding of Prince Albert II of Monaco and Charlene Wittstock",
    startDate: "2011-07-02",
    endDate: "2011-07-02",
    datePrecision: "exact-day",
    city: "Monaco-Ville",
    country: "Monaco",
    venueName: "Palais Princier de Monaco",
    subvenue: "Cour d'Honneur (Main Courtyard)",
    address: "Palais Princier, 98015 Monaco-Ville, Monaco",
    latitude: 43.7311,
    longitude: 7.4206,
    summary: "Prince Albert II of Monaco and Charlene Wittstock were married in an open-air religious ceremony in the Main Courtyard of the Prince's Palace of Monaco, celebrated by Archbishop Bernard Barsi.",
    description: "The religious wedding followed the civil union in the Throne Room, attended by European monarchs, international state leaders, and sports champions.",
    verificationStatus: "verified",
    confidenceScore: 1.0,
    confidence: "confirmed",
    scope: "government",
    eventTypes: ["royal-wedding", "state-ceremony"],
    categories: ["royal-wedding", "state-ceremony"],
    sourceIds: [
      "src-monaco-journal-20110702"
    ],
    participants: [
      { personId: "prince-albert-ii", name: "Prince Albert II", role: "Sovereign Groom", presenceConfidence: "confirmed" },
      { personId: "princess-charlene", name: "Princess Charlene", role: "Princess Bride", presenceConfidence: "confirmed" },
      { personId: "king-carl-xvi-gustaf", name: "King Carl XVI Gustaf", role: "Visiting Sovereign", presenceConfidence: "confirmed" },
      { personId: "queen-silvia-sweden", name: "Queen Silvia", role: "Visiting Queen Consort", presenceConfidence: "confirmed" },
      { personId: "king-philippe-belgium", name: "Prince Philippe (later Philippe I)", role: "Visiting Heir Apparent", presenceConfidence: "confirmed" },
      { personId: "queen-mathilde-belgium", name: "Princess Mathilde", role: "Visiting Consort", presenceConfidence: "confirmed" },
      { personId: "king-willem-alexander", name: "Prince Willem-Alexander", role: "Visiting Heir Apparent", presenceConfidence: "confirmed" },
      { personId: "queen-maxima", name: "Princess Máxima", role: "Visiting Consort", presenceConfidence: "confirmed" },
      { personId: "king-frederik-x", name: "Crown Prince Frederik", role: "Visiting Heir Apparent", presenceConfidence: "confirmed" },
      { personId: "queen-mary-denmark", name: "Crown Princess Mary", role: "Visiting Consort", presenceConfidence: "confirmed" },
      { personId: "crown-prince-haakon", name: "Crown Prince Haakon", role: "Visiting Heir Apparent", presenceConfidence: "confirmed" },
      { personId: "grand-duke-henri", name: "Grand Duke Henri", role: "Visiting Sovereign", presenceConfidence: "confirmed" },
      { personId: "hereditary-prince-alois", name: "Hereditary Prince Alois", role: "Visiting Sovereign Regent", presenceConfidence: "confirmed" },
      { personId: "prince-edward", name: "Prince Edward", role: "Visiting Royal Prince (UK)", presenceConfidence: "confirmed" },
      { personId: "sophie-duchess-of-edinburgh", name: "Sophie, Countess of Wessex", role: "Visiting Royal Guest (UK)", presenceConfidence: "confirmed" },
      { personId: "karl-von-habsburg", name: "Karl von Habsburg", role: "Dynastic Head Guest", presenceConfidence: "confirmed" },
      { personId: "jean-christophe-prince-napoleon", name: "Jean-Christophe, Prince Napoléon", role: "Dynastic Head Guest", presenceConfidence: "confirmed" }
    ]
  },

  // =========================================================================
  // 12. STATE FUNERAL OF HM KING MICHAEL I OF ROMANIA (2017)
  // =========================================================================
  {
    id: "evt-2017-12-16-funeral-king-michael-romania-bucharest",
    slug: "state-funeral-king-michael-i-bucharest-curtea-de-arges",
    eventName: "State Funeral and Burial of HM King Michael I of Romania",
    startDate: "2017-12-16",
    endDate: "2017-12-16",
    datePrecision: "exact-day",
    city: "Bucharest",
    country: "Romania",
    venueName: "Royal Palace of Bucharest",
    subvenue: "Throne Hall (Sala Tronului)",
    address: "Calea Victoriei 49-53, Sector 1, Bucharest 010063, Romania",
    latitude: 44.4395,
    longitude: 26.0963,
    summary: "The State Funeral of King Michael I, the last surviving wartime head of state in Europe, took place in Bucharest and Curtea de Argeș, attended by reigning European monarchs and historic royal houses.",
    description: "The funeral service at the Patriarchal Cathedral of Bucharest was followed by burial at the new Archbishopric and Royal Cathedral in Curtea de Argeș.",
    verificationStatus: "verified",
    confidenceScore: 1.0,
    confidence: "confirmed",
    scope: "government",
    eventTypes: ["state-funeral", "monarchical-ceremony"],
    categories: ["state-funeral", "monarchical-ceremony"],
    sourceIds: [
      "src-romania-custodian-communique-20171216"
    ],
    participants: [
      { personId: "margareta-custodian-romanian-crown", name: "Margareta, Custodian of the Crown", role: "Chief Mourner / Head of Royal House", presenceConfidence: "confirmed" },
      { personId: "charles-iii", name: "Prince Charles (later Charles III)", role: "Visiting Royal Prince (UK)", presenceConfidence: "confirmed" },
      { personId: "king-carl-xvi-gustaf", name: "King Carl XVI Gustaf", role: "Visiting Sovereign (Sweden)", presenceConfidence: "confirmed" },
      { personId: "queen-silvia-sweden", name: "Queen Silvia", role: "Visiting Queen Consort (Sweden)", presenceConfidence: "confirmed" },
      { personId: "grand-duke-henri", name: "Grand Duke Henri", role: "Visiting Sovereign (Luxembourg)", presenceConfidence: "confirmed" },
      { personId: "tsar-simeon-ii-bulgaria", name: "Tsar Simeon II", role: "Former Sovereign Mourner", presenceConfidence: "confirmed" },
      { personId: "crown-prince-alexander-serbia", name: "Crown Prince Alexander", role: "Dynastic Head Mourner", presenceConfidence: "confirmed" },
      { personId: "karl-von-habsburg", name: "Karl von Habsburg", role: "Dynastic Head Mourner", presenceConfidence: "confirmed" },
      { personId: "georg-friedrich-prince-of-prussia", name: "Georg Friedrich, Prince of Prussia", role: "Dynastic Head Mourner", presenceConfidence: "confirmed" },
      { personId: "duarte-pio-duke-of-braganza", name: "Duarte Pio, Duke of Braganza", role: "Dynastic Head Mourner", presenceConfidence: "confirmed" }
    ]
  },

  // =========================================================================
  // 13. FUNERAL OF HM KING CONSTANTINE II OF THE HELLENES (2023)
  // =========================================================================
  {
    id: "evt-2023-01-16-funeral-constantine-ii-athens",
    slug: "funeral-king-constantine-ii-metropolitan-cathedral-athens",
    eventName: "Funeral Service of HM King Constantine II of the Hellenes",
    startDate: "2023-01-16",
    endDate: "2023-01-16",
    datePrecision: "exact-day",
    city: "Athens",
    country: "Greece",
    venueName: "Metropolitan Cathedral of Athens",
    subvenue: "Main Nave (Mitropoli)",
    address: "Mitropoleos Square, 105 56 Athens, Greece",
    latitude: 37.9753,
    longitude: 23.7301,
    summary: "The funeral of Constantine II, the last King of the Hellenes and Olympic gold medalist, brought reigning European sovereigns to Athens before burial at the Tatoi Royal Cemetery.",
    description: "Presided over by Archbishop Ieronymos II of Athens and all Greece with 12 metropolitans, the service drew royalty representing Spain, Denmark, the UK, Sweden, the Netherlands, Belgium, Monaco, and Luxembourg.",
    verificationStatus: "verified",
    confidenceScore: 1.0,
    confidence: "confirmed",
    scope: "government",
    eventTypes: ["state-funeral", "monarchical-ceremony", "religious-service"],
    categories: ["state-funeral", "monarchical-ceremony"],
    sourceIds: [
      "src-greece-royal-funeral-20230116"
    ],
    participants: [
      { personId: "crown-prince-pavlos-greece", name: "Crown Prince Pavlos", role: "Chief Mourner / Head of Royal House", presenceConfidence: "confirmed" },
      { personId: "king-felipe-vi", name: "King Felipe VI", role: "Visiting Sovereign (Nephew of Deceased)", presenceConfidence: "confirmed" },
      { personId: "queen-letizia", name: "Queen Letizia", role: "Visiting Queen Consort", presenceConfidence: "confirmed" },
      { personId: "queen-margrethe-ii", name: "Queen Margrethe II", role: "Visiting Sovereign (Sister-in-Law of Deceased)", presenceConfidence: "confirmed" },
      { personId: "king-frederik-x", name: "Crown Prince Frederik", role: "Visiting Heir Apparent", presenceConfidence: "confirmed" },
      { personId: "king-carl-xvi-gustaf", name: "King Carl XVI Gustaf", role: "Visiting Sovereign", presenceConfidence: "confirmed" },
      { personId: "queen-silvia-sweden", name: "Queen Silvia", role: "Visiting Queen Consort", presenceConfidence: "confirmed" },
      { personId: "king-willem-alexander", name: "King Willem-Alexander", role: "Visiting Sovereign", presenceConfidence: "confirmed" },
      { personId: "queen-maxima", name: "Queen Máxima", role: "Visiting Queen Consort", presenceConfidence: "confirmed" },
      { personId: "king-philippe-belgium", name: "King Philippe", role: "Visiting Sovereign", presenceConfidence: "confirmed" },
      { personId: "queen-mathilde-belgium", name: "Queen Mathilde", role: "Visiting Queen Consort", presenceConfidence: "confirmed" },
      { personId: "crown-prince-haakon", name: "Crown Prince Haakon", role: "Visiting Heir Apparent", presenceConfidence: "confirmed" },
      { personId: "princess-anne", name: "Princess Anne", role: "Visiting Royal Princess (UK)", presenceConfidence: "confirmed" },
      { personId: "prince-albert-ii", name: "Prince Albert II", role: "Visiting Sovereign", presenceConfidence: "confirmed" },
      { personId: "grand-duke-henri", name: "Grand Duke Henri", role: "Visiting Sovereign", presenceConfidence: "confirmed" },
      { personId: "tsar-simeon-ii-bulgaria", name: "Tsar Simeon II", role: "Former Sovereign Mourner", presenceConfidence: "confirmed" },
      { personId: "crown-prince-alexander-serbia", name: "Crown Prince Alexander", role: "Dynastic Head Mourner", presenceConfidence: "confirmed" },
      { personId: "margareta-custodian-romanian-crown", name: "Margareta, Custodian of the Crown", role: "Dynastic Head Mourner", presenceConfidence: "confirmed" }
    ]
  },

  // =========================================================================
  // 14. WEDDING OF JEAN-CHRISTOPHE PRINCE NAPOLÉON (2019)
  // =========================================================================
  {
    id: "evt-2019-10-19-wedding-jean-christophe-napoleon-paris",
    slug: "wedding-prince-jean-christophe-napoleon-olympia-arco-invalides",
    eventName: "Marriage of Prince Jean-Christophe Napoléon and Countess Olympia Arco-Zinneberg",
    startDate: "2019-10-19",
    endDate: "2019-10-19",
    datePrecision: "exact-day",
    city: "Paris",
    country: "France",
    venueName: "Cathédrale Saint-Louis des Invalides",
    subvenue: "Soldiers' Chapel",
    address: "129 Rue de Grenelle, 75007 Paris, France",
    latitude: 48.8550,
    longitude: 2.3125,
    summary: "Prince Jean-Christophe Napoléon, head of the Imperial House of Bonaparte, married Countess Olympia von und zu Arco-Zinneberg (great-granddaughter of Emperor Charles I of Austria) at Les Invalides in Paris.",
    description: "The marriage symbolically united the houses of Bonaparte and Habsburg for the first time since the 1810 marriage of Emperor Napoleon I and Archduchess Marie Louise of Austria.",
    verificationStatus: "verified",
    confidenceScore: 1.0,
    confidence: "confirmed",
    scope: "government",
    eventTypes: ["royal-wedding", "monarchical-ceremony"],
    categories: ["royal-wedding", "monarchical-ceremony"],
    sourceIds: [
      "src-bonaparte-wedding-20191019"
    ],
    participants: [
      { personId: "jean-christophe-prince-napoleon", name: "Jean-Christophe, Prince Napoléon", role: "Imperial Groom", presenceConfidence: "confirmed" },
      { personId: "karl-von-habsburg", name: "Karl von Habsburg", role: "Head of House of Habsburg-Lorraine Guest", presenceConfidence: "confirmed" },
      { personId: "grand-duke-henri", name: "Grand Duke Henri", role: "Grand Duke of Luxembourg Guest", presenceConfidence: "confirmed" },
      { personId: "jean-count-of-paris", name: "Jean, Count of Paris", role: "Head of House of Orléans Guest", presenceConfidence: "confirmed" },
      { personId: "louis-alphonse-duke-of-anjou", name: "Louis Alphonse, Duke of Anjou", role: "Head of House of Bourbon Guest", presenceConfidence: "confirmed" },
      { personId: "duarte-pio-duke-of-braganza", name: "Duarte Pio, Duke of Braganza", role: "Head of House of Braganza Guest", presenceConfidence: "confirmed" }
    ]
  },

  // =========================================================================
  // 15. NOBEL PRIZE AWARD CEREMONY & BANQUET (2023)
  // =========================================================================
  {
    id: "evt-2023-12-10-nobel-prize-ceremony-stockholm",
    slug: "nobel-prize-award-ceremony-concert-hall-stockholm-2023",
    eventName: "The Nobel Prize Award Ceremony and Royal Banquet in Stockholm",
    startDate: "2023-12-10",
    endDate: "2023-12-10",
    datePrecision: "exact-day",
    city: "Stockholm",
    country: "Sweden",
    venueName: "Stockholm Concert Hall",
    subvenue: "Main Auditorium (Stora Salen)",
    address: "Hötorget 8, 111 57 Stockholm, Sweden",
    latitude: 59.3347,
    longitude: 18.0628,
    summary: "King Carl XVI Gustaf presented the 2023 Nobel Prizes in Physics, Chemistry, Physiology or Medicine, Literature, and Economic Sciences at the Stockholm Concert Hall followed by the traditional Royal Banquet in the Blue Hall of Stockholm City Hall.",
    description: "The annual ceremony on the anniversary of Alfred Nobel's death was attended by the Swedish Royal Family, laureates, academicians, and international diplomats.",
    verificationStatus: "verified",
    confidenceScore: 1.0,
    confidence: "confirmed",
    scope: "government",
    eventTypes: ["award-ceremony", "state-ceremony"],
    categories: ["award-ceremony", "state-ceremony"],
    sourceIds: [
      "src-nobel-prize-ceremony-2023"
    ],
    participants: [
      { personId: "king-carl-xvi-gustaf", name: "King Carl XVI Gustaf", role: "Royal Awarder & Sovereign Patron", presenceConfidence: "confirmed" },
      { personId: "queen-silvia-sweden", name: "Queen Silvia", role: "Queen Consort of Sweden", presenceConfidence: "confirmed" },
      { personId: "crown-princess-victoria", name: "Crown Princess Victoria", role: "Crown Princess of Sweden", presenceConfidence: "confirmed" }
    ]
  },

  // =========================================================================
  // 16. STATE VISIT OF KING FELIPE VI & QUEEN LETIZIA TO THE UK (2017)
  // =========================================================================
  {
    id: "evt-2017-07-12-state-visit-spain-uk",
    slug: "state-visit-king-felipe-vi-queen-letizia-london-2017",
    eventName: "State Visit of King Felipe VI and Queen Letizia of Spain to the United Kingdom",
    startDate: "2017-07-12",
    endDate: "2017-07-14",
    datePrecision: "exact-day",
    city: "London",
    country: "United Kingdom",
    venueName: "Palace of Westminster",
    subvenue: "Royal Gallery",
    address: "Westminster, London SW1A 0AA, United Kingdom",
    latitude: 51.5014,
    longitude: -0.1419,
    summary: "King Felipe VI and Queen Letizia conducted a three-day state visit to the UK, highlighted by King Felipe's address to a joint session of Parliament in the Royal Gallery and a State Banquet at Buckingham Palace.",
    description: "The visit reaffirmed historical dynastic alliances and bilateral strategic ties between the British and Spanish crowns.",
    verificationStatus: "verified",
    confidenceScore: 1.0,
    confidence: "confirmed",
    scope: "government",
    eventTypes: ["state-visit", "bilateral-meeting", "state-ceremony"],
    categories: ["state-visit", "state-ceremony"],
    sourceIds: [
      "src-uk-court-circular-20170712",
      "src-spain-boe-20140619"
    ],
    participants: [
      { personId: "king-felipe-vi", name: "King Felipe VI", role: "Visiting Sovereign", presenceConfidence: "confirmed" },
      { personId: "queen-letizia", name: "Queen Letizia", role: "Visiting Queen Consort", presenceConfidence: "confirmed" },
      { personId: "charles-iii", name: "Prince Charles (later Charles III)", role: "Host Royal Family Member", presenceConfidence: "confirmed" },
      { personId: "queen-camilla", name: "Camilla, Duchess of Cornwall", role: "Host Royal Family Member", presenceConfidence: "confirmed" },
      { personId: "prince-william", name: "Prince William", role: "Duke of Cambridge", presenceConfidence: "confirmed" },
      { personId: "prince-harry", name: "Prince Harry", role: "Host Royal Escort", presenceConfidence: "confirmed" }
    ]
  },

  // =========================================================================
  // 17. STATE VISIT OF KING CHARLES III & QUEEN CAMILLA TO FRANCE (2023)
  // =========================================================================
  {
    id: "evt-2023-09-20-state-visit-charles-france",
    slug: "state-visit-king-charles-iii-france-senate-versailles-2023",
    eventName: "State Visit of King Charles III and Queen Camilla to the French Republic",
    startDate: "2023-09-20",
    endDate: "2023-09-22",
    datePrecision: "exact-day",
    city: "Paris",
    country: "France",
    venueName: "Palais du Luxembourg",
    subvenue: "Senate Chamber (Hémicycle)",
    address: "15 Rue de Vaugirard, 75006 Paris, France",
    latitude: 48.8482,
    longitude: 2.3371,
    summary: "King Charles III became the first British monarch to deliver a speech from the French Senate chamber in French, followed by a State Banquet in the Hall of Mirrors at Versailles.",
    description: "The state visit celebrated the renewal of Franco-British bilateral diplomacy and environmental cooperation.",
    verificationStatus: "verified",
    confidenceScore: 1.0,
    confidence: "confirmed",
    scope: "government",
    eventTypes: ["state-visit", "speech-plenary", "state-ceremony"],
    categories: ["state-visit", "state-ceremony"],
    sourceIds: [
      "src-uk-court-circular-20230920",
      "src-france-elysee-20240606"
    ],
    participants: [
      { personId: "charles-iii", name: "King Charles III", role: "Visiting Sovereign & Senate Speaker", presenceConfidence: "confirmed" },
      { personId: "queen-camilla", name: "Queen Camilla", role: "Visiting Queen Consort", presenceConfidence: "confirmed" }
    ]
  },

  // =========================================================================
  // 18. STATE VISIT OF KING CHARLES III & QUEEN CAMILLA TO GERMANY (2023)
  // =========================================================================
  {
    id: "evt-2023-03-29-state-visit-charles-germany",
    slug: "state-visit-king-charles-iii-germany-bundestag-berlin-2023",
    eventName: "State Visit of King Charles III and Queen Camilla to the Federal Republic of Germany",
    startDate: "2023-03-29",
    endDate: "2023-03-31",
    datePrecision: "exact-day",
    city: "Berlin",
    country: "Germany",
    venueName: "Reichstag Building",
    subvenue: "Plenary Chamber (Plenarsaal)",
    address: "Platz der Republik 1, 11011 Berlin, Germany",
    latitude: 52.5186,
    longitude: 13.3762,
    summary: "In his first state visit as monarch, King Charles III addressed the German Bundestag in the Reichstag building and was honored at a State Banquet at Bellevue Palace.",
    description: "The address praised deep historic Anglo-German connections and shared commitments to European security.",
    verificationStatus: "verified",
    confidenceScore: 1.0,
    confidence: "confirmed",
    scope: "government",
    eventTypes: ["state-visit", "speech-plenary", "state-ceremony"],
    categories: ["state-visit", "state-ceremony"],
    sourceIds: [
      "src-uk-court-circular-20230329"
    ],
    participants: [
      { personId: "charles-iii", name: "King Charles III", role: "Visiting Sovereign & Bundestag Speaker", presenceConfidence: "confirmed" },
      { personId: "queen-camilla", name: "Queen Camilla", role: "Visiting Queen Consort", presenceConfidence: "confirmed" }
    ]
  },

  // =========================================================================
  // 19. STATE VISIT OF KING WILLEM-ALEXANDER & QUEEN MÁXIMA TO BELGIUM (2023)
  // =========================================================================
  {
    id: "evt-2023-06-20-state-visit-netherlands-belgium",
    slug: "state-visit-king-willem-alexander-queen-maxima-belgium-2023",
    eventName: "State Visit of King Willem-Alexander and Queen Máxima to the Kingdom of Belgium",
    startDate: "2023-06-20",
    endDate: "2023-06-22",
    datePrecision: "exact-day",
    city: "Brussels",
    country: "Belgium",
    venueName: "Royal Palace of Brussels",
    subvenue: "Throne Room",
    address: "Place des Palais 7, 1000 Brussels, Belgium",
    latitude: 50.8417,
    longitude: 4.3625,
    summary: "King Willem-Alexander and Queen Máxima undertook a three-day state visit to Belgium, hosted by King Philippe and Queen Mathilde, strengthening Benelux cooperation.",
    description: "The state visit included bilateral meetings, sustainable ports technology discussions in Antwerp, and a gala state banquet at Laeken.",
    verificationStatus: "verified",
    confidenceScore: 1.0,
    confidence: "confirmed",
    scope: "government",
    eventTypes: ["state-visit", "bilateral-meeting", "state-ceremony"],
    categories: ["state-visit", "state-ceremony"],
    sourceIds: [
      "src-belgium-monarchie-20230620",
      "src-netherlands-staatscourant-20130430"
    ],
    participants: [
      { personId: "king-willem-alexander", name: "King Willem-Alexander", role: "Visiting Sovereign", presenceConfidence: "confirmed" },
      { personId: "queen-maxima", name: "Queen Máxima", role: "Visiting Queen Consort", presenceConfidence: "confirmed" },
      { personId: "king-philippe-belgium", name: "King Philippe", role: "Host Sovereign", presenceConfidence: "confirmed" },
      { personId: "queen-mathilde-belgium", name: "Queen Mathilde", role: "Host Queen Consort", presenceConfidence: "confirmed" },
      { personId: "princess-elisabeth-belgium", name: "Princess Elisabeth", role: "Duchess of Brabant / Heir Apparent", presenceConfidence: "confirmed" }
    ]
  },

  // =========================================================================
  // 20. STATE VISIT OF KING HARALD V & QUEEN SONJA TO DENMARK (2023)
  // =========================================================================
  {
    id: "evt-2023-06-15-state-visit-norway-denmark",
    slug: "state-visit-king-harald-v-queen-sonja-denmark-2023",
    eventName: "State Visit of King Harald V and Queen Sonja of Norway to Denmark",
    startDate: "2023-06-15",
    endDate: "2023-06-16",
    datePrecision: "exact-day",
    city: "Copenhagen",
    country: "Denmark",
    venueName: "Amalienborg Palace",
    subvenue: "Christian VII's Palace (Moltke's Palace)",
    address: "Amalienborg Slotsplads 5, 1257 Copenhagen, Denmark",
    latitude: 55.6841,
    longitude: 12.5931,
    summary: "King Harald V and Queen Sonja traveled on the Royal Yacht Norge to Copenhagen on an official visit celebrating Nordic monarchical and green energy ties.",
    description: "The visit featured official meetings at Christiansborg, a business summit, and a dinner hosted by Queen Margrethe II at Amalienborg.",
    verificationStatus: "verified",
    confidenceScore: 1.0,
    confidence: "confirmed",
    scope: "government",
    eventTypes: ["state-visit", "bilateral-meeting", "state-ceremony"],
    categories: ["state-visit", "state-ceremony"],
    sourceIds: [
      "src-norway-kongehuset-20230615",
      "src-denmark-statsministeriet-20240114"
    ],
    participants: [
      { personId: "king-harald-v", name: "King Harald V", role: "Visiting Sovereign", presenceConfidence: "confirmed" },
      { personId: "queen-sonja-norway", name: "Queen Sonja", role: "Visiting Queen Consort", presenceConfidence: "confirmed" },
      { personId: "queen-margrethe-ii", name: "Queen Margrethe II", role: "Host Sovereign", presenceConfidence: "confirmed" },
      { personId: "king-frederik-x", name: "Crown Prince Frederik (later Frederik X)", role: "Host Heir Apparent", presenceConfidence: "confirmed" },
      { personId: "queen-mary-denmark", name: "Crown Princess Mary", role: "Host Consort", presenceConfidence: "confirmed" }
    ]
  },

  // =========================================================================
  // 21. STATE FUNERAL OF GRAND DUKE JEAN OF LUXEMBOURG (2019)
  // =========================================================================
  {
    id: "evt-2019-05-04-funeral-grand-duke-jean-luxembourg",
    slug: "state-funeral-grand-duke-jean-notre-dame-cathedral-luxembourg",
    eventName: "State Funeral of His Royal Highness Grand Duke Jean of Luxembourg",
    startDate: "2019-05-04",
    endDate: "2019-05-04",
    datePrecision: "exact-day",
    city: "Luxembourg City",
    country: "Luxembourg",
    venueName: "Notre-Dame Cathedral of Luxembourg",
    subvenue: "Main Nave & Crypt",
    address: "Rue Notre-Dame, 2240 Luxembourg, Luxembourg",
    latitude: 49.6097,
    longitude: 6.1314,
    summary: "The national funeral of Grand Duke Jean of Luxembourg brought together European reigning sovereigns and historic royal heads to honor the Normandy liberation hero.",
    description: "Presided over by Archbishop Jean-Claude Hollerich, the pontifical requiem celebrated Grand Duke Jean's 36-year reign and WWII military service in the Irish Guards.",
    verificationStatus: "verified",
    confidenceScore: 1.0,
    confidence: "confirmed",
    scope: "government",
    eventTypes: ["state-funeral", "monarchical-ceremony", "religious-service"],
    categories: ["state-funeral", "state-ceremony"],
    sourceIds: [
      "src-luxembourg-cour-20190504",
      "src-luxembourg-memorial-20001007"
    ],
    participants: [
      { personId: "grand-duke-henri", name: "Grand Duke Henri", role: "Chief Mourner / Sovereign", presenceConfidence: "confirmed" },
      { personId: "grand-duchess-maria-teresa", name: "Grand Duchess Maria Teresa", role: "Grand Duchess of Luxembourg", presenceConfidence: "confirmed" },
      { personId: "hereditary-grand-duke-guillaume", name: "Hereditary Grand Duke Guillaume", role: "Heir Apparent", presenceConfidence: "confirmed" },
      { personId: "stephanie-hereditary-grand-duchess-luxembourg", name: "Hereditary Grand Duchess Stéphanie", role: "Hereditary Grand Duchess", presenceConfidence: "confirmed" },
      { personId: "king-philippe-belgium", name: "King Philippe", role: "Visiting Sovereign", presenceConfidence: "confirmed" },
      { personId: "queen-mathilde-belgium", name: "Queen Mathilde", role: "Visiting Queen Consort", presenceConfidence: "confirmed" },
      { personId: "albert-ii-belgium", name: "King Albert II", role: "Former Sovereign", presenceConfidence: "confirmed" },
      { personId: "queen-paola-belgium", name: "Queen Paola", role: "Former Queen Consort", presenceConfidence: "confirmed" },
      { personId: "king-willem-alexander", name: "King Willem-Alexander", role: "Visiting Sovereign", presenceConfidence: "confirmed" },
      { personId: "princess-beatrix-netherlands", name: "Princess Beatrix", role: "Former Sovereign", presenceConfidence: "confirmed" },
      { personId: "king-carl-xvi-gustaf", name: "King Carl XVI Gustaf", role: "Visiting Sovereign", presenceConfidence: "confirmed" },
      { personId: "queen-silvia-sweden", name: "Queen Silvia", role: "Visiting Queen Consort", presenceConfidence: "confirmed" },
      { personId: "queen-margrethe-ii", name: "Queen Margrethe II", role: "Visiting Sovereign", presenceConfidence: "confirmed" },
      { personId: "juan-carlos-i-spain", name: "King Juan Carlos I", role: "Former Sovereign", presenceConfidence: "confirmed" },
      { personId: "queen-sofia-spain", name: "Queen Sofía", role: "Former Queen Consort", presenceConfidence: "confirmed" },
      { personId: "prince-albert-ii", name: "Prince Albert II", role: "Visiting Sovereign", presenceConfidence: "confirmed" },
      { personId: "hereditary-prince-alois", name: "Hereditary Prince Alois", role: "Visiting Sovereign Regent", presenceConfidence: "confirmed" },
      { personId: "princess-anne", name: "Princess Anne", role: "Visiting Royal Princess (UK)", presenceConfidence: "confirmed" }
    ]
  },

  // =========================================================================
  // 22. CENTENARY COMMEMORATION OF THE ARMISTICE OF 1918 (2018)
  // =========================================================================
  {
    id: "evt-2018-11-11-armistice-centenary-paris",
    slug: "centenary-armistice-commemoration-arc-de-triomphe-paris-2018",
    eventName: "Centenary International Commemoration of the Armistice of 11 November 1918",
    startDate: "2018-11-11",
    endDate: "2018-11-11",
    datePrecision: "exact-day",
    city: "Paris",
    country: "France",
    venueName: "Arc de Triomphe",
    subvenue: "Tomb of the Unknown Soldier (Place Charles de Gaulle)",
    address: "Place Charles de Gaulle, 75008 Paris, France",
    latitude: 48.8738,
    longitude: 2.2950,
    summary: "Over 70 heads of state and European sovereign monarchs assembled at the Tomb of the Unknown Soldier beneath the Arc de Triomphe in Paris to mark 100 years since the 1918 Armistice.",
    description: "The global remembrance ceremony featured the rekindling of the Eternal Flame, classical musical performances by Yo-Yo Ma, and addresses calling for multilateral peace.",
    verificationStatus: "verified",
    confidenceScore: 1.0,
    confidence: "confirmed",
    scope: "diplomatic",
    eventTypes: ["international-commemoration", "diplomatic-summit", "state-ceremony"],
    categories: ["international-commemoration", "state-ceremony"],
    sourceIds: [
      "src-france-elysee-20181111"
    ],
    participants: [
      { personId: "king-felipe-vi", name: "King Felipe VI", role: "Head of State of Spain", presenceConfidence: "confirmed" },
      { personId: "king-philippe-belgium", name: "King Philippe", role: "King of the Belgians", presenceConfidence: "confirmed" },
      { personId: "grand-duke-henri", name: "Grand Duke Henri", role: "Grand Duke of Luxembourg", presenceConfidence: "confirmed" },
      { personId: "prince-albert-ii", name: "Prince Albert II", role: "Prince of Monaco", presenceConfidence: "confirmed" }
    ]
  },

  // =========================================================================
  // 23. ROYAL WEDDING OF INFANTA MARIA FRANCISCA OF PORTUGAL (2023)
  // =========================================================================
  {
    id: "evt-2023-10-07-wedding-maria-francisca-braganza-mafra",
    slug: "royal-wedding-infanta-maria-francisca-braganza-mafra-palace-2023",
    eventName: "Marriage of Infanta Maria Francisca of Braganza and Duarte de Sousa Araújo Martins",
    startDate: "2023-10-07",
    endDate: "2023-10-07",
    datePrecision: "exact-day",
    city: "Mafra",
    country: "Portugal",
    venueName: "National Palace of Mafra",
    subvenue: "Basilica of Mafra",
    address: "Terreiro D. João V, 2640-492 Mafra, Portugal",
    latitude: 38.9372,
    longitude: -9.3267,
    summary: "Infanta Maria Francisca of Portugal married Duarte de Sousa Araújo Martins at the Basilica of the National Palace of Mafra in the first Portuguese royal wedding in 28 years.",
    description: "Broadcast live on national television, the ceremony was attended by the President of Portugal, European royal houses, and thousands of well-wishers.",
    verificationStatus: "verified",
    confidenceScore: 1.0,
    confidence: "confirmed",
    scope: "public",
    eventTypes: ["royal-wedding", "monarchical-ceremony"],
    categories: ["royal-wedding", "monarchical-ceremony"],
    sourceIds: [
      "src-portugal-braganza-wedding-20231007"
    ],
    participants: [
      { personId: "infanta-maria-francisca-portugal", name: "Infanta Maria Francisca", role: "Royal Bride", presenceConfidence: "confirmed" },
      { personId: "duarte-pio-duke-of-braganza", name: "Duarte Pio, Duke of Braganza", role: "Father of the Bride", presenceConfidence: "confirmed" },
      { personId: "isabel-duchess-of-braganza", name: "Isabel, Duchess of Braganza", role: "Mother of the Bride", presenceConfidence: "confirmed" },
      { personId: "afonso-prince-of-beira", name: "Afonso, Prince of Beira", role: "Brother of the Bride", presenceConfidence: "confirmed" },
      { personId: "louis-alphonse-duke-of-anjou", name: "Louis Alphonse, Duke of Anjou", role: "Dynastic Royal Guest", presenceConfidence: "confirmed" },
      { personId: "jean-christophe-prince-napoleon", name: "Jean-Christophe, Prince Napoléon", role: "Dynastic Royal Guest", presenceConfidence: "confirmed" }
    ]
  },

  // =========================================================================
  // 24. ROYAL WEDDING OF GRAND DUKE GEORGE MIKHAILOVICH OF RUSSIA (2021)
  // =========================================================================
  {
    id: "evt-2021-10-01-wedding-george-mikhailovich-st-petersburg",
    slug: "royal-wedding-grand-duke-george-mikhailovich-saint-isaacs-2021",
    eventName: "Marriage of Grand Duke George Mikhailovich of Russia and Victoria Romanovna Bettarini",
    startDate: "2021-10-01",
    endDate: "2021-10-01",
    datePrecision: "exact-day",
    city: "Saint Petersburg",
    country: "Russia",
    venueName: "Saint Isaac's Cathedral",
    subvenue: "Main Cathedral Nave",
    address: "Isaakiyevskaya Ploshchad 4, Saint Petersburg 190000, Russia",
    latitude: 59.9341,
    longitude: 30.3061,
    summary: "Grand Duke George Mikhailovich of Russia married Victoria Romanovna Bettarini at Saint Isaac's Cathedral in Saint Petersburg in the first royal wedding in Russia since 1917.",
    description: "The Russian Orthodox nuptial service was celebrated by Metropolitan Varsonofy of Saint Petersburg and Ladoga, attended by international royalty and Russian nobility.",
    verificationStatus: "verified",
    confidenceScore: 1.0,
    confidence: "confirmed",
    scope: "public",
    eventTypes: ["royal-wedding", "monarchical-ceremony", "religious-service"],
    categories: ["royal-wedding", "monarchical-ceremony"],
    sourceIds: [
      "src-russia-romanov-wedding-20211001"
    ],
    participants: [
      { personId: "george-mikhailovich-russia", name: "Grand Duke George Mikhailovich", role: "Imperial Groom", presenceConfidence: "confirmed" },
      { personId: "maria-vladimirovna-russia", name: "Grand Duchess Maria Vladimirovna", role: "Mother of the Groom / Head of Romanov House", presenceConfidence: "confirmed" },
      { personId: "tsar-simeon-ii-bulgaria", name: "Tsar Simeon II", role: "Visiting Sovereign / Royal Guest", presenceConfidence: "confirmed" },
      { personId: "duarte-pio-duke-of-braganza", name: "Duarte Pio, Duke of Braganza", role: "Visiting Royal Guest", presenceConfidence: "confirmed" },
      { personId: "aimone-duke-of-aosta", name: "Prince Aimone, Duke of Aosta", role: "Visiting Royal Guest", presenceConfidence: "confirmed" }
    ]
  }
];

