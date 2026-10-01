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

  assert.match(globalsCss, /\.person-page\s*\{[^}]*background:\s*(?:var\(--rewind-dark-bg-primary\)|#07151c)/);
  assert.match(globalsCss, /\.person-section-wrap\s*\{/);
  assert.match(globalsCss, /\.person-workspace-tabs\s*\{/);
  assert.match(globalsCss, /\.workspace-tab-btn\s*\{/);
  assert.match(globalsCss, /\.workspace-tab-btn\[aria-selected="true"\]/);
  assert.match(globalsCss, /\.roles-timeline-container\s*\{/);
  assert.match(globalsCss, /\.milestones-timeline-container\s*\{/);
  assert.match(globalsCss, /\.topic-timeline-container\s*\{/);
});

test("verifies WCAG 2.1 AA color contrast compliance across dark palette pairs", async () => {
  const globalsCss = await readFile(path.join(root, "app/globals.css"), "utf8");

  function resolveColor(val) {
    if (!val) return val;
    val = val.trim();
    if (val.startsWith("var(")) {
      const varName = val.slice(4, -1).trim();
      const varRegex = new RegExp(`${varName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}:\\s*([^;]+);`);
      const varMatch = globalsCss.match(varRegex);
      if (varMatch) {
        return resolveColor(varMatch[1].trim());
      }
    }
    return val;
  }

  function normalizeHex(hex) {
    hex = resolveColor(hex);
    if (!hex) return hex;
    if (hex.startsWith("#")) {
      if (hex.length === 4) {
        return "#" + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
      }
      return hex;
    }
    return hex;
  }

  function getLuminance(hex) {
    const normalized = normalizeHex(hex);
    const rgb = normalized.replace("#", "").match(/.{2}/g).map((x) => parseInt(x, 16) / 255);
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
    const regex = new RegExp(`(?:^|[},;\\s])${escaped}\\s*\\{[^}]*?${prop}:\\s*([^;]+);`, "m");
    const match = globalsCss.match(regex);
    return match ? match[1].trim() : null;
  }

  const personPageBg = extractProp(".person-page", "background");
  const personPageColor = extractProp(".person-page", "color");
  const activeTabColor = extractProp(".workspace-tab-btn[aria-selected=\"true\"]", "color");
  const activeTabBg = extractProp(".workspace-tab-btn[aria-selected=\"true\"]", "background");
  const roleCardBg = extractProp(".role-card", "background");
  const roleBadgeColor = extractProp(".role-badge-active", "color");
  const milestoneBadgeColor = extractProp(".milestone-cat-badge", "color");
  const milestoneStatColor = extractProp(".milestone-stat-pill", "color");
  const coverageBg = extractProp(".coverage-section", "background");
  const coverageColor = extractProp(".coverage-section", "color");
  const yearTileBg = extractProp(".year-grid a", "background");
  const yearTileColor = extractProp(".year-grid a", "color");
  const yearTileIconColor = extractProp(".year-grid svg", "color");
  const filterBtnBg = extractProp(".category-filter-btn", "background");
  const filterBtnColor = extractProp(".category-filter-btn", "color");
  const activeFilterBtnBg = extractProp(".category-filter-btn[aria-pressed=\"true\"]", "background");
  const activeFilterBtnColor = extractProp(".category-filter-btn[aria-pressed=\"true\"]", "color");

  const contrastPairs = [
    { fg: personPageColor, bg: personPageBg, name: "Person page text on page background", minContrast: 4.5 },
    { fg: activeTabColor, bg: activeTabBg, name: "Active tab text on active tab background", minContrast: 4.5 },
    { fg: roleBadgeColor, bg: roleCardBg, name: "Active role badge on card surface", minContrast: 4.5 },
    { fg: milestoneBadgeColor, bg: roleCardBg, name: "Milestone category badge on card surface", minContrast: 4.5 },
    { fg: milestoneStatColor, bg: roleCardBg, name: "Milestone stat pill text on card surface", minContrast: 4.5 },
    { fg: coverageColor, bg: coverageBg, name: "Coverage section text on light section background", minContrast: 4.5 },
    { fg: yearTileColor, bg: yearTileBg, name: "Year tile text on white card background", minContrast: 4.5 },
    { fg: yearTileIconColor, bg: yearTileBg, name: "Year tile link icon on white card background", minContrast: 4.5 },
    { fg: filterBtnColor, bg: filterBtnBg, name: "Inactive category filter button text on button background", minContrast: 4.5 },
    { fg: activeFilterBtnColor, bg: activeFilterBtnBg, name: "Active category filter button text on active button background", minContrast: 4.5 },
  ];

  for (const pair of contrastPairs) {
    assert.ok(pair.fg && pair.bg, `Could not extract color values for ${pair.name}`);
    const resolvedFg = normalizeHex(pair.fg);
    const resolvedBg = normalizeHex(pair.bg);
    const contrast = getContrast(resolvedFg, resolvedBg);
    assert.ok(
      contrast >= pair.minContrast,
      `Contrast failure for ${pair.name} (${resolvedFg} [raw: ${pair.fg}] on ${resolvedBg} [raw: ${pair.bg}]): ratio is ${contrast.toFixed(2)}:1, expected >= ${pair.minContrast}:1`
    );
  }
});

test("verifies person page code review fixes for focus-visible, tab count sync, and empty criteria state", async () => {
  const globalsCss = await readFile(path.join(root, "app/globals.css"), "utf8");
  const inclusionBadgeSource = await readFile(path.join(root, "components/rewind/InclusionBadge.tsx"), "utf8");
  const workspaceTabsSource = await readFile(path.join(root, "components/rewind/PersonWorkspaceTabs.tsx"), "utf8");
  const personPageSource = await readFile(path.join(root, "app/person/[slug]/page.tsx"), "utf8");

  // 1. Focus-visible CSS styles
  assert.match(globalsCss, /\.telemetry-action-btn:focus-visible\s*\{[^}]*outline:\s*2px solid #f59e0b/);
  assert.match(globalsCss, /\.nexus-co-chip:focus-visible\s*\{[^}]*outline:\s*2px solid #f59e0b/);
  assert.match(globalsCss, /\.year-matrix-pill:focus-visible\s*\{[^}]*outline:\s*2px solid #f59e0b/);
  assert.match(globalsCss, /\.inclusion-footer\s+\.methodology-link:focus-visible\s*\{[^}]*outline:\s*2px solid #f59e0b/);

  // 2. InclusionBadge neutral empty state and fallback rationale
  assert.match(inclusionBadgeSource, /Specific inclusion criteria have not yet been recorded in this edition/);
  assert.match(inclusionBadgeSource, /Formal inclusion rationale under REWiND historical indexing standards has not yet been documented for this profile/);
  assert.doesNotMatch(inclusionBadgeSource, /Central nexus to documented historical and diplomatic events/);

  // 3. PersonWorkspaceTabs rolesCount and milestonesCount reuse and role="status"
  assert.match(workspaceTabsSource, /const rolesCount = roles\.length \|\| person\.career\?\.length \|\| 0;/);
  assert.match(workspaceTabsSource, /const milestonesCount = \(milestones\.length \|\| 0\) \+ \(person\.awards\?\.length \|\| 0\);/);
  assert.match(workspaceTabsSource, /<div className="sr-only" role="status" aria-live="polite" aria-atomic="true">/);

  // 4. PersonPage co-attendee loop skips participant if personId matches person.id before slug derivation
  assert.match(personPageSource, /if \(p\.personId === person\.id \|\| p\.personId === person\.slug\) return;/);
});

test("verifies person dossier enhancements for biographical live regions, semantic topic participant links, and focus outlines", async () => {
  const globalsCss = await readFile(path.join(root, "app/globals.css"), "utf8");
  const { BiographicalSection } = await vite.ssrLoadModule("/components/rewind/BiographicalSection.tsx");
  const { TopicTimeline } = await vite.ssrLoadModule("/components/rewind/TopicTimeline.tsx");

  // 1. BiographicalSection renders accessible live region with non-empty announcement
  const samplePerson = {
    id: "yitzhak-rabin",
    slug: "yitzhak-rabin",
    name: "Yitzhak Rabin",
    description: "Israeli Prime Minister",
    career: [{ id: "c-1", positionTitle: "Prime Minister", organisationName: "Government of Israel" }],
    education: [{ id: "e-1", institution: "Kadoorie Agricultural High School" }],
    works: [{ id: "w-1", workTitle: "The Rabin Memoirs", workType: "Book" }],
    awards: [{ id: "a-1", awardName: "Nobel Peace Prize", awardingBody: "Norwegian Nobel Committee" }],
  };

  const bioHtml = renderToStaticMarkup(React.createElement(BiographicalSection, { person: samplePerson }));
  assert.match(bioHtml, /<div class="sr-only" role="status" aria-live="polite" aria-atomic="true">([^<]+)<\/div>/);
  const bioAnnounceMatch = bioHtml.match(/<div class="sr-only" role="status" aria-live="polite" aria-atomic="true">([^<]+)<\/div>/);
  assert.ok(bioAnnounceMatch && bioAnnounceMatch[1].trim().length > 0, "Biographical live announcement must contain non-empty text");

  // 2. TopicTimeline semantically renders links for slug/prefixed IDs and spans for unlinked participants
  const sampleTopic = {
    id: "middle-east-diplomacy",
    slug: "middle-east-diplomacy",
    name: "Middle East Diplomacy",
    category: "diplomacy",
    summary: "Diplomatic treaties and engagements.",
    startedDate: "1978-09-17",
  };

  const sampleRecords = [
    {
      id: "evt-summit-1993",
      slug: "oslo-accords-signing",
      eventName: "Signing of the Oslo Accords",
      startDate: "1993-09-13",
      city: "Washington, D.C.",
      country: "United States",
      verificationStatus: "verified",
      participants: [
        { personId: "p-yitzhak-rabin", name: "Yitzhak Rabin", role: "Prime Minister", slug: "yitzhak-rabin" },
        { personId: "p-bill-clinton", name: "Bill Clinton", role: "President" },
        { personId: "", name: "Diplomatic Delegation", role: "Observer" },
      ],
    },
  ];

  const topicHtml = renderToStaticMarkup(React.createElement(TopicTimeline, { topic: sampleTopic, records: sampleRecords }));
  assert.match(topicHtml, /<a[^>]*href="\/person\/yitzhak-rabin"[^>]*>Yitzhak Rabin/);
  assert.match(topicHtml, /<a[^>]*href="\/person\/bill-clinton"[^>]*>Bill Clinton/);
  assert.match(topicHtml, /<span class="participant-tag">Diplomatic Delegation/);

  // 3. globals.css focus-visible outlines
  assert.match(globalsCss, /\.back-link:focus-visible,\s*\.record-breadcrumb a:focus-visible\s*\{[^}]*outline:\s*2px solid #f59e0b/);
  assert.match(globalsCss, /\.bio-tab:focus-visible,\s*\.bio-nav-button:focus-visible\s*\{[^}]*outline:\s*2px solid #f59e0b/);
  assert.match(globalsCss, /\.person-time-console \.epoch-badge:focus-visible\s*\{[^}]*outline:\s*2px solid #38bdf8/);
});



