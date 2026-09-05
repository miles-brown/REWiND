import { notFound } from "next/navigation";
import { getPlaceBySlug } from "@/lib/rewind";
import { EventCard } from "@/components/rewind/EventCard";
import { MapGraphic } from "@/components/rewind/MapGraphic";

export default async function PlacePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const placeData = await getPlaceBySlug(slug);
  if (!placeData) notFound();

  const { place, events: linked } = placeData;

  return (
    <div className="page-shell">
      <header className="page-hero">
        <span className="eyebrow">PLACE CHRONOLOGY</span>
        <h1>{place.venue || place.city}</h1>
        <p>
          {linked.length} indexed records in {place.city}, {place.country}.
        </p>
      </header>
      {linked.length > 0 && <MapGraphic events={linked} selected={linked[0]?.id} />}
      <section className="content-section">
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
              No documented events recorded at {place.venue || place.city} yet.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
