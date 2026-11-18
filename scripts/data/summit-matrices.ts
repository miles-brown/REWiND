export interface SummitDef {
  id: string;
  series: string;
  title: string;
  startDate: string;
  endDate?: string;
  city: string;
  country: string;
  venue: string;
  lat: number;
  lng: number;
  summary: string;
  description: string;
  participantIds: string[];
  sources: Array<{
    id: string;
    title: string;
    publisher: string;
    url: string;
    date: string;
  }>;
}

export const SUMMITS_AND_TREATIES_DATA: SummitDef[] = [
  // Historic G7 / G8 Summits
  {
    id: "evt-g7-1975-rambouillet",
    series: "G7 Summit",
    title: "1st G6 Summit at Château de Rambouillet",
    startDate: "1975-11-15",
    endDate: "1975-11-17",
    city: "Rambouillet",
    country: "France",
    venue: "Château de Rambouillet",
    lat: 48.6441,
    lng: 1.8178,
    summary: "Inaugural summit of the Group of Six industrialized democracies convened by French President Valéry Giscard d'Estaing and West German Chancellor Helmut Schmidt to address the 1973 oil crisis and international monetary reform.",
    description: "The six participating leaders agreed on the 15-point Declaration of Rambouillet, establishing the annual summit mechanism for multilateral economic and geopolitical coordination.",
    participantIds: ["gerald-ford", "helmut-schmidt"],
    sources: [
      {
        id: "src-g7-1975-declaration",
        title: "Declaration of Rambouillet — Official Communiqué of the First Economic Summit",
        publisher: "University of Toronto G7 Research Group / French Ministry of Foreign Affairs",
        url: "http://www.g7.utoronto.ca/summit/1975rambouillet/communique.html",
        date: "1975-11-17"
      }
    ]
  },
  {
    id: "evt-g7-1978-bonn",
    series: "G7 Summit",
    title: "4th G7 Summit in Bonn",
    startDate: "1978-07-16",
    endDate: "1978-07-17",
    city: "Bonn",
    country: "Germany",
    venue: "Federal Chancellery (Palais Schaumburg / Bonn)",
    lat: 50.7206,
    lng: 7.1172,
    summary: "Fourth G7 economic summit hosted by West German Chancellor Helmut Schmidt with US President Jimmy Carter, adopting comprehensive commitments against international air hijacking and economic stagflation.",
    description: "The summit resulted in the Bonn Declaration on International Terrorism, introducing collective international sanctions against nations harboring aircraft hijackers.",
    participantIds: ["jimmy-carter", "helmut-schmidt"],
    sources: [
      {
        id: "src-g7-1978-declaration",
        title: "Bonn Economic Summit — Declaration of the Heads of State and Government",
        publisher: "G7 Research Group / Federal Government of Germany",
        url: "http://www.g7.utoronto.ca/summit/1978bonn/communique.html",
        date: "1978-07-17"
      }
    ]
  },
  {
    id: "evt-g7-1981-ottawa",
    series: "G7 Summit",
    title: "7th G7 Summit at Château Montebello",
    startDate: "1981-07-20",
    endDate: "1981-07-21",
    city: "Montebello",
    country: "Canada",
    venue: "Château Montebello",
    lat: 45.6514,
    lng: -74.9458,
    summary: "First G7 summit attended by US President Ronald Reagan and French President François Mitterrand, hosted by Canadian Prime Minister Pierre Trudeau, addressing East-West trade, energy transition, and North-South dialogue.",
    description: "Marked the debut of Reagan, Mitterrand, and Margaret Thatcher together, establishing the conservative and democratic socialist consensus on international security during the second Cold War.",
    participantIds: ["ronald-reagan", "margaret-thatcher", "francois-mitterrand", "helmut-schmidt"],
    sources: [
      {
        id: "src-g7-1981-declaration",
        title: "Declaration of the Ottawa Summit (Château Montebello)",
        publisher: "G7 Information Centre",
        url: "http://www.g7.utoronto.ca/summit/1981ottawa/communique.html",
        date: "1981-07-21"
      }
    ]
  },
  {
    id: "evt-g7-1984-london",
    series: "G7 Summit",
    title: "10th G7 Summit in London",
    startDate: "1984-06-07",
    endDate: "1984-06-09",
    city: "London",
    country: "United Kingdom",
    venue: "Lancaster House",
    lat: 51.5039,
    lng: -0.1389,
    summary: "10th G7 Summit hosted by British Prime Minister Margaret Thatcher at Lancaster House, issuing the Declaration on Democratic Values and reviewing the Iran-Iraq War and Persian Gulf shipping security.",
    description: "Adopted statements on democratic resilience, international debt restructuring, and Freedom of Navigation in the Persian Gulf.",
    participantIds: ["ronald-reagan", "margaret-thatcher", "francois-mitterrand", "helmut-kohl"],
    sources: [
      {
        id: "src-g7-1984-declaration",
        title: "London Summit Declaration on Democratic Values and East-West Relations",
        publisher: "UK Foreign & Commonwealth Office / G7 Research Group",
        url: "http://www.g7.utoronto.ca/summit/1984london/communique.html",
        date: "1984-06-09"
      }
    ]
  },
  {
    id: "evt-g7-1989-paris",
    series: "G7 Summit",
    title: "15th G7 Summit at Arche de la Défense (Summit of the Arch)",
    startDate: "1989-07-14",
    endDate: "1989-07-16",
    city: "Paris",
    country: "France",
    venue: "Grande Arche de la Défense",
    lat: 48.8925,
    lng: 2.2361,
    summary: "Historic 'Summit of the Arch' hosted by French President François Mitterrand on the bicentennial of the French Revolution, creating the Financial Action Task Force (FATF) and addressing environmental conservation.",
    description: "Participating leaders endorsed support for political and economic reforms in Poland and Hungary, anticipating the collapse of the Iron Curtain months later.",
    participantIds: ["george-h-w-bush", "margaret-thatcher", "francois-mitterrand", "helmut-kohl"],
    sources: [
      {
        id: "src-g7-1989-declaration",
        title: "Economic Declaration of the Paris Summit of the Arch",
        publisher: "French Presidency / G7 Research Group",
        url: "http://www.g7.utoronto.ca/summit/1989paris/communique.html",
        date: "1989-07-16"
      }
    ]
  },
  {
    id: "evt-g7-1991-london",
    series: "G7 Summit",
    title: "17th G7 Summit at Lancaster House with Soviet President Gorbachev",
    startDate: "1991-07-15",
    endDate: "1991-07-17",
    city: "London",
    country: "United Kingdom",
    venue: "Lancaster House",
    lat: 51.5039,
    lng: -0.1389,
    summary: "17th G7 Summit chaired by British Prime Minister John Major, marked by the historic post-summit guest appearance of Soviet President Mikhail Gorbachev seeking Western integration.",
    description: "World leaders established the UN Conventional Arms Register and outlined economic assistance criteria for the transitioning Soviet Union weeks before the August coup.",
    participantIds: ["george-h-w-bush", "john-major", "francois-mitterrand", "helmut-kohl"],
    sources: [
      {
        id: "src-g7-1991-communique",
        title: "London Summit Communiqué: Strengthening the International Order",
        publisher: "UK Cabinet Office / G7 Research Group",
        url: "http://www.g7.utoronto.ca/summit/1991london/communique.html",
        date: "1991-07-17"
      }
    ]
  },
  {
    id: "evt-g7-1995-halifax",
    series: "G7 Summit",
    title: "21st G7 Summit in Halifax",
    startDate: "1995-06-15",
    endDate: "1995-06-17",
    city: "Halifax",
    country: "Canada",
    venue: "Summit Place (Halifax)",
    lat: 44.6488,
    lng: -63.5752,
    summary: "21st G7 Summit focusing on the reform of international financial institutions (IMF and World Bank) and the escalating Bosnian War.",
    description: "Leaders adopted the Halifax Communiqué calling for early-warning financial surveillance mechanisms following the 1994 Mexican Peso Crisis and demanding immediate cessation of hostilities in Bosnia.",
    participantIds: ["p-clinton", "john-major", "jacques-chirac", "helmut-kohl"],
    sources: [
      {
        id: "src-g7-1995-communique",
        title: "Halifax Summit Communiqué on International Financial Architecture",
        publisher: "Government of Canada / G7 Information Centre",
        url: "http://www.g7.utoronto.ca/summit/1995halifax/communique.html",
        date: "1995-06-17"
      }
    ]
  },
  {
    id: "evt-g8-1998-birmingham",
    series: "G8 Summit",
    title: "24th G8 Summit in Birmingham",
    startDate: "1998-05-15",
    endDate: "1998-05-17",
    city: "Birmingham",
    country: "United Kingdom",
    venue: "International Convention Centre (ICC Birmingham)",
    lat: 52.4786,
    lng: -1.9122,
    summary: "Inaugural formal summit of the G8 with the Russian Federation participating as a full political member, hosted by UK Prime Minister Tony Blair.",
    description: "Addressed nuclear non-proliferation following India's Pokhran-II tests, debt relief for heavily indebted poor countries (HIPC), and international crime prevention.",
    participantIds: ["p-clinton", "tony-blair", "jacques-chirac", "helmut-kohl"],
    sources: [
      {
        id: "src-g8-1998-communique",
        title: "Birmingham G8 Summit Communiqué",
        publisher: "UK Foreign & Commonwealth Office",
        url: "http://www.g7.utoronto.ca/summit/1998birmingham/communique.html",
        date: "1998-05-17"
      }
    ]
  },

  // Historic Superpower Summits & Peace Treaties
  {
    id: "evt-1978-09-17-camp-david-accords",
    series: "Middle East Peace Accords",
    title: "Signing of the Camp David Accords at the White House",
    startDate: "1978-09-17",
    city: "Washington, D.C.",
    country: "United States",
    venue: "The White House (East Room)",
    lat: 38.8977,
    lng: -77.0365,
    summary: "Egyptian President Anwar Sadat and Israeli Prime Minister Menachem Begin sign the Camp David Accords following twelve days of secret negotiations mediated by US President Jimmy Carter.",
    description: "The accords established the framework for peace in the Middle East and led directly to the 1979 Egypt–Israel Peace Treaty, resulting in the return of the Sinai Peninsula to Egypt.",
    participantIds: ["jimmy-carter"],
    sources: [
      {
        id: "src-camp-david-1978-framework",
        title: "The Framework for Peace in the Middle East Agreed at Camp David",
        publisher: "US Department of State / Jimmy Carter Presidential Library",
        url: "https://www.jimmycarterlibrary.gov/research/framework_for_peace_in_the_middle_east",
        date: "1978-09-17"
      }
    ]
  },
  {
    id: "evt-1985-11-19-geneva-summit",
    series: "Cold War Superpower Summits",
    title: "Geneva Summit between President Reagan and General Secretary Gorbachev",
    startDate: "1985-11-19",
    endDate: "1985-11-21",
    city: "Geneva",
    country: "Switzerland",
    venue: "Château de Penthès & Villa Fleur d'Eau",
    lat: 46.2356,
    lng: 6.1367,
    summary: "First meeting between US President Ronald Reagan and Soviet General Secretary Mikhail Gorbachev, producing the historic joint pledge that 'a nuclear war cannot be won and must never be fought.'",
    description: "Laid the personal rapport and diplomatic framework that culminated in the 1987 INF Treaty and the eventual conclusion of the Cold War.",
    participantIds: ["ronald-reagan"],
    sources: [
      {
        id: "src-geneva-summit-1985-joint-statement",
        title: "Joint Soviet-United States Statement on the Geneva Summit",
        publisher: "Ronald Reagan Presidential Library",
        url: "https://www.reaganlibrary.gov/archives/speech/joint-soviet-united-states-statement-summit-meeting-geneva",
        date: "1985-11-21"
      }
    ]
  },
  {
    id: "evt-1986-10-11-reykjavik-summit",
    series: "Cold War Superpower Summits",
    title: "Reykjavik Summit at Höfði House",
    startDate: "1986-10-11",
    endDate: "1986-10-12",
    city: "Reykjavik",
    country: "Iceland",
    venue: "Höfði House",
    lat: 64.1465,
    lng: -21.9056,
    summary: "Dramatic summit between Ronald Reagan and Mikhail Gorbachev in Reykjavik where both leaders came close to agreeing on the complete elimination of all nuclear weapons.",
    description: "Although negotiations stalled over Reagan's Strategic Defense Initiative (SDI), the breakthrough discussions broke the diplomatic deadlock and paved the way for the 1987 INF Treaty.",
    participantIds: ["ronald-reagan"],
    sources: [
      {
        id: "src-reykjavik-summit-1986",
        title: "The Reykjavik Summit: The Historic Encounter of Reagan and Gorbachev",
        publisher: "National Security Archive / George Washington University",
        url: "https://nsarchive.gwu.edu/briefing-book/nuclear-vault/2016-10-11/reykjavik-summit-historic-encounter",
        date: "1986-10-12"
      }
    ]
  },
  {
    id: "evt-1987-12-08-inf-treaty-washington",
    series: "Nuclear Disarmament Treaties",
    title: "Signing of the Intermediate-Range Nuclear Forces (INF) Treaty",
    startDate: "1987-12-08",
    city: "Washington, D.C.",
    country: "United States",
    venue: "The White House (East Room)",
    lat: 38.8977,
    lng: -77.0365,
    summary: "President Ronald Reagan and General Secretary Mikhail Gorbachev sign the historic INF Treaty, eliminating an entire category of ground-launched nuclear missiles with ranges between 500 and 5,500 kilometers.",
    description: "Established the most intrusive on-site inspection and verification regime in history, leading to the destruction of 2,692 missiles by May 1991.",
    participantIds: ["ronald-reagan"],
    sources: [
      {
        id: "src-inf-treaty-1987",
        title: "Treaty Between the United States of America and the USSR on the Elimination of Intermediate-Range Missiles",
        publisher: "United States Department of State (Treaty Series)",
        url: "https://2009-2017.state.gov/t/avc/trty/102360.htm",
        date: "1987-12-08"
      }
    ]
  },
  {
    id: "evt-1991-10-30-madrid-peace-conference",
    series: "Middle East Peace Conferences",
    title: "Convening of the Madrid Middle East Peace Conference",
    startDate: "1991-10-30",
    endDate: "1991-11-01",
    city: "Madrid",
    country: "Spain",
    venue: "Royal Palace of Madrid (Palacio Real)",
    lat: 40.418,
    lng: -3.7143,
    summary: "Historic peace conference co-sponsored by US President George H. W. Bush and Soviet President Mikhail Gorbachev, bringing together Israel, Syria, Lebanon, and a joint Jordanian-Palestinian delegation for direct negotiations.",
    description: "Marked the first time in history that all regional parties engaged in direct bilateral negotiations, establishing the land-for-peace formula that led to the Oslo Accords and the Israel-Jordan Peace Treaty.",
    participantIds: ["george-h-w-bush", "felipe-vi-spain"],
    sources: [
      {
        id: "src-madrid-conference-1991-un",
        title: "Letter Dated 22 October 1991 from the Permanent Representatives of the USSR and USA to the UN Secretary-General (A/46/597)",
        publisher: "United Nations Digital Library",
        url: "https://digitallibrary.un.org/record/125345",
        date: "1991-10-30"
      }
    ]
  },
  {
    id: "evt-1993-09-13-oslo-accord-signing",
    series: "Middle East Peace Accords",
    title: "Signing of the Declaration of Principles on Interim Self-Government Arrangements (Oslo I)",
    startDate: "1993-09-13",
    city: "Washington, D.C.",
    country: "United States",
    venue: "The White House (South Lawn)",
    lat: 38.8967,
    lng: -77.0365,
    summary: "Israeli Prime Minister Yitzhak Rabin and PLO Chairman Yasser Arafat seal the Oslo I Accord with a historic handshake on the White House South Lawn, witnessed by US President Bill Clinton.",
    description: "Established mutual recognition between the State of Israel and the Palestine Liberation Organization and provided for interim Palestinian self-governance in the Gaza Strip and Jericho.",
    participantIds: ["p-clinton"],
    sources: [
      {
        id: "src-oslo-1993-dop-un",
        title: "Declaration of Principles on Interim Self-Government Arrangements (A/48/486 - S/26560)",
        publisher: "United Nations Digital Library",
        url: "https://digitallibrary.un.org/record/174393",
        date: "1993-09-13"
      }
    ]
  },
  {
    id: "evt-1998-04-10-good-friday-agreement",
    series: "Northern Ireland Peace Process",
    title: "Signing of the Good Friday Agreement (Belfast Agreement)",
    startDate: "1998-04-10",
    city: "Belfast",
    country: "United Kingdom",
    venue: "Castle Buildings (Stormont Estate)",
    lat: 54.6006,
    lng: -5.8294,
    summary: "British Prime Minister Tony Blair, Irish Taoiseach Bertie Ahern, and Northern Ireland political leaders sign the Belfast (Good Friday) Agreement, ending thirty years of the Troubles.",
    description: "Established the Northern Ireland Assembly with power-sharing executive arrangements, cross-border institutions, and decommissioning of paramilitary weapons.",
    participantIds: ["tony-blair"],
    sources: [
      {
        id: "src-good-friday-1998-hansard",
        title: "Northern Ireland: The Belfast Agreement — Statement by the Prime Minister",
        publisher: "UK Parliament (Hansard)",
        url: "https://hansard.parliament.uk/commons/1998-04-20/debates/6f4142a7-5420-410a-8d76-f8510a97ca1d/NorthernIreland",
        date: "1998-04-20"
      }
    ]
  },
  {
    id: "evt-1998-10-23-wye-river-memorandum",
    series: "Middle East Peace Accords",
    title: "Signing of the Wye River Memorandum at the White House",
    startDate: "1998-10-23",
    city: "Washington, D.C.",
    country: "United States",
    venue: "The White House (East Room)",
    lat: 38.8977,
    lng: -77.0365,
    summary: "Israeli Prime Minister Benjamin Netanyahu and PLO Chairman Yasser Arafat sign the Wye River Memorandum following nine days of intensive negotiations at the Aspen Wye Conference Center hosted by President Bill Clinton and King Hussein of Jordan.",
    description: "Agreed on redeployment of Israeli forces from 13 percent of Area C in the West Bank and Palestinian security commitments.",
    participantIds: ["p-clinton", "p-hussein"],
    sources: [
      {
        id: "src-wye-river-1998-white-house",
        title: "Remarks on the Signing of the Wye River Memorandum",
        publisher: "The American Presidency Project (UCSB)",
        url: "https://www.presidency.ucsb.edu/documents/remarks-the-signing-the-wye-river-memorandum",
        date: "1998-10-23"
      }
    ]
  },
  {
    id: "evt-2020-09-15-abraham-accords-signing",
    series: "Middle East Peace Accords",
    title: "Signing of the Abraham Accords Declaration and Normalization Agreements",
    startDate: "2020-09-15",
    city: "Washington, D.C.",
    country: "United States",
    venue: "The White House (South Lawn)",
    lat: 38.8967,
    lng: -77.0365,
    summary: "Israeli Prime Minister Benjamin Netanyahu, UAE Foreign Minister Abdullah bin Zayed Al Nahyan, and Bahraini Foreign Minister Abdullatif Al Zayani sign the Abraham Accords on the White House South Lawn, witnessed by US President Donald Trump.",
    description: "Marked the first peace treaties between Israel and Arab nations in twenty-six years, establishing full diplomatic, commercial, and tourism relations.",
    participantIds: ["p-trump", "abdullah-bin-zayed-al-nahyan", "abdullatif-bin-rashid-al-zayani"],
    sources: [
      {
        id: "src-abraham-accords-2020-white-house",
        title: "The Abraham Accords Declaration and Bilateral Agreements",
        publisher: "United States Department of State",
        url: "https://www.state.gov/the-abraham-accords/",
        date: "2020-09-15"
      }
    ]
  }
];
