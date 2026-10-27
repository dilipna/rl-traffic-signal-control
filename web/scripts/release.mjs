import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";
const git = (...args) =>
  execFileSync("git", args, { encoding: "utf8", cwd: ".." }).trim();
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
