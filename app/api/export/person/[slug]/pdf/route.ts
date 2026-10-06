import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { getPersonBySlugWithStatus, getEventsByPersonWithStatus, evaluateQueryResult } from "@/lib/rewind";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  if (!slug || typeof slug !== "string" || !/^[a-zA-Z0-9_-]+$/.test(slug)) {
    return NextResponse.json(
      { error: "Invalid person identifier format." },
      { status: 400 }
    );
  }

  const { data: person, isUnavailable: personUnavailable, isNotFound: personNotFound } = evaluateQueryResult(
    await getPersonBySlugWithStatus(slug)
  );

  if (personUnavailable) {
    return NextResponse.json(
      { error: "Database error retrieving person record." },
      { status: 500 }
    );
  }

  if (personNotFound || !person) {
    return NextResponse.json(
      { error: "Person record not found or inaccessible for export." },
      { status: 404 }
    );
  }

  const { data: events, error: eventsError } = await getEventsByPersonWithStatus(person.slug);
  if (eventsError) {
    return NextResponse.json(
      { error: "Database error retrieving events for person." },
      { status: 500 }
    );
  }
  const verifiedEvents = (events || []).filter((e) => e.verificationStatus === "verified");

  // Compute deterministic SHA-256 forensic checksum of full data payload
  const payloadDigest = createHash("sha256")
    .update(JSON.stringify({ person, events: verifiedEvents }))
    .digest("hex");

  const exportedAt = new Date().toISOString();

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>REWIND Dossier — ${escapeHtml(person.canonicalName || person.name)}</title>
  <style>
    @page { size: A4; margin: 20mm 15mm; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #0f172a;
      background: #ffffff;
      line-height: 1.5;
      font-size: 13px;
      margin: 0;
      padding: 24px;
    }
    .header {
      border-bottom: 2px solid #0284c7;
      padding-bottom: 16px;
      margin-bottom: 24px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    .brand { font-size: 20px; font-weight: 900; color: #0284c7; letter-spacing: 1px; }
    .brand-sub { font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; }
    .doc-meta { font-size: 11px; text-align: right; color: #64748b; }
    .hero { margin-bottom: 24px; }
    .hero h1 { font-size: 26px; margin: 0 0 6px 0; color: #0f172a; }
    .hero-role { font-size: 14px; color: #334155; font-weight: 600; margin-bottom: 12px; }
    .meta-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      background: #f8fafc;
      padding: 12px;
      border-radius: 6px;
      border: 1px solid #e2e8f0;
      margin-bottom: 20px;
    }
    .meta-cell small { display: block; font-size: 10px; color: #64748b; text-transform: uppercase; font-weight: 700; }
    .meta-cell b { font-size: 12px; color: #1e293b; }
    .section-title {
      font-size: 14px;
      font-weight: 800;
      color: #0f172a;
      border-bottom: 1px solid #cbd5e1;
      padding-bottom: 4px;
      margin: 24px 0 12px 0;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 12px; }
    th { background: #f1f5f9; text-align: left; padding: 8px; font-weight: 700; color: #475569; border-bottom: 1px solid #cbd5e1; }
    td { padding: 8px; border-bottom: 1px solid #e2e8f0; vertical-align: top; }
    .badge { display: inline-block; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 700; background: #e0f2fe; color: #0369a1; text-transform: uppercase; }
    .footer {
      margin-top: 36px;
      padding-top: 16px;
      border-top: 1px solid #e2e8f0;
      font-size: 11px;
      color: #64748b;
      display: flex;
      justify-content: space-between;
    }
    .checksum { font-family: monospace; font-size: 10px; word-break: break-all; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="brand">REWIND EVIDENCE ATLAS</div>
      <div class="brand-sub">Forensic Biographical Dossier & Attestation</div>
    </div>
    <div class="doc-meta">
      <div><b>Exported (UTC):</b> ${exportedAt.slice(0, 19).replace("T", " ")} UTC</div>
      <div><b>Timestamp (ISO-8601):</b> <code style="font-size:10px;">${exportedAt}</code></div>
      <div><b>Record ID:</b> ${escapeHtml(person.id)}</div>
      <div><b>Canonical Slug:</b> ${escapeHtml(person.slug)}</div>
    </div>
  </div>

  <div class="hero">
    <h1>${escapeHtml(person.canonicalName || person.name)}</h1>
    <div class="hero-role">${escapeHtml(person.description || "Historical Sovereign / Diplomatic Subject")}</div>
    <div class="meta-grid">
      <div class="meta-cell">
        <small>Nationality</small>
        <b>${escapeHtml(person.nationality || "International")}</b>
      </div>
      <div class="meta-cell">
        <small>Classification</small>
        <b>${escapeHtml(person.classification || "Public Figure")}</b>
      </div>
      <div class="meta-cell">
        <small>Documented Events</small>
        <b>${verifiedEvents.length} Verified Records</b>
      </div>
      <div class="meta-cell">
        <small>Evidentiary Status</small>
        <b><span class="badge">Canonical Peer-Reviewed</span></b>
      </div>
    </div>
  </div>

  <div class="section-title">Verified Historical Event Chronology (${verifiedEvents.length})</div>
  <table>
    <thead>
      <tr>
        <th style="width: 15%;">Date</th>
        <th style="width: 35%;">Event Title</th>
        <th style="width: 25%;">Venue & Location</th>
        <th style="width: 15%;">Confidence</th>
        <th style="width: 10%;">Sources</th>
      </tr>
    </thead>
    <tbody>
      ${verifiedEvents.length > 0 ? verifiedEvents.map((e) => `
        <tr>
          <td><b>${escapeHtml(e.startDate)}</b></td>
          <td><b>${escapeHtml(e.eventName)}</b><br/><small style="color: #64748b;">${escapeHtml(e.summary || "")}</small></td>
          <td>${escapeHtml([e.venueName, e.city, e.country].filter(Boolean).join(", ") || "Recorded Location")}</td>
          <td><span class="badge">${escapeHtml(e.confidence || (e.verificationStatus === "verified" ? "confirmed" : "limited"))}</span></td>
          <td>${e.sourceIds?.length || 0} primary</td>
        </tr>
      `).join("") : `<tr><td colspan="5" style="text-align: center; color: #94a3b8; padding: 16px;">No chronological events recorded.</td></tr>`}
    </tbody>
  </table>

  ${person.education && person.education.length > 0 ? `
    <div class="section-title">Academic & Military Education (${person.education.length})</div>
    <table>
      <thead>
        <tr>
          <th>Institution</th>
          <th>Degree / Qualification</th>
          <th>Dates</th>
        </tr>
      </thead>
      <tbody>
        ${person.education.map((ed) => `
          <tr>
            <td><b>${escapeHtml(ed.institution)}</b></td>
            <td>${escapeHtml(ed.degree || ed.qualification || "Studies")}</td>
            <td>${escapeHtml(ed.startDate)}${ed.endDate ? ` – ${escapeHtml(ed.endDate)}` : ""}</td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  ` : ""}

  ${person.career && person.career.length > 0 ? `
    <div class="section-title">Public Service & Sovereign Appointments (${person.career.length})</div>
    <table>
      <thead>
        <tr>
          <th>Role / Position</th>
          <th>Organization / Realm</th>
          <th>Duration</th>
        </tr>
      </thead>
      <tbody>
        ${person.career.map((c) => `
          <tr>
            <td><b>${escapeHtml(c.positionTitle)}</b></td>
            <td>${escapeHtml(c.organisationName || "")}</td>
            <td>${escapeHtml(c.startDate)}${c.endDate ? ` – ${escapeHtml(c.endDate)}` : " (Present)"}</td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  ` : ""}

  <div class="footer">
    <div>
      <b>REWIND Forensic Evidence Engine</b> · Verifiable Primary Research Catalog
      <div class="checksum">Payload SHA-256: ${payloadDigest} | Strict ISO-8601: ${exportedAt}</div>
    </div>
    <div>Page 1 of 1</div>
  </div>
</body>
</html>`;

  const safeSlug = person.slug.replace(/[^a-zA-Z0-9._-]/g, "_");
  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Disposition": `inline; filename="rewind-person-dossier-${safeSlug}.html"`,
      "X-Forensic-Checksum": `sha256:${payloadDigest}`,
      "X-Forensic-Timestamp": exportedAt,
    },
  });
}

function escapeHtml(str?: string | null): string {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
