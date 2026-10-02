export type FigureClassification =
  | "head-of-state"
  | "politician"
  | "diplomat"
  | "judicial-official"
  | "intelligence-official"
  | "military-leader"
  | "religious-leader"
  | "media-journalist"
  | "academic-historian"
  | "corporate-executive"
  | "monarch-royal"
  | "public-figure";

export type ReligionStatus =
  | "self-identified"
  | "scholarly-consensus"
  | "historical-affiliation-only"
  | "not-publicly-stated"
  | "disputed"
  | "unspecified";

export type InclusionBasis =
  | "head-of-state-or-government"
  | "senior-diplomatic-or-geopolitical"
  | "central-nexus-to-historical-events"
  | "scholarly-historiographical-subject"
  | "substantial-independent-coverage"
  | "major-religious-authority"
  | "significant-legal-or-judicial-record"
  | "military-leader"
  | "major-cultural-or-intellectual"
  | "scientific-or-technological-impact"
  | "treaty-signatory"
  | "state-head"
  | "cabinet-minister"
  | "judicial-officer"
  | "intelligence-official"
  | "diplomatic-envoy"
  | "religious-authority"
  | "notable-cultural-impact"
  | "investigative-subject"
  | "key-witness"
  | "public-advocate"
  | "industry-executive"
  | "historical-significance"
  | "un-official"
  | "military-commander"
  | "monarch-royal"
  | "parliamentary-leader";

export interface CanonicalPersonSeed {
  id: string;
  slug: string;
  canonicalName: string;
  displayName: string;
  nativeName: string | null;
  fullBirthName?: string | null;
  birthDate: string;
  deathDate: string | null;
  datePrecision: "exact-day" | "month" | "year";
  nationality: string;
  citizenship?: string[];
  nationalIdentity?: string | null;
  ethnicity?: string | null;
  ancestry?: string | null;
  religion?: string | null;
  religiousDenomination?: string | null;
  religionStatus?: ReligionStatus;
  languages?: string[];
  primaryRole: string;
  classification: FigureClassification;
  primaryFigureCategory?: string;
  notabilityBasis: string;
  inclusionBasis?: InclusionBasis[];
  inclusionRationale?: string | null;
  culturalImpactSummary?: string | null;
  achievements?: Array<{ milestone: string; year?: number; evidence?: string }>;
  programmeId: string | null;
  isLiving: boolean;
  monitoringPriority: "intensive" | "normal" | "historical-only";
  publicationStatus: "published" | "draft" | "staging";
  wikidataId: string | null;
  viafId: string | null;
  avatarUrl: string | null;
  inclusionContested?: boolean;
  inclusionContestationNote?: string | null;
  summary: string;
  aliases: string[];
}
