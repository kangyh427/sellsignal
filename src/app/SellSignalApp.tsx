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
  SellPreset,
  Stock
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
  calculateDDay,
  formatKoreanNumber,
  formatPercent 
} from '../utils/calculations';

// ============================================
// Import: Constants
// ============================================
import { 
  SELL_PRESETS, 
  STOCK_LIST, 
  MARKET_CYCLE,
  PROFIT_STAGES,
  EARNINGS_DATA
} from '../constants';

// ============================================
// Import: Components
// ============================================
import EnhancedCandleChart from '../components/EnhancedCandleChart';
import StockModal from '../components/StockModal';
import ResponsiveHeader from '../components/ResponsiveHeader';

// ============================================
// Main App Component
// ============================================
export default function SellSignalApp() {
  const { isMobile, isTablet, isDesktop } = useResponsive();
  
  // 상태 관리 (타입 명시)
  const [user, setUser] = useState<User>({ name: '투자자', email: 'user@example.com', membership: 'free' });
  const [positions, setPositions] = useState<Position[]>([]);
  const [activeTab, setActiveTab] = useState<string>('home');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [editingPosition, setEditingPosition] = useState<Position | null>(null);
  const [showUpgradePopup, setShowUpgradePopup] = useState<boolean>(false);
  const [alerts, setAlerts] = useState<Alert[]>([
    { id: '1', type: 'warning', message: '삼성전자가 손절 라인에 근접했습니다', timestamp: '5분 전', read: false, severity: 'high' },
    { id: '2', type: 'info', message: 'SK하이닉스 실적 발표일이 3일 남았습니다', timestamp: '1시간 전', read: false, severity: 'medium' },
  ]);

  const isPremium = user.membership === 'premium';

  // 차트 데이터 초기화 추적
  const priceHistoryInitialized = React.useRef<Set<string>>(new Set());

  // 차트 데이터 최적화 - 초기화 한 번만 수행
  useEffect(() => {
    if (positions.length === 0) return;
    
    const updatedPositions = positions.map((pos: Position) => {
      // 이미 초기화된 포지션이거나 priceHistory가 있으면 건너뛰기
      if (priceHistoryInitialized.current.has(pos.id) || (pos.priceHistory && pos.priceHistory.length > 0)) {
        return pos;
      }
      
      // 새 포지션에 대해서만 히스토리 생성
      const history = generateMockPriceData(pos.buyPrice, 60);
      priceHistoryInitialized.current.add(pos.id);
      
      return {
        ...pos,
        priceHistory: history.map((d: ChartDataPoint) => ({
          date: d.date.toISOString(),
          price: d.close,
          volume: d.volume
        }))
      };
    });
    
    // 실제로 변경이 있을 때만 업데이트
    const hasChanges = updatedPositions.some((pos: Position, idx: number) => 
      pos !== positions[idx]
    );
    
    if (hasChanges) {
      setPositions(updatedPositions);
    }
  }, [positions]); // positions 전체를 의존성으로 사용하되, ref로 중복 초기화 방지

  // highestPriceRecorded 자동 업데이트
  useEffect(() => {
    if (positions.length === 0) return;
    
    const updatedPositions = positions.map((pos: Position) => {
      // 최고가가 없거나 현재가가 최고가보다 높으면 업데이트
      const currentHighest = pos.highestPriceRecorded || pos.buyPrice;
      
      if (pos.currentPrice > currentHighest) {
        return {
          ...pos,
          highestPriceRecorded: pos.currentPrice
        };
      }
      
      // highestPriceRecorded가 없는 경우 초기화
      if (!pos.highestPriceRecorded) {
        return {
          ...pos,
          highestPriceRecorded: Math.max(pos.buyPrice, pos.currentPrice)
        };
      }
      
      return pos;
    });
    
    // 실제 변경이 있을 때만 업데이트
    const hasChanges = updatedPositions.some((pos: Position, idx: number) => 
      pos.highestPriceRecorded !== positions[idx].highestPriceRecorded
    );
    
    if (hasChanges) {
      setPositions(updatedPositions);
    }
  }, [positions]);

  // 포지션별 수익률 계산 (메모이제이션)
  const positionsWithProfitRate = useMemo<PositionWithProfit[]>(() => {
    return positions.map((pos: Position): PositionWithProfit => {
      const profitRate = ((pos.currentPrice - pos.buyPrice) / pos.buyPrice) * 100;
      const profitAmount = (pos.currentPrice - pos.buyPrice) * pos.quantity;
      const totalValue = pos.currentPrice * pos.quantity;
      
      return {
        ...pos,
        profitRate,
        profitAmount,
        totalValue,
      };
    });
  }, [positions]);

  // 포트폴리오 통계
  const portfolioStats = useMemo(() => {
    const totalInvestment = positions.reduce((sum: number, p: Position) => sum + (p.buyPrice * p.quantity), 0);
    const totalValue = positions.reduce((sum: number, p: Position) => sum + (p.currentPrice * p.quantity), 0);
    const totalProfit = totalValue - totalInvestment;
    const profitRate = totalInvestment > 0 ? (totalProfit / totalInvestment) * 100 : 0;

    return { totalInvestment, totalValue, totalProfit, profitRate };
  }, [positions]);

  // 주식 추가/편집 모달

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(to bottom, #0f172a 0%, #1e293b 100%)',
      color: '#fff',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    }}>
      {/* 헤더 */}
      <ResponsiveHeader 
        alerts={alerts} 
        isPremium={isPremium} 
        isMobile={isMobile}
        onUpgrade={() => setShowUpgradePopup(true)}
      />

      {/* 메인 컨텐츠 */}
      <main style={{ 
        padding: isMobile ? '16px' : '24px',
        paddingBottom: isMobile ? '80px' : '24px',
      }}>
        {activeTab === 'home' && (
          <>
            {/* 포트폴리오 요약 카드 */}
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
                  }}
                >
                  + 추가
                </button>
              </div>

              {positions.length === 0 ? (
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
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {positionsWithProfitRate.map((pos: PositionWithProfit) => {
                    // 차트 데이터 생성 (priceHistory가 있으면 사용)
                    const chartData = pos.priceHistory && pos.priceHistory.length > 0
                      ? pos.priceHistory.map((p: PricePoint) => ({
                          date: new Date(p.date),
                          open: p.price,
                          high: p.price * 1.01,
                          low: p.price * 0.99,
                          close: p.price,
                          volume: p.volume || 0
                        }))
                      : generateMockPriceData(pos.buyPrice, 30);
                    
                    // 매도 가격 계산
                    const sellPrices = calculateSellPrices(pos, chartData, pos.presetSettings);
                    
                    // 수익 구간 판단
                    const getStage = () => {
                      if (pos.profitRate < 5) return 'initial';
                      if (pos.profitRate < 10) return 'profit5';
                      return 'profit10';
                    };
                    
                    const stage = getStage();
                    const stageInfo = PROFIT_STAGES[stage];

                    return (
                      <div
                        key={pos.id}
                        style={{
                          background: 'rgba(255,255,255,0.03)',
                          borderRadius: '16px',
                          padding: isMobile ? '16px' : '20px',
                          border: '1px solid rgba(255,255,255,0.1)',
                        }}
                      >
                        {/* 헤더 */}
                        <div style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          marginBottom: '16px',
                          alignItems: 'flex-start' 
                        }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: '8px',
                              marginBottom: '6px' 
                            }}>
                              <h3 style={{ 
                                fontSize: isMobile ? '17px' : '19px', 
                                fontWeight: '700', 
                                color: '#fff',
                                margin: 0 
                              }}>
                                {pos.stock.name}
                              </h3>
                              <span style={{
                                fontSize: '13px',
                                color: '#64748b',
                                fontWeight: '500'
                              }}>
                                {pos.stock.code}
                              </span>
                            </div>
                            
                            <div style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: '8px',
                              fontSize: '13px',
                              color: '#94a3b8' 
                            }}>
                              <span>{pos.quantity}주</span>
                              <span>·</span>
                              <span>매수가 {formatKoreanNumber(pos.buyPrice)}원</span>
                            </div>
                          </div>
                          
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ 
                              fontSize: isMobile ? '19px' : '21px', 
                              fontWeight: '800',
                              color: pos.profitRate >= 0 ? '#10b981' : '#ef4444',
                              marginBottom: '4px'
                            }}>
                              {formatPercent(pos.profitRate)}
                            </div>
                            <div style={{ 
                              fontSize: '14px',
                              color: pos.profitRate >= 0 ? '#10b981' : '#ef4444',
                              fontWeight: '600'
                            }}>
                              {formatKoreanNumber(pos.profitAmount)}원
                            </div>
                          </div>
                        </div>

                        {/* 수익 단계 표시 */}
                        <div style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          background: `${stageInfo.color}20`,
                          color: stageInfo.color,
                          padding: '6px 12px',
                          borderRadius: '8px',
                          fontSize: '12px',
                          fontWeight: '600',
                          marginBottom: '16px'
                        }}>
                          <span>{stageInfo.label}</span>
                          <span style={{ opacity: 0.7 }}>({stageInfo.range})</span>
                        </div>

                        {/* 차트 */}
                        {chartData && chartData.length > 0 && (
                          <div style={{ marginBottom: '16px' }}>
                            <EnhancedCandleChart
                              data={chartData}
                              width={isMobile ? window.innerWidth - 64 : 500}
                              height={isMobile ? 240 : 280}
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
                            <div style={{ 
                              fontSize: '13px', 
                              color: '#94a3b8', 
                              marginBottom: '8px',
                              fontWeight: '600' 
                            }}>
                              설정된 매도 전략
                            </div>
                            <div style={{ 
                              display: 'flex', 
                              gap: '6px', 
                              flexWrap: 'wrap' 
                            }}>
                              {pos.selectedPresets.map((presetId: string) => {
                                const preset = SELL_PRESETS[presetId];
                                const price = sellPrices[presetId];
                                return (
                                  <div
                                    key={presetId}
                                    style={{
                                      fontSize: '12px',
                                      padding: '6px 10px',
                                      background: `${preset.color}20`,
                                      color: preset.color,
                                      borderRadius: '6px',
                                      border: `1px solid ${preset.color}40`,
                                      fontWeight: '600'
                                    }}
                                  >
                                    {preset.icon} {preset.name}
                                    {price && ` (${formatKoreanNumber(price)})`}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* 메모 */}
                        {pos.memo && (
                          <div style={{
                            fontSize: '13px',
                            color: '#94a3b8',
                            background: 'rgba(255,255,255,0.03)',
                            padding: '10px 12px',
                            borderRadius: '8px',
                            marginBottom: '12px',
                            lineHeight: '1.5'
                          }}>
                            {pos.memo}
                          </div>
                        )}

                        {/* 액션 버튼들 */}
                        <div style={{ 
                          display: 'flex', 
                          gap: '8px',
                          borderTop: '1px solid rgba(255,255,255,0.05)',
                          paddingTop: '12px'
                        }}>
                          <button
                            onClick={() => setEditingPosition(pos)}
                            style={{
                              flex: 1,
                              padding: '10px',
                              background: 'rgba(59,130,246,0.1)',
                              border: '1px solid rgba(59,130,246,0.3)',
                              borderRadius: '8px',
                              color: '#60a5fa',
                              fontSize: '13px',
                              fontWeight: '600',
                              cursor: 'pointer',
                            }}
                          >
                            수정
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`${pos.stock.name} 종목을 삭제하시겠습니까?`)) {
                                setPositions(prev => prev.filter(p => p.id !== pos.id));
                              }
                            }}
                            style={{
                              flex: 1,
                              padding: '10px',
                              background: 'rgba(239,68,68,0.1)',
                              border: '1px solid rgba(239,68,68,0.3)',
                              borderRadius: '8px',
                              color: '#ef4444',
                              fontSize: '13px',
                              fontWeight: '600',
                              cursor: 'pointer',
                            }}
                          >
                            삭제
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === 'analysis' && (
          <div style={{ 
            background: 'rgba(255,255,255,0.03)', 
            borderRadius: '12px', 
            padding: '40px 20px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>📈</div>
            <div style={{ fontSize: '15px', color: '#94a3b8' }}>
              상세 분석 기능 준비 중입니다
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div style={{ 
            background: 'rgba(255,255,255,0.03)', 
            borderRadius: '12px', 
            padding: '40px 20px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>⚙️</div>
            <div style={{ fontSize: '15px', color: '#94a3b8' }}>
              설정 기능 준비 중입니다
            </div>
          </div>
        )}
      </main>

      {/* 모바일 하단 네비게이션 */}
      {isMobile && (
        <nav style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'rgba(15,23,42,0.95)',
          backdropFilter: 'blur(10px)',
          borderTop: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          justifyContent: 'space-around',
          padding: '8px 0 calc(8px + env(safe-area-inset-bottom))',
          zIndex: 100,
        }}>
          {[
            { id: 'home', icon: '🏠', label: '홈', badge: 0 },
            { id: 'analysis', icon: '📊', label: '분석', badge: 0 },
            { id: 'alerts', icon: '🔔', label: '알림', badge: alerts.filter(a => !a.read).length },
            { id: 'settings', icon: '⚙️', label: '설정', badge: 0 },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                background: 'none',
                border: 'none',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                cursor: 'pointer',
                position: 'relative',
              }}
            >
              <span style={{ fontSize: '20px' }}>{item.icon}</span>
              <span style={{ 
                fontSize: '10px', 
                color: activeTab === item.id ? '#60a5fa' : '#64748b',
                fontWeight: activeTab === item.id ? '600' : '400',
              }}>{item.label}</span>
              {item.badge > 0 && (
                <span style={{
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
                }}>{item.badge}</span>
              )}
            </button>
          ))}
        </nav>
      )}

      {/* 모달들 */}
      {showAddModal && (
        <StockModal 
          onSave={(stock: Position) => { 
            // 새 포지션 추가 시 priceHistory 즉시 생성
            const history = generateMockPriceData(stock.buyPrice, 60);
            const newPosition: Position = {
              ...stock,
              id: Date.now().toString(),
              priceHistory: history.map((d: ChartDataPoint) => ({
                date: d.date.toISOString(),
                price: d.close,
                volume: d.volume
              })),
              highestPriceRecorded: Math.max(stock.buyPrice, stock.currentPrice)
            };
            
            setPositions(prev => [...prev, newPosition]); 
            setShowAddModal(false); 
          }} 
          onClose={() => setShowAddModal(false)} 
          isMobile={isMobile}
        />
      )}
      {editingPosition && (
        <StockModal 
          stock={editingPosition} 
          onSave={(stock: Position) => { 
            setPositions(prev => prev.map(p => p.id === stock.id ? stock : p)); 
            setEditingPosition(null); 
          }} 
          onClose={() => setEditingPosition(null)} 
          isMobile={isMobile}
        />
      )}

      {/* 업그레이드 팝업 */}
      {showUpgradePopup && (
        <div style={{ 
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
        }}>
          <div style={{ 
            background: 'linear-gradient(145deg, #1e293b 0%, #0f172a 100%)', 
            borderRadius: '20px', 
            padding: isMobile ? '20px' : '32px', 
            maxWidth: '420px', 
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto',
            border: '1px solid rgba(139,92,246,0.3)',
            boxShadow: '0 0 60px rgba(139,92,246,0.2)'
          }}>
            {/* 헤더 */}
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{ fontSize: '56px', marginBottom: '12px' }}>👑</div>
              <h2 style={{ 
                fontSize: isMobile ? '22px' : '26px', 
                fontWeight: '700', 
                color: '#fff', 
                margin: '0 0 8px' 
              }}>프리미엄 멤버십</h2>
              <p style={{ 
                fontSize: '14px', 
                color: '#94a3b8', 
                margin: 0
              }}>더 강력한 매도 시그널 도구를 경험하세요</p>
            </div>
            
            {/* 가격 */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(139,92,246,0.15) 0%, rgba(99,102,241,0.15) 100%)',
              borderRadius: '12px',
              padding: '16px',
              textAlign: 'center',
              marginBottom: '20px',
              border: '1px solid rgba(139,92,246,0.3)'
            }}>
              <div style={{ fontSize: '14px', color: '#a78bfa', marginBottom: '4px' }}>월 구독료</div>
              <div style={{ 
                fontSize: isMobile ? '32px' : '36px', 
                fontWeight: '800', 
                color: '#fff'
              }}>
                ₩5,900
                <span style={{ fontSize: '14px', color: '#94a3b8', fontWeight: '400' }}>/월</span>
              </div>
              <div style={{ fontSize: '12px', color: '#10b981', marginTop: '4px' }}>
                🎁 첫 7일 무료 체험
              </div>
            </div>
            
            {/* 기능 비교 */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#fff', marginBottom: '12px' }}>
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
                <div key={i} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 12px',
                  background: 'rgba(255,255,255,0.03)',
                  borderRadius: '8px',
                  marginBottom: '6px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '16px' }}>{item.icon}</span>
                    <span style={{ fontSize: '13px', color: '#e2e8f0' }}>{item.text}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <span style={{ fontSize: '12px', color: '#64748b', minWidth: '32px', textAlign: 'center' }}>{item.free}</span>
                    <span style={{ fontSize: '12px', color: '#10b981', minWidth: '32px', textAlign: 'center' }}>{item.premium}</span>
                  </div>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '4px', paddingRight: '12px' }}>
                <span style={{ fontSize: '10px', color: '#64748b' }}>무료</span>
                <span style={{ fontSize: '10px', color: '#10b981' }}>프리미엄</span>
              </div>
            </div>
            
            {/* 버튼 */}
            <button 
              onClick={() => { setUser({ ...user, membership: 'premium' }); setShowUpgradePopup(false); }} 
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
                boxShadow: '0 4px 20px rgba(139,92,246,0.4)'
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
                cursor: 'pointer' 
              }}
            >
              나중에 할게요
            </button>
            
            {/* 하단 안내 */}
            <p style={{ 
              fontSize: '11px', 
              color: '#64748b', 
              textAlign: 'center', 
              margin: '16px 0 0',
              lineHeight: '1.5'
            }}>
              언제든지 해지 가능 · 자동 결제 · 부가세 포함
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
