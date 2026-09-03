/**
 * Pixel-map sprites. Each frame is an array of equal-length strings; every
 * character is a palette key and "." is transparent. No image assets needed.
 */
export type Palette = Record<string, string>;

export const DEFAULT_PALETTE: Palette = {
  h: "#1f2937", // hair
  k: "#f1c27d", // skin
  e: "#0f172a", // eye
  s: "#38bdf8", // shirt (accent)
  p: "#1e3a8a", // pants
  b: "#111827", // boots
  w: "#f8fafc", // white
  r: "#ef4444", // red
  g: "#34d399", // green
  d: "#334155", // dark slate
  y: "#fbbf24", // yellow
};

export type PlayerFrame = "idle" | "run1" | "run2" | "jump";

// 12 × 16
export const PLAYER_FRAMES: Record<PlayerFrame, string[]> = {
  idle: [
    "....hhhh....",
    "...hhhhhh...",
    "...hhkkkh...",
    "...kkkkkk...",
    "...kekkek...",
    "...kkkkkk...",
    "....kkkk....",
    "...ssssss...",
    "..ssssssss..",
    "..s.ssss.s..",
    "..k.ssss.k..",
    "....pppp....",
    "....pppp....",
    "....p..p....",
    "...bb..bb...",
    "...bb..bb...",
  ],
  run1: [
    "....hhhh....",
    "...hhhhhh...",
    "...hhkkkh...",
    "...kkkkkk...",
    "...kekkek...",
    "...kkkkkk...",
    "....kkkk....",
    "...ssssss...",
    "..ssssssss..",
    ".s..ssss..s.",
    ".k..ssss..k.",
    "....pppp....",
    "...pp..pp...",
    "..pp....pp..",
    ".bb......bb.",
    ".bb......bb.",
  ],
  run2: [
    "....hhhh....",
    "...hhhhhh...",
    "...hhkkkh...",
    "...kkkkkk...",
    "...kekkek...",
    "...kkkkkk...",
    "....kkkk....",
    "...ssssss...",
    "..ssssssss..",
    "..s.ssss.s..",
    "..k.ssss.k..",
    "....pppp....",
    "....pppp....",
    ".....pp.....",
    "....bbbb....",
    "....bb......",
  ],
  jump: [
    "....hhhh....",
    "...hhhhhh...",
    "...hhkkkh...",
    "...kkkkkk...",
    "...kekkek...",
    "...kkkkkk...",
    "....kkkk....",
    ".k.ssssss.k.",
    ".s.ssssss.s.",
    "..ssssssss..",
    "....ssss....",
    "....pppp....",
    "...pp..pp...",
    "...bb..bb...",
    "............",
    "............",
  ],
};

// 14 × 9 — a beetle
export const BUG_FRAME: string[] = [
  "...d......d...",
  "....d....d....",
  "...rrrrrrrr...",
  "..rrdrrrrdrr..",
  ".rrrrrrrrrrrr.",
  ".rrdrrrrrrdrr.",
  "..rrrrrrrrrr..",
  ".d..d....d..d.",
  "d..d......d..d",
];

// 20 × 20 — The Hiring Manager (suit, red tie)
export const BOSS_FRAME: string[] = [
  "......hhhhhhhh......",
  ".....hhhhhhhhhh.....",
  ".....hhkkkkkkhh.....",
  ".....kkkkkkkkkk.....",
  ".....kkekkkkekk.....",
  ".....kkkkkkkkkk.....",
  ".....kkkddddkkk.....",
  "......kkkkkkkk......",
  "....ddddwwwwdddd....",
  "...dddddwrrwddddd...",
  "..dddddddrrddddddd..",
  "..dd.ddddrrdddd.dd..",
  "..dd.ddddrrdddd.dd..",
  "..kk.dddddddddd.kk..",
  ".....dddddddddd.....",
  ".....dddddddddd.....",
  ".....ddd....ddd.....",
  ".....ddd....ddd.....",
  "....bbbb....bbbb....",
  "....bbbb....bbbb....",
];

export function pixelMapSize(map: string[]) {
  return { w: map[0]?.length ?? 0, h: map.length };
}

/** Draw a pixel map with its top-left corner at (x, y). */
export function drawPixelMap(
  ctx: CanvasRenderingContext2D,
  map: string[],
  x: number,
  y: number,
  scale: number,
  palette: Palette = DEFAULT_PALETTE
) {
  for (let row = 0; row < map.length; row++) {
    const line = map[row];
    for (let col = 0; col < line.length; col++) {
      const key = line[col];
      if (key === ".") continue;
      const color = palette[key];
      if (!color) continue;
      ctx.fillStyle = color;
      ctx.fillRect(x + col * scale, y + row * scale, scale, scale);
    }
  }
}
