# REWiND Biographical & Editorial Profile Standard

This document establishes the official editorial guidelines, data integrity rules, and formatting standards for biographical sections, short summaries, demographic records, and profile forms in the **REWIND Evidence Atlas**.

---

## 1. Editorial Principles for Biographical Text

Biographical content in REWiND must adhere to strict encyclopedic neutrality, evidentiary rigor, and chronological clarity.

### 1.1 Short Bio (`summary`) Guidelines
- **Length & Structure**: Exactly 2 to 3 concise, information-dense sentences (40–80 words).
- **Core Content**:
  1. **Sentence 1**: Primary official office, constitutional role, or historical distinction with primary nationality and active operational era.
  2. **Sentence 2**: Key geopolitical mandates, treaty participation, landmark legislation, or central historical significance.
  3. **Sentence 3 (Optional)**: Scope of archival monitoring or enduring historical relevance in the evidence atlas.
- **Tone**: Strictly factual, objective, and neutral.
- **Prohibitions**:
  - ❌ **No subjective praise or eulogistic adjectives** (*"renowned"*, *"brilliant"*, *"visionary"*, *"heroic"*).
  - ❌ **No pejorative or editorializing commentary** (*"notorious"*, *"infamous"*, *"discredited"*).
  - ❌ **No unsubstantiated assertions**—every stated milestone must be supported by archival records.

```markdown
<!-- Correct Example -->
Benjamin Netanyahu is an Israeli politician who has served as Prime Minister of Israel across multiple non-consecutive terms since 1996, making him the longest-serving prime minister in the nation's history. He previously served as Minister of Foreign Affairs, Minister of Finance, and Israel's Permanent Representative to the United Nations.

<!-- Incorrect Example (Violates Neutrality) -->
Benjamin Netanyahu is a controversial right-wing strongman who tenaciously dominated Israeli politics for decades while fighting off numerous corruption scandals.
```

---

## 2. Structured Demographic & Identity Standards

Biographical data in REWiND is relational and evidence-backed, avoiding casual assumptions.

### 2.1 Identity Hierarchy
1. **`canonical_name`**: The authoritative international transliteration (e.g., `"Benjamin Netanyahu"`, `"Menachem Begin"`).
2. **`display_name`**: Commonly used public name (e.g., `"Bill Clinton"`, `"King Hussein"`).
3. **`native_name`**: Native-script representation (e.g., Hebrew `בנימין נתניהו`, Arabic `ياسر عرفات`, Russian `Владимир Путин`).
4. **`full_birth_name`**: Complete legal birth name including middle names or pre-adoption/hebraized surnames (e.g., `"William Jefferson Blythe III"`, `"Benjamin Mileikowsky"`).
5. **`birth_date` & `death_date`**: ISO-8601 formatted (`YYYY-MM-DD`, `YYYY-MM`, `YYYY`) accompanied by `date_precision` (`"exact-day"`, `"month"`, `"year"`).

### 2.2 Citizenship vs. Nationality vs. National Identity vs. Ethnicity
- **`citizenship`** (`text[]`): Sovereign legal status under national law (e.g., `["Israel", "United States"]`). Must list all formally held passports/citizenships.
- **`nationality`** (`text`): Primary national affiliation (e.g., `"Israel"`, `"United States"`, `"United Kingdom"`).
- **`national_identity`** (`text`): Self-asserted cultural or regional identity where distinct from legal citizenship (e.g., `"Palestinian"`, `"Scottish"`, `"Kurdish"`).
- **`ethnicity` & `ancestry`** (`text`): Distinct ancestral/ethnic background documented in authorized biographies.

### 2.3 Strict Evidentiary Rules for Religion & Religious Denomination

Under no circumstances may religion, denomination, or religious affiliation be casually inferred or assumed.

#### Mandatory Hierarchy of Evidence:
1. **Direct Public Self-Identification**: Explicit public statement by the subject in speeches, writings, or sworn testimony.
2. **Official Institutional Biography**: Government gazettes, state biographies, or authorized ecclesiastical registers.
3. **Scholarly Biographical Consensus**: Recognized academic monographs and historical literature.
4. **Controlled Fallback Status**: Where conclusive documentation is absent, `religion_status` must be set to:
   - `'self-identified'` — Explicit public affirmation by subject.
   - `'scholarly-consensus'` — Documented consensus in academic biographies.
   - `'historical-affiliation-only'` — Cultural or hereditary affiliation without personal practice.
   - `'not-publicly-stated'` — No verified public statement or archival consensus exists.
   - `'disputed'` — Conflicting accounts or conversions exist.

