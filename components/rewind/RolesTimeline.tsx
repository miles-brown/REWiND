"use client";

import { Building2, Calendar, CheckCircle } from "lucide-react";
import type { PersonRoleRecord } from "@/lib/rewind/roles";

export function RolesTimeline({ roles }: { roles: PersonRoleRecord[] }) {
  if (roles.length === 0) {
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
        <Building2 size={32} style={{ margin: "0 auto 1rem", opacity: 0.5 }} />
        <h3>No official roles registered</h3>
        <p style={{ color: "var(--text-muted, #888)", fontSize: "0.9rem" }}>
          Official state offices, cabinet posts, and parliamentary titles are continuously added to the atlas register.
        </p>
      </div>
    );
  }

  return (
    <div className="roles-timeline-container" style={{ margin: "2rem 0" }}>
      <div style={{ marginBottom: "1.5rem" }}>
        <span className="eyebrow">OFFICIAL OFFICES & TENURES</span>
        <h2 style={{ fontSize: "1.5rem", fontWeight: 700, margin: "0.25rem 0" }}>
          Timeline of Roles & Public Offices
        </h2>
        <p style={{ color: "var(--text-muted, #888)", fontSize: "0.9rem" }}>
          Chronological record of official state mandates, cabinet positions, military commands, and party leaderships.
        </p>
      </div>

      <div
        className="roles-list"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        {roles.map((role) => {
          const startYear = role.startDate ? role.startDate.slice(0, 4) : "—";
          const endYear = role.isCurrent ? "Present" : role.endDate ? role.endDate.slice(0, 4) : "—";

          return (
            <div
              key={role.id}
              className="role-card"
              style={{
                background: "var(--bg-surface, #141414)",
                border: "1px solid var(--border-subtle, #2a2a2a)",
                borderRadius: "8px",
                padding: "1.25rem",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "1rem",
              }}
            >
              <div style={{ flex: 1, minWidth: "260px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
                  <h3 style={{ fontSize: "1.1rem", fontWeight: 600, margin: 0 }}>{role.title}</h3>
                  {role.isCurrent && (
                    <span
                      style={{
                        background: "rgba(34, 197, 94, 0.15)",
                        color: "#4ade80",
                        fontSize: "0.75rem",
                        padding: "0.15rem 0.5rem",
                        borderRadius: "4px",
                        fontWeight: 600,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.25rem",
                      }}
                    >
                      <CheckCircle size={12} /> Active Role
                    </span>
                  )}
                </div>
                <div style={{ color: "var(--text-muted, #999)", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <Building2 size={14} />
                  <span>{role.organisationId || "Government & Public Office"}</span>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  background: "var(--bg-subtle, #1a1a1a)",
                  padding: "0.5rem 0.85rem",
                  borderRadius: "6px",
                  border: "1px solid var(--border-subtle, #333)",
                  color: "var(--text-main, #eee)",
                  fontSize: "0.85rem",
                  fontWeight: 500,
                }}
              >
                <Calendar size={14} style={{ color: "var(--brand-accent, #6366f1)" }} />
                <span>{startYear} — {endYear}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
