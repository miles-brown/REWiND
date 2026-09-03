# REWIND Repository Organization & Growth Architecture

This document defines the scalable structural hierarchy, architectural evolution, and long-term feature roadmap for the **REWIND Evidence Atlas**.

---

## 1. Target Repository Structure

As the atlas expands to encompass hundreds of historical figures and thousands of verified events, the codebase will scale into modular domains:

```
├── app/                              # Next.js 16 App Router
│   ├── compare/                      # Cross-timeline comparison matrix
│   ├── event/[slug]/                 # Verifiable event dossier & provenance
│   ├── events/                       # Macro event registry & filters
│   ├── network/                      # Diplomatic social graph
│   ├── people/                       # Historical figures directory
│   ├── person/[slug]/                # Person chronological time machine
│   ├── places/                       # Spatiotemporal gazetteer
│   ├── quotes/                       # Speech & transcript highlight reel
│   ├── relationship/[a]/[b]/         # Bilateral encounter matrix
│   ├── sources/                      # Archival source register
│   └── globals.css                   # Core tokens, themes & animations
│
├── components/
│   ├── timeline/                     # Timeline scrubber & console engine
│   │   ├── PersonTimeline.tsx        # Viewport-fixed chronological engine
│   │   ├── TimelineComparison.tsx    # Dual synchronized stream comparison
│   │   ├── RewindExplorer.tsx        # Multi-entity timeline explorer
│   │   └── EpochRail.tsx             # Milestone decade scrubbing pills
│   ├── map/                          # Geospatial visualization layer
│   │   ├── MapGraphic.tsx            # Vector basemap & geodesic flight arcs
│   │   └── GeoTooltip.tsx            # City density & cluster hover cards
│   ├── forensics/                    # Investigative & verification tooling
│   │   ├── DiscrepancyViewer.tsx     # Contradiction & audit trail viewer
│   │   ├── CitationModal.tsx         # BibTeX/APA/Chicago/JSON generator
│   │   └── ProvenanceTimeline.tsx    # Multi-step verification log
│   ├── media/                        # Archival playback & audio
│   │   ├── MediaDrawer.tsx           # Audio player & transcript synchronizer
│   │   └── SpeechWaveform.tsx        # Dynamic audio waveform visualizer
│   └── ui/                           # Primitive components (Radix / Tailwind)
│
├── data/                             # Historical Evidence Data Layer
│   ├── entities/                     # Entity profiles (Netanyahu, Clinton, etc.)
│   ├── events/                       # Partitioned event datasets (by decade/era)
│   ├── sources/                      # Archival bibliographies & document hashes
│   └── gazetteer/                    # Geocoded city & venue coordinates
│
├── db/                               # Optional Persistent Database Layer
│   ├── schema.ts                     # Drizzle ORM schema (Events, Persons, Sources)
│   ├── index.ts                      # Cloudflare D1 / SQLite database client
│   └── migrations/                   # Version-controlled SQL migrations
│
├── docs/                             # Complete Documentation Suite
│   ├── architecture/                 # System architecture, data flow, roadmap
│   ├── guides/                       # Getting started, keyboard shortcuts, contributing
│   ├── ACCESSIBILITY.md              # WCAG 2.1 AA & ARIA contracts
│   ├── CONTRIBUTING.md               # Contribution lifecycle & PR workflow
│   ├── DATA_SCHEMA.md                # TypeScript entity contracts
│   └── METHODOLOGY.md                # Forensic evidence tiers & verification
│
├── lib/                              # Utility libraries (citations, geo math)
├── scripts/                          # Automated ingestion & verification scripts
└── tests/                            # Automated unit & integration tests
```

---

## 2. Growth Roadmap (Upcoming Epics)

### 🎙️ Epic 1: Archival Audio Streaming & Speech Synchronization
- Direct audio streaming integration for verified speeches and interviews (UN General Assembly, Knesset Plenary, White House press briefings).
- Real-time transcript tracking that highlights spoken sentences synchronously with playback.

### 🌐 Epic 2: Multi-Figure Spacetime Intersection Network
- Expand beyond pairwise comparison to multi-party summits (e.g. Camp David 2000, Wye River 1998, Madrid Conference 1991).
- Interactive diplomatic graph rendering co-appearances and treaty co-signatories.

### 🗺️ Epic 3: Spatial GeoJSON Tile Layers & 3D Globe Projection
- Optional high-res Mapbox / TopoJSON vector basemap toggle for street-level venue precision.
- Interactive 3D arc trajectories tracing diplomatic flights across continents.

### ⚖️ Epic 4: Automated Ingestion & Verification Pipeline
- Node.js CLI script (`scripts/ingest-event.ts`) to validate date formats, coordinates, and fetch metadata from archival APIs (UN Digital Library, Knesset records, C-SPAN, Internet Archive).
- Automated link health checker verifying that external source URLs remain active.

### 📄 Epic 5: Comprehensive Dossier Exporter
- One-click export of complete subject dossiers as academic PDFs or formatted Zotero / EndNote research bundles.
