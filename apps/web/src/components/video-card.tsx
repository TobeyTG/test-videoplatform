"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { useQuery } from "@tanstack/react-query";
import { Play, Plus, ThumbsUp, ChevronDown, Volume2, VolumeX } from "lucide-react";
import { resolveMediaUrl } from "@/lib/mediacms";
import type { MediaItem } from "@/lib/mediacms";
import { mediaDetailOptions } from "@/api/queries/media";
import { cn } from "@/lib/utils";

const HOVER_DELAY_MS = 450;
const CLOSE_DELAY_MS = 120;
const PREVIEW_SCALE = 1.4;
const VIEWPORT_MARGIN = 12;

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0)
    return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function formatViews(views: number): string {
  if (views >= 1_000_000) return `${(views / 1_000_000).toFixed(1)}M`;
  if (views >= 1_000) return `${(views / 1_000).toFixed(1)}K`;
  return `${views}`;
}

interface PreviewRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

interface HoverPreviewProps {
  item: MediaItem;
  sourceRect: DOMRect;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

function isVideoUrl(url: string): boolean {
  return /\.(mp4|webm|mov|m4v|ogv)(\?|#|$)/i.test(url);
}

function HoverPreview({
  item,
  sourceRect,
  onMouseEnter,
  onMouseLeave,
}: HoverPreviewProps) {
  const thumb = resolveMediaUrl(item.thumbnail_url ?? "");
  const router = useRouter();
  const [muted, setMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Always fetch detail — TanStack caches it so repeat hovers are free.
  const { data: detail } = useQuery({
    ...mediaDetailOptions(item.friendly_token ?? ""),
    enabled: Boolean(item.friendly_token),
  });
  const detailMediaUrl = (
    detail as unknown as { original_media_url?: string } | undefined
  )?.original_media_url;

  // Resolve a raw preview_url to absolute, then classify it.
  const rawPreviewUrl = item.preview_url
    ? resolveMediaUrl(item.preview_url)
    : null;
  const previewIsVideo = rawPreviewUrl ? isVideoUrl(rawPreviewUrl) : false;

  // Video source preference:
  // 1. preview_url if it's a video file (small, purpose-built preview clip)
  // 2. original_media_url from detail fetch (full file, browser range-requests)
  // We intentionally ignore .gif preview_urls — they're tiny still-frame
  // thumbnails in MediaCMS and not what the user wants to see.
  const videoSrc = previewIsVideo
    ? rawPreviewUrl
    : detailMediaUrl
      ? resolveMediaUrl(detailMediaUrl)
      : null;

  // Sync subsequent mute toggles to the element.
  useEffect(() => {
    if (videoRef.current) videoRef.current.muted = muted;
  }, [muted]);

  // Track teardown for the current video element so we can reuse it on src change.
  const teardownRef = useRef<(() => void) | null>(null);

  // Ref callback: runs synchronously when the <video> element mounts (or the
  // ref target changes). Doing the setup here — rather than in a useEffect —
  // avoids a race where useEffect([videoSrc]) can fire before a newly
  // conditionally-rendered element's ref is committed.
  const attachVideo = useCallback(
    (video: HTMLVideoElement | null) => {
      if (teardownRef.current) {
        teardownRef.current();
        teardownRef.current = null;
      }
      videoRef.current = video;
      if (!video || !videoSrc) return;

      // Force muted onto the DOM element BEFORE assigning src. Chromium's
      // autoplay policy evaluates the element's muted state at load time, and
      // if React reconciles attributes in the wrong order the element is
      // flagged as "wants-to-autoplay-with-sound" and playback is blocked —
      // you'd see a single decoded frame and nothing else.
      video.muted = true;
      video.defaultMuted = true;
      video.setAttribute("muted", "");
      video.playsInline = true;
      video.loop = true;
      video.preload = "auto";

      const onPlaying = () => setIsPlaying(true);
      const onPause = () => setIsPlaying(false);
      video.addEventListener("playing", onPlaying);
      video.addEventListener("pause", onPause);

      video.src = videoSrc;
      video.load();

      const p = video.play();
      if (p && typeof p.catch === "function") {
        p.catch(() => {
          // Autoplay rejection is silent — the manual Play overlay will
          // appear (keyed off !isPlaying) to let the user start it by click.
        });
      }

      teardownRef.current = () => {
        video.removeEventListener("playing", onPlaying);
        video.removeEventListener("pause", onPause);
        try {
          video.pause();
          video.removeAttribute("src");
          video.load();
        } catch {}
      };
    },
    [videoSrc]
  );

  // Final teardown on component unmount.
  useEffect(
    () => () => {
      if (teardownRef.current) teardownRef.current();
      teardownRef.current = null;
    },
    []
  );

  // Manual fallback: user-initiated play (bypasses any residual autoplay block).
  const forcePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = true;
    video.play().catch(() => {});
  }, []);

  // Compute where the expanded preview should sit.
  const previewWidth = sourceRect.width * PREVIEW_SCALE;
  const previewThumbHeight = sourceRect.height * PREVIEW_SCALE;
  const contentHeight = 168;
  const previewHeight = previewThumbHeight + contentHeight;

  let targetLeft =
    sourceRect.left + sourceRect.width / 2 - previewWidth / 2;
  const targetTop =
    sourceRect.top + sourceRect.height / 2 - previewThumbHeight / 2 - 32;

  if (typeof window !== "undefined") {
    const maxLeft = window.innerWidth - previewWidth - VIEWPORT_MARGIN;
    if (targetLeft < VIEWPORT_MARGIN) targetLeft = VIEWPORT_MARGIN;
    if (targetLeft > maxLeft) targetLeft = Math.max(VIEWPORT_MARGIN, maxLeft);
  }

  const source: PreviewRect = {
    left: sourceRect.left,
    top: sourceRect.top,
    width: sourceRect.width,
    height: sourceRect.height,
  };

  const target: PreviewRect = {
    left: targetLeft,
    top: targetTop,
    width: previewWidth,
    height: previewHeight,
  };

  const goWatch = () => router.push(`/watch/${item.friendly_token}`);

  return createPortal(
    <motion.div
      initial={{ ...source, opacity: 0 }}
      animate={{ ...target, opacity: 1 }}
      exit={{ ...source, opacity: 0, transition: { duration: 0.15 } }}
      transition={{ type: "spring", stiffness: 340, damping: 30, mass: 0.8 }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className="fixed z-[60] overflow-hidden rounded-xl bg-card shadow-[0_30px_90px_-10px_rgba(0,0,0,0.9)] ring-1 ring-white/10"
      style={{ transformOrigin: "center center" }}
    >
      {/* Media area — thumbnail → video crossfade */}
      <div
        role="button"
        tabIndex={0}
        onClick={goWatch}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            goWatch();
          }
        }}
        className="group relative block w-full cursor-pointer overflow-hidden bg-black"
        style={{ height: previewThumbHeight }}
      >
        {/* Poster: always shown underneath; video fades in on top */}
        <img
          src={thumb}
          alt={item.title ?? ""}
          className="absolute inset-0 h-full w-full object-cover"
        />

