'use client';
// ============================================
// MarketMiniSummary - 포지션 탭 상단 시장 요약 배너
// 경로: src/components/MarketMiniSummary.tsx
// ============================================
// 모바일 포지션 탭에서 시장 탭으로 유도하는 미니 배너

import React from 'react';

interface MarketMiniSummaryProps {
  onClick: () => void;
}

const MarketMiniSummary: React.FC<MarketMiniSummaryProps> = ({ onClick }) => (
  <button
    onClick={onClick}
    style={{
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 14px',
      marginBottom: '12px',
      background: 'linear-gradient(135deg, rgba(59,130,246,0.08), rgba(139,92,246,0.06))',
      border: '1px solid rgba(59,130,246,0.12)',
      borderRadius: '12px',
      cursor: 'pointer',
      textAlign: 'left',
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <span style={{ fontSize: '20px' }}>🌐</span>
      <div>
        <div style={{ fontSize: '13px', fontWeight: '600', color: '#e2e8f0' }}>
          시장 분석
        </div>
        <div style={{ fontSize: '11px', color: '#64748b' }}>
          코스톨라니 달걀모형 · 지표 현황
        </div>
      </div>
    </div>
    <span style={{ color: '#64748b', fontSize: '16px' }}>›</span>
  </button>
);

export default MarketMiniSummary;
