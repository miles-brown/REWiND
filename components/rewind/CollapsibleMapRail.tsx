"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Compass,
  MapPin,
  Maximize2,
  Navigation,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import type { EventRecord, PersonStayRecord } from "@/lib/rewind/types";
import type { resolveJourneyTransport } from "@/lib/rewind/transport";
import { MapGraphic } from "./MapGraphic";

export type ActiveJourneyType = ReturnType<typeof resolveJourneyTransport>;
export type ActiveStayType =
  | PersonStayRecord
  | { stayName?: string; venueName?: string; startDate?: string; endDate?: string }
  | null;

export interface CollapsibleMapRailProps {
  events: EventRecord[];
  allEvents?: EventRecord[];
  currentIndex?: number;
  selected?: string;
  onSelect?: (id: string) => void;
  activeStay?: ActiveStayType;
  activeJourney?: ActiveJourneyType | null;
  currentEvent?: EventRecord | null;
  progress?: number;
  className?: string;
  defaultCollapsed?: boolean;
  onCollapseChange?: (collapsed: boolean) => void;
}

export function CollapsibleMapRail({
  events,
  allEvents,
  currentIndex = 0,
  selected,
  onSelect,
  activeStay,
  activeJourney,
  currentEvent,
  progress = 0,
  className = "",
  defaultCollapsed = false,
  onCollapseChange,
}: CollapsibleMapRailProps) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  const toggleCollapse = useCallback(() => {
    setIsCollapsed((prev) => {
      const next = !prev;
      onCollapseChange?.(next);
      return next;
    });
  }, [onCollapseChange]);

  // Global keyboard shortcut: 'm' or 'M' toggles map rail
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }
      if (e.key === "m" || e.key === "M") {
        if (!e.ctrlKey && !e.metaKey && !e.altKey) {
          e.preventDefault();
          toggleCollapse();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleCollapse]);

  const activeCity = currentEvent?.city || "Worldwide";
  const activeCountry = currentEvent?.country || "";
  const activeLat = currentEvent?.latitude != null ? currentEvent.latitude.toFixed(3) : null;
  const activeLng = currentEvent?.longitude != null ? currentEvent.longitude.toFixed(3) : null;

  return (
    <aside
      id="geospatial-workstation-rail"
      className={`workstation-map-rail transition-all duration-300 ease-in-out ${
        isCollapsed ? "is-collapsed" : "is-expanded"
      } ${className}`}
      aria-label="Geospatial Map & Telemetry Rail"
      data-expanded={!isCollapsed}
    >
      {isCollapsed ? (
        /* MINIMIZED RAIL (64px) */
        <div className="rail-minimized-strip" role="region" aria-label="Minimized Map Rail">
          <button
            type="button"
            className="rail-toggle-btn expand-btn"
            onClick={toggleCollapse}
            aria-label="Expand map rail (Hotkey: M)"
            title="Expand map rail (Hotkey: M)"
          >
            <PanelLeftOpen size={18} />
            <span className="sr-only">Expand Map</span>
          </button>

          <div className="rail-minimized-indicators" aria-hidden="true">
            <span className="radar-pulse-dot" />
            <Compass size={16} className="compass-icon text-sky-400" />
            <div className="vertical-label">
              <span>{activeCity}</span>
              {activeLat && activeLng && (
                <small className="mono-coords font-mono">{activeLat}°N</small>
              )}
            </div>
          </div>

          <button
            type="button"
            className="rail-quick-expand-pill"
            onClick={toggleCollapse}
            aria-label="Open Map Stage"
          >
            <Maximize2 size={12} />
            <span>MAP</span>
          </button>
        </div>
      ) : (
        /* EXPANDED WORKSTATION RAIL (40% desktop) */
        <div className="rail-expanded-container">
          <div className="rail-header-bar">
            <div className="rail-telemetry-header">
              <div className="telemetry-city-row">
                <MapPin size={14} className="text-sky-400" />
                <span className="telemetry-city font-semibold">{activeCity}</span>
                {activeCountry && (
                  <span className="telemetry-country text-slate-400">· {activeCountry}</span>
                )}
              </div>
              {activeLat && activeLng && (
                <div className="telemetry-coords-row font-mono text-xs text-slate-400">
                  <span>LAT {activeLat}°</span>
                  <span>LNG {activeLng}°</span>
                  {progress > 0 && <span className="text-sky-400">· {progress}%</span>}
                </div>
              )}
            </div>

            <div className="rail-header-actions">
              {activeStay && (
                <span
                  className="rail-stay-badge"
                  title={`Base of Operations: ${activeStay.stayName || activeStay.venueName}`}
                >
                  <span aria-hidden="true">🏨 </span>
                  <span className="truncate max-w-[120px]">
                    {activeStay.stayName || activeStay.venueName}
                  </span>
                </span>
              )}

              <button
                type="button"
                className="rail-toggle-btn collapse-btn"
                onClick={toggleCollapse}
                aria-label="Minimize map to 64px rail (Hotkey: M)"
                title="Minimize map to 64px rail (Hotkey: M)"
              >
                <PanelLeftClose size={16} />
                <span className="btn-text text-xs">Minimize</span>
              </button>
            </div>
          </div>

          {activeJourney?.isJourney && (
            <div className="rail-active-journey-banner" title={activeJourney.description}>
              <Navigation size={13} className="text-amber-400 shrink-0" />
              <span className="truncate">
                {activeJourney.label}: {activeJourney.originCity} → {activeJourney.destinationCity}
              </span>
              <span className="font-mono text-xs ml-auto shrink-0 text-amber-300">
                {activeJourney.formattedDistance}
              </span>
            </div>
          )}

          <div className="rail-map-stage-wrapper">
            <MapGraphic
              events={events}
              allEvents={allEvents}
              currentIndex={currentIndex}
              selected={selected}
              onSelect={onSelect}
            />
          </div>
        </div>
      )}
    </aside>
  );
}
