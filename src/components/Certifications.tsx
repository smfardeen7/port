import { motion } from "framer-motion";
import { BadgeCheck, ExternalLink } from "lucide-react";
import { CERTIFICATIONS } from "@/constants";

function monogram(issuer: string) {
  return issuer
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function Certifications() {
  return (
    <section id="certifications" className="section-container">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5 }}
      >
        <span className="eyebrow">certifications</span>
        <h2 className="section-title">Licenses &amp; certifications</h2>
        <p className="section-subtitle">
          Coursework and programs completed outside the degree
        </p>
      </motion.div>

      <div className="mt-12 grid gap-4 sm:grid-cols-2">
        {CERTIFICATIONS.map((cert, idx) => (
          <motion.div
            key={cert.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.4, delay: idx * 0.05 }}
            className="glass-card flex flex-col p-5"
          >
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/10 font-mono text-xs font-bold text-accent">
                {monogram(cert.issuer)}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-display text-sm font-semibold leading-snug">
                  {cert.title}
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  {cert.issuer} <span className="text-border">·</span> {cert.date}
                </p>
              </div>
              <BadgeCheck className="h-4 w-4 shrink-0 text-accent/70" />
            </div>

            {(cert.skills?.length || cert.credentialId || cert.url) && (
              <div className="mt-4 flex flex-wrap items-center gap-1.5">
                {cert.skills?.map((skill) => (
                  <span key={skill} className="pill text-[11px]">
                    {skill}
                  </span>
                ))}
                {cert.credentialId && (
                  <span className="font-mono text-[10px] text-muted-foreground/60">
                    ID {cert.credentialId.slice(0, 12)}
                    {cert.credentialId.length > 12 ? "…" : ""}
                  </span>
                )}
                {cert.url && (
                  <a
                    href={cert.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground transition-colors hover:text-accent"
                  >
                    Show credential
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </section>
  );
}
