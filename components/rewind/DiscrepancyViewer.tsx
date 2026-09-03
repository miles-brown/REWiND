"use client";

import { useState } from "react";
import { AlertTriangle, CheckCircle, FileSearch, ShieldAlert, X } from "lucide-react";
import type { EventRecord } from "@/data/rewind";

export function DiscrepancyViewer({
  event,
  isOpen,
  onClose,
}: {
  event: EventRecord;
  isOpen: boolean;
  onClose: () => void;
}) {
  const [activeTab, setActiveTab] = useState<"findings" | "provenance">("findings");

  if (!isOpen) return null;

  const isDisputed = event.verificationStatus === "disputed" || event.confidence === "moderate" || event.confidence === "limited";

  return (
    <div className="discrepancy-modal-overlay" role="dialog" aria-modal="true" aria-label="Evidence Discrepancy & Verification Audit">
      <div className="discrepancy-modal-backdrop" onClick={onClose} />
      <div className="discrepancy-modal-container">
        <header className="discrepancy-modal-header">
          <div className="discrepancy-title">
            <ShieldAlert size={18} className={isDisputed ? "alert-gold" : "alert-green"} />
            <div>
              <b>Forensic Audit & Evidentiary Scrutiny</b>
              <small>{event.eventName}</small>
            </div>
          </div>
          <button className="discrepancy-close-btn" onClick={onClose} aria-label="Close audit viewer">
            <X size={18} />
          </button>
        </header>

        <div className="discrepancy-tabs">
          <button
            className={`d-tab ${activeTab === "findings" ? "active" : ""}`}
            onClick={() => setActiveTab("findings")}
          >
            Evidentiary Status & Findings
          </button>
          <button
            className={`d-tab ${activeTab === "provenance" ? "active" : ""}`}
            onClick={() => setActiveTab("provenance")}
          >
            Provenance Trail ({event.provenance?.length || 0})
          </button>
        </div>

        <div className="discrepancy-body">
          {activeTab === "findings" && (
            <div className="findings-section">
              <div className={`status-callout ${event.verificationStatus}`}>
                <div className="callout-icon">
                  {event.verificationStatus === "verified" ? (
                    <CheckCircle size={20} />
                  ) : (
                    <AlertTriangle size={20} />
                  )}
                </div>
                <div>
                  <h4>Classification: {event.verificationStatus.toUpperCase()} (Confidence: {event.confidence.toUpperCase()})</h4>
                  <p>
                    {event.verificationStatus === "verified"
                      ? "This event is corroborated by direct primary source documentation (e.g. government stenographic transcripts, timestamped broadcast recordings, or signed diplomatic instruments)."
                      : "This record is documented in contemporary press accounts or secondary summaries, but additional corroboration is required before achieving full tier-1 verified status."}
                  </p>
                </div>
              </div>

              {event.notes && (
                <div className="research-analysis-card">
                  <span className="eyebrow"><FileSearch size={13} /> ATLAS RESEARCH NOTE</span>
                  <p>{event.notes}</p>
                </div>
              )}

              <div className="evidentiary-breakdown-grid">
                <div className="breakdown-item">
                  <small>Temporal Precision</small>
                  <b>{event.datePrecision.toUpperCase()} ({event.startDate})</b>
                </div>
                <div className="breakdown-item">
                  <small>Geospatial Precision</small>
                  <b>{event.locationPrecision.toUpperCase()} ({event.city}, {event.country})</b>
                </div>
                <div className="breakdown-item">
                  <small>Source Medium</small>
                  <b>{event.medium.join(", ").toUpperCase()}</b>
                </div>
                <div className="breakdown-item">
                  <small>Audit Review Date</small>
                  <b>{event.reviewedAt || "2026-08-31"}</b>
                </div>
              </div>
            </div>
          )}

          {activeTab === "provenance" && (
            <div className="provenance-section">
              {event.provenance && event.provenance.length > 0 ? (
                <ul className="provenance-timeline">
                  {event.provenance.map((item, idx) => (
                    <li key={idx} className="provenance-item">
                      <span className="prov-dot" />
                      <div className="prov-content">
                        <span className="prov-step">Verification Step {idx + 1}</span>
                        <p>{item}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="zero-state-compact">
                  <FileSearch size={24} />
                  <p>Standard archival provenance recorded in primary source index.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
