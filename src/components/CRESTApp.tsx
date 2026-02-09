'use client';
// ============================================
// CRESTApp - 메인 앱 컴포넌트
// 경로: src/components/CRESTApp.tsx
// 세션 19: usePositions 연동 (DB CRUD + localStorage)
// 세션 26B: PTR, 스켈레톤 로딩, 삭제모달, 탭 애니메이션 통합
// 세션 26C: 한글 UTF-8 복원 + 26B 변경사항 적용
// 세션 27: usePullToRefresh API 불일치 수정 (3곳)
// ============================================

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useResponsive from '@/hooks/useResponsive';
import useAuth from '@/hooks/useAuth';
import usePositions from '@/hooks/usePositions';
import usePullToRefresh from '@/hooks/usePullToRefresh';
import { SELL_PRESETS, generateMockPriceData, formatCompact } from '@/constants';
import type { Position, Alert } from '@/types';

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
import Footer from './Footer';
import SkeletonCard from './SkeletonCard';
import DeleteConfirmModal from './DeleteConfirmModal';

// ── 데모 알림 ──
const DEMO_ALERTS: Alert[] = [
  { id: 1, stockName: '삼성전자', code: '005930', preset: SELL_PRESETS.stopLoss,
    message: '손절 기준가(-5%) 근접! 현재 -4.2%', currentPrice: 68500, targetPrice: 67925, timestamp: Date.now() - 300000 },
  { id: 2, stockName: '한화에어로스페이스', code: '012450', preset: SELL_PRESETS.twoThird,
    message: '최고점 대비 1/3 하락 근접', currentPrice: 365000, targetPrice: 369600, timestamp: Date.now() - 1800000 },
];

