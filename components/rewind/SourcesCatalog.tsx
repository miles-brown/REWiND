"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  ExternalLink,
  FileText,
  Grid,
  List,
  RotateCcw,
  Search,
  ShieldCheck,
  Video,
} from "lucide-react";
import type { EventRecord, SourceRecord } from "@/lib/rewind";

type SortOption = "events-desc" | "date-desc" | "date-asc" | "title-asc" | "publisher-asc";
type ViewMode = "table" | "cards";

export function getSourceDateInfo(s: SourceRecord): { isoDate: string | null; displayDate: string } {
  const raw = s.publicationDate || s.accessedDate || "";
  if (!raw) return { isoDate: null, displayDate: "Undated" };
  const d = new Date(raw.includes("T") ? raw : raw + "T12:00:00");
  if (isNaN(d.getTime())) return { isoDate: raw, displayDate: raw };
  return {
    isoDate: raw,
    displayDate: d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
  };
}

export function SourcesCatalog({
  sources = [],
  events = [],
  sourceEventCounts,
  loaderError,
}: {
  sources?: SourceRecord[];
  events?: EventRecord[];
  sourceEventCounts?: Record<string, number>;
  loaderError?: string | null;
}) {
  const [query, setQuery] = useState("");
  const [classificationFilter, setClassificationFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [publisherFilter, setPublisherFilter] = useState<string>("all");
  const [sortOption, setSortOption] = useState<SortOption>("events-desc");
  const [viewMode, setViewMode] = useState<ViewMode>("table");

  // Precompute event linkage counts
  const sourceEventMap = useMemo(() => {
    if (sourceEventCounts && Object.keys(sourceEventCounts).length > 0) {
      return new Map(Object.entries(sourceEventCounts));
    }
    const map = new Map<string, number>();
    for (const e of events) {
      for (const sId of e.sourceIds || []) {
        map.set(sId, (map.get(sId) || 0) + 1);
      }
    }
    return map;
  }, [events, sourceEventCounts]);

  // Compute publishers and types
  const publishers = useMemo(() => {
    const set = new Set<string>();
    sources.forEach((s) => set.add(s.publisher));
    return Array.from(set).sort();
  }, [sources]);

  const sourceTypes = useMemo(() => {
    const set = new Set<string>();
    sources.forEach((s) => set.add(s.sourceType));
    return Array.from(set).sort();
  }, [sources]);

  // Filtered & Sorted sources
  const filteredSources = useMemo(() => {
    const q = query.toLowerCase().trim();

    return sources
      .filter((s) => {
        if (q) {
          const matchTitle = s.title.toLowerCase().includes(q);
          const matchPub = s.publisher.toLowerCase().includes(q);
          const matchId = s.id.toLowerCase().includes(q);
          const matchUrl = s.url ? s.url.toLowerCase().includes(q) : false;
          if (!matchTitle && !matchPub && !matchId && !matchUrl) return false;
        }

        if (classificationFilter !== "all" && s.classification !== classificationFilter) {
          return false;
        }

        if (typeFilter !== "all" && s.sourceType !== typeFilter) {
          return false;
        }

        if (publisherFilter !== "all" && s.publisher !== publisherFilter) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortOption === "events-desc") {
          const countA = sourceEventMap.get(a.id) || 0;
          const countB = sourceEventMap.get(b.id) || 0;
          if (countB !== countA) return countB - countA;
          return a.title.localeCompare(b.title);
        }
        if (sortOption === "title-asc") {
          return a.title.localeCompare(b.title);
        }
        if (sortOption === "publisher-asc") {
          return a.publisher.localeCompare(b.publisher);
        }
        if (sortOption === "date-desc") {
          const dateA = sDate(a);
          const dateB = sDate(b);
          return dateB.localeCompare(dateA);
        }
        if (sortOption === "date-asc") {
          const dateA = sDate(a);
          const dateB = sDate(b);
          return dateA.localeCompare(dateB);
        }
        return 0;
      });
  }, [query, classificationFilter, typeFilter, publisherFilter, sortOption, sourceEventMap, sources]);

  function sDate(s: SourceRecord): string {
    return s.publicationDate || s.accessedDate || "";
  }

  // Forensic Metrics
  const primaryCount = useMemo(
    () => sources.filter((s) => s.classification === "primary").length,
    [sources]
  );
  const primaryPercent = sources.length > 0 ? Math.round((primaryCount / sources.length) * 100) : 0;
  const totalEvidencedLinks = useMemo(
    () => sources.reduce((sum, s) => sum + (sourceEventMap.get(s.id) || 0), 0),
    [sources, sourceEventMap]
  );

  function resetFilters() {
    setQuery("");
    setClassificationFilter("all");
    setTypeFilter("all");
    setPublisherFilter("all");
    setSortOption("events-desc");
  }

  const isFiltered =
    query !== "" ||
    classificationFilter !== "all" ||
    typeFilter !== "all" ||
    publisherFilter !== "all";

  return (
    <div className="page-shell sources-page-catalog">
      <header className="page-hero sources-hero">
        <span className="eyebrow">FORENSIC ARCHIVAL REGISTER</span>
        <h1>Follow every claim down.</h1>
        <p>
          {sources.length} primary and corroborated documentary records support the REWiND Evidence Atlas.
          Filter by tier, provenance, or publisher to inspect the archival chain of custody.
        </p>

        <dl className="sources-kpi-bar" aria-label="Sources register summary metrics">
          <div className="source-kpi">
            <dt className="kpi-label">Documented Records</dt>
            <dd className="kpi-num">{sources.length}</dd>
          </div>
          <div className="source-kpi highlight">
            <dt className="kpi-label">Primary Tier-A Evidence</dt>
            <dd className="kpi-num">{primaryPercent}%</dd>
          </div>
          <div className="source-kpi">
            <dt className="kpi-label">Archival Publishers</dt>
            <dd className="kpi-num">{publishers.length}</dd>
          </div>
          <div className="source-kpi">
            <dt className="kpi-label">Total Corroborated Claims</dt>
            <dd className="kpi-num">{totalEvidencedLinks}</dd>
          </div>
        </dl>
      </header>

      <div className="sources-control-console">
        <div className="sources-search-row">
          <div className="search-input-wrap">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Search by title, publisher, URL, or record ID..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="sources-search-input"
              aria-label="Search archival sources"
            />
            {query && (
              <button
                type="button"
                className="clear-search-btn"
                onClick={() => setQuery("")}
                aria-label="Clear search query"
              >
                ×
              </button>
            )}
          </div>

          <div className="sources-view-toggles" role="toolbar" aria-label="Catalog layout mode">
            <button
              type="button"
              className={`view-toggle-btn ${viewMode === "table" ? "active" : ""}`}
              onClick={() => setViewMode("table")}
              title="Table View"
              aria-label="Switch to Table view"
              aria-pressed={viewMode === "table"}
            >
              <List size={15} />
              <span>Table</span>
            </button>
            <button
              type="button"
              className={`view-toggle-btn ${viewMode === "cards" ? "active" : ""}`}
              onClick={() => setViewMode("cards")}
              title="Dossier Card View"
              aria-label="Switch to Dossier Card view"
              aria-pressed={viewMode === "cards"}
            >
              <Grid size={15} />
              <span>Cards</span>
            </button>
          </div>
        </div>

        <div className="sources-filter-row">
          <div className="filter-group">
            <span className="filter-group-label">Evidence Tier</span>
            <div className="filter-pill-cluster" role="group" aria-label="Evidence tier filter">
              <button
                type="button"
                className={`filter-pill ${classificationFilter === "all" ? "active" : ""}`}
                onClick={() => setClassificationFilter("all")}
                aria-pressed={classificationFilter === "all"}
              >
                All ({sources.length})
              </button>
              <button
                type="button"
                className={`filter-pill primary ${classificationFilter === "primary" ? "active" : ""}`}
                onClick={() => setClassificationFilter("primary")}
                aria-pressed={classificationFilter === "primary"}
              >
                <ShieldCheck size={12} />
                <span>Primary ({sources.filter((s) => s.classification === "primary").length})</span>
              </button>
              <button
                type="button"
                className={`filter-pill secondary ${classificationFilter === "secondary" ? "active" : ""}`}
                onClick={() => setClassificationFilter("secondary")}
                aria-pressed={classificationFilter === "secondary"}
              >
                <span>Secondary ({sources.filter((s) => s.classification === "secondary").length})</span>
              </button>
            </div>
          </div>

          <div className="filter-select-wrap">
            <label htmlFor="source-type-select">Record Type</label>
            <select
              id="source-type-select"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="sources-select"
            >
              <option value="all">All Types ({sourceTypes.length})</option>
              {sourceTypes.map((t) => (
                <option key={t} value={t}>
                  {t.replace(/-/g, " ")} ({sources.filter((s) => s.sourceType === t).length})
                </option>
              ))}
            </select>
          </div>

          <div className="filter-select-wrap">
            <label htmlFor="source-pub-select">Archival Publisher</label>
            <select
              id="source-pub-select"
              value={publisherFilter}
              onChange={(e) => setPublisherFilter(e.target.value)}
              className="sources-select"
            >
              <option value="all">All Publishers ({publishers.length})</option>
              {publishers.map((p) => (
                <option key={p} value={p}>
                  {p} ({sources.filter((s) => s.publisher === p).length})
                </option>
              ))}
            </select>
          </div>

          <div className="filter-select-wrap sort">
            <label htmlFor="source-sort-select">Sort By</label>
            <select
              id="source-sort-select"
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as SortOption)}
              className="sources-select"
            >
              <option value="events-desc">Most Corroborated Events</option>
              <option value="date-desc">Publication Date (Newest)</option>
              <option value="date-asc">Publication Date (Oldest)</option>
              <option value="title-asc">Title (Alphabetical)</option>
              <option value="publisher-asc">Publisher (Alphabetical)</option>
            </select>
          </div>

          {isFiltered && (
            <button
              type="button"
              className="reset-filters-btn"
              onClick={resetFilters}
              title="Reset all active search and filter constraints"
            >
              <RotateCcw size={13} />
              <span>Reset filters</span>
            </button>
          )}
        </div>

        <div className="sources-results-meta" role="status" aria-live="polite" aria-atomic="true">
          Showing <b>{filteredSources.length}</b> of {sources.length} records
          {isFiltered && <span className="active-filter-hint"> (Filtered)</span>}
        </div>
      </div>

      {filteredSources.length === 0 ? (
        <div className="sources-empty-state" role="status" aria-live="polite">
          <BookOpen size={42} />
          <h3>{loaderError ? "Source register unavailable" : "No matching records located"}</h3>
          <p>
            {loaderError
              ? "Unable to connect to the archival source database. Please verify the connection or try again later."
              : sources.length === 0
              ? "The canonical Supabase source register is ready. Primary sources will appear here as research is added in Milestone B."
              : "No documentary sources match your current search and filter parameters."}
          </p>
          {!loaderError && (
            <button type="button" className="action-btn reset" onClick={resetFilters}>
              Clear all filters
            </button>
          )}
        </div>
      ) : viewMode === "table" ? (
        <div className="sources-table-container">
          <table className="forensic-sources-table" aria-label="Source register">
            <thead>
              <tr>
                <th scope="col" className="col-source">Source Document</th>
                <th scope="col" className="col-type">Record Type</th>
                <th scope="col" className="col-tier">Evidence Tier</th>
                <th scope="col" className="col-date">Date / Year</th>
                <th scope="col" className="col-events">Evidenced Events</th>
                <th scope="col" className="col-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSources.map((s) => {
                const eventCount = sourceEventMap.get(s.id) || 0;
                const { isoDate, displayDate } = getSourceDateInfo(s);
                const isVideo = s.sourceType.includes("video");

                return (
                  <tr key={s.id} className="source-table-row">
                    <td className="col-source">
                      <div className="source-title-block">
                        <Link href={`/source/${s.id}`} className="source-title-link">
                          {s.title}
                        </Link>
                        <span className="source-publisher">{s.publisher}</span>
                        <code className="source-id-tag">{s.id}</code>
                      </div>
                    </td>
                    <td className="col-type">
                      <span className="source-type-badge">
                        {isVideo ? <Video size={12} /> : <FileText size={12} />}
                        <span>{s.sourceType.replace(/-/g, " ")}</span>
                      </span>
                    </td>
                    <td className="col-tier">
                      <span className={`source-tier-pill ${s.classification}`}>
                        {s.classification === "primary" ? (
                          <>
                            <ShieldCheck size={12} />
                            <span>Primary (Tier A)</span>
                          </>
                        ) : (
                          <span>Secondary (Tier B)</span>
                        )}
                      </span>
                    </td>
                    <td className="col-date">
                      <time className="source-time-val" dateTime={isoDate || undefined}>{displayDate}</time>
                    </td>
                    <td className="col-events">
                      <span className="event-count-badge">
                        <b>{eventCount}</b>
                        <small>{eventCount === 1 ? "event" : "events"}</small>
                      </span>
                    </td>
                    <td className="col-actions">
                      <div className="source-action-links">
                        <Link
                          href={`/source/${s.id}`}
                          className="source-action-btn view-record"
                          aria-label={`Inspect source dossier for ${s.title}`}
                          title="Inspect Evidence Dossier"
                        >
                          <ArrowRight size={14} />
                        </Link>
                        {s.url && (
                          <a
                            href={s.url}
                            target="_blank"
                            rel="noreferrer"
                            className="source-action-btn external-archive"
                            aria-label={`Open external primary record ${s.title}`}
                            title="Open Primary Archival Repository"
                          >
                            <ExternalLink size={14} />
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="sources-card-grid">
          {filteredSources.map((s) => {
            const eventCount = sourceEventMap.get(s.id) || 0;
            const { isoDate, displayDate } = getSourceDateInfo(s);
            const isVideo = s.sourceType.includes("video");

            return (
              <div key={s.id} className={`source-dossier-card ${s.classification}`}>
                <div className="card-top-meta">
                  <span className={`source-tier-pill ${s.classification}`}>
                    {s.classification === "primary" ? (
                      <>
                        <ShieldCheck size={11} />
                        <span>Primary</span>
                      </>
                    ) : (
                      <span>Secondary</span>
                    )}
                  </span>
                  <span className="source-type-tag">
                    {isVideo ? <Video size={11} /> : <FileText size={11} />}
                    <span>{s.sourceType.replace(/-/g, " ")}</span>
                  </span>
                </div>

                <h3 className="card-title">
                  <Link href={`/source/${s.id}`}>{s.title}</Link>
                </h3>

                <div className="card-publisher-row">
                  <span className="publisher-name">{s.publisher}</span>
                  <time className="card-date" dateTime={isoDate || undefined}>{displayDate}</time>
                </div>

                <div className="card-footer">
                  <span className="card-evidenced-count">
                    Corroborates <strong>{eventCount}</strong> {eventCount === 1 ? "event" : "events"}
                  </span>
                  <div className="card-btns">
                    {s.url && (
                      <a
                        href={s.url}
                        target="_blank"
                        rel="noreferrer"
                        className="card-icon-btn"
                        aria-label={`Open external link for ${s.title}`}
                        title="External Archive"
                      >
                        <ExternalLink size={14} />
                      </a>
                    )}
                    <Link
                      href={`/source/${s.id}`}
                      className="card-view-btn"
                      aria-label={`View dossier for ${s.title}`}
                    >
                      <span>Dossier</span>
                      <ArrowRight size={13} />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
