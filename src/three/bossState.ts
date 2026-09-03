import { create } from "zustand";

/** Fight feedback for the 3D boss: bumps `hit` to recoil, `defeated` to topple. */
export const useBossFx = create<{
  hit: number;
  defeated: boolean;
  set: (patch: Partial<{ hit: number; defeated: boolean }>) => void;
}>((set) => ({
  hit: 0,
  defeated: false,
  set: (patch) => set(patch),
}));
