import type { Metadata } from "next";
import { EventExplorer } from "@/components/rewind/EventExplorer";
import { getAtlasStatistics, getAllEventsWithStatus } from "@/lib/rewind";

export const metadata: Metadata = {
  title: "Documented Events — REWIND Evidence Atlas",
  description: "Chronological registry of documented historical appearances, bilateral summits, and official actions.",
};

export default async function EventsPage() {
  const [stats, eventsResult] = await Promise.all([
    getAtlasStatistics().catch((err) => {
      console.warn("Atlas statistics unavailable:", err);
      return {
        eventCount: 0,
        verifiedCount: 0,
        provisionalCount: 0,
        disputedCount: 0,
        peopleCount: 0,
        placesCount: 0,
        sourcesCount: 0,
      };
    }),
    getAllEventsWithStatus(),
  ]);

  if (eventsResult.error) {
    console.error("Events register load error:", eventsResult.error);
  }

  return (
    <div className="page-shell">
      <header className="page-hero">
        <span className="eyebrow">EVIDENCE REGISTER</span>
        <h1>Documented events</h1>
        <p>
          Search {stats.eventCount} dated records. {stats.verifiedCount} currently meet the verified threshold;
          the rest remain visibly provisional.
        </p>
      </header>
      {eventsResult.error ? (
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
          <h2>Events register temporarily unavailable</h2>
          <p style={{ color: "var(--muted, #64748b)", marginTop: "0.5rem" }}>
            We are unable to load the events register right now. Please try again later.
          </p>
        </div>
      ) : (
        <EventExplorer initialEvents={eventsResult.data} />
      )}
    </div>
  );
}
