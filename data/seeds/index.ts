import type { CanonicalPersonSeed } from "./types";
import { group1PeopleSeed } from "./group1-people";
import { israelMePeopleSeed } from "./israel-me-people";
import { usUkPoliticsPeopleSeed } from "./us-uk-politics-people";
import { mediaPeopleSeed } from "./media-people";
import { techPeopleSeed } from "./tech-people";
import { epsteinNetworkPeopleSeed } from "./epstein-network-people";

export type { CanonicalPersonSeed };
export {
  group1PeopleSeed,
  israelMePeopleSeed,
  usUkPoliticsPeopleSeed,
  mediaPeopleSeed,
  techPeopleSeed,
  epsteinNetworkPeopleSeed,
};

export const allCanonicalPeopleSeed: CanonicalPersonSeed[] = [
  ...group1PeopleSeed,
  ...israelMePeopleSeed,
  ...usUkPoliticsPeopleSeed,
  ...mediaPeopleSeed,
  ...techPeopleSeed,
  ...epsteinNetworkPeopleSeed,
];

// Ensure unique deduplicated records by slug
export const masterPeopleSeed: CanonicalPersonSeed[] = Array.from(
  new Map(allCanonicalPeopleSeed.map((p) => [p.slug, p])).values()
);
