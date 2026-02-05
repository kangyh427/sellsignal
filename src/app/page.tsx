'use client'

import React, { useState, useEffect } from 'react'

// ============================================
// 타입 정의
// ============================================
interface Position {
  id: number
  name: string
  code: string
  buyPrice: number
  quantity: number
  highestPrice?: number
  selectedPresets: string[]
  presetSettings?: Record<string, { value: number }>
}

interface AlertItem {
  id: number
  stockName: string
  code: string
  preset: PresetType
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

interface Stock {
  name: string
  code: string
  market: string
  sector?: string
}

interface PresetType {
  id: string
  name: string
  icon: string
  description: string
  stages: string[]
  severity: string
  color: string
  hasInput?: boolean
  inputLabel?: string
  inputDefault?: number
}

// ============================================
// 반응형 훅 (SSR 안전)
// ============================================
const BREAKPOINTS = { mobile: 480, tablet: 768, desktop: 1024, wide: 1400 }

const useResponsive = () => {
  const [windowSize, setWindowSize] = useState<{width: number; height: number} | null>(null)

  useEffect(() => {
    const handleResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight })
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  if (!windowSize) return { width: 1200, height: 800, isMobile: false, isTablet: false, isDesktop: true, isWide: false }

  return {
    width: windowSize.width,
    height: windowSize.height,
    isMobile: windowSize.width < BREAKPOINTS.tablet,
    isTablet: windowSize.width >= BREAKPOINTS.tablet && windowSize.width < BREAKPOINTS.desktop,
    isDesktop: windowSize.width >= BREAKPOINTS.desktop,
    isWide: windowSize.width >= BREAKPOINTS.wide,
  }
}

// ============================================
// 상수 정의 (한글 정상)
// ============================================
const SELL_PRESETS: Record<string, PresetType> = {
  candle3: { id: 'candle3', name: '봉 3개 매도법', icon: '📊', description: '음봉이 직전 양봉의 50% 이상 덮을 때', stages: ['initial', 'profit5'], severity: 'high', color: '#f59e0b' },
  stopLoss: { id: 'stopLoss', name: '손실제한 매도법', icon: '🛑', description: '매수가 대비 설정% 도달 시', stages: ['initial', 'profit5'], hasInput: true, inputLabel: '손절 기준 (%)', inputDefault: -5, severity: 'critical', color: '#ef4444' },
  twoThird: { id: 'twoThird', name: '2/3 익절 매도법', icon: '📈', description: '최고 수익 대비 1/3 하락 시', stages: ['profit5', 'profit10'], severity: 'medium', color: '#8b5cf6' },
  maSignal: { id: 'maSignal', name: '이동평균선 매도법', icon: '📉', description: '이동평균선 하향 돌파 시', stages: ['profit5', 'profit10'], hasInput: true, inputLabel: '이동평균 기간 (일)', inputDefault: 20, severity: 'high', color: '#06b6d4' },
  volumeZone: { id: 'volumeZone', name: '매물대 매도법', icon: '🏔️', description: '저항대 도달 후 하락 시', stages: ['profit5', 'profit10'], severity: 'medium', color: '#84cc16' },
  trendline: { id: 'trendline', name: '추세선 매도법', icon: '📐', description: '지지선/저항선 이탈 시', stages: ['profit10'], severity: 'medium', color: '#ec4899' },
  fundamental: { id: 'fundamental', name: '기업가치 반전', icon: '📰', description: '실적 발표/뉴스 모니터링', stages: ['profit10'], severity: 'high', color: '#f97316' },
  cycle: { id: 'cycle', name: '경기순환 매도법', icon: '🔄', description: '금리/경기 사이클 기반', stages: ['profit10'], severity: 'low', color: '#64748b' },
}

const PROFIT_STAGES: Record<string, { label: string; color: string; range: string; methods: string[] }> = {
  initial: { label: '초기 단계', color: '#6b7280', range: '0~5%', methods: ['candle3', 'stopLoss'] },
  profit5: { label: '5% 수익 구간', color: '#eab308', range: '5~10%', methods: ['candle3', 'stopLoss', 'twoThird', 'maSignal', 'volumeZone'] },
  profit10: { label: '10%+ 수익 구간', color: '#10b981', range: '10% 이상', methods: ['twoThird', 'maSignal', 'volumeZone', 'fundamental', 'trendline', 'cycle'] },
}

const STOCK_LIST: Stock[] = [
  { name: '삼성전자', code: '005930', market: '코스피', sector: '반도체' },
  { name: '현대차', code: '005380', market: '코스피', sector: '자동차' },
  { name: '한화에어로스페이스', code: '012450', market: '코스피', sector: '방산' },
  { name: 'SK하이닉스', code: '000660', market: '코스피', sector: '반도체' },
  { name: '네이버', code: '035420', market: '코스피', sector: 'IT서비스' },
  { name: '카카오', code: '035720', market: '코스피', sector: 'IT서비스' },
  { name: 'LG화학', code: '051910', market: '코스피', sector: '화학' },
  { name: '기아', code: '000270', market: '코스피', sector: '자동차' },
  { name: 'POSCO홀딩스', code: '005490', market: '코스피', sector: '철강' },
  { name: '셀트리온', code: '068270', market: '코스피', sector: '바이오' },
  { name: 'KB금융', code: '105560', market: '코스피', sector: '금융' },
  { name: '삼성SDI', code: '006400', market: '코스피', sector: '2차전지' },
]

// ============================================
// 유틸리티 함수
// ============================================
const generateMockPriceData = (basePrice: number, days = 60): PriceData[] => {
  const data: PriceData[] = []
  let price = basePrice
  for (let i = 0; i < days; i++) {
    const change = (Math.random() - 0.47) * basePrice * 0.025
    price = Math.max(price + change, basePrice * 0.7)
    const high = price * (1 + Math.random() * 0.02)
    const low = price * (1 - Math.random() * 0.02)
    const open = low + Math.random() * (high - low)
    const close = low + Math.random() * (high - low)
    data.push({ date: new Date(Date.now() - (days - i) * 86400000), open, high, low, close, volume: Math.floor(Math.random() * 1000000 + 500000) })
  }
  return data
}

const searchStocks = (query: string): Stock[] => {
  if (!query?.trim()) return []
  const q = query.trim().toLowerCase()
  return STOCK_LIST.filter(s => s.name.toLowerCase().includes(q) || s.code.includes(q)).slice(0, 10)
}

const findExactStock = (query: string): Stock | null => {
  if (!query) return null
  return STOCK_LIST.find(s => s.name === query || s.code === query) || null
}

const calculateSellPrices = (position: Position, priceData?: PriceData[]): Record<string, number> => {
  const prices: Record<string, number> = {}
  const settings = position.presetSettings
  prices.stopLoss = Math.round(position.buyPrice * (1 + (settings?.stopLoss?.value || -5) / 100))
  if (position.highestPrice) {
    prices.twoThird = Math.round(position.highestPrice - (position.highestPrice - position.buyPrice) / 3)
  }
  const maPeriod = settings?.maSignal?.value || 20
  if (priceData && priceData.length >= maPeriod) {
    prices.maSignal = Math.round(priceData.slice(-maPeriod).reduce((sum, d) => sum + d.close, 0) / maPeriod)
  }
  return prices
}

// ============================================
// 반응형 헤더
// ============================================
const ResponsiveHeader: React.FC<{
  alerts: AlertItem[]
  isPremium: boolean
  onShowUpgrade: () => void
  onShowAddModal: () => void
}> = ({ alerts, isPremium, onShowUpgrade, onShowAddModal }) => {
  const { isMobile } = useResponsive()
  const [showMenu, setShowMenu] = useState(false)

  if (isMobile) {
    return (
      <header style={{ background: 'rgba(15,23,42,0.98)', borderBottom: '1px solid rgba(255,255,255,0.08)', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: 40, height: 40, background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>📈</div>
            <div>
              <h1 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>매도의 기술</h1>
              <p style={{ fontSize: 11, color: '#64748b', margin: 0 }}>{isPremium ? '👑 프리미엄' : '무료회원'}</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {alerts.length > 0 && (
              <div style={{ position: 'relative', width: 36, height: 36, background: 'rgba(239,68,68,0.15)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 18 }}>🔔</span>
                <span style={{ position: 'absolute', top: -4, right: -4, background: '#ef4444', color: '#fff', fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 8 }}>{alerts.length}</span>
              </div>
            )}
            <button onClick={onShowAddModal} style={{ width: 36, height: 36, background: 'linear-gradient(135deg,#3b82f6,#1d4ed8)', border: 'none', borderRadius: 10, color: '#fff', fontSize: 20, cursor: 'pointer' }}>+</button>
            <button onClick={() => setShowMenu(!showMenu)} style={{ width: 36, height: 36, background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 10, color: '#fff', fontSize: 18, cursor: 'pointer' }}>☰</button>
          </div>
        </div>
        {showMenu && (
          <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'rgba(15,23,42,0.98)', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8, zIndex: 101 }}>
            {!isPremium && <button onClick={() => { onShowUpgrade(); setShowMenu(false) }} style={{ padding: '12px 16px', background: 'linear-gradient(135deg,#8b5cf6,#6366f1)', border: 'none', borderRadius: 10, color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>👑 프리미엄 업그레이드</button>}
            <button onClick={() => { onShowAddModal(); setShowMenu(false) }} style={{ padding: '12px 16px', background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)', borderRadius: 10, color: '#60a5fa', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>+ 종목 추가</button>
          </div>
        )}
      </header>
    )
  }

  return (
    <header style={{ background: 'rgba(15,23,42,0.95)', borderBottom: '1px solid rgba(255,255,255,0.05)', position: 'sticky', top: 0, zIndex: 100 }}>
      <div style={{ maxWidth: 1600, margin: '0 auto', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ minWidth: 200 }}>
          {alerts.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', background: 'rgba(239,68,68,0.2)', borderRadius: 10 }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444' }} />
              <span style={{ fontSize: 14, fontWeight: 600, color: '#ef4444' }}>{alerts.length}개 알림</span>
            </div>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
          <div style={{ width: 52, height: 52, background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>📈</div>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>매도의 기술</h1>
            <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>{isPremium ? '👑 프리미엄' : '무료회원'} · 조건 알람 도구</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12, minWidth: 200, justifyContent: 'flex-end' }}>
          {!isPremium && <button onClick={onShowUpgrade} style={{ padding: '12px 18px', background: 'linear-gradient(135deg,#8b5cf6,#6366f1)', border: 'none', borderRadius: 10, color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>👑 업그레이드</button>}
          <button onClick={onShowAddModal} style={{ padding: '12px 20px', background: 'linear-gradient(135deg,#3b82f6,#1d4ed8)', border: 'none', borderRadius: 10, color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>+ 종목 추가</button>
        </div>
      </div>
    </header>
  )
}

// ============================================
// 요약 카드
// ============================================
const SummaryCards: React.FC<{ totalCost: number; totalValue: number; totalProfit: number; totalProfitRate: number }> = ({ totalCost, totalValue, totalProfit, totalProfitRate }) => {
  const { isMobile } = useResponsive()
  const cards = [
    { label: '총 매수금액', value: `₩${Math.round(totalCost).toLocaleString()}`, icon: '💵' },
    { label: '총 평가금액', value: `₩${Math.round(totalValue).toLocaleString()}`, icon: '💰' },
    { label: '총 평가손익', value: `${totalProfit >= 0 ? '+' : ''}₩${Math.round(totalProfit).toLocaleString()}`, color: totalProfit >= 0 ? '#10b981' : '#ef4444', icon: '📈' },
    { label: '총 수익률', value: `${totalProfitRate >= 0 ? '+' : ''}${totalProfitRate.toFixed(2)}%`, color: totalProfitRate >= 0 ? '#10b981' : '#ef4444', icon: '🎯' },
  ]

  return (
    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2,1fr)' : 'repeat(4,1fr)', gap: isMobile ? 10 : 14, marginBottom: isMobile ? 16 : 20, padding: isMobile ? '0 16px' : 0 }}>
      {cards.map((card, i) => (
        <div key={i} style={{ background: 'linear-gradient(145deg,#1e293b,#0f172a)', borderRadius: isMobile ? 10 : 12, padding: isMobile ? 12 : 16, border: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 4 : 6, marginBottom: isMobile ? 4 : 6 }}>
            <span style={{ fontSize: isMobile ? 14 : 16 }}>{card.icon}</span>
            <span style={{ fontSize: isMobile ? 10 : 12, color: '#64748b' }}>{card.label}</span>
          </div>
          <div style={{ fontSize: isMobile ? 16 : 22, fontWeight: 700, color: card.color || '#fff' }}>{card.value}</div>
        </div>
      ))}
    </div>
  )
}

// ============================================
// 캔들 차트
// ============================================
const CandleChart: React.FC<{ data: PriceData[]; width?: number; height?: number; buyPrice: number; sellPrices: Record<string, number> }> = ({ data, width = 270, height = 200, buyPrice, sellPrices }) => {
  if (!data?.length) return null
  
  const padding = { top: 10, right: 60, bottom: 30, left: 6 }
  const chartW = width - padding.left - padding.right
  const chartH = height - padding.top - padding.bottom
  
  const allPrices = data.flatMap(d => [d.high, d.low]).concat([buyPrice]).concat(Object.values(sellPrices || {}).filter(Boolean))
  const minP = Math.min(...allPrices) * 0.98
  const maxP = Math.max(...allPrices) * 1.02
  const range = maxP - minP || 1
  const candleW = Math.max(3, chartW / data.length - 1.5)
  
  const scaleY = (p: number) => padding.top + chartH - ((p - minP) / range) * chartH
  const scaleX = (i: number) => padding.left + (i / data.length) * chartW

  return (
    <svg width={width} height={height} style={{ background: 'rgba(0,0,0,0.3)', borderRadius: 8 }}>
      {[0,1,2,3,4].map(i => {
        const price = minP + (range * i / 4)
        const y = scaleY(price)
        return (
          <g key={i}>
            <line x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="rgba(255,255,255,0.1)" strokeDasharray="3,3" />
            <text x={width - padding.right + 4} y={y + 4} fill="#888" fontSize={9}>{Math.round(price).toLocaleString()}</text>
          </g>
        )
      })}
      {data.map((c, i) => {
        const x = scaleX(i)
        const isUp = c.close >= c.open
        const color = isUp ? '#10b981' : '#ef4444'
        return (
          <g key={i}>
            <line x1={x + candleW/2} y1={scaleY(c.high)} x2={x + candleW/2} y2={scaleY(c.low)} stroke={color} />
            <rect x={x} y={scaleY(Math.max(c.open, c.close))} width={candleW} height={Math.max(1, Math.abs(scaleY(c.open) - scaleY(c.close)))} fill={color} />
          </g>
        )
      })}
      <line x1={padding.left} y1={scaleY(buyPrice)} x2={width - padding.right} y2={scaleY(buyPrice)} stroke="#3b82f6" strokeWidth={1.5} strokeDasharray="4,2"/>
      {sellPrices.stopLoss && <line x1={padding.left} y1={scaleY(sellPrices.stopLoss)} x2={width - padding.right} y2={scaleY(sellPrices.stopLoss)} stroke="#ef4444" strokeWidth={1.5}/>}
      {sellPrices.maSignal && <line x1={padding.left} y1={scaleY(sellPrices.maSignal)} x2={width - padding.right} y2={scaleY(sellPrices.maSignal)} stroke="#06b6d4" strokeWidth={1.5} strokeDasharray="4,2"/>}
    </svg>
  )
}

// ============================================
// 포지션 카드
// ============================================
const PositionCard: React.FC<{
  position: Position
  priceData?: PriceData[]
  onEdit: (p: Position) => void
  onDelete: (id: number) => void
}> = ({ position, priceData, onEdit, onDelete }) => {
  const { isMobile, width } = useResponsive()
  const [showChart, setShowChart] = useState(!isMobile)
  
  const currentPrice = priceData?.[priceData.length - 1]?.close || position.buyPrice
  const profitRate = ((currentPrice - position.buyPrice) / position.buyPrice) * 100
  const profitAmount = (currentPrice - position.buyPrice) * position.quantity
  const totalValue = currentPrice * position.quantity
  const isProfit = profitRate >= 0
  const sellPrices = calculateSellPrices(position, priceData)
  
  const getStage = () => {
    if (profitRate < 0) return { ...PROFIT_STAGES.initial, label: '손실 구간', color: '#ef4444' }
    if (profitRate < 5) return PROFIT_STAGES.initial
    if (profitRate < 10) return PROFIT_STAGES.profit5
    return PROFIT_STAGES.profit10
  }
  const stage = getStage()

  return (
    <div style={{ background: 'linear-gradient(145deg,#1e293b,#0f172a)', borderRadius: isMobile ? 12 : 14, padding: isMobile ? 12 : 16, marginBottom: isMobile ? 12 : 14, border: '1px solid rgba(255,255,255,0.08)' }}>
      {/* 헤더 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', marginBottom: 12, flexWrap: isMobile ? 'wrap' : 'nowrap', gap: isMobile ? 8 : 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <a href={`https://finance.naver.com/item/main.naver?code=${position.code}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: isMobile ? 16 : 18, fontWeight: 700, color: '#fff', textDecoration: 'none' }}>
            {position.name} ↗
          </a>
          <span style={{ background: 'rgba(59,130,246,0.2)', color: '#60a5fa', padding: isMobile ? '3px 8px' : '4px 10px', borderRadius: 5, fontSize: isMobile ? 11 : 13, fontWeight: 600 }}>{position.code}</span>
          <span style={{ background: stage.color + '20', color: stage.color, padding: isMobile ? '3px 8px' : '4px 10px', borderRadius: 5, fontSize: isMobile ? 11 : 13, fontWeight: 600 }}>{stage.label}</span>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={() => onEdit(position)} style={{ background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: 6, padding: isMobile ? '8px 12px' : '8px 14px', color: '#94a3b8', fontSize: isMobile ? 12 : 13, cursor: 'pointer' }}>수정</button>
          <button onClick={() => onDelete(position.id)} style={{ background: 'rgba(239,68,68,0.15)', border: 'none', borderRadius: 6, padding: isMobile ? '8px 12px' : '8px 14px', color: '#ef4444', fontSize: isMobile ? 12 : 13, cursor: 'pointer' }}>삭제</button>
        </div>
      </div>
      
      {/* 메인 콘텐츠 */}
      <div style={{ display: isMobile ? 'flex' : 'grid', flexDirection: isMobile ? 'column' : undefined, gridTemplateColumns: isMobile ? undefined : '1fr 280px', gap: 12 }}>
        <div>
          {/* 가격 정보 */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2,1fr)' : 'repeat(4,1fr)', gap: 6, marginBottom: 10 }}>
            {[
              { label: '매수가', value: `₩${position.buyPrice.toLocaleString()}` },
              { label: '현재가', value: `₩${Math.round(currentPrice).toLocaleString()}`, color: isProfit ? '#10b981' : '#ef4444' },
              { label: '수량', value: `${position.quantity}주` },
              { label: '평가금액', value: `₩${Math.round(totalValue).toLocaleString()}` }
            ].map((item, i) => (
              <div key={i} style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 6, padding: isMobile ? '10px 8px' : 8 }}>
                <div style={{ fontSize: isMobile ? 10 : 11, color: '#64748b', marginBottom: 2 }}>{item.label}</div>
                <div style={{ fontSize: isMobile ? 14 : 16, fontWeight: 700, color: item.color || '#e2e8f0' }}>{item.value}</div>
              </div>
            ))}
          </div>
          
          {/* 평가손익 */}
          <div style={{ background: isProfit ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', borderRadius: 8, padding: isMobile ? 12 : 10, borderLeft: `4px solid ${isProfit ? '#10b981' : '#ef4444'}`, marginBottom: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: isMobile ? 10 : 11, color: '#64748b', marginBottom: 2 }}>평가손익</div>
              <div style={{ fontSize: isMobile ? 18 : 20, fontWeight: 700, color: isProfit ? '#10b981' : '#ef4444' }}>{isProfit ? '+' : ''}₩{Math.round(profitAmount).toLocaleString()}</div>
            </div>
            <div style={{ fontSize: isMobile ? 20 : 24, fontWeight: 800, color: isProfit ? '#10b981' : '#ef4444', background: isProfit ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)', padding: isMobile ? '6px 10px' : '6px 12px', borderRadius: 8 }}>
              {isProfit ? '+' : ''}{profitRate.toFixed(2)}%
            </div>
          </div>
          
          {/* 매도 조건 */}
          <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 8, padding: isMobile ? 10 : 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span style={{ fontSize: isMobile ? 13 : 14, color: '#fff', fontWeight: 600 }}>📊 매도 조건별 기준가격</span>
              <button onClick={() => onEdit(position)} style={{ background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)', borderRadius: 4, padding: isMobile ? '6px 10px' : '4px 10px', color: '#60a5fa', fontSize: isMobile ? 11 : 12, cursor: 'pointer' }}>✏️ 조건 변경</button>
            </div>
            <div style={{ fontSize: 10, color: '#f59e0b', marginBottom: 6, background: 'rgba(245,158,11,0.1)', padding: '5px 8px', borderRadius: 4 }}>⚠️ 수치는 예시입니다. 본인의 투자 원칙에 따라 수정하세요.</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {(position.selectedPresets || []).slice(0, isMobile ? 3 : undefined).map(presetId => {
                const preset = SELL_PRESETS[presetId]
                if (!preset) return null
                let priceText = '-'
                let priceColor = '#94a3b8'
                if (presetId === 'stopLoss' && sellPrices.stopLoss) { priceText = `₩${sellPrices.stopLoss.toLocaleString()}`; priceColor = currentPrice <= sellPrices.stopLoss ? '#ef4444' : '#94a3b8' }
                else if (presetId === 'twoThird' && sellPrices.twoThird) { priceText = `₩${sellPrices.twoThird.toLocaleString()}`; priceColor = currentPrice <= sellPrices.twoThird ? '#f59e0b' : '#94a3b8' }
                else if (presetId === 'maSignal' && sellPrices.maSignal) { priceText = `₩${sellPrices.maSignal.toLocaleString()}`; priceColor = currentPrice < sellPrices.maSignal ? '#f59e0b' : '#94a3b8' }
                return (
                  <div key={presetId} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: isMobile ? 10 : '8px 10px', background: 'rgba(255,255,255,0.03)', borderRadius: 6, borderLeft: `3px solid ${preset.color}` }}>
                    <span style={{ fontSize: isMobile ? 12 : 14, color: '#e2e8f0' }}>{preset.icon} {isMobile ? preset.name.replace(' 매도법', '') : preset.name}</span>
                    <span style={{ fontSize: isMobile ? 13 : 15, fontWeight: 700, color: priceColor }}>{priceText}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
        
        {/* 차트 (모바일에서는 토글) */}
        {isMobile ? (
          <div>
            <button onClick={() => setShowChart(!showChart)} style={{ width: '100%', padding: 10, background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)', borderRadius: 8, color: '#60a5fa', fontSize: 13, fontWeight: 600, cursor: 'pointer', marginTop: 8, marginBottom: showChart ? 10 : 0 }}>
              📊 차트 {showChart ? '접기 ▲' : '보기 ▼'}
            </button>
            {showChart && priceData && <CandleChart data={priceData.slice(-30)} width={Math.min(320, width - 48)} height={200} buyPrice={position.buyPrice} sellPrices={sellPrices} />}
          </div>
        ) : priceData && (
          <div>
            <CandleChart data={priceData.slice(-40)} width={270} height={280} buyPrice={position.buyPrice} sellPrices={sellPrices} />
            <div style={{ textAlign: 'center', marginTop: 4, fontSize: 12, color: '#64748b' }}>
              <a href={`https://finance.naver.com/item/fchart.naver?code=${position.code}`} target="_blank" rel="noopener noreferrer" style={{ color: '#60a5fa', textDecoration: 'none' }}>클릭 → 네이버 증권 차트</a>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ============================================
// 알림 카드
// ============================================
const AlertCard: React.FC<{ alert: AlertItem; onDismiss: (id: number) => void }> = ({ alert, onDismiss }) => {
  const { isMobile } = useResponsive()
  const severityColors: Record<string, { bg: string; label: string }> = { 
    critical: { bg: '#ef4444', label: '긴급' }, 
    high: { bg: '#f97316', label: '높음' }, 
    medium: { bg: '#eab308', label: '보통' }, 
    low: { bg: '#3b82f6', label: '참고' } 
  }
  const severity = severityColors[alert.preset?.severity] || { bg: '#64748b', label: '알림' }
  
  return (
    <div style={{ background: `${severity.bg}15`, border: `1px solid ${severity.bg}30`, borderRadius: isMobile ? 12 : 14, padding: isMobile ? 14 : 16, marginBottom: 10, borderLeft: `4px solid ${severity.bg}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: isMobile ? 18 : 20 }}>{alert.preset?.icon || '🔔'}</span>
            <span style={{ fontSize: isMobile ? 13 : 14, fontWeight: 700, color: severity.bg }}>{alert.preset?.name || '알림'}</span>
            <span style={{ fontSize: 10, fontWeight: 600, color: '#fff', background: severity.bg, padding: '2px 8px', borderRadius: 4 }}>{severity.label}</span>
          </div>
          <div style={{ fontSize: isMobile ? 15 : 16, fontWeight: 600, color: '#fff', marginBottom: 6 }}>{alert.stockName}</div>
          <div style={{ fontSize: isMobile ? 13 : 14, color: '#e2e8f0', lineHeight: 1.4 }}>{alert.message}</div>
        </div>
        <button onClick={() => onDismiss(alert.id)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 8, padding: isMobile ? '10px 16px' : '8px 14px', color: '#fff', fontSize: 13, cursor: 'pointer', marginLeft: 8 }}>확인</button>
      </div>
    </div>
  )
}

// ============================================
// 매도법 가이드
// ============================================
const SellMethodGuide: React.FC = () => {
  const { isMobile } = useResponsive()
  const [expandedStage, setExpandedStage] = useState<string | null>(null)
  
  const methodDescriptions: Record<string, string> = {
    candle3: '최근 양봉의 50% 이상을 덮는 음봉 발생시 절반 매도, 100% 덮으면 전량 매도',
    stopLoss: '매수가 대비 설정한 손실률(-3~-5%)에 도달하면 기계적으로 손절',
    twoThird: '최고 수익 대비 1/3이 빠지면 남은 2/3 수익이라도 확보하여 익절',
    maSignal: '이동평균선을 하향 돌파하거나, 이평선이 저항선으로 작용할 때 매도',
    volumeZone: '상단 매물대(저항대)에서 주가가 하락 반전할 때 매도',
    trendline: '지지선을 깨고 하락하거나, 저항선 돌파 실패 시 매도',
    fundamental: '실적 악화, 업황 반전 등 기업 펀더멘털에 변화가 생길 때',
    cycle: '금리 고점 근처(4-5단계)에서 시장 전체 매도 관점 유지'
  }
  
  return (
    <div style={{ background: 'linear-gradient(145deg,#1e293b,#0f172a)', borderRadius: 14, padding: isMobile ? 14 : 16, border: '1px solid rgba(255,255,255,0.08)', marginBottom: 12 }}>
      <h3 style={{ fontSize: isMobile ? 14 : 15, fontWeight: 600, color: '#fff', margin: '0 0 12px' }}>📚 수익 단계별 매도법</h3>
      
      {Object.entries(PROFIT_STAGES).map(([key, stage]) => (
        <div key={key} style={{ marginBottom: 8 }}>
          <div 
            onClick={() => setExpandedStage(expandedStage === key ? null : key)}
            style={{ padding: isMobile ? 12 : 14, background: stage.color + '10', borderRadius: expandedStage === key ? '10px 10px 0 0' : 10, borderLeft: `4px solid ${stage.color}`, cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
          >
            <div>
              <div style={{ fontSize: isMobile ? 13 : 14, fontWeight: 600, color: stage.color }}>{stage.label}</div>
              <div style={{ fontSize: isMobile ? 11 : 12, color: '#94a3b8', marginTop: 2 }}>수익률 {stage.range} · {stage.methods.length}개 매도법</div>
            </div>
            <span style={{ color: '#64748b', fontSize: 14, transform: expandedStage === key ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>▼</span>
          </div>
          
          {expandedStage === key && (
            <div style={{ padding: isMobile ? 12 : 14, background: 'rgba(0,0,0,0.2)', borderRadius: '0 0 10px 10px', borderLeft: `4px solid ${stage.color}50` }}>
              {stage.methods.map(methodId => { 
                const method = SELL_PRESETS[methodId]
                if (!method) return null
                return (
                  <div key={methodId} style={{ marginBottom: 10, paddingBottom: 10, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 16 }}>{method.icon}</span>
                      <span style={{ fontSize: isMobile ? 12 : 13, fontWeight: 600, color: '#fff' }}>{method.name}</span>
                    </div>
                    <p style={{ fontSize: isMobile ? 11 : 12, color: '#94a3b8', margin: 0, lineHeight: 1.5, paddingLeft: 24 }}>
                      {methodDescriptions[methodId] || method.description}
                    </p>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      ))}
      
      {!expandedStage && (
        <div style={{ marginTop: 12, padding: 10, background: 'rgba(59,130,246,0.1)', borderRadius: 8, fontSize: isMobile ? 11 : 12, color: '#60a5fa' }}>
          💡 각 단계를 탭하면 상세 매도법을 확인할 수 있습니다
        </div>
      )}
    </div>
  )
}

// ============================================
// 종목 추가/수정 모달
// ============================================
const StockModal: React.FC<{
  stock?: Position | null
  onSave: (stock: Position) => void
  onClose: () => void
}> = ({ stock, onSave, onClose }) => {
  const { isMobile } = useResponsive()
  const [form, setForm] = useState<Partial<Position>>(stock || { name: '', code: '', buyPrice: 0, quantity: 0, selectedPresets: ['candle3', 'stopLoss'], presetSettings: { stopLoss: { value: -5 }, maSignal: { value: 20 } } })
  const [query, setQuery] = useState(stock?.name || '')
  const [results, setResults] = useState<Stock[]>([])
  const [showResults, setShowResults] = useState(false)
  const [stockFound, setStockFound] = useState(!!stock)

  const handleSearch = (q: string) => {
    setQuery(q)
    if (q.trim()) {
      const found = searchStocks(q)
      setResults(found)
      setShowResults(found.length > 0)
      const exact = findExactStock(q)
      if (exact) {
        setForm(f => ({ ...f, name: exact.name, code: exact.code }))
        setStockFound(true)
      } else {
        setStockFound(false)
      }
    } else {
      setResults([])
      setShowResults(false)
      setStockFound(false)
    }
  }

  const selectStock = (s: Stock) => {
    setForm(f => ({ ...f, name: s.name, code: s.code }))
    setQuery(s.name)
    setShowResults(false)
    setStockFound(true)
  }

  const togglePreset = (id: string) => {
    const current = form.selectedPresets || []
    setForm(f => ({ ...f, selectedPresets: current.includes(id) ? current.filter(p => p !== id) : [...current, id] }))
  }

  const handleSave = () => {
    if (!form.name || !form.code || !form.buyPrice || !form.quantity) {
      alert('모든 필수 항목을 입력해주세요.')
      return
    }
    onSave({ ...form, id: stock?.id || Date.now(), buyPrice: Number(form.buyPrice), quantity: Number(form.quantity), highestPrice: Number(form.buyPrice) } as Position)
  }

  return (
    <div onClick={e => e.target === e.currentTarget && onClose()} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: isMobile ? 'flex-end' : 'center', justifyContent: 'center', zIndex: 1000, padding: isMobile ? 0 : 20 }}>
      <div style={{ background: 'linear-gradient(145deg,#1e293b,#0f172a)', borderRadius: isMobile ? '20px 20px 0 0' : 20, width: '100%', maxWidth: isMobile ? '100%' : 600, maxHeight: isMobile ? '95vh' : '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', border: '1px solid rgba(255,255,255,0.1)' }}>
        {/* 헤더 */}
        <div style={{ padding: isMobile ? '16px 20px' : '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: isMobile ? 18 : 20, fontWeight: 700, color: '#fff', margin: 0 }}>{stock ? '🔍 종목 수정' : '➕ 새 종목 추가'}</h2>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 10, padding: '8px 16px', color: '#fff', fontSize: 14, cursor: 'pointer' }}>닫기</button>
        </div>
        
        {/* 콘텐츠 */}
        <div style={{ flex: 1, overflow: 'auto', padding: isMobile ? '16px 20px' : '20px 24px' }}>
          {/* 종목 검색 */}
          <div style={{ marginBottom: 16, position: 'relative' }}>
            <label style={{ display: 'block', fontSize: 13, color: '#94a3b8', marginBottom: 8, fontWeight: 500 }}>종목명 또는 종목코드 *</label>
            <input 
              type="text" 
              value={query} 
              onChange={e => handleSearch(e.target.value)} 
              onFocus={() => results.length > 0 && setShowResults(true)} 
              placeholder="예: 삼성전자 또는 005930" 
              style={{ width: '100%', padding: '14px 16px', background: 'rgba(255,255,255,0.05)', border: stockFound ? '2px solid rgba(16,185,129,0.5)' : '1px solid rgba(255,255,255,0.15)', borderRadius: showResults ? '12px 12px 0 0' : 12, color: '#fff', fontSize: 16, outline: 'none', boxSizing: 'border-box' }} 
            />
            {showResults && results.length > 0 && (
              <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#1e293b', border: '1px solid rgba(255,255,255,0.15)', borderTop: 'none', borderRadius: '0 0 12px 12px', maxHeight: 200, overflowY: 'auto', zIndex: 100 }}>
                {results.map((result, idx) => (
                  <div key={result.code} onClick={() => selectStock(result)} style={{ padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', borderBottom: idx < results.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                    <span style={{ color: '#fff', fontSize: 15, fontWeight: 500 }}>{result.name}</span>
                    <span style={{ color: '#64748b', fontSize: 13 }}>{result.code} · {result.market}</span>
                  </div>
                ))}
              </div>
            )}
            {stockFound && form.name && (
              <div style={{ marginTop: 8, fontSize: 13, color: '#10b981', display: 'flex', alignItems: 'center', gap: 6 }}>✓ {form.name} ({form.code}) 선택됨</div>
            )}
          </div>
          
          {/* 매수가, 수량 */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 12, marginBottom: 20 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, color: '#94a3b8', marginBottom: 8, fontWeight: 500 }}>매수가 (원) *</label>
              <input type="number" value={form.buyPrice || ''} onChange={e => setForm({ ...form, buyPrice: Number(e.target.value) })} placeholder="72000" style={{ width: '100%', padding: '14px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 12, color: '#fff', fontSize: 16, outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, color: '#94a3b8', marginBottom: 8, fontWeight: 500 }}>수량 (주) *</label>
              <input type="number" value={form.quantity || ''} onChange={e => setForm({ ...form, quantity: Number(e.target.value) })} placeholder="100" style={{ width: '100%', padding: '14px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 12, color: '#fff', fontSize: 16, outline: 'none', boxSizing: 'border-box' }} />
            </div>
          </div>
          
          {/* 매도 조건 선택 */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 15, fontWeight: 600, color: '#fff', display: 'block', marginBottom: 12 }}>📚 매도의 기술 조건 선택</label>
            <div style={{ fontSize: 12, color: '#f59e0b', marginBottom: 12, background: 'rgba(245,158,11,0.1)', padding: '10px 12px', borderRadius: 8, lineHeight: 1.5 }}>
              ⚠️ 아래 기본값은 예시일 뿐입니다. 반드시 본인의 투자 원칙에 따라 수정하십시오.
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {Object.values(SELL_PRESETS).map(preset => {
                const isSelected = (form.selectedPresets || []).includes(preset.id)
                return (
                  <div key={preset.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: isMobile ? 14 : '14px 16px', background: isSelected ? 'rgba(59,130,246,0.1)' : 'rgba(255,255,255,0.02)', border: isSelected ? '1px solid rgba(59,130,246,0.3)' : '1px solid rgba(255,255,255,0.05)', borderRadius: 12, cursor: 'pointer' }} onClick={() => togglePreset(preset.id)}>
                    <div style={{ width: 24, height: 24, borderRadius: 6, background: isSelected ? '#3b82f6' : 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: '#fff', flexShrink: 0 }}>{isSelected && '✓'}</div>
                    <span style={{ fontSize: 20, flexShrink: 0 }}>{preset.icon}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>{preset.name}</div>
                      <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{preset.description}</div>
                    </div>
                    {preset.hasInput && isSelected && (
                      <input 
                        type="number" 
                        value={form.presetSettings?.[preset.id]?.value ?? preset.inputDefault} 
                        onChange={e => { e.stopPropagation(); setForm({ ...form, presetSettings: { ...form.presetSettings, [preset.id]: { value: Number(e.target.value) } } }) }} 
                        onClick={e => e.stopPropagation()} 
                        style={{ width: 70, padding: '8px 10px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 8, color: '#fff', fontSize: 14, outline: 'none', textAlign: 'center', flexShrink: 0 }} 
                      />
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
        
        {/* 하단 버튼 */}
        <div style={{ padding: isMobile ? '16px 20px' : '16px 24px', paddingBottom: isMobile ? 'max(16px, env(safe-area-inset-bottom))' : 16, borderTop: '1px solid rgba(255,255,255,0.08)', background: 'rgba(0,0,0,0.2)' }}>
          <div style={{ padding: '10px 12px', background: 'rgba(234,179,8,0.1)', borderRadius: 8, marginBottom: 12 }}>
            <p style={{ fontSize: 11, color: '#eab308', margin: 0, lineHeight: 1.5 }}>⚠️ 본 알람은 사용자가 직접 선택한 기술적 조건에 따른 단순 정보 제공이며, 투자자문이나 투자권유가 아닙니다.</p>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={onClose} style={{ flex: 1, padding: 16, background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 12, color: '#fff', fontSize: 16, cursor: 'pointer' }}>취소</button>
            <button onClick={handleSave} disabled={!form.name || !form.code || !form.buyPrice || !form.quantity} style={{ flex: 1, padding: 16, background: (form.name && form.code && form.buyPrice && form.quantity) ? 'linear-gradient(135deg,#3b82f6,#1d4ed8)' : 'rgba(100,116,139,0.3)', border: 'none', borderRadius: 12, color: '#fff', fontSize: 16, fontWeight: 600, cursor: (form.name && form.code && form.buyPrice && form.quantity) ? 'pointer' : 'not-allowed', opacity: (form.name && form.code && form.buyPrice && form.quantity) ? 1 : 0.6 }}>
              {stock ? '수정 완료' : '알람 설정 완료'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================
// 업그레이드 팝업
// ============================================
const UpgradePopup: React.FC<{ onUpgrade: () => void; onClose: () => void }> = ({ onUpgrade, onClose }) => {
  const { isMobile } = useResponsive()
  
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: isMobile ? 16 : 40 }}>
      <div style={{ background: 'linear-gradient(145deg,#1e293b,#0f172a)', borderRadius: 20, padding: isMobile ? 20 : 32, maxWidth: 420, width: '100%', maxHeight: '90vh', overflow: 'auto', border: '1px solid rgba(139,92,246,0.3)', boxShadow: '0 0 60px rgba(139,92,246,0.2)' }}>
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{ fontSize: 56, marginBottom: 12 }}>👑</div>
          <h2 style={{ fontSize: isMobile ? 22 : 26, fontWeight: 700, color: '#fff', margin: '0 0 8px' }}>프리미엄 멤버십</h2>
          <p style={{ fontSize: 14, color: '#94a3b8', margin: 0 }}>더 강력한 매도 시그널 도구를 경험하세요</p>
        </div>
        
        <div style={{ background: 'linear-gradient(135deg,rgba(139,92,246,0.15),rgba(99,102,241,0.15))', borderRadius: 12, padding: 16, textAlign: 'center', marginBottom: 20, border: '1px solid rgba(139,92,246,0.3)' }}>
          <div style={{ fontSize: 14, color: '#a78bfa', marginBottom: 4 }}>월 구독료</div>
          <div style={{ fontSize: isMobile ? 32 : 36, fontWeight: 800, color: '#fff' }}>₩5,900<span style={{ fontSize: 14, color: '#94a3b8', fontWeight: 400 }}>/월</span></div>
          <div style={{ fontSize: 12, color: '#10b981', marginTop: 4 }}>🎁 첫 7일 무료 체험</div>
        </div>
        
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 12 }}>✨ 프리미엄 혜택</div>
          {[
            { icon: '🚫', text: '광고 완전 제거', free: '❌', premium: '✅' },
            { icon: '📊', text: '모니터링 종목 수', free: '5개', premium: '20개' },
            { icon: '🤖', text: 'AI 뉴스 분석', free: '❌', premium: '✅' },
            { icon: '📋', text: 'AI 리포트 분석', free: '❌', premium: '✅' },
            { icon: '💬', text: '카카오톡 알림', free: '❌', premium: '✅' },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: 8, marginBottom: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 16 }}>{item.icon}</span>
                <span style={{ fontSize: 13, color: '#e2e8f0' }}>{item.text}</span>
              </div>
              <div style={{ display: 'flex', gap: 16 }}>
                <span style={{ fontSize: 12, color: '#64748b', minWidth: 32, textAlign: 'center' }}>{item.free}</span>
                <span style={{ fontSize: 12, color: '#10b981', minWidth: 32, textAlign: 'center' }}>{item.premium}</span>
              </div>
            </div>
          ))}
        </div>
        
        <button onClick={onUpgrade} style={{ width: '100%', padding: isMobile ? 16 : 18, background: 'linear-gradient(135deg,#8b5cf6,#6366f1)', border: 'none', borderRadius: 12, color: '#fff', fontSize: 16, fontWeight: 700, cursor: 'pointer', marginBottom: 10, boxShadow: '0 4px 20px rgba(139,92,246,0.4)' }}>🎉 7일 무료로 시작하기</button>
        <button onClick={onClose} style={{ width: '100%', padding: 12, background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#64748b', fontSize: 14, cursor: 'pointer' }}>나중에 할게요</button>
        
        <p style={{ fontSize: 11, color: '#64748b', textAlign: 'center', margin: '16px 0 0', lineHeight: 1.5 }}>언제든지 해지 가능 · 자동 결제 · 부가세 포함</p>
      </div>
    </div>
  )
}

// ============================================
// 메인 앱
// ============================================
export default function SellSignalApp() {
  const { isMobile, isTablet, isDesktop } = useResponsive()
  
  const [user, setUser] = useState({ membership: 'free', email: 'demo@test.com' })
  const [positions, setPositions] = useState<Position[]>([
    { id: 1, name: '삼성전자', code: '005930', buyPrice: 71500, quantity: 100, highestPrice: 78200, selectedPresets: ['candle3', 'stopLoss', 'twoThird', 'maSignal'], presetSettings: { stopLoss: { value: -5 }, maSignal: { value: 20 } } },
    { id: 2, name: '현대차', code: '005380', buyPrice: 215000, quantity: 20, highestPrice: 228000, selectedPresets: ['candle3', 'stopLoss', 'maSignal'], presetSettings: { stopLoss: { value: -3 }, maSignal: { value: 20 } } },
    { id: 3, name: '한화에어로스페이스', code: '012450', buyPrice: 285000, quantity: 15, highestPrice: 412000, selectedPresets: ['twoThird', 'maSignal', 'volumeZone', 'fundamental'], presetSettings: { maSignal: { value: 60 } } },
  ])
  const [priceDataMap, setPriceDataMap] = useState<Record<number, PriceData[]>>({})
  const [alerts, setAlerts] = useState<AlertItem[]>([
    { id: 1, stockName: '삼성전자', code: '005930', preset: SELL_PRESETS.stopLoss, message: '손절 기준가(-5%) 근접! 현재 -4.2%', currentPrice: 68500, targetPrice: 67925, timestamp: Date.now() - 300000 },
    { id: 2, stockName: '한화에어로스페이스', code: '012450', preset: SELL_PRESETS.twoThird, message: '최고점 대비 1/3 하락 근접', currentPrice: 365000, targetPrice: 369600, timestamp: Date.now() - 1800000 }
  ])
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
        Object.keys(updated).forEach(id => {
          const data = [...updated[Number(id)]]
          const last = data[data.length - 1]
          const change = (Math.random() - 0.48) * last.close * 0.008
          const newClose = Math.max(last.close + change, last.close * 0.95)
          data[data.length - 1] = { ...last, close: newClose, high: Math.max(last.high, newClose), low: Math.min(last.low, newClose) }
          updated[Number(id)] = data
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

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg,#0a0a0f 0%,#0f172a 50%,#0a0a0f 100%)', color: '#fff', fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif', fontSize: 14, paddingBottom: isMobile ? 70 : 0 }}>
      <style>{`* { box-sizing: border-box; } input::placeholder { color: #475569; } @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.6; } } ::-webkit-scrollbar { width: 6px; height: 6px; } ::-webkit-scrollbar-track { background: rgba(255,255,255,0.05); } ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 3px; } * { -webkit-tap-highlight-color: transparent; }`}</style>

      <ResponsiveHeader alerts={alerts} isPremium={isPremium} onShowUpgrade={() => setShowUpgradePopup(true)} onShowAddModal={() => setShowAddModal(true)} />

      <main style={{ maxWidth: isMobile ? '100%' : isTablet ? 1200 : 1600, margin: '0 auto', padding: isMobile ? '16px 0' : 24 }}>
        <SummaryCards totalCost={totalCost} totalValue={totalValue} totalProfit={totalProfit} totalProfitRate={totalProfitRate} />

        {/* 모바일 탭 네비게이션 */}
        {isMobile && (
          <div style={{ display: 'flex', gap: 8, padding: '0 16px', marginBottom: 16, overflowX: 'auto' }}>
            {[
              { id: 'positions', label: '📊 포지션', count: positions.length },
              { id: 'alerts', label: '🔔 알림', count: alerts.length },
              { id: 'guide', label: '📚 가이드' },
            ].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ padding: '10px 16px', background: activeTab === tab.id ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.05)', border: activeTab === tab.id ? '1px solid rgba(59,130,246,0.4)' : '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: activeTab === tab.id ? '#60a5fa' : '#94a3b8', fontSize: 13, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 6 }}>
                {tab.label}
                {tab.count !== undefined && tab.count > 0 && <span style={{ background: activeTab === tab.id ? '#3b82f6' : 'rgba(255,255,255,0.2)', color: '#fff', padding: '2px 6px', borderRadius: 6, fontSize: 11 }}>{tab.count}</span>}
              </button>
            ))}
          </div>
        )}

        {/* 메인 레이아웃 */}
        <div style={{ display: isMobile ? 'flex' : 'grid', flexDirection: isMobile ? 'column' : undefined, gridTemplateColumns: isMobile ? undefined : isTablet ? '1fr 320px' : '1fr 380px', gap: isMobile ? 16 : 20, padding: isMobile ? '0 16px' : 0 }}>
          {/* 포지션 목록 */}
          <div style={{ display: isMobile && activeTab !== 'positions' ? 'none' : 'block' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h2 style={{ fontSize: isMobile ? 16 : 18, fontWeight: 600, color: '#fff', margin: 0 }}>📊 모니터링 중인 종목</h2>
              <span style={{ fontSize: isMobile ? 11 : 13, color: '#64748b' }}>실시간 조건 감시 중</span>
            </div>
            {positions.map(pos => (
              <PositionCard 
                key={pos.id} 
                position={pos} 
                priceData={priceDataMap[pos.id]} 
                onEdit={setEditingPosition} 
                onDelete={(id) => { setPositions(prev => prev.filter(p => p.id !== id)); setPriceDataMap(prev => { const u = { ...prev }; delete u[id]; return u; }) }} 
              />
            ))}
          </div>

          {/* 우측 사이드바 / 모바일에서는 탭으로 표시 */}
          <div style={{ display: isMobile && activeTab === 'positions' ? 'none' : 'block' }}>
            {/* 알림 영역 */}
            <div style={{ display: isMobile && activeTab !== 'alerts' ? 'none' : 'block', background: 'linear-gradient(145deg,#1e293b,#0f172a)', borderRadius: 14, padding: isMobile ? 14 : 16, border: '1px solid rgba(255,255,255,0.08)', marginBottom: 12, maxHeight: isMobile ? 'none' : 300, overflow: 'auto' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <h2 style={{ fontSize: isMobile ? 15 : 16, fontWeight: 600, color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                  🔔 조건 도달 알림
                  {alerts.length > 0 && <span style={{ background: '#ef4444', color: '#fff', padding: '2px 10px', borderRadius: 10, fontSize: 12, fontWeight: 700 }}>{alerts.length}</span>}
                </h2>
                {alerts.length > 0 && <button onClick={() => setAlerts([])} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 6, padding: '6px 10px', color: '#94a3b8', fontSize: 12, cursor: 'pointer' }}>모두 지우기</button>}
              </div>
              {alerts.length === 0 ? (
                <div style={{ textAlign: 'center', padding: isMobile ? '20px 16px' : '30px 16px' }}>
                  <div style={{ fontSize: 32, marginBottom: 10 }}>✨</div>
                  <div style={{ fontSize: 14, color: '#94a3b8' }}>현재 도달한 조건이 없습니다</div>
                </div>
              ) : (
                alerts.slice(0, 5).map(alert => <AlertCard key={alert.id} alert={alert} onDismiss={(id) => setAlerts(prev => prev.filter(a => a.id !== id))} />)
              )}
            </div>
            
            {/* 매도법 가이드 */}
            <div style={{ display: isMobile && activeTab !== 'guide' ? 'none' : 'block' }}>
              <SellMethodGuide />
            </div>
            
            {/* 면책조항 */}
            {(!isMobile || activeTab === 'guide') && (
              <div style={{ padding: isMobile ? 12 : 14, background: 'rgba(255,255,255,0.02)', borderRadius: 12, borderLeft: '4px solid #64748b' }}>
                <p style={{ fontSize: isMobile ? 11 : 12, color: '#64748b', margin: 0, lineHeight: 1.6 }}>
                  ⚠️ 본 앱은 사용자가 선택한 조건을 모니터링하는 유틸리티 도구입니다. 제공되는 알람은 투자자문이나 투자권유가 아니며, 모든 투자 판단의 책임은 사용자에게 있습니다.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* 모바일 하단 네비게이션 바 */}
      {isMobile && (
        <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'rgba(15,23,42,0.98)', borderTop: '1px solid rgba(255,255,255,0.08)', padding: '8px 16px', paddingBottom: 'max(8px, env(safe-area-inset-bottom))', display: 'flex', justifyContent: 'space-around', zIndex: 100 }}>
          {[
            { id: 'positions', icon: '📊', label: '포지션' },
            { id: 'alerts', icon: '🔔', label: '알림', badge: alerts.length },
            { id: 'guide', icon: '📚', label: '가이드' },
          ].map(item => (
            <button key={item.id} onClick={() => setActiveTab(item.id)} style={{ background: 'none', border: 'none', padding: '6px 12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, cursor: 'pointer', position: 'relative' }}>
              <span style={{ fontSize: 20 }}>{item.icon}</span>
              <span style={{ fontSize: 10, color: activeTab === item.id ? '#60a5fa' : '#64748b', fontWeight: activeTab === item.id ? 600 : 400 }}>{item.label}</span>
              {item.badge !== undefined && item.badge > 0 && <span style={{ position: 'absolute', top: 2, right: 6, background: '#ef4444', color: '#fff', fontSize: 9, fontWeight: 700, padding: '1px 5px', borderRadius: 6, minWidth: 16, textAlign: 'center' }}>{item.badge}</span>}
            </button>
          ))}
        </nav>
      )}

      {/* 모달들 */}
      {showAddModal && <StockModal onSave={(stock) => { setPositions(prev => [...prev, { ...stock, id: Date.now() }]); setShowAddModal(false) }} onClose={() => setShowAddModal(false)} />}
      {editingPosition && <StockModal stock={editingPosition} onSave={(stock) => { setPositions(prev => prev.map(p => p.id === stock.id ? stock : p)); setEditingPosition(null) }} onClose={() => setEditingPosition(null)} />}
      {showUpgradePopup && <UpgradePopup onUpgrade={() => { setUser({ ...user, membership: 'premium' }); setShowUpgradePopup(false) }} onClose={() => setShowUpgradePopup(false)} />}
    </div>
  )
}
