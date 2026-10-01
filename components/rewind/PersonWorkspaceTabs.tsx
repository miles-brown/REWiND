"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Building2,
  Calendar,
  Clock,
  ShieldCheck,
  Trophy,
} from "lucide-react";
import type { EventRecord, PersonRecord } from "@/lib/rewind";
import type { PersonRoleRecord } from "@/lib/rewind/roles";
import type { PersonMilestoneRecord } from "@/lib/rewind/milestones";
import { extractYearFromDate } from "@/lib/rewind/dates";
import { PersonTimeline } from "./PersonTimeline";
import { RolesTimeline } from "./RolesTimeline";
import { MilestonesTimeline } from "./MilestonesTimeline";
import { BiographicalSection } from "./BiographicalSection";
import { InclusionBadge } from "./InclusionBadge";

type WorkspaceTab = "events" | "roles" | "milestones" | "biography" | "standards" | "coverage";

export function PersonWorkspaceTabs({
  person,
  records,
  roles,
  milestones,
  years = [],
}: {
  person: PersonRecord;
  records: EventRecord[];
  roles: PersonRoleRecord[];
  milestones: PersonMilestoneRecord[];
  years?: number[];
}) {
  const [activeTab, setActiveTab] = useState<WorkspaceTab>("events");

  // Derive unique years from records if not explicitly passed
  const allYears = years.length > 0
    ? years
    : Array.from(
        new Set(
          records
            .map((r) => extractYearFromDate(r.startDate))
            .filter((y): y is number => y !== null)
        )
      ).sort((a, b) => a - b);

  // Group years by decade eras for coverage view
  const decadesMap = new Map<string, { year: number; count: number }[]>();
  allYears.forEach((y) => {
    const decade = `${Math.floor(y / 10) * 10}s`;
    const count = records.filter((r) => r.startDate.startsWith(String(y))).length;
    const existing = decadesMap.get(decade) || [];
    existing.push({ year: y, count });
    decadesMap.set(decade, existing);
  });
  const decadeEras = Array.from(decadesMap.entries());

  const tabs: { id: WorkspaceTab; label: string; icon: typeof Calendar; count?: number }[] = [
    { id: "events", label: "Events Chronology", icon: Calendar, count: records.length },
    { id: "roles", label: "Official Roles", icon: Building2, count: roles.length || person.career?.length || 0 },
    { id: "milestones", label: "Milestones & Honors", icon: Trophy, count: (milestones.length || 0) + (person.awards?.length || 0) },
    { id: "biography", label: "Biographical Record", icon: BookOpen },
    { id: "standards", label: "Inclusion Basis", icon: ShieldCheck },
    { id: "coverage", label: "Year Coverage", icon: Clock, count: allYears.length },
  ];

  const tabKeys: WorkspaceTab[] = ["events", "roles", "milestones", "biography", "standards", "coverage"];

  const handleTabKeyDown = (e: React.KeyboardEvent) => {
    const currentIndex = tabKeys.indexOf(activeTab);
    if (e.key === "ArrowRight") {
      e.preventDefault();
      const nextTab = tabKeys[(currentIndex + 1) % tabKeys.length];
      setActiveTab(nextTab);
      document.getElementById(`tab-${nextTab}`)?.focus();
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      const prevTab = tabKeys[(currentIndex - 1 + tabKeys.length) % tabKeys.length];
      setActiveTab(prevTab);
      document.getElementById(`tab-${prevTab}`)?.focus();
    } else if (e.key === "Home") {
      e.preventDefault();
      setActiveTab(tabKeys[0]);
      document.getElementById(`tab-${tabKeys[0]}`)?.focus();
    } else if (e.key === "End") {
      e.preventDefault();
      setActiveTab(tabKeys[tabKeys.length - 1]);
      document.getElementById(`tab-${tabKeys[tabKeys.length - 1]}`)?.focus();
    }
  };

  const tabAnnounceText =
    activeTab === "events"
      ? `Events Chronology selected, showing ${records.length} dated events for ${person.name}.`
      : activeTab === "roles"
      ? `Official Roles selected, showing ${roles.length} public mandates for ${person.name}.`
      : activeTab === "milestones"
      ? `Milestones & Honors selected, showing ${milestones.length} achievements for ${person.name}.`
      : activeTab === "biography"
      ? `Biographical Record selected for ${person.name}.`
      : activeTab === "standards"
      ? `Inclusion Basis & Standards selected for ${person.name}.`
      : `Year Coverage Matrix selected, showing ${allYears.length} indexed years for ${person.name}.`;

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
          aria-label={`${person.name} evidence atlas workspace tabs`}
          onKeyDown={handleTabKeyDown}
        >
          {tabs.map(({ id, label, icon: Icon, count }) => {
            const isSelected = activeTab === id;
            return (
              <button
                key={id}
                id={`tab-${id}`}
                role="tab"
                tabIndex={isSelected ? 0 : -1}
                aria-selected={isSelected}
                aria-controls={`tabpanel-${id}`}
                className="workspace-tab-btn"
                onClick={() => setActiveTab(id)}
              >
                <Icon size={15} />
                <span>{label}</span>
                {count !== undefined && count > 0 && (
                  <span className="tab-count-badge">{count}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {activeTab === "events" && (
        <div id="tabpanel-events" role="tabpanel" aria-labelledby="tab-events" className="tab-panel">
          <PersonTimeline person={person} records={records} />
        </div>
      )}

      {activeTab === "roles" && (
        <div id="tabpanel-roles" role="tabpanel" aria-labelledby="tab-roles" className="tab-panel tab-panel-padded">
          <RolesTimeline roles={roles} career={person.career} />
        </div>
      )}

      {activeTab === "milestones" && (
        <div id="tabpanel-milestones" role="tabpanel" aria-labelledby="tab-milestones" className="tab-panel tab-panel-padded">
          <MilestonesTimeline milestones={milestones} awards={person.awards} />
        </div>
      )}

      {activeTab === "biography" && (
        <div id="tabpanel-biography" role="tabpanel" aria-labelledby="tab-biography" className="tab-panel tab-panel-padded">
          <BiographicalSection person={person} />
        </div>
      )}

      {activeTab === "standards" && (
        <div id="tabpanel-standards" role="tabpanel" aria-labelledby="tab-standards" className="tab-panel tab-panel-padded">
          <InclusionBadge person={person} />
        </div>
      )}

      {activeTab === "coverage" && (
        <div id="tabpanel-coverage" role="tabpanel" aria-labelledby="tab-coverage" className="tab-panel tab-panel-padded">
          <div className="coverage-matrix-container">
            <div className="coverage-matrix-header">
              <span className="eyebrow">TEMPORAL FOOTPRINT</span>
              <h2>Indexed Chronological Coverage Matrix</h2>
              <p>
                Distribution of documented historical records for {person.name} across indexed eras and years.
              </p>
            </div>

            <div className="coverage-matrix-eras">
              {decadeEras.map(([decade, yearsList]) => {
                const decadeTotal = yearsList.reduce((acc, curr) => acc + curr.count, 0);
                return (
                  <div key={decade} className="coverage-era-card">
                    <div className="era-card-header">
                      <div className="era-title-group">
                        <Clock size={15} />
                        <h3>{decade}</h3>
                      </div>
                      <span className="era-count-badge">
                        {decadeTotal} event{decadeTotal === 1 ? "" : "s"}
                      </span>
                    </div>

                    <div className="era-years-grid">
                      {yearsList.map(({ year, count }) => (
                        <Link
                          key={year}
                          href={`/person/${person.slug}/${year}`}
                          className="year-matrix-pill"
                          title={`View ${count} events from ${year}`}
                        >
                          <div className="year-num">{year}</div>
                          <div className="year-events-count">{count} {count === 1 ? "evt" : "evts"}</div>
                          <div className="year-density-bar">
                            <span style={{ width: `${Math.min(100, 20 + count * 15)}%` }} />
                          </div>
                          <ArrowRight size={12} className="year-link-arrow" />
                        </Link>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
