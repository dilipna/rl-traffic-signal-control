export const SCENARIOS = {
  balanced: { name: "Balanced flow", rates: [0.9, 0.9] },
  "north-rush": { name: "North-south rush", rates: [1.8, 0.3] },
  tidal: { name: "Changing rush", rates: [1.7, 0.3] },
  saturated: { name: "Over capacity", rates: [2.5, 2.5] },
  incident: { name: "Reduced discharge", rates: [0.9, 0.9] },
};
export class Random {
  constructor(seed) {
    if (!Number.isInteger(seed) || seed < 0 || seed > 4294967295)
      throw Error("Seed must be a 32-bit unsigned integer");
    this.state = seed || 0x9e3779b9;
  }
  uniform() {
    let x = this.state;
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    this.state = x >>> 0;
    return this.state / 4294967296;
  }
  poisson(rate) {
    if (!Number.isFinite(rate) || rate < 0 || rate > 4)
      throw Error("Invalid rate");
    const threshold = Math.exp(-rate);
    let product = 1,
      count = 0;
    do {
      count++;
      product *= this.uniform();
    } while (product > threshold);
    return count - 1;
  }
}
export function makeTape(scenario, seed, horizon = 240) {
  if (
    !Object.hasOwn(SCENARIOS, scenario) ||
    !Number.isInteger(horizon) ||
    horizon < 1 ||
    horizon > 1200
  )
    throw Error("Invalid scenario or horizon");
  const rng = new Random(seed),
    tape = [];
  for (let t = 0; t < horizon; t++) {
    let rates = SCENARIOS[scenario].rates;
    if (scenario === "tidal" && t >= Math.floor(horizon / 2))
      rates = [...rates].reverse();
    const service =
      scenario === "incident" &&
      Math.floor(horizon / 3) <= t &&
      t < Math.floor((2 * horizon) / 3)
        ? 1
        : 3;
    tape.push([rng.poisson(rates[0]), rng.poisson(rates[1]), service]);
  }
  return tape;
}
export class Intersection {
  constructor() {
    this.queues = [[], []];
    this.phase = 0;
    this.age = 0;
    this.clearance = 0;
    this.tick = 0;
    this.arrived = 0;
    this.served = 0;
    this.dropped = 0;
    this.switches = 0;
    this.area = 0;
    this.maxQueue = [0, 0];
    this.waits = [];
  }
  state() {
    const bin = (n) => [2, 6, 12, 20].filter((e) => n > e).length;
    return [
      ...this.queues.map((q) => bin(q.length)),
      this.phase,
      this.age,
      this.clearance,
    ].join(":");
  }
  step(action, event) {
    if (
      !Number.isInteger(action) ||
      ![0, 1].includes(action) ||
      !Array.isArray(event) ||
      event.length !== 3 ||
      event.some((x) => !Number.isInteger(x) || x < 0 || x > 30)
    )
      throw Error("Invalid step input");
    const stateBefore = this.state();
    let reason = this.clearance
      ? "clearance"
      : action === 1 && this.age < 5
        ? "minimum-green"
        : "hold";
    let switched = false;
    if (
      this.clearance === 0 &&
      this.age >= 5 &&
      (action === 1 || this.age >= 20)
    ) {
      reason = this.age >= 20 ? "maximum-green" : "controller-request";
      this.phase = 1 - this.phase;
      this.age = 0;
      this.clearance = 2;
      this.switches++;
      switched = true;
    }
    let dropped = 0;
    for (let i = 0; i < 2; i++) {
      this.arrived += event[i];
      const n = Math.min(event[i], 50 - this.queues[i].length);
      for (let j = 0; j < n; j++) this.queues[i].push(this.tick);
      dropped += event[i] - n;
    }
    this.dropped += dropped;
    const allRed = this.clearance > 0;
    let served = 0;
    if (allRed) this.clearance--;
    else {
      const q = this.queues[this.phase];
      const n = Math.min(event[2], q.length);
      for (let j = 0; j < n; j++) {
        this.waits.push(this.tick - q.shift());
        this.served++;
        served++;
      }
      this.age++;
    }
    const queues = this.queues.map((q) => q.length);
    this.area += queues[0] + queues[1];
    this.maxQueue = this.maxQueue.map((n, i) => Math.max(n, queues[i]));
    const frame = {
      tick: this.tick,
      stateBefore,
      requestedAction: action,
      decisionReason: reason,
      queues,
      phase: this.phase,
      allRed,
      greenAge: this.age,
      clearanceRemaining: this.clearance,
      switched,
      arrivals: event.slice(0, 2),
      service: event[2],
      served,
      dropped,
      reward: -queues[0] - queues[1] - 30 * dropped - 2 * Number(switched),
    };
    this.tick++;
    if (this.arrived !== this.served + this.dropped + queues[0] + queues[1])
      throw Error("Conservation violation");
    return frame;
  }
  metrics() {
    const waits = [...this.waits].sort((a, b) => a - b),
      remaining = this.queues.flat().map((t) => this.tick - t);
    return {
      ticks: this.tick,
      arrived: this.arrived,
      served: this.served,
      dropped: this.dropped,
      remaining: this.queues[0].length + this.queues[1].length,
      meanQueue: this.area / Math.max(1, this.tick),
      maxQueue: Math.max(...this.maxQueue),
      switches: this.switches,
      meanServedWait: waits.length
        ? waits.reduce((a, b) => a + b, 0) / waits.length
        : null,
      p95ServedWait: waits.length
        ? waits[Math.max(0, Math.ceil(0.95 * waits.length) - 1)]
        : null,
      meanRemainingWait: remaining.length
        ? remaining.reduce((a, b) => a + b, 0) / remaining.length
        : null,
    };
  }
}
export function choose(env, controller, policy = {}) {
  if (controller === "fixed") return Number(env.age >= 10);
  if (controller === "queue")
    return Number(
      env.queues[1 - env.phase].length > env.queues[env.phase].length + 2,
    );
  if (controller === "q") {
    const v = policy[env.state()] || [0, 0];
    return Number(v[1] > v[0]);
  }
  throw Error("Invalid controller");
}
export function rollout(tape, controller, policy = {}) {
  const env = new Intersection(),
    frames = [];
  for (const e of tape)
    frames.push(env.step(choose(env, controller, policy), e));
  return { metrics: env.metrics(), frames };
}
