import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getPersonTimelineWithStatus } from "@/lib/rewind";
import { EventExplorer } from "@/components/rewind/EventExplorer";

export default async function PersonYearPage({
  params,
}: {
  params: Promise<{ slug: string; year: string }>;
}) {
  const { slug, year } = await params;
  if (!slug || !/^[a-zA-Z0-9_-]+$/.test(slug)) notFound();
  if (!/^\d{4}$/.test(year)) notFound();

  const { data: timelineData, error } = await getPersonTimelineWithStatus(slug, { year });
  if (error) {
    return (
      <div className="page-shell">
        <header className="page-hero">
          <Link className="back-link" href={`/person/${slug}`}>
            <ArrowLeft /> Return to Person
          </Link>
          <span className="eyebrow">YEAR VIEW</span>
          <h1>{year}</h1>
          <p>The chronology could not be retrieved from the database at this time.</p>
        </header>
        <div
          className="zero-state"
          style={{
            padding: "4rem 2rem",
            textAlign: "center",
            border: "1px dashed var(--border-subtle, #333)",
            borderRadius: "8px",
            margin: "2rem auto",
            maxWidth: "600px",
          }}
        >
          <h2>Database unavailable</h2>
          <p style={{ color: "var(--text-muted, #888)", marginTop: "0.5rem" }}>
            Records for this year could not be loaded. Please try again later.
          </p>
        </div>
      </div>
    );
  }
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
