import Link from "next/link";
import { ArrowRight, GitBranch } from "lucide-react";
import { getRelationships } from "@/lib/rewind";

export const metadata = {
  title: "Diplomatic Relationships — REWIND Evidence Atlas",
  description: "Temporal co-appearance social graph generated dynamically from verified primary event records.",
};

export default async function RelationshipsPage() {
  const relationships = await getRelationships();

  return (
    <div className="page-shell">
      <header className="page-hero">
        <span className="eyebrow">TEMPORAL SOCIAL GRAPH</span>
        <h1>Person × Person</h1>
        <p>
          Every relationship is generated from dated intersections rather than a static claim that two people “knew” one another.
        </p>
      </header>

      {relationships.length === 0 ? (
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
          <GitBranch size={36} style={{ margin: "0 auto 1rem", opacity: 0.5 }} />
          <h2>No bilateral intersections recorded yet</h2>
          <p style={{ color: "var(--text-muted, #888)", marginTop: "0.5rem" }}>
            The canonical Supabase database is connected. Bilateral relationship intersections are computed
            automatically from shared verified events as research is added in Milestone B.
          </p>
        </div>
      ) : (
        <div className="relationship-list">
          {relationships.map((rel) => (
            <Link href={`/relationship/${rel.source}/${rel.target}`} key={rel.id}>
              <span className="person-monogram">
                {rel.sourceName
                  .split(" ")
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join("")}
              </span>
              <div className="relation-line">
                <i />
                <b>{rel.sharedEventsCount}</b>
              </div>
              <span className="person-monogram">
                {rel.targetName
                  .split(" ")
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join("")}
              </span>
              <div>
                <small>{rel.sourceName} ↔</small>
                <h2>{rel.targetName}</h2>
                <p>
                  {rel.sharedEventsCount} documented intersection
                  {rel.sharedEventsCount === 1 ? "" : "s"}
                </p>
              </div>
              <GitBranch />
              <ArrowRight />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
