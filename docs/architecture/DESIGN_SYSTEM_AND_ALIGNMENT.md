# REWiND Design System, Visual Consistency & Viewport Alignment Standard

This specification defines the visual design system, color contrast rules, typography hierarchy, spatial grid alignment, z-index stacking order, and non-collision viewport ergonomics for the **REWiND Evidence Atlas**.

Every UI component, map overlay, timeline console, and dossier view must strictly conform to these rules so that visual alignment, accessibility, and forensic clarity remain uniform across the entire platform.

---

## 1. Visual Identity & Forensic Obsidian Aesthetic

The REWiND Evidence Atlas employs a high-contrast **Forensic Obsidian** aesthetic engineered for sustained archival investigation, dense chronological analysis, and multi-layered geospatial telemetry.

### 1.1 Surface & Background Tokens
| Token / Surface Role | CSS Value / Hex | Usage & Component Scope |
| :--- | :--- | :--- |
| **Primary App Canvas** | `#050811` / `#060b14` | Root background (`app/layout.tsx`, `app/globals.css`) |
| **Elevated Panel / Card Surface** | `rgba(8, 14, 26, 0.92)` | Floating map HUD (`.map-transit-hud`), navigation controls (`.map-floating-controls`), dossier cards |
| **Secondary Interactive Surface** | `rgba(15, 23, 42, 0.85)` | Filter bars, inactive tab triggers, secondary drawers |
| **Glassmorphic Backdrop** | `backdrop-filter: blur(14px)` | Floating HUDs, sticky timeline consoles, modal overlays (must always include a solid/semi-opaque `background` fallback) |
| **Subtle Structural Border** | `rgba(255, 255, 255, 0.12)` | Card frames, table dividers, collapsed HUD borders |
| **Active Accent Border** | `rgba(56, 189, 248, 0.28)` – `#38bdf8` | Active selection cards, expanded telemetry HUD, selected map markers |

### 1.2 Typography & Contrast Invariants (WCAG 2.1 AA Mandatory)
- **Primary Text (`#f8fafc`)**: Headlines, event titles, active city endpoints, telemetry values ($\ge 15:1$ contrast on dark surfaces).
- **Secondary Body Text (`#cbd5e1`)**: Event summaries, origin city labels, biographical prose ($\ge 10:1$ contrast).
- **Muted / Metadata Text (`#94a3b8`)**: Uppercase telemetry labels, timestamps, coordinate captions ($\ge 5.5:1$ contrast).
- **Strict Prohibition on `#64748b` Text**: Low-contrast slate `#64748b` is **strictly banned** for text, labels, or interactive icons on dark surfaces. Always use `#94a3b8` or brighter (`#cbd5e1`, `#f8fafc`).
- **Font Families**:
  - **UI & Editorial Prose**: `Plus Jakarta Sans` (`--font-sans`) for crisp legibility across headings, badges, and long-form archival summaries.
  - **Forensic Telemetry & Coordinates**: `JetBrains Mono` (`var(--mono, monospace)`) with `font-variant-numeric: tabular-nums` so dynamic 60fps updates (altitude, percentages, timestamps, WGS-84 coordinates) never cause horizontal layout jitter.

### 1.3 Luminous Modality & Evidentiary Color Coding
Every transport modality and evidentiary verification state maps deterministically to a dedicated semantic color palette:

