# REWiND Corrections & Disputes Standard

## 1. Principles of Corrigibility & Transparency

REWiND operates under journalistic and academic standards of accountability (drawing on IPSO Clause 1 and Ofcom Section 5 requirements). Factual assertions are never treated as immutable; errors must be acknowledged, documented, and corrected transparently.

---

## 2. Prohibition on Silent Rewriting

Under no circumstances may an editor or automated pipeline silently modify a verified historical claim, participant role, or timestamp:
- Every modification to an indexed event, person, or claim creates a permanent entry in `audit_log`.
- Entries record: `entity_type`, `entity_id`, `field_name`, `previous_value`, `revised_value`, `editor_actor`, `timestamp`, `reason`, and `evidentiary_justification`.

---

## 3. Public Correction Disclosures

Where a significant historical correction occurs (e.g., misidentified attendee, erroneous date, retracted claim):
1. A **Public Correction Note** is appended to the event or profile record.
2. The note states:
   - Date of correction
   - The erroneous assertion previously published
   - The corrected fact
   - The newly discovered primary evidence prompting the revision
3. The previous claim is archived with status `DEMONSTRABLY FALSE` or `SUPERSEDED`, rather than deleted.

---

## 4. Formal Dispute Workflow

When credible historical accounts materially disagree:
1. The claim status is transitioned to `DISPUTED`.
2. A **Discrepancy Dossier** is generated linking both competing sources.
3. The user interface exposes a prominent *"Evidentiary Discrepancy"* notice explaining the nature of the contradiction, the competing primary documents, and why the atlas does not prematurely resolve the controversy.
