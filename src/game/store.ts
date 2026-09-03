import { useMemo } from "react";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { levelFor, levelInfo, MAX_LEVEL } from "./levels";
import { newlyCompleted, QUESTS, type QuestFacts } from "./quests";
import { CHAPTER_TOTAL, PROJECT_TOTAL, SKILL_TOTAL, XP, ZONES } from "./data";

export type ToastKind = "xp" | "zone" | "quest" | "achievement" | "info";

export interface Toast {
  id: number;
  kind: ToastKind;
  title: string;
  body?: string;
  icon?: string;
  xp?: number;
}

type ToastInput = Omit<Toast, "id">;

export interface GameState {
  // persisted
  playerName: string;
  xp: number;
  soundOn: boolean;
  zones: string[];
  skills: string[];
  projects: string[];
  chapters: string[];
  quests: string[];
  achievements: string[];
  bestRun: number;
  bossDefeated: boolean;
  konami: boolean;
  resumeOpened: boolean;
  emailSent: boolean;
  themeToggled: boolean;
  // transient
  started: boolean;
  toasts: Toast[];
  levelUpTo: number | null;
  panelOpen: boolean;

  start: (name?: string) => void;
  setName: (name: string) => void;
  toggleSound: () => void;
  discoverZone: (id: string) => void;
  unlockSkill: (id: string) => void;
  unlockSkills: (ids: string[]) => void;
  openProject: (id: string) => void;
  readChapter: (id: string) => void;
  finishRun: (score: number) => void;
  defeatBoss: () => void;
  triggerKonami: () => void;
  markResume: () => void;
  markEmail: () => void;
  markTheme: () => void;
  dismissToast: (id: number) => void;
  clearLevelUp: () => void;
  setPanel: (open: boolean) => void;
  reset: () => void;
}

let toastSeq = 1;
const mkToast = (t: ToastInput): Toast => ({ ...t, id: toastSeq++ });

const INITIAL = {
  playerName: "Recruiter",
  xp: 0,
  soundOn: false,
  zones: [] as string[],
  skills: [] as string[],
  projects: [] as string[],
  chapters: [] as string[],
  quests: [] as string[],
  achievements: [] as string[],
  bestRun: 0,
  bossDefeated: false,
  konami: false,
  resumeOpened: false,
  emailSent: false,
  themeToggled: false,
  started: false,
  toasts: [] as Toast[],
  levelUpTo: null as number | null,
  panelOpen: false,
};

type Data = typeof INITIAL;

export function factsFrom(s: Data): QuestFacts {
  return {
    zonesDiscovered: s.zones.length,
    zonesTotal: ZONES.length,
    skillsUnlocked: s.skills.length,
    skillsTotal: SKILL_TOTAL,
    projectsOpened: s.projects.length,
    projectsTotal: PROJECT_TOTAL,
    resumeOpened: s.resumeOpened,
    emailSent: s.emailSent,
    bestRun: s.bestRun,
    bossDefeated: s.bossDefeated,
    konami: s.konami,
    themeToggled: s.themeToggled,
    chaptersRead: s.chapters.length,
    chaptersTotal: CHAPTER_TOTAL,
  };
}

/**
 * Apply a change, add XP, then award any quests that just completed and
 * detect a level-up. Every game action funnels through here.
 */
function progress(
  s: Data,
  patch: Partial<Data>,
  gained: number,
  toast?: ToastInput
): Partial<Data> {
  const merged: Data = { ...s, ...patch };
  let xp = merged.xp + gained;
  const toasts = [...merged.toasts];
  if (toast) toasts.push(mkToast({ ...toast, xp: gained > 0 ? gained : toast.xp }));

  const quests = [...merged.quests];
  const achievements = [...merged.achievements];
  for (const id of newlyCompleted(factsFrom(merged), quests)) {
    const q = QUESTS.find((x) => x.id === id);
    if (!q) continue;
    quests.push(id);
    achievements.push(id);
    xp += XP.quest;
    toasts.push(
      mkToast({
        kind: "quest",
        title: q.title,
        body: `Quest complete. ${q.description}`,
        icon: q.icon,
        xp: XP.quest,
      })
    );
  }

  let levelUpTo = merged.levelUpTo;
  const before = levelFor(s.xp);
  const after = levelFor(xp);
  if (after > before) {
    levelUpTo = after;
    if (after >= 5 && !achievements.includes("level-5")) achievements.push("level-5");
    if (after >= MAX_LEVEL && !achievements.includes("level-8")) achievements.push("level-8");
  }

  return { ...patch, xp, toasts, quests, achievements, levelUpTo };
}

