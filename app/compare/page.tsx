import { ArrowLeftRight } from "lucide-react";
import { TimelineComparison } from "@/components/rewind/TimelineComparison";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { getPeople, getAllEventsWithStatus, getSources } from "@/lib/rewind";

import type { EventRecord, PersonRecord } from "@/lib/rewind";

export const metadata = {
  title: "Compare Historical Chronologies | REWIND Evidence Atlas",
  description: "Cross-timeline intersection analysis and side-by-side chronological comparisons of historical figures.",
};

/**
 * Checks whether a participant's attendance record qualifies as verified physical presence.
 * Filters out remote/virtual attendance, written statements, proxy attendance, and disputed presence.
 */
function isPhysicalConfirmedParticipant(p: { attendanceMode?: string; presenceConfidence?: string }): boolean {
  const isPhysical = !p.attendanceMode || p.attendanceMode === "physical";
  const isNotDisputed = !p.presenceConfidence || p.presenceConfidence !== "disputed";
  return isPhysical && isNotDisputed;
}

/**
 * Discovers the top physical, undisputed co-attendee for a primary figure across verified historical events.
 *
 * Edge cases handled:
 * - Empty events or empty people list: returns fallback (next person or undefined)
 * - Self-pairs: strictly excludes Person A by id and slug from being selected as Person B
 * - Disputed or remote presences: filtered out so only physical confirmed meetings count toward co-attendance
 * - Zero co-attendees: gracefully falls back to the next distinct person in the register (or undefined)
 */
function findTopCoAttendee(
  personA: PersonRecord | undefined,
  people: PersonRecord[],
  events: EventRecord[]
): string | undefined {
  if (!personA || events.length === 0) {
    return people.length > 1 ? people.find((p) => p.slug !== personA?.slug && p.id !== personA?.id)?.slug : undefined;
  }

  const coCounts = new Map<string, number>();

  for (const e of events) {
    const participants = (e.participants || []).filter(isPhysicalConfirmedParticipant);
    const hasPersonA = participants.some(
      (p) => p.personId === personA.id || p.personId === personA.slug || p.slug === personA.slug
    );

    if (hasPersonA) {
      for (const p of participants) {
        const pId = p.personId;
        const pSlug = p.slug;
        const isSelf =
          pId === personA.id ||
          pId === personA.slug ||
          pSlug === personA.slug ||
          pSlug === personA.id;

        if (!isSelf && (pSlug || pId)) {
          const key = pSlug || pId;
          coCounts.set(key, (coCounts.get(key) || 0) + 1);
        }
      }
    }
  }

  if (coCounts.size > 0) {
    const sortedCoAttendees = Array.from(coCounts.entries()).sort((a, b) => b[1] - a[1]);
    for (const [candidateKey] of sortedCoAttendees) {
      const matched = people.find(
        (p) =>
          (p.slug === candidateKey || p.id === candidateKey) &&
          p.slug !== personA.slug &&
          p.id !== personA.id
      );
      if (matched) {
        return matched.slug;
      }
    }
  }

  // Graceful fallback: return the next distinct person in the register if no co-attendees exist
  return people.find((p) => p.slug !== personA.slug && p.id !== personA.id)?.slug;
}

export default async function ComparePage() {
  const [people, eventsRes, sources] = await Promise.all([
    getPeople(),
    getAllEventsWithStatus(),
    getSources(),
  ]);

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
