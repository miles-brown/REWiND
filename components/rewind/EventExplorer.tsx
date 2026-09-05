"use client";

import { useCallback, useMemo, useState } from "react";
import { Filter, Search, X } from "lucide-react";
import type { EventRecord } from "@/lib/rewind";
import { EventCard } from "./EventCard";

export function EventExplorer({
  initialEvents = [],
  year,
}: {
  initialEvents?: EventRecord[];
  year?: string;
}) {
  const [query, setQuery] = useState("");
  const [type, setType] = useState("All");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState<"asc" | "desc">("asc");

  const handleQueryChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  }, []);

  const handleClearQuery = useCallback(() => {
    setQuery("");
  }, []);

  const handleTypeChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setType(e.target.value);
  }, []);

  const handleStatusChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatus(e.target.value);
  }, []);

  const handleSortChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setSort(e.target.value as "asc" | "desc");
  }, []);

  const types = useMemo(() => {
    const set = new Set<string>();
    initialEvents.forEach((e) => {
      const tags = e.eventTypes?.length ? e.eventTypes : (e.categories ?? []);
      tags.forEach((t) => set.add(t));
    });
    return Array.from(set).sort();
  }, [initialEvents]);

  const result = useMemo(() => {
    return initialEvents
      .filter((e) => {
        if (year && !e.startDate.startsWith(year)) return false;
        if (status !== "all" && e.verificationStatus !== status) return false;
        const allTypes = e.eventTypes?.length ? e.eventTypes : (e.categories ?? []);
        if (type !== "All") {
          if (!allTypes.includes(type)) return false;
        }
        if (query.trim()) {
          const target = `${e.eventName} ${e.city} ${e.country} ${allTypes.join(" ")}`.toLowerCase();
          if (!target.includes(query.toLowerCase())) return false;
        }
        return true;
      })
      .sort((a, b) =>
        sort === "asc"
          ? a.startDate.localeCompare(b.startDate)
          : b.startDate.localeCompare(a.startDate)
      );
  }, [initialEvents, year, status, type, query, sort]);

  return (
    <div className="event-explorer">
      <div className="filter-bar">
        <label className="query-box">
          <Search />
          <span className="sr-only">Search events</span>
          <input
            value={query}
            onChange={handleQueryChange}
            placeholder="Search title, place or type"
            aria-label="Search events by title, place or type"
          />
          {query && (
            <button onClick={handleClearQuery} aria-label="Clear search">
              <X />
            </button>
          )}
        </label>
        <label>
          <Filter />
          <span className="sr-only">Event type</span>
          <select value={type} onChange={handleTypeChange} aria-label="Filter by event type">
            <option>All</option>
            {types.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </label>
        <label>
          <span className="sr-only">Evidence status</span>
          <select value={status} onChange={handleStatusChange} aria-label="Filter by evidence verification status">
            <option value="all">All evidence</option>
            <option value="verified">Verified</option>
            <option value="provisional">Provisional</option>
          </select>
        </label>
        <label>
          <span className="sr-only">Sort order</span>
          <select value={sort} onChange={handleSortChange} aria-label="Sort events chronologically">
            <option value="asc">Oldest first</option>
            <option value="desc">Newest first</option>
          </select>
        </label>
      </div>

      <div className="result-line" role="status" aria-live="polite" aria-atomic="true">
        <b>{result.length}</b> matching documented records {year && <>in <b>{year}</b></>}
      </div>

      {result.length ? (
        <div className="event-grid">
          {result.map((e) => (
            <EventCard event={e} key={e.id} />
          ))}
        </div>
      ) : (
        <div className="zero-state" style={{ padding: "3rem 1.5rem", textAlign: "center", border: "1px dashed var(--border-subtle, #333)", borderRadius: "8px" }}>
          <Search size={32} style={{ margin: "0 auto 1rem", opacity: 0.5 }} />
          <h2>No events found in evidence register</h2>
          <p style={{ color: "var(--text-muted, #888)", maxWidth: "480px", margin: "0.5rem auto 0" }}>
            {initialEvents.length === 0
              ? "The database is ready and connected to Supabase. Records entered afresh during Milestone B research will appear here."
              : "Try clearing one or more active filters to widen your query."}
          </p>
        </div>
      )}
    </div>
  );
}
