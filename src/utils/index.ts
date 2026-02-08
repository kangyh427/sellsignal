// ============================================
// CREST 유틸리티 함수
// 경로: src/utils/index.ts
// ============================================

import type { CandleData } from '@/types';

/**
 * 모의 캔들 가격 데이터 생성
 * @param basePrice 매수가 기준
 * @param days 생성할 일수 (기본 60일)
 */
export const generateMockPriceData = (basePrice: number, days = 60): CandleData[] => {
  const data: CandleData[] = [];
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
      open, high, low, close,
    });
  }
  return data;
};

/**
 * 금액 축약 표시 (모바일 가독성)
 * 예: 71500000 → "7.2억", 350000 → "35만"
 */
export const formatCompact = (num: number): string => {
  const abs = Math.abs(num);
  if (abs >= 1e8) return (num / 1e8).toFixed(1) + '억';
  if (abs >= 1e4) return Math.round(num / 1e4) + '만';
  return num.toLocaleString();
};
