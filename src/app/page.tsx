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
              <p style={{ fontSize: isMobile ? '11px' : '13px', color: '#64748b', margin: 0 }}>
                {isPremium ? '👑 프리미엄' : '무료회원'} · 조건 알람 도구
              </p>
            </div>
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            style={{ 
              padding: isMobile ? '10px 14px' : '12px 20px', 
              background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', 
              border: 'none', 
              borderRadius: '10px', 
              color: '#fff', 
              fontSize: isMobile ? '13px' : '14px', 
              fontWeight: '600', 
              cursor: 'pointer' 
            }}
          >+ 종목 추가</button>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main style={{ maxWidth: '1600px', margin: '0 auto', padding: isMobile ? '16px' : '24px' }}>
        {/* 요약 카드 */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', 
          gap: isMobile ? '10px' : '14px', 
          marginBottom: '20px' 
        }}>
          {[
            { label: '총 매수금액', value: '₩' + Math.round(totalCost).toLocaleString(), icon: '💵' },
            { label: '총 평가금액', value: '₩' + Math.round(totalValue).toLocaleString(), icon: '💰' },
            { label: '총 평가손익', value: (totalProfit >= 0 ? '+' : '') + '₩' + Math.round(totalProfit).toLocaleString(), color: totalProfit >= 0 ? '#10b981' : '#ef4444', icon: '📈' },
            { label: '총 수익률', value: (totalProfitRate >= 0 ? '+' : '') + totalProfitRate.toFixed(2) + '%', color: totalProfitRate >= 0 ? '#10b981' : '#ef4444', icon: '🎯' },
          ].map((card, i) => (
            <div key={i} style={{ 
              background: 'linear-gradient(145deg, #1e293b 0%, #0f172a 100%)', 
              borderRadius: isMobile ? '10px' : '12px', 
              padding: isMobile ? '12px' : '16px', 
              border: '1px solid rgba(255,255,255,0.08)' 
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                <span style={{ fontSize: isMobile ? '14px' : '16px' }}>{card.icon}</span>
                <span style={{ fontSize: isMobile ? '10px' : '12px', color: '#64748b' }}>{card.label}</span>
              </div>
              <div style={{ fontSize: isMobile ? '16px' : '22px', fontWeight: '700', color: card.color || '#fff' }}>{card.value}</div>
            </div>
          ))}
        </div>

        {/* 모바일 탭 */}
        {isMobile && (
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', overflowX: 'auto' }}>
            {[
              { id: 'positions', label: '📊 포지션', count: positions.length },
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
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}

        {/* 메인 레이아웃 */}
        <div style={{ 
          display: isMobile ? 'block' : 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1fr 380px',
          gap: '20px'
        }}>
          {/* 포지션 목록 */}
          {(!isMobile || activeTab === 'positions') && (
            <div>
              <h2 style={{ fontSize: isMobile ? '16px' : '18px', fontWeight: '600', marginBottom: '16px' }}>
                📊 모니터링 중인 종목
              </h2>
              {positions.map(pos => {
                const priceData = priceDataMap[pos.id] || []
                const currentPrice = priceData[priceData.length - 1]?.close || pos.buyPrice
                const profitRate = ((currentPrice - pos.buyPrice) / pos.buyPrice) * 100
                const profitAmount = (currentPrice - pos.buyPrice) * pos.quantity
                const isProfit = profitRate >= 0
                const stage = getStage(profitRate)
                const sellPrices = calculateSellPrices(pos, priceData, pos.presetSettings)
                const posVisibleLines = visibleLines[pos.id] || {}

                return (
                  <div key={pos.id} style={{ 
                    background: 'linear-gradient(145deg, #1e293b 0%, #0f172a 100%)', 
                    borderRadius: '14px', 
                    padding: isMobile ? '14px' : '20px', 
                    marginBottom: '14px', 
                    border: '1px solid rgba(255,255,255,0.08)' 
                  }}>
                    {/* 종목 헤더 */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: isMobile ? '16px' : '18px', fontWeight: '700' }}>{pos.name}</span>
                        <span style={{ background: 'rgba(59,130,246,0.2)', color: '#60a5fa', padding: '4px 10px', borderRadius: '5px', fontSize: '12px' }}>{pos.code}</span>
                        <span style={{ background: stage.color + '20', color: stage.color, padding: '4px 10px', borderRadius: '5px', fontSize: '12px' }}>{stage.label}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button onClick={() => setEditingPosition(pos)} style={{ background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '6px', padding: '8px 12px', color: '#94a3b8', fontSize: '12px', cursor: 'pointer' }}>수정</button>
                        <button onClick={() => handleDeletePosition(pos.id)} style={{ background: 'rgba(239,68,68,0.15)', border: 'none', borderRadius: '6px', padding: '8px 12px', color: '#ef4444', fontSize: '12px', cursor: 'pointer' }}>삭제</button>
                      </div>
                    </div>

                    {/* 메인 콘텐츠: 정보 + 차트 */}
                    <div style={{ display: isMobile ? 'block' : 'grid', gridTemplateColumns: '1fr 280px', gap: '16px' }}>
                      {/* 왼쪽: 가격 정보 */}
                      <div>
                        {/* 가격 그리드 */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '12px' }}>
                          {[
                            { label: '매수가', value: '₩' + pos.buyPrice.toLocaleString() },
                            { label: '현재가', value: '₩' + Math.round(currentPrice).toLocaleString(), color: isProfit ? '#10b981' : '#ef4444' },
                            { label: '수량', value: pos.quantity + '주' },
                            { label: '평가손익', value: (isProfit ? '+' : '') + '₩' + Math.round(profitAmount).toLocaleString(), color: isProfit ? '#10b981' : '#ef4444' },
                          ].map((item, i) => (
                            <div key={i} style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '8px', padding: '10px' }}>
                              <div style={{ fontSize: '10px', color: '#64748b', marginBottom: '4px' }}>{item.label}</div>
                              <div style={{ fontSize: isMobile ? '12px' : '14px', fontWeight: '600', color: item.color || '#fff' }}>{item.value}</div>
                            </div>
                          ))}
                        </div>

                        {/* 수익률 배너 */}
                        <div style={{ 
                          background: isProfit ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', 
                          borderRadius: '8px', 
                          padding: '12px', 
                          borderLeft: '4px solid ' + (isProfit ? '#10b981' : '#ef4444'),
                          marginBottom: '12px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}>
                          <div>
                            <div style={{ fontSize: '11px', color: '#64748b' }}>평가손익</div>
                            <div style={{ fontSize: '18px', fontWeight: '700', color: isProfit ? '#10b981' : '#ef4444' }}>
                              {isProfit ? '+' : ''}₩{Math.round(profitAmount).toLocaleString()}
                            </div>
                          </div>
                          <div style={{ 
                            fontSize: '22px', 
                            fontWeight: '800', 
                            color: isProfit ? '#10b981' : '#ef4444',
                            background: isProfit ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)',
                            padding: '6px 12px',
                            borderRadius: '8px'
                          }}>
                            {isProfit ? '+' : ''}{profitRate.toFixed(2)}%
                          </div>
                        </div>

                        {/* 적용된 매도법 */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                          {pos.selectedPresets.map(presetId => {
                            const preset = SELL_PRESETS[presetId]
                            if (!preset) return null
                            return (
                              <span key={presetId} style={{ 
                                background: preset.color + '20', 
                                color: preset.color, 
                                padding: '4px 10px', 
                                borderRadius: '6px', 
                                fontSize: '11px',
                                fontWeight: '500'
                              }}>
                                {preset.icon} {preset.name.replace(' 매도법', '')}
                              </span>
                            )
                          })}
                        </div>
                      </div>

                      {/* 오른쪽: 캔들 차트 */}
                      {!isMobile && priceData.length > 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <CandleChart 
                            data={priceData.slice(-40)} 
                            width={270} 
                            height={200} 
                            buyPrice={pos.buyPrice} 
                            sellPrices={sellPrices}
                            visibleLines={posVisibleLines}
                          />
                          <div style={{ textAlign: 'center', marginTop: '4px', fontSize: '11px', color: '#64748b' }}>
                            실시간 차트 (3초마다 업데이트)
                          </div>
                        </div>
                      )}
                    </div>

                    {/* 모바일 차트 토글 */}
                    {isMobile && priceData.length > 0 && (
                      <details style={{ marginTop: '12px' }}>
                        <summary style={{ 
                          padding: '10px', 
                          background: 'rgba(59,130,246,0.1)', 
                          border: '1px solid rgba(59,130,246,0.3)', 
                          borderRadius: '8px', 
                          color: '#60a5fa', 
                          fontSize: '13px', 
                          cursor: 'pointer',
                          listStyle: 'none'
                        }}>
                          📊 차트 보기
                        </summary>
                        <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'center' }}>
                          <CandleChart 
                            data={priceData.slice(-30)} 
                            width={Math.min(320, window.innerWidth - 80)} 
                            height={200} 
                            buyPrice={pos.buyPrice} 
                            sellPrices={sellPrices}
                            visibleLines={posVisibleLines}
                          />
                        </div>
                      </details>
                    )}
                  </div>
                )
              })}

              {positions.length === 0 && (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '60px 20px', 
                  background: 'linear-gradient(145deg, #1e293b 0%, #0f172a 100%)',
                  borderRadius: '14px',
                  border: '1px solid rgba(255,255,255,0.08)'
                }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
                  <h3 style={{ fontSize: '18px', color: '#fff', marginBottom: '8px' }}>모니터링 중인 종목이 없습니다</h3>
                  <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '20px' }}>종목을 추가하여 매도 조건을 설정하세요</p>
                  <button 
                    onClick={() => setShowAddModal(true)}
                    style={{ 
                      padding: '12px 24px', 
                      background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', 
                      border: 'none', 
                      borderRadius: '10px', 
                      color: '#fff', 
                      fontSize: '14px', 
                      fontWeight: '600', 
                      cursor: 'pointer' 
                    }}
                  >+ 첫 종목 추가하기</button>
                </div>
              )}
            </div>
          )}

          {/* 사이드바: 시장 분석 + 가이드 */}
          {(!isMobile || activeTab === 'market' || activeTab === 'guide') && (
            <div>
              {/* 코스톨라니 달걀 */}
              {(!isMobile || activeTab === 'market') && (
                <div style={{ 
                  background: 'linear-gradient(145deg, #1e293b 0%, #0f172a 100%)', 
                  borderRadius: '14px', 
                  padding: '16px', 
                  marginBottom: '16px',
                  border: '1px solid rgba(255,255,255,0.08)' 
                }}>
                  <h3 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '16px' }}>
                    🥚 코스톨라니 달걀 - 경기순환
                  </h3>
                  <div style={{ 
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    padding: '16px',
                    background: 'rgba(239,68,68,0.1)',
                    borderRadius: '12px',
                    border: '1px solid rgba(239,68,68,0.3)'
                  }}>
                    <div style={{ 
                      width: '50px', 
                      height: '50px', 
                      borderRadius: '50%', 
                      background: '#ef4444',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '20px',
                      fontWeight: '700',
                      color: '#fff',
                      flexShrink: 0
                    }}>4</div>
                    <div>
                      <div style={{ fontSize: '16px', fontWeight: '700', color: '#ef4444' }}>
                        {SAMPLE_MARKET_CYCLE.phaseName}
                      </div>
                      <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
                        {SAMPLE_MARKET_CYCLE.description}
                      </div>
                      <div style={{ fontSize: '13px', fontWeight: '600', color: '#ef4444', marginTop: '8px' }}>
                        🔴 권장: {SAMPLE_MARKET_CYCLE.recommendation}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 매도법 가이드 */}
              {(!isMobile || activeTab === 'guide') && (
                <div style={{ 
                  background: 'linear-gradient(145deg, #1e293b 0%, #0f172a 100%)', 
                  borderRadius: '14px', 
                  padding: '16px',
                  border: '1px solid rgba(255,255,255,0.08)' 
                }}>
                  <h3 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '16px' }}>
                    📚 수익 단계별 매도법
                  </h3>
                  {Object.entries(PROFIT_STAGES).map(([key, stage]) => (
                    <div key={key} style={{ 
                      padding: '12px', 
                      background: stage.color + '15', 
                      borderRadius: '10px', 
                      borderLeft: '4px solid ' + stage.color,
                      marginBottom: '10px'
                    }}>
                      <div style={{ fontSize: '13px', fontWeight: '600', color: stage.color }}>
                        {stage.label} ({stage.range})
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '8px' }}>
                        {stage.methods.map(methodId => {
                          const method = SELL_PRESETS[methodId]
                          if (!method) return null
                          return (
                            <span key={methodId} style={{ 
                              background: 'rgba(255,255,255,0.1)', 
                              padding: '3px 6px', 
                              borderRadius: '4px', 
                              fontSize: '10px',
                              color: '#e2e8f0'
                            }}>
                              {method.icon} {method.name.replace(' 매도법', '')}
                            </span>
                          )
                        })}
                      </div>
                    </div>
                  ))}
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
        }}>
          {[
            { id: 'positions', icon: '📊', label: '포지션' },
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
              }}
            >
              <span style={{ fontSize: '20px' }}>{item.icon}</span>
              <span style={{ 
                fontSize: '10px', 
                color: activeTab === item.id ? '#60a5fa' : '#64748b',
                fontWeight: activeTab === item.id ? '600' : '400',
              }}>{item.label}</span>
            </button>
          ))}
        </nav>
      )}

      {/* 종목 추가 모달 */}
      {showAddModal && (
        <StockModal 
          onSave={handleSavePosition}
          onClose={() => setShowAddModal(false)}
        />
      )}

      {/* 종목 수정 모달 */}
      {editingPosition && (
        <StockModal 
          stock={editingPosition}
          onSave={handleSavePosition}
          onClose={() => setEditingPosition(null)}
        />
      )}
    </div>
  )
}
