import { createClient } from "@/lib/supabase/server";
import { getEvents } from "./events";
import type {
  AddressNode,
  CityNode,
  CountryNode,
  EventRecord,
  GeographicHierarchySummary,
  GeographicHierarchyTree,
  PlaceRecord,
  VenueNode,
} from "./types";

/**
 * Authoritative WGS-84 coordinate gazetteer for verified cities, diplomatic venues, and geographical landmarks.
 * Format: [latitude, longitude]
 */
export const GLOBAL_GAZETTEER_COORDINATES: Record<string, [number, number]> = {
  // Diplomatic & Governmental Venues
  "united nations headquarters": [40.7499, -73.9674],
  "un headquarters": [40.7499, -73.9674],
  "white house": [38.8977, -77.0365],
  "state dining room, white house": [38.8977, -77.0365],
  "oval office, white house": [38.8977, -77.0365],
  "us capitol": [38.8899, -77.0090],
  "knesset": [31.7766, 35.2052],
  "prime minister’s office": [31.7818, 35.2012],
  "prime minister's office": [31.7818, 35.2012],
  "prime minister’s office (remote broadcast)": [31.7818, 35.2012],
  "prime minister's official media channels": [31.7818, 35.2012],
  "mar-a-lago club": [26.6771, -80.0370],
  "mar-a-lago": [26.6771, -80.0370],
  "770 eastern parkway": [40.6689, -73.9427],
  "royal palace of madrid": [40.4179, -3.7143],
  "mount herzl": [31.7744, 35.1806],
  "yad vashem": [31.7742, 35.1754],
  "weizmann institute of science": [31.9056, 34.8094],
  "ben-gurion international airport": [32.0005, 34.8707],
  "national press club": [38.8972, -77.0315],
  "wye river conference center": [38.9440, -76.0810],
  "camp david": [39.6483, -77.4639],
  "10 downing street": [51.5034, -0.1276],
  "foreign and commonwealth office": [51.5028, -0.1281],
  "foreign, commonwealth & development office": [51.5028, -0.1281],
  "elysee palace": [48.8704, 2.3168],
  "peace palace": [52.0866, 4.2956],
  "palais des nations": [46.2266, 6.1408],
  "palais coburg": [48.2057, 16.3768],
  "joint base andrews": [38.8108, -76.8670],
  "king hussein international airport": [29.6116, 35.0181],
  "king khalid international airport": [24.9576, 46.6988],
  "great hall of the people": [39.9028, 116.3872],
  "wadi araba border crossing": [29.5786, 35.0064],
  "palacio real": [40.4179, -3.7143],
  
  // Cities & Districts
  "jerusalem": [31.7683, 35.2137],
  "tel aviv": [32.0853, 34.7818],
  "lod area": [31.9870, 34.8860],
  "lod": [31.9514, 34.8881],
  "rehovot": [31.8928, 34.8113],
  "erez": [31.5608, 34.5678],
  "gaza": [31.5017, 34.4668],
  "maale adumim": [31.7772, 35.2979],
  "haifa": [32.7940, 34.9896],
  "beersheba": [31.2529, 34.7915],
  "ramallah": [31.9038, 35.2034],
  "new york": [40.7128, -74.0060],
  "brooklyn": [40.6782, -73.9442],
  "washington": [38.9072, -77.0369],
  "washington dc": [38.9072, -77.0369],
  "washington, d.c.": [38.9072, -77.0369],
  "palm beach": [26.7056, -80.0364],
  "wye": [38.9440, -76.0810],
  "london": [51.5072, -0.1276],
  "paris": [48.8566, 2.3522],
  "madrid": [40.4168, -3.7038],
  "cairo": [30.0444, 31.2357],
  "tokyo": [35.6762, 139.6503],
  "moscow": [55.7558, 37.6173],
  "bucharest": [44.4268, 26.1025],
  "mexico city": [19.4326, -99.1332],
  "rome": [41.9028, 12.4964],
  "berlin": [52.5200, 13.4050],
  "geneva": [46.2044, 6.1432],
  "brussels": [50.8503, 4.3517],
  "vienna": [48.2082, 16.3738],
  "riyadh": [24.7136, 46.6753],
  "doha": [25.2854, 51.5310],
  "abu dhabi": [24.4539, 54.3773],
  "dubai": [25.2048, 55.2708],
  "amman": [31.9454, 35.9284],
  "beirut": [33.8938, 35.5018],
  "ankara": [39.9334, 32.8597],
  "istanbul": [41.0082, 28.9784],
  "beijing": [39.9042, 116.4074],
  "the hague": [52.0705, 4.3007],
  "singapore": [1.3521, 103.8198],
  "seoul": [37.5665, 126.9780],
  "ottawa": [45.4215, -75.6972],
  "canberra": [-35.2809, 149.1300],
  "sydney": [-33.8688, 151.2093],
  "aqaba": [29.5320, 35.0063],
};

