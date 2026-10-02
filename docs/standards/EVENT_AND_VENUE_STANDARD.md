# REWiND Event, Venue & Geospatial Routing Standard

This document establishes the official data contracts, verification protocols, and formatting rules for historical events, venues, participant rosters, and transit/flight routes in the **REWIND Evidence Atlas**.

---

## 1. Event Entity Architecture

Every indexed event represents a verified chronological episode anchored in physical time, space, and archival documentation.

### 1.1 Event Titles & Summaries
- **`title`**: Concise, action-oriented factual title specifying the primary action, participants, and setting (e.g., *"Bilateral Oval Office Summit with President Clinton"*).
- **`summary`**: Multi-sentence factual synopsis summarizing what occurred, key agenda items discussed, and documented outcomes. Avoid speculation or unconfirmed interpretations.
- **`event_type`**: Controlled taxonomy tag (`"bilateral-meeting"`, `"multilateral-summit"`, `"speech-plenary"`, `"press-conference"`, `"treaty-signing"`, `"state-dinner"`, `"investigative-deposition"`, `"transit-journey"`).

### 1.2 Temporal Precision & Timezones
- **`start_date`** & **`end_date`**: Machine-readable ISO-8601 strings (`YYYY-MM-DD`, `YYYY-MM-DDTHH:mm:ssZ`, `YYYY-MM`, `YYYY`).
- **`temporal_precision`**: `"exact-minute"`, `"exact-day"`, `"month"`, `"year"`, `"decade"`.
- **`timezone_id`**: Canonical IANA timezone identifier (e.g., `"America/New_York"`, `"Asia/Jerusalem"`, `"Europe/London"`).
- **`local_start_time`** & **`local_end_time`**: 24-hour local clock timestamps (`"14:30"`, `"20:00"`).
- **`utc_offset_seconds`**: Exact offset in seconds factoring in daylight saving time status on that historical date.

---

## 2. Geospatial & Venue Hierarchy

Events in REWiND are spatially resolved down to the most granular verified physical structure.

```
┌─────────────────────────────────────────────────────────────┐
│                           PLACE                             │
│  City, country, and broad administrative district           │
│  (e.g., Washington, D.C., United States)                    │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                           VENUE                             │
│  Specific building, compound, palace, or complex            │
│  (e.g., The White House, 1600 Pennsylvania Avenue NW)       │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                        VENUE AREA                           │
│  Discrete interior room, hall, podium, or office            │
│  (e.g., Oval Office, Cabinet Room, Rose Garden)             │
└─────────────────────────────────────────────────────────────┘
```

### 2.1 Coordinate Integrity & Precision
- **`latitude` & `longitude`**: WGS-84 decimal degree coordinates formatted to 4–6 decimal places (e.g., `38.8977, -77.0365`).
- **`coordinate_precision`**:
  - `'exact-position'` — Specific room, desk, or podium within venue ($\pm 5\text{ m}$).
  - `'building'` — Verified building footprint ($\pm 25\text{ m}$).
  - `'campus-compound'` — Multi-building compound or airbase ($\pm 200\text{ m}$).
  - `'city'` — Municipal centroid when exact street address is unconfirmed ($\pm 5\text{ km}$).
- **Prohibition on Synthetic Nulls**: Events occurring at recognized historical venues must have verified WGS-84 coordinates resolved from the REWiND gazetteer.

---

## 3. Participants, Roles & Presence Confidence

Every event documents its attendee roster with forensic presence ratings:

### 3.1 Participant Roles
- **`principal`**: Primary convener, head of state, or headline speaker.
- **`co-principal`**: Counterpart head of state or bilateral counterpart.
- **`secondary`**: Cabinet minister, ambassador, chief negotiator, or translator.
- **`attendee`**: Accredited observer, delegation member, or audience member.

### 3.2 Presence Mode & Confidence
- **`attendance_mode`**: `'physical'`, `'remote-live'`, `'telephone'`, `'written'`, `'proxy'`.
- **`presence_confidence`**:
  - `'confirmed'` — Direct unedited video, audio, or official transcript corroborating physical presence.
  - `'strong'` — Credentialed contemporaneous press pool report and photographic evidence.
  - `'moderate'` — Official ministerial diary or delegation manifest.
  - `'limited'` — Uncorroborated single retrospective mention or inference.

---

## 4. Transit & Flight Corridor Hierarchy

When an event represents transit or travel between geographic nodes, REWiND enforces a strict precedence model:

### 4.1 Flight Corridors & Tail Numbers
- **`flight_identifier`**: Official flight number or callsign (e.g., `"Air Force One"`, `"SAM 29000"`, `"LY 001"`, `"N212JE"`).
- **`is_documented_flight`**:
  - `true` when tail number, flight plan, radar track, or passenger manifest is in evidence.
  - `false` when route is an auto-suggested Great-Circle corridor between known chronological stops.
- **`departure_airport_iata`** & **`arrival_airport_iata`**: 3-letter IATA codes (e.g., `"ADW"`, `"TLV"`, `"LHR"`, `"JFK"`).
- **`origin_waypoint`** & **`destination_waypoint`**: Structured JSON containing coordinate, ICAO code, and venue name.

### 4.2 3D Air Arc vs. Ground Routing
- **Air & Helicopter Transit**: Rendered as a 3D parabolic Bezier arc peaking at realistic cruising altitude ($35,000\text{ ft}$ for jetliner, $2,500\text{ ft}$ for helicopter), with camera pitching to $45^\circ$ to track the flight vector.
- **Car, Rail & Marine Transit**: Rendered as a progressive surface LineString snapped to the geographic road, rail, or maritime network.

---

## 5. Complete Form Field Specification for Events ("Golden Record" Checklist)

An event record achieves **Golden Record status** when all of the following are populated:

- [x] **`id`** & **`slug`**: Clean, deterministic slug (`"1996-07-09-bilateral-summit-white-house"`).
- [x] **`event_name`** / **`title`**: Descriptive, verifiable title.
- [x] **`start_date`** & **`temporal_precision`**: Validated ISO-8601 date.
- [x] **`city`**, **`country`**, **`venue_name`**: Exact gazetteer-resolved venue.
- [x] **`latitude`** & **`longitude`**: Verified decimal coordinates ($-90 \le \text{lat} \le 90$, $-180 \le \text{lng} \le 180$).
- [x] **`summary`**: Comprehensive 2–4 sentence factual summary.
- [x] **`event_types`**: Standardized taxonomy tags.
- [x] **`verification_status`**: `'verified'` with primary source documentation.
- [x] **`confidence`**: Evaluated rating (`'confirmed'`, `'strong'`, `'moderate'`).
- [x] **`participants`**: Full attendee list with roles and presence confidence.
- [x] **`sources`**: Linked primary source IDs with publishers and URLs.
- [x] **`claims`** & **`quotes`**: Attributed quotations with media timestamps.
- [x] **`transit`** (if travel): Documented mode, flight identifier, and waypoints.
