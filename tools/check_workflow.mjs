import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
const lines = readFileSync(
  new URL("../.github/workflows/verify-website.yml", import.meta.url),
  "utf8",
).split(/\r?\n/);
const start = lines.findIndex((s) => s.trim() === "script: |");
assert.ok(start >= 0);
const block = [];
for (let i = start + 1; i < lines.length; i++) {
  if (lines[i].trim() && !lines[i].startsWith("            ")) break;
  block.push(lines[i].slice(12));
}
const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
const fn = new AsyncFunction("github", "context", "core", block.join("\n"));
for (const [label, origin, pass] of [
  [
    "verify-staging",
    "https://phase-traffic-lab-abc123-asmq333.vercel.app",
    true,
  ],
  ["verify-production", "https://phase-traffic-lab.vercel.app", true],
  ["verify-staging", "https://evil.example", false],
  ["verify-staging", "https://protopro-abc123-asmq333.vercel.app", false],
  [
    "verify-staging",
    "https://phase-traffic-lab-abc123-asmq333.vercel.app.evil.example",
    false,
  ],
  ["verify-production", "https://ops-verse.vercel.app", false],
]) {
  const prefix =
    label === "verify-production" ? "Production origin: " : "Staging origin: ";
  let captured;
  const github = {
    rest: {
      pulls: {
        get: async () => ({
          data: {
            head: { sha: "a" },
            body: "Release\n" + prefix + origin + "\n",
          },
        }),
      },
    },
  };
  const context = {
    repo: { owner: "dilipna", repo: "rl-traffic-signal-control" },
    issue: { number: 1 },
    payload: { label: { name: label }, pull_request: { head: { sha: "a" } } },
  };
  if (pass) {
    await fn(github, context, {
      setOutput: (key, value) => (captured = value),
    });
    assert.equal(captured, origin);
  } else await assert.rejects(() => fn(github, context, { setOutput() {} }));
}
console.log(
  "Hosted-verification script compiles and six origin allowlist checks pass",
);
