import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import { getPlaces } from "@/lib/rewind";

export const metadata = {
  title: "Documented Places — REWIND Evidence Atlas",
  description: "Global gazetteer and diplomatic venues documented in the REWIND evidence corpus.",
};

export default async function PlacesPage() {
  const places = await getPlaces();

  return (
    <div className="page-shell">
      <header className="page-hero">
        <span className="eyebrow">PLACE INDEX</span>
        <h1>Documented geography</h1>
        <p>
          Locations are shown only at the precision supported by evidence. No route silently fills undocumented gaps.
        </p>
      </header>

      {places.length === 0 ? (
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
          <MapPin size={36} style={{ margin: "0 auto 1rem", opacity: 0.5 }} />
          <h2>No places registered yet</h2>
          <p style={{ color: "var(--text-muted, #888)", marginTop: "0.5rem" }}>
            The canonical Supabase database is connected. Venues and places will appear here as research
            records are entered in Milestone B.
          </p>
        </div>
      ) : (
        <div className="place-grid">
          {places.map((p) => (
            <Link href={`/place/${p.slug}`} key={p.id}>
              <MapPin />
              <div>
                <small>{p.country}</small>
                <h2>{p.venue || p.city}</h2>
                <p>{p.city}, {p.country} · {p.placeType.toUpperCase()}</p>
              </div>
              <ArrowRight />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
