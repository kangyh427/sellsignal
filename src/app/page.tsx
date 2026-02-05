'use client'

import { useState, useEffect } from 'react'
import { useResponsive } from '@/hooks'
import { 
  CandleChart, 
  StockModal, 
  UpgradeModal,
  AlertCard,
  MarketCycleWidget,
  AINewsPopup,
  AIReportPopup
} from '@/components'
import { 
  SELL_PRESETS, 
  PROFIT_STAGES, 
  STOCK_LIST,
  EARNINGS_DATA,
  generateMockPriceData,
  calculateSellPrices
} from '@/lib/constants'

// Types
interface Position {
  id: number
  name: string
  code: string
  buyPrice: number
  quantity: number
  highestPrice?: number
  selectedPresets: string[]
  presetSettings: Record<string, { value: number }>
}

interface Alert {
  id: number
  stockName: string
  stockCode: string
  presetId: string
  message: string
  currentPrice?: number
  targetPrice?: number
  timestamp: number
}

interface PriceData {
  date: Date
  open: number
  high: number
  low: number
  close: number
  volume: number
}

// Initial Demo Data
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

const INITIAL_ALERTS: Alert[] = [
  {
    id: 1,
    stockName: '삼성전자',
    stockCode: '005930',
    presetId: 'stopLoss',
    message: '손절 기준가(-5%) 근접! 현재 -4.2%',
    currentPrice: 68500,
    targetPrice: 67925,
    timestamp: Date.now() - 300000
  },
  {
    id: 2,
    stockName: '한화에어로스페이스',
    stockCode: '012450',
    presetId: 'twoThird',
    message: '최고점 대비 1/3 하락 근접',
    currentPrice: 365000,
    targetPrice: 369600,
    timestamp: Date.now() - 1800000
  }
]

