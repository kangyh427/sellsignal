'use client';

import React from 'react';

// ============================================
// AdColumn 컴포넌트
// 위치: src/components/AdColumn.tsx
//
// SellSignalApp.tsx 라인 322~365에서 추출
// 데스크탑 좌측 광고 + 프리미엄 광고 제거 배너
// ============================================

interface AdColumnProps {
  onUpgrade: () => void;
}

const AdColumn: React.FC<AdColumnProps> = ({ onUpgrade }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* 광고 슬롯 2개 */}
      {[1, 2].map((i) => (
        <div
          key={i}
          style={{
            background: 'linear-gradient(180deg, #1f2937 0%, #111827 100%)',
            borderRadius: '12px',
            padding: '16px',
            border: '1px solid rgba(255,255,255,0.05)',
            textAlign: 'center',
            flex: 1,
            minHeight: '180px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div style={{ fontSize: '11px', color: '#4b5563', marginBottom: '8px' }}>광고</div>
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>📢</div>
          <div style={{ fontSize: '11px', color: '#374151' }}>Google AdMob</div>
        </div>
      ))}

      {/* 프리미엄 광고 제거 CTA */}
      <div
        onClick={onUpgrade}
        style={{
          background:
            'linear-gradient(135deg, rgba(139,92,246,0.2) 0%, rgba(59,130,246,0.2) 100%)',
          borderRadius: '12px',
          padding: '16px',
          border: '1px solid rgba(139,92,246,0.3)',
          textAlign: 'center',
          cursor: 'pointer',
        }}
      >
        <div style={{ fontSize: '22px', marginBottom: '6px' }}>👑</div>
        <div style={{ fontSize: '12px', color: '#a78bfa', fontWeight: '600' }}>
          광고 제거
        </div>
        <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>프리미엄</div>
      </div>
    </div>
  );
};

export default AdColumn;
