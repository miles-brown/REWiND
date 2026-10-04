/**
 * REWIND EVIDENCE ATLAS — CANONICAL SEED REGISTER: ROYAL BIOGRAPHICAL DETAILS
 *
 * Forensically documented education credentials, public mandates & military careers,
 * state orders & honours, published works/books, and official palaces/residences
 * for reigning European sovereigns and historic royal house leaders.
 */

export interface RoyalEducationSeed {
  id: string;
  personId: string;
  institution: string;
  degree?: string;
  fieldOfStudy?: string;
  startYear?: string;
  endYear?: string;
  notes?: string;
  sourceId?: string;
}

export interface RoyalCareerSeed {
  id: string;
  personId: string;
  organisationName: string;
  roleTitle: string;
  startDate?: string;
  endDate?: string;
  isCurrent: boolean;
  notes?: string;
  sourceId?: string;
}

export interface RoyalAwardSeed {
  id: string;
  personId: string;
  awardName: string;
  awardingBody: string;
  yearReceived?: string;
  citation?: string;
  sourceId?: string;
}

export interface RoyalWorkSeed {
  id: string;
  personId: string;
  title: string;
  workType: string;
  publicationYear?: string;
  publisher?: string;
  url?: string;
  notes?: string;
  sourceId?: string;
}

export interface RoyalStaySeed {
  id: string;
  personId: string;
  venueName: string;
  stayName?: string;
  stayType: "official_residence" | "private_home" | "hotel" | "embassy" | "military_base";
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  startDate: string;
  endDate?: string | null;
  isBaseOfOperations: boolean;
  isPrimaryResidence: boolean;
  securityLevel?: string;
  notes?: string;
  sourceId?: string;
}

