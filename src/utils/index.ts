import { Position, PriceData, Stock } from '@/types'
import { STOCK_LIST } from '@/constants'

// ============================================
// 가격 데이터 생성 (Mock)
// ============================================
export const generateMockPriceData = (basePrice: number, days = 60): PriceData[] => {
  const data: PriceData[] = []
  let price = basePrice

  for (let i = 0; i < days; i++) {
    const change = (Math.random() - 0.47) * basePrice * 0.025
    price = Math.max(price + change, basePrice * 0.7)
    
    const high = price * (1 + Math.random() * 0.02)
    const low = price * (1 - Math.random() * 0.02)
    const open = low + Math.random() * (high - low)
    const close = low + Math.random() * (high - low)
    
    data.push({
      date: new Date(Date.now() - (days - i) * 86400000),
      open,
      high,
      low,
      close,
      volume: Math.floor(Math.random() * 1000000 + 500000)
    })
  }
  
  return data
}

// ============================================
// 종목 검색
// ============================================
export const searchStocks = (query: string): Stock[] => {
  if (!query || query.trim().length === 0) return []
  
  const q = query.trim().toLowerCase()
  return STOCK_LIST.filter(stock => 
    stock.name.toLowerCase().includes(q) || stock.code.includes(q)
  ).slice(0, 10)
}

// ============================================
// 정확한 종목 찾기
// ============================================
export const findExactStock = (query: string): Stock | null => {
  if (!query) return null
  
  return STOCK_LIST.find(stock => 
    stock.name === query || 
    stock.code === query || 
    stock.name.toLowerCase() === query.toLowerCase()
  ) || null
}

// ============================================
// 매도 기준가격 계산
// ============================================
export const calculateSellPrices = (
  position: Position,
  priceData?: PriceData[]
): Record<string, number> => {
  const prices: Record<string, number> = {}
  const settings = position.presetSettings

  // 손절가 계산
  prices.stopLoss = Math.round(
    position.buyPrice * (1 + (settings?.stopLoss?.value || -5) / 100)
  )

  // 2/3 익절가 계산
  if (position.highestPrice) {
    prices.twoThird = Math.round(
      position.highestPrice - (position.highestPrice - position.buyPrice) / 3
    )
  }

  // 이동평균선 계산
  const maPeriod = settings?.maSignal?.value || 20
  if (priceData && priceData.length >= maPeriod) {
    const sum = priceData.slice(-maPeriod).reduce((acc, d) => acc + d.close, 0)
    prices.maSignal = Math.round(sum / maPeriod)
  }

  // 봉 3개 매도법 기준가 (직전 양봉의 50% 지점)
  if (priceData && priceData.length >= 2) {
    const prevCandle = priceData[priceData.length - 2]
    if (prevCandle.close > prevCandle.open) {
      prices.candle3_50 = Math.round(
        prevCandle.close - (prevCandle.close - prevCandle.open) * 0.5
      )
    }
  }

  return prices
}

// ============================================
// D-Day 계산
// ============================================
export const calculateDDay = (dateStr: string): string => {
  const diff = Math.ceil(
    (new Date(dateStr).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  )
  
  if (diff === 0) return 'D-Day'
  if (diff > 0) return `D-${diff}`
  return `D+${Math.abs(diff)}`
}

// ============================================
// 숫자 포맷팅
// ============================================
export const formatNumber = (num: number): string => {
  return Math.round(num).toLocaleString()
}

export const formatCurrency = (num: number): string => {
  return `₩${formatNumber(num)}`
}

export const formatPercent = (num: number, showSign = true): string => {
  const sign = showSign && num >= 0 ? '+' : ''
  return `${sign}${num.toFixed(2)}%`
}

// ============================================
// 수익 단계 판별
// ============================================
export const getProfitStage = (profitRate: number): string => {
  if (profitRate < 0) return 'loss'
  if (profitRate < 5) return 'initial'
  if (profitRate < 10) return 'profit5'
  return 'profit10'
}

// ============================================
// 시간 포맷팅
// ============================================
export const formatTimeAgo = (timestamp: number): string => {
  const diff = Date.now() - timestamp
  const minutes = Math.floor(diff / 60000)
  
  if (minutes < 1) return '방금 전'
  if (minutes < 60) return `${minutes}분 전`
  
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}시간 전`
  
  return '1일 이상'
}
