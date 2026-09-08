export interface OfficialRoleSeed {
  id: number;
  personId: string;
  title: string;
  organisationName: string;
  startDate: string;
  endDate: string | null;
  isCurrent: boolean;
}

export const officialRolesSeed: OfficialRoleSeed[] = [
  // Benjamin Netanyahu
  { id: 1, personId: "benjamin-netanyahu", title: "Permanent Representative of Israel to the United Nations", organisationName: "United Nations", startDate: "1984-01-01", endDate: "1988-01-01", isCurrent: false },
  { id: 2, personId: "benjamin-netanyahu", title: "Chairman of Likud Party", organisationName: "Likud Party", startDate: "1993-03-25", endDate: "1999-07-06", isCurrent: false },
  { id: 3, personId: "benjamin-netanyahu", title: "Prime Minister of Israel (1st Tenure)", organisationName: "Government of Israel", startDate: "1996-06-18", endDate: "1999-07-06", isCurrent: false },
  { id: 4, personId: "benjamin-netanyahu", title: "Minister of Foreign Affairs", organisationName: "Government of Israel", startDate: "2002-11-06", endDate: "2003-02-28", isCurrent: false },
  { id: 5, personId: "benjamin-netanyahu", title: "Minister of Finance", organisationName: "Government of Israel", startDate: "2003-02-28", endDate: "2005-08-09", isCurrent: false },
  { id: 6, personId: "benjamin-netanyahu", title: "Chairman of Likud Party", organisationName: "Likud Party", startDate: "2005-12-20", endDate: null, isCurrent: true },
  { id: 7, personId: "benjamin-netanyahu", title: "Prime Minister of Israel (2nd Tenure)", organisationName: "Government of Israel", startDate: "2009-03-31", endDate: "2021-06-13", isCurrent: false },
  { id: 8, personId: "benjamin-netanyahu", title: "Prime Minister of Israel (3rd Tenure)", organisationName: "Government of Israel", startDate: "2022-12-29", endDate: null, isCurrent: true },

  // Ehud Barak
  { id: 9, personId: "ehud-barak", title: "14th Chief of General Staff of the IDF", organisationName: "Israel Defense Forces", startDate: "1991-04-01", endDate: "1995-01-01", isCurrent: false },
  { id: 10, personId: "ehud-barak", title: "Minister of Foreign Affairs", organisationName: "Government of Israel", startDate: "1995-11-22", endDate: "1996-06-18", isCurrent: false },
  { id: 11, personId: "ehud-barak", title: "10th Prime Minister of Israel", organisationName: "Government of Israel", startDate: "1999-07-06", endDate: "2001-03-07", isCurrent: false },
  { id: 12, personId: "ehud-barak", title: "Minister of Defense", organisationName: "Government of Israel", startDate: "2007-06-18", endDate: "2013-03-18", isCurrent: false },

  // Yitzhak Rabin
  { id: 13, personId: "yitzhak-rabin", title: "7th Chief of General Staff of the IDF", organisationName: "Israel Defense Forces", startDate: "1964-01-01", endDate: "1968-01-01", isCurrent: false },
  { id: 14, personId: "yitzhak-rabin", title: "Israeli Ambassador to the United States", organisationName: "Ministry of Foreign Affairs", startDate: "1968-02-01", endDate: "1973-03-01", isCurrent: false },
  { id: 15, personId: "yitzhak-rabin", title: "5th Prime Minister of Israel (1st Tenure)", organisationName: "Government of Israel", startDate: "1974-06-03", endDate: "1977-06-20", isCurrent: false },
  { id: 16, personId: "yitzhak-rabin", title: "Minister of Defense", organisationName: "Government of Israel", startDate: "1984-09-13", endDate: "1990-03-15", isCurrent: false },
  { id: 17, personId: "yitzhak-rabin", title: "5th Prime Minister of Israel (2nd Tenure)", organisationName: "Government of Israel", startDate: "1992-07-13", endDate: "1995-11-04", isCurrent: false },

  // Shimon Peres
  { id: 18, personId: "shimon-peres", title: "Prime Minister of Israel (1st Tenure)", organisationName: "Government of Israel", startDate: "1984-09-13", endDate: "1986-10-20", isCurrent: false },
  { id: 19, personId: "shimon-peres", title: "Minister of Foreign Affairs", organisationName: "Government of Israel", startDate: "1992-07-13", endDate: "1995-11-22", isCurrent: false },
  { id: 20, personId: "shimon-peres", title: "Prime Minister of Israel (2nd Tenure)", organisationName: "Government of Israel", startDate: "1995-11-22", endDate: "1996-06-18", isCurrent: false },
  { id: 21, personId: "shimon-peres", title: "9th President of Israel", organisationName: "State of Israel", startDate: "2007-07-15", endDate: "2014-07-24", isCurrent: false },

  // Avigdor Lieberman
  { id: 22, personId: "avigdor-lieberman", title: "Leader of Yisrael Beiteinu", organisationName: "Yisrael Beiteinu", startDate: "1999-01-03", endDate: null, isCurrent: true },
  { id: 23, personId: "avigdor-lieberman", title: "Minister of Foreign Affairs", organisationName: "Government of Israel", startDate: "2009-03-31", endDate: "2015-05-14", isCurrent: false },
  { id: 24, personId: "avigdor-lieberman", title: "Minister of Defense", organisationName: "Government of Israel", startDate: "2016-05-30", endDate: "2018-11-18", isCurrent: false },

  // Sir Keir Starmer
  { id: 25, personId: "keir-starmer", title: "Director of Public Prosecutions (England and Wales)", organisationName: "Crown Prosecution Service", startDate: "2008-11-01", endDate: "2013-11-01", isCurrent: false },
  { id: 26, personId: "keir-starmer", title: "Leader of the Labour Party", organisationName: "Labour Party", startDate: "2020-04-04", endDate: null, isCurrent: true },
  { id: 27, personId: "keir-starmer", title: "Prime Minister of the United Kingdom", organisationName: "Government of the United Kingdom", startDate: "2024-07-05", endDate: null, isCurrent: true },

  // Tony Blair
  { id: 28, personId: "tony-blair", title: "Leader of the Labour Party", organisationName: "Labour Party", startDate: "1994-07-21", endDate: "2007-06-24", isCurrent: false },
  { id: 29, personId: "tony-blair", title: "Prime Minister of the United Kingdom", organisationName: "Government of the United Kingdom", startDate: "1997-05-02", endDate: "2007-06-27", isCurrent: false },
  { id: 30, personId: "tony-blair", title: "Quartet Special Envoy to the Middle East", organisationName: "Middle East Quartet", startDate: "2007-06-27", endDate: "2015-05-27", isCurrent: false },

  // Barack Obama
  { id: 31, personId: "barack-obama", title: "United States Senator for Illinois", organisationName: "United States Senate", startDate: "2005-01-03", endDate: "2008-11-16", isCurrent: false },
  { id: 32, personId: "barack-obama", title: "44th President of the United States", organisationName: "United States Government", startDate: "2009-01-20", endDate: "2017-01-20", isCurrent: false },

  // Donald Trump
  { id: 33, personId: "donald-trump", title: "45th President of the United States", organisationName: "United States Government", startDate: "2017-01-20", endDate: "2021-01-20", isCurrent: false },
  { id: 34, personId: "donald-trump", title: "47th President of the United States", organisationName: "United States Government", startDate: "2025-01-20", endDate: null, isCurrent: true },

  // Joe Biden
  { id: 35, personId: "joe-biden", title: "United States Senator for Delaware", organisationName: "United States Senate", startDate: "1973-01-03", endDate: "2009-01-15", isCurrent: false },
  { id: 36, personId: "joe-biden", title: "Chairman of Senate Foreign Relations Committee", organisationName: "United States Senate", startDate: "2001-06-06", endDate: "2003-01-03", isCurrent: false },
  { id: 37, personId: "joe-biden", title: "47th Vice President of the United States", organisationName: "United States Government", startDate: "2009-01-20", endDate: "2017-01-20", isCurrent: false },
  { id: 38, personId: "joe-biden", title: "46th President of the United States", organisationName: "United States Government", startDate: "2021-01-20", endDate: "2025-01-20", isCurrent: false }
];
