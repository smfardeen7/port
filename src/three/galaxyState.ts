import { create } from "zustand";
import type { Skill } from "@/constants/skillsList";

/** Which galaxy icon the pointer is over; shared between the scene and its caption. */
export const useGalaxyHover = create<{
  skill: Skill | null;
  set: (skill: Skill | null) => void;
}>((set) => ({
  skill: null,
  set: (skill) => set({ skill }),
}));
