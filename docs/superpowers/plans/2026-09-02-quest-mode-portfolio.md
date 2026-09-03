# Quest Mode Portfolio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wrap the existing scroll portfolio in a game layer (title screen, HUD, XP/levels, zones, quests, achievements) and add two playable pieces (Skill Run mini-game, boss quiz) without hurting scannability.

**Architecture:** A single zustand store (`src/game/store.ts`) is the source of truth; pure, unit-tested modules (`levels`, `quests`, `boss`, `runner`) hold the rules; React components under `src/components/game/` render the game layer and call store actions. Existing sections stay in place and are lightly modified to report events to the store.

**Tech Stack:** React 18, Vite 5, TypeScript 5, Tailwind 3.4, Framer Motion 11, zustand 5, lenis 1.3, canvas-confetti 1.9, Web Audio API, node:test.

**Spec:** `docs/superpowers/specs/2026-09-02-quest-mode-portfolio-design.md`

## Global Constraints

- Keep React 18 / Vite 5 / TypeScript 5 / Tailwind 3.4 / Framer Motion 11; only add `zustand`, `lenis`, `canvas-confetti`, `@types/canvas-confetti`.
- Node 22.16 runs tests: `node --experimental-strip-types --test "src/**/*.test.ts"`. Pure modules must use `import type` for types and `.ts` extensions on relative imports so Node can load them. No enums, no parameter properties.
- Pure modules (`src/game/{levels,quests,boss,runner,sprites}.ts`) import nothing from `@/…` or `react-icons`.
- Sound is synthesized (Web Audio), off by default, toggle in HUD, persisted.
- Respect `prefers-reduced-motion`: no Lenis, no confetti, short transitions.
- Persist under localStorage key `quest-mode-v1`; transient fields (`started`, `toasts`, `levelUpTo`, `panelOpen`) are not persisted.
- Every interactive element is a `<button>` or `<a>` with an accessible name.
- Commit after each task with the trailer lines from the session (Co-Authored-By + Claude-Session).

---

### Task 1: Dependencies, test script, fonts, Tailwind tokens

**Files:**
- Modify: `package.json` (scripts.test, dependencies)
- Modify: `index.html` (font link)
- Modify: `tailwind.config.ts` (fontFamily.pixel, keyframes)
- Modify: `src/index.css` (lenis rules, pixel utilities)

**Interfaces:**
- Produces: Tailwind classes `font-pixel`, `animate-blink`, `animate-shake`, `animate-pulse-ring`; CSS class `.pixelated` (image-rendering: pixelated).

- [ ] **Step 1: Install packages**

```bash
npm install zustand@^5.0.15 lenis@^1.3.26 canvas-confetti@^1.9.4
npm install -D @types/canvas-confetti@^1.9.0
```

- [ ] **Step 2: Fix the test script**

In `package.json` set:

```json
"test": "node --experimental-strip-types --test \"src/**/*.test.ts\""
```

Run `npm test` → expect the existing 2 tilt tests to pass.

- [ ] **Step 3: Add the pixel font**

In `index.html`, extend the Google Fonts href with `&family=Press+Start+2P`.

- [ ] **Step 4: Tailwind tokens**

In `tailwind.config.ts` add `pixel: ["'Press Start 2P'", "monospace"]` to `fontFamily`, and keyframes/animations:

```ts
blink: { "0%,49%": { opacity: "1" }, "50%,100%": { opacity: "0" } },
shake: { "0%,100%": { transform: "translateX(0)" }, "20%": { transform: "translateX(-6px)" }, "40%": { transform: "translateX(6px)" }, "60%": { transform: "translateX(-4px)" }, "80%": { transform: "translateX(4px)" } },
pulseRing: { "0%": { boxShadow: "0 0 0 0 hsl(var(--accent) / 0.55)" }, "100%": { boxShadow: "0 0 0 14px hsl(var(--accent) / 0)" } },
```
with `animation: { blink: "blink 1s steps(1) infinite", shake: "shake 0.4s ease-in-out", "pulse-ring": "pulseRing 1.4s ease-out infinite" }`.

- [ ] **Step 5: CSS**

Append to `src/index.css` inside `@layer utilities`:

```css
.pixelated { image-rendering: pixelated; }
html.lenis, html.lenis body { height: auto; }
.lenis.lenis-smooth { scroll-behavior: auto !important; }
.lenis.lenis-smooth [data-lenis-prevent] { overscroll-behavior: contain; }
.lenis.lenis-stopped { overflow: hidden; }
```

- [ ] **Step 6: Verify and commit**

Run `npx tsc --noEmit && npm run build` → both succeed. Commit: `chore: add game deps, pixel font, fix test script`.

---

### Task 2: Levels (pure)

**Files:**
- Create: `src/game/levels.ts`
- Test: `src/game/levels.test.ts`

**Interfaces:**
- Produces: `levelFor(xp: number): number` (1-based), `levelInfo(xp: number): LevelInfo`, `LEVEL_THRESHOLDS`, `LEVEL_TITLES`, `MAX_LEVEL`.

- [ ] **Step 1: Write the failing test**

```ts
import assert from "node:assert/strict";
import test from "node:test";
import { levelFor, levelInfo, MAX_LEVEL } from "./levels.ts";

test("0 xp is level 1 Intern with no progress", () => {
  assert.equal(levelFor(0), 1);
  assert.deepEqual(levelInfo(0), { level: 1, title: "Intern", current: 0, next: 100, progress: 0 });
});

test("thresholds are inclusive", () => {
  assert.equal(levelFor(99), 1);
  assert.equal(levelFor(100), 2);
  assert.equal(levelInfo(175).progress, 0.5);
});

test("caps at the max level", () => {
  const info = levelInfo(99999);
  assert.equal(info.level, MAX_LEVEL);
  assert.equal(info.title, "Legend");
  assert.equal(info.next, null);
  assert.equal(info.progress, 1);
});
```

- [ ] **Step 2: Run** `npm test` → fails (module not found).

- [ ] **Step 3: Implement**

```ts
export const LEVEL_THRESHOLDS = [0, 100, 250, 450, 700, 1000, 1400, 1900] as const;
export const LEVEL_TITLES = ["Intern","Junior Dev","Engineer","Senior Engineer","Staff Engineer","Principal","Architect","Legend"] as const;
export const MAX_LEVEL = LEVEL_THRESHOLDS.length;

export interface LevelInfo { level: number; title: string; current: number; next: number | null; progress: number; }

export function levelFor(xp: number): number {
  let level = 1;
  for (let i = 1; i < LEVEL_THRESHOLDS.length; i++) if (xp >= LEVEL_THRESHOLDS[i]) level = i + 1;
  return level;
}

export function levelInfo(xp: number): LevelInfo {
  const level = levelFor(xp);
  const current = LEVEL_THRESHOLDS[level - 1];
  const next = level < MAX_LEVEL ? LEVEL_THRESHOLDS[level] : null;
  const progress = next === null ? 1 : (xp - current) / (next - current);
  return { level, title: LEVEL_TITLES[level - 1], current, next, progress };
}
```

