'use client';
// ============================================
// EnhancedMiniChart - 캔들차트 + 매도선 표시
// 경로: src/components/EnhancedMiniChart.tsx
// 세션 34: 데스크탑 차트 확대, 축 눈금 촘촘하게 개선
// 세션 37: 매도선 라벨 크기 확대 (모바일 가독성 개선)
// 변경사항:
//   - 매도선 라벨 폰트: 7~8px → 10~11px (모바일/데스크탑)
//   - 매도선 라벨 박스: 56~62px → 72~80px (텍스트 잘림 방지)
//   - 매도선 라벨 높이: 14px → 18px (터치 가독성)
//   - Y축 가격 라벨: 8~9px → 10~11px
//   - X축 날짜 라벨: 9~10px → 10~11px
//   - 매수가 라벨 박스: 58~64px → 74~82px
//   - 우측 패딩 확대: 라벨 잘림 방지
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

  // ── 패딩 (★ 세션 37: 우측 패딩 확대 - 큰 라벨 수용) ──
  const pad = {
    top: 10,
    right: isWide ? 90 : isSmall ? 74 : 82,
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

  // ── 캔들 바 너비 ──
  const barW = isWide
    ? Math.max(3, cW / data.length - 2)
    : Math.max(2, cW / data.length - 1.5);

  // ── 좌표 변환 함수 ──
  const y = (p: number) => pad.top + cH - ((p - minP) / range) * cH;
  const x = (i: number) => pad.left + (i / data.length) * cW;
  const cur = data[data.length - 1]?.close || buyPrice;

  // ── ★ 세션 37: 폰트 사이즈 확대 ──
  const fs = {
    x: isWide ? 11 : isSmall ? 10 : 11,       // X축 날짜 (기존 9~10 → 10~11)
    y: isWide ? 11 : isSmall ? 10 : 10,        // Y축 가격 (기존 8~9 → 10~11)
    label: isWide ? 11 : isSmall ? 10 : 10,    // 매도선 라벨 (기존 7~8 → 10~11)
  };

  // ── ★ 세션 37: 매도선 라벨 크기 확대 ──
  const renderLine = (key: string, price: number | undefined, color: string, label: string, dash?: string) => {
    if (!price || (visibleLines && visibleLines[key] === false)) return null;
    // ★ 라벨 박스 너비 확대 (기존 56~62 → 72~80)
    const labelW = isWide ? 80 : isSmall ? 72 : 76;
    // ★ 라벨 박스 높이 확대 (기존 14 → 18)
    const labelH = 18;
    return (
      <g key={key}>
        <line x1={pad.left} y1={y(price)} x2={width - pad.right} y2={y(price)}
          stroke={color} strokeWidth={1} strokeDasharray={dash || "3,2"} opacity={0.7} />
        <rect x={width - pad.right} y={y(price) - labelH / 2} width={labelW} height={labelH}
          fill={color} rx={3} opacity={0.9} />
        <text x={width - pad.right + 4} y={y(price) + 4} fill="#fff" fontSize={fs.label} fontWeight="700">
          {label} {Math.round(price).toLocaleString()}
        </text>
      </g>
    );
  };

  // ── Y축 그리드 ──
  const gridCountY = isWide ? 6 : 4;

  // ── X축 날짜 라벨 ──
  const getXIndices = (): number[] => {
    if (data.length <= 10) {
      return Array.from({ length: data.length }, (_, i) => i).filter((_, i) => i % 2 === 0);
    }
    if (isWide) {
      const count = Math.min(10, Math.max(8, Math.floor(data.length / 6)));
      return Array.from({ length: count }, (_, i) =>
        Math.floor((i / (count - 1)) * (data.length - 1))
      );
    }
    return [0, Math.floor(data.length * 0.25), Math.floor(data.length * 0.5),
      Math.floor(data.length * 0.75), data.length - 1];
  };
  const xIndices = getXIndices();

  // ── ★ 세션 37: 매수가 라벨 크기 확대 ──
  const buyLabelW = isWide ? 82 : isSmall ? 74 : 78;
  const buyLabelH = 20;

  return (
    <svg width={width} height={height} style={{ display: "block" }}>
      {/* Y축 그리드 라인 + 가격 라벨 */}
      {Array.from({ length: gridCountY + 1 }).map((_, i) => {
        const p = minP + (range * i) / gridCountY;
        return (
          <g key={`g${i}`}>
            <line x1={pad.left} y1={y(p)} x2={width - pad.right} y2={y(p)}
              stroke="rgba(255,255,255,0.04)" />
            <text x={width - pad.right + 4} y={y(p) + 4}
              fill="#94a3b8" fontSize={fs.y} fontWeight="500">
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
            fill="#94a3b8" fontSize={fs.x} textAnchor="middle" fontWeight="500">
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

      {/* ★ 매수가 기준선 (라벨 확대) */}
      <line x1={pad.left} y1={y(buyPrice)} x2={width - pad.right} y2={y(buyPrice)}
        stroke="#3b82f6" strokeWidth={1.5} strokeDasharray="4,2" />
      <rect x={width - pad.right} y={y(buyPrice) - buyLabelH / 2} width={buyLabelW} height={buyLabelH}
        fill="#3b82f6" rx={3} />
      <text x={width - pad.right + 4} y={y(buyPrice) + 5} fill="#fff"
        fontSize={fs.label} fontWeight="700">
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
