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
          const endYear = role.isCurrent ? "Present" : role.endDate ? role.endDate.slice(0, 4) : "Present";

          return (
            <div key={role.id} className="role-card" role="listitem">
              <div className="role-card-body">
                <div className="role-card-title-row">
                  <h3 className="role-card-title">{role.title}</h3>
                  {role.isCurrent && (
                    <span className="role-badge-active" aria-label="Currently active role">
                      <CheckCircle2 size={12} aria-hidden="true" /> Active Role
                    </span>
                  )}
                </div>
                <div className="role-org-row">
                  <Building2 size={14} aria-hidden="true" />
                  <span>{role.organisationName || role.organisationId || "Government & Public Office"}</span>
                </div>
              </div>

              <div className="role-tenure-badge">
                <Calendar size={13} aria-hidden="true" />
                <span>{startYear} — {endYear}</span>
              </div>
            </div>
          );
        })}

        {/* Structured career records if distinct from roles */}
        {career
          .filter((c) => {
            const cTitle = (c.positionTitle || (c as { roleTitle?: string }).roleTitle || "").toLowerCase();
            return cTitle && !roles.some((r) => r.title.toLowerCase() === cTitle);
          })
          .map((c) => {
            const startText = c.startDate ? c.startDate.slice(0, 4) : "";
            const endText = c.endDate
              ? c.endDate.slice(0, 4)
              : (c as { isCurrent?: boolean }).isCurrent || startText
              ? "Present"
              : "";
            const tenureText = startText ? `${startText} — ${endText || "Present"}` : endText || "Tenure documented";

            return (
              <div key={c.id} className="role-card career-item" role="listitem">
                <div className="role-card-body">
                  <div className="role-card-title-row">
                    <h3 className="role-card-title">{c.positionTitle || (c as { roleTitle?: string }).roleTitle}</h3>
                    {c.occupationCategory && (
                      <span className="role-type-tag">
                        <Award size={11} aria-hidden="true" /> {c.occupationCategory}
                      </span>
                    )}
                  </div>
                  <div className="role-org-row">
                    <Building2 size={14} aria-hidden="true" />
                    <span>
                      {c.organisationName}
                      {c.location ? ` · ${c.location}` : ""}
                    </span>
                  </div>
                  {c.appointmentMethod && (
                    <small className="role-appointment-meta">
                      Appointment: {c.appointmentMethod}
                    </small>
                  )}
                  {c.notes && (
                    <p className="role-notes-copy">
                      {c.notes}
                    </p>
                  )}
                </div>

                <div className="role-tenure-badge">
                  <Calendar size={13} aria-hidden="true" />
                  <span>{tenureText}</span>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}