- [ ] **Step 4: Run** `npm test` → pass. **Step 5: Commit** `feat(game): level table`.

---

### Task 3: Quests (pure)

**Files:**
- Create: `src/game/quests.ts`
- Test: `src/game/quests.test.ts`

**Interfaces:**
- Produces: `QuestFacts`, `QuestDef`, `QUESTS`, `questProgress(q, facts)`, `newlyCompleted(facts, completed)`, `EXTRA_ACHIEVEMENTS`.

- [ ] **Step 1: Failing test**

```ts
import assert from "node:assert/strict";
import test from "node:test";
import { QUESTS, newlyCompleted, questProgress, type QuestFacts } from "./quests.ts";

const base: QuestFacts = { zonesDiscovered: 0, zonesTotal: 10, skillsUnlocked: 0, skillsTotal: 52, projectsOpened: 0, projectsTotal: 11, resumeOpened: false, emailSent: false, bestRun: 0, bossDefeated: false, konami: false, themeToggled: false };

test("first-steps completes at three zones", () => {
  assert.deepEqual(newlyCompleted({ ...base, zonesDiscovered: 2 }, []), []);
  assert.deepEqual(newlyCompleted({ ...base, zonesDiscovered: 3 }, []), ["first-steps"]);
});

test("already completed quests are not returned again", () => {
  assert.deepEqual(newlyCompleted({ ...base, zonesDiscovered: 3 }, ["first-steps"]), []);
});

test("progress is clamped to the target", () => {
  const q = QUESTS.find((x) => x.id === "forge-10")!;
  assert.deepEqual(questProgress(q, { ...base, skillsUnlocked: 30 }), { value: 10, target: 10, done: true });
});

test("every quest has a unique id", () => {
  assert.equal(new Set(QUESTS.map((q) => q.id)).size, QUESTS.length);
});
```

- [ ] **Step 2: Run → fail.** **Step 3: Implement**

```ts
export interface QuestFacts { zonesDiscovered: number; zonesTotal: number; skillsUnlocked: number; skillsTotal: number; projectsOpened: number; projectsTotal: number; resumeOpened: boolean; emailSent: boolean; bestRun: number; bossDefeated: boolean; konami: boolean; themeToggled: boolean; }
export interface QuestDef { id: string; title: string; description: string; icon: string; hidden?: boolean; progress: (f: QuestFacts) => { value: number; target: number }; }
const bool = (v: boolean) => ({ value: v ? 1 : 0, target: 1 });
export const QUESTS: QuestDef[] = [
  { id: "first-steps", title: "First Steps", description: "Discover 3 areas of the site.", icon: "👣", progress: (f) => ({ value: f.zonesDiscovered, target: 3 }) },
  { id: "cartographer", title: "Cartographer", description: "Discover every area.", icon: "🗺️", progress: (f) => ({ value: f.zonesDiscovered, target: f.zonesTotal }) },
  { id: "forge-10", title: "Apprentice Smith", description: "Unlock 10 skills in the Skill Forge.", icon: "⚒️", progress: (f) => ({ value: f.skillsUnlocked, target: 10 }) },
  { id: "forge-all", title: "Master Smith", description: "Unlock every skill.", icon: "🔥", progress: (f) => ({ value: f.skillsUnlocked, target: f.skillsTotal }) },
  { id: "loot-3", title: "Loot Hunter", description: "Open 3 project cards.", icon: "💎", progress: (f) => ({ value: f.projectsOpened, target: 3 }) },
  { id: "loot-all", title: "Vault Cleared", description: "Open every project.", icon: "🏆", progress: (f) => ({ value: f.projectsOpened, target: f.projectsTotal }) },
  { id: "resume", title: "Read the Scroll", description: "Open the résumé.", icon: "📜", progress: (f) => bool(f.resumeOpened) },
  { id: "raven", title: "Send a Raven", description: "Copy the email address or open the mail link.", icon: "🕊️", progress: (f) => bool(f.emailSent) },
  { id: "runner-15", title: "Sprinter", description: "Score 15 or more in Skill Run.", icon: "🏃", progress: (f) => ({ value: f.bestRun, target: 15 }) },
  { id: "boss", title: "Hired!", description: "Defeat the Hiring Manager.", icon: "👑", progress: (f) => bool(f.bossDefeated) },
  { id: "theme", title: "Day / Night", description: "Toggle the theme.", icon: "🌗", progress: (f) => bool(f.themeToggled) },
  { id: "konami", title: "Cheat Code", description: "Some codes never die. ↑ ↑ ↓ ↓ ← → ← → B A", icon: "🕹️", hidden: true, progress: (f) => bool(f.konami) },
];
export const EXTRA_ACHIEVEMENTS = [
  { id: "level-5", title: "Halfway There", description: "Reach level 5.", icon: "⭐" },
  { id: "level-8", title: "Legend", description: "Reach the final level.", icon: "🌟" },
];
export function questProgress(q: QuestDef, f: QuestFacts) {
  const { value, target } = q.progress(f);
  const clamped = Math.min(value, target);
  return { value: clamped, target, done: clamped >= target };
}
export function newlyCompleted(f: QuestFacts, completed: readonly string[]): string[] {
  return QUESTS.filter((q) => !completed.includes(q.id) && questProgress(q, f).done).map((q) => q.id);
}
```

- [ ] **Step 4: Run → pass.** **Step 5: Commit** `feat(game): quest definitions and evaluation`.

---

### Task 4: Boss rules (pure)

**Files:**
- Create: `src/game/boss.ts`
- Test: `src/game/boss.test.ts`

**Interfaces:**
- Produces: `QUESTION_BANK`, `mulberry32(seed)`, `createRound(rng, count)`, `initialBoss(count)`, `answer(state, correct)`, types `RoundQuestion`, `BossState`.

- [ ] **Step 1: Failing test**

```ts
import assert from "node:assert/strict";
import test from "node:test";
import { QUESTION_BANK, answer, createRound, initialBoss, mulberry32 } from "./boss.ts";

test("a round draws unique questions with the answer at answerIndex", () => {
  const round = createRound(mulberry32(7), 5);
  assert.equal(round.length, 5);
  assert.equal(new Set(round.map((q) => q.id)).size, 5);
  for (const q of round) {
    assert.equal(q.options.length, 4);
    const bank = QUESTION_BANK.find((b) => b.id === q.id)!;
    assert.equal(q.options[q.answerIndex], bank.answer);
  }
});

test("correct answers drain the boss until it is defeated", () => {
  let s = initialBoss(2);
  s = answer(s, true);
  assert.deepEqual(s, { index: 1, bossHp: 1, hearts: 3, status: "playing" });
  s = answer(s, true);
  assert.equal(s.status, "won");
});

test("three wrong answers lose the fight", () => {
  let s = initialBoss(5);
  s = answer(answer(answer(s, false), false), false);
  assert.equal(s.hearts, 0);
  assert.equal(s.status, "lost");
});

test("running out of questions with boss hp left loses", () => {
  let s = initialBoss(2);
  s = answer(s, false); s = answer(s, false);
  assert.equal(s.status, "lost");
});
```

