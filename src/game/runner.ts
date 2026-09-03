/**
 * Skill Run world simulation. Pure and frame-based: the component calls
 * `step` at a fixed 60 Hz and draws whatever is in the world afterwards.
 * Units are logical pixels in a 520×260 world.
 */
export const WORLD = {
  width: 520,
  height: 260,
  groundY: 214,
  gravity: 0.55,
  jumpVelocity: -9.6,
  playerX: 64,
  playerW: 26,
  playerH: 36,
  coinSize: 26,
  bugW: 28,
  bugH: 18,
  baseSpeed: 4,
  maxSpeed: 8,
  invulnFrames: 45,
  maxHearts: 3,
  spawnMin: 70,
  spawnMax: 110,
} as const;

/** Number of distinct coin icons the renderer provides. */
export const ICON_COUNT = 12;

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Entity extends Rect {
  id: number;
  kind: "coin" | "bug";
  /** Index into the icon set (coins only). */
  icon: number;
}

export type RunnerEvent =
  | { type: "coin"; x: number; y: number }
  | { type: "hurt" }
  | { type: "over" }
  | { type: "jump" };

export interface RunnerInput {
  jump: boolean;
}

export interface RunnerWorld {
  frame: number;
  status: "ready" | "playing" | "over";
  player: { y: number; vy: number; grounded: boolean };
  entities: Entity[];
  score: number;
  hearts: number;
  speed: number;
  invuln: number;
  nextSpawn: number;
  nextId: number;
  /** Events raised by the most recent step. */
  events: RunnerEvent[];
}

export function createWorld(): RunnerWorld {
  return {
    frame: 0,
    status: "ready",
    player: { y: WORLD.groundY - WORLD.playerH, vy: 0, grounded: true },
    entities: [],
    score: 0,
    hearts: WORLD.maxHearts,
    speed: WORLD.baseSpeed,
    invuln: 0,
    nextSpawn: 40,
    nextId: 1,
    events: [],
  };
}

/** Reset the world in place and start playing. */
export function startWorld(w: RunnerWorld): RunnerWorld {
  Object.assign(w, createWorld(), { status: "playing" });
  return w;
}

export function intersects(a: Rect, b: Rect, inset = 4): boolean {
  return (
    a.x + inset < b.x + b.w - inset &&
    a.x + a.w - inset > b.x + inset &&
    a.y + inset < b.y + b.h - inset &&
    a.y + a.h - inset > b.y + inset
  );
}

function spawn(w: RunnerWorld, rng: () => number) {
  const isBug = rng() < 0.4;
  const high = rng() < 0.45;
  const x = WORLD.width + 10;
  if (isBug) {
    w.entities.push({
      id: w.nextId++,
      kind: "bug",
      x,
      y: WORLD.groundY - WORLD.bugH,
      w: WORLD.bugW,
      h: WORLD.bugH,
      icon: 0,
    });
  } else {
    w.entities.push({
      id: w.nextId++,
      kind: "coin",
      x,
      y: WORLD.groundY - WORLD.coinSize - (high ? 78 : 4),
      w: WORLD.coinSize,
      h: WORLD.coinSize,
      icon: Math.floor(rng() * ICON_COUNT),
    });
  }
  w.nextSpawn =
    WORLD.spawnMin + Math.floor(rng() * (WORLD.spawnMax - WORLD.spawnMin));
}

/** Advance the world one frame. Mutates and returns `w`. */
export function step(
  w: RunnerWorld,
  input: RunnerInput,
  rng: () => number
): RunnerWorld {
  w.events = [];
  if (w.status !== "playing") return w;
  w.frame++;

  const p = w.player;
  if (input.jump && p.grounded) {
    p.vy = WORLD.jumpVelocity;
    p.grounded = false;
    w.events.push({ type: "jump" });
  }
  p.vy += WORLD.gravity;
  p.y += p.vy;
  const floor = WORLD.groundY - WORLD.playerH;
  if (p.y >= floor) {
    p.y = floor;
    p.vy = 0;
    p.grounded = true;
  }

  w.speed = Math.min(
    WORLD.maxSpeed,
    WORLD.baseSpeed + Math.floor(w.score / 10) * 0.15
  );

  if (--w.nextSpawn <= 0) spawn(w, rng);
  if (w.invuln > 0) w.invuln--;

  const box: Rect = { x: WORLD.playerX, y: p.y, w: WORLD.playerW, h: WORLD.playerH };
  const keep: Entity[] = [];
  for (const e of w.entities) {
    e.x -= w.speed;
    if (e.x + e.w < -20) continue;
    if (intersects(box, e)) {
      if (e.kind === "coin") {
        w.score++;
        w.events.push({ type: "coin", x: e.x, y: e.y });
        continue;
      }
      if (w.invuln === 0) {
        w.hearts--;
        w.invuln = WORLD.invulnFrames;
        w.events.push({ type: "hurt" });
        if (w.hearts <= 0) {
          w.status = "over";
          w.events.push({ type: "over" });
        }
      }
    }
    keep.push(e);
  }
  w.entities = keep;
  return w;
}
