// ============================================
// CREST 전역 상수
// 경로: src/constants/index.ts
// 세션 22B: generateMockPriceData 제거 → 세션 27: CRESTApp 데모용으로 복원
// ============================================

import type { SellPreset, ProfitStage, CycleStage } from '@/types';

// ── 브레이크포인트 ──
export const BREAKPOINTS = {
  mobile: 480,
  tablet: 768,
  desktop: 1024,
} as const;

// ── 매도 프리셋 8종 ──
export const SELL_PRESETS: Record<string, SellPreset> = {
  candle3:      { id: 'candle3',      name: '봉 3개 매도법',     icon: '📊', color: '#f59e0b', desc: '3일 연속 하락봉 출현 시 매도' },
  stopLoss:     { id: 'stopLoss',     name: '손실제한 매도법',   icon: '🛡', color: '#ef4444', desc: '설정 손절률 도달 시 즉시 매도' },
  twoThird:     { id: 'twoThird',     name: '2/3 익절 매도법',   icon: '📈', color: '#8b5cf6', desc: '고점 대비 1/3 하락 시 매도' },
  maSignal:     { id: 'maSignal',     name: '이동평균선 매도법', icon: '📉', color: '#06b6d4', desc: '이동평균선 이탈 시 매도' },
  volumeZone:   { id: 'volumeZone',   name: '매물대 매도법',     icon: '🔍', color: '#84cc16', desc: '주요 매물대 저항선 도달 시' },
  trendline:    { id: 'trendline',    name: '추세선 매도법',     icon: '📐', color: '#ec4899', desc: '상승 추세선 이탈 시 매도' },
  fundamental:  { id: 'fundamental',  name: '기업가치 반전',     icon: '📰', color: '#f97316', desc: 'PER/PBR 과대평가 전환 시' },
  cycle:        { id: 'cycle',        name: '경기순환 매도법',   icon: '🔄', color: '#64748b', desc: '경기 사이클 고점 구간 판단 시' },
};

// ── 수익 단계 ──
export const PROFIT_STAGES: Record<string, ProfitStage> = {
  initial:  { label: '초기 단계',       color: '#6b7280' },
  profit5:  { label: '5% 수익 구간',    color: '#eab308' },
  profit10: { label: '10%+ 수익 구간',  color: '#10b981' },
};

// ── 차트 매도선 프리셋 (EnhancedMiniChart에서 사용) ──
export const CHART_LINE_PRESETS: string[] = [
  'candle3', 'stopLoss', 'twoThird', 'maSignal', 'volumeZone', 'trendline',
];

// ── 코스톨라니 달걀 6단계 (17C v6) ──
export const CYCLE_STAGES: CycleStage[] = [
  { num: 1, name: '과장국면', action: '매수', color: '#10b981', bgColor: 'rgba(16,185,129,0.1)', borderColor: 'rgba(16,185,129,0.25)', detail: '역실적장세 · 주가하락 가속', recommendation: '적극 매수 구간', desc: '금리인하 논의 시작, 가치보다 싼 주식이 널려있는 시기' },
  { num: 2, name: '조정국면', action: '매수', color: '#10b981', bgColor: 'rgba(16,185,129,0.1)', borderColor: 'rgba(16,185,129,0.25)', detail: '금융장세 · 금리인하 시작', recommendation: '매수 보유', desc: '금리고점에서 금리인하 시작, 금융장세 진입' },
  { num: 3, name: '동행국면', action: '보유', color: '#3b82f6', bgColor: 'rgba(59,130,246,0.1)', borderColor: 'rgba(59,130,246,0.25)', detail: '실적장세 · 기업실적 증가', recommendation: '보유 유지', desc: '경기 상승과 함께 실적장세 진행' },
  { num: 4, name: '과장국면', action: '매도', color: '#ef4444', bgColor: 'rgba(239,68,68,0.1)', borderColor: 'rgba(239,68,68,0.25)', detail: '역금융장세 · 금리인상 논의', recommendation: '매도 시작', desc: '가치보다 비싼 주식이 많은 시기' },
  { num: 5, name: '조정국면', action: '매도', color: '#ef4444', bgColor: 'rgba(239,68,68,0.1)', borderColor: 'rgba(239,68,68,0.25)', detail: '과열 조정 · 금리 고점 근접', recommendation: '적극 매도', desc: '금리인상 시작, 시장 과열 조정' },
  { num: 6, name: '동행국면', action: '관망', color: '#94a3b8', bgColor: 'rgba(148,163,184,0.1)', borderColor: 'rgba(148,163,184,0.25)', detail: '경기침체 · 바닥 탐색', recommendation: '관망 대기', desc: '경기 침체와 함께 하락세 지속' },
];

// ── 유틸리티 함수 ──

/** 숫자를 "억"/"만" 단위 축약 */
export const formatCompact = (v: number): string => {
  const abs = Math.abs(v);
  if (abs >= 1e8) return (v / 1e8).toFixed(1) + '억';
  if (abs >= 1e4) return (v / 1e4).toFixed(0) + '만';
  return Math.round(v).toLocaleString();
};

/**
 * 모의 주가 데이터 생성 (데모/차트 표시용)
 * - 세션 22B에서 제거되었으나, CRESTApp 데모 모드에서 필요하여 세션 27에서 복원
 * - 실제 API 연동 후에는 이 함수 대신 실시간 데이터 사용 예정
 * @param basePrice 기준 매수가
 * @param days 생성할 일 수
 * @returns 일별 OHLC 데이터 배열
 */
export const generateMockPriceData = (basePrice: number, days: number = 60): Array<{
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}> => {
  const data: Array<{
    date: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  }> = [];

  let price = basePrice;
  const now = new Date();

  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    // 랜덤 변동 (-3% ~ +4%) - 약간의 상승 바이어스
    const changePercent = (Math.random() - 0.45) * 0.06;
    const open = price;
    const close = price * (1 + changePercent);
    const high = Math.max(open, close) * (1 + Math.random() * 0.02);
    const low = Math.min(open, close) * (1 - Math.random() * 0.02);
    const volume = Math.floor(50000 + Math.random() * 200000);

    data.push({
      date: dateStr,
      open: Math.round(open),
      high: Math.round(high),
      low: Math.round(low),
      close: Math.round(close),
      volume,
    });

    price = close;
  }

  return data;
};
