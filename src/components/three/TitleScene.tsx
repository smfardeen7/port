import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { Sparkles, Stars } from "@react-three/drei";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import { SiGithubactions, SiJupyter, SiNodedotjs, SiPandas, SiScikitlearn } from "react-icons/si";
import { VscAzure } from "react-icons/vsc";
import { RUN_ICONS } from "@/game/icons";
import { AVATAR_URL } from "@/constants";
import { accentColor, isDarkTheme } from "@/three/support";
import { haloTexture, iconTextures } from "@/three/textures";
import Scene from "./Scene";
import HumanFigure from "./HumanFigure";
import NeonFloor from "./NeonFloor";
import type { SceneProps } from "./Lazy3D";

const TITLE_ICONS = [...RUN_ICONS, SiScikitlearn, SiPandas, VscAzure, SiNodedotjs, SiJupyter, SiGithubactions];

interface Slot {
  x: number;
  y: number;
  z: number;
  size: number;
  speed: number;
  phase: number;
}

/** Icons sit in two arcs beside the text on wide screens, in a band above it on phones. */
function layout(narrow: boolean): Slot[] {
  const slots: Slot[] = [];
  const n = narrow ? 10 : TITLE_ICONS.length;
  for (let i = 0; i < n; i++) {
    if (narrow) {
      slots.push({
        x: -2.1 + (i / (n - 1)) * 4.2,
        y: 2.5 + (i % 3) * 0.55,
        z: -3 - (i % 4) * 0.8,
        size: 0.5 + (i % 3) * 0.08,
        speed: 0.6 + (i % 5) * 0.12,
        phase: i * 1.3,
      });
    } else {
      const side = i % 2 === 0 ? -1 : 1;
      const k = Math.floor(i / 2);
      slots.push({
        x: side * (3.4 + (k % 3) * 0.95 + (k > 5 ? 0.7 : 0)),
        y: 0.5 + ((k * 0.55) % 2.6),
        z: -1.2 - (k % 4) * 0.9,
        size: 0.55 + (k % 3) * 0.1,
        speed: 0.6 + (k % 5) * 0.12,
        phase: i * 1.3,
      });
    }
  }
  return slots;
}

function FloatingSkills({ accent }: { accent: string }) {
  const aspect = useThree((s) => s.viewport.aspect);
  const narrow = aspect < 0.9;
  const [textures, setTextures] = useState<THREE.Texture[] | null>(null);
  const halo = useMemo(haloTexture, []);
  const slots = useMemo(() => layout(narrow), [narrow]);
  const refs = useRef<THREE.Group[]>([]);

  useEffect(() => {
    let alive = true;
    iconTextures("title", TITLE_ICONS, accent, 128).then((t) => {
      if (alive) setTextures(t);
    });
    return () => {
      alive = false;
    };
  }, [accent]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    slots.forEach((s, i) => {
      const g = refs.current[i];
      if (!g) return;
      g.position.set(
        s.x + Math.sin(t * 0.3 + s.phase) * 0.15,
        s.y + Math.sin(t * s.speed + s.phase) * 0.22,
        s.z
      );
    });
  });

  if (!textures) return null;
  return (
    <>
      {slots.map((s, i) => (
        <group
          key={i}
          position={[s.x, s.y, s.z]}
          ref={(el) => {
            if (el) refs.current[i] = el;
          }}
        >
          <sprite scale={[s.size * 1.9, s.size * 1.9, 1]}>
            <spriteMaterial
              map={halo}
              color={accent}
              transparent
              opacity={0.24}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
            />
          </sprite>
          <sprite scale={[s.size, s.size, 1]}>
            <spriteMaterial map={textures[i % textures.length]} transparent depthWrite={false} />
          </sprite>
        </group>
      ))}
    </>
  );
}

/** Optional avatar beside the title, only when VITE_AVATAR_URL is set. */
function Avatar() {
  const aspect = useThree((s) => s.viewport.aspect);
  const narrow = aspect < 0.9;
  return (
    <HumanFigure
      height={narrow ? 1.7 : 1.85}
      position={narrow ? [0, 0, -5.4] : [-3.1, 0, -0.2]}
      followPointer
      shadow
    />
  );
}

/** Title screen backdrop: neon floor, stars, and floating skill icons. */
export default function TitleScene({ active }: SceneProps) {
  const accent = useMemo(accentColor, []);
  const fogColor = isDarkTheme() ? "#0b1120" : "#e9eef6";

  return (
    <Scene active={active} camera={{ position: [0, 1.7, 8], fov: 46 }}>
      <fog attach="fog" args={[fogColor, 7, 26]} />
      <ambientLight intensity={0.7} />
      <directionalLight position={[3, 6, 3]} intensity={1.3} />
      <pointLight position={[0, 3, 2]} intensity={14} color={accent} distance={14} />
      <Stars radius={70} depth={30} count={1400} factor={3} saturation={0} fade speed={0.4} />
      <Sparkles count={70} scale={[16, 6, 10]} position={[0, 3, 0]} size={2.5} speed={0.25} color="#7dd3fc" />
      <NeonFloor color={accent} />
      <FloatingSkills accent={accent} />
      {AVATAR_URL && <Avatar />}
      <EffectComposer>
        <Bloom mipmapBlur luminanceThreshold={0.55} luminanceSmoothing={0.2} intensity={0.8} />
      </EffectComposer>
    </Scene>
  );
}
