/**
 * REWIND EVIDENCE ATLAS — CANONICAL SEED REGISTER: OFFICIAL ROLES
 *
 * Forensically documented constitutional, governmental, military, and diplomatic roles.
 * Note on Relational Invariants & ID Management:
 * - OfficialRoleSeed.id is typed as an integer (number) for direct 1:1 parity with
 *   PostgreSQL public.person_roles (id serial PRIMARY KEY) across database migrations and syncs.
 * - In PostgreSQL, the 'serial' pseudo-type uses an underlying sequence ('person_roles_id_seq').
 *   When static seed IDs are upserted, sync scripts synchronize the sequence via
 *   `SELECT setval(pg_get_serial_sequence('public.person_roles', 'id'), COALESCE(max(id), 1) + 1, false) FROM public.person_roles;`
 *   to ensure auto-generated IDs never collide with statically defined seeds.
 * - All seed IDs are verified for strict uniqueness in automated test suites.
 */
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

  // 1. Benjamin Netanyahu
  { id: 1, personId: "benjamin-netanyahu", title: "Permanent Representative of Israel to the United Nations", organisationName: "United Nations", startDate: "1984-01-01", endDate: "1988-01-01", isCurrent: false },
  { id: 2, personId: "benjamin-netanyahu", title: "Chairman of Likud Party", organisationName: "Likud Party", startDate: "1993-03-25", endDate: "1999-07-06", isCurrent: false },
  { id: 3, personId: "benjamin-netanyahu", title: "Prime Minister of Israel (1st Tenure)", organisationName: "Government of Israel", startDate: "1996-06-18", endDate: "1999-07-06", isCurrent: false },
  { id: 4, personId: "benjamin-netanyahu", title: "Minister of Foreign Affairs", organisationName: "Government of Israel", startDate: "2002-11-06", endDate: "2003-02-28", isCurrent: false },
  { id: 5, personId: "benjamin-netanyahu", title: "Minister of Finance", organisationName: "Government of Israel", startDate: "2003-02-28", endDate: "2005-08-09", isCurrent: false },
  { id: 6, personId: "benjamin-netanyahu", title: "Chairman of Likud Party", organisationName: "Likud Party", startDate: "2005-12-20", endDate: null, isCurrent: true },
  { id: 7, personId: "benjamin-netanyahu", title: "Prime Minister of Israel (2nd Tenure)", organisationName: "Government of Israel", startDate: "2009-03-31", endDate: "2021-06-13", isCurrent: false },
  { id: 8, personId: "benjamin-netanyahu", title: "Prime Minister of Israel (3rd Tenure)", organisationName: "Government of Israel", startDate: "2022-12-29", endDate: null, isCurrent: true },
  { id: 42, personId: "benjamin-netanyahu", title: "Member of the Knesset", organisationName: "The Knesset", startDate: "1988-11-21", endDate: null, isCurrent: true },
  { id: 43, personId: "benjamin-netanyahu", title: "Leader of the Opposition", organisationName: "The Knesset", startDate: "2006-05-04", endDate: "2009-03-31", isCurrent: false },

  // 2. Ehud Barak
  { id: 9, personId: "ehud-barak", title: "14th Chief of General Staff of the IDF", organisationName: "Israel Defense Forces", startDate: "1991-04-01", endDate: "1995-01-01", isCurrent: false },
  { id: 10, personId: "ehud-barak", title: "Minister of Foreign Affairs", organisationName: "Government of Israel", startDate: "1995-11-22", endDate: "1996-06-18", isCurrent: false },
  { id: 11, personId: "ehud-barak", title: "10th Prime Minister of Israel", organisationName: "Government of Israel", startDate: "1999-07-06", endDate: "2001-03-07", isCurrent: false },
  { id: 12, personId: "ehud-barak", title: "Minister of Defense", organisationName: "Government of Israel", startDate: "2007-06-18", endDate: "2013-03-18", isCurrent: false },

  // 3. Yitzhak Rabin
  { id: 13, personId: "yitzhak-rabin", title: "7th Chief of General Staff of the IDF", organisationName: "Israel Defense Forces", startDate: "1964-01-01", endDate: "1968-01-01", isCurrent: false },
  { id: 14, personId: "yitzhak-rabin", title: "Israeli Ambassador to the United States", organisationName: "Ministry of Foreign Affairs", startDate: "1968-02-01", endDate: "1973-03-01", isCurrent: false },
  { id: 15, personId: "yitzhak-rabin", title: "5th Prime Minister of Israel (1st Tenure)", organisationName: "Government of Israel", startDate: "1974-06-03", endDate: "1977-06-20", isCurrent: false },
  { id: 16, personId: "yitzhak-rabin", title: "Minister of Defense", organisationName: "Government of Israel", startDate: "1984-09-13", endDate: "1990-03-15", isCurrent: false },
  { id: 17, personId: "yitzhak-rabin", title: "5th Prime Minister of Israel (2nd Tenure)", organisationName: "Government of Israel", startDate: "1992-07-13", endDate: "1995-11-04", isCurrent: false },

  // 4. Shimon Peres
  { id: 44, personId: "shimon-peres", title: "Director-General of Ministry of Defense", organisationName: "Ministry of Defense", startDate: "1953-01-01", endDate: "1959-11-01", isCurrent: false },
  { id: 18, personId: "shimon-peres", title: "Prime Minister of Israel (1st Tenure)", organisationName: "Government of Israel", startDate: "1984-09-13", endDate: "1986-10-20", isCurrent: false },
  { id: 19, personId: "shimon-peres", title: "Minister of Foreign Affairs", organisationName: "Government of Israel", startDate: "1992-07-13", endDate: "1995-11-22", isCurrent: false },
  { id: 20, personId: "shimon-peres", title: "Prime Minister of Israel (2nd Tenure)", organisationName: "Government of Israel", startDate: "1995-11-22", endDate: "1996-06-18", isCurrent: false },
  { id: 21, personId: "shimon-peres", title: "9th President of Israel", organisationName: "State of Israel", startDate: "2007-07-15", endDate: "2014-07-24", isCurrent: false },

  // 5. Avigdor Lieberman
  { id: 45, personId: "avigdor-lieberman", title: "Director-General of Prime Minister's Office", organisationName: "Prime Minister's Office", startDate: "1996-06-18", endDate: "1997-12-01", isCurrent: false },
  { id: 22, personId: "avigdor-lieberman", title: "Leader of Yisrael Beiteinu", organisationName: "Yisrael Beiteinu", startDate: "1999-01-03", endDate: null, isCurrent: true },
  { id: 23, personId: "avigdor-lieberman", title: "Minister of Foreign Affairs", organisationName: "Government of Israel", startDate: "2009-03-31", endDate: "2015-05-14", isCurrent: false },
  { id: 24, personId: "avigdor-lieberman", title: "Minister of Defense", organisationName: "Government of Israel", startDate: "2016-05-30", endDate: "2018-11-18", isCurrent: false },
  { id: 46, personId: "avigdor-lieberman", title: "Minister of Finance", organisationName: "Government of Israel", startDate: "2021-06-13", endDate: "2022-12-29", isCurrent: false },

  // 6. Ron Dermer
  { id: 47, personId: "ron-dermer", title: "Senior Advisor to the Prime Minister", organisationName: "Prime Minister's Office", startDate: "2009-03-31", endDate: "2013-05-01", isCurrent: false },
  { id: 48, personId: "ron-dermer", title: "Israeli Ambassador to the United States", organisationName: "Ministry of Foreign Affairs", startDate: "2013-07-09", endDate: "2021-01-20", isCurrent: false },
  { id: 49, personId: "ron-dermer", title: "Minister of Strategic Affairs", organisationName: "Government of Israel", startDate: "2022-12-29", endDate: null, isCurrent: true },

  // 7. Mahmoud Abbas
  { id: 50, personId: "mahmoud-abbas", title: "1st Prime Minister of the Palestinian National Authority", organisationName: "Palestinian National Authority", startDate: "2003-03-19", endDate: "2003-09-06", isCurrent: false },
  { id: 51, personId: "mahmoud-abbas", title: "Chairman of the Executive Committee", organisationName: "Palestine Liberation Organization", startDate: "2004-11-11", endDate: null, isCurrent: true },
  { id: 52, personId: "mahmoud-abbas", title: "President of the State of Palestine", organisationName: "State of Palestine", startDate: "2005-01-15", endDate: null, isCurrent: true },

  // 8. Yasser Arafat
  { id: 53, personId: "yasser-arafat", title: "Chairman of the Palestine Liberation Organization", organisationName: "Palestine Liberation Organization", startDate: "1969-02-04", endDate: "2004-11-11", isCurrent: false },
  { id: 54, personId: "yasser-arafat", title: "1st President of the Palestinian National Authority", organisationName: "Palestinian National Authority", startDate: "1994-07-05", endDate: "2004-11-11", isCurrent: false },

  // 9. Saeb Erekat
  { id: 55, personId: "saeb-erekat", title: "Head of Negotiations Affairs Department", organisationName: "Palestinian National Authority", startDate: "1994-05-01", endDate: "2020-11-10", isCurrent: false },
  { id: 56, personId: "saeb-erekat", title: "Secretary-General of the Executive Committee", organisationName: "Palestine Liberation Organization", startDate: "2015-07-01", endDate: "2020-11-10", isCurrent: false },

  // 10. Ismail Haniyeh
  { id: 57, personId: "ismail-haniyeh", title: "Prime Minister of the Palestinian National Authority", organisationName: "Palestinian National Authority", startDate: "2006-02-19", endDate: "2014-06-02", isCurrent: false },
  { id: 58, personId: "ismail-haniyeh", title: "Chairman of the Hamas Political Bureau", organisationName: "Hamas", startDate: "2017-05-06", endDate: "2024-07-31", isCurrent: false },

  // 11. Khaled Mashal
  { id: 59, personId: "khaled-mashal", title: "Chairman of the Hamas Political Bureau", organisationName: "Hamas", startDate: "1996-01-01", endDate: "2017-05-06", isCurrent: false },
  { id: 60, personId: "khaled-mashal", title: "Head of Hamas Diaspora Office", organisationName: "Hamas", startDate: "2021-04-12", endDate: null, isCurrent: true },

  // 12. Marwan Barghouti
  { id: 61, personId: "marwan-barghouti", title: "Secretary-General of Fatah in the West Bank", organisationName: "Fatah", startDate: "1994-01-01", endDate: "2002-04-15", isCurrent: false },
  { id: 62, personId: "marwan-barghouti", title: "Member of the Palestinian Legislative Council", organisationName: "Palestinian Legislative Council", startDate: "1996-01-20", endDate: null, isCurrent: true },

  // 13. Joe Biden
  { id: 35, personId: "joe-biden", title: "United States Senator for Delaware", organisationName: "United States Senate", startDate: "1973-01-03", endDate: "2009-01-15", isCurrent: false },
  { id: 63, personId: "joe-biden", title: "Chairman of Senate Judiciary Committee", organisationName: "United States Senate", startDate: "1987-01-03", endDate: "1995-01-03", isCurrent: false },
  { id: 36, personId: "joe-biden", title: "Chairman of Senate Foreign Relations Committee", organisationName: "United States Senate", startDate: "2001-06-06", endDate: "2003-01-03", isCurrent: false },
  { id: 37, personId: "joe-biden", title: "47th Vice President of the United States", organisationName: "United States Government", startDate: "2009-01-20", endDate: "2017-01-20", isCurrent: false },
  { id: 38, personId: "joe-biden", title: "46th President of the United States", organisationName: "United States Government", startDate: "2021-01-20", endDate: "2025-01-20", isCurrent: false },

  // 14. Donald Trump
  { id: 64, personId: "donald-trump", title: "President of The Trump Organization", organisationName: "The Trump Organization", startDate: "1971-01-01", endDate: "2017-01-20", isCurrent: false },
  { id: 33, personId: "donald-trump", title: "45th President of the United States", organisationName: "United States Government", startDate: "2017-01-20", endDate: "2021-01-20", isCurrent: false },
  { id: 34, personId: "donald-trump", title: "47th President of the United States", organisationName: "United States Government", startDate: "2025-01-20", endDate: null, isCurrent: true },

  // 15. Barack Obama
  { id: 65, personId: "barack-obama", title: "Illinois State Senator (13th District)", organisationName: "Illinois Senate", startDate: "1997-01-08", endDate: "2004-11-04", isCurrent: false },
  { id: 31, personId: "barack-obama", title: "United States Senator for Illinois", organisationName: "United States Senate", startDate: "2005-01-03", endDate: "2008-11-16", isCurrent: false },
  { id: 32, personId: "barack-obama", title: "44th President of the United States", organisationName: "United States Government", startDate: "2009-01-20", endDate: "2017-01-20", isCurrent: false },

  // 16. Bill Clinton
  { id: 66, personId: "bill-clinton", title: "Attorney General of Arkansas", organisationName: "State of Arkansas", startDate: "1977-01-03", endDate: "1979-01-09", isCurrent: false },
  { id: 67, personId: "bill-clinton", title: "Governor of Arkansas", organisationName: "State of Arkansas", startDate: "1979-01-09", endDate: "1992-12-12", isCurrent: false },
  { id: 68, personId: "bill-clinton", title: "42nd President of the United States", organisationName: "United States Government", startDate: "1993-01-20", endDate: "2001-01-20", isCurrent: false },
  { id: 69, personId: "bill-clinton", title: "United Nations Special Envoy for Haiti", organisationName: "United Nations", startDate: "2009-05-19", endDate: "2012-12-31", isCurrent: false },

  // 17. Hillary Clinton
  { id: 70, personId: "hillary-clinton", title: "First Lady of the United States", organisationName: "United States Government", startDate: "1993-01-20", endDate: "2001-01-20", isCurrent: false },
  { id: 71, personId: "hillary-clinton", title: "United States Senator for New York", organisationName: "United States Senate", startDate: "2001-01-03", endDate: "2009-01-21", isCurrent: false },
  { id: 72, personId: "hillary-clinton", title: "67th United States Secretary of State", organisationName: "United States Department of State", startDate: "2009-01-21", endDate: "2013-02-01", isCurrent: false },
  { id: 73, personId: "hillary-clinton", title: "Democratic Presidential Nominee", organisationName: "Democratic National Committee", startDate: "2016-07-26", endDate: "2016-11-09", isCurrent: false },

  // 18. Kamala Harris
  { id: 74, personId: "kamala-harris", title: "District Attorney of San Francisco", organisationName: "City and County of San Francisco", startDate: "2004-01-08", endDate: "2011-01-03", isCurrent: false },
  { id: 75, personId: "kamala-harris", title: "32nd Attorney General of California", organisationName: "State of California", startDate: "2011-01-03", endDate: "2017-01-03", isCurrent: false },
  { id: 76, personId: "kamala-harris", title: "United States Senator for California", organisationName: "United States Senate", startDate: "2017-01-03", endDate: "2021-01-18", isCurrent: false },
  { id: 77, personId: "kamala-harris", title: "49th Vice President of the United States", organisationName: "United States Government", startDate: "2021-01-20", endDate: "2025-01-20", isCurrent: false },

  // 19. Dick Cheney
  { id: 78, personId: "dick-cheney", title: "White House Chief of Staff", organisationName: "Executive Office of the President", startDate: "1975-11-20", endDate: "1977-01-20", isCurrent: false },
  { id: 79, personId: "dick-cheney", title: "United States Representative for Wyoming", organisationName: "United States House of Representatives", startDate: "1979-01-03", endDate: "1989-03-20", isCurrent: false },
  { id: 80, personId: "dick-cheney", title: "17th United States Secretary of Defense", organisationName: "United States Department of Defense", startDate: "1989-03-21", endDate: "1993-01-20", isCurrent: false },
  { id: 81, personId: "dick-cheney", title: "46th Vice President of the United States", organisationName: "United States Government", startDate: "2001-01-20", endDate: "2009-01-20", isCurrent: false },

  // 20. Mike Pompeo
  { id: 82, personId: "mike-pompeo", title: "United States Representative for Kansas (4th District)", organisationName: "United States House of Representatives", startDate: "2011-01-03", endDate: "2017-01-23", isCurrent: false },
  { id: 83, personId: "mike-pompeo", title: "6th Director of the Central Intelligence Agency", organisationName: "Central Intelligence Agency", startDate: "2017-01-23", endDate: "2018-04-26", isCurrent: false },
  { id: 84, personId: "mike-pompeo", title: "70th United States Secretary of State", organisationName: "United States Department of State", startDate: "2018-04-26", endDate: "2021-01-20", isCurrent: false },

  // 21. Nancy Pelosi
  { id: 85, personId: "nancy-pelosi", title: "United States Representative for California", organisationName: "United States House of Representatives", startDate: "1987-06-02", endDate: null, isCurrent: true },
  { id: 86, personId: "nancy-pelosi", title: "House Minority Leader", organisationName: "United States House of Representatives", startDate: "2003-01-03", endDate: "2007-01-03", isCurrent: false },
  { id: 87, personId: "nancy-pelosi", title: "52nd Speaker of the United States House of Representatives", organisationName: "United States House of Representatives", startDate: "2007-01-04", endDate: "2011-01-03", isCurrent: false },
  { id: 88, personId: "nancy-pelosi", title: "Speaker of the United States House of Representatives (2nd Tenure)", organisationName: "United States House of Representatives", startDate: "2019-01-03", endDate: "2023-01-03", isCurrent: false },

  // 22. Chuck Schumer
  { id: 89, personId: "chuck-schumer", title: "United States Representative for New York", organisationName: "United States House of Representatives", startDate: "1981-01-03", endDate: "1999-01-03", isCurrent: false },
  { id: 90, personId: "chuck-schumer", title: "United States Senator for New York", organisationName: "United States Senate", startDate: "1999-01-03", endDate: null, isCurrent: true },
  { id: 91, personId: "chuck-schumer", title: "Senate Minority Leader", organisationName: "United States Senate", startDate: "2017-01-03", endDate: "2021-01-20", isCurrent: false },
  { id: 92, personId: "chuck-schumer", title: "Senate Majority Leader", organisationName: "United States Senate", startDate: "2021-01-20", endDate: "2025-01-03", isCurrent: false },

  // 23. Mitch McConnell
  { id: 93, personId: "mitch-mcconnell", title: "Judge-Executive of Jefferson County, Kentucky", organisationName: "Jefferson County Government", startDate: "1978-01-02", endDate: "1985-01-02", isCurrent: false },
  { id: 94, personId: "mitch-mcconnell", title: "United States Senator for Kentucky", organisationName: "United States Senate", startDate: "1985-01-03", endDate: null, isCurrent: true },
  { id: 95, personId: "mitch-mcconnell", title: "Senate Republican Leader", organisationName: "United States Senate", startDate: "2007-01-03", endDate: "2025-01-03", isCurrent: false },
  { id: 96, personId: "mitch-mcconnell", title: "Senate Majority Leader", organisationName: "United States Senate", startDate: "2015-01-03", endDate: "2021-01-20", isCurrent: false },

  // 24. Bernie Sanders
  { id: 97, personId: "bernie-sanders", title: "Mayor of Burlington, Vermont", organisationName: "City of Burlington", startDate: "1981-04-06", endDate: "1989-04-03", isCurrent: false },
  { id: 98, personId: "bernie-sanders", title: "United States Representative for Vermont", organisationName: "United States House of Representatives", startDate: "1991-01-03", endDate: "2007-01-03", isCurrent: false },
  { id: 99, personId: "bernie-sanders", title: "United States Senator for Vermont", organisationName: "United States Senate", startDate: "2007-01-03", endDate: null, isCurrent: true },
  { id: 100, personId: "bernie-sanders", title: "Chairman of Senate Budget Committee", organisationName: "United States Senate", startDate: "2021-02-03", endDate: "2023-01-03", isCurrent: false },
  { id: 101, personId: "bernie-sanders", title: "Chairman of Senate HELP Committee", organisationName: "United States Senate", startDate: "2023-01-03", endDate: null, isCurrent: true },

  // 25. Thomas Massie
  { id: 102, personId: "thomas-massie", title: "Judge-Executive of Lewis County, Kentucky", organisationName: "Lewis County Fiscal Court", startDate: "2011-01-03", endDate: "2012-11-06", isCurrent: false },
  { id: 103, personId: "thomas-massie", title: "United States Representative for Kentucky (4th District)", organisationName: "United States House of Representatives", startDate: "2012-11-06", endDate: null, isCurrent: true },

  // 26. Randy Fine
  { id: 104, personId: "randy-fine", title: "Member of the Florida House of Representatives", organisationName: "Florida House of Representatives", startDate: "2016-11-08", endDate: "2024-11-05", isCurrent: false },
  { id: 105, personId: "randy-fine", title: "Member of the Florida Senate", organisationName: "Florida Senate", startDate: "2024-11-05", endDate: null, isCurrent: true },

  // 27. Jared Kushner
  { id: 106, personId: "jared-kushner", title: "Chief Executive Officer of Kushner Companies", organisationName: "Kushner Companies", startDate: "2008-01-01", endDate: "2017-01-19", isCurrent: false },
  { id: 107, personId: "jared-kushner", title: "Senior Advisor to the President", organisationName: "The White House", startDate: "2017-01-20", endDate: "2021-01-20", isCurrent: false },
  { id: 108, personId: "jared-kushner", title: "Director of the Office of American Innovation", organisationName: "Executive Office of the President", startDate: "2017-03-27", endDate: "2021-01-20", isCurrent: false },
  { id: 109, personId: "jared-kushner", title: "Founder and CEO of Affinity Partners", organisationName: "Affinity Partners", startDate: "2021-06-01", endDate: null, isCurrent: true },

  // 28. Sir Keir Starmer
  { id: 25, personId: "keir-starmer", title: "Director of Public Prosecutions (England and Wales)", organisationName: "Crown Prosecution Service", startDate: "2008-11-01", endDate: "2013-11-01", isCurrent: false },
  { id: 110, personId: "keir-starmer", title: "Member of Parliament for Holborn and St Pancras", organisationName: "UK House of Commons", startDate: "2015-05-07", endDate: null, isCurrent: true },
  { id: 26, personId: "keir-starmer", title: "Leader of the Labour Party", organisationName: "Labour Party", startDate: "2020-04-04", endDate: null, isCurrent: true },
  { id: 27, personId: "keir-starmer", title: "Prime Minister of the United Kingdom", organisationName: "Government of the United Kingdom", startDate: "2024-07-05", endDate: null, isCurrent: true },

  // 29. Tony Blair
  { id: 111, personId: "tony-blair", title: "Member of Parliament for Sedgefield", organisationName: "UK House of Commons", startDate: "1983-06-09", endDate: "2007-06-27", isCurrent: false },
  { id: 28, personId: "tony-blair", title: "Leader of the Labour Party", organisationName: "Labour Party", startDate: "1994-07-21", endDate: "2007-06-24", isCurrent: false },
  { id: 29, personId: "tony-blair", title: "Prime Minister of the United Kingdom", organisationName: "Government of the United Kingdom", startDate: "1997-05-02", endDate: "2007-06-27", isCurrent: false },
  { id: 30, personId: "tony-blair", title: "Quartet Special Envoy to the Middle East", organisationName: "Middle East Quartet", startDate: "2007-06-27", endDate: "2015-05-27", isCurrent: false },

  // 30. Jeremy Corbyn
  { id: 112, personId: "jeremy-corbyn", title: "Member of Parliament for Islington North", organisationName: "UK House of Commons", startDate: "1983-06-09", endDate: null, isCurrent: true },
  { id: 113, personId: "jeremy-corbyn", title: "Leader of the Labour Party", organisationName: "Labour Party", startDate: "2015-09-12", endDate: "2020-04-04", isCurrent: false },
  { id: 114, personId: "jeremy-corbyn", title: "Leader of Her Majesty's Most Loyal Opposition", organisationName: "UK Parliament", startDate: "2015-09-12", endDate: "2020-04-04", isCurrent: false },

  // 31. George Galloway
  { id: 115, personId: "george-galloway", title: "Member of Parliament for Glasgow Hillhead", organisationName: "UK House of Commons", startDate: "1987-06-11", endDate: "1997-05-01", isCurrent: false },
  { id: 116, personId: "george-galloway", title: "Member of Parliament for Bethnal Green and Bow", organisationName: "UK House of Commons", startDate: "2005-05-05", endDate: "2010-05-06", isCurrent: false },
  { id: 117, personId: "george-galloway", title: "Member of Parliament for Bradford West", organisationName: "UK House of Commons", startDate: "2012-03-29", endDate: "2015-05-07", isCurrent: false },
  { id: 118, personId: "george-galloway", title: "Leader of the Workers Party of Britain", organisationName: "Workers Party of Britain", startDate: "2019-12-14", endDate: null, isCurrent: true },

  // 32. Ken Livingstone
  { id: 119, personId: "ken-livingstone", title: "Leader of the Greater London Council", organisationName: "Greater London Council", startDate: "1981-05-08", endDate: "1986-03-31", isCurrent: false },
  { id: 120, personId: "ken-livingstone", title: "Member of Parliament for Brent East", organisationName: "UK House of Commons", startDate: "1987-06-11", endDate: "2001-06-07", isCurrent: false },
  { id: 121, personId: "ken-livingstone", title: "1st Mayor of London", organisationName: "Greater London Authority", startDate: "2000-05-04", endDate: "2008-05-04", isCurrent: false },

  // 33. Jack Straw
  { id: 122, personId: "jack-straw", title: "Secretary of State for the Home Department", organisationName: "Home Office", startDate: "1997-05-02", endDate: "2001-06-08", isCurrent: false },
  { id: 123, personId: "jack-straw", title: "Secretary of State for Foreign and Commonwealth Affairs", organisationName: "Foreign and Commonwealth Office", startDate: "2001-06-08", endDate: "2006-05-05", isCurrent: false },
  { id: 124, personId: "jack-straw", title: "Leader of the House of Commons", organisationName: "UK House of Commons", startDate: "2006-05-05", endDate: "2007-06-27", isCurrent: false },
  { id: 125, personId: "jack-straw", title: "Lord Chancellor and Secretary of State for Justice", organisationName: "Ministry of Justice", startDate: "2007-06-28", endDate: "2010-05-11", isCurrent: false },

  // 34. Elon Musk
  { id: 126, personId: "elon-musk", title: "CEO and Chief Engineer of SpaceX", organisationName: "Space Exploration Technologies Corp.", startDate: "2002-05-06", endDate: null, isCurrent: true },
  { id: 127, personId: "elon-musk", title: "Chief Executive Officer of Tesla", organisationName: "Tesla, Inc.", startDate: "2008-10-15", endDate: null, isCurrent: true },
  { id: 128, personId: "elon-musk", title: "Chief Technology Officer of X", organisationName: "X Corp.", startDate: "2022-10-27", endDate: null, isCurrent: true },
  { id: 129, personId: "elon-musk", title: "Co-Lead of US Department of Government Efficiency (DOGE)", organisationName: "Executive Office of the President", startDate: "2025-01-20", endDate: null, isCurrent: true },

  // 35. Michael Bloomberg
  { id: 130, personId: "michael-bloomberg", title: "Chief Executive Officer of Bloomberg L.P.", organisationName: "Bloomberg L.P.", startDate: "1981-10-01", endDate: null, isCurrent: true },
  { id: 131, personId: "michael-bloomberg", title: "108th Mayor of New York City", organisationName: "City of New York", startDate: "2002-01-01", endDate: "2013-12-31", isCurrent: false },
  { id: 132, personId: "michael-bloomberg", title: "UN Special Envoy on Climate Ambition and Solutions", organisationName: "United Nations", startDate: "2014-01-31", endDate: null, isCurrent: true },

  // 36. Larry King
  { id: 133, personId: "larry-king", title: "Host of Larry King Live", organisationName: "Cable News Network (CNN)", startDate: "1985-06-03", endDate: "2010-12-16", isCurrent: false },
  { id: 134, personId: "larry-king", title: "Host of Larry King Now", organisationName: "Ora TV", startDate: "2012-07-17", endDate: "2020-02-14", isCurrent: false },

  // 37. Barbara Walters
  { id: 135, personId: "barbara-walters", title: "Co-host of Today", organisationName: "NBC News", startDate: "1974-04-10", endDate: "1976-06-04", isCurrent: false },
  { id: 136, personId: "barbara-walters", title: "Co-anchor of ABC Evening News", organisationName: "ABC News", startDate: "1976-10-04", endDate: "1978-06-01", isCurrent: false },
  { id: 137, personId: "barbara-walters", title: "Co-host of 20/20", organisationName: "ABC News", startDate: "1979-05-31", endDate: "2004-05-02", isCurrent: false },
  { id: 138, personId: "barbara-walters", title: "Executive Producer and Co-host of The View", organisationName: "ABC Entertainment", startDate: "1997-08-11", endDate: "2014-05-16", isCurrent: false },

  // 38. Christiane Amanpour
  { id: 139, personId: "christiane-amanpour", title: "Chief International Anchor", organisationName: "CNN International", startDate: "1992-01-01", endDate: null, isCurrent: true },
  { id: 140, personId: "christiane-amanpour", title: "Anchor of Amanpour & Company", organisationName: "PBS & CNN", startDate: "2018-09-10", endDate: null, isCurrent: true },

  // 39. Tucker Carlson
  { id: 141, personId: "tucker-carlson", title: "Co-host of Crossfire", organisationName: "CNN", startDate: "2001-01-01", endDate: "2005-01-06", isCurrent: false },
  { id: 142, personId: "tucker-carlson", title: "Editor-in-Chief of The Daily Caller", organisationName: "The Daily Caller", startDate: "2010-01-11", endDate: "2020-06-10", isCurrent: false },
  { id: 143, personId: "tucker-carlson", title: "Host of Tucker Carlson Tonight", organisationName: "Fox News Channel", startDate: "2016-11-14", endDate: "2023-04-24", isCurrent: false },
  { id: 144, personId: "tucker-carlson", title: "Founder and Host of Tucker Carlson Network", organisationName: "Tucker Carlson Network", startDate: "2023-12-11", endDate: null, isCurrent: true },

  // 40. Candace Owens
  { id: 145, personId: "candace-owens", title: "Director of Communications", organisationName: "Turning Point USA", startDate: "2017-11-21", endDate: "2019-05-01", isCurrent: false },
  { id: 146, personId: "candace-owens", title: "Host of Candace", organisationName: "The Daily Wire", startDate: "2021-03-19", endDate: "2024-03-22", isCurrent: false },
  { id: 147, personId: "candace-owens", title: "Independent Host of Candace Podcast", organisationName: "Candace Owens Media", startDate: "2024-04-01", endDate: null, isCurrent: true },

  // 41. Charlie Kirk
  { id: 148, personId: "charlie-kirk", title: "Founder and Chief Executive Officer", organisationName: "Turning Point USA", startDate: "2012-06-05", endDate: null, isCurrent: true },
  { id: 149, personId: "charlie-kirk", title: "President of Turning Point Action", organisationName: "Turning Point Action", startDate: "2019-05-01", endDate: null, isCurrent: true },

  // 42. Ben Shapiro
  { id: 150, personId: "ben-shapiro", title: "Editor-at-Large of Breitbart News", organisationName: "Breitbart News", startDate: "2012-02-01", endDate: "2016-03-14", isCurrent: false },
  { id: 151, personId: "ben-shapiro", title: "Editor Emeritus of The Daily Wire", organisationName: "The Daily Wire", startDate: "2015-09-21", endDate: null, isCurrent: true },
  { id: 152, personId: "ben-shapiro", title: "Host of The Ben Shapiro Show", organisationName: "The Daily Wire", startDate: "2015-09-21", endDate: null, isCurrent: true },

  // 43. Andrew Neil
  { id: 153, personId: "andrew-neil", title: "Editor of The Sunday Times", organisationName: "The Sunday Times", startDate: "1983-10-01", endDate: "1994-03-01", isCurrent: false },
  { id: 154, personId: "andrew-neil", title: "Founding Chairman of Sky Television", organisationName: "Sky Television", startDate: "1988-11-01", endDate: "1990-11-01", isCurrent: false },
  { id: 155, personId: "andrew-neil", title: "Chairman of Press Holdings (The Spectator)", organisationName: "Press Holdings", startDate: "2004-07-01", endDate: "2024-09-01", isCurrent: false },
  { id: 156, personId: "andrew-neil", title: "Lead Political Presenter (Daily Politics & This Week)", organisationName: "BBC News", startDate: "2003-05-15", endDate: "2020-07-15", isCurrent: false },

  // 44. Anderson Cooper
  { id: 157, personId: "anderson-cooper", title: "Chief International Correspondent", organisationName: "Channel One News", startDate: "1990-09-01", endDate: "1994-06-01", isCurrent: false },
  { id: 158, personId: "anderson-cooper", title: "Anchor of Anderson Cooper 360°", organisationName: "CNN", startDate: "2003-09-08", endDate: null, isCurrent: true },
  { id: 159, personId: "anderson-cooper", title: "Correspondent for 60 Minutes", organisationName: "CBS News", startDate: "2006-10-01", endDate: null, isCurrent: true },

  // 45. Tom Brokaw
  { id: 160, personId: "tom-brokaw", title: "White House Correspondent", organisationName: "NBC News", startDate: "1973-08-01", endDate: "1976-08-01", isCurrent: false },
  { id: 161, personId: "tom-brokaw", title: "Co-anchor of Today", organisationName: "NBC News", startDate: "1976-08-30", endDate: "1981-12-18", isCurrent: false },
  { id: 162, personId: "tom-brokaw", title: "Sole Anchor and Managing Editor of NBC Nightly News", organisationName: "NBC News", startDate: "1982-04-05", endDate: "2004-12-01", isCurrent: false },

  // 46. Peter Jennings
  { id: 163, personId: "peter-jennings", title: "Anchor of Peter Jennings with the News", organisationName: "ABC News", startDate: "1965-02-01", endDate: "1968-02-01", isCurrent: false },
  { id: 164, personId: "peter-jennings", title: "Beirut Bureau Chief and Foreign Correspondent", organisationName: "ABC News", startDate: "1968-02-01", endDate: "1978-07-01", isCurrent: false },
  { id: 165, personId: "peter-jennings", title: "Sole Anchor and Senior Editor of World News Tonight", organisationName: "ABC News", startDate: "1983-09-05", endDate: "2005-04-05", isCurrent: false },

  // 47. Lester Holt
  { id: 166, personId: "lester-holt", title: "Co-anchor of Weekend Today", organisationName: "NBC News", startDate: "2003-05-10", endDate: "2015-06-20", isCurrent: false },
  { id: 167, personId: "lester-holt", title: "Principal Anchor of Dateline NBC", organisationName: "NBC News", startDate: "2011-09-23", endDate: null, isCurrent: true },
  { id: 168, personId: "lester-holt", title: "Sole Anchor of NBC Nightly News", organisationName: "NBC News", startDate: "2015-06-18", endDate: null, isCurrent: true },

  // 48. Diane Sawyer
  { id: 169, personId: "diane-sawyer", title: "Co-anchor of CBS Morning News", organisationName: "CBS News", startDate: "1981-09-28", endDate: "1984-09-07", isCurrent: false },
  { id: 170, personId: "diane-sawyer", title: "First Female Correspondent on 60 Minutes", organisationName: "CBS News", startDate: "1984-09-23", endDate: "1989-02-12", isCurrent: false },
  { id: 171, personId: "diane-sawyer", title: "Co-anchor of Good Morning America", organisationName: "ABC News", startDate: "1999-01-18", endDate: "2009-12-11", isCurrent: false },
  { id: 172, personId: "diane-sawyer", title: "Sole Anchor of ABC World News", organisationName: "ABC News", startDate: "2009-12-21", endDate: "2014-08-27", isCurrent: false },

  // 49. Emmanuel Macron
  { id: 173, personId: "emmanuel-macron", title: "Deputy Secretary-General of the Élysée", organisationName: "Presidency of the French Republic", startDate: "2012-05-15", endDate: "2014-07-15", isCurrent: false },
  { id: 174, personId: "emmanuel-macron", title: "Minister of Economy, Industry and Digital Affairs", organisationName: "Government of the French Republic", startDate: "2014-08-26", endDate: "2016-08-30", isCurrent: false },
  { id: 175, personId: "emmanuel-macron", title: "President of the French Republic and Co-Prince of Andorra", organisationName: "French Republic", startDate: "2017-05-14", endDate: null, isCurrent: true },

  // 50. Vladimir Putin
  { id: 176, personId: "vladimir-putin", title: "Director of the Federal Security Service (FSB)", organisationName: "Federal Security Service", startDate: "1998-07-25", endDate: "1999-08-09", isCurrent: false },
  { id: 177, personId: "vladimir-putin", title: "Prime Minister of the Russian Federation (1st Tenure)", organisationName: "Government of the Russian Federation", startDate: "1999-08-16", endDate: "2000-05-07", isCurrent: false },
  { id: 178, personId: "vladimir-putin", title: "President of the Russian Federation (1st & 2nd Tenures)", organisationName: "Russian Federation", startDate: "2000-05-07", endDate: "2008-05-07", isCurrent: false },
  { id: 179, personId: "vladimir-putin", title: "Prime Minister of the Russian Federation (2nd Tenure)", organisationName: "Government of the Russian Federation", startDate: "2008-05-08", endDate: "2012-05-07", isCurrent: false },
  { id: 180, personId: "vladimir-putin", title: "President of the Russian Federation (3rd & 4th Tenures)", organisationName: "Russian Federation", startDate: "2012-05-07", endDate: null, isCurrent: true },

  // 51. Jeffrey Epstein
  { id: 181, personId: "jeffrey-epstein", title: "Mathematics and Physics Instructor", organisationName: "The Dalton School", startDate: "1974-09-01", endDate: "1976-06-01", isCurrent: false },
  { id: 182, personId: "jeffrey-epstein", title: "Options Trader and Limited Partner", organisationName: "Bear Stearns", startDate: "1976-08-01", endDate: "1981-05-01", isCurrent: false },
  { id: 183, personId: "jeffrey-epstein", title: "President and Founder", organisationName: "J. Epstein & Co. / Financial Trust Company", startDate: "1982-01-01", endDate: "2019-07-06", isCurrent: false },
  { id: 184, personId: "jeffrey-epstein", title: "Trustee", organisationName: "Wexner Foundation", startDate: "1992-01-01", endDate: "2007-12-31", isCurrent: false },

  // Tenzin Gyatso (Dalai Lama)
  { id: 39, personId: "dalai-lama", title: "14th Dalai Lama", organisationName: "Gelug Tibetan Buddhism / Central Tibetan Administration", startDate: "1940-02-22", endDate: null, isCurrent: true },
  { id: 40, personId: "dalai-lama", title: "Head of State of Tibet", organisationName: "Government of Tibet (Lhasa)", startDate: "1950-11-17", endDate: "1959-03-31", isCurrent: false },
  { id: 41, personId: "dalai-lama", title: "Leader of Central Tibetan Administration (in exile)", organisationName: "Central Tibetan Administration", startDate: "1959-04-29", endDate: "2011-03-14", isCurrent: false }
];
