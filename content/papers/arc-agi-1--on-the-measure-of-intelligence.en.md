---
title: "ARC-AGI-1: On the Measure of Intelligence"
date: 2026-09-13
type: paper
publish: true
description: ""
---
## Bibliographic Information

- title: On the Measure of Intelligence
- authors: Francois Chollet
- institution: Google
- venue / publisher: arXiv
- publication year: 2019
- link / code & data:
  - paper: https://arxiv.org/abs/1911.01547
  - official website: https://arcprize.org/arc-agi/1
  - GitHub: https://github.com/fchollet/ARC-AGI

---

## TL;DR

![](../../assets/arc-agi-1--on-the-measure-of-intelligence/Pasted%20image%2020260913122505.png)

- Intelligence is the ability to efficiently acquire new skills for a given problem by generalizing from prior knowledge and experience, rather than the skill of solving a particular problem itself.
  - $\text{Intelligence} \neq \text{Skill}$
  - $\text{Intelligence} \approx \frac{\text{Skill} \times \text{Generalization Difficulty}}{\text{Priors} + \text{Experience}}$
- ARC is a benchmark built around this principle. It measures the ability to reason through unfamiliar tasks and solve them using only a few examples.

---

## Summary

### 1. Background

#### The Need for a Rigorous Measure of Intelligence

- Efforts to build artificial intelligence resembling human intelligence have continued, but AI researchers still struggle to measure intelligence properly. To support AI development and quantify its progress, we need to be able to measure human-like "general intelligence" in AI.
- Yet there is currently no adequate method, and researchers have paid too little attention to the problem. For example, they often treat an AI beating humans at a particular task (e.g., a video game) as evidence of intelligence. This confuses intelligence with skill, which is a product of intelligence.
- Drawing on insights from developmental cognitive psychology, the paper aims to offer a modern perspective on measuring artificial intelligence.

#### Two Components of Intelligence

- There are countless definitions of intelligence and no agreed-upon one, but the most familiar is this: *"Intelligence measures an agent's ability to achieve goals in a wide range of environments."* (Legg & Hutter, 2007) Let us break this down.
  - "Achieve goals" -> having skills.
  - "A wide range of environments" -> being able to generalize.
- Turing made a similar point about the future of AI: *"If we someday want to build machines that speak, understand, and translate human languages, use imagination to solve mathematical problems, perform professional work, or lead organizations, we must take one of two paths. Either we reduce these activities to sciences so precise that we can tell machines exactly how to carry them out, or we develop machines that can work things out for themselves without being told exactly what to do at every step."*
- Ultimately, intelligence is not simply a matter of having many skills. The ability to acquire new ones is central.

#### AI Evaluation So Far

- Efforts to evaluate skill—that is, how well a system solves a given problem—have been fairly successful. The following methods have worked well.
  - Human evaluation: having humans assess the outputs.
  - White-box analysis: analyzing all possible cases.
  - Peer comparison: competing against AI systems with the same function (e.g., chess engines playing against one another).
  - Benchmarks: preparing a test set and using it repeatedly.
- However, we have learned that evaluating skill does not amount to evaluating the underlying ability. For example, researchers believed that because chess requires higher cognitive functions in humans, building a chess-playing machine would lead to human-level intelligence. But chess machines turned out to be good only at chess, without developing any other abilities.
- In other words, we need AI that excels at generalization (i.e., at acquiring skills, not merely performing them), and this requires evaluating AI in terms of its ability to generalize.
- Psychometrics can help here. As a branch of psychology, it has developed valid methods for measuring human intelligence. These methods offer several useful ideas for AI evaluation.
  - Psychometrics measures the underlying abilities that make skill acquisition possible, rather than the skills themselves.
  - It breaks intelligence down into multiple abilities and measures them to estimate those underlying capacities.
  - Its statistical rigor can serve as a model for AI evaluation methods.
- However, adapting psychometrics to AI evaluation requires some changes because human and AI abilities differ. For example, "learning a new skill" may be relatively easy for humans but very difficult for AI.

### 2. A New Perspective

#### A Critical Assessment

