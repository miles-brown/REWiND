import { ImageResponse } from "next/og";
import { notFound } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const alt = "REWIND Evidence Atlas — Person Dossier";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

interface PersonMeta {
  canonicalName: string;
  name: string;
  description: string;
  nationality: string;
  classification: string;
}

async function getPersonMeta(slug: string): Promise<PersonMeta | null> {
  const supabase = getSupabaseServerClient();
  if (supabase) {
    const { data, error } = await supabase
      .from("people")
      .select("canonical_name, display_name, primary_role, nationality, classification, summary")
      .or(`slug.eq.${slug},id.eq.${slug}`)
      .eq("publication_status", "published")
      .maybeSingle();

    if (!error && data) {
      return {
        canonicalName: data.canonical_name || data.display_name || "",
        name: data.display_name || data.canonical_name || "",
        description: data.summary || data.primary_role || "",
        nationality: data.nationality || "",
        classification: data.classification || "public-figure",
      };
    }
  }

  // Lightweight in-memory seed lookup
  try {
    const { masterPeopleSeed } = await import("@/data/seeds/index");
    const p = masterPeopleSeed.find((person) => person.slug === slug || person.id === slug);
    if (p) {
      return {
        canonicalName: p.canonicalName,
        name: p.displayName || p.canonicalName,
        description: p.summary || p.primaryRole || "",
        nationality: p.nationality || "",
        classification: p.classification || "public-figure",
      };
    }
  } catch {}

  return null;
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const person = await getPersonMeta(slug);

  if (!person) {
    notFound();
  }

  const title = person.canonicalName || person.name;
  const role = person.description || "";
  const nationality = person.nationality || "";
  const category = person.classification ? person.classification.toUpperCase() : "PUBLIC FIGURE";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(135deg, #030712 0%, #09131a 50%, #0f172a 100%)",
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
            {category}
          </div>
        </div>

        {/* Hero Figure Title */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <span style={{ fontSize: "16px", fontWeight: "700", color: "#38bdf8", textTransform: "uppercase", letterSpacing: "1px" }}>
            {nationality ? `${nationality} · ` : ""}VERIFIED BIOGRAPHICAL DOSSIER
          </span>
          <h1
            style={{
              fontSize: "56px",
              fontWeight: "900",
              lineHeight: 1.1,
              color: "#ffffff",
              margin: 0,
              maxWidth: "1000px",
            }}
          >
            {title}
          </h1>
          {role ? (
            <p
              style={{
                fontSize: "22px",
                color: "#cbd5e1",
                margin: 0,
                maxWidth: "950px",
                lineHeight: 1.4,
              }}
            >
              {role}
            </p>
          ) : null}
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
          <div>Primary Source Archival Attributions & Geodesic Chronology</div>
          <div style={{ color: "#38bdf8", fontWeight: "700" }}>rewind.evidence.atlas</div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
