---
title: HarnessLens
date: 2026-11-27
type: paper
publish: true
description: "HarnessLens selects tasks relevant to each harness change and checks its effect on behavior to make better use of the verification budget."
---
## Bibliographic Information

- title: Verify Smarter, Evolve Further: Efficient Harness Evolution through Behavior-Aware Verification
- authors: Jinghan Xu, Yikai Zhang, Aili Chen, Weiyuan Li, Jiaqing Liang, Deqing Yang
- institution: Fudan University, Shanghai Key Laboratory of Data Science
- venue / publisher: arXiv
- publication year: 2026
- link / code & data:
  - paper: https://arxiv.org/abs/2608.27311
  - code: https://github.com/jhxu5214/HarnessLens

---

## TL;DR

- Harness optimizers usually test a modified harness on a subset of tasks before accepting the change.
- How much do we learn from tasks unrelated to the change? They cost more to run and add noise to the results.
- HarnessLens has an agent pick tasks that exercise the behavior each change is meant to improve.

---

## Summary

### Motivation

- Harness optimization repeats a loop of proposing changes and verifying them. Verification runs some tasks with the modified harness to check whether its score actually improves. A candidate that fails this check gets discarded.
- Each change targets a different issue. Testing it on unrelated tasks adds cost and makes its effect harder to assess.
- HarnessLens picks relevant tasks for each change to reduce verification cost and get a clearer view of whether it works.

### Method

- The loop uses four types of agents, each with a different role.
- First, run all training tasks with the initial harness and collect the logs. Group tasks by similar goals and identify which parts of the harness can be edited, such as instructions, skills, and tool descriptions.
- Then repeat the following steps.
  1. **Propose a change.**
     - A diagnostic agent reads the execution logs, identifies recurring weaknesses, and writes proposals to address them.
     - An evolution agent picks the most promising proposal.
     - An editing agent applies it as a patch to the current harness.
  2. **Choose verification tasks.** The evolution agent selects at least five tasks related to the patch. The batch includes tasks likely to improve and tasks that might break because of the change.
  3. **Write a comparison report.** Run the selected tasks with both the current and patched harnesses. A comparison agent examines their logs and reports on the changes in behavior, providing evidence to assess whether score gains came from the intended fix.
  4. **Review the evidence.** The diagnostic agent reviews the verification records collected so far. There must be tasks that improved because of the patch, with no tasks that regressed because of it.
  5. **Confirm and accept.** A candidate that passes gets another check on a new batch of tasks. It must pass again before the change is accepted.
  6. **Repeat.** Go back to proposing changes. Logs from verification are saved so the agents can inspect them in later iterations.

### Experiments

- All agents use deepseek-v4-flash-preview.
- The harnesses are OpenCode, Codex CLI, and Pi Coding Agent.
- The benchmarks are tau2-bench Retail for shopping support, tau3-bench Banking Knowledge for banking support, Terminal-Bench 2.0 for terminal tasks, and BIRD Mini-Dev for SQL generation. Each benchmark provides 30 training tasks.
- The baselines are existing harness optimization methods.
- The main question is whether HarnessLens can produce better harnesses on a much smaller budget.

### Results

- HarnessLens achieved the strongest results on the smallest configured budget. It ranked first or tied for first in eight of the twelve combinations of three harnesses and four benchmarks.
  - It never scored below the initial harness. Self-Harness and Meta-Harness fell below their initial scores in half of their settings.
- It also rejected changes that would have passed on score alone. One candidate improved its verification score by 50 percentage points, but the intended change in behavior never showed up in the logs, so it was rejected.
- Finding changes that helped across a wide range of tasks was harder. HarnessLens worked well on BIRD, where tasks often involve similar decisions. Broadly useful changes were harder to find on Terminal-Bench, where task goals vary widely.

---

## Reflections

- Making evaluation more efficient feels like a worthwhile direction.
- The algorithm is pretty involved, though. I used to see a complicated algorithm and think, "That must have taken a lot of work." These days I wonder, "Did AI put this together?" That's fine by me.

---

## Takeaways

- Look closely at a process and there's always something you can make more efficient.

---

## Next reading

- None

---

#AI #LLM #agent #harness #optimization #verification
