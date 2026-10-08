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

describe("Geographic Hierarchy & Places Multi-Tier Architecture", async () => {
  const placesModule = await vite.ssrLoadModule("/lib/rewind/places.ts");

  it("exports all mandatory hierarchy functions and gazetteer metadata", () => {
    assert.equal(typeof placesModule.getGeographicHierarchyStrict, "function");
    assert.equal(typeof placesModule.getGeographicHierarchy, "function");
    assert.equal(typeof placesModule.getPlacesStrict, "function");
    assert.equal(typeof placesModule.getPlaceBySlug, "function");
    assert.ok(placesModule.GLOBAL_GAZETTEER_METADATA, "GLOBAL_GAZETTEER_METADATA must be defined");
    assert.ok(placesModule.GLOBAL_GAZETTEER_COORDINATES, "GLOBAL_GAZETTEER_COORDINATES must be defined");
  });

  it("builds a complete 4-tier geographic hierarchy structure", async () => {
    const hierarchy = await placesModule.getGeographicHierarchyStrict(null);
    assert.ok(hierarchy, "Hierarchy object must be returned");
    assert.ok(Array.isArray(hierarchy.countries), "countries tree array must exist");
    assert.ok(Array.isArray(hierarchy.allCountries), "allCountries flat list must exist");
    assert.ok(Array.isArray(hierarchy.allCities), "allCities flat list must exist");
    assert.ok(Array.isArray(hierarchy.allVenues), "allVenues flat list must exist");
    assert.ok(Array.isArray(hierarchy.allAddresses), "allAddresses flat list must exist");
    assert.ok(hierarchy.summary, "summary object must exist");

    assert.ok(hierarchy.summary.totalCountries > 0, "Must have countries indexed");
    assert.ok(hierarchy.summary.totalCities > 0, "Must have cities indexed");
    assert.ok(hierarchy.summary.totalVenues > 0, "Must have venues indexed");
    assert.ok(hierarchy.summary.totalAddresses > 0, "Must have addresses indexed");
  });

  it("ensures venues are linked to physical street addresses and have sub-venue areas", async () => {
    const hierarchy = await placesModule.getGeographicHierarchyStrict(null);

    // Find The White House
    const whiteHouse = hierarchy.allVenues.find((v) => v.name.toLowerCase().includes("white house"));
    assert.ok(whiteHouse, "White House must exist in venues");
    assert.equal(whiteHouse.city, "Washington, D.C.");
    assert.equal(whiteHouse.country, "United States");
    assert.equal(whiteHouse.streetAddress, "1600 Pennsylvania Avenue NW");
    assert.ok(whiteHouse.venueAreas && whiteHouse.venueAreas.length > 0, "White House must have venue areas defined");
    const ovalOffice = whiteHouse.venueAreas.find((a) => a.name.toLowerCase().includes("oval office"));
    assert.ok(ovalOffice, "Oval Office must exist as a sub-venue area");

    // Find United Nations Headquarters
    const un = hierarchy.allVenues.find((v) => v.name.toLowerCase().includes("united nations"));
    assert.ok(un, "UN Headquarters must exist in venues");
    assert.equal(un.streetAddress, "405 East 42nd Street");
    assert.ok(un.venueAreas && un.venueAreas.length > 0, "UN Headquarters must have venue areas defined");

    // Find The Knesset
    const knesset = hierarchy.allVenues.find((v) => v.name.toLowerCase().includes("knesset"));
    assert.ok(knesset, "The Knesset must exist in venues");
    assert.equal(knesset.streetAddress, "1 Kiryat Ben-Gurion");
    assert.equal(knesset.city, "Jerusalem");
  });

  it("ensures addresses list the venues situated at their physical location", async () => {
    const hierarchy = await placesModule.getGeographicHierarchyStrict(null);

    const paAve = hierarchy.allAddresses.find((a) => a.formattedAddress.includes("1600 Pennsylvania Avenue"));
    assert.ok(paAve, "1600 Pennsylvania Avenue NW address must exist");
    assert.ok(paAve.venuesLocatedHere.some((v) => v.toLowerCase().includes("white house")), "Address must list White House as located here");

    const e42 = hierarchy.allAddresses.find((a) => a.formattedAddress.includes("405 East 42nd"));
    assert.ok(e42, "405 East 42nd Street address must exist");
    assert.ok(e42.venuesLocatedHere.some((v) => v.toLowerCase().includes("united nations")), "Address must list UN Headquarters");
  });

  it("verifies hierarchical tree parent-child relationships (Country -> City -> Venues & Addresses)", async () => {
    const hierarchy = await placesModule.getGeographicHierarchyStrict(null);

    const us = hierarchy.countries.find((c) => c.name === "United States");
    assert.ok(us, "United States country node must exist in tree");
    assert.ok(us.cities.length > 0, "US must contain child cities in tree");

    const dc = us.cities.find((city) => city.name.includes("Washington"));
    assert.ok(dc, "Washington D.C. must exist under US");
    assert.ok(dc.venues.length > 0, "Washington D.C. must contain venues in tree");
    assert.ok(dc.addresses.length > 0, "Washington D.C. must contain addresses in tree");

    const il = hierarchy.countries.find((c) => c.name === "Israel");
    assert.ok(il, "Israel country node must exist in tree");
    const jlm = il.cities.find((city) => city.name.includes("Jerusalem"));
    assert.ok(jlm, "Jerusalem must exist under Israel in tree");
    assert.ok(jlm.venues.length > 0, "Jerusalem must contain venues");
  });

  it("resolves multi-tier slugs properly with getPlaceBySlug", async () => {
    // 1. Slug for a country
    const countryResult = await placesModule.getPlaceBySlug("united-states");
    assert.ok(countryResult.data, "Should resolve united-states country slug");
    assert.equal(countryResult.data.place.country, "United States");

    // 2. Slug for a city
    const cityResult = await placesModule.getPlaceBySlug("israel-jerusalem");
    assert.ok(cityResult.data, "Should resolve israel-jerusalem city slug");
    assert.equal(cityResult.data.place.city, "Jerusalem");

    // 3. Slug for a venue
    const venueResult = await placesModule.getPlaceBySlug("white-house");
    assert.ok(venueResult.data, "Should resolve white-house venue slug");
    assert.equal(venueResult.data.place.venue, "The White House");
    assert.equal(venueResult.data.place.streetAddress, "1600 Pennsylvania Avenue NW");

    // 4. Invalid / non-existent slug returns null safely
    const invalidResult = await placesModule.getPlaceBySlug("non-existent-xyz-slug-999");
    assert.equal(invalidResult.data, null);
  });

  it("strictly verifies that 100% of historical events have valid single countries and exact coordinates", async () => {
    const eventsModule = await vite.ssrLoadModule("/data/seeds/events-corpus.ts");
    const { eventsCorpus } = eventsModule;
    const { COUNTRY_CODE_MAP, resolveGazetteerCoordinates, resolveVenueMetadata } = placesModule;

    assert.ok(eventsCorpus.length >= 60, "Must have all 60 primary historical events loaded");

    for (const evt of eventsCorpus) {
      // Single sovereign country check
      assert.ok(evt.country, `Event ${evt.id} must have country`);
      assert.ok(!evt.country.includes("/"), `Event ${evt.id} country cannot contain slash: "${evt.country}"`);
      assert.ok(!evt.country.includes("&"), `Event ${evt.id} country cannot contain ampersand: "${evt.country}"`);
      assert.ok(!evt.country.includes(" and "), `Event ${evt.id} country cannot contain 'and': "${evt.country}"`);
      assert.ok(COUNTRY_CODE_MAP[evt.country], `Event ${evt.id} country must be recognized in COUNTRY_CODE_MAP: "${evt.country}"`);

      // Coordinates bounds and non-null-island check
      assert.equal(typeof evt.latitude, "number", `Event ${evt.id} latitude must be number`);
      assert.equal(typeof evt.longitude, "number", `Event ${evt.id} longitude must be number`);
      assert.ok(!isNaN(evt.latitude) && !isNaN(evt.longitude), `Event ${evt.id} coordinates cannot be NaN`);
      assert.ok(evt.latitude >= -90 && evt.latitude <= 90, `Event ${evt.id} latitude out of bounds: ${evt.latitude}`);
      assert.ok(evt.longitude >= -180 && evt.longitude <= 180, `Event ${evt.id} longitude out of bounds: ${evt.longitude}`);
      assert.ok(!(evt.latitude === 0 && evt.longitude === 0), `Event ${evt.id} coordinates cannot be Null Island [0, 0]`);

      // Non-compound primary venue name check
      assert.ok(evt.venueName, `Event ${evt.id} must have venueName`);
      if (!evt.venueName.includes("Food and Agriculture Organization")) {
        assert.ok(!evt.venueName.includes(" and "), `Event ${evt.id} venueName must not be compound with 'and': "${evt.venueName}"`);
      }
      assert.ok(!evt.venueName.includes(" / "), `Event ${evt.id} venueName must not contain ' / ': "${evt.venueName}"`);

      // Physical street address presence
      assert.ok(evt.address && evt.address.trim().length > 0, `Event ${evt.id} must have physical street address: "${evt.address}"`);

      // Venue coordinates resolution
      const resolved = resolveGazetteerCoordinates({ venue: evt.venueName, city: evt.city, country: evt.country });
      assert.ok(resolved, `Event ${evt.id} venue "${evt.venueName}" must resolve coordinates in gazetteer`);
      assert.equal(resolved.source, "venue", `Event ${evt.id} venue "${evt.venueName}" resolution source must be "venue"`);

      // Venue metadata resolution
      const meta = resolveVenueMetadata(evt.venueName);
      assert.ok(meta, `Event ${evt.id} venue "${evt.venueName}" must resolve metadata in gazetteer`);
    }
  });

  it("strictly validates gazetteer metadata integrity and subvenue room/hall hierarchies", () => {
    const { GLOBAL_GAZETTEER_METADATA, COUNTRY_CODE_MAP } = placesModule;
    const entries = Object.entries(GLOBAL_GAZETTEER_METADATA);

    assert.ok(entries.length >= 70, "Gazetteer must contain at least 70 canonical venue metadata entries");

    for (const [key, meta] of entries) {
      assert.ok(meta.canonicalVenue, `Key "${key}" must have canonicalVenue`);
      assert.ok(meta.streetAddress, `Key "${key}" must have streetAddress`);
      assert.ok(meta.city, `Key "${key}" must have city`);
      assert.ok(meta.country, `Key "${key}" must have country`);
      assert.ok(meta.countryCode, `Key "${key}" must have countryCode`);
      assert.equal(meta.countryCode, COUNTRY_CODE_MAP[meta.country], `Key "${key}" countryCode "${meta.countryCode}" must match COUNTRY_CODE_MAP["${meta.country}"]`);
      assert.ok(meta.latitude >= -90 && meta.latitude <= 90, `Key "${key}" latitude out of bounds`);
      assert.ok(meta.longitude >= -180 && meta.longitude <= 180, `Key "${key}" longitude out of bounds`);
      assert.ok(!(meta.latitude === 0 && meta.longitude === 0), `Key "${key}" coordinates must not be Null Island`);

      if (meta.venueAreas) {
        for (const area of meta.venueAreas) {
          assert.ok(area.id, `Venue "${key}" area must have id`);
          assert.ok(area.name, `Venue "${key}" area must have name`);
          assert.ok(area.areaType, `Venue "${key}" area must have areaType`);
        }
      }
    }
  });

  it("verifies read-side subvenue display formatting with formatEventVenue and formatEventLocation", async () => {
    const eventsModule = await vite.ssrLoadModule("/lib/rewind/events.ts");
    const { formatEventVenue, formatEventLocation } = eventsModule;

    assert.equal(typeof formatEventVenue, "function");
    assert.equal(typeof formatEventLocation, "function");

    // Case 1: Venue with distinct subvenue
    const evt1 = { venueName: "The White House", subvenue: "East Room", city: "Washington, D.C.", country: "United States" };
    assert.equal(formatEventVenue(evt1), "The White House (East Room)");
    assert.equal(formatEventLocation(evt1), "The White House (East Room), Washington, D.C., United States");

    // Case 2: Subvenue already embedded in venueName
    const evt2 = { venueName: "The White House - East Room", subvenue: "East Room", city: "Washington, D.C.", country: "United States" };
    assert.equal(formatEventVenue(evt2), "The White House - East Room");

    // Case 3: Venue without subvenue
    const evt3 = { venueName: "The White House", city: "Washington, D.C.", country: "United States" };
    assert.equal(formatEventVenue(evt3), "The White House");
    assert.equal(formatEventLocation(evt3), "The White House, Washington, D.C., United States");
  });
});
