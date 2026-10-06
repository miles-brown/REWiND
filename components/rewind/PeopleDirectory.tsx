"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowRight,
  ArrowUpDown,
  Building2,
  ChevronRight,
  Compass,
  Crown,
  Globe,
  HeartHandshake,
  IdCard,
  Layers,
  LayoutGrid,
  List,
  Newspaper,
  RotateCcw,
  Scale,
  Search,
  Shield,
  Sparkles,
  UserRound,
  Users,
  X,
} from "lucide-react";
import type { PersonRecord } from "@/lib/rewind";
import { extractPersonNameParts } from "@/lib/rewind/utils";

export type PeopleViewMode = "extended" | "list" | "badge";

export type PeopleSortOption =
  | "birth-asc"
  | "birth-desc"
  | "first-asc"
  | "first-desc"
  | "last-asc"
  | "last-desc"
  | "events-desc";

export type LivingStatusFilter = "all" | "living" | "historical";

const CATEGORY_META: Record<
  string,
  { label: string; icon: React.ComponentType<{ size?: number; className?: string }>; color: string }
> = {
  "head-of-state": { label: "Heads of State", icon: Crown, color: "#eab308" },
  "monarch-royal": { label: "Royalty & Dynasties", icon: Crown, color: "#f59e0b" },
  "politician": { label: "Politicians", icon: Building2, color: "#3b82f6" },
  "diplomat": { label: "Diplomats & Envoys", icon: HeartHandshake, color: "#06b6d4" },
  "judicial-official": { label: "Judicial & Legal", icon: Scale, color: "#a855f7" },
  "intelligence-official": { label: "Intelligence", icon: Shield, color: "#ec4899" },
  "military-leader": { label: "Military Leaders", icon: Shield, color: "#ef4444" },
  "religious-leader": { label: "Religious Leaders", icon: Compass, color: "#10b981" },
  "media-journalist": { label: "Media & Press", icon: Newspaper, color: "#8b5cf6" },
  "corporate-executive": { label: "Corporate & Tech", icon: Layers, color: "#14b8a6" },
  "academic-historian": { label: "Academics", icon: Sparkles, color: "#6366f1" },
  "public-figure": { label: "Public Figures", icon: UserRound, color: "#94a3b8" },
};

function getClassificationMeta(classification?: string) {
  const key = (classification || "public-figure").toLowerCase();
  return (
    CATEGORY_META[key] || {
      label: key.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      icon: UserRound,
      color: "#94a3b8",
    }
  );
}

function getInitials(name: string): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function extractBirthYear(birth?: string | null): number | null {
  if (!birth) return null;
  const match = birth.match(/^(\d{4})/);
  return match ? parseInt(match[1], 10) : null;
}

