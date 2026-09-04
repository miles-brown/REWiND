"use client";

import { useState } from "react";
import { Check, Copy, Download, FileText, X } from "lucide-react";
import type { EventRecord, SourceRecord } from "@/lib/rewind";
import { formatAPA, formatBibTeX, formatChicago, formatJSON } from "@/lib/citations";

type Format = "bibtex" | "apa" | "chicago" | "json";

export function CitationModal({
  event,
  source: explicitSource,
  isOpen = true,
  onClose,
}: {
  event: EventRecord;
  source?: SourceRecord;
  isOpen?: boolean;
  onClose: () => void;
}) {
  const [format, setFormat] = useState<Format>("bibtex");
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const isFallback = !explicitSource && !event.sources?.[0];
  if (isFallback) {
    console.warn(
      `[CitationModal] Forensic warning: Event "${event.id}" (${event.eventName}) has no resolved source records.`
    );
  }

  const source: SourceRecord | undefined = explicitSource || event.sources?.[0];

  let text = "";
  if (source) {
    if (format === "bibtex") text = formatBibTeX(event, source);
    else if (format === "apa") text = formatAPA(event, source);
    else if (format === "chicago") text = formatChicago(event, source);
    else if (format === "json") text = formatJSON(event, source);
  }

  const handleCopy = async () => {
    if (!source || !text) return;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!source || !text) return;
    const ext = format === "json" ? "json" : format === "bibtex" ? "bib" : "txt";
    const mime = format === "json" ? "application/json" : "text/plain";
    const blob = new Blob([text], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${event.id}-citation.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="citation-modal-overlay" role="dialog" aria-modal="true" aria-label={`Cite ${event.eventName}`}>
      <div className="citation-modal-backdrop" onClick={onClose} />
      <div className="citation-modal-container">
        <header className="citation-modal-header">
          <div className="citation-modal-title">
            <FileText size={18} />
            <b>Cite Event Record</b>
          </div>
          <button className="citation-modal-close" onClick={onClose} aria-label="Close citation modal">
            <X size={18} />
          </button>
        </header>
        <div className="citation-modal-tabs">
          {(["bibtex", "apa", "chicago", "json"] as const).map((fmt) => (
            <button
              key={fmt}
              className={`citation-tab ${format === fmt ? "active" : ""}`}
              onClick={() => setFormat(fmt)}
            >
              {fmt.toUpperCase()}
            </button>
          ))}
        </div>
        <div className="citation-preview-wrapper">
          {source ? (
            <pre className="citation-preview"><code>{text}</code></pre>
          ) : (
            <div className="citation-unavailable" style={{ padding: "2.5rem 1.5rem", textAlign: "center", color: "#94a3b8" }}>
              <p style={{ margin: 0, fontWeight: 600, color: "#cbd5e1" }}>Primary archival source record pending verification.</p>
              <small style={{ display: "block", marginTop: "0.5rem", opacity: 0.8 }}>
                Citation export is disabled until an authenticated primary documentary source is attached.
              </small>
            </div>
          )}
        </div>
        <footer className="citation-modal-footer">
          <button className="citation-action-btn" onClick={handleDownload} disabled={!source || !text}>
            <Download size={15} />
            <span>Download</span>
          </button>
          <button className="citation-action-btn primary" onClick={handleCopy} disabled={!source || !text}>
            {copied ? <Check size={15} /> : <Copy size={15} />}
            <span>{copied ? "Copied!" : "Copy to Clipboard"}</span>
          </button>
        </footer>
      </div>
    </div>
  );
}
