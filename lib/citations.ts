import type { EventRecord, SourceRecord as Source } from "@/lib/rewind";

export type CitationSubject = EventRecord | Source;

function isEvent(item: CitationSubject): item is EventRecord {
  return "eventName" in item;
}

function parseDateParts(rawDate?: string | null): {
  year: string;
  month?: string;
  monthShort?: string;
  monthLong?: string;
  day?: string;
  dayNum?: number;
  formattedDate: string;
  dateParts: number[];
} {
  if (!rawDate || typeof rawDate !== "string") {
    return { year: "2024", formattedDate: "2024", dateParts: [2024] };
  }
  const match = rawDate.match(/^(\d{4})(?:-(\d{2})(?:-(\d{2}))?)?/);
  if (!match) {
    return { year: "2024", formattedDate: "2024", dateParts: [2024] };
  }
  const year = match[1];
  const monthStr = match[2];
  const dayStr = match[3];

  const dateParts: number[] = [parseInt(year, 10)];
  let monthShort: string | undefined;
  let monthLong: string | undefined;
  let dayNum: number | undefined;

  if (monthStr) {
    const mInt = parseInt(monthStr, 10);
    if (mInt >= 1 && mInt <= 12) {
      dateParts.push(mInt);
      const d = new Date(Date.UTC(parseInt(year, 10), mInt - 1, 1));
      monthShort = d.toLocaleString("en-US", { month: "short", timeZone: "UTC" });
      monthLong = d.toLocaleString("en-US", { month: "long", timeZone: "UTC" });
    }
  }

  if (dayStr && monthStr) {
    const dInt = parseInt(dayStr, 10);
    if (dInt >= 1 && dInt <= 31) {
      dateParts.push(dInt);
      dayNum = dInt;
    }
  }

  let formattedDate = year;
  if (monthLong && dayNum) {
    formattedDate = `${monthLong} ${dayNum}, ${year}`;
  } else if (monthLong) {
    formattedDate = `${monthLong} ${year}`;
  }

  return {
    year,
    month: monthStr,
    monthShort,
    monthLong,
    day: dayStr,
    dayNum,
    formattedDate,
    dateParts,
  };
}

export function formatBibTeX(item: CitationSubject, source?: Source): string {
  const isEvt = isEvent(item);
  const event = isEvt ? item : undefined;
  const src = !isEvt ? item : source;

  const rawDate = isEvt ? item.startDate : item.publicationDate;
  const { year, monthShort } = parseDateParts(rawDate);
  const id = item.id;
  const cleanId = id.replace(/[^a-zA-Z0-9]/g, "_");
  const publisher = src?.publisher || src?.author || "REWIND Evidence Atlas";
  const title = isEvt ? item.eventName : item.title;
  const url = src?.url || (event ? `https://rewind.evidence.atlas/event/${event.slug}` : "https://rewind.evidence.atlas");

  const monthLine = monthShort ? `\n  month = {${monthShort}},` : "";

  return `@misc{rewind_${cleanId},
  title = {${title}},
  author = {{${publisher}}},
  year = {${year}},${monthLine}
  howpublished = {\\url{${url}}},
  note = {Archived in REWIND Evidence Atlas; accessed ${new Date().toISOString().slice(0, 10)}}
}`;
}

export function formatAPA(item: CitationSubject, source?: Source): string {
  const isEvt = isEvent(item);
  const event = isEvt ? item : undefined;
  const src = !isEvt ? item : source;

  const rawDate = isEvt ? item.startDate : item.publicationDate;
  const { year, monthLong, dayNum } = parseDateParts(rawDate);
  const dateLabel = monthLong && dayNum ? `${year}, ${monthLong} ${dayNum}` : monthLong ? `${year}, ${monthLong}` : `${year}`;
  const title = isEvt ? item.eventName : item.title;
  const url = src?.url || (event ? `https://rewind.evidence.atlas/event/${event.slug}` : "https://rewind.evidence.atlas");

  if (isEvt) {
    const publisher = src?.publisher || "REWIND Evidence Atlas";
    return `${publisher}. (${dateLabel}). ${title} [Evidence record]. REWIND Evidence Atlas. ${url}`;
  } else {
    const authorOrPub = item.publisher || item.author || "REWIND Archival Registry";
    return `${authorOrPub}. (${dateLabel}). ${title} [Archival source]. REWIND Evidence Atlas. ${url}`;
  }
}

export function formatChicago(item: CitationSubject, source?: Source): string {
  const isEvt = isEvent(item);
  const event = isEvt ? item : undefined;
  const src = !isEvt ? item : source;

  const rawDate = isEvt ? item.startDate : item.publicationDate;
  const { formattedDate } = parseDateParts(rawDate);
  const title = isEvt ? item.eventName : item.title;
  const url = src?.url || (event ? `https://rewind.evidence.atlas/event/${event.slug}` : "https://rewind.evidence.atlas");
  const today = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  if (isEvt) {
    const publisher = src?.publisher || "REWIND Evidence Atlas";
    return `"${title}," ${publisher}, documented ${formattedDate}, accessed ${today}, ${url}.`;
  } else {
    const publisher = item.publisher || item.author || "REWIND Archival Registry";
    return `"${title}," ${publisher}, published ${formattedDate}, accessed ${today}, ${url}.`;
  }
}

export function formatRIS(item: CitationSubject, source?: Source): string {
  const isEvt = isEvent(item);
  const event = isEvt ? item : undefined;
  const src = !isEvt ? item : source;

  const rawDate = isEvt ? item.startDate : item.publicationDate;
  const { year, month = "01", day = "01" } = parseDateParts(rawDate);
  const publisher = src?.publisher || (isEvt ? "REWIND Evidence Atlas" : item.author || "REWIND Evidence Atlas");
  const title = isEvt ? item.eventName : item.title;
  const url = src?.url || (event ? `https://rewind.evidence.atlas/event/${event.slug}` : "https://rewind.evidence.atlas");

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

  const rawDate = isEvt ? item.startDate : item.publicationDate;
  const { dateParts } = parseDateParts(rawDate);
  const publisher = src?.publisher || (isEvt ? "REWIND Evidence Atlas" : item.author || "REWIND Evidence Atlas");
  const title = isEvt ? item.eventName : item.title;
  const url = src?.url || (event ? `https://rewind.evidence.atlas/event/${event.slug}` : "https://rewind.evidence.atlas");
  const id = item.id;

  return JSON.stringify(
    {
      id: `rewind_${id}`,
      type: "webpage",
      title,
      author: [{ literal: publisher }],
      issued: {
        "date-parts": [dateParts],
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
  const exportTimestamp = new Date().toISOString();
  return JSON.stringify(
    {
      ...event,
      atlasMetadata: {
        generator: "REWIND Evidence Atlas v1.0",
        exportedAt: exportTimestamp,
      },
      _source: source || null,
      _exportedAt: exportTimestamp,
    },
    null,
    2
  );
}
