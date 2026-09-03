import assert from "node:assert/strict";
import test from "node:test";
import {
  BOSS_FRAME,
  BUG_FRAME,
  DEFAULT_PALETTE,
  PLAYER_FRAMES,
  pixelMapSize,
} from "./sprites.ts";

const frames: [string, string[]][] = [
  ...(Object.entries(PLAYER_FRAMES) as [string, string[]][]),
  ["bug", BUG_FRAME],
  ["boss", BOSS_FRAME],
];

for (const [name, map] of frames) {
  test(`${name} frame is rectangular and only uses palette keys`, () => {
    const { w, h } = pixelMapSize(map);
    assert.equal(h, map.length);
    assert.ok(w > 0);
    for (const row of map) {
      assert.equal(row.length, w, `row width in ${name}`);
      for (const ch of row) {
        assert.ok(ch === "." || ch in DEFAULT_PALETTE, `unknown key "${ch}"`);
      }
    }
  });
}

test("player frames share one size so animation does not jitter", () => {
  const sizes = Object.values(PLAYER_FRAMES).map((m) => pixelMapSize(m));
  for (const s of sizes) assert.deepEqual(s, sizes[0]);
});
