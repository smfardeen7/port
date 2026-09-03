import { useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { BOSS_FRAME, DEFAULT_PALETTE } from "@/game/sprites";
import { useBossFx } from "@/three/bossState";
import Scene from "./Scene";
import VoxelModel from "./VoxelModel";
import type { SceneProps } from "./Lazy3D";

const ONE = new THREE.Vector3(1, 1, 1);
const SMALL = new THREE.Vector3(0.3, 0.3, 0.3);

function Boss() {
  const hit = useBossFx((s) => s.hit);
  const defeated = useBossFx((s) => s.defeated);
  const group = useRef<THREE.Group>(null);
  const light = useRef<THREE.PointLight>(null);
  const hitAt = useRef(-10);
  const lastHit = useRef(hit);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (hit !== lastHit.current) {
      lastHit.current = hit;
      hitAt.current = t;
    }
    const g = group.current;
    if (!g) return;
    const k = Math.max(0, 1 - (t - hitAt.current) / 0.5);
    const pulse = Math.sin(k * Math.PI);

    if (defeated) {
      g.rotation.z += (1.15 - g.rotation.z) * 0.06;
      g.position.y += (-0.9 - g.position.y) * 0.05;
      g.scale.lerp(SMALL, 0.05);
    } else {
      g.rotation.z += (0 - g.rotation.z) * 0.1;
      g.position.y += (0 - g.position.y) * 0.1;
      g.scale.lerp(ONE, 0.1);
      g.position.z = -0.8 * pulse;
      g.rotation.x = -0.3 * pulse;
    }
    if (light.current) light.current.intensity = 2 + 40 * pulse;
  });

  return (
    <group ref={group}>
      <VoxelModel
        map={BOSS_FRAME}
        palette={DEFAULT_PALETTE}
        scale={0.13}
        glowColor="#ef4444"
        glowIntensity={1.2}
        position={[0, -0.25, 0]}
        bob={0.1}
        turn={0.35}
      />
      <pointLight ref={light} color="#ef4444" position={[0, 0.5, 2]} distance={8} intensity={2} />
    </group>
  );
}

/** The Hiring Manager in voxels: hovers, recoils on a hit, topples when beaten. */
export default function BossModel({ active }: SceneProps) {
  return (
    <Scene active={active} camera={{ position: [0, 0.3, 6.2], fov: 40 }}>
      <ambientLight intensity={0.8} />
      <directionalLight position={[3, 5, 4]} intensity={1.3} />
      <pointLight position={[-3, 2, 3]} intensity={6} color="#a78bfa" distance={12} />
      <Boss />
    </Scene>
  );
}
