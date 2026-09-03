/**
 * Turn a pixel map (see game/sprites.ts) into a list of unit cubes. Pure.
 * x is centred on the sprite, y grows upward, z is the extrusion depth.
 */
export interface Voxel {
  x: number;
  y: number;
  z: number;
  color: string;
  /** Rendered with an emissive material so bloom makes it glow. */
  glow: boolean;
}

const HEAD_KEYS = new Set(["h", "k", "e"]);
const GLOW_KEYS = new Set(["s", "r"]);

export function voxelsFromPixelMap(
  map: string[],
  palette: Record<string, string>
): Voxel[] {
  const h = map.length;
  const w = map[0]?.length ?? 0;
  const out: Voxel[] = [];
  for (let row = 0; row < h; row++) {
    const line = map[row];
    for (let col = 0; col < w; col++) {
      const key = line[col];
      if (key === "." || !(key in palette)) continue;
      const color = palette[key];
      const depth = HEAD_KEYS.has(key) ? 4 : 3;
      const glow = GLOW_KEYS.has(key);
      const x = col - (w - 1) / 2;
      const y = (h - 1) / 2 - row;
      for (let i = 0; i < depth; i++) {
        out.push({ x, y, z: i - (depth - 1) / 2, color, glow });
      }
    }
  }
  return out;
}

export function voxelBounds(voxels: Voxel[]) {
  const b = {
    minX: Infinity,
    maxX: -Infinity,
    minY: Infinity,
    maxY: -Infinity,
    minZ: Infinity,
    maxZ: -Infinity,
  };
  for (const v of voxels) {
    b.minX = Math.min(b.minX, v.x);
    b.maxX = Math.max(b.maxX, v.x);
    b.minY = Math.min(b.minY, v.y);
    b.maxY = Math.max(b.maxY, v.y);
    b.minZ = Math.min(b.minZ, v.z);
    b.maxZ = Math.max(b.maxZ, v.z);
  }
  return b;
}
