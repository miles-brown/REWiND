# System Overview

The **REWIND Evidence Atlas** is a high-performance historical research and chronological analysis platform built with Next.js 16 (App Router with Turbopack), TypeScript 5.9, React 19, and Tailwind CSS.

---

## 1. Architectural Philosophy

1. **Zero-Inference Ground Truth**: No chronological event is displayed without an explicit primary or corroborated secondary source.
2. **Deterministic spatiotemporal points**: Human action is recorded as discrete `(latitude, longitude, date, participants, sources)` tuples.
3. **Sub-millisecond State Synchronization**: Scrubbing through decades of history occurs instantly in the browser without server round-trips.

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
