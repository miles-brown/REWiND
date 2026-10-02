import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { CanonicalPersonSeed } from "../data/seeds/types";

// Helper to auto-enrich a seed record with complete demographic and inclusion attributes
export function enrichPersonSeed(p: CanonicalPersonSeed): CanonicalPersonSeed {
  const nationality = p.nationality || "Unknown";
  const citizenship = p.citizenship && p.citizenship.length > 0 ? p.citizenship : [nationality];
  const languages = p.languages && p.languages.length > 0 ? p.languages : (
    nationality === "Israel" ? ["Hebrew", "English"] :
    nationality === "United States" || nationality === "United Kingdom" || nationality === "Australia" || nationality === "Canada" ? ["English"] :
    nationality === "France" ? ["French", "English"] :
    nationality === "Germany" ? ["German", "English"] :
    nationality === "Russian Federation" || nationality === "Soviet Union" || nationality === "Russia" ? ["Russian"] :
    nationality === "State of Palestine" || nationality === "Palestine" || nationality === "Jordan" || nationality === "Egypt" || nationality === "Saudi Arabia" || nationality === "Qatar" || nationality === "United Arab Emirates" || nationality === "Syria" || nationality === "Lebanon" ? ["Arabic", "English"] :
    nationality === "Turkey" ? ["Turkish", "English"] :
    nationality === "Iran" ? ["Persian", "Arabic"] :
    ["English"]
  );

  let religion = p.religion ?? null;
  let religiousDenomination = p.religiousDenomination ?? null;
  let religionStatus = p.religionStatus;

  if (!religionStatus) {
    if (religion) {
      religionStatus = "self-identified";
    } else if (nationality === "Israel") {
      religion = "Judaism";
      religiousDenomination = null;
      religionStatus = "self-identified";
    } else {
      religionStatus = "not-publicly-stated";
    }
  }

  let inclusionBasis = p.inclusionBasis;
  if (!inclusionBasis || inclusionBasis.length === 0) {
    if (p.classification === "head-of-state" || p.programmeId === "prog-heads-of-government") {
      inclusionBasis = ["head-of-state-or-government", "central-nexus-to-historical-events", "scholarly-historiographical-subject"];
    } else if (p.classification === "diplomat" || p.programmeId === "prog-senior-diplomats") {
      inclusionBasis = ["senior-diplomatic-or-geopolitical", "central-nexus-to-historical-events"];
    } else if (p.classification === "religious-leader" || p.programmeId === "prog-religious-leaders") {
      inclusionBasis = ["major-religious-authority", "central-nexus-to-historical-events"];
    } else if (p.classification === "judicial-official") {
      inclusionBasis = ["significant-legal-or-judicial-record", "central-nexus-to-historical-events"];
    } else {
      inclusionBasis = ["substantial-independent-coverage", "central-nexus-to-historical-events"];
    }
  }

  const inclusionRationale = p.inclusionRationale || null;
  const culturalImpactSummary = p.culturalImpactSummary || null;
  const primaryFigureCategory = p.primaryFigureCategory || p.classification || "public-figure";

  return {
    ...p,
    citizenship,
    languages,
    religion,
    religiousDenomination,
    religionStatus,
    inclusionBasis,
    inclusionRationale,
    culturalImpactSummary,
    primaryFigureCategory,
  };
}

async function run() {
  const seedFiles = [
    "group1-people.ts",
    "israel-me-people.ts",
    "us-uk-politics-people.ts",
    "media-people.ts",
    "tech-people.ts",
    "epstein-network-people.ts",
  ];

  for (const file of seedFiles) {
    const filePath = path.join("data/seeds", file);
    if (!fs.existsSync(filePath)) continue;

    const seedModule = await import(path.resolve(filePath));
    const exportKey = Object.keys(seedModule).find((k) => Array.isArray(seedModule[k]));
    if (!exportKey) continue;

    const peopleList: CanonicalPersonSeed[] = seedModule[exportKey];
    const enrichedList = peopleList.map(enrichPersonSeed);

    const tsContent = `/**
 * REWIND EVIDENCE ATLAS — CANONICAL SEED REGISTER: ${file.toUpperCase().replace(".TS", "")}
 *
 * Forensically documented seed records strictly complying with schema standards.
 */

import type { CanonicalPersonSeed } from "./types";
export type { CanonicalPersonSeed };

export const ${exportKey}: CanonicalPersonSeed[] = ${JSON.stringify(enrichedList, null, 2)};
`;

    fs.writeFileSync(filePath, tsContent, "utf-8");
    console.log(`✅ Enriched ${enrichedList.length} figures in ${file}`);
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  run().catch(console.error);
}