/**
 * Authoritative structural gazetteer metadata linking venues to physical street addresses,
 * cities, sovereign countries, and specific venue sub-areas.
 */
export const GLOBAL_GAZETTEER_METADATA: Record<string, {
  canonicalVenue: string;
  venueType: string;
  streetAddress: string;
  district?: string;
  city: string;
  country: string;
  countryCode: string;
  latitude: number;
  longitude: number;
  venueAreas?: Array<{ id: string; name: string; areaType: string }>;
}> = {
  "white house": {
    canonicalVenue: "The White House",
    venueType: "executive-residence",
    streetAddress: "1600 Pennsylvania Avenue NW",
    district: "Downtown",
    city: "Washington, D.C.",
    country: "United States",
    countryCode: "US",
    latitude: 38.8977,
    longitude: -77.0365,
    venueAreas: [
      { id: "area-wh-oval-office", name: "Oval Office", areaType: "room" },
      { id: "area-wh-state-dining", name: "State Dining Room", areaType: "hall" },
      { id: "area-wh-rose-garden", name: "Rose Garden", areaType: "outdoor" },
      { id: "area-wh-cabinet-room", name: "Cabinet Room", areaType: "room" },
      { id: "area-wh-east-room", name: "East Room", areaType: "hall" },
    ],
  },
  "us capitol": {
    canonicalVenue: "United States Capitol",
    venueType: "parliament",
    streetAddress: "First Street SE",
    district: "Capitol Hill",
    city: "Washington, D.C.",
    country: "United States",
    countryCode: "US",
    latitude: 38.8899,
    longitude: -77.0090,
    venueAreas: [
      { id: "area-capitol-house-chamber", name: "House of Representatives Chamber", areaType: "hall" },
      { id: "area-capitol-senate-chamber", name: "Senate Chamber", areaType: "hall" },
      { id: "area-capitol-rotunda", name: "Rotunda", areaType: "hall" },
    ],
  },
  "united nations headquarters": {
    canonicalVenue: "United Nations Headquarters",
    venueType: "international-body",
    streetAddress: "405 East 42nd Street",
    district: "Turtle Bay, Manhattan",
    city: "New York",
    country: "United States",
    countryCode: "US",
    latitude: 40.7499,
    longitude: -73.9674,
    venueAreas: [
      { id: "area-un-ga-hall", name: "General Assembly Hall", areaType: "hall" },
      { id: "area-un-sc-chamber", name: "Security Council Chamber", areaType: "hall" },
      { id: "area-un-rostrum", name: "General Assembly Rostrum & Podium", areaType: "podium" },
    ],
  },
  "knesset": {
    canonicalVenue: "The Knesset",
    venueType: "parliament",
    streetAddress: "1 Kiryat Ben-Gurion",
    district: "Givat Ram",
    city: "Jerusalem",
    country: "Israel",
    countryCode: "IL",
    latitude: 31.7766,
    longitude: 35.2052,
    venueAreas: [
      { id: "area-knesset-plenary", name: "Knesset Plenary Hall", areaType: "hall" },
      { id: "area-knesset-speakers-chamber", name: "Speaker's Chamber", areaType: "room" },
    ],
  },
  "prime minister's office": {
    canonicalVenue: "Prime Minister's Office",
    venueType: "executive-residence",
    streetAddress: "3 Kaplan Street, Kiryat Ben-Gurion",
    district: "Givat Ram",
    city: "Jerusalem",
    country: "Israel",
    countryCode: "IL",
    latitude: 31.7818,
    longitude: 35.2012,
    venueAreas: [
      { id: "area-pmo-cabinet", name: "Cabinet Room", areaType: "room" },
      { id: "area-pmo-press", name: "Media Briefing Room", areaType: "room" },
    ],
  },
  "camp david": {
    canonicalVenue: "Camp David (Naval Support Facility Thurmont)",
    venueType: "summit-center",
    streetAddress: "Catoctin Mountain Park",
    district: "Frederick County",
    city: "Thurmont, Maryland",
    country: "United States",
    countryCode: "US",
    latitude: 39.6483,
    longitude: -77.4639,
    venueAreas: [
      { id: "area-cd-laurel", name: "Laurel Lodge", areaType: "room" },
      { id: "area-cd-aspen", name: "Aspen Lodge", areaType: "room" },
    ],
  },
  "wye river conference center": {
    canonicalVenue: "Wye River Conference Center (Aspen Institute)",
    venueType: "summit-center",
    streetAddress: "600 Wye River Road",
    district: "Queenstown",
    city: "Queenstown, Maryland",
    country: "United States",
    countryCode: "US",
    latitude: 38.9440,
    longitude: -76.0810,
    venueAreas: [
      { id: "area-wye-houghton", name: "Houghton House", areaType: "hall" },
    ],
  },
  "mar-a-lago club": {
    canonicalVenue: "Mar-a-Lago Club",
    venueType: "executive-residence",
    streetAddress: "1100 S Ocean Blvd",
    district: "Palm Beach",
    city: "Palm Beach",
    country: "United States",
    countryCode: "US",
    latitude: 26.6771,
    longitude: -80.0370,
    venueAreas: [
      { id: "area-mal-ballroom", name: "Grand Ballroom", areaType: "hall" },
      { id: "area-mal-patio", name: "Dining Patio", areaType: "outdoor" },
    ],
  },
  "royal palace of madrid": {
    canonicalVenue: "Royal Palace of Madrid (Palacio Real)",
    venueType: "summit-center",
    streetAddress: "Calle de Bailén s/n",
    district: "Centro",
    city: "Madrid",
    country: "Spain",
    countryCode: "ES",
    latitude: 40.4179,
    longitude: -3.7143,
    venueAreas: [
      { id: "area-madrid-columns", name: "Columns Room (Salón de Columnas)", areaType: "hall" },
    ],
  },
  "foreign and commonwealth office": {
    canonicalVenue: "Foreign, Commonwealth & Development Office",
    venueType: "diplomatic-mission",
    streetAddress: "King Charles Street, Whitehall",
    district: "Westminster",
    city: "London",
    country: "United Kingdom",
    countryCode: "GB",
    latitude: 51.5028,
    longitude: -0.1281,
    venueAreas: [
      { id: "area-fcdo-locarno", name: "Locarno Suite", areaType: "hall" },
    ],
  },
  "10 downing street": {
    canonicalVenue: "10 Downing Street",
    venueType: "executive-residence",
    streetAddress: "10 Downing Street, Westminster",
    district: "Westminster",
    city: "London",
    country: "United Kingdom",
    countryCode: "GB",
    latitude: 51.5034,
    longitude: -0.1276,
    venueAreas: [
      { id: "area-downing-cabinet", name: "Cabinet Room", areaType: "room" },
      { id: "area-downing-pillared", name: "Pillared Room", areaType: "room" },
    ],
  },
  "elysee palace": {
    canonicalVenue: "Élysée Palace",
    venueType: "executive-residence",
    streetAddress: "55 Rue du Faubourg Saint-Honoré",
    district: "8th Arrondissement",
    city: "Paris",
    country: "France",
    countryCode: "FR",
    latitude: 48.8704,
    longitude: 2.3168,
    venueAreas: [
      { id: "area-elysee-murat", name: "Salon Murat", areaType: "hall" },
      { id: "area-elysee-fetes", name: "Salle des Fêtes", areaType: "hall" },
    ],
  },
  "peace palace": {
    canonicalVenue: "Peace Palace (International Court of Justice)",
    venueType: "judicial-court",
    streetAddress: "Carnegieplein 2",
    district: "Zorgvliet",
    city: "The Hague",
    country: "Netherlands",
    countryCode: "NL",
    latitude: 52.0866,
    longitude: 4.2956,
    venueAreas: [
      { id: "area-peace-hall", name: "Great Hall of Justice", areaType: "hall" },
    ],
  },
  "palais des nations": {
    canonicalVenue: "Palais des Nations (UN Geneva)",
    venueType: "international-body",
    streetAddress: "14 Avenue de la Paix",
    district: "Parc de l'Ariana",
    city: "Geneva",
    country: "Switzerland",
    countryCode: "CH",
    latitude: 46.2266,
    longitude: 6.1408,
    venueAreas: [
      { id: "area-geneva-assembly", name: "Assembly Hall", areaType: "hall" },
    ],
  },
  "palais coburg": {
    canonicalVenue: "Palais Coburg",
    venueType: "summit-center",
    streetAddress: "Coburgbastei 4",
    district: "Innere Stadt",
    city: "Vienna",
    country: "Austria",
    countryCode: "AT",
    latitude: 48.2057,
    longitude: 16.3768,
  },
  "ben-gurion international airport": {
    canonicalVenue: "Ben Gurion International Airport",
    venueType: "airport",
    streetAddress: "Ben Gurion Airport Complex",
    district: "Central District",
    city: "Tel Aviv / Lod",
    country: "Israel",
    countryCode: "IL",
    latitude: 32.0005,
    longitude: 34.8707,
  },
  "joint base andrews": {
    canonicalVenue: "Joint Base Andrews (Air Force One Base)",
    venueType: "airport",
    streetAddress: "1500 Perimeter Road",
    district: "Prince George's County",
    city: "Camp Springs, Maryland",
    country: "United States",
    countryCode: "US",
    latitude: 38.8108,
    longitude: -76.8670,
  },
  "king hussein international airport": {
    canonicalVenue: "King Hussein International Airport",
    venueType: "airport",
    streetAddress: "Aqaba Airport Road",
    district: "Aqaba Special Economic Zone",
    city: "Aqaba",
    country: "Jordan",
    countryCode: "JO",
    latitude: 29.6116,
    longitude: 35.0181,
  },
  "wadi araba border crossing": {
    canonicalVenue: "Wadi Araba Border Crossing",
    venueType: "summit-center",
    streetAddress: "Arava Valley Border Site",
    district: "Arava Desert",
    city: "Aqaba / Eilat Border",
    country: "Jordan / Israel",
    countryCode: "JO",
    latitude: 29.5786,
    longitude: 35.0064,
  },
};

