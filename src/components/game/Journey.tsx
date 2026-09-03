import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ArrowRight, Check, ChevronLeft, ChevronRight } from "lucide-react";
import { CHAPTERS, CHAPTER_TOTAL } from "@/constants/journey";
import type { PlayerFrame } from "@/game/sprites";
import { useGame } from "@/game/store";
import { sfx } from "@/game/sfx";
import PixelSprite from "./PixelSprite";

/** Node positions on the map, in percent of the map box. */
const NODES: { x: number; y: number }[] = [
  { x: 9, y: 68 },
  { x: 25, y: 32 },
  { x: 42, y: 70 },
  { x: 58, y: 30 },
  { x: 75, y: 70 },
  { x: 91, y: 42 },
];

/** Smooth S-curves through the nodes, in a 1000×100 viewBox. */
function mapPath(nodes: { x: number; y: number }[]) {
  const pts = nodes.map((n) => ({ x: n.x * 10, y: n.y }));
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1];
    const b = pts[i];
    const mx = (a.x + b.x) / 2;
    d += ` C ${mx} ${a.y}, ${mx} ${b.y}, ${b.x} ${b.y}`;
  }
  return d;
}
const PATH = mapPath(NODES);

/** Types `text` out over time. Click-to-skip through `skip`. */
function useTypewriter(text: string, cps = 42) {
  const reduce = useReducedMotion();
  const [shown, setShown] = useState(reduce ? text : "");
  const [done, setDone] = useState(!!reduce);
  const raf = useRef(0);
  const startedAt = useRef(0);

  const skip = useCallback(() => {
    cancelAnimationFrame(raf.current);
    setShown(text);
    setDone(true);
  }, [text]);

  useEffect(() => {
    if (reduce) {
      setShown(text);
      setDone(true);
      return;
    }
    setShown("");
    setDone(false);
    startedAt.current = performance.now();
    const tick = (now: number) => {
      const n = Math.min(text.length, Math.floor(((now - startedAt.current) / 1000) * cps));
      setShown(text.slice(0, n));
      if (n < text.length) raf.current = requestAnimationFrame(tick);
      else setDone(true);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [text, cps, reduce]);

  return { shown, done, skip };
}

export default function Journey() {
  const [index, setIndex] = useState(0);
  const [walking, setWalking] = useState(false);
  const [frame, setFrame] = useState<PlayerFrame>("idle");
  const read = useGame((s) => s.chapters);
  const readChapter = useGame((s) => s.readChapter);
  const reduce = useReducedMotion();
  const chapter = CHAPTERS[index];
  const { shown, done, skip } = useTypewriter(chapter.text);
  const walkTimer = useRef<number>();

  const goTo = (i: number) => {
    if (i === index || i < 0 || i >= CHAPTER_TOTAL) return;
    sfx.blip();
    setIndex(i);
    setWalking(true);
    window.clearTimeout(walkTimer.current);
    walkTimer.current = window.setTimeout(() => setWalking(false), 700);
  };

  useEffect(() => {
    if (done) readChapter(chapter.id);
  }, [done, chapter.id, readChapter]);

  useEffect(() => {
    if (!walking || reduce) {
      setFrame("idle");
      return;
    }
    const id = window.setInterval(() => setFrame((f) => (f === "run1" ? "run2" : "run1")), 110);
    return () => window.clearInterval(id);
  }, [walking, reduce]);

  const progress = useMemo(() => index / (CHAPTER_TOTAL - 1), [index]);
  const node = NODES[index];

  return (
    <section id="journey" className="section-container">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5 }}
      >
        <span className="eyebrow">the journey</span>
        <h2 className="section-title">Origin Story</h2>
        <p className="section-subtitle">
          Six chapters, one player. Pick a chapter and I'll tell you what happened.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="glass-card mt-10 overflow-hidden"
      >
        {/* World map */}
        <div className="relative h-[150px] bg-muted/20 px-3 pt-2 md:h-[170px]" aria-label="Chapter map">
          <svg
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-6 inset-y-0 h-full w-[calc(100%-3rem)]"
            viewBox="0 0 1000 100"
            preserveAspectRatio="none"
          >
            <path d={PATH} fill="none" stroke="hsl(var(--border))" strokeWidth={2} strokeDasharray="4 6" vectorEffect="non-scaling-stroke" />
            <motion.path
              d={PATH}
              fill="none"
              stroke="hsl(var(--accent))"
              strokeWidth={2.5}
              vectorEffect="non-scaling-stroke"
              initial={false}
              animate={{ pathLength: progress }}
              transition={{ type: "spring", stiffness: 60, damping: 18 }}
            />
          </svg>

          {CHAPTERS.map((c, i) => {
            const isRead = read.includes(c.id);
            const isActive = i === index;
            const p = NODES[i];
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => goTo(i)}
                aria-current={isActive ? "step" : undefined}
                aria-label={`Chapter ${c.number}: ${c.title}${isRead ? ", read" : ""}`}
                style={{ left: `calc(1.5rem + (100% - 3rem) * ${p.x / 100})`, top: `${p.y}%` }}
                className={`absolute flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border font-pixel text-[9px] transition-all ${
                  isActive
                    ? "border-accent bg-accent text-accent-foreground shadow-[0_0_0_6px_hsl(var(--accent)/0.18)]"
                    : isRead
                      ? "border-accent/60 bg-accent/15 text-accent"
                      : "border-border bg-card text-muted-foreground hover:border-accent/50 hover:text-foreground"
                }`}
              >
                {isRead && !isActive ? <Check className="h-4 w-4" /> : c.number}
                <span
                  className={`pointer-events-none absolute left-1/2 -translate-x-1/2 whitespace-nowrap font-sans text-[10px] ${
                    p.y < 50 ? "-top-5" : "top-10"
                  } ${isActive ? "text-foreground" : "text-muted-foreground"}`}
                >
                  {c.title}
                </span>
              </button>
            );
          })}

          {/* Walker */}
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute z-10"
            initial={false}
            animate={{
              left: `calc(1.5rem + (100% - 3rem) * ${node.x / 100} + 46px)`,
              top: `calc(${node.y}% - 30px)`,
            }}
            transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 70, damping: 16 }}
            style={{ x: "-50%" }}
          >
            <PixelSprite frame={frame} scale={2} />
          </motion.div>
        </div>

        {/* Dialogue box */}
        <div className="grid gap-5 border-t border-border/50 p-5 md:grid-cols-[auto_1fr] md:p-6">
          <div className="flex items-start gap-4 md:flex-col md:items-center">
            <div className="flex h-[76px] w-[68px] items-end justify-center overflow-hidden rounded-xl border border-accent/40 bg-muted/60">
              <PixelSprite frame="idle" scale={4} />
            </div>
            <span className="rounded-full border border-accent/40 bg-accent/10 px-2.5 py-1 font-pixel text-[8px] text-accent">
              FARDEEN
            </span>
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  Chapter {chapter.number} of {CHAPTER_TOTAL}
                </span>
                <h3 className="mt-1 font-display text-xl font-bold leading-tight md:text-2xl">{chapter.title}</h3>
                <p className="mt-0.5 text-xs text-muted-foreground">{chapter.setting}</p>
              </div>
              <span className="font-mono text-[10px] text-muted-foreground">
                {read.length}/{CHAPTER_TOTAL} read
              </span>
            </div>

            <AnimatePresence mode="wait" initial={false}>
              <motion.button
                key={chapter.id}
                type="button"
                onClick={skip}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
                aria-label={done ? chapter.text : "Show the full chapter"}
                className="mt-4 block min-h-[7.5rem] w-full cursor-text text-left text-[15px] leading-relaxed text-foreground/90 md:min-h-[6.5rem]"
              >
                <span aria-hidden={!done}>{shown}</span>
                {!done && <span className="ml-0.5 inline-block h-4 w-2 animate-blink bg-accent align-middle" />}
              </motion.button>
            </AnimatePresence>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              {chapter.gains.map((g) => (
                <motion.span
                  key={`${chapter.id}-${g}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: done ? 1 : 0.35, scale: 1 }}
                  className="rounded-full border border-emerald-400/50 bg-emerald-400/10 px-2.5 py-1 font-mono text-[10px] text-emerald-400"
                >
                  +{g}
                </motion.span>
              ))}
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => goTo(index - 1)}
                disabled={index === 0}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/50 px-4 py-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                Back
              </button>
              {index < CHAPTER_TOTAL - 1 ? (
                <button
                  type="button"
                  onClick={() => goTo(index + 1)}
                  className="inline-flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-xs font-medium text-accent-foreground transition-opacity hover:opacity-90"
                >
                  Next chapter
                  <ChevronRight className={`h-3.5 w-3.5 ${done ? "animate-blink" : ""}`} />
                </button>
              ) : (
                chapter.link && (
                  <a
                    href={chapter.link.href}
                    className="inline-flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-xs font-medium text-accent-foreground transition-opacity hover:opacity-90"
                  >
                    {chapter.link.label}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </a>
                )
              )}
              {!done && (
                <span className="text-[11px] text-muted-foreground">Click the text to skip the typing.</span>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
