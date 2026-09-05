/**
 * ==============================================================================
 * REWIND EVIDENCE ATLAS — DEPRECATED PROTOTYPE DATASET (ARCHIVE ONLY)
 * ==============================================================================
 *
 * CRITICAL ARCHITECTURAL DIRECTIVE:
 * DO NOT import, transform, seed, copy, or automatically migrate any records from
 * this file into production Supabase.
 *
 * Canonical production data resides exclusively in PostgreSQL / Supabase and must
 * be researched and entered afresh according to REWiND Event Model v2 standards.
 *
 * All production routes retrieve data through the central data layer (@/lib/rewind).
 * No production application code or components may import from this file.
 * The authoritative archival copy is preserved at: archive/legacy-data/rewind.ts.
 * ==============================================================================
 */

export type Precision = "exact" | "day" | "month" | "year" | "range" | "unknown";
export type Verification = "verified" | "provisional" | "disputed";
export type Confidence = "confirmed" | "strong" | "moderate" | "limited";

export interface Source {
  id: string;
  title: string;
  publisher: string;
  url: string;
  sourceType: "official-record" | "archive-video" | "archive-photo" | "transcript" | "contemporary-report" | "retrospective";
  classification: "primary" | "secondary";
  originalDate?: string;
  publicationDate?: string;
  accessedDate: string;
  language: string;
}

export interface Person {
  id: string;
  slug: string;
  name: string;
  birth: string;
  death?: string;
  description: string;
}

export interface EventRecord {
  id: string;
  slug: string;
  eventName: string;
  summary: string;
  categories: string[];
  eventTypes: string[];
  startDate: string;
  endDate: string | null;
  localStartTime: string | null;
  localEndTime: string | null;
  timezone: string | null;
  datePrecision: Precision;
  timePrecision: Precision;
  platform: string | null;
  venueName: string | null;
  address: string | null;
  city: string;
  region: string | null;
  country: string;
  latitude: number | null;
  longitude: number | null;
  locationPrecision: "venue" | "city" | "country" | "unknown";
  participants: { personId: string; name: string; role: string; presenceConfidence: Confidence }[];
  organisations: string[];
  notes: string | null;
  scope: "public" | "press" | "diplomatic" | "government" | "electoral" | "religious" | "media";
  medium: string[];
  confidence: Confidence;
  verificationStatus: Verification;
  sourceIds: string[];
  quotes: { text: string; speaker: string; timestamp: string | null; language: string }[];
  media: { kind: string; label: string; url: string }[];
  provenance: string[];
  conflictingClaims: string[];
  reviewedAt: string;
}

export const people: Person[] = [
  { id: "p-netanyahu", slug: "benjamin-netanyahu", name: "Benjamin Netanyahu", birth: "1949-10-21", description: "Israeli diplomat and politician; Permanent Representative to the United Nations, Knesset member, Likud leader and prime minister during the period indexed here." },
  { id: "p-schneerson", slug: "menachem-mendel-schneerson", name: "Menachem Mendel Schneerson", birth: "1902-04-18", death: "1994-06-12", description: "Seventh Lubavitcher Rebbe and leader of the Chabad-Lubavitch movement." },
  { id: "p-clinton", slug: "bill-clinton", name: "Bill Clinton", birth: "1946-08-19", description: "President of the United States, 1993–2001." },
  { id: "p-arafat", slug: "yasser-arafat", name: "Yasser Arafat", birth: "1929-08-24", death: "2004-11-11", description: "Chairman of the Palestine Liberation Organization and President of the Palestinian Authority." },
  { id: "p-hussein", slug: "hussein-of-jordan", name: "Hussein of Jordan", birth: "1935-11-14", death: "1999-02-07", description: "King of Jordan, 1952–1999." },
  { id: "p-mubarak", slug: "hosni-mubarak", name: "Hosni Mubarak", birth: "1928-05-04", death: "2020-02-25", description: "President of Egypt, 1981–2011." },
  { id: "p-peres", slug: "shimon-peres", name: "Shimon Peres", birth: "1923-08-02", death: "2016-09-28", description: "Israeli statesman and prime minister immediately before Netanyahu’s first government." },
  { id: "p-dole", slug: "bob-dole", name: "Bob Dole", birth: "1923-07-22", death: "2021-12-05", description: "United States senator and 1996 Republican presidential nominee." },
  { id: "p-rose", slug: "charlie-rose", name: "Charlie Rose", birth: "1942-01-05", description: "American broadcast interviewer and host of the Charlie Rose program." },
  { id: "p-sharon", slug: "ariel-sharon", name: "Ariel Sharon", birth: "1928-02-26", death: "2014-01-11", description: "Israeli politician and prime minister, 2001–2006." },
  { id: "p-straw", slug: "jack-straw", name: "Jack Straw", birth: "1946-08-03", description: "British foreign secretary, 2001–2006." },
  { id: "p-ivanov", slug: "igor-ivanov", name: "Igor Ivanov", birth: "1945-09-23", description: "Russian foreign minister, 1998–2004." },
  { id: "p-giuliani", slug: "rudy-giuliani", name: "Rudy Giuliani", birth: "1944-05-28", description: "Mayor of New York City, 1994–2001, and public advocate." },
  { id: "p-olmert", slug: "ehud-olmert", name: "Ehud Olmert", birth: "1945-09-30", description: "Israeli politician and cabinet minister during the period indexed here." },
  { id: "p-fischer", slug: "stanley-fischer", name: "Stanley Fischer", birth: "1943-10-15", description: "Economist recommended in 2005 to serve as governor of the Bank of Israel." },
  { id: "p-shalom", slug: "silvan-shalom", name: "Silvan Shalom", birth: "1958-08-04", description: "Israeli politician, foreign minister and 2005 Likud leadership candidate." },
  { id: "p-trump", slug: "donald-trump", name: "Donald Trump", birth: "1946-06-14", description: "President of the United States during the 2025 events indexed here." },
  { id: "p-rubio", slug: "marco-rubio", name: "Marco Rubio", birth: "1971-05-28", description: "United States secretary of state in 2025." },
  { id: "p-faulkner", slug: "harris-faulkner", name: "Harris Faulkner", birth: "1965-10-13", description: "American television journalist and host of The Faulkner Focus." },
  { id: "p-van-susteren", slug: "greta-van-susteren", name: "Greta Van Susteren", birth: "1954-06-11", description: "American television journalist and host of The Record." },
  { id: "p-hannity", slug: "sean-hannity", name: "Sean Hannity", birth: "1961-12-30", description: "American broadcaster and host of Hannity." },
  { id: "p-levin", slug: "mark-levin", name: "Mark Levin", birth: "1957-09-21", description: "American broadcaster and host of Life, Liberty & Levin." },
  { id: "p-baier", slug: "bret-baier", name: "Bret Baier", birth: "1970-08-04", description: "American television journalist and Fox News anchor." },
  { id: "p-karl", slug: "jonathan-karl", name: "Jonathan Karl", birth: "1968-01-19", description: "American television journalist and ABC News correspondent." },
  { id: "p-herzog", slug: "isaac-herzog", name: "Isaac Herzog", birth: "1960-09-22", description: "President of Israel during the 2025 events indexed here." },
];

