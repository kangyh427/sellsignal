'use client'

import { useState, useEffect } from 'react'
import { useResponsive } from '@/hooks'
import { 
  SELL_PRESETS, 
  PROFIT_STAGES, 
  STOCK_LIST, 
  EARNINGS_DATA,
  generateMockPriceData,
  calculateSellPrices,
  calculateDDay
} from '@/lib/constants'
import type { Position, Alert, PriceData } from '@/types'
import CandleChart from '@/components/CandleChart'
import StockModal from '@/components/StockModal'
import AlertCard from '@/components/AlertCard'
import { AINewsPopup, AIReportPopup } from '@/components/AIPopups'
import MarketCycleWidget from '@/components/MarketCycleWidget'
import UpgradeModal from '@/components/UpgradeModal'

// 초기 포지션 데이터
const INITIAL_POSITIONS: Position[] = [
  { id: 1, name: '삼성전자', code: '005930', buyPrice: 71500, quantity: 100, highestPrice: 78200, selectedPresets: ['candle3', 'stopLoss', 'twoThird', 'maSignal'], presetSettings: { stopLoss: { value: -5 }, maSignal: { value: 20 } } },
  { id: 2, name: '현대차', code: '005380', buyPrice: 215000, quantity: 20, highestPrice: 228000, selectedPresets: ['candle3', 'stopLoss', 'maSignal'], presetSettings: { stopLoss: { value: -3 }, maSignal: { value: 20 } } },
  { id: 3, name: '한화에어로스페이스', code: '012450', buyPrice: 285000, quantity: 15, highestPrice: 412000, selectedPresets: ['twoThird', 'maSignal', 'volumeZone', 'fundamental'], presetSettings: { maSignal: { value: 60 } } },
]

