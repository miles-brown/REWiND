"use client";

import { Building2, Calendar, CheckCircle2, Award } from "lucide-react";
import type { PersonRoleRecord } from "@/lib/rewind/roles";
import type { PersonCareer } from "@/lib/rewind/types";

export function RolesTimeline({
  roles,
  career = [],
}: {
  roles: PersonRoleRecord[];
  career?: PersonCareer[];
}) {
  const hasItems = roles.length > 0 || career.length > 0;

  if (!hasItems) {
    return (
      <div className="zero-state">
        <Building2 size={36} style={{ margin: "0 auto 1rem", opacity: 0.5 }} />
        <h3>No official roles registered</h3>
        <p style={{ color: "var(--muted, #94a3b8)", fontSize: "0.9rem" }}>
          Official state offices, cabinet posts, and parliamentary titles are continuously added to the atlas register.
        </p>
      </div>
    );
  }

  return (
    <div className="roles-timeline-container">
      <div className="roles-header">
        <span className="eyebrow">OFFICIAL OFFICES & MANDATES</span>
        <h2>Timeline of Roles & Public Offices</h2>
        <p>
          Chronological record of official state mandates, cabinet positions, military commands, and party leaderships.
        </p>
      </div>

      <div className="roles-list" role="list" aria-label="Official roles and public offices timeline">
        {roles.map((role) => {
          const startYear = role.startDate ? role.startDate.slice(0, 4) : "—";
          const endYear = role.isCurrent ? "Present" : role.endDate ? role.endDate.slice(0, 4) : "—";

          return (
            <div key={role.id} className="role-card" role="listitem">
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem", flexWrap: "wrap" }}>
                  <h3 style={{ fontSize: "1.1rem", fontWeight: 600, margin: 0, color: "#f8fafc" }}>{role.title}</h3>
                  {role.isCurrent && (
                    <span className="role-badge-active" aria-label="Currently active role">
                      <CheckCircle2 size={12} /> Active Role
                    </span>
                  )}
                </div>
                <div style={{ color: "#94a3b8", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "0.4rem", marginTop: "4px" }}>
                  <Building2 size={14} />
                  <span>{role.organisationName || role.organisationId || "Government & Public Office"}</span>
                </div>
              </div>

              <div className="role-tenure-badge">
                <Calendar size={14} style={{ color: "#38bdf8" }} />
                <span>{startYear} — {endYear}</span>
              </div>
            </div>
          );
        })}

        {/* Structured career records if distinct from roles */}
        {career.filter((c) => !roles.some((r) => r.title.toLowerCase() === c.positionTitle.toLowerCase())).map((c) => (
          <div key={c.id} className="role-card career-item" role="listitem">
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem", flexWrap: "wrap" }}>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 600, margin: 0, color: "#f8fafc" }}>{c.positionTitle}</h3>
                {c.occupationCategory && (
                  <span className="role-type-tag">
                    <Award size={11} /> {c.occupationCategory}
                  </span>
                )}
              </div>
              <div style={{ color: "#94a3b8", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "0.4rem", marginTop: "4px" }}>
                <Building2 size={14} />
                <span>{c.organisationName}{c.location ? ` · ${c.location}` : ""}</span>
              </div>
              {c.appointmentMethod && (
                <small style={{ color: "#94a3b8", display: "block", marginTop: "4px" }}>
                  Appointment: {c.appointmentMethod}
                </small>
              )}
              {c.notes && (
                <p style={{ fontSize: "0.85rem", color: "#94a3b8", margin: "6px 0 0 0", lineHeight: 1.4 }}>
                  {c.notes}
                </p>
              )}
            </div>

            <div className="role-tenure-badge">
              <Calendar size={14} style={{ color: "#38bdf8" }} />
              <span>{c.startDate || "Date unrecorded"} — {c.endDate || "End date unrecorded"}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
