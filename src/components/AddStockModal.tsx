'use client';
// ============================================
// AddStockModal - 종목 추가 검색 모달
// 경로: src/components/AddStockModal.tsx
// 세션 18A: 17f 기반, 바텀시트(모바일)/센터(데스크톱)
// ============================================

import React from 'react';

interface AddStockModalProps {
  isMobile: boolean;
  maxFreePositions: number;
  onClose: () => void;
}

const AddStockModal: React.FC<AddStockModalProps> = ({ isMobile, maxFreePositions, onClose }) => (
  <div onClick={(e) => (e.target as HTMLElement) === e.currentTarget && onClose()} style={{
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
    display: 'flex', alignItems: isMobile ? 'flex-end' : 'center',
    justifyContent: 'center', zIndex: 1000,
  }}>
    <div style={{
      background: 'linear-gradient(145deg, #1e293b, #0f172a)',
      borderRadius: isMobile ? '20px 20px 0 0' : '20px',
      padding: '24px', width: '100%', maxWidth: isMobile ? '100%' : '480px',
      border: '1px solid rgba(255,255,255,0.08)',
    }}>
      {isMobile && (
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
          <div style={{ width: '36px', height: '4px', background: 'rgba(255,255,255,0.2)', borderRadius: '2px' }} />
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#fff', margin: 0 }}>종목 추가</h2>
        <button onClick={onClose} style={{
          background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '8px',
          width: '36px', height: '36px', color: '#94a3b8', fontSize: '18px', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>✕</button>
      </div>
      <div style={{ textAlign: 'center', padding: '20px 20px 30px' }}>
        <div style={{ position: 'relative', marginBottom: '16px' }}>
          <input type="text" placeholder="종목명 또는 코드 검색" style={{
            width: '100%', padding: '14px 16px 14px 40px', fontSize: '15px',
            background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '12px', color: '#fff', outline: 'none',
            boxSizing: 'border-box',
          }} />
          <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '16px', color: '#64748b' }}>🔍</span>
        </div>
        <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '8px' }}>종목명이나 코드를 입력하세요</div>
        <div style={{ fontSize: '12px', color: '#475569' }}>
          무료: 최대 {maxFreePositions}종목 | PRO: 무제한
        </div>
        <div style={{ fontSize: '11px', color: '#334155', marginTop: '12px' }}>
          ※ 실제 종목 검색은 배포 버전에서 지원됩니다
        </div>
      </div>
    </div>
  </div>
);

export default AddStockModal;
