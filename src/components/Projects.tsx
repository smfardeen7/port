import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";
import { PROJECTS } from "@/constants";
import type { Project } from "@/constants";
import {
  PROJECT_CATEGORIES,
  PROJECT_DETAILS,
  type ProjectCategory,
} from "@/constants/projectDetails";
import { RARITY_BY_CATEGORY, RARITY_STYLES } from "@/game/data";
import { useGame } from "@/game/store";
import ProjectModal from "./ProjectModal";
import LootCard from "./game/LootCard";

const INITIAL_SHOW = 6;
type Filter = "All" | ProjectCategory;

export default function Projects() {
  const [showAll, setShowAll] = useState(false);
  const [filter, setFilter] = useState<Filter>("All");
  const [selected, setSelected] = useState<Project | null>(null);
  const openProject = useGame((s) => s.openProject);
  const collected = useGame((s) => s.projects.length);

  const filters: Filter[] = ["All", ...PROJECT_CATEGORIES];

  const open = (project: Project) => {
    setSelected(project);
    openProject(project.id);
  };

  const matching = useMemo(() => {
    if (filter === "All") return PROJECTS;
    return PROJECTS.filter((p) => PROJECT_DETAILS[p.id]?.category === filter);
  }, [filter]);

  const canCollapse = matching.length > INITIAL_SHOW;
  const visible = showAll ? matching : matching.slice(0, INITIAL_SHOW);

  return (
    <section id="projects" className="section-container">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5 }}
      >
        <span className="eyebrow">projects</span>
        <h2 className="section-title">Loot Vault</h2>
        <p className="section-subtitle">
          Every project is a loot card. Rarer categories glow brighter. Open a
          card to collect it and read the fuller story.
          <span className="ml-2 font-mono text-[11px] text-accent">
            {collected}/{PROJECTS.length} collected
          </span>
        </p>
      </motion.div>

      {/* Filter chips */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
        className="mt-8 flex flex-wrap gap-2"
      >
        {filters.map((f) => {
          const count =
            f === "All"
              ? PROJECTS.length
              : PROJECTS.filter((p) => PROJECT_DETAILS[p.id]?.category === f)
                  .length;
          const isActive = filter === f;
          const rarity = f === "All" ? null : RARITY_STYLES[RARITY_BY_CATEGORY[f]];
          return (
            <button
              key={f}
              onClick={() => {
                setFilter(f);
                setShowAll(false);
              }}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs
                         font-medium transition-colors ${
                           isActive
                             ? "border-accent/50 bg-accent/10 text-foreground"
                             : "border-border bg-card/40 text-muted-foreground hover:text-foreground"
                         }`}
            >
              {rarity && <span className={rarity.text}>◆</span>}
              {f}
              <span
                className={`font-mono text-[10px] ${
                  isActive ? "text-accent" : "text-muted-foreground/50"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </motion.div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <AnimatePresence mode="popLayout">
          {visible.map((project, idx) => (
            <LootCard
              key={project.id}
              project={project}
              index={idx}
              onOpen={() => open(project)}
            />
          ))}
        </AnimatePresence>
      </div>

      {canCollapse && (
        <div className="mt-8 flex justify-center">
          <button
            onClick={() => setShowAll(!showAll)}
            className="inline-flex items-center gap-2 rounded-full border border-border
                       bg-card/50 px-5 py-2 text-sm font-medium text-muted-foreground
                       transition-all hover:border-accent/30 hover:text-foreground"
          >
            {showAll ? (
              <>
                Show less <ChevronUp className="h-4 w-4" />
              </>
            ) : (
              <>
                Show all ({matching.length}) <ChevronDown className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      )}

      <ProjectModal project={selected} onClose={() => setSelected(null)} />
    </section>
  );
}
