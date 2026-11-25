---
title: "KSI: Knowledge-Centric Self-Improvement"
date: 2026-11-25
type: paper
publish: true
description: "A self-improvement method that uses discussion to turn agents' experience into knowledge they can reuse across tasks and models."
---
## Bibliographic Information

- title: Knowledge-Centric Self-Improvement
- authors: Xuefei (Julie) Wang, Lauren Hyoseo Yoon, Chengrui Qu, Amanda Zichang Wang, Atharva Sehgal, Eric Mazumdar, Yisong Yue
- institution: Caltech
- venue / publisher: arXiv
- publication year: 2026
- link / code & data:
  - paper: https://arxiv.org/abs/2607.19592v1
  - code: https://github.com/recursive-knowledge/KSI

---

## TL;DR

- Spin up a fresh agent for each task, then save what it tried and learned in a shared knowledge base.
- The knowledge base is what improves from one attempt to the next. The prompts, workflows, and harness stay fixed.
- On coding tasks, this approach performed better at lower cost. The accumulated knowledge also helped on new tasks and with different models.

---

## Summary

### Introduction

- What if we saved what agents learn while solving tasks in a knowledge base?
- A lot of self-improvement work uses trial and error to improve prompts, workflows, harnesses, or code.
  - Those changes can constrain what the agent does next, reducing its autonomy and making mistakes harder to correct.
  - The improvement loop can get stuck down a rabbit hole or overfit and produce a system that generalizes poorly.
- This paper keeps the agent setup fixed and updates the shared knowledge base. Start a fresh agent for each task, let it read the knowledge base and do the work, then use the results to update the knowledge base.
- The authors want to see how far that alone can take the system. They hold other factors fixed to assess what a knowledge base can contribute to self-improvement.

### Related Work

- Darwin Gödel Machine (DGM), HyperAgents, and Meta-Harness use execution results to improve agents or their harnesses. Methods like GEPA optimize the prompts agents use to solve tasks.
- Plenty of self-improvement research already updates a knowledge base. This paper tests how much agents can gain from lessons drawn from past experience and how well those lessons carry over.

### Method

- **Run a generation.** Launch a fresh solver for each task. Give it the task description, tools, a table of past results for that task, and both task-specific and shared knowledge. The knowledge goes into `MEMORY.md` in the agent's workspace.
- **Task forum.** After an attempt, a forum agent reviews how it went and posts the hypothesis, the result, what to try next, and the expected outcome. It cites and comments on relevant earlier posts.
- **Shared forum.** The forum agent also posts a lesson that other agents could use. It draws on earlier posts, pulling together useful points and questioning claims when the evidence calls for it.
- **Distillation.** A distillation agent reviews the posts and writes the `MEMORY.md` for the next generation of solvers.

### Experiments

- **Benchmarks.** ARC-AGI-1, ARC-AGI-2, Polyglot, SWE-bench Pro, and Terminal-Bench 2.
- **Models.** Haiku 4.5 and GPT-5.4-mini.
- **Improvement loop.** The authors average three runs of up to ten generations. Each generation has one round in the task forums and two in the shared forum.
- **Baselines.** The paper compares the approach with other self-improvement methods.

### Results

- **Performance and cost.** The approach solved more tasks at lower cost than methods that improve the agents themselves.
- **Knowledge transfer.** The accumulated knowledge also improved performance when given to a different LLM or used on new tasks.
- **Limitation.** A direct comparison with simply collecting past attempts would help show how much the forums and distillation contributed.

### Conclusion

- Refining shared knowledge improved performance with the agents' code and setup held fixed. Some of that benefit carried over to later runs and different models.
- Breaking longer tasks into subtasks, bringing human experts into the process, and combining this approach with harness improvement are directions for future work.

---

## Reflections

- The idea feels familiar, but I think the paper is worthwhile. The authors made an effort to keep the rest of the setup fixed so they could see what the knowledge base was doing. It made me more convinced that how you manage an agent's knowledge base matters.

---

## Takeaways

- How you manage the knowledge base really matters.

---

## Next reading

- None

---

#AI #LLM #agent #memory #harness
