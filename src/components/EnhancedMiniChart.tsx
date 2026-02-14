// ============================================
// EnhancedMiniChart v4.1 - 캔들차트 + 기술적 분석 오버레이
// 경로: src/components/EnhancedMiniChart.tsx
// 세션 63: React Error #310 수정 + 매물대 네이버 스타일
// 세션 64: 매물대 색상 통일 + 매도선 라벨 "저항"→"지지" 수정
//
// [핵심 수정 세션 64]
// 1. 매물대: 고거래량=핑크/나머지=투명 → 모두 동일 슬레이트색, strength별 투명도만 차이
// 2. volumeZone 매도선 라벨: "저항" → "지지" (PPT: 하단 지지 이탈 시 매도)
// ============================================

'use client';
import React, { useState, useRef, useCallback, useMemo } from 'react';
import type { CandleData } from '@/types';

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

function calcVolumeProfile(candles: CandleData[], zones = 20) {
  if (!candles || candles.length === 0) return [];
  let minP = Infinity, maxP = -Infinity;
  candles.forEach(c => { if (c.low < minP) minP = c.low; if (c.high > maxP) maxP = c.high; });
  const range = maxP - minP;
  if (range <= 0) return [];
  const zoneSize = range / zones;
  const volumeByZone: number[] = new Array(zones).fill(0);

  candles.forEach(c => {
    const vol = (c as any).volume || 1;
    const candleRange = (c.high - c.low) || zoneSize * 0.1;
    for (let z = 0; z < zones; z++) {
      const zoneLow = minP + z * zoneSize;
      const zoneHigh = minP + (z + 1) * zoneSize;
      const overlapLow = Math.max(c.low, zoneLow);
      const overlapHigh = Math.min(c.high, zoneHigh);
      if (overlapLow < overlapHigh) {
        volumeByZone[z] += vol * ((overlapHigh - overlapLow) / candleRange);
      }
    }
  });

  const maxVol = Math.max(...volumeByZone);
  if (maxVol <= 0) return [];
  const totalVol = volumeByZone.reduce((s, v) => s + v, 0);
  const avgVol = totalVol / zones;

  return volumeByZone.map((vol, i) => ({
    priceMin: minP + i * zoneSize,
    priceMax: minP + (i + 1) * zoneSize,
    volume: vol,
    strength: vol / maxVol,
    percent: (vol / totalVol) * 100,
    isHigh: vol > avgVol * 1.5,
  }));
}

function fmtPrice(n: number): string { return Math.round(n).toLocaleString('ko-KR'); }
function fmtVolume(v: number): string {
  if (!v) return '-';
  if (v >= 100000000) return (v / 100000000).toFixed(1) + '억';
  if (v >= 10000) return (v / 10000).toFixed(0) + '만';
  return v.toLocaleString();
}
function fmtVolShort(v: number): string {
  if (v >= 1000000) return (v / 1000000).toFixed(0) + 'm';
  if (v >= 1000) return (v / 1000).toFixed(0) + 'k';
  return String(Math.round(v));
}

