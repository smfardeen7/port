import { useEffect, useRef, useState } from "react";

interface Options {
  /** Final value to count to. */
  end: number;
  /** Duration in ms. */
  duration?: number;
  /** Start counting only once this is true (e.g. when scrolled into view). */
  start?: boolean;
  /** Decimal places to render. */
  decimals?: number;
}

/**
 * Animates a number from 0 to `end` with an ease-out curve once `start` flips
 * true. Respects prefers-reduced-motion by jumping straight to the value.
 */
export function useCountUp({
  end,
  duration = 1400,
  start = true,
  decimals = 0,
}: Options): string {
  const [value, setValue] = useState(0);
  const frame = useRef<number>();

  useEffect(() => {
    if (!start) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setValue(end);
      return;
    }

    const startTime = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(end * eased);
      if (t < 1) frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);

    return () => {
      if (frame.current) cancelAnimationFrame(frame.current);
    };
  }, [end, duration, start]);

  return value.toFixed(decimals);
}