- [ ] **Step 2: Run → fail.** **Step 3: Implement**

```ts
export interface BankQuestion { id: string; prompt: string; answer: string; distractors: [string, string, string]; }
export interface RoundQuestion { id: string; prompt: string; options: string[]; answerIndex: number; }
export interface BossState { index: number; bossHp: number; hearts: number; status: "playing" | "won" | "lost"; }
export const MAX_HEARTS = 3;
export const QUESTION_BANK: BankQuestion[] = [
  { id: "ms", prompt: "Where is Fardeen pursuing his M.S. in Computer Science?", answer: "George Mason University", distractors: ["Virginia Tech", "University of Maryland", "Georgia Tech"] },
  { id: "intern", prompt: "Which company hosted Fardeen's Cloud AI Summer Internship?", answer: "Quadrant Technologies", distractors: ["Pratham USA", "Ethnus Codemithra", "IEEE Computer Society"] },
  { id: "autism", prompt: "What accuracy did the Autism Detection CNN/LSTM system reach?", answer: "91%", distractors: ["82%", "88.7%", "98%"] },
  { id: "springer", prompt: "Where was the Parkinson's Freezing-of-Gait research published?", answer: "Springer Nature (LNEE)", distractors: ["IEEE Access", "ACM Computing Surveys", "Nature Machine Intelligence"] },
  { id: "airflow", prompt: "Which orchestrator runs the Invoice Intelligence NLP pipelines?", answer: "Apache Airflow", distractors: ["Jenkins", "Kubernetes", "Terraform"] },
  { id: "invoices", prompt: "How many invoices a year does the Invoice Intelligence pipeline process?", answer: "150,000+", distractors: ["15,000+", "1,500+", "1.5 million+"] },
  { id: "k8s", prompt: "The CI/CD project ran its Kubernetes cluster on which cloud?", answer: "AWS", distractors: ["Google Cloud", "Azure", "DigitalOcean"] },
  { id: "xai", prompt: "Which explainability tools does the Loan Default app use?", answer: "SHAP and LIME", distractors: ["Grad-CAM and saliency maps", "Attention rollout", "Partial dependence only"] },
  { id: "ieee", prompt: "How many students took part in the IEEE events Fardeen led?", answer: "700+", distractors: ["70+", "350+", "7,000+"] },
  { id: "anthropic", prompt: "Which certification did Fardeen earn from Anthropic?", answer: "Claude with the Anthropic API", distractors: ["Prompt Engineering for Everyone", "Building with Gemini", "Azure AI Fundamentals"] },
  { id: "ethnus", prompt: "By how much did the automated reminder system at Ethnus cut missed appointments?", answer: "45%", distractors: ["15%", "25%", "80%"] },
  { id: "gala", prompt: "How many attendees did the Pratham USA gala Fardeen coordinated have?", answer: "350+", distractors: ["100+", "700+", "1,000+"] },
  { id: "fxair", prompt: "Which provider powers FXAir's Google / Apple / Facebook sign-in?", answer: "Firebase Auth", distractors: ["Auth0", "Okta", "AWS Cognito"] },
  { id: "btech", prompt: "Where did Fardeen complete his B.Tech?", answer: "Vellore Institute of Technology", distractors: ["IIT Madras", "BITS Pilani", "NIT Trichy"] },
];
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
function shuffle<T>(items: readonly T[], rng: () => number): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [out[i], out[j]] = [out[j], out[i]]; }
  return out;
}
export function createRound(rng: () => number, count = 5): RoundQuestion[] {
  return shuffle(QUESTION_BANK, rng).slice(0, count).map((q) => {
    const options = shuffle([q.answer, ...q.distractors], rng);
    return { id: q.id, prompt: q.prompt, options, answerIndex: options.indexOf(q.answer) };
  });
}
export function initialBoss(count: number): BossState { return { index: 0, bossHp: count, hearts: MAX_HEARTS, status: "playing" }; }
export function answer(s: BossState, correct: boolean): BossState {
  if (s.status !== "playing") return s;
  const bossHp = correct ? s.bossHp - 1 : s.bossHp;
  const hearts = correct ? s.hearts : s.hearts - 1;
  const index = s.index + 1;
  const total = s.bossHp + s.index; // questions in the round
  let status: BossState["status"] = "playing";
  if (bossHp <= 0) status = "won";
  else if (hearts <= 0 || index >= total) status = "lost";
  return { index, bossHp, hearts, status };
}
```

- [ ] **Step 4: Run → pass.** **Step 5: Commit** `feat(game): boss quiz rules`.

---

### Task 5: Runner world (pure)

**Files:**
- Create: `src/game/runner.ts`
- Test: `src/game/runner.test.ts`

**Interfaces:**
- Produces: `WORLD` constants, `RunnerWorld`, `Entity`, `RunnerEvent`, `createWorld()`, `startWorld(w)`, `step(w, input, rng)`, `intersects(a, b, inset)`, `ICON_COUNT` (number of coin icon slots = 12).

- [ ] **Step 1: Failing test**

```ts
import assert from "node:assert/strict";
import test from "node:test";
import { WORLD, createWorld, intersects, startWorld, step } from "./runner.ts";

const rng = () => 0.5;

test("jump only when grounded", () => {
  const w = startWorld(createWorld());
  step(w, { jump: true }, rng);
  assert.equal(w.player.vy, WORLD.jumpVelocity);
  assert.equal(w.player.grounded, false);
  const vyAfter = w.player.vy;
  step(w, { jump: true }, rng);
  assert.ok(w.player.vy > vyAfter, "second jump ignored, gravity applied");
});

test("collecting a coin raises the score and emits an event", () => {
  const w = startWorld(createWorld());
  w.entities.push({ id: 1, kind: "coin", x: WORLD.playerX, y: WORLD.groundY - WORLD.coinSize, w: WORLD.coinSize, h: WORLD.coinSize, icon: 0 });
  step(w, { jump: false }, rng);
  assert.equal(w.score, 1);
  assert.equal(w.entities.length, 0);
  assert.ok(w.events.some((e) => e.type === "coin"));
});

test("a bug costs a heart once per invulnerability window", () => {
  const w = startWorld(createWorld());
  w.entities.push({ id: 1, kind: "bug", x: WORLD.playerX, y: WORLD.groundY - WORLD.bugH, w: WORLD.bugW, h: WORLD.bugH, icon: 0 });
  step(w, { jump: false }, rng);
  assert.equal(w.hearts, WORLD.maxHearts - 1);
  w.entities.push({ id: 2, kind: "bug", x: WORLD.playerX, y: WORLD.groundY - WORLD.bugH, w: WORLD.bugW, h: WORLD.bugH, icon: 0 });
  step(w, { jump: false }, rng);
  assert.equal(w.hearts, WORLD.maxHearts - 1);
});

test("losing all hearts ends the run", () => {
  const w = startWorld(createWorld());
  w.hearts = 1;
  w.entities.push({ id: 1, kind: "bug", x: WORLD.playerX, y: WORLD.groundY - WORLD.bugH, w: WORLD.bugW, h: WORLD.bugH, icon: 0 });
  step(w, { jump: false }, rng);
  assert.equal(w.status, "over");
});

test("the spawner adds entities and speed grows with score", () => {
  const w = startWorld(createWorld());
  for (let i = 0; i < 400; i++) step(w, { jump: false }, rng);
  assert.ok(w.nextId > 1, "spawned something");
  w.score = 20;
  step(w, { jump: false }, rng);
  assert.ok(w.speed > WORLD.baseSpeed);
});

test("intersects uses an inset", () => {
  assert.equal(intersects({ x: 0, y: 0, w: 10, h: 10 }, { x: 9, y: 9, w: 10, h: 10 }, 4), false);
  assert.equal(intersects({ x: 0, y: 0, w: 10, h: 10 }, { x: 4, y: 4, w: 10, h: 10 }, 0), true);
});
```