| Domain / Modality | Core Color | Halo / Secondary | Meaning & Visual Application |
| :--- | :--- | :--- | :--- |
| **Standard Air / Flight** | `#38bdf8` (Electric Cyan) | `#38bdf8` (`blur: 6px`) | Commercial/charter flight arcs, active progress text, primary focus outlines |
| **Executive / VIP Flight (`air-force-one`)** | `#38bdf8` (Electric Cyan) | `#818cf8` (Ultraviolet Halo) | Presidential / head-of-state airborne command transits |
| **Low-Altitude Helicopter (`helicopter`)** | `#34d399` (Tactical Emerald) | `#34d399` | Rotary-wing transits ($\le 1,500\text{ m}$ ceiling) |
| **Ground Convoy (`car`, `bus`, `motorcade`, `police-convoy`)** | `#f59e0b` (Highway Amber) | `#f59e0b` | Surface road network routes and diplomatic motorcades |
| **Maritime Vessel (`boat`, `ship`)** | `#06b6d4` (Seafoam Cyan) | `#06b6d4` | Coastal and oceanic vessel wakes |
| **Rail Network (`train`)** | `#c084fc` (Electric Amethyst) | `#c084fc` | High-speed and ceremonial rail corridors |
| **Verified Primary Evidence (`verified`)** | `#34d399` (Emerald) | `rgba(16, 185, 129, 0.15)` | Tier-1 verified events, pins, and `Verified Flight Log` HUD badges |
| **Provisional / Suggested (`provisional`)** | `#fbbf24` (Amber) | `rgba(245, 158, 11, 0.15)` | Provisional records, `Documented Flight Metadata`, and `Suggested Corridor` badges |
| **Disputed / Conflicting (`disputed`)** | `#f87171` (Coral Red) | `rgba(239, 68, 68, 0.15)` | Records with competing primary claims requiring discrepancy inspection |
| **Visited Ghost Waypoint (`visited:not(.selected)`)** | `#475569` (Muted Slate) | `opacity: 0.82` -> `1.0` on hover | Previously visited historical stops along the timeline |

---

## 2. Viewport Alignment, Quadrant Allocation & Z-Index Registry

A core invariant of the REWiND Evidence Atlas is **zero visual overlap** between interactive controls, map labels, telemetry overlays, and timeline scrubbing consoles.

### 2.1 Map Viewport Quadrant Allocation Invariant
Within `.evidence-map-wrapper` (`components/rewind/MapGraphic.tsx` & `components/rewind/PersonTimeline.tsx`), each corner of the map viewport is exclusively assigned to a single functional overlay:

```
┌─────────────────────────────────────────────────────────────────────────┐
│ [TOP-LEFT: top: 14px, left: 14px]   [TOP-RIGHT: top: 14px, right: 14px] │
│ • .map-stage-label                  • .map-toolbar                      │
│   (Active Stop / Stage Header)        (Geopolitical | Dark | Satellite  │
│                                        | Schematic Basemap Switcher)    │
│                                                                         │
│                                                                         │
│                     INTERACTIVE MAP SURFACE                             │
│          (Forensic Venue Pins, 3D Flight Arcs & Contrails)              │
│                                                                         │
│                                                                         │
│ [BOTTOM-LEFT: bottom: 20px, left: 14px]   [BOTTOM-RIGHT: bottom: 20px]  │
│ • .map-transit-hud                        • .map-floating-controls      │
│   (Collapsible Forensic Transit             (Enlarge/Collapse, Zoom +,  │
│    Telemetry HUD)                            Zoom -, Reset North)       │
└─────────────────────────────────────────────────────────────────────────┘
```

- **Strict Non-Collision Rule**: Never place a new badge, legend, or HUD at `top: 14px; left: 14px` (reserved for `.map-stage-label`) or `bottom: 20px; right: 14px` (reserved for `.map-floating-controls`).
- **Responsive Clamping**: `.map-transit-hud` enforces `max-width: calc(100% - 68px)` so that even on narrow mobile viewports (`320px–375px`), it never collides with `.map-floating-controls` on the bottom-right.

### 2.2 Canonical Z-Index Stacking Registry
| Layer Tier | Z-Index | Assigned Elements |
| :--- | :--- | :--- |
| **Tier 0: Base Canvas** | `0` – `1` | `.webgl-map-container`, `.svg-map-fallback`, background graticules |
| **Tier 1: Map Markers & Stage Labels** | `10` – `15` | `.webgl-map-marker`, `.svg-moving-vehicle`, `.map-stage-label` |
| **Tier 2: Selected Pin & Active Vehicle** | `20` | `.webgl-map-marker.selected`, `.moving-vehicle-marker` |
| **Tier 3: Floating Map HUD & Controls** | `25` | `.map-transit-hud`, `.map-floating-controls`, `.map-toolbar` |
| **Tier 4: Viewport-Fixed Timeline Console** | `40` | Fixed bottom chronology scrubber (`PersonTimeline.tsx`, `RewindExplorer.tsx`) |
| **Tier 5: Global Navigation & Modals** | `50+` | `Shell.tsx` sticky header, `CommandPalette.tsx` (`⌘K`), `CitationModal.tsx`, `MediaDrawer.tsx`, expanded full-screen map (`.expanded-view`) |

