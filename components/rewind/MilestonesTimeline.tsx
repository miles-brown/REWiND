"use client";

import { Award, BarChart3, CheckCircle2, ShieldCheck, Trophy, Sparkles } from "lucide-react";
import type { PersonMilestoneRecord } from "@/lib/rewind/milestones";
import type { PersonAward } from "@/lib/rewind/types";

export function MilestonesTimeline({
  milestones,
  awards = [],
}: {
  milestones: PersonMilestoneRecord[];
  awards?: PersonAward[];
}) {
  const hasItems = milestones.length > 0 || awards.length > 0;

  if (!hasItems) {
    return (
      <div className="zero-state">
        <Trophy size={36} style={{ margin: "0 auto 1rem", opacity: 0.5 }} />
        <h3>No personal milestones registered</h3>
        <p style={{ color: "var(--muted, #94a3b8)", fontSize: "0.9rem" }}>
          Non-official achievements, landmark statistics, honors, and records are continuously indexed.
        </p>
      </div>
    );
  }

  const categoryIcons: Record<string, typeof Trophy> = {
    achievement: Trophy,
    record: BarChart3,
    statistic: BarChart3,
    honor: Award,
    "landmark-fact": ShieldCheck,
  };

  return (
    <div className="milestones-timeline-container">
      <div className="milestones-header">
        <span className="eyebrow">MILESTONES & HONORS</span>
        <h2>Factual Records & Key Achievements</h2>
        <p>
          Documented accomplishments, honors, landmark statistics, and verifiable recognitions across public life.
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
                  <h3 style={{ fontSize: "1.15rem", fontWeight: 600, margin: "0 0 0.5rem 0", color: "#f8fafc" }}>{m.title}</h3>
                </div>

                <div className="milestone-stat-pill">
                  {m.metricOrStat || m.date || "Milestone"}
                </div>
              </div>

              {m.description && (
                <p style={{ color: "#94a3b8", fontSize: "0.9rem", margin: "0.5rem 0 0 0", lineHeight: 1.5 }}>
                  {m.description}
                </p>
              )}
            </div>
          );
        })}

        {/* Structured awards records */}
        {awards.map((a) => (
          <div key={a.id} className="milestone-card award-card" role="listitem">
            <div className="milestone-dot" aria-hidden="true" />

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem", flexWrap: "wrap" }}>
              <div>
                <span className="milestone-cat-badge award-badge">
                  <Award size={13} /> {a.category || "Honor / Award"}
                </span>
                <h3 style={{ fontSize: "1.15rem", fontWeight: 600, margin: "0 0 0.25rem 0", color: "#f8fafc" }}>{a.awardName}</h3>
                <div style={{ fontSize: "0.85rem", color: "#94a3b8" }}>
                  {a.awardingBody} {a.awardYear ? `(${a.awardYear})` : ""}
                </div>
              </div>

              <div className="milestone-stat-pill award-pill">
                <Sparkles size={12} style={{ marginRight: "4px", display: "inline" }} />
                {a.result || "Conferred"}
              </div>
            </div>

            {a.citationReason && (
              <p style={{ color: "#94a3b8", fontSize: "0.9rem", margin: "0.5rem 0 0 0", lineHeight: 1.5, fontStyle: "italic" }}>
                “{a.citationReason}”
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