export const royalEducationSeed: RoyalEducationSeed[] = [
  // Charles III
  {
    id: "edu-charles-trinity-cambridge",
    personId: "charles-iii",
    institution: "Trinity College, Cambridge",
    degree: "Bachelor of Arts (BA)",
    fieldOfStudy: "Anthropology, Archaeology, and History",
    startYear: "1967",
    endYear: "1970",
    notes: "First British monarch or heir apparent to earn a university degree.",
    sourceId: "src-uk-court-circular-20230506",
  },
  {
    id: "edu-charles-aberystwyth",
    personId: "charles-iii",
    institution: "University College of Wales, Aberystwyth",
    degree: "Welsh Language and History Term",
    fieldOfStudy: "Welsh Studies",
    startYear: "1969",
    endYear: "1969",
    notes: "Studied Welsh prior to his investiture as Prince of Wales at Caernarfon Castle.",
    sourceId: "src-uk-court-circular-20230506",
  },
  {
    id: "edu-charles-dartmouth",
    personId: "charles-iii",
    institution: "Royal Naval College, Dartmouth",
    degree: "Officer Training Course",
    fieldOfStudy: "Naval Science and Navigation",
    startYear: "1971",
    endYear: "1971",
    notes: "Qualified as a naval helicopter pilot and surface ship navigator.",
    sourceId: "src-uk-court-circular-20230506",
  },

  // Prince William
  {
    id: "edu-william-st-andrews",
    personId: "prince-william",
    institution: "University of St Andrews",
    degree: "Master of Arts (MA Hons, 2:1)",
    fieldOfStudy: "Geography (initially Art History)",
    startYear: "2001",
    endYear: "2005",
    notes: "Graduated with Scottish Master of Arts degree.",
    sourceId: "src-uk-court-circular-20110429",
  },
  {
    id: "edu-william-sandhurst",
    personId: "prince-william",
    institution: "Royal Military Academy Sandhurst",
    degree: "Commissioned Army Officer",
    fieldOfStudy: "Military Leadership and Tactics",
    startYear: "2006",
    endYear: "2006",
    notes: "Commissioned into the Blues and Royals (Household Cavalry).",
    sourceId: "src-uk-court-circular-20110429",
  },

  // Catherine, Princess of Wales
  {
    id: "edu-catherine-st-andrews",
    personId: "catherine-princess-of-wales",
    institution: "University of St Andrews",
    degree: "Master of Arts (MA Hons, 2:1)",
    fieldOfStudy: "Art History",
    startYear: "2001",
    endYear: "2005",
    notes: "Graduated from St Andrews University.",
    sourceId: "src-uk-court-circular-20110429",
  },

  // King Felipe VI of Spain
  {
    id: "edu-felipe-uam-law",
    personId: "felipe-vi-spain",
    institution: "Universidad Autónoma de Madrid (UAM)",
    degree: "Licenciatura en Derecho (Law Degree)",
    fieldOfStudy: "Law and Economics",
    startYear: "1988",
    endYear: "1993",
    notes: "First Spanish monarch to hold a university law degree.",
    sourceId: "src-spain-boe-20140619",
  },
  {
    id: "edu-felipe-georgetown",
    personId: "felipe-vi-spain",
    institution: "Edmund A. Walsh School of Foreign Service, Georgetown University",
    degree: "Master of Science in Foreign Service (MSFS)",
    fieldOfStudy: "International Relations and Security Studies",
    startYear: "1993",
    endYear: "1995",
    notes: "Postgraduate master's degree in Washington, D.C.",
    sourceId: "src-spain-boe-20140619",
  },

  // Princess Leonor of Spain
  {
    id: "edu-leonor-uwc-atlantic",
    personId: "leonor-princess-of-asturias",
    institution: "UWC Atlantic College (Wales)",
    degree: "International Baccalaureate (IB)",
    fieldOfStudy: "Secondary Education",
    startYear: "2021",
    endYear: "2023",
    notes: "Completed International Baccalaureate diploma in Wales.",
    sourceId: "src-spain-boe-20231031",
  },
  {
    id: "edu-leonor-zaragoza-military",
    personId: "leonor-princess-of-asturias",
    institution: "Academia General Militar de Zaragoza",
    degree: "Officer Cadet Course",
    fieldOfStudy: "Military Science (Spanish Army)",
    startYear: "2023",
    endYear: "2024",
    notes: "First year of three-year military training across Army, Navy, and Air Force.",
    sourceId: "src-spain-boe-20231031",
  },

  // King Philippe of Belgium
  {
    id: "edu-philippe-rma-belgium",
    personId: "philippe-belgium",
    institution: "Royal Military Academy of Belgium (RMA)",
    degree: "Military Science Diploma",
    fieldOfStudy: "Aeronautics and Military Leadership",
    startYear: "1978",
    endYear: "1981",
    notes: "Qualified military fighter jet and helicopter pilot.",
    sourceId: "src-belgium-moniteur-20130721",
  },
  {
    id: "edu-philippe-stanford",
    personId: "philippe-belgium",
    institution: "Stanford University",
    degree: "Master of Arts (MA)",
    fieldOfStudy: "Political Science",
    startYear: "1983",
    endYear: "1985",
    notes: "Master's degree in Political Science in California.",
    sourceId: "src-belgium-moniteur-20130721",
  },

  // King Willem-Alexander of the Netherlands
  {
    id: "edu-willem-alexander-leiden",
    personId: "willem-alexander-netherlands",
    institution: "Leiden University",
    degree: "Doctorandus in History (MA Equivalent)",
    fieldOfStudy: "History",
    startYear: "1987",
    endYear: "1993",
    notes: "Studied Dutch history, constitutional law, and international economics.",
    sourceId: "src-netherlands-staatscourant-20130430",
  },

  // Crown Princess Victoria of Sweden
  {
    id: "edu-victoria-yale",
    personId: "victoria-crown-princess-sweden",
    institution: "Yale University",
    degree: "Special Studies Program",
    fieldOfStudy: "Political Science and History",
    startYear: "1998",
    endYear: "2000",
    notes: "Two years of specialized academic study in the United States.",
    sourceId: "src-sweden-kungahuset-20230915",
  },
  {
    id: "edu-victoria-uppsala",
    personId: "victoria-crown-princess-sweden",
    institution: "Uppsala University",
    degree: "Bachelor of Arts (Filosofie Kandidatexamen)",
    fieldOfStudy: "Peace and Conflict Studies",
    startYear: "2006",
    endYear: "2009",
    notes: "Degree in peace, development, and international conflict resolution.",
    sourceId: "src-sweden-kungahuset-20230915",
  },

  // Prince Albert II of Monaco
  {
    id: "edu-albert-amherst",
    personId: "albert-ii-monaco",
    institution: "Amherst College (Massachusetts)",
    degree: "Bachelor of Arts (BA)",
    fieldOfStudy: "Political Science",
    startYear: "1977",
    endYear: "1981",
    notes: "Graduated with honors in political science.",
    sourceId: "src-monaco-journal-20110702",
  }
];

