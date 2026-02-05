// ============================================
// 전역 타입 정의
// ============================================

export interface Position {
  id: number;
  name: string;
  code: string;
  buyPrice: number;
  quantity: number;
  highestPrice: number;
  selectedPresets: string[];
  presetSettings: {
    [key: string]: {
      value: number;
    };
  };
}

export interface PriceData {
  date: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface Alert {
  id: number;
  stockName: string;
  code: string;
  preset: SellPreset;
  message: string;
  currentPrice?: number;
  targetPrice?: number;
  timestamp?: number;
}

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

export interface User {
  membership: 'free' | 'premium';
  email: string;
}

// 컴포넌트 Props 타입
export interface ResponsiveHeaderProps {
  alerts: Alert[];
  isPremium: boolean;
  onShowUpgrade: () => void;
  onShowAddModal: () => void;
}

export interface ResponsiveSummaryCardsProps {
  totalCost: number;
  totalValue: number;
  totalProfit: number;
  totalProfitRate: number;
}

export interface EnhancedCandleChartProps {
  data: PriceData[];
  width?: number;
  height?: number;
  buyPrice: number;
  sellPrices: Record<string, number | undefined>;
  visibleLines: Record<string, boolean>;
}

export interface MarketCycleWidgetProps {
  isPremium: boolean;
}

export interface EarningsWidgetProps {
  position: Position;
  isPremium: boolean;
  onShowAINews: () => void;
  onShowAIReport: () => void;
}

export interface PositionCardProps {
  position: Position;
  priceData: PriceData[] | undefined;
  onEdit: (position: Position) => void;
  onDelete: (id: number) => void;
  isPremium: boolean;
  onUpgrade: () => void;
}

export interface AlertCardProps {
  alert: Alert;
  onDismiss: (id: number) => void;
}

export interface SellMethodGuideProps {
  isMobile: boolean;
  activeTab: string;
}

export interface StockModalProps {
  stock?: Position | null;
  onSave: (position: Position) => void;
  onClose: () => void;
}

export interface AIPopupProps {
  position: Position;
  onClose: () => void;
  isPremium: boolean;
  onUpgrade: () => void;
}
