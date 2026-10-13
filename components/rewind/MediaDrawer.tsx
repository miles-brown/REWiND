"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Camera,
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
import { EmbeddedVideoPlayer } from "./EmbeddedVideoPlayer";

interface ArchivalMediaItem {
  kind: string;
  label: string;
  url: string;
  timestamp?: string;
  embedUrl?: string | null;
  thumbnailUrl?: string | null;
  platform?: string | null;
  caption?: string | null;
  durationSeconds?: number | null;
}

export function MediaDrawer({
  event,
  isOpen,
  onClose,
  initialMode,
}: {
  event: EventRecord;
  isOpen: boolean;
  onClose: () => void;
  initialMode?: "video" | "quotes" | "audio";
}) {
  const [activeQuoteIdx, setActiveQuoteIdx] = useState(0);
  const [activeMediaIdx, setActiveMediaIdx] = useState(0);
  const [activeVideoIdx, setActiveVideoIdx] = useState(0);
  const [copiedQuote, setCopiedQuote] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [playbackError, setPlaybackError] = useState<string | null>(null);
  const [prevEventId, setPrevEventId] = useState(event.id);
  const [prevInitialMode, setPrevInitialMode] = useState(initialMode);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const formatAudioPlaybackError = (err: unknown): string => {
    if (err instanceof Error && err.message?.trim()) {
      return `Unable to play archival recording: ${err.message.trim()}`;
    }
    return "Unable to play archival recording. The audio stream may be unavailable.";
  };

  const quotes = event.quotes || [];

  // Synthesize archival media items if event has images/audio or default primary records
  const archivalMedia: ArchivalMediaItem[] = useMemo(() => {
    if (event.media && event.media.length > 0) {
      return event.media.map((m) => ({
        kind: m.kind,
        label: m.label,
        url: m.url,
        timestamp: m.timestamp ?? undefined,
        embedUrl: (m as { embedUrl?: string }).embedUrl ?? null,
        thumbnailUrl: (m as { thumbnailUrl?: string }).thumbnailUrl ?? null,
        platform: (m as { platform?: string }).platform ?? null,
        caption: (m as { caption?: string }).caption ?? null,
        durationSeconds: (m as { durationSeconds?: number }).durationSeconds ?? null,
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

  // Separate media assets into videos and audio
  const videoMedia = useMemo(() => {
    return archivalMedia.filter(
      (m) => m.kind === "video" || m.kind.toLowerCase().includes("video") || Boolean(m.embedUrl)
    );
  }, [archivalMedia]);

  const audioMedia =
    archivalMedia.find((m) => m.kind === "audio" || m.kind.toLowerCase().includes("audio")) || null;

  // Determine available vault modes
  const hasVideos = videoMedia.length > 0;
  const hasQuotes = quotes.length > 0;
  const hasAudio = audioMedia !== null;

  // Default mode selection
  const defaultMode = useMemo(() => {
    if (initialMode === "video" && hasVideos) return "video";
    if (initialMode === "quotes" && hasQuotes) return "quotes";
    if (initialMode === "audio" && hasAudio) return "audio";
    if (hasVideos) return "video";
    if (hasQuotes) return "quotes";
    if (hasAudio) return "audio";
    return "video";
  }, [initialMode, hasVideos, hasQuotes, hasAudio]);

  const [activeVaultMode, setActiveVaultMode] = useState<"video" | "quotes" | "audio">(defaultMode);

  // Reset indices and synchronize vault mode on event or initialMode change
  if (prevEventId !== event.id || prevInitialMode !== initialMode) {
    setPrevEventId(event.id);
    setPrevInitialMode(initialMode);
    setActiveQuoteIdx(0);
    setActiveMediaIdx(0);
    setActiveVideoIdx(0);
    setActiveVaultMode(defaultMode);
    setPlaybackError(null);
  }

  const clampedQuoteIdx = quotes.length > 0 ? Math.min(activeQuoteIdx, quotes.length - 1) : 0;
  const currentQuote = quotes[clampedQuoteIdx];

  const clampedVideoIdx = videoMedia.length > 0 ? Math.min(activeVideoIdx, videoMedia.length - 1) : 0;
  const currentVideo = videoMedia[clampedVideoIdx];

  const clampedMediaIdx = archivalMedia.length > 0 ? Math.min(activeMediaIdx, archivalMedia.length - 1) : 0;
  const currentMedia = archivalMedia[clampedMediaIdx];

  // Keyboard navigation: Escape to close, ArrowLeft/Right to navigate active quote or video perspective
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowLeft") {
        if (activeVaultMode === "video" && videoMedia.length > 1) {
          e.preventDefault();
          setActiveVideoIdx((prev) => (prev > 0 ? prev - 1 : videoMedia.length - 1));
        } else if (activeVaultMode === "quotes" && quotes.length > 1) {
          e.preventDefault();
          setActiveQuoteIdx((prev) => (prev > 0 ? prev - 1 : quotes.length - 1));
        } else if (archivalMedia.length > 1) {
          e.preventDefault();
          setActiveMediaIdx((prev) => (prev > 0 ? prev - 1 : archivalMedia.length - 1));
        }
      } else if (e.key === "ArrowRight") {
        if (activeVaultMode === "video" && videoMedia.length > 1) {
          e.preventDefault();
          setActiveVideoIdx((prev) => (prev < videoMedia.length - 1 ? prev + 1 : 0));
        } else if (activeVaultMode === "quotes" && quotes.length > 1) {
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
  }, [isOpen, onClose, activeVaultMode, videoMedia.length, quotes.length, archivalMedia.length]);

  if (!isOpen) return null;

  const handleCopyQuote = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedQuote(true);
    setTimeout(() => setCopiedQuote(false), 2000);
  };

  const availableModesCount = (hasVideos ? 1 : 0) + (hasQuotes ? 1 : 0) + (hasAudio ? 1 : 0);

  return (
    <div className="media-drawer-overlay" role="dialog" aria-modal="true" aria-label="Archival Speech & Media Vault">
      <div className="media-drawer-backdrop" onClick={onClose} />
      <div className="media-drawer-container">
        <header className="media-drawer-header">
          <div className="drawer-title">
            {activeVaultMode === "video" ? (
              <Film size={18} className="live-icon video-theme" />
            ) : activeVaultMode === "quotes" ? (
              <MessageSquareQuote size={18} className="live-icon quote-theme" />
            ) : (
              <Radio size={18} className="live-icon audio-theme" />
            )}
            <div>
              <b>
                {activeVaultMode === "video"
                  ? "Archival Video & Footage Vault"
                  : activeVaultMode === "quotes"
                  ? "Verbatim Speech & Quote Vault"
                  : "Archival Audio & Quote Vault"}
              </b>
              <small>
                {event.eventName} · {event.startDate}
              </small>
            </div>
          </div>
          <button className="drawer-close-btn" onClick={onClose} aria-label="Close media drawer">
            <X size={18} />
          </button>
        </header>

        {/* Evidence Category Segmented Tabs (Rendered if multiple categories exist) */}
        {availableModesCount > 1 && (
          <div className="vault-mode-tabs" role="tablist" aria-label="Evidence media categories">
            {hasVideos && (
              <button
                type="button"
                role="tab"
                aria-selected={activeVaultMode === "video"}
                className={`vault-tab-btn video-mode ${activeVaultMode === "video" ? "active" : ""}`}
                onClick={() => setActiveVaultMode("video")}
              >
                <Film size={13} />
                <span>Video Footage</span>
                <span className="vault-count-pill">{videoMedia.length}</span>
              </button>
            )}
            {hasQuotes && (
              <button
                type="button"
                role="tab"
                aria-selected={activeVaultMode === "quotes"}
                className={`vault-tab-btn quote-mode ${activeVaultMode === "quotes" ? "active" : ""}`}
                onClick={() => setActiveVaultMode("quotes")}
              >
                <MessageSquareQuote size={13} />
                <span>Verbatim Quotes</span>
                <span className="vault-count-pill">{quotes.length}</span>
              </button>
            )}
            {hasAudio && (
              <button
                type="button"
                role="tab"
                aria-selected={activeVaultMode === "audio"}
                className={`vault-tab-btn audio-mode ${activeVaultMode === "audio" ? "active" : ""}`}
                onClick={() => setActiveVaultMode("audio")}
              >
                <Volume2 size={13} />
                <span>Audio Stream</span>
              </button>
            )}
          </div>
        )}

        <div className="media-drawer-body">
          {/* Mode 1: Video Footage Vault */}
          {activeVaultMode === "video" && (
            <div className="archival-video-vault-section" role="tabpanel" aria-label="Video Footage Vault">
              {/* Camera Perspective / Multi-Angle Selector Strip */}
              {videoMedia.length > 1 && (
                <div className="camera-perspective-strip" role="region" aria-label="Footage Perspectives">
                  <div className="perspective-strip-header">
                    <span className="eyebrow-chip">
                      <Camera size={12} /> CAMERA ANGLES & PERSPECTIVES ({videoMedia.length})
                    </span>
                    <small className="perspective-hint">
                      Angle {clampedVideoIdx + 1} of {videoMedia.length}
                    </small>
                  </div>
                  <div className="perspective-pills-row" role="tablist">
                    {videoMedia.map((vm, idx) => {
                      const isSelected = clampedVideoIdx === idx;
                      return (
                        <button
                          key={idx}
                          type="button"
                          role="tab"
                          aria-selected={isSelected}
                          className={`perspective-pill ${isSelected ? "active" : ""}`}
                          onClick={() => setActiveVideoIdx(idx)}
                        >
                          <span className="angle-badge">Angle {idx + 1}</span>
                          <div className="angle-info">
                            <span className="angle-label">{vm.label}</span>
                            <span className="angle-platform">{vm.platform || "Broadcast"}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Active Video Player */}
              {currentVideo ? (
                <div className="active-video-stage">
                  <EmbeddedVideoPlayer media={currentVideo} title={currentVideo.label} />
                  <div className="video-card-meta-bar">
                    <div className="meta-left">
                      <span className="meta-badge-kind">{currentVideo.kind || "video"}</span>
                      {currentVideo.timestamp && (
                        <span className="meta-timestamp">{currentVideo.timestamp}</span>
                      )}
                    </div>
                    {currentVideo.url && (
                      <a
                        href={currentVideo.url}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="meta-primary-link"
                      >
                        <span>Open Verified Source</span>
                        <ExternalLink size={12} />
                      </a>
                    )}
                  </div>
                </div>
              ) : (
                <div className="empty-vault-notice" role="status">
                  No video recordings are attached to this event.
                </div>
              )}
            </div>
          )}

          {/* Mode 2: Audio Stream Player */}
          {activeVaultMode === "audio" && audioMedia && (
            <div className="media-player-card" role="tabpanel" aria-label="Audio Stream Player">
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
                            setPlaybackError(formatAudioPlaybackError(err));
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
                        setPlaybackError(formatAudioPlaybackError(err));
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

          {/* Mode 3: Quotes & Speech Records */}
          {activeVaultMode === "quotes" && (
            <div className="quotes-reel-section" role="tabpanel" aria-label="Verbatim Speech Quotes">
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
          )}

          {/* Fallback All Media Carousel if event has only generic archival media */}
          {!hasVideos && !hasQuotes && !hasAudio && archivalMedia.length > 0 && (
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

                  {/* Embedded Video Player if current asset is video or embed */}
                  {(currentMedia.kind === "video" || currentMedia.embedUrl || currentMedia.kind.includes("video")) && currentMedia.url && (
                    <EmbeddedVideoPlayer media={currentMedia} title={currentMedia.label} />
                  )}

                  {currentMedia.url && (
                    <a
                      href={currentMedia.url}
                      target="_blank"
                      rel="noreferrer"
                      style={{ display: "inline-flex", alignItems: "center", gap: "5px", fontSize: "12px", color: "#38bdf8", textDecoration: "none", marginTop: "8px" }}
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
