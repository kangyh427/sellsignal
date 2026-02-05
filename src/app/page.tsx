'use client'

import { useState, useEffect } from 'react'
import { useResponsive } from '@/hooks'
import { CandleChart, StockModal } from '@/components'
import { 
  SELL_PRESETS, 
  PROFIT_STAGES, 
  SAMPLE_MARKET_CYCLE,
  generateMockPriceData,
  calculateSellPrices 
} from '@/lib/constants'

interface Position {
  id: string
  name: string
  code: string
  buyPrice: number
  quantity: number
  highestPrice: number
  selectedPresets: string[]
  presetSettings: Record<string, { value: number }>
}

// 샘플 포지션 데이터
const INITIAL_POSITIONS: Position[] = [
  { 
    id: '1', 
    name: '삼성전자', 
    code: '005930', 
    buyPrice: 71500, 
    quantity: 100, 
    highestPrice: 78200, 
    selectedPresets: ['candle3', 'stopLoss', 'twoThird', 'maSignal'], 
    presetSettings: { stopLoss: { value: -5 }, maSignal: { value: 20 } } 
  },
  { 
    id: '2', 
    name: '현대차', 
    code: '005380', 
    buyPrice: 215000, 
    quantity: 20, 
    highestPrice: 228000, 
    selectedPresets: ['candle3', 'stopLoss', 'maSignal'], 
    presetSettings: { stopLoss: { value: -3 }, maSignal: { value: 20 } } 
  },
  { 
    id: '3', 
    name: '한화에어로스페이스', 
    code: '012450', 
    buyPrice: 285000, 
    quantity: 15, 
    highestPrice: 412000, 
    selectedPresets: ['twoThird', 'maSignal', 'volumeZone', 'fundamental'], 
    presetSettings: { maSignal: { value: 60 } } 
  },
]

export default function HomePage() {
  const { isMobile, isTablet } = useResponsive()
  const [positions, setPositions] = useState<Position[]>(INITIAL_POSITIONS)
  const [priceDataMap, setPriceDataMap] = useState<Record<string, any[]>>({})
  const [activeTab, setActiveTab] = useState('positions')
  const [isPremium] = useState(false)
  
  // 모달 상태
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingPosition, setEditingPosition] = useState<Position | null>(null)
  
  // 차트 라인 표시 상태
  const [visibleLines, setVisibleLines] = useState<Record<string, Record<string, boolean>>>({})

  // 가격 데이터 초기화
  useEffect(() => {
    const newData: Record<string, any[]> = {}
    const newVisibleLines: Record<string, Record<string, boolean>> = {}
    positions.forEach(pos => {
      if (!priceDataMap[pos.id]) {
        newData[pos.id] = generateMockPriceData(pos.buyPrice, 60)
      }
      if (!visibleLines[pos.id]) {
        newVisibleLines[pos.id] = { stopLoss: true, twoThird: true, maSignal: true, candle3: true }
      }
    })
    if (Object.keys(newData).length > 0) {
      setPriceDataMap(prev => ({ ...prev, ...newData }))
    }
    if (Object.keys(newVisibleLines).length > 0) {
      setVisibleLines(prev => ({ ...prev, ...newVisibleLines }))
    }
  }, [positions])

  // 실시간 가격 업데이트
  useEffect(() => {
    const interval = setInterval(() => {
      setPriceDataMap(prev => {
        const updated = { ...prev }
        Object.keys(updated).forEach(id => {
          const data = [...updated[id]]
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
            updated[id] = data
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

  // 종목 추가/수정 핸들러
  const handleSavePosition = (position: Position) => {
    if (editingPosition) {
      setPositions(prev => prev.map(p => p.id === position.id ? position : p))
      setEditingPosition(null)
    } else {
      const newPosition = { ...position, id: Date.now().toString(), highestPrice: position.buyPrice }
      setPositions(prev => [...prev, newPosition])
      setShowAddModal(false)
    }
  }

  // 종목 삭제 핸들러
  const handleDeletePosition = (id: string) => {
    if (confirm('정말 삭제하시겠습니까?')) {
      setPositions(prev => prev.filter(p => p.id !== id))
      setPriceDataMap(prev => {
        const updated = { ...prev }
        delete updated[id]
        return updated
      })
    }
  }

  // 수익 단계 계산
  const getStage = (profitRate: number) => {
    if (profitRate < 0) return { ...PROFIT_STAGES.initial, label: '손실 구간', color: '#ef4444' }
    if (profitRate < 5) return PROFIT_STAGES.initial
    if (profitRate < 10) return PROFIT_STAGES.profit5
    return PROFIT_STAGES.profit10
  }

  return (
    <div style={{ minHeight: '100vh', paddingBottom: isMobile ? '70px' : '0' }}>
      {/* 헤더 */}
      <header style={{ 
        background: 'rgba(15, 23, 42, 0.98)', 
        borderBottom: '1px solid rgba(255,255,255,0.08)', 
        position: 'sticky', 
        top: 0, 
        zIndex: 100,
        backdropFilter: 'blur(10px)',
      }}>
        <div style={{ 
          maxWidth: '1600px',
          margin: '0 auto',
          padding: isMobile ? '12px 16px' : '16px 24px', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ 
              width: isMobile ? '40px' : '52px', 
              height: isMobile ? '40px' : '52px', 
              background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)', 
              borderRadius: isMobile ? '12px' : '16px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              fontSize: isMobile ? '20px' : '28px' 
            }}>📈</div>
            <div>
              <h1 style={{ fontSize: isMobile ? '16px' : '24px', fontWeight: '700', margin: 0 }}>매도의 기술</h1>
              <p style={{ fontSize: isMobile ? '11px' : '13px', color: '#64748b', margin:
