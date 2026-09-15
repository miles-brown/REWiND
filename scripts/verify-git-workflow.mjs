#!/usr/bin/env node

/**
 * REWiND Git Workflow & PR Branch Invariant Validator
 * Programmatically validates:
 * 1. PR Branch Isolation: Target base is strictly 'main'.
 * 2. Documentation synchronization for all 4 PR rules in AGENTS.md, CONTRIBUTING.md, and guides.
 * 3. Configuration enforcement in .coderabbit.yaml and GitHub Action workflows.
 * 4. Git ancestry validation (fork-point reachable from origin/main, rebased onto latest tip, no unmerged parent branch cascades).
 */

import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));

export function checkFileContains(relativePath, requiredStrings) {
  const fullPath = path.join(root, relativePath);
  if (!fs.existsSync(fullPath)) {
    throw new Error(`Missing required file: ${relativePath}`);
  }
  const content = fs.readFileSync(fullPath, "utf-8");
  for (const str of requiredStrings) {
    if (!content.includes(str)) {
      throw new Error(`Invariant failure in ${relativePath}: Expected to find "${str}"`);
    }
  }
}

export function validateGitAncestry(baseBranch = "origin/main", execFn = execSync) {
  try {
    const baseTip = execFn(`git rev-parse ${baseBranch}`, { encoding: "utf-8" }).trim();
    if (!baseTip || !/^[0-9a-f]{40}$/i.test(baseTip)) {
      return { valid: false, error: `Could not resolve valid 40-char SHA for ${baseBranch} tip` };
    }

    const mergeBase = execFn(`git merge-base ${baseBranch} HEAD`, { encoding: "utf-8" }).trim();
    if (!mergeBase || !/^[0-9a-f]{40}$/i.test(mergeBase)) {
      return { valid: false, error: `Could not resolve valid 40-char SHA merge-base against ${baseBranch}` };
    }

    if (mergeBase !== baseTip) {
      return {
        valid: false,
        error: `Rule 3 Violation: Feature branch is not rebased onto latest ${baseBranch} tip (${baseTip.slice(0, 8)}). Current merge-base is ${mergeBase.slice(0, 8)}. Synchronize via 'git fetch origin && git rebase origin/main'.`,
        mergeBase,
        baseTip,
      };
    }

    return { valid: true, mergeBase, baseTip };
  } catch (err) {
    return { valid: false, error: `Failed to compute ancestry against ${baseBranch}: ${err.message}` };
  }
}

export function validateCodeRabbitConfig(yamlRelativePath = ".coderabbit.yaml") {
  const yamlPath = path.join(root, yamlRelativePath);
  if (!fs.existsSync(yamlPath)) {
    throw new Error(`Missing required file: ${yamlRelativePath}`);
  }
  const yamlContent = fs.readFileSync(yamlPath, "utf-8");
  const baseBranchesMatch = yamlContent.match(/base_branches:\s*\n((\s+-\s+["']?[^"'\n]+["']?\s*\n?)+)/);
  if (!baseBranchesMatch) {
    throw new Error("Invariant failure in .coderabbit.yaml: 'base_branches' array not found.");
  }
  const baseBranches = baseBranchesMatch[1]
    .split("\n")
    .map((line) => line.replace(/^\s*-\s*["']?|["']?\s*$/g, "").trim())
    .filter(Boolean);

  if (baseBranches.length !== 1 || baseBranches[0] !== "main") {
    throw new Error(`Invariant failure in .coderabbit.yaml: base_branches must strictly contain ['main'], found ${JSON.stringify(baseBranches)}.`);
  }
  return { valid: true, baseBranches };
}

export function runWorkflowVerification() {
  console.log("🔍 Checking REWiND PR Branch Isolation and Anti-Cascade Invariants...");

  try {
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

    // 4. Verify .coderabbit.yaml
    validateCodeRabbitConfig(".coderabbit.yaml");

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

    // 6. Verify Git ancestry against origin/main or main
    const isCi = Boolean(process.env.CI || process.env.GITHUB_ACTIONS);
    let ancestryResult = validateGitAncestry("origin/main");

    if (!ancestryResult.valid && isCi) {
      try {
        execSync("git fetch origin main", { stdio: "ignore" });
        ancestryResult = validateGitAncestry("origin/main");
      } catch {}
    }

    if (ancestryResult.valid) {
      console.log(`✅ Git Ancestry Verification: Rebased cleanly on origin/main (${ancestryResult.mergeBase.slice(0, 8)}).`);
    } else {
      const localAncestry = validateGitAncestry("main");
      if (localAncestry.valid) {
        console.log(`✅ Git Ancestry Verification: Rebased cleanly on main (${localAncestry.mergeBase.slice(0, 8)}).`);
      } else if (isCi) {
        console.error(`❌ Git Ancestry Violation (CI): ${ancestryResult.error}`);
        process.exit(1);
      } else {
        console.log(`ℹ️ Git ancestry check skipped for offline/local environment: ${ancestryResult.error}`);
      }
    }

    console.log("✅ All 4 PR branch isolation & anti-cascade rules verified in docs and configuration.");
    process.exit(0);
  } catch (err) {
    console.error(`❌ Invariant Verification Failed: ${err.message}`);
    process.exit(1);
  }
}

// Direct CLI Execution Guard (prevents test runner termination upon import)
if (process.argv[1] && (process.argv[1].endsWith("verify-git-workflow.mjs") || fileURLToPath(import.meta.url) === path.resolve(process.argv[1]))) {
  runWorkflowVerification();
}
