# Contributing to REWIND

Thank you for contributing to the **REWIND Evidence Atlas**. Follow these guidelines to maintain code quality, accessibility, and documentation rigor.

---

## 1. Development Setup

### Prerequisites
- **Node.js**: `>=22.13.0`
- **npm**: `>=10.0.0`

### Installation
```bash
# Clone the repository
git clone https://github.com/miles-brown/REWiND.git
cd REWiND

# Install dependencies
npm install
```

### Local Development Server
```bash
npm run dev
# Starts development server with Vite / Vinext
```

---

## 2. Quality Assurance & Verification Commands

Before opening a pull request, run the following verification steps:

```bash
# 1. Type-check with TypeScript
npx tsc --noEmit

# 2. Lint JavaScript / TypeScript / React components
npm run lint

# 3. Verify Vercel & Next.js production build
npm run build:vercel

# 4. Run test suite
npm test
```

---

## 3. Pull Request Guidelines & Branch Isolation Rules

1. **Rule 1: Single Canonical Base (`--base main`)**:
   - Every PR must have its own dedicated feature branch (`feature/<name>` or `fix/<name>`) cut directly from `origin/main`.
   - Always open PRs with `--base main`. Never target another unmerged feature branch.
2. **Rule 2: Foundation-First Modular Delivery (Trunk-Based Micro-PRs)**:
   - Land database schemas, core clients, and shared types into `main` first via independent, reviewable micro-PRs.
   - Consumer UI components and downstream features branch from updated `main`.
3. **Rule 3: Rebase Instead of Stack for Concurrent Features**:
   - Keep feature branches synchronized with latest `main` via `git fetch origin && git rebase origin/main`.
   - Avoid unmerged branch dependencies.
4. **Rule 4: Safe Deletion & Cascade Prevention**:
   - `--delete-branch` is strictly permitted only for merged PRs targeting `main`.
   - Never delete an intermediate parent branch while child PRs are open without first retargeting child PRs to `main`.
5. **Atomic Commits**: Use clear, conventional commit messages:
   - `feat(timeline): add bidirectional rewind playback`
   - `fix(slider): forward aria-valuetext to thumb`
   - `docs: add forensic evidence methodology`
6. **Accessibility Verification**: Ensure all new interactive controls include proper `aria-label`, keyboard handlers, and visible focus rings.
7. **Source Rigor**: Any new event records added to `data/rewind.ts` must include valid `sourceIds` referencing authenticated archival materials.
8. **Technical Backlog**: Review unresolved review items and architectural tasks in [TECHNICAL_BACKLOG.md](./TECHNICAL_BACKLOG.md).

