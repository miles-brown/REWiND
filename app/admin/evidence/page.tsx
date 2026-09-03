"use client";

import { useCallback, useEffect, useMemo, useState } from "react";


import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Database,
  FileCheck,
  GitMerge,
  Play,
  RefreshCw,
  Scale,
  ShieldAlert,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { Shell } from "@/components/rewind/Shell";

interface CandidateItem {
  id: string;
  fingerprint: string;
  suggestedTitle: string;
  suggestedDate: string;
  suggestedPlace: string | null;
  suggestedParticipants: string | null;
  primarySourceTier: string;
  assignedLane: string;
  duplicateMatchId: string | null;
  duplicateSimilarity: number | null;
  status: string;
  rawExtraction: string;
}

interface AuditItem {
  id: number;
  eventId: string | null;
  candidateId: string | null;
  action: string;
  ruleId: string | null;
  details: string;
  recordedAt: string;
}

interface Stats {
  publishedEventsCount: number;
  verifiedClaimsCount: number;
  primarySourcesCount: number;
  pendingReviewCount: number;
  autoPublishedCount: number;
}

interface ParsedCandidateExtraction {
  summary?: string;
  eventType?: string;
  claims?: { subjectMention: string; statement: string }[];
}

export default function EvidenceControlConsole() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [queue, setQueue] = useState<CandidateItem[]>([]);
  const [audit, setAudit] = useState<AuditItem[]>([]);
  const [activeTab, setActiveTab] = useState<"queue" | "auto" | "duplicates" | "audit">("queue");
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const fetchConsoleData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/evidence");
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
        setQueue(data.queue || []);
        setAudit(data.audit || []);
      }
    } catch (err) {
      console.error("Failed to fetch evidence console data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    async function loadInitial() {
      try {
        const res = await fetch("/api/admin/evidence");
        if (!res.ok) return;
        const data = await res.json();
        if (!ignore) {
          setStats(data.stats);
          setQueue(data.queue || []);
          setAudit(data.audit || []);
          setLoading(false);
        }
      } catch (err) {
        console.error("Failed to fetch initial evidence data:", err);
        if (!ignore) setLoading(false);
      }
    }
    loadInitial();
    return () => {
      ignore = true;
    };
  }, []);


  async function handleAction(action: "approve" | "merge" | "reject", candidateId: string, targetEventId?: string) {
    try {
      const res = await fetch("/api/admin/evidence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          candidateId,
          targetEventId,
          reason: "Editorial review sign-off",
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setStatusMessage(`Candidate ${candidateId} successfully ${action}d.`);
        fetchConsoleData();
        setTimeout(() => setStatusMessage(null), 4000);
      } else {
        setStatusMessage(`Error: ${data.error || "Action failed"}`);
        setTimeout(() => setStatusMessage(null), 4000);
      }
    } catch (err) {
      console.error("Action error:", err);
      setStatusMessage("Network or server error during action execution.");
    }
  }

  const pendingItems = useMemo(
    () => queue.filter((c) => c.status === "pending" && (!c.duplicateSimilarity || c.duplicateSimilarity < 0.75)),
    [queue]
  );
  const duplicateItems = useMemo(
    () => queue.filter((c) => c.duplicateSimilarity && c.duplicateSimilarity >= 0.75),
    [queue]
  );

  return (
    <Shell>
      <div className="evidence-console-main">
        {/* Header */}

        <header className="evidence-console-header">
          <div className="header-meta">
            <span className="forensic-tag">
              <Database size={13} />
              <span>REWiND Evidence Engine</span>
            </span>
            <h1>Autonomous Evidence & Review Console</h1>
            <p>
              Real-time monitoring, candidate claim reconciliation, deduplication, and policy routing for the continuous archival knowledge base.
            </p>
          </div>

          <div className="header-actions">
            <button
              type="button"
              className="refresh-btn"
              onClick={fetchConsoleData}
              title="Refresh Data"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              <span>Refresh</span>
            </button>
          </div>
        </header>

        {statusMessage && (
          <div className="status-banner" role="status" aria-live="polite">
            <CheckCircle2 size={16} />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* 5 Top Stat Cards */}
        <section className="evidence-stats-grid">
          <div className="stat-card">
            <div className="stat-icon published">
              <FileCheck size={18} />
            </div>
            <div className="stat-content">
              <span className="stat-num">{stats?.publishedEventsCount ?? 0}</span>
              <span className="stat-label">Published Events</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon verified">
              <ShieldCheck size={18} />
            </div>
            <div className="stat-content">
              <span className="stat-num">{stats?.verifiedClaimsCount ?? 0}</span>
              <span className="stat-label">Atomic Verified Claims</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon sources">
              <Scale size={18} />
            </div>
            <div className="stat-content">
              <span className="stat-num">{stats?.primarySourcesCount ?? 0}</span>
              <span className="stat-label">Primary Sources (Tier A/B)</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon auto">
              <Play size={18} />
            </div>
            <div className="stat-content">
              <span className="stat-num">{stats?.autoPublishedCount ?? 0}</span>
              <span className="stat-label">Auto-Published</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon review">
              <AlertCircle size={18} />
            </div>
            <div className="stat-content">
              <span className="stat-num">{stats?.pendingReviewCount ?? 0}</span>
              <span className="stat-label">Pending Review</span>
            </div>
          </div>
        </section>

        {/* Tab Navigation */}
        <div className="console-tabs-nav" role="tablist" aria-label="Evidence Console Views">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "queue"}
            className={`tab-btn ${activeTab === "queue" ? "active" : ""}`}
            onClick={() => setActiveTab("queue")}
          >
            <ShieldAlert size={14} />
            <span>Review Queue</span>
            {pendingItems.length > 0 && <b className="tab-badge">{pendingItems.length}</b>}
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "duplicates"}
            className={`tab-btn ${activeTab === "duplicates" ? "active" : ""}`}
            onClick={() => setActiveTab("duplicates")}
          >
            <GitMerge size={14} />
            <span>Duplicate Merges</span>
            {duplicateItems.length > 0 && <b className="tab-badge warning">{duplicateItems.length}</b>}
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "audit"}
            className={`tab-btn ${activeTab === "audit" ? "active" : ""}`}
            onClick={() => setActiveTab("audit")}
          >
            <Clock size={14} />
            <span>Provenance Audit Trail</span>
            {audit.length > 0 && <b className="tab-badge neutral">{audit.length}</b>}
          </button>
        </div>

        {/* Tab Content */}
        <section className="console-tab-stage">
          {/* TAB 1: Review Queue */}
          {activeTab === "queue" && (
            <div className="queue-stage">
              {pendingItems.length === 0 ? (
                <div className="empty-queue-card">
                  <ShieldCheck size={36} />
                  <h3>Review Queue is Clear</h3>
                  <p>All newly discovered evidence satisfies auto-publication policy or has been reviewed.</p>
                </div>
              ) : (
                <div className="candidate-card-list">
                  {pendingItems.map((c: CandidateItem) => {

                    let parsed: ParsedCandidateExtraction = {};
                    try {
                      parsed = JSON.parse(c.rawExtraction) as ParsedCandidateExtraction;
                    } catch {}

                    return (
                      <div key={c.id} className="candidate-card">
                        <div className="candidate-card-header">
                          <div className="candidate-title-block">
                            <span className={`lane-pill ${c.assignedLane}`}>
                              {c.assignedLane.toUpperCase()}
                            </span>
                            <span className="source-tier-pill">{c.primarySourceTier.toUpperCase()}</span>
                            <h3>{c.suggestedTitle}</h3>
                          </div>
                          <span className="candidate-date">{c.suggestedDate}</span>
                        </div>

                        <p className="candidate-summary">{parsed.summary || "No summary provided."}</p>

                        <div className="candidate-vitals">
                          <div>
                            <span className="vital-label">Place:</span>
                            <span>{c.suggestedPlace || "Unspecified"}</span>
                          </div>
                          <div>
                            <span className="vital-label">Event Type:</span>
                            <span>{parsed.eventType || "historical-action"}</span>
                          </div>
                        </div>

                        {/* Claims preview */}
                        {Array.isArray(parsed.claims) && parsed.claims.length > 0 && (
                          <div className="candidate-claims-box">
                            <span className="claims-header">Extracted Claims ({parsed.claims.length}):</span>
                            <ul>
                              {parsed.claims.map((clm, idx) => (
                                <li key={idx}>
                                  <b>{clm.subjectMention}:</b> {clm.statement}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <div className="candidate-actions">
                          <button
                            type="button"
                            className="action-btn approve"
                            onClick={() => handleAction("approve", c.id)}
                          >
                            <CheckCircle2 size={14} />
                            <span>Approve & Publish</span>
                          </button>
                          <button
                            type="button"
                            className="action-btn reject"
                            onClick={() => handleAction("reject", c.id)}
                          >
                            <XCircle size={14} />
                            <span>Reject</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Duplicate Merges */}
          {activeTab === "duplicates" && (
            <div className="duplicates-stage">
              {duplicateItems.length === 0 ? (
                <div className="empty-queue-card">
                  <GitMerge size={36} />
                  <h3>No Unresolved Duplicates</h3>
                  <p>All candidate evidence streams have been cleanly matched or isolated.</p>
                </div>
              ) : (
                <div className="candidate-card-list">
                  {duplicateItems.map((c: CandidateItem) => (

                    <div key={c.id} className="candidate-card duplicate-card">
                      <div className="duplicate-alert-banner">
                        <GitMerge size={15} />
                        <span>
                          Probable Duplicate Match: <b>{Math.round((c.duplicateSimilarity || 0) * 100)}%</b> similarity with existing event <code>{c.duplicateMatchId}</code>
                        </span>
                      </div>

                      <div className="candidate-card-header">
                        <h3>{c.suggestedTitle}</h3>
                        <span className="candidate-date">{c.suggestedDate}</span>
                      </div>

                      <p className="candidate-summary">{c.suggestedPlace}</p>

                      <div className="candidate-actions">
                        <button
                          type="button"
                          className="action-btn merge"
                          onClick={() => handleAction("merge", c.id, c.duplicateMatchId || undefined)}
                        >
                          <GitMerge size={14} />
                          <span>Merge Claims into Existing Record</span>
                        </button>
                        <button
                          type="button"
                          className="action-btn approve"
                          onClick={() => handleAction("approve", c.id)}
                        >
                          <CheckCircle2 size={14} />
                          <span>Publish as Separate Event</span>
                        </button>
                        <button
                          type="button"
                          className="action-btn reject"
                          onClick={() => handleAction("reject", c.id)}
                        >
                          <XCircle size={14} />
                          <span>Reject</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Audit Trail */}
          {activeTab === "audit" && (
            <div className="audit-stage">
              <div className="audit-table-card">
                <table className="audit-table" aria-label="Immutable Evidence Engine Audit Log">
                  <thead>
                    <tr>
                      <th scope="col">Time</th>
                      <th scope="col">Action</th>
                      <th scope="col">Rule / Decision</th>
                      <th scope="col">Target Event / Candidate</th>
                      <th scope="col">Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {audit.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="empty-table-cell">
                          No audit entries recorded yet.
                        </td>
                      </tr>
                    ) : (
                      audit.map((entry) => {
                        let parsed: Record<string, unknown> = {};
                        try {
                          parsed = JSON.parse(entry.details) as Record<string, unknown>;
                        } catch {}

                        return (
                          <tr key={entry.id}>
                            <td className="time-col">
                              <time dateTime={new Date(entry.recordedAt).toISOString()}>
                                {new Date(entry.recordedAt).toISOString().replace("T", " ").slice(0, 19)} UTC
                              </time>
                            </td>

                            <td>
                              <span className={`audit-action-pill ${entry.action}`}>
                                {entry.action}
                              </span>
                            </td>
                            <td className="rule-col">{entry.ruleId || "—"}</td>
                            <td>
                              <code>{entry.eventId || entry.candidateId || "—"}</code>
                            </td>
                            <td className="details-col">
                              <pre>{JSON.stringify(parsed, null, 2)}</pre>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      </div>
    </Shell>
  );
}