export const royalCareerSeed: RoyalCareerSeed[] = [
  // Charles III
  {
    id: "car-charles-king",
    personId: "charles-iii",
    organisationName: "Crown of the United Kingdom and Commonwealth Realms",
    roleTitle: "King and Head of State",
    startDate: "2022-09-08",
    isCurrent: true,
    notes: "Sovereign monarch of the United Kingdom and 14 Commonwealth realms.",
    sourceId: "src-uk-london-gazette-20220910-accession",
  },
  {
    id: "car-charles-prince-of-wales",
    personId: "charles-iii",
    organisationName: "Duchy of Cornwall / Royal Household",
    roleTitle: "Prince of Wales and Duke of Cornwall",
    startDate: "1958-07-26",
    endDate: "2022-09-08",
    isCurrent: false,
    notes: "Longest-serving heir apparent in British history (64 years as Prince of Wales).",
    sourceId: "src-uk-court-circular-20230506",
  },

  // Prince William
  {
    id: "car-william-prince-of-wales",
    personId: "prince-william",
    organisationName: "Duchy of Cornwall / Royal Household",
    roleTitle: "Prince of Wales and Duke of Cornwall",
    startDate: "2022-09-09",
    isCurrent: true,
    notes: "Heir apparent to the British throne and head of the Duchy of Cornwall estate.",
    sourceId: "src-uk-court-circular-20230506",
  },
  {
    id: "car-william-air-ambulance",
    personId: "prince-william",
    organisationName: "East Anglian Air Ambulance",
    roleTitle: "Air Ambulance Helicopter Pilot",
    startDate: "2015-07-01",
    endDate: "2017-07-27",
    isCurrent: false,
    notes: "Flew emergency medical response missions across Norfolk, Suffolk, Cambridgeshire and Bedfordshire.",
    sourceId: "src-uk-court-circular-20180519",
  },

  // King Felipe VI of Spain
  {
    id: "car-felipe-king-of-spain",
    personId: "felipe-vi-spain",
    organisationName: "Corona de España / Jefatura del Estado",
    roleTitle: "Rey de España (Head of State)",
    startDate: "2014-06-19",
    isCurrent: true,
    notes: "Sovereign King of Spain and Captain General of the Spanish Armed Forces.",
    sourceId: "src-spain-boe-20140619",
  },

  // King Philippe of Belgium
  {
    id: "car-philippe-king-of-belgians",
    personId: "philippe-belgium",
    organisationName: "Royaume de Belgique / Koninkrijk België",
    roleTitle: "Roi des Belges / Koning der Belgen (King of the Belgians)",
    startDate: "2013-07-21",
    isCurrent: true,
    notes: "Constitutional monarch and Head of State of the Kingdom of Belgium.",
    sourceId: "src-belgium-moniteur-20130721",
  },

  // King Willem-Alexander of the Netherlands
  {
    id: "car-willem-alexander-king",
    personId: "willem-alexander-netherlands",
    organisationName: "Koninkrijk der Nederlanden",
    roleTitle: "Koning der Nederlanden (King of the Netherlands)",
    startDate: "2013-04-30",
    isCurrent: true,
    notes: "Sovereign monarch of the Kingdom of the Netherlands (Netherlands, Aruba, Curaçao, Sint Maarten).",
    sourceId: "src-netherlands-staatscourant-20130430",
  },

  // King Carl XVI Gustaf of Sweden
  {
    id: "car-carl-xvi-gustaf-king",
    personId: "carl-xvi-gustaf-sweden",
    organisationName: "Konungariket Sverige",
    roleTitle: "Sveriges Konung (King of Sweden)",
    startDate: "1973-09-15",
    isCurrent: true,
    notes: "Longest-reigning monarch in Swedish history (over 50 years of reign).",
    sourceId: "src-sweden-kungahuset-20230915",
  },

  // King Harald V of Norway
  {
    id: "car-harald-v-king",
    personId: "harald-v-norway",
    organisationName: "Kongeriket Norge",
    roleTitle: "Norges Konge (King of Norway)",
    startDate: "1991-01-17",
    isCurrent: true,
    notes: "Constitutional sovereign and Head of State of Norway.",
    sourceId: "src-norway-kongehuset-19910623",
  },

  // Prince Albert II of Monaco
  {
    id: "car-albert-ii-prince",
    personId: "albert-ii-monaco",
    organisationName: "Principauté de Monaco",
    roleTitle: "Prince Souverain de Monaco",
    startDate: "2005-04-06",
    isCurrent: true,
    notes: "Sovereign Prince and ruler of the Principality of Monaco.",
    sourceId: "src-monaco-journal-20050712",
  },

  // Grand Duke Henri of Luxembourg
  {
    id: "car-henri-grand-duke",
    personId: "henri-luxembourg",
    organisationName: "Grand-Duché de Luxembourg",
    roleTitle: "Grand-Duc de Luxembourg",
    startDate: "2000-10-07",
    isCurrent: true,
    notes: "Constitutional sovereign of the world's only sovereign Grand Duchy.",
    sourceId: "src-luxembourg-memorial-20001007",
  },

  // Prince Hans-Adam II of Liechtenstein
  {
    id: "car-hans-adam-ii-prince",
    personId: "hans-adam-ii-liechtenstein",
    organisationName: "Fürstentum Liechtenstein",
    roleTitle: "Fürst von und zu Liechtenstein (Sovereign Prince)",
    startDate: "1989-11-13",
    isCurrent: true,
    notes: "Sovereign Prince of Liechtenstein; delegated day-to-day regency to Hereditary Prince Alois in 2004.",
    sourceId: "src-liechtenstein-landtag-20040815",
  },

  // Archbishop Joan-Enric Vives i Sicília
  {
    id: "car-vives-co-prince",
    personId: "joan-enric-vives-sicilia",
    organisationName: "Principat d'Andorra & Bisbat d'Urgell",
    roleTitle: "Copríncep Episcopal d'Andorra & Arquebisbe d'Urgell",
    startDate: "2003-05-12",
    isCurrent: true,
    notes: "Ex officio Co-Prince and constitutional Head of State of Andorra.",
    sourceId: "src-andorra-bopa-20030724",
  }
];

