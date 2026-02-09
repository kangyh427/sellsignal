'use client';
// ============================================
// useBuffettIndicator - 버핏지수 데이터 훅
// 경로: src/hooks/useBuffettIndicator.ts
// 세션 40: 실데이터 연동
// ============================================
//
// 기능:
//   - /api/buffett-indicator 호출하여 한미 버핏지수 조회
//   - 1시간 간격 자동 갱신
//   - 로딩/에러/마지막 갱신 시각 관리
//   - API 실패 시 폴백값 유지
//
// 사용법:
//   const { korea, usa, isLoading, error, updatedAt, refresh } = useBuffettIndicator();
// ============================================

import { useState, useEffect, useCallback, useRef } from 'react';

// ── 타입 정의 ──
export interface BuffettCountryData {
  ratio: number;
  label: string;
  marketCap: number;
  gdp: number;
  indexLevel: number | null;
  gdpYear?: number;
  source: string;
}

interface BuffettIndicatorState {
  korea: BuffettCountryData;
  usa: BuffettCountryData;
  isLoading: boolean;
  error: string | null;
  updatedAt: string | null;
  gdpNote: string | null;
}

// ── 폴백 데이터 (API 실패 시) ──
const FALLBACK_KOREA: BuffettCountryData = {
  ratio: 98,
  label: '적정 수준',
  marketCap: 2200,
  gdp: 2236,
  indexLevel: null,
  source: 'fallback',
};

const FALLBACK_USA: BuffettCountryData = {
  ratio: 188,
  label: '극단적 고평가',
  marketCap: 55000,
  gdp: 29200,
  indexLevel: null,
  source: 'fallback',
};

// ── 갱신 주기: 1시간 ──
const REFRESH_INTERVAL = 60 * 60 * 1000;

export default function useBuffettIndicator() {
  const [state, setState] = useState<BuffettIndicatorState>({
    korea: FALLBACK_KOREA,
    usa: FALLBACK_USA,
    isLoading: true,
    error: null,
    updatedAt: null,
    gdpNote: null,
  });

  const isFetchingRef = useRef(false);

  // ── API 호출 ──
  const fetchData = useCallback(async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const res = await fetch('/api/buffett-indicator', {
        // 클라이언트 사이드 캐시: 30분
        cache: 'default',
      });

      if (!res.ok) {
        throw new Error(`API error: ${res.status}`);
      }

      const data = await res.json();

      setState({
        korea: {
          ratio: data.korea?.ratio ?? FALLBACK_KOREA.ratio,
          label: data.korea?.label ?? FALLBACK_KOREA.label,
          marketCap: data.korea?.marketCap ?? FALLBACK_KOREA.marketCap,
          gdp: data.korea?.gdp ?? FALLBACK_KOREA.gdp,
          indexLevel: data.korea?.indexLevel ?? null,
          gdpYear: data.korea?.gdpYear,
          source: data.korea?.source ?? 'unknown',
        },
        usa: {
          ratio: data.usa?.ratio ?? FALLBACK_USA.ratio,
          label: data.usa?.label ?? FALLBACK_USA.label,
          marketCap: data.usa?.marketCap ?? FALLBACK_USA.marketCap,
          gdp: data.usa?.gdp ?? FALLBACK_USA.gdp,
          indexLevel: data.usa?.indexLevel ?? null,
          gdpYear: data.usa?.gdpYear,
          source: data.usa?.source ?? 'unknown',
        },
        isLoading: false,
        error: null,
        updatedAt: data.updatedAt ?? new Date().toISOString(),
        gdpNote: data.gdpNote ?? null,
      });
    } catch (err) {
      console.error('BuffettIndicator fetch error:', err);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: '버핏지수 데이터를 불러올 수 없습니다',
        // 기존 데이터 유지 (에러 시 폴백)
      }));
    } finally {
      isFetchingRef.current = false;
    }
  }, []);

  // ── 초기 로드 + 1시간 간격 갱신 ──
  useEffect(() => {
    fetchData();

    const intervalId = setInterval(fetchData, REFRESH_INTERVAL);
    return () => clearInterval(intervalId);
  }, [fetchData]);

  // ── 수동 새로고침 ──
  const refresh = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return {
    ...state,
    refresh,
  };
}
