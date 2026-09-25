# REWiND People & Inclusion Standard

## 1. Objective & Inclusion Threshold

A person is indexed in the **REWIND Evidence Atlas** not merely because they are a public figure, but because their public actions, historical impact, and documented appearances provide demonstrable value within an evidentiary chronological atlas.

The central REWiND test is:
> *"Is this individual historically, politically, culturally, or legally significant enough, and supported by a sufficiently robust archival record, that a chronological evidence dossier provides genuine public and historical value?"*

---

## 2. Controlled Inclusion Criteria Checklist

Every indexed person profile must satisfy at least one primary criterion and document its `inclusion_basis`:

- [ ] **`head-of-state-or-government`**: Held recognized sovereign constitutional mandate (President, Prime Minister, Monarch).
- [ ] **`senior-diplomatic-or-geopolitical`**: Cabinet minister, ambassador, peace envoy, treaty signatory, high-level diplomatic negotiator.
- [ ] **`major-religious-authority`**: Head of religious denomination, major pontiff, grand mufti, chief rabbi, recognized theological leader.
- [ ] **`major-cultural-or-intellectual`**: Internationally influential author, artist, filmmaker, composer, or philosopher with enduring cultural legacy.
- [ ] **`scientific-or-technological-impact`**: Major scientific discovery, breakthrough patent, or technological milestone.
- [ ] **`substantial-independent-coverage`**: Subject of extensive, continuous, independent third-party journalistic coverage spanning multiple decades.
- [ ] **`scholarly-historiographical-subject`**: Focus of serious biographical monographs, university press books, and academic inquiry.
- [ ] **`central-nexus-to-historical-events`**: Direct participant in documented peace accords, conflicts, treaties, or constitutional crises.
- [ ] **`significant-legal-or-judicial-record`**: Central party in landmark international or domestic legal trials, investigations, or human-rights findings.

---

## 3. Public Transparency: "Why This Person Is Indexed"

Every public person page must render a transparent disclosure panel:
- Checkmarked qualifying criteria.
- Neutral editorial inclusion rationale paragraph explaining the historical scope of coverage.
- Summary of the primary archive coverage (time span, total verified events, primary institutional sources).

---

## 4. Structured Biographical Data Architecture

Biographical data in REWiND is relational and evidence-backed, avoiding unstructured narrative blurbs:

1. **Identity**:
   - `canonical_name` / `display_name`
   - `full_birth_name` / `legal_name`
   - `alternative_names` / `aliases` / `titles`
   - `birth_date` / `death_date` (with precision)
   - `birth_place` / `death_place`
2. **Citizenship, Nationality & Identity Distinction**:
   - **Nationality / Citizenship**: Legal status under national law (e.g., *British citizen*, *Israeli citizen*).
   - **National Identity**: Self-asserted cultural identity.
   - **Ethnicity / Ancestry**: Distinct lineage roots (never conflated with citizenship).
   - **Religion**: Specific faith and denomination.
3. **Education**: Relational records (`person_education`) tracking institutions, degrees, dates, and completion status.
4. **Career & Public Mandates**: Relational records (`person_career`) tracking offices, titles, predecessors, successors, and appointment methods.
5. **Awards & Recognitions**: Relational records (`person_awards`) distinguishing wins from nominations and detailing awarding bodies.
6. **Documented Works & Catalogues**: Relational records (`person_works`) cataloguing books, speeches, legislation, treaties, or creative works.

---

## 5. Prohibition on Casual Inference of Sensitive Characteristics

Under no circumstances may sensitive biographical characteristics—such as **religion, ethnicity, ancestry, or national identity**—be inferred casually from:
- Surnames or linguistic origin
- Physical appearance or photographs
- Place of birth or parents' nationality
- Political affiliations or party membership
- Stereotypical assumptions

### Evidentiary Hierarchy for Sensitive Characteristics:
1. **Direct Public Self-Identification**: Explicit statement by the subject in verified public records.
2. **Authoritative Official Biography**: Government gazettes or authorized institutional archives.
3. **Scholarly Biographical Consensus**: Multiple independent academic monographs.
4. **Allowed Controlled States**: Where conclusive evidence is absent, the field must explicitly state: `not publicly stated`, `unknown`, `disputed`, or `historical affiliation only`.