export const useGame = create<GameState>()(
  persist(
    (set, get) => ({
      ...INITIAL,

      start: (name) =>
        set((s) => ({
          started: true,
          playerName: name?.trim() ? name.trim().slice(0, 16) : s.playerName,
        })),
      setName: (name) => set({ playerName: name.slice(0, 16) }),
      toggleSound: () => set((s) => ({ soundOn: !s.soundOn })),

      discoverZone: (id) => {
        const s = get();
        if (s.zones.includes(id)) return;
        const zone = ZONES.find((z) => z.id === id);
        set(
          progress(s, { zones: [...s.zones, id] }, XP.zone, {
            kind: "zone",
            title: zone?.name ?? id,
            body: "New area discovered",
          })
        );
      },

      unlockSkill: (id) => {
        const s = get();
        if (s.skills.includes(id)) return;
        set(progress(s, { skills: [...s.skills, id] }, XP.skill));
      },

      unlockSkills: (ids) => {
        const s = get();
        const fresh = ids.filter((id) => !s.skills.includes(id));
        if (fresh.length === 0) return;
        set(progress(s, { skills: [...s.skills, ...fresh] }, XP.skill * fresh.length));
      },

      openProject: (id) => {
        const s = get();
        if (s.projects.includes(id)) return;
        set(
          progress(s, { projects: [...s.projects, id] }, XP.project, {
            kind: "xp",
            title: "Loot collected",
            icon: "💎",
          })
        );
      },

      readChapter: (id) => {
        const s = get();
        if (s.chapters.includes(id)) return;
        set(progress(s, { chapters: [...s.chapters, id] }, XP.chapter));
      },

      finishRun: (score) => {
        const s = get();
        const gained = Math.min(score * XP.coin, XP.coinCap);
        const best = Math.max(s.bestRun, score);
        const patch = { bestRun: best };
        if (gained <= 0) {
          set(progress(s, patch, 0));
          return;
        }
        set(
          progress(s, patch, gained, {
            kind: "xp",
            title: score > s.bestRun && s.bestRun > 0 ? "New best run!" : "Run complete",
            body: `${score} icon${score === 1 ? "" : "s"} collected`,
            icon: "🏃",
          })
        );
      },

      defeatBoss: () => {
        const s = get();
        if (s.bossDefeated) return;
        set(
          progress(s, { bossDefeated: true }, XP.boss, {
            kind: "achievement",
            title: "Boss defeated",
            body: "The final gate is open.",
            icon: "👑",
          })
        );
      },

      triggerKonami: () => {
        const s = get();
        if (s.konami) return;
        set(
          progress(s, { konami: true }, 0, {
            kind: "achievement",
            title: "Cheat code activated",
            icon: "🕹️",
          })
        );
      },

      markResume: () => {
        const s = get();
        if (s.resumeOpened) return;
        set(progress(s, { resumeOpened: true }, 0));
      },

      markEmail: () => {
        const s = get();
        if (s.emailSent) return;
        set(progress(s, { emailSent: true }, 0));
      },

      markTheme: () => {
        const s = get();
        if (s.themeToggled) return;
        set(progress(s, { themeToggled: true }, 0));
      },

      dismissToast: (id) =>
        set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
      clearLevelUp: () => set({ levelUpTo: null }),
      setPanel: (open) => set({ panelOpen: open }),

      reset: () =>
        set({ ...INITIAL, started: true, soundOn: get().soundOn, playerName: get().playerName }),
    }),
    {
      name: "quest-mode-v1",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        playerName: s.playerName,
        xp: s.xp,
        soundOn: s.soundOn,
        zones: s.zones,
        skills: s.skills,
        projects: s.projects,
        chapters: s.chapters,
        quests: s.quests,
        achievements: s.achievements,
        bestRun: s.bestRun,
        bossDefeated: s.bossDefeated,
        konami: s.konami,
        resumeOpened: s.resumeOpened,
        emailSent: s.emailSent,
        themeToggled: s.themeToggled,
      }),
    }
  )
);

/** Convenience selector: current level details (memoised per xp value). */
export function useLevel() {
  const xp = useGame((s) => s.xp);
  return useMemo(() => levelInfo(xp), [xp]);
}
