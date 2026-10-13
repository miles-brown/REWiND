"use client";

import { useMemo, useState } from "react";
import { ExternalLink, Film, AlertCircle } from "lucide-react";

export interface VideoMediaItem {
  url: string;
  embedUrl?: string | null;
  label?: string;
  thumbnailUrl?: string | null;
  platform?: string | null;
  caption?: string | null;
}

export function EmbeddedVideoPlayer({
  media,
  title,
}: {
  media: VideoMediaItem;
  title?: string;
}) {
  const [loadError, setLoadError] = useState(false);

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
        src: `https://www.youtube-nocookie.com/embed/${ytMatch[1]}?rel=0&modestbranding=1`,
      };
    }

    // Direct MP4 / WebM / OGG video stream
    if (/\.(mp4|webm|ogg)($|\?)/i.test(rawUrl)) {
      return {
        type: "html5" as const,
        src: rawUrl,
      };
    }

    // Rumble embed
    const rumbleMatch = rawUrl.match(/rumble\.com\/embed\/([a-zA-Z0-9_-]+)/);
    if (rumbleMatch && rumbleMatch[1]) {
      return {
        type: "iframe" as const,
        src: `https://rumble.com/embed/${rumbleMatch[1]}`,
      };
    }

    // Explicit iframe embed URL
    if (rawUrl.includes("/embed/")) {
      return {
        type: "iframe" as const,
        src: rawUrl,
      };
    }

    return {
      type: "external" as const,
      src: rawUrl,
    };
  }, [media.embedUrl, media.url]);

  return (
    <div
      className="embedded-video-card"
      role="region"
      aria-label={`Archival video: ${title || media.label || "footage"}`}
    >
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
            <Film size={32} className="fallback-icon" />
            <p className="fallback-title">{media.label || "Archival Video Recording"}</p>
            <p className="fallback-desc">
              Primary social video stream. Click below to view the verified original upload on its archival platform.
            </p>
            <a
              href={media.url}
              target="_blank"
              rel="noreferrer noopener"
              className="video-external-btn"
            >
              <span>Watch Original Video</span>
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
