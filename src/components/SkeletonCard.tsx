'use client';
// ============================================
// SkeletonCard - 스켈레톤 로딩 UI
// 경로: src/components/SkeletonCard.tsx
// 세션 26B: 모바일 UX 고도화
// ============================================

import React from 'react';

/**
 * 포지션 카드 로딩 플레이스홀더
 * - skeletonPulse 애니메이션 (CRESTApp에서 정의)
 * - 실제 카드 레이아웃과 동일한 골격 구조
 */
const SkeletonCard: React.FC = () => (
  <div style={{
    background: 'linear-gradient(145deg, #1e293b, #0f172a)',
    borderRadius: '14px',
    padding: '16px',
    marginBottom: '10px',
    border: '1px solid rgba(255,255,255,0.06)',
    animation: 'skeletonPulse 1.5s ease-in-out infinite',
  }}>
    {/* 상단: 아이콘 + 제목 + 수익률 */}
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
      <div style={{
        width: 36, height: 36, borderRadius: '10px',
        background: 'rgba(255,255,255,0.06)',
      }} />
      <div style={{ flex: 1 }}>
        <div style={{
          width: '60%', height: 14, borderRadius: 4,
          background: 'rgba(255,255,255,0.06)', marginBottom: 6,
        }} />
        <div style={{
          width: '40%', height: 10, borderRadius: 4,
          background: 'rgba(255,255,255,0.04)',
        }} />
      </div>
      <div style={{
        width: 60, height: 20, borderRadius: 6,
        background: 'rgba(255,255,255,0.06)',
      }} />
    </div>
    {/* 하단: 2칼럼 정보 */}
    <div style={{ display: 'flex', gap: '8px' }}>
      <div style={{
        flex: 1, height: 40, borderRadius: 8,
        background: 'rgba(255,255,255,0.04)',
      }} />
      <div style={{
        flex: 1, height: 40, borderRadius: 8,
        background: 'rgba(255,255,255,0.04)',
      }} />
    </div>
  </div>
);

export default SkeletonCard;
