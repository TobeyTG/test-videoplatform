"use client";

import { Suspense, useMemo, useRef, useState, type RefObject } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { OrbitControls, Stars, Html } from "@react-three/drei";
import { TextureLoader, type Mesh, type Group } from "three";
import { COUNTRIES, latLonToVec3, type CountryBucket } from "@/lib/countries";
import CountryPanel from "./country-panel";
import { cn } from "@/lib/utils";

const EARTH_TEXTURE_URL = "https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg";
const EARTH_BUMP_URL = "https://threejs.org/examples/textures/planets/earth_normal_2048.jpg";
const EARTH_SPECULAR_URL = "https://threejs.org/examples/textures/planets/earth_specular_2048.jpg";

const GLOBE_RADIUS = 2;
const MARKER_RADIUS = GLOBE_RADIUS * 1.01;

interface WorldProps {
  bucketsByCode: Map<string, CountryBucket>;
  selectedCode: string | null;
  onSelect: (code: string) => void;
  autoRotate: boolean;
}

function World({ bucketsByCode, selectedCode, onSelect, autoRotate }: WorldProps) {
  const groupRef = useRef<Group>(null);
  const earthRef = useRef<Mesh>(null);

  const [color, bump, spec] = useLoader(TextureLoader, [EARTH_TEXTURE_URL, EARTH_BUMP_URL, EARTH_SPECULAR_URL]);

  useFrame((_, delta) => {
    if (autoRotate && groupRef.current) {
      groupRef.current.rotation.y += delta * 0.06;
    }
  });

  return (
    <group ref={groupRef}>
      <mesh ref={earthRef}>
        <sphereGeometry args={[GLOBE_RADIUS, 64, 64]} />
        <meshPhongMaterial map={color} normalMap={bump} specularMap={spec} shininess={12} />
      </mesh>

      <mesh>
        <sphereGeometry args={[GLOBE_RADIUS * 1.05, 48, 48]} />
        <meshBasicMaterial color="#4ea1ff" transparent opacity={0.08} depthWrite={false} />
      </mesh>

      {COUNTRIES.map((country) => {
        const bucket = bucketsByCode.get(country.code);
        const count = bucket?.items.length ?? 0;
        const pos = latLonToVec3(country.lat, country.lon, MARKER_RADIUS);
        const isSelected = selectedCode === country.code;
        const hasVideos = count > 0;

        return (
          <group key={country.code} position={pos}>
            <Html
              center
              distanceFactor={8}
              zIndexRange={[20, 0]}
              occlude={[earthRef as RefObject<Mesh>]}
            >
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (hasVideos) onSelect(country.code);
                }}
                disabled={!hasVideos}
                className={cn(
                  "group relative flex items-center gap-1.5 whitespace-nowrap rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-wider backdrop-blur transition-all",
                  isSelected
                    ? "scale-110 bg-brand text-black shadow-[0_0_24px_6px_oklch(0.78_0.14_70/0.6)]"
                    : hasVideos
                      ? "cursor-pointer bg-black/70 text-white ring-1 ring-white/30 hover:bg-black/90 hover:ring-brand/80"
                      : "bg-black/40 text-white/40 ring-1 ring-white/10",
                )}
              >
                <span className="relative flex h-2 w-2 items-center justify-center">
                  <span
                    className={cn(
                      "absolute inline-flex h-full w-full rounded-full opacity-75",
                      hasVideos && "animate-ping",
                      isSelected ? "bg-black" : "bg-brand",
                    )}
                  />
                  <span
                    className={cn(
                      "relative inline-flex h-2 w-2 rounded-full",
                      isSelected ? "bg-black" : hasVideos ? "bg-brand" : "bg-white/30",
                    )}
                  />
                </span>
                {country.name}
                {hasVideos && (
                  <span
                    className={cn(
                      "rounded-full px-1.5 text-[9px]",
                      isSelected ? "bg-black/20 text-black" : "bg-white/10 text-white/80",
                    )}
                  >
                    {count}
                  </span>
                )}
              </button>
            </Html>
          </group>
        );
      })}
    </group>
  );
}

interface GlobeSceneProps {
  buckets: CountryBucket[];
}

export default function GlobeScene({ buckets }: GlobeSceneProps) {
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [hovering, setHovering] = useState(false);

  const bucketsByCode = useMemo(() => new Map(buckets.map((b) => [b.country.code, b])), [buckets]);

  const selected = useMemo(
    () => (selectedCode ? (bucketsByCode.get(selectedCode) ?? null) : null),
    [selectedCode, bucketsByCode],
  );

  const autoRotate = !hovering && selectedCode === null;

  return (
    <div className="relative h-[calc(100vh-4rem)] w-full overflow-hidden bg-background">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: "radial-gradient(ellipse at center, oklch(0.16 0.04 260 / 0.9) 0%, oklch(0.08 0.005 260) 60%)",
        }}
      />

      <Canvas
        camera={{ position: [0, 0, 6], fov: 45 }}
        className="absolute inset-0"
        onPointerOver={() => setHovering(true)}
        onPointerOut={() => setHovering(false)}
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 3, 5]} intensity={1.4} />
        <directionalLight position={[-5, -2, -3]} intensity={0.25} color="#5577ff" />

        <Suspense fallback={null}>
          <Stars radius={80} depth={40} count={4000} factor={4} saturation={0} fade speed={0.5} />
          <World
            bucketsByCode={bucketsByCode}
            selectedCode={selectedCode}
            onSelect={setSelectedCode}
            autoRotate={autoRotate}
          />
        </Suspense>

        <OrbitControls
          enablePan={false}
          enableDamping
          dampingFactor={0.08}
          rotateSpeed={0.55}
          zoomSpeed={0.7}
          minDistance={3.2}
          maxDistance={12}
        />
      </Canvas>

      <div className="pointer-events-none absolute left-0 top-0 p-6 md:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand/80">Sapana Explore</p>
        <h1 className="mt-2 max-w-md text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          Pick a country. <br />
          Start watching.
        </h1>
        <p className="mt-3 max-w-sm text-sm text-muted-foreground">
          Drag to spin the world, scroll to zoom, and tap any glowing marker to see the films from that region.
        </p>
      </div>

      <CountryPanel bucket={selected} onClose={() => setSelectedCode(null)} />
    </div>
  );
}
