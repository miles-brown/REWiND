# REWiND Verification Standard

## 1. Principles of Forensic Verification

The verification architecture of REWiND is grounded in legal and scientific evidentiary principles:

1. **Burden of Proof**: The party asserting an event or biographical fact must supply the corroborating primary evidence.
2. **Proportionality**: Extraordinary or contentious claims require correspondingly compelling, independent primary evidence.
3. **Preservation of Uncertainty**: Gaps in knowledge must be explicitly exposed rather than masked by assumptions.
4. **Absence of Evidence is Not Evidence of Absence**: The lack of a photographic record does not by itself prove non-attendance; absence claims require an exhaustive manifest or continuous footage.
5. **Revisability**: All factual conclusions are provisional and subject to formal revision when superior evidence emerges.

---

## 2. Rejection of Pseudo-Mathematical Percentages

REWiND explicitly rejects assigning subjective percentage certainty to historical facts:
- Stating a historical meeting was *"87% verified"* produces false precision and misleads researchers.
- Instead, REWiND uses structured qualitative verification statuses (`ESTABLISHED`, `STRONGLY SUPPORTED`, `SUPPORTED`, `PROVISIONAL`, `DISPUTED`, etc.) paired with detailed provenance trails and specific source locators (timestamps, page numbers, catalog IDs).

---

## 3. Corroboration Matrix

To attain the `ESTABLISHED` tier:
- **Physical Presence**: Requires either (a) unedited audiovisual documentation identifying the person, or (b) official unredacted state/diplomatic manifests combined with contemporary journalistic eyewitness corroboration.
- **Speeches & Plenaries**: Requires official verbatim transcripts (Hansard, UN Digital Library) or continuous unedited audio/video recordings.
- **Bilateral Meetings**: Requires confirmation from records of both participating delegations or independent host nation protocol logs.

---

## 4. Verification Workflow

```
Candidate Ingestion (Raw Feed/Wire)
              │
              ▼
    Automatic Deduplication
              │
              ▼
   Editorial Verification Queue
              │
        ┌─────┴────────────────┐
        │                      │
   [Human Review]      [Corroboration Engine]
        │                      │
        └─────┬────────────────┘
              │
              ▼
   Claim-Level Verification
   (Status, Epistemic Class, Locators)
              │
              ▼
     Publication to Atlas
```
