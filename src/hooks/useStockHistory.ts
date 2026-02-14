'use client';
// ============================================
// useStockHistory - 과거 차트 데이터 조회 훅
// 경로: src/hooks/useStockHistory.ts
// 세션 22A: Yahoo Finance 과거 OHLCV → CandleData[]
// 세션 61: volume 데이터 포함 + 자동 갱신 로직 보강
// 세션 62: 60일→90일 (3개월 차트)
// ============================================

import { useState, useEffect, useCallback, useRef } from 'react';
import type { Position, CandleData } from '@/types';

// ★ 세션 62: 3개월 차트를 위해 90일로 변경
const DEFAULT_DAYS = 90;

export default function useStockHistory(positions: Position[]) {
  // position.id → CandleData[] 매핑
  const [historyMap, setHistoryMap] = useState<Record<number, CandleData[]>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 이미 fetch한 종목코드 추적 (중복 방지)
  const fetchedCodesRef = useRef<Set<string>>(new Set());
  const isFetchingRef = useRef(false);

  // ── 단일 종목 과거 데이터 조회 ──
  const fetchHistory = useCallback(
    async (code: string): Promise<CandleData[]> => {
      try {
        // 한국/미국 자동 판별
        const market = /^\d{6}$/.test(code) ? 'KR' : 'US';
        const res = await fetch(
          `/api/stocks/history?code=${code}&days=${DEFAULT_DAYS}&market=${market}`
        );

        if (!res.ok) {
          console.error(`History API error for ${code}: ${res.status}`);
          return [];
        }

        const data = await res.json();
        if (!data.candles || data.candles.length === 0) return [];

        // ★ volume 데이터 반드시 포함
        return data.candles.map((c: any) => ({
          date: new Date(c.date),
          open: c.open,
          high: c.high,
          low: c.low,
          close: c.close,
          volume: c.volume || 0,
        }));
      } catch (err) {
        console.error(`History fetch error for ${code}:`, err);
        return [];
      }
    },
    []
  );

  // ── positions 변경 시 새 종목만 fetch ──
  useEffect(() => {
    if (positions.length === 0) return;
    if (isFetchingRef.current) return;

    // 아직 fetch하지 않은 포지션 필터링
    const newPositions = positions.filter(
      (p) => !fetchedCodesRef.current.has(p.code)
    );

    if (newPositions.length === 0) return;

    isFetchingRef.current = true;
    setIsLoading(true);
    setError(null);

    const loadAll = async () => {
      try {
        // 병렬 조회 (최대 5개씩)
        const results: { id: number; code: string; data: CandleData[] }[] = [];

        for (let i = 0; i < newPositions.length; i += 5) {
          const batch = newPositions.slice(i, i + 5);
          const batchResults = await Promise.all(
            batch.map(async (p) => ({
              id: p.id,
              code: p.code,
              data: await fetchHistory(p.code),
            }))
          );
          results.push(...batchResults);
        }

        // 상태 업데이트
        setHistoryMap((prev) => {
          const updated = { ...prev };
          results.forEach(({ id, code, data }) => {
            if (data.length > 0) {
              updated[id] = data;
              fetchedCodesRef.current.add(code);
            }
          });
          return updated;
        });
      } catch (err) {
        console.error('History batch error:', err);
        setError('차트 데이터 조회에 실패했습니다');
      } finally {
        setIsLoading(false);
        isFetchingRef.current = false;
      }
    };

    loadAll();
  }, [positions, fetchHistory]);

  // ── 특정 종목 수동 새로고침 ──
  const refreshOne = useCallback(
    async (position: Position) => {
      const data = await fetchHistory(position.code);
      if (data.length > 0) {
        setHistoryMap((prev) => ({ ...prev, [position.id]: data }));
        fetchedCodesRef.current.add(position.code);
      }
    },
    [fetchHistory]
  );

  // ── 전체 새로고침 ──
  const refreshAll = useCallback(() => {
    fetchedCodesRef.current.clear();
    setHistoryMap({});
  }, []);

  return {
    historyMap,
    isLoading,
    error,
    refreshOne,
    refreshAll,
  };
}