### 2.3 Viewport-Bottom Console Clamping
- Both `PersonTimeline.tsx` and `RewindExplorer.tsx` clamp their playback and scrubbing consoles to `bottom: 0` with zero gap below the bar and `padding-bottom: max(0.75rem, env(safe-area-inset-bottom))`.
- Main page scroll containers must reserve matching bottom padding so the final card or footnote is never obscured behind the fixed console.

---

## 3. Component Alignment, Interaction & Accessibility Ergonomics

1. **Keyboard & Focus-Visible Parity**:
   - Every interactive control (`<button>`, tab trigger, slider thumb, map pin, HUD toggle) must exhibit an explicit `:focus-visible` ring (`outline: 2px solid #38bdf8; outline-offset: 2px`).
   - Full-screen or expanded views (`.expanded-view`, modals, drawers) must close cleanly on `Escape` and restore layout dimensions (`mapInstanceRef.current?.resize()`).
2. **Screen-Reader Live-Region Discipline**:
   - High-frequency visual animations (such as 60fps `requestAnimationFrame` updates to `telemetryAltRef` and `telemetryProgressRef`) must **never** reside inside an `aria-live` container or an element with an implicit live role (`status`, `alert`, `log`).
   - Screen-reader announcements must be routed exclusively through a separate, visually hidden (`className="sr-only"`) milestone element (`telemetryLiveRef` with `role="status" aria-live="polite" aria-atomic="true"`) that fires **only** on discrete state transitions (e.g., journey start `0%` and arrival `100% · Arrived`).
3. **Stateful Collapse Preservation**:
   - Collapsible panels that hold DOM-mutated or asynchronous state (such as `.transit-telemetry-grid` inside `.map-transit-hud`) must remain mounted using `hidden={!expanded}` and `aria-hidden={!expanded}` (backed by a state ref such as `telemetryStateRef`) rather than unmounting, ensuring that collapsing and re-expanding after arrival preserves `"Touchdown"` / `"100% · Arrived"`.
4. **Reduced-Motion Compliance (`prefers-reduced-motion: reduce`)**:
   - Whenever `window.matchMedia("(prefers-reduced-motion: reduce)").matches` is true, transit animations must bypass frame-by-frame interpolation, snap the vehicle marker and full route line immediately to the destination, and invoke `finalizeArrivalTelemetry(isAir)`.

---

## 4. Next-Generation Architectural & UI Design Concepts

The following architectural enhancements extend REWiND's visual and investigative capabilities while preserving all existing invariants:

1. **Synchronized Multi-Pane Investigative Workstation (`/person/[slug]` & `/event/[slug]`)**:
   - Optional split-screen layout pairing the 3D geospatial map on the left with a synchronized primary-source transcript & audio waveform reader on the right, allowing investigators to scrub speech timestamps and watch room-level participant focus shift in real time.
2. **Temporal Density & Archival Coverage Heatmap Rail**:
   - An inline sparkline overlay along the bottom chronological scrubber rail indicating event density per year/month and visually distinguishing heavily documented periods from archival gaps.
3. **Forensic Confidence Lens Filter**:
   - A one-click toggle in the workspace header that dims `"provisional"` and `"limited"` records to `35%` opacity while spotlighting `"verified"` + `"confirmed"` primary-source records, allowing instant visual assessment of evidentiary strength across a figure's timeline.
4. **Seamless Macro-to-Micro Venue Interior Transitions**:
   - When zooming into a multi-room compound in Satellite or Geopolitical mode (`zoom >= 13.5`), automatically surface interactive sub-venue badges (`venue_areas` such as *Oval Office*, *Rose Garden*, *General Assembly Hall*, *Pyramid Stage*) with room-specific participant rosters.
