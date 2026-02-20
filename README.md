<img width="903" height="889" alt="image" src="https://github.com/user-attachments/assets/f3e13df8-64c3-407e-b4bb-c34196314cc5" />

# DilipGPT TrafficRL

Reinforcement Learning-based Traffic Signal Control system using Q-Learning.

This project demonstrates how an RL agent can learn to dynamically control traffic lights at an intersection to reduce congestion compared to a fixed-time baseline controller.

---

## 🚀 Live Demo

Interactive UI allows:

- Adjusting traffic arrival rates
- Training the RL agent
- Comparing against baseline strategy
- Viewing training reward curve
- Observing congestion reduction metrics

---

## 🧠 Problem Statement

Traditional traffic signals operate on fixed-time schedules, which do not adapt to real-time traffic fluctuations.

This project formulates traffic signal control as a Reinforcement Learning problem where the agent learns to:

- Minimize total queue length
- Adapt signal switching decisions dynamically
- Optimize traffic flow over time

---

## 🏗️ Environment Design

### State Representation

State consists of:
- Discretized NS queue length
- Discretized EW queue length
- Current signal phase

Total state space: 5 × 5 × 2

---

### Actions

- 0 → Keep current signal phase
- 1 → Switch signal phase

---

### Reward Function

Reward = − (Total Queue Length)

The agent learns to minimize congestion by maximizing cumulative reward.

---

## 🧮 Algorithm Used

Q-Learning (Tabular)

Update rule:

Q(s,a) ← Q(s,a) + α [ r + γ max_a' Q(s',a') − Q(s,a) ]

Where:
- α = learning rate
- γ = discount factor

---

## 📊 Performance Evaluation

Baseline Controller:
- Fixed-time switching policy

RL Controller:
- Learned switching strategy

Example result:

Baseline avg queue: 73.76  
RL avg queue: 48.69  

The RL policy significantly reduces congestion compared to baseline.

---

## 📈 Visualization

- Training reward per episode
- Before vs After congestion comparison

---

## 🛠️ Tech Stack

- Python
- NumPy
- Q-Learning
- Flask (Web UI)
- Matplotlib (Training visualization)
- Cloudflare Tunnel (Temporary public deployment)

---

## 🎯 Key Learning Outcomes

- Designing custom RL environments
- Reward engineering
- State discretization
- Baseline benchmarking
- Policy evaluation
- ML system deployment with UI

---

## 🔮 Future Improvements

- Deep Q-Network (DQN)
- Continuous state representation
- Multi-intersection coordination
- Traffic animation visualization
- Real-time streaming simulation

---

## 👨‍💻 Author

Dilip  
Computer Science student specializing in Artificial Intelligence and Reinforcement Learning.
