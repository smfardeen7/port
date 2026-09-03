import { Suspense, type ReactNode } from "react";
import { Canvas, type CanvasProps } from "@react-three/fiber";

interface Props {
  /** Render frames only while true (in view and tab visible). */
  active: boolean;
  dpr?: [number, number] | number;
  camera?: CanvasProps["camera"];
  className?: string;
  children: ReactNode;
}

/** Shared <Canvas> setup: transparent, DPR-clamped, paused when inactive. */
export default function Scene({ active, dpr = [1, 1.5], camera, className = "", children }: Props) {
  return (
    <Canvas
      className={className}
      frameloop={active ? "always" : "never"}
      dpr={dpr}
      camera={camera}
      gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
      style={{ position: "absolute", inset: 0 }}
    >
      <Suspense fallback={null}>{children}</Suspense>
    </Canvas>
  );
}
