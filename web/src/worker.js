import { makeTape, rollout } from "./engine.js";
self.onmessage = ({ data }) => {
  try {
    const tape = makeTape(data.scenario, data.seed, 240);
    const results = Object.fromEntries(
      ["fixed", "queue", "q"].map((c) => [c, rollout(tape, c, data.policy)]),
    );
    self.postMessage({ results, tape });
  } catch (error) {
    self.postMessage({ error: error.message });
  }
};
