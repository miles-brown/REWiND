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

test("generates valid BibTeX, APA, and Chicago citations", async () => {
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

  const apa = formatAPA(sampleEvent, sampleSource);
  assert.match(apa, /Knesset Archives\. \(1996, May 29\)\. Victory in Direct Prime Ministerial Election/);

  const chicago = formatChicago(sampleEvent, sampleSource);
  assert.match(chicago, /"Victory in Direct Prime Ministerial Election," Knesset Archives/);

  const json = JSON.parse(formatJSON(sampleEvent, sampleSource));
  assert.equal(json.id, "evt-1996-election");
  assert.equal(json.atlasMetadata.generator, "REWIND Evidence Atlas v1.0");
});

test("renders PersonWorkspaceTabs with accessible roles, tabs-header-wrap, and active styling", async () => {
  const { PersonWorkspaceTabs } = await vite.ssrLoadModule(
    "/components/rewind/PersonWorkspaceTabs.tsx",
  );

  const samplePerson = {
    id: "benjamin-netanyahu",
    slug: "benjamin-netanyahu",
    name: "Benjamin Netanyahu",
    description: "Israeli Prime Minister",
  };

  const html = renderToStaticMarkup(
    React.createElement(PersonWorkspaceTabs, {
      person: samplePerson,
      records: [],
      roles: [],
      milestones: [],
    }),
  );

  assert.match(html, /class="tabs-header-wrap"/);
  assert.match(html, /role="tablist"/);
  assert.match(html, /id="tab-events"/);
  assert.match(html, /aria-selected="true"/);
  assert.match(html, /id="tab-roles"/);
  assert.match(html, /id="tab-milestones"/);
  assert.match(html, /workspace-tab-btn/);
});

test("globals.css defines dark container wrappers and timeline tab styles", async () => {
  const globalsCss = await readFile(path.join(root, "app/globals.css"), "utf8");

  assert.match(globalsCss, /\.person-page\s*\{[^}]*background:\s*#07151c/);
  assert.match(globalsCss, /\.person-section-wrap\s*\{/);
  assert.match(globalsCss, /\.person-workspace-tabs\s*\{/);
  assert.match(globalsCss, /\.workspace-tab-btn\s*\{/);
  assert.match(globalsCss, /\.workspace-tab-btn\.active/);
  assert.match(globalsCss, /\.roles-timeline-container\s*\{/);
  assert.match(globalsCss, /\.milestones-timeline-container\s*\{/);
  assert.match(globalsCss, /\.topic-timeline-container\s*\{/);
});

test("verifies WCAG 2.1 AA color contrast compliance across dark palette pairs", async () => {
  const globalsCss = await readFile(path.join(root, "app/globals.css"), "utf8");

  function getLuminance(hex) {
    const rgb = hex.replace("#", "").match(/.{2}/g).map((x) => parseInt(x, 16) / 255);
    const a = rgb.map((v) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
  }

  function getContrast(hex1, hex2) {
    const lum1 = getLuminance(hex1);
    const lum2 = getLuminance(hex2);
    return (Math.max(lum1, lum2) + 0.05) / (Math.min(lum1, lum2) + 0.05);
  }

  function extractProp(selector, prop) {
    const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`(?:^|,\\s*)${escaped}\\s*\\{[^}]*?${prop}:\\s*([^;]+);`, "m");
    const match = globalsCss.match(regex);
    return match ? match[1].trim() : null;
  }

  const personPageBg = extractProp(".person-page", "background");
  const personPageColor = extractProp(".person-page", "color");
  const activeTabColor = extractProp(".workspace-tab-btn[aria-selected=\"true\"]", "color") || extractProp(".workspace-tab-btn.active", "color");
  const activeTabBg = extractProp(".workspace-tab-btn[aria-selected=\"true\"]", "background") || extractProp(".workspace-tab-btn.active", "background");
  const roleCardBg = extractProp(".role-card", "background");
  const roleBadgeColor = extractProp(".role-badge-active", "color");
  const milestoneBadgeColor = extractProp(".milestone-cat-badge", "color");
  const milestoneStatColor = extractProp(".milestone-stat-pill", "color");

  const contrastPairs = [
    { fg: personPageColor, bg: personPageBg, name: "Person page text on page background", minContrast: 4.5 },
    { fg: activeTabColor, bg: activeTabBg, name: "Active tab text on active tab background", minContrast: 4.5 },
    { fg: roleBadgeColor, bg: roleCardBg, name: "Active role badge on card surface", minContrast: 4.5 },
    { fg: milestoneBadgeColor, bg: roleCardBg, name: "Milestone category badge on card surface", minContrast: 4.5 },
    { fg: milestoneStatColor, bg: roleCardBg, name: "Milestone stat pill text on card surface", minContrast: 4.5 },
  ];

  for (const pair of contrastPairs) {
    assert.ok(pair.fg && pair.bg, `Could not extract color values for ${pair.name}`);
    const contrast = getContrast(pair.fg, pair.bg);
    assert.ok(
      contrast >= pair.minContrast,
      `Contrast failure for ${pair.name} (${pair.fg} on ${pair.bg}): ratio is ${contrast.toFixed(2)}:1, expected >= ${pair.minContrast}:1`
    );
  }
});


