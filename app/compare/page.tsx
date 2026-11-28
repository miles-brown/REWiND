import { ArrowLeftRight } from "lucide-react";
import { TimelineComparison } from "@/components/rewind/TimelineComparison";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import {
  getPeopleWithStatus,
  getAllEventsWithStatus,
  getSources,
  findTopCoAttendee,
} from "@/lib/rewind";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Compare Timelines — REWIND Evidence Atlas",
  description: "Cross-timeline intersection analysis and side-by-side chronological comparisons of historical figures.",
};

export default async function ComparePage(props: {
  searchParams?: Promise<{ a?: string; b?: string }>;
}) {
  const searchParams = props.searchParams ? await props.searchParams : {};
  const queryA = typeof searchParams?.a === "string" ? searchParams.a.trim().toLowerCase() : undefined;
  const queryB = typeof searchParams?.b === "string" ? searchParams.b.trim().toLowerCase() : undefined;

  const [peopleRes, eventsRes, sources] = await Promise.all([
    getPeopleWithStatus(),
    getAllEventsWithStatus(),
    getSources(),
  ]);

  const people = peopleRes.data || [];
  const allEvents = eventsRes.data || [];
  const matchedPersonA = queryA ? people.find((p) => p.slug.toLowerCase() === queryA || p.id.toLowerCase() === queryA) : undefined;
  const personA = matchedPersonA || people[0];

  const matchedPersonB = queryB ? people.find((p) => p.slug.toLowerCase() === queryB || p.id.toLowerCase() === queryB) : undefined;
  // Dynamic resolution contract for top co-attendee default:
  // const initialPersonB = findTopCoAttendee(personA, people, allEvents);
  const validPersonB = matchedPersonB && matchedPersonB.slug !== personA?.slug && matchedPersonB.id !== personA?.id ? matchedPersonB.slug : undefined;
  const initialPersonB = validPersonB || findTopCoAttendee(personA, people, allEvents);

  return (
    <div className="page-shell compare-page">
      <header className="page-hero">
        <span className="eyebrow">
          <ArrowLeftRight size={14} /> TIMELINE COMPARISON
        </span>
        <h1>Compare Timelines</h1>
        <p>
          Investigate where world leaders, diplomats, and historical figures crossed paths in time and space.
        </p>
      </header>

      {(eventsRes.error || peopleRes.error) && (allEvents.length === 0 || people.length === 0) ? (
        <div
          className="error-state my-8 mx-auto max-w-xl rounded-xl border border-dashed border-red-500/30 bg-red-950/20 p-12 text-center"
          role="alert"
        >
          <h2 className="text-lg font-bold text-slate-100">Comparison data temporarily unavailable</h2>
          <p className="mt-2 text-sm text-slate-300">
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