- If a program solves a problem exactly as its developer intended, then it is the developer who has solved the problem, not the program. In other words, software that cannot acquire skills should not be considered intelligent.
- From this perspective, deep learning may not be intelligent. It struggles to develop capabilities beyond the training data deliberately prepared by its developers. Human intelligence, by contrast, is fairly good at generalizing abilities acquired through evolution. For example, humans did not evolve to play the piano, yet we can do so.
- We therefore treat this human capacity for generalization as central to intelligence and apply it to AI evaluation. This is not because humans possess the greatest intelligence in the universe, but because drawing on well-defined assessments of human abilities is currently our best option.
- Human learning, however, does not begin with a blank slate. We learn new things on the basis of some minimal prior knowledge or abilities. Developmental psychology identifies the following as basic human priors.
  - Objectness and elementary physical intuition: understanding that the world consists of physical things that follow basic laws (e.g., objects are subject to gravity).
  - Elementary number sense: understanding basic arithmetic, such as addition and subtraction.
  - Elementary geometric intuition: basic intuitions about direction, distance, and connections.
  - Goal-directedness: understanding that when an object moves, something caused it to move, and also expecting that its movement may reflect an intention.
- AI evaluation allows these basic abilities to be learned in advance. However, having learned more than this beforehand is considered unfair.

#### Formalizing Intelligence

- Putting the discussion so far together, intelligence can be defined as follows. **Intelligence is the ability to acquire new skills using prior knowledge (priors) and experience within a given range of tasks (scope).**
- Here, we need to distinguish skill explicitly from intelligence.
  - Skill: how well a system performs a particular task.
  - Intelligence: how efficiently it acquired that skill.
- High skill therefore does not necessarily mean high intelligence. A system with limited generalization ability can still achieve high skill if a great deal of prior knowledge is hard-coded into it or if it uses an enormous amount of training data.
- To express this distinction, the paper separates an "intelligent system" from a "skill program."
  - Intelligent system: a system that learns a new task from experience and produces a program capable of performing it.
  - Skill program: the resulting ability to perform a particular task, acquired through learning.
  - For example, if a system capable of learning the rules of chess is the intelligent system, then the chess player it produces is the skill program.
- The sequence of experiences a system encounters during learning is called a curriculum. A curriculum is not simply a dataset but a sequence of situations, responses, and feedback. Which experiences are provided, and in what order, also affects learning efficiency.
- The highest level of skill a system can achieve on a task is its potential for that task (e.g., finding the shortest path). Its scope is the range of tasks on which it can acquire sufficient skill.
- Intelligence therefore cannot be defined as a single absolute value. It can only be defined relative to a particular scope.

#### Generalization Difficulty, Priors, and Experience

- Measuring intelligence requires looking beyond final skill and considering the following three factors together.
  - Generalization difficulty: how difficult it is to generalize from the examples seen during training to the evaluation setting.
  - Priors: how much information relevant to the solution the system already had before learning began.
  - Experience: how much new information about the solution the system acquired during learning.
- The paper formalizes these three factors using Algorithmic Information Theory, particularly Kolmogorov complexity.
- Generalization difficulty roughly refers to how much additional information is needed to go from the simplest program that handles only the training examples well to a program that also handles the actual evaluation well.
- Priors are the portion of the information needed for the final solution that the system already possessed before learning began.
- Experience represents how much the information received during learning reduced uncertainty about the final solution.
- The paper's definition of intelligence can therefore be expressed conceptually as follows. *(Author's note. The exact formula includes expectations over multiple tasks and curricula, task-specific values, and so on, but this expression captures the basic idea. The original formula also appears to be uncomputable. So I think this mathematical definition is better understood as a theoretical framework that clarifies what intelligence evaluation needs to control for, rather than a formula for directly calculating an actual score.)*

$$
\text{Intelligence}
\approx
\frac{
\text{Skill} \times \text{Generalization Difficulty}
}{
\text{Priors} + \text{Experience}
}
$$

- In other words, a system is considered to have demonstrated high intelligence if it acquires high skill on a new task that is difficult to generalize to, using little prior knowledge and little experience.

#### Comparing Intelligence Fairly

- Comparing the intelligence of two different systems requires several conditions.
  - Both systems must be evaluated on the same scope of tasks.
  - The target level of skill must also be the same. Comparing one system's best performance with another system's poor performance is not a comparison of intelligence.
  - The two systems' knowledge priors should be as similar as possible.
- If these conditions are met, the system that reaches the same level of skill with less experience can be considered more intelligent.
- Likewise, when comparing humans and AI, we should ask how little experience AI needs to reach the same level of skill on the same kinds of tasks as humans, rather than whether its maximum performance exceeds ours.
- From this perspective, an AI that defeats a human champion after millions of rounds of self-play has certainly demonstrated high skill. But that alone does not establish that it has demonstrated greater intelligence than a human.

#### An Ideal Intelligence Benchmark

