import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Github,
  RefreshCw,
  Star,
  GitFork,
  Users,
  FolderGit2,
  CalendarDays,
  Code2,
} from "lucide-react";
import { useCountUp } from "@/hooks/useCountUp";

const USERNAME = "smfardeen7";
const PROFILE_URL = `https://github.com/${USERNAME}`;
const CACHE_KEY = "gh-stats-v2";
const CACHE_TTL = 1000 * 60 * 60 * 6; // 6 hours

interface Stats {
  repos: number;
  stars: number;
  followers: number;
  forks: number;
  sinceYear: number | null;
  languages: { name: string; pct: number }[];
  fetchedAt: number;
}

type State =
  | { status: "loading" }
  | { status: "ready"; data: Stats }
  | { status: "error" };

const LANG_COLORS: Record<string, string> = {
  Python: "#3572A5",
  JavaScript: "#f1e05a",
  TypeScript: "#3178c6",
  Java: "#b07219",
  "Jupyter Notebook": "#DA5B0B",
  HTML: "#e34c26",
  CSS: "#563d7c",
  "C++": "#f34b7d",
  C: "#555555",
  Shell: "#89e051",
};

function readCache(): Stats | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Stats;
    if (Date.now() - parsed.fetchedAt > CACHE_TTL) return null;
    return parsed;
  } catch {
    return null;
  }
}

async function fetchStats(): Promise<Stats> {
  const [userRes, reposRes] = await Promise.all([
    fetch(`https://api.github.com/users/${USERNAME}`),
    fetch(`https://api.github.com/users/${USERNAME}/repos?per_page=100&sort=pushed`),
  ]);
  if (!userRes.ok || !reposRes.ok) throw new Error("GitHub API error");

  const user = await userRes.json();
  const repos: Array<{
    stargazers_count: number;
    forks_count: number;
    language: string | null;
    fork: boolean;
  }> = await reposRes.json();

  const owned = repos.filter((r) => !r.fork);
  const stars = owned.reduce((s, r) => s + r.stargazers_count, 0);
  const forks = owned.reduce((s, r) => s + r.forks_count, 0);

  const counts = new Map<string, number>();
  for (const r of owned) {
    if (!r.language) continue;
    counts.set(r.language, (counts.get(r.language) ?? 0) + 1);
  }
  const total = [...counts.values()].reduce((a, b) => a + b, 0) || 1;
  const languages = [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, n]) => ({ name, pct: Math.round((n / total) * 100) }));

  const sinceYear = user.created_at
    ? new Date(user.created_at).getFullYear()
    : null;

  return {
    repos: user.public_repos ?? owned.length,
    stars,
    followers: user.followers ?? 0,
    forks,
    sinceYear,
    languages,
    fetchedAt: Date.now(),
  };
}

interface TileSpec {
  icon: typeof Star;
  label: string;
  /** Numeric value → counts up. */
  value?: number;
  /** Plain text value → rendered as-is (e.g. "2021"). */
  text?: string;
}

function Tile({ spec, start }: { spec: TileSpec; start: boolean }) {
  const shown = useCountUp({
    end: spec.value ?? 0,
    start,
    duration: 1200,
  });
  const Icon = spec.icon;
  return (
    <div className="glass-card flex flex-col gap-1 p-4">
      <Icon className="h-4 w-4 text-accent" />
      <span
        className={`font-display font-bold leading-tight ${
          spec.text ? "text-lg" : "text-2xl tabular-nums leading-none"
        }`}
      >
        {spec.text ?? shown}
      </span>
      <span className="text-xs text-muted-foreground">{spec.label}</span>
    </div>
  );
}

/**
 * Pick the four most flattering tiles: repos and followers always show;
 * stars and forks only when non-zero; the account-age and top-language
 * tiles fill any remaining slots so we never lead with a zero.
 */
function buildTiles(d: Stats): TileSpec[] {
  const tiles: TileSpec[] = [
    { icon: FolderGit2, value: d.repos, label: "Public repos" },
    { icon: Users, value: d.followers, label: "Followers" },
  ];
  if (d.stars > 0) tiles.push({ icon: Star, value: d.stars, label: "Stars earned" });
  if (d.forks > 0) tiles.push({ icon: GitFork, value: d.forks, label: "Forks" });
  if (d.sinceYear) {
    tiles.push({
      icon: CalendarDays,
      text: `’${String(d.sinceYear).slice(2)}`,
      label: "On GitHub since",
    });
  }
  if (d.languages[0]) {
    tiles.push({
      icon: Code2,
      text: d.languages[0].name,
      label: "Top language",
    });
  }
  return tiles.slice(0, 4);
}

export default function GitHubStats() {
  const [state, setState] = useState<State>({ status: "loading" });
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLElement>(null);

  const load = useCallback(async (opts?: { force?: boolean }) => {
    if (!opts?.force) {
      const cached = readCache();
      if (cached) {
        setState({ status: "ready", data: cached });
        return;
      }
    }
    setState({ status: "loading" });
    try {
      const data = await fetchStats();
      localStorage.setItem(CACHE_KEY, JSON.stringify(data));
      setState({ status: "ready", data });
    } catch {
      setState({ status: "error" });
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => e.isIntersecting && setInView(true),
      { threshold: 0.25 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section ref={ref} id="github" className="section-container">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5 }}
      >
        <span className="eyebrow">github</span>
        <h2 className="section-title">Open source, live</h2>
        <p className="section-subtitle">
          Pulled straight from the GitHub API when the page loads.
        </p>
      </motion.div>

      <div className="mt-10">
        {state.status === "loading" && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="glass-card h-[104px] animate-pulse bg-muted/30"
              />
            ))}
          </div>
        )}

        {state.status === "error" && (
          <div className="glass-card flex flex-col items-center gap-3 p-8 text-center">
            <p className="text-sm text-muted-foreground">
              GitHub’s API didn’t respond (it rate-limits anonymous requests).
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => load({ force: true })}
                className="inline-flex items-center gap-2 rounded-full border border-border
                           bg-card px-4 py-2 text-sm font-medium transition-colors
                           hover:border-accent/40"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Retry
              </button>
              <a
                href={PROFILE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2
                           text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90"
              >
                <Github className="h-3.5 w-3.5" />
                View profile
              </a>
            </div>
          </div>
        )}

        {state.status === "ready" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {buildTiles(state.data).map((spec) => (
                <Tile key={spec.label} spec={spec} start={inView} />
              ))}
            </div>

            {state.data.languages.length > 0 && (
              <div className="glass-card p-5">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/80">
                    Most-used languages
                  </h3>
                  <a
                    href={PROFILE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <Github className="h-3.5 w-3.5" />
                    @{USERNAME}
                  </a>
                </div>

                <div className="flex h-2.5 overflow-hidden rounded-full bg-muted">
                  {state.data.languages.map((l) => (
                    <div
                      key={l.name}
                      style={{
                        width: `${l.pct}%`,
                        background: LANG_COLORS[l.name] ?? "hsl(var(--accent))",
                      }}
                      title={`${l.name} · ${l.pct}%`}
                    />
                  ))}
                </div>

                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
                  {state.data.languages.map((l) => (
                    <span
                      key={l.name}
                      className="flex items-center gap-1.5 text-xs text-muted-foreground"
                    >
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{
                          background:
                            LANG_COLORS[l.name] ?? "hsl(var(--accent))",
                        }}
                      />
                      {l.name}
                      <span className="text-muted-foreground/50">{l.pct}%</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
