import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  CalendarRange,
  CheckCircle2,
  CircleDashed,
  MapPin,
} from "lucide-react";
import { getPersonTimelineWithStatus, getPersonRoles, getPersonMilestones } from "@/lib/rewind";
import { PersonWorkspaceTabs } from "@/components/rewind/PersonWorkspaceTabs";
import { PersonCoverageNav } from "@/components/rewind/PersonCoverageNav";
import { InclusionBadge } from "@/components/rewind/InclusionBadge";
import { BiographicalSection } from "@/components/rewind/BiographicalSection";
import { ErrorBoundary } from "@/components/ui/error-boundary";

export default async function PersonPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!slug || !/^[a-zA-Z0-9_-]+$/.test(slug)) {
    notFound();
  }

  const { data: timelineData, error } = await getPersonTimelineWithStatus(slug);
  if (error) {
    return (
      <div className="page-shell person-page">
        <header className="page-hero">
          <span className="eyebrow">TEMPORAL PROFILE</span>
          <h1>Dossier Unavailable</h1>
          <p>The timeline records could not be retrieved from the database at this time.</p>
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
          <CalendarRange size={36} style={{ margin: "0 auto 1rem", opacity: 0.5 }} />
          <h2>Database unavailable</h2>
          <p style={{ color: "var(--text-muted, #888)", marginTop: "0.5rem" }}>
            The chronology for this figure could not be loaded. Please try again later.
          </p>
        </div>
      </div>
    );
  }
  if (!timelineData) notFound();

  const { person, events: linked, years } = timelineData;
  const cities = new Set(linked.map((e) => e.city));

  const roles = await getPersonRoles(person.slug);
  const milestones = await getPersonMilestones(person.slug);

  return (
    <div className="page-shell person-page">
      <header className="person-hero">
        <div className="person-monogram large">
          {person.name
            .split(" ")
            .map((n) => n[0])
            .slice(0, 2)
            .join("")}
        </div>
        <div className="person-hero-details">
          <span className="eyebrow">DOCUMENTED LIFE</span>
          <h1>{person.name}</h1>
          <p>{person.description}</p>
          <div className="hero-facts">
            <span>
              <CalendarRange size={14} />
              {linked.length} events
            </span>
            <span>
              <MapPin size={14} />
              {cities.size} documented places
            </span>
            <span>
              <CheckCircle2 size={14} />
              {linked.filter((e) => e.verificationStatus === "verified").length} verified
            </span>
            <span>
              <CircleDashed size={14} />
              {linked.filter((e) => e.verificationStatus !== "verified").length} provisional
            </span>
          </div>
        </div>
        <PersonCoverageNav slug={person.slug} records={linked} />
      </header>

      <InclusionBadge person={person} />

      <ErrorBoundary sectionName="Person Workspace">
        <PersonWorkspaceTabs
          person={person}
          records={linked}
          roles={roles}
          milestones={milestones}
        />
      </ErrorBoundary>

      <ErrorBoundary sectionName="Biographical Section">
        <BiographicalSection person={person} />
      </ErrorBoundary>

      <section className="coverage-section compact-coverage">
        <div className="section-heading">
          <div>
            <span className="eyebrow">JUMP TO A YEAR</span>
            <h2>Indexed coverage</h2>
          </div>
          <p>Coverage describes this edition—not every day of a life.</p>
        </div>
        <div className="year-grid">
          {years.map((y) => {
            const n = linked.filter((e) => e.startDate.startsWith(String(y))).length;
            return (
              <Link href={`/person/${slug}/${y}`} key={y}>
                <b>{y}</b>
                <span>
                  {n} event{n === 1 ? "" : "s"}
                </span>
                <i style={{ height: `${Math.min(100, 18 + n * 8)}%` }} />
                <ArrowRight size={14} />
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
