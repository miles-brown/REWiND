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
  "the white house": [38.8977, -77.0365],
  "white house": [38.8977, -77.0365],
  "united states capitol": [38.8899, -77.0090],
  "us capitol": [38.8899, -77.0090],
  "united nations headquarters": [40.7499, -73.9674],
  "un headquarters": [40.7499, -73.9674],
  "the knesset": [31.7766, 35.2052],
  "knesset": [31.7766, 35.2052],
  "prime minister's office": [31.7818, 35.2012],
  "prime minister’s office": [31.7818, 35.2012],
  "camp david": [39.6483, -77.4639],
  "wye river conference center": [38.9440, -76.0810],
  "mar-a-lago club": [26.6771, -80.0370],
  "mar-a-lago": [26.6771, -80.0370],
  "royal palace of madrid": [40.4179, -3.7143],
  "royal palace of madrid (palacio real)": [40.4179, -3.7143],
  "palacio real de madrid": [40.4179, -3.7143],
  "palacio real": [40.4179, -3.7143],
  "palacio de la zarzuela": [40.4808, -3.8017],
  "palacio de las cortes": [40.4165, -3.6968],
  "palacio de las cortes (congreso de los diputados)": [40.4165, -3.6968],
  "10 downing street": [51.5034, -0.1276],
  "foreign and commonwealth office": [51.5028, -0.1281],
  "foreign, commonwealth & development office": [51.5028, -0.1281],
  "foreign office, whitehall": [51.5028, -0.1281],
  "buckingham palace": [51.5014, -0.1419],
  "clarence house": [51.5042, -0.1386],
  "windsor castle": [51.4839, -0.6044],
  "westminster abbey": [51.4993, -0.1273],
  "palace of westminster": [51.4995, -0.1248],
  "elysee palace": [48.8704, 2.3168],
  "palace of versailles": [48.8049, 2.1204],
  "palais du luxembourg": [48.8482, 2.3371],
  "cathedrale saint-louis des invalides": [48.8550, 2.3125],
  "arc de triomphe": [48.8738, 2.2950],
  "omaha beach memorial tribune": [49.3697, -0.8711],
  "bellevue palace": [52.5175, 13.3533],
  "bellevue palace (schloss bellevue)": [52.5175, 13.3533],
  "reichstag building": [52.5186, 13.3762],
  "reichstag building (bundestag)": [52.5186, 13.3762],
  "palace of justice": [49.4547, 11.0478],
  "royal palace of brussels": [50.8417, 4.3625],
  "royal palace of brussels (palais royal)": [50.8417, 4.3625],
  "chateau de laeken": [50.8863, 4.3601],
  "chateau du belvedere": [50.8872, 4.3547],
  "palace of the nation": [50.8466, 4.3644],
  "palace of the nation (belgian federal parliament)": [50.8466, 4.3644],
  "adelaide cottage": [51.4822, -0.5894],
  "adelaide cottage, windsor home park": [51.4822, -0.5894],
  "paleis huis ten bosch": [52.0931, 4.3439],
  "kasteel drakensteyn": [52.1794, 5.2239],
  "peace palace": [52.0866, 4.2956],
  "international criminal court": [52.1064, 4.3168],
  "de nieuwe kerk": [52.3738, 4.8917],
  "de nieuwe kerk amsterdam": [52.3738, 4.8917],
  "amalienborg palace": [55.6841, 12.5931],
  "christiansborg palace": [55.6761, 12.5805],
  "royal palace of stockholm": [59.3268, 18.0717],
  "royal palace of stockholm (stockholms slott)": [59.3268, 18.0717],
  "drottningholm palace": [59.3217, 17.8869],
  "drottningholm palace (drottningholms slott)": [59.3217, 17.8869],
  "stockholm concert hall": [59.3347, 18.0628],
  "stockholm concert hall (konserthuset)": [59.3347, 18.0628],
  "stockholm city hall": [59.3275, 18.0543],
  "stockholm city hall (stadshuset)": [59.3275, 18.0543],
  "palais princier de monaco": [43.7311, 7.4206],
  "palais princier": [43.7311, 7.4206],
  "prince's palace of monaco": [43.7311, 7.4206],
  "cour d'honneur du palais princier": [43.7311, 7.4206],
  "schloss vaduz": [47.1394, 9.5244],
  "schloss vaduz (vaduz castle)": [47.1394, 9.5244],
  "notre-dame cathedral of luxembourg": [49.6097, 6.1314],
  "royal palace of bucharest": [44.4395, 26.0963],
  "royal palace of bucharest (palatul regal)": [44.4395, 26.0963],
  "elisabeta palace": [44.4721, 26.0792],
  "elisabeta palace (palatul elisabeta)": [44.4721, 26.0792],
  "curtea de arges royal cathedral": [45.1569, 24.6750],
  "national palace of mafra": [38.9372, -9.3267],
  "national palace of mafra (basilica of mafra)": [38.9372, -9.3267],
  "metropolitan cathedral of athens": [37.9753, 23.7301],
  "metropolitan cathedral of athens (mitropoli)": [37.9753, 23.7301],
  "saint isaac's cathedral": [59.9341, 30.3061],
  "the royal palace (kraljevski dvor)": [44.7633, 20.4503],
  "royal compound (kraljevski dvor)": [44.7633, 20.4503],
  "royal palace of belgrade": [44.7633, 20.4503],
  "royal palace of belgrade (kraljevski dvor)": [44.7633, 20.4503],
  "kraljevski dvor": [44.7633, 20.4503],
  "oslo city hall": [59.9118, 10.7335],
  "oslo city hall (oslo radhus)": [59.9118, 10.7335],
  "university of oslo": [59.9157, 10.7369],
  "hofdi house": [64.1465, -21.9066],
  "villa fleur d'eau": [46.2410, 6.1950],
  "palais des nations": [46.2266, 6.1408],
  "palais coburg": [48.2057, 16.3768],
  "diaoyutai state guesthouse": [39.9167, 116.3264],
  "great hall of the people": [39.9028, 116.3872],
  "food and agriculture organization (fao) headquarters": [41.8833, 12.4908],
  "phoenicia intercontinental hotel": [33.9011, 35.4958],
  "independence hall (dizengoff house)": [32.0628, 34.7709],
  "gerard bechar center (beit ha'am)": [31.7808, 35.2144],
  "kedma hotel isrotel": [30.8715, 34.7892],
  "united states naval academy": [38.9822, -76.4839],
  "new york city building (flushing meadows)": [40.7458, -73.8467],
  "mount herzl": [31.7744, 35.1806],
  "yad vashem": [31.7742, 35.1754],
  "weizmann institute of science": [31.9056, 34.8094],
  "770 eastern parkway": [40.6689, -73.9427],
  "national press club": [38.8972, -77.0315],
  "ben gurion international airport": [32.0005, 34.8707],
  "ben-gurion international airport": [32.0005, 34.8707],
  "joint base andrews": [38.8108, -76.8670],
  "king hussein international airport": [29.6116, 35.0181],
  "king khalid international airport": [24.9576, 46.6988],
  "cairo international airport": [30.1219, 31.4056],
  "wadi araba border crossing": [29.5786, 34.9781],
  
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
  "sde boker": [30.8715, 34.7892],
  "new york": [40.7128, -74.0060],
  "brooklyn": [40.6782, -73.9442],
  "washington": [38.9072, -77.0369],
  "washington dc": [38.9072, -77.0369],
  "washington, d.c.": [38.9072, -77.0369],
  "annapolis": [38.9784, -76.4922],
  "palm beach": [26.7056, -80.0364],
  "thurmont": [39.6240, -77.4147],
  "queenstown": [38.9904, -76.1583],
  "wye": [38.9440, -76.0810],
  "london": [51.5072, -0.1276],
  "windsor": [51.4839, -0.6044],
  "paris": [48.8566, 2.3522],
  "versailles": [48.8049, 2.1204],
  "saint-laurent-sur-mer": [49.3697, -0.8711],
  "madrid": [40.4168, -3.7038],
  "cairo": [30.0444, 31.2357],
  "tokyo": [35.6762, 139.6503],
  "moscow": [55.7558, 37.6173],
  "saint petersburg": [59.9343, 30.3351],
  "bucharest": [44.4268, 26.1025],
  "curtea de arges": [45.1569, 24.6750],
  "mexico city": [19.4326, -99.1332],
  "rome": [41.9028, 12.4964],
  "berlin": [52.5200, 13.4050],
  "nuremberg": [49.4521, 11.0767],
  "geneva": [46.2044, 6.1432],
  "brussels": [50.8503, 4.3517],
  "vienna": [48.2082, 16.3738],
  "amsterdam": [52.3676, 4.9041],
  "the hague": [52.0705, 4.3007],
  "copenhagen": [55.6761, 12.5683],
  "stockholm": [59.3293, 18.0686],
  "oslo": [59.9139, 10.7522],
  "reykjavik": [64.1466, -21.9426],
  "monaco-ville": [43.7311, 7.4206],
  "vaduz": [47.1410, 9.5209],
  "luxembourg city": [49.6116, 6.1319],
  "athens": [37.9838, 23.7275],
  "mafra": [38.9372, -9.3267],
  "belgrade": [44.7866, 20.4489],
  "riyadh": [24.7136, 46.6753],
  "doha": [25.2854, 51.5310],
  "abu dhabi": [24.4539, 54.3773],
  "dubai": [25.2048, 55.2708],
  "amman": [31.9454, 35.9284],
  "aqaba": [29.5320, 35.0063],
  "beirut": [33.8938, 35.5018],
  "ankara": [39.9334, 32.8597],
  "istanbul": [41.0082, 28.9784],
  "beijing": [39.9042, 116.4074],
  "singapore": [1.3521, 103.8198],
  "seoul": [37.5665, 126.9780],
  "ottawa": [45.4215, -75.6972],
  "canberra": [-35.2809, 149.1300],
  "sydney": [-33.8688, 151.2093],
};

