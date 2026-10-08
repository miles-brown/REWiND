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

---

## 5. Mobile Vessels as Venues (Aircraft, Trains, Ships, Motorcades)

Mobile vehicles and airborne/maritime vessels represent physical settings where historical actions occur (press gaggles, bilateral summits, oaths of office, strategic war rooms) but do **not** have a static physical street address.

### 5.1 Mobile Venue Entity Schema
- **`is_mobile_vessel`**: `true`.
- **`address_id`**: Strictly `null`. Never invent a synthetic street address or building number for an aircraft, train, or ship.
- **`vessel_type`**: `"aircraft"`, `"train"`, `"ship"`, `"motorcade"`, `"submarine"`.
- **`home_base_place_id`**: Geographic home station or port of registration (e.g., `plc-joint-base-andrews` for Air Force One; `plc-portsmouth-naval-base` for Royal Navy flagships).
- **`country_code`**: Sovereign flag state / operating jurisdiction (`"US"`, `"GB"`, `"IL"`, etc.).

### 5.2 Interior Sub-Venues & Compartments (`venue_areas`)
Mobile vessels are decomposed into granular interior `venue_areas`:
- **Air Force One (`ven-usaf-air-force-one`)**:
  - `area-afo-presidential-suite` (`area_type: "office"`): Forward executive stateroom & private office.
  - `area-afo-conference-room` (`area_type: "room"`): Mid-cabin secure airborne conference & briefing salon.
  - `area-afo-press-cabin` (`area_type: "room"`): Aft media pool seating (in-flight press gaggles).
  - `area-afo-cockpit` (`area_type: "cockpit"`): Flight operations deck.

### 5.3 Dynamic Geolocation Rules for Mobile Venues
1. **On Ground / Tarmac**: Coordinates reflect the airport apron, tarmac stand, or train platform where the vessel was positioned (e.g., LBJ Swearing-in aboard SAM 26000 at Dallas Love Field: `place_id: "plc-dallas-love-field"`, `venue_id: "ven-usaf-air-force-one"`, coordinates: `32.8471, -96.8517`).
2. **In Flight / Maritime Transit**: Coordinates reflect the interpolated geodesic or radar position along the travel corridor at that specific timestamp, while `venue_id` remains the vessel entity.

---

## 6. Multi-Stage & Multi-Day Umbrella Events (Glastonbury, Davos, UNGA, Olympics)

When historical events span multiple stages, buildings, or days (e.g., Glastonbury Festival, World Economic Forum Davos, UN General Assembly Plenary & Side Bilaterals):

```
┌─────────────────────────────────────────────────────────────┐
│                 EVENT SERIES (Umbrella)                     │
│  e.g., "series-glastonbury-2024", "series-unga-78"          │
└──────────────────────────────┬──────────────────────────────┘
                               │
            ┌──────────────────┴──────────────────┐
            ▼                                     ▼
┌──────────────────────────────┐    ┌──────────────────────────────┐
│  ATOMIC SUB-EVENT A          │    │  ATOMIC SUB-EVENT B          │
│  • Dua Lipa Headline Set     │    │  • Idles Performance         │
│  • 2024-06-28 22:00–23:45    │    │  • 2024-06-28 22:15–23:30    │
│  • Stage: Pyramid Stage      │    │  • Stage: Other Stage        │
└──────────────────────────────┘    └──────────────────────────────┘
```

### 6.1 Strict Co-Presence Isolation Invariant
- **Monolithic Event Ban**: Never ingest a 5-day festival or summit as a single monolithic event with dozens of attendees attached.
- **Atomic Sub-Events**: Every panel, keynote, speech, bilateral meeting, or headline performance must be an independent atomic `event` record tied to:
  1. Specific start and end timestamps (`startedDate`, `endedDate`).
  2. Specific sub-venue area (`venueAreaId` e.g., `area-pyramid-stage` or `area-bilateral-room-4`).
  3. The overarching `seriesId`.
- **Evidentiary Integrity**: This prevents false relationship inferences; two figures who appeared at Glastonbury on different days or different stages 2 miles apart will **never** be falsely evaluated as co-attendees in each other's physical presence.

