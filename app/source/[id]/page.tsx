import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { getSourceById } from "@/lib/rewind";
import { EventCard } from "@/components/rewind/EventCard";

export default async function SourcePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getSourceById(id);
  if (!data) notFound();

  const { source, events: linked } = data;

  return (
    <div className="page-shell">
      <header className="page-hero source-hero">
        <Link className="back-link" href="/sources">
          <ArrowLeft /> Source register
        </Link>
        <span className="eyebrow">
          {source.classification} · {source.sourceType.replaceAll("-", " ")}
        </span>
        <h1>{source.title}</h1>
        <p>{source.publisher}</p>
        {source.url && (
          <a
            className="external-primary"
            href={source.url}
            target="_blank"
            rel="noreferrer"
          >
            Open original source <ExternalLink />
          </a>
        )}
      </header>

      <section className="content-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">LINKED EVIDENCE</span>
            <h2>
              {linked.length} event{linked.length === 1 ? "" : "s"}
            </h2>
          </div>
          <p>
            A source can support more than one distinct event without becoming the event itself.
          </p>
        </div>

        {linked.length > 0 ? (
          <div className="event-grid">
            {linked.map((e) => (
              <EventCard event={e} key={e.id} />
            ))}
          </div>
        ) : (
          <div
            className="zero-state"
            style={{
              padding: "3rem 1.5rem",
              textAlign: "center",
              border: "1px dashed var(--border-subtle, #333)",
              borderRadius: "8px",
            }}
          >
            <p style={{ color: "var(--text-muted, #888)" }}>
              No active events linked to this source document yet.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
