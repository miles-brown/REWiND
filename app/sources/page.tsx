import { getEvents, getSources } from "@/lib/rewind";
import { SourcesCatalog } from "@/components/rewind/SourcesCatalog";

export const metadata = {
  title: "Archival Sources Register — REWIND Evidence Atlas",
  description:
    "Primary and secondary documentary sources supporting the REWiND Evidence Atlas timeline.",
};

export default async function SourcesPage() {
  const [sources, eventsResult] = await Promise.all([
    getSources(),
    getEvents({ limit: 100 }),
  ]);

  return <SourcesCatalog sources={sources} events={eventsResult.data} />;
}
