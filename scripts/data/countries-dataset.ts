export interface CountryMeta {
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
  airportCoords: [number, number];
  conventionCenter: string;
  keyCities: Array<{ name: string; lat: number; lng: number }>;
  namePool: {
    firstNames: string[];
    lastNames: string[];
  };
}

export const COMPREHENSIVE_COUNTRIES: CountryMeta[] = [
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
    foreignMinistry: "Harry S. Truman Building",
    airport: "Washington Dulles International Airport",
    airportCoords: [38.9531, -77.4565],
    conventionCenter: "Walter E. Washington Convention Center",
    keyCities: [
      { name: "New York", lat: 40.7128, lng: -74.006 },
      { name: "Los Angeles", lat: 34.0522, lng: -118.2437 },
      { name: "Chicago", lat: 41.8781, lng: -87.6298 },
      { name: "Houston", lat: 29.7604, lng: -95.3698 },
      { name: "Phoenix", lat: 33.4484, lng: -112.074 },
      { name: "Philadelphia", lat: 39.9526, lng: -75.1652 },
      { name: "San Antonio", lat: 29.4241, lng: -98.4936 },
      { name: "San Diego", lat: 32.7157, lng: -117.1611 },
      { name: "Dallas", lat: 32.7767, lng: -96.797 },
      { name: "San Jose", lat: 37.3382, lng: -121.8863 },
      { name: "Austin", lat: 30.2672, lng: -97.7431 },
      { name: "Jacksonville", lat: 30.3322, lng: -81.6557 },
      { name: "Fort Worth", lat: 32.7555, lng: -97.3308 },
      { name: "Columbus", lat: 39.9612, lng: -82.9988 },
      { name: "Indianapolis", lat: 39.7684, lng: -86.1581 },
      { name: "Charlotte", lat: 35.2271, lng: -80.8431 },
      { name: "San Francisco", lat: 37.7749, lng: -122.4194 },
      { name: "Seattle", lat: 47.6062, lng: -122.3321 },
      { name: "Denver", lat: 39.7392, lng: -104.9903 },
      { name: "Boston", lat: 42.3601, lng: -71.0589 }
    ],
    namePool: {
      firstNames: ["James", "John", "Robert", "Michael", "William", "David", "Richard", "Joseph", "Thomas", "Charles", "Daniel", "Matthew", "Anthony", "Donald", "Mark", "Paul", "Steven", "Andrew", "Kenneth", "Joshua", "George", "Kevin", "Brian", "Edward", "Ronald", "Timothy", "Jason", "Jeffrey", "Ryan", "Jacob", "Mary", "Patricia", "Jennifer", "Linda", "Elizabeth", "Barbara", "Susan", "Jessica", "Sarah", "Karen", "Nancy", "Margaret", "Lisa", "Betty", "Dorothy", "Sandra", "Ashley", "Kimberly", "Donna", "Emily"],
      lastNames: ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin", "Lee", "Perez", "Thompson", "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson", "Walker", "Young", "Allen", "King", "Wright", "Scott", "Torres", "Nguyen", "Hill", "Flores", "Green", "Adams", "Nelson", "Baker", "Hall", "Rivera", "Campbell", "Mitchell", "Carter", "Roberts"]
    }
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
    airportCoords: [51.47, -0.4543],
    conventionCenter: "ExCeL London",
    keyCities: [
      { name: "Birmingham", lat: 52.4862, lng: -1.8904 },
      { name: "Glasgow", lat: 55.8642, lng: -4.2518 },
      { name: "Manchester", lat: 53.4808, lng: -2.2426 },
      { name: "Liverpool", lat: 53.4084, lng: -2.9916 },
      { name: "Edinburgh", lat: 55.9533, lng: -3.1883 },
      { name: "Bristol", lat: 51.4545, lng: -2.5879 },
      { name: "Leeds", lat: 53.8008, lng: -1.5491 },
      { name: "Sheffield", lat: 53.3811, lng: -1.4701 },
      { name: "Newcastle", lat: 54.9783, lng: -1.6178 },
      { name: "Belfast", lat: 54.5973, lng: -5.9301 },
      { name: "Cardiff", lat: 51.4816, lng: -3.1791 },
      { name: "Coventry", lat: 52.4068, lng: -1.5197 },
      { name: "Nottingham", lat: 52.9548, lng: -1.1581 },
      { name: "Leicester", lat: 52.6369, lng: -1.1398 },
      { name: "Southampton", lat: 50.9097, lng: -1.4044 }
    ],
    namePool: {
      firstNames: ["Arthur", "George", "Oliver", "Harry", "Jack", "Jacob", "Noah", "Charlie", "Muhammad", "Thomas", "Oscar", "William", "James", "Henry", "Alfie", "Alexander", "Daniel", "Leo", "Logan", "Lucas", "Amelia", "Olivia", "Emily", "Isla", "Ava", "Ella", "Jessica", "Poppy", "Mia", "Sophie"],
      lastNames: ["Smith", "Jones", "Taylor", "Brown", "Williams", "Wilson", "Johnson", "Davies", "Robinson", "Wright", "Thompson", "Evans", "Walker", "White", "Roberts", "Green", "Hall", "Thomas", "Clarke", "Jackson", "Wood", "Harris", "Edwards", "Turner", "Martin"]
    }
  },
  {
    name: "France",
    iso2: "FR",
    capital: "Paris",
    lat: 48.8566,
    lng: 2.3522,
    parliament: "Palais Bourbon",
    parliamentCoords: [48.8619, 2.3186],
    residence: "Élysée Palace",
    residenceCoords: [48.8704, 2.3168],
    foreignMinistry: "Quai d'Orsay",
    airport: "Charles de Gaulle Airport",
    airportCoords: [49.0097, 2.5479],
    conventionCenter: "Palais des Congrès de Paris",
    keyCities: [
      { name: "Marseille", lat: 43.2965, lng: 5.3698 },
      { name: "Lyon", lat: 45.764, lng: 4.8357 },
      { name: "Toulouse", lat: 43.6047, lng: 1.4442 },
      { name: "Nice", lat: 43.7102, lng: 7.262 },
      { name: "Nantes", lat: 47.2184, lng: -1.5536 },
      { name: "Strasbourg", lat: 48.5734, lng: 7.7521 },
      { name: "Montpellier", lat: 43.6108, lng: 3.8767 },
      { name: "Bordeaux", lat: 44.8378, lng: -0.5792 },
      { name: "Lille", lat: 50.6292, lng: 3.0573 },
      { name: "Rennes", lat: 48.1173, lng: -1.6778 },
      { name: "Reims", lat: 49.2583, lng: 4.0317 },
      { name: "Toulon", lat: 43.1242, lng: 5.928 },
      { name: "Saint-Étienne", lat: 45.4397, lng: 4.3872 },
      { name: "Le Havre", lat: 49.4944, lng: 0.1079 },
      { name: "Grenoble", lat: 45.1885, lng: 5.7245 }
    ],
    namePool: {
      firstNames: ["Jean", "Pierre", "Michel", "André", "Philippe", "Louis", "Alain", "Jacques", "Bernard", "François", "Claude", "Christian", "Henri", "Robert", "René", "Marie", "Nathalie", "Isabelle", "Sylvie", "Catherine", "Françoise", "Martine", "Christine", "Monique", "Anne"],
      lastNames: ["Martin", "Bernard", "Thomas", "Petit", "Robert", "Richard", "Durand", "Dubois", "Moreau", "Laurent", "Simon", "Michel", "Lefebvre", "Leroy", "Roux", "David", "Bertrand", "Morel", "Fournier", "Girard", "Bonnet", "Dupont", "Lambert", "Fontaine", "Rousseau"]
    }
  },
  {
    name: "Germany",
    iso2: "DE",
    capital: "Berlin",
    lat: 52.52,
    lng: 13.405,
    parliament: "Reichstag Building",
    parliamentCoords: [52.5186, 13.3761],
    residence: "Bellevue Palace",
    residenceCoords: [52.5158, 13.3533],
    foreignMinistry: "Auswärtiges Amt (Federal Foreign Office)",
    airport: "Berlin Brandenburg Airport",
    airportCoords: [52.3667, 13.5033],
    conventionCenter: "Messe Berlin",
    keyCities: [
      { name: "Hamburg", lat: 53.5511, lng: 9.9937 },
      { name: "Munich", lat: 48.1351, lng: 11.582 },
      { name: "Cologne", lat: 50.9375, lng: 6.9603 },
      { name: "Frankfurt", lat: 50.1109, lng: 8.6821 },
      { name: "Stuttgart", lat: 48.7758, lng: 9.1829 },
      { name: "Düsseldorf", lat: 51.2277, lng: 6.7735 },
      { name: "Leipzig", lat: 51.3397, lng: 12.3731 },
      { name: "Dortmund", lat: 51.5136, lng: 7.4653 },
      { name: "Essen", lat: 51.4556, lng: 7.0116 },
      { name: "Bremen", lat: 53.0793, lng: 8.8017 },
      { name: "Dresden", lat: 51.0504, lng: 13.7373 },
      { name: "Hanover", lat: 52.3759, lng: 9.732 },
      { name: "Nuremberg", lat: 49.4521, lng: 11.0767 },
      { name: "Duisburg", lat: 51.4344, lng: 6.7623 },
      { name: "Bonn", lat: 50.7374, lng: 7.0982 }
    ],
    namePool: {
      firstNames: ["Hans", "Peter", "Wolfgang", "Klaus", "Michael", "Jürgen", "Dieter", "Günter", "Manfred", "Uwe", "Helmut", "Gerhard", "Werner", "Andreas", "Stefan", "Ursula", "Karin", "Helga", "Ingrid", "Monika", "Gisela", "Renate", "Birgit", "Petra", "Sabine"],
      lastNames: ["Müller", "Schmidt", "Schneider", "Fischer", "Weber", "Meyer", "Wagner", "Becker", "Schulz", "Hoffmann", "Schäfer", "Koch", "Bauer", "Richter", "Klein", "Wolf", "Schröder", "Neumann", "Schwarz", "Zimmermann", "Braun", "Krüger", "Hofmann", "Hartmann", "Lange"]
    }
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
    foreignMinistry: "Kasumigaseki Ministry of Foreign Affairs",
    airport: "Haneda Airport",
    airportCoords: [35.5494, 139.7798],
    conventionCenter: "Tokyo Big Sight",
    keyCities: [
      { name: "Yokohama", lat: 35.4437, lng: 139.638 },
      { name: "Osaka", lat: 34.6937, lng: 135.5023 },
      { name: "Nagoya", lat: 35.1815, lng: 136.9066 },
      { name: "Sapporo", lat: 43.0618, lng: 141.3545 },
      { name: "Fukuoka", lat: 33.5904, lng: 130.4017 },
      { name: "Kobe", lat: 34.6901, lng: 135.1955 },
      { name: "Kyoto", lat: 35.0116, lng: 135.7681 },
      { name: "Kawasaki", lat: 35.5308, lng: 139.7029 },
      { name: "Saitama", lat: 35.8617, lng: 139.6455 },
      { name: "Hiroshima", lat: 34.3853, lng: 132.4553 },
      { name: "Sendai", lat: 38.2682, lng: 140.8694 },
      { name: "Chiba", lat: 35.6074, lng: 140.1065 },
      { name: "Kitakyushu", lat: 33.8835, lng: 130.8752 },
      { name: "Sakai", lat: 34.5733, lng: 135.483 },
      { name: "Niigata", lat: 37.9161, lng: 139.0364 }
    ],
    namePool: {
      firstNames: ["Kenji", "Hiroshi", "Takashi", "Taro", "Ichiro", "Shinji", "Kazuo", "Daisuke", "Satoshi", "Makoto", "Akira", "Yuji", "Masahiro", "Koji", "Ryota", "Yoko", "Keiko", "Tomoko", "Junko", "Michiko", "Noriko", "Mayumi", "Etsuko", "Akemi", "Naoko"],
      lastNames: ["Sato", "Suzuki", "Takahashi", "Tanaka", "Watanabe", "Ito", "Yamamoto", "Nakamura", "Kobayashi", "Kato", "Yoshida", "Yamada", "Sasaki", "Yamaguchi", "Saito", "Matsumoto", "Inoue", "Kimura", "Hayashi", "Shimizu", "Yamazaki", "Mori", "Abe", "Ikeda", "Hashimoto"]
    }
  },
  {
    name: "Canada",
    iso2: "CA",
    capital: "Ottawa",
    lat: 45.4215,
    lng: -75.6972,
    parliament: "Parliament Hill",
    parliamentCoords: [45.4248, -75.6997],
    residence: "Rideau Hall",
    residenceCoords: [45.4441, -75.6853],
    foreignMinistry: "Lester B. Pearson Building (Global Affairs Canada)",
    airport: "Ottawa Macdonald-Cartier International Airport",
    airportCoords: [45.3225, -75.6692],
    conventionCenter: "Shaw Centre Ottawa",
    keyCities: [
      { name: "Toronto", lat: 43.6532, lng: -79.3832 },
      { name: "Montreal", lat: 45.5017, lng: -73.5673 },
      { name: "Vancouver", lat: 49.2827, lng: -123.1207 },
      { name: "Calgary", lat: 51.0447, lng: -114.0719 },
      { name: "Edmonton", lat: 53.5461, lng: -113.4938 },
      { name: "Quebec City", lat: 46.8139, lng: -71.208 },
      { name: "Winnipeg", lat: 49.8951, lng: -97.1384 },
      { name: "Hamilton", lat: 43.2557, lng: -79.8711 },
      { name: "Halifax", lat: 44.6488, lng: -63.5752 },
      { name: "Victoria", lat: 48.4284, lng: -123.3656 }
    ],
    namePool: {
      firstNames: ["Jean-Pierre", "Marc", "Claude", "David", "Robert", "Paul", "Michael", "James", "Luc", "Guy", "Daniel", "Thomas", "Richard", "Patrick", "Gilles", "Marie", "Chantal", "Suzanne", "Diane", "Monique", "Sarah", "Jennifer", "Karen", "Nicole", "Sophie"],
      lastNames: ["Tremblay", "Gagnon", "Roy", "Bouchard", "Gauthier", "Morin", "Lavoie", "Fortin", "Côté", "Smith", "Brown", "Wilson", "Johnson", "MacDonald", "Campbell", "Stewart", "Taylor", "Anderson", "Ross", "Clark"]
    }
  },
  {
    name: "Italy",
    iso2: "IT",
    capital: "Rome",
    lat: 41.9028,
    lng: 12.4964,
    parliament: "Palazzo Montecitorio",
    parliamentCoords: [41.9015, 12.4789],
    residence: "Quirinal Palace",
    residenceCoords: [41.9001, 12.4871],
    foreignMinistry: "Palazzo della Farnesina",
    airport: "Leonardo da Vinci–Fiumicino Airport",
    airportCoords: [41.8003, 12.2389],
    conventionCenter: "Rome Convention Center La Nuvola",
    keyCities: [
      { name: "Milan", lat: 45.4642, lng: 9.19 },
      { name: "Naples", lat: 40.8518, lng: 14.2681 },
      { name: "Turin", lat: 45.0703, lng: 7.6869 },
      { name: "Palermo", lat: 38.1157, lng: 13.3615 },
      { name: "Genoa", lat: 44.4056, lng: 8.9463 },
      { name: "Bologna", lat: 44.4949, lng: 11.3426 },
      { name: "Florence", lat: 43.7696, lng: 11.2558 },
      { name: "Bari", lat: 41.1171, lng: 16.8719 },
      { name: "Catania", lat: 37.5079, lng: 15.0873 },
      { name: "Venice", lat: 45.4408, lng: 12.3155 },
      { name: "Verona", lat: 45.4384, lng: 10.9916 },
      { name: "Messina", lat: 38.1938, lng: 15.554 },
      { name: "Padua", lat: 45.4064, lng: 11.8768 },
      { name: "Trieste", lat: 45.6495, lng: 13.7768 },
      { name: "Brescia", lat: 45.5416, lng: 10.2118 }
    ],
    namePool: {
      firstNames: ["Giuseppe", "Giovanni", "Antonio", "Mario", "Luigi", "Francesco", "Angelo", "Vincenzo", "Pietro", "Salvatore", "Carlo", "Franco", "Domenico", "Bruno", "Paolo", "Maria", "Anna", "Giuseppina", "Rosa", "Angela", "Giovanna", "Sofia", "Francesca", "Lucia", "Carmela"],
      lastNames: ["Rossi", "Russo", "Ferrari", "Esposito", "Bianchi", "Romano", "Colombo", "Ricci", "Marino", "Greco", "Bruno", "Gallo", "Conti", "De Luca", "Mancini", "Costa", "Giordano", "Rizzo", "Lombardi", "Moretti"]
    }
  },
  {
    name: "Spain",
    iso2: "ES",
    capital: "Madrid",
    lat: 40.4168,
    lng: -3.7038,
    parliament: "Palacio de las Cortes",
    parliamentCoords: [40.4162, -3.6968],
    residence: "Palacio de la Zarzuela",
    residenceCoords: [40.4839, -3.8011],
    foreignMinistry: "Palacio de Santa Cruz (Ministry of Foreign Affairs)",
    airport: "Adolfo Suárez Madrid–Barajas Airport",
    airportCoords: [40.4983, -3.5676],
    conventionCenter: "IFEMA Madrid",
    keyCities: [
      { name: "Barcelona", lat: 41.3851, lng: 2.1734 },
      { name: "Valencia", lat: 39.4699, lng: -0.3763 },
      { name: "Seville", lat: 37.3891, lng: -5.9845 },
      { name: "Zaragoza", lat: 41.6488, lng: -0.8891 },
      { name: "Málaga", lat: 36.7213, lng: -4.4214 },
      { name: "Murcia", lat: 37.9922, lng: -1.1307 },
      { name: "Palma", lat: 39.5696, lng: 2.6502 },
      { name: "Las Palmas", lat: 28.1248, lng: -15.43 },
      { name: "Bilbao", lat: 43.263, lng: -2.935 },
      { name: "Alicante", lat: 38.3452, lng: -0.481 },
      { name: "Córdoba", lat: 37.8882, lng: -4.7794 },
      { name: "Valladolid", lat: 41.6523, lng: -4.7245 },
      { name: "Vigo", lat: 42.2406, lng: -8.7207 },
      { name: "Gijón", lat: 43.5357, lng: -5.6615 },
      { name: "Granada", lat: 37.1773, lng: -3.5986 }
    ],
    namePool: {
      firstNames: ["Antonio", "Manuel", "José", "Francisco", "David", "Juan", "Javier", "Daniel", "Carlos", "Jesús", "Alejandro", "Miguel", "Rafael", "Pedro", "Ángel", "María", "Carmen", "Ana", "Isabel", "Dolores", "Pilar", "Teresa", "Rosa", "Cristina", "Ángeles"],
      lastNames: ["García", "Rodríguez", "González", "Fernández", "López", "Martínez", "Sánchez", "Pérez", "Gómez", "Martín", "Jiménez", "Ruiz", "Hernández", "Díaz", "Moreno", "Álvarez", "Muñoz", "Romero", "Alonso", "Gutiérrez"]
    }
  },
  {
    name: "Australia",
    iso2: "AU",
    capital: "Canberra",
    lat: -35.2809,
    lng: 149.13,
    parliament: "Parliament House Canberra",
    parliamentCoords: [-35.3082, 149.1244],
    residence: "The Lodge",
    residenceCoords: [-35.3094, 149.1158],
    foreignMinistry: "R.G. Casey Building (Department of Foreign Affairs and Trade)",
    airport: "Canberra Airport",
    airportCoords: [-35.3069, 149.195],
    conventionCenter: "National Convention Centre Canberra",
    keyCities: [
      { name: "Sydney", lat: -33.8688, lng: 151.2093 },
      { name: "Melbourne", lat: -37.8136, lng: 144.9631 },
      { name: "Brisbane", lat: -27.4698, lng: 153.0251 },
      { name: "Perth", lat: -31.9505, lng: 115.8605 },
      { name: "Adelaide", lat: -34.9285, lng: 138.6007 },
      { name: "Gold Coast", lat: -28.0167, lng: 153.4 },
      { name: "Newcastle", lat: -32.9283, lng: 151.7817 },
      { name: "Hobart", lat: -42.8821, lng: 147.3272 },
      { name: "Darwin", lat: -12.4634, lng: 130.8456 },
      { name: "Wollongong", lat: -34.4278, lng: 150.8931 }
    ],
    namePool: {
      firstNames: ["Oliver", "William", "Jack", "Noah", "Thomas", "James", "Lucas", "Alexander", "Ethan", "Max", "Charlotte", "Olivia", "Amelia", "Isla", "Mia", "Ava", "Grace", "Chloe", "Willow", "Harper"],
      lastNames: ["Smith", "Jones", "Williams", "Brown", "Wilson", "Taylor", "Johnson", "White", "Martin", "Anderson", "Thompson", "Nguyen", "Thomas", "Walker", "Harris", "Lee", "Ryan", "Robinson", "Kelly", "King"]
    }
  },
  {
    name: "Brazil",
    iso2: "BR",
    capital: "Brasília",
    lat: -15.7975,
    lng: -47.8919,
    parliament: "National Congress of Brazil",
    parliamentCoords: [-15.7997, -47.8641],
    residence: "Palácio da Alvorada",
    residenceCoords: [-15.7925, -47.8222],
    foreignMinistry: "Itamaraty Palace (Ministry of Foreign Affairs)",
    airport: "Brasília International Airport",
    airportCoords: [-15.8711, -47.9186],
    conventionCenter: "Centro de Convenções Ulysses Guimarães",
    keyCities: [
      { name: "São Paulo", lat: -23.5505, lng: -46.6333 },
      { name: "Rio de Janeiro", lat: -22.9068, lng: -43.1729 },
      { name: "Salvador", lat: -12.9777, lng: -38.5016 },
      { name: "Fortaleza", lat: -3.7172, lng: -38.5433 },
      { name: "Belo Horizonte", lat: -19.9167, lng: -43.9345 },
      { name: "Manaus", lat: -3.119, lng: -60.0217 },
      { name: "Curitiba", lat: -25.4284, lng: -49.2733 },
      { name: "Recife", lat: -8.0476, lng: -34.877 },
      { name: "Porto Alegre", lat: -30.0346, lng: -51.2177 },
      { name: "Belém", lat: -1.4558, lng: -48.4902 },
      { name: "Goiânia", lat: -16.6869, lng: -49.2648 },
      { name: "Guarulhos", lat: -23.4542, lng: -46.5337 },
      { name: "Campinas", lat: -22.9099, lng: -47.0626 },
      { name: "São Luís", lat: -2.5307, lng: -44.3068 },
      { name: "Maceió", lat: -9.6658, lng: -35.735 }
    ],
    namePool: {
      firstNames: ["José", "João", "Antônio", "Francisco", "Carlos", "Paulo", "Pedro", "Lucas", "Luiz", "Marcos", "Maria", "Ana", "Francisca", "Antônia", "Adriana", "Juliana", "Márcia", "Fernanda", "Patricia", "Aline"],
      lastNames: ["Silva", "Santos", "Oliveira", "Souza", "Rodrigues", "Ferreira", "Alves", "Pereira", "Lima", "Gomes", "Costa", "Ribeiro", "Martins", "Carvalho", "Almeida", "Lopes", "Soares", "Fernandes", "Vieira", "Barbosa"]
    }
  },
  {
    name: "India",
    iso2: "IN",
    capital: "New Delhi",
    lat: 28.6139,
    lng: 77.209,
    parliament: "Parliament House of India (Sansad Bhavan)",
    parliamentCoords: [28.6172, 77.2081],
    residence: "Rashtrapati Bhavan",
    residenceCoords: [28.6143, 77.1995],
    foreignMinistry: "South Block (Ministry of External Affairs)",
    airport: "Indira Gandhi International Airport",
    airportCoords: [28.5562, 77.1],
    conventionCenter: "Bharat Mandapam (IECC)",
    keyCities: [
      { name: "Mumbai", lat: 19.076, lng: 72.8777 },
      { name: "Kolkata", lat: 22.5726, lng: 88.3639 },
      { name: "Bengaluru", lat: 12.9716, lng: 77.5946 },
      { name: "Chennai", lat: 13.0827, lng: 80.2707 },
      { name: "Hyderabad", lat: 17.385, lng: 78.4867 },
      { name: "Ahmedabad", lat: 23.0225, lng: 72.5714 },
      { name: "Pune", lat: 18.5204, lng: 73.8567 },
      { name: "Surat", lat: 21.1702, lng: 72.8311 },
      { name: "Jaipur", lat: 26.9124, lng: 75.7873 },
      { name: "Lucknow", lat: 26.8467, lng: 80.9462 },
      { name: "Kanpur", lat: 26.4499, lng: 80.3319 },
      { name: "Nagpur", lat: 21.1458, lng: 79.0882 },
      { name: "Indore", lat: 22.7196, lng: 75.8577 },
      { name: "Thane", lat: 19.2183, lng: 72.9781 },
      { name: "Bhopal", lat: 23.2599, lng: 77.4126 }
    ],
    namePool: {
      firstNames: ["Aarav", "Vihaan", "Aditya", "Sai", "Arjun", "Reyansh", "Muhammad", "Ayaan", "Krishna", "Ishaan", "Aadhya", "Saanvi", "Ananya", "Diya", "Fatima", "Pari", "Anika", "Navya", "Angel", "Myra"],
      lastNames: ["Sharma", "Verma", "Gupta", "Singh", "Kumar", "Patel", "Shah", "Reddy", "Mehta", "Chopra", "Joshi", "Bhatia", "Nair", "Iyer", "Rao", "Mishra", "Pandey", "Yadav", "Trivedi", "Banerjee"]
    }
  },
  {
    name: "South Korea",
    iso2: "KR",
    capital: "Seoul",
    lat: 37.5665,
    lng: 126.978,
    parliament: "National Assembly of the Republic of Korea",
    parliamentCoords: [37.5318, 126.9142],
    residence: "Presidential Office Building (Yongsan)",
    residenceCoords: [37.5342, 126.9753],
    foreignMinistry: "Ministry of Foreign Affairs Building (Doryeom-dong)",
    airport: "Incheon International Airport",
    airportCoords: [37.4602, 126.4407],
    conventionCenter: "COEX Convention & Exhibition Center",
    keyCities: [
      { name: "Busan", lat: 35.1796, lng: 129.0756 },
      { name: "Incheon", lat: 37.4563, lng: 126.7052 },
      { name: "Daegu", lat: 35.8714, lng: 128.6014 },
      { name: "Daejeon", lat: 36.3504, lng: 127.3845 },
      { name: "Gwangju", lat: 35.1595, lng: 126.8526 },
      { name: "Suwon", lat: 37.2636, lng: 127.0286 },
      { name: "Ulsan", lat: 35.5384, lng: 129.3114 },
      { name: "Changwon", lat: 35.2281, lng: 128.6811 },
      { name: "Goyang", lat: 37.6584, lng: 126.832 },
      { name: "Yongin", lat: 37.2411, lng: 127.1776 }
    ],
    namePool: {
      firstNames: ["Min-jun", "Seo-jun", "Ye-jun", "Do-yun", "Shi-woo", "Ju-won", "Ha-jun", "Ji-ho", "Ji-hu", "Jun-seo", "Seo-yeon", "Seo-yun", "Ji-woo", "Seo-hyeon", "Min-seo", "Ha-eun", "Ha-yun", "Yun-seo", "Ji-min", "Chae-won"],
      lastNames: ["Kim", "Lee", "Park", "Choi", "Jung", "Kang", "Cho", "Yoon", "Jang", "Lim", "Han", "Oh", "Seo", "Shin", "Kwon", "Hwang", "Ahn", "Song", "Ryu", "Hong"]
    }
  },
  {
    name: "Switzerland",
    iso2: "CH",
    capital: "Bern",
    lat: 46.948,
    lng: 7.4474,
    parliament: "Federal Palace of Switzerland (Bundeshaus)",
    parliamentCoords: [46.9465, 7.4442],
    residence: "Lohn Estate (Federal Council Official Residence)",
    residenceCoords: [46.9248, 7.4664],
    foreignMinistry: "Federal Department of Foreign Affairs (FDFA)",
    airport: "Zurich Airport",
    airportCoords: [47.4582, 8.5555],
    conventionCenter: "Bern Expo / Geneva Palexpo",
    keyCities: [
      { name: "Zurich", lat: 47.3769, lng: 8.5417 },
      { name: "Geneva", lat: 46.2044, lng: 6.1432 },
      { name: "Basel", lat: 47.5596, lng: 7.5886 },
      { name: "Lausanne", lat: 46.5197, lng: 6.6323 },
      { name: "Lucerne", lat: 47.0502, lng: 8.3093 },
      { name: "St. Gallen", lat: 47.4245, lng: 9.3767 },
      { name: "Lugano", lat: 46.0037, lng: 8.9511 },
      { name: "Biel/Bienne", lat: 47.1371, lng: 7.2468 },
      { name: "Thun", lat: 46.7579, lng: 7.6279 },
      { name: "Bellinzona", lat: 46.1928, lng: 9.017 }
    ],
    namePool: {
      firstNames: ["Peter", "Daniel", "Hans", "Thomas", "Stefan", "Christian", "Martin", "Andreas", "Michael", "Markus", "Maria", "Anna", "Ursula", "Ruth", "Elisabeth", "Sandra", "Barbara", "Verena", "Karin", "Monika"],
      lastNames: ["Müller", "Meier", "Schmid", "Keller", "Weber", "Huber", "Schneider", "Meyer", "Steiner", "Fischer", "Gerber", "Brunner", "Baumann", "Frei", "Zimmermann", "Moser", "Widmer", "Wyss", "Graf", "Roth"]
    }
  },
  {
    name: "Netherlands",
    iso2: "NL",
    capital: "Amsterdam",
    lat: 52.3676,
    lng: 4.9041,
    parliament: "Binnenhof (The Hague)",
    parliamentCoords: [52.0797, 4.313],
    residence: "Huis ten Bosch Palace (The Hague)",
    residenceCoords: [52.0933, 4.3436],
    foreignMinistry: "Ministry of Foreign Affairs (Rijnstraat 8, The Hague)",
    airport: "Amsterdam Airport Schiphol",
    airportCoords: [52.3105, 4.7683],
    conventionCenter: "RAI Amsterdam / World Forum The Hague",
    keyCities: [
      { name: "The Hague", lat: 52.0705, lng: 4.3007 },
      { name: "Rotterdam", lat: 51.9244, lng: 4.4777 },
      { name: "Utrecht", lat: 52.0907, lng: 5.1214 },
      { name: "Eindhoven", lat: 51.4416, lng: 5.4697 },
      { name: "Groningen", lat: 53.2194, lng: 6.5665 },
      { name: "Tilburg", lat: 51.5555, lng: 5.0913 },
      { name: "Almere", lat: 52.3508, lng: 5.2647 },
      { name: "Breda", lat: 51.5719, lng: 4.7683 },
      { name: "Nijmegen", lat: 51.8126, lng: 5.8372 },
      { name: "Maastricht", lat: 50.8514, lng: 5.691 }
    ],
    namePool: {
      firstNames: ["Jan", "Johannes", "Cornelis", "Hendrik", "Willem", "Pieter", "Gerrit", "Jacobus", "Gerardus", "Petrus", "Maria", "Johanna", "Anna", "Cornelia", "Wilhelmina", "Catharina", "Elisabeth", "Hendrika", "Jacoba", "Geertruida"],
      lastNames: ["De Jong", "Jansen", "De Vries", "Van de Berg", "Van Dijk", "Bakker", "Janssen", "Visser", "Smit", "Meijer", "De Boer", "Mulder", "De Groot", "Bos", "Vos", "Peters", "Hendriks", "Van Leeuwen", "Dekker", "Brouwer"]
    }
  },
  {
    name: "Israel",
    iso2: "IL",
    capital: "Jerusalem",
    lat: 31.7683,
    lng: 35.2137,
    parliament: "The Knesset",
    parliamentCoords: [31.7766, 35.2053],
    residence: "Beit HaNassi (President's Residence)",
    residenceCoords: [31.7702, 35.215],
    foreignMinistry: "Ministry of Foreign Affairs Complex (Kiryat Ben Gurion)",
    airport: "Ben Gurion International Airport",
    airportCoords: [32.0055, 34.8854],
    conventionCenter: "International Convention Center Jerusalem (Binyanei HaUma)",
    keyCities: [
      { name: "Tel Aviv-Yafo", lat: 32.0853, lng: 34.7818 },
      { name: "Haifa", lat: 32.794, lng: 34.9896 },
      { name: "Rishon LeZion", lat: 31.973, lng: 34.7925 },
      { name: "Petah Tikva", lat: 32.084, lng: 34.8878 },
      { name: "Ashdod", lat: 31.8044, lng: 34.6553 },
      { name: "Netanya", lat: 32.3215, lng: 34.8532 },
      { name: "Beer Sheva", lat: 31.2529, lng: 34.7915 },
      { name: "Bnei Brak", lat: 32.0849, lng: 34.8352 },
      { name: "Holon", lat: 32.0158, lng: 34.7874 },
      { name: "Herzliya", lat: 32.1663, lng: 34.8433 }
    ],
    namePool: {
      firstNames: ["Yosef", "David", "Daniel", "Uri", "Ariel", "Eitan", "Noam", "Itamar", "Moshe", "Avraham", "Tamar", "Maya", "Noa", "Shira", "Yael", "Talia", "Romi", "Sarah", "Hila", "Michal"],
      lastNames: ["Cohen", "Levi", "Mizrachi", "Peretz", "Biton", "Dahan", "Avraham", "Friedman", "Malka", "Azulay", "Katz", "Yosef", "David", "Omer", "Hadad", "Harari", "Shapiro", "Ben-David", "Klein", "Goldstein"]
    }
  },
  {
    name: "Sweden",
    iso2: "SE",
    capital: "Stockholm",
    lat: 59.3293,
    lng: 18.0686,
    parliament: "Riksdag Building (Helgeandsholmen)",
    parliamentCoords: [59.3275, 18.0675],
    residence: "Sager House (Prime Minister's Official Residence)",
    residenceCoords: [59.3294, 18.0658],
    foreignMinistry: "Arvfurstens Palats (Ministry for Foreign Affairs)",
    airport: "Stockholm Arlanda Airport",
    airportCoords: [59.6498, 17.9238],
    conventionCenter: "Stockholmsmässan",
    keyCities: [
      { name: "Gothenburg", lat: 57.7089, lng: 11.9746 },
      { name: "Malmö", lat: 55.605, lng: 13.0038 },
      { name: "Uppsala", lat: 59.8586, lng: 17.6389 },
      { name: "Västerås", lat: 59.6099, lng: 16.5448 },
      { name: "Örebro", lat: 59.2753, lng: 15.2134 },
      { name: "Linköping", lat: 58.4108, lng: 15.6214 },
      { name: "Helsingborg", lat: 56.0465, lng: 12.6945 },
      { name: "Jönköping", lat: 57.7826, lng: 14.1618 },
      { name: "Norrköping", lat: 58.5877, lng: 16.1924 },
      { name: "Lund", lat: 55.7047, lng: 13.191 }
    ],
    namePool: {
      firstNames: ["Lars", "Mikael", "Anders", "Johan", "Erik", "Per", "Karl", "Peter", "Jan", "Fredrik", "Maria", "Elisabeth", "Anna", "Kristina", "Margareta", "Eva", "Karin", "Birgitta", "Ingrid", "Marianne"],
      lastNames: ["Andersson", "Johansson", "Karlsson", "Nilsson", "Eriksson", "Larsson", "Olsson", "Persson", "Svensson", "Gustafsson", "Pettersson", "Jonsson", "Jansson", "Hansson", "Bengtsson", "Jönsson", "Lindberg", "Jakobsson", "Magnusson", "Olofsson"]
    }
  },
  {
    name: "Norway",
    iso2: "NO",
    capital: "Oslo",
    lat: 59.9139,
    lng: 10.7522,
    parliament: "Storting Building",
    parliamentCoords: [59.9132, 10.7397],
    residence: "The Royal Palace Oslo / Inkognitogata 18",
    residenceCoords: [59.9169, 10.7275],
    foreignMinistry: "Ministry of Foreign Affairs (Victoria Terrasse)",
    airport: "Oslo Airport Gardermoen",
    airportCoords: [60.1975, 11.1004],
    conventionCenter: "Oslo Spektrum / Norges Varemesse",
    keyCities: [
      { name: "Bergen", lat: 60.3913, lng: 5.3221 },
      { name: "Trondheim", lat: 63.4305, lng: 10.3951 },
      { name: "Stavanger", lat: 58.9699, lng: 5.7331 },
      { name: "Bærum", lat: 59.8939, lng: 10.5253 },
      { name: "Kristiansand", lat: 58.1599, lng: 8.0182 },
      { name: "Drammen", lat: 59.7441, lng: 10.2045 },
      { name: "Asker", lat: 59.8333, lng: 10.4333 },
      { name: "Lillestrøm", lat: 59.956, lng: 11.0492 },
      { name: "Fredrikstad", lat: 59.2205, lng: 10.9347 },
      { name: "Tromsø", lat: 69.6492, lng: 18.9553 }
    ],
    namePool: {
      firstNames: ["Jan", "Per", "Bjørn", "Ole", "Lars", "Kjell", "Knut", "Svein", "Thomas", "Geir", "Anne", "Inger", "Kari", "Marit", "Ingrid", "Liv", "Eva", "Berit", "Astrid", "Elin"],
      lastNames: ["Hansen", "Johansen", "Olsen", "Larsen", "Andersen", "Pedersen", "Nilsen", "Kristiansen", "Jensen", "Karlsen", "Johnsen", "Pettersen", "Eriksen", "Berg", "Haugen", "Hagen", "Johannessen", "Andreassen", "Jacobsen", "Dahl"]
    }
  },
  {
    name: "Poland",
    iso2: "PL",
    capital: "Warsaw",
    lat: 52.2297,
    lng: 21.0122,
    parliament: "Sejm and Senate Complex",
    parliamentCoords: [52.2255, 21.0289],
    residence: "Presidential Palace Warsaw",
    residenceCoords: [52.2427, 21.0163],
    foreignMinistry: "Ministry of Foreign Affairs (Szucha Avenue)",
    airport: "Warsaw Chopin Airport",
    airportCoords: [52.1672, 20.9679],
    conventionCenter: "PGE Narodowy / EXPO XXI Warsaw",
    keyCities: [
      { name: "Kraków", lat: 50.0647, lng: 19.945 },
      { name: "Łódź", lat: 51.7592, lng: 19.456 },
      { name: "Wrocław", lat: 51.1079, lng: 17.0385 },
      { name: "Poznań", lat: 52.4064, lng: 16.9252 },
      { name: "Gdańsk", lat: 54.352, lng: 18.6466 },
      { name: "Szczecin", lat: 53.4285, lng: 14.5528 },
      { name: "Bydgoszcz", lat: 53.1235, lng: 18.0084 },
      { name: "Lublin", lat: 51.2465, lng: 22.5684 },
      { name: "Białystok", lat: 53.1325, lng: 23.1688 },
      { name: "Katowice", lat: 50.2649, lng: 19.0238 }
    ],
    namePool: {
      firstNames: ["Jan", "Stanisław", "Andrzej", "Józef", "Tadeusz", "Jerzy", "Zbigniew", "Krzysztof", "Henryk", "Ryszard", "Maria", "Krystyna", "Anna", "Barbara", "Teresa", "Elżbieta", "Janina", "Zofia", "Jadwiga", "Danuta"],
      lastNames: ["Nowak", "Kowalski", "Wiśniewski", "Wójcik", "Kowalczyk", "Kamiński", "Lewandowski", "Zieliński", "Szymański", "Woźniak", "Dąbrowski", "Kozłowski", "Jankowski", "Mazur", "Wojciechowski", "Kwiatkowski", "Krawczyk", "Kaczmarek", "Piotrowski", "Grabowski"]
    }
  },
  {
    name: "Mexico",
    iso2: "MX",
    capital: "Mexico City",
    lat: 19.4326,
    lng: -99.1332,
    parliament: "San Lázaro Legislative Palace",
    parliamentCoords: [19.4288, -99.1174],
    residence: "National Palace (Palacio Nacional)",
    residenceCoords: [19.4328, -99.1313],
    foreignMinistry: "Secretariat of Foreign Affairs (Plaza Juárez)",
    airport: "Mexico City International Airport (Benito Juárez)",
    airportCoords: [19.4361, -99.0719],
    conventionCenter: "Centro Citibanamex",
    keyCities: [
      { name: "Tijuana", lat: 32.5149, lng: -117.0382 },
      { name: "Ecatepec", lat: 19.6097, lng: -99.06 },
      { name: "León", lat: 21.1221, lng: -101.6826 },
      { name: "Puebla", lat: 19.0414, lng: -98.2063 },
      { name: "Ciudad Juárez", lat: 31.6904, lng: -106.4245 },
      { name: "Guadalajara", lat: 20.6597, lng: -103.3496 },
      { name: "Zapopan", lat: 20.7166, lng: -103.4166 },
      { name: "Monterrey", lat: 25.6866, lng: -100.3161 },
      { name: "Chihuahua", lat: 28.6353, lng: -106.0889 },
      { name: "Mérida", lat: 20.9674, lng: -89.5926 }
    ],
    namePool: {
      firstNames: ["Juan", "José", "Francisco", "Antonio", "Jesús", "Pedro", "Alejandro", "Manuel", "Margarito", "Jorge", "María", "Guadalupe", "Juana", "Margarita", "Josefina", "Verónica", "Rosa", "Leticia", "Elena", "Patricia"],
      lastNames: ["Hernández", "García", "Martínez", "López", "González", "Pérez", "Rodríguez", "Sánchez", "Ramírez", "Cruz", "Flores", "Gómez", "Morales", "Vázquez", "Reyes", "Jiménez", "Torres", "Díaz", "Gutiérrez", "Ruiz"]
    }
  },
  {
    name: "Egypt",
    iso2: "EG",
    capital: "Cairo",
    lat: 30.0444,
    lng: 31.2357,
    parliament: "House of Representatives Building Cairo",
    parliamentCoords: [30.0411, 31.2366],
    residence: "Heliopolis Palace (Al-Ittihadiya)",
    residenceCoords: [30.0934, 31.3204],
    foreignMinistry: "Ministry of Foreign Affairs Tower (Maspero Corniche)",
    airport: "Cairo International Airport",
    airportCoords: [30.1219, 31.4056],
    conventionCenter: "Egypt International Exhibition Center (EIEC)",
    keyCities: [
      { name: "Alexandria", lat: 31.2001, lng: 29.9187 },
      { name: "Giza", lat: 30.0131, lng: 31.2089 },
      { name: "Shubra El Kheima", lat: 30.1286, lng: 31.2422 },
      { name: "Port Said", lat: 31.2653, lng: 32.3019 },
      { name: "Suez", lat: 29.9668, lng: 32.5498 },
      { name: "Luxor", lat: 25.6872, lng: 32.6396 },
      { name: "Mansoura", lat: 31.0409, lng: 31.3785 },
      { name: "Tanta", lat: 30.7865, lng: 31.0004 },
      { name: "Asyut", lat: 27.1783, lng: 31.1859 },
      { name: "Ismailia", lat: 30.5965, lng: 32.2715 }
    ],
    namePool: {
      firstNames: ["Mohamed", "Ahmed", "Mahmoud", "Mostafa", "Ali", "Hassan", "Hussein", "Ibrahim", "Tarek", "Amr", "Fatma", "Maryam", "Amina", "Nour", "Sara", "Mona", "Hoda", "Salma", "Dina", "Rania"],
      lastNames: ["Mohamed", "Ali", "Hassan", "Ibrahim", "Mahmoud", "Ahmed", "Hussein", "Sayed", "Khalil", "Mansour", "Abdel-Rahman", "El-Sayed", "Soliman", "Nasser", "Fahmy", "Kamel", "Badawi", "Osman", "Salem", "Taha"]
    }
  }
];
