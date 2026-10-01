---
title: "AVO: Agentic Variation Operators"
date: 2026-09-29
type: paper
publish: false
description: ""
---
## 서지 정보

- 제목: AVO: Agentic Variation Operators for Autonomous Evolutionary Search
- 저자: Terry Chen∗, Zhifan Ye∗, Bing Xu∗, Zihao Ye, Timmy Liu, Ali Hassani, Tianqi Chen, Andrew Kerr, HaichengWu, Yang Xu, Yu-Jung Chen, Hanfeng Chen, Aditya Kane, Ronny Krashinsky, Ming-Yu Liu, Vinod Grover, Luis Ceze, Roger Bringmann, John Tran, Wei Liu, Fung Xie, Michael Lightstone, Humphrey Shi
- 기관: Nvidia
- 발표 / 출판: arXiv
- 출판 연도: 2026
- 링크 / 코드·데이터:
	- 논문: https://arxiv.org/abs/2603.24517
	- 

---

## 세 줄 요약

![](../../assets/avo/figure-1.png)

- ...

---

## 요약

### Introduction
- 최근 진화적 탐색 시스템에서 LLM이 활발하게 사용되고 있으나, LLM의 역할은 고정된 파이프라인에서 새로운 후보를 생성하는 것에 그치고 있다. (e.g., AlphaEvolve) 다시 말해, 우리는 LLM의 다양한 능력을 충분히 활용하고 있지 못한 것이다. 이를 극복하기 위해서는 LLM 기반 에이전트가 워크플로우 형태 자체를 변형하도록 허용해야 한다.
- 이 논문은 AVO(Agentic Variation Operators)를 제안한다. AVO는 다음과 같은 특징을 지닌다.
	- 주어진 환경적 요소 이용 가능 (e.g., 이전 해법들, 지식 베이스, 평가 도구)
	- 독립적으로 워크플로우 결정 (e.g., 수정 대상과 시점, 평가 대상과 시점)
- AVO의 유용성을 보이기 위해 Blackwell B200 GPU 위에서의 multi-head attention 커널 최적화에 적용한다. AVO가 7일이 넘는 자가 개선 이후에 찾아낸 해법은 cuDNN 대비 3.5%, FlashAttention-4 대비 10.5% 개선되었다. (i.e., 1668 TFLOPS at BF16 정밀도) 또한, 이 해법은 MHA에 과적합되지 않았으며, 간단한 변형 이후에 grouped-query attention에서도 사용 가능할 정도로 일반적이었다.
### Background
#### 진화적 탐색과 변이 연산
- 진화적 탐색이란 이전의 해법-점수 쌍들을 보고 새로운 해법을 만들어내는 과정을 말한다. 새로운 해법을 만들어내는 연산을 변이 연산이라고 하며, 최근에는 LLM이 변이 연산에 자주 사용되고 있다.
- 문제는 LLM의 다양한 능력을 충분히 활용하지 못하고 변이 연산에만 사용하고 있다는 것이다. (i.e., "알아서 새로운 것 좀 만들어 봐라... 딸깍...")
#### 현대적 GPU 위에서의 어텐션 커널
- 어텐션은 입력 길이 N에 따라 연산량이 이차적으로 증가한다. 왜냐하면 N x N 행렬을 계산해야 하기 때문.
- FlashAttention은 이 연산을 GPU에서 효율적으로 수행하기 위해 행렬을 타일로 쪼개어서 연산하는 방법을 선택했다. 


---

## 코멘트

- ...

---

## 배운 점

- ...

---

## 다음 읽을 것

- ...

---

#template

<!-- 발행 전 체크리스트
  - 파일 이름: content/papers/<slug>.ko.md — 영문 소문자·하이픈
  - type: paper (폴더와 일치), title·description 채우기
  - 마지막 줄에 인라인 #태그 (스네이크케이스, 예: #world_model #llm)
  - .en.md 번역 쌍 작성
  - publish: true로 바꾸면 발행 (기본 false — dev에서만 보임)
-->
