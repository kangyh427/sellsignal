'use client';
// ============================================
// useStockPrices - 실시간 주가 조회 훅
// 경로: src/hooks/useStockPrices.ts
// 세션 21: Yahoo Finance API 연동
// ============================================
//
// 기능:
//   - positions 배열에서 종목코드 추출 → /api/stocks/price 호출
//   - 60초 간격 자동 갱신 (장 운영시간만)
//   - 장 마감 시 5분 간격으로 변경
//   - 로딩/에러/마지막 갱신 시각 상태 관리
// ============================================

import { useState, useEffect, useCallback, useRef } from 'react';
import type { Position, StockPrice } from '@/types';

// ── 설정 상수 ──
const REFRESH_INTERVAL_MARKET_OPEN = 60 * 1000;   // 장 중: 60초
const REFRESH_INTERVAL_MARKET_CLOSED = 5 * 60 * 1000; // 장 마감: 5분

/**
 * 한국 장 운영시간 체크 (KST 09:00 ~ 15:30)
 * - 주말(토/일) 제외
 * - 공휴일은 미체크 (추후 보강 가능)
 */
function isKoreanMarketOpen(): boolean {
  const now = new Date();
  // KST = UTC + 9
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  const utcDay = kst.getUTCDay();
  const utcHour = kst.getUTCHours();
  const utcMin = kst.getUTCMinutes();

  // 주말 체크
  if (utcDay === 0 || utcDay === 6) return false;

  // 09:00 ~ 15:30 (KST 기준, UTC로 변환하지 않고 직접 체크)
  const totalMin = utcHour * 60 + utcMin;
  return totalMin >= 540 && totalMin <= 930; // 540 = 9*60, 930 = 15*60+30
}

// ── 메인 훅 ──
export default function useStockPrices(positions: Position[]) {
  const [prices, setPrices] = useState<Record<string, StockPrice>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);

  // 중복 호출 방지용 ref
  const isFetchingRef = useRef(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // ── 주가 조회 함수 ──
  const fetchPrices = useCallback(async () => {
    // positions 없으면 스킵
    if (positions.length === 0) return;
    // 이미 호출 중이면 스킵
    if (isFetchingRef.current) return;

    isFetchingRef.current = true;
    setIsLoading(true);
    setError(null);

    try {
      // 종목코드 추출 (중복 제거)
      const codes = [...new Set(positions.map((p) => p.code))];

      // TODO: 미국 주식 분리 처리 (현재는 한국만)
      // 한국 주식과 미국 주식을 code 패턴으로 구분 가능
      // 한국: 숫자 6자리, 미국: 알파벳
      const krCodes = codes.filter((c) => /^\d{6}$/.test(c));
      const usCodes = codes.filter((c) => /^[A-Z]+$/.test(c));

      const allPrices: Record<string, StockPrice> = {};

      // 한국 주식 조회
      if (krCodes.length > 0) {
        const krRes = await fetch(
          `/api/stocks/price?codes=${krCodes.join(',')}&market=KR`
        );
        if (krRes.ok) {
          const krData = await krRes.json();
          Object.assign(allPrices, krData.prices || {});
        }
      }

      // 미국 주식 조회
      if (usCodes.length > 0) {
        const usRes = await fetch(
          `/api/stocks/price?codes=${usCodes.join(',')}&market=US`
        );
        if (usRes.ok) {
          const usData = await usRes.json();
          Object.assign(allPrices, usData.prices || {});
        }
      }

      // 결과가 있으면 상태 업데이트
      if (Object.keys(allPrices).length > 0) {
        setPrices((prev) => ({ ...prev, ...allPrices }));
        setLastUpdated(Date.now());
      } else if (krCodes.length + usCodes.length > 0) {
        // 조회 시도했는데 결과 0 → 에러는 아니지만 로그
        console.warn('No prices returned from API');
      }
    } catch (err) {
      console.error('Price fetch error:', err);
      setError('주가 조회에 실패했습니다');
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  }, [positions]);

  // ── 초기 로드 + 주기적 갱신 ──
  useEffect(() => {
    // 포지션 없으면 정리
    if (positions.length === 0) {
      setPrices({});
      setLastUpdated(null);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // 첫 로드
    fetchPrices();

    // 주기적 갱신 설정
    const setupInterval = () => {
      if (intervalRef.current) clearInterval(intervalRef.current);

      const interval = isKoreanMarketOpen()
        ? REFRESH_INTERVAL_MARKET_OPEN
        : REFRESH_INTERVAL_MARKET_CLOSED;

      intervalRef.current = setInterval(() => {
        fetchPrices();
      }, interval);
    };

    setupInterval();

    // 5분마다 장 운영시간 재체크 → 인터벌 조정
    const marketCheckInterval = setInterval(setupInterval, 5 * 60 * 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      clearInterval(marketCheckInterval);
    };
  }, [fetchPrices, positions.length]);

  // ── 특정 종목의 현재가 가져오기 (편의 함수) ──
  const getPrice = useCallback(
    (code: string): StockPrice | null => {
      return prices[code] || null;
    },
    [prices]
  );

  // ── 특정 종목의 현재가 숫자만 가져오기 ──
  const getCurrentPrice = useCallback(
    (code: string, fallback?: number): number => {
      return prices[code]?.price ?? fallback ?? 0;
    },
    [prices]
  );

  // ── 수동 새로고침 ──
  const refresh = useCallback(() => {
    fetchPrices();
  }, [fetchPrices]);

  return {
    prices,        // Record<종목코드, StockPrice>
    isLoading,     // 로딩 중 여부
    error,         // 에러 메시지
    lastUpdated,   // 마지막 갱신 시각 (Date.now())
    getPrice,      // (code) => StockPrice | null
    getCurrentPrice, // (code, fallback?) => number
    refresh,       // 수동 새로고침
  };
}