const COUNTRY_CODE_MAP: Record<string, string> = {
  "United States": "US",
  "Israel": "IL",
  "United Kingdom": "GB",
  "Jordan": "JO",
  "Egypt": "EG",
  "France": "FR",
  "Germany": "DE",
  "Spain": "ES",
  "Switzerland": "CH",
  "Austria": "AT",
  "Netherlands": "NL",
  "Saudi Arabia": "SA",
  "United Arab Emirates": "AE",
  "State of Palestine": "PS",
  "Palestine": "PS",
  "China": "CN",
  "Russia": "RU",
  "Bahrain": "BH",
  "Morocco": "MA",
  "Japan": "JP",
  "Italy": "IT",
  "Turkey": "TR",
  "Lebanon": "LB",
  "Syria": "SY",
  "Iran": "IR",
};

/**
 * Resolves WGS-84 coordinates for a place, venue, or city using the authoritative gazetteer.
 */
export function resolveGazetteerCoordinates(location: {
  venue?: string | null;
  city?: string | null;
  country?: string | null;
}): { latitude: number; longitude: number; source: "venue" | "city" } | null {
  if (typeof location.venue === "string" && location.venue.trim()) {
    const venueNorm = location.venue.trim().toLowerCase();
    if (Object.prototype.hasOwnProperty.call(GLOBAL_GAZETTEER_COORDINATES, venueNorm)) {
      const coords = GLOBAL_GAZETTEER_COORDINATES[venueNorm];
      if (Array.isArray(coords) && typeof coords[0] === "number" && typeof coords[1] === "number") {
        return { latitude: coords[0], longitude: coords[1], source: "venue" };
      }
    }
  }

  if (typeof location.city === "string" && location.city.trim()) {
    const cityNorm = location.city.trim().toLowerCase();
    if (Object.prototype.hasOwnProperty.call(GLOBAL_GAZETTEER_COORDINATES, cityNorm)) {
      const coords = GLOBAL_GAZETTEER_COORDINATES[cityNorm];
      if (Array.isArray(coords) && typeof coords[0] === "number" && typeof coords[1] === "number") {
        return { latitude: coords[0], longitude: coords[1], source: "city" };
      }
    }
  }

  return null;
}

