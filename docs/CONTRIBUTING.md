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
git clone https://github.com/miles-brown/Lifespan.git
cd Lifespan

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

## 3. Pull Request Guidelines

1. **Atomic Commits**: Use clear, conventional commit messages:
   - `feat(timeline): add bidirectional rewind playback`
   - `fix(slider): forward aria-valuetext to thumb`
   - `docs: add forensic evidence methodology`
2. **Accessibility Verification**: Ensure all new interactive controls include proper `aria-label`, keyboard handlers, and visible focus rings.
3. **Source Rigor**: Any new event records added to `data/rewind.ts` must include valid `sourceIds` referencing authenticated archival materials.