- [ ] **Step 2: Run → fail.** **Step 3: Implement**

```ts
export const WORLD = { width: 520, height: 260, groundY: 214, gravity: 0.55, jumpVelocity: -9.6, playerX: 64, playerW: 26, playerH: 36, coinSize: 26, bugW: 28, bugH: 18, baseSpeed: 4, maxSpeed: 8, invulnFrames: 45, maxHearts: 3, spawnMin: 70, spawnMax: 110 } as const;
export const ICON_COUNT = 12;
export interface Rect { x: number; y: number; w: number; h: number; }
export interface Entity extends Rect { id: number; kind: "coin" | "bug"; icon: number; }
export type RunnerEvent = { type: "coin"; x: number; y: number } | { type: "hurt" } | { type: "over" } | { type: "jump" };
export interface RunnerInput { jump: boolean; }
export interface RunnerWorld { frame: number; status: "ready" | "playing" | "over"; player: { y: number; vy: number; grounded: boolean }; entities: Entity[]; score: number; hearts: number; speed: number; invuln: number; nextSpawn: number; nextId: number; events: RunnerEvent[]; }
export function createWorld(): RunnerWorld {
  return { frame: 0, status: "ready", player: { y: WORLD.groundY - WORLD.playerH, vy: 0, grounded: true }, entities: [], score: 0, hearts: WORLD.maxHearts, speed: WORLD.baseSpeed, invuln: 0, nextSpawn: 40, nextId: 1, events: [] };
}
export function startWorld(w: RunnerWorld): RunnerWorld { Object.assign(w, createWorld(), { status: "playing" }); return w; }
export function intersects(a: Rect, b: Rect, inset = 4): boolean {
  return a.x + inset < b.x + b.w - inset && a.x + a.w - inset > b.x + inset && a.y + inset < b.y + b.h - inset && a.y + a.h - inset > b.y + inset;
}
export function step(w: RunnerWorld, input: RunnerInput, rng: () => number): RunnerWorld {
  w.events = [];
  if (w.status !== "playing") return w;
  w.frame++;
  const p = w.player;
  if (input.jump && p.grounded) { p.vy = WORLD.jumpVelocity; p.grounded = false; w.events.push({ type: "jump" }); }
  p.vy += WORLD.gravity; p.y += p.vy;
  const floor = WORLD.groundY - WORLD.playerH;
  if (p.y >= floor) { p.y = floor; p.vy = 0; p.grounded = true; }
  w.speed = Math.min(WORLD.maxSpeed, WORLD.baseSpeed + Math.floor(w.score / 10) * 0.15 * 10 / 10);
  if (--w.nextSpawn <= 0) {
    const isBug = rng() < 0.4;
    const high = rng() < 0.45;
    w.entities.push(isBug
      ? { id: w.nextId++, kind: "bug", x: WORLD.width + 10, y: WORLD.groundY - WORLD.bugH, w: WORLD.bugW, h: WORLD.bugH, icon: 0 }
      : { id: w.nextId++, kind: "coin", x: WORLD.width + 10, y: WORLD.groundY - WORLD.coinSize - (high ? 78 : 4), w: WORLD.coinSize, h: WORLD.coinSize, icon: Math.floor(rng() * ICON_COUNT) });
    w.nextSpawn = WORLD.spawnMin + Math.floor(rng() * (WORLD.spawnMax - WORLD.spawnMin));
  }
  if (w.invuln > 0) w.invuln--;
  const box: Rect = { x: WORLD.playerX, y: p.y, w: WORLD.playerW, h: WORLD.playerH };
  const keep: Entity[] = [];
  for (const e of w.entities) {
    e.x -= w.speed;
    if (e.x + e.w < -20) continue;
    if (intersects(box, e)) {
      if (e.kind === "coin") { w.score++; w.events.push({ type: "coin", x: e.x, y: e.y }); continue; }
      if (w.invuln === 0) { w.hearts--; w.invuln = WORLD.invulnFrames; w.events.push({ type: "hurt" }); if (w.hearts <= 0) { w.status = "over"; w.events.push({ type: "over" }); } }
    }
    keep.push(e);
  }
  w.entities = keep;
  return w;
}
```
(Speed formula: `baseSpeed + floor(score/10) * 0.15`, capped at `maxSpeed`. Write it exactly that way.)

- [ ] **Step 4: Run → pass.** **Step 5: Commit** `feat(game): runner world simulation`.

---

### Task 6: Sprites, icons, sound

**Files:**
- Create: `src/game/sprites.ts`, `src/game/icons.ts`, `src/game/sfx.ts`
- Test: `src/game/sprites.test.ts`

**Interfaces:**
- `sprites.ts`: `PLAYER_FRAMES: Record<"idle"|"run1"|"run2"|"jump", string[]>`, `BUG_FRAME: string[]`, `BOSS_FRAME: string[]`, `Palette`, `DEFAULT_PALETTE`, `drawPixelMap(ctx, map, x, y, scale, palette)`, `pixelMapSize(map)`.
- `icons.ts`: `loadIconImages(color: string, size: number): Promise<(HTMLImageElement|null)[]>` returning `ICON_COUNT` images in fixed order `[SiPython, SiTensorflow, SiPytorch, SiReact, SiFastapi, SiDocker, SiKubernetes, FaAws, SiTypescript, SiClaude, SiGit, SiMysql]`, and `RUN_ICON_NAMES` (same order, for the text alternative).
- `sfx.ts`: `unlockAudio()`, `setSoundEnabled(on)`, `sfx.{blip,coin,hurt,jump,unlock,quest,levelUp,win,lose,zone}()`.

- [ ] **Step 1: Test the pixel maps are rectangular and use known keys**

