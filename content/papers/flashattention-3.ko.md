---
title: FlashAttention-3
date: 2026-10-06
type: paper
publish: false
description: ""
---
## 서지 정보

- 제목: FlashAttention-3: Fast and Accurate Attention with Asynchrony and Low-precision
- 저자: Jay Shah, Ganesh Bikshandi, Ying Zhang, Vijay Thakkar, Pradeep Ramani, Tri Dao
- 기관: Colfax Research, Meta, NVIDIA, Georgia Institute of Technology, Princeton University, Together AI
- 발표 / 출판: NeurIPS
- 출판 연도: 2024
- 링크 / 코드·데이터:
	- https://proceedings.neurips.cc/paper_files/paper/2024/hash/7ede97c3e082c6df10a8d6103a2eebd2-Abstract-Conference.html

---

## 세 줄 요약

- FlashAttention-2가 H100부터 도입된 기능들을 충분히 활용하지 못하고 있었다. i.e., 비동기 처리, 저정밀도 연산
- FlashAttention-3는 비동기 스케쥴링을 통해 GPU utilization을 35%에서 80% 이상으로 끌어올린다.
- 또한 저정밀도 연산에서 발생할 수 있는 여러 가지 문제점들을 소프트웨어와 알고리즘 수준에서 풀어내어 저정밀도 연산이 안정적으로 수행되도록 한다.

---

## 요약

- FlashAttention-1과 2에 관한 자세한 설명은 생략. 혹시 궁금하면 이전 포스트 참고!
	- [FlashAttention-1](flashattention-1.ko.md)
	- [FlashAttention-2](flashattention-2.ko.md)

### 서론

- 트랜스포머 연산의 병목은 self-attention이다. self-attention은 입력 길이에 이차적으로 복잡도가 증가하기 때문. 입력 길이는 점점 증가하는 추세라 (e.g., 큰 코드베이스 읽기, 긴 대화 이력 보존, 고화질 동영상) 이 문제를 해결하는 것이 더욱 중요해지고 있다.
- 문제 해결을 위해 FlashAttention-1과 2가 고안되었다.
	- FlashAttention-1: 메모리 R/W을 줄여서 메모리 복잡도 감소
	- FlashAttention-2: 작업 분배를 효율화하여 연산유닛이 놀지 않도록
- 그런데 Flashattention-2는 최신 GPU인 H100에서의 utilization이 기본 패키지 대비 많이 떨어진다. 80% vs. 35%. 왜냐하면 H100의 '비동기 처리'와 '저정밀도 연산'이라는 두 가지 특징을 활용하지 않기 때문.
	- A100부터 비동기 처리는 일부 지원되었다. 그런데 H100에서는 데이터 이동을 전담하는 TMA와 비동기 행렬곱 명령 WGMMA가 추가되어 비동기 처리를 더 적극적으로 활용할 수 있게 됨. 또한 4세대 Tensor Core가 FP8 행렬곱을 새로 지원; FP16이나 BF16 대비 약 2배 효율로 처리.
- 이 연구의 목표는 FlashAttention-2를 비동기 처리와 저정밀도 연산에 맞추어 새로 설계하는 것. 크게 세 가지 개선점이 있다.
	1. **producer-consumer 비동기:** warp들을 producer / consumer로 나눈다. producer warps는 HBM에서 데이터를 가져와서 작업 발행. consumer warps는 연산만 담당. 결과적으로 둘 모두 다른 작업이 끝나기를 기다리지 않고 작업 가능.
	2. **비동기 GEMM으로 softmax 숨기기:** 어텐션 연산 순서는 '$QK^\top$ -> $softmax$ -> $PV$' 순서. 다시 말해 '행렬곱 -> 비행렬곱 -> 행렬곱' 순서이다. 가운데 있는 비행렬곱 연산인 $softmax$가 행렬곱 연산들에 비해 약간 느려서 병목이 된다. 그래서 일단 행렬곱 작업을 비동기로 발행하고 그 동안에 $softmax$ 연산을 수행.
	3. **저정밀도 GEMM:** 정밀도를 낮추어 계산하면 좋은 곳에서 저정밀도로 계산. 단, 여러 가지 문제를 해결하는 방향으로. e.g., 메모리 형식 불일치, 수치 정확도 감소

### FlashAttention-3의 구현

#### Producer-Consumer 비동기
![](Pasted%20image%2020261006125721.png)
> 두 warpgroup의 핑퐁 스케쥴링. 같은 색이 같은 iteration. iteration은 최종 산출물 $O$를 한 번 업데이트하는 단위로 여러 개의 $Q$ 조각들을 연산한다.
- producer-consumer 비동기의 목표는 데이터 로드와 실제 연산을 비동기로 겹쳐서 수행하는 것. 아래 설명을 읽고 위의 그림을 이해하면 된다.
- 먼저, 같은 thread block에 속한 warp들을 producer / consumer 로 나눈다.
	- producer warpgroup: HBM에 있는 $Q,K,V$를 SMEM으로 가져오는 역할
	- consumer warpgroup: SMEM에 준비된 데이터들로 실제 연산 수행
	- ** 이렇게 하면 producer와 consumer가 서로를 기다리지 않을 수 있다. producer는 연산 완료 여부에 관계 없이 슬롯만 비었으면 바로 데이터 로드. consumer도 데이터 로드를 기다리지 않고 SMEM에 쌓인 데이터로 바로바로 연산 수행.
