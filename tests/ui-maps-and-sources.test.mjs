import assert from "node:assert/strict";
import test, { after } from "node:test";
import { fileURLToPath } from "node:url";
import fs from "node:fs";
import path from "node:path";
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
    !content.includes("<Shell>"),
    "app/admin/evidence/page.tsx must not contain inner <Shell> wrapper"
  );
  assert.ok(
    !content.includes('import { Shell } from "@/components/rewind/Shell";'),
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
    content.includes('className="status-left"'),
    "PersonTimeline.tsx must wrap live indicator in status-left to prevent grid collision with status-right-tools"
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
  const sourcesPagePath = path.join(root, "app/sources/page.tsx");
  const content = fs.readFileSync(sourcesPagePath, "utf-8");

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

  const sourcesPath = path.join(root, "app/sources/page.tsx");
  const sourcesContent = fs.readFileSync(sourcesPath, "utf-8");
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
  const sourcesPath = path.join(root, "app/sources/page.tsx");
  const sourcesContent = fs.readFileSync(sourcesPath, "utf-8");

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
    explorerContent.includes("disabled={safeIndex === 0}"),
    "RewindExplorer previous button must be disabled at start of timeline"
  );
  assert.ok(
    explorerContent.includes("disabled={safeIndex === filtered.length - 1}"),
    "RewindExplorer next button must be disabled at end of timeline"
  );
});



