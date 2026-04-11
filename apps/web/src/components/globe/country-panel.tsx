"use client";

import Link from "next/link";
import { X, Play } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { resolveMediaUrl } from "@/lib/mediacms";
import type { CountryBucket } from "@/lib/countries";

interface CountryPanelProps {
  bucket: CountryBucket | null;
  onClose: () => void;
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function CountryPanel({ bucket, onClose }: CountryPanelProps) {
  return (
    <AnimatePresence>
      {bucket && (
        <motion.aside
          initial={{ x: "100%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: "100%", opacity: 0 }}
          transition={{ type: "spring", stiffness: 280, damping: 32 }}
          className="absolute right-0 top-0 z-30 flex h-full w-full max-w-md flex-col border-l border-border/40 bg-background/85 shadow-[-20px_0_60px_-20px_rgba(0,0,0,0.9)] backdrop-blur-xl"
        >
          <header className="flex items-center justify-between border-b border-border/40 px-6 py-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand/80">
                Region
              </p>
              <h2 className="mt-1 text-2xl font-bold tracking-tight text-foreground">
                {bucket.country.name}
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                {bucket.items.length}{" "}
                {bucket.items.length === 1 ? "film" : "films"} available
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-border/60 bg-background/60 text-muted-foreground transition-colors hover:border-brand/50 hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </header>

          <div className="flex-1 overflow-y-auto px-6 py-5">
            {bucket.items.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <p className="text-sm text-muted-foreground">
                  No films from {bucket.country.name} yet. Check back soon.
                </p>
              </div>
            ) : (
              <ul className="space-y-3">
                {bucket.items.map((item) => (
                  <li key={item.friendly_token}>
                    <Link
                      href={`/watch/${item.friendly_token}`}
                      className="group flex gap-3 overflow-hidden rounded-lg border border-transparent bg-card/40 p-2 transition-all hover:border-brand/40 hover:bg-card/80"
                    >
                      <div className="relative h-20 w-32 flex-shrink-0 overflow-hidden rounded-md bg-secondary">
                        {item.thumbnail_url && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={resolveMediaUrl(item.thumbnail_url)}
                            alt={item.title ?? ""}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-black">
                            <Play className="h-4 w-4 fill-current" />
                          </div>
                        </div>
                        {(item.duration ?? 0) > 0 && (
                          <span className="absolute bottom-1 right-1 rounded bg-black/80 px-1 py-0.5 text-[9px] font-semibold text-white tabular-nums">
                            {formatDuration(item.duration ?? 0)}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1 py-0.5">
                        <h3 className="line-clamp-1 text-sm font-semibold text-foreground transition-colors group-hover:text-brand">
                          {item.title}
                        </h3>
                        {item.description && (
                          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                            {item.description}
                          </p>
                        )}
                        <p className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground/70">
                          {(item.views ?? 0).toLocaleString()} views
                        </p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
