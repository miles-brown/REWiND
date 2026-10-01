"use client";

import { Award, BarChart3, CheckCircle2, ShieldCheck, Trophy } from "lucide-react";
import type { PersonMilestoneRecord } from "@/lib/rewind/milestones";

export function MilestonesTimeline({ milestones }: { milestones: PersonMilestoneRecord[] }) {
  if (milestones.length === 0) {
    return (
      <div className="zero-state">
        <Trophy size={32} style={{ margin: "0 auto 1rem", opacity: 0.5 }} />
        <h3>No personal milestones registered</h3>
        <p style={{ color: "var(--muted, #64747a)", fontSize: "0.9rem" }}>
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
    <div className="milestones-timeline-container">
      <div className="milestones-header">
        <span className="eyebrow">MILESTONES & ACHIEVEMENTS</span>
        <h2>Factual Records & Key Achievements</h2>
        <p>
          Documented accomplishments, honors, landmark statistics, and verifiable records beyond official titles.
        </p>
      </div>

      <div className="milestones-list" role="list" aria-label="Personal milestones and records timeline">
        {milestones.map((m) => {
          const IconComp = categoryIcons[m.category] || CheckCircle2;

          return (
            <div key={m.id} className="milestone-card" role="listitem">
              <div className="milestone-dot" aria-hidden="true" />

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem", flexWrap: "wrap" }}>
                <div>
                  <span className="milestone-cat-badge">
                    <IconComp size={13} /> {m.category}
                  </span>
                  <h3 style={{ fontSize: "1.15rem", fontWeight: 600, margin: "0 0 0.5rem 0" }}>{m.title}</h3>
                </div>

                <div className="milestone-stat-pill">
                  {m.metricOrStat || m.date}
                </div>
              </div>

              {m.description && (
                <p style={{ color: "var(--muted, #64747a)", fontSize: "0.9rem", margin: "0.5rem 0 0 0", lineHeight: 1.5 }}>
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
