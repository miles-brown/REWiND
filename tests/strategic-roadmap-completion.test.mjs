import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { createServer } from "vite";

const root = process.cwd();

let vite;
test.before(async () => {
  vite = await createServer({
    appType: "custom",
    configFile: false,
    root,
    resolve: { alias: { "@": root } },
    server: { middlewareMode: true },
  });
});

test.after(async () => {
  if (vite) await vite.close();
});

test("verifies Task 14: Relationship Network Topology Graph & Accessibility", async () => {
  const comp = fs.readFileSync(path.join(root, "components/rewind/RelationshipNetworkGraph.tsx"), "utf-8");
  assert.ok(comp.includes("export function RelationshipNetworkGraph"), "Must export RelationshipNetworkGraph");
  assert.ok(comp.includes("role=\"region\""), "Must have accessible region roles");
  assert.ok(comp.includes("aria-label=\"Relationship Network Table\""), "Must have accessible table view fallback");
  assert.ok(comp.includes("<svg"), "Must render SVG topology canvas");
});

test("verifies Task 19: Official State Gazette Ingestion Adapter", async () => {
  const { ingestOfficialGazette } = await vite.ssrLoadModule("/lib/ingestion/adapters/official-gazette.ts");

  const gazetteRes = ingestOfficialGazette({
    gazetteId: "boe-20140619-01",
    gazetteName: "Boletín Oficial del Estado (BOE)",
    country: "Spain",
    publicationDate: "2014-06-19",
    documentTitle: "Proclamación de Su Majestad el Rey Don Felipe VI ante las Cortes Generales",
    signatory: "King Felipe VI",
    signatoryRole: "Rey de España",
    text: "En el día de hoy, ante las Cortes Generales reunidas en sesión conjunta, ha prestado juramento Su Majestad el Rey Don Felipe VI.",
    url: "https://www.boe.es/diario_boe/txt.php?id=BOE-A-2014-6475",
  });

  assert.ok(gazetteRes.candidateId, "Must generate candidateId");
  assert.ok(gazetteRes.fingerprint, "Must generate deduplication fingerprint");
  assert.equal(gazetteRes.policy.isEligible, true, "Must be eligible under Tier-A policy with resolved sovereign signatory");
  assert.equal(gazetteRes.policy.lane, "auto-publish", "Must assign auto-publish lane");
});

test("verifies Task 21: Forensic Evidence Dossier PDF Exporter Routes", async () => {
  const personExport = fs.readFileSync(path.join(root, "app/api/export/person/[slug]/pdf/route.ts"), "utf-8");
  const eventExport = fs.readFileSync(path.join(root, "app/api/export/event/[slug]/pdf/route.ts"), "utf-8");

  assert.ok(personExport.includes("X-Forensic-Checksum"), "Person export must attach forensic checksum header");
  assert.ok(personExport.includes("createHash(\"sha256\")"), "Person export must compute SHA-256 digest");
  assert.ok(eventExport.includes("X-Forensic-Checksum"), "Event export must attach forensic checksum header");
  assert.ok(eventExport.includes("createHash(\"sha256\")"), "Event export must compute SHA-256 digest");
});

test("verifies Task 22: Academic Citation Suite with RIS and CSL-JSON", async () => {
  const { formatRIS, formatCSLJSON, formatBibTeX } = await vite.ssrLoadModule("/lib/citations.ts");

  const sampleSource = {
    id: "src-boe-20140619",
    title: "Boletín Oficial del Estado: Proclamación de Felipe VI",
    publisher: "Agencia Estatal Boletín Oficial del Estado",
    publicationDate: "2014-06-19",
    url: "https://boe.es/diario_boe/txt.php?id=BOE-A-2014-6476",
    authors: ["Reino de España"],
  };

  const ris = formatRIS(sampleSource);
  assert.ok(ris.startsWith("TY  -"), "RIS must have standard TY header");
  assert.ok(ris.includes("TI  - Boletín Oficial del Estado: Proclamación de Felipe VI"), "RIS must include title");
  assert.ok(ris.includes("ER  -"), "RIS must terminate with ER");

  const cslJson = formatCSLJSON(sampleSource);
  const parsed = JSON.parse(cslJson);
  assert.equal(parsed.title, sampleSource.title, "CSL-JSON must be valid JSON with matching title");

  const bibtex = formatBibTeX(sampleSource);
  assert.ok(bibtex.startsWith("@misc{"), "BibTeX must produce valid entry");
});

test("verifies Task 23: Dynamic OpenGraph Metadata Edge Cards", async () => {
  const personOg = fs.readFileSync(path.join(root, "app/person/[slug]/opengraph-image.tsx"), "utf-8");
  const eventOg = fs.readFileSync(path.join(root, "app/event/[slug]/opengraph-image.tsx"), "utf-8");

  assert.ok(personOg.includes("export const runtime = \"edge\""), "Person OG must use Edge runtime");
  assert.ok(personOg.includes("new ImageResponse"), "Person OG must return ImageResponse");
  assert.ok(eventOg.includes("export const runtime = \"edge\""), "Event OG must use Edge runtime");
  assert.ok(eventOg.includes("new ImageResponse"), "Event OG must return ImageResponse");
});

test("verifies Task 26: Automated Source Trust Score Recalculator", async () => {
  const { calculateSourceTrustScores } = await vite.ssrLoadModule("/scripts/calculate-source-trust.ts");
  const scores = calculateSourceTrustScores();

  assert.ok(scores.length > 50, "Must calculate trust scores for all registered sources");
  assert.ok(scores.every((s) => s.computedTrustScore >= 0.1 && s.computedTrustScore <= 1.0), "All scores must be bounded in [0.1, 1.0]");
  const authoritative = scores.filter((s) => s.epistemicCategory === "authoritative");
  assert.ok(authoritative.length > 0, "Must identify authoritative primary records");
});

test("verifies Task 27: Spatial Coordinate Verification & QA", async () => {
  const { verifyAllSpatialCoordinates } = await vite.ssrLoadModule("/scripts/verify-spatial-coordinates.ts");
  const anomalies = verifyAllSpatialCoordinates();

  const errors = anomalies.filter((a) => a.severity === "error");
  assert.equal(errors.length, 0, "Must have zero fatal coordinate errors in corpus");
});

test("verifies Task 28: Dark/Light Mode Theme Tokens in app/globals.css", () => {
  const css = fs.readFileSync(path.join(root, "app/globals.css"), "utf-8");
  assert.ok(css.includes("[data-theme=\"light\"]"), "Must define data-theme=\"light\" tokens");
  assert.ok(css.includes("[data-theme=\"dark\"]"), "Must define data-theme=\"dark\" tokens");
  assert.ok(css.includes("--bg-primary:"), "Must define --bg-primary token");
  assert.ok(css.includes("--text-primary:"), "Must define --text-primary token");
  assert.ok(css.includes("--accent-primary:"), "Must define --accent-primary token");
});
