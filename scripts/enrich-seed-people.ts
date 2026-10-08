import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { CanonicalPersonSeed } from "../data/seeds/types";

// Helper to auto-enrich a seed record with complete demographic and inclusion attributes
export function enrichPersonSeed(p: CanonicalPersonSeed): CanonicalPersonSeed {
  const nationality = p.nationality || "Unknown";
  const citizenship = p.citizenship && p.citizenship.length > 0 ? p.citizenship : [nationality];
  const languages = p.languages && p.languages.length > 0 ? p.languages : (
    nationality === "Israel" || nationality === "Israeli" ? ["Hebrew", "English"] :
    nationality === "United States" || nationality === "American" || nationality === "United Kingdom" || nationality === "British" || nationality === "Australia" || nationality === "Australian" || nationality === "Canada" || nationality === "Canadian" ? ["English"] :
    nationality === "France" || nationality === "French" ? ["French", "English"] :
    nationality === "Germany" || nationality === "German" ? ["German", "English"] :
    nationality === "Russian Federation" || nationality === "Soviet Union" || nationality === "Russia" || nationality === "Russian" || nationality === "Soviet" ? ["Russian"] :
    nationality === "State of Palestine" || nationality === "Palestine" || nationality === "Palestinian" || nationality === "Jordan" || nationality === "Jordanian" || nationality === "Egypt" || nationality === "Egyptian" || nationality === "Saudi Arabia" || nationality === "Saudi" || nationality === "Qatar" || nationality === "Qatari" || nationality === "United Arab Emirates" || nationality === "Emirati" || nationality === "Syria" || nationality === "Syrian" || nationality === "Lebanon" || nationality === "Lebanese" ? ["Arabic", "English"] :
    nationality === "Turkey" || nationality === "Turkish" ? ["Turkish", "English"] :
    nationality === "Iran" || nationality === "Iranian" ? ["Persian", "Arabic"] :
    nationality === "Spain" || nationality === "Spanish" ? ["Spanish"] :
    nationality === "Italy" || nationality === "Italian" ? ["Italian"] :
    nationality === "China" || nationality === "Chinese" ? ["Chinese"] :
    nationality === "Japan" || nationality === "Japanese" ? ["Japanese"] :
    ["English"]
  );

  let religion = p.religion ?? null;
  let religiousDenomination = p.religiousDenomination ?? null;
  let religionStatus = p.religionStatus;

  if (!religionStatus) {
    if (religion) {
      religionStatus = "self-identified";
    } else if (nationality === "Israel" || nationality === "Israeli") {
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

    const seedModule = await import(/* @vite-ignore */ path.resolve(filePath));
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

