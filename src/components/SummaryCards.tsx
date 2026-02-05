'use client'

import React from 'react'
import { useResponsive } from '@/hooks/useResponsive'

interface SummaryCardsProps {
  totalCost: number
  totalValue: number
  totalProfit: number
  totalProfitRate: number
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({
  totalCost,
  totalValue,
  totalProfit,
  totalProfitRate
}) => {
  const { isMobile, isTablet } = useResponsive()

  const cards = [
    { label: '총 매수금액', value: `₩${Math.round(totalCost).toLocaleString()}`, icon: '💵' },
    { label: '총 평가금액', value: `₩${Math.round(totalValue).toLocaleString()}`, icon: '💰' },
    { label: '총 평가손익', value: `${totalProfit >= 0 ? '+' : ''}₩${Math.round(totalProfit).toLocaleString()}`, color: totalProfit >= 0 ? '#10b981' : '#ef4444', icon: '📈' },
    { label: '총 수익률', value: `${totalProfitRate >= 0 ? '+' : ''}${totalProfitRate.toFixed(2)}%`, color: totalProfitRate >= 0 ? '#10b981' : '#ef4444', icon: '🎯' },
  ]

  // 모바일: 2x2 그리드
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

  // 태블릿: 4열 그리드 (작은 패딩)
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

  // 데스크톱: 원본 스타일
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
