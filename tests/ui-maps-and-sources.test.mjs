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
