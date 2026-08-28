import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, Check, Github, X } from "lucide-react";
import type { Project } from "@/constants";
import { PROJECT_DETAILS } from "@/constants/projectDetails";

interface Props {
  project: Project | null;
  onClose: () => void;
}

export default function ProjectModal({ project, onClose }: Props) {
  useEffect(() => {
    if (!project) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [project, onClose]);

  const detail = project ? PROJECT_DETAILS[project.id] : undefined;

  return (
    <AnimatePresence>
      {project && (
        <motion.div
          className="fixed inset-0 z-[95] flex items-center justify-center px-4 py-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.16 }}
        >
          <div
            className="absolute inset-0 bg-background/70 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={project.title}
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
            className="relative flex max-h-full w-full max-w-lg flex-col overflow-hidden
                       rounded-2xl border border-border bg-card shadow-2xl shadow-black/30"
          >
            <button
              onClick={onClose}
              aria-label="Close"
              className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center
                         rounded-full border border-border bg-background/70 text-muted-foreground
                         transition-colors hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="overflow-y-auto p-6">
              <div className="flex items-start gap-4">
                {project.image && (
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-muted/50">
                    <img
                      src={project.image}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
                <div className="min-w-0 pr-8">
                  {detail && (
                    <span className="mb-1 inline-block font-mono text-[10px] uppercase tracking-[0.18em] text-accent">
                      {detail.category}
                    </span>
                  )}
                  <h3 className="font-display text-xl font-bold leading-tight">
                    {project.title}
                  </h3>
                </div>
              </div>

              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                {detail?.summary ?? project.content}
              </p>

              {detail && (
                <ul className="mt-4 space-y-2">
                  {detail.highlights.map((h) => (
                    <li key={h} className="flex gap-2.5 text-sm">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              )}

              <div className="mt-5 flex flex-wrap gap-1.5">
                {project.stack.map((tech) => (
                  <span key={tech.id} className="pill text-[11px]">
                    <tech.icon className="h-3 w-3" />
                    {tech.name}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex gap-2 border-t border-border/60 bg-muted/20 p-4">
              <a
                href={project.github}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-full
                           border border-border bg-card px-4 py-2 text-sm font-medium
                           transition-colors hover:border-accent/40"
              >
                <Github className="h-4 w-4" />
                Code
              </a>
              {project.link && (
                <a
                  href={project.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-full
                             bg-accent px-4 py-2 text-sm font-medium text-accent-foreground
                             transition-opacity hover:opacity-90"
                >
                  Live demo
                  <ArrowUpRight className="h-4 w-4" />
                </a>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
