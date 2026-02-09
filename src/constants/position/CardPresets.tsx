
'use client';
// ============================================
// CardPresets - 매도법 프리셋 목록
// 경로: src/components/position/CardPresets.tsx
// 세션 33: PositionCard에서 분리
// 역할: 매도법 태그 표시 + 매도 기준가 목록 + 차트 라인 토글
// ============================================

import React from 'react';
import { SELL_PRESETS, CHART_LINE_PRESETS } from '@/constants';
import type { Position } from '@/types';

interface CardPresetsProps {
  position: Position;
  currentPrice: number;
  sellPrices: Record<string, number>;
  showPresets: boolean;
  onTogglePresets: () => void;
  onEditClick: () => void;
  visibleLines: Record<string, boolean>;
  onToggleLine: (pid: string) => void;
  isMobile: boolean;
}

const CardPresets = ({
  position, currentPrice, sellPrices, showPresets,
  onTogglePresets, onEditClick, visibleLines, onToggleLine, isMobile,
}: CardPresetsProps) => {
  const selectedPresets = position.selectedPresets || [];

  return (
    <div style={{
      background: 'rgba(255,255,255,0.02)',
      borderRadius: '8px',
      border: '1px solid rgba(255,255,255,0.04)',
    }}>
      {/* 프리셋 헤더 (토글) */}
      <button
        onClick={onTogglePresets}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '10px 12px', background: 'none', border: 'none', cursor: 'pointer',
          minHeight: '44px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '12px', fontWeight: '600', color: '#94a3b8' }}>
            매도법 ({selectedPresets.length})
          </span>
          {/* 선택된 프리셋 태그 */}
          {selectedPresets.length <= 4 && selectedPresets.map((pid) => {
            const preset = SELL_PRESETS[pid];
            if (!preset) return null;
            return (
              <span key={pid} style={{
                fontSize: '10px', padding: '2px 6px',
                background: `${preset.color}15`,
                color: preset.color,
                borderRadius: '4px', fontWeight: '600',
                border: `1px solid ${preset.color}30`,
              }}>
                {preset.icon} {isMobile ? preset.name.replace(' 매도법', '') : preset.name}
              </span>
            );
          })}
        </div>
        <span style={{
          color: '#64748b', fontSize: '12px',
          transition: 'transform 0.2s',
          transform: showPresets ? 'rotate(180deg)' : 'rotate(0)',
        }}>▼</span>
      </button>

      {/* 프리셋 상세 목록 */}
      {showPresets && (
        <div style={{ padding: '0 12px 12px' }}>
          {/* 경고 배너 */}
          <div style={{
            fontSize: '10px', color: '#f59e0b', marginBottom: '8px',
            background: 'rgba(245,158,11,0.08)', padding: '5px 8px', borderRadius: '4px',
          }}>
            ⚠️ 수치는 예시입니다. 본인의 투자 원칙에 따라 수정하세요.
          </div>

          {/* 수정 버튼 */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '6px' }}>
            <button onClick={onEditClick} style={{
              background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)',
              borderRadius: '4px', padding: isMobile ? '6px 10px' : '4px 10px',
              color: '#60a5fa', fontSize: isMobile ? '11px' : '12px', cursor: 'pointer',
              minHeight: '32px',
            }}>✏️ 수정</button>
          </div>

          {/* 프리셋 항목 리스트 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            {selectedPresets.map((pid) => {
              const preset = SELL_PRESETS[pid];
              if (!preset) return null;
              const hasChartLine = CHART_LINE_PRESETS.includes(pid);

              // 매도 기준가격 텍스트
              let priceText = '모니터링 중';
              let priceColor = '#94a3b8';

              if (pid === 'stopLoss' && sellPrices.stopLoss) {
                priceText = '₩' + sellPrices.stopLoss.toLocaleString();
                priceColor = currentPrice <= sellPrices.stopLoss ? '#ef4444' : '#94a3b8';
              } else if (pid === 'twoThird' && sellPrices.twoThird) {
                priceText = '₩' + sellPrices.twoThird.toLocaleString();
                priceColor = currentPrice <= sellPrices.twoThird ? '#f59e0b' : '#94a3b8';
              } else if (pid === 'maSignal' && sellPrices.maSignal) {
                priceText = '₩' + sellPrices.maSignal.toLocaleString();
                priceColor = currentPrice < sellPrices.maSignal ? '#f59e0b' : '#94a3b8';
              } else if (pid === 'volumeZone' && sellPrices.volumeZone) {
                priceText = '₩' + sellPrices.volumeZone.toLocaleString();
              } else if (pid === 'trendline' && sellPrices.trendline) {
                priceText = '₩' + sellPrices.trendline.toLocaleString();
              }

              return (
                <div key={pid} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: isMobile ? '8px 10px' : '8px 12px',
                  background: 'rgba(255,255,255,0.02)', borderRadius: '6px',
                  borderLeft: `3px solid ${preset.color}`,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {/* 차트 라인 토글 체크박스 (데스크톱만) */}
                    {hasChartLine && !isMobile && (
                      <input
                        type="checkbox"
                        checked={visibleLines[pid] !== false}
                        onChange={() => onToggleLine(pid)}
                        style={{ width: '14px', height: '14px', accentColor: preset.color, cursor: 'pointer' }}
                      />
                    )}
                    <span style={{ fontSize: isMobile ? '12px' : '13px', color: '#cbd5e1' }}>
                      {preset.icon} {isMobile ? preset.name.replace(' 매도법', '') : preset.name}
                    </span>
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: '600', color: priceColor }}>
                    {priceText}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default CardPresets;
