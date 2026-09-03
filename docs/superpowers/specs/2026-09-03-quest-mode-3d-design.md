# Quest Mode 3D — Design

**Date:** 2026-09-03
**Status:** Approved (3D layers on Quest Mode; voxel and neon-glow finish)
**Builds on:** `2026-09-02-quest-mode-portfolio-design.md`

## Goal

Add real-time 3D to the Quest Mode portfolio without giving up the
scannable layout or the game already shipped. Five focused scenes, all in
the site's existing voxel/arcade identity, lazy-loaded with fallbacks so the
page still opens instantly and works without WebGL.

Non-goals: a walk-around world, custom 3D assets or GLTF files, physics,
replacing any existing section content.

## Constraints

- React 18 stays, so the 3D stack is pinned to the React 18 line:
  `three@0.170`, `@react-three/fiber@8`, `@react-three/drei@9`,
  `@react-three/postprocessing@2`.
- No binary assets. Every model is built procedurally from the pixel maps
  already in `src/game/sprites.ts` (extruded to voxels) and every texture is
  rasterized from `react-icons` at runtime.
- 3D code is code-split (`React.lazy`) and mounts only when WebGL is
  available, `prefers-reduced-motion` is off, and the scene is near the
  viewport. Every scene has a 2D fallback (the current visuals).
- Device pixel ratio clamped to 1.5 (backdrop: 1). Scenes stop rendering
  when scrolled out of view or the tab is hidden.
- Keyboard users lose nothing: every 3D interaction has a DOM equivalent
  that already exists (skill trees, boss buttons).

## Scenes

1. **Title scene** (title screen background). Low camera over a neon grid
   floor that scrolls toward the viewer, a star field and drifting sparkles
   above, and the voxel player standing at the centre, bobbing and turning
   toward the pointer. Bloom makes the accent lines and the shirt glow. The
   CSS grid stays as the fallback and shows while the chunk loads.
2. **Hero scene** (hero right column, above Skill Run). The voxel player at
   larger scale with twelve tech-icon coins orbiting on two tilted rings,
   spinning and bobbing; the whole group tilts with pointer parallax. Bloom.
3. **Backdrop** (fixed behind the page, on top of the aurora). About ninety
   translucent voxel cubes in the palette colours drifting slowly with
   pointer parallax and a gentle rise as the page scrolls. One instanced
   draw call, DPR 1, no post-processing.
4. **Skill Galaxy** (top of Skill Forge). All 52 skill icons as sprites on a
   sphere (Fibonacci distribution), auto-rotating, drag to spin. Locked
   icons are muted; unlocked icons take the accent colour and a soft glow
   halo. Hover shows the name in a caption below the canvas; click unlocks
   (same store action as the trees). Trees stay below for detail and
   keyboard access.
5. **Boss model** (boss arena header). The Hiring Manager extruded to
   voxels, hovering and slowly turning; on a hit it recoils and flashes red;
   on defeat it topples and shrinks away. The pixel sprite remains the
   fallback.

## Architecture

```
src/
  three/
    voxel.ts           pure: pixel map -> voxel list (x, y, z, color, glow)
    sphere.ts          pure: fibonacciSphere(n, radius) -> points
    support.ts         hasWebGL(), use3D() hook (webgl + reduced motion + in-view)
    textures.ts        rasterize react-icons -> THREE.Texture (cached)
  components/three/
    Scene.tsx          <Canvas> wrapper: dpr clamp, transparent, frameloop by `active`
    Lazy3D.tsx         React.lazy + Suspense + use3D gate + IntersectionObserver
    VoxelModel.tsx     instanced cubes from a pixel map (body + glow meshes)
    NeonFloor.tsx      shader plane: scrolling neon grid with distance fade
    TitleScene.tsx     scene 1
    HeroScene.tsx      scene 2
    Backdrop.tsx       scene 3
    SkillGalaxy.tsx    scene 4
    BossModel.tsx      scene 5
```

### Voxelization rule (`voxel.ts`)

Each non-transparent cell becomes a column of unit cubes centred on the
sprite's origin. Depth by key: head keys (`h`, `k`, `e`) 4 cubes, everything
else 3 cubes. Cells with keys `s` (shirt) and `r` (tie/red) are marked
`glow: true` and render with an emissive material so bloom picks them up.
Output is sorted by (y, x, z) for deterministic instance ids.

### Scene wrapper

`<Scene active dpr={[1,1.5]} camera>` renders `<Canvas frameloop={active ?
"always" : "never"} gl={{ alpha: true, antialias: true, powerPreference:
"high-performance" }}>` with `<Suspense fallback={null}>`. `Lazy3D` wraps
each scene: it checks `use3D()` (WebGL available, reduced motion off),
observes its own container to derive `active`, and renders `fallback`
whenever 3D is off or still loading.

### Bloom

`EffectComposer` with `Bloom` (`mipmapBlur`, `luminanceThreshold` 0.55,
`intensity` 0.8) in the title and hero scenes only. Other scenes fake glow
with additive sprites and emissive colour.

## Existing files touched

- `TitleScreen.tsx`: mounts `TitleScene` behind the content; CSS grid stays as fallback.
- `Hero.tsx`: right column becomes `HeroScene` over `SkillRun`.
- `App.tsx`: mounts `Backdrop` after `Aurora`.
- `Skills.tsx`: mounts `SkillGalaxy` between the header and the trees.
- `BossFight.tsx`: arena header uses `BossModel` with `PixelSprite` fallback.
- `game/icons.ts`: generalise the rasterizer to any icon list.
- `README.md`: document the 3D layer and the fallbacks.

## Testing

- Unit (node:test): `voxel.ts` (counts, depth rule, glow flag, bounds),
  `sphere.ts` (n points, on-radius, min spacing).
- Type check + production build; confirm the main chunk does not grow (3D is
  a separate chunk).
- Headless Chrome pass (WebGL via SwiftShader): title, hero, galaxy, boss all
  render non-blank canvases; zero console errors; reduced-motion run shows no
  canvases; existing flow still completes.

## Risks

- GPU load on low-end laptops: mitigated by DPR clamp, out-of-view pausing,
  bloom only in two scenes, and no scene larger than a few draw calls.
- Chunk size: three plus drei is roughly 200 kB gzipped, loaded after first
  paint and only when 3D is on.
- Transparent sprite sorting artefacts in the galaxy: `depthWrite` off and
  additive halos keep overlaps clean.
