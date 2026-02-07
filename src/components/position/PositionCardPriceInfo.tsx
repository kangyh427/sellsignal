// ============================================
// PositionCardPriceInfo 컴포넌트
// 위치: src/components/position/PositionCardPriceInfo.tsx
// ============================================
// 역할: 매수가/현재가/수량/평가금액 그리드 + 평가손익 바
// 원본: PositionCard.tsx renderPriceInfo() + renderProfitBar() (라인 263~352)

'use client';

import React from 'react';

// ── Props 타입 ──
interface PositionCardPriceInfoProps {
  buyPrice: number;
  currentPrice: number;
  quantity: number;
  totalValue: number;
  profitRate: number;
  profitAmount: number;
  isProfit: boolean;
  isMobile: boolean;
}

const PositionCardPriceInfo: React.FC<PositionCardPriceInfoProps> = ({
  buyPrice,
  currentPrice,
  quantity,
  totalValue,
  profitRate,
  profitAmount,
  isProfit,
  isMobile,
}) => {
  // 가격 정보 그리드 아이템
  const items = [
    { label: '매수가', value: `₩${buyPrice.toLocaleString()}` },
    {
      label: '현재가',
      value: `₩${Math.round(currentPrice).toLocaleString()}`,
      color: isProfit ? '#10b981' : '#ef4444',
    },
    { label: '수량', value: `${quantity}주` },
    { label: '평가금액', value: `₩${Math.round(totalValue).toLocaleString()}` },
  ];

  return (
    <>
      {/* ── 가격 정보 그리드 ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
          gap: '6px',
          marginBottom: '10px',
        }}
      >
        {items.map((item, i) => (
          <div
            key={i}
            style={{
              background: 'rgba(0,0,0,0.2)',
              borderRadius: '6px',
              padding: isMobile ? '10px 8px' : '8px',
            }}
          >
            <div
              style={{
                fontSize: isMobile ? '10px' : '11px',
                color: '#64748b',
                marginBottom: '2px',
              }}
            >
              {item.label}
            </div>
            <div
              style={{
                fontSize: isMobile ? '14px' : '16px',
                fontWeight: '700',
                color: item.color || '#e2e8f0',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {item.value}
            </div>
          </div>
        ))}
      </div>

      {/* ── 평가손익 바 ── */}
      <div
        style={{
          background: isProfit ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
          borderRadius: '8px',
          padding: isMobile ? '12px' : '10px',
          borderLeft: `4px solid ${isProfit ? '#10b981' : '#ef4444'}`,
          marginBottom: '10px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <div
            style={{
              fontSize: isMobile ? '10px' : '11px',
              color: '#64748b',
              marginBottom: '2px',
            }}
          >
            평가손익
          </div>
          <div
            style={{
              fontSize: isMobile ? '18px' : '20px',
              fontWeight: '700',
              color: isProfit ? '#10b981' : '#ef4444',
            }}
          >
            {isProfit ? '+' : ''}₩{Math.round(profitAmount).toLocaleString()}
          </div>
        </div>
        <div
          style={{
            fontSize: isMobile ? '20px' : '24px',
            fontWeight: '800',
            color: isProfit ? '#10b981' : '#ef4444',
            background: isProfit ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)',
            padding: isMobile ? '6px 10px' : '6px 12px',
            borderRadius: '8px',
          }}
        >
          {isProfit ? '+' : ''}
          {profitRate.toFixed(2)}%
        </div>
      </div>
    </>
  );
};

export default PositionCardPriceInfo;
