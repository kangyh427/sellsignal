'use client';
// ============================================
// useBuffettIndicator v2 - 버핏지수 데이터 훅
// 경로: src/hooks/useBuffettIndicator.ts
// 세션 40C: 캘리브레이션 방식 API에 맞게 수정
// ============================================

import { useState, useEffect, useCallback, useRef } from 'react';

// ── 타입 정의 ──
export interface BuffettCountryData {
  ratio: number;
  label: string;
  indexLevel: number;
  indexName: string;          // 'S&P 500' | 'KOSPI'
  calibrationDate: string;   // 기준점 날짜 (YYYY-MM-DD)
  source: string;
  sourceUrl?: string;
  isFallback: boolean;
}

interface BuffettIndicatorState {
  korea: BuffettCountryData;
  usa: BuffettCountryData;
  isLoading: boolean;
  error: string | null;
  updatedAt: string | null;
  note: string | null;
}

// ── 폴백 데이터 ──
const FALLBACK_KOREA: BuffettCountryData = {
  ratio: 182,
  label: '극단적 고평가',
  indexLevel: 5089,
  indexName: 'KOSPI',
  calibrationDate: '2026-02-07',
  source: 'fallback',
  isFallback: true,
};

const FALLBACK_USA: BuffettCountryData = {
  ratio: 223,
  label: '극단적 고평가',
  indexLevel: 6083,
  indexName: 'S&P 500',
  calibrationDate: '2026-02-06',
  source: 'fallback',
  isFallback: true,
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
    note: null,
  });

  const isFetchingRef = useRef(false);

  const fetchData = useCallback(async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const res = await fetch('/api/buffett-indicator');
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const data = await res.json();

      setState({
        korea: {
          ratio: data.korea?.ratio ?? FALLBACK_KOREA.ratio,
          label: data.korea?.label ?? FALLBACK_KOREA.label,
          indexLevel: data.korea?.indexLevel ?? FALLBACK_KOREA.indexLevel,
          indexName: data.korea?.indexName ?? 'KOSPI',
          calibrationDate: data.korea?.calibrationDate ?? FALLBACK_KOREA.calibrationDate,
          source: data.korea?.source ?? 'unknown',
          sourceUrl: data.korea?.sourceUrl,
          isFallback: data.korea?.isFallback ?? false,
        },
        usa: {
          ratio: data.usa?.ratio ?? FALLBACK_USA.ratio,
          label: data.usa?.label ?? FALLBACK_USA.label,
          indexLevel: data.usa?.indexLevel ?? FALLBACK_USA.indexLevel,
          indexName: data.usa?.indexName ?? 'S&P 500',
          calibrationDate: data.usa?.calibrationDate ?? FALLBACK_USA.calibrationDate,
          source: data.usa?.source ?? 'unknown',
          sourceUrl: data.usa?.sourceUrl,
          isFallback: data.usa?.isFallback ?? false,
        },
        isLoading: false,
        error: null,
        updatedAt: data.updatedAt ?? new Date().toISOString(),
        note: data.note ?? null,
      });
    } catch (err) {
      console.error('BuffettIndicator fetch error:', err);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: '버핏지수 데이터를 불러올 수 없습니다',
      }));
    } finally {
      isFetchingRef.current = false;
    }
  }, []);

  useEffect(() => {
    fetchData();
    const intervalId = setInterval(fetchData, REFRESH_INTERVAL);
    return () => clearInterval(intervalId);
  }, [fetchData]);

  const refresh = useCallback(() => { fetchData(); }, [fetchData]);

  return { ...state, refresh };
}
