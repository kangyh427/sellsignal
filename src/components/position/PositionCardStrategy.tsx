// ============================================
// PositionCardStrategy 컴포넌트
// 위치: src/components/position/PositionCardStrategy.tsx
// ============================================
// 역할: 매도 조건별 기준가격 리스트 + 차트 라인 토글 체크박스
// 원본: PositionCard.tsx renderSellConditions() (라인 354~498)

'use client';

import React from 'react';
import type { Position, SellPrices, VisibleLines } from '../../types';
import { SELL_PRESETS } from '../../constants';

// ── Props 타입 ──
interface PositionCardStrategyProps {
  position: Position;
  currentPrice: number;
  sellPrices: SellPrices;
  visibleLines: VisibleLines;
  onToggleLine: (lineKey: string) => void;
  onEdit: (position: Position) => void;
  isMobile: boolean;
}

// 차트 라인이 있는 프리셋 ID 목록
const CHART_LINE_PRESETS = ['candle3', 'stopLoss', 'twoThird', 'maSignal'];

/**
 * 프리셋별 매도 기준가와 색상을 계산합니다.
 */
const getSellPriceInfo = (
  presetId: string,
  sellPrices: SellPrices,
  currentPrice: number,
): { priceText: string; priceColor: string } => {
  let priceText = '-';
  let priceColor = '#94a3b8';

  if (presetId === 'stopLoss' && sellPrices.stopLoss) {
    priceText = `₩${sellPrices.stopLoss.toLocaleString()}`;
    priceColor = currentPrice <= sellPrices.stopLoss ? '#ef4444' : '#94a3b8';
  } else if (presetId === 'twoThird' && sellPrices.twoThird) {
    priceText = `₩${sellPrices.twoThird.toLocaleString()}`;
    priceColor = currentPrice <= sellPrices.twoThird ? '#f59e0b' : '#94a3b8';
  } else if (presetId === 'maSignal' && sellPrices.maSignal) {
    priceText = `₩${sellPrices.maSignal.toLocaleString()}`;
    priceColor = currentPrice < sellPrices.maSignal ? '#f59e0b' : '#94a3b8';
  } else if (presetId === 'candle3' && sellPrices.candle3_50) {
    priceText = `₩${sellPrices.candle3_50.toLocaleString()}`;
  }

  return { priceText, priceColor };
};

const PositionCardStrategy: React.FC<PositionCardStrategyProps> = ({
  position,
  currentPrice,
  sellPrices,
  visibleLines,
  onToggleLine,
  onEdit,
  isMobile,
}) => {
  return (
    <div
      style={{
        background: 'rgba(0,0,0,0.2)',
        borderRadius: '8px',
        padding: '10px',
        marginBottom: '8px',
        flex: 1,
      }}
    >
      {/* ── 매도 조건 헤더 ── */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '6px',
        }}
      >
        <span
          style={{
            fontSize: isMobile ? '13px' : '14px',
            color: '#fff',
            fontWeight: '600',
          }}
        >
          📊 매도 조건별 기준가격
        </span>
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
            minHeight: '32px',
          }}
        >
          ✏️ 조건 변경
        </button>
      </div>

      {/* ── 경고 배너 ── */}
      <div
        style={{
          fontSize: '10px',
          color: '#f59e0b',
          marginBottom: '6px',
          background: 'rgba(245,158,11,0.1)',
          padding: '5px 8px',
          borderRadius: '4px',
        }}
      >
        ⚠️ 수치는 예시입니다. 본인의 투자 원칙에 따라 수정하세요.
      </div>

      {/* ── 조건 목록 ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {(position.selectedPresets || [])
          .slice(0, isMobile ? 3 : undefined)
          .map((presetId) => {
            const preset = SELL_PRESETS[presetId];
            if (!preset) return null;

            const hasChartLine = CHART_LINE_PRESETS.includes(presetId);
            const { priceText, priceColor } = getSellPriceInfo(
              presetId,
              sellPrices,
              currentPrice,
            );

            return (
              <div
                key={presetId}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: isMobile ? '10px' : '8px 10px',
                  background: 'rgba(255,255,255,0.03)',
                  borderRadius: '6px',
                  borderLeft: `3px solid ${preset.color}`,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {/* 데스크탑: 차트 라인 토글 체크박스 */}
                  {hasChartLine && !isMobile ? (
                    <input
                      type="checkbox"
                      checked={visibleLines[presetId as keyof VisibleLines] || false}
                      onChange={() => onToggleLine(presetId)}
                      style={{
                        width: '16px',
                        height: '16px',
                        accentColor: preset.color,
                        cursor: 'pointer',
                      }}
                    />
                  ) : (
                    <div style={{ width: isMobile ? '0' : '16px' }} />
                  )}
                  <span
                    style={{
                      fontSize: isMobile ? '12px' : '14px',
                      color: '#e2e8f0',
                    }}
                  >
                    {preset.icon}{' '}
                    {isMobile ? preset.name.replace(' 매도법', '') : preset.name}
                  </span>
                </div>
                <span
                  style={{
                    fontSize: isMobile ? '13px' : '15px',
                    fontWeight: '700',
                    color: priceColor,
                  }}
                >
                  {priceText}
                </span>
              </div>
            );
          })}
      </div>

      {/* 데스크탑: 체크박스 안내 */}
      {!isMobile && (
        <div
          style={{
            fontSize: '11px',
            color: '#64748b',
            marginTop: '4px',
            textAlign: 'center',
          }}
        >
          체크박스 선택 시 차트에 가격선 표시
        </div>
      )}
    </div>
  );
};

export default PositionCardStrategy;
