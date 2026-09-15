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
  if (!slug || !/^[a-zA-Z0-9_-]+$/.test(slug)) notFound();
  if (!/^\d{4}$/.test(year)) notFound();

  const timelineData = await getPersonTimeline(slug, { year });
  if (!timelineData || !timelineData.years.includes(Number(year))) notFound();

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
