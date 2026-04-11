"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "motion/react";

interface TransitionState {
  token: string;
  /** Page-coordinate origin for the zoom (clientX, clientY + scrollY). */
  originX: number;
  originY: number;
}

interface WatchTransitionContextValue {
  start: (state: TransitionState) => void;
}

const WatchTransitionContext =
  createContext<WatchTransitionContextValue | null>(null);

export function useWatchTransition() {
  const ctx = useContext(WatchTransitionContext);
  if (!ctx) {
    throw new Error(
      "useWatchTransition must be used within a WatchTransitionProvider"
    );
  }
  return ctx;
}

type Phase = "zoom" | "cover" | "reveal" | null;

const ZOOM_SCALE = 1.12;
const ZOOM_DURATION = 0.85;
const COVER_DURATION = 0.28;
const REVEAL_DURATION = 0.4;

export function WatchTransitionProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<TransitionState | null>(null);
  const [phase, setPhase] = useState<Phase>(null);
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const start = useCallback(
    (next: TransitionState) => {
      // Ignore re-entrant calls — one transition at a time.
      if (state) return;
      setState(next);
      setPhase("zoom");
    },
    [state]
  );

  // zoom -> cover. Hold the OLD page during the in-place scale, then start
  // the navigation just as the black overlay begins fading in. This guarantees
  // the user never sees the destination page swap in mid-zoom.
  useEffect(() => {
    if (phase !== "zoom" || !state) return;
    const t = window.setTimeout(() => {
      setPhase("cover");
      router.push(`/watch/${state.token}`);
    }, ZOOM_DURATION * 1000);
    return () => window.clearTimeout(t);
  }, [phase, state, router]);

  // cover -> reveal. Wait until the destination route is actually mounted
  // before fading the black overlay back out, otherwise we'd reveal a blank
  // half-loaded page.
  useEffect(() => {
    if (phase !== "cover" || !state) return;
    if (pathname !== `/watch/${state.token}`) return;
    const t = window.setTimeout(() => setPhase("reveal"), 240);
    return () => window.clearTimeout(t);
  }, [phase, pathname, state]);

  // reveal -> done.
  useEffect(() => {
    if (phase !== "reveal") return;
    const t = window.setTimeout(() => {
      setState(null);
      setPhase(null);
    }, REVEAL_DURATION * 1000 + 40);
    return () => window.clearTimeout(t);
  }, [phase]);

  // Safety net: never let the overlay hang around indefinitely if something
  // goes sideways with the navigation.
  useEffect(() => {
    if (!state) return;
    const t = window.setTimeout(() => {
      setState(null);
      setPhase(null);
    }, 4000);
    return () => window.clearTimeout(t);
  }, [state]);

  // Lock scroll while a transition is in flight so the transform-origin
  // (computed in page coordinates at click time) doesn't drift.
  useEffect(() => {
    if (!phase) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [phase]);

  // Wrapper scale schedule:
  //   zoom    : 1     → 1.12 (in-place scale of the OLD page)
  //   cover   : 1.12          (held while black fades in)
  //   reveal  : snap to 1     (NEW page is now mounted; we don't want to
  //                            animate the new content, so snap instantly)
  //   idle    : 1
  const targetScale = phase === "zoom" || phase === "cover" ? ZOOM_SCALE : 1;
  const scaleDuration = phase === "reveal" ? 0 : ZOOM_DURATION;

  // Wrapper opacity schedule: dim the OLD page as it zooms so the foreground
  // starts to "wash out" before the black overlay arrives. Snap back to 1 in
  // reveal so the NEW page is fully opaque when uncovered.
  const targetOpacity = phase === "zoom" || phase === "cover" ? 0.55 : 1;
  const opacityDuration = phase === "reveal" ? 0 : ZOOM_DURATION;

  const transformOrigin = state
    ? `${state.originX}px ${state.originY}px`
    : "50% 50%";

  return (
    <WatchTransitionContext.Provider value={{ start }}>
      <motion.div
        animate={{ scale: targetScale, opacity: targetOpacity }}
        transition={{
          scale: { duration: scaleDuration, ease: [0.22, 1, 0.36, 1] },
          opacity: { duration: opacityDuration, ease: "easeOut" },
        }}
        style={{
          transformOrigin,
          willChange: phase ? "transform, opacity" : "auto",
        }}
      >
        {children}
      </motion.div>

      {mounted &&
        createPortal(
          <motion.div
            aria-hidden
            className="pointer-events-none fixed inset-0 z-100 bg-black"
            initial={false}
            animate={{ opacity: phase === "cover" ? 1 : 0 }}
            transition={{
              duration: phase === "reveal" ? REVEAL_DURATION : COVER_DURATION,
              ease: "easeInOut",
            }}
          />,
          document.body
        )}
    </WatchTransitionContext.Provider>
  );
}