export const royalAwardsSeed: RoyalAwardSeed[] = [
  // Charles III
  {
    id: "awd-charles-garter",
    personId: "charles-iii",
    awardName: "Knight Companion of the Most Noble Order of the Garter (KG / Sovereign)",
    awardingBody: "The British Crown",
    yearReceived: "1958",
    citation: "Invested as Prince of Wales and Knight Companion of the Garter; Sovereign of the Order since 2022.",
    sourceId: "src-uk-court-circular-20230506",
  },
  {
    id: "awd-charles-thistle",
    personId: "charles-iii",
    awardName: "Knight of the Most Ancient and Most Noble Order of the Thistle (KT / Sovereign)",
    awardingBody: "The British Crown",
    yearReceived: "1977",
    citation: "Highest chivalric order in Scotland.",
    sourceId: "src-uk-court-circular-20230506",
  },

  // King Felipe VI of Spain
  {
    id: "awd-felipe-golden-fleece",
    personId: "felipe-vi-spain",
    awardName: "Gran Maestre de la Insigne Orden del Toisón de Oro",
    awardingBody: "Casa Real de España",
    yearReceived: "1981",
    citation: "Invested with the Golden Fleece by King Juan Carlos I in 1981; Sovereign and Grand Master since 2014.",
    sourceId: "src-spain-boe-20140619",
  },
  {
    id: "awd-felipe-charles-iii",
    personId: "felipe-vi-spain",
    awardName: "Gran Maestre de la Real y Distinguida Orden Española de Carlos III",
    awardingBody: "Reino de España",
    yearReceived: "1986",
    citation: "Highest civil order of the Kingdom of Spain.",
    sourceId: "src-spain-boe-20140619",
  },

  // Princess Leonor of Spain
  {
    id: "awd-leonor-golden-fleece",
    personId: "leonor-princess-of-asturias",
    awardName: "Caballero de la Insigne Orden del Toisón de Oro",
    awardingBody: "Rey Felipe VI de España",
    yearReceived: "2018",
    citation: "Bestowed by King Felipe VI on his 50th birthday.",
    sourceId: "src-spain-boe-20231031",
  },
  {
    id: "awd-leonor-charles-iii",
    personId: "leonor-princess-of-asturias",
    awardName: "Gran Cruz de la Real y Distinguida Orden de Carlos III",
    awardingBody: "Gobierno de España / Rey Felipe VI",
    yearReceived: "2023",
    citation: "Awarded upon taking the constitutional oath on her 18th birthday.",
    sourceId: "src-spain-boe-20231031",
  },

  // King Carl XVI Gustaf of Sweden
  {
    id: "awd-carl-seraphim",
    personId: "carl-xvi-gustaf-sweden",
    awardName: "Lord and Master of the Royal Order of the Seraphim (RoKavKMO)",
    awardingBody: "Kungl. Maj:ts Orden (Sweden)",
    yearReceived: "1973",
    citation: "Grand Master of Sweden's highest order of chivalry.",
    sourceId: "src-sweden-kungahuset-20230915",
  },

  // Prince Albert II of Monaco
  {
    id: "awd-albert-saint-charles",
    personId: "albert-ii-monaco",
    awardName: "Grand Master of the Order of Saint-Charles",
    awardingBody: "Principauté de Monaco",
    yearReceived: "2005",
    citation: "Sovereign Grand Master of Monaco's highest civil order.",
    sourceId: "src-monaco-journal-20050712",
  }
];

