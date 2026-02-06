'use client';

import React, { useState, useEffect, useMemo } from 'react';

// ============================================
// Import: Types
// ============================================
import type { 
  Position, 
  User, 
  Alert, 
  PositionWithProfit,
  ChartDataPoint,
  PricePoint,
} from '../types';

// ============================================
// Import: Hooks
// ============================================
import { useResponsive } from '../hooks/useResponsive';

// ============================================
// Import: Utils
// ============================================
import { 
  calculateSellPrices, 
  generateMockPriceData,
  formatKoreanNumber,
  formatPercent 
} from '../utils/calculations';

// ============================================
// Import: Constants
// ============================================
import { 
  SELL_PRESETS, 
  PROFIT_STAGES,
} from '../constants';

// ============================================
// Import: Components
// ============================================
import EnhancedCandleChart from '../components/EnhancedCandleChart';
import StockModal from '../components/StockModal';
import ResponsiveHeader from '../components/ResponsiveHeader';
import MarketCycleWidget from '../components/MarketCycleWidget';
import SummaryCards from '../components/SummaryCards';
import MobileNav from '../components/MobileNav';
import UpgradeModal from '../components/UpgradeModal';

// ============================================
// 헬퍼: 차트 반응형 크기 계산
// ============================================
const getChartDimensions = (isMobile: boolean, isTablet: boolean) => {
  if (typeof window === 'undefined') {
    return { width: 500, height: 280 };
  }
  
  if (isMobile) {
    // 모바일: 좌우 패딩(16px * 2) + 카드 패딩(16px * 2) 차감
    const width = Math.min(window.innerWidth - 64, 500);
    return { width, height: 240 };
  }
  
  if (isTablet) {
    const width = Math.min(window.innerWidth - 120, 600);
    return { width, height: 260 };
  }
  
  // 데스크탑
  return { width: 500, height: 280 };
};

// ============================================
// 헬퍼: Position에서 종목명/코드 안전 접근
// ※ Position 타입이 stock 중첩 구조와 name/code 평탄 구조를 병행하므로
//   두 경우 모두 안전하게 처리합니다.
// ============================================
const getStockName = (pos: Position): string => {
  return pos.stock?.name ?? pos.name ?? '종목명 없음';
};

const getStockCode = (pos: Position): string => {
  return pos.stock?.code ?? pos.code ?? '';
};

// ============================================
// 헬퍼: 수익 단계 판별
// ============================================
const getProfitStage = (profitRate: number): string => {
  if (profitRate < 5) return 'initial';
  if (profitRate < 10) return 'profit5';
  return 'profit10';
};

// ============================================
// ResponsiveSummaryCards 래퍼
// ============================================
const ResponsiveSummaryCards = ({ totalCost, totalValue, totalProfit, totalProfitRate }: {
  totalCost: number;
  totalValue: number;
  totalProfit: number;
  totalProfitRate: number;
}) => {
  return (
    <SummaryCards
      totalCost={totalCost}
      totalValue={totalValue}
      totalProfit={totalProfit}
      totalProfitRate={totalProfitRate}
    />
  );
};

// ============================================
// 포지션 카드 서브 컴포넌트 (인라인 → 분리)
// ============================================
interface PositionCardInlineProps {
  pos: PositionWithProfit;
  isMobile: boolean;
  isTablet: boolean;
  onEdit: (pos: Position) => void;
  onDelete: (id: string | number) => void;
}

