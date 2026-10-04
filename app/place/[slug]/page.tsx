import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Building,
  Building2,
  ChevronRight,
  Compass,
  Globe2,
  Layers,
  MapPin,
  ShieldCheck,
} from "lucide-react";
import { getPlaceBySlug } from "@/lib/rewind";
import { EventCard } from "@/components/rewind/EventCard";
import { MapGraphic } from "@/components/rewind/MapGraphic";

export default async function PlacePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!slug || !/^[a-zA-Z0-9_-]+$/.test(slug)) {
    notFound();
  }

  const placeResult = await getPlaceBySlug(slug);
  if (placeResult.error) {
    throw new Error(`Place lookup failed: ${placeResult.error}`);
  }
  if (!placeResult.data) notFound();

  const { place, events: linked } = placeResult.data;

  const countrySlug = (place.country || "").toLowerCase().replace(/\s+/g, "-");
  const citySlug = `${countrySlug}-${(place.city || "").toLowerCase().replace(/\s+/g, "-")}`;
  const isCountry = place.placeType === "country" || place.geographicLevel === "country";
  const isCity = place.placeType === "city" || place.geographicLevel === "city";
  const isAddress = place.placeType === "address" || place.geographicLevel === "address";
  const isVenue = !isCountry && !isCity && !isAddress;

  return (
    <div className="page-shell">
      {/* Hierarchy Breadcrumb Navigation */}
      <nav className="hierarchy-breadcrumb-nav" aria-label="Geographic Hierarchy Breadcrumb">
        <Link href="/places" className="breadcrumb-item breadcrumb-root">
          <Layers size={14} />
          <span>Places Index</span>
        </Link>

        {place.country && !isCountry && (
          <>
            <ChevronRight size={13} className="breadcrumb-separator" />
            <Link href={`/place/${countrySlug}`} className="breadcrumb-item">
              <Globe2 size={13} />
              <span>{place.country}</span>
            </Link>
          </>
        )}

        {place.city && !isCountry && !isCity && place.city !== "National Jurisdiction" && (
          <>
            <ChevronRight size={13} className="breadcrumb-separator" />
            <Link href={`/place/${citySlug}`} className="breadcrumb-item">
              <Building2 size={13} />
              <span>{place.city}</span>
            </Link>
          </>
        )}

        <ChevronRight size={13} className="breadcrumb-separator" />
        <span className="breadcrumb-item active" aria-current="page">
          {isCountry && <Globe2 size={13} />}
          {isCity && <Building2 size={13} />}
          {isAddress && <MapPin size={13} />}
          {isVenue && <Building size={13} />}
          <span>{place.venue || place.city}</span>
        </span>
      </nav>

      {/* Hero Section with Forensic Meta */}
      <header className="page-hero place-hero-card">
        <div className="place-level-badge-strip">
          {isCountry && <span className="tier-tag country-tag">TIER 1 · SOVEREIGN COUNTRY</span>}
          {isCity && <span className="tier-tag city-tag">TIER 2 · METROPOLITAN CITY</span>}
          {isVenue && <span className="tier-tag venue-tag">TIER 3 · VENUE & COMPLEX</span>}
          {isAddress && <span className="tier-tag address-tag">TIER 4 · STREET ADDRESS</span>}
          <span className="event-count-badge ml-auto">{linked.length} Documented Records</span>
        </div>

        <h1>{place.venue || place.city}</h1>

        <div className="place-location-summary">
          {!isCountry && (
            <p className="location-detail">
              📍 Located in <b>{place.city}</b>, <b>{place.country}</b>
            </p>
          )}

          {/* Physical Street Address (CRITICAL for Venues) */}
          {place.streetAddress && (
            <div className="place-street-address-pill">
              <MapPin size={14} className="pin-icon" />
              <span>Physical Address: <b>{place.streetAddress}</b></span>
            </div>
          )}

          {/* Coordinates */}
          {place.latitude && place.longitude && (
            <div className="place-coords-pill">
              <Compass size={14} />
              <span>WGS-84: {place.latitude.toFixed(4)}° N, {place.longitude.toFixed(4)}° E</span>
            </div>
          )}
        </div>

        {/* Sub-Venue Areas (if present) */}
        {place.venueAreas && place.venueAreas.length > 0 && (
          <div className="place-areas-strip">
            <span className="areas-heading">Documented Venue Sub-Areas:</span>
            <div className="area-tags">
              {place.venueAreas.map((area) => (
                <span key={area.id} className="area-tag">
                  {area.name} ({area.areaType})
                </span>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Map visualization */}
      {linked.length > 0 && <MapGraphic events={linked} selected={linked[0]?.id} />}

      {/* Chronological Event Evidence Section */}
      <section className="content-section">
        <div className="section-header-row">
          <div className="section-title-wrap">
            <ShieldCheck size={20} className="section-icon" />
            <h2>Documented Chronological Events ({linked.length})</h2>
          </div>
          <p className="section-subtitle">
            Forensic primary records, summit meetings, and official statements recorded at {place.venue || place.city}.
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
              No documented events recorded at {place.venue || place.city} yet.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
