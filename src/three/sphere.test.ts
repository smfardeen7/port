import assert from "node:assert/strict";
import test from "node:test";
import { fibonacciSphere } from "./sphere.ts";

test("returns the requested number of points on the sphere", () => {
  const pts = fibonacciSphere(52, 2.5);
  assert.equal(pts.length, 52);
  for (const [x, y, z] of pts) {
    const r = Math.hypot(x, y, z);
    assert.ok(Math.abs(r - 2.5) < 1e-9, `radius ${r}`);
  }
});

test("points are spread out, not clumped", () => {
  const pts = fibonacciSphere(52, 1);
  let min = Infinity;
  for (let i = 0; i < pts.length; i++) {
    for (let j = i + 1; j < pts.length; j++) {
      const [a, b] = [pts[i], pts[j]];
      min = Math.min(min, Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]));
    }
  }
  // Ideal spacing on a unit sphere for 52 points is about 0.49; allow slack.
  assert.ok(min > 0.3, `min spacing ${min}`);
});

test("handles the degenerate sizes", () => {
  assert.deepEqual(fibonacciSphere(0, 1), []);
  assert.equal(fibonacciSphere(1, 3).length, 1);
});
