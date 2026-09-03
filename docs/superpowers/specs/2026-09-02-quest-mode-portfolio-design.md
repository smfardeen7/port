# Quest Mode Portfolio — Design

**Date:** 2026-09-02
**Status:** Approved (game style: Quest Mode + mini-games; sound off by default)

## Goal

Turn the existing scroll portfolio into a game a recruiter can play without
losing the ability to scan it in thirty seconds. Every section stays readable
as-is; a game layer sits around it and rewards exploration with XP, levels,
quests and achievements. Two playable pieces (a hero mini-game and a boss
quiz) make it feel like a real game rather than a themed website.

Non-goals: a canvas-only world, WebGL, server-side state, sign-in, leaderboards.

## Constraints

- Keep the current stack: React 18, Vite 5, TypeScript, Tailwind 3, Framer Motion 11.
- Everything must work with the keyboard, on touch, and with
  `prefers-reduced-motion` (animations shortened, smooth scroll disabled, no confetti).
- Sound is synthesized with the Web Audio API (no audio files), off by default,
  toggle in the HUD, remembered in `localStorage`.
- No new image assets: the player sprite is drawn from a pixel map in code,
  tech icons are rasterized from the existing `react-icons` SVGs.
- Progress persists in `localStorage` so a returning visitor sees "Continue".
- A "Skip to résumé" escape hatch is visible on the title screen and in the HUD.
- Dark and light themes both keep working.

## Player journey

1. **Title screen** (replaces the loading screen). Pixel-font "FARDEEN.BIO",
   blinking "PRESS START", optional player-name field (default "Recruiter"),
   sound toggle, "Start quest" and "Skip, show me the résumé". A returning
   visitor with progress sees "Continue · Level N".
2. **Spawn** in the hero. The right column holds the **Skill Run** mini-game
   (canvas): the character runs, jumps over bugs and collects tech icons.
3. **Zones**: scrolling into a section discovers it (banner + XP). Each
   section has a zone name (Career Road, Skill Forge, Academy, Hall of Badges,
   Loot Vault, Library, Open Source Tower, Save Point, Final Gate).
4. **Skill Forge**: skills are nodes in a radial tree per category; clicking
   unlocks them (XP). Clicking a category core unlocks its whole ring in a
   cascade.
5. **Loot Vault**: projects are loot cards with rarity (by category), a
   holographic shine that follows the pointer, and a "collected" stamp after
   the modal has been opened. The modal flips in.
6. **Career Road**: a pixel character walks the experience timeline as the
   visitor scrolls; each checkpoint lights up when reached.
7. **Boss fight** before Contact: five multiple-choice questions about the
   portfolio content. Correct answers damage the boss ("The Hiring Manager"),
   wrong answers cost a heart. Winning unlocks the "Hired!" achievement and a
   glowing contact CTA.
8. **Quests and achievements** are listed in a slide-over panel from the HUD.
   Completing quests, discovering zones and levelling up fire toasts,
   particles and sounds.
9. **Secret**: the Konami code triggers a short screen effect and a hidden
   achievement.

## Architecture

```
src/
  game/
    store.ts          zustand store + localStorage persistence (single source of truth)
    data.ts           zones, quests, achievements, rarity map, XP values
    levels.ts         pure: xp -> level, title, progress to next level
    quests.ts         pure: quest progress from state; which quests just completed
    boss.ts           pure: question bank + shuffle + damage/HP rules
    runner.ts         pure: mini-game world step (physics, spawning, collisions, score)
    sfx.ts            Web Audio synthesized sounds, honours store.soundOn
    sprites.ts        pixel maps for the player character (idle/run/jump frames) + draw helper
    icons.ts          rasterize react-icons to ImageBitmap for canvas use
    *.test.ts         node:test unit tests for the pure modules
  components/game/
    TitleScreen.tsx   press-start overlay
    HUD.tsx           fixed bottom-left player card: avatar, level, XP bar, buttons
    QuestPanel.tsx    slide-over with Quests and Achievements tabs
    Toasts.tsx        stacked notifications (XP, quest, zone, achievement)
    LevelUp.tsx       full-screen level-up moment
    ZoneBanner.tsx    "NEW AREA DISCOVERED" banner
    useZone.ts        hook: IntersectionObserver -> store.discoverZone
    SkillRun.tsx      hero mini-game canvas + controls overlay
    SkillTree.tsx     radial tree (desktop) / unlockable grid (mobile)
    LootCard.tsx      project card with rarity + holo shine
    CareerMap.tsx     experience timeline with walking sprite
    BossFight.tsx     quiz section
    Konami.tsx        key-sequence listener + effect
    PixelSprite.tsx   small canvas that draws a sprite frame (used by HUD, CareerMap)
  lib/
    scroll.ts         Lenis instance, scrollTo(hash), stop/start for modals
```

