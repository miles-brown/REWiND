import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, UserRound, Users } from "lucide-react";
import { getPeople } from "@/lib/rewind";

export const metadata: Metadata = {
  title: "Documented People — REWIND Evidence Atlas",
  description: "Historical figures and actors documented across the REWIND diplomatic evidence corpus.",
};

export default async function PeoplePage() {
  const people = await getPeople();

  return (
    <div className="page-shell">
      <header className="page-hero">
        <span className="eyebrow">PEOPLE</span>
        <h1>Lives in the record</h1>
        <p>People are connected through dated evidence, not static biographical prose.</p>
      </header>

      {people.length === 0 ? (
        <div
          className="zero-state"
          style={{
            padding: "4rem 2rem",
            textAlign: "center",
            border: "1px dashed var(--border-subtle, #333)",
            borderRadius: "8px",
            margin: "2rem auto",
            maxWidth: "600px",
          }}
        >
          <Users size={36} style={{ margin: "0 auto 1rem", opacity: 0.5 }} />
          <h2>No figures registered yet</h2>
          <p style={{ color: "var(--text-muted, #888)", marginTop: "0.5rem" }}>
            The canonical Supabase database is connected. Monitored historical figures will appear here
            as research records are compiled in Milestone B.
          </p>
        </div>
      ) : (
        <div className="people-grid">
          {people.map((p) => {
            const birthYear = p.birth ? p.birth.slice(0, 4) : "—";
            const deathYear = p.death ? p.death.slice(0, 4) : "present";
            return (
              <Link href={`/person/${p.slug}`} key={p.id}>
                <span className="person-monogram">
                  {p.name
                    .split(" ")
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join("")}
                </span>
                <div>
                  <small>{birthYear}—{deathYear}</small>
                  <h2>{p.name}</h2>
                  <p>{p.description}</p>
                  <b><UserRound /> {p.classification.toUpperCase()}</b>
                </div>
                <ArrowRight />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
