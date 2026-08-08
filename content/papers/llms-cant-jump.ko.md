---
title: "LLMs Can't Jump"
date: 2026-08-08
type: paper
tags:
  - reasoning
  - world-model
description: "상태 공간 도약 과제로 LLM의 외삽 한계를 측정한 (가상의) 논문 리뷰 — 레이아웃 확인용 목업 게시물."
---

> **목업 게시물입니다.** 레이아웃 확인용으로 만든 가짜 리뷰이며, 실제 논문이 아닙니다. 확인이 끝나면 이 파일(`.ko.md`/`.en.md`)과 `assets/llms-cant-jump/`를 삭제하세요.

## 서지

| 항목 | 내용                              |
| ---- | --------------------------------- |
| 저자 | J. Doe, A. Nonymous               |
| 발표 | ICML 2026 (가상)                  |
| 코드 | [github.com/example/jump-bench](https://github.com/example/jump-bench) |

## 요약

저자들은 LLM이 학습 분포 안에서의 보간(interpolation)에는 강하지만, 상태 공간을 불연속적으로 건너뛰어야 하는 **도약(jump)** 과제에서는 성능이 급락한다고 주장한다. 격자 세계(grid world)의 궤적을 텍스트로 학습시킨 뒤, 학습 궤적에서 벗어난 상태로의 전이를 예측하게 하는 실험 설계가 핵심이다.

다음 상태 예측은 표준적인 attention 집계로 이루어진다.

$$
p_\theta(s_{t+1} \mid s_{\le t}) = \mathrm{softmax}\!\left(\frac{QK^\top}{\sqrt{d_k}}\right)V
$$

저자들은 목표 상태 $s_{t+1}$이 학습 궤적의 $\varepsilon$-근방을 벗어나는 순간 예측 정확도가 급격히 떨어지며, 그 하락 폭이 모델 크기와 거의 무관하다는 것을 보인다. 시퀀스 길이에 대한 계산 비용이 $O(n^2)$이라는 익숙한 제약과는 별개의, 표상 수준의 한계라는 주장이다.

![그림 1. 학습 매니폴드 안의 보간과 매니폴드 밖으로의 도약 (목업 도식)](../../assets/llms-cant-jump/figure-1.svg)

## 실험 프로토콜

평가 루프는 대략 다음 구조다.

```python
def evaluate_jump(model, world, horizon: int = 32) -> float:
    """Roll out the model and score it on out-of-manifold jumps."""
    state = world.reset()
    hits = 0
    for _ in range(horizon):
        pred = model.predict(state)
        state = world.step()
        hits += int(pred == state)
    return hits / horizon
```

보간 구간과 도약 구간을 나누는 기준은 `world.step()`이 반환하는 상태가 학습 셋 궤적과 얼마나 떨어져 있는지로 정의된다. 인라인 코드는 `evaluate_jump(model, world)`처럼 렌더링된다.

## 인상

> 흥미로운 것은 실패의 '방식'이다. 모델은 도약 지점에서 무작위로 틀리는 것이 아니라, 가장 가까운 학습 궤적으로 조용히 되돌아간다.

- 과제 설계가 깔끔하고, 벤치마크와 재현 스크립트가 공개되어 있다[^1].
- 다만 "world model의 부재"라는 결론은 측정 범위를 넘어선다. 실험이 보여주는 것은 외삽 실패이지, 내부 표상의 부재가 아니다.
- 후속으로 궤적 밖 상태를 명시적으로 섞어 학습시키는 ablation이 있었으면 좋았을 것이다.

관련 리뷰: [사탄탱고](../books/satantango.ko.md) — 내부 링크가 사이트 주소로 변환되는지 확인하는 링크입니다.

[^1]: 각주 렌더링 확인용 각주. 공개 코드 주소도, 이 논문도 실재하지 않는다.
