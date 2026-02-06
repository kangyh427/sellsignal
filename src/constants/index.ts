// ============================================
// 상수 정의 (constants/index.ts)
// 위치: src/constants/index.ts
// 원본 JSX 라인 54~103 기반
// ============================================

import type { Stock } from '../types';

// ── 매도 프리셋 (Record 형태로 methodId로 접근 가능) ──
export const SELL_PRESETS: Record<string, {
  id: string;
  name: string;
  icon: string;
  description: string;
  stages: string[];
  severity: 'low' | 'medium' | 'high' | 'critical';
  color: string;
  hasInput?: boolean;
  inputLabel?: string;
  inputDefault?: number;
}> = {
  candle3: { id: 'candle3', name: '봉 3개 매도법', icon: '📊', description: '음봉이 직전 양봉의 50% 이상 덮을 때', stages: ['initial', 'profit5'], severity: 'high', color: '#f59e0b' },
  stopLoss: { id: 'stopLoss', name: '손실제한 매도법', icon: '🛡', description: '매수가 대비 설정% 도달 시', stages: ['initial', 'profit5'], hasInput: true, inputLabel: '손절 기준 (%)', inputDefault: -5, severity: 'critical', color: '#ef4444' },
  twoThird: { id: 'twoThird', name: '2/3 익절 매도법', icon: '📈', description: '최고 수익 대비 1/3 하락 시', stages: ['profit5', 'profit10'], severity: 'medium', color: '#8b5cf6' },
  maSignal: { id: 'maSignal', name: '이동평균선 매도법', icon: '📉', description: '이동평균선 하향 돌파 시', stages: ['profit5', 'profit10'], hasInput: true, inputLabel: '이동평균 기간 (일)', inputDefault: 20, severity: 'high', color: '#06b6d4' },
  volumeZone: { id: 'volumeZone', name: '매물대 매도법', icon: '🏔️', description: '저항대 도달 후 하락 시', stages: ['profit5', 'profit10'], severity: 'medium', color: '#84cc16' },
  trendline: { id: 'trendline', name: '추세선 매도법', icon: '📐', description: '지지선/저항선 이탈 시', stages: ['profit10'], severity: 'medium', color: '#ec4899' },
  fundamental: { id: 'fundamental', name: '기업가치 반전', icon: '📰', description: '실적 발표/뉴스 모니터링', stages: ['profit10'], severity: 'high', color: '#f97316' },
  cycle: { id: 'cycle', name: '경기순환 매도법', icon: '🔄', description: '금리/경기 사이클 기반', stages: ['profit10'], severity: 'low', color: '#64748b' },
};

// ── 수익 단계 정의 ──
export const PROFIT_STAGES: Record<string, {
  label: string;
  color: string;
  range: string;
  methods: string[];
}> = {
  initial: { label: '초기 단계', color: '#6b7280', range: '0~5%', methods: ['candle3', 'stopLoss'] },
  profit5: { label: '5% 수익 구간', color: '#eab308', range: '5~10%', methods: ['candle3', 'stopLoss', 'twoThird', 'maSignal', 'volumeZone'] },
  profit10: { label: '10%+ 수익 구간', color: '#10b981', range: '10% 이상', methods: ['twoThird', 'maSignal', 'volumeZone', 'fundamental', 'trendline', 'cycle'] },
};

// ── 종목 리스트 ──
export const STOCK_LIST: (Stock & { per: number; pbr: number; sectorPer: number; sectorPbr: number })[] = [
  { name: '삼성전자', code: '005930', market: '코스피', sector: '반도체', per: 12.5, pbr: 1.2, sectorPer: 15.2, sectorPbr: 1.8 },
  { name: '삼성전자우', code: '005935', market: '코스피', sector: '반도체', per: 11.8, pbr: 1.1, sectorPer: 15.2, sectorPbr: 1.8 },
  { name: '삼성SDI', code: '006400', market: '코스피', sector: '2차전지', per: 25.3, pbr: 2.1, sectorPer: 28.5, sectorPbr: 3.2 },
  { name: '현대차', code: '005380', market: '코스피', sector: '자동차', per: 5.8, pbr: 0.6, sectorPer: 7.2, sectorPbr: 0.8 },
  { name: '한화에어로스페이스', code: '012450', market: '코스피', sector: '방산', per: 35.2, pbr: 4.5, sectorPer: 22.0, sectorPbr: 2.8 },
  { name: 'SK하이닉스', code: '000660', market: '코스피', sector: '반도체', per: 8.5, pbr: 1.8, sectorPer: 15.2, sectorPbr: 1.8 },
  { name: '네이버', code: '035420', market: '코스피', sector: 'IT서비스', per: 22.1, pbr: 1.5, sectorPer: 25.0, sectorPbr: 2.5 },
  { name: '카카오', code: '035720', market: '코스피', sector: 'IT서비스', per: 45.2, pbr: 1.8, sectorPer: 25.0, sectorPbr: 2.5 },
  { name: 'LG화학', code: '051910', market: '코스피', sector: '화학', per: 18.5, pbr: 1.2, sectorPer: 12.0, sectorPbr: 0.9 },
  { name: 'POSCO홀딩스', code: '005490', market: '코스피', sector: '철강', per: 8.2, pbr: 0.5, sectorPer: 6.5, sectorPbr: 0.4 },
  { name: '셀트리온', code: '068270', market: '코스피', sector: '바이오', per: 32.5, pbr: 3.8, sectorPer: 45.0, sectorPbr: 5.2 },
  { name: '기아', code: '000270', market: '코스피', sector: '자동차', per: 4.5, pbr: 0.7, sectorPer: 7.2, sectorPbr: 0.8 },
  { name: 'KB금융', code: '105560', market: '코스피', sector: '금융', per: 5.2, pbr: 0.5, sectorPer: 5.8, sectorPbr: 0.45 },
];

// ── 실적 발표 데이터 ──
export const EARNINGS_DATA: Record<string, {
  name: string;
  nextEarningsDate: string;
  lastEarnings: { surprise: number };
}> = {
  '005930': { name: '삼성전자', nextEarningsDate: '2026-04-25', lastEarnings: { surprise: 5.2 } },
  '005380': { name: '현대차', nextEarningsDate: '2026-04-22', lastEarnings: { surprise: 8.3 } },
  '012450': { name: '한화에어로스페이스', nextEarningsDate: '2026-05-10', lastEarnings: { surprise: 15.8 } },
  '000660': { name: 'SK하이닉스', nextEarningsDate: '2026-04-23', lastEarnings: { surprise: 12.5 } },
  '035420': { name: '네이버', nextEarningsDate: '2026-04-28', lastEarnings: { surprise: -2.5 } },
};

// ── 시장 사이클 데이터 ──
export const MARKET_CYCLE = {
  currentPhase: 4,
  phaseName: '금리인상 논의',
  description: '금리 고점 근처, 과열 조정 국면',
  recommendation: '매도 관망',
  interestRate: 3.5,
  confidence: 75,
  details: { kospiPer: 11.8, bondYield: 3.52, fedRate: 4.5 },
};

// ── 반응형 브레이크포인트 ──
export const BREAKPOINTS = {
  mobile: 480,
  tablet: 768,
  desktop: 1024,
  wide: 1400,
};
