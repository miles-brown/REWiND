import { getAllEventsWithStatus, getSourcesWithStatus, getSourceEventCountsWithStatus } from "@/lib/rewind";
import { SourcesCatalog } from "@/components/rewind/SourcesCatalog";
import type { EventRecord } from "@/lib/rewind";

export const metadata = {
  title: "Archival Sources Register — REWIND Evidence Atlas",
  description:
    "Primary and secondary documentary sources supporting the REWiND Evidence Atlas timeline.",
};

export default async function SourcesPage() {
  const [sourcesResult, countsResult] = await Promise.all([
    getSourcesWithStatus(),
    getSourceEventCountsWithStatus(),
  ]);

  let events: EventRecord[] = [];
  let eventsError: string | null = null;
  const hasCounts = Object.keys(countsResult.data).length > 0;

  // Only perform the full events retrieval if counts are empty (fallback mode)
  if (!hasCounts && !countsResult.error) {
    const eventsResult = await getAllEventsWithStatus();
    events = eventsResult.data;
    eventsError = eventsResult.error;
  }

  const eventMetricsError = countsResult.error || eventsError;

  return (
    <SourcesCatalog
      sources={sourcesResult.data}
      events={events}
      sourceEventCounts={countsResult.data}
      loaderError={sourcesResult.error}
      eventMetricsError={eventMetricsError}
    />
  );
}
