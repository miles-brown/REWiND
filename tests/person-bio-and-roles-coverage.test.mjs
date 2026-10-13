import test, { after } from "node:test";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { createServer } from "vite";

const root = fileURLToPath(new URL("..", import.meta.url));

const vite = await createServer({
  appType: "custom",
  configFile: false,
  root,
  resolve: { alias: { "@": root } },
  server: { middlewareMode: true },
});

after(async () => {
  if (vite) await vite.close();
});

const { getPersonRoles } = await vite.ssrLoadModule("/lib/rewind/roles.ts");
const { getPersonMilestones } = await vite.ssrLoadModule("/lib/rewind/milestones.ts");
const { getPersonBySlugWithStatus, getPersonTimeline } = await vite.ssrLoadModule("/lib/rewind/people.ts");
const { officialRolesSeed, milestonesSeed, allEducationSeed, allCareerSeed, allAwardsSeed, allWorksSeed, allStaysSeed, sourcesCorpus } = await vite.ssrLoadModule("/data/seeds/index.ts");

const TEST_SET_50_SLUGS = [
  "ehud-barak", "yitzhak-rabin", "shimon-peres", "avigdor-lieberman", "ron-dermer",
  "mahmoud-abbas", "yasser-arafat", "saeb-erekat", "ismail-haniyeh", "khaled-mashal",
  "marwan-barghouti", "joe-biden", "donald-trump", "barack-obama", "bill-clinton",
  "hillary-clinton", "kamala-harris", "dick-cheney", "mike-pompeo", "nancy-pelosi",
  "chuck-schumer", "mitch-mcconnell", "bernie-sanders", "thomas-massie", "randy-fine",
  "jared-kushner", "keir-starmer", "tony-blair", "jeremy-corbyn", "george-galloway",
  "ken-livingstone", "jack-straw", "elon-musk", "michael-bloomberg", "larry-king",
  "barbara-walters", "christiane-amanpour", "tucker-carlson", "candace-owens", "charlie-kirk",
  "ben-shapiro", "andrew-neil", "anderson-cooper", "tom-brokaw", "peter-jennings",
  "lester-holt", "diane-sawyer", "emmanuel-macron", "vladimir-putin", "jeffrey-epstein"
];

test("Benjamin Netanyahu biographical dossier, official roles, and milestones are thoroughly populated", async () => {
  const roles = await getPersonRoles("benjamin-netanyahu");
  assert.ok(roles.length >= 8, `Netanyahu must have at least 8 official roles, got ${roles.length}`);
  assert.ok(roles.some((r) => r.title.includes("Prime Minister of Israel")), "Must include Prime Minister role");
  assert.ok(roles.some((r) => r.title.includes("Permanent Representative")), "Must include UN Ambassador role");
  assert.ok(roles.some((r) => r.title.includes("Minister of Finance")), "Must include Minister of Finance role");
  assert.ok(roles.some((r) => r.organisationName === "Government of Israel"), "Must include Government of Israel organisationName");

  const milestones = await getPersonMilestones("benjamin-netanyahu");
  assert.ok(milestones.length >= 5, `Netanyahu must have at least 5 milestones, got ${milestones.length}`);
  assert.ok(milestones.some((m) => m.title.includes("Abraham Accords")), "Must include Abraham Accords milestone");
  assert.ok(milestones.some((m) => m.title.includes("Longest-Serving")), "Must include Longest-Serving PM record");

  const { data: person } = await getPersonBySlugWithStatus("benjamin-netanyahu", null);
  assert.ok(person, "Must retrieve Netanyahu person record");
  assert.equal(person.nationality, "Israeli");
  assert.ok(person.education && person.education.length >= 3, "Must have MIT education records");
  assert.ok(person.education.some((e) => e.institution.includes("Massachusetts Institute of Technology")));
  assert.ok(person.career && person.career.length >= 8, "Must have comprehensive career records");
  assert.ok(person.career.some((c) => c.organisationName.includes("Sayeret Matkal")));
  assert.ok(person.works && person.works.length >= 4, "Must have authored books/works");
  assert.ok(person.works.some((w) => (w.workTitle || "").includes("A Place Among the Nations") || (w.workTitle || "").includes("Bibi: My Story")));
  assert.ok(person.stays && person.stays.length >= 2, "Must have verified residences (Balfour / Caesarea)");
  assert.ok(person.stays.some((s) => s.venueName.includes("Balfour") || s.venueName.includes("Beit Aghion")));
  assert.ok(person.awards && person.awards.length >= 2, "Must have awards / valor commendations");
});

