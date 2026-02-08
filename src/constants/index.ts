// ============================================
// CREST 상수 정의
// 경로: src/constants/index.ts
// ============================================

import type { SellPreset, ProfitStage } from '@/types';

/** 반응형 브레이크포인트 */
export const BREAKPOINTS = {
  mobile: 480,
  tablet: 768,
  desktop: 1024,
} as const;

/** 8가지 매도 프리셋 */
export const SELL_PRESETS: Record<string, SellPreset> = {
  candle3:     { id: 'candle3',     name: '봉 3개 매도법',     icon: '📊', color: '#f59e0b' },
  stopLoss:    { id: 'stopLoss',    name: '손실제한 매도법',    icon: '🛡', color: '#ef4444' },
  twoThird:    { id: 'twoThird',    name: '2/3 익절 매도법',   icon: '📈', color: '#8b5cf6' },
  maSignal:    { id: 'maSignal',    name: '이동평균선 매도법',  icon: '📉', color: '#06b6d4' },
  volumeZone:  { id: 'volumeZone',  name: '매물대 매도법',     icon: '📍', color: '#84cc16' },
  trendline:   { id: 'trendline',   name: '추세선 매도법',     icon: '📐', color: '#ec4899' },
  fundamental: { id: 'fundamental', name: '기업가치 반전',     icon: '📰', color: '#f97316' },
  cycle:       { id: 'cycle',       name: '경기순환 매도법',    icon: '🔄', color: '#64748b' },
};

/** 수익 단계 라벨 + 색상 */
export const PROFIT_STAGES: Record<string, ProfitStage> = {
  initial:  { label: '초기 단계',              color: '#6b7280' },
  profit5:  { label: '5% 수익 구간 (5~10%)',   color: '#eab308' },
  profit10: { label: '10%+ 수익 구간',         color: '#10b981' },
};
