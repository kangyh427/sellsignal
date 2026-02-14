// ============================================
// EnhancedMiniChart v4 - 캔들차트 + 기술적 분석 오버레이 + 터치/호버 툴팁
// 경로: src/components/EnhancedMiniChart.tsx
// 세션 42: 이평선, MACD, 매물대, 추세선 시각화
// 세션 61: calcVolumeProfile 개선 (10→20구간, volume 기반)
// 세션 62: 터치/호버 툴팁 + 크로스헤어
// 세션 63: ★ 매물대 전체 차트 폭 확장 (네이버 증권 스타일)
//   - 좌측 작은 바 → 차트 전체 영역 반투명 밴드
//   - 고거래량 구간: 진한 핑크 배경 + 좌측 거래량 라벨
//   - 캔들 뒤 배경으로 렌더링 (캔들 위에 겹치지 않음)
// ============================================

'use client';
import React, { useState, useRef, useCallback, useMemo } from 'react';
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
  overlays?: ChartOverlays;
  showMACDPanel?: boolean;
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

// ★ 매물대 계산 — 실제 거래량(volume) 기반, 20구간
function calcVolumeProfile(candles: CandleData[], zones = 20) {
  if (!candles || candles.length === 0) return [];

  let minP = Infinity;
  let maxP = -Infinity;
  candles.forEach(c => {
    if (c.low < minP) minP = c.low;
    if (c.high > maxP) maxP = c.high;
  });

  const range = maxP - minP;
  if (range <= 0) return [];
  const zoneSize = range / zones;

  const volumeByZone: number[] = new Array(zones).fill(0);

  candles.forEach(c => {
    const vol = (c as any).volume || 1;
    const candleLow = c.low;
    const candleHigh = c.high;
    const candleRange = candleHigh - candleLow || zoneSize * 0.1;

    for (let z = 0; z < zones; z++) {
      const zoneLow = minP + z * zoneSize;
      const zoneHigh = minP + (z + 1) * zoneSize;
      const overlapLow = Math.max(candleLow, zoneLow);
      const overlapHigh = Math.min(candleHigh, zoneHigh);

      if (overlapLow < overlapHigh) {
        const overlapRatio = (overlapHigh - overlapLow) / candleRange;
        volumeByZone[z] += vol * overlapRatio;
      }
    }
  });

  const maxVol = Math.max(...volumeByZone);
  if (maxVol <= 0) return [];

  // 전체 거래량 합계 (비율 계산용)
  const totalVol = volumeByZone.reduce((s, v) => s + v, 0);
  const avgVol = totalVol / zones;

  return volumeByZone.map((vol, i) => ({
    priceMin: minP + i * zoneSize,
    priceMax: minP + (i + 1) * zoneSize,
    volume: vol,
    strength: vol / maxVol,           // 0~1, 최대 거래량 대비 비율
    percent: (vol / totalVol) * 100,  // 전체 대비 %
    isHigh: vol > avgVol * 1.5,       // 고거래량 구간
  }));
}

// ── 숫자 포맷 유틸 ──
function fmtPrice(n: number): string {
  return Math.round(n).toLocaleString('ko-KR');
}
function fmtVolume(v: number): string {
  if (!v) return '-';
  if (v >= 100000000) return (v / 100000000).toFixed(1) + '억';
  if (v >= 10000) return (v / 10000).toFixed(0) + '만';
  return v.toLocaleString();
}
// ★ 세션 63: 매물대 거래량 간단 포맷
function fmtVolShort(v: number): string {
  if (v >= 1000000000) return (v / 1000000000).toFixed(1) + 'b';
  if (v >= 1000000) return (v / 1000000).toFixed(0) + 'm';
  if (v >= 1000) return (v / 1000).toFixed(0) + 'k';
  return String(Math.round(v));
}

