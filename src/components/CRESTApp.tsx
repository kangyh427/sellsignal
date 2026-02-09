'use client';
// ============================================
// CRESTApp - 메인 앱 컴포넌트 (Zustand 리팩토링)
// 경로: src/components/CRESTApp.tsx
// 세션 33: Zustand 스토어 도입 → props drilling 제거
// 변경사항:
//   - 6개 useState → usePositionStore + useUIStore로 통합
//   - usePositions 훅 데이터 → positionStore에 동기화
//   - PositionCard에 전달하던 8개 props → 3개로 축소
//   - 알림/가격데이터 스토어 직접 관리
// ============================================

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useResponsive from '@/hooks/useResponsive';
import useAuth from '@/hooks/useAuth';
import usePositions from '@/hooks/usePositions';
import { usePositionStore, useUIStore } from '@/stores';
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

// ── 데모 알림 ──
const DEMO_ALERTS: Alert[] = [
  {
    id: 1, stockName: '삼성전자', code: '005930', preset: SELL_PRESETS.stopLoss,
    message: '손절 기준가(-5%) 근접! 현재 -4.2%',
    currentPrice: 68500, targetPrice: 67925, timestamp: Date.now() - 300000,
  },
  {
    id: 2, stockName: '한화에어로스페이스', code: '012450', preset: SELL_PRESETS.twoThird,
    message: '최고점 대비 1/3 하락 근접',
    currentPrice: 365000, targetPrice: 369600, timestamp: Date.now() - 1800000,
  },
];

