import { GitBranch } from "lucide-react";
import { getRelationshipsWithStatus } from "@/lib/rewind";
import { RelationshipNetworkGraph } from "@/components/rewind/RelationshipNetworkGraph";

export const metadata = {
  title: "Diplomatic Relationships — REWIND Evidence Atlas",
  description: "Temporal co-appearance social graph generated dynamically from verified primary event records.",
};

export default async function RelationshipsPage() {
  const { data: relationships, error } = await getRelationshipsWithStatus();

  return (
    <div className="page-shell">
      <header className="page-hero">
        <span className="eyebrow">TEMPORAL SOCIAL GRAPH</span>
        <h1>Person × Person</h1>
        <p>
          Every relationship is generated from dated intersections rather than a static claim that two people “knew” one another.
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
          <GitBranch size={36} style={{ margin: "0 auto 1rem", opacity: 0.5 }} />
          <h2>Database unavailable</h2>
          <p style={{ color: "var(--text-muted, #888)", marginTop: "0.5rem" }}>
            The relationship graph could not be loaded at this time. Please try again later.
          </p>
        </div>
      ) : relationships.length === 0 ? (
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
        <RelationshipNetworkGraph
          relationships={[...relationships]
            .sort((a, b) => b.sharedEventsCount - a.sharedEventsCount)
            .slice(0, 50)}
        />
      )}
    </div>
  );
}
