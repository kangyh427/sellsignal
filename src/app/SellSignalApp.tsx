'use client';
// @ts-nocheck
// ============================================
// CREST 매도의 기술 - 메인 앱 컴포넌트
// 경로: src/app/SellSignalApp.tsx
// ============================================
// 세션4 아키텍처 정리 완료:
//   - AINewsPopup    → components/AINewsPopup.tsx
//   - AIReportPopup  → components/AIReportPopup.tsx
//   - UpgradePopup   → components/UpgradePopup.tsx
//   - Footer         → components/Footer.tsx
// 세션5 모바일 터치 UX:
//   [B5] safe-area 하단 여백 적용
// ============================================

import React, { useState, useEffect } from 'react';

// ── 분리된 모듈 import ──
import { SELL_PRESETS } from '../constants';
import { generateMockPriceData } from '../utils';
import { useResponsive } from '../hooks/useResponsive';

// ── 분리된 컴포넌트 import ──
import AlertCard from '../components/AlertCard';
import SellMethodGuide from '../components/SellMethodGuide';
import ResponsiveHeader from '../components/ResponsiveHeader';
import ResponsiveSummaryCards from '../components/ResponsiveSummaryCards';
import MobileBottomNav from '../components/MobileBottomNav';
import type { MobileTab } from '../components/MobileBottomNav';
import PositionCard from '../components/PositionCard';
import MarketCycleWidget from '../components/MarketCycleWidget';
import StockModal from '../components/StockModal';
import AINewsPopup from '../components/AINewsPopup';
import AIReportPopup from '../components/AIReportPopup';
import UpgradePopup from '../components/UpgradePopup';
import Footer from '../components/Footer';

