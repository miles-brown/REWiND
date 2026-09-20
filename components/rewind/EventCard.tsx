import { memo } from "react";
import Link from "next/link";
import { ArrowUpRight, CheckCircle2, CircleDashed, MapPin } from "lucide-react";
import { formatTimelineDate, isStandardIsoDate } from "@/lib/rewind/dates";
import type { EventRecord } from "@/lib/rewind/types";

export const EventCard = memo(function EventCard({
  event,
  compact = false,
}: {
  event: EventRecord;
  compact?: boolean;
}) {
  const verified = event.verificationStatus === "verified";
  const confidence = event.confidence || "limited";
  const temporalPrecision = event.datePrecision || event.timePrecision || "exact-day";
  const isStandard = isStandardIsoDate(event.startDate);

  return (
    <Link
      className={`event-card ${compact ? "compact" : ""}`}
      href={`/event/${event.slug}`}
      title={`${event.eventName} (${confidence} · ${temporalPrecision} precision)`}
    >
      <div className="event-card-top">
        <time
          dateTime={isStandard ? event.startDate : undefined}
          title={`${temporalPrecision} precision${!isStandard && event.startDate ? " · Non-standard archival date format" : ""}`}
        >
          {event.startDate
            ? formatTimelineDate(event.startDate, temporalPrecision, {
                day: "2-digit",
                month: "short",
                year: "numeric",
              }) || event.startDate
            : "Unknown date"}
          {!isStandard && event.startDate && (
            <span className="sr-only"> (Non-standard archival date)</span>
          )}
        </time>
        <span
          className={verified ? "status verified" : "status provisional"}
          title={`Verification: ${verified ? "Verified" : "Provisional"} · Confidence: ${confidence}`}
        >
          {verified ? <CheckCircle2 /> : <CircleDashed />}
          {verified ? "Verified" : "Provisional"}
        </span>
      </div>
      <h3>{event.eventName}</h3>
      <p>
        <MapPin size={13} />
        {event.venueName || event.city}, {event.country}
      </p>
      <div className="card-tags">
        {(event.eventTypes?.length ? event.eventTypes : (event.categories ?? [])).slice(0, 3).map((t) => (
          <span key={t}>{t}</span>
        ))}
        <span className="card-precision-pill" title={`Temporal resolution: ${temporalPrecision}`}>
          {temporalPrecision}
        </span>
      </div>
      <ArrowUpRight className="card-arrow" size={17} />
    </Link>
  );
});
