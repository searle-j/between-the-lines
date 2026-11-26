---
title: "SSR: Successive Scale Racing"
date: 2026-11-26
type: paper
publish: true
description: "SSR improves agent harnesses with different-sized sets of lessons from past runs and drops weak candidates early."
---
## Bibliographic Information

- title: Forging More Tasks into Better Harnesses: Agentic Harness Evolution via Successive Scale Racing
- authors: Jingzhe Liu, Jiliang Tang, Tong Zhao, Neil Shah, Clark Mingxuan Ju
- institutions: Michigan State University, Snap Inc.
- venue / publisher: arXiv
- publication year: 2026
- link / code & data:
  - paper: https://arxiv.org/abs/2610.28815v1

---

## TL;DR

- Giving a harness optimizer more tasks to learn from can only get you so far.
- Misleading lessons, near-duplicate solutions, and conflicting advice can all add noise.
- In each round, pull lessons from every task, then try improving the harness with different subsets of those lessons.

---

## Summary

### Introduction

- A harness improvement loop usually goes like this. Run some tasks, figure out what went wrong, and tweak things like prompts or tool use. Shouldn't more run logs make it easier to improve the harness?
- In the authors' preliminary experiments, performance was uneven as they added tasks. Giving the optimizer 40 logs picked by an LLM worked better than giving it all 160. A random sample of 40 did worse than the full set.
- So picking good logs matters. How do we tell which ones will help?
- If we can pick out the useful lessons each round, the optimizer should have less noise to sift through. That could get us better harnesses for less work.

### Method

- Run the following loop.
  1. **Collect run logs.** Run the current harness on every training task. If there are 100 tasks, that's 100 logs.
  2. **Extract lessons.** An LLM pulls a lesson from each run. For example, check which time zone the user wants before defaulting to UTC.
  3. **Rate the lessons.** The same LLM scores each lesson from 0 to 1 on three dimensions.
     - **Specificity.** Is it clear what to change?
     - **Confidence.** Is the change likely to work?
     - **Transferability.** Could it help on other tasks too?
  4. **Rank the lessons.** Multiply specificity by confidence to score each lesson's quality. Use embedding similarity to see how much each lesson overlaps with those already picked, and prioritize lessons that cover useful experiences that transfer to other tasks.
  5. **Write four new harnesses.** Take the top 25%, 50%, 75%, and 100% of the ranked lessons. Use each set to write a new version of the current harness.
  6. **Evaluate the new harnesses.** Give the four candidates and the current harness the same tasks, dropping weaker candidates along the way. If a candidate beats the current harness, carry the best one into the next round.

### Experiments & Results

- SSR outperformed competing methods across several benchmarks. In a separate experiment, dropping weak candidates early made it possible to pick a strong harness with fewer evaluation runs.
- As the task pool grew from 40 to 200 and the execution budget rose in proportion, SSR improved steadily while AHE's performance went up and down. SSR was able to put the extra tasks to work.

---

## Reflections

- This looks like a good first step toward using a lot more data for harness optimization. Scaling up the data is a pretty basic idea in machine learning, after all.
- Still, this feels like early work. There's a long way to go.

---

## Takeaways

- Let's figure out how to feed these systems a lot more data!

---

## Next reading

- None

---

#AI #LLM #agent #harness #optimization #evolutionary_search
