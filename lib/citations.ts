import type { EventRecord, SourceRecord as Source } from "@/lib/rewind";
import { parseIsoDate, isStandardIsoDate } from "@/lib/rewind/dates";

export function formatBibTeX(event: EventRecord, source?: Source): string {
  const cleanId = event.id.replace(/[^a-zA-Z0-9]/g, "_");
  const publisher = source?.publisher || "REWIND Evidence Atlas";
  const title = event.eventName;
  const url = source?.url || `https://rewind.evidence.atlas/event/${event.slug}`;

  const prec = (event.datePrecision || "").toLowerCase();
  const dateStr = (event.startDate || "").trim();
  const isYearOnly = prec === "year" || /^\d{4}$/.test(dateStr);

  let year = dateStr.slice(0, 4);
  let monthField = "";

  if (isStandardIsoDate(dateStr)) {
    const d = parseIsoDate(dateStr);
    if (d) {
      year = String(d.getFullYear());
      if (!isYearOnly) {
        const monthShort = d.toLocaleString("en-US", { month: "short" });
        monthField = `\n  month = {${monthShort}},`;
      }
    }
  } else {
    const match = dateStr.match(/\b(19\d\d|20\d\d)\b/);
    if (match) {
      year = match[1];
    } else if (dateStr) {
      year = dateStr;
    }
  }

  return `@misc{rewind_${cleanId},
  title = {${title}},
  author = {{${publisher}}},
  year = {${year}},${monthField}
  howpublished = {\\url{${url}}},
  note = {Archived in REWIND Evidence Atlas; accessed ${new Date().toISOString().slice(0, 10)}}
}`;
}

export function formatAPA(event: EventRecord, source?: Source): string {
  const publisher = source?.publisher || "REWIND Evidence Atlas";
  const url = source?.url || `https://rewind.evidence.atlas/event/${event.slug}`;
  const prec = (event.datePrecision || "").toLowerCase();
  const dateStr = (event.startDate || "").trim();

  if (!isStandardIsoDate(dateStr)) {
    return `${publisher}. (${dateStr || "n.d."}). ${event.eventName} [Evidence record]. REWIND Evidence Atlas. ${url}`;
  }

  const d = parseIsoDate(dateStr);
  if (!d) {
    return `${publisher}. (${dateStr || "n.d."}). ${event.eventName} [Evidence record]. REWIND Evidence Atlas. ${url}`;
  }

  const year = d.getFullYear();
  if (prec === "year" || /^\d{4}$/.test(dateStr)) {
    return `${publisher}. (${year}). ${event.eventName} [Evidence record]. REWIND Evidence Atlas. ${url}`;
  }

  if (prec === "month" || /^\d{4}-\d{2}$/.test(dateStr)) {
    const monthLong = d.toLocaleDateString("en-US", { month: "long" });
    return `${publisher}. (${year}, ${monthLong}). ${event.eventName} [Evidence record]. REWIND Evidence Atlas. ${url}`;
  }

  const formattedDate = d.toLocaleDateString("en-US", { month: "long", day: "numeric" });
  return `${publisher}. (${year}, ${formattedDate}). ${event.eventName} [Evidence record]. REWIND Evidence Atlas. ${url}`;
}

export function formatChicago(event: EventRecord, source?: Source): string {
  const publisher = source?.publisher || "REWIND Evidence Atlas";
  const url = source?.url || `https://rewind.evidence.atlas/event/${event.slug}`;
  const accessDate = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  const prec = (event.datePrecision || "").toLowerCase();
  const dateStr = (event.startDate || "").trim();

  if (!isStandardIsoDate(dateStr)) {
    return `"${event.eventName}," ${publisher}, documented ${dateStr || "undated"}, accessed ${accessDate}, ${url}.`;
  }

  const d = parseIsoDate(dateStr);
  if (!d) {
    return `"${event.eventName}," ${publisher}, documented ${dateStr || "undated"}, accessed ${accessDate}, ${url}.`;
  }

  let formattedDate: string;
  if (prec === "year" || /^\d{4}$/.test(dateStr)) {
    formattedDate = String(d.getFullYear());
  } else if (prec === "month" || /^\d{4}-\d{2}$/.test(dateStr)) {
    formattedDate = d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  } else {
    formattedDate = d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  }

  return `"${event.eventName}," ${publisher}, documented ${formattedDate}, accessed ${accessDate}, ${url}.`;
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
