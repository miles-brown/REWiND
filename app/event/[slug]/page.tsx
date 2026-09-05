import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, CalendarClock, CheckCircle2, CircleDashed, ExternalLink, FileText, MapPin, UsersRound } from "lucide-react";
import { getEventBySlug, getAdjacentEvents, getSourcesByIds, formatIsoDate } from "@/lib/rewind";
import { MapGraphic } from "@/components/rewind/MapGraphic";
import { EventActions } from "@/components/rewind/EventActions";

export default async function EventPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) notFound();

  // Load surrounding events for chronological navigation
  const { prev, next } = await getAdjacentEvents(event.startDate, event.id);

  // Load attached source details in a single batched query
  const sourceIds = event.sourceIds || [];
  const validSources = sourceIds.length > 0
    ? await getSourcesByIds(sourceIds)
    : [];

  const participants = event.participants || [];

  return (
    <div className="record-page">
      <div className="record-breadcrumb">
        <Link href="/events"><ArrowLeft />All events</Link>
        <span>{event.id}</span>
      </div>

      <header className="record-hero">
        <div>
          <div className={`evidence-pill ${event.verificationStatus}`}>
            {event.verificationStatus === "verified" ? <CheckCircle2 /> : <CircleDashed />}
            {event.verificationStatus} evidence
          </div>
          <time>
            {formatIsoDate(event.startDate, { weekday: "long", day: "numeric", month: "long", year: "numeric" }) || event.startDate}
          </time>
          <h1>{event.eventName}</h1>
          <p>{event.summary}</p>
          <div className="detail-tags">
            {(event.eventTypes?.length ? event.eventTypes : (event.categories ?? [])).map((type) => (
              <span key={type}>{type}</span>
            ))}
          </div>
          <EventActions event={event} />
        </div>
        <dl className="record-vitals">
          <div>
            <dt><CalendarClock />Time</dt>
            <dd>{event.localStartTime || "Not established"}</dd>
            <small>{event.timePrecision || event.datePrecision || "exact-day"} precision</small>
          </div>
          <div>
            <dt><MapPin />Place</dt>
            <dd>{event.venueName || event.city}</dd>
            <small>{event.city}, {event.country}</small>
          </div>
          <div>
            <dt><UsersRound />People</dt>
            <dd>{participants.length}</dd>
            <small>documented participants</small>
          </div>
          <div>
            <dt><FileText />Sources</dt>
            <dd>{sourceIds.length}</dd>
            <small>attached records</small>
          </div>
        </dl>
      </header>

      <section className="record-body">
        <div className="record-main">
          <section>
            <span className="eyebrow">LOCATION</span>
            <h2>Documented position</h2>
            <MapGraphic events={[event]} selected={event.id} />
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
                  <span className="person-monogram">
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
          {validSources.map((source) =>
            source ? (
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
            ) : null
          )}
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

      <nav className="event-pager">
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
