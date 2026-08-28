import { useState } from "react";
import { motion } from "framer-motion";
import { GitMerge, Code2, Briefcase, Rocket } from "lucide-react";
import { useCountUp } from "@/hooks/useCountUp";

const floatAnimation = (delay: number) => ({
  y: [0, -6, 0],
  transition: { duration: 3, repeat: Infinity, ease: "easeInOut" as const, delay },
});

function StatCard({
  icon: Icon,
  target,
  prefix = "",
  suffix = "",
  label,
  delay,
}: {
  icon: typeof GitMerge;
  target: number;
  prefix?: string;
  suffix?: string;
  label: string;
  delay: number;
}) {
  const [inView, setInView] = useState(false);
  const shown = useCountUp({ end: target, start: inView, duration: 1300 });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      onViewportEnter={() => setInView(true)}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay }}
      className="glass-card p-4"
    >
      <motion.div animate={floatAnimation(delay)}>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
            <Icon className="h-5 w-5 text-accent" />
          </div>
          <div>
            <div className="font-display text-2xl font-bold leading-tight tabular-nums">
              {prefix}
              {shown}
              {suffix}
            </div>
            <div className="text-xs text-muted-foreground">{label}</div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function CodeBlock() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="glass-card overflow-hidden"
    >
      <div className="flex items-center gap-1.5 border-b border-border/50 px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
        <span className="h-2.5 w-2.5 rounded-full bg-yellow-400/80" />
        <span className="h-2.5 w-2.5 rounded-full bg-green-400/80" />
        <span className="ml-2 text-[10px] text-muted-foreground">
          fardeen.ts
        </span>
      </div>
      <div className="px-4 py-3 font-mono text-xs leading-loose">
        <span className="text-purple-400">const</span>{" "}
        <span className="text-sky-400">dev</span>{" "}
        <span className="text-muted-foreground">=</span>{" "}
        <span className="text-yellow-400">{"{"}</span>
        <br />
        {"  "}
        <span className="text-sky-300">name</span>
        <span className="text-muted-foreground">:</span>{" "}
        <span className="text-green-400">"Shaik Mohammad Fardeen"</span>
        <span className="text-muted-foreground">,</span>
        <br />
        {"  "}
        <span className="text-sky-300">role</span>
        <span className="text-muted-foreground">:</span>{" "}
        <span className="text-green-400">"AI Engineer"</span>
        <span className="text-muted-foreground">,</span>
        <br />
        {"  "}
        <span className="text-sky-300">passion</span>
        <span className="text-muted-foreground">:</span>{" "}
        <span className="text-green-400">"Explainable AI & Intelligent Systems"</span>
        <span className="text-muted-foreground">,</span>
        <br />
        {"  "}
        <span className="text-sky-300">vibe</span>
        <span className="text-muted-foreground">:</span>{" "}
        <span className="text-green-400">"Curious builder and researcher"</span>
        <span className="text-muted-foreground">,</span>
        <br />
        {"  "}
        <span className="text-sky-300">motto</span>
        <span className="text-muted-foreground">:</span>{" "}
        <span className="text-green-400">"Ship fast, learn faster"</span>
        <span className="text-muted-foreground">,</span>
        <br />
        <span className="text-yellow-400">{"}"}</span>
        <span className="text-muted-foreground">;</span>
      </div>
    </motion.div>
  );
}

export default function TLDR() {
  return (
    <section id="tldr" className="section-container">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5 }}
      >
        <span className="eyebrow">tldr</span>
        <h2 className="section-title">
          The quick version
        </h2>
      </motion.div>

      <div className="mt-10 grid gap-4 md:grid-cols-5">
        {/* Stats grid — 2 cols */}
        <div className="grid grid-cols-2 gap-3 md:col-span-2">
          <StatCard
            icon={Briefcase}
            target={2}
            label="Years experience"
            delay={0}
          />
          <StatCard
            icon={GitMerge}
            target={91}
            suffix="%"
            label="Top model accuracy"
            delay={0.1}
          />
          <StatCard
            icon={Rocket}
            target={8}
            suffix="+"
            label="Projects built"
            delay={0.15}
          />
          <StatCard
            icon={Code2}
            target={2}
            label="Degrees"
            delay={0.2}
          />
        </div>

        {/* Code block — 3 cols */}
        <div className="md:col-span-3">
          <CodeBlock />
        </div>
      </div>
    </section>
  );
}
