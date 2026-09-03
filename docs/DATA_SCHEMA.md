# REWIND Data Schema Specification

This document defines the core data contracts and schemas utilized throughout the **REWIND Evidence Atlas**.

---

## 1. Types & Enums

### Precision
Describes the temporal resolution of an event record.
```typescript
export type Precision = "exact" | "day" | "month" | "year" | "range" | "unknown";
```

### Verification
Status assigned after editorial verification against primary documentation.
```typescript
export type Verification = "verified" | "provisional" | "disputed";
```
- **`verified`**: Backed by a direct primary source (contemporary footage, official transcript, treaty document).
- **`provisional`**: Sourced from reputable contemporary reporting or historical summaries, pending corroboration.
- **`disputed`**: Conflicting accounts exist between primary witnesses or contemporary records.

### Confidence
Confidence grading of the documented claims.
```typescript
export type Confidence = "confirmed" | "strong" | "moderate" | "limited";
```

---

## 2. Entity Schemas

### `EventRecord`
The primary atomic unit representing an indexed historical event.
```typescript
export interface EventRecord {
  id: string;                                   // Unique identifier, e.g. "evt-1996-election"
  slug: string;                                 // URL-safe slug, e.g. "1996-first-prime-ministerial-election"
  eventName: string;                            // Descriptive event title
  summary: string;                              // Multi-sentence factual summary
  categories: string[];                         // High-level grouping, e.g. ["Politics", "Diplomacy"]
  eventTypes: string[];                         // Specific taxonomies, e.g. ["Election", "Address", "Treaty"]
  startDate: string;                            // ISO YYYY-MM-DD format
  endDate: string | null;                       // Optional end date for multi-day events
  localStartTime: string | null;                // Local 24h timestamp (e.g. "20:00")
  localEndTime: string | null;                  // Optional end timestamp
  timezone: string | null;                      // IANA timezone string, e.g. "Asia/Jerusalem"
  datePrecision: Precision;                     // Temporal precision level
  timePrecision: Precision;                     // Timestamp precision level
  platform: string | null;                      // Forum or summit name
  venueName: string | null;                     // Physical venue, e.g. "Knesset Plenary"
  address: string | null;                       // Street address
  city: string;                                 // City name
  region: string | null;                        // State, district, or province
  country: string;                              // Nation state
  latitude: number | null;                      // WGS84 latitude coordinate
  longitude: number | null;                     // WGS84 longitude coordinate
  locationPrecision: "venue" | "city" | "country" | "unknown";
  participants: Array<{
    personId: string;                           // Referenced Person ID
    name: string;                               // Full name
    role: string;                               // Capacity in event (e.g. "Prime Minister")
    presenceConfidence: Confidence;             // Confidence of physical attendance
  }>;
  organisations: string[];                      // Involved entities (e.g. ["Likud", "United Nations"])
  notes: string | null;                         // Archival / research notes on evidentiary basis
  scope: "public" | "press" | "diplomatic" | "government" | "electoral" | "religious" | "media";
  medium: string[];                             // Evidence formats: ["official-transcript", "broadcast", "photo"]
  confidence: Confidence;                       // Overall record confidence
  verificationStatus: Verification;             // Primary verification rating
  sourceIds: string[];                          // Referenced Source IDs
  quotes: Array<{
    text: string;                               // Verbatim quotation
    speaker: string;                            // Person who uttered the quote
    timestamp: string | null;                   // Quote timestamp within address
    language: string;                           // ISO 639-1 language code (e.g. "en", "he")
  }>;
  media: Array<{
    kind: string;                               // "video", "audio", "document", "image"
    label: string;                              // Descriptive caption
    url: string;                                // URL to archival asset
  }>;
  provenance: string[];                         // Audit trail of archival references
}
```

### `Person`
Represents a historical figure or public official whose timeline is indexed.
```typescript
export interface Person {
  id: string;           // E.g. "p-benjamin-netanyahu"
  slug: string;         // E.g. "benjamin-netanyahu"
  name: string;         // Full name
  birth: string;        // Date of birth (YYYY-MM-DD)
  death?: string;       // Date of death if applicable
  description: string;  // Concise biographical introduction
}
```

### `Source`
Represents a cited archival document, broadcast, or official record.
```typescript
export interface Source {
  id: string;                                   // E.g. "src-un-1984-address"
  title: string;                                // Title of work or record
  publisher: string;                            // Authoritative archive / publisher
  url: string;                                  // Direct web link to archive
  sourceType:
    | "official-record"
    | "archive-video"
    | "archive-photo"
    | "transcript"
    | "contemporary-report"
    | "retrospective";
  classification: "primary" | "secondary";
  originalDate?: string;                        // Original recording date
  publicationDate?: string;                     // Publication date
  accessedDate: string;                         // Date verified by atlas researchers
  language: string;                             // Language of source material
}
```
