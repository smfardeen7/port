import { PROJECTS, SKILLS_LIST } from "@/constants";
import { CHAPTER_TOTAL } from "@/constants/journey";
import type { ProjectCategory } from "@/constants/projectDetails";

export interface Zone {
  id: string;
  name: string;
  /** DOM id of the section this zone wraps. */
  sectionId: string;
}

export const ZONES: Zone[] = [
  { id: "home", name: "Spawn Point", sectionId: "home" },
  { id: "journey", name: "Origin Story", sectionId: "journey" },
  { id: "experience", name: "Career Road", sectionId: "experience" },
  { id: "skills", name: "Skill Forge", sectionId: "skills" },
  { id: "education", name: "The Academy", sectionId: "education" },
  { id: "certifications", name: "Hall of Badges", sectionId: "certifications" },
  { id: "projects", name: "Loot Vault", sectionId: "projects" },
  { id: "publications", name: "The Library", sectionId: "publications" },
  { id: "github", name: "Open Source Tower", sectionId: "github" },
  { id: "tldr", name: "Save Point", sectionId: "tldr" },
  { id: "boss", name: "Boss Arena", sectionId: "boss" },
  { id: "contact", name: "Final Gate", sectionId: "contact" },
];

export const XP = {
  zone: 20,
  skill: 5,
  project: 15,
  chapter: 10,
  coin: 2,
  coinCap: 60,
  quest: 50,
  boss: 150,
} as const;

export const SKILL_TOTAL = SKILLS_LIST.reduce((n, g) => n + g.items.length, 0);
export const PROJECT_TOTAL = PROJECTS.length;
export { CHAPTER_TOTAL };

export type Rarity = "legendary" | "epic" | "rare" | "uncommon";

export const RARITY_BY_CATEGORY: Record<ProjectCategory, Rarity> = {
  Research: "legendary",
  "AI & ML": "epic",
  "Full-Stack": "rare",
  DevOps: "uncommon",
};

export const RARITY_STYLES: Record<
  Rarity,
  { label: string; color: string; border: string; glow: string; text: string }
> = {
  legendary: {
    label: "Legendary",
    color: "#fbbf24",
    border: "border-amber-400/60",
    glow: "0 0 0 1px rgba(251,191,36,.25), 0 14px 40px -14px rgba(251,191,36,.45)",
    text: "text-amber-400",
  },
  epic: {
    label: "Epic",
    color: "#a78bfa",
    border: "border-violet-400/60",
    glow: "0 0 0 1px rgba(167,139,250,.22), 0 14px 40px -14px rgba(167,139,250,.45)",
    text: "text-violet-400",
  },
  rare: {
    label: "Rare",
    color: "#38bdf8",
    border: "border-sky-400/60",
    glow: "0 0 0 1px rgba(56,189,248,.22), 0 14px 40px -14px rgba(56,189,248,.45)",
    text: "text-sky-400",
  },
  uncommon: {
    label: "Uncommon",
    color: "#34d399",
    border: "border-emerald-400/60",
    glow: "0 0 0 1px rgba(52,211,153,.22), 0 14px 40px -14px rgba(52,211,153,.45)",
    text: "text-emerald-400",
  },
};
