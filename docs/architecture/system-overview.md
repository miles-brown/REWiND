# System Overview

The **REWIND Evidence Atlas** is a high-performance historical research and chronological analysis platform built with Next.js 16 (App Router with Turbopack), TypeScript 5.9, React 19, and Tailwind CSS.

---

## 1. Architectural Philosophy

1. **Zero-Inference Ground Truth**: No chronological event is displayed without an explicit primary or corroborated secondary source.
2. **Person-Independent Event Knowledge Graph (Event Model v2)**: Events exist independently of any single participant; each participant attaches via a structured relationship recording their official title (`role`), event capacity (`association`), representation, and 3-tier presence location ([`EVENT_MODEL_V2.md`](EVENT_MODEL_V2.md)).
3. **Sub-Millisecond State Synchronization & 60fps Telemetry**: Scrubbing through decades of history and animating 3D geospatial contrails occurs without server round-trips or React re-render bottlenecks ([`DESIGN_SYSTEM_AND_ALIGNMENT.md`](DESIGN_SYSTEM_AND_ALIGNMENT.md)).
4. **Deterministic Taxonomy & Autonomous Agent Resolution**: Every domain taxonomy, system function, and AI decision rule is explicitly catalogued in [`TAXONOMY_AND_SYSTEM_FUNCTIONS.md`](../standards/TAXONOMY_AND_SYSTEM_FUNCTIONS.md) and [`AGENTS.md`](../../AGENTS.md).

---

## 2. Directory Structure

```
├── app/                      # Next.js App Router (Routes & Layouts)
│   ├── compare/              # Cross-timeline comparison matrix
│   ├── event/[slug]/         # Deep-linked event detail page
│   ├── events/               # Complete chronological event registry
│   ├── methodology/          # Methodology and evidence standards
│   ├── people/               # Documented historical figures directory
│   ├── person/[slug]/        # Interactive Person Timeline engine
│   ├── places/               # Geospatial place index
│   ├── quotes/               # Speech transcript reel
│   ├── relationship/[a]/[b]/ # Bilateral encounter matrix
│   ├── relationships/        # Social graph connections
│   ├── sources/              # Archival source register
│   └── globals.css           # Design tokens, keyframes & components
├── components/
│   ├── rewind/               # Domain-specific timeline & map components
│   │   ├── CitationModal.tsx      # BibTeX / APA / Chicago / JSON exporter
│   │   ├── CommandPalette.tsx     # ⌘K multi-category instant search
│   │   ├── DiscrepancyViewer.tsx  # Forensic audit & discrepancy inspector
│   │   ├── EventActions.tsx       # Event page action toolbar
│   │   ├── EventCard.tsx          # Card rendering with verification badges
│   │   ├── MapGraphic.tsx         # Vector basemap & geodesic flight arcs
│   │   ├── MediaDrawer.tsx        # Archival quote player & waveform visualizer
│   │   ├── PersonTimeline.tsx     # Viewport-fixed chronological time machine
│   │   ├── RewindExplorer.tsx     # Multi-entity timeline explorer
│   │   ├── Shell.tsx              # Application shell with ⌘K palette
│   │   └── TimelineComparison.tsx # Dual synchronized timeline comparison
│   └── ui/                   # Reusable accessible primitives (Slider, etc.)
├── data/
│   └── rewind.ts             # Strongly typed historical dataset & lookup helpers
├── docs/                     # Complete developer and academic documentation
├── lib/
│   └── citations.ts          # Academic citation generator
└── tests/                    # Automated Node.js test suite
```
