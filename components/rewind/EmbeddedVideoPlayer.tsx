"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import { ExternalLink, Film, AlertCircle, Maximize2, Minimize2, Gauge, Play } from "lucide-react";

export interface VideoMediaItem {
  url: string;
  embedUrl?: string | null;
  label?: string;
  thumbnailUrl?: string | null;
  platform?: string | null;
  caption?: string | null;
  durationSeconds?: number | null;
}

const PLAYBACK_SPEEDS = [0.5, 0.75, 1.0, 1.25, 1.5] as const;

export function EmbeddedVideoPlayer({
  media,
  title,
}: {
  media: VideoMediaItem;
  title?: string;
}) {
  const [loadError, setLoadError] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const currentMediaKey = media.embedUrl || media.url || "";
  const [prevMediaKey, setPrevMediaKey] = useState(currentMediaKey);

  // Automatically reset error state and playback speed when selected media changes
  if (prevMediaKey !== currentMediaKey) {
    setPrevMediaKey(currentMediaKey);
    setLoadError(false);
    setPlaybackSpeed(1.0);
  }

  // Synchronize playbackRate on native video element
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed, currentMediaKey]);

  // Handle speed change for HTML5 video
  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  // Normalize embed link
  const embedData = useMemo(() => {
    const rawUrl = media.embedUrl || media.url || "";

    // YouTube: standard watch, embed, shorts, youtu.be
    const ytMatch = rawUrl.match(
      /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
    );
    if (ytMatch && ytMatch[1]) {
      return {
        type: "youtube" as const,
        platformLabel: "YouTube Stream",
        src: `https://www.youtube-nocookie.com/embed/${ytMatch[1]}?rel=0&modestbranding=1`,
      };
    }

    // Direct MP4 / WebM / OGG video stream
    if (/\.(mp4|webm|ogg)($|\?)/i.test(rawUrl)) {
      return {
        type: "html5" as const,
        platformLabel: "Direct Video Stream",
        src: rawUrl,
      };
    }

    // Rumble embed
    const rumbleMatch = rawUrl.match(/rumble\.com\/embed\/([a-zA-Z0-9_-]+)/);
    if (rumbleMatch && rumbleMatch[1]) {
      return {
        type: "iframe" as const,
        platformLabel: "Rumble Broadcast",
        src: `https://rumble.com/embed/${rumbleMatch[1]}`,
      };
    }

    // Explicit iframe embed URL
    if (rawUrl.includes("/embed/")) {
      return {
        type: "iframe" as const,
        platformLabel: "Archival Embed",
        src: rawUrl,
      };
    }

    // Social or platform dispatches (e.g. X, Instagram, TikTok)
    const isX = rawUrl.includes("x.com") || rawUrl.includes("twitter.com");
    const isInsta = rawUrl.includes("instagram.com");
    const platformLabel = isX
      ? "Verified X Dispatch"
      : isInsta
      ? "Instagram Video Dispatch"
      : media.platform || "Primary Video Dispatch";

    return {
      type: "external" as const,
      platformLabel,
      src: rawUrl,
    };
  }, [media.embedUrl, media.url, media.platform]);

  return (
    <div
      className={`embedded-video-card ${isTheaterMode ? "theater-mode" : ""}`}
      role="region"
      aria-label={`Archival video: ${title || media.label || "footage"}`}
    >
      {/* Forensic Player Top Bar */}
      <div className="video-player-hud-bar">
        <div className="player-hud-left">
          <span className="player-platform-badge">
            <Film size={11} />
            <span>{media.platform || embedData.platformLabel}</span>
          </span>
          {media.durationSeconds ? (
            <span className="player-duration-chip">
              {Math.floor(media.durationSeconds / 60)}:
              {String(media.durationSeconds % 60).padStart(2, "0")}
            </span>
          ) : null}
        </div>
        <div className="player-hud-actions">
          {embedData.type === "html5" && (
            <div className="speed-selector-group" role="group" aria-label="Playback speed">
              <span className="speed-icon-label" title="Inspection Speed">
                <Gauge size={12} />
              </span>
              {PLAYBACK_SPEEDS.map((s) => (
                <button
                  key={s}
                  type="button"
                  className={`speed-pill ${playbackSpeed === s ? "active" : ""}`}
                  onClick={() => handleSpeedChange(s)}
                  aria-pressed={playbackSpeed === s}
                  aria-label={`${s}x playback speed`}
                >
                  {s}x
                </button>
              ))}
            </div>
          )}
          <button
            type="button"
            className="theater-toggle-btn"
            onClick={() => setIsTheaterMode((prev) => !prev)}
            aria-label={isTheaterMode ? "Exit theater mode" : "Enter theater mode"}
            title={isTheaterMode ? "Standard View" : "Theater View"}
          >
            {isTheaterMode ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
          </button>
        </div>
      </div>

      <div className="video-player-frame">
        {embedData.type === "youtube" || embedData.type === "iframe" ? (
          <iframe
            src={embedData.src}
            title={title || media.label || "Archival video player"}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="video-iframe"
            onError={() => setLoadError(true)}
          />
        ) : embedData.type === "html5" ? (
          <video
            ref={videoRef}
            src={embedData.src}
            poster={media.thumbnailUrl || undefined}
            controls
            playsInline
            preload="metadata"
            className="video-html5-element"
            onError={() => setLoadError(true)}
          >
            Your browser does not support the video tag.
          </video>
        ) : (
          <div className="video-fallback-card">
            <div className="fallback-pulse-ring">
              <Play size={24} className="fallback-play-icon" />
            </div>
            <p className="fallback-title">{media.label || "Archival Video Dispatch"}</p>
            <p className="fallback-desc">
              Primary social video stream on <b>{embedData.platformLabel}</b>. Direct embed restricted by publisher CSP. Inspect the verified primary recording below:
            </p>
            <a
              href={media.url}
              target="_blank"
              rel="noreferrer noopener"
              className="video-external-btn"
            >
              <span>Watch Original Video on {media.platform || "Source"}</span>
              <ExternalLink size={14} />
            </a>
          </div>
        )}
      </div>

      {loadError && (
        <div className="video-error-banner" role="alert">
          <AlertCircle size={14} />
          <span>Playback embed unavailable in this browser context.</span>
          <a href={media.url} target="_blank" rel="noreferrer noopener">
            Open primary video link
          </a>
        </div>
      )}

      {media.caption && (
        <figcaption className="video-caption">
          {media.caption}
        </figcaption>
      )}
    </div>
  );
}

