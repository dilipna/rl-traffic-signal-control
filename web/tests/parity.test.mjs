import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { makeTape, rollout, Intersection, Random } from "../src/engine.js";
const policy = JSON.parse(
    await readFile(new URL("../public/evidence/policy.json", import.meta.url)),
  ),
  parity = JSON.parse(
    await readFile(new URL("../public/evidence/parity.json", import.meta.url)),
  );
for (const expected of parity) {
  test(`Python/JS full trace parity: ${expected.scenario}/${expected.controller}`, () => {
    const actual = rollout(
      makeTape(expected.scenario, expected.seed),
      expected.controller,
      policy,
    );
    assert.deepEqual(actual.metrics, expected.metrics);
    assert.deepEqual(actual.frames, expected.frames);
  });
}
test("invalid inputs fail closed", () => {
  for (const seed of [-1, NaN, 4294967296, "1"])
    assert.throws(() => new Random(seed));
  assert.throws(() => makeTape("unknown", 1));
  assert.throws(() => makeTape("balanced", 1, 100000));
  assert.throws(() => new Intersection().step(true, [1, 1, 3]));
  assert.throws(() => new Intersection().step(1, [31, 1, 3]));
});
test("conservation and clearance across all controllers", () => {
  for (const c of ["fixed", "queue", "q"]) {
    const result = rollout(makeTape("saturated", 1924), c, policy);
    const m = result.metrics;
    assert.equal(m.arrived, m.served + m.dropped + m.remaining);
    assert.ok(result.frames.every((f) => !f.allRed || f.served === 0));
  }
});
