import type { CanonicalPersonSeed } from "./types";
import { group1PeopleSeed } from "./group1-people";
import { israelMePeopleSeed } from "./israel-me-people";
import { usUkPoliticsPeopleSeed } from "./us-uk-politics-people";
import { mediaPeopleSeed } from "./media-people";
import { techPeopleSeed } from "./tech-people";
import { epsteinNetworkPeopleSeed } from "./epstein-network-people";
import { headsOfStatePeopleSeed } from "./heads-of-state-people";
import { diplomatsAndEnvoysPeopleSeed } from "./diplomats-and-envoys-people";
import { legalAndIntelligencePeopleSeed } from "./legal-and-intelligence-people";
import { globalFiguresPeopleSeed } from "./global-figures-people";
import { middleEastDiplomacyPeopleSeed } from "./middle-east-diplomacy-people";
import { reigningRoyaltyPeopleSeed } from "./reigning-royalty-people";
import { historicRoyalHousesPeopleSeed } from "./historic-royal-houses-people";
import { extendedRoyaltyPeopleSeed } from "./extended-royalty-and-succession-seed";
import { extendedHistoricHousesPeopleSeed } from "./extended-historic-houses-seed";

import { officialRolesSeed } from "./roles-seed";
import { milestonesSeed } from "./milestones-seed";
import { topicsSeed } from "./topics-seed";
import {
  royalEducationSeed,
  royalCareerSeed,
  royalAwardsSeed,
  royalWorksSeed,
  royalStaysSeed,
} from "./royal-bio-details-seed";
import {
  figuresEducationSeed,
  figuresCareerSeed,
  figuresAwardsSeed,
  figuresWorksSeed,
  figuresStaysSeed,
} from "./figures-bio-details-seed";

export const allEducationSeed = [...royalEducationSeed, ...figuresEducationSeed];
export const allCareerSeed = [...royalCareerSeed, ...figuresCareerSeed];
export const allAwardsSeed = [...royalAwardsSeed, ...figuresAwardsSeed];
export const allWorksSeed = [...royalWorksSeed, ...figuresWorksSeed];
export const allStaysSeed = [...royalStaysSeed, ...figuresStaysSeed];

export type { CanonicalPersonSeed };
export {
  group1PeopleSeed,
  israelMePeopleSeed,
  usUkPoliticsPeopleSeed,
  mediaPeopleSeed,
  techPeopleSeed,
  epsteinNetworkPeopleSeed,
  headsOfStatePeopleSeed,
  diplomatsAndEnvoysPeopleSeed,
  legalAndIntelligencePeopleSeed,
  globalFiguresPeopleSeed,
  middleEastDiplomacyPeopleSeed,
  reigningRoyaltyPeopleSeed,
  historicRoyalHousesPeopleSeed,
  extendedRoyaltyPeopleSeed,
  extendedHistoricHousesPeopleSeed,
  officialRolesSeed,
  milestonesSeed,
  topicsSeed,
  royalEducationSeed,
  royalCareerSeed,
  royalAwardsSeed,
  royalWorksSeed,
  royalStaysSeed,
  figuresEducationSeed,
  figuresCareerSeed,
  figuresAwardsSeed,
  figuresWorksSeed,
  figuresStaysSeed,
};

export const allCanonicalPeopleSeed: CanonicalPersonSeed[] = [
  ...group1PeopleSeed,
  ...israelMePeopleSeed,
  ...usUkPoliticsPeopleSeed,
  ...mediaPeopleSeed,
  ...techPeopleSeed,
  ...epsteinNetworkPeopleSeed,
  ...headsOfStatePeopleSeed,
  ...diplomatsAndEnvoysPeopleSeed,
  ...legalAndIntelligencePeopleSeed,
  ...globalFiguresPeopleSeed,
  ...middleEastDiplomacyPeopleSeed,
  ...reigningRoyaltyPeopleSeed,
  ...historicRoyalHousesPeopleSeed,
  ...extendedRoyaltyPeopleSeed,
  ...extendedHistoricHousesPeopleSeed,
];

// Ensure unique deduplicated records by slug
export const masterPeopleSeed: CanonicalPersonSeed[] = Array.from(
  new Map(allCanonicalPeopleSeed.map((p) => [p.slug, p])).values()
);
