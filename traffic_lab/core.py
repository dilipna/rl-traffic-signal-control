"""All units are synthetic ticks/vehicles. Not a real-road controller."""
from collections import deque
from dataclasses import dataclass
import math

SCENARIOS = {
    "balanced": {"name": "Balanced flow", "rates": [0.9, 0.9], "shift": False},
    "north-rush": {"name": "North-south rush", "rates": [1.8, 0.3], "shift": False},
    "tidal": {"name": "Changing rush", "rates": [1.7, 0.3], "shift": False},
    "saturated": {"name": "Over capacity", "rates": [2.5, 2.5], "shift": True},
    "incident": {"name": "Reduced discharge", "rates": [0.9, 0.9], "shift": True},
}

class Random:
    def __init__(self, seed):
        if type(seed) is not int or not 0 <= seed <= 0xffffffff:
            raise ValueError("Seed must be a 32-bit unsigned integer")
        self.state = seed or 0x9e3779b9

    def uniform(self):
        x = self.state
        x ^= (x << 13) & 0xffffffff
        x ^= x >> 17
        x ^= (x << 5) & 0xffffffff
        self.state = x & 0xffffffff
        return self.state / 4294967296

    def poisson(self, rate):
        if not math.isfinite(rate) or not 0 <= rate <= 4:
            raise ValueError("Rate must be between zero and four")
        threshold, product, count = math.exp(-rate), 1.0, 0
        while True:
            count += 1
            product *= self.uniform()
            if product <= threshold:
                return count - 1

def make_tape(scenario, seed, horizon=240):
    if scenario not in SCENARIOS or type(horizon) is not int or not 1 <= horizon <= 1200:
        raise ValueError("Unknown scenario or invalid horizon")
    rng, tape = Random(seed), []
    for tick in range(horizon):
        rates = SCENARIOS[scenario]["rates"]
        if scenario == "tidal" and tick >= horizon // 2:
            rates = rates[::-1]
        service = 1 if scenario == "incident" and horizon // 3 <= tick < 2*horizon // 3 else 3
        tape.append([rng.poisson(rates[0]), rng.poisson(rates[1]), service])
    return tape

@dataclass(frozen=True)
class Config:
    capacity: int = 50
    minimum_green: int = 5
    maximum_green: int = 20
    clearance_ticks: int = 2

    def __post_init__(self):
        values = (self.capacity, self.minimum_green, self.maximum_green, self.clearance_ticks)
        if any(type(x) is not int for x in values) or not (1 <= self.capacity <= 100 and 1 <= self.minimum_green <= self.maximum_green <= 60 and 1 <= self.clearance_ticks <= 10):
            raise ValueError("Invalid simulator configuration")

class Intersection:
    def __init__(self, config=None):
        self.config = config or Config()
        self.queues = [deque(), deque()]
        self.phase = self.age = self.clearance = self.tick = 0
        self.arrived = self.served = self.dropped = self.switches = self.area = 0
        self.max_queue = [0, 0]
        self.waits = []

    def state(self):
        def bin_queue(n):
            return sum(n > edge for edge in [2, 6, 12, 20])
        return ":".join(map(str, [bin_queue(len(q)) for q in self.queues] + [self.phase, self.age, self.clearance]))

    def step(self, action, event):
        if type(action) is not int or action not in (0, 1):
            raise ValueError("Action must be 0 (hold) or 1 (request switch)")
        if not isinstance(event, (list, tuple)) or len(event) != 3 or any(type(n) is not int or not 0 <= n <= 30 for n in event):
            raise ValueError("Expected bounded integer arrival/service event")
        cfg = self.config
        state_before = self.state()
        reason = "clearance" if self.clearance else "minimum-green" if action == 1 and self.age < cfg.minimum_green else "hold"
        switched = False
        if self.clearance == 0 and self.age >= cfg.minimum_green and (action == 1 or self.age >= cfg.maximum_green):
            reason = "maximum-green" if self.age >= cfg.maximum_green else "controller-request"
            self.phase = 1 - self.phase
            self.age = 0
            self.clearance = cfg.clearance_ticks
            self.switches += 1
            switched = True
        dropped_now = 0
        for direction, arrivals in enumerate(event[:2]):
            self.arrived += arrivals
            accepted = min(arrivals, cfg.capacity - len(self.queues[direction]))
            self.queues[direction].extend([self.tick] * accepted)
            dropped_now += arrivals - accepted
        self.dropped += dropped_now
        all_red = self.clearance > 0
        served_now = 0
        if all_red:
            self.clearance -= 1
        else:
            queue = self.queues[self.phase]
            for _ in range(min(event[2], len(queue))):
                self.waits.append(self.tick - queue.popleft())
                self.served += 1
                served_now += 1
            self.age += 1
        lengths = [len(q) for q in self.queues]
        self.area += sum(lengths)
        self.max_queue = [max(old, current) for old, current in zip(self.max_queue, lengths)]
        reward = -sum(lengths) - 30 * dropped_now - 2 * int(switched)
        frame = {"tick": self.tick, "stateBefore": state_before, "requestedAction": action, "decisionReason": reason, "queues": lengths, "phase": self.phase, "allRed": all_red,
                 "greenAge": self.age, "clearanceRemaining": self.clearance, "switched": switched,
                 "arrivals": list(event[:2]), "service": event[2], "served": served_now,
                 "dropped": dropped_now, "reward": reward}
        self.tick += 1
        assert self.arrived == self.served + self.dropped + sum(lengths)
        return frame

    def metrics(self):
        waits = sorted(self.waits)
        remaining = [self.tick - started for queue in self.queues for started in queue]
        return {"ticks": self.tick, "arrived": self.arrived, "served": self.served, "dropped": self.dropped,
                "remaining": sum(map(len,self.queues)), "meanQueue": self.area / max(1,self.tick),
                "maxQueue": max(self.max_queue), "switches": self.switches,
                "meanServedWait": sum(waits)/len(waits) if waits else None,
                "p95ServedWait": waits[max(0,math.ceil(.95*len(waits))-1)] if waits else None,
                "meanRemainingWait": sum(remaining)/len(remaining) if remaining else None}

def choose(env, controller, policy=None):
    if controller == "fixed":
        return int(env.age >= 10)
    if controller == "queue":
        return int(len(env.queues[1-env.phase]) > len(env.queues[env.phase]) + 2)
    if controller == "q":
        values = (policy or {}).get(env.state(), [0, 0])
        return int(values[1] > values[0])
    raise ValueError("Unknown controller")

def rollout(tape, controller, policy=None, trace=True):
    env, frames = Intersection(), []
    for event in tape:
        frame = env.step(choose(env, controller, policy), event)
        if trace:
            frames.append(frame)
    return {"metrics": env.metrics(), "frames": frames}
