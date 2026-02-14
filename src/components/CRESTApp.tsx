'use client';
// ============================================
// CRESTApp - 메인 앱 컴포넌트
// 경로: src/components/CRESTApp.tsx
// 세션 62 hotfix: useStockHistory/useStockPrices 연동 + 90일 차트
// ============================================

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useResponsive from '@/hooks/useResponsive';
import useAuth from '@/hooks/useAuth';
import usePositions from '@/hooks/usePositions';
import useStockHistory from '@/hooks/useStockHistory';
import useStockPrices from '@/hooks/useStockPrices';
import { SELL_PRESETS, generateMockPriceData, formatCompact } from '@/constants';
import type { Position, Alert, CandleData } from '@/types';

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

const DEMO_ALERTS: Alert[] = [
  { id: 1, stockName: '\uc0bc\uc131\uc804\uc790', code: '005930', preset: SELL_PRESETS.stopLoss, message: '\uc190\uc808 \uae30\uc900\uac00(-5%) \uadfc\uc811! \ud604\uc7ac -4.2%', currentPrice: 68500, targetPrice: 67925, timestamp: Date.now() - 300000 },
  { id: 2, stockName: '\ud55c\ud654\uc5d0\uc5b4\ub85c\uc2a4\ud398\uc774\uc2a4', code: '012450', preset: SELL_PRESETS.twoThird, message: '\ucd5c\uace0\uc810 \ub300\ube44 1/3 \ud558\ub77d \uadfc\uc811', currentPrice: 365000, targetPrice: 369600, timestamp: Date.now() - 1800000 },
];

