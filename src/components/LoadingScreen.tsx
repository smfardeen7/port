import { useCallback, useEffect, useRef, useState } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
} from "framer-motion";
import Lottie from "lottie-react";
import heroAnimation from "@/assets/images/Hero/main_comp.json";
import { ABOUT_ME } from "@/constants";
import { useGame } from "@/game/store";

interface LoadingScreenProps {
  onComplete?: () => void;
}

/** Status line shown under the progress bar as it climbs. */
const BOOT_LOG: { at: number; log: string }[] = [
  { at: 0, log: "Loading developer profile…" },
  { at: 25, log: "Initializing AI & ML research modules…" },
  { at: 50, log: "Syncing George Mason University coursework…" },
  { at: 75, log: "Hydrating quests, badges, and the boss arena…" },
  { at: 100, log: "Ready." },
];

/**
 * A brief, automatic preloader: the illustration and progress bar play once,
 * then the screen dissolves into the site on its own — no key press, no
 * click required. A small "Skip" link lets an impatient visitor jump ahead.
 */
export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [log, setLog] = useState(BOOT_LOG[0].log);
  const [closing, setClosing] = useState(false);
  const start = useGame((s) => s.start);
  const discoverZone = useGame((s) => s.discoverZone);
  const reduce = useReducedMotion();

  const cardRef = useRef<HTMLDivElement>(null);
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const mx = useSpring(rawX, { stiffness: 120, damping: 16 });
  const my = useSpring(rawY, { stiffness: 120, damping: 16 });
  const rotateX = useTransform(my, [-0.5, 0.5], [4, -4]);
  const rotateY = useTransform(mx, [-0.5, 0.5], [-4, 4]);

  const onMouseMove = (e: React.MouseEvent) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    rawX.set((e.clientX - rect.left) / rect.width - 0.5);
    rawY.set((e.clientY - rect.top) / rect.height - 0.5);
  };
  const onMouseLeave = () => {
    rawX.set(0);
    rawY.set(0);
  };

  const finish = useCallback(() => {
    setClosing(true);
    start();
    discoverZone("home");
    setTimeout(() => onComplete?.(), reduce ? 200 : 700);
  }, [start, discoverZone, onComplete, reduce]);

  useEffect(() => {
    const duration = reduce ? 350 : 2200;
    const tick = 20;
    const step = 100 / (duration / tick);
    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = Math.min(100, prev + step);
        const entry = [...BOOT_LOG].reverse().find((l) => next >= l.at);
        if (entry) setLog(entry.log);
        if (next >= 100) {
          clearInterval(timer);
          setTimeout(finish, reduce ? 100 : 450);
        }
        return next;
      });
    }, tick);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduce]);

  return (
    <AnimatePresence>
      {!closing && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduce ? 0.2 : 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-background"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_50%_0%,hsl(var(--accent)/0.14),transparent_70%)]"
          />

          <motion.div
            ref={cardRef}
            onMouseMove={onMouseMove}
            onMouseLeave={onMouseLeave}
            style={reduce ? undefined : { rotateX, rotateY, transformStyle: "preserve-3d" }}
            className="relative z-10 flex w-full max-w-sm flex-col items-center px-6 text-center"
          >
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="w-48 sm:w-60"
            >
              <Lottie animationData={heroAnimation} loop />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.5 }}
              className="mt-1 font-display text-3xl font-bold tracking-tight sm:text-4xl"
            >
              <span className="gradient-text">FARDEEN.BIO</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="mt-2 text-sm text-muted-foreground"
            >
              {ABOUT_ME.tagLine}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.5 }}
              className="mt-7 w-full"
            >
              <div className="flex items-center justify-between font-mono text-[11px] text-muted-foreground">
                <span className="truncate pr-3">{log}</span>
                <span className="tabular-nums text-foreground">{Math.round(progress)}%</span>
              </div>
              <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-accent to-sky-300"
                  initial={false}
                  animate={{ width: `${progress}%` }}
                  transition={{ ease: "easeOut", duration: 0.15 }}
                />
              </div>
            </motion.div>
          </motion.div>

          <button
            type="button"
            onClick={finish}
            className="absolute bottom-5 right-5 z-10 font-mono text-xs text-muted-foreground/70 underline-offset-4 transition-colors hover:text-foreground hover:underline"
          >
            Skip
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
