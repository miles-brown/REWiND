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

const cssBlockContains = (cssContent, selector, declarationPatterns) => {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const blockRegex = new RegExp(`${escapedSelector}\\s*\\{([^}]*)\\}`, "g");
  let match;
  while ((match = blockRegex.exec(cssContent)) !== null) {
    if (declarationPatterns.every((pattern) => pattern.test(match[1]))) return true;
  }
  return false;
};

const hasConsoleStickiness = (cssContent, selector) =>
  cssBlockContains(cssContent, selector, [
    /\bposition\s*:\s*fixed\s*(?:;|$)/,
    /(?:^|;)\s*bottom\s*:\s*0\s*(?:;|$)/,
    /\bz-index\s*:\s*40\s*(?:;|$)/,
  ]);

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
    hasConsoleStickiness(cssContent, ".person-time-console"),
    "globals.css must anchor .person-time-console with position: fixed, z-index: 40, and bottom: 0"
  );
  assert.ok(
    hasConsoleStickiness(cssContent, ".rewind-console"),
    "globals.css must anchor .rewind-console with position: fixed, z-index: 40, and bottom: 0"
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

  // Satellite token safeguard: button must be completely hidden when satellite style is absent
  assert.ok(
    content.includes("Boolean(MAPBOX_SATELLITE_STYLE)"),
    "Satellite toggle button must be hidden entirely when MAPBOX_SATELLITE_STYLE is empty"
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
    timelineContent.includes("<time") &&
    (timelineContent.includes("dateTime={event.startDate}") ||
     timelineContent.includes("dateTime={isStandardIsoDate(event.startDate)")),
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
    explorerContent.includes("<time") &&
    (explorerContent.includes("dateTime={event.startDate}") ||
     explorerContent.includes("dateTime={isStandardIsoDate(event.startDate)")),
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

test("verifies Slider ARIA fallbacks on thumb", () => {
  const sliderContent = fs.readFileSync(path.join(root, "components/ui/slider.tsx"), "utf-8");
  assert.ok(
    sliderContent.includes("ariaValueText ?? String(thumbValue)"),
    "Slider must guarantee fallback aria-valuetext on thumb"
  );
  assert.ok(
    sliderContent.includes('ariaLabel ?? "Value"'),
    "Slider must guarantee fallback aria-label on thumb"
  );
});

test("verifies canonical eventTypes prioritization over legacy categories", () => {
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
});

test("verifies RewindExplorer conditional calendar-jump rendering", async () => {
  const { RewindExplorer } = await vite.ssrLoadModule("/components/rewind/RewindExplorer.tsx");
  const nullHtml = renderToStaticMarkup(
    React.createElement(RewindExplorer, {
      initialEvents: [],
      sources: [],
    })
  );
  assert.ok(
    !nullHtml.includes("calendar-jump"),
    "RewindExplorer must omit calendar-jump link when event is null"
  );
  const sampleEvent = {
    id: "sample-event-active",
    slug: "sample-event-active",
    eventName: "Active Event",
    startDate: "1998-10-23",
    city: "Washington",
    country: "United States",
    summary: "Sample Event Summary",
    verificationStatus: "verified",
    confidence: "confirmed",
    eventTypes: ["diplomatic"],
  };
  const activeHtml = renderToStaticMarkup(
    React.createElement(RewindExplorer, {
      initialEvents: [sampleEvent],
      sources: [],
    })
  );
  assert.ok(
    activeHtml.includes("calendar-jump"),
    "RewindExplorer must render calendar-jump link when event is active"
  );
  const nonStandardHtml = renderToStaticMarkup(
    React.createElement(RewindExplorer, {
      initialEvents: [{ ...sampleEvent, startDate: "c. 1948" }],
      sources: [],
    })
  );
  assert.ok(
    !nonStandardHtml.includes("calendar-jump"),
    "RewindExplorer must omit calendar-jump link for non-standard dates"
  );
});

test("verifies CitationModal logs forensic warning on synthetic source fallback", () => {
  const citeContent = fs.readFileSync(path.join(root, "components/rewind/CitationModal.tsx"), "utf-8");
  assert.ok(
    citeContent.includes("[CitationModal] Forensic warning:"),
    "CitationModal must log forensic warning when falling back to synthetic source"
  );
});

test("verifies lib/rewind/events.ts confidence and datePrecision mappings", async () => {
  const eventsContent = fs.readFileSync(path.join(root, "lib/rewind/events.ts"), "utf-8");
  assert.ok(
    eventsContent.includes("confidence: (row.confidence as Confidence)") &&
    eventsContent.includes("datePrecision: (String(row.temporal_precision || \"exact-day\")) as Precision"),
    "lib/rewind/events.ts must map canonical confidence and datePrecision defaults"
  );
  const { mapDatabaseEvent } = await vite.ssrLoadModule("/lib/rewind/events.ts");
  const modEvt = mapDatabaseEvent({
    id: "evt-mod",
    confidence: null,
    confidence_score: 0.65,
  });
  assert.equal(
    modEvt.confidence,
    "moderate",
    "mapDatabaseEvent must fall back to 'moderate' when confidence is null and confidence_score < 0.7"
  );
  const confEvt = mapDatabaseEvent({
    id: "evt-conf",
    confidence: null,
    confidence_score: 0.85,
  });
  assert.equal(
    confEvt.confidence,
    "confirmed",
    "mapDatabaseEvent must fall back to 'confirmed' when confidence is null and confidence_score >= 0.7"
  );
});

test("verifies confidence and temporal precision fallbacks across components", () => {
  const cardContent = fs.readFileSync(path.join(root, "components/rewind/EventCard.tsx"), "utf-8");
  const timelineContent = fs.readFileSync(path.join(root, "components/rewind/PersonTimeline.tsx"), "utf-8");
  assert.ok(
    cardContent.includes('event.confidence || "limited"') &&
    cardContent.includes('event.datePrecision || event.timePrecision || "exact-day"'),
    "EventCard must apply consistent confidence and temporal precision fallbacks"
  );
  assert.ok(
    timelineContent.includes('event.confidence || "limited"') &&
    timelineContent.includes('event.timePrecision || event.datePrecision || "exact-day"'),
    "PersonTimeline must apply consistent confidence and temporal precision fallbacks"
  );
});

test("verifies TimelineComparison performance optimization and interactive empty state", () => {
  const compContent = fs.readFileSync(path.join(root, "components/rewind/TimelineComparison.tsx"), "utf-8");
  assert.ok(
    compContent.includes("peopleMap = useMemo(") &&
    compContent.includes("peopleMap.get(p.personId)"),
    "TimelineComparison must pre-index people in a map for O(1) co-attendee lookups"
  );
  assert.ok(
    compContent.includes("comparison-primary-switch-btn") &&
    compContent.includes("comparison-cycle-grid"),
    "TimelineComparison empty state must render prominent CTA switch button and candidate cycle grid"
  );
});

test("verifies WCAG 2.1 AA accessibility contracts across modals, explorers, and comparison views", () => {
  const citeContent = fs.readFileSync(path.join(root, "components/rewind/CitationModal.tsx"), "utf-8");
  const rewindContent = fs.readFileSync(path.join(root, "components/rewind/RewindExplorer.tsx"), "utf-8");
  const compContent = fs.readFileSync(path.join(root, "components/rewind/TimelineComparison.tsx"), "utf-8");

  assert.match(
    citeContent,
    /<[^>]*\bclassName="[^"]*citation-unavailable[^"]*"[^>]*\brole="alert"|<[^>]*\brole="alert"[^>]*\bclassName="[^"]*citation-unavailable[^"]*"/,
    "CitationModal must declare role='alert' on the citation-unavailable opening element"
  );
  assert.ok(
    rewindContent.includes("useMemo(") &&
    rewindContent.includes('aria-label="Filter by event type"') &&
    rewindContent.includes('aria-label="Filter by verification status"'),
    "RewindExplorer must memoize types and declare explicit aria-labels on filter selects"
  );
  assert.ok(
    compContent.includes('id="figure-1-badge"') &&
    compContent.includes('aria-describedby={personA ? "figure-1-badge" : undefined}') &&
    compContent.includes('id="figure-2-badge"') &&
    compContent.includes('aria-describedby="figure-2-badge"') &&
    compContent.includes('aria-label="Meeting Locations Geospatial Footprint"') &&
    compContent.includes('aria-label="Shared Joint Timeline Chronology"') &&
    compContent.includes('aria-labelledby={`encounter-title-${event.id}`}') &&
    compContent.includes('aria-live="polite"'),
    "TimelineComparison must provide connected ARIA badges, region landmark labeling, article semantics, and polite live regions"
  );
});

test("verifies TimelineComparison dynamic person defaults and RewindExplorer subject decoupling", () => {
  const compContent = fs.readFileSync(path.join(root, "components/rewind/TimelineComparison.tsx"), "utf-8");
  const compPageContent = fs.readFileSync(path.join(root, "app/compare/page.tsx"), "utf-8");
  const rewindContent = fs.readFileSync(path.join(root, "components/rewind/RewindExplorer.tsx"), "utf-8");
  const eventActionsContent = fs.readFileSync(path.join(root, "components/rewind/EventActions.tsx"), "utf-8");
  const eventsModuleContent = fs.readFileSync(path.join(root, "lib/rewind/events.ts"), "utf-8");
  const cmdPaletteContent = fs.readFileSync(path.join(root, "components/rewind/CommandPalette.tsx"), "utf-8");

  // 1. TimelineComparison dynamic defaults and co-attendee ranking
  assert.ok(
    compPageContent.includes("initialPersonA={personA?.slug}") &&
    compPageContent.includes("initialPersonB={initialPersonB}") &&
    compPageContent.includes("const initialPersonB = findTopCoAttendee(personA, people, allEvents);"),
    "app/compare/page.tsx must dynamically resolve initialPersonB based on top co-attendee using findTopCoAttendee"
  );
  assert.ok(
    compContent.includes("initialPersonA || people[0]?.slug || \"\"") &&
    compContent.includes("initialPersonB || (people.length > 1 ? people[1]?.slug : undefined)"),
    "TimelineComparison must dynamically default slugA and explicitSlugB from people array"
  );

  // 2. Event sources consistency and EventActions safe access
  assert.ok(
    eventsModuleContent.includes("sources: sources,") &&
    eventsModuleContent.includes(": [];\n\n  return {\n    id,\n    slug: String(row.slug || id),"),
    "lib/rewind/events.ts must always populate sources as an array instead of undefined"
  );
  assert.ok(
    eventActionsContent.includes("event.sources && event.sources.length > 0 ? event.sources[0] : undefined"),
    "EventActions must safely guard event.sources presence when invoking CitationModal"
  );

  // 3. CommandPalette search error handling
  assert.ok(
    cmdPaletteContent.includes("searchError") &&
    cmdPaletteContent.includes('role="alert"') &&
    cmdPaletteContent.includes("Search failed, please try again."),
    "CommandPalette must provide visual alert and live announcement on search failure"
  );

  // 4. RewindExplorer subject decoupling
  assert.ok(
    rewindContent.includes("subject = null") &&
    rewindContent.includes('subject ? subject.name : "All Events"'),
    "RewindExplorer must default subject to null and render 'All Events' when subject is omitted"
  );
});

test("verifies parseIsoDate timestamp rollover safeguard and relational query robustness", async () => {
  const { parseIsoDate } = await vite.ssrLoadModule("/lib/rewind/dates.ts");

  // 1. parseIsoDate timestamp rollover prevention
  assert.strictEqual(
    parseIsoDate("2023-02-30T10:00:00Z"),
    null,
    "parseIsoDate must return null for invalid calendar date with timestamp (February 30)"
  );
  assert.strictEqual(
    parseIsoDate("2023-02-29T12:00:00Z"),
    null,
    "parseIsoDate must return null for non-leap-year Feb 29 with timestamp"
  );
  assert.ok(
    parseIsoDate("2024-02-29T12:00:00Z") instanceof Date,
    "parseIsoDate must accept valid leap-year Feb 29 with timestamp"
  );
  assert.ok(
    parseIsoDate("2023-10-07T14:30:00Z") instanceof Date,
    "parseIsoDate must accept valid timestamp"
  );

  // 2. TimelineComparison Person B resolution
  const compContent = fs.readFileSync(path.join(root, "components/rewind/TimelineComparison.tsx"), "utf-8");
  assert.ok(
    compContent.includes("peopleMap.get(explicitSlugB)") &&
    compContent.includes("resolvedSlug !== effectiveSlugA"),
    "TimelineComparison must resolve explicitSlugB through peopleMap.get() and reject self-pairs, remaining authoritative even when not in peopleMap"
  );

  // 3. app/events/page.tsx error propagation
  const eventsPageContent = fs.readFileSync(path.join(root, "app/events/page.tsx"), "utf-8");
  assert.ok(
    eventsPageContent.includes("eventsResult.error ? (") &&
    eventsPageContent.includes("Events register temporarily unavailable"),
    "app/events/page.tsx must render an error alert when getAllEventsWithStatus fails"
  );

  // 4. lib/rewind/places.ts error propagation
  const placesContent = fs.readFileSync(path.join(root, "lib/rewind/places.ts"), "utf-8");
  assert.ok(
    placesContent.includes("if (eventsResult.error)") &&
    placesContent.includes("throw new Error(eventsResult.error);"),
    "lib/rewind/places.ts must fail place loading if getEvents reports an error"
  );

  // 5. lib/rewind/quotes.ts deterministic total ordering
  const quotesContent = fs.readFileSync(path.join(root, "lib/rewind/quotes.ts"), "utf-8");
  assert.ok(
    quotesContent.includes('.order("created_at", { ascending: false })') &&
    quotesContent.includes('.order("id", { ascending: true })'),
    "lib/rewind/quotes.ts must include secondary sort key id for deterministic pagination"
  );

  // 6. lib/rewind/events.ts database-side person participation filter and error propagation
  const eventsContent = fs.readFileSync(path.join(root, "lib/rewind/events.ts"), "utf-8");
  assert.ok(
    eventsContent.includes("event_people!inner(person_id)") &&
    eventsContent.includes('.eq("event_people.person_id", personData.id)') &&
    eventsContent.includes("error: personError.message") &&
    eventsContent.includes("error: placeError.message"),
    "lib/rewind/events.ts must use database-side event_people!inner filter and propagate lookup errors"
  );

  // 7. lib/rewind/relationships.ts zero-state
  const relContent = fs.readFileSync(path.join(root, "lib/rewind/relationships.ts"), "utf-8");
  assert.ok(
    relContent.includes("if (participations.length > 0) {") &&
    relContent.includes("return { data: [], error: null };") &&
    relContent.includes("const res = await getRelationshipsWithStatus();") &&
    relContent.includes("return res.data;"),
    "lib/rewind/relationships.ts must preserve the explicit zero-state and delegate through the status loader"
  );

  // 8. lib/rewind/sources.ts event_sources pagination and error handling
  const sourcesContent = fs.readFileSync(path.join(root, "lib/rewind/sources.ts"), "utf-8");
  assert.ok(
    sourcesContent.includes('.from("event_sources")') &&
    sourcesContent.includes('.order("event_id", { ascending: true })') &&
    sourcesContent.includes("if (esError) {\n              throw esError;\n            }"),
    "lib/rewind/sources.ts must paginate event_sources and propagate errors"
  );
});

test("verifies forensic styles, fallback participant slugs, and deprecated entity tags", () => {
  const mapGraphicContent = fs.readFileSync(path.join(root, "components/rewind/MapGraphic.tsx"), "utf-8");
  const typesContent = fs.readFileSync(path.join(root, "lib/rewind/types.ts"), "utf-8");
  const explorerContent = fs.readFileSync(path.join(root, "components/rewind/RewindExplorer.tsx"), "utf-8");
  const eventsContent = fs.readFileSync(path.join(root, "lib/rewind/events.ts"), "utf-8");

  // 1. MapGraphic environment style overrides
  assert.ok(
    mapGraphicContent.includes("process.env.NEXT_PUBLIC_MAPBOX_DARK_STYLE") &&
    mapGraphicContent.includes("process.env.NEXT_PUBLIC_MAPBOX_SATELLITE_STYLE"),
    "MapGraphic must check NEXT_PUBLIC_MAPBOX_DARK_STYLE and NEXT_PUBLIC_MAPBOX_SATELLITE_STYLE environment variables"
  );

  // 2. Types categories deprecated JSDoc
  assert.ok(
    typesContent.includes("@deprecated Legacy categorization tags retained strictly for backward compatibility"),
    "lib/rewind/types.ts must document categories as @deprecated in favor of eventTypes"
  );

  // 3. RewindExplorer DEFAULT_SUBJECT deprecated JSDoc
  assert.ok(
    explorerContent.includes("@deprecated Demo fallback subject. Production consumers should pass a dynamic subject"),
    "RewindExplorer must document DEFAULT_SUBJECT as @deprecated"
  );

  // 4. mapFallbackEvent participant slug population
  assert.ok(
    eventsContent.includes("slug: (p as { slug?: string }).slug || p.personId.replace(/^p-/, \"\")"),
    "lib/rewind/events.ts mapFallbackEvent must populate participant slug"
  );
});

test("verifies Codex P1 safeguards: migration integrity, production fallback guards, venue hydration, chunking, and date clarity", async () => {
  const { isStandardIsoDate } = await vite.ssrLoadModule("/lib/rewind/dates.ts");
  const migrationContent = fs.readFileSync(path.join(root, "supabase/migrations/20240904000000_supabase_architecture_cutover.sql"), "utf-8");
  const eventsContent = fs.readFileSync(path.join(root, "lib/rewind/events.ts"), "utf-8");
  const sourcesContent = fs.readFileSync(path.join(root, "lib/rewind/sources.ts"), "utf-8");
  const peopleContent = fs.readFileSync(path.join(root, "lib/rewind/people.ts"), "utf-8");
  const relContent = fs.readFileSync(path.join(root, "lib/rewind/relationships.ts"), "utf-8");
  const compContent = fs.readFileSync(path.join(root, "components/rewind/TimelineComparison.tsx"), "utf-8");
  const explorerContent = fs.readFileSync(path.join(root, "components/rewind/RewindExplorer.tsx"), "utf-8");

  // 1. Migration pre-index column alterations and published event evidence trigger
  assert.ok(
    migrationContent.includes("ALTER TABLE IF EXISTS public.events ADD COLUMN IF NOT EXISTS venue_id text REFERENCES public.venues(id)") &&
    migrationContent.includes("ALTER TABLE IF EXISTS public.events ADD COLUMN IF NOT EXISTS address_id text REFERENCES public.addresses(id)") &&
    migrationContent.includes("CREATE OR REPLACE FUNCTION public.verify_published_event_sources()") &&
    migrationContent.includes("CREATE CONSTRAINT TRIGGER trg_verify_published_event_sources"),
    "Migration must add column alterations before indexes and enforce evidence links on published events"
  );

  // 2. Production fallback guards across data access services
  assert.ok(
    eventsContent.includes('if (process.env.NODE_ENV === "production")') &&
    sourcesContent.includes('if (process.env.NODE_ENV === "production")') &&
    peopleContent.includes('if (process.env.NODE_ENV === "production")') &&
    relContent.includes('if (process.env.NODE_ENV === "production")'),
    "Data services must not expose archived prototype records in production environment"
  );

  // 3. Venue and address location hydration
  assert.ok(
    eventsContent.includes(".from(\"venues\")") &&
    eventsContent.includes(".from(\"addresses\")") &&
    eventsContent.includes("const venueId = row.venue_id ? String(row.venue_id) : \"\";") &&
    eventsContent.includes("const addressId = row.address_id ? String(row.address_id) : \"\";"),
    "lib/rewind/events.ts must hydrate venues and addresses into event location data"
  );

  // 4. Bounded chunking for event relation queries
  assert.ok(
    eventsContent.includes("const EVENT_ID_CHUNK_SIZE = 100;") &&
    eventsContent.includes("const eventIdChunk = eventIds.slice(eIdx, eIdx + EVENT_ID_CHUNK_SIZE);"),
    "lib/rewind/events.ts must chunk eventIds into bounded batches to avoid request-line overflow"
  );

  // 5. TimelineComparison strict PersonRecord | null typing
  assert.ok(
    compContent.includes("(): PersonRecord | null =>") &&
    compContent.includes("(effectiveSlugA ? peopleMap.get(effectiveSlugA) || people.find((p) => p.slug === effectiveSlugA) : null) || null") &&
    compContent.includes("(slugB ? peopleMap.get(slugB) || people.find((p) => p.slug === slugB) : null) || null"),
    "TimelineComparison must type personA and personB strictly as PersonRecord | null"
  );

  // 6. Date clarity and standard ISO validation
  assert.strictEqual(isStandardIsoDate("2023-10-07"), true);
  assert.strictEqual(isStandardIsoDate("2023-10-07T14:30:00Z"), true);
  assert.strictEqual(isStandardIsoDate("Spring 1999"), false);
  assert.strictEqual(isStandardIsoDate("2023-02-30"), false);
  assert.ok(
    explorerContent.includes("!isStandardIsoDate(event.startDate)") &&
    explorerContent.includes("title={!isStandardIsoDate(event.startDate) ? \"Non-standard archival date format\" : undefined}"),
    "RewindExplorer must indicate non-standard archival date formats in UI"
  );

  // 7. RewindExplorer index state synchronization
  assert.ok(
    explorerContent.includes("currentIndex >= filtered.length") &&
    explorerContent.includes("setIndex((currentIndex) => {"),
    "RewindExplorer must synchronize and bound index state when filtered events change"
  );
});

test("verifies Codex & CodeRabbit review fixes: precision date formatting, quote hydration, trigger protections, and fallback robustness", async () => {
  const { formatTimelineDate } = await vite.ssrLoadModule("/lib/rewind/dates.ts");

  // 1. Precision-aware date formatting and archival fallback preservation
  const expectedMonth = new Intl.DateTimeFormat("en-GB", { month: "short" }).format(new Date(1993, 8, 1));
  assert.strictEqual(formatTimelineDate("1993", "year"), "1993");
  assert.strictEqual(formatTimelineDate("1993-09", "month"), `${expectedMonth} 1993`);
  assert.strictEqual(formatTimelineDate("1993-09-13"), `13 ${expectedMonth} 1993`);
  assert.strictEqual(formatTimelineDate("Spring 1999"), "Spring 1999");
  assert.strictEqual(formatTimelineDate(""), "");

  // 2. Migration timestamp columns, default resets, and event_sources constraint trigger
  const migrationContent = fs.readFileSync(
    path.join(root, "supabase/migrations/20240904000000_supabase_architecture_cutover.sql"),
    "utf-8"
  );
  assert.ok(
    migrationContent.includes("ALTER TABLE IF EXISTS public.sources ADD COLUMN IF NOT EXISTS created_at") &&
    migrationContent.includes("ALTER TABLE IF EXISTS public.quotes ADD COLUMN IF NOT EXISTS created_at"),
    "Migration must add created_at timestamps when upgrading existing source/quote tables"
  );
  assert.ok(
    migrationContent.includes("ALTER TABLE IF EXISTS public.events ALTER COLUMN publication_status SET DEFAULT 'draft'") &&
    migrationContent.includes("ALTER TABLE IF EXISTS public.events ALTER COLUMN verification_status SET DEFAULT 'provisional'") &&
    migrationContent.includes("ALTER TABLE IF EXISTS public.events ALTER COLUMN publication_lane SET DEFAULT 'human-review'") &&
    migrationContent.includes("ALTER TABLE IF EXISTS public.people ALTER COLUMN publication_status SET DEFAULT 'draft'"),
    "Migration must restore safe draft and provisional defaults during existing database upgrades"
  );
  assert.ok(
    migrationContent.includes("CREATE CONSTRAINT TRIGGER trg_verify_event_sources_deletion") &&
    migrationContent.includes("AFTER DELETE OR UPDATE OF event_id ON public.event_sources"),
    "Migration must enforce trg_verify_event_sources_deletion deferred constraint trigger"
  );
  assert.ok(
    migrationContent.includes("CREATE TRIGGER trg_sources_updated_at") &&
    migrationContent.includes("BEFORE UPDATE ON public.sources") &&
    migrationContent.includes("SET search_path = ''") &&
    migrationContent.includes("NEW.updated_at = pg_catalog.now();"),
    "Migration must maintain a search-path-safe set_updated_at trigger on public.sources"
  );

  // 3. Quotes hydration, pagination & error propagation in lib/rewind/events.ts
  const eventsContent = fs.readFileSync(path.join(root, "lib/rewind/events.ts"), "utf-8");
  assert.ok(
    eventsContent.includes('.from("quotes")') &&
    eventsContent.includes("quotes: quotesMap?.get(id)") &&
    eventsContent.includes("if (venueError) {") &&
    eventsContent.includes("throw venueError;") &&
    eventsContent.includes("if (addressError) {") &&
    eventsContent.includes("throw addressError;") &&
    eventsContent.includes("Promise<{ data: EventRecord | null; error: string | null }>"),
    "events.ts must hydrate quotes from database, paginate, and propagate venue/address errors"
  );

  // 4. PersonTimeline limited confidence default and fixed viewport console
  const ptContent = fs.readFileSync(path.join(root, "components/rewind/PersonTimeline.tsx"), "utf-8");
  assert.ok(
    ptContent.includes('Confidence: ${event.confidence || "limited"}') &&
    ptContent.includes('{event.confidence || "limited"}'),
    "PersonTimeline must render 'limited' rather than 'confirmed' when confidence is absent"
  );

  const cssContent = fs.readFileSync(path.join(root, "app/globals.css"), "utf-8");
  assert.ok(
    hasConsoleStickiness(cssContent, ".rewind-console") &&
    hasConsoleStickiness(cssContent, ".person-time-console") &&
    cssBlockContains(cssContent, ".rewind-workspace", [/\bpadding-bottom\s*:\s*120px\s*(?:;|$)/]) &&
    cssBlockContains(cssContent, ".person-time-machine", [/\bpadding-bottom\s*:\s*125px\s*(?:;|$)/]),
    "globals.css must keep timeline consoles fixed to the viewport with matching bottom padding per AGENTS.md"
  );

  // 5. DiscrepancyViewer metadata fallback and unestablished confidence
  const discContent = fs.readFileSync(path.join(root, "components/rewind/DiscrepancyViewer.tsx"), "utf-8");
  assert.ok(
    discContent.includes('event.medium?.length ? event.medium : event.eventTypes?.length ? event.eventTypes : event.categories?.length ? event.categories : ["Archival record"]') &&
    discContent.includes('const confidenceDisplay = confidence ? confidence.toUpperCase() : "UNESTABLISHED";'),
    "DiscrepancyViewer must handle empty metadata arrays and unestablished confidence display"
  );

  // 6. TimelineComparison unknown slug fallback
  const compContent = fs.readFileSync(path.join(root, "components/rewind/TimelineComparison.tsx"), "utf-8");
  assert.ok(
    compContent.includes("if (slugA && peopleMap.has(slugA)) return slugA;") &&
    compContent.includes('return people[0]?.slug || "";'),
    "TimelineComparison must validate requested primary slug against peopleMap with fallback"
  );
});

test("verifies CARTO Basemaps API key integration across MapGraphic and environment templates", () => {
  const root = process.cwd();
  const mapGraphicContent = fs.readFileSync(path.join(root, "components/rewind/MapGraphic.tsx"), "utf-8");
  const envExampleContent = fs.readFileSync(path.join(root, ".env.example"), "utf-8");

  // 1. MapGraphic CARTO_API_KEY support
  assert.ok(
    mapGraphicContent.includes("process.env.NEXT_PUBLIC_CARTO_API_KEY") &&
    mapGraphicContent.includes("process.env.NEXT_PUBLIC_CARTO_BASEMAPS_API_KEY"),
    "MapGraphic must check NEXT_PUBLIC_CARTO_API_KEY and NEXT_PUBLIC_CARTO_BASEMAPS_API_KEY"
  );

  assert.ok(
    mapGraphicContent.includes("key=") &&
    mapGraphicContent.includes("cartocdn.com"),
    "MapGraphic must propagate CARTO API key to raster and vector requests with key= parameter"
  );

  // 2. .env.example declaration
  assert.ok(
    envExampleContent.includes("NEXT_PUBLIC_CARTO_API_KEY="),
    ".env.example must declare NEXT_PUBLIC_CARTO_API_KEY"
  );
});
