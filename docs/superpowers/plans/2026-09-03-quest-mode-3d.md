# Quest Mode 3D Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add five lazy-loaded React Three Fiber scenes (title, hero, backdrop, skill galaxy, boss) to the Quest Mode portfolio, all built procedurally from the existing pixel maps and icons, with 2D fallbacks.

**Architecture:** Pure helpers in `src/three/` (voxelization, sphere layout) are unit-tested. React scenes live in `src/components/three/` and are mounted through one `Lazy3D` gate that handles code-splitting, WebGL and reduced-motion detection, and in-view activation. Existing components only swap a child for `<Lazy3D scene=… fallback=…>`.

**Tech Stack:** three 0.170, @react-three/fiber 8.18, @react-three/drei 9.122, @react-three/postprocessing 2.19, React 18, Vite 5.

**Spec:** `docs/superpowers/specs/2026-09-03-quest-mode-3d-design.md`

## Global Constraints

- Pin: `three@0.170.0`, `@react-three/fiber@8.18.0`, `@react-three/drei@9.122.0`, `@react-three/postprocessing@2.19.1`, `@types/three@0.170.0`. No React 19 upgrade.
- No binary assets. Models come from `PLAYER_FRAMES.idle` / `BOSS_FRAME`; textures from `react-icons`.
- All scene modules are imported only through `React.lazy` so `three` lands in its own chunk.
- `use3D()` must be false under `prefers-reduced-motion` or without WebGL; every mount point passes a `fallback`.
- DPR clamp `[1, 1.5]`; backdrop `1`. Scenes render only while `active` (in view and tab visible).
- Pure modules use `.ts` relative imports and `import type`; tests run with `npm test`.
- Commit after each task with the session trailers.

---

### Task 1: Pure helpers — voxelization and sphere layout

**Files:**
- Create: `src/three/voxel.ts`, `src/three/sphere.ts`
- Test: `src/three/voxel.test.ts`, `src/three/sphere.test.ts` (already written)

**Interfaces:**
- `interface Voxel { x: number; y: number; z: number; color: string; glow: boolean }`
- `voxelsFromPixelMap(map: string[], palette: Record<string,string>): Voxel[]` — x centred (`col - (w-1)/2`), y flipped and centred (`(h-1)/2 - row`), z columns `-1,0,1` (depth 3) or `-1.5,-0.5,0.5,1.5` (depth 4 for keys `h`,`k`,`e`); glow for keys `s`,`r`; unknown keys skipped.
- `voxelBounds(v): { minX, maxX, minY, maxY, minZ, maxZ }`
- `fibonacciSphere(n: number, radius: number): [number, number, number][]` — golden-angle spiral, `y = 1 - 2*(i+0.5)/n`.

- [ ] Run `npm test` → both new files fail (module not found).
- [ ] Implement both modules exactly per the interfaces.
- [ ] `npm test` → 42 tests pass. Commit `feat(3d): voxel and sphere helpers`.

### Task 2: 3D support gate, scene wrapper, textures, voxel model

**Files:**
- Create: `src/three/support.ts`, `src/three/textures.ts`, `src/components/three/Scene.tsx`, `src/components/three/Lazy3D.tsx`, `src/components/three/VoxelModel.tsx`
- Modify: `src/game/icons.ts` (export `rasterizeIcons(icons, color, size)` used by `loadIconImages`)

**Interfaces:**
- `hasWebGL(): boolean` (creates a throwaway canvas context once, cached).
- `use3D(): boolean` — `hasWebGL() && !prefers-reduced-motion`, updates on media-query change.
- `Scene({ active, dpr = [1, 1.5], camera, children, className })` → `<Canvas frameloop={active ? "always" : "never"} dpr={dpr} gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }} camera={camera}>` inside `<Suspense fallback={null}>`.
- `Lazy3D({ load: () => Promise<{ default: ComponentType<{active: boolean}> }>, fallback, className, margin = "400px" })` — `use3D()` gate; IntersectionObserver on its wrapper sets `inView`; `document.visibilityState` sets `visible`; renders `fallback` when 3D is off, and `<Suspense fallback={fallback}><Lazy active={inView && visible} /></Suspense>` otherwise. The fallback is absolutely stacked under the canvas so the swap is a crossfade (`motion.div` opacity).
- `iconTextures(icons: IconType[], color: string, size = 128): Promise<THREE.Texture[]>` — rasterize via `rasterizeIcons`, wrap in `THREE.Texture` with `needsUpdate`, `colorSpace = SRGBColorSpace`; cached by `color+size`.
- `VoxelModel({ map, palette, scale = 0.12, glowColor, bob = 0.15, turn = 0.25, followPointer = true })` — two `instancedMesh`es (body: `meshStandardMaterial` roughness .6; glow: `meshStandardMaterial` with `emissive` = glowColor, `emissiveIntensity` 1.4, `toneMapped={false}`), instance matrices and colours set once in a `useLayoutEffect`; `useFrame` applies bob `sin(t*2)*bob`, turn `sin(t*.8)*turn + pointer.x*.6`, tilt `-pointer.y*.2` (pointer from `useThree(s => s.pointer)`).

