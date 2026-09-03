import * as THREE from "three";
import type { IconType } from "react-icons";
import { rasterizeIcons } from "@/game/icons";

const iconCache = new Map<string, Promise<THREE.Texture[]>>();

function toTexture(img: HTMLImageElement | null, size: number): THREE.Texture {
  // Draw onto a canvas so a failed icon still yields a valid (empty) texture
  // and so the GPU gets a plain bitmap rather than an SVG-backed image.
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (ctx && img) {
    const pad = size * 0.12;
    ctx.drawImage(img, pad, pad, size - pad * 2, size - pad * 2);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.generateMipmaps = false;
  return tex;
}

/**
 * Rasterize a list of react-icons into textures. `key` identifies the icon
 * list (icon function names are minified in production, so callers name it).
 */
export function iconTextures(
  key: string,
  icons: IconType[],
  color: string,
  size = 128
): Promise<THREE.Texture[]> {
  const id = `${key}|${color}|${size}`;
  let p = iconCache.get(id);
  if (!p) {
    p = rasterizeIcons(icons, color, size).then((imgs) => imgs.map((img) => toTexture(img, size)));
    iconCache.set(id, p);
  }
  return p;
}

let halo: THREE.Texture | null = null;

/** Soft radial white disc, used as an additive glow behind sprites. */
export function haloTexture(): THREE.Texture {
  if (halo) return halo;
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, "rgba(255,255,255,0.9)");
  g.addColorStop(0.35, "rgba(255,255,255,0.35)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  halo = new THREE.CanvasTexture(canvas);
  halo.colorSpace = THREE.SRGBColorSpace;
  return halo;
}
