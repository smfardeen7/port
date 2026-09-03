import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGame, type Toast } from "@/game/store";
import { sfx } from "@/game/sfx";

const TTL = 3200;

function ToastItem({ toast }: { toast: Toast }) {
  const dismiss = useGame((s) => s.dismissToast);

  useEffect(() => {
    if (toast.kind === "quest") sfx.quest();
    else if (toast.kind === "achievement") sfx.unlock();
    else sfx.blip();
    const t = setTimeout(() => dismiss(toast.id), TTL);
    return () => clearTimeout(t);
  }, [toast.id, toast.kind, dismiss]);

  const accent =
    toast.kind === "quest"
      ? "border-amber-400/50"
      : toast.kind === "achievement"
        ? "border-violet-400/50"
        : "border-border";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 40, scale: 0.96 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 40, scale: 0.96 }}
      transition={{ type: "spring", stiffness: 380, damping: 30 }}
      className={`pointer-events-auto flex w-full items-start gap-3 rounded-xl border bg-card/95 p-3 shadow-lg shadow-black/10 backdrop-blur-md ${accent}`}
    >
      <span className="text-lg leading-none" aria-hidden="true">
        {toast.icon ?? (toast.kind === "quest" ? "✅" : "✨")}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{toast.title}</p>
        {toast.body && (
          <p className="mt-0.5 truncate text-xs text-muted-foreground">{toast.body}</p>
        )}
      </div>
      {toast.xp ? (
        <span className="shrink-0 rounded-full bg-accent/15 px-2 py-0.5 font-pixel text-[8px] text-accent">
          +{toast.xp} XP
        </span>
      ) : null}
    </motion.div>
  );
}

export default function Toasts() {
  const toasts = useGame((s) => s.toasts);
  const visible = toasts.filter((t) => t.kind !== "zone").slice(-4);

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-4 top-16 z-[85] flex flex-col gap-2 sm:inset-x-auto sm:right-4 sm:top-20 sm:w-[320px]"
    >
      <AnimatePresence initial={false}>
        {visible.map((t) => (
          <ToastItem key={t.id} toast={t} />
        ))}
      </AnimatePresence>
    </div>
  );
}
