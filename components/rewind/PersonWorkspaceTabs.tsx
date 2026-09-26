"use client";

import { useState } from "react";
import { Building2, Calendar, Trophy } from "lucide-react";
import type { EventRecord, PersonRecord } from "@/lib/rewind";
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
  person: PersonRecord;
  records: EventRecord[];
  roles: PersonRoleRecord[];
  milestones: PersonMilestoneRecord[];
}) {
  const [activeTab, setActiveTab] = useState<"events" | "roles" | "milestones">("events");

  const tabAnnounceText = activeTab === "events"
    ? `Events Timeline selected, showing ${records.length} events for ${person.name}.`
    : activeTab === "roles"
    ? `Official Roles selected, showing ${roles.length} public offices for ${person.name}.`
    : `Milestones & Records selected, showing ${milestones.length} achievements for ${person.name}.`;

  return (
    <div className="person-workspace-tabs">
      {/* Live Region for Screen Readers */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {tabAnnounceText}
      </div>

      <div className="tabs-header-wrap">
        <div
          className="tabs-header"
          role="tablist"
          aria-label={`${person.name} workspace timeline views`}
        >
          <button
            id="tab-events"
            role="tab"
            aria-selected={activeTab === "events"}
            aria-controls="tabpanel-events"
            className={`workspace-tab-btn ${activeTab === "events" ? "active" : ""}`}
            onClick={() => setActiveTab("events")}
          >
            <Calendar size={16} />
            Events Timeline ({records.length})
          </button>

          <button
            id="tab-roles"
            role="tab"
            aria-selected={activeTab === "roles"}
            aria-controls="tabpanel-roles"
            className={`workspace-tab-btn ${activeTab === "roles" ? "active" : ""}`}
            onClick={() => setActiveTab("roles")}
          >
            <Building2 size={16} />
            Official Roles ({roles.length})
          </button>

          <button
            id="tab-milestones"
            role="tab"
            aria-selected={activeTab === "milestones"}
            aria-controls="tabpanel-milestones"
            className={`workspace-tab-btn ${activeTab === "milestones" ? "active" : ""}`}
            onClick={() => setActiveTab("milestones")}
          >
            <Trophy size={16} />
            Milestones & Records ({milestones.length})
          </button>
        </div>
      </div>

      {activeTab === "events" && (
        <div id="tabpanel-events" role="tabpanel" aria-labelledby="tab-events" className="tab-panel">
          <PersonTimeline person={person} records={records} />
        </div>
      )}
      {activeTab === "roles" && (
        <div id="tabpanel-roles" role="tabpanel" aria-labelledby="tab-roles" className="tab-panel tab-panel-padded">
          <RolesTimeline roles={roles} />
        </div>
      )}
      {activeTab === "milestones" && (
        <div id="tabpanel-milestones" role="tabpanel" aria-labelledby="tab-milestones" className="tab-panel tab-panel-padded">
          <MilestonesTimeline milestones={milestones} />
        </div>
      )}
    </div>
  );
}
