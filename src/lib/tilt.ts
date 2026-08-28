export type PointerPosition = { x: number; y: number };
export type ElementBounds = { left: number; top: number; width: number; height: number };

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

export function getTiltFromPointer(
  pointer: PointerPosition,
  bounds: ElementBounds,
  intensity = 10
) {
  const normalizedX = (pointer.x - bounds.left) / bounds.width - 0.5;
  const normalizedY = (pointer.y - bounds.top) / bounds.height - 0.5;

  const rotateX = clamp(-normalizedY * intensity * 2, -intensity, intensity);
  const rotateY = clamp(normalizedX * intensity * 2, -intensity, intensity);

  return {
    rotateX: Object.is(rotateX, -0) ? 0 : rotateX,
    rotateY: Object.is(rotateY, -0) ? 0 : rotateY,
  };
}
