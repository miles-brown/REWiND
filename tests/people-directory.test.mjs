import { describe, it, after } from "node:test";
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
  await vite.close();
});

describe("People Directory & Name Parsing Architecture", async () => {
  const peopleModule = await vite.ssrLoadModule("/lib/rewind/people.ts");
  const seedsModule = await vite.ssrLoadModule("/data/seeds/index.ts");
  const { extractPersonNameParts, getPeopleWithStatus } = peopleModule;
  const { masterPeopleSeed } = seedsModule;

  it("exports extractPersonNameParts and getPeopleWithStatus", () => {
    assert.equal(typeof extractPersonNameParts, "function");
    assert.equal(typeof getPeopleWithStatus, "function");
  });

  it("accurately extracts first and last names across diverse naming conventions", () => {
    // 1. Standard Western Names
    assert.deepEqual(extractPersonNameParts({ canonicalName: "Donald J. Trump" }), {
      firstName: "Donald",
      lastName: "Trump",
      displayName: "Donald J. Trump",
    });
    assert.deepEqual(extractPersonNameParts({ canonicalName: "Hillary Clinton" }), {
      firstName: "Hillary",
      lastName: "Clinton",
      displayName: "Hillary Clinton",
    });

    // 2. Middle Eastern & Israeli Names
    assert.deepEqual(extractPersonNameParts({ canonicalName: "Benjamin Netanyahu" }), {
      firstName: "Benjamin",
      lastName: "Netanyahu",
      displayName: "Benjamin Netanyahu",
    });
    assert.deepEqual(extractPersonNameParts({ canonicalName: "David Ben-Gurion" }), {
      firstName: "David",
      lastName: "Ben-Gurion",
      displayName: "David Ben-Gurion",
    });

    // 3. Royal & Titular Names with Comma Suffixes
    const margareta = extractPersonNameParts({ canonicalName: "Margareta, Custodian of the Crown of Romania" });
    assert.equal(margareta.firstName, "Margareta");
    assert.equal(margareta.lastName, "Romania");

    const alexander = extractPersonNameParts({ canonicalName: "Alexander, Crown Prince of Yugoslavia" });
    assert.equal(alexander.firstName, "Alexander");
    assert.equal(alexander.lastName, "Yugoslavia");

    // 4. Honorific Regnal Names
    const pope = extractPersonNameParts({ canonicalName: "Pope Francis" });
    assert.equal(pope.firstName, "Francis");
    assert.equal(pope.lastName, "Francis");

    const charles = extractPersonNameParts({ canonicalName: "King Charles III" });
    assert.equal(charles.firstName, "Charles");
    assert.equal(charles.lastName, "III");

    const felipe = extractPersonNameParts({ canonicalName: "King Felipe VI" });
    assert.equal(felipe.firstName, "Felipe");
    assert.equal(felipe.lastName, "VI");
  });

  it("strictly validates that 100% of people seed records have valid birth dates and clean demonym nationalities", () => {
    assert.ok(masterPeopleSeed.length >= 200, "Master people seed must contain all documented figures");

    for (const p of masterPeopleSeed) {
      assert.ok(p.id, "Person must have id");
      assert.ok(p.slug, "Person must have slug");
      assert.ok(p.canonicalName, `Person ${p.slug} must have canonicalName`);
      assert.ok(p.displayName, `Person ${p.slug} must have displayName`);
      assert.ok(p.birthDate, `Person ${p.slug} must have birthDate`);
      assert.match(p.birthDate, /^\d{4}/, `Person ${p.slug} birthDate must start with 4-digit year: "${p.birthDate}"`);

      // Single clean demonym nationality check
      assert.ok(p.nationality, `Person ${p.slug} must have nationality`);
      assert.ok(!p.nationality.includes("/"), `Person ${p.slug} nationality cannot contain slash: "${p.nationality}"`);
      assert.ok(!p.nationality.includes("&"), `Person ${p.slug} nationality cannot contain ampersand: "${p.nationality}"`);
      assert.ok(
        !["United States", "United Kingdom", "Israel", "France", "Germany", "Palestine"].includes(p.nationality),
        `Person ${p.slug} nationality must be a clean demonym, not country name: "${p.nationality}"`
      );

      // Classification check
      assert.ok(p.classification, `Person ${p.slug} must have classification`);
    }
  });

  it("retrieves people with enriched career roles and milestones", async () => {
    const { data: people, error } = await getPeopleWithStatus();
    assert.equal(error, null);
    assert.ok(people.length >= 200, "People list must be populated");

    // Check Benjamin Netanyahu career roles
    const bibi = people.find((p) => p.slug === "benjamin-netanyahu");
    assert.ok(bibi, "Benjamin Netanyahu must exist");
    assert.ok(bibi.career && bibi.career.length > 0, "Netanyahu must have career roles populated from official roles seed");
    assert.ok(bibi.career.some((r) => r.positionTitle.includes("Prime Minister of Israel")));

    // Check King Charles III education and royal stays
    const charles = people.find((p) => p.slug === "charles-iii");
    assert.ok(charles, "King Charles III must exist");
    assert.ok(charles.education && charles.education.length > 0, "Charles III must have education credentials");
    assert.ok(charles.stays && charles.stays.length > 0, "Charles III must have royal residences/stays");
  });
});
