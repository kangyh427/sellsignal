'use client';

import React, { useState, useEffect } from 'react';
import { useResponsive } from '@/hooks/useResponsive';
import { ResponsiveHeader } from '@/components/ResponsiveHeader';
import { MarketCycleWidget } from '@/components/MarketCycleWidget';
import { PositionCard } from '@/components/PositionCard';
import { AlertCard } from '@/components/AlertCard';
import { StockModal } from '@/components/StockModal';
import { MobileNav } from '@/components/MobileNav';
import { UpgradeModal } from '@/components/UpgradeModal';
import { SellMethodGuide } from '@/components/SellMethodGuide';
import { 
  Position, 
  Alert, 
  User, 
  ChartDataPoint 
} from '@/types';
import { 
  SELL_PRESETS, 
  MARKET_CYCLE 
} from '@/constants/presets';

// ============================================
// 모의 가격 데이터 생성
// ============================================
const generateMockPriceData = (basePrice: number, count: number): ChartDataPoint[] => {
  const data: ChartDataPoint[] = [];
  let price = basePrice * 0.95;
  for (let i = 0; i < count; i++) {
    const change = (Math.random() - 0.48) * price * 0.03;
    const open = price;
    const close = price + change;
    const high = Math.max(open, close) + Math.random() * price * 0.01;
    const low = Math.min(open, close) - Math.random() * price * 0.01;
    const volume = Math.floor(Math.random() * 1000000) + 100000;
    data.push({ date: `D-${count - i}`, open, high, low, close, volume });
    price = close;
  }
  return data;
};

// ============================================
// 반응형 요약 카드 컴포넌트
// ============================================
interface SummaryCardsProps {
  totalCost: number;
  totalValue: number;
  totalProfit: number;
  totalProfitRate: number;
}