const sourceSeed = [
  ["un-credentials-1984", "New Permanent Representative of Israel Presents Credentials", "United Nations Digital Library", "https://digitallibrary.un.org/record/3801553", "official-record", "primary"],
  ["un-photo-1984", "Ambassador of Israel Holds Press Conference", "UN Photo", "https://media.un.org/photo/en/asset/oun7/oun7707979", "archive-photo", "primary"],
  ["chabad-1984", "Truth vs. Darkness in the United Nations", "Chabad.org / JEM", "https://www.chabad.org/therebbe/article_cdo/aid/1394394/jewish/Truth-vs-Darkness-in-the-United-Nations.htm", "retrospective", "secondary"],
  ["un-300850", "Situation in the Middle East — speech record", "United Nations Digital Library", "https://digitallibrary.un.org/record/300850", "official-record", "primary"],
  ["un-301186", "Question of Palestine — speech record", "United Nations Digital Library", "https://digitallibrary.un.org/record/301186", "official-record", "primary"],
  ["un-286881", "Lebanon situation — Security Council speech", "United Nations Digital Library", "https://digitallibrary.un.org/record/286881", "official-record", "primary"],
  ["un-photo-1985", "Israeli Ambassador Holds Press Conference", "UN Photo", "https://media.un.org/photo/en/asset/oun7/oun7707981", "archive-photo", "primary"],
  ["un-305138", "General Assembly speech record, 1 November 1985", "United Nations Digital Library", "https://digitallibrary.un.org/record/305138", "official-record", "primary"],
  ["un-308155", "General Assembly speech record, 9 December 1985", "United Nations Digital Library", "https://digitallibrary.un.org/record/308155", "official-record", "primary"],
  ["nla-1986", "Benjamin Netanyahu at the National Press Club", "National Library of Australia", "https://nla.gov.au/nla.obj-222491385", "archive-video", "primary"],
  ["firing-line-1986", "Firing Line: Terrorism", "Firing Line / YouTube", "https://www.youtube.com/watch?v=TEzi0SMCu5A", "archive-video", "primary"],
  ["un-313104", "General Assembly speech record, 21 October 1986", "United Nations Digital Library", "https://digitallibrary.un.org/record/313104", "official-record", "primary"],
  ["un-photo-1986", "Press Conference by Permanent Representative of Israel", "UN Photo", "https://media.un.org/photo/en/asset/oun7/oun7707983", "archive-photo", "primary"],
  ["un-316086", "Question of Palestine — speech record", "United Nations Digital Library", "https://digitallibrary.un.org/record/316086", "official-record", "primary"],
  ["un-317598", "Third Committee meeting record", "United Nations Digital Library", "https://digitallibrary.un.org/record/317598", "official-record", "primary"],
  ["un-316840", "Occupied territories — Security Council speech", "United Nations Digital Library", "https://digitallibrary.un.org/record/316840", "official-record", "primary"],
  ["un-321925", "General Assembly terrorism debate", "United Nations Digital Library", "https://digitallibrary.un.org/record/321925", "official-record", "primary"],
  ["un-322588", "Occupied territories — Security Council speech", "United Nations Digital Library", "https://digitallibrary.un.org/record/322588", "official-record", "primary"],
  ["jem-1988", "Don’t Be Intimidated — Living Torah 267", "Jewish Educational Media / Chabad.org", "https://www.chabad.org/therebbe/livingtorah/player_cdo/aid/1001699/jewish/Dont-Be-Intimidated.htm", "archive-video", "primary"],
  ["knesset-bio", "Benjamin Netanyahu — biographical record", "Government of Israel", "https://www.gov.il/en/pages/netanyahu-b", "official-record", "primary"],
  ["jem-1990", "Politicians for Redemption — Living Torah 292", "Jewish Educational Media / Chabad.org", "https://www.chabad.org/therebbe/livingtorah/player_cdo/aid/1161514/jewish/Politicians-for-Redemption.htm", "archive-video", "primary"],
  ["madrid-1991", "Madrid Conference of 1991", "Office of the Historian, U.S. Department of State", "https://history.state.gov/milestones/1989-1992/madrid-conference", "official-record", "secondary"],
  ["likud-1993", "Netanyahu wins Likud Party leadership", "UPI Archives", "https://www.upi.com/Archives/1993/03/25/Netanyahu-wins-Likud-Party-leadership/5414733035600/", "contemporary-report", "secondary"],
  ["charlie-rose-1993", "Benjamin Netanyahu interview", "Charlie Rose", "https://charlierose.com/videos/14612", "archive-video", "primary"],
  ["zion-1995", "Words and Deeds", "The New Yorker", "https://www.newyorker.com/magazine/2011/01/24/words-and-deeds", "retrospective", "secondary"],
  ["election-1996", "Elections in Israel 1996", "Government of Israel", "https://www.gov.il/en/pages/elections-in-israel-may-1996", "official-record", "primary"],
  ["victory-1996", "Prime Minister-elect Netanyahu victory address", "Institute for Palestine Studies", "https://www.palestine-studies.org/fr/node/40310", "transcript", "primary"],
  ["government-1996", "Presentation of Government to the Knesset", "Government of Israel", "https://www.gov.il/en/pages/pm-netanyahu-presentation-of-government-18-jun-1996", "transcript", "primary"],
  ["whitehouse-1996", "Press conference of President Clinton and Prime Minister Netanyahu", "Clinton White House Archive", "https://clintonwhitehouse6.archives.gov/1996/07/1996-07-09-press-conference-of-president-and-pm-netanyahu.html", "transcript", "primary"],
  ["congress-1996", "Israel Prime Minister Speech", "C-SPAN", "https://www.c-span.org/program/joint-session-of-congress/israel-prime-minister-speech/57632", "archive-video", "primary"],
  ["cairo-1996", "Chronological Review of Events, July 1996", "United Nations — UNISPAL", "https://www.un.org/unispal/document/auto-insert-207150/", "official-record", "secondary"],
  ["arafat-1996", "Statement on Netanyahu–Arafat meeting", "Clinton White House Archive", "https://clintonwhitehouse6.archives.gov/1996/09/1996-09-04-president-statement-on-netanyahu-arafat-meeting.html", "official-record", "primary"],
  ["summit-1996", "Remarks during the White House Middle East Summit", "American Presidency Project", "https://www.presidency.ucsb.edu/documents/remarks-during-the-white-house-middle-east-summit-and-exchange-with-reporters", "transcript", "primary"],
  ["summit-close-1996", "Middle East Peace Summit", "C-SPAN", "https://www.c-span.org/program/white-house-event/middle-east-peace-summit/59538", "archive-video", "primary"],
  ["dole-1996", "Statement following meeting with Netanyahu", "American Presidency Project", "https://www.presidency.ucsb.edu/documents/statement-senator-bob-dole-following-meeting-with-netanyahu", "transcript", "primary"],
  ["knesset-1996", "Israeli Knesset Opening Session", "C-SPAN", "https://www.c-span.org/program/international-telecasts/israeli-knesset-opening-session/59517", "archive-video", "primary"],
  ["talks-1996", "Israel’s view of current negotiations", "Government of Israel", "https://www.gov.il/en/pages/israel-s-view-of-current-negotiations-with-palestinians", "official-record", "primary"],
  ["hebron-1997", "Main points of the Protocol concerning redeployment in Hebron", "Government of Israel", "https://www.gov.il/en/pages/main-points-of-the-protocol-concerning-the-redeployment-in-hebron", "official-record", "primary"],
  ["clinton-feb-1997", "Remarks prior to discussions with Prime Minister Netanyahu", "American Presidency Project", "https://www.presidency.ucsb.edu/documents/remarks-prior-discussions-with-prime-minister-binyamin-netanyahu-israel-and-exchange-with", "transcript", "primary"],
  ["press-feb-1997", "President’s news conference with Prime Minister Netanyahu", "American Presidency Project", "https://www.presidency.ucsb.edu/documents/the-presidents-news-conference-with-prime-minister-binyamin-netanyahu-israel", "transcript", "primary"],
  ["naharayim-1997", "Prime Minister Netanyahu on shooting in Naharayim", "Government of Israel", "https://www.gov.il/en/pages/pm-netanyahu-on-shooting-in-naharayim-13-mar-1997", "transcript", "primary"],
  ["clinton-apr-1997", "Exchange prior to discussions with Prime Minister Netanyahu", "American Presidency Project", "https://www.presidency.ucsb.edu/documents/exchange-with-reporters-prior-discussions-with-prime-minister-binyamin-netanyahu-israel-0", "transcript", "primary"],
  ["cspan-apr-1997", "Middle East Peace Process news conference", "C-SPAN", "https://www.c-span.org/program/news-conference/middle-east-peace-process/63396", "archive-video", "primary"],
  ["japan-1997", "Israel Prime Minister Speech in Japan", "C-SPAN", "https://www.c-span.org/program/international-telecasts/israel-prime-minister-speech/130026", "archive-video", "primary"],
  ["oct-1997", "Chronological Review of Events, October 1997", "United Nations — UNISPAL", "https://www.un.org/unispal/document/auto-insert-210067/", "official-record", "secondary"],
  ["foreign-portfolio", "Tenure of Israel’s Foreign Ministers", "Government of Israel", "https://www.gov.il/en/pages/tenure-of-israel-s-foreign-ministers", "official-record", "primary"],
  ["cspan-jan19-1998", "Middle East Issues", "C-SPAN", "https://www.c-span.org/program/public-affairs-event/middle-east-issues/73767", "archive-video", "primary"],
  ["clinton-jan-1998", "Exchange prior to discussions with Prime Minister Netanyahu", "American Presidency Project", "https://www.presidency.ucsb.edu/documents/exchange-with-reporters-prior-discussions-with-prime-minister-binyamin-netanyahu-israel", "transcript", "primary"],
  ["npc-1998", "Middle East Peace Process — National Press Club", "C-SPAN", "https://www.c-span.org/program/national-press-club/middle-east-peace-process/145904", "archive-video", "primary"],
  ["ramadan-1998", "Ramadan — January 1998", "Government of Israel", "https://www.gov.il/en/pages/ramadan-january-1998-29-feb-2000", "official-record", "primary"],
  ["may-1998", "Chronological Review of Events, May 1998", "United Nations — UNISPAL", "https://www.un.org/unispal/document/auto-insert-197567/", "official-record", "secondary"],
  ["address-may-1998", "Israeli Prime Minister Address", "C-SPAN", "https://www.c-span.org/program/public-affairs-event/israeli-prime-minister-address/79792", "archive-video", "primary"],
  ["clinton-sep-1998", "Remarks following discussions with Netanyahu and Arafat", "American Presidency Project", "https://www.presidency.ucsb.edu/documents/remarks-following-discussions-with-prime-minister-binyamin-netanyahu-israel-and-chairman", "transcript", "primary"],
  ["wye-review", "Chronological Review of Events, October 1998", "United Nations — UNISPAL", "https://www.un.org/unispal/document/auto-insert-208108/", "official-record", "secondary"],
  ["wye-call", "Conference call with Jewish leaders", "Government of Israel", "https://www.gov.il/en/pages/prime-minister-benjamin-netanyahu-s-conference-call-with-jewish-leaders-21-oct-1998", "transcript", "primary"],
  ["wye-signing", "Remarks at the Wye River Memorandum signing ceremony", "American Presidency Project", "https://www.presidency.ucsb.edu/documents/remarks-the-wye-river-memorandum-signing-ceremony", "transcript", "primary"],
  ["wye-text", "The Wye River Memorandum", "Government of Israel", "https://www.gov.il/en/pages/the-wye-river-memorandum", "official-record", "primary"],
  ["airport-1998", "Press conference on return from Wye", "Government of Israel", "https://www.gov.il/en/pages/press-conference-with-pm-benjamin-netanyahu-25-oct-1998", "transcript", "primary"],
  ["wye-timetable", "Wye River Memorandum timetable clarification", "Government of Israel", "https://www.gov.il/en/pages/the-wye-river-memorandum-timetable-clarification-2-nov-1998", "official-record", "primary"],
  ["wye-special", "Wye River Memorandum special update", "Government of Israel", "https://www.gov.il/en/pages/wye-river-memorandum-special-update", "official-record", "primary"],
  ["knesset-nov-1998", "Israeli Prime Minister Address", "C-SPAN", "https://www.c-span.org/program/international-telecasts/israeli-prime-minister-address/87231", "archive-video", "primary"],
  ["wye-cabinet", "Cabinet consultations on Wye Memorandum", "Government of Israel", "https://www.gov.il/en/pages/cabinet-consultations-on-wye-memorandum-2-dec-1998", "official-record", "primary"],
  ["clinton-arrival", "Remarks at the arrival ceremony in Tel Aviv", "American Presidency Project", "https://www.presidency.ucsb.edu/documents/remarks-the-arrival-ceremony-tel-aviv-israel", "transcript", "primary"],
  ["clinton-dinner", "Remarks at a dinner hosted by Prime Minister Netanyahu", "American Presidency Project", "https://www.presidency.ucsb.edu/documents/remarks-dinner-hosted-prime-minister-binyamin-netanyahu-israel-jerusalem", "transcript", "primary"],
  ["clinton-digest", "Digest of other White House announcements", "American Presidency Project", "https://www.presidency.ucsb.edu/documents/digest-other-white-house-announcements-81", "official-record", "primary"],
  ["summit-dec-1998", "Press conference with Netanyahu and Sharon", "Government of Israel", "https://www.gov.il/en/pages/press-conf-pm-netanyahu-and-fm-sharon-erez-15-dec-1998", "transcript", "primary"],
  ["election-1999", "Chronological Review of Events, May 1999", "United Nations — UNISPAL", "https://www.un.org/unispal/document/auto-insert-198955/", "official-record", "secondary"],
  ["barak-1999", "Ehud Barak — biographical record", "Government of Israel", "https://www.gov.il/en/pages/ehud_barak", "official-record", "primary"],
  ["cr-1995", "Benjamin Netanyahu interview — 27 October 1995", "Charlie Rose", "https://charlierose.com/videos/16251", "archive-video", "primary"],
  ["cr-guests", "Benjamin Netanyahu — appearance index", "Charlie Rose", "https://charlierose.com/guests/1351", "archive-video", "primary"],
  ["washington-institute-1998", "Address by Israeli Prime Minister Benjamin Netanyahu", "The Washington Institute", "https://www.washingtoninstitute.org/policy-analysis/address-israeli-prime-minister", "transcript", "primary"],
  ["wired-1999", "Killings Justified", "Wired", "https://www.wired.com/1999/02/killings-justified", "contemporary-report", "secondary"],
  ["cr-2000", "Benjamin Netanyahu interview — 9 October 2000", "Charlie Rose", "https://charlierose.com/videos/5106", "archive-video", "primary"],
  ["cspan-reagan-2001", "Ronald Reagan Banquet", "C-SPAN", "https://www.c-span.org/program/public-affairs-event/ronald-reagan-banquet/105548", "archive-video", "primary"],
  ["cr-2001", "Benjamin Netanyahu interview — 21 May 2001", "Charlie Rose", "https://charlierose.com/videos/2829", "archive-video", "primary"],
  ["govinfo-terror-2001", "Preparing for the War on Terrorism", "U.S. Government Publishing Office", "https://www.govinfo.gov/content/pkg/CHRG-107hhrg77229/html/CHRG-107hhrg77229.htm", "official-record", "primary"],
  ["cspan-wj-2001", "Netanyahu — Washington Journal", "C-SPAN", "https://www.c-span.org/clip/washington-journal/netanyahu-september-21-2001-for-wj-video/5086361", "archive-video", "primary"],
  ["cspan-press-2001", "Terrorist Attacks in U.S. — news conference", "C-SPAN", "https://www.c-span.org/program/news-conference/terrorist-attacks-in-us/128358", "archive-video", "primary"],
  ["cnn-2001-12-01", "CNN Breaking News interview transcript", "CNN", "https://transcripts.cnn.com/show/bn/date/2001-12-01/segment/14", "transcript", "primary"],
  ["reuters-rally-2002", "Pro-Israel demonstration in Washington", "Reuters Connect", "https://www.reutersconnect.com/item/supporters-wave-flags-during-pro-israel-demonstration-in-washington/dGFnOnJldXRlcnMuY29tLDIwMDI6bmV3c21sX1JQM0RSSUFaSEdBQQ", "archive-photo", "primary"],
  ["cnn-congress-2002", "CNN transcript archive — 24 April 2002", "CNN", "https://transcripts.cnn.com/show/se?start_fileid=se_2002-04-24_03", "transcript", "secondary"],
  ["cnn-likud-2002", "CNN Live From transcript — 14 May 2002", "CNN", "https://transcripts.cnn.com/show/lol/date/2002-05-14/segment/00", "transcript", "secondary"],
  ["getty-mexico-2002", "Benjamin Netanyahu visits Mexico City", "Getty Images", "https://www.gettyimages.com/photos/israeli-prime-minister-benjamin-netanyahu-visits-mexico-city", "archive-photo", "primary"],
  ["pbs-frontline-2002", "FRONTLINE interview: Benjamin Netanyahu", "PBS", "https://www.pbs.org/wgbh/frontline/article/frontline-interview-benjamin-netanyahu-2002/", "transcript", "primary"],
  ["cnn-am-2002", "American Morning with Paula Zahn — 12 September 2002", "CNN", "https://transcripts.cnn.com/show/ltm/date/2002-09-12/segment/02", "transcript", "primary"],
  ["govinfo-iraq-2002", "Israeli perspective on conflict with Iraq", "U.S. Government Publishing Office", "https://www.govinfo.gov/content/pkg/CHRG-107hhrg83514/html/CHRG-107hhrg83514.htm", "official-record", "primary"],
  ["getty-tv-2002", "Netanyahu at Israeli Public Television studio", "Getty Images", "https://www.gettyimages.com/detail/news-photo/former-israeli-prime-minister-benjamin-netanyahu-looks-news-photo/1233233703", "archive-photo", "primary"],
  ["reuters-sworn-2002", "Netanyahu sworn in as foreign minister", "Reuters Connect", "https://www.reutersconnect.com/item/israeli-prime-minister-ariel-sharon-and-the-newly-sworn-in-israeli-foreign-minister-benjamin-netanyahu/dGFnOnJldXRlcnMuY29tLDIwMDI6bmV3c21sX1JQM0RSSURNWE1BQQ", "archive-photo", "primary"],
  ["gov-mombasa-2002", "Press conference on terrorist attacks in Mombasa", "Government of Israel", "https://www.gov.il/en/pages/press-conference-by-fm-netanyahu-terror-attacks-in-mombasa-kenya-28-nov-2002", "transcript", "primary"],
  ["gov-terror-archive", "Palestinian violence and terrorism archive", "Government of Israel", "https://www.gov.il/en/pages/palestinian-violence-and-terrorism-since-september-2000", "official-record", "primary"],
  ["getty-sharon-netanyahu", "Ariel Sharon and Benjamin Netanyahu archive", "Getty Images", "https://www.gettyimages.com/photos/israel-sharon-netanyahu", "archive-photo", "primary"],
  ["haaretz-straw-2002", "Netanyahu and Straw talks in London", "Haaretz", "https://www.haaretz.com/2002-12-20/ty-article/paper-netanyahu-straw-cancelled-press-call-for-fear-of-row/0000017f-f0c4-da6f-a77f-f8ceff680000", "contemporary-report", "secondary"],
  ["kuna-russia-2002", "Netanyahu arrives in Moscow", "Kuwait News Agency", "https://www.kuna.net.kw/ArticleDetails.aspx?id=1306857&language=en", "contemporary-report", "secondary"],
  ["getty-ivanov-2002", "Netanyahu welcomed by Igor Ivanov", "Getty Images", "https://www.gettyimages.com/detail/news-photo/israely-foreign-minister-benjamin-netanyahu-is-welcomed-by-news-photo/1248912233", "archive-photo", "primary"],
  ["cnn-2003-01-06", "American Morning interview — 6 January 2003", "CNN", "https://transcripts.cnn.com/show/ltm/date/2003-01-06/segment/13", "transcript", "primary"],
  ["gov-interviews-2003", "Excerpts of CNN and Fox News interviews", "Government of Israel", "https://www.gov.il/en/pages/excerpts-of-interviews-with-foreign-minister-benjamin-netanyahu-on-cnn-and-fox-news-6-jan-2003", "transcript", "primary"],
  ["jta-straw-2003", "Israel, Britain at odds over forum", "Jewish Telegraphic Agency", "https://www.jta.org/2003/01/06/lifestyle/israel-britain-at-odds-over-forum", "contemporary-report", "secondary"],
  ["reuters-interview-2003", "Foreign Minister Netanyahu interview in Jerusalem", "Reuters Connect", "https://www.reutersconnect.com/item/foreign-minister-benjamin-netanyahu-during-an-interview-in-jerusalem/dGFnOnJldXRlcnMuY29tLDIwMDM6bmV3c21sX1JQM0RSSUdEV1pBQQ", "archive-photo", "primary"],
  ["getty-finance-2003", "Israel Finance — Benjamin Netanyahu archive", "Getty Images", "https://www.gettyimages.fr/photos/israel-finance-benjamin-netanyahu", "archive-photo", "primary"],
  ["gov-cabinet-2003-05", "Cabinet communiqué — 4 May 2003", "Government of Israel", "https://www.gov.il/en/pages/cabinet-communique-4-may-2003", "official-record", "primary"],
  ["treasury-2003", "Israeli business community event", "U.S. Department of the Treasury", "https://home.treasury.gov/news/press-releases/js509", "official-record", "primary"],
  ["gov-cabinet-2003-07", "Cabinet communiqué — 2 July 2003", "Government of Israel", "https://www.gov.il/en/pages/cabinet-communique-2-jul-2003", "official-record", "primary"],
  ["getty-austerity-2003", "Netanyahu attends cabinet austerity meeting", "Getty Images", "https://www.gettyimages.com/detail/news-photo/israeli-finance-minister-benjamin-netanyahu-walks-in-to-news-photo/2521738", "archive-photo", "primary"],
  ["getty-press-2003", "Netanyahu press conference in Jerusalem", "Getty Images", "https://www.gettyimages.com/detail/news-photo/israeli-finance-minister-benjamin-netanyahu-close-his-eyes-news-photo/518689882", "archive-photo", "primary"],
  ["knesset-law-2003", "Economic Arrangements Law briefing", "Knesset Research and Information Center", "https://m.knesset.gov.il/EN/activity/mmm/me01237.pdf", "official-record", "primary"],
  ["getty-bucharest-stone", "Lauder-Reut school foundation stone ceremony", "Getty Images", "https://www.gettyimages.in/detail/news-photo/israeli-finance-minister-benjamin-netanyahu-executive-news-photo/2819736", "archive-photo", "primary"],
  ["getty-bucharest-press", "Netanyahu press conference in Bucharest", "Getty Images", "https://www.gettyimages.es/detail/fotograf%C3%ADa-de-noticias/israeli-finance-minister-benjamin-netanyahu-fotograf%C3%ADa-de-noticias/586134184", "archive-photo", "primary"],
  ["gov-disengagement-2004", "Israel–Palestinian negotiations and disengagement", "Government of Israel", "https://www.gov.il/en/pages/israel-palestinian-negotiations", "official-record", "primary"],
  ["cr-2004", "Benjamin Netanyahu interview — 21 June 2004", "Charlie Rose", "https://charlierose.com/videos/9654", "archive-video", "primary"],
  ["gov-fence-2004", "Prime ministerial discussion on security fence route", "Government of Israel", "https://www.gov.il/en/pages/mes1107043", "official-record", "primary"],
  ["gov-cabinet-2004-08", "Cabinet communiqué — 30 August 2004", "Government of Israel", "https://www.gov.il/en/pages/govmes300804", "official-record", "primary"],
  ["gov-cabinet-2004-09-12", "Cabinet communiqué — 12 September 2004", "Government of Israel", "https://www.gov.il/en/pages/govmes120904", "official-record", "primary"],
  ["gov-cabinet-2004-09-26", "Cabinet communiqué — 26 September 2004", "Government of Israel", "https://www.gov.il/en/pages/govmes260904", "official-record", "primary"],
  ["gov-cabinet-2004-10", "Cabinet communiqué — 8 October 2004", "Government of Israel", "https://www.gov.il/en/pages/govmes081004", "official-record", "primary"],
  ["reuters-knesset-2004", "Netanyahu attends Knesset voting session", "Reuters Connect", "https://www.reutersconnect.com/item/israeli-finance-minister-benjamin-netanyahu-attends-a-voting-session-at-the-knesset-in-jerusalem/dGFnOnJldXRlcnMuY29tLDIwMDQ6bmV3c21sX1JQNURSSUFORERBQQ", "archive-photo", "primary"],
  ["reuters-likud-2004-10", "Likud parliamentary faction meeting", "Reuters Connect", "https://www.reutersconnect.com/item/israeli-prime-minister-ariel-sharon-finance-minister-benjamin-netanyahu-and-a-likud-parliament-/dGFnOnJldXRlcnMuY29tLDIwMDQ6bmV3c21sX1JQNURSSUFORExBQQ", "archive-photo", "primary"],
  ["reuters-cabinet-2004", "Sharon and Netanyahu attend cabinet meeting", "Reuters Connect", "https://www.reutersconnect.com/item/israeli-prime-minister-ariel-sharon-r-and-his-finance-minister-benjamin-netanyahu-l-attend-a-/dGFnOnJldXRlcnMuY29tLDIwMDQ6bmV3c21sX1JQNURSSUFORFlBQQ", "archive-photo", "primary"],
  ["reuters-likud-2004-11", "Netanyahu attends Likud party meeting", "Reuters Connect", "https://www.reutersconnect.com/item/israeli-finance-minister-benjamin-netanyahu-attends-a-likud-party-meeting-at-the-israeli-parliament-/dGFnOnJldXRlcnMuY29tLDIwMDQ6bmV3c21sX1JQNURSSUFORFdBQQ", "archive-photo", "primary"],
  ["haaretz-resignation-2004", "Netanyahu backs down from resignation threat", "Haaretz", "https://www.haaretz.com/2004-11-10/ty-article/netanyahu-backs-down-from-resignation-threat/0000017f-e1a7-d38f-a57f-e7f764d70000", "contemporary-report", "secondary"],
  ["gov-ports-2004", "Cabinet communiqué — 12 December 2004", "Government of Israel", "https://www.gov.il/en/pages/govmes1212", "official-record", "primary"],
  ["gov-fischer-2005", "Recommendation of Stanley Fischer", "Government of Israel", "https://www.gov.il/en/pages/spokemes090105", "official-record", "primary"],
  ["reuters-budget-2005", "Netanyahu attends 2005 budget vote", "Reuters Connect", "https://www.reutersconnect.com/item/israeli-finance-minister-benjamin-netanyahu-trade-and-industry-minister-ehud-olmert-prime-minister-/dGFnOnJldXRlcnMuY29tLDIwMDU6bmV3c21sX1JQNURSSUdaVkRBQQ", "archive-photo", "primary"],
  ["gov-ports-2005", "Prime minister and finance minister discuss port reform", "Government of Israel", "https://www.gov.il/en/pages/spokemesb130205", "official-record", "primary"],
  ["getty-resignation-2005", "Benjamin Netanyahu resigns cabinet post", "Getty Images", "https://www.gettyimages.com/editorial-images/news/event/benjamin-netanyahu-resigns-cabinet-post/53330854", "archive-photo", "primary"],
  ["gov-disengagement-apr-2005", "Discussion on disengagement preparations", "Government of Israel", "https://www.gov.il/en/pages/pm-sharon-holds-discussion-on-disengagement-preparations-4-apr-2005", "official-record", "primary"],
  ["gov-disengagement-committee-2005", "Disengagement Ministerial Committee meeting", "Government of Israel", "https://www.gov.il/en/pages/pm-sharon-chairs-meeting-of-disengagement-ministerial-committee-19-apr-2005", "official-record", "primary"],
  ["reuters-resignation-2005", "Netanyahu resignation news conference", "Reuters Connect", "https://www.reutersconnect.com/item/israeli-finance-minister-netanyahu-speaks-during-news-conference-in-jerusalem/dGFnOnJldXRlcnMuY29tLDIwMDU6bmV3c21sX1JQNkRSTVRQUUNBQQ", "archive-photo", "primary"],
  ["reuters-maale-adumim-2005", "Netanyahu visits Maale Adumim", "Reuters Connect", "https://www.reutersconnect.com/item/former-israeli-pm-benjamin-netanyahu-visits-maale-adumim/dGFnOnJldXRlcnMuY29tLDIwMDU6bmV3c21sX1JQNkRSTkFCVEhBQg", "archive-photo", "primary"],
  ["reuters-likud-2005", "Netanyahu addresses Likud conference", "Reuters Connect", "https://www.reutersconnect.com/item/israeli-former-finance-minister-benjamin-netanyahu-gives-speech-during-likud-conference-in-tel-aviv/dGFnOnJldXRlcnMuY29tLDIwMDU6bmV3c21sX1JQNkRSTkFYRFZBQw", "archive-photo", "primary"],
  ["getty-likud-2005", "Likud Knesset meeting archive", "Getty Images", "https://www.gettyimages.com/photos/likud-knesset", "archive-photo", "primary"],
  ["reuters-conference-2005", "Netanyahu addresses Tel Aviv conference", "Reuters Connect", "https://www.reutersconnect.com/item/israeli-parliament-member-and-former-prime-minister-netanyahu-addresses-a-conference-in-tel-aviv/dGFnOnJldXRlcnMuY29tLDIwMDU6bmV3c21sX1JQMkRTRkhZTFVBQg", "archive-photo", "primary"],
  ["wii-likud-2005", "Netanyahu’s Victory: Major Challenges for the Likud Party", "The Washington Institute", "https://www.washingtoninstitute.org/policy-analysis/netanyahus-victory-major-challenges-likud-party", "contemporary-report", "secondary"],
  ["app-wh-2025-02-04", "The President’s News Conference with Prime Minister Benjamin Netanyahu", "The American Presidency Project", "https://www.presidency.ucsb.edu/documents/the-presidents-news-conference-with-prime-minister-benjamin-netanyahu-israel-0", "transcript", "primary"],
  ["fox-hannity-2025-02-05", "Benjamin Netanyahu praises Trump’s Gaza proposal", "Fox News / Hannity", "https://www.foxnews.com/media/benjamin-netanyahu-praises-trumps-remarkable-idea-about-us-takeover-gaza.amp", "archive-video", "primary"],
  ["c14-2025-02-06", "Netanyahu interview with Yaakov Bardugo", "Channel 14", "https://www.c14.co.il/article/1113691", "archive-video", "primary"],
  ["fox-levin-2025-02-08", "Netanyahu recaps Washington visit", "Fox News / Life, Liberty & Levin", "https://www.foxnews.com/video/6368478058112", "archive-video", "primary"],
  ["cnn-hostages-2025-02-20", "Netanyahu statement as four deceased hostages are returned", "CNN transcript archive", "https://transcripts.cnn.com/show/cnr/date/2025-02-20/segment/21", "transcript", "secondary"],
  ["knesset-2025-03-03", "40-signature debate on October 7 commission of inquiry", "Knesset", "https://main.knesset.gov.il/en/news/pressreleases/pages/press3325y.aspx", "official-record", "primary"],
  ["app-wh-2025-04-07", "Remarks prior to a meeting with Prime Minister Netanyahu", "The American Presidency Project", "https://www.presidency.ucsb.edu/documents/remarks-prior-meeting-with-prime-minister-benjamin-netanyahu-israel-and-exchange-with-8", "transcript", "primary"],
  ["israelipm-passover-2025-04-11", "Prime Minister’s Passover Greetings", "IsraeliPM", "https://www.youtube.com/watch?v=ZJZL7RF13aw", "archive-video", "primary"],
  ["jpost-yadvashem-2025-04-23", "Holocaust Remembrance Day address at Yad Vashem", "The Jerusalem Post", "https://www.jpost.com/breaking-news/article-851257", "contemporary-report", "secondary"],
  ["jns-summit-2025-04-27", "Full remarks: Netanyahu at the JNS Policy Summit", "Jewish News Syndicate", "https://www.jns.org/israel-news/full-remarks-netanyahu-at-the-jns-policy-summit", "transcript", "primary"],
  ["toi-memorial-2025-04-30", "Netanyahu addresses Memorial Day ceremony", "The Times of Israel", "https://www.timesofisrael.com/as-israelis-mark-memorial-day-pm-honors-troops-who-broke-the-grip-of-our-enemies/", "contemporary-report", "secondary"],
  ["gov-edan-2025-05-12", "Statement on the return of hostage Edan Alexander", "Government of Israel", "https://www.gov.il/en/pages/return-of-hostage-edan-alexander-statement-by-pm-netanyahu-12-may-2025", "official-record", "primary"],
  ["youtube-pmo-2025-05-21", "Prime Minister Netanyahu press conference", "IsraeliPM / Government Press Office", "https://www.youtube.com/watch?v=7jsT5U70H44", "archive-video", "primary"],
  ["fox-baier-2025-06-15", "A Bret Baier Exclusive with PM Netanyahu", "FOX One / Fox News", "https://www.fox.com/watch/episode/fmc-rz4intchf7og3b7t/6-15-a-bret-baier-exclusive-with-pm-netanyahu", "archive-video", "primary"],
  ["abc-karl-2025-06-16", "ABC News full interview with Jonathan Karl", "ABC News", "https://abcnews.com/video/122895317/", "archive-video", "primary"],
  ["gov-weizmann-2025-06-20", "Remarks at the Weizmann Institute missile impact site", "Prime Minister’s Office", "https://www.gov.il/en/pages/event-weitzmann200625", "official-record", "primary"],
  ["app-wh-2025-07-07", "Remarks prior to a working dinner with Prime Minister Netanyahu", "The American Presidency Project", "https://www.presidency.ucsb.edu/documents/remarks-prior-working-dinner-with-prime-minister-benjamin-netanyahu-israel-and-exchange", "transcript", "primary"],
  ["apple-fullsend-2025-07-21", "The Benjamin Netanyahu Interview", "FULL SEND PODCAST / Apple Podcasts", "https://podcasts.apple.com/us/podcast/the-benjamin-netanyahu-interview/id1582758729?i=1000718335776", "archive-video", "primary"],
  ["fox-hemmer-2025-08-07", "A Bill Hemmer Interview with Benjamin Netanyahu", "FOX One / Fox News", "https://www.fox.com/watch/episode/fmc-xwyf4uccn5ijnkqb/a-bill-hemmer-interview-with-benjamin-netanyahu", "archive-video", "primary"],
  ["jpost-presser-2025-08-10", "Netanyahu press conference for foreign media", "The Jerusalem Post", "https://www.jpost.com/israel-news/article-863809", "contemporary-report", "secondary"],
  ["apple-trigger-2025-08-20", "Asking Benjamin Netanyahu The Tough Questions", "TRIGGERnometry / Apple Podcasts", "https://podcasts.apple.com/us/podcast/asking-benjamin-netanyahu-the-tough-questions/id1375568988?i=1000722841515", "archive-video", "primary"],
  ["fox-faulkner-2025-09-11", "Netanyahu reacts to Charlie Kirk’s assassination", "Fox News / The Faulkner Focus", "https://www.foxnews.com/video/6379142708112", "archive-video", "primary"],
  ["newsmax-greta-2025-09-11", "Netanyahu interview on The Record", "Newsmax", "https://www.newsmax.com/newsmax-tv/benjamin-netanyahu-charlie-kirk-assassination/2025/09/11/id/1226111/", "archive-video", "primary"],
  ["toi-channel13-2025-09-14", "Netanyahu rejects claim he is prolonging the Gaza war", "The Times of Israel", "https://www.timesofisrael.com/in-rare-israeli-interview-pm-rejects-malicious-claim-hes-needlessly-prolonging-war/", "contemporary-report", "secondary"],
  ["gov-rubio-2025-09-15", "Statements by Netanyahu and Secretary of State Marco Rubio", "Prime Minister’s Office", "https://www.gov.il/en/pages/statements-by-pm-netanyahu-and-us-secretary-of-state-marco-rubio-15-sep-2025", "official-record", "primary"],
  ["israelipm-presser-2025-09-16", "Prime Minister Netanyahu at the press conference", "Prime Minister’s Office", "https://www.facebook.com/IsraeliPM/videos/prime-minister-benjamin-netanyahu-at-the-press-conferenceyesterday-i-spoke-a-lit/768352842649253/", "archive-video", "primary"],
  ["netanyahu-kirk-2025-09-18", "Charlie Kirk was a defender of our common Judeo-Christian civilization", "Benjamin Netanyahu official account", "https://www.facebook.com/Netanyahu/videos/charlie-kirk-was-a-defender-of-our-common-judeo-christian-civilizationcharlie-wa/747565011508779/", "archive-video", "primary"],
  ["gov-flight-2025-09-25", "Remarks before diplomatic trip to the United States", "Prime Minister’s Office", "https://www.gov.il/en/pages/news-flight250925", "official-record", "primary"],
  ["un-2025-09-26", "Israel — General Debate, 80th Session", "UN Web TV", "https://webtv.un.org/en/asset/k1y/k1y2gbpxxh", "archive-video", "primary"],
  ["fox-sunday-2025-09-28", "The Sunday Briefing interview", "Fox News", "https://www.foxnews.com/video/6380220382112", "archive-video", "primary"],
  ["whitehouse-2025-09-29", "President Trump and Prime Minister Netanyahu announce the US peace plan for Gaza", "The White House", "https://www.whitehouse.gov/videos/president-trump-participates-in-a-press-conference-with-the-prime-minister-of-the-state-of-israel/", "archive-video", "primary"],
  ["knesset-trump-2025-10-13", "Special Knesset sitting for President Donald Trump", "Knesset", "https://m.knesset.gov.il/en/news/pressreleases/pages/press131025t.aspx", "official-record", "primary"],
  ["cbs-dokoupil-2025-10-14", "Netanyahu interview with Tony Dokoupil", "CBS News / CBS Mornings", "https://www.cbsnews.com/news/netanyahu-trump-remark-not-the-easiest-guy-to-deal-with/", "transcript", "primary"],
  ["knesset-2025-12-08", "40-signature debate on Israel’s international standing", "Knesset", "https://main.knesset.gov.il/EN/News/PressReleases/Pages/press81225u.aspx", "official-record", "primary"],
  ["govinfo-maralago-2025-12-29", "Exchange with reporters at Mar-a-Lago", "GovInfo / Office of the Federal Register", "https://www.govinfo.gov/app/details/DCPD-202501225/", "official-record", "primary"],
  ["fox-baier-2025-12-30", "PM Netanyahu on advancing the Israel-Hamas ceasefire", "FOX One / Fox News", "https://www.fox.com/watch/episode/fmc-hnyiu7agaoev65xw/pm-netanyahu-on-advancing-israel-hamas-ceasefire", "archive-video", "primary"],
] as const;

