'use client';
// ============================================
// EnhancedMiniChart - 캔들차트 + 매도선 표시
// 경로: src/components/EnhancedMiniChart.tsx
// 세션 34: 데스크탑 차트 확대, 축 눈금 촘촘하게 개선
// 변경사항:
//   - Y축: 데스크탑 6단계 / 모바일 4단계
//   - X축: 데스크탑 8~10개 / 모바일 5개 날짜 라벨
//   - 캔들 두께/마커 크기 데스크탑 확대
//   - Y축 라벨 색상 #475569 → #64748b (가독성 향상)
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

  // ── 반응형 판단 (width 기준) ──
  const isSmall = width < 300;
  const isWide = width >= 500; // 데스크탑 넓은 차트

  // ── 패딩 (넓을수록 우측 라벨 공간 확보) ──
  const pad = {
    top: 10,
    right: isWide ? 78 : isSmall ? 60 : 70,
    bottom: 32,
    left: 6,
  };
  const cW = width - pad.left - pad.right;
  const cH = height - pad.top - pad.bottom;

  // ── 가격 범위 계산 ──
  const allP = data.flatMap((d) => [d.high, d.low])
    .concat([buyPrice])
    .concat(Object.values(sellPrices).filter(Boolean));
  const minP = Math.min(...allP) * 0.98;
  const maxP = Math.max(...allP) * 1.02;
  const range = maxP - minP || 1;

  // ── 캔들 바 너비 (넓은 차트 → 더 두꺼운 캔들) ──
  const barW = isWide
    ? Math.max(3, cW / data.length - 2)
    : Math.max(2, cW / data.length - 1.5);

  // ── 좌표 변환 함수 ──
  const y = (p: number) => pad.top + cH - ((p - minP) / range) * cH;
  const x = (i: number) => pad.left + (i / data.length) * cW;
  const cur = data[data.length - 1]?.close || buyPrice;

  // ── 폰트 사이즈 ──
  const fs = {
    x: isWide ? 10 : isSmall ? 9 : 10,
    y: isWide ? 9 : isSmall ? 8 : 9,
    label: isWide ? 8 : isSmall ? 7 : 8,
  };

  // ── 매도선 렌더링 ──
  const renderLine = (key: string, price: number | undefined, color: string, label: string, dash?: string) => {
    if (!price || (visibleLines && visibleLines[key] === false)) return null;
    const labelW = isWide ? 62 : 56;
    return (
      <g key={key}>
        <line x1={pad.left} y1={y(price)} x2={width - pad.right} y2={y(price)}
          stroke={color} strokeWidth={1} strokeDasharray={dash || "3,2"} opacity={0.7} />
        <rect x={width - pad.right} y={y(price) - 7} width={labelW} height={14}
          fill={color} rx={2} opacity={0.85} />
        <text x={width - pad.right + 3} y={y(price) + 3} fill="#fff" fontSize={fs.label} fontWeight="600">
          {label} {Math.round(price).toLocaleString()}
        </text>
      </g>
    );
  };

  // ── Y축 그리드 (데스크탑 6단계 / 모바일 4단계) ──
  const gridCountY = isWide ? 6 : 4;

  // ── X축 날짜 라벨 (데스크탑 8~10개 / 모바일 5개) ──
  const getXIndices = (): number[] => {
    if (data.length <= 10) {
      return Array.from({ length: data.length }, (_, i) => i).filter((_, i) => i % 2 === 0);
    }
    if (isWide) {
      // 데스크탑: 더 촘촘하게 (8~10개 라벨)
      const count = Math.min(10, Math.max(8, Math.floor(data.length / 6)));
      return Array.from({ length: count }, (_, i) =>
        Math.floor((i / (count - 1)) * (data.length - 1))
      );
    }
    // 모바일/태블릿: 5개
    return [0, Math.floor(data.length * 0.25), Math.floor(data.length * 0.5),
      Math.floor(data.length * 0.75), data.length - 1];
  };
  const xIndices = getXIndices();

  // ── 매수가 라벨 너비 ──
  const buyLabelW = isWide ? 64 : 58;

  return (
    <svg width={width} height={height} style={{ display: "block" }}>
      {/* Y축 그리드 라인 + 가격 라벨 */}
      {Array.from({ length: gridCountY + 1 }).map((_, i) => {
        const p = minP + (range * i) / gridCountY;
        return (
          <g key={`g${i}`}>
            <line x1={pad.left} y1={y(p)} x2={width - pad.right} y2={y(p)}
              stroke="rgba(255,255,255,0.04)" />
            <text x={width - pad.right + 4} y={y(p) + 3}
              fill="#64748b" fontSize={fs.y}>
              {Math.round(p).toLocaleString()}
            </text>
          </g>
        );
      })}

      {/* X축 날짜 라벨 */}
      {xIndices.map((idx) => {
        const d = new Date(data[idx]?.date);
        return (
          <text key={`x${idx}`} x={x(idx) + barW / 2} y={height - 6}
            fill="#64748b" fontSize={fs.x} textAnchor="middle">
            {(d.getMonth() + 1) + "/" + d.getDate()}
          </text>
        );
      })}

      {/* 캔들스틱 */}
      {data.map((c, i) => {
        const isUp = c.close >= c.open;
        const col = isUp ? "#10b981" : "#ef4444";
        return (
          <g key={`c${i}`}>
            <line x1={x(i) + barW / 2} y1={y(c.high)} x2={x(i) + barW / 2} y2={y(c.low)}
              stroke={col} strokeWidth={isWide ? 1 : 0.8} />
            <rect x={x(i)} y={y(Math.max(c.open, c.close))}
              width={barW} height={Math.max(1, Math.abs(y(c.open) - y(c.close)))} fill={col} />
          </g>
        );
      })}

      {/* 매수가 기준선 */}
      <line x1={pad.left} y1={y(buyPrice)} x2={width - pad.right} y2={y(buyPrice)}
        stroke="#3b82f6" strokeWidth={1.5} strokeDasharray="4,2" />
      <rect x={width - pad.right} y={y(buyPrice) - 8} width={buyLabelW} height={16}
        fill="#3b82f6" rx={2} />
      <text x={width - pad.right + 3} y={y(buyPrice) + 4} fill="#fff"
        fontSize={fs.label} fontWeight="600">
        매수 {buyPrice.toLocaleString()}
      </text>

      {/* 매도 기준선들 */}
      {renderLine("stopLoss", sellPrices?.stopLoss, "#ef4444", "손절")}
      {renderLine("twoThird", sellPrices?.twoThird, "#8b5cf6", "2/3익")}
      {renderLine("maSignal", sellPrices?.maSignal, "#06b6d4", "이평", "4,2")}
      {renderLine("volumeZone", sellPrices?.volumeZone, "#84cc16", "저항", "6,3")}
      {renderLine("trendline", sellPrices?.trendline, "#ec4899", "지지", "8,4")}

      {/* 현재가 원형 마커 */}
      <circle cx={x(data.length - 1) + barW / 2} cy={y(cur)} r={isWide ? 5 : 4}
        fill={cur >= buyPrice ? "#10b981" : "#ef4444"} stroke="#fff" strokeWidth={1} />
    </svg>
  );
};

export default EnhancedMiniChart;
