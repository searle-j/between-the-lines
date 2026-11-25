---
title: Meta-Harness
date: 2026-11-25
type: paper
publish: true
description: "Meta-Harness gives a coding agent access to past code and execution logs so it can improve the harness itself."
---
## Bibliographic Information

- title: Meta-Harness: End-to-End Optimization of Model Harnesses
- authors: Yoonho Lee, Omar Khattab, Roshen Nair, Qizheng Zhang, Chelsea Finn, Kangwook Lee
- institutions: Stanford University, MIT, KRAFTON
- venue / publisher: arXiv
- publication year: 2026
- link / code & data:
  - paper: https://arxiv.org/abs/2603.28052v1
  - project: https://yoonholee.com/meta-harness/
  - harness discovered on TerminalBench-2: https://github.com/stanford-iris-lab/meta-harness-tbench2-artifact

---

## TL;DR

- Humans usually write the harness for evolutionary search. What happens if we give a coding agent the freedom to improve it?
- Give the agent access to all past runs and let it keep proposing new harnesses in a loop.
- It turns out this improves performance on text classification, math, and terminal tasks!

---

## Summary

### Introduction

- Even with the same model, performance can vary a lot depending on what we store and what we retrieve to show the model. The harness can matter as much as the model itself. It matters especially in evolutionary search, where the changes often happen in the harness around a fixed model.
- What if we let a coding agent take over the job of writing that harness?
- Give the agent all the outputs from past runs as files, and let it look through them freely. A human developer can open whichever file they need. The agent can do the same.

### Method

- Start with a problem to solve, then run this loop.
  1. **Solve and evaluate.** Run the harnesses to produce solutions and score each one.
  2. **Save the results.** Give each harness its own folder with the code, logs, and evaluation scores.
  3. **Propose new harnesses.** A coding agent, Opus 4.6 in this case, explores the full history on disk and writes $k$ new harnesses.
  4. **Validate the harnesses.** Check that the new code actually runs.
  5. **Repeat.** Go back to step one and keep going until the budget runs out.

### Experiments & Results

- Tasks
  - **Online text classification.** Predict which class an input belongs to.
    - LawBench predicts criminal charges from case descriptions.
    - Symptom2Disease predicts diseases from patients' symptoms.
    - USPTO-50k predicts precursor reactants from the product of a chemical reaction.
  - **Math olympiads.** Solve challenging math problems.
  - **TerminalBench-2.** Complete engineering tasks in a terminal, such as editing code, installing software, configuring systems, and debugging.
- Results
  - The model, number of rounds, and number of harnesses generated varied by task.
  - Overall, Meta-Harness performed better on a smaller budget than competing methods such as OpenEvolve.

### Conclusion

- Coding agents can do a good job of writing harnesses within an evolutionary search loop.
- How broadly this works across other models, tasks, and environments is still an open question.

---

## Reflections

- There is a growing push to give agents more autonomy. Maybe smart AI has trouble doing its best work under constraints set by us dumb humans.
  - In EvoX, for example, the model that improves the search gets a summary of the history assembled according to preset rules. Meta-Harness lets the agent browse the full record itself. [EvoX](evox.en.md)
- While reading, I wondered whether it was better to hand the agent a summary or let it read the full record. I pretty quickly landed on "let the agent decide that too." I do wonder if that's the right call, though.

---

## Takeaways

- Give agents more room to make their own decisions!

---

## Next reading

- None

---

#AI #LLM #agent #harness #optimization