export const sources: Source[] = sourceSeed.map((s) => ({ id:s[0], title:s[1], publisher:s[2], url:s[3], sourceType:s[4] as Source["sourceType"], classification:s[5] as Source["classification"], accessedDate:"2026-08-31", language:"English" }));

const coords: Record<string, [number, number, string, string | null]> = {
  "New York": [40.7128,-74.006,"New York","United States"], Brooklyn:[40.6782,-73.9442,"New York","United States"], Washington:[38.9072,-77.0369,"District of Columbia","United States"], Jerusalem:[31.7683,35.2137,"Jerusalem District","Israel"], Cairo:[30.0444,31.2357,"Cairo","Egypt"], Erez:[31.5608,34.5678,"Southern District","Israel"], Madrid:[40.4168,-3.7038,"Community of Madrid","Spain"], Tokyo:[35.6762,139.6503,"Tokyo","Japan"], Wye:[38.944,-76.081,"Maryland","United States"], "Tel Aviv":[32.0853,34.7818,"Tel Aviv District","Israel"], London:[51.5072,-0.1276,"England","United Kingdom"], Gaza:[31.5017,34.4668,"Gaza Strip","Palestinian territories"], "Mexico City":[19.4326,-99.1332,"Mexico City","Mexico"], Moscow:[55.7558,37.6173,"Moscow","Russia"], Bucharest:[44.4268,26.1025,"Bucharest","Romania"], "Maale Adumim":[31.7772,35.2979,"West Bank","West Bank"], Rehovot:[31.8928,34.8113,"Central District","Israel"], "Lod area":[31.987,34.886,"Central District","Israel"], "Palm Beach":[26.7056,-80.0364,"Florida","United States"]
};