```ts
import assert from "node:assert/strict";
import test from "node:test";
import { BUG_FRAME, BOSS_FRAME, DEFAULT_PALETTE, PLAYER_FRAMES, pixelMapSize } from "./sprites.ts";

for (const [name, map] of [...Object.entries(PLAYER_FRAMES), ["bug", BUG_FRAME], ["boss", BOSS_FRAME]] as [string, string[]][]) {
  test(`${name} frame is rectangular and only uses palette keys`, () => {
    const { w, h } = pixelMapSize(map);
    assert.equal(h, map.length);
    for (const row of map) {
      assert.equal(row.length, w);
      for (const ch of row) assert.ok(ch === "." || ch in DEFAULT_PALETTE, `unknown key ${ch}`);
    }
  });
}
```

- [ ] **Step 2: Implement `sprites.ts`** with keys `h` hair, `k` skin, `e` eye, `s` shirt, `p` pants, `b` boots, `w` white, `r` red, `g` green, `d` dark, `y` yellow. Player frames 12×16; bug 14×9; boss 20×20. `drawPixelMap` fills `fillRect(x + col*scale, y + row*scale, scale, scale)` per non-`.` cell. `DEFAULT_PALETTE` has hex colours; shirt uses `#38bdf8`.

- [ ] **Step 3: Implement `icons.ts`**

```ts
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import type { IconType } from "react-icons";
import { SiPython, SiTensorflow, SiPytorch, SiReact, SiFastapi, SiDocker, SiKubernetes, SiTypescript, SiClaude, SiGit, SiMysql } from "react-icons/si";
import { FaAws } from "react-icons/fa6";
export const RUN_ICONS: IconType[] = [SiPython, SiTensorflow, SiPytorch, SiReact, SiFastapi, SiDocker, SiKubernetes, FaAws, SiTypescript, SiClaude, SiGit, SiMysql];
export const RUN_ICON_NAMES = ["Python","TensorFlow","PyTorch","React","FastAPI","Docker","Kubernetes","AWS","TypeScript","Claude","Git","SQL"];
export function loadIconImages(color: string, size: number) {
  return Promise.all(RUN_ICONS.map((Icon) => new Promise<HTMLImageElement | null>((resolve) => {
    let svg = renderToStaticMarkup(createElement(Icon, { color, size }));
    if (!svg.includes("xmlns=")) svg = svg.replace("<svg", '<svg xmlns="http://www.w3.org/2000/svg"');
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  })));
}
```

- [ ] **Step 4: Implement `sfx.ts`** — lazy `AudioContext`, `tone(freq, { type, dur, gain, at, slideTo })` using an oscillator + gain envelope (attack 5 ms, exponential release). Sounds: blip 880 Hz square 60 ms; coin 988→1319 Hz two 70 ms squares; hurt 220→110 Hz saw 180 ms; jump 300→600 Hz square 90 ms; unlock triangle 523/659/784 at 0/70/140 ms; quest chord 523+659+784 300 ms triangle; levelUp 523/659/784/1047/1319 rising 80 ms apart + 1568 shimmer; win same as levelUp with a low 130 Hz square bed; lose 392→196 saw 400 ms; zone 660/880 sine 120 ms. All no-op when `!enabled || !ctx`.

- [ ] **Step 5: Run tests, typecheck, commit** `feat(game): sprites, icon rasterizer, synthesized sfx`.

---

### Task 7: Store and game data

**Files:**
- Create: `src/game/data.ts`, `src/game/store.ts`

**Interfaces:**
- `data.ts`: `ZONES: { id, name, sectionId }[]` (spawn/home, experience, skills, education, certifications, projects, publications, github, boss, tldr, contact → 11 zones), `XP` constants, `Rarity`, `RARITY_BY_CATEGORY`, `RARITY_STYLES`, `SKILL_TOTAL`, `PROJECT_TOTAL`.
- `store.ts`: `useGame` hook (zustand), `GameState` fields per spec, actions: `start(name?)`, `setName`, `toggleSound`, `discoverZone(id)`, `unlockSkill(id)`, `unlockSkills(ids)`, `openProject(id)`, `finishRun(score)`, `defeatBoss()`, `triggerKonami()`, `markResume()`, `markEmail()`, `markTheme()`, `dismissToast(id)`, `clearLevelUp()`, `setPanel(open)`, `reset()`; selector helper `useLevel()` returning `levelInfo(xp)`; `factsFrom(state): QuestFacts`.

- [ ] **Step 1: Write `data.ts`** with the zone list (names from the spec, plus `boss` = "Boss Arena"), XP table `{ zone: 20, skill: 5, project: 15, coin: 2, coinCap: 60, quest: 50, boss: 150 }`, rarity map `{ Research: "legendary", "AI & ML": "epic", "Full-Stack": "rare", DevOps: "uncommon" }`, rarity styles (label, ring colour class, glow hsl), totals computed from `SKILLS_LIST` and `PROJECTS`.

- [ ] **Step 2: Write `store.ts`**

Core reducer helper used by every action:

```ts
function progress(s: GameState, patch: Partial<GameState>, gained: number, toast?: ToastInput): Partial<GameState> {
  const merged = { ...s, ...patch };
  let xp = merged.xp + gained;
  const toasts = [...merged.toasts];
  if (toast) toasts.push(mkToast({ ...toast, xp: gained || undefined }));
  const quests = [...merged.quests];
  const achievements = [...merged.achievements];
  for (const id of newlyCompleted(factsFrom({ ...merged, xp }), quests)) {
    const q = QUESTS.find((x) => x.id === id)!;
    quests.push(id); achievements.push(id); xp += XP.quest;
    toasts.push(mkToast({ kind: "quest", title: `Quest complete: ${q.title}`, body: q.description, icon: q.icon, xp: XP.quest }));
  }
  const before = levelFor(s.xp), after = levelFor(xp);
  let levelUpTo = merged.levelUpTo;
  if (after > before) {
    levelUpTo = after;
    if (after >= 5 && !achievements.includes("level-5")) achievements.push("level-5");
    if (after >= MAX_LEVEL && !achievements.includes("level-8")) achievements.push("level-8");
  }
  return { ...patch, xp, toasts, quests, achievements, levelUpTo };
}
```

Persist with `partialize` excluding `started`, `toasts`, `levelUpTo`, `panelOpen`. `finishRun(score)`: gained = `min(score, XP.coinCap / XP.coin) * XP.coin`, `bestRun = max`. `openProject` and `unlockSkill` and `discoverZone` are idempotent (no XP twice).

- [ ] **Step 3: Typecheck and commit** `feat(game): zustand store and game data`.

---

### Task 8: Smooth scroll helper

**Files:**
- Create: `src/lib/scroll.ts`
- Modify: `src/components/ProjectModal.tsx`, `src/components/CommandPalette.tsx` (lock/unlock)

**Interfaces:** `initSmoothScroll(): () => void`, `scrollToHash(hash: string)`, `lockScroll()`, `unlockScroll()`.

- [ ] **Step 1: Implement**

