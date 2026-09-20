import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, CalendarClock, CheckCircle2, CircleDashed, ExternalLink, FileText, MapPin, UsersRound } from "lucide-react";
import { getEventBySlug, getAdjacentEvents, getSourcesByIds, formatTimelineDate, isStandardIsoDate } from "@/lib/rewind";
import { MapGraphic } from "@/components/rewind/MapGraphic";
import { EventActions } from "@/components/rewind/EventActions";
import { TemporalBadge } from "@/components/rewind/TemporalBadge";
import { ClaimInspector } from "@/components/rewind/ClaimInspector";
import { ErrorBoundary } from "@/components/ui/error-boundary";

export default async function EventPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!slug || !/^[a-zA-Z0-9_-]+$/.test(slug)) {
    notFound();
  }

  const { data: event, error } = await getEventBySlug(slug);
  if (error && !event) {
    return (
      <div className="page-shell">
        <div className="record-breadcrumb" style={{ marginBottom: "2rem" }}>
          <Link href="/events"><ArrowLeft />All events</Link>
        </div>
        <div
          className="zero-state error-state"
          role="alert"
          style={{
            padding: "4rem 2rem",
            textAlign: "center",
            border: "1px dashed var(--line, #e2e8f0)",
            borderRadius: "8px",
            margin: "2rem auto",
            maxWidth: "600px",
          }}
        >
          <h2>Event record temporarily unavailable</h2>
          <p style={{ color: "var(--muted, #64748b)", marginTop: "0.5rem" }}>
            {error}
          </p>
          <div style={{ marginTop: "1.5rem" }}>
            <Link href="/events" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", color: "var(--accent, #60a5fa)", textDecoration: "underline" }}>
              <ArrowLeft size={16} /> Return to Evidence Register
            </Link>
          </div>
        </div>
      </div>
    );
  }
  if (!event) notFound();

  // Load surrounding events and attached source details concurrently
  const sourceIds = event.sourceIds || [];
  const [{ prev, next }, validSources] = await Promise.all([
    getAdjacentEvents(event.startDate, event.id),
    sourceIds.length > 0 ? getSourcesByIds(sourceIds) : Promise.resolve([]),
  ]);

  const enrichedEvent = {
    ...event,
    sources: validSources,
  };

  const primarySource = sourceIds.length > 0
    ? (validSources.find((s) => s.id === sourceIds[0]) ?? validSources[0])
    : undefined;

  const participants = event.participants || [];

  return (
    <div className="page-shell event-page">
      <nav className="event-nav" aria-label="Chronological event pagination">
        {prev ? (
          <Link href={`/event/${prev.slug}`} className="nav-link prev" aria-label={`Previous event: ${prev.eventName}`}>
            <ArrowLeft size={16} />
            <div>
              <span className="nav-dir">PREVIOUS RECORD</span>
              <span className="nav-title">{prev.eventName}</span>
            </div>
          </Link>
        ) : (
          <div className="nav-placeholder" />
        )}

        <Link href="/events" className="nav-all">
          All Events
        </Link>

        {next ? (
          <Link href={`/event/${next.slug}`} className="nav-link next" aria-label={`Next event: ${next.eventName}`}>
            <div>
              <span className="nav-dir">NEXT RECORD</span>
              <span className="nav-title">{next.eventName}</span>
            </div>
            <ArrowRight size={16} />
          </Link>
        ) : (
          <div className="nav-placeholder" />
        )}
      </nav>

      <header className="page-hero">
        <div className="hero-top-meta">
          <div className="hero-badges">
            <span className="category-pill">{event.eventTypes?.[0] || event.categories?.[0] || "historical-action"}</span>
            <span className={`status-pill ${event.verificationStatus}`}>
              {event.verificationStatus === "verified" ? <CheckCircle2 size={13} /> : <CircleDashed size={13} />}
              {event.verificationStatus}
            </span>
          </div>
          <EventActions event={enrichedEvent} primarySource={primarySource} />
        </div>

        <time dateTime={isStandardIsoDate(event.startDate) ? event.startDate : undefined}>
          {formatTimelineDate(event.startDate, event.datePrecision, { weekday: "long", day: "numeric", month: "long", year: "numeric" }) || event.startDate}
        </time>

        <h1>{event.eventName}</h1>
        <p className="event-summary">{event.summary}</p>

        <dl className="event-kpi-bar" aria-label="Event vital attributes">
          <div>
            <dt><CalendarClock size={16} /> Date</dt>
            <dd>{event.startDate}</dd>
            <small>{event.datePrecision || "exact"}</small>
          </div>
          <div>
            <dt><MapPin size={16} /> Location</dt>
            <dd>{event.venueName || event.city}</dd>
            <small>{event.country}</small>
          </div>
          <div>
            <dt><UsersRound size={16} /> Participants</dt>
            <dd>{participants.length}</dd>
            <small>documented participants</small>
          </div>
          <div>
            <dt><FileText size={16} /> Sources</dt>
            <dd>{sourceIds.length}</dd>
            <small>attached records</small>
          </div>
        </dl>
      </header>

      <TemporalBadge event={event} />

      <section className="record-body">
        <div className="record-main">
          <ErrorBoundary sectionName="Claim Inspector">
            <ClaimInspector claims={event.claims} />
          </ErrorBoundary>

          <section>
            <span className="eyebrow">LOCATION</span>
            <h2>Documented position</h2>
            <ErrorBoundary sectionName="Map Graphic">
              <MapGraphic events={[event]} selected={event.id} />
            </ErrorBoundary>
            <p className="precision-note">
              Coordinates represent the {event.locationPrecision || "venue"} supported by the evidence.
              They are not a claim of exact movement within the surrounding period.
            </p>
          </section>

          <section>
            <span className="eyebrow">PARTICIPANTS</span>
            <h2>People in this event</h2>
            <div className="participant-list">
              {participants.map((participant) => {
                const participantSlug = participant.slug || participant.personId.replace(/^p-/, "");
                return (
                  <Link
                    href={`/person/${participantSlug}`}
                    key={participant.personId}
                  >
                  <span className="person-monogram" aria-hidden="true">
                    {participant.name
                      .split(" ")
                      .map((name) => name[0])
                      .slice(0, 2)
                      .join("")}
                  </span>
                  <div>
                    <b>{participant.name}</b>
                    <small>
                      {participant.role || "Participant"}
                      {participant.presenceConfidence ? ` · ${participant.presenceConfidence}` : ""}
                    </small>
                  </div>
                  <ArrowRight />
                </Link>
              );
            })}
            </div>
          </section>

          {event.notes && (
            <section>
              <span className="eyebrow">RESEARCH NOTE</span>
              <h2>What the source establishes</h2>
              <div className="research-note">{event.notes}</div>
            </section>
          )}
        </div>

        <aside className="evidence-rail">
          <span className="eyebrow">EVIDENCE</span>
          <h2>Source trail</h2>
          {validSources.map((source) => (
            <article key={source.id}>
              <div>
                <span>{source.classification}</span>
                <span>{source.sourceType.replaceAll("-", " ")}</span>
              </div>
              <h3>{source.title}</h3>
              <p>{source.publisher}</p>
              <dl>
                <div>
                  <dt>Language</dt>
                  <dd>{source.language || "en"}</dd>
                </div>
                <div>
                  <dt>Accessed</dt>
                  <dd>{source.accessedDate || "Archived"}</dd>
                </div>
              </dl>
              {source.url && (
                <a href={source.url} target="_blank" rel="noreferrer">
                  Open original record <ExternalLink />
                </a>
              )}
            </article>
          ))}
          <div className="confidence-box">
            <b>Why “{event.confidence || "confirmed"}”?</b>
            <p>
              {event.verificationStatus === "verified"
                ? "The event is tied to a primary or authoritative dated record."
                : "The date is plausible and sourced, but one or more details still require stronger direct evidence."}
            </p>
            <Link href="/methodology">Read the methodology <ArrowRight /></Link>
          </div>
        </aside>
      </section>

      <nav className="event-pager" aria-label="Event pagination">
        {prev ? (
          <Link href={`/event/${prev.slug}`}>
            <ArrowLeft />
            <span>
              <small>PREVIOUS</small>
              {prev.eventName}
            </span>
          </Link>
        ) : (
          <span />
        )}
        {next && (
          <Link href={`/event/${next.slug}`}>
            <span>
              <small>NEXT</small>
              {next.eventName}
            </span>
            <ArrowRight />
          </Link>
        )}
      </nav>
    </div>
  );
}
