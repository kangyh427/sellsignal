// ============================================
// src/utils/index.ts
// 유틸리티 함수 모음
// ============================================

import type { Position, PriceData } from '../types';

/**
 * 모의 가격 데이터 생성
 * 원본 JSX 108~121줄 기반
 * 캔들 차트용 OHLCV 데이터를 days일치 생성합니다.
 */
export const generateMockPriceData = (basePrice: number, days: number = 60): PriceData[] => {
  const data: PriceData[] = [];
  let price = basePrice;
  for (let i = 0; i < days; i++) {
    const change = (Math.random() - 0.47) * basePrice * 0.025;
    price = Math.max(price + change, basePrice * 0.7);
    const high = price * (1 + Math.random() * 0.02);
    const low = price * (1 - Math.random() * 0.02);
    const open = low + Math.random() * (high - low);
    const close = low + Math.random() * (high - low);
    data.push({
      date: new Date(Date.now() - (days - i) * 86400000),
      open,
      high,
      low,
      close,
      volume: Math.floor(Math.random() * 1000000 + 500000),
    });
  }
  return data;
};

/**
 * 종목 검색 (로컬 목록에서)
 * 원본 JSX 123~127줄 기반
 */
export const searchStocks = (query: string, stockList: Array<{ name: string; code: string }>) => {
  if (!query || query.trim().length === 0) return [];
  const q = query.trim().toLowerCase();
  return stockList
    .filter(stock => stock.name.toLowerCase().includes(q) || stock.code.includes(q))
    .slice(0, 10);
};

/**
 * 정확한 종목 찾기
 * 원본 JSX 129~132줄 기반
 */
export const findExactStock = (query: string, stockList: Array<{ name: string; code: string }>) => {
  if (!query) return null;
  return stockList.find(
    stock =>
      stock.name === query ||
      stock.code === query ||
      stock.name.toLowerCase() === query.toLowerCase()
  );
};

/**
 * 매도가 계산 (프리셋별)
 * 원본 JSX 134~151줄 기반
 */
export const calculateSellPrices = (
  position: Position,
  priceData: PriceData[] | undefined,
  presetSettings?: Record<string, { value: number }>
): Record<string, number> => {
  const prices: Record<string, number> = {};

  // 손절 기준가
  prices.stopLoss = Math.round(
    position.buyPrice * (1 + (presetSettings?.stopLoss?.value || -5) / 100)
  );

  // 2/3 익절가
  if (position.highestPrice) {
    prices.twoThird = Math.round(
      position.highestPrice - (position.highestPrice - position.buyPrice) / 3
    );
  }

  // 이동평균선 기준가
  const maPeriod = presetSettings?.maSignal?.value || 20;
  if (priceData && priceData.length >= maPeriod) {
    prices.maSignal = Math.round(
      priceData.slice(-maPeriod).reduce((sum, d) => sum + d.close, 0) / maPeriod
    );
  }

  // 봉 3개 기준 (50% 되돌림)
  if (priceData && priceData.length >= 2) {
    const prevCandle = priceData[priceData.length - 2];
    if (prevCandle.close > prevCandle.open) {
      prices.candle3_50 = Math.round(
        prevCandle.close - (prevCandle.close - prevCandle.open) * 0.5
      );
    }
  }

  return prices;
};

/**
 * 실적 발표 D-Day 계산
 * 원본 JSX 153~158줄 기반
 */
export const calculateDDay = (dateStr: string): string => {
  const diff = Math.ceil(
    (new Date(dateStr).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );
  if (diff === 0) return 'D-Day';
  if (diff > 0) return `D-${diff}`;
  return `D+${Math.abs(diff)}`;
};
