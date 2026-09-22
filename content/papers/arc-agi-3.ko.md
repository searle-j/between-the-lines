---
title: ""
date: 2026-09-21
type: paper
publish: false
description: ""
---
## 서지 정보

- 제목: ARC-AGI-3: A New Challenge for Frontier Agentic Intelligence
- 저자: Hunter Henry, David Wexler, Derek Smith, Benjamin Morgan, Vadym Andriianov, Fraser Scott, Pablo Romero Saavedra, Jonathan Pappas, Flynn Swainston-Calcutt, Tom Elliot, Kevin Johnson, Bryan Landers, Gregory Kamradt, Mike Knoop, François Chollet
- 기관: ARC Prize Foundation
- 발표 / 출판: arXiv
- 출판 연도: 2026
- 링크 / 코드·데이터:
	- 논문: https://arxiv.org/abs/2603.24621
	- 리더보드: https://arcprize.org/leaderboard
	- 문제 직접 풀어보기: https://arcprize.org/tasks

---

## 세 줄 요약

![그림 1](../../assets/arc-agi-3/figure-1.png)

- ...

---

## 요약

### 과거의 ARC-AGI
#### ARC-AGI-1 과 2
- ARC-AGI 시리즈는 지식의 양이 아닌 지식을 습득하는 능력 자체를 측정하기 위해 만들어졌다. 다시 말해, 이 시리즈는 결정지능이 아닌 유동지능을 측정한다. *(작성자 주. 결정지능(crystallized intelligence)은 축적된 지식과 경험을 활용하는 능력이고, 유동지능(fluid intelligence)은 기존 지식에 덜 의존해 새로운 문제를 추론하고 해결하는 능력이다.)*
- ARC-AGI-1은 단순 암기를 통한 지름길 발견을 방지하는 것을 최우선 목표로 2019년에 제작되었다.
- ARC-AGI-2는 더욱 복잡한 문제 해결 능력(e.g., 다단계 추론, 다수 규칙 적용)을 측정하기 위해 설계되었으며 2025년에 공개되었다.
#### ARC-AGI-1과 2에서의 주요 발견
- LLM 기반 시스템들이 유동지능을 조금이라도 보이기 시작한 계기는 test-time reasoning이다. 추론 시점에서 더 길게 사고하는 GPT-o3 같은 시스템은 LRM(Large Reasoning Model)이라는 새로운 패러다임을 열며 AI 능력 향상에 박차를 가하고 있다.
- 그러나 LRM은 두 가지 한계를 지닌다.
	- 모델이 보유한 도메인 지식에 의존하여 문제 해결
	- 도메인 환경이 모델에게 정확한 피드백을 줄 수 있을 때에만 동작 (e.g., 코딩 문제)
- 이 때문에 LLM은 '들쭉날쭉한 지능'이라고 불리곤 한다. 즉, 여러 도메인들에서 비일관적인 능력을 보인다는 것이다.
- 이대로라면 LRM의 성능을 전반적으로 향상시키기 위해서는 수많은 도메인들을 각개 격파 해야 한다. 따라서 LRM은 일반화된 학습 능력을 지닌 일반지능이라고 보기 어렵다.
	- 반면 인간의 추론 능력은 도메인 지식이 없고 정확한 피드백이 없더라도 동작한다.
- 그렇다면 AI들은 일반지능이 거의 없음에도 불구하고 어떻게 ARC 문제를 해결하는가? 저자들은 이러한 문제 해결 능력이 ARC와 유사한 문제들을 대량으로 생성하여 학습시킨 결과라고 본다. 즉, AI들은 순수한 추론이 아닌 암기를 통해 ARC를 풀고 있다.
	- 하나의 증거로, Gemini 3는 어떤 ARC 문제에서 초록색을 3, 빨간색을 6에 대응시켰다. 이 대응 관계는 해법에만 있고 문제에서는 찾을 수 없는 정보이다.
- 결론: 비공개 벤치마크 문제는 철저하게 공개 문제들의 OOD (out-of-distribution) 이어야 한다.
### ARC-AGI-3
#### 목표
- ARC의 최우선 목표는 인간지능과 현재의 인공지능 사이의 간극을 포착하는 것이다. 그런데 AI는 계속 발전하고 있으므로 우리가 포착하고자 하는 간극은 계속 변동할 것이다. 그러므로 ARC가 겨냥하는 '간극'은 매 버전 달라질 것이다.
- ARC-AGI-3의 목표는 '환경과 상호작용하는 멀티턴 추론 능력'이다. 이는 아래 네 가지 기능적 요소로 나뉘어 측정된다.
	- 탐색: 능동적으로 환경을 탐색하여 필요한 정보를 획득
	- 모형화: 개별 관측치에서 일반화된 경향을 추출
	- 목표 설정: 명시적인 지시가 없어도 주어진 환경을 보고 자체적으로 목표를 설정
	- 계획과 수행: 수행 과정에서 새롭게 발견한 정보를 바탕으로 계획을 수정하며 진행
- 이 네 가지 요소를 잘 측정하기 위한 전략으로서, ARC-AGI-3는 AI에게 목표나 지시 사항을 명시적으로 제공하지 않는다.
- 또한, ARC-AGI-3에서는 지능을 효율성 측면에서 정의한다. 위의 네 가지 능력이 얼마나 효율적인지 평가하기 위해 아래와 같은 장치를 둔다.
	- brute-force 같은 무차별적 시도는 감점; 반대로 적은 시도로 문제를 맞히면 높은 점수
	- 인간 참가자의 결과를 효율성의 베이스라인으로 제공
- 




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
