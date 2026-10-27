import unittest
from traffic_lab.core import Config, Intersection, Random, make_tape, rollout, choose

class SimulatorTests(unittest.TestCase):
    def test_same_seed_same_arrivals(self):
        self.assertEqual(make_tape("tidal",12),make_tape("tidal",12))
        self.assertNotEqual(make_tape("tidal",12),make_tape("tidal",13))
    def test_rng_does_not_depend_on_actions(self):
        tape=make_tape("balanced",12)
        for controller in ("fixed","queue","q"):
            frames=rollout(tape,controller)["frames"]
            self.assertEqual([f["arrivals"] for f in frames],[e[:2] for e in tape])
    def test_conservation_and_capacity(self):
        env=Intersection()
        for i in range(200):
            env.step(i%2,[8,8,3])
            self.assertEqual(env.arrived,env.served+env.dropped+sum(map(len,env.queues)))
            self.assertTrue(all(len(q)<=50 for q in env.queues))
        self.assertGreater(env.dropped,0)
    def test_minimum_green_then_clearance(self):
        env=Intersection()
        for _ in range(5):self.assertFalse(env.step(1,[1,1,3])["switched"])
        f=env.step(1,[1,1,3]);self.assertTrue(f["switched"]);self.assertTrue(f["allRed"]);self.assertEqual(f["served"],0)
        self.assertTrue(env.step(1,[0,0,3])["allRed"])
        self.assertFalse(env.step(1,[0,0,3])["allRed"])
    def test_maximum_green_override(self):
        env=Intersection()
        for _ in range(20):self.assertFalse(env.step(0,[0,0,3])["switched"])
        self.assertTrue(env.step(0,[0,0,3])["switched"])
    def test_wait_and_mass_for_known_case(self):
        env=Intersection();env.step(0,[0,1,0]);env.step(0,[0,0,0]);m=env.metrics()
        self.assertIsNone(m["meanServedWait"]);self.assertEqual(m["meanRemainingWait"],2)
    def test_reject_bad_config(self):
        for config in [dict(capacity=0),dict(minimum_green=8,maximum_green=3),dict(clearance_ticks=0),dict(capacity=True)]:
            with self.subTest(config=config),self.assertRaises(ValueError):Config(**config)
    def test_bad_inputs(self):
        for action in (-1,2,True,"1"):
            with self.subTest(action=action),self.assertRaises(ValueError):Intersection().step(action,[1,1,3])
        for event in ([1,1],[-1,1,3],[31,1,3],[True,1,3]):
            with self.subTest(event=event),self.assertRaises(ValueError):Intersection().step(0,event)
    def test_bad_scenario_seed_and_horizon(self):
        for args in [("unknown",1,240),("balanced",-1,240),("balanced",1,1201)]:
            with self.subTest(args=args),self.assertRaises(ValueError):make_tape(*args)
    def test_empty_traffic(self):
        for controller in ("fixed","queue","q"):
            m=rollout([[0,0,3]]*100,controller)["metrics"];self.assertEqual(m["meanQueue"],0);self.assertEqual(m["dropped"],0)
    def test_incident_is_explicit(self):
        tape=make_tape("incident",1)
        self.assertEqual(sum(e[2]==1 for e in tape),80)
    def test_unknown_controller(self):
        with self.assertRaises(ValueError):choose(Intersection(),"unknown")
    def test_zero_seed_is_reproducible(self):
        self.assertEqual(Random(0).uniform(),Random(0).uniform())

if __name__ == "__main__":unittest.main()