        {videoSrc ? (
          <video
            key={videoSrc}
            ref={attachVideo}
            poster={thumb}
            muted
            playsInline
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : null}

        {/* Bottom fade for readability */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-card via-card/10 to-transparent" />

        {/* Mute toggle — only when we have a video source */}
        {videoSrc && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setMuted((m) => !m);
            }}
            className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full border border-white/30 bg-black/50 text-white backdrop-blur transition-colors hover:bg-black/70"
            aria-label={muted ? "Unmute" : "Mute"}
          >
            {muted ? (
              <VolumeX className="h-3.5 w-3.5" />
            ) : (
              <Volume2 className="h-3.5 w-3.5" />
            )}
          </button>
        )}

        {/* Manual play fallback: visible whenever we have a video source but
            it isn't currently playing. Clicking it forces .play() from a user
            gesture — bypasses any lingering autoplay block. */}
        {videoSrc && !isPlaying && (
          <motion.button
            type="button"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15, type: "spring", stiffness: 320 }}
            onClick={(e) => {
              e.stopPropagation();
              forcePlay();
            }}
            className="absolute inset-0 flex items-center justify-center bg-black/30"
            aria-label="Play preview"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/90 text-black shadow-2xl backdrop-blur">
              <Play className="h-6 w-6 fill-current" />
            </div>
          </motion.button>
        )}
      </div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.2 }}
        className="space-y-3 p-4"
      >
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={goWatch}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-black shadow transition-transform hover:scale-105"
            aria-label="Play"
          >
            <Play className="h-4 w-4 fill-current" />
          </button>
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/30 bg-white/5 text-white backdrop-blur transition-colors hover:border-white/60"
            aria-label="Add to list"
          >
            <Plus className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/30 bg-white/5 text-white backdrop-blur transition-colors hover:border-white/60"
            aria-label="Like"
          >
            <ThumbsUp className="h-4 w-4" />
          </button>
          <div className="ml-auto">
            <button
              type="button"
              onClick={goWatch}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/30 bg-white/5 text-white backdrop-blur transition-colors hover:border-white/60"
              aria-label="More info"
            >
              <ChevronDown className="h-4 w-4" />
            </button>
          </div>
        </div>

        <h3 className="line-clamp-1 text-sm font-semibold text-foreground">
          {item.title}
        </h3>

        <div className="flex items-center gap-2 text-xs">
          {(item.duration ?? 0) > 0 && (
            <span className="font-medium text-foreground/90">
              {formatDuration(item.duration ?? 0)}
            </span>
          )}
          <span className="rounded border border-white/20 px-1.5 py-0.5 text-[10px] font-medium text-foreground/70">
            HD
          </span>
          <span className="text-muted-foreground">
            {formatViews(item.views ?? 0)} views
          </span>
        </div>

        {item.description && (
          <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
            {item.description}
          </p>
        )}
      </motion.div>
    </motion.div>,
    document.body
  );
}

