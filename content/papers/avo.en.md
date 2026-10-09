---
title: "AVO: Agentic Variation Operators"
date: 2026-10-09
type: paper
publish: false
description: AVO lets LLM agents autonomously sample, generate, and evaluate solutions to improve attention kernels on Blackwell GPUs.
---
## Bibliographic Information

- title: AVO: Agentic Variation Operators for Autonomous Evolutionary Search
- authors: Terry Chen∗, Zhifan Ye∗, Bing Xu∗, Zihao Ye, Timmy Liu, Ali Hassani, Tianqi Chen, Andrew Kerr, Haicheng Wu, Yang Xu, Yu-Jung Chen, Hanfeng Chen, Aditya Kane, Ronny Krashinsky, Ming-Yu Liu, Vinod Grover, Luis Ceze, Roger Bringmann, John Tran, Wei Liu, Fung Xie, Michael Lightstone, Humphrey Shi
- institution: NVIDIA
- venue / publisher: arXiv
- publication year: 2026
- link / code & data:
  - paper: https://arxiv.org/abs/2603.24517

---

## TL;DR

![Figure 1](../../assets/avo/figure-1.png)

- The key to evolutionary search is generating better—or at least new—solutions. LLMs increasingly handle this step.
- Given how far LLM capabilities have come, limiting them to generation feels like a missed opportunity.
- Using CUDA kernels as a test case, the paper shows that LLM agents can improve performance by autonomously running evolutionary search with few preset constraints.

---

## Summary

### Introduction

- Recent evolutionary search systems actively use LLMs, but their role is limited to generating new candidates within a fixed pipeline, as in AlphaEvolve. We are not making full use of their capabilities. To address this, LLM agents should be allowed to change the workflow itself.
- The paper proposes AVO (Agentic Variation Operators), with two main features.
  - Access to available resources, such as previous solutions, a knowledge base, and evaluation tools.
  - Independent control over the workflow: what to modify or evaluate, and when.
- To demonstrate AVO's usefulness, the authors apply it to multi-head attention kernel optimization on a Blackwell B200 GPU. After more than seven days of self-improvement, the resulting solution improves performance by 3.5% over cuDNN and 10.5% over FlashAttention-4, reaching 1,668 TFLOPs/s at BF16 precision. It does not overfit to multi-head attention: with a small adaptation, it is general enough to support grouped-query attention as well.

### Background

#### Evolutionary Search and Variation Operators

- Evolutionary search generates new solutions from previous solution–score pairs. It generally includes three steps.
  - Sampling: select previous results to use as references for a new solution.
  - Generation: propose a new—and hopefully better—solution based on those results.
  - Evaluation: score the proposed solution.
- Sampling and generation together form a variation operator.
- LLMs have commonly been used for generation, but they can handle other steps too.

#### Attention Kernels on Modern GPUs