- [ ] Typecheck. Commit `feat(3d): scene gate, wrapper, textures, voxel model`.

### Task 3: Title scene

**Files:**
- Create: `src/components/three/NeonFloor.tsx`, `src/components/three/TitleScene.tsx`
- Modify: `src/components/game/TitleScreen.tsx`

- [ ] `NeonFloor`: `<mesh rotation-x={-Math.PI/2}>` 80×80 `planeGeometry`, `shaderMaterial` uniforms `uTime`, `uColor` (accent), `uSpeed`; fragment: grid from `fract(vUv * 24.0 - vec2(0.0, uTime * uSpeed))`, line = `1 - smoothstep(0, fwidth*1.5, min(dist to edges))`, alpha = line × `(1 - smoothstep(0.15, 0.5, distance from centre uv))`, `transparent`, `depthWrite false`. `useFrame` advances `uTime`.
- [ ] `TitleScene`: camera `[0, 1.6, 7]` fov 50 looking at `[0, 1, 0]`; `<fog attach="fog" color=bg near=6 far=22>`; `ambientLight 0.6`, `directionalLight [3,5,2] 1.2`, `pointLight` accent `[0, 3, 2] 1.5`; `<Stars radius={70} depth={30} count={1400} factor={3} saturation={0} fade speed={0.4}/>`; `<Sparkles count={70} scale={[14, 6, 10]} position={[0,2.5,0]} size={2.5} speed={0.25} color="#7dd3fc"/>`; `NeonFloor`; `VoxelModel` of `PLAYER_FRAMES.idle` at scale 0.16 standing on the floor (y offset = bounds); `EffectComposer disableNormalPass` + `Bloom mipmapBlur luminanceThreshold={0.55} luminanceSmoothing={0.2} intensity={0.8}`.
- [ ] `TitleScreen`: wrap the existing horizon/grid/pixel layers in a div that is the `fallback`; add `<Lazy3D load={() => import("../three/TitleScene")} fallback={…} className="absolute inset-0" />` behind the content. Hide the CSS sprite bob when 3D is active? Keep the 2D `PixelSprite` above the title (it reads as the "logo"); the 3D one stands on the floor below.
- [ ] Browser check, commit `feat(3d): title scene`.

### Task 4: Hero scene

**Files:**
- Create: `src/components/three/HeroScene.tsx`
- Modify: `src/components/Hero.tsx`

- [ ] `OrbitingCoins`: load `iconTextures(RUN_ICONS, accent, 128)`; two rings (radius 2.2 tilt 0.35 rad, radius 3 tilt −0.5 rad), 6 sprites each, `useFrame` advances angle, per-sprite bob; `<sprite scale={0.55}><spriteMaterial map transparent depthWrite={false}/></sprite>` plus an additive halo sprite (radial gradient `CanvasTexture`) behind each.
- [ ] `HeroScene`: camera `[0, 0.6, 7.5]` fov 42; lights as title; `VoxelModel` scale 0.2 `followPointer`; coins; `Sparkles count={40}`; Bloom. Group parallax: `group.rotation.y = lerp(…, pointer.x*0.35)`, `rotation.x = lerp(…, -pointer.y*0.2)`.
- [ ] `Hero.tsx`: right column → `<div className="relative h-[260px] md:h-[300px]"><Lazy3D load={() => import("./three/HeroScene")} fallback={<PixelSprite … centred/>} /></div>` above `<SkillRun />`.
- [ ] Browser check, commit `feat(3d): hero scene`.

### Task 5: Backdrop

**Files:**
- Create: `src/components/three/Backdrop.tsx`
- Modify: `src/App.tsx`

