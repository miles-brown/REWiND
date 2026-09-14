import type { Metadata } from "next";
import { EventExplorer } from "@/components/rewind/EventExplorer";
import { getAtlasStatistics, getAllEventsWithStatus } from "@/lib/rewind";

export const metadata: Metadata = {
  title: "Documented Events — REWIND Evidence Atlas",
  description: "Chronological registry of documented historical appearances, bilateral summits, and official actions.",
};

/** Loads published events and renders the atlas event index. */
export default async function EventsPage() {
  const [stats, eventsResult] = await Promise.all([
    getAtlasStatistics(),
    getAllEventsWithStatus(),
  ]);

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
            {eventsResult.error}
          </p>
        </div>
      ) : (
        <EventExplorer initialEvents={eventsResult.data} />
      )}
    </div>
  );
}
