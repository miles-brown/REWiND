#!/usr/bin/env node

/**
 * REWiND Git Workflow & PR Branch Invariant Validator
 * Programmatically validates:
 * 1. PR Branch Isolation: Target base is strictly 'main'.
 * 2. Documentation synchronization for all 4 PR rules in AGENTS.md, CONTRIBUTING.md, and guides.
 * 3. Configuration enforcement in .coderabbit.yaml and GitHub Action workflows.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));

function checkFileContains(relativePath, requiredStrings) {
  const fullPath = path.join(root, relativePath);
  if (!fs.existsSync(fullPath)) {
    console.error(`❌ Missing required file: ${relativePath}`);
    process.exit(1);
  }
  const content = fs.readFileSync(fullPath, "utf-8");
  for (const str of requiredStrings) {
    if (!content.includes(str)) {
      console.error(`❌ Invariant failure in ${relativePath}: Expected to find "${str}"`);
      process.exit(1);
    }
  }
}

console.log("🔍 Checking REWiND PR Branch Isolation and Anti-Cascade Invariants...");

// 1. Verify AGENTS.md
checkFileContains("AGENTS.md", [
  "Rule 1: Single Canonical Base (`--base main`)",
  "Rule 2: Foundation-First Modular Delivery",
  "Rule 3: Rebase Instead of Stack",
  "Rule 4: Safe Deletion & Cascade Prevention",
]);

// 2. Verify docs/CONTRIBUTING.md
checkFileContains("docs/CONTRIBUTING.md", [
  "Rule 1: Single Canonical Base (`--base main`)",
  "Rule 2: Foundation-First Modular Delivery",
  "Rule 3: Rebase Instead of Stack",
  "Rule 4: Safe Deletion & Cascade Prevention",
]);

// 3. Verify docs/guides/getting-started.md
checkFileContains("docs/guides/getting-started.md", [
  "Pull Requests & Branch Isolation",
  "--base main",
]);

// 4. Verify .coderabbit.yaml base_branches configuration
const yamlPath = path.join(root, ".coderabbit.yaml");
if (!fs.existsSync(yamlPath)) {
  console.error("❌ Missing required file: .coderabbit.yaml");
  process.exit(1);
}
const yamlContent = fs.readFileSync(yamlPath, "utf-8");
const baseBranchesMatch = yamlContent.match(/base_branches:\s*\n((\s+-\s+["']?[^"'\n]+["']?\s*\n?)+)/);
if (!baseBranchesMatch) {
  console.error("❌ Invariant failure in .coderabbit.yaml: 'base_branches' array not found.");
  process.exit(1);
}
const baseBranches = baseBranchesMatch[1]
  .split("\n")
  .map((line) => line.replace(/^\s*-\s*["']?|["']?\s*$/g, "").trim())
  .filter(Boolean);

if (baseBranches.length !== 1 || baseBranches[0] !== "main") {
  console.error(`❌ Invariant failure in .coderabbit.yaml: base_branches must strictly contain ['main'], found ${JSON.stringify(baseBranches)}.`);
  process.exit(1);
}

// 5. In CI environment, verify that PR base branch is strictly 'main'
const githubBaseRef = process.env.GITHUB_BASE_REF;
if (githubBaseRef) {
  if (githubBaseRef !== "main") {
    console.error(`❌ Rule 1 Violation: Pull request must target 'main'. Found base branch '${githubBaseRef}'. Refer to AGENTS.md for details.`);
    process.exit(1);
  }
  console.log(`✅ CI PR Target Verification: PR base ref is correctly '${githubBaseRef}'.`);
}

const githubHeadRef = process.env.GITHUB_HEAD_REF;
if (githubHeadRef && githubHeadRef === "main") {
  console.error("❌ Rule 1 Violation: Pull request head branch cannot be 'main'.");
  process.exit(1);
}

console.log("✅ All 4 PR branch isolation & anti-cascade rules verified in docs and configuration.");
process.exit(0);
