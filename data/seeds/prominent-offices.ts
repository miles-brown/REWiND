/**
 * REWIND EVIDENCE ATLAS — CANONICAL SEED REGISTER: PROMINENT OFFICES & SUCCESSION
 *
 * Forensically documented constitutional, governmental, and multilateral roles.
 * Provides succession lineages for major state offices with chronological tenures,
 * official styles, party/jurisdiction metadata, and historical landmark context.
 */

export interface OfficeholderRecord {
  ordinal: number;
  ordinalLabel: string;
  name: string;
  personSlug: string | null;
  startDate: string;
  endDate: string | null;
  isCurrent: boolean;
  party?: string;
  jurisdiction?: string;
  residence?: string;
  era: string;
  summary: string;
  keyEvents?: string[];
}

export interface ProminentOffice {
  id: string;
  title: string;
  shortTitle: string;
  jurisdiction: string;
  country: string;
  countryCode: string;
  flag: string;
  category: "head-of-state" | "head-of-government" | "multilateral" | "cabinet-diplomatic" | "monarchy" | "judicial";
  establishedYear: number;
  residence: string;
  description: string;
  holders: OfficeholderRecord[];
}

export const prominentOfficesSeed: ProminentOffice[] = [
  // 1. PRESIDENT OF THE UNITED STATES
  {
    id: "president-of-the-united-states",
    title: "President of the United States",
    shortTitle: "US President",
    jurisdiction: "Federal Government of the United States",
    country: "United States",
    countryCode: "US",
    flag: "🇺🇸",
    category: "head-of-state",
    establishedYear: 1789,
    residence: "The White House, Washington, D.C.",
    description: "The executive head of state and head of government of the United States, directing the federal government and serving as commander-in-chief of the armed forces.",
    holders: [
      {
        ordinal: 28,
        ordinalLabel: "28th President",
        name: "Woodrow Wilson",
        personSlug: "woodrow-wilson",
        startDate: "1913-03-04",
        endDate: "1921-03-04",
        isCurrent: false,
        party: "Democratic",
        era: "1910s–1920s",
        summary: "Led the United States through World War I, authored the Fourteen Points, championed the League of Nations at the Paris Peace Conference, and received the 1919 Nobel Peace Prize.",
        keyEvents: ["1917 US Entry into WWI", "1919 Paris Peace Conference", "Creation of the League of Nations"]
      },
      {
        ordinal: 32,
        ordinalLabel: "32nd President",
        name: "Franklin D. Roosevelt",
        personSlug: "franklin-d-roosevelt",
        startDate: "1933-03-04",
        endDate: "1945-04-12",
        isCurrent: false,
        party: "Democratic",
        era: "1930s–1940s",
        summary: "Elected to four terms; engineered the New Deal response to the Great Depression and orchestrated Grand Alliance strategy alongside Churchill and Stalin throughout World War II.",
        keyEvents: ["1933 New Deal Enactment", "1941 Atlantic Charter", "1945 Yalta Conference"]
      },
      {
        ordinal: 33,
        ordinalLabel: "33rd President",
        name: "Harry S. Truman",
        personSlug: "harry-s-truman",
        startDate: "1945-04-12",
        endDate: "1953-01-20",
        isCurrent: false,
        party: "Democratic",
        era: "1940s–1950s",
        summary: "Concluded World War II, authorized the Marshall Plan for European reconstruction, established the Truman Doctrine against Soviet expansion, and committed US forces to the Korean War.",
        keyEvents: ["1945 Potsdam Conference", "1947 Truman Doctrine", "1949 NATO Formation"]
      },
      {
        ordinal: 34,
        ordinalLabel: "34th President",
        name: "Dwight D. Eisenhower",
        personSlug: "dwight-d-eisenhower",
        startDate: "1953-01-20",
        endDate: "1961-01-20",
        isCurrent: false,
        party: "Republican",
        era: "1950s–1960s",
        summary: "Former Supreme Allied Commander Europe; oversaw the Korean War armistice, initiated the Interstate Highway System, and managed Cold War nuclear deterrence.",
        keyEvents: ["1953 Korean Armistice", "1956 Suez Crisis Intervention", "1961 Farewell Address on Military-Industrial Complex"]
      },
      {
        ordinal: 35,
        ordinalLabel: "35th President",
        name: "John F. Kennedy",
        personSlug: "john-f-kennedy",
        startDate: "1961-01-20",
        endDate: "1963-11-22",
        isCurrent: false,
        party: "Democratic",
        era: "1960s",
        summary: "Navigated the Cuban Missile Crisis to avoid nuclear conflict, established the Peace Corps, initiated the Apollo space program, and signed the Partial Nuclear Test Ban Treaty.",
        keyEvents: ["1961 Bay of Pigs", "1962 Cuban Missile Crisis", "1963 Ich bin ein Berliner Address"]
      },
      {
        ordinal: 36,
        ordinalLabel: "36th President",
        name: "Lyndon B. Johnson",
        personSlug: "lyndon-b-johnson",
        startDate: "1963-11-22",
        endDate: "1969-01-20",
        isCurrent: false,
        party: "Democratic",
        era: "1960s",
        summary: "Enacted the landmark Civil Rights Act of 1964 and Voting Rights Act of 1965 under the Great Society domestic agenda, alongside substantial military escalation in the Vietnam War.",
        keyEvents: ["1964 Civil Rights Act", "1965 Voting Rights Act", "1968 Vietnam Peace Negotiations"]
      },
      {
        ordinal: 37,
        ordinalLabel: "37th President",
        name: "Richard Nixon",
        personSlug: "richard-nixon",
        startDate: "1969-01-20",
        endDate: "1974-08-09",
        isCurrent: false,
        party: "Republican",
        era: "1970s",
        summary: "Opened historic diplomatic relations with the People's Republic of China, initiated détente with the Soviet Union through SALT I, and concluded direct US involvement in Vietnam before resigning over Watergate.",
        keyEvents: ["1972 Historic Visit to China", "1972 Anti-Ballistic Missile Treaty", "1973 Paris Peace Accords"]
      },
      {
        ordinal: 38,
        ordinalLabel: "38th President",
        name: "Gerald Ford",
        personSlug: "gerald-ford",
        startDate: "1974-08-09",
        endDate: "1977-01-20",
        isCurrent: false,
        party: "Republican",
        era: "1970s",
        summary: "Assumed the presidency post-Watergate, pardoned Nixon, and signed the 1975 Helsinki Accords advancing international human rights standards during the Cold War.",
        keyEvents: ["1974 Presidential Transition", "1975 Helsinki Accords"]
      },
      {
        ordinal: 39,
        ordinalLabel: "39th President",
        name: "Jimmy Carter",
        personSlug: "jimmy-carter",
        startDate: "1977-01-20",
        endDate: "1981-01-20",
        isCurrent: false,
        party: "Democratic",
        era: "1970s–1980s",
        summary: "Brokered the historic 1978 Camp David Accords between Israel and Egypt, negotiated the Panama Canal Treaties, and elevated human rights to the core of US foreign policy.",
        keyEvents: ["1978 Camp David Accords", "1979 Egypt-Israel Peace Treaty", "1979 Iranian Hostage Crisis"]
      },
      {
        ordinal: 40,
        ordinalLabel: "40th President",
        name: "Ronald Reagan",
        personSlug: "ronald-reagan",
        startDate: "1981-01-20",
        endDate: "1989-01-20",
        isCurrent: false,
        party: "Republican",
        era: "1980s",
        summary: "Defined American conservatism, enacted supply-side economic reforms, expanded defense capabilities, and conducted Reykjavik and Washington summits with Gorbachev, culminating in the INF Treaty.",
        keyEvents: ["1985 Geneva Summit", "1986 Reykjavik Summit", "1987 INF Treaty Signing"]
      },
      {
        ordinal: 41,
        ordinalLabel: "41st President",
        name: "George H. W. Bush",
        personSlug: "george-h-w-bush",
        startDate: "1989-01-20",
        endDate: "1993-01-20",
        isCurrent: false,
        party: "Republican",
        era: "1980s–1990s",
        summary: "Managed the peaceful reunification of Germany and dissolution of the Soviet Union, assembled a 35-nation coalition in Operation Desert Storm, and convened the 1991 Madrid Peace Conference.",
        keyEvents: ["1989 Malta Summit", "1991 Operation Desert Storm", "1991 Madrid Peace Conference"]
      },
      {
        ordinal: 42,
        ordinalLabel: "42nd President",
        name: "Bill Clinton",
        personSlug: "bill-clinton",
        startDate: "1993-01-20",
        endDate: "2001-01-20",
        isCurrent: false,
        party: "Democratic",
        era: "1990s–2000s",
        summary: "Presided over the longest peacetime economic expansion in US history; brokered the 1993 Oslo Accords, 1995 Dayton Accords ending the Bosnian War, and 1998 Good Friday Agreement in Northern Ireland.",
        keyEvents: ["1993 Oslo I Accord White House Handshake", "1995 Dayton Accords", "1998 Good Friday Agreement Support"]
      },
      {
        ordinal: 43,
        ordinalLabel: "43rd President",
        name: "George W. Bush",
        personSlug: "george-w-bush",
        startDate: "2001-01-20",
        endDate: "2009-01-20",
        isCurrent: false,
        party: "Republican",
        era: "2000s",
        summary: "Formulated the global War on Terror following the September 11 attacks, leading military campaigns in Afghanistan and Iraq, creating the Department of Homeland Security, and establishing PEPFAR.",
        keyEvents: ["2001 September 11 Crisis Response", "2003 Iraq Intervention", "2003 PEPFAR Launch"]
      },
      {
        ordinal: 44,
        ordinalLabel: "44th President",
        name: "Barack Obama",
        personSlug: "barack-obama",
        startDate: "2009-01-20",
        endDate: "2017-01-20",
        isCurrent: false,
        party: "Democratic",
        era: "2010s",
        summary: "First African-American US president; enacted the Affordable Care Act and Dodd-Frank financial reforms, authorized the mission neutralizing Osama bin Laden, and concluded the JCPOA Iran Nuclear Agreement.",
        keyEvents: ["2010 Affordable Care Act", "2015 JCPOA Joint Comprehensive Plan of Action", "2015 Paris Climate Agreement"]
      },
      {
        ordinal: 45,
        ordinalLabel: "45th President",
        name: "Donald Trump",
        personSlug: "donald-trump",
        startDate: "2017-01-20",
        endDate: "2021-01-20",
        isCurrent: false,
        party: "Republican",
        era: "2010s–2020s",
        summary: "First tenure: enacted Tax Cuts and Jobs Act, appointed three Supreme Court Justices, renegotiated NAFTA into USMCA, brokered the historic Abraham Accords, and held bilateral summits with Kim Jong Un.",
        keyEvents: ["2018 Singapore Summit with DPRK", "2020 Abraham Accords Signing", "2020 USMCA Enactment"]
      },
      {
        ordinal: 46,
        ordinalLabel: "46th President",
        name: "Joe Biden",
        personSlug: "joe-biden",
        startDate: "2021-01-20",
        endDate: "2025-01-20",
        isCurrent: false,
        party: "Democratic",
        era: "2020s",
        summary: "Former Vice President and 36-year Senator; enacted the Infrastructure Investment and Jobs Act, CHIPS and Science Act, and Inflation Reduction Act, while marshaling transatlantic allied support for Ukraine.",
        keyEvents: ["2021 Bipartisan Infrastructure Law", "2022 Allied Mobilization for Ukraine", "2022 CHIPS and Science Act"]
      },
      {
        ordinal: 47,
        ordinalLabel: "47th President",
        name: "Donald Trump",
        personSlug: "donald-trump",
        startDate: "2025-01-20",
        endDate: null,
        isCurrent: true,
        party: "Republican",
        era: "2020s–Present",
        summary: "Second non-consecutive presidential tenure; established Department of Government Efficiency (DOGE), overhauled federal executive agencies, and pursued revised tariff and bilateral diplomatic doctrines.",
        keyEvents: ["2025 Inaugural Address & Executive Mandate", "2025 DOGE Executive Restructuring"]
      }
    ]
  },

  // 2. PRIME MINISTER OF THE UNITED KINGDOM
  {
    id: "prime-minister-of-the-united-kingdom",
    title: "Prime Minister of the United Kingdom",
    shortTitle: "UK Prime Minister",
    jurisdiction: "His Majesty's Government",
    country: "United Kingdom",
    countryCode: "GB",
    flag: "🇬🇧",
    category: "head-of-government",
    establishedYear: 1721,
    residence: "10 Downing Street, London",
    description: "The head of His Majesty's Government in the United Kingdom, directing executive policy, chairing the Cabinet, and serving as First Lord of the Treasury.",
    holders: [
      {
        ordinal: 61,
        ordinalLabel: "61st Prime Minister",
        name: "Winston Churchill",
        personSlug: "winston-churchill",
        startDate: "1940-05-10",
        endDate: "1945-07-26",
        isCurrent: false,
        party: "Conservative",
        era: "1940s",
        summary: "Rallied the British Empire and Commonwealth against Nazi Germany, forged the Grand Alliance with Roosevelt and Stalin, and directed wartime victory in World War II.",
        keyEvents: ["1940 Battle of Britain Leadership", "1941 Atlantic Charter Conference", "1945 Yalta Conference"]
      },
      {
        ordinal: 62,
        ordinalLabel: "62nd Prime Minister",
        name: "Clement Attlee",
        personSlug: "clement-attlee",
        startDate: "1945-07-26",
        endDate: "1951-10-26",
        isCurrent: false,
        party: "Labour",
        era: "1940s–1950s",
        summary: "Created the National Health Service (NHS), established the modern British welfare state, granted independence to India and Pakistan, and co-founded NATO.",
        keyEvents: ["1945 Potsdam Conference", "1948 National Health Service Act Enactment", "1949 NATO Treaty Signing"]
      },
      {
        ordinal: 63,
        ordinalLabel: "Prime Minister (2nd Term)",
        name: "Winston Churchill",
        personSlug: "winston-churchill",
        startDate: "1951-10-26",
        endDate: "1955-04-05",
        isCurrent: false,
        party: "Conservative",
        era: "1950s",
        summary: "Second peacetime premiership; managed the transition to the reign of Queen Elizabeth II and conducted early nuclear testing for British strategic deterrence.",
        keyEvents: ["1952 Operation Hurricane (First British Atomic Test)", "1953 Coronation of Elizabeth II"]
      },
      {
        ordinal: 67,
        ordinalLabel: "67th Prime Minister",
        name: "Harold Wilson",
        personSlug: "harold-wilson",
        startDate: "1964-10-16",
        endDate: "1970-06-19",
        isCurrent: false,
        party: "Labour",
        era: "1960s",
        summary: "Modernized British social legislation, founded the Open University, kept British armed forces out of Vietnam, and managed sterling devaluation.",
        keyEvents: ["1965 Capital Punishment Abolition", "1967 Sexual Offences Act", "1969 Open University Charter"]
      },
      {
        ordinal: 69,
        ordinalLabel: "69th Prime Minister",
        name: "Harold Wilson",
        personSlug: "harold-wilson",
        startDate: "1974-03-04",
        endDate: "1976-04-05",
        isCurrent: false,
        party: "Labour",
        era: "1970s",
        summary: "Second premiership; resolved the 1974 Three-Day Week industrial crisis, held the 1975 referendum confirming UK membership in the European Communities, and enacted the Sex Discrimination Act.",
        keyEvents: ["1974 Three-Day Week Settlement", "1975 European Communities Referendum", "1975 Sex Discrimination Act"]
      },
      {
        ordinal: 71,
        ordinalLabel: "71st Prime Minister",
        name: "Margaret Thatcher",
        personSlug: "margaret-thatcher",
        startDate: "1979-05-04",
        endDate: "1990-11-28",
        isCurrent: false,
        party: "Conservative",
        era: "1980s",
        summary: "First female British Prime Minister; transformed the UK economy through privatization and deregulation, recaptured the Falkland Islands, and shaped late Cold War diplomacy alongside Reagan.",
        keyEvents: ["1982 Falklands War Victory", "1984 Sino-British Joint Declaration on Hong Kong", "1986 Big Bang Financial Deregulation"]
      },
      {
        ordinal: 72,
        ordinalLabel: "72nd Prime Minister",
        name: "John Major",
        personSlug: "john-major",
        startDate: "1990-11-28",
        endDate: "1997-05-02",
        isCurrent: false,
        party: "Conservative",
        era: "1990s",
        summary: "Negotiated the Maastricht Treaty with British opt-outs, initiated the Northern Ireland peace process through the Downing Street Declaration, and introduced the National Lottery.",
        keyEvents: ["1991 Gulf War Deployment", "1992 Maastricht Treaty", "1993 Downing Street Declaration"]
      },
      {
        ordinal: 73,
        ordinalLabel: "73rd Prime Minister",
        name: "Tony Blair",
        personSlug: "tony-blair",
        startDate: "1997-05-02",
        endDate: "2007-06-27",
        isCurrent: false,
        party: "Labour",
        era: "1990s–2000s",
        summary: "Won three consecutive general elections under New Labour; negotiated the historic 1998 Good Friday Agreement, devolved power to Scotland and Wales, and joined the US-led interventions in Kosovo, Afghanistan, and Iraq.",
        keyEvents: ["1998 Good Friday Agreement", "1999 Kosovo Intervention", "2003 Iraq War Deployment"]
      },
      {
        ordinal: 74,
        ordinalLabel: "74th Prime Minister",
        name: "Gordon Brown",
        personSlug: "gordon-brown",
        startDate: "2007-06-27",
        endDate: "2010-05-11",
        isCurrent: false,
        party: "Labour",
        era: "2000s–2010s",
        summary: "Decade-long Chancellor of the Exchequer turned Prime Minister; steered Britain and the global economy through the 2008 banking collapse, chairing the decisive 2009 G20 London Summit.",
        keyEvents: ["2008 Bank Recapitalization Package", "2009 G20 London Summit Leadership"]
      },
      {
        ordinal: 75,
        ordinalLabel: "75th Prime Minister",
        name: "David Cameron",
        personSlug: "david-cameron",
        startDate: "2010-05-11",
        endDate: "2016-07-13",
        isCurrent: false,
        party: "Conservative",
        era: "2010s",
        summary: "Formed the first UK peacetime coalition government since WWII; legalized same-sex marriage, won the 2014 Scottish independence referendum, and resigned after the 2016 Brexit referendum vote.",
        keyEvents: ["2010 Conservative-Liberal Democrat Coalition", "2014 Scottish Referendum", "2016 EU Referendum Result"]
      },
      {
        ordinal: 76,
        ordinalLabel: "76th Prime Minister",
        name: "Theresa May",
        personSlug: "theresa-may",
        startDate: "2016-07-13",
        endDate: "2019-07-24",
        isCurrent: false,
        party: "Conservative",
        era: "2010s",
        summary: "Triggered Article 50 to initiate formal withdrawal from the European Union, responded firmly to the Salisbury Novichok poisoning, and contested intense parliamentary divisions over Brexit withdrawal terms.",
        keyEvents: ["2017 Article 50 Trigger", "2018 Salisbury Novichok Response & Expulsions"]
      },
      {
        ordinal: 77,
        ordinalLabel: "77th Prime Minister",
        name: "Boris Johnson",
        personSlug: "boris-johnson",
        startDate: "2019-07-24",
        endDate: "2022-09-06",
        isCurrent: false,
        party: "Conservative",
        era: "2010s–2020s",
        summary: "Secured an 80-seat majority on a mandate to 'Get Brexit Done', formally took the UK out of the European Union, directed the national COVID-19 pandemic response, and led early Western military aid to Ukraine.",
        keyEvents: ["2019 UK General Election Landslide", "2020 Formal UK Exit from EU", "2022 Military Support Alliance for Ukraine"]
      },
      {
        ordinal: 78,
        ordinalLabel: "78th Prime Minister",
        name: "Rishi Sunak",
        personSlug: "rishi-sunak",
        startDate: "2022-10-25",
        endDate: "2024-07-05",
        isCurrent: false,
        party: "Conservative",
        era: "2020s",
        summary: "First British-Asian and Hindu Prime Minister; restored market stability post-mini-budget, signed the Windsor Framework addressing post-Brexit trade in Northern Ireland, and hosted the Bletchley Park AI Safety Summit.",
        keyEvents: ["2023 Windsor Framework Accord", "2023 Bletchley Park AI Safety Summit"]
      },
      {
        ordinal: 79,
        ordinalLabel: "79th Prime Minister",
        name: "Sir Keir Starmer",
        personSlug: "keir-starmer",
        startDate: "2024-07-05",
        endDate: null,
        isCurrent: true,
        party: "Labour",
        era: "2020s–Present",
        summary: "Former Director of Public Prosecutions; returned Labour to government with a 174-seat parliamentary majority, instituting planning reforms, energy transition bodies, and renewed European diplomatic engagement.",
        keyEvents: ["2024 UK General Election Victory", "2024 Blenheim Palace European Political Community Summit"]
      }
    ]
  },

  // 3. PRIME MINISTER OF ISRAEL
  {
    id: "prime-minister-of-israel",
    title: "Prime Minister of Israel",
    shortTitle: "Israeli Prime Minister",
    jurisdiction: "Government of the State of Israel",
    country: "Israel",
    countryCode: "IL",
    flag: "🇮🇱",
    category: "head-of-government",
    establishedYear: 1948,
    residence: "Beit Aghion, Jerusalem",
    description: "The head of government and chief executive of the State of Israel, directing the Cabinet and national security policies.",
    holders: [
      {
        ordinal: 1,
        ordinalLabel: "1st Prime Minister",
        name: "David Ben-Gurion",
        personSlug: "david-ben-gurion",
        startDate: "1948-05-14",
        endDate: "1953-12-07",
        isCurrent: false,
        party: "Mapai",
        era: "1940s–1950s",
        summary: "Founding father of Israel; proclaimed the Declaration of Independence in Tel Aviv, consolidated the Israel Defense Forces (IDF), and directed the 1948 Arab-Israeli War.",
        keyEvents: ["1948 Israeli Declaration of Independence", "1948 Creation of Israel Defense Forces", "1950 Law of Return Enactment"]
      },
      {
        ordinal: 4,
        ordinalLabel: "4th Prime Minister",
        name: "Golda Meir",
        personSlug: "golda-meir",
        startDate: "1969-03-17",
        endDate: "1974-06-03",
        isCurrent: false,
        party: "Labor",
        era: "1960s–1970s",
        summary: "First female Prime Minister of Israel; navigated the War of Attrition and commanded state security operations following the 1972 Munich Olympics massacre and the 1973 Yom Kippur War.",
        keyEvents: ["1970 War of Attrition Ceasefire", "1972 Response to Munich Massacre", "1973 Yom Kippur War Direction"]
      },
      {
        ordinal: 5,
        ordinalLabel: "5th Prime Minister",
        name: "Yitzhak Rabin",
        personSlug: "yitzhak-rabin",
        startDate: "1974-06-03",
        endDate: "1977-06-20",
        isCurrent: false,
        party: "Labor",
        era: "1970s",
        summary: "First native-born Israeli prime minister; authorized the 1976 Operation Entebbe hostage rescue mission in Uganda.",
        keyEvents: ["1975 Sinai Interim Agreement", "1976 Operation Entebbe Command"]
      },
      {
        ordinal: 6,
        ordinalLabel: "6th Prime Minister",
        name: "Menachem Begin",
        personSlug: "menachem-begin",
        startDate: "1977-06-20",
        endDate: "1983-10-10",
        isCurrent: false,
        party: "Likud",
        era: "1970s–1980s",
        summary: "First Likud prime minister; concluded the historic 1979 Egypt-Israel Peace Treaty with Anwar Sadat at Camp David, winning the 1978 Nobel Peace Prize, and authorized Operation Opera destroying Iraq's Osirak nuclear reactor.",
        keyEvents: ["1978 Camp David Accords", "1979 Egypt-Israel Peace Treaty", "1981 Operation Opera Strike"]
      },
      {
        ordinal: 7,
        ordinalLabel: "7th Prime Minister",
        name: "Yitzhak Shamir",
        personSlug: "yitzhak-shamir",
        startDate: "1983-10-10",
        endDate: "1984-09-13",
        isCurrent: false,
        party: "Likud",
        era: "1980s",
        summary: "Former Lehi commander and Knesset speaker; formed the 1983 coalition framework following Menachem Begin's resignation during the Lebanon War.",
        keyEvents: ["1983 Assumption of Likud Leadership", "1984 National Unity Government Agreement"]
      },
      {
        ordinal: 8,
        ordinalLabel: "8th Prime Minister",
        name: "Shimon Peres",
        personSlug: "shimon-peres",
        startDate: "1984-09-13",
        endDate: "1986-10-20",
        isCurrent: false,
        party: "Labor",
        era: "1980s",
        summary: "Served as Prime Minister in rotation with Shamir; halted hyperinflation through the 1985 Economic Stabilization Plan and initiated the redeployment of Israeli forces in southern Lebanon.",
        keyEvents: ["1984 Operation Moses Airlift", "1985 Economic Stabilization Plan"]
      },
      {
        ordinal: 7,
        ordinalLabel: "Prime Minister (2nd Term)",
        name: "Yitzhak Shamir",
        personSlug: "yitzhak-shamir",
        startDate: "1986-10-20",
        endDate: "1992-07-13",
        isCurrent: false,
        party: "Likud",
        era: "1980s–1990s",
        summary: "Led the National Unity and right-wing coalitions; represented Israel at the 1991 Madrid Peace Conference, exercised strategic restraint during Iraqi Scud missile attacks, and oversaw Operation Solomon bringing Ethiopian Jews to Israel.",
        keyEvents: ["1991 Gulf War Restraint Decision", "1991 Operation Solomon Airlift", "1991 Madrid Peace Conference"]
      },
      {
        ordinal: 5,
        ordinalLabel: "Prime Minister (2nd Term)",
        name: "Yitzhak Rabin",
        personSlug: "yitzhak-rabin",
        startDate: "1992-07-13",
        endDate: "1995-11-04",
        isCurrent: false,
        party: "Labor",
        era: "1990s",
        summary: "Signed the Oslo Accords with Yasser Arafat on the White House lawn, signed the 1994 Israel-Jordan Peace Treaty with King Hussein, and was assassinated on November 4, 1995 in Tel Aviv by a right-wing extremist.",
        keyEvents: ["1993 Oslo I Accord Signing", "1994 Israel-Jordan Peace Treaty", "1995 Assassination in Tel Aviv"]
      },
      {
        ordinal: 8,
        ordinalLabel: "Prime Minister (2nd Term)",
        name: "Shimon Peres",
        personSlug: "shimon-peres",
        startDate: "1995-11-04",
        endDate: "1996-06-18",
        isCurrent: false,
        party: "Labor",
        era: "1990s",
        summary: "Assumed the premiership following Yitzhak Rabin's assassination; continued implementation of the Oslo Accords, signed the Interim Agreement on the West Bank and Gaza Strip, and authorized Operation Grapes of Wrath.",
        keyEvents: ["1995 Assumption of Premiership post-Rabin", "1996 Operation Grapes of Wrath"]
      },
      {
        ordinal: 9,
        ordinalLabel: "9th Prime Minister",
        name: "Benjamin Netanyahu",
        personSlug: "benjamin-netanyahu",
        startDate: "1996-06-18",
        endDate: "1999-07-06",
        isCurrent: false,
        party: "Likud",
        era: "1990s",
        summary: "First prime minister elected by direct popular vote; negotiated the 1997 Hebron Protocol and 1998 Wye River Memorandum with the Palestinian National Authority.",
        keyEvents: ["1997 Hebron Protocol", "1998 Wye River Memorandum"]
      },
      {
        ordinal: 10,
        ordinalLabel: "10th Prime Minister",
        name: "Ehud Barak",
        personSlug: "ehud-barak",
        startDate: "1999-07-06",
        endDate: "2001-03-07",
        isCurrent: false,
        party: "One Israel (Labor)",
        era: "1990s–2000s",
        summary: "Former IDF Chief of Staff; withdrew Israeli troops from southern Lebanon in May 2000 and negotiated at the July 2000 Camp David Summit with Yasser Arafat and Bill Clinton.",
        keyEvents: ["2000 Southern Lebanon Military Withdrawal", "2000 Camp David Summit Negotiations"]
      },
      {
        ordinal: 11,
        ordinalLabel: "11th Prime Minister",
        name: "Ariel Sharon",
        personSlug: "ariel-sharon",
        startDate: "2001-03-07",
        endDate: "2006-04-14",
        isCurrent: false,
        party: "Likud / Kadima",
        era: "2000s",
        summary: "Directed Operation Defensive Shield in 2002, ordered the construction of the West Bank barrier, founded the centrist Kadima party, and executed the unilateral disengagement from the Gaza Strip in August 2005.",
        keyEvents: ["2002 Operation Defensive Shield", "2005 Unilateral Disengagement from Gaza"]
      },
      {
        ordinal: 12,
        ordinalLabel: "12th Prime Minister",
        name: "Ehud Olmert",
        personSlug: "ehud-olmert",
        startDate: "2006-04-14",
        endDate: "2009-03-31",
        isCurrent: false,
        party: "Kadima",
        era: "2000s",
        summary: "Commanded the 2006 Second Lebanon War, authorized Operation Orchard destroying a covert Syrian nuclear reactor in 2007, and advanced bilateral negotiations at the 2007 Annapolis Conference.",
        keyEvents: ["2006 Second Lebanon War", "2007 Operation Orchard Nuclear Strike in Syria", "2007 Annapolis Conference"]
      },
      {
        ordinal: 9,
        ordinalLabel: "Prime Minister (2nd Term)",
        name: "Benjamin Netanyahu",
        personSlug: "benjamin-netanyahu",
        startDate: "2009-03-31",
        endDate: "2021-06-13",
        isCurrent: false,
        party: "Likud",
        era: "2010s–2020s",
        summary: "Became Israel's longest-serving prime minister; addressed joint sessions of the US Congress opposing the Iran Nuclear Deal, and normalized diplomatic relations with four Arab nations under the 2020 Abraham Accords.",
        keyEvents: ["2015 US Congressional Joint Address", "2020 Abraham Accords (UAE, Bahrain, Sudan, Morocco)"]
      },
      {
        ordinal: 13,
        ordinalLabel: "13th Prime Minister",
        name: "Naftali Bennett",
        personSlug: "naftali-bennett",
        startDate: "2021-06-13",
        endDate: "2022-06-30",
        isCurrent: false,
        party: "Yamina",
        era: "2020s",
        summary: "Led a historic eight-party rotational unity coalition including an independent Arab-Israeli party (Ra'am) for the first time in Israeli history, passing the first national budget in three years.",
        keyEvents: ["2021 Rotational Coalition Formation", "2022 Moscow Mediation Visit"]
      },
      {
        ordinal: 14,
        ordinalLabel: "14th Prime Minister",
        name: "Yair Lapid",
        personSlug: "yair-lapid",
        startDate: "2022-07-01",
        endDate: "2022-12-29",
        isCurrent: false,
        party: "Yesh Atid",
        era: "2020s",
        summary: "Leader of Yesh Atid; served as rotational prime minister, concluded the landmark Israel-Lebanon Maritime Border Agreement, and addressed the UN General Assembly endorsing a two-state framework.",
        keyEvents: ["2022 Israel-Lebanon Maritime Border Treaty", "2022 UN General Assembly Two-State Speech"]
      },
      {
        ordinal: 9,
        ordinalLabel: "Prime Minister (3rd Term)",
        name: "Benjamin Netanyahu",
        personSlug: "benjamin-netanyahu",
        startDate: "2022-12-29",
        endDate: null,
        isCurrent: true,
        party: "Likud",
        era: "2020s–Present",
        summary: "Formed a coalition with religious and nationalist parties; advanced contentious judicial reforms, declared a state of war following the October 7, 2023 attacks, and commanded multi-front military campaigns in Gaza and Lebanon.",
        keyEvents: ["2023 Judicial Reform Controversy", "2023 October 7 State of War Declaration", "2024 Operations in Gaza, Lebanon & Red Sea"]
      }
    ]
  },

  // 4. SECRETARY-GENERAL OF THE UNITED NATIONS
  {
    id: "secretary-general-of-the-united-nations",
    title: "Secretary-General of the United Nations",
    shortTitle: "UN Secretary-General",
    jurisdiction: "United Nations Secretariat",
    country: "International",
    countryCode: "UN",
    flag: "🇺🇳",
    category: "multilateral",
    establishedYear: 1945,
    residence: "United Nations Plaza, New York City",
    description: "The chief administrative officer of the United Nations and supreme global multilateral diplomat, carrying out mandates from the Security Council and General Assembly.",
    holders: [
      {
        ordinal: 1,
        ordinalLabel: "1st Secretary-General",
        name: "Trygve Lie",
        personSlug: "trygve-lie",
        startDate: "1946-02-02",
        endDate: "1952-11-10",
        isCurrent: false,
        party: "Norway",
        era: "1940s–1950s",
        summary: "First elected UN Secretary-General; established the Secretariat structure, supported the creation of Israel, and backed UN intervention in the Korean War before Soviet non-recognition led to his resignation.",
        keyEvents: ["1946 First UN General Assembly Meeting", "1950 UN Security Council Resolution 83 on Korea"]
      },
      {
        ordinal: 2,
        ordinalLabel: "2nd Secretary-General",
        name: "Dag Hammarskjöld",
        personSlug: "dag-hammarskjold",
        startDate: "1953-04-10",
        endDate: "1961-09-18",
        isCurrent: false,
        party: "Sweden",
        era: "1950s–1960s",
        summary: "Pioneered modern UN peacekeeping during the 1956 Suez Crisis, established the doctrine of preventative diplomacy, and died in a plane crash during the Congo Crisis; awarded the Nobel Peace Prize posthumously.",
        keyEvents: ["1956 UNEF Peacekeeping Deployment in Suez", "1960 ONUC Congo Mission", "1961 Ndola Plane Crash"]
      },
      {
        ordinal: 3,
        ordinalLabel: "3rd Secretary-General",
        name: "U Thant",
        personSlug: "u-thant",
        startDate: "1961-11-30",
        endDate: "1971-12-31",
        isCurrent: false,
        party: "Burma (Myanmar)",
        era: "1960s–1970s",
        summary: "Burmese diplomat who mediated communications during the 1962 Cuban Missile Crisis, established UNFICYP peacekeeping in Cyprus, and presided over the entry of dozens of newly decolonized states into the UN.",
        keyEvents: ["1962 Cuban Missile Crisis De-escalation", "1964 Cyprus Peacekeeping Mission Creation", "1967 Six-Day War Diplomatic Handling"]
      },
      {
        ordinal: 4,
        ordinalLabel: "4th Secretary-General",
        name: "Kurt Waldheim",
        personSlug: "kurt-waldheim",
        startDate: "1972-01-01",
        endDate: "1981-12-31",
        isCurrent: false,
        party: "Austria",
        era: "1970s–1980s",
        summary: "Austrian diplomat who supervised peacekeeping expansions including UNDOF on the Golan Heights and UNIFIL in Lebanon, as well as relief efforts in Bangladesh and the Western Sahara.",
        keyEvents: ["1974 UNDOF Deployment", "1978 UNIFIL Deployment in Southern Lebanon"]
      },
      {
        ordinal: 5,
        ordinalLabel: "5th Secretary-General",
        name: "Javier Pérez de Cuéllar",
        personSlug: "javier-perez-de-cuellar",
        startDate: "1982-01-01",
        endDate: "1991-12-31",
        isCurrent: false,
        party: "Peru",
        era: "1980s–1990s",
        summary: "Peruvian diplomat who brokered the 1988 ceasefire ending the Iran-Iraq War, oversaw the independence of Namibia, and mediated the peace accords in El Salvador and Cambodia.",
        keyEvents: ["1988 Iran-Iraq Ceasefire", "1989 Namibia Independence Process", "1991 El Salvador Chapultepec Peace Accords"]
      },
      {
        ordinal: 6,
        ordinalLabel: "6th Secretary-General",
        name: "Boutros Boutros-Ghali",
        personSlug: "boutros-boutros-ghali",
        startDate: "1992-01-01",
        endDate: "1996-12-31",
        isCurrent: false,
        party: "Egypt",
        era: "1990s",
        summary: "Egyptian scholar-diplomat who authored 'An Agenda for Peace' establishing the post-Cold War doctrine of peacebuilding, but faced severe diplomatic friction over UN missions in Somalia, Rwanda, and Bosnia.",
        keyEvents: ["1992 'An Agenda for Peace' Publication", "1993 UNOSOM II Somalia Operations", "1994 Rwandan Genocide Humanitarian Crisis"]
      },
      {
        ordinal: 7,
        ordinalLabel: "7th Secretary-General",
        name: "Kofi Annan",
        personSlug: "kofi-annan",
        startDate: "1997-01-01",
        endDate: "2006-12-31",
        isCurrent: false,
        party: "Ghana",
        era: "1990s–2000s",
        summary: "Ghanaian diplomat who rose through the UN ranks; introduced the Millennium Development Goals (MDGs), launched the UN Global Compact, established the 'Responsibility to Protect' (R2P) doctrine, and received the 2001 Nobel Peace Prize.",
        keyEvents: ["2000 Millennium Summit & MDGs Adoption", "2001 Nobel Peace Prize Award", "2005 World Summit R2P Endorsement"]
      },
      {
        ordinal: 8,
        ordinalLabel: "8th Secretary-General",
        name: "Ban Ki-moon",
        personSlug: "ban-ki-moon",
        startDate: "2007-01-01",
        endDate: "2016-12-31",
        isCurrent: false,
        party: "South Korea",
        era: "2000s–2010s",
        summary: "South Korean Foreign Minister who prioritized climate action, culminating in the 2015 Paris Agreement; established UN Women, and oversaw the unanimous adoption of the Sustainable Development Goals (SDGs 2030).",
        keyEvents: ["2010 Creation of UN Women", "2015 Sustainable Development Goals (2030 Agenda)", "2015 Paris Climate Agreement Signing"]
      },
      {
        ordinal: 9,
        ordinalLabel: "9th Secretary-General",
        name: "António Guterres",
        personSlug: "antonio-guterres",
        startDate: "2017-01-01",
        endDate: null,
        isCurrent: true,
        party: "Portugal",
        era: "2010s–Present",
        summary: "Former Prime Minister of Portugal and UN High Commissioner for Refugees; championed global vaccine equity during COVID-19, established the Black Sea Grain Initiative, and declared a planetary 'climate emergency'.",
        keyEvents: ["2020 COVID-19 Global Ceasefire Appeal", "2022 Black Sea Grain Initiative Negotiation", "2024 Summit of the Future & Pact for the Future"]
      }
    ]
  },

  // 5. UNITED STATES SECRETARY OF STATE
  {
    id: "united-states-secretary-of-state",
    title: "United States Secretary of State",
    shortTitle: "US Secretary of State",
    jurisdiction: "United States Department of State",
    country: "United States",
    countryCode: "US",
    flag: "🇺🇸",
    category: "cabinet-diplomatic",
    establishedYear: 1789,
    residence: "Harry S. Truman Building, Washington, D.C.",
    description: "The senior Cabinet officer and principal foreign policy advisor to the President of the United States, conducting diplomacy, sovereign treaties, and foreign affairs.",
    holders: [
      {
        ordinal: 56,
        ordinalLabel: "56th Secretary of State",
        name: "Henry Kissinger",
        personSlug: "henry-kissinger",
        startDate: "1973-09-22",
        endDate: "1977-01-20",
        isCurrent: false,
        party: "Republican",
        era: "1970s",
        summary: "National Security Advisor concurrently; pioneered 'shuttle diplomacy' across the Middle East following the 1973 Yom Kippur War, negotiated the Paris Peace Accords, and shared the 1973 Nobel Peace Prize.",
        keyEvents: ["1973 Paris Peace Accords on Vietnam", "1974 Middle East Shuttle Diplomacy Agreements", "1975 Helsinki Accords"]
      },
      {
        ordinal: 57,
        ordinalLabel: "57th Secretary of State",
        name: "Cyrus Vance",
        personSlug: "cyrus-vance",
        startDate: "1977-01-23",
        endDate: "1980-04-28",
        isCurrent: false,
        party: "Democratic",
        era: "1970s–1980s",
        summary: "Anchored Carter administration diplomacy; negotiated the Camp David Accords and SALT II with the USSR; resigned on principle in opposition to Operation Eagle Claw hostage rescue attempt.",
        keyEvents: ["1978 Camp David Negotiations", "1979 SALT II Signing", "1980 Principle Resignation over Eagle Claw"]
      },
      {
        ordinal: 60,
        ordinalLabel: "60th Secretary of State",
        name: "George Shultz",
        personSlug: "george-shultz",
        startDate: "1982-07-16",
        endDate: "1989-01-20",
        isCurrent: false,
        party: "Republican",
        era: "1980s",
        summary: "Key architect of the diplomatic breakthrough ending the Cold War; partnered with Reagan to conclude the 1987 INF Treaty with the Soviet Union eliminating an entire class of nuclear missiles.",
        keyEvents: ["1985 Geneva Summit Dialogue", "1987 INF Treaty Completion"]
      },
      {
        ordinal: 61,
        ordinalLabel: "61st Secretary of State",
        name: "James Baker",
        personSlug: "james-baker",
        startDate: "1989-01-25",
        endDate: "1992-08-23",
        isCurrent: false,
        party: "Republican",
        era: "1980s–1990s",
        summary: "Navigated the dissolution of the Soviet Union and German reunification under the 'Two Plus Four' process, assembled the Gulf War diplomatic coalition, and convened the 1991 Madrid Peace Conference.",
        keyEvents: ["1990 German Reunification Treaty (Two Plus Four)", "1991 Gulf War International Coalition", "1991 Madrid Conference Co-chair"]
      },
      {
        ordinal: 64,
        ordinalLabel: "64th Secretary of State",
        name: "Madeleine Albright",
        personSlug: "madeleine-albright",
        startDate: "1997-01-23",
        endDate: "2001-01-20",
        isCurrent: false,
        party: "Democratic",
        era: "1990s–2000s",
        summary: "First female Secretary of State; championed NATO enlargement to include Poland, Hungary, and the Czech Republic, directed humanitarian diplomacy during the Kosovo War, and met Kim Jong Il in Pyongyang.",
        keyEvents: ["1999 NATO Enlargement Process", "1999 Kosovo Diplomatic Strategy", "2000 Historic Visit to Pyongyang"]
      },
      {
        ordinal: 65,
        ordinalLabel: "65th Secretary of State",
        name: "Colin Powell",
        personSlug: "colin-powell",
        startDate: "2001-01-20",
        endDate: "2005-01-26",
        isCurrent: false,
        party: "Republican",
        era: "2000s",
        summary: "Former Chairman of the Joint Chiefs of Staff and first African-American Secretary of State; assembled international counterterrorism coalitions post-9/11 and presented intelligence before the UN Security Council in February 2003.",
        keyEvents: ["2001 Post-9/11 Allied Diplomacy", "2003 UN Security Council Address on Iraq"]
      },
      {
        ordinal: 66,
        ordinalLabel: "66th Secretary of State",
        name: "Condoleezza Rice",
        personSlug: "condoleezza-rice",
        startDate: "2005-01-26",
        endDate: "2009-01-20",
        isCurrent: false,
        party: "Republican",
        era: "2000s",
        summary: "First African-American female Secretary of State; initiated 'transformational diplomacy', concluded the landmark US-India Civil Nuclear Agreement, and hosted the 2007 Annapolis Peace Conference.",
        keyEvents: ["2006 US-India Civil Nuclear Accord", "2007 Annapolis Peace Conference"]
      },
      {
        ordinal: 67,
        ordinalLabel: "67th Secretary of State",
        name: "Hillary Clinton",
        personSlug: "hillary-clinton",
        startDate: "2009-01-21",
        endDate: "2013-02-01",
        isCurrent: false,
        party: "Democratic",
        era: "2000s–2010s",
        summary: "Former First Lady and US Senator; engineered the diplomatic 'pivot to Asia', initiated the 'reset' with Russia leading to New START, mobilized multilateral sanctions on Iran, and advocated for the 2011 NATO intervention in Libya.",
        keyEvents: ["2010 New START Nuclear Treaty", "2011 US Pivot to East Asia Doctrine", "2011 UN/NATO Intervention in Libya"]
      },
      {
        ordinal: 68,
        ordinalLabel: "68th Secretary of State",
        name: "John Kerry",
        personSlug: "john-kerry",
        startDate: "2013-02-01",
        endDate: "2017-01-20",
        isCurrent: false,
        party: "Democratic",
        era: "2010s",
        summary: "Decorated naval veteran and 28-year Senator; negotiated the 2015 JCPOA Joint Comprehensive Plan of Action nuclear agreement with Iran and signed the 2015 Paris Climate Agreement.",
        keyEvents: ["2015 Iran Nuclear Agreement (JCPOA)", "2015 Paris Climate Agreement Signing"]
      },
      {
        ordinal: 70,
        ordinalLabel: "70th Secretary of State",
        name: "Mike Pompeo",
        personSlug: "mike-pompeo",
        startDate: "2018-04-26",
        endDate: "2021-01-20",
        isCurrent: false,
        party: "Republican",
        era: "2010s–2020s",
        summary: "Former CIA Director and Congressman; executed the Trump administration's 'maximum pressure' campaign against Iran, facilitated the Abraham Accords normalization, and took hardline stances on China and Xinjiang.",
        keyEvents: ["2018 Maximum Pressure Policy on Iran", "2020 Abraham Accords Diplomatic Facilitation"]
      },
      {
        ordinal: 71,
        ordinalLabel: "71st Secretary of State",
        name: "Antony Blinken",
        personSlug: "antony-blinken",
        startDate: "2021-01-26",
        endDate: "2025-01-20",
        isCurrent: false,
        party: "Democratic",
        era: "2020s",
        summary: "Longtime foreign policy advisor; rebuilt traditional NATO and Indo-Pacific alliances (AUKUS, Quad), marshaled international security assistance for Ukraine, and led intense shuttle diplomacy throughout the 2023-2024 Middle East conflict.",
        keyEvents: ["2021 Re-engagement with Multilateral Treaties", "2022 Transatlantic Ukraine Support Coalition", "2023-2024 Middle East Crisis Shuttle Diplomacy"]
      }
    ]
  },

  // 6. CHANCELLOR OF THE FEDERAL REPUBLIC OF GERMANY
  {
    id: "chancellor-of-germany",
    title: "Chancellor of the Federal Republic of Germany",
    shortTitle: "German Chancellor",
    jurisdiction: "Federal Chancellery of Germany",
    country: "Germany",
    countryCode: "DE",
    flag: "🇩🇪",
    category: "head-of-government",
    establishedYear: 1949,
    residence: "Federal Chancellery, Berlin",
    description: "The head of government of the Federal Republic of Germany, presiding over the Federal Cabinet and directing federal policy guidelines (Richtlinienkompetenz).",
    holders: [
      {
        ordinal: 1,
        ordinalLabel: "1st Federal Chancellor",
        name: "Konrad Adenauer",
        personSlug: "konrad-adenauer",
        startDate: "1949-09-15",
        endDate: "1963-10-16",
        isCurrent: false,
        party: "CDU",
        era: "1940s–1960s",
        summary: "First post-war Chancellor; anchored West Germany firmly in the Western alliance (Westbindung), integrated the nation into NATO and the European Coal and Steel Community, and signed the 1963 Élysée Treaty with France.",
        keyEvents: ["1955 West German Accession to NATO", "1957 Treaty of Rome Founding of EEC", "1963 Élysée Treaty of Friendship with France"]
      },
      {
        ordinal: 4,
        ordinalLabel: "4th Federal Chancellor",
        name: "Willy Brandt",
        personSlug: "willy-brandt",
        startDate: "1969-10-21",
        endDate: "1974-05-07",
        isCurrent: false,
        party: "SPD",
        era: "1960s–1970s",
        summary: "Architect of Ostpolitik reconciling West Germany with the Eastern Bloc; made the historic gesture of repentance (Kniefall von Warschau) at the Warsaw Ghetto Memorial and received the 1971 Nobel Peace Prize.",
        keyEvents: ["1970 Kniefall von Warschau in Poland", "1970 Moscow & Warsaw Treaties", "1972 Basic Treaty with East Germany"]
      },
      {
        ordinal: 5,
        ordinalLabel: "5th Federal Chancellor",
        name: "Helmut Schmidt",
        personSlug: "helmut-schmidt",
        startDate: "1974-05-16",
        endDate: "1982-10-01",
        isCurrent: false,
        party: "SPD",
        era: "1970s–1980s",
        summary: "Steered West Germany through the 1970s oil crises and Red Army Faction (RAF) terrorism ('German Autumn'), co-created the European Monetary System (EMS), and championed the 1979 NATO Double-Track Decision.",
        keyEvents: ["1977 German Autumn Counterterrorism Crisis", "1979 European Monetary System Launch", "1979 NATO Double-Track Decision"]
      },
      {
        ordinal: 6,
        ordinalLabel: "6th Federal Chancellor",
        name: "Helmut Kohl",
        personSlug: "helmut-kohl",
        startDate: "1982-10-01",
        endDate: "1998-10-27",
        isCurrent: false,
        party: "CDU",
        era: "1980s–1990s",
        summary: "Chancellor of German Unity; seized the historical opportunity of the fall of the Berlin Wall to achieve peaceful reunification within one year and co-architected the Maastricht Treaty creating the Euro currency.",
        keyEvents: ["1989 Fall of the Berlin Wall", "1990 German Reunification", "1992 Maastricht Treaty Creating the Euro"]
      },
      {
        ordinal: 7,
        ordinalLabel: "7th Federal Chancellor",
        name: "Gerhard Schröder",
        personSlug: "gerhard-schroder",
        startDate: "1998-10-27",
        endDate: "2005-11-22",
        isCurrent: false,
        party: "SPD",
        era: "1990s–2000s",
        summary: "Formed the first federal SPD-Green coalition; deployed German armed forces to Kosovo and Afghanistan, enacted the structural Agenda 2010 labor market reforms, and opposed the 2003 Iraq War.",
        keyEvents: ["1999 Bundeswehr Deployment in Kosovo", "2003 Agenda 2010 Social Reforms", "2003 Opposition to Iraq War alongside France"]
      },
      {
        ordinal: 8,
        ordinalLabel: "8th Federal Chancellor",
        name: "Angela Merkel",
        personSlug: "angela-merkel",
        startDate: "2005-11-22",
        endDate: "2021-12-08",
        isCurrent: false,
        party: "CDU",
        era: "2000s–2020s",
        summary: "First female Chancellor; governed for 16 years, guiding Europe through the 2008 Eurozone sovereign debt crisis, the 2015 refugee crisis ('Wir schaffen das'), and the COVID-19 pandemic.",
        keyEvents: ["2010-2012 Eurozone Sovereign Debt Resolution", "2015 European Refugee Response Leadership", "2015 Minsk II Peace Accords on Ukraine"]
      },
      {
        ordinal: 9,
        ordinalLabel: "9th Federal Chancellor",
        name: "Olaf Scholz",
        personSlug: "olaf-scholz",
        startDate: "2021-12-08",
        endDate: null,
        isCurrent: true,
        party: "SPD",
        era: "2020s–Present",
        summary: "Former Vice-Chancellor and Finance Minister; proclaimed the historic 'Zeitenwende' (turning point) defense and foreign policy doctrine following the 2022 Russian invasion of Ukraine, creating a €100 billion special defense fund.",
        keyEvents: ["2022 Zeitenwende Landmark Address", "2022 Transformation of German Energy Independence"]
      }
    ]
  },

  // 7. PRESIDENT OF THE FRENCH REPUBLIC
  {
    id: "president-of-france",
    title: "President of the French Republic",
    shortTitle: "French President",
    jurisdiction: "French Fifth Republic",
    country: "France",
    countryCode: "FR",
    flag: "🇫🇷",
    category: "head-of-state",
    establishedYear: 1958,
    residence: "Élysée Palace, Paris",
    description: "The executive head of state of France, commander-in-chief of the French Armed Forces, and guarantor of the Constitution and national sovereignty.",
    holders: [
      {
        ordinal: 18,
        ordinalLabel: "1st President (Fifth Republic)",
        name: "Charles de Gaulle",
        personSlug: "charles-de-gaulle",
        startDate: "1959-01-08",
        endDate: "1969-04-28",
        isCurrent: false,
        party: "UNR",
        era: "1950s–1960s",
        summary: "Leader of Free France during World War II; founded the French Fifth Republic with an empowered presidency, ended the Algerian War, developed the French nuclear force de frappe, and withdrew France from NATO's integrated command.",
        keyEvents: ["1958 Founding of the Fifth Republic", "1962 Évian Accords Ending Algerian War", "1966 Withdrawal from NATO Integrated Military Command"]
      },
      {
        ordinal: 21,
        ordinalLabel: "21st President",
        name: "François Mitterrand",
        personSlug: "francois-mitterrand",
        startDate: "1981-05-21",
        endDate: "1995-05-17",
        isCurrent: false,
        party: "Socialist Party (PS)",
        era: "1980s–1990s",
        summary: "Longest-serving French president (14 years); abolished the death penalty, enacted 39-hour workweek and wealth tax, and forged a close partnership with Helmut Kohl to create the European Union under the Maastricht Treaty.",
        keyEvents: ["1981 Abolition of Capital Punishment in France", "1984 Verdun Handshake with Helmut Kohl", "1992 Maastricht Treaty Ratification"]
      },
      {
        ordinal: 22,
        ordinalLabel: "22nd President",
        name: "Jacques Chirac",
        personSlug: "jacques-chirac",
        startDate: "1995-05-17",
        endDate: "2007-05-16",
        isCurrent: false,
        party: "RPR / UMP",
        era: "1990s–2000s",
        summary: "Former Prime Minister and Mayor of Paris; formally recognized French state responsibility for the wartime deportation of Jews, ended military conscription, and famously opposed the 2003 US-led invasion of Iraq.",
        keyEvents: ["1995 Vél d'Hiv Memorial Address", "2002 Creation of the UMP Party", "2003 UN Veto Threat against Iraq Invasion"]
      },
      {
        ordinal: 23,
        ordinalLabel: "23rd President",
        name: "Nicolas Sarkozy",
        personSlug: "nicolas-sarkozy",
        startDate: "2007-05-16",
        endDate: "2012-05-15",
        isCurrent: false,
        party: "UMP",
        era: "2000s–2010s",
        summary: "Promoted economic liberalization; mediated the August 2008 Russia-Georgia ceasefire as EU Council President, returned France to NATO's integrated military command in 2009, and led the 2011 intervention in Libya.",
        keyEvents: ["2008 Russia-Georgia Ceasefire Mediation", "2009 Full Return to NATO Command", "2011 Military Intervention in Libya"]
      },
      {
        ordinal: 25,
        ordinalLabel: "25th President",
        name: "Emmanuel Macron",
        personSlug: "emmanuel-macron",
        startDate: "2017-05-14",
        endDate: null,
        isCurrent: true,
        party: "Renaissance (LREM)",
        era: "2010s–Present",
        summary: "Youngest French president in history; founded the centrist En Marche movement, championed European 'strategic autonomy', hosted the 2024 Paris Olympic Games, and supported European defense modernization.",
        keyEvents: ["2017 Landmark Sorbonne Speech on European Autonomy", "2022 Re-election Victory", "2024 Paris Olympic Games Hosting"]
      }
    ]
  },

  // 8. MONARCH OF THE UNITED KINGDOM
  {
    id: "monarch-of-the-united-kingdom",
    title: "Monarch of the United Kingdom",
    shortTitle: "British Monarch",
    jurisdiction: "The Crown of the United Kingdom",
    country: "United Kingdom",
    countryCode: "GB",
    flag: "👑",
    category: "monarchy",
    establishedYear: 1707,
    residence: "Buckingham Palace, London",
    description: "The sovereign head of state of the United Kingdom, its crown dependencies and overseas territories, and Head of the Commonwealth.",
    holders: [
      {
        ordinal: 40,
        ordinalLabel: "King of the United Kingdom",
        name: "King George V",
        personSlug: "george-v",
        startDate: "1910-05-06",
        endDate: "1936-01-20",
        isCurrent: false,
        party: "House of Windsor",
        era: "1910s–1930s",
        summary: "Founded the House of Windsor in 1917, changing the family name from Saxe-Coburg and Gotha during World War I; oversaw the transformation of the British Empire into the British Commonwealth under the 1931 Statute of Westminster.",
        keyEvents: ["1917 Founding of the House of Windsor", "1931 Statute of Westminster Enactment"]
      },
      {
        ordinal: 41,
        ordinalLabel: "King of the United Kingdom",
        name: "King Edward VIII",
        personSlug: "edward-viii",
        startDate: "1936-01-20",
        endDate: "1936-12-11",
        isCurrent: false,
        party: "House of Windsor",
        era: "1930s",
        summary: "Reigned for 326 days before abdicating the throne in December 1936 to marry American divorcee Wallis Simpson, triggering a major constitutional crisis.",
        keyEvents: ["1936 Instrument of Abdication Signing"]
      },
      {
        ordinal: 42,
        ordinalLabel: "King of the United Kingdom",
        name: "King George VI",
        personSlug: "george-vi",
        startDate: "1936-12-11",
        endDate: "1952-02-06",
        isCurrent: false,
        party: "House of Windsor",
        era: "1930s–1950s",
        summary: "Ascended the throne upon his brother's abdication; served as a revered symbol of national endurance alongside Winston Churchill throughout the Blitz and World War II, and was the first Head of the Commonwealth.",
        keyEvents: ["1939 Radio Address on Outbreak of War", "1940-1941 Residence at Buckingham Palace during the Blitz", "1949 London Declaration"]
      },
      {
        ordinal: 43,
        ordinalLabel: "Queen of the United Kingdom",
        name: "Queen Elizabeth II",
        personSlug: "elizabeth-ii",
        startDate: "1952-02-06",
        endDate: "2022-09-08",
        isCurrent: false,
        party: "House of Windsor",
        era: "1950s–2020s",
        summary: "Longest-reigning British monarch in history (70 years, 214 days); presided over decolonization, post-war reconstruction, the Cold War, entry and exit from the EU, and celebrated Platinum Jubilee in 2022.",
        keyEvents: ["1953 Coronation at Westminster Abbey", "1977 Silver Jubilee", "2011 Historic State Visit to Republic of Ireland", "2022 Platinum Jubilee"]
      },
      {
        ordinal: 44,
        ordinalLabel: "King of the United Kingdom",
        name: "King Charles III",
        personSlug: "king-charles-iii",
        startDate: "2022-09-08",
        endDate: null,
        isCurrent: true,
        party: "House of Windsor",
        era: "2020s–Present",
        summary: "Ascended the throne upon the death of Queen Elizabeth II; crowned at Westminster Abbey on May 6, 2023; lifelong advocate for environmental sustainability, interfaith dialogue, and modernized sovereign institutions.",
        keyEvents: ["2022 Accession to the Throne", "2023 Coronation at Westminster Abbey", "2023 State Visit to France & Address to French Senate"]
      }
    ]
  },

  // 9. POPE & BISHOP OF ROME
  {
    id: "pope-bishop-of-rome",
    title: "Pope & Bishop of Rome",
    shortTitle: "Supreme Pontiff",
    jurisdiction: "Holy See & Vatican City State",
    country: "Holy See (Vatican City)",
    countryCode: "VA",
    flag: "🇻🇦",
    category: "monarchy",
    establishedYear: 33,
    residence: "Apostolic Palace / Domus Sanctae Marthae, Vatican City",
    description: "The Bishop of Rome, Vicar of Jesus Christ, Supreme Pontiff of the Catholic Church, and Sovereign of the Vatican City State.",
    holders: [
      {
        ordinal: 260,
        ordinalLabel: "260th Pope",
        name: "Pope Pius XII",
        personSlug: "pope-pius-xii",
        startDate: "1939-03-02",
        endDate: "1958-10-09",
        isCurrent: false,
        party: "Holy See",
        era: "1930s–1950s",
        summary: "Led the Catholic Church through World War II and the initial Cold War period; declared the dogma of the Assumption of Mary ex cathedra in 1950.",
        keyEvents: ["1939 Outbreak of World War II Encyclicals", "1950 Munificentissimus Deus Dogma Proclamation"]
      },
      {
        ordinal: 261,
        ordinalLabel: "261st Pope",
        name: "Pope John XXIII",
        personSlug: "pope-john-xxiii",
        startDate: "1958-10-28",
        endDate: "1963-06-03",
        isCurrent: false,
        party: "Holy See",
        era: "1950s–1960s",
        summary: "Convened the historic Second Vatican Council (Vatican II) to renew and modernize the Church; issued the landmark peace encyclical 'Pacem in terris' in 1963; canonized in 2014.",
        keyEvents: ["1962 Opening of the Second Vatican Council", "1963 'Pacem in terris' Encyclical on Global Peace"]
      },
      {
        ordinal: 262,
        ordinalLabel: "262nd Pope",
        name: "Pope Paul VI",
        personSlug: "pope-paul-vi",
        startDate: "1963-06-21",
        endDate: "1978-08-06",
        isCurrent: false,
        party: "Holy See",
        era: "1960s–1970s",
        summary: "Brought the Second Vatican Council to completion in 1965; became the first reigning Pope in modern times to travel internationally by air, addressing the United Nations General Assembly in 1965.",
        keyEvents: ["1965 Closing of Second Vatican Council", "1965 First Papal Address to UN General Assembly", "1968 Humanae vitae Encyclical"]
      },
      {
        ordinal: 264,
        ordinalLabel: "264th Pope",
        name: "Pope John Paul II",
        personSlug: "pope-john-paul-ii",
        startDate: "1978-10-16",
        endDate: "2005-04-02",
        isCurrent: false,
        party: "Holy See",
        era: "1970s–2000s",
        summary: "First non-Italian pope in 455 years; charismatic globetrotter visiting 129 countries; played a pivotal role in the collapse of Soviet-backed communism in Eastern Europe; survived a 1981 assassination attempt; canonized in 2014.",
        keyEvents: ["1979 Pilgrimage to Poland Inspiring Solidarność", "1981 St. Peter's Square Assassination Attempt Survival", "1986 Assisi World Day of Prayer for Peace"]
      },
      {
        ordinal: 265,
        ordinalLabel: "265th Pope",
        name: "Pope Benedict XVI",
        personSlug: "pope-benedict-xvi",
        startDate: "2005-04-19",
        endDate: "2013-02-28",
        isCurrent: false,
        party: "Holy See",
        era: "2000s–2010s",
        summary: "German theologian and prefect of the Congregation for the Doctrine of the Faith; became the first Pope to voluntarily resign in nearly 600 years (since Gregory XII in 1415), assuming the title Pope Emeritus.",
        keyEvents: ["2005 Election to Papacy", "2006 Regensburg Lecture", "2013 Historic Voluntary Renunciation of the Papacy"]
      },
      {
        ordinal: 266,
        ordinalLabel: "266th Pope",
        name: "Pope Francis",
        personSlug: "pope-francis",
        startDate: "2013-03-13",
        endDate: null,
        isCurrent: true,
        party: "Holy See",
        era: "2010s–Present",
        summary: "First pope from the Americas, first from the Southern Hemisphere, and first Jesuit pope; authored 'Laudato si'' on integral ecology and 'Fratelli tutti' on human fraternity; championed Church synodality and marginalized peoples.",
        keyEvents: ["2013 Election of First Jesuit Pope", "2015 'Laudato si'' Environmental Encyclical", "2019 Document on Human Fraternity Signed in Abu Dhabi"]
      }
    ]
  }
];

