import { Component, Suspense, useMemo, useRef, type ReactNode } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, RoundedBox, useGLTF } from "@react-three/drei";
import { clone as skeletonClone } from "three/examples/jsm/utils/SkeletonUtils.js";
import { AVATAR_URL } from "@/constants";

export interface FigureProps {
  /** World height of the figure. */
  height?: number;
  /** Where the feet stand. */
  position?: [number, number, number];
  followPointer?: boolean;
  /** Wave once after mounting. */
  wave?: boolean;
  shadow?: boolean;
}

/* Colours picked from Fardeen's portrait: dark swept hair, medium-brown
   skin, light stubble, cream blazer over a black shirt. */
const C = {
  skin: "#b8845f",
  skinDark: "#a3714f",
  hair: "#16131a",
  stubble: "#4d3628",
  blazer: "#e7e0d4",
  blazerDark: "#d6cdbf",
  shirt: "#141416",
  jeans: "#1d2536",
  shoes: "#0f1522",
  eyeWhite: "#f4f1ec",
  iris: "#3b2314",
  pupil: "#0a0806",
  lips: "#8b5a48",
};

const NATURAL_HEIGHT = 2.05;
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

function Capsule({
  radius,
  length,
  color,
  roughness = 0.8,
  ...rest
}: {
  radius: number;
  length: number;
  color: string;
  roughness?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
}) {
  return (
    <mesh {...rest} castShadow>
      <capsuleGeometry args={[radius, length, 6, 16]} />
      <meshStandardMaterial color={color} roughness={roughness} />
    </mesh>
  );
}

function Eye({ x }: { x: number }) {
  return (
    <group position={[x, 1.845, 0.155]}>
      <mesh scale={[1, 0.8, 0.6]}>
        <sphereGeometry args={[0.032, 20, 14]} />
        <meshStandardMaterial color={C.eyeWhite} roughness={0.35} />
      </mesh>
      <mesh position={[0, 0, 0.02]}>
        <sphereGeometry args={[0.017, 16, 12]} />
        <meshStandardMaterial color={C.iris} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0, 0.031]}>
        <sphereGeometry args={[0.008, 10, 8]} />
        <meshStandardMaterial color={C.pupil} roughness={0.2} />
      </mesh>
      <mesh position={[0.007, 0.008, 0.036]}>
        <sphereGeometry args={[0.003, 6, 6]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
    </group>
  );
}

function Arm({
  side,
  armRef,
  forearmRef,
}: {
  side: 1 | -1;
  armRef: React.RefObject<THREE.Group>;
  forearmRef: React.RefObject<THREE.Group>;
}) {
  return (
    <group ref={armRef} position={[side * 0.3, 1.49, 0]} rotation={[0, 0, side * 0.1]}>
      <mesh castShadow scale={[1, 0.85, 1]}>
        <sphereGeometry args={[0.082, 20, 16]} />
        <meshStandardMaterial color={C.blazer} roughness={0.85} />
      </mesh>
      <Capsule radius={0.062} length={0.26} color={C.blazer} position={[0, -0.21, 0]} />
      <group ref={forearmRef} position={[0, -0.42, 0]}>
        <Capsule radius={0.054} length={0.22} color={C.blazerDark} position={[0, -0.14, 0.01]} />
        <mesh position={[0, -0.31, 0.02]} scale={[0.85, 1.1, 0.6]} castShadow>
          <sphereGeometry args={[0.058, 18, 14]} />
          <meshStandardMaterial color={C.skin} roughness={0.65} />
        </mesh>
      </group>
    </group>
  );
}

