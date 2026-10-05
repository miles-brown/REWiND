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

  // King Juan Carlos I of Spain
  {
    id: "edu-juan-carlos-zaragoza",
    personId: "juan-carlos-i-spain",
    institution: "General Military Academy Zaragoza & Complutense University of Madrid",
    degree: "Joint Military & Constitutional Law Program",
    fieldOfStudy: "Military Strategy, Constitutional Law and Economics",
    startYear: "1955",
    endYear: "1961",
    notes: "Trained across Army, Navy, and Air Force academies before university law studies.",
    sourceId: "src-spain-boe-19751122",
  },

  // Queen Sofía of Spain
  {
    id: "edu-queen-sofia-athens",
    personId: "queen-sofia-spain",
    institution: "University of Athens & Fitzwilliam College, Cambridge",
    degree: "Diploma in Childcare and Archaeology",
    fieldOfStudy: "Archaeology and Pedagogy",
    startYear: "1956",
    endYear: "1960",
    notes: "Conducted archaeological research in Greece and published research on Greek antiquity.",
    sourceId: "src-spain-reina-sofia-1977",
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

  // King Albert II of Belgium
  {
    id: "edu-albert-ii-belgian-navy",
    personId: "albert-ii-belgium",
    institution: "Belgian Naval Training Command",
    degree: "Naval Officer Commission",
    fieldOfStudy: "Naval Operations and Navigation",
    startYear: "1952",
    endYear: "1955",
    notes: "Served as active naval officer reaching rank of Lieutenant General and Vice Admiral.",
    sourceId: "src-belgium-moniteur-19930809",
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

  // Princess Beatrix of the Netherlands
  {
    id: "edu-beatrix-leiden",
    personId: "princess-beatrix-netherlands",
    institution: "Leiden University",
    degree: "Doctor of Law (Meester in de rechten)",
    fieldOfStudy: "Constitutional Law, Sociology, and Economics",
    startYear: "1956",
    endYear: "1961",
    notes: "Graduated with full law degree prior to state responsibilities.",
    sourceId: "src-netherlands-staatscourant-19800430",
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
  },

  // Princess Caroline of Monaco
  {
    id: "edu-caroline-sorbonne",
    personId: "caroline-princess-of-monaco",
    institution: "Sorbonne University & Sciences Po Paris",
    degree: "Licence de Philosophie (BA in Philosophy)",
    fieldOfStudy: "Philosophy, Psychology, and Biology",
    startYear: "1974",
    endYear: "1977",
    notes: "Graduated with degree in philosophy in Paris.",
    sourceId: "src-un-unesco-2003",
  },

  // Archduke Karl von Habsburg
  {
    id: "edu-karl-habsburg-salzburg",
    personId: "karl-von-habsburg",
    institution: "University of Salzburg",
    degree: "Law and Political Science Studies",
    fieldOfStudy: "Constitutional Law and European Integration",
    startYear: "1982",
    endYear: "1987",
    notes: "Studied law and political science in Salzburg and Michigan.",
    sourceId: "src-habsburg-council-2007",
  },

  // Archduke Eduard of Austria
  {
    id: "edu-eduard-habsburg-eichstaett",
    personId: "archduke-eduard-of-austria",
    institution: "Catholic University of Eichstätt-Ingolstadt",
    degree: "Doctor of Philosophy (PhD)",
    fieldOfStudy: "Philosophy and Ethics",
    startYear: "1988",
    endYear: "1997",
    notes: "Published doctoral dissertation on Thomistic ethics and personalism.",
    sourceId: "src-vatican-bulletin-20151207",
  },

  // Georg Friedrich, Prince of Prussia
  {
    id: "edu-georg-friedrich-freiberg",
    personId: "georg-friedrich-prince-of-prussia",
    institution: "TU Bergakademie Freiberg",
    degree: "Diplom-Kaufmann (Master of Business Administration)",
    fieldOfStudy: "Business Administration and Economics",
    startYear: "1996",
    endYear: "2000",
    notes: "Graduated with full business administration degree in Saxony.",
    sourceId: "src-hohenzollern-haus-2011",
  },

  // Margareta, Custodian of the Crown of Romania
  {
    id: "edu-margareta-edinburgh",
    personId: "margareta-custodian-of-the-crown-romania",
    institution: "University of Edinburgh",
    degree: "Master of Arts (MA Hons)",
    fieldOfStudy: "Sociology, Political Science, and International Law",
    startYear: "1969",
    endYear: "1974",
    notes: "Specialized in public health, rural development, and UN systems.",
    sourceId: "src-romania-official-gazette-20171205",
  },

  // Duarte Pio, Duke of Braganza
  {
    id: "edu-duarte-pio-agronomia",
    personId: "duarte-pio-duke-of-braganza",
    institution: "Instituto Superior de Agronomia, Lisbon & University of Geneva",
    degree: "Licenciatura in Agronomy and Development Studies",
    fieldOfStudy: "Agricultural Engineering and Rural Economics",
    startYear: "1968",
    endYear: "1973",
    notes: "Agricultural researcher focusing on Portuguese rural development.",
    sourceId: "src-portugal-braganca-1995",
  },

  // Crown Prince Alexander of Yugoslavia
  {
    id: "edu-alexander-sandhurst",
    personId: "alexander-crown-prince-yugoslavia",
    institution: "Royal Military Academy Sandhurst",
    degree: "Commissioned British Army Officer",
    fieldOfStudy: "Military Tactics and Strategic Command",
    startYear: "1964",
    endYear: "1966",
    notes: "Commissioned into 16th/5th The Queen's Royal Lancers.",
    sourceId: "src-serbia-dvor-alexander-2001",
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

  // Juan Carlos I of Spain
  {
    id: "car-juan-carlos-king",
    personId: "juan-carlos-i-spain",
    organisationName: "Corona de España / Jefatura del Estado",
    roleTitle: "Rey de España (Head of State)",
    startDate: "1975-11-22",
    endDate: "2014-06-19",
    isCurrent: false,
    notes: "Reigned as constitutional King of Spain for 39 years before abdication.",
    sourceId: "src-spain-boe-19751122",
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

  // King Albert II of Belgium
  {
    id: "car-albert-ii-king",
    personId: "albert-ii-belgium",
    organisationName: "Royaume de Belgique / Koninkrijk België",
    roleTitle: "Roi des Belges / Koning der Belgen",
    startDate: "1993-08-09",
    endDate: "2013-07-21",
    isCurrent: false,
    notes: "Reigned as sixth King of the Belgians for two decades before abdication.",
    sourceId: "src-belgium-moniteur-19930809",
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

  // Princess Beatrix of the Netherlands
  {
    id: "car-beatrix-queen",
    personId: "princess-beatrix-netherlands",
    organisationName: "Koninkrijk der Nederlanden",
    roleTitle: "Koningin der Nederlanden (Queen of the Netherlands)",
    startDate: "1980-04-30",
    endDate: "2013-04-30",
    isCurrent: false,
    notes: "Reigned for 33 years as constitutional sovereign of the Netherlands.",
    sourceId: "src-netherlands-staatscourant-19800430",
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

  // Prince Constantijn of the Netherlands
  {
    id: "car-constantijn-techleap",
    personId: "prince-constantijn-netherlands",
    organisationName: "Techleap.nl / Ministry of Economic Affairs",
    roleTitle: "Special Envoy for the Dutch Startup Ecosystem",
    startDate: "2016-07-01",
    isCurrent: true,
    notes: "Special envoy leading international tech diplomacy and venture growth in the Netherlands.",
    sourceId: "src-netherlands-techleap-2016",
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

  // Margareta, Custodian of the Crown of Romania
  {
    id: "car-margareta-crown-custodian",
    personId: "margareta-custodian-of-the-crown-romania",
    organisationName: "Casa Regală a României",
    roleTitle: "Custodele Coroanei Române (Head of the Royal House)",
    startDate: "2017-12-05",
    isCurrent: true,
    notes: "Head of the Royal House of Romania following the death of King Michael I.",
    sourceId: "src-romania-official-gazette-20171205",
  },

  // Tsar Simeon II of Bulgaria
  {
    id: "car-simeon-prime-minister",
    personId: "simeon-ii-bulgaria",
    organisationName: "Government of the Republic of Bulgaria",
    roleTitle: "Prime Minister of Bulgaria",
    startDate: "2001-07-24",
    endDate: "2005-08-17",
    isCurrent: false,
    notes: "Democratically elected 48th Prime Minister of Bulgaria leading NATO accession.",
    sourceId: "src-bulgaria-parliament-20010724",
  },

  // Eduard of Austria
  {
    id: "car-eduard-ambassador-vatican",
    personId: "archduke-eduard-of-austria",
    organisationName: "Ministry of Foreign Affairs and Trade of Hungary",
    roleTitle: "Ambassador of Hungary to the Holy See and Sovereign Military Order of Malta",
    startDate: "2015-12-07",
    isCurrent: true,
    notes: "Hungarian Ambassador to Vatican City and Sovereign Order of Malta.",
    sourceId: "src-vatican-bulletin-20151207",
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

  // Juan Carlos I of Spain
  {
    id: "awd-juan-carlos-fleece",
    personId: "juan-carlos-i-spain",
    awardName: "Caballero de la Insigne Orden del Toisón de Oro",
    awardingBody: "Don Juan de Borbón, Conde de Barcelona",
    yearReceived: "1941",
    citation: "Bestowed dynastic investiture in Rome during exile; Grand Master 1975–2014.",
    sourceId: "src-spain-boe-19751122",
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

  // Albert II of Belgium
  {
    id: "awd-albert-ii-leopold",
    personId: "albert-ii-belgium",
    awardName: "Grand Cordon de l'Ordre de Léopold",
    awardingBody: "Royaume de Belgique",
    yearReceived: "1953",
    citation: "Grand Master of the Order of Leopold (1993–2013).",
    sourceId: "src-belgium-moniteur-19930809",
  },

  // Princess Beatrix of the Netherlands
  {
    id: "awd-beatrix-gold-lion",
    personId: "princess-beatrix-netherlands",
    awardName: "Knight of the Order of the Gold Lion of the House of Nassau",
    awardingBody: "Kingdom of the Netherlands & Grand Duchy of Luxembourg",
    yearReceived: "1956",
    citation: "Joint highest dynastic house order of the House of Orange-Nassau and Nassau-Weilburg.",
    sourceId: "src-netherlands-staatscourant-19800430",
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
  },

  // Karl von Habsburg
  {
    id: "awd-karl-habsburg-fleece",
    personId: "karl-von-habsburg",
    awardName: "Sovereign Grand Master of the Order of the Golden Fleece (Austrian Branch)",
    awardingBody: "Imperial House of Habsburg-Lorraine",
    yearReceived: "2007",
    citation: "Grand Master of the Austrian Order of the Golden Fleece succeeding Otto von Habsburg.",
    sourceId: "src-habsburg-council-2007",
  },

  // Margareta of Romania
  {
    id: "awd-margareta-crown-romania",
    personId: "margareta-custodian-of-the-crown-romania",
    awardName: "Grand Master of the Order of the Crown of Romania",
    awardingBody: "Royal House of Romania",
    yearReceived: "2017",
    citation: "Sovereign Grand Master of the dynastic Order of the Crown.",
    sourceId: "src-romania-official-gazette-20171205",
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
  },

  // Archduke Eduard of Austria
  {
    id: "wrk-eduard-habsburg-way",
    personId: "archduke-eduard-of-austria",
    title: "The Habsburg Way: 7 Rules for Turbulent Times",
    workType: "Historical & Moral Treatise",
    publicationYear: "2023",
    publisher: "Sophia Institute Press",
    notes: "Exploration of Habsburg statecraft, subsidiarity, and family governance principles for contemporary society.",
    sourceId: "src-vatican-bulletin-20151207",
  },

  // Franz, Duke of Bavaria
  {
    id: "wrk-franz-bavaria-memoirs",
    personId: "franz-duke-of-bavaria",
    title: "Zuschauer in der ersten Reihe: Erinnerungen",
    workType: "Autobiography / Historical Memoir",
    publicationYear: "2023",
    publisher: "C.H. Beck",
    notes: "Firsthand accounts of 20th-century German history, childhood imprisonment in Nazi concentration camps, and contemporary arts stewardship.",
    sourceId: "src-bavaria-wittelsbach-2023",
  },

  // Margareta, Custodian of the Crown of Romania
  {
    id: "wrk-margareta-diplomacy-book",
    personId: "margareta-custodian-of-the-crown-romania",
    title: "The Royal Book of Public Diplomacy",
    workType: "Public Affairs Monograph",
    publicationYear: "2010",
    publisher: "Curtea Veche Publishing",
    notes: "Analysis of the institutional role of historic European royal houses in modern multilateral diplomacy.",
    sourceId: "src-romania-official-gazette-20171205",
  },

  // Princess Madeleine of Sweden
  {
    id: "wrk-madeleine-stella",
    personId: "princess-madeleine-sweden",
    title: "Stella och hemligheten",
    workType: "Children's Literature / Rights Education",
    publicationYear: "2019",
    publisher: "Bonnier Carlsen",
    notes: "Children's book promoting bodily integrity, self-esteem, and child safety created in partnership with World Childhood Foundation.",
    sourceId: "src-sweden-bonnier-2019",
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

  // King Juan Carlos I & Queen Sofía
  {
    id: "sty-juan-carlos-zarzuela",
    personId: "juan-carlos-i-spain",
    venueName: "Palacio de la Zarzuela",
    stayName: "Residencia Real Histórica",
    stayType: "official_residence",
    city: "Madrid",
    country: "Spain",
    latitude: 40.4725,
    longitude: -3.8017,
    startDate: "1962-05-14",
    isBaseOfOperations: true,
    isPrimaryResidence: true,
    securityLevel: "state-maximum",
    notes: "Main historic residence of King Juan Carlos I and Queen Sofía since their marriage in 1962.",
    sourceId: "src-spain-boe-19751122",
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

  // King Albert II & Queen Paola
  {
    id: "sty-albert-ii-belvedere",
    personId: "albert-ii-belgium",
    venueName: "Château du Belvédère",
    stayName: "Belvédère Royal Residence",
    stayType: "official_residence",
    city: "Brussels / Laeken",
    country: "Belgium",
    latitude: 50.8892,
    longitude: 4.3547,
    startDate: "1959-07-02",
    isBaseOfOperations: true,
    isPrimaryResidence: true,
    securityLevel: "state-maximum",
    notes: "Private residence of King Albert II and Queen Paola in Laeken.",
    sourceId: "src-belgium-moniteur-19930809",
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

  // Princess Beatrix
  {
    id: "sty-beatrix-drakensteyn",
    personId: "princess-beatrix-netherlands",
    venueName: "Kasteel Drakensteyn",
    stayName: "Drakensteyn Private Residence",
    stayType: "official_residence",
    city: "Lage Vuursche / Baarn",
    country: "Netherlands",
    latitude: 52.1794,
    longitude: 5.2239,
    startDate: "2014-02-04",
    isBaseOfOperations: true,
    isPrimaryResidence: true,
    securityLevel: "state-maximum",
    notes: "Private residential estate of Princess Beatrix following her abdication.",
    sourceId: "src-netherlands-staatscourant-20130430",
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
  },

  // Margareta & Radu of Romania
  {
    id: "sty-margareta-elisabeta",
    personId: "margareta-custodian-of-the-crown-romania",
    venueName: "Elisabeta Palace (Palatul Elisabeta)",
    stayName: "Sediul Oficial al Familiei Regale a României",
    stayType: "official_residence",
    city: "Bucharest",
    country: "Romania",
    latitude: 44.4721,
    longitude: 26.0792,
    startDate: "2001-05-18",
    isBaseOfOperations: true,
    isPrimaryResidence: true,
    securityLevel: "state-maximum",
    notes: "Official working residence of the Custodian of the Crown in Bucharest.",
    sourceId: "src-romania-official-gazette-20171205",
  },

  // Crown Prince Alexander & Katherine of Yugoslavia
  {
    id: "sty-alexander-royal-compound",
    personId: "alexander-crown-prince-yugoslavia",
    venueName: "The Royal Palace (Kraljevski Dvor)",
    stayName: "Kraljevski Dvor Dedinje",
    stayType: "official_residence",
    city: "Belgrade",
    country: "Serbia",
    latitude: 44.7633,
    longitude: 20.4503,
    startDate: "2001-07-17",
    isBaseOfOperations: true,
    isPrimaryResidence: true,
    securityLevel: "state-maximum",
    notes: "Historic Royal Compound in Dedinje, Belgrade restored to the Royal Family in 2001.",
    sourceId: "src-serbia-dvor-alexander-2001",
  }
];
