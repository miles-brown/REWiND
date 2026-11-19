# REWIND — Evidence Atlas

<p align="left">
  <a href="https://coderabbit.ai"><img src="https://img.shields.io/coderabbit/prs/github/miles-brown/REWiND?utm_source=oss&utm_medium=github&utm_campaign=miles-brown%2FREWiND&labelColor=171717&color=FF570A&link=https%3A%2F%2Fcoderabbit.ai&label=CodeRabbit+Reviews" alt="CodeRabbit Pull Request Reviews" /></a>
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

### 🗺️ 3. Multi-Theme 3D Geospatial Map, Contrails & Transit Telemetry HUD
- **4 Specialized Basemap Modes**: Geopolitical Voyager (default), Dark Forensic, Satellite Imagery, and 2D Tactical Schematic SVG fallback.
- **Progressive Contrails & Altitude-Tiered Luminous Glow**: 3D parabolic Bezier flight arcs with modality-specific glow (`#818cf8` VIP Air Force One ultraviolet halo, `#38bdf8` flight cyan, `#34d399` helicopter emerald, `#f59e0b` ground convoy amber, `#06b6d4` maritime seafoam, `#c084fc` rail amethyst) and pulsing condensation vapor emitters.
- **Floating Forensic Transit Telemetry HUD**: Real-time 60fps altitude/elevation, eased trajectory progress percentage, origin-to-destination city corridor, and evidentiary corridor status (`Verified Flight Log` vs `Documented Flight Metadata` vs `Suggested Corridor`).
- **4-Tier Gazetteer & Mobile Vessels**: Country -> City -> Street Address -> Venue -> Sub-Venue Area hierarchy, plus mobile vessel venues (`is_mobile_vessel: true`) and remote attendance localization (`RemoteLocation`).

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

## 📚 Comprehensive Documentation & Standards Index

For AI coding assistants and human engineers, [**AGENTS.md**](AGENTS.md) contains the **Authoritative Query & Task Resolution Router** (mapping every engineering, UI, taxonomy, database, and ingestion query to the exact documentation file, code module, and test suite) and the **Autonomous Decision-Making Protocol** for complex tasks.

### 1. Operational Governance & Architecture
| Document | Description |
| :--- | :--- |
| [**AGENTS.md — AI Operational Protocol & Query Router**](AGENTS.md) | Highest-priority rules, branch isolation invariants, **Query Resolution Router**, and **Autonomous Decision-Making Hierarchy**. |
| [**System Architecture**](docs/ARCHITECTURE.md) | End-to-end subsystem architecture, data flow, and build targets. |
| [**System Overview**](docs/architecture/system-overview.md) | Core architectural philosophy, component boundaries, and directory map. |
| [**Design System, Visual Consistency & Viewport Alignment**](docs/architecture/DESIGN_SYSTEM_AND_ALIGNMENT.md) | Forensic Obsidian palette, WCAG AA contrast tokens, 4-quadrant map layout, z-index registry, and UI alignment invariants. |
| [**Event Model v2 (Knowledge Graph Specification)**](docs/architecture/EVENT_MODEL_V2.md) | Person-independent event architecture, 35-field migration matrix, 3-tier geospatial coordinates, and tri-state factual flags. |
| [**Geospatial & Map Modes Specification**](docs/architecture/GEOSPATIAL_AND_MAP_MODES.md) | Camera pitch/bearing profiles, Tier 1 vs Tier 2 flight corridor precedence, OSRM/Mapbox routing, and raster fallbacks. |
| [**Repository Growth & Architectural Roadmap**](docs/architecture/REPO_GROWTH_AND_ROADMAP.md) | Modular scaling hierarchy and upcoming engineering epics. |

