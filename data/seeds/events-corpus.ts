/**
 * REWIND EVIDENCE ATLAS — CANONICAL SEED REGISTER: HISTORICAL EVENTS CORPUS
 *
 * Forensically documented primary historical events with exact coordinates,
 * gazetteer-resolved venues, multi-person co-attendance rosters, transit metadata,
 * and primary archival source citations.
 */

import type { EventRecord } from "@/lib/rewind/types";
import { foundationalAndSummitsEvents } from "./events-foundational-and-summits";
import { presidentialActionsEvents } from "./events-presidential-actions";
import { legalAndIntelligenceEvents } from "./events-legal-and-intelligence";
import { techMediaCultureEvents } from "./events-tech-media-culture";
import { travelCorridorsEvents } from "./events-travel-corridors";

export {
  foundationalAndSummitsEvents,
  presidentialActionsEvents,
  legalAndIntelligenceEvents,
  techMediaCultureEvents,
  travelCorridorsEvents,
};

export const allHistoricalEvents: EventRecord[] = [
  ...foundationalAndSummitsEvents,
  ...presidentialActionsEvents,
  ...legalAndIntelligenceEvents,
  ...techMediaCultureEvents,
  ...travelCorridorsEvents,
];

// Ensure unique deduplicated events by ID
export const eventsCorpus: EventRecord[] = Array.from(
  new Map(allHistoricalEvents.map((evt) => [evt.id, evt])).values()
);
