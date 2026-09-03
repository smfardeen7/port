import assert from "node:assert/strict";
import test from "node:test";
import {
  QUESTS,
  newlyCompleted,
  questProgress,
  type QuestFacts,
} from "./quests.ts";

const base: QuestFacts = {
  zonesDiscovered: 0,
  zonesTotal: 10,
  skillsUnlocked: 0,
  skillsTotal: 52,
  projectsOpened: 0,
  projectsTotal: 11,
  resumeOpened: false,
  emailSent: false,
  bestRun: 0,
  bossDefeated: false,
  konami: false,
  themeToggled: false,
  chaptersRead: 0,
  chaptersTotal: 6,
};

test("first-steps completes at three zones", () => {
  assert.deepEqual(newlyCompleted({ ...base, zonesDiscovered: 2 }, []), []);
  assert.deepEqual(newlyCompleted({ ...base, zonesDiscovered: 3 }, []), [
    "first-steps",
  ]);
});

test("already completed quests are not returned again", () => {
  assert.deepEqual(
    newlyCompleted({ ...base, zonesDiscovered: 3 }, ["first-steps"]),
    []
  );
});

test("progress is clamped to the target", () => {
  const q = QUESTS.find((x) => x.id === "forge-10")!;
  assert.deepEqual(questProgress(q, { ...base, skillsUnlocked: 30 }), {
    value: 10,
    target: 10,
    done: true,
  });
});

test("boolean quests report 0/1 progress", () => {
  const q = QUESTS.find((x) => x.id === "resume")!;
  assert.deepEqual(questProgress(q, base), { value: 0, target: 1, done: false });
  assert.deepEqual(questProgress(q, { ...base, resumeOpened: true }), {
    value: 1,
    target: 1,
    done: true,
  });
});

test("origin-story completes once every chapter is read", () => {
  const q = QUESTS.find((x) => x.id === "origin-story")!;
  assert.deepEqual(questProgress(q, { ...base, chaptersRead: 4 }), { value: 4, target: 6, done: false });
  assert.deepEqual(newlyCompleted({ ...base, chaptersRead: 6 }, []), ["origin-story"]);
});

test("every quest has a unique id", () => {
  assert.equal(new Set(QUESTS.map((q) => q.id)).size, QUESTS.length);
});
