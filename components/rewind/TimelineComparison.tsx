"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeftRight,
  ArrowRight,
  Calendar,
  CheckCircle2,
  ChevronDown,
  CircleDashed,
  ExternalLink,
  MapPin,
  Quote,
  Search,
  Sparkles,
  Users,
} from "lucide-react";
import type { EventRecord, PersonRecord, SourceRecord } from "@/lib/rewind";
import { MapGraphic } from "./MapGraphic";
import { EventCard } from "./EventCard";

function isParticipantMatch(p: { personId: string }, person?: PersonRecord): boolean {
  if (!person) return false;
  return p.personId === person.id || p.personId === person.slug;
}

function formatDate(dateStr: string): string {
  try {
    const parts = dateStr.split("T")[0].split("-");
    if (parts.length === 3) {
      const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
      return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
    }
    if (parts.length === 2) {
      const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, 1);
      return d.toLocaleDateString("en-GB", { month: "short", year: "numeric" });
    }
    return parts[0] || dateStr;
  } catch {
    return dateStr;
  }
}

export function TimelineComparison({
  initialPersonA = "benjamin-netanyahu",
  initialPersonB = "bill-clinton",
  people = [],
  events = [],
  sources = [],
}: {
  initialPersonA?: string;
  initialPersonB?: string;
  people?: PersonRecord[];
  events?: EventRecord[];
  sources?: SourceRecord[];
}) {
  const [slugA, setSlugA] = useState(initialPersonA);
  const [explicitSlugB, setExplicitSlugB] = useState<string | undefined>(initialPersonB);
  const [activeTab, setActiveTab] = useState<"intersections" | "sideBySide">("intersections");
  const [searchQuery, setSearchQuery] = useState("");

  const sourceMap = useMemo(() => new Map(sources.map((s) => [s.id, s])), [sources]);
  const sourceById = (id?: string) => (id ? sourceMap.get(id) : undefined);

  // Pre-index people by both ID and slug for O(1) lookups (Forensic Performance optimization)
  const peopleMap = useMemo(() => {
    const map = new Map<string, PersonRecord>();
    people.forEach((p) => {
      if (p.id) map.set(p.id, p);
      if (p.slug) map.set(p.slug, p);
    });
    return map;
  }, [people]);

  const personA = useMemo(
    () => peopleMap.get(slugA) || people.find((p) => p.slug === slugA),
    [peopleMap, people, slugA]
  );

  // Calculate co-attendees for Person A: figures who share at least 1 event with Person A
  const coAttendeesWithCounts = useMemo(() => {
    if (!personA) return [];

    const eventsWithA = events.filter((e) =>
      (e.participants || []).some((p) => isParticipantMatch(p, personA))
    );

    const counts = new Map<string, number>();

    eventsWithA.forEach((e) => {
      (e.participants || []).forEach((p) => {
        if (!isParticipantMatch(p, personA)) {
          const match = peopleMap.get(p.personId);
          if (match) {
            counts.set(match.slug, (counts.get(match.slug) || 0) + 1);
          }
        }
      });
    });

    return Array.from(counts.entries())
      .map(([slug, count]) => {
        const person = peopleMap.get(slug);
        return person ? { person, count } : null;
      })
      .filter((item): item is { person: PersonRecord; count: number } => item !== null)
      .sort((a, b) => b.count - a.count);
  }, [events, peopleMap, personA]);

  // Derive effective Person B: prioritize explicit user selection if still valid, otherwise default to top co-attendee
  const slugB = useMemo(() => {
    if (coAttendeesWithCounts.length === 0) return "";
    if (explicitSlugB && coAttendeesWithCounts.some((item) => item.person.slug === explicitSlugB)) {
      return explicitSlugB;
    }
    return coAttendeesWithCounts[0].person.slug;
  }, [coAttendeesWithCounts, explicitSlugB]);

  const personB = useMemo(
    () => (slugB ? peopleMap.get(slugB) || people.find((p) => p.slug === slugB) : undefined),
    [peopleMap, people, slugB]
  );

  const eventsA = useMemo(
    () =>
      personA
        ? events
            .filter((e) => (e.participants || []).some((p) => isParticipantMatch(p, personA)))
            .sort((a, b) => a.startDate.localeCompare(b.startDate))
        : [],
    [events, personA]
  );

  const eventsB = useMemo(
    () =>
      personB
        ? events
            .filter((e) => (e.participants || []).some((p) => isParticipantMatch(p, personB)))
            .sort((a, b) => a.startDate.localeCompare(b.startDate))
        : [],
    [events, personB]
  );

  // All shared events both figures attended
  const intersections = useMemo(
    () =>
      personA && personB
        ? events
            .filter(
              (e) =>
                (e.participants || []).some((p) => isParticipantMatch(p, personA)) &&
                (e.participants || []).some((p) => isParticipantMatch(p, personB))
            )
            .sort((a, b) => a.startDate.localeCompare(b.startDate))
        : [],
    [events, personA, personB]
  );

  const filteredIntersections = useMemo(() => {
    if (!searchQuery.trim()) return intersections;
    const term = searchQuery.toLowerCase().trim();
    return intersections.filter(
      (e) =>
        e.eventName.toLowerCase().includes(term) ||
        e.summary.toLowerCase().includes(term) ||
        e.city.toLowerCase().includes(term) ||
        (e.venueName && e.venueName.toLowerCase().includes(term))
    );
  }, [intersections, searchQuery]);

  const sharedCities = useMemo(() => {
    const citiesA = new Set(eventsA.map((e) => e.city));
    const citiesB = new Set(eventsB.map((e) => e.city));
    return Array.from(citiesA).filter((c) => citiesB.has(c));
  }, [eventsA, eventsB]);

  // Date range of intersections
  const timeSpan = useMemo(() => {
    if (intersections.length === 0) return null;
    const start = intersections[0].startDate.slice(0, 4);
    const end = intersections[intersections.length - 1].startDate.slice(0, 4);
    return start === end ? start : `${start} – ${end}`;
  }, [intersections]);

  // Candidate leaders with rich co-attendance records for empty state cycling (Forensic UX enhancement)
  const recommendedLeaders = useMemo(() => {
    if (!people.length) return [];
    return people
      .filter((p) => p.slug !== slugA)
      .map((p) => {
        const pEvents = events.filter((e) =>
          (e.participants || []).some((part) => isParticipantMatch(part, p))
        );
        const coCount = events.filter(
          (e) =>
            (e.participants || []).some((part) => isParticipantMatch(part, p)) &&
            (e.participants || []).length > 1
        ).length;
        return { person: p, eventCount: pEvents.length, coCount };
      })
      .sort((a, b) => b.coCount - a.coCount || b.eventCount - a.eventCount);
  }, [events, people, slugA]);

  const topRecommendedLeader = recommendedLeaders[0]?.person;

  if (people.length === 0) {
    return (
      <div className="zero-state" style={{ padding: "4rem 2rem", textAlign: "center" }}>
        <Users size={32} style={{ margin: "0 auto 1rem auto", opacity: 0.6 }} />
        <h2>No Figures Recorded</h2>
        <p>The evidence atlas database does not currently contain documented historical figures for comparison.</p>
      </div>
    );
  }

  return (
    <div className="comparison-workspace">
      {/* Dynamic Comparison Control Console */}
      <section className="comparison-console" aria-label="Comparison controls">
        <div className="comparison-selectors">
          {/* Selector 1: Primary Figure */}
          <div className="selector-card">
            <div className="selector-header">
              <label htmlFor="figure-1-select" className="selector-label">
                Figure 1 (Primary Anchor)
              </label>
              {personA && (
                <span className="selector-badge">{eventsA.length} indexed events</span>
              )}
            </div>
            <div className="selector-input-wrapper">
              <select
                id="figure-1-select"
                className="selector-select"
                value={slugA}
                onChange={(e) => {
                  setSlugA(e.target.value);
                  setExplicitSlugB(undefined);
                }}
              >
                {people.map((p) => (
                  <option key={p.id || p.slug} value={p.slug}>
                    {p.name}
                  </option>
                ))}
              </select>
              <ChevronDown size={16} className="selector-chevron" />
            </div>
          </div>

          {/* Swap button */}
          <div className="comparison-swap-container">
            <button
              className="swap-btn"
              type="button"
              onClick={() => {
                if (personB) {
                  const prevA = slugA;
                  setSlugA(slugB);
                  setExplicitSlugB(prevA);
                }
              }}
              disabled={!personB}
              aria-label="Swap compared figures"
              title="Swap primary and co-attendee figures"
            >
              <ArrowLeftRight size={18} />
            </button>
          </div>

          {/* Selector 2: Filtered Co-Attendees Only */}
          <div className="selector-card">
            <div className="selector-header">
              <label htmlFor="figure-2-select" className="selector-label">
                Figure 2 (Co-Attendee)
              </label>
              <span className="selector-badge">
                {coAttendeesWithCounts.length} shared co-attendee
                {coAttendeesWithCounts.length === 1 ? "" : "s"}
              </span>
            </div>
            <div className="selector-input-wrapper">
              <select
                id="figure-2-select"
                className="selector-select"
                value={slugB}
                onChange={(e) => setExplicitSlugB(e.target.value)}
                disabled={coAttendeesWithCounts.length === 0}
              >
                {coAttendeesWithCounts.length > 0 ? (
                  coAttendeesWithCounts.map((item) => (
                    <option key={item.person.slug} value={item.person.slug}>
                      {item.person.name} ({item.count} shared event
                      {item.count === 1 ? "" : "s"})
                    </option>
                  ))
                ) : (
                  <option value="" disabled>
                    No documented co-attendees
                  </option>
                )}
              </select>
              <ChevronDown size={16} className="selector-chevron" />
            </div>
          </div>
        </div>

        {/* Quick Co-Attendee Pill Selector Strip */}
        {coAttendeesWithCounts.length > 0 && (
          <div className="coattendees-strip" role="group" aria-label="Frequent co-attendees">
            <span className="coattendees-title">
              <Users size={12} /> Top Intersections with {personA?.name}:
            </span>
            {coAttendeesWithCounts.slice(0, 7).map((item) => (
              <button
                key={item.person.slug}
                type="button"
                className={`coattendee-pill ${slugB === item.person.slug ? "active" : ""}`}
                onClick={() => setExplicitSlugB(item.person.slug)}
                aria-pressed={slugB === item.person.slug}
              >
                <span>{item.person.name}</span>
                <span className="pill-count">{item.count}</span>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* When co-attendees exist and both distinct figures are selected */}
      {personA && personB && personA.id !== personB.id && personA.slug !== personB.slug && (
        <>
          {/* Comparison Metrics Banner */}
          <div className="comparison-metrics-grid" role="region" aria-label="Comparison metrics">
            <div className="metric-card highlight">
              <div className="metric-icon">
                <Sparkles size={20} />
              </div>
              <div>
                <b>{intersections.length}</b>
                <small>Joint Historical Encounters</small>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon">
                <Calendar size={20} />
              </div>
              <div>
                <b>{timeSpan || "—"}</b>
                <small>Documented Era of Interaction</small>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon">
                <MapPin size={20} />
              </div>
              <div>
                <b>{sharedCities.length}</b>
                <small>Mutual Documented Cities</small>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon">
                <CheckCircle2 size={20} />
              </div>
              <div>
                <b>{intersections.filter((e) => e.verificationStatus === "verified").length}</b>
                <small>Verified Primary Records</small>
              </div>
            </div>
          </div>

          {/* Mode Tabs */}
          <div className="comparison-mode-tabs" role="tablist">
            <button
              role="tab"
              aria-selected={activeTab === "intersections"}
              className={`comp-tab ${activeTab === "intersections" ? "active" : ""}`}
              onClick={() => setActiveTab("intersections")}
            >
              <Users size={15} />
              <span>Shared Joint Chronology ({intersections.length})</span>
            </button>
            <button
              role="tab"
              aria-selected={activeTab === "sideBySide"}
              className={`comp-tab ${activeTab === "sideBySide" ? "active" : ""}`}
              onClick={() => setActiveTab("sideBySide")}
            >
              <Calendar size={15} />
              <span>Side-by-Side Dual Chronology ({eventsA.length} vs {eventsB.length})</span>
            </button>
          </div>

          {/* Tab 1: Dedicated Shared Timeline & Map */}
          {activeTab === "intersections" && (
            <div className="intersections-view">
              {intersections.length > 0 ? (
                <>
                  {/* Geospatial Map Section */}
                  <div className="intersection-map-section">
                    <div className="section-header">
                      <span className="eyebrow">GEOSPATIAL FOOTPRINT</span>
                      <h3>Meeting Locations Across the Globe</h3>
                      <p>
                        Verified venues and diplomatic sites where {personA.name} and {personB.name} crossed paths.
                      </p>
                    </div>
                    <MapGraphic events={intersections} />
                  </div>

                  {/* Shared Timeline Chronology */}
                  <div className="intersection-timeline-stream">
                    <div className="section-header">
                      <span className="eyebrow">SHARED TIMELINE</span>
                      <h3>
                        All Events Attended by Both {personA.name} and {personB.name} ({intersections.length})
                      </h3>
                      <p>
                        Chronological record of summits, bilateral meetings, signing ceremonies, and joint appearances.
                      </p>
                    </div>

                    {/* Fast Filter Bar */}
                    {intersections.length > 3 && (
                      <div className="filter-bar" style={{ position: "static", marginBottom: "16px" }}>
                        <label className="query-box" style={{ background: "#ffffff" }}>
                          <Search size={16} />
                          <span className="sr-only">Filter shared encounters</span>
                          <input
                            type="text"
                            placeholder="Filter by title, venue or city..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                          />
                        </label>
                      </div>
                    )}

                    {/* Shared Encounter Cards */}
                    <div className="encounter-cards-list" role="feed" aria-label="Shared chronological encounters">
                      {filteredIntersections.map((event) => {
                        const source = event.sources?.[0] || sourceById(event.sourceIds?.[0]);
                        const participantA = (event.participants || []).find((p) => isParticipantMatch(p, personA));
                        const participantB = (event.participants || []).find((p) => isParticipantMatch(p, personB));
                        const otherParticipants = (event.participants || []).filter(
                          (p) => !isParticipantMatch(p, personA) && !isParticipantMatch(p, personB)
                        );

                        return (
                          <article key={event.id} className="encounter-card">
                            <div className="encounter-card-header">
                              <span
                                className="encounter-date-pill"
                                title={`Temporal precision: ${event.timePrecision || event.datePrecision || "exact-day"}`}
                              >
                                <Calendar size={13} />
                                <time dateTime={event.startDate}>{formatDate(event.startDate)}</time>
                              </span>

                              <span
                                className={`status ${event.verificationStatus || "verified"}`}
                                title={`Verification: ${event.verificationStatus || "verified"} · Confidence: ${event.confidence || "confirmed"} · ${event.timePrecision || event.datePrecision || "exact-day"} precision`}
                              >
                                {event.verificationStatus === "verified" ? (
                                  <CheckCircle2 size={12} />
                                ) : (
                                  <CircleDashed size={12} />
                                )}
                                {event.verificationStatus || "verified"}
                              </span>
                            </div>

                            <h4>{event.eventName}</h4>

                            <p className="encounter-place">
                              <MapPin size={14} />
                              <span>{event.venueName || event.city}, {event.country}</span>
                            </p>

                            <p className="encounter-summary">{event.summary}</p>

                            {/* Participant Roles Row */}
                            <div className="encounter-participants-row">
                              {participantA && (
                                <span className="participant-tag highlight-a">
                                  <strong>{personA.name}</strong>
                                  {participantA.role && <span>({participantA.role})</span>}
                                </span>
                              )}
                              {participantB && (
                                <span className="participant-tag highlight-b">
                                  <strong>{personB.name}</strong>
                                  {participantB.role && <span>({participantB.role})</span>}
                                </span>
                              )}
                              {otherParticipants.slice(0, 3).map((p) => (
                                <span key={p.personId || p.name} className="participant-tag">
                                  {p.name}
                                </span>
                              ))}
                              {otherParticipants.length > 3 && (
                                <span className="participant-tag">
                                  +{otherParticipants.length - 3} others
                                </span>
                              )}
                            </div>

                            {/* Embedded Quotes if present */}
                            {event.quotes && event.quotes.length > 0 && (
                              <div
                                style={{
                                  background: "#f8fafc",
                                  borderLeft: "3px solid #f59e0b",
                                  padding: "10px 14px",
                                  borderRadius: "0 8px 8px 0",
                                  fontSize: "13px",
                                  color: "#334155",
                                  fontStyle: "italic",
                                  display: "flex",
                                  gap: "8px",
                                }}
                              >
                                <Quote size={16} style={{ flexShrink: 0, color: "#f59e0b" }} />
                                <div>
                                  <span>“{event.quotes[0].text}”</span>
                                  <small style={{ display: "block", marginTop: "4px", fontStyle: "normal", color: "#475569" }}>
                                    — {event.quotes[0].speaker}
                                  </small>
                                </div>
                              </div>
                            )}

                            {/* Primary Source Citation */}
                            {source && (
                              <div className="encounter-source">
                                <span>
                                  Primary Source: <strong>{source.publisher}</strong> — <i>{source.title}</i>
                                </span>
                                {source.url && (
                                  <a href={source.url} target="_blank" rel="noopener noreferrer">
                                    <span>Primary record</span>
                                    <ExternalLink size={12} />
                                  </a>
                                )}
                              </div>
                            )}

                            <div className="encounter-footer">
                              <Link className="primary-link" href={`/event/${event.slug}`}>
                                <span>Inspect full forensic dossier</span>
                                <ArrowRight size={14} />
                              </Link>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  </div>
                </>
              ) : (
                <div className="zero-state">
                  <Users size={32} />
                  <h2>No Direct Shared Records in Current Index</h2>
                  <p>
                    No indexed events currently document both {personA.name} and {personB.name} as co-participants.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Side-by-Side Dual Chronology */}
          {activeTab === "sideBySide" && (
            <div className="side-by-side-grid">
              <div className="figure-column">
                <div className="column-header">
                  <span className="person-monogram">
                    {personA.name
                      .split(" ")
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join("")}
                  </span>
                  <div>
                    <b>{personA.name}</b>
                    <small>{eventsA.length} documented events</small>
                  </div>
                </div>
                <div className="column-stream">
                  {eventsA.map((evt) => (
                    <EventCard key={evt.id} event={evt} compact />
                  ))}
                </div>
              </div>

              <div className="figure-column">
                <div className="column-header">
                  <span className="person-monogram">
                    {personB.name
                      .split(" ")
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join("")}
                  </span>
                  <div>
                    <b>{personB.name}</b>
                    <small>{eventsB.length} documented events</small>
                  </div>
                </div>
                <div className="column-stream">
                  {eventsB.map((evt) => (
                    <EventCard key={evt.id} event={evt} compact />
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* If Person A has no co-attendees at all */}
      {personA && coAttendeesWithCounts.length === 0 && (
        <div className="comparison-zero-state" role="region" aria-label="No joint encounters indexed">
          <div className="comparison-zero-icon">
            <Users size={28} />
          </div>
          <h2>No Joint Encounters Indexed for {personA.name}</h2>
          <p>
            The current evidence atlas does not list any verified co-appearances for {personA.name} with other indexed figures. Switch to another historical leader with rich bilateral encounters:
          </p>

          <div className="comparison-zero-cta-group">
            {topRecommendedLeader && (
              <button
                type="button"
                className="comparison-primary-switch-btn"
                onClick={() => {
                  setSlugA(topRecommendedLeader.slug);
                  setExplicitSlugB(undefined);
                }}
                aria-label={`Switch to ${topRecommendedLeader.name} (${recommendedLeaders[0].coCount} joint encounters)`}
              >
                <Sparkles size={16} />
                <span>Switch to {topRecommendedLeader.name}</span>
                <span className="cta-badge">{recommendedLeaders[0].coCount} joint encounters</span>
                <ArrowRight size={16} />
              </button>
            )}

            <div className="comparison-cycle-grid" role="group" aria-label="Other historical figures with documented bilateral encounters">
              {recommendedLeaders.slice(0, 4).map((item) => (
                <button
                  key={item.person.slug}
                  type="button"
                  className="comparison-cycle-card"
                  onClick={() => {
                    setSlugA(item.person.slug);
                    setExplicitSlugB(undefined);
                  }}
                  aria-label={`Select ${item.person.name} with ${item.coCount} joint encounters`}
                >
                  <span className="person-monogram">
                    {item.person.name
                      .split(" ")
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join("")}
                  </span>
                  <div>
                    <b>{item.person.name}</b>
                    <small>{item.coCount} joint encounters</small>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