### State (zustand, persisted under `quest-mode-v1`)

```ts
interface GameState {
  started: boolean;            // passed title screen this session (not persisted)
  playerName: string;
  xp: number;
  soundOn: boolean;
  zones: string[];             // discovered zone ids
  skills: string[];            // unlocked skill ids
  projects: string[];          // opened project ids
  quests: string[];            // completed quest ids
  achievements: string[];      // unlocked achievement ids
  bestRun: number;             // best Skill Run score
  bossDefeated: boolean;
  konami: boolean;
  resumeOpened: boolean;
  emailCopied: boolean;
  themeToggled: boolean;
  toasts: Toast[];             // transient, not persisted
  levelUpTo: number | null;    // transient
}
```

Actions (`discoverZone`, `unlockSkill`, `unlockSkills`, `openProject`,
`finishRun`, `defeatBoss`, `triggerKonami`, `markResume`, `markEmail`,
`markTheme`, `addXp`, `dismissToast`, `toggleSound`, `setName`, `start`,
`reset`) each: update the fact, add XP, then run `evaluateQuests` from
`quests.ts` to award any newly completed quests (+XP, achievement, toast),
then check for a level change (toast + `levelUpTo`).

### XP and levels

| Event | XP |
|---|---|
| Zone discovered | 20 |
| Skill unlocked | 5 |
| Project opened | 15 |
| Skill Run coin | 2 (max 60 per run) |
| Quest completed | 50 |
| Boss defeated | 150 |

Level thresholds: 0, 100, 250, 450, 700, 1000, 1400, 1900.
Titles: Intern, Junior Dev, Engineer, Senior Engineer, Staff Engineer,
Principal, Architect, Legend.

### Quests (each one is also an achievement badge)

| id | title | done when |
|---|---|---|
| first-steps | First Steps | 3 zones discovered |
| cartographer | Cartographer | all 9 zones discovered |
| forge-10 | Apprentice Smith | 10 skills unlocked |
| forge-all | Master Smith | every skill unlocked |
| loot-3 | Loot Hunter | 3 projects opened |
| loot-all | Vault Cleared | every project opened |
| resume | Read the Scroll | résumé opened |
| raven | Send a Raven | email copied or mail link clicked |
| runner-15 | Sprinter | Skill Run score ≥ 15 |
| boss | Hired! | boss defeated |
| konami | Cheat Code | Konami code entered |
| theme | Day / Night | theme toggled |

Extra achievements (not quests): `level-5` "Halfway There", `level-8` "Legend".

### Skill Run (mini-game)

Endless runner in a `<canvas>` (device-pixel-ratio aware) sized to the hero's
right column (max 520×260). World units are pixels at 1×.

- Player: pixel sprite, ground-locked, jump on Space / ArrowUp / tap / on-screen
  button. Gravity 0.55 px/frame², jump velocity −9.5, double jump not allowed.
- Spawner: every 70–110 frames spawn either a coin (tech icon, at ground or
  one-jump height) or a bug (ground). Speed starts at 4 px/frame and grows
  +0.15 every 10 coins, capped at 8.
- Collision: AABB with 4-px inset. Coin → +1 score, sfx, particle burst.
  Bug → lose a heart (3 hearts), 45 frames invulnerable + blink. 0 hearts → game
  over screen with score, best, "Play again".
- Loop uses `requestAnimationFrame` with a fixed 60 Hz accumulator so speed is
  frame-rate independent. Pauses when the tab is hidden, the canvas leaves the
  viewport, or the visitor clicks outside.
- Keyboard capture only while the game is active (has been started and not
  over), so page scrolling with Space/arrows is unaffected otherwise.
- `runner.ts` is pure (`step(world, input, rng) -> world`) so it is unit-testable.

### Boss fight

- Question bank built in `boss.ts` from the constants (education, projects,
  publications, experience, certifications). Each question has one correct
  answer and three distractors from the same domain.
