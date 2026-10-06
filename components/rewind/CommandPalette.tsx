"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, Calendar, Database, Loader2, MapPin, MessageSquareQuote, Search, Sparkles, Users, X } from "lucide-react";
import type { SearchResultItem } from "@/lib/rewind/types";

const DEFAULT_ACTIONS: SearchResultItem[] = [
  {
    id: "action-people",
    type: "person",
    title: "Monitored Figures",
    subtitle: "Explore documented historical actors and chronologies",
    badge: "Registry",
    url: "/people",
  },
  {
    id: "action-sources",
    type: "source",
    title: "Archival Primary Sources",
    subtitle: "Verified repository records, transcripts, and press releases",
    badge: "Registry",
    url: "/sources",
  },
  {
    id: "action-relationships",
    type: "person",
    title: "Diplomatic Relationships",
    subtitle: "Spacetime co-presence and bilateral meeting network",
    badge: "Analysis",
    url: "/relationships",
  },
  {
    id: "action-compare",
    type: "event",
    title: "Timeline Comparison",
    subtitle: "Side-by-side chronological analysis of multiple figures",
    badge: "Analysis",
    url: "/compare",
  },
  {
    id: "action-quotes",
    type: "quote",
    title: "Archival Quote Register",
    subtitle: "Attributable speeches, statements, and verified transcripts",
    badge: "Registry",
    url: "/quotes",
  },
  {
    id: "action-places",
    type: "place",
    title: "Geographic Atlas",
    subtitle: "Documented venues, capitals, and event coordinates",
    badge: "Registry",
    url: "/places",
  },
  {
    id: "action-methodology",
    type: "source",
    title: "Forensic Evidence Methodology",
    subtitle: "Standards for source classification and confidence grading",
    badge: "Guide",
    url: "/methodology",
  },
];

type CategoryFilter = "all" | "person" | "event" | "place" | "source" | "quote";

const FILTER_TABS: { id: CategoryFilter; label: string; icon: React.ComponentType<{ size?: number }> }[] = [
  { id: "all", label: "All Categories", icon: Sparkles },
  { id: "person", label: "People", icon: Users },
  { id: "event", label: "Events", icon: Calendar },
  { id: "place", label: "Places", icon: MapPin },
  { id: "source", label: "Sources", icon: Database },
  { id: "quote", label: "Quotes", icon: MessageSquareQuote },
];

const QUICK_QUALIFIERS = [
  "type:monarch",
  "year:2023",
  "country:spain",
  "type:event",
  "type:source",
];

