import assert from "node:assert/strict";
import test, { after } from "node:test";
import { fileURLToPath } from "node:url";
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

test("exports Supabase client configurations and server factory", async () => {
  const { isSupabaseConfigured } = await vite.ssrLoadModule("/lib/supabase/client.ts");
  const { getSupabaseServerClient, isSupabaseServerConfigured } = await vite.ssrLoadModule("/lib/supabase/server.ts");

  assert.equal(typeof isSupabaseConfigured, "boolean");
  assert.equal(typeof isSupabaseServerConfigured, "boolean");
  assert.equal(typeof getSupabaseServerClient, "function");
});

test("provides healthy database instance and in-memory store fallback", async () => {
  const { getDb, getRelationalStore, isLiveDbConnected } = await vite.ssrLoadModule("/lib/db/client.ts");

  assert.equal(typeof isLiveDbConnected, "boolean");
  assert.equal(typeof getDb, "function");

  const store = getRelationalStore();
  assert.ok(store.people.length > 0);
  assert.ok(store.events.length > 0);
  assert.ok(store.sources.length > 0);
  assert.ok(store.places.length > 0);
});

test("verifies PostgreSQL schema entities and table definitions", async () => {
  const schema = await vite.ssrLoadModule("/db/schema.ts");

  assert.ok(schema.people);
  assert.ok(schema.places);
  assert.ok(schema.events);
  assert.ok(schema.sources);
  assert.ok(schema.claims);
  assert.ok(schema.candidateEvents);
  assert.ok(schema.reviewDecisions);
  assert.ok(schema.auditLog);
  assert.ok(schema.coverageProgrammes);
});
