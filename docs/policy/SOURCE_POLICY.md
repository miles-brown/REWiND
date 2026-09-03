# REWIND Policy: Source Tiers, Evidence Rigor & Archival Integrity

This document defines source qualification, evidentiary tiers, and archival integrity requirements for the **REWIND Evidence Atlas**.

---

## 1. Source Tiers

Every source ingested into REWIND is classified into a strict hierarchical tier:

```
[Tier A: Primary Evidence]       → Autonomous verification capable
[Tier B: First-Party Records]    → High-confidence supporting evidence
[Tier C: Secondary Corroboration] → Corroborative contemporary reporting
[Tier D: Discovery & Leads]      → Investigation lead only (never auto-publishes)
```

| Tier | Description | Examples | Autonomous Verification Authority |
| :--- | :--- | :--- | :--- |
| **Tier A — Primary** | Official government records, authenticated parliamentary transcripts, unedited broadcast master audio/video, court documents, signed treaties. | UN Digital Library, Knesset Hansard, US State Dept Foreign Relations Series (FRUS), C-SPAN unedited footage. | **YES** (Can satisfy primary verification threshold). |
| **Tier B — First-Party** | Official press releases, verified institutional archives, official gazettes, participant official memoirs. | White House briefing releases, institutional press bulletins, published state gazettes. | **YES** (When paired with contemporary secondary corroboration). |
| **Tier C — Contemporary Secondary** | Reputable international news wire services, major independent news broadcasts, investigative reports published contemporaneously. | Reuters, Associated Press (AP), BBC, Agence France-Presse (AFP), major international broadsheets. | **Conditional** (Requires at least 2 independent Tier C sources for provisional status). |
| **Tier D — Discovery / Leads** | Aggregators, encyclopedias, retrospective blog posts, crowdsourced databases. | Wikipedia, encyclopedic summaries, user-submitted timelines. | **NO** (Triggers discovery jobs, but cannot verify an event alone). |

---

## 2. Source Hashing & Cryptographic Provenance

To protect historical records against link rot, silent retraction, or metadata drift:

1. **SHA-256 Content Hash**: Every fetched raw document, HTML snapshot, or API payload is hashed (`sha256`) and recorded in `source_fetches`.
2. **Archival Mirroring**: Primary transcripts and documents are referenced with Wayback Machine / Perma.cc / archival persistent identifiers where available.
3. **Immutability**: Once a source fetch is recorded with a specific hash, subsequent modifications are stored as new revisions rather than overwriting historical evidence.

---

## 3. Timestamp Discrepancy Reconciliation

When sources present differing timestamps:
- **Recorded vs. Broadcast**: If an interview was recorded on Monday and broadcast on Wednesday, both timestamps must be stored in distinct fields (`recordedAt` vs `broadcastAt`).
- **Differing Start Times**: If Tier A official schedule says `14:00` and Tier C wire report says `14:15`, the engine records both as distinct **Claims** supporting the parent event, rather than silently picking one.

---

## 4. Source Independence Formula

Two sources are considered **independent** only if:
- They do not share the exact same wire origin (e.g. three regional newspapers syndicating the exact same AP dispatch count as **1** independent source, not 3).
- They originate from separate institutional perspectives (e.g. Israeli state transcript + Palestinian delegation communiqué + US official briefing).
