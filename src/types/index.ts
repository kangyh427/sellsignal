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
// ※ 원본 JSX 호환: name, code를 직접 보유 (stock 중첩 구조와 병행)
export interface Position {
  id: string | number;
  stock?: Stock;              // 중첩 구조 (StockModal에서 사용)
  name?: string;              // 평탄 구조 (원본 JSX 호환) - stock?.name의 단축
  code?: string;              // 평탄 구조 (원본 JSX 호환) - stock?.code의 단축
  buyPrice: number;
  quantity: number;
  currentPrice: number;
  buyDate?: string;
  selectedPresets: string[];
  presetSettings?: PresetSettings;
  memo?: string;
  alerts?: Alert[];
  priceHistory?: PricePoint[];
  highestPrice?: number;          // 원본 JSX 호환 (보유 중 최고가)
  highestPriceRecorded?: number;  // 기존 코드 호환 (동일 용도)
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

// ※ PriceData는 ChartDataPoint의 별칭 (PositionCard 등에서 사용)
export type PriceData = ChartDataPoint;

// 알림 타입
export interface Alert {
  id: number;
  stockName: string;
  code: string;
  preset: {
    id: string;
    name: string;
    icon: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
  };
  message: string;
  currentPrice?: number;
  targetPrice?: number;
  timestamp?: number;
  read?: boolean;
  type?: string;
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
