import { useMemo } from "react";
import { useThree } from "@react-three/fiber";
import { Sparkles, Stars } from "@react-three/drei";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import { accentColor, isDarkTheme } from "@/three/support";
import Scene from "./Scene";
import HumanFigure from "./HumanFigure";
import NeonFloor from "./NeonFloor";
import type { SceneProps } from "./Lazy3D";

/** Stands Fardeen beside the title on wide screens, behind it on phones. */
function Player() {
  const aspect = useThree((s) => s.viewport.aspect);
  const narrow = aspect < 0.9;
  return (
    <HumanFigure
      height={narrow ? 1.7 : 1.85}
      position={narrow ? [0, 0, -5.4] : [-3.1, 0, -0.2]}
      followPointer
      wave
      shadow
    />
  );
}

/** Title screen backdrop: neon floor, stars, and the voxel player. */
export default function TitleScene({ active }: SceneProps) {
  const accent = useMemo(accentColor, []);
  const fogColor = isDarkTheme() ? "#0b1120" : "#e9eef6";

  return (
    <Scene active={active} camera={{ position: [0, 1.7, 8], fov: 46 }}>
      <fog attach="fog" args={[fogColor, 7, 26]} />
      <ambientLight intensity={0.7} />
      <directionalLight position={[3, 6, 3]} intensity={1.3} />
      <pointLight position={[0, 3, 2]} intensity={14} color={accent} distance={14} />
      <pointLight position={[-4, 2.5, -2.5]} intensity={10} color={accent} distance={8} />
      <hemisphereLight args={["#bfe3ff", "#0b1120", 0.5]} />
      <Stars radius={70} depth={30} count={1400} factor={3} saturation={0} fade speed={0.4} />
      <Sparkles count={70} scale={[16, 6, 10]} position={[0, 3, 0]} size={2.5} speed={0.25} color="#7dd3fc" />
      <NeonFloor color={accent} />
      <Player />
      <EffectComposer>
        <Bloom mipmapBlur luminanceThreshold={0.55} luminanceSmoothing={0.2} intensity={0.8} />
      </EffectComposer>
    </Scene>
  );
}
