'use client';
// ============================================
// CRESTApp - 메인 앱 컴포넌트
// 경로: src/components/CRESTApp.tsx
// 세션 22A: Mock 차트 → Yahoo Finance 과거 데이터 전환
// 변경사항:
//   - useStockHistory 훅 추가 (과거 60일 OHLCV)
//   - generateMockPriceData 제거 → 실제 차트 데이터
//   - priceDataMap = historyMap + 실시간 가격 오버레이
//   - 차트 로딩 상태 표시
// ============================================

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import useResponsive from '@/hooks/useResponsive';
import useAuth from '@/hooks/useAuth';
import usePositions from '@/hooks/usePositions';
import useStockPrices from '@/hooks/useStockPrices';
import useStockHistory from '@/hooks/useStockHistory'; // ★ 세션 22A 추가
import { SELL_PRESETS, formatCompact } from '@/constants'; // ★ generateMockPriceData 제거
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
  { id: 1, stockName: '삼성전자', code: '005930', preset: SELL_PRESETS.stopLoss,
    message: '손절 기준가(-5%) 근접! 현재 -4.2%', currentPrice: 68500, targetPrice: 67925, timestamp: Date.now() - 300000 },
  { id: 2, stockName: '한화에어로스페이스', code: '012450', preset: SELL_PRESETS.twoThird,
    message: '최고점 대비 1/3 하락 근접', currentPrice: 365000, targetPrice: 369600, timestamp: Date.now() - 1800000 },
];

