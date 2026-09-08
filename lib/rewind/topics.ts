import { getRelationalStore } from "@/lib/db/client";
import { eventBySlug, type EventRecord } from "@/data/rewind";

export interface TopicRecord {
  id: string;
  slug: string;
  name: string;
  category: "geopolitics" | "conflict" | "economy" | "diplomacy" | "technology" | "investigation";
  summary: string | null;
  startedDate: string | null;
  endedDate: string | null;
}

export async function getTopics(): Promise<TopicRecord[]> {
  const store = getRelationalStore();
  return store.topics.map((t) => ({
    id: t.id,
    slug: t.slug,
    name: t.name,
    category: t.category as TopicRecord["category"],
    summary: t.summary,
    startedDate: t.startedDate,
    endedDate: t.endedDate,
  })).sort((a, b) => a.name.localeCompare(b.name));
}

export async function getTopicBySlug(slug: string): Promise<TopicRecord | null> {
  const store = getRelationalStore();
  const t = store.topics.find((x) => x.slug === slug || x.id === slug);
  if (!t) return null;
  return {
    id: t.id,
    slug: t.slug,
    name: t.name,
    category: t.category as TopicRecord["category"],
    summary: t.summary,
    startedDate: t.startedDate,
    endedDate: t.endedDate,
  };
}

export async function getEventsByTopic(topicSlugOrId: string): Promise<EventRecord[]> {
  const store = getRelationalStore();
  const topic = store.topics.find((t) => t.slug === topicSlugOrId || t.id === topicSlugOrId);
  if (!topic) return [];

  const mappings = store.eventTopics.filter((et) => et.topicId === topic.id);
  const eventIds = new Set(mappings.map((m) => m.eventId));

  const matchingEvents: EventRecord[] = [];
  for (const e of store.events) {
    if (eventIds.has(e.id)) {
      const fullEvt = eventBySlug(e.slug);
      if (fullEvt) matchingEvents.push(fullEvt);
    }
  }

  return matchingEvents.sort((a, b) => (a.startDate || "").localeCompare(b.startDate || ""));
}
