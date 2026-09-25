import { ArrowLeftRight } from "lucide-react";
import { TimelineComparison } from "@/components/rewind/TimelineComparison";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import {
  getPeopleWithStatus,
  getAllEventsWithStatus,
  getSources,
  findTopCoAttendee,
} from "@/lib/rewind";

export const metadata = {
  title: "Compare Historical Chronologies | REWIND Evidence Atlas",
  description: "Cross-timeline intersection analysis and side-by-side chronological comparisons of historical figures.",
};

export default async function ComparePage() {
  const [peopleRes, eventsRes, sources] = await Promise.all([
    getPeopleWithStatus(),
    getAllEventsWithStatus(),
    getSources(),
  ]);

  const people = peopleRes.data || [];
  const allEvents = eventsRes.data || [];
  const personA = people[0];
  const initialPersonB = findTopCoAttendee(personA, people, allEvents);

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

      {(eventsRes.error || peopleRes.error) && (allEvents.length === 0 || people.length === 0) ? (
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
