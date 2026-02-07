'use client';
// ============================================
// ResponsiveSummaryCards - 반응형 요약 카드
// 세션1 분리: 총 매수/평가/손익/수익률 표시
// ============================================
// 개선사항:
// - 모바일 레이블 12px → 13px (가독성)
// - 모바일 값 17px → 18px (시인성)
// - 태블릿 레이블 11px → 13px (진단서 P1)
// - 카드 간 여백 통일 12px (진단서 P7)
// - 카드 경계선 강화 0.08 → 0.15
// ============================================

import React from 'react';
import { useResponsive } from '../hooks/useResponsive';

interface SummaryCardsProps {
  totalCost: number;
  totalValue: number;
  totalProfit: number;
  totalProfitRate: number;
}

const ResponsiveSummaryCards: React.FC<SummaryCardsProps> = ({
  totalCost,
  totalValue,
  totalProfit,
  totalProfitRate,
}) => {
  const { isMobile, isTablet } = useResponsive();

  const cards = [
    { label: '총 매수금액', value: '₩' + Math.round(totalCost).toLocaleString(), icon: '💵' },
    { label: '총 평가금액', value: '₩' + Math.round(totalValue).toLocaleString(), icon: '💰' },
    {
      label: '총 평가손익',
      value: (totalProfit >= 0 ? '+' : '') + '₩' + Math.round(totalProfit).toLocaleString(),
      color: totalProfit >= 0 ? '#10b981' : '#ef4444',
      icon: '📈',
    },
    {
      label: '총 수익률',
      value: (totalProfitRate >= 0 ? '+' : '') + totalProfitRate.toFixed(2) + '%',
      color: totalProfitRate >= 0 ? '#10b981' : '#ef4444',
      icon: '🎯',
    },
  ];

  // ──────────────────────────────────────────
  // 모바일: 2×2 그리드
  // ──────────────────────────────────────────
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
            background: 'linear-gradient(145deg, #2d3a4f 0%, #1a2332 100%)',
            borderRadius: '12px',
            padding: '14px',
            border: '1px solid rgba(255,255,255,0.15)',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              marginBottom: '8px',
            }}>
              <span style={{ fontSize: '15px' }}>{card.icon}</span>
              <span style={{
                fontSize: '13px',  /* 12px → 13px 개선 */
                color: '#94a3b8',
              }}>{card.label}</span>
            </div>
            <div style={{
              fontSize: '18px',  /* 17px → 18px 개선 */
              fontWeight: '700',
              color: card.color || '#fff',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>{card.value}</div>
          </div>
        ))}
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
            borderRadius: '10px',
            padding: '14px',
            border: '1px solid rgba(255,255,255,0.12)',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              marginBottom: '6px',
            }}>
              <span style={{ fontSize: '14px' }}>{card.icon}</span>
              <span style={{
                fontSize: '13px',  /* 11px → 13px 개선 (P1) */
                color: '#94a3b8',  /* 64748b → 94a3b8 대비 강화 */
              }}>{card.label}</span>
            </div>
            <div style={{
              fontSize: '18px',
              fontWeight: '700',
              color: card.color || '#fff',
            }}>{card.value}</div>
          </div>
        ))}
      </div>
    );
  }

  // ──────────────────────────────────────────
  // 데스크톱: 4열 그리드 (넓은 패딩)
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
          borderRadius: '12px',
          padding: '16px',
          border: '1px solid rgba(255,255,255,0.12)',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            marginBottom: '6px',
          }}>
            <span style={{ fontSize: '16px' }}>{card.icon}</span>
            <span style={{
              fontSize: '13px',
              color: '#94a3b8',
            }}>{card.label}</span>
          </div>
          <div style={{
            fontSize: '22px',
            fontWeight: '700',
            color: card.color || '#fff',
          }}>{card.value}</div>
        </div>
      ))}
    </div>
  );
};

export default ResponsiveSummaryCards;
