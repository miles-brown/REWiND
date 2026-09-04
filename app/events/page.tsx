import type { Metadata } from "next";
import { EventExplorer } from "@/components/rewind/EventExplorer";
import { getAtlasStatistics, getEvents } from "@/lib/rewind";

export const metadata: Metadata = {
  title: "Documented Events — REWIND Evidence Atlas",
  description: "Chronological registry of documented historical appearances, bilateral summits, and official actions.",
};

export default async function EventsPage() {
  const [stats, eventsResult] = await Promise.all([
    getAtlasStatistics(),
    getEvents({ limit: 100 }),
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
      <EventExplorer initialEvents={eventsResult.data} />
    </div>
  );
}