interface VideoCardProps {
  item: MediaItem;
  /** If true, renders without the hover preview (useful for grids). */
  compact?: boolean;
}

export default function VideoCard({ item, compact = false }: VideoCardProps) {
  const thumb = resolveMediaUrl(item.thumbnail_url ?? "");
  const cardRef = useRef<HTMLAnchorElement>(null);
  const [preview, setPreview] = useState<{ rect: DOMRect } | null>(null);
  const openTimer = useRef<number | null>(null);
  const closeTimer = useRef<number | null>(null);

  const clearTimers = useCallback(() => {
    if (openTimer.current) {
      clearTimeout(openTimer.current);
      openTimer.current = null;
    }
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }, []);

  const scheduleOpen = useCallback(() => {
    if (compact) return;
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
    if (preview || openTimer.current) return;
    openTimer.current = window.setTimeout(() => {
      if (!cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      setPreview({ rect });
      openTimer.current = null;
    }, HOVER_DELAY_MS);
  }, [compact, preview]);

  const scheduleClose = useCallback(() => {
    if (openTimer.current) {
      clearTimeout(openTimer.current);
      openTimer.current = null;
    }
    if (closeTimer.current) return;
    closeTimer.current = window.setTimeout(() => {
      setPreview(null);
      closeTimer.current = null;
    }, CLOSE_DELAY_MS);
  }, []);

  const cancelClose = useCallback(() => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }, []);

  // Close preview on scroll/resize — its position would otherwise drift.
  useEffect(() => {
    if (!preview) return;
    const close = () => {
      clearTimers();
      setPreview(null);
    };
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [preview, clearTimers]);

  useEffect(() => () => clearTimers(), [clearTimers]);

  return (
    <>
      <Link
        ref={cardRef}
        href={`/watch/${item.friendly_token}`}
        onMouseEnter={scheduleOpen}
        onMouseLeave={scheduleClose}
        className={cn(
          "group relative block flex-shrink-0 cursor-pointer",
          compact ? "w-full" : "w-[260px] md:w-[300px]"
        )}
      >
        <motion.div
          whileTap={{ scale: 0.97 }}
          animate={{ opacity: preview ? 0 : 1 }}
          transition={{ duration: 0.15 }}
          className="relative aspect-video overflow-hidden rounded-lg bg-secondary/60 ring-1 ring-white/5"
        >
          <img
            src={thumb}
            alt={item.title ?? ""}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-70" />

          {(item.duration ?? 0) > 0 && (
            <span className="absolute bottom-2 right-2 rounded bg-black/80 px-1.5 py-0.5 text-[10px] font-semibold text-white tabular-nums backdrop-blur">
              {formatDuration(item.duration ?? 0)}
            </span>
          )}
        </motion.div>

        <div className="mt-2.5 space-y-0.5">
          <h3 className="line-clamp-1 text-sm font-medium text-foreground transition-colors group-hover:text-brand">
            {item.title}
          </h3>
          <p className="text-xs text-muted-foreground">
            {formatViews(item.views ?? 0)} views
          </p>
        </div>
      </Link>

      <AnimatePresence>
        {preview && (
          <HoverPreview
            item={item}
            sourceRect={preview.rect}
            onMouseEnter={cancelClose}
            onMouseLeave={scheduleClose}
          />
        )}
      </AnimatePresence>
    </>
  );
}
