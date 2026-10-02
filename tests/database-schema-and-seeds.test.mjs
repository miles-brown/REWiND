import test, { after } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
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

const { masterPeopleSeed } = await vite.ssrLoadModule("/data/seeds/index.ts");
const { eventsCorpus } = await vite.ssrLoadModule("/data/seeds/events-corpus.ts");
const { sourcesCorpus } = await vite.ssrLoadModule("/data/seeds/sources-corpus.ts");
const { getPeople, getPersonBySlug } = await vite.ssrLoadModule("/lib/rewind/people.ts");
const { getEventsByPerson, getFallbackEventsResult } = await vite.ssrLoadModule("/lib/rewind/events.ts");

const VALID_RELIGION_STATUSES = new Set([
  "self-identified",
  "scholarly-consensus",
  "historical-affiliation-only",
  "not-publicly-stated",
  "disputed",
  "unspecified",
]);

const VALID_CONFIDENCES = new Set([
  "confirmed",
  "strong",
  "moderate",
  "limited",
  "disputed",
]);

test("verifies Canonical Master People Seeds (200+ Figure Corpus)", () => {
  assert.ok(masterPeopleSeed.length >= 200, `Expected >= 200 figures, found ${masterPeopleSeed.length}`);
  const slugSet = new Set(masterPeopleSeed.map((p) => p.slug));
  assert.equal(slugSet.size, masterPeopleSeed.length, "All person slugs must be strictly unique");

  masterPeopleSeed.forEach((p) => {
    assert.ok(p.id, `Person must have id: ${JSON.stringify(p)}`);
    assert.ok(p.slug, `Person ${p.id} must have slug`);
    assert.ok(p.canonicalName, `Person ${p.slug} must have canonicalName`);
    assert.ok(p.displayName, `Person ${p.slug} must have displayName`);
    assert.ok(p.birthDate, `Person ${p.slug} must have birthDate`);
    assert.ok(p.classification, `Person ${p.slug} must have classification`);
    assert.ok(p.summary && p.summary.length >= 20, `Person ${p.slug} must have substantive summary`);
  });
});

test("enforces strict evidentiary standards for sensitive demographics (Religion & Status)", () => {
  masterPeopleSeed.forEach((p) => {
    if (p.religionStatus) {
      assert.ok(
        VALID_RELIGION_STATUSES.has(p.religionStatus),
        `Invalid religionStatus '${p.religionStatus}' on person ${p.slug}`
      );
    }
    if (p.religion && p.religion.trim().length > 0) {
      assert.ok(
        p.religionStatus != null && p.religionStatus !== "not-publicly-stated",
        `Person ${p.slug} with religion '${p.religion}' must specify valid affirmative religionStatus (not 'not-publicly-stated')`
      );
    }
  });
});

test("verifies geographic identity rigor (citizenship vs national identity vs ethnicity)", () => {
  masterPeopleSeed.forEach((p) => {
    if (p.citizenship) {
      assert.ok(Array.isArray(p.citizenship), `citizenship must be array on ${p.slug}`);
      p.citizenship.forEach((c) => assert.equal(typeof c, "string", `citizenship elements must be strings on ${p.slug}`));
    }
    if (p.languages) {
      assert.ok(Array.isArray(p.languages), `languages must be array on ${p.slug}`);
    }
  });
});

test("verifies Historical Events Corpus & Spatial/Evidence Integrity", () => {
  eventsCorpus.forEach((e) => {
    assert.ok(e.id, `Event must have id`);
    assert.ok(e.slug, `Event ${e.id} must have slug`);
    assert.ok(e.eventName, `Event ${e.id} must have eventName`);
    assert.ok(e.startDate, `Event ${e.id} must have startDate`);
    assert.match(e.startDate, /^\d{4}/, `Event ${e.id} startDate must start with 4-digit year`);

    if (e.latitude != null && e.longitude != null) {
      assert.ok(
        e.latitude >= -90 && e.latitude <= 90,
        `Event ${e.id} latitude ${e.latitude} out of bounds [-90, 90]`
      );
      assert.ok(
        e.longitude >= -180 && e.longitude <= 180,
        `Event ${e.id} longitude ${e.longitude} out of bounds [-180, 180]`
      );
    }
  });
});

test("verifies all event sourceIds reference valid catalogued sources", () => {
  const sourceIdSet = new Set(sourcesCorpus.map((s) => s.id));
  eventsCorpus.forEach((e) => {
    assert.ok(Array.isArray(e.sourceIds) && e.sourceIds.length > 0, `Event ${e.id} must have sourceIds`);
    e.sourceIds.forEach((sId) => {
      assert.ok(sourceIdSet.has(sId), `Event ${e.id} references non-existent sourceId '${sId}'`);
    });
  });
});

test("verifies participant presence confidence and co-attendance rosters", () => {
  eventsCorpus.forEach((e) => {
    if (e.participants && e.participants.length > 0) {
      e.participants.forEach((p) => {
        assert.ok(p.personId || p.slug, `Participant in ${e.id} must have person identifier`);
        assert.ok(p.name, `Participant in ${e.id} must have name`);
        if (p.presenceConfidence) {
          assert.ok(
            VALID_CONFIDENCES.has(p.presenceConfidence),
            `Invalid presenceConfidence '${p.presenceConfidence}' on participant ${p.name} in ${e.id}`
          );
        }
      });
    }
  });
});

test("verifies travel corridor events contain valid origin/destination waypoints", () => {
  const travelEvents = eventsCorpus.filter((e) => e.isTravelEvent);
  assert.ok(travelEvents.length > 0, "Should have documented travel corridor events");
  travelEvents.forEach((t) => {
    assert.ok(t.originWaypoint, `Travel event ${t.id} must have originWaypoint`);
    assert.ok(t.destinationWaypoint, `Travel event ${t.id} must have destinationWaypoint`);
    assert.ok(t.originWaypoint.latitude != null && t.originWaypoint.longitude != null);
    assert.ok(t.destinationWaypoint.latitude != null && t.destinationWaypoint.longitude != null);
  });
});

test("retrieves full people corpus with fallback hydration", async () => {
  const people = await getPeople();
  assert.ok(people.length >= 200, `Expected >= 200 people, got ${people.length}`);
  const benjamin = await getPersonBySlug("benjamin-netanyahu");
  assert.ok(benjamin, "Expected to retrieve benjamin-netanyahu");
  assert.equal(benjamin.canonicalName, "Benjamin Netanyahu");
  assert.equal(benjamin.religion, "Judaism");
  assert.equal(benjamin.religionStatus, "self-identified");
});

test("queries events by person slug and returns chronologically sorted results", async () => {
  const bEvents = await getEventsByPerson("benjamin-netanyahu");
  assert.ok(bEvents.length > 0, "Expected events for benjamin-netanyahu");
  for (let i = 1; i < bEvents.length; i++) {
    assert.ok(
      bEvents[i - 1].startDate.localeCompare(bEvents[i].startDate) <= 0,
      "Events must be sorted chronologically ascending"
    );
  }
});

test("supports search filtering across fallback events result", () => {
  const res = getFallbackEventsResult({ search: "Jerusalem" });
  assert.ok(res.data.length > 0, "Search for 'Jerusalem' should return matching events");
  assert.ok(res.count > 0);
});
