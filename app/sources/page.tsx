"use client";

import { useCallback, useMemo, useState } from "react";
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
import { events, sources } from "@/data/rewind";


type SortOption = "events-desc" | "date-desc" | "date-asc" | "title-asc" | "publisher-asc";
type ViewMode = "table" | "cards";

export default function SourcesPage() {
  const [query, setQuery] = useState("");
  const [classificationFilter, setClassificationFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [publisherFilter, setPublisherFilter] = useState<string>("all");
  const [sortOption, setSortOption] = useState<SortOption>("events-desc");
  const [viewMode, setViewMode] = useState<ViewMode>("table");

  // Precompute event linkage counts and linked historical dates
  const { sourceEventMap, sourceDateMap } = useMemo(() => {
    const eventCountMap = new Map<string, number>();
    const dateMap = new Map<string, string>();
    for (const e of events) {
      for (const sId of e.sourceIds) {
        eventCountMap.set(sId, (eventCountMap.get(sId) || 0) + 1);
        if (!dateMap.has(sId) || (e.startDate && e.startDate < (dateMap.get(sId) || ""))) {
          dateMap.set(sId, e.startDate);
        }
      }
    }
    return { sourceEventMap: eventCountMap, sourceDateMap: dateMap };
  }, []);

  const getSourceDateInfo = useCallback((s: (typeof sources)[number]) => {
    const historical =
      s.publicationDate ||
      s.originalDate ||
      sourceDateMap.get(s.id) ||
      s.id.match(/\b(19\d\d|20\d\d)(?:-\d{2})?(?:-\d{2})?\b/)?.[0] ||
      "";
    const isoDate = historical || s.accessedDate || "";
    const displayDate = historical || (s.accessedDate ? `Accessed ${s.accessedDate}` : "—");
    return { isoDate, displayDate };
  }, [sourceDateMap]);

  // Compute publishers and types
  const publishers = useMemo(() => {
    const set = new Set<string>();
    sources.forEach((s) => set.add(s.publisher));
    return Array.from(set).sort();
  }, []);

  const sourceTypes = useMemo(() => {
    const set = new Set<string>();
    sources.forEach((s) => set.add(s.sourceType));
    return Array.from(set).sort();
  }, []);

  // Filtered & Sorted sources
  const filteredSources = useMemo(() => {
    const q = query.toLowerCase().trim();

    return sources
      .filter((s) => {
        // Text search
        if (q) {
          const matchTitle = s.title.toLowerCase().includes(q);
          const matchPub = s.publisher.toLowerCase().includes(q);
          const matchId = s.id.toLowerCase().includes(q);
          const matchUrl = s.url ? s.url.toLowerCase().includes(q) : false;
          if (!matchTitle && !matchPub && !matchId && !matchUrl) return false;
        }

        // Classification
        if (classificationFilter !== "all" && s.classification !== classificationFilter) {
          return false;
        }

        // Source Type
        if (typeFilter !== "all" && s.sourceType !== typeFilter) {
          return false;
        }

        // Publisher
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
          const dateA = getSourceDateInfo(a).isoDate;
          const dateB = getSourceDateInfo(b).isoDate;
          return dateB.localeCompare(dateA);
        }
        if (sortOption === "date-asc") {
          const dateA = getSourceDateInfo(a).isoDate;
          const dateB = getSourceDateInfo(b).isoDate;
          return dateA.localeCompare(dateB);
        }
        return 0;
      });
  }, [query, classificationFilter, typeFilter, publisherFilter, sortOption, sourceEventMap, getSourceDateInfo]);

  // Forensic Metrics
  const primaryCount = useMemo(() => sources.filter((s) => s.classification === "primary").length, []);
  const secondaryCount = sources.length - primaryCount;
  const primaryPercent = Math.round((primaryCount / sources.length) * 100);
  const totalEvidencedLinks = useMemo(
    () => sources.reduce((sum, s) => sum + (sourceEventMap.get(s.id) || 0), 0),
    [sourceEventMap]
  );

  function resetFilters() {
    setQuery("");
    setClassificationFilter("all");
    setTypeFilter("all");
    setPublisherFilter("all");
    setSortOption("events-desc");
  }

  const isFiltered = query !== "" || classificationFilter !== "all" || typeFilter !== "all" || publisherFilter !== "all";

  return (
    <div className="page-shell sources-page-catalog">
      {/* Hero */}
      <header className="page-hero sources-hero">
        <span className="eyebrow">FORENSIC ARCHIVAL REGISTER</span>
        <h1>Follow every claim down.</h1>
        <p>
          {sources.length} primary and corroborated documentary records support the REWiND Evidence Atlas.
          Filter by tier, provenance, or publisher to inspect the archival chain of custody.
        </p>

        {/* Forensic Stats Bar */}
        <dl className="sources-kpi-bar" aria-label="Sources register summary metrics">
          <div className="source-kpi">
            <dd className="kpi-num">{sources.length}</dd>
            <dt className="kpi-label">Documented Records</dt>
          </div>
          <div className="source-kpi highlight">
            <dd className="kpi-num">{primaryPercent}%</dd>
            <dt className="kpi-label">Primary Tier-A Evidence</dt>
          </div>
          <div className="source-kpi">
            <dd className="kpi-num">{publishers.length}</dd>
            <dt className="kpi-label">Archival Publishers</dt>
          </div>
          <div className="source-kpi">
            <dd className="kpi-num">{totalEvidencedLinks}</dd>
            <dt className="kpi-label">Total Corroborated Claims</dt>
          </div>
        </dl>
      </header>

      {/* Interactive Controls & Filters */}
      <div className="sources-control-console">
        {/* Search row */}
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
              aria-pressed={viewMode === "table"}
              onClick={() => setViewMode("table")}
              title="Table View"
              aria-label="Switch to Table view"
            >
              <List size={15} />
              <span>Table</span>
            </button>
            <button
              type="button"
              className={`view-toggle-btn ${viewMode === "cards" ? "active" : ""}`}
              aria-pressed={viewMode === "cards"}
              onClick={() => setViewMode("cards")}
              title="Dossier Card View"
              aria-label="Switch to Dossier Card view"
            >
              <Grid size={15} />
              <span>Cards</span>
            </button>
          </div>
        </div>

        {/* Filter Pills Bar */}
        <div className="sources-filter-row">
          {/* Classification */}
          <div className="filter-group">
            <span className="filter-group-label">Evidence Tier</span>
            <div className="filter-pill-cluster" role="group" aria-label="Evidence tier filter">
              <button
                type="button"
                className={`filter-pill ${classificationFilter === "all" ? "active" : ""}`}
                aria-pressed={classificationFilter === "all"}
                onClick={() => setClassificationFilter("all")}
              >
                All ({sources.length})
              </button>
              <button
                type="button"
                className={`filter-pill primary ${classificationFilter === "primary" ? "active" : ""}`}
                aria-pressed={classificationFilter === "primary"}
                onClick={() => setClassificationFilter("primary")}
              >
                <ShieldCheck size={12} />
                <span>Primary ({primaryCount})</span>
              </button>
              <button
                type="button"
                className={`filter-pill secondary ${classificationFilter === "secondary" ? "active" : ""}`}
                aria-pressed={classificationFilter === "secondary"}
                onClick={() => setClassificationFilter("secondary")}
              >
                <span>Secondary ({secondaryCount})</span>
              </button>
            </div>
          </div>

          {/* Type dropdown */}
          <div className="filter-select-wrap">
            <label htmlFor="source-type-select">Source Type</label>
            <select
              id="source-type-select"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="sources-select"
            >
              <option value="all">All Record Types</option>
              {sourceTypes.map((t) => (
                <option key={t} value={t}>
                  {t.replace(/-/g, " ")} ({sources.filter((s) => s.sourceType === t).length})
                </option>
              ))}
            </select>
          </div>

          {/* Publisher dropdown */}
          <div className="filter-select-wrap">
            <label htmlFor="source-pub-select">Publisher</label>
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

          {/* Sort order */}
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
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Live Region for Screen Readers */}
        <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
          {isFiltered
            ? `Filtered sources: showing ${filteredSources.length} of ${sources.length} primary documents.`
            : `Showing all ${sources.length} archival primary documents.`}
        </div>

        <div className="sources-results-meta" aria-live="polite">
          Showing <b>{filteredSources.length}</b> of {sources.length} records
          {isFiltered && <span className="active-filter-hint"> (Filtered)</span>}
        </div>
      </div>

      {/* Main Content Area */}
      {filteredSources.length === 0 ? (
        <div className="sources-empty-state" role="status" aria-live="polite">
          <BookOpen size={42} />
          <h3>No matching records located</h3>
          <p>No documentary sources match your current search and filter parameters.</p>
          <button type="button" className="action-btn reset" onClick={resetFilters}>
            Clear all filters
          </button>
        </div>
      ) : viewMode === "table" ? (
        /* TABLE VIEW */
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
        /* CARD GRID VIEW */
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
