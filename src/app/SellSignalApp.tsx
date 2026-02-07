'use client';

// ============================================
// SellSignalApp.tsx — 메인 오케스트레이터 (리팩토링 v2)
// 위치: src/app/SellSignalApp.tsx
//
// 세션 2: Zustand 도입 + 컴포넌트 분해
// 909줄 → ~180줄 (약 80% 절감)
//
// 변경 사항:
//   - useState 12개 → Zustand 스토어 3개로 이동
//   - 인라인 JSX 5개 영역 → 독립 컴포넌트로 추출
//     · UpgradePopup, SidePanel, PositionList,
//       AdColumn, MobileTabBar
//   - 하단 인라인 네비 → MobileNav 컴포넌트 교체
// ============================================

import React, { useEffect } from 'react';
import { useResponsive } from '../hooks/useResponsive';

// ── Zustand 스토어 ──
import { usePositionStore } from '../stores/usePositionStore';
import { useAppStore } from '../stores/useAppStore';
import { useUserStore } from '../stores/useUserStore';

// ── 컴포넌트 ──
import {
  ResponsiveHeader,
  SummaryCards,
  MobileTabBar,
  MobileNav,
  PositionList,
  SidePanel,
  AdColumn,
  StockModal,
  UpgradePopup,
} from '../components';

