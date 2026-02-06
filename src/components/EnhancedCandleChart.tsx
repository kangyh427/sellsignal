'use client';

import React from 'react';

// ============================================
// 타입 정의
// ============================================
interface PriceData {
  date: Date | string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface SellPrices {
  stopLoss?: number;
  twoThird?: number;
  maSignal?: number;
  candle3_50?: number;
}

interface VisibleLines {
  candle3?: boolean;
  stopLoss?: boolean;
  twoThird?: boolean;
  maSignal?: boolean;
}

interface EnhancedCandleChartProps {
  data: PriceData[] | undefined;
  width?: number;
  height?: number;
  buyPrice: number;
  sellPrices?: SellPrices;
  visibleLines?: VisibleLines;
}

// ============================================
// 캔들차트 컴포넌트
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

  // 차트 크기에 따른 폰트 크기 결정
  const isSmallChart = width < 280;
  const fontSize = {
    xAxis: isSmallChart ? 10 : 11,
    yAxis: isSmallChart ? 9 : 10,
    label: isSmallChart ? 8 : 9,
  };

  const padding = { top: 10, right: 70, bottom: 34, left: 6 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  // 가격 범위 계산 (매도가 포함)
  const allPrices = data
    .flatMap((d) => [d.high, d.low])
    .concat([buyPrice])
    .concat(Object.values(sellPrices || {}).filter(Boolean) as number[]);
  const minP = Math.min(...allPrices) * 0.98;
  const maxP = Math.max(...allPrices) * 1.02;
  const range = maxP - minP || 1;
  const candleW = Math.max(3, chartW / data.length - 1.5);

  // 스케일 함수
  const scaleY = (p: number) => padding.top + chartH - ((p - minP) / range) * chartH;
  const scaleX = (i: number) => padding.left + (i / data.length) * chartW;
  const currentPrice = data[data.length - 1]?.close || buyPrice;

  // 날짜 포맷 - 월/일 형식
  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return `${d.getMonth() + 1}/${d.getDate()}`;
  };

  // X축 날짜 표시 위치 계산 - 항상 5~6개 표시
  const getXAxisIndices = () => {
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

  // 가격 포맷 (콤마 포함)
  const formatPrice = (price: number) => Math.round(price).toLocaleString();

  // 매도선 렌더 헬퍼 — 중복 제거를 위한 함수
  const renderSellLine = (
    key: string,
    price: number | undefined,
    color: string,
    label: string,
    visible?: boolean,
  ) => {
    if (!visible || !price) return null;
    const y = scaleY(price);
    return (
      <g key={key}>
        <line
          x1={padding.left} y1={y}
          x2={width - padding.right} y2={y}
          stroke={color} strokeWidth={1.5}
          strokeDasharray={key === 'maSignal' || key === 'buyPrice' ? '4,2' : undefined}
        />
        <rect
          x={width - padding.right} y={y - 8}
          width={66} height={16}
          fill={color} rx={2}
        />
        <text
          x={width - padding.right + 3} y={y + 4}
          fill="#fff" fontSize={fontSize.label} fontWeight="600"
        >
          {label} {formatPrice(price)}
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
      {/* Y축 그리드 및 가격 라벨 - 5단계 */}
      {[0, 1, 2, 3, 4].map((i) => {
        const price = minP + (range * i) / 4;
        const y = scaleY(price);
        return (
          <g key={`y-${i}`}>
            <line
              x1={padding.left} y1={y}
              x2={width - padding.right} y2={y}
              stroke="rgba(255,255,255,0.12)" strokeDasharray="3,3"
            />
            <text
              x={width - padding.right + 4} y={y + 4}
              fill="#d4d4d8" fontSize={fontSize.yAxis} fontWeight="600"
            >
              {formatPrice(price)}
            </text>
          </g>
        );
      })}

      {/* X축 기준선 */}
      <line
        x1={padding.left} y1={height - padding.bottom}
        x2={width - padding.right} y2={height - padding.bottom}
        stroke="rgba(255,255,255,0.2)"
      />

      {/* X축 날짜 라벨 */}
      {xAxisIndices.map((idx, i) => {
        if (idx >= data.length || !data[idx]?.date) return null;
        const x = scaleX(idx) + candleW / 2;
        return (
          <g key={`x-${i}`}>
            <line
              x1={x} y1={height - padding.bottom}
              x2={x} y2={height - padding.bottom + 4}
              stroke="rgba(255,255,255,0.4)"
            />
            <text
              x={x} y={height - padding.bottom + 18}
              fill="#d4d4d8" fontSize={fontSize.xAxis}
              textAnchor="middle" fontWeight="600"
            >
              {formatDate(data[idx].date)}
            </text>
          </g>
        );
      })}

      {/* 캔들 */}
      {data.map((c, i) => {
        const x = scaleX(i);
        const isUp = c.close >= c.open;
        const color = isUp ? '#10b981' : '#ef4444';
        return (
          <g key={`candle-${i}`}>
            <line
              x1={x + candleW / 2} y1={scaleY(c.high)}
              x2={x + candleW / 2} y2={scaleY(c.low)}
              stroke={color} strokeWidth={1}
            />
            <rect
              x={x} y={scaleY(Math.max(c.open, c.close))}
              width={candleW}
              height={Math.max(1, Math.abs(scaleY(c.open) - scaleY(c.close)))}
              fill={color}
            />
          </g>
        );
      })}

      {/* 매수가 라인 (항상 표시) */}
      {renderSellLine('buyPrice', buyPrice, '#3b82f6', '매수', true)}

      {/* 손절가 라인 */}
      {renderSellLine('stopLoss', sellPrices?.stopLoss, '#ef4444', '손절', visibleLines?.stopLoss)}

      {/* 2/3 익절가 라인 */}
      {renderSellLine('twoThird', sellPrices?.twoThird, '#8b5cf6', '2/3익', visibleLines?.twoThird)}

      {/* 이동평균선 라인 */}
      {renderSellLine('maSignal', sellPrices?.maSignal, '#06b6d4', '이평', visibleLines?.maSignal)}

      {/* 현재가 표시 (점) */}
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
