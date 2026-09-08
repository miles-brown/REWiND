"use client";

import { Award, BarChart3, CheckCircle2, ShieldCheck, Trophy } from "lucide-react";
import type { PersonMilestoneRecord } from "@/lib/rewind/milestones";

export function MilestonesTimeline({ milestones }: { milestones: PersonMilestoneRecord[] }) {
  if (milestones.length === 0) {
    return (
      <div
        className="zero-state"
        style={{
          padding: "3rem 2rem",
          textAlign: "center",
          border: "1px dashed var(--border-subtle, #333)",
          borderRadius: "8px",
          margin: "2rem 0",
        }}
      >
        <Trophy size={32} style={{ margin: "0 auto 1rem", opacity: 0.5 }} />
        <h3>No personal milestones registered</h3>
        <p style={{ color: "var(--text-muted, #888)", fontSize: "0.9rem" }}>
          Non-official achievements, landmark statistics, honors, and records are continuously indexed.
        </p>
      </div>
    );
  }

  const categoryIcons = {
    achievement: Trophy,
    record: BarChart3,
    statistic: BarChart3,
    honor: Award,
    "landmark-fact": ShieldCheck,
  };

  return (
    <div className="milestones-timeline-container" style={{ margin: "2rem 0" }}>
      <div style={{ marginBottom: "1.5rem" }}>
        <span className="eyebrow">MILESTONES & ACHIEVEMENTS</span>
        <h2 style={{ fontSize: "1.5rem", fontWeight: 700, margin: "0.25rem 0" }}>
          Factual Records & Key Achievements
        </h2>
        <p style={{ color: "var(--text-muted, #888)", fontSize: "0.9rem" }}>
          Documented accomplishments, honors, landmark statistics, and verifiable records beyond official titles.
        </p>
      </div>

      <div
        className="milestones-list"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1.25rem",
          position: "relative",
          paddingLeft: "1.5rem",
          borderLeft: "2px solid var(--border-subtle, #333)",
        }}
      >
        {milestones.map((m) => {
          const IconComp = categoryIcons[m.category] || CheckCircle2;

          return (
            <div
              key={m.id}
              className="milestone-card"
              style={{
                position: "relative",
                background: "var(--bg-surface, #141414)",
                border: "1px solid var(--border-subtle, #2a2a2a)",
                borderRadius: "8px",
                padding: "1.25rem",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  left: "-2.15rem",
                  top: "1.25rem",
                  width: "1.25rem",
                  height: "1.25rem",
                  borderRadius: "50%",
                  background: "var(--brand-accent, #6366f1)",
                  border: "3px solid var(--bg-canvas, #0a0a0a)",
                }}
              />

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem", flexWrap: "wrap" }}>
                <div>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.3rem",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      color: "var(--brand-accent, #6366f1)",
                      marginBottom: "0.4rem",
                    }}
                  >
                    <IconComp size={13} /> {m.category}
                  </span>
                  <h3 style={{ fontSize: "1.15rem", fontWeight: 600, margin: "0 0 0.5rem 0" }}>{m.title}</h3>
                </div>

                <div
                  style={{
                    background: "rgba(99, 102, 241, 0.1)",
                    color: "var(--brand-accent, #6366f1)",
                    border: "1px solid rgba(99, 102, 241, 0.2)",
                    padding: "0.35rem 0.75rem",
                    borderRadius: "6px",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                  }}
                >
                  {m.metricOrStat || m.date}
                </div>
              </div>

              {m.description && (
                <p style={{ color: "var(--text-muted, #aaa)", fontSize: "0.9rem", margin: "0.5rem 0 0 0", lineHeight: 1.5 }}>
                  {m.description}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
