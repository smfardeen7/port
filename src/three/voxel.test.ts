import assert from "node:assert/strict";
import test from "node:test";
import { voxelBounds, voxelsFromPixelMap } from "./voxel.ts";

const palette = { s: "#38bdf8", k: "#f1c27d", r: "#ef4444" };

test("every non-transparent cell becomes a column of cubes", () => {
  const map = ["s.", "kk"];
  const v = voxelsFromPixelMap(map, palette);
  // s -> body depth 3, k (head key) -> depth 4, two k cells
  assert.equal(v.length, 3 + 4 + 4);
});

test("head keys get four cubes deep, others three", () => {
  const head = voxelsFromPixelMap(["k"], palette);
  const body = voxelsFromPixelMap(["s"], palette);
  assert.equal(head.length, 4);
  assert.equal(body.length, 3);
  assert.deepEqual(
    body.map((c) => c.z),
    [-1, 0, 1]
  );
});

test("shirt and red cells glow, skin does not", () => {
  const v = voxelsFromPixelMap(["skr"], palette);
  assert.equal(v.filter((c) => c.glow).length, 6);
  assert.equal(v.filter((c) => !c.glow).length, 4, "skin is a head key: four deep");
  assert.equal(v.find((c) => c.x === -1)?.color, "#38bdf8");
});

test("output is centred on the origin and y grows upward", () => {
  const v = voxelsFromPixelMap(["s.", ".s"], palette);
  const b = voxelBounds(v);
  assert.equal(b.minX + b.maxX, 0);
  assert.equal(b.minY + b.maxY, 0);
  const top = v.find((c) => c.y > 0)!;
  assert.equal(top.x, -0.5, "top-left cell sits left of centre");
});

test("unknown keys are skipped", () => {
  assert.equal(voxelsFromPixelMap(["?z"], palette).length, 0);
});
