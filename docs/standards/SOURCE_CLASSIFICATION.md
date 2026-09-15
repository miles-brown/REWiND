# REWiND Source Classification Standard

## 1. High-Level Taxonomy

Every source recorded in REWiND must be categorized within the following structured taxonomy:

### Official & Institutional Records
- `government publication`: Official government gazettes, white papers, official communications.
- `official schedule`: State department diaries, official ministerial travel calendars.
- `official transcript`: Unedited verbatim transcripts produced by official bodies.
- `parliamentary record`: Hansard, Congressional Record, Knesset plenary transcripts.
- `court record`: Verbatim trial transcripts, depositions, judicial orders, verdicts.
- `legal filing`: Indictments, pleadings, court exhibits, regulatory disclosures.
- `diplomatic record`: Declassified diplomatic cables, treaty instruments, bilateral memoranda.
- `government photograph/video`: Official presidential/prime ministerial photography or recording.

### Original Media
- `complete video recording`: Unedited full continuous video capture of an entire event.
- `partial video recording`: Broadcast segment, news package, or extracted clip.
- `audio recording`: Sound recordings, radio intercepts, press conferences.
- `photograph`: High-resolution primary still photography.
- `livestream`: Real-time digital broadcast captured at source.
- `raw footage`: Camera archive reels prior to television editing or voiceover.

### Journalism
- `wire report`: Real-time reporting by wire agencies (Reuters, AP, AFP).
- `newspaper report`: Contemporary investigative or daily reporting in registered press.
- `television news`: Broadcast network news packages.
- `radio news`: Audio broadcast bulletins.
- `investigative journalism`: Long-form investigative investigations with published evidentiary annexes.
- `news interview`: Formal conducted journalistic interviews.

### First-Person & Participant Material
- `speech`: Delivered formal public address.
- `memoir`: Post-facto personal autobiography or published reflections.
- `diary`: Contemporaneous private journal entries.
- `letter`: Private or diplomatic written correspondence.
- `public statement`: Press release or issued personal statement.
- `eyewitness account`: First-hand participant or observer narrative.

### Academic & Scholarly
- `peer-reviewed paper`: Academic study published in a reputable scholarly journal.
- `academic book`: Scholarly monographs published by university presses.
- `critical edition`: Annotated archival compilations edited by academic historians.

### Reference & Secondary
- `biography`: Comprehensive biographical works written by independent historians.
- `encyclopaedia`: Established academic encyclopaedias.
- `documentary`: Edited historical film or television documentary.
- `retrospective article`: Looking back at historical events years or decades later.

### Discovery-Only
- `search-engine result`: Snippets, search index references.
- `aggregator`: Content scrapers, repost engines.
- `forum`: Internet discussion boards, social media reposts.
- `AI-generated answer`: LLM outputs, synthetic summaries.

> **CRITICAL RULE**: Discovery-only sources may assist researchers in locating primary evidence, but **never establish a factual claim on their own**.

---

## 2. Source Level

Source type is distinct from source level:
1. **Primary**: Created contemporaneously by direct participants or unedited direct recording devices.
2. **Near-Primary / Contemporaneous**: Produced during or immediately after the event by journalists or observers physically present.
3. **Secondary**: Analyzes, synthesizes, or discusses primary sources (e.g., historical biography written 20 years later).
4. **Tertiary**: Compilations and reference databases summarizing secondary literature (e.g., general chronologies).
5. **Discovery-Only**: Lead sources requiring primary corroboration.

---

## 3. Independence & Provenance Graph

REWiND records whether corroborating sources are genuinely independent:
- Multiple newspapers printing the exact same Reuters wire dispatch constitute **one** primary journalistic source, not multiple independent confirmations.
- The `derived_from_source_id` field constructs a provenance graph:
  $$\text{Source A (Primary)} \longrightarrow \text{Source B (Wire dispatch)} \longrightarrow \text{Source C (Republished article)}$$
- Independence statuses:
  - `independent`: Completely separate observation, funding, and editorial control.
  - `partially independent`: Shared access or pooled press camera with independent commentary.
  - `syndicated`: Exact reproduction of another news organisation's output.
  - `derived from another source`: Quotes or bases claims upon a previously published source.
  - `same organisation`: Multiple outputs from the same corporate or government entity.
  - `official self-report`: Party claiming actions on their own behalf.
  - `unknown`: Sourcing ancestry unverified.
