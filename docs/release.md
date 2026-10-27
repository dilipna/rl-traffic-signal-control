# Release gates

Source branch: improve/reproducible-traffic-lab. Base: 166f88fcfcd01d729cdb5f2cba69e64e6d85c24c. Protocol/core frozen before training: 7bdbc37.

The public source, PR, Actions and hosting are not authorized by a generic local-development request under this collaboration's earlier explicit-release rule. Prepare a clean exact candidate, recoverable Git bundle/source ZIP and local evidence first, then request publication/CI plus gated free website release with corrections confined to that release. No main merge or other project changes.

1. Local Python/Node tests, all 300 report recomputations, artifact hashes, workflow allowlist checks, dependency audit and clean production build.
2. Publish approved branch/open PR; pass both exact-source CI jobs and all 11 real browser cases. Download evidence and inspect desktop/mobile screenshots. Correct confined issues and rerun affected/full gates without weakening checks.
3. Only after approval and CI success, create the separate free Hobby project asmq333/phase-traffic-lab (no such existing project was found in the authenticated scope). No paid services, model calls, backend host, schedule or unrelated setting changes. Keep source disconnected from auto-production unless separately authorized.
4. Stage the static build without assigning the production domain. Verify release.json, all five public evidence file hashes, headers and full staged browser suite. The existing browser workflow allows only this project's deployment URLs. Add the exact `Staging origin: https://phase-traffic-lab-<id>-asmq333.vercel.app` line to the PR and trigger verify-staging.
5. Promote only after actual staged checks and screenshot review. Set exact `Production origin: https://phase-traffic-lab.vercel.app` (or Vercel-assigned project alias matching allowlist) in PR, verify its authoritative project/deployment mapping and identity, then trigger verify-production and wait for success. Do not claim completion before the public check passes.
6. Save final report, source/recovery bundle, CI/HTTP/browser receipts, deployment/alias IDs and checksums outside the repository so recording completion does not invalidate the tested source SHA.

Browser execution is GitHub-only. No owner desktop/browser access. The first deployment has no prior production to roll back to: keep the new site unpromoted if staging fails; do not overwrite another site to manufacture a rollback. After a successful first deployment, retain it as the next release's rollback reference.

If using Vercel Build Output API for static artifacts, retain web/vercel.json header behavior in .vercel/output/config.json, copy only the verified dist assets, target the same newly approved project and verify source/evidence identity on the hosted URL. No hosting authentication or team policy changes to bypass preview protection.

Public evidence is UTF-8/LF at generation and checkout. Hashes are raw-byte hashes, not normalized approximations. Compare source.zip entries to the manifest before release; Windows working-tree checks alone are insufficient.
