// ============================================
// 컴포넌트 배럴 파일
// 위치: src/components/index.ts
// ============================================
// ✅ 세션3: position 서브컴포넌트 추가
// ※ 직접 import 방식 사용 (순환 참조 방지)

// ── 기존 컴포넌트 ──
export { default as ResponsiveHeader } from './ResponsiveHeader';
export { default as MobileNav } from './MobileNav';
export { default as SummaryCards } from './SummaryCards';
export { default as PositionCard } from './PositionCard';
export { default as StockModal } from './StockModal';
export { default as EnhancedCandleChart } from './EnhancedCandleChart';
export { default as EarningsWidget } from './EarningsWidget';
export { default as AINewsPopup } from './AINewsPopup';
export { default as AIReportPopup } from './AIReportPopup';
export { default as AlertCard } from './AlertCard';
export { default as MarketCycleWidget } from './MarketCycleWidget';
export { default as SellMethodGuide } from './SellMethodGuide';

// ── 세션2 추가 컴포넌트 ──
export { default as MobileTabBar } from './MobileTabBar';
export { default as PositionList } from './PositionList';
export { default as SidePanel } from './SidePanel';
export { default as AdColumn } from './AdColumn';
export { default as UpgradePopup } from './UpgradePopup';

// ── 세션3 추가: PositionCard 서브컴포넌트 ──
export {
  PositionCardHeader,
  PositionCardPriceInfo,
  PositionCardStrategy,
  PositionCardChart,
} from './position';
