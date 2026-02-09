'use client';
// ============================================
// CRESTApp - 메인 앱 컴포넌트
// 경로: src/components/CRESTApp.tsx
// 세션 19: usePositions 연동 (DB CRUD + localStorage)
// 세션 24: 매도 시그널 엔진 연동 + useStockPrices/History
// 세션 25: 한글 인코딩 복원 + InstallPrompt + 시그널 PositionCard 전달
// 세션 26B: 모바일 UX 고도화 (PTR, 스켈레톤, 삭제모달, 탭 애니메이션)
// ============================================

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import useResponsive from '@/hooks/useResponsive';
import useAuth from '@/hooks/useAuth';
import usePositions from '@/hooks/usePositions';
import useStockPrices from '@/hooks/useStockPrices';
import useStockHistory from '@/hooks/useStockHistory';
import usePullToRefresh from '@/hooks/usePullToRefresh';
import { calculateAllSignals } from '@/lib/sellSignals';
import { SELL_PRESETS, formatCompact } from '@/constants';
import type { Position, Alert, PositionSignals } from '@/types';

// 컴포넌트 import
import CrestLogo from './CrestLogo';
import ResponsiveHeader from './ResponsiveHeader';
import ResponsiveSummaryCards from './ResponsiveSummaryCards';
import MobileBottomNav from './MobileBottomNav';
import MarketMiniSummary from './MarketMiniSummary';
import MarketCycleWidget from './MarketCycleWidget';
import BuffettIndicatorWidget from './BuffettIndicatorWidget';
import SellMethodGuide from './SellMethodGuide';
import PositionCard from './PositionCard';
import AlertCard from './AlertCard';
import AddStockModal from './AddStockModal';
import UpgradePopup from './UpgradePopup';
import InstallPrompt from './InstallPrompt';
import Footer from './Footer';
// ★ 세션 26B 신규 컴포넌트
import SkeletonCard from './SkeletonCard';
import DeleteConfirmModal from './DeleteConfirmModal';