export default function CRESTApp() {
  const router = useRouter();
  const { isMobile, isTablet, width } = useResponsive();
  const { user, isLoggedIn, isLoading: authLoading, signOut } = useAuth();

  // ★ 포지션 CRUD
  const {
    positions,
    isLoading: positionsLoading,
    addPosition,
    updatePosition,
    deletePosition,
  } = usePositions(user?.id ?? null);

  // ★ 세션 21: 실시간 주가 훅
  const {
    prices: stockPrices,
    isLoading: pricesLoading,
    error: pricesError,
    lastUpdated: pricesLastUpdated,
    getCurrentPrice,
    refresh: refreshPrices,
  } = useStockPrices(positions);

  // ★ 세션 22A: 과거 차트 데이터 훅 (Mock 대체)
  const {
    historyMap,
    isLoading: historyLoading,
    error: historyError,
  } = useStockHistory(positions);

  const [activeTab, setActiveTab] = useState('positions');
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // 알림 상태 (추후 DB 연동 예정)
  const [alerts, setAlerts] = useState<Alert[]>(DEMO_ALERTS);

  const isPremium = false;
  const MAX_FREE_POSITIONS = 3;
  const MAX_FREE_AI_NEWS = 3;
  const [aiNewsUsedCount, setAiNewsUsedCount] = useState(0);

  // ★ 세션 22A: 차트 데이터 = 과거 데이터 + 실시간 가격 오버레이
  // historyMap에서 가져온 실제 데이터의 마지막 캔들을 실시간 가격으로 업데이트
  const priceDataMap = useMemo(() => {
    const result: Record<number, any[]> = {};

    positions.forEach((p) => {
      const history = historyMap[p.id];
      if (!history || history.length === 0) {
        // 아직 로딩 중이거나 데이터 없음 → 빈 배열
        result[p.id] = [];
        return;
      }

      // 실시간 가격으로 마지막 캔들 업데이트
      const realPrice = stockPrices[p.code]?.price;
      if (realPrice) {
        const data = [...history];
        const lastCandle = { ...data[data.length - 1] };
        lastCandle.close = realPrice;
        lastCandle.high = Math.max(lastCandle.high, realPrice);
        lastCandle.low = Math.min(lastCandle.low, realPrice);
        data[data.length - 1] = lastCandle;
        result[p.id] = data;
      } else {
        result[p.id] = history;
      }
    });

    return result;
  }, [positions, historyMap, stockPrices]);

  // ── 핸들러 ──
  const handleUpdatePosition = (updated: Position) => {
    updatePosition(updated);
  };
  const handleDeletePosition = (id: number) => {
    deletePosition(id);
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

  // ★ 요약 통계 — 실시간 가격 기반으로 계산
  const totalCost = positions.reduce((s, p) => s + p.buyPrice * p.quantity, 0);
  const totalValue = positions.reduce((s, p) => {
    // 1순위: 실시간 주가, 2순위: 차트 마지막 종가, 3순위: 매수가
    const realPrice = getCurrentPrice(p.code, 0);
    const chartPrice = priceDataMap[p.id]?.[priceDataMap[p.id]?.length - 1]?.close;
    const price = realPrice || chartPrice || p.buyPrice;
    return s + price * p.quantity;
  }, 0);
  const totalProfit = totalValue - totalCost;
  const totalProfitRate = totalCost > 0 ? (totalProfit / totalCost) * 100 : 0;

  // ★ 마지막 갱신 시각 포맷
  const formatLastUpdated = (): string => {
    if (!pricesLastUpdated) return '';
    const now = Date.now();
    const diff = Math.floor((now - pricesLastUpdated) / 1000);
    if (diff < 10) return '방금 전';
    if (diff < 60) return `${diff}초 전`;
    if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
    return new Date(pricesLastUpdated).toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // 로딩 스켈레톤
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
            : { display: 'grid', gridTemplateColumns: isPremium ? '1fr 380px 320px' : '1fr 380px', gap: '16px', padding: '0 20px' }
        }>
          {/* ── 메인 컬럼: 포지션 ── */}
          <div>
            {(isMobile ? activeTab === 'positions' : true) && (
              <>
                {/* 보유 종목 헤더 */}
                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: isMobile ? '16px 16px 8px' : '0 0 12px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h2 style={{ fontSize: isMobile ? '16px' : '18px', fontWeight: '700', color: '#fff', margin: 0 }}>
                      보유 종목 ({positions.length})
                    </h2>
                    {/* 실시간 가격 상태 표시 */}
                    {positions.length > 0 && (
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: '4px',
                        padding: '2px 8px', borderRadius: '6px',
                        background: pricesError
                          ? 'rgba(239,68,68,0.1)'
                          : pricesLoading
                          ? 'rgba(59,130,246,0.1)'
                          : 'rgba(16,185,129,0.1)',
                        border: `1px solid ${
                          pricesError
                            ? 'rgba(239,68,68,0.2)'
                            : pricesLoading
                            ? 'rgba(59,130,246,0.2)'
                            : 'rgba(16,185,129,0.2)'
                        }`,
                      }}>
                        <div style={{
                          width: '6px', height: '6px', borderRadius: '50%',
                          background: pricesError ? '#ef4444' : pricesLoading ? '#3b82f6' : '#10b981',
                          animation: pricesLoading ? 'pulse 1.5s infinite' : 'none',
                        }} />
                        <span style={{
                          fontSize: '10px',
                          color: pricesError ? '#ef4444' : pricesLoading ? '#60a5fa' : '#10b981',
                        }}>
                          {pricesError ? '연결 오류' : pricesLoading ? '갱신중' : formatLastUpdated()}
                        </span>
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {/* 수동 새로고침 버튼 */}
                    {positions.length > 0 && (
                      <button
                        onClick={refreshPrices}
                        disabled={pricesLoading}
                        style={{
                          width: '34px', height: '34px',
                          background: 'rgba(255,255,255,0.06)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '8px', cursor: pricesLoading ? 'not-allowed' : 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          opacity: pricesLoading ? 0.5 : 1,
                          transition: 'opacity 0.2s',
                        }}
                        title="주가 새로고침"
                      >
                        <span style={{
                          fontSize: '14px',
                          display: 'inline-block',
                          animation: pricesLoading ? 'spin 1s linear infinite' : 'none',
                        }}>🔄</span>
                      </button>
                    )}

                    {/* 종목 추가 버튼 */}
                    <button
                      onClick={() => {
                        if (!isPremium && positions.length >= MAX_FREE_POSITIONS) {
                          setShowUpgrade(true);
                        } else {
                          setShowAddModal(true);
                        }
                      }}
                      style={{
                        padding: '8px 14px',
                        background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                        border: 'none', borderRadius: '10px',
                        color: '#fff', fontSize: '13px', fontWeight: '700',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px',
                      }}
                    >
                      <span style={{ fontSize: '16px' }}>+</span> 종목 추가
                    </button>
                  </div>
                </div>

                {/* ★ 세션 22A: 차트 로딩 상태 */}
                {historyLoading && positions.length > 0 && (
                  <div style={{
                    padding: isMobile ? '8px 16px' : '8px 0',
                    display: 'flex', alignItems: 'center', gap: '6px',
                  }}>
                    <div style={{
                      width: '8px', height: '8px', borderRadius: '50%',
                      background: '#f59e0b',
                      animation: 'pulse 1.5s infinite',
                    }} />
                    <span style={{ fontSize: '11px', color: '#f59e0b' }}>
                      차트 데이터 로딩 중...
                    </span>
                  </div>
                )}

                {/* 포지션 카드 목록 */}
                <div style={{ padding: isMobile ? '0 12px' : '0' }}>
                  {positions.length === 0 ? (
                    <div style={{
                      textAlign: 'center', padding: '40px 20px',
                      background: 'linear-gradient(145deg, #1e293b, #0f172a)',
                      borderRadius: '14px', border: '1px solid rgba(255,255,255,0.06)',
                    }}>
                      <div style={{ fontSize: '40px', marginBottom: '12px' }}>📊</div>
                      <div style={{ fontSize: '15px', color: '#94a3b8', fontWeight: '600', marginBottom: '6px' }}>
                        아직 등록된 종목이 없습니다
                      </div>
                      <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>
                        종목을 추가하고 매도 시그널을 받아보세요
                      </div>
                      <button
                        onClick={() => setShowAddModal(true)}
                        style={{
                          padding: '10px 24px',
                          background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                          border: 'none', borderRadius: '10px',
                          color: '#fff', fontSize: '14px', fontWeight: '600', cursor: 'pointer',
                        }}
                      >
                        + 첫 번째 종목 추가
                      </button>
                    </div>
                  ) : (
                    positions.map((pos) => (
                      <PositionCard
                        key={pos.id}
                        position={pos}
                        priceData={priceDataMap[pos.id]}
                        isMobile={isMobile}
                        isTablet={isTablet}
                        isPremium={isPremium}
                        onUpdate={handleUpdatePosition}
                        onDelete={handleDeletePosition}
                        stockPrice={stockPrices[pos.code]}
                        aiNewsUsedCount={aiNewsUsedCount}
                        maxFreeAINews={MAX_FREE_AI_NEWS}
                        onUseAINews={() => setAiNewsUsedCount((c) => c + 1)}
                        onShowUpgrade={() => setShowUpgrade(true)}
                      />
                    ))
                  )}
                </div>
              </>
            )}

            {/* 모바일: 알림 탭 */}
            {isMobile && activeTab === 'alerts' && (
              <div style={{ padding: '12px 12px' }}>
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
            )}
          </div>

          {/* ── 사이드바 ── */}
          {(!isMobile || activeTab === 'market') && (
            <div>
              <MarketMiniSummary onClick={() => isMobile && setActiveTab('market')} />
              <MarketCycleWidget isMobile={isMobile} activeTab={activeTab} />
              <BuffettIndicatorWidget isMobile={isMobile} activeTab={activeTab} />

              {/* 데스크톱: 알림 */}
              <div style={{
                display: isMobile ? 'none' : 'block',
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

          {/* 모바일: 가이드 탭 */}
          {isMobile && activeTab === 'guide' && (
            <div style={{ padding: '0 12px' }}>
              <SellMethodGuide isMobile={isMobile} activeTab={activeTab} />
            </div>
          )}
        </div>
      </main>

      {/* 모바일 하단 네비게이션 */}
      {isMobile && <MobileBottomNav activeTab={activeTab} onTabChange={setActiveTab} alertCount={alerts.length} />}

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

      {/* spin 애니메이션 (새로고침 버튼용) */}
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
