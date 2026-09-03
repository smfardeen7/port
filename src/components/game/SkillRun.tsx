import { useCallback, useEffect, useRef, useState } from "react";
import { Play, RotateCcw } from "lucide-react";
import {
  WORLD,
  createWorld,
  startWorld,
  step,
  type RunnerWorld,
} from "@/game/runner";
import {
  BUG_FRAME,
  DEFAULT_PALETTE,
  PLAYER_FRAMES,
  drawPixelMap,
} from "@/game/sprites";
import { RUN_ICON_NAMES, loadIconImages } from "@/game/icons";
import { sfx, unlockAudio } from "@/game/sfx";
import { useGame } from "@/game/store";

type Phase = "ready" | "playing" | "paused" | "over";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
}

interface Colors {
  accent: string;
  skyTop: string;
  skyBottom: string;
  hill: string;
  hill2: string;
  ground: string;
  stripe: string;
  star: string;
}

const PARTICLE_COLORS = ["#38bdf8", "#a78bfa", "#34d399", "#fbbf24"];
const STEP_MS = 1000 / 60;

function readColors(): Colors {
  const root = document.documentElement;
  const accent = `hsl(${getComputedStyle(root).getPropertyValue("--accent").trim()})`;
  const dark = root.classList.contains("dark");
  return dark
    ? {
        accent,
        skyTop: "#0b1120",
        skyBottom: "#131f3a",
        hill: "#172440",
        hill2: "#1d2d4f",
        ground: "#0f172a",
        stripe: "#243452",
        star: "#3b4a66",
      }
    : {
        accent,
        skyTop: "#dbeafe",
        skyBottom: "#f0f6ff",
        hill: "#c9d9f2",
        hill2: "#b6c9ea",
        ground: "#cbd5e1",
        stripe: "#94a3b8",
        star: "#93c5fd",
      };
}

