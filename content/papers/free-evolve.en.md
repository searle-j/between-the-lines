---
title: FreeEvolve
date: 2026-11-24
type: paper
publish: true
description: "FreeEvolve lets agents decide how to run, repeat, and stop experiments, then learn and reuse that process as a skill."
---
## Bibliographic Information

- title: FreeEvolve: Learning to Evolve Beyond Fixed Loops
- authors: Lecheng Kong, Like Hui, Nikos Kanakaris, Prithwish Jana, Sahika Genc, Narayanan Sadagopan
- institutions: AWS AI Labs, Georgia Institute of Technology
- venue / publisher: arXiv
- publication year: 2026
- link / code & data:
  - paper: https://arxiv.org/abs/2610.09197
  - demo site: https://freeevolve.github.io/

---

## TL;DR

- Improve the way solutions are improved, rather than the solutions themselves—but give the agent more freedom than earlier work.
- Let the agent run a variety of experiments so it can find a better experimental process.

---

## Summary

### More Autonomy

- In the earlier work [EvoX](evox.en.md), the agent improves the way solutions are improved, rather than the solutions themselves.
- FreeEvolve gives the agent more autonomy than EvoX. The agent decides which problems to test on, when to test, how much testing to do, and so on. In other words, it can change the harness with almost no restrictions.
- Otherwise, it uses nested loops much like EvoX. The agent that generates and improves solutions sits in the inner loop. Another agent sits outside it and reworks the process that produces those solutions.
- Humans set only the goal, data, scoring criteria, and resource limits. The agent can see this information too.

### The Improvement Process

- The inner agent follows `SKILL.md`, which contains instructions such as "repeat the evaluation if the result is unclear" and "pass the version with stronger supporting evidence to the next iteration."
- The outer agent's job is to edit this `SKILL.md`. Claude Code is used here, and it seems to work as a single run rather than a loop. In other words, it calls and runs the inner loop on its own until it finishes its turn. Since this is one continuous run, it seems to read whatever information it needs along the way.
- The outer agent judges for itself how well the resulting `SKILL.md` works. It gathers and analyzes information as needed to evaluate and revise the file.
- The finished skill can be reused in other environments.

### Results

- Experimental setup
  - Benchmarks: τ³-bench, ARC-AGI-2 and ARC-AGI-3, Terminal-Bench 2.1.
  - Compared against GEPA, OpenEvolve, EvoX, and HyperAgents.
  - Competing methods stop after five attempts without improvement, while FreeEvolve gets a 24-hour budget.
- Results
  - FreeEvolve performed well in almost every setting.
  - The `SKILL.md` refined by FreeEvolve performed better than the initial human-written version, the initial AI-written version, and the version improved by humans.
  - A `SKILL.md` optimized for one task sometimes worked on other tasks, and sometimes did not.

---

## Reflections

- The idea may seem fairly simple—I felt that way a little too—but I think it has clear implications.
  - If work at this level is being published, I would expect companies' unpublished internal systems to be much more sophisticated and capable.
  - A number of studies are giving agents more autonomy. For now, most take the simple approach of lifting one existing restriction. Once there are no more restrictions to lift, I wonder whether the next step will be to build simulation environments.
- What disappointed me most was that the performance comparison was not fair. Competing methods stop after five consecutive attempts without improvement, while FreeEvolve gets 24 hours regardless. I would have liked a closer match in the number of tokens generated, elapsed time, and other measures. Perhaps this will be addressed during peer review.

---

## Takeaways

- We need to think about how to give agents as much autonomy as possible.

---

## Next reading

- None

---

#AI #LLM #agent #optimization #evolutionary_search
