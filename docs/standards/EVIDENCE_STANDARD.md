# REWiND Evidence Standard

## 1. Core Distinction: Source vs. Evidence vs. Claim

A cornerstone of the REWiND Evidence Atlas is the explicit separation of three distinct conceptual entities:

```
┌──────────────────────────────────────────────────────────────┐
│                            SOURCE                            │
│  The physical publication, broadcast, document or artefact   │
│  (e.g., C-SPAN Video Recording ID 532104)                    │
└──────────────────────────────┬───────────────────────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────────────────┐
│                           EVIDENCE                           │
│  The specific excerpt, timestamp, or observation obtained    │
│  (e.g., Video frame at 00:04:37 showing subject entering)    │
└──────────────────────────────┬───────────────────────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────────────────┐
│                            CLAIM                             │
│  The discrete factual proposition being evaluated            │
│  (e.g., Subject was physically present in the Oval Office)   │
└──────────────────────────────────────────────────────────────┘
```

---

## 2. Evidence Forms & Classifications

Evidence in REWiND is classified according to its physical, technological, and evidentiary nature:

1. **Direct Visual Evidence**: Unedited video footage, high-resolution photography clearly depicting subject presence and environment.
2. **Direct Audio Evidence**: Unedited acoustic recording, wiretap, or radio broadcast capturing subject voice.
3. **Audiovisual Evidence**: Combined synchronized sound and picture documentation.
4. **Documentary Evidence**: Contemporaneous written records, manifests, signed contracts, or official letters.
5. **Official-Record Evidence**: Parliamentary transcripts (Hansard, Congressional Record), court transcripts, gazette entries.
6. **Testimonial Evidence**: Witness testimony under oath, sworn affidavits, formal depositions.
7. **First-Person Evidence**: Diary entries, memoirs, personal correspondence written by the subject.
8. **Contemporaneous Journalistic Evidence**: Real-time reporting by credentialed reporters physically present at the scene.
9. **Physical/Material Evidence**: Badges, travel tickets, passport stamps, visitor logs.
10. **Metadata Evidence**: Cryptographic hashes, EXIF camera metadata, server transmission logs.
11. **Geospatial Evidence**: Satellite imagery, verified cellular tower pings, GPS telemetry.
12. **Chronological Evidence**: Sequential time constraints establishing physical travel feasibility.
13. **Circumstantial Evidence**: Secondary indicators implying presence or activity without direct observation.
14. **Corroborative Evidence**: Supplementary evidence that reinforces an already established primary proof.
15. **Negative/Absence Evidence**: The documented absence of a person from an exhaustive attendee manifest or recording.

---

## 3. Direct vs. Inferential Evidence

REWiND strictly records whether an evidentiary link is direct or inferential:

- **Direct Evidence**: Directly establishes the factual claim without intervening reasoning.
  - *Example*: An unedited C-SPAN feed showing Netanyahu speaking at the podium directly proves his presence.
- **Inferential Evidence**: Requires deductive or inductive reasoning to reach the factual claim.
  - *Example*: A diplomatic schedule listing a bilateral meeting and a motorcade arrival report infer that the meeting took place as planned, but do not directly record the room contents.

Inferential claims must be classified accordingly and cannot be marked `ESTABLISHED` without corroboration.

---

## 4. Separation of Evidence Strength from Source Prestige

Source prestige (e.g., a storied international newspaper or historical publisher) does **not** automatically confer evidentiary strength upon every claim it publishes:
- A brief sentence in a prestigious newspaper repeating an unsourced rumour remains weak or inferential evidence.
- A bystander's raw, unedited smartphone video uploaded without prestige can provide conclusive, direct evidence of a person's presence.

REWiND independently evaluates:
1. `source_type` (institutional taxonomy)
2. `source_independence` (provenance distance)
3. `evidence_form` (direct vs. inferential)
4. `evidence_strength` (conclusive vs. circumstantial)
5. `claim_status` (verdict on the proposition)

---

## 5. Preservation of Contradictory Evidence

In compliance with forensic research standards, contradictory evidence must never be omitted or erased:
- If Source A demonstrates a person was in London at 14:00, while Source B reports they attended a meeting in Paris at 14:30, **both records and their evidentiary links must be preserved**.
- Contradictory evidence is flagged with `contradicts_claim: true`.
- The claim status must be designated as `DISPUTED` or `CONTRADICTED` until conclusive forensic resolution is attained.
