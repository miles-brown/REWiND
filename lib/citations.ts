import type { EventRecord, SourceRecord as Source } from "@/lib/rewind";

export type CitationSubject = EventRecord | Source;

function isEvent(item: CitationSubject): item is EventRecord {
  return "eventName" in item;
}

export function formatBibTeX(item: CitationSubject, source?: Source): string {
  const isEvt = isEvent(item);
  const event = isEvt ? item : undefined;
  const src = !isEvt ? item : source;

  const dateStr = (isEvt ? item.startDate : item.publicationDate) || "2024-01-01";
  const year = dateStr.slice(0, 4);
  const id = isEvt ? item.id : item.id;
  const cleanId = id.replace(/[^a-zA-Z0-9]/g, "_");
  const publisher = src?.publisher || src?.author || "REWIND Evidence Atlas";
  const title = isEvt ? item.eventName : item.title;
  const url = src?.url || (event ? `https://rewind.evidence.atlas/event/${event.slug}` : "https://rewind.evidence.atlas");

  return `@misc{rewind_${cleanId},
  title = {${title}},
  author = {{${publisher}}},
  year = {${year}},
  month = {${new Date(dateStr.slice(0, 10) + "T12:00:00").toLocaleString("en-US", { month: "short" })}},
  howpublished = {\\url{${url}}},
  note = {Archived in REWIND Evidence Atlas; accessed ${new Date().toISOString().slice(0, 10)}}
}`;
}

export function formatAPA(item: CitationSubject, source?: Source): string {
  const isEvt = isEvent(item);
  const event = isEvt ? item : undefined;
  const src = !isEvt ? item : source;

  const dateStr = (isEvt ? item.startDate : item.publicationDate) || "2024-01-01";
  const dateObj = new Date(dateStr.slice(0, 10) + "T12:00:00");
  const year = dateObj.getFullYear();
  const formattedDate = dateObj.toLocaleDateString("en-US", { month: "long", day: "numeric" });
  const publisher = src?.publisher || "REWIND Evidence Atlas";
  const title = isEvt ? item.eventName : item.title;
  const url = src?.url || (event ? `https://rewind.evidence.atlas/event/${event.slug}` : "https://rewind.evidence.atlas");

  return `${publisher}. (${year}, ${formattedDate}). ${title} [Evidence record]. REWIND Evidence Atlas. ${url}`;
}

export function formatChicago(item: CitationSubject, source?: Source): string {
  const isEvt = isEvent(item);
  const event = isEvt ? item : undefined;
  const src = !isEvt ? item : source;

  const dateStr = (isEvt ? item.startDate : item.publicationDate) || "2024-01-01";
  const dateObj = new Date(dateStr.slice(0, 10) + "T12:00:00");
  const formattedDate = dateObj.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  const publisher = src?.publisher || "REWIND Evidence Atlas";
  const title = isEvt ? item.eventName : item.title;
  const url = src?.url || (event ? `https://rewind.evidence.atlas/event/${event.slug}` : "https://rewind.evidence.atlas");

  return `"${title}," ${publisher}, documented ${formattedDate}, accessed ${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}, ${url}.`;
}

export function formatRIS(item: CitationSubject, source?: Source): string {
  const isEvt = isEvent(item);
  const event = isEvt ? item : undefined;
  const src = !isEvt ? item : source;

  const dateStr = (isEvt ? item.startDate : item.publicationDate) || "2024-01-01";
  const year = dateStr.slice(0, 4);
  const publisher = src?.publisher || "REWIND Evidence Atlas";
  const title = isEvt ? item.eventName : item.title;
  const url = src?.url || (event ? `https://rewind.evidence.atlas/event/${event.slug}` : "https://rewind.evidence.atlas");
  const parts = dateStr.slice(0, 10).split("-");
  const month = parts[1] || "01";
  const day = parts[2] || "01";

  return `TY  - ELEC
TI  - ${title}
AU  - ${publisher}
PY  - ${year}
DA  - ${year}/${month}/${day}
PB  - REWIND Evidence Atlas
UR  - ${url}
N1  - Archived in REWIND Evidence Atlas; accessed ${new Date().toISOString().slice(0, 10)}
ER  -`;
}

export function formatCSLJSON(item: CitationSubject, source?: Source): string {
  const isEvt = isEvent(item);
  const event = isEvt ? item : undefined;
  const src = !isEvt ? item : source;

  const dateStr = (isEvt ? item.startDate : item.publicationDate) || "2024-01-01";
  const parts = dateStr.slice(0, 10).split("-").map((p) => parseInt(p, 10));
  const publisher = src?.publisher || "REWIND Evidence Atlas";
  const title = isEvt ? item.eventName : item.title;
  const url = src?.url || (event ? `https://rewind.evidence.atlas/event/${event.slug}` : "https://rewind.evidence.atlas");
  const id = isEvt ? item.id : item.id;

  return JSON.stringify(
    {
      id: `rewind_${id}`,
      type: "webpage",
      title,
      author: [{ literal: publisher }],
      issued: {
        "date-parts": [parts],
      },
      URL: url,
      publisher: "REWIND Evidence Atlas",
      note: isEvt
        ? `Archived forensic event in REWIND Evidence Atlas; verified confidence: ${event?.verificationStatus || "provisional"}`
        : "Archived primary source in REWIND Evidence Atlas",
    },
    null,
    2
  );
}

export function formatJSON(event: EventRecord, source?: Source): string {
  return JSON.stringify(
    {
      ...event,
      atlasMetadata: {
        generator: "REWIND Evidence Atlas v1.0",
        exportedAt: new Date().toISOString(),
      },
      _source: source || null,
      _exportedAt: new Date().toISOString(),
    },
    null,
    2
  );
}
