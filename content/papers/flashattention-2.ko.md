---
title: FlashAttention-2
date: 2026-10-02
type: paper
publish: true
description: 비행렬곱 연산과 SRAM 왕복을 줄이고 시퀀스 길이 방향으로 병렬화를 넓혀 어텐션을 한층 더 빠르게 만든 FlashAttention-2.
---
## 서지 정보

- 제목: FlashAttention-2: Faster Attention with Better Parallelism and Work Partitioning
- 저자: Tri Dao
- 기관: Princeton University; Stanford University
- 발표 / 출판: ICLR
- 출판 연도: 2024
- 링크 / 코드·데이터:
	- 논문: https://proceedings.iclr.cc/paper_files/paper/2024/hash/98ed250b203d1ac6b24bbcf263e3d4a7-Abstract-Conference.html

---

## 세 줄 요약

- FlashAttention-1에 더 개선할 부분이 있었다; 특히 GPU에서 행렬곱보다 상대적으로 느린 비행렬곱 연산들이 불필요하게 들어간 부분이 있었다.
- 또한, 변화된 환경에 맞출 필요도 있음; 입력 길이가 점점 길어지는 추세에 맞추어 입력을 쪼개어 병렬 처리.
- 마지막으로, HBM으로의 데이터 왕복 뿐 아니라 SRAM으로의 왕복도 줄이고 싶다.

---

## 요약

- FlashAttention-1에 대한 설명은 전부 생략. 필요하면 [FlashAttention-1](flashattention-1.ko.md) 게시물 읽기!

### 서론

- 트랜스포머의 입력 길이는 점점 길어지고 있다. 문제는 트랜스포머의 핵심 연산인 self-attention의 연산량이 입력 길이에 이차적으로 비례하여 늘어난다는 것이다.
- 연산량을 줄이기 위해 많은 연구들이 근사적인 계산 방법을 제안했다. 그러나 연산량 감소가 GPU에서 실제 실행 시간 단축으로 이어지지 않는 경우가 많았다. 메모리에 데이터를 읽고 쓰는 속도가 병목인 경우가 많았기 때문이다.
- FlashAttention-1은 연산량 증가를 감수하면서 HBM R/W를 줄이는 계산 알고리즘을 제안하여 기본 구현 대비 연산 속도를 2-4배 가량 개선하였다.
- 그러나 FlashAttention-1은 메모리 효율이 좋은 대신에 연산 효율은 떨어진다. 아래는 그 원인과 해결책들
	- **알고리즘:** GPU는 행렬곱 연산을 수행할 때 처리량이 높은데, FlashAttention-1은 비행렬곱 연산들을 (e.g., max, sum, exp) 여러 번 수행하기 때문. 참고로 논문에서 비교한 A100의 이론상 최대 처리량은 FP16/BF16 행렬곱이 FP32 비행렬곱보다 약 16배 높다 (FLOPs/s 기준). 결론: 비행렬곱 연산 횟수를 줄이자. i.e., 가능하면 여러 번 할 거 한 번만 하기.
	- **병렬화:** FlashAttention-1은 batch와 head 차원으로 병렬화. 그런데 요새 입력이 길어지고 batch는 작아지다 보니 나눠줄 batch가 부족해서 GPU 일부가 작업을 받지 못해 놀게 됨. 이걸 방지하기 위해 입력 길이 차원으로 병렬화해야 함.
	- **작업 분배:** forward에서 FlashAttention-1은 $Q, K, V$를 warp에 분배할 때 같은 $Q$를 공유하고 $K, V$를 warp마다 나눠 맡기는 방식을 사용. 그러면 각 warp가 동일한 output $O$의 일부만 계산하므로, 마지막에 각 warp의 결과를 shared memory에 쓰고 다시 읽어서 합쳐야 함. FlashAttention-2는 반대로 $K, V$를 공유하고 $Q$를 warp마다 나눠 맡김. 그러면 각 warp가 서로 다른 output row를 독립적으로 완성할 수 있으므로 warp 간 결과를 합칠 필요가 없어지고, shared memory R/W와 동기화를 줄일 수 있음.
