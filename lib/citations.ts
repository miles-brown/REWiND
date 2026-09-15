import type { EventRecord, SourceRecord as Source } from "@/lib/rewind";

export function formatBibTeX(event: EventRecord, source?: Source): string {
  const year = event.startDate.slice(0, 4);
  const cleanId = event.id.replace(/[^a-zA-Z0-9]/g, "_");
  const publisher = source?.publisher || "REWIND Evidence Atlas";
  const title = event.eventName;
  const url = source?.url || `https://rewind.evidence.atlas/event/${event.slug}`;

  return `@misc{rewind_${cleanId},
  title = {${title}},
  author = {{${publisher}}},
  year = {${year}},
  month = {${new Date(event.startDate + "T12:00:00").toLocaleString("en-US", { month: "short" })}},
  howpublished = {\\url{${url}}},
  note = {Archived in REWIND Evidence Atlas; accessed ${new Date().toISOString().slice(0, 10)}}
}`;
}

export function formatAPA(event: EventRecord, source?: Source): string {
  const dateObj = new Date(event.startDate + "T12:00:00");
  const year = dateObj.getFullYear();
  const formattedDate = dateObj.toLocaleDateString("en-US", { month: "long", day: "numeric" });
  const publisher = source?.publisher || "REWIND Evidence Atlas";
  const url = source?.url || `https://rewind.evidence.atlas/event/${event.slug}`;

  return `${publisher}. (${year}, ${formattedDate}). ${event.eventName} [Evidence record]. REWIND Evidence Atlas. ${url}`;
}

export function formatChicago(event: EventRecord, source?: Source): string {
  const dateObj = new Date(event.startDate + "T12:00:00");
  const formattedDate = dateObj.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  const publisher = source?.publisher || "REWIND Evidence Atlas";
  const url = source?.url || `https://rewind.evidence.atlas/event/${event.slug}`;

  return `"${event.eventName}," ${publisher}, documented ${formattedDate}, accessed ${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}, ${url}.`;
}

export function formatJSON(event: EventRecord, source?: Source): string {
  return JSON.stringify({
    ...event,
    attachedSource: source || null,
    atlasMetadata: {
      exportedAt: new Date().toISOString(),
      generator: "REWIND Evidence Atlas v1.0",
    }
  }, null, 2);
}