- [ ] 90 cubes: seeded positions in box `[-16,16]×[-9,9]×[-6,4]`, size `0.15–0.6`, colour from `["#38bdf8","#a78bfa","#34d399","#fbbf24","#94a3b8"]`, `meshStandardMaterial transparent opacity={0.28}` `emissive` same colour intensity .35; single `instancedMesh`; `useFrame`: each cube `y += sin(t*speed+phase)*0.002`, rotation drift; group `position.x/y` lerp to `pointer.x*0.8 / pointer.y*0.5`; `position.y += scrollY*0.0012` via a `useEffect` scroll listener into a ref. Camera `[0,0,14]`.
- [ ] Mount: `<Lazy3D load={() => import("./components/three/Backdrop")} fallback={null} className="pointer-events-none fixed inset-0 -z-[5]" margin="0px" />` right after `<Aurora />`; `Scene dpr={1}`.
- [ ] Browser check (backdrop visible behind content, aurora still there), commit `feat(3d): floating voxel backdrop`.

### Task 6: Skill Galaxy

**Files:**
- Create: `src/components/three/SkillGalaxy.tsx`, `src/components/game/SkillGalaxySection.tsx`
- Modify: `src/components/Skills.tsx`

- [ ] `SkillGalaxy({ active, onHover, onPick })`: all skills flat from `SKILLS_LIST`; textures for locked (`#94a3b8`) and unlocked (accent) via `iconTextures`; positions `fibonacciSphere(n, 2.6)`; `<group ref>` auto-rotates `rotation.y += dt*0.12` unless dragging; `OrbitControls enableZoom={false} enablePan={false} enableDamping autoRotate={false} minPolarAngle={0.6} maxPolarAngle={2.5}` (drag rotates camera); each icon: `<sprite position scale={hover?0.62:0.5} onPointerOver onPointerOut onClick>` with `spriteMaterial map={unlocked?accentTex:mutedTex} opacity={unlocked?1:0.55} depthWrite={false}` and, when unlocked, an additive halo sprite scale 1.1 opacity .35; faint `icosahedronGeometry(2.6, 2)` wireframe `opacity 0.06`.
- [ ] `SkillGalaxySection`: `h-[420px] md:h-[520px]` card, `<Lazy3D … fallback={<div>static ring of 12 icons</div>}/>`, caption below: hovered name + state, else "Drag to spin. Click an icon to unlock it." Counter `x/52` mirrors the header.
- [ ] `Skills.tsx`: mount the section between header and `<SkillTree />`.
- [ ] Browser check (drag, hover caption, click unlock → XP toast), commit `feat(3d): skill galaxy`.

### Task 7: Boss model

**Files:**
- Create: `src/components/three/BossModel.tsx`
- Modify: `src/components/game/BossFight.tsx`

- [ ] `BossModel({ active, hit, defeated })`: `VoxelModel` of `BOSS_FRAME` scale 0.11, glow colour red; `useFrame`: hover `y = sin(t*1.5)*0.12`, turn `sin(t*.6)*.35`; when `hit` changes: 450 ms recoil (`z -= 0.6` spring back, `rotation.x` flick) and body material `emissive` red flash; when `defeated`: `rotation.z → 1.2`, scale → 0.2 over 1.2 s, then hold. `pointLight` red.
- [ ] `BossFight.tsx`: header box `h-[132px] w-[132px]` with `<Lazy3D load fallback={<PixelSprite map={BOSS_FRAME} scale={4}/>}/>`; pass `hit` and `defeated={boss?.status === "won" || bossDefeated}`.
- [ ] Browser check, commit `feat(3d): voxel boss`.

### Task 8: Verification, README, ship

- [ ] Extend `verify.mjs`: after start, assert `document.querySelectorAll('canvas').length >= 3` on desktop and that the title canvas has non-uniform pixels (read back via `toDataURL` on a 2D copy); reduced-motion context asserts no WebGL canvases; zero console errors.
- [ ] `npm test`, `npx tsc --noEmit`, `npm run build`; confirm `three` is in a separate chunk (`dist/assets/*` listing).
- [ ] README: "3D layer" paragraph + fallbacks. Commit `docs: describe the 3D layer`.
- [ ] Push branch, open PR, merge to `main`, confirm Vercel deployment and live marker (a `three` chunk referenced from the live JS).
