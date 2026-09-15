import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowLeftRight } from "lucide-react";
import { personBySlug } from "@/data/rewind";
import { TimelineComparison } from "@/components/rewind/TimelineComparison";

export default async function RelationshipPage({
  params,
}: {
  params: Promise<{ a: string; b: string }>;
}) {
  const { a, b } = await params;
  const pa = personBySlug(a);
  const pb = personBySlug(b);
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
          {pa.name
            .split(" ")
            .map((n) => n[0])
            .slice(0, 2)
            .join("")}
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
          {pb.name
            .split(" ")
            .map((n) => n[0])
            .slice(0, 2)
            .join("")}
        </span>
      </header>

      <TimelineComparison initialPersonA={pa.slug} initialPersonB={pb.slug} />
    </div>
  );
}