/**
 * Retrieves the complete multi-tier geographical hierarchy from Supabase:
 * Country -> City -> Address -> Venue & Venue Areas, with documented event metrics.
 */
export async function getGeographicHierarchyStrict(supabaseClient?: unknown): Promise<GeographicHierarchyTree> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = (supabaseClient !== undefined ? supabaseClient : (await createClient())) as any;

  // 1. Fetch all raw places from DB or fallback
  let rawPlaces: PlaceRecord[] = [];
  if (!supabase) {
    rawPlaces = Object.entries(GLOBAL_GAZETTEER_METADATA).map(([key, meta]) => {
      const slug = key.toLowerCase().replace(/\s+/g, "-");
      return {
        id: `plc-${slug}`,
        slug,
        venue: meta.canonicalVenue,
        city: meta.city,
        country: meta.country,
        latitude: meta.latitude,
        longitude: meta.longitude,
        placeType: meta.venueType,
        streetAddress: meta.streetAddress,
        venueAreas: meta.venueAreas,
      };
    });
  } else {
    rawPlaces = await getPlacesStrict(supabase);
  }

  // 2. Fetch all events across all pages to compute exact event counts per venue, city, and country
  const allEvents: EventRecord[] = [];
  let currentPage = 1;
  let totalPages = 1;
  do {
    const pageRes = await getEvents({ page: currentPage, limit: 100 });
    if (pageRes.data && pageRes.data.length > 0) {
      allEvents.push(...pageRes.data);
    }
    totalPages = pageRes.totalPages || 1;
    currentPage++;
  } while (currentPage <= totalPages && currentPage <= 100);

  const eventCountsByVenueId = new Map<string, number>();
  const eventCountsByCity = new Map<string, number>();
  const eventCountsByCountry = new Map<string, number>();

  allEvents.forEach((e) => {
    const vId = e.venueName ? `plc-${(e.city || "unknown").toLowerCase().replace(/\s+/g, "-")}-${e.venueName.toLowerCase().replace(/[^\w]/g, "-").slice(0, 20)}` : "";
    if (vId) {
      eventCountsByVenueId.set(vId, (eventCountsByVenueId.get(vId) || 0) + 1);
    }
    const cNorm = (e.city || "Unknown").trim().toLowerCase();
    if (cNorm) {
      eventCountsByCity.set(cNorm, (eventCountsByCity.get(cNorm) || 0) + 1);
    }
    const cntryNorm = (e.country || "Unknown").trim().toLowerCase();
    if (cntryNorm) {
      eventCountsByCountry.set(cntryNorm, (eventCountsByCountry.get(cntryNorm) || 0) + 1);
    }
  });

  // 3. Build structured maps for Countries, Cities, Venues, and Addresses
  const countriesMap = new Map<string, CountryNode>();
  const citiesMap = new Map<string, CityNode>();
  const venuesMap = new Map<string, VenueNode>();
  const addressesMap = new Map<string, AddressNode>();

  const cityVenuesMap = new Map<string, VenueNode[]>();
  const cityAddressesMap = new Map<string, AddressNode[]>();
  const countryCitiesMap = new Map<string, CityNode[]>();

  rawPlaces.forEach((p) => {
    const countryName = (p.country || "Unknown").trim();
    const countryCode = COUNTRY_CODE_MAP[countryName] || "UN";
    const countrySlug = countryName.toLowerCase().replace(/\s+/g, "-");

    const cityName = (p.city || "Unknown").trim();
    const citySlug = `${countrySlug}-${cityName.toLowerCase().replace(/\s+/g, "-")}`;
    const cityCityKey = `${countryName}::${cityName}`.toLowerCase();

    const venueName = (p.venue || cityName).trim();
    const venueNorm = venueName.toLowerCase();
    const meta = GLOBAL_GAZETTEER_METADATA[venueNorm];

    const streetAddress = meta?.streetAddress || (p.streetAddress || null);
    const venueType = meta?.venueType || p.placeType || "venue";
    const venueAreas = meta?.venueAreas || p.venueAreas || [];
    const eventCount = eventCountsByVenueId.get(p.id) || (eventCountsByCity.get(cityName.toLowerCase()) || 0);

    // Country Node
    if (!countriesMap.has(countrySlug)) {
      countriesMap.set(countrySlug, {
        id: `cntry-${countrySlug}`,
        slug: countrySlug,
        name: countryName,
        code: countryCode,
        cityCount: 0,
        venueCount: 0,
        addressCount: 0,
        eventCount: eventCountsByCountry.get(countryName.toLowerCase()) || 0,
      });
    }

    // City Node
    if (!citiesMap.has(cityCityKey)) {
      const cityNode: CityNode = {
        id: `city-${citySlug}`,
        slug: citySlug,
        name: cityName,
        country: countryName,
        countryCode,
        latitude: p.latitude ?? null,
        longitude: p.longitude ?? null,
        venueCount: 0,
        addressCount: 0,
        eventCount: eventCountsByCity.get(cityName.toLowerCase()) || 0,
      };
      citiesMap.set(cityCityKey, cityNode);

      const cList = countryCitiesMap.get(countrySlug) || [];
      cList.push(cityNode);
      countryCitiesMap.set(countrySlug, cList);
    }

    // Venue Node
    const venueNode: VenueNode = {
      id: p.id,
      slug: p.slug,
      name: venueName,
      venueType,
      city: cityName,
      country: countryName,
      countryCode,
      streetAddress,
      latitude: p.latitude ?? null,
      longitude: p.longitude ?? null,
      venueAreas,
      eventCount,
    };
    venuesMap.set(p.id, venueNode);

    const vList = cityVenuesMap.get(cityCityKey) || [];
    vList.push(venueNode);
    cityVenuesMap.set(cityCityKey, vList);

    // Address Node (if physical street address exists)
    if (streetAddress) {
      const addrSlug = `${citySlug}-${streetAddress.toLowerCase().replace(/[^\w]/g, "-").slice(0, 30)}`;
      const addrKey = `${cityCityKey}::${streetAddress}`.toLowerCase();

      if (!addressesMap.has(addrKey)) {
        const addressNode: AddressNode = {
          id: `addr-${addrSlug}`,
          slug: addrSlug,
          formattedAddress: streetAddress,
          district: meta?.district || null,
          city: cityName,
          country: countryName,
          countryCode,
          latitude: p.latitude ?? null,
          longitude: p.longitude ?? null,
          venuesLocatedHere: [venueName],
          eventCount,
        };
        addressesMap.set(addrKey, addressNode);

        const aList = cityAddressesMap.get(cityCityKey) || [];
        aList.push(addressNode);
        cityAddressesMap.set(cityCityKey, aList);
      } else {
        const existing = addressesMap.get(addrKey)!;
        if (!existing.venuesLocatedHere.includes(venueName)) {
          existing.venuesLocatedHere.push(venueName);
        }
      }
    }
  });

  // Update hierarchical rollup counts
  countriesMap.forEach((c) => {
    const cities = countryCitiesMap.get(c.slug) || [];
    c.cityCount = cities.length;
    let vCount = 0;
    let aCount = 0;
    cities.forEach((city) => {
      const cKey = `${c.name}::${city.name}`.toLowerCase();
      const venues = cityVenuesMap.get(cKey) || [];
      const addrs = cityAddressesMap.get(cKey) || [];
      city.venueCount = venues.length;
      city.addressCount = addrs.length;
      vCount += venues.length;
      aCount += addrs.length;
    });
    c.venueCount = vCount;
    c.addressCount = aCount;
  });

  const countryTree = Array.from(countriesMap.values())
    .sort((a, b) => b.eventCount - a.eventCount || a.name.localeCompare(b.name))
    .map((country) => {
      const cities = (countryCitiesMap.get(country.slug) || [])
        .sort((a, b) => b.eventCount - a.eventCount || a.name.localeCompare(b.name))
        .map((city) => {
          const cKey = `${country.name}::${city.name}`.toLowerCase();
          const venues = (cityVenuesMap.get(cKey) || []).sort((a, b) => b.eventCount - a.eventCount || a.name.localeCompare(b.name));
          const addresses = (cityAddressesMap.get(cKey) || []).sort((a, b) => b.eventCount - a.eventCount || a.formattedAddress.localeCompare(b.formattedAddress));
          return {
            ...city,
            venues,
            addresses,
          };
        });
      return {
        ...country,
        cities,
      };
    });

  const allCountries = Array.from(countriesMap.values()).sort((a, b) => b.eventCount - a.eventCount || a.name.localeCompare(b.name));
  const allCities = Array.from(citiesMap.values()).sort((a, b) => b.eventCount - a.eventCount || a.name.localeCompare(b.name));
  const allVenues = Array.from(venuesMap.values()).sort((a, b) => b.eventCount - a.eventCount || a.name.localeCompare(b.name));
  const allAddresses = Array.from(addressesMap.values()).sort((a, b) => b.eventCount - a.eventCount || a.formattedAddress.localeCompare(b.formattedAddress));

  const summary: GeographicHierarchySummary = {
    totalCountries: allCountries.length,
    totalCities: allCities.length,
    totalVenues: allVenues.length,
    totalAddresses: allAddresses.length,
    totalEvents: allEvents.length,
  };

  return {
    countries: countryTree,
    allCountries,
    allCities,
    allVenues,
    allAddresses,
    summary,
  };
}

