import { useEffect, useRef } from "react";
import {
  DEFAULT_PALETTE,
  PLAYER_FRAMES,
  drawPixelMap,
  pixelMapSize,
  type Palette,
  type PlayerFrame,
} from "@/game/sprites";

interface Props {
  /** Player frame to draw (ignored when `map` is given). */
  frame?: PlayerFrame;
  /** Any pixel map, e.g. BOSS_FRAME. */
  map?: string[];
  scale?: number;
  palette?: Palette;
  className?: string;
}

/** Draws one pixel-map frame to a crisp canvas. Decorative only. */
export default function PixelSprite({
  frame = "idle",
  map,
  scale = 3,
  palette = DEFAULT_PALETTE,
  className = "",
}: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  const pixels = map ?? PLAYER_FRAMES[frame];
  const { w, h } = pixelMapSize(pixels);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = w * scale * dpr;
    canvas.height = h * scale * dpr;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w * scale, h * scale);
    drawPixelMap(ctx, pixels, 0, 0, scale, palette);
  }, [pixels, scale, palette, w, h]);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className={`pixelated ${className}`}
      style={{ width: w * scale, height: h * scale }}
    />
  );
}
