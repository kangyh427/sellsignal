'use client';
// ============================================
// BuffettIndicatorWidget v7 - 한미 이중 반원 게이지
// 경로: src/components/BuffettIndicatorWidget.tsx
// 세션 29: 모바일 최적화 — 게이지 크기, 범례 2x2 그리드
// ============================================

import React from 'react';

interface BuffettIndicatorWidgetProps {
  isMobile: boolean;
  isPremium: boolean;
}

const BuffettIndicatorWidget = ({ isMobile, isPremium }: BuffettIndicatorWidgetProps) => {
  const countries = [
    { name: '한국', ratio: 98, label: '적정 수준' },
    { name: '미국', ratio: 185, label: '극단적 고평가' },
  ];

  const getColor = (r: number) => {
    if (r < 70) return '#10b981';
    if (r < 100) return '#eab308';
    if (r < 150) return '#f97316';
    return '#ef4444';
  };

  const GaugeChart = ({ ratio, name, label }: { ratio: number; name: string; label: string }) => {
    const maxR = 250;
    const pct = Math.min(ratio / maxR, 1);
    const col = getColor(ratio);
    // ★ 세션29: 모바일 게이지 크기 조정
    const sw = isMobile ? 150 : 160;
    const sh = isMobile ? 100 : 105;
    const gcx = sw / 2;
    const gcy = sh - 20;
    const r = isMobile ? 50 : 56;

    const endAngle = Math.PI + pct * Math.PI;
    const fX = gcx + r * Math.cos(endAngle);
    const fY = gcy + r * Math.sin(endAngle);

    return (
      <div style={{ textAlign: 'center', flex: 1, minWidth: isMobile ? '130px' : '140px', maxWidth: '175px' }}>
        <div style={{
          display: 'inline-block', padding: '3px 10px', borderRadius: '6px',
          background: col + '15', border: `1px solid ${col}30`, marginBottom: '6px',
        }}>
          <span style={{ fontSize: isMobile ? '12px' : '13px', fontWeight: '700', color: col }}>
            {name} 버핏지수
          </span>
        </div>

        <svg width={sw} height={sh} viewBox={`0 0 ${sw} ${sh}`}
          style={{ display: 'block', margin: '0 auto' }}>
          <path
            d={`M ${gcx - r} ${gcy} A ${r} ${r} 0 0 1 ${gcx + r} ${gcy}`}
            fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="12" strokeLinecap="round" />
          <path
            d={`M ${gcx - r} ${gcy} A ${r} ${r} 0 0 1 ${fX} ${fY}`}
            fill="none" stroke={col} strokeWidth="12" strokeLinecap="round" />
          <text x={gcx} y={gcy - 20} textAnchor="middle"
            fill="#fff" fontSize={isMobile ? '22' : '26'} fontWeight="800">{ratio}%</text>
          <text x={gcx} y={gcy - 2} textAnchor="middle"
            fill={col} fontSize="11" fontWeight="600">{label}</text>
          <text x={gcx - r} y={gcy + 16} textAnchor="middle"
            fill="#64748b" fontSize="9">0%</text>
          <text x={gcx + r} y={gcy + 16} textAnchor="middle"
            fill="#64748b" fontSize="9">250%</text>
        </svg>
      </div>
    );
  };

  return (
    <div style={{
      background: 'linear-gradient(145deg, #1e293b, #0f172a)',
      borderRadius: '14px', padding: isMobile ? '14px' : '20px',
      border: '1px solid rgba(255,255,255,0.06)', marginBottom: '14px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <h3 style={{ fontSize: isMobile ? '15px' : '16px', fontWeight: '700', color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
          버핏지수 (시가총액/GDP)
          {!isPremium && <span style={{ fontSize: '10px', color: '#a78bfa', background: 'rgba(139,92,246,0.15)', padding: '2px 6px', borderRadius: '4px' }}>PRO</span>}
        </h3>
      </div>

      {/* ★ 세션29: 모바일 gap 축소 */}
      <div style={{
        display: 'flex', justifyContent: 'center',
        gap: isMobile ? '8px' : '40px',
        marginBottom: '14px', alignItems: 'flex-start',
      }}>
        {countries.map((c) => <GaugeChart key={c.name} {...c} />)}
      </div>

      {/* ★ 세션29: 범례 — 모바일 2x2 그리드 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, auto)',
        gap: isMobile ? '6px' : '8px',
        justifyContent: isMobile ? 'stretch' : 'center',
        padding: '8px 12px',
        background: 'rgba(255,255,255,0.02)', borderRadius: '8px',
      }}>
        {[
          { label: '저평가', range: '<70%', color: '#10b981' },
          { label: '적정', range: '70-100%', color: '#eab308' },
          { label: '고평가', range: '100-150%', color: '#f97316' },
          { label: '극단적', range: '>150%', color: '#ef4444' },
        ].map((item) => (
          <div key={item.label} style={{
            display: 'flex', alignItems: 'center', gap: '4px',
            fontSize: '10px', color: '#94a3b8',
            justifyContent: isMobile ? 'center' : 'flex-start',
          }}>
            <span style={{
              width: '8px', height: '8px', borderRadius: '2px',
              background: item.color, flexShrink: 0,
            }} />
            <span style={{ fontWeight: '600' }}>{item.label}</span>
            <span style={{ color: '#475569' }}>{item.range}</span>
          </div>
        ))}
      </div>

      {/* PRO 안내 */}
      <div style={{
        marginTop: '10px', textAlign: 'center', padding: '8px 12px',
        background: 'rgba(139,92,246,0.06)', borderRadius: '8px',
        border: '1px solid rgba(139,92,246,0.12)',
      }}>
        <span style={{ fontSize: '11px', color: '#a78bfa' }}>
          PRO — 실시간 업데이트 + 역사적 추이 비교 (추후 제공)
        </span>
      </div>
    </div>
  );
};

export default BuffettIndicatorWidget;
