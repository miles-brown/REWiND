"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Calendar, Database, MapPin, MessageSquareQuote, Search, Users, X } from "lucide-react";
import type { SearchResultItem } from "@/lib/rewind";

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

export function CommandPalette({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResultItem[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const searchRequestIdRef = useRef(0);

  const trimmed = query.trim();
  const results = trimmed ? searchResults : DEFAULT_ACTIONS;

  useEffect(() => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) {
      searchRequestIdRef.current++;
      return;
    }

    const requestId = ++searchRequestIdRef.current;
    const timer = setTimeout(async () => {
      setIsLoading(true);
      setSearchResults([]);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(trimmedQuery)}&limit=10`);
        if (requestId !== searchRequestIdRef.current) return;
        if (res.ok) {
          const json = await res.json();
          if (requestId !== searchRequestIdRef.current) return;
          setSearchResults(json.results || []);
        } else {
          setSearchResults([]);
        }
      } catch {
        if (requestId === searchRequestIdRef.current) {
          setSearchResults([]);
        }
      } finally {
        if (requestId === searchRequestIdRef.current) {
          setIsLoading(false);
        }
      }
    }, 150);

    return () => {
      clearTimeout(timer);
    };
  }, [query]);

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
            autoFocus
            value={query}
            onChange={(e) => {
              const val = e.target.value;
              searchRequestIdRef.current++;
              setQuery(val);
              setSelectedIndex(0);
              setSearchResults([]);
              if (val.trim()) {
                setIsLoading(true);
              } else {
                setIsLoading(false);
              }
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search events, quotes, participants, venues, sources…"
            aria-label="Search query"
          />
          {isLoading && (
            <span className="search-loading-indicator" style={{ fontSize: "11px", opacity: 0.6, margin: "0 0.5rem" }}>
              Searching…
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
                setIsLoading(false);
              }}
              aria-label="Clear query"
            >
              <X size={15} />
            </button>
          ) : (
            <kbd className="search-kbd">ESC</kbd>
          )}
        </div>
        <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
          {isLoading
            ? "Searching archival records…"
            : trimmed
            ? `${results.length} archival record${results.length === 1 ? "" : "s"} found for "${trimmed}"`
            : ""}
        </div>
        <div className="command-palette-results" aria-live="polite">
          {query && !results.length && (
            <div className="empty-copy">
              <p>No historical records match “{query}”.</p>
              <small>Try searching by person, treaty name, city, or date.</small>
            </div>
          )}
          {results.map((item, index) => {
            const isSelected = index === activeIndex;
            return (
              <Link
                key={item.id}
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
