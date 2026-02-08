'use client';
// ============================================
// EnhancedMiniChart - 캔들차트 + 매도선 표시
// 경로: src/components/EnhancedMiniChart.tsx
// ============================================

import React from 'react';
import type { CandleData } from '@/types';

interface EnhancedMiniChartProps {
  data: CandleData[];
  buyPrice: number;
  width?: number;
  height?: number;
  sellPrices?: Record<string, number>;
  visibleLines?: Record<string, boolean>;
}

const EnhancedMiniChart: React.FC<EnhancedMiniChartProps> = ({
  data, buyPrice, width = 280, height = 240, sellPrices = {}, visibleLines = {},
}) => {
  if (!data || data.length === 0) return null;
  const isSmall = width < 300;
  const pad = { top: 10, right: isSmall ? 60 : 70, bottom: 30, left: 6 };
  const cW = width - pad.left - pad.right;
  const cH = height - pad.top - pad.bottom;

  const allP = data.flatMap((d) => [d.high, d.low])
    .concat([buyPrice])
    .concat(Object.values(sellPrices).filter(Boolean));
  const minP = Math.min(...allP) * 0.98;
  const maxP = Math.max(...allP) * 1.02;
  const range = maxP - minP || 1;
  const barW = Math.max(2, cW / data.length - 1.5);
  const y = (p: number) => pad.top + cH - ((p - minP) / range) * cH;
  const x = (i: number) => pad.left + (i / data.length) * cW;
  const cur = data[data.length - 1]?.close || buyPrice;
  const fs = { x: isSmall ? 9 : 10, y: isSmall ? 8 : 9, label: isSmall ? 7 : 8 };

  const renderLine = (key: string, price: number | undefined, color: string, label: string, dash?: string) => {
    if (!price || (visibleLines && visibleLines[key] === false)) return null;
    return (
      <g key={key}>
        <line x1={pad.left} y1={y(price)} x2={width - pad.right} y2={y(price)} stroke={color} strokeWidth={1} strokeDasharray={dash || "3,2"} opacity={0.7} />
        <rect x={width - pad.right} y={y(price) - 7} width={56} height={14} fill={color} rx={2} opacity={0.85} />
        <text x={width - pad.right + 3} y={y(price) + 3} fill="#fff" fontSize={fs.label} fontWeight="600">{label} {Math.round(price).toLocaleString()}</text>
      </g>
    );
  };

  const gridCount = 4;
  const xIndices = data.length <= 10
    ? Array.from({ length: data.length }, (_, i) => i).filter((_, i) => i % 2 === 0)
    : [0, Math.floor(data.length * 0.25), Math.floor(data.length * 0.5), Math.floor(data.length * 0.75), data.length - 1];

  return (
    <svg width={width} height={height} style={{ display: "block" }}>
      {Array.from({ length: gridCount + 1 }).map((_, i) => {
        const p = minP + (range * i) / gridCount;
        return (
          <g key={`g${i}`}>
            <line x1={pad.left} y1={y(p)} x2={width - pad.right} y2={y(p)} stroke="rgba(255,255,255,0.04)" />
            <text x={width - pad.right + 4} y={y(p) + 3} fill="#475569" fontSize={fs.y}>{Math.round(p).toLocaleString()}</text>
          </g>
        );
      })}
      {xIndices.map((idx) => {
        const d = new Date(data[idx]?.date);
        return (
          <text key={`x${idx}`} x={x(idx) + barW / 2} y={height - 6} fill="#475569" fontSize={fs.x} textAnchor="middle">
            {(d.getMonth() + 1) + "/" + d.getDate()}
          </text>
        );
      })}
      {data.map((c, i) => {
        const isUp = c.close >= c.open;
        const col = isUp ? "#10b981" : "#ef4444";
        return (
          <g key={`c${i}`}>
            <line x1={x(i) + barW / 2} y1={y(c.high)} x2={x(i) + barW / 2} y2={y(c.low)} stroke={col} strokeWidth={0.8} />
            <rect x={x(i)} y={y(Math.max(c.open, c.close))} width={barW} height={Math.max(1, Math.abs(y(c.open) - y(c.close)))} fill={col} />
          </g>
        );
      })}
      <line x1={pad.left} y1={y(buyPrice)} x2={width - pad.right} y2={y(buyPrice)} stroke="#3b82f6" strokeWidth={1.5} strokeDasharray="4,2" />
      <rect x={width - pad.right} y={y(buyPrice) - 8} width={58} height={16} fill="#3b82f6" rx={2} />
      <text x={width - pad.right + 3} y={y(buyPrice) + 4} fill="#fff" fontSize={fs.label} fontWeight="600">매수 {buyPrice.toLocaleString()}</text>
      {renderLine("stopLoss", sellPrices?.stopLoss, "#ef4444", "손절")}
      {renderLine("twoThird", sellPrices?.twoThird, "#8b5cf6", "2/3익")}
      {renderLine("maSignal", sellPrices?.maSignal, "#06b6d4", "이평", "4,2")}
      {renderLine("volumeZone", sellPrices?.volumeZone, "#84cc16", "저항", "6,3")}
      {renderLine("trendline", sellPrices?.trendline, "#ec4899", "지지", "8,4")}
      <circle cx={x(data.length - 1) + barW / 2} cy={y(cur)} r={4} fill={cur >= buyPrice ? "#10b981" : "#ef4444"} stroke="#fff" strokeWidth={1} />
    </svg>
  );
};

export default EnhancedMiniChart;
