"use client";

import { Building2, Calendar, CheckCircle } from "lucide-react";
import type { PersonRoleRecord } from "@/lib/rewind/roles";

export function RolesTimeline({ roles }: { roles: PersonRoleRecord[] }) {
  if (roles.length === 0) {
    return (
      <div className="zero-state">
        <Building2 size={32} style={{ margin: "0 auto 1rem", opacity: 0.5 }} />
        <h3>No official roles registered</h3>
        <p style={{ color: "var(--muted, #64747a)", fontSize: "0.9rem" }}>
          Official state offices, cabinet posts, and parliamentary titles are continuously added to the atlas register.
        </p>
      </div>
    );
  }

  return (
    <div className="roles-timeline-container">
      <div className="roles-header">
        <span className="eyebrow">OFFICIAL OFFICES & TENURES</span>
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
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
                  <h3 style={{ fontSize: "1.1rem", fontWeight: 600, margin: 0 }}>{role.title}</h3>
                  {role.isCurrent && (
                    <span className="role-badge-active" aria-label="Currently active role">
                      <CheckCircle size={12} /> Active Role
                    </span>
                  )}
                </div>
                <div style={{ color: "var(--muted, #64747a)", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <Building2 size={14} />
                  <span>{role.organisationId || "Government & Public Office"}</span>
                </div>
              </div>

              <div className="role-tenure-badge">
                <Calendar size={14} style={{ color: "var(--coral, #ff5b43)" }} />
                <span>{startYear} — {endYear}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