export function PeopleDirectory({
  people = [],
  eventCounts = {},
}: {
  people: PersonRecord[];
  eventCounts?: Record<string, number>;
}) {
  const searchParams = useSearchParams();

  // URL-driven or default state
  const [viewMode, setViewMode] = useState<PeopleViewMode>(
    (searchParams.get("view") as PeopleViewMode) || "extended"
  );
  const [sortOption, setSortOption] = useState<PeopleSortOption>(
    (searchParams.get("sort") as PeopleSortOption) || "last-asc"
  );
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [nationalityFilter, setNationalityFilter] = useState<string>(
    searchParams.get("nationality") || "all"
  );
  const [categoryFilter, setCategoryFilter] = useState<string>(
    searchParams.get("category") || "all"
  );
  const [statusFilter, setStatusFilter] = useState<LivingStatusFilter>(
    (searchParams.get("status") as LivingStatusFilter) || "all"
  );

  // Sync state with URL without full page reload
  useEffect(() => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);

    if (viewMode !== "extended") url.searchParams.set("view", viewMode);
    else url.searchParams.delete("view");

    if (sortOption !== "last-asc") url.searchParams.set("sort", sortOption);
    else url.searchParams.delete("sort");

    if (query.trim()) url.searchParams.set("q", query.trim());
    else url.searchParams.delete("q");

    if (nationalityFilter !== "all") url.searchParams.set("nationality", nationalityFilter);
    else url.searchParams.delete("nationality");

    if (categoryFilter !== "all") url.searchParams.set("category", categoryFilter);
    else url.searchParams.delete("category");

    if (statusFilter !== "all") url.searchParams.set("status", statusFilter);
    else url.searchParams.delete("status");

    window.history.replaceState({}, "", url.toString());
  }, [viewMode, sortOption, query, nationalityFilter, categoryFilter, statusFilter]);

  // Precompute name parts for all figures
  const namePartsMap = useMemo(() => {
    const map = new Map<string, { firstName: string; lastName: string; displayName: string }>();
    for (const p of people) {
      map.set(p.slug, extractPersonNameParts(p));
    }
    return map;
  }, [people]);

  // Unique Nationalities with counts
  const nationalityOptions = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of people) {
      if (p.nationality) {
        counts.set(p.nationality, (counts.get(p.nationality) || 0) + 1);
      }
    }
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([nat, count]) => ({ nationality: nat, count }));
  }, [people]);

  // Unique Categories with counts
  const categoryOptions = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of people) {
      const cat = p.classification || "public-figure";
      counts.set(cat, (counts.get(cat) || 0) + 1);
    }
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([cat, count]) => ({
        category: cat,
        label: getClassificationMeta(cat).label,
        count,
      }));
  }, [people]);

  // Filter & Sort
  const filteredPeople = useMemo(() => {
    const q = query.toLowerCase().trim();

    return people
      .filter((p) => {
        // Query search
        if (q) {
          const nameMatch = p.name.toLowerCase().includes(q);
          const canonicalMatch = p.canonicalName.toLowerCase().includes(q);
          const descMatch = p.description.toLowerCase().includes(q);
          const natMatch = p.nationality ? p.nationality.toLowerCase().includes(q) : false;
          const birthNameMatch = p.fullBirthName ? p.fullBirthName.toLowerCase().includes(q) : false;
          if (!nameMatch && !canonicalMatch && !descMatch && !natMatch && !birthNameMatch) {
            return false;
          }
        }

        // Nationality filter
        if (nationalityFilter !== "all" && p.nationality !== nationalityFilter) {
          return false;
        }

        // Category filter
        if (categoryFilter !== "all" && p.classification !== categoryFilter) {
          return false;
        }

        // Living / Historical status filter
        if (statusFilter === "living" && p.death) return false;
        if (statusFilter === "historical" && !p.death) return false;

        return true;
      })
      .sort((a, b) => {
        const nameA = namePartsMap.get(a.slug) || { firstName: a.name, lastName: a.name, displayName: a.name };
        const nameB = namePartsMap.get(b.slug) || { firstName: b.name, lastName: b.name, displayName: b.name };

        if (sortOption === "events-desc") {
          const countA = eventCounts[a.slug] || eventCounts[a.id] || a.eventCount || 0;
          const countB = eventCounts[b.slug] || eventCounts[b.id] || b.eventCount || 0;
          if (countB !== countA) return countB - countA;
          return nameA.lastName.localeCompare(nameB.lastName);
        }

        if (sortOption === "birth-asc") {
          const yA = extractBirthYear(a.birth) ?? 9999;
          const yB = extractBirthYear(b.birth) ?? 9999;
          if (yA !== yB) return yA - yB;
          return nameA.lastName.localeCompare(nameB.lastName);
        }

        if (sortOption === "birth-desc") {
          const yA = extractBirthYear(a.birth) ?? -9999;
          const yB = extractBirthYear(b.birth) ?? -9999;
          if (yB !== yA) return yB - yA;
          return nameA.lastName.localeCompare(nameB.lastName);
        }

        if (sortOption === "first-asc") {
          const cmp = nameA.firstName.localeCompare(nameB.firstName);
          if (cmp !== 0) return cmp;
          return nameA.lastName.localeCompare(nameB.lastName);
        }

        if (sortOption === "first-desc") {
          const cmp = nameB.firstName.localeCompare(nameA.firstName);
          if (cmp !== 0) return cmp;
          return nameB.lastName.localeCompare(nameA.lastName);
        }

        if (sortOption === "last-asc") {
          const cmp = nameA.lastName.localeCompare(nameB.lastName);
          if (cmp !== 0) return cmp;
          return nameA.firstName.localeCompare(nameB.firstName);
        }

        if (sortOption === "last-desc") {
          const cmp = nameB.lastName.localeCompare(nameA.lastName);
          if (cmp !== 0) return cmp;
          return nameB.firstName.localeCompare(nameA.firstName);
        }

        return 0;
      });
  }, [people, query, nationalityFilter, categoryFilter, statusFilter, sortOption, namePartsMap, eventCounts]);

  const hasActiveFilters =
    query.trim() !== "" ||
    nationalityFilter !== "all" ||
    categoryFilter !== "all" ||
    statusFilter !== "all";

  const handleResetFilters = () => {
    setQuery("");
    setNationalityFilter("all");
    setCategoryFilter("all");
    setStatusFilter("all");
    setSortOption("last-asc");
  };

  return (
    <div className="people-directory-container" style={{ width: "100%", maxWidth: "1400px", margin: "0 auto" }}>
      {/* Search and Control Toolbar */}
      <div
        className="people-toolbar"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          background: "var(--bg-card, rgba(15, 23, 42, 0.75))",
          border: "1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))",
          borderRadius: "12px",
          padding: "1.25rem",
          backdropFilter: "blur(12px)",
          marginBottom: "1.5rem",
        }}
      >
        {/* Top Row: Search Input, Sort Selector & View Mode Toggles */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "0.75rem",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* Search Field */}
          <div
            style={{
              position: "relative",
              flex: "1 1 280px",
              minWidth: "240px",
            }}
          >
            <Search
              size={18}
              style={{
                position: "absolute",
                left: "0.85rem",
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--text-muted, #94a3b8)",
                pointerEvents: "none",
              }}
            />
            <input
              type="search"
              aria-label="Search people catalog"
              placeholder="Search by name, role, country, or keyword..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{
                width: "100%",
                padding: "0.6rem 2.2rem 0.6rem 2.4rem",
                background: "rgba(0, 0, 0, 0.35)",
                border: "1px solid var(--border-subtle, rgba(255, 255, 255, 0.12))",
                borderRadius: "8px",
                color: "var(--text-primary, #f8fafc)",
                fontSize: "0.9rem",
                outline: "none",
                transition: "border-color 0.15s ease",
              }}
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Clear search input"
                style={{
                  position: "absolute",
                  right: "0.6rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "transparent",
                  border: "none",
                  color: "var(--text-muted, #94a3b8)",
                  cursor: "pointer",
                  padding: "0.2rem",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Right Group: Sort & View Modes */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", alignItems: "center" }}>
            {/* Sort Dropdown */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <ArrowUpDown size={16} style={{ color: "var(--text-muted, #94a3b8)" }} />
              <select
                aria-label="Sort people by"
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value as PeopleSortOption)}
                style={{
                  padding: "0.55rem 0.85rem",
                  background: "rgba(0, 0, 0, 0.35)",
                  border: "1px solid var(--border-subtle, rgba(255, 255, 255, 0.12))",
                  borderRadius: "8px",
                  color: "var(--text-primary, #f8fafc)",
                  fontSize: "0.85rem",
                  cursor: "pointer",
                  outline: "none",
                }}
              >
                <option value="last-asc">Last Name (A → Z)</option>
                <option value="last-desc">Last Name (Z → A)</option>
                <option value="first-asc">First Name (A → Z)</option>
                <option value="first-desc">First Name (Z → A)</option>
                <option value="birth-asc">Birth Year (Oldest First)</option>
                <option value="birth-desc">Birth Year (Youngest First)</option>
                <option value="events-desc">Documented Events (Most First)</option>
              </select>
            </div>

            {/* View Mode Toggle Buttons */}
            <div
              role="group"
              aria-label="Directory view options"
              style={{
                display: "inline-flex",
                background: "rgba(0, 0, 0, 0.4)",
                border: "1px solid var(--border-subtle, rgba(255, 255, 255, 0.12))",
                borderRadius: "8px",
                padding: "2px",
              }}
            >
              <button
                type="button"
                onClick={() => setViewMode("extended")}
                aria-label="Extended card view"
                aria-pressed={viewMode === "extended"}
                title="Extended Card View"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.35rem",
                  padding: "0.45rem 0.75rem",
                  border: "none",
                  borderRadius: "6px",
                  background: viewMode === "extended" ? "var(--primary-color, #2563eb)" : "transparent",
                  color: viewMode === "extended" ? "#ffffff" : "var(--text-muted, #94a3b8)",
                  fontSize: "0.8rem",
                  fontWeight: 500,
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                <LayoutGrid size={15} />
                <span className="hide-mobile">Extended</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode("list")}
                aria-label="List table view"
                aria-pressed={viewMode === "list"}
                title="List Table View"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.35rem",
                  padding: "0.45rem 0.75rem",
                  border: "none",
                  borderRadius: "6px",
                  background: viewMode === "list" ? "var(--primary-color, #2563eb)" : "transparent",
                  color: viewMode === "list" ? "#ffffff" : "var(--text-muted, #94a3b8)",
                  fontSize: "0.8rem",
                  fontWeight: 500,
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                <List size={15} />
                <span className="hide-mobile">List</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode("badge")}
                aria-label="Badge thumbnail view"
                aria-pressed={viewMode === "badge"}
                title="Badge Thumbnail View"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.35rem",
                  padding: "0.45rem 0.75rem",
                  border: "none",
                  borderRadius: "6px",
                  background: viewMode === "badge" ? "var(--primary-color, #2563eb)" : "transparent",
                  color: viewMode === "badge" ? "#ffffff" : "var(--text-muted, #94a3b8)",
                  fontSize: "0.8rem",
                  fontWeight: 500,
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                <IdCard size={15} />
                <span className="hide-mobile">Badge</span>
              </button>
            </div>
          </div>
        </div>

        {/* Second Row: Filters Strip (Category, Nationality, Living Status) */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "0.75rem",
            alignItems: "center",
            paddingTop: "0.5rem",
            borderTop: "1px solid rgba(255, 255, 255, 0.06)",
          }}
        >
          {/* Category Filter */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted, #94a3b8)", fontWeight: 500 }}>
              Category:
            </span>
            <select
              aria-label="Filter by category"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              style={{
                padding: "0.4rem 0.65rem",
                background: "rgba(0, 0, 0, 0.35)",
                border: "1px solid var(--border-subtle, rgba(255, 255, 255, 0.12))",
                borderRadius: "6px",
                color: "var(--text-primary, #f8fafc)",
                fontSize: "0.8rem",
                cursor: "pointer",
                outline: "none",
              }}
            >
              <option value="all">All Categories ({people.length})</option>
              {categoryOptions.map((c) => (
                <option key={c.category} value={c.category}>
                  {c.label} ({c.count})
                </option>
              ))}
            </select>
          </div>

          {/* Nationality Filter */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted, #94a3b8)", fontWeight: 500 }}>
              Nationality:
            </span>
            <select
              aria-label="Filter by nationality"
              value={nationalityFilter}
              onChange={(e) => setNationalityFilter(e.target.value)}
              style={{
                padding: "0.4rem 0.65rem",
                background: "rgba(0, 0, 0, 0.35)",
                border: "1px solid var(--border-subtle, rgba(255, 255, 255, 0.12))",
                borderRadius: "6px",
                color: "var(--text-primary, #f8fafc)",
                fontSize: "0.8rem",
                cursor: "pointer",
                outline: "none",
              }}
            >
              <option value="all">All Nationalities ({people.length})</option>
              {nationalityOptions.map((n) => (
                <option key={n.nationality} value={n.nationality}>
                  {n.nationality} ({n.count})
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted, #94a3b8)", fontWeight: 500 }}>
              Era:
            </span>
            <select
              aria-label="Filter by living status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as LivingStatusFilter)}
              style={{
                padding: "0.4rem 0.65rem",
                background: "rgba(0, 0, 0, 0.35)",
                border: "1px solid var(--border-subtle, rgba(255, 255, 255, 0.12))",
                borderRadius: "6px",
                color: "var(--text-primary, #f8fafc)",
                fontSize: "0.8rem",
                cursor: "pointer",
                outline: "none",
              }}
            >
              <option value="all">All Figures</option>
              <option value="living">Living Contemporary Figures</option>
              <option value="historical">Historical Deceased Figures</option>
            </select>
          </div>

          {/* Reset Filters Action */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleResetFilters}
              aria-label="Reset all search and filter criteria"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.3rem",
                padding: "0.35rem 0.65rem",
                background: "rgba(239, 68, 68, 0.12)",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                borderRadius: "6px",
                color: "#fca5a5",
                fontSize: "0.75rem",
                cursor: "pointer",
                marginLeft: "auto",
                transition: "all 0.15s ease",
              }}
            >
              <RotateCcw size={13} />
              Reset Filters
            </button>
          )}
        </div>

        {/* Results Live Region */}
        <div
          aria-live="polite"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: "0.8rem",
            color: "var(--text-muted, #94a3b8)",
            paddingTop: "0.25rem",
          }}
        >
          <span>
            Showing <strong style={{ color: "var(--text-primary, #f8fafc)" }}>{filteredPeople.length}</strong> of{" "}
            {people.length} documented historical figures
          </span>
          {hasActiveFilters && (
            <span style={{ fontSize: "0.75rem", color: "#60a5fa" }}>Filtered results active</span>
          )}
        </div>
      </div>

      {/* Zero State for No Results */}
      {filteredPeople.length === 0 ? (
        <div
          className="zero-state"
          style={{
            padding: "4rem 2rem",
            textAlign: "center",
            background: "rgba(15, 23, 42, 0.4)",
            border: "1px dashed var(--border-subtle, rgba(255, 255, 255, 0.12))",
            borderRadius: "12px",
            margin: "2rem auto",
            maxWidth: "600px",
          }}
        >
          <Users size={40} style={{ margin: "0 auto 1rem", opacity: 0.4, color: "#94a3b8" }} />
          <h2 style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>No figures match criteria</h2>
          <p style={{ color: "var(--text-muted, #94a3b8)", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
            No registered historical figures match your current search query or filter selection.
          </p>
          <button
            type="button"
            onClick={handleResetFilters}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.6rem 1.2rem",
              background: "var(--primary-color, #2563eb)",
              color: "#ffffff",
              border: "none",
              borderRadius: "8px",
              fontWeight: 500,
              fontSize: "0.85rem",
              cursor: "pointer",
            }}
          >
            <RotateCcw size={15} />
            Reset all filters
          </button>
        </div>
      ) : viewMode === "extended" ? (
        /* ========================================================================= */
        /* 1. EXTENDED VIEW (Rich Card Grid)                                         */
        /* ========================================================================= */
        <div
          className="people-extended-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
            gap: "1.25rem",
          }}
        >
          {filteredPeople.map((p) => {
            const birthYear = p.birth ? p.birth.slice(0, 4) : "—";
            const deathYear = p.death ? p.death.slice(0, 4) : "Present";
            const catMeta = getClassificationMeta(p.classification);
            const CatIcon = catMeta.icon;
            const initials = getInitials(p.name);
            const eventsCount = eventCounts[p.slug] || eventCounts[p.id] || p.eventCount || 0;

            return (
              <Link
                href={`/person/${p.slug}`}
                key={p.id}
                className="person-extended-card"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  background: "var(--bg-card, rgba(15, 23, 42, 0.7))",
                  border: "1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))",
                  borderRadius: "12px",
                  padding: "1.25rem",
                  textDecoration: "none",
                  color: "inherit",
                  position: "relative",
                  overflow: "hidden",
                  transition: "transform 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease",
                }}
              >
                {/* Header: Monogram Avatar, Name, Dates & Living Dot */}
                <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start", marginBottom: "0.85rem" }}>
                  <div
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "10px",
                      background: "linear-gradient(135deg, rgba(37, 99, 235, 0.35), rgba(147, 51, 234, 0.35))",
                      border: "1px solid rgba(255, 255, 255, 0.15)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 700,
                      fontSize: "1.1rem",
                      color: "#f8fafc",
                      flexShrink: 0,
                      position: "relative",
                    }}
                  >
                    {initials}
                    {/* Living Status Dot */}
                    <span
                      title={p.death ? "Historical Figure" : "Living Figure"}
                      style={{
                        position: "absolute",
                        bottom: "-2px",
                        right: "-2px",
                        width: "10px",
                        height: "10px",
                        borderRadius: "50%",
                        background: p.death ? "#94a3b8" : "#10b981",
                        border: "2px solid #0f172a",
                      }}
                    />
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.15rem" }}>
                      <span
                        style={{
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          color: "var(--text-muted, #94a3b8)",
                          letterSpacing: "0.03em",
                        }}
                      >
                        {birthYear} — {deathYear}
                      </span>
                      {eventsCount > 0 && (
                        <span
                          style={{
                            fontSize: "0.7rem",
                            padding: "0.1rem 0.4rem",
                            borderRadius: "4px",
                            background: "rgba(37, 99, 235, 0.15)",
                            color: "#93c5fd",
                            fontWeight: 500,
                          }}
                        >
                          {eventsCount} {eventsCount === 1 ? "event" : "events"}
                        </span>
                      )}
                    </div>
                    <h2
                      style={{
                        fontSize: "1.1rem",
                        fontWeight: 700,
                        color: "var(--text-primary, #f8fafc)",
                        margin: 0,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {p.name}
                    </h2>
                    {p.fullBirthName && p.fullBirthName !== p.name && (
                      <p
                        style={{
                          fontSize: "0.75rem",
                          color: "var(--text-muted, #94a3b8)",
                          margin: "0.1rem 0 0",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {p.fullBirthName}
                      </p>
                    )}
                  </div>
                </div>

                {/* Primary Role / Title */}
                {p.description && (
                  <p
                    style={{
                      fontSize: "0.85rem",
                      color: "#cbd5e1",
                      lineHeight: "1.35",
                      margin: "0 0 0.85rem",
                      fontWeight: 500,
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {p.description}
                  </p>
                )}

                {/* Tags Strip (Nationality & Category) */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginTop: "auto", marginBottom: "0.75rem" }}>
                  {p.nationality && (
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.3rem",
                        fontSize: "0.72rem",
                        fontWeight: 600,
                        padding: "0.2rem 0.5rem",
                        borderRadius: "4px",
                        background: "rgba(255, 255, 255, 0.06)",
                        color: "#e2e8f0",
                      }}
                    >
                      <Globe size={11} />
                      {p.nationality}
                    </span>
                  )}
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.3rem",
                      fontSize: "0.72rem",
                      fontWeight: 600,
                      padding: "0.2rem 0.5rem",
                      borderRadius: "4px",
                      background: `rgba(${catMeta.color === "#eab308" ? "234, 179, 8" : "59, 130, 246"}, 0.12)`,
                      color: catMeta.color,
                    }}
                  >
                    <CatIcon size={11} />
                    {catMeta.label}
                  </span>
                </div>

                {/* Card Footer: View Timeline Link */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingTop: "0.75rem",
                    borderTop: "1px solid rgba(255, 255, 255, 0.06)",
                    fontSize: "0.8rem",
                    color: "var(--primary-color, #60a5fa)",
                    fontWeight: 600,
                  }}
                >
                  <span>Explore chronology & evidence</span>
                  <ArrowRight size={15} />
                </div>
              </Link>
            );
          })}
        </div>
      ) : viewMode === "list" ? (
        /* ========================================================================= */
        /* 2. LIST VIEW (Structured Table View)                                      */
        /* ========================================================================= */
        <div
          className="people-list-container"
          style={{
            background: "var(--bg-card, rgba(15, 23, 42, 0.7))",
            border: "1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))",
            borderRadius: "12px",
            overflowX: "auto",
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              textAlign: "left",
              fontSize: "0.85rem",
            }}
          >
            <thead>
              <tr
                style={{
                  borderBottom: "1px solid var(--border-subtle, rgba(255, 255, 255, 0.12))",
                  background: "rgba(0, 0, 0, 0.25)",
                }}
              >
                <th style={{ padding: "0.85rem 1rem", fontWeight: 600, color: "var(--text-muted, #94a3b8)" }}>
                  Historical Figure
                </th>
                <th style={{ padding: "0.85rem 1rem", fontWeight: 600, color: "var(--text-muted, #94a3b8)" }}>
                  Era / Life Span
                </th>
                <th style={{ padding: "0.85rem 1rem", fontWeight: 600, color: "var(--text-muted, #94a3b8)" }}>
                  Nationality
                </th>
                <th style={{ padding: "0.85rem 1rem", fontWeight: 600, color: "var(--text-muted, #94a3b8)" }}>
                  Classification
                </th>
                <th style={{ padding: "0.85rem 1rem", fontWeight: 600, color: "var(--text-muted, #94a3b8)" }}>
                  Primary Office / Role
                </th>
                <th style={{ padding: "0.85rem 1rem", textAlign: "right", fontWeight: 600, color: "var(--text-muted, #94a3b8)" }}>
                  Events
                </th>
                <th style={{ padding: "0.85rem 1rem", width: "40px" }} aria-label="Actions"></th>
              </tr>
            </thead>
            <tbody>
              {filteredPeople.map((p) => {
                const birthYear = p.birth ? p.birth.slice(0, 4) : "—";
                const deathYear = p.death ? p.death.slice(0, 4) : "Present";
                const catMeta = getClassificationMeta(p.classification);
                const CatIcon = catMeta.icon;
                const initials = getInitials(p.name);
                const eventsCount = eventCounts[p.slug] || eventCounts[p.id] || p.eventCount || 0;

                return (
                  <tr
                    key={p.id}
                    className="people-list-row"
                    style={{
                      borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
                      transition: "background 0.15s ease",
                    }}
                  >
                    {/* Figure Name & Monogram */}
                    <td style={{ padding: "0.75rem 1rem" }}>
                      <Link
                        href={`/person/${p.slug}`}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.75rem",
                          textDecoration: "none",
                          color: "inherit",
                        }}
                      >
                        <span
                          style={{
                            width: "32px",
                            height: "32px",
                            borderRadius: "6px",
                            background: "linear-gradient(135deg, rgba(37, 99, 235, 0.3), rgba(147, 51, 234, 0.3))",
                            border: "1px solid rgba(255, 255, 255, 0.1)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: 700,
                            fontSize: "0.8rem",
                            color: "#f8fafc",
                            flexShrink: 0,
                          }}
                        >
                          {initials}
                        </span>
                        <div>
                          <strong style={{ display: "block", color: "var(--text-primary, #f8fafc)" }}>
                            {p.name}
                          </strong>
                          {p.fullBirthName && p.fullBirthName !== p.name && (
                            <span style={{ fontSize: "0.75rem", color: "var(--text-muted, #94a3b8)" }}>
                              {p.fullBirthName}
                            </span>
                          )}
                        </div>
                      </Link>
                    </td>

                    {/* Dates */}
                    <td style={{ padding: "0.75rem 1rem", color: "var(--text-muted, #94a3b8)", whiteSpace: "nowrap" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}>
                        <span
                          style={{
                            width: "6px",
                            height: "6px",
                            borderRadius: "50%",
                            background: p.death ? "#94a3b8" : "#10b981",
                          }}
                        />
                        {birthYear} — {deathYear}
                      </span>
                    </td>

                    {/* Nationality */}
                    <td style={{ padding: "0.75rem 1rem", whiteSpace: "nowrap" }}>
                      {p.nationality ? (
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.3rem",
                            fontSize: "0.75rem",
                            padding: "0.15rem 0.45rem",
                            borderRadius: "4px",
                            background: "rgba(255, 255, 255, 0.06)",
                            color: "#e2e8f0",
                          }}
                        >
                          <Globe size={11} />
                          {p.nationality}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>

                    {/* Category */}
                    <td style={{ padding: "0.75rem 1rem", whiteSpace: "nowrap" }}>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.3rem",
                          fontSize: "0.75rem",
                          padding: "0.15rem 0.45rem",
                          borderRadius: "4px",
                          background: `rgba(59, 130, 246, 0.1)`,
                          color: catMeta.color,
                        }}
                      >
                        <CatIcon size={11} />
                        {catMeta.label}
                      </span>
                    </td>

                    {/* Role */}
                    <td style={{ padding: "0.75rem 1rem", color: "#cbd5e1", maxWidth: "320px" }}>
                      <div
                        style={{
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {p.description || "—"}
                      </div>
                    </td>

                    {/* Event Count */}
                    <td style={{ padding: "0.75rem 1rem", textAlign: "right", fontWeight: 600, color: "#93c5fd" }}>
                      {eventsCount > 0 ? eventsCount : "—"}
                    </td>

                    {/* Chevron Link */}
                    <td style={{ padding: "0.75rem 1rem", textAlign: "right" }}>
                      <Link href={`/person/${p.slug}`} aria-label={`View dossier for ${p.name}`} style={{ color: "#60a5fa" }}>
                        <ChevronRight size={16} />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        /* ========================================================================= */
        /* 3. BADGE VIEW (Visual Thumbnail Grid)                                     */
        /* ========================================================================= */
        <div
          className="people-badge-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
            gap: "1rem",
          }}
        >
          {filteredPeople.map((p) => {
            const birthYear = p.birth ? p.birth.slice(0, 4) : "—";
            const deathYear = p.death ? p.death.slice(0, 4) : "Present";
            const catMeta = getClassificationMeta(p.classification);
            const CatIcon = catMeta.icon;
            const initials = getInitials(p.name);
            const eventsCount = eventCounts[p.slug] || eventCounts[p.id] || p.eventCount || 0;

            return (
              <Link
                href={`/person/${p.slug}`}
                key={p.id}
                className="person-badge-card"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                  background: "var(--bg-card, rgba(15, 23, 42, 0.7))",
                  border: "1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))",
                  borderRadius: "12px",
                  padding: "1.25rem 0.85rem",
                  textDecoration: "none",
                  color: "inherit",
                  position: "relative",
                  transition: "transform 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease",
                }}
              >
                {/* Large Monogram / Portrait Avatar */}
                <div
                  style={{
                    width: "56px",
                    height: "56px",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, rgba(37, 99, 235, 0.35), rgba(147, 51, 234, 0.35))",
                    border: "2px solid rgba(255, 255, 255, 0.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                    fontSize: "1.25rem",
                    color: "#f8fafc",
                    marginBottom: "0.75rem",
                    position: "relative",
                  }}
                >
                  {initials}
                  {/* Living Status Dot */}
                  <span
                    title={p.death ? "Historical Figure" : "Living Figure"}
                    style={{
                      position: "absolute",
                      bottom: "0",
                      right: "0",
                      width: "12px",
                      height: "12px",
                      borderRadius: "50%",
                      background: p.death ? "#94a3b8" : "#10b981",
                      border: "2px solid #0f172a",
                    }}
                  />
                </div>

                {/* Figure Name */}
                <h3
                  style={{
                    fontSize: "0.95rem",
                    fontWeight: 700,
                    color: "var(--text-primary, #f8fafc)",
                    margin: "0 0 0.25rem",
                    lineHeight: "1.25",
                    maxHeight: "2.5rem",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                  }}
                >
                  {p.name}
                </h3>

                {/* Era / Dates */}
                <span
                  style={{
                    fontSize: "0.72rem",
                    color: "var(--text-muted, #94a3b8)",
                    fontWeight: 500,
                    marginBottom: "0.5rem",
                  }}
                >
                  {birthYear} — {deathYear}
                </span>

                {/* Nationality & Category Badges */}
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "0.3rem",
                    justifyContent: "center",
                    marginTop: "auto",
                  }}
                >
                  {p.nationality && (
                    <span
                      style={{
                        fontSize: "0.68rem",
                        padding: "0.15rem 0.4rem",
                        borderRadius: "4px",
                        background: "rgba(255, 255, 255, 0.06)",
                        color: "#cbd5e1",
                        fontWeight: 500,
                      }}
                    >
                      {p.nationality}
                    </span>
                  )}
                  <span
                    title={catMeta.label}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      padding: "0.15rem 0.35rem",
                      borderRadius: "4px",
                      background: "rgba(59, 130, 246, 0.1)",
                      color: catMeta.color,
                    }}
                  >
                    <CatIcon size={11} />
                  </span>
                  {eventsCount > 0 && (
                    <span
                      title={`${eventsCount} documented historical events`}
                      style={{
                        fontSize: "0.68rem",
                        padding: "0.15rem 0.35rem",
                        borderRadius: "4px",
                        background: "rgba(59, 130, 246, 0.12)",
                        color: "#93c5fd",
                        fontWeight: 600,
                      }}
                    >
                      {eventsCount} ev
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
