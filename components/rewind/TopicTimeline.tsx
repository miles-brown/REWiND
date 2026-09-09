"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Calendar,
  CheckCircle2,
  CircleDashed,
  Layers,
  MapPin,
  Users,
} from "lucide-react";
import type { EventRecord } from "@/data/rewind";
import type { TopicRecord } from "@/lib/rewind/topics";

export function TopicTimeline({
  topic,
  records,
}: {
  topic: TopicRecord;
  records: EventRecord[];
}) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const categories = Array.from(new Set(records.flatMap((r) => r.categories || [])));

  const filteredRecords = selectedCategory === "all"
    ? records
    : records.filter((r) => r.categories?.includes(selectedCategory));

  const filterAnnouncement = selectedCategory === "all"
    ? `Showing all ${records.length} events for ${topic.name}.`
    : `Filter applied: ${selectedCategory}, showing ${filteredRecords.length} of ${records.length} events.`;

  return (
    <div className="topic-timeline-container">
      {/* Live Region for Screen Readers */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {filterAnnouncement}
      </div>

      <header className="topic-hero-card">
        <span className="eyebrow" style={{ color: "var(--coral, #ff5b43)" }}>
          NON-PERSON TOPIC TIMELINE — {topic.category.toUpperCase()}
        </span>
        <h1 style={{ fontSize: "2rem", fontWeight: 800, margin: "0.25rem 0 0.75rem 0" }}>
          {topic.name}
        </h1>
        <p style={{ color: "var(--muted, #64747a)", fontSize: "1rem", maxWidth: "800px", lineHeight: 1.6 }}>
          {topic.summary}
        </p>

        <div className="topic-hero-meta">
          <span style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
            <Calendar size={14} />
            {topic.startedDate} — {topic.endedDate || "Ongoing"}
          </span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
            <Layers size={14} />
            {records.length} Indexed Events
          </span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
            <CheckCircle2 size={14} style={{ color: "#167151" }} />
            {records.filter((r) => r.verificationStatus === "verified").length} Verified Primary
          </span>
        </div>
      </header>

      {/* Category Filter Pills */}
      {categories.length > 0 && (
        <div
          className="category-filter-bar"
          role="group"
          aria-label="Filter events by topic sub-category"
        >
          <button
            type="button"
            aria-pressed={selectedCategory === "all"}
            className="category-filter-btn"
            onClick={() => setSelectedCategory("all")}
          >
            All Sub-topics ({records.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              aria-pressed={selectedCategory === cat}
              className="category-filter-btn"
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Threaded Events Timeline */}
      <div
        className="topic-events-list"
        role="list"
        aria-label={`${topic.name} timeline event records`}
        style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}
      >
        {filteredRecords.map((evt) => (
          <div key={evt.id} className="topic-event-card" role="listitem">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem", flexWrap: "wrap", marginBottom: "0.75rem" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.3rem" }}>
                  <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--ink, #0c1820)" }}>
                    {evt.startDate}
                  </span>
                  {evt.verificationStatus === "verified" ? (
                    <span style={{ fontSize: "0.75rem", color: "#15803d", display: "inline-flex", alignItems: "center", gap: "0.2rem" }}>
                      <CheckCircle2 size={12} /> Verified
                    </span>
                  ) : (
                    <span style={{ fontSize: "0.75rem", color: "#b45309", display: "inline-flex", alignItems: "center", gap: "0.2rem" }}>
                      <CircleDashed size={12} /> Provisional
                    </span>
                  )}
                </div>
                <h3 style={{ fontSize: "1.2rem", fontWeight: 700, margin: 0 }}>
                  <Link href={`/event/${evt.slug}`} style={{ color: "inherit", textDecoration: "none" }}>
                    {evt.eventName}
                  </Link>
                </h3>
              </div>

              <div style={{ fontSize: "0.8rem", color: "var(--muted, #64747a)", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                <MapPin size={13} />
                <span>{evt.venueName ? `${evt.venueName}, ${evt.city}` : `${evt.city}, ${evt.country}`}</span>
              </div>
            </div>

            <p style={{ color: "var(--ink-2, #142832)", fontSize: "0.92rem", lineHeight: 1.5, margin: "0 0 1rem 0" }}>
              {evt.summary}
            </p>

            {/* Participants Bar */}
            {evt.participants && evt.participants.length > 0 && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  flexWrap: "wrap",
                  paddingTop: "0.75rem",
                  borderTop: "1px dashed var(--line, #dbe2de)",
                  fontSize: "0.8rem",
                  color: "var(--muted, #64747a)",
                }}
              >
                <Users size={13} />
                <span style={{ fontWeight: 600 }}>Key Participants:</span>
                {evt.participants.map((p) => (
                  <Link
                    key={p.personId}
                    href={`/person/${p.personId}`}
                    className="participant-tag"
                  >
                    {p.name} ({p.role})
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
