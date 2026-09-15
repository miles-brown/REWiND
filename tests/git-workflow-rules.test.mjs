import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import {
  getOpenChildPrs,
  safeMergeAndCleanBranch,
  validateBranchTarget,
  validateSafeBranchDeletion,
} from "../scripts/safe-branch-merge.mjs";

const root = fileURLToPath(new URL("..", import.meta.url));

test("validates Rule 1: Single Canonical Base (main) in documentation and config", () => {
  // Check AGENTS.md
  const agentsPath = path.join(root, "AGENTS.md");
  assert.ok(fs.existsSync(agentsPath), "AGENTS.md must exist");
  const agentsContent = fs.readFileSync(agentsPath, "utf-8");
  assert.ok(
    agentsContent.includes("--base main"),
    "AGENTS.md must mandate --base main for all PRs"
  );
  assert.ok(
    agentsContent.includes("Single Canonical Base"),
    "AGENTS.md must define Single Canonical Base invariant"
  );

  // Check docs/CONTRIBUTING.md
  const contribPath = path.join(root, "docs/CONTRIBUTING.md");
  assert.ok(fs.existsSync(contribPath), "docs/CONTRIBUTING.md must exist");
  const contribContent = fs.readFileSync(contribPath, "utf-8");
  assert.ok(
    contribContent.includes("--base main"),
    "docs/CONTRIBUTING.md must mandate --base main"
  );

  // Check docs/guides/getting-started.md
  const guidePath = path.join(root, "docs/guides/getting-started.md");
  assert.ok(fs.existsSync(guidePath), "docs/guides/getting-started.md must exist");
  const guideContent = fs.readFileSync(guidePath, "utf-8");
  assert.ok(
    guideContent.includes("--base main"),
    "docs/guides/getting-started.md must mandate --base main"
  );

  // Check .coderabbit.yaml base_branches strictly contains only ['main']
  const yamlPath = path.join(root, ".coderabbit.yaml");
  assert.ok(fs.existsSync(yamlPath), ".coderabbit.yaml must exist");
  const yamlContent = fs.readFileSync(yamlPath, "utf-8");
  const baseBranchesMatch = yamlContent.match(/base_branches:\s*\n((\s+-\s+["']?[^"'\n]+["']?\s*\n?)+)/);
  assert.ok(baseBranchesMatch, ".coderabbit.yaml must declare base_branches");
  const baseBranches = baseBranchesMatch[1]
    .split("\n")
    .map((line) => line.replace(/^\s*-\s*["']?|["']?\s*$/g, "").trim())
    .filter(Boolean);
  assert.deepEqual(
    baseBranches,
    ["main"],
    `.coderabbit.yaml must strictly target ['main'], found ${JSON.stringify(baseBranches)}`
  );
});

test("validates Rule 2: Foundation-First Modular Delivery (Trunk-Based Micro-PRs)", () => {
  const agentsContent = fs.readFileSync(path.join(root, "AGENTS.md"), "utf-8");
  assert.ok(
    agentsContent.includes("Foundation-First Modular Delivery"),
    "AGENTS.md must define Foundation-First Modular Delivery rule"
  );

  const contribContent = fs.readFileSync(path.join(root, "docs/CONTRIBUTING.md"), "utf-8");
  assert.ok(
    contribContent.includes("Foundation-First Modular Delivery"),
    "docs/CONTRIBUTING.md must define Foundation-First Modular Delivery rule"
  );
});

test("validates Rule 3: Rebase Instead of Stack for Concurrent Features", () => {
  const agentsContent = fs.readFileSync(path.join(root, "AGENTS.md"), "utf-8");
  assert.ok(
    agentsContent.includes("Rebase Instead of Stack"),
    "AGENTS.md must define Rebase Instead of Stack rule"
  );
  assert.ok(
    agentsContent.includes("git rebase origin/main"),
    "AGENTS.md must instruct git rebase origin/main"
  );

  const contribContent = fs.readFileSync(path.join(root, "docs/CONTRIBUTING.md"), "utf-8");
  assert.ok(
    contribContent.includes("Rebase Instead of Stack"),
    "docs/CONTRIBUTING.md must define Rebase Instead of Stack rule"
  );
});

test("validates Rule 4: Safe Deletion & Cascade Prevention", () => {
  const agentsContent = fs.readFileSync(path.join(root, "AGENTS.md"), "utf-8");
  assert.ok(
    agentsContent.includes("Safe Deletion & Cascade Prevention"),
    "AGENTS.md must define Safe Deletion & Cascade Prevention rule"
  );

  const contribContent = fs.readFileSync(path.join(root, "docs/CONTRIBUTING.md"), "utf-8");
  assert.ok(
    contribContent.includes("Safe Deletion & Cascade Prevention"),
    "docs/CONTRIBUTING.md must define Safe Deletion & Cascade Prevention rule"
  );
});

test("validates programmatic branch target and safe deletion validation functions", () => {
  // Test validateBranchTarget
  assert.deepEqual(validateBranchTarget("main", "feature/my-feat"), { valid: true });
  assert.equal(validateBranchTarget("feature/cutover", "feature/child").valid, false);
  assert.equal(validateBranchTarget("main", "main").valid, false);
  assert.equal(validateBranchTarget("", "feature/child").valid, false);

  // Test validateSafeBranchDeletion
  assert.deepEqual(validateSafeBranchDeletion("feature/my-feat", 0), { canDelete: true });
  assert.equal(validateSafeBranchDeletion("main", 0).canDelete, false);
  assert.equal(validateSafeBranchDeletion("feature/parent", 3).canDelete, false);
  assert.ok(
    validateSafeBranchDeletion("feature/parent", 2).error?.includes("open PR(s) target it")
  );
});

test("validates safeMergeAndCleanBranch execution and child PR cascade protection", () => {
  const executedCommands = [];
  const mockExec = (cmd) => {
    executedCommands.push(cmd);
    if (cmd.includes("gh pr list")) {
      return JSON.stringify([]);
    }
    return "Merged successfully";
  };

  // 1. Success case: PR targeting main with 0 child PRs
  const result = safeMergeAndCleanBranch(21, {
    prDetails: { number: 21, baseRefName: "main", headRefName: "feature/branch-isolation-and-pr-rules" },
    childPrs: [],
    execFn: mockExec,
  });

  assert.equal(result.success, true);
  assert.equal(result.deletedBranch, true);
  assert.ok(executedCommands.some((c) => c.includes("gh pr merge 21") && c.includes("--delete-branch")));

  // 2. Failure case: PR targeting non-main branch (Rule 1 violation)
  assert.throws(
    () => {
      safeMergeAndCleanBranch(22, {
        prDetails: { number: 22, baseRefName: "feature/parent-branch", headRefName: "feature/child-branch" },
        childPrs: [],
        execFn: mockExec,
      });
    },
    /Rule 1 Violation/
  );

  // 3. Cascade protection: Branch has open child PRs (Rule 4 violation)
  assert.throws(
    () => {
      safeMergeAndCleanBranch(23, {
        prDetails: { number: 23, baseRefName: "main", headRefName: "feature/parent-branch" },
        childPrs: [{ number: 24, title: "Child PR" }],
        execFn: mockExec,
      });
    },
    /Rule 4 Violation/
  );
});
