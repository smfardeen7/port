import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { mulberry32 } from "@/game/boss";
import Scene from "./Scene";
import type { SceneProps } from "./Lazy3D";

const COUNT = 90;
const COLORS = ["#38bdf8", "#a78bfa", "#34d399", "#fbbf24", "#94a3b8"];

const dummy = new THREE.Object3D();
const color = new THREE.Color();

function Cubes() {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const group = useRef<THREE.Group>(null);
  const pointer = useRef({ x: 0, y: 0 });
  const scroll = useRef(0);

  const items = useMemo(() => {
    const rng = mulberry32(2026);
    return Array.from({ length: COUNT }, (_, i) => ({
      x: (rng() - 0.5) * 34,
      y: (rng() - 0.5) * 20,
      z: -9 + rng() * 10,
      size: 0.12 + rng() * 0.34,
      speed: 0.2 + rng() * 0.5,
      phase: rng() * Math.PI * 2,
      rot: rng() * Math.PI,
      color: COLORS[i % COLORS.length],
    }));
  }, []);

  // The canvas ignores pointer events (it sits behind the page), so read
  // the pointer and scroll position from the window instead.
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    const onScroll = () => {
      scroll.current = window.scrollY;
    };
    onScroll();
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useLayoutEffect(() => {
    const m = mesh.current;
    if (!m) return;
    items.forEach((it, i) => m.setColorAt(i, color.set(it.color)));
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  }, [items]);

  useFrame((state) => {
    const m = mesh.current;
    const g = group.current;
    if (!m || !g) return;
    const t = state.clock.elapsedTime;
    items.forEach((it, i) => {
      dummy.position.set(it.x, it.y + Math.sin(t * it.speed + it.phase) * 0.6, it.z);
      dummy.rotation.set(it.rot + t * 0.15 * it.speed, it.rot * 1.3 + t * 0.1, 0);
      dummy.scale.setScalar(it.size);
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
    });
    m.instanceMatrix.needsUpdate = true;

    g.position.x += (pointer.current.x * 0.8 - g.position.x) * 0.04;
    const targetY = pointer.current.y * 0.5 + scroll.current * 0.0012;
    g.position.y += (targetY - g.position.y) * 0.06;
  });

  return (
    <group ref={group}>
      <instancedMesh ref={mesh} args={[undefined, undefined, COUNT]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          transparent
          opacity={0.3}
          roughness={0.5}
          emissive="#1e293b"
          emissiveIntensity={0.6}
          depthWrite={false}
        />
      </instancedMesh>
    </group>
  );
}

/** Floating voxel cubes behind the whole page. One draw call, DPR 1. */
export default function Backdrop({ active }: SceneProps) {
  return (
    <Scene active={active} dpr={1} camera={{ position: [0, 0, 14], fov: 55 }}>
      <ambientLight intensity={0.9} />
      <directionalLight position={[4, 6, 6]} intensity={1.1} />
      <Cubes />
    </Scene>
  );
}
