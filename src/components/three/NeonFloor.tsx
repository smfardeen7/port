import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform float uTime;
  uniform float uSpeed;
  uniform vec3 uColor;
  varying vec2 vUv;
  void main() {
    vec2 uv = vUv * 28.0;
    uv.y -= uTime * uSpeed;
    vec2 g = abs(fract(uv - 0.5) - 0.5) / fwidth(uv);
    float line = 1.0 - min(min(g.x, g.y), 1.0);
    float d = distance(vUv, vec2(0.5));
    float fade = 1.0 - smoothstep(0.1, 0.48, d);
    float alpha = line * fade;
    gl_FragColor = vec4(uColor * (0.8 + 0.7 * line), alpha * 0.9);
  }
`;

interface Props {
  color?: string;
  speed?: number;
}

/** Infinite-looking neon grid that scrolls toward the camera. */
export default function NeonFloor({ color = "#38bdf8", speed = 0.35 }: Props) {
  const material = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uSpeed: { value: speed },
      uColor: { value: new THREE.Color(color) },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  useFrame((_, dt) => {
    if (material.current) material.current.uniforms.uTime.value += Math.min(dt, 0.05);
  });

  return (
    <mesh rotation-x={-Math.PI / 2}>
      <planeGeometry args={[80, 80]} />
      <shaderMaterial
        ref={material}
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent
        depthWrite={false}
      />
    </mesh>
  );
}
