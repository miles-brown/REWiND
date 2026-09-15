"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CirclePause,
  CirclePlay,
  ExternalLink,
  Filter,
  Gauge,
  MapPin,
  Quote,
  RotateCcw,
  RotateCw,
} from "lucide-react";
import { Slider } from "@/components/ui/slider";
import type { EventRecord, SourceRecord } from "@/lib/rewind";
import { isStandardIsoDate, formatTimelineDate } from "@/lib/rewind/dates";
import { MapGraphic } from "./MapGraphic";
import { CitationModal } from "./CitationModal";

export const DEFAULT_EXPLORER_TYPE = "All";
export const DEFAULT_EXPLORER_STATUS = "all";
/**
 * @deprecated Demo fallback subject. Production consumers should pass a dynamic subject or leave as null for 'All Events'.
 */
export const DEFAULT_SUBJECT = { name: "Benjamin Netanyahu", slug: "benjamin-netanyahu" };

export interface RewindExplorerProps {
  initialType?: string;
  initialStatus?: string;
  initialEvents?: EventRecord[];
  sources?: SourceRecord[];
  subject?: { name: string; slug: string } | null;
}

export function RewindExplorer({
  initialType = DEFAULT_EXPLORER_TYPE,
  initialStatus = DEFAULT_EXPLORER_STATUS,
  initialEvents = [],
  sources = [],
  subject = null,
}: RewindExplorerProps = {}) {
  const [type, setType] = useState(initialType);
  const [status, setStatus] = useState(initialStatus);
  const [direction, setDirection] = useState<"forward" | "backward">("forward");
  const [citeOpen, setCiteOpen] = useState(false);

  const resetFilters = () => {
    setType(DEFAULT_EXPLORER_TYPE);
    setStatus(DEFAULT_EXPLORER_STATUS);
    setIndex(0);
    setPlaying(false);
  };

  const sourceMap = useMemo(() => new Map(sources.map((s) => [s.id, s])), [sources]);
  const sourceById = (id?: string) => (id ? sourceMap.get(id) : undefined);

  const filtered = useMemo(
    () =>
      initialEvents
        .filter((e) => {
          const tags = e.eventTypes?.length ? e.eventTypes : (e.categories ?? []);
          return (
            (type === "All" || tags.includes(type)) &&
            (status === "all" || e.verificationStatus === status)
          );
        })
        .sort((a, b) => a.startDate.localeCompare(b.startDate)),
    [initialEvents, type, status]
  );

  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1400);

  // Synchronize index safely when filtered events change: preserve selected event if still in filtered list
  useEffect(() => {
    setIndex((currentIndex) => {
      if (filtered.length === 0) return 0;
      const currentEvent = filtered[currentIndex];
      if (currentEvent) {
        const foundIdx = filtered.findIndex((e) => e.id === currentEvent.id || e.slug === currentEvent.slug);
        if (foundIdx >= 0) return foundIdx;
      }
      return currentIndex >= filtered.length ? Math.max(0, filtered.length - 1) : currentIndex;
    });
  }, [filtered]);

  useEffect(() => {
    if (!playing || filtered.length < 2) return;
    const timer = setInterval(() => {
      setIndex((i) => {
        if (direction === "forward") {
          return i >= filtered.length - 1 ? 0 : i + 1;
        } else {
          return i <= 0 ? filtered.length - 1 : i - 1;
        }
      });
    }, speed);
    return () => clearInterval(timer);
  }, [playing, speed, direction, filtered.length]);

  const hasEvents = filtered.length > 0;
  const safeIndex = hasEvents ? Math.min(index, filtered.length - 1) : 0;
  const event = hasEvents ? filtered[safeIndex] : null;
  const source = event?.sources?.[0] || (event?.sourceIds?.[0] ? sourceById(event.sourceIds[0]) : null);
  const types = useMemo(
    () =>
      Array.from(
        new Set(
          initialEvents.flatMap((e) => (e.eventTypes?.length ? e.eventTypes : (e.categories ?? [])))
        )
      ).sort(),
    [initialEvents]
  );
  const stageFormattedDate = event
    ? formatTimelineDate(event.startDate, event.timePrecision || event.datePrecision, {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";
  const consoleFormattedDate = event
    ? formatTimelineDate(event.startDate, event.timePrecision || event.datePrecision, {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).toUpperCase()
    : "—";

  const choose = (id: string) => {
    const i = filtered.findIndex((e) => e.id === id);
    if (i >= 0) setIndex(i);
  };

  return (
    <section className="rewind-workspace" aria-label="Interactive Rewind explorer">
      {/* Live Region for Screen Readers: announces filter updates and timeline playback status */}
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {hasEvents && event
          ? playing
            ? `Timeline playing ${direction === "backward" ? "in reverse" : "forward"}. Event ${safeIndex + 1} of ${filtered.length}: ${event.startDate}, ${event.eventName} in ${event.city}.`
            : `Showing ${filtered.length} documented events. Selected event ${safeIndex + 1} of ${filtered.length}: ${event.startDate}, ${event.eventName} in ${event.city}.`
          : "Showing 0 documented events. No events match the selected filters."}
      </div>

      <div className="workspace-toolbar">
        <div className="person-lockup">
          <span className="person-dot" />
          <div>
            <small>EXPLORING</small>
            <b>{subject ? subject.name : "All Events"}</b>
          </div>
        </div>
        <div className="workspace-filters">
          <label>
            <Filter size={14} />
            <span className="sr-only">Event type</span>
            <select
              aria-label="Filter by event type"
              value={type}
              onChange={(e) => {
                setType(e.target.value);
                setIndex(0);
                setPlaying(false);
              }}
            >
              <option>All</option>
              {types.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </label>
          <label>
            <CalendarDays size={14} />
            <span className="sr-only">Verification status</span>
            <select
              aria-label="Filter by verification status"
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setIndex(0);
                setPlaying(false);
              }}
            >
              <option value="all">All Verification</option>
              <option value="verified">Verified</option>
              <option value="provisional">Provisional</option>
            </select>
          </label>
          <button
            className="reset-btn"
            onClick={resetFilters}
            aria-label="Reset filters"
            title="Reset filters"
          >
            <RotateCcw size={15} />
          </button>
        </div>
        <div className="record-count">
          <b>{filtered.length}</b>
          <span>records in view</span>
        </div>
      </div>

      <div className="workspace-main">
        <MapGraphic events={filtered} selected={event?.id ?? ""} onSelect={choose} />
        {hasEvents && event ? (
          <article className="selected-event" aria-live="polite">
            <div className="record-label">
              <span>{event.id.replace("evt-", "EVENT ")}</span>
              <span className={`status ${event.verificationStatus}`}>
                {event.verificationStatus}
              </span>
            </div>
            <time
              dateTime={isStandardIsoDate(event.startDate) ? event.startDate : undefined}
              title={!isStandardIsoDate(event.startDate) ? "Non-standard archival date format" : undefined}
            >
              {stageFormattedDate}
              {!isStandardIsoDate(event.startDate) && (
                <span className="sr-only"> (Non-standard archival date)</span>
              )}
            </time>
            <h1>{event.eventName}</h1>
            <p className="event-place">
              <MapPin />
              {event.venueName || event.city}
              <small>
                {event.city}, {event.country} · {event.locationPrecision} precision
              </small>
            </p>
            <div className="detail-tags">
              {(event.eventTypes?.length ? event.eventTypes : (event.categories ?? [])).map((t) => (
                <span key={t}>{t}</span>
              ))}
            </div>
            <div className="evidence-summary">
              <div>
                <small>PRIMARY EVIDENCE</small>
                <b>{source?.title || "Archival Record"}</b>
                <span>{source?.publisher || "Primary documentation"}</span>
              </div>
              <div className="evidence-actions">
                <button
                  className="cite-btn"
                  onClick={() => setCiteOpen(true)}
                  aria-label="Cite this record"
                >
                  <Quote size={13} />
                  <span>Cite</span>
                </button>
                {source?.url && (
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Open primary source"
                  >
                    <ExternalLink />
                  </a>
                )}
              </div>
            </div>
            <dl className="event-facts">
              <div>
                <dt>Date</dt>
                <dd>{event.datePrecision || event.timePrecision || "exact-day"}</dd>
              </div>
              <div>
                <dt>Time</dt>
                <dd>{event.localStartTime || "Not established"}</dd>
              </div>
              <div>
                <dt>Confidence</dt>
                <dd>{event.confidence || "Not established"}</dd>
              </div>
              <div>
                <dt>Medium</dt>
                <dd>{event.medium?.join(", ") || "Historical record"}</dd>
              </div>
            </dl>
            <Link className="primary-link" href={`/event/${event.slug}`}>
              Open event and evidence <ArrowRight />
            </Link>
          </article>
        ) : (
          <article className="selected-event empty-explorer-state" aria-live="polite">
            <div className="empty-explorer-content">
              <RotateCcw size={32} />
              <h2>No documented events found</h2>
              <p>
                No events match your selected filters. Adjust your event type or verification status to inspect timeline records.
              </p>
              <button
                type="button"
                className="reset-filters-btn"
                onClick={resetFilters}
              >
                Reset filters
              </button>
            </div>
          </article>
        )}
      </div>

      <div className="rewind-console">
        <div className="console-date">
          <small>REWIND TO</small>
          <b>{consoleFormattedDate}</b>
        </div>
        <div className="play-controls" role="toolbar" aria-label="Timeline playback controls">
          <button
            onClick={() => setIndex((i) => Math.max(0, i - 1))}
            disabled={!hasEvents || safeIndex === 0}
            aria-label="Previous event"
          >
            <ChevronLeft />
          </button>
          <button
            className="main-play"
            onClick={() => setPlaying(!playing)}
            disabled={!hasEvents}
            aria-pressed={playing}
            aria-label={!hasEvents ? "Playback unavailable" : playing ? "Pause timeline" : "Play timeline"}
          >
            {playing ? <CirclePause /> : <CirclePlay />}
          </button>
          <button
            onClick={() =>
              setIndex((i) => Math.min(filtered.length - 1, i + 1))
            }
            disabled={!hasEvents || safeIndex >= filtered.length - 1}
            aria-label="Next event"
          >
            <ChevronRight />
          </button>
          <button
            className={`direction-toggle-btn ${
              direction === "backward" ? "rewind-active" : ""
            }`}
            onClick={() =>
              setDirection((prev) => (prev === "forward" ? "backward" : "forward"))
            }
            disabled={!hasEvents}
            aria-pressed={direction === "backward"}
            aria-label={`Playback direction: ${direction}`}
            title={direction === "forward" ? "Forward Mode" : "REWIND Mode"}
          >
            {direction === "forward" ? <RotateCw size={14} /> : <RotateCcw size={14} />}
          </button>
        </div>
        <div className="slider-wrap">
          <Slider
            aria-label="Timeline event position"
            aria-valuemin={0}
            aria-valuemax={Math.max(0, filtered.length - 1)}
            aria-valuenow={hasEvents ? safeIndex : 0}
            aria-valuetext={
              hasEvents && event
                ? `${safeIndex + 1} of ${filtered.length}: ${event.startDate}, ${event.eventName}`
                : "No events available"
            }
            getAriaValueText={(val) => {
              const ev = filtered[val];
              return ev ? `Event ${val + 1} of ${filtered.length}: ${ev.startDate}, ${ev.eventName}` : "";
            }}
            getAriaLabel={() => "Timeline event position"}
            min={0}
            max={Math.max(0, filtered.length - 1)}
            step={1}
            value={[safeIndex]}
            disabled={!hasEvents}
            onValueChange={(v) => {
              if (hasEvents) setIndex(v[0]);
            }}
          />
          <div>
            <span>{filtered[0]?.startDate.slice(0, 4) || "—"}</span>
            <b>{event?.startDate.slice(0, 4) || "—"}</b>
            <span>{filtered.at(-1)?.startDate.slice(0, 4) || "—"}</span>
          </div>
        </div>
        <label className="speed">
          <Gauge />
          <span className="sr-only">Playback speed</span>
          <select
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            aria-label="Playback speed"
          >
            <option value={2000}>0.7x (Slow)</option>
            <option value={1400}>1x (Realtime)</option>
            <option value={800}>1.7x (Fast)</option>
            <option value={400}>3.5x (Blitz)</option>
          </select>
        </label>
        {(() => {
          const eventYear = event && isStandardIsoDate(event.startDate)
            ? event.startDate.slice(0, 4)
            : null;
          if (!event || !eventYear) return null;
          return (
            <Link
              href={
                subject
                  ? `/person/${subject.slug}/${eventYear}`
                  : `/events?year=${eventYear}`
              }
              className="calendar-jump"
              aria-label={
                subject
                  ? `Open ${eventYear} year view for ${subject.name}`
                  : `Open ${eventYear} year view`
              }
            >
              <CalendarDays />
            </Link>
          );
        })()}
      </div>

      {citeOpen && event && (
        <CitationModal
          event={event}
          source={source}
          isOpen={citeOpen}
          onClose={() => setCiteOpen(false)}
        />
      )}
    </section>
  );
}
