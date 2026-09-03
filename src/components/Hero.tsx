import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useMotionValue } from "framer-motion";
import { ArrowDown, Command, FileText, Linkedin, MapPin, Sparkles, Trophy, Zap, Code2, Cpu } from "lucide-react";
import {
  SiPython, SiPytorch, SiTensorflow, SiFastapi, SiReact, SiDocker,
  SiKubernetes, SiAnthropic, SiClaude, SiApacheairflow
} from "react-icons/si";
import { FaAws } from "react-icons/fa6";
import { ABOUT_ME, SOCIAL_MEDIA, RESUME_LINK } from "@/constants";
import { openCommandPalette } from "./CommandPalette";
import Magnetic from "./Magnetic";
import SkillRun from "./game/SkillRun";
import PixelSprite from "./game/PixelSprite";
import Lazy3D from "./three/Lazy3D";
import { useGame, useLevel } from "@/game/store";

const loadHero = () => import("./three/HeroScene");

const LINKEDIN_URL = "https://www.linkedin.com/in/shaikmofardeen/";
const ROLES = [
  "AI Software Engineer",
  "ML Researcher",
  "Full-Stack Developer",
  "Explainable-AI Builder",
];

const FEATURED_STACK = [
  { icon: SiPython, name: "Python", color: "#38bdf8", rarity: "Legendary" },
  { icon: SiPytorch, name: "PyTorch", color: "#ee4c2c", rarity: "Epic" },
  { icon: SiTensorflow, name: "TensorFlow", color: "#ff6f00", rarity: "Epic" },
  { icon: SiFastapi, name: "FastAPI", color: "#059669", rarity: "Rare" },
  { icon: SiReact, name: "React", color: "#61dafb", rarity: "Rare" },
  { icon: SiAnthropic, name: "Anthropic API", color: "#d97706", rarity: "Legendary" },
  { icon: FaAws, name: "AWS", color: "#ff9900", rarity: "Uncommon" },
  { icon: SiDocker, name: "Docker", color: "#2496ed", rarity: "Uncommon" },
];

