import { motion } from "framer-motion";
import { FileText, ScrollText, Volume2, VolumeX } from "lucide-react";
import { RESUME_LINK } from "@/constants";
import { useGame, useLevel } from "@/game/store";
import { QUESTS } from "@/game/quests";
import { setSoundEnabled, sfx } from "@/game/sfx";
import PixelSprite from "./PixelSprite";

function useHud() {
  const playerName = useGame((s) => s.playerName);
  const xp = useGame((s) => s.xp);
  const soundOn = useGame((s) => s.soundOn);
  const questsDone = useGame((s) => s.quests.length);
  const setPanel = useGame((s) => s.setPanel);
  const toggleSound = useGame((s) => s.toggleSound);
  const markResume = useGame((s) => s.markResume);
  const level = useLevel();

  const onSound = () => {
    const next = !soundOn;
    toggleSound();
    setSoundEnabled(next);
    if (next) sfx.blip();
  };
  const openQuests = () => {
    sfx.blip();
    setPanel(true);
  };

  return { playerName, xp, soundOn, questsDone, level, onSound, openQuests, markResume };
}

function XpBar({ progress, className = "" }: { progress: number; className?: string }) {
  return (
    <div
      className={`h-2 overflow-hidden rounded-full bg-muted ${className}`}
      role="progressbar"
      aria-label="Experience toward next level"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(progress * 100)}
    >
      <motion.div
        className="h-full rounded-full bg-gradient-to-r from-accent to-sky-300"
        initial={false}
        animate={{ width: `${Math.max(2, progress * 100)}%` }}
        transition={{ type: "spring", stiffness: 120, damping: 20 }}
      />
    </div>
  );
}

const btn =
  "flex h-8 items-center gap-1.5 rounded-full border border-border bg-card/60 px-2.5 text-[11px] font-medium text-muted-foreground transition-colors hover:border-accent/40 hover:text-foreground";

export default function HUD() {
  const h = useHud();
  const xpLabel = h.level.next === null ? `${h.xp} XP` : `${h.xp} / ${h.level.next} XP`;

  return (
    <>
      {/* Desktop card */}
      <motion.aside
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        aria-label="Player status"
        className="fixed bottom-5 left-5 z-[60] hidden w-[268px] rounded-2xl border border-border/70 bg-card/85 p-3 shadow-xl shadow-black/10 backdrop-blur-md sm:block"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-end justify-center overflow-hidden rounded-lg bg-muted/70">
            <PixelSprite frame="idle" scale={3} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline justify-between gap-2">
              <span className="truncate text-sm font-semibold">{h.playerName}</span>
              <span className="font-pixel text-[9px] text-accent">LV {h.level.level}</span>
            </div>
            <p className="mt-0.5 truncate text-xs text-muted-foreground">{h.level.title}</p>
          </div>
        </div>

        <XpBar progress={h.level.progress} className="mt-3" />
        <div className="mt-1.5 flex items-center justify-between font-mono text-[10px] text-muted-foreground">
          <span>{xpLabel}</span>
          <span>
            {h.questsDone}/{QUESTS.length} quests
          </span>
        </div>

        <div className="mt-3 flex items-center gap-1.5">
          <button onClick={h.openQuests} className={btn} aria-label="Open quest log">
            <ScrollText className="h-3.5 w-3.5" />
            Quests
          </button>
          <button onClick={h.onSound} className={btn} aria-pressed={h.soundOn} aria-label="Toggle sound">
            {h.soundOn ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
          </button>
          <a
            href={RESUME_LINK}
            target="_blank"
            rel="noopener noreferrer"
            onClick={h.markResume}
            className={`${btn} ml-auto`}
          >
            <FileText className="h-3.5 w-3.5" />
            Résumé
          </a>
        </div>
      </motion.aside>

      {/* Mobile bar */}
      <motion.aside
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        aria-label="Player status"
        className="fixed inset-x-0 bottom-0 z-[60] flex items-center gap-3 border-t border-border/70 bg-background/90 px-3 py-2 backdrop-blur-md sm:hidden"
      >
        <div className="flex h-9 w-9 shrink-0 items-end justify-center overflow-hidden rounded-md bg-muted/70">
          <PixelSprite frame="idle" scale={2} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between">
            <span className="font-pixel text-[8px] text-accent">LV {h.level.level}</span>
            <span className="font-mono text-[10px] text-muted-foreground">{xpLabel}</span>
          </div>
          <XpBar progress={h.level.progress} className="mt-1 h-1.5" />
        </div>
        <button onClick={h.openQuests} className={btn} aria-label="Open quest log">
          <ScrollText className="h-3.5 w-3.5" />
          {h.questsDone}/{QUESTS.length}
        </button>
        <button onClick={h.onSound} className={btn} aria-pressed={h.soundOn} aria-label="Toggle sound">
          {h.soundOn ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
        </button>
      </motion.aside>
    </>
  );
}
