export interface CountryGazetteerDef {
  name: string;
  iso2: string;
  capital: string;
  lat: number;
  lng: number;
  parliament: string;
  parliamentCoords: [number, number];
  residence: string;
  residenceCoords: [number, number];
  foreignMinistry: string;
  airport: string;
  airportIata: string;
  airportCoords: [number, number];
  conventionCenter: string;
  keyCities: Array<{ name: string; lat: number; lng: number }>;
}

export const COUNTRIES_DATA: CountryGazetteerDef[] = [
  {
    name: "United States",
    iso2: "US",
    capital: "Washington, D.C.",
    lat: 38.8951,
    lng: -77.0364,
    parliament: "United States Capitol",
    parliamentCoords: [38.8899, -77.0091],
    residence: "The White House",
    residenceCoords: [38.8977, -77.0365],
    foreignMinistry: "Harry S. Truman Building (Department of State)",
    airport: "Washington Dulles International Airport",
    airportIata: "IAD",
    airportCoords: [38.9531, -77.4565],
    conventionCenter: "Walter E. Washington Convention Center",
    keyCities: [
      { name: "New York", lat: 40.7128, lng: -74.006 },
      { name: "Chicago", lat: 41.8781, lng: -87.6298 },
      { name: "San Francisco", lat: 37.7749, lng: -122.4194 },
      { name: "Los Angeles", lat: 34.0522, lng: -118.2437 },
      { name: "Boston", lat: 42.3601, lng: -71.0589 },
      { name: "Miami", lat: 25.7617, lng: -80.1918 },
      { name: "Atlanta", lat: 33.749, lng: -84.388 },
      { name: "Dallas", lat: 32.7767, lng: -96.797 },
      { name: "Houston", lat: 29.7604, lng: -95.3698 },
      { name: "Philadelphia", lat: 39.9526, lng: -75.1652 },
      { name: "Seattle", lat: 47.6062, lng: -122.3321 },
      { name: "Denver", lat: 39.7392, lng: -104.9903 },
      { name: "Detroit", lat: 42.3314, lng: -83.0458 },
      { name: "Minneapolis", lat: 44.9778, lng: -93.265 },
      { name: "Phoenix", lat: 33.4484, lng: -112.074 }
    ]
  },
  {
    name: "United Kingdom",
    iso2: "GB",
    capital: "London",
    lat: 51.5074,
    lng: -0.1278,
    parliament: "Palace of Westminster",
    parliamentCoords: [51.4995, -0.1248],
    residence: "10 Downing Street",
    residenceCoords: [51.5034, -0.1276],
    foreignMinistry: "Foreign, Commonwealth & Development Office",
    airport: "Heathrow Airport",
    airportIata: "LHR",
    airportCoords: [51.47, -0.4543],
    conventionCenter: "ExCeL London",
    keyCities: [
      { name: "Edinburgh", lat: 55.9533, lng: -3.1883 },
      { name: "Manchester", lat: 53.4808, lng: -2.2426 },
      { name: "Birmingham", lat: 52.4862, lng: -1.8904 },
      { name: "Glasgow", lat: 55.8642, lng: -4.2518 },
      { name: "Belfast", lat: 54.5973, lng: -5.9301 },
      { name: "Cardiff", lat: 51.4816, lng: -3.1791 },
      { name: "Oxford", lat: 51.752, lng: -1.2577 },
      { name: "Cambridge", lat: 52.2053, lng: 0.1218 },
      { name: "Leeds", lat: 53.8008, lng: -1.5491 },
      { name: "Liverpool", lat: 53.4084, lng: -2.9916 }
    ]
  },
  {
    name: "France",
    iso2: "FR",
    capital: "Paris",
    lat: 48.8566,
    lng: 2.3522,
    parliament: "Palais Bourbon (National Assembly)",
    parliamentCoords: [48.8619, 2.3186],
    residence: "Élysée Palace",
    residenceCoords: [48.8704, 2.3168],
    foreignMinistry: "Quai d'Orsay (Ministry for Europe and Foreign Affairs)",
    airport: "Charles de Gaulle Airport",
    airportIata: "CDG",
    airportCoords: [49.0097, 2.5479],
    conventionCenter: "Palais des Congrès de Paris",
    keyCities: [
      { name: "Lyon", lat: 45.764, lng: 4.8357 },
      { name: "Marseille", lat: 43.2965, lng: 5.3698 },
      { name: "Strasbourg", lat: 48.5734, lng: 7.7521 },
      { name: "Bordeaux", lat: 44.8378, lng: -0.5792 },
      { name: "Nice", lat: 43.7102, lng: 7.262 },
      { name: "Toulouse", lat: 43.6047, lng: 1.4442 },
      { name: "Lille", lat: 50.6292, lng: 3.0573 },
      { name: "Rennes", lat: 48.1173, lng: -1.6778 },
      { name: "Nantes", lat: 47.2184, lng: -1.5536 }
    ]
  },
  {
    name: "Germany",
    iso2: "DE",
    capital: "Berlin",
    lat: 52.52,
    lng: 13.405,
    parliament: "Reichstag Building (Bundestag)",
    parliamentCoords: [52.5186, 13.3761],
    residence: "Federal Chancellery",
    residenceCoords: [52.5202, 13.369],
    foreignMinistry: "Federal Foreign Office (Auswärtiges Amt)",
    airport: "Berlin Brandenburg Airport",
    airportIata: "BER",
    airportCoords: [52.3667, 13.5033],
    conventionCenter: "Messe Berlin",
    keyCities: [
      { name: "Munich", lat: 48.1351, lng: 11.582 },
      { name: "Frankfurt", lat: 50.1109, lng: 8.6821 },
      { name: "Hamburg", lat: 53.5511, lng: 9.9937 },
      { name: "Cologne", lat: 50.9375, lng: 6.9603 },
      { name: "Bonn", lat: 50.7374, lng: 7.0982 },
      { name: "Stuttgart", lat: 48.7758, lng: 9.1829 },
      { name: "Düsseldorf", lat: 51.2277, lng: 6.7735 },
      { name: "Dresden", lat: 51.0504, lng: 13.7373 },
      { name: "Leipzig", lat: 51.3397, lng: 12.3731 }
    ]
  },
  {
    name: "Israel",
    iso2: "IL",
    capital: "Jerusalem",
    lat: 31.7683,
    lng: 35.2137,
    parliament: "The Knesset",
    parliamentCoords: [31.7766, 35.2052],
    residence: "Beit Aghion (Prime Minister's Official Residence)",
    residenceCoords: [31.7709, 35.2155],
    foreignMinistry: "Ministry of Foreign Affairs (Givat Ram)",
    airport: "Ben Gurion Airport",
    airportIata: "TLV",
    airportCoords: [32.0055, 34.8854],
    conventionCenter: "International Convention Center (Binyanei HaUma)",
    keyCities: [
      { name: "Tel Aviv", lat: 32.0853, lng: 34.7818 },
      { name: "Haifa", lat: 32.794, lng: 34.9896 },
      { name: "Beersheba", lat: 31.2529, lng: 34.7915 },
      { name: "Herzliya", lat: 32.1663, lng: 34.8433 },
      { name: "Ramat Gan", lat: 32.0684, lng: 34.8248 },
      { name: "Caesarea", lat: 32.5186, lng: 34.9044 },
      { name: "Eilat", lat: 29.5577, lng: 34.9519 }
    ]
  },
  {
    name: "Japan",
    iso2: "JP",
    capital: "Tokyo",
    lat: 35.6762,
    lng: 139.6503,
    parliament: "National Diet Building",
    parliamentCoords: [35.6759, 139.7449],
    residence: "Kantei (Prime Minister's Official Residence)",
    residenceCoords: [35.6734, 139.7428],
    foreignMinistry: "Ministry of Foreign Affairs (Kasumigaseki)",
    airport: "Tokyo Haneda Airport",
    airportIata: "HND",
    airportCoords: [35.5494, 139.7798],
    conventionCenter: "Tokyo International Forum",
    keyCities: [
      { name: "Osaka", lat: 34.6937, lng: 135.5023 },
      { name: "Kyoto", lat: 35.0116, lng: 135.7681 },
      { name: "Yokohama", lat: 35.4437, lng: 139.638 },
      { name: "Nagoya", lat: 35.1815, lng: 136.9066 },
      { name: "Hiroshima", lat: 34.3853, lng: 132.4553 },
      { name: "Sapporo", lat: 43.0618, lng: 141.3545 },
      { name: "Fukuoka", lat: 33.5904, lng: 130.4017 }
    ]
  },
  {
    name: "Italy",
    iso2: "IT",
    capital: "Rome",
    lat: 41.9028,
    lng: 12.4964,
    parliament: "Palazzo Montecitorio (Chamber of Deputies)",
    parliamentCoords: [41.9014, 12.4786],
    residence: "Palazzo Chigi (President of the Council of Ministers)",
    residenceCoords: [41.9015, 12.4795],
    foreignMinistry: "Palazzo della Farnesina",
    airport: "Leonardo da Vinci–Fiumicino Airport",
    airportIata: "FCO",
    airportCoords: [41.8003, 12.2389],
    conventionCenter: "Fiera Roma",
    keyCities: [
      { name: "Milan", lat: 45.4642, lng: 9.19 },
      { name: "Florence", lat: 43.7696, lng: 11.2558 },
      { name: "Naples", lat: 40.8518, lng: 14.2681 },
      { name: "Venice", lat: 45.4408, lng: 12.3155 },
      { name: "Turin", lat: 45.0703, lng: 7.6869 },
      { name: "Bologna", lat: 44.4949, lng: 11.3426 },
      { name: "Genoa", lat: 44.4056, lng: 8.9463 }
    ]
  },
  {
    name: "Canada",
    iso2: "CA",
    capital: "Ottawa",
    lat: 45.4215,
    lng: -75.6972,
    parliament: "Parliament Hill (Centre Block)",
    parliamentCoords: [45.4251, -75.7001],
    residence: "24 Sussex Drive / Rideau Cottage",
    residenceCoords: [45.4444, -75.6939],
    foreignMinistry: "Lester B. Pearson Building (Global Affairs Canada)",
    airport: "Ottawa Macdonald–Cartier International Airport",
    airportIata: "YOW",
    airportCoords: [45.3225, -75.6672],
    conventionCenter: "Shaw Centre (Ottawa Convention Centre)",
    keyCities: [
      { name: "Toronto", lat: 43.6532, lng: -79.3832 },
      { name: "Montreal", lat: 45.5017, lng: -73.5673 },
      { name: "Vancouver", lat: 49.2827, lng: -123.1207 },
      { name: "Calgary", lat: 51.0447, lng: -114.0719 },
      { name: "Edmonton", lat: 53.5461, lng: -113.4938 },
      { name: "Quebec City", lat: 46.8139, lng: -71.208 }
    ]
  },
  {
    name: "Australia",
    iso2: "AU",
    capital: "Canberra",
    lat: -35.2809,
    lng: 149.13,
    parliament: "Parliament House",
    parliamentCoords: [-35.3082, 149.1244],
    residence: "The Lodge",
    residenceCoords: [-35.3089, 149.1166],
    foreignMinistry: "R.G. Casey Building (Department of Foreign Affairs and Trade)",
    airport: "Canberra Airport",
    airportIata: "CBR",
    airportCoords: [-35.3069, 149.195],
    conventionCenter: "National Convention Centre Canberra",
    keyCities: [
      { name: "Sydney", lat: -33.8688, lng: 151.2093 },
      { name: "Melbourne", lat: -37.8136, lng: 144.9631 },
      { name: "Brisbane", lat: -27.4698, lng: 153.0251 },
      { name: "Perth", lat: -31.9505, lng: 115.8605 },
      { name: "Adelaide", lat: -34.9285, lng: 138.6007 }
    ]
  },
  {
    name: "Switzerland",
    iso2: "CH",
    capital: "Bern",
    lat: 46.948,
    lng: 7.4474,
    parliament: "Federal Palace of Switzerland (Bundeshaus)",
    parliamentCoords: [46.9465, 7.4443],
    residence: "Federal Council Chambers (Bundeshaus)",
    residenceCoords: [46.9465, 7.4443],
    foreignMinistry: "Federal Department of Foreign Affairs (EDA)",
    airport: "Geneva Airport",
    airportIata: "GVA",
    airportCoords: [46.2381, 6.1089],
    conventionCenter: "Palais des Nations (UN Geneva)",
    keyCities: [
      { name: "Geneva", lat: 46.2044, lng: 6.1432 },
      { name: "Zurich", lat: 47.3769, lng: 8.5417 },
      { name: "Basel", lat: 47.5596, lng: 7.5886 },
      { name: "Lausanne", lat: 46.5197, lng: 6.6323 },
      { name: "Davos", lat: 46.8027, lng: 9.836 }
    ]
  },
  {
    name: "Belgium",
    iso2: "BE",
    capital: "Brussels",
    lat: 50.8503,
    lng: 4.3517,
    parliament: "Palace of the Nation (Belgian Federal Parliament)",
    parliamentCoords: [50.8467, 4.3644],
    residence: "16 Rue de la Loi (Lambermont)",
    residenceCoords: [50.8447, 4.3694],
    foreignMinistry: "Federal Public Service Foreign Affairs (Egmont Palace)",
    airport: "Brussels Airport",
    airportIata: "BRU",
    airportCoords: [50.9014, 4.4844],
    conventionCenter: "Square Brussels Meeting Centre",
    keyCities: [
      { name: "Antwerp", lat: 51.2194, lng: 4.4025 },
      { name: "Ghent", lat: 51.0543, lng: 3.7174 },
      { name: "Bruges", lat: 51.2093, lng: 3.2247 },
      { name: "Liège", lat: 50.6326, lng: 5.5797 }
    ]
  },
  {
    name: "Netherlands",
    iso2: "NL",
    capital: "Amsterdam",
    lat: 52.3676,
    lng: 4.9041,
    parliament: "Binnenhof (States General)",
    parliamentCoords: [52.0797, 4.3138],
    residence: "Catshuis (Official Residence)",
    residenceCoords: [52.0911, 4.2831],
    foreignMinistry: "Ministry of Foreign Affairs (The Hague)",
    airport: "Amsterdam Airport Schiphol",
    airportIata: "AMS",
    airportCoords: [52.3105, 4.7683],
    conventionCenter: "World Forum The Hague",
    keyCities: [
      { name: "The Hague", lat: 52.0705, lng: 4.3007 },
      { name: "Rotterdam", lat: 51.9244, lng: 4.4777 },
      { name: "Utrecht", lat: 52.0907, lng: 5.1214 },
      { name: "Eindhoven", lat: 51.4416, lng: 5.4697 },
      { name: "Maastricht", lat: 50.8514, lng: 5.691 }
    ]
  },
  {
    name: "Spain",
    iso2: "ES",
    capital: "Madrid",
    lat: 40.4168,
    lng: -3.7038,
    parliament: "Palacio de las Cortes (Congress of Deputies)",
    parliamentCoords: [40.4163, -3.6961],
    residence: "Palacio de la Moncloa",
    residenceCoords: [40.4354, -3.7381],
    foreignMinistry: "Palacio de Santa Cruz (Ministry of Foreign Affairs)",
    airport: "Adolfo Suárez Madrid–Barajas Airport",
    airportIata: "MAD",
    airportCoords: [40.4839, -3.568],
    conventionCenter: "IFEMA Madrid",
    keyCities: [
      { name: "Barcelona", lat: 41.3851, lng: 2.1734 },
      { name: "Seville", lat: 37.3891, lng: -5.9845 },
      { name: "Valencia", lat: 39.4699, lng: -0.3763 },
      { name: "Bilbao", lat: 43.263, lng: -2.935 }
    ]
  },
  {
    name: "Egypt",
    iso2: "EG",
    capital: "Cairo",
    lat: 30.0444,
    lng: 31.2357,
    parliament: "House of Representatives (Maglis El-Nowwab)",
    parliamentCoords: [30.0411, 31.2372],
    residence: "Heliopolis Palace (Ittihadiya)",
    residenceCoords: [30.0886, 31.3189],
    foreignMinistry: "Ministry of Foreign Affairs (Corniche el-Nil)",
    airport: "Cairo International Airport",
    airportIata: "CAI",
    airportCoords: [30.1219, 31.4056],
    conventionCenter: "Cairo International Convention Centre",
    keyCities: [
      { name: "Alexandria", lat: 31.2001, lng: 29.9187 },
      { name: "Sharm El Sheikh", lat: 27.9158, lng: 34.3299 },
      { name: "Luxor", lat: 25.6872, lng: 32.6396 },
      { name: "Aswan", lat: 24.0889, lng: 32.8998 },
      { name: "Port Said", lat: 31.2653, lng: 32.3019 }
    ]
  },
  {
    name: "Jordan",
    iso2: "JO",
    capital: "Amman",
    lat: 31.9454,
    lng: 35.9284,
    parliament: "Parliament of Jordan (Al-Abdali)",
    parliamentCoords: [31.9619, 35.9125],
    residence: "Raghadan Palace (Royal Hashemite Court)",
    residenceCoords: [31.9692, 35.9458],
    foreignMinistry: "Ministry of Foreign Affairs and Expatriates",
    airport: "Queen Alia International Airport",
    airportIata: "AMM",
    airportCoords: [31.7226, 35.9932],
    conventionCenter: "King Hussein Bin Talal Convention Centre (Dead Sea)",
    keyCities: [
      { name: "Aqaba", lat: 29.532, lng: 35.0063 },
      { name: "Zarqa", lat: 32.0608, lng: 36.0942 },
      { name: "Irbid", lat: 32.5568, lng: 35.8469 }
    ]
  },
  {
    name: "Saudi Arabia",
    iso2: "SA",
    capital: "Riyadh",
    lat: 24.7136,
    lng: 46.6753,
    parliament: "Consultative Assembly (Majlis ash-Shura)",
    parliamentCoords: [24.6467, 46.7022],
    residence: "Al-Yamamah Palace (Royal Court)",
    residenceCoords: [24.6644, 46.6347],
    foreignMinistry: "Ministry of Foreign Affairs (Al-Washm)",
    airport: "King Khalid International Airport",
    airportIata: "RUH",
    airportCoords: [24.9576, 46.6988],
    conventionCenter: "Riyadh International Convention & Exhibition Center",
    keyCities: [
      { name: "Jeddah", lat: 21.4858, lng: 39.1925 },
      { name: "Mecca", lat: 21.3891, lng: 39.8579 },
      { name: "Medina", lat: 24.5247, lng: 39.5692 },
      { name: "Dammam", lat: 26.4207, lng: 50.0888 },
      { name: "Dhahran", lat: 26.2361, lng: 50.1136 }
    ]
  },
  {
    name: "United Arab Emirates",
    iso2: "AE",
    capital: "Abu Dhabi",
    lat: 24.4539,
    lng: 54.3773,
    parliament: "Federal National Council (FNC)",
    parliamentCoords: [24.4578, 54.3467],
    residence: "Qasr Al Watan (Presidential Palace)",
    residenceCoords: [24.4619, 54.3039],
    foreignMinistry: "Ministry of Foreign Affairs (MoFA)",
    airport: "Zayed International Airport",
    airportIata: "AUH",
    airportCoords: [24.433, 54.6511],
    conventionCenter: "Abu Dhabi National Exhibition Centre (ADNEC)",
    keyCities: [
      { name: "Dubai", lat: 25.2048, lng: 55.2708 },
      { name: "Sharjah", lat: 25.3463, lng: 55.4209 },
      { name: "Al Ain", lat: 24.2075, lng: 55.7447 }
    ]
  },
  {
    name: "India",
    iso2: "IN",
    capital: "New Delhi",
    lat: 28.6139,
    lng: 77.209,
    parliament: "Samvidhan Sadan / New Parliament House",
    parliamentCoords: [28.6172, 77.2081],
    residence: "Rashtrapati Bhavan (Presidential Palace)",
    residenceCoords: [28.6143, 77.1994],
    foreignMinistry: "Jawaharlal Nehru Bhawan (Ministry of External Affairs)",
    airport: "Indira Gandhi International Airport",
    airportIata: "DEL",
    airportCoords: [28.5562, 77.1],
    conventionCenter: "Bharat Mandapam (IECC)",
    keyCities: [
      { name: "Mumbai", lat: 18.922, lng: 72.8347 },
      { name: "Bangalore", lat: 12.9716, lng: 77.5946 },
      { name: "Chennai", lat: 13.0827, lng: 80.2707 },
      { name: "Kolkata", lat: 22.5726, lng: 88.3639 },
      { name: "Hyderabad", lat: 17.385, lng: 78.4867 }
    ]
  },
  {
    name: "Brazil",
    iso2: "BR",
    capital: "Brasília",
    lat: -15.7975,
    lng: -47.8919,
    parliament: "National Congress of Brazil",
    parliamentCoords: [-15.7997, -47.8641],
    residence: "Palácio da Alvorada / Palácio do Planalto",
    residenceCoords: [-15.7991, -47.8608],
    foreignMinistry: "Itamaraty Palace (Ministry of Foreign Affairs)",
    airport: "Brasília International Airport",
    airportIata: "BSB",
    airportCoords: [-15.8697, -47.9172],
    conventionCenter: "Centro de Convenções Ulysses Guimarães",
    keyCities: [
      { name: "Rio de Janeiro", lat: -22.9068, lng: -43.1729 },
      { name: "São Paulo", lat: -23.5505, lng: -46.6333 },
      { name: "Salvador", lat: -12.9777, lng: -38.5016 },
      { name: "Belo Horizonte", lat: -19.9167, lng: -43.9345 }
    ]
  },
  {
    name: "South Africa",
    iso2: "ZA",
    capital: "Pretoria",
    lat: -25.7479,
    lng: 28.2293,
    parliament: "Parliament of South Africa (Cape Town)",
    parliamentCoords: [-33.9264, 18.4199],
    residence: "Mahlamba Ndlopfu (Union Buildings)",
    residenceCoords: [-25.7402, 28.2119],
    foreignMinistry: "OR Tambo Building (Department of International Relations and Cooperation)",
    airport: "O.R. Tambo International Airport",
    airportIata: "JNB",
    airportCoords: [-26.1367, 28.2411],
    conventionCenter: "Cape Town International Convention Centre",
    keyCities: [
      { name: "Johannesburg", lat: -26.2041, lng: 28.0473 },
      { name: "Cape Town", lat: -33.9249, lng: 18.4241 },
      { name: "Durban", lat: -29.8587, lng: 31.0218 }
    ]
  }
];
