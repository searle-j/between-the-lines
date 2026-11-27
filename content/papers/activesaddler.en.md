---
title: ActiveSaddler
date: 2026-11-26
type: paper
publish: true
description: "ActiveSaddler groups tasks by how they failed and picks the next training tasks as the harness changes."
---
## Bibliographic Information

- title: ActiveSaddler: Automated Curriculum Learning for Agent Harness Optimization
- authors: Sungho Park, Wonjoong Kim, Jue Zhang, Wook-Shin Han, Pengfei Gao, Chanyoung Park, Yongqiang Yao, Rao Fu, Elsie Nallipogu, Qingwei Lin, Victor Rühle
- institution: POSTECH, KAIST, Microsoft
- venue / publisher: arXiv
- publication year: 2026
- link / code & data:
  - paper: https://arxiv.org/abs/2610.00906
  - website and code: https://aka.ms/ActiveSaddler-website

---

## TL;DR

- ActiveSaddler recasts harness optimization as curriculum learning. *(Author's note. Curriculum learning is about organizing the order of training tasks. A common approach is to start with easy tasks and work up to harder ones. Think of a robot arm learning to move objects with increasingly complex shapes.)*
- Each round, an agent decides whether to revisit an old failure or tackle new tasks that might reveal new ones.
- It reached higher validation scores with fewer runs than a fixed random task order.

---

## Summary

### Motivation

- When we want a harness that works across a range of tasks, we often split them into batches and ask an agent to improve the harness one batch at a time.
- Is a random task order the best we can do? Could a curriculum give us a better sequence?
- The authors propose ActiveSaddler, a method for choosing smartly which problems to feed the agent that improves the harness.

### Method

- The loop keeps a list of failure patterns and the tasks linked to each one, such as `"Date handling error": ["Task 5", "Task 13"]`.
  1. **Decide what to work on next.** The agent looks at the full history and decides whether to try new tasks to uncover failures or go back and fix a known pattern.
  2. **Explore new tasks.** Pick up to three tasks the harness hasn't tried yet.
  3. **Revisit a known failure.** An LLM reads the recent runs and patch history and scores each pattern from 0 to 1. Is it still a problem? Can a harness change fix it? Would that help on other tasks? Is the fix worth the risk? The scores are updated each time since a patch may already have solved the problem.
     - Then pick one pattern. Higher-scoring patterns have a better chance of being picked, so this amounts to choosing one of the harness's most important weaknesses. Take up to three tasks linked to it.
  4. **Run the tasks and improve the harness.** With the tasks chosen, run them with the current harness, then hand the results to the agent that improves the harness. *(Author's note. The actual improvement is handled by AutoSaddler, which has its own paper if you're curious.)*
  5. **Record what failed.** If the attempted improvement fails, file the task under the list of failure patterns. Add a new pattern when it's a kind of failure the list doesn't have yet.

### Experiments

- The benchmarks were GAIA2 and Terminal-Bench 2.0.
- GPT-5.5 powers both the task agent and the agents doing the optimization.
- The total rollout budget is 1,400 on GAIA2 and 490 on Terminal-Bench 2.0.
- The main comparison keeps AutoSaddler as the harness optimizer and changes the task order. One version uses a fixed random order and the other uses ActiveSaddler.

### Results

- ActiveSaddler wins against a fixed random order!
- Grouping tasks by failure pattern worked. The optimizer could tackle one kind of failure at a time. The benchmark's built-in task categories were less effective for grouping.
- On API cost: ActiveSaddler's way of feeding tasks is more involved than a random order, so it's no surprise that this step costs more. The total cost still went down!
- ActiveSaddler also improved performance when paired with a different optimizer, GEPA.

---

## Reflections

- Borrowing the idea of a curriculum to get more out of the data we already have feels like a sensible approach.
- Could we just let the agent handle this whole thing? Give it a database of tasks and say, "Go grab what you need." Would that be a bad idea? Maybe the agent could use a bit more room to decide.

---

## Takeaways

- There's always a better way to squeeze more out of the data you have, and harness optimization is no exception.

---

## Next reading

- None

---

#AI #LLM #agent #harness #optimization #curriculum_learning
