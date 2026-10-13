# REWiND — Inclusive Archive and Publication Queue

**Decision recorded:** 14 October 2026.

## Inclusion scope

REWiND accepts any independently notable public person, historical actor, or documented participant in a significant public event. No subject area is permanently excluded simply because it is not a current editorial priority.

## Current research / publication emphasis

The initial editorial emphasis is on politicians and government officials; activists and public campaigns; the history of Zionism and related political movements, including critics and interlocutors; neoconservative foreign-policy thinkers and policy debates; and documented relationships among public institutions, donors, wealthy individuals, businesses, lobbying groups and political officeholders.

Select and link people based on **specific verifiable public records and actions**, not assumed affiliation, religion, ancestry, surname, or wealth alone. Identity characteristics do not prove a relationship or political view. Cover participants with differing positions in shared events, and distinguish documented relationships from claims or interpretations.

## Preservation: no deletion of research candidates

**KEEP the existing research work intact.** No current candidate file is to be deleted, overwritten merely because it falls outside the current publication emphasis, or inserted into a public timeline without review.

Existing research files retained on branch `research/rewind-600-event-expansion-2026-10-13`:

- `new-people-award-events-400.json`: 400 provisional Nobel award-event candidates.
- `new-person-biography-candidates.json`: 703 provisional new-person dossiers.
- `existing-people-event-leads-200.json`: 200 provisional timeline leads for existing people.
- `institutional-laureates-and-evidence-corrections.json`: essential corrections/organisational recipients.
- `live-baseline.json` and `existing-people-baseline.json`: baseline deduplication inventories.
- `REVIEW_STATUS.md`: evidence shortcomings and publication acceptance gates.

**These records are research leads, not 600 independently verified, publication-ready events.**

## Workflow states

1. `research-candidate` — saved for potential inclusion, not verified.
2. `enrichment` — expanding full biographies, event participants, sources and location evidence.
3. `source-review` — validating claims, corroboration and deduplication against live Streets-Past data.
4. `editorially-approved` — complete and reviewed; eligible for publication.
5. `published` — visible in public REWiND timeline.

These are proposed editorial workflow labels; map to the application's existing publication enums or extend them carefully rather than writing unsupported strings directly into production tables.

## Publication gate

New people require comprehensive, sourced profiles covering biographical facts, roles, careers, education, works, awards, achievements, organisations, relevant public relationships, documented travel/stays, timeline events, aliases and reference identifiers where available. Fields may be explicitly unknown when not evidenced. Never invent a fact to reach a completeness score.

Events require a shared canonical event identity, original event-level sources, date/time precision, venue and geography at warranted resolution, accurate participant roles and presence modes, claims, evidence review and duplicate checks.

Publication priority is separate from permanent archival preservation. The Nobel and other broad historical research batches remain available for later expansion and can be enriched at any point. **Do not quietly discard them.**

## Infrastructure baseline

REWiND's database is in the Supabase project **Streets-Past**, not a separately named Supabase project. GitHub repository `miles-brown/REWiND`, Vercel project `rewind`. Do live database checks before declaring any prospective person or event new.
