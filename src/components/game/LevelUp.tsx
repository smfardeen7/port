import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGame } from "@/game/store";
import { LEVEL_TITLES } from "@/game/levels";
import { sfx } from "@/game/sfx";
import { cannons } from "@/game/confetti";

const TTL = 2600;

function Overlay({ level }: { level: number }) {
  const clear = useGame((s) => s.clearLevelUp);
  useEffect(() => {
    sfx.levelUp();
    cannons();
    const t = setTimeout(clear, TTL);
    return () => clearTimeout(t);
  }, [level, clear]);

  return (
    <motion.button
      type="button"
      onClick={clear}
      aria-label={`Level up to ${level}. Click to continue.`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-[95] flex cursor-pointer flex-col items-center justify-center bg-background/70 backdrop-blur-sm"
    >
      <motion.div
        aria-hidden="true"
        initial={{ scale: 0, opacity: 0.8 }}
        animate={{ scale: 3.2, opacity: 0 }}
        transition={{ duration: 1.1, ease: "easeOut" }}
        className="absolute h-40 w-40 rounded-full bg-[radial-gradient(circle,hsl(var(--accent)/0.6),transparent_65%)]"
      />
      <motion.span
        initial={{ scale: 0.6, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.05 }}
        className="pixel-glitch font-pixel text-2xl text-foreground md:text-4xl"
      >
        LEVEL UP!
      </motion.span>
      <motion.span
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        className="mt-5 font-pixel text-[11px] text-accent md:text-sm"
      >
        LV {level} · {LEVEL_TITLES[level - 1]}
      </motion.span>
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
        className="mt-8 text-xs text-muted-foreground"
      >
        Click anywhere to continue
      </motion.span>
    </motion.button>
  );
}

export default function LevelUp() {
  const levelUpTo = useGame((s) => s.levelUpTo);
  return (
    <AnimatePresence>
      {levelUpTo !== null && <Overlay key={levelUpTo} level={levelUpTo} />}
    </AnimatePresence>
  );
}