function RoleRotator() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((n) => (n + 1) % ROLES.length), 2600);
    return () => clearInterval(id);
  }, []);
  return (
    <span className="relative block">
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
          className="absolute inset-x-0 top-0 whitespace-nowrap font-bold text-accent"
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
  const levelInfo = useLevel();
  const xp = useGame((s) => s.xp);

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
      className="relative flex min-h-screen items-center overflow-hidden pt-20 pb-16 lg:py-0"
    >
      {/* Cursor-tracking spotlight background */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 transition-opacity duration-500"
        style={{
          opacity: spotVisible ? 1 : 0,
          background: glow,
        }}
      />

      <div className="section-container relative z-10 w-full">
        <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-12">
          
          {/* Left Column — Text & Bio & Stack */}
          <div className="lg:col-span-7">
            
            {/* Live Telemetry Badges */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="inline-flex items-center gap-2 rounded-full border border-border
                           bg-card/60 px-3.5 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur-md"
              >
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                Available for opportunities
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.15 }}
                className="inline-flex items-center gap-1.5 rounded-full border border-accent/30
                           bg-accent/10 px-3 py-1.5 text-xs font-mono text-accent backdrop-blur-md"
              >
                <Trophy className="h-3.5 w-3.5 text-amber-400" />
                <span>Lvl {levelInfo.level} {levelInfo.title}</span>
                <span className="text-muted-foreground">({xp} XP)</span>
              </motion.div>
            </div>

            {/* Main Title Header */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl"
            >
              Hi, I'm{" "}
              <span className="gradient-text">{ABOUT_ME.firstName}</span>
              <br />
              <span className="gradient-text">{ABOUT_ME.lastName}</span>
            </motion.h1>

            {/* Role Subtitle & Institution */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-4"
            >
              <div className="text-xl font-semibold leading-tight sm:text-2xl">
                <RoleRotator />
              </div>
              <p className="mt-1.5 max-w-lg text-sm text-muted-foreground sm:text-base">
                M.S. Computer Science @ <span className="text-foreground font-medium">George Mason University</span>
              </p>
            </motion.div>

            {/* Location Tag */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.35 }}
              className="mt-2.5 flex items-center gap-1.5 text-xs font-medium text-muted-foreground/80"
            >
              <MapPin className="h-3.5 w-3.5 text-accent" />
              Fairfax, Virginia, United States
            </motion.div>

            {/* Core Featured Skills Chips */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-5"
            >
              <p className="text-xs font-mono text-muted-foreground mb-2 flex items-center gap-1.5">
                <Cpu className="h-3.5 w-3.5 text-accent" />
                Featured Tech Stack:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {FEATURED_STACK.map((item) => (
                  <span
                    key={item.name}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border/80
                               bg-card/40 px-2.5 py-1 text-xs font-medium text-foreground
                               transition-all hover:border-accent/40 hover:bg-card/80 hover:-translate-y-0.5"
                  >
                    <item.icon className="h-3.5 w-3.5" style={{ color: item.color }} />
                    {item.name}
                  </span>
                ))}
              </div>
            </motion.div>

            {/* Social Icons & CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="mt-7 flex flex-wrap items-center gap-3"
            >
              {/* Social Links */}
              <div className="flex items-center gap-2">
                {SOCIAL_MEDIA.map((social) => (
                  <Magnetic key={social.id} strength={0.3}>
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
                      <social.icon className="h-4 w-4" />
                    </a>
                  </Magnetic>
                ))}
              </div>

              <div className="h-6 w-px bg-border/60 hidden sm:block" />

              {/* Action Buttons */}
              <Magnetic strength={0.2}>
                <a
                  href={LINKEDIN_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-2.5
                             text-sm font-semibold text-accent-foreground transition-all
                             hover:opacity-90 hover:shadow-lg hover:shadow-accent/25"
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
                  <FileText className="h-4 w-4 text-accent" />
                  Resume
                </a>
              </Magnetic>

              <button
                onClick={openCommandPalette}
                className="hidden items-center gap-1.5 rounded-full border border-dashed border-border
                           px-4 py-2.5 text-xs font-mono text-muted-foreground transition-colors
                           hover:border-accent/40 hover:text-foreground sm:inline-flex"
              >
                <Command className="h-3.5 w-3.5" />
                <kbd className="font-mono">⌘K</kbd> Palette
              </button>
            </motion.div>
          </div>

          {/* Right Column — 3D Scene + Playable Skill Runner */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, x: 25 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="lg:col-span-5"
          >
            {/* 3D Voxel Scene Container */}
            <div className="relative mx-auto mb-3 h-[240px] w-full max-w-[500px] sm:h-[280px]">
              <Lazy3D
                load={loadHero}
                className="absolute inset-0"
                margin="0px"
                fallback={
                  <div className="grid h-full place-items-center">
                    <PixelSprite frame="idle" scale={6} />
                  </div>
                }
              />
            </div>

            {/* Playable Canvas Skill Runner Mini-Game */}
            <div className="rounded-xl border border-border/80 bg-card/40 p-2 backdrop-blur-md shadow-xl">
              <SkillRun />
            </div>
            
            <p className="mt-2 text-center font-mono text-[10px] text-muted-foreground/80 lg:text-left flex items-center justify-center lg:justify-start gap-1">
              <Zap className="h-3 w-3 text-amber-400" />
              <span>Catch falling tech icons for XP & Level unlocks!</span>
            </p>
          </motion.div>
        </div>

        {/* Scroll Down Indicator */}
        <motion.a
          href="#experience"
          aria-label="Scroll to experience section"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.2 }}
          className="mt-12 flex justify-center cursor-pointer"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground/60 hover:text-accent transition-colors"
          >
            <span>Scroll to explore timeline</span>
            <ArrowDown className="h-4 w-4" />
          </motion.div>
        </motion.a>
      </div>
    </section>
  );
}

/** Radial glow that follows pointer cursor */
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
