# REWIND — Evidence Atlas

<p align="left">
  <img src="https://img.shields.io/badge/Next.js-16.2.6-black?style=flat&logo=next.js" alt="Next.js 16" />
  <img src="https://img.shields.io/badge/React-19.2.6-blue?style=flat&logo=react" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-5.9.3-3178C6?style=flat&logo=typescript" alt="TypeScript 5" />
  <img src="https://img.shields.io/badge/Accessibility-WCAG_2.1_AA-success?style=flat" alt="Accessibility WCAG AA" />
  <img src="https://img.shields.io/badge/License-MIT-amber?style=flat" alt="License MIT" />
</p>

**REWIND** is a forensic chronological evidence atlas. It indexes documented historical human actions, speeches, diplomatic encounters, and movements as verifiable spacetime points anchored strictly to primary archival records.

---

## 🌟 Core Features

### ⏳ 1. Fluid & Fixed Chronological Time Machine
- **Zero-lag Viewport Scrubber**: Time-console clamped to the viewport bottom with dynamic safe-area padding.
- **Milestone & Epoch Scrubbing**: Clickable decade milestones (`1940s` ... `2020s`) for rapid macro navigation.
- **Bidirectional "True REWIND" Mode**: Forward vs Reverse chronological playback with terminal boundary protection.
- **Shareable Deep-Linking**: Real-time URL query parameter synchronization (`?evt=<slug>`).

### 🔀 2. Cross-Timeline Comparison Matrix (`/compare` & `/relationship/[a]/[b]`)
- Dual synchronized chronological streams comparing two historical figures side-by-side.
- Automatically calculates and visualizes **Direct Spacetime Intersections**, shared venues, mutual cities, and bilateral encounter cards.

### 🗺️ 3. Vector Basemaps & Animated Geodesic Flight Arcs
- High-fidelity vector continental coastlines (North America, Europe, Africa, Levant/Middle East).
- Animated glowing geodesic flight trajectories connecting consecutive international movements.
- Proximity cluster aggregation with density count badges (e.g. `+14` events in Jerusalem).

### 🔍 4. Global `⌘K` Command Palette
- Instant search across **Events**, **People**, **Quotes & Speeches**, **Places**, and **Sources** with keyboard arrow navigation.

### 📻 5. Archival Speech & Media Vault
- Embedded waveform visualizer, verbatim quote excerpts carousel, speaker metadata, and one-click quote copying.

### 📜 6. Academic Citation & Provenance Exporter
- One-click copy and download for **BibTeX**, **APA 7th Edition**, **Chicago 17th Edition**, and structured **JSON** exports on both the timeline and event pages.

### 🛡️ 7. Forensic Evidentiary & Discrepancy Audit
- Full breakdown of confidence metrics, temporal/geospatial precision scores, and multi-step verification provenance trails.

---

## 🎹 Keyboard Shortcuts Cheat Sheet

| Key | Action |
| :--- | :--- |
| <kbd>→</kbd> / <kbd>←</kbd> | Step forward / backward 1 event |
| <kbd>Shift</kbd> + <kbd>→</kbd> / <kbd>←</kbd> | Jump forward / backward 5 events |
| <kbd>Space</kbd> | Play / Pause automated timeline playback |
| <kbd>Home</kbd> / <kbd>End</kbd> | Jump to earliest / latest documented record |
| <kbd>R</kbd> | Toggle playback direction between Forward and REWIND |
| <kbd>?</kbd> | Toggle keyboard shortcut reference banner |
| <kbd>⌘</kbd> + <kbd>K</kbd> / <kbd>Ctrl</kbd> + <kbd>K</kbd> | Open global search command palette |

---

## 🚀 Quickstart

### Prerequisites
- **Node.js**: `>=22.13.0`
- **npm**: `>=10.0.0`

### Installation & Local Run
```bash
# 1. Clone the repository
git clone https://github.com/miles-brown/REWiND.git
cd REWiND

# 2. Install dependencies
npm install

# 3. Create your local environment configuration
cp .env.example .env.local

# 4. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📚 Documentation Index

| Guide | Description |
| :--- | :--- |
| [**Architecture & System Overview**](docs/architecture/system-overview.md) | High-level system architecture, client vs server component boundaries, and directory layout. |
| [**Getting Started**](docs/guides/getting-started.md) | Development setup, configuration, and script definitions. |
| [**Keyboard Shortcuts**](docs/guides/keyboard-shortcuts.md) | Comprehensive hotkey cheat sheet and accessibility navigation. |
| [**Forensic Methodology**](docs/METHODOLOGY.md) | Evidence tiers (Tier 1 Primary vs Tier 2 Contemporary Secondary), verification scoring, and coordinate precision rules. |
| [**Data Schema Contract**](docs/DATA_SCHEMA.md) | TypeScript entity schemas for `EventRecord`, `Person`, `Source`, precision types, and verification ratings. |
| [**Accessibility Standards**](docs/ACCESSIBILITY.md) | WAI-ARIA slider implementation, live region announcements (`aria-live="polite"`), and reduced-motion guidelines. |
| [**Contributing Guide**](docs/CONTRIBUTING.md) | Git workflow, conventional commit formatting, and PR submission checklist. |

---

## 🧪 Verification & Testing Commands

```bash
# Typecheck TypeScript definitions
npx tsc --noEmit

# Run ESLint across codebase
npm run lint

# Run Next.js production build verification
npm run build:vercel

# Run automated unit test suite
node --test tests/ui-components.test.mjs
```

---

## 📄 License

Open-source under the [MIT License](LICENSE).
