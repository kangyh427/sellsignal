// ============================================
// CREST 전체 타입 정의
// 경로: src/types/index.ts
// ============================================

/** 매도 프리셋 단일 항목 */
export interface SellPreset {
  id: string;
  name: string;
  icon: string;
  color: string;
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
