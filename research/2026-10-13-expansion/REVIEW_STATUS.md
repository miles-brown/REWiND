# REWiND — Expansion research batch | 13 October 2026

> **NOT APPROVED FOR PUBLICATION. NOT INSERTED INTO SUPABASE.** This directory is an editable, audit-ready research inventory, not a verified 600-event import.

## Source of truth and current baseline

- **Supabase project:** Streets-Past (`nadbmxfqknnnyuadhdtk`). REWiND data is in the public schema.
- **Live tables on inspection:** 446 people; 299 events; 688 participant links; 326 sources; 304 person roles; 78 person milestones.
- **Seed files are not a complete live census:** the separate GitHub seed snapshot has 354 people, not 446.
- 6 pairs of live people share an identical canonical name; review identity matches and merge aliases carefully before inserting candidates.
- Of 446 live people, 369 have a birth date, 62 a portrait URL and 114 non-null achievements. These are existing baseline gaps.
- All 299 current live events have at least one linked event source, participant and place or venue according to presence checks; source *relevance* is not guaranteed.

## Deliverables

| File | Entries | What they are | Publication |
| --- | ---: | --- | --- |
| `live-baseline.json` | 446 people, 299 events, 304 roles, 78 milestones | Snapshot used for candidate collision screens | Internal only |
| `existing-people-baseline.json` | 354 | GitHub seed record inventory, not authoritative | Internal only |
| `new-people-award-events-400.json` | 400 events | Independent prize-year/category awards, with recipients, year and source candidates | Research leads |
| `new-person-biography-candidates.json` | 703 people | Initial Nobel-based profiles using available birth/death/award/affiliation data | Partial dossiers, NOT full profiles |
| `existing-people-event-leads-200.json` | 200 events | 150 career role commencements + 50 milestone leads for 53 existing people | Research leads |
| `institutional-laureates-and-evidence-corrections.json` | 28 institutional award-recipient records + corrections | **Mandatory overlay:** restore organisation recipients before importing Nobel awards | Must apply |

The 600 *candidate* events are distinct IDs, NOT verified as 600 distinct historical occurrences. Venue, original-event date, source-claim support, people aliases, and semantic deduplication remain substantially unfinished.

### Award distribution (400)

- Physics 76; Chemistry 77; Physiology or Medicine 76; Literature 76; Peace 43; Economic Sciences 52.
- Years 1944–2020. Year-only awards are NOT claims that an announcement happened on January 1 or a ceremony on December 10.
- The 2007 Nobel Peace Prize has a verified original announcement (Oslo, 12 October 2007). See the mandatory corrections overlay. It is an **announcement** with recipients; neither recipient's physical attendance is asserted.
- Nobel year/category summary URLs are research source patterns. They were not all individually accessed.
- CSV data source: `https://raw.githubusercontent.com/ggb/nobel-prize-dataset/main/nobel-prizes.csv`.
- Official prize archive: `https://www.nobelprize.org/prizes/lists/all-nobel-prizes/`; original 2007 decision: `https://www.nobelprize.org/prizes/peace/2007/9368-engelsk/`.

### Existing-person lead distribution (200)

- 150 role start-date leads, mostly institutional changes in mandate and **not verified physical meetings or swearing-in ceremonies**.
- 50 existing milestone leads; both categories inherit a possible date claim from the live database but still require archival verification.
- Spot-checks found **irrelevant original source pointers** (e.g. U.S. officeholders linked to Knesset registries, company roles linked to U.S. congressional biographical guides). All inherited source IDs have been stripped from the 200 events' `sourceIds`. Old references are retained as untrusted hints, never evidentiary citations.
- Misdated candidates for Elon Musk's X CTO role and Randy Fine's Florida Senate term commencement were excluded and replenished from other milestones.
- One independent issuer-issued source was located for the 11 December 2023 Tucker Carlson Network launch: `https://www.prnewswire.com/news-releases/tucker-carlson-is-back-launching-new-video-service-called-tucker-carlson-network-302011810.html`.

## Required full-profile enrichment for EACH proposed person

**Core identity:** ID, aliases, native-script form, standardized/transliterated name, birth and death dates with certainty, birthplace, nationality and citizenship *independently verified*, professional category, languages where evidenced, Wikidata/VIAF reconciliation, archival portrait rights.

**Public biography:** 2–3 paragraph sourced life summary, significance/inclusion basis, dated work and achievements, publications and works, education institutions and degrees, awards and awarding authorities, public offices/career appointments and predecessor/successor.

**Chronology/relationships:** documented attendance at multiple events, verified roles at those events, co-attendance, organisational memberships, publicly documented trips and stays, recorded person-person relationships; exclude inferred/private encounters.

**Citation graph:** link each time, affiliation, quotation, historical assertion, venue, role, relation and biographical fact to exact supporting source(s), retain original date, publisher, source type, scan/video/transcript locator, confidence, review timestamp.

**Sensitivity:** sensitive identity, ancestry, religion and private locations must not be inferred from name, birthplace, cohort or photographs. Null means unknown, never a factual negative.

The proposed 703 dossiers **do not yet meet this contract**. The current schema's classification enum also lacks a good scientist-specific entry; do not label physicists as historians. Apply the correction overlay or extend the classification taxonomy after review.

## Required event field checklist

- Independent event identity, neutral descriptive title, event series/hierarchy, type, summary, related topics.
- Day/month/year precision, actual dated evidence, local/UTC time if sourced, time zone, event duration if sourced.
- City/country, address, venue/subvenue, exact/approximate coordinate with precision and uncertainty radius; do not substitute birth/affiliation locations for event locations.
- All known people and institutions with role at *time*, capacity, actual presence versus honorary or remote participation, location precision, arrival and departure where evidenced.
- Publisher, source URL, source dates, source type, verified excerpts/timecodes, person/event/source joins, contradicting evidence and provenance.
- Broadcasts, photographs, audio/video/transcripts and exact availability flags; do not presume media exists.
- Verification state, confidence, reviewer/date, geocode review, duplicate candidate checks, publication-ready flag.

## Acceptance gate

1. Verify each candidate against live event identity, alternative titles, canonical people and organisations; **merge** true duplicates.
2. Distinguish an award decision/announcement, the later ceremony, and a later laureate lecture as separate historical acts, only where each has an independently documented date.
3. Verify primary source per event *and* per claimed attendance, physical place and quote; don't treat generic biography sources as proof of attendance.
4. Reject false precision and unsupported role start dates.
5. Complete person biographies and check affiliations/official tenures.
6. Resolve institution co-laureates and the correction overlay.
7. Run tests and human review on a preview batch; only then consider insert into Supabase and public pages.

## Editorial balance: further diversification strongly recommended

The 400-award research batch reaches volume but is **far too concentrated in a single annual prize series** for REWiND's first public expansion. A revised editorial target should deliberately add original speeches, debates, public confrontations, summits, press conferences, treaty signatures, parliamentary hearings, landmark trials, verified diplomatic travel, protests, scientific presentations and major broadcast/arts events. The 200 role/milestone leads are likewise not a substitute for 200 independently sourced occasions.

**Do not call this a completed 600-event expansion.** It is a 600-row research worklist with a 703-person provisional dossier pool and documented verification gaps.
