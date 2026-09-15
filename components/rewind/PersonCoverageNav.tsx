"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronDown, ChevronRight, Clock } from "lucide-react";
import type { EventRecord } from "@/data/rewind";

interface PeriodGroup {
  period: string; // e.g., "1990s"
  totalEvents: number;
  years: {
    year: string;
    count: number;
  }[];
}

export function PersonCoverageNav({
  slug,
  records,
}: {
  slug: string;
  records: EventRecord[];
}) {
  // Group records by decade periods, then by year
  const periods = useMemo<PeriodGroup[]>(() => {
    const yearCountMap = new Map<string, number>();
    records.forEach((r) => {
      const y = r.startDate.slice(0, 4);
      yearCountMap.set(y, (yearCountMap.get(y) || 0) + 1);
    });

    const periodMap = new Map<string, { year: string; count: number }[]>();
    const sortedYears = Array.from(yearCountMap.keys()).sort();

    sortedYears.forEach((year) => {
      const period = year.slice(0, 3) + "0s";
      const count = yearCountMap.get(year) || 0;
      const existing = periodMap.get(period) || [];
      existing.push({ year, count });
      periodMap.set(period, existing);
    });

    return Array.from(periodMap.entries()).map(([period, yearsList]) => ({
      period,
      totalEvents: yearsList.reduce((acc, curr) => acc + curr.count, 0),
      years: yearsList,
    }));
  }, [records]);

  // Track which periods are expanded (default to latest period open)
  const [expandedPeriods, setExpandedPeriods] = useState<Record<string, boolean>>(() => {
    if (!periods.length) return {};
    const lastPeriod = periods[periods.length - 1].period;
    return { [lastPeriod]: true };
  });

  const togglePeriod = (period: string) => {
    setExpandedPeriods((prev) => ({
      ...prev,
      [period]: !prev[period],
    }));
  };

  if (!periods.length) return null;

  return (
    <aside className="hero-coverage-nav" aria-label="Indexed Coverage Years by Period">
      <div className="coverage-nav-header">
        <div className="coverage-nav-title">
          <Clock size={14} className="coverage-icon" />
          <span>INDEXED COVERAGE</span>
        </div>
        <small className="coverage-count">{records.length} dated events</small>
      </div>

      <div className="coverage-nav-scroll-container">
        <div className="period-accordion-list">
          {periods.map(({ period, totalEvents, years }) => {
            const isExpanded = !!expandedPeriods[period];
            return (
              <div key={period} className={`period-accordion-item ${isExpanded ? "expanded" : ""}`}>
                <button
                  type="button"
                  className="period-trigger-btn"
                  onClick={() => togglePeriod(period)}
                  aria-expanded={isExpanded}
                  aria-controls={`period-content-${period}`}
                >
                  <span className="period-trigger-left">
                    {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    <b className="period-label">{period}</b>
                  </span>
                  <span className="period-event-pill">
                    {totalEvents} {totalEvents === 1 ? "event" : "events"}
                  </span>
                </button>

                {isExpanded && (
                  <div id={`period-content-${period}`} className="period-years-grid" role="region">
                    {years.map(({ year, count }) => (
                      <Link
                        key={year}
                        href={`/person/${slug}/${year}`}
                        className="year-nav-pill"
                        title={`View ${count} events from ${year}`}
                      >
                        <span className="year-num">{year}</span>
                        <span className="year-count">{count}</span>
                        <ArrowRight size={11} className="year-arrow" />
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
