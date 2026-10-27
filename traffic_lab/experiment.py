"""One frozen training run, paired held-out evaluation, explicit negative outcomes."""
import argparse
import hashlib
import json
from pathlib import Path
from .core import Random, SCENARIOS, Intersection, choose, make_tape, rollout

ROOT = Path(__file__).resolve().parents[1]

def canonical(value):
    return json.dumps(value, sort_keys=True, separators=(",", ":"), allow_nan=False).encode()

def train(protocol):
    q, curve = {}, []
    rng = Random(protocol["exploration_seed"])
    episodes = protocol["episodes"]
    for ep in range(episodes):
        scenario = protocol["training_scenarios"][ep % len(protocol["training_scenarios"]) ]
        tape = make_tape(scenario, ep, protocol["horizon"])
        env, total = Intersection(), 0
        epsilon = protocol["epsilon_end"] + (protocol["epsilon_start"] - protocol["epsilon_end"])*(1-ep/max(1,episodes-1))
        for i, event in enumerate(tape):
            state = env.state()
            values = q.setdefault(state, [0.0, 0.0])
            action = int(rng.uniform() >= .5) if rng.uniform() < epsilon else int(values[1] > values[0])
            frame = env.step(action, event)
            reward = frame["reward"]
            following = q.setdefault(env.state(), [0.0, 0.0])
            target = reward + (protocol["gamma"] * max(following) if i+1 < len(tape) else 0)
            values[action] += protocol["alpha"]*(target-values[action])
            total += reward
        curve.append({"episode":ep, "scenario":scenario, "reward":total})
    return q, curve

def mean(values):
    return sum(values)/len(values)

def interval(values, seed=942):
    rng=Random(seed)
    means=sorted(mean([values[min(len(values)-1,int(rng.uniform()*len(values)))] for _ in values]) for _ in range(1000))
    return [means[24],means[974]]

def evaluate(policy, protocol):
    rows=[]
    for scenario in protocol["evaluation_scenarios"]:
        for seed in protocol["evaluation_tape_seeds"]:
            tape=make_tape(scenario,seed,protocol["horizon"])
            for controller in protocol["controllers"]:
                m=rollout(tape,controller,policy,False)["metrics"]
                rows.append({"scenario":scenario,"seed":seed,"controller":controller,"tapeSha256":hashlib.sha256(canonical(tape)).hexdigest(),**m})
    summary=[]
    for scenario in protocol["evaluation_scenarios"]:
        group=[r for r in rows if r["scenario"]==scenario]
        controllers={}
        for c in protocol["controllers"]:
            points=[r for r in group if r["controller"]==c]
            controllers[c]={k:mean([r[k] for r in points]) for k in ["meanQueue","dropped","served","remaining","switches"]}
        paired=[]
        for seed in protocol["evaluation_tape_seeds"]:
            points={r["controller"]:r for r in group if r["seed"]==seed}
            paired.append(points["q"]["meanQueue"]-points["fixed"]["meanQueue"])
        ci=interval(paired)
        summary.append({"scenario":scenario,"name":SCENARIOS[scenario]["name"],"distributionShift":SCENARIOS[scenario]["shift"],
                        "controllers":controllers,"qMinusFixedMeanQueue":mean(paired),"paired95Interval":ci,
                        "conclusion":"Q lower queue in this sample" if ci[1]<0 else "Fixed lower queue in this sample" if ci[0]>0 else "Inconclusive queue difference"})
    return {"schema":1,"protocolSha256":hashlib.sha256(canonical(protocol)).hexdigest(),
            "policySha256":hashlib.sha256(canonical(policy)).hexdigest(),"runs":rows,"summary":summary,
            "limits":protocol["limits"],"units":"synthetic ticks and vehicles; not seconds or real-road performance"}

def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output",type=Path,required=True)
    args=parser.parse_args()
    if args.output.exists():
        raise FileExistsError("Use a new directory to preserve frozen results")
    protocol=json.loads((ROOT/"protocol.json").read_text())
    assert set(protocol["evaluation_tape_seeds"]).isdisjoint(range(protocol["episodes"]))
    policy,curve=train(protocol)
    report=evaluate(policy,protocol)
    args.output.mkdir(parents=True)
    for name,value in [("policy",policy),("training",curve),("evaluation",report),("protocol",protocol)]:
        (args.output/(name+".json")).write_text(json.dumps(value,indent=2,allow_nan=False)+"\n",encoding="utf-8", newline="\n")
    parity=[]
    for scenario in protocol["evaluation_scenarios"]:
        for c in protocol["controllers"]:
            tape=make_tape(scenario,123,240)
            parity.append({"scenario":scenario,"seed":123,"controller":c,**rollout(tape,c,policy)})
    (args.output/"parity.json").write_text(json.dumps(parity,separators=(",", ":"))+"\n",encoding="utf-8", newline="\n")
    print("Policy states:",len(policy),"| evaluation runs:",len(report["runs"]))
    for row in report["summary"]:
        print(row["name"],"Q-fixed mean queue",round(row["qMinusFixedMeanQueue"],2),row["conclusion"])

if __name__=="__main__":main()
