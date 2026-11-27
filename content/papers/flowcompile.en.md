---
title: FlowCompile
date: 2026-11-26
type: paper
publish: true
description: "FlowCompile profiles individual steps to choose models, reasoning budgets, and execution paths for an LLM workflow."
---
## Bibliographic Information

- title: FlowCompile: An Optimizing Compiler for Structured LLM Workflows
- authors: Junyan Li, Zhang-Wei Hong, Maohao Shen, Yang Zhang, Chuang Gan
- institution: UMass Amherst, MIT-IBM Watson AI Lab, MIT
- venue / publisher: arXiv
- publication year: 2026
- link / code & data:
  - paper: https://arxiv.org/abs/2605.13647
  - code: https://github.com/UMass-Embodied-AGI/FlowCompile

---

## TL;DR

- FlowCompile optimizes workflows that make multiple LLM calls. Which model and reasoning budget should each node get? Which branches should run?
- It profiles every setting for each node ahead of time. For an LLM judge node, for example, that tells you how much each model would cost.
- Combine those profiles to compile several promising configurations and estimate how each will perform. Then pick one that fits the deployment. For an easy problem, you can go with a leaner workflow that runs fast on a smaller budget.

---

## Summary

### Method

- Workflow optimization is a combinatorial problem. Even a few more nodes and edges can make the search space balloon. Five nodes in a row with just 20 settings each already give you 3.2 million combinations.
- FlowCompile profiles each node's settings separately. In that example, there are only 100 node settings to profile, 20 for each of the five nodes.
- For each setting, measure its runtime and success rate. *(Author's note. You could think of these more broadly as cost and performance.)*
- Use those measurements to estimate how long each workflow configuration will take and how often it will succeed. The calculations look roughly like this.

| Graph structure | Estimated success rate | Estimated average latency |
| --- | ---: | ---: |
| Run A, then B. Both must succeed. | $p_Ap_B$ | $t_A+t_B$ |
| Run both A and B. Either can succeed. | $1-(1-p_A)(1-p_B)$ | $t_A+t_B$ |
| Run B as a fallback if A fails. | $p_A+(1-p_A)p_B$ | $t_A+(1-p_A)t_B$ |

- With estimates for success rate and latency in hand, pick the configuration that suits your deployment.

### Experiments & Results

- FlowCompile's estimates of runtime and success rate tracked the measured results well.
- The authors applied FlowCompile to an existing MATH-500 workflow, then tested one of the configurations that prioritized accuracy. It cut latency while keeping accuracy close to the original workflow's.

---

## Reflections

- This seems worth trying at deployment time, once you're done optimizing the harness!

---

## Takeaways

- None

---

## Next reading

- None

---

#AI #LLM #agent #optimization #machine_learning_system
