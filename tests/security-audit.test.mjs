import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));

function getAllTrackedSourceFiles(dir) {
  let files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!["node_modules", ".git", ".next", "dist", ".wrangler", "scratch"].includes(entry.name)) {
        files = files.concat(getAllTrackedSourceFiles(fullPath));
      }
    } else if (
      entry.isFile() &&
      /\.(ts|tsx|js|mjs|json|yml|yaml|env\.example)$/.test(entry.name) &&
      !entry.name.endsWith(".local")
    ) {
      files.push(fullPath);
    }
  }
  return files;
}

test("verifies gitignore protects sensitive environment files", () => {
  const gitignorePath = path.join(root, ".gitignore");
  assert.ok(fs.existsSync(gitignorePath), ".gitignore must exist");
  const content = fs.readFileSync(gitignorePath, "utf-8");

  assert.match(content, /\.env\*\.local|\.env\.local/, ".gitignore must ignore .env.local files");
  assert.match(content, /\.env\.production/, ".gitignore must ignore .env.production");
});

test("scans source files for leaked secrets and high-entropy private credentials", () => {
  const files = getAllTrackedSourceFiles(root);
  const leakedOccurrences = [];

  const secretPatterns = [
    { name: "RSA Private Key", regex: /-----BEGIN\s+(RSA\s+)?PRIVATE\s+KEY-----/ },
    { name: "GitHub Personal Access Token", regex: /\bghp_[a-zA-Z0-9]{36}\b/ },
    { name: "Stripe Live Secret Key", regex: /\bsk_live_[0-9a-zA-Z]{24,}\b/ },
    { name: "AWS Secret Access Key", regex: /\b(?<![A-Z0-9])[A-Z0-9]{20}\b(?=.*[A-Za-z0-9/+=]{40})/ },
  ];

  for (const filePath of files) {
    const relPath = path.relative(root, filePath);
    // Skip test files testing the patterns themselves
    if (relPath.includes("tests/security-audit.test.mjs")) continue;

    const content = fs.readFileSync(filePath, "utf-8");

    for (const pattern of secretPatterns) {
      if (pattern.regex.test(content)) {
        leakedOccurrences.push({
          file: relPath,
          pattern: pattern.name,
        });
      }
    }
  }

  assert.deepEqual(
    leakedOccurrences,
    [],
    `Found potential leaked credentials in tracked files:\n` + JSON.stringify(leakedOccurrences, null, 2)
  );
});
