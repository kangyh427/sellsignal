'use client';

import React from 'react';
import type { ChartDataPoint, SellPrices, VisibleLines } from '../types';

// ============================================
// 캔들차트 컴포넌트
// ============================================

interface EnhancedCandleChartProps {
  data: ChartDataPoint[];
  width?: number;
  height?: number;
  buyPrice: number;
  sellPrices?: SellPrices;
  visibleLines?: VisibleLines;
}

const EnhancedCandleChart: React.FC<EnhancedCandleChartProps> = ({ 
  data, 
  width = 270, 
  height = 280, 
  buyPrice, 
  sellPrices = {}, 
  visibleLines = {} 
}) => {
  if (!data || data.length === 0) return null;
  
  const isSmallChart = width < 280;
  const fontSize = {
    xAxis: isSmallChart ? 10 : 11,
    yAxis: isSmallChart ? 9 : 10,
    label: isSmallChart ? 8 : 9
  };
  
  const padding = { top: 10, right: 70, bottom: 34, left: 6 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;
  
  const allPrices = data.flatMap(d => [d.high, d.low])
    .concat([buyPrice])
    .concat(Object.values(sellPrices).filter((price): price is number => typeof price === 'number'));
  const minP = Math.min(...allPrices) * 0.98;
  const maxP = Math.max(...allPrices) * 1.02;
  const range = maxP - minP || 1;
  const candleW = Math.max(3, (chartW / data.length) - 1.5);
  
  const scaleY = (p: number) => {
    if (typeof p !== 'number' || isNaN(p) || !isFinite(p)) {
      return padding.top + chartH / 2;
    }
    return padding.top + chartH - ((p - minP) / range) * chartH;
  };
  const scaleX = (i: number) => padding.left + (i / data.length) * chartW;
  const currentPrice = data[data.length - 1]?.close || buyPrice;

  const formatDate = (date: Date) => {
    const d = new Date(date);
    return `${d.getMonth() + 1}/${d.getDate()}`;
  };

  const getXAxisIndices = () => {
    const dataLen = data.length;
    if (dataLen <= 10) {
      return Array.from({ length: dataLen }, (_, i) => i).filter((_, i) => i % 2 === 0);
    } else if (dataLen <= 20) {
      return [
        0, 
        Math.floor(dataLen * 0.25), 
        Math.floor(dataLen * 0.5), 
        Math.floor(dataLen * 0.75), 
        dataLen - 1
      ];
    } else {
      return [
        0, 
        Math.floor(dataLen * 0.2), 
        Math.floor(dataLen * 0.4), 
        Math.floor(dataLen * 0.6), 
        Math.floor(dataLen * 0.8), 
        dataLen - 1
      ];
    }
  };
  
  const xAxisIndices = getXAxisIndices();
  
  const formatPrice = (price: number) => Math.round(price).toLocaleString();

  return (
    <svg width={width} height={height} style={{ display: 'block', background: 'rgba(0,0,0,0.3)', borderRadius: '8px' }}>
      {/* Y축 그리드 및 가격 라벨 */}
      {[0,1,2,3,4].map(i => {
        const price = minP + (range * i / 4);
        const y = scaleY(price);
        return (
          <g key={i}>
            <line x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="rgba(255,255,255,0.12)" strokeDasharray="3,3" />
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
      
      {/* X축 기준선 */}
      <line 
        x1={padding.left} 
        y1={height - padding.bottom} 
        x2={width - padding.right} 
        y2={height - padding.bottom} 
        stroke="rgba(255,255,255,0.2)" 
      />
      
      {/* X축 날짜 라벨 */}
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
      
      {/* 캔들 */}
      {data.map((c, i) => {
        const x = scaleX(i);
        const isUp = c.close >= c.open;
        const color = isUp ? '#10b981' : '#ef4444';
        return (
          <g key={i}>
            <line x1={x + candleW/2} y1={scaleY(c.high)} x2={x + candleW/2} y2={scaleY(c.low)} stroke={color} strokeWidth={1} />
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
      
      {/* 매수가 라인 */}
      <line x1={padding.left} y1={scaleY(buyPrice)} x2={width - padding.right} y2={scaleY(buyPrice)} stroke="#3b82f6" strokeWidth={1.5} strokeDasharray="4,2"/>
      <rect x={width - padding.right} y={scaleY(buyPrice) - 8} width={66} height={16} fill="#3b82f6" rx={2} />
      <text x={width - padding.right + 3} y={scaleY(buyPrice) + 4} fill="#fff" fontSize={fontSize.label} fontWeight="600">
        매수 {buyPrice.toLocaleString()}
      </text>
      
      {/* 손절가 라인 */}
      {visibleLines?.stopLoss && sellPrices?.stopLoss && (
        <g>
          <line x1={padding.left} y1={scaleY(sellPrices.stopLoss)} x2={width - padding.right} y2={scaleY(sellPrices.stopLoss)} stroke="#ef4444" strokeWidth={1.5}/>
          <rect x={width - padding.right} y={scaleY(sellPrices.stopLoss) - 8} width={66} height={16} fill="#ef4444" rx={2} />
          <text x={width - padding.right + 3} y={scaleY(sellPrices.stopLoss) + 4} fill="#fff" fontSize={fontSize.label} fontWeight="600">
            손절 {sellPrices.stopLoss.toLocaleString()}
          </text>
        </g>
      )}
      
      {/* 2/3 익절가 라인 */}
      {visibleLines?.twoThird && sellPrices?.twoThird && (
        <g>
          <line x1={padding.left} y1={scaleY(sellPrices.twoThird)} x2={width - padding.right} y2={scaleY(sellPrices.twoThird)} stroke="#8b5cf6" strokeWidth={1.5}/>
          <rect x={width - padding.right} y={scaleY(sellPrices.twoThird) - 8} width={66} height={16} fill="#8b5cf6" rx={2} />
          <text x={width - padding.right + 3} y={scaleY(sellPrices.twoThird) + 4} fill="#fff" fontSize={fontSize.label} fontWeight="600">
            2/3익 {sellPrices.twoThird.toLocaleString()}
          </text>
        </g>
      )}
      
      {/* 이동평균선 라인 */}
      {visibleLines?.maSignal && sellPrices?.maSignal && (
        <g>
          <line x1={padding.left} y1={scaleY(sellPrices.maSignal)} x2={width - padding.right} y2={scaleY(sellPrices.maSignal)} stroke="#06b6d4" strokeWidth={1.5} strokeDasharray="4,2"/>
          <rect x={width - padding.right} y={scaleY(sellPrices.maSignal) - 8} width={66} height={16} fill="#06b6d4" rx={2} />
          <text x={width - padding.right + 3} y={scaleY(sellPrices.maSignal) + 4} fill="#fff" fontSize={fontSize.label} fontWeight="600">
            이평 {sellPrices.maSignal.toLocaleString()}
          </text>
        </g>
      )}
      
      {/* 3봉 매도법 라인 */}
      {visibleLines?.candle3_50 && sellPrices?.candle3_50 && (
        <g>
          <line x1={padding.left} y1={scaleY(sellPrices.candle3_50)} x2={width - padding.right} y2={scaleY(sellPrices.candle3_50)} stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="2,2"/>
          <rect x={width - padding.right} y={scaleY(sellPrices.candle3_50) - 8} width={66} height={16} fill="#f59e0b" rx={2} />
          <text x={width - padding.right + 3} y={scaleY(sellPrices.candle3_50) + 4} fill="#fff" fontSize={fontSize.label} fontWeight="600">
            3봉 {sellPrices.candle3_50.toLocaleString()}
          </text>
        </g>
      )}
      
      {/* 현재가 표시 */}
      <circle 
        cx={scaleX(data.length - 1) + candleW/2} 
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
