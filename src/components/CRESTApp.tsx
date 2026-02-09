'use client';
// ============================================
// CRESTApp - 메인 앱 컴포넌트
// 경로: src/components/CRESTApp.tsx
// 세션 19: usePositions 연동 (DB CRUD + localStorage)
// 세션 23: Mock 제거 + useStockHistory/useStockPrices 실시간 연동
// 세션 24: calculateAllSignals 시그널 엔진 연동
// ============================================

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import useResponsive from '@/hooks/useResponsive';
import useAuth from '@/hooks/useAuth';
import usePositions from '@/hooks/usePositions';
import useStockHistory from '@/hooks/useStockHistory';
import useStockPrices from '@/hooks/useStockPrices';
import { calculateAllSignals } from '@/lib/sellSignals';
import { SELL_PRESETS } from '@/constants';
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

  // ★ usePositions 훅으로 DB 연동
  const {
    positions,
    isLoading: positionsLoading,
    addPosition,
    updatePosition,
    deletePosition,
  } = usePositions(user?.id ?? null);

  // ★ 세션 23: 실시간 주가 + 과거 차트 데이터
  const stockCodes = useMemo(() => positions.map(p => p.code), [positions]);
  const { prices: stockPrices } = useStockPrices(stockCodes);
  const { historyMap, isLoading: historyLoading } = useStockHistory(positions);

  const [activeTab, setActiveTab] = useState('positions');
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [alerts, setAlerts] = useState<Alert[]>(DEMO_ALERTS);

  const isPremium = false;
  const MAX_FREE_POSITIONS = 3;
  const MAX_FREE_AI_NEWS = 3;
  const [aiNewsUsedCount, setAiNewsUsedCount] = useState(0);

  // ★ 세션 23: priceDataMap 합성 (history + 실시간 오버레이)
  const priceDataMap = useMemo(() => {
    const map: Record<number, any[]> = {};
    positions.forEach(p => {
      const history = historyMap[p.id];
      if (!history || history.length === 0) return;

      const realtime = stockPrices[p.code];
      if (realtime) {
        // 마지막 캔들에 실시간 가격 오버레이
        const updated = [...history];
        const last = { ...updated[updated.length - 1] };
        last.close = realtime.price;
        last.high = Math.max(last.high, realtime.price);
        last.low = Math.min(last.low, realtime.price);
        updated[updated.length - 1] = last;
        map[p.id] = updated;
      } else {
        map[p.id] = history;
      }
    });
    return map;
  }, [positions, historyMap, stockPrices]);

  // ★ 세션 24: 매도 시그널 계산
  const signalsMap = useMemo<Record<number, PositionSignals>>(() => {
    const map: Record<number, PositionSignals> = {};
    positions.forEach(p => {
      const candles = priceDataMap[p.id] || [];
      const currentPrice = getCurrentPrice(p);
      if (candles.length > 0 && currentPrice > 0) {
        map[p.id] = calculateAllSignals({ position: p, candles, currentPrice });
      }
    });
    return map;
  }, [positions, priceDataMap, stockPrices]);

  // 현재가 우선순위: 실시간 > 차트 마지막 종가 > 매수가
  function getCurrentPrice(p: Position): number {
    const realtime = stockPrices[p.code];
    if (realtime?.price) return realtime.price;
    const history = priceDataMap[p.id];
    if (history?.length) return history[history.length - 1].close;
    return p.buyPrice;
  }

  // ── 핸들러 ──
  const handleUpdatePosition = (updated: Position) => updatePosition(updated);
  const handleDeletePosition = (id: number) => deletePosition(id);

  const handleAddStock = async (stock: {
    name: string; code: string; buyPrice: number; quantity: number;
  }) => {
    await addPosition(stock);
  };

  const handleAuthAction = () => {
    if (isLoggedIn) { signOut(); } else { router.push('/login'); }
  };

  // 요약 통계
  const totalCost = positions.reduce((s, p) => s + p.buyPrice * p.quantity, 0);
  const totalValue = positions.reduce((s, p) => {
    return s + getCurrentPrice(p) * p.quantity;
  }, 0);
  const totalProfit = totalValue - totalCost;
  const totalProfitRate = totalCost > 0 ? (totalProfit / totalCost) * 100 : 0;

  // ★ 세션 24: 전체 활성 시그널 수 (알림 배지용)
  const totalActiveSignals = Object.values(signalsMap).reduce((sum, ps) => sum + ps.activeCount, 0);

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
          }}>
            {isMobile && activeTab === 'positions' && (
              <MarketMiniSummary onClick={() => setActiveTab('market')} />
            )}

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <h2 style={{ fontSize: isMobile ? '16px' : '18px', fontWeight: '700', color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                보유 종목 ({positions.length})
                {/* ★ 세션 24: 활성 시그널 배지 */}
                {totalActiveSignals > 0 && (
                  <span style={{
                    background: '#ef4444', color: '#fff', padding: '2px 7px',
                    borderRadius: '8px', fontSize: '11px', fontWeight: '700',
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

            {/* ★ 차트 로딩 인디케이터 */}
            {historyLoading && positions.length > 0 && (
              <div style={{
                padding: '8px 12px', marginBottom: '8px', borderRadius: '8px',
                background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.15)',
                fontSize: '12px', color: '#60a5fa', textAlign: 'center',
              }}>
                📡 차트 데이터 로딩 중...
              </div>
            )}

            {positions.map((pos) => (
              <PositionCard key={pos.id}
                position={pos} priceData={priceDataMap[pos.id]}
                isMobile={isMobile} isTablet={isTablet}
                onUpdate={handleUpdatePosition} onDelete={handleDeletePosition}
                isPremium={isPremium}
                stockPrice={stockPrices[pos.code] || null}
                signals={signalsMap[pos.id] || null}
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

          {/* 우측 사이드바 */}
          {(!isMobile || activeTab === 'market' || activeTab === 'alerts' || activeTab === 'guide') && (
            <div style={{ padding: isMobile ? '0 16px' : '0', overflow: 'visible' }}>
              <div style={{ display: isMobile && activeTab !== 'market' ? 'none' : 'block' }}>
                {isMobile && activeTab === 'market' && (
                  <button onClick={() => setActiveTab('positions')} style={{
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

      {/* PWA 설치 프롬프트 */}
      <InstallPrompt isMobile={isMobile} />

      {/* 모바일 하단 네비게이션 */}
      {isMobile && <MobileBottomNav activeTab={activeTab} onTabChange={setActiveTab} alertCount={alerts.length} />}

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

      {/* 푸터 */}
      <Footer isMobile={isMobile} />
    </div>
  );
}
