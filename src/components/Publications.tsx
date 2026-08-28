import { motion } from "framer-motion";
import { FileText, ExternalLink } from "lucide-react";
import { PUBLICATIONS } from "@/constants";

export default function Publications() {
  if (PUBLICATIONS.length === 0) return null;

  return (
    <section id="publications" className="section-container">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5 }}
      >
        <span className="eyebrow">publications</span>
        <h2 className="section-title">Published research</h2>
      </motion.div>

      <div className="mt-10 space-y-4">
        {PUBLICATIONS.map((pub, idx) => (
          <motion.article
            key={pub.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.4, delay: idx * 0.06 }}
            className="glass-card flex gap-4 p-5"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/10">
              <FileText className="h-5 w-5 text-accent" />
            </div>
            <div className="min-w-0">
              <h3 className="font-display font-semibold leading-snug">
                {pub.title}
              </h3>
              <p className="mt-1 font-mono text-xs uppercase tracking-wide text-muted-foreground">
                {pub.venue} <span className="text-border">·</span> {pub.year}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {pub.description}
              </p>
              {pub.url && (
                <a
                  href={pub.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-accent transition-opacity hover:opacity-80"
                >
                  Read the paper
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