// ============================================
// 메인 앱 컴포넌트
// ============================================
export default function SellSignalApp() {
  const { isMobile, isTablet } = useResponsive();

  // ── Zustand 스토어 구독 ──
  const positions = usePositionStore((s) => s.positions);
  const priceDataMap = usePositionStore((s) => s.priceDataMap);
  const alerts = usePositionStore((s) => s.alerts);
  const initPriceData = usePositionStore((s) => s.initPriceData);
  const tickPriceData = usePositionStore((s) => s.tickPriceData);
  const addPosition = usePositionStore((s) => s.addPosition);
  const editPosition = usePositionStore((s) => s.editPosition);
  const deletePosition = usePositionStore((s) => s.deletePosition);
  const dismissAlert = usePositionStore((s) => s.dismissAlert);
  const clearAllAlerts = usePositionStore((s) => s.clearAllAlerts);
  const getTotals = usePositionStore((s) => s.getTotals);

  const activeTab = useAppStore((s) => s.activeTab);
  const setActiveTab = useAppStore((s) => s.setActiveTab);
  const showAddModal = useAppStore((s) => s.showAddModal);
  const editingPosition = useAppStore((s) => s.editingPosition);
  const showUpgradePopup = useAppStore((s) => s.showUpgradePopup);
  const openAddModal = useAppStore((s) => s.openAddModal);
  const closeAddModal = useAppStore((s) => s.closeAddModal);
  const startEditing = useAppStore((s) => s.startEditing);
  const stopEditing = useAppStore((s) => s.stopEditing);
  const openUpgradePopup = useAppStore((s) => s.openUpgradePopup);
  const closeUpgradePopup = useAppStore((s) => s.closeUpgradePopup);

  const isPremium = useUserStore((s) => s.isPremium)();
  const upgradeToPremium = useUserStore((s) => s.upgradeToPremium);

  // ── 가격 데이터 초기화 ──
  useEffect(() => {
    initPriceData();
  }, [positions, initPriceData]);

  // ── 실시간 가격 업데이트 (3초 간격) ──
  useEffect(() => {
    const interval = setInterval(tickPriceData, 3000);
    return () => clearInterval(interval);
  }, [tickPriceData]);

  // ── 총계 계산 ──
  const { totalCost, totalValue, totalProfit, totalProfitRate } = getTotals();

  // ── 업그레이드 핸들러 ──
  const handleUpgrade = () => {
    upgradeToPremium();
    closeUpgradePopup();
  };

  // ── 모바일 탭 데이터 ──
  const mobileTabs = [
    { id: 'positions', label: '📊 포지션', count: positions.length },
    { id: 'alerts', label: '🔔 알림', count: alerts.length },
    { id: 'market', label: '🥚 시장분석' },
    { id: 'guide', label: '📚 가이드' },
  ];

  // ── 레이아웃 스타일 ──
  const getMainLayoutStyle = (): React.CSSProperties => {
    if (isMobile) return { display: 'flex', flexDirection: 'column', gap: '16px' };
    if (isTablet) return { display: 'grid', gridTemplateColumns: '1fr 320px', gap: '16px', padding: '0 20px' };
    return {
      display: 'grid',
      gridTemplateColumns: isPremium ? '1fr 380px' : '140px 1fr 380px',
      gap: '20px',
    };
  };

  // ============================================
  // 렌더링
  // ============================================
  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #0a0a0f 0%, #0f172a 50%, #0a0a0f 100%)',
        color: '#fff',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontSize: '14px',
        paddingBottom: isMobile ? '70px' : '0',
      }}
    >
      {/* 전역 스타일 */}
      <style>{`
        * { box-sizing: border-box; }
        input::placeholder { color: #475569; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.6; } }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: rgba(255,255,255,0.05); }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 3px; }
        * { -webkit-tap-highlight-color: transparent; }
      `}</style>

      {/* ── 반응형 헤더 ── */}
      <ResponsiveHeader
        alerts={alerts}
        isPremium={isPremium}
        onShowUpgrade={openUpgradePopup}
        onShowAddModal={openAddModal}
      />

      {/* ── 메인 영역 ── */}
      <main
        style={{
          maxWidth: isMobile ? '100%' : isTablet ? '1200px' : '1600px',
          margin: '0 auto',
          padding: isMobile ? '16px 0' : '24px',
        }}
      >
        {/* 요약 카드 */}
        <SummaryCards
          totalCost={totalCost}
          totalValue={totalValue}
          totalProfit={totalProfit}
          totalProfitRate={totalProfitRate}
        />

        {/* 모바일 인라인 탭 */}
        {isMobile && (
          <MobileTabBar
            activeTab={activeTab}
            onTabChange={setActiveTab}
            tabs={mobileTabs}
          />
        )}

        {/* 메인 레이아웃 (3컬럼/2컬럼/1컬럼) */}
        <div style={getMainLayoutStyle()}>
          {/* 데스크탑 광고 영역 (무료회원만) */}
          {!isMobile && !isTablet && !isPremium && (
            <AdColumn onUpgrade={openUpgradePopup} />
          )}

          {/* 포지션 목록 */}
          <PositionList
            positions={positions}
            priceDataMap={priceDataMap}
            isMobile={isMobile}
            activeTab={activeTab}
            isPremium={isPremium}
            onEdit={startEditing}
            onDelete={deletePosition}
            onUpgrade={openUpgradePopup}
            onAddStock={openAddModal}
            onNavigateToMarket={() => setActiveTab('market')}
          />

          {/* 사이드 패널 (시장분석 + 알림 + 가이드) */}
          <SidePanel
            isMobile={isMobile}
            activeTab={activeTab}
            isPremium={isPremium}
            alerts={alerts}
            onDismissAlert={dismissAlert}
            onClearAllAlerts={clearAllAlerts}
          />
        </div>
      </main>

      {/* ── 모바일 하단 네비게이션 ── */}
      {isMobile && (
        <MobileNav
          activeTab={activeTab}
          onTabChange={setActiveTab}
          alertCount={alerts.length}
        />
      )}

      {/* ── 모달: 종목 추가 ── */}
      {showAddModal && (
        <StockModal
          onSave={(stock) => { addPosition(stock); closeAddModal(); }}
          onClose={closeAddModal}
          isMobile={isMobile}
        />
      )}

      {/* ── 모달: 종목 수정 ── */}
      {editingPosition && (
        <StockModal
          stock={editingPosition}
          onSave={(stock) => { editPosition(stock); stopEditing(); }}
          onClose={stopEditing}
          isMobile={isMobile}
        />
      )}

      {/* ── 업그레이드 팝업 ── */}
      {showUpgradePopup && (
        <UpgradePopup
          isMobile={isMobile}
          onUpgrade={handleUpgrade}
          onClose={closeUpgradePopup}
        />
      )}
    </div>
  );
}
