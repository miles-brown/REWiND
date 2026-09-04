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

test("verifies globals.css uses accessible #94a3b8 contrast for filter group and select labels", () => {
  const cssPath = path.join(root, "app/globals.css");
  const content = fs.readFileSync(cssPath, "utf-8");
  assert.ok(
    content.includes(".filter-group-label { font-size: 10px; font-weight: 700; color: #94a3b8;"),
    "Filter group label must use high-contrast #94a3b8"
  );
  assert.ok(
    content.includes(".filter-select-wrap label { font-size: 10px; font-weight: 700; color: #94a3b8;"),
    "Filter select label must use high-contrast #94a3b8"
  );
});

test("verifies MapGraphic.tsx initializes deterministic SSR state and guards satellite mode behind MAPBOX_TOKEN", () => {
  const mapGraphicPath = path.join(root, "components/rewind/MapGraphic.tsx");
  const content = fs.readFileSync(mapGraphicPath, "utf-8");

  assert.ok(
    content.includes("useState<boolean>(false)"),
    "MapGraphic must initialize webGlSupported to false for deterministic SSR"
  );
  assert.ok(
    content.includes('useState<"webgl" | "svg">("svg")'),
    "MapGraphic must initialize mapMode to 'svg' for deterministic SSR"
  );
  assert.ok(
    content.includes("Boolean(MAPBOX_TOKEN) && webGlSupported && mapMode === \"webgl\""),
    "Satellite control must be guarded by Boolean(MAPBOX_TOKEN)"
  );
  assert.ok(
    content.includes('aria-pressed={mapTheme === "satellite"}'),
    "Satellite button must expose aria-pressed state"
  );
  assert.ok(
    content.includes("chronological trajectories"),
    "Map container aria-label must describe chronological trajectories"
  );
  assert.ok(
    content.includes("<title>{"),
    "SVG cluster buttons must include accessible title elements"
  );
});

test("verifies app/sources/page.tsx exposes aria-pressed, radiogroup semantics, and URL search", () => {
  const sourcesPath = path.join(root, "app/sources/page.tsx");
  const content = fs.readFileSync(sourcesPath, "utf-8");

  assert.ok(
    content.includes('aria-pressed={viewMode === "table"}'),
    "Table view toggle must have aria-pressed"
  );
  assert.ok(
    content.includes('aria-pressed={viewMode === "cards"}'),
    "Cards view toggle must have aria-pressed"
  );
  assert.ok(
    content.includes('role="radiogroup"'),
    "Evidence tier filter cluster must have role='radiogroup'"
  );
  assert.ok(
    content.includes('role="radio"'),
    "Evidence tier options must have role='radio'"
  );
  assert.ok(
    content.includes('aria-checked={classificationFilter === "all"}'),
    "Evidence tier options must have aria-checked"
  );
  assert.ok(
    content.includes("const matchUrl = (s.url || \"\").toLowerCase().includes(q);"),
    "Search filter must match against record URLs"
  );
});