### 2. Master Taxonomies, Data Contracts & Evidentiary Standards
| Document | Description |
| :--- | :--- |
| [**Master Taxonomy, Content Logic & System Functions**](docs/standards/TAXONOMY_AND_SYSTEM_FUNCTIONS.md) | Controlled vocabularies for events, roles vs. capacities, 4-tier places, and logic contracts for all 12 system functions. |
| [**Data Schema Specification**](docs/DATA_SCHEMA.md) | TypeScript entity schemas for `EventRecord`, `PersonRecord`, `PersonStayRecord`, `Source`, and database invariants. |
| [**Forensic Methodology**](docs/METHODOLOGY.md) | Evidence tiers (Tier 1 Primary vs Tier 2 Secondary), verification scoring, and coordinate precision rules. |
| [**Event, Venue & Geospatial Routing Standard**](docs/standards/EVENT_AND_VENUE_STANDARD.md) | Venue hierarchy, mobile vessels (`is_mobile_vessel`), umbrella event series, and the 10 Golden Evidentiary Edge-Case Rules. |
| [**Location & Gazetteer Standard**](docs/standards/LOCATION_STANDARD.md) | Sovereign country rules, compound-country prohibition, and coordinate precision tiers. |
| [**Temporal Precision Standard**](docs/standards/TEMPORAL_STANDARD.md) | ISO-8601 date formatting, timezone handling, and fail-closed year validation. |
| [**Biographical & Naming Standard**](docs/standards/BIOGRAPHICAL_STANDARD.md) | Strict separation of personal names (`canonicalName`) from numbered offices/tenures (`roles-seed.ts`). |
| [**People & Inclusion Standard**](docs/standards/PEOPLE_AND_INCLUSION_STANDARD.md) | Demographic rigor, citizenship vs. national identity, and religion evidentiary rules. |
| [**Evidence Standard**](docs/standards/EVIDENCE_STANDARD.md) | Primary archival documentation requirements and source locator rules. |
| [**Fact & Claim Standard**](docs/standards/FACT_AND_CLAIM_STANDARD.md) | Atomic claim modeling, default `"limited"` confidence invariant, and claim deduplication. |
| [**Source Classification Standard**](docs/standards/SOURCE_CLASSIFICATION.md) | Taxonomies for official transcripts, broadcasts, gazettes, and press reports. |
| [**Verification Standard**](docs/standards/VERIFICATION_STANDARD.md) | Promotion criteria between `"provisional"`, `"verified"`, and `"disputed"` records. |
| [**Corrections & Disputes Standard**](docs/standards/CORRECTIONS_AND_DISPUTES.md) | Handling competing historical accounts without deleting records. |
| [**Research Integrity Standard**](docs/standards/RESEARCH_INTEGRITY.md) | Neutrality, non-fabrication, and archival audit trail rules. |
| [**AI & Automated Research Policy**](docs/standards/AI_RESEARCH_POLICY.md) | Governance of LLM extraction, zero-hallucination verification, and strict workspace isolation. |

### 3. Editorial Policies & Developer Guides
| Document | Description |
| :--- | :--- |
| [**Autopublish Policy**](docs/policy/AUTOPUBLISH_POLICY.md) | Automated ingestion publication lanes and human review gates. |
| [**Event Inclusion Policy**](docs/policy/EVENT_INCLUSION_POLICY.md) | Criteria for indexing historical episodes in the atlas. |
| [**Person Eligibility Policy**](docs/policy/PERSON_ELIGIBILITY_POLICY.md) | Notability and evidentiary thresholds for figure profiles. |
| [**Source Policy**](docs/policy/SOURCE_POLICY.md) | Reliability hierarchy and archival preservation rules. |
| [**Accessibility Standards (WCAG 2.1 AA)**](docs/ACCESSIBILITY.md) | WAI-ARIA slider contracts, milestone-only `aria-live="polite"` regions, and keyboard navigation. |
| [**Getting Started Guide**](docs/guides/getting-started.md) | Environment setup, scripts, and local development workflow. |
| [**Keyboard Shortcuts Guide**](docs/guides/keyboard-shortcuts.md) | Complete hotkey reference for timeline scrubbing and search. |
| [**Contributing Guide**](docs/CONTRIBUTING.md) | Branch isolation, PR lifecycle, and pre-PR verification gates. |
| [**Technical Backlog**](docs/TECHNICAL_BACKLOG.md) | Tracked engineering enhancements and infrastructure tasks. |

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
