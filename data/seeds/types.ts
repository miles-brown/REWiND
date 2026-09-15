export interface CanonicalPersonSeed {
  id: string;
  slug: string;
  canonicalName: string;
  displayName: string;
  nativeName: string | null;
  birthDate: string;
  deathDate: string | null;
  datePrecision: "exact-day" | "month" | "year";
  nationality: string;
  primaryRole: string;
  classification: "politician" | "diplomat" | "media" | "executive" | "religious-leader" | "monarch-royal" | "public-figure";
  notabilityBasis: string;
  programmeId: string | null;
  isLiving: boolean;
  monitoringPriority: "intensive" | "normal" | "historical-only";
  publicationStatus: "published" | "draft" | "staging";
  wikidataId: string | null;
  viafId: string | null;
  avatarUrl: string | null;
  summary: string;
  aliases: string[];
}