export const royalWorksSeed: RoyalWorkSeed[] = [
  // Charles III
  {
    id: "wrk-charles-harmony",
    personId: "charles-iii",
    title: "Harmony: A New Way of Looking at Our World",
    workType: "Monograph / Philosophical Treatise",
    publicationYear: "2010",
    publisher: "HarperCollins",
    notes: "Comprehensive environmental and philosophical book outlining Prince Charles's holistic vision for architecture, climate sustainability, and organic farming.",
    sourceId: "src-uk-court-circular-20230506",
  },
  {
    id: "wrk-charles-vision-britain",
    personId: "charles-iii",
    title: "A Vision of Britain: A Personal View of Architecture",
    workType: "Monograph",
    publicationYear: "1989",
    publisher: "Doubleday",
    notes: "Influential architectural critique advocating traditional urbanism and community-centered design, leading to the creation of Poundbury in Dorset.",
    sourceId: "src-uk-court-circular-20230506",
  },

  // Jean Count of Paris
  {
    id: "wrk-jean-prince-francais",
    personId: "jean-count-of-paris",
    title: "Un Prince Français",
    workType: "Monograph / Political Memoir",
    publicationYear: "2009",
    publisher: "Éditions Pygmalion",
    notes: "Reflections on French history, republican monarchy, and civic identity.",
    sourceId: "src-france-elysee-20240606",
  },

  // Prince Hans-Adam II of Liechtenstein
  {
    id: "wrk-hans-adam-state-third-millennium",
    personId: "hans-adam-ii-liechtenstein",
    title: "The State in the Third Millennium",
    workType: "Political Philosophy Monograph",
    publicationYear: "2009",
    publisher: "van Eck Publishers",
    notes: "Seminal political science treatise arguing for direct democracy, self-determination, and the state as a service provider rather than an oppressive master.",
    sourceId: "src-liechtenstein-landtag-20040815",
  }
];

