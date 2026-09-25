import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowLeftRight } from "lucide-react";
import {
  getRelationshipBetweenWithStatus,
  getSourcesByIds,
  getMonogram,
  getPeopleWithStatus,
  getAllEventsWithStatus,
} from "@/lib/rewind";
import { TimelineComparison } from "@/components/rewind/TimelineComparison";

export default async function RelationshipPage({
  params,
}: {
  params: Promise<{ a: string; b: string }>;
}) {
  const { a, b } = await params;
  if (!a || !b || a === b) notFound();
  const slugPattern = /^[a-zA-Z0-9_-]+$/;
  if (
    a.length > 120 ||
    b.length > 120 ||
    !slugPattern.test(a) ||
    !slugPattern.test(b)
  ) {
    notFound();
  }

  const [relationshipResult, peopleResult, eventsResult] = await Promise.all([
    getRelationshipBetweenWithStatus(a, b),
    getPeopleWithStatus(),
    getAllEventsWithStatus(),
  ]);
  if (relationshipResult.error) {
    throw new Error(`Relationship data unavailable: ${relationshipResult.error}`);
  }
  if (!relationshipResult.data) notFound();
  if (peopleResult.error) {
    throw new Error(`Relationship people catalog unavailable: ${peopleResult.error}`);
  }
  if (eventsResult.error) {
    throw new Error(`Relationship event catalog unavailable: ${eventsResult.error}`);
  }
  const { personA: pa, personB: pb } = relationshipResult.data;
  if (!pa || !pb || pa.id === pb.id) notFound();
  const verifiedEvents = (eventsResult.data || []).filter((e) => e.verificationStatus === "verified");
  const neededSourceIds = Array.from(new Set(verifiedEvents.flatMap((e) => e.sourceIds || [])));
  const sources = neededSourceIds.length > 0 ? await getSourcesByIds(neededSourceIds) : [];

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
        people={peopleResult.data}
        events={verifiedEvents}
        sources={sources}
      />
    </div>
  );
}
