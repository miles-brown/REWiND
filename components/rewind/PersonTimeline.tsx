"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  CirclePause,
  CirclePlay,
  ExternalLink,
  Gauge,
  HelpCircle,
  MapPin,
  MessageSquareQuote,
  Quote,
  RotateCcw,
  RotateCw,
  ShieldAlert,
  SkipBack,
  SkipForward,
} from "lucide-react";
import { Slider } from "@/components/ui/slider";
import type { EventRecord, Person } from "@/data/rewind";
import { people, sourceById } from "@/data/rewind";
import { MapGraphic } from "./MapGraphic";
import { CitationModal } from "./CitationModal";
import { MediaDrawer } from "./MediaDrawer";
import { DiscrepancyViewer } from "./DiscrepancyViewer";

export function PersonTimeline({
  person,
  records,
}: {
  person: Person;
  records: EventRecord[];
}) {
  const ordered = useMemo(
    () => [...records].sort((a, b) => a.startDate.localeCompare(b.startDate)),
    [records]
  );

  const [index, setIndex] = useState(() => {
    if (typeof window !== "undefined" && records.length) {
      const sorted = [...records].sort((a, b) => a.startDate.localeCompare(b.startDate));
      const params = new URLSearchParams(window.location.search);
      const targetSlug = params.get("evt") || params.get("event");
      if (targetSlug) {
        const foundIdx = sorted.findIndex(
          (r) => r.slug === targetSlug || r.id === targetSlug
        );
        if (foundIdx >= 0) return foundIdx;
      }
    }
    return 0;
  });

  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1600);
  const [direction, setDirection] = useState<"forward" | "backward">("forward");
  const [citeOpen, setCiteOpen] = useState(false);
  const [mediaOpen, setMediaOpen] = useState(false);
  const [auditOpen, setAuditOpen] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  // Milestone epochs (earliest event in each distinct decade)
  const epochs = useMemo(() => {
    const map = new Map<string, number>();
    ordered.forEach((rec, idx) => {
      const decade = rec.startDate.slice(0, 3) + "0s";
      if (!map.has(decade)) {
        map.set(decade, idx);
      }
    });
    return Array.from(map.entries()).map(([decade, epochIdx]) => ({
      decade,
      index: epochIdx,
      year: ordered[epochIdx]?.startDate.slice(0, 4) || "",
    }));
  }, [ordered]);

  // Bidirectional interval playback
  useEffect(() => {
    if (!playing || ordered.length < 2) return;
    const timer = setInterval(() => {
      setIndex((i) => {
        if (direction === "forward") {
          if (i + 1 >= ordered.length - 1) {
            setPlaying(false);
            return ordered.length - 1;
          }
          return i + 1;
        } else {
          if (i - 1 <= 0) {
            setPlaying(false);
            return 0;
          }
          return i - 1;
        }
      });
    }, speed);
    return () => clearInterval(timer);
  }, [playing, speed, direction, ordered.length]);

  const safeIndex = ordered.length
    ? Math.min(Math.max(index, 0), ordered.length - 1)
    : 0;

  const moveTo = (next: number) => {
    setPlaying(false);
    if (!ordered.length) return;
    const clamped = Math.min(Math.max(next, 0), ordered.length - 1);
    setIndex(clamped);
    if (typeof window !== "undefined" && ordered[clamped]) {
      const url = new URL(window.location.href);
      url.searchParams.set("evt", ordered[clamped].slug);
      window.history.replaceState(null, "", url.toString());
    }
  };

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!ordered.length) return;
      // Don't trigger if user is typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }

      if (e.key === "ArrowRight") {
        e.preventDefault();
        moveTo(e.shiftKey ? safeIndex + 5 : safeIndex + 1);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        moveTo(e.shiftKey ? safeIndex - 5 : safeIndex - 1);
      } else if (e.key === " " || e.code === "Space") {
        e.preventDefault();
        const atEdge =
          (direction === "forward" && safeIndex === ordered.length - 1) ||
          (direction === "backward" && safeIndex === 0);
        if (!atEdge) {
          setPlaying((prev) => !prev);
        }
      } else if (e.key === "Home") {
        e.preventDefault();
        moveTo(0);
      } else if (e.key === "End") {
        e.preventDefault();
        moveTo(ordered.length - 1);
      } else if (e.key.toLowerCase() === "r") {
        e.preventDefault();
        setDirection((prev) => (prev === "forward" ? "backward" : "forward"));
      } else if (e.key === "?") {
        e.preventDefault();
        setShowHelp((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  if (!ordered.length) {
    return (
      <div className="zero-state">
        <h2>No timeline records yet</h2>
        <p>This edition does not yet contain a dated event for {person.name}.</p>
      </div>
    );
  }

  const event = ordered[safeIndex];
  const source = sourceById(event.sourceIds[0]);
  const date = new Date(event.startDate + "T12:00:00");

  const choose = (id: string) => {
    const next = ordered.findIndex((record) => record.id === id);
    if (next >= 0) moveTo(next);
  };

  const progress = Math.round(((safeIndex + 1) / ordered.length) * 100);
  const isPlayDisabled =
    (direction === "forward" && safeIndex === ordered.length - 1) ||
    (direction === "backward" && safeIndex === 0);

  return (
    <section
      className="person-time-machine"
      aria-label={`${person.name} chronological timeline`}
    >
      {/* Live Region for Screen Readers: announces timeline playback status and selected event updates */}
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {playing
          ? `Timeline playing ${direction === "backward" ? "in reverse (REWIND mode)" : "forward"}. Event ${safeIndex + 1} of ${ordered.length}: ${event.startDate}, ${event.eventName} in ${event.city}.`
          : `Selected event ${safeIndex + 1} of ${ordered.length}: ${event.startDate}, ${event.eventName} in ${event.city}.`}
      </div>

      <div className="person-time-status">
        <div className="status-left">
          <span className="live-pulse" />
          <small>REWINDING</small>
          <b>{person.name}</b>
        </div>
        <div className="status-right-tools">
          <button
            type="button"
            className="keyboard-help-btn"
            onClick={() => setShowHelp(!showHelp)}
            aria-label="Toggle keyboard shortcuts reference"
          >
            <HelpCircle size={14} />
            <span>Hotkeys</span>
          </button>
          <p>
            <strong>{safeIndex + 1}</strong> of {ordered.length} documented events
          </p>
        </div>
      </div>


      {showHelp && (
        <div className="shortcuts-bar" role="region" aria-label="Timeline keyboard shortcuts">
          <span><kbd>←</kbd> / <kbd>→</kbd> Prev/Next</span>
          <span><kbd>Shift</kbd>+<kbd>←</kbd>/<kbd>→</kbd> ±5 Events</span>
          <span><kbd>Space</kbd> Play/Pause</span>
          <span><kbd>Home</kbd> / <kbd>End</kbd> First/Last</span>
          <span><kbd>R</kbd> {direction === "forward" ? "Switch to Rewind" : "Switch to Forward"}</span>
          <button onClick={() => setShowHelp(false)} aria-label="Hide shortcuts">×</button>
        </div>
      )}

      <div className="person-time-main">
        <article className="person-event-stage" key={event.id} aria-live="polite">
          <div className="person-event-kicker">
            <span>{event.startDate.slice(0, 4)}</span>
            <span className={`status ${event.verificationStatus}`}>
              {event.verificationStatus}
            </span>
          </div>
          <time dateTime={event.startDate}>
            {date.toLocaleDateString("en-GB", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
            {event.localStartTime ? ` · ${event.localStartTime}` : ""}
          </time>
          <h2>{event.eventName}</h2>
          <p className="event-place">
            <MapPin />
            {event.venueName || event.city}
            <small>
              {event.city}, {event.country} · {event.locationPrecision} precision
            </small>
          </p>
          <div className="detail-tags">
            {event.eventTypes.map((type) => (
              <span key={type}>{type}</span>
            ))}
          </div>
          <div className="person-event-participants">
            <small>DOCUMENTED WITH</small>
            <div>
              {event.participants.map((participant) => (
                <Link
                  key={participant.personId}
                  href={`/person/${
                    people.find((item) => item.id === participant.personId)?.slug ||
                    person.slug
                  }`}
                >
                  {participant.name}
                  <span>{participant.role}</span>
                </Link>
              ))}
            </div>
          </div>
          <div className="evidence-summary">
            <div>
              <small>EVIDENCE</small>
              <b>{source?.title}</b>
              <span>
                {source?.publisher} · {event.medium.join(", ")}
              </span>
            </div>
            <div className="evidence-actions">
              <button
                className="cite-btn"
                onClick={() => setCiteOpen(true)}
                aria-label="Cite this historical record"
              >
                <Quote size={14} />
                <span>Cite</span>
              </button>
              {event.quotes && event.quotes.length > 0 && (
                <button
                  className="cite-btn highlight"
                  onClick={() => setMediaOpen(true)}
                  aria-label="Open speech quotes and audio excerpts"
                >
                  <MessageSquareQuote size={14} />
                  <span>Quotes ({event.quotes.length})</span>
                </button>
              )}
              <button
                className="cite-btn"
                onClick={() => setAuditOpen(true)}
                aria-label="Open forensic evidentiary audit"
              >
                <ShieldAlert size={14} />
                <span>Audit</span>
              </button>
              {source && (
                <a
                  href={source.url}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`Open source from ${source.publisher}`}
                >
                  <ExternalLink />
                </a>
              )}
            </div>
          </div>
          <Link className="primary-link" href={`/event/${event.slug}`}>
            Open complete event record <ArrowRight />
          </Link>
        </article>
        <div className="person-map-stage">
          <div className="map-stage-label">
            <span>DOCUMENTED POSITION</span>
            <b>{event.city}</b>
            <small>{progress}% through indexed chronology</small>
          </div>
          <MapGraphic
            events={ordered.slice(0, safeIndex + 1)}
            selected={event.id}
            onSelect={choose}
          />
        </div>
      </div>

      <div className="person-time-console">
        <div className="console-date">
          <small>CURRENT EVENT</small>
          <b>
            {date.toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </b>
        </div>

        <div className="play-controls" role="toolbar" aria-label="Timeline playback controls">
          <button
            onClick={() => moveTo(0)}
            disabled={safeIndex === 0}
            aria-label="First event"
          >
            <SkipBack />
          </button>
          <button
            onClick={() => moveTo(safeIndex - 1)}
            disabled={safeIndex === 0}
            aria-label="Previous event"
          >
            <ChevronLeft />
          </button>
          <button
            className="main-play"
            onClick={() => setPlaying((value) => !value)}
            disabled={isPlayDisabled}
            aria-pressed={playing}
            aria-label={
              playing
                ? "Pause timeline"
                : direction === "forward"
                ? "Play timeline forward"
                : "Play timeline in reverse (REWIND)"
            }
          >
            {playing ? <CirclePause /> : <CirclePlay />}
          </button>
          <button
            onClick={() => moveTo(safeIndex + 1)}
            disabled={safeIndex === ordered.length - 1}
            aria-label="Next event"
          >
            <ChevronRight />
          </button>
          <button
            onClick={() => moveTo(ordered.length - 1)}
            disabled={safeIndex === ordered.length - 1}
            aria-label="Last event"
          >
            <SkipForward />
          </button>
          <button
            className={`direction-toggle-btn ${direction === "backward" ? "rewind-active" : ""}`}
            onClick={() =>
              setDirection((prev) => (prev === "forward" ? "backward" : "forward"))
            }
            aria-pressed={direction === "backward"}
            aria-label={`Playback direction: ${direction}. Click to toggle.`}
            title={direction === "forward" ? "Forward Mode" : "REWIND Mode (Reverse)"}
          >
            {direction === "forward" ? <RotateCw size={15} /> : <RotateCcw size={15} />}
            <span className="direction-label">{direction === "forward" ? "FWD" : "REW"}</span>
          </button>
        </div>

        <div className="slider-wrap">
          <div className="epoch-rail" role="group" aria-label="Jump to decade milestones">
            {epochs.map((ep) => {
              const isActive =
                safeIndex >= ep.index &&
                (epochs.find(
                  (nextEp, nIdx) =>
                    nIdx === epochs.indexOf(ep) + 1 && safeIndex >= nextEp.index
                ) === undefined);
              return (
                <button
                  key={ep.decade}
                  className={`epoch-badge ${isActive ? "active" : ""}`}
                  onClick={() => moveTo(ep.index)}
                  aria-label={`Jump to ${ep.decade}`}
                  aria-pressed={isActive}
                >
                  {ep.decade}
                </button>
              );
            })}
          </div>

          <div className="slider-heading">
            <span>{ordered[0].startDate}</span>
            <b>Event {safeIndex + 1} of {ordered.length}</b>
            <span>{ordered.at(-1)?.startDate}</span>
          </div>


          <Slider
            aria-label={`${person.name} timeline position`}
            aria-valuetext={`${safeIndex + 1} of ${ordered.length}: ${
              event.startDate
            }, ${event.eventName}`}
            getAriaValueText={(val) => {
              const ev = ordered[val];
              return ev ? `Event ${val + 1} of ${ordered.length}: ${ev.startDate}, ${ev.eventName}` : "";
            }}
            getAriaLabel={() => `${person.name} timeline chronology slider`}
            min={0}
            max={Math.max(0, ordered.length - 1)}
            step={1}
            value={[safeIndex]}
            onValueChange={(value) => moveTo(value[0])}
          />

          <div className="slider-dates">
            <span>{ordered[0].eventName.slice(0, 24)}…</span>
            <b>{event.startDate} · {event.eventName}</b>
            <span>{ordered.at(-1)?.eventName.slice(0, 24)}…</span>
          </div>
        </div>

        <label className="speed">
          <Gauge />
          <span className="sr-only">Playback speed</span>
          <select
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
          >
            <option value="2600">0.5×</option>
            <option value="1600">1×</option>
            <option value="850">2×</option>
          </select>
        </label>
      </div>

      <CitationModal
        event={event}
        isOpen={citeOpen}
        onClose={() => setCiteOpen(false)}
      />

      <MediaDrawer
        event={event}
        isOpen={mediaOpen}
        onClose={() => setMediaOpen(false)}
      />

      <DiscrepancyViewer
        event={event}
        isOpen={auditOpen}
        onClose={() => setAuditOpen(false)}
      />
    </section>
  );
}
