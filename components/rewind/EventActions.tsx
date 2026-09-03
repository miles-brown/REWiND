"use client";

import { useState } from "react";
import { Check, Link as LinkIcon, Quote } from "lucide-react";
import type { EventRecord } from "@/data/rewind";
import { CitationModal } from "./CitationModal";

export function EventActions({ event }: { event: EventRecord }) {
  const [citeOpen, setCiteOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    if (typeof window !== "undefined") {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

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
    </>
  );
}
