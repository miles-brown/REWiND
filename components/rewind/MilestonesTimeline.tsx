"use client";

import { Award, BarChart3, CheckCircle2, ShieldCheck, Trophy } from "lucide-react";
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
              <div className="milestone-card-top">
                <span className="milestone-cat-badge">
                  <IconComp size={13} aria-hidden="true" />
                  <span>{m.category.replace(/-/g, " ")}</span>
                </span>

                <div className="milestone-stat-pill">
                  {m.metricOrStat || m.date || "Milestone"}
                </div>
              </div>

              <h3 className="milestone-card-title">{m.title}</h3>

              {m.description && (
                <p className="milestone-card-desc">
                  {m.description}
                </p>
              )}
            </div>
          );
        })}

        {/* Structured awards records */}
        {awards.map((a) => {
          const yearVal = a.awardYear || (a as { yearReceived?: string }).yearReceived;
          return (
            <div key={a.id} className="milestone-card award-card" role="listitem">
              <div className="milestone-card-top">
                <span className="milestone-cat-badge award-badge">
                  <Award size={13} aria-hidden="true" />
                  <span>{a.category || "Honor & Recognition"}</span>
                </span>

                <div className="milestone-stat-pill award-pill">
                  <span>{yearVal ? `${a.result || "Conferred"} · ${yearVal}` : a.result || "Conferred"}</span>
                </div>
              </div>

              <h3 className="milestone-card-title">{a.awardName}</h3>
              {a.awardingBody && (
                <div className="milestone-award-body">
                  {a.awardingBody}
                </div>
              )}

              {a.citationReason && (
                <p className="milestone-card-desc milestone-citation-quote">
                  “{a.citationReason}”
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
