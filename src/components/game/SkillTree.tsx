import { useMemo } from "react";
import { motion } from "framer-motion";
import { BrainCircuit, Code2, Layers, Wrench, type LucideIcon } from "lucide-react";
import { SKILLS_LIST } from "@/constants";
import type { Skill, SkillGroup } from "@/constants/skillsList";
import { useGame } from "@/game/store";
import { sfx } from "@/game/sfx";

const CORE_ICONS: LucideIcon[] = [Code2, BrainCircuit, Layers, Wrench];
const SIZE = 400;
const C = SIZE / 2;

interface Point {
  x: number;
  y: number;
}

function place(count: number, r: number, offset: number): Point[] {
  return Array.from({ length: count }, (_, i) => {
    const a = -Math.PI / 2 + offset + (i / count) * Math.PI * 2;
    return { x: C + r * Math.cos(a), y: C + r * Math.sin(a) };
  });
}

/** One ring for small groups, two rings for larger ones. */
export function ringLayout(n: number): Point[] {
  if (n <= 8) return place(n, 140, 0);
  const inner = Math.floor(n / 2);
  const outer = n - inner;
  return [...place(inner, 88, Math.PI / inner), ...place(outer, 168, 0)];
}

function Node({
  skill,
  pos,
  unlocked,
  onUnlock,
}: {
  skill: Skill;
  pos: Point;
  unlocked: boolean;
  onUnlock: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={onUnlock}
      aria-pressed={unlocked}
      aria-label={`${skill.name}, ${unlocked ? "unlocked" : "locked"}`}
      title={skill.name}
      style={{ left: pos.x, top: pos.y, x: "-50%", y: "-50%" }}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.94 }}
      className="absolute flex w-[70px] flex-col items-center gap-1 outline-none focus-visible:[&>span:first-child]:ring-2 focus-visible:[&>span:first-child]:ring-accent"
    >
      <motion.span
        animate={unlocked ? { scale: [1, 1.25, 1] } : { scale: 1 }}
        transition={{ duration: 0.45 }}
        className={`flex h-[52px] w-[52px] items-center justify-center rounded-full border transition-colors duration-300 ${
          unlocked
            ? "border-accent bg-accent/15 text-accent shadow-[0_0_18px_hsl(var(--accent)/0.35)]"
            : "border-dashed border-border bg-card/50 text-muted-foreground/50"
        }`}
      >
        <skill.icon className="h-5 w-5" />
      </motion.span>
      <span
        className={`max-w-[70px] truncate text-[9px] leading-tight transition-colors ${
          unlocked ? "text-foreground" : "text-muted-foreground/70"
        }`}
      >
        {skill.name}
      </span>
    </motion.button>
  );
}

function Branch({ group, index }: { group: SkillGroup; index: number }) {
  const unlocked = useGame((s) => s.skills);
  const unlockSkill = useGame((s) => s.unlockSkill);
  const positions = useMemo(() => ringLayout(group.items.length), [group.items.length]);
  const Icon = CORE_ICONS[index % CORE_ICONS.length];
  const count = group.items.filter((i) => unlocked.includes(i.id)).length;
  const done = count === group.items.length;

  const unlockOne = (id: string) => {
    if (unlocked.includes(id)) {
      sfx.blip();
      return;
    }
    unlockSkill(id);
    sfx.unlock();
  };

  const unlockBranch = () => {
    const locked = group.items.filter((i) => !unlocked.includes(i.id));
    if (locked.length === 0) {
      sfx.blip();
      return;
    }
    locked.forEach((item, i) => {
      setTimeout(() => {
        unlockSkill(item.id);
        if (i % 2 === 0) sfx.unlock();
      }, i * 45);
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      className="glass-card overflow-hidden"
    >
      <div className="flex items-center justify-between border-b border-border/40 px-5 py-3">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/80">
          {group.title}
        </h3>
        <span className={`font-mono text-[10px] ${done ? "text-accent" : "text-muted-foreground"}`}>
          {count}/{group.items.length}
        </span>
      </div>

      {/* Radial tree (tablet and up) */}
      <div className="hidden justify-center p-4 md:flex">
        <div className="relative" style={{ width: SIZE, height: SIZE }}>
          <svg
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            width={SIZE}
            height={SIZE}
            viewBox={`0 0 ${SIZE} ${SIZE}`}
          >
            {group.items.map((item, i) => {
              const on = unlocked.includes(item.id);
              const p = positions[i];
              return on ? (
                <motion.line
                  key={item.id}
                  x1={C}
                  y1={C}
                  x2={p.x}
                  y2={p.y}
                  stroke="hsl(var(--accent))"
                  strokeWidth={1.5}
                  strokeOpacity={0.7}
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              ) : (
                <line
                  key={item.id}
                  x1={C}
                  y1={C}
                  x2={p.x}
                  y2={p.y}
                  stroke="hsl(var(--border))"
                  strokeWidth={1}
                  strokeDasharray="3 5"
                  strokeOpacity={0.7}
                />
              );
            })}
          </svg>

          {group.items.map((item, i) => (
            <Node
              key={item.id}
              skill={item}
              pos={positions[i]}
              unlocked={unlocked.includes(item.id)}
              onUnlock={() => unlockOne(item.id)}
            />
          ))}

          <motion.button
            type="button"
            onClick={unlockBranch}
            aria-label={done ? `${group.title}: all skills unlocked` : `Unlock every ${group.title} skill`}
            title={done ? "Branch complete" : "Unlock the whole branch"}
            style={{ left: C, top: C, x: "-50%", y: "-50%" }}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.95 }}
            className={`absolute flex h-16 w-16 flex-col items-center justify-center rounded-full border bg-card transition-colors ${
              done
                ? "border-accent shadow-[0_0_34px_hsl(var(--accent)/0.4)]"
                : "border-accent/50 shadow-[0_0_24px_hsl(var(--accent)/0.2)]"
            }`}
          >
            <Icon className="h-5 w-5 text-accent" />
            <span className="mt-1 font-pixel text-[7px] text-muted-foreground">
              {done ? "MAX" : "CORE"}
            </span>
          </motion.button>
        </div>
      </div>

      {/* Chip grid (phones) */}
      <div className="flex flex-wrap gap-2 p-4 md:hidden">
        {group.items.map((item) => {
          const on = unlocked.includes(item.id);
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => unlockOne(item.id)}
              aria-pressed={on}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                on
                  ? "border-accent/60 bg-accent/10 text-foreground"
                  : "border-dashed border-border bg-card/40 text-muted-foreground"
              }`}
            >
              <item.icon className={`h-3.5 w-3.5 ${on ? "text-accent" : ""}`} />
              {item.name}
            </button>
          );
        })}
        <button
          type="button"
          onClick={unlockBranch}
          className="inline-flex items-center gap-1.5 rounded-full border border-accent/50 bg-card px-3 py-1.5 text-xs font-medium text-accent"
        >
          <Icon className="h-3.5 w-3.5" />
          {done ? "Branch complete" : "Unlock all"}
        </button>
      </div>
    </motion.div>
  );
}

export default function SkillTree() {
  return (
    <div className="mt-12 grid gap-6 lg:grid-cols-2">
      {SKILLS_LIST.map((group, index) => (
        <Branch key={group.title} group={group} index={index} />
      ))}
    </div>
  );
}
