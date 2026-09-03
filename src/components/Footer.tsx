import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, ArrowUpRight, Check, Copy } from "lucide-react";
import { SOCIAL_MEDIA, ABOUT_ME, EMAIL_LINK, RESUME_LINK } from "@/constants";
import { copyText } from "@/lib/clipboard";
import { useGame } from "@/game/store";
import Magnetic from "./Magnetic";

export default function Footer() {
  const [copied, setCopied] = useState(false);
  const bossDefeated = useGame((s) => s.bossDefeated);
  const markEmail = useGame((s) => s.markEmail);
  const markResume = useGame((s) => s.markResume);

  const copyEmail = async () => {
    const ok = await copyText(ABOUT_ME.email);
    markEmail();
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } else {
      window.location.href = `mailto:${ABOUT_ME.email}`;
    }
  };

  return (
    <section id="contact" className="section-container">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center text-center"
      >
        <div className="relative mb-6">
          <img
            src="/fardeen-avatar.jpg"
            alt="Shaik Mohammad Fardeen"
            width={112}
            height={112}
            loading="lazy"
            className="h-28 w-28 rounded-full border-2 border-accent/30 object-cover shadow-lg shadow-accent/10"
          />
          <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-accent text-[10px] text-accent-foreground">
            👋
          </span>
        </div>

        {bossDefeated && (
          <motion.span
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-400/50 bg-amber-400/10 px-4 py-1.5 font-pixel text-[8px] text-amber-400"
          >
            👑 BOSS DEFEATED · THE GATE IS OPEN
          </motion.span>
        )}
        <span className="eyebrow">contact</span>
        <h2 className="section-title">
          {bossDefeated ? "You made it. Let's build something" : "Let's build something"}
        </h2>
        <p className="section-subtitle mx-auto mt-3">
          I'm open to new opportunities. Whether you have a question or just want
          to say hi, my inbox is always open.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Magnetic strength={0.2}>
            <a
              href={EMAIL_LINK}
              target="_blank"
              rel="noopener noreferrer"
              onClick={markEmail}
              className={`inline-flex items-center gap-2 rounded-full bg-accent px-6 py-2.5
                         text-sm font-medium text-accent-foreground transition-all
                         hover:opacity-90 hover:shadow-lg hover:shadow-accent/20 ${
                           bossDefeated ? "animate-pulse-ring" : ""
                         }`}
            >
              <Mail className="h-4 w-4" />
              {bossDefeated ? "Hire Fardeen" : "Say hello"}
            </a>
          </Magnetic>
          <button
            onClick={copyEmail}
            className="inline-flex items-center gap-2 rounded-full border border-border
                       bg-card/50 px-6 py-2.5 text-sm font-medium transition-all hover:bg-muted"
          >
            {copied ? (
              <Check className="h-4 w-4 text-accent" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
            {copied ? "Copied" : "Copy email"}
          </button>
          <Magnetic strength={0.2}>
            <a
              href={RESUME_LINK}
              target="_blank"
              rel="noopener noreferrer"
              onClick={markResume}
              className="inline-flex items-center gap-2 rounded-full border border-border
                         bg-card/50 px-6 py-2.5 text-sm font-medium transition-all hover:bg-muted"
            >
              Resume
              <ArrowUpRight className="h-4 w-4" />
            </a>
          </Magnetic>
        </div>

        <div className="mt-8 flex items-center justify-center gap-4">
          {SOCIAL_MEDIA.map((social) => (
            <Magnetic key={social.id} strength={0.4}>
              <a
                href={social.link}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.label}
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                <social.icon className="h-5 w-5" />
              </a>
            </Magnetic>
          ))}
        </div>
      </motion.div>

      <footer className="mt-16 border-t border-border/50 pt-8 text-center">
        <p className="font-mono text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} {ABOUT_ME.name} · built with React &amp; Tailwind
        </p>
      </footer>

      {/* Copy confirmation toast */}
      <AnimatePresence>
        {copied && (
          <motion.div
            role="status"
            aria-live="polite"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            className="fixed bottom-20 left-1/2 z-[80] -translate-x-1/2 rounded-full border border-border sm:bottom-6
                       bg-card/95 px-4 py-2 text-sm shadow-lg backdrop-blur-md"
          >
            <span className="flex items-center gap-2">
              <Check className="h-4 w-4 text-accent" />
              {ABOUT_ME.email} copied
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
