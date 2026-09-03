import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGame, type Toast } from "@/game/store";
import { sfx } from "@/game/sfx";

const TTL = 2200;

function Banner({ toast }: { toast: Toast }) {
  const dismiss = useGame((s) => s.dismissToast);
  useEffect(() => {
    sfx.zone();
    const t = setTimeout(() => dismiss(toast.id), TTL);
    return () => clearTimeout(t);
  }, [toast.id, dismiss]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ type: "spring", stiffness: 300, damping: 26 }}
      className="pointer-events-none flex flex-col items-center rounded-2xl border border-accent/30 bg-card/90 px-6 py-3 text-center shadow-lg shadow-accent/10 backdrop-blur-md"
    >
      <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
        New area discovered
      </span>
      <span className="mt-1.5 font-pixel text-xs text-accent md:text-sm">{toast.title}</span>
      {toast.xp ? (
        <span className="mt-1.5 font-mono text-[10px] text-muted-foreground">+{toast.xp} XP</span>
      ) : null}
    </motion.div>
  );
}

export default function ZoneBanner() {
  const toasts = useGame((s) => s.toasts);
  const dismiss = useGame((s) => s.dismissToast);
  const zones = toasts.filter((t) => t.kind === "zone");
  const zone = zones[zones.length - 1];

  // Only the newest area banner stays; older ones clear immediately.
  useEffect(() => {
    zones.slice(0, -1).forEach((z) => dismiss(z.id));
  }, [zones, dismiss]);

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed left-1/2 top-16 z-[86] -translate-x-1/2 sm:top-20"
    >
      <AnimatePresence>{zone && <Banner key={zone.id} toast={zone} />}</AnimatePresence>
    </div>
  );
}
