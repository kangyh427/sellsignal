'use client';
// ============================================
// ResponsiveSummaryCards - 반응형 요약 카드
// 경로: src/components/ResponsiveSummaryCards.tsx
// ============================================
// 세션6 [A2] 모바일 컴팩트 리디자인:
//   - 모바일 금액 축약: 억/만 단위 표시
//   - 2×2 그리드 패딩/폰트 최적화
//   - 배경 투명도 낮춤 (시각적 가벼움)
//   - 아이콘+라벨 한 줄 배치
// ============================================

import React from 'react';
import { useResponsive } from '../hooks/useResponsive';

interface ResponsiveSummaryCardsProps {
  totalCost: number;
  totalValue: number;
  totalProfit: number;
  totalProfitRate: number;
}

// ── [A2] 금액 축약 포맷 (모바일용) ──
const formatCompact = (v: number): string => {
  const abs = Math.abs(v);
  if (abs >= 100000000) return (v / 100000000).toFixed(1) + '억';
  if (abs >= 10000) return (v / 10000).toFixed(0) + '만';
  return v.toLocaleString();
};

const ResponsiveSummaryCards: React.FC<ResponsiveSummaryCardsProps> = ({
  totalCost,
  totalValue,
  totalProfit,
  totalProfitRate,
}) => {
  const { isMobile, isTablet } = useResponsive();

  const cards = [
    {
      icon: '💰',
      label: '총 매수금액',
      value: isMobile ? `₩${formatCompact(totalCost)}` : `₩${Math.round(totalCost).toLocaleString()}`,
      color: '#94a3b8',
    },
    {
      icon: '💎',
      label: '총 평가금액',
      value: isMobile ? `₩${formatCompact(totalValue)}` : `₩${Math.round(totalValue).toLocaleString()}`,
      color: '#60a5fa',
    },
    {
      icon: '📊',
      label: '총 평가손익',
      value: `${totalProfit >= 0 ? '+' : ''}₩${isMobile ? formatCompact(totalProfit) : Math.round(totalProfit).toLocaleString()}`,
      color: totalProfit >= 0 ? '#10b981' : '#ef4444',
    },
    {
      icon: '🎯',
      label: '총 수익률',
      value: `${totalProfitRate >= 0 ? '+' : ''}${totalProfitRate.toFixed(2)}%`,
      color: totalProfitRate >= 0 ? '#10b981' : '#ef4444',
    },
  ];

  // ──────────────────────────────────────────
  // [A2] 모바일: 2×2 컴팩트 그리드
  // ──────────────────────────────────────────
  if (isMobile) {
    return (
      <div style={{
        padding: '12px 16px 8px',
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '8px',
        }}>
          {cards.map((card, i) => (
            <div key={i} style={{
              background: 'rgba(255,255,255,0.04)',
              borderRadius: '12px',
              padding: '12px',
              border: '1px solid rgba(255,255,255,0.06)',
            }}>
              <div style={{
                fontSize: '11px',
                color: '#64748b',
                marginBottom: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}>
                <span style={{ fontSize: '12px' }}>{card.icon}</span>
                {card.label}
              </div>
              <div style={{
                fontSize: '18px',
                fontWeight: '700',
                color: card.color,
                lineHeight: '1.2',
                letterSpacing: '-0.3px',
              }}>{card.value}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ──────────────────────────────────────────
  // 태블릿: 4열 그리드
  // ──────────────────────────────────────────
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
            borderRadius: '12px',
            padding: '14px',
            border: '1px solid rgba(255,255,255,0.06)',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              marginBottom: '5px',
            }}>
              <span style={{ fontSize: '14px' }}>{card.icon}</span>
              <span style={{ fontSize: '11px', color: '#64748b' }}>{card.label}</span>
            </div>
            <div style={{
              fontSize: '18px',
              fontWeight: '700',
              color: card.color,
            }}>{card.value}</div>
          </div>
        ))}
      </div>
    );
  }

  // ──────────────────────────────────────────
  // 데스크톱: 4열 그리드
  // ──────────────────────────────────────────
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '14px',
      marginBottom: '20px',
    }}>
      {cards.map((card, i) => (
        <div key={i} style={{
          background: 'linear-gradient(145deg, #1e293b 0%, #0f172a 100%)',
          borderRadius: '14px',
          padding: '16px',
          border: '1px solid rgba(255,255,255,0.06)',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            marginBottom: '6px',
          }}>
            <span style={{ fontSize: '16px' }}>{card.icon}</span>
            <span style={{ fontSize: '12px', color: '#64748b' }}>{card.label}</span>
          </div>
          <div style={{
            fontSize: '22px',
            fontWeight: '700',
            color: card.color,
          }}>{card.value}</div>
        </div>
      ))}
    </div>
  );
};

export default ResponsiveSummaryCards;
