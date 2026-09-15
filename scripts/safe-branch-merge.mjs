#!/usr/bin/env node

/**
 * REWiND Safe PR Merge & Branch Deletion Utility
 * Enforces Rule 1 (Single Canonical Base) and Rule 4 (Safe Deletion & Cascade Prevention)
 * before merging pull requests and deleting remote feature branches.
 */

import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

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
      error: `Rule 4 Violation: Cannot delete branch '${branchName}' because ${openChildPrCount} open PR(s) target it. Rebase child branches onto 'origin/main' (git fetch origin && git rebase origin/main) and retarget child PRs to 'main' first via 'gh pr edit <PR> --base main'.`,
    };
  }
  return { canDelete: true };
}

export function getOpenChildPrs(branchName, repo = "miles-brown/REWiND", execFn = execFileSync) {
  if (!branchName || branchName === "main") return [];
  
  // Safe argument array without shell execution to prevent shell metacharacter injection
  const args = [
    "pr",
    "list",
    "--repo",
    repo,
    "--base",
    branchName,
    "--state",
    "open",
    "--json",
    "number,title,headRefName",
  ];

  try {
    const raw = execFn("gh", args, { encoding: "utf-8" });
    const parsed = JSON.parse(raw ? raw.toString().trim() : "[]");
    if (!Array.isArray(parsed)) {
      throw new Error(`Expected array of child PRs, received: ${typeof parsed}`);
    }
    return parsed;
  } catch (err) {
    // Fail-closed: Never return empty array if child PR discovery fails
    throw new Error(
      `Rule 4 Safety Check Failed: Could not securely query child PRs for branch '${branchName}': ${err.message}`
    );
  }
}

export function getPrDetails(prNumber, repo = "miles-brown/REWiND", execFn = execFileSync) {
  const args = [
    "pr",
    "view",
    String(prNumber),
    "--repo",
    repo,
    "--json",
    "number,title,headRefName,baseRefName,headRefOid,state",
  ];

  try {
    const raw = execFn("gh", args, { encoding: "utf-8" });
    return JSON.parse(raw ? raw.toString().trim() : "{}");
  } catch (err) {
    throw new Error(`Could not retrieve details for PR #${prNumber}: ${err.message}`);
  }
}

export function safeMergeAndCleanBranch(
  prNumber,
  {
    repo = "miles-brown/REWiND",
    autoDelete = true,
    execFn = execFileSync,
    prDetails = null,
    childPrs = null,
  } = {}
) {
  const pr = prDetails || getPrDetails(prNumber, repo, execFn);
  if (!pr || !pr.headRefName) {
    throw new Error(`Could not retrieve valid details for PR #${prNumber}`);
  }

  // 1. Validate Base Branch (Rule 1)
  const targetCheck = validateBranchTarget(pr.baseRefName, pr.headRefName);
  if (!targetCheck.valid) {
    throw new Error(`Cannot merge PR #${prNumber}: ${targetCheck.error}`);
  }

  // 2. Validate Safe Branch Deletion & Cascade Invariants (Rule 4)
  // Skip child PR discovery when branch deletion is disabled (autoDelete=false)
  const children = autoDelete
    ? (childPrs !== null ? childPrs : getOpenChildPrs(pr.headRefName, repo, execFn))
    : (childPrs !== null ? childPrs : []);
  
  const deletionCheck = validateSafeBranchDeletion(pr.headRefName, children.length);

  if (!deletionCheck.canDelete && autoDelete) {
    throw new Error(
      `Cannot safely merge and delete branch for PR #${prNumber}: ${deletionCheck.error}`
    );
  }

  // 3. Pin the approved head SHA during merge to prevent race conditions with unreviewed pushes
  const mergeArgs = [
    "pr",
    "merge",
    String(prNumber),
    "--repo",
    repo,
    "--squash",
  ];

  if (pr.headRefOid) {
    mergeArgs.push("--match-head-commit", pr.headRefOid);
  }

  if (autoDelete && deletionCheck.canDelete) {
    mergeArgs.push("--delete-branch");
  }

  const mergeResult = execFn("gh", mergeArgs, { encoding: "utf-8" });
  return {
    success: true,
    prNumber,
    headRefName: pr.headRefName,
    headRefOid: pr.headRefOid || null,
    deletedBranch: autoDelete && deletionCheck.canDelete,
    output: mergeResult ? mergeResult.toString() : "",
  };
}

// Direct CLI Execution Guard
if (process.argv[1] && (process.argv[1].endsWith("safe-branch-merge.mjs") || fileURLToPath(import.meta.url) === path.resolve(process.argv[1]))) {
  const prArg = process.argv[2];
  if (!prArg || !/^\d+$/.test(prArg)) {
    console.error(`Invalid PR number specified: '${prArg || ""}'. Must be a positive integer.`);
    process.exit(1);
  }
  const prNumber = parseInt(prArg, 10);

  try {
    console.log(`🔍 Inspecting PR #${prNumber} for Rule 1 & Rule 4 invariants...`);
    const result = safeMergeAndCleanBranch(prNumber);
    console.log(`✅ PR #${prNumber} successfully squash-merged${result.deletedBranch ? " and remote branch deleted" : ""}.`);
  } catch (err) {
    console.error(`❌ Safe Merge Aborted: ${err.message}`);
    process.exit(1);
  }
}