- 아래는 알고리즘, 병렬화, 작업 분배의 세부 구현을 설명한다.
- 
### FlashAttention-2의 구현

#### 알고리즘: 비행렬곱 연산 줄이기
1. 커널이 $S$의 일부를 계산할 때마다 매번 $m,l,O$를 온라인으로 업데이트 했었는데, FlashAttention-2도 $O$를 계속 누적 갱신하되 $l$로 나누는 정규화는 마지막에 한 번만 수행. $m$이 바뀔 때의 재스케일링은 남음. <- 반복되는 비행렬곱 연산을 줄이기 위해.
2. backward pass를 위해 저장하던 $m,l$을 $L = m + \log{l}$ 처럼 하나로 합쳐서 저장. 어차피 나중에 합쳐야 했었는데 미리 계산해서 합쳐놓으면 메모리도 아껴지고 비행렬곱 연산도 덜할 수 있다.
	- 비행렬곱 연산을 덜하는 게 아니라 미리 할 뿐 아닌가...하는 생각이 들 수 있는데 실제로 줄어드는 게 맞음.
	- FlashAttention-1에서는 $P$의 한 행인 $i$행을 복원할 때 이렇게 계산함. $P_i = \exp{(S_i - m_i)} / l_i$. 한 행에는 $N$개의 exp와 $N$개 원소를 $l_i$로 정규화하는 연산이 필요함. 전체 $N$개 행에서는 각각 $N^2$개 원소에 대해 수행함.
	- 그런데 FlashAttention-2에서는 미리 $L_i$를 계산해 놓았기 때문에 이렇게 복원함. $P_i = \exp{(S_i - L_i)}$. 한 행에는 exp가 $N$번, 전체 행렬에는 $N^2$번 필요하지만, $l_i$로 정규화하는 연산은 없어짐.
	- 그래서 얻은 것은 $N^2$개 원소에 대한 추가 정규화를 없앤다는 것이고 잃은 것은 미리 $L_i = m_i + \log{l_i}$를 $N$번 계산해야 하는 것임. $N$번 계산을 더 하여서 $N^2$ 계산을 안 하게 되었으니 비행렬곱 연산을 줄인 게 맞음.
#### 병렬화: batch x head에 시퀀스 차원 추가
- FlashAttention-1은 하나의 attention head를 하나의 thread block에 할당. 결과적으로 batch x heads 개수만큼의 thread blocks을 동원하게 된다.
- 그런데 문제는 최근 입력 길이가 길어짐에 따라 배치 사이즈가 줄어들었다는 것. 그래서 batch x heads 개수의 thread blocks로는 GPU를 가득채우지 못하는 경우가 생겨나고 있다.
- 그래서 길어진 입력 길이에 맞추어 병렬화를 할 필요가 있다. 다시 말해, 입력을 여러 개로 쪼개서 병렬화를 하는 것이다.
- forward에서는 $Q$를 행 블록으로 나누면 각 thread block이 독립적으로 output row를 계산하므로 결과를 합산하지 않고 concat하면 된다. backward에서는 $K,V$의 행, 즉 시퀀스 차원을 나누며, 이는 어텐션 행렬의 열 블록에 대응한다.
#### 작업 분배: warps
- GPU 전체에 thread blocks를 배분하는 방식이 결정되었으니 이제 하나의 thread block 안에서 여러 warps에게 작업을 배분해야 한다.
- 여기에서도 불필요한 shared memory R/W와 동기화를 줄이는 방식으로 연산한다. 아래 split-K/split-Q 비교는 forward 기준이며, backward에서는 동기화가 약간 필요하긴 함.


