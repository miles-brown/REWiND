import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowLeftRight } from "lucide-react";
import {
  getPersonBySlug,
  getPeople,
  getAllEvents,
  getSources,
  getMonogram,
} from "@/lib/rewind";
import { TimelineComparison } from "@/components/rewind/TimelineComparison";

export default async function RelationshipPage({
  params,
}: {
  params: Promise<{ a: string; b: string }>;
}) {
  const { a, b } = await params;
  if (!a || !b || a === b) notFound();

  const [pa, pb] = await Promise.all([
    getPersonBySlug(a),
    getPersonBySlug(b),
  ]);

  if (!pa || !pb || pa.id === pb.id) notFound();

  const [people, allEvents, sources] = await Promise.all([
    getPeople(),
    getAllEvents(),
    getSources(),
  ]);

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
        <span className="person-monogram large" aria-hidden="true">
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
        <span className="person-monogram large" aria-hidden="true">
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
