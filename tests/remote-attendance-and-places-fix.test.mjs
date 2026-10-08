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

describe("Remote Attendance, Attendee Precedence, Capacities & Places Country Normalization", async () => {
  const placesModule = await vite.ssrLoadModule("/lib/rewind/places.ts");
  const eventsModule = await vite.ssrLoadModule("/lib/rewind/events.ts");
  const typesModule = await vite.ssrLoadModule("/lib/rewind/types.ts");

  describe("1. Places Country Normalization & Compound Name Safeguards", () => {
    it("resolveCanonicalCountryName sanitizes compound/slash country strings to single sovereign entities", () => {
      const { resolveCanonicalCountryName } = placesModule;

      // Compound Saudi Arabia / Israel must resolve to single sovereign country
      const saudiIsrael = resolveCanonicalCountryName("Saudi Arabia / Israel");
      assert.equal(saudiIsrael, "Saudi Arabia");

      // Reverse compound
      const israelSaudi = resolveCanonicalCountryName("Israel / Saudi Arabia");
      assert.equal(israelSaudi, "Israel");

      // Semicolon-delimited
      const usCa = resolveCanonicalCountryName("United States; Canada");
      assert.equal(usCa, "United States");

      // Standard canonical lookups remain untouched
      assert.equal(resolveCanonicalCountryName("Saudi Arabia"), "Saudi Arabia");
      assert.equal(resolveCanonicalCountryName("Israel"), "Israel");
      assert.equal(resolveCanonicalCountryName("United States"), "United States");
      assert.equal(resolveCanonicalCountryName("UK"), "United Kingdom");
      assert.equal(resolveCanonicalCountryName("FR"), "France");
      assert.equal(resolveCanonicalCountryName(""), "Unknown");
      assert.equal(resolveCanonicalCountryName(null), "Unknown");
    });

    it("getGeographicHierarchyStrict never produces compound slash country nodes", async () => {
      const { getGeographicHierarchyStrict } = placesModule;

      const hierarchy = await getGeographicHierarchyStrict();
      assert.ok(hierarchy && hierarchy.allCountries, "Hierarchy must be populated");

      // Assert zero country nodes have slashes or compound ampersands
      for (const country of hierarchy.allCountries) {
        assert.ok(
          !country.name.includes("/"),
          `Country "${country.name}" must not contain a slash`
        );
        assert.ok(
          !country.name.includes(";"),
          `Country "${country.name}" must not contain a semicolon`
        );
        assert.ok(
          !country.slug.includes("saudi-arabia-israel") &&
          !country.slug.includes("israel-saudi-arabia"),
          `Country slug "${country.slug}" must not be a compound Saudi-Israel amalgam`
        );
      }

      // Assert Saudi Arabia and Israel exist as discrete sovereign entities
      const saudi = hierarchy.allCountries.find((c) => c.name === "Saudi Arabia");
      const israel = hierarchy.allCountries.find((c) => c.name === "Israel");

      assert.ok(saudi, "Saudi Arabia must be present as a distinct sovereign country");
      assert.ok(israel, "Israel must be present as a distinct sovereign country");
      assert.notEqual(saudi.id, israel.id, "Saudi Arabia and Israel must have distinct entity IDs");
    });
  });

  describe("2. Participant Precedence & Central Figures", () => {
    it("sortParticipantsByPrecedence prioritizes central figures first", () => {
      const { sortParticipantsByPrecedence } = typesModule;

      const participants = [
        { personId: "p3", name: "Carol Observer", isCentralFigure: false, prominence: "observer" },
        { personId: "p1", name: "Alice Guest", isCentralFigure: false, prominence: "featured" },
        { personId: "p2", name: "Bob Host", isCentralFigure: true, prominence: "central" },
      ];

      const sorted = sortParticipantsByPrecedence(participants);
      assert.equal(sorted[0].name, "Bob Host", "Central figure must sort to top");
      assert.equal(sorted[1].name, "Alice Guest", "Featured participant must sort second");
      assert.equal(sorted[2].name, "Carol Observer", "Observer must sort last");
    });

    it("sortParticipantsByPrecedence respects explicit precedenceOrder", () => {
      const { sortParticipantsByPrecedence } = typesModule;

      const participants = [
        { personId: "p1", name: "Zack Moderator", isCentralFigure: true, precedenceOrder: 3 },
        { personId: "p2", name: "Aaron Signatory A", isCentralFigure: true, precedenceOrder: 1 },
        { personId: "p3", name: "Beth Signatory B", isCentralFigure: true, precedenceOrder: 2 },
      ];

      const sorted = sortParticipantsByPrecedence(participants);
      assert.equal(sorted[0].name, "Aaron Signatory A");
      assert.equal(sorted[1].name, "Beth Signatory B");
      assert.equal(sorted[2].name, "Zack Moderator");
    });
  });

  describe("3. Capacity Specification & Formulated Timeline Sentences", () => {
    it("exports STANDARD_CAPACITIES catalog and validateCapacityTitle trims and caps at 100 chars", () => {
      const { STANDARD_CAPACITIES, validateCapacityTitle } = typesModule;

      assert.ok(Array.isArray(STANDARD_CAPACITIES), "STANDARD_CAPACITIES must be array");
      assert.ok(STANDARD_CAPACITIES.includes("Host / Anchor"));
      assert.ok(STANDARD_CAPACITIES.includes("Interviewee"));
      assert.ok(STANDARD_CAPACITIES.includes("Treaty Signatory"));
      assert.ok(STANDARD_CAPACITIES.includes("Special Envoy / Diplomat"));

      assert.equal(validateCapacityTitle("  Host / Anchor  "), "Host / Anchor");
      assert.equal(validateCapacityTitle(null), undefined);
      assert.equal(validateCapacityTitle("   "), undefined);

      const longTitle = "A".repeat(150);
      const validated = validateCapacityTitle(longTitle);
      assert.equal(validated?.length, 100, "Capacity title must be capped at 100 characters");
    });

    it("formatParticipantTimelineNarrative generates grammatically precise evidentiary statements", () => {
      const { formatParticipantTimelineNarrative } = typesModule;

      // In-person physical host
      const inPersonPart = {
        personId: "host-1",
        name: "Jane Anchor",
        capacityTitle: "Host / Anchor",
        attendanceMode: "physical",
      };
      const event1 = {
        eventName: "White House Bilateral Summit Press Conference",
        venueName: "The White House",
        city: "Washington, D.C.",
        country: "United States",
      };
      const narrative1 = formatParticipantTimelineNarrative(inPersonPart, event1);
      assert.ok(narrative1.includes("Participated as Host / Anchor at The White House"));
      assert.ok(narrative1.includes("Washington, D.C."));

      // Remote attendee via video link with chyron overlay
      const remotePart = {
        personId: "guest-1",
        name: "John Interviewee",
        capacityTitle: "Interviewee",
        attendanceMode: "remote-live",
        remoteLocation: {
          city: "Burbank",
          country: "United States",
          label: "Live from Burbank",
          overlayText: "Burbank, CA",
          connectionType: "video-link",
        },
      };
      const event2 = {
        eventName: "NBC Live Special Broadcast",
        venueName: "NBC Studio 1A, 30 Rockefeller Plaza",
        city: "New York",
        country: "United States",
        mainVenueName: "NBC Studio 1A, 30 Rockefeller Plaza",
        mainCity: "New York",
        mainCountry: "United States",
      };
      const narrative2 = formatParticipantTimelineNarrative(remotePart, event2);
      assert.ok(narrative2.includes("Appeared remotely as Interviewee live from Burbank, United States"));
      assert.ok(narrative2.includes("via video link"));
      assert.ok(narrative2.includes('on-screen overlay: "Burbank, CA"'));
      assert.ok(narrative2.includes("NBC Studio 1A, 30 Rockefeller Plaza, New York"));
    });
  });

  describe("4. Remote Attendance Timeline Location Separation", () => {
    it("localizeEventForPersonParticipant sets remote coordinates and venue on attendee timeline", () => {
      const { localizeEventForPersonParticipant } = eventsModule;

      const studioEvent = {
        id: "evt-broadcast-2020",
        slug: "broadcast-2020",
        eventName: "Prime Time Global Media Interview",
        startDate: "2020-04-15T20:00:00Z",
        venueName: "BBC Television Centre",
        city: "London",
        country: "United Kingdom",
        latitude: 51.5126,
        longitude: -0.2263,
        summary: "Live broadcast with studio host and remote satellite link.",
        verificationStatus: "verified",
        confidence: "confirmed",
        sourceIds: ["src-1"],
        participants: [
          {
            personId: "person-host",
            slug: "person-host",
            name: "Studio Host",
            role: "Host",
            capacityTitle: "Host / Anchor",
            attendanceMode: "physical",
            isCentralFigure: true,
            precedenceOrder: 1,
          },
          {
            personId: "person-remote",
            slug: "person-remote",
            name: "Remote Dignitary",
            role: "Keynote Interviewee",
            capacityTitle: "Interviewee",
            attendanceMode: "remote-live",
            isCentralFigure: true,
            precedenceOrder: 2,
            remoteLocation: {
              venueName: "Jerusalem Bureau",
              city: "Jerusalem",
              country: "Israel",
              label: "Live via Satellite from Jerusalem",
              overlayText: "Jerusalem",
              connectionType: "satellite-feed",
              latitude: 31.7683,
              longitude: 35.2137,
            },
          },
        ],
      };

      // 1. Host's perspective: retains studio venue and London coordinates
      const hostPerspective = localizeEventForPersonParticipant(studioEvent, "person-host");
      assert.equal(hostPerspective.isRemoteAttendance, undefined);
      assert.equal(hostPerspective.venueName, "BBC Television Centre");
      assert.equal(hostPerspective.city, "London");
      assert.equal(hostPerspective.country, "United Kingdom");
      assert.equal(hostPerspective.latitude, 51.5126);
      assert.equal(hostPerspective.longitude, -0.2263);

      // 2. Remote dignitary's perspective: OVERRIDES to Jerusalem remote location & coordinates!
      const remotePerspective = localizeEventForPersonParticipant(studioEvent, "person-remote");
      assert.equal(remotePerspective.isRemoteAttendance, true);
      assert.equal(remotePerspective.venueName, "Jerusalem Bureau");
      assert.equal(remotePerspective.city, "Jerusalem");
      assert.equal(remotePerspective.country, "Israel");
      assert.equal(remotePerspective.latitude, 31.7683);
      assert.equal(remotePerspective.longitude, 35.2137);

      // Verifies main broadcast studio is preserved as mainVenueName
      assert.equal(remotePerspective.mainVenueName, "BBC Television Centre");
      assert.equal(remotePerspective.mainCity, "London");
      assert.equal(remotePerspective.mainCountry, "United Kingdom");

      // Verifies auto-formulated timeline narrative is populated
      assert.ok(remotePerspective.participantNarrative);
      assert.ok(remotePerspective.participantNarrative.includes("Appeared remotely as Interviewee live from Jerusalem, Israel"));
      assert.ok(remotePerspective.participantNarrative.includes("via satellite feed"));
      assert.ok(remotePerspective.participantNarrative.includes("BBC Television Centre, London"));
    });
  });
});
