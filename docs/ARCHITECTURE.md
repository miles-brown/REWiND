# REWIND System Architecture

## Overview
**REWIND** (Evidence Atlas) is an interactive, forensic-grade chronology and historical investigation platform built with Next.js (App Router), React 19, TypeScript, Radix UI, and Tailwind CSS. It is designed to navigate deep historical timelines, geospatial movements, speech archives, and verifiable primary source documentation.

```
┌─────────────────────────────────────────────────────────────┐
│                      REWIND Web Layer                       │
│  (Next.js 16 App Router / Turbopack / Vercel Edge Runtime)  │
└───────────────┬─────────────────────────────┬───────────────┘
                │                             │
    ┌───────────▼───────────┐     ┌───────────▼───────────┐
    │     Server Pages      │     │  Client Workspaces    │
    │  - / (Home Hub)       │     │  - PersonTimeline     │
    │  - /events            │     │  - RewindExplorer     │
    │  - /person/[slug]     │     │  - MapGraphic         │
    │  - /event/[slug]      │     │  - CommandPalette     │
    │  - /sources           │     │  - CitationModal      │
    │  - /relationship/[a]/[b]   │  - TimelineComparison │
    └───────────┬───────────┘     └───────────┬───────────┘
                │                             │
                └──────────────┬──────────────┘
                               │
               ┌───────────────▼───────────────┐
               │    Data & Forensic Engine     │
               │   - Supabase PostgreSQL Layer │
               │   - Drizzle ORM (schema-v2.ts)│
               │   - EventV2 Adapters & Models │
               │   - Ingestion Deduplication   │
               │   - @/data/rewind.ts (Memory) │
               │   - @/lib/citations.ts        │
               └───────────────────────────────┘
```

---

## Key Subsystems

### 1. Chronology Engine (`components/rewind/PersonTimeline.tsx`)
- **Bidirectional Playback**: Supports both chronological forward playback and reverse time traversal ("REWIND Mode").
- **Clamped Temporal Transitions**: Prevents race conditions at timeline boundaries, ensuring playback stops immediately upon reaching terminal events.
- **Deep Linking**: Syncs active event state with the browser URL (`?evt=<slug>`) using non-reloading history state replacement.
- **Epoch Milestone Navigation**: Groups decades into interactive landmark tags along the timeline rail.

### 2. Geospatial Visualization & Forensic Transit HUD (`components/rewind/MapGraphic.tsx`)
- **Multi-Theme Vector & Raster Basemaps**: Supports Geopolitical Voyager (default), Dark Forensic, Satellite Imagery, and 2D Tactical Schematic SVG fallback ([`GEOSPATIAL_AND_MAP_MODES.md`](architecture/GEOSPATIAL_AND_MAP_MODES.md)).
- **Progressive Contrails & 3D Flight Arcs**: Renders 3D parabolic Bezier airway curves (`lib/rewind/travel.ts`), OSRM/Mapbox surface routes (`lib/rewind/routing.ts`), altitude-tiered luminous glow, and pulsing vapor emitters.
- **Forensic Transit Telemetry HUD**: Collapsible bottom-left overlay (`.map-transit-hud`) displaying real-time altitude/elevation, eased trajectory progress, city corridor endpoints, and verified flight-log gating (`hasVerifiedFlightEvidence`).
- **4-Quadrant Non-Collision Layout**: Enforces strict spatial separation across top-left (`.map-stage-label`), top-right (`.map-toolbar`), bottom-left (`.map-transit-hud`), and bottom-right (`.map-floating-controls`) per [`DESIGN_SYSTEM_AND_ALIGNMENT.md`](architecture/DESIGN_SYSTEM_AND_ALIGNMENT.md).

### 3. Command Palette (`components/rewind/CommandPalette.tsx`)
- **Global `⌘K` Quick Search**: Instant fuzzy matching across:
  - **Events** (names, summaries, categories)
  - **People** (historical figures, roles)
  - **Quotes & Speeches** (extracted quotes, speakers)
  - **Places** (cities, countries, venues)
  - **Sources** (publishers, document types)