/**
 * Authoritative structural gazetteer metadata linking venues to physical street addresses,
 * cities, sovereign countries, and specific venue sub-areas.
 */
export interface GazetteerVenueMetadata {
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
}

export const GLOBAL_GAZETTEER_METADATA: Record<string, GazetteerVenueMetadata> = {
  "the white house": {
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
      { id: "area-wh-diplo-reception", name: "Diplomatic Reception Room", areaType: "room" },
      { id: "area-wh-south-lawn", name: "South Lawn", areaType: "outdoor" },
      { id: "area-wh-press-room", name: "James S. Brady Press Briefing Room", areaType: "room" },
    ],
  },
  "united states capitol": {
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
      { id: "area-capitol-statuary-hall", name: "Statuary Hall", areaType: "hall" },
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
      { id: "area-un-trusteeship", name: "Trusteeship Council Chamber", areaType: "hall" },
    ],
  },
  "the knesset": {
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
  "prime minister’s office": {
    canonicalVenue: "Prime Minister's Office",
    venueType: "executive-residence",
    streetAddress: "3 Kaplan Street, Kiryat Ben-Gurion",
    district: "Givat Ram",
    city: "Jerusalem",
    country: "Israel",
    countryCode: "IL",
    latitude: 31.7818,
    longitude: 35.2012,
  },
  "camp david": {
    canonicalVenue: "Camp David",
    venueType: "summit-center",
    streetAddress: "Naval Support Facility Thurmont, Catoctin Mountain Park",
    district: "Frederick County",
    city: "Thurmont",
    country: "United States",
    countryCode: "US",
    latitude: 39.6483,
    longitude: -77.4639,
    venueAreas: [
      { id: "area-cd-laurel", name: "Laurel Lodge", areaType: "room" },
      { id: "area-cd-aspen", name: "Aspen Lodge", areaType: "room" },
      { id: "area-cd-holly", name: "Holly Cabin", areaType: "room" },
    ],
  },
  "wye river conference center": {
    canonicalVenue: "Wye River Conference Center",
    venueType: "summit-center",
    streetAddress: "600 Wye River Road",
    district: "Queenstown",
    city: "Queenstown",
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
  "mar-a-lago": {
    canonicalVenue: "Mar-a-Lago Club",
    venueType: "executive-residence",
    streetAddress: "1100 S Ocean Blvd",
    district: "Palm Beach",
    city: "Palm Beach",
    country: "United States",
    countryCode: "US",
    latitude: 26.6771,
    longitude: -80.0370,
  },
  "royal palace of madrid": {
    canonicalVenue: "Royal Palace of Madrid (Palacio Real)",
    venueType: "official-residence",
    streetAddress: "Calle de Bailén s/n",
    district: "Centro",
    city: "Madrid",
    country: "Spain",
    countryCode: "ES",
    latitude: 40.4179,
    longitude: -3.7143,
    venueAreas: [
      { id: "area-madrid-columns", name: "Columns Room (Salón de Columnas)", areaType: "hall" },
      { id: "area-madrid-throne", name: "Throne Room (Salón del Trono)", areaType: "hall" },
      { id: "area-madrid-chapel", name: "Royal Chapel (Capilla Real)", areaType: "hall" },
    ],
  },
  "royal palace of madrid (palacio real)": {
    canonicalVenue: "Royal Palace of Madrid (Palacio Real)",
    venueType: "official-residence",
    streetAddress: "Calle de Bailén s/n",
    district: "Centro",
    city: "Madrid",
    country: "Spain",
    countryCode: "ES",
    latitude: 40.4179,
    longitude: -3.7143,
  },
  "palacio real": {
    canonicalVenue: "Royal Palace of Madrid (Palacio Real)",
    venueType: "official-residence",
    streetAddress: "Calle de Bailén s/n",
    district: "Centro",
    city: "Madrid",
    country: "Spain",
    countryCode: "ES",
    latitude: 40.4179,
    longitude: -3.7143,
  },
  "palacio de la zarzuela": {
    canonicalVenue: "Palacio de la Zarzuela",
    venueType: "official-residence",
    streetAddress: "Carretera del Pardo s/n",
    district: "Fuencarral-El Pardo",
    city: "Madrid",
    country: "Spain",
    countryCode: "ES",
    latitude: 40.4808,
    longitude: -3.8017,
    venueAreas: [
      { id: "area-zarzuela-prince-pavilion", name: "Prince's Pavilion (Pabellón del Príncipe)", areaType: "room" },
      { id: "area-zarzuela-audience-hall", name: "Royal Audience Hall", areaType: "hall" },
    ],
  },
  "palacio de las cortes": {
    canonicalVenue: "Palacio de las Cortes (Congreso de los Diputados)",
    venueType: "parliament",
    streetAddress: "Plaza de las Cortes 1",
    district: "Centro",
    city: "Madrid",
    country: "Spain",
    countryCode: "ES",
    latitude: 40.4165,
    longitude: -3.6968,
    venueAreas: [
      { id: "area-cortes-plenary", name: "Plenary Hall (Salón de Sesiones)", areaType: "hall" },
    ],
  },
  "palacio de las cortes (congreso de los diputados)": {
    canonicalVenue: "Palacio de las Cortes (Congreso de los Diputados)",
    venueType: "parliament",
    streetAddress: "Plaza de las Cortes 1",
    district: "Centro",
    city: "Madrid",
    country: "Spain",
    countryCode: "ES",
    latitude: 40.4165,
    longitude: -3.6968,
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
  "foreign, commonwealth & development office": {
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
  },
  "buckingham palace": {
    canonicalVenue: "Buckingham Palace",
    venueType: "official-residence",
    streetAddress: "Buckingham Palace",
    district: "Westminster",
    city: "London",
    country: "United Kingdom",
    countryCode: "GB",
    latitude: 51.5014,
    longitude: -0.1419,
    venueAreas: [
      { id: "area-bp-throne", name: "Throne Room", areaType: "hall" },
      { id: "area-bp-ballroom", name: "Ballroom", areaType: "hall" },
      { id: "area-bp-music", name: "Music Room", areaType: "hall" },
      { id: "area-bp-balcony", name: "East Wing Balcony", areaType: "outdoor" },
    ],
  },
  "clarence house": {
    canonicalVenue: "Clarence House",
    venueType: "official-residence",
    streetAddress: "8 Cleveland Row, St. James's",
    district: "Westminster",
    city: "London",
    country: "United Kingdom",
    countryCode: "GB",
    latitude: 51.5042,
    longitude: -0.1386,
  },
  "windsor castle": {
    canonicalVenue: "Windsor Castle",
    venueType: "official-residence",
    streetAddress: "Windsor Castle",
    district: "Berkshire",
    city: "Windsor",
    country: "United Kingdom",
    countryCode: "GB",
    latitude: 51.4839,
    longitude: -0.6044,
    venueAreas: [
      { id: "area-windsor-st-georges-chapel", name: "St George's Chapel", areaType: "hall" },
      { id: "area-windsor-st-georges-hall", name: "St George's Hall", areaType: "hall" },
      { id: "area-windsor-adelaide-cottage", name: "Adelaide Cottage", areaType: "room" },
    ],
  },
  "westminster abbey": {
    canonicalVenue: "Westminster Abbey",
    venueType: "cathedral",
    streetAddress: "Dean's Yard, Westminster",
    district: "Westminster",
    city: "London",
    country: "United Kingdom",
    countryCode: "GB",
    latitude: 51.4993,
    longitude: -0.1273,
    venueAreas: [
      { id: "area-westminster-altar", name: "Coronation Theatre & High Altar", areaType: "hall" },
      { id: "area-westminster-lady-chapel", name: "Henry VII Lady Chapel", areaType: "hall" },
    ],
  },
  "palace of westminster": {
    canonicalVenue: "Palace of Westminster",
    venueType: "parliament",
    streetAddress: "Palace of Westminster, Westminster",
    district: "Westminster",
    city: "London",
    country: "United Kingdom",
    countryCode: "GB",
    latitude: 51.4995,
    longitude: -0.1248,
    venueAreas: [
      { id: "area-westminster-commons", name: "House of Commons Chamber", areaType: "hall" },
      { id: "area-westminster-lords", name: "House of Lords Chamber", areaType: "hall" },
      { id: "area-westminster-hall", name: "Westminster Hall", areaType: "hall" },
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
  "palace of versailles": {
    canonicalVenue: "Palace of Versailles",
    venueType: "official-residence",
    streetAddress: "Place d'Armes",
    district: "Yvelines",
    city: "Versailles",
    country: "France",
    countryCode: "FR",
    latitude: 48.8049,
    longitude: 2.1204,
    venueAreas: [
      { id: "area-versailles-mirrors", name: "Hall of Mirrors (Galerie des Glaces)", areaType: "hall" },
      { id: "area-versailles-opera", name: "Royal Opera of Versailles", areaType: "hall" },
    ],
  },
  "palais du luxembourg": {
    canonicalVenue: "Palais du Luxembourg",
    venueType: "parliament",
    streetAddress: "15 Rue de Vaugirard",
    district: "6th Arrondissement",
    city: "Paris",
    country: "France",
    countryCode: "FR",
    latitude: 48.8482,
    longitude: 2.3371,
    venueAreas: [
      { id: "area-luxembourg-hemicycle", name: "Hemicycle of the Senate", areaType: "hall" },
    ],
  },
  "cathedrale saint-louis des invalides": {
    canonicalVenue: "Cathédrale Saint-Louis des Invalides",
    venueType: "cathedral",
    streetAddress: "129 Rue de Grenelle",
    district: "7th Arrondissement",
    city: "Paris",
    country: "France",
    countryCode: "FR",
    latitude: 48.8550,
    longitude: 2.3125,
  },
  "arc de triomphe": {
    canonicalVenue: "Arc de Triomphe",
    venueType: "summit-center",
    streetAddress: "Place Charles de Gaulle",
    district: "8th/16th/17th Arrondissement",
    city: "Paris",
    country: "France",
    countryCode: "FR",
    latitude: 48.8738,
    longitude: 2.2950,
    venueAreas: [
      { id: "area-arc-tomb", name: "Tomb of the Unknown Soldier", areaType: "outdoor" },
    ],
  },
  "omaha beach memorial tribune": {
    canonicalVenue: "Omaha Beach Memorial Tribune",
    venueType: "summit-center",
    streetAddress: "Avenue de la Libération",
    district: "Calvados",
    city: "Saint-Laurent-sur-Mer",
    country: "France",
    countryCode: "FR",
    latitude: 49.3697,
    longitude: -0.8711,
  },
  "bellevue palace": {
    canonicalVenue: "Bellevue Palace (Schloss Bellevue)",
    venueType: "executive-residence",
    streetAddress: "Spreeweg 1",
    district: "Tiergarten",
    city: "Berlin",
    country: "Germany",
    countryCode: "DE",
    latitude: 52.5175,
    longitude: 13.3533,
    venueAreas: [
      { id: "area-bellevue-ballroom", name: "Grand Ballroom", areaType: "hall" },
    ],
  },
  "bellevue palace (schloss bellevue)": {
    canonicalVenue: "Bellevue Palace (Schloss Bellevue)",
    venueType: "executive-residence",
    streetAddress: "Spreeweg 1",
    district: "Tiergarten",
    city: "Berlin",
    country: "Germany",
    countryCode: "DE",
    latitude: 52.5175,
    longitude: 13.3533,
  },
  "reichstag building": {
    canonicalVenue: "Reichstag Building (Bundestag)",
    venueType: "parliament",
    streetAddress: "Platz der Republik 1",
    district: "Mitte",
    city: "Berlin",
    country: "Germany",
    countryCode: "DE",
    latitude: 52.5186,
    longitude: 13.3762,
    venueAreas: [
      { id: "area-reichstag-plenary", name: "Plenary Hall", areaType: "hall" },
    ],
  },
  "reichstag building (bundestag)": {
    canonicalVenue: "Reichstag Building (Bundestag)",
    venueType: "parliament",
    streetAddress: "Platz der Republik 1",
    district: "Mitte",
    city: "Berlin",
    country: "Germany",
    countryCode: "DE",
    latitude: 52.5186,
    longitude: 13.3762,
  },
  "palace of justice": {
    canonicalVenue: "Palace of Justice",
    venueType: "judicial-court",
    streetAddress: "Fürther Str. 110",
    district: "Bärenschanze",
    city: "Nuremberg",
    country: "Germany",
    countryCode: "DE",
    latitude: 49.4547,
    longitude: 11.0478,
    venueAreas: [
      { id: "area-nuremberg-courtroom-600", name: "Courtroom 600", areaType: "hall" },
    ],
  },
  "royal palace of brussels": {
    canonicalVenue: "Royal Palace of Brussels (Palais Royal)",
    venueType: "official-residence",
    streetAddress: "Rue Brederode 16",
    district: "City of Brussels",
    city: "Brussels",
    country: "Belgium",
    countryCode: "BE",
    latitude: 50.8417,
    longitude: 4.3625,
    venueAreas: [
      { id: "area-rpb-throne", name: "Throne Room", areaType: "hall" },
      { id: "area-rpb-gallery", name: "Grand Gallery", areaType: "hall" },
    ],
  },
  "royal palace of brussels (palais royal)": {
    canonicalVenue: "Royal Palace of Brussels (Palais Royal)",
    venueType: "official-residence",
    streetAddress: "Rue Brederode 16",
    district: "City of Brussels",
    city: "Brussels",
    country: "Belgium",
    countryCode: "BE",
    latitude: 50.8417,
    longitude: 4.3625,
  },
  "chateau de laeken": {
    canonicalVenue: "Château de Laeken",
    venueType: "official-residence",
    streetAddress: "Avenue du Parc Royal",
    district: "Laeken",
    city: "Brussels",
    country: "Belgium",
    countryCode: "BE",
    latitude: 50.8863,
    longitude: 4.3601,
    venueAreas: [
      { id: "area-laeken-greenhouses", name: "Royal Greenhouses", areaType: "outdoor" },
    ],
  },
  "chateau du belvedere": {
    canonicalVenue: "Château du Belvédère",
    venueType: "official-residence",
    streetAddress: "Avenue du Parc Royal 100",
    district: "Laeken",
    city: "Brussels",
    country: "Belgium",
    countryCode: "BE",
    latitude: 50.8872,
    longitude: 4.3547,
  },
  "palace of the nation": {
    canonicalVenue: "Palace of the Nation (Belgian Federal Parliament)",
    venueType: "parliament",
    streetAddress: "Place de la Nation 1",
    district: "City of Brussels",
    city: "Brussels",
    country: "Belgium",
    countryCode: "BE",
    latitude: 50.8466,
    longitude: 4.3644,
    venueAreas: [
      { id: "area-belgian-parliament-chamber", name: "Chamber of Representatives", areaType: "hall" },
    ],
  },
  "palace of the nation (belgian federal parliament)": {
    canonicalVenue: "Palace of the Nation (Belgian Federal Parliament)",
    venueType: "parliament",
    streetAddress: "Place de la Nation 1",
    district: "City of Brussels",
    city: "Brussels",
    country: "Belgium",
    countryCode: "BE",
    latitude: 50.8466,
    longitude: 4.3644,
    venueAreas: [
      { id: "area-belgian-parliament-chamber", name: "Chamber of Representatives", areaType: "hall" },
    ],
  },
  "paleis huis ten bosch": {
    canonicalVenue: "Paleis Huis ten Bosch",
    venueType: "official-residence",
    streetAddress: "'s-Gravenhaagse Bos 10",
    district: "Haagse Hout",
    city: "The Hague",
    country: "Netherlands",
    countryCode: "NL",
    latitude: 52.0931,
    longitude: 4.3439,
    venueAreas: [
      { id: "area-htb-oranjezaal", name: "Orange Hall (Oranjezaal)", areaType: "hall" },
    ],
  },
  "kasteel drakensteyn": {
    canonicalVenue: "Kasteel Drakensteyn",
    venueType: "official-residence",
    streetAddress: "Slotlaan 9",
    district: "Lage Vuursche",
    city: "Baarn",
    country: "Netherlands",
    countryCode: "NL",
    latitude: 52.1794,
    longitude: 5.2239,
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
  "international criminal court": {
    canonicalVenue: "International Criminal Court",
    venueType: "judicial-court",
    streetAddress: "Oude Waalsdorperweg 10",
    district: "Scheveningen",
    city: "The Hague",
    country: "Netherlands",
    countryCode: "NL",
    latitude: 52.1064,
    longitude: 4.3168,
    venueAreas: [
      { id: "area-icc-courtroom-1", name: "Courtroom I", areaType: "hall" },
      { id: "area-icc-press", name: "Press Briefing Room", areaType: "room" },
    ],
  },
  "de nieuwe kerk": {
    canonicalVenue: "De Nieuwe Kerk",
    venueType: "cathedral",
    streetAddress: "Dam 12",
    district: "Centrum",
    city: "Amsterdam",
    country: "Netherlands",
    countryCode: "NL",
    latitude: 52.3738,
    longitude: 4.8917,
  },
  "amalienborg palace": {
    canonicalVenue: "Amalienborg Palace",
    venueType: "official-residence",
    streetAddress: "Amalienborg Slotsplads 5",
    district: "Indre By",
    city: "Copenhagen",
    country: "Denmark",
    countryCode: "DK",
    latitude: 55.6841,
    longitude: 12.5931,
    venueAreas: [
      { id: "area-amalienborg-f8", name: "Frederik VIII's Palace", areaType: "room" },
      { id: "area-amalienborg-c9", name: "Christian IX's Palace", areaType: "room" },
    ],
  },
  "christiansborg palace": {
    canonicalVenue: "Christiansborg Palace",
    venueType: "parliament",
    streetAddress: "Prins Jørgens Gård 1",
    district: "Slotsholmen",
    city: "Copenhagen",
    country: "Denmark",
    countryCode: "DK",
    latitude: 55.6761,
    longitude: 12.5805,
    venueAreas: [
      { id: "area-christiansborg-throne", name: "Throne Room", areaType: "hall" },
      { id: "area-christiansborg-great-hall", name: "Great Hall", areaType: "hall" },
    ],
  },
  "royal palace of stockholm": {
    canonicalVenue: "Royal Palace of Stockholm (Stockholms Slott)",
    venueType: "official-residence",
    streetAddress: "Kungliga Slottet",
    district: "Gamla Stan",
    city: "Stockholm",
    country: "Sweden",
    countryCode: "SE",
    latitude: 59.3268,
    longitude: 18.0717,
    venueAreas: [
      { id: "area-stockholm-rikssalen", name: "Hall of State (Rikssalen)", areaType: "hall" },
      { id: "area-stockholm-chapel", name: "Royal Chapel (Slottskyrkan)", areaType: "hall" },
    ],
  },
  "royal palace of stockholm (stockholms slott)": {
    canonicalVenue: "Royal Palace of Stockholm (Stockholms Slott)",
    venueType: "official-residence",
    streetAddress: "Kungliga Slottet",
    district: "Gamla Stan",
    city: "Stockholm",
    country: "Sweden",
    countryCode: "SE",
    latitude: 59.3268,
    longitude: 18.0717,
  },
  "drottningholm palace": {
    canonicalVenue: "Drottningholm Palace (Drottningholms Slott)",
    venueType: "official-residence",
    streetAddress: "Drottningholm",
    district: "Ekerö",
    city: "Stockholm",
    country: "Sweden",
    countryCode: "SE",
    latitude: 59.3217,
    longitude: 17.8869,
  },
  "drottningholm palace (drottningholms slott)": {
    canonicalVenue: "Drottningholm Palace (Drottningholms Slott)",
    venueType: "official-residence",
    streetAddress: "Drottningholm",
    district: "Ekerö",
    city: "Stockholm",
    country: "Sweden",
    countryCode: "SE",
    latitude: 59.3217,
    longitude: 17.8869,
  },
  "stockholm concert hall": {
    canonicalVenue: "Stockholm Concert Hall (Konserthuset)",
    venueType: "summit-center",
    streetAddress: "Hötorget 8",
    district: "Norrmalm",
    city: "Stockholm",
    country: "Sweden",
    countryCode: "SE",
    latitude: 59.3347,
    longitude: 18.0628,
    venueAreas: [
      { id: "area-konserthuset-main", name: "Main Auditorium", areaType: "hall" },
    ],
  },
  "stockholm concert hall (konserthuset)": {
    canonicalVenue: "Stockholm Concert Hall (Konserthuset)",
    venueType: "summit-center",
    streetAddress: "Hötorget 8",
    district: "Norrmalm",
    city: "Stockholm",
    country: "Sweden",
    countryCode: "SE",
    latitude: 59.3347,
    longitude: 18.0628,
  },
  "stockholm city hall": {
    canonicalVenue: "Stockholm City Hall (Stadshuset)",
    venueType: "summit-center",
    streetAddress: "Hagnar Östbergs plan 1",
    district: "Kungsholmen",
    city: "Stockholm",
    country: "Sweden",
    countryCode: "SE",
    latitude: 59.3275,
    longitude: 18.0543,
    venueAreas: [
      { id: "area-stadshuset-blue-hall", name: "Blue Hall (Blå hallen)", areaType: "hall" },
      { id: "area-stadshuset-golden-hall", name: "Golden Hall (Gyllene salen)", areaType: "hall" },
    ],
  },
  "stockholm city hall (stadshuset)": {
    canonicalVenue: "Stockholm City Hall (Stadshuset)",
    venueType: "summit-center",
    streetAddress: "Hagnar Östbergs plan 1",
    district: "Kungsholmen",
    city: "Stockholm",
    country: "Sweden",
    countryCode: "SE",
    latitude: 59.3275,
    longitude: 18.0543,
  },
  "palais princier de monaco": {
    canonicalVenue: "Palais Princier de Monaco",
    venueType: "official-residence",
    streetAddress: "Palais Princier",
    district: "Monaco-Ville",
    city: "Monaco-Ville",
    country: "Monaco",
    countryCode: "MC",
    latitude: 43.7311,
    longitude: 7.4206,
    venueAreas: [
      { id: "area-monaco-cour-honneur", name: "Cour d'Honneur", areaType: "outdoor" },
      { id: "area-monaco-throne", name: "Throne Room", areaType: "hall" },
    ],
  },
  "palais princier": {
    canonicalVenue: "Palais Princier de Monaco",
    venueType: "official-residence",
    streetAddress: "Palais Princier",
    district: "Monaco-Ville",
    city: "Monaco-Ville",
    country: "Monaco",
    countryCode: "MC",
    latitude: 43.7311,
    longitude: 7.4206,
  },
  "prince's palace of monaco": {
    canonicalVenue: "Palais Princier de Monaco",
    venueType: "official-residence",
    streetAddress: "Palais Princier",
    district: "Monaco-Ville",
    city: "Monaco-Ville",
    country: "Monaco",
    countryCode: "MC",
    latitude: 43.7311,
    longitude: 7.4206,
    venueAreas: [
      { id: "area-monaco-cour-honneur", name: "Cour d'Honneur", areaType: "outdoor" },
      { id: "area-monaco-throne", name: "Throne Room", areaType: "hall" },
    ],
  },
  "schloss vaduz": {
    canonicalVenue: "Schloss Vaduz (Vaduz Castle)",
    venueType: "official-residence",
    streetAddress: "Bergstrasse 2",
    district: "Vaduz",
    city: "Vaduz",
    country: "Liechtenstein",
    countryCode: "LI",
    latitude: 47.1394,
    longitude: 9.5244,
  },
  "schloss vaduz (vaduz castle)": {
    canonicalVenue: "Schloss Vaduz (Vaduz Castle)",
    venueType: "official-residence",
    streetAddress: "Bergstrasse 2",
    district: "Vaduz",
    city: "Vaduz",
    country: "Liechtenstein",
    countryCode: "LI",
    latitude: 47.1394,
    longitude: 9.5244,
  },
  "notre-dame cathedral of luxembourg": {
    canonicalVenue: "Notre-Dame Cathedral of Luxembourg",
    venueType: "cathedral",
    streetAddress: "Rue Notre Dame",
    district: "Ville Haute",
    city: "Luxembourg City",
    country: "Luxembourg",
    countryCode: "LU",
    latitude: 49.6097,
    longitude: 6.1314,
  },
  "royal palace of bucharest": {
    canonicalVenue: "Royal Palace of Bucharest (Palatul Regal)",
    venueType: "official-residence",
    streetAddress: "Calea Victoriei 49-53",
    district: "Sector 1",
    city: "Bucharest",
    country: "Romania",
    countryCode: "RO",
    latitude: 44.4395,
    longitude: 26.0963,
    venueAreas: [
      { id: "area-bucharest-throne", name: "Throne Hall (Sala Tronului)", areaType: "hall" },
    ],
  },
  "royal palace of bucharest (palatul regal)": {
    canonicalVenue: "Royal Palace of Bucharest (Palatul Regal)",
    venueType: "official-residence",
    streetAddress: "Calea Victoriei 49-53",
    district: "Sector 1",
    city: "Bucharest",
    country: "Romania",
    countryCode: "RO",
    latitude: 44.4395,
    longitude: 26.0963,
  },
  "elisabeta palace": {
    canonicalVenue: "Elisabeta Palace (Palatul Elisabeta)",
    venueType: "official-residence",
    streetAddress: "Șoseaua Pavel D. Kiseleff 28",
    district: "Sector 1",
    city: "Bucharest",
    country: "Romania",
    countryCode: "RO",
    latitude: 44.4721,
    longitude: 26.0792,
  },
  "elisabeta palace (palatul elisabeta)": {
    canonicalVenue: "Elisabeta Palace (Palatul Elisabeta)",
    venueType: "official-residence",
    streetAddress: "Șoseaua Pavel D. Kiseleff 28",
    district: "Sector 1",
    city: "Bucharest",
    country: "Romania",
    countryCode: "RO",
    latitude: 44.4721,
    longitude: 26.0792,
  },
  "curtea de arges royal cathedral": {
    canonicalVenue: "Curtea de Argeș Royal Cathedral",
    venueType: "cathedral",
    streetAddress: "Bulevardul Basarabilor 1",
    district: "Argeș",
    city: "Curtea de Argeș",
    country: "Romania",
    countryCode: "RO",
    latitude: 45.1569,
    longitude: 24.6750,
  },
  "national palace of mafra": {
    canonicalVenue: "National Palace of Mafra",
    venueType: "official-residence",
    streetAddress: "Terreiro D. João V",
    district: "Mafra",
    city: "Mafra",
    country: "Portugal",
    countryCode: "PT",
    latitude: 38.9372,
    longitude: -9.3267,
    venueAreas: [
      { id: "area-mafra-basilica", name: "Basilica of Mafra", areaType: "hall" },
    ],
  },
  "national palace of mafra (basilica of mafra)": {
    canonicalVenue: "National Palace of Mafra",
    venueType: "official-residence",
    streetAddress: "Terreiro D. João V",
    district: "Mafra",
    city: "Mafra",
    country: "Portugal",
    countryCode: "PT",
    latitude: 38.9372,
    longitude: -9.3267,
  },
  "metropolitan cathedral of athens": {
    canonicalVenue: "Metropolitan Cathedral of Athens (Mitropoli)",
    venueType: "cathedral",
    streetAddress: "Mitropoleos",
    district: "Plaka",
    city: "Athens",
    country: "Greece",
    countryCode: "GR",
    latitude: 37.9753,
    longitude: 23.7301,
  },
  "metropolitan cathedral of athens (mitropoli)": {
    canonicalVenue: "Metropolitan Cathedral of Athens (Mitropoli)",
    venueType: "cathedral",
    streetAddress: "Mitropoleos",
    district: "Plaka",
    city: "Athens",
    country: "Greece",
    countryCode: "GR",
    latitude: 37.9753,
    longitude: 23.7301,
  },
  "saint isaac's cathedral": {
    canonicalVenue: "Saint Isaac's Cathedral",
    venueType: "cathedral",
    streetAddress: "Isaakiyevskaya Ploshchad 4",
    district: "Admiralteysky District",
    city: "Saint Petersburg",
    country: "Russia",
    countryCode: "RU",
    latitude: 59.9341,
    longitude: 30.3061,
  },
  "the royal palace (kraljevski dvor)": {
    canonicalVenue: "The Royal Palace (Kraljevski Dvor)",
    venueType: "official-residence",
    streetAddress: "Bulevar kneza Aleksandra Karađorđevića 96",
    district: "Dedinje",
    city: "Belgrade",
    country: "Serbia",
    countryCode: "RS",
    latitude: 44.7633,
    longitude: 20.4503,
  },
  "royal compound (kraljevski dvor)": {
    canonicalVenue: "The Royal Palace (Kraljevski Dvor)",
    venueType: "official-residence",
    streetAddress: "Bulevar kneza Aleksandra Karađorđevića 96",
    district: "Dedinje",
    city: "Belgrade",
    country: "Serbia",
    countryCode: "RS",
    latitude: 44.7633,
    longitude: 20.4503,
  },
  "royal palace of belgrade": {
    canonicalVenue: "The Royal Palace (Kraljevski Dvor)",
    venueType: "official-residence",
    streetAddress: "Bulevar kneza Aleksandra Karađorđevića 96",
    district: "Dedinje",
    city: "Belgrade",
    country: "Serbia",
    countryCode: "RS",
    latitude: 44.7633,
    longitude: 20.4503,
  },
  "oslo city hall": {
    canonicalVenue: "Oslo City Hall (Oslo Rådhus)",
    venueType: "summit-center",
    streetAddress: "Rådhusplassen 1",
    district: "Sentrum",
    city: "Oslo",
    country: "Norway",
    countryCode: "NO",
    latitude: 59.9118,
    longitude: 10.7335,
    venueAreas: [
      { id: "area-oslo-central-hall", name: "Central Hall", areaType: "hall" },
    ],
  },
  "oslo city hall (oslo radhus)": {
    canonicalVenue: "Oslo City Hall (Oslo Rådhus)",
    venueType: "summit-center",
    streetAddress: "Rådhusplassen 1",
    district: "Sentrum",
    city: "Oslo",
    country: "Norway",
    countryCode: "NO",
    latitude: 59.9118,
    longitude: 10.7335,
  },
  "university of oslo": {
    canonicalVenue: "University of Oslo",
    venueType: "university",
    streetAddress: "Karl Johans gate 47",
    district: "Sentrum",
    city: "Oslo",
    country: "Norway",
    countryCode: "NO",
    latitude: 59.9157,
    longitude: 10.7369,
    venueAreas: [
      { id: "area-uio-aula", name: "Aula", areaType: "hall" },
    ],
  },
  "hofdi house": {
    canonicalVenue: "Höfði House",
    venueType: "summit-center",
    streetAddress: "Borgartún 105",
    district: "Reykjavik",
    city: "Reykjavik",
    country: "Iceland",
    countryCode: "IS",
    latitude: 64.1465,
    longitude: -21.9066,
  },
  "villa fleur d'eau": {
    canonicalVenue: "Villa Fleur d'Eau",
    venueType: "summit-center",
    streetAddress: "Chemin des Fleur d'Eau 1-3",
    district: "Chambésy",
    city: "Geneva",
    country: "Switzerland",
    countryCode: "CH",
    latitude: 46.2410,
    longitude: 6.1950,
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
    venueAreas: [
      { id: "area-coburg-residenz", name: "Residenz Hall", areaType: "hall" },
    ],
  },
  "diaoyutai state guesthouse": {
    canonicalVenue: "Diaoyutai State Guesthouse",
    venueType: "summit-center",
    streetAddress: "2 Fucheng Road",
    district: "Haidian District",
    city: "Beijing",
    country: "China",
    countryCode: "CN",
    latitude: 39.9167,
    longitude: 116.3264,
    venueAreas: [
      { id: "area-diaoyutai-v18", name: "Villa 18", areaType: "room" },
      { id: "area-diaoyutai-v12", name: "Villa 12", areaType: "room" },
    ],
  },
  "great hall of the people": {
    canonicalVenue: "Great Hall of the People",
    venueType: "parliament",
    streetAddress: "West side of Tiananmen Square",
    district: "Dongcheng District",
    city: "Beijing",
    country: "China",
    countryCode: "CN",
    latitude: 39.9028,
    longitude: 116.3872,
    venueAreas: [
      { id: "area-ghp-auditorium", name: "Grand Auditorium", areaType: "hall" },
    ],
  },
  "food and agriculture organization (fao) headquarters": {
    canonicalVenue: "Food and Agriculture Organization (FAO) Headquarters",
    venueType: "international-body",
    streetAddress: "Viale delle Terme di Caracalla",
    district: "Ripa",
    city: "Rome",
    country: "Italy",
    countryCode: "IT",
    latitude: 41.8833,
    longitude: 12.4908,
    venueAreas: [
      { id: "area-fao-plenary", name: "Plenary Hall", areaType: "hall" },
    ],
  },
  "phoenicia intercontinental hotel": {
    canonicalVenue: "Phoenicia InterContinental Hotel",
    venueType: "summit-center",
    streetAddress: "Minet El Hosn",
    district: "Beirut Central District",
    city: "Beirut",
    country: "Lebanon",
    countryCode: "LB",
    latitude: 33.9011,
    longitude: 35.4958,
    venueAreas: [
      { id: "area-phoenicia-ballroom", name: "Grand Ballroom", areaType: "hall" },
    ],
  },
  "independence hall (dizengoff house)": {
    canonicalVenue: "Independence Hall (Dizengoff House)",
    venueType: "summit-center",
    streetAddress: "16 Rothschild Boulevard",
    district: "Lev Tel Aviv",
    city: "Tel Aviv",
    country: "Israel",
    countryCode: "IL",
    latitude: 32.0628,
    longitude: 34.7709,
    venueAreas: [
      { id: "area-indep-hall-main", name: "Declaration Ceremony Main Hall", areaType: "hall" },
    ],
  },
  "gerard bechar center (beit ha'am)": {
    canonicalVenue: "Gerard Bechar Center (Beit Ha'Am)",
    venueType: "summit-center",
    streetAddress: "11 Bezalel Street",
    district: "Nachlaot",
    city: "Jerusalem",
    country: "Israel",
    countryCode: "IL",
    latitude: 31.7808,
    longitude: 35.2144,
    venueAreas: [
      { id: "area-bechar-auditorium", name: "Main Auditorium", areaType: "hall" },
    ],
  },
  "kedma hotel isrotel": {
    canonicalVenue: "Kedma Hotel Isrotel",
    venueType: "summit-center",
    streetAddress: "Midreshet Ben-Gurion",
    district: "Ramat HaNegev",
    city: "Sde Boker",
    country: "Israel",
    countryCode: "IL",
    latitude: 30.8715,
    longitude: 34.7892,
    venueAreas: [
      { id: "area-kedma-gravesite", name: "Ben-Gurion Gravesite Pavilion", areaType: "outdoor" },
    ],
  },
  "united states naval academy": {
    canonicalVenue: "United States Naval Academy",
    venueType: "university",
    streetAddress: "121 Blake Rd",
    district: "Annapolis",
    city: "Annapolis",
    country: "United States",
    countryCode: "US",
    latitude: 38.9822,
    longitude: -76.4839,
    venueAreas: [
      { id: "area-usna-memorial-hall", name: "Memorial Hall", areaType: "hall" },
    ],
  },
  "new york city building (flushing meadows)": {
    canonicalVenue: "New York City Building (Flushing Meadows)",
    venueType: "summit-center",
    streetAddress: "Flushing Meadows-Corona Park",
    district: "Queens",
    city: "New York",
    country: "United States",
    countryCode: "US",
    latitude: 40.7458,
    longitude: -73.8467,
    venueAreas: [
      { id: "area-fm-plenary", name: "UN General Assembly Plenary Hall (1946-1952)", areaType: "hall" },
    ],
  },
  "ben gurion international airport": {
    canonicalVenue: "Ben Gurion International Airport",
    venueType: "airport",
    streetAddress: "Ben Gurion Airport Complex",
    district: "Central District",
    city: "Lod",
    country: "Israel",
    countryCode: "IL",
    latitude: 32.0005,
    longitude: 34.8707,
  },
  "ben-gurion international airport": {
    canonicalVenue: "Ben Gurion International Airport",
    venueType: "airport",
    streetAddress: "Ben Gurion Airport Complex",
    district: "Central District",
    city: "Lod",
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
    streetAddress: "Peace Way",
    district: "Aqaba Special Economic Zone",
    city: "Aqaba",
    country: "Jordan",
    countryCode: "JO",
    latitude: 29.6116,
    longitude: 35.0181,
  },
  "king khalid international airport": {
    canonicalVenue: "King Khalid International Airport",
    venueType: "airport",
    streetAddress: "King Khalid Airport Road",
    district: "Riyadh Province",
    city: "Riyadh",
    country: "Saudi Arabia",
    countryCode: "SA",
    latitude: 24.9576,
    longitude: 46.6988,
  },
  "cairo international airport": {
    canonicalVenue: "Cairo International Airport",
    venueType: "airport",
    streetAddress: "Cairo International Airport, Heliopolis",
    district: "Cairo Governorate",
    city: "Cairo",
    country: "Egypt",
    countryCode: "EG",
    latitude: 30.1219,
    longitude: 31.4056,
  },
  "wadi araba border crossing": {
    canonicalVenue: "Wadi Araba Border Crossing",
    venueType: "summit-center",
    streetAddress: "Arava Valley Border Site",
    district: "Aqaba Governorate",
    city: "Aqaba",
    country: "Jordan",
    countryCode: "JO",
    latitude: 29.5786,
    longitude: 34.9781,
    venueAreas: [
      { id: "area-wadi-araba-pavilion", name: "Plenary Pavilion", areaType: "hall" },
    ],
  },
};

const GAZETTEER_ALIASES: Record<string, string> = {
  "white house": "the white house",
  "us capitol": "united states capitol",
  "un headquarters": "united nations headquarters",
  "knesset": "the knesset",
  "prime minister’s office": "prime minister's office",
  "mar-a-lago": "mar-a-lago club",
  "royal palace of madrid (palacio real)": "royal palace of madrid",
  "palacio real": "royal palace of madrid",
  "palacio de las cortes (congreso de los diputados)": "palacio de las cortes",
  "foreign and commonwealth office": "foreign, commonwealth & development office",
  "bellevue palace (schloss bellevue)": "bellevue palace",
  "reichstag building (bundestag)": "reichstag building",
  "royal palace of brussels (palais royal)": "royal palace of brussels",
  "palace of the nation (belgian federal parliament)": "palace of the nation",
  "royal palace of stockholm (stockholms slott)": "royal palace of stockholm",
  "drottningholm palace (drottningholms slott)": "drottningholm palace",
  "stockholm concert hall (konserthuset)": "stockholm concert hall",
  "stockholm city hall (stadshuset)": "stockholm city hall",
  "palais princier": "palais princier de monaco",
  "prince's palace of monaco": "palais princier de monaco",
  "schloss vaduz (vaduz castle)": "schloss vaduz",
  "royal palace of bucharest (palatul regal)": "royal palace of bucharest",
  "elisabeta palace (palatul elisabeta)": "elisabeta palace",
  "national palace of mafra (basilica of mafra)": "national palace of mafra",
  "metropolitan cathedral of athens (mitropoli)": "metropolitan cathedral of athens",
  "royal compound (kraljevski dvor)": "the royal palace (kraljevski dvor)",
  "royal palace of belgrade": "the royal palace (kraljevski dvor)",
  "oslo city hall (oslo radhus)": "oslo city hall",
  "ben-gurion international airport": "ben gurion international airport",
};

for (const [alias, canonicalKey] of Object.entries(GAZETTEER_ALIASES)) {
  if (GLOBAL_GAZETTEER_METADATA[canonicalKey]) {
    GLOBAL_GAZETTEER_METADATA[alias] = GLOBAL_GAZETTEER_METADATA[canonicalKey];
  }
}


export const COUNTRY_CODE_MAP: Record<string, string> = {
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
  "Belgium": "BE",
  "Canada": "CA",
  "Australia": "AU",
  "Poland": "PL",
  "Ukraine": "UA",
  "Sweden": "SE",
  "Norway": "NO",
  "Denmark": "DK",
  "Finland": "FI",
  "Ireland": "IE",
  "New Zealand": "NZ",
  "India": "IN",
  "Brazil": "BR",
  "Mexico": "MX",
  "South Africa": "ZA",
  "South Korea": "KR",
  "Singapore": "SG",
  "Qatar": "QA",
  "Kuwait": "KW",
  "Oman": "OM",
  "Iraq": "IQ",
  "Yemen": "YE",
  "Vatican City": "VA",
  "Monaco": "MC",
  "Liechtenstein": "LI",
  "Luxembourg": "LU",
  "Greece": "GR",
  "Romania": "RO",
  "Portugal": "PT",
  "Serbia": "RS",
  "Iceland": "IS",
};

export const CODE_TO_COUNTRY_MAP: Record<string, string> = {
  US: "United States",
  USA: "United States",
  IL: "Israel",
  GB: "United Kingdom",
  UK: "United Kingdom",
  JO: "Jordan",
  EG: "Egypt",
  FR: "France",
  DE: "Germany",
  ES: "Spain",
  CH: "Switzerland",
  AT: "Austria",
  NL: "Netherlands",
  SA: "Saudi Arabia",
  AE: "United Arab Emirates",
  PS: "State of Palestine",
  CN: "China",
  RU: "Russia",
  BH: "Bahrain",
  MA: "Morocco",
  JP: "Japan",
  IT: "Italy",
  TR: "Turkey",
  LB: "Lebanon",
  SY: "Syria",
  IR: "Iran",
  BE: "Belgium",
  CA: "Canada",
  AU: "Australia",
  PL: "Poland",
  UA: "Ukraine",
  SE: "Sweden",
  NO: "Norway",
  DK: "Denmark",
  FI: "Finland",
  IE: "Ireland",
  NZ: "New Zealand",
  IN: "India",
  BR: "Brazil",
  MX: "Mexico",
  ZA: "South Africa",
  KR: "South Korea",
  SG: "Singapore",
  QA: "Qatar",
  KW: "Kuwait",
  OM: "Oman",
  IQ: "Iraq",
  YE: "Yemen",
  VA: "Vatican City",
  MC: "Monaco",
  LI: "Liechtenstein",
  LU: "Luxembourg",
  GR: "Greece",
  RO: "Romania",
  PT: "Portugal",
  RS: "Serbia",
  IS: "Iceland",
};

const NORMALIZED_COUNTRY_MAP: Record<string, string> = Object.fromEntries(
  Object.entries(COUNTRY_CODE_MAP).map(([k, v]) => [k.toLowerCase(), v])
);

const CITY_ALIASES: Record<string, string> = {
  "washington dc": "Washington, D.C.",
  "washington, dc": "Washington, D.C.",
  "washington, d.c.": "Washington, D.C.",
  "washington d.c.": "Washington, D.C.",
  "washington": "Washington, D.C.",
  "district of columbia": "Washington, D.C.",
  "nyc": "New York City",
  "new york": "New York City",
  "new york city": "New York City",
  "la": "Los Angeles",
  "los angeles": "Los Angeles",
  "westminster": "London",
  "city of westminster": "London",
  "the hague": "The Hague",
  "'s-gravenhage": "The Hague",
  "den haag": "The Hague",
};

export function normalizeCityName(city?: string | null): string {
  if (!city) return "";
  let trimmed = city.trim();
  trimmed = trimmed.replace(/,\s*(?:[A-Z]{2}|[A-Z][a-z]+)$/i, "").trim();
  const lower = trimmed.toLowerCase();
  const cleaned = lower.replace(/[.,]/g, " ").replace(/\s+/g, " ").trim();
  if (CITY_ALIASES[lower]) return CITY_ALIASES[lower];
  if (CITY_ALIASES[cleaned]) return CITY_ALIASES[cleaned];
  return trimmed;
}

export function isSameCity(cityA?: string | null, cityB?: string | null): boolean {
  if (!cityA || !cityB) return false;
  const normA = normalizeCityName(cityA).toLowerCase();
  const normB = normalizeCityName(cityB).toLowerCase();
  if (normA === normB) return true;
  const cleanA = cityA.toLowerCase().replace(/[^a-z0-9]/g, "");
  const cleanB = cityB.toLowerCase().replace(/[^a-z0-9]/g, "");
  return Boolean(cleanA && cleanB && cleanA === cleanB);
}

export function resolveCanonicalCountryName(countryOrCode?: string | null): string {
  if (!countryOrCode) return "Unknown";
  let trimmed = countryOrCode.trim();
  if (trimmed.includes("/") || trimmed.includes(";")) {
    const parts = trimmed.split(/[/;]/).map((p) => p.trim()).filter(Boolean);
    for (const part of parts) {
      const partCanonical = resolveCanonicalCountryName(part);
      if (partCanonical !== "Unknown" && COUNTRY_CODE_MAP[partCanonical]) {
        return partCanonical;
      }
    }
    trimmed = parts[0] || "Unknown";
  }
  const lower = trimmed.toLowerCase();
  const upper = trimmed.toUpperCase();
  if (CODE_TO_COUNTRY_MAP[upper]) {
    return CODE_TO_COUNTRY_MAP[upper];
  }
  const codeFromMap =
    COUNTRY_CODE_MAP[trimmed] ||
    NORMALIZED_COUNTRY_MAP[lower] ||
    COUNTRY_CODE_MAP[upper];
  if (codeFromMap && CODE_TO_COUNTRY_MAP[codeFromMap]) {
    return CODE_TO_COUNTRY_MAP[codeFromMap];
  }
  return trimmed;
}

/**
 * Resolves WGS-84 coordinates for a place, venue, or city using the authoritative gazetteer.
 */
function normalizeGazetteerKey(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ð/g, "d")
    .replace(/þ/g, "th")
    .replace(/æ/g, "ae")
    .replace(/œ/g, "oe")
    .replace(/ß/g, "ss");
}

export function resolveGazetteerCoordinates(location: {
  venue?: string | null;
  city?: string | null;
  country?: string | null;
}): { latitude: number; longitude: number; source: "venue" | "city" } | null {
  if (typeof location.venue === "string" && location.venue.trim()) {
    const venueNorm = location.venue.trim().toLowerCase();
    const venueClean = normalizeGazetteerKey(location.venue);
    if (Object.prototype.hasOwnProperty.call(GLOBAL_GAZETTEER_COORDINATES, venueNorm)) {
      const coords = GLOBAL_GAZETTEER_COORDINATES[venueNorm];
      if (Array.isArray(coords) && typeof coords[0] === "number" && typeof coords[1] === "number") {
        return { latitude: coords[0], longitude: coords[1], source: "venue" };
      }
    }
    if (Object.prototype.hasOwnProperty.call(GLOBAL_GAZETTEER_COORDINATES, venueClean)) {
      const coords = GLOBAL_GAZETTEER_COORDINATES[venueClean];
      if (Array.isArray(coords) && typeof coords[0] === "number" && typeof coords[1] === "number") {
        return { latitude: coords[0], longitude: coords[1], source: "venue" };
      }
    }
  }

  if (typeof location.city === "string" && location.city.trim()) {
    const cityNorm = location.city.trim().toLowerCase();
    const cityClean = normalizeGazetteerKey(location.city);
    if (Object.prototype.hasOwnProperty.call(GLOBAL_GAZETTEER_COORDINATES, cityNorm)) {
      const coords = GLOBAL_GAZETTEER_COORDINATES[cityNorm];
      if (Array.isArray(coords) && typeof coords[0] === "number" && typeof coords[1] === "number") {
        return { latitude: coords[0], longitude: coords[1], source: "city" };
      }
    }
    if (Object.prototype.hasOwnProperty.call(GLOBAL_GAZETTEER_COORDINATES, cityClean)) {
      const coords = GLOBAL_GAZETTEER_COORDINATES[cityClean];
      if (Array.isArray(coords) && typeof coords[0] === "number" && typeof coords[1] === "number") {
        return { latitude: coords[0], longitude: coords[1], source: "city" };
      }
    }
  }

  return null;
}

export function resolveVenueMetadata(venue?: string | null): GazetteerVenueMetadata | null {
  if (!venue || !venue.trim()) return null;
  const norm = venue.trim().toLowerCase();
  const clean = normalizeGazetteerKey(venue);
  if (Object.hasOwn(GLOBAL_GAZETTEER_METADATA, norm)) {
    return GLOBAL_GAZETTEER_METADATA[norm];
  }
  if (Object.hasOwn(GLOBAL_GAZETTEER_METADATA, clean)) {
    return GLOBAL_GAZETTEER_METADATA[clean];
  }
  const baseNorm = norm.replace(/\s*\([^)]*\)/g, "").trim();
  const baseClean = clean.replace(/\s*\([^)]*\)/g, "").trim();
  if (Object.hasOwn(GLOBAL_GAZETTEER_METADATA, baseNorm)) {
    return GLOBAL_GAZETTEER_METADATA[baseNorm];
  }
  if (Object.hasOwn(GLOBAL_GAZETTEER_METADATA, baseClean)) {
    return GLOBAL_GAZETTEER_METADATA[baseClean];
  }
  return null;
}

function sanitizePlaceSlug(str: string): string {
  return (
    str
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9_-]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "") || "unknown"
  );
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
    rawPlaces = Object.entries(GLOBAL_GAZETTEER_METADATA)
      .filter(([key]) => !Object.hasOwn(GAZETTEER_ALIASES, key))
      .map(([key, meta]) => {
      const slug = sanitizePlaceSlug(key);
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
  const eventCountsByVenueKey = new Map<string, number>();
  const eventCountsByCity = new Map<string, number>();
  const eventCountsByCountry = new Map<string, number>();

  allEvents.forEach((e) => {
    const rawVenue = (e.venueName || "").trim();
    const venueNorm = rawVenue.toLowerCase();
    const meta = venueNorm ? GLOBAL_GAZETTEER_METADATA[venueNorm] : undefined;
    const canonicalVenueName = (meta?.canonicalVenue || rawVenue).trim();
    const canonicalVenueNorm = canonicalVenueName.toLowerCase();

    const vId = rawVenue ? `plc-${(e.city || "unknown").toLowerCase().replace(/\s+/g, "-")}-${rawVenue.toLowerCase().replace(/[^\w]/g, "-").slice(0, 20)}` : "";
    if (vId) {
      eventCountsByVenueId.set(vId, (eventCountsByVenueId.get(vId) || 0) + 1);
    }
    if (canonicalVenueNorm) {
      eventCountsByVenueKey.set(canonicalVenueNorm, (eventCountsByVenueKey.get(canonicalVenueNorm) || 0) + 1);
    }
    if (venueNorm && venueNorm !== canonicalVenueNorm) {
      eventCountsByVenueKey.set(venueNorm, (eventCountsByVenueKey.get(venueNorm) || 0) + 1);
    }
    const eventCountryName = resolveCanonicalCountryName(e.country);
    const eventCityName = (e.city || "Unknown").trim();
    const cityKey = `${eventCountryName}::${eventCityName}`.toLowerCase();
    if (eventCityName) {
      eventCountsByCity.set(cityKey, (eventCountsByCity.get(cityKey) || 0) + 1);
    }
    const cntryNorm = eventCountryName.trim().toLowerCase();
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
    const countryName = resolveCanonicalCountryName(p.country);
    const countryCode = COUNTRY_CODE_MAP[countryName] || (p.country && p.country.trim().length === 2 ? p.country.trim().toUpperCase() : "UN");
    const countrySlug = sanitizePlaceSlug(countryName);

    const cityName = (p.city || "Unknown").trim();
    const citySlug = `${countrySlug}-${sanitizePlaceSlug(cityName)}`;
    const cityCityKey = `${countryName}::${cityName}`.toLowerCase();

    const venueName = (p.venue || cityName).trim();
    const venueNorm = venueName.toLowerCase();
    const metaDirect = GLOBAL_GAZETTEER_METADATA[venueNorm];
    const canonicalVenueName = (metaDirect?.canonicalVenue || venueName).trim();
    const canonicalVenueNorm = canonicalVenueName.toLowerCase();
    const meta = metaDirect || GLOBAL_GAZETTEER_METADATA[canonicalVenueNorm];

    const streetAddress = meta?.streetAddress || (p.streetAddress || null);
    const venueType = meta?.venueType || p.placeType || "venue";
    const venueAreas = meta?.venueAreas || p.venueAreas || [];
    const eventCount =
      eventCountsByVenueId.get(p.id) ||
      eventCountsByVenueKey.get(canonicalVenueNorm) ||
      eventCountsByVenueKey.get(venueNorm) ||
      0;

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
        eventCount: eventCountsByCity.get(cityCityKey) || 0,
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
      const addrSlug = `${citySlug}-${sanitizePlaceSlug(streetAddress).slice(0, 30)}`;
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
        const dbCity = String(p.city || "Unknown");
        const dbCountry = String(p.country || "Unknown");

        const locationMatches =
          Boolean(meta) &&
          (!p.city || isSameCity(dbCity, meta!.city)) &&
          (!p.country || resolveCanonicalCountryName(dbCountry).toLowerCase() === resolveCanonicalCountryName(meta!.country).toLowerCase());

        seenIds.add(String(p.id));
        seenSlugs.add(String(p.slug));
        results.push({
          id: String(p.id),
          slug: String(p.slug),
          venue: (locationMatches && meta?.canonicalVenue) || vName,
          city: (locationMatches && meta?.city) || dbCity,
          country: (locationMatches && meta?.country) || dbCountry,
          latitude: typeof p.latitude === "number" ? p.latitude : (locationMatches ? (meta?.latitude ?? null) : null),
          longitude: typeof p.longitude === "number" ? p.longitude : (locationMatches ? (meta?.longitude ?? null) : null),
          placeType: (locationMatches && meta?.venueType) || String(p.place_type || "venue"),
          streetAddress: (locationMatches && meta?.streetAddress) || null,
          venueAreas: (locationMatches && meta?.venueAreas) || [],
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
          const addrCity = addr?.city || "Unknown";
          const addrCountry = addr?.country_code ? resolveCanonicalCountryName(addr.country_code) : "Unknown";

          const locationMatches =
            Boolean(meta) &&
            (!addr?.city || isSameCity(addrCity, meta!.city)) &&
            (!addr?.country_code || resolveCanonicalCountryName(addrCountry).toLowerCase() === resolveCanonicalCountryName(meta!.country).toLowerCase());

          seenIds.add(v.id);
          seenSlugs.add(vSlug);
          results.push({
            id: v.id,
            slug: vSlug,
            venue: (locationMatches && meta?.canonicalVenue) || v.name,
            city: (locationMatches && meta?.city) || addrCity,
            country: (locationMatches && meta?.country) || addrCountry,
            latitude: v.latitude ?? (locationMatches ? (meta?.latitude ?? null) : null),
            longitude: v.longitude ?? (locationMatches ? (meta?.longitude ?? null) : null),
            placeType: (locationMatches && meta?.venueType) || "venue",
            streetAddress: (locationMatches && meta?.streetAddress) || addr?.formatted_english || null,
            venueAreas: (locationMatches && meta?.venueAreas) || [],
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

      const matchedVenue = hierarchy.allVenues.find((v) => {
        const normName = v.name.toLowerCase().replace(/^(the|a|an)\s+/, "").trim();
        const normSlug = normName.replace(/[^a-z0-9_-]+/g, "-").replace(/-+/g, "-");
        return (
          v.slug === slug ||
          v.name.toLowerCase().replace(/[^\w]+/g, "-") === slug ||
          v.name.toLowerCase().replace(/\s+/g, "-") === slug ||
          normSlug === slug
        );
      });
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
      const vName = String(p.venue || p.city || "");
      const meta = GLOBAL_GAZETTEER_METADATA[vName.toLowerCase()];
      const dbCity = String(p.city || "Unknown");
      const dbCountry = String(p.country || "Unknown");
      const locationMatches =
        Boolean(meta) &&
        (!p.city || isSameCity(dbCity, meta!.city)) &&
        (!p.country || resolveCanonicalCountryName(dbCountry).toLowerCase() === resolveCanonicalCountryName(meta!.country).toLowerCase());

      place = {
        id: p.id,
        slug: p.slug,
        venue: (locationMatches && meta?.canonicalVenue) || p.venue,
        city: (locationMatches && meta?.city) || p.city,
        country: (locationMatches && meta?.country) || p.country,
        latitude: p.latitude ?? (locationMatches ? (meta?.latitude ?? null) : null),
        longitude: p.longitude ?? (locationMatches ? (meta?.longitude ?? null) : null),
        placeType: (locationMatches && meta?.venueType) || p.place_type,
        streetAddress: (locationMatches && meta?.streetAddress) || null,
        venueAreas: (locationMatches && meta?.venueAreas) || [],
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
      const locationMatches =
        Boolean(meta) &&
        (city === "Unknown" || isSameCity(city, meta!.city)) &&
        (country === "Unknown" || resolveCanonicalCountryName(country).toLowerCase() === resolveCanonicalCountryName(meta!.country).toLowerCase());

      place = {
        id: v.id,
        slug: v.id.replace(/^plc-|^ven-/, ""),
        venue: (locationMatches && meta?.canonicalVenue) || v.name,
        city: (locationMatches && meta?.city) || city,
        country: (locationMatches && meta?.country) || country,
        latitude: v.latitude ?? (locationMatches ? (meta?.latitude ?? null) : null),
        longitude: v.longitude ?? (locationMatches ? (meta?.longitude ?? null) : null),
        placeType: (locationMatches && meta?.venueType) || "venue",
        streetAddress: (locationMatches && meta?.streetAddress) || streetAddress,
        venueAreas: (locationMatches && meta?.venueAreas) || [],
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
