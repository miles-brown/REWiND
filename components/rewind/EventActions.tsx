"use client";

import { useState } from "react";
import { Check, Link as LinkIcon, MessageSquareQuote, Quote, ShieldAlert } from "lucide-react";
import type { EventRecord } from "@/data/rewind";
import { CitationModal } from "./CitationModal";
import { MediaDrawer } from "./MediaDrawer";
import { DiscrepancyViewer } from "./DiscrepancyViewer";

export function EventActions({ event }: { event: EventRecord }) {
  const [citeOpen, setCiteOpen] = useState(false);
  const [mediaOpen, setMediaOpen] = useState(false);
  const [auditOpen, setAuditOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    if (typeof window !== "undefined") {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const hasQuotes = event.quotes && event.quotes.length > 0;

  return (
    <>
      <div className="event-action-buttons">
        <button
          className="event-action-btn"
          onClick={() => setCiteOpen(true)}
          aria-label="Generate citation for this event"
        >
          <Quote size={14} />
          <span>Cite Event</span>
        </button>

        {hasQuotes && (
          <button
            className="event-action-btn highlight"
            onClick={() => setMediaOpen(true)}
            aria-label="Open speech excerpts and audio"
          >
            <MessageSquareQuote size={14} />
            <span>Quotes & Audio ({event.quotes.length})</span>
          </button>
        )}

        <button
          className="event-action-btn"
          onClick={() => setAuditOpen(true)}
          aria-label="View forensic audit and provenance trail"
        >
          <ShieldAlert size={14} />
          <span>Forensic Audit</span>
        </button>

        <button
          className="event-action-btn"
          onClick={handleCopyLink}
          aria-label="Copy permalink to clipboard"
        >
          {copied ? <Check size={14} /> : <LinkIcon size={14} />}
          <span>{copied ? "Link Copied" : "Copy Link"}</span>
        </button>
      </div>

      <CitationModal
        event={event}
        isOpen={citeOpen}
        onClose={() => setCiteOpen(false)}
      />

      <MediaDrawer
        event={event}
        isOpen={mediaOpen}
        onClose={() => setMediaOpen(false)}
      />

      <DiscrepancyViewer
        event={event}
        isOpen={auditOpen}
        onClose={() => setAuditOpen(false)}
      />
    </>
  );
}
