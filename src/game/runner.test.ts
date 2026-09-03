import assert from "node:assert/strict";
import test from "node:test";
import { WORLD, createWorld, intersects, startWorld, step } from "./runner.ts";

const rng = () => 0.5;

const bugAtPlayer = (id: number) => ({
  id,
  kind: "bug" as const,
  x: WORLD.playerX,
  y: WORLD.groundY - WORLD.bugH,
  w: WORLD.bugW,
  h: WORLD.bugH,
  icon: 0,
});

test("a fresh world is ready, not playing", () => {
  const w = createWorld();
  assert.equal(w.status, "ready");
  assert.equal(w.hearts, WORLD.maxHearts);
  assert.equal(w.player.grounded, true);
});

test("step does nothing until the world is started", () => {
  const w = createWorld();
  step(w, { jump: true }, rng);
  assert.equal(w.frame, 0);
  assert.equal(w.player.vy, 0);
});

test("jump only when grounded", () => {
  const w = startWorld(createWorld());
  step(w, { jump: true }, rng);
  assert.equal(w.player.grounded, false);
  assert.ok(w.player.vy < 0, "moving up");
  assert.ok(w.events.some((e) => e.type === "jump"));
  const vyAfter = w.player.vy;
  step(w, { jump: true }, rng);
  assert.ok(w.player.vy > vyAfter, "second jump ignored, gravity applied");
});

test("the player lands back on the ground", () => {
  const w = startWorld(createWorld());
  step(w, { jump: true }, rng);
  for (let i = 0; i < 120; i++) step(w, { jump: false }, rng);
  assert.equal(w.player.grounded, true);
  assert.equal(w.player.y, WORLD.groundY - WORLD.playerH);
});

test("collecting a coin raises the score and emits an event", () => {
  const w = startWorld(createWorld());
  w.entities.push({
    id: 1,
    kind: "coin",
    x: WORLD.playerX,
    y: WORLD.groundY - WORLD.coinSize,
    w: WORLD.coinSize,
    h: WORLD.coinSize,
    icon: 0,
  });
  step(w, { jump: false }, rng);
  assert.equal(w.score, 1);
  assert.equal(w.entities.length, 0);
  assert.ok(w.events.some((e) => e.type === "coin"));
});

test("a bug costs a heart once per invulnerability window", () => {
  const w = startWorld(createWorld());
  w.entities.push(bugAtPlayer(1));
  step(w, { jump: false }, rng);
  assert.equal(w.hearts, WORLD.maxHearts - 1);
  assert.ok(w.events.some((e) => e.type === "hurt"));
  w.entities.push(bugAtPlayer(2));
  step(w, { jump: false }, rng);
  assert.equal(w.hearts, WORLD.maxHearts - 1);
});

test("losing all hearts ends the run", () => {
  const w = startWorld(createWorld());
  w.hearts = 1;
  w.entities.push(bugAtPlayer(1));
  step(w, { jump: false }, rng);
  assert.equal(w.status, "over");
  assert.ok(w.events.some((e) => e.type === "over"));
});

test("the spawner adds entities and speed grows with score", () => {
  const w = startWorld(createWorld());
  for (let i = 0; i < 400; i++) step(w, { jump: false }, rng);
  assert.ok(w.nextId > 1, "spawned something");
  w.score = 20;
  step(w, { jump: false }, rng);
  assert.ok(w.speed > WORLD.baseSpeed);
  w.score = 10000;
  step(w, { jump: false }, rng);
  assert.equal(w.speed, WORLD.maxSpeed);
});

test("entities that leave the screen are removed", () => {
  const w = startWorld(createWorld());
  w.entities.push({ ...bugAtPlayer(1), x: -100 });
  step(w, { jump: false }, rng);
  assert.equal(w.entities.length, 0);
});

test("intersects uses an inset", () => {
  assert.equal(
    intersects({ x: 0, y: 0, w: 10, h: 10 }, { x: 9, y: 9, w: 10, h: 10 }, 4),
    false
  );
  assert.equal(
    intersects({ x: 0, y: 0, w: 10, h: 10 }, { x: 4, y: 4, w: 10, h: 10 }, 0),
    true
  );
});
