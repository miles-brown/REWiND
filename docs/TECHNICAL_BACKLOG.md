# REWIND Technical Backlog & Forensic Audit Register

This document tracks forensic findings, accessibility audits, and architectural refinements identified during Pull Request code reviews. It establishes a prioritized register of backlog tasks to guide future development while maintaining REWiND's forensic rigor and WCAG 2.1 AA compliance.

---

## 1. Code Review Findings & Backlog Tasks

### Task 1: Radix Slider ARIA Attributes
- **Domain**: Accessibility (WCAG 2.1 AA)
- **Component**: [`components/ui/slider.tsx`](../components/ui/slider.tsx)
- **Priority**: High
- **Current Status**: ✅ **Resolved & Verified**
- **Findings**: The Radix UI Slider thumb must explicitly expose `aria-valuenow`, `aria-valuemin`, `aria-valuemax`, and `aria-valuetext` on the thumb element so screen reader users understand the timeline position, boundaries, and current historical event.
- **Resolution**: `components/ui/slider.tsx` forwards `aria-label`, `aria-valuetext`, `aria-valuenow`, `aria-valuemin`, and `aria-valuemax` directly to `SliderPrimitive.Thumb`.
- **Verification**: Fully covered and asserted by automated test suite [`tests/ui-components.test.mjs`](../tests/ui-components.test.mjs).


---

### Task 2: Map Marker Tooltip Accessibility
- **Domain**: Accessibility / Assistive Technology
- **Component**: [`components/rewind/MapGraphic.tsx`](../components/rewind/MapGraphic.tsx)
- **Priority**: Medium
- **Current Status**: 📋 **Open Refinement**
- **Findings**: Visual map markers render a `.marker-tooltip` span on hover. While the parent interactive button receives an `aria-label` (e.g., `"${rep.eventName}, ${rep.city} (${count} documented records)"`), any extended or secondary metadata in the tooltip should be explicitly associated for screen reader users.
- **Actionable Steps for Future PR**:
  1. Assign a unique deterministic ID to the tooltip span (e.g., `id={`marker-tip-${rep.id}`}`).
  2. Set `aria-describedby={`marker-tip-${rep.id}`}` on the marker button.
  3. Ensure tooltips remain visible when markers receive keyboard focus (`:focus-visible`).
  4. Consider migrating to Radix UI Tooltip primitive for standardized portal rendering and collision avoidance.

---

### Task 3: MapGraphic.tsx — Explicit `grouped` Map Type
- **Domain**: TypeScript Type Safety
- **Component**: [`components/rewind/MapGraphic.tsx`](../components/rewind/MapGraphic.tsx)
- **Priority**: Minor
- **Current Status**: ✅ **Resolved**
- **Findings**: The proximity clustering map was initialized with `new Map<string, typeof points>()`.
- **Resolution**: Explicitly typed as `new Map<string, EventRecord[]>()` to guarantee strict array item typing without intermediate type inference.

---

### Task 4: ISO-8601 Enforcement for Evidence Review Console
- **Domain**: Forensic Data Integrity & Archival Standards
- **Component**: [`app/admin/evidence/page.tsx`](../app/admin/evidence/page.tsx)
- **Priority**: Medium
- **Current Status**: 📋 **Open Refinement**
- **Findings**: For the Evidence Review Console, ensure all date/time data rendered into `.candidate-date` and `.time-col` strictly conforms to ISO-8601 formats (`YYYY-MM-DD` or `YYYY-MM-DDTHH:mm:ssZ`) for machine readability and chronological sorting.
- **Actionable Steps for Future PR**:
  1. Wrap all `.candidate-date` strings in semantic `<time dateTime="...">` elements.
  2. Enforce ISO-8601 regex or Zod string validation (`z.string().regex(/^\d{4}(-\d{2}(-\d{2})?)?/)`) during extraction parsing.
  3. Provide a standardized temporal display formatter (`formatArchivalDate()`) that displays the human-readable date while preserving ISO datetime in the markup attribute.

---

### Task 5: Map Legend Verbosity & User Comprehension
- **Domain**: UX / Information Architecture
- **Component**: [`components/rewind/MapGraphic.tsx`](../components/rewind/MapGraphic.tsx), [`components/rewind/PersonTimeline.tsx`](../components/rewind/PersonTimeline.tsx)
- **Priority**: Minor
- **Current Status**: 📋 **Open UX Review**
- **Findings**: The map marker status changed from "Verified Record" to "Verified". While concise, evaluate whether adding an explicit, collapsible map legend drawer or richer label clarity benefits first-time researchers.
- **Actionable Steps for Future PR**:
  1. Add a persistent or toggleable map legend overlay showing:
     - 🟢 **Verified Primary Record** (Tier-A archival corroboration)
     - 🟡 **Provisional Record** (Contemporary reporting pending primary citation)
     - 🟠 **Trajectory Arc** (Chronological journey between verified locations)
  2. Ensure all legend items use semantic SVG symbols paired with high-contrast text.

---

## 2. Long-Term Architectural Roadmap

| Milestone | Target Scope | Specification Reference |
| :--- | :--- | :--- |
| **Event Model v2 Migration** | Incremental upgrade of 206 seed records to neutral `canonicalTitle`, `EventPerson` participation, and tri-state flags. | [`docs/architecture/EVENT_MODEL_V2.md`](./architecture/EVENT_MODEL_V2.md) |
| **Atomic Claim Layer** | Deconstruct events into atomic claims corroborated by primary source excerpts and cryptographic hashes. | [`docs/METHODOLOGY.md`](./METHODOLOGY.md) |
| **Gazetteer Hierarchy** | Normalize physical venues into `Place` → `Venue` → `VenueArea` to model podium-level coordinates without duplication. | [`docs/DATA_SCHEMA.md`](./DATA_SCHEMA.md) |
