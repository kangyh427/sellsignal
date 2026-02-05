// ============================================
// TypeScript 타입 정의
// ============================================

// 매도 프리셋 타입
export interface SellPreset {
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
}

// 프리셋 설정 타입
export interface PresetSettings {
  [key: string]: {
    value: number;
  };
}

// 매도가격 타입
export interface SellPrices {
  stopLoss?: number;      // 손절가
  twoThird?: number;      // 2/3 익절가
  maSignal?: number;      // 이동평균선 기준가
  candle3_50?: number;    // 3봉 매도법 기준가
}

// 차트 라인 표시 옵션 타입
export interface VisibleLines {
  stopLoss?: boolean;
  twoThird?: boolean;
  maSignal?: boolean;
  candle3_50?: boolean;
}

// 주식 종목 타입
export interface Stock {
  name: string;
  code: string;
  market: string;
  sector: string;
  per: number;
  pbr: number;
  sectorPer: number;
  sectorPbr: number;
}

// 포지션 타입
export interface Position {
  id: string;
  stock: Stock;
  buyPrice: number;
  quantity: number;
  currentPrice: number;
  buyDate: string;
  selectedPresets: string[];
  presetSettings?: PresetSettings;
  memo?: string;
  alerts?: Alert[];
  priceHistory?: PricePoint[];
  highestPriceRecorded?: number; // 보유 중 최고가 (2/3 매도법 계산용)
}

// 수익률이 계산된 포지션 타입
export interface PositionWithProfit extends Position {
  profitRate: number;
  profitAmount: number;
  totalValue: number;
}

// 가격 데이터 타입
export interface PricePoint {
  date: string;
  price: number;
  volume?: number;
}

// 차트 데이터 타입 (내부용)
export interface ChartDataPoint {
  date: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

// 알림 타입
export interface Alert {
  id: string;
  type: string;
  message: string;
  timestamp: string;
  read: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

// 반응형 훅 반환 타입
export interface ResponsiveState {
  width: number;
  height: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isWide: boolean;
}

// 사용자 타입
export interface User {
  name: string;
  email: string;
  membership: 'free' | 'premium';
}

// Form 상태 타입
export interface FormState {
  stockCode: string;
  buyPrice: string;
  quantity: string;
  buyDate: string;
  selectedPresets: string[];
  presetSettings: PresetSettings;
  memo: string;
}

// 헤더 Props 타입
export interface ResponsiveHeaderProps {
  alerts: Alert[];
  isPremium: boolean;
  isMobile: boolean;
  onUpgrade: () => void;
}

// 모달 Props 타입
export interface StockModalProps {
  stock?: Position;
  onSave: (position: Position) => void;
  onClose: () => void;
  isMobile: boolean;
}

// 차트 Props 타입
export interface CandleChartProps {
  data: ChartDataPoint[];
  width?: number;
  height?: number;
  buyPrice: number;
  sellPrices?: SellPrices;
  visibleLines?: VisibleLines;
}
