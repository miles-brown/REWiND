"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Calendar, Database, MapPin, MessageSquareQuote, Search, Users, X } from "lucide-react";

interface ResultItem {
  id: string;
  category: "Events" | "People" | "Quotes" | "Places" | "Sources";
  title: string;
  subtitle: string;
  badge?: string;
  href: string;
}

const DEFAULT_ACTIONS: ResultItem[] = [
  {
    id: "action-people",
    category: "People",
    title: "Monitored Figures",
    subtitle: "Explore documented historical actors and chronologies",
    badge: "Registry",
    href: "/people",
  },
  {
    id: "action-events",
    category: "Events",
    title: "Documented Events",
    subtitle: "Search bilateral summits, plenary speeches, and appearances",
    badge: "Atlas",
    href: "/events",
  },
  {
    id: "action-sources",
    category: "Sources",
    title: "Primary Source Catalog",
    subtitle: "Browse official transcripts, government archives, and broadcasts",
    badge: "Evidence",
    href: "/sources",
  },
  {
    id: "action-places",
    category: "Places",
    title: "Gazetteer & Venues",
    subtitle: "Explore global diplomatic locations and meeting grounds",
    badge: "Gazetteer",
    href: "/places",
  },
  {
    id: "action-methodology",
    category: "Sources",
    title: "Forensic Evidence Methodology",
    subtitle: "Standards for source classification and confidence grading",
    badge: "Guide",
    href: "/methodology",
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
  const [searchResults, setSearchResults] = useState<ResultItem[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const trimmed = query.trim();
  const results = trimmed ? searchResults : DEFAULT_ACTIONS;

  useEffect(() => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) {
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(trimmedQuery)}&limit=10`);
        if (res.ok) {
          const json = await res.json();
          const items: ResultItem[] = (json.results || []).map((r: { id: string; type: string; title: string; subtitle?: string; badge?: string; url: string }) => {
            let cat: ResultItem["category"] = "Events";
            if (r.type === "person") cat = "People";
            else if (r.type === "place") cat = "Places";
            else if (r.type === "source") cat = "Sources";
            return {
              id: r.id,
              category: cat,
              title: r.title,
              subtitle: r.subtitle || "",
              badge: r.badge,
              href: r.url,
            };
          });
          setSearchResults(items);
        }
      } catch {
        // Fallback gracefully on network error
      } finally {
        setIsLoading(false);
      }
    }, 150);

    return () => clearTimeout(timer);
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
      router.push(results[activeIndex].href);
    } else if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    }
  };

  if (!isOpen) return null;

  const categoryIcon = (category: ResultItem["category"]) => {
    switch (category) {
      case "Events":
        return <Calendar size={14} />;
      case "People":
        return <Users size={14} />;
      case "Quotes":
        return <MessageSquareQuote size={14} />;
      case "Places":
        return <MapPin size={14} />;
      case "Sources":
        return <Database size={14} />;
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
              setQuery(e.target.value);
              setSelectedIndex(0);
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
            <button className="search-clear-btn" onClick={() => setQuery("")} aria-label="Clear query">
              <X size={15} />
            </button>
          ) : (
            <kbd className="search-kbd">ESC</kbd>
          )}
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
                href={item.href}
                onClick={onClose}
                onMouseEnter={() => setSelectedIndex(index)}
                className={`command-item ${isSelected ? "selected" : ""}`}
              >
                <div className="command-item-icon">{categoryIcon(item.category)}</div>
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
