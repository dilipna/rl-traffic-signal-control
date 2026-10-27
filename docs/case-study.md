# Case study: stop losing vehicles before claiming better control

## Defect and scope

The original traffic notebook silently truncated queues at 50 per direction. Excess arrivals vanished from the accounting and the only objective was queue length. A full queue receiving more cars could therefore look unchanged while unmet demand increased. The demonstration also used one evaluation arrival seed and a fixed-time opponent. Separately, the traffic and LLM notebook implementations were swapped between repository names. Original sample reductions are not treated as reproduced evidence.

## Decisions

Preserve both notebooks inertly with source revisions. Rebuild a dependency-free CPU simulator, keep the educational two-road scope explicit, add overflow and FIFO waiting accounting, and apply a shared minimum/maximum-green/all-red interlock. Pre-generate arrivals independently of agent exploration. Keep a queue-responsive rule beside fixed timing, rather than presenting the timer as the only alternative.

The protocol/core were committed before the first measured run as 7bdbc37. One 450-episode Q policy was evaluated without retuning on 20 held-out tapes for five scenarios, yielding 300 controller runs. Raw reports and hashes remain downloadable.

## Result

Learned control reduces mean queue relative to fixed timing in asymmetric and changing-rush cases, but loses in balanced flow, overload and reduced discharge. The rule also beats the learned policy in several cases. These negative results remain in the website and report. No physical-road improvement percentage is advertised.

The software result is a more inspectable experiment: 15 exact Python/JavaScript trace comparisons cover 3600 frames, all 300 held-out metrics can be recomputed, and each run checks conservation. The browser does real toy-policy inference with the frozen table and exports trace-linked receipts. Testing this implementation does not validate its real-world traffic assumptions.

## Interview walkthrough

1. Show the mass ledger under overload, not only a favorable queue chart.
2. Explain why five arrivals/tick cannot be stabilized with maximum service three/tick.
3. Compare learned control against the queue rule and acknowledge a loss.
4. Explain common-random-number pairing and why test seeds never enter training.
5. Distinguish served wait from censored residual queues and dropped demand.
6. Explain why a single trained table omits training-seed uncertainty.
7. Recompute the report, inspect one trace and match its browser receipt.

No user adoption, business savings, deployment uptime, SUMO equivalence, agent-system novelty or road-safety certification is claimed. Runtime/UI/browser test counts must be attributed to the final tested release.