test("Rabbi Shmuley Boteach complete dossier, timeline events, milestones, career, and bio fields are thoroughly populated", async () => {
  const roles = await getPersonRoles("shmuley-boteach");
  assert.ok(roles.length >= 4, `Boteach must have at least 4 official roles, got ${roles.length}`);
  assert.ok(roles.some((r) => r.title.includes("Oxford L'Chaim Society")), "Must include Oxford L'Chaim Society role");
  assert.ok(roles.some((r) => r.title.includes("Executive Director") || r.organisationName?.includes("World Values Network")), "Must include World Values Network role");
  assert.ok(roles.some((r) => r.title.includes("Shalom in the Home")), "Must include Shalom in the Home role");
  assert.ok(roles.some((r) => r.title.includes("House of Representatives")), "Must include Congressional nominee role");
  assert.ok(roles.every((r) => typeof r.organisationName === "string" && r.organisationName.length > 0));

  const milestones = await getPersonMilestones("shmuley-boteach");
  assert.ok(milestones.length >= 6, `Boteach must have at least 6 milestones, got ${milestones.length}`);
  assert.ok(milestones.some((m) => m.title.includes("Kosher Sex")), "Must include Kosher Sex milestone");
  assert.ok(milestones.some((m) => m.title.includes("Oxford Union")), "Must include Oxford Union milestone");
  assert.ok(milestones.some((m) => m.title.includes("Republican Nomination")), "Must include Congressional nomination milestone");
  assert.ok(milestones.every((m) => m.sourceId && m.sourceId.startsWith("src-")));

  const { data: person } = await getPersonBySlugWithStatus("shmuley-boteach", null);
  assert.ok(person, "Must retrieve Shmuley Boteach person record");
  assert.equal(person.canonicalName, "Shmuley Boteach");
  assert.equal(person.displayName, "Rabbi Shmuley Boteach");
  assert.equal(person.nationality, "American");
  assert.equal(person.fullBirthName, "Shmuel Boteach");
  assert.equal(person.ethnicity, "Jewish");
  assert.ok(person.achievements && person.achievements.length >= 4, "Must have achievements array");

  assert.ok(person.education && person.education.length >= 3, "Must have Rabbinical ordination and education credentials");
  assert.ok(person.education.some((e) => e.degree?.includes("Rabbinical Ordination") || e.institution.includes("Machon LeHora'ah")));
  assert.ok(person.career && person.career.length >= 4, "Must have career records");
  assert.ok(person.career.some((c) => c.organisationName.includes("World Values Network")));
  assert.ok(person.works && person.works.length >= 6, "Must have authored treatises and books");
  assert.ok(person.works.some((w) => w.workTitle.includes("Kosher Sex")));
  assert.ok(person.stays && person.stays.length >= 3, "Must have residences (Oxford, Englewood, Manhattan)");
  assert.ok(person.awards && person.awards.length >= 3, "Must have awards (London Times Preacher, Fatherhood Award)");

  const timeline = await getPersonTimeline("shmuley-boteach");
  assert.ok(timeline, "Must resolve person timeline");
  assert.ok(timeline.events.length >= 3, `Must have at least 3 timeline events, got ${timeline.events.length}`);
  assert.ok(timeline.events.some((e) => e.eventName.includes("Oxford Union")), "Must include Oxford Union event in timeline");
  assert.ok(timeline.events.some((e) => e.eventName.includes("General Election")), "Must include General Election event in timeline");
  assert.ok(timeline.events.some((e) => e.eventName.includes("Capitol Hill Briefing")), "Must include Capitol Hill panel in timeline");
});

