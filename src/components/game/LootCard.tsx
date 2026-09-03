import { forwardRef, useState } from "react";
import { motion } from "framer-motion";
import { ExternalLink, Github } from "lucide-react";
import type { Project } from "@/constants";
import { PROJECT_DETAILS } from "@/constants/projectDetails";
import { RARITY_BY_CATEGORY, RARITY_STYLES } from "@/game/data";
import { useGame } from "@/game/store";
import TiltCard from "../TiltCard";

interface Props {
  project: Project;
  index: number;
  onOpen: () => void;
}

const LootCard = forwardRef<HTMLDivElement, Props>(function LootCard(
  { project, index, onOpen },
  ref
) {
  const collected = useGame((s) => s.projects.includes(project.id));
  const [hover, setHover] = useState(false);
  const detail = PROJECT_DETAILS[project.id];
  const rarity = RARITY_STYLES[RARITY_BY_CATEGORY[detail?.category ?? "Full-Stack"]];

  const onMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${((e.clientX - r.left) / r.width) * 100}%`);
    e.currentTarget.style.setProperty("--my", `${((e.clientY - r.top) / r.height) * 100}%`);
  };

  return (
    <motion.div
      ref={ref}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
      className="h-full"
    >
      <TiltCard intensity={5} lift={4} className="h-full">
        <button
          type="button"
          onClick={onOpen}
          onPointerMove={onMove}
          onPointerEnter={() => setHover(true)}
          onPointerLeave={() => setHover(false)}
          style={{ boxShadow: hover ? rarity.glow : undefined }}
          className={`group relative flex h-full w-full flex-col rounded-xl border bg-card/50 p-5 text-left backdrop-blur-sm transition-[box-shadow,border-color] duration-300 ${rarity.border}`}
        >
          {/* Holographic shine following the pointer */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            style={{
              background: `radial-gradient(360px circle at var(--mx, 50%) var(--my, 50%), ${rarity.color}26, transparent 46%)`,
            }}
          />

          <div className="relative flex items-start gap-4">
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <span className="mb-0.5 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-accent/80">
                    {detail?.category}
                    <span className={`font-pixel text-[7px] normal-case tracking-normal ${rarity.text}`}>
                      ◆ {rarity.label}
                    </span>
                  </span>
                  <h3 className="font-display font-semibold transition-colors group-hover:text-accent">
                    {project.title}
                  </h3>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <a
                    href={project.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-muted-foreground transition-colors hover:text-foreground"
                    aria-label={`${project.title} on GitHub`}
                  >
                    <Github className="h-4 w-4" />
                  </a>
                  {project.link && (
                    <a
                      href={project.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-muted-foreground transition-colors hover:text-foreground"
                      aria-label={`${project.title} live demo`}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </div>
              </div>

              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                {project.content}
              </p>
            </div>
          </div>

          <div className={`relative mt-4 flex flex-wrap gap-1.5 ${collected ? "pr-24" : ""}`}>
            {project.stack.map((tech) => (
              <span key={tech.id} className="pill text-[11px]">
                <tech.icon className="h-3 w-3" />
                {tech.name}
              </span>
            ))}
          </div>

          {collected && (
            <motion.span
              initial={{ scale: 1.6, opacity: 0, rotate: -12 }}
              animate={{ scale: 1, opacity: 1, rotate: -6 }}
              transition={{ type: "spring", stiffness: 300, damping: 18 }}
              className="absolute bottom-4 right-4 rounded border-2 border-emerald-400/70 px-1.5 py-1 font-pixel text-[7px] text-emerald-400"
            >
              COLLECTED
            </motion.span>
          )}
        </button>
      </TiltCard>
    </motion.div>
  );
});

export default LootCard;
