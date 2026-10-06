import { Suspense } from "react";
import type { Metadata } from "next";
import { Users } from "lucide-react";
import { getPeopleWithStatus } from "@/lib/rewind";
import { eventsCorpus } from "@/data/seeds/events-corpus";
import { PeopleDirectory } from "@/components/rewind/PeopleDirectory";

export const metadata: Metadata = {
  title: "Documented People Directory — REWIND Evidence Atlas",
  description: "Historical figures, diplomats, sovereigns, and key actors documented across the REWIND forensic evidence corpus.",
};

function PeopleDirectoryLoading() {
  return (
    <div style={{ width: "100%", maxWidth: "1400px", margin: "0 auto" }}>
      <div
        style={{
          height: "120px",
          background: "rgba(15, 23, 42, 0.6)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: "12px",
          marginBottom: "1.5rem",
          animation: "pulse 1.5s infinite ease-in-out",
        }}
      />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
          gap: "1.25rem",
        }}
      >
        {Array.from({ length: 9 }).map((_, i) => (
          <div
            key={i}
            style={{
              height: "200px",
              background: "rgba(15, 23, 42, 0.4)",
              border: "1px solid rgba(255, 255, 255, 0.05)",
              borderRadius: "12px",
              animation: "pulse 1.5s infinite ease-in-out",
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default async function PeoplePage() {
  const { data: people, error } = await getPeopleWithStatus();

  // Precompute event participation count per person
  const eventCounts: Record<string, number> = {};
  for (const e of eventsCorpus) {
    for (const part of e.participants || []) {
      if (part.personId) {
        eventCounts[part.personId] = (eventCounts[part.personId] || 0) + 1;
      }
    }
  }

  return (
    <div className="page-shell">
      <header className="page-hero" style={{ marginBottom: "2rem" }}>
        <span className="eyebrow">HISTORICAL FIGURES DIRECTORY</span>
        <h1>Lives in the Record</h1>
        <p>
          Monitored historical actors, heads of state, diplomats, and royalty linked through primary dated evidence,
          co-attendance rosters, and jurisdictional mandates.
        </p>
      </header>

      {error ? (
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
          <h2>Database unavailable</h2>
          <p style={{ color: "var(--text-muted, #888)", marginTop: "0.5rem" }}>
            The people catalog could not be loaded at this time. Please try again later.
          </p>
        </div>
      ) : people.length === 0 ? (
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
            as research records are compiled.
          </p>
        </div>
      ) : (
        <Suspense fallback={<PeopleDirectoryLoading />}>
          <PeopleDirectory people={people} eventCounts={eventCounts} />
        </Suspense>
      )}
    </div>
  );
}
