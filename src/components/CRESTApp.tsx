'use client';
// ============================================
// CRESTApp - 메인 앱 컴포넌트
// 경로: src/components/CRESTApp.tsx
// ============================================
// 전체 레이아웃 + 상태 관리 + 컴포넌트 조합
// 모바일: 탭 기반 네비게이션 (하단 4탭)
// 데스크톱: 2컬럼 그리드 (포지션 | 사이드바)

import React, { useState, useEffect } from 'react';
import { useResponsive } from '@/hooks/useResponsive';
import { SELL_PRESETS } from '@/constants';
import { generateMockPriceData } from '@/utils';
import type { Position, Alert, CandleData } from '@/types';

// ── 컴포넌트 import ──
import ResponsiveHeader from './ResponsiveHeader';
import ResponsiveSummaryCards from './ResponsiveSummaryCards';
import MobileBottomNav from './MobileBottomNav';
import MarketMiniSummary from './MarketMiniSummary';
import MarketCycleWidget from './MarketCycleWidget';
import PositionCard from './PositionCard';
import AlertCard from './AlertCard';
import SellMethodGuide from './SellMethodGuide';
import UpgradePopup from './UpgradePopup';
import AddStockModal from './AddStockModal';
import Footer from './Footer';

// ============================================
// 메인 컴포넌트
// ============================================
const CRESTApp: React.FC = () => {
  const { isMobile, isTablet } = useResponsive();
  const [activeTab, setActiveTab] = useState('positions');
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // ── 데모 포지션 데이터 ──
  const [positions] = useState<Position[]>([
    {
      id: 1, name: '삼성전자', code: '005930',
      buyPrice: 71500, quantity: 100, highestPrice: 78000,
      selectedPresets: ['candle3', 'stopLoss', 'maSignal'],
      presetSettings: { stopLoss: { value: -5 }, maSignal: { value: 20 } },
    },
    {
      id: 2, name: '현대차', code: '005380',
      buyPrice: 50000, quantity: 100, highestPrice: 55000,
      selectedPresets: ['candle3', 'stopLoss', 'twoThird'],
      presetSettings: { stopLoss: { value: -5 } },
    },
    {
      id: 3, name: '한화에어로스페이스', code: '012450',
      buyPrice: 350000, quantity: 10, highestPrice: 380000,
      selectedPresets: ['twoThird', 'maSignal', 'volumeZone'],
      presetSettings: { maSignal: { value: 20 } },
    },
  ]);

  // ── 데모 알림 ──
  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: 1, stockName: '삼성전자', code: '005930',
      preset: SELL_PRESETS.stopLoss,
      message: '손절 기준가(-5%) 근접! 현재 -4.2%',
      currentPrice: 68500, targetPrice: 67925,
      timestamp: Date.now() - 300000,
    },
    {
      id: 2, stockName: '한화에어로스페이스', code: '012450',
      preset: SELL_PRESETS.twoThird,
      message: '최고점 대비 1/3 하락 근접',
      currentPrice: 365000, targetPrice: 369600,
      timestamp: Date.now() - 1800000,
    },
  ]);

  // ── 가격 데이터 (모의) ──
  const [priceDataMap, setPriceDataMap] = useState<Record<number, CandleData[]>>({});
  const isPremium = false;

  // 초기 가격 데이터 생성
  useEffect(() => {
    const data: Record<number, CandleData[]> = {};
    positions.forEach((p) => {
      data[p.id] = generateMockPriceData(p.buyPrice, 60);
    });
    setPriceDataMap(data);
  }, []);

  // 실시간 가격 업데이트 (3초마다)
  useEffect(() => {
    const interval = setInterval(() => {
      setPriceDataMap((prev) => {
        const updated = { ...prev };
        Object.keys(updated).forEach((idStr) => {
          const id = Number(idStr);
          const data = [...updated[id]];
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
        });
        return updated;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // ── 이계산 ──
  const totalCost = positions.reduce((s, p) => s + p.buyPrice * p.quantity, 0);
  const totalValue = positions.reduce((s, p) => {
    const pr = priceDataMap[p.id]?.[priceDataMap[p.id]?.length - 1]?.close || p.buyPrice;
    return s + pr * p.quantity;
  }, 0);
  const totalProfit = totalValue - totalCost;
  const totalProfitRate = totalCost > 0 ? (totalProfit / totalCost) * 100 : 0;

  // ── 렌더링 ──
  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #0a0a0f 0%, #0f172a 50%, #0a0a0f 100%)',
        color: '#fff',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontSize: '14px',
        paddingBottom: isMobile ? 'calc(70px + env(safe-area-inset-bottom, 0px))' : '0',
      }}
    >
      {/* 헤더 */}
      <ResponsiveHeader
        alerts={alerts}
        isPremium={isPremium}
        onShowUpgrade={() => setShowUpgrade(true)}
        onShowAddModal={() => setShowAddModal(true)}
        isMobile={isMobile}
        isTablet={isTablet}
      />

      {/* 메인 영역 */}
      <main
        style={{
          maxWidth: isMobile ? '100%' : isTablet ? '1200px' : '1600px',
          margin: '0 auto',
          padding: isMobile ? '0' : '24px',
        }}
      >
        {/* 서머리 카드 */}
        <ResponsiveSummaryCards
          totalCost={totalCost}
          totalValue={totalValue}
          totalProfit={totalProfit}
          totalProfitRate={totalProfitRate}
          isMobile={isMobile}
          isTablet={isTablet}
        />

        {/* 메인 레이아웃 */}
        <div
          style={
            isMobile
              ? { display: 'flex', flexDirection: 'column', gap: '0' }
              : isTablet
              ? { display: 'grid', gridTemplateColumns: '1fr 320px', gap: '16px', padding: '0 20px' }
              : { display: 'grid', gridTemplateColumns: '1fr 380px', gap: '20px' }
          }
        >
          {/* 좌측: 포지션 목록 */}
          <div
            style={{
              display: isMobile && activeTab !== 'positions' ? 'none' : 'block',
              padding: isMobile ? '0 16px' : '0',
            }}
          >
            {/* 모바일: 시장 미니 배너 */}
            {isMobile && activeTab === 'positions' && (
              <MarketMiniSummary onClick={() => setActiveTab('market')} />
            )}

            {/* 섹션 헤더 */}
            <div
              style={{
                display: 'flex', alignItems: 'center',
                justifyContent: 'space-between', marginBottom: '12px',
              }}
            >
              <h2
                style={{
                  fontSize: isMobile ? '16px' : '18px',
                  fontWeight: '700', color: '#fff', margin: 0,
                }}
              >
                보유 종목 ({positions.length})
              </h2>
              <button
                onClick={() => setShowAddModal(true)}
                style={{
                  padding: '6px 14px', height: '34px',
                  background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                  border: 'none', borderRadius: '8px',
                  color: '#fff', fontSize: '12px', fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                + 추가
              </button>
            </div>

            {/* 데모 모드 안내 */}
            <div
              style={{
                background: 'rgba(59,130,246,0.06)',
                border: '1px solid rgba(59,130,246,0.15)',
                borderRadius: '10px',
                padding: '10px 14px',
                marginBottom: '12px',
                display: 'flex', alignItems: 'center', gap: '8px',
              }}
            >
              <span style={{ fontSize: '16px' }}>💡</span>
              <div>
                <div style={{ fontSize: '12px', color: '#60a5fa', fontWeight: '600' }}>
                  데모 모드
                </div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>
                  로그인하면 내 종목을 저장/관리할 수 있습니다
                </div>
              </div>
            </div>

            {/* 포지션 카드 */}
            {positions.map((pos) => (
              <PositionCard
                key={pos.id}
                position={pos}
                priceData={priceDataMap[pos.id] || null}
                isMobile={isMobile}
                onEdit={() => {}}
                onDelete={() => {}}
              />
            ))}
          </div>

          {/* 우측: 사이드바 / 모바일 탭 콘텐츠 */}
          {(!isMobile || activeTab === 'market' || activeTab === 'alerts' || activeTab === 'guide') && (
            <div style={{ padding: isMobile ? '0 16px' : '0' }}>

              {/* 시장 분석 */}
              <div style={{ display: isMobile && activeTab !== 'market' ? 'none' : 'block' }}>
                <MarketCycleWidget isMobile={isMobile} />
              </div>

              {/* 알림 */}
              <div
                style={{
                  display: isMobile && activeTab !== 'alerts' ? 'none' : 'block',
                  background: 'linear-gradient(145deg, #1e293b, #0f172a)',
                  borderRadius: '14px',
                  padding: isMobile ? '14px' : '16px',
                  border: '1px solid rgba(255,255,255,0.06)',
                  marginBottom: '12px',
                }}
              >
                <div
                  style={{
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'space-between', marginBottom: '12px',
                  }}
                >
                  <h3
                    style={{
                      fontSize: '15px', fontWeight: '700', color: '#fff', margin: 0,
                      display: 'flex', alignItems: 'center', gap: '8px',
                    }}
                  >
                    🔔 조건 도달 알림
                    {alerts.length > 0 && (
                      <span
                        style={{
                          background: '#ef4444', color: '#fff',
                          padding: '2px 8px', borderRadius: '8px',
                          fontSize: '11px', fontWeight: '700',
                        }}
                      >
                        {alerts.length}
                      </span>
                    )}
                  </h3>
                  {alerts.length > 0 && (
                    <button
                      onClick={() => setAlerts([])}
                      style={{
                        background: 'rgba(255,255,255,0.06)',
                        border: 'none', borderRadius: '6px',
                        padding: '6px 10px', color: '#64748b',
                        fontSize: '11px', cursor: 'pointer',
                      }}
                    >
                      모두 지우기
                    </button>
                  )}
                </div>
                {alerts.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '24px' }}>
                    <div style={{ fontSize: '28px', marginBottom: '8px' }}>✨</div>
                    <div style={{ fontSize: '13px', color: '#64748b' }}>
                      현재 도달한 조건이 없습니다
                    </div>
                  </div>
                ) : (
                  alerts.map((a) => (
                    <AlertCard
                      key={a.id}
                      alert={a}
                      onDismiss={(id) => setAlerts((prev) => prev.filter((x) => x.id !== id))}
                    />
                  ))
                )}
              </div>

              {/* 가이드 */}
              <div style={{ display: isMobile && activeTab !== 'guide' ? 'none' : 'block' }}>
                <SellMethodGuide isMobile={isMobile} />

                {/* 면책조항 */}
                <div
                  style={{
                    padding: '12px',
                    background: 'rgba(255,255,255,0.02)',
                    borderRadius: '12px',
                    borderLeft: '3px solid #475569',
                  }}
                >
                  <p style={{ fontSize: '11px', color: '#475569', margin: 0, lineHeight: '1.6' }}>
                    ⚠️ 본 앱은 사용자가 선택한 조건을 모니터링하는 유틸리티 도구입니다.
                    제공되는 알람은 투자자문이나 투자권유가 아니며,
                    모든 투자 판단의 책임은 사용자에게 있습니다.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* 모바일 하단 네비 */}
      {isMobile && (
        <MobileBottomNav
          activeTab={activeTab}
          onTabChange={setActiveTab}
          alertCount={alerts.length}
        />
      )}

      {/* 데스크톱 푸터 */}
      {!isMobile && <Footer />}

      {/* 종목 추가 모달 */}
      {showAddModal && (
        <AddStockModal
          isMobile={isMobile}
          onClose={() => setShowAddModal(false)}
        />
      )}

      {/* 업그레이드 팝업 */}
      {showUpgrade && (
        <UpgradePopup
          isMobile={isMobile}
          onClose={() => setShowUpgrade(false)}
        />
      )}
    </div>
  );
};

export default CRESTApp;
