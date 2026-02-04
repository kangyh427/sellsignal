import type { SellPreset, ProfitStage, StockInfo, MarketCycle } from '@/types/database'

// 8가지 매도법 프리셋
export const SELL_PRESETS: Record<string, SellPreset> = {
  candle3: {
    id: 'candle3',
    name: '봉 3개 매도법',
    icon: '📊',
    description: '음봉이 직전 양봉의 50% 이상 덮을 때',
    stages: ['initial', 'profit5'],
    severity: 'high',
    color: '#f59e0b',
  },
  stopLoss: {
    id: 'stopLoss',
    name: '손실제한 매도법',
    icon: '🛑',
    description: '매수가 대비 설정% 도달 시',
    stages: ['initial', 'profit5'],
    hasInput: true,
    inputLabel: '손절 기준 (%)',
    inputDefault: -5,
    severity: 'critical',
    color: '#ef4444',
  },
  twoThird: {
    id: 'twoThird',
    name: '2/3 익절 매도법',
    icon: '📈',
    description: '최고 수익 대비 1/3 하락 시',
    stages: ['profit5', 'profit10'],
    severity: 'medium',
    color: '#8b5cf6',
  },
  maSignal: {
    id: 'maSignal',
    name: '이동평균선 매도법',
    icon: '📉',
    description: '이동평균선 하향 돌파 시',
    stages: ['profit5', 'profit10'],
    hasInput: true,
    inputLabel: '이동평균 기간 (일)',
    inputDefault: 20,
    severity: 'high',
    color: '#06b6d4',
  },
  volumeZone: {
    id: 'volumeZone',
    name: '매물대 매도법',
    icon: '🏔️',
    description: '저항대 도달 후 하락 시',
    stages: ['profit5', 'profit10'],
    severity: 'medium',
    color: '#84cc16',
  },
  trendline: {
    id: 'trendline',
    name: '추세선 매도법',
    icon: '📐',
    description: '지지선/저항선 이탈 시',
    stages: ['profit10'],
    severity: 'medium',
    color: '#ec4899',
  },
  fundamental: {
    id: 'fundamental',
    name: '기업가치 반전',
    icon: '📰',
    description: '실적 발표/뉴스 모니터링',
    stages: ['profit10'],
    severity: 'high',
    color: '#f97316',
  },
  cycle: {
    id: 'cycle',
    name: '경기순환 매도법',
    icon: '🔄',
    description: '금리/경기 사이클 기반',
    stages: ['profit10'],
    severity: 'low',
    color: '#64748b',
  },
}

// 수익 단계 정의
export const PROFIT_STAGES: Record<string, ProfitStage> = {
  initial: {
    label: '초기 단계',
    color: '#6b7280',
    range: '0~5%',
    methods: ['candle3', 'stopLoss'],
  },
  profit5: {
    label: '5% 수익 구간',
    color: '#eab308',
    range: '5~10%',
    methods: ['candle3', 'stopLoss', 'twoThird', 'maSignal', 'volumeZone'],
  },
  profit10: {
    label: '10%+ 수익 구간',
    color: '#10b981',
    range: '10% 이상',
    methods: ['twoThird', 'maSignal', 'volumeZone', 'fundamental', 'trendline', 'cycle'],
  },
}

// 샘플 종목 데이터
export const SAMPLE_STOCKS: StockInfo[] = [
  { name: '삼성전자', code: '005930', market: '코스피', sector: '반도체', per: 12.5, pbr: 1.2, sectorPer: 15.2, sectorPbr: 1.8 },
  { name: '삼성전자우', code: '005935', market: '코스피', sector: '반도체', per: 11.8, pbr: 1.1, sectorPer: 15.2, sectorPbr: 1.8 },
  { name: '삼성SDI', code: '006400', market: '코스피', sector: '2차전지', per: 25.3, pbr: 2.1, sectorPer: 28.5, sectorPbr: 3.2 },
  { name: '현대차', code: '005380', market: '코스피', sector: '자동차', per: 5.8, pbr: 0.6, sectorPer: 7.2, sectorPbr: 0.8 },
  { name: '한화에어로스페이스', code: '012450', market: '코스피', sector: '방산', per: 35.2, pbr: 4.5, sectorPer: 22.0, sectorPbr: 2.8 },
  { name: 'SK하이닉스', code: '000660', market: '코스피', sector: '반도체', per: 8.5, pbr: 1.8, sectorPer: 15.2, sectorPbr: 1.8 },
  { name: '네이버', code: '035420', mark
