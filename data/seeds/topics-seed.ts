export interface TopicSeed {
  id: string;
  slug: string;
  name: string;
  category: "geopolitics" | "conflict" | "economy" | "diplomacy" | "technology" | "investigation";
  summary: string;
  startedDate: string;
  endedDate: string | null;
}

export const topicsSeed: TopicSeed[] = [
  {
    id: "topic-911",
    slug: "september-11-attacks-and-aftermath",
    name: "9/11 Attacks & Global War on Terror",
    category: "conflict",
    summary: "The 11 September 2001 terrorist attacks on the United States, foreign policy responses, congressional authorizations, and subsequent global security developments.",
    startedDate: "2001-09-11",
    endedDate: null
  },
  {
    id: "topic-iraq-war",
    slug: "iraq-war-2003-2011",
    name: "Iraq War & Coalition Interventions",
    category: "conflict",
    summary: "The 2003 invasion of Iraq, UN Security Council debates, coalition operations, parliamentary votes, and subsequent troop withdrawals.",
    startedDate: "2002-09-12",
    endedDate: "2011-12-18"
  },
  {
    id: "topic-financial-crisis-2008",
    slug: "global-financial-crisis-2007-2009",
    name: "2007–2009 Global Financial Crisis",
    category: "economy",
    summary: "The subprime mortgage collapse, Lehman Brothers bankruptcy, G20 emergency summits, government bailouts, and global economic regulatory responses.",
    startedDate: "2007-08-09",
    endedDate: "2009-09-25"
  },
  {
    id: "topic-ukraine-war-2022",
    slug: "russian-invasion-of-ukraine-2022",
    name: "2022 Russian Invasion of Ukraine & Sanctions",
    category: "conflict",
    summary: "The full-scale military invasion of Ukraine, NATO responses, bilateral aid agreements, UN Emergency Special Sessions, and international sanctions.",
    startedDate: "2022-02-24",
    endedDate: null
  },
  {
    id: "topic-oslo-accords",
    slug: "oslo-peace-process-1993-2000",
    name: "Oslo Peace Process & Middle East Summits",
    category: "diplomacy",
    summary: "The secret 1993 negotiations, Oslo I and II Accords, Washington lawn handshakes, Wye River Memorandum, and 2000 Camp David Summit.",
    startedDate: "1993-08-20",
    endedDate: "2000-07-25"
  },
  {
    id: "topic-abraham-accords",
    slug: "abraham-accords-normalization",
    name: "2020 Abraham Accords & Regional Normalization",
    category: "diplomacy",
    summary: "Bilateral normalization treaties signed between Israel, the United Arab Emirates, Bahrain, Sudan, and Morocco, mediated by the United States.",
    startedDate: "2020-08-13",
    endedDate: null
  },
  {
    id: "topic-epstein-inquiries",
    slug: "epstein-investigations-and-legal-disclosures",
    name: "Jeffrey Epstein Investigations & Legal Disclosures",
    category: "investigation",
    summary: "Law enforcement proceedings, 2007 Non-Prosecution Agreement, 2019 federal arrest, unsealed court depositions, and congressional oversight inquiries.",
    startedDate: "2005-03-01",
    endedDate: null
  },
  {
    id: "topic-ai-revolution",
    slug: "ai-and-deep-learning-revolution",
    name: "Artificial Intelligence & Compute Era",
    category: "technology",
    summary: "Foundational deep learning research, GPU compute scaling, commercial LLM launches, congressional hearings, and international AI safety summits.",
    startedDate: "2012-09-30",
    endedDate: null
  }
];
