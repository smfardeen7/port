import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { Sparkles } from "@react-three/drei";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import { DEFAULT_PALETTE, PLAYER_FRAMES } from "@/game/sprites";
import { RUN_ICONS } from "@/game/icons";
import { accentColor } from "@/three/support";
import { haloTexture, iconTextures } from "@/three/textures";
import Scene from "./Scene";
import VoxelModel from "./VoxelModel";
import type { SceneProps } from "./Lazy3D";

const RINGS = [
  { radius: 2.4, tilt: 0.42, roll: 0.15, speed: 0.35, count: 6, offset: 0 },
  { radius: 3.2, tilt: -0.55, roll: -0.2, speed: -0.24, count: 6, offset: Math.PI / 6 },
];

function Ring({
  ring,
  textures,
  start,
  accent,
}: {
  ring: (typeof RINGS)[number];
  textures: THREE.Texture[];
  start: number;
  accent: string;
}) {
  const coins = useRef<THREE.Group[]>([]);
  const halo = useMemo(haloTexture, []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    for (let i = 0; i < ring.count; i++) {
      const g = coins.current[i];
      if (!g) continue;
      const a = ring.offset + t * ring.speed + (i / ring.count) * Math.PI * 2;
      g.position.set(Math.cos(a) * ring.radius, Math.sin(t * 2 + i) * 0.08, Math.sin(a) * ring.radius);
    }
  });

  return (
    <group rotation={[ring.tilt, 0, ring.roll]}>
      {Array.from({ length: ring.count }, (_, i) => {
        const tex = textures[(start + i) % textures.length];
        return (
          <group
            key={i}
            ref={(el) => {
              if (el) coins.current[i] = el;
            }}
          >
            <sprite scale={[1, 1, 1]}>
              <spriteMaterial
                map={halo}
                color={accent}
                transparent
                opacity={0.35}
                depthWrite={false}
                blending={THREE.AdditiveBlending}
              />
            </sprite>
            <sprite scale={[0.52, 0.52, 1]}>
              <spriteMaterial map={tex} transparent depthWrite={false} />
            </sprite>
          </group>
        );
      })}
    </group>
  );
}

function Coins({ accent }: { accent: string }) {
  const [textures, setTextures] = useState<THREE.Texture[] | null>(null);
  useEffect(() => {
    let alive = true;
    iconTextures("run", RUN_ICONS, accent, 128).then((t) => {
      if (alive) setTextures(t);
    });
    return () => {
      alive = false;
    };
  }, [accent]);
  if (!textures) return null;
  return (
    <>
      {RINGS.map((ring, i) => (
        <Ring key={i} ring={ring} textures={textures} start={i * 6} accent={accent} />
      ))}
    </>
  );
}

function Parallax({ children }: { children: React.ReactNode }) {
  const group = useRef<THREE.Group>(null);
  const pointer = useThree((s) => s.pointer);
  useFrame(() => {
    const g = group.current;
    if (!g) return;
    g.rotation.y += (pointer.x * 0.3 - g.rotation.y) * 0.06;
    g.rotation.x += (-pointer.y * 0.15 - g.rotation.x) * 0.06;
  });
  return <group ref={group}>{children}</group>;
}

/** Hero centrepiece: the voxel player with tech-icon coins orbiting. */
export default function HeroScene({ active }: SceneProps) {
  const accent = useMemo(accentColor, []);
  const palette = useMemo(() => ({ ...DEFAULT_PALETTE, s: accent }), [accent]);

  return (
    <Scene active={active} camera={{ position: [0, 0.9, 8.4], fov: 40 }}>
      <ambientLight intensity={0.75} />
      <directionalLight position={[3, 6, 4]} intensity={1.4} />
      <pointLight position={[-3, 2, 3]} intensity={12} color={accent} distance={14} />
      <pointLight position={[3, -1, 2]} intensity={7} color="#a78bfa" distance={12} />
      <VoxelModel
        map={PLAYER_FRAMES.idle}
        palette={palette}
        scale={0.21}
        glowColor={accent}
        position={[0, -0.1, 0]}
        bob={0.12}
        turn={0.2}
      />
      <Parallax>
        <Coins accent={accent} />
      </Parallax>
      <Sparkles count={40} scale={[9, 5, 4]} size={2} speed={0.2} color="#7dd3fc" />
      <EffectComposer>
        <Bloom mipmapBlur luminanceThreshold={0.6} luminanceSmoothing={0.2} intensity={0.7} />
      </EffectComposer>
    </Scene>
  );
}
