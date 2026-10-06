# REWIND Forensic Evidence Methodology

## Principles of Chronological Integrity

The **REWIND Evidence Atlas** is constructed around verifiable historical documentation. Unlike conventional biographies or subjective histories, REWIND indexes human actions and statements as discrete, verifiable spacetime points.

---

## 1. Source Classification Hierarchy

Every event in REWIND is anchored to one or more sources, classified under strict archival tiers:

### Tier 1: Primary Evidence (Preferred)
- **Official Government & Parliamentary Records**: Stenographic records (e.g. Knesset Plenary records, Congressional Record, Hansard).
- **Original Broadcast Footage & Audio**: Unedited news reels, official press conference tapes, and live transmissions.
- **Signed Treaties & Communiqués**: Instruments of ratification, diplomatic accords, and official press statements released synchronously with the event.
- **Declassified Documents**: State department cables, intelligence memoranda, and cabinet minutes released under FOIA or national archives.

### Tier 2: Contemporary Secondary Reporting
- **First-hand Press Coverage**: Reports by credentialed journalists present at the venue on the date of occurrence (e.g. *Associated Press*, *Reuters*, *The New York Times*, *Haaretz*).
- **Archival Photographs**: Timestamped, accredited photojournalism from wire agencies.

### Tier 3: Retrospective Scholarly Research
- Peer-reviewed academic treatises, historical monographs, and published memoirs.
- These sources are used to substantiate context or discover event dates, but require verification against Tier 1 or Tier 2 records for `verified` status.

---

## 2. Verification Scoring Model

| Verification Status | Evidentiary Basis | Display Marker |
| :--- | :--- | :--- |
| **`verified`** | Backed by at least one Tier 1 primary record or multiple corroborated Tier 2 contemporary reports confirming date, location, and presence. | Solid Green Checkmark |
| **`provisional`** | Documented in reputable historical secondary literature, but lacking a direct timestamped audio/transcript primary record in the atlas index. | Dashed Amber Indicator |
| **`disputed`** | Contradictory primary accounts exist regarding the date, attendees, or exact statements made. | Flagged Disputed Indicator |

---

## 3. Geospatial Precision Guidelines

Coordinates assigned to events in `MapGraphic` adhere to four levels of location precision:

1. **`venue`**: Exact geographic coordinates of the building, podium, room, or landmark (e.g., *Wye River Conference Center*, *UN General Assembly Hall*).
2. **`city`**: Centroid of the municipality where the event transpired.
3. **`country`**: National centroid when only the country is established.
4. **`unknown`**: No geospatial mapping rendered.

> [!NOTE]
> Coordinates represent documented attendance at an event—they are not a claim of continuous physical trajectory between disparate points in time.

---

## 4. Permanent Addition & Non-Deletion Rule

The REWiND Evidence Atlas operates on a strict **Permanent Addition Protocol**:
- **Zero Record Deletions**: Once any entity (Person, Event, Place/Venue, Source, Timeline Role, Milestone, or Biography) has been added to the database, it must **NEVER be deleted**.
- **Additive & Cumulative Invariant**: All dataset updates must strictly expand, enrich, correct, or merge records.
  1. **Deduplication & Merging**: When multiple ingestion sources report the exact same real-world historical event, they are merged via `findDuplicateEventAsync`, unifying all citations, quotes, and participant rosters without losing historical context.
  2. **Sparse / Low-Information Records**: Records with minimal initial metadata must NEVER be discarded. They are preserved and queued for vacuum crawler enrichment (adding primary transcripts, exact coordinates, dates, and biographical tenures).
  3. **Erroneous / Disputed Data**: Incorrect details must be corrected in place; disputed claims are categorized under `verificationStatus: "disputed"` and `confidence: "limited"`, preserving a full forensic audit trail.

---

## 5. Vacuum Scraper & Multi-Source Ingestion Architecture

Automated vacuum-type scrapers and web crawlers discover, extract, and index evidence across heterogeneous global sources:
- **Continuous Multi-Source Scraping**: Crawls official government gazettes, parliamentary transcript repositories (e.g. Hansard, Knesset, Congressional Record), international organization archives (UN, EU, ICJ), unedited broadcast footage, and accredited news wire services.
- **Live Ingestion Deduplication**: Queries live PostgreSQL tables asynchronously before persistence to prevent duplicate event creation.
- **Participant Completeness**: Ingestion pipelines verify that event rosters capture 100% of confirmed attendees, speakers, signatories, and observers without omission.

---

## 6. Participant Role & Capacity Separation Standard

Every participant indexed in an historical event MUST distinguish their official public office from their specific capacity in that event:
- **`role` (Official Title / Public Office)**: The person's official office, mandate, or title at the time of the event (e.g. *"President of the United States"*, *"Chief Rabbi"*, *"London Borough of Lambeth Presiding Officer"*, *"Leader of the Opposition"*).
- **`association` (Event Participation Capacity)**: The specific function or capacity in which the individual participated in the event (e.g. `interviewee`, `host`, `moderator`, `participant`, `contestant`, `expert-contributor`, `attendee`, `keynote-speaker`, `delegate`, `witness`, `presiding-officer`, `signatory`, `honoree`).

