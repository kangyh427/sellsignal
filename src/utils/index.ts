// ============================================
// 유틸리티 함수
// 위치: src/utils/index.ts
// ============================================
// 원본: sell-signal-app-responsive.jsx 108~150줄 기반
// generateMockPriceData, searchStocks, findExactStock

import type { ChartDataPoint, Stock } from '../types';
import { STOCK_LIST } from '../constants';

// ── 모의 가격 데이터 생성 ──
// 종목의 매수가를 기준으로 60일치 캔들 데이터를 생성합니다.
// 실제 API 연동 전까지 데모 용도로 사용합니다.
export const generateMockPriceData = (
  basePrice: number,
  days: number = 60,
): ChartDataPoint[] => {
  const data: ChartDataPoint[] = [];
  let price = basePrice;

  for (let i = 0; i < days; i++) {
    // 약간의 상승 편향 (0.47이 아닌 0.48 → 장기적으로 우상향)
    const change = (Math.random() - 0.47) * basePrice * 0.025;
    price = Math.max(price + change, basePrice * 0.7); // 최저 -30% 제한

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

// ── 종목 검색 (자동완성용) ──
export const searchStocks = (query: string): Stock[] => {
  if (!query || query.trim().length === 0) return [];
  const q = query.trim().toLowerCase();
  return STOCK_LIST.filter(
    (stock) =>
      stock.name.toLowerCase().includes(q) || stock.code.includes(q),
  ).slice(0, 10);
};

// ── 정확한 종목 찾기 ──
export const findExactStock = (query: string): Stock | undefined => {
  if (!query) return undefined;
  return STOCK_LIST.find(
    (stock) =>
      stock.name === query ||
      stock.code === query ||
      stock.name.toLowerCase() === query.toLowerCase(),
  );
};

// ── 가격 포맷 (원화, 콤마 포함) ──
export const formatPrice = (price: number): string => {
  return Math.round(price).toLocaleString('ko-KR');
};

// ── 수익률 포맷 ──
export const formatProfitRate = (rate: number): string => {
  const sign = rate >= 0 ? '+' : '';
  return `${sign}${rate.toFixed(2)}%`;
};

// ── 날짜 포맷 (월/일) ──
export const formatDate = (date: Date | string): string => {
  const d = new Date(date);
  return `${d.getMonth() + 1}/${d.getDate()}`;
};

// ── 시간 경과 표시 (알림용) ──
export const formatTimeAgo = (timestamp: number): string => {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return '방금 전';
  if (minutes < 60) return `${minutes}분 전`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간 전`;
  return `${Math.floor(hours / 24)}일 전`;
};
