// ============================================
// 컴포넌트 배럴 파일 (components/index.ts)
// 위치: src/components/index.ts
// ============================================
// ✅ 모든 컴포넌트는 default export 사용
// ✅ index.ts에서 'export { default as X }' 패턴으로 named re-export
// ✅ 누락 컴포넌트 없이 전체 등록
// ============================================

// ── 레이아웃 & 네비게이션 ──
export { default as ResponsiveHeader } from './ResponsiveHeader';
export { default as MobileNav } from './MobileNav';
export { default as MobileTabBar } from './MobileTabBar';

// ── 데이터 표시 ──
export { default as SummaryCards } from './SummaryCards';
export { default as PositionCard } from './PositionCard';
export { default as AlertCard } from './AlertCard';
export { default as PositionList } from './PositionList';

// ── 차트 ──
export { default as CandleChart } from './CandleChart';
export { default as EnhancedCandleChart } from './EnhancedCandleChart';

// ── 위젯 ──
export { default as MarketCycleWidget } from './MarketCycleWidget';
export { default as EarningsWidget } from './EarningsWidget';
export { default as SellMethodGuide } from './SellMethodGuide';

// ── 모달 & 팝업 ──
export { default as StockModal } from './StockModal';
export { default as UpgradeModal } from './UpgradeModal';
export { default as UpgradePopup } from './UpgradePopup';
export { default as AINewsPopup } from './AINewsPopup';
export { default as AIReportPopup } from './AIReportPopup';

// ── 복합 패널 ──
export { default as SidePanel } from './SidePanel';
export { default as AdColumn } from './AdColumn';
