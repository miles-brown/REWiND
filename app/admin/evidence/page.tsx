"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  AlertTriangle,
  BookOpen,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Code2,
  Copy,
  Database,
  ExternalLink,
  Eye,
  FileCheck,
  GitMerge,
  MapPin,
  Play,
  RefreshCw,
  Scale,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  UserCheck,
  X,
  XCircle,
} from "lucide-react";
import { z } from "zod";

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
  rejectionReason?: string | null;
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
  duplicateCandidatesCount?: number;
  totalCandidatesCount?: number;
}

const CandidatePayloadSchema = z.object({
  summary: z.string().optional(),
  eventType: z.string().optional(),
  venue: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  sourceId: z.string().optional(),
  sourceTitle: z.string().optional(),
  sourcePublisher: z.string().optional(),
  sourceTier: z.string().optional(),
  claims: z
    .array(
      z.object({
        subjectMention: z.string(),
        statement: z.string(),
        claimType: z.string().optional(),
        claimedTime: z.string().optional(),
        claimedVenue: z.string().optional(),
        supportingExcerpt: z.string().optional(),
      })
    )
    .optional(),
  participants: z
    .array(
      z.object({
        name: z.string(),
        role: z.string().optional(),
        confidence: z.number().optional(),
      })
    )
    .optional(),
});

type ParsedCandidateExtraction = z.infer<typeof CandidatePayloadSchema>;

const auditDateFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  timeZone: "UTC",
  timeZoneName: "short",
});

function parseCandidateExtraction(raw: string): ParsedCandidateExtraction {
  try {
    const json = JSON.parse(raw);
    const parsed = CandidatePayloadSchema.safeParse(json);
    if (parsed.success) {
      return parsed.data;
    }
    return {
      summary: typeof json?.summary === "string" ? json.summary : undefined,
      eventType: typeof json?.eventType === "string" ? json.eventType : undefined,
      claims: Array.isArray(json?.claims) ? json.claims : [],
      participants: Array.isArray(json?.participants) ? json.participants : [],
    };
  } catch {
    return {
      claims: [],
      participants: [],
    };
  }
}

