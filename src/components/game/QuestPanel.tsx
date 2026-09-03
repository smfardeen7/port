import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Lock, X } from "lucide-react";
import { useGame, useLevel, factsFrom } from "@/game/store";
import { EXTRA_ACHIEVEMENTS, QUESTS, questProgress } from "@/game/quests";
import { lockScroll, unlockScroll } from "@/lib/scroll";
import { sfx } from "@/game/sfx";

type Tab = "quests" | "badges";

function Panel() {
  const state = useGame();
  const level = useLevel();
  const [tab, setTab] = useState<Tab>("quests");
  const [confirmReset, setConfirmReset] = useState(false);
  const facts = factsFrom(state);
  const close = () => state.setPanel(false);

  useEffect(() => {
    lockScroll();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      unlockScroll();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const badges = [
    ...QUESTS.map((q) => ({ id: q.id, title: q.title, description: q.description, icon: q.icon, hidden: q.hidden })),
    ...EXTRA_ACHIEVEMENTS.map((a) => ({ ...a, hidden: false })),
  ];

  return (
    <motion.div
      className="fixed inset-0 z-[90]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
    >
      <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" onClick={close} />
      <motion.aside
        role="dialog"
        aria-modal="true"
        aria-label="Quest log"
        initial={{ x: 40, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 40, opacity: 0 }}
        transition={{ type: "spring", stiffness: 320, damping: 32 }}
        className="absolute right-0 top-0 flex h-full w-full max-w-sm flex-col border-l border-border bg-card shadow-2xl"
      >
        <header className="flex items-center justify-between border-b border-border/60 px-5 py-4">
          <div>
            <h2 className="font-pixel text-xs text-accent">Quest log</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              {state.playerName} · Lv {level.level} {level.title} · {state.xp} XP
            </p>
          </div>
          <button
            onClick={close}
            aria-label="Close quest log"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="flex gap-1 border-b border-border/60 px-3 pt-2">
          {(["quests", "badges"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => {
                sfx.blip();
                setTab(t);
              }}
              className={`relative px-3 pb-2 pt-1 text-sm font-medium capitalize transition-colors ${
                tab === t ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t}
              {tab === t && (
                <motion.span layoutId="quest-tab" className="absolute inset-x-2 -bottom-px h-0.5 bg-accent" />
              )}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-3" data-lenis-prevent>
          {tab === "quests" && (
            <ul className="space-y-2">
              {QUESTS.map((q) => {
                const p = questProgress(q, facts);
                const secret = q.hidden && !p.done;
                return (
                  <li
                    key={q.id}
                    className={`rounded-xl border p-3 transition-colors ${
                      p.done ? "border-accent/40 bg-accent/5" : "border-border/60 bg-muted/20"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-lg leading-none" aria-hidden="true">
                        {secret ? "❓" : q.icon}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-semibold">{secret ? "???" : q.title}</p>
                          {p.done ? (
                            <Check className="h-4 w-4 shrink-0 text-accent" />
                          ) : (
                            <span className="font-mono text-[10px] text-muted-foreground">
                              {p.value}/{p.target}
                            </span>
                          )}
                        </div>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {secret ? "A hidden quest. Old-school players will know." : q.description}
                        </p>
                        {!p.done && (
                          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                            <motion.div
                              className="h-full rounded-full bg-accent/70"
                              initial={false}
                              animate={{ width: `${(p.value / p.target) * 100}%` }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          {tab === "badges" && (
            <ul className="grid grid-cols-3 gap-2">
              {badges.map((b) => {
                const unlocked = state.achievements.includes(b.id);
                const secret = b.hidden && !unlocked;
                return (
                  <li
                    key={b.id}
                    title={secret ? "Hidden badge" : `${b.title}: ${b.description}`}
                    className={`flex flex-col items-center rounded-xl border p-3 text-center transition-all ${
                      unlocked
                        ? "border-accent/40 bg-accent/5"
                        : "border-border/60 bg-muted/20 opacity-50 grayscale"
                    }`}
                  >
                    <span className="text-2xl leading-none" aria-hidden="true">
                      {secret ? "❓" : b.icon}
                    </span>
                    <span className="mt-2 line-clamp-2 text-[11px] font-medium leading-tight">
                      {secret ? "???" : b.title}
                    </span>
                    {!unlocked && <Lock className="mt-1.5 h-3 w-3 text-muted-foreground" aria-label="Locked" />}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <footer className="flex items-center justify-between border-t border-border/60 px-5 py-3 text-xs text-muted-foreground">
          <span>
            {state.quests.length}/{QUESTS.length} quests · {state.achievements.length}/{badges.length} badges
          </span>
          <button
            onClick={() => {
              if (!confirmReset) {
                setConfirmReset(true);
                return;
              }
              state.reset();
              setConfirmReset(false);
              close();
            }}
            onBlur={() => setConfirmReset(false)}
            className={`rounded-full px-2 py-1 transition-colors ${
              confirmReset ? "bg-red-500/15 text-red-400" : "hover:text-foreground"
            }`}
          >
            {confirmReset ? "Really reset?" : "Reset progress"}
          </button>
        </footer>
      </motion.aside>
    </motion.div>
  );
}

export default function QuestPanel() {
  const open = useGame((s) => s.panelOpen);
  return <AnimatePresence>{open && <Panel key="panel" />}</AnimatePresence>;
}
