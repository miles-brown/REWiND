# REWiND Master Taxonomy, Content Logic & System Functions Specification

This document is the canonical reference for **controlled taxonomies, content formatting logic, participant/venue rules, and all 12 core system functions** across the **REWiND Evidence Atlas**.

AI code assistants, ingestion pipelines, and human contributors must consult this specification whenever classifying entities, implementing business logic, or extending system capabilities.

---

## 1. Master Controlled Taxonomies

### 1.1 Event Category & Event Type Taxonomy
Every event record (`EventRecord` / `EventV2`) is classified using two complementary tiers:
- **`categories`** (Broad Thematic Domain — `string[]` / `EventTopic[]`)
- **`eventTypes`** (Specific Operational Format — `string[]` / `EventV2.eventType`)

| Canonical Category | Permitted `eventTypes` | Evidentiary & Content Requirements |
| :--- | :--- | :--- |
| **`Diplomacy`** | `bilateral-meeting`, `multilateral-summit`, `treaty-signing`, `state-dinner`, `diplomatic-reception`, `backchannel-negotiation` | Must list all participating delegations/principals, host venue, and official communiqué or archival protocol record. |
| **`Governance & Executive`** | `cabinet-session`, `executive-order`, `oath-of-office`, `official-appointment`, `crisis-briefing`, `state-visit` | Must cite official government gazette, executive diary, or national archive record. |
| **`Parliamentary & Legislative`** | `speech-plenary`, `parliamentary-vote`, `committee-hearing`, `legislative-debate`, `state-opening` | Must reference parliamentary Hansard, Knesset protocol, Congressional Record, or UN verbatim record (`A/39/PV...`). |
| **`Electoral & Campaign`** | `election`, `campaign-rally`, `party-convention`, `televised-debate`, `concession-victory-speech` | Must record jurisdiction, electoral body, and contemporary broadcast or certified electoral return. |
| **`Judicial & Investigative`** | `investigative-deposition`, `court-appearance`, `tribunal-testimony`, `indictment-filing`, `commission-inquiry` | Must cite docket/protocol identifier, presiding body, and sworn transcript or court registry. |
| **`Media & Public Address`** | `press-conference`, `broadcast-interview`, `keynote-address`, `panel-discussion`, `op-ed-publication` | Must distinguish host/moderator (`association: "host"` / `"moderator"`) from subject (`association: "interviewee"` / `"speaker"`). |
| **`Cultural, Academic & Arts`** | `live-performance`, `festival-set`, `award-ceremony`, `academic-lecture`, `book-launch`, `exhibition-opening` | Multi-stage festivals must use `event_series` + stage-level `venue_areas` (see [EVENT_AND_VENUE_STANDARD.md](./EVENT_AND_VENUE_STANDARD.md)). |
| **`Royalty & State Ceremonial`** | `coronation`, `royal-wedding`, `state-funeral`, `investiture`, `trooping-the-colour`, `jubilee-service` | Personal names must remain free of regnal ordinals; numbered titles belong strictly in `roles-seed.ts`. |
| **`Transit & Movement`** | `transit-journey`, `presidential-flight`, `diplomatic-convoy`, `maritime-voyage`, `emergency-diversion` | Origin and destination must be separate sovereign `places`; mobile vessels modeled with `is_mobile_vessel: true`. |

---

### 1.2 Person Classification, Official Role vs. Event Capacity Taxonomy

#### A. Person Primary Classification (`PersonRecord.classification`)
Each person in `data/people-master-seed.ts` and `db/schema-v2.ts` is assigned a primary classification from the controlled set:
- `head-of-state`
- `head-of-government`
- `monarch-royal`
- `legislator`
- `cabinet-minister`
- `diplomat`
- `judicial-official`
- `military-commander`
- `intelligence-official`
- `religious-leader`
- `journalist-broadcaster`
- `cultural-figure`
- `academic-expert`
- `business-executive`
- `civil-society-leader`

