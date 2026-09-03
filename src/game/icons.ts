import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import type { IconType } from "react-icons";
import {
  SiClaude,
  SiDocker,
  SiFastapi,
  SiGit,
  SiKubernetes,
  SiMysql,
  SiPython,
  SiPytorch,
  SiReact,
  SiTensorflow,
  SiTypescript,
} from "react-icons/si";
import { FaAws } from "react-icons/fa6";

/** Coin icons for Skill Run, in the order `runner.ts` indexes them. */
export const RUN_ICONS: IconType[] = [
  SiPython,
  SiTensorflow,
  SiPytorch,
  SiReact,
  SiFastapi,
  SiDocker,
  SiKubernetes,
  FaAws,
  SiTypescript,
  SiClaude,
  SiGit,
  SiMysql,
];

export const RUN_ICON_NAMES = [
  "Python",
  "TensorFlow",
  "PyTorch",
  "React",
  "FastAPI",
  "Docker",
  "Kubernetes",
  "AWS",
  "TypeScript",
  "Claude",
  "Git",
  "SQL",
];

/**
 * Rasterize react-icons SVGs into <img> elements a canvas can draw.
 * A failed load resolves to null so callers can fall back to a glyph.
 */
export function rasterizeIcons(icons: IconType[], color: string, size: number) {
  return Promise.all(
    icons.map(
      (Icon) =>
        new Promise<HTMLImageElement | null>((resolve) => {
          let svg = renderToStaticMarkup(createElement(Icon, { color, size }));
          if (!svg.includes("xmlns=")) {
            svg = svg.replace("<svg", '<svg xmlns="http://www.w3.org/2000/svg"');
          }
          const img = new Image();
          img.onload = () => resolve(img);
          img.onerror = () => resolve(null);
          img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
        })
    )
  );
}

/** The Skill Run coin icons, rasterized. */
export function loadIconImages(color: string, size: number) {
  return rasterizeIcons(RUN_ICONS, color, size);
}
