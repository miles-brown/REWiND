import { getGeographicHierarchy } from "@/lib/rewind";
import { PlacesExplorer } from "@/components/rewind/PlacesExplorer";
import { MapPin } from "lucide-react";

export const metadata = {
  title: "Documented Geography & Hierarchy — REWIND Evidence Atlas",
  description: "Hierarchical global gazetteer organizing sovereign countries, metropolitan cities, institutional venues, and physical street addresses documented in the REWIND evidence corpus.",
};

export default async function PlacesPage() {
  const { data: hierarchy, error } = await getGeographicHierarchy();

  return (
    <div className="page-shell">
      <header className="page-hero">
        <span className="eyebrow">GEOGRAPHIC HIERARCHY REGISTER</span>
        <h1>Documented Geography</h1>
        <p>
          Locations are organized systematically across 4 forensic tiers: sovereign <b>Countries</b>, metropolitan <b>Cities</b>, institutional <b>Venues</b>, and physical <b>Street Addresses</b>. Locations are shown only at the precision supported by verified evidence.
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
            <p style={{ color: "var(--muted, #64748b)", marginTop: "0.5rem" }}>
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
