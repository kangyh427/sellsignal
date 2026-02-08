'use client';
// ============================================
// ResponsiveSummaryCards - 투자 요약 카드 (4열)
// 경로: src/components/ResponsiveSummaryCards.tsx
// 세션 18A: 17f 시그니처 정확 반영
// ============================================

import React from 'react';
import { formatCompact } from '@/constants';

interface ResponsiveSummaryCardsProps {
  totalCost: number;
  totalValue: number;
  totalProfit: number;
  totalProfitRate: number;
  isMobile: boolean;
  isTablet?: boolean;
}

const ResponsiveSummaryCards: React.FC<ResponsiveSummaryCardsProps> = ({
  totalCost, totalValue, totalProfit, totalProfitRate, isMobile,
}) => {
  const isProfit = totalProfit >= 0;
  const items = [
    { label: '총 투자금', value: `₩${formatCompact(Math.round(totalCost))}` },
    { label: '총 평가금', value: `₩${formatCompact(Math.round(totalValue))}`, color: isProfit ? '#10b981' : '#ef4444' },
    { label: '평가손익', value: `${isProfit ? '+' : ''}₩${formatCompact(Math.round(totalProfit))}`, color: isProfit ? '#10b981' : '#ef4444' },
    { label: '수익률', value: `${isProfit ? '+' : ''}${totalProfitRate.toFixed(2)}%`, color: isProfit ? '#10b981' : '#ef4444' },
  ];

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
      gap: isMobile ? '6px' : '12px',
      padding: isMobile ? '12px 16px' : '0',
      marginBottom: isMobile ? '4px' : '16px',
    }}>
      {items.map((item, i) => (
        <div key={i} style={{
          background: 'linear-gradient(145deg, rgba(30,41,59,0.6), rgba(15,23,42,0.8))',
          borderRadius: '12px', padding: isMobile ? '10px 12px' : '14px 16px',
          border: '1px solid rgba(255,255,255,0.06)',
        }}>
          <div style={{ fontSize: '10px', color: '#64748b', marginBottom: '4px' }}>{item.label}</div>
          <div style={{ fontSize: isMobile ? '15px' : '20px', fontWeight: '700', color: item.color || '#f1f5f9' }}>
            {item.value}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ResponsiveSummaryCards;
