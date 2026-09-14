import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getPersonTimeline } from "@/lib/rewind";
import { EventExplorer } from "@/components/rewind/EventExplorer";

/** Renders one person's timeline for a strictly validated calendar year. */
export default async function PersonYearPage({
  params,
}: {
  params: Promise<{ slug: string; year: string }>;
}) {
  const { slug, year } = await params;
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
