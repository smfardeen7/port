import { useEffect, useRef, useState } from "react";
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { ExternalLink } from "lucide-react";
import { EXPERIENCES } from "@/constants";
import type { PlayerFrame } from "@/game/sprites";
import PixelSprite from "./PixelSprite";

const SPRITE_H = 48;

export default function CareerMap() {
  const ref = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [height, setHeight] = useState(0);
  const [active, setActive] = useState(-1);
  const [walking, setWalking] = useState(false);
  const [frame, setFrame] = useState<PlayerFrame>("idle");
  const walkTimer = useRef<number>();
  const reduce = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.7", "end 0.7"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [0, Math.max(0, height - SPRITE_H)]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setHeight(el.offsetHeight));
    ro.observe(el);
    setHeight(el.offsetHeight);
    return () => ro.disconnect();
  }, []);

  useMotionValueEvent(y, "change", (sy) => {
    let idx = -1;
    cardRefs.current.forEach((card, i) => {
      if (card && card.offsetTop <= sy + SPRITE_H * 0.6) idx = i;
    });
    setActive(idx);
    setWalking(true);
    window.clearTimeout(walkTimer.current);
    walkTimer.current = window.setTimeout(() => setWalking(false), 180);
  });

  useEffect(() => {
    if (!walking || reduce) {
      setFrame("idle");
      return;
    }
    const id = window.setInterval(
      () => setFrame((f) => (f === "run1" ? "run2" : "run1")),
      110
    );
    return () => window.clearInterval(id);
  }, [walking, reduce]);

  return (
    <div ref={ref} className="relative mt-12">
      {/* Track */}
      <div className="absolute left-[19px] top-2 hidden h-[calc(100%-16px)] w-px bg-border md:block" />
      <motion.div
        aria-hidden="true"
        style={{ height: y }}
        className="absolute left-[19px] top-2 hidden w-px bg-accent md:block"
      />

      {/* Walking sprite */}
      <motion.div
        aria-hidden="true"
        style={{ y, x: "-50%" }}
        className="pointer-events-none absolute left-[19px] top-0 z-10 hidden md:block"
      >
        <PixelSprite frame={frame} scale={3} />
      </motion.div>

      <div className="space-y-8">
        {EXPERIENCES.map((exp, idx) => {
          const reached = idx <= active;
          const label =
            exp.badge ??
            exp.organisation
              .split(" ")
              .map((word) => word[0])
              .slice(0, 2)
              .join("");
          return (
            <motion.div
              key={exp.organisation}
              ref={(el) => {
                cardRefs.current[idx] = el;
              }}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              className="relative md:pl-12"
            >
              {/* Checkpoint dot */}
              <div
                className={`absolute left-2.5 top-1.5 hidden h-3 w-3 rounded-full border-2 border-accent transition-all duration-300 md:block ${
                  reached ? "bg-accent shadow-[0_0_12px_hsl(var(--accent)/0.7)]" : "bg-background"
                }`}
              />

              <div
                className={`glass-card p-5 transition-colors duration-300 ${
                  reached ? "border-accent/40" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/10 font-bold text-accent ${
                        label.length > 2 ? "text-[10px] tracking-tight" : "text-sm"
                      }`}
                    >
                      {label}
                    </div>
                    <div>
                      <a
                        href={exp.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold transition-colors hover:text-accent"
                      >
                        {exp.organisation}
                      </a>
                      {reached && idx === active && (
                        <motion.p
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="hidden font-pixel text-[7px] text-accent md:block"
                        >
                          CHECKPOINT REACHED
                        </motion.p>
                      )}
                    </div>
                  </div>
                  <a
                    href={exp.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Visit ${exp.organisation} website`}
                    className="shrink-0 text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>

                <div className="mt-4 space-y-4">
                  {exp.positions.map((pos, posIdx) => {
                    const allTech = pos.content
                      ?.flatMap((c) => c.tech ?? [])
                      .filter((t, i, arr) => arr.findIndex((x) => x.id === t.id) === i);

                    return (
                      <div key={posIdx} className={posIdx > 0 ? "border-t border-border/50 pt-4" : ""}>
                        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                          <h3 className="text-sm font-medium">{pos.title}</h3>
                          <span className="text-xs text-muted-foreground">{pos.duration}</span>
                        </div>

                        {pos.content && pos.content.length > 0 && (
                          <div className="mt-2.5 space-y-1.5">
                            {pos.content.map((c, cIdx) => (
                              <div key={cIdx} className="flex gap-2 text-sm text-muted-foreground">
                                {pos.content!.length > 1 && (
                                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-muted-foreground/50" />
                                )}
                                <p>{c.text}</p>
                              </div>
                            ))}
                          </div>
                        )}

                        {allTech && allTech.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-1.5">
                            {allTech.map((t) => (
                              <span key={t.id} className="pill text-[11px]">
                                <t.icon className="h-3 w-3" />
                                {t.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