### 4. Citation & Export Engine (`lib/citations.ts`, `components/rewind/CitationModal.tsx`)
- Generates standard academic and investigative citations:
  - **BibTeX** (`@misc{...}`)
  - **APA 7th Edition**
  - **Chicago 17th Edition** (Notes & Bibliography)
  - **Raw JSON** structured payload with atlas metadata.

### 5. PostgreSQL Architecture & Ingestion Pipeline (`lib/ingestion/`, `supabase/migrations/`, `db/schema-v2.ts`)
- **Relational PostgreSQL Schema**: Normalized entities spanning `events`, `people`, `sources`, `claims`, `places`, and `event_person_locations`.
- **Live Database Deduplication**: Asynchronous matching via `findDuplicateEventAsync` prevents redundant event insertion during automated and batch ingest.
- **Deterministic Suffixing**: Resolves same-day multi-event slug collisions (`evt-...-2`) without data loss.
- **Row-Level Security (RLS)**: Enforces `public_visibility = 'public-exact'` on location tables to prevent private coordinate leaks.
- **Fail-Closed Year Validation**: Pre-validates `/^\d{4}$/` inputs before PostgREST query execution.
- **Transactional Claim Synchronization**: Prevents duplicate claims using `persistedClaimIds`.


---

## Directory Structure

```
├── app/                        # Next.js App Router routes & layouts
│   ├── layout.tsx              # Root HTML shell with typography & themes
│   ├── page.tsx                # Home hub & launchpad
│   ├── events/                 # Global event catalog
│   ├── event/[slug]/           # Full event record & source trail
│   ├── people/                 # Documented figures directory
│   ├── person/[slug]/          # Chronological person workspace
│   ├── person/[slug]/[year]/   # Year-specific archive view
│   ├── places/ & place/[slug]/ # Geographic event indexes
│   ├── sources/ & source/[id]/ # Primary source evidence register
│   ├── quotes/                 # Indexed speech and quote archive
│   ├── methodology/            # Forensic documentation methodology
│   └── globals.css             # Design tokens, layouts & responsive CSS
├── components/
│   ├── rewind/                 # Investigative application components
│   │   ├── Shell.tsx           # Navigation header, footer & skip-links
│   │   ├── PersonTimeline.tsx  # Chronology engine & console
│   │   ├── RewindExplorer.tsx  # Multi-factor event filtering workspace
│   │   ├── MapGraphic.tsx      # SVG geospatial evidence map
│   │   ├── CommandPalette.tsx  # Global ⌘K search modal
│   │   ├── CitationModal.tsx   # Academic citation drawer
│   │   └── EventCard.tsx       # Standard event preview card
│   └── ui/                     # Primitives & Design System (Slider, Progress)
├── data/
│   └── rewind.ts               # In-memory structured dataset & typings
├── lib/
│   ├── citations.ts            # BibTeX, APA, Chicago formatting helpers
│   └── utils.ts                # Class merging & styling helpers
├── docs/                       # Comprehensive project documentation
└── tests/                      # Node.js test suite
```

---

## Related Architectural Specifications
- [**AI Operational Protocol, Query Resolution Router & Autonomous Decision Framework**](../AGENTS.md)
- [**Design System, Visual Consistency & Viewport Alignment Standard**](architecture/DESIGN_SYSTEM_AND_ALIGNMENT.md)
- [**Master Taxonomy, Content Logic & System Functions Specification**](standards/TAXONOMY_AND_SYSTEM_FUNCTIONS.md)
- [**Event Model v2 (Knowledge Graph Schema Specification)**](architecture/EVENT_MODEL_V2.md)
- [**Geospatial & Map Modes Specification**](architecture/GEOSPATIAL_AND_MAP_MODES.md)
- [**Repository Organization & Growth Roadmap**](architecture/REPO_GROWTH_AND_ROADMAP.md)

---

## Build Targets & Deployment
- **Vercel Edge / Node Runtime**: `npm run build:vercel` (`next build`) runs full static page generation and serverless route bundles.
- **Cloudflare / Vinext**: `npm run build` runs bounded static bundle generation with Cloudflare Worker targets.