// ============================================
// 메인 컴포넌트
// ============================================
export default function SellSignalPage() {
  const { isMobile, isTablet } = useResponsive()
  
  // State
  const [user, setUser] = useState({ membership: 'free', email: 'demo@test.com' })
  const [positions, setPositions] = useState<Position[]>(INITIAL_POSITIONS)
  const [priceDataMap, setPriceDataMap] = useState<Record<number, PriceData[]>>({})
  const [alerts, setAlerts] = useState<Alert[]>(INITIAL_ALERTS)
  
  // Modal States
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingPosition, setEditingPosition] = useState<Position | null>(null)
  const [showUpgradePopup, setShowUpgradePopup] = useState(false)
  
  // AI Popup States
  const [aiNewsPosition, setAiNewsPosition] = useState<Position | null>(null)
  const [aiReportPosition, setAiReportPosition] = useState<Position | null>(null)
  
  // Mobile Tab State
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

  // 실시간 가격 업데이트 (3초마다)
  useEffect(() => {
    const interval = setInterval(() => {
      setPriceDataMap(prev => {
        const updated = { ...prev }
        Object.keys(updated).forEach(id => {
          const numId = Number(id)
          const data = [...updated[numId]]
          if (data.length > 0) {
            const last = data[data.length - 1]
            const change = (Math.random() - 0.48) * last.close * 0.008
            const newClose = Math.max(last.close + change, last.close * 0.95)
            data[data.length - 1] = { 
              ...last, 
              close: newClose, 
              high: Math.max(last.high, newClose), 
              low: Math.min(last.low, newClose) 
            }
            updated[numId] = data
          }
        })
        return updated
      })
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  // 총계 계산
  const totalCost = positions.reduce((sum, p) => sum + p.buyPrice * p.quantity, 0)
  const totalValue = positions.reduce((sum, p) => { 
    const price = priceDataMap[p.id]?.[priceDataMap[p.id]?.length - 1]?.close || p.buyPrice
    return sum + price * p.quantity
  }, 0)
  const totalProfit = totalValue - totalCost
  const totalProfitRate = totalCost > 0 ? (totalProfit / totalCost) * 100 : 0

  // 포지션 저장
  const handleSavePosition = (position: Position) => {
    if (editingPosition) {
      setPositions(prev => prev.map(p => p.id === position.id ? position : p))
      setEditingPosition(null)
    } else {
      setPositions(prev => [...prev, { ...position, id: Date.now() }])
      setShowAddModal(false)
    }
  }

  // 포지션 삭제
  const handleDeletePosition = (id: number) => {
    setPositions(prev => prev.filter(p => p.id !== id))
    setPriceDataMap(prev => { 
      const updated = { ...prev }
      delete updated[id]
      return updated
    })
  }

  // 알림 제거
  const handleDismissAlert = (id: number) => {
    setAlerts(prev => prev.filter(a => a.id !== id))
  }

  // 프리미엄 업그레이드
  const handleUpgrade = () => {
    setUser({ ...user, membership: 'premium' })
    setShowUpgradePopup(false)
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(180deg, #0a0a0f 0%, #0f172a 50%, #0a0a0f 100%)', 
      color: '#fff', 
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      paddingBottom: isMobile ? '70px' : '0',
    }}>
      {/* 헤더 */}
      <Header 
        alerts={alerts}
        isPremium={isPremium}
        onShowUpgrade={() => setShowUpgradePopup(true)}
        onShowAddModal={() => setShowAddModal(true)}
        isMobile={isMobile}
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
          isMobile={isMobile}
          isTablet={isTablet}
        />

        {/* 모바일 탭 네비게이션 */}
        {isMobile && (
          <MobileTabNav 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
            alertCount={alerts.length}
            positionCount={positions.length}
          />
        )}

        {/* 메인 레이아웃 */}
        <div style={getMainLayoutStyle(isMobile, isTablet, isPremium)}>
          {/* 광고 영역 (데스크톱, 무료회원) */}
          {!isMobile && !isTablet && !isPremium && (
            <AdSection onShowUpgrade={() => setShowUpgradePopup(true)} />
          )}

          {/* 포지션 목록 */}
          <div style={{ 
            display: isMobile && activeTab !== 'positions' ? 'none' : 'block',
            padding: isMobile ? '0 16px' : '0',
          }}>
            {/* 모바일: 시장 분석 미니 요약 */}
            {isMobile && activeTab === 'positions' && (
              <MarketMiniSummary onClick={() => setActiveTab('market')} />
            )}
            
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
                isPremium={isPremium}
                isMobile={isMobile}
                isTablet={isTablet}
                onEdit={() => setEditingPosition(pos)}
                onDelete={() => handleDeletePosition(pos.id)}
                onShowAINews={() => setAiNewsPosition(pos)}
                onShowAIReport={() => setAiReportPosition(pos)}
                onUpgrade={() => setShowUpgradePopup(true)}
              />
            ))}
          </div>

          {/* 우측 사이드바 / 모바일 탭 콘텐츠 */}
          {(!isMobile || activeTab === 'market' || activeTab === 'alerts' || activeTab === 'guide') && (
            <div style={{ 
              display: 'block',
              padding: isMobile ? '0 16px' : '0',
            }}>
              {/* 시장 분석 */}
              <div style={{ display: isMobile && activeTab !== 'market' ? 'none' : 'block', marginBottom: '12px' }}>
                <MarketCycleWidget isPremium={isPremium} />
              </div>
              
              {/* 알림 영역 */}
              <AlertSection 
                alerts={alerts}
                onDismiss={handleDismissAlert}
                onClearAll={() => setAlerts([])}
                isMobile={isMobile}
                activeTab={activeTab}
              />
              
              {/* 매도법 가이드 */}
              <SellMethodGuide isMobile={isMobile} activeTab={activeTab} />
              
              {/* 면책조항 */}
              {(!isMobile || activeTab === 'guide') && <Disclaimer isMobile={isMobile} />}
            </div>
          )}
        </div>
      </main>

      {/* 모바일 하단 네비게이션 */}
      {isMobile && (
        <MobileBottomNav 
          activeTab={activeTab} 
          setActiveTab={setActiveTab}
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
        <UpgradeModal 
          onUpgrade={handleUpgrade}
          onClose={() => setShowUpgradePopup(false)}
        />
      )}
      
      {/* AI 팝업 */}
      {aiNewsPosition && (
        <AINewsPopup 
          position={aiNewsPosition}
          isPremium={isPremium}
          onClose={() => setAiNewsPosition(null)}
          onUpgrade={() => { setAiNewsPosition(null); setShowUpgradePopup(true); }}
        />
      )}
      {aiReportPosition && (
        <AIReportPopup 
          position={aiReportPosition}
          isPremium={isPremium}
          onClose={() => setAiReportPosition(null)}
          onUpgrade={() => { setAiReportPosition(null); setShowUpgradePopup(true); }}
        />
      )}
    </div>
  )
}

// ============================================
// 서브 컴포넌트들
// ============================================

