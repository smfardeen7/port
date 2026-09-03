# Shaik Mohammad Fardeen — Portfolio

A developer portfolio you can play. Built with React, TypeScript, and Tailwind CSS, it wraps a scannable résumé site in a game layer: a title screen, XP and levels, quests and badges, a runner mini-game, a skill tree, loot-card projects, and a boss fight. Every section still reads as a normal portfolio, and a "Skip to the résumé" button is never more than a click away.

**Live:** [fardeen.bio](https://fardeen.bio/)

## Tech Stack

- **Framework:** React 18 + Vite 5
- **Language:** TypeScript
- **Styling:** Tailwind CSS 3.4 with CSS custom properties (HSL theming)
- **3D:** three.js via React Three Fiber, drei, and postprocessing (bloom), lazy-loaded
- **Animations:** Framer Motion, canvas-confetti, Lenis smooth scroll, Web Audio (synthesized sound, no audio files)
- **Game state:** zustand with localStorage persistence
- **Icons:** Lucide React, React Icons
- **Deployment:** Vercel

## Quest Mode

| Piece | What it does |
|---|---|
| Title screen | Press Start, pick a player name, sound toggle, or skip straight to the résumé. Returning visitors get "Continue". |
| Origin Story | Fardeen's journey as six chapters on a world map: the childhood spark, VIT Vellore, the first internship and IEEE, moving to the US, Quadrant, and now. RPG dialogue box with typewriter text; reading every chapter completes a quest. |
| HUD | Bottom-left player card (bottom bar on phones) with level, XP bar, quest count, sound and résumé buttons. |
| Zones | Every section is an area. Scrolling into one for the first time shows a "New area discovered" banner and grants XP. |
| Quests and badges | Twelve quests (discover areas, unlock skills, collect projects, open the résumé, copy the email, beat the boss, a hidden cheat code) plus level-milestone badges, all in a slide-over quest log. |
| Skill Run | Canvas runner in the hero. Space or tap to jump over bugs and collect tech icons. Every icon is XP; 15 in one run earns the Sprinter badge. Pauses when hidden or scrolled away. |
| Skill Forge | Skills drawn as radial trees per category. Click a node to unlock it, click the core to unlock the whole branch. Phones get an unlockable chip grid. |
| Career Road | A pixel character walks the experience timeline as you scroll; checkpoints light up as they are reached. |
| Loot Vault | Projects as loot cards with rarity by category (Research is Legendary, AI & ML is Epic, Full-Stack is Rare, DevOps is Uncommon), a pointer-following shine, and a "Collected" stamp once opened. |
| Boss fight | "The Hiring Manager": five multiple-choice questions about the portfolio. Three hits win, three misses lose. Winning unlocks the "Hired!" badge and lights up the contact CTA. |
| Level up | Eight levels from Intern to Legend with a full-screen moment and confetti. |
| Cheat code | The Konami code does what you would expect. |

### 3D layer

Five scenes built with React Three Fiber, all generated at runtime from the pixel sprites and icons already in the repo (no model or texture files):

| Scene | Where | What |
|---|---|---|
| Title | start screen | Neon grid floor scrolling toward you, star field, and the voxel player standing on it with bloom |
| Hero | next to Skill Run | The voxel player turning toward the pointer with tech-icon coins orbiting on two rings |
| Skill Galaxy | top of Skill Forge | All 52 skills as icons on a sphere. Drag to spin, click to unlock, unlocked icons glow |
| Boss | arena header | The Hiring Manager in voxels, recoiling on hits and toppling when beaten |

The player is the voxel character by default. To show a real likeness instead, create an avatar at readyplayer.me and set `VITE_AVATAR_URL` to its `.glb` link (locally in `.env`, on Vercel in the project's environment variables); the avatar then replaces the voxel figure in the title and hero scenes.

The 3D code is code-split and only loads when WebGL is available and `prefers-reduced-motion` is off. Each scene has a 2D fallback, renders only while it is near the viewport and the tab is visible, and caps device pixel ratio at 1.5.

Progress lives in `localStorage` under `quest-mode-v1`. Reset it from the quest log or the command palette. Sound is off by default, synthesized with the Web Audio API, and respects `prefers-reduced-motion` alongside every animation (smooth scroll and confetti switch off).

## Features

- Dark mode as default with toggleable light theme
- Command palette (`⌘K` / `Ctrl-K`): jump to any section, copy email, open résumé, toggle theme
- Ambient animated aurora background with grain and a fading dot grid
- Live GitHub stats pulled client-side from the GitHub API (repos, followers, forks, top languages), cached in `localStorage`
- Project cards open a detail modal; filter chips by category (AI & ML / Full-Stack / Research)
- Rotating role headline, cursor-tracking hero spotlight, and a top scroll-progress bar
- Animated count-up stats in the TL;DR section
- Copy-email button with confirmation toast
- Custom animated cursor with magnetic hover effects on links and buttons
- Infinite scrolling marquee keyword strip
- Active section highlighting in navbar via IntersectionObserver
- Scroll-to-top button and floating TL;DR shortcut
- Responsive design across all breakpoints, with `prefers-reduced-motion` respected
- Smooth scroll with hash-based navigation

## Sections

| Section | Description |
|---------|-------------|
| Hero | Introduction, social links, CTAs, and the Skill Run mini-game |
| Experience | Career Road: roles at Quadrant Technologies, Pratham USA, IEEE, and Ethnus Codemithra |
| Skills | Skill Forge: unlockable radial skill trees grouped by category |
| Education | Academic background with institution logo and Lottie animation |
| Certifications | Licenses and programs, with issuer, date, and skills |
| Projects | Loot Vault: filterable loot cards (AI & ML / Full-Stack / DevOps / Research); each opens a detail modal |
| Publications | Peer-reviewed research, with venue and summary |
| GitHub | Live stats and most-used languages from the GitHub API |
| TL;DR | Quick summary with animated key stats and a stylized code block |
| Boss | The Hiring Manager quiz |
| Contact | Profile photo, social links, email, and resume; glows once the boss is beaten |

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Run the unit tests (game rules: levels, quests, boss, runner, sprites)
npm test

# Build for production
npm run build
```

## Inspiration

- [devar.sh](https://www.devar.sh/)
- [utkarshkumar.vercel.app](https://utkarshkumar.vercel.app/)
- [parthsharma.me](https://parthsharma.me/)
- [parthmittal.netlify.app](https://parthmittal.netlify.app/)

## License

Feel free to use this as a template for your own portfolio. Contributions are welcome.
