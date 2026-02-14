// ============================================
// CREST 전체 타입 정의 v5.1
// 경로: src/types/index.ts
// 세션 53: v5.1 패치 통합 + 기존 타입 유지
//
// [변경 이력]
// 세션 18A: 기본 타입 정의
// 세션 44-2 (v5.1): FundamentalData PER/PBR 밴드 + CycleData 추가
// 세션 53: 통합 정리
// ============================================

/** 매도 프리셋 단일 항목 */
export interface SellPreset {
  id: string;
  name: string;
  icon: string;
  color: string;
  desc: string;
}

/** 매도 프리셋 설정값 */
export interface PresetSetting {
  value: number;
}

/** 수익 단계 */
export interface ProfitStage {
  label: string;
  color: string;
}

/** 캔들 데이터 (차트용) */
export interface CandleData {
  date: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;  // ★ v5.1: 매물대 매도법에서 거래량 필요
}

/** 보유 포지션 */
export interface Position {
  id: number;
  name: string;
  code: string;
  buyPrice: number;
  quantity: number;
  highestPrice: number;
  selectedPresets: string[];
  presetSettings: Record<string, PresetSetting>;
}

/** 매도 신호 레벨 */
export type SignalLevel = 'danger' | 'warning' | 'caution' | 'safe' | 'inactive';

/** 개별 매도 신호 결과 */
export interface SignalResult {
  presetId: string;
  level: SignalLevel;
  score: number;
  message: string;
  detail: string;
  triggeredAt?: number;
}

/** 포지션별 통합 신호 */
export interface PositionSignals {
  positionId: number;
  signals: SignalResult[];
  maxLevel: SignalLevel;
  activeCount: number;
  totalScore: number;
}

/** 조건 도달 알림 */
export interface Alert {
  id: number;
  stockName: string;
  code: string;
  preset: SellPreset;
  message: string;
  currentPrice: number;
  targetPrice: number;
  timestamp: number;
}

/** 반응형 훅 반환 타입 */
export interface ResponsiveState {
  width: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}

/** 코스톨라니 경기순환 6단계 */
export interface CycleStage {
  num: number;
  name: string;
  action: string;
  color: string;
  bgColor: string;
  borderColor: string;
  detail: string;
  recommendation: string;
  desc: string;
}

/** AI 뉴스 요약 항목 */
export interface AINewsSummaryItem {
  id: number;
  title: string;
  summary: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  source: string;
  date: string;
}

/** 매도법 가이드 단계 */
export interface GuideStage {
  label: string;
  range: string;
  color: string;
  emoji: string;
  desc: string;
  methods: string[];
}

/** 매도법 상세 정보 */
export interface SellMethodDetail {
  fullDesc: string;
  when: string;
  tip: string;
}

/** 주가 데이터 (실시간) */
export interface StockPrice {
  price: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  volume: number;
  updatedAt: number;
}

// ============================================
// ★★★ v5.1 추가 타입 (세션 44-2 + 세션 53 통합) ★★★
// ============================================

/** PER/PBR 밴드차트 데이터 (과거 5년 기준) */
export interface ValuationBandData {
  /** 5년 최고값 */
  high: number;
  /** 5년 평균값 */
  avg: number;
  /** 5년 최저값 */
  low: number;
  /** 현재값 */
  current: number;
  /** 분기별 히스토리 (최대 20개 분기) */
  history?: number[];
}

/** 7번 기업가치 매도법 — 기업 데이터 */
export interface FundamentalData {
  /** 주가수익비율 (Price-to-Earnings Ratio) */
  per?: number;
  /** 업종 평균 PER */
  sectorAvgPer?: number;
  /** 주가순자산비율 (Price-to-Book Ratio) */
  pbr?: number;
  /** 업종 평균 PBR */
  sectorAvgPbr?: number;
  /** 영업이익 성장률 (%, 전년 동기 대비) */
  earningsGrowth?: number;
  /** 매출 성장률 (%, 전년 동기 대비) */
  revenueGrowth?: number;
  /** 악재/호재 이벤트 유형 */
  newsEvent?:
    | 'spin_off'       // 물적분할
    | 'rights_issue'   // 유상증자
    | 'earnings_miss'  // 실적 컨센서스 미달
    | 'downgrade'      // 투자의견 하향
    | 'scandal'        // 경영 리스크
    | 'none';          // 특이사항 없음
  /** 뉴스 이벤트 상세 설명 */
  newsDetail?: string;
  /** ★ v5.1: PER 밴드차트 데이터 (과거 5년) */
  perBand?: ValuationBandData;
  /** ★ v5.1: PBR 밴드차트 데이터 (과거 5년) */
  pbrBand?: ValuationBandData;
}

/** 8번 경기순환 매도법 — 경기 데이터 */
export interface CycleData {
  /** 코스톨라니 6단계 (1~6)
   * 1=조정국면/매수  2=동행국면/관망  3=과장국면/매도
   * 4=조정국면/매도  5=동행국면/관망  6=과장국면/매수
   */
  stage: number;
  /** 금리 방향 */
  interestDirection?:
    | 'up_start'       // 인상 시작
    | 'up_continued'   // 인상 지속
    | 'stable'         // 동결
    | 'down_start'     // 인하 시작
    | 'down_continued'; // 인하 지속
  /** 현재 기준금리 (%) */
  interestRate?: number;
  /** 인플레이션율 (%) */
  inflation?: number;
  /** GDP 성장률 (%) */
  gdpGrowth?: number;
  /** 시장 심리 */
  marketSentiment?:
    | 'euphoria'    // 탐욕/과열
    | 'optimism'    // 낙관
    | 'anxiety'     // 불안
    | 'fear';       // 공포
}
