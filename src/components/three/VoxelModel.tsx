import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { voxelBounds, voxelsFromPixelMap, type Voxel } from "@/three/voxel";

interface Props {
  map: string[];
  palette: Record<string, string>;
  /** World size of one voxel. */
  scale?: number;
  glowColor?: string;
  glowIntensity?: number;
  /** Idle bob amplitude (world units). */
  bob?: number;
  /** Idle turn amplitude (radians). */
  turn?: number;
  followPointer?: boolean;
  position?: [number, number, number];
  /** Put the feet on y = 0 of the group instead of centring the model. */
  grounded?: boolean;
}

const matrix = new THREE.Matrix4();
const color = new THREE.Color();

function fill(mesh: THREE.InstancedMesh | null, voxels: Voxel[], useColors: boolean) {
  if (!mesh) return;
  voxels.forEach((v, i) => {
    matrix.makeTranslation(v.x, v.y, v.z);
    mesh.setMatrixAt(i, matrix);
    if (useColors) mesh.setColorAt(i, color.set(v.color));
  });
  mesh.count = voxels.length;
  mesh.instanceMatrix.needsUpdate = true;
  if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
}

/** A pixel map extruded into instanced cubes, with glowing accent parts. */
export default function VoxelModel({
  map,
  palette,
  scale = 0.12,
  glowColor = "#38bdf8",
  glowIntensity = 1.4,
  bob = 0.15,
  turn = 0.25,
  followPointer = true,
  position = [0, 0, 0],
  grounded = false,
}: Props) {
  const group = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.InstancedMesh>(null);
  const glowRef = useRef<THREE.InstancedMesh>(null);
  const pointer = useThree((s) => s.pointer);

  const { body, glow, bounds } = useMemo(() => {
    const all = voxelsFromPixelMap(map, palette);
    return {
      body: all.filter((v) => !v.glow),
      glow: all.filter((v) => v.glow),
      bounds: voxelBounds(all),
    };
  }, [map, palette]);

  useLayoutEffect(() => {
    fill(bodyRef.current, body, true);
    fill(glowRef.current, glow, false);
  }, [body, glow]);

  useFrame((state) => {
    const g = group.current;
    if (!g) return;
    const t = state.clock.elapsedTime;
    g.position.y = position[1] + Math.sin(t * 2) * bob;
    const targetY = Math.sin(t * 0.8) * turn + (followPointer ? pointer.x * 0.6 : 0);
    const targetX = followPointer ? -pointer.y * 0.2 : 0;
    g.rotation.y += (targetY - g.rotation.y) * 0.08;
    g.rotation.x += (targetX - g.rotation.x) * 0.08;
  });

  const yOffset = grounded ? -(bounds.minY - 0.5) : 0;

  return (
    <group ref={group} position={position}>
      <group scale={scale} position={[0, yOffset * scale, 0]}>
        <instancedMesh ref={bodyRef} args={[undefined, undefined, Math.max(1, body.length)]}>
          <boxGeometry args={[0.96, 0.96, 0.96]} />
          <meshStandardMaterial roughness={0.55} metalness={0.05} />
        </instancedMesh>
        <instancedMesh ref={glowRef} args={[undefined, undefined, Math.max(1, glow.length)]}>
          <boxGeometry args={[0.96, 0.96, 0.96]} />
          <meshStandardMaterial
            color={glowColor}
            emissive={glowColor}
            emissiveIntensity={glowIntensity}
            toneMapped={false}
            roughness={0.4}
          />
        </instancedMesh>
      </group>
    </group>
  );
}
