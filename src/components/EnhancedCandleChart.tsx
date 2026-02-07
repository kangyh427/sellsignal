'use client';
// ============================================
// EnhancedCandleChart - 반응형 캔들 차트 컴포넌트
// 경로: src/components/EnhancedCandleChart.tsx
// 세션2에서 SellSignalApp.tsx L34-230 분리
// ============================================

import React from 'react';
import type { CandleData, SellPrices } from '../types';

// ── Props 타입 정의 ──
interface VisibleLines {
  candle3?: boolean;
  stopLoss?: boolean;
  twoThird?: boolean;
  maSignal?: boolean;
  volumeZone?: boolean;
  trendline?: boolean;
  [key: string]: boolean | undefined;
}

interface EnhancedCandleChartProps {
  data: CandleData[] | null;
  width?: number;
  height?: number;
  buyPrice: number;
  sellPrices?: SellPrices;
  visibleLines?: VisibleLines;
}

// ── 가격 포맷 (콤마 포함) ──
const formatPrice = (price: number): string => {
  return Math.round(price).toLocaleString();
};

// ── 날짜 포맷 (월/일) ──
const formatDate = (date: Date): string => {
  const d = new Date(date);
  return `${d.getMonth() + 1}/${d.getDate()}`;
};

// ============================================
// 메인 컴포넌트
// ============================================
const EnhancedCandleChart: React.FC<EnhancedCandleChartProps> = ({
  data,
  width = 270,
  height = 280,
  buyPrice,
  sellPrices,
  visibleLines,
}) => {
  if (!data || data.length === 0) return null;

  // ── 차트 크기에 따른 폰트 크기 결정 ──
  const isSmallChart = width < 280;
  const fontSize = {
    xAxis: isSmallChart ? 10 : 11,
    yAxis: isSmallChart ? 9 : 10,
    label: isSmallChart ? 8 : 9,
  };

  // ── 패딩 & 차트 영역 계산 ──
  const padding = { top: 10, right: 70, bottom: 34, left: 6 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  // ── 가격 범위 계산 (매수가 + 매도가 포함) ──
  const allPrices = data
    .flatMap((d) => [d.high, d.low])
    .concat([buyPrice])
    .concat(Object.values(sellPrices || {}).filter(Boolean) as number[]);
  const minP = Math.min(...allPrices) * 0.98;
  const maxP = Math.max(...allPrices) * 1.02;
  const range = maxP - minP || 1;
  const candleW = Math.max(3, chartW / data.length - 1.5);

  // ── 스케일 함수 ──
  const scaleY = (p: number) => padding.top + chartH - ((p - minP) / range) * chartH;
  const scaleX = (i: number) => padding.left + (i / data.length) * chartW;
  const currentPrice = data[data.length - 1]?.close || buyPrice;

  // ── X축 날짜 인덱스 (5~6개 표시) ──
  const getXAxisIndices = (): number[] => {
    const len = data.length;
    if (len <= 10) {
      return Array.from({ length: len }, (_, i) => i).filter((_, i) => i % 2 === 0);
    }
    if (len <= 20) {
      return [0, Math.floor(len * 0.25), Math.floor(len * 0.5), Math.floor(len * 0.75), len - 1];
    }
    return [0, Math.floor(len * 0.2), Math.floor(len * 0.4), Math.floor(len * 0.6), Math.floor(len * 0.8), len - 1];
  };
  const xAxisIndices = getXAxisIndices();

  // ── 매도 가격선 렌더링 헬퍼 ──
  const renderPriceLine = (
    key: string,
    price: number | undefined,
    color: string,
    label: string,
    dashArray?: string
  ) => {
    if (!visibleLines?.[key] || !price) return null;
    return (
      <g key={key}>
        <line
          x1={padding.left}
          y1={scaleY(price)}
          x2={width - padding.right}
          y2={scaleY(price)}
          stroke={color}
          strokeWidth={1.5}
          strokeDasharray={dashArray}
        />
        <rect
          x={width - padding.right}
          y={scaleY(price) - 8}
          width={66}
          height={16}
          fill={color}
          rx={2}
        />
        <text
          x={width - padding.right + 3}
          y={scaleY(price) + 4}
          fill="#fff"
          fontSize={fontSize.label}
          fontWeight="600"
        >
          {label} {price.toLocaleString()}
        </text>
      </g>
    );
  };

  return (
    <svg
      width={width}
      height={height}
      style={{ display: 'block', background: 'rgba(0,0,0,0.3)', borderRadius: '8px' }}
    >
      {/* ── Y축 그리드 & 가격 라벨 (5단계) ── */}
      {[0, 1, 2, 3, 4].map((i) => {
        const price = minP + (range * i) / 4;
        const y = scaleY(price);
        return (
          <g key={`y-${i}`}>
            <line
              x1={padding.left}
              y1={y}
              x2={width - padding.right}
              y2={y}
              stroke="rgba(255,255,255,0.12)"
              strokeDasharray="3,3"
            />
            <text
              x={width - padding.right + 4}
              y={y + 4}
              fill="#d4d4d8"
              fontSize={fontSize.yAxis}
              fontWeight="600"
            >
              {formatPrice(price)}
            </text>
          </g>
        );
      })}

      {/* ── X축 기준선 ── */}
      <line
        x1={padding.left}
        y1={height - padding.bottom}
        x2={width - padding.right}
        y2={height - padding.bottom}
        stroke="rgba(255,255,255,0.2)"
      />

      {/* ── X축 날짜 라벨 ── */}
      {xAxisIndices.map((idx, i) => {
        if (idx >= data.length || !data[idx]?.date) return null;
        const x = scaleX(idx) + candleW / 2;
        return (
          <g key={`x-${i}`}>
            <line
              x1={x}
              y1={height - padding.bottom}
              x2={x}
              y2={height - padding.bottom + 4}
              stroke="rgba(255,255,255,0.4)"
            />
            <text
              x={x}
              y={height - padding.bottom + 18}
              fill="#d4d4d8"
              fontSize={fontSize.xAxis}
              textAnchor="middle"
              fontWeight="600"
            >
              {formatDate(data[idx].date)}
            </text>
          </g>
        );
      })}

      {/* ── 캔들 본체 ── */}
      {data.map((c, i) => {
        const x = scaleX(i);
        const isUp = c.close >= c.open;
        const color = isUp ? '#10b981' : '#ef4444';
        return (
          <g key={`c-${i}`}>
            <line
              x1={x + candleW / 2}
              y1={scaleY(c.high)}
              x2={x + candleW / 2}
              y2={scaleY(c.low)}
              stroke={color}
              strokeWidth={1}
            />
            <rect
              x={x}
              y={scaleY(Math.max(c.open, c.close))}
              width={candleW}
              height={Math.max(1, Math.abs(scaleY(c.open) - scaleY(c.close)))}
              fill={color}
            />
          </g>
        );
      })}

      {/* ── 매수가 라인 (항상 표시) ── */}
      <line
        x1={padding.left}
        y1={scaleY(buyPrice)}
        x2={width - padding.right}
        y2={scaleY(buyPrice)}
        stroke="#3b82f6"
        strokeWidth={1.5}
        strokeDasharray="4,2"
      />
      <rect x={width - padding.right} y={scaleY(buyPrice) - 8} width={66} height={16} fill="#3b82f6" rx={2} />
      <text x={width - padding.right + 3} y={scaleY(buyPrice) + 4} fill="#fff" fontSize={fontSize.label} fontWeight="600">
        매수 {buyPrice.toLocaleString()}
      </text>

      {/* ── 매도 가격선들 ── */}
      {renderPriceLine('stopLoss', sellPrices?.stopLoss, '#ef4444', '손절')}
      {renderPriceLine('twoThird', sellPrices?.twoThird, '#8b5cf6', '2/3익')}
      {renderPriceLine('maSignal', sellPrices?.maSignal, '#06b6d4', '이평', '4,2')}
      {renderPriceLine('volumeZone', sellPrices?.volumeZone, '#84cc16', '저항', '6,3')}
      {renderPriceLine('trendline', sellPrices?.trendline, '#ec4899', '지지', '8,4')}

      {/* ── 현재가 마커 ── */}
      <circle
        cx={scaleX(data.length - 1) + candleW / 2}
        cy={scaleY(currentPrice)}
        r={4}
        fill={currentPrice >= buyPrice ? '#10b981' : '#ef4444'}
        stroke="#fff"
        strokeWidth={1}
      />
    </svg>
  );
};

export default EnhancedCandleChart;
