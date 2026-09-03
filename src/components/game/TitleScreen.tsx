import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { FileText, Play, RotateCcw, Volume2, VolumeX } from "lucide-react";
import { RESUME_LINK } from "@/constants";
import { useGame } from "@/game/store";
import { levelInfo } from "@/game/levels";
import { setSoundEnabled, sfx, unlockAudio } from "@/game/sfx";
import PixelSprite from "./PixelSprite";
import Lazy3D from "../three/Lazy3D";

const PIXELS = 18;
const loadTitle = () => import("../three/TitleScene");

export default function TitleScreen() {
  const xp = useGame((s) => s.xp);
  const playerName = useGame((s) => s.playerName);
  const soundOn = useGame((s) => s.soundOn);
  const start = useGame((s) => s.start);
  const reset = useGame((s) => s.reset);
  const toggleSound = useGame((s) => s.toggleSound);
  const discoverZone = useGame((s) => s.discoverZone);
  const markResume = useGame((s) => s.markResume);
  const reduce = useReducedMotion();

  const [name, setName] = useState(playerName);
  const returning = xp > 0;
  const info = levelInfo(xp);

  const begin = useCallback(() => {
    unlockAudio();
    start(name);
    discoverZone("home");
  }, [start, discoverZone, name]);

  const newGame = () => {
    unlockAudio();
    reset();
    start(name);
    discoverZone("home");
  };

  const onSound = () => {
    const next = !soundOn;
    toggleSound();
    setSoundEnabled(next);
    if (next) sfx.blip();
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" && !(e.target instanceof HTMLButtonElement)) begin();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [begin]);

  const pixels = useMemo(
    () =>
      Array.from({ length: PIXELS }, (_, i) => ({
        id: i,
        left: `${(i * 53) % 100}%`,
        top: `${(i * 37 + 11) % 90}%`,
        size: 4 + ((i * 7) % 6),
        delay: (i % 6) * 0.6,
        duration: 5 + (i % 4),
        color: ["#38bdf8", "#a78bfa", "#34d399", "#fbbf24"][i % 4],
      })),
    []
  );

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-background"
      exit={{ opacity: 0, scale: 1.06 }}
      transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
      role="dialog"
      aria-modal="true"
      aria-label="Start screen"
    >
      {/* 3D floor scene, with the CSS grid as the fallback and loading state */}
      <Lazy3D
        load={loadTitle}
        className="absolute inset-0"
        margin="0px"
        fallback={
          <>
            <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-1/2 h-1/2">
              <div className="absolute inset-x-0 -top-24 h-48 bg-[radial-gradient(ellipse_at_center,hsl(var(--accent)/0.28),transparent_60%)]" />
              <div className={`title-grid absolute inset-0 ${reduce ? "" : "animate-grid-scroll"}`} />
            </div>
            <div aria-hidden="true" className="pointer-events-none absolute inset-0">
              {pixels.map((p) => (
                <motion.span
                  key={p.id}
                  className="absolute rounded-[1px]"
                  style={{ left: p.left, top: p.top, width: p.size, height: p.size, background: p.color }}
                  animate={reduce ? { opacity: 0.35 } : { y: [0, -28, 0], opacity: [0.15, 0.7, 0.15] }}
                  transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: "easeInOut" }}
                />
              ))}
            </div>
          </>
        }
      />

      <div className="relative z-10 mx-auto flex w-full max-w-md flex-col items-center px-6 text-center">
        <motion.div
          animate={reduce ? undefined : { y: [0, -6, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          className="mb-6"
        >
          <PixelSprite frame="idle" scale={5} />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="pixel-glitch font-pixel text-xl leading-relaxed text-foreground sm:text-2xl md:text-3xl"
        >
          FARDEEN.BIO
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-4 max-w-sm text-sm text-muted-foreground md:text-base"
        >
          An AI engineer's portfolio you can play. Explore the areas, unlock
          skills, collect projects, and beat the boss. Progress is saved in this
          browser.
        </motion.p>

        <motion.form
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          onSubmit={(e) => {
            e.preventDefault();
            begin();
          }}
          className="mt-8 flex w-full flex-col items-center gap-3"
        >
          {!returning && (
            <label className="flex w-full max-w-xs items-center gap-3 rounded-full border border-border bg-card/60 px-4 py-2 text-left backdrop-blur-sm focus-within:border-accent/60">
              <span className="font-pixel text-[9px] text-muted-foreground">P1</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={16}
                placeholder="Player name"
                aria-label="Player name"
                className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground/60"
              />
            </label>
          )}

          <button
            type="submit"
            className="group inline-flex items-center gap-3 rounded-full bg-accent px-7 py-3 font-pixel text-[11px] text-accent-foreground shadow-lg shadow-accent/25 transition-transform hover:scale-[1.03] active:scale-[0.98]"
          >
            <Play className="h-3.5 w-3.5 fill-current" />
            {returning ? `Continue · Lv ${info.level}` : "Start quest"}
          </button>

          {returning && (
            <p className="text-xs text-muted-foreground">
              Welcome back, {playerName}. {info.title} with {xp} XP.
            </p>
          )}

          <div className="mt-1 flex flex-wrap items-center justify-center gap-2">
            <a
              href={RESUME_LINK}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                markResume();
                begin();
              }}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card/50 px-4 py-2 text-xs font-medium text-muted-foreground transition-colors hover:border-accent/40 hover:text-foreground"
            >
              <FileText className="h-3.5 w-3.5" />
              Skip to the résumé
            </a>
            <button
              type="button"
              onClick={onSound}
              aria-pressed={soundOn}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card/50 px-4 py-2 text-xs font-medium text-muted-foreground transition-colors hover:border-accent/40 hover:text-foreground"
            >
              {soundOn ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
              Sound {soundOn ? "on" : "off"}
            </button>
            {returning && (
              <button
                type="button"
                onClick={newGame}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card/50 px-4 py-2 text-xs font-medium text-muted-foreground transition-colors hover:border-accent/40 hover:text-foreground"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                New game
              </button>
            )}
          </div>
        </motion.form>

        <p className="mt-10 hidden animate-blink font-pixel text-[9px] text-muted-foreground/80 sm:block">
          PRESS ENTER TO START
        </p>
      </div>
    </motion.div>
  );
}
