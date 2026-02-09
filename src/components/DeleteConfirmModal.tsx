'use client';
// ============================================
// DeleteConfirmModal - 종목 삭제 확인 2단계 모달
// 경로: src/components/DeleteConfirmModal.tsx
// 세션 31: 모바일 터치타겟 44px 최적화
// ============================================

import React from 'react';

interface DeleteConfirmModalProps {
  stockName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * 종목 삭제 확인 모달
 * - 오버레이 클릭으로 취소
 * - 취소/삭제 2단계 확인
 * - slideUp 애니메이션 (CRESTApp에서 정의)
 * - 세션 31: 버튼 minHeight 44px 터치타겟 적용
 */
const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  stockName,
  onConfirm,
  onCancel,
}) => {
  return (
    <div
      onClick={onCancel}
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 300,
        padding: '20px',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'linear-gradient(145deg, #1e293b, #0f172a)',
          borderRadius: '16px',
          padding: '24px',
          width: '100%',
          maxWidth: '320px',
          border: '1px solid rgba(255,255,255,0.1)',
          animation: 'slideUp 0.25s ease-out',
        }}
      >
        {/* 아이콘 + 제목 */}
        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>🗑️</div>
          <div style={{ fontSize: '16px', fontWeight: '700', color: '#fff' }}>
            종목 삭제
          </div>
          <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
            {stockName}을(를) 삭제하시겠습니까?
          </div>
        </div>

        {/* 버튼 그룹 — 세션 31: minHeight 44px 추가 */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1,
              padding: '12px',
              minHeight: '44px',
              borderRadius: '10px',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#94a3b8',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1,
              padding: '12px',
              minHeight: '44px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
              border: 'none',
              color: '#fff',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            삭제
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
