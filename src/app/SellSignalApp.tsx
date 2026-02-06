'use client';

// ============================================
// src/app/SellSignalApp.tsx
// 메인 앱 컴포넌트 — 원본 JSX 2890~3548줄 기반 TypeScript 재구축
// 세션 10: 전체 교체
// ============================================

import { useState, useEffect } from 'react';
import { useResponsive } from '../hooks/useResponsive';
import { generateMockPriceData } from '../utils';
import { SELL_PRESETS } from '../constants';
import ResponsiveHeader from '../components/ResponsiveHeader';
import SummaryCards from '../components/SummaryCards';
import MobileNav from '../components/MobileNav';
import MarketCycleWidget from '../components/MarketCycleWidget';
import PositionCard from '../components/PositionCard';
import EnhancedCandleChart from '../components/EnhancedCandleChart';
import EarningsWidget from '../components/EarningsWidget';
import StockModal from '../components/StockModal';
import UpgradeModal from '../components/UpgradeModal';
import AlertCard from '../components/AlertCard';
import SellMethodGuide from '../components/SellMethodGuide';
import type { Position, PriceData, Alert } from '../types';
import React from 'react';

// ============================================
// 메인 앱 컴포넌트
// ============================================
export default function SellSignalApp() {
  const { isMobile, isTablet, isDesktop, width } = useResponsive();

  // ----- 상태 관리 -----
  const [user, setUser] = useState({ membership: 'free', email: 'demo@test.com' });

  // 데모 포지션 데이터 (삼성전자, 현대차, 한화에어로스페이스)
  const [positions, setPositions] = useState<Position[]>([
    {
      id: 1,
      name: '삼성전자',
      code: '005930',
      buyPrice: 50000,
      quantity: 400,
      highestPrice: 55000,
      selectedPresets: ['candle3', 'stopLoss', 'twoThird', 'maSignal'],
      presetSettings: { stopLoss: { value: -5 }, maSignal: { value: 20 } },
    },
    {
      id: 2,
      name: '현대차',
      code: '005380',
      buyPrice: 215000,
      quantity: 20,
      highestPrice: 228000,
      selectedPresets: ['candle3', 'stopLoss', 'maSignal'],
      presetSettings: { stopLoss: { value: -3 }, maSignal: { value: 20 } },
    },
    {
      id: 3,
      name: '한화에어로스페이스',
      code: '012450',
      buyPrice: 285000,
      quantity: 15,
      highestPrice: 412000,
      selectedPresets: ['twoThird', 'maSignal', 'volumeZone', 'fundamental'],
      presetSettings: { maSignal: { value: 60 } },
    },
  ]);

  // 가격 데이터 맵 (포지션ID → PriceData[])
  const [priceDataMap, setPriceDataMap] = useState<Record<number, PriceData[]>>({});

  // 알림 데이터
  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: 1,
      stockName: '삼성전자',
      code: '005930',
      preset: SELL_PRESETS.stopLoss,
      message: '손절 기준가(-5%) 근접! 현재 -4.2%',
      currentPrice: 68500,
      targetPrice: 67925,
      timestamp: Date.now() - 300000,
    },
    {
      id: 2,
      stockName: '한화에어로스페이스',
      code: '012450',
      preset: SELL_PRESETS.twoThird,
      message: '최고점 대비 1/3 하락 근접',
      currentPrice: 365000,
      targetPrice: 369600,
      timestamp: Date.now() - 1800000,
    },
  ]);

  // UI 상태
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPosition, setEditingPosition] = useState<Position | null>(null);
  const [showUpgradePopup, setShowUpgradePopup] = useState(false);
  const [activeTab, setActiveTab] = useState('positions');

  const isPremium = user?.membership === 'premium';

  // ----- 가격 데이터 초기화 -----
  useEffect(() => {
    const newData: Record<number, PriceData[]> = {};
    positions.forEach(pos => {
      if (!priceDataMap[pos.id]) {
        newData[pos.id] = generateMockPriceData(pos.buyPrice, 60);
      }
    });
    if (Object.keys(newData).length > 0) {
      setPriceDataMap(prev => ({ ...prev, ...newData }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [positions]);

  // ----- 실시간 가격 업데이트 (3초마다) -----
  useEffect(() => {
    const interval = setInterval(() => {
      setPriceDataMap(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(idStr => {
          const id = Number(idStr);
          const data = [...updated[id]];
          if (data.length === 0) return;
          const last = data[data.length - 1];
          const change = (Math.random() - 0.48) * last.close * 0.008;
          const newClose = Math.max(last.close + change, last.close * 0.95);
          data[data.length - 1] = {
            ...last,
            close: newClose,
            high: Math.max(last.high, newClose),
            low: Math.min(last.low, newClose),
          };
          updated[id] = data;
        });
        return updated;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // ----- 총계 계산 -----
  const totalCost = positions.reduce((sum, p) => sum + p.buyPrice * p.quantity, 0);
  const totalValue = positions.reduce((sum, p) => {
    const priceArr = priceDataMap[p.id];
    const price = priceArr?.[priceArr.length - 1]?.close || p.buyPrice;
    return sum + price * p.quantity;
  }, 0);
  const totalProfit = totalValue - totalCost;
  const totalProfitRate = totalCost > 0 ? (totalProfit / totalCost) * 100 : 0;

  // ----- 이벤트 핸들러 -----
  const handleAddPosition = (stock: Position) => {
    setPositions(prev => [...prev, { ...stock, id: Date.now() }]);
    setShowAddModal(false);
  };

  const handleEditPosition = (stock: Position) => {
    setPositions(prev => prev.map(p => (p.id === stock.id ? stock : p)));
    setEditingPosition(null);
  };

  const handleDeletePosition = (id: number) => {
    setPositions(prev => prev.filter(p => p.id !== id));
    setPriceDataMap(prev => {
      const u = { ...prev };
      delete u[id];
      return u;
    });
  };

  const handleUpgrade = () => {
    setUser({ ...user, membership: 'premium' });
    setShowUpgradePopup(false);
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  // ----- 레이아웃 스타일 계산 -----
  const getMainLayoutStyle = (): React.CSSProperties => {
    if (isMobile) {
      return {
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        padding: '0',
      };
    }
    if (isTablet) {
      return {
        display: 'grid',
        gridTemplateColumns: '1fr 320px',
        gap: '16px',
        padding: '0 20px',
      };
    }
    // 데스크탑: 프리미엄은 2컬럼, 무료는 3컬럼(광고 포함)
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
        paddingBottom: isMobile ? '80px' : '0',
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
        ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.3); }
        * { -webkit-tap-highlight-color: transparent; }
      `}</style>

      {/* ── 반응형 헤더 ── */}
      <ResponsiveHeader
        alerts={alerts}
        isPremium={isPremium}
        onShowUpgrade={() => setShowUpgradePopup(true)}
        onShowAddModal={() => setShowAddModal(true)}
      />

      {/* ── 메인 콘텐츠 ── */}
      <main
        style={{
          maxWidth: isMobile ? '100%' : isTablet ? '1200px' : '1600px',
          margin: '0 auto',
          padding: isMobile ? '16px 0' : '24px',
        }}
      >
        {/* 반응형 요약 카드 — totalCost 등 계산값 전달 */}
        <SummaryCards
          totalCost={totalCost}
          totalValue={totalValue}
          totalProfit={totalProfit}
          totalProfitRate={totalProfitRate}
        />

        {/* ── 모바일 인라인 탭 네비게이션 (스크롤 가능) ── */}
        {isMobile && (
          <div
            style={{
              display: 'flex',
              gap: '8px',
              padding: '0 16px',
              marginBottom: '16px',
              overflowX: 'auto',
            }}
          >
            {[
              { id: 'positions', label: '📊 포지션', count: positions.length },
              { id: 'alerts', label: '🔔 알림', count: alerts.length },
              { id: 'market', label: '🥚 시장분석', count: 0 },
              { id: 'guide', label: '📚 가이드', count: 0 },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '10px 16px',
                  background:
                    activeTab === tab.id
                      ? 'rgba(59,130,246,0.2)'
                      : 'rgba(255,255,255,0.05)',
                  border:
                    activeTab === tab.id
                      ? '1px solid rgba(59,130,246,0.4)'
                      : '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '10px',
                  color: activeTab === tab.id ? '#60a5fa' : '#94a3b8',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span
                    style={{
                      background:
                        activeTab === tab.id ? '#3b82f6' : 'rgba(255,255,255,0.2)',
                      color: '#fff',
                      padding: '2px 6px',
                      borderRadius: '6px',
                      fontSize: '11px',
                    }}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}

        {/* ── 메인 레이아웃 (2~3컬럼) ── */}
        <div style={getMainLayoutStyle()}>
          {/* 광고 영역 (데스크탑, 무료회원만) */}
          {!isMobile && !isTablet && !isPremium && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[1, 2].map(i => (
                <div
                  key={i}
                  style={{
                    background: 'linear-gradient(180deg, #1f2937 0%, #111827 100%)',
                    borderRadius: '12px',
                    padding: '16px',
                    border: '1px solid rgba(255,255,255,0.05)',
                    textAlign: 'center',
                    flex: 1,
                    minHeight: '180px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <div style={{ fontSize: '11px', color: '#4b5563', marginBottom: '8px' }}>
                    광고
                  </div>
                  <div style={{ fontSize: '24px', marginBottom: '8px' }}>📢</div>
                  <div style={{ fontSize: '11px', color: '#374151' }}>Google AdMob</div>
                </div>
              ))}
              <div
                onClick={() => setShowUpgradePopup(true)}
                style={{
                  background:
                    'linear-gradient(135deg, rgba(139,92,246,0.2) 0%, rgba(59,130,246,0.2) 100%)',
                  borderRadius: '12px',
                  padding: '16px',
                  border: '1px solid rgba(139,92,246,0.3)',
                  textAlign: 'center',
                  cursor: 'pointer',
                }}
              >
                <div style={{ fontSize: '22px', marginBottom: '6px' }}>👑</div>
                <div style={{ fontSize: '12px', color: '#a78bfa', fontWeight: '600' }}>
                  광고 제거
                </div>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
                  프리미엄
                </div>
              </div>
            </div>
          )}

          {/* ── 포지션 목록 (메인 컬럼) ── */}
          <div
            style={{
              display: isMobile && activeTab !== 'positions' ? 'none' : 'block',
              padding: isMobile ? '0 16px' : '0',
            }}
          >
            {/* 모바일 포지션 탭: 시장분석 미니 요약 배너 */}
            {isMobile && activeTab === 'positions' && (
              <div
                onClick={() => setActiveTab('market')}
                style={{
                  background:
                    'linear-gradient(135deg, rgba(239,68,68,0.15) 0%, rgba(249,115,22,0.1) 100%)',
                  border: '1px solid rgba(239,68,68,0.3)',
                  borderRadius: '10px',
                  padding: '12px',
                  marginBottom: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '24px' }}>🥚</span>
                  <div>
                    <div
                      style={{ fontSize: '13px', fontWeight: '600', color: '#ef4444' }}
                    >
                      4단계: 금리고점 (팔 때)
                    </div>
                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                      매도 관망 권장 · 탭하여 상세보기
                    </div>
                  </div>
                </div>
                <span style={{ color: '#64748b', fontSize: '18px' }}>›</span>
              </div>
            )}

            {/* 보유 종목 헤더 */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '16px',
              }}
            >
              <h2
                style={{
                  fontSize: isMobile ? '16px' : '18px',
                  fontWeight: '600',
                  color: '#fff',
                  margin: 0,
                }}
              >
                보유 종목 ({positions.length})
              </h2>
              <button
                onClick={() => setShowAddModal(true)}
                style={{
                  background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  color: '#fff',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                + 추가
              </button>
            </div>

            {/* 포지션 카드 목록 */}
            {positions.map(pos => (
              <PositionCard
                key={pos.id}
                position={pos}
                priceData={priceDataMap[pos.id]}
                onEdit={setEditingPosition}
                onDelete={handleDeletePosition}
                isPremium={isPremium}
                onUpgrade={() => setShowUpgradePopup(true)}
              />
            ))}

            {/* 포지션이 없을 때 */}
            {positions.length === 0 && (
              <div
                style={{
                  textAlign: 'center',
                  padding: '40px 20px',
                  background: 'linear-gradient(145deg, #1e293b 0%, #0f172a 100%)',
                  borderRadius: '14px',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <div style={{ fontSize: '40px', marginBottom: '12px' }}>📊</div>
                <div style={{ fontSize: '16px', color: '#94a3b8', marginBottom: '8px' }}>
                  모니터링 중인 종목이 없습니다
                </div>
                <button
                  onClick={() => setShowAddModal(true)}
                  style={{
                    background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '10px 20px',
                    color: '#fff',
                    fontSize: '14px',
                    cursor: 'pointer',
                  }}
                >
                  + 종목 추가하기
                </button>
              </div>
            )}
          </div>

          {/* ── 우측 사이드바 / 모바일에서는 탭으로 표시 ── */}
          {(!isMobile ||
            activeTab === 'market' ||
            activeTab === 'alerts' ||
            activeTab === 'guide') && (
            <div
              style={{
                display: 'block',
                padding: isMobile ? '0 16px' : '0',
              }}
            >
              {/* 시장 분석 (코스톨라니 달걀) */}
              <div
                style={{
                  display:
                    isMobile && activeTab !== 'market' ? 'none' : 'block',
                }}
              >
                <MarketCycleWidget isPremium={isPremium} />
              </div>

              {/* 알림 영역 */}
              <div
                style={{
                  display:
                    isMobile && activeTab !== 'alerts' ? 'none' : 'block',
                  background: 'linear-gradient(145deg, #1e293b 0%, #0f172a 100%)',
                  borderRadius: '14px',
                  padding: isMobile ? '14px' : '16px',
                  border: '1px solid rgba(255,255,255,0.12)',
                  marginBottom: '12px',
                  maxHeight: isMobile ? 'none' : '300px',
                  overflow: 'auto',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '12px',
                  }}
                >
                  <h2
                    style={{
                      fontSize: isMobile ? '15px' : '16px',
                      fontWeight: '600',
                      color: '#fff',
                      margin: 0,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    🔔 조건 도달 알림
                    {alerts.length > 0 && (
                      <span
                        style={{
                          background: '#ef4444',
                          color: '#fff',
                          padding: '2px 10px',
                          borderRadius: '10px',
                          fontSize: '12px',
                          fontWeight: '700',
                        }}
                      >
                        {alerts.length}
                      </span>
                    )}
                  </h2>
                  {alerts.length > 0 && (
                    <button
                      onClick={() => setAlerts([])}
                      style={{
                        background: 'rgba(255,255,255,0.1)',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '6px 10px',
                        color: '#94a3b8',
                        fontSize: '12px',
                        cursor: 'pointer',
                      }}
                    >
                      모두 지우기
                    </button>
                  )}
                </div>

                {alerts.length === 0 ? (
                  <div
                    style={{
                      textAlign: 'center',
                      padding: isMobile ? '20px 16px' : '30px 16px',
                    }}
                  >
                    <div style={{ fontSize: '32px', marginBottom: '10px' }}>✨</div>
                    <div style={{ fontSize: '14px', color: '#94a3b8' }}>
                      현재 도달한 조건이 없습니다
                    </div>
                  </div>
                ) : (
                  alerts.slice(0, 5).map(alert => (
                    <AlertCard
                      key={alert.id}
                      alert={alert}
                      onDismiss={(id: number) =>
                        setAlerts(prev => prev.filter(a => a.id !== id))
                      }
                    />
                  ))
                )}
              </div>

              {/* 매도법 가이드 */}
              <SellMethodGuide isMobile={isMobile} activeTab={activeTab} />

              {/* 면책조항 */}
              {(!isMobile || activeTab === 'guide') && (
                <div
                  style={{
                    padding: isMobile ? '12px' : '14px',
                    background: 'rgba(255,255,255,0.02)',
                    borderRadius: '12px',
                    borderLeft: '4px solid #64748b',
                  }}
                >
                  <p
                    style={{
                      fontSize: isMobile ? '11px' : '12px',
                      color: '#64748b',
                      margin: 0,
                      lineHeight: '1.6',
                    }}
                  >
                    ⚠️ 본 앱은 사용자가 선택한 조건을 모니터링하는 유틸리티
                    도구입니다. 제공되는 알람은 투자자문이나 투자권유가 아니며, 모든
                    투자 판단의 책임은 사용자에게 있습니다.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 설정 탭 (준비 중) */}
        {activeTab === 'settings' && (
          <div
            style={{
              background: 'rgba(255,255,255,0.03)',
              borderRadius: '12px',
              padding: '40px 20px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>⚙</div>
            <div style={{ fontSize: '15px', color: '#94a3b8' }}>
              설정 기능 준비 중입니다
            </div>
          </div>
        )}
      </main>

      {/* ── 모바일 하단 네비게이션 바 ── */}
      {isMobile && (
        <MobileNav
          activeTab={activeTab}
          onTabChange={handleTabChange}
          alertCount={alerts.length}
        />
      )}

      {/* ── 모달: 종목 추가 ── */}
      {showAddModal && (
        <StockModal
          onSave={handleAddPosition}
          onClose={() => setShowAddModal(false)}
          isMobile={isMobile}
        />
      )}

      {/* ── 모달: 종목 수정 ── */}
      {editingPosition && (
        <StockModal
          stock={editingPosition}
          onSave={handleEditPosition}
          onClose={() => setEditingPosition(null)}
          isMobile={isMobile}
        />
      )}

      {/* ── 모달: 업그레이드 팝업 ── */}
      {showUpgradePopup && (
        <UpgradeModal
          onUpgrade={handleUpgrade}
          onClose={() => setShowUpgradePopup(false)}
        />
      )}
    </div>
  );
}