// 헤더
function Header({ alerts, isPremium, onShowUpgrade, onShowAddModal, isMobile }: {
  alerts: Alert[]
  isPremium: boolean
  onShowUpgrade: () => void
  onShowAddModal: () => void
  isMobile: boolean
}) {
  const [showMobileMenu, setShowMobileMenu] = useState(false)

  if (isMobile) {
    return (
      <header style={{ 
        background: 'rgba(15, 23, 42, 0.98)', 
        borderBottom: '1px solid rgba(255,255,255,0.08)', 
        position: 'sticky', 
        top: 0, 
        zIndex: 100,
        backdropFilter: 'blur(10px)',
      }}>
        <div style={{ 
          padding: '12px 16px', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ 
              width: '40px', height: '40px', 
              background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)', 
              borderRadius: '12px', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', 
              fontSize: '20px' 
            }}>📈</div>
            <div>
              <h1 style={{ fontSize: '16px', fontWeight: '700', margin: 0 }}>매도의 기술</h1>
              <p style={{ fontSize: '11px', color: '#64748b', margin: 0 }}>
                {isPremium ? '👑 프리미엄' : '무료회원'}
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {alerts.length > 0 && (
              <div style={{ 
                position: 'relative', width: '36px', height: '36px',
                background: 'rgba(239,68,68,0.15)', borderRadius: '10px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ fontSize: '18px' }}>🔔</span>
                <span style={{ 
                  position: 'absolute', top: '-4px', right: '-4px',
                  background: '#ef4444', color: '#fff', fontSize: '10px', fontWeight: '700',
                  padding: '2px 6px', borderRadius: '8px', minWidth: '18px', textAlign: 'center',
                }}>{alerts.length}</span>
              </div>
            )}
            <button 
              onClick={onShowAddModal}
              style={{ 
                width: '36px', height: '36px',
                background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', 
                border: 'none', borderRadius: '10px', 
                color: '#fff', fontSize: '20px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >+</button>
          </div>
        </div>
      </header>
    )
  }

  return (
    <header style={{ 
      background: 'rgba(15, 23, 42, 0.95)', 
      borderBottom: '1px solid rgba(255,255,255,0.05)', 
      position: 'sticky', 
      top: 0, 
      zIndex: 100 
    }}>
      <div style={{ 
        maxWidth: '1600px', margin: '0 auto', padding: '16px 24px', 
        display: 'flex', justifyContent: 'space-between', alignItems: 'center' 
      }}>
        <div style={{ minWidth: '200px' }}>
          {alerts.length > 0 && (
            <div style={{ 
              display: 'flex', alignItems: 'center', gap: '8px', 
              padding: '10px 16px', background: 'rgba(239,68,68,0.2)', 
              borderRadius: '10px', animation: 'pulse 2s infinite' 
            }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444' }} />
              <span style={{ fontSize: '14px', fontWeight: '600', color: '#ef4444' }}>{alerts.length}개 알림</span>
            </div>
          )}
        </div>
        
        <div style={{ 
          display: 'flex', alignItems: 'center', gap: '16px', 
          position: 'absolute', left: '50%', transform: 'translateX(-50%)' 
        }}>
          <div style={{ 
            width: '52px', height: '52px', 
            background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)', 
            borderRadius: '16px', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', 
            fontSize: '28px' 
          }}>📈</div>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: '700', margin: 0 }}>매도의 기술</h1>
            <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
              {isPremium ? '👑 프리미엄' : '무료회원'} · 조건 알람 도구
            </p>
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: '200px', justifyContent: 'flex-end' }}>
          {!isPremium && (
            <button 
              onClick={onShowUpgrade} 
              style={{ 
                padding: '12px 18px', 
                background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)', 
                border: 'none', borderRadius: '10px', 
                color: '#fff', fontSize: '14px', fontWeight: '600', cursor: 'pointer' 
              }}
            >👑 업그레이드</button>
          )}
          <button 
            onClick={onShowAddModal} 
            style={{ 
              padding: '12px 20px', 
              background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', 
              border: 'none', borderRadius: '10px', 
              color: '#fff', fontSize: '14px', fontWeight: '600', cursor: 'pointer' 
            }}
          >+ 종목 추가</button>
        </div>
      </div>
    </header>
  )
}

// 요약 카드
function SummaryCards({ totalCost, totalValue, totalProfit, totalProfitRate, isMobile, isTablet }: {
  totalCost: number
  totalValue: number
  totalProfit: number
  totalProfitRate: number
  isMobile: boolean
  isTablet: boolean
}) {
  const cards = [
    { label: '총 매수금액', value: '₩' + Math.round(totalCost).toLocaleString(), icon: '💵' },
    { label: '총 평가금액', value: '₩' + Math.round(totalValue).toLocaleString(), icon: '💰' },
    { label: '총 평가손익', value: (totalProfit >= 0 ? '+' : '') + '₩' + Math.round(totalProfit).toLocaleString(), color: totalProfit >= 0 ? '#10b981' : '#ef4444', icon: '📈' },
    { label: '총 수익률', value: (totalProfitRate >= 0 ? '+' : '') + totalProfitRate.toFixed(2) + '%', color: totalProfitRate >= 0 ? '#10b981' : '#ef4444', icon: '🎯' },
  ]

  return (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', 
      gap: isMobile ? '10px' : '14px', 
      marginBottom: isMobile ? '16px' : '20px',
      padding: isMobile ? '0 16px' : '0',
    }}>
      {cards.map((card, i) => (
        <div key={i} style={{ 
          background: 'linear-gradient(145deg, #1e293b 0%, #0f172a 100%)', 
          borderRadius: isMobile ? '10px' : '12px', 
          padding: isMobile ? '12px' : '16px', 
          border: '1px solid rgba(255,255,255,0.08)' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '4px' : '6px', marginBottom: isMobile ? '4px' : '6px' }}>
            <span style={{ fontSize: isMobile ? '14px' : '16px' }}>{card.icon}</span>
            <span style={{ fontSize: isMobile ? '10px' : '12px', color: '#64748b' }}>{card.label}</span>
          </div>
          <div style={{ 
            fontSize: isMobile ? '16px' : '22px', 
            fontWeight: '700', 
            color: card.color || '#fff',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>{card.value}</div>
        </div>
      ))}
    </div>
  )
}