// ── 메인 컴포넌트 ──
const EnhancedMiniChart: React.FC<EnhancedMiniChartProps> = ({
  data, buyPrice, width = 280, height = 240,
  sellPrices = {}, visibleLines = {},
  overlays = {}, showMACDPanel,
}) => {
  // ★ 세션 62: 호버/터치 상태
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  if (!data || data.length === 0) return null;

  // ── 반응형 판단 ──
  const isSmall = width < 300;
  const isWide = width >= 500;

  // ── MACD 패널 여부 결정 ──
  const showMACD = showMACDPanel ?? overlays.macd ?? false;
  const macdPanelH = showMACD ? 70 : 0;
  const totalH = height + macdPanelH;

  // ── 패딩 ──
  // ★ 세션 63: 매물대가 차트 전체 폭으로 변경됐으므로 좌측 패딩 고정
  const pad = {
    top: 10,
    right: isWide ? 90 : isSmall ? 74 : 82,
    bottom: 32,
    left: 6,
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
  const fs = {
    x: isWide ? 11 : isSmall ? 10 : 11,
    y: isWide ? 11 : isSmall ? 10 : 10,
    label: isWide ? 11 : isSmall ? 10 : 10,
  };

  // ── 오버레이 계산 (메모이제이션) ──
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const closes = useMemo(() => data.map(c => c.close), [data]);

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const ma20Data = useMemo(
    () => overlays.ma20 ? calcSMA(closes, 20) : null,
    [closes, overlays.ma20]
  );
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const ma60Data = useMemo(
    () => overlays.ma60 ? calcSMA(closes, 60) : null,
    [closes, overlays.ma60]
  );
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const macdData = useMemo(
    () => showMACD && closes.length >= 35 ? calcMACD(closes) : null,
    [closes, showMACD]
  );
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const trendData = useMemo(
    () => overlays.trendline ? calcTrendline(data.map(c => c.low)) : null,
    [data, overlays.trendline]
  );
  // eslint-disable-next-line react-hooks/rules-of-hooks
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
  const gridCountY = isWide ? 6 : 4;

  // ── X축 날짜 라벨 ──
  const xIndices = data.length <= 10
    ? Array.from({ length: data.length }, (_, i) => i).filter((_, i) => i % 2 === 0)
    : [0, Math.floor(data.length * 0.25), Math.floor(data.length * 0.5),
       Math.floor(data.length * 0.75), data.length - 1];

  const buyLabelW = isWide ? 82 : isSmall ? 74 : 78;
  const buyLabelH = 20;

  // ★ 세션 62: 마우스/터치 이벤트 핸들러
  const getIdxFromEvent = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!svgRef.current) return -1;
    const rect = svgRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0]?.clientX : e.clientX;
    if (clientX === undefined) return -1;
    const svgX = clientX - rect.left;
    if (svgX < pad.left || svgX > width - pad.right) return -1;
    const idx = Math.round(((svgX - pad.left) / cW) * data.length);
    return Math.max(0, Math.min(data.length - 1, idx));
  }, [data.length, width, cW, pad.left, pad.right]);

  const handleMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const idx = getIdxFromEvent(e);
    if (idx >= 0) setHoverIdx(idx);
  }, [getIdxFromEvent]);

  const handleLeave = useCallback(() => { setHoverIdx(null); }, []);

  // ★ 호버 중인 캔들 데이터
  const hoverCandle = hoverIdx !== null ? data[hoverIdx] : null;

  return (
    <div style={{ position: 'relative', userSelect: 'none', touchAction: 'none' }}>
      {/* ★ 상단 고정 툴팁 (호버/터치 시 표시) */}
      {hoverIdx !== null && hoverCandle && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          display: 'flex',
          alignItems: 'center',
          gap: isSmall ? 3 : 6,
          background: 'rgba(15,23,42,0.92)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 8,
          padding: isSmall ? '4px 6px' : '5px 10px',
          zIndex: 10,
          flexWrap: 'wrap',
          fontSize: isSmall ? 9 : 11,
        }}>
          {/* 날짜 */}
          <span style={{ color: '#94a3b8', fontWeight: 600 }}>
            {(() => {
              const d = new Date(hoverCandle.date);
              return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
            })()}
          </span>
          {/* OHLCV */}
          <span style={{ color: '#e2e8f0' }}>시{fmtPrice(hoverCandle.open)}</span>
          <span style={{ color: '#ef4444' }}>고{fmtPrice(hoverCandle.high)}</span>
          <span style={{ color: '#3b82f6' }}>저{fmtPrice(hoverCandle.low)}</span>
          <span style={{ color: hoverCandle.close >= hoverCandle.open ? '#10b981' : '#ef4444', fontWeight: 700 }}>
            종{fmtPrice(hoverCandle.close)}
          </span>
          {(hoverCandle as any).volume > 0 && (
            <span style={{ color: '#60a5fa' }}>량{fmtVolume((hoverCandle as any).volume)}</span>
          )}
          {/* 등락률 (전일 대비) */}
          {hoverIdx > 0 && (() => {
            const prev = data[hoverIdx - 1].close;
            const chg = ((hoverCandle.close - prev) / prev) * 100;
            return (
              <span style={{ color: chg >= 0 ? '#10b981' : '#ef4444', fontWeight: 700 }}>
                {chg >= 0 ? '+' : ''}{chg.toFixed(2)}%
              </span>
            );
          })()}
        </div>
      )}

      <svg ref={svgRef} width={width} height={totalH} style={{ display: "block", cursor: "crosshair" }}
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        onTouchStart={handleMove}
        onTouchMove={handleMove}
        onTouchEnd={handleLeave}
      >
        {/* Y축 그리드 + 가격 라벨 */}
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

        {/* ★★★ 세션 63: 매물대 Volume Profile — 네이버 증권 스타일 ★★★
            차트 전체 폭에 걸친 반투명 가로 밴드
            - 고거래량 구간: 진한 핑크/보라 (rgba(219,39,119,0.12~0.25))
            - 일반 구간: 연한 회색 (rgba(148,163,184,0.04~0.08))
            - 캔들 뒤 배경으로 렌더링 → 캔들이 위에 표시됨
            - 좌측에 거래량(m/k) + 비율(%) 라벨 표시
        */}
        {volProfile && volProfile.map((zone, i) => {
          const bandTop = y(zone.priceMax);
          const bandBottom = y(zone.priceMin);
          const bandHeight = Math.max(1, bandBottom - bandTop);
          const chartAreaWidth = cW; // 차트 영역 전체 폭

          // ★ 거래량 비례 너비 (네이버 스타일: 밴드 너비가 거래량에 비례)
          const bandWidth = chartAreaWidth * zone.strength;

          // 색상: 고거래량 = 진한 핑크, 일반 = 연한 회색
          const fillColor = zone.isHigh
            ? `rgba(219,39,119,${0.08 + zone.strength * 0.18})`   // 핑크 (8%~26% 투명도)
            : `rgba(148,163,184,${0.02 + zone.strength * 0.06})`; // 회색 (2%~8% 투명도)

          const borderColor = zone.isHigh
            ? `rgba(219,39,119,${0.15 + zone.strength * 0.2})`
            : 'transparent';

          return (
            <g key={`vp${i}`}>
              {/* 매물대 밴드 — 차트 왼쪽부터 거래량 비례 폭 */}
              <rect
                x={pad.left}
                y={bandTop}
                width={Math.max(2, bandWidth)}
                height={bandHeight}
                fill={fillColor}
                stroke={borderColor}
                strokeWidth={zone.isHigh ? 0.5 : 0}
                rx={1}
              />
              {/* ★ 고거래량 구간에 거래량 라벨 표시 */}
              {zone.isHigh && bandHeight >= 10 && (
                <text
                  x={pad.left + 3}
                  y={bandTop + bandHeight / 2 + 3}
                  fill="rgba(219,39,119,0.7)"
                  fontSize={isSmall ? 7 : 8}
                  fontWeight="600"
                >
                  {fmtVolShort(zone.volume)} ({zone.percent.toFixed(1)}%)
                </text>
              )}
            </g>
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

        {/* 캔들스틱 — ★ 호버 시 하이라이트 */}
        {data.map((c, i) => {
          const isUp = c.close >= c.open;
          const col = isUp ? "#10b981" : "#ef4444";
          const isHover = hoverIdx === i;
          return (
            <g key={`c${i}`} opacity={hoverIdx !== null && !isHover ? 0.45 : 1}>
              <line x1={x(i) + barW / 2} y1={y(c.high)} x2={x(i) + barW / 2} y2={y(c.low)}
                stroke={col} strokeWidth={isWide ? 1 : 0.8} />
              <rect x={x(i)} y={y(Math.max(c.open, c.close))}
                width={barW} height={Math.max(1, Math.abs(y(c.open) - y(c.close)))}
                fill={col}
                stroke={isHover ? '#fff' : 'none'}
                strokeWidth={isHover ? 1 : 0}
              />
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

        {/* ★ 세션 62: 크로스헤어 (호버/터치 시 표시) */}
        {hoverIdx !== null && hoverCandle && (
          <g>
            {/* 수직 크로스헤어 */}
            <line
              x1={x(hoverIdx) + barW / 2} y1={pad.top}
              x2={x(hoverIdx) + barW / 2} y2={height - pad.bottom}
              stroke="rgba(255,255,255,0.3)" strokeWidth={0.8} strokeDasharray="3,2"
            />
            {/* 수평 크로스헤어 (종가 기준) */}
            <line
              x1={pad.left} y1={y(hoverCandle.close)}
              x2={width - pad.right} y2={y(hoverCandle.close)}
              stroke="rgba(255,255,255,0.2)" strokeWidth={0.8} strokeDasharray="3,2"
            />
            {/* 하단 날짜 배지 */}
            <rect
              x={x(hoverIdx) + barW / 2 - 28} y={height - pad.bottom + 2}
              width={56} height={18}
              fill="#1e293b" stroke="#475569" strokeWidth={0.5} rx={4}
            />
            <text
              x={x(hoverIdx) + barW / 2} y={height - pad.bottom + 14}
              fill="#e2e8f0" fontSize={9} textAnchor="middle" fontWeight="600"
            >
              {(() => {
                const d = new Date(hoverCandle.date);
                return `${d.getMonth() + 1}/${d.getDate()}`;
              })()}
            </text>
            {/* 우측 가격 배지 */}
            <rect
              x={width - pad.right} y={y(hoverCandle.close) - 9}
              width={isWide ? 82 : isSmall ? 66 : 74} height={18}
              fill="#334155" rx={3}
            />
            <text
              x={width - pad.right + 4} y={y(hoverCandle.close) + 4}
              fill="#f1f5f9" fontSize={fs.label} fontWeight="600"
            >
              {fmtPrice(hoverCandle.close)}
            </text>
          </g>
        )}

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
    </div>
  );
};

export default EnhancedMiniChart;