export default function SkillRun() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const worldRef = useRef<RunnerWorld>(createWorld());
  const iconsRef = useRef<(HTMLImageElement | null)[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const jumpBufRef = useRef(0);
  const phaseRef = useRef<Phase>("ready");
  const visibleRef = useRef(true);
  const colorsRef = useRef<Colors | null>(null);
  const sizeRef = useRef<{ w: number; h: number; dpr: number }>({
    w: WORLD.width,
    h: WORLD.height,
    dpr: 1,
  });

  const [phase, setPhaseState] = useState<Phase>("ready");
  const [score, setScore] = useState(0);
  const [hearts, setHearts] = useState<number>(WORLD.maxHearts);
  const [shake, setShake] = useState(false);
  const [newBest, setNewBest] = useState(false);

  const bestRun = useGame((s) => s.bestRun);
  const finishRun = useGame((s) => s.finishRun);

  const setPhase = useCallback((p: Phase) => {
    phaseRef.current = p;
    setPhaseState(p);
  }, []);

  const startGame = useCallback(() => {
    unlockAudio();
    startWorld(worldRef.current);
    particlesRef.current = [];
    jumpBufRef.current = 0;
    setScore(0);
    setHearts(WORLD.maxHearts);
    setNewBest(false);
    setPhase("playing");
    sfx.blip();
  }, [setPhase]);

  const queueJump = useCallback(() => {
    if (phaseRef.current === "playing") jumpBufRef.current = 8;
  }, []);

  // Load coin icons once, tinted with the accent colour.
  useEffect(() => {
    let alive = true;
    colorsRef.current = readColors();
    loadIconImages(colorsRef.current.accent, 52).then((imgs) => {
      if (alive) iconsRef.current = imgs;
    });
    const observer = new MutationObserver(() => {
      colorsRef.current = readColors();
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => {
      alive = false;
      observer.disconnect();
    };
  }, []);

  // Size the canvas to its container.
  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const resize = () => {
      const w = wrap.clientWidth;
      const h = (w * WORLD.height) / WORLD.width;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      sizeRef.current = { w, h, dpr };
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);
    return () => ro.disconnect();
  }, []);

  // Pause when hidden, blurred, or scrolled away.
  useEffect(() => {
    const pause = () => {
      if (phaseRef.current === "playing") setPhase("paused");
    };
    const onVisibility = () => {
      if (document.hidden) pause();
    };
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("blur", pause);
    const wrap = wrapRef.current;
    const io = new IntersectionObserver(
      ([entry]) => {
        visibleRef.current = entry.isIntersecting;
        if (!entry.isIntersecting) pause();
      },
      { threshold: 0.35 }
    );
    if (wrap) io.observe(wrap);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("blur", pause);
      io.disconnect();
    };
  }, [setPhase]);

  // Keyboard: only while a run is active, so page scrolling is untouched otherwise.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (phaseRef.current !== "playing") return;
      if (e.code === "Space" || e.code === "ArrowUp") {
        e.preventDefault();
        jumpBufRef.current = 8;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Simulation + render loop.
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    let acc = 0;

    const handleEvents = (w: RunnerWorld) => {
      for (const ev of w.events) {
        if (ev.type === "jump") sfx.jump();
        else if (ev.type === "coin") {
          sfx.coin();
          setScore(w.score);
          for (let i = 0; i < 8; i++) {
            particlesRef.current.push({
              x: ev.x + WORLD.coinSize / 2,
              y: ev.y + WORLD.coinSize / 2,
              vx: (Math.random() - 0.5) * 5,
              vy: (Math.random() - 0.9) * 5,
              life: 24,
              color: PARTICLE_COLORS[i % PARTICLE_COLORS.length],
            });
          }
        } else if (ev.type === "hurt") {
          sfx.hurt();
          setHearts(w.hearts);
          setShake(true);
          setTimeout(() => setShake(false), 420);
        } else if (ev.type === "over") {
          sfx.lose();
          setPhase("over");
          const prevBest = useGame.getState().bestRun;
          setNewBest(w.score > prevBest);
          finishRun(w.score);
        }
      }
    };

    const draw = () => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      const colors = colorsRef.current;
      if (!canvas || !ctx || !colors) return;
      const { w: cssW, dpr } = sizeRef.current;
      const s = (cssW / WORLD.width) * dpr;
      ctx.setTransform(s, 0, 0, s, 0, 0);
      ctx.imageSmoothingEnabled = true;

      const world = worldRef.current;
      const scroll = world.frame * world.speed;

      // Sky
      const sky = ctx.createLinearGradient(0, 0, 0, WORLD.height);
      sky.addColorStop(0, colors.skyTop);
      sky.addColorStop(1, colors.skyBottom);
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, WORLD.width, WORLD.height);

      // Stars (far parallax)
      ctx.fillStyle = colors.star;
      for (let i = 0; i < 26; i++) {
        const x = (((i * 97) % WORLD.width) - scroll * 0.12) % WORLD.width;
        const y = (i * 53) % 140;
        ctx.fillRect(x < 0 ? x + WORLD.width : x, y + 8, 2, 2);
      }

      // Hills (mid parallax)
      const hills: [number, number, string][] = [
        [0.3, 70, colors.hill],
        [0.5, 46, colors.hill2],
      ];
      for (const [factor, r, color] of hills) {
        ctx.fillStyle = color;
        const period = 190;
        const offset = (scroll * factor) % period;
        for (let x = -period; x < WORLD.width + period; x += period) {
          ctx.beginPath();
          ctx.arc(x - offset + period / 2, WORLD.groundY + 6, r, Math.PI, 0);
          ctx.fill();
        }
      }

      // Ground
      ctx.fillStyle = colors.ground;
      ctx.fillRect(0, WORLD.groundY, WORLD.width, WORLD.height - WORLD.groundY);
      ctx.fillStyle = colors.accent;
      ctx.fillRect(0, WORLD.groundY, WORLD.width, 2);
      ctx.fillStyle = colors.stripe;
      const stripeOffset = scroll % 40;
      for (let x = -40; x < WORLD.width + 40; x += 40) {
        ctx.fillRect(x - stripeOffset, WORLD.groundY + 16, 18, 3);
      }

      // Entities
      for (const e of world.entities) {
        if (e.kind === "bug") {
          drawPixelMap(ctx, BUG_FRAME, e.x, e.y, 2, DEFAULT_PALETTE);
        } else {
          const bob = Math.sin((world.frame + e.id * 7) / 8) * 2;
          const img = iconsRef.current[e.icon];
          if (img) {
            ctx.drawImage(img, e.x, e.y + bob, e.w, e.h);
          } else {
            ctx.fillStyle = colors.accent;
            ctx.beginPath();
            ctx.arc(e.x + e.w / 2, e.y + bob + e.h / 2, e.w / 2, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      // Player
      const p = world.player;
      const blink = world.invuln > 0 && world.invuln % 6 < 3;
      if (!blink) {
        const frame = !p.grounded
          ? "jump"
          : world.status !== "playing"
            ? "idle"
            : Math.floor(world.frame / 8) % 2 === 0
              ? "run1"
              : "run2";
        drawPixelMap(ctx, PLAYER_FRAMES[frame], WORLD.playerX, p.y, 2.25, {
          ...DEFAULT_PALETTE,
          s: colors.accent,
        });
      }

      // Particles
      for (const pt of particlesRef.current) {
        ctx.globalAlpha = Math.max(0, pt.life / 24);
        ctx.fillStyle = pt.color;
        ctx.fillRect(pt.x, pt.y, 4, 4);
      }
      ctx.globalAlpha = 1;
    };

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(100, now - last);
      last = now;

      if (phaseRef.current === "playing") {
        acc += dt;
        let n = 0;
        while (acc >= STEP_MS && n < 4) {
          const w = worldRef.current;
          step(w, { jump: jumpBufRef.current > 0 }, Math.random);
          if (w.events.some((e) => e.type === "jump")) jumpBufRef.current = 0;
          else if (jumpBufRef.current > 0) jumpBufRef.current--;
          handleEvents(w);
          acc -= STEP_MS;
          n++;
        }
        if (acc > STEP_MS * 4) acc = 0;
      } else {
        acc = 0;
      }

      particlesRef.current = particlesRef.current
        .map((pt) => ({ ...pt, x: pt.x + pt.vx, y: pt.y + pt.vy, vy: pt.vy + 0.25, life: pt.life - 1 }))
        .filter((pt) => pt.life > 0);

      if (visibleRef.current) draw();
    };

    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [finishRun, setPhase]);

  const onCanvasPointer = (e: React.PointerEvent) => {
    e.preventDefault();
    if (phaseRef.current === "playing") queueJump();
  };

  const heartRow = Array.from({ length: WORLD.maxHearts }, (_, i) => i < hearts);

  return (
    <div
      ref={wrapRef}
      className={`relative w-full max-w-[520px] select-none overflow-hidden rounded-2xl border border-border/60 bg-card/40 shadow-lg shadow-black/10 ${
        shake ? "animate-shake" : ""
      }`}
    >
      <canvas
        ref={canvasRef}
        role="img"
        aria-label={`Skill Run mini-game. Jump over bugs and collect tech icons such as ${RUN_ICON_NAMES.slice(0, 4).join(", ")}.`}
        onPointerDown={onCanvasPointer}
        className="block w-full touch-none"
      />

      {/* Status row */}
      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between px-3 py-2">
        <span className="font-pixel text-[10px] tracking-wider" aria-label={`${hearts} hearts left`}>
          {heartRow.map((full, i) => (
            <span key={i} className={full ? "text-red-400" : "text-muted-foreground/30"}>
              ♥
            </span>
          ))}
        </span>
        <span className="font-pixel text-[8px] text-muted-foreground">
          SCORE <span className="text-foreground">{score}</span>
          <span className="mx-2 text-border">|</span>
          BEST <span className="text-foreground">{Math.max(bestRun, score)}</span>
        </span>
      </div>

      {/* Touch jump */}
      {phase === "playing" && (
        <button
          type="button"
          onPointerDown={(e) => {
            e.preventDefault();
            queueJump();
          }}
          className="absolute bottom-3 right-3 rounded-full border border-border bg-card/80 px-3 py-2 font-pixel text-[8px] text-foreground backdrop-blur-sm sm:hidden"
        >
          JUMP
        </button>
      )}

      {/* Overlays */}
      {phase !== "playing" && (
        <div className="absolute inset-0 grid place-items-center bg-background/55 p-4 text-center backdrop-blur-[2px]">
          {phase === "ready" && (
            <div>
              <p className="pixel-glitch font-pixel text-sm text-foreground md:text-base">SKILL RUN</p>
              <p className="mt-3 text-xs text-muted-foreground">
                Jump over the bugs, collect the stack. Every icon earns XP.
              </p>
              <button
                type="button"
                onClick={startGame}
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 font-pixel text-[10px] text-accent-foreground shadow-lg shadow-accent/25 transition-transform hover:scale-[1.03]"
              >
                <Play className="h-3 w-3 fill-current" />
                PLAY
              </button>
              <p className="mt-3 font-mono text-[10px] text-muted-foreground/80">
                Space or tap to jump
              </p>
            </div>
          )}
          {phase === "paused" && (
            <div>
              <p className="font-pixel text-sm text-foreground">PAUSED</p>
              <button
                type="button"
                onClick={() => setPhase("playing")}
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 font-pixel text-[10px] text-accent-foreground shadow-lg shadow-accent/25"
              >
                <Play className="h-3 w-3 fill-current" />
                RESUME
              </button>
            </div>
          )}
          {phase === "over" && (
            <div>
              <p className="font-pixel text-sm text-foreground">RUN OVER</p>
              <p className="mt-3 font-pixel text-[10px] text-accent">
                {score} ICON{score === 1 ? "" : "S"}
                {newBest ? " · NEW BEST" : ""}
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                {score >= 15 ? "Sprinter unlocked. Nicely done." : "Score 15 to earn the Sprinter badge."}
              </p>
              <button
                type="button"
                onClick={startGame}
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 font-pixel text-[10px] text-accent-foreground shadow-lg shadow-accent/25 transition-transform hover:scale-[1.03]"
              >
                <RotateCcw className="h-3 w-3" />
                PLAY AGAIN
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
