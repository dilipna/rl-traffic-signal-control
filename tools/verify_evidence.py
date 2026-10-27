"""Recompute all frozen metrics from the frozen policy; no training or tuning."""
import json,sys
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from traffic_lab.experiment import evaluate,canonical
import hashlib
root=Path(__file__).resolve().parents[1]
evidence=root/"web/public/evidence"
protocol=json.loads((root/"protocol.json").read_text())
assert protocol==json.loads((evidence/"protocol.json").read_text())
assert set(protocol["evaluation_tape_seeds"]).isdisjoint(range(protocol["episodes"]))
policy=json.loads((evidence/"policy.json").read_text())
report=json.loads((evidence/"evaluation.json").read_text())
assert evaluate(policy,protocol)==report,"Recomputed evaluation differs"
for run in report["runs"]:
    assert run["arrived"]==run["served"]+run["dropped"]+run["remaining"]
print("All 300 frozen runs independently recomputed; conservation and split checks passed")