---

## 7. The 10 Golden Evidentiary Edge-Case Rules

To ensure forensic consistency across the REWiND Evidence Atlas, all ingestion pipelines and researchers must enforce these 10 canonical rules:

1. **Rule 1: Moving & Transit Events (Protest Marches, Convoys, Rallies, Flights)**:
   - Origin and Destination MUST be separate sovereign `places` records.
   - The route trajectory is recorded in `routeCoordinates` / `journeyLegs`.
   - Never concatenate place names into compound entities (e.g., `"London / Brighton"` or `"Saudi Arabia / Israel"` is strictly banned by database constraints).

2. **Rule 2: Multi-Stage Festivals & Summits**:
   - Decompose into `event_series` (umbrella container) + discrete atomic sub-events tied to specific `venue_areas` (stages, salons).

3. **Rule 3: Remote, Virtual & Hybrid Appearances (Satellite, Video Link, Skype, Phone)**:
   - Host/Broadcast studio remains the event venue.
   - Remote attendee receives `RemoteLocation` metadata (venue, city, country, coordinates, connection mode, on-screen lower-third overlay text e.g., *"Live from Burbank"*).
   - The remote attendee's personal timeline displays **their remote location** and coordinates, NOT the host studio coordinates.

4. **Rule 4: Sessions Crossing Midnight & Multi-Day Overnight Talks**:
   - **Continuous Session** (uninterrupted 14-hour overnight filibuster or treaty session): Single atomic event with UTC ISO timestamps, local clock times, and `timezone_id`.
   - **Adjourned Sessions** (Summit Day 1, evening dinner, Day 2 morning plenary): Distinct atomic sub-events linked to parent `seriesId`.

5. **Rule 5: Disputed, Contradictory, or Competing Location Claims**:
   - The primary corroborated location takes the event record with `verification_status: "disputed"` and `confidence_score: "limited"`.
   - Competing location claims are attached as discrete `claims` with their own source citations. Never synthesize a fictional "compromise" coordinate.

6. **Rule 6: Secret Safehouses, Off-the-Record Meetings & International Waters**:
   - Never invent synthetic high-precision coordinates for unverified locations.
   - Set `coordinate_precision: "maritime-area"`, `"city"`, or `"country"` with `public_visibility: "public-coarse"`.
   - For high seas meetings: `country: "International Waters"`, place: `plc-international-waters-<region>`.

7. **Rule 7: Proxy & Representative Attendance**:
   - The diplomat or counsel who physically attended is the `Participant` with `role: "proxy"` and `capacityTitle: "Personal Representative of [Name]"`.
   - The absent principal is NOT marked as physically present.

8. **Rule 8: Multi-Leg Journeys & Emergency Flight Diversions**:
   - Each takeoff-to-landing segment is an independent stage in `journey_legs`.
   - Unscheduled diversions record the diversion airfield as the terminal waypoint for Leg 1 and the origin waypoint for Leg 2.

9. **Rule 9: Shared Hotel Buildings with Non-Overlapping Private Rooms**:
   - Physical co-location in a large hotel does NOT constitute co-presence.
   - Each delegation is anchored to their specific `venue_area_id` (`area-suite-35a` vs `area-presidential-suite`). They are only co-attendees if they share an explicit bilateral or multilateral event record.

10. **Rule 10: In-Transit Incidents & Briefings**:
    - Mobile vessels act as mobile venues (`ven-usaf-air-force-one`, `ven-presidential-limousine`).
    - Event coordinates reflect the approximate geocoded location of the vessel at that timestamp, with `transportMode` populated.

---

## 8. Complete Form Field Specification for Events ("Golden Record" Checklist)

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
- [x] **`participants`**: Full attendee list with roles, precedence ordering, central figure flags, capacities, and presence confidence.
- [x] **`sources`**: Linked primary source IDs with publishers and URLs.
- [x] **`claims`** & **`quotes`**: Attributed quotations with media timestamps.
- [x] **`transit`** (if travel): Documented mode, flight identifier, and waypoints.

