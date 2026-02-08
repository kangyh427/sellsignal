'use client';
// ============================================
// MarketCycleWidget - 코스톨라니 달걀 + 시장 지표
// 경로: src/components/MarketCycleWidget.tsx
// ============================================
// SVG 달걀모형 + 현재 단계 표시 + 4대 지표 카드
// 모바일: 달걀 위→설명 아래 (세로 배치)
// 데스크톱: 달걀 좌→설명 우 (가로 배치)

import React from 'react';

interface MarketCycleWidgetProps {
  isMobile: boolean;
}

const MarketCycleWidget: React.FC<MarketCycleWidgetProps> = ({ isMobile }) => {
  // ── 주요 시장 지표 (데모 데이터) ──
  const indicators = [
    { icon: '🏛', label: '한은금리', value: '3.5%', change: '▲' },
    { icon: '📊', label: 'KOSPI PER', value: '11.8', change: '▼' },
    { icon: '📈', label: '국채3Y', value: '3.52%', change: '▲' },
    { icon: '🇺🇸', label: 'Fed금리', value: '4.5%', change: '→' },
  ];

  return (
    <div
      style={{
        background: 'linear-gradient(145deg, #1e293b, #0f172a)',
        borderRadius: '14px',
        padding: isMobile ? '16px' : '20px',
        border: '1px solid rgba(255,255,255,0.06)',
        marginBottom: '14px',
      }}
    >
      {/* 타이틀 */}
      <div
        style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', marginBottom: '16px',
        }}
      >
        <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#fff', margin: 0 }}>
          🥚 코스톨라니 달걀
        </h3>
        <span style={{ fontSize: '12px', color: '#64748b' }}>신뢰도 75%</span>
      </div>

      {/* 달걀 차트 + 설명 */}
      <div
        style={{
          display: 'flex',
          alignItems: isMobile ? 'center' : 'flex-start',
          gap: '16px',
          flexDirection: isMobile ? 'column' : 'row',
        }}
      >
        {/* SVG 달걀 */}
        <svg
          width={isMobile ? '220' : '200'}
          height={isMobile ? '220' : '200'}
          viewBox="0 0 200 200"
        >
          {/* 달걀 배경 */}
          <ellipse cx="100" cy="105" rx="80" ry="85"
            fill="#1a1a2e" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />

          {/* 축 라벨 */}
          <text x="100" y="30" textAnchor="middle" fill="#64748b" fontSize="11">과열/정점</text>
          <text x="100" y="190" textAnchor="middle" fill="#64748b" fontSize="11">금리저점</text>
          <text x="20" y="105" textAnchor="middle" fill="#64748b" fontSize="11"
            transform="rotate(-90,20,105)">호황기</text>
          <text x="180" y="105" textAnchor="middle" fill="#64748b" fontSize="11"
            transform="rotate(90,180,105)">불황기</text>

          {/* 현재 위치 마커 (4단계) */}
          <circle cx="130" cy="60" r="12"
            fill="rgba(239,68,68,0.3)" stroke="#ef4444" strokeWidth="2" />
          <text x="130" y="64" textAnchor="middle"
            fill="#fff" fontSize="10" fontWeight="700">4</text>

          {/* 영역 라벨 */}
          <text x="100" y="70" textAnchor="middle"
            fill="#ef4444" fontSize="14" fontWeight="700">팔 때</text>
          <text x="100" y="110" textAnchor="middle"
            fill="#94a3b8" fontSize="12">기다릴 때</text>
          <text x="100" y="150" textAnchor="middle"
            fill="#10b981" fontSize="14" fontWeight="700">살 때</text>

          {/* 순환 화살표 */}
          <path d="M 50 60 Q 40 100 55 145"
            stroke="#10b981" fill="none" strokeWidth="2" markerEnd="url(#arrowG)" />
          <path d="M 150 145 Q 160 100 145 60"
            stroke="#ef4444" fill="none" strokeWidth="2" markerEnd="url(#arrowR)" />
          <defs>
            <marker id="arrowG" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
              <polygon points="0 0, 8 3, 0 6" fill="#10b981" />
            </marker>
            <marker id="arrowR" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
              <polygon points="0 0, 8 3, 0 6" fill="#ef4444" />
            </marker>
          </defs>
        </svg>

        {/* 단계 설명 */}
        <div style={{ flex: 1, width: isMobile ? '100%' : 'auto' }}>
          <div
            style={{
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.25)',
              borderRadius: '10px',
              padding: '12px',
              marginBottom: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span
                style={{
                  width: '28px', height: '28px',
                  background: '#ef4444', borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '13px', fontWeight: '700', color: '#fff',
                }}
              >
                4
              </span>
              <div>
                <div style={{ fontSize: '15px', fontWeight: '700', color: '#f87171' }}>
                  금리고점 단계
                </div>
                <div style={{ fontSize: '12px', color: '#94a3b8' }}>주식매도</div>
              </div>
            </div>
            <div style={{ fontSize: '13px', color: '#cbd5e1', marginTop: '8px', lineHeight: '1.5' }}>
              🔴 권장: 매도 관망
            </div>
            <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px', lineHeight: '1.5' }}>
              금리 고점 근처로 주식시장 과열 조정이 예상됩니다.
            </div>
          </div>
        </div>
      </div>

      {/* 시장 지표 카드 */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)',
          gap: '8px',
          marginTop: '12px',
        }}
      >
        {indicators.map((ind, i) => (
          <div
            key={i}
            style={{
              background: 'rgba(255,255,255,0.03)',
              borderRadius: '10px',
              padding: '10px 12px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '18px', marginBottom: '2px' }}>{ind.icon}</div>
            <div style={{ fontSize: '11px', color: '#64748b' }}>{ind.label}</div>
            <div style={{ fontSize: '15px', fontWeight: '700', color: '#e2e8f0' }}>
              {ind.value}{' '}
              <span
                style={{
                  fontSize: '11px',
                  color: ind.change === '▲' ? '#ef4444'
                       : ind.change === '▼' ? '#10b981'
                       : '#64748b',
                }}
              >
                {ind.change}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MarketCycleWidget;
