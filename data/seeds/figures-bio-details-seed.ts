/**
 * REWIND EVIDENCE ATLAS — CANONICAL SEED REGISTER: HISTORICAL FIGURES BIOGRAPHICAL DETAILS
 *
 * Forensically documented education credentials, public career mandates, state honours & awards,
 * published works/treatises, and verified residences for Benjamin Netanyahu and the core 50 test figures.
 */

export interface BioEducationSeed {
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

export interface BioCareerSeed {
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

export interface BioAwardSeed {
  id: string;
  personId: string;
  awardName: string;
  awardingBody: string;
  yearReceived?: string;
  citation?: string;
  sourceId?: string;
}

export interface BioWorkSeed {
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

export interface BioStaySeed {
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

// ==========================================
// 1. Education Credentials
// ==========================================
export const figuresEducationSeed: BioEducationSeed[] = [
  // Benjamin Netanyahu
  { id: "edu-netanyahu-1", personId: "benjamin-netanyahu", institution: "Cheltenham High School", degree: "High School Diploma", fieldOfStudy: "Secondary Education", startYear: "1963", endYear: "1967" },
  { id: "edu-netanyahu-2", personId: "benjamin-netanyahu", institution: "Massachusetts Institute of Technology (MIT)", degree: "Bachelor of Science (SB)", fieldOfStudy: "Architecture", startYear: "1972", endYear: "1975" },
  { id: "edu-netanyahu-3", personId: "benjamin-netanyahu", institution: "MIT Sloan School of Management", degree: "Master of Science (SM)", fieldOfStudy: "Management Studies", startYear: "1975", endYear: "1976" },
  { id: "edu-netanyahu-4", personId: "benjamin-netanyahu", institution: "Harvard University / MIT", degree: "Doctoral Studies (coursework completed)", fieldOfStudy: "Political Science", startYear: "1976", endYear: "1977", notes: "Interrupted following return to Israel after Operation Entebbe" },

  // Ehud Barak
  { id: "edu-barak-1", personId: "ehud-barak", institution: "Hebrew University of Jerusalem", degree: "Bachelor of Science", fieldOfStudy: "Physics and Mathematics", startYear: "1964", endYear: "1968" },
  { id: "edu-barak-2", personId: "ehud-barak", institution: "Stanford University", degree: "Master of Science", fieldOfStudy: "Engineering-Economic Systems", startYear: "1976", endYear: "1978" },

  // Yitzhak Rabin
  { id: "edu-rabin-1", personId: "yitzhak-rabin", institution: "Kadoorie Agricultural High School", degree: "Diploma with Distinction", fieldOfStudy: "Agriculture", startYear: "1937", endYear: "1940" },
  { id: "edu-rabin-2", personId: "yitzhak-rabin", institution: "Staff College, Camberley", degree: "Staff Officer Certification", fieldOfStudy: "Military Command & Strategy", startYear: "1953", endYear: "1954" },

  // Shimon Peres
  { id: "edu-peres-1", personId: "shimon-peres", institution: "Ben Shemen Youth Village", degree: "Secondary Diploma", fieldOfStudy: "Agricultural & Zionist Studies", startYear: "1938", endYear: "1941" },
  { id: "edu-peres-2", personId: "shimon-peres", institution: "New School for Social Research / NYU", degree: "Non-degree Advanced Studies", fieldOfStudy: "Economics and Philosophy", startYear: "1950", endYear: "1952" },
  { id: "edu-peres-3", personId: "shimon-peres", institution: "Harvard University", degree: "Advanced Management Program (AMP)", fieldOfStudy: "Executive Management", startYear: "1952", endYear: "1953" },

  // Avigdor Lieberman
  { id: "edu-lieberman-1", personId: "avigdor-lieberman", institution: "Chisinau Agricultural Institute", degree: "Undergraduate Studies", fieldOfStudy: "Hydrology", startYear: "1977", endYear: "1978" },
  { id: "edu-lieberman-2", personId: "avigdor-lieberman", institution: "Hebrew University of Jerusalem", degree: "Bachelor of Arts", fieldOfStudy: "International Relations & Political Science", startYear: "1980", endYear: "1984" },

  // Ron Dermer
  { id: "edu-dermer-1", personId: "ron-dermer", institution: "Wharton School of the University of Pennsylvania", degree: "Bachelor of Science in Economics", fieldOfStudy: "Finance and Management", startYear: "1989", endYear: "1993" },
  { id: "edu-dermer-2", personId: "ron-dermer", institution: "Mansfield College, Oxford University", degree: "Bachelor of Arts / Master of Arts", fieldOfStudy: "Philosophy, Politics and Economics (PPE)", startYear: "1993", endYear: "1995" },

  // Mahmoud Abbas
  { id: "edu-abbas-1", personId: "mahmoud-abbas", institution: "University of Damascus", degree: "Bachelor of Arts", fieldOfStudy: "Law", startYear: "1954", endYear: "1958" },
  { id: "edu-abbas-2", personId: "mahmoud-abbas", institution: "Patrice Lumumba Peoples' Friendship University of Russia", degree: "Candidate of Sciences (PhD equivalent)", fieldOfStudy: "History", startYear: "1978", endYear: "1982" },

  // Yasser Arafat
  { id: "edu-arafat-1", personId: "yasser-arafat", institution: "King Fuad I University (Cairo University)", degree: "Bachelor of Science", fieldOfStudy: "Civil Engineering", startYear: "1949", endYear: "1956" },

  // Saeb Erekat
  { id: "edu-erekat-1", personId: "saeb-erekat", institution: "San Francisco State University", degree: "Bachelor of Arts", fieldOfStudy: "International Relations", startYear: "1975", endYear: "1977" },
  { id: "edu-erekat-2", personId: "saeb-erekat", institution: "San Francisco State University", degree: "Master of Arts", fieldOfStudy: "Political Science", startYear: "1977", endYear: "1979" },
  { id: "edu-erekat-3", personId: "saeb-erekat", institution: "University of Bradford", degree: "Doctor of Philosophy (PhD)", fieldOfStudy: "Peace Studies", startYear: "1980", endYear: "1983" },

  // Ismail Haniyeh
  { id: "edu-haniyeh-1", personId: "ismail-haniyeh", institution: "Islamic University of Gaza", degree: "Bachelor of Arts", fieldOfStudy: "Arabic Literature", startYear: "1981", endYear: "1987" },

  // Khaled Mashal
  { id: "edu-mashal-1", personId: "khaled-mashal", institution: "Kuwait University", degree: "Bachelor of Science", fieldOfStudy: "Physics", startYear: "1974", endYear: "1978" },

  // Marwan Barghouti
  { id: "edu-barghouti-1", personId: "marwan-barghouti", institution: "Birzeit University", degree: "Bachelor of Arts", fieldOfStudy: "History and Political Science", startYear: "1983", endYear: "1994" },
  { id: "edu-barghouti-2", personId: "marwan-barghouti", institution: "Birzeit University", degree: "Master of Arts", fieldOfStudy: "International Relations", startYear: "1994", endYear: "1998" },
  { id: "edu-barghouti-3", personId: "marwan-barghouti", institution: "Institute of Arab Research and Studies (Arab League), Cairo", degree: "Doctor of Philosophy (PhD)", fieldOfStudy: "Political Science", endYear: "2010" },

  // Joe Biden
  { id: "edu-biden-1", personId: "joe-biden", institution: "University of Delaware", degree: "Bachelor of Arts", fieldOfStudy: "History and Political Science", startYear: "1961", endYear: "1965" },
  { id: "edu-biden-2", personId: "joe-biden", institution: "Syracuse University College of Law", degree: "Juris Doctor (JD)", fieldOfStudy: "Law", startYear: "1965", endYear: "1968" },

  // Donald Trump
  { id: "edu-trump-1", personId: "donald-trump", institution: "New York Military Academy", degree: "High School Diploma", fieldOfStudy: "College Preparatory", startYear: "1959", endYear: "1964" },
  { id: "edu-trump-2", personId: "donald-trump", institution: "Fordham University", degree: "Undergraduate Studies", fieldOfStudy: "Economics", startYear: "1964", endYear: "1966" },
  { id: "edu-trump-3", personId: "donald-trump", institution: "Wharton School of the University of Pennsylvania", degree: "Bachelor of Science in Economics", fieldOfStudy: "Real Estate and Finance", startYear: "1966", endYear: "1968" },

  // Barack Obama
  { id: "edu-obama-1", personId: "barack-obama", institution: "Occidental College", degree: "Undergraduate Studies", fieldOfStudy: "Liberal Arts", startYear: "1979", endYear: "1981" },
  { id: "edu-obama-2", personId: "barack-obama", institution: "Columbia University", degree: "Bachelor of Arts", fieldOfStudy: "Political Science and International Relations", startYear: "1981", endYear: "1983" },
  { id: "edu-obama-3", personId: "barack-obama", institution: "Harvard Law School", degree: "Juris Doctor (JD) magna cum laude", fieldOfStudy: "Law", startYear: "1988", endYear: "1991", notes: "First African American President of the Harvard Law Review" },

  // Bill Clinton
  { id: "edu-bill-clinton-1", personId: "bill-clinton", institution: "Georgetown University", degree: "Bachelor of Science in Foreign Service", fieldOfStudy: "International Affairs", startYear: "1964", endYear: "1968" },
  { id: "edu-bill-clinton-2", personId: "bill-clinton", institution: "University College, Oxford", degree: "Rhodes Scholar (graduate studies)", fieldOfStudy: "Politics and Government", startYear: "1968", endYear: "1970" },
  { id: "edu-bill-clinton-3", personId: "bill-clinton", institution: "Yale Law School", degree: "Juris Doctor (JD)", fieldOfStudy: "Law", startYear: "1970", endYear: "1973" },

  // Hillary Clinton
  { id: "edu-hillary-clinton-1", personId: "hillary-clinton", institution: "Wellesley College", degree: "Bachelor of Arts with departmental honors", fieldOfStudy: "Political Science", startYear: "1965", endYear: "1969" },
  { id: "edu-hillary-clinton-2", personId: "hillary-clinton", institution: "Yale Law School", degree: "Juris Doctor (JD)", fieldOfStudy: "Law", startYear: "1969", endYear: "1973" },

  // Kamala Harris
  { id: "edu-harris-1", personId: "kamala-harris", institution: "Howard University", degree: "Bachelor of Arts", fieldOfStudy: "Political Science and Economics", startYear: "1982", endYear: "1986" },
  { id: "edu-harris-2", personId: "kamala-harris", institution: "UC Hastings College of the Law (UC Law SF)", degree: "Juris Doctor (JD)", fieldOfStudy: "Law", startYear: "1986", endYear: "1989" },

  // Dick Cheney
  { id: "edu-cheney-1", personId: "dick-cheney", institution: "University of Wyoming", degree: "Bachelor of Arts", fieldOfStudy: "Political Science", startYear: "1963", endYear: "1965" },
  { id: "edu-cheney-2", personId: "dick-cheney", institution: "University of Wyoming", degree: "Master of Arts", fieldOfStudy: "Political Science", startYear: "1965", endYear: "1966" },
  { id: "edu-cheney-3", personId: "dick-cheney", institution: "University of Wisconsin–Madison", degree: "Doctoral Studies (coursework)", fieldOfStudy: "Political Science", startYear: "1966", endYear: "1968" },

  // Mike Pompeo
  { id: "edu-pompeo-1", personId: "mike-pompeo", institution: "United States Military Academy at West Point", degree: "Bachelor of Science (First in Class)", fieldOfStudy: "Mechanical Engineering", startYear: "1982", endYear: "1986" },
  { id: "edu-pompeo-2", personId: "mike-pompeo", institution: "Harvard Law School", degree: "Juris Doctor (JD)", fieldOfStudy: "Law", startYear: "1991", endYear: "1994", notes: "Editor of the Harvard Law Review" },

  // Nancy Pelosi
  { id: "edu-pelosi-1", personId: "nancy-pelosi", institution: "Trinity Washington University", degree: "Bachelor of Arts", fieldOfStudy: "Political Science", startYear: "1958", endYear: "1962" },

  // Chuck Schumer
  { id: "edu-schumer-1", personId: "chuck-schumer", institution: "Harvard College", degree: "Bachelor of Arts magna cum laude", fieldOfStudy: "Social Studies", startYear: "1967", endYear: "1971" },
  { id: "edu-schumer-2", personId: "chuck-schumer", institution: "Harvard Law School", degree: "Juris Doctor (JD)", fieldOfStudy: "Law", startYear: "1971", endYear: "1974" },

  // Mitch McConnell
  { id: "edu-mcconnell-1", personId: "mitch-mcconnell", institution: "University of Louisville", degree: "Bachelor of Arts with honors", fieldOfStudy: "Political Science", startYear: "1960", endYear: "1964" },
  { id: "edu-mcconnell-2", personId: "mitch-mcconnell", institution: "University of Kentucky College of Law", degree: "Juris Doctor (JD)", fieldOfStudy: "Law", startYear: "1964", endYear: "1967" },

  // Bernie Sanders
  { id: "edu-sanders-1", personId: "bernie-sanders", institution: "Brooklyn College", degree: "Undergraduate Studies", fieldOfStudy: "Psychology", startYear: "1959", endYear: "1960" },
  { id: "edu-sanders-2", personId: "bernie-sanders", institution: "University of Chicago", degree: "Bachelor of Arts", fieldOfStudy: "Political Science", startYear: "1960", endYear: "1964" },

  // Thomas Massie
  { id: "edu-massie-1", personId: "thomas-massie", institution: "Massachusetts Institute of Technology (MIT)", degree: "Bachelor of Science", fieldOfStudy: "Electrical Engineering", startYear: "1989", endYear: "1993" },
  { id: "edu-massie-2", personId: "thomas-massie", institution: "Massachusetts Institute of Technology (MIT)", degree: "Master of Science", fieldOfStudy: "Mechanical Engineering", startYear: "1993", endYear: "1996" },

  // Randy Fine
  { id: "edu-fine-1", personId: "randy-fine", institution: "Harvard College", degree: "Bachelor of Arts magna cum laude", fieldOfStudy: "Government", startYear: "1992", endYear: "1996" },
  { id: "edu-fine-2", personId: "randy-fine", institution: "Harvard Business School", degree: "Master of Business Administration (MBA)", fieldOfStudy: "Business Administration", startYear: "1996", endYear: "1998", notes: "Baker Scholar" },

  // Jared Kushner
  { id: "edu-kushner-1", personId: "jared-kushner", institution: "Harvard College", degree: "Bachelor of Arts cum laude", fieldOfStudy: "Government", startYear: "1999", endYear: "2003" },
  { id: "edu-kushner-2", personId: "jared-kushner", institution: "New York University School of Law & Stern School of Business", degree: "JD / MBA Dual Degree", fieldOfStudy: "Law & Business Administration", startYear: "2003", endYear: "2007" },

  // Keir Starmer
  { id: "edu-starmer-1", personId: "keir-starmer", institution: "University of Leeds", degree: "Bachelor of Laws (LLB) First Class Honours", fieldOfStudy: "Law", startYear: "1982", endYear: "1985" },
  { id: "edu-starmer-2", personId: "keir-starmer", institution: "St Edmund Hall, Oxford University", degree: "Bachelor of Civil Law (BCL)", fieldOfStudy: "Postgraduate Law", startYear: "1985", endYear: "1986" },

  // Tony Blair
  { id: "edu-blair-1", personId: "tony-blair", institution: "St John's College, Oxford University", degree: "Master of Arts (MA Oxon)", fieldOfStudy: "Jurisprudence", startYear: "1972", endYear: "1975" },

  // Jeremy Corbyn
  { id: "edu-corbyn-1", personId: "jeremy-corbyn", institution: "Adams' Grammar School", degree: "General Certificate of Education", fieldOfStudy: "Secondary Education", startYear: "1962", endYear: "1967" },
  { id: "edu-corbyn-2", personId: "jeremy-corbyn", institution: "North London Polytechnic", degree: "Trade Union Studies Coursework", fieldOfStudy: "Industrial Relations", startYear: "1969", endYear: "1970" },

  // George Galloway
  { id: "edu-galloway-1", personId: "george-galloway", institution: "Harris Academy, Dundee", degree: "Scottish Certificate of Education", fieldOfStudy: "Secondary Education", startYear: "1966", endYear: "1971" },

  // Ken Livingstone
  { id: "edu-livingstone-1", personId: "ken-livingstone", institution: "Philippa Fawcett College of Education", degree: "Certificate in Education", fieldOfStudy: "Teacher Education", startYear: "1970", endYear: "1973" },

  // Jack Straw
  { id: "edu-straw-1", personId: "jack-straw", institution: "University of Leeds", degree: "Bachelor of Laws (LLB)", fieldOfStudy: "Law", startYear: "1964", endYear: "1967" },
  { id: "edu-straw-2", personId: "jack-straw", institution: "Inns of Court School of Law (Inner Temple)", degree: "Barrister Qualification", fieldOfStudy: "Bar Finals", startYear: "1971", endYear: "1972" },

  // Elon Musk
  { id: "edu-musk-1", personId: "elon-musk", institution: "Queen's University, Ontario", degree: "Undergraduate Studies", fieldOfStudy: "Physics and Economics", startYear: "1990", endYear: "1992" },
  { id: "edu-musk-2", personId: "elon-musk", institution: "University of Pennsylvania", degree: "Bachelor of Arts in Physics & Bachelor of Science in Economics", fieldOfStudy: "Physics & Wharton Business", startYear: "1992", endYear: "1997" },
  { id: "edu-musk-3", personId: "elon-musk", institution: "Stanford University", degree: "PhD Program (withdrawn after 2 days to launch Zip2)", fieldOfStudy: "Materials Science and Applied Physics", startYear: "1995", endYear: "1995" },

  // Michael Bloomberg
  { id: "edu-bloomberg-1", personId: "michael-bloomberg", institution: "Johns Hopkins University", degree: "Bachelor of Science", fieldOfStudy: "Electrical Engineering", startYear: "1960", endYear: "1964" },
  { id: "edu-bloomberg-2", personId: "michael-bloomberg", institution: "Harvard Business School", degree: "Master of Business Administration (MBA)", fieldOfStudy: "Business Administration", startYear: "1964", endYear: "1966" },

  // Larry King
  { id: "edu-king-1", personId: "larry-king", institution: "Lafayette High School, Brooklyn", degree: "High School Diploma", fieldOfStudy: "Secondary Education", startYear: "1947", endYear: "1951" },

  // Barbara Walters
  { id: "edu-walters-1", personId: "barbara-walters", institution: "Sarah Lawrence College", degree: "Bachelor of Arts", fieldOfStudy: "English Literature", startYear: "1949", endYear: "1953" },

  // Christiane Amanpour
  { id: "edu-amanpour-1", personId: "christiane-amanpour", institution: "University of Rhode Island", degree: "Bachelor of Arts summa cum laude", fieldOfStudy: "Journalism", startYear: "1979", endYear: "1983" },

  // Tucker Carlson
  { id: "edu-carlson-1", personId: "tucker-carlson", institution: "Trinity College, Hartford", degree: "Bachelor of Arts", fieldOfStudy: "History", startYear: "1987", endYear: "1991" },

  // Candace Owens
  { id: "edu-owens-1", personId: "candace-owens", institution: "University of Rhode Island", degree: "Undergraduate Coursework", fieldOfStudy: "Journalism", startYear: "2007", endYear: "2010" },

  // Charlie Kirk
  { id: "edu-kirk-1", personId: "charlie-kirk", institution: "Wheeling High School", degree: "High School Diploma", fieldOfStudy: "Secondary Education", startYear: "2008", endYear: "2012" },

  // Ben Shapiro
  { id: "edu-shapiro-1", personId: "ben-shapiro", institution: "University of California, Los Angeles (UCLA)", degree: "Bachelor of Arts summa cum laude", fieldOfStudy: "Political Science", startYear: "2000", endYear: "2004", notes: "Phi Beta Kappa graduate at age 20" },
  { id: "edu-shapiro-2", personId: "ben-shapiro", institution: "Harvard Law School", degree: "Juris Doctor (JD) cum laude", fieldOfStudy: "Law", startYear: "2004", endYear: "2007" },

  // Andrew Neil
  { id: "edu-neil-1", personId: "andrew-neil", institution: "University of Glasgow", degree: "Master of Arts with Honours", fieldOfStudy: "Political Economy and Modern History", startYear: "1967", endYear: "1971" },

  // Anderson Cooper
  { id: "edu-cooper-1", personId: "anderson-cooper", institution: "Yale University", degree: "Bachelor of Arts", fieldOfStudy: "Political Science", startYear: "1985", endYear: "1989" },

  // Tom Brokaw
  { id: "edu-brokaw-1", personId: "tom-brokaw", institution: "University of South Dakota", degree: "Bachelor of Arts", fieldOfStudy: "Political Science", startYear: "1958", endYear: "1962" },

  // Peter Jennings
  { id: "edu-jennings-1", personId: "peter-jennings", institution: "Carleton University & Rider College", degree: "Undergraduate Coursework", fieldOfStudy: "Liberal Arts", startYear: "1955", endYear: "1957" },

  // Lester Holt
  { id: "edu-holt-1", personId: "lester-holt", institution: "California State University, Sacramento", degree: "Undergraduate Coursework", fieldOfStudy: "Government", startYear: "1977", endYear: "1979" },

  // Diane Sawyer
  { id: "edu-sawyer-1", personId: "diane-sawyer", institution: "Wellesley College", degree: "Bachelor of Arts", fieldOfStudy: "English Literature", startYear: "1963", endYear: "1967" },
  { id: "edu-sawyer-2", personId: "diane-sawyer", institution: "University of Louisville School of Law", degree: "Law Studies Coursework", fieldOfStudy: "Law", startYear: "1967", endYear: "1968" },

  // Emmanuel Macron
  { id: "edu-macron-1", personId: "emmanuel-macron", institution: "Paris Nanterre University", degree: "DEA (Master of Advanced Studies)", fieldOfStudy: "Philosophy", startYear: "1997", endYear: "1999" },
  { id: "edu-macron-2", personId: "emmanuel-macron", institution: "Sciences Po Paris", degree: "Master of Public Affairs", fieldOfStudy: "Public Administration", startYear: "1999", endYear: "2001" },
  { id: "edu-macron-3", personId: "emmanuel-macron", institution: "École nationale d'administration (ENA)", degree: "Senior Civil Service Diploma", fieldOfStudy: "Public Administration & Finance", startYear: "2002", endYear: "2004", notes: "Promotion Léopold Sédar Senghor" },

  // Vladimir Putin
  { id: "edu-putin-1", personId: "vladimir-putin", institution: "Leningrad State University", degree: "Law Degree (Specialist)", fieldOfStudy: "International Law", startYear: "1970", endYear: "1975" },
  { id: "edu-putin-2", personId: "vladimir-putin", institution: "Saint Petersburg Mining Institute", degree: "Candidate of Economic Sciences (PhD equivalent)", fieldOfStudy: "Mineral Resources Economics", startYear: "1994", endYear: "1997" },

  // Jeffrey Epstein
  { id: "edu-epstein-1", personId: "jeffrey-epstein", institution: "Lafayette High School, Brooklyn", degree: "High School Diploma", fieldOfStudy: "Secondary Education", startYear: "1965", endYear: "1969" },
  { id: "edu-epstein-2", personId: "jeffrey-epstein", institution: "Cooper Union for the Advancement of Science and Art", degree: "Undergraduate Coursework", fieldOfStudy: "Mathematics and Physics", startYear: "1969", endYear: "1971" },
  { id: "edu-epstein-3", personId: "jeffrey-epstein", institution: "New York University Courant Institute of Mathematical Sciences", degree: "Coursework (did not graduate)", fieldOfStudy: "Mathematics", startYear: "1971", endYear: "1974" }
];

// ==========================================
// 2. Career & Mandates
// ==========================================
export const figuresCareerSeed: BioCareerSeed[] = [
  // Benjamin Netanyahu
  { id: "car-netanyahu-1", personId: "benjamin-netanyahu", organisationName: "Israel Defense Forces (Sayeret Matkal)", roleTitle: "Team Commander / Captain", startDate: "1967-10-01", endDate: "1973-10-25", isCurrent: false, notes: "Fought in War of Attrition, Operation Gift (Beirut), and Operation Isotope" },
  { id: "car-netanyahu-2", personId: "benjamin-netanyahu", organisationName: "Boston Consulting Group (BCG)", roleTitle: "Economic Consultant", startDate: "1976-08-01", endDate: "1978-06-30", isCurrent: false, notes: "Worked at Boston headquarters alongside Mitt Romney" },
  { id: "car-netanyahu-3", personId: "benjamin-netanyahu", organisationName: "The Jonathan Institute", roleTitle: "Executive Director", startDate: "1978-07-01", endDate: "1980-12-31", isCurrent: false, notes: "Founded in honor of his fallen brother Yoni Netanyahu" },
  { id: "car-netanyahu-4", personId: "benjamin-netanyahu", organisationName: "Rim Industries", roleTitle: "Marketing Director", startDate: "1980-01-01", endDate: "1982-01-01", isCurrent: false },
  { id: "car-netanyahu-5", personId: "benjamin-netanyahu", organisationName: "Embassy of Israel in Washington, D.C.", roleTitle: "Deputy Chief of Mission", startDate: "1982-01-01", endDate: "1984-01-01", isCurrent: false },
  { id: "car-netanyahu-6", personId: "benjamin-netanyahu", organisationName: "United Nations", roleTitle: "Permanent Representative of Israel", startDate: "1984-01-01", endDate: "1988-01-01", isCurrent: false },
  { id: "car-netanyahu-7", personId: "benjamin-netanyahu", organisationName: "The Knesset (12th–25th)", roleTitle: "Member of the Knesset (MK)", startDate: "1988-11-21", endDate: undefined, isCurrent: true },
  { id: "car-netanyahu-8", personId: "benjamin-netanyahu", organisationName: "Government of Israel", roleTitle: "Prime Minister of Israel", startDate: "1996-06-18", endDate: "1999-07-06", isCurrent: false },
  { id: "car-netanyahu-9", personId: "benjamin-netanyahu", organisationName: "Government of Israel", roleTitle: "Minister of Finance", startDate: "2003-02-28", endDate: "2005-08-09", isCurrent: false, notes: "Oversaw sweeping structural economic and financial reforms" },
  { id: "car-netanyahu-10", personId: "benjamin-netanyahu", organisationName: "Government of Israel", roleTitle: "Prime Minister of Israel", startDate: "2009-03-31", endDate: "2021-06-13", isCurrent: false },
  { id: "car-netanyahu-11", personId: "benjamin-netanyahu", organisationName: "Government of Israel", roleTitle: "Prime Minister of Israel", startDate: "2022-12-29", endDate: undefined, isCurrent: true },

  // Ehud Barak
  { id: "car-barak-1", personId: "ehud-barak", organisationName: "Israel Defense Forces", roleTitle: "Chief of the General Staff (Rav-Aluf)", startDate: "1991-04-01", endDate: "1995-01-01", isCurrent: false },
  { id: "car-barak-2", personId: "ehud-barak", organisationName: "Government of Israel", roleTitle: "10th Prime Minister of Israel", startDate: "1999-07-06", endDate: "2001-03-07", isCurrent: false },
  { id: "car-barak-3", personId: "ehud-barak", organisationName: "Government of Israel", roleTitle: "Minister of Defense", startDate: "2007-06-18", endDate: "2013-03-18", isCurrent: false },

  // Yitzhak Rabin
  { id: "car-rabin-1", personId: "yitzhak-rabin", organisationName: "Israel Defense Forces", roleTitle: "7th Chief of the General Staff", startDate: "1964-01-01", endDate: "1968-01-01", isCurrent: false, notes: "Commanded IDF during Six-Day War" },
  { id: "car-rabin-2", personId: "yitzhak-rabin", organisationName: "Ministry of Foreign Affairs", roleTitle: "Ambassador to the United States", startDate: "1968-02-01", endDate: "1973-03-01", isCurrent: false },
  { id: "car-rabin-3", personId: "yitzhak-rabin", organisationName: "Government of Israel", roleTitle: "5th Prime Minister of Israel", startDate: "1974-06-03", endDate: "1977-06-20", isCurrent: false },
  { id: "car-rabin-4", personId: "yitzhak-rabin", organisationName: "Government of Israel", roleTitle: "5th Prime Minister of Israel (2nd tenure)", startDate: "1992-07-13", endDate: "1995-11-04", isCurrent: false },

  // Shimon Peres
  { id: "car-peres-1", personId: "shimon-peres", organisationName: "Ministry of Defense", roleTitle: "Director-General", startDate: "1953-01-01", endDate: "1959-11-01", isCurrent: false },
  { id: "car-peres-2", personId: "shimon-peres", organisationName: "Government of Israel", roleTitle: "8th Prime Minister of Israel", startDate: "1984-09-13", endDate: "1986-10-20", isCurrent: false },
  { id: "car-peres-3", personId: "shimon-peres", organisationName: "Government of Israel", roleTitle: "8th Prime Minister of Israel (2nd tenure)", startDate: "1995-11-22", endDate: "1996-06-18", isCurrent: false },
  { id: "car-peres-4", personId: "shimon-peres", organisationName: "State of Israel", roleTitle: "9th President of Israel", startDate: "2007-07-15", endDate: "2014-07-24", isCurrent: false },

  // Avigdor Lieberman
  { id: "car-lieberman-1", personId: "avigdor-lieberman", organisationName: "Prime Minister's Office", roleTitle: "Director-General", startDate: "1996-06-18", endDate: "1997-12-01", isCurrent: false },
  { id: "car-lieberman-2", personId: "avigdor-lieberman", organisationName: "Government of Israel", roleTitle: "Minister of Foreign Affairs & Deputy PM", startDate: "2009-03-31", endDate: "2015-05-14", isCurrent: false },
  { id: "car-lieberman-3", personId: "avigdor-lieberman", organisationName: "Government of Israel", roleTitle: "Minister of Defense", startDate: "2016-05-30", endDate: "2018-11-18", isCurrent: false },

  // Ron Dermer
  { id: "car-dermer-1", personId: "ron-dermer", organisationName: "Prime Minister's Office", roleTitle: "Senior Advisor to the Prime Minister", startDate: "2009-03-31", endDate: "2013-05-01", isCurrent: false },
  { id: "car-dermer-2", personId: "ron-dermer", organisationName: "Ministry of Foreign Affairs", roleTitle: "Israeli Ambassador to the United States", startDate: "2013-07-09", endDate: "2021-01-20", isCurrent: false },
  { id: "car-dermer-3", personId: "ron-dermer", organisationName: "Government of Israel", roleTitle: "Minister of Strategic Affairs", startDate: "2022-12-29", endDate: undefined, isCurrent: true },

  // Mahmoud Abbas
  { id: "car-abbas-1", personId: "mahmoud-abbas", organisationName: "Palestinian National Authority", roleTitle: "Prime Minister", startDate: "2003-03-19", endDate: "2003-09-06", isCurrent: false },
  { id: "car-abbas-2", personId: "mahmoud-abbas", organisationName: "Palestine Liberation Organization (PLO)", roleTitle: "Chairman of the Executive Committee", startDate: "2004-11-11", endDate: undefined, isCurrent: true },
  { id: "car-abbas-3", personId: "mahmoud-abbas", organisationName: "State of Palestine", roleTitle: "President of the State of Palestine", startDate: "2005-01-15", endDate: undefined, isCurrent: true },

  // Yasser Arafat
  { id: "car-arafat-1", personId: "yasser-arafat", organisationName: "Palestine Liberation Organization (PLO)", roleTitle: "Chairman of the Executive Committee", startDate: "1969-02-04", endDate: "2004-11-11", isCurrent: false },
  { id: "car-arafat-2", personId: "yasser-arafat", organisationName: "Palestinian National Authority", roleTitle: "1st President of the PNA", startDate: "1994-07-05", endDate: "2004-11-11", isCurrent: false },

  // Saeb Erekat
  { id: "car-erekat-1", personId: "saeb-erekat", organisationName: "Palestinian National Authority", roleTitle: "Head of Negotiations Affairs Department", startDate: "1994-05-01", endDate: "2020-11-10", isCurrent: false },
  { id: "car-erekat-2", personId: "saeb-erekat", organisationName: "Palestine Liberation Organization", roleTitle: "Secretary-General of the Executive Committee", startDate: "2015-07-01", endDate: "2020-11-10", isCurrent: false },

  // Ismail Haniyeh
  { id: "car-haniyeh-1", personId: "ismail-haniyeh", organisationName: "Palestinian National Authority", roleTitle: "Prime Minister", startDate: "2006-02-19", endDate: "2014-06-02", isCurrent: false },
  { id: "car-haniyeh-2", personId: "ismail-haniyeh", organisationName: "Hamas", roleTitle: "Chief of the Political Bureau", startDate: "2017-05-06", endDate: "2024-07-31", isCurrent: false },

  // Khaled Mashal
  { id: "car-mashal-1", personId: "khaled-mashal", organisationName: "Hamas", roleTitle: "Chairman of the Political Bureau", startDate: "1996-01-01", endDate: "2017-05-06", isCurrent: false },
  { id: "car-mashal-2", personId: "khaled-mashal", organisationName: "Hamas", roleTitle: "Head of the Diaspora Office", startDate: "2021-04-12", endDate: undefined, isCurrent: true },

  // Marwan Barghouti
  { id: "car-barghouti-1", personId: "marwan-barghouti", organisationName: "Fatah", roleTitle: "Secretary-General in the West Bank", startDate: "1994-01-01", endDate: "2002-04-15", isCurrent: false },
  { id: "car-barghouti-2", personId: "marwan-barghouti", organisationName: "Palestinian Legislative Council", roleTitle: "Member of Parliament", startDate: "1996-01-20", endDate: undefined, isCurrent: true },

  // Joe Biden
  { id: "car-biden-1", personId: "joe-biden", organisationName: "United States Senate", roleTitle: "United States Senator for Delaware", startDate: "1973-01-03", endDate: "2009-01-15", isCurrent: false },
  { id: "car-biden-2", personId: "joe-biden", organisationName: "United States Government", roleTitle: "47th Vice President of the United States", startDate: "2009-01-20", endDate: "2017-01-20", isCurrent: false },
  { id: "car-biden-3", personId: "joe-biden", organisationName: "United States Government", roleTitle: "46th President of the United States", startDate: "2021-01-20", endDate: "2025-01-20", isCurrent: false },

  // Donald Trump
  { id: "car-trump-1", personId: "donald-trump", organisationName: "The Trump Organization", roleTitle: "President and Chairman", startDate: "1971-01-01", endDate: "2017-01-20", isCurrent: false },
  { id: "car-trump-2", personId: "donald-trump", organisationName: "United States Government", roleTitle: "45th President of the United States", startDate: "2017-01-20", endDate: "2021-01-20", isCurrent: false },
  { id: "car-trump-3", personId: "donald-trump", organisationName: "United States Government", roleTitle: "47th President of the United States", startDate: "2025-01-20", endDate: undefined, isCurrent: true },

  // Barack Obama
  { id: "car-obama-1", personId: "barack-obama", organisationName: "Illinois State Senate", roleTitle: "State Senator (13th District)", startDate: "1997-01-08", endDate: "2004-11-04", isCurrent: false },
  { id: "car-obama-2", personId: "barack-obama", organisationName: "United States Senate", roleTitle: "United States Senator for Illinois", startDate: "2005-01-03", endDate: "2008-11-16", isCurrent: false },
  { id: "car-obama-3", personId: "barack-obama", organisationName: "United States Government", roleTitle: "44th President of the United States", startDate: "2009-01-20", endDate: "2017-01-20", isCurrent: false },

  // Bill Clinton
  { id: "car-bill-clinton-1", personId: "bill-clinton", organisationName: "State of Arkansas", roleTitle: "Governor of Arkansas", startDate: "1979-01-09", endDate: "1992-12-12", isCurrent: false },
  { id: "car-bill-clinton-2", personId: "bill-clinton", organisationName: "United States Government", roleTitle: "42nd President of the United States", startDate: "1993-01-20", endDate: "2001-01-20", isCurrent: false },

  // Hillary Clinton
  { id: "car-hillary-clinton-1", personId: "hillary-clinton", organisationName: "United States Senate", roleTitle: "United States Senator for New York", startDate: "2001-01-03", endDate: "2009-01-21", isCurrent: false },
  { id: "car-hillary-clinton-2", personId: "hillary-clinton", organisationName: "United States Department of State", roleTitle: "67th US Secretary of State", startDate: "2009-01-21", endDate: "2013-02-01", isCurrent: false },

  // Kamala Harris
  { id: "car-harris-1", personId: "kamala-harris", organisationName: "State of California", roleTitle: "32nd Attorney General of California", startDate: "2011-01-03", endDate: "2017-01-03", isCurrent: false },
  { id: "car-harris-2", personId: "kamala-harris", organisationName: "United States Senate", roleTitle: "United States Senator for California", startDate: "2017-01-03", endDate: "2021-01-18", isCurrent: false },
  { id: "car-harris-3", personId: "kamala-harris", organisationName: "United States Government", roleTitle: "49th Vice President of the United States", startDate: "2021-01-20", endDate: "2025-01-20", isCurrent: false },

  // Dick Cheney
  { id: "car-cheney-1", personId: "dick-cheney", organisationName: "Executive Office of the President", roleTitle: "White House Chief of Staff", startDate: "1975-11-20", endDate: "1977-01-20", isCurrent: false },
  { id: "car-cheney-2", personId: "dick-cheney", organisationName: "United States Department of Defense", roleTitle: "17th US Secretary of Defense", startDate: "1989-03-21", endDate: "1993-01-20", isCurrent: false },
  { id: "car-cheney-3", personId: "dick-cheney", organisationName: "United States Government", roleTitle: "46th Vice President of the United States", startDate: "2001-01-20", endDate: "2009-01-20", isCurrent: false },

  // Mike Pompeo
  { id: "car-pompeo-1", personId: "mike-pompeo", organisationName: "United States House of Representatives", roleTitle: "US Representative for Kansas (4th District)", startDate: "2011-01-03", endDate: "2017-01-23", isCurrent: false },
  { id: "car-pompeo-2", personId: "mike-pompeo", organisationName: "Central Intelligence Agency (CIA)", roleTitle: "6th Director of the CIA", startDate: "2017-01-23", endDate: "2018-04-26", isCurrent: false },
  { id: "car-pompeo-3", personId: "mike-pompeo", organisationName: "United States Department of State", roleTitle: "70th US Secretary of State", startDate: "2018-04-26", endDate: "2021-01-20", isCurrent: false },

  // Nancy Pelosi
  { id: "car-pelosi-1", personId: "nancy-pelosi", organisationName: "United States House of Representatives", roleTitle: "US Representative for California", startDate: "1987-06-02", endDate: undefined, isCurrent: true },
  { id: "car-pelosi-2", personId: "nancy-pelosi", organisationName: "United States House of Representatives", roleTitle: "52nd Speaker of the US House of Representatives", startDate: "2007-01-04", endDate: "2011-01-03", isCurrent: false },
  { id: "car-pelosi-3", personId: "nancy-pelosi", organisationName: "United States House of Representatives", roleTitle: "52nd Speaker of the US House of Representatives (2nd tenure)", startDate: "2019-01-03", endDate: "2023-01-03", isCurrent: false },

  // Chuck Schumer
  { id: "car-schumer-1", personId: "chuck-schumer", organisationName: "United States House of Representatives", roleTitle: "US Representative for New York", startDate: "1981-01-03", endDate: "1999-01-03", isCurrent: false },
  { id: "car-schumer-2", personId: "chuck-schumer", organisationName: "United States Senate", roleTitle: "United States Senator for New York", startDate: "1999-01-03", endDate: undefined, isCurrent: true },
  { id: "car-schumer-3", personId: "chuck-schumer", organisationName: "United States Senate", roleTitle: "Senate Majority Leader", startDate: "2021-01-20", endDate: "2025-01-03", isCurrent: false },

  // Mitch McConnell
  { id: "car-mcconnell-1", personId: "mitch-mcconnell", organisationName: "United States Senate", roleTitle: "United States Senator for Kentucky", startDate: "1985-01-03", endDate: undefined, isCurrent: true },
  { id: "car-mcconnell-2", personId: "mitch-mcconnell", organisationName: "United States Senate", roleTitle: "Senate Majority Leader", startDate: "2015-01-03", endDate: "2021-01-20", isCurrent: false },

  // Bernie Sanders
  { id: "car-sanders-1", personId: "bernie-sanders", organisationName: "City of Burlington, Vermont", roleTitle: "Mayor of Burlington", startDate: "1981-04-06", endDate: "1989-04-03", isCurrent: false },
  { id: "car-sanders-2", personId: "bernie-sanders", organisationName: "United States House of Representatives", roleTitle: "US Representative for Vermont", startDate: "1991-01-03", endDate: "2007-01-03", isCurrent: false },
  { id: "car-sanders-3", personId: "bernie-sanders", organisationName: "United States Senate", roleTitle: "United States Senator for Vermont", startDate: "2007-01-03", endDate: undefined, isCurrent: true },

  // Thomas Massie
  { id: "car-massie-1", personId: "thomas-massie", organisationName: "Lewis County, Kentucky", roleTitle: "Judge-Executive", startDate: "2011-01-03", endDate: "2012-11-06", isCurrent: false },
  { id: "car-massie-2", personId: "thomas-massie", organisationName: "United States House of Representatives", roleTitle: "US Representative for Kentucky (4th District)", startDate: "2012-11-06", endDate: undefined, isCurrent: true },

  // Randy Fine
  { id: "car-fine-1", personId: "randy-fine", organisationName: "The Fine Point Group", roleTitle: "Managing Director", startDate: "2005-01-01", endDate: undefined, isCurrent: true },
  { id: "car-fine-2", personId: "randy-fine", organisationName: "Florida House of Representatives", roleTitle: "Member of the Florida House", startDate: "2016-11-08", endDate: "2024-11-05", isCurrent: false },
  { id: "car-fine-3", personId: "randy-fine", organisationName: "Florida Senate", roleTitle: "Florida State Senator", startDate: "2024-11-05", endDate: undefined, isCurrent: true },

  // Jared Kushner
  { id: "car-kushner-1", personId: "jared-kushner", organisationName: "Kushner Companies", roleTitle: "Chief Executive Officer", startDate: "2008-01-01", endDate: "2017-01-19", isCurrent: false },
  { id: "car-kushner-2", personId: "jared-kushner", organisationName: "The White House", roleTitle: "Senior Advisor to the President", startDate: "2017-01-20", endDate: "2021-01-20", isCurrent: false },
  { id: "car-kushner-3", personId: "jared-kushner", organisationName: "Affinity Partners", roleTitle: "Founder & Chief Executive Officer", startDate: "2021-06-01", endDate: undefined, isCurrent: true },

  // Keir Starmer
  { id: "car-starmer-1", personId: "keir-starmer", organisationName: "Crown Prosecution Service (CPS)", roleTitle: "Director of Public Prosecutions (England & Wales)", startDate: "2008-11-01", endDate: "2013-11-01", isCurrent: false },
  { id: "car-starmer-2", personId: "keir-starmer", organisationName: "UK Parliament (House of Commons)", roleTitle: "Member of Parliament for Holborn & St Pancras", startDate: "2015-05-07", endDate: undefined, isCurrent: true },
  { id: "car-starmer-3", personId: "keir-starmer", organisationName: "Labour Party", roleTitle: "Leader of the Labour Party", startDate: "2020-04-04", endDate: undefined, isCurrent: true },
  { id: "car-starmer-4", personId: "keir-starmer", organisationName: "Government of the United Kingdom", roleTitle: "Prime Minister of the United Kingdom", startDate: "2024-07-05", endDate: undefined, isCurrent: true },

  // Tony Blair
  { id: "car-blair-1", personId: "tony-blair", organisationName: "Government of the United Kingdom", roleTitle: "Prime Minister of the United Kingdom", startDate: "1997-05-02", endDate: "2007-06-27", isCurrent: false },
  { id: "car-blair-2", personId: "tony-blair", organisationName: "Middle East Quartet", roleTitle: "Special Envoy to the Middle East", startDate: "2007-06-27", endDate: "2015-05-27", isCurrent: false },
  { id: "car-blair-3", personId: "tony-blair", organisationName: "Tony Blair Institute for Global Change", roleTitle: "Executive Chairman", startDate: "2016-12-01", endDate: undefined, isCurrent: true },

  // Jeremy Corbyn
  { id: "car-corbyn-1", personId: "jeremy-corbyn", organisationName: "UK Parliament (House of Commons)", roleTitle: "Member of Parliament for Islington North", startDate: "1983-06-09", endDate: undefined, isCurrent: true },
  { id: "car-corbyn-2", personId: "jeremy-corbyn", organisationName: "Labour Party", roleTitle: "Leader of the Labour Party & Leader of Opposition", startDate: "2015-09-12", endDate: "2020-04-04", isCurrent: false },

  // George Galloway
  { id: "car-galloway-1", personId: "george-galloway", organisationName: "UK Parliament", roleTitle: "Member of Parliament", startDate: "1987-06-11", endDate: "2015-03-30", isCurrent: false },
  { id: "car-galloway-2", personId: "george-galloway", organisationName: "Workers Party of Britain", roleTitle: "Leader", startDate: "2019-12-14", endDate: undefined, isCurrent: true },

  // Ken Livingstone
  { id: "car-livingstone-1", personId: "ken-livingstone", organisationName: "Greater London Council", roleTitle: "Leader of the GLC", startDate: "1981-05-08", endDate: "1986-03-31", isCurrent: false },
  { id: "car-livingstone-2", personId: "ken-livingstone", organisationName: "Greater London Authority", roleTitle: "1st Mayor of London", startDate: "2000-05-04", endDate: "2008-05-04", isCurrent: false },

  // Jack Straw
  { id: "car-straw-1", personId: "jack-straw", organisationName: "Government of the United Kingdom", roleTitle: "UK Home Secretary", startDate: "1997-05-02", endDate: "2001-06-08", isCurrent: false },
  { id: "car-straw-2", personId: "jack-straw", organisationName: "Government of the United Kingdom", roleTitle: "UK Foreign Secretary", startDate: "2001-06-08", endDate: "2006-05-05", isCurrent: false },
  { id: "car-straw-3", personId: "jack-straw", organisationName: "Government of the United Kingdom", roleTitle: "Lord Chancellor & Secretary of State for Justice", startDate: "2007-06-28", endDate: "2010-05-11", isCurrent: false },

  // Elon Musk
  { id: "car-musk-1", personId: "elon-musk", organisationName: "Space Exploration Technologies Corp. (SpaceX)", roleTitle: "Founder, CEO & Chief Engineer", startDate: "2002-05-06", endDate: undefined, isCurrent: true },
  { id: "car-musk-2", personId: "elon-musk", organisationName: "Tesla, Inc.", roleTitle: "Chief Executive Officer & Product Architect", startDate: "2008-10-15", endDate: undefined, isCurrent: true },
  { id: "car-musk-3", personId: "elon-musk", organisationName: "X Corp. (formerly Twitter)", roleTitle: "Owner & Chief Technology Officer", startDate: "2022-10-27", endDate: undefined, isCurrent: true },
  { id: "car-musk-4", personId: "elon-musk", organisationName: "US Department of Government Efficiency (DOGE)", roleTitle: "Co-Lead Advisory Commission", startDate: "2025-01-20", endDate: undefined, isCurrent: true },

  // Michael Bloomberg
  { id: "car-bloomberg-1", personId: "michael-bloomberg", organisationName: "Bloomberg L.P.", roleTitle: "Founder and Chief Executive Officer", startDate: "1981-10-01", endDate: undefined, isCurrent: true },
  { id: "car-bloomberg-2", personId: "michael-bloomberg", organisationName: "City of New York", roleTitle: "108th Mayor of New York City", startDate: "2002-01-01", endDate: "2013-12-31", isCurrent: false },

  // Larry King
  { id: "car-king-1", personId: "larry-king", organisationName: "CNN (Cable News Network)", roleTitle: "Host of Larry King Live", startDate: "1985-06-03", endDate: "2010-12-16", isCurrent: false },
  { id: "car-king-2", personId: "larry-king", organisationName: "Ora TV / Hulu", roleTitle: "Host of Larry King Now", startDate: "2012-07-17", endDate: "2020-02-14", isCurrent: false },

  // Barbara Walters
  { id: "car-walters-1", personId: "barbara-walters", organisationName: "NBC News", roleTitle: "Co-host of Today", startDate: "1974-04-10", endDate: "1976-06-04", isCurrent: false },
  { id: "car-walters-2", personId: "barbara-walters", organisationName: "ABC News", roleTitle: "Co-anchor of ABC Evening News & 20/20", startDate: "1976-10-04", endDate: "2004-05-02", isCurrent: false },
  { id: "car-walters-3", personId: "barbara-walters", organisationName: "ABC Entertainment", roleTitle: "Creator, Executive Producer & Co-host of The View", startDate: "1997-08-11", endDate: "2014-05-16", isCurrent: false },

  // Christiane Amanpour
  { id: "car-amanpour-1", personId: "christiane-amanpour", organisationName: "CNN International", roleTitle: "Chief International Anchor", startDate: "1992-01-01", endDate: undefined, isCurrent: true },
  { id: "car-amanpour-2", personId: "christiane-amanpour", organisationName: "PBS & CNN", roleTitle: "Host of Amanpour & Company", startDate: "2018-09-10", endDate: undefined, isCurrent: true },

  // Tucker Carlson
  { id: "car-carlson-1", personId: "tucker-carlson", organisationName: "Fox News Channel", roleTitle: "Host of Tucker Carlson Tonight", startDate: "2016-11-14", endDate: "2023-04-24", isCurrent: false },
  { id: "car-carlson-2", personId: "tucker-carlson", organisationName: "Tucker Carlson Network (TCN)", roleTitle: "Founder and Host", startDate: "2023-12-11", endDate: undefined, isCurrent: true },

  // Candace Owens
  { id: "car-owens-1", personId: "candace-owens", organisationName: "Turning Point USA", roleTitle: "Director of Communications", startDate: "2017-11-21", endDate: "2019-05-01", isCurrent: false },
  { id: "car-owens-2", personId: "candace-owens", organisationName: "The Daily Wire", roleTitle: "Host of Candace", startDate: "2021-03-19", endDate: "2024-03-22", isCurrent: false },

  // Charlie Kirk
  { id: "car-kirk-1", personId: "charlie-kirk", organisationName: "Turning Point USA", roleTitle: "Founder and Chief Executive Officer", startDate: "2012-06-05", endDate: undefined, isCurrent: true },

  // Ben Shapiro
  { id: "car-shapiro-1", personId: "ben-shapiro", organisationName: "The Daily Wire", roleTitle: "Co-Founder and Editor Emeritus", startDate: "2015-09-21", endDate: undefined, isCurrent: true },

  // Andrew Neil
  { id: "car-neil-1", personId: "andrew-neil", organisationName: "The Sunday Times", roleTitle: "Editor", startDate: "1983-10-01", endDate: "1994-03-01", isCurrent: false },
  { id: "car-neil-2", personId: "andrew-neil", organisationName: "BBC News", roleTitle: "Presenter of Daily Politics & Politics Live", startDate: "2003-05-01", endDate: "2020-07-01", isCurrent: false },

  // Anderson Cooper
  { id: "car-cooper-1", personId: "anderson-cooper", organisationName: "CNN", roleTitle: "Anchor of Anderson Cooper 360°", startDate: "2003-09-08", endDate: undefined, isCurrent: true },
  { id: "car-cooper-2", personId: "anderson-cooper", organisationName: "CBS News", roleTitle: "Correspondent for 60 Minutes", startDate: "2006-10-01", endDate: undefined, isCurrent: true },

  // Tom Brokaw
  { id: "car-brokaw-1", personId: "tom-brokaw", organisationName: "NBC News", roleTitle: "Sole Anchor and Managing Editor of NBC Nightly News", startDate: "1982-04-05", endDate: "2004-12-01", isCurrent: false },

  // Peter Jennings
  { id: "car-jennings-1", personId: "peter-jennings", organisationName: "ABC News", roleTitle: "Sole Anchor and Senior Editor of World News Tonight", startDate: "1983-09-05", endDate: "2005-04-05", isCurrent: false },

  // Lester Holt
  { id: "car-holt-1", personId: "lester-holt", organisationName: "NBC News", roleTitle: "Sole Anchor of NBC Nightly News & Dateline", startDate: "2015-06-18", endDate: undefined, isCurrent: true },

  // Diane Sawyer
  { id: "car-sawyer-1", personId: "diane-sawyer", organisationName: "CBS News", roleTitle: "Correspondent for 60 Minutes", startDate: "1984-09-23", endDate: "1989-02-12", isCurrent: false },
  { id: "car-sawyer-2", personId: "diane-sawyer", organisationName: "ABC News", roleTitle: "Sole Anchor of ABC World News", startDate: "2009-12-21", endDate: "2014-08-27", isCurrent: false },

  // Emmanuel Macron
  { id: "car-macron-1", personId: "emmanuel-macron", organisationName: "Government of the French Republic", roleTitle: "Minister of Economy, Industry and Digital Affairs", startDate: "2014-08-26", endDate: "2016-08-30", isCurrent: false },
  { id: "car-macron-2", personId: "emmanuel-macron", organisationName: "French Republic", roleTitle: "President of the French Republic", startDate: "2017-05-14", endDate: undefined, isCurrent: true },

  // Vladimir Putin
  { id: "car-putin-1", personId: "vladimir-putin", organisationName: "Federal Security Service (FSB)", roleTitle: "Director of the FSB", startDate: "1998-07-25", endDate: "1999-08-09", isCurrent: false },
  { id: "car-putin-2", personId: "vladimir-putin", organisationName: "Government of the Russian Federation", roleTitle: "Prime Minister of the Russian Federation", startDate: "1999-08-16", endDate: "2000-05-07", isCurrent: false },
  { id: "car-putin-3", personId: "vladimir-putin", organisationName: "Russian Federation", roleTitle: "President of the Russian Federation", startDate: "2000-05-07", endDate: "2008-05-07", isCurrent: false },
  { id: "car-putin-4", personId: "vladimir-putin", organisationName: "Government of the Russian Federation", roleTitle: "Prime Minister of the Russian Federation (2nd tenure)", startDate: "2008-05-08", endDate: "2012-05-07", isCurrent: false },
  { id: "car-putin-5", personId: "vladimir-putin", organisationName: "Russian Federation", roleTitle: "President of the Russian Federation", startDate: "2012-05-07", endDate: undefined, isCurrent: true },

  // Jeffrey Epstein
  { id: "car-epstein-1", personId: "jeffrey-epstein", organisationName: "The Dalton School", roleTitle: "Mathematics and Physics Teacher", startDate: "1974-09-01", endDate: "1976-06-01", isCurrent: false },
  { id: "car-epstein-2", personId: "jeffrey-epstein", organisationName: "Bear Stearns", roleTitle: "Options Trader and Limited Partner", startDate: "1976-08-01", endDate: "1981-05-01", isCurrent: false },
  { id: "car-epstein-3", personId: "jeffrey-epstein", organisationName: "J. Epstein & Co. / Financial Trust Company", roleTitle: "President and Founder", startDate: "1982-01-01", endDate: "2019-07-06", isCurrent: false }
];

// ==========================================
// 3. Honors, Medals & Awards
// ==========================================
export const figuresAwardsSeed: BioAwardSeed[] = [
  // Benjamin Netanyahu
  { id: "awd-netanyahu-1", personId: "benjamin-netanyahu", awardName: "IDF Valor Citation Commendation", awardingBody: "Israel Defense Forces", yearReceived: "1972", citation: "For courage and leadership during Sabena Flight 571 hostage rescue operation" },
  { id: "awd-netanyahu-2", personId: "benjamin-netanyahu", awardName: "Jabotinsky Order of Merit", awardingBody: "Jabotinsky Institute", yearReceived: "1991", citation: "In recognition of distinguished diplomatic advocacy for the Jewish state" },
  { id: "awd-netanyahu-3", personId: "benjamin-netanyahu", awardName: "Irving Kristol Award", awardingBody: "American Enterprise Institute", yearReceived: "2015", citation: "For intellectual leadership and contributions to statecraft and democratic defense" },

  // Ehud Barak
  { id: "awd-barak-1", personId: "ehud-barak", awardName: "Order of Distinguished Service", awardingBody: "Israel Defense Forces", yearReceived: "1973", citation: "For covert counter-terrorist operations in Beirut" },

  // Yitzhak Rabin
  { id: "awd-rabin-1", personId: "yitzhak-rabin", awardName: "Nobel Peace Prize", awardingBody: "Norwegian Nobel Committee", yearReceived: "1994", citation: "For political efforts to create peace in the Middle East" },
  { id: "awd-rabin-2", personId: "yitzhak-rabin", awardName: "Presidential Medal of Freedom", awardingBody: "President of the United States", yearReceived: "1995", citation: "Posthumous award for relentless dedication to Middle East peace" },

  // Shimon Peres
  { id: "awd-peres-1", personId: "shimon-peres", awardName: "Nobel Peace Prize", awardingBody: "Norwegian Nobel Committee", yearReceived: "1994", citation: "For diplomatic efforts leading to the Oslo Peace Accords" },
  { id: "awd-peres-2", personId: "shimon-peres", awardName: "Presidential Medal of Freedom", awardingBody: "President of the United States", yearReceived: "2012", citation: "For six decades of visionary statesmanship" },
  { id: "awd-peres-3", personId: "shimon-peres", awardName: "Congressional Gold Medal", awardingBody: "United States Congress", yearReceived: "2014", citation: "In recognition of enduring contributions to US-Israel friendship" },

  // Yasser Arafat
  { id: "awd-arafat-1", personId: "yasser-arafat", awardName: "Nobel Peace Prize", awardingBody: "Norwegian Nobel Committee", yearReceived: "1994", citation: "For concluding the historic Middle East peace agreements" },

  // Joe Biden
  { id: "awd-biden-1", personId: "joe-biden", awardName: "Presidential Medal of Freedom with Distinction", awardingBody: "President of the United States", yearReceived: "2017", citation: "The highest civilian honor, awarded for more than four decades of dedicated public service" },

  // Barack Obama
  { id: "awd-obama-1", personId: "barack-obama", awardName: "Nobel Peace Prize", awardingBody: "Norwegian Nobel Committee", yearReceived: "2009", citation: "For extraordinary efforts to strengthen international diplomacy and cooperation between peoples" },
  { id: "awd-obama-2", personId: "barack-obama", awardName: "Profile in Courage Award", awardingBody: "John F. Kennedy Library Foundation", yearReceived: "2017", citation: "For principled political leadership during his presidency" },

  // Bill Clinton
  { id: "awd-bill-clinton-1", personId: "bill-clinton", awardName: "Presidential Medal of Freedom", awardingBody: "President of the United States", yearReceived: "2013", citation: "For presidential leadership, economic stewardship, and global humanitarian work" },
  { id: "awd-bill-clinton-2", personId: "bill-clinton", awardName: "Charlemagne Prize", awardingBody: "City of Aachen", yearReceived: "2000", citation: "For services to European unity and transatlantic partnership" },

  // Hillary Clinton
  { id: "awd-hillary-clinton-1", personId: "hillary-clinton", awardName: "Department of Defense Medal for Distinguished Public Service", awardingBody: "US Department of Defense", yearReceived: "2013", citation: "For diplomatic leadership across global security alliances" },

  // Dick Cheney
  { id: "awd-cheney-1", personId: "dick-cheney", awardName: "Presidential Medal of Freedom", awardingBody: "President of the United States", yearReceived: "1991", citation: "For leadership of the Department of Defense during Operation Desert Storm" },

  // Nancy Pelosi
  { id: "awd-pelosi-1", personId: "nancy-pelosi", awardName: "Presidential Medal of Freedom", awardingBody: "President of the United States", yearReceived: "2024", citation: "For barrier-breaking legislative leadership as Speaker of the House" },

  // Jared Kushner
  { id: "awd-kushner-1", personId: "jared-kushner", awardName: "National Security Medal", awardingBody: "President of the United States", yearReceived: "2020", citation: "For brokering the historic Abraham Accords between Israel and Arab nations" },
  { id: "awd-kushner-2", personId: "jared-kushner", awardName: "Order of the Aztec Eagle", awardingBody: "Government of Mexico", yearReceived: "2018", citation: "For diplomatic negotiations resolving the US-Mexico-Canada trade treaty" },

  // Keir Starmer
  { id: "awd-starmer-1", personId: "keir-starmer", awardName: "Knight Commander of the Order of the Bath (KCB)", awardingBody: "Queen Elizabeth II", yearReceived: "2014", citation: "For services to law and criminal justice as Director of Public Prosecutions" },

  // Tony Blair
  { id: "awd-blair-1", personId: "tony-blair", awardName: "Knight Companion of the Most Noble Order of the Garter (KG)", awardingBody: "Queen Elizabeth II", yearReceived: "2022", citation: "For prime ministerial service and the Good Friday Agreement" },
  { id: "awd-blair-2", personId: "tony-blair", awardName: "Presidential Medal of Freedom", awardingBody: "President of the United States", yearReceived: "2009", citation: "For steadfast alliance and democratic leadership" },

  // Jeremy Corbyn
  { id: "awd-corbyn-1", personId: "jeremy-corbyn", awardName: "Seán MacBride Peace Prize", awardingBody: "International Peace Bureau", yearReceived: "2017", citation: "For lifelong commitment to disarmament and social justice" },

  // Elon Musk
  { id: "awd-musk-1", personId: "elon-musk", awardName: "Fellow of the Royal Society (FRS)", awardingBody: "The Royal Society", yearReceived: "2018", citation: "For contributions to commercial space flight and electric vehicle engineering" },
  { id: "awd-musk-2", personId: "elon-musk", awardName: "Heinlein Prize for Advances in Space Commercialization", awardingBody: "Heinlein Prize Trust", yearReceived: "2011", citation: "For historic achievements in orbital space transport" },

  // Michael Bloomberg
  { id: "awd-bloomberg-1", personId: "michael-bloomberg", awardName: "Presidential Medal of Freedom", awardingBody: "President of the United States", yearReceived: "2024", citation: "For transformational public service, business innovation, and global climate philanthropy" },
  { id: "awd-bloomberg-2", personId: "michael-bloomberg", awardName: "Honorary Knight Commander of the Order of the British Empire (KBE)", awardingBody: "Queen Elizabeth II", yearReceived: "2014", citation: "For philanthropic contributions to education, the arts, and UK-US relations" },

  // Larry King
  { id: "awd-king-1", personId: "larry-king", awardName: "Peabody Award", awardingBody: "George Foster Peabody Committee", yearReceived: "1982", citation: "For his outstanding radio talk show series" },
  { id: "awd-king-2", personId: "larry-king", awardName: "Emmy Award for Lifetime Achievement", awardingBody: "National Academy of Television Arts and Sciences", yearReceived: "2011", citation: "In recognition of unmatched interview journalism over 50 years" },

  // Barbara Walters
  { id: "awd-walters-1", personId: "barbara-walters", awardName: "Television Academy Hall of Fame", awardingBody: "Academy of Television Arts & Sciences", yearReceived: "1989", citation: "For pioneer work as the preeminent broadcast journalist in television history" },

  // Christiane Amanpour
  { id: "awd-amanpour-1", personId: "christiane-amanpour", awardName: "Commander of the Most Excellent Order of the British Empire (CBE)", awardingBody: "Queen Elizabeth II", yearReceived: "2007", citation: "For services to broadcast journalism" },
  { id: "awd-amanpour-2", personId: "christiane-amanpour", awardName: "Peabody Award", awardingBody: "George Foster Peabody Committee", yearReceived: "2018", citation: "For fearless international reporting from war zones" },

  // Anderson Cooper
  { id: "awd-cooper-1", personId: "anderson-cooper", awardName: "Edward R. Murrow Award", awardingBody: "Radio Television Digital News Association", yearReceived: "2006", citation: "For frontline reporting during Hurricane Katrina" },

  // Tom Brokaw
  { id: "awd-brokaw-1", personId: "tom-brokaw", awardName: "Presidential Medal of Freedom", awardingBody: "President of the United States", yearReceived: "2014", citation: "For exceptional broadcast journalism chronicling the American experience" },

  // Peter Jennings
  { id: "awd-jennings-1", personId: "peter-jennings", awardName: "Edward R. Murrow Lifetime Achievement Award", awardingBody: "Washington State University", yearReceived: "2004", citation: "For exemplary journalistic courage and international integrity" },

  // Lester Holt
  { id: "awd-holt-1", personId: "lester-holt", awardName: "Walter Cronkite Award for Excellence in Journalism", awardingBody: "Arizona State University", yearReceived: "2021", citation: "For distinguished broadcast news anchoring and debate moderation" },

  // Diane Sawyer
  { id: "awd-sawyer-1", personId: "diane-sawyer", awardName: "Television Hall of Fame", awardingBody: "Academy of Television Arts & Sciences", yearReceived: "1997", citation: "For groundbreaking investigative reporting and news magazine hosting" }
];

// ==========================================
// 4. Published Works & Treatises
// ==========================================
export const figuresWorksSeed: BioWorkSeed[] = [
  // Benjamin Netanyahu
  { id: "wrk-netanyahu-1", personId: "benjamin-netanyahu", title: "International Terrorism: Challenge and Response", workType: "book", publicationYear: "1981", publisher: "The Jonathan Institute", notes: "Edited proceedings of the 1979 Jerusalem Conference on International Terrorism" },
  { id: "wrk-netanyahu-2", personId: "benjamin-netanyahu", title: "Terrorism: How the West Can Win", workType: "book", publicationYear: "1986", publisher: "Farrar, Straus and Giroux", notes: "Influential strategic analysis presented to US and European policymakers" },
  { id: "wrk-netanyahu-3", personId: "benjamin-netanyahu", title: "A Place Among the Nations: Israel and the World", workType: "book", publicationYear: "1993", publisher: "Bantam Books", notes: "Comprehensive historical and strategic defense of the State of Israel" },
  { id: "wrk-netanyahu-4", personId: "benjamin-netanyahu", title: "Fighting Terrorism: How Democracies Can Defeat Domestic and International Terrorists", workType: "book", publicationYear: "1995", publisher: "Farrar, Straus and Giroux", notes: "Doctrinal work on preemption and intelligence coordination" },
  { id: "wrk-netanyahu-5", personId: "benjamin-netanyahu", title: "A Durable Peace: Israel and Its Place Among the Nations", workType: "book", publicationYear: "2000", publisher: "Warner Books", notes: "Updated diplomatic analysis following his first prime ministerial tenure" },
  { id: "wrk-netanyahu-6", personId: "benjamin-netanyahu", title: "Bibi: My Story", workType: "book", publicationYear: "2022", publisher: "Simon & Schuster / Threshold Editions", notes: "Full-scale political autobiography detailing five decades of public life" },

  // Ehud Barak
  { id: "wrk-barak-1", personId: "ehud-barak", title: "My Country, My Life: Fighting for Israel, Searching for Peace", workType: "book", publicationYear: "2018", publisher: "St. Martin's Press" },

  // Yitzhak Rabin
  { id: "wrk-rabin-1", personId: "yitzhak-rabin", title: "The Rabin Memoirs", workType: "book", publicationYear: "1979", publisher: "Little, Brown and Company" },

  // Shimon Peres
  { id: "wrk-peres-1", personId: "shimon-peres", title: "Battling for Peace: A Memoir", workType: "book", publicationYear: "1995", publisher: "Random House" },
  { id: "wrk-peres-2", personId: "shimon-peres", title: "No Room for Small Dreams: Courage, Imagination, and the Making of Modern Israel", workType: "book", publicationYear: "2017", publisher: "Custom House / HarperCollins" },

  // Ron Dermer
  { id: "wrk-dermer-1", personId: "ron-dermer", title: "The Case for Democracy: The Power of Freedom to Overcome Tyranny and Terror", workType: "book", publicationYear: "2004", publisher: "PublicAffairs", notes: "Co-authored with Natan Sharansky; widely cited by the George W. Bush administration" },

  // Mahmoud Abbas
  { id: "wrk-abbas-1", personId: "mahmoud-abbas", title: "Through Secret Channels: The Road to Oslo", workType: "book", publicationYear: "1995", publisher: "Garnet Publishing" },

  // Saeb Erekat
  { id: "wrk-erekat-1", personId: "saeb-erekat", title: "Life Is Negotiation", workType: "book", publicationYear: "2008", publisher: "Al-Ayyam" },

  // Joe Biden
  { id: "wrk-biden-1", personId: "joe-biden", title: "Promises to Keep: On Life and Politics", workType: "book", publicationYear: "2007", publisher: "Random House" },
  { id: "wrk-biden-2", personId: "joe-biden", title: "Promise Me, Dad: A Year of Hope, Hardship, and Purpose", workType: "book", publicationYear: "2017", publisher: "Flatiron Books" },

  // Donald Trump
  { id: "wrk-trump-1", personId: "donald-trump", title: "Trump: The Art of the Deal", workType: "book", publicationYear: "1987", publisher: "Random House", notes: "Co-authored with Tony Schwartz; #1 New York Times bestseller for 48 weeks" },
  { id: "wrk-trump-2", personId: "donald-trump", title: "The America We Deserve", workType: "book", publicationYear: "2000", publisher: "Renaissance Books" },
  { id: "wrk-trump-3", personId: "donald-trump", title: "Crippled America: How to Make America Great Again", workType: "book", publicationYear: "2015", publisher: "Threshold Editions" },

  // Barack Obama
  { id: "wrk-obama-1", personId: "barack-obama", title: "Dreams from My Father: A Story of Race and Inheritance", workType: "book", publicationYear: "1995", publisher: "Times Books / Random House" },
  { id: "wrk-obama-2", personId: "barack-obama", title: "The Audacity of Hope: Thoughts on Reclaiming the American Dream", workType: "book", publicationYear: "2006", publisher: "Crown Publishing Group" },
  { id: "wrk-obama-3", personId: "barack-obama", title: "A Promised Land", workType: "book", publicationYear: "2020", publisher: "Crown Publishing Group", notes: "First volume of presidential memoirs covering his 2008 election and first term" },

  // Bill Clinton
  { id: "wrk-bill-clinton-1", personId: "bill-clinton", title: "My Life", workType: "book", publicationYear: "2004", publisher: "Alfred A. Knopf" },

  // Hillary Clinton
  { id: "wrk-hillary-clinton-1", personId: "hillary-clinton", title: "Living History", workType: "book", publicationYear: "2003", publisher: "Simon & Schuster" },
  { id: "wrk-hillary-clinton-2", personId: "hillary-clinton", title: "Hard Choices", workType: "book", publicationYear: "2014", publisher: "Simon & Schuster" },

  // Kamala Harris
  { id: "wrk-harris-1", personId: "kamala-harris", title: "The Truths We Hold: An American Journey", workType: "book", publicationYear: "2019", publisher: "Penguin Press" },

  // Dick Cheney
  { id: "wrk-cheney-1", personId: "dick-cheney", title: "In My Time: A Personal and Political Memoir", workType: "book", publicationYear: "2011", publisher: "Threshold Editions" },

  // Mike Pompeo
  { id: "wrk-pompeo-1", personId: "mike-pompeo", title: "Never Give an Inch: Fighting for the America I Love", workType: "book", publicationYear: "2023", publisher: "Broadside Books" },

  // Nancy Pelosi
  { id: "wrk-pelosi-1", personId: "nancy-pelosi", title: "Know Your Power: A Message to America's Daughters", workType: "book", publicationYear: "2008", publisher: "Doubleday" },
  { id: "wrk-pelosi-2", personId: "nancy-pelosi", title: "The Art of Power: My Story as America's First Woman Speaker of the House", workType: "book", publicationYear: "2024", publisher: "Simon & Schuster" },

  // Chuck Schumer
  { id: "wrk-schumer-1", personId: "chuck-schumer", title: "Positively American: Winning Back the Middle-Class Majority", workType: "book", publicationYear: "2007", publisher: "Rodale Books" },

  // Mitch McConnell
  { id: "wrk-mcconnell-1", personId: "mitch-mcconnell", title: "The Long Game: A Memoir", workType: "book", publicationYear: "2016", publisher: "Sentinel / Penguin" },

  // Bernie Sanders
  { id: "wrk-sanders-1", personId: "bernie-sanders", title: "Our Revolution: A Future to Believe In", workType: "book", publicationYear: "2016", publisher: "Thomas Dunne Books" },
  { id: "wrk-sanders-2", personId: "bernie-sanders", title: "It's OK to Be Angry About Capitalism", workType: "book", publicationYear: "2023", publisher: "Crown Publishing Group" },

  // Jared Kushner
  { id: "wrk-kushner-1", personId: "jared-kushner", title: "Breaking History: A White House Memoir", workType: "book", publicationYear: "2022", publisher: "Broadside Books" },

  // Keir Starmer
  { id: "wrk-starmer-1", personId: "keir-starmer", title: "Three Pillars of Liberty: Political Rights and Freedoms in the UK", workType: "book", publicationYear: "1996", publisher: "Routledge" },
  { id: "wrk-starmer-2", personId: "keir-starmer", title: "European Human Rights Law: The Human Rights Act 1998 and the European Convention", workType: "book", publicationYear: "1999", publisher: "Legal Action Group" },

  // Tony Blair
  { id: "wrk-blair-1", personId: "tony-blair", title: "The Third Way: New Politics for the New Century", workType: "book", publicationYear: "1998", publisher: "Fabian Society" },
  { id: "wrk-blair-2", personId: "tony-blair", title: "A Journey: My Political Life", workType: "book", publicationYear: "2010", publisher: "Hutchinson" },

  // Jack Straw
  { id: "wrk-straw-1", personId: "jack-straw", title: "Last Man Standing: Memoirs of a Political Survivor", workType: "book", publicationYear: "2012", publisher: "Biteback Publishing" },

  // Michael Bloomberg
  { id: "wrk-bloomberg-1", personId: "michael-bloomberg", title: "Bloomberg by Bloomberg", workType: "book", publicationYear: "1997", publisher: "John Wiley & Sons" },
  { id: "wrk-bloomberg-2", personId: "michael-bloomberg", title: "Climate of Hope: How Cities, Businesses, and Citizens Can Save the Planet", workType: "book", publicationYear: "2017", publisher: "St. Martin's Press" },

  // Ben Shapiro
  { id: "wrk-shapiro-1", personId: "ben-shapiro", title: "Brainwashed: How Universities Indoctrinate America's Youth", workType: "book", publicationYear: "2004", publisher: "WND Books" },
  { id: "wrk-shapiro-2", personId: "ben-shapiro", title: "The Right Side of History: How Reason and Moral Purpose Made the West Great", workType: "book", publicationYear: "2019", publisher: "Broadside Books" },

  // Andrew Neil
  { id: "wrk-neil-1", personId: "andrew-neil", title: "Full Disclosure", workType: "book", publicationYear: "1996", publisher: "Macmillan" },

  // Tom Brokaw
  { id: "wrk-brokaw-1", personId: "tom-brokaw", title: "The Greatest Generation", workType: "book", publicationYear: "1998", publisher: "Random House" },

  // Emmanuel Macron
  { id: "wrk-macron-1", personId: "emmanuel-macron", title: "Révolution", workType: "book", publicationYear: "2016", publisher: "XO Éditions" },

  // Vladimir Putin
  { id: "wrk-putin-1", personId: "vladimir-putin", title: "First Person: An Astonishingly Frank Self-Portrait by Russia's President", workType: "book", publicationYear: "2000", publisher: "PublicAffairs" }
];

// ==========================================
// 5. Official Residences & Compounds
// ==========================================
export const figuresStaysSeed: BioStaySeed[] = [
  // Benjamin Netanyahu
  {
    id: "stay-netanyahu-balfour-1",
    personId: "benjamin-netanyahu",
    venueName: "Beit Aghion (Balfour Street Residence)",
    stayName: "Prime Minister's Official Residence (1st Tenure)",
    stayType: "official_residence",
    city: "Jerusalem",
    country: "Israel",
    latitude: 31.7707,
    longitude: 35.2173,
    startDate: "1996-06-18",
    endDate: "1999-07-06",
    isBaseOfOperations: true,
    isPrimaryResidence: true,
    notes: "Official executive residence of the Prime Minister of Israel during 1st tenure"
  },
  {
    id: "stay-netanyahu-balfour-2",
    personId: "benjamin-netanyahu",
    venueName: "Beit Aghion (Balfour Street Residence)",
    stayName: "Prime Minister's Official Residence (2nd Tenure)",
    stayType: "official_residence",
    city: "Jerusalem",
    country: "Israel",
    latitude: 31.7707,
    longitude: 35.2173,
    startDate: "2009-03-31",
    endDate: "2021-06-13",
    isBaseOfOperations: true,
    isPrimaryResidence: true,
    notes: "Official executive residence of the Prime Minister of Israel during 2nd tenure"
  },
  {
    id: "stay-netanyahu-balfour-3",
    personId: "benjamin-netanyahu",
    venueName: "Beit Aghion (Balfour Street Residence)",
    stayName: "Prime Minister's Official Residence (3rd Tenure)",
    stayType: "official_residence",
    city: "Jerusalem",
    country: "Israel",
    latitude: 31.7707,
    longitude: 35.2173,
    startDate: "2022-12-29",
    endDate: null,
    isBaseOfOperations: true,
    isPrimaryResidence: true,
    notes: "Official executive residence of the Prime Minister of Israel during 3rd tenure"
  },
  {
    id: "stay-netanyahu-caesarea",
    personId: "benjamin-netanyahu",
    venueName: "Caesarea Private Residence",
    stayName: "Netanyahu Family Villa",
    stayType: "private_home",
    city: "Caesarea",
    country: "Israel",
    latitude: 32.5028,
    longitude: 34.9038,
    startDate: "2002-01-01",
    endDate: null,
    isBaseOfOperations: false,
    isPrimaryResidence: false,
    notes: "Private coastal family home in Caesarea"
  },
  {
    id: "stay-netanyahu-gaza-st",
    personId: "benjamin-netanyahu",
    venueName: "Gaza Street Residence",
    stayName: "Jerusalem Private Apartment",
    stayType: "private_home",
    city: "Jerusalem",
    country: "Israel",
    latitude: 31.7731,
    longitude: 35.2144,
    startDate: "2021-06-13",
    endDate: null,
    isBaseOfOperations: false,
    isPrimaryResidence: false,
    notes: "Private apartment in Rehavia used during renovation of Beit Aghion"
  },

  // Donald Trump
  {
    id: "stay-trump-white-house",
    personId: "donald-trump",
    venueName: "The White House",
    stayName: "Official Executive Mansion (45th Presidency)",
    stayType: "official_residence",
    city: "Washington, D.C.",
    country: "United States",
    latitude: 38.8977,
    longitude: -77.0365,
    startDate: "2017-01-20",
    endDate: "2021-01-20",
    isBaseOfOperations: true,
    isPrimaryResidence: true,
    notes: "Official residence and workplace of the President of the United States (1st term)"
  },
  {
    id: "stay-trump-white-house-2",
    personId: "donald-trump",
    venueName: "The White House",
    stayName: "Official Executive Mansion (47th Presidency)",
    stayType: "official_residence",
    city: "Washington, D.C.",
    country: "United States",
    latitude: 38.8977,
    longitude: -77.0365,
    startDate: "2025-01-20",
    endDate: null,
    isBaseOfOperations: true,
    isPrimaryResidence: true,
    notes: "Official residence and workplace of the President of the United States (2nd non-consecutive term)"
  },
  {
    id: "stay-trump-mar-a-lago",
    personId: "donald-trump",
    venueName: "Mar-a-Lago Club",
    stayName: "Primary Private Estate",
    stayType: "private_home",
    city: "Palm Beach",
    country: "United States",
    latitude: 26.6771,
    longitude: -80.037,
    startDate: "1985-11-01",
    endDate: null,
    isBaseOfOperations: true,
    isPrimaryResidence: false,
    notes: "Historic private estate in Palm Beach, Florida"
  },

  // Joe Biden
  {
    id: "stay-biden-white-house",
    personId: "joe-biden",
    venueName: "The White House",
    stayName: "Official Executive Mansion",
    stayType: "official_residence",
    city: "Washington, D.C.",
    country: "United States",
    latitude: 38.8977,
    longitude: -77.0365,
    startDate: "2021-01-20",
    endDate: "2025-01-20",
    isBaseOfOperations: true,
    isPrimaryResidence: true,
    notes: "Official executive residence during 46th presidency"
  },

  // Barack Obama
  {
    id: "stay-obama-white-house",
    personId: "barack-obama",
    venueName: "The White House",
    stayName: "Official Executive Mansion",
    stayType: "official_residence",
    city: "Washington, D.C.",
    country: "United States",
    latitude: 38.8977,
    longitude: -77.0365,
    startDate: "2009-01-20",
    endDate: "2017-01-20",
    isBaseOfOperations: true,
    isPrimaryResidence: true,
    notes: "Official residence during 44th presidency"
  },

  // Bill Clinton
  {
    id: "stay-clinton-white-house",
    personId: "bill-clinton",
    venueName: "The White House",
    stayName: "Official Executive Mansion",
    stayType: "official_residence",
    city: "Washington, D.C.",
    country: "United States",
    latitude: 38.8977,
    longitude: -77.0365,
    startDate: "1993-01-20",
    endDate: "2001-01-20",
    isBaseOfOperations: true,
    isPrimaryResidence: true,
    notes: "Official residence during 42nd presidency"
  },

  // Keir Starmer
  {
    id: "stay-starmer-10-downing",
    personId: "keir-starmer",
    venueName: "10 Downing Street",
    stayName: "Prime Minister's Official Residence",
    stayType: "official_residence",
    city: "London",
    country: "United Kingdom",
    latitude: 51.5034,
    longitude: -0.1276,
    startDate: "2024-07-05",
    endDate: null,
    isBaseOfOperations: true,
    isPrimaryResidence: true,
    notes: "Official residence of the Prime Minister of the United Kingdom"
  },

  // Tony Blair
  {
    id: "stay-blair-10-downing",
    personId: "tony-blair",
    venueName: "10 Downing Street",
    stayName: "Prime Minister's Official Residence",
    stayType: "official_residence",
    city: "London",
    country: "United Kingdom",
    latitude: 51.5034,
    longitude: -0.1276,
    startDate: "1997-05-02",
    endDate: "2007-06-27",
    isBaseOfOperations: true,
    isPrimaryResidence: true,
    notes: "Official residence during 10-year prime ministerial tenure"
  },

  // Emmanuel Macron
  {
    id: "stay-macron-elysee",
    personId: "emmanuel-macron",
    venueName: "Élysée Palace",
    stayName: "Official Presidential Palace",
    stayType: "official_residence",
    city: "Paris",
    country: "France",
    latitude: 48.8704,
    longitude: 2.3168,
    startDate: "2017-05-14",
    endDate: null,
    isBaseOfOperations: true,
    isPrimaryResidence: true,
    notes: "Official residence of the President of the French Republic"
  },

  // Vladimir Putin
  {
    id: "stay-putin-kremlin",
    personId: "vladimir-putin",
    venueName: "Grand Kremlin Palace & Senate Palace",
    stayName: "Official Presidential Workplace",
    stayType: "official_residence",
    city: "Moscow",
    country: "Russian Federation",
    latitude: 55.7505,
    longitude: 37.6175,
    startDate: "2000-05-07",
    endDate: null,
    isBaseOfOperations: true,
    isPrimaryResidence: false,
    notes: "Official working residence of the President of the Russian Federation"
  },
  {
    id: "stay-putin-novo-ogaryovo",
    personId: "vladimir-putin",
    venueName: "Novo-Ogaryovo State Residence",
    stayName: "Suburban Presidential Residence",
    stayType: "official_residence",
    city: "Moscow Oblast",
    country: "Russian Federation",
    latitude: 55.7333,
    longitude: 37.2,
    startDate: "2000-05-07",
    endDate: null,
    isBaseOfOperations: true,
    isPrimaryResidence: true,
    notes: "Primary working estate and residence outside Moscow"
  },

  // Michael Bloomberg
  {
    id: "stay-bloomberg-gracie",
    personId: "michael-bloomberg",
    venueName: "Gracie Mansion",
    stayName: "Mayoral Residence",
    stayType: "official_residence",
    city: "New York",
    country: "United States",
    latitude: 40.7765,
    longitude: -73.9439,
    startDate: "2002-01-01",
    endDate: "2013-12-31",
    isBaseOfOperations: false,
    isPrimaryResidence: false,
    notes: "Official mayoral residence of New York City; maintained private townhouse on East 79th Street"
  },

  // Jeffrey Epstein
  {
    id: "stay-epstein-71st",
    personId: "jeffrey-epstein",
    venueName: "Herbert N. Straus House (9 East 71st Street)",
    stayName: "Manhattan Townhouse",
    stayType: "private_home",
    city: "New York",
    country: "United States",
    latitude: 40.7719,
    longitude: -73.9649,
    startDate: "1996-01-01",
    endDate: "2019-07-06",
    isBaseOfOperations: true,
    isPrimaryResidence: true,
    notes: "21,000 sq ft Beaux-Arts townhouse, one of largest private residences in Manhattan"
  },
  {
    id: "stay-epstein-little-st-james",
    personId: "jeffrey-epstein",
    venueName: "Little Saint James Island Compound",
    stayName: "Private Island Estate",
    stayType: "private_home",
    city: "St. Thomas",
    country: "U.S. Virgin Islands",
    latitude: 18.3006,
    longitude: -64.8258,
    startDate: "1998-05-01",
    endDate: "2019-07-06",
    isBaseOfOperations: true,
    isPrimaryResidence: false,
    notes: "70-acre private island compound in the Caribbean"
  },
  {
    id: "stay-epstein-palm-beach",
    personId: "jeffrey-epstein",
    venueName: "358 El Brillo Way",
    stayName: "Palm Beach Estate",
    stayType: "private_home",
    city: "Palm Beach",
    country: "United States",
    latitude: 26.7022,
    longitude: -80.0381,
    startDate: "1990-01-01",
    endDate: "2019-07-06",
    isBaseOfOperations: false,
    isPrimaryResidence: false,
    notes: "Private waterfront estate in Palm Beach, Florida"
  }
];