#### B. Strict Separation: Personal Name vs. Official Role vs. Event Capacity
```
┌─────────────────────────────────────────────────────────────────────────┐
│ 1. PERSONAL IDENTITY (PersonRecord.canonicalName / displayName)         │
│    • Strictly the person's human name: "Tenzin Gyatso",                 │
│      "Charles Philip Arthur George", "Benjamin Netanyahu"               │
│    • NEVER embed numbered offices ("14th Dalai Lama", "42nd President") │
├─────────────────────────────────────────────────────────────────────────┤
│ 2. OFFICIAL ROLE / TENURE (OfficialRoleSeed in data/roles-seed.ts)      │
│    • Time-bounded public office, title, or mandate with startDate/end   │
│    • e.g. "14th Dalai Lama" (1940–present),                             │
│      "Prime Minister of Israel" (1996–1999, 2009–2021, 2022–present)    │
├─────────────────────────────────────────────────────────────────────────┤
│ 3. EVENT CAPACITY / ASSOCIATION (EventParticipant.association)          │
│    • What the person did at THIS specific event:                        │
│      "principal", "co-principal", "speaker", "host", "moderator",       │
│      "interviewee", "panelist", "performer", "contestant",              │
│      "expert-contributor", "proxy", "attendee"                          │
└─────────────────────────────────────────────────────────────────────────┘
```

#### C. Participant Precedence Ordering (`lib/rewind/events.ts`)
When rendering participants on an event card or timeline dossier, participants are deterministically ordered by evidentiary centrality:
1. **Central / Principal Figures** (`isCentralFigure: true` or `association: "principal"` / `"speaker"` / `"performer"` / `"interviewee"`)
2. **Co-Principals & Counterparts** (`association: "co-principal"` / `"host"` / `"moderator"`)
3. **Named Delegation & Secondary Participants** (`association: "panelist"` / `"expert-contributor"` / `"proxy"`)
4. **General Attendees & Observers** (`association: "attendee"`)

---

### 1.3 Geospatial & Gazetteer 4-Tier Taxonomy
All spatial records resolve through a strict 4-tier hierarchy (`lib/rewind/places.ts`, `docs/standards/LOCATION_STANDARD.md`):
1. **Tier 1 — Sovereign Country / Jurisdiction** (`country`, ISO 3166-1 alpha-2 `countryCode`; compound strings like `"USA / UK"` are strictly prohibited).
2. **Tier 2 — Municipality / City / Locality** (`city`, `region`, gazetteer `Place` entity).
3. **Tier 3 — Physical Street Address** (`Address` entity with country-aware formatting; `null` for `is_mobile_vessel: true`).
4. **Tier 4 — Venue & Sub-Venue Area** (`Venue` building/complex -> `VenueArea` specific room, stage, podium, or cabin).

---

### 1.4 Evidentiary Confidence & Verification Taxonomy
| Dimension | Controlled Values | Default Value | Promotion Criteria |
| :--- | :--- | :--- | :--- |
| **`verificationStatus`** | `"verified"` \| `"provisional"` \| `"disputed"` | `"provisional"` | Promoted to `"verified"` only when linked to $\ge 1$ Tier-1 primary source (`official-record`, `transcript`, `archive-video`, `archive-audio`) with verified locator. |
| **`confidence`** | `"confirmed"` \| `"strong"` \| `"moderate"` \| `"limited"` | **`"limited"`** *(Mandatory Invariant)* | `"confirmed"` requires direct primary record; `"strong"` requires corroborated contemporary press/photo; `"moderate"` requires official diary/manifest. |
| **`datePrecision`** | `"exact"` \| `"day"` \| `"month"` \| `"year"` \| `"range"` \| `"unknown"` | `"day"` | Must match the granularity proven by the source (never invent `"01-01"` for year-only dates). |
| **`locationPrecision`** | `"exact-position"` \| `"building"` \| `"venue"` \| `"city"` \| `"country"` \| `"unknown"` | `"city"` | Must never claim finer precision than the primary source establishes. |

---

## 2. Complete Catalog of System Functions & Logic Contracts

Every functional subsystem in the REWiND Evidence Atlas is governed by a deterministic input-validation-output contract:

### Function 1: Chronology & Bidirectional REWIND Engine
- **Modules**: `components/rewind/PersonTimeline.tsx`, `components/rewind/RewindExplorer.tsx`
- **Logic Contract**:
  - Maintains `currentIndex`, `direction` (`"forward"` | `"rewind"`), and `isPlaying` state.
  - Clamps index bounds to `[0, visibleEvents.length - 1]` and halts playback automatically when reaching index `0` (in `"rewind"`) or `visibleEvents.length - 1` (in `"forward"`).
  - Syncs active event slug to URL (`?evt=<slug>`) without triggering full-page reloads.
  - Emits keyboard navigation handlers (`ArrowLeft`, `ArrowRight`, `Shift+Arrows`, `Home`, `End`, `Space`, `R`).