export default function CRESTApp() {
  const router = useRouter();
  const { isMobile, isTablet, width } = useResponsive();
  const { user, isLoggedIn, isLoading: authLoading, signOut } = useAuth();
  const { positions, isLoading: positionsLoading, addPosition, updatePosition, deletePosition } = usePositions(user?.id ?? null);

  // ★ 실제 API 훅
  const { historyMap, isLoading: historyLoading, error: historyError } = useStockHistory(positions);
  const { prices: stockPriceMap, isLoading: pricesLoading } = useStockPrices(positions);

  const [activeTab, setActiveTab] = useState('positions');
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [alerts, setAlerts] = useState<Alert[]>(DEMO_ALERTS);
  const [priceDataMap, setPriceDataMap] = useState<Record<number, CandleData[]>>({});
  const isPremium = false;
  const MAX_FREE_POSITIONS = 3;
  const MAX_FREE_AI_NEWS = 3;
  const [aiNewsUsedCount, setAiNewsUsedCount] = useState(0);

  // API 우선, Mock 폴백 (90일)
  useEffect(() => {
    if (positions.length === 0) return;
    const newMap: Record<number, CandleData[]> = {};
    positions.forEach((p) => {
      if (historyMap[p.id] && historyMap[p.id].length > 0) {
        newMap[p.id] = historyMap[p.id];
      } else if (priceDataMap[p.id]) {
        newMap[p.id] = priceDataMap[p.id];
      } else {
        newMap[p.id] = generateMockPriceData(p.buyPrice, 90);
      }
    });
    setPriceDataMap(newMap);
  }, [positions, historyMap]);

  const handleUpdatePosition = (updated: Position) => { updatePosition(updated); };
  const handleDeletePosition = (id: number) => { deletePosition(id); };
  const handleAddStock = async (stock: { name: string; code: string; buyPrice: number; quantity: number; }) => { await addPosition(stock); };
  const handleAuthAction = () => { if (isLoggedIn) signOut(); else router.push('/login'); };

  const totalCost = positions.reduce((s, p) => s + p.buyPrice * p.quantity, 0);
  const totalValue = positions.reduce((s, p) => {
    const realPrice = stockPriceMap[p.code]?.price;
    const chartPrice = priceDataMap[p.id]?.[priceDataMap[p.id]?.length - 1]?.close;
    return s + (realPrice || chartPrice || p.buyPrice) * p.quantity;
  }, 0);
  const totalProfit = totalValue - totalCost;
  const totalProfitRate = totalCost > 0 ? (totalProfit / totalCost) * 100 : 0;

  if (authLoading || positionsLoading) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #0a0a0f 0%, #0f172a 50%, #0a0a0f 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <svg width={48} height={48} viewBox="0 0 40 40" fill="none"><rect width="40" height="40" rx="10" fill="#1e293b" /><path d="M10 28 L16 14 L20 22 L24 12 L30 28" stroke="#3b82f6" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" /><circle cx="24" cy="12" r="3" fill="#10b981" /></svg>
          <div style={{ color: '#64748b', fontSize: '14px', marginTop: '12px' }}>{'\ub85c\ub529 \uc911...'}</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #0a0a0f 0%, #0f172a 50%, #0a0a0f 100%)', color: '#fff', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontSize: '14px', paddingBottom: isMobile ? 'calc(70px + env(safe-area-inset-bottom, 0px))' : '0' }}>
      <style>{`@keyframes pulse { 0%,100% { transform: translateX(-50%) scale(1); } 50% { transform: translateX(-50%) scale(1.15); } }`}</style>

      <ResponsiveHeader alerts={alerts} isPremium={isPremium} isLoggedIn={isLoggedIn}
        onShowUpgrade={() => setShowUpgrade(true)}
        onShowAddModal={() => { if (!isPremium && positions.length >= MAX_FREE_POSITIONS) setShowUpgrade(true); else setShowAddModal(true); }}
        onLogin={handleAuthAction} isMobile={isMobile} isTablet={isTablet} />

      <main style={{ maxWidth: isMobile ? '100%' : isTablet ? '1200px' : '1600px', margin: '0 auto', padding: isMobile ? '0' : '24px' }}>
        <ResponsiveSummaryCards totalCost={totalCost} totalValue={totalValue} totalProfit={totalProfit} totalProfitRate={totalProfitRate} isMobile={isMobile} isTablet={isTablet} />

        <div style={
          isMobile ? { display: 'flex', flexDirection: 'column' as const, gap: '0' }
            : isTablet ? { display: 'grid', gridTemplateColumns: '1fr 360px', gap: '16px', padding: '0 20px' }
            : { display: 'grid', gridTemplateColumns: isPremium ? '1fr 440px' : '160px 1fr 440px', gap: '20px' }
        }>
          {/* 좌측 광고 */}
          {!isMobile && !isTablet && !isPremium && (
            <div style={{ position: 'sticky', top: '80px', alignSelf: 'start' }}>
              <div style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))', borderRadius: '12px', padding: '12px 8px', border: '1px dashed rgba(255,255,255,0.08)', textAlign: 'center', minHeight: '600px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ fontSize: '10px', color: '#475569', marginBottom: '8px', letterSpacing: '1px' }}>AD</div>
                <div style={{ fontSize: '11px', color: '#64748b', textAlign: 'center' }}>{'\ud83d\udce2 Google'}<br />AdSense<br />(160{'\u00d7'}600)<div style={{ fontSize: '9px', color: '#475569', marginTop: '8px' }}>{'PRO \uad6c\ub3c5 \uc2dc'}<br />{'\uad11\uace0 \uc81c\uac70'}</div></div>
              </div>
            </div>
          )}

          {/* 포지션 목록 */}
          <div style={{ display: isMobile && activeTab !== 'positions' ? 'none' : 'block', padding: isMobile ? '0 16px' : '0' }}>
            {isMobile && activeTab === 'positions' && <MarketMiniSummary onClick={() => setActiveTab('market')} />}

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <h2 style={{ fontSize: isMobile ? '16px' : '18px', fontWeight: '700', color: '#fff', margin: 0 }}>
                {'\ubcf4\uc720 \uc885\ubaa9'} ({positions.length})
                {historyLoading && <span style={{ fontSize: '10px', color: '#f59e0b', marginLeft: '8px', fontWeight: 500 }}>{'\ucc28\ud2b8 \ub85c\ub529\uc911...'}</span>}
              </h2>
              <button onClick={() => { if (!isPremium && positions.length >= MAX_FREE_POSITIONS) setShowUpgrade(true); else setShowAddModal(true); }} style={{ padding: '6px 14px', height: '34px', background: 'linear-gradient(135deg, #3b82f6, #2563eb)', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
                + {'\ucd94\uac00'} {!isPremium && `(${positions.length}/${MAX_FREE_POSITIONS})`}
              </button>
            </div>

            {/* 인증 배너 */}
            <div style={{ background: isLoggedIn ? 'rgba(16,185,129,0.06)' : 'rgba(59,130,246,0.06)', border: `1px solid ${isLoggedIn ? 'rgba(16,185,129,0.12)' : 'rgba(59,130,246,0.12)'}`, borderRadius: '10px', padding: '10px 14px', marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: isLoggedIn ? '#10b981' : '#3b82f6' }} />
                <div style={{ fontSize: '11px', color: '#64748b' }}>{isLoggedIn ? '\ub0b4 \uc885\ubaa9\uc774 \uc790\ub3d9 \uc800\uc7a5\ub429\ub2c8\ub2e4' : '\ub85c\uadf8\uc778\ud558\uba74 \ub0b4 \uc885\ubaa9\uc744 \uc800\uc7a5/\uad00\ub9ac\ud560 \uc218 \uc788\uc2b5\ub2c8\ub2e4'}</div>
              </div>
              {!isLoggedIn && <button onClick={() => router.push('/login')} style={{ padding: '6px 12px', background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)', borderRadius: '6px', color: '#60a5fa', fontSize: '11px', fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap' }}>{'\ub85c\uadf8\uc778'}</button>}
            </div>

            {/* 빈 상태 */}
            {positions.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px 20px', background: 'linear-gradient(145deg, #1e293b, #0f172a)', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontSize: '40px', marginBottom: '12px' }}>{'\ud83d\udcc8'}</div>
                <div style={{ fontSize: '16px', fontWeight: '700', color: '#fff', marginBottom: '8px' }}>{'\uc885\ubaa9\uc744 \ucd94\uac00\ud574 \ubcf4\uc138\uc694'}</div>
                <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>{'\ud55c\uad6d\xb7\ubbf8\uad6d \uc8fc\uc2dd\uc744 \uac80\uc0c9\ud558\uace0 \ub9e4\ub3c4 \uc870\uac74\uc744 \uc124\uc815\ud558\uc138\uc694'}</div>
                <button onClick={() => setShowAddModal(true)} style={{ padding: '10px 24px', background: 'linear-gradient(135deg, #3b82f6, #2563eb)', border: 'none', borderRadius: '10px', color: '#fff', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>+ {'\uccab \uc885\ubaa9 \ucd94\uac00\ud558\uae30'}</button>
              </div>
            )}

            {/* API 에러 배너 */}
            {historyError && (
              <div style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: '10px', padding: '10px 14px', marginBottom: '12px', fontSize: '11px', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '8px' }}>
                {'\u26a0\ufe0f'} {historyError} {'\u2014 \uc784\uc2dc \ucc28\ud2b8 \ub370\uc774\ud130\ub97c \ud45c\uc2dc\ud569\ub2c8\ub2e4'}
              </div>
            )}

            {positions.map((pos) => (
              <PositionCard key={pos.id} position={pos} priceData={priceDataMap[pos.id]}
                isMobile={isMobile} isTablet={isTablet}
                onUpdate={handleUpdatePosition} onDelete={handleDeletePosition}
                isPremium={isPremium} aiNewsUsedCount={aiNewsUsedCount} maxFreeAINews={MAX_FREE_AI_NEWS}
                onUseAINews={() => setAiNewsUsedCount(prev => prev + 1)} onShowUpgrade={() => setShowUpgrade(true)} />
            ))}

            {/* 광고 */}
            {!isPremium && positions.length > 0 && (
              <div style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))', borderRadius: '12px', padding: '16px', marginTop: '8px', border: '1px dashed rgba(255,255,255,0.06)', textAlign: 'center' }}>
                <div style={{ fontSize: '10px', color: '#475569', letterSpacing: '1px', marginBottom: '4px' }}>AD</div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>{'\ud83d\udce2 AdSense (320\u00d7100)'}</div>
                <div style={{ fontSize: '9px', color: '#475569', marginTop: '4px' }}>{'PRO \uad6c\ub3c5 \uc2dc \uad11\uace0 \uc81c\uac70'}</div>
              </div>
            )}
          </div>

          {/* 우측 사이드바 */}
          {(!isMobile || activeTab === 'market' || activeTab === 'alerts' || activeTab === 'guide') && (
            <div style={{ padding: isMobile ? '0 16px' : '0', overflow: 'visible' }}>
              <div style={{ display: isMobile && activeTab !== 'market' ? 'none' : 'block' }}>
                {isMobile && activeTab === 'market' && (
                  <button onClick={() => setActiveTab('positions')} style={{ width: '100%', padding: '10px 14px', marginBottom: '10px', minHeight: '44px', background: 'linear-gradient(135deg, rgba(59,130,246,0.08), rgba(59,130,246,0.03))', border: '1px solid rgba(59,130,246,0.15)', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(59,130,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', color: '#60a5fa' }}>{'\u2190'}</span>
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontSize: '13px', fontWeight: '700', color: '#60a5fa' }}>{'\ubcf4\uc720 \uc885\ubaa9\uc73c\ub85c \ub3cc\uc544\uac00\uae30'}</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>{'\ud3ec\uc9c0\uc158 \xb7 \ucc28\ud2b8 \xb7 AI\ubd84\uc11d'}</div>
                    </div>
                  </button>
                )}
                <MarketCycleWidget isMobile={isMobile} isTablet={isTablet} isPremium={isPremium} />
                <BuffettIndicatorWidget isMobile={isMobile} isPremium={isPremium} />
              </div>

              <div style={{ display: isMobile && activeTab !== 'alerts' ? 'none' : 'block', background: 'linear-gradient(145deg, #1e293b, #0f172a)', borderRadius: '14px', padding: isMobile ? '14px' : '16px', border: '1px solid rgba(255,255,255,0.06)', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {'\ud83d\udd14 \uc870\uac74 \ub3c4\ub2ec \uc54c\ub9bc'}
                    {alerts.length > 0 && <span style={{ background: '#ef4444', color: '#fff', padding: '2px 8px', borderRadius: '8px', fontSize: '11px', fontWeight: '700' }}>{alerts.length}</span>}
                  </h3>
                  {alerts.length > 0 && <button onClick={() => setAlerts([])} style={{ background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: '6px', padding: '6px 10px', color: '#64748b', fontSize: '11px', cursor: 'pointer' }}>{'\ubaa8\ub450 \uc9c0\uc6b0\uae30'}</button>}
                </div>
                {alerts.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '24px' }}>
                    <div style={{ fontSize: '28px', marginBottom: '8px' }}>{'\u2728'}</div>
                    <div style={{ fontSize: '13px', color: '#64748b' }}>{'\ud604\uc7ac \ub3c4\ub2ec\ud55c \uc870\uac74\uc774 \uc5c6\uc2b5\ub2c8\ub2e4'}</div>
                  </div>
                ) : alerts.map((a) => <AlertCard key={a.id} alert={a} onDismiss={(id) => setAlerts((prev) => prev.filter((x) => x.id !== id))} />)}
              </div>

              <SellMethodGuide isMobile={isMobile} activeTab={activeTab} />
            </div>
          )}
        </div>
      </main>

      {isMobile && <MobileBottomNav activeTab={activeTab} onTabChange={setActiveTab} alertCount={alerts.length} />}
      {showAddModal && <AddStockModal isMobile={isMobile} maxFreePositions={MAX_FREE_POSITIONS} currentPositionCount={positions.length} isPremium={isPremium} onClose={() => setShowAddModal(false)} onAdd={handleAddStock} />}
      {showUpgrade && <UpgradePopup isMobile={isMobile} maxFreePositions={MAX_FREE_POSITIONS} maxFreeAINews={MAX_FREE_AI_NEWS} onClose={() => setShowUpgrade(false)} />}
      <Footer isMobile={isMobile} />
    </div>
  );
}
