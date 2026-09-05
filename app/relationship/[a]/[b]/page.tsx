import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowLeftRight } from "lucide-react";
import {
  getPersonBySlug,
  getPeople,
  getAllEvents,
  getSources,
} from "@/lib/rewind";
import { TimelineComparison } from "@/components/rewind/TimelineComparison";

function getMonogram(name: string): string {
  if (!name) return "—";
  const parts = name.split(" ").filter(Boolean);
  if (parts.length === 0) return "—";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default async function RelationshipPage({
  params,
}: {
  params: Promise<{ a: string; b: string }>;
}) {
  const { a, b } = await params;
  const [pa, pb, people, allEvents, sources] = await Promise.all([
    getPersonBySlug(a),
    getPersonBySlug(b),
    getPeople(),
    getAllEvents(),
    getSources(),
  ]);

  if (!pa || !pb) notFound();

  return (
    <div className="page-shell relationship-page">
      <div className="record-breadcrumb">
        <Link href="/relationships">
          <ArrowLeft size={14} /> All relationships
        </Link>
        <span>
          {pa.name} × {pb.name}
        </span>
      </div>

      <header className="relationship-hero">
        <span className="person-monogram large">
          {getMonogram(pa.name)}
        </span>
        <div>
          <span className="eyebrow">DOCUMENTED INTERSECTIONS</span>
          <h1>
            {pa.name} <ArrowLeftRight size={24} /> {pb.name}
          </h1>
          <p>
            Verifiable spacetime intersections and bilateral diplomatic records.
          </p>
        </div>
        <span className="person-monogram large">
          {getMonogram(pb.name)}
        </span>
      </header>

      <TimelineComparison
        initialPersonA={pa.slug}
        initialPersonB={pb.slug}
        people={people}
        events={allEvents}
        sources={sources}
      />
    </div>
  );
}