- Attention's computational cost grows quadratically with sequence length $N$, because it requires computing an $N \times N$ matrix.
- FlashAttention performs this computation efficiently on GPUs by splitting the matrix into blocks, using each block to update the final attention output, and then discarding it.
- FlashAttention has continued to develop this strategy. Recent versions introduce warp specialization: assign specific roles to warps so the overall computation can proceed asynchronously. Each warp works through its own queue without waiting for other tasks to finish. *(Author's note. Some operations still need to wait for others and synchronize, of course—for example, when several results must be added together. Less synchronization lets warps keep working with fewer stalls, so FlashAttention redesigns its computation to reduce synchronization.)*
- FlashAttention-4 is so highly optimized for Blackwell that further gains are difficult to find. In other words, this is a really hard problem!

### AVO

AVO runs evolutionary search—sampling, generation, and evaluation—through agents rather than a fixed pipeline. Specifically, it uses a search agent and a supervisor agent.

#### Formulation

- Basic variables
  - $x_i$: the $i$th CUDA kernel.
  - $f_j$: the $j$th evaluation function, such as throughput in TFLOPs/s.
  - $\mathbf{f}(x_i) = (f_1(x_i), ..., f_n(x_i))$: the vector of evaluation results for $x_i$.
  - $\mathcal{P}_t = \{(x_1,\mathbf{f}(x_1)), ..., (x_t,\mathbf{f}(x_t))\}$: all kernel–evaluation pairs up to time $t$.
- Basic operations in evolutionary search
  - $\mathrm{Sample}(\mathcal{P})$: select a subset of kernel–evaluation pairs.
  - $\mathrm{Generate}(\mathcal{P})$: generate a new kernel using the given set of kernel–evaluation pairs.
  - $\mathrm{Vary}(\mathcal{P}) = \mathrm{Generate}(\mathrm{Sample}(\mathcal{P}))$: a basic variation operator.
- What AVO aims to do beyond these operations
  - $\mathrm{Vary}(\mathcal{P}) = \mathrm{Agent}(\mathcal{P},\mathcal{K},\mathbf{f})$.
  - Here, $\mathcal{K}$ is a knowledge base containing CUDA documentation, PTX ISA documentation, Blackwell architecture details, and existing kernel implementations.
  - AVO thus aims to build a system that improves itself using this knowledge base.

#### Autonomy within a Variation Step

- The authors observe that a single variation step in AVO consists of several smaller steps. The search agent uses previous results to identify problems and opportunities, writes a new proposal, and evaluates it. If the result is poor, it diagnoses the cause and proposes another improvement.
- The search agent cannot add an $x$ to $\mathcal{P}$ on its own. A rule admits a proposed solution only when it scores higher than the current best.

#### Continuous Evolution

- AVO maintains a single lineage by committing each kernel and its score to Git. It does not create branches or archive parts of the history.
- A single lineage, however, can get stuck in two ways.
  1. Search stagnation: no further improvements are found in the current direction.
  2. Unproductive repetition: the code keeps changing, but the score does not improve.
- A separate supervisor agent steers the search agent toward new directions when these problems arise.
- Reaching the final multi-head attention kernel took seven days and 40 commits. Throughout the process, the search agent independently decided when to propose a new solution, revisit previous results, or change strategy. The supervisor helped when progress stalled.

### Experiments

#### Setup

- **Agent:** NVIDIA's internally developed coding agent, with no additional tuning or special instructions.
- **Hardware and software:** NVIDIA B200, CUDA 13.1, and PyTorch 2.10.0.
- **Baselines:** cuDNN and FlashAttention-4.
- **Benchmark:** BF16 precision, head dimension 128, and sequence lengths of 4K–32K. The total token count is fixed at 32K by adjusting batch size. MHA uses 16 heads; GQA uses 32 query heads and either 4 or 8 KV heads. Forward-pass throughput is measured in TFLOPs/s under both causal and non-causal settings.

#### Results

- For MHA, performance improves by 0.4%–10.5% over cuDNN and FlashAttention-3.
- To test whether the results generalize, the authors give AVO the MHA solution and ask it to support GQA. AVO completes the adaptation in 30 minutes. The resulting kernel improves performance by 4.5%–9.4% over cuDNN and FlashAttention-4.

#### Key Points from the Evolution Trajectory

- Search at scale: 40 kernels were committed over seven days, but AVO produced more than 500 versions. Far more efficient than a human.
- Performance jumps: gains do not arrive linearly; a few attempts produce sudden, substantial improvements.
- Diminishing gains: improvements become smaller later in the search.

### Final Solution Analysis

- Three discoveries matter most.

| Discovery | Version | Performance gain<br>(Non-causal) | Performance gain<br>(Causal) |
| --- | --- | --- | --- |
| Branchless accumulator rescaling | v19 → v20 | +8.1% | +1.6% |
| Correction/MMA pipeline overlap | v29 → v30 | +1.1% | +0.4% |
| Register rebalancing across warp groups | v32 → v33 | +2.1% | ~0% |

#### Finding 1. Branchless Accumulator Rescaling

- Problem: online softmax *(Author's note. For an explanation of online softmax, try the [FlashAttention-1 post](flashattention-1.en.md)!)* includes a step that updates the row-wise maximum. The existing implementation branches on whether the maximum needs updating and skips the operation when it does not. But evaluating the branch means checking every row for updates each time. This is a form of synchronization. As discussed earlier, more synchronization erodes the benefits of asynchronous execution.
- Solution: remove the branch and always perform the operation. When no update is needed, multiply by 1. In pseudocode:
  - BEFORE: `if need_update: O = O*scaler`
  - AFTER: `scaler = factor if need_update else 1; O = O*scaler`

#### Finding 2. Correction/MMA Pipeline Overlap

- Problem: FlashAttention-4 processes two Q-tiles together, in the order `PV-GEMM-1 -> PV-GEMM-2 -> Correction-1 -> Correction-2`. Correction refers to updating $O$ in online softmax.
- Solution: once PV-GEMM-1 finishes, run Correction-1 alongside PV-GEMM-2. GEMM and correction are handled by different warpgroups, so overlapping them does not overload the same warpgroup.

#### Finding 3. Register Rebalancing across Warp Groups

- Problem: correction warpgroups lack registers and use much slower memory instead, while softmax warpgroups have registers to spare.
- Solution: reallocate registers from the softmax warpgroups to the correction warpgroups.

### Conclusion

- Improving a system with so many interacting parts, where changing one affects the others, is impressive.
- Finding a solution that extends to GQA despite targeting MHA is impressive too.

---

## Reflections

- Can it only make local changes to kernels painstakingly written by researchers, or can it build one from scratch?
  - For FlashAttention-1, the difficult part was proposing a new computational algorithm: online softmax. Are these small fixes at the implementation level comparably important? I am not sure. The performance gains are certainly meaningful, though. Even a 10% improvement could save an enormous amount of computation worldwide.
  - Here is the distinction. This paper starts with software that is already very good and improves it. Put differently, it mainly reduces the grunt work NVIDIA engineers would otherwise do. The FlashAttention authors, by contrast, keep asking whether software and its underlying algorithms can be designed when only the constraints are given, without such a strong existing implementation. I see these as different problems.
  - Given LLMs' recent, rather startling abilities in mathematical proof, building from scratch seems plausible too. But I would like to know how capable the paper's "internally developed NVIDIA coding agent" is.
- The three discoveries leave me somewhat skeptical. The analysis feels thin. Is that intentional? In particular, the ablations do not seem thorough.
- Would feeding AVO's output back into AVO yield further improvements? Given that the experiment takes only seven days, it is hard to believe they have not tried...

---

## Takeaways

- Process optimization already seems to be well within the capabilities of LLM agents. If this is what makes it into a paper, their internal capabilities are probably further along.

---

## Next reading

- null

---

#AI #LLM #agent #evolutionary_search #GPU #attention #hardware #machine_learning_system #efficiency
