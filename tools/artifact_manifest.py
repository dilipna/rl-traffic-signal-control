"""Hash public evidence bytes; --check never rewrites committed evidence."""
import argparse,hashlib,json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]/"web/public/evidence"

def expected():
    files={name:hashlib.sha256((ROOT/name).read_bytes()).hexdigest() for name in ["policy.json","evaluation.json","protocol.json","training.json","parity.json"]}
    return {"schema":1,"policyFileSha256":files["policy.json"],"files":files,"scope":"Byte identity, not external authenticity or model quality"}

def main():
    parser=argparse.ArgumentParser(description=__doc__);parser.add_argument("--check",action="store_true");args=parser.parse_args()
    result=expected()
    if args.check:
        assert result==json.loads((ROOT/"artifacts.json").read_text()),"Evidence bytes changed"
        print("All five public evidence hashes match")
    else:(ROOT/"artifacts.json").write_text(json.dumps(result,indent=2)+"\n",encoding="utf-8", newline="\n")
if __name__=="__main__":main()