type SeedDetails = {
  summary?: string;
  address?: string;
  time?: string;
  timezone?: string;
  organisations?: string[];
};
type Seed = [string,string,string,string,string[],string,string,Verification?,string?,string?,string?,SeedDetails?];
const seeds: Seed[] = [
 ["1984-10-02","Presents credentials as Israel’s UN representative","New York","United Nations Headquarters",["Government activity","Diplomatic appearance"],"un-credentials-1984","government"],
 ["1984-10-17","Holds press conference at UN Headquarters","New York","United Nations Headquarters",["Press conference","Recorded appearance"],"un-photo-1984","press"],
 ["1984-10-19","First documented meeting with Menachem Mendel Schneerson","Brooklyn","770 Eastern Parkway",["Meeting","Religious event"],"chabad-1984","religious","provisional","p-schneerson","Menachem Mendel Schneerson","Conversation reconstructed from later testimony; midnight timing is described retrospectively."],
 ["1984-11-26","Addresses the General Assembly on the Middle East","New York","United Nations Headquarters",["Speech","Government activity"],"un-300850","government"],
 ["1984-12-11","Addresses the General Assembly on the question of Palestine","New York","United Nations Headquarters",["Speech","Government activity"],"un-301186","government"],
 ["1985-03-07","Addresses the Security Council on Lebanon","New York","United Nations Headquarters",["Speech","Government activity"],"un-286881","government"],
 ["1985-10-16","Holds UN press conference as Israel’s representative","New York","United Nations Headquarters",["Press conference","Recorded appearance"],"un-photo-1985","press"],
 ["1985-11-01","Delivers General Assembly statement","New York","United Nations Headquarters",["Speech","Government activity"],"un-305138","government"],
 ["1985-12-09","Delivers General Assembly statement","New York","United Nations Headquarters",["Speech","Government activity"],"un-308155","government"],
 ["1986-03-13","Addresses the National Press Club on international terrorism","Washington","National Press Club",["Speech","Media appearance"],"nla-1986","media"],
 ["1986-05-30","Appears on Firing Line to discuss terrorism","New York","Firing Line studio",["Television appearance","Interview"],"firing-line-1986","media"],
 ["1986-10-21","Addresses the United Nations General Assembly","New York","United Nations Headquarters",["Speech","Government activity"],"un-313104","government"],
 ["1986-11-06","Holds press conference at UN Headquarters","New York","United Nations Headquarters",["Press conference","Recorded appearance"],"un-photo-1986","press"],
 ["1986-11-21","Addresses the General Assembly on Palestine","New York","United Nations Headquarters",["Speech","Government activity"],"un-316086","government"],
 ["1986-11-24","Participates in a Third Committee meeting","New York","United Nations Headquarters",["Government activity","Statement"],"un-317598","government"],
 ["1986-12-08","Addresses the Security Council on occupied territories","New York","United Nations Headquarters",["Speech","Government activity"],"un-316840","government"],
 ["1987-10-28","Addresses the General Assembly terrorism debate","New York","United Nations Headquarters",["Speech","Government activity"],"un-321925","government"],
 ["1987-12-11","Addresses the Security Council on occupied territories","New York","United Nations Headquarters",["Speech","Government activity"],"un-322588","government"],
 ["1988-04-19","Meets Menachem Mendel Schneerson at 770 Eastern Parkway","Brooklyn","770 Eastern Parkway",["Meeting","Recorded appearance","Statement","Religious event"],"jem-1988","religious","verified","p-schneerson","Menachem Mendel Schneerson"],
 ["1988-11-01","Elected to the Twelfth Knesset","Jerusalem","Israel",["Election","Government activity"],"knesset-bio","electoral"],
 ["1988-12-22","Begins service as deputy foreign minister","Jerusalem","Knesset",["Appointment","Government activity"],"knesset-bio","government","provisional"],
 ["1990-11-18","Visits Menachem Mendel Schneerson","Brooklyn","770 Eastern Parkway",["Meeting","Recorded appearance","Religious event"],"jem-1990","religious","verified","p-schneerson","Menachem Mendel Schneerson"],
 ["1991-10-30","Attends opening of the Madrid Peace Conference","Madrid","Royal Palace of Madrid",["Diplomatic appearance","Conference"],"madrid-1991","diplomatic"],
 ["1991-10-31","Participates in Madrid Conference negotiations","Madrid","Royal Palace of Madrid",["Meeting","Diplomatic appearance"],"madrid-1991","diplomatic","provisional"],
 ["1991-11-01","Participates in final plenary phase of Madrid Conference","Madrid","Royal Palace of Madrid",["Conference","Diplomatic appearance"],"madrid-1991","diplomatic","provisional"],
 ["1993-03-25","Wins the Likud leadership election","Jerusalem","Likud leadership election",["Election","Political appearance"],"likud-1993","electoral"],
 ["1993-05-06","Interviewed by Charlie Rose","New York","Charlie Rose studio",["Television appearance","Interview"],"charlie-rose-1993","media"],
 ["1995-10-05","Addresses opposition rally at Zion Square","Jerusalem","Zion Square",["Speech","Political appearance","Protest"],"zion-1995","public"],
 ["1996-05-26","Participates in televised election debate with Shimon Peres","Jerusalem","Channel 2 studio",["Debate","Television appearance","Election"],"election-1996","electoral","verified","p-peres","Shimon Peres"],
 ["1996-05-29","Contests Israel’s first direct prime-ministerial election","Jerusalem","Israel",["Election","Political appearance"],"election-1996","electoral","verified","p-peres","Shimon Peres"],
 ["1996-05-31","Election result confirms Netanyahu as prime minister-elect","Jerusalem","Israel",["Election","Government activity"],"election-1996","electoral"],
 ["1996-06-02","Delivers prime minister-elect victory address","Jerusalem",null as unknown as string,["Speech","Election"],"victory-1996","electoral"],
 ["1996-06-18","Presents his government to the Knesset","Jerusalem","Knesset",["Speech","Government activity","Appointment"],"government-1996","government"],
 ["1996-07-08","Arrives in Washington for first visit as prime minister","Washington",null as unknown as string,["Travel","Diplomatic appearance"],"whitehouse-1996","diplomatic","provisional"],
 ["1996-07-09","Meets President Bill Clinton at the White House","Washington","White House",["Meeting","Diplomatic appearance"],"whitehouse-1996","diplomatic","verified","p-clinton","Bill Clinton"],
 ["1996-07-09","Holds joint White House press conference at 2 p.m.","Washington","White House East Room",["Press conference","Recorded appearance"],"whitehouse-1996","press","verified","p-clinton","Bill Clinton","Source records a 2:00 p.m. EDT start."],
 ["1996-07-10","Addresses a joint meeting of the United States Congress","Washington","United States Capitol",["Speech","Government activity","Recorded appearance"],"congress-1996","government"],
 ["1996-07-18","Meets President Hosni Mubarak on first official visit to Egypt","Cairo",null as unknown as string,["Meeting","Travel","Diplomatic appearance"],"cairo-1996","diplomatic","verified","p-mubarak","Hosni Mubarak"],
 ["1996-09-04","Meets Yasser Arafat for the first time as prime minister","Erez","Erez Crossing",["Meeting","Diplomatic appearance"],"arafat-1996","diplomatic","verified","p-arafat","Yasser Arafat"],
 ["1996-10-01","Appears with Clinton, Arafat and King Hussein before summit talks","Washington","White House Oval Office",["Statement","Diplomatic appearance","Recorded appearance"],"summit-1996","press","verified","p-clinton","Bill Clinton","Source records remarks beginning at 1:10 p.m."],
 ["1996-10-01","Participates in four-party White House Middle East summit","Washington","White House",["Meeting","Diplomatic appearance"],"summit-1996","diplomatic","verified","p-arafat","Yasser Arafat"],
 ["1996-10-01","Meets King Hussein during White House summit","Washington","White House",["Meeting","Diplomatic appearance"],"summit-1996","diplomatic","provisional","p-hussein","Hussein of Jordan"],
 ["1996-10-02","Participates in concluding session of Middle East summit","Washington","White House",["Meeting","Statement","Diplomatic appearance"],"summit-close-1996","diplomatic","verified","p-clinton","Bill Clinton"],
 ["1996-10-02","Meets US presidential candidate Bob Dole","Washington",null as unknown as string,["Meeting","Political appearance"],"dole-1996","diplomatic","verified","p-dole","Bob Dole"],
 ["1996-10-03","Addresses opening of Knesset winter session","Jerusalem","Knesset",["Speech","Government activity","Recorded appearance"],"knesset-1996","government"],
 ["1996-10-06","Authorises high-level continuous negotiations at Erez","Erez","Erez Crossing",["Government activity","Diplomatic activity"],"talks-1996","government","provisional"],
 ["1997-01-14","Calls President Clinton to report Hebron agreement","Jerusalem",null as unknown as string,["Documented conversation","Diplomatic activity"],"hebron-1997","diplomatic","verified","p-clinton","Bill Clinton"],
 ["1997-01-15","Initials Hebron Protocol with Yasser Arafat","Jerusalem",null as unknown as string,["Agreement","Meeting","Diplomatic appearance"],"hebron-1997","diplomatic","verified","p-arafat","Yasser Arafat"],
 ["1997-01-17","Signs Protocol concerning redeployment in Hebron","Jerusalem",null as unknown as string,["Agreement","Government activity"],"hebron-1997","government"],
 ["1997-02-13","Appears with Clinton before Oval Office discussions","Washington","White House Oval Office",["Statement","Recorded appearance"],"clinton-feb-1997","press","verified","p-clinton","Bill Clinton","Source records a 1:12 p.m. start."],
 ["1997-02-13","Meets President Clinton at the White House","Washington","White House",["Meeting","Diplomatic appearance"],"clinton-feb-1997","diplomatic","verified","p-clinton","Bill Clinton"],
 ["1997-02-13","Holds joint news conference with President Clinton","Washington","White House",["Press conference","Recorded appearance"],"press-feb-1997","press","verified","p-clinton","Bill Clinton"],
 ["1997-03-13","Broadcasts statement following Naharayim school shooting","Jerusalem","Kol Israel",["Broadcast statement","Government activity"],"naharayim-1997","media"],
 ["1997-03-19","Announces readiness to enter final-status talks","Jerusalem",null as unknown as string,["Statement","Government activity"],"hebron-1997","government"],
 ["1997-04-07","Appears with Clinton before White House discussions","Washington","White House Oval Office",["Statement","Recorded appearance"],"clinton-apr-1997","press","verified","p-clinton","Bill Clinton"],
 ["1997-04-07","Meets President Clinton for more than two hours","Washington","White House",["Meeting","Diplomatic appearance"],"cspan-apr-1997","diplomatic","verified","p-clinton","Bill Clinton"],
 ["1997-04-07","Briefs reporters after meeting President Clinton","Washington","White House",["Press conference","Recorded appearance"],"cspan-apr-1997","press","verified","p-clinton","Bill Clinton"],
 ["1997-07-30","Speaks with Yasser Arafat following Jerusalem bombing","Jerusalem",null as unknown as string,["Documented conversation","Government activity"],"naharayim-1997","diplomatic","provisional","p-arafat","Yasser Arafat"],
 ["1997-08-27","Addresses Foreign Correspondents’ Club of Japan","Tokyo","Foreign Correspondents’ Club of Japan",["Speech","Travel","Recorded appearance"],"japan-1997","media"],
 ["1997-10-07","Meets Yasser Arafat at Erez Crossing","Erez","Erez Crossing",["Meeting","Diplomatic appearance"],"oct-1997","diplomatic","verified","p-arafat","Yasser Arafat"],
 ["1998-01-06","Assumes the foreign affairs portfolio","Jerusalem","Prime Minister’s Office",["Appointment","Government activity"],"foreign-portfolio","government"],
 ["1998-01-19","Addresses audience in Washington on Middle East issues","Washington",null as unknown as string,["Speech","Travel","Recorded appearance"],"cspan-jan19-1998","public"],
 ["1998-01-20","Appears with Clinton before White House discussions","Washington","White House Oval Office",["Statement","Recorded appearance"],"clinton-jan-1998","press","verified","p-clinton","Bill Clinton"],
 ["1998-01-20","Meets President Clinton at the White House","Washington","White House",["Meeting","Diplomatic appearance"],"clinton-jan-1998","diplomatic","verified","p-clinton","Bill Clinton"],
 ["1998-01-21","Addresses the National Press Club on the peace process","Washington","National Press Club",["Speech","Recorded appearance","Press event"],"npc-1998","media"],
 ["1998-01-27","Issues Ramadan-related statement","Jerusalem",null as unknown as string,["Statement","Government activity"],"ramadan-1998","government"],
 ["1998-05-04","Meets US mediators during London peace-process talks","London",null as unknown as string,["Meeting","Travel","Diplomatic appearance"],"may-1998","diplomatic","provisional"],
 ["1998-05-04","Participates in indirect London talks involving Yasser Arafat","London",null as unknown as string,["Meeting","Diplomatic activity"],"may-1998","diplomatic","provisional","p-arafat","Yasser Arafat"],
 ["1998-05-17","Addresses public-affairs gathering on Middle East peace","Washington",null as unknown as string,["Speech","Recorded appearance"],"address-may-1998","public"],
 ["1998-09-28","Appears with Clinton and Arafat following discussions","Washington","White House",["Statement","Recorded appearance"],"clinton-sep-1998","press","verified","p-clinton","Bill Clinton"],
 ["1998-09-28","Participates in White House discussions with Arafat","Washington","White House",["Meeting","Diplomatic appearance"],"clinton-sep-1998","diplomatic","verified","p-arafat","Yasser Arafat"],
 ["1998-10-15","Arrives for Wye River negotiations","Wye","Wye River Conference Centers",["Travel","Diplomatic appearance"],"wye-review","diplomatic","provisional"],
 ["1998-10-16","Participates in Wye River negotiating sessions","Wye","Wye River Conference Centers",["Meeting","Diplomatic activity"],"wye-review","diplomatic","provisional","p-arafat","Yasser Arafat"],
 ["1998-10-17","Meets Arafat during Wye River summit","Wye","Wye River Conference Centers",["Meeting","Diplomatic appearance"],"wye-review","diplomatic","provisional","p-arafat","Yasser Arafat"],
 ["1998-10-18","Continues Wye River negotiations","Wye","Wye River Conference Centers",["Meeting","Diplomatic activity"],"wye-review","diplomatic","provisional"],
 ["1998-10-19","Participates in Wye talks after King Hussein joins mediation","Wye","Wye River Conference Centers",["Meeting","Diplomatic appearance"],"wye-review","diplomatic","provisional","p-hussein","Hussein of Jordan"],
 ["1998-10-20","Continues intensive Wye River negotiations","Wye","Wye River Conference Centers",["Meeting","Diplomatic activity"],"wye-review","diplomatic","provisional"],
 ["1998-10-21","Conducts conference call with Jewish leaders from Wye","Wye","Wye River Conference Centers",["Documented conversation","Recorded statement"],"wye-call","media"],
 ["1998-10-21","Participates in Wye negotiation session with Clinton","Wye","Wye River Conference Centers",["Meeting","Diplomatic appearance"],"wye-review","diplomatic","provisional","p-clinton","Bill Clinton"],
 ["1998-10-22","Participates in overnight final Wye negotiations","Wye","Wye River Conference Centers",["Meeting","Diplomatic activity"],"wye-review","diplomatic","provisional"],
 ["1998-10-23","Signs the Wye River Memorandum","Washington","White House",["Agreement","Government activity","Recorded appearance"],"wye-text","government","verified","p-arafat","Yasser Arafat"],
 ["1998-10-23","Speaks at Wye River Memorandum signing ceremony","Washington","White House",["Speech","Recorded appearance"],"wye-signing","press","verified","p-clinton","Bill Clinton"],
 ["1998-10-24","Concludes Wye visit after memorandum negotiations","Wye","Wye River Conference Centers",["Travel","Diplomatic appearance"],"wye-review","diplomatic","provisional"],
 ["1998-10-25","Holds press conference on return from Wye","Tel Aviv","Ben Gurion Airport",["Press conference","Travel","Recorded appearance"],"airport-1998","press"],
 ["1998-11-02","Issues timetable clarification concerning Wye","Jerusalem","Prime Minister’s Office",["Statement","Government activity"],"wye-timetable","government"],
 ["1998-11-05","Presents Wye Memorandum to Cabinet","Jerusalem","Prime Minister’s Office",["Government activity","Statement"],"wye-special","government"],
 ["1998-11-16","Addresses Knesset on the Wye Peace Accords","Jerusalem","Knesset",["Speech","Government activity","Recorded appearance"],"knesset-nov-1998","government"],
 ["1998-12-02","Conducts Cabinet consultations on Wye implementation","Jerusalem","Prime Minister’s Office",["Meeting","Government activity"],"wye-cabinet","government"],
 ["1998-12-13","Welcomes President Clinton at Tel Aviv arrival ceremony","Tel Aviv","Ben Gurion Airport",["Ceremony","Diplomatic appearance"],"clinton-arrival","diplomatic","verified","p-clinton","Bill Clinton"],
 ["1998-12-13","Hosts dinner for President Clinton in Jerusalem","Jerusalem",null as unknown as string,["Dinner","Diplomatic appearance","Speech"],"clinton-dinner","diplomatic","verified","p-clinton","Bill Clinton"],
 ["1998-12-14","Breakfasts with President and Hillary Clinton","Jerusalem","Jerusalem Hilton Hotel",["Meeting","Diplomatic appearance"],"clinton-digest","diplomatic","verified","p-clinton","Bill Clinton"],
 ["1998-12-14","Meets President Clinton at the Prime Minister’s office","Jerusalem","Prime Minister’s Office",["Meeting","Diplomatic appearance"],"clinton-digest","diplomatic","verified","p-clinton","Bill Clinton"],
 ["1998-12-15","Participates in Israel–Palestinian–US summit meeting","Erez","Erez Crossing",["Meeting","Diplomatic appearance"],"summit-dec-1998","diplomatic","verified","p-clinton","Bill Clinton"],
 ["1998-12-15","Holds press conference with Foreign Minister Ariel Sharon","Erez","Erez Crossing",["Press conference","Recorded appearance"],"summit-dec-1998","press"],
 ["1998-12-21","Government moves toward early elections after coalition crisis","Jerusalem","Knesset",["Government activity","Election"],"wye-special","electoral","provisional"],
 ["1999-01-25","Campaigns as Likud candidate for prime minister","Jerusalem",null as unknown as string,["Election","Political appearance"],"election-1999","electoral","provisional"],
 ["1999-03-15","Government publishes position on obligations under Wye","Jerusalem","Prime Minister’s Office",["Statement","Government activity"],"wye-special","government","provisional"],
 ["1999-05-17","Contests direct election for prime minister against Ehud Barak","Jerusalem","Israel",["Election","Political appearance"],"election-1999","electoral"],
 ["1999-05-18","Concedes election defeat and announces political withdrawal","Jerusalem",null as unknown as string,["Statement","Election"],"election-1999","electoral","provisional"],
 ["1999-07-06","Leaves office as Ehud Barak’s government is formed","Jerusalem","Knesset",["Government transition","Government activity"],"barak-1999","government"],
 ["1995-10-27","Discusses the peace process on Charlie Rose","New York","Charlie Rose studio",["Television appearance","Interview"],"cr-1995","media","verified","p-rose","Charlie Rose"],
 ["1996-07-11","Appears for an extended interview on Charlie Rose","New York","Charlie Rose studio",["Television appearance","Interview"],"cr-guests","media","verified","p-rose","Charlie Rose"],
 ["1997-01-06","Discusses Israeli policy on Charlie Rose","New York","Charlie Rose studio",["Television appearance","Interview"],"cr-guests","media","verified","p-rose","Charlie Rose"],
 ["1998-05-14","Addresses the Washington Institute policy forum","Washington","The Washington Institute",["Speech","Policy forum"],"washington-institute-1998","public"],
 ["1998-09-24","Returns to Charlie Rose for a televised interview","New York","Charlie Rose studio",["Television appearance","Interview"],"cr-guests","media","verified","p-rose","Charlie Rose"],
 ["1999-02-17","Holds Jerusalem news conference on targeted killings","Jerusalem","Prime Minister’s Office",["Press conference","Statement"],"wired-1999","press"],
 ["2000-10-09","Discusses renewed Israeli–Palestinian violence on Charlie Rose","New York","Charlie Rose studio",["Television appearance","Interview"],"cr-2000","media","verified","p-rose","Charlie Rose"],
 ["2001-02-16","Addresses the Ronald Reagan Banquet","Washington","Ronald Reagan Banquet",["Speech","Recorded appearance"],"cspan-reagan-2001","public"],
 ["2001-05-21","Appears on Charlie Rose for an extended interview","New York","Charlie Rose studio",["Television appearance","Interview"],"cr-2001","media","verified","p-rose","Charlie Rose"],
 ["2001-09-20","Testifies before the US House on preparing for war on terrorism","Washington","United States Capitol",["Testimony","Government activity"],"govinfo-terror-2001","government"],
 ["2001-09-21","Appears on C-SPAN Washington Journal","Washington","C-SPAN studio",["Television appearance","Interview"],"cspan-wj-2001","media"],
 ["2001-09-24","Holds news conference on the terrorist attacks","Washington","National Press Club",["Press conference","Recorded appearance"],"cspan-press-2001","press"],
 ["2001-12-01","Gives CNN live interview from New York","New York","CNN remote studio",["Live news broadcast","Interview"],"cnn-2001-12-01","media"],
 ["2002-04-15","Addresses pro-Israel rally at the US Capitol","Washington","United States Capitol",["Speech","Public rally","Photograph"],"reuters-rally-2002","public","verified","p-giuliani","Rudy Giuliani","Rally also included US lawmakers and pro-Israel organisations."],
 ["2002-04-24","Addresses members of the United States Congress","Washington","United States Capitol",["Speech","Government activity"],"cnn-congress-2002","government","provisional"],
 ["2002-05-12","Addresses Likud Central Committee on Palestinian statehood","Tel Aviv","Likud Central Committee",["Speech","Political appearance"],"cnn-likud-2002","electoral"],
 ["2002-06-19","Holds press conference during Mexico City visit","Mexico City","Mexico City press venue",["Press conference","Travel","Photograph"],"getty-mexico-2002","press"],
 ["2002-06-27","Records a long-form interview for PBS FRONTLINE","Jerusalem","PBS FRONTLINE interview",["Documentary interview","Recorded appearance"],"pbs-frontline-2002","media","verified",undefined,undefined,"Interview date is recorded by FRONTLINE; web publication occurred later."],
 ["2002-09-12","Appears live on CNN American Morning","Washington","CNN Washington studio",["Live news broadcast","Interview"],"cnn-am-2002","media","verified",undefined,undefined,"Transcript records the segment at 7:32 a.m. ET."],
 ["2002-09-12","Testifies to the House Government Reform Committee on Iraq","Washington","United States Capitol",["Testimony","Government activity","Recorded appearance"],"govinfo-iraq-2002","government"],
 ["2002-11-03","Appears at an Israeli Public Television studio","Jerusalem","Israeli Public Television studio",["Television appearance","Interview","Photograph"],"getty-tv-2002","media"],
 ["2002-11-06","Is sworn in as foreign minister in Sharon’s government","Jerusalem","Prime Minister’s Office",["Appointment","Government activity","Photograph"],"reuters-sworn-2002","government","verified","p-sharon","Ariel Sharon"],
 ["2002-11-28","Holds press conference on the Mombasa terrorist attacks","Jerusalem","Foreign Ministry",["Press conference","Government activity"],"gov-mombasa-2002","press"],
 ["2002-11-29","Briefs the diplomatic corps on the Mombasa attacks","Jerusalem","Foreign Ministry",["Briefing","Diplomatic appearance"],"gov-terror-archive","diplomatic","provisional"],
 ["2002-12-01","Attends weekly cabinet meeting with Ariel Sharon","Jerusalem","Prime Minister’s Office",["Meeting","Government activity","Photograph"],"getty-sharon-netanyahu","government","provisional","p-sharon","Ariel Sharon"],
 ["2002-12-20","Meets Jack Straw during talks in London","London","Foreign and Commonwealth Office",["Meeting","Diplomatic appearance","Travel"],"haaretz-straw-2002","diplomatic","verified","p-straw","Jack Straw"],
 ["2002-12-23","Arrives in Moscow for official talks","Moscow","Moscow",["Travel","Diplomatic appearance"],"kuna-russia-2002","diplomatic"],
 ["2002-12-23","Meets Russian Foreign Minister Igor Ivanov","Moscow","Russian Foreign Ministry",["Meeting","Diplomatic appearance","Photograph"],"getty-ivanov-2002","diplomatic","verified","p-ivanov","Igor Ivanov"],
 ["2003-01-06","Appears on CNN American Morning","New York","CNN studio",["Television appearance","Interview"],"cnn-2003-01-06","media"],
 ["2003-01-06","Gives a Fox News interview on regional security","New York","Fox News studio",["Television appearance","Interview"],"gov-interviews-2003","media"],
 ["2003-01-07","Discusses the London conference dispute with Jack Straw by telephone","Jerusalem","Foreign Ministry",["Documented conversation","Diplomatic activity"],"jta-straw-2003","diplomatic","verified","p-straw","Jack Straw"],
 ["2003-01-28","Contests the Sixteenth Knesset election as a Likud candidate","Jerusalem","Israel",["Election","Political appearance"],"knesset-bio","electoral"],
 ["2003-02-05","Sits for a Reuters interview in Jerusalem","Jerusalem","Foreign Ministry",["Interview","Photograph"],"reuters-interview-2003","press"],
 ["2003-02-28","Concludes tenure as foreign minister","Jerusalem","Foreign Ministry",["Government transition","Government activity"],"foreign-portfolio","government"],
 ["2003-03-03","Takes office as finance minister","Jerusalem","Ministry of Finance",["Appointment","Government activity"],"knesset-bio","government"],
 ["2003-03-19","Gives an interview at the Ministry of Finance","Jerusalem","Ministry of Finance",["Interview","Photograph"],"getty-finance-2003","press"],
 ["2003-05-04","Briefs the cabinet on the government economic plan","Jerusalem","Prime Minister’s Office",["Briefing","Government activity"],"gov-cabinet-2003-05","government","verified","p-sharon","Ariel Sharon"],
 ["2003-06-22","Participates in an Israeli business community event","Jerusalem","Business community forum",["Economic forum","Government activity"],"treasury-2003","public"],
 ["2003-07-02","Briefs cabinet on raising the retirement age","Jerusalem","Prime Minister’s Office",["Briefing","Government activity"],"gov-cabinet-2003-07","government"],
 ["2003-09-15","Attends cabinet meeting on the austerity programme","Jerusalem","Prime Minister’s Office",["Meeting","Government activity","Photograph"],"getty-austerity-2003","government","verified","p-sharon","Ariel Sharon"],
 ["2003-11-02","Holds an economic-policy press conference","Jerusalem","Ministry of Finance",["Press conference","Photograph"],"getty-press-2003","press"],
 ["2003-12-09","Participates in Knesset consideration of the Economic Arrangements Law","Jerusalem","Knesset",["Government activity","Legislative proceeding"],"knesset-law-2003","government"],
 ["2003-12-18","Lays the foundation stone at Lauder-Reut school","Bucharest","Lauder-Reut Educational Complex",["Ceremony","Travel","Photograph"],"getty-bucharest-stone","public"],
 ["2003-12-18","Holds a press conference in Bucharest","Bucharest","Bucharest press venue",["Press conference","Travel","Photograph"],"getty-bucharest-press","press"],
 ["2004-06-06","Participates in cabinet approval of the disengagement plan","Jerusalem","Prime Minister’s Office",["Meeting","Government activity"],"gov-disengagement-2004","government","verified","p-sharon","Ariel Sharon"],
 ["2004-06-21","Appears on Charlie Rose as finance minister","New York","Charlie Rose studio",["Television appearance","Interview"],"cr-2004","media","verified","p-rose","Charlie Rose"],
 ["2004-07-11","Participates in discussion on the security barrier route","Jerusalem","Prime Minister’s Office",["Meeting","Government activity"],"gov-fence-2004","government","verified","p-sharon","Ariel Sharon"],
 ["2004-08-15","Presents the 2005 state-budget framework","Jerusalem","Prime Minister’s Office",["Budget presentation","Government activity"],"gov-cabinet-2004-09-26","government","provisional","p-sharon","Ariel Sharon","Later cabinet communiqué identifies 15 August as the budget decision date."],
 ["2004-08-30","Briefs cabinet on the sale of Discount Bank","Jerusalem","Prime Minister’s Office",["Briefing","Government activity"],"gov-cabinet-2004-08","government"],
 ["2004-09-12","Attends weekly cabinet education and budget deliberations","Jerusalem","Prime Minister’s Office",["Meeting","Government activity"],"gov-cabinet-2004-09-12","government","verified","p-sharon","Ariel Sharon"],
 ["2004-09-26","Participates in weekly cabinet budget decisions","Jerusalem","Prime Minister’s Office",["Meeting","Government activity"],"gov-cabinet-2004-09-26","government"],
 ["2004-10-08","Announces implementation steps for the budget decision","Jerusalem","Ministry of Finance",["Statement","Government activity"],"gov-cabinet-2004-10","government"],
 ["2004-10-26","Attends Knesset voting session on disengagement","Jerusalem","Knesset",["Government activity","Legislative proceeding","Photograph"],"reuters-knesset-2004","government"],
 ["2004-10-31","Joins Likud parliamentary faction meeting","Jerusalem","Knesset",["Meeting","Political appearance","Photograph"],"reuters-likud-2004-10","electoral","verified","p-sharon","Ariel Sharon"],
 ["2004-11-07","Attends cabinet meeting with Ariel Sharon","Jerusalem","Prime Minister’s Office",["Meeting","Government activity","Photograph"],"reuters-cabinet-2004","government","verified","p-sharon","Ariel Sharon"],
 ["2004-11-08","Attends Likud party meeting at the Knesset","Jerusalem","Knesset",["Meeting","Political appearance","Photograph"],"reuters-likud-2004-11","electoral"],
 ["2004-11-09","Withdraws threat to resign from the cabinet","Jerusalem","Knesset",["Statement","Political appearance"],"haaretz-resignation-2004","government"],
 ["2004-12-12","Reports cabinet agreement on port reform","Jerusalem","Prime Minister’s Office",["Statement","Government activity"],"gov-ports-2004","government","verified","p-sharon","Ariel Sharon"],
 ["2005-01-09","Agrees with Sharon to recommend Stanley Fischer","Jerusalem","Prime Minister’s Office",["Meeting","Appointment","Government activity"],"gov-fischer-2005","government","verified","p-fischer","Stanley Fischer","Decision made jointly with Prime Minister Ariel Sharon."],
 ["2005-01-12","Attends initial Knesset vote on the 2005 budget","Jerusalem","Knesset",["Government activity","Legislative proceeding","Photograph"],"reuters-budget-2005","government","verified","p-olmert","Ehud Olmert","Prime Minister Ariel Sharon was also present."],
 ["2005-02-13","Meets Sharon to resolve the port-reform dispute","Jerusalem","Prime Minister’s Office",["Meeting","Government activity"],"gov-ports-2005","government","verified","p-sharon","Ariel Sharon"],
 ["2005-03-29","Attends Knesset debate on the 2005 budget","Jerusalem","Knesset",["Government activity","Legislative proceeding","Photograph"],"getty-resignation-2005","government"],
 ["2005-04-04","Participates in meeting on disengagement preparations","Jerusalem","Prime Minister’s Office",["Meeting","Government activity"],"gov-disengagement-apr-2005","government","verified","p-sharon","Ariel Sharon"],
 ["2005-04-19","Participates in Disengagement Ministerial Committee meeting","Jerusalem","Prime Minister’s Office",["Meeting","Government activity"],"gov-disengagement-committee-2005","government","verified","p-sharon","Ariel Sharon"],
 ["2005-08-07","Resigns as finance minister and addresses a news conference","Jerusalem","Ministry of Finance",["Resignation","Press conference","Photograph"],"reuters-resignation-2005","press"],
 ["2005-08-30","Visits Maale Adumim after leaving the cabinet","Maale Adumim","Maale Adumim",["Visit","Political appearance","Photograph"],"reuters-maale-adumim-2005","public"],
 ["2005-09-25","Addresses a Likud conference in Tel Aviv","Tel Aviv","Likud conference",["Speech","Political appearance","Photograph"],"reuters-likud-2005","electoral"],
 ["2005-11-21","Attends a Likud party meeting at the Knesset","Jerusalem","Knesset",["Meeting","Political appearance","Photograph"],"getty-likud-2005","electoral","provisional"],
 ["2005-12-15","Addresses an economic conference in Tel Aviv","Tel Aviv","Business conference",["Speech","Economic forum","Photograph"],"reuters-conference-2005","public"],
 ["2005-12-19","Wins the Likud leadership election","Tel Aviv","Likud primary",["Election","Political appearance"],"wii-likud-2005","electoral","verified","p-shalom","Silvan Shalom","Netanyahu won 45 percent to Shalom’s 33 percent, according to the source."],
 ["2025-02-04","Joint White House news conference with President Trump","Washington","White House",["Joint press conference","Live broadcast"],"app-wh-2025-02-04","press","verified","p-trump","Donald Trump","White House press corps attended.",{summary:"Trump and Netanyahu held a joint White House news conference after talks, with Gaza, hostages, Iran and Trump’s proposal for postwar Gaza dominating.",address:"1600 Pennsylvania Avenue NW",organisations:["White House","Government of Israel"]}],
 ["2025-02-05","Hannity interview on Trump’s Gaza proposal","Washington","Fox News / Hannity",["Television interview","Recorded appearance"],"fox-hannity-2025-02-05","media","verified","p-hannity","Sean Hannity",undefined,{summary:"Netanyahu praised Trump’s Gaza proposal as a remarkable idea and discussed the war and postwar reconstruction.",organisations:["Fox News"]}],
 ["2025-02-06","Exclusive Channel 14 interview from Washington","Washington","Channel 14",["Television interview","Recorded appearance"],"c14-2025-02-06","media","verified",undefined,undefined,"Interviewed by Yaakov Bardugo.",{summary:"Netanyahu discussed Trump’s Gaza vision, Yoav Gallant’s criticism, management of the war and the possibility of peace with Saudi Arabia.",organisations:["Channel 14"]}],
 ["2025-02-08","Mark Levin interview after Washington visit","Washington","Fox News / Life, Liberty & Levin",["Television interview","Recorded appearance"],"fox-levin-2025-02-08","media","verified","p-levin","Mark Levin","Published excerpt runs 2m 33s; the full interview duration is not documented.",{summary:"Netanyahu recapped his Washington meetings and discussed what he described as a recalibration of the US-Israel alliance under Trump.",organisations:["Fox News"]}],
 ["2025-02-20","Recorded statement as four deceased hostages were returned","Jerusalem","Prime Minister’s Office",["Recorded statement","News broadcast"],"cnn-hostages-2025-02-20","public","verified",undefined,undefined,"Source quality B — broadcaster transcript of the prime minister’s video; families of returned hostages are central to the subject.",{summary:"Netanyahu appeared in a recorded statement as Israel received the bodies of four hostages from Gaza, speaking of national pain and resolve.",organisations:["Prime Minister’s Office"]}],
 ["2025-03-03","Knesset 40-signature debate on October 7 inquiry","Jerusalem","Knesset",["Parliamentary address","Government activity","Live broadcast"],"knesset-2025-03-03","government","verified",undefined,undefined,"Opposition and coalition members of Knesset attended.",{summary:"Netanyahu argued for what he called an objective and balanced inquiry into the October 7 failures and reviewed war objectives.",organisations:["Knesset"]}],
 ["2025-04-07","Oval Office exchange with reporters alongside President Trump","Washington","Oval Office, White House",["Press availability","Live broadcast","Diplomatic appearance"],"app-wh-2025-04-07","press","verified","p-trump","Donald Trump","Reporters attended.",{summary:"After meetings at the White House, Trump and Netanyahu answered reporters’ questions on Gaza, hostages, Iran and regional diplomacy.",address:"1600 Pennsylvania Avenue NW",organisations:["White House","Government of Israel"]}],
 ["2025-04-11","Passover video address","Jerusalem","Prime Minister’s Office",["Recorded statement","Holiday address"],"israelipm-passover-2025-04-11","religious","verified",undefined,undefined,undefined,{summary:"Netanyahu issued a recorded Passover address focused on hostages, fallen soldiers, wounded Israelis and the war.",organisations:["Prime Minister’s Office"]}],
 ["2025-04-23","Holocaust Remembrance Day address at Yad Vashem","Jerusalem","Yad Vashem",["Ceremonial public address","Live broadcast"],"jpost-yadvashem-2025-04-23","public","verified","p-herzog","Isaac Herzog","Holocaust survivors and national dignitaries attended. Source quality B — reputable secondary coverage.",{summary:"Netanyahu delivered the national Holocaust Remembrance Day speech during the state ceremony in Jerusalem.",address:"1 HaZikaron St",organisations:["Yad Vashem","State of Israel"]}],
 ["2025-04-27","Keynote address to inaugural JNS International Policy Summit","Jerusalem","JNS International Policy Summit",["Conference keynote","Live broadcast"],"jns-summit-2025-04-27","public","verified",undefined,undefined,"JNS leadership, diplomats and policy delegates attended.",{summary:"Netanyahu gave the keynote address, discussing Iran’s nuclear program, Palestinian statehood, regional security and diplomacy.",organisations:["Jewish News Syndicate"]}],
 ["2025-04-30","Memorial Day address at Mount Herzl","Jerusalem","Mount Herzl",["Ceremonial public address","Live broadcast"],"toi-memorial-2025-04-30","public","verified",undefined,undefined,"Bereaved families, national leaders and IDF representatives attended. Source quality B — reputable secondary coverage.",{summary:"Netanyahu addressed the national Memorial Day ceremony, honoring fallen soldiers during the ongoing war.",address:"Herzl Blvd",organisations:["State of Israel","Israel Defense Forces"]}],
 ["2025-05-12","Statement on the return of hostage Edan Alexander","Jerusalem","Prime Minister’s Office",["Recorded statement","Official media statement"],"gov-edan-2025-05-12","public","verified",undefined,undefined,"Edan Alexander and Donald Trump were discussed.",{summary:"Netanyahu issued a statement celebrating Edan Alexander’s return and credited military pressure and Trump administration diplomacy.",organisations:["Prime Minister’s Office"]}],
 ["2025-05-21","Prime Minister’s Office press conference","Jerusalem","Prime Minister’s Office",["Press conference","Live broadcast"],"youtube-pmo-2025-05-21","press","verified",undefined,undefined,"Israeli reporters attended.",{summary:"Netanyahu held a major press conference at his Jerusalem office addressing hostages, Gaza operations, criticism of his government and war objectives.",organisations:["Prime Minister’s Office","Government Press Office"]}],
 ["2025-06-15","Live Bret Baier exclusive after Israel strikes Iran","Location not established","Fox News / Special Report",["Live television interview","Recorded appearance"],"fox-baier-2025-06-15","media","verified","p-baier","Bret Baier","Full special runs 29m.",{summary:"In his first interview after Israel launched strikes on Iran’s nuclear and military infrastructure, Netanyahu discussed Iran’s nuclear threat, Trump and the conflict.",organisations:["Fox News"]}],
 ["2025-06-16","ABC News interview with Jonathan Karl during Israel-Iran conflict","Location not established","ABC News",["Television interview","Recorded appearance"],"abc-karl-2025-06-16","media","verified","p-karl","Jonathan Karl",undefined,{summary:"Jonathan Karl interviewed Netanyahu about Israel’s strikes on Iran, the nuclear program and the widening conflict.",organisations:["ABC News"]}],
 ["2025-06-20","Remarks at missile impact site at Weizmann Institute","Rehovot","Weizmann Institute of Science",["On-site remarks","Official video","Confirmed presence"],"gov-weizmann-2025-06-20","public","verified",undefined,undefined,"Weizmann Institute personnel and emergency and security personnel attended.",{summary:"Netanyahu spoke at the site of an Iranian missile impact, praising national resilience and framing the campaign as removing an existential threat.",organisations:["Weizmann Institute of Science","Prime Minister’s Office"]}],
 ["2025-07-07","Exchange with reporters before White House working dinner","Washington","White House",["Press availability","Live broadcast","Diplomatic appearance"],"app-wh-2025-07-07","press","verified","p-trump","Donald Trump","Reporters attended.",{summary:"Netanyahu joined Trump for televised remarks and questions before a bilateral working dinner at the White House.",address:"1600 Pennsylvania Avenue NW",organisations:["White House","Government of Israel"]}],
 ["2025-07-21","Netanyahu interview on FULL SEND PODCAST","Location not established","FULL SEND PODCAST",["Podcast interview","Video interview"],"apple-fullsend-2025-07-21","media","verified",undefined,undefined,"Interviewed by Kyle Forgeard and Bob Menery; runtime 1h 18m.",{summary:"Netanyahu joined the NELK/FULL SEND hosts for a youth-oriented long-form interview discussing Trump, Gaza, Iran, public opinion and Israeli policy.",organisations:["FULL SEND PODCAST"]}],
 ["2025-08-07","Bill Hemmer exclusive interview on Gaza takeover plan","Location not established","Fox News",["Television sit-down interview","Recorded appearance"],"fox-hemmer-2025-08-07","media","verified",undefined,undefined,"Interviewed by Bill Hemmer; full special runs approximately 25m.",{summary:"Netanyahu told Bill Hemmer Israel intended to take control of Gaza while saying it did not seek permanent rule, and discussed hostages and humanitarian claims.",organisations:["Fox News"]}],
 ["2025-08-10","Press conference for foreign media in Jerusalem","Jerusalem","Prime Minister’s Office",["Press conference","Live broadcast"],"jpost-presser-2025-08-10","press","verified",undefined,undefined,"International media correspondents attended. Source quality B — reputable secondary coverage; 16:30 was the announced local time.",{summary:"Netanyahu defended the Gaza City plan, rejected starvation accusations and presented Israel’s preferred end-state for Gaza to international reporters.",time:"16:30",timezone:"Asia/Jerusalem",organisations:["Prime Minister’s Office"]}],
 ["2025-08-20","TRIGGERnometry interview","Location not established","TRIGGERnometry",["Podcast interview","Video interview"],"apple-trigger-2025-08-20","media","verified",undefined,undefined,"Interviewed by Konstantin Kisin and Francis Foster; runtime 44m.",{summary:"Konstantin Kisin and Francis Foster questioned Netanyahu on October 7 intelligence failures, Qatar funding, Gaza, UK policy and Western Gen Z opinion.",organisations:["TRIGGERnometry"]}],
 ["2025-09-11","The Faulkner Focus interview after Charlie Kirk’s assassination","Location not established","Fox News / The Faulkner Focus",["Remote television interview","Recorded appearance"],"fox-faulkner-2025-09-11","media","verified","p-faulkner","Harris Faulkner","Fox preserves a 4m 55s video segment.",{summary:"Netanyahu gave an extended reaction to Charlie Kirk’s assassination, discussing their personal contacts, Kirk’s planned visit to Israel, political violence and Kirk’s support for Israel.",organisations:["Fox News"]}],
 ["2025-09-11","The Record interview with Greta Van Susteren","Location not established","Newsmax / The Record",["Remote television interview","Recorded appearance"],"newsmax-greta-2025-09-11","media","verified","p-van-susteren","Greta Van Susteren","This is a separate US television interview, not a derivative of the Fox appearance.",{summary:"Netanyahu discussed Charlie Kirk, the Qatar strike, Hamas leadership and accusations circulating online about Israel.",organisations:["Newsmax"]}],
 ["2025-09-14","Channel 13 interview on the duration of the Gaza war","Location not established","Channel 13",["Television interview","Recorded appearance"],"toi-channel13-2025-09-14","media","verified",undefined,undefined,"Interviewed by Moriah Asraf; the source is reputable secondary coverage of the broadcast.",{summary:"Netanyahu discussed whether he was prolonging the Gaza war and compared its duration with other urban campaigns.",organisations:["Channel 13"]}],
 ["2025-09-15","Joint televised press conference with Secretary Marco Rubio","Jerusalem","Prime Minister’s Office",["Joint press conference","Live broadcast","Diplomatic appearance"],"gov-rubio-2025-09-15","press","verified","p-rubio","Marco Rubio","The archived television version runs approximately 34m.",{summary:"Netanyahu and Rubio discussed Charlie Kirk’s assassination alongside Gaza, Qatar and US-Israel relations.",organisations:["Prime Minister’s Office","United States Department of State"]}],
 ["2025-09-16","Televised economic and security press conference","Jerusalem","Prime Minister’s Office",["Press conference","Live broadcast","Government activity"],"israelipm-presser-2025-09-16","press","verified",undefined,undefined,"Israeli reporters attended.",{summary:"Netanyahu discussed Israel’s international isolation, arms production, Trump, the Qatar strike, the Gaza City operation and hostages.",organisations:["Prime Minister’s Office"]}],
 ["2025-09-18","Recorded video address rejecting claims about Charlie Kirk’s murder","Location not established","Prime Minister’s official media channels",["Recorded video address","Official statement"],"netanyahu-kirk-2025-09-18","media","verified",undefined,undefined,"A standalone media event separate from the two television interviews on 11 September.",{summary:"Netanyahu rejected claims that Israel was involved in Charlie Kirk’s murder and described his recent conversations and correspondence with Kirk.",organisations:["Prime Minister’s Office"]}],
 ["2025-09-25","Ben-Gurion Airport remarks before UN and Washington trip","Lod area","Ben-Gurion International Airport",["Airport press remarks","Official video","Travel"],"gov-flight-2025-09-25","press","verified",undefined,undefined,"Donald Trump was discussed.",{summary:"Netanyahu previewed his UN General Assembly speech and meeting with President Trump, emphasizing hostages, Hamas and opposition to Palestinian state recognition.",organisations:["Prime Minister’s Office"]}],
 ["2025-09-26","Address to the 80th UN General Assembly","New York","United Nations Headquarters",["UN address","Live international public address","Recorded appearance"],"un-2025-09-26","diplomatic","verified",undefined,undefined,"UN General Assembly delegates attended; runtime 42m 42s.",{summary:"Netanyahu addressed the General Assembly on Iran, Gaza, hostages, Hamas and international recognition of a Palestinian state.",address:"405 E 42nd St",organisations:["United Nations"]}],
 ["2025-09-28","Fox Sunday Briefing interview on Trump’s 21-point Gaza plan","New York","Fox News / The Sunday Briefing",["Television interview","Recorded appearance"],"fox-sunday-2025-09-28","media","verified",undefined,undefined,"Runtime 17m 12s.",{summary:"Netanyahu discussed Trump’s proposed 21-point Gaza peace plan, hostages, dismantling Hamas, Palestinian recognition and Qatar.",organisations:["Fox News"]}],
 ["2025-09-29","Joint White House press conference announcing US Gaza plan","Washington","State Dining Room, White House",["Joint press conference","Live broadcast","Diplomatic appearance"],"whitehouse-2025-09-29","press","verified","p-trump","Donald Trump","White House press corps attended.",{summary:"Trump and Netanyahu jointly announced and endorsed the US plan intended to end the Gaza conflict and secure hostage releases.",address:"1600 Pennsylvania Avenue NW",organisations:["White House","Government of Israel"]}],
 ["2025-10-13","Address at special Knesset sitting honoring President Trump","Jerusalem","Knesset",["Parliamentary ceremonial address","Live broadcast"],"knesset-trump-2025-10-13","government","verified","p-trump","Donald Trump","Amir Ohana, Isaac Herzog and members of Knesset attended.",{summary:"Netanyahu welcomed Trump, thanked him for his role in the hostage return and argued the US proposal could open a historic expansion of regional peace.",organisations:["Knesset"]}],
 ["2025-10-14","CBS Mornings interview with Tony Dokoupil","Tel Aviv","CBS News interview location",["Television sit-down interview","Recorded appearance"],"cbs-dokoupil-2025-10-14","media","verified",undefined,undefined,"Interviewed by Tony Dokoupil.",{summary:"Dokoupil interviewed Netanyahu on Trump, the Gaza deal, Hamas disarmament and Netanyahu’s leadership decisions.",organisations:["CBS News"]}],
 ["2025-12-08","Knesset debate on Israel’s international standing","Jerusalem","Knesset",["Parliamentary address","Government activity","Live broadcast"],"knesset-2025-12-08","government","verified",undefined,undefined,"Opposition and coalition members of Knesset attended.",{summary:"Netanyahu rejected claims that Israel’s international standing had collapsed and discussed military service and plans for an October 7 inquiry.",organisations:["Knesset"]}],
 ["2025-12-29","Exchange with reporters with President Trump at Mar-a-Lago","Palm Beach","Mar-a-Lago Club",["Press availability","Live media availability","Diplomatic appearance"],"govinfo-maralago-2025-12-29","press","verified","p-trump","Donald Trump","Reporters attended; event began at 13:26 local time.",{summary:"Netanyahu joined Trump for an exchange with reporters during a greeting at Mar-a-Lago, covering Gaza, regional security and bilateral issues.",address:"1100 S Ocean Blvd",time:"13:26",timezone:"America/New_York",organisations:["Office of the President of the United States"]}],
 ["2025-12-30","Bret Baier year-end interview on Gaza ceasefire","Location not established","Fox News / Bret Baier",["Television sit-down interview","Recorded appearance"],"fox-baier-2025-12-30","media","verified","p-baier","Bret Baier","Runtime 15m; recorded in the United States.",{summary:"Baier interviewed Netanyahu after his Trump meeting about advancing the second phase of the Israel-Hamas ceasefire and future governance in Gaza.",organisations:["Fox News"]}],
];

