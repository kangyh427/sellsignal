// ============================================
// PositionCardChart 컴포넌트
// 위치: src/components/position/PositionCardChart.tsx
// ============================================
// 역할: 캔들차트 래퍼 (모바일: 토글, 데스크탑: 항상 표시)
// 원본: PositionCard.tsx renderChart() (라인 500~608)

'use client';

import React, { useState, useMemo } from 'react';
import type { PriceData, SellPrices, VisibleLines } from '../../types';
import EnhancedCandleChart from '../EnhancedCandleChart';

// ── Props 타입 ──
interface PositionCardChartProps {
  priceData: PriceData[] | undefined;
  buyPrice: number;
  sellPrices: SellPrices;
  visibleLines: VisibleLines;
  naverChartUrl: string;
  isMobile: boolean;
  isTablet: boolean;
}

/**
 * 반응형 차트 크기를 계산합니다.
 * - 모바일: 화면 너비에 맞춤 (최대 320px), 높이 200px
 * - 태블릿: 240 x 240
 * - 데스크탑: 270 x 280
 */
const getChartSize = (isMobile: boolean, isTablet: boolean) => {
  if (isMobile) {
    const w = typeof window !== 'undefined' ? Math.min(320, window.innerWidth - 48) : 320;
    return { width: w, height: 200 };
  }
  if (isTablet) return { width: 240, height: 240 };
  return { width: 270, height: 280 };
};

const PositionCardChart: React.FC<PositionCardChartProps> = ({
  priceData,
  buyPrice,
  sellPrices,
  visibleLines,
  naverChartUrl,
  isMobile,
  isTablet,
}) => {
  // 모바일에서 차트 접기/펼치기 상태
  const [showChart, setShowChart] = useState(!isMobile);

  // 차트 크기 (리렌더 최소화)
  const chartSize = useMemo(
    () => getChartSize(isMobile, isTablet),
    [isMobile, isTablet],
  );

  // 네이버 차트 열기
  const openNaverChart = () => {
    window.open(naverChartUrl, '_blank');
  };

  // ── 모바일 레이아웃: 토글 + 차트 ──
  if (isMobile) {
    return (
      <div>
        {/* 차트 토글 버튼 */}
        <button
          onClick={() => setShowChart(!showChart)}
          style={{
            width: '100%',
            padding: '10px',
            background: 'rgba(59,130,246,0.1)',
            border: '1px solid rgba(59,130,246,0.3)',
            borderRadius: '8px',
            color: '#60a5fa',
            fontSize: '13px',
            fontWeight: '600',
            cursor: 'pointer',
            marginBottom: showChart ? '10px' : '0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            minHeight: '44px', // 터치 타겟 최소 크기
          }}
        >
          📊 차트 {showChart ? '접기 ▲' : '보기 ▼'}
        </button>

        {/* 차트 콘텐츠 (토글) */}
        {showChart && (
          <div onClick={openNaverChart} style={{ cursor: 'pointer' }}>
            <div
              style={{
                background: 'rgba(0,0,0,0.3)',
                borderRadius: '8px',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <EnhancedCandleChart
                data={priceData?.slice(-30)}
                width={chartSize.width}
                height={chartSize.height}
                buyPrice={buyPrice}
                sellPrices={sellPrices}
                visibleLines={visibleLines}
              />
            </div>
            <div
              style={{
                textAlign: 'center',
                marginTop: '4px',
                fontSize: '11px',
                color: '#64748b',
              }}
            >
              탭하여 네이버 차트 열기
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── 데스크탑/태블릿: 항상 표시 ──
  return (
    <div
      onClick={openNaverChart}
      style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column' }}
    >
      <div
        style={{
          background: 'rgba(0,0,0,0.3)',
          borderRadius: '8px',
          padding: '4px',
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <EnhancedCandleChart
          data={priceData?.slice(-40)}
          width={chartSize.width}
          height={chartSize.height}
          buyPrice={buyPrice}
          sellPrices={sellPrices}
          visibleLines={visibleLines}
        />
      </div>
      <div
        style={{
          textAlign: 'center',
          marginTop: '4px',
          fontSize: '12px',
          color: '#64748b',
        }}
      >
        클릭 → 네이버 증권 차트
      </div>
    </div>
  );
};

export default PositionCardChart;
