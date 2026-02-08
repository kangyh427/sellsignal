'use client';
// ============================================
// MiniChart - SVG 미니 캔들 차트
// 경로: src/components/MiniChart.tsx
// ============================================
// PositionCard 내부에서 사용되는 간소화된 캔들차트
// 매수가 라인 + 현재가 포인트 표시

import React from 'react';
import type { CandleData } from '@/types';

interface MiniChartProps {
  data: CandleData[];
  buyPrice: number;
  width?: number;
  height?: number;
}

const MiniChart: React.FC<MiniChartProps> = ({
  data,
  buyPrice,
  width = 280,
  height = 180,
}) => {
  if (!data || data.length === 0) return null;

  // ── 차트 영역 계산 ──
  const pad = { top: 8, right: 55, bottom: 24, left: 4 };
  const cW = width - pad.left - pad.right;
  const cH = height - pad.top - pad.bottom;

  const allPrices = data.flatMap((d) => [d.high, d.low]).concat([buyPrice]);
  const minP = Math.min(...allPrices) * 0.98;
  const maxP = Math.max(...allPrices) * 1.02;
  const range = maxP - minP || 1;

  const barW = Math.max(2, cW / data.length - 1.5);
  const y = (p: number) => pad.top + cH - ((p - minP) / range) * cH;
  const x = (i: number) => pad.left + (i / data.length) * cW;

  const cur = data[data.length - 1]?.close || buyPrice;

  return (
    <svg width={width} height={height} style={{ display: 'block' }}>
      {/* 가격 그리드 (4단계) */}
      {[0, 1, 2, 3].map((i) => {
        const p = minP + (range * i) / 3;
        return (
          <g key={i}>
            <line
              x1={pad.left} y1={y(p)}
              x2={width - pad.right} y2={y(p)}
              stroke="rgba(255,255,255,0.06)"
            />
            <text
              x={width - pad.right + 4} y={y(p) + 3}
              fill="#475569" fontSize="9"
            >
              {Math.round(p).toLocaleString()}
            </text>
          </g>
        );
      })}

      {/* 캔들 바 */}
      {data.map((c, i) => {
        const isUp = c.close >= c.open;
        const col = isUp ? '#10b981' : '#ef4444';
        return (
          <g key={i}>
            {/* 꼬리 (고가~저가) */}
            <line
              x1={x(i) + barW / 2} y1={y(c.high)}
              x2={x(i) + barW / 2} y2={y(c.low)}
              stroke={col} strokeWidth={0.8}
            />
            {/* 몸통 (시가~종가) */}
            <rect
              x={x(i)}
              y={y(Math.max(c.open, c.close))}
              width={barW}
              height={Math.max(1, Math.abs(y(c.open) - y(c.close)))}
              fill={col}
            />
          </g>
        );
      })}

      {/* 매수가 점선 */}
      <line
        x1={pad.left} y1={y(buyPrice)}
        x2={width - pad.right} y2={y(buyPrice)}
        stroke="#3b82f6" strokeWidth={1} strokeDasharray="4,2"
      />
      <rect
        x={width - pad.right} y={y(buyPrice) - 7}
        width={52} height={14}
        fill="#3b82f6" rx={3}
      />
      <text
        x={width - pad.right + 3} y={y(buyPrice) + 3}
        fill="#fff" fontSize="8" fontWeight="600"
      >
        매수 {buyPrice.toLocaleString()}
      </text>

      {/* 현재가 포인트 */}
      <circle
        cx={x(data.length - 1) + barW / 2}
        cy={y(cur)}
        r={3}
        fill={cur >= buyPrice ? '#10b981' : '#ef4444'}
        stroke="#fff"
        strokeWidth={0.8}
      />
    </svg>
  );
};

export default MiniChart;
