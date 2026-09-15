#!/usr/bin/env node

/**
 * REWiND Safe PR Merge & Branch Deletion Utility
 * Enforces Rule 1 (Single Canonical Base) and Rule 4 (Safe Deletion & Cascade Prevention)
 * before merging pull requests and deleting remote feature branches.
 */

import { execSync } from "node:child_process";

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
      error: `Rule 4 Violation: Cannot delete branch '${branchName}' because ${openChildPrCount} open PR(s) target it. Rebase child branches onto 'origin/main' and retarget child PRs to 'main' first via 'gh pr edit <PR> --base main'.`,
    };
  }
  return { canDelete: true };
}

export function getOpenChildPrs(branchName, repo = "miles-brown/REWiND", execFn = execSync) {
  if (!branchName || branchName === "main") return [];
  try {
    const raw = execFn(
      `gh pr list --repo ${repo} --base "${branchName}" --state open --json number,title,headRefName`,
      { encoding: "utf-8" }
    );
    return JSON.parse(raw.toString().trim() || "[]");
  } catch (err) {
    console.warn(`Warning: Could not query child PRs for branch '${branchName}':`, err.message);
    return [];
  }
}

export function getPrDetails(prNumber, repo = "miles-brown/REWiND", execFn = execSync) {
  const raw = execFn(
    `gh pr view ${prNumber} --repo ${repo} --json number,title,headRefName,baseRefName,state`,
    { encoding: "utf-8" }
  );
  return JSON.parse(raw.toString().trim());
}

export function safeMergeAndCleanBranch(
  prNumber,
  {
    repo = "miles-brown/REWiND",
    autoDelete = true,
    execFn = execSync,
    prDetails = null,
    childPrs = null,
  } = {}
) {
  const pr = prDetails || getPrDetails(prNumber, repo, execFn);
  if (!pr) {
    throw new Error(`Could not retrieve details for PR #${prNumber}`);
  }

  // 1. Validate Base Branch (Rule 1)
  const targetCheck = validateBranchTarget(pr.baseRefName, pr.headRefName);
  if (!targetCheck.valid) {
    throw new Error(`Cannot merge PR #${prNumber}: ${targetCheck.error}`);
  }

  // 2. Validate Safe Branch Deletion & Cascade Invariants (Rule 4)
  const children = childPrs !== null ? childPrs : getOpenChildPrs(pr.headRefName, repo, execFn);
  const deletionCheck = validateSafeBranchDeletion(pr.headRefName, children.length);

  if (!deletionCheck.canDelete && autoDelete) {
    throw new Error(
      `Cannot safely merge and delete branch for PR #${prNumber}: ${deletionCheck.error}`
    );
  }

  // 3. Execute squash merge and conditional branch deletion
  const deleteFlag = autoDelete && deletionCheck.canDelete ? "--delete-branch" : "";
  const mergeCmd = `gh pr merge ${prNumber} --repo ${repo} --squash ${deleteFlag}`.trim();
  
  const mergeResult = execFn(mergeCmd, { encoding: "utf-8" });
  return {
    success: true,
    prNumber,
    headRefName: pr.headRefName,
    deletedBranch: autoDelete && deletionCheck.canDelete,
    output: mergeResult ? mergeResult.toString() : "",
  };
}

// Direct CLI Execution
if (process.argv[1] && process.argv[1].endsWith("safe-branch-merge.mjs")) {
  const prArg = process.argv[2];
  if (!prArg) {
    console.error("Usage: node scripts/safe-branch-merge.mjs <PR_NUMBER>");
    process.exit(1);
  }
  const prNumber = parseInt(prArg, 10);
  if (isNaN(prNumber)) {
    console.error("Invalid PR number specified:", prArg);
    process.exit(1);
  }

  try {
    console.log(`🔍 Inspecting PR #${prNumber} for Rule 1 & Rule 4 invariants...`);
    const result = safeMergeAndCleanBranch(prNumber);
    console.log(`✅ PR #${prNumber} successfully squash-merged${result.deletedBranch ? " and remote branch deleted" : ""}.`);
  } catch (err) {
    console.error(`❌ Safe Merge Aborted: ${err.message}`);
    process.exit(1);
  }
}
