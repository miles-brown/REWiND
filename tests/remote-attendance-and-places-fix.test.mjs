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
      assert.equal(resolveCanonicalCountryName("Kosovo / Serbia"), "Kosovo");
      assert.equal(resolveCanonicalCountryName(""), "Unknown");
      assert.equal(resolveCanonicalCountryName(null), "Unknown");
    });

    it("resolvePlace and resolvePlaceAsync reject malformed compound countries with empty first component", async () => {
      const resolveModule = await vite.ssrLoadModule("/lib/ingestion/resolve.ts");
      const resSync = resolveModule.resolvePlace("Some Venue", "Toronto", "/ Canada", 43.6532, -79.3832);
      assert.equal(resSync.placeId, "plc-unknown-general");
      assert.equal(resSync.confidence, 0);
      assert.equal(resSync.latitude, null);
      assert.equal(resSync.longitude, null);

      const resAsync = await resolveModule.resolvePlaceAsync("Some Venue", "Toronto", "; Canada", 43.6532, -79.3832, null);
      assert.equal(resAsync.placeId, "plc-unknown-general");
      assert.equal(resAsync.confidence, 0);
      assert.equal(resAsync.latitude, null);
      assert.equal(resAsync.longitude, null);
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

      // Recorded and telephone appearances use mode-specific wording rather than "live from"
      const recordedNarrative = formatParticipantTimelineNarrative(
        {
          personId: "rec-1",
          name: "Recorded Speaker",
          capacityTitle: "Keynote Speaker",
          attendanceMode: "remote-recorded",
          remoteLocation: { city: "Geneva", country: "Switzerland" },
        },
        event2
      );
      assert.ok(recordedNarrative.includes("in a recorded appearance from Geneva, Switzerland"));
      assert.ok(!recordedNarrative.includes("live from"));

      const phoneNarrative = formatParticipantTimelineNarrative(
        {
          personId: "tel-1",
          name: "Phone Caller",
          capacityTitle: "Special Contributor",
          attendanceMode: "telephone",
          remoteLocation: { city: "Paris", country: "France" },
        },
        event2
      );
      assert.ok(phoneNarrative.includes("by telephone from Paris, France"));
      assert.ok(!phoneNarrative.includes("live from"));
    });
  });

  describe("4. Remote Attendance Timeline Location Separation", () => {
    it("localizeEventForPersonParticipant sets remote coordinates and venue on attendee timeline", () => {
      const { localizeEventForPersonParticipant, normalizeRemoteLocation } = eventsModule;

      // Verify normalizeRemoteLocation sanitizes malformed JSONB and gates coordinates & descriptive fields by publicVisibility
      assert.equal(normalizeRemoteLocation(null), undefined);
      assert.equal(normalizeRemoteLocation("invalid"), undefined);
      const restrictedLoc = normalizeRemoteLocation({
        city: "  Zurich  ",
        connectionType: "invalid-type",
        latitude: 47.3769,
        longitude: 8.5417,
        publicVisibility: "restricted",
      });
      assert.equal(restrictedLoc, undefined);

      const restrictedWithConnection = normalizeRemoteLocation({
        city: "Zurich",
        connectionType: "satellite-feed",
        latitude: 47.3769,
        longitude: 8.5417,
        publicVisibility: "restricted",
      });
      assert.equal(restrictedWithConnection?.city, undefined);
      assert.equal(restrictedWithConnection?.connectionType, "satellite-feed");
      assert.equal(restrictedWithConnection?.latitude, null);
      assert.equal(restrictedWithConnection?.longitude, null);

      const omittedVisLoc = normalizeRemoteLocation({
        city: "  Zurich  ",
        connectionType: "invalid-type",
        latitude: 47.3769,
        longitude: 8.5417,
      });
      assert.equal(omittedVisLoc?.city, "Zurich");
      assert.equal(omittedVisLoc?.connectionType, undefined);
      assert.equal(omittedVisLoc?.latitude, null);
      assert.equal(omittedVisLoc?.longitude, null);

      const exactVisLoc = normalizeRemoteLocation({
        city: "Zurich",
        connectionType: "satellite-feed",
        latitude: 47.3769,
        longitude: 8.5417,
        publicVisibility: "public-exact",
      });
      assert.equal(exactVisLoc?.city, "Zurich");
      assert.equal(exactVisLoc?.connectionType, "satellite-feed");
      assert.equal(exactVisLoc?.latitude, 47.3769);
      assert.equal(exactVisLoc?.longitude, 8.5417);

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

    it("remote places with partial or coordinate-only data do not inherit studio place fields", () => {
      const { localizeEventForPersonParticipant } = eventsModule;
      const localize = (remoteLocation) =>
        localizeEventForPersonParticipant(
          {
            id: "evt-studio-regression",
            slug: "studio-regression",
            eventName: "Studio Interview",
            startDate: "2020-04-15T20:00:00Z",
            venueName: "BBC Television Centre",
            city: "London",
            country: "United Kingdom",
            latitude: 51.5126,
            longitude: -0.2263,
            summary: "Studio interview with a remote guest.",
            verificationStatus: "verified",
            confidence: "confirmed",
            sourceIds: ["src-1"],
            participants: [
              {
                personId: "person-remote",
                slug: "person-remote",
                name: "Remote Guest",
                role: "Guest",
                capacityTitle: "Guest",
                attendanceMode: "remote-live",
                isCentralFigure: false,
                precedenceOrder: 2,
                remoteLocation,
              },
            ],
          },
          "person-remote"
        );

      const cityOnly = localize({ city: "Burbank" });
      assert.equal(cityOnly.venueName, "Remote: Burbank");
      assert.equal(cityOnly.city, "Burbank");
      assert.equal(cityOnly.country, "");
      assert.equal(cityOnly.latitude, null);
      assert.equal(cityOnly.mainVenueName, "BBC Television Centre");
      assert.equal(cityOnly.mainCountry, "United Kingdom");

      const countryOnly = localize({ country: "Israel" });
      assert.equal(countryOnly.venueName, "Remote: Israel");
      assert.equal(countryOnly.city, "");
      assert.equal(countryOnly.country, "Israel");
      assert.equal(countryOnly.latitude, null);
      assert.equal(countryOnly.mainVenueName, "BBC Television Centre");
      assert.equal(countryOnly.mainCity, "London");

      const coordinatesOnly = localize({ latitude: 34.18, longitude: -118.31 });
      assert.equal(coordinatesOnly.venueName, undefined);
      assert.equal(coordinatesOnly.city, "");
      assert.equal(coordinatesOnly.country, "");
      assert.equal(coordinatesOnly.latitude, 34.18);
      assert.equal(coordinatesOnly.longitude, -118.31);
      assert.equal(coordinatesOnly.mainVenueName, "BBC Television Centre");
      assert.equal(coordinatesOnly.mainCity, "London");
      assert.equal(coordinatesOnly.mainCountry, "United Kingdom");

      const noOrigin = localize(undefined);
      assert.equal(noOrigin.venueName, undefined);
      assert.equal(noOrigin.city, "");
      assert.equal(noOrigin.country, "");
      assert.equal(noOrigin.latitude, null);
      assert.equal(noOrigin.longitude, null);
      assert.equal(noOrigin.locationPrecision, "unknown");
      assert.equal(noOrigin.mainVenueName, "BBC Television Centre");
      assert.equal(noOrigin.mainCity, "London");
      assert.equal(noOrigin.mainCountry, "United Kingdom");
    });
  });

  describe("5. Mobile Vessels as Venues Architecture", () => {
    it("isMobileVenue helper accurately identifies aircraft, trains, ships, motorcades", () => {
      const { isMobileVenue } = typesModule;

      assert.equal(isMobileVenue(null), false);
      assert.equal(isMobileVenue(undefined), false);
      assert.equal(isMobileVenue({ name: "White House", isMobileVessel: false }), false);
      assert.equal(isMobileVenue({ name: "Air Force One", isMobileVessel: true }), true);
      assert.equal(isMobileVenue({ name: "Marine One", vesselType: "aircraft" }), true);
      assert.equal(isMobileVenue({ name: "Royal Train", vesselType: "train" }), true);
      assert.equal(isMobileVenue({ name: "Royal Yacht Britannia", vesselType: "ship" }), true);
      assert.equal(isMobileVenue({ name: "Presidential Limousine", vesselType: "motorcade" }), true);
    });
  });

  describe("6. Documentation & 10 Golden Edge-Case Standard Invariants", async () => {
    const fs = await import("node:fs");
    const path = await import("node:path");

    it("EVENT_AND_VENUE_STANDARD.md codifies Mobile Vessels and all 10 Golden Edge-Case Rules", () => {
      const standardPath = path.join(root, "docs/standards/EVENT_AND_VENUE_STANDARD.md");
      const content = fs.readFileSync(standardPath, "utf-8");

      assert.ok(content.includes("5. Mobile Vessels as Venues"), "Must document Mobile Vessels");
      assert.ok(content.includes("ven-usaf-air-force-one"), "Must document Air Force One venue model");
      assert.ok(content.includes("area-afo-presidential-suite"), "Must document interior venue areas");
      assert.ok(content.includes("6. Multi-Stage & Multi-Day Umbrella Events"), "Must document Multi-Stage Festivals");
      assert.ok(content.includes("Glastonbury"), "Must reference Glastonbury pattern");
      assert.ok(content.includes("7. The 10 Golden Evidentiary Edge-Case Rules"), "Must document 10 Golden Rules");
      assert.ok(content.includes("Rule 1: Moving & Transit Events"), "Must document Rule 1");
      assert.ok(content.includes("Rule 2: Multi-Stage Festivals & Summits"), "Must document Rule 2");
      assert.ok(content.includes("Rule 3: Remote, Virtual & Hybrid Appearances"), "Must document Rule 3");
      assert.ok(content.includes("Rule 4: Sessions Crossing Midnight"), "Must document Rule 4");
      assert.ok(content.includes("Rule 5: Disputed, Contradictory, or Competing Location Claims"), "Must document Rule 5");
      assert.ok(content.includes("Rule 6: Secret Safehouses"), "Must document Rule 6");
      assert.ok(content.includes("Rule 7: Proxy & Representative Attendance"), "Must document Rule 7");
      assert.ok(content.includes("Rule 8: Multi-Leg Journeys & Emergency Flight Diversions"), "Must document Rule 8");
      assert.ok(content.includes("Rule 9: Shared Hotel Buildings"), "Must document Rule 9");
      assert.ok(content.includes("Rule 10: In-Transit Incidents & Briefings"), "Must document Rule 10");
    });

    it("LOCATION_STANDARD.md codifies Mobile Vessels and Dynamic Geocoding", () => {
      const locPath = path.join(root, "docs/standards/LOCATION_STANDARD.md");
      const content = fs.readFileSync(locPath, "utf-8");
      const vesselMigrationPath = path.join(
        root,
        "supabase/migrations/20260904070000_mobile_venues_and_vessel_architecture.sql"
      );
      const vesselMigrationSql = fs.readFileSync(vesselMigrationPath, "utf-8");

      assert.ok(content.includes("5. Mobile Vessels & Dynamic Geocoding Architecture"), "Must document Mobile Vessels in Location Standard");
      assert.ok(content.includes("address_id` is strictly `null`"), "Must enforce address nullability invariant");
      assert.ok(content.includes("home_base_place_id"), "Must document home base anchor");
      const executableSql = vesselMigrationSql
        .replace(/\/\*[\s\S]*?\*\//g, "")
        .replace(/--[^\n]*/g, "")
        .replace(/\s+/g, " ");
      assert.ok(
        executableSql.includes(
          "ALTER TABLE venues ADD CONSTRAINT venues_mobile_vessel_no_address_check CHECK (NOT is_mobile_vessel OR address_id IS NULL)"
        ),
        "Mobile vessel migration must include the uncommented ALTER TABLE constraint statement"
      );
    });

    it("EVENT_MODEL_V2.md codifies Section 8 on Mobile Vessels, Multi-Stage Festivals, and Remote Localization", () => {
      const v2Path = path.join(root, "docs/architecture/EVENT_MODEL_V2.md");
      const content = fs.readFileSync(v2Path, "utf-8");

      assert.ok(content.includes("8. Mobile Vessels, Multi-Stage Festivals & Remote Localization"), "Must document Section 8");
      assert.ok(content.includes("is_mobile_vessel = true"), "Must specify is_mobile_vessel");
      assert.ok(content.includes("formatParticipantTimelineNarrative"), "Must document narrative formulation");
    });
  });
});

