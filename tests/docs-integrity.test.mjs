import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));

function getAllMarkdownFiles(dir) {
  let files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!["node_modules", ".git", ".next", "dist", ".wrangler", "scratch"].includes(entry.name)) {
        files = files.concat(getAllMarkdownFiles(fullPath));
      }
    } else if (entry.isFile() && (entry.name.endsWith(".md") || entry.name.endsWith(".mdx"))) {
      files.push(fullPath);
    }
  }
  return files;
}

test("verifies core documentation suite existence", () => {
  const requiredDocs = [
    "README.md",
    "AGENTS.md",
    "docs/ACCESSIBILITY.md",
    "docs/CONTRIBUTING.md",
    "docs/DATA_SCHEMA.md",
    "docs/METHODOLOGY.md",
  ];

  for (const doc of requiredDocs) {
    const docPath = path.join(root, doc);
    assert.ok(fs.existsSync(docPath), `Required documentation file must exist: ${doc}`);
    const stat = fs.statSync(docPath);
    assert.ok(stat.size > 200, `Documentation file ${doc} must not be empty or truncated`);
  }
});

test("scans all markdown links and validates relative targets", () => {
  const mdFiles = getAllMarkdownFiles(root);
  assert.ok(mdFiles.length >= 6, "Must discover core documentation files");

  const brokenLinks = [];

  for (const filePath of mdFiles) {
    const content = fs.readFileSync(filePath, "utf-8");
    const dir = path.dirname(filePath);

    // Match [text](link) markdown links
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    let match;

    while ((match = linkRegex.exec(content)) !== null) {
      const linkTarget = match[2].trim();

      // Skip anchors, empty links, protocol links, mailto
      if (!linkTarget || linkTarget.startsWith("#") || linkTarget.startsWith("mailto:") || linkTarget.startsWith("tel:")) {
        continue;
      }

      if (linkTarget.startsWith("http://") || linkTarget.startsWith("https://")) {
        // Validate URL syntax
        try {
          new URL(linkTarget);
        } catch {
          brokenLinks.push({ file: path.relative(root, filePath), link: linkTarget, reason: "Invalid URL format" });
        }
        continue;
      }

      // Local file reference
      const cleanPath = linkTarget.split("#")[0].split("?")[0];
      if (!cleanPath) continue;

      let resolvedTarget;
      if (cleanPath.startsWith("/")) {
        resolvedTarget = path.join(root, cleanPath);
      } else {
        resolvedTarget = path.resolve(dir, cleanPath);
      }

      if (!fs.existsSync(resolvedTarget)) {
        brokenLinks.push({
          file: path.relative(root, filePath),
          link: linkTarget,
          resolved: path.relative(root, resolvedTarget),
          reason: "Target file does not exist",
        });
      }
    }
  }

  assert.deepEqual(brokenLinks, [], `Found ${brokenLinks.length} broken links in documentation:\n` + JSON.stringify(brokenLinks, null, 2));
});