test("Test set of 50 core figures across the site have fully populated roles, milestones, and education/career", async () => {
  assert.equal(TEST_SET_50_SLUGS.length, 50, "Test set must contain exactly 50 figures");

  for (const slug of TEST_SET_50_SLUGS) {
    const roles = await getPersonRoles(slug);
    assert.ok(
      roles.length > 0,
      `Figure '${slug}' must have at least one registered official role in officialRolesSeed`
    );
    assert.ok(
      roles.every((r) => typeof r.organisationName === "string" && r.organisationName.length > 0),
      `Figure '${slug}' roles must propagate non-empty organisationName`
    );

    const milestones = await getPersonMilestones(slug);
    assert.ok(
      milestones.length > 0,
      `Figure '${slug}' must have at least one registered personal milestone in milestonesSeed`
    );

    const { data: person } = await getPersonBySlugWithStatus(slug, null);
    assert.ok(person, `Figure '${slug}' must resolve a valid PersonRecord`);

    assert.ok(
      person.education && person.education.length > 0,
      `Figure '${slug}' must have structured education credentials in allEducationSeed`
    );

    assert.ok(
      person.career && person.career.length > 0,
      `Figure '${slug}' must have structured career mandates in allCareerSeed`
    );
  }
});

test("Seeds integrity, ID uniqueness, and collection exports consistency", async () => {
  assert.ok(officialRolesSeed.length >= 170, `officialRolesSeed must have >= 170 items, got ${officialRolesSeed.length}`);
  assert.ok(milestonesSeed.length >= 55, `milestonesSeed must have >= 55 items, got ${milestonesSeed.length}`);
  assert.ok(allEducationSeed.length >= 70, `allEducationSeed must have >= 70 items, got ${allEducationSeed.length}`);
  assert.ok(allCareerSeed.length >= 100, `allCareerSeed must have >= 100 items, got ${allCareerSeed.length}`);
  assert.ok(allAwardsSeed.length >= 30, `allAwardsSeed must have >= 30 items, got ${allAwardsSeed.length}`);
  assert.ok(allWorksSeed.length >= 30, `allWorksSeed must have >= 30 items, got ${allWorksSeed.length}`);
  assert.ok(allStaysSeed.length >= 30, `allStaysSeed must have >= 30 items, got ${allStaysSeed.length}`);

  // Strict ID uniqueness assertions
  const roleIds = officialRolesSeed.map((r) => r.id);
  assert.equal(new Set(roleIds).size, roleIds.length, "All officialRolesSeed IDs must be unique");

  const milestoneIds = milestonesSeed.map((m) => m.id);
  assert.equal(new Set(milestoneIds).size, milestoneIds.length, "All milestonesSeed IDs must be unique");

  const eduIds = allEducationSeed.map((e) => e.id);
  assert.equal(new Set(eduIds).size, eduIds.length, "All allEducationSeed IDs must be unique");

  const careerIds = allCareerSeed.map((c) => c.id);
  assert.equal(new Set(careerIds).size, careerIds.length, "All allCareerSeed IDs must be unique");

  const awardIds = allAwardsSeed.map((a) => a.id);
  assert.equal(new Set(awardIds).size, awardIds.length, "All allAwardsSeed IDs must be unique");

  const workIds = allWorksSeed.map((w) => w.id);
  assert.equal(new Set(workIds).size, workIds.length, "All allWorksSeed IDs must be unique");

  const stayIds = allStaysSeed.map((s) => s.id);
  assert.equal(new Set(stayIds).size, stayIds.length, "All allStaysSeed IDs must be unique");

  // Strict 4-digit year format consistency (^\d{4}$)
  const fourDigitYearRegex = /^\d{4}$/;
  for (const edu of allEducationSeed) {
    if (edu.startYear) assert.match(edu.startYear, fourDigitYearRegex, `Invalid startYear format in edu ${edu.id}: ${edu.startYear}`);
    if (edu.endYear) assert.match(edu.endYear, fourDigitYearRegex, `Invalid endYear format in edu ${edu.id}: ${edu.endYear}`);
  }
  for (const awd of allAwardsSeed) {
    if (awd.yearReceived) assert.match(awd.yearReceived, fourDigitYearRegex, `Invalid yearReceived format in award ${awd.id}: ${awd.yearReceived}`);
  }
  for (const wrk of allWorksSeed) {
    if (wrk.publicationYear) assert.match(wrk.publicationYear, fourDigitYearRegex, `Invalid publicationYear format in work ${wrk.id}: ${wrk.publicationYear}`);
  }

  // Sourcing integrity: 100% of seed entities have valid sourceIds resolving in sourcesCorpus
  const sourceIdSet = new Set(sourcesCorpus.map((s) => s.id));
  for (const edu of allEducationSeed) {
    assert.ok(edu.sourceId, `Edu ${edu.id} must have a valid sourceId`);
    assert.ok(sourceIdSet.has(edu.sourceId), `Source ${edu.sourceId} in edu ${edu.id} must exist in sourcesCorpus`);
  }
  for (const car of allCareerSeed) {
    assert.ok(car.sourceId, `Career ${car.id} must have a valid sourceId`);
    assert.ok(sourceIdSet.has(car.sourceId), `Source ${car.sourceId} in career ${car.id} must exist in sourcesCorpus`);
  }
  for (const awd of allAwardsSeed) {
    assert.ok(awd.sourceId, `Award ${awd.id} must have a valid sourceId`);
    assert.ok(sourceIdSet.has(awd.sourceId), `Source ${awd.sourceId} in award ${awd.id} must exist in sourcesCorpus`);
  }
  for (const wrk of allWorksSeed) {
    assert.ok(wrk.sourceId, `Work ${wrk.id} must have a valid sourceId`);
    assert.ok(sourceIdSet.has(wrk.sourceId), `Source ${wrk.sourceId} in work ${wrk.id} must exist in sourcesCorpus`);
  }
  for (const stay of allStaysSeed) {
    assert.ok(stay.sourceId, `Stay ${stay.id} must have a valid sourceId`);
    assert.ok(sourceIdSet.has(stay.sourceId), `Source ${stay.sourceId} in stay ${stay.id} must exist in sourcesCorpus`);
  }
});