> - FlashAttention-1: split-K; $K_j, V_j$를 warp별로 분할. 예를 들어
>
> $$ K_j= \begin{bmatrix} K_j^{(0)}\\ K_j^{(1)}\\ K_j^{(2)}\\ K_j^{(3)} \end{bmatrix}, \qquad V_j= \begin{bmatrix} V_j^{(0)}\\ V_j^{(1)}\\ V_j^{(2)}\\ V_j^{(3)} \end{bmatrix} $$
>
>
> 라고 하면, 각 warp는 같은 $Q_i$를 가지고 $Q_i\,(K_j^{(w)})^\top$를 계산한다. 이후 softmax 가중치를 적용한 뒤 자신의 $V_j^{(w)}$를 곱하면, $O_i$를 완성할 partial result를 하나씩 만들게 됨. 개략적으로는,
>
>
> $$ O_i = O_i^{(0)} + O_i^{(1)} + O_i^{(2)} + O_i^{(3)} $$
>
> 꼴이 되므로 warp들의 결과를 합치는 과정이 필요하다. 이 때문에 중간 결과를 shared memory에 쓰고, 동기화하고, 다시 읽는 비용이 생긴다.
>
> - FlashAttention-2: split-Q; $Q_i$를 warp별로 분할
>
> FlashAttention-2에서는 반대로 $Q_i$의 $B_r$개 행을 warp별로 쪼갠다.
>
> $$ Q_i= \begin{bmatrix} Q_i^{(0)}\\ Q_i^{(1)}\\ Q_i^{(2)}\\ Q_i^{(3)} \end{bmatrix} $$
>
> 그리고 모든 warp가 같은 $K_j, V_j$를 사용한다. 그러면 warp $w$는 $Q_i^{(w)}K_j^\top$을 계산하고, softmax 가중치를 적용한 뒤 $V_j$를 곱해 자기 output row들인 $O_i^{(w)}$를 완성. 여기서는
>
> $$ O_i= \begin{bmatrix} O_i^{(0)}\\ O_i^{(1)}\\ O_i^{(2)}\\ O_i^{(3)} \end{bmatrix} $$
>
> 처럼, 서로 더하는 게 아니라 그냥 concat하면 되는 독립적인 행들임. 따라서 warp끼리 reduction을 안 해도 된다.

- 결론적으로, forward의 메모리 이동 관점에서 FlashAttention-1은 결과 합산을 위해 SRAM을 추가로 왕복해야 한다. 왜냐하면 중간 결과들을 SRAM에 모았다가 그걸 다시 연산 유닛으로 가져와서 더한 다음에 다시 SRAM으로 보내야 하니까. 반면에 FlashAttention-2는 이 합산 과정이 없다.

### 실험 결과

- 먼저 attention kernel 자체의 속도를 비교. A100 80GB에서 입력 길이를 512부터 16k까지 바꾸면서 실험했고, causal mask 유무와 head dimension 64/128도 각각 비교했다.
- 결과적으로 FlashAttention-2는
  - FlashAttention-1 대비 1.7-3.0배,
  - Triton으로 구현된 FlashAttention 대비 1.3-2.5배,
  - 기본 PyTorch attention 대비 3-10배 빠르다.
  - 최대 230 TFLOPs/s를 기록했는데, 이는 A100의 이론상 최대 처리량의 약 73%에 해당한다.
- 특히 입력 길이가 길어질수록 FlashAttention-2의 이점이 잘 드러난다. 앞에서 설명했듯이 긴 입력에서는 batch size가 작아져 FlashAttention-1의 batch × head 병렬화만으로 GPU를 가득 채우기 어렵기 때문이다. FlashAttention-2는 입력 길이 차원까지 병렬화하기 때문에 이런 경우에도 GPU를 더 잘 활용할 수 있다.
- H100에서도 별도의 H100 전용 최적화 없이 같은 구현을 실행했는데 최대 335 TFLOPs/s를 기록했다. 다만 H100의 TMA나 4세대 Tensor Core 같은 기능을 직접 활용한 것은 아니므로 추가 개선 여지가 있다고 본다.

#### Decoding

