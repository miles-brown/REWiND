import { getGeographicHierarchy } from "@/lib/rewind";
import { PlacesExplorer } from "@/components/rewind/PlacesExplorer";
import { MapPin } from "lucide-react";

export const metadata = {
  title: "Places & Venues Atlas — REWIND Evidence Atlas",
  description: "Interactive global gazetteer and map of countries, cities, institutional venues, broadcast studios, and physical street addresses documented in the REWIND evidence corpus.",
};

/**
 * Loads the geographic hierarchy and renders the places explorer or an empty/error state.
 */
export default async function PlacesPage() {
  const { data: hierarchy, error } = await getGeographicHierarchy();

  return (
    <div className="page-shell places-page">
      <header className="page-hero places-hero">
        <span className="eyebrow">LOCATIONS & VENUES ATLAS</span>
        <h1>Places & Venues</h1>
        <p>
          Explore documented locations across four spatial tiers — <b>Countries</b>, <b>Cities</b>, <b>Venues & Complexes</b>, and <b>Street Addresses</b> — with an interactive pinned map that tracks every venue as you browse.
        </p>
      </header>

      {!hierarchy || (hierarchy.allCountries.length === 0 && hierarchy.allVenues.length === 0) ? (
        error ? (
          <div
            className="zero-state error-state"
            role="alert"
            style={{
              padding: "4rem 2rem",
              textAlign: "center",
              border: "1px dashed var(--line, #e2e8f0)",
              borderRadius: "8px",
              margin: "2rem auto",
              maxWidth: "600px",
            }}
          >
            <h2>Geography register temporarily unavailable</h2>
            <p style={{ color: "var(--muted, #94a3b8)", marginTop: "0.5rem" }}>
              {error || "We are unable to load the geographic hierarchy right now. Please try again later."}
            </p>
          </div>
        ) : (
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
              Venues and places will appear here as research records are documented.
            </p>
          </div>
        )
      ) : (
        <section className="places-explorer-section">
          <PlacesExplorer hierarchy={hierarchy} error={error} />
        </section>
      )}
    </div>
  );
}
