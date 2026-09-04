import Link from "next/link";
import { ArrowRight, MessageSquareQuote, Quote, ShieldAlert } from "lucide-react";
import { getEvents, getQuotesWithStatus } from "@/lib/rewind";

export const metadata = {
  title: "Archival Quotes — REWIND Evidence Atlas",
  description: "Attributable speech, plenary addresses, and verified quotations with exact coordinates.",
};

export default async function QuotesPage() {
  const [quotesResult, eventsResult] = await Promise.all([
    getQuotesWithStatus(),
    getEvents({ limit: 50 }),
  ]);

  const quotes = quotesResult.data;
  const loaderError = quotesResult.error || eventsResult.error;

  const speechEvents = eventsResult.data.filter((e) =>
    (e.eventTypes || []).some((t) => /Speech|Statement|Interview|Press|bilateral|plenary/i.test(t))
  );

  return (
    <div className="page-shell">
      <header className="page-hero">
        <span className="eyebrow">QUOTE REGISTER</span>
        <h1>Words need coordinates.</h1>
        <p>
          This edition exposes speech-bearing events while verbatim quotations and timestamps are
          transcribed and reviewed. It does not manufacture quotation text from summaries.
        </p>
      </header>

      <div className="quote-notice">
        <Quote />
        <div>
          <b>Quotation integrity gate</b>
          <p>
            These records contain attributable audiovisual or transcript evidence. Exact quotation entities
            will appear only after speaker, wording, language and timestamp review.
          </p>
        </div>
      </div>

      {loaderError ? (
        <div
          className="zero-state"
          role="alert"
          style={{
            padding: "4rem 2rem",
            textAlign: "center",
            border: "1px dashed var(--border-subtle, #333)",
            borderRadius: "8px",
            margin: "2rem auto",
            maxWidth: "600px",
          }}
        >
          <ShieldAlert size={36} style={{ margin: "0 auto 1rem", opacity: 0.6, color: "var(--accent-warning, #eab308)" }} />
          <h2>Speech Register Unavailable</h2>
          <p style={{ color: "var(--text-muted, #888)", marginTop: "0.5rem" }}>
            The speech and quotation database is currently unreachable. Please verify database connectivity or try again later.
          </p>
        </div>
      ) : quotes.length === 0 && speechEvents.length === 0 ? (
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
          <MessageSquareQuote size={36} style={{ margin: "0 auto 1rem", opacity: 0.5 }} />
          <h2>No speech records registered yet</h2>
          <p style={{ color: "var(--text-muted, #888)", marginTop: "0.5rem" }}>
            The canonical Supabase database is connected. Verbatim quotes and timestamped audio records
            will appear here as research records are added in Milestone B.
          </p>
        </div>
      ) : (
        <div className="quote-event-list">
          {quotes.map((q) => (
            <article key={q.id} className="quote-item-card" style={{ padding: "1.5rem", border: "1px solid var(--border-subtle, #333)", borderRadius: "8px", marginBottom: "1rem" }}>
              <blockquote style={{ fontSize: "1.1rem", fontStyle: "italic", margin: "0 0 0.75rem" }}>“{q.quote}”</blockquote>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.85rem", color: "var(--text-muted, #888)" }}>
                <span><b>{q.speakerName || "Documented Speaker"}</b> · {q.language?.toUpperCase()}</span>
                {(q.eventSlug || q.eventId) && <Link href={`/event/${q.eventSlug || q.eventId}`}>View Event <ArrowRight size={12} /></Link>}
              </div>
            </article>
          ))}
          {speechEvents.map((e) => (
            <Link href={`/event/${e.slug}`} key={e.id}>
              <time>{e.startDate}</time>
              <div>
                <b>{e.eventName}</b>
                <small>
                  {e.city} · {(e.eventTypes || []).join(", ")}
                </small>
              </div>
              <ArrowRight />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
