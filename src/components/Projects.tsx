import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, Github, ChevronDown, ChevronUp } from "lucide-react";
import { PROJECTS } from "@/constants";
import type { Project } from "@/constants";
import {
  PROJECT_CATEGORIES,
  PROJECT_DETAILS,
  type ProjectCategory,
} from "@/constants/projectDetails";
import ProjectModal from "./ProjectModal";

const INITIAL_SHOW = 6;
type Filter = "All" | ProjectCategory;

export default function Projects() {
  const [showAll, setShowAll] = useState(false);
  const [filter, setFilter] = useState<Filter>("All");
  const [selected, setSelected] = useState<Project | null>(null);

  const filters: Filter[] = ["All", ...PROJECT_CATEGORIES];

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
        <h2 className="section-title">Things I've built</h2>
        <p className="section-subtitle">
          Click any card for the fuller story.
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
            <motion.button
              key={project.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3, delay: idx * 0.04 }}
              onClick={() => setSelected(project)}
              whileHover={{ y: -3 }}
              className="glass-card group flex flex-col p-5 text-left"
            >
              <div className="flex items-start gap-4">
                {project.image && (
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-muted/50">
                    <img
                      src={project.image}
                      alt=""
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      {PROJECT_DETAILS[project.id] && (
                        <span className="mb-0.5 block font-mono text-[10px] uppercase tracking-[0.16em] text-accent/80">
                          {PROJECT_DETAILS[project.id].category}
                        </span>
                      )}
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

              <div className="mt-4 flex flex-wrap gap-1.5">
                {project.stack.map((tech) => (
                  <span key={tech.id} className="pill text-[11px]">
                    <tech.icon className="h-3 w-3" />
                    {tech.name}
                  </span>
                ))}
              </div>
            </motion.button>
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
