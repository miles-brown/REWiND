import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, CalendarRange, MapPin, Sparkles, Users } from "lucide-react";
import {
  getCoAttendanceIntersectionsWithStatus,
  getMonogram,
  getSourcesByIds,
} from "@/lib/rewind";
import { EventCard } from "@/components/rewind/EventCard";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slugs: string[] }>;
}): Promise<Metadata> {
  const { slugs } = await params;
  if (!slugs || slugs.length < 2) {
    return { title: "Co-Attendance Meeting Not Found — REWIND Evidence Atlas" };
  }
  return {
    title: `Multi-Figure Co-Attendance Meeting Analysis (${slugs.length} Figures) — REWIND Evidence Atlas`,
    description: `Documented historical summits and bilateral meetings attended by ${slugs.join(", ")}.`,
  };
}

export default async function MultiFigureMeetingPage({
  params,
}: {
  params: Promise<{ slugs: string[] }>;
}) {
  const { slugs } = await params;
  if (!slugs || !Array.isArray(slugs) || slugs.length < 2 || slugs.length > 5) {
    notFound();
  }

  const { data, error } = await getCoAttendanceIntersectionsWithStatus(slugs);

  if (error) {
    throw new Error(`Co-attendance intersection analysis unavailable: ${error}`);
  }
  if (!data || !data.people || data.people.length < 2) {
    notFound();
  }

  const { people, sharedEvents } = data;
  const verifiedEvents = sharedEvents.filter((e) => e.verificationStatus === "verified");

  const neededSourceIds = Array.from(new Set(verifiedEvents.flatMap((e) => e.sourceIds || [])));
  const sources = neededSourceIds.length > 0 ? await getSourcesByIds(neededSourceIds) : [];
  const sourcesMap = new Map(sources.map((s) => [s.id, s]));

  const cities = Array.from(new Set(verifiedEvents.map((e) => e.city).filter(Boolean)));

  return (
    <div className="page-shell relationship-page multi-figure-meeting-page">
      <div className="record-breadcrumb">
        <Link href="/relationships">
          <ArrowLeft size={14} /> All relationships
        </Link>
        <span>
          Joint Meeting Intersection ({people.length} Figures)
        </span>
      </div>

      <header className="relationship-hero multi-figure-hero">
        <div className="multi-figure-monograms" style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", justifyContent: "center" }}>
          {people.map((p) => (
            <Link key={p.slug} href={`/person/${p.slug}`} title={p.name}>
              <span className="person-monogram large" aria-hidden="true">
                {getMonogram(p.name)}
              </span>
            </Link>
          ))}
        </div>

        <div>
          <span className="eyebrow">MULTI-FIGURE CO-ATTENDANCE INTERSECTION</span>
          <h1 style={{ fontSize: "1.6rem", margin: "8px 0" }}>
            {people.map((p) => p.name).join(" × ")}
          </h1>
          <p>
            Documented summits, bilateral audiences, and state ceremonies where all {people.length} historical actors were physically present.
          </p>
        </div>
      </header>

      {/* Telemetry Summary Bar */}
      <section className="intersection-telemetry-bar" style={{ display: "flex", gap: "16px", margin: "1.5rem 0", flexWrap: "wrap" }}>
        <div className="stat-pill" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", padding: "10px 16px", borderRadius: "8px", display: "inline-flex", alignItems: "center", gap: "8px" }}>
          <Sparkles size={15} style={{ color: "#f59e0b" }} />
          <div>
            <b style={{ color: "#f8fafc", fontSize: "14px" }}>{verifiedEvents.length}</b>
            <span style={{ fontSize: "11px", color: "#cbd5e1", marginLeft: "6px" }}>Mutual Intersections</span>
          </div>
        </div>

        <div className="stat-pill" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", padding: "10px 16px", borderRadius: "8px", display: "inline-flex", alignItems: "center", gap: "8px" }}>
          <MapPin size={15} style={{ color: "#38bdf8" }} />
          <div>
            <b style={{ color: "#f8fafc", fontSize: "14px" }}>{cities.length}</b>
            <span style={{ fontSize: "11px", color: "#cbd5e1", marginLeft: "6px" }}>Theatres / Capitals</span>
          </div>
        </div>

        <div className="stat-pill" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", padding: "10px 16px", borderRadius: "8px", display: "inline-flex", alignItems: "center", gap: "8px" }}>
          <Users size={15} style={{ color: "#10b981" }} />
          <div>
            <b style={{ color: "#f8fafc", fontSize: "14px" }}>{people.length}</b>
            <span style={{ fontSize: "11px", color: "#cbd5e1", marginLeft: "6px" }}>Public Figures Filtered</span>
          </div>
        </div>
      </section>

      {/* Events List */}
      <main className="intersection-events-stream" style={{ marginTop: "24px" }}>
        {verifiedEvents.length > 0 ? (
          <div className="events-grid" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {verifiedEvents.map((evt) => {
              const eventSources = (evt.sourceIds || [])
                .map((sid) => sourcesMap.get(sid))
                .filter((s): s is NonNullable<typeof s> => Boolean(s));

              return (
                <EventCard
                  key={evt.id}
                  event={{
                    ...evt,
                    sources: eventSources,
                  }}
                  compact={false}
                />
              );
            })}
          </div>
        ) : (
          <div className="empty-copy" style={{ textAlign: "center", padding: "48px 24px", background: "rgba(0,0,0,0.2)", borderRadius: "12px", border: "1px dashed rgba(255,255,255,0.1)" }}>
            <CalendarRange size={32} style={{ margin: "0 auto 12px", opacity: 0.5, color: "#94a3b8" }} />
            <h3 style={{ color: "#f8fafc", marginBottom: "6px" }}>No mutual historical meetings indexed</h3>
            <p style={{ color: "#cbd5e1", fontSize: "13px" }}>
              No documented primary-source events were found where all {people.length} figures ({people.map((p) => p.name).join(", ")}) were simultaneously present.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
