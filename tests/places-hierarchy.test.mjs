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
});
