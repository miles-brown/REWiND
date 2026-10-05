"use client";

import { useEffect, useState } from "react";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  ExternalLink,
  Film,
  MessageSquareQuote,
  Play,
  Radio,
  Volume2,
  X,
} from "lucide-react";
import type { EventRecord } from "@/lib/rewind";

interface ArchivalMediaItem {
  kind: string;
  label: string;
  url: string;
  timestamp?: string;
}

export function MediaDrawer({
  event,
  isOpen,
  onClose,
}: {
  event: EventRecord;
  isOpen: boolean;
  onClose: () => void;
}) {
  const [activeQuoteIdx, setActiveQuoteIdx] = useState(0);
  const [activeMediaIdx, setActiveMediaIdx] = useState(0);
  const [copiedQuote, setCopiedQuote] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const quotes = event.quotes || [];
  const currentQuote = quotes[activeQuoteIdx];

  // Synthesize archival media items if event has images/audio or default primary records
  const archivalMedia: ArchivalMediaItem[] = (event.media && event.media.length > 0)
    ? event.media.map((m) => ({ kind: m.kind, label: m.label, url: m.url, timestamp: event.startDate }))
    : [
        {
          kind: "broadcast-video",
          url: event.sourceIds[0] ? `/source/${event.sourceIds[0]}` : "https://archive.org",
          label: `${event.eventName} — Archival Primary Broadcast Recording`,
          timestamp: event.startDate,
        },
      ];

  // Keyboard navigation: Escape to close, ArrowLeft/Right to navigate active reel
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowLeft") {
        if (quotes.length > 1) {
          e.preventDefault();
          setActiveQuoteIdx((prev) => (prev > 0 ? prev - 1 : quotes.length - 1));
        }
      } else if (e.key === "ArrowRight") {
        if (quotes.length > 1) {
          e.preventDefault();
          setActiveQuoteIdx((prev) => (prev < quotes.length - 1 ? prev + 1 : 0));
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, quotes.length]);

  if (!isOpen) return null;

  const handleCopyQuote = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedQuote(true);
    setTimeout(() => setCopiedQuote(false), 2000);
  };

  return (
    <div className="media-drawer-overlay" role="dialog" aria-modal="true" aria-label="Archival Speech & Media Vault">
      <div className="media-drawer-backdrop" onClick={onClose} />
      <div className="media-drawer-container">
        <header className="media-drawer-header">
          <div className="drawer-title">
            <Radio size={18} className="live-icon" />
            <div>
              <b>Archival Audio & Quote Vault</b>
              <small>{event.eventName}</small>
            </div>
          </div>
          <button className="drawer-close-btn" onClick={onClose} aria-label="Close media drawer">
            <X size={18} />
          </button>
        </header>

        <div className="media-drawer-body">
          {/* Audio / Broadcast Stream Mock Player */}
          <div className="media-player-card">
            <div className="player-waveform-visual">
              <span className={`wave-bar ${isPlayingAudio ? "active" : ""}`} />
              <span className={`wave-bar ${isPlayingAudio ? "active" : ""}`} />
              <span className={`wave-bar ${isPlayingAudio ? "active" : ""}`} />
              <span className={`wave-bar ${isPlayingAudio ? "active" : ""}`} />
              <span className={`wave-bar ${isPlayingAudio ? "active" : ""}`} />
            </div>
            <div className="player-meta">
              <b>{event.eventName} — Historical Recording</b>
              <small>
                {[...(event.medium || []), event.startDate].filter(Boolean).join(" · ")}
              </small>
            </div>
            <button
              className={`player-toggle-btn ${isPlayingAudio ? "playing" : ""}`}
              onClick={() => setIsPlayingAudio(!isPlayingAudio)}
              aria-label={isPlayingAudio ? "Pause archival broadcast" : "Listen to archival broadcast"}
            >
              {isPlayingAudio ? <Volume2 size={16} /> : <Play size={16} />}
              <span>{isPlayingAudio ? "Broadcasting..." : "Preview Audio"}</span>
            </button>
          </div>

          {/* Quotes & Speech Records */}
          {quotes.length > 0 && (
            <div className="quotes-reel-section">
              <div className="quotes-header">
                <span className="eyebrow">
                  <MessageSquareQuote size={13} /> VERBATIM SPEECH EXCERPTS ({quotes.length})
                </span>
                <div className="quote-pills">
                  {quotes.map((q, idx) => (
                    <button
                      key={idx}
                      className={`quote-pill ${activeQuoteIdx === idx ? "active" : ""}`}
                      onClick={() => setActiveQuoteIdx(idx)}
                    >
                      Quote {idx + 1}
                    </button>
                  ))}
                </div>
              </div>

              {currentQuote && (
                <div className="active-quote-box">
                  <blockquote>“{currentQuote.text}”</blockquote>
                  <div className="quote-footer">
                    <div className="speaker-info">
                      <span className="speaker-avatar">{currentQuote.speaker[0]}</span>
                      <div>
                        <b>{currentQuote.speaker}</b>
                        <small>Language: {currentQuote.language.toUpperCase()}{currentQuote.timestamp ? ` · ${currentQuote.timestamp}` : ""}</small>
                      </div>
                    </div>
                    <button
                      className="copy-quote-btn"
                      onClick={() => handleCopyQuote(currentQuote.text)}
                      aria-label="Copy quote text"
                    >
                      {copiedQuote ? <Check size={14} /> : <Copy size={14} />}
                      <span>{copiedQuote ? "Copied" : "Copy Quote"}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Archival Media Carousel */}
          {archivalMedia.length > 0 && (
            <div className="archival-media-section" aria-label="Archival Media Gallery">
              <div className="media-section-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <span className="eyebrow" style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "11px", fontWeight: 800, color: "#38bdf8" }}>
                  <Film size={13} /> ARCHIVAL MEDIA ASSETS ({archivalMedia.length})
                </span>
                {archivalMedia.length > 1 && (
                  <div className="media-nav-controls" style={{ display: "flex", gap: "6px" }}>
                    <button
                      className="media-nav-btn"
                      onClick={() => setActiveMediaIdx((prev) => (prev > 0 ? prev - 1 : archivalMedia.length - 1))}
                      aria-label="Previous archival asset"
                      style={{ background: "rgba(255, 255, 255, 0.08)", border: "none", color: "#f8fafc", padding: "4px 8px", borderRadius: "4px", cursor: "pointer" }}
                    >
                      <ChevronLeft size={14} />
                    </button>
                    <button
                      className="media-nav-btn"
                      onClick={() => setActiveMediaIdx((prev) => (prev < archivalMedia.length - 1 ? prev + 1 : 0))}
                      aria-label="Next archival asset"
                      style={{ background: "rgba(255, 255, 255, 0.08)", border: "none", color: "#f8fafc", padding: "4px 8px", borderRadius: "4px", cursor: "pointer" }}
                    >
                      <ChevronRight size={14} />
                    </button>
                  </div>
                )}
              </div>

              {archivalMedia[activeMediaIdx] && (
                <div
                  className="archival-media-card"
                  style={{
                    padding: "14px 16px",
                    background: "rgba(0, 0, 0, 0.35)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    borderRadius: "8px",
                    marginBottom: "16px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                    <span className="media-type-badge" style={{ fontSize: "10px", fontWeight: 800, padding: "2px 6px", borderRadius: "4px", background: "rgba(56, 189, 248, 0.15)", color: "#38bdf8", textTransform: "uppercase" }}>
                      {archivalMedia[activeMediaIdx].kind || "Archival Asset"}
                    </span>
                    {archivalMedia[activeMediaIdx].timestamp && (
                      <span style={{ fontSize: "11px", color: "#94a3b8" }}>
                        {archivalMedia[activeMediaIdx].timestamp}
                      </span>
                    )}
                  </div>
                  <p style={{ margin: "0 0 10px", fontSize: "13px", color: "#f1f5f9", lineHeight: 1.45 }}>
                    {archivalMedia[activeMediaIdx].label}
                  </p>
                  {archivalMedia[activeMediaIdx].url && (
                    <a
                      href={archivalMedia[activeMediaIdx].url}
                      target="_blank"
                      rel="noreferrer"
                      style={{ display: "inline-flex", alignItems: "center", gap: "5px", fontSize: "12px", color: "#38bdf8", textDecoration: "none" }}
                    >
                      <span>Open primary archival asset</span>
                      <ExternalLink size={12} />
                    </a>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
