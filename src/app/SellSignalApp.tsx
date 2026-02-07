'use client';

// ============================================
// SellSignalApp.tsx — 메인 오케스트레이터
// 위치: src/app/SellSignalApp.tsx
// 원본 JSX 라인 2891~3547 기반 완전 재작성
// 세션 11에서 전체 교체
// ============================================

import React, { useState, useEffect, useCallback } from 'react';
import { useResponsive } from '../hooks/useResponsive';
import { SELL_PRESETS } from '../constants';
import { generateMockPriceData } from '../utils';
import type { Position, Alert, ChartDataPoint } from '../types';

// ── 컴포넌트 임포트 ──
import {
  ResponsiveHeader,
  SummaryCards,
  MarketCycleWidget,
  PositionCard,
  StockModal,
  AlertCard,
  SellMethodGuide,
} from '../components';

// ============================================
// 데모 데이터 — 원본 JSX 2896~2922 기반
// ============================================
const DEMO_POSITIONS: Position[] = [
  {
    id: 1,
    name: '삼성전자',
    code: '005930',
    buyPrice: 71500,
    quantity: 100,
    currentPrice: 71500,
    highestPrice: 78200,
    selectedPresets: ['candle3', 'stopLoss', 'twoThird', 'maSignal'],
    presetSettings: { stopLoss: { value: -5 }, maSignal: { value: 20 } },
  },
  {
    id: 2,
    name: '현대차',
    code: '005380',
    buyPrice: 215000,
    quantity: 20,
    currentPrice: 215000,
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
    currentPrice: 285000,
    highestPrice: 412000,
    selectedPresets: ['twoThird', 'maSignal', 'volumeZone', 'fundamental'],
    presetSettings: { maSignal: { value: 60 } },
  },
];

const createDemoAlerts = (): Alert[] => [
  {
    id: 1,
    stockName: '삼성전자',
    code: '005930',
    preset: {
      id: 'stopLoss',
      name: '손실제한 매도법',
      icon: '🛡',
      severity: 'critical',
    },
    message: '손절 기준가(-5%) 근접! 현재 -4.2%',
    currentPrice: 68500,
    targetPrice: 67925,
    timestamp: Date.now() - 300000,
  },
  {
    id: 2,
    stockName: '한화에어로스페이스',
    code: '012450',
    preset: {
      id: 'twoThird',
      name: '2/3 익절 매도법',
      icon: '📈',
      severity: 'medium',
    },
    message: '최고점 대비 1/3 하락 근접',
    currentPrice: 365000,
    targetPrice: 369600,
    timestamp: Date.now() - 1800000,
  },
];

