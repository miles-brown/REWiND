import { getAllEvents, getSourcesWithStatus, getSourceEventCounts } from "@/lib/rewind";
import { SourcesCatalog } from "@/components/rewind/SourcesCatalog";

export const metadata = {
  title: "Archival Sources Register — REWIND Evidence Atlas",
  description:
    "Primary and secondary documentary sources supporting the REWiND Evidence Atlas timeline.",
};

export default async function SourcesPage() {
  const [sourcesResult, events, sourceEventCounts] = await Promise.all([
    getSourcesWithStatus(),
    getAllEvents(),
    getSourceEventCounts(),
  ]);

  return (
    <SourcesCatalog
      sources={sourcesResult.data}
      events={events}
      sourceEventCounts={sourceEventCounts}
      loaderError={sourcesResult.error}
    />
  );
}
