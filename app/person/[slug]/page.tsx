import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  ArrowRight,
  Calendar,
  CalendarRange,
  CheckCircle2,
  CircleDashed,
  GitCompare,
  Globe,
  MapPin,
  Sparkles,
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
  const verifiedCount = linked.filter((e) => e.verificationStatus === "verified").length;
  const provisionalCount = linked.filter((e) => e.verificationStatus !== "verified").length;
  const verifiedPercent = linked.length > 0 ? Math.round((verifiedCount / linked.length) * 100) : 0;

  const startYear = years[0];
  const endYear = years[years.length - 1];
  const spanYearsText = startYear && endYear ? `${startYear} — ${endYear}` : "—";

  const birthYear = person.birth ? person.birth.slice(0, 4) : undefined;
  const deathYear = person.death ? person.death.slice(0, 4) : undefined;
  const lifespan = birthYear ? `${birthYear} — ${deathYear || "Present"}` : undefined;
  const nationality = person.nationality || (person.citizenship && person.citizenship[0]);

  // Compute top co-attendees from documented events
  const coCounts = new Map<string, { name: string; slug: string; role?: string; count: number }>();
  linked.forEach((e) => {
    (e.participants || []).forEach((p) => {
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

  // Compute top geographic theatres / cities
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

  return (
    <div className="page-shell person-page">
      <header className="person-hero">
        <div className="person-hero-left">
          <div className="person-monogram-container">
            <div className="person-monogram large radar-frame">
              {getMonogram(person.name)}
              <span className="radar-status-beacon" aria-hidden="true" />
            </div>
          </div>

          <div className="person-hero-details">
            <div className="person-hero-badges">
              <span className="eyebrow">
                TEMPORAL DOSSIER · {person.classification ? person.classification.toUpperCase() : "HISTORICAL FIGURE"}
              </span>
            </div>

            <h1>{person.name}</h1>

            <div className="person-hero-meta-chips">
              {lifespan && (
                <span className="hero-meta-chip">
                  <Calendar size={13} />
                  <span>{lifespan}</span>
                </span>
              )}
              {nationality && (
                <span className="hero-meta-chip">
                  <Globe size={13} />
                  <span>{nationality}</span>
                </span>
              )}
              {person.canonicalName && person.canonicalName !== person.name && (
                <span className="hero-meta-chip mono-chip">
                  <span>AKA: {person.canonicalName}</span>
                </span>
              )}
            </div>

            <p className="person-bio-lead">{person.description}</p>
          </div>
        </div>

        {/* Telemetry & Accuracy Card */}
        <aside className="person-telemetry-card" aria-label="Evidentiary telemetry and verification summary">
          <div className="telemetry-card-header">
            <div className="telemetry-header-title">
              <Sparkles size={14} className="telemetry-sparkle" />
              <span>EVIDENTIARY ACCURACY INDEX</span>
            </div>
            <span className="telemetry-pct-badge">{verifiedPercent}% VERIFIED</span>
          </div>

          <div className="telemetry-accuracy-gauge" aria-hidden="true">
            <div className="gauge-fill verified" style={{ width: `${verifiedPercent}%` }} />
            <div className="gauge-fill provisional" style={{ width: `${100 - verifiedPercent}%` }} />
          </div>

          <div className="telemetry-grid">
            <div className="telemetry-stat">
              <span className="stat-label"><CalendarRange size={13} /> EVENTS</span>
              <b className="stat-value">{linked.length}</b>
              <small className="stat-sub">{spanYearsText}</small>
            </div>

            <div className="telemetry-stat">
              <span className="stat-label"><MapPin size={13} /> PLACES</span>
              <b className="stat-value">{cities.length}</b>
              <small className="stat-sub">theatres</small>
            </div>

            <div className="telemetry-stat">
              <span className="stat-label"><CheckCircle2 size={13} /> VERIFIED</span>
              <b className="stat-value verified-color">{verifiedCount}</b>
              <small className="stat-sub">primary</small>
            </div>

            <div className="telemetry-stat">
              <span className="stat-label"><CircleDashed size={13} /> PROVISIONAL</span>
              <b className="stat-value provisional-color">{provisionalCount}</b>
              <small className="stat-sub">corroborating</small>
            </div>
          </div>

          <div className="telemetry-actions">
            <Link
              href={`/compare?a=${person.slug}`}
              className="telemetry-action-btn"
              title={`Compare ${person.name} with another historical figure`}
            >
              <GitCompare size={14} />
              <span>Compare Figure</span>
            </Link>

            <Link
              href="/people"
              className="telemetry-action-btn secondary"
              title="Return to people directory"
            >
              <Users size={14} />
              <span>Atlas Roster</span>
            </Link>
          </div>
        </aside>
      </header>

      {/* Relational Nexus Strip */}
      {(topCoAttendees.length > 0 || topCities.length > 0) && (
        <section className="person-relational-nexus" aria-label="Relational Nexus & Theatres">
          <div className="nexus-container">
            {topCoAttendees.length > 0 && (
              <div className="nexus-group">
                <div className="nexus-label">
                  <Users size={13} />
                  <span>DOCUMENTED COUNTERPARTS & CO-ATTENDEES</span>
                </div>
                <div className="nexus-co-list">
                  {topCoAttendees.map((co) => (
                    <Link
                      key={co.slug}
                      href={`/relationship/${person.slug}/${co.slug}`}
                      className="nexus-co-chip"
                      title={`View joint timeline with ${co.name} (${co.count} mutual events)`}
                    >
                      <span className="nexus-avatar">{getMonogram(co.name)}</span>
                      <span className="nexus-co-name">{co.name}</span>
                      <span className="nexus-co-count">{co.count} evts</span>
                      <ArrowRight size={11} className="nexus-co-arrow" />
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {topCities.length > 0 && (
              <div className="nexus-group">
                <div className="nexus-label">
                  <MapPin size={13} />
                  <span>PRIMARY HISTORICAL THEATRES</span>
                </div>
                <div className="nexus-theatres-list">
                  {topCities.map(([city, count]) => (
                    <span key={city} className="nexus-theatre-chip">
                      <b>{city}</b>
                      <small>{count} evt{count === 1 ? "" : "s"}</small>
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
