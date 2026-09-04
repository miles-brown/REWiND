"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeftRight, ArrowRight, Calendar, CheckCircle2, CircleDashed, ExternalLink, MapPin, Sparkles, Users } from "lucide-react";
import type { EventRecord, PersonRecord, SourceRecord } from "@/lib/rewind";
import { MapGraphic } from "./MapGraphic";
import { EventCard } from "./EventCard";

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
  const [slugB, setSlugB] = useState(initialPersonB);
  const [activeTab, setActiveTab] = useState<"intersections" | "sideBySide">("intersections");

  const sourceMap = useMemo(() => new Map(sources.map((s) => [s.id, s])), [sources]);
  const sourceById = (id?: string) => (id ? sourceMap.get(id) : undefined);

  const personA = people.find((p) => p.slug === slugA) || people[0];
  const personB = people.find((p) => p.slug === slugB) || people[1] || people[0];

  const eventsA = useMemo(
    () =>
      events
        .filter((e) => e.participants.some((p) => p.personId === personA?.id))
        .sort((a, b) => a.startDate.localeCompare(b.startDate)),
    [events, personA]
  );

  const eventsB = useMemo(
    () =>
      events
        .filter((e) => e.participants.some((p) => p.personId === personB?.id))
        .sort((a, b) => a.startDate.localeCompare(b.startDate)),
    [events, personB]
  );

  const intersections = useMemo(
    () =>
      events
        .filter(
          (e) =>
            e.participants.some((p) => p.personId === personA?.id) &&
            e.participants.some((p) => p.personId === personB?.id)
        )
        .sort((a, b) => a.startDate.localeCompare(b.startDate)),
    [events, personA, personB]
  );

  const sharedCities = useMemo(() => {
    const citiesA = new Set(eventsA.map((e) => e.city));
    const citiesB = new Set(eventsB.map((e) => e.city));
    return Array.from(citiesA).filter((c) => citiesB.has(c));
  }, [eventsA, eventsB]);

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
      {/* Selector Toolbar */}
      <div className="comparison-toolbar">
        <div className="selector-group">
          <label>
            <span className="selector-label">Figure 1</span>
            <select value={slugA} onChange={(e) => setSlugA(e.target.value)}>
              {people.map((p) => (
                <option key={p.id} value={p.slug} disabled={p.slug === slugB}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <button
          className="swap-btn"
          onClick={() => {
            const temp = slugA;
            setSlugA(slugB);
            setSlugB(temp);
          }}
          aria-label="Swap compared figures"
        >
          <ArrowLeftRight size={16} />
        </button>

        <div className="selector-group">
          <label>
            <span className="selector-label">Figure 2</span>
            <select value={slugB} onChange={(e) => setSlugB(e.target.value)}>
              {people.map((p) => (
                <option key={p.id} value={p.slug} disabled={p.slug === slugA}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {/* Comparison Metrics Banner */}
      <div className="comparison-metrics-grid">
        <div className="metric-card highlight">
          <div className="metric-icon"><Sparkles size={18} /></div>
          <div>
            <b>{intersections.length}</b>
            <small>Direct Historical Encounters</small>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon"><MapPin size={18} /></div>
          <div>
            <b>{sharedCities.length}</b>
            <small>Mutual Documented Cities</small>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon"><CheckCircle2 size={18} /></div>
          <div>
            <b>{intersections.filter((e) => e.verificationStatus === "verified").length}</b>
            <small>Verified Primary Records</small>
          </div>
        </div>
      </div>

      {/* Mode Tabs */}
      <div className="comparison-mode-tabs">
        <button
          className={`comp-tab ${activeTab === "intersections" ? "active" : ""}`}
          onClick={() => setActiveTab("intersections")}
        >
          <Users size={15} />
          <span>Intersections & Shared Venues ({intersections.length})</span>
        </button>
        <button
          className={`comp-tab ${activeTab === "sideBySide" ? "active" : ""}`}
          onClick={() => setActiveTab("sideBySide")}
        >
          <Calendar size={15} />
          <span>Synchronized Timeline ({eventsA.length} vs {eventsB.length})</span>
        </button>
      </div>

      {/* Tab 1: Intersections & Map */}
      {activeTab === "intersections" && (
        <div className="intersections-view">
          {intersections.length > 0 ? (
            <>
              <div className="intersection-map-section">
                <div className="section-header">
                  <span className="eyebrow">GEOSPATIAL ENCOUNTERS</span>
                  <h3>Where {personA.name} and {personB.name} crossed paths</h3>
                </div>
                <MapGraphic events={intersections} />
              </div>

              <div className="intersection-timeline-stream">
                <div className="section-header">
                  <span className="eyebrow">CHRONOLOGICAL RECORD</span>
                  <h3>Documented Joint Appearances</h3>
                </div>
                <div className="encounter-cards-list">
                  {intersections.map((event) => {
                    const source = event.sources?.[0] || sourceById(event.sourceIds?.[0]);
                    return (
                      <article key={event.id} className="encounter-card">
                        <div className="encounter-card-header">
                          <time>{new Date(event.startDate + "T12:00:00").toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</time>
                          <span className={`status ${event.verificationStatus}`}>
                            {event.verificationStatus === "verified" ? <CheckCircle2 size={12} /> : <CircleDashed size={12} />}
                            {event.verificationStatus}
                          </span>
                        </div>
                        <h4>{event.eventName}</h4>
                        <p className="encounter-place"><MapPin size={13} /> {event.venueName || event.city}, {event.country}</p>
                        <p className="encounter-summary">{event.summary}</p>
                        {source && (
                          <div className="encounter-source">
                            <small>Source: {source.publisher} — <i>{source.title}</i></small>
                            <a href={source.url} target="_blank" rel="noreferrer"><ExternalLink size={12} /></a>
                          </div>
                        )}
                        <Link className="primary-link" href={`/event/${event.slug}`}>
                          Open full record <ArrowRight size={13} />
                        </Link>
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
                No single indexed event currently lists both {personA.name} and {personB.name} as verified co-participants.
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
              <span className="person-monogram">{personA.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}</span>
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
              <span className="person-monogram">{personB.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}</span>
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
    </div>
  );
}
