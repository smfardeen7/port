import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { SKILLS_LIST } from "@/constants";
import { useGame } from "@/game/store";
import { sfx } from "@/game/sfx";
import { fibonacciSphere } from "@/three/sphere";
import { accentColor } from "@/three/support";
import { haloTexture, iconTextures } from "@/three/textures";
import { useGalaxyHover } from "@/three/galaxyState";
import Scene from "./Scene";
import type { SceneProps } from "./Lazy3D";

const ALL_SKILLS = SKILLS_LIST.flatMap((g) => g.items);
const ICONS = ALL_SKILLS.map((s) => s.icon);
const RADIUS = 2.6;

function Icons({ accent }: { accent: string }) {
  const unlocked = useGame((s) => s.skills);
  const unlockSkill = useGame((s) => s.unlockSkill);
  const setHover = useGalaxyHover((s) => s.set);
  const [textures, setTextures] = useState<{ on: THREE.Texture[]; off: THREE.Texture[] } | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const group = useRef<THREE.Group>(null);
  const halo = useMemo(haloTexture, []);
  const points = useMemo(() => fibonacciSphere(ALL_SKILLS.length, RADIUS), []);

  useEffect(() => {
    let alive = true;
    Promise.all([
      iconTextures("skills", ICONS, accent, 128),
      iconTextures("skills", ICONS, "#94a3b8", 128),
    ]).then(([on, off]) => {
      if (alive) setTextures({ on, off });
    });
    return () => {
      alive = false;
      setHover(null);
    };
  }, [accent, setHover]);

  useFrame((_, dt) => {
    if (group.current) group.current.rotation.y += Math.min(dt, 0.05) * 0.12;
  });

  if (!textures) return null;

  return (
    <group ref={group}>
      {ALL_SKILLS.map((skill, i) => {
        const on = unlocked.includes(skill.id);
        const isHover = hovered === skill.id;
        const size = isHover ? 0.7 : 0.52;
        return (
          <group key={skill.id} position={points[i]}>
            {on && (
              <sprite scale={[1.15, 1.15, 1]}>
                <spriteMaterial
                  map={halo}
                  color={accent}
                  transparent
                  opacity={0.42}
                  depthWrite={false}
                  blending={THREE.AdditiveBlending}
                />
              </sprite>
            )}
            <sprite
              scale={[size, size, 1]}
              onPointerOver={(e: ThreeEvent<PointerEvent>) => {
                e.stopPropagation();
                setHovered(skill.id);
                setHover(skill);
                document.body.style.cursor = "pointer";
              }}
              onPointerOut={() => {
                setHovered((h) => (h === skill.id ? null : h));
                setHover(null);
                document.body.style.cursor = "";
              }}
              onClick={(e: ThreeEvent<MouseEvent>) => {
                e.stopPropagation();
                if (on) {
                  sfx.blip();
                  return;
                }
                unlockSkill(skill.id);
                sfx.unlock();
              }}
            >
              <spriteMaterial
                map={on ? textures.on[i] : textures.off[i]}
                transparent
                opacity={on ? 1 : 0.62}
                depthWrite={false}
              />
            </sprite>
          </group>
        );
      })}
    </group>
  );
}

/** All skills as icon sprites on a sphere. Drag to spin, click to unlock. */
export default function SkillGalaxy({ active }: SceneProps) {
  const accent = useMemo(accentColor, []);
  // Dragging would swallow vertical swipes on touch screens, so controls are
  // mouse-only; touch users still get auto-rotation and taps.
  const finePointer = useMemo(() => window.matchMedia("(pointer: fine)").matches, []);

  return (
    <Scene active={active} camera={{ position: [0, 0.4, 7.2], fov: 44 }}>
      <ambientLight intensity={1} />
      <Icons accent={accent} />
      <mesh>
        <icosahedronGeometry args={[RADIUS, 2]} />
        <meshBasicMaterial color={accent} wireframe transparent opacity={0.06} />
      </mesh>
      {finePointer && (
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          enableDamping
          dampingFactor={0.08}
          rotateSpeed={0.6}
          minPolarAngle={0.5}
          maxPolarAngle={2.6}
        />
      )}
    </Scene>
  );
}