const PositionCardInline: React.FC<PositionCardInlineProps> = ({
  pos,
  isMobile,
  isTablet,
  onEdit,
  onDelete,
}) => {
  // 차트 데이터 준비
  const chartData = useMemo(() => {
    if (pos.priceHistory && pos.priceHistory.length > 0) {
      return pos.priceHistory.map((p: PricePoint) => ({
        date: new Date(p.date),
        open: p.price,
        high: p.price * 1.01,
        low: p.price * 0.99,
        close: p.price,
        volume: p.volume || 0,
      }));
    }
    return generateMockPriceData(pos.buyPrice, 30);
  }, [pos.priceHistory, pos.buyPrice]);

  // 매도가격 계산
  const sellPrices = useMemo(() => {
    return calculateSellPrices(pos, chartData, pos.presetSettings);
  }, [pos, chartData]);

  // 수익 단계
  const stage = getProfitStage(pos.profitRate);
  const stageInfo = PROFIT_STAGES[stage];

  // 차트 크기
  const chartDim = getChartDimensions(isMobile, isTablet);

  // 종목명/코드 안전 접근
  const stockName = getStockName(pos);
  const stockCode = getStockCode(pos);

  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.03)',
        borderRadius: '16px',
        padding: isMobile ? '16px' : '20px',
        border: '1px solid rgba(255,255,255,0.1)',
      }}
    >
      {/* 종목 헤더 */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        marginBottom: '16px',
        alignItems: 'flex-start',
      }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <h3 style={{ 
              fontSize: isMobile ? '17px' : '19px', 
              fontWeight: '700', 
              color: '#fff', 
              margin: 0,
            }}>
              {stockName}
            </h3>
            <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '500' }}>
              {stockCode}
            </span>
          </div>
          <div style={{ 
            display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#94a3b8' 
          }}>
            <span>{pos.quantity}주</span>
            <span>·</span>
            <span>매수가 {formatKoreanNumber(pos.buyPrice)}원</span>
          </div>
        </div>
        
        {/* 수익률 */}
        <div style={{ textAlign: 'right' }}>
          <div style={{ 
            fontSize: isMobile ? '19px' : '21px', 
            fontWeight: '800',
            color: pos.profitRate >= 0 ? '#10b981' : '#ef4444', 
            marginBottom: '4px',
          }}>
            {formatPercent(pos.profitRate)}
          </div>
          <div style={{ 
            fontSize: '14px', 
            color: pos.profitRate >= 0 ? '#10b981' : '#ef4444', 
            fontWeight: '600',
          }}>
            {formatKoreanNumber(pos.profitAmount)}원
          </div>
        </div>
      </div>

      {/* 수익 단계 뱃지 */}
      {stageInfo && (
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          background: `${stageInfo.color}20`, color: stageInfo.color,
          padding: '6px 12px', borderRadius: '8px', fontSize: '12px',
          fontWeight: '600', marginBottom: '16px',
        }}>
          <span>{stageInfo.label}</span>
          <span style={{ opacity: 0.7 }}>({stageInfo.range})</span>
        </div>
      )}

      {/* 캔들 차트 */}
      {chartData && chartData.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <EnhancedCandleChart
            data={chartData}
            width={chartDim.width}
            height={chartDim.height}
            buyPrice={pos.buyPrice}
            sellPrices={sellPrices}
            visibleLines={{
              stopLoss: pos.selectedPresets.includes('stopLoss'),
              twoThird: pos.selectedPresets.includes('twoThird'),
              maSignal: pos.selectedPresets.includes('maSignal'),
            }}
          />
        </div>
      )}

      {/* 선택된 매도 전략 */}
      {pos.selectedPresets.length > 0 && (
        <div style={{ marginBottom: '12px' }}>
          <div style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '8px', fontWeight: '600' }}>
            설정된 매도 전략
          </div>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {pos.selectedPresets.map((presetId: string) => {
              const preset = SELL_PRESETS[presetId];
              if (!preset) return null;
              const price = sellPrices[presetId as keyof typeof sellPrices];
              return (
                <div
                  key={presetId}
                  style={{
                    fontSize: '12px', padding: '6px 10px',
                    background: `${preset.color}20`, color: preset.color,
                    borderRadius: '6px', border: `1px solid ${preset.color}40`,
                    fontWeight: '600',
                  }}
                >
                  {preset.icon} {preset.name}
                  {price && ` (${formatKoreanNumber(price as number)})`}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 메모 */}
      {pos.memo && (
        <div style={{
          fontSize: '13px', color: '#94a3b8',
          background: 'rgba(255,255,255,0.03)',
          padding: '10px 12px', borderRadius: '8px',
          marginBottom: '12px', lineHeight: '1.5',
        }}>
          {pos.memo}
        </div>
      )}

      {/* 액션 버튼 */}
      <div style={{ 
        display: 'flex', gap: '8px',
        borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '12px',
      }}>
        <button
          onClick={() => onEdit(pos)}
          style={{
            flex: 1, padding: '10px',
            background: 'rgba(59,130,246,0.1)',
            border: '1px solid rgba(59,130,246,0.3)',
            borderRadius: '8px', color: '#60a5fa',
            fontSize: '13px', fontWeight: '600', cursor: 'pointer',
            minHeight: '44px',  // 터치 타겟
          }}
        >
          수정
        </button>
        <button
          onClick={() => {
            if (confirm(`${stockName} 종목을 삭제하시겠습니까?`)) {
              onDelete(pos.id);
            }
          }}
          style={{
            flex: 1, padding: '10px',
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: '8px', color: '#ef4444',
            fontSize: '13px', fontWeight: '600', cursor: 'pointer',
            minHeight: '44px',  // 터치 타겟
          }}
        >
          삭제
        </button>
      </div>
    </div>
  );
};

// ============================================
// Main App Component
// ============================================
export default function SellSignalApp() {
  const { isMobile, isTablet, isDesktop } = useResponsive();
  
  // ────────────────────────────────────────
  // 상태 관리
  // ────────────────────────────────────────
  const [user, setUser] = useState<User>({ name: '투자자', email: 'user@example.com', membership: 'free' });
  const [positions, setPositions] = useState<Position[]>([]);
  const [activeTab, setActiveTab] = useState<string>('home');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [editingPosition, setEditingPosition] = useState<Position | null>(null);
  const [showUpgradePopup, setShowUpgradePopup] = useState<boolean>(false);
  const [alerts, setAlerts] = useState<Alert[]>([
    { 
      id: 1, stockName: '삼성전자', code: '005930', 
      preset: { id: 'stopLoss', name: '손실제한 매도법', icon: '🛑', severity: 'high' }, 
      message: '삼성전자가 손절 라인에 근접했습니다', timestamp: Date.now(), read: false, type: 'warning' 
    },
    { 
      id: 2, stockName: 'SK하이닉스', code: '000660', 
      preset: { id: 'earnings', name: '실적 발표', icon: '📊', severity: 'medium' }, 
      message: 'SK하이닉스 실적 발표일이 3일 남았습니다', timestamp: Date.now(), read: false, type: 'info' 
    },
  ]);

  const isPremium = user.membership === 'premium';
  const unreadAlertCount = alerts.filter((a: Alert) => !a.read).length;

  // ────────────────────────────────────────
  // 차트 데이터 초기화 (한 번만 수행)
  // ────────────────────────────────────────
  const priceHistoryInitialized = React.useRef<Set<string>>(new Set());

  useEffect(() => {
    if (positions.length === 0) return;
    
    const updatedPositions = positions.map((pos: Position) => {
      if (priceHistoryInitialized.current.has(String(pos.id)) || (pos.priceHistory && pos.priceHistory.length > 0)) {
        return pos;
      }
      
      const history = generateMockPriceData(pos.buyPrice, 60);
      priceHistoryInitialized.current.add(String(pos.id));
      
      return {
        ...pos,
        priceHistory: history.map((d: ChartDataPoint) => ({
          date: d.date.toISOString(),
          price: d.close,
          volume: d.volume,
        })),
      };
    });
    
    const hasChanges = updatedPositions.some((pos: Position, idx: number) => pos !== positions[idx]);
    if (hasChanges) {
      setPositions(updatedPositions);
    }
  }, [positions]);

  // ────────────────────────────────────────
  // highestPriceRecorded 자동 업데이트
  // ────────────────────────────────────────
  useEffect(() => {
    if (positions.length === 0) return;
    
    const updatedPositions = positions.map((pos: Position) => {
      const currentHighest = pos.highestPriceRecorded || pos.buyPrice;
      
      if (pos.currentPrice > currentHighest) {
        return { ...pos, highestPriceRecorded: pos.currentPrice };
      }
      
      if (!pos.highestPriceRecorded) {
        return { ...pos, highestPriceRecorded: Math.max(pos.buyPrice, pos.currentPrice) };
      }
      
      return pos;
    });
    
    const hasChanges = updatedPositions.some((pos: Position, idx: number) => 
      pos.highestPriceRecorded !== positions[idx].highestPriceRecorded
    );
    
    if (hasChanges) {
      setPositions(updatedPositions);
    }
  }, [positions]);

  // ────────────────────────────────────────
  // 파생 데이터 (메모이제이션)
  // ────────────────────────────────────────
  const positionsWithProfitRate = useMemo<PositionWithProfit[]>(() => {
    return positions.map((pos: Position): PositionWithProfit => {
      const profitRate = ((pos.currentPrice - pos.buyPrice) / pos.buyPrice) * 100;
      const profitAmount = (pos.currentPrice - pos.buyPrice) * pos.quantity;
      const totalValue = pos.currentPrice * pos.quantity;
      return { ...pos, profitRate, profitAmount, totalValue };
    });
  }, [positions]);

  const portfolioStats = useMemo(() => {
    const totalInvestment = positions.reduce((sum: number, p: Position) => sum + (p.buyPrice * p.quantity), 0);
    const totalValue = positions.reduce((sum: number, p: Position) => sum + (p.currentPrice * p.quantity), 0);
    const totalProfit = totalValue - totalInvestment;
    const profitRate = totalInvestment > 0 ? (totalProfit / totalInvestment) * 100 : 0;
    return { totalInvestment, totalValue, totalProfit, profitRate };
  }, [positions]);

  // ────────────────────────────────────────
  // 이벤트 핸들러
  // ────────────────────────────────────────
  const handleAddPosition = (stock: Position) => {
    const history = generateMockPriceData(stock.buyPrice, 60);
    const newPosition: Position = {
      ...stock,
      id: Date.now().toString(),
      priceHistory: history.map((d: ChartDataPoint) => ({
        date: d.date.toISOString(),
        price: d.close,
        volume: d.volume,
      })),
      highestPriceRecorded: Math.max(stock.buyPrice, stock.currentPrice),
    };
    setPositions(prev => [...prev, newPosition]);
    setShowAddModal(false);
  };

  const handleEditPosition = (stock: Position) => {
    setPositions(prev => prev.map(p => p.id === stock.id ? stock : p));
    setEditingPosition(null);
  };

  const handleDeletePosition = (id: string | number) => {
    setPositions(prev => prev.filter(p => p.id !== id));
  };

  const handleUpgrade = () => {
    setUser({ ...user, membership: 'premium' });
    setShowUpgradePopup(false);
  };

  // ────────────────────────────────────────
  // 렌더링
  // ────────────────────────────────────────
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(to bottom, #0f172a 0%, #1e293b 100%)',
      color: '#fff',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    }}>
      {/* ─── 헤더 ─── */}
      <ResponsiveHeader 
        alerts={alerts} 
        isPremium={isPremium} 
        isMobile={isMobile}
        onUpgrade={() => setShowUpgradePopup(true)}
      />

      {/* ─── 메인 컨텐츠 ─── */}
      <main style={{ 
        padding: isMobile ? '16px' : '24px',
        paddingBottom: isMobile ? '80px' : '24px',  // 모바일: 하단 네비 공간 확보
      }}>
        {/* ── 홈 탭 ── */}
        {activeTab === 'home' && (
          <>
            {/* 포트폴리오 요약 */}
            <ResponsiveSummaryCards
              totalCost={portfolioStats.totalInvestment}
              totalValue={portfolioStats.totalValue}
              totalProfit={portfolioStats.totalProfit}
              totalProfitRate={portfolioStats.profitRate}
            />

            {/* 시장 사이클 위젯 */}
            <MarketCycleWidget isPremium={isPremium} />

            {/* 포지션 리스트 */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '12px',
              }}>
                <h2 style={{ fontSize: '18px', fontWeight: '700', margin: 0 }}>
                  보유 종목 ({positions.length})
                </h2>
                <button
                  onClick={() => setShowAddModal(true)}
                  style={{
                    padding: '8px 14px',
                    background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    minHeight: '36px',
                  }}
                >
                  + 추가
                </button>
              </div>

              {positions.length === 0 ? (
                /* 빈 상태 */
                <div style={{
                  background: 'rgba(255,255,255,0.03)',
                  borderRadius: '12px',
                  padding: '40px 20px',
                  textAlign: 'center',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}>
                  <div style={{ fontSize: '48px', marginBottom: '12px' }}>📊</div>
                  <div style={{ fontSize: '15px', color: '#94a3b8', marginBottom: '16px' }}>
                    아직 등록된 종목이 없습니다
                  </div>
                  <button
                    onClick={() => setShowAddModal(true)}
                    style={{
                      padding: '10px 20px',
                      background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                      border: 'none',
                      borderRadius: '8px',
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
                /* 포지션 카드 목록 */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {positionsWithProfitRate.map((pos: PositionWithProfit) => (
                    <PositionCardInline
                      key={pos.id}
                      pos={pos}
                      isMobile={isMobile}
                      isTablet={isTablet}
                      onEdit={setEditingPosition}
                      onDelete={handleDeletePosition}
                    />
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* ── 분석 탭 (준비 중) ── */}
        {activeTab === 'analysis' && (
          <div style={{ 
            background: 'rgba(255,255,255,0.03)', borderRadius: '12px', 
            padding: '40px 20px', textAlign: 'center',
          }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>📈</div>
            <div style={{ fontSize: '15px', color: '#94a3b8' }}>상세 분석 기능 준비 중입니다</div>
          </div>
        )}

        {/* ── 알림 탭 (과업 D에서 연결) ── */}
        {activeTab === 'alerts' && (
          <div style={{ 
            background: 'rgba(255,255,255,0.03)', borderRadius: '12px', 
            padding: '40px 20px', textAlign: 'center',
          }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>🔔</div>
            <div style={{ fontSize: '15px', color: '#94a3b8' }}>
              {alerts.length > 0 
                ? `${alerts.length}개의 알림이 있습니다` 
                : '새로운 알림이 없습니다'
              }
            </div>
          </div>
        )}

        {/* ── 설정 탭 (준비 중) ── */}
        {activeTab === 'settings' && (
          <div style={{ 
            background: 'rgba(255,255,255,0.03)', borderRadius: '12px', 
            padding: '40px 20px', textAlign: 'center',
          }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>⚙️</div>
            <div style={{ fontSize: '15px', color: '#94a3b8' }}>설정 기능 준비 중입니다</div>
          </div>
        )}
      </main>

      {/* ─── 모바일 하단 네비게이션 ─── */}
      {isMobile && (
        <MobileNav
          activeTab={activeTab}
          onTabChange={setActiveTab}
          unreadAlertCount={unreadAlertCount}
        />
      )}

      {/* ─── 모달: 종목 추가 ─── */}
      {showAddModal && (
        <StockModal 
          onSave={handleAddPosition}
          onClose={() => setShowAddModal(false)} 
          isMobile={isMobile}
        />
      )}

      {/* ─── 모달: 종목 수정 ─── */}
      {editingPosition && (
        <StockModal 
          stock={editingPosition} 
          onSave={handleEditPosition}
          onClose={() => setEditingPosition(null)} 
          isMobile={isMobile}
        />
      )}

      {/* ─── 모달: 업그레이드 팝업 ─── */}
      {showUpgradePopup && (
        <UpgradeModal
          onUpgrade={handleUpgrade}
          onClose={() => setShowUpgradePopup(false)}
        />
      )}
    </div>
  );
}
