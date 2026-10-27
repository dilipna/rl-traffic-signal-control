import unittest
from traffic_lab.experiment import train,evaluate,interval
from traffic_lab.core import make_tape,rollout

class ExperimentTests(unittest.TestCase):
    def protocol(self):
        return dict(exploration_seed=9182,episodes=3,training_scenarios=["balanced"],horizon=12,epsilon_start=1,epsilon_end=.05,alpha=.12,gamma=.95,evaluation_scenarios=["balanced"],evaluation_tape_seeds=[10000,10001],controllers=["fixed","queue","q"],limits=["test fixture, not model evidence"])
    def test_reproducible_training(self):
        p=self.protocol();self.assertEqual(train(p),train(p))
    def test_report_keeps_baselines_and_matching_tapes(self):
        p=self.protocol();q,_=train(p);report=evaluate(q,p)
        self.assertEqual(len(report["runs"]),6)
        for seed in p["evaluation_tape_seeds"]:
            self.assertEqual(len({r["tapeSha256"] for r in report["runs"] if r["seed"]==seed}),1)
        self.assertEqual(set(report["summary"][0]["controllers"]),{"q","fixed","queue"})
    def test_evaluation_does_not_train_policy(self):
        q,_=train(self.protocol());before=str(q);evaluate(q,self.protocol());self.assertEqual(before,str(q))
    def test_zero_difference_interval(self):
        self.assertEqual(interval([0,0,0]),[0,0])

if __name__=="__main__":unittest.main()
