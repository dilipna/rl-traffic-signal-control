# Phase — traffic policy lab

A browser-local, reproducible two-road traffic-control experiment. Compare a frozen tabular Q-policy with a fixed timer and a queue-responsive rule on exactly the same synthetic arrivals. The website runs the actual small simulator in a worker; it is not a prerecorded animation or a cloud model service.

## What changed

The original traffic README was paired with an LLM notebook. Both misplaced notebooks are preserved as inert text in `legacy/`; [provenance](docs/provenance.md) records the source repositories and commits. Only this repository is being redeveloped. No other project or remote repository was renamed.

The rebuilt environment counts overflow instead of silently losing vehicles, constrains switching with minimum/maximum green and all-red clearance, separates training/exploration randomness from arrival tapes, and retains stronger baselines and negative results. It is a synthetic model, not a real-road controller or a SUMO/Gymnasium implementation.

## Run locally

Requirements: Python 3.10+ (standard library only), Node 24 and npm. No model, GPU, credentials, paid services or global Python installs.

```sh
python -m unittest discover -s tests -v
python tools/artifact_manifest.py --check
python tools/verify_evidence.py
cd web
npm ci --no-audit --no-fund
npm test
node ../tools/check_workflow.mjs
npm run build
npm run preview -- --port 3276
```

Visit http://127.0.0.1:3276/. Browser tests are defined for GitHub runners only in this collaboration; no local browser execution or desktop control is used. CI definitions do not establish that CI has run.

## Reproduce training

The protocol was committed as `7bdbc37` before the first training/evaluation run. The frozen public evidence is not overwritten automatically.

```sh
python -m traffic_lab.experiment --output /new/empty/results-directory
```

The directory must not exist. Training uses 450 episodes across balanced, asymmetric and changing-rush scenarios. Arrival seeds 0–449 are disjoint from the 20 evaluation seeds 10000–10019. The primary paired difference is Q minus fixed mean queue, with deterministic 1000-resample bootstrap intervals. All 300 controller/scenario/seed runs are retained. There is one trained policy; no training-seed-variance claim and no hyperparameter tuning on evaluation seeds.

## Results and useful failures

| Scenario          | Fixed mean queue | Queue rule | Q-policy | Q minus fixed |
| ----------------- | ---------------: | ---------: | -------: | ------------: |
| Balanced          |            10.39 |       8.30 |    13.64 |         +3.25 |
| North-south rush  |            38.44 |      11.39 |    11.30 |        -27.14 |
| Changing rush     |            32.97 |      10.04 |    12.23 |        -20.74 |
| Over capacity     |            86.66 |      89.16 |    87.72 |         +1.06 |
| Reduced discharge |            35.97 |      40.25 |    41.16 |         +5.19 |

Lower queue is favorable only alongside throughput and overflow. Full per-seed counts, paired intervals and remaining queues are in [evaluation.json](web/public/evidence/evaluation.json). Queue-responsive control beats the learned policy in several cases; no universal RL superiority is claimed. In overload, mean demand is five vehicles/tick but maximum service is three before clearance loss, so no controller can stabilize demand in this model.

## Product features

- Five demand/service scenarios, shareable 32-bit seed and controller focus.
- Animated schematic with play/pause, reset and keyboard-accessible scrubbing; no automatic playback.
- Three-controller traces, served/overflow/unfinished accounting, and served-wait qualification.
- JSON run receipts and Markdown notes tied to the completed run, with arrival and policy hashes.
- Policy byte-integrity check, failure states, eight-second worker cancellation deadline and explicit retry through a new run.
- Frozen evaluation explorer with confidence intervals and raw protocol/results downloads.
- No account, analytics, upload endpoint, cloud state or paid inference.

## Engineering evidence

Python and browser engines are checked for exact full-trace parity across all five scenarios and three controllers (3600 frames). `tools/verify_evidence.py` independently recomputes all 300 frozen runs. Vehicle conservation and switching constraints are tested. Raw public artifact hashes are separate from Git release identity. The 11 browser cases are not counted as executed until their GitHub run succeeds.

[Architecture and decisions](docs/architecture.md) · [Fifteen-idea decisions](docs/fifteen-ideas.md) · [Reproduction and interview guide](docs/case-study.md)
