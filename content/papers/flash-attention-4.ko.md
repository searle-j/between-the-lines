---
title: "FlashAttention 4"
date: 2026-08-04
type: paper
publish: true
description: "IO-인지 attention 커널 4세대 — 레이아웃 확인용 목업 게시물."
---

> **목업 게시물입니다.** 목록·태그 화면 확인용 짧은 가짜 리뷰입니다.

## 요약

가상의 4세대에서는 비대칭 블록 타일링과 KV 캐시 압축을 결합해, 시퀀스 길이 1M 구간에서도 SRAM 상주율을 유지한다고 주장한다. 커널 하나의 이야기라기보다, 메모리 계층 전체를 다시 그리는 이야기에 가깝다.

## 인상

벤치마크 표가 화려하지만 재현 조건이 좁다. 다만 long-context 학습 비용 절감 폭은 인상적이다.

#attention #efficiency #systems