export default function CRESTApp() {
  const router = useRouter();
  const { isMobile, isTablet, width } = useResponsive();
  const { user, isLoggedIn, isLoading: authLoading, signOut } = useAuth();

  // ★ 핵심 변경: usePositions 훅으로 DB 연동
  const {
    positions,
    isLoading: positionsLoading,
    addPosition,
    updatePosition,
    deletePosition,
  } = usePositions(user?.id ?? null);

  const [activeTab, setActiveTab] = useState('positions');
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // ★ 세션 26B: 탭 애니메이션 상태
  const [tabAnim, setTabAnim] = useState(false);

  // ★ 세션 26B: 삭제 확인 모달 상태
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  // 알림 상태 (추후 DB 연동 예정)
  const [alerts, setAlerts] = useState<Alert[]>(DEMO_ALERTS);

  // 차트 데이터 (모의)
  const [priceDataMap, setPriceDataMap] = useState<Record<number, any[]>>({});
  const isPremium = false;
  const MAX_FREE_POSITIONS = 3;
  const MAX_FREE_AI_NEWS = 3;
  const [aiNewsUsedCount, setAiNewsUsedCount] = useState(0);

  // 포지션 변경 시 차트 데이터 재생성
  useEffect(() => {
    if (positions.length === 0) return;
    const d: Record<number, any[]> = {};
    positions.forEach((p) => {
      if (!priceDataMap[p.id]) {
        d[p.id] = generateMockPriceData(p.buyPrice, 60);
      } else {
        d[p.id] = priceDataMap[p.id];
      }
    });
    setPriceDataMap(d);
  }, [positions]);

  // 실시간 가격 시뮬레이션
  useEffect(() => {
    const iv = setInterval(() => {
      setPriceDataMap((prev) => {
        const u = { ...prev };
        Object.keys(u).forEach((id) => {
          const data = [...u[Number(id)]];
          if (!data.length) return;
          const last = data[data.length - 1];
          const change = (Math.random() - 0.48) * last.close * 0.008;
          const nc = Math.max(last.close + change, last.close * 0.95);
          data[data.length - 1] = { ...last, close: nc, high: Math.max(last.high, nc), low: Math.min(last.low, nc) };
          u[Number(id)] = data;
        });
        return u;
      });
    }, 3000);
    return () => clearInterval(iv);
  }, []);

  // ★ 세션 26B: Pull-to-Refresh 핸들러
  const handleRefresh = async () => {
    const d: Record<number, any[]> = {};
    positions.forEach((p) => {
      d[p.id] = generateMockPriceData(p.buyPrice, 60);
    });
    setPriceDataMap(d);
    await new Promise((r) => setTimeout(r, 800));
  };

  // ★ 세션 27 수정: 함수를 직접 전달 (객체 X)
  // usePullToRefresh 시그니처: (onRefresh: () => Promise<void>) => PullToRefreshReturn
  const {
    containerRef: ptrContainerRef,
    pullDistance,
    refreshing: ptrRefreshing,
    handleTouchStart: ptrTouchStart,
    handleTouchMove: ptrTouchMove,
    handleTouchEnd: ptrTouchEnd,
  } = usePullToRefresh(handleRefresh);

  // ★ 세션 26B: 탭 변경 핸들러 (애니메이션 포함)
  const handleTabChange = (tab: string) => {
    setTabAnim(true);
    setActiveTab(tab);
    setTimeout(() => setTabAnim(false), 300);
  };

  // ── 핸들러 ──
  const handleUpdatePosition = (updated: Position) => {
    updatePosition(updated);
  };

  // ★ 세션 26B: 삭제 요청 → 확인 모달
  const handleDeleteRequest = (id: number) => {
    setDeleteConfirmId(id);
  };

  // ★ 세션 26B: 삭제 확정
  const handleDeleteConfirm = () => {
    if (deleteConfirmId != null) {
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

  // 요약 통계
  const totalCost = positions.reduce((s, p) => s + p.buyPrice * p.quantity, 0);
  const totalValue = positions.reduce((s, p) => {
    const pr = priceDataMap[p.id]?.[priceDataMap[p.id]?.length - 1]?.close || p.buyPrice;
    return s + pr * p.quantity;
  }, 0);
  const totalProfit = totalValue - totalCost;
  const totalProfitRate = totalCost > 0 ? (totalProfit / totalCost) * 100 : 0;

  // 삭제 대상 포지션 이름 (모달용)
  const deleteTargetName = deleteConfirmId != null
    ? positions.find((p) => p.id === deleteConfirmId)?.name || '종목'
    : '';

  // ★ 세션 26B: 스켈레톤 로딩
  if (authLoading || positionsLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #0a0a0f 0%, #0f172a 50%, #0a0a0f 100%)',
        color: '#fff',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}>
        <style>{`
          @keyframes skeletonPulse {
            0%, 100% { opacity: 0.4; }
            50% { opacity: 0.8; }
          }
        `}</style>
        {/* 헤더 스켈레톤 */}
        <div style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ width: '120px', height: '32px', borderRadius: '8px', background: 'rgba(255,255,255,0.06)', animation: 'skeletonPulse 1.5s ease-in-out infinite' }} />
          <div style={{ display: 'flex', gap: '8px' }}>
            <div style={{ width: '60px', height: '32px', borderRadius: '8px', background: 'rgba(255,255,255,0.06)', animation: 'skeletonPulse 1.5s ease-in-out infinite 0.1s' }} />
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(255,255,255,0.06)', animation: 'skeletonPulse 1.5s ease-in-out infinite 0.2s' }} />
          </div>
        </div>
        {/* 요약 카드 스켈레톤 */}
        <div style={{ padding: '0 16px', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginBottom: '16px' }}>
          {[0, 1, 2, 3].map((i) => (
            <div key={i} style={{ height: '60px', borderRadius: '12px', background: 'rgba(255,255,255,0.04)', animation: `skeletonPulse 1.5s ease-in-out infinite ${i * 0.1}s` }} />
          ))}
        </div>
        {/* 포지션 카드 스켈레톤 */}
        <div style={{ padding: '0 16px' }}>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  return (
    <div
      ref={isMobile ? ptrContainerRef : undefined}
      onTouchStart={isMobile ? ptrTouchStart : undefined}
      onTouchMove={isMobile ? ptrTouchMove : undefined}
      onTouchEnd={isMobile ? ptrTouchEnd : undefined}
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #0a0a0f 0%, #0f172a 50%, #0a0a0f 100%)',
        color: '#fff',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontSize: '14px',
        paddingBottom: isMobile ? 'calc(70px + env(safe-area-inset-bottom, 0px))' : '0',
        position: 'relative',
        overflowX: 'hidden',
      }}
    >
      {/* 전역 keyframes */}
      <style>{`
        @keyframes pulse { 0%,100% { transform: translateX(-50%) scale(1); } 50% { transform: translateX(-50%) scale(1.15); } }
        @keyframes skeletonPulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 0.8; } }
        @keyframes slideDown { from { transform: translateY(-20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spinnerRotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes slideUp { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      `}</style>

      {/* ★ 세션 27 수정: pullDistance / ptrRefreshing 사용 (isPulling/isRefreshing X) */}
      {isMobile && (pullDistance > 0 || ptrRefreshing) && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 300,
          padding: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          animation: 'slideDown 0.3s ease',
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: 'rgba(59,130,246,0.15)',
            border: '2px solid rgba(59,130,246,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: ptrRefreshing ? 'spinnerRotate 1s linear infinite' : 'none',
          }}>
            <span style={{ fontSize: '14px' }}>
              {ptrRefreshing ? '🔄' : '⬇️'}
            </span>
          </div>
          <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '600' }}>
            {ptrRefreshing ? '새로고침 중...' : '놓으면 새로고침'}
          </span>
        </div>
      )}

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

      <main style={{
        maxWidth: isMobile ? '100%' : isTablet ? '1200px' : '1600px',
        margin: '0 auto', padding: isMobile ? '0' : '24px',
      }}>
        <ResponsiveSummaryCards
          totalCost={totalCost} totalValue={totalValue}
          totalProfit={totalProfit} totalProfitRate={totalProfitRate}
          isMobile={isMobile} isTablet={isTablet}
        />

        <div style={
          isMobile
            ? { display: 'flex', flexDirection: 'column' as const, gap: '0' }
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
                display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center',
              }}>
                <div style={{ fontSize: '10px', color: '#475569', marginBottom: '8px', letterSpacing: '1px' }}>AD</div>
                <div style={{ fontSize: '11px', color: '#64748b', textAlign: 'center' }}>
                  📢 Google<br />AdSense<br />(160×600)
                  <div style={{ fontSize: '9px', color: '#475569', marginTop: '8px' }}>PRO 구독 시<br />광고 제거</div>
                </div>
              </div>
            </div>
          )}

          {/* ★ 포지션 목록 (탭 애니메이션 적용) */}
          <div style={{
            display: isMobile && activeTab !== 'positions' ? 'none' : 'block',
            padding: isMobile ? '0 16px' : '0',
            animation: tabAnim && activeTab === 'positions' ? 'fadeIn 0.3s ease' : 'none',
          }}>
            {isMobile && activeTab === 'positions' && (
              <MarketMiniSummary onClick={() => handleTabChange('market')} />
            )}

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <h2 style={{ fontSize: isMobile ? '16px' : '18px', fontWeight: '700', color: '#fff', margin: 0 }}>
                보유 종목 ({positions.length})
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

            {/* ★ 세션 26B: onDelete → handleDeleteRequest (확인 모달 경유) */}
            {positions.map((pos) => (
              <PositionCard key={pos.id}
                position={pos} priceData={priceDataMap[pos.id]}
                isMobile={isMobile} isTablet={isTablet}
                onUpdate={handleUpdatePosition} onDelete={handleDeleteRequest}
                isPremium={isPremium}
                aiNewsUsedCount={aiNewsUsedCount}
                maxFreeAINews={MAX_FREE_AI_NEWS}
                onUseAINews={() => setAiNewsUsedCount(prev => prev + 1)}
                onShowUpgrade={() => setShowUpgrade(true)}
              />
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

          {/* ★ 우측 사이드바 (탭 애니메이션 적용) */}
          {(!isMobile || activeTab === 'market' || activeTab === 'alerts' || activeTab === 'guide') && (
            <div style={{
              padding: isMobile ? '0 16px' : '0',
              overflow: 'visible',
              animation: tabAnim ? 'fadeIn 0.3s ease' : 'none',
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
                    <button onClick={() => setAlerts([])} style={{
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
                  <AlertCard key={a.id} alert={a} onDismiss={(id) => setAlerts((prev) => prev.filter((x) => x.id !== id))} />
                ))}
              </div>

              {/* 매도법 가이드 */}
              <SellMethodGuide isMobile={isMobile} activeTab={activeTab} />
            </div>
          )}
        </div>
      </main>

      {/* ★ 세션 26B: 모바일 하단 네비게이션 (handleTabChange 연결) */}
      {isMobile && <MobileBottomNav activeTab={activeTab} onTabChange={handleTabChange} alertCount={alerts.length} />}

      {/* 종목 추가 모달 */}
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

      {/* ★ 세션 26B: 삭제 확인 모달 */}
      {deleteConfirmId != null && (
        <DeleteConfirmModal
          stockName={deleteTargetName}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteConfirmId(null)}
        />
      )}

      {/* 푸터 */}
      <Footer isMobile={isMobile} />
    </div>
  );
}
