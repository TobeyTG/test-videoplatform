"use client";

import "@videojs/react/video/skin.css";
import {
  createPlayer,
  Popover,
  selectControls,
  useMedia,
  videoFeatures,
} from "@videojs/react";
import { VideoSkin, Video } from "@videojs/react/video";
import { HlsVideo } from "@videojs/react/media/hls-video";
import { Settings } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const Player = createPlayer({ features: videoFeatures });
const { usePlayer } = Player;

interface PlayerProps {
  src: string;
  poster?: string;
}

// Minimal shape of the hls.js engine we need. We avoid importing `hls.js`
// directly since it's a transitive dep of @videojs/core and not resolvable
// from this workspace by bare specifier.
interface HlsLevel {
  height: number;
  width: number;
  bitrate: number;
}

interface HlsEngine {
  levels: HlsLevel[];
  currentLevel: number;
  nextLevel: number;
  on(event: string, listener: () => void): void;
  off(event: string, listener: () => void): void;
}

// hls.js event name constants (matches Hls.Events values).
const HLS_MANIFEST_PARSED = "hlsManifestParsed";
const HLS_LEVEL_SWITCHED = "hlsLevelSwitched";

function QualitySelector() {
  const media = useMedia() as unknown as { engine?: HlsEngine | null } | null;
  const controlsVisible = usePlayer(
    (state) => selectControls(state)?.controlsVisible ?? true,
  );
  const [levels, setLevels] = useState<HlsLevel[]>([]);
  const [currentLevel, setCurrentLevel] = useState(-1);

  useEffect(() => {
    const engine = media?.engine;
    if (!engine) return;

    const sync = () => {
      setLevels([...engine.levels]);
      setCurrentLevel(engine.currentLevel);
    };

    sync();
    engine.on(HLS_MANIFEST_PARSED, sync);
    engine.on(HLS_LEVEL_SWITCHED, sync);

    return () => {
      engine.off(HLS_MANIFEST_PARSED, sync);
      engine.off(HLS_LEVEL_SWITCHED, sync);
    };
  }, [media]);

  if (levels.length < 2) return null;

  const selectLevel = (idx: number) => {
    const engine = media?.engine;
    if (!engine) return;
    // nextLevel switches without flushing the buffer → smoother UX than currentLevel.
    engine.nextLevel = idx;
    setCurrentLevel(idx);
  };

  const activeLabel =
    currentLevel === -1 || !levels[currentLevel]
      ? "Auto"
      : `${levels[currentLevel].height}p`;

  // Display levels highest-to-lowest resolution.
  const sortedLevels = levels
    .map((level, idx) => ({ level, idx }))
    .sort((a, b) => b.level.height - a.level.height);

  return (
    <Popover.Root side="top" align="end">
      <Popover.Trigger
        className={cn(
          "absolute bottom-16 right-4 z-20 flex items-center gap-1.5 rounded-md bg-black/60 px-2.5 py-1 text-xs font-medium text-white shadow-sm backdrop-blur-sm transition duration-200 hover:bg-black/80",
          controlsVisible
            ? "opacity-100"
            : "pointer-events-none opacity-0",
        )}
        aria-label="Quality settings"
      >
        <Settings className="h-3.5 w-3.5" />
        <span>{activeLabel}</span>
      </Popover.Trigger>
      <Popover.Popup className="z-30 min-w-[7rem] rounded-md bg-black/90 p-1 text-white shadow-lg ring-1 ring-white/10 backdrop-blur-sm">
        <button
          type="button"
          onClick={() => selectLevel(-1)}
          className={cn(
            "flex w-full items-center justify-between rounded px-3 py-1.5 text-left text-xs transition hover:bg-white/10",
            currentLevel === -1 && "bg-white/10 font-medium",
          )}
        >
          Auto
        </button>
        {sortedLevels.map(({ level, idx }) => (
          <button
            key={idx}
            type="button"
            onClick={() => selectLevel(idx)}
            className={cn(
              "flex w-full items-center justify-between rounded px-3 py-1.5 text-left text-xs transition hover:bg-white/10",
              currentLevel === idx && "bg-white/10 font-medium",
            )}
          >
            {level.height}p
          </button>
        ))}
      </Popover.Popup>
    </Popover.Root>
  );
}

export default function SapanaPlayer({ src, poster }: PlayerProps) {
  const isHls = src.includes(".m3u8");

  return (
    <Player.Provider>
      <VideoSkin>
        {isHls ? (
          <HlsVideo src={src} poster={poster} playsInline />
        ) : (
          <Video src={src} poster={poster} playsInline />
        )}
        {isHls && <QualitySelector />}
      </VideoSkin>
    </Player.Provider>
  );
}
