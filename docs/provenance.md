# Source reconciliation

The repository rl-traffic-signal-control at 166f88fcfcd01d729cdb5f2cba69e64e6d85c24c contained an LLM answer/critique/rewrite notebook (dilipRL.py), despite a traffic-control README. It is preserved verbatim in legacy/llm-notebook.py.txt, not executed or downloaded as a model.

The traffic notebook was located in the same owner's self-improving-llm-engine repository at 7219df0a1554a77096a5f8343e70363785fe444b, path dilipgpt.py (Git blob 91d089637598428f9283dee88b068df78d3e4314). A text snapshot is preserved in legacy/traffic-notebook.py.txt; checkout/text encoding can differ from Git blob bytes. The source repository is not edited or renamed by this redevelopment.

The rebuilt simulator is a new explicit implementation of the two-road concept, not a copy of notebook execution or a benchmark reproduction. Both old notebooks remain inert text; their shell commands, automatic model downloads, background Flask server and public tunnel are never executed. Original example congestion values are unverified and not reused as new measurements.

Research context: Farama's seeding guidance https://gymnasium.farama.org/api/env/ and PressLight https://faculty.ist.psu.edu/jessieli/Publications/2019-KDD-presslight.pdf informed evaluation questions. This simulator does not implement Gymnasium, SUMO or PressLight. Its queue-responsive baseline compares two incoming queues with a two-vehicle hysteresis; it is not a full network max-pressure controller and has no network-stability claim.
