"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Landmark,
  Building2,
  Calendar,
  CheckCircle2,
  ArrowRight,
  Search,
  ArrowLeftRight,
  User,
  History,
  Clock,
  Sparkles,
} from "lucide-react";
import type { ProminentOffice } from "@/lib/rewind/offices";

interface RolesExplorerProps {
  offices: ProminentOffice[];
  initialOfficeId?: string;
}

export function RolesExplorer({ offices, initialOfficeId }: RolesExplorerProps) {
  const [selectedOfficeId, setSelectedOfficeId] = useState<string>(
    initialOfficeId && offices.some((o) => o.id === initialOfficeId)
      ? initialOfficeId
      : offices[0]?.id || "president-of-the-united-states"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [activeHolderIndex, setActiveHolderIndex] = useState<number>(0);
  const railContainerRef = useRef<HTMLDivElement>(null);
  const holderCardRefs = useRef<(HTMLElement | null)[]>([]);

  const selectedOffice = useMemo(() => {
    return offices.find((o) => o.id === selectedOfficeId) || offices[0];
  }, [offices, selectedOfficeId]);

  // Filtered holders based on search
  const filteredHolders = useMemo(() => {
    if (!selectedOffice) return [];
    if (!searchQuery.trim()) return selectedOffice.holders;
    const q = searchQuery.toLowerCase().trim();
    return selectedOffice.holders.filter(
      (h) =>
        h.name.toLowerCase().includes(q) ||
        h.ordinalLabel.toLowerCase().includes(q) ||
        (h.party && h.party.toLowerCase().includes(q)) ||
        h.era.toLowerCase().includes(q) ||
        (h.startDate && h.startDate.includes(q)) ||
        (h.endDate && h.endDate.includes(q)) ||
        h.summary.toLowerCase().includes(q)
    );
  }, [selectedOffice, searchQuery]);

  // Unique eras for quick navigation
  const availableEras = useMemo(() => {
    if (!selectedOffice) return [];
    const eras = new Set<string>();
    for (const h of selectedOffice.holders) {
      if (h.era) eras.add(h.era);
    }
    return Array.from(eras);
  }, [selectedOffice]);

  // Active incumbent
  const currentIncumbent = useMemo(() => {
    return selectedOffice?.holders.find((h) => h.isCurrent);
  }, [selectedOffice]);

  // Year span calculated
  const yearSpanText = useMemo(() => {
    if (!selectedOffice || selectedOffice.holders.length === 0) return "";
    const firstYear = selectedOffice.holders[0]?.startDate?.slice(0, 4) || "";
    return `${firstYear} — Present`;
  }, [selectedOffice]);

  // Scrollytelling observer: track which card is currently in view
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const indexStr = entry.target.getAttribute("data-holder-index");
            if (indexStr !== null) {
              setActiveHolderIndex(parseInt(indexStr, 10));
            }
          }
        }
      },
      {
        root: null,
        rootMargin: "-20% 0px -40% 0px",
        threshold: 0.2,
      }
    );

    const cards = holderCardRefs.current;
    cards.forEach((card) => {
      if (card) observer.observe(card);
    });

    return () => {
      cards.forEach((card) => {
        if (card) observer.unobserve(card);
      });
    };
  }, [filteredHolders]);

  const scrollToEra = (era: string) => {
    const target = filteredHolders.find((h) => h.era === era);
    if (!target) return;
    const index = filteredHolders.indexOf(target);
    const element = holderCardRefs.current[index];
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const activeHolder = filteredHolders[activeHolderIndex] || filteredHolders[0];

  return (
    <div className="roles-hub-root">
      {/* 1. Office Selector Ribbon */}
      <section className="roles-selector-ribbon" aria-label="Select prominent constitutional office">
        <div className="roles-selector-scroll">
          {offices.map((office) => {
            const isSelected = office.id === selectedOfficeId;
            return (
              <button
                key={office.id}
                type="button"
                className={`roles-pill-btn ${isSelected ? "roles-pill-btn-active" : ""}`}
                onClick={() => {
                  setSelectedOfficeId(office.id);
                  setSearchQuery("");
                  setActiveHolderIndex(0);
                  window.scrollTo({ top: 200, behavior: "smooth" });
                }}
                aria-pressed={isSelected}
              >
                <span className="roles-pill-flag">{office.flag}</span>
                <span className="roles-pill-title">{office.shortTitle}</span>
                <span className="roles-pill-count">{office.holders.length}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 2. Office Overview Card & Active Telemetry */}
      {selectedOffice && (
        <section className="roles-office-overview" aria-label="Office details and telemetry">
          <div className="roles-overview-main">
            <div className="roles-badge-row">
              <span className="roles-jurisdiction-badge">
                <Landmark size={13} aria-hidden="true" />
                {selectedOffice.jurisdiction}
              </span>
              <span className="roles-est-badge">
                <History size={13} aria-hidden="true" />
                Est. {selectedOffice.establishedYear}
              </span>
              {currentIncumbent && (
                <span className="roles-incumbent-badge">
                  <CheckCircle2 size={13} aria-hidden="true" />
                  Incumbent: {currentIncumbent.name}
                </span>
              )}
            </div>

            <h1 className="roles-office-title">
              <span className="roles-office-flag-lg">{selectedOffice.flag}</span>
              {selectedOffice.title}
            </h1>

            <p className="roles-office-desc">{selectedOffice.description}</p>

            <div className="roles-residence-row">
              <Building2 size={15} aria-hidden="true" />
              <span>Official Seat: <b>{selectedOffice.residence}</b></span>
            </div>
          </div>

          <div className="roles-overview-stats">
            <div className="roles-stat-card">
              <span className="roles-stat-number">{selectedOffice.holders.length}</span>
              <span className="roles-stat-label">Documented Tenures</span>
            </div>
            <div className="roles-stat-card">
              <span className="roles-stat-number">{yearSpanText}</span>
              <span className="roles-stat-label">Chronology Span</span>
            </div>
          </div>
        </section>
      )}

      {/* 3. Search & Era Fast Navigation Bar */}
      <section className="roles-nav-toolbar" aria-label="Timeline navigation controls">
        <div className="roles-search-wrapper">
          <Search size={16} className="roles-search-icon" aria-hidden="true" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setActiveHolderIndex(0);
            }}
            placeholder={`Search ${selectedOffice?.title || "officeholders"} by name, year, party...`}
            className="roles-search-input"
            aria-label="Filter officeholders"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="roles-search-clear"
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>

        {availableEras.length > 0 && !searchQuery && (
          <div className="roles-eras-bar" aria-label="Jump to historical era">
            <span className="roles-eras-label">ERA JUMP:</span>
            <div className="roles-eras-list">
              {availableEras.map((era) => (
                <button
                  key={era}
                  type="button"
                  className="roles-era-tag"
                  onClick={() => scrollToEra(era)}
                >
                  {era}
                </button>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* 4. Scrollytelling Two-Column Stage */}
      <div className="roles-scrollytelling-layout" ref={railContainerRef}>
        {/* Sticky Left Telemetry HUD */}
        <aside className="roles-scrolly-hud" aria-label="Active succession telemetry HUD">
          <div className="roles-hud-sticky">
            <div className="roles-hud-eyebrow">
              <Sparkles size={13} aria-hidden="true" />
              ACTIVE SCROLLYTELLING FOCUS
            </div>

            {activeHolder ? (
              <div className="roles-hud-card">
                <div className="roles-hud-ordinal">
                  {activeHolder.ordinalLabel}
                  {activeHolder.isCurrent && (
                    <span className="roles-badge-active-pulse">CURRENT</span>
                  )}
                </div>

                <h3 className="roles-hud-name">{activeHolder.name}</h3>

                <div className="roles-hud-dates">
                  <Calendar size={13} aria-hidden="true" />
                  <span>
                    {activeHolder.startDate} — {activeHolder.isCurrent ? "Present" : activeHolder.endDate || "—"}
                  </span>
                </div>

                {activeHolder.party && (
                  <div className="roles-hud-party">
                    Affiliation: <b>{activeHolder.party}</b>
                  </div>
                )}

                <p className="roles-hud-summary">{activeHolder.summary}</p>

                {activeHolder.keyEvents && activeHolder.keyEvents.length > 0 && (
                  <div className="roles-hud-milestones">
                    <span className="roles-hud-milestones-title">Landmark Mandates:</span>
                    <ul>
                      {activeHolder.keyEvents.map((evt, idx) => (
                        <li key={idx}>{evt}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="roles-hud-actions">
                  {activeHolder.personSlug ? (
                    <Link
                      href={`/person/${activeHolder.personSlug}`}
                      className="roles-hud-btn roles-hud-btn-primary"
                    >
                      <User size={14} aria-hidden="true" />
                      View Full Dossier
                      <ArrowRight size={13} aria-hidden="true" />
                    </Link>
                  ) : (
                    <span className="roles-dossier-curation-tag">
                      Atlas Dossier in Curation
                    </span>
                  )}

                  {activeHolder.personSlug && (
                    <Link
                      href={`/compare?a=${activeHolder.personSlug}`}
                      className="roles-hud-btn roles-hud-btn-secondary"
                    >
                      <ArrowLeftRight size={14} aria-hidden="true" />
                      Compare Contemporaries
                    </Link>
                  )}
                </div>
              </div>
            ) : (
              <div className="roles-hud-empty">Scroll through the succession rail to focus tenures.</div>
            )}

            <div className="roles-hud-footer">
              <Clock size={13} aria-hidden="true" />
              <span>Scroll down for chronological order</span>
            </div>
          </div>
        </aside>

        {/* Right Main Scrollytelling Succession Rail */}
        <main
          className="roles-succession-rail"
          role="list"
          aria-label={`${selectedOffice?.title || "Office"} chronological succession timeline`}
        >
          {filteredHolders.length === 0 ? (
            <div className="roles-no-results">
              <Search size={32} style={{ margin: "0 auto 1rem", opacity: 0.5 }} />
              <h3>No officeholders match &ldquo;{searchQuery}&rdquo;</h3>
              <p>Try searching by surname, presidential number, party, or a four-digit year.</p>
              <button
                type="button"
                className="roles-reset-btn"
                onClick={() => setSearchQuery("")}
              >
                Reset Search
              </button>
            </div>
          ) : (
            filteredHolders.map((holder, idx) => {
              const isActive = idx === activeHolderIndex;
              const startYear = holder.startDate ? holder.startDate.slice(0, 4) : "—";
              const endYear = holder.isCurrent ? "Present" : holder.endDate ? holder.endDate.slice(0, 4) : "—";

              return (
                <article
                  key={`${holder.ordinal}-${holder.name}-${holder.startDate}`}
                  data-holder-index={idx}
                  ref={(el) => {
                    holderCardRefs.current[idx] = el;
                  }}
                  className={`roles-scrolly-card ${isActive ? "roles-scrolly-card-active" : ""} ${
                    holder.isCurrent ? "roles-scrolly-card-incumbent" : ""
                  }`}
                  role="listitem"
                  aria-current={isActive ? "true" : undefined}
                >
                  {/* Timeline Rail Indicator */}
                  <div className="roles-rail-spine" aria-hidden="true">
                    <div className={`roles-rail-node ${holder.isCurrent ? "roles-node-pulsing" : ""}`} />
                  </div>

                  <div className="roles-card-inner">
                    {/* Header */}
                    <div className="roles-card-top">
                      <div className="roles-card-labels">
                        <span className="roles-ordinal-chip">{holder.ordinalLabel}</span>
                        {holder.party && (
                          <span className="roles-party-chip">{holder.party}</span>
                        )}
                        <span className="roles-era-chip">{holder.era}</span>
                      </div>

                      <div className="roles-tenure-tag">
                        <Calendar size={13} aria-hidden="true" />
                        <span>{startYear} — {endYear}</span>
                        {holder.isCurrent && (
                          <span className="roles-current-badge">
                            <CheckCircle2 size={11} aria-hidden="true" /> Active
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Person Identity */}
                    <div className="roles-person-row">
                      <div className="roles-monogram" aria-hidden="true">
                        {holder.name
                          .split(" ")
                          .map((n) => n[0])
                          .filter(Boolean)
                          .slice(0, 2)
                          .join("")}
                      </div>

                      <div className="roles-person-meta">
                        <h2 className="roles-person-name">
                          {holder.personSlug ? (
                            <Link href={`/person/${holder.personSlug}`} className="roles-person-link">
                              {holder.name}
                            </Link>
                          ) : (
                            holder.name
                          )}
                        </h2>
                        <span className="roles-exact-dates">
                          Exact Mandate: {holder.startDate} to {holder.isCurrent ? "Present" : holder.endDate || "Unrecorded"}
                        </span>
                      </div>
                    </div>

                    {/* Historiographical Mandate Summary */}
                    <p className="roles-mandate-summary">{holder.summary}</p>

                    {/* Key Events Chips */}
                    {holder.keyEvents && holder.keyEvents.length > 0 && (
                      <div className="roles-events-chips" aria-label="Key historical events during tenure">
                        {holder.keyEvents.map((evt, eIdx) => (
                          <span key={eIdx} className="roles-event-chip">
                            {evt}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Card Footer Actions */}
                    <div className="roles-card-actions">
                      {holder.personSlug ? (
                        <Link
                          href={`/person/${holder.personSlug}`}
                          className="roles-action-link roles-action-primary"
                        >
                          <User size={13} aria-hidden="true" />
                          View Dossier & Timeline
                          <ArrowRight size={13} aria-hidden="true" />
                        </Link>
                      ) : (
                        <span className="roles-action-disabled">
                          Atlas Dossier in Curation
                        </span>
                      )}

                      {holder.personSlug && (
                        <Link
                          href={`/compare?a=${holder.personSlug}`}
                          className="roles-action-link roles-action-subtle"
                        >
                          <ArrowLeftRight size={13} aria-hidden="true" />
                          Cross-Examine
                        </Link>
                      )}
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </main>
      </div>
    </div>
  );
}