// 초기 알림 데이터
const INITIAL_ALERTS: Alert[] = [
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

// 반응형 헤더 컴포넌트
function ResponsiveHeader({ 
  alerts, 
  isPremium, 
  onShowUpgrade, 
  onShowAddModal 
}: {
  alerts: Alert[]
  isPremium: boolean
  onShowUpgrade: () => void
  onShowAddModal: () => void
}) {
  const { isMobile, isTablet } = useResponsive()
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
              width: '40px', 
              height: '40px', 
              background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)', 
              borderRadius: '12px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              fontSize: '20px' 
            }}>📈</div>
            <div>
              <h1 style={{ fontSize: '16px', fontWeight: '700', margin: 0, color: '#fff' }}>매도의 기술</h1>
              <p style={{ fontSize: '11px', color: '#64748b', margin: 0 }}>
                {isPremium ? '👑 프리미엄' : '무료회원'}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {alerts.length > 0 && (
              <div style={{ 
                position: 'relative',
                width: '36px',
                height: '36px',
                background: 'rgba(239,68,68,0.15)',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <span style={{ fontSize: '18px' }}>🔔</span>
                <span style={{ 
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  background: '#ef4444',
                  color: '#fff',
                  fontSize: '10px',
                  fontWeight: '700',
                  padding: '2px 6px',
                  borderRadius: '8px',
                  minWidth: '18px',
                  textAlign: 'center',
                }}>{alerts.length}</span>
              </div>
            )}

            <button 
              onClick={onShowAddModal}
              style={{ 
                width: '36px',
                height: '36px',
                background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', 
                border: 'none', 
                borderRadius: '10px', 
                color: '#fff', 
                fontSize: '20px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >+</button>

            <button 
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              style={{ 
                width: '36px',
                height: '36px',
                background: 'rgba(255,255,255,0.1)', 
                border: 'none', 
                borderRadius: '10px', 
                color: '#fff', 
                fontSize: '18px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >☰</button>
          </div>
        </div>

        {showMobileMenu && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            background: 'rgba(15, 23, 42, 0.98)',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            padding: '12px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            backdropFilter: 'blur(10px)',
          }}>
            {!isPremium && (
              <button 
                onClick={() => { onShowUpgrade(); setShowMobileMenu(false); }}
                style={{ 
                  padding: '12px 16px', 
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)', 
                  border: 'none', 
                  borderRadius: '10px', 
                  color: '#fff', 
                  fontSize: '14px', 
                  fontWeight: '600', 
                  cursor: 'pointer',
                  textAlign: 'center',
                }}
              >👑 프리미엄 업그레이드</button>
            )}
            <button 
              onClick={() => { onShowAddModal(); setShowMobileMenu(false); }}
              style={{ 
                padding: '12px 16px', 
                background: 'rgba(59, 130, 246, 0.15)', 
                border: '1px solid rgba(59, 130, 246, 0.3)', 
                borderRadius: '10px', 
                color: '#60a5fa', 
                fontSize: '14px', 
                fontWeight: '600', 
                cursor: 'pointer',
                textAlign: 'center',
              }}
            >+ 종목 추가</button>
          </div>
        )}
      </header>
    )
  }

  if (isTablet) {
    return (
      <header style={{ 
        background: 'rgba(15, 23, 42, 0.95)', 
        borderBottom: '1px solid rgba(255,255,255,0.05)', 
        position: 'sticky', 
        top: 0, 
        zIndex: 100 
      }}>
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto', 
          padding: '14px 20px', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ 
              width: '44px', 
              height: '44px', 
              background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)', 
              borderRadius: '14px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              fontSize: '24px' 
            }}>📈</div>
            <div>
              <h1 style={{ fontSize: '20px', fontWeight: '700', margin: 0, color: '#fff' }}>매도의 기술</h1>
              <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
                {isPremium ? '👑 프리미엄' : '무료회원'} · 조건 알람 도구
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {alerts.length > 0 && (
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '6px', 
                padding: '8px 14px', 
                background: 'rgba(239,68,68,0.2)', 
                borderRadius: '10px', 
              }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }} />
                <span style={{ fontSize: '13px', fontWeight: '600', color: '#ef4444' }}>{alerts.length}개 알림</span>
              </div>
            )}
            {!isPremium && (
              <button 
                onClick={onShowUpgrade} 
                style={{ 
                  padding: '10px 14px', 
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)', 
                  border: 'none', 
                  borderRadius: '10px', 
                  color: '#fff', 
                  fontSize: '13px', 
                  fontWeight: '600', 
                  cursor: 'pointer' 
                }}
              >👑 업그레이드</button>
            )}
            <button 
              onClick={onShowAddModal} 
              style={{ 
                padding: '10px 16px', 
                background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', 
                border: 'none', 
                borderRadius: '10px', 
                color: '#fff', 
                fontSize: '13px', 
                fontWeight: '600', 
                cursor: 'pointer' 
              }}
            >+ 종목 추가</button>
          </div>
        </div>
      </header>
    )
  }

  // 데스크톱 헤더
  return (
    <header style={{ 
      background: 'rgba(15, 23, 42, 0.95)', 
      borderBottom: '1px solid rgba(255,255,255,0.05)', 
      position: 'sticky', 
      top: 0, 
      zIndex: 100 
    }}>
      <div style={{ 
        maxWidth: '1600px', 
        margin: '0 auto', 
        padding: '16px 24px', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center' 
      }}>
        <div style={{ minWidth: '200px' }}>
          {alerts.length > 0 && (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              padding: '10px 16px', 
              background: 'rgba(239,68,68,0.2)', 
              borderRadius: '10px', 
            }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444' }} />
              <span style={{ fontSize: '14px', fontWeight: '600', color: '#ef4444' }}>{alerts.length}개 알림</span>
            </div>
          )}
        </div>
        
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '16px', 
          position: 'absolute', 
          left: '50%', 
          transform: 'translateX(-50%)' 
        }}>
          <div style={{ 
            width: '52px', 
            height: '52px', 
            background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)', 
            borderRadius: '16px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            fontSize: '28px' 
          }}>📈</div>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: '700', margin: 0, color: '#fff' }}>매도의 기술</h1>
            <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
              {isPremium ? '👑 프리미엄' : '무료회원'} · 조건 알람 도구
            </p>
          </div>
        </div>
        
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px', 
          minWidth: '200px', 
          justifyContent: 'flex-end' 
        }}>
          {!isPremium && (
            <button 
              onClick={onShowUpgrade} 
              style={{ 
                padding: '12px 18px', 
                background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)', 
                border: 'none', 
                borderRadius: '10px', 
                color: '#fff', 
                fontSize: '14px', 
                fontWeight: '600', 
                cursor: 'pointer' 
              }}
            >👑 업그레이드</button>
          )}
          <button 
            onClick={onShowAddModal} 
            style={{ 
              padding: '12px 20px', 
              background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', 
              border: 'none', 
              borderRadius: '10px', 
              color: '#fff', 
              fontSize: '14px', 
              fontWeight: '600', 
              cursor: 'pointer' 
            }}
          >+ 종목 추가</button>
        </div>
      </div>
    </header>
  )
}

