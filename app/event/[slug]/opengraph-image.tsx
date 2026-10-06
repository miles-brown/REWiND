import { ImageResponse } from "next/og";
import { notFound } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { eventsCorpus } from "@/data/seeds/events-corpus";

export const runtime = "edge";
export const alt = "REWIND Evidence Atlas — Historical Event Record";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

interface EventMeta {
  eventName: string;
  startDate: string;
  venueName?: string | null;
  city?: string | null;
  country?: string | null;
  eventTypes?: string[] | null;
  categories?: string[] | null;
  summary?: string | null;
}

function getFallbackEventMeta(slug: string): EventMeta | null {
  const fb = eventsCorpus.find((e) => e.slug === slug || e.id === slug);
  if (!fb) return null;
  return {
    eventName: fb.eventName,
    startDate: fb.startDate,
    venueName: fb.venueName || null,
    city: fb.city || null,
    country: fb.country || null,
    eventTypes: fb.eventTypes || null,
    categories: fb.categories || null,
    summary: fb.summary || null,
  };
}

async function getEventMeta(slug: string): Promise<EventMeta | null> {
  if (!slug || typeof slug !== "string" || !/^[a-zA-Z0-9_-]+$/.test(slug)) {
    return null;
  }
  const supabase = getSupabaseServerClient();
  if (!supabase) {
    const fallback = getFallbackEventMeta(slug);
    if (fallback) return fallback;
    console.warn("[OG Image] Supabase server client is not configured or unavailable for event OG rendering.");
    return null;
  }

  const { data, error } = await supabase
    .from("events")
    .select("event_name, start_date, venue_name, city, country, event_types, categories, summary")
    .or(`slug.eq.${slug},id.eq.${slug}`)
    .eq("publication_status", "published")
    .maybeSingle();

  if (error) {
    console.error(`[OG Image Error] Failed to fetch event metadata for slug "${slug}":`, error.message);
    return getFallbackEventMeta(slug);
  }

  if (data) {
    return {
      eventName: data.event_name,
      startDate: data.start_date,
      venueName: data.venue_name,
      city: data.city,
      country: data.country,
      eventTypes: data.event_types,
      categories: data.categories,
      summary: data.summary,
    };
  }

  return null;
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = await getEventMeta(slug);

  if (!event) {
    notFound();
  }

  const title = event.eventName;
  const date = event.startDate;
  const location = [event.venueName, event.city, event.country].filter(Boolean).join(" · ") || "Diplomatic Venue";
  const eventType = (event.eventTypes?.[0] || event.categories?.[0] || "Diplomatic Summit").toUpperCase();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(135deg, #030712 0%, #09131a 50%, #0b1e2e 100%)",
          color: "#f8fafc",
          padding: "60px 80px",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        {/* Header Branding */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "8px",
                background: "#0284c7",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ffffff",
                fontWeight: "900",
                fontSize: "20px",
              }}
            >
              R
            </div>
            <span style={{ fontSize: "22px", fontWeight: "800", letterSpacing: "1px", color: "#f8fafc" }}>
              REWIND
            </span>
            <span style={{ fontSize: "14px", color: "#94a3b8", fontWeight: "600", marginLeft: "6px" }}>
              EVIDENCE ATLAS
            </span>
          </div>

          <div
            style={{
              padding: "6px 16px",
              borderRadius: "20px",
              background: "rgba(56, 189, 248, 0.15)",
              border: "1px solid rgba(56, 189, 248, 0.3)",
              color: "#38bdf8",
              fontSize: "13px",
              fontWeight: "700",
              letterSpacing: "0.5px",
            }}
          >
            {eventType}
          </div>
        </div>

        {/* Hero Event Title */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <span style={{ fontSize: "16px", fontWeight: "700", color: "#38bdf8", textTransform: "uppercase", letterSpacing: "1px" }}>
            {date} · {location}
          </span>
          <h1
            style={{
              fontSize: "52px",
              fontWeight: "900",
              lineHeight: 1.15,
              color: "#ffffff",
              margin: 0,
              maxWidth: "1000px",
            }}
          >
            {title}
          </h1>
          {event?.summary && (
            <p
              style={{
                fontSize: "20px",
                color: "#cbd5e1",
                margin: 0,
                maxWidth: "950px",
                lineHeight: 1.4,
              }}
            >
              {event.summary.length > 180 ? `${event.summary.slice(0, 177)}...` : event.summary}
            </p>
          )}
        </div>

        {/* Footer Meta */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingTop: "24px",
            borderTop: "1px solid rgba(255, 255, 255, 0.1)",
            fontSize: "15px",
            color: "#94a3b8",
          }}
        >
          <div>Primary Government Records & Verified Coordinates</div>
          <div style={{ color: "#38bdf8", fontWeight: "700" }}>rewind.evidence.atlas</div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
