"use client";

import "@videojs/react/video/skin.css";
import { createPlayer, videoFeatures } from "@videojs/react";
import { VideoSkin, Video } from "@videojs/react/video";

const Player = createPlayer({ features: videoFeatures });

interface PlayerProps {
  src: string;
  poster?: string;
}

export default function SapanaPlayer({ src, poster }: PlayerProps) {
  return (
    <Player.Provider>
      <VideoSkin>
        <Video src={src} poster={poster} playsInline />
      </VideoSkin>
    </Player.Provider>
  );
}
