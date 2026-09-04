import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getPersonTimeline } from "@/lib/rewind";
import { EventExplorer } from "@/components/rewind/EventExplorer";

export default async function PersonYearPage({
  params,
}: {
  params: Promise<{ slug: string; year: string }>;
}) {
  const { slug, year } = await params;
  const timelineData = await getPersonTimeline(slug, { year });
  if (!timelineData) notFound();

  return (
    <div className="page-shell">
      <header className="page-hero">
        <Link className="back-link" href={`/person/${slug}`}>
          <ArrowLeft /> {timelineData.person.name}
        </Link>
        <span className="eyebrow">YEAR VIEW</span>
        <h1>{year}</h1>
        <p>Every indexed {timelineData.person.name} record currently attached to this year.</p>
      </header>
      <EventExplorer initialEvents={timelineData.events} year={year} />
    </div>
  );
}
