# REWIND Accessibility & Interaction Contract

REWIND is committed to strict compliance with **WCAG 2.1 AA** standards and modern WAI-ARIA accessibility patterns.

---

## 1. WAI-ARIA Slider Semantics

The timeline scrubber (`components/ui/slider.tsx` wrapping Radix UI Slider) enforces proper accessibility trees for screen readers:

- **Thumb Role**: The interactive draggable thumb carries `role="slider"`.
- **Accessible Name**: Derived from `aria-label` or `getAriaLabel` (e.g., `aria-label="Benjamin Netanyahu timeline position"`).
- **Live Value Text**: The `aria-valuetext` property is explicitly rendered on the `SliderPrimitive.Thumb` element, announcing dynamic natural language summaries (e.g. `aria-valuetext="1 of 206: 1949-10-21, Born in Tel Aviv"`).
- **Range Bounds**: `aria-valuemin="0"` and `aria-valuemax="<length - 1>"` reflect the available index boundaries.

---

## 2. Live Regions & Screen Reader Announcements

- **Polite Status Updates**: The active event stage (`.person-event-stage`, `.selected-event`) is marked with `aria-live="polite"`. When the timeline index updates—via slider scrub, button click, or auto-playback—assistive devices announce the change without interrupting critical user actions.
- **Skip Links**: A hidden-until-focused skip link (`<a className="skip-link" href="#main-content">`) is positioned as the very first element inside `Shell.tsx` to enable quick bypass of global navigation.

---

## 3. Keyboard Navigation Contract

Users can navigate the entire application without a pointing device:

| Key | Action | Scope |
| :--- | :--- | :--- |
| `⌘K` / `Ctrl+K` | Open global Command Palette | Global |
| `←` / `→` | Step back / forward 1 historical event | Timeline Console |
| `Shift + ←` / `Shift + →` | Jump back / forward 5 historical events | Timeline Console |
| `Space` | Toggle playback (play / pause) | Timeline Console |
| `Home` / `End` | Jump to the very first / last documented event | Timeline Console |
| `R` | Toggle playback direction (Forward vs REWIND) | Timeline Console |
| `?` | Toggle keyboard shortcuts reference bar | Timeline Console |
| `Esc` | Close Command Palette or Citation Modal | Dialog Overlays |
| `↑` / `↓` + `Enter` | Navigate and open Command Palette search results | Command Palette |

---

## 4. Reduced Motion Preferences

All CSS animations and transitions respect the operating system's motion settings via `@media (prefers-reduced-motion: reduce)`:
- Pulse animations (`.live-pulse`, `.map-point.selected`) are halted.
- Slider range and thumb transitions are rendered instantly without sliding interpolation.