// ============================================
// 메인 앱 (반응형 적용)
// ============================================
export default function SellSignalAppV5() {
  const { isMobile, isTablet, isDesktop } = useResponsive();

  // ── Auth 대신 로컬 상태 ──
  const [user, setUser] = useState(null);
  const isLoggedIn = false; // 데모 모드
  const isSaving = false;

  // ── 데모 포지션 데이터 ──
  const [positions, setPositions] = useState([
    {
      id: 1, name: '삼성전자', code: '005930',
      buyPrice: 71500, quantity: 100,
      highestPrice: 78000,
      selectedPresets: ['candle3', 'stopLoss', 'maSignal'],
      presetSettings: { stopLoss: { value: -5 }, maSignal: { value: 20 } },
      stock: { name: '삼성전자', code: '005930', market: '코스피', sector: '반도체', per: 12.5, pbr: 1.2, sectorPer: 15.2, sectorPbr: 1.8 },
    },
    {
      id: 2, name: '현대차', code: '005380',
      buyPrice: 50000, quantity: 100,
      highestPrice: 55000,
      selectedPresets: ['candle3', 'stopLoss', 'twoThird'],
      presetSettings: { stopLoss: { value: -5 } },
      stock: { name: '현대차', code: '005380', market: '코스피', sector: '자동차', per: 5.8, pbr: 0.6, sectorPer: 7.2, sectorPbr: 0.8 },
    },
    {
      id: 3, name: '한화에어로스페이스', code: '012450',
      buyPrice: 350000, quantity: 10,
      highestPrice: 380000,
      selectedPresets: ['twoThird', 'maSignal', 'volumeZone'],
      presetSettings: { maSignal: { value: 20 } },
      stock: { name: '한화에어로스페이스', code: '012450', market: '코스피', sector: '방산', per: 35.2, pbr: 4.5, sectorPer: 22.0, sectorPbr: 2.8 },
    },
  ]);

  // ── 포지션 CRUD (로컬 상태) ──
  const addPosition = (stock) => {
    const newPos = { ...stock, id: Date.now() };
    setPositions((prev) => [...prev, newPos]);
  };
  const updatePosition = (id, stock) => {
    setPositions((prev) => prev.map((p) => (p.id === id ? { ...p, ...stock } : p)));
  };
  const deletePosition = (id) => {
    setPositions((prev) => prev.filter((p) => p.id !== id));
  };

  // ── 가격 데이터 & 알림 상태 ──
  const [priceDataMap, setPriceDataMap] = useState({});
  const [alerts, setAlerts] = useState([
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

  // ── UI 상태 ──
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPosition, setEditingPosition] = useState(null);
  const [showUpgradePopup, setShowUpgradePopup] = useState(false);
  const [activeTab, setActiveTab] = useState<MobileTab>('positions');
  const [aiNewsPosition, setAiNewsPosition] = useState(null);
  const [aiReportPosition, setAiReportPosition] = useState(null);

  const isPremium = user?.membership === 'premium';

  // ── 가격 데이터 초기화 ──
  useEffect(() => {
    if (positions.length === 0) return;
    const newData = {};
    positions.forEach((pos) => {
      if (!priceDataMap[pos.id]) {
        newData[pos.id] = generateMockPriceData(pos.buyPrice, 60);
      }
    });
    if (Object.keys(newData).length > 0) {
      setPriceDataMap((prev) => ({ ...prev, ...newData }));
    }
  }, [positions]);

  // ── 실시간 가격 업데이트 (3초 간격) ──
  useEffect(() => {
    const interval = setInterval(() => {
      setPriceDataMap((prev) => {
        const updated = { ...prev };
        Object.keys(updated).forEach((id) => {
          const data = [...updated[id]];
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

  // ── 총계 계산 ──
  const totalCost = positions.reduce((sum, p) => sum + p.buyPrice * p.quantity, 0);
  const totalValue = positions.reduce((sum, p) => {
    const price = priceDataMap[p.id]?.[priceDataMap[p.id]?.length - 1]?.close || p.buyPrice;
    return sum + price * p.quantity;
  }, 0);
  const totalProfit = totalValue - totalCost;
  const totalProfitRate = totalCost > 0 ? (totalProfit / totalCost) * 100 : 0;

  // ── 메인 레이아웃 스타일 계산 ──
  const getMainLayoutStyle = () => {
    if (isMobile) {
      return { display: 'flex', flexDirection: 'column' as const, gap: '16px', padding: '0' };
    }
    if (isTablet) {
      return { display: 'grid', gridTemplateColumns: '1fr 320px', gap: '16px', padding: '0 20px' };
    }
    return {
      display: 'grid',
      gridTemplateColumns: isPremium ? '1fr 380px' : '140px 1fr 380px',
      gap: '20px',
    };
  };

  // ============================================
  // JSX 렌더링
  // ============================================
  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #0a0a0f 0%, #0f172a 50%, #0a0a0f 100%)',
        color: '#fff',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontSize: '14px',
        // [B5] safe-area 하단 여백 반영 (MobileBottomNav 높이 + 노치)
        paddingBottom: isMobile ? 'calc(70px + env(safe-area-inset-bottom, 0px))' : '0',
      }}
    >
      {/* 글로벌 스타일 */}
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

      {/* ── 헤더 ── */}
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
        {/* 요약 카드 */}
        <ResponsiveSummaryCards
          totalCost={totalCost}
          totalValue={totalValue}
          totalProfit={totalProfit}
          totalProfitRate={totalProfitRate}
        />

        {/* 메인 레이아웃 */}
        <div style={getMainLayoutStyle()}>
          {/* 광고 영역 (데스크톱, 무료회원) */}
          {!isMobile && !isTablet && !isPremium && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[1, 2].map((i) => (
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
                  <div style={{ fontSize: '11px', color: '#4b5563', marginBottom: '8px' }}>광고</div>
                  <div style={{ fontSize: '24px', marginBottom: '8px' }}>📢</div>
                  <div style={{ fontSize: '11px', color: '#374151' }}>Google AdMob</div>
                </div>
              ))}
              <div
                onClick={() => setShowUpgradePopup(true)}
                style={{
                  background: 'linear-gradient(135deg, rgba(139,92,246,0.2) 0%, rgba(59,130,246,0.2) 100%)',
                  borderRadius: '12px',
                  padding: '16px',
                  border: '1px solid rgba(139,92,246,0.3)',
                  textAlign: 'center',
                  cursor: 'pointer',
                }}
              >
                <div style={{ fontSize: '22px', marginBottom: '6px' }}>👑</div>
                <div style={{ fontSize: '12px', color: '#a78bfa', fontWeight: '600' }}>광고 제거</div>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>프리미엄</div>
              </div>
            </div>
          )}

          {/* ── 포지션 목록 ── */}
          <div
            style={{
              display: isMobile && activeTab !== 'positions' ? 'none' : 'block',
              padding: isMobile ? '0 16px' : '0',
            }}
          >
            {/* 모바일: 시장 분석 미니 요약 */}
            {isMobile && activeTab === 'positions' && (
              <div
                onClick={() => setActiveTab('market')}
                style={{
                  background: 'linear-gradient(135deg, rgba(239,68,68,0.2) 0%, rgba(249,115,22,0.15) 100%)',
                  border: '2px solid rgba(239,68,68,0.4)',
                  borderRadius: '12px',
                  padding: '14px',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '28px' }}>🥚</span>
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: '600', color: '#ef4444' }}>4단계: 금리고점 (팔 때)</div>
                    <div style={{ fontSize: '13px', color: '#cbd5e1' }}>매도 관망 권장 · 탭하여 상세보기</div>
                  </div>
                </div>
                <span style={{ color: '#94a3b8', fontSize: '20px' }}>›</span>
              </div>
            )}

            {/* 섹션 헤더 */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h2 style={{ fontSize: isMobile ? '17px' : '19px', fontWeight: '600', color: '#fff', margin: 0 }}>
                📊 모니터링 중인 종목
              </h2>
              <span style={{ fontSize: isMobile ? '12px' : '14px', color: '#94a3b8' }}>실시간 조건 감시 중</span>
            </div>

            {/* 비로그인 안내 */}
            {!isLoggedIn && (
              <div
                style={{
                  background: 'rgba(59,130,246,0.1)',
                  border: '1px solid rgba(59,130,246,0.3)',
                  borderRadius: '10px',
                  padding: '12px 16px',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                }}
              >
                <span style={{ fontSize: '20px' }}>💡</span>
                <div>
                  <div style={{ fontSize: '13px', color: '#60a5fa', fontWeight: '600' }}>데모 모드</div>
                  <div style={{ fontSize: '12px', color: '#94a3b8' }}>로그인하면 내 종목을 저장하고 관리할 수 있습니다</div>
                </div>
              </div>
            )}

            {/* 포지션 카드 목록 */}
            {positions.map((pos) => (
              <PositionCard
                key={pos.id}
                position={pos}
                priceData={priceDataMap[pos.id]}
                onEdit={setEditingPosition}
                onDelete={(id) => {
                  deletePosition(id);
                  setPriceDataMap((prev) => {
                    const u = { ...prev };
                    delete u[id];
                    return u;
                  });
                }}
                isPremium={isPremium}
                onUpgrade={() => setShowUpgradePopup(true)}
                onShowAINews={(pos) => setAiNewsPosition(pos)}
                onShowAIReport={(pos) => setAiReportPosition(pos)}
              />
            ))}
          </div>

          {/* ── 우측 사이드바 / 모바일 탭 콘텐츠 ── */}
          {(!isMobile || activeTab === 'market' || activeTab === 'alerts' || activeTab === 'guide') && (
            <div style={{ display: 'block', padding: isMobile ? '0 16px' : '0' }}>
              {/* 시장 분석 */}
              <div style={{ display: isMobile && activeTab !== 'market' ? 'none' : 'block' }}>
                <MarketCycleWidget isPremium={isPremium} />
              </div>

              {/* 알림 영역 */}
              <div
                style={{
                  display: isMobile && activeTab !== 'alerts' ? 'none' : 'block',
                  background: 'linear-gradient(145deg, #1e293b 0%, #0f172a 100%)',
                  borderRadius: '14px',
                  padding: isMobile ? '14px' : '16px',
                  border: '1px solid rgba(255,255,255,0.08)',
                  marginBottom: '12px',
                  maxHeight: isMobile ? 'none' : '300px',
                  overflow: 'auto',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
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
                  <div style={{ textAlign: 'center', padding: isMobile ? '20px 16px' : '30px 16px' }}>
                    <div style={{ fontSize: '32px', marginBottom: '10px' }}>✨</div>
                    <div style={{ fontSize: '14px', color: '#94a3b8' }}>현재 도달한 조건이 없습니다</div>
                  </div>
                ) : (
                  alerts
                    .slice(0, 5)
                    .map((alert) => (
                      <AlertCard key={alert.id} alert={alert} onDismiss={(id) => setAlerts((prev) => prev.filter((a) => a.id !== id))} />
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
                  <p style={{ fontSize: isMobile ? '11px' : '12px', color: '#64748b', margin: 0, lineHeight: '1.6' }}>
                    ⚠️ 본 앱은 사용자가 선택한 조건을 모니터링하는 유틸리티 도구입니다. 제공되는 알람은 투자자문이나
                    투자권유가 아니며, 모든 투자 판단의 책임은 사용자에게 있습니다.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* ── 모바일 하단 네비게이션 ── */}
      {isMobile && <MobileBottomNav activeTab={activeTab} onTabChange={setActiveTab} alertCount={alerts.length} />}

      {/* ── 데스크톱 푸터 ── */}
      {!isMobile && <Footer />}

      {/* ── 모달들 ── */}
      {showAddModal && (
        <StockModal
          onSave={(stock) => {
            addPosition(stock);
            setShowAddModal(false);
          }}
          onClose={() => setShowAddModal(false)}
        />
      )}
      {editingPosition && (
        <StockModal
          stock={editingPosition}
          onSave={(stock) => {
            updatePosition(stock.id, stock);
            setEditingPosition(null);
          }}
          onClose={() => setEditingPosition(null)}
        />
      )}

      {/* ── AI 팝업 ── */}
      {aiNewsPosition && (
        <AINewsPopup
          position={aiNewsPosition}
          onClose={() => setAiNewsPosition(null)}
          isPremium={isPremium}
          onUpgrade={() => setShowUpgradePopup(true)}
        />
      )}
      {aiReportPosition && (
        <AIReportPopup
          position={aiReportPosition}
          onClose={() => setAiReportPosition(null)}
          isPremium={isPremium}
          onUpgrade={() => setShowUpgradePopup(true)}
        />
      )}

      {/* ── 업그레이드 팝업 ── */}
      {showUpgradePopup && (
        <UpgradePopup
          onUpgrade={() => {
            setUser({ ...user, membership: 'premium' });
            setShowUpgradePopup(false);
          }}
          onClose={() => setShowUpgradePopup(false)}
        />
      )}
    </div>
  );
}
