import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, Calendar, ShieldCheck, MapPin } from "lucide-react";
import { getPersonTimelineWithStatus, getMonogram } from "@/lib/rewind";
import { EventExplorer } from "@/components/rewind/EventExplorer";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; year: string }>;
}): Promise<Metadata> {
  const { slug, year } = await params;
  if (!slug || !/^[a-zA-Z0-9_-]+$/.test(slug) || !/^\d{4}$/.test(year)) {
    return { title: "Year Record — REWIND Evidence Atlas" };
  }
  const { data } = await getPersonTimelineWithStatus(slug, { year });
  if (!data) return { title: `${year} Records — REWIND Evidence Atlas` };
  return {
    title: `${data.person.name} in ${year} — Chronological Records | REWIND`,
    description: `Documented historical movements, meetings, and diplomatic events involving ${data.person.name} during the year ${year}.`,
  };
}

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
      <div className="page-shell person-page">
        <header className="page-hero">
          <Link className="back-link" href={`/person/${slug}`}>
            <ArrowLeft size={16} /> Return to {slug}
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

  const cities = Array.from(new Set(timelineData.events.map((e) => e.city).filter(Boolean)));

  return (
    <div className="page-shell person-page">
      <header className="person-hero person-year-hero">
        <div className="person-hero-left">
          <Link className="back-link" href={`/person/${slug}`}>
            <ArrowLeft size={16} /> Return to {timelineData.person.name} Dossier
          </Link>

          <div style={{ display: "flex", alignItems: "center", gap: "16px", marginTop: "12px" }}>
            <div className="person-monogram radar-frame">
              {getMonogram(timelineData.person.name)}
            </div>
            <div>
              <span className="eyebrow">CHRONOLOGICAL YEAR DOSSIER</span>
              <h1 style={{ margin: "4px 0" }}>{timelineData.person.name} · {year}</h1>
            </div>
          </div>

          <p className="person-bio-lead">
            Every indexed historical record, diplomatic encounter, and verified public appearance involving {timelineData.person.name} during the year {year}.
          </p>

          <div className="person-hero-meta-chips" style={{ marginTop: "14px" }}>
            <span className="hero-meta-chip">
              <Calendar size={13} />
              <span>{timelineData.events.length} Documented Event{timelineData.events.length === 1 ? "" : "s"}</span>
            </span>
            <span className="hero-meta-chip">
              <MapPin size={13} />
              <span>{cities.length} Theatre{cities.length === 1 ? "" : "s"}</span>
            </span>
            <span className="hero-meta-chip">
              <ShieldCheck size={13} />
              <span>{timelineData.person.classification ? timelineData.person.classification.toUpperCase() : "PUBLIC FIGURE"}</span>
            </span>
          </div>
        </div>
      </header>

      <main className="person-content-body" style={{ padding: "32px clamp(20px, 5vw, 76px) 80px" }}>
        <EventExplorer initialEvents={timelineData.events} year={year} />
      </main>
    </div>
  );
}
