// ============================================
// 전체 타입 정의 (Single Source of Truth)
// 위치: src/types/index.ts
// ============================================
// 모든 컴포넌트, 스토어, 유틸리티가 이 파일에서 타입을 import합니다.
// 타입을 수정할 때는 반드시 이 파일만 수정하세요.

// ── 종목 정보 (정적 데이터) ──
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

// ── 보유 포지션 ──
export interface Position {
  id: number | string;
  // 종목 정보 (평탄/중첩 구조 모두 지원)
  stock?: Stock;
  name: string;
  code: string;
  // 매매 정보
  buyPrice: number;
  quantity: number;
  currentPrice?: number;
  highestPrice?: number;
  buyDate?: string;
  // 매도 전략
  selectedPresets: string[];
  presetSettings: Record<string, { value: number }>;
  // 기타
  memo?: string;
  alerts?: Alert[];
  priceHistory?: ChartDataPoint[];
}

// ── 차트 데이터 포인트 ──
export interface ChartDataPoint {
  date: Date | string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

// ── PriceData (차트 컴포넌트 호환) ──
export type PriceData = ChartDataPoint;

// ── 알림 ──
export interface Alert {
  id: number;
  stockName: string;
  code: string;
  preset: {
    id: string;
    name: string;
    icon: string;
    severity: string;
  };
  message: string;
  currentPrice: number;
  targetPrice: number;
  timestamp: number;
}

// ── 매도 프리셋 ──
export interface SellPreset {
  id: string;
  name: string;
  icon: string;
  description: string;
  stages: string[];
  severity: string;
  color: string;
  hasInput?: boolean;
  inputLabel?: string;
  inputDefault?: number;
}

// ── 매도가 계산 결과 ──
export interface SellPrices {
  stopLoss?: number;
  twoThird?: number;
  maSignal?: number;
  candle3_50?: number;
  [key: string]: number | undefined;
}

// ── 차트 표시 라인 토글 ──
export interface VisibleLines {
  stopLoss: boolean;
  twoThird: boolean;
  maSignal: boolean;
  candle3_50: boolean;
}

// ── 반응형 상태 ──
export interface ResponsiveState {
  width: number;
  height: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isWide: boolean;
}

// ── 수익 단계 ──
export interface ProfitStage {
  label: string;
  color: string;
  range: string;
  methods: string[];
}

// ============================================
// 컴포넌트 Props 타입
// ============================================

// ── PositionCard ──
export interface PositionCardProps {
  position: Position;
  priceData: ChartDataPoint[] | undefined;
  onEdit: (position: Position) => void;
  onDelete: (id: string | number) => void;
  isPremium: boolean;
  onUpgrade?: () => void;
}

// ── StockModal ──
export interface StockModalProps {
  stock?: Position | null;
  onSave: (position: Position) => void;
  onClose: () => void;
  isMobile: boolean;
}

// ── StockModal 내부 폼 상태 ──
export interface FormState {
  stockCode: string;
  buyPrice: string;
  quantity: string;
  buyDate: string;
  selectedPresets: string[];
  presetSettings: Record<string, { value: number }>;
  memo: string;
}

// ── EnhancedCandleChart ──
export interface EnhancedCandleChartProps {
  data: ChartDataPoint[] | undefined;
  width?: number;
  height?: number;
  buyPrice: number;
  sellPrices?: SellPrices;
  visibleLines?: VisibleLines;
}

// ── ResponsiveHeader ──
export interface ResponsiveHeaderProps {
  alerts: Alert[];
  isPremium: boolean;
  onShowUpgrade: () => void;
  onShowAddModal: () => void;
}

// ── SummaryCards ──
export interface SummaryCardsProps {
  totalCost: number;
  totalValue: number;
  totalProfit: number;
  totalProfitRate: number;
}

// ── MarketCycleWidget ──
export interface MarketCycleWidgetProps {
  isPremium: boolean;
}

// ── EarningsWidget ──
export interface EarningsWidgetProps {
  position: Position;
  isPremium: boolean;
  onShowAINews: () => void;
  onShowAIReport: () => void;
}

// ── AI 팝업 공통 ──
export interface AIPopupProps {
  position: Position;
  onClose: () => void;
  isPremium: boolean;
  onUpgrade?: () => void;
}

// ── SellMethodGuide ──
export interface SellMethodGuideProps {
  isMobile: boolean;
  activeTab: string;
}

// ── AlertCard ──
export interface AlertCardProps {
  alert: Alert;
  onDismiss: (id: number) => void;
  isMobile?: boolean;
}

// ── MobileNav ──
export interface MobileNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  alertCount: number;
}

// ── MobileTabBar ──
export interface MobileTabBarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  tabs: Array<{
    id: string;
    label: string;
    count?: number;
  }>;
}

// ── PositionList ──
export interface PositionListProps {
  positions: Position[];
  priceDataMap: Record<string | number, ChartDataPoint[]>;
  isMobile: boolean;
  activeTab: string;
  isPremium: boolean;
  onEdit: (position: Position) => void;
  onDelete: (id: string | number) => void;
  onUpgrade: () => void;
  onAddStock: () => void;
  onNavigateToMarket: () => void;
}

// ── SidePanel ──
export interface SidePanelProps {
  isMobile: boolean;
  activeTab: string;
  isPremium: boolean;
  alerts: Alert[];
  onDismissAlert: (id: number) => void;
  onClearAllAlerts: () => void;
}

// ── AdColumn ──
export interface AdColumnProps {
  onUpgrade: () => void;
}

// ── UpgradePopup ──
export interface UpgradePopupProps {
  isMobile: boolean;
  onUpgrade: () => void;
  onClose: () => void;
}

// ── PositionCard 서브컴포넌트 Props ──
export interface PositionCardHeaderProps {
  position: Position;
  stage: ProfitStage & { label: string; color: string };
  naverStockUrl: string;
  isMobile: boolean;
  onEdit: (position: Position) => void;
  onDelete: (id: string | number) => void;
}

export interface PositionCardPriceInfoProps {
  buyPrice: number;
  currentPrice: number;
  quantity: number;
  totalValue: number;
  profitRate: number;
  profitAmount: number;
  isProfit: boolean;
  isMobile: boolean;
}

export interface PositionCardStrategyProps {
  position: Position;
  currentPrice: number;
  sellPrices: SellPrices;
  visibleLines: VisibleLines;
  onToggleLine: (lineKey: string) => void;
  onEdit: (position: Position) => void;
  isMobile: boolean;
}

export interface PositionCardChartProps {
  priceData: ChartDataPoint[] | undefined;
  buyPrice: number;
  sellPrices: SellPrices;
  visibleLines: VisibleLines;
  naverChartUrl: string;
  isMobile: boolean;
  isTablet: boolean;
}
