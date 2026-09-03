import Lenis from "lenis";

let lenis: Lenis | null = null;

const NAV_OFFSET = -72;

/**
 * Start Lenis smooth scrolling and route in-page anchor clicks through it.
 * Returns a cleanup function. Does nothing under prefers-reduced-motion.
 */
export function initSmoothScroll(): () => void {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return () => {};
  }
  lenis = new Lenis({ lerp: 0.1, smoothWheel: true });

  let raf = 0;
  const loop = (time: number) => {
    lenis?.raf(time);
    raf = requestAnimationFrame(loop);
  };
  raf = requestAnimationFrame(loop);

  const onClick = (e: MouseEvent) => {
    if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.button !== 0) return;
    const target = e.target as HTMLElement | null;
    const a = target?.closest?.("a[href^='#']") as HTMLAnchorElement | null;
    if (!a) return;
    e.preventDefault();
    scrollToHash(a.getAttribute("href") || "#");
  };
  document.addEventListener("click", onClick);

  return () => {
    cancelAnimationFrame(raf);
    document.removeEventListener("click", onClick);
    lenis?.destroy();
    lenis = null;
  };
}

/** Scroll to `#section` (or the top for `#`), using Lenis when active. */
export function scrollToHash(hash: string) {
  const isTop = hash.length <= 1;
  const el = isTop ? null : document.querySelector<HTMLElement>(hash);
  if (!isTop && !el) return;

  if (lenis) {
    lenis.scrollTo(el ?? 0, { offset: el ? NAV_OFFSET : 0 });
  } else if (el) {
    el.scrollIntoView({ behavior: "smooth" });
  } else {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  if (!isTop) history.replaceState(null, "", hash);
}

/** Freeze page scrolling while a modal or panel is open. */
export function lockScroll() {
  lenis?.stop();
  document.body.style.overflow = "hidden";
}

export function unlockScroll() {
  lenis?.start();
  document.body.style.overflow = "";
}
