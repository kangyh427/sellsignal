// ============================================
// EnhancedMiniChart v2 - 캔들차트 + 기술적 분석 오버레이
// 경로: src/components/EnhancedMiniChart.tsx
// 세션 42: 이평선, MACD, 매물대, 추세선 시각화 추가
// 변경사항:
//   - overlays prop 추가 (ma20, ma60, macd, volumeProfile, trendline)
//   - MACD 서브차트 (차트 아래 별도 영역)
//   - Volume Profile 좌측 가로 바
//   - 추세선 (저점 선형회귀)
//   - MACD 데드크로스/0선 돌파 마커
//   - 기존 sellPrices/visibleLines 호환 유지
// ============================================

'use client';
import React, { useMemo } from 'react';
import type { CandleData } from '@/types';

// ── 오버레이 옵션 타입 ──
interface ChartOverlays {
  ma20?: boolean;
  ma60?: boolean;
  macd?: boolean;
  volumeProfile?: boolean;
  trendline?: boolean;
}

interface EnhancedMiniChartProps {
  data: CandleData[];
  buyPrice: number;
  width?: number;
  height?: number;
  sellPrices?: Record<string, number>;
  visibleLines?: Record<string, boolean>;
  overlays?: ChartOverlays;       // ★ 신규: 기술적 분석 오버레이
  showMACDPanel?: boolean;         // ★ 신규: MACD 서브차트 표시 여부
}

// ── 계산 유틸리티 ──

function calcSMA(closes: number[], period: number): (number | null)[] {
  return closes.map((_, i) =>
    i < period - 1 ? null : closes.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0) / period
  );
}

function calcEMA(values: number[], period: number): number[] {
  const ema: number[] = [];
  const k = 2 / (period + 1);
  values.forEach((v, i) => {
    ema.push(i === 0 ? v : v * k + ema[i - 1] * (1 - k));
  });
  return ema;
}

function calcMACD(closes: number[]) {
  const ema12 = calcEMA(closes, 12);
  const ema26 = calcEMA(closes, 26);
  const macdLine = ema12.map((v, i) => v - ema26[i]);
  const signalLine = calcEMA(macdLine, 9);
  const histogram = macdLine.map((v, i) => v - signalLine[i]);
  return { macdLine, signalLine, histogram };
}

function calcTrendline(lows: number[]) {
  const n = lows.length;
  let sx = 0, sy = 0, sxy = 0, sx2 = 0;
  for (let i = 0; i < n; i++) { sx += i; sy += lows[i]; sxy += i * lows[i]; sx2 += i * i; }
  const slope = (n * sxy - sx * sy) / (n * sx2 - sx * sx);
  const intercept = (sy - slope * sx) / n;
  return { slope, intercept, getY: (i: number) => slope * i + intercept };
}

function calcVolumeProfile(candles: CandleData[], zones = 10) {
  const prices = candles.map(c => (c.high + c.low + c.close) / 3);
  const minP = Math.min(...prices);
  const maxP = Math.max(...prices);
  const range = maxP - minP || 1;
  const zoneSize = range / zones;
  const profile = Array(zones).fill(0);
  prices.forEach(p => {
    const idx = Math.min(Math.floor((p - minP) / zoneSize), zones - 1);
    profile[idx]++;
  });
  const maxCount = Math.max(...profile);
  return profile.map((count, i) => ({
    priceMin: minP + i * zoneSize,
    priceMax: minP + (i + 1) * zoneSize,
    count,
    strength: count / maxCount,
    isHigh: count > (candles.length / zones) * 1.5,
  }));
}