---

## 3. Controlled Categorization Taxonomy

Every indexed person must be classified into one of the following primary categories:

| Category | Definition & Qualification Criteria |
| :--- | :--- |
| **`head-of-state`** | Sovereign monarchs, constitutional presidents, and supreme leaders. |
| **`politician`** | Prime ministers, cabinet ministers, parliamentarians, party leaders. |
| **`diplomat`** | Ambassadors, UN envoys, special presidential envoys, treaty signatories. |
| **`judicial-official`** | Supreme court justices, ICJ/ICC judges, attorneys general, special prosecutors. |
| **`intelligence-official`** | Directors and senior officials of intelligence services (CIA, Mossad, MI6). |
| **`military-leader`** | Chiefs of general staff, generals, admirals, defense commanders. |
| **`religious-leader`** | Popes, grand muftis, chief rabbis, patriarchs, titular denominational heads. |
| **`media-journalist`** | Broadcasters, investigative journalists, newspaper editors, publishers. |
| **`academic-historian`** | Leading historians, political scientists, legal scholars, philosophers. |
| **`corporate-executive`** | Tech founders, defense contractors, industrial leaders with geopolitical impact. |
| **`public-figure`** | Witnesses, activists, central parties in major historical investigations. |

---

## 4. Structured Relational Extension Modules

A complete biographical dossier connects the individual to modular relational records:

1. **`person_education`**:
   - `institution`, `degree`, `field_of_study`, `start_year`, `end_year`, `notes`, `source_id`.
2. **`person_career`**:
   - `organisation_id` / `organisation_name`, `role_title`, `start_date`, `end_date`, `is_current`, `notes`, `source_id`.
3. **`person_awards`**:
   - `award_name`, `awarding_body`, `year_received`, `citation`, `source_id`.
4. **`person_works`**:
   - `title`, `work_type` (`"book"`, `"speech"`, `"treaty"`, `"legislation"`), `publication_year`, `publisher`, `url`, `source_id`.
5. **`person_stays`**:
   - Documented bases of operations, official residencies, and diplomatic accommodations (`venue_name`, `city`, `country`, `latitude`, `longitude`, `start_date`, `end_date`, `is_base_of_operations`).

---

## 5. The "Golden Record" Specification (100% Complete Profile Checklist)

A person entry achieves **Golden Record status** when every field below is authoritatively populated:

- [x] **`id`** & **`slug`**: Clean, deterministic URL-safe identifier (`"benjamin-netanyahu"`).
- [x] **`canonical_name`** & **`display_name`**: Validated international standard naming.
- [x] **`native_name`**: Original language script when non-English.
- [x] **`full_birth_name`**: Complete legal birth name verified in civil/birth records.
- [x] **`birth_date`** (and **`death_date`** if deceased): ISO-8601 compliant with `date_precision`.
- [x] **`nationality`** & **`citizenship`**: Validated sovereign states.
- [x] **`religion`**, **`religious_denomination`**, & **`religion_status`**: Supported by primary self-identification or scholarly consensus.
- [x] **`languages`**: Array of verified spoken/written working languages.
- [x] **`primary_role`**: Specific historical mandate or office title.
- [x] **`classification`** & **`primary_figure_category`**: Standardized controlled taxonomy tags.
- [x] **`notability_basis`**: Controlled criteria code (e.g. `head-of-state-or-government`).
- [x] **`inclusion_basis`** & **`inclusion_rationale`**: Neutral paragraph explaining scope of coverage.
- [x] **`summary`**: 2–3 sentence objective, non-editorialized short biography.
- [x] **`aliases`**: Array of verified transliterations and former names.
- [x] **`wikidata_id`** & **`viaf_id`**: Authoritative linked open data URIs.
- [x] **`avatar_url`**: High-resolution, copyright-cleared archival portrait.
- [x] **`education`**, **`career`**, **`awards`**, **`works`**, **`stays`**: Relational sub-records with citations.
- [x] **Events Corpus**: At least 10–50 verified historical events linked in the timeline.
