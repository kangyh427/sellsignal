// ============================================
// CREST 앱 공통 타입 정의
// ============================================

/** 매도 프리셋 (8가지 매도법) */
export interface SellPreset {
  id: string;
  name: string;
  icon: string;
  description: string;
  stages: string[];
  severity: 'critical' | 'high' | 'medium' | 'low';
  color: string;
  hasInput?: boolean;
  inputLabel?: string;
  inputDefault?: number;
}

/** 수익 단계 */
export interface ProfitStage {
  label: string;
  color: string;
  range: string;
  methods: string[];
}

/** 종목 정보 */
export interface StockInfo {
  name: string;
  code: string;
  market: string;
  sector: string;
  per: number;
  pbr: number;
  sectorPer: number;
  sectorPbr: number;
}

/** 실적 데이터 */
export interface EarningsInfo {
  name: string;
  nextEarningsDate: string;
  lastEarnings: {
    surprise: number;
  };
}

/** 시장 사이클 */
export interface MarketCycleData {
  currentPhase: number;
  phaseName: string;
  description: string;
  recommendation: string;
  interestRate: number;
  confidence: number;
  details: {
    kospiPer: number;
    bondYield: number;
    fedRate: number;
  };
}

/** 포지션 (사용자가 보유 중인 종목) */
export interface Position {
  id: number;
  name: string;
  code: string;
  buyPrice: number;
  quantity: number;
  highestPrice?: number;
  selectedPresets: string[];
  presetSettings: Record<string, { value: number }>;
  stock: StockInfo;
}

/** 캔들 데이터 (차트용) */
export interface CandleData {
  date: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

/** 알림 */
export interface Alert {
  id: number;
  stockName: string;
  code: string;
  preset: SellPreset;
  message: string;
  currentPrice?: number;
  targetPrice?: number;
  timestamp: number;
}

/** 매도 가격 계산 결과 */
export interface SellPrices {
  stopLoss?: number;
  twoThird?: number;
  maSignal?: number;
  candle3_50?: number;
  volumeZone?: number;
  trendline?: number;
  [key: string]: number | undefined;
}
