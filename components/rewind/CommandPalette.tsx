"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Calendar, Database, MapPin, MessageSquareQuote, Search, Users, X } from "lucide-react";
import { events, people, sources } from "@/data/rewind";

interface ResultItem {
  id: string;
  category: "Events" | "People" | "Quotes" | "Places" | "Sources";
  title: string;
  subtitle: string;
  badge?: string;
  href: string;
}

export function CommandPalette({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  const results = useMemo<ResultItem[]>(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return [
        {
          id: "p-netanyahu",
          category: "People",
          title: "Benjamin Netanyahu",
          subtitle: "Documented political chronology from 1949 to present",
          badge: "Featured",
          href: "/person/benjamin-netanyahu",
        },
        ...events.slice(0, 3).map((e) => ({
          id: e.id,
          category: "Events" as const,
          title: e.eventName,
          subtitle: `${e.startDate} · ${e.city}, ${e.country}`,
          badge: e.verificationStatus,
          href: `/event/${e.slug}`,
        })),
        {
          id: "m-methodology",
          category: "Sources",
          title: "Forensic Evidence Methodology",
          subtitle: "Standards for source classification and confidence grading",
          badge: "Guide",
          href: "/methodology",
        },
      ];
    }

    const matchedEvents: ResultItem[] = events
      .filter((e) =>
        (e.eventName + " " + e.summary + " " + e.city + " " + e.country + " " + e.eventTypes.join(" "))
          .toLowerCase()
          .includes(q)
      )
      .slice(0, 5)
      .map((e) => ({
        id: e.id,
        category: "Events",
        title: e.eventName,
        subtitle: `${e.startDate} · ${e.city}, ${e.country}`,
        badge: e.verificationStatus,
        href: `/event/${e.slug}`,
      }));

    const matchedPeople: ResultItem[] = people
      .filter((p) => (p.name + " " + p.description).toLowerCase().includes(q))
      .slice(0, 4)
      .map((p) => ({
        id: p.id,
        category: "People",
        title: p.name,
        subtitle: p.description,
        badge: "Person",
        href: `/person/${p.slug}`,
      }));

    const matchedQuotes: ResultItem[] = events
      .flatMap((e) =>
        e.quotes.map((quote, idx) => ({
          id: `${e.id}-q-${idx}`,
          category: "Quotes" as const,
          title: `"${quote.text.slice(0, 90)}${quote.text.length > 90 ? "…" : ""}"`,
          subtitle: `${quote.speaker} · ${e.startDate} (${e.eventName})`,
          badge: quote.language.toUpperCase(),
          href: `/event/${e.slug}`,
        }))
      )
      .filter((item) => item.title.toLowerCase().includes(q) || item.subtitle.toLowerCase().includes(q))
      .slice(0, 4);

    const matchedPlaces: ResultItem[] = Array.from(new Set(events.map((e) => e.city)))
      .map((city) => {
        const matchingEvts = events.filter((e) => e.city === city);
        const country = matchingEvts[0]?.country || "";
        const slug = city.toLowerCase().replace(/[^a-z0-9]+/g, "-");
        return {
          id: `place-${slug}`,
          category: "Places" as const,
          title: city,
          subtitle: `${country} · ${matchingEvts.length} documented events`,
          badge: "Location",
          href: `/place/${slug}`,
        };
      })
      .filter((pl) => (pl.title + " " + pl.subtitle).toLowerCase().includes(q))
      .slice(0, 3);

    const matchedSources: ResultItem[] = sources
      .filter((s) => (s.title + " " + s.publisher + " " + s.sourceType).toLowerCase().includes(q))
      .slice(0, 4)
      .map((s) => ({
        id: s.id,
        category: "Sources",
        title: s.title,
        subtitle: `${s.publisher} · ${s.sourceType.replaceAll("-", " ")}`,
        badge: s.classification,
        href: `/source/${s.id}`,
      }));

    return [...matchedPeople, ...matchedEvents, ...matchedQuotes, ...matchedPlaces, ...matchedSources].slice(0, 12);
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
