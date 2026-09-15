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
    └───────────┬───────────┘     └───────────┬───────────┘
                │                             │
                └──────────────┬──────────────┘
                               │
               ┌───────────────▼───────────────┐
               │    Data & Forensic Engine     │
               │   - @/data/rewind.ts          │
               │   - @/lib/citations.ts        │
               │   - Drizzle ORM Schema        │
               └───────────────────────────────┘
```

---

## Key Subsystems

### 1. Chronology Engine (`components/rewind/PersonTimeline.tsx`)
- **Bidirectional Playback**: Supports both chronological forward playback and reverse time traversal ("REWIND Mode").
- **Clamped Temporal Transitions**: Prevents race conditions at timeline boundaries, ensuring playback stops immediately upon reaching terminal events.
- **Deep Linking**: Syncs active event state with the browser URL (`?evt=<slug>`) using non-reloading history state replacement.
- **Epoch Milestone Navigation**: Groups decades into interactive landmark tags along the timeline rail.

### 2. Geospatial Visualization (`components/rewind/MapGraphic.tsx`)
- **Equirectangular Projection**: Maps GPS coordinates (`latitude`, `longitude`) to dynamic percentage positions on an evidence map.
- **Cumulative Trajectory**: Renders SVG paths tracing chronological travel between documented locations.
- **Interactive Marker Selection**: Synchronizes map point clicks with the timeline active index.

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

## Build Targets & Deployment
- **Vercel Edge / Node Runtime**: `npm run build:vercel` (`next build`) runs full static page generation and serverless route bundles.
- **Cloudflare / Vinext**: `npm run build` runs bounded static bundle generation with Cloudflare Worker targets.
