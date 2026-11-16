import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  ArrowRight,
  Calendar,
  CalendarRange,
  GitCompare,
  Globe,
  MapPin,
  Users,
} from "lucide-react";
import { getPersonTimelineWithStatus, getPersonRoles, getPersonMilestones, getMonogram } from "@/lib/rewind";
import { PersonWorkspaceTabs } from "@/components/rewind/PersonWorkspaceTabs";
import { ErrorBoundary } from "@/components/ui/error-boundary";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  if (!slug || !/^[a-zA-Z0-9_-]+$/.test(slug)) {
    return { title: "Person Not Found — REWIND Evidence Atlas" };
  }
  const { data } = await getPersonTimelineWithStatus(slug);
  if (!data) return { title: "Person Dossier — REWIND Evidence Atlas" };
  return {
    title: `${data.person.name} — Temporal Evidence Dossier | REWIND`,
    description: data.person.description || `Chronological evidentiary record and historical movements of ${data.person.name}.`,
  };
}

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
  const cities = Array.from(new Set(linked.map((e) => e.city).filter(Boolean)));
  const hasChronology = linked.length > 0;

  const startYear = years[0];
  const endYear = years[years.length - 1];
  const spanYearsText = startYear && endYear ? `${startYear}–${endYear}` : "Profile indexed";

  const birthYear = person.birth ? person.birth.slice(0, 4) : undefined;
  const deathYear = person.death ? person.death.slice(0, 4) : undefined;
  const lifespan = birthYear ? `${birthYear}–${deathYear || "Present"}` : undefined;
  const nationality = person.nationality || (person.citizenship && person.citizenship[0]);
  const classificationLabel = person.classification
    ? person.classification.replace(/-/g, " ").toUpperCase()
    : "HISTORICAL FIGURE";

  // Compute top co-attendees from documented events
  const coCounts = new Map<string, { name: string; slug: string; role?: string; count: number }>();
  linked.forEach((e) => {
    (e.participants || []).forEach((p) => {
      if (p.personId === person.id || p.personId === person.slug) return;
      const pSlug = p.slug || (p.personId ? p.personId.replace(/^p-/, "") : "");
      if (pSlug && pSlug !== person.slug && pSlug !== person.id) {
        const existing = coCounts.get(pSlug) || { name: p.name, slug: pSlug, role: p.role, count: 0 };
        existing.count += 1;
        coCounts.set(pSlug, existing);
      }
    });
  });
  const topCoAttendees = Array.from(coCounts.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 4);

  // Compute top geographic locations / cities
  const cityCounts = new Map<string, number>();
  linked.forEach((e) => {
    if (e.city) {
      cityCounts.set(e.city, (cityCounts.get(e.city) || 0) + 1);
    }
  });
  const topCities = Array.from(cityCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  const roles = await getPersonRoles(person.slug);
  const milestones = await getPersonMilestones(person.slug);
  const rolesCount = roles.length || person.career?.length || 0;
  const milestonesCount = (milestones.length || 0) + (person.awards?.length || 0);

  return (
    <div className="page-shell person-page">
      <header className="person-hero">
        <div className="person-hero-left">
          <div className="person-monogram-container">
            <div className="person-monogram large radar-frame">
              {getMonogram(person.name)}
            </div>
          </div>

          <div className="person-hero-details">
            <div className="person-hero-badges">
              <span className="eyebrow">
                {classificationLabel}
              </span>
            </div>

            <h1>{person.name}</h1>

            <div className="person-hero-meta-chips">
              {lifespan && (
                <span className="hero-meta-chip">
                  <Calendar size={13} aria-hidden="true" />
                  <span>{lifespan}</span>
                </span>
              )}
              {nationality && (
                <span className="hero-meta-chip">
                  <Globe size={13} aria-hidden="true" />
                  <span>{nationality}</span>
                </span>
              )}
              {person.canonicalName && person.canonicalName !== person.name && (
                <span className="hero-meta-chip">
                  <span>Full name: {person.canonicalName}</span>
                </span>
              )}
            </div>

            <p className="person-bio-lead">{person.description}</p>
          </div>
        </div>

        {/* Record Summary Card */}
        <aside className="person-telemetry-card" aria-label="Record summary">
          <div className="telemetry-card-header">
            <span className="telemetry-header-title">Record Summary</span>
            <span className="telemetry-pct-badge">
              {hasChronology ? spanYearsText : "Profile indexed"}
            </span>
          </div>

          <div className="telemetry-grid">
            <div className="telemetry-stat">
              <b className="stat-value">{linked.length}</b>
              <span className="stat-label">Timeline Events</span>
            </div>

            <div className="telemetry-stat">
              <b className="stat-value">{cities.length}</b>
              <span className="stat-label">Locations</span>
            </div>

            <div className="telemetry-stat">
              <b className="stat-value">{rolesCount}</b>
              <span className="stat-label">Official Roles</span>
            </div>

            <div className="telemetry-stat">
              <b className="stat-value">{milestonesCount}</b>
              <span className="stat-label">Milestones</span>
            </div>
          </div>

          <div className="telemetry-actions">
            <Link
              href={`/compare?a=${person.slug}`}
              className="telemetry-action-btn"
              title={`Compare ${person.name} with another historical figure`}
            >
              <GitCompare size={14} aria-hidden="true" />
              <span>Compare Timeline</span>
            </Link>

            <Link
              href="/people"
              className="telemetry-action-btn secondary"
              title="Return to people directory"
            >
              <Users size={14} aria-hidden="true" />
              <span>All People</span>
            </Link>
          </div>
        </aside>
      </header>

      {/* Frequent Counterparts & Key Locations Strip */}
      {(topCoAttendees.length > 0 || topCities.length > 0) && (
        <section className="person-relational-nexus" aria-label="Frequent counterparts and key locations">
          <div className="nexus-container">
            {topCoAttendees.length > 0 && (
              <div className="nexus-group">
                <div className="nexus-label">
                  <Users size={13} aria-hidden="true" />
                  <span>Frequent Counterparts</span>
                </div>
                <div className="nexus-co-list">
                  {topCoAttendees.map((co) => (
                    <Link
                      key={co.slug}
                      href={`/relationship/${person.slug}/${co.slug}`}
                      className="nexus-co-chip"
                      title={`View shared timeline with ${co.name} (${co.count} shared ${co.count === 1 ? "event" : "events"})`}
                    >
                      <span className="nexus-avatar">{getMonogram(co.name)}</span>
                      <span className="nexus-co-name">{co.name}</span>
                      <span className="nexus-co-count">
                        {co.count} {co.count === 1 ? "event" : "events"}
                      </span>
                      <ArrowRight size={11} className="nexus-co-arrow" aria-hidden="true" />
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {topCities.length > 0 && (
              <div className="nexus-group">
                <div className="nexus-label">
                  <MapPin size={13} aria-hidden="true" />
                  <span>Key Locations</span>
                </div>
                <div className="nexus-theatres-list">
                  {topCities.map(([city, count]) => (
                    <span key={city} className="nexus-theatre-chip">
                      <b>{city}</b>
                      <small>{count} {count === 1 ? "event" : "events"}</small>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Unified Person Workspace */}
      <main className="person-content-body">
        <ErrorBoundary sectionName="Person Workspace">
          <PersonWorkspaceTabs
            person={person}
            records={linked}
            roles={roles}
            milestones={milestones}
            years={years}
          />
        </ErrorBoundary>
      </main>
    </div>
  );
}
