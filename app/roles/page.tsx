import type { Metadata } from "next";
import { getProminentOffices } from "@/lib/rewind/offices";
import { RolesExplorer } from "@/components/rewind/RolesExplorer";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Offices & Leadership Succession | REWIND Evidence Atlas",
  description:
    "Chronological succession timelines and scrollytelling records for prominent constitutional offices, sovereign heads of state, prime ministers, and multilateral leadership roles.",
};

interface RolesPageProps {
  searchParams?: Promise<{
    office?: string;
  }>;
}

export default async function RolesPage({ searchParams }: RolesPageProps) {
  const resolvedParams = searchParams ? await searchParams : {};
  const offices = await getProminentOffices();

  return (
    <div className="page-shell">
      <div className="roles-hero-container">
        <header className="roles-hero-card">
          <span className="roles-hero-eyebrow">CONSTITUTIONAL SUCCESSION</span>
          <h1 className="roles-hero-title">Offices & Leadership</h1>
          <p className="roles-hero-desc">
            Chronological succession records and scrollytelling timelines for prominent heads of state,
            prime ministers, foreign ministers, and international mandates.
          </p>
        </header>
      </div>

      <RolesExplorer
        offices={offices}
        initialOfficeId={resolvedParams.office}
      />
    </div>
  );
}

