# REWiND Temporal Data Standard

## 1. Objective

This standard defines the temporal data model and forensic rules for all historical events, appearances, and timelines recorded in the **REWIND Evidence Atlas**.

Historical events must preserve the temporal evidence established by underlying sources, distinguishing what is known with certainty from what is inferred, approximate, or unknown.

---

## 2. Canonical ISO-8601 Machine Format

All dates and timestamps in the REWiND database and APIs must be stored and exchanged in unambiguous ISO formats:

- **Calendar Dates**: `YYYY-MM-DD` (e.g., `2025-02-04`). Culturally ambiguous formats (`04/02/2025`, `02/04/2025`, `4.2.25`) are strictly prohibited in the storage and data layers.
- **Timestamps**: Explicit ISO-8601 with offset or UTC:
  - Offset representation: `2025-02-04T14:37:00-05:00`
  - Canonical UTC: `2025-02-04T19:37:00Z`
- **Separation of Storage and Display**: Human-facing representations (e.g., *"Tuesday, 4 February 2025"*, *"2:00 PM EST"*) are generated dynamically by display formatting utilities based on locale, never stored as raw database values.

---

## 3. Temporal Precision Spectrum

The database does not assume an exact timestamp exists for every historical event. Temporal precision is explicitly modeled:

| Precision Level | Database Representation | Example |
| :--- | :--- | :--- |
| **exact-timestamp** | ISO timestamp with time | `2025-02-04T14:37:00` |
| **exact-day** | ISO date (`YYYY-MM-DD`) | `2025-02-04` |
| **approximate** | Base date + temporal window | Approx `14:30` |
| **range** | `start_date` / `end_date` | Between `14:20` and `14:45` |
| **month** | `YYYY-MM` | `2025-02` |
| **year** | `YYYY` | `2025` |
| **circa** | Approximate era/year | `c. 1963` |
| **unknown** | Not established | Nullable with research note |

---

## 4. Local Civil Time & Time Zone Architecture

Historical events must record the **civil/local time experienced at the event's geographical location**:

1. **IANA Time Zone Database**: Store standard IANA time zone identifiers (e.g., `America/New_York`, `Europe/London`, `Asia/Jerusalem`, `Europe/Zagreb`). Single abbreviations (`EST`, `GMT`, `BST`) are ambiguous across regions and must only be stored as derived display properties.
2. **Instant Offset**: Store the exact UTC offset in seconds active at that location on that date (accounting for historical daylight saving transitions).
3. **Time Standards**: Record the time standard identified by the source:
   - `local civil time`
   - `UTC` / `GMT` / `UT`
   - `broadcast clock time`
   - `military time`
   - `official schedule time`
   - `recording timestamp`
   - `server/platform timestamp`
   - `unknown`
4. **Historical Time Zone Confidence**: For events prior to 1970, time-zone reconstruction must specify `timezone_confidence` (`exact`, `converted`, `estimated`, `uncertain`) and `time_conversion_method`.

---

## 5. Automated Day of Week Derivation

The day of the week must normally be **derived mathematically from the calendar date** (e.g., `2025-02-04` $\rightarrow$ `Tuesday`), preventing manual human data-entry errors. Generated or indexed columns may store the day of week for high-performance query filtering.

---

## 6. Duration & Basis

Duration is modeled separately from start and end timestamps to avoid conflating event length with recording length:

- `duration_seconds`: Total elapsed seconds.
- `duration_precision`: `exact`, `to nearest minute`, `approximate`, `minimum`, `maximum`, `range`, `unknown`.
- `duration_basis`:
  - `measured from complete recording`
  - `official programme schedule`
  - `arrival/departure timestamps`
  - `published running time`
  - `estimated from footage`
  - `reported duration`
  - `unknown`

*Example*: REWiND distinguishes *"The interview recording lasts exactly 23m 41s"* from *"Netanyahu was at the venue for approximately 45 minutes"*.

---

## 7. Public and National Holidays

Where relevant to historical context (e.g., diplomatic recesses, election-day events, national mourning), events record:
- `holiday_applicable`: Boolean indicator.
- `holiday_name`: Specific holiday title (e.g., *"Presidents' Day"*).
- `holiday_type`: `national holiday`, `public holiday`, `bank holiday`, `federal holiday`, `state/regional holiday`, `religious holiday`, `official day of mourning`, `election day`.
- `holiday_jurisdiction`: The exact territory observing the holiday (e.g., `US-DC`, `IL`, `GB-ENG`).
