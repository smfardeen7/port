import { useEffect, useState } from "react";

let webgl: boolean | null = null;

/** True when the browser can create a WebGL context. Cached after the first call. */
export function hasWebGL(): boolean {
  if (webgl !== null) return webgl;
  try {
    const canvas = document.createElement("canvas");
    webgl = !!(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    webgl = false;
  }
  return webgl;
}

const REDUCE = "(prefers-reduced-motion: reduce)";

/** Should 3D scenes render at all? WebGL available and reduced motion off. */
export function use3D(): boolean {
  const [ok, setOk] = useState(
    () => typeof window !== "undefined" && hasWebGL() && !window.matchMedia(REDUCE).matches
  );
  useEffect(() => {
    const mq = window.matchMedia(REDUCE);
    const update = () => setOk(hasWebGL() && !mq.matches);
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return ok;
}

function hslToHex(h: number, s: number, l: number): string {
  const sat = s / 100;
  const light = l / 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = sat * Math.min(light, 1 - light);
  const f = (n: number) => light - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  const toHex = (v: number) => Math.round(v * 255).toString(16).padStart(2, "0");
  return `#${toHex(f(0))}${toHex(f(8))}${toHex(f(4))}`;
}

/** Current accent colour as a hex string, read from the theme variables. */
export function accentColor(): string {
  const raw = getComputedStyle(document.documentElement).getPropertyValue("--accent").trim();
  const m = raw.match(/([\d.]+)\s+([\d.]+)%\s+([\d.]+)%/);
  if (!m) return "#38bdf8";
  return hslToHex(Number(m[1]), Number(m[2]), Number(m[3]));
}

export function isDarkTheme(): boolean {
  return document.documentElement.classList.contains("dark");
}
