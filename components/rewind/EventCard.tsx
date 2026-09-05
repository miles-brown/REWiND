import Link from "next/link";
import { ArrowUpRight, CheckCircle2, CircleDashed, MapPin } from "lucide-react";
import type { EventRecord } from "@/lib/rewind";

export function EventCard({ event, compact = false }: { event: EventRecord; compact?: boolean }) {
  const verified = event.verificationStatus === "verified";
  const confidence = event.confidence || "confirmed";
  const temporalPrecision = event.timePrecision || event.datePrecision || "exact-day";

  return (
    <Link
      className={`event-card ${compact ? "compact" : ""}`}
      href={`/event/${event.slug}`}
      title={`${event.eventName} (${confidence} · ${temporalPrecision} precision)`}
    >
      <div className="event-card-top">
        <time title={`${temporalPrecision} precision`}>
          {event.startDate
            ? new Date(event.startDate.includes("T") ? event.startDate : event.startDate + "T12:00:00").toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })
            : "Unknown date"}
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
}
