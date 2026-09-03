import confetti from "canvas-confetti";

const COLORS = ["#38bdf8", "#a78bfa", "#34d399", "#fbbf24", "#f472b6"];

export function reducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** One confetti burst. No-op under prefers-reduced-motion. */
export function burst(opts: confetti.Options = {}) {
  if (reducedMotion()) return;
  void confetti({
    particleCount: 90,
    spread: 70,
    startVelocity: 38,
    origin: { y: 0.7 },
    colors: COLORS,
    zIndex: 130,
    disableForReducedMotion: true,
    ...opts,
  });
}

/** Two side cannons, used for the big moments (level up, boss defeated). */
export function cannons() {
  if (reducedMotion()) return;
  burst({ particleCount: 70, angle: 60, spread: 55, origin: { x: 0, y: 0.75 } });
  burst({ particleCount: 70, angle: 120, spread: 55, origin: { x: 1, y: 0.75 } });
}
