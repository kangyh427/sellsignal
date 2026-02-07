// ============================================
// 유틸리티 함수 (utils/index.ts)
// 위치: src/utils/index.ts
// ============================================
// ✅ 모든 함수에 TypeScript 타입 시그니처 적용
// ✅ 순수 함수로 작성 (사이드 이펙트 없음)
// ✅ 원본 JSX 라인 108~158 기반

import type { ChartDataPoint, Position, PresetSettings, SellPrices, Stock } from '../types';
import { STOCK_LIST } from '../constants';

// ── 모의 가격 데이터 생성 (캔들차트용) ──
// 원본 JSX 라인 108~121
export const generateMockPriceData = (basePrice: number, days: number = 60): ChartDataPoint[] => {
  const data: ChartDataPoint[] = [];
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

// ── 종목 검색 (이름 또는 코드로 필터) ──
// 원본 JSX 라인 123~127
export const searchStocks = (query: string): Stock[] => {
  if (!query || query.trim().length === 0) return [];
  const q = query.trim().toLowerCase();
  return STOCK_LIST.filter(
    (stock) => stock.name.toLowerCase().includes(q) || stock.code.includes(q)
  ).slice(0, 10);
};

// ── 정확한 종목 찾기 (이름 또는 코드 일치) ──
// 원본 JSX 라인 129~132
export const findExactStock = (query: string): Stock | null => {
  if (!query) return null;
  return (
    STOCK_LIST.find(
      (stock) =>
        stock.name === query ||
        stock.code === query ||
        stock.name.toLowerCase() === query.toLowerCase()
    ) ?? null
  );
};

// ── 매도가격 계산 (포지션 + 차트데이터 기반) ──
// 원본 JSX 라인 134~151
export const calculateSellPrices = (
  position: Position,
  priceData: ChartDataPoint[] | undefined,
  presetSettings?: PresetSettings
): SellPrices => {
  const prices: SellPrices = {};

  // 손절가: 매수가 × (1 + 손절비율%)
  prices.stopLoss = Math.round(
    position.buyPrice * (1 + (presetSettings?.stopLoss?.value || -5) / 100)
  );

  // 2/3 익절가: 최고가 - (최고가-매수가)/3
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

  // 3봉 매도법 기준가: 직전 양봉의 50% 지점
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

// ── D-Day 계산 (실적발표일 등) ──
// 원본 JSX 라인 153~158
export const calculateDDay = (dateStr: string): string => {
  const diff = Math.ceil(
    (new Date(dateStr).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );
  if (diff === 0) return 'D-Day';
  if (diff > 0) return `D-${diff}`;
  return `D+${Math.abs(diff)}`;
};

// ── 숫자 포맷 (원 단위, 콤마 포함) ──
export const formatKRW = (value: number): string => {
  if (Math.abs(value) >= 100000000) {
    return `${(value / 100000000).toFixed(1)}억`;
  }
  if (Math.abs(value) >= 10000) {
    return `${(value / 10000).toFixed(0)}만`;
  }
  return value.toLocaleString('ko-KR');
};

// ── 수익률 포맷 (+/-% 표시) ──
export const formatProfitRate = (rate: number): string => {
  const sign = rate >= 0 ? '+' : '';
  return `${sign}${rate.toFixed(2)}%`;
};

// ── 수익률 기반 색상 반환 ──
export const getProfitColor = (rate: number): string => {
  if (rate > 0) return '#ef4444';   // 상승 = 빨강 (한국식)
  if (rate < 0) return '#3b82f6';   // 하락 = 파랑 (한국식)
  return '#64748b';                  // 보합 = 회색
};
