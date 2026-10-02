---
title: FlashAttention-2
date: 2026-10-02
type: paper
publish: true
description: FlashAttention-2 makes attention faster by reducing non-matmul operations and SRAM traffic while adding parallelism along the sequence length dimension.
---
## Bibliographic Information

- title: FlashAttention-2: Faster Attention with Better Parallelism and Work Partitioning
- author: Tri Dao
- institution: Princeton University; Stanford University
- venue / publisher: ICLR
- publication year: 2024
- link / code & data:
  - paper: https://proceedings.iclr.cc/paper_files/paper/2024/hash/98ed250b203d1ac6b24bbcf263e3d4a7-Abstract-Conference.html

---

## TL;DR

- FlashAttention-1 still had room for improvement, especially unnecessary non-matmul operations, which are relatively slow on GPUs.
- Longer sequences call for more parallelism: split the sequence across multiple workers.
- Beyond reducing HBM traffic, reduce trips to and from SRAM as well.

---

## Summary

- I will skip the background on FlashAttention-1. If needed, start with the [FlashAttention-1 post](flashattention-1.en.md).

### Introduction

- Transformer inputs keep getting longer. The problem is that the computational cost of self-attention, their core operation, grows quadratically with sequence length.
- Many studies proposed approximate methods to reduce computation. But fewer operations did not necessarily mean faster execution on GPUs: the real bottleneck was often memory reads and writes, not arithmetic.
- FlashAttention-1 reduced HBM reads and writes at the cost of extra computation, making attention roughly 2–4× faster than standard implementations.
- Yet FlashAttention-1 is memory-efficient without being particularly compute-efficient. Here are the reasons and the proposed fixes.
  - **Algorithm:** GPUs have high throughput for matrix multiplication, but FlashAttention-1 repeatedly performs non-matmul operations such as max, sum, and exp. In the paper's A100 comparison, the theoretical peak throughput of FP16/BF16 matmul is about 16× that of FP32 non-matmul operations. The takeaway: reduce non-matmul operations. Where possible, do something once instead of repeatedly.
  - **Parallelism:** FlashAttention-1 parallelizes across batches and attention heads. As sequences get longer and batches get smaller, there may not be enough work to keep the whole GPU busy. The solution is to also parallelize along the sequence length dimension.
  - **Work partitioning:** FlashAttention-1 shares $Q$ across warps and splits $K,V$ between them. Each warp computes only a partial contribution to the same output $O$, so the results must be written to shared memory, read back, and combined. FlashAttention-2 reverses this: it shares $K,V$ and splits $Q$ between warps. Each warp can then compute a different set of output rows independently, avoiding the cross-warp reduction and reducing shared memory traffic and synchronization in the forward pass.
- The following sections explain these three changes in more detail.

### Implementing FlashAttention-2

#### Algorithm: Fewer Non-Matmul Operations

1. FlashAttention-1 updates $m,l,O$ online whenever the kernel computes a block of $S$. FlashAttention-2 still accumulates the output, but divides by $l$ to normalize it only once, at the end. Rescaling when $m$ changes is still necessary. This reduces repeated non-matmul operations.
2. Instead of saving both $m$ and $l$ for the backward pass, combine them into $L = m + \log{l}$. Precomputing this quantity saves memory and reduces non-matmul operations.
   - Does this actually reduce computation, or just move it earlier? It really does reduce it.
   - FlashAttention-1 reconstructs row $i$ of $P$ as $P_i = \exp{(S_i - m_i)} / l_i$. Each row requires $N$ exponentials and normalization of $N$ elements by $l_i$. Across all $N$ rows, each operation applies to $N^2$ elements. An actual kernel may multiply by a precomputed reciprocal, so this does not imply $N^2$ division instructions.
   - FlashAttention-2 uses the precomputed $L_i$ instead: $P_i = \exp{(S_i - L_i)}$. It still requires $N$ exponentials per row, or $N^2$ across the matrix, but no normalization by $l_i$.
   - The trade-off is straightforward: eliminate the extra normalization of $N^2$ elements at the cost of computing $L_i = m_i + \log{l_i}$ just $N$ times. That is a net reduction in non-matmul operations.

#### Parallelism: Beyond Batch and Head Dimensions

- FlashAttention-1 assigns one attention head to one thread block, giving a total of batch size × number of heads thread blocks.
- As longer sequences push batch sizes down, this may no longer provide enough thread blocks to fully utilize the GPU.
- The solution is to split the sequence into blocks and process them in parallel as well.
- In the forward pass, split $Q$ into row blocks. Each thread block independently computes its output rows, which can be concatenated without a reduction. In the backward pass, split the rows of $K,V$ along the sequence dimension; these correspond to column blocks of the attention matrix. The resulting $dK,dV$ blocks are independent, but contributions to $dQ$ still need to be accumulated using atomic additions.

#### Work Partitioning: Warps

- With thread blocks distributed across the GPU, the next question is how to divide work among warps within each block.
- The same principle applies: reduce unnecessary shared memory traffic and synchronization. The split-K/split-Q comparison below describes the forward pass; some synchronization remains in the backward pass.

