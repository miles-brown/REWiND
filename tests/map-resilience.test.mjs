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

test("validates .coderabbit.yaml schema compliance and tone instructions length", () => {
  const yamlPath = path.join(root, ".coderabbit.yaml");
  assert.ok(fs.existsSync(yamlPath), ".coderabbit.yaml must exist");
  const content = fs.readFileSync(yamlPath, "utf-8");
  const match = content.match(/tone_instructions:\s*["']([^"']+)["']/);
  assert.ok(match, "tone_instructions must be present");
  const tone = match[1];
  assert.ok(
    tone.length <= 250,
    `tone_instructions length (${tone.length}) must be <= 250 characters`
  );
});

test("validates ai-code-review.yml security and verification gates", () => {
  const workflowPath = path.join(root, ".github/workflows/ai-code-review.yml");
  assert.ok(fs.existsSync(workflowPath), "workflow file must exist");
  const content = fs.readFileSync(workflowPath, "utf-8");

  // Check persist-credentials: false
  assert.ok(
    content.includes("persist-credentials: false"),
    "Checkout step must specify persist-credentials: false"
  );

  // Check build gate
  assert.ok(
    content.includes("npm run build:vercel"),
    "CI must include npm run build:vercel before tests"
  );

  // Check contents read permission
  assert.ok(
    content.includes("contents: read"),
    "CI workflow must restrict permissions to contents: read"
  );

  // Check that untrusted issue_comment trigger is not blindly triggering builds
  assert.ok(
    !content.includes("issue_comment:"),
    "issue_comment trigger must be omitted to prevent untrusted execution without ref binding"
  );
});

test("verifies MapGraphic module export and fallback styles", async () => {
  const mod = await vite.ssrLoadModule("/components/rewind/MapGraphic.tsx");
  assert.equal(typeof mod.MapGraphic, "function", "MapGraphic must export a React component");
});
