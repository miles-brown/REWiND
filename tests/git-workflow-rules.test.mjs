import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));

/**
 * Pure validation logic for PR branch targets and safe branch deletion invariants.
 */
export function validateBranchTarget(baseRefName, headRefName) {
  if (!baseRefName || typeof baseRefName !== "string") {
    return { valid: false, error: "Base branch reference is missing or invalid" };
  }
  if (!headRefName || typeof headRefName !== "string") {
    return { valid: false, error: "Head branch reference is missing or invalid" };
  }
  if (baseRefName === headRefName) {
    return { valid: false, error: "Head and base branch cannot be identical" };
  }
  if (baseRefName !== "main") {
    return {
      valid: false,
      error: `Rule 1 Violation: PR base branch must strictly be 'main'. Found '${baseRefName}'.`,
    };
  }
  return { valid: true };
}

export function validateSafeBranchDeletion(branchName, openChildPrCount = 0) {
  if (!branchName || branchName === "main") {
    return { canDelete: false, error: "Cannot delete canonical main branch" };
  }
  if (openChildPrCount > 0) {
    return {
      canDelete: false,
      error: `Rule 4 Violation: Cannot delete branch '${branchName}' because ${openChildPrCount} open PR(s) target it. Retarget child PRs to 'main' first.`,
    };
  }
  return { canDelete: true };
}

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

  // Check .coderabbit.yaml base_branches
  const yamlPath = path.join(root, ".coderabbit.yaml");
  assert.ok(fs.existsSync(yamlPath), ".coderabbit.yaml must exist");
  const yamlContent = fs.readFileSync(yamlPath, "utf-8");
  assert.ok(
    yamlContent.includes('base_branches:\n      - "main"') || yamlContent.includes("base_branches:\n      - 'main'") || yamlContent.includes('base_branches:\n      - main'),
    ".coderabbit.yaml must restrict base branches to main"
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
