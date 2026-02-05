'use client'

import React, { useState, useEffect } from 'react'
import { useResponsive } from '@/hooks/useResponsive'
import { Position, AlertItem, PriceData, User } from '@/types'
import { SELL_PRESETS } from '@/constants'
import { generateMockPriceData } from '@/utils'
import {
  ResponsiveHeader,
  SummaryCards,
  PositionCard,
  AlertCard,
  SellMethodGuide,
  StockModal,
  UpgradePopup,
  MobileNav
} from '@/components'

// 초기 데모 데이터
const INITIAL_POSITIONS: Position[] = [
  {
    id: 1,
    name: '삼성전자',
    code: '005930',
    buyPrice: 71500,
    quantity: 100,
    highestPrice: 78200,
    selectedPresets: ['candle3', 'stopLoss', 'twoThird', 'maSignal'],
    presetSettings: { stopLoss: { value: -5 }, maSignal: { value: 20 } }
  },
  {
    id: 2,
    name: '현대차',
    code: '005380',
    buyPrice: 215000,
    quantity: 20,
    highestPrice: 228000,
    selectedPresets: ['candle3', 'stopLoss', 'maSignal'],
    presetSettings: { stopLoss: { value: -3 }, maSignal: { value: 20 } }
  },
  {
    id: 3,
    name: '한화에어로스페이스',
    code: '012450',
    buyPrice: 285000,
    quantity: 15,
    highestPrice: 412000,
    selectedPresets: ['twoThird', 'maSignal', 'volumeZone', 'fundamental'],
    presetSettings: { maSignal: { value: 60 } }
  },
]

const INITIAL_ALERTS: AlertItem[] = [
  {
    id: 1,
    stockName: '삼성전자',
    code: '005930',
    preset: SELL_PRESETS.stopLoss,
    message: '손절 기준가(-5%) 근접! 현재 -4.2%',
    currentPrice: 68500,
    targetPrice: 67925,
    timestamp: Date.now() - 300000
  },
  {
    id: 2,
    stockName: '한화에어로스페이스',
    code: '012450',
    preset: SELL_PRESETS.twoThird,
    message: '최고점 대비 1/3 하락 근접',
    currentPrice: 365000,
    targetPrice: 369600,
    timestamp: Date.now() - 1800000
  }
]

