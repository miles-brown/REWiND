import Link from "next/link";
import { ArrowRight, CheckCircle2, CircleDashed, Database, GitBranch, MapPinned, Quote, Search, Users } from "lucide-react";
import { getAtlasStatistics, getPeople } from "@/lib/rewind";

export default async function Home() {
  const stats = await getAtlasStatistics();
  const people = await getPeople({ limit: 6 });
  const provisional = Math.max(0, stats.eventCount - stats.verifiedCount);

  return (
    <>
      <section className="hub-hero">
        <div className="hub-hero-copy">
          <span className="signal"><i />TIME-INDEXED EVIDENCE</span>
          <h1>History is not a page.<br /><em>It is a position in time.</em></h1>
          <p>
            Explore documented lives through synchronized events, places, people and primary sources.
            Choose a person, move the timeline and watch the evidence change around them.
          </p>
          <div className="hub-actions">
            <Link href="/people"><Users />Choose a person <ArrowRight /></Link>
            <Link href="/events"><Search />Search every event</Link>
          </div>
        </div>
        <aside className="hub-index-card">
          <div>
            <small>ATLAS STATUS</small>
            <span>{stats.eventCount > 0 ? "LIVE INDEX" : "DATABASE READY"}</span>
          </div>
          <dl>
            <div><dt>Events</dt><dd>{stats.eventCount}</dd></div>
            <div><dt>People</dt><dd>{stats.personCount}</dd></div>
            <div><dt>Sources</dt><dd>{stats.sourceCount}</dd></div>
            <div><dt>Places</dt><dd>{stats.placeCount}</dd></div>
          </dl>
          <p>
            <CheckCircle2 />{stats.verifiedCount} verified records <span>·</span> <CircleDashed />{provisional} provisional
          </p>
        </aside>
      </section>

      <section className="hub-launchpad">
        <div className="section-heading">
          <div>
            <span className="eyebrow">CHOOSE A WAY IN</span>
            <h2>Explore the atlas</h2>
          </div>
          <p>
            Every view is generated from the same event records, so time, place, people and evidence always remain connected.
          </p>
        </div>
        <div className="hub-launch-grid">
          <Link href="/people">
            <Users />
            <span>
              <small>DOCUMENTED LIVES</small>
              <b>People</b>
              <p>Open a person and rewind their chronology.</p>
            </span>
            <ArrowRight />
          </Link>
          <Link href="/events">
            <Database />
            <span>
              <small>{stats.eventCount} RECORDS</small>
              <b>Events</b>
              <p>Search the central unit of the database.</p>
            </span>
            <ArrowRight />
          </Link>
          <Link href="/places">
            <MapPinned />
            <span>
              <small>GEOGRAPHY</small>
              <b>Places</b>
              <p>See where the evidence puts people over time.</p>
            </span>
            <ArrowRight />
          </Link>
          <Link href="/relationships">
            <GitBranch />
            <span>
              <small>INTERSECTIONS</small>
              <b>Relationships</b>
              <p>Trace every dated meeting between two lives.</p>
            </span>
            <ArrowRight />
          </Link>
          <Link href="/quotes">
            <Quote />
            <span>
              <small>WORDS IN CONTEXT</small>
              <b>Quotes</b>
              <p>Find statements attached to speakers and sources.</p>
            </span>
            <ArrowRight />
          </Link>
          <Link href="/sources">
            <Database />
            <span>
              <small>{stats.sourceCount} REFERENCES</small>
              <b>Sources</b>
              <p>Inspect the evidence behind each claim.</p>
            </span>
            <ArrowRight />
          </Link>
        </div>
      </section>

      <section className="hub-subjects">
        <div className="section-heading">
          <div>
            <span className="eyebrow">PEOPLE IN THIS EDITION</span>
            <h2>Start with a documented life</h2>
          </div>
          <Link href="/people">View everyone <ArrowRight /></Link>
        </div>

        {people.length === 0 ? (
          <div className="empty-state-banner" style={{ padding: "2rem", border: "1px dashed var(--border-subtle, #333)", borderRadius: "8px", textAlign: "center", color: "var(--text-muted, #888)" }}>
            <p style={{ margin: 0, fontWeight: 500 }}>Canonical Supabase Evidence Database Connected</p>
            <small style={{ display: "block", marginTop: "0.5rem" }}>
              Milestone A cutover complete. No legacy records have been seeded. Records will be entered afresh during Milestone B research.
            </small>
          </div>
        ) : (
          <div className="hub-subject-grid">
            {people.map((person) => (
              <Link href={`/person/${person.slug}`} key={person.id}>
                <span className="person-monogram">
                  {person.name
                    .split(" ")
                    .map((name) => name[0])
                    .slice(0, 2)
                    .join("")}
                </span>
                <div>
                  <small>{person.classification.toUpperCase()}</small>
                  <b>{person.name}</b>
                  <p>{person.description}</p>
                </div>
                <ArrowRight />
              </Link>
            ))}
          </div>
        )}

        <div className="trust-strip">
          <span><CheckCircle2 />Confirmed means direct or authoritative evidence</span>
          <span><CircleDashed />Uncertainty remains visible, never silently interpolated</span>
          <Link href="/methodology">Read the evidence standard <ArrowRight /></Link>
        </div>
      </section>
    </>
  );
}
