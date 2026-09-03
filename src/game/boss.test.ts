import assert from "node:assert/strict";
import test from "node:test";
import {
  QUESTION_BANK,
  answer,
  createRound,
  initialBoss,
  mulberry32,
} from "./boss.ts";

test("a round draws unique questions with the answer at answerIndex", () => {
  const round = createRound(mulberry32(7), 5);
  assert.equal(round.length, 5);
  assert.equal(new Set(round.map((q) => q.id)).size, 5);
  for (const q of round) {
    assert.equal(q.options.length, 4);
    const bank = QUESTION_BANK.find((b) => b.id === q.id)!;
    assert.equal(q.options[q.answerIndex], bank.answer);
  }
});

test("the same seed produces the same round", () => {
  const a = createRound(mulberry32(42), 5).map((q) => q.id);
  const b = createRound(mulberry32(42), 5).map((q) => q.id);
  assert.deepEqual(a, b);
});

test("correct answers drain the boss until it is defeated", () => {
  let s = initialBoss(2);
  s = answer(s, true);
  assert.deepEqual(s, { index: 1, total: 2, bossHp: 1, hearts: 3, status: "playing" });
  s = answer(s, true);
  assert.equal(s.status, "won");
});

test("three wrong answers lose the fight", () => {
  let s = initialBoss(5);
  s = answer(answer(answer(s, false), false), false);
  assert.equal(s.hearts, 0);
  assert.equal(s.status, "lost");
});

test("running out of questions with boss hp left loses", () => {
  let s = initialBoss(2);
  s = answer(s, false);
  s = answer(s, false);
  assert.equal(s.status, "lost");
});

test("answers after the fight ended are ignored", () => {
  let s = initialBoss(1);
  s = answer(s, true);
  assert.equal(s.status, "won");
  assert.deepEqual(answer(s, false), s);
});