const netanyahuParticipant = { personId:"p-netanyahu", name:"Benjamin Netanyahu", role:"principal", presenceConfidence:"confirmed" as Confidence };
export const events: EventRecord[] = seeds.map((s, index) => {
  const [date,title,city,venue,types,sourceId,scope,status="verified",otherId,otherName,note,details] = s;
  const c = coords[city] ?? [null,null,null,null];
  const source = sources.find(item => item.id === sourceId);
  const participants: EventRecord["participants"] = [netanyahuParticipant];
  if (otherId && otherName) participants.push({personId:otherId,name:otherName,role:"participant",presenceConfidence:status === "verified" ? "confirmed" : "strong"});
  const timed2pm = note?.includes("2:00 p.m.");
  const timed110 = note?.includes("1:10 p.m.");
  const timed112 = note?.includes("1:12 p.m.");
  const timed732 = note?.includes("7:32 a.m.");
  const localStartTime = details?.time ?? (timed2pm ? "14:00" : timed110 ? "13:10" : timed112 ? "13:12" : timed732 ? "07:32" : null);
  const timezone = details?.timezone ?? (localStartTime ? (["New York","Washington","Palm Beach"].includes(city) ? "America/New_York" : ["Jerusalem","Tel Aviv","Rehovot","Lod area"].includes(city) ? "Asia/Jerusalem" : null) : null);
  return {
    id:`evt-${String(index+1).padStart(6,"0")}`, slug:`${date}-${title.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)/g,"")}`,
    eventName:title, summary:details?.summary ?? title + ".", categories:Array.from(new Set(types.map(t => t.includes("Speech") || t.includes("Statement") ? "Public record" : t.includes("Meeting") ? "Encounter" : "Civic record"))), eventTypes:types,
    startDate:date,endDate:null,localStartTime,localEndTime:null,timezone,datePrecision:"exact",timePrecision:localStartTime ? "exact" : "unknown",
    platform:source?.publisher ?? null,venueName:venue || null,address:details?.address ?? (venue === "770 Eastern Parkway" ? "770 Eastern Parkway, Brooklyn, NY 11213" : null),
    city,region:c[2] as string | null,country:(c[3] as string | null) ?? (city === "Jerusalem" || city === "Erez" || city === "Tel Aviv" ? "Israel" : "Unknown"),latitude:c[0] as number | null,longitude:c[1] as number | null,locationPrecision:c[0] == null ? "unknown" : venue ? "venue" : "city",
    participants,organisations:details?.organisations ?? (sourceId.startsWith("un-") ? ["United Nations"] : sourceId.includes("wye") ? ["Government of Israel","Palestine Liberation Organization","United States Government"] : []),notes:note || null,scope:scope as EventRecord["scope"],medium:source?.sourceType === "archive-photo" ? ["photograph"] : source?.sourceType === "archive-video" ? ["video"] : source?.sourceType === "transcript" ? ["transcript"] : source?.sourceType === "contemporary-report" || source?.sourceType === "retrospective" ? ["article"] : ["document"],confidence:status === "verified" ? "confirmed" : "moderate",verificationStatus:status,sourceIds:[sourceId],quotes:[],media:[],provenance:[sourceId],conflictingClaims:[],reviewedAt:"2026-08-31"
  };
});

export const sourceById = (id:string) => sources.find(s=>s.id===id);
export const eventBySlug = (slug:string) => events.find(e=>e.slug===slug);
export const personBySlug = (slug:string) => people.find(p=>p.slug===slug);
export const verifiedEvents = events.filter(e=>e.verificationStatus === "verified");
export const years = Array.from(new Set(events.map(e=>e.startDate.slice(0,4)))).sort();