### Function 2: Geospatial Contrails, 3D Flight Arcs & Surface Routing Engine
- **Modules**: `components/rewind/MapGraphic.tsx`, `lib/rewind/travel.ts`, `lib/rewind/routing.ts`, `lib/rewind/transport.ts`
- **Logic Contract**:
  - Classifies consecutive chronological events into transport modalities via `resolveJourneyTransport(prevEvent, currEvent)`.
  - **Air Transit (`isAirTransport(mode)`)**: Computes 3D parabolic Bezier Great-Circle curves (`calculate3DGreatCircleArc`) or uses documented waypoints (`resolveFlightCorridorTrajectory`). Draws progressive contrails (`updateActiveLegRoute`) with altitude-tiered glow (`#818cf8` for `air-force-one`, `#38bdf8` for standard flight, `#34d399` for helicopter) and pulsing vapor emitter (`.vehicle-contrail-emitter`).
  - **Ground / Rail / Maritime Transit**: Queries Mapbox Directions / OSRM (`fetchTransitRoute`) with curved spline fallback (`generateCurvedFallbackTrajectory`) and draws progressive surface paths.
  - **Forensic Transit Telemetry HUD (`.map-transit-hud`)**: Displays real-time altitude/elevation, eased trajectory completion percentage (`Math.round(p * 100)%`), city corridor endpoints, and evidentiary corridor status (`Verified Flight Log` vs `Documented Flight Metadata` vs `Suggested Corridor`).
  - **Verified Flight Badge Gate (`hasVerifiedFlightEvidence`)**: Strictly requires `activeJourney.isDocumentedFlight && currEvent?.verificationStatus === "verified" && (currEvent?.confidence === "confirmed" || currEvent?.confidence === "strong") && nonEmptySources`.

### Function 3: Multi-Tier Gazetteer & Place Hierarchy Resolver
- **Modules**: `lib/rewind/places.ts`, `components/rewind/PlacesExplorer.tsx`, `app/places/page.tsx`, `app/place/[slug]/page.tsx`
- **Logic Contract**:
  - Aggregates all events, venues, addresses, and sub-venue areas into a 4-tier navigable tree (`Country -> City -> Venues & Addresses -> Sub-Venue Areas`).
  - Resolves any tier slug via `getPlaceBySlug(slug)` and formats display labels via `formatEventVenue` and `formatEventLocation`.

### Function 4: Remote Attendance Localization & Narrative Generator
- **Modules**: `lib/rewind/events.ts`, `lib/rewind/types.ts`
- **Logic Contract**:
  - When a participant attends remotely (`attendanceMode: "remote-live"` | `"telephone"` | `"video-link"` with `remoteLocation`), localizes the event on **that participant's timeline** to their physical remote coordinates and city while referencing the host venue in contextual metadata.
  - Generates natural-language evidentiary narratives via `formatParticipantTimelineNarrative(event, personSlug)` describing the subject's exact role, capacity, and counterpart interactions.

### Function 5: Cross-Timeline Comparison & Spacetime Intersection Engine
- **Modules**: `components/rewind/TimelineComparison.tsx`, `app/compare/page.tsx`, `app/relationship/[a]/[b]/page.tsx`, `app/relationship/meeting/[...slugs]/page.tsx`
- **Logic Contract**:
  - Guards against self-comparison (`slugA !== slugB`).
  - Computes direct co-present encounters (shared atomic `event.id` and overlapping `venueAreaId` / timestamps), shared cities on identical dates, and longitudinal relationship arcs.

### Function 6: Global `⌘K` Multi-Entity Search & Command Palette
- **Modules**: `components/rewind/CommandPalette.tsx`, `app/api/search/route.ts`
- **Logic Contract**:
  - Indexes Events, People, Places/Venues, Quotes, Topics, and Archival Sources with instant keyboard navigation and category grouping.

### Function 7: Archival Speech, Audio Waveform & Verbatim Quote Vault
- **Modules**: `components/rewind/MediaDrawer.tsx`, `app/quotes/page.tsx`
- **Logic Contract**:
  - Renders verbatim quotations with speaker attribution, ISO-639-1 language tag, media timestamp, waveform visualization, and graceful audio error recovery.

