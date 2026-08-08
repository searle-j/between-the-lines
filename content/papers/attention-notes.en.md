---
title: "Hierarchical Notes on Attention"
date: 2024-12-30
type: paper
description: "A mockup post verifying that the Contents sidebar renders nested h2–h4 hierarchy."
---

> **This is a mockup post.** It exists to verify that the Contents sidebar indents the `##`/`###`/`####` hierarchy correctly.

## 1. Background

A hierarchical organization of the discussion around attention. This chapter has notation and related work as subsections.

### 1.1 Notation

Write the query, key, and value matrices as $Q, K, V$. This section has two sub-items.

#### 1.1.1 Vectors and matrices

Lowercase for vectors, uppercase for matrices. A depth-4 heading should appear indented in the table of contents.

#### 1.1.2 Softmax

Refers to the row-wise normalization $\mathrm{softmax}(QK^\top/\sqrt{d_k})$.

### 1.2 Related work

A section in the lineage of sequence modeling. It should sit at the same depth (###) as 1.1.

## 2. Method

The second top-level chapter, with architecture and training signal below it.

### 2.1 Architecture

Assume a single decoder-only stack.

#### 2.1.1 Head splitting

Split dimensions across $h$ heads. A depth-4 item under chapter 2.

### 2.2 Training signal

Next-token prediction only.

## 3. Limitations and outlook

The three top-level chapters should align at the same level in the table of contents.

#attention #notes