// 모바일 탭 네비게이션
function MobileTabNav({ activeTab, setActiveTab, alertCount, positionCount }: {
  activeTab: string
  setActiveTab: (tab: string) => void
  alertCount: number
  positionCount: number
}) {
  return (
    <div style={{ 
      display: 'flex', gap: '8px', padding: '0 16px', marginBottom: '16px',
      overflowX: 'auto',
    }}>
      {[
        { id: 'positions', label: '📊 포지션', count: positionCount },
        { id: 'alerts', label: '🔔 알림', count: alertCount },
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
  )
}

// 모바일 하단 네비게이션
function MobileBottomNav({ activeTab, setActiveTab, alertCount }: {
  activeTab: string
  setActiveTab: (tab: string) => void
  alertCount: number
}) {
  return (
    <nav style={{
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
    }}>
      {[
        { id: 'positions', icon: '📊', label: '포지션' },
        { id: 'alerts', icon: '🔔', label: '알림', badge: alertCount },
        { id: 'market', icon: '🥚', label: '시장' },
        { id: 'guide', icon: '📚', label: '가이드' },
      ].map(item => (
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
          <span style={{ 
            fontSize: '10px', 
            color: activeTab === item.id ? '#60a5fa' : '#64748b',
            fontWeight: activeTab === item.id ? '600' : '400',
          }}>{item.label}</span>
          {item.badge !== undefined && item.badge > 0 && (
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
  )
}

// 메인 레이아웃 스타일
function getMainLayoutStyle(isMobile: boolean, isTablet: boolean, isPremium: boolean) {
  if (isMobile) {
    return { display: 'flex', flexDirection: 'column' as const, gap: '16px', padding: '0' }
  }
  if (isTablet) {
    return { display: 'grid', gridTemplateColumns: '1fr 320px', gap: '16px', padding: '0 20px' }
  }
  return { 
    display: 'grid', 
    gridTemplateColumns: isPremium ? '1fr 380px' : '140px 1fr 380px', 
    gap: '20px' 
  }
}

// 광고 섹션
function AdSection({ onShowUpgrade }: { onShowUpgrade: () => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {[1, 2].map(i => (
        <div key={i} style={{ 
          background: 'linear-gradient(180deg, #1f2937 0%, #111827 100%)', 
          borderRadius: '12px', padding: '16px', 
          border: '1px solid rgba(255,255,255,0.05)', 
          textAlign: 'center', flex: 1, minHeight: '180px', 
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' 
        }}>
          <div style={{ fontSize: '11px', color: '#4b5563', marginBottom: '8px' }}>광고</div>
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>📢</div>
          <div style={{ fontSize: '11px', color: '#374151' }}>Google AdMob</div>
        </div>
      ))}
      <div 
        onClick={onShowUpgrade} 
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
  )
}

// 시장 미니 요약 (모바일)
function MarketMiniSummary({ onClick }: { onClick: () => void }) {
  return (
    <div 
      onClick={onClick}
      style={{ 
        background: 'linear-gradient(135deg, rgba(239,68,68,0.15) 0%, rgba(249,115,22,0.1) 100%)',
        border: '1px solid rgba(239,68,68,0.3)',
        borderRadius: '10px', padding: '12px', marginBottom: '14px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        cursor: 'pointer'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ fontSize: '24px' }}>🥚</span>
        <div>
          <div style={{ fontSize: '13px', fontWeight: '600', color: '#ef4444' }}>4단계: 금리고점 (팔 때)</div>
          <div style={{ fontSize: '11px', color: '#94a3b8' }}>매도 관망 권장 · 탭하여 상세보기</div>
        </div>
      </div>
      <span style={{ color: '#64748b', fontSize: '18px' }}>›</span>
    </div>
  )
}

// 포지션 카드
function PositionCard({ position, priceData, isPremium, isMobile, isTablet, onEdit, onDelete, onShowAINews, onShowAIReport, onUpgrade }: {
  position: Position
  priceData?: PriceData[]
  isPremium: boolean
  isMobile: boolean
  isTablet: boolean
  onEdit: () => void
  onDelete: () => void
  onShowAINews: () => void
  onShowAIReport: () => void
  onUpgrade: () => void
}) {
  const [showChart, setShowChart] = useState(!isMobile)
  const [visibleLines, setVisibleLines] = useState({ candle3: true, stopLoss: true, twoThird: true, maSignal: true })
  
  const currentPrice = priceData?.[priceData.length - 1]?.close || position.buyPrice
  const profitRate = ((currentPrice - position.buyPrice) / position.buyPrice) * 100
  const profitAmount = (currentPrice - position.buyPrice) * position.quantity
  const totalValue = currentPrice * position.quantity
  const isProfit = profitRate >= 0
  
  const sellPrices = calculateSellPrices(
    { buyPrice: position.buyPrice, highestPrice: position.highestPrice, presetSettings: position.presetSettings },
    priceData || [],
    position.presetSettings
  )
  
  const getStage = () => {
    if (profitRate < 0) return { ...PROFIT_STAGES.initial, label: '손실 구간', color: '#ef4444' }
    if (profitRate < 5) return PROFIT_STAGES.initial
    if (profitRate < 10) return PROFIT_STAGES.profit5
    return PROFIT_STAGES.profit10
  }
  const stage = getStage()

  const naverStockUrl = 'https://finance.naver.com/item/main.naver?code=' + position.code
  const naverChartUrl = 'https://finance.naver.com/item/fchart.naver?code=' + position.code
  const naverNewsUrl = 'https://finance.naver.com/item/news.naver?code=' + position.code

  const chartSize = isMobile 
    ? { width: Math.min(320, typeof window !== 'undefined' ? window.innerWidth - 48 : 320), height: 200 }
    : isTablet ? { width: 240, height: 240 } : { width: 270, height: 280 }

  return (
    <div style={{ 
      background: 'linear-gradient(145deg, #1e293b 0%, #0f172a 100%)', 
      borderRadius: isMobile ? '12px' : '14px', 
      padding: isMobile ? '12px' : '16px', 
      marginBottom: isMobile ? '12px' : '14px', 
      border: '1px solid rgba(255,255,255,0.08)' 
    }}>
      {/* 헤더 */}
      <div style={{ 
        display: 'flex', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', 
        marginBottom: '12px', flexWrap: isMobile ? 'wrap' : 'nowrap', gap: isMobile ? '8px' : '0'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', flex: isMobile ? '1 1 100%' : 'initial' }}>
          <a href={naverStockUrl} target="_blank" rel="noopener noreferrer" style={{ 
            fontSize: isMobile ? '16px' : '18px', fontWeight: '700', color: '#fff', textDecoration: 'none' 
          }}>
            {position.name} ↗
          </a>
          <span style={{ 
            background: 'rgba(59,130,246,0.2)', color: '#60a5fa', 
            padding: isMobile ? '3px 8px' : '4px 10px', borderRadius: '5px', 
            fontSize: isMobile ? '11px' : '13px', fontWeight: '600' 
          }}>{position.code}</span>
          <span style={{ 
            background: stage.color + '20', color: stage.color, 
            padding: isMobile ? '3px 8px' : '4px 10px', borderRadius: '5px', 
            fontSize: isMobile ? '11px' : '13px', fontWeight: '600' 
          }}>{stage.label}</span>
        </div>
        <div style={{ display: 'flex', gap: '6px', marginLeft: isMobile ? 'auto' : '0' }}>
          <button onClick={onEdit} style={{ 
            background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '6px', 
            padding: isMobile ? '8px 12px' : '8px 14px', color: '#94a3b8', 
            fontSize: isMobile ? '12px' : '13px', cursor: 'pointer', minHeight: '36px'
          }}>수정</button>
          <button onClick={onDelete} style={{ 
            background: 'rgba(239,68,68,0.15)', border: 'none', borderRadius: '6px', 
            padding: isMobile ? '8px 12px' : '8px 14px', color: '#ef4444', 
            fontSize: isMobile ? '12px' : '13px', cursor: 'pointer', minHeight: '36px'
          }}>삭제</button>
        </div>
      </div>
      
      {/* 메인 콘텐츠 */}
      <div style={{ 
        display: isMobile ? 'flex' : 'grid', 
        flexDirection: isMobile ? 'column' : undefined,
        gridTemplateColumns: isMobile ? undefined : isTablet ? '1fr 250px' : '1fr 280px', 
        gap: '12px', alignItems: 'stretch' 
      }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {/* 가격 정보 */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: '6px', marginBottom: '10px' }}>
            {[
              { label: '매수가', value: '₩' + position.buyPrice.toLocaleString() },
              { label: '현재가', value: '₩' + Math.round(currentPrice).toLocaleString(), color: isProfit ? '#10b981' : '#ef4444' },
              { label: '수량', value: position.quantity + '주' },
              { label: '평가금액', value: '₩' + Math.round(totalValue).toLocaleString() }
            ].map((item, i) => (
              <div key={i} style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '6px', padding: isMobile ? '10px 8px' : '8px' }}>
                <div style={{ fontSize: isMobile ? '10px' : '11px', color: '#64748b', marginBottom: '2px' }}>{item.label}</div>
                <div style={{ fontSize: isMobile ? '14px' : '16px', fontWeight: '700', color: item.color || '#e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.value}</div>
              </div>
            ))}
          </div>
          
          {/* 평가손익 */}
          <div style={{ 
            background: isProfit ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', 
            borderRadius: '8px', padding: isMobile ? '12px' : '10px', 
            borderLeft: '4px solid ' + (isProfit ? '#10b981' : '#ef4444'), 
            marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' 
          }}>
            <div>
              <div style={{ fontSize: isMobile ? '10px' : '11px', color: '#64748b', marginBottom: '2px' }}>평가손익</div>
              <div style={{ fontSize: isMobile ? '18px' : '20px', fontWeight: '700', color: isProfit ? '#10b981' : '#ef4444' }}>
                {isProfit ? '+' : ''}₩{Math.round(profitAmount).toLocaleString()}
              </div>
            </div>
            <div style={{ 
              fontSize: isMobile ? '20px' : '24px', fontWeight: '800', 
              color: isProfit ? '#10b981' : '#ef4444', 
              background: isProfit ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)', 
              padding: isMobile ? '6px 10px' : '6px 12px', borderRadius: '8px' 
            }}>
              {isProfit ? '+' : ''}{profitRate.toFixed(2)}%
            </div>
          </div>
          
          {/* 매도 조건 */}
          <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '8px', padding: isMobile ? '10px' : '10px', marginBottom: '8px', flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontSize: isMobile ? '13px' : '14px', color: '#fff', fontWeight: '600' }}>📊 매도 조건별 기준가격</span>
              <button onClick={onEdit} style={{ 
                background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)', 
                borderRadius: '4px', padding: isMobile ? '6px 10px' : '4px 10px', 
                color: '#60a5fa', fontSize: isMobile ? '11px' : '12px', cursor: 'pointer', minHeight: '32px'
              }}>✏️ 조건 변경</button>
            </div>
            <div style={{ fontSize: '10px', color: '#f59e0b', marginBottom: '6px', background: 'rgba(245,158,11,0.1)', padding: '5px 8px', borderRadius: '4px' }}>
              ⚠️ 수치는 예시입니다. 본인의 투자 원칙에 따라 수정하세요.
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {(position.selectedPresets || []).slice(0, isMobile ? 3 : undefined).map(presetId => {
                const preset = SELL_PRESETS[presetId as keyof typeof SELL_PRESETS]
                if (!preset) return null
                
                let priceText = '-', priceColor = '#94a3b8'
                
                if (presetId === 'stopLoss' && sellPrices.stopLoss) { 
                  priceText = '₩' + sellPrices.stopLoss.toLocaleString()
                  priceColor = currentPrice <= sellPrices.stopLoss ? '#ef4444' : '#94a3b8'
                }
                else if (presetId === 'twoThird' && sellPrices.twoThird) { 
                  priceText = '₩' + sellPrices.twoThird.toLocaleString()
                  priceColor = currentPrice <= sellPrices.twoThird ? '#f59e0b' : '#94a3b8'
                }
                else if (presetId === 'maSignal' && sellPrices.maSignal) { 
                  priceText = '₩' + sellPrices.maSignal.toLocaleString()
                  priceColor = currentPrice < sellPrices.maSignal ? '#f59e0b' : '#94a3b8'
                }
                else if (presetId === 'candle3' && sellPrices.candle3_50) { 
                  priceText = '₩' + sellPrices.candle3_50.toLocaleString()
                }
                
                return (
                  <div key={presetId} style={{ 
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
                    padding: isMobile ? '10px' : '8px 10px', 
                    background: 'rgba(255,255,255,0.03)', borderRadius: '6px', 
                    borderLeft: '3px solid ' + preset.color 
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: isMobile ? '12px' : '14px', color: '#e2e8f0' }}>
                        {preset.icon} {isMobile ? preset.name.replace(' 매도법', '') : preset.name}
                      </span>
                    </div>
                    <span style={{ fontSize: isMobile ? '13px' : '15px', fontWeight: '700', color: priceColor }}>{priceText}</span>
                  </div>
                )
              })}
            </div>
          </div>
          
          {/* 실적/뉴스 버튼 */}
          <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '8px', padding: isMobile ? '8px' : '10px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
              <a href={naverNewsUrl} target="_blank" rel="noopener noreferrer" style={{ 
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', 
                background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)', 
                borderRadius: '6px', color: '#60a5fa', fontSize: isMobile ? '11px' : '12px', 
                fontWeight: '600', textDecoration: 'none', padding: isMobile ? '10px 6px' : '8px', minHeight: '44px',
              }}>📰 뉴스</a>
              <button onClick={onShowAINews} style={{ 
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2px', 
                background: isPremium ? 'linear-gradient(135deg, rgba(139,92,246,0.2) 0%, rgba(59,130,246,0.2) 100%)' : 'rgba(100,116,139,0.1)', 
                border: isPremium ? '1px solid rgba(139,92,246,0.4)' : '1px solid rgba(100,116,139,0.3)', 
                borderRadius: '6px', color: isPremium ? '#a78bfa' : '#64748b', 
                fontSize: isMobile ? '10px' : '11px', fontWeight: '600', 
                padding: isMobile ? '10px 4px' : '8px', cursor: 'pointer', minHeight: '44px',
              }}>🤖 AI뉴스{!isPremium && <span style={{ fontSize: '9px' }}>👑</span>}</button>
              <button onClick={onShowAIReport} style={{ 
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2px', 
                background: isPremium ? 'linear-gradient(135deg, rgba(16,185,129,0.2) 0%, rgba(6,182,212,0.2) 100%)' : 'rgba(100,116,139,0.1)', 
                border: isPremium ? '1px solid rgba(16,185,129,0.4)' : '1px solid rgba(100,116,139,0.3)', 
                borderRadius: '6px', color: isPremium ? '#34d399' : '#64748b', 
                fontSize: isMobile ? '10px' : '11px', fontWeight: '600', 
                padding: isMobile ? '10px 4px' : '8px', cursor: 'pointer', minHeight: '44px',
              }}>📑 리포트{!isPremium && <span style={{ fontSize: '9px' }}>👑</span>}</button>
            </div>
          </div>
        </div>
        
        {/* 차트 영역 */}
        {isMobile ? (
          <div>
            <button
              onClick={() => setShowChart(!showChart)}
              style={{
                width: '100%', padding: '10px',
                background: 'rgba(59,130,246,0.1)',
                border: '1px solid rgba(59,130,246,0.3)',
                borderRadius: '8px', color: '#60a5fa',
                fontSize: '13px', fontWeight: '600', cursor: 'pointer',
                marginBottom: showChart ? '10px' : '0',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
              }}
            >
              📊 차트 {showChart ? '접기 ▲' : '보기 ▼'}
            </button>
            {showChart && priceData && (
              <div onClick={() => window.open(naverChartUrl, '_blank')} style={{ cursor: 'pointer' }}>
                <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '8px', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CandleChart 
                    data={priceData.slice(-30)} 
                    width={chartSize.width} 
                    height={chartSize.height} 
                    buyPrice={position.buyPrice} 
                    sellPrices={sellPrices} 
                    visibleLines={visibleLines} 
                  />
                </div>
                <div style={{ textAlign: 'center', marginTop: '4px', fontSize: '11px', color: '#64748b' }}>탭하여 네이버 차트 열기</div>
              </div>
            )}
          </div>
        ) : priceData && (
          <div onClick={() => window.open(naverChartUrl, '_blank')} style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column' }}>
            <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '8px', padding: '4px', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CandleChart 
                data={priceData.slice(-40)} 
                width={chartSize.width} 
                height={chartSize.height} 
                buyPrice={position.buyPrice} 
                sellPrices={sellPrices} 
                visibleLines={visibleLines} 
              />
            </div>
            <div style={{ textAlign: 'center', marginTop: '4px', fontSize: '12px', color: '#64748b' }}>클릭 → 네이버 증권 차트</div>
          </div>
        )}
      </div>
    </div>
  )
}

// 알림 섹션
function AlertSection({ alerts, onDismiss, onClearAll, isMobile, activeTab }: {
  alerts: Alert[]
  onDismiss: (id: number) => void
  onClearAll: () => void
  isMobile: boolean
  activeTab: string
}) {
  return (
    <div style={{ 
      display: isMobile && activeTab !== 'alerts' ? 'none' : 'block',
      background: 'linear-gradient(145deg, #1e293b 0%, #0f172a 100%)', 
      borderRadius: '14px', padding: isMobile ? '14px' : '16px', 
      border: '1px solid rgba(255,255,255,0.08)', 
      marginBottom: '12px', maxHeight: isMobile ? 'none' : '300px', overflow: 'auto' 
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <h2 style={{ 
          fontSize: isMobile ? '15px' : '16px', fontWeight: '600', color: '#fff', margin: 0, 
          display: 'flex', alignItems: 'center', gap: '8px' 
        }}>
          🔔 조건 도달 알림
          {alerts.length > 0 && (
            <span style={{ background: '#ef4444', color: '#fff', padding: '2px 10px', borderRadius: '10px', fontSize: '12px', fontWeight: '700' }}>{alerts.length}</span>
          )}
        </h2>
        {alerts.length > 0 && (
          <button onClick={onClearAll} style={{ 
            background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '6px', 
            padding: '6px 10px', color: '#94a3b8', fontSize: '12px', cursor: 'pointer' 
          }}>모두 지우기</button>
        )}
      </div>
      {alerts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: isMobile ? '20px 16px' : '30px 16px' }}>
          <div style={{ fontSize: '32px', marginBottom: '10px' }}>✨</div>
          <div style={{ fontSize: '14px', color: '#94a3b8' }}>현재 도달한 조건이 없습니다</div>
        </div>
      ) : (
        alerts.slice(0, 5).map(alert => (
          <AlertCard key={alert.id} alert={alert} onDismiss={onDismiss} />
        ))
      )}
    </div>
  )
}

// 매도법 가이드
function SellMethodGuide({ isMobile, activeTab }: { isMobile: boolean, activeTab: string }) {
  const [expandedStage, setExpandedStage] = useState<string | null>(null)
  
  const methodDescriptions: Record<string, string> = {
    candle3: '최근 양봉의 50% 이상을 덮는 음봉 발생시 절반 매도, 100% 덮으면 전량 매도',
    stopLoss: '매수가 대비 설정한 손실률 (-3~-5%)에 도달하면 기계적으로 손절',
    twoThird: '최고 수익 대비 1/3이 빠지면 남은 2/3 수익이라도 확보하여 익절',
    maSignal: '이동평균선을 하향 돌파하거나, 이평선이 저항선으로 작용할 때 매도',
    volumeZone: '상단 매물대(저항대)에서 주가가 하락 반전할 때 매도',
    trendline: '지지선을 깨고 하락하거나, 저항선 돌파 실패 시 매도',
    fundamental: '실적 악화, 업황 반전 등 기업 펀더멘털에 변화가 생길 때',
    cycle: '금리 고점 근처(4-5단계)에서 시장 전체 매도 관점 유지'
  }
  
  return (
    <div style={{ 
      display: isMobile && activeTab !== 'guide' ? 'none' : 'block',
      background: 'linear-gradient(145deg, #1e293b 0%, #0f172a 100%)', 
      borderRadius: '14px', padding: isMobile ? '14px' : '16px', 
      border: '1px solid rgba(255,255,255,0.08)', marginBottom: '12px' 
    }}>
      <h3 style={{ fontSize: isMobile ? '14px' : '15px', fontWeight: '600', color: '#fff', margin: '0 0 12px' }}>
        📚 수익 단계별 매도법
      </h3>
      
      {Object.entries(PROFIT_STAGES).map(([key, stage]) => (
        <div key={key} style={{ marginBottom: '8px' }}>
          <div 
            onClick={() => setExpandedStage(expandedStage === key ? null : key)}
            style={{ 
              padding: isMobile ? '12px' : '14px', 
              background: stage.color + '10', 
              borderRadius: expandedStage === key ? '10px 10px 0 0' : '10px', 
              borderLeft: '4px solid ' + stage.color,
              cursor: 'pointer',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}
          >
            <div>
              <div style={{ fontSize: isMobile ? '13px' : '14px', fontWeight: '600', color: stage.color }}>{stage.label}</div>
              <div style={{ fontSize: isMobile ? '11px' : '12px', color: '#94a3b8', marginTop: '2px' }}>
                수익률 {stage.range} · {stage.methods.length}개 매도법
              </div>
            </div>
            <span style={{ color: '#64748b', fontSize: '14px', transform: expandedStage === key ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>▼</span>
          </div>
          
          {expandedStage === key && (
            <div style={{ 
              padding: isMobile ? '12px' : '14px', 
              background: 'rgba(0,0,0,0.2)', 
              borderRadius: '0 0 10px 10px',
              borderLeft: '4px solid ' + stage.color + '50'
            }}>
              {stage.methods.map(methodId => { 
                const method = SELL_PRESETS[methodId as keyof typeof SELL_PRESETS]
                if (!method) return null
                return (
                  <div key={methodId} style={{ marginBottom: '10px', paddingBottom: '10px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ fontSize: '16px' }}>{method.icon}</span>
                      <span style={{ fontSize: isMobile ? '12px' : '13px', fontWeight: '600', color: '#fff' }}>{method.name}</span>
                    </div>
                    <p style={{ fontSize: isMobile ? '11px' : '12px', color: '#94a3b8', margin: 0, lineHeight: '1.5', paddingLeft: '24px' }}>
                      {methodDescriptions[methodId] || method.description}
                    </p>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// 면책조항
function Disclaimer({ isMobile }: { isMobile: boolean }) {
  return (
    <div style={{ 
      padding: isMobile ? '12px' : '14px', 
      background: 'rgba(255,255,255,0.02)', 
      borderRadius: '12px', 
      borderLeft: '4px solid #64748b' 
    }}>
      <p style={{ fontSize: isMobile ? '11px' : '12px', color: '#64748b', margin: 0, lineHeight: '1.6' }}>
        ⚠️ 본 앱은 사용자가 선택한 조건을 모니터링하는 유틸리티 도구입니다. 제공되는 알람은 투자자문이나 투자권유가 아니며, 모든 투자 판단의 책임은 사용자에게 있습니다.
      </p>
    </div>
  )
}
