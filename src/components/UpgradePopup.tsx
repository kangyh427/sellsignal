'use client';
// ============================================
// UpgradePopup - 프리미엄 업그레이드 팝업
// 경로: src/components/UpgradePopup.tsx
// ============================================

import React from 'react';

interface UpgradePopupProps {
  isMobile: boolean;
  onClose: () => void;
}

const UpgradePopup: React.FC<UpgradePopupProps> = ({ isMobile, onClose }) => (
  <div
    style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.85)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000,
      padding: isMobile ? '16px' : '40px',
    }}
  >
    <div
      style={{
        background: 'linear-gradient(145deg, #1e293b, #0f172a)',
        borderRadius: '20px',
        padding: isMobile ? '24px' : '32px',
        maxWidth: '420px', width: '100%',
        border: '1px solid rgba(139,92,246,0.3)',
        boxShadow: '0 0 60px rgba(139,92,246,0.15)',
      }}
    >
      {/* 타이틀 */}
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <div style={{ fontSize: '48px', marginBottom: '8px' }}>👑</div>
        <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#fff', margin: '0 0 6px' }}>
          프리미엄 멤버십
        </h2>
        <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>
          더 강력한 매도 시그널 도구
        </p>
      </div>

      {/* 가격 */}
      <div
        style={{
          background: 'rgba(139,92,246,0.1)',
          borderRadius: '12px', padding: '16px',
          textAlign: 'center', marginBottom: '20px',
          border: '1px solid rgba(139,92,246,0.25)',
        }}
      >
        <div style={{ fontSize: '13px', color: '#a78bfa', marginBottom: '4px' }}>월 구독료</div>
        <div style={{ fontSize: '32px', fontWeight: '800', color: '#fff' }}>
          ₩5,900
          <span style={{ fontSize: '14px', color: '#64748b', fontWeight: '400' }}>/월</span>
        </div>
        <div style={{ fontSize: '12px', color: '#10b981', marginTop: '4px' }}>
          🎁 첫 7일 무료 체험
        </div>
      </div>

      {/* CTA 버튼 */}
      <button
        onClick={onClose}
        style={{
          width: '100%', padding: '16px',
          background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
          border: 'none', borderRadius: '12px',
          color: '#fff', fontSize: '15px', fontWeight: '700',
          cursor: 'pointer', marginBottom: '10px',
        }}
      >
        🎉 7일 무료로 시작하기
      </button>
      <button
        onClick={onClose}
        style={{
          width: '100%', padding: '12px',
          background: 'transparent',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '10px',
          color: '#64748b', fontSize: '13px',
          cursor: 'pointer',
        }}
      >
        나중에 할게요
      </button>
    </div>
  </div>
);

export default UpgradePopup;