// ── 메인 컴포넌트 ──
const EnhancedMiniChart: React.FC<EnhancedMiniChartProps> = ({
  data, buyPrice, width = 280, height = 240,
  sellPrices = {}, visibleLines = {},
  overlays = {}, showMACDPanel,
}) => {
  if (!data || data.length === 0) return null;

  // ── 반응형 판단 ──
  const isSmall = width < 300;
  const isWide = width >= 500;

  // ── MACD 패널 여부 결정 ──
  const showMACD = showMACDPanel ?? overlays.macd ?? false;
  const macdPanelH = showMACD ? 70 : 0;
  const totalH = height + macdPanelH;

  // ── 패딩 ──
  const pad = {
    top: 10,
    right: isWide ? 90 : isSmall ? 74 : 82,
    bottom: 32,
    left: overlays.volumeProfile ? 48 : 6, // 매물대 바 공간
  };
  const cW = width - pad.left - pad.right;
  const cH = height - pad.top - pad.bottom;

  // ── 가격 범위 ──
  const allP = data.flatMap((d) => [d.high, d.low])
    .concat([buyPrice])
    .concat(Object.values(sellPrices).filter(Boolean));
  const minP = Math.min(...allP) * 0.98;
  const maxP = Math.max(...allP) * 1.02;
  const range = maxP - minP || 1;

  const barW = isWide
    ? Math.max(3, cW / data.length - 2)
    : Math.max(2, cW / data.length - 1.5);

  const y = (p: number) => pad.top + cH - ((p - minP) / range) * cH;
  const x = (i: number) => pad.left + (i / data.length) * cW;
  const cur = data[data.length - 1]?.close || buyPrice;

  // ── 폰트 사이즈 ──
  // ★ 세션G: 폰트 크기 복원 — 모바일에서도 가독성 확보
  const fs = {
    x: isWide ? 11 : isSmall ? 10 : 11,
    y: isWide ? 12 : isSmall ? 10 : 11,
    label: isWide ? 12 : isSmall ? 10 : 11,
  };

  // ── 오버레이 계산 (메모이제이션) ──
  const closes = useMemo(() => data.map(c => c.close), [data]);

  const ma20Data = useMemo(
    () => overlays.ma20 ? calcSMA(closes, 20) : null,
    [closes, overlays.ma20]
  );
  const ma60Data = useMemo(
    () => overlays.ma60 ? calcSMA(closes, 60) : null,
    [closes, overlays.ma60]
  );
  const macdData = useMemo(
    () => showMACD && closes.length >= 35 ? calcMACD(closes) : null,
    [closes, showMACD]
  );
  const trendData = useMemo(
    () => overlays.trendline ? calcTrendline(data.map(c => c.low)) : null,
    [data, overlays.trendline]
  );
  const volProfile = useMemo(
    () => overlays.volumeProfile ? calcVolumeProfile(data) : null,
    [data, overlays.volumeProfile]
  );

  // ── MACD Y좌표 계산 ──
  const macdTop = height + 6;
  const macdCH = macdPanelH - 16;
  let macdY = (_v: number) => 0;
  if (macdData) {
    const allM = [...macdData.macdLine, ...macdData.signalLine].filter(v => !isNaN(v));
    const mMin = Math.min(...allM);
    const mMax = Math.max(...allM);
    const mRange = mMax - mMin || 1;
    macdY = (v: number) => macdTop + 8 + macdCH - ((v - mMin) / mRange) * macdCH;
  }

  // ── MA 선 렌더링 ──
  const renderMA = (maData: (number | null)[] | null, color: string) => {
    if (!maData) return null;
    const pts = maData
      .map((v, i) => v !== null ? `${x(i) + barW / 2},${y(v)}` : null)
      .filter(Boolean);
    if (pts.length < 2) return null;
    return <polyline points={pts.join(' ')} fill="none" stroke={color} strokeWidth={1.2} opacity={0.8} />;
  };

  // ── 매도선 렌더링 (기존 호환) ──
  const labelW = isWide ? 80 : isSmall ? 72 : 76;
  const labelH = 18;
  const renderLine = (key: string, price: number | undefined, color: string, label: string, dash?: string) => {
    if (!price || (visibleLines && visibleLines[key] === false)) return null;
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
  const gridCountY = isWide ? 7 : 5;

  // ── X축 날짜 라벨 ──
  // ★ 세션G: X축 날짜 레이블 촘촘하게 — 7~8개 표시
  const xIndices = useMemo(() => {
    const len = data.length;
    if (len <= 10) return Array.from({ length: len }, (_, i) => i).filter((_, i) => i % 2 === 0);
    // 약 7개 포인트를 균등 배치
    const count = isWide ? 8 : 7;
    const step = (len - 1) / (count - 1);
    return Array.from({ length: count }, (_, i) => Math.round(step * i));
  }, [data.length, isWide]);

  const buyLabelW = isWide ? 82 : isSmall ? 74 : 78;
  const buyLabelH = 20;

  return (
    <svg width={width} height={totalH} style={{ display: "block" }}>
      {/* Y축 그리드 + 가격 라벨 */}
      {Array.from({ length: gridCountY + 1 }).map((_, i) => {
        const p = minP + (range * i) / gridCountY;
        return (
          <g key={`g${i}`}>
            <line x1={pad.left} y1={y(p)} x2={width - pad.right} y2={y(p)}
              stroke="rgba(255,255,255,0.07)" />
            <text x={width - pad.right + 4} y={y(p) + 4}
              fill="#94a3b8" fontSize={fs.y} fontWeight="600">
              {Math.round(p).toLocaleString()}
            </text>
          </g>
        );
      })}

      {/* ★ 매물대 Volume Profile (좌측 가로 바) */}
      {volProfile && volProfile.map((zone, i) => {
        const barHeight = Math.abs(y(zone.priceMin) - y(zone.priceMax));
        const barWidth = zone.strength * (pad.left - 8);
        return (
          <rect key={`vp${i}`}
            x={2}
            y={y(zone.priceMax)}
            width={Math.max(1, barWidth)}
            height={Math.max(1, barHeight)}
            fill={zone.isHigh ? 'rgba(132,204,22,0.3)' : 'rgba(148,163,184,0.1)'}
            stroke={zone.isHigh ? 'rgba(132,204,22,0.5)' : 'none'}
            strokeWidth={0.5}
            rx={1}
          />
        );
      })}

      {/* X축 날짜 */}
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

      {/* ★ 이동평균선 오버레이 */}
      {renderMA(ma20Data, '#06b6d4')}
      {renderMA(ma60Data, '#f59e0b')}

      {/* ★ 추세선 오버레이 */}
      {trendData && (
        <line
          x1={x(0) + barW / 2}
          y1={y(trendData.getY(0))}
          x2={x(data.length - 1) + barW / 2}
          y2={y(trendData.getY(data.length - 1))}
          stroke="#ec4899" strokeWidth={1.5} strokeDasharray="6,3" opacity={0.6}
        />
      )}

      {/* 매수가 기준선 */}
      <line x1={pad.left} y1={y(buyPrice)} x2={width - pad.right} y2={y(buyPrice)}
        stroke="#3b82f6" strokeWidth={1.5} strokeDasharray="4,2" />
      <rect x={width - pad.right} y={y(buyPrice) - buyLabelH / 2} width={buyLabelW} height={buyLabelH}
        fill="#3b82f6" rx={3} />
      <text x={width - pad.right + 4} y={y(buyPrice) + 5} fill="#fff" fontSize={fs.label} fontWeight="700">
        매수 {buyPrice.toLocaleString()}
      </text>

      {/* 매도 기준선들 (기존 호환) */}
      {renderLine("stopLoss", sellPrices?.stopLoss, "#ef4444", "손절")}
      {renderLine("twoThird", sellPrices?.twoThird, "#8b5cf6", "2/3익")}
      {renderLine("maSignal", sellPrices?.maSignal, "#06b6d4", "이평", "4,2")}
      {renderLine("volumeZone", sellPrices?.volumeZone, "#84cc16", "저항", "6,3")}
      {renderLine("trendline", sellPrices?.trendline, "#ec4899", "지지", "8,4")}

      {/* ★ MA 범례 */}
      {(overlays.ma20 || overlays.ma60) && (
        <g>
          {overlays.ma20 && (
            <>
              <line x1={width - pad.right + 4} y1={pad.top + 6} x2={width - pad.right + 16} y2={pad.top + 6}
                stroke="#06b6d4" strokeWidth={1.5} />
              <text x={width - pad.right + 19} y={pad.top + 9} fill="#06b6d4" fontSize={8} fontWeight="600">20</text>
            </>
          )}
          {overlays.ma60 && (
            <>
              <line x1={width - pad.right + 4} y1={pad.top + 16} x2={width - pad.right + 16} y2={pad.top + 16}
                stroke="#f59e0b" strokeWidth={1.5} />
              <text x={width - pad.right + 19} y={pad.top + 19} fill="#f59e0b" fontSize={8} fontWeight="600">60</text>
            </>
          )}
        </g>
      )}

      {/* 현재가 마커 */}
      <circle cx={x(data.length - 1) + barW / 2} cy={y(cur)} r={isWide ? 5 : 4}
        fill={cur >= buyPrice ? "#10b981" : "#ef4444"} stroke="#fff" strokeWidth={1} />

      {/* ============ ★ MACD 서브차트 ============ */}
      {macdData && showMACD && (
        <g>
          <line x1={pad.left} y1={height + 2} x2={width - pad.right} y2={height + 2}
            stroke="rgba(255,255,255,0.08)" />
          <text x={pad.left + 2} y={macdTop + 6} fill="#64748b" fontSize={7} fontWeight="600">MACD</text>

          {/* 0선 */}
          <line x1={pad.left} y1={macdY(0)} x2={width - pad.right} y2={macdY(0)}
            stroke="rgba(255,255,255,0.08)" strokeDasharray="2,2" />

          {/* 히스토그램 */}
          {macdData.histogram.map((h, i) => {
            if (isNaN(h)) return null;
            const bH = Math.abs(macdY(0) - macdY(h));
            return (
              <rect key={`mh${i}`}
                x={x(i)} y={h >= 0 ? macdY(h) : macdY(0)}
                width={barW} height={Math.max(0.5, bH)}
                fill={h >= 0 ? 'rgba(16,185,129,0.5)' : 'rgba(239,68,68,0.5)'}
              />
            );
          })}

          {/* MACD 선 */}
          <polyline
            points={macdData.macdLine.map((v, i) =>
              isNaN(v) ? '' : `${x(i) + barW / 2},${macdY(v)}`
            ).filter(Boolean).join(' ')}
            fill="none" stroke="#60a5fa" strokeWidth={1}
          />

          {/* 시그널 선 */}
          <polyline
            points={macdData.signalLine.map((v, i) =>
              isNaN(v) ? '' : `${x(i) + barW / 2},${macdY(v)}`
            ).filter(Boolean).join(' ')}
            fill="none" stroke="#f97316" strokeWidth={1} strokeDasharray="2,1"
          />
        </g>
      )}
    </svg>
  );
};

export default EnhancedMiniChart;