/** A stylized person built from primitives: breathing, blinking, looking, waving. */
function ProceduralFigure({
  height = 1.8,
  position = [0, 0, 0],
  followPointer = true,
  wave = true,
  shadow = true,
}: FigureProps) {
  const root = useRef<THREE.Group>(null);
  const torso = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);
  const eyes = useRef<THREE.Group>(null);
  const leftArm = useRef<THREE.Group>(null);
  const leftForearm = useRef<THREE.Group>(null);
  const rightArm = useRef<THREE.Group>(null);
  const rightForearm = useRef<THREE.Group>(null);
  const pointer = useThree((s) => s.pointer);
  const start = useRef<number | null>(null);
  const nextBlink = useRef(2);
  const blinkUntil = useRef(0);
  const scale = height / NATURAL_HEIGHT;

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (start.current === null) start.current = t;
    const age = t - start.current;
    const px = followPointer ? pointer.x : 0;
    const py = followPointer ? pointer.y : 0;

    if (root.current) {
      root.current.rotation.y = lerp(root.current.rotation.y, px * 0.35 + Math.sin(t * 0.5) * 0.03, 0.06);
      root.current.position.y = position[1] + Math.sin(t * 1.5) * 0.004;
    }
    if (torso.current) torso.current.scale.y = 1 + Math.sin(t * 1.5) * 0.012;
    if (head.current) {
      head.current.rotation.y = lerp(head.current.rotation.y, px * 0.45, 0.08);
      head.current.rotation.x = lerp(head.current.rotation.x, -py * 0.25, 0.08);
      head.current.rotation.z = lerp(head.current.rotation.z, px * 0.05, 0.08);
    }

    // Blink
    if (t > nextBlink.current) {
      blinkUntil.current = t + 0.12;
      nextBlink.current = t + 2.5 + Math.random() * 3.5;
    }
    if (eyes.current) eyes.current.scale.y = t < blinkUntil.current ? 0.1 : 1;

    // Idle arm sway
    if (leftArm.current) leftArm.current.rotation.x = Math.sin(t * 1.5) * 0.05;
    if (rightArm.current) {
      let raise = 0;
      let wag = 0;
      if (wave && age > 0.4 && age < 3.2) {
        const k = age - 0.4;
        const env = k < 0.5 ? k / 0.5 : k > 2.3 ? Math.max(0, 1 - (k - 2.3) / 0.5) : 1;
        raise = env;
        wag = Math.sin(k * 11) * 0.45 * env;
      }
      rightArm.current.rotation.z = lerp(rightArm.current.rotation.z, -0.12 - raise * 2.35, 0.15);
      rightArm.current.rotation.x = Math.sin(t * 1.5 + 1) * 0.05 * (1 - raise);
      if (rightForearm.current) rightForearm.current.rotation.z = lerp(rightForearm.current.rotation.z, wag - raise * 0.5, 0.2);
    }
  });

  return (
    <group ref={root} position={position}>
      <group scale={scale}>
        {/* Shoes */}
        {[-1, 1].map((s) => (
          <RoundedBox key={s} args={[0.17, 0.09, 0.3]} radius={0.035} position={[s * 0.125, 0.045, 0.04]} castShadow>
            <meshStandardMaterial color={C.shoes} roughness={0.55} />
          </RoundedBox>
        ))}
        {/* Legs */}
        {[-1, 1].map((s) => (
          <Capsule key={s} radius={0.095} length={0.62} color={C.jeans} position={[s * 0.125, 0.5, 0]} roughness={0.9} />
        ))}
        {/* Hips */}
        <RoundedBox args={[0.42, 0.24, 0.27]} radius={0.09} position={[0, 0.9, 0]} castShadow>
          <meshStandardMaterial color={C.jeans} roughness={0.9} />
        </RoundedBox>

        {/* Torso: blazer over a black shirt */}
        <group ref={torso} position={[0, 0.98, 0]}>
          <RoundedBox args={[0.5, 0.3, 0.29]} radius={0.09} position={[0, 0.42, 0]} castShadow>
            <meshStandardMaterial color={C.blazer} roughness={0.85} />
          </RoundedBox>
          <RoundedBox args={[0.44, 0.32, 0.26]} radius={0.08} position={[0, 0.16, 0]} castShadow>
            <meshStandardMaterial color={C.blazer} roughness={0.85} />
          </RoundedBox>
          <mesh position={[0, 0.36, 0.146]}>
            <boxGeometry args={[0.15, 0.36, 0.012]} />
            <meshStandardMaterial color={C.shirt} roughness={0.7} />
          </mesh>
          {[-1, 1].map((s) => (
            <mesh key={s} position={[s * 0.1, 0.42, 0.152]} rotation={[0, 0, s * 0.35]}>
              <boxGeometry args={[0.07, 0.24, 0.012]} />
              <meshStandardMaterial color={C.blazerDark} roughness={0.85} />
            </mesh>
          ))}
        </group>

        <Arm side={-1} armRef={leftArm} forearmRef={leftForearm} />
        <Arm side={1} armRef={rightArm} forearmRef={rightForearm} />

        {/* Neck */}
        <mesh position={[0, 1.6, 0]}>
          <cylinderGeometry args={[0.065, 0.078, 0.1, 16]} />
          <meshStandardMaterial color={C.skinDark} roughness={0.65} />
        </mesh>

        {/* Head */}
        <group ref={head} position={[0, 1.83, 0]}>
          <group position={[0, -1.83, 0]}>
            <mesh position={[0, 1.83, 0]} scale={[0.96, 1.12, 1]} castShadow>
              <sphereGeometry args={[0.2, 32, 24]} />
              <meshStandardMaterial color={C.skin} roughness={0.62} />
            </mesh>
            {/* Stubble along the jaw */}
            <mesh position={[0, 1.83, 0.01]} scale={[1.005, 1.1, 1.005]}>
              <sphereGeometry args={[0.19, 32, 24, 0, Math.PI * 2, Math.PI * 0.6, Math.PI * 0.3]} />
              <meshStandardMaterial color={C.stubble} roughness={0.9} transparent opacity={0.45} />
            </mesh>
            {/* Ears */}
            {[-1, 1].map((s) => (
              <mesh key={s} position={[s * 0.19, 1.82, 0]} scale={[0.55, 1, 0.8]}>
                <sphereGeometry args={[0.038, 14, 10]} />
                <meshStandardMaterial color={C.skinDark} roughness={0.7} />
              </mesh>
            ))}
            {/* Hair: cap plus a swept quiff */}
            <mesh position={[0, 1.86, -0.015]} scale={[0.99, 1.08, 1.02]}>
              <sphereGeometry args={[0.205, 32, 20, 0, Math.PI * 2, 0, Math.PI * 0.52]} />
              <meshStandardMaterial color={C.hair} roughness={0.95} />
            </mesh>
            <mesh position={[0.04, 2.0, 0.08]} rotation={[0.25, 0.1, -0.35]} scale={[1.35, 0.55, 1]}>
              <sphereGeometry args={[0.12, 20, 14]} />
              <meshStandardMaterial color={C.hair} roughness={0.95} />
            </mesh>
            <mesh position={[-0.13, 1.96, 0.05]} rotation={[0.2, 0, 0.4]} scale={[1.1, 0.5, 0.9]}>
              <sphereGeometry args={[0.11, 20, 14]} />
              <meshStandardMaterial color={C.hair} roughness={0.95} />
            </mesh>
            {/* Brows */}
            {[-1, 1].map((s) => (
              <mesh key={s} position={[s * 0.075, 1.895, 0.165]} rotation={[0, 0, s * 0.12]}>
                <boxGeometry args={[0.075, 0.014, 0.02]} />
                <meshStandardMaterial color={C.hair} roughness={0.9} />
              </mesh>
            ))}
            <group ref={eyes}>
              <Eye x={-0.072} />
              <Eye x={0.072} />
            </group>
            {/* Nose */}
            <mesh position={[0, 1.8, 0.19]} scale={[0.7, 1.15, 0.8]}>
              <sphereGeometry args={[0.03, 14, 12]} />
              <meshStandardMaterial color={C.skinDark} roughness={0.65} />
            </mesh>
            {/* Mouth */}
            <mesh position={[0, 1.735, 0.168]} rotation={[0.1, 0, Math.PI]}>
              <torusGeometry args={[0.038, 0.0065, 8, 18, Math.PI]} />
              <meshStandardMaterial color={C.lips} roughness={0.7} />
            </mesh>
          </group>
        </group>
      </group>

      {shadow && (
        <ContactShadows position={[0, 0.002, 0]} opacity={0.5} scale={2.6 * scale + 1} blur={2.4} far={2.2} />
      )}
    </group>
  );
}