// ══════════════════════════════════════════════
// 메인 컴포넌트
// ══════════════════════════════════════════════
const EnhancedMiniChart: React.FC<EnhancedMiniChartProps> = ({
  data, buyPrice, width = 280, height = 240,
  sellPrices = {}, visibleLines = {},
  overlays = {}, showMACDPanel,
}) => {
  // ★★★ React #310 수정: 모든 훅을 최상단에 배치 ★★★
  // early return 전에 모든 useState/useRef/useCallback/useMemo 선언
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  // 안전한 데이터 참조 (빈 배열 방어)
  const safeData = data && data.length > 0 ? data : [];
  const hasData = safeData.length > 0;

  const closes = useMemo(() => safeData.map(c => c.close), [safeData]);

  const ma20Data = useMemo(
    () => (overlays.ma20 && closes.length >= 20) ? calcSMA(closes, 20) : null,
    [closes, overlays.ma20]
  );
  const ma60Data = useMemo(
    () => (overlays.ma60 && closes.length >= 60) ? calcSMA(closes, 60) : null,
    [closes, overlays.ma60]
  );

  const showMACD = showMACDPanel ?? overlays.macd ?? false;
  const macdData = useMemo(
    () => (showMACD && closes.length >= 35) ? calcMACD(closes) : null,
    [closes, showMACD]
  );
  const trendData = useMemo(
    () => (overlays.trendline && safeData.length > 1) ? calcTrendline(safeData.map(c => c.low)) : null,
    [safeData, overlays.trendline]
  );
  const volProfile = useMemo(
    () => overlays.volumeProfile ? calcVolumeProfile(safeData) : null,
    [safeData, overlays.volumeProfile]
  );

  // 이벤트 핸들러도 훅이므로 최상단에
  const isSmall = width < 300;
  const isWide = width >= 500;
  const pad = { top: 10, right: isWide ? 90 : isSmall ? 74 : 82, bottom: 32, left: 6 };
  const cW = width - pad.left - pad.right;
  const cH = height - pad.top - pad.bottom;

  const getIdxFromEvent = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!svgRef.current || !hasData) return -1;
    const rect = svgRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0]?.clientX : e.clientX;
    if (clientX === undefined) return -1;
    const svgX = clientX - rect.left;
    if (svgX < pad.left || svgX > width - pad.right) return -1;
    const idx = Math.round(((svgX - pad.left) / cW) * safeData.length);
    return Math.max(0, Math.min(safeData.length - 1, idx));
  }, [hasData, safeData.length, width, cW, pad.left, pad.right]);

  const handleMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const idx = getIdxFromEvent(e);
    if (idx >= 0) setHoverIdx(idx);
  }, [getIdxFromEvent]);

  const handleLeave = useCallback(() => { setHoverIdx(null); }, []);

  // ★★★ 훅 선언 완료 — 이제 early return 가능 ★★★
  if (!hasData) return null;

  // ── 레이아웃 계산 ──
  const macdPanelH = showMACD ? 70 : 0;
  const totalH = height + macdPanelH;

  const allP = safeData.flatMap((d) => [d.high, d.low])
    .concat([buyPrice])
    .concat(Object.values(sellPrices).filter(Boolean));
  const minP = Math.min(...allP) * 0.98;
  const maxP = Math.max(...allP) * 1.02;
  const range = maxP - minP || 1;

  const barW = isWide
    ? Math.max(3, cW / safeData.length - 2)
    : Math.max(2, cW / safeData.length - 1.5);

  const y = (p: number) => pad.top + cH - ((p - minP) / range) * cH;
  const x = (i: number) => pad.left + (i / safeData.length) * cW;
  const cur = safeData[safeData.length - 1]?.close || buyPrice;

  const fs = {
    x: isWide ? 11 : isSmall ? 10 : 11,
    y: isWide ? 11 : isSmall ? 10 : 10,
    label: isWide ? 11 : isSmall ? 10 : 10,
  };

  // MACD Y좌표
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

  // MA 선 렌더링
  const renderMA = (maData: (number | null)[] | null, color: string) => {
    if (!maData) return null;
    const pts = maData.map((v, i) => v !== null ? `${x(i) + barW / 2},${y(v)}` : null).filter(Boolean);
    if (pts.length < 2) return null;
    return <polyline points={pts.join(' ')} fill="none" stroke={color} strokeWidth={1.2} opacity={0.8} />;
  };

  // 매도선 렌더링
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

  const gridCountY = isWide ? 6 : 4;
  const xIndices = safeData.length <= 10
    ? Array.from({ length: safeData.length }, (_, i) => i).filter((_, i) => i % 2 === 0)
    : [0, Math.floor(safeData.length * 0.25), Math.floor(safeData.length * 0.5),
       Math.floor(safeData.length * 0.75), safeData.length - 1];

  const buyLabelW = isWide ? 82 : isSmall ? 74 : 78;
  const buyLabelH = 20;

  const hoverCandle = hoverIdx !== null ? safeData[hoverIdx] : null;

  return (
    <div style={{ position: 'relative', userSelect: 'none', touchAction: 'none' }}>
      {/* 상단 고정 툴팁 */}
      {hoverIdx !== null && hoverCandle && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0,
          display: 'flex', alignItems: 'center', gap: isSmall ? 3 : 6,
          background: 'rgba(15,23,42,0.92)', backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8,
          padding: isSmall ? '4px 6px' : '5px 10px', zIndex: 10,
          flexWrap: 'wrap', fontSize: isSmall ? 9 : 11,
        }}>
          <span style={{ color: '#94a3b8', fontWeight: 600 }}>
            {(() => { const d = new Date(hoverCandle.date); return `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')}`; })()}
          </span>
          <span style={{ color: '#e2e8f0' }}>시{fmtPrice(hoverCandle.open)}</span>
          <span style={{ color: '#ef4444' }}>고{fmtPrice(hoverCandle.high)}</span>
          <span style={{ color: '#3b82f6' }}>저{fmtPrice(hoverCandle.low)}</span>
          <span style={{ color: hoverCandle.close >= hoverCandle.open ? '#10b981' : '#ef4444', fontWeight: 700 }}>
            종{fmtPrice(hoverCandle.close)}
          </span>
          {(hoverCandle as any).volume > 0 && (
            <span style={{ color: '#60a5fa' }}>량{fmtVolume((hoverCandle as any).volume)}</span>
          )}
          {hoverIdx > 0 && (() => {
            const prev = safeData[hoverIdx - 1].close;
            const chg = ((hoverCandle.close - prev) / prev) * 100;
            return <span style={{ color: chg >= 0 ? '#10b981' : '#ef4444', fontWeight: 700 }}>{chg >= 0 ? '+' : ''}{chg.toFixed(2)}%</span>;
          })()}
        </div>
      )}

      <svg ref={svgRef} width={width} height={totalH} style={{ display: "block", cursor: "crosshair" }}
        onMouseMove={handleMove} onMouseLeave={handleLeave}
        onTouchStart={handleMove} onTouchMove={handleMove} onTouchEnd={handleLeave}
      >
        {/* Y축 그리드 */}
        {Array.from({ length: gridCountY + 1 }).map((_, i) => {
          const p = minP + (range * i) / gridCountY;
          return (
            <g key={`g${i}`}>
              <line x1={pad.left} y1={y(p)} x2={width - pad.right} y2={y(p)} stroke="rgba(255,255,255,0.04)" />
              <text x={width - pad.right + 4} y={y(p) + 4} fill="#94a3b8" fontSize={fs.y} fontWeight="500">
                {Math.round(p).toLocaleString()}
              </text>
            </g>
          );
        })}

        {/* ★★★ 매물대 — 네이버 증권 스타일 (차트 전체 폭 반투명 밴드) ★★★ */}
        {/* 세션 64: 모든 매물대 동일 색상 통일, 검정배경에 맞게 밝기 조절 */}
        {/* 캔들을 가리지 않는 선에서 매물대를 은은하게 표시 */}
        {volProfile && volProfile.map((zone, i) => {
          const bandTop = y(zone.priceMax);
          const bandBottom = y(zone.priceMin);
          const bandHeight = Math.max(1, bandBottom - bandTop);
          // 거래량 비례 폭 (차트 영역의 strength%)
          const bandWidth = cW * zone.strength;

          // ★ 통일 색상: 연보라/슬레이트 계열, strength에 따라 투명도만 차이
          // 최소 투명도 0.06 ~ 최대 0.22 (캔들을 가리지 않도록)
          const alpha = 0.06 + zone.strength * 0.16;
          const fillColor = `rgba(148,163,184,${alpha})`;

          return (
            <g key={`vp${i}`}>
              <rect x={pad.left} y={bandTop} width={Math.max(2, bandWidth)} height={bandHeight}
                fill={fillColor} rx={1} />
              {/* 고거래량 구간에만 거래량 라벨 표시 */}
              {zone.isHigh && bandHeight >= 10 && (
                <text x={pad.left + 3} y={bandTop + bandHeight / 2 + 3}
                  fill="rgba(148,163,184,0.55)" fontSize={isSmall ? 7 : 8} fontWeight="600">
                  {fmtVolShort(zone.volume)} ({zone.percent.toFixed(1)}%)
                </text>
              )}
            </g>
          );
        })}

        {/* X축 날짜 */}
        {xIndices.map((idx) => {
          const d = new Date(safeData[idx]?.date);
          return (
            <text key={`x${idx}`} x={x(idx) + barW / 2} y={height - 6}
              fill="#94a3b8" fontSize={fs.x} textAnchor="middle" fontWeight="500">
              {(d.getMonth() + 1) + "/" + d.getDate()}
            </text>
          );
        })}

        {/* 캔들스틱 */}
        {safeData.map((c, i) => {
          const isUp = c.close >= c.open;
          const col = isUp ? "#10b981" : "#ef4444";
          const isHover = hoverIdx === i;
          return (
            <g key={`c${i}`} opacity={hoverIdx !== null && !isHover ? 0.45 : 1}>
              <line x1={x(i) + barW / 2} y1={y(c.high)} x2={x(i) + barW / 2} y2={y(c.low)}
                stroke={col} strokeWidth={isWide ? 1 : 0.8} />
              <rect x={x(i)} y={y(Math.max(c.open, c.close))}
                width={barW} height={Math.max(1, Math.abs(y(c.open) - y(c.close)))}
                fill={col} stroke={isHover ? '#fff' : 'none'} strokeWidth={isHover ? 1 : 0} />
            </g>
          );
        })}

        {/* 이동평균선 */}
        {renderMA(ma20Data, '#06b6d4')}
        {renderMA(ma60Data, '#f59e0b')}

        {/* 추세선 */}
        {trendData && (
          <line x1={x(0) + barW / 2} y1={y(trendData.getY(0))}
            x2={x(safeData.length - 1) + barW / 2} y2={y(trendData.getY(safeData.length - 1))}
            stroke="#ec4899" strokeWidth={1.5} strokeDasharray="6,3" opacity={0.6} />
        )}

        {/* 매수가 기준선 */}
        <line x1={pad.left} y1={y(buyPrice)} x2={width - pad.right} y2={y(buyPrice)}
          stroke="#3b82f6" strokeWidth={1.5} strokeDasharray="4,2" />
        <rect x={width - pad.right} y={y(buyPrice) - buyLabelH / 2} width={buyLabelW} height={buyLabelH}
          fill="#3b82f6" rx={3} />
        <text x={width - pad.right + 4} y={y(buyPrice) + 5} fill="#fff" fontSize={fs.label} fontWeight="700">
          매수 {buyPrice.toLocaleString()}
        </text>

        {/* 매도 기준선들 */}
        {renderLine("stopLoss", sellPrices?.stopLoss, "#ef4444", "손절")}
        {renderLine("twoThird", sellPrices?.twoThird, "#8b5cf6", "2/3익")}
        {renderLine("maSignal", sellPrices?.maSignal, "#06b6d4", "이평", "4,2")}
        {renderLine("volumeZone", sellPrices?.volumeZone, "#84cc16", "지지", "6,3")}
        {renderLine("trendline", sellPrices?.trendline, "#ec4899", "지지", "8,4")}

        {/* MA 범례 */}
        {(overlays.ma20 || overlays.ma60) && (
          <g>
            {overlays.ma20 && (<>
              <line x1={width - pad.right + 4} y1={pad.top + 6} x2={width - pad.right + 16} y2={pad.top + 6} stroke="#06b6d4" strokeWidth={1.5} />
              <text x={width - pad.right + 19} y={pad.top + 9} fill="#06b6d4" fontSize={8} fontWeight="600">20</text>
            </>)}
            {overlays.ma60 && (<>
              <line x1={width - pad.right + 4} y1={pad.top + 16} x2={width - pad.right + 16} y2={pad.top + 16} stroke="#f59e0b" strokeWidth={1.5} />
              <text x={width - pad.right + 19} y={pad.top + 19} fill="#f59e0b" fontSize={8} fontWeight="600">60</text>
            </>)}
          </g>
        )}

        {/* 현재가 마커 */}
        <circle cx={x(safeData.length - 1) + barW / 2} cy={y(cur)} r={isWide ? 5 : 4}
          fill={cur >= buyPrice ? "#10b981" : "#ef4444"} stroke="#fff" strokeWidth={1} />

        {/* 크로스헤어 */}
        {hoverIdx !== null && hoverCandle && (
          <g>
            <line x1={x(hoverIdx) + barW / 2} y1={pad.top} x2={x(hoverIdx) + barW / 2} y2={height - pad.bottom}
              stroke="rgba(255,255,255,0.3)" strokeWidth={0.8} strokeDasharray="3,2" />
            <line x1={pad.left} y1={y(hoverCandle.close)} x2={width - pad.right} y2={y(hoverCandle.close)}
              stroke="rgba(255,255,255,0.2)" strokeWidth={0.8} strokeDasharray="3,2" />
            <rect x={x(hoverIdx) + barW / 2 - 28} y={height - pad.bottom + 2} width={56} height={18}
              fill="#1e293b" stroke="#475569" strokeWidth={0.5} rx={4} />
            <text x={x(hoverIdx) + barW / 2} y={height - pad.bottom + 14}
              fill="#e2e8f0" fontSize={9} textAnchor="middle" fontWeight="600">
              {(() => { const d = new Date(hoverCandle.date); return `${d.getMonth()+1}/${d.getDate()}`; })()}
            </text>
            <rect x={width - pad.right} y={y(hoverCandle.close) - 9}
              width={isWide ? 82 : isSmall ? 66 : 74} height={18} fill="#334155" rx={3} />
            <text x={width - pad.right + 4} y={y(hoverCandle.close) + 4}
              fill="#f1f5f9" fontSize={fs.label} fontWeight="600">{fmtPrice(hoverCandle.close)}</text>
          </g>
        )}

        {/* MACD 서브차트 */}
        {macdData && showMACD && (
          <g>
            <line x1={pad.left} y1={height + 2} x2={width - pad.right} y2={height + 2} stroke="rgba(255,255,255,0.08)" />
            <text x={pad.left + 2} y={macdTop + 6} fill="#64748b" fontSize={7} fontWeight="600">MACD</text>
            <line x1={pad.left} y1={macdY(0)} x2={width - pad.right} y2={macdY(0)} stroke="rgba(255,255,255,0.08)" strokeDasharray="2,2" />
            {macdData.histogram.map((h, i) => {
              if (isNaN(h)) return null;
              const bH = Math.abs(macdY(0) - macdY(h));
              return <rect key={`mh${i}`} x={x(i)} y={h >= 0 ? macdY(h) : macdY(0)} width={barW} height={Math.max(0.5, bH)} fill={h >= 0 ? 'rgba(16,185,129,0.5)' : 'rgba(239,68,68,0.5)'} />;
            })}
            <polyline points={macdData.macdLine.map((v, i) => isNaN(v) ? '' : `${x(i)+barW/2},${macdY(v)}`).filter(Boolean).join(' ')} fill="none" stroke="#60a5fa" strokeWidth={1} />
            <polyline points={macdData.signalLine.map((v, i) => isNaN(v) ? '' : `${x(i)+barW/2},${macdY(v)}`).filter(Boolean).join(' ')} fill="none" stroke="#f97316" strokeWidth={1} strokeDasharray="2,1" />
          </g>
        )}
      </svg>
    </div>
  );
};

export default EnhancedMiniChart;
