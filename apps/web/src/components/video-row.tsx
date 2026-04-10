"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { MediaItem } from "@/lib/mediacms";
import VideoCard from "@/components/video-card";
import { cn } from "@/lib/utils";

interface VideoRowProps {
  title: string;
  items: MediaItem[];
}

export default function VideoRow({ title, items }: VideoRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(true);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const update = () => {
      setCanLeft(el.scrollLeft > 4);
      setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
    };
    update();
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [items.length]);

  function scroll(direction: "left" | "right") {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.clientWidth * 0.8;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  }

  if (items.length === 0) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="relative"
    >
      <div className="mb-3 flex items-center justify-between px-4 md:px-8">
        <h2 className="text-lg font-bold tracking-tight text-foreground md:text-xl">
          {title}
        </h2>
      </div>

      <div className="group/row relative">
        {/* Left edge fade + button */}
        <button
          onClick={() => scroll("left")}
          className={cn(
            "absolute left-0 top-0 z-20 hidden h-full w-16 items-center justify-center bg-gradient-to-r from-background via-background/70 to-transparent opacity-0 transition-opacity md:flex",
            canLeft && "group-hover/row:opacity-100"
          )}
          aria-label="Scroll left"
        >
          <motion.div
            whileHover={{ scale: 1.12 }}
            whileTap={{ scale: 0.92 }}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-background/80 ring-1 ring-white/10 backdrop-blur"
          >
            <ChevronLeft className="h-5 w-5 text-foreground" />
          </motion.div>
        </button>

        {/* Scrollable row */}
        <div
          ref={scrollRef}
          className="scrollbar-hide flex gap-3 overflow-x-auto px-4 pb-8 pt-2 md:px-8"
        >
          {items.map((item, idx) => (
            <motion.div
              key={`${item.friendly_token}-${idx}`}
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{
                delay: Math.min(idx * 0.04, 0.3),
                duration: 0.45,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <VideoCard item={item} />
            </motion.div>
          ))}
        </div>

        {/* Right edge fade + button */}
        <button
          onClick={() => scroll("right")}
          className={cn(
            "absolute right-0 top-0 z-20 hidden h-full w-16 items-center justify-center bg-gradient-to-l from-background via-background/70 to-transparent opacity-0 transition-opacity md:flex",
            canRight && "group-hover/row:opacity-100"
          )}
          aria-label="Scroll right"
        >
          <motion.div
            whileHover={{ scale: 1.12 }}
            whileTap={{ scale: 0.92 }}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-background/80 ring-1 ring-white/10 backdrop-blur"
          >
            <ChevronRight className="h-5 w-5 text-foreground" />
          </motion.div>
        </button>
      </div>
    </motion.section>
  );
}