export function CommandPalette({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>("all");
  const [searchResults, setSearchResults] = useState<SearchResultItem[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const searchRequestIdRef = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const trimmed = query.trim();

  // Filter results or default actions by category
  const results = useMemo(() => {
    if (!trimmed) {
      if (activeCategory === "all") return DEFAULT_ACTIONS;
      return DEFAULT_ACTIONS.filter((item) => item.type === activeCategory);
    }
    const explicitTypeMatch = trimmed.match(/\b(?:type|kind|category):([a-zA-Z_-]+)\b/i);
    const rawCategory = explicitTypeMatch ? explicitTypeMatch[1].toLowerCase() : activeCategory;
    const categoryMap: Record<string, string> = {
      events: "event",
      people: "person",
      figure: "person",
      monarch: "person",
      places: "place",
      venues: "place",
      venue: "place",
      locations: "place",
      quotes: "quote",
      statements: "quote",
      sources: "source",
      documents: "source",
    };
    const effectiveCategory = categoryMap[rawCategory] || rawCategory;
    if (effectiveCategory === "all") return searchResults;
    return searchResults.filter((item) => item.type === effectiveCategory);
  }, [trimmed, searchResults, activeCategory]);

  useEffect(() => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) {
      searchRequestIdRef.current++;
      return;
    }

    const abortController = new AbortController();
    const requestId = ++searchRequestIdRef.current;
    const hasExplicitTypeQualifier = /\b(?:type|kind|category):[a-zA-Z_-]+\b/i.test(trimmedQuery);
    const effectiveQuery =
      activeCategory !== "all" && !hasExplicitTypeQualifier
        ? `${trimmedQuery} type:${activeCategory}`
        : trimmedQuery;

    const timer = setTimeout(async () => {
      setIsLoading(true);
      setSearchResults([]);
      setSearchError(null);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(effectiveQuery)}&limit=15`, {
          signal: abortController.signal,
        });
        if (requestId !== searchRequestIdRef.current) return;
        if (res.ok) {
          const json = await res.json();
          if (requestId !== searchRequestIdRef.current) return;
          setSearchResults(json.results || []);
          setSearchError(null);
        } else {
          setSearchResults([]);
          setSearchError("Search failed, please try again.");
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }
        if (requestId === searchRequestIdRef.current) {
          setSearchResults([]);
          setSearchError("Search failed, please try again.");
        }
      } finally {
        if (requestId === searchRequestIdRef.current) {
          setIsLoading(false);
        }
      }
    }, 150);

    return () => {
      clearTimeout(timer);
      abortController.abort();
    };
  }, [query, activeCategory]);

  const activeIndex = selectedIndex >= results.length ? 0 : selectedIndex;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => (i + 1 < results.length ? i + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => (i - 1 >= 0 ? i - 1 : results.length - 1));
    } else if (e.key === "Enter" && results[activeIndex]) {
      e.preventDefault();
      onClose();
      router.push(results[activeIndex].url);
    } else if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    }
  };

  const handleInjectQualifier = (qualifier: string) => {
    const key = qualifier.split(":")[0];
    const keyRegex = new RegExp(`\\b${key}:[a-zA-Z0-9_-]+\\b`, "gi");
    const trimmedQuery = query.trim();
    let updatedQuery = "";

    if (keyRegex.test(trimmedQuery)) {
      updatedQuery = trimmedQuery.replace(keyRegex, qualifier);
    } else {
      updatedQuery = trimmedQuery ? `${trimmedQuery} ${qualifier} ` : `${qualifier} `;
    }

    if (trimmedQuery === updatedQuery.trim()) {
      inputRef.current?.focus();
      return;
    }

    setSelectedIndex(0);
    setSearchResults([]);
    setQuery(updatedQuery);
    requestAnimationFrame(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.setSelectionRange(updatedQuery.length, updatedQuery.length);
      }
    });
  };

  if (!isOpen) return null;

  const categoryIcon = (type: SearchResultItem["type"]) => {
    switch (type) {
      case "event":
        return <Calendar size={14} />;
      case "person":
        return <Users size={14} />;
      case "quote":
        return <MessageSquareQuote size={14} />;
      case "place":
        return <MapPin size={14} />;
      case "source":
        return <Database size={14} />;
      default:
        return <Search size={14} />;
    }
  };

  return (
    <div className="search-overlay" role="dialog" aria-modal="true" aria-label="Command palette">
      <div className="search-backdrop" onClick={onClose} />
      <section className="search-panel command-palette-panel">
        <div className="search-input">
          <Search size={18} />
          <input
            ref={inputRef}
            autoFocus
            value={query}
            onChange={(e) => {
              const val = e.target.value;
              searchRequestIdRef.current++;
              setQuery(val);
              setSelectedIndex(0);
              setSearchResults([]);
              setSearchError(null);
              if (val.trim()) {
                setIsLoading(true);
              } else {
                setIsLoading(false);
              }
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search events, quotes, participants, venues, sources (e.g. type:monarch, year:2023)…"
            aria-label="Search query"
          />
          {isLoading && (
            <span
              className="search-loading-indicator"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                fontSize: "11px",
                opacity: 0.75,
                margin: "0 0.5rem",
                whiteSpace: "nowrap",
              }}
              aria-hidden="true"
            >
              <Loader2 size={13} className="animate-spin" />
              <span>Searching…</span>
            </span>
          )}
          {query ? (
            <button
              className="search-clear-btn"
              onClick={() => {
                searchRequestIdRef.current++;
                setQuery("");
                setSelectedIndex(0);
                setSearchResults([]);
                setSearchError(null);
                setIsLoading(false);
                inputRef.current?.focus();
              }}
              aria-label="Clear query"
            >
              <X size={15} />
            </button>
          ) : (
            <kbd className="search-kbd">ESC</kbd>
          )}
        </div>

        {/* Category Filters Bar */}
        <div className="command-filter-bar" role="group" aria-label="Filter results by category">
          {FILTER_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeCategory === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                aria-pressed={isActive}
                className={`command-filter-pill ${isActive ? "active" : ""}`}
                onClick={() => {
                  searchRequestIdRef.current++;
                  setActiveCategory(tab.id);
                  setSelectedIndex(0);
                  setSearchResults([]);
                  setSearchError(null);
                  if (tab.id !== "all") {
                    const hasQualifier = /\b(?:type|kind|category):[a-zA-Z_-]+\b/i.test(query);
                    if (hasQualifier) {
                      setQuery(query.replace(/\b(?:type|kind|category):[a-zA-Z_-]+\b/i, `type:${tab.id}`).trim());
                    }
                  } else {
                    const stripped = query.replace(/\b(?:type|kind|category):[a-zA-Z_-]+\b/i, "").replace(/\s+/g, " ").trim();
                    if (stripped !== query.trim()) {
                      setQuery(stripped);
                    }
                  }
                  inputRef.current?.focus();
                }}
              >
                <Icon size={12} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Quick Qualifier Pills */}
        <div className="command-qualifiers-bar" aria-label="Quick search qualifiers">
          <span className="command-qualifier-label">Filters:</span>
          {QUICK_QUALIFIERS.map((q) => (
            <button
              key={q}
              type="button"
              className="command-qualifier-pill"
              onClick={() => handleInjectQualifier(q)}
              title={`Add ${q} to search`}
            >
              +{q}
            </button>
          ))}
        </div>

        <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
          {searchError
            ? searchError
            : isLoading
            ? "Searching archival records…"
            : trimmed
            ? `${results.length} archival record${results.length === 1 ? "" : "s"} found for "${trimmed}"`
            : ""}
        </div>

        <div className="command-palette-results" id="command-palette-results" aria-live="polite">
          {searchError ? (
            <div className="empty-copy search-error-copy" role="alert">
              <p style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", color: "var(--color-crimson, #ef4444)" }}>
                <AlertCircle size={15} />
                <span>{searchError}</span>
              </p>
              <small>Check your network connection or try a different search query.</small>
            </div>
          ) : query && !results.length && !isLoading ? (
            <div className="empty-copy">
              <p>No historical records match “{query}”.</p>
              <small>Try searching by person, treaty name, city, or date.</small>
            </div>
          ) : null}

          {results.map((item, index) => {
            const isSelected = index === activeIndex;
            return (
              <Link
                key={item.id}
                id={`cmd-item-${item.id}`}
                href={item.url}
                onClick={onClose}
                onMouseEnter={() => setSelectedIndex(index)}
                className={`command-item ${isSelected ? "selected" : ""}`}
              >
                <div className="command-item-icon">{categoryIcon(item.type)}</div>
                <div className="command-item-text">
                  <div className="command-item-header">
                    <b>{item.title}</b>
                    {item.badge && <span className={`status-tag ${item.badge.toLowerCase()}`}>{item.badge}</span>}
                  </div>
                  <small>{item.subtitle}</small>
                </div>
              </Link>
            );
          })}
        </div>

        <footer className="command-palette-footer">
          <span><kbd>↑</kbd> <kbd>↓</kbd> Navigate</span>
          <span><kbd>↵</kbd> Open</span>
          <span><kbd>ESC</kbd> Close</span>
        </footer>
      </section>
    </div>
  );
}
