"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Play, Info, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { resolveMediaUrl } from "@/lib/mediacms";
import type { MediaItem } from "@/lib/mediacms";
import { useWatchTransition } from "@/components/watch-transition";

interface HeroProps {
  item: MediaItem;
}

export default function Hero({ item }: HeroProps) {
  const bg = resolveMediaUrl(item.thumbnail_url ?? "");
  const { start: startWatchTransition } = useWatchTransition();

  const handlePlay = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (
      e.metaKey ||
      e.ctrlKey ||
      e.shiftKey ||
      e.altKey ||
      e.button !== 0 ||
      !item.friendly_token
    ) {
      return;
    }
    e.preventDefault();
    startWatchTransition({
      token: item.friendly_token,
      originX: e.clientX,
      originY: e.clientY + window.scrollY,
    });
  };

  return (
    <section
      className="relative -mt-16 h-[82vh] min-h-[560px] w-full overflow-hidden"
    >
      <motion.div
        initial={{ scale: 1.08, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
        className="absolute inset-0"
      >
        <img
          src={bg}
          alt=""
          className="h-full w-full object-cover"
          aria-hidden="true"
        />
      </motion.div>

      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/70 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background to-transparent" />

      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.04] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")",
        }}
      />

      <div className="relative z-10 mx-auto flex h-full max-w-[1800px] items-end px-4 pb-24 md:px-8 md:pb-28">
        <div className="max-w-2xl space-y-5">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-brand backdrop-blur"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Featured
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="text-4xl font-bold leading-[1.05] tracking-tight text-foreground drop-shadow-2xl md:text-6xl lg:text-7xl"
          >
            {item.title}
          </motion.h1>

          {item.description && (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.6 }}
              className="line-clamp-3 max-w-xl text-sm leading-relaxed text-foreground/80 drop-shadow md:text-base"
            >
              {item.description}
            </motion.p>
          )}

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="flex flex-wrap items-center gap-3 pt-2"
          >
            <Link
              href={`/watch/${item.friendly_token}`}
              onClick={handlePlay}
              className={cn(
                buttonVariants({ size: "lg" }),
                "gap-2 rounded-full bg-white px-6 py-3 text-base font-semibold text-black shadow-[0_8px_32px_-8px_rgba(255,255,255,0.4)] transition-all hover:scale-[1.03] hover:bg-white/90"
              )}
            >
              <Play className="h-5 w-5 fill-current" />
              Play
            </Link>
            <Link
              href={`/watch/${item.friendly_token}`}
              onClick={handlePlay}
              className={cn(
                buttonVariants({ variant: "secondary", size: "lg" }),
                "gap-2 rounded-full border border-white/20 bg-white/10 px-6 py-3 text-base font-semibold text-foreground backdrop-blur-md transition-all hover:scale-[1.03] hover:bg-white/20"
              )}
            >
              <Info className="h-5 w-5" />
              More Info
            </Link>
          </motion.div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1, duration: 0.6 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="h-8 w-[1px] bg-gradient-to-b from-transparent via-foreground/40 to-transparent"
        />
      </motion.div>
    </section>
  );
}
