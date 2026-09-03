import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ArrowDown, RotateCcw, Swords } from "lucide-react";
import {
  answer,
  createRound,
  initialBoss,
  mulberry32,
  type BossState,
  type RoundQuestion,
} from "@/game/boss";
import { BOSS_FRAME } from "@/game/sprites";
import { useGame } from "@/game/store";
import { sfx } from "@/game/sfx";
import { cannons } from "@/game/confetti";
import PixelSprite from "./PixelSprite";

const REVEAL_MS = 1200;

export default function BossFight() {
  const bossDefeated = useGame((s) => s.bossDefeated);
  const defeatBoss = useGame((s) => s.defeatBoss);
  const reduce = useReducedMotion();

  const [round, setRound] = useState<RoundQuestion[] | null>(null);
  const [boss, setBoss] = useState<BossState | null>(null);
  const [choice, setChoice] = useState<number | null>(null);
  const [hit, setHit] = useState(0);
  const [lastCorrect, setLastCorrect] = useState(false);
  const [flash, setFlash] = useState(false);
  const timer = useRef<number>();

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const startFight = () => {
    const r = createRound(mulberry32(Date.now() >>> 0), 5);
    setRound(r);
    setBoss(initialBoss(r.length));
    setChoice(null);
    sfx.blip();
  };

  const pick = (i: number) => {
    if (!round || !boss || choice !== null || boss.status !== "playing") return;
    const q = round[boss.index];
    const correct = i === q.answerIndex;
    setChoice(i);
    setLastCorrect(correct);
    if (correct) {
      sfx.coin();
      setHit((h) => h + 1);
    } else {
      sfx.hurt();
      setFlash(true);
      window.setTimeout(() => setFlash(false), 320);
    }
    const next = answer(boss, correct);
    timer.current = window.setTimeout(() => {
      setBoss(next);
      setChoice(null);
      if (next.status === "won") {
        sfx.win();
        cannons();
        defeatBoss();
      } else if (next.status === "lost") {
        sfx.lose();
      }
    }, REVEAL_MS);
  };

  const question = round && boss && boss.status === "playing" ? round[boss.index] : null;

  return (
    <section id="boss" className="section-container">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5 }}
      >
        <span className="eyebrow">boss fight</span>
        <h2 className="section-title">The Hiring Manager</h2>
        <p className="section-subtitle">
          Five questions about this portfolio. Three hits take the boss down,
          three misses take you down. Win to open the final gate.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="glass-card relative mt-10 overflow-hidden"
      >
        {/* Damage flash */}
        <AnimatePresence>
          {flash && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="pointer-events-none absolute inset-0 z-10 bg-red-500/15"
            />
          )}
        </AnimatePresence>

        {/* Arena header: boss + bars */}
        <div className="flex flex-col gap-6 border-b border-border/50 bg-muted/20 p-6 sm:flex-row sm:items-center">
          <motion.div
            key={hit}
            animate={reduce ? undefined : { y: [0, -5, 0] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
            className={`relative mx-auto shrink-0 sm:mx-0 ${hit > 0 ? "animate-shake" : ""}`}
          >
            <PixelSprite map={BOSS_FRAME} scale={4} />
            <AnimatePresence>
              {hit > 0 && boss?.status === "playing" && choice !== null && lastCorrect && (
                <motion.span
                  key={hit}
                  initial={{ opacity: 1, y: 0, scale: 0.8 }}
                  animate={{ opacity: 0, y: -40, scale: 1.3 }}
                  transition={{ duration: 0.9, ease: "easeOut" }}
                  className="pointer-events-none absolute -right-4 -top-2 font-pixel text-sm text-amber-400"
                >
                  -1
                </motion.span>
              )}
            </AnimatePresence>
          </motion.div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-3">
              <p className="font-pixel text-[10px] text-foreground">THE HIRING MANAGER</p>
              <span className="font-mono text-[10px] text-muted-foreground">
                {boss ? `HP ${boss.bossHp}/${boss.maxHp}` : bossDefeated ? "Defeated" : "HP 3/3"}
              </span>
            </div>
            <div className="mt-2 flex gap-1" role="img" aria-label="Boss health">
              {Array.from({ length: boss?.maxHp ?? 3 }, (_, i) => {
                const full = boss ? i < boss.bossHp : !bossDefeated;
                return (
                  <motion.span
                    key={i}
                    initial={false}
                    animate={{ opacity: full ? 1 : 0.2, scaleY: full ? 1 : 0.6 }}
                    className="h-3 flex-1 rounded-sm bg-gradient-to-r from-red-500 to-amber-400"
                  />
                );
              })}
            </div>

            <div className="mt-4 flex items-center justify-between">
              <p className="text-xs text-muted-foreground">Your hearts</p>
              <span className="font-pixel text-xs tracking-wider" aria-label={`${boss?.hearts ?? 3} hearts`}>
                {Array.from({ length: 3 }, (_, i) => (
                  <span key={i} className={i < (boss?.hearts ?? 3) ? "text-red-400" : "text-muted-foreground/30"}>
                    ♥
                  </span>
                ))}
              </span>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Idle */}
          {!round && (
            <div className="flex flex-col items-center gap-4 py-4 text-center">
              <p className="max-w-md text-sm text-muted-foreground">
                {bossDefeated
                  ? "Already defeated. Fight again for bragging rights; the reward stays yours."
                  : "Everything you need is somewhere on this page. Wrong answers cost a heart."}
              </p>
              <button
                type="button"
                onClick={startFight}
                className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 font-pixel text-[10px] text-accent-foreground shadow-lg shadow-accent/25 transition-transform hover:scale-[1.03]"
              >
                <Swords className="h-3.5 w-3.5" />
                {bossDefeated ? "FIGHT AGAIN" : "CHALLENGE"}
              </button>
            </div>
          )}

          {/* Question */}
          {question && boss && (
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                Question {boss.index + 1} of {boss.total}
              </p>
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={question.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.22 }}
                >
                  <h3 className="mt-2 font-display text-lg font-semibold leading-snug md:text-xl">
                    {question.prompt}
                  </h3>

                  <div className="mt-5 grid gap-2 sm:grid-cols-2">
                    {question.options.map((opt, i) => {
                      const revealed = choice !== null;
                      const isAnswer = i === question.answerIndex;
                      const isChoice = i === choice;
                      let cls = "border-border bg-card/50 hover:border-accent/50 hover:bg-accent/5";
                      if (revealed && isAnswer) cls = "border-emerald-400 bg-emerald-400/10 text-foreground";
                      else if (revealed && isChoice) cls = "border-red-400 bg-red-400/10 text-foreground";
                      else if (revealed) cls = "border-border/50 bg-card/30 text-muted-foreground";
                      return (
                        <motion.button
                          key={`${question.id}-${i}`}
                          type="button"
                          disabled={revealed}
                          onClick={() => pick(i)}
                          whileTap={revealed ? undefined : { scale: 0.98 }}
                          className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-colors ${cls}`}
                        >
                          <span className="font-pixel text-[9px] text-accent">{["A", "B", "C", "D"][i]}</span>
                          <span>{opt}</span>
                        </motion.button>
                      );
                    })}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          )}

          {/* Won */}
          {boss?.status === "won" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-4 py-4 text-center"
            >
              <p className="pixel-glitch font-pixel text-base text-foreground md:text-xl">BOSS DEFEATED</p>
              <p className="max-w-md text-sm text-muted-foreground">
                The Hiring Manager is impressed. The final gate is open and the
                "Hired!" badge is yours.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2">
                <a
                  href="#contact"
                  className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-accent-foreground shadow-lg shadow-accent/25 transition-opacity hover:opacity-90"
                >
                  Claim your reward
                  <ArrowDown className="h-4 w-4" />
                </a>
                <button
                  type="button"
                  onClick={startFight}
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-card/50 px-5 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  <RotateCcw className="h-4 w-4" />
                  Fight again
                </button>
              </div>
            </motion.div>
          )}

          {/* Lost */}
          {boss?.status === "lost" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-4 py-4 text-center"
            >
              <p className="font-pixel text-base text-red-400 md:text-xl">DEFEATED</p>
              <p className="max-w-md text-sm text-muted-foreground">
                The answers are all on this page. Scroll up, have another look,
                and try a fresh set of questions.
              </p>
              <button
                type="button"
                onClick={startFight}
                className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-accent-foreground shadow-lg shadow-accent/25 transition-opacity hover:opacity-90"
              >
                <RotateCcw className="h-4 w-4" />
                Try again
              </button>
            </motion.div>
          )}
        </div>
      </motion.div>
    </section>
  );
}
