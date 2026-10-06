"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
  const [playbackError, setPlaybackError] = useState<string | null>(null);
  const [prevEventId, setPrevEventId] = useState(event.id);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Reset indices on event change during render
  if (prevEventId !== event.id) {
    setPrevEventId(event.id);
    setActiveQuoteIdx(0);
    setActiveMediaIdx(0);
    setPlaybackError(null);
  }

  const quotes = event.quotes || [];

  // Synthesize archival media items if event has images/audio or default primary records
  const archivalMedia: ArchivalMediaItem[] = useMemo(() => {
    if (event.media && event.media.length > 0) {
      return event.media.map((m) => ({
        kind: m.kind,
        label: m.label,
        url: m.url,
        timestamp: (m as { timestamp?: string }).timestamp,
      }));
    }
    if (event.sourceIds && event.sourceIds.length > 0) {
      return [
        {
          kind: "primary-source",
          url: `/source/${event.sourceIds[0]}`,
          label: `${event.eventName} — Archival Primary Source Record (${event.sourceIds[0]})`,
        },
      ];
    }
    return [];
  }, [event.media, event.sourceIds, event.eventName]);

  const clampedQuoteIdx = quotes.length > 0 ? Math.min(activeQuoteIdx, quotes.length - 1) : 0;
  const currentQuote = quotes[clampedQuoteIdx];

  const clampedMediaIdx = archivalMedia.length > 0 ? Math.min(activeMediaIdx, archivalMedia.length - 1) : 0;
  const currentMedia = archivalMedia[clampedMediaIdx];

  const audioMedia =
    currentMedia && (currentMedia.kind === "audio" || currentMedia.kind.toLowerCase().includes("audio"))
      ? currentMedia
      : archivalMedia.find((m) => m.kind === "audio" || m.kind.toLowerCase().includes("audio"));

  // Keyboard navigation: Escape to close, ArrowLeft/Right to navigate active quote or media reel
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
        } else if (archivalMedia.length > 1) {
          e.preventDefault();
          setActiveMediaIdx((prev) => (prev > 0 ? prev - 1 : archivalMedia.length - 1));
        }
      } else if (e.key === "ArrowRight") {
        if (quotes.length > 1) {
          e.preventDefault();
          setActiveQuoteIdx((prev) => (prev < quotes.length - 1 ? prev + 1 : 0));
        } else if (archivalMedia.length > 1) {
          e.preventDefault();
          setActiveMediaIdx((prev) => (prev < archivalMedia.length - 1 ? prev + 1 : 0));
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, quotes.length, archivalMedia.length]);

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
          {/* Audio / Broadcast Stream Player (only rendered when audio media exists) */}
          {audioMedia && (
            <div className="media-player-card">
              <audio
                ref={audioRef}
                src={audioMedia.url}
                onPlay={() => {
                  setIsPlayingAudio(true);
                  setPlaybackError(null);
                }}
                onPause={() => setIsPlayingAudio(false)}
                onEnded={() => setIsPlayingAudio(false)}
                style={{ display: "none" }}
              />
              <div className="player-waveform-visual">
                <span className={`wave-bar ${isPlayingAudio ? "active" : ""}`} />
                <span className={`wave-bar ${isPlayingAudio ? "active" : ""}`} />
                <span className={`wave-bar ${isPlayingAudio ? "active" : ""}`} />
                <span className={`wave-bar ${isPlayingAudio ? "active" : ""}`} />
                <span className={`wave-bar ${isPlayingAudio ? "active" : ""}`} />
              </div>
              <div className="player-meta">
                <b>{audioMedia.label || `${event.eventName} — Historical Recording`}</b>
                <small>
                  {[audioMedia.timestamp, ...(event.medium || []), event.startDate].filter(Boolean).join(" · ")}
                </small>
                {playbackError && (
                  <div className="player-error" role="alert" style={{ color: "#f87171", fontSize: "12px", marginTop: "4px", display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                    <span>{playbackError}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setPlaybackError(null);
                        if (audioRef.current) {
                          audioRef.current.load();
                          audioRef.current.play().catch((err: unknown) => {
                            setIsPlayingAudio(false);
                            const detail = err instanceof Error && err.message ? `: ${err.message}` : ". The audio stream may be unavailable.";
                            setPlaybackError(`Unable to play archival recording${detail}`);
                          });
                        }
                      }}
                      style={{
                        background: "rgba(248, 113, 113, 0.1)",
                        border: "1px solid rgba(248, 113, 113, 0.3)",
                        color: "#f87171",
                        borderRadius: "4px",
                        padding: "1px 6px",
                        fontSize: "11px",
                        cursor: "pointer",
                      }}
                    >
                      Retry
                    </button>
                  </div>
                )}
              </div>
              <button
                type="button"
                className={`player-toggle-btn ${isPlayingAudio ? "playing" : ""}`}
                onClick={() => {
                  if (audioRef.current) {
                    if (isPlayingAudio) {
                      audioRef.current.pause();
                    } else {
                      setPlaybackError(null);
                      audioRef.current.play().catch((err: unknown) => {
                        setIsPlayingAudio(false);
                        const detail = err instanceof Error && err.message ? `: ${err.message}` : ". The audio stream may be unavailable.";
                        setPlaybackError(`Unable to play archival recording${detail}`);
                      });
                    }
                  }
                }}
                aria-label={isPlayingAudio ? "Pause archival broadcast" : "Listen to archival broadcast"}
              >
                {isPlayingAudio ? <Volume2 size={16} /> : <Play size={16} />}
                <span>{isPlayingAudio ? "Playing..." : "Play Audio"}</span>
              </button>
            </div>
          )}

          {/* Quotes & Speech Records */}
          <div className="quotes-reel-section">
            {quotes.length > 0 ? (
              <>
                <div className="quotes-header">
                  <span className="eyebrow">
                    <MessageSquareQuote size={13} /> VERBATIM SPEECH EXCERPTS ({quotes.length})
                  </span>
                  <div className="quote-pills">
                    {quotes.map((q, idx) => (
                      <button
                        key={idx}
                        type="button"
                        className={`quote-pill ${clampedQuoteIdx === idx ? "active" : ""}`}
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
                        type="button"
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
              </>
            ) : (
              <div className="empty-quotes-copy" role="status" style={{ padding: "12px 16px", color: "#94a3b8", fontSize: "12px" }}>
                No transcribed verbatim quotes are attached to this event record.
              </div>
            )}
          </div>

          {/* Archival Media Carousel */}
          {archivalMedia.length > 0 && (
            <div className="archival-media-section" aria-label="Archival Media Gallery">
              <div className="media-section-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <span className="eyebrow" style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "11px", fontWeight: 800, color: "#38bdf8" }}>
                  <Film size={13} /> ARCHIVAL MEDIA ASSETS ({archivalMedia.length})
                </span>
                {archivalMedia.length > 1 && (
                  <div className="media-nav-controls" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <div className="sr-only" role="status" aria-live="polite">
                      Asset {clampedMediaIdx + 1} of {archivalMedia.length}
                    </div>
                    <button
                      type="button"
                      className="media-nav-btn"
                      onClick={() => setActiveMediaIdx((prev) => (prev > 0 ? prev - 1 : archivalMedia.length - 1))}
                      aria-label="Previous archival asset"
                    >
                      <ChevronLeft size={14} />
                    </button>
                    <button
                      type="button"
                      className="media-nav-btn"
                      onClick={() => setActiveMediaIdx((prev) => (prev < archivalMedia.length - 1 ? prev + 1 : 0))}
                      aria-label="Next archival asset"
                    >
                      <ChevronRight size={14} />
                    </button>
                  </div>
                )}
              </div>

              {currentMedia && (
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
                      {currentMedia.kind || "Archival Asset"}
                    </span>
                    {currentMedia.timestamp && (
                      <span style={{ fontSize: "11px", color: "#94a3b8" }}>
                        {currentMedia.timestamp}
                      </span>
                    )}
                  </div>
                  <p style={{ margin: "0 0 10px", fontSize: "13px", color: "#f1f5f9", lineHeight: 1.45 }}>
                    {currentMedia.label}
                  </p>
                  {currentMedia.url && (
                    <a
                      href={currentMedia.url}
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