- Boss HP 3, player hearts 3, a round is 5 questions drawn without
  replacement with options shuffled by a seedable RNG. Three correct answers
  win, three wrong answers lose, so a full round always ends decisively.
- Correct: boss shakes, HP bar drops, damage number floats, sfx. Wrong: screen
  flashes red, heart lost, correct answer highlighted, next question after 1.2s.
- Win: confetti, `defeatBoss()`, "Hired!" badge, the contact CTA below gains a
  pulsing glow. Lose: "Try again" resets the round with a fresh draw.

### Skill tree

- Desktop (≥ 768px): for each category a radial layout. Core node in the
  center; items on one ring (≤ 10 items) or two rings (more). SVG lines from
  core to each node, drawn with `pathLength` animation when unlocked.
- Mobile: category header + grid of unlockable chips (same store actions).
- Node states: locked (dim, dashed border), unlocked (accent fill, icon in
  color), hover (scale 1.08). Unlock animation: spring scale + ring pulse.
- Core click unlocks all children with 40 ms stagger. "Unlock all" text
  button at the section top for impatient visitors.

### Smooth scroll

Lenis with `lerp: 0.1`, disabled under reduced motion. Anchor clicks are
intercepted globally and routed through `scrollTo`. Modals and panels call
`stop()`/`start()`. Framer's `useScroll` keeps working since Lenis drives the
native scroll position.

### HUD

Fixed bottom-left card (bottom bar on < 640px): sprite avatar, player name,
level title, XP bar with `xp / next`, buttons: Quests (badge with count of
new completions), Sound, Résumé. The existing scroll-to-top and TL;DR floats
stay on the right. The light-mode banner moves to the top-right under the
navbar.

### Sound

`sfx.ts` builds an `AudioContext` lazily on first user gesture and synthesizes
short tones: `blip` (UI), `coin` (two rising square notes), `hurt` (falling
saw), `unlock` (triangle arpeggio), `quest` (major chord), `levelUp` (rising
arpeggio + shimmer), `win`, `lose`. Every call is a no-op when `soundOn` is
false or the context cannot be created.

### Accessibility

- Every interactive node is a `<button>` with an accessible name and state.
- Toasts use `aria-live="polite"`. The title screen traps focus.
- The mini-game canvas has a text alternative and an on-screen jump button.
- Reduced motion: no confetti, no Lenis, shortened transitions, sprite still
  moves (position-only) since that conveys state.

## Existing files touched

- `App.tsx`: TitleScreen replaces Loading; adds HUD, QuestPanel, Toasts,
  LevelUp, Konami, BossFight (between GitHub/TL;DR and Footer); Lenis init.
- `Hero.tsx`: right column becomes `SkillRun`; résumé link calls `markResume`.
- `Skills.tsx`: renders `SkillTree`.
- `Projects.tsx`: cards become `LootCard`; opening the modal calls `openProject`.
- `ProjectModal.tsx`: flip-in animation, rarity label, Lenis stop/start.
- `Experience.tsx`: renders `CareerMap`.
- `Footer.tsx`, `CommandPalette.tsx`: résumé/email actions report to the store;
  palette gains "Open quest log" and "Reset progress".
- `LightModeBanner.tsx`: moves to top-right.
- `index.html`: adds the Press Start 2P font.
- `index.css`, `tailwind.config.ts`: pixel font family, HUD tokens, keyframes.
- `package.json`: adds `zustand`, `lenis`, `canvas-confetti`; fixes the test
  script for Node 22 (`--experimental-strip-types`, glob for `src/**`).
- `README.md`: documents Quest Mode.

## Testing

- Unit (node:test): `levels.ts`, `quests.ts`, `boss.ts`, `runner.ts`.
- Type check + production build must pass.
- Manual browser pass (Chrome): title → start → zones → skill tree → loot →
  run → boss → quests panel; keyboard-only pass; mobile width; reduced motion;
  light theme; returning visitor sees Continue.

## Risks

- Lenis interfering with modals or anchor scrolling: mitigated with
  `stop/start` and a single `scrollTo` helper; can be removed independently.
- Canvas icon rasterization failing (e.g. SVG load error): fall back to a
  coloured circle with the first letter.
- localStorage unavailable (private mode): the store works in memory; persist
  middleware errors are swallowed.
