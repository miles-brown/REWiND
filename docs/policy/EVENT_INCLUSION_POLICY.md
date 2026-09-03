# REWIND Policy: Event Inclusion & Granularity Constitution

This document defines what constitutes a valid historical event within the **REWIND Evidence Atlas**, how event granularity and hierarchies are structured, and how presence and precision must be handled.

---

## 1. Definition of a REWIND Event

A **REWIND Event** is a verifiable, bounded spacetime occurrence involving one or more identified historical entities, supported by authenticated primary or high-quality secondary evidence.

An event is **NOT**:
- A continuous background state (e.g. "was Prime Minister throughout 1996").
- An unverified scheduling intention (e.g. "was scheduled to meet").
- A general opinion, characterization, or commentary without a specific speech or publication occurrence.
- An automated transit detection (e.g. flying through foreign airspace without public or official activity).

---

## 2. Event Granularity & Parent/Child Hierarchy

To prevent fragmentation and duplicate over-generation while preserving forensic precision, complex occurrences must be structured as **Parent (Macro)** and **Child (Micro)** events:

```
[Parent Event]
US Diplomatic Summit & State Visit — 04 February 2025 (Washington, D.C.)
  ├── [Child Event] Arrival & Reception at Joint Base Andrews
  ├── [Child Event] Oval Office Bilateral Meeting
  ├── [Child Event] Joint Press Briefing (White House Rose Garden)
  └── [Child Event] Archival Interview Broadcast
```

### Granularity Rules:
1. **Parent Events**:
   - Represent multi-phase summits, conferences, state visits, or multi-day treaty negotiations (e.g. *Camp David Summit, 5–17 July 2000*).
   - Carry the overarching temporal bounds and aggregate participant lists.
2. **Child Events**:
   - Represent discrete, timestamped occurrences within the parent (bilateral session, official toast, delivered speech, joint statement).
   - Carry specific venue coordinates, verbatim quotes, and speech recordings.
3. **Stand-Alone Events**:
   - Discrete occurrences that are not part of an extended multi-phase summit (e.g. *UN General Assembly Plenary Address, 23 September 2011*).

---

## 3. Presence Modes

Every participant in an event must have an explicit **Presence Mode**:

| Mode | Definition | Example |
| :--- | :--- | :--- |
| `physical` | Entity was physically present at the geographical venue. | Speaking at the Knesset Plenary podium in Jerusalem. |
| `remote-live` | Entity participated synchronously in real-time via video/audio link from a different location. | Live address via satellite to an international conference. |
| `remote-recorded` | Pre-recorded video/audio played during the event. | Video message broadcast during a symposium. |
| `telephone` | Bilateral or conference audio telephone exchange. | Diplomatic phone call between heads of state. |
| `written` | Official written communiqué, treaty signing by proxy, or executive declaration. | Promulgation of an official state decree. |
| `unknown` | Physical presence cannot be forensically confirmed from available evidence. | Unattributed meeting report under investigation. |

**Critical Rule**: When a participant is `remote-live`, the event location for that person is strictly their physical coordinates, **not** the coordinates of the broadcast studio or receiving audience.

---

## 4. Date & Temporal Precision Standards

Dates must never be guessed or fabricated. Every timestamp is assigned a strict **Precision Tier**:

- `exact-minute`: Timestamped to specific minute (`2025-02-04T14:07:00Z`).
- `exact-day`: Date verified to specific calendar day (`2025-02-04`).
- `month`: Occurrence verified to month and year (`1986-05`).
- `year`: Occurrence verified to year only (`1986`).
- `decade`: Approximate historical epoch (`1980s`).

### Occurrence vs. Publication Timestamps
- **`occurrenceDate`**: The actual date and time when the historical action took place (e.g. interview recorded on Monday).
- **`publicationDate`**: The date when the material was broadcast or published (e.g. documentary aired on Wednesday).
- If `occurrenceDate` is unconfirmed, the record must explicitly state `occurrenceDate = unknown` and index the `publicationDate` with a provisional flag.

---

## 5. Event Taxonomy

Every event must be categorized into one of the following validated event types:

1. `bilateral-meeting`: Official meeting between two primary state or institutional actors.
2. `multilateral-summit`: Multi-party conference, treaty summit, or diplomatic assembly.
3. `speech-plenary`: Formal delivered address to a legislative body, international assembly, or official plenary.
4. `press-conference`: On-the-record press briefing or media scrum.
5. `interview`: Archival broadcast, televised, or print interview.
6. `official-visit`: Official state arrival, diplomatic delegation, or inspection.
7. `signing-ceremony`: Official treaty, accord, or legislative enactment ceremony.
8. `parliamentary-debate`: Legislative debate, hearing, or inquiry testimony.
9. `protest-demonstration`: Major documented public assembly or demonstration.
10. `historical-action`: Significant operational, diplomatic, or governance action.
