// ============================================
// CREST 전역 상수
// 경로: src/constants/index.ts
// 세션 30: CYCLE_STAGES 국면 전면 수정 (1,6=매수 / 2,5=관망 / 3,4=매도)
// 세션 43: generateMockPriceData 브라운 브릿지 앵커링 수정
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

// ── 코스톨라니 달걀 6단계 (세션 30: 국면 전면 수정) ──
// 핵심: 1,6=매수(하단) / 2,5=관망(중간) / 3,4=매도(상단)
export const CYCLE_STAGES: CycleStage[] = [
  {
    num: 1, name: '조정국면', action: '매수',
    color: '#10b981',
    bgColor: 'rgba(16,185,129,0.1)',
    borderColor: 'rgba(16,185,129,0.25)',
    detail: '금융장세 · 금리인하 시작',
    recommendation: '적극 매수 구간',
    desc: '거래량 적고, 주식소유자 적다. 뉴스가 암울해도 가치보다 싼 주식이 널려있는 시기. 소신파 조용히 매수.',
  },
  {
    num: 2, name: '동행국면', action: '관망',
    color: '#f59e0b',
    bgColor: 'rgba(245,158,11,0.1)',
    borderColor: 'rgba(245,158,11,0.25)',
    detail: '실적장세 · 경기회복 동행',
    recommendation: '보유 유지 · 관망',
    desc: '거래량과 주식소유자 증가, 주가는 조금씩 상승한다. 상황이 좋으면 상승, 나쁘면 하락. 소신파가 여전히 매수한다.',
  },
  {
    num: 3, name: '과장국면', action: '매도',
    color: '#ef4444',
    bgColor: 'rgba(239,68,68,0.1)',
    borderColor: 'rgba(239,68,68,0.25)',
    detail: '역금융장세 · 과열 경고',
    recommendation: '매도 시작',
    desc: '거래량과 주식소유자 폭증. 흥분된 분위기를 타고 주가 상승. 일반 대중이 유입되며, 고평가된 종목을 기꺼이 산다. 소신파 조용히 매도.',
  },
  {
    num: 4, name: '조정국면', action: '매도',
    color: '#ef4444',
    bgColor: 'rgba(239,68,68,0.1)',
    borderColor: 'rgba(239,68,68,0.25)',
    detail: '금리인상 시작 · 유동성 축소',
    recommendation: '적극 매도',
    desc: '거래량과 주식소유자 서서히 감소. 약간의 매도 = 즉시 하락. 새로운 고객 없음. 투자자들 예민해지기 시작. 소신파 매도를 끝마침(현금 보유).',
  },
  {
    num: 5, name: '동행국면', action: '관망',
    color: '#f59e0b',
    bgColor: 'rgba(245,158,11,0.1)',
    borderColor: 'rgba(245,158,11,0.25)',
    detail: '경기침체 동행 · 하락 추세',
    recommendation: '관망 대기',
    desc: '거래량 증가, 주식소유자 계속 감소. 시장의 분위기 극도로 예민. 소신파는 편안히 관망, 혹은 조금씩 매수 시작.',
  },
  {
    num: 6, name: '과장국면', action: '매수',
    color: '#10b981',
    bgColor: 'rgba(16,185,129,0.1)',
    borderColor: 'rgba(16,185,129,0.25)',
    detail: '역실적장세 · 바닥 형성',
    recommendation: '적극 매수 구간',
    desc: '거래량 폭증, 주식소유자 최저. 비관주의의 팽배. 주가 폭락. 기업은 멀쩡해도 다들 매도하기 바쁘다. 소신파 조용히 할값에 매수.',
  },
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
 * ★ 세션 43 수정: 브라운 브릿지 방식 모의 주가 데이터 생성
 * 
 * [기존 문제]
 * - buyPrice에서 시작해 랜덤 워크로 60일간 표류
 * - 끝점이 currentPrice와 무관하게 결정됨
 * - MA 계산 시 실제 가격과 큰 괴리 발생 → 차트 Y축 왜곡
 * 
 * [수정 내용]
 * - 시작점(buyPrice)과 끝점(currentPrice)을 고정
 * - 중간 경로는 자연스러운 주가 움직임 시뮬레이션 (브라운 브릿지)
 * - 마지막 봉의 close는 정확히 currentPrice와 일치
 * 
 * @param buyPrice 매수가 (시작점)
 * @param currentPrice 현재가 (끝점) ★ 신규 파라미터
 * @param days 생성할 일 수 (기본 60)
 * @returns 일별 OHLC 데이터 배열
 */
export const generateMockPriceData = (
  buyPrice: number,
  currentPrice: number,
  days: number = 60
): Array<{
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

  const now = new Date();

  // ── 브라운 브릿지: 시작점과 끝점을 고정한 랜덤 워크 ──
  // 1단계: 원시 랜덤 경로 생성
  const rawPath: number[] = [buyPrice];
  let p = buyPrice;
  for (let i = 1; i <= days; i++) {
    const noise = (Math.random() - 0.5) * buyPrice * 0.035;
    p += noise;
    rawPath.push(Math.max(p, buyPrice * 0.7)); // 하한 방어 (매수가의 70%)
  }

  // 2단계: 끝점을 currentPrice로 앵커링 (점진적 보정)
  const rawEnd = rawPath[rawPath.length - 1];
  const drift = currentPrice - rawEnd;
  const anchored = rawPath.map((v, i) => {
    const ratio = i / days;
    return v + drift * ratio; // 선형 보정
  });

  // 3단계: OHLC 데이터 생성
  for (let i = 0; i <= days; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - (days - i));
    const dateStr = date.toISOString().split('T')[0];

    const base = anchored[i];
    const vol = base * 0.015; // 일중 변동성
    const open = base + (Math.random() - 0.5) * vol;
    // 마지막 봉의 close는 정확히 currentPrice로 고정
    const close = i === days ? currentPrice : base + (Math.random() - 0.5) * vol;
    const high = Math.max(open, close) * (1 + Math.random() * 0.012);
    const low = Math.min(open, close) * (1 - Math.random() * 0.012);
    const volume = Math.floor(50000 + Math.random() * 200000);

    data.push({
      date: dateStr,
      open: Math.round(open),
      high: Math.round(high),
      low: Math.round(low),
      close: Math.round(close),
      volume,
    });
  }

  return data;
};
