"use client";

import { useState } from "react";
import { Building2, Calendar, Trophy } from "lucide-react";
import type { EventRecord, Person } from "@/data/rewind";
import type { PersonRoleRecord } from "@/lib/rewind/roles";
import type { PersonMilestoneRecord } from "@/lib/rewind/milestones";
import { PersonTimeline } from "./PersonTimeline";
import { RolesTimeline } from "./RolesTimeline";
import { MilestonesTimeline } from "./MilestonesTimeline";

export function PersonWorkspaceTabs({
  person,
  records,
  roles,
  milestones,
}: {
  person: Person;
  records: EventRecord[];
  roles: PersonRoleRecord[];
  milestones: PersonMilestoneRecord[];
}) {
  const [activeTab, setActiveTab] = useState<"events" | "roles" | "milestones">("events");

  return (
    <div className="person-workspace-tabs">
      <div
        className="tabs-header"
        style={{
          display: "flex",
          gap: "0.5rem",
          marginBottom: "1.5rem",
          borderBottom: "1px solid var(--border-subtle, #262626)",
          paddingBottom: "0.75rem",
        }}
      >
        <button
          onClick={() => setActiveTab("events")}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.6rem 1.2rem",
            borderRadius: "6px",
            fontSize: "0.9rem",
            fontWeight: 600,
            border: "1px solid",
            borderColor: activeTab === "events" ? "var(--brand-accent, #6366f1)" : "transparent",
            background: activeTab === "events" ? "var(--bg-surface, #1c1c1c)" : "transparent",
            color: activeTab === "events" ? "#fff" : "var(--text-muted, #888)",
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
        >
          <Calendar size={16} />
          Events Timeline ({records.length})
        </button>

        <button
          onClick={() => setActiveTab("roles")}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.6rem 1.2rem",
            borderRadius: "6px",
            fontSize: "0.9rem",
            fontWeight: 600,
            border: "1px solid",
            borderColor: activeTab === "roles" ? "var(--brand-accent, #6366f1)" : "transparent",
            background: activeTab === "roles" ? "var(--bg-surface, #1c1c1c)" : "transparent",
            color: activeTab === "roles" ? "#fff" : "var(--text-muted, #888)",
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
        >
          <Building2 size={16} />
          Official Roles ({roles.length})
        </button>

        <button
          onClick={() => setActiveTab("milestones")}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.6rem 1.2rem",
            borderRadius: "6px",
            fontSize: "0.9rem",
            fontWeight: 600,
            border: "1px solid",
            borderColor: activeTab === "milestones" ? "var(--brand-accent, #6366f1)" : "transparent",
            background: activeTab === "milestones" ? "var(--bg-surface, #1c1c1c)" : "transparent",
            color: activeTab === "milestones" ? "#fff" : "var(--text-muted, #888)",
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
        >
          <Trophy size={16} />
          Milestones & Records ({milestones.length})
        </button>
      </div>

      {activeTab === "events" && <PersonTimeline person={person} records={records} />}
      {activeTab === "roles" && <RolesTimeline roles={roles} />}
      {activeTab === "milestones" && <MilestonesTimeline milestones={milestones} />}
    </div>
  );
}
