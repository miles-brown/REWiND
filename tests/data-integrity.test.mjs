import assert from "node:assert/strict";
import test, { after } from "node:test";
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

test("validates archival data integrity in rewind.ts dataset", async () => {
  const { people, events, sources } = await vite.ssrLoadModule("/data/rewind.ts");

  assert.ok(Array.isArray(people) && people.length >= 10, "Dataset must contain at least 10 historical figures");
  assert.ok(Array.isArray(events) && events.length >= 50, "Dataset must contain at least 50 documented events");
  assert.ok(Array.isArray(sources) && sources.length >= 25, "Dataset must contain at least 25 primary sources");

  const personIds = new Set(people.map((p) => p.id));
  const sourceIds = new Set(sources.map((s) => s.id));
  const eventIds = new Set();
  const eventSlugs = new Set();

  const isoDateRegex = /^\d{4}(-\d{2}(-\d{2})?)?$/;

  for (const person of people) {
    assert.ok(person.id, "Person must have an id");
    assert.ok(person.name, `Person ${person.id} must have a name`);
    assert.ok(person.slug, `Person ${person.id} must have a slug`);
    assert.ok(person.description, `Person ${person.id} must have a description`);
  }


  for (const source of sources) {
    assert.ok(source.id, "Source must have an id");
    assert.ok(source.title, `Source ${source.id} must have a title`);
    assert.ok(source.publisher, `Source ${source.id} must have a publisher`);
    assert.ok(source.url, `Source ${source.id} must have a URL`);
    assert.ok(
      source.url.startsWith("http://") || source.url.startsWith("https://"),
      `Source ${source.id} URL must use http/https protocol: ${source.url}`
    );
  }

  for (const evt of events) {
    assert.ok(!eventIds.has(evt.id), `Duplicate event ID detected: ${evt.id}`);
    eventIds.add(evt.id);

    assert.ok(!eventSlugs.has(evt.slug), `Duplicate event slug detected: ${evt.slug}`);
    eventSlugs.add(evt.slug);

    assert.ok(evt.eventName, `Event ${evt.id} must have an eventName`);
    assert.ok(evt.city, `Event ${evt.id} must have a city`);
    assert.ok(
      ["verified", "provisional", "disputed"].includes(evt.verificationStatus),
      `Event ${evt.id} must have valid verificationStatus`
    );

    // Date validation
    assert.ok(
      isoDateRegex.test(evt.startDate),
      `Event ${evt.id} startDate (${evt.startDate}) must match ISO-8601 format`
    );
    if (evt.endDate) {
      assert.ok(
        isoDateRegex.test(evt.endDate),
        `Event ${evt.id} endDate (${evt.endDate}) must match ISO-8601 format`
      );
      assert.ok(
        evt.startDate <= evt.endDate,
        `Event ${evt.id} startDate (${evt.startDate}) must precede endDate (${evt.endDate})`
      );
    }

    // Coordinate validation
    if (evt.latitude != null) {
      assert.ok(
        evt.latitude >= -90 && evt.latitude <= 90,
        `Event ${evt.id} latitude (${evt.latitude}) must be between -90 and 90`
      );
    }
    if (evt.longitude != null) {
      assert.ok(
        evt.longitude >= -180 && evt.longitude <= 180,
        `Event ${evt.id} longitude (${evt.longitude}) must be between -180 and 180`
      );
    }

    // Primary source cross-referencing
    assert.ok(
      Array.isArray(evt.sourceIds) && evt.sourceIds.length > 0,
      `Event ${evt.id} must have non-empty sourceIds`
    );
    for (const sId of evt.sourceIds) {
      assert.ok(
        sourceIds.has(sId),
        `Event ${evt.id} references non-existent source ID: ${sId}`
      );
    }

    // Participant cross-referencing
    if (evt.participants) {
      for (const p of evt.participants) {
        assert.ok(
          personIds.has(p.personId),
          `Event ${evt.id} references non-existent participant personId: ${p.personId}`
        );
      }
    }

    // Text quality
    const summary = evt.summary || "";
    assert.ok(!summary.includes("LOREM IPSUM"), `Event ${evt.id} summary must not contain lorem ipsum`);
    assert.ok(!summary.includes("TODO:"), `Event ${evt.id} summary must not contain unresolved TODOs`);
  }
});
