import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Check,
  Copy,
  FileText,
  Github,
  Home,
  Linkedin,
  Mail,
  Moon,
  RotateCcw,
  ScrollText,
  Search,
  Sun,
  Swords,
} from "lucide-react";
import { NAV_LINKS, RESUME_LINK, ABOUT_ME } from "@/constants";
import { copyText } from "@/lib/clipboard";
import { useTheme } from "@/lib/theme";
import { lockScroll, scrollToHash, unlockScroll } from "@/lib/scroll";
import { useGame } from "@/game/store";

const OPEN_EVENT = "command-palette:open";

/** Programmatically open the palette from anywhere (e.g. a navbar button). */
export function openCommandPalette() {
  window.dispatchEvent(new CustomEvent(OPEN_EVENT));
}

interface Item {
  id: string;
  label: string;
  hint?: string;
  group: "Navigation" | "Actions" | "Links";
  keywords?: string;
  icon: typeof Home;
  run: () => void | Promise<void>;
}

const LINKEDIN_URL = "https://www.linkedin.com/in/shaikmofardeen/";
const GITHUB_URL = "https://github.com/smfardeen7";

export default function CommandPalette() {
  const { theme, toggleTheme } = useTheme();
  const markResume = useGame((s) => s.markResume);
  const markEmail = useGame((s) => s.markEmail);
  const markTheme = useGame((s) => s.markTheme);
  const setPanel = useGame((s) => s.setPanel);
  const resetGame = useGame((s) => s.reset);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setActive(0);
  }, []);

  const go = useCallback(
    (hash: string) => {
      close();
      // Let the palette unlock scrolling before Lenis starts moving.
      setTimeout(() => scrollToHash(hash === "#home" ? "#" : hash), 40);
    },
    [close]
  );

  const copyEmail = useCallback(async () => {
    const ok = await copyText(ABOUT_ME.email);
    markEmail();
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } else {
      window.location.href = `mailto:${ABOUT_ME.email}`;
    }
  }, [markEmail]);

  const items = useMemo<Item[]>(() => {
    const nav: Item[] = [
      {
        id: "nav-home",
        label: "Home",
        group: "Navigation",
        icon: Home,
        run: () => go("#home"),
      },
      ...NAV_LINKS.map((l) => ({
        id: `nav-${l.link}`,
        label: l.title,
        group: "Navigation" as const,
        icon: ArrowRight,
        run: () => go(l.link),
      })),
      {
        id: "nav-boss",
        label: "Boss fight",
        group: "Navigation",
        keywords: "quiz game hiring manager",
        icon: Swords,
        run: () => go("#boss"),
      },
    ];

    const actions: Item[] = [
      {
        id: "act-copy-email",
        label: copied ? "Email copied" : "Copy email address",
        hint: ABOUT_ME.email,
        group: "Actions",
        keywords: "mail contact reach",
        icon: copied ? Check : Copy,
        run: copyEmail,
      },
      {
        id: "act-resume",
        label: "Open résumé (PDF)",
        group: "Actions",
        keywords: "cv download",
        icon: FileText,
        run: () => {
          close();
          markResume();
          window.open(RESUME_LINK, "_blank", "noopener");
        },
      },
      {
        id: "act-theme",
        label: theme === "dark" ? "Switch to light theme" : "Switch to dark theme",
        group: "Actions",
        keywords: "dark light mode appearance",
        icon: theme === "dark" ? Sun : Moon,
        run: () => {
          toggleTheme();
          markTheme();
        },
      },
      {
        id: "act-quests",
        label: "Open quest log",
        group: "Actions",
        keywords: "game achievements badges xp level",
        icon: ScrollText,
        run: () => {
          close();
          setTimeout(() => setPanel(true), 40);
        },
      },
      {
        id: "act-reset",
        label: "Reset game progress",
        group: "Actions",
        keywords: "restart new game",
        icon: RotateCcw,
        run: () => {
          close();
          resetGame();
        },
      },
    ];

    const links: Item[] = [
      {
        id: "link-github",
        label: "GitHub",
        hint: "@smfardeen7",
        group: "Links",
        icon: Github,
        run: () => {
          close();
          window.open(GITHUB_URL, "_blank", "noopener");
        },
      },
      {
        id: "link-linkedin",
        label: "LinkedIn",
        hint: "in/shaikmofardeen",
        group: "Links",
        icon: Linkedin,
        run: () => {
          close();
          window.open(LINKEDIN_URL, "_blank", "noopener");
        },
      },
      {
        id: "link-email",
        label: "Send an email",
        group: "Links",
        icon: Mail,
        run: () => {
          close();
          window.location.href = `mailto:${ABOUT_ME.email}`;
        },
      },
    ];

    return [...nav, ...actions, ...links];
  }, [go, close, copyEmail, copied, theme, toggleTheme, markResume, markTheme, setPanel, resetGame]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((it) =>
      `${it.label} ${it.hint ?? ""} ${it.keywords ?? ""} ${it.group}`
        .toLowerCase()
        .includes(q)
    );
  }, [items, query]);

  const grouped = useMemo(() => {
    const order = ["Navigation", "Actions", "Links"] as const;
    return order
      .map((g) => ({ group: g, items: filtered.filter((i) => i.group === g) }))
      .filter((s) => s.items.length > 0);
  }, [filtered]);

  // Global hotkeys: Cmd/Ctrl+K and "/" open; toggle if already open.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
        return;
      }
      const el = document.activeElement;
      const typing =
        el instanceof HTMLInputElement ||
        el instanceof HTMLTextAreaElement ||
        (el instanceof HTMLElement && el.isContentEditable);
      if (!open && e.key === "/" && !typing) {
        e.preventDefault();
        setOpen(true);
      }
    };
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener(OPEN_EVENT, onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(OPEN_EVENT, onOpen);
    };
  }, [open]);

  useEffect(() => {
    if (open) {
      const t = setTimeout(() => inputRef.current?.focus(), 20);
      lockScroll();
      return () => {
        clearTimeout(t);
        unlockScroll();
      };
    }
  }, [open]);

  useEffect(() => setActive(0), [query]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      close();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      filtered[active]?.run();
    }
  };

  useEffect(() => {
    const node = listRef.current?.querySelector<HTMLElement>(
      `[data-idx="${active}"]`
    );
    node?.scrollIntoView({ block: "nearest" });
  }, [active]);

  let runningIndex = -1;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[90] flex items-start justify-center px-4 pt-[12vh]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          <div
            className="absolute inset-0 bg-background/60 backdrop-blur-sm"
            onClick={close}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Command palette"
            onKeyDown={onKeyDown}
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 32 }}
            className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-border
                       bg-card/95 shadow-2xl shadow-black/30 backdrop-blur-xl"
          >
            <div className="flex items-center gap-3 border-b border-border/60 px-4">
              <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Jump to a section, copy my email, open my résumé…"
                className="w-full bg-transparent py-4 text-sm outline-none
                           placeholder:text-muted-foreground/70"
              />
              <kbd className="hidden shrink-0 rounded border border-border bg-muted/60 px-1.5
                             py-0.5 font-mono text-[10px] text-muted-foreground sm:block">
                esc
              </kbd>
            </div>

            <div ref={listRef} className="max-h-[52vh] overflow-y-auto p-2">
              {grouped.length === 0 && (
                <p className="px-3 py-6 text-center text-sm text-muted-foreground">
                  No matches for “{query}”.
                </p>
              )}

              {grouped.map((section) => (
                <div key={section.group} className="mb-1 last:mb-0">
                  <p className="px-3 pb-1 pt-2 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground/60">
                    {section.group}
                  </p>
                  {section.items.map((it) => {
                    runningIndex += 1;
                    const idx = runningIndex;
                    const isActive = idx === active;
                    const Icon = it.icon;
                    return (
                      <button
                        key={it.id}
                        data-idx={idx}
                        onMouseEnter={() => setActive(idx)}
                        onClick={() => it.run()}
                        className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm
                                   transition-colors ${
                                     isActive
                                       ? "bg-accent/12 text-foreground"
                                       : "text-muted-foreground hover:text-foreground"
                                   }`}
                      >
                        <Icon
                          className={`h-4 w-4 shrink-0 ${
                            isActive ? "text-accent" : "text-muted-foreground"
                          }`}
                        />
                        <span className="flex-1 truncate">{it.label}</span>
                        {it.hint && (
                          <span className="shrink-0 font-mono text-[11px] text-muted-foreground/60">
                            {it.hint}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between border-t border-border/60 px-4 py-2 font-mono text-[10px] text-muted-foreground/60">
              <span>↑↓ navigate · ↵ select</span>
              <span>⌘K</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
