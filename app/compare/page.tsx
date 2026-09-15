import { ArrowLeftRight } from "lucide-react";
import { TimelineComparison } from "@/components/rewind/TimelineComparison";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { getPeople, getAllEventsWithStatus, getSources } from "@/lib/rewind";

export const metadata = {
  title: "Compare Historical Chronologies | REWIND Evidence Atlas",
  description: "Cross-timeline intersection analysis and side-by-side chronological comparisons of historical figures.",
};

export default async function ComparePage() {
  const [people, eventsRes, sources] = await Promise.all([
    getPeople(),
    getAllEventsWithStatus(),
    getSources(),
  ]);

  const allEvents = eventsRes.data || [];
  const personA = people[0];
  let initialPersonB = people[1]?.slug;

  if (personA && allEvents.length > 0) {
    const coCounts = new Map<string, number>();
    for (const e of allEvents) {
      const participants = e.participants || [];
      const hasPersonA = participants.some(
        (p) => p.personId === personA.id || p.personId === personA.slug || p.slug === personA.slug
      );
      if (hasPersonA) {
        for (const p of participants) {
          const pId = p.personId;
          const pSlug = p.slug;
          if (
            (pId && pId !== personA.id && pId !== personA.slug) ||
            (pSlug && pSlug !== personA.slug && pSlug !== personA.id)
          ) {
            const key = pSlug || pId;
            coCounts.set(key, (coCounts.get(key) || 0) + 1);
          }
        }
      }
    }
    if (coCounts.size > 0) {
      const sortedCoAttendees = Array.from(coCounts.entries()).sort((a, b) => b[1] - a[1]);
      const topTarget = sortedCoAttendees[0][0];
      const matched = people.find((p) => p.slug === topTarget || p.id === topTarget);
      if (matched) {
        initialPersonB = matched.slug;
      }
    }
  }

  return (
    <div className="page-shell compare-page">
      <header className="page-hero">
        <span className="eyebrow">
          <ArrowLeftRight size={14} /> CROSS-TIMELINE INTERSECTION MATRIX
        </span>
        <h1>Compare Chronologies</h1>
        <p>
          Investigate where world leaders, diplomats, and historical figures crossed paths in time and space.
        </p>
      </header>

      {eventsRes.error && allEvents.length === 0 ? (
        <div
          className="zero-state error-state"
          role="alert"
          style={{
            padding: "4rem 2rem",
            textAlign: "center",
            border: "1px dashed var(--line, #e2e8f0)",
            borderRadius: "8px",
            margin: "2rem auto",
            maxWidth: "600px",
          }}
        >
          <h2>Comparison data temporarily unavailable</h2>
          <p style={{ color: "var(--muted, #64748b)", marginTop: "0.5rem" }}>
            We are unable to load the comparison data right now. Please try again later.
          </p>
        </div>
      ) : (
        <ErrorBoundary sectionName="Timeline Comparison">
          <TimelineComparison
            initialPersonA={personA?.slug}
            initialPersonB={initialPersonB}
            people={people}
            events={allEvents}
            sources={sources}
          />
        </ErrorBoundary>
      )}
    </div>
  );
}