export const royalStaysSeed: RoyalStaySeed[] = [
  // Charles III
  {
    id: "sty-charles-buckingham",
    personId: "charles-iii",
    venueName: "Buckingham Palace",
    stayName: "London Sovereign Headquarters",
    stayType: "official_residence",
    city: "London",
    country: "United Kingdom",
    latitude: 51.5014,
    longitude: -0.1419,
    startDate: "2022-09-08",
    isBaseOfOperations: true,
    isPrimaryResidence: false,
    securityLevel: "state-maximum",
    notes: "Official administrative headquarters of the British Sovereign.",
    sourceId: "src-uk-court-circular-20230506",
  },
  {
    id: "sty-charles-clarence-house",
    personId: "charles-iii",
    venueName: "Clarence House",
    stayName: "Official London Residence",
    stayType: "official_residence",
    city: "London",
    country: "United Kingdom",
    latitude: 51.5036,
    longitude: -0.1386,
    startDate: "2003-08-01",
    isBaseOfOperations: true,
    isPrimaryResidence: true,
    securityLevel: "state-maximum",
    notes: "Principal London residence of King Charles III and Queen Camilla.",
    sourceId: "src-uk-court-circular-20230506",
  },
  {
    id: "sty-charles-windsor",
    personId: "charles-iii",
    venueName: "Windsor Castle",
    stayName: "Official Royal Fortress & Residence",
    stayType: "official_residence",
    city: "Windsor",
    country: "United Kingdom",
    latitude: 51.4839,
    longitude: -0.6044,
    startDate: "1948-11-14",
    isBaseOfOperations: false,
    isPrimaryResidence: false,
    securityLevel: "state-maximum",
    notes: "Principal weekend and state residence of the Sovereign.",
    sourceId: "src-uk-court-circular-20230506",
  },

  // Prince William & Catherine
  {
    id: "sty-william-adelaide-cottage",
    personId: "prince-william",
    venueName: "Adelaide Cottage, Windsor Home Park",
    stayName: "Family Residence",
    stayType: "official_residence",
    city: "Windsor",
    country: "United Kingdom",
    latitude: 51.4822,
    longitude: -0.5894,
    startDate: "2022-09-01",
    isBaseOfOperations: true,
    isPrimaryResidence: true,
    securityLevel: "state-maximum",
    notes: "Primary family residence of the Prince and Princess of Wales and their children.",
    sourceId: "src-uk-court-circular-20230506",
  },

  // King Felipe VI & Queen Letizia
  {
    id: "sty-felipe-zarzuela",
    personId: "felipe-vi-spain",
    venueName: "Palacio de la Zarzuela (Pabellón del Príncipe)",
    stayName: "Residencia Oficial de los Reyes de España",
    stayType: "official_residence",
    city: "Madrid",
    country: "Spain",
    latitude: 40.4725,
    longitude: -3.8017,
    startDate: "2002-06-01",
    isBaseOfOperations: true,
    isPrimaryResidence: true,
    securityLevel: "state-maximum",
    notes: "Official residence and workplace of King Felipe VI and Queen Letizia.",
    sourceId: "src-spain-boe-20140619",
  },
  {
    id: "sty-felipe-palacio-real",
    personId: "felipe-vi-spain",
    venueName: "Palacio Real de Madrid (Palacio de Oriente)",
    stayName: "Sede de Actos de Estado",
    stayType: "official_residence",
    city: "Madrid",
    country: "Spain",
    latitude: 40.4180,
    longitude: -3.7143,
    startDate: "2014-06-19",
    isBaseOfOperations: false,
    isPrimaryResidence: false,
    securityLevel: "state-maximum",
    notes: "Official ceremonial seat of the Crown of Spain for state banquets and ambassadorial credentials.",
    sourceId: "src-spain-boe-20140619",
  },

  // King Philippe & Queen Mathilde
  {
    id: "sty-philippe-laeken",
    personId: "philippe-belgium",
    venueName: "Château de Laeken / Kasteel van Laken",
    stayName: "Official Royal Residence",
    stayType: "official_residence",
    city: "Brussels",
    country: "Belgium",
    latitude: 50.8864,
    longitude: 4.3592,
    startDate: "1999-12-04",
    isBaseOfOperations: true,
    isPrimaryResidence: true,
    securityLevel: "state-maximum",
    notes: "Primary royal residence of the King and Queen of the Belgians.",
    sourceId: "src-belgium-moniteur-20130721",
  },

  // King Willem-Alexander & Queen Máxima
  {
    id: "sty-willem-huis-ten-bosch",
    personId: "willem-alexander-netherlands",
    venueName: "Paleis Huis ten Bosch",
    stayName: "Woonpaleis van de Koning",
    stayType: "official_residence",
    city: "The Hague",
    country: "Netherlands",
    latitude: 52.0933,
    longitude: 4.3436,
    startDate: "2019-01-13",
    isBaseOfOperations: true,
    isPrimaryResidence: true,
    securityLevel: "state-maximum",
    notes: "Official living palace of King Willem-Alexander and Queen Máxima.",
    sourceId: "src-netherlands-staatscourant-20130430",
  },

  // King Carl XVI Gustaf & Queen Silvia
  {
    id: "sty-carl-drottningholm",
    personId: "carl-xvi-gustaf-sweden",
    venueName: "Drottningholm Palace (Drottningholms Slott)",
    stayName: "Kungaparets Bostad",
    stayType: "official_residence",
    city: "Ekerö / Stockholm",
    country: "Sweden",
    latitude: 59.3217,
    longitude: 17.8869,
    startDate: "1981-01-01",
    isBaseOfOperations: true,
    isPrimaryResidence: true,
    securityLevel: "state-maximum",
    notes: "Private residence of the King and Queen of Sweden (UNESCO World Heritage Site).",
    sourceId: "src-sweden-kungahuset-20230915",
  },

  // Prince Albert II & Princess Charlene
  {
    id: "sty-albert-palais-princier",
    personId: "albert-ii-monaco",
    venueName: "Palais Princier de Monaco",
    stayName: "Palais Princier (Rocher de Monaco)",
    stayType: "official_residence",
    city: "Monaco-Ville",
    country: "Monaco",
    latitude: 43.7311,
    longitude: 7.4206,
    startDate: "2005-04-06",
    isBaseOfOperations: true,
    isPrimaryResidence: true,
    securityLevel: "state-maximum",
    notes: "Historic fortress and official sovereign seat of the Princes of Monaco.",
    sourceId: "src-monaco-journal-20050712",
  },

  // Prince Hans-Adam II
  {
    id: "sty-hans-adam-vaduz-castle",
    personId: "hans-adam-ii-liechtenstein",
    venueName: "Schloss Vaduz (Vaduz Castle)",
    stayName: "Fürstlicher Wohnsitz",
    stayType: "official_residence",
    city: "Vaduz",
    country: "Liechtenstein",
    latitude: 47.1394,
    longitude: 9.5244,
    startDate: "1989-11-13",
    isBaseOfOperations: true,
    isPrimaryResidence: true,
    securityLevel: "state-maximum",
    notes: "Official residence of the Princely Family of Liechtenstein.",
    sourceId: "src-liechtenstein-landtag-20040815",
  }
];
