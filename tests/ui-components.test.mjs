import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import test, { after } from "node:test";
import { fileURLToPath } from "node:url";

import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createServer } from "vite";

const root = fileURLToPath(new URL("..", import.meta.url));
const vite = await createServer({
  appType: "custom",
  configFile: false,
  root,
  resolve: { alias: { "@": root } },
  server: { middlewareMode: true },
});

after(async () => {
  await vite.close();
});

async function readCssTree(directory) {
  try {
    const entries = await readdir(directory, { withFileTypes: true });
    const contents = await Promise.all(
      entries.map(async (entry) => {
        const entryPath = path.join(directory, entry.name);
        if (entry.isDirectory()) {
          return readCssTree(entryPath);
        }
        return entry.name.endsWith(".css") ? readFile(entryPath, "utf8") : "";
      }),
    );
    return contents.join("\n");
  } catch {
    return "";
  }
}

test("emits the catalog's animation and scrolling utilities", async () => {
  const distCss = await readCssTree(path.join(root, "dist"));
  const globalsCss = await readFile(path.join(root, "app/globals.css"), "utf8");
  const css = distCss + "\n" + globalsCss;

  assert.match(css, /scrollbar-width:\s*thin/);
  assert.match(css, /scrollbar-width:\s*none/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
});

test("forwards progress semantics to the primitive", async () => {
  const { Progress } = await vite.ssrLoadModule("/components/ui/progress.tsx");
  const html = renderToStaticMarkup(React.createElement(Progress, { value: 37 }));

  assert.match(html, /aria-valuenow="37"/);
  assert.match(html, /aria-valuetext="37%"/);
  assert.match(html, /data-state="loading"/);
});

test("emits chart themes for the starter's media dark mode", async () => {
  const { ChartStyle } = await vite.ssrLoadModule("/components/ui/chart.tsx");
  const html = renderToStaticMarkup(
    React.createElement(ChartStyle, {
      id: "contract",
      config: {
        latency: { theme: { light: "#ffffff", dark: "#000000" } },
      },
    }),
  );

  assert.match(html, /\[data-chart=contract\]/);
  assert.match(html, /@media \(prefers-color-scheme: dark\)/);
  assert.doesNotMatch(html, /\.dark/);
});

test("renders sidebar skeletons deterministically", async () => {
  const { SidebarMenuSkeleton } = await vite.ssrLoadModule(
    "/components/ui/sidebar.tsx",
  );
  const first = renderToStaticMarkup(React.createElement(SidebarMenuSkeleton));
  const second = renderToStaticMarkup(React.createElement(SidebarMenuSkeleton));

  assert.equal(first, second);
  assert.match(first, /--skeleton-width:70%/);
});

test("forwards accessibility attributes and valuetext to the slider thumb", async () => {
  const { Slider } = await vite.ssrLoadModule("/components/ui/slider.tsx");
  const html = renderToStaticMarkup(
    React.createElement(Slider, {
      "aria-label": "Timeline event position",
      "aria-valuetext": "1 of 10: 1949-10-21, Event Title",
      value: [0],
      min: 0,
      max: 9,
    }),
  );

  assert.match(html, /role="slider"/);
  assert.match(html, /aria-label="Timeline event position"/);
  assert.match(html, /aria-valuetext="1 of 10: 1949-10-21, Event Title"/);
  assert.match(html, /aria-valuenow="0"/);
  assert.match(html, /aria-valuemin="0"/);
  assert.match(html, /aria-valuemax="9"/);

});

test("generates valid BibTeX, APA, and Chicago citations with precision awareness", async () => {
  const { formatBibTeX, formatAPA, formatChicago, formatJSON } =
    await vite.ssrLoadModule("/lib/citations.ts");

  const sampleEvent = {
    id: "evt-1996-election",
    slug: "1996-first-prime-ministerial-election",
    eventName: "Victory in Direct Prime Ministerial Election",
    startDate: "1996-05-29",
    sourceIds: ["src-knesset-1996"],
  };

  const sampleSource = {
    id: "src-knesset-1996",
    title: "Official Election Protocols",
    publisher: "Knesset Archives",
    url: "https://knesset.gov.il/archives/1996",
  };

  const bibtex = formatBibTeX(sampleEvent, sampleSource);
  assert.match(bibtex, /@misc\{rewind_evt_1996_election/);
  assert.match(bibtex, /title = \{Victory in Direct Prime Ministerial Election\}/);
  assert.match(bibtex, /year = \{1996\}/);
  assert.match(bibtex, /month = \{May\}/);

  const apa = formatAPA(sampleEvent, sampleSource);
  assert.match(apa, /Knesset Archives\. \(1996, May 29\)\. Victory in Direct Prime Ministerial Election/);

  const chicago = formatChicago(sampleEvent, sampleSource);
  assert.match(chicago, /"Victory in Direct Prime Ministerial Election," Knesset Archives/);

  // Test year-only precision (no invented month/day)
  const yearEvent = {
    id: "evt-1948-founding",
    slug: "1948-state-founding",
    eventName: "State Founding Declaration",
    startDate: "1948",
    datePrecision: "year",
    sourceIds: ["src-1948"],
  };
  const bibtexYear = formatBibTeX(yearEvent, sampleSource);
  assert.match(bibtexYear, /year = \{1948\}/);
  assert.doesNotMatch(bibtexYear, /month =/);
  const apaYear = formatAPA(yearEvent, sampleSource);
  assert.match(apaYear, /Knesset Archives\. \(1948\)\. State Founding Declaration/);
  const chicagoYear = formatChicago(yearEvent, sampleSource);
  assert.match(chicagoYear, /documented 1948/);

  // Test month-only precision
  const monthEvent = {
    id: "evt-1993-oslo",
    slug: "1993-oslo-negotiations",
    eventName: "Oslo Channel Talks",
    startDate: "1993-08",
    datePrecision: "month",
    sourceIds: ["src-1993"],
  };
  const apaMonth = formatAPA(monthEvent, sampleSource);
  assert.match(apaMonth, /Knesset Archives\. \(1993, August\)\. Oslo Channel Talks/);

  // Test exact-minute ISO timestamp with time component (no NaN or Invalid Date)
  const minuteEvent = {
    id: "evt-1996-presser",
    slug: "1996-press-conference",
    eventName: "Joint Press Conference",
    startDate: "1996-07-09T16:30:00Z",
    datePrecision: "exact-minute",
    sourceIds: ["src-1996"],
  };
  const bibtexMinute = formatBibTeX(minuteEvent, sampleSource);
  assert.match(bibtexMinute, /year = \{1996\}/);
  assert.match(bibtexMinute, /month = \{Jul\}/);
  const apaMinute = formatAPA(minuteEvent, sampleSource);
  assert.match(apaMinute, /Knesset Archives\. \(1996, July 9\)\. Joint Press Conference/);

  const json = JSON.parse(formatJSON(sampleEvent, sampleSource));
  assert.equal(json.id, "evt-1996-election");
  assert.equal(json.atlasMetadata.generator, "REWIND Evidence Atlas v1.0");
});
