# Shaik Mohammad Fardeen — Portfolio

A modern, responsive developer portfolio built with React, TypeScript, and Tailwind CSS. Features a dark-first design with an optional light theme, smooth animations, and interactive UI elements.

**Live:** [fardeen.bio](https://fardeen.bio/)

## Tech Stack

- **Framework:** React 18 + Vite 5
- **Language:** TypeScript
- **Styling:** Tailwind CSS 3.4 with CSS custom properties (HSL theming)
- **Animations:** Framer Motion, Lottie (lottie-react)
- **Icons:** Lucide React, React Icons
- **Deployment:** Vercel

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
- Lottie animations (hero section, education section, loading screen)
- Active section highlighting in navbar via IntersectionObserver
- Scroll-to-top button and floating TL;DR shortcut
- Responsive design across all breakpoints, with `prefers-reduced-motion` respected
- Smooth scroll with hash-based navigation

## Sections

| Section | Description |
|---------|-------------|
| Hero | Introduction with Lottie animation, social links, and CTAs |
| Experience | Roles at Quadrant Technologies, Pratham USA, and Ethnus Codemithra |
| Skills | Interactive grid of tech skills grouped by category |
| Education | Academic background with institution logo and Lottie animation |
| Certifications | Licenses and programs, with issuer, date, and skills |
| Projects | Filterable project showcase (AI & ML / Full-Stack / DevOps / Research); each card opens a detail modal |
| Publications | Peer-reviewed research, with venue and summary |
| GitHub | Live stats and most-used languages from the GitHub API |
| TL;DR | Quick summary with animated key stats and a stylized code block |
| Contact | Profile photo, social links, email, and resume |

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

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
