'use client';
// ============================================
// ResponsiveSummaryCards - 포트폴리오 요약 카드
// 경로: src/components/ResponsiveSummaryCards.tsx
// ============================================
// 모바일: 2×2 컴팩트 그리드
// 데스크톱/태블릿: 4열 그리드

import React from 'react';
import { formatCompact } from '@/utils';

interface ResponsiveSummaryCardsProps {
  totalCost: number;
  totalValue: number;
  totalProfit: number;
  totalProfitRate: number;
  isMobile: boolean;
  isTablet: boolean;
}

const ResponsiveSummaryCards: React.FC<ResponsiveSummaryCardsProps> = ({
  totalCost, totalValue, totalProfit, totalProfitRate,
  isMobile, isTablet,
}) => {
  const cards = [
    { icon: '💰', label: '총 매수금액', value: `₩${formatCompact(totalCost)}`, color: '#94a3b8' },
    { icon: '💎', label: '총 평가금액', value: `₩${formatCompact(totalValue)}`, color: '#60a5fa' },
    {
      icon: '📊', label: '총 평가손익',
      value: `${totalProfit >= 0 ? '+' : ''}₩${formatCompact(totalProfit)}`,
      color: totalProfit >= 0 ? '#10b981' : '#ef4444',
    },
    {
      icon: '🎯', label: '총 수익률',
      value: `${totalProfitRate >= 0 ? '+' : ''}${totalProfitRate.toFixed(2)}%`,
      color: totalProfitRate >= 0 ? '#10b981' : '#ef4444',
    },
  ];

  // ── 모바일: 2×2 컴팩트 ──
  if (isMobile) {
    return (
      <div style={{ padding: '12px 16px 8px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          {cards.map((c, i) => (
            <div
              key={i}
              style={{
                background: 'rgba(255,255,255,0.04)',
                borderRadius: '12px',
                padding: '12px',
                border: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <div
                style={{
                  fontSize: '11px', color: '#64748b',
                  marginBottom: '4px',
                  display: 'flex', alignItems: 'center', gap: '4px',
                }}
              >
                <span style={{ fontSize: '12px' }}>{c.icon}</span>
                {c.label}
              </div>
              <div
                style={{
                  fontSize: '18px', fontWeight: '700',
                  color: c.color,
                  lineHeight: '1.2',
                  letterSpacing: '-0.3px',
                }}
              >
                {c.value}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── 데스크톱/태블릿: 4열 그리드 ──
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '12px',
        padding: isTablet ? '0 20px 16px' : '0 0 20px',
      }}
    >
      {cards.map((c, i) => (
        <div
          key={i}
          style={{
            background: 'linear-gradient(145deg, #1e293b, #0f172a)',
            borderRadius: '14px',
            padding: '16px',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <div
            style={{
              fontSize: '12px', color: '#64748b',
              marginBottom: '6px',
              display: 'flex', alignItems: 'center', gap: '6px',
            }}
          >
            <span>{c.icon}</span> {c.label}
          </div>
          <div style={{ fontSize: '22px', fontWeight: '700', color: c.color }}>
            {c.value}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ResponsiveSummaryCards;
