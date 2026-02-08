// ============================================
// CREST 전체 타입 정의
// 경로: src/types/index.ts
// 세션 18A: 17f 기반 전면 재정의
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
