import assert from "node:assert/strict";
import test from "node:test";
import { levelFor, levelInfo, MAX_LEVEL } from "./levels.ts";

test("0 xp is level 1 Intern with no progress", () => {
  assert.equal(levelFor(0), 1);
  assert.deepEqual(levelInfo(0), {
    level: 1,
    title: "Intern",
    current: 0,
    next: 100,
    progress: 0,
  });
});

test("thresholds are inclusive", () => {
  assert.equal(levelFor(99), 1);
  assert.equal(levelFor(100), 2);
  assert.equal(levelInfo(175).progress, 0.5);
});

test("caps at the max level", () => {
  const info = levelInfo(99999);
  assert.equal(info.level, MAX_LEVEL);
  assert.equal(info.title, "Legend");
  assert.equal(info.next, null);
  assert.equal(info.progress, 1);
});
