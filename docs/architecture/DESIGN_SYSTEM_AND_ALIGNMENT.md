# REWiND Evidence Atlas — Modernized Workstation Design System & Alignment Specification

This specification codifies the visual design system, typography, color harmony, spacing standards, and workstation layout architecture for the **REWIND Evidence Atlas**.

---

## 1. Color System: Deep Oceanic Obsidian

To eliminate visual fragmentation and establish a unified, prestigious dark canvas, all surfaces align to the **Deep Oceanic Obsidian** palette:

| Token Name | Hex Value | Purpose & Role | Contrast vs `#f8fafc` |
| :--- | :--- | :--- | :--- |
| `--bg-canvas` | `#070d12` | Root page background; deep obsidian canvas | $\ge 14:1$ |
| `--bg-surface` | `#0b151e` | Card, sidebar, and container background | $\ge 11:1$ |
| `--bg-surface-elevated` | `#101e2b` | Hovered cards, flyout menus, and active rail elements | $\ge 9:1$ |
| `--border-strong` | `#1e293b` | Primary card boundaries, sidebar edges, input borders | $\ge 4.5:1$ |
| `--border-subtle` | `rgba(255, 255, 255, 0.08)` | Internal card dividers and metadata separators | N/A |
| `--text-primary` | `#f8fafc` | Primary titles, event names, and headlines | Baseline |
| `--text-secondary` | `#cbd5e1` | Narrative descriptions, quotes, and primary metadata | $\ge 9:1$ |
| `--text-muted` | `#94a3b8` | Micro-labels, timestamps, and secondary captions ($\ge 11\text{px}$) | $\ge 4.8:1$ |
| `--accent-cerulean` | `#38bdf8` | Confirmed evidentiary milestones, interactive focus rings, active tabs | High-visibility accent |
| `--accent-amber` | `#f59e0b` | Provisional records, unverified sources, and cautionary notices | $\ge 4.6:1$ |
| `--accent-crimson` | `#ef4444` | Disputed historical claims, discrepancies, and critical alerts | $\ge 4.5:1$ |

---

## 2. Typography: High-Contrast Technical Grotesk

The typography pairing guarantees legibility at both dense small sizes and bold editorial headings:

- **Body & Subheadings**: **Inter** (via `next/font/google`), selected for its calibrated optical sizes, large x-height, and open apertures that prevent blur on dense evidentiary metadata.
- **Dates, Timestamps & Coordinates**: **JetBrains Mono**, featuring tabular numerals (`font-variant-numeric: tabular-nums`) so dates, coordinates, and telemetry stats never jitter or shift during playback.

---

## 3. Two-Column Workstation Layout & Collapsible Map Rail

Dossier pages (`/person/[slug]`, `/event/[slug]`, `/places`, `/compare`) adopt a **Two-Column Workstation Layout**:
1. **Left Sticky Map Rail (`CollapsibleMapRail.tsx`)**:
   - **Expanded (Default)**: 40% viewport width on desktop ($\ge 1024\text{px}$). Houses the interactive MapLibre GL stage, active stay badges, journey contrails, and 3D flight arcs.
   - **Minimized**: Shrinks to a sleek 64px rail with a radar pulse indicator, compass icon, vertical active city label, and quick-expand trigger.
   - **Keyboard Shortcut**: Press `M` anytime to toggle the map rail between expanded and minimized.
2. **Right Scrollable Chronology Column**:
   - Houses the detailed event narrative, co-attendee rosters, primary sources, and tabs. Content scrolls freely while the sticky map remains locked in view.

---

## 4. Dockable Timeline Console with Quick-Collapse Micro-Bar

The timeline playback console (`PersonTimeline.tsx` and `RewindExplorer.tsx`) docks along the bottom of the viewport with a two-state control:
1. **Quick-Collapse Micro-Bar (`38px` height)**:
   - When collapsed, occupies only 38px: shows current event date, event counter (`14 / 206`), compact prev/play/next buttons, event title preview, and `[ Expand Scrubber ⤢ ]`.
2. **Full Scrubber Slider (`70px+` height)**:
   - When expanded, reveals the full chronological slider thumb, decade milestone jump pills (`1970s`, `1980s`), playback speed selector, and reverse REWIND toggle.
3. **Keyboard Shortcut**: Press `T` anytime to toggle the bottom console between micro-bar and full scrubber.

---

## 5. 8pt Spacing Grid & De-Squashed Modular Cards

All cards across the site are built on an 8pt grid with minimum 20px padding (`--card-pad: 20px;`) and a strict 3-tier layout:
- **Tier 1 (Header)**: Date (JetBrains Mono) + Event Type Pill + Verification Status Badge.
- **Tier 2 (Narrative)**: Headline (18–20px bold) + Summary + Co-Attendee Monograms.
- **Tier 3 (Footer)**: Physical Venue with Map Pin + Source Citation Pill + Action Links.

