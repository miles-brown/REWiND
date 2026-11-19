import type { Metadata } from "next";
import { EventExplorer } from "@/components/rewind/EventExplorer";
import { getAtlasStatistics, getAllEventsWithStatus, type AtlasStatistics } from "@/lib/rewind";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Events — REWIND Evidence Atlas",
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
        personCount: 0,
        placeCount: 0,
        sourceCount: 0,
        yearsCovered: 0,
      } satisfies AtlasStatistics;
    }),
    getAllEventsWithStatus(),
  ]);

  if (eventsResult.error) {
    console.error("Events register load error:", eventsResult.error);
  }

  return (
    <div className="page-shell">
      <header className="page-hero">
        <span className="eyebrow">CHRONOLOGY</span>
        <h1>Events</h1>
        <p>
          Search {stats.eventCount} dated records. {stats.verifiedCount} meet the verified primary evidence threshold.
        </p>
      </header>
      {eventsResult.error ? (
        <div
          className="error-state my-8 mx-auto max-w-xl rounded-xl border border-dashed border-red-500/30 bg-red-950/20 p-12 text-center"
          role="alert"
        >
          <h2 className="text-lg font-bold text-slate-100">Events register temporarily unavailable</h2>
          <p className="mt-2 text-sm text-slate-300">
            We are unable to load the events register right now. Please try again later.
          </p>
        </div>
      ) : (
        <EventExplorer initialEvents={eventsResult.data} />
      )}
    </div>
  );
}
