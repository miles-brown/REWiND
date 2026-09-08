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

  return (
    <div className="topic-timeline-container" style={{ margin: "2rem 0" }}>
      <header
        style={{
          background: "var(--bg-surface, #141414)",
          border: "1px solid var(--border-subtle, #2a2a2a)",
          borderRadius: "12px",
          padding: "2rem",
          marginBottom: "2rem",
        }}
      >
        <span
          style={{
            display: "inline-block",
            fontSize: "0.75rem",
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "var(--brand-accent, #6366f1)",
            marginBottom: "0.5rem",
          }}
        >
          NON-PERSON TOPIC TIMELINE — {topic.category.toUpperCase()}
        </span>
        <h1 style={{ fontSize: "2rem", fontWeight: 800, margin: "0.25rem 0 0.75rem 0" }}>
          {topic.name}
        </h1>
        <p style={{ color: "var(--text-muted, #aaa)", fontSize: "1rem", maxWidth: "800px", lineHeight: 1.6 }}>
          {topic.summary}
        </p>

        <div
          style={{
            display: "flex",
            gap: "1.5rem",
            marginTop: "1.5rem",
            paddingTop: "1.25rem",
            borderTop: "1px solid var(--border-subtle, #222)",
            flexWrap: "wrap",
            fontSize: "0.85rem",
            color: "var(--text-muted, #888)",
          }}
        >
          <span style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
            <Calendar size={14} />
            {topic.startedDate} — {topic.endedDate || "Ongoing"}
          </span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
            <Layers size={14} />
            {records.length} Indexed Events
          </span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
            <CheckCircle2 size={14} style={{ color: "#4ade80" }} />
            {records.filter((r) => r.verificationStatus === "verified").length} Verified Primary
          </span>
        </div>
      </header>

      {/* Category Filter Pills */}
      {categories.length > 0 && (
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1.5rem" }}>
          <button
            onClick={() => setSelectedCategory("all")}
            style={{
              padding: "0.4rem 0.85rem",
              borderRadius: "20px",
              fontSize: "0.8rem",
              fontWeight: 600,
              border: "1px solid",
              borderColor: selectedCategory === "all" ? "var(--brand-accent, #6366f1)" : "var(--border-subtle, #333)",
              background: selectedCategory === "all" ? "var(--brand-accent, #6366f1)" : "transparent",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            All Sub-topics ({records.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: "0.4rem 0.85rem",
                borderRadius: "20px",
                fontSize: "0.8rem",
                fontWeight: 600,
                border: "1px solid",
                borderColor: selectedCategory === cat ? "var(--brand-accent, #6366f1)" : "var(--border-subtle, #333)",
                background: selectedCategory === cat ? "var(--brand-accent, #6366f1)" : "transparent",
                color: "#fff",
                cursor: "pointer",
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Threaded Events Timeline */}
      <div
        className="topic-events-list"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1.25rem",
        }}
      >
        {filteredRecords.map((evt) => (
          <div
            key={evt.id}
            style={{
              background: "var(--bg-surface, #141414)",
              border: "1px solid var(--border-subtle, #2a2a2a)",
              borderRadius: "10px",
              padding: "1.5rem",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem", flexWrap: "wrap", marginBottom: "0.75rem" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.3rem" }}>
                  <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--brand-accent, #6366f1)" }}>
                    {evt.startDate}
                  </span>
                  {evt.verificationStatus === "verified" ? (
                    <span style={{ fontSize: "0.75rem", color: "#4ade80", display: "inline-flex", alignItems: "center", gap: "0.2rem" }}>
                      <CheckCircle2 size={12} /> Verified
                    </span>
                  ) : (
                    <span style={{ fontSize: "0.75rem", color: "#fbbf24", display: "inline-flex", alignItems: "center", gap: "0.2rem" }}>
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

              <div style={{ fontSize: "0.8rem", color: "var(--text-muted, #888)", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                <MapPin size={13} />
                <span>{evt.venueName ? `${evt.venueName}, ${evt.city}` : `${evt.city}, ${evt.country}`}</span>
              </div>
            </div>

            <p style={{ color: "var(--text-muted, #bbb)", fontSize: "0.92rem", lineHeight: 1.5, margin: "0 0 1rem 0" }}>
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
                  borderTop: "1px dashed var(--border-subtle, #262626)",
                  fontSize: "0.8rem",
                  color: "var(--text-muted, #888)",
                }}
              >
                <Users size={13} />
                <span style={{ fontWeight: 600 }}>Key Participants:</span>
                {evt.participants.map((p) => (
                  <Link
                    key={p.personId}
                    href={`/person/${p.personId}`}
                    style={{
                      background: "var(--bg-subtle, #1a1a1a)",
                      color: "var(--text-main, #eee)",
                      padding: "0.2rem 0.5rem",
                      borderRadius: "4px",
                      textDecoration: "none",
                      border: "1px solid var(--border-subtle, #333)",
                    }}
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