test("Rabbi Shmuley Boteach dossier, timeline, and 20 viral encounter videos are populated with forensic integrity", async () => {
  const roles = await getPersonRoles("shmuley-boteach");
  assert.ok(roles.length >= 4, `Boteach must have at least 4 official roles, got ${roles.length}`);
  assert.ok(roles.some((r) => r.title.includes("L'Chaim Society")));
  assert.ok(roles.some((r) => r.organisationName === "The World Values Network"));
  assert.ok(roles.some((r) => r.title.includes("Shalom in the Home")));
  assert.ok(roles.some((r) => r.title.includes("Republican Nominee")));

  const milestones = await getPersonMilestones("shmuley-boteach");
  assert.ok(milestones.length >= 6, `Boteach must have at least 6 milestones, got ${milestones.length}`);
  assert.ok(milestones.some((m) => m.title.includes("Kosher Sex")));
  assert.ok(milestones.some((m) => m.title.includes("Oxford Union")));

  const { data: person } = await getPersonBySlugWithStatus("shmuley-boteach", null);
  assert.ok(person, "Must retrieve Shmuley Boteach person record");
  assert.equal(person.canonicalName, "Shmuley Boteach");
  assert.ok(person.education && person.education.length >= 3, "Must have education records");
  assert.ok(person.career && person.career.length >= 4, "Must have career records");
  assert.ok(person.awards && person.awards.length >= 3, "Must have awards records");
  assert.ok(person.works && person.works.length >= 6, "Must have published works");

  // Timeline events
  const timelineResult = await getPersonTimeline("shmuley-boteach");
  assert.ok(timelineResult && timelineResult.events, "Must retrieve timeline result with events");
  const timeline = timelineResult.events;
  assert.ok(timeline.length >= 20, `Boteach must have at least 20 documented timeline events, got ${timeline.length}`);

  // Encounter verification
  const akureyri = timeline.find((e) => e.slug.includes("akureyri"));
  assert.ok(akureyri, "Must include Akureyri viral street encounter");
  assert.equal(akureyri.city, "Akureyri");
  assert.equal(akureyri.country, "Iceland");
  assert.ok(akureyri.media && akureyri.media.length > 0, "Must have media attached");
  assert.equal(akureyri.media[0].kind, "video");
  assert.ok(akureyri.media[0].url, "Must have valid primary video url");

  const bar22 = timeline.find((e) => e.slug.includes("bar-22"));
  assert.ok(bar22, "Must include Bar 22 encounter");
  assert.equal(bar22.venueName, "Bar 22");

  const piers = timeline.find((e) => e.slug.includes("piers-morgan"));
  assert.ok(piers, "Must include Piers Morgan debate");
  assert.ok(piers.media && piers.media[0]?.embedUrl, "Piers Morgan debate must have embedUrl");
  assert.ok(!piers.media[0]?.embedUrl?.includes("dQw4w9WgXcQ"), "Piers Morgan debate must not use placeholder video");

  // Strict check that no media item in the entire timeline uses Rickroll placeholder dQw4w9WgXcQ
  for (const ev of timeline) {
    if (ev.media) {
      for (const m of ev.media) {
        if (m.url) assert.ok(!m.url.includes("dQw4w9WgXcQ"), `Event ${ev.id} must not use Rickroll placeholder in url`);
        if (m.embedUrl) assert.ok(!m.embedUrl.includes("dQw4w9WgXcQ"), `Event ${ev.id} must not use Rickroll placeholder in embedUrl`);
      }
    }
  }

  const amsterdam = timeline.find((e) => e.slug.includes("amsterdam"));
  assert.ok(amsterdam, "Must include Amsterdam Dam Square confrontation");

  const timesSquareFamily = timeline.find((e) => e.slug.includes("times-square-family"));
  assert.ok(timesSquareFamily, "Must include Times Square family confrontation");

  const ferrara = timeline.find((e) => e.slug.includes("ferrara"));
  assert.ok(ferrara, "Must include Ferrara synagogue quarter encounter");
  assert.equal(ferrara.city, "Ferrara");
  assert.equal(ferrara.country, "Italy");
  assert.ok(ferrara.subvenue?.includes("Bar Mazzini"), "Ferrara event must designate Bar Mazzini as lead candidate subvenue");
  assert.ok(ferrara.sourceIds.includes("src-museo-ferrara-synagogue"), "Ferrara event must cite MuseoFerrara");

  // Refined October 13 evidence assertions
  const timesSquareRally = timeline.find((e) => e.slug.includes("2024-07-31-rabbi-shmuley-times-square-pro-israel-rally"));
  assert.ok(timesSquareRally, "Must include 31 July 2024 Times Square pro-Israel rally as distinct event");
  assert.equal(timesSquareRally.confidence, "confirmed");
  assert.ok(timesSquareRally.sourceIds.includes("src-jns-times-square-rally-2024"));

  const vienna = timeline.find((e) => e.slug.includes("stephansplatz"));
  assert.ok(vienna, "Must include Vienna Stephansplatz confrontation");
  assert.equal(vienna.confidence, "confirmed", "Vienna event must be promoted to confirmed confidence");
  assert.ok(vienna.sourceIds.includes("src-euronews-vienna-boteach-2025"), "Vienna must include Euronews citation");
  assert.ok(vienna.sourceIds.includes("src-x-boteach-vienna-post-2025"), "Vienna must include primary X post citation");

  const pier45 = timeline.find((e) => e.slug.includes("nyc-waterfront-park-confrontation"));
  assert.ok(pier45, "Must include Pier 45 waterfront confrontation");
  assert.equal(pier45.confidence, "confirmed", "Pier 45 must be confirmed confidence");
  assert.equal(pier45.timezone, "America/New_York");
  assert.equal(pier45.localStartTime, "21:51");
  assert.ok(pier45.sourceIds.includes("src-rumble-sperg-archives-pier-45"), "Pier 45 must cite Sperg Archives");

  const nypdEncounter = timeline.find((e) => e.slug.includes("nypd-verbal-complaint-encounter"));
  assert.ok(nypdEncounter, "Must include Midtown NYPD encounter");
  assert.ok(nypdEncounter.participants.some((p) => p.name.includes("Salvo")), "NYPD encounter must identify Salvo in participants");
  assert.ok(nypdEncounter.sourceIds.includes("src-podawful-salvo-boteach-2026"), "NYPD encounter must cite PODAWFUL investigation");

  // All events have non-empty sourceIds resolving in sourcesCorpus
  const sourceIdSet = new Set(sourcesCorpus.map((s) => s.id));
  for (const event of timeline) {
    assert.ok(Array.isArray(event.sourceIds) && event.sourceIds.length > 0, `Event ${event.id} must have sourceIds`);
    for (const srcId of event.sourceIds) {
      assert.ok(sourceIdSet.has(srcId), `Source ${srcId} on event ${event.id} must exist in sourcesCorpus`);
    }
    // Verified coordinate integrity
    assert.ok(typeof event.latitude === "number" && !isNaN(event.latitude), `Event ${event.id} must have valid latitude`);
    assert.ok(typeof event.longitude === "number" && !isNaN(event.longitude), `Event ${event.id} must have valid longitude`);
  }
});

