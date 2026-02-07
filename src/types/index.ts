// ============================================
// TypeScript 타입 정의 (types/index.ts)
// 위치: src/types/index.ts
// ============================================
// ✅ 프로젝트 전체에서 사용하는 타입의 유일한 정의 소스
// ✅ PositionCard 내부 타입도 여기서 관리 (중복 제거)
// ✅ 원본 JSX 호환성 유지
// ✅ 세션3: VisibleLines 인덱스 시그니처 추가, candle3 키 추가

// ── 매도 프리셋 타입 ──
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

// ── 프리셋 설정 타입 ──
export interface PresetSettings {
  [key: string]: {
    value: number;
  };
}

// ── 매도가격 타입 (PositionCard에서 사용) ──
export interface SellPrices {
  stopLoss?: number;      // 손절가
  twoThird?: number;      // 2/3 익절가
  maSignal?: number;      // 이동평균선 기준가
  candle3_50?: number;    // 3봉 매도법 기준가
}

// ── 차트 라인 표시 옵션 ──
// 프리셋 ID를 키로 사용하므로 인덱스 시그니처 추가
export interface VisibleLines {
  stopLoss?: boolean;
  twoThird?: boolean;
  maSignal?: boolean;
  candle3?: boolean;        // 프리셋 ID 기준 (candle3)
  candle3_50?: boolean;     // SellPrices 키 기준 (하위 호환)
  [key: string]: boolean | undefined;  // 동적 키 접근 허용
}

// ── 주식 종목 타입 ──
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

// ── 포지션 타입 ──
// ※ name, code 평탄 구조와 stock 중첩 구조 병행 (원본 JSX 호환)
export interface Position {
  id: string | number;
  stock?: Stock;              // 중첩 구조 (StockModal에서 사용)
  name?: string;              // 평탄 구조 (원본 JSX 호환)
  code?: string;              // 평탄 구조 (원본 JSX 호환)
  buyPrice: number;
  quantity: number;
  currentPrice: number;
  buyDate?: string;
  selectedPresets: string[];
  presetSettings?: PresetSettings;
  memo?: string;
  alerts?: Alert[];
  priceHistory?: PricePoint[];
  highestPrice?: number;          // 보유 중 최고가
  highestPriceRecorded?: number;  // 기존 코드 호환 (동일 용도)
}

// ── 수익률 계산된 포지션 ──
export interface PositionWithProfit extends Position {
  profitRate: number;
  profitAmount: number;
  totalValue: number;
}

// ── 가격 데이터 포인트 ──
export interface PricePoint {
  date: string;
  price: number;
  volume?: number;
}

// ── 차트 데이터 포인트 (캔들차트용) ──
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

// ── 알림 타입 ──
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

// ── 반응형 훅 반환 타입 ──
export interface ResponsiveState {
  width: number;
  height: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isWide: boolean;
}

// ── 사용자 타입 ──
export interface User {
  name?: string;
  email: string;
  membership: 'free' | 'premium';
}

// ── Form 상태 타입 (StockModal 내부) ──
export interface FormState {
  stockCode: string;
  buyPrice: string;
  quantity: string;
  buyDate: string;
  selectedPresets: string[];
  presetSettings: PresetSettings;
  memo: string;
}

// ── 컴포넌트 Props 타입 ──

export interface ResponsiveHeaderProps {
  alerts: Alert[];
  isPremium: boolean;
  onShowUpgrade: () => void;
  onShowAddModal: () => void;
}

export interface StockModalProps {
  stock?: Position;
  onSave: (position: Position) => void;
  onClose: () => void;
  isMobile: boolean;
}

export interface CandleChartProps {
  data: ChartDataPoint[];
  width?: number;
  height?: number;
  buyPrice: number;
  sellPrices?: SellPrices;
  visibleLines?: VisibleLines;
}

export interface PositionCardProps {
  position: Position;
  priceData?: ChartDataPoint[];
  onEdit: (position: Position) => void;
  onDelete: (id: string | number) => void;
  isPremium: boolean;
  onUpgrade: () => void;
}

export interface AlertCardProps {
  alert: Alert;
  onDismiss: (id: number) => void;
}

export interface SummaryCardsProps {
  totalCost: number;
  totalValue: number;
  totalProfit: number;
  totalProfitRate: number;
}

export interface SellMethodGuideProps {
  isMobile: boolean;
  activeTab: string;
}

export interface MarketCycleWidgetProps {
  isPremium: boolean;
}

// ── 수익 단계 타입 ──
export interface ProfitStage {
  label: string;
  color: string;
  range: string;
  methods: string[];
}

// ── 탭 아이템 타입 (모바일 네비게이션) ──
export interface TabItem {
  id: string;
  icon: string;
  label: string;
  count?: number;
  badge?: number;
}
