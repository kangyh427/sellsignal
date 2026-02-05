'use client'

import React, { useState } from 'react'
import { useResponsive } from '@/hooks/useResponsive'
import { Position, PriceData } from '@/types'
import { SELL_PRESETS, PROFIT_STAGES } from '@/constants'
import { calculateSellPrices } from '@/utils'
import { CandleChart } from './CandleChart'

interface PositionCardProps {
  position: Position
  priceData?: PriceData[]
  onEdit: (p: Position) => void
  onDelete: (id: number) => void
}

export const PositionCard: React.FC<PositionCardProps> = ({
  position,
  priceData,
  onEdit,
  onDelete
}) => {
  const { isMobile, isTablet, width } = useResponsive()
  const [visibleLines, setVisibleLines] = useState<Record<string, boolean>>({
    candle3: true,
    stopLoss: true,
    twoThird: true,
    maSignal: true
  })
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
  const naverStockUrl = `https://finance.naver.com/item/main.naver?code=${position.code}`
  const naverChartUrl = `https://finance.naver.com/item/fchart.naver?code=${position.code}`

  // 차트 크기 계산
  const getChartSize = () => {
    if (isMobile) return { width: Math.min(320, width - 48), height: 200 }
    if (isTablet) return { width: 240, height: 240 }
    return { width: 270, height: 280 }
  }
  const chartSize = getChartSize()

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
              { label: '매수가', value: `₩${position.buyPrice.toLocaleString()}` },
              { label: '현재가', value: `₩${Math.round(currentPrice).toLocaleString()}`, color: isProfit ? '#10b981' : '#ef4444' },
              { label: '수량', value: `${position.quantity}주` },
              { label: '평가금액', value: `₩${Math.round(totalValue).toLocaleString()}` }
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
            borderLeft: `4px solid ${isProfit ? '#10b981' : '#ef4444'}`,
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
                const preset = SELL_PRESETS[presetId]
                if (!preset) return null

                let priceText = '-'
                let priceColor = '#94a3b8'
                const hasChartLine = ['candle3', 'stopLoss', 'twoThird', 'maSignal'].includes(presetId)

                if (presetId === 'stopLoss' && sellPrices.stopLoss) {
                  priceText = `₩${sellPrices.stopLoss.toLocaleString()}`
                  priceColor = currentPrice <= sellPrices.stopLoss ? '#ef4444' : '#94a3b8'
                }
                else if (presetId === 'twoThird' && sellPrices.twoThird) {
                  priceText = `₩${sellPrices.twoThird.toLocaleString()}`
                  priceColor = currentPrice <= sellPrices.twoThird ? '#f59e0b' : '#94a3b8'
                }
                else if (presetId === 'maSignal' && sellPrices.maSignal) {
                  priceText = `₩${sellPrices.maSignal.toLocaleString()}`
                  priceColor = currentPrice < sellPrices.maSignal ? '#f59e0b' : '#94a3b8'
                }
                else if (presetId === 'candle3' && sellPrices.candle3_50) {
                  priceText = `₩${sellPrices.candle3_50.toLocaleString()}`
                }

                return (
                  <div key={presetId} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: isMobile ? '10px' : '8px 10px',
                    background: 'rgba(255,255,255,0.03)',
                    borderRadius: '6px',
                    borderLeft: `3px solid ${preset.color}`
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {hasChartLine && !isMobile ? (
                        <input
                          type="checkbox"
                          checked={visibleLines[presetId] || false}
                          onChange={() => setVisibleLines(prev => ({ ...prev, [presetId]: !prev[presetId] }))}
                          style={{ width: '16px', height: '16px', accentColor: preset.color, cursor: 'pointer' }}
                        />
                      ) : (
                        <div style={{ width: isMobile ? '0' : '16px' }} />
                      )}
                      <span style={{ fontSize: isMobile ? '12px' : '14px', color: '#e2e8f0' }}>
                        {preset.icon} {isMobile ? preset.name.replace(' 매도법', '') : preset.name}
                      </span>
                    </div>
                    <span style={{ fontSize: isMobile ? '13px' : '15px', fontWeight: '700', color: priceColor }}>{priceText}</span>
                  </div>
                )
              })}
            </div>
            {!isMobile && (
              <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px', textAlign: 'center' }}>
                체크박스 선택 시 차트에 가격선 표시
              </div>
            )}
          </div>
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
                <div style={{ textAlign: 'center', marginTop: '4px', fontSize: '11px', color: '#64748b' }}>
                  탭하여 네이버 차트 열기
                </div>
              </div>
            )}
          </div>
        ) : (
          priceData && (
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
              <div style={{ textAlign: 'center', marginTop: '4px', fontSize: '12px', color: '#64748b' }}>
                클릭 → 네이버 증권 차트
              </div>
            </div>
          )
        )}
      </div>
    </div>
  )
}
