# Applicability of the user's fifteen engineering ideas

This project gains from reproducible control/evaluation, not from turning every subsystem into an LLM agent. No referenced agent framework is imported and no full implementation of the fifteen agent projects is claimed.

| Idea                                    | Decision for Phase                                                                                                                                                    |
| --------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1 Dynamic Context Assembler             | Not applicable: no prompts, tokens, tool schemas or retrieved context.                                                                                                |
| 2 Durable State Machine Workflow        | Defer a durable service; run receipts and deterministic replay are useful but are not Temporal/checkpointed business workflows.                                       |
| 3 Raw MCP Server & Client               | Defer: no agent/tool consumer requires a protocol server.                                                                                                             |
| 4 System-One Triage Router              | Not applicable: no model/provider traffic to route.                                                                                                                   |
| 5 Self-Correcting Agentic RAG           | Not applicable: queue control is not a retrieval question-answering task.                                                                                             |
| 6 Three-Tier Memory Engine              | Not applicable: reproducible state and frozen policy replace conversational memory.                                                                                   |
| 7 Trajectory CI Gate                    | Adapt the testing principle: full action/state trace parity, conservation and clearance invariants. This is simulator trajectory verification, not agent DAG grading. |
| 8 Inter-Agent Sanitization Proxy        | Not applicable: no inter-agent messages. Input allowlists, static CSP and worker boundaries address this app's actual surface.                                        |
| 9 Real-Time Voice Interruption Loop     | Not applicable.                                                                                                                                                       |
| 10 DPO Feedback Flywheel                | Not applicable: tabular Q-learning is not preference fine-tuning; no automatic feedback retraining or nightly jobs.                                                   |
| 11 Cost Kill-Switch & Degradation Chain | Adapt bounded execution and cancellation; there are no paid calls or multi-model degradation tiers.                                                                   |
| 12 Shadow Routing Comparator            | Adapt paired offline replay on identical arrival tapes. This is not live traffic mirroring or model-provider shadow routing.                                          |
| 13 Computer-Use Fallback Agent          | Not applicable; owner's desktop/browser control remains prohibited. Remote browser QA is testing, not an app feature.                                                 |
| 14 PII Unmasking Proxy                  | No personal inputs or remote model transmission, so no token vault/unmasking proxy is warranted.                                                                      |
| 15 Public Architecture Teardown         | Prepare a case study, diagram, frozen protocol, negative outcomes and reproduction guide. Publication awaits exact-release approval.                                  |