- Based on the discussion above, a benchmark for human-like general intelligence should meet the following conditions.
  - It should clearly define what it measures, and its relationship to actual abilities should be validated (validity).
  - Repeated evaluations should produce similar results (reliability).
  - It should assess broad abilities rather than a particular skill.
  - Evaluation tasks should be unknown in advance to both the system and its developers.
  - The amount of experience available for learning should be limited. It should not be possible to buy performance by generating unlimited data.
  - The benchmark should explicitly state the priors it assumes.
  - When comparing humans and AI, the conditions for priors and experience should be fair to both.
- It is especially important that even the developers do not know the evaluation tasks in advance. Even if a model has never directly seen the test examples, it is difficult to say that broad generalization has truly been evaluated if the developers knew the structure of the tasks and designed the system specifically for them. This is the idea of developer-aware generalization.

### 3. ARC: A Proposed Benchmark for General Intelligence

#### The Basic Structure of ARC

- To put these principles into practice, Chollet proposes the Abstraction and Reasoning Corpus (ARC).
- ARC is a collection of abstract reasoning problems designed for both humans and AI to solve.
- Each problem (task) is represented using two-dimensional grids ranging from 1×1 to 30×30, with each cell containing a value from 0 to 9. For humans, these values are displayed as different colors.
- Each task contains a few demonstrations and one or more test examples.
  - Demonstration: both an input grid and its correct output grid are provided.
  - Test example: only an input grid is provided, and the system must generate the output grid itself.
- The rules of the task are therefore not explained in natural language. The system must infer the transformation rule on its own from a few input-output examples.
- For example, it must identify abstract rules such as "reflect the object horizontally," "select the most frequent object," or "extend the line until it reaches an obstacle" from the demonstrations, then apply them to a new test input.
- To solve a task successfully, the entire test output must match exactly. There is no partial credit; each task is scored as a success or failure.
- The final ARC score is the proportion of evaluation tasks solved successfully. Nothing complicated here: just count how many the system got right.

#### Learning and Evaluation in ARC

- ARC has separate training and evaluation sets at the dataset level.
  - Training set: can be used to develop an AI system or become familiar with the problem format.
  - Evaluation set: assesses the system's final ability to generalize.
- At the same time, each individual task contains its own demonstrations and test examples.
- The most important learning in ARC is therefore not long-term learning across the entire training split, but acquiring a new skill on the spot from a few demonstrations within an unfamiliar evaluation task. In other words, ARC asks not "How much have you practiced this type of problem?" but "How few examples do you need to work out the rule of a problem you have never seen before?"

#### ARC and Core Knowledge

- To allow fair comparisons between humans and AI, ARC assumes only priors close to human Core Knowledge.
- These broadly include the following.
  - Objectness: the ability to perceive a grid in terms of objects and regions.
  - Elementary physics: basic intuitions about object cohesion, persistence, and contact.
  - Numbers and counting: small quantities, comparisons, addition, and subtraction.
  - Geometry and topology: symmetry, rotation, translation, distance, inside/outside, and connectivity.
  - Goal-directedness: the basic intuition that some objects or changes can be understood as actions directed toward a goal.
- Conversely, ARC does not require language, learned symbols, acquired concepts such as "cat" or "dog," or culturally learned rules such as those of chess.
- Core Knowledge is not itself the target of evaluation, but a common starting point that humans and AI are assumed to share. What is evaluated is how efficiently they discover new rules from that starting point.

#### How ARC Differs from Conventional IQ Tests

- ARC resembles human intelligence tests such as Raven's Progressive Matrices, but makes several important changes for AI evaluation.
- If conventional IQ problems are given directly to AI, developers can inspect them and hard-code their solutions into a program. In that case, it is the developers who have actually solved the problems, not the AI.
- To avoid this, ARC aims to keep evaluation tasks unknown to system developers as well.
- It also uses a variety of tasks so that hard-coding a few problem types will not easily solve the entire test.
- ARC primarily aims to measure fluid intelligence—the ability to reason about and abstract from new problems—while deliberately excluding crystallized intelligence such as language knowledge.

#### What a System for Solving ARC Might Look Like

- Chollet suggests that it is natural to view ARC as a program synthesis problem.
- One possible approach is as follows.
  - First, create a domain-specific language (DSL) that can represent objects, symmetry, rotation, translation, numbers, and spatial relationships.
  - Generate multiple candidate programs that can explain the given demonstrations.
  - Select a simple or likely program from among them.
  - Apply the selected program to the test input to generate the output.
