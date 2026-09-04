import { Clock, Globe, Timer, Sparkles } from "lucide-react";
import type { EventRecord } from "@/lib/rewind";
import { formatCivilTime, formatDuration } from "@/lib/rewind";

export function TemporalBadge({ event }: { event: EventRecord }) {
  const civilDisplay = formatCivilTime(event.localStartTime, event.timezoneAbbreviation);
  const durationDisplay = formatDuration(event.durationSeconds);

  return (
    <aside className="temporal-context-box" aria-label="Temporal Context and Standards">
      <div className="temporal-grid">
        {/* Local Civil Time & Day of Week */}
        <div className="temporal-card">
          <div className="temporal-card-icon">
            <Clock size={16} />
          </div>
          <div>
            <small>LOCAL CIVIL TIME</small>
            <b>{civilDisplay || "Time Not Established"}</b>
            <span>
              {event.dayOfWeek ? `${event.dayOfWeek} · ` : ""}
              {event.timeStandard || "Local civil standard"}
            </span>
          </div>
        </div>

        {/* IANA Timezone & Offset */}
        <div className="temporal-card">
          <div className="temporal-card-icon">
            <Globe size={16} />
          </div>
          <div>
            <small>TIME ZONE & OFFSET</small>
            <b>{event.timezoneId || "Local Jurisdiction"}</b>
            <span>
              {event.utcOffsetSeconds != null
                ? `UTC${event.utcOffsetSeconds >= 0 ? "+" : ""}${(event.utcOffsetSeconds / 3600).toFixed(1).replace(".0", "")}:00`
                : "Standard offset"}
              {event.dstObserved ? " (Daylight Saving)" : " (Standard Time)"}
            </span>
          </div>
        </div>

        {/* Duration & Basis */}
        {durationDisplay && (
          <div className="temporal-card">
            <div className="temporal-card-icon">
              <Timer size={16} />
            </div>
            <div>
              <small>MEASURED DURATION</small>
              <b>{durationDisplay}</b>
              <span>{event.durationBasis || "Documented duration"}</span>
            </div>
          </div>
        )}

        {/* Public / National Holiday */}
        {event.holidayApplicable && event.holidayName && (
          <div className="temporal-card highlight">
            <div className="temporal-card-icon">
              <Sparkles size={16} />
            </div>
            <div>
              <small>CALENDAR OBSERVANCE</small>
              <b>{event.holidayName}</b>
              <span>
                {event.holidayType || "Public Holiday"} · {event.holidayJurisdiction || event.country}
              </span>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
