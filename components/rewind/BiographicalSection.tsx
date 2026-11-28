"use client";

import { useState } from "react";
import {
  GraduationCap,
  Briefcase,
  Trophy,
  BookOpen,
  UserCheck,
  Building,
  Award,
  Calendar,
  ShieldAlert,
  Landmark,
  MapPin,
} from "lucide-react";
import type { PersonRecord } from "@/lib/rewind";

export function BiographicalSection({ person }: { person: PersonRecord }) {
  const education = person.education || [];
  const career = person.career || [];
  const awards = person.awards || [];
  const works = person.works || [];
  const stays = person.stays || [];

  const [selectedTab, setSelectedTab] = useState<"career" | "education" | "works" | "awards" | "residences" | "identity">("career");

  const tabKeys: ("career" | "education" | "works" | "awards" | "residences" | "identity")[] = [
    "career",
    "education",
    "works",
    "awards",
    ...(stays.length > 0 ? (["residences"] as const) : []),
    "identity",
  ];

  const activeTab = tabKeys.includes(selectedTab) ? selectedTab : "career";

  const handleTabKeyDown = (e: React.KeyboardEvent) => {
    const currentIndex = tabKeys.indexOf(activeTab);
    if (e.key === "ArrowRight") {
      e.preventDefault();
      const nextTab = tabKeys[(currentIndex + 1) % tabKeys.length];
      setSelectedTab(nextTab);
      document.getElementById(`bio-tab-${nextTab}`)?.focus();
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      const prevTab = tabKeys[(currentIndex - 1 + tabKeys.length) % tabKeys.length];
      setSelectedTab(prevTab);
      document.getElementById(`bio-tab-${prevTab}`)?.focus();
    } else if (e.key === "Home") {
      e.preventDefault();
      setSelectedTab(tabKeys[0]);
      document.getElementById(`bio-tab-${tabKeys[0]}`)?.focus();
    } else if (e.key === "End") {
      e.preventDefault();
      setSelectedTab(tabKeys[tabKeys.length - 1]);
      document.getElementById(`bio-tab-${tabKeys[tabKeys.length - 1]}`)?.focus();
    }
  };

  const tabMeta: Record<typeof activeTab, { label: string; count?: number; unit?: string }> = {
    career: { label: "Public Mandates & Career", count: career.length, unit: "position" },
    education: { label: "Education credentials", count: education.length, unit: "record" },
    works: { label: "Documented Works", count: works.length, unit: "item" },
    awards: { label: "Honours & Awards", count: awards.length, unit: "recognition" },
    residences: { label: "Official Residences & Palaces", count: stays.length, unit: "residence" },
    identity: { label: "Identity & Origins" },
  };

  const currentMeta = tabMeta[activeTab] || { label: "Biographical Record" };
  const tabAnnounceText = currentMeta.count !== undefined
    ? `${currentMeta.label} selected, showing ${currentMeta.count} ${currentMeta.unit}${currentMeta.count === 1 ? "" : "s"} for ${person.name}.`
    : `${currentMeta.label} selected for ${person.name}.`;

  return (
    <section className="biographical-dossier" aria-label="Structured Biographical Dossier">
      {/* Live Region for Screen Readers */}
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {tabAnnounceText}
      </div>

      <div className="section-header bio-section-header">
        <span className="eyebrow">BIOGRAPHICAL RECORD</span>
        <h3>Background, Career & Credentials</h3>
        <p className="bio-section-subtitle">
          Documented public mandates, academic credentials, published works, honours, residences, and verified identity records.
        </p>
      </div>

      {/* Tabs */}
      <div
        className="bio-nav-tabs"
        role="tablist"
        aria-label="Biographical sections"
        onKeyDown={handleTabKeyDown}
      >
        <button
          type="button"
          role="tab"
          id="bio-tab-career"
          tabIndex={activeTab === "career" ? 0 : -1}
          aria-selected={activeTab === "career"}
          aria-controls="bio-tabpanel-career"
          className={`bio-tab ${activeTab === "career" ? "active" : ""}`}
          onClick={() => setSelectedTab("career")}
        >
          <Briefcase size={15} />
          <span>Public Mandates & Career</span>
          <span className="bio-tab-count">{career.length}</span>
        </button>

        <button
          type="button"
          role="tab"
          id="bio-tab-education"
          tabIndex={activeTab === "education" ? 0 : -1}
          aria-selected={activeTab === "education"}
          aria-controls="bio-tabpanel-education"
          className={`bio-tab ${activeTab === "education" ? "active" : ""}`}
          onClick={() => setSelectedTab("education")}
        >
          <GraduationCap size={15} />
          <span>Education</span>
          <span className="bio-tab-count">{education.length}</span>
        </button>

        <button
          type="button"
          role="tab"
          id="bio-tab-works"
          tabIndex={activeTab === "works" ? 0 : -1}
          aria-selected={activeTab === "works"}
          aria-controls="bio-tabpanel-works"
          className={`bio-tab ${activeTab === "works" ? "active" : ""}`}
          onClick={() => setSelectedTab("works")}
        >
          <BookOpen size={15} />
          <span>Documented Works</span>
          <span className="bio-tab-count">{works.length}</span>
        </button>

        <button
          type="button"
          role="tab"
          id="bio-tab-awards"
          tabIndex={activeTab === "awards" ? 0 : -1}
          aria-selected={activeTab === "awards"}
          aria-controls="bio-tabpanel-awards"
          className={`bio-tab ${activeTab === "awards" ? "active" : ""}`}
          onClick={() => setSelectedTab("awards")}
        >
          <Trophy size={15} />
          <span>Honours & Awards</span>
          <span className="bio-tab-count">{awards.length}</span>
        </button>

        {stays.length > 0 && (
          <button
            type="button"
            role="tab"
            id="bio-tab-residences"
            tabIndex={activeTab === "residences" ? 0 : -1}
            aria-selected={activeTab === "residences"}
            aria-controls="bio-tabpanel-residences"
            className={`bio-tab ${activeTab === "residences" ? "active" : ""}`}
            onClick={() => setSelectedTab("residences")}
          >
            <Landmark size={15} />
            <span>Residences & Palaces</span>
            <span className="bio-tab-count">{stays.length}</span>
          </button>
        )}

        <button
          type="button"
          role="tab"
          id="bio-tab-identity"
          tabIndex={activeTab === "identity" ? 0 : -1}
          aria-selected={activeTab === "identity"}
          aria-controls="bio-tabpanel-identity"
          className={`bio-tab ${activeTab === "identity" ? "active" : ""}`}
          onClick={() => setSelectedTab("identity")}
        >
          <UserCheck size={15} />
          <span>Identity & Origins</span>
        </button>
      </div>

      {/* Career */}
      {activeTab === "career" && (
        <div
          className="bio-tab-content"
          role="tabpanel"
          id="bio-tabpanel-career"
          aria-labelledby="bio-tab-career"
        >
          {career.length > 0 ? (
            <div className="bio-timeline-list">
              {career.map((c) => {
                const dateLabel = `${c.startDate || "Date unrecorded"} — ${c.endDate || "End date unrecorded"}`;

                return (
                  <div key={c.id} className="bio-card">
                    <div className="bio-card-header">
                      <h4>{c.positionTitle || (c as { roleTitle?: string }).roleTitle}</h4>
                      <span className="bio-dates">
                        <Calendar size={13} aria-hidden="true" />
                        <span>{dateLabel}</span>
                      </span>
                    </div>
                    <p className="bio-org">
                      <Building size={14} aria-hidden="true" />
                      <span>
                        {c.organisationName}
                        {c.location ? ` · ${c.location}` : ""}
                      </span>
                    </p>
                    {c.appointmentMethod && (
                      <small className="bio-method">Appointment: {c.appointmentMethod}</small>
                    )}
                    {c.notes && <p className="bio-notes">{c.notes}</p>}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="empty-copy">Structured career mandates will be populated as primary government gazettes are indexed.</p>
          )}
        </div>
      )}

      {/* Education */}
      {activeTab === "education" && (
        <div
          className="bio-tab-content"
          role="tabpanel"
          id="bio-tabpanel-education"
          aria-labelledby="bio-tab-education"
        >
          {education.length > 0 ? (
            <div className="bio-timeline-list">
              {education.map((e) => {
                const startVal = e.startDate || (e as { startYear?: string }).startYear || "";
                const endVal = e.endDate || (e as { endYear?: string }).endYear || "";
                const dateRange =
                  startVal && endVal
                    ? `${startVal} — ${endVal}`
                    : startVal || endVal || "Academic credential";

                return (
                  <div key={e.id} className="bio-card">
                    <div className="bio-card-header">
                      <h4>{e.institution}</h4>
                      <span className="bio-dates">
                        <Calendar size={13} aria-hidden="true" />
                        <span>{dateRange}</span>
                      </span>
                    </div>
                    <p className="bio-org">
                      <GraduationCap size={14} aria-hidden="true" />
                      <span>
                        {e.degree || e.qualification || "Academic Study"}
                        {e.subject || (e as { fieldOfStudy?: string }).fieldOfStudy
                          ? ` in ${e.subject || (e as { fieldOfStudy?: string }).fieldOfStudy}`
                          : ""}
                      </span>
                    </p>
                    {e.honours && <small className="bio-honours">Honours: {e.honours}</small>}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="empty-copy">Documented academic records will be populated from university archives.</p>
          )}
        </div>
      )}

      {/* Works */}
      {activeTab === "works" && (
        <div
          className="bio-tab-content"
          role="tabpanel"
          id="bio-tabpanel-works"
          aria-labelledby="bio-tab-works"
        >
          {works.length > 0 ? (
            <div className="bio-grid-list">
              {works.map((w) => {
                const pubDate = w.releaseDate || (w as { publicationYear?: string }).publicationYear;
                return (
                  <div key={w.id} className="bio-card work-card">
                    <div className="bio-card-header">
                      <span className="work-type-pill">{w.workType || "Publication"}</span>
                      {pubDate && (
                        <span className="bio-dates">
                          <Calendar size={12} aria-hidden="true" />
                          <span>{pubDate}</span>
                        </span>
                      )}
                    </div>
                    <h4>{w.workTitle}</h4>
                    {w.publisherOrVenue && <p className="work-publisher">{w.publisherOrVenue}</p>}
                    {w.significanceNote && <p className="work-note">{w.significanceNote}</p>}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="empty-copy">Authored monographs, treaties, speeches, and registered works will appear here.</p>
          )}
        </div>
      )}

      {/* Awards */}
      {activeTab === "awards" && (
        <div
          className="bio-tab-content"
          role="tabpanel"
          id="bio-tabpanel-awards"
          aria-labelledby="bio-tab-awards"
        >
          {awards.length > 0 ? (
            <div className="bio-grid-list">
              {awards.map((a) => {
                const yearVal = a.awardYear || (a as { yearReceived?: string }).yearReceived;
                const resultVal = a.result || "Conferred";
                return (
                  <div key={a.id} className="bio-card award-card">
                    <div className="award-icon" aria-hidden="true">
                      <Award size={18} />
                    </div>
                    <div className="award-card-body">
                      <div className="bio-card-header">
                        <h4>{a.awardName}</h4>
                        <span className={`result-tag ${resultVal.toLowerCase()}`}>{resultVal}</span>
                      </div>
                      <p className="bio-org">
                        <span>{a.awardingBody}</span>
                        {yearVal ? <span className="award-year-chip">{yearVal}</span> : null}
                      </p>
                      {a.citationReason && <p className="award-citation">“{a.citationReason}”</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="empty-copy">Recognitions, honorary orders, and civil decorations will appear here.</p>
          )}
        </div>
      )}

      {/* Residences & Official Stays */}
      {activeTab === "residences" && (
        <div
          className="bio-tab-content"
          role="tabpanel"
          id="bio-tabpanel-residences"
          aria-labelledby="bio-tab-residences"
        >
          {stays.length > 0 ? (
            <div className="bio-grid-list">
              {stays.map((s) => (
                <div key={s.id} className="bio-card stay-card">
                  <div className="stay-card-header">
                    <h4>{s.stayName || s.venueName}</h4>
                    {s.isPrimaryResidence && (
                      <span className="stay-status-tag confirmed">Primary Residence</span>
                    )}
                    {s.isBaseOfOperations && !s.isPrimaryResidence && (
                      <span className="stay-status-tag provisional">Base of Operations</span>
                    )}
                  </div>
                  <p className="bio-org">
                    <MapPin size={13} aria-hidden="true" />
                    <span>{[s.city, s.country].filter(Boolean).join(", ")}</span>
                  </p>
                  {(s.startDate || s.endDate) && (
                    <span className="bio-dates">
                      <Calendar size={12} aria-hidden="true" />
                      <span>
                        {s.startDate || "Date unrecorded"} — {s.endDate || "Present"}
                      </span>
                    </span>
                  )}
                  {s.notes && <p className="bio-notes">{s.notes}</p>}
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-copy">Documented palaces, official headquarters, and diplomatic residences will appear here.</p>
          )}
        </div>
      )}

      {/* Identity & Sensitive Demographic Context */}
      {activeTab === "identity" && (
        <div
          className="bio-tab-content"
          role="tabpanel"
          id="bio-tabpanel-identity"
          aria-labelledby="bio-tab-identity"
        >
          <div className="identity-fields-grid">
            <div className="identity-item">
              <small>FULL BIRTH NAME</small>
              <b>{person.fullBirthName || person.canonicalName}</b>
            </div>

            {person.aliases && person.aliases.length > 0 && (
              <div className="identity-item">
                <small>FULL TITLES, STYLES & ALIASES</small>
                <b>{person.aliases.join(" · ")}</b>
              </div>
            )}

            <div className="identity-item">
              <small>CITIZENSHIP / LEGAL NATIONALITY</small>
              <b>{person.citizenship && person.citizenship.length > 0 ? person.citizenship.join(", ") : person.nationality || "Not documented"}</b>
            </div>

            <div className="identity-item">
              <small>NATIONAL IDENTITY</small>
              <b>{person.nationalIdentity || person.nationality || "Not documented"}</b>
            </div>

            <div className="identity-item">
              <small>RELIGION & DENOMINATION</small>
              <b>
                {person.religion
                  ? `${person.religion}${person.religiousDenomination ? ` (${person.religiousDenomination})` : ""}`
                  : "Not documented"}
              </b>
              <small className="identity-status">
                Basis: {person.religionStatus || "Not documented"}
              </small>
            </div>

            <div className="identity-item">
              <small>LANGUAGES</small>
              <b>{person.languages && person.languages.length > 0 ? person.languages.join(", ") : "Not documented"}</b>
            </div>

            <div className="identity-item">
              <small>HISTORICAL CLASSIFICATION</small>
              <b>{person.classification ? person.classification.toUpperCase() : "NOT CLASSIFIED"}</b>
            </div>
          </div>

          <div className="identity-disclaimer">
            <ShieldAlert size={16} />
            <small>
              <b>Forensic Identity Standard</b>: In accordance with REWiND standards, religion, ethnicity, and national identity are recorded strictly from verifiable public self-identification or official biographies, never inferred from surnames, appearance, or parentage.
            </small>
          </div>
        </div>
      )}
    </section>
  );
}
