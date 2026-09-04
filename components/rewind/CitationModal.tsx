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
      `[CitationModal] Forensic warning: Event "${event.id}" (${event.eventName}) has no resolved source records. Falling back to synthetic archival citation.`
    );
  }

  const source: SourceRecord =
    explicitSource ||
    event.sources?.[0] || {
      id: event.sourceIds?.[0] || "src-primary",
      title: event.eventName,
      publisher: "REWIND Archival Register",
      sourceType: "archival-document",
      classification: "primary",
    };

  let text = "";
  if (format === "bibtex") text = formatBibTeX(event, source);
  else if (format === "apa") text = formatAPA(event, source);
  else if (format === "chicago") text = formatChicago(event, source);
  else if (format === "json") text = formatJSON(event, source);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
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
          <pre className="citation-preview"><code>{text}</code></pre>
        </div>
        <footer className="citation-modal-footer">
          <button className="citation-action-btn" onClick={handleDownload}>
            <Download size={15} />
            <span>Download</span>
          </button>
          <button className="citation-action-btn primary" onClick={handleCopy}>
            {copied ? <Check size={15} /> : <Copy size={15} />}
            <span>{copied ? "Copied!" : "Copy to Clipboard"}</span>
          </button>
        </footer>
      </div>
    </div>
  );
}
