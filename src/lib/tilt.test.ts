import assert from "node:assert/strict";
import test from "node:test";
import { getTiltFromPointer } from "./tilt.ts";

test("returns a neutral transform at the center of an element", () => {
  assert.deepEqual(
    getTiltFromPointer({ x: 150, y: 100 }, { left: 50, top: 50, width: 200, height: 100 }),
    { rotateX: 0, rotateY: 0 }
  );
});

test("clamps pointer-driven rotation to the configured intensity", () => {
  assert.deepEqual(
    getTiltFromPointer(
      { x: 1000, y: -1000 },
      { left: 0, top: 0, width: 200, height: 100 },
      8
    ),
    { rotateX: 8, rotateY: 8 }
  );
});
