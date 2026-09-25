import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTopicBySlug, getEventsByTopic } from "@/lib/rewind/topics";
import { TopicTimeline } from "@/components/rewind/TopicTimeline";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const topic = await getTopicBySlug(slug);
  if (!topic) return {};

  return {
    title: `${topic.name} Timeline — REWIND Evidence Atlas`,
    description: topic.summary || `Chronological non-person timeline for ${topic.name}.`,
  };
}

export default async function TopicDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const topic = await getTopicBySlug(slug);
  if (!topic) notFound();

  const records = await getEventsByTopic(topic.slug);

  return (
    <div className="page-shell">
      <TopicTimeline topic={topic} records={records} />
    </div>
  );
}