> - FlashAttention-1: split-K. Partition $K_j,V_j$ across warps. For example:
>
> $$ K_j= \begin{bmatrix} K_j^{(0)}\\ K_j^{(1)}\\ K_j^{(2)}\\ K_j^{(3)} \end{bmatrix}, \qquad V_j= \begin{bmatrix} V_j^{(0)}\\ V_j^{(1)}\\ V_j^{(2)}\\ V_j^{(3)} \end{bmatrix} $$
>
> Each warp uses the same $Q_i$ to compute $Q_i\,(K_j^{(w)})^\top$. After applying the appropriate softmax weights and multiplying by its own $V_j^{(w)}$, each warp has a partial contribution to $O_i$. Schematically:
>
> $$ O_i = O_i^{(0)} + O_i^{(1)} + O_i^{(2)} + O_i^{(3)} $$
>
> These contributions must be combined. That means writing intermediate results to shared memory, synchronizing, and reading them back.
>
> - FlashAttention-2: split-Q. Partition $Q_i$ across warps instead.
>
> FlashAttention-2 splits the $B_r$ rows of $Q_i$ between warps:
>
> $$ Q_i= \begin{bmatrix} Q_i^{(0)}\\ Q_i^{(1)}\\ Q_i^{(2)}\\ Q_i^{(3)} \end{bmatrix} $$
>
> All warps use the same $K_j,V_j$. Warp $w$ computes $Q_i^{(w)}K_j^\top$, applies the softmax weights, and multiplies by $V_j$ to obtain its own output rows $O_i^{(w)}$. Here:
>
> $$ O_i= \begin{bmatrix} O_i^{(0)}\\ O_i^{(1)}\\ O_i^{(2)}\\ O_i^{(3)} \end{bmatrix} $$
>
> These are independent rows that can simply be concatenated, not added together. No cross-warp reduction is needed.

- In the forward pass, FlashAttention-1 makes extra trips through SRAM to combine the results: store the partial results, read them back into the compute units, add them, and store the result. FlashAttention-2 avoids this reduction step.

### Experiments

- First, benchmark the attention kernel itself. The experiments use an A100 80GB, sequence lengths from 512 to 16k, head dimensions of 64 and 128, and settings with and without a causal mask.
- FlashAttention-2 is:
  - 1.7–3.0× faster than FlashAttention-1.
  - 1.3–2.5× faster than FlashAttention implemented in Triton.
  - 3–10× faster than standard PyTorch attention.
  - It reaches up to 230 TFLOPs/s, about 73% of the A100's theoretical peak throughput.
- The advantage is especially clear with longer sequences. As discussed earlier, smaller batches make it harder for FlashAttention-1's batch × head parallelism to keep the GPU busy. By also parallelizing along the sequence length dimension, FlashAttention-2 makes better use of the GPU in this setting.
- The same implementation reaches up to 335 TFLOPs/s on an H100 without H100-specific optimizations. It does not explicitly use features such as TMA or fourth-generation Tensor Cores, leaving room for further improvement.

#### Decoding

- Decoding is a different setting. Only one new token is generated at a time, so the query length is usually 1. The bottleneck is loading previous tokens' KV cache from HBM, rather than reading and writing intermediate matrices such as $S$ and $P$.
- FlashAttention-2 splits the KV cache across multiple thread blocks so they can load it concurrently and make full use of HBM bandwidth.
- For multi-query attention decoding, its attention kernel is up to 28× faster than a naive PyTorch implementation and up to 7× faster than FasterTransformer.
- The parallelism and work-partitioning ideas therefore help with decoding as well as training.

#### End-to-End Training

- A faster kernel does not automatically make the entire training run faster by the same factor, so the paper also measures end-to-end training speed for GPT-style models.
- The experiments use eight A100 GPUs, 1.3B and 2.7B models, and context lengths of 2k and 8k.
- FlashAttention-2 is up to 2.8× faster than a baseline without FlashAttention and up to 1.3× faster than FlashAttention-1. It reaches 225 TFLOPs/s per GPU, or about 72% model FLOPs utilization.
- The gap is larger at longer context lengths. Comparing FlashAttention-1 -> FlashAttention-2, in TFLOPs/s per GPU:
  - GPT-3 1.3B, 2k: 189 -> 196.
  - GPT-3 1.3B, 8k: 170 -> 220.
  - GPT-3 2.7B, 2k: 189 -> 205.
  - GPT-3 2.7B, 8k: 175 -> 225.
- The gains are relatively modest for short sequences, but much larger for long sequences—the problem FlashAttention-2 was designed to address.

### Discussion and Future Directions

- The central claim is that a roughly 2× speedup over FlashAttention-1 makes it possible to train with a 16k context at the previous cost of an 8k context, for the same total number of tokens.
  - Doubling sequence length quadruples the attention computation per sequence. But keeping the total token count fixed halves the number of sequences per batch, so the overall attention cost roughly doubles.
  - FlashAttention-2's roughly 2× speedup can offset that increase.
- Future plans include extending FlashAttention to other hardware, including H100 and AMD GPUs, and new data types such as FP8. In particular, directly using H100 features such as TMA, fourth-generation Tensor Cores, and FP8 could bring further gains.
- FlashAttention-2 computes the same attention faster. Combining it with methods that make attention itself more efficient could yield further benefits.
- These optimizations still require a good understanding of GPU architecture and substantial manual tuning, including block-size selection. Making it easier for compilers to generate such optimizations automatically is another direction for future work.

---

## Reflections

- A clearly defined problem and a sound solution.

---

## Takeaways

- Despite the quality of the work, I get the sense that the author sees this kind of research as a form of "intellectual grunt work." Making the research process itself more efficient has been a recurring theme since FlashAttention-1.

---

## Next reading

- [FlashAttention-3](flashattention-3.en.md)

---

#GPU #AI #attention #hardware #LLM #machine_learning_system #efficiency
