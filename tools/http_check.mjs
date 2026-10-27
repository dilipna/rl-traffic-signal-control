import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { createHash } from "node:crypto";
import assert from "node:assert/strict";
import { resolve } from "node:path";
const [origin, expectedSource, output] = process.argv.slice(2);
assert.ok(
  origin && expectedSource && output,
  "Usage: node tools/http_check.mjs ORIGIN EXPECTED_SHA OUTPUT_JSON",
);
assert.ok(
  /^http:\/\/127\.0\.0\.1:3276$/.test(origin) ||
    /^https:\/\/phase-traffic-lab(?:-[a-z0-9-]+)?\.vercel\.app$/.test(origin),
  "Origin outside project allowlist",
);
const base = new URL(origin);
const get = async (path) => {
  const r = await fetch(new URL(path, base), {
    signal: AbortSignal.timeout(15000),
    redirect: "error",
  });
  assert.equal(r.status, 200, path);
  return r;
};
const page = await get("/");
assert.match(await page.text(), /Phase/);
const release = await (await get("/release.json")).json();
assert.equal(release.source, expectedSource);
assert.equal(release.dirty, false);
assert.match(release.tree, /^[a-f0-9]{40}$/);
const manifest = JSON.parse(
  readFileSync(
    new URL("../web/public/evidence/artifacts.json", import.meta.url),
    "utf8",
  ),
);
const files = [];
for (const [name, expected] of Object.entries(manifest.files)) {
  const r = await get("/evidence/" + name);
  const bytes = Buffer.from(await r.arrayBuffer());
  assert.equal(
    createHash("sha256").update(bytes).digest("hex"),
    expected,
    name,
  );
  files.push({ name, bytes: bytes.length, sha256: expected });
}
const report = await (await get("/evidence/evaluation.json")).json();
assert.equal(report.runs.length, 300);
assert.ok(
  report.runs.every((r) => r.arrived === r.served + r.dropped + r.remaining),
);
if (base.protocol === "https:") {
  assert.match(
    page.headers.get("content-security-policy") || "",
    /worker-src 'self'/,
  );
  assert.equal(page.headers.get("x-content-type-options"), "nosniff");
}
const receipt = {
  pass: true,
  origin,
  source: release.source,
  tree: release.tree,
  files,
  runs: report.runs.length,
  checkedAt: new Date().toISOString(),
};
mkdirSync(resolve(output, ".."), { recursive: true });
writeFileSync(output, JSON.stringify(receipt, null, 2) + "\n");
console.log(
  JSON.stringify({
    pass: true,
    origin,
    source: release.source,
    files: files.length,
    runs: 300,
  }),
);
