// ============================================
// 컴포넌트 Export 허브
// 경로: src/components/index.ts
// 세션 18A: 전체 컴포넌트 re-export
// 세션 32: 누락 컴포넌트 5개 추가 + SignalBadgeCompact named export
// ============================================

// ── 메인 앱 ──
export { default as CRESTApp } from './CRESTApp';

// ── 공통 UI ──
export { default as CrestLogo } from './CrestLogo';
export { default as ResponsiveHeader } from './ResponsiveHeader';
export { default as ResponsiveSummaryCards } from './ResponsiveSummaryCards';
export { default as MobileBottomNav } from './MobileBottomNav';
export { default as MarketMiniSummary } from './MarketMiniSummary';
export { default as Footer } from './Footer';

// ── 차트 & 위젯 ──
export { default as EnhancedMiniChart } from './EnhancedMiniChart';
export { default as MarketCycleWidget } from './MarketCycleWidget';
export { default as BuffettIndicatorWidget } from './BuffettIndicatorWidget';
export { default as SellMethodGuide } from './SellMethodGuide';

// ── 포지션 관련 ──
export { default as PositionCard } from './PositionCard';
export { default as PositionEditModal } from './PositionEditModal';
export { default as AlertCard } from './AlertCard';

// ── 시그널 (default + named export) ──
export { default as SignalSection } from './SignalSection';
export { SignalBadgeCompact } from './SignalSection';

// ── 모달 & 팝업 ──
export { default as AddStockModal } from './AddStockModal';
export { default as DeleteConfirmModal } from './DeleteConfirmModal';
export { default as UpgradePopup } from './UpgradePopup';

// ── AI 기능 ──
export { default as AINewsSummary } from './AINewsSummary';

// ── 로딩 & UX ──
export { default as SkeletonCard } from './SkeletonCard';

// ── PWA ──
export { default as InstallPrompt } from './InstallPrompt';
export { default as ServiceWorkerRegister } from './ServiceWorkerRegister';