```ts
import Lenis from "lenis";
let lenis: Lenis | null = null;
export function initSmoothScroll(): () => void {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return () => {};
  lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
  let raf = 0;
  const loop = (t: number) => { lenis?.raf(t); raf = requestAnimationFrame(loop); };
  raf = requestAnimationFrame(loop);
  const onClick = (e: MouseEvent) => {
    const a = (e.target as HTMLElement).closest?.("a[href^='#']") as HTMLAnchorElement | null;
    if (!a || e.metaKey || e.ctrlKey) return;
    e.preventDefault(); scrollToHash(a.getAttribute("href") || "#");
  };
  document.addEventListener("click", onClick);
  return () => { cancelAnimationFrame(raf); document.removeEventListener("click", onClick); lenis?.destroy(); lenis = null; };
}
export function scrollToHash(hash: string) {
  const el = hash.length > 1 ? document.querySelector<HTMLElement>(hash) : null;
  if (hash.length > 1 && !el) return;
  if (lenis) lenis.scrollTo(el ?? 0, { offset: el ? -72 : 0 });
  else if (el) el.scrollIntoView({ behavior: "smooth" }); else window.scrollTo({ top: 0, behavior: "smooth" });
  if (hash.length > 1) history.replaceState(null, "", hash);
}
export function lockScroll() { lenis?.stop(); document.body.style.overflow = "hidden"; }
export function unlockScroll() { lenis?.start(); document.body.style.overflow = ""; }
```

- [ ] **Step 2: Replace the `document.body.style.overflow` lines in `ProjectModal.tsx` and `CommandPalette.tsx` with `lockScroll()` / `unlockScroll()`; in the palette `go()` call `scrollToHash(hash)`.**

- [ ] **Step 3: Typecheck, commit** `feat: lenis smooth scroll helper`.

---

### Task 9: Title screen, HUD, toasts, level-up, zone banner, quest panel

**Files:**
- Create: `src/components/game/PixelSprite.tsx`, `TitleScreen.tsx`, `HUD.tsx`, `Toasts.tsx`, `ZoneBanner.tsx`, `LevelUp.tsx`, `QuestPanel.tsx`, `ZoneObserver.tsx`, `Konami.tsx`, `confetti.ts` (guarded helper `burst(opts)`).
- Modify: `src/App.tsx`, `src/components/LightModeBanner.tsx` (top-right), `src/components/ScrollToTop.tsx` (`bottom-24 sm:bottom-6`), `src/components/ThemeToggle.tsx` (`markTheme`).

**Interfaces:**
- `PixelSprite({ frame, scale, className })` draws one `PLAYER_FRAMES` frame to a canvas.
- `TitleScreen({ onStart })`; `HUD()`; `Toasts()`; `ZoneBanner()`; `LevelUp()`; `QuestPanel()`; `ZoneObserver()`; `Konami()`.

- [ ] **Step 1: `PixelSprite`** — `useEffect` draws with `drawPixelMap` at DPR; `aria-hidden`.

- [ ] **Step 2: `TitleScreen`** — fixed overlay z-[100]; background: `bg-background` + CSS perspective grid (`.title-grid` in index.css: repeating linear gradients, `transform: perspective(400px) rotateX(60deg)`, animated `background-position`) + 20 floating pixel squares (`motion.span` with random positions, `animate y`); content: `PixelSprite` idle bobbing, `h1.font-pixel` "FARDEEN.BIO" with two offset coloured copies for a glitch look (CSS `text-shadow: 3px 0 #38bdf8, -3px 0 #a78bfa`), subtitle, name input (`maxLength 16`, default "Recruiter"), "▶ START QUEST" button (`font-pixel text-xs`), secondary "Skip → résumé" link (opens `/resume.pdf` new tab, then starts), sound toggle button, `p.animate-blink` "PRESS START". Enter key starts. If `xp > 0` show "CONTINUE · LEVEL n" as the primary and a small "reset" link. On start: `unlockAudio(); setSoundEnabled(soundOn); start(name); discoverZone("home")`. Exit: `exit={{ opacity: 0, scale: 1.06 }}`.

- [ ] **Step 3: `HUD`** — renders only when `started`. Desktop: `fixed bottom-5 left-5 z-[60] w-[260px] glass-card p-3`; row: `PixelSprite` in a `h-11 w-11 rounded-lg bg-muted/60`, name (truncate), `font-pixel text-[9px] text-accent` title, level badge `Lv n`; XP bar `h-2 rounded bg-muted` with `motion.div` width `${progress*100}%` (spring) and `xp / next` mono text; buttons row: Quests (`Scroll` icon, badge `quests.length/QUESTS.length`), Sound (`Volume2`/`VolumeX`), Résumé (`FileText`, calls `markResume` and opens PDF). Mobile (`sm:hidden`): full-width bottom bar `fixed inset-x-0 bottom-0` with sprite, level, XP bar, quests + sound buttons. `<main>` gets `pb-20 sm:pb-0`.

- [ ] **Step 4: `Toasts`** — `fixed right-4 top-20 z-[85] flex flex-col gap-2` (mobile: `inset-x-4 top-16`); `AnimatePresence` over `toasts.filter(t => t.kind !== "zone")`; each: `motion.div layout initial={{x:40,opacity:0}}`, auto-dismiss 3200 ms via `setTimeout` in a child effect, `role="status"` on a wrapper with `aria-live="polite"`; icon emoji, title, body, xp chip `+50 XP`. On mount of a toast play `sfx.quest` / `sfx.unlock` / `sfx.blip` by kind.

- [ ] **Step 5: `ZoneBanner`** — takes the newest `zone` toast; `fixed left-1/2 top-16 -translate-x-1/2 z-[85]`; `font-mono text-[10px] tracking-[0.3em]` "NEW AREA DISCOVERED" over `font-pixel text-sm md:text-base` zone name; slides down/up; dismiss after 2200 ms; `sfx.zone()`.

- [ ] **Step 6: `LevelUp`** — when `levelUpTo` non-null: `fixed inset-0 z-[95]` dark overlay, radial accent burst (`motion.div` scale 0→3 opacity fade), `font-pixel text-2xl md:text-4xl` "LEVEL UP!" spring in, level title, "click to continue"; confetti burst; `sfx.levelUp()`; auto-clear after 2600 ms or click → `clearLevelUp()`.

- [ ] **Step 7: `QuestPanel`** — `panelOpen` from store; backdrop + `motion.aside` from the right (`w-full max-w-sm`), header "Quest Log" + close; tabs Quests | Badges; Quests list: each `QUESTS` entry (hidden ones show "???" until done) with icon, title, description, progress bar `value/target`, ✓ when done; Badges: grid of `QUESTS ∪ EXTRA_ACHIEVEMENTS`, locked = grayscale/opacity-40 with 🔒; footer: player summary and "Reset progress" (confirm via a two-click pattern: first click turns into "Really reset?"). Esc closes. `lockScroll()` on open, `unlockScroll()` on close; panel content has `data-lenis-prevent`.

- [ ] **Step 8: `ZoneObserver`** — after `started`, `requestAnimationFrame` then for each `ZONES` entry `document.getElementById(sectionId)` → one `IntersectionObserver` (threshold 0.2, rootMargin `-10% 0px`) → `discoverZone(id)`; unobserve once discovered. Cleanup on unmount.

