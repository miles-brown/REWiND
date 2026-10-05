import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { getEventBySlug } from "@/lib/rewind";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const { data: event, error: eventError } = await getEventBySlug(slug);

  if (eventError || !event) {
    return NextResponse.json(
      { error: "Event record not found or inaccessible for export." },
      { status: 404 }
    );
  }

  // Compute deterministic SHA-256 forensic checksum of event record payload
  const payloadDigest = createHash("sha256")
    .update(JSON.stringify({ event }))
    .digest("hex");

  const exportedAt = new Date().toISOString();
  const location = [event.venueName, event.city, event.country].filter(Boolean).join(", ") || "Recorded Location";

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>REWIND Event Attestation — ${escapeHtml(event.eventName)}</title>
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
    .hero h1 { font-size: 24px; margin: 0 0 8px 0; color: #0f172a; }
    .hero-summary { font-size: 14px; color: #334155; line-height: 1.5; margin-bottom: 16px; }
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
      <div class="brand-sub">Forensic Historical Event Attestation</div>
    </div>
    <div class="doc-meta">
      <div><b>Exported:</b> ${exportedAt.slice(0, 19).replace("T", " ")} UTC</div>
      <div><b>Event ID:</b> ${escapeHtml(event.id)}</div>
      <div><b>Canonical Slug:</b> ${escapeHtml(event.slug)}</div>
    </div>
  </div>

  <div class="hero">
    <h1>${escapeHtml(event.eventName)}</h1>
    <div class="hero-summary">${escapeHtml(event.summary || event.description || "Primary event record.")}</div>
    <div class="meta-grid">
      <div class="meta-cell">
        <small>Start Date</small>
        <b>${escapeHtml(event.startDate)}</b>
      </div>
      <div class="meta-cell">
        <small>Location</small>
        <b>${escapeHtml(location)}</b>
      </div>
      <div class="meta-cell">
        <small>Confidence Tier</small>
        <b><span class="badge">${escapeHtml(event.confidence || "limited")}</span></b>
      </div>
      <div class="meta-cell">
        <small>Primary Sources</small>
        <b>${event.sourceIds?.length || 0} Records</b>
      </div>
    </div>
  </div>

  <div class="section-title">Verified Participants (${event.participants?.length || 0})</div>
  <table>
    <thead>
      <tr>
        <th>Participant Name</th>
        <th>Capacity / Role</th>
        <th>Presence Mode</th>
        <th>Confidence</th>
      </tr>
    </thead>
    <tbody>
      ${(event.participants || []).map((p) => `
        <tr>
          <td><b>${escapeHtml(p.name)}</b></td>
          <td>${escapeHtml(p.capacityTitle || p.role || "Participant")}</td>
          <td>${escapeHtml(p.attendanceMode || "physical")}</td>
          <td><span class="badge">${escapeHtml(p.presenceConfidence || "confirmed")}</span></td>
        </tr>
      `).join("")}
    </tbody>
  </table>

  ${event.claims && event.claims.length > 0 ? `
    <div class="section-title">Evidentiary Claims & Assertions (${event.claims.length})</div>
    <table>
      <thead>
        <tr>
          <th style="width: 20%;">Claim Type</th>
          <th style="width: 50%;">Statement / Assertion</th>
          <th style="width: 15%;">Epistemic Class</th>
          <th style="width: 15%;">Status</th>
        </tr>
      </thead>
      <tbody>
        ${event.claims.map((c) => `
          <tr>
            <td><b>${escapeHtml(c.claimType)}</b></td>
            <td>${escapeHtml(c.statement)}</td>
            <td><small>${escapeHtml(c.epistemicClass)}</small></td>
            <td><span class="badge">${escapeHtml(c.claimStatus)}</span></td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  ` : ""}

  <div class="footer">
    <div>
      <b>REWIND Forensic Evidence Engine</b> · Verifiable Primary Research Catalog
      <div class="checksum">Payload SHA-256: ${payloadDigest}</div>
    </div>
    <div>Page 1 of 1</div>
  </div>
</body>
</html>`;

  const safeSlug = event.slug.replace(/[^a-zA-Z0-9._-]/g, "_");
  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Disposition": `inline; filename="rewind-event-attestation-${safeSlug}.html"`,
      "X-Forensic-Checksum": `sha256:${payloadDigest}`,
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