- 여기에서 consumer warp들에 대해 조금 더 복잡하고 효율적인 작업 관리를 걸어 보자. 위의 그림처럼 여러 개의 consumer warps를 묶어서 핑퐁 스케쥴링을 짠다.
	- 먼저 하나의 iteration이 주어지면, FlashAttention-2처럼 $Q$를 행 단위로 조각내어 여러 개의 warpgroup들에 나눠준다. *(작성자 주. 실제 구현에서는 64행씩 자름)*
	- 그림의 한 warpgroup을 보면 'GEMM0 -> Softmax -> GEMM1' 순으로 연산한다. 이것은 표준 어텐션 연산인  '$QK^\top$ -> $softmax$ -> $PV$'를 의미한다. (물론 전체 행렬이 아니라 $Q,K,V$의 일부 조각을 연산)
	- 그림의 warpgroup들을 보면 하나가 Softmax를 할 때 다른 하나는 GEMM을 하고 있다. softmax는 행렬 연산이 아니라 Tensor Core를 사용하지 않으므로, 하나가 softmax를 처리할 때 Tensor Core가 놀지 않도록 다른 warpgroup들이 GEMM을 돌리는 것.

#### 한 warpgroup 안에서 GEMM과 softmax 겹치기
![](Pasted%20image%2020261006125733.png)
> 하나의 warpgroup 안에서의 비동기 연산 스케줄. 같은 색은 같은 iteration, 즉 같은 $Q$ 슬라이스 의미.
- 위에서는 여러 개의 warpgroup을 스케쥴링하는 방법을 다뤘다면, 여기서는 하나의 warpgroup 안에서의 스케쥴링을 다룬다.
- 요지는 producer-consumer와 비슷함. 현재 iteration의 GEMM1을 다음 iteration의 softmax와 겹치는 것임. 어차피 둘은 서로 다른 연산유닛을 사용하기 때문에 동시에 처리 가능.
- (이 방식에는 골칫거리가 하나 있긴 하다. 연산이 완전히 해소되기 전까지 register에 이전 iteration의 결과를 들고 있어야 한다는 것. 그래서 너무 많은 메모리를 점유하지 않도록 조치가 필요함.)

#### 저정밀도 GEMM with FP8
![](Pasted%20image%2020261006145758.png)
- FP8로 빠르게 연산하고 싶은데 두 가지 문제가 있다.
	1. WGMMA가 FP16/BP16과 FP8에 기대하는 데이터 형태가 다르다.
	2. 양자화로 인해 정확도가 떨어진다.
- 데이터 형태 문제의 경우 전처리해서 차원과 데이터 타입을 잘 맞춰주면 된다.
- 반면 정확도 문제는 알고리즘 수준에서 풀어야 한다. 다음은 새로 적용한 알고리즘. *(작성자 주. 아래 두 알고리즘은 FlashAttention-3가 최초로 제안한 것은 아니기에 설명이 다소 부실함. 이해가 필요하다면 다른 논문을 찾아보는 것이 좋을 듯.)*
	- block quantization: 블록마다 스케일 *(작성자 주. 양자화할 값들을 FP8로 표현할 수 있도록 곱하거나 나누는 값. 나중에 역수를 취해서 다시 복원한다. 이 값을 정하는 방법은 다양함.)* 을 따로 두어서 한 블록의 과장된 스케일이 다른 블록으로 퍼져나가지 않도록 방지.
	- incoherent processing: 큰 모델에서는 특정 차원에 아웃라이어가 많이 생겨나는 경향이 있다. 이 경우 스케일에 문제가 생길 수 있다. 그래서 이 아웃라이어들을 없애기 위해 $Q,K$에 무작위 직교행렬 $M$을 곱해서 회전/반사 시킨다. 정확히는 $(QM)(KM)^\top, MM^\top = I$.

### 실험 결과
- FlashAttention-2보다 1.5 - 2.0배 빨랐고, 1k 이상의 입력 길이에서는 H100 공식 cuDNN보다 빠름.
- ablation 결과 FlashAttention-3의 전략들은 모두 유효했다. 단, 저정밀도 연산에서 block quantization은 효과가 거의 없긴 했음.


---

## 읽고 든 생각

- 발전된 AI의 보조로 공학적 설계에 드는 비용이 낮아져서 그런가 많은 회사들이 자체 칩을 구상하고 있다. 해결하고 싶은 문제가 생기면 아예 하드웨어 수준에서 접근하겠다는 것. 하지만 칩 제조의 비용 때문에 (i.e., 생산한 칩을 뽕 뽑을 때까지 써야 하니까!) 칩 교체가 빈번하기는 어려울 것 같다. 결국 FlashAttention 같은 알고리즘 혹은 소프트웨어 수준의 해결책들은 계속 필요할 것 같다.
- 문제는 (저자들도 FlashAttention-1부터 지적했듯이) 효율성이다. 새로운 칩이 나오고 시류가 바뀔 때마다 얼마나 빠르게 해결책을 제안할 수 있는가?

---

## 배운 점

- 뭐든 꾸준히 하자! 아직도 나오고 있는 FlashAttention 시리즈처럼!

---

## 다음 읽을 것

- [AVO](avo.ko.md)

---

#AI 
