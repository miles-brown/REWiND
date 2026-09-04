import assert from "node:assert/strict";
import test, { after } from "node:test";
import { fileURLToPath } from "node:url";
import fs from "node:fs";
import path from "node:path";
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

test("verifies app/admin/evidence/page.tsx does not duplicate Shell wrapper", () => {
  const adminPagePath = path.join(root, "app/admin/evidence/page.tsx");
  const content = fs.readFileSync(adminPagePath, "utf-8");
  assert.ok(
    !/<Shell\b[^>]*>|<\/Shell>/.test(content),
    "app/admin/evidence/page.tsx must not contain inner <Shell> wrapper"
  );
  assert.ok(
    !/import\s+{[^}]*\bShell\b[^}]*}\s+from\s+["']@\/components\/rewind\/Shell["']/.test(content),
    "app/admin/evidence/page.tsx must not import Shell"
  );
});

test("verifies PersonTimeline.tsx has removed shouty mint DRAG TO REWIND CHRONOLOGY and red text", () => {
  const personTimelinePath = path.join(root, "components/rewind/PersonTimeline.tsx");
  const content = fs.readFileSync(personTimelinePath, "utf-8");
  assert.ok(
    !content.includes("DRAG TO REWIND CHRONOLOGY"),
    "PersonTimeline.tsx must not contain DRAG TO REWIND CHRONOLOGY"
  );
  assert.ok(
    !/color\s*:\s*["']?red/i.test(content) && !/text-red/i.test(content),
    "PersonTimeline.tsx must not contain inline or class-based red text styling"
  );
  assert.ok(
    content.includes('className="status-left"'),
    "PersonTimeline.tsx must wrap live indicator in status-left to prevent grid collision with status-right-tools"
  );

  const cssPath = path.join(root, "app/globals.css");
  const cssContent = fs.readFileSync(cssPath, "utf-8");
  assert.ok(
    cssContent.includes(".person-time-console { position: sticky; z-index: 30; bottom: 0; }"),
    "globals.css must anchor .person-time-console to bottom: 0 with sticky positioning"
  );
  assert.ok(
    cssContent.includes(".rewind-console { position: sticky; z-index: 30; bottom: 0;"),
    "globals.css must anchor .rewind-console to bottom: 0 with sticky positioning"
  );
});

test("verifies MapGraphic.tsx has eliminated confusing '3D Vector' label and provides Satellite/Basemap layer toggle", () => {
  const mapGraphicPath = path.join(root, "components/rewind/MapGraphic.tsx");
  const content = fs.readFileSync(mapGraphicPath, "utf-8");
  assert.ok(
    !content.includes("3D Vector"),
    "MapGraphic.tsx must not contain confusing '3D Vector' button label"
  );
  assert.ok(
    content.includes("satellite-streets-v12"),
    "MapGraphic.tsx must support Mapbox Satellite Streets layer"
  );
  assert.ok(
    content.includes("dark-v11"),
    "MapGraphic.tsx must support Mapbox Dark basemap layer"
  );
});

test("verifies SourcesPage module export and comprehensive filtering support", async () => {
  const mod = await vite.ssrLoadModule("/app/sources/page.tsx");
  assert.equal(typeof mod.default, "function", "SourcesPage must export a default React component");
});

test("verifies SourcesPage accessibility and search criteria compliance", () => {
  const sourcesCatalogPath = path.join(root, "components/rewind/SourcesCatalog.tsx");
  assert.ok(
    fs.existsSync(sourcesCatalogPath),
    "components/rewind/SourcesCatalog.tsx must exist"
  );
  const content = fs.readFileSync(sourcesCatalogPath, "utf-8");

  // ARIA pressed attributes
  assert.ok(
    content.includes('aria-pressed={viewMode === "table"}'),
    "Table toggle button must have aria-pressed attribute"
  );
  assert.ok(
    content.includes('aria-pressed={viewMode === "cards"}'),
    "Cards toggle button must have aria-pressed attribute"
  );
  assert.ok(
    content.includes('aria-pressed={classificationFilter === "all"}'),
    "All classification filter must have aria-pressed attribute"
  );
  assert.ok(
    content.includes('aria-pressed={classificationFilter === "primary"}'),
    "Primary filter must have aria-pressed attribute"
  );
  assert.ok(
    content.includes('aria-pressed={classificationFilter === "secondary"}'),
    "Secondary filter must have aria-pressed attribute"
  );

  // URL search matching
  assert.ok(
    content.includes("matchUrl = s.url"),
    "SourcesPage search filter must match on source URL"
  );
});

test("verifies MapGraphic.tsx WebGL hydration resilience and token safeguards", () => {
  const mapGraphicPath = path.join(root, "components/rewind/MapGraphic.tsx");
  const content = fs.readFileSync(mapGraphicPath, "utf-8");

  // WebGL hydration safety (initialized to false/svg, detected in mount useEffect)
  assert.ok(
    content.includes("const [webGlSupported, setWebGlSupported] = useState<boolean>(false);"),
    "webGlSupported must initialize to false to prevent hydration mismatch"
  );
  assert.ok(
    content.includes('const [mapMode, setMapMode] = useState<"webgl" | "svg">("svg");'),
    "mapMode must initialize to svg to prevent hydration mismatch"
  );

  // Satellite token safeguard
  assert.ok(
    content.includes("disabled={!MAPBOX_TOKEN}"),
    "Satellite toggle button must be disabled when MAPBOX_TOKEN is empty"
  );
});

test("verifies filter label contrast in app/globals.css", () => {
  const cssPath = path.join(root, "app/globals.css");
  const content = fs.readFileSync(cssPath, "utf-8");
  assert.ok(
    content.includes(".filter-group-label { font-size: 10px; font-weight: 700; color: #94a3b8;"),
    ".filter-group-label must use high-contrast #94a3b8 token"
  );
  assert.ok(
    content.includes(".filter-select-wrap label { font-size: 10px; font-weight: 700; color: #94a3b8;"),
    ".filter-select-wrap label must use high-contrast #94a3b8 token"
  );
});

test("verifies MapMarker accessibility and tooltip aria-hidden safeguard", () => {
  const mapGraphicPath = path.join(root, "components/rewind/MapGraphic.tsx");
  const content = fs.readFileSync(mapGraphicPath, "utf-8");

  assert.ok(
    content.includes('el.setAttribute("aria-label", ariaLabelText)'),
    "Map marker element must have informative dynamic aria-label"
  );
  assert.ok(
    content.includes('el.setAttribute("aria-pressed", isSelected ? "true" : "false")'),
    "Map marker element must expose aria-pressed selection state"
  );
  assert.ok(
    content.includes('tooltip.setAttribute("aria-hidden", "true")'),
    "Tooltip must be aria-hidden to prevent redundant screen reader announcements"
  );
});

test("verifies PersonTimeline slider ARIA attributes and semantic dateTime formatting", () => {
  const timelinePath = path.join(root, "components/rewind/PersonTimeline.tsx");
  const timelineContent = fs.readFileSync(timelinePath, "utf-8");

  assert.ok(
    timelineContent.includes("getAriaValueText="),
    "Slider must supply getAriaValueText callback for screen readers"
  );
  assert.ok(
    timelineContent.includes("getAriaLabel="),
    "Slider must supply getAriaLabel callback for screen readers"
  );

  const sourcesCatalogPath = path.join(root, "components/rewind/SourcesCatalog.tsx");
  assert.ok(
    fs.existsSync(sourcesCatalogPath),
    "components/rewind/SourcesCatalog.tsx must exist"
  );
  const sourcesContent = fs.readFileSync(sourcesCatalogPath, "utf-8");
  assert.ok(
    sourcesContent.includes('dateTime={isoDate || undefined}'),
    "Sources page must render machine-readable dateTime on time elements"
  );
  assert.ok(
    sourcesContent.includes('className="action-btn reset"'),
    "Sources empty state button must have reset modifier class"
  );
});

test("verifies MapGraphic.tsx toolbar ARIA semantics and SVG marker attributes", () => {
  const mapPath = path.join(root, "components/rewind/MapGraphic.tsx");
  const content = fs.readFileSync(mapPath, "utf-8");

  assert.ok(
    content.includes('className="map-toolbar" role="toolbar" aria-label="Map view controls"'),
    "Map toolbar must have role='toolbar' and aria-label"
  );
  assert.ok(
    content.includes('aria-pressed={mapTheme === "satellite"}'),
    "Satellite theme toggle must expose aria-pressed state"
  );
  assert.ok(
    content.includes('aria-pressed={mapMode === "svg"}'),
    "Schematic map toggle must expose aria-pressed state"
  );
  assert.ok(
    content.includes("aria-pressed={isExpanded}"),
    "Enlarge/collapse button must expose aria-pressed state"
  );
  assert.ok(
    content.includes("aria-pressed={isSelected}"),
    "SVG cluster marker must expose aria-pressed state"
  );
});

test("verifies PersonTimeline.tsx and RewindExplorer.tsx playback toolbar roles and dateTime", () => {
  const timelinePath = path.join(root, "components/rewind/PersonTimeline.tsx");
  const timelineContent = fs.readFileSync(timelinePath, "utf-8");
  assert.ok(
    timelineContent.includes('role="toolbar" aria-label="Timeline playback controls"'),
    "PersonTimeline play controls must have role='toolbar'"
  );
  assert.ok(
    timelineContent.includes("aria-pressed={playing}"),
    "PersonTimeline main play button must expose aria-pressed"
  );
  assert.ok(
    timelineContent.includes('aria-pressed={direction === "backward"}'),
    "PersonTimeline direction button must expose aria-pressed"
  );
  assert.ok(
    timelineContent.includes('role="group" aria-label="Jump to decade milestones"'),
    "PersonTimeline epoch rail must have role='group'"
  );
  assert.ok(
    timelineContent.includes("<time dateTime={event.startDate}>"),
    "PersonTimeline event detail must render machine-readable ISO-8601 dateTime"
  );

  const explorerPath = path.join(root, "components/rewind/RewindExplorer.tsx");
  const explorerContent = fs.readFileSync(explorerPath, "utf-8");
  assert.ok(
    explorerContent.includes('role="toolbar" aria-label="Timeline playback controls"'),
    "RewindExplorer play controls must have role='toolbar'"
  );
  assert.ok(
    explorerContent.includes("aria-pressed={playing}"),
    "RewindExplorer play button must expose aria-pressed"
  );
  assert.ok(
    explorerContent.includes('aria-pressed={direction === "backward"}'),
    "RewindExplorer direction button must expose aria-pressed"
  );
  assert.ok(
    explorerContent.includes("<time dateTime={event.startDate}>"),
    "RewindExplorer event detail must render machine-readable ISO-8601 dateTime"
  );
});

test("verifies CSS deduping and enhanced contrast tokens in app/globals.css", () => {
  const cssPath = path.join(root, "app/globals.css");
  const content = fs.readFileSync(cssPath, "utf-8");

  // Evidence Review Console comment appears only once
  const occurrences = content.split("/* --- Evidence Review Console --- */").length - 1;
  assert.equal(occurrences, 1, "Evidence Review Console CSS block must not be duplicated");

  assert.ok(
    content.includes(".action-btn.reset {"),
    "globals.css must define .action-btn.reset styling for empty state actions"
  );
  assert.ok(
    content.includes(".card-view-btn { display: inline-flex; align-items: center; gap: 5px; font-size: 11px; font-weight: 700; padding: 5px 10px; border-radius: 6px; background: rgba(245, 158, 11, 0.18); color: #fbbf24;"),
    "globals.css must style .card-view-btn with high-contrast #fbbf24"
  );
  assert.ok(
    content.includes(".map-tool-btn:disabled { opacity: 0.45; cursor: not-allowed; pointer-events: none; }"),
    "globals.css must define disabled state for map-tool-btn"
  );
});

test("verifies full WCAG 2.1 AA elimination of #64748b and expanded map styling in globals.css", () => {
  const cssPath = path.join(root, "app/globals.css");
  const content = fs.readFileSync(cssPath, "utf-8");

  // Zero occurrences of low-contrast #64748b
  assert.equal(
    content.includes("#64748b"),
    false,
    "globals.css must contain zero occurrences of low-contrast #64748b token"
  );

  // Expanded map view styling
  assert.ok(
    content.includes(".evidence-map-wrapper.expanded-view {"),
    "globals.css must define .evidence-map-wrapper.expanded-view styling"
  );
  assert.ok(
    content.includes(".source-kpi.highlight .kpi-num { color: #fbbf24; }"),
    "globals.css must use high-contrast #fbbf24 for highlighted KPI numbers"
  );
});

test("verifies MapGraphic lifecycle resilience and expanded keyboard Escape listener", () => {
  const mapPath = path.join(root, "components/rewind/MapGraphic.tsx");
  const content = fs.readFileSync(mapPath, "utf-8");

  // Ensure initMap dependencies do not tear down the map on selection changes
  assert.ok(
    content.includes("}, [mapMode, transformRequest]);"),
    "initMap effect must only reinitialize when mapMode or transformRequest changes"
  );

  // Escape key handler for expanded view
  assert.ok(
    content.includes('if (e.key === "Escape")'),
    "MapGraphic must listen for Escape key to collapse expanded view"
  );

  // addTrajectoriesToMap setData resilience
  assert.ok(
    content.includes('existingSource.setData('),
    "addTrajectoriesToMap must update existing GeoJSON source via setData"
  );
});

test("verifies SourcesPage historical date resolution and RewindExplorer disabled boundary states", () => {
  const sourcesCatalogPath = path.join(root, "components/rewind/SourcesCatalog.tsx");
  assert.ok(
    fs.existsSync(sourcesCatalogPath),
    "components/rewind/SourcesCatalog.tsx must exist"
  );
  const sourcesContent = fs.readFileSync(sourcesCatalogPath, "utf-8");

  assert.ok(
    sourcesContent.includes("getSourceDateInfo"),
    "SourcesPage must use getSourceDateInfo to resolve historical documentary dates"
  );
  assert.ok(
    sourcesContent.includes('role="toolbar" aria-label="Catalog layout mode"'),
    "Sources view toggles must have role='toolbar'"
  );
  assert.ok(
    sourcesContent.includes('role="group" aria-label="Evidence tier filter"'),
    "Filter pills cluster must have role='group'"
  );

  const explorerPath = path.join(root, "components/rewind/RewindExplorer.tsx");
  const explorerContent = fs.readFileSync(explorerPath, "utf-8");

  assert.ok(
    explorerContent.includes("disabled={!hasEvents || safeIndex === 0}"),
    "RewindExplorer previous button must be disabled at start of timeline or when no events match"
  );
  assert.ok(
    explorerContent.includes("disabled={!hasEvents || safeIndex >= filtered.length - 1}"),
    "RewindExplorer next button must be disabled at end of timeline or when no events match"
  );
  assert.ok(
    !explorerContent.includes("filtered[safeIndex] || events[0]"),
    "RewindExplorer must not fall back to events[0] when filtered records is empty"
  );
  assert.ok(
    explorerContent.includes("empty-explorer-state") &&
    explorerContent.includes("No documented events found"),
    "RewindExplorer must render explicit empty state when filtered records is empty"
  );
  assert.ok(
    explorerContent.includes("reset-filters-btn") &&
    explorerContent.includes("Reset filters"),
    "RewindExplorer empty state must provide reset filters action"
  );
});

test("verifies RewindExplorer boundary and empty state logic with zero filtered records", async () => {
  const { RewindExplorer } = await vite.ssrLoadModule("/components/rewind/RewindExplorer.tsx");
  const html = renderToStaticMarkup(
    React.createElement(RewindExplorer, {
      initialType: "NonExistentType",
      initialStatus: "nonexistent",
    })
  );

  // Assert empty state rendering
  assert.match(html, /class="[^"]*empty-explorer-state[^"]*"/, "RewindExplorer must render .empty-explorer-state container");
  assert.match(html, /No documented events found/, "RewindExplorer must render empty state heading");
  assert.match(html, /Reset filters/, "RewindExplorer must provide a reset filters button");
  assert.doesNotMatch(html, /Open event and evidence/, "RewindExplorer must not render event details or fall back to events[0]");

  // Verify previous, next, and play controls are disabled
  assert.match(html, /<button[^>]*aria-label="Previous event"[^>]*disabled|<button[^>]*disabled[^>]*aria-label="Previous event"/, "Previous button must be disabled when 0 records match");
  assert.match(html, /<button[^>]*aria-label="Next event"[^>]*disabled|<button[^>]*disabled[^>]*aria-label="Next event"/, "Next button must be disabled when 0 records match");
  assert.match(html, /<button[^>]*aria-label="Playback unavailable"[^>]*disabled|<button[^>]*disabled[^>]*aria-label="Playback unavailable"/, "Play button must be disabled and indicate playback unavailable");
});

test("verifies full WCAG AA compliance for Sliders, KPIs, live announcements and scoped buttons", () => {
  // 1. Slider ARIA attributes in RewindExplorer and PersonTimeline
  const explorerContent = fs.readFileSync(path.join(root, "components/rewind/RewindExplorer.tsx"), "utf-8");
  assert.ok(
    explorerContent.includes("aria-valuemin={0}"),
    "RewindExplorer must set aria-valuemin on Slider"
  );
  assert.ok(
    explorerContent.includes("aria-valuemax={Math.max(0, filtered.length - 1)}"),
    "RewindExplorer must set dynamic aria-valuemax on Slider"
  );
  assert.ok(
    explorerContent.includes("aria-valuenow={hasEvents ? safeIndex : 0}"),
    "RewindExplorer must set dynamic aria-valuenow on Slider"
  );

  const timelineContent = fs.readFileSync(path.join(root, "components/rewind/PersonTimeline.tsx"), "utf-8");
  assert.ok(
    timelineContent.includes("aria-valuemin={0}") &&
    timelineContent.includes("aria-valuemax={Math.max(0, ordered.length - 1)}") &&
    timelineContent.includes("aria-valuenow={ordered.length ? safeIndex : 0}"),
    "PersonTimeline must set aria-valuemin, aria-valuemax, and aria-valuenow on Slider"
  );

  // 2. Semantic KPI definition list in SourcesCatalog.tsx
  const sourcesCatalogPath = path.join(root, "components/rewind/SourcesCatalog.tsx");
  assert.ok(
    fs.existsSync(sourcesCatalogPath),
    "components/rewind/SourcesCatalog.tsx must exist"
  );
  const sourcesContent = fs.readFileSync(sourcesCatalogPath, "utf-8");
  assert.ok(
    sourcesContent.includes('<dl className="sources-kpi-bar" aria-label="Sources register summary metrics">'),
    "Sources page must use semantic <dl> list for KPI summary metrics"
  );
  assert.ok(
    sourcesContent.includes('<dt className="kpi-label">') && sourcesContent.includes('<dd className="kpi-num">'),
    "Sources page KPI bar must use semantic <dt> labels and <dd> values"
  );

  // 3. Live announcement regions for dynamic content
  assert.ok(
    sourcesContent.includes('role="status" aria-live="polite" aria-atomic="true"'),
    "Sources page must provide polite live announcement region for filter updates"
  );
  assert.ok(
    explorerContent.includes('role="status" aria-live="polite" aria-atomic="true"'),
    "RewindExplorer must provide polite live announcement region for playback updates"
  );

  // 4. Scoped CSS for reset filters buttons
  const cssContent = fs.readFileSync(path.join(root, "app/globals.css"), "utf-8");
  assert.ok(
    cssContent.includes(".empty-explorer-content .reset-filters-btn"),
    "globals.css must scope Explorer empty state reset button to avoid collisions"
  );
  assert.ok(
    cssContent.includes(".sources-filter-row .reset-filters-btn"),
    "globals.css must scope Sources filter reset button to avoid collisions"
  );
});

test("verifies forensic rigor, Slider ARIA fallbacks, and taxonomy canonicalization", () => {
  const root = process.cwd();

  // 1. Slider ARIA fallbacks
  const sliderContent = fs.readFileSync(path.join(root, "components/ui/slider.tsx"), "utf-8");
  assert.ok(
    sliderContent.includes("ariaValueText ?? String(thumbValue)"),
    "Slider must guarantee fallback aria-valuetext on thumb"
  );
  assert.ok(
    sliderContent.includes('ariaLabel ?? "Timeline position"'),
    "Slider must guarantee fallback aria-label on thumb"
  );

  // 2. Canonical eventTypes prioritization
  const cardContent = fs.readFileSync(path.join(root, "components/rewind/EventCard.tsx"), "utf-8");
  assert.ok(
    cardContent.includes("event.eventTypes?.length ? event.eventTypes : (event.categories ?? [])"),
    "EventCard must prioritize canonical eventTypes over legacy categories"
  );
  const explorerContent = fs.readFileSync(path.join(root, "components/rewind/EventExplorer.tsx"), "utf-8");
  assert.ok(
    explorerContent.includes("e.eventTypes?.length ? e.eventTypes : (e.categories ?? [])"),
    "EventExplorer must prioritize canonical eventTypes over legacy categories"
  );

  // 3. RewindExplorer conditional year jump
  const rewindContent = fs.readFileSync(path.join(root, "components/rewind/RewindExplorer.tsx"), "utf-8");
  assert.ok(
    rewindContent.includes("{event && (") && rewindContent.includes('className="calendar-jump"'),
    "RewindExplorer must conditionally render calendar-jump link when event is active and omit when null"
  );

  // 4. CitationModal forensic warning
  const citeContent = fs.readFileSync(path.join(root, "components/rewind/CitationModal.tsx"), "utf-8");
  assert.ok(
    citeContent.includes("[CitationModal] Forensic warning:"),
    "CitationModal must log forensic warning when falling back to synthetic source"
  );

  // 5. lib/rewind/events.ts confidence and datePrecision mappings
  const eventsContent = fs.readFileSync(path.join(root, "lib/rewind/events.ts"), "utf-8");
  assert.ok(
    eventsContent.includes("confidence: (row.confidence as Confidence)") &&
    eventsContent.includes("datePrecision: (String(row.temporal_precision || \"exact-day\")) as Precision"),
    "lib/rewind/events.ts must map canonical confidence and datePrecision defaults"
  );
});