export default function CRESTApp() {
  const router = useRouter();
  const { isMobile, isTablet, width } = useResponsive();
  const { user, isLoggedIn, isLoading: authLoading, signOut } = useAuth();

  // ★ 기존 usePositions 훅 (DB/localStorage CRUD 유지)
  const {
    positions: hookPositions,
    isLoading: positionsLoading,
    addPosition,
    updatePosition,
    deletePosition,
  } = usePositions(user?.id ?? null);

  // ★ Zustand 스토어
  const posStore = usePositionStore();
  const uiStore = useUIStore();

  // ── usePositions → positionStore 동기화 ──
  useEffect(() => {
    posStore.setPositions(hookPositions);
    posStore.setLoading(positionsLoading);
  }, [hookPositions, positionsLoading]);

  // ── 초기 알림 설정 ──
  useEffect(() => {
    posStore.setAlerts(DEMO_ALERTS);
  }, []);

  // ── 포지션 변경 시 차트 데이터 재생성 ──
  useEffect(() => {
    if (posStore.positions.length === 0) return;
    const currentMap = posStore.priceDataMap;
    const newMap: Record<number, any[]> = {};

    posStore.positions.forEach((p) => {
      // 이미 데이터가 있으면 재생성하지 않음
      newMap[p.id] = currentMap[p.id] || generateMockPriceData(p.buyPrice, 60);
    });

    posStore.setPriceDataMap(newMap);
  }, [posStore.positions]);

  // ── 실시간 가격 시뮬레이션 ──
  useEffect(() => {
    const iv = setInterval(() => {
      const currentMap = usePositionStore.getState().priceDataMap;
      const updated = { ...currentMap };
      let changed = false;

      Object.keys(updated).forEach((idStr) => {
        const id = Number(idStr);
        const data = [...updated[id]];
        if (!data.length) return;

        const last = data[data.length - 1];
        const change = (Math.random() - 0.48) * last.close * 0.008;
        const nc = Math.max(last.close + change, last.close * 0.95);
        data[data.length - 1] = {
          ...last,
          close: nc,
          high: Math.max(last.high, nc),
          low: Math.min(last.low, nc),
        };
        updated[id] = data;
        changed = true;
      });

      if (changed) {
        usePositionStore.getState().setPriceDataMap(updated);
      }
    }, 3000);

    return () => clearInterval(iv);
  }, []);

  // ── 핸들러 ──
  const handleUpdatePosition = (updated: Position) => {
    updatePosition(updated); // DB/localStorage 저장
    // hookPositions useEffect에서 자동 동기화됨
  };

  const handleDeletePosition = (id: number) => {
    deletePosition(id); // DB/localStorage 삭제
  };

  const handleAddStock = async (stock: {
    name: string;
    code: string;
    buyPrice: number;
    quantity: number;
  }) => {
    await addPosition(stock);
  };

  const handleAuthAction = () => {
    if (isLoggedIn) {
      signOut();
    } else {
      router.push('/login');
    }
  };

  // ── 종목 추가 버튼 핸들러 (프리미엄 체크 통합) ──
  const handleAddButtonClick = () => {
    if (!uiStore.canAddPosition(posStore.positions.length)) {
      uiStore.setShowUpgrade(true);
    } else {
      uiStore.setShowAddModal(true);
    }
  };

  // ── 요약 통계 (스토어 메서드 활용) ──
  const totalCost = posStore.getTotalCost();
  const totalValue = posStore.getTotalValue();
  const totalProfit = posStore.getTotalProfit();
  const totalProfitRate = posStore.getTotalProfitRate();

  // ── 로딩 ──
  if (authLoading || positionsLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #0a0a0f 0%, #0f172a 50%, #0a0a0f 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{ textAlign: 'center' }}>
          <svg width={48} height={48} viewBox="0 0 40 40" fill="none">
            <rect width="40" height="40" rx="10" fill="#1e293b" />
            <path d="M10 28 L16 14 L20 22 L24 12 L30 28" stroke="#3b82f6" strokeWidth="2.5"
              fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="24" cy="12" r="3" fill="#10b981" />
          </svg>
          <div style={{ color: '#64748b', fontSize: '14px', marginTop: '12px' }}>로딩 중...</div>
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
      <style>{`@keyframes pulse { 0%,100% { transform: translateX(-50%) scale(1); } 50% { transform: translateX(-50%) scale(1.15); } }`}</style>

      <ResponsiveHeader
        alerts={posStore.alerts}
        isPremium={uiStore.isPremium}
        isLoggedIn={isLoggedIn}
        onShowUpgrade={() => uiStore.setShowUpgrade(true)}
        onShowAddModal={handleAddButtonClick}
        onAuthAction={handleAuthAction}
        user={user}
        isMobile={isMobile}
        isTablet={isTablet}
        totalCost={totalCost}
        totalValue={totalValue}
        totalProfit={totalProfit}
        totalProfitRate={totalProfitRate}
      />

      <main style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: isMobile ? '0' : '20px',
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : isTablet ? '1fr 320px' : '1fr 380px',
          gap: isMobile ? '0' : '20px',
          alignItems: 'start',
        }}>
          {/* ★ 좌측: 보유 종목 */}
          <div style={{
            display: isMobile && uiStore.activeTab !== 'positions' ? 'none' : 'block',
            padding: isMobile ? '0 16px' : '0',
          }}>
            {isMobile && uiStore.activeTab === 'positions' && (
              <MarketMiniSummary onClick={() => uiStore.setActiveTab('market')} />
            )}

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <h2 style={{ fontSize: isMobile ? '16px' : '18px', fontWeight: '700', color: '#fff', margin: 0 }}>
                보유 종목 ({posStore.positions.length})
              </h2>
              {/* ★ 세션 31: + 추가 버튼 터치타겟 44px */}
              <button onClick={handleAddButtonClick} style={{
                padding: '6px 14px', height: '44px', minHeight: '44px',
                background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                border: 'none', borderRadius: '8px', color: '#fff',
                fontSize: '13px', fontWeight: '600', cursor: 'pointer',
              }}>+ 추가 {!uiStore.isPremium && `(${posStore.positions.length}/${uiStore.maxFreePositions})`}</button>
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
              {/* ★ 세션 31: 로그인 버튼 터치타겟 44px */}
              {!isLoggedIn && (
                <button onClick={() => router.push('/login')} style={{
                  padding: '8px 12px', minHeight: '44px',
                  background: 'rgba(59,130,246,0.15)',
                  border: '1px solid rgba(59,130,246,0.3)', borderRadius: '6px',
                  color: '#60a5fa', fontSize: '11px', fontWeight: '600', cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}>로그인</button>
              )}
            </div>

            {/* 종목이 없을 때 */}
            {posStore.positions.length === 0 && (
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
                {/* ★ 세션 31: 첫 종목 추가하기 버튼 터치타겟 44px */}
                <button onClick={() => uiStore.setShowAddModal(true)} style={{
                  padding: '10px 24px', minHeight: '44px',
                  background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                  border: 'none', borderRadius: '10px', color: '#fff',
                  fontSize: '14px', fontWeight: '600', cursor: 'pointer',
                }}>+ 첫 종목 추가하기</button>
              </div>
            )}

            {/* ★ PositionCard — props 최소화 (나머지는 스토어에서 직접 접근) */}
            {posStore.positions.map((pos) => (
              <PositionCard key={pos.id}
                position={pos}
                priceData={posStore.priceDataMap[pos.id]}
                isMobile={isMobile}
                isTablet={isTablet}
                onUpdate={handleUpdatePosition}
                onDelete={handleDeletePosition}
                isPremium={uiStore.isPremium}
                stockPrice={posStore.stockPrices[pos.code] || null}
                signals={posStore.signalsMap[pos.id] || null}
                aiNewsUsedCount={uiStore.aiNewsUsedCount}
                maxFreeAINews={uiStore.maxFreeAINews}
                onUseAINews={() => uiStore.incrementAINewsUsed()}
                onShowUpgrade={() => uiStore.setShowUpgrade(true)}
              />
            ))}

            {/* 카드 하단 광고 */}
            {!uiStore.isPremium && posStore.positions.length > 0 && (
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

          {/* ★ 우측 사이드바 */}
          {(!isMobile || uiStore.activeTab === 'market' || uiStore.activeTab === 'alerts' || uiStore.activeTab === 'guide') && (
            <div style={{ padding: isMobile ? '0 16px' : '0', overflow: 'visible' }}>
              <div style={{ display: isMobile && uiStore.activeTab !== 'market' ? 'none' : 'block' }}>
                {isMobile && uiStore.activeTab === 'market' && (
                  <button onClick={() => uiStore.setActiveTab('positions')} style={{
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
                <MarketCycleWidget isMobile={isMobile} isTablet={isTablet} isPremium={uiStore.isPremium} />
                <BuffettIndicatorWidget isMobile={isMobile} isPremium={uiStore.isPremium} />
              </div>

              {/* 알림 섹션 */}
              <div style={{
                display: isMobile && uiStore.activeTab !== 'alerts' ? 'none' : 'block',
                background: 'linear-gradient(145deg, #1e293b, #0f172a)',
                borderRadius: '14px', padding: isMobile ? '14px' : '16px',
                border: '1px solid rgba(255,255,255,0.06)', marginBottom: '12px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    🔔 조건 도달 알림
                    {posStore.alerts.length > 0 && (
                      <span style={{ background: '#ef4444', color: '#fff', padding: '2px 8px', borderRadius: '8px', fontSize: '11px', fontWeight: '700' }}>
                        {posStore.alerts.length}
                      </span>
                    )}
                  </h3>
                  {/* ★ 세션 31: 모두 지우기 버튼 터치타겟 44px */}
                  {posStore.alerts.length > 0 && (
                    <button onClick={() => posStore.clearAlerts()} style={{
                      background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: '6px',
                      padding: '8px 12px', minHeight: '44px',
                      color: '#64748b', fontSize: '11px', cursor: 'pointer',
                    }}>모두 지우기</button>
                  )}
                </div>
                {posStore.alerts.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '24px' }}>
                    <div style={{ fontSize: '28px', marginBottom: '8px' }}>✨</div>
                    <div style={{ fontSize: '13px', color: '#64748b' }}>현재 도달한 조건이 없습니다</div>
                  </div>
                ) : posStore.alerts.map((a) => (
                  <AlertCard key={a.id} alert={a} onDismiss={(id) => posStore.dismissAlert(id)} />
                ))}
              </div>

              {/* 매도법 가이드 */}
              <SellMethodGuide isMobile={isMobile} activeTab={uiStore.activeTab} />
            </div>
          )}
        </div>
      </main>

      {/* 모바일 하단 네비게이션 */}
      {isMobile && (
        <MobileBottomNav
          activeTab={uiStore.activeTab}
          onTabChange={uiStore.setActiveTab}
          alertCount={posStore.alerts.length}
        />
      )}

      {/* ★ 종목 추가 모달 */}
      {uiStore.showAddModal && (
        <AddStockModal
          isMobile={isMobile}
          maxFreePositions={uiStore.maxFreePositions}
          currentPositionCount={posStore.positions.length}
          isPremium={uiStore.isPremium}
          onClose={() => uiStore.setShowAddModal(false)}
          onAdd={handleAddStock}
        />
      )}

      {/* 업그레이드 팝업 */}
      {uiStore.showUpgrade && (
        <UpgradePopup
          isMobile={isMobile}
          maxFreePositions={uiStore.maxFreePositions}
          maxFreeAINews={uiStore.maxFreeAINews}
          onClose={() => uiStore.setShowUpgrade(false)}
        />
      )}

      {/* 푸터 */}
      <Footer isMobile={isMobile} />
    </div>
  );
}
