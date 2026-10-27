import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
const git = (...args) =>
  execFileSync("git", args, { encoding: "utf8", cwd: ".." }).trim();
const evidence = JSON.parse(
  readFileSync("public/evidence/artifacts.json", "utf8"),
);
for (const [name, expected] of Object.entries(evidence.files)) {
  const actual = createHash("sha256")
    .update(readFileSync("public/evidence/" + name))
    .digest("hex");
  if (actual !== expected) throw Error("Evidence checksum mismatch: " + name);
}
const source = git("rev-parse", "HEAD"),
  tree = git("rev-parse", "HEAD^{tree}"),
  dirty = !!git("status", "--porcelain");
if (process.env.CI && dirty)
  throw Error("Hosted/CI builds require clean committed source");
writeFileSync(
  "public/release.json",
  JSON.stringify(
    {
      schema: 1,
      source,
      tree,
      dirty,
      scope: "Git source identity; public evidence hashes separately checked",
    },
    null,
    2,
  ) + "\n",
);
