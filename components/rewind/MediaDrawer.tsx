"use client";

import { useState } from "react";
import { Check, Copy, MessageSquareQuote, Play, Radio, Volume2, X } from "lucide-react";
import type { EventRecord } from "@/data/rewind";

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
  const [copiedQuote, setCopiedQuote] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  if (!isOpen) return null;

  const quotes = event.quotes || [];
  const currentQuote = quotes[activeQuoteIdx];

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
              <small>{event.medium.join(" · ")} · {event.startDate}</small>
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
          {quotes.length > 0 ? (
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
          ) : (
            <div className="zero-state-compact">
              <MessageSquareQuote size={24} />
              <p>No transcribed quotes cataloged for this specific event.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
