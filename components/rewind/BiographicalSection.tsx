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
} from "lucide-react";
import type { PersonRecord } from "@/lib/rewind";

export function BiographicalSection({ person }: { person: PersonRecord }) {
  const [activeTab, setActiveTab] = useState<"career" | "education" | "works" | "awards" | "identity">("career");

  const education = person.education || [];
  const career = person.career || [];
  const awards = person.awards || [];
  const works = person.works || [];

  return (
    <section className="biographical-dossier" aria-label="Structured Biographical Dossier">
      <div className="section-header">
        <span className="eyebrow">STRUCTURED BIOGRAPHICAL DOSSIER</span>
        <h3>Documented Record & Background</h3>
      </div>

      {/* Tabs */}
      <div className="bio-nav-tabs">
        <button
          className={`bio-tab ${activeTab === "career" ? "active" : ""}`}
          onClick={() => setActiveTab("career")}
        >
          <Briefcase size={15} />
          <span>Public Mandates & Career ({career.length})</span>
        </button>

        <button
          className={`bio-tab ${activeTab === "education" ? "active" : ""}`}
          onClick={() => setActiveTab("education")}
        >
          <GraduationCap size={15} />
          <span>Education ({education.length})</span>
        </button>

        <button
          className={`bio-tab ${activeTab === "works" ? "active" : ""}`}
          onClick={() => setActiveTab("works")}
        >
          <BookOpen size={15} />
          <span>Documented Works ({works.length})</span>
        </button>

        <button
          className={`bio-tab ${activeTab === "awards" ? "active" : ""}`}
          onClick={() => setActiveTab("awards")}
        >
          <Trophy size={15} />
          <span>Honours & Awards ({awards.length})</span>
        </button>

        <button
          className={`bio-tab ${activeTab === "identity" ? "active" : ""}`}
          onClick={() => setActiveTab("identity")}
        >
          <UserCheck size={15} />
          <span>Identity & Origins</span>
        </button>
      </div>

      {/* Career */}
      {activeTab === "career" && (
        <div className="bio-tab-content">
          {career.length > 0 ? (
            <div className="bio-timeline-list">
              {career.map((c) => (
                <div key={c.id} className="bio-card">
                  <div className="bio-card-header">
                    <h4>{c.positionTitle}</h4>
                    <span className="bio-dates">
                      {c.startDate || "Date unrecorded"} — {c.endDate || "Present"}
                    </span>
                  </div>
                  <p className="bio-org">
                    <Building size={14} /> {c.organisationName}
                    {c.location ? ` · ${c.location}` : ""}
                  </p>
                  {c.appointmentMethod && (
                    <small className="bio-method">Appointment: {c.appointmentMethod}</small>
                  )}
                  {c.notes && <p className="bio-notes">{c.notes}</p>}
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-copy">Structured career mandates will be populated as primary government gazettes are indexed.</p>
          )}
        </div>
      )}

      {/* Education */}
      {activeTab === "education" && (
        <div className="bio-tab-content">
          {education.length > 0 ? (
            <div className="bio-timeline-list">
              {education.map((e) => (
                <div key={e.id} className="bio-card">
                  <div className="bio-card-header">
                    <h4>{e.institution}</h4>
                    <span className="bio-dates">
                      {e.startDate} — {e.endDate || "Completed"}
                    </span>
                  </div>
                  <p className="bio-org">
                    <GraduationCap size={14} /> {e.degree || e.qualification || "Attended"}
                    {e.subject ? ` in ${e.subject}` : ""}
                  </p>
                  {e.honours && <small className="bio-honours">Honours: {e.honours}</small>}
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-copy">Documented academic records will be populated from university archives.</p>
          )}
        </div>
      )}

      {/* Works */}
      {activeTab === "works" && (
        <div className="bio-tab-content">
          {works.length > 0 ? (
            <div className="bio-grid-list">
              {works.map((w) => (
                <div key={w.id} className="bio-card work-card">
                  <span className="work-type-pill">{w.workType}</span>
                  <h4>{w.workTitle}</h4>
                  {w.releaseDate && <small className="work-date">Published: {w.releaseDate}</small>}
                  {w.publisherOrVenue && <p className="work-publisher">{w.publisherOrVenue}</p>}
                  {w.significanceNote && <p className="work-note">{w.significanceNote}</p>}
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-copy">Authored monographs, treaties, speeches, and registered works will appear here.</p>
          )}
        </div>
      )}

      {/* Awards */}
      {activeTab === "awards" && (
        <div className="bio-tab-content">
          {awards.length > 0 ? (
            <div className="bio-grid-list">
              {awards.map((a) => (
                <div key={a.id} className="bio-card award-card">
                  <div className="award-icon">
                    <Award size={18} />
                  </div>
                  <div>
                    <h4>{a.awardName}</h4>
                    <small>{a.awardingBody} {a.awardYear ? `(${a.awardYear})` : ""}</small>
                    <span className={`result-tag ${a.result}`}>{a.result}</span>
                    {a.citationReason && <p className="award-citation">{a.citationReason}</p>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-copy">Recognitions, honorary orders, and civil decorations will appear here.</p>
          )}
        </div>
      )}

      {/* Identity & Sensitive Demographic Context */}
      {activeTab === "identity" && (
        <div className="bio-tab-content">
          <div className="identity-fields-grid">
            <div className="identity-item">
              <small>FULL BIRTH NAME</small>
              <b>{person.fullBirthName || person.canonicalName}</b>
            </div>

            <div className="identity-item">
              <small>CITIZENSHIP / LEGAL NATIONALITY</small>
              <b>{person.citizenship && person.citizenship.length > 0 ? person.citizenship.join(", ") : person.nationality || "Established by passport/state gazette"}</b>
            </div>

            <div className="identity-item">
              <small>NATIONAL IDENTITY</small>
              <b>{person.nationalIdentity || "Publicly self-identified"}</b>
            </div>

            <div className="identity-item">
              <small>RELIGION & DENOMINATION</small>
              <b>
                {person.religion
                  ? `${person.religion}${person.religiousDenomination ? ` (${person.religiousDenomination})` : ""}`
                  : "Verified through self-identification or official biography"}
              </b>
              <small className="identity-status">
                Basis: {person.religionStatus || "self-identified"}
              </small>
            </div>

            <div className="identity-item">
              <small>LANGUAGES</small>
              <b>{person.languages && person.languages.length > 0 ? person.languages.join(", ") : "Recorded in public speeches"}</b>
            </div>
          </div>

          <div className="identity-disclaimer">
            <small>
              <b>Forensic Identity Standard</b>: In accordance with REWiND standards, religion, ethnicity, and national identity are recorded strictly from verifiable public self-identification or official biographies, never inferred from surnames, appearance, or parentage.
            </small>
          </div>
        </div>
      )}
    </section>
  );
}
