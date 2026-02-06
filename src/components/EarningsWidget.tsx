'use client';

import React from 'react';
import { useResponsive } from '../hooks/useResponsive';
import { EARNINGS_DATA, STOCK_LIST } from '../constants';

// ============================================
// 타입 정의
// ============================================
interface Position {
  id: number;
  name: string;
  code: string;
  buyPrice: number;
  quantity: number;
  highestPrice?: number;
  selectedPresets?: string[];
  presetSettings?: Record<string, { value: number }>;
}

interface EarningsWidgetProps {
  position: Position;
  isPremium: boolean;
  onShowAINews: () => void;
  onShowAIReport: () => void;
}

// D-Day 계산 유틸
const calculateDDay = (dateStr: string): string => {
  const diff = Math.ceil((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (diff === 0) return 'D-Day';
  if (diff > 0) return `D-${diff}`;
  return `D+${Math.abs(diff)}`;
};

// ============================================
// EarningsWidget 컴포넌트
// ============================================
const EarningsWidget: React.FC<EarningsWidgetProps> = ({
  position,
  isPremium,
  onShowAINews,
  onShowAIReport,
}) => {
  const { isMobile } = useResponsive();

  const earnings = EARNINGS_DATA[position.code];
  const stockInfo = STOCK_LIST.find((s: { code: string }) => s.code === position.code);
  if (!earnings || !stockInfo) return null;

  const dDay = calculateDDay(earnings.nextEarningsDate);
  const naverNewsUrl = `https://finance.naver.com/item/news.naver?code=${position.code}`;

  // 지표 데이터 배열
  const metrics = [
    {
      label: '실적발표',
      value: dDay,
      color: dDay.startsWith('D-') && parseInt(dDay.slice(2)) <= 14 ? '#f59e0b' : '#e2e8f0',
    },
    {
      label: '서프라이즈',
      value: `${earnings.lastEarnings.surprise > 0 ? '+' : ''}${earnings.lastEarnings.surprise}%`,
      color: earnings.lastEarnings.surprise > 0 ? '#10b981' : '#ef4444',
    },
    {
      label: 'PER',
      value: String(stockInfo.per),
      color: stockInfo.per < stockInfo.sectorPer ? '#10b981' : '#ef4444',
    },
    {
      label: 'PBR',
      value: String(stockInfo.pbr),
      color: stockInfo.pbr < stockInfo.sectorPbr ? '#10b981' : '#ef4444',
    },
  ];

  // 액션 버튼 정의
  const actionButtons = [
    {
      type: 'link' as const,
      href: naverNewsUrl,
      label: '📰 뉴스',
      bg: 'rgba(59,130,246,0.1)',
      border: '1px solid rgba(59,130,246,0.3)',
      color: '#60a5fa',
    },
    {
      type: 'button' as const,
      onClick: onShowAINews,
      label: `🤖 AI뉴스${!isPremium ? '' : ''}`,
      crown: !isPremium,
      bg: isPremium
        ? 'linear-gradient(135deg, rgba(139,92,246,0.2) 0%, rgba(59,130,246,0.2) 100%)'
        : 'rgba(100,116,139,0.1)',
      border: isPremium
        ? '1px solid rgba(139,92,246,0.4)'
        : '1px solid rgba(100,116,139,0.3)',
      color: isPremium ? '#a78bfa' : '#64748b',
    },
    {
      type: 'button' as const,
      onClick: onShowAIReport,
      label: `📑 리포트${!isPremium ? '' : ''}`,
      crown: !isPremium,
      bg: isPremium
        ? 'linear-gradient(135deg, rgba(16,185,129,0.2) 0%, rgba(6,182,212,0.2) 100%)'
        : 'rgba(100,116,139,0.1)',
      border: isPremium
        ? '1px solid rgba(16,185,129,0.4)'
        : '1px solid rgba(100,116,139,0.3)',
      color: isPremium ? '#34d399' : '#64748b',
    },
  ];

  return (
    <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '8px', padding: isMobile ? '8px' : '10px' }}>
      {/* 지표 그리드 */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
          gap: '6px',
          marginBottom: '8px',
        }}
      >
        {metrics.map((item, i) => (
          <div
            key={i}
            style={{
              background: 'rgba(255,255,255,0.03)',
              borderRadius: '4px',
              padding: '6px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '9px', color: '#64748b', marginBottom: '2px' }}>{item.label}</div>
            <div
              style={{
                fontSize: isMobile ? '12px' : '14px',
                fontWeight: '700',
                color: item.color,
              }}
            >
              {item.value}
            </div>
          </div>
        ))}
      </div>

      {/* 액션 버튼 3개 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
        {actionButtons.map((btn, i) => {
          const commonStyle: React.CSSProperties = {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: btn.type === 'link' ? '4px' : '2px',
            background: btn.bg,
            border: btn.border,
            borderRadius: '6px',
            color: btn.color,
            fontSize: isMobile ? (btn.type === 'link' ? '11px' : '10px') : (btn.type === 'link' ? '12px' : '11px'),
            fontWeight: '600',
            padding: isMobile ? '10px 6px' : '8px',
            minHeight: '44px', // 터치 타겟 최소 크기
            textDecoration: 'none',
            cursor: 'pointer',
          };

          if (btn.type === 'link') {
            return (
              <a
                key={i}
                href={btn.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                style={commonStyle}
              >
                {btn.label}
              </a>
            );
          }

          return (
            <button
              key={i}
              onClick={(e) => { e.stopPropagation(); btn.onClick?.(); }}
              style={commonStyle}
            >
              {btn.label}
              {btn.crown && <span style={{ fontSize: '9px' }}>👑</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default EarningsWidget;
