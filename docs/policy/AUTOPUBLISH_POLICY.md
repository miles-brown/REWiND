# REWIND Policy: Autonomous Publication & Review Lanes

This document establishes the deterministic rules governing whether a candidate event is automatically published, marked provisional, or held in the human review queue.

---

## 1. Core Rule: The Crawler & LLM Never Publish Directly

```
[Raw Evidence Discovery]
          ↓
[LLM Structured Extraction (Strict Zod Schema)]
          ↓
[Deterministic Entity & Gazetteer Resolution]
          ↓
[Deduplication & Merge Engine]
          ↓
[Deterministic Policy Rule Engine]
    ├── 🟢 Lane 1: Auto-Publish
    ├── 🟡 Lane 2: Publish Provisional (Queue for Audit)
    └── 🔴 Lane 3: Mandatory Human Review Queue
```

The AI extractor transforms text into candidate objects. The **Deterministic Policy Engine** evaluates the candidate against hard-coded programmatic criteria to assign the publication lane.

---

## 2. The Three Publication Lanes

### 🟢 Lane 1: Auto-Publish (Immediate)
A candidate event is automatically published without human intervention ONLY when ALL of the following criteria are satisfied:
1. **Primary Evidence**: Backed by at least 1 verified **Tier A** primary source (or verified **Tier B** + independent Tier C corroboration).
2. **Entity Resolution**: All primary participants resolve to approved REWIND Subjects with confidence $\ge 0.98$.
3. **Spatiotemporal Precision**: Location resolves to an authenticated gazetteer place; date precision is `exact-day` or `exact-minute`.
4. **Allowed Event Type**: Event belongs to an established public diplomatic, governance, or speech taxonomy.
5. **Zero Contradictions**: No conflicting primary claims detected for date or physical presence.
6. **No Sensitive Edge Cases**: Event does not involve sensitive legal, medical, or private-location flags.

---

### 🟡 Lane 2: Publish Provisional (Review Soon)
An event is published immediately with a **"Provisional"** badge and queued for subsequent audit when:
1. Backed by at least **2 independent Tier C** contemporary secondary sources (e.g. AP + Reuters).
2. Occurrence is an ordinary public historical event.
3. No primary Tier A transcript is available yet in the index.
4. No identity or location ambiguity exists.

---

### 🔴 Lane 3: Mandatory Human Review Queue
The event MUST NOT be published until an editor reviews and signs off if ANY of the following conditions exist:
1. **Disputed Claims**: Primary sources disagree on date, venue, or participant presence.
2. **Sensitive Matters**: Involves criminal charges, legal accusations, health/medical status, or personal scandal.
3. **Living Person Private Locations**: Contemporaneous private movement information of living figures.
4. **Minors**: Involves any individual under 18 years of age at the time of the event.
5. **Low Confidence Entity Match**: Participant resolution confidence $< 0.95$.
6. **New / Unregistered Subject**: Key participant is not yet part of an approved Coverage Programme.
7. **Contested Quotes**: Attribution of controversial statements where verbatim transcripts differ.

---

## 3. Real-Time Tracking Embargo for Living Figures

To ensure REWIND remains an **investigative historical atlas** rather than a real-time tracking utility:
- Contemporaneous private movements of living persons must not be published autonomously.
- Scheduled public official appearances (e.g. public parliament addresses) may be indexed normally.
- Unscheduled or private diplomatic travels are subjected to a minimum **48-hour embargo** before autonomous publication unless already broadcast on public state media.

---

## 4. Immutable Decision Audit Trail

Every automated or human publication action must append an immutable entry to `audit_log`:
```json
{
  "timestamp": "2026-09-03T11:25:00Z",
  "eventId": "evt-1996-07-09-netanyahu-clinton-wh",
  "decision": "auto-publish",
  "ruleId": "REW-PUB-001",
  "sourceIds": ["src-wh-transcript-19960709", "src-cspan-video-19960709"],
  "evidenceConfidence": 0.998,
  "corroborationScore": 1.0
}
```