export default function SellSignalApp() {
  const { isMobile, isTablet } = useResponsive()

  // 상태 관리
  const [user, setUser] = useState<User>({ membership: 'free', email: 'demo@test.com' })
  const [positions, setPositions] = useState<Position[]>(INITIAL_POSITIONS)
  const [priceDataMap, setPriceDataMap] = useState<Record<number, PriceData[]>>({})
  const [alerts, setAlerts] = useState<AlertItem[]>(INITIAL_ALERTS)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingPosition, setEditingPosition] = useState<Position | null>(null)
  const [showUpgradePopup, setShowUpgradePopup] = useState(false)
  const [activeTab, setActiveTab] = useState('positions')

  const isPremium = user?.membership === 'premium'

  // 가격 데이터 초기화
  useEffect(() => {
    const newData: Record<number, PriceData[]> = {}
    positions.forEach(pos => {
      if (!priceDataMap[pos.id]) {
        newData[pos.id] = generateMockPriceData(pos.buyPrice, 60)
      }
    })
    if (Object.keys(newData).length > 0) {
      setPriceDataMap(prev => ({ ...prev, ...newData }))
    }
  }, [positions])

  // 실시간 가격 업데이트
  useEffect(() => {
    const interval = setInterval(() => {
      setPriceDataMap(prev => {
        const updated = { ...prev }
        Object.keys(updated).forEach(idStr => {
          const id = Number(idStr)
          const data = [...updated[id]]
          const last = data[data.length - 1]
          const change = (Math.random() - 0.48) * last.close * 0.008
          const newClose = Math.max(last.close + change, last.close * 0.95)
          data[data.length - 1] = {
            ...last,
            close: newClose,
            high: Math.max(last.high, newClose),
            low: Math.min(last.low, newClose)
          }
          updated[id] = data
        })
        return updated
      })
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  // 이계 계산
  const totalCost = positions.reduce((sum, p) => sum + p.buyPrice * p.quantity, 0)
  const totalValue = positions.reduce((sum, p) => {
    const price = priceDataMap[p.id]?.[priceDataMap[p.id]?.length - 1]?.close || p.buyPrice
    return sum + price * p.quantity
  }, 0)
  const totalProfit = totalValue - totalCost
  const totalProfitRate = totalCost > 0 ? (totalProfit / totalCost) * 100 : 0

  // 핸들러
  const handleSavePosition = (position: Position) => {
    if (editingPosition) {
      setPositions(prev => prev.map(p => p.id === position.id ? position : p))
      setEditingPosition(null)
    } else {
      setPositions(prev => [...prev, position])
      setShowAddModal(false)
    }
  }

  const handleDeletePosition = (id: number) => {
    setPositions(prev => prev.filter(p => p.id !== id))
    setPriceDataMap(prev => {
      const updated = { ...prev }
      delete updated[id]
      return updated
    })
  }

  const handleDismissAlert = (id: number) => {
    setAlerts(prev => prev.filter(a => a.id !== id))
  }

  // 레이아웃 스타일
  const getMainLayoutStyle = (): React.CSSProperties => {
    if (isMobile) {
      return {
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        padding: '0',
      }
    }
    if (isTablet) {
      return {
        display: 'grid',
        gridTemplateColumns: '1fr 320px',
        gap: '16px',
        padding: '0 20px',
      }
    }
    return {
      display: 'grid',
      gridTemplateColumns: isPremium ? '1fr 380px' : '140px 1fr 380px',
      gap: '20px',
    }
  }

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
        * { -webkit-tap-highlight-color: transparent; }
      `}</style>

      {/* 헤더 */}
      <ResponsiveHeader
        alertCount={alerts.length}
        isPremium={isPremium}
        onShowUpgrade={() => setShowUpgradePopup(true)}
        onShowAddModal={() => setShowAddModal(true)}
        />

      {/* 메인 */}
      <main style={{
        maxWidth: isMobile ? '100%' : isTablet ? '1200px' : '1600px',
        margin: '0 auto',
        padding: isMobile ? '16px 0' : '24px'
      }}>
        {/* 요약 카드 */}
        <SummaryCards
          totalCost={totalCost}
          totalValue={totalValue}
          totalProfit={totalProfit}
          totalProfitRate={totalProfitRate}
        />

        {/* 모바일 탭 네비게이션 */}
        {isMobile && (
          <div style={{
            display: 'flex',
            gap: '8px',
            padding: '0 16px',
            marginBottom: '16px',
            overflowX: 'auto',
          }}>
            {[
              { id: 'positions', label: '📊 포지션', count: positions.length },
              { id: 'alerts', label: '🔔 알림', count: alerts.length },
              { id: 'market', label: '🥚 시장분석' },
              { id: 'guide', label: '📚 가이드' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '10px 16px',
                  background: activeTab === tab.id ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.05)',
                  border: activeTab === tab.id ? '1px solid rgba(59,130,246,0.4)' : '1px solid rgba(255,255,255,0.1)',
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
                {tab.count !== undefined && tab.count > 0 && (
                  <span style={{
                    background: activeTab === tab.id ? '#3b82f6' : 'rgba(255,255,255,0.2)',
                    color: '#fff',
                    padding: '2px 6px',
                    borderRadius: '6px',
                    fontSize: '11px',
                  }}>{tab.count}</span>
                )}
              </button>
            ))}
          </div>
        )}

        {/* 메인 레이아웃 */}
        <div style={getMainLayoutStyle()}>
          {/* 광고 영역 (데스크톱, 무료회원) */}
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
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center'
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
                  borderRadius: '12px',
                  padding: '16px',
                  border: '1px solid rgba(139,92,246,0.3)',
                  textAlign: 'center',
                  cursor: 'pointer'
                }}
              >
                <div style={{ fontSize: '22px', marginBottom: '6px' }}>👑</div>
                <div style={{ fontSize: '12px', color: '#a78bfa', fontWeight: '600' }}>광고 제거</div>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>프리미엄</div>
              </div>
            </div>
          )}

          {/* 포지션 목록 */}
          <div style={{
            display: isMobile && activeTab !== 'positions' ? 'none' : 'block',
            padding: isMobile ? '0 16px' : '0',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '16px'
            }}>
              <h2 style={{
                fontSize: isMobile ? '16px' : '18px',
                fontWeight: '600',
                color: '#fff',
                margin: 0
              }}>📊 모니터링 중인 종목</h2>
              <span style={{
                fontSize: isMobile ? '11px' : '13px',
                color: '#64748b'
              }}>실시간 조건 감시 중</span>
            </div>
            {positions.map(pos => (
              <PositionCard
                key={pos.id}
                position={pos}
                priceData={priceDataMap[pos.id]}
                onEdit={setEditingPosition}
                onDelete={handleDeletePosition}
              />
            ))}
          </div>

          {/* 우측 사이드바 / 모바일에서는 탭으로 표시 */}
          {(!isMobile || activeTab === 'market' || activeTab === 'alerts' || activeTab === 'guide') && (
            <div style={{
              display: 'block',
              padding: isMobile ? '0 16px' : '0',
            }}>
              {/* 알림 영역 */}
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
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '12px'
                }}>
                  <h2 style={{
                    fontSize: isMobile ? '15px' : '16px',
                    fontWeight: '600',
                    color: '#fff',
                    margin: 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    🔔 조건 도달 알림
                    {alerts.length > 0 && (
                      <span style={{
                        background: '#ef4444',
                        color: '#fff',
                        padding: '2px 10px',
                        borderRadius: '10px',
                        fontSize: '12px',
                        fontWeight: '700'
                      }}>{alerts.length}</span>
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
                        cursor: 'pointer'
                      }}
                    >모두 지우기</button>
                  )}
                </div>
                {alerts.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: isMobile ? '20px 16px' : '30px 16px' }}>
                    <div style={{ fontSize: '32px', marginBottom: '10px' }}>✨</div>
                    <div style={{ fontSize: '14px', color: '#94a3b8' }}>현재 도달한 조건이 없습니다</div>
                  </div>
                ) : (
                  alerts.slice(0, 5).map(alert => (
                    <AlertCard
                      key={alert.id}
                      alert={alert}
                      onDismiss={handleDismissAlert}
                    />
                  ))
                )}
              </div>

              {/* 매도법 가이드 */}
              <div style={{
                display: isMobile && activeTab !== 'guide' ? 'none' : 'block'
              }}>
                <SellMethodGuide />
              </div>

              {/* 면책조항 */}
              {(!isMobile || activeTab === 'guide') && (
                <div style={{
                  padding: isMobile ? '12px' : '14px',
                  background: 'rgba(255,255,255,0.02)',
                  borderRadius: '12px',
                  borderLeft: '4px solid #64748b'
                }}>
                  <p style={{
                    fontSize: isMobile ? '11px' : '12px',
                    color: '#64748b',
                    margin: 0,
                    lineHeight: '1.6'
                  }}>
                    ⚠️ 본 앱은 사용자가 선택한 조건을 모니터링하는 유틸리티 도구입니다. 제공되는 알람은 투자자문이나 투자권유가 아니며, 모든 투자 판단의 책임은 사용자에게 있습니다.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* 모바일 하단 네비게이션 바 */}
      {isMobile && (
        <MobileNav
          activeTab={activeTab}
          onTabChange={setActiveTab}
          alertCount={alerts.length}
        />
      )}

      {/* 모달들 */}
      {showAddModal && (
        <StockModal
          onSave={handleSavePosition}
          onClose={() => setShowAddModal(false)}
        />
      )}
      {editingPosition && (
        <StockModal
          stock={editingPosition}
          onSave={handleSavePosition}
          onClose={() => setEditingPosition(null)}
        />
      )}
      {showUpgradePopup && (
        <UpgradePopup
          onUpgrade={() => {
            setUser({ ...user, membership: 'premium' })
            setShowUpgradePopup(false)
          }}
          onClose={() => setShowUpgradePopup(false)}
        />
      )}
    </div>
  )
}