export default function CRESTApp() {
  const router = useRouter();
  const { isMobile, isTablet, width } = useResponsive();
  const { user, isLoggedIn, isLoading: authLoading, signOut } = useAuth();

  // ★ 핵심: usePositions 훅으로 DB 연동
  const {
    positions,
    isLoading: positionsLoading,
    addPosition,
    updatePosition,
    deletePosition,
  } = usePositions(user?.id ?? null);

  // ★ 세션 22A/B: 실시간 주가 + 과거 차트 데이터
  const { prices: stockPrices, getPrice, getCurrentPrice } = useStockPrices(positions);
  const { historyMap: priceDataMap } = useStockHistory(positions);

  const [activeTab, setActiveTab] = useState('positions');
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // ★ 세션 25: 사용자가 수동으로 닫은 알림 ID 추적
  const [dismissedAlertIds, setDismissedAlertIds] = useState<Set<number>>(new Set());

  // ★ 세션 26B: 탭 전환 애니메이션 + 삭제 확인 모달
  const [tabAnim, setTabAnim] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const isPremium = false;
  const MAX_FREE_POSITIONS = 3;
  const MAX_FREE_AI_NEWS = 3;
  const [aiNewsUsedCount, setAiNewsUsedCount] = useState(0);

  // ★ 세션 24: 매도 시그널 계산 (전체 포지션)
  const signalsMap = useMemo<Record<number, PositionSignals>>(() => {
    const map: Record<number, PositionSignals> = {};
    positions.forEach((pos) => {
      const candles = priceDataMap[pos.id] || [];
      const currentPrice = getCurrentPrice(pos.code, pos.buyPrice);
      map[pos.id] = calculateAllSignals({ position: pos, candles, currentPrice });
    });
    return map;
  }, [positions, priceDataMap, getCurrentPrice]);

  // ★ 전체 활성 시그널 수 (헤더 배지용)
  const totalActiveSignals = useMemo(() => {
    return Object.values(signalsMap).reduce((sum, s) => sum + s.activeCount, 0);
  }, [signalsMap]);

  // ★ 세션 25: 시그널 기반 알림 자동 생성 (danger + warning → Alert[])
  const alerts = useMemo<Alert[]>(() => {
    const result: Alert[] = [];
    let alertId = 1;
    positions.forEach((pos) => {
      const posSignals = signalsMap[pos.id];
      if (!posSignals) return;
      posSignals.signals
        .filter(s => s.level === 'danger' || s.level === 'warning')
        .forEach(signal => {
          const id = alertId++;
          if (dismissedAlertIds.has(id)) return;
          const preset = SELL_PRESETS[signal.presetId];
          if (!preset) return;
          result.push({
            id,
            stockName: pos.name,
            code: pos.code,
            preset,
            message: signal.message,
            currentPrice: getCurrentPrice(pos.code, pos.buyPrice),
            targetPrice: pos.buyPrice,
            timestamp: signal.triggeredAt || Date.now(),
          });
        });
    });
    return result;
  }, [signalsMap, positions, dismissedAlertIds, getCurrentPrice]);

  // ── 핸들러 ──
  const handleUpdatePosition = (updated: Position) => {
    updatePosition(updated);
  };

  // ★ 세션 26B: 삭제 확인 모달 → 실제 삭제
  const handleDeleteRequest = (id: number) => {
    setDeleteConfirmId(id);
  };
  const handleDeleteConfirm = () => {
    if (deleteConfirmId !== null) {
      deletePosition(deleteConfirmId);
      setDeleteConfirmId(null);
    }
  };

  /** 종목 추가 핸들러 (AddStockModal에서 호출) */
  const handleAddStock = async (stock: {
    name: string;
    code: string;
    buyPrice: number;
    quantity: number;
  }) => {
    await addPosition(stock);
  };

  /** 로그인/로그아웃 핸들러 */
  const handleAuthAction = () => {
    if (isLoggedIn) {
      signOut();
    } else {
      router.push('/login');
    }
  };

  // ★ 세션 26B: 탭 전환 + fadeIn 애니메이션
  const handleTabChange = (tab: string) => {
    if (tab === activeTab) return;
    setTabAnim(true);
    setActiveTab(tab);
    setTimeout(() => setTabAnim(false), 250);
  };

  // ★ 세션 26B: Pull-to-Refresh
  const handleRefresh = useCallback(async () => {
    // 실제로는 stockPrices 재요청 등의 로직
    await new Promise((r) => setTimeout(r, 1000));
  }, []);
  const ptr = usePullToRefresh(handleRefresh);

  // 요약 통계 (실시간 주가 우선)
  const totalCost = positions.reduce((s, p) => s + p.buyPrice * p.quantity, 0);
  const totalValue = positions.reduce((s, p) => {
    const pr = getCurrentPrice(p.code, priceDataMap[p.id]?.[priceDataMap[p.id]?.length - 1]?.close || p.buyPrice);
    return s + pr * p.quantity;
  }, 0);
  const totalProfit = totalValue - totalCost;
  const totalProfitRate = totalCost > 0 ? (totalProfit / totalCost) * 100 : 0;

  // 로딩 스켈레톤
  if (authLoading || positionsLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #0a0a0f 0%, #0f172a 50%, #0a0a0f 100%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      }}>
        {/* ★ 세션 26B: 향상된 스켈레톤 로딩 */}
        <style>{`@keyframes skeletonPulse { 0%,100%{opacity:1}50%{opacity:0.5} }`}</style>
        <div style={{ width: '100%', maxWidth: '430px', padding: '60px 16px 0' }}>
          {/* 요약 카드 스켈레톤 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px' }}>
            {[0, 1, 2, 3].map(i => (
              <div key={i} style={{
                background: 'linear-gradient(145deg, #1e293b, #0f172a)',
                borderRadius: '12px', padding: '12px',
                border: '1px solid rgba(255,255,255,0.06)',
                animation: 'skeletonPulse 1.5s ease-in-out infinite',
                animationDelay: `${i * 0.15}s`,
              }}>
                <div style={{ width: '50%', height: 10, borderRadius: 4, background: 'rgba(255,255,255,0.06)', marginBottom: 8 }} />
                <div style={{ width: '70%', height: 16, borderRadius: 4, background: 'rgba(255,255,255,0.08)' }} />
              </div>
            ))}
          </div>
          {/* 포지션 카드 스켈레톤 */}
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #0a0a0f 0%, #0f172a 50%, #0a0a0f 100%)',
      color: '#fff',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontSize: '14px',
      paddingBottom: isMobile ? 'calc(70px + env(safe-area-inset-bottom, 0px))' : '0',
    }}>
      {/* ★ 세션 26B: 전역 keyframe 애니메이션 정의 */}
      <style>{`
        @keyframes pulse { 0%,100% { transform: translateX(-50%) scale(1); } 50% { transform: translateX(-50%) scale(1.15); } }
        @keyframes skeletonPulse { 0%,100%{opacity:1}50%{opacity:0.5} }
        @keyframes slideDown { from{opacity:0;max-height:0}to{opacity:1;max-height:800px} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)} }
        @keyframes spinnerRotate { from{transform:rotate(0deg)}to{transform:rotate(360deg)} }
        @keyframes slideUp { from{transform:translateY(100%);opacity:0}to{transform:translateY(0);opacity:1} }
        *{-webkit-tap-highlight-color:transparent}
      `}</style>

      {/* ★ PWA 설치 안내 */}
      <InstallPrompt />

      <ResponsiveHeader
        alerts={alerts} isPremium={isPremium} isLoggedIn={isLoggedIn}
        onShowUpgrade={() => setShowUpgrade(true)}
        onShowAddModal={() => {
          if (!isPremium && positions.length >= MAX_FREE_POSITIONS) {
            setShowUpgrade(true);
          } else {
            setShowAddModal(true);
          }
        }}
        onLogin={handleAuthAction}
        isMobile={isMobile} isTablet={isTablet}
      />

      {/* ★ 세션 26B: Pull-to-Refresh 인디케이터 (모바일 전용) */}
      {isMobile && (
        <div style={{
          height: `${ptr.pullDistance}px`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: ptr.pullDistance === 0 ? 'height 0.3s ease' : 'none',
          overflow: 'hidden',
        }}>
          {ptr.pullDistance > 0 && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              color: ptr.refreshing ? '#60a5fa' : '#64748b', fontSize: '12px',
            }}>
              <div style={{
                width: 20, height: 20,
                border: `2px solid ${ptr.refreshing ? '#60a5fa' : '#64748b'}`,
                borderTopColor: 'transparent',
                borderRadius: '50%',
                animation: ptr.refreshing ? 'spinnerRotate 0.8s linear infinite' : 'none',
                transform: ptr.refreshing ? undefined : `rotate(${ptr.pullDistance * 3}deg)`,
              }} />
              {ptr.refreshing ? '새로고침 중...' : ptr.pullDistance >= 40 ? '놓으면 새로고침' : '아래로 당기기'}
            </div>
          )}
        </div>
      )}

      {/* 메인 콘텐츠 영역 (PTR 터치 핸들러 연결) */}
      <main
        ref={isMobile ? ptr.containerRef : undefined}
        onTouchStart={isMobile ? ptr.handleTouchStart : undefined}
        onTouchMove={isMobile ? ptr.handleTouchMove : undefined}
        onTouchEnd={isMobile ? ptr.handleTouchEnd : undefined}
        style={{
          maxWidth: isMobile ? '100%' : isTablet ? '1200px' : '1600px',
          margin: '0 auto', padding: isMobile ? '0' : '24px',
        }}
      >
        <ResponsiveSummaryCards
          totalCost={totalCost} totalValue={totalValue}
          totalProfit={totalProfit} totalProfitRate={totalProfitRate}
          isMobile={isMobile} isTablet={isTablet}
        />

        <div style={
          isMobile
            ? { display: 'flex', flexDirection: 'column', gap: '0' }
            : isTablet
            ? { display: 'grid', gridTemplateColumns: '1fr 360px', gap: '16px', padding: '0 20px' }
            : { display: 'grid', gridTemplateColumns: isPremium ? '1fr 440px' : '160px 1fr 440px', gap: '20px' }
        }>
          {/* 좌측 광고 (데스크톱, 비프리미엄) */}
          {!isMobile && !isTablet && !isPremium && (
            <div style={{ position: 'sticky', top: '80px', alignSelf: 'start' }}>
              <div style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))',
                borderRadius: '12px', padding: '12px 8px',
                border: '1px dashed rgba(255,255,255,0.08)',
                textAlign: 'center', minHeight: '600px',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              }}>
                <div style={{ fontSize: '10px', color: '#475569', marginBottom: '8px', letterSpacing: '1px' }}>AD</div>
                <div style={{ fontSize: '11px', color: '#64748b', textAlign: 'center' }}>
                  📢 Google<br />AdSense<br />(160×600)
                  <div style={{ fontSize: '9px', color: '#475569', marginTop: '8px' }}>PRO 구독 시<br />광고 제거</div>
                </div>
              </div>
            </div>
          )}

          {/* 포지션 목록 */}
          <div style={{
            display: isMobile && activeTab !== 'positions' ? 'none' : 'block',
            padding: isMobile ? '0 16px' : '0',
            // ★ 세션 26B: 탭 전환 애니메이션
            animation: isMobile && tabAnim ? 'fadeIn 0.25s ease-out' : 'none',
          }}>
            {isMobile && activeTab === 'positions' && (
              <MarketMiniSummary onClick={() => handleTabChange('market')} />
            )}

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <h2 style={{ fontSize: isMobile ? '16px' : '18px', fontWeight: '700', color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                보유 종목 ({positions.length})
                {/* ★ 세션 24: 전체 활성 시그널 배지 */}
                {totalActiveSignals > 0 && (
                  <span style={{
                    background: 'rgba(59,130,246,0.15)', color: '#60a5fa',
                    padding: '2px 8px', borderRadius: '8px',
                    fontSize: '11px', fontWeight: '700',
                  }}>📡 {totalActiveSignals}</span>
                )}
              </h2>
              <button onClick={() => {
                if (!isPremium && positions.length >= MAX_FREE_POSITIONS) {
                  setShowUpgrade(true);
                } else {
                  setShowAddModal(true);
                }
              }} style={{
                padding: '6px 14px', height: '34px',
                background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                border: 'none', borderRadius: '8px', color: '#fff',
                fontSize: '12px', fontWeight: '600', cursor: 'pointer',
              }}>+ 추가 {!isPremium && `(${positions.length}/${MAX_FREE_POSITIONS})`}</button>
            </div>

            {/* 인증 상태 배너 */}
            <div style={{
              background: isLoggedIn ? 'rgba(16,185,129,0.06)' : 'rgba(59,130,246,0.06)',
              border: `1px solid ${isLoggedIn ? 'rgba(16,185,129,0.15)' : 'rgba(59,130,246,0.15)'}`,
              borderRadius: '10px', padding: '10px 14px', marginBottom: '12px',
              display: 'flex', alignItems: 'center', gap: '8px',
            }}>
              <span style={{ fontSize: '16px' }}>{isLoggedIn ? '✅' : '💡'}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '12px', color: isLoggedIn ? '#10b981' : '#60a5fa', fontWeight: '600' }}>
                  {isLoggedIn ? `로그인 완료 (${user?.email})` : '데모 모드'}
                </div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>
                  {isLoggedIn ? '내 종목이 자동 저장됩니다' : '로그인하면 내 종목을 저장/관리할 수 있습니다'}
                </div>
              </div>
              {!isLoggedIn && (
                <button onClick={() => router.push('/login')} style={{
                  padding: '6px 12px', background: 'rgba(59,130,246,0.15)',
                  border: '1px solid rgba(59,130,246,0.3)', borderRadius: '6px',
                  color: '#60a5fa', fontSize: '11px', fontWeight: '600', cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}>로그인</button>
              )}
            </div>

            {/* 종목이 없을 때 */}
            {positions.length === 0 && (
              <div style={{
                textAlign: 'center', padding: '40px 20px',
                background: 'linear-gradient(145deg, #1e293b, #0f172a)',
                borderRadius: '14px', border: '1px solid rgba(255,255,255,0.06)',
              }}>
                <div style={{ fontSize: '40px', marginBottom: '12px' }}>📈</div>
                <div style={{ fontSize: '16px', fontWeight: '700', color: '#fff', marginBottom: '8px' }}>
                  종목을 추가해 보세요
                </div>
                <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>
                  한국·미국 주식을 검색하고 매도 조건을 설정하세요
                </div>
                <button onClick={() => setShowAddModal(true)} style={{
                  padding: '10px 24px',
                  background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                  border: 'none', borderRadius: '10px', color: '#fff',
                  fontSize: '14px', fontWeight: '600', cursor: 'pointer',
                }}>+ 첫 종목 추가하기</button>
              </div>
            )}

            {/* ★ 세션 25: PositionCard에 signals + stockPrice prop 전달 */}
            {/* ★ 세션 26B: onDelete → 삭제 확인 모달 연결 */}
            {positions.map((pos, i) => (
              <div key={pos.id} style={{
                animation: isMobile ? 'fadeIn 0.3s ease-out' : 'none',
                animationDelay: `${i * 0.1}s`,
                animationFillMode: 'both',
              }}>
                <PositionCard
                  position={pos} priceData={priceDataMap[pos.id]}
                  isMobile={isMobile} isTablet={isTablet}
                  onUpdate={handleUpdatePosition}
                  onDelete={handleDeleteRequest}
                  isPremium={isPremium}
                  stockPrice={getPrice(pos.code)}
                  signals={signalsMap[pos.id]}
                  aiNewsUsedCount={aiNewsUsedCount}
                  maxFreeAINews={MAX_FREE_AI_NEWS}
                  onUseAINews={() => setAiNewsUsedCount(prev => prev + 1)}
                  onShowUpgrade={() => setShowUpgrade(true)}
                />
              </div>
            ))}

            {/* 카드 하단 광고 */}
            {!isPremium && positions.length > 0 && (
              <div style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))',
                borderRadius: '12px', padding: '16px', marginTop: '8px',
                border: '1px dashed rgba(255,255,255,0.06)', textAlign: 'center',
              }}>
                <div style={{ fontSize: '10px', color: '#475569', letterSpacing: '1px', marginBottom: '4px' }}>AD</div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>📢 AdSense (320×100)</div>
                <div style={{ fontSize: '9px', color: '#475569', marginTop: '4px' }}>PRO 구독 시 광고 제거</div>
              </div>
            )}
          </div>

          {/* 우측 사이드바 */}
          {(!isMobile || activeTab === 'market' || activeTab === 'alerts' || activeTab === 'guide') && (
            <div style={{
              padding: isMobile ? '0 16px' : '0', overflow: 'visible',
              // ★ 세션 26B: 탭 전환 애니메이션
              animation: isMobile && tabAnim ? 'fadeIn 0.25s ease-out' : 'none',
            }}>
              <div style={{ display: isMobile && activeTab !== 'market' ? 'none' : 'block' }}>
                {isMobile && activeTab === 'market' && (
                  <button onClick={() => handleTabChange('positions')} style={{
                    width: '100%', padding: '10px 14px', marginBottom: '10px', minHeight: '44px',
                    background: 'linear-gradient(135deg, rgba(59,130,246,0.08), rgba(59,130,246,0.03))',
                    border: '1px solid rgba(59,130,246,0.15)', borderRadius: '12px', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '10px',
                  }}>
                    <span style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(59,130,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', color: '#60a5fa' }}>←</span>
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontSize: '13px', fontWeight: '700', color: '#60a5fa' }}>보유 종목으로 돌아가기</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>포지션 · 차트 · AI분석</div>
                    </div>
                  </button>
                )}
                <MarketCycleWidget isMobile={isMobile} isTablet={isTablet} isPremium={isPremium} />
                <BuffettIndicatorWidget isMobile={isMobile} isPremium={isPremium} />
              </div>

              {/* 알림 섹션 */}
              <div style={{
                display: isMobile && activeTab !== 'alerts' ? 'none' : 'block',
                background: 'linear-gradient(145deg, #1e293b, #0f172a)',
                borderRadius: '14px', padding: isMobile ? '14px' : '16px',
                border: '1px solid rgba(255,255,255,0.06)', marginBottom: '12px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    🔔 조건 도달 알림
                    {alerts.length > 0 && <span style={{ background: '#ef4444', color: '#fff', padding: '2px 8px', borderRadius: '8px', fontSize: '11px', fontWeight: '700' }}>{alerts.length}</span>}
                  </h3>
                  {alerts.length > 0 && (
                    <button onClick={() => setDismissedAlertIds(new Set(alerts.map(a => a.id)))} style={{
                      background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: '6px',
                      padding: '6px 10px', color: '#64748b', fontSize: '11px', cursor: 'pointer',
                    }}>모두 지우기</button>
                  )}
                </div>
                {alerts.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '24px' }}>
                    <div style={{ fontSize: '28px', marginBottom: '8px' }}>✨</div>
                    <div style={{ fontSize: '13px', color: '#64748b' }}>현재 도달한 조건이 없습니다</div>
                  </div>
                ) : alerts.map((a) => (
                  <AlertCard key={a.id} alert={a} onDismiss={(id) => setDismissedAlertIds(prev => new Set([...prev, id]))} />
                ))}
              </div>

              {/* 매도법 가이드 */}
              <SellMethodGuide isMobile={isMobile} activeTab={activeTab} />
            </div>
          )}
        </div>
      </main>

      {/* 모바일 하단 네비게이션 (★ 26B: handleTabChange 연결) */}
      {isMobile && <MobileBottomNav activeTab={activeTab} onTabChange={handleTabChange} alertCount={alerts.length} />}

      {/* ★ 세션 26B: 삭제 확인 모달 */}
      {deleteConfirmId !== null && (
        <DeleteConfirmModal
          stockName={positions.find(p => p.id === deleteConfirmId)?.name || ''}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteConfirmId(null)}
        />
      )}

      {/* ★ 종목 추가 모달 */}
      {showAddModal && (
        <AddStockModal
          isMobile={isMobile}
          maxFreePositions={MAX_FREE_POSITIONS}
          currentPositionCount={positions.length}
          isPremium={isPremium}
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddStock}
        />
      )}

      {/* 업그레이드 팝업 */}
      {showUpgrade && (
        <UpgradePopup
          isMobile={isMobile}
          maxFreePositions={MAX_FREE_POSITIONS}
          maxFreeAINews={MAX_FREE_AI_NEWS}
          onClose={() => setShowUpgrade(false)}
        />
      )}

      {/* 푸터 */}
      <Footer isMobile={isMobile} />
    </div>
  );
}
