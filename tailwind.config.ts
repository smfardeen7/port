import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Space Grotesk", "Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "monospace"],
        pixel: ["'Press Start 2P'", "ui-monospace", "monospace"],
      },
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        muted: "hsl(var(--muted))",
        "muted-foreground": "hsl(var(--muted-foreground))",
        card: "hsl(var(--card))",
        "card-foreground": "hsl(var(--card-foreground))",
        border: "hsl(var(--border))",
        accent: "hsl(var(--accent))",
        "accent-foreground": "hsl(var(--accent-foreground))",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.5s ease-out",
        "marquee-left": "marqueeLeft var(--marquee-duration, 30s) linear infinite",
        "marquee-right": "marqueeRight var(--marquee-duration, 30s) linear infinite",
        aurora: "aurora 22s ease-in-out infinite alternate",
        "aurora-slow": "aurora 34s ease-in-out infinite alternate-reverse",
        blink: "blink 1s steps(1) infinite",
        shake: "shake 0.4s ease-in-out",
        "pulse-ring": "pulseRing 1.4s ease-out infinite",
        "grid-scroll": "gridScroll 3s linear infinite",
      },
      keyframes: {
        blink: {
          "0%,49%": { opacity: "1" },
          "50%,100%": { opacity: "0" },
        },
        shake: {
          "0%,100%": { transform: "translateX(0)" },
          "20%": { transform: "translateX(-6px)" },
          "40%": { transform: "translateX(6px)" },
          "60%": { transform: "translateX(-4px)" },
          "80%": { transform: "translateX(4px)" },
        },
        pulseRing: {
          "0%": { boxShadow: "0 0 0 0 hsl(var(--accent) / 0.55)" },
          "100%": { boxShadow: "0 0 0 14px hsl(var(--accent) / 0)" },
        },
        gridScroll: {
          "0%": { backgroundPosition: "0 0" },
          "100%": { backgroundPosition: "0 48px" },
        },
        aurora: {
          "0%": { transform: "translate3d(-8%, -4%, 0) scale(1)" },
          "50%": { transform: "translate3d(6%, 8%, 0) scale(1.15)" },
          "100%": { transform: "translate3d(10%, -6%, 0) scale(1.05)" },
        },
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        slideUp: {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        marqueeLeft: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
        marqueeRight: {
          "0%": { transform: "translateX(-50%)" },
          "100%": { transform: "translateX(0%)" },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