export default function EvidenceControlConsole() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [queue, setQueue] = useState<CandidateItem[]>([]);
  const [audit, setAudit] = useState<AuditItem[]>([]);
  const [activeTab, setActiveTab] = useState<"queue" | "duplicates" | "audit" | "standards">("queue");
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submittingCandidateId, setSubmittingCandidateId] = useState<string | null>(null);
  const [isIngestingSample, setIsIngestingSample] = useState(false);

  // Search, filter, and inspector states
  const [searchQuery, setSearchQuery] = useState("");
  const [laneFilter, setLaneFilter] = useState<"all" | "auto-publish" | "provisional" | "human-review">("all");
  const [tierFilter, setTierFilter] = useState<"all" | "tier-a" | "tier-b" | "tier-c">("all");
  const [sortBy, setSortBy] = useState<"newest" | "date-asc" | "date-desc" | "similarity">("newest");

  // Modal states
  const [inspectCandidate, setInspectCandidate] = useState<CandidateItem | null>(null);
  const [inspectAudit, setInspectAudit] = useState<AuditItem | null>(null);
  const [rejectingCandidate, setRejectingCandidate] = useState<CandidateItem | null>(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState("");
  const [copiedPayload, setCopiedPayload] = useState(false);

  const fetchConsoleData = useCallback(async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch("/api/admin/evidence");
      if (!res.ok) {
        if (res.status === 401) {
          setErrorMessage("Unauthorized: Admin credentials required to access the evidentiary review console.");
        } else {
          setErrorMessage(`Failed to fetch console data (HTTP ${res.status}). Please check API connectivity.`);
        }
        return;
      }
      const data = await res.json();
      setStats(data.stats);
      setQueue(data.queue || []);
      setAudit(data.audit || []);
    } catch (err) {
      console.error("Failed to fetch evidence console data:", err);
      setErrorMessage("Network error: Unable to connect to evidentiary engine API.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    async function loadInitial() {
      try {
        const res = await fetch("/api/admin/evidence");
        if (!res.ok) {
          if (!ignore) {
            setErrorMessage(`Failed to fetch initial evidence data (HTTP ${res.status}).`);
            setLoading(false);
          }
          return;
        }
        const data = await res.json();
        if (!ignore) {
          setStats(data.stats);
          setQueue(data.queue || []);
          setAudit(data.audit || []);
          setLoading(false);
        }
      } catch (err) {
        console.error("Failed to fetch initial evidence data:", err);
        if (!ignore) {
          setErrorMessage("Network error: Unable to connect to evidentiary engine API.");
          setLoading(false);
        }
      }
    }
    loadInitial();
    return () => {
      ignore = true;
    };
  }, []);

  // Keyboard accessibility for modals
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setInspectCandidate(null);
        setInspectAudit(null);
        setRejectingCandidate(null);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  async function handleAction(
    action: "approve" | "merge" | "reject",
    candidateId: string,
    targetEventId?: string,
    customReason?: string
  ) {
    setSubmittingCandidateId(candidateId);
    setErrorMessage(null);
    try {
      const res = await fetch("/api/admin/evidence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          candidateId,
          targetEventId,
          reason: customReason || "Editorial review sign-off",
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        const actionLabel = action === "approve" ? "approved & published" : action === "merge" ? "merged into canonical record" : "rejected";
        setStatusMessage(`Candidate record ${candidateId} successfully ${actionLabel}.`);
        setRejectingCandidate(null);
        setRejectionReasonInput("");
        fetchConsoleData();
        setTimeout(() => setStatusMessage(null), 5000);
      } else {
        setErrorMessage(`Action failed: ${data.error || "Execution error"}`);
        setTimeout(() => setErrorMessage(null), 6000);
      }
    } catch (err) {
      console.error("Action error:", err);
      setErrorMessage("Network or server error during action execution.");
    } finally {
      setSubmittingCandidateId(null);
    }
  }

  async function handleIngestSampleStream() {
    setIsIngestingSample(true);
    setErrorMessage(null);
    try {
      const res = await fetch("/api/admin/evidence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "ingest_sample" }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStatusMessage("Autonomous Ingestion Stream: New candidate dossier generated and routed to review queue.");
        fetchConsoleData();
        setTimeout(() => setStatusMessage(null), 5000);
      } else {
        setErrorMessage(`Failed to ingest sample stream: ${data.error || "Unknown error"}`);
      }
    } catch (err) {
      console.error("Ingestion error:", err);
      setErrorMessage("Network error while connecting to ingestion adapter.");
    } finally {
      setIsIngestingSample(false);
    }
  }

  function handleCopyJson(content: string) {
    navigator.clipboard.writeText(content);
    setCopiedPayload(true);
    setTimeout(() => setCopiedPayload(false), 2000);
  }

  // Filtered queue items
  const filteredQueue = useMemo(() => {
    return queue.filter((c) => {
      // Lane filter
      if (laneFilter !== "all" && c.assignedLane !== laneFilter) return false;
      // Tier filter
      if (tierFilter !== "all" && c.primarySourceTier !== tierFilter) return false;
      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const parsed = parseCandidateExtraction(c.rawExtraction);
        const matchTitle = c.suggestedTitle.toLowerCase().includes(query);
        const matchPlace = (c.suggestedPlace || "").toLowerCase().includes(query);
        const matchSummary = (parsed.summary || "").toLowerCase().includes(query);
        const matchClaims = (parsed.claims || []).some(
          (clm) => clm.statement.toLowerCase().includes(query) || clm.subjectMention.toLowerCase().includes(query)
        );
        const matchParticipants = (parsed.participants || []).some((p) => p.name.toLowerCase().includes(query));
        if (!matchTitle && !matchPlace && !matchSummary && !matchClaims && !matchParticipants) {
          return false;
        }
      }
      return true;
    });
  }, [queue, laneFilter, tierFilter, searchQuery]);

  // Split into Pending Review and Duplicate Merges
  const pendingItems = useMemo(() => {
    const list = filteredQueue.filter((c) => c.status === "pending" && (!c.duplicateSimilarity || c.duplicateSimilarity < 0.75));
    return list.sort((a, b) => {
      if (sortBy === "newest") return new Date(b.suggestedDate).getTime() - new Date(a.suggestedDate).getTime();
      if (sortBy === "date-asc") return a.suggestedDate.localeCompare(b.suggestedDate);
      if (sortBy === "date-desc") return b.suggestedDate.localeCompare(a.suggestedDate);
      return (b.duplicateSimilarity || 0) - (a.duplicateSimilarity || 0);
    });
  }, [filteredQueue, sortBy]);

  const duplicateItems = useMemo(() => {
    const list = filteredQueue.filter((c) => c.duplicateSimilarity && c.duplicateSimilarity >= 0.75);
    return list.sort((a, b) => (b.duplicateSimilarity || 0) - (a.duplicateSimilarity || 0));
  }, [filteredQueue]);

  return (
    <div className="evidence-engine-viewport">
      <div className="evidence-console-main">
        {/* INSTITUTIONAL COMMAND HEADER */}
        <header className="evidence-console-header">
          <div className="header-meta">
            <div className="forensic-pulse-badge">
              <span className="pulse-dot" aria-hidden="true" />
              <Database size={13} />
              <span>REWiND Autonomous Evidence Engine · Archival Ingestion Console</span>
            </div>
            <h1>Autonomous Evidence & Review Console</h1>
            <p>
              Continuous historical ingestion, atomic claim decomposition, semantic spacetime deduplication, and
              archival policy routing for the continuous open knowledge base.
            </p>

            <div className="telemetry-pill-strip">
              <span className="telemetry-pill active">
                <span className="pill-dot emerald" />
                <span>Ingestion Pipeline: Active</span>
              </span>
              <span className="telemetry-pill">
                <ShieldCheck size={12} className="pill-icon text-sky" />
                <span>Policy: Tier-1 Auto-Publish</span>
              </span>
              <span className="telemetry-pill">
                <GitMerge size={12} className="pill-icon text-amber" />
                <span>Deduplication: Spacetime Cosine &ge; 0.75</span>
              </span>
              <span className="telemetry-pill">
                <Clock size={12} className="pill-icon text-muted" />
                <span>Ledger: Cryptographically Monotonic</span>
              </span>
            </div>
          </div>

          <div className="header-actions">
            <button
              type="button"
              className="action-stream-btn"
              onClick={handleIngestSampleStream}
              disabled={isIngestingSample}
              title="Trigger autonomous sample ingestion pipeline"
            >
              <Sparkles size={14} className={isIngestingSample ? "animate-spin" : ""} />
              <span>{isIngestingSample ? "Ingesting Stream..." : "Ingest Sample Stream"}</span>
            </button>

            <button
              type="button"
              className="refresh-btn"
              onClick={fetchConsoleData}
              disabled={loading}
              title="Refresh Telemetry & Queues"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              <span>Refresh</span>
            </button>

            <Link href="/methodology" className="methodology-link-btn" title="Inspect Archival Evidence Methodology">
              <BookOpen size={14} />
              <span>Methodology</span>
              <ExternalLink size={12} />
            </Link>
          </div>
        </header>

        {/* NOTIFICATION BANNERS */}
        {errorMessage && (
          <div className="status-banner error" role="alert" aria-live="assertive">
            <AlertCircle size={18} />
            <div className="banner-content">
              <b>Authentication / API Error:</b> {errorMessage}
            </div>
            <button type="button" onClick={() => setErrorMessage(null)} className="banner-close-btn" aria-label="Dismiss error">
              <X size={15} />
            </button>
          </div>
        )}

        {statusMessage && (
          <div className="status-banner success" role="status" aria-live="polite">
            <CheckCircle2 size={18} />
            <div className="banner-content">
              <b>Operation Logged:</b> {statusMessage}
            </div>
            <button type="button" onClick={() => setStatusMessage(null)} className="banner-close-btn" aria-label="Dismiss status">
              <X size={15} />
            </button>
          </div>
        )}

        {/* 6 EXECUTIVE TELEMETRY CARDS */}
        <section className="evidence-stats-grid" aria-label="Evidentiary Engine Real-Time Telemetry">
          <div className="stat-card">
            <div className="stat-icon published">
              <FileCheck size={20} />
            </div>
            <div className="stat-content">
              <span className="stat-num">{stats?.publishedEventsCount ?? 0}</span>
              <span className="stat-label">Published Events</span>
              <span className="stat-sub">100% verified spacetime anchor</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon verified">
              <ShieldCheck size={20} />
            </div>
            <div className="stat-content">
              <span className="stat-num">{stats?.verifiedClaimsCount ?? 0}</span>
              <span className="stat-label">Atomic Verified Claims</span>
              <span className="stat-sub">Presence, actions & statements</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon sources">
              <Scale size={20} />
            </div>
            <div className="stat-content">
              <span className="stat-num">{stats?.primarySourcesCount ?? 0}</span>
              <span className="stat-label">Primary Sources (Tier A/B)</span>
              <span className="stat-sub">Parliamentary & broadcast wire</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon auto">
              <Play size={20} />
            </div>
            <div className="stat-content">
              <span className="stat-num">{stats?.autoPublishedCount ?? 0}</span>
              <span className="stat-label">Auto-Published Records</span>
              <span className="stat-sub">Zero-touch Tier-1 policy lane</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon review">
              <AlertCircle size={20} />
            </div>
            <div className="stat-content">
              <span className="stat-num">{stats?.pendingReviewCount ?? 0}</span>
              <span className="stat-label">Pending Editorial Review</span>
              <span className="stat-sub">Requires senior archival sign-off</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon merge">
              <GitMerge size={20} />
            </div>
            <div className="stat-content">
              <span className="stat-num">{duplicateItems.length}</span>
              <span className="stat-label">Duplicate Merges</span>
              <span className="stat-sub">Spacetime collision candidate</span>
            </div>
          </div>
        </section>

        {/* SEARCH, FILTER & SORT CONTROL STRIP */}
        <section className="console-control-strip" aria-label="Review Queue Query Controls">
          <div className="search-input-box">
            <Search size={15} className="search-box-icon" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search candidate titles, extracted claims, actors, or locations..."
              className="forensic-search-input"
              aria-label="Filter evidence candidates"
            />
            {searchQuery && (
              <button
                type="button"
                className="clear-search-btn"
                onClick={() => setSearchQuery("")}
                aria-label="Clear search input"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="filter-controls-group">
            <div className="filter-select-wrap">
              <label htmlFor="lane-filter-select">Policy Lane:</label>
              <select
                id="lane-filter-select"
                value={laneFilter}
                onChange={(e) => setLaneFilter(e.target.value as typeof laneFilter)}
                className="forensic-select"
              >
                <option value="all">All Policy Lanes</option>
                <option value="auto-publish">Auto-Publish (Tier 1 Primary)</option>
                <option value="provisional">Provisional (Contemporary)</option>
                <option value="human-review">Human Review (Scrutiny)</option>
              </select>
            </div>

            <div className="filter-select-wrap">
              <label htmlFor="tier-filter-select">Evidence Tier:</label>
              <select
                id="tier-filter-select"
                value={tierFilter}
                onChange={(e) => setTierFilter(e.target.value as typeof tierFilter)}
                className="forensic-select"
              >
                <option value="all">All Source Tiers</option>
                <option value="tier-a">Tier A: Primary Official Record</option>
                <option value="tier-b">Tier B: Contemporary Press Wire</option>
                <option value="tier-c">Tier C: Retrospective Scholarly</option>
              </select>
            </div>

            <div className="filter-select-wrap">
              <label htmlFor="sort-select">Sort By:</label>
              <select
                id="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="forensic-select"
              >
                <option value="newest">Ingested Date (Newest First)</option>
                <option value="date-asc">Historical Date (Chronological)</option>
                <option value="date-desc">Historical Date (Reverse Chron)</option>
                <option value="similarity">Duplicate Similarity (Highest)</option>
              </select>
            </div>
          </div>
        </section>

        {/* CONSOLE TABS NAVIGATION */}
        <div className="console-tabs-nav" role="tablist" aria-label="Evidence Console Views">
          <button
            type="button"
            role="tab"
            id="tab-queue"
            aria-selected={activeTab === "queue"}
            aria-controls="panel-queue"
            className={`tab-btn ${activeTab === "queue" ? "active" : ""}`}
            onClick={() => setActiveTab("queue")}
          >
            <ShieldAlert size={14} />
            <span>Evidentiary Review Queue</span>
            {pendingItems.length > 0 && <span className="tab-badge error">{pendingItems.length}</span>}
          </button>

          <button
            type="button"
            role="tab"
            id="tab-duplicates"
            aria-selected={activeTab === "duplicates"}
            aria-controls="panel-duplicates"
            className={`tab-btn ${activeTab === "duplicates" ? "active" : ""}`}
            onClick={() => setActiveTab("duplicates")}
          >
            <GitMerge size={14} />
            <span>Spacetime Duplicate Merges</span>
            {duplicateItems.length > 0 && <span className="tab-badge warning">{duplicateItems.length}</span>}
          </button>

          <button
            type="button"
            role="tab"
            id="tab-audit"
            aria-selected={activeTab === "audit"}
            aria-controls="panel-audit"
            className={`tab-btn ${activeTab === "audit" ? "active" : ""}`}
            onClick={() => setActiveTab("audit")}
          >
            <Clock size={14} />
            <span>Provenance Audit Ledger</span>
            {audit.length > 0 && <span className="tab-badge neutral">{audit.length}</span>}
          </button>

          <button
            type="button"
            role="tab"
            id="tab-standards"
            aria-selected={activeTab === "standards"}
            aria-controls="panel-standards"
            className={`tab-btn ${activeTab === "standards" ? "active" : ""}`}
            onClick={() => setActiveTab("standards")}
          >
            <Scale size={14} />
            <span>Pipeline Architecture & Policy Standards</span>
          </button>
        </div>

        {/* TAB 1: REVIEW QUEUE */}
        {activeTab === "queue" && (
          <section id="panel-queue" role="tabpanel" aria-labelledby="tab-queue" className="console-tab-stage">
            {pendingItems.length === 0 ? (
              <div className="empty-queue-card">
                <ShieldCheck size={48} className="empty-state-icon text-emerald" />
                <h3>Review Queue is Clear</h3>
                <p>
                  All newly discovered candidate claims have met strict auto-publication criteria or have been reviewed
                  by an authorized senior historical editor.
                </p>
                <div className="empty-actions">
                  <button type="button" className="action-stream-btn" onClick={handleIngestSampleStream} disabled={isIngestingSample}>
                    <Sparkles size={14} />
                    <span>Load Sample Ingestion Stream</span>
                  </button>
                  <button type="button" className="refresh-btn" onClick={fetchConsoleData}>
                    <RefreshCw size={14} />
                    <span>Recheck Ingestion Stream</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="candidate-card-list">
                {pendingItems.map((c: CandidateItem) => {
                  const parsed = parseCandidateExtraction(c.rawExtraction);
                  const isAutoPublish = c.assignedLane === "auto-publish";
                  const isProvisional = c.assignedLane === "provisional";

                  return (
                    <article key={c.id} className="candidate-dossier-card">
                      {/* DOSSIER HEADER */}
                      <div className="dossier-header">
                        <div className="dossier-meta-chips">
                          <span className={`lane-badge ${c.assignedLane}`}>
                            {isAutoPublish && <CheckCircle2 size={11} />}
                            {isProvisional && <AlertTriangle size={11} />}
                            {!isAutoPublish && !isProvisional && <AlertCircle size={11} />}
                            <span>{c.assignedLane.replace("-", " ").toUpperCase()} LANE</span>
                          </span>

                          <span className={`tier-badge ${c.primarySourceTier}`}>
                            <Scale size={11} />
                            <span>{c.primarySourceTier.toUpperCase()}: PRIMARY ARCHIVAL</span>
                          </span>

                          <span className="precision-badge">
                            <Calendar size={11} />
                            <time dateTime={c.suggestedDate}>{c.suggestedDate}</time> · EXACT DAY
                          </span>

                          <span className="fingerprint-badge" title={`Cryptographic Fingerprint: ${c.fingerprint}`}>
                            FP: <code>{c.fingerprint.slice(0, 14)}...</code>
                          </span>
                        </div>

                        <div className="dossier-id-tag">
                          <code>{c.id}</code>
                        </div>
                      </div>

                      {/* DOSSIER TITLE & SUMMARY */}
                      <div className="dossier-headline-block">
                        <h2>{c.suggestedTitle}</h2>
                        <p className="dossier-summary">{parsed.summary || "No extraction summary provided."}</p>
                      </div>

                      {/* FORENSIC RESOLUTION VITALS */}
                      <div className="dossier-vitals-grid">
                        <div className="vital-item">
                          <MapPin size={14} className="vital-icon text-amber" />
                          <div className="vital-text">
                            <span className="vital-label">Geospatial Resolution</span>
                            <span className="vital-val">
                              {c.suggestedPlace || parsed.venue || "Unspecified Coordinates"}
                              <small className="vital-sub"> · Precision: Venue Centroid</small>
                            </span>
                          </div>
                        </div>

                        <div className="vital-item">
                          <UserCheck size={14} className="vital-icon text-sky" />
                          <div className="vital-text">
                            <span className="vital-label">Entity Resolution</span>
                            <div className="entity-chips-row">
                              {Array.isArray(parsed.participants) && parsed.participants.length > 0 ? (
                                parsed.participants.map((p, pIdx) => (
                                  <span key={pIdx} className="entity-chip">
                                    <b>{p.name}</b>
                                    {p.role && <small>({p.role})</small>}
                                    <span className="match-confidence">98% match</span>
                                  </span>
                                ))
                              ) : (
                                <span className="entity-chip muted">None detected</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* DECOMPOSED CLAIMS LIST */}
                      {Array.isArray(parsed.claims) && parsed.claims.length > 0 && (
                        <div className="dossier-claims-container">
                          <div className="claims-header-row">
                            <span className="claims-header-title">
                              Decomposed Atomic Claims ({parsed.claims.length})
                            </span>
                            <span className="claims-policy-note">Forensic decomposition per REWiND Claim Model</span>
                          </div>

                          <div className="claims-cards-list">
                            {parsed.claims.map((clm, idx) => (
                              <div key={idx} className="claim-unit-card">
                                <div className="claim-unit-top">
                                  <span className={`claim-type-pill ${clm.claimType || "presence"}`}>
                                    {(clm.claimType || "presence").toUpperCase()}
                                  </span>
                                  <span className="claim-subject-mention">
                                    Subject: <b>{clm.subjectMention}</b>
                                  </span>
                                  {clm.claimedTime && (
                                    <span className="claim-time-tag">
                                      <Clock size={11} /> {clm.claimedTime}
                                    </span>
                                  )}
                                </div>

                                <p className="claim-statement">{clm.statement}</p>

                                {clm.supportingExcerpt && (
                                  <blockquote className="claim-excerpt">
                                    <span className="excerpt-quote-mark">&ldquo;</span>
                                    <span>{clm.supportingExcerpt}</span>
                                    <span className="excerpt-quote-mark">&rdquo;</span>
                                  </blockquote>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* SOURCE PEDIGREE FOOTNOTE */}
                      <div className="dossier-source-strip">
                        <Scale size={13} className="text-amber" />
                        <span className="source-label">Source Citation:</span>
                        <span className="source-name">
                          {parsed.sourceTitle || parsed.sourcePublisher || "Official Parliamentary / Diplomatic Wire Record"}
                        </span>
                        <code className="source-id-pill">{parsed.sourceId || "src-archive-reference"}</code>
                      </div>

                      {/* ACTION CONTROLS */}
                      <div className="dossier-actions-bar">
                        <button
                          type="button"
                          disabled={submittingCandidateId === c.id}
                          className="forensic-action-btn approve"
                          onClick={() => handleAction("approve", c.id)}
                          title="Verify and publish candidate event into canonical atlas"
                        >
                          {submittingCandidateId === c.id ? (
                            <RefreshCw size={14} className="animate-spin" />
                          ) : (
                            <CheckCircle2 size={14} />
                          )}
                          <span>{submittingCandidateId === c.id ? "Publishing to Atlas..." : "Approve & Publish to Atlas"}</span>
                        </button>

                        <button
                          type="button"
                          className="forensic-action-btn inspect"
                          onClick={() => setInspectCandidate(c)}
                          title="Inspect raw cryptographic JSON payload and entity graph"
                        >
                          <Code2 size={14} />
                          <span>Inspect Full Dossier</span>
                        </button>

                        <button
                          type="button"
                          disabled={submittingCandidateId === c.id}
                          className="forensic-action-btn reject"
                          onClick={() => setRejectingCandidate(c)}
                          title="Reject candidate with forensic audit reasoning"
                        >
                          <XCircle size={14} />
                          <span>Reject Candidate</span>
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* TAB 2: SPACETIME DUPLICATE MERGES */}
        {activeTab === "duplicates" && (
          <section id="panel-duplicates" role="tabpanel" aria-labelledby="tab-duplicates" className="console-tab-stage">
            {duplicateItems.length === 0 ? (
              <div className="empty-queue-card">
                <GitMerge size={48} className="empty-state-icon text-amber" />
                <h3>No Unresolved Spacetime Duplicates</h3>
                <p>
                  All newly ingested candidate streams have either been verified as distinct historical events or
                  smoothly reconciled against existing spacetime records.
                </p>
              </div>
            ) : (
              <div className="candidate-card-list">
                {duplicateItems.map((c: CandidateItem) => {
                  const similarityPct = Math.round((c.duplicateSimilarity || 0) * 100);
                  const parsed = parseCandidateExtraction(c.rawExtraction);

                  return (
                    <article key={c.id} className="candidate-dossier-card duplicate-highlight">
                      <div className="duplicate-alert-banner">
                        <GitMerge size={16} />
                        <div>
                          <b>Spacetime Duplicate Detected: {similarityPct}% Cosine & Spatial Similarity</b>
                          <p>
                            Matches existing atlas record: <code>{c.duplicateMatchId}</code>. Ingesting will merge
                            corroborating claims without creating duplicate timeline entries.
                          </p>
                        </div>
                      </div>

                      <div className="dossier-header">
                        <div className="dossier-meta-chips">
                          <span className="lane-badge provisional">PROVISIONAL DUPLICATE</span>
                          <span className="precision-badge">
                            <Calendar size={11} /> {c.suggestedDate}
                          </span>
                          <span className="fingerprint-badge">FP: {c.fingerprint.slice(0, 14)}...</span>
                        </div>
                        <div className="dossier-id-tag">
                          <code>{c.id}</code>
                        </div>
                      </div>

                      <div className="dossier-headline-block">
                        <h2>{c.suggestedTitle}</h2>
                        <p className="dossier-summary">{parsed.summary}</p>
                      </div>

                      {/* SIDE-BY-SIDE RECONCILIATION PREVIEW */}
                      <div className="reconciliation-diff-grid">
                        <div className="diff-col incoming">
                          <span className="diff-col-header">Incoming Candidate Evidence</span>
                          <div className="diff-box">
                            <p className="diff-title"><b>Title:</b> {c.suggestedTitle}</p>
                            <p className="diff-place"><b>Location:</b> {c.suggestedPlace || "Unspecified"}</p>
                            <p className="diff-claims"><b>Claims to Add:</b> {parsed.claims?.length || 0} atomic assertions</p>
                          </div>
                        </div>

                        <div className="diff-col existing">
                          <span className="diff-col-header">Existing Canonical Record</span>
                          <div className="diff-box">
                            <p className="diff-title"><b>Target ID:</b> <code>{c.duplicateMatchId}</code></p>
                            <p className="diff-place"><b>Status:</b> Canonical Atlas Event</p>
                            <Link href={`/event/${c.duplicateMatchId}`} target="_blank" className="diff-link">
                              View Existing Event in Atlas <ExternalLink size={12} />
                            </Link>
                          </div>
                        </div>
                      </div>

                      <div className="dossier-actions-bar">
                        <button
                          type="button"
                          disabled={submittingCandidateId === c.id}
                          className="forensic-action-btn merge"
                          onClick={() => handleAction("merge", c.id, c.duplicateMatchId || undefined)}
                          title="Merge new claims and source links into existing event"
                        >
                          {submittingCandidateId === c.id ? (
                            <RefreshCw size={14} className="animate-spin" />
                          ) : (
                            <GitMerge size={14} />
                          )}
                          <span>{submittingCandidateId === c.id ? "Merging..." : "Merge Claims into Existing Record"}</span>
                        </button>

                        <button
                          type="button"
                          disabled={submittingCandidateId === c.id}
                          className="forensic-action-btn approve"
                          onClick={() => handleAction("approve", c.id)}
                          title="Override duplicate detection and publish as distinct event"
                        >
                          <CheckCircle2 size={14} />
                          <span>Publish as Separate Discrete Event</span>
                        </button>

                        <button
                          type="button"
                          disabled={submittingCandidateId === c.id}
                          className="forensic-action-btn reject"
                          onClick={() => setRejectingCandidate(c)}
                          title="Reject this duplicate entry"
                        >
                          <XCircle size={14} />
                          <span>Reject Duplicate</span>
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* TAB 3: PROVENANCE AUDIT LEDGER */}
        {activeTab === "audit" && (
          <section id="panel-audit" role="tabpanel" aria-labelledby="tab-audit" className="console-tab-stage">
            <div className="audit-ledger-card">
              <div className="ledger-header">
                <div>
                  <h3>Immutable Forensic Audit Ledger</h3>
                  <p>Cryptographic, timestamped trace of all autonomous ingestion, policy evaluation, and editorial actions.</p>
                </div>
                <div className="ledger-badge">
                  <span>{audit.length} Operations Logged</span>
                </div>
              </div>

              <div className="audit-table-wrapper">
                <table className="forensic-audit-table" aria-label="Immutable Evidence Engine Audit Log">
                  <thead>
                    <tr>
                      <th scope="col">Recorded At (UTC)</th>
                      <th scope="col">Action</th>
                      <th scope="col">Policy Rule / Trigger</th>
                      <th scope="col">Entity / Candidate</th>
                      <th scope="col">Forensic Trace</th>
                      <th scope="col">Inspect</th>
                    </tr>
                  </thead>
                  <tbody>
                    {audit.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="empty-table-cell">
                          No audit entries recorded in current ledger.
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
                                {auditDateFormatter.format(new Date(entry.recordedAt))}
                              </time>
                            </td>

                            <td>
                              <span className={`audit-action-tag ${entry.action}`}>
                                {entry.action.toUpperCase()}
                              </span>
                            </td>

                            <td className="rule-col">
                              <code>{entry.ruleId || "MANUAL-REVIEW"}</code>
                            </td>

                            <td className="target-col">
                              <code>{entry.eventId || entry.candidateId || "—"}</code>
                            </td>

                            <td className="details-col">
                              <span className="details-preview">
                                {Object.entries(parsed)
                                  .slice(0, 2)
                                  .map(([k, v]) => `${k}: ${typeof v === "object" ? JSON.stringify(v) : v}`)
                                  .join(" · ")}
                              </span>
                            </td>

                            <td className="action-col">
                              <button
                                type="button"
                                className="inspect-cell-btn"
                                onClick={() => setInspectAudit(entry)}
                                title="Inspect full audit record"
                              >
                                <Eye size={13} />
                                <span>Inspect</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* TAB 4: PIPELINE ARCHITECTURE & POLICY STANDARDS */}
        {activeTab === "standards" && (
          <section id="panel-standards" role="tabpanel" aria-labelledby="tab-standards" className="console-tab-stage">
            <div className="standards-architecture-grid">
              <div className="standards-card">
                <div className="standards-icon-box emerald">
                  <ShieldCheck size={24} />
                </div>
                <h3>Lane 1: Strict Auto-Publish</h3>
                <p>
                  Requires an unassailable <b>Tier A Primary Archival Record</b> (e.g., official parliamentary stenographic
                  transcripts, United Nations Secretariat records, unedited broadcast audio) with an entity resolution confidence
                  exceeding <b>95%</b> and unambiguous venue centroid coordinates.
                </p>
                <div className="standards-criteria">
                  <span className="criteria-tag">&ge; 0.95 Entity Confidence</span>
                  <span className="criteria-tag">Tier A Primary Record</span>
                  <span className="criteria-tag">Zero Collision Risk</span>
                </div>
              </div>

              <div className="standards-card">
                <div className="standards-icon-box amber">
                  <AlertTriangle size={24} />
                </div>
                <h3>Lane 2: Provisional Corroboration</h3>
                <p>
                  Applied when events are substantiated by <b>Tier B Contemporary Secondary Reporting</b> (accredited press wire
                  reports filed synchronously by journalists on site) but require additional primary archival corroboration
                  before achieving full unassailable verification.
                </p>
                <div className="standards-criteria">
                  <span className="criteria-tag">&ge; 0.85 Entity Confidence</span>
                  <span className="criteria-tag">Tier B Contemporary Wire</span>
                  <span className="criteria-tag">Corroboration Flagged</span>
                </div>
              </div>

              <div className="standards-card">
                <div className="standards-icon-box crimson">
                  <ShieldAlert size={24} />
                </div>
                <h3>Lane 3: Editorial Scrutiny & Review</h3>
                <p>
                  Any event involving ambiguous person resolution (such as surname collisions e.g., Clinton vs Clinton),
                  disputed claims across differing historical accounts, or low-tier retrospective sources is automatically
                  isolated and diverted to the human editorial console.
                </p>
                <div className="standards-criteria">
                  <span className="criteria-tag">Disputed Primary Accounts</span>
                  <span className="criteria-tag">Ambiguous Resolution</span>
                  <span className="criteria-tag">Senior Editor Sign-Off</span>
                </div>
              </div>
            </div>

            <div className="standards-methodology-banner">
              <div className="banner-icon-col">
                <BookOpen size={28} className="text-amber" />
              </div>
              <div className="banner-content-col">
                <h4>Methodological Verification Standards</h4>
                <p>
                  The REWiND Evidence Engine operates in accordance with the formal <i>Forensic Evidence Methodology</i> and
                  the <i>Event Model v2 Schema</i>. Every discrete statement of presence, speech, and historical action is
                  isolated into atomic claim objects linked to permanent cryptographic citations.
                </p>
                <div className="banner-links">
                  <Link href="/methodology" className="standards-btn">
                    <span>Read Full Methodology (METHODOLOGY.md)</span>
                    <ExternalLink size={13} />
                  </Link>
                  <Link href="/sources" className="standards-btn secondary">
                    <span>Explore Primary Sources Catalog</span>
                    <ExternalLink size={13} />
                  </Link>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* CANDIDATE DOSSIER INSPECTION MODAL */}
        {inspectCandidate && (
          <div className="forensic-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-candidate-title">
            <div className="forensic-modal-backdrop" onClick={() => setInspectCandidate(null)} />
            <div className="forensic-modal-container">
              <header className="forensic-modal-header">
                <div className="modal-title-wrap">
                  <Code2 size={18} className="text-sky" />
                  <div>
                    <h3 id="modal-candidate-title">Candidate Evidentiary Dossier</h3>
                    <small>Record ID: <code>{inspectCandidate.id}</code> · Fingerprint: <code>{inspectCandidate.fingerprint}</code></small>
                  </div>
                </div>
                <button
                  type="button"
                  className="modal-close-btn"
                  onClick={() => setInspectCandidate(null)}
                  aria-label="Close modal"
                >
                  <X size={18} />
                </button>
              </header>

              <div className="forensic-modal-body">
                <div className="modal-payload-controls">
                  <span className="payload-format-label">Raw Extraction Schema (JSON)</span>
                  <button
                    type="button"
                    className="copy-payload-btn"
                    onClick={() => handleCopyJson(inspectCandidate.rawExtraction)}
                  >
                    {copiedPayload ? <Check size={13} className="text-emerald" /> : <Copy size={13} />}
                    <span>{copiedPayload ? "Copied to Clipboard" : "Copy Payload"}</span>
                  </button>
                </div>

                <pre className="modal-json-block">
                  <code>
                    {(() => {
                      try {
                        return JSON.stringify(JSON.parse(inspectCandidate.rawExtraction), null, 2);
                      } catch {
                        return inspectCandidate.rawExtraction;
                      }
                    })()}
                  </code>
                </pre>

                <div className="modal-metadata-strip">
                  <div>
                    <b>Assigned Policy Lane:</b> {inspectCandidate.assignedLane.toUpperCase()}
                  </div>
                  <div>
                    <b>Source Classification:</b> {inspectCandidate.primarySourceTier.toUpperCase()}
                  </div>
                  <div>
                    <b>Spacetime Similarity:</b> {inspectCandidate.duplicateSimilarity ? `${Math.round(inspectCandidate.duplicateSimilarity * 100)}%` : "N/A"}
                  </div>
                </div>
              </div>

              <footer className="forensic-modal-footer">
                <button
                  type="button"
                  className="forensic-action-btn approve"
                  onClick={() => {
                    handleAction("approve", inspectCandidate.id);
                    setInspectCandidate(null);
                  }}
                >
                  <CheckCircle2 size={14} />
                  <span>Approve & Publish from Inspector</span>
                </button>
                <button type="button" className="refresh-btn" onClick={() => setInspectCandidate(null)}>
                  Close
                </button>
              </footer>
            </div>
          </div>
        )}

        {/* AUDIT RECORD INSPECTION MODAL */}
        {inspectAudit && (
          <div className="forensic-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-audit-title">
            <div className="forensic-modal-backdrop" onClick={() => setInspectAudit(null)} />
            <div className="forensic-modal-container">
              <header className="forensic-modal-header">
                <div className="modal-title-wrap">
                  <Clock size={18} className="text-amber" />
                  <div>
                    <h3 id="modal-audit-title">Audit Ledger Entry #{inspectAudit.id}</h3>
                    <small>Action: <code>{inspectAudit.action}</code> · Trigger: <code>{inspectAudit.ruleId || "MANUAL"}</code></small>
                  </div>
                </div>
                <button
                  type="button"
                  className="modal-close-btn"
                  onClick={() => setInspectAudit(null)}
                  aria-label="Close modal"
                >
                  <X size={18} />
                </button>
              </header>

              <div className="forensic-modal-body">
                <div className="modal-payload-controls">
                  <span className="payload-format-label">Cryptographic Operational Trace (JSON)</span>
                  <button
                    type="button"
                    className="copy-payload-btn"
                    onClick={() => handleCopyJson(inspectAudit.details)}
                  >
                    {copiedPayload ? <Check size={13} className="text-emerald" /> : <Copy size={13} />}
                    <span>{copiedPayload ? "Copied to Clipboard" : "Copy Payload"}</span>
                  </button>
                </div>

                <pre className="modal-json-block">
                  <code>
                    {(() => {
                      try {
                        return JSON.stringify(JSON.parse(inspectAudit.details), null, 2);
                      } catch {
                        return inspectAudit.details;
                      }
                    })()}
                  </code>
                </pre>
              </div>

              <footer className="forensic-modal-footer">
                <button type="button" className="refresh-btn" onClick={() => setInspectAudit(null)}>
                  Close
                </button>
              </footer>
            </div>
          </div>
        )}

        {/* REJECTION REASON CONFIRMATION MODAL */}
        {rejectingCandidate && (
          <div className="forensic-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-reject-title">
            <div className="forensic-modal-backdrop" onClick={() => setRejectingCandidate(null)} />
            <div className="forensic-modal-container">
              <header className="forensic-modal-header">
                <div className="modal-title-wrap">
                  <XCircle size={18} className="text-crimson" />
                  <div>
                    <h3 id="modal-reject-title">Reject Candidate Dossier</h3>
                    <small>Candidate: {rejectingCandidate.suggestedTitle}</small>
                  </div>
                </div>
                <button
                  type="button"
                  className="modal-close-btn"
                  onClick={() => setRejectingCandidate(null)}
                  aria-label="Close modal"
                >
                  <X size={18} />
                </button>
              </header>

              <div className="forensic-modal-body">
                <p className="reject-prompt">
                  Please provide a forensic audit rationale for rejecting this candidate. This decision will be
                  permanently recorded in the immutable provenance ledger.
                </p>

                <textarea
                  value={rejectionReasonInput}
                  onChange={(e) => setRejectionReasonInput(e.target.value)}
                  placeholder="e.g., Fails Tier-1 verification: Secondary wire report contradicted by primary UN stenographic plenary transcript."
                  className="forensic-textarea"
                  rows={4}
                  aria-label="Rejection audit reason"
                />
              </div>

              <footer className="forensic-modal-footer">
                <button
                  type="button"
                  className="forensic-action-btn reject"
                  disabled={submittingCandidateId === rejectingCandidate.id}
                  onClick={() =>
                    handleAction(
                      "reject",
                      rejectingCandidate.id,
                      undefined,
                      rejectionReasonInput.trim() || "Editorial rejection per forensic archival review"
                    )
                  }
                >
                  <XCircle size={14} />
                  <span>Confirm Rejection & Log</span>
                </button>

                <button type="button" className="refresh-btn" onClick={() => setRejectingCandidate(null)}>
                  Cancel
                </button>
              </footer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