/**
 * Retrieves the geographic hierarchy tree with explicit status.
 */
export async function getGeographicHierarchy(
  supabaseClient?: unknown
): Promise<{ data: GeographicHierarchyTree | null; error: string | null }> {
  try {
    const data = await getGeographicHierarchyStrict(supabaseClient);
    return { data, error: null };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to load geographic hierarchy";
    return { data: null, error: msg };
  }
}

/**
 * Retrieves all gazetteer places and venues from Supabase with strict error propagation.
 */
export async function getPlacesStrict(supabaseClient?: unknown): Promise<PlaceRecord[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = (supabaseClient !== undefined ? supabaseClient : (await createClient())) as any;
  if (!supabase) {
    throw new Error("Supabase client is unavailable");
  }

  const results: PlaceRecord[] = [];
  const seenIds = new Set<string>();
  const seenSlugs = new Set<string>();

  // 1. Fetch places with stable range pagination
  const pageSize = 1000;
  let placesPage = 0;
  let hasMorePlaces = true;

  while (hasMorePlaces) {
    const from = placesPage * pageSize;
    const to = from + pageSize - 1;
    const { data, error } = await supabase
      .from("places")
      .select("*")
      .order("city", { ascending: true })
      .order("id", { ascending: true })
      .range(from, to);

    if (error) throw error;

    if (data && data.length > 0) {
      data.forEach((p: Record<string, unknown>) => {
        const vName = String(p.venue || p.city || "");
        const meta = GLOBAL_GAZETTEER_METADATA[vName.toLowerCase()];
        seenIds.add(String(p.id));
        seenSlugs.add(String(p.slug));
        results.push({
          id: String(p.id),
          slug: String(p.slug),
          venue: meta?.canonicalVenue || vName,
          city: meta?.city || String(p.city || "Unknown"),
          country: meta?.country || String(p.country || "Unknown"),
          latitude: typeof p.latitude === "number" ? p.latitude : (meta?.latitude ?? null),
          longitude: typeof p.longitude === "number" ? p.longitude : (meta?.longitude ?? null),
          placeType: meta?.venueType || String(p.place_type || "venue"),
          streetAddress: meta?.streetAddress || null,
          venueAreas: meta?.venueAreas || [],
        });
      });
    }

    if (!data || data.length < pageSize) {
      hasMorePlaces = false;
    } else {
      placesPage++;
    }
  }

  // 2. Fetch Event Model v2 venues with stable range pagination
  const allVenueRows: Array<{
    id: string;
    name: string;
    address_id?: string | null;
    latitude?: number | null;
    longitude?: number | null;
  }> = [];
  let venuesPage = 0;
  let hasMoreVenues = true;

  while (hasMoreVenues) {
    const from = venuesPage * pageSize;
    const to = from + pageSize - 1;
    const { data: venueRows, error: venueError } = await supabase
      .from("venues")
      .select("id, name, address_id, latitude, longitude")
      .order("name", { ascending: true })
      .order("id", { ascending: true })
      .range(from, to);

    if (venueError) throw venueError;

    if (venueRows && venueRows.length > 0) {
      allVenueRows.push(...venueRows);
    }

    if (!venueRows || venueRows.length < pageSize) {
      hasMoreVenues = false;
    } else {
      venuesPage++;
    }
  }

  if (allVenueRows.length > 0) {
    const addressIds = Array.from(new Set(allVenueRows.map((v) => v.address_id).filter(Boolean))) as string[];
    const addressesMap = new Map<string, { city?: string | null; country_code?: string | null; formatted_english?: string | null }>();
    if (addressIds.length > 0) {
      const chunkSize = 200;
      for (let i = 0; i < addressIds.length; i += chunkSize) {
        const chunk = addressIds.slice(i, i + chunkSize);
        const { data: addressRows, error: addressError } = await supabase
          .from("addresses")
          .select("id, city, country_code, formatted_english")
          .in("id", chunk);
        if (addressError) throw addressError;
        if (addressRows) {
          addressRows.forEach((a: { id: string; city?: string | null; country_code?: string | null; formatted_english?: string | null }) => addressesMap.set(a.id, a));
        }
      }
    }

    allVenueRows.forEach((v) => {
      if (!seenIds.has(v.id)) {
        const vSlug = v.id.replace(/^plc-|^ven-/, "");
        if (!seenSlugs.has(vSlug)) {
          const addr = v.address_id ? addressesMap.get(v.address_id) : undefined;
          const meta = GLOBAL_GAZETTEER_METADATA[v.name.toLowerCase()];
          seenIds.add(v.id);
          seenSlugs.add(vSlug);
          results.push({
            id: v.id,
            slug: vSlug,
            venue: meta?.canonicalVenue || v.name,
            city: meta?.city || addr?.city || "Unknown",
            country: meta?.country || addr?.country_code || "Unknown",
            latitude: v.latitude ?? (meta?.latitude ?? null),
            longitude: v.longitude ?? (meta?.longitude ?? null),
            placeType: meta?.venueType || "venue",
            streetAddress: meta?.streetAddress || addr?.formatted_english || null,
            venueAreas: meta?.venueAreas || [],
          });
        }
      }
    });
  }

  return results;
}

