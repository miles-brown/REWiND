import { getRelationalStore } from "@/lib/db/client";
import { getEventsByIds } from "./events";
import type { EventRecord } from "./types";

export interface TopicRecord {
  id: string;
  slug: string;
  name: string;
  category: "geopolitics" | "conflict" | "economy" | "diplomacy" | "technology" | "investigation";
  summary: string | null;
  startedDate: string | null;
  endedDate: string | null;
}

const VALID_TOPIC_CATEGORIES: Set<TopicRecord["category"]> = new Set([
  "geopolitics",
  "conflict",
  "economy",
  "diplomacy",
  "technology",
  "investigation",
]);

export function parseTopicCategory(cat: string | null | undefined): TopicRecord["category"] {
  if (cat && VALID_TOPIC_CATEGORIES.has(cat as TopicRecord["category"])) {
    return cat as TopicRecord["category"];
  }
  return "geopolitics";
}

export async function getTopics(): Promise<TopicRecord[]> {
  const store = getRelationalStore();
  return store.topics.map((t) => ({
    id: t.id,
    slug: t.slug,
    name: t.name,
    category: parseTopicCategory(t.category),
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
    category: parseTopicCategory(t.category),
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
  const eventIds = Array.from(new Set(mappings.map((m) => m.eventId)));

  const matchingEvents = await getEventsByIds(eventIds);
  return matchingEvents.sort((a, b) => (a.startDate || "").localeCompare(b.startDate || ""));
}
