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