// 반응형 요약 카드
function ResponsiveSummaryCards({ 
  totalCost, 
  totalValue, 
  totalProfit, 
  totalProfitRate 
}: {
  totalCost: number
  totalValue: number
  totalProfit: number
  totalProfitRate: number
}) {
  const { isMobile, isTablet } = useResponsive()

  const cards = [
    { label: '총 매수금액', value: '₩' + Math.round(totalCost).toLocaleString(), icon: '💵' },
    { label: '총 평가금액', value: '₩' + Math.round(totalValue).toLocaleString(), icon: '💰' },
    { label: '총 평가손익', value: (totalProfit >= 0 ? '+' : '') + '₩' + Math.round(totalProfit).toLocaleString(), color: totalProfit >= 0 ? '#10b981' : '#ef4444', icon: '📈' },
    { label: '총 수익률', value: (totalProfitRate >= 0 ? '+' : '') + totalProfitRate.toFixed(2) + '%', color: totalProfitRate >= 0 ? '#10b981' : '#ef4444', icon: '🎯' },
  ]

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
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '4px', 
              marginBottom: '4px' 
            }}>
              <span style={{ fontSize: '14px' }}>{card.icon}</span>
              <span style={{ fontSize: '10px', color: '#64748b' }}>{card.label}</span>
            </div>
            <div style={{ 
              fontSize: '16px', 
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

  if (isTablet) {
    return (
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(4, 1fr)', 
        gap: '12px', 
        marginBottom: '18px',
        padding: '0 20px',
      }}>
        {cards.map((card, i) => (
          <div key={i} style={{ 
            background: 'linear-gradient(145deg, #1e293b 0%, #0f172a 100%)', 
            borderRadius: '10px', 
            padding: '14px', 
            border: '1px solid rgba(255,255,255,0.08)' 
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '5px', 
              marginBottom: '5px' 
            }}>
              <span style={{ fontSize: '14px' }}>{card.icon}</span>
              <span style={{ fontSize: '11px', color: '#64748b' }}>{card.label}</span>
            </div>
            <div style={{ 
              fontSize: '18px', 
              fontWeight: '700', 
              color: card.color || '#fff' 
            }}>{card.value}</div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(4, 1fr)', 
      gap: '14px', 
      marginBottom: '20px' 
    }}>
      {cards.map((card, i) => (
        <div key={i} style={{ 
          background: 'linear-gradient(145deg, #1e293b 0%, #0f172a 100%)', 
          borderRadius: '12px', 
          padding: '16px', 
          border: '1px solid rgba(255,255,255,0.08)' 
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '6px', 
            marginBottom: '6px' 
          }}>
            <span style={{ fontSize: '16px' }}>{card.icon}</span>
            <span style={{ fontSize: '12px', color: '#64748b' }}>{card.label}</span>
          </div>
          <div style={{ 
            fontSize: '22px', 
            fontWeight: '700', 
            color: card.color || '#fff' 
          }}>{card.value}</div>
        </div>
      ))}
    </div>
  )
}

// 실적 위젯
function EarningsWidget({ 
  position, 
  isPremium, 
  onShowAINews, 
  onShowAIReport 
}: {
  position: Position
  isPremium: boolean
  onShowAINews: () => void
  onShowAIReport: () => void
}) {
  const { isMobile } = useResponsive()
  const earnings = EARNINGS_DATA[position.code as keyof typeof EARNINGS_DATA]
  const stockInfo = STOCK_LIST.find(s => s.code === position.code)
  if (!earnings || !stockInfo) return null
  
  const dDay = calculateDDay(earnings.nextEarningsDate)
  const naverNewsUrl = 'https://finance.naver.com/item/news.naver?code=' + position.code

  return (
    <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '8px', padding: isMobile ? '8px' : '10px' }}>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', 
        gap: '6px', 
        marginBottom: '8px' 
      }}>
        <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '4px', padding: '6px', textAlign: 'center' }}>
          <div style={{ fontSize: '9px', color: '#64748b', marginBottom: '2px' }}>실적발표</div>
          <div style={{ fontSize: isMobile ? '12px' : '14px', fontWeight: '700', color: dDay.startsWith('D-') && parseInt(dDay.slice(2)) <= 14 ? '#f59e0b' : '#e2e8f0' }}>{dDay}</div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '4px', padding: '6px', textAlign: 'center' }}>
          <div style={{ fontSize: '9px', color: '#64748b', marginBottom: '2px' }}>서프라이즈</div>
          <div style={{ fontSize: isMobile ? '12px' : '14px', fontWeight: '700', color: earnings.lastEarnings.surprise > 0 ? '#10b981' : '#ef4444' }}>
            {earnings.lastEarnings.surprise > 0 ? '+' : ''}{earnings.lastEarnings.surprise}%
          </div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '4px', padding: '6px', textAlign: 'center' }}>
          <div style={{ fontSize: '9px', color: '#64748b', marginBottom: '2px' }}>PER</div>
          <div style={{ fontSize: isMobile ? '12px' : '14px', fontWeight: '600', color: stockInfo.per < stockInfo.sectorPer ? '#10b981' : '#ef4444' }}>{stockInfo.per}</div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '4px', padding: '6px', textAlign: 'center' }}>
          <div style={{ fontSize: '9px', color: '#64748b', marginBottom: '2px' }}>PBR</div>
          <div style={{ fontSize: isMobile ? '12px' : '14px', fontWeight: '600', color: stockInfo.pbr < stockInfo.sectorPbr ? '#10b981' : '#ef4444' }}>{stockInfo.pbr}</div>
        </div>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
        <a 
          href={naverNewsUrl} 
          target="_blank" 
          rel="noopener noreferrer" 
          onClick={e => e.stopPropagation()} 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: '4px', 
            background: 'rgba(59,130,246,0.1)', 
            border: '1px solid rgba(59,130,246,0.3)', 
            borderRadius: '6px', 
            color: '#60a5fa', 
            fontSize: isMobile ? '11px' : '12px', 
            fontWeight: '600', 
            textDecoration: 'none', 
            padding: isMobile ? '10px 6px' : '8px',
            minHeight: '44px',
          }}
        >
          📰 뉴스
        </a>
        <button 
          onClick={e => { e.stopPropagation(); onShowAINews(); }} 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: '2px', 
            background: isPremium ? 'linear-gradient(135deg, rgba(139,92,246,0.2) 0%, rgba(59,130,246,0.2) 100%)' : 'rgba(100,116,139,0.1)', 
            border: isPremium ? '1px solid rgba(139,92,246,0.4)' : '1px solid rgba(100,116,139,0.3)', 
            borderRadius: '6px', 
            color: isPremium ? '#a78bfa' : '#64748b', 
            fontSize: isMobile ? '10px' : '11px', 
            fontWeight: '600', 
            padding: isMobile ? '10px 4px' : '8px', 
            cursor: 'pointer',
            minHeight: '44px',
          }}
        >
          🤖 AI뉴스{!isPremium && <span style={{ fontSize: '9px' }}>👑</span>}
        </button>
        <button 
          onClick={e => { e.stopPropagation(); onShowAIReport(); }} 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: '2px', 
            background: isPremium ? 'linear-gradient(135deg, rgba(16,185,129,0.2) 0%, rgba(6,182,212,0.2) 100%)' : 'rgba(100,116,139,0.1)', 
            border: isPremium ? '1px solid rgba(16,185,129,0.4)' : '1px solid rgba(100,116,139,0.3)', 
            borderRadius: '6px', 
            color: isPremium ? '#34d399' : '#64748b', 
            fontSize: isMobile ? '10px' : '11px', 
            fontWeight: '600', 
            padding: isMobile ? '10px 4px' : '8px', 
            cursor: 'pointer',
            minHeight: '44px',
          }}
        >
          📑 리포트{!isPremium && <span style={{ fontSize: '9px' }}>👑</span>}
        </button>
      </div>
    </div>
  )
}

