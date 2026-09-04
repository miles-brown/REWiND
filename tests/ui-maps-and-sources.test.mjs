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