/** A GLB avatar (for example Ready Player Me), scaled to `height`, turning toward the pointer. */
function AvatarFigure({ url, height = 1.8, position = [0, 0, 0], followPointer = true, shadow = true }: FigureProps & { url: string }) {
  const { scene } = useGLTF(url);
  const model = useMemo(() => skeletonClone(scene) as THREE.Group, [scene]);
  const { scale, yOffset } = useMemo(() => {
    const box = new THREE.Box3().setFromObject(model);
    const h = box.max.y - box.min.y || 1;
    const s = height / h;
    return { scale: s, yOffset: -box.min.y * s };
  }, [model, height]);
  const root = useRef<THREE.Group>(null);
  const pointer = useThree((s) => s.pointer);

  useFrame((state) => {
    if (!root.current) return;
    const px = followPointer ? pointer.x : 0;
    root.current.rotation.y = lerp(root.current.rotation.y, px * 0.4 + Math.sin(state.clock.elapsedTime * 0.5) * 0.03, 0.06);
  });

  return (
    <group ref={root} position={position}>
      <group scale={scale} position={[0, yOffset, 0]}>
        <primitive object={model} />
      </group>
      {shadow && <ContactShadows position={[0, 0.002, 0]} opacity={0.5} scale={3} blur={2.4} far={2.2} />}
    </group>
  );
}

class AvatarBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

/**
 * Fardeen as a 3D figure. Uses the avatar at VITE_AVATAR_URL when set (and
 * loadable), otherwise the stylized procedural figure.
 */
export default function HumanFigure(props: FigureProps) {
  const procedural = <ProceduralFigure {...props} />;
  if (!AVATAR_URL) return procedural;
  return (
    <AvatarBoundary fallback={procedural}>
      <Suspense fallback={procedural}>
        <AvatarFigure url={AVATAR_URL} {...props} />
      </Suspense>
    </AvatarBoundary>
  );
}
