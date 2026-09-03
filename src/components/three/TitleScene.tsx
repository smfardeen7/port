import { useMemo } from "react";
import { Sparkles, Stars } from "@react-three/drei";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import { DEFAULT_PALETTE, PLAYER_FRAMES } from "@/game/sprites";
import { accentColor, isDarkTheme } from "@/three/support";
import Scene from "./Scene";
import VoxelModel from "./VoxelModel";
import NeonFloor from "./NeonFloor";
import type { SceneProps } from "./Lazy3D";

/** Title screen backdrop: neon floor, stars, and the voxel player. */
export default function TitleScene({ active }: SceneProps) {
  const accent = useMemo(accentColor, []);
  const palette = useMemo(() => ({ ...DEFAULT_PALETTE, s: accent }), [accent]);
  const fogColor = isDarkTheme() ? "#0b1120" : "#e9eef6";

  return (
    <Scene active={active} camera={{ position: [0, 1.9, 8], fov: 48 }}>
      <fog attach="fog" args={[fogColor, 7, 26]} />
      <ambientLight intensity={0.7} />
      <directionalLight position={[3, 6, 3]} intensity={1.3} />
      <pointLight position={[0, 3, 2]} intensity={14} color={accent} distance={14} />
      <Stars radius={70} depth={30} count={1400} factor={3} saturation={0} fade speed={0.4} />
      <Sparkles count={70} scale={[16, 6, 10]} position={[0, 3, 0]} size={2.5} speed={0.25} color="#7dd3fc" />
      <NeonFloor color={accent} />
      <VoxelModel
        map={PLAYER_FRAMES.idle}
        palette={palette}
        scale={0.17}
        glowColor={accent}
        grounded
        position={[0, 0, 0.6]}
        bob={0.06}
        turn={0.35}
      />
      <EffectComposer>
        <Bloom mipmapBlur luminanceThreshold={0.55} luminanceSmoothing={0.2} intensity={0.8} />
      </EffectComposer>
    </Scene>
  );
}