// 포지션 카드 컴포넌트
function PositionCard({ 
  position, 
  priceData, 
  onEdit, 
  onDelete, 
  isPremium, 
  onUpgrade 
}: {
  position: Position
  priceData: PriceData[] | undefined
  onEdit: (position: Position) => void
  onDelete: (id: number) => void
  isPremium: boolean
  onUpgrade: () => void
}) {
  const { isMobile, isTablet } = useResponsive()
  const [visibleLines, setVisibleLines] = useState({ candle3: true, stopLoss: true, twoThird: true, maSignal: true })
  const [showAINews, setShowAINews] = useState(false)
  const [showAIReport, setShowAIReport] = useState(false)
  const [showChart, setShowChart] = useState(!isMobile)
  
  const currentPrice = priceData?.[priceData.length - 1]?.close || position.buyPrice
  const profitRate = ((currentPrice - position.buyPrice) / position.buyPrice) * 100
  const profitAmount = (currentPrice - position.buyPrice) * position.quantity
  const totalValue = currentPrice * position.quantity
  const isProfit = profitRate >= 0
  const sellPrices = calculateSellPrices(position, priceData, position.presetSettings)
  
  const getStage = () => {
    if (profitRate < 0) return { ...PROFIT_STAGES.initial, label: '손실 구간', color: '#ef4444' }
    if (profitRate < 5) return PROFIT_STAGES.initial
    if (profitRate < 10) return PROFIT_STAGES.profit5
    return PROFIT_STAGES.profit10
  }
  
  const stage = getStage()
  const naverStockUrl = 'https://finance.naver.com/item/main.naver?code=' + position.code
  const naverChartUrl = 'https://finance.naver.com/item/fchart.naver?code=' + position.code

  const getChartSize = () => {
    if (isMobile) return { width: Math.min(320, typeof window !== 'undefined' ? window.innerWidth - 48 : 320), height: 200 }
    if (isTablet) return { width: 240, height: 240 }
    return { width: 270, height: 280 }
  }
  const chartSize = getChartSize()

  return (
    <>
      <div style={{ 
        background: 'linear-gradient(145deg, #1e293b 0%, #0f172a 100%)', 
        borderRadius: isMobile ? '12px' : '14px', 
        padding: isMobile ? '12px' : '16px', 
        marginBottom: isMobile ? '12px' : '14px', 
        border: '1px solid rgba(255,255,255,0.08)' 
      }}>
        {/* 헤더 */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: isMobile ? 'flex-start' : 'center', 
          marginBottom: '12px',
          flexWrap: isMobile ? 'wrap' : 'nowrap',
          gap: isMobile ? '8px' : '0'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            flexWrap: 'wrap',
            flex: isMobile ? '1 1 100%' : 'initial'
          }}>
            <a href={naverStockUrl} target="_blank" rel="noopener noreferrer" style={{ 
              fontSize: isMobile ? '16px' : '18px', 
              fontWeight: '700', 
              color: '#fff', 
              textDecoration: 'none' 
            }}>
              {position.name} ↗
            </a>
            <span style={{ 
              background: 'rgba(59,130,246,0.2)', 
              color: '#60a5fa', 
              padding: isMobile ? '3px 8px' : '4px 10px', 
              borderRadius: '5px', 
              fontSize: isMobile ? '11px' : '13px', 
              fontWeight: '600' 
            }}>
              {position.code}
            </span>
            <span style={{ 
              background: stage.color + '20', 
              color: stage.color, 
              padding: isMobile ? '3px 8px' : '4px 10px', 
              borderRadius: '5px', 
              fontSize: isMobile ? '11px' : '13px', 
              fontWeight: '600' 
            }}>
              {stage.label}
            </span>
          </div>
          <div style={{ 
            display: 'flex', 
            gap: '6px',
            marginLeft: isMobile ? 'auto' : '0'
          }}>
            <button 
              onClick={() => onEdit(position)} 
              style={{ 
                background: 'rgba(255,255,255,0.08)', 
                border: 'none', 
                borderRadius: '6px', 
                padding: isMobile ? '8px 12px' : '8px 14px', 
                color: '#94a3b8', 
                fontSize: isMobile ? '12px' : '13px', 
                cursor: 'pointer',
                minHeight: '36px'
              }}
            >수정</button>
            <button 
              onClick={() => onDelete(position.id)} 
              style={{ 
                background: 'rgba(239,68,68,0.15)', 
                border: 'none', 
                borderRadius: '6px', 
                padding: isMobile ? '8px 12px' : '8px 14px', 
                color: '#ef4444', 
                fontSize: isMobile ? '12px' : '13px', 
                cursor: 'pointer',
                minHeight: '36px'
              }}
            >삭제</button>
          </div>
        </div>
        
        {/* 메인 콘텐츠 */}
        <div style={{ 
          display: isMobile ? 'flex' : 'grid', 
          flexDirection: isMobile ? 'column' : undefined,
          gridTemplateColumns: isMobile ? undefined : isTablet ? '1fr 250px' : '1fr 280px', 
          gap: '12px', 
          alignItems: 'stretch' 
        }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {/* 가격 정보 */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', 
              gap: '6px', 
              marginBottom: '10px' 
            }}>
              {[
                { label: '매수가', value: '₩' + position.buyPrice.toLocaleString() },
                { label: '현재가', value: '₩' + Math.round(currentPrice).toLocaleString(), color: isProfit ? '#10b981' : '#ef4444' },
                { label: '수량', value: position.quantity + '주' },
                { label: '평가금액', value: '₩' + Math.round(totalValue).toLocaleString() }
              ].map((item, i) => (
                <div key={i} style={{ 
                  background: 'rgba(0,0,0,0.2)', 
                  borderRadius: '6px', 
                  padding: isMobile ? '10px 8px' : '8px' 
                }}>
                  <div style={{ fontSize: isMobile ? '10px' : '11px', color: '#64748b', marginBottom: '2px' }}>{item.label}</div>
                  <div style={{ 
                    fontSize: isMobile ? '14px' : '16px', 
                    fontWeight: '700', 
                    color: item.color || '#e2e8f0',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>{item.value}</div>
                </div>
              ))}
            </div>
            
            {/* 평가손익 */}
            <div style={{ 
              background: isProfit ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', 
              borderRadius: '8px', 
              padding: isMobile ? '12px' : '10px', 
              borderLeft: '4px solid ' + (isProfit ? '#10b981' : '#ef4444'), 
              marginBottom: '10px', 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center' 
            }}>
              <div>
                <div style={{ fontSize: isMobile ? '10px' : '11px', color: '#64748b', marginBottom: '2px' }}>평가손익</div>
                <div style={{ fontSize: isMobile ? '18px' : '20px', fontWeight: '700', color: isProfit ? '#10b981' : '#ef4444' }}>
                  {isProfit ? '+' : ''}₩{Math.round(profitAmount).toLocaleString()}
                </div>
              </div>
              <div style={{ 
                fontSize: isMobile ? '20px' : '24px', 
                fontWeight: '800', 
                color: isProfit ? '#10b981' : '#ef4444', 
                background: isProfit ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)', 
                padding: isMobile ? '6px 10px' : '6px 12px', 
                borderRadius: '8px' 
              }}>
                {isProfit ? '+' : ''}{profitRate.toFixed(2)}%
              </div>
            </div>
            
            {/* 매도 조건 */}
            <div style={{ 
              background: 'rgba(0,0,0,0.2)', 
              borderRadius: '8px', 
              padding: isMobile ? '10px' : '10px', 
              marginBottom: '8px', 
              flex: 1 
            }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                marginBottom: '6px' 
              }}>
                <span style={{ fontSize: isMobile ? '13px' : '14px', color: '#fff', fontWeight: '600' }}>📊 매도 조건별 기준가격</span>
                <button 
                  onClick={() => onEdit(position)} 
                  style={{ 
                    background: 'rgba(59,130,246,0.15)', 
                    border: '1px solid rgba(59,130,246,0.3)', 
                    borderRadius: '4px', 
                    padding: isMobile ? '6px 10px' : '4px 10px', 
                    color: '#60a5fa', 
                    fontSize: isMobile ? '11px' : '12px', 
                    cursor: 'pointer',
                    minHeight: '32px'
                  }}
                >✏️ 조건 변경</button>
              </div>
              <div style={{ 
                fontSize: '10px', 
                color: '#f59e0b', 
                marginBottom: '6px', 
                background: 'rgba(245,158,11,0.1)', 
                padding: '5px 8px', 
                borderRadius: '4px' 
              }}>
                ⚠️ 수치는 예시입니다. 본인의 투자 원칙에 따라 수정하세요.
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {(position.selectedPresets || []).slice(0, isMobile ? 3 : undefined).map(presetId => {
                  const preset = SELL_PRESETS[presetId as keyof typeof SELL_PRESETS]
                  if (!preset) return null
                  
                  let priceText = '-'
                  let priceColor = '#94a3b8'
                  const hasChartLine = ['candle3', 'stopLoss', 'twoThird', 'maSignal'].includes(presetId)
                  
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
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between', 
                      padding: isMobile ? '10px' : '8px 10px', 
                      background: 'rgba(255,255,255,0.03)', 
                      borderRadius: '6px', 
                      borderLeft: '3px solid ' + preset.color 
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {hasChartLine && !isMobile ? (
                          <input 
                            type="checkbox" 
                            checked={visibleLines[presetId as keyof typeof visibleLines] || false} 
                            onChange={() => setVisibleLines(prev => ({ ...prev, [presetId]: !prev[presetId as keyof typeof prev] }))} 
                            style={{ width: '16px', height: '16px', accentColor: preset.color, cursor: 'pointer' }} 
                          />
                        ) : (
                          <div style={{ width: isMobile ? '0' : '16px' }} />
                        )}
                        <span style={{ fontSize: isMobile ? '12px' : '14px', color: '#e2e8f0' }}>{preset.icon} {isMobile ? preset.name.replace(' 매도법', '') : preset.name}</span>
                      </div>
                      <span style={{ fontSize: isMobile ? '13px' : '15px', fontWeight: '700', color: priceColor }}>{priceText}</span>
                    </div>
                  )
                })}
              </div>
              {!isMobile && (
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px', textAlign: 'center' }}>체크박스 선택 시 차트에 가격선 표시</div>
              )}
            </div>
            
            {/* 실적 위젯 */}
            <EarningsWidget 
              position={position} 
              isPremium={isPremium} 
              onShowAINews={() => setShowAINews(true)} 
              onShowAIReport={() => setShowAIReport(true)} 
            />
          </div>
          
          {/* 차트 영역 */}
          {isMobile ? (
            <div>
              <button
                onClick={() => setShowChart(!showChart)}
                style={{
                  width: '100%',
                  padding: '10px',
                  background: 'rgba(59,130,246,0.1)',
                  border: '1px solid rgba(59,130,246,0.3)',
                  borderRadius: '8px',
                  color: '#60a5fa',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  marginBottom: showChart ? '10px' : '0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                📊 차트 {showChart ? '접기 ▲' : '보기 ▼'}
              </button>
              {showChart && priceData && (
                <div 
                  onClick={() => window.open(naverChartUrl, '_blank')} 
                  style={{ cursor: 'pointer' }}
                >
                  <div style={{ 
                    background: 'rgba(0,0,0,0.3)', 
                    borderRadius: '8px', 
                    padding: '4px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center' 
                  }}>
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
            <div 
              onClick={() => window.open(naverChartUrl, '_blank')} 
              style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column' }}
            >
              <div style={{ 
                background: 'rgba(0,0,0,0.3)', 
                borderRadius: '8px', 
                padding: '4px', 
                flex: 1, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center' 
              }}>
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
      
      {/* AI 팝업 */}
      {showAINews && <AINewsPopup position={position} onClose={() => setShowAINews(false)} isPremium={isPremium} onUpgrade={onUpgrade} />}
      {showAIReport && <AIReportPopup position={position} onClose={() => setShowAIReport(false)} isPremium={isPremium} onUpgrade={onUpgrade} />}
    </>
  )
}

// 매도법 가이드
function SellMethodGuide({ isMobile, activeTab }: { isMobile: boolean; activeTab: string }) {
  const [expandedStage, setExpandedStage] = useState<string | null>(null)
  const [showAllMethods, setShowAllMethods] = useState(false)
  
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
  
  const toggleStage = (key: string) => {
    setExpandedStage(expandedStage === key ? null : key)
  }
  
  return (
    <div style={{ 
      display: isMobile && activeTab !== 'guide' ? 'none' : 'block',
      background: 'linear-gradient(145deg, #1e293b 0%, #0f172a 100%)', 
      borderRadius: '14px', 
      padding: isMobile ? '14px' : '16px', 
      border: '1px solid rgba(255,255,255,0.08)', 
      marginBottom: '12px' 
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '12px' 
      }}>
        <h3 style={{ 
          fontSize: isMobile ? '14px' : '15px', 
          fontWeight: '600', 
          color: '#fff', 
          margin: 0 
        }}>📚 수익 단계별 매도법</h3>
        <button 
          onClick={() => setShowAllMethods(!showAllMethods)}
          style={{
            background: 'rgba(59,130,246,0.15)',
            border: '1px solid rgba(59,130,246,0.3)',
            borderRadius: '6px',
            padding: '4px 10px',
            color: '#60a5fa',
            fontSize: '11px',
            cursor: 'pointer'
          }}
        >
          {showAllMethods ? '간략히' : '전체보기'}
        </button>
      </div>
      
      {Object.entries(PROFIT_STAGES).map(([key, stage]) => (
        <div key={key} style={{ marginBottom: '8px' }}>
          <div 
            onClick={() => toggleStage(key)}
            style={{ 
              padding: isMobile ? '12px' : '14px', 
              background: stage.color + '10', 
              borderRadius: expandedStage === key ? '10px 10px 0 0' : '10px', 
              borderLeft: '4px solid ' + stage.color,
              cursor: 'pointer',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <div style={{ 
                fontSize: isMobile ? '13px' : '14px', 
                fontWeight: '600', 
                color: stage.color
              }}>{stage.label}</div>
              <div style={{ 
                fontSize: isMobile ? '11px' : '12px', 
                color: '#94a3b8',
                marginTop: '2px'
              }}>수익률 {stage.range} · {stage.methods.length}개 매도법</div>
            </div>
            <span style={{ 
              color: '#64748b', 
              fontSize: '14px',
              transform: expandedStage === key ? 'rotate(180deg)' : 'rotate(0deg)'
            }}>▼</span>
          </div>
          
          {(expandedStage === key || showAllMethods) && (
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
                  <div key={methodId} style={{ 
                    marginBottom: '10px',
                    paddingBottom: '10px',
                    borderBottom: '1px solid rgba(255,255,255,0.05)'
                  }}>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '8px',
                      marginBottom: '4px'
                    }}>
                      <span style={{ fontSize: '16px' }}>{method.icon}</span>
                      <span style={{ 
                        fontSize: isMobile ? '12px' : '13px', 
                        fontWeight: '600',
                        color: '#fff'
                      }}>{method.name}</span>
                    </div>
                    <p style={{ 
                      fontSize: isMobile ? '11px' : '12px', 
                      color: '#94a3b8',
                      margin: 0,
                      lineHeight: '1.5',
                      paddingLeft: '24px'
                    }}>
                      {methodDescriptions[methodId] || method.description}
                    </p>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      ))}
      
      {!showAllMethods && !expandedStage && (
        <div style={{ 
          marginTop: '12px',
          padding: '10px',
          background: 'rgba(59,130,246,0.1)',
          borderRadius: '8px',
          fontSize: isMobile ? '11px' : '12px',
          color: '#60a5fa'
        }}>
          💡 각 단계를 탭하면 상세 매도법을 확인할 수 있습니다
        </div>
      )}
    </div>
  )
}

// 메인 앱
export default function SellSignalApp() {
  const { isMobile, isTablet } = useResponsive()
  
  const [user, setUser] = useState({ membership: 'free' as 'free' | 'premium', email: 'demo@test.com' })
  const [positions, setPositions] = useState<Position[]>(INITIAL_POSITIONS)
  const [priceDataMap, setPriceDataMap] = useState<Record<number, PriceData[]>>({})
  const [alerts, setAlerts] = useState<Alert[]>(INITIAL_ALERTS)
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

  // 총계 계산
  const totalCost = positions.reduce((sum, p) => sum + p.buyPrice * p.quantity, 0)
  const totalValue = positions.reduce((sum, p) => { 
    const price = priceDataMap[p.id]?.[priceDataMap[p.id]?.length - 1]?.close || p.buyPrice
    return sum + price * p.quantity
  }, 0)
  const totalProfit = totalValue - totalCost
  const totalProfitRate = totalCost > 0 ? (totalProfit / totalCost) * 100 : 0

  const getMainLayoutStyle = () => {
    if (isMobile) {
      return {
        display: 'flex',
        flexDirection: 'column' as const,
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
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: rgba(255,255,255,0.05); }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 3px; }
        * { -webkit-tap-highlight-color: transparent; }
      `}</style>

      <ResponsiveHeader 
        alerts={alerts}
        isPremium={isPremium}
        onShowUpgrade={() => setShowUpgradePopup(true)}
        onShowAddModal={() => setShowAddModal(true)}
      />

      <main style={{ 
        maxWidth: isMobile ? '100%' : isTablet ? '1200px' : '1600px', 
        margin: '0 auto', 
        padding: isMobile ? '16px 0' : '24px' 
      }}>
        <ResponsiveSummaryCards 
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
                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#ef4444' }}>4단계: 금리고점 (팔 때)</div>
                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>매도 관망 권장 · 탭하여 상세보기</div>
                  </div>
                </div>
                <span style={{ color: '#64748b', fontSize: '18px' }}>›</span>
              </div>
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
                onEdit={setEditingPosition} 
                onDelete={(id) => { 
                  setPositions(prev => prev.filter(p => p.id !== id))
                  setPriceDataMap(prev => { const u = { ...prev }; delete u[id]; return u })
                }} 
                isPremium={isPremium}
                onUpgrade={() => setShowUpgradePopup(true)}
              />
            ))}
          </div>

          {/* 우측 사이드바 */}
          {(!isMobile || activeTab === 'market' || activeTab === 'alerts' || activeTab === 'guide') && (
          <div style={{ 
            display: 'block',
            padding: isMobile ? '0 16px' : '0',
          }}>
            <div style={{ display: isMobile && activeTab !== 'market' ? 'none' : 'block' }}>
              <MarketCycleWidget isPremium={isPremium} />
            </div>
            
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
                    onDismiss={(id) => setAlerts(prev => prev.filter(a => a.id !== id))} 
                  />
                ))
              )}
            </div>
            
            <SellMethodGuide isMobile={isMobile} activeTab={activeTab} />
            
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

      {/* 모바일 하단 네비게이션 */}
      {isMobile && (
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
            { id: 'alerts', icon: '🔔', label: '알림', badge: alerts.length },
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
      )}

      {/* 모달들 */}
      {showAddModal && (
        <StockModal 
          onSave={(stock) => { 
            setPositions(prev => [...prev, stock])
            setShowAddModal(false)
          }} 
          onClose={() => setShowAddModal(false)} 
        />
      )}
      {editingPosition && (
        <StockModal 
          stock={editingPosition} 
          onSave={(stock) => { 
            setPositions(prev => prev.map(p => p.id === stock.id ? stock : p))
            setEditingPosition(null)
          }} 
          onClose={() => setEditingPosition(null)} 
        />
      )}

      {showUpgradePopup && (
        <UpgradeModal 
          onUpgrade={() => { setUser({ ...user, membership: 'premium' }); setShowUpgradePopup(false); }}
          onClose={() => setShowUpgradePopup(false)}
        />
      )}
    </div>
  )
}
