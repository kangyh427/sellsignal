// ============================================
// 매도가 계산 유틸리티
// 위치: src/utils/calculateSellPrices.ts
// ============================================
// 원본: sell-signal-app-responsive.jsx 134~150줄 기반
// 각 매도법별 기준가를 계산합니다.

import type { Position, ChartDataPoint, SellPrices } from '../types';

export const calculateSellPrices = (
  position: Position,
  priceData: ChartDataPoint[] | undefined,
  presetSettings?: Record<string, { value: number }>,
): SellPrices => {
  const prices: SellPrices = {};
  const settings = presetSettings || position.presetSettings || {};

  // 1. 손절가: 매수가 × (1 + 손절비율/100)
  //    예: 매수가 71,500 × (1 + (-5)/100) = 67,925
  prices.stopLoss = Math.round(
    position.buyPrice * (1 + (settings?.stopLoss?.value || -5) / 100),
  );

  // 2. 2/3 익절가: 최고가 - (최고가 - 매수가) / 3
  //    최고 수익의 1/3이 빠졌을 때 나머지 2/3 수익을 확보
  if (position.highestPrice) {
    prices.twoThird = Math.round(
      position.highestPrice -
        (position.highestPrice - position.buyPrice) / 3,
    );
  }

  // 3. 이동평균선: 최근 N일 종가 평균
  const maPeriod = settings?.maSignal?.value || 20;
  if (priceData && priceData.length >= maPeriod) {
    prices.maSignal = Math.round(
      priceData.slice(-maPeriod).reduce((sum, d) => sum + d.close, 0) /
        maPeriod,
    );
  }

  // 4. 봉 3개 매도법 (50% 기준가): 직전 양봉의 중간값
  if (priceData && priceData.length >= 2) {
    const prevCandle = priceData[priceData.length - 2];
    if (prevCandle.close > prevCandle.open) {
      prices.candle3_50 = Math.round(
        prevCandle.close - (prevCandle.close - prevCandle.open) * 0.5,
      );
    }
  }

  return prices;
};