/**
 * Retrieves all gazetteer places and venues from Supabase with graceful fallback.
 */
export async function getPlaces(supabaseClient?: unknown): Promise<PlaceRecord[]> {
  try {
    return await getPlacesStrict(supabaseClient);
  } catch {
    return [];
  }
}

/**
 * Retrieves all gazetteer places with explicit query status.
 */
export async function getPlacesWithStatus(supabaseClient?: unknown): Promise<{ data: PlaceRecord[]; error: string | null }> {
  try {
    const data = await getPlacesStrict(supabaseClient);
    return { data, error: null };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to load places";
    return { data: [], error: msg };
  }
}

/**
 * Retrieves a place by slug across all hierarchy tiers (Venue, Address, City, Country) along with all events.
 */
export async function getPlaceBySlug(
  slug: string
): Promise<{ data: { place: PlaceRecord; events: EventRecord[] } | null; error: string | null }> {
  if (!slug || !/^[a-zA-Z0-9_-]+$/.test(slug)) {
    return { data: null, error: "Invalid place slug" };
  }

  try {
    const supabase = await createClient();
    if (!supabase) {
      // Fallback matching from gazetteer metadata and hierarchy
      const hierarchy = await getGeographicHierarchyStrict(null);
      const matchedCountry = hierarchy.allCountries.find((c) => c.slug === slug);
      if (matchedCountry) {
        const place: PlaceRecord = {
          id: matchedCountry.id,
          slug: matchedCountry.slug,
          venue: matchedCountry.name,
          city: "National Jurisdiction",
          country: matchedCountry.name,
          placeType: "country",
          geographicLevel: "country",
        };
        const eventsRes = await getEvents({ placeSlug: slug, limit: 100 });
        return { data: { place, events: eventsRes.data || [] }, error: null };
      }

      const matchedCity = hierarchy.allCities.find((c) => c.slug === slug);
      if (matchedCity) {
        const place: PlaceRecord = {
          id: matchedCity.id,
          slug: matchedCity.slug,
          venue: matchedCity.name,
          city: matchedCity.name,
          country: matchedCity.country,
          latitude: matchedCity.latitude,
          longitude: matchedCity.longitude,
          placeType: "city",
          geographicLevel: "city",
        };
        const eventsRes = await getEvents({ placeSlug: slug, limit: 100 });
        return { data: { place, events: eventsRes.data || [] }, error: null };
      }

      const matchedVenue = hierarchy.allVenues.find(
        (v) => v.slug === slug || v.name.toLowerCase().replace(/[^\w]/g, "-") === slug || v.name.toLowerCase().replace(/\s+/g, "-") === slug
      );
      if (matchedVenue) {
        const place: PlaceRecord = {
          id: matchedVenue.id,
          slug: matchedVenue.slug,
          venue: matchedVenue.name,
          city: matchedVenue.city,
          country: matchedVenue.country,
          latitude: matchedVenue.latitude,
          longitude: matchedVenue.longitude,
          placeType: matchedVenue.venueType,
          streetAddress: matchedVenue.streetAddress,
          venueAreas: matchedVenue.venueAreas,
        };
        const eventsRes = await getEvents({ placeSlug: slug, limit: 100 });
        return { data: { place, events: eventsRes.data || [] }, error: null };
      }

      const matchedAddress = hierarchy.allAddresses.find((a) => a.slug === slug);
      if (matchedAddress) {
        const place: PlaceRecord = {
          id: matchedAddress.id,
          slug: matchedAddress.slug,
          venue: matchedAddress.formattedAddress,
          city: matchedAddress.city,
          country: matchedAddress.country,
          latitude: matchedAddress.latitude,
          longitude: matchedAddress.longitude,
          placeType: "address",
          geographicLevel: "address",
          streetAddress: matchedAddress.formattedAddress,
        };
        const eventsRes = await getEvents({ placeSlug: slug, limit: 100 });
        return { data: { place, events: eventsRes.data || [] }, error: null };
      }

      return { data: null, error: "Database configuration unavailable" };
    }

    let place: PlaceRecord | null = null;

    const [{ data: p, error: placeError }, { data: v, error: venueError }] = await Promise.all([
      supabase.from("places").select("*").or(`slug.eq.${slug},id.eq.${slug}`).maybeSingle(),
      supabase.from("venues").select("id, name, address_id, latitude, longitude").or(`id.eq.${slug},id.eq.ven-${slug},id.eq.plc-${slug}`).maybeSingle(),
    ]);

    if (placeError) throw placeError;
    if (venueError) throw venueError;

    if (p) {
      const meta = GLOBAL_GAZETTEER_METADATA[String(p.venue || "").toLowerCase()];
      place = {
        id: p.id,
        slug: p.slug,
        venue: meta?.canonicalVenue || p.venue,
        city: meta?.city || p.city,
        country: meta?.country || p.country,
        latitude: p.latitude ?? (meta?.latitude ?? null),
        longitude: p.longitude ?? (meta?.longitude ?? null),
        placeType: meta?.venueType || p.place_type,
        streetAddress: meta?.streetAddress || null,
        venueAreas: meta?.venueAreas || [],
      };
    } else if (v) {
      let city = "Unknown";
      let country = "Unknown";
      let streetAddress: string | null = null;
      if (v.address_id) {
        const { data: addr, error: addressError } = await supabase
          .from("addresses")
          .select("city, country_code, formatted_english")
          .eq("id", v.address_id)
          .maybeSingle();
        if (addressError) throw addressError;
        if (addr) {
          city = addr.city || city;
          country = addr.country_code || country;
          streetAddress = addr.formatted_english || null;
        }
      }
      const meta = GLOBAL_GAZETTEER_METADATA[v.name.toLowerCase()];
      place = {
        id: v.id,
        slug: v.id.replace(/^plc-|^ven-/, ""),
        venue: meta?.canonicalVenue || v.name,
        city: meta?.city || city,
        country: meta?.country || country,
        latitude: v.latitude ?? (meta?.latitude ?? null),
        longitude: v.longitude ?? (meta?.longitude ?? null),
        placeType: meta?.venueType || "venue",
        streetAddress: meta?.streetAddress || streetAddress,
        venueAreas: meta?.venueAreas || [],
      };
    } else {
      // Check if slug matches a Country or City
      const hierarchy = await getGeographicHierarchyStrict(supabase);
      const matchedCountry = hierarchy.allCountries.find((c) => c.slug === slug);
      if (matchedCountry) {
        place = {
          id: matchedCountry.id,
          slug: matchedCountry.slug,
          venue: matchedCountry.name,
          city: "National Jurisdiction",
          country: matchedCountry.name,
          placeType: "country",
          geographicLevel: "country",
        };
      } else {
        const matchedCity = hierarchy.allCities.find((c) => c.slug === slug);
        if (matchedCity) {
          place = {
            id: matchedCity.id,
            slug: matchedCity.slug,
            venue: matchedCity.name,
            city: matchedCity.name,
            country: matchedCity.country,
            latitude: matchedCity.latitude,
            longitude: matchedCity.longitude,
            placeType: "city",
            geographicLevel: "city",
          };
        }
      }
    }

    if (!place) return { data: null, error: null };

    const allEvents: EventRecord[] = [];
    let page = 1;
    while (true) {
      const eventsResult = await getEvents({ placeSlug: slug, page, limit: 100 });
      if (eventsResult.error) {
        throw new Error(eventsResult.error);
      }
      if (!eventsResult.data || eventsResult.data.length === 0) break;
      allEvents.push(...eventsResult.data);
      if (page >= eventsResult.totalPages) break;
      page++;
    }

    return {
      data: {
        place,
        events: allEvents,
      },
      error: null,
    };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : "Failed to load place",
    };
  }
}
