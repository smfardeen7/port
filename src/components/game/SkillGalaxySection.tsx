import { useMemo } from "react";
import { motion } from "framer-motion";
import { SKILLS_LIST } from "@/constants";
import { SKILL_TOTAL } from "@/game/data";
import { useGame } from "@/game/store";
import { useGalaxyHover } from "@/three/galaxyState";
import Lazy3D from "../three/Lazy3D";

const loadGalaxy = () => import("../three/SkillGalaxy");
const RING = SKILLS_LIST.flatMap((g) => g.items).filter((_, i) => i % 4 === 0).slice(0, 14);

/** Static ring of icons shown when 3D is off or still loading. */
function GalaxyFallback() {
  return (
    <div className="relative h-full w-full">
      <div className="absolute left-1/2 top-1/2 h-[240px] w-[240px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-border/60">
        {RING.map((skill, i) => {
          const a = (i / RING.length) * Math.PI * 2;
          return (
            <span
              key={skill.id}
              className="absolute flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card/70 text-muted-foreground"
              style={{ left: `${50 + Math.cos(a) * 50}%`, top: `${50 + Math.sin(a) * 50}%` }}
            >
              <skill.icon className="h-4 w-4" />
            </span>
          );
        })}
      </div>
    </div>
  );
}

export default function SkillGalaxySection() {
  const hovered = useGalaxyHover((s) => s.skill);
  const unlocked = useGame((s) => s.skills);
  const finePointer = useMemo(
    () => typeof window !== "undefined" && window.matchMedia("(pointer: fine)").matches,
    []
  );

  const caption = hovered
    ? `${hovered.name}: ${unlocked.includes(hovered.id) ? "unlocked" : "locked, click to unlock"}`
    : finePointer
      ? "Drag to spin the galaxy. Click an icon to unlock it."
      : "Tap an icon to unlock it.";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5 }}
      className="mt-10 overflow-hidden rounded-2xl"
    >
      <Lazy3D
        load={loadGalaxy}
        className="relative h-[380px] md:h-[500px]"
        fallback={<GalaxyFallback />}
      />
      <div className="flex items-center justify-between gap-3 px-2 py-2.5 text-xs">
        <span className={hovered ? "text-foreground" : "text-muted-foreground"}>{caption}</span>
        <span className="shrink-0 font-mono text-[10px] text-muted-foreground">
          {unlocked.length}/{SKILL_TOTAL}
        </span>
      </div>
    </motion.div>
  );
}