- From this perspective, the intelligent system is a program synthesis engine that finds a suitable program from the demonstrations, and the resulting program is the skill program for that task.
- When the paper was published in 2019, Chollet judged that existing machine learning methods, including deep learning, would struggle to make meaningful progress on ARC. The benchmark was intended less to rank existing models than to encourage the development of new kinds of systems capable of broad generalization.

#### The Limitations of ARC

- Chollet does not claim that ARC is a complete measure of intelligence.
- Its most important limitation is that ARC does not directly calculate intelligence as defined in II.2.
  - It does not calculate generalization difficulty numerically.
  - It does not quantify priors in terms of actual information content.
  - Nor does it calculate experience according to its definition in Algorithmic Information Theory.
- Instead, it attempts to control these factors through the design of the benchmark itself.
  - Experience -> limit the number of demonstrations.
  - Priors -> specify the permitted Core Knowledge.
  - Generalization -> use new evaluation tasks that are not known in advance.
  - Skill -> measure whether each task is solved correctly.
- The ARC score is therefore a practical proxy for the theoretical concept of intelligence, rather than the theoretical intelligence score itself.
- ARC has other limitations as well.
  - Generalization difficulty has not been quantified.
  - Its validity—how well ARC scores predict intelligent behavior in the real world—has not been sufficiently established.
  - The number and variety of tasks may be insufficient.
  - Binary 0/1 scoring is overly coarse.
  - Exactly what constitutes human Core Knowledge is still not fully understood.

#### The Fundamental Problem with Public Benchmarks

- Once a fixed set of evaluation tasks becomes public, models or developers can learn those tasks over time.
- In that case, it is difficult to say that developer-aware generalization is still being evaluated.
- What matters, then, is not using the same ARC problems forever, but continually providing new tasks that remain unknown to both systems and developers until evaluation.
- To address this problem, the paper also proposes more open-ended forms of evaluation. For example, we could imagine a structure in which a teacher program continually generates new, challenging tasks suited to a student AI's current abilities, and the student learns from them.

### 4. Conclusion

- The paper's most important argument is that intelligence and skill must be distinguished.
- High skill can be achieved through extensive priors or experience, so it is not, by itself, evidence of intelligence.
- Intelligence should be understood as the efficiency with which a system acquires new skills on unfamiliar problems using limited prior knowledge and experience.
- Intelligence evaluation therefore needs to consider not only final performance, but also:
  - which priors the system started with,
  - how much experience it used,
  - how difficult the generalization was,
  - and what scope of tasks was involved.
- To evaluate human-like general intelligence, we should assume that humans and AI share similar knowledge priors, then compare their learning efficiency on new tasks within a scope that is meaningful to humans.
- ARC is an early attempt to put these principles into practice as a benchmark.
- The paper's ultimate message is therefore that AI research should move beyond building systems that outperform humans on particular problems, and toward systems that can understand unfamiliar problems with little experience and quickly acquire new abilities.

---

## Comments

- Psychometrics seems useful for AI evaluation. However, as the paper points out, artificial intelligence differs from human intelligence, so applying psychometrics to AI without modification is difficult. And unlike human intelligence, AI will continue to develop and change rapidly, so I suspect the difficulty of measuring it will persist.
- Naturally, measuring intelligence seems to be shifting, at least in part, from a question of natural science to one of engineering. Just consider how the author describes the purpose of measuring AI: "to drive the development of artificial intelligence..." A psychometrician, by contrast, does not measure intelligence "to make humans more intelligent..."
- A great deal would need to change for intelligence measurement to be defined from an engineering perspective. Perhaps it becomes an engineering problem in its own right when our ability to put it to use advances faster than our ability to explain it? (i.e., "I don't know why. But doing it this way made it more intelligent!")

---

## Takeaways

- Someone was already arguing for the use of psychometrics in AI evaluation back then.
- At the same time, evaluating AI requires going beyond the traditions of psychometrics.

---

## Next reading

- [ARC-AGI-2](arc-agi-2.en.md)

---

#evaluation #psychometrics #measurement_science #AI

<!-- Pre-publication checklist
  - File name: content/papers|non-fiction/<slug>.en.md — lowercase letters and hyphens
  - type: paper | non-fiction (matching the folder); fill in title and description
  - Inline #tags at the end (snake_case, e.g., #world_model #llm)
  - Create the corresponding .ko.md / .en.md pair
  - Set publish: true to publish (false by default — visible only in dev)
-->
