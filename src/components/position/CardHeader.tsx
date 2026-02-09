'use client';
// ============================================
// CardHeader - 포지션 카드 헤더 (접힌 상태 / 펼친 상태 상단)
// 경로: src/components/position/CardHeader.tsx
// 세션 33: PositionCard에서 분리
// 세션 35: 금액 폰트 크기 확대
//   - 현재가: 16/18px → 18/21px
//   - 수익률: 16/18px → 18/21px
//   - 수익금: 11px → 13px
//   - 평가금: 10px → 12px
// ============================================

import React from 'react';
import { SignalBadgeCompact } from '../SignalSection';
import { formatCompact } from '@/constants';
import type { Position, StockPrice, PositionSignals, ProfitStage } from '@/types';

interface CardHeaderProps {
  position: Position;
  currentPrice: number;
  profitRate: number;
  profitAmount: number;
  totalValue: number;
  isProfit: boolean;
  stage: { label: string; color: string };
  signals?: PositionSignals | null;
  stockPrice?: StockPrice | null;
  isMobile: boolean;
  isExpanded: boolean;
  onToggle: () => void;
}

// ★ 장 상태 라벨 헬퍼
const getMarketStateLabel = (marketState?: string): { text: string; color: string } | null => {
  if (!marketState) return null;
  switch (marketState) {
    case 'REGULAR': return { text: '장중', color: '#10b981' };
    case 'PRE': return { text: '장전', color: '#f59e0b' };
    case 'POST': return { text: '장후', color: '#8b5cf6' };
    case 'CLOSED': return { text: '마감', color: '#64748b' };
    default: return null;
  }
};

const CardHeader = ({
  position, currentPrice, profitRate, profitAmount, totalValue,
  isProfit, stage, signals, stockPrice, isMobile, isExpanded, onToggle,
}: CardHeaderProps) => {
  const marketLabel = getMarketStateLabel(stockPrice?.marketState);
  const dayChange = stockPrice?.change ?? null;
  const dayChangeAmt = stockPrice?.changeAmount ?? null;
  const hasRealPrice = stockPrice?.price != null;

  return (
    <button
      onClick={onToggle}
      style={{
        width: '100%', background: 'none', border: 'none', cursor: 'pointer',
        padding: isMobile ? '14px' : '16px', textAlign: 'left',
        display: 'flex', alignItems: 'center', gap: isMobile ? '10px' : '14px',
        minHeight: '44px',
      }}
    >
      {/* 좌측: 종목 정보 */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: isMobile ? '14px' : '15px', fontWeight: '700', color: '#fff' }}>
            {position.name}
          </span>
          <span style={{ fontSize: '11px', color: '#475569' }}>{position.code}</span>
          {/* 장 상태 뱃지 */}
          {hasRealPrice && marketLabel && (
            <span style={{
              fontSize: '9px', padding: '1px 5px', borderRadius: '4px',
              background: `${marketLabel.color}15`, color: marketLabel.color,
              fontWeight: '600', border: `1px solid ${marketLabel.color}30`,
            }}>{marketLabel.text}</span>
          )}
          {/* 시그널 뱃지 (접힌 상태) */}
          {!isExpanded && signals && signals.maxLevel !== 'safe' && (
            <SignalBadgeCompact level={signals.maxLevel} activeCount={signals.activeCount} />
          )}
        </div>

        {/* ★ 현재가 + 전일 대비 — 세션 35: 18/21px */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', flexWrap: 'wrap' }}>
          <span style={{
            fontSize: isMobile ? '18px' : '21px',
            fontWeight: '700', color: '#fff',
          }}>
            ₩{Math.round(currentPrice).toLocaleString()}
          </span>
          {hasRealPrice && dayChange !== null && (
            <span style={{
              fontSize: '11px', fontWeight: '600',
              color: dayChange >= 0 ? '#ef4444' : '#3b82f6',
            }}>
              {dayChange >= 0 ? '▲' : '▼'} {Math.abs(dayChange).toFixed(2)}%
              {dayChangeAmt !== null && ` (${dayChangeAmt >= 0 ? '+' : ''}${Math.round(dayChangeAmt).toLocaleString()})`}
            </span>
          )}
          {!hasRealPrice && (
            <span style={{ fontSize: '10px', color: '#475569' }}>차트 기준</span>
          )}
        </div>

        {/* 수익 단계 라벨 */}
        <div style={{ fontSize: '10px', color: stage.color, marginTop: '2px', fontWeight: '600' }}>
          {stage.label}
        </div>
      </div>

      {/* ★ 우측: 수익률 — 세션 35: 18/21px */}
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div style={{
          fontSize: isMobile ? '18px' : '21px',
          fontWeight: '700',
          color: isProfit ? '#10b981' : '#ef4444',
        }}>
          {isProfit ? '+' : ''}{profitRate.toFixed(2)}%
        </div>
        {/* ★ 수익금 — 세션 35: 13px */}
        <div style={{
          fontSize: '13px',
          color: isProfit ? '#10b981' : '#ef4444',
        }}>
          {isProfit ? '+' : ''}{formatCompact(profitAmount)}
        </div>
        {/* ★ 평가금액 — 세션 35: 12px */}
        <div style={{
          fontSize: '12px',
          color: '#64748b', marginTop: '2px',
        }}>
          평가 {formatCompact(totalValue)}
        </div>
      </div>

      {/* 펼침/접기 아이콘 */}
      <span style={{
        color: '#64748b', fontSize: '12px',
        transition: 'transform 0.2s',
        transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)',
      }}>▼</span>
    </button>
  );
};

export default CardHeader;
