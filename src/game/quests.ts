/**
 * Quest definitions and evaluation. Pure; the store feeds it a plain
 * `QuestFacts` snapshot and gets back which quests just completed.
 */
export interface QuestFacts {
  zonesDiscovered: number;
  zonesTotal: number;
  skillsUnlocked: number;
  skillsTotal: number;
  projectsOpened: number;
  projectsTotal: number;
  resumeOpened: boolean;
  emailSent: boolean;
  bestRun: number;
  bossDefeated: boolean;
  konami: boolean;
  themeToggled: boolean;
}

export interface QuestDef {
  id: string;
  title: string;
  description: string;
  icon: string;
  /** Hidden quests show as "???" until completed. */
  hidden?: boolean;
  progress: (f: QuestFacts) => { value: number; target: number };
}

const flag = (v: boolean) => ({ value: v ? 1 : 0, target: 1 });

export const QUESTS: QuestDef[] = [
  {
    id: "first-steps",
    title: "First Steps",
    description: "Discover 3 areas of the site.",
    icon: "👣",
    progress: (f) => ({ value: f.zonesDiscovered, target: 3 }),
  },
  {
    id: "cartographer",
    title: "Cartographer",
    description: "Discover every area.",
    icon: "🗺️",
    progress: (f) => ({ value: f.zonesDiscovered, target: f.zonesTotal }),
  },
  {
    id: "forge-10",
    title: "Apprentice Smith",
    description: "Unlock 10 skills in the Skill Forge.",
    icon: "⚒️",
    progress: (f) => ({ value: f.skillsUnlocked, target: 10 }),
  },
  {
    id: "forge-all",
    title: "Master Smith",
    description: "Unlock every skill.",
    icon: "🔥",
    progress: (f) => ({ value: f.skillsUnlocked, target: f.skillsTotal }),
  },
  {
    id: "loot-3",
    title: "Loot Hunter",
    description: "Open 3 project cards.",
    icon: "💎",
    progress: (f) => ({ value: f.projectsOpened, target: 3 }),
  },
  {
    id: "loot-all",
    title: "Vault Cleared",
    description: "Open every project.",
    icon: "🏆",
    progress: (f) => ({ value: f.projectsOpened, target: f.projectsTotal }),
  },
  {
    id: "resume",
    title: "Read the Scroll",
    description: "Open the résumé.",
    icon: "📜",
    progress: (f) => flag(f.resumeOpened),
  },
  {
    id: "raven",
    title: "Send a Raven",
    description: "Copy the email address or open the mail link.",
    icon: "🕊️",
    progress: (f) => flag(f.emailSent),
  },
  {
    id: "runner-15",
    title: "Sprinter",
    description: "Score 15 or more in Skill Run.",
    icon: "🏃",
    progress: (f) => ({ value: f.bestRun, target: 15 }),
  },
  {
    id: "boss",
    title: "Hired!",
    description: "Defeat the Hiring Manager.",
    icon: "👑",
    progress: (f) => flag(f.bossDefeated),
  },
  {
    id: "theme",
    title: "Day / Night",
    description: "Toggle the theme.",
    icon: "🌗",
    progress: (f) => flag(f.themeToggled),
  },
  {
    id: "konami",
    title: "Cheat Code",
    description: "Some codes never die. ↑ ↑ ↓ ↓ ← → ← → B A",
    icon: "🕹️",
    hidden: true,
    progress: (f) => flag(f.konami),
  },
];

/** Badges that are not quests (level milestones). */
export const EXTRA_ACHIEVEMENTS = [
  { id: "level-5", title: "Halfway There", description: "Reach level 5.", icon: "⭐" },
  { id: "level-8", title: "Legend", description: "Reach the final level.", icon: "🌟" },
];

export function questProgress(q: QuestDef, f: QuestFacts) {
  const { value, target } = q.progress(f);
  const clamped = Math.min(value, target);
  return { value: clamped, target, done: clamped >= target };
}

export function newlyCompleted(
  f: QuestFacts,
  completed: readonly string[]
): string[] {
  return QUESTS.filter(
    (q) => !completed.includes(q.id) && questProgress(q, f).done
  ).map((q) => q.id);
}
