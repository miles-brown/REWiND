import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, Calendar, Newspaper } from "lucide-react";
import { getTopics } from "@/lib/rewind/topics";

export const metadata: Metadata = {
  title: "Continuous News & Historical Topics — REWIND Evidence Atlas",
  description: "Non-person timelines for continuous news subjects, global conflicts, diplomatic peace processes, and historical investigations.",
};

export default async function TopicsPage() {
  const topics = await getTopics();

  return (
    <div className="page-shell">
      <header className="page-hero">
        <span className="eyebrow">NON-PERSON TIMELINES</span>
        <h1>Continuous News & Historical Topics</h1>
        <p>
          Thread events together across multiple figures, venues, and nations for continuous historical subjects.
        </p>
      </header>

      {topics.length === 0 ? (
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
          <Newspaper size={36} style={{ margin: "0 auto 1rem", opacity: 0.5 }} />
          <h2>No topic subjects registered</h2>
        </div>
      ) : (
        <div
          className="topics-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
            gap: "1.5rem",
            margin: "2rem 0",
          }}
        >
          {topics.map((t) => (
            <Link
              key={t.id}
              href={`/topic/${t.slug}`}
              style={{
                background: "var(--bg-surface, #141414)",
                border: "1px solid var(--border-subtle, #2a2a2a)",
                borderRadius: "10px",
                padding: "1.5rem",
                textDecoration: "none",
                color: "inherit",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                transition: "border-color 0.2s ease, transform 0.2s ease",
              }}
            >
              <div>
                <span
                  style={{
                    display: "inline-block",
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    color: "var(--brand-accent, #6366f1)",
                    marginBottom: "0.5rem",
                  }}
                >
                  {t.category}
                </span>
                <h2 style={{ fontSize: "1.25rem", fontWeight: 700, margin: "0 0 0.5rem 0", lineHeight: 1.3 }}>
                  {t.name}
                </h2>
                <p style={{ color: "var(--text-muted, #999)", fontSize: "0.88rem", lineHeight: 1.5, margin: 0 }}>
                  {t.summary}
                </p>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: "1.5rem",
                  paddingTop: "1rem",
                  borderTop: "1px solid var(--border-subtle, #222)",
                  fontSize: "0.8rem",
                  color: "var(--text-muted, #888)",
                }}
              >
                <span style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
                  <Calendar size={13} />
                  {t.startedDate ? t.startedDate.slice(0, 4) : "—"} — {t.endedDate ? t.endedDate.slice(0, 4) : "Present"}
                </span>
                <ArrowRight size={14} style={{ color: "var(--brand-accent, #6366f1)" }} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
