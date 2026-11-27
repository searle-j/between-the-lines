---
title: GEPA-Curator
date: 2026-11-27
type: paper
publish: true
description: "GEPA-Curator uses task histories to choose tasks and past successful runs so prompt optimization can learn from useful feedback."
---
## Bibliographic Information

- title: GEPA-Curator: Curated Learning for Self Improving Agents
- authors: Zack Yu, Nicholas Lee, Minjae Lee, Lakshya A Agrawal, Luca Manolache, Wonjun Kang, Matei Zaharia, Michael W. Mahoney, Kurt Keutzer, Sehoon Kim, Amir Gholami
- institution: UC Berkeley, ICSI, LBNL, Furiosa AI, KAIST
- venue / publisher: arXiv
- publication year: 2026
- link / code & data:
  - paper: https://arxiv.org/abs/2610.37651

---

## TL;DR

- Prompt optimizers such as GEPA learn from failed agent runs and revise the prompt. *(Author's note. Here's how GEPA works in brief. Run a few training tasks with the current prompt. An agent reads the logs and scores, diagnoses what went wrong, and proposes a prompt change. Test the revised prompt on the same tasks and accept it if the score doesn't get worse.)*
- Failures caused by tools, environments, or evaluators can still end up driving those prompt changes.
- GEPA-Curator adds a Curator agent that picks tasks with something useful to learn from. A form of curriculum learning.

---

## Summary

### Motivation

- GEPA randomly samples training tasks, runs them, and sends the failures to the agent improving the prompt.
- A failure can have several causes. Say a purchase button temporarily stops responding. The agent might see that failure and add an instruction to find a workaround for the button.
- In the authors' experiments, GEPA struggled when learnable tasks were mixed with tasks that were impossible or produced unreliable feedback. Even on the 16 learnable tasks, it only solved 12 at its peak...
  - Part of the problem is that GEPA checks the aggregate score when testing a new prompt. A few bad decisions can slip through if the overall score goes up.
- What if we picked tasks with useful lessons in the first place? That's the starting point for GEPA-Curator.

### Method

- The Curator is an LLM agent wrapped around GEPA. It picks useful tasks to feed into the optimizer and can inspect each task's full prompt revision history and the scores for those prompts.
- The loop goes like this.
  1. **Choose tasks.** For each task, the Curator reads its history and decides whether to run it this round or skip it.
     - Run tasks with too little history, or tasks where prompt changes have improved behavior.
     - Skip tasks with repeated stable successes and little left to learn, tasks that keep hitting tool or environment limitations, and tasks where similar behavior gets inconsistent scores.
  2. **Provide a successful example.** Pass the chosen task to GEPA along with a log from a past successful run as a reference.
  3. **Run and revise.** GEPA runs the chosen tasks and revises the prompt. Having a successful example to refer to can help it produce a useful prompt even when temporary system issues disrupt a run.
  4. **Repeat.** Go back to task selection.

### Experiments

- The task agent uses gpt-oss-120b.
- The prompt optimizer and Curator use either Gemini 3.1 Pro Preview or Claude Opus 5.
- The benchmarks are GoBrowse for web tasks, ALFWorld for household tasks, AppWorld for using APIs across apps, and tau-bench for customer support.
- Rollout budgets are 5,000 per website, 2,000 for ALFWorld, 1,500 for AppWorld, and 800 for tau-bench.
- The main comparison is GEPA against GEPA-Curator. Does adding a Curator improve performance within the same number of task runs, even with the extra work needed for curation?

### Results

- GEPA-Curator outperformed GEPA with the same rollout budget. Even the version optimized for efficiency cost about 1.31 times as much as GEPA. In a separate comparison with total spending matched, it performed better in seven of eight evaluations.
- Ablations showed that task selection and successful examples each helped, and combining them worked best.
- A Curator built from fixed rules produced smaller gains. The rules skipped tasks after three consecutive successes or failures and provided the most recent successful log.
- Adding a Curator to Meta-Harness also improved performance. Curriculum learning seems useful across different optimization methods.

---

## Reflections

- As I noted in [ActiveSaddler](activesaddler.en.md), curriculum learning seems to matter for harness optimization too.
- Beyond curriculum learning, finding better ways to present or transform the data could also help.

---

## Takeaways

- Making smart use of data always matters. Throwing lots of data at a problem is great when you can, but that isn't always an option!

---

## Next reading

- None

---

#AI #LLM #agent #harness #optimization #evolutionary_search #curriculum_learning