- [ ] **Step 9: `Konami`** — keydown sequence matcher against `["ArrowUp","ArrowUp","ArrowDown","ArrowDown","ArrowLeft","ArrowRight","ArrowLeft","ArrowRight","b","a"]` (case-insensitive); on match, if not already `konami`: `triggerKonami()`, `document.documentElement.animate([{transform:"rotate(0)"},{transform:"rotate(360deg)"}], {duration: 1100, easing: "cubic-bezier(.4,0,.2,1)"})` (skipped under reduced motion), confetti, `sfx.win()`.

- [ ] **Step 10: `confetti.ts`**

```ts
import confetti from "canvas-confetti";
export function burst(opts: confetti.Options = {}) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  confetti({ particleCount: 90, spread: 70, startVelocity: 38, origin: { y: 0.7 }, colors: ["#38bdf8", "#a78bfa", "#34d399", "#fbbf24", "#f472b6"], zIndex: 120, ...opts });
}
```

- [ ] **Step 11: `App.tsx`** — replace `Loading` with `TitleScreen` (`started` from store; keep `AnimatePresence`); mount `HUD`, `Toasts`, `ZoneBanner`, `LevelUp`, `QuestPanel`, `ZoneObserver`, `Konami`; call `initSmoothScroll()` in an effect once started; subscribe `soundOn → setSoundEnabled`.

- [ ] **Step 12: Browser check** with `npm run dev`: title → start → HUD visible → scroll → zone banner + XP → level-up fires after ~5 zones → quest panel opens/closes, Esc works. Commit `feat(game): title screen, HUD, toasts, quest log`.

---

### Task 10: Skill Run mini-game

**Files:**
- Create: `src/components/game/SkillRun.tsx`
- Modify: `src/components/Hero.tsx` (right column), `src/constants/index.ts` (no change needed)

**Interfaces:** `SkillRun()` self-contained; uses `runner.ts`, `sprites.ts`, `icons.ts`, `sfx.ts`, store `finishRun`, `bestRun`.

- [ ] **Step 1: Component skeleton** — container `div.relative.aspect-[2/1].w-full.max-w-[520px].overflow-hidden.rounded-2xl.border.border-border/60.bg-card/40` with `<canvas>` (`aria-label` "Skill Run mini-game: jump over bugs and collect tech icons") and DOM overlays: top-left hearts (`♥` ×3, lost ones dimmed), top-right `SCORE n · BEST n` in `font-pixel text-[9px]`, bottom-right jump button (`sm:hidden`, "JUMP"). State machine mirrors `world.status` plus `paused`.

- [ ] **Step 2: Rendering** — `ResizeObserver` sets canvas CSS width; scale = width/`WORLD.width`; `canvas.width = width*dpr`; each frame: `ctx.setTransform(dpr*scale,0,0,dpr*scale,0,0)`; draw sky gradient from CSS vars (`--card`, `--accent`), 3 parallax layers (far hills as rounded rects moving at 0.3×, ground line at `groundY`, ground stripes moving at 1×, offset by `frame*speed`), coins as icon images (fallback: accent circle + letter) with bob `Math.sin((frame + id*7)/8)*2`, bugs via `BUG_FRAME` scale 2, player via `PLAYER_FRAMES` (run1/run2 alternate every 8 frames, `jump` when airborne, blink when `invuln % 6 < 3`), particles array (spawned on coin events; 8 squares with random velocity, 24-frame life).

- [ ] **Step 3: Loop** — `requestAnimationFrame` with accumulator `acc += dt; while (acc >= 1000/60 && n++ < 4) { step(world, {jump: jumpQueued}, Math.random); jumpQueued = false; handleEvents(); acc -= 1000/60 }`. Events: `coin` → `sfx.coin()` + particles; `hurt` → `sfx.hurt()` + shake class on container for 400 ms; `over` → `sfx.lose()`, `finishRun(world.score)`; `jump` → `sfx.jump()`.

- [ ] **Step 4: Input** — window keydown for `Space`/`ArrowUp` only while `status === "playing" && !paused` (preventDefault); pointerdown on canvas: start when ready/over, else jump; visibilitychange/IntersectionObserver (threshold 0.4) → `paused = true`; click on overlay resumes.

- [ ] **Step 5: Overlays** — ready: "SKILL RUN" pixel title, "Jump over bugs, collect the stack.", `▶ PLAY` button, hint "Space / tap to jump"; paused: "PAUSED — click to resume"; over: "RUN OVER", score, best (with "NEW BEST!" if improved), `▶ PLAY AGAIN`; all overlays are `absolute inset-0 grid place-items-center bg-background/60 backdrop-blur-[2px]`.

- [ ] **Step 6: Hero** — replace the Lottie block with `<SkillRun />` inside the existing `md:col-span-2` column; add a caption `font-mono text-[10px]` "Mini-game · earns XP"; résumé link `onClick={markResume}`.

- [ ] **Step 7: Browser check** — play a round with keyboard and with clicks; confirm Space does not jump when the game is not running; game over → XP toast; Sprinter quest completes at 15. Commit `feat(game): Skill Run mini-game in the hero`.

---

### Task 11: Skill tree

**Files:**
- Create: `src/components/game/SkillTree.tsx`
- Modify: `src/components/Skills.tsx`

**Interfaces:** `SkillTree()` renders all categories using `SKILLS_LIST` and store `skills`, `unlockSkill`, `unlockSkills`.

- [ ] **Step 1: Layout math** — `ringLayout(n): {r: number, angle: number}[]`: if `n <= 8` one ring at `r=140`, else inner `Math.floor(n/2)` at `r=90` and the rest at `r=170`; angles evenly spaced starting at `-90°`, inner ring offset by half a step. Container `h-[400px] w-[400px]` centred, nodes absolutely positioned at `200 + r*cos`, `200 + r*sin`.

- [ ] **Step 2: Node** — `motion.button` 52 px circle: locked = `border border-dashed border-border bg-card/40 text-muted-foreground/50`, unlocked = `border-accent bg-accent/15 text-accent shadow-[0_0_18px_hsl(var(--accent)/0.35)]`; `whileHover={{scale:1.08}}`, `whileTap={{scale:0.94}}`, unlock spring `animate={{scale:[1,1.25,1]}}`; label below `text-[9px] max-w-[64px] truncate`; `aria-pressed={unlocked}`, `aria-label="${name}, ${unlocked?'unlocked':'locked'}"`; `title={name}`.

- [ ] **Step 3: Lines** — one `svg.absolute.inset-0.pointer-events-none`; per node `motion.line` from centre to node, locked: `stroke-border strokeDasharray 3 5 opacity .5`; unlocked: `stroke-accent` with `initial={{pathLength:0}} animate={{pathLength:1}}`.

