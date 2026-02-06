'use client';

import React from 'react';
import useResponsive from '../hooks/useResponsive';

// ============================================
// 요약 카드 컴포넌트 — 반응형 (모바일 2x2 / 데스크탑 4열)
// 위치: src/components/SummaryCards.tsx
// ============================================

interface SummaryCardsProps {
  totalCost: number;
  totalValue: number;
  totalProfit: number;
  totalProfitRate: number;
}

const SummaryCards: React.FC<SummaryCardsProps> = ({
  totalCost,
  totalValue,
  totalProfit,
  totalProfitRate,
}) => {
  const { isMobile, isTablet } = useResponsive();

  const cards = [
    {
      label: '총 매수금액',
      value: '₩' + Math.round(totalCost).toLocaleString(),
      icon: '💵',
      color: '#e2e8f0', // 기본 흰색 계열
    },
    {
      label: '총 평가금액',
      value: '₩' + Math.round(totalValue).toLocaleString(),
      icon: '💰',
      color: '#fbbf24', // 골드
    },
    {
      label: '총 평가손익',
      value: (totalProfit >= 0 ? '+' : '') + '₩' + Math.round(Math.abs(totalProfit)).toLocaleString(),
      icon: '📈',
      color: totalProfit >= 0 ? '#10b981' : '#ef4444',
    },
    {
      label: '총 수익률',
      value: (totalProfitRate >= 0 ? '+' : '') + totalProfitRate.toFixed(2) + '%',
      icon: '🎯',
      color: totalProfitRate >= 0 ? '#10b981' : '#ef4444',
    },
  ];

  /* ==============================
   * 모바일: 2x2 그리드 — 카드 경계 명확
   * ============================== */
  if (isMobile) {
    return (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '10px',
          marginBottom: '16px',
          padding: '0 16px',
        }}
      >
        {cards.map((card, i) => (
          <div
            key={i}
            style={{
              /* 핵심: 경계를 눈에 띄게 */
              background: 'linear-gradient(145deg, rgba(30,41,59,0.9) 0%, rgba(15,23,42,0.95) 100%)',
              borderRadius: '12px',
              padding: '14px',
              border: '1px solid rgba(255,255,255,0.12)',
              /* 카드 그림자로 깊이감 */
              boxShadow: '0 2px 8px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)',
            }}
          >
            {/* 라벨 행 */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                marginBottom: '6px',
              }}
            >
              <span style={{ fontSize: '14px' }}>{card.icon}</span>
              <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '500' }}>
                {card.label}
              </span>
            </div>
            {/* 값 */}
            <div
              style={{
                fontSize: '17px',
                fontWeight: '700',
                color: card.color,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                letterSpacing: '-0.3px',
              }}
            >
              {card.value}
            </div>
          </div>
        ))}
      </div>
    );
  }

  /* ==============================
   * 태블릿: 4열 그리드
   * ============================== */
  if (isTablet) {
    return (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '12px',
          marginBottom: '18px',
          padding: '0 20px',
        }}
      >
        {cards.map((card, i) => (
          <div
            key={i}
            style={{
              background: 'linear-gradient(145deg, rgba(30,41,59,0.9) 0%, rgba(15,23,42,0.95) 100%)',
              borderRadius: '12px',
              padding: '14px',
              border: '1px solid rgba(255,255,255,0.12)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '6px' }}>
              <span style={{ fontSize: '14px' }}>{card.icon}</span>
              <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '500' }}>{card.label}</span>
            </div>
            <div style={{ fontSize: '18px', fontWeight: '700', color: card.color }}>
              {card.value}
            </div>
          </div>
        ))}
      </div>
    );
  }

  /* ==============================
   * 데스크탑: 4열 그리드 — 풍부한 스타일
   * ============================== */
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '14px',
        marginBottom: '20px',
      }}
    >
      {cards.map((card, i) => (
        <div
          key={i}
          style={{
            background: 'linear-gradient(145deg, rgba(30,41,59,0.9) 0%, rgba(15,23,42,0.95) 100%)',
            borderRadius: '14px',
            padding: '18px',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.05)',
            transition: 'border-color 0.2s, box-shadow 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.08)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.05)';
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
            <span style={{ fontSize: '16px' }}>{card.icon}</span>
            <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '500' }}>{card.label}</span>
          </div>
          <div
            style={{
              fontSize: '22px',
              fontWeight: '700',
              color: card.color,
              letterSpacing: '-0.5px',
            }}
          >
            {card.value}
          </div>
        </div>
      ))}
    </div>
  );
};

export default SummaryCards;