### Function 8: Academic Citation & Forensic Dossier PDF Exporter
- **Modules**: `lib/citations.ts`, `components/rewind/CitationModal.tsx`, `app/api/export/event/[slug]/pdf/route.ts`, `app/api/export/person/[slug]/pdf/route.ts`
- **Logic Contract**:
  - Produces deterministic BibTeX, APA 7th, Chicago 17th, and JSON citations.
  - Renders print-ready, ISO-8601-stamped archival PDF dossiers with provenance checklists and source registers.

### Function 9: Forensic Discrepancy & Contradiction Auditor
- **Modules**: `components/rewind/DiscrepancyViewer.tsx`, `docs/standards/CORRECTIONS_AND_DISPUTES.md`
- **Logic Contract**:
  - Surfaces competing primary/secondary claims side-by-side when `verificationStatus === "disputed"` or `conflictingClaims` are present, preserving all provenance without deleting disputed records.

### Function 10: Autonomous Multi-Source Ingestion, Deduplication & Policy Pipeline
- **Modules**: `lib/ingestion/pipeline.ts`, `lib/ingestion/resolve.ts`, `lib/ingestion/policy.ts`, `app/admin/evidence/page.tsx`, `app/api/admin/evidence/route.ts`
- **Logic Contract**:
  - Validates raw candidate payloads via Zod schemas (`CandidateEventSchema`).
  - Resolves people and gazetteer venues without surname-only false positives.
  - Performs live asynchronous duplicate detection (`findDuplicateEventAsync`) before insert; merges corroborating claims via `persistedClaimIds` or generates deterministic collision suffixes (`evt-...-2`) for distinct same-day events.
  - Enforces publication lane policy (`evaluatePublicationPolicy`): blocks approval/merge unless valid archival `sourceIds` exist.

### Function 11: Dual-Read Event Model v1 <-> v2 Knowledge Graph Adapter
- **Modules**: `lib/models/event-v2.ts`, `lib/adapters/event-v2-adapter.ts`, `db/schema-v2.ts`
- **Logic Contract**:
  - Bi-directionally converts between flat `EventRecord` (v1) and normalized relational `EventV2` (v2) with tri-state factual flags (`"yes" | "no" | "unknown"`) and 3-tier coordinates.

### Function 12: Automated Verification, Git Workflow & Safe-Merge Guard
- **Modules**: `scripts/verify-git-workflow.mjs`, `scripts/safe-branch-merge.mjs`, `scripts/gemini-pr-review.mjs`, `tests/*.test.mjs`
- **Logic Contract**:
  - Enforces branch isolation (`--base main`), zero open child PR cascade checks before `--delete-branch`, pinned `--match-head-commit` squash merges, and 220+ automated forensic and accessibility unit tests.

---

## 3. New System Function & Logic Ideas (Architectural Roadmap)

1. **Physical Plausibility & Velocity Auditor (`lib/rewind/plausibility.ts`)**:
   - Automatically calculates the Haversine distance and elapsed time between consecutive events on a person's timeline ($\Delta d / \Delta t$). If two physical appearances require supersonic ground travel or impossible turnaround times without an intervening flight record or `remote-live` flag, automatically flags the pair for editorial geocoding/timezone review.
2. **Transitive Diplomatic & Co-Attendance Graph Engine (`lib/rewind/network.ts`)**:
   - Computes weighted co-attendance edges across all figures in the corpus, distinguishing direct bilateral meetings (weight `1.0`), small-group panels (`0.6`), and large plenary sessions (`0.2`), powering an interactive network graph filterable by year range and topic.
3. **Historical Timezone & Daylight Saving Reconciler (`lib/rewind/temporal.ts`)**:
   - Normalizes local event start/end clock times against historical IANA timezone rules to display synchronized dual clocks (`Local Venue Time` + `UTC Universal Time`), crucial for reconstructing international crisis timelines and overnight summits.
4. **Automated Golden Record Completeness Scorer (`lib/rewind/scoring.ts`)**:
   - Computes a deterministic `0–100` completeness score for every event and person dossier based on primary source presence, coordinate precision, participant role/capacity completeness, and verbatim quote coverage, surfacing the highest-priority enrichment targets in `/admin/evidence`.

