// ============================================
// 매도 기준가 계산 유틸리티
// 위치: src/utils/calculateSellPrices.ts
// ============================================
// PositionCard 내부에서 추출 → 독립 유틸리티로 분리
// 다른 컴포넌트(알림 시스템, 대시보드 등)에서도 재사용 가능

import type { Position, PriceData, SellPrices, PresetSettings } from '../types';

/**
 * 포지션과 가격 데이터를 기반으로 매도 기준가격을 계산합니다.
 *
 * @param position - 포지션 정보 (매수가, 최고가 등)
 * @param priceData - 캔들차트 가격 데이터 배열
 * @param presetSettings - 사용자가 설정한 프리셋 파라미터
 * @returns SellPrices - 각 전략별 매도 기준가
 */
export const calculateSellPrices = (
  position: Position,
  priceData: PriceData[] | undefined,
  presetSettings?: PresetSettings,
): SellPrices => {
  const prices: SellPrices = {};

  // ── 1. 손절가 (손실제한 매도법) ──
  // 기본값: 매수가 대비 -5% (사용자 설정 가능)
  prices.stopLoss = Math.round(
    position.buyPrice * (1 + (presetSettings?.stopLoss?.value || -5) / 100),
  );

  // ── 2. 2/3 익절가 (익절 매도법) ──
  // 최고가에서 수익의 1/3을 반납한 지점
  const highestPrice = position.highestPrice || position.highestPriceRecorded;
  if (highestPrice) {
    prices.twoThird = Math.round(
      highestPrice - (highestPrice - position.buyPrice) / 3,
    );
  }

  // ── 3. 이동평균선 기준가 ──
  // 기본 20일 이동평균 (사용자 설정 가능)
  const maPeriod = presetSettings?.maSignal?.value || 20;
  if (priceData && priceData.length >= maPeriod) {
    prices.maSignal = Math.round(
      priceData.slice(-maPeriod).reduce((sum, d) => sum + d.close, 0) / maPeriod,
    );
  }

  // ── 4. 봉3개 매도법 (50% 기준) ──
  // 직전 양봉의 50% 하회 시 절반 매도 기준가
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

export default calculateSellPrices;
