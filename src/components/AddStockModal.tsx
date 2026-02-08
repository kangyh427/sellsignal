'use client';
// ============================================
// AddStockModal - 종목 추가 모달 (데모용)
// 경로: src/components/AddStockModal.tsx
// ============================================
// 모바일: 바텀시트 패턴 (하단에서 올라옴)
// 데스크톱: 센터 모달
// 현재 데모 모드 → 실제 배포 시 검색 기능 활성화

import React from 'react';

interface AddStockModalProps {
  isMobile: boolean;
  onClose: () => void;
}

const AddStockModal: React.FC<AddStockModalProps> = ({ isMobile, onClose }) => (
  <div
    style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.7)',
      display: 'flex',
      alignItems: isMobile ? 'flex-end' : 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: isMobile ? '0' : '24px',
    }}
  >
    <div
      style={{
        background: 'linear-gradient(145deg, #1e293b, #0f172a)',
        borderRadius: isMobile ? '20px 20px 0 0' : '20px',
        padding: '24px',
        width: '100%',
        maxWidth: isMobile ? '100%' : '480px',
        maxHeight: isMobile ? '85vh' : '90vh',
        overflow: 'auto',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      {/* 드래그 핸들 (모바일) */}
      {isMobile && (
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
          <div
            style={{
              width: '36px', height: '4px',
              background: 'rgba(255,255,255,0.2)',
              borderRadius: '2px',
            }}
          />
        </div>
      )}

      {/* 헤더 */}
      <div
        style={{
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', marginBottom: '20px',
        }}
      >
        <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#fff', margin: 0 }}>
          종목 추가
        </h2>
        <button
          onClick={onClose}
          style={{
            background: 'rgba(255,255,255,0.08)',
            border: 'none', borderRadius: '8px',
            width: '36px', height: '36px',
            color: '#94a3b8', fontSize: '18px',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          ✕
        </button>
      </div>

      {/* 데모 안내 */}
      <div
        style={{
          textAlign: 'center', padding: '40px 20px',
          color: '#64748b', fontSize: '14px',
        }}
      >
        <div style={{ fontSize: '40px', marginBottom: '12px' }}>🔍</div>
        <div>종목 검색 기능은 실제 배포 버전에서 사용 가능합니다</div>
        <button
          onClick={onClose}
          style={{
            marginTop: '20px',
            padding: '12px 24px',
            background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
            border: 'none', borderRadius: '10px',
            color: '#fff', fontSize: '14px', fontWeight: '600',
            cursor: 'pointer',
          }}
        >
          확인
        </button>
      </div>
    </div>
  </div>
);

export default AddStockModal;