const ResponsiveSummaryCards: React.FC<SummaryCardsProps> = ({
  totalCost, totalValue, totalProfit, totalProfitRate
}) => {
  const { isMobile, isTablet } = useResponsive();

  const cards = [
    { label: '총 투자금', value: '₩' + Math.round(totalCost).toLocaleString(), color: '#fff', icon: '💰' },
    { label: '현재 평가', value: '₩' + Math.round(totalValue).toLocaleString(), color: '#fff', icon: '📊' },
    { label: '총 수익금', value: (totalProfit >= 0 ? '+' : '') + '₩' + Math.round(totalProfit).toLocaleString(), color: totalProfit >= 0 ? '#10b981' : '#ef4444', icon: '📈' },
    { label: '총 수익률', value: (totalProfitRate >= 0 ? '+' : '') + totalProfitRate.toFixed(2) + '%', color: totalProfitRate >= 0 ? '#10b981' : '#ef4444', icon: '🎯' },
  ];

  // 모바일: 2x2 그리드
  if (isMobile) {
    return (
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(2, 1fr)', 
        gap: '10px', 
        marginBottom: '16px',
        padding: '0 16px',
      }}>
        {cards.map((card, i) => (
          <div key={i} style={{ 
            background: 'linear-gradient(145deg, #1e293b 0%, #0f172a 100%)', 
            borderRadius: '10px', 
            padding: '12px', 
            border: '1px solid rgba(255,255,255,0.08)' 
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
              <span style={{ fontSize: '14px' }}>{card.icon}</span>
              <span style={{ fontSize: '10px', color: '#64748b' }}>{card.label}</span>
            </div>
            <div style={{ 
              fontSize: '16px', fontWeight: '700', color: card.color || '#fff',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>{card.value}</div>
          </div>
        ))}
      </div>
    );
  }

  // 태블릿: 4열 그리드 (작은 패딩)
  if (isTablet) {
    return (
      <div style={{ 
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', 
        gap: '12px', marginBottom: '18px', padding: '0 20px',
      }}>
        {cards.map((card, i) => (
          <div key={i} style={{ 
            background: 'linear-gradient(145deg, #1e293b 0%, #0f172a 100%)', 
            borderRadius: '10px', padding: '14px', 
            border: '1px solid rgba(255,255,255,0.08)' 
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '5px' }}>
              <span style={{ fontSize: '14px' }}>{card.icon}</span>
              <span style={{ fontSize: '11px', color: '#64748b' }}>{card.label}</span>
            </div>
            <div style={{ fontSize: '18px', fontWeight: '700', color: card.color || '#fff' }}>{card.value}</div>
          </div>
        ))}
      </div>
    );
  }

  // 데스크탑: 4열 그리드
  return (
    <div style={{ 
      display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', 
      gap: '14px', marginBottom: '20px' 
    }}>
      {cards.map((card, i) => (
        <div key={i} style={{ 
          background: 'linear-gradient(145deg, #1e293b 0%, #0f172a 100%)', 
          borderRadius: '12px', padding: '16px', 
          border: '1px solid rgba(255,255,255,0.08)' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
            <span style={{ fontSize: '16px' }}>{card.icon}</span>
            <span style={{ fontSize: '12px', color: '#64748b' }}>{card.label}</span>
          </div>
          <div style={{ fontSize: '20px', fontWeight: '700', color: card.color || '#fff' }}>{card.value}</div>
        </div>
      ))}
    </div>
  );
};

// ============================================
// 인라인 포지션 카드 (빈 상태 / 추가 유도)
// ============================================
interface PositionCardInlineProps {
  onAdd: () => void;
  isPremium: boolean;
  positionCount: number;
}

const PositionCardInline: React.FC<PositionCardInlineProps> = ({ onAdd, isPremium, positionCount }) => {
  const maxPositions = isPremium ? 20 : 5;
  const canAdd = positionCount < maxPositions;
  
  return (
    <div 
      onClick={canAdd ? onAdd : undefined}
      style={{
        background: 'linear-gradient(145deg, rgba(59,130,246,0.08) 0%, rgba(139,92,246,0.08) 100%)',
        border: '2px dashed rgba(59,130,246,0.3)',
        borderRadius: '14px',
        padding: '24px',
        textAlign: 'center',
        cursor: canAdd ? 'pointer' : 'default',
        transition: 'border-color 0.2s',
        marginBottom: '12px',
      }}
    >
      <div style={{ fontSize: '32px', marginBottom: '8px' }}>{canAdd ? '➕' : '🔒'}</div>
      <div style={{ fontSize: '14px', fontWeight: '600', color: canAdd ? '#60a5fa' : '#64748b' }}>
        {canAdd ? '종목 추가하기' : `최대 ${maxPositions}종목 (프리미엄 필요)`}
      </div>
      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
        {positionCount}/{maxPositions} 종목 사용 중
      </div>
    </div>
  );
};

// ============================================
// 메인 앱 컴포넌트
// ============================================
export default function SellSignalApp() {
  const { isMobile, isTablet, isDesktop } = useResponsive();
  
  // 상태 관리
  const [user, setUser] = useState<User>({ name: '투자자', email: 'user@test.com', membership: 'free' });
  const [positions, setPositions] = useState<Position[]>([
    { id: 1, name: '삼성전자', code: '005930', buyPrice: 71500, quantity: 10, buyDate: '2025-01-15', selectedPresets: ['candle3', 'stopLoss'], presetSettings: { stopLoss: { value: -5 }, maSignal: { value: 20 } }, memo: '' },
    { id: 2, name: '한화에어로스페이스', code: '012450', buyPrice: 385000, quantity: 3, buyDate: '2025-01-20', selectedPresets: ['twoThird', 'maSignal', 'volumeZone'], presetSettings: { stopLoss: { value: -5 }, maSignal: { value: 20 } }, memo: '' },
    { id: 3, name: 'SK하이닉스', code: '000660', buyPrice: 178000, quantity: 5, buyDate: '2025-02-01', selectedPresets: ['candle3', 'stopLoss', 'twoThird'], presetSettings: { stopLoss: { value: -3 }, maSignal: { value: 20 } }, memo: '' },
  ]);
  const [priceDataMap, setPriceDataMap] = useState<Record<number, ChartDataPoint[]>>({});
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
    }
  ]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPosition, setEditingPosition] = useState<Position | null>(null);
  const [showUpgradePopup, setShowUpgradePopup] = useState(false);
  const [activeTab, setActiveTab] = useState('positions');
  
  const isPremium = user?.membership === 'premium';
  const unreadAlertCount = alerts.length;

  // ── 가격 데이터 초기화 ──
  useEffect(() => {
    const newData: Record<number, ChartDataPoint[]> = {};
    positions.forEach(pos => { 
      if (!priceDataMap[pos.id]) {
        newData[pos.id] = generateMockPriceData(pos.buyPrice, 60); 
      }
    });
    if (Object.keys(newData).length > 0) {
      setPriceDataMap(prev => ({ ...prev, ...newData }));
    }
  }, [positions]);

  // ── 실시간 가격 업데이트 ──
  useEffect(() => {
    const interval = setInterval(() => {
      setPriceDataMap(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(idStr => {
          const id = Number(idStr);
          const data = [...updated[id]];
          const last = data[data.length - 1];
          const change = (Math.random() - 0.48) * last.close * 0.008;
          const newClose = Math.max(last.close + change, last.close * 0.95);
          data[data.length - 1] = { 
            ...last, 
            close: newClose, 
            high: Math.max(last.high, newClose), 
            low: Math.min(last.low, newClose) 
          };
          updated[id] = data;
        });
        return updated;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // ── 이벤트 핸들러 ──
  const handleAddPosition = (stock: Position) => {
    setPositions(prev => [...prev, { ...stock, id: Date.now() }]);
    setShowAddModal(false);
  };

  const handleEditPosition = (stock: Position) => {
    setPositions(prev => prev.map(p => p.id === stock.id ? stock : p));
    setEditingPosition(null);
  };

  const handleDeletePosition = (id: number) => {
    setPositions(prev => prev.filter(p => p.id !== id));
    setPriceDataMap(prev => { const u = { ...prev }; delete u[id]; return u; });
  };

  const handleUpgrade = () => {
    setUser({ ...user, membership: 'premium' });
    setShowUpgradePopup(false);
  };

  // D-1: 알림 관련 핸들러
  const handleDismissAlert = (id: string | number) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  const handleMarkAllRead = () => {
    setAlerts([]);
  };

  // D-1: 탭 변경 핸들러 (알림 탭 진입 시 자동 읽음 처리)
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  // ── 이계 계산 ──
  const totalCost = positions.reduce((sum, p) => sum + p.buyPrice * p.quantity, 0);
  const totalValue = positions.reduce((sum, p) => { 
    const price = priceDataMap[p.id]?.[priceDataMap[p.id]?.length - 1]?.close || p.buyPrice; 
    return sum + price * p.quantity; 
  }, 0);
  const totalProfit = totalValue - totalCost;
  const totalProfitRate = totalCost > 0 ? (totalProfit / totalCost) * 100 : 0;

  // ============================================
  // D-3: 메인 레이아웃 스타일 계산
  // 모바일: 단일 컬럼 (탭 전환)
  // 태블릿: 2컬럼 (1fr + 320px 사이드바)
  // 데스크탑 프리미엄: 2컬럼 (1fr + 380px 사이드바)
  // 데스크탑 무료: 3컬럼 (140px 광고 + 1fr + 380px 사이드바)
  // ============================================
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
    // 데스크탑
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
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(180deg, #0a0a0f 0%, #0f172a 50%, #0a0a0f 100%)', 
      color: '#fff', 
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', 
      fontSize: '14px',
      paddingBottom: isMobile ? '70px' : '0',
    }}>
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

      {/* ── 메인 컨텐츠 ── */}
      <main style={{ 
        maxWidth: isMobile ? '100%' : isTablet ? '1200px' : '1600px', 
        margin: '0 auto', 
        padding: isMobile ? '16px 0' : '24px' 
      }}>
        {/* 반응형 요약 카드 */}
        <ResponsiveSummaryCards 
          totalCost={totalCost}
          totalValue={totalValue}
          totalProfit={totalProfit}
          totalProfitRate={totalProfitRate}
        />

        {/* ============================================ */}
        {/* D-3: 메인 2컬럼 레이아웃 (Grid) */}
        {/* ============================================ */}
        <div style={getMainLayoutStyle()}>
          
          {/* ── 광고 영역 (데스크탑, 무료회원만) ── */}
          {!isMobile && !isTablet && !isPremium && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[1, 2].map(i => (
                <div key={i} style={{ 
                  background: 'linear-gradient(180deg, #1f2937 0%, #111827 100%)', 
                  borderRadius: '12px', 
                  padding: '16px', 
                  border: '1px solid rgba(255,255,255,0.05)', 
                  textAlign: 'center', 
                  flex: 1, 
                  minHeight: '180px', 
                  display: 'flex', flexDirection: 'column', 
                  alignItems: 'center', justifyContent: 'center' 
                }}>
                  <div style={{ fontSize: '11px', color: '#4b5563', marginBottom: '8px' }}>광고</div>
                  <div style={{ fontSize: '24px', marginBottom: '8px' }}>📢</div>
                  <div style={{ fontSize: '11px', color: '#374151' }}>Google AdMob</div>
                </div>
              ))}
              <div 
                onClick={() => setShowUpgradePopup(true)} 
                style={{ 
                  background: 'linear-gradient(135deg, rgba(139,92,246,0.2) 0%, rgba(59,130,246,0.2) 100%)', 
                  borderRadius: '12px', padding: '16px', 
                  border: '1px solid rgba(139,92,246,0.3)', 
                  textAlign: 'center', cursor: 'pointer' 
                }}
              >
                <div style={{ fontSize: '22px', marginBottom: '6px' }}>👑</div>
                <div style={{ fontSize: '12px', color: '#a78bfa', fontWeight: '600' }}>광고 제거</div>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>프리미엄</div>
              </div>
            </div>
          )}

          {/* ============================================ */}
          {/* 좌측 컬럼: 포지션 목록 */}
          {/* 모바일에서는 activeTab === 'positions'일 때만 표시 */}
          {/* ============================================ */}
          <div style={{ 
            display: isMobile && activeTab !== 'positions' ? 'none' : 'block',
            padding: isMobile ? '0 16px' : '0',
          }}>
            {/* 모바일: 포지션 탭에서 시장분석 미니 요약 배너 */}
            {isMobile && activeTab === 'positions' && (
              <div 
                onClick={() => setActiveTab('market')}
                style={{ 
                  background: 'linear-gradient(135deg, rgba(239,68,68,0.15) 0%, rgba(249,115,22,0.1) 100%)',
                  border: '1px solid rgba(239,68,68,0.3)',
                  borderRadius: '10px', 
                  padding: '12px', 
                  marginBottom: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '24px' }}>🥚</span>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#ef4444' }}>
                      {MARKET_CYCLE.phaseName} (매도 관망)
                    </div>
                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                      {MARKET_CYCLE.recommendation} · 탭하여 상세보기
                    </div>
                  </div>
                </div>
                <span style={{ color: '#64748b', fontSize: '18px' }}>›</span>
              </div>
            )}
            
            {/* 포지션 헤더 */}
            <div style={{ 
              display: 'flex', alignItems: 'center', 
              justifyContent: 'space-between', marginBottom: '16px' 
            }}>
              <h2 style={{ 
                fontSize: isMobile ? '16px' : '18px', 
                fontWeight: '600', color: '#fff', margin: 0 
              }}>📊 모니터링 중인 종목</h2>
              <span style={{ 
                fontSize: isMobile ? '11px' : '13px', color: '#64748b' 
              }}>실시간 조건 감시 중</span>
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

            {/* 종목 추가 카드 */}
            <PositionCardInline 
              onAdd={() => setShowAddModal(true)}
              isPremium={isPremium}
              positionCount={positions.length}
            />
          </div>

          {/* ============================================ */}
          {/* 우측 사이드바 (데스크탑/태블릿) */}
          {/* 모바일에서는 각 탭에 해당하는 콘텐츠만 표시 */}
          {/* ============================================ */}
          {(!isMobile || activeTab === 'market' || activeTab === 'alerts' || activeTab === 'guide') && (
          <div style={{ 
            display: 'block',
            padding: isMobile ? '0 16px' : '0',
          }}>
            {/* ── 시장 분석 (MarketCycleWidget) ── */}
            <div style={{ display: isMobile && activeTab !== 'market' ? 'none' : 'block' }}>
              <MarketCycleWidget isPremium={isPremium} />
            </div>
            
            {/* ── 알림 영역 ── */}
            <div style={{ 
              display: isMobile && activeTab !== 'alerts' ? 'none' : 'block',
              background: 'linear-gradient(145deg, #1e293b 0%, #0f172a 100%)', 
              borderRadius: '14px', 
              padding: isMobile ? '14px' : '16px', 
              border: '1px solid rgba(255,255,255,0.08)', 
              marginBottom: '12px', 
              maxHeight: isMobile ? 'none' : '300px', 
              overflow: 'auto' 
            }}>
              {/* 알림 헤더 */}
              <div style={{ 
                display: 'flex', alignItems: 'center', 
                justifyContent: 'space-between', marginBottom: '12px' 
              }}>
                <h2 style={{ 
                  fontSize: isMobile ? '15px' : '16px', fontWeight: '600', 
                  color: '#fff', margin: 0, 
                  display: 'flex', alignItems: 'center', gap: '8px' 
                }}>
                  🔔 조건 도달 알림
                  {alerts.length > 0 && (
                    <span style={{ 
                      background: '#ef4444', color: '#fff', 
                      padding: '2px 10px', borderRadius: '10px', 
                      fontSize: '12px', fontWeight: '700' 
                    }}>{alerts.length}</span>
                  )}
                </h2>
                {alerts.length > 0 && (
                  <button 
                    onClick={handleMarkAllRead}
                    style={{ 
                      background: 'rgba(255,255,255,0.1)', border: 'none', 
                      borderRadius: '6px', padding: '6px 10px', 
                      color: '#94a3b8', fontSize: '12px', cursor: 'pointer' 
                    }}
                  >모두 삭제</button>
                )}
              </div>

              {/* 알림 목록 */}
              {alerts.length === 0 ? (
                <div style={{ textAlign: 'center', padding: isMobile ? '20px 16px' : '30px 16px' }}>
                  <div style={{ fontSize: '32px', marginBottom: '10px' }}>✅</div>
                  <div style={{ fontSize: '14px', color: '#94a3b8' }}>현재 도달한 조건이 없습니다</div>
                  <div style={{ fontSize: '12px', color: '#475569', marginTop: '4px' }}>
                    설정한 매도 조건에 근접하면 알림이 표시됩니다
                  </div>
                </div>
              ) : (
                alerts.map(alert => (
                  <AlertCard 
                    key={alert.id} 
                    alert={alert} 
                    onDismiss={handleDismissAlert}
                  />
                ))
              )}
            </div>
            
            {/* ── 매도법 가이드 (SellMethodGuide) ── */}
            <SellMethodGuide activeTab={activeTab} />
            
            {/* ── 면책조항 ── */}
            {(!isMobile || activeTab === 'guide') && (
              <div style={{ 
                padding: isMobile ? '12px' : '14px', 
                background: 'rgba(255,255,255,0.02)', 
                borderRadius: '12px', 
                borderLeft: '4px solid #64748b' 
              }}>
                <p style={{ 
                  fontSize: isMobile ? '11px' : '12px', 
                  color: '#64748b', margin: 0, lineHeight: '1.6' 
                }}>
                  ⚠️ 본 앱은 사용자가 선택한 조건을 모니터링하는 유틸리티 도구입니다. 
                  제공되는 알람은 투자자문이나 투자권유가 아니며, 
                  모든 투자 판단의 책임은 사용자에게 있습니다.
                </p>
              </div>
            )}
          </div>
          )}
        </div>

        {/* ── 설정 탭 (준비 중) ── */}
        {activeTab === 'settings' && (
          <div style={{
            background: 'rgba(255,255,255,0.03)', borderRadius: '12px',
            padding: '40px 20px', textAlign: 'center',
          }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>⚙️</div>
            <div style={{ fontSize: '15px', color: '#94a3b8' }}>설정 기능 준비 중입니다</div>
          </div>
        )}
      </main>

      {/* ── 모바일 하단 네비게이션 ── */}
      {isMobile && (
        <MobileNav
          activeTab={activeTab}
          onTabChange={handleTabChange}
          unreadAlertCount={unreadAlertCount}
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
