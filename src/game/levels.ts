/**
 * XP → level table. Pure; safe to import from node:test.
 */
export const LEVEL_THRESHOLDS = [0, 100, 250, 450, 700, 1000, 1400, 1900] as const;

export const LEVEL_TITLES = [
  "Intern",
  "Junior Dev",
  "Engineer",
  "Senior Engineer",
  "Staff Engineer",
  "Principal",
  "Architect",
  "Legend",
] as const;

export const MAX_LEVEL = LEVEL_THRESHOLDS.length;

export interface LevelInfo {
  /** 1-based level. */
  level: number;
  title: string;
  /** XP at which this level starts. */
  current: number;
  /** XP needed for the next level, or null at the cap. */
  next: number | null;
  /** 0..1 progress toward the next level (1 at the cap). */
  progress: number;
}

export function levelFor(xp: number): number {
  let level = 1;
  for (let i = 1; i < LEVEL_THRESHOLDS.length; i++) {
    if (xp >= LEVEL_THRESHOLDS[i]) level = i + 1;
  }
  return level;
}

export function levelInfo(xp: number): LevelInfo {
  const level = levelFor(xp);
  const current = LEVEL_THRESHOLDS[level - 1];
  const next = level < MAX_LEVEL ? LEVEL_THRESHOLDS[level] : null;
  const progress = next === null ? 1 : (xp - current) / (next - current);
  return { level, title: LEVEL_TITLES[level - 1], current, next, progress };
}