// ============================================
// 메인 앱 컴포넌트
// ============================================
export default function SellSignalApp() {
  const { isMobile, isTablet, isDesktop } = useResponsive();

  // ── 상태 관리 ──
  const [user, setUser] = useState({ membership: 'free', email: 'demo@test.com' });
  const [positions, setPositions] = useState<Position[]>(DEMO_POSITIONS);
  const [priceDataMap, setPriceDataMap] = useState<Record<string | number, ChartDataPoint[]>>({});
  const [alerts, setAlerts] = useState<Alert[]>(createDemoAlerts);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPosition, setEditingPosition] = useState<Position | null>(null);
  const [showUpgradePopup, setShowUpgradePopup] = useState(false);
  const [activeTab, setActiveTab] = useState('positions');

  const isPremium = user?.membership === 'premium';

  // ── 가격 데이터 초기화 (원본 JSX 2932~2942) ──
  useEffect(() => {
    const newData: Record<string | number, ChartDataPoint[]> = {};
    positions.forEach((pos) => {
      if (!priceDataMap[pos.id]) {
        newData[pos.id] = generateMockPriceData(pos.buyPrice, 60);
      }
    });
    if (Object.keys(newData).length > 0) {
      setPriceDataMap((prev) => ({ ...prev, ...newData }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [positions]);

  // ── 실시간 가격 업데이트 3초 간격 (원본 JSX 2944~2966) ──
  useEffect(() => {
    const interval = setInterval(() => {
      setPriceDataMap((prev) => {
        const updated = { ...prev };
        Object.keys(updated).forEach((id) => {
          const data = [...updated[id]];
          const last = data[data.length - 1];
          if (!last) return;
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

  // ── 총계 계산 (원본 JSX 2968~2975) ──
  const totalCost = positions.reduce((sum, p) => sum + p.buyPrice * p.quantity, 0);
  const totalValue = positions.reduce((sum, p) => {
    const data = priceDataMap[p.id];
    const price = data?.[data.length - 1]?.close || p.buyPrice;
    return sum + price * p.quantity;
  }, 0);
  const totalProfit = totalValue - totalCost;
  const totalProfitRate = totalCost > 0 ? (totalProfit / totalCost) * 100 : 0;

  // ── 이벤트 핸들러 ──
  const handleAddPosition = useCallback((stock: Position) => {
    setPositions((prev) => [...prev, { ...stock, id: Date.now() }]);
    setShowAddModal(false);
  }, []);

  const handleEditPosition = useCallback((stock: Position) => {
    setPositions((prev) => prev.map((p) => (p.id === stock.id ? stock : p)));
    setEditingPosition(null);
  }, []);

  const handleDeletePosition = useCallback((id: string | number) => {
    setPositions((prev) => prev.filter((p) => p.id !== id));
    setPriceDataMap((prev) => {
      const updated = { ...prev };
      delete updated[id];
      return updated;
    });
  }, []);

  const handleUpgrade = useCallback(() => {
    setUser((prev) => ({ ...prev, membership: 'premium' }));
    setShowUpgradePopup(false);
  }, []);

  const handleTabChange = useCallback((tab: string) => {
    setActiveTab(tab);
  }, []);

  // ── 메인 레이아웃 스타일 (원본 JSX 2978~3001) ──
  const getMainLayoutStyle = (): React.CSSProperties => {
    if (isMobile) {
      return { display: 'flex', flexDirection: 'column', gap: '16px', padding: '0' };
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
  // 렌더링 (원본 JSX 3003~3547)
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
        onShowUpgrade={() => setShowUpgradePopup(true)}
        onShowAddModal={() => setShowAddModal(true)}
      />

      {/* ── 메인 영역 ── */}
      <main
        style={{
          maxWidth: isMobile ? '100%' : isTablet ? '1200px' : '1600px',
          margin: '0 auto',
          padding: isMobile ? '16px 0' : '24px',
        }}
      >
        {/* ── 요약 카드 (총 매수/평가/손익/수익률) ── */}
        <SummaryCards
          totalCost={totalCost}
          totalValue={totalValue}
          totalProfit={totalProfit}
          totalProfitRate={totalProfitRate}
        />

        {/* ── 모바일 인라인 탭 네비게이션 (원본 JSX 3050~3095) ── */}
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
              { id: 'market', label: '🥚 시장분석' },
              { id: 'guide', label: '📚 가이드' },
            ].map((tab) => (
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
                {(tab.count ?? 0) > 0 && (
                  <span
                    style={{
                      background: activeTab === tab.id ? '#3b82f6' : 'rgba(255,255,255,0.2)',
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

        {/* ── 메인 레이아웃 (3컬럼/2컬럼/1컬럼) ── */}
        <div style={getMainLayoutStyle()}>
          {/* ── 광고 영역 (데스크탑, 무료회원만) ── */}
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
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>프리미엄</div>
              </div>
            </div>
          )}

          {/* ── 포지션 목록 (원본 JSX 3139~3202) ── */}
          <div
            style={{
              display: isMobile && activeTab !== 'positions' ? 'none' : 'block',
              padding: isMobile ? '0 16px' : '0',
            }}
          >
            {/* 모바일: 포지션 탭에서 시장분석 미니 배너 */}
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
                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#ef4444' }}>
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

            {/* 포지션 헤더 */}
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
                📊 모니터링 중인 종목
              </h2>
              <span style={{ fontSize: isMobile ? '11px' : '13px', color: '#64748b' }}>
                실시간 조건 감시 중
              </span>
            </div>

            {/* 포지션 카드 목록 */}
            {positions.length === 0 ? (
              <div
                style={{
                  textAlign: 'center',
                  padding: '40px 20px',
                  background: 'rgba(255,255,255,0.03)',
                  borderRadius: '14px',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <div style={{ fontSize: '40px', marginBottom: '12px' }}>📊</div>
                <div style={{ fontSize: '15px', color: '#94a3b8', marginBottom: '16px' }}>
                  아직 등록된 종목이 없습니다
                </div>
                <button
                  onClick={() => setShowAddModal(true)}
                  style={{
                    padding: '12px 24px',
                    background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                    border: 'none',
                    borderRadius: '10px',
                    color: '#fff',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
                >
                  첫 종목 추가하기
                </button>
              </div>
            ) : (
              positions.map((pos) => (
                <PositionCard
                  key={pos.id}
                  position={pos}
                  priceData={priceDataMap[pos.id]}
                  onEdit={setEditingPosition}
                  onDelete={handleDeletePosition}
                  isPremium={isPremium}
                  onUpgrade={() => setShowUpgradePopup(true)}
                />
              ))
            )}
          </div>

          {/* ── 우측 사이드바 / 모바일 탭 콘텐츠 (원본 JSX 3204~3306) ── */}
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
              {/* 시장 분석 위젯 */}
              <div
                style={{
                  display: isMobile && activeTab !== 'market' ? 'none' : 'block',
                }}
              >
                <MarketCycleWidget isPremium={isPremium} />
              </div>

              {/* 알림 영역 (원본 JSX 3216~3282) */}
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
                  alerts.slice(0, 5).map((alert) => (
                    <AlertCard
                      key={alert.id}
                      alert={alert}
                      onDismiss={(id) =>
                        setAlerts((prev) => prev.filter((a) => a.id !== id))
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
                    ⚠️ 본 앱은 사용자가 선택한 조건을 모니터링하는 유틸리티 도구입니다. 제공되는
                    알람은 투자자문이나 투자권유가 아니며, 모든 투자 판단의 책임은 사용자에게
                    있습니다.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* ── 모바일 하단 네비게이션 바 (원본 JSX 3311~3371) ── */}
      {isMobile && (
        <nav
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            background: 'rgba(15, 23, 42, 0.98)',
            borderTop: '1px solid rgba(255,255,255,0.08)',
            padding: '8px 16px',
            paddingBottom: 'max(8px, env(safe-area-inset-bottom))',
            display: 'flex',
            justifyContent: 'space-around',
            backdropFilter: 'blur(10px)',
            zIndex: 100,
          }}
        >
          {[
            { id: 'positions', icon: '📊', label: '포지션' },
            { id: 'alerts', icon: '🔔', label: '알림', badge: alerts.length },
            { id: 'market', icon: '🥚', label: '시장' },
            { id: 'guide', icon: '📚', label: '가이드' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                background: 'none',
                border: 'none',
                padding: '6px 12px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                cursor: 'pointer',
                position: 'relative',
              }}
            >
              <span style={{ fontSize: '20px' }}>{item.icon}</span>
              <span
                style={{
                  fontSize: '10px',
                  color: activeTab === item.id ? '#60a5fa' : '#64748b',
                  fontWeight: activeTab === item.id ? '600' : '400',
                }}
              >
                {item.label}
              </span>
              {(item.badge ?? 0) > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '2px',
                    right: '6px',
                    background: '#ef4444',
                    color: '#fff',
                    fontSize: '9px',
                    fontWeight: '700',
                    padding: '1px 5px',
                    borderRadius: '6px',
                    minWidth: '16px',
                    textAlign: 'center',
                  }}
                >
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>
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

      {/* ── 업그레이드 팝업 (원본 JSX 3394~3544 인라인) ── */}
      {showUpgradePopup && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: isMobile ? '16px' : '40px',
          }}
        >
          <div
            style={{
              background: 'linear-gradient(145deg, #1e293b 0%, #0f172a 100%)',
              borderRadius: '20px',
              padding: isMobile ? '20px' : '32px',
              maxWidth: '420px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto',
              border: '1px solid rgba(139,92,246,0.3)',
              boxShadow: '0 0 60px rgba(139,92,246,0.2)',
            }}
          >
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{ fontSize: '56px', marginBottom: '12px' }}>👑</div>
              <h2
                style={{
                  fontSize: isMobile ? '22px' : '26px',
                  fontWeight: '700',
                  color: '#fff',
                  margin: '0 0 8px',
                }}
              >
                프리미엄 멤버십
              </h2>
              <p style={{ fontSize: '14px', color: '#94a3b8', margin: 0 }}>
                더 강력한 매도 시그널 도구를 경험하세요
              </p>
            </div>

            <div
              style={{
                background:
                  'linear-gradient(135deg, rgba(139,92,246,0.15) 0%, rgba(99,102,241,0.15) 100%)',
                borderRadius: '12px',
                padding: '16px',
                textAlign: 'center',
                marginBottom: '20px',
                border: '1px solid rgba(139,92,246,0.3)',
              }}
            >
              <div style={{ fontSize: '14px', color: '#a78bfa', marginBottom: '4px' }}>
                월 구독료
              </div>
              <div
                style={{
                  fontSize: isMobile ? '32px' : '36px',
                  fontWeight: '800',
                  color: '#fff',
                }}
              >
                ₩5,900
                <span style={{ fontSize: '14px', color: '#94a3b8', fontWeight: '400' }}>/월</span>
              </div>
              <div style={{ fontSize: '12px', color: '#10b981', marginTop: '4px' }}>
                🎁 첫 7일 무료 체험
              </div>
            </div>

            {/* 기능 비교 */}
            <div style={{ marginBottom: '20px' }}>
              <div
                style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#fff',
                  marginBottom: '12px',
                }}
              >
                ✨ 프리미엄 혜택
              </div>
              {[
                { icon: '🚫', text: '광고 완전 제거', free: '❌', premium: '✅' },
                { icon: '📊', text: '모니터링 종목 수', free: '5개', premium: '20개' },
                { icon: '🤖', text: 'AI 뉴스 분석', free: '❌', premium: '✅' },
                { icon: '📑', text: 'AI 리포트 분석', free: '❌', premium: '✅' },
                { icon: '💬', text: '카카오톡 알림', free: '❌', premium: '✅' },
                { icon: '📧', text: '이메일 리포트', free: '❌', premium: '✅' },
              ].map((item, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 12px',
                    background: 'rgba(255,255,255,0.03)',
                    borderRadius: '8px',
                    marginBottom: '6px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '16px' }}>{item.icon}</span>
                    <span style={{ fontSize: '13px', color: '#e2e8f0' }}>{item.text}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <span
                      style={{
                        fontSize: '12px',
                        color: '#64748b',
                        minWidth: '32px',
                        textAlign: 'center',
                      }}
                    >
                      {item.free}
                    </span>
                    <span
                      style={{
                        fontSize: '12px',
                        color: '#10b981',
                        minWidth: '32px',
                        textAlign: 'center',
                      }}
                    >
                      {item.premium}
                    </span>
                  </div>
                </div>
              ))}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '16px',
                  marginTop: '4px',
                  paddingRight: '12px',
                }}
              >
                <span style={{ fontSize: '10px', color: '#64748b' }}>무료</span>
                <span style={{ fontSize: '10px', color: '#10b981' }}>프리미엄</span>
              </div>
            </div>

            <button
              onClick={handleUpgrade}
              style={{
                width: '100%',
                padding: isMobile ? '16px' : '18px',
                background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                border: 'none',
                borderRadius: '12px',
                color: '#fff',
                fontSize: '16px',
                fontWeight: '700',
                cursor: 'pointer',
                marginBottom: '10px',
                boxShadow: '0 4px 20px rgba(139,92,246,0.4)',
              }}
            >
              🎉 7일 무료로 시작하기
            </button>
            <button
              onClick={() => setShowUpgradePopup(false)}
              style={{
                width: '100%',
                padding: '12px',
                background: 'transparent',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '10px',
                color: '#64748b',
                fontSize: '14px',
                cursor: 'pointer',
              }}
            >
              나중에 할게요
            </button>
            <p
              style={{
                fontSize: '11px',
                color: '#64748b',
                textAlign: 'center',
                margin: '16px 0 0',
                lineHeight: '1.5',
              }}
            >
              언제든지 해지 가능 · 자동 결제 · 부가세 포함
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