test("Rabbi Shmuley video-incident gap audit and Iceland participant identity resolutions", async () => {
  // 1. Verify Samúel Guðmundsson canonical person record
  const { data: samuel } = await getPersonBySlugWithStatus("samuel-gudmundsson", null);
  assert.ok(samuel, "Must retrieve Samúel Guðmundsson canonical person record");
  assert.equal(samuel.canonicalName, "Samúel Guðmundsson");
  assert.equal(samuel.nationality, "Icelandic");

  // 2. Verify Boteach timeline contains all newly resolved and disambiguated events
  const { events: timeline } = await getPersonTimeline("shmuley-boteach");
  assert.ok(Array.isArray(timeline), "Timeline must be an array of events");

  // Akureyri street encounter: Samúel Guðmundsson participant & both video perspectives
  const akureyri = timeline.find((e) => e.slug.includes("akureyri-street-encounter"));
  assert.ok(akureyri, "Must include Akureyri street encounter");
  assert.ok(akureyri.participants.some((p) => p.personId === "samuel-gudmundsson"), "Akureyri participant must be samuel-gudmundsson");
  assert.ok(!akureyri.eventName.includes("Ólason"), "Akureyri event name must not reference journalist Ólason");
  assert.ok(akureyri.media && akureyri.media.length >= 2, "Akureyri encounter must provide both camera perspectives");
  assert.ok(akureyri.media.some((m) => m.label.includes("Boteach Extended")), "Must have Boteach extended cut");
  assert.ok(akureyri.media.some((m) => m.label.includes("Guðmundsson Camera Perspective")), "Must have Guðmundsson perspective");

  // Piers Morgan Uncensored debate: Samúel Guðmundsson participant
  const piersDebate = timeline.find((e) => e.slug.includes("piers-morgan-uncensored-rabbi-shmuley-samuel-debate"));
  assert.ok(piersDebate, "Must include Piers Morgan Uncensored debate");
  assert.ok(piersDebate.participants.some((p) => p.personId === "samuel-gudmundsson"), "Piers Morgan debate must link samuel-gudmundsson");
  assert.ok(!piersDebate.eventName.includes("Ólason"), "Piers Morgan debate must not reference journalist Ólason");

  // Argentina supporters encounter: strictly July 2024, not 2026
  const argentina2024 = timeline.find((e) => e.id === "evt-2024-07-19-times-square-argentina-supporters-encounter");
  assert.ok(argentina2024, "Must include July 2024 Argentina supporters encounter");
  assert.ok(argentina2024.startDate.startsWith("2024-07-19"), "Argentina supporters encounter must be dated 19 July 2024");
  const argentina2026 = timeline.find((e) => e.id === "evt-2026-07-19-times-square-argentina-supporters-encounter");
  assert.equal(argentina2026, undefined, "Duplicate 2026 Argentina supporters entry must be removed");

  // Fontainebleau lobby confrontation (1 Dec 2024) vs civic forum (15 Dec 2024)
  const fontainebleauLobby = timeline.find((e) => e.id === "evt-2024-12-01-fontainebleau-miami-beach-lobby-confrontation");
  assert.ok(fontainebleauLobby, "Must include 1 Dec 2024 Fontainebleau lobby confrontation");
  assert.ok(fontainebleauLobby.startDate.startsWith("2024-12-01"), "Lobby confrontation must be dated 1 Dec 2024");
  const fontainebleauForum = timeline.find((e) => e.id === "evt-2024-12-15-fontainebleau-miami-beach-forum-encounter");
  assert.ok(fontainebleauForum, "Must retain 15 Dec 2024 Fontainebleau civic forum as distinct event");

  // Toledo Palestine march confrontation (6 June 2025)
  const toledo = timeline.find((e) => e.id === "evt-2025-06-06-toledo-spain-palestine-march-confrontation");
  assert.ok(toledo, "Must include Toledo Palestine march confrontation");
  assert.ok(toledo.sourceIds.includes("src-x-boteach-toledo-post-2025"), "Toledo must cite original X video post");
  assert.ok(toledo.sourceIds.includes("src-24vids-toledo-boteach-2025"), "Toledo must cite 24vids archive");

  // Times Square Knicks game confrontation (10 June 2026)
  const knicks = timeline.find((e) => e.id === "evt-2026-06-10-times-square-knicks-confrontation");
  assert.ok(knicks, "Must include Times Square Knicks game confrontation");
  assert.ok(knicks.sourceIds.includes("src-x-boteach-knicks-post-2026"), "Knicks game confrontation must cite original X post");
  assert.ok(knicks.sourceIds.includes("src-israel-hayom-knicks-boteach-2026"), "Knicks game confrontation must cite Israel Hayom");

  // Midtown Manhattan street altercation (23 October 2024)
  const midtown = timeline.find((e) => e.id === "evt-2024-10-23-midtown-manhattan-street-confrontation");
  assert.ok(midtown, "Must include Midtown Manhattan street altercation");
  assert.ok(midtown.sourceIds.includes("src-x-boteach-midtown-oct2024"));
  assert.ok(midtown.sourceIds.includes("src-reddit-israelexposed-boteach-2024"));

  // Times Square ZOA rally (13 May 2024)
  const zoaRally = timeline.find((e) => e.id === "evt-2024-05-13-times-square-zoa-wvn-rally");
  assert.ok(zoaRally, "Must include 13 May 2024 ZOA & WVN support rally");
  assert.ok(zoaRally.sourceIds.includes("src-zoa-times-square-rally-video-2024"), "ZOA rally must cite official video recording");

  // Times Square Oct 7 memorial (7 October 2024)
  const oct7 = timeline.find((e) => e.id === "evt-2024-10-07-times-square-october-7-memorial");
  assert.ok(oct7, "Must include Times Square 7 October 2024 memorial rally");
});

