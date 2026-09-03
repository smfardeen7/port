import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useMotionValue } from "framer-motion";
import { ArrowDown, Command, FileText, Linkedin, MapPin } from "lucide-react";
import { ABOUT_ME, SOCIAL_MEDIA, RESUME_LINK } from "@/constants";
import { openCommandPalette } from "./CommandPalette";
import Magnetic from "./Magnetic";
import SkillRun from "./game/SkillRun";
import { useGame } from "@/game/store";

const LINKEDIN_URL = "https://www.linkedin.com/in/shaikmofardeen/";
const ROLES = [
  "AI Engineer",
  "ML Researcher",
  "Full-Stack Developer",
  "Explainable-AI Builder",
];

function RoleRotator() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((n) => (n + 1) % ROLES.length), 2600);
    return () => clearInterval(id);
  }, []);
  return (
    <span className="relative block">
      {/* Reserve height with an invisible copy of the longest role */}
      <span className="invisible font-semibold" aria-hidden="true">
        {ROLES.reduce((a, b) => (a.length > b.length ? a : b))}
      </span>
      <AnimatePresence initial={false}>
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="absolute inset-x-0 top-0 whitespace-nowrap font-semibold text-accent"
        >
          {ROLES[i]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const mx = useMotionValue(50);
  const my = useMotionValue(20);
  const [spotVisible, setSpotVisible] = useState(false);
  const glow = usePointerGlow(mx, my);
  const markResume = useGame((s) => s.markResume);

  const onMouseMove = (e: React.MouseEvent) => {
    const rect = sectionRef.current?.getBoundingClientRect();
    if (!rect) return;
    mx.set(((e.clientX - rect.left) / rect.width) * 100);
    my.set(((e.clientY - rect.top) / rect.height) * 100);
    setSpotVisible(true);
  };

  return (
    <section
      id="home"
      ref={sectionRef}
      onMouseMove={onMouseMove}
      onMouseLeave={() => setSpotVisible(false)}
      className="relative flex min-h-screen items-center overflow-hidden"
    >
      {/* Cursor-tracking spotlight */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 transition-opacity duration-500"
        style={{
          opacity: spotVisible ? 1 : 0,
          background: glow,
        }}
      />

      <div className="section-container relative">
        <div className="grid items-center gap-10 md:grid-cols-5 md:gap-12">
          {/* Left — Text content */}
          <div className="md:col-span-3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mb-5 inline-flex items-center gap-2 rounded-full border border-border
                         bg-card/50 px-4 py-1.5 text-sm text-muted-foreground backdrop-blur-sm"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
              </span>
              Available for opportunities
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl"
            >
              Hi, I'm{" "}
              <span className="gradient-text">{ABOUT_ME.firstName}</span>
              <br />
              <span className="gradient-text">{ABOUT_ME.lastName}</span>
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-4"
            >
              <div className="text-lg font-medium leading-tight md:text-xl">
                <RoleRotator />
              </div>
              <p className="mt-1 max-w-md text-sm text-muted-foreground md:text-base">
                M.S. Computer Science @ George Mason University
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.45 }}
              className="mt-3 flex items-center gap-1.5 text-sm text-muted-foreground/80"
            >
              <MapPin className="h-3.5 w-3.5" />
              Fairfax, Virginia
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="mt-6 flex items-center gap-3"
            >
              {SOCIAL_MEDIA.map((social) => (
                <Magnetic key={social.id} strength={0.4}>
                  <a
                    href={social.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="flex h-10 w-10 items-center justify-center rounded-full
                               border border-border bg-card/50 text-muted-foreground
                               transition-all hover:-translate-y-0.5 hover:border-accent/50
                               hover:text-foreground hover:shadow-lg hover:shadow-accent/5"
                  >
                    <social.icon className="h-[18px] w-[18px]" />
                  </a>
                </Magnetic>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="mt-7 flex flex-wrap items-center gap-3"
            >
              <Magnetic strength={0.2}>
                <a
                  href={LINKEDIN_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-2.5
                             text-sm font-medium text-accent-foreground transition-all
                             hover:opacity-90 hover:shadow-lg hover:shadow-accent/20"
                >
                  Let's Connect
                  <Linkedin className="h-4 w-4" />
                </a>
              </Magnetic>
              <Magnetic strength={0.2}>
                <a
                  href={RESUME_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={markResume}
                  className="inline-flex items-center gap-2 rounded-full border border-border
                             bg-card/50 px-6 py-2.5 text-sm font-medium text-foreground
                             transition-all hover:bg-muted"
                >
                  <FileText className="h-4 w-4" />
                  Resume
                </a>
              </Magnetic>
              <button
                onClick={openCommandPalette}
                className="hidden items-center gap-1.5 rounded-full border border-dashed border-border
                           px-4 py-2.5 text-xs text-muted-foreground transition-colors
                           hover:border-accent/40 hover:text-foreground sm:inline-flex"
              >
                <Command className="h-3.5 w-3.5" />
                Press <kbd className="font-mono">⌘K</kbd> anywhere
              </button>
            </motion.div>
          </div>

          {/* Right — Skill Run mini-game */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, x: 30 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="md:col-span-2"
          >
            <SkillRun />
            <p className="mt-2 text-center font-mono text-[10px] text-muted-foreground/80 md:text-left">
              Mini-game. Every icon you catch is XP.
            </p>
          </motion.div>
        </div>

        {/* Scroll down arrow */}
        <motion.a
          href="#experience"
          aria-label="Scroll to experience section"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 cursor-pointer"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <ArrowDown className="h-5 w-5 text-muted-foreground/50 transition-colors hover:text-accent" />
          </motion.div>
        </motion.a>
      </div>
    </section>
  );
}

/** Radial glow that follows the pointer, expressed as a live CSS background. */
function usePointerGlow(
  mx: ReturnType<typeof useMotionValue<number>>,
  my: ReturnType<typeof useMotionValue<number>>
) {
  const [bg, setBg] = useState(
    "radial-gradient(600px circle at 50% 20%, hsl(var(--accent) / 0.10), transparent 60%)"
  );
  useEffect(() => {
    const update = () =>
      setBg(
        `radial-gradient(600px circle at ${mx.get()}% ${my.get()}%, hsl(var(--accent) / 0.12), transparent 55%)`
      );
    const ux = mx.on("change", update);
    const uy = my.on("change", update);
    return () => {
      ux();
      uy();
    };
  }, [mx, my]);
  return bg;
}
