import { useEffect } from "react";
import { ZONES } from "@/game/data";
import { useGame } from "@/game/store";

/**
 * Watches every zone's section and marks it discovered the first time a
 * meaningful part of it scrolls into view. Renders nothing.
 */
export default function ZoneObserver() {
  const discoverZone = useGame((s) => s.discoverZone);

  useEffect(() => {
    let observer: IntersectionObserver | null = null;
    const raf = requestAnimationFrame(() => {
      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            const zone = ZONES.find((z) => z.sectionId === entry.target.id);
            if (zone) discoverZone(zone.id);
            observer?.unobserve(entry.target);
          }
        },
        { threshold: 0.15, rootMargin: "-8% 0px -8% 0px" }
      );
      for (const zone of ZONES) {
        const el = document.getElementById(zone.sectionId);
        if (el) observer.observe(el);
      }
    });
    return () => {
      cancelAnimationFrame(raf);
      observer?.disconnect();
    };
  }, [discoverZone]);

  return null;
}