- decoding에서는 상황이 조금 다르다. 한 번에 새 토큰 하나를 생성하므로 query 길이는 거의 1이고, 이 경우에는 S나 P 같은 중간행렬의 R/W보다 과거 토큰들의 KV cache를 HBM에서 읽어오는 것이 병목이다.
- 그래서 FlashAttention-2는 여러 thread block이 KV cache를 나누어 동시에 읽게 해서 HBM bandwidth를 최대한 활용한다.
- 그 결과 multi-query attention decoding에서 naive PyTorch 구현보다 최대 28배, FasterTransformer보다 최대 7배 빠르다.
- 즉 FlashAttention-2의 병렬화 및 작업 분배 아이디어가 학습뿐 아니라 decoding에서도 효과가 있다는 것을 보여준다.

#### End-to-end 학습

- kernel 하나만 빨라진다고 실제 모델 학습 전체가 그만큼 빨라지는 것은 아니므로, GPT-style 모델의 end-to-end 학습 속도도 측정.
- A100 8장에서 1.3B / 2.7B 모델, context length 2k / 8k로 실험.
- FlashAttention이 없는 baseline 대비 최대 2.8배, FlashAttention-1 대비 최대 1.3배 빠르며, 최대 225 TFLOPs/s/GPU, 즉 약 72% model FLOPs utilization을 기록했다.
- 특히 context가 길 때 차이가 커진다.
  - GPT-3 1.3B, 2k: FlashAttention-1 189 -> FlashAttention-2 196 TFLOPs/s
  - GPT-3 1.3B, 8k: 170 -> 220 TFLOPs/s
  - GPT-3 2.7B, 2k: 189 -> 205 TFLOPs/s
  - GPT-3 2.7B, 8k: 175 -> 225 TFLOPs/s
- 즉, FlashAttention-2의 개선은 짧은 입력에서는 비교적 작지만, 애초에 해결하려던 문제였던 긴 입력에서 훨씬 크게 나타난다.

### 논의 및 향후 방향

- 핵심 주장은 FlashAttention-2가 FlashAttention-1보다 약 2배 빨라졌기 때문에, 같은 수의 토큰을 학습한다는 조건에서 기존에 8k context를 학습하던 비용으로 16k context를 학습할 수 있다는 것이다.
  - 입력 길이가 2배가 되면 attention 하나의 연산량은 4배가 되지만, 같은 총 토큰 수를 유지하면 batch에 들어가는 sequence 개수가 절반이 되므로 전체 attention 비용은 대략 2배가 된다.
  - 따라서 FlashAttention-2의 약 2배 speedup으로 이 증가분을 상쇄할 수 있다는 논리.
- 향후에는 H100, AMD GPU 등 다른 하드웨어와 FP8 같은 새로운 data type까지 FlashAttention을 확장할 계획이다. 특히 H100에서는 TMA, 4세대 Tensor Core, FP8 등을 직접 활용하면 추가적인 성능 향상이 가능할 것으로 본다.
- FlashAttention-2는 같은 어텐션을 더 빨리 계산하는 방법이므로, 어텐션 자체의 효율화 연구와 결합하면 시너지를 낼 수 있을 것.
- 마지막으로 현재와 같은 최적화는 GPU 구조와 block size 등을 이해하고 직접 튜닝해야 하는 부분이 많다. 저자들은 이런 최적화를 compiler가 더 쉽게 자동으로 만들어낼 수 있도록 하는 것도 향후 과제로 제시한다.

---

## 읽고 든 생각

- 문제 설정이 깔끔하고 해결 방법도 건전함.

---

## 배운 점

- 효율화의 중요성: 저자들은 좋은 연구를 했음에도, 이런 식으로 연구하는 것이 약간 '지적 노가다'를 뛴다는 느낌을 가지는 것 같다. 이전 연구인 FlashAttention-1부터 계속 연구 과정 자체의 효율화를 주요 방향으로 꼽는다.

---

## 다음 읽을 것

- [FlashAttention-3](flashattention-3.ko.md)

---

#GPU #AI #attention #hardware #LLM #machine_learning_system #efficiency #transformer #memory_optimization #parallel_computing #kernel_optimization