- [ ] **Step 4: Core** — 64 px button in the centre with a lucide icon per category (`Code2`, `BrainCircuit`, `Layers`, `Wrench`), count `x/n` in mono; click → `unlockSkills(ids)` staggered via `setTimeout(i*40)` per id and `sfx.unlock()` per node (cap sound to every other node).

- [ ] **Step 5: Mobile** — `md:hidden` grid of chips (`button.pill` with lock/unlock state) per category; same handlers.

- [ ] **Step 6: Section header** — Skills.tsx keeps the eyebrow/title; subtitle "Click a node to unlock it. Click the core to unlock the whole branch."; right-aligned "Unlock all" text button (all categories) and unlocked total `x / 52`.

- [ ] **Step 7: Browser check** on desktop and at 375 px width; commit `feat(game): skill tree`.

---

### Task 12: Loot cards and modal flip

**Files:**
- Create: `src/components/game/LootCard.tsx`
- Modify: `src/components/Projects.tsx`, `src/components/ProjectModal.tsx`

- [ ] **Step 1: `LootCard({ project, onOpen })`** — wraps `TiltCard` (`intensity 6`); rarity from `RARITY_BY_CATEGORY[PROJECT_DETAILS[id].category]`; border/glow classes from `RARITY_STYLES`; holo layer `absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100` with `background: radial-gradient(circle at var(--mx,50%) var(--my,50%), rgba(255,255,255,.18), transparent 45%)` updated in `onPointerMove` via `style.setProperty`; header row: rarity gem (◆ coloured) + label in `font-pixel text-[8px]`; body = existing card content; collected stamp `absolute right-3 top-3 rotate-6 font-pixel text-[8px] border px-1.5 py-1` "COLLECTED" when `projects.includes(id)`. Whole card is a `<button>` (existing links inside keep `stopPropagation`).

- [ ] **Step 2: Projects.tsx** — replace the inline `motion.button` with `LootCard`; `onOpen` → `setSelected(project); openProject(project.id)`; subtitle "Loot cards. Rarer categories glow brighter. Click to collect."

- [ ] **Step 3: ProjectModal** — dialog `initial={{ rotateY: -90, opacity: 0 }} animate={{ rotateY: 0, opacity: 1 }}` with `style={{ transformPerspective: 1200 }}`, spring `stiffness 260 damping 26`; rarity label next to category. `sfx.unlock()` on open.

- [ ] **Step 4: Browser check + commit** `feat(game): loot cards with rarity and flip modal`.

---

### Task 13: Career map

**Files:**
- Create: `src/components/game/CareerMap.tsx`
- Modify: `src/components/Experience.tsx`

- [ ] **Step 1:** Move the timeline markup into `CareerMap`; add `ref` on the list wrapper; `const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.65", "end 0.65"] })`; `const y = useTransform(scrollYProgress, [0, 1], [0, trackHeight - 40])` where `trackHeight` comes from a `ResizeObserver` on the wrapper.

- [ ] **Step 2:** Sprite `motion.div.absolute.left-[19px].hidden.md:block` (`-translate-x-1/2`, `style={{ y }}`) containing `PixelSprite` with `frame` toggled `run1/run2` every 120 ms while `scrollYProgress` changed within the last 200 ms (`useMotionValueEvent` + timestamps), `idle` otherwise; facing down = rotate the sprite container 90° via a wrapper (`rotate-90`), so it "walks" along the line.

- [ ] **Step 3:** Checkpoints: `activeIdx = Math.round(progress * (n - 1))` via `useMotionValueEvent`; card `idx <= activeIdx` gets `border-accent/50` and the dot `bg-accent shadow-[0_0_12px_hsl(var(--accent)/0.6)]`, with a `font-mono text-[10px] text-accent` "CHECKPOINT REACHED" label on the newest one.

- [ ] **Step 4: Browser check + commit** `feat(game): career map with walking sprite`.

---

### Task 14: Boss fight and contact glow

**Files:**
- Create: `src/components/game/BossFight.tsx`
- Modify: `src/App.tsx` (mount between `TLDR` and `Footer`), `src/components/Footer.tsx`, `src/components/CommandPalette.tsx`, `src/constants/index.ts` (add `{ link: "#boss", title: "Boss" }` to `NAV_LINKS` after Projects)

- [ ] **Step 1: Section** `id="boss"` `section-container`; eyebrow "boss fight", title "The Hiring Manager", subtitle "Five questions about this portfolio. Three hearts. Beat the boss to unlock the final gate."

- [ ] **Step 2: Arena card** — `glass-card overflow-hidden`; top row: boss sprite (`BOSS_FRAME` scale 4 via a `PixelSprite`-like `BossSprite` in the same file) that idles (`animate y [0,-4,0]`) and shakes (`animate-shake`) on hit, HP bar (5 segments, red→amber), player hearts (`♥` ×3). Middle: question `font-display text-lg`, four `motion.button` options (`grid sm:grid-cols-2 gap-2`), disabled after choosing; correct = `border-emerald-400 bg-emerald-400/10`, wrong = `border-red-400 bg-red-400/10`, then after 1200 ms next question. Damage number `motion.span` "-1" floats up over the boss on a hit. Wrong answer flashes an `absolute inset-0 bg-red-500/10` layer for 300 ms and plays `sfx.hurt()`; correct plays `sfx.coin()`.

- [ ] **Step 3: States** — idle: "▶ CHALLENGE" starts `createRound(mulberry32(Date.now()), 5)` and `initialBoss(5)`; won: "BOSS DEFEATED" pixel text, confetti, `sfx.win()`, `defeatBoss()`, link "Claim your reward ↓" to `#contact`; lost: "DEFEATED… try again" with retry. If `bossDefeated` already, the idle state shows "Already defeated · Fight again for fun" and re-fights give no XP.

- [ ] **Step 4: Footer** — if `bossDefeated`: badge above the title "👑 Boss defeated — the gate is open", primary button gains `animate-pulse-ring` and label "Hire Fardeen"; `copyEmail` and the mail link call `markEmail()`; résumé link `markResume()`.

- [ ] **Step 5: Command palette** — add Actions "Open quest log" (`setPanel(true)`), "Reset progress"; résumé item calls `markResume`, copy email calls `markEmail`; Navigation uses `scrollToHash`.

- [ ] **Step 6: Browser check + commit** `feat(game): boss fight and hired reward`.

---

### Task 15: Polish, README, verification

**Files:**
- Modify: `README.md`, `src/components/Navbar.tsx` (nothing functional; verify the new Boss link looks right), `src/index.css`

- [ ] **Step 1:** README: new "Quest Mode" feature list (title screen, HUD, zones, quests, badges, Skill Run, skill tree, loot cards, career map, boss fight, Konami), controls, and how progress is stored/reset.
- [ ] **Step 2:** Run `npm test`, `npx tsc --noEmit`, `npm run build`; fix anything.
- [ ] **Step 3:** Browser pass in Chrome: full flow desktop; 375 px mobile emulation; `prefers-reduced-motion` emulation; light theme; reload shows Continue. Fix visual bugs found.
- [ ] **Step 4:** Commit `docs: describe Quest Mode`.
