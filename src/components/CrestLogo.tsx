'use client';
// ============================================
// CrestLogo - CREST 로고 컴포넌트
// 경로: src/components/CrestLogo.tsx
// ============================================

import React from 'react';

interface CrestLogoProps {
  size?: number;
}

const CrestLogo: React.FC<CrestLogoProps> = ({ size = 36 }) => (
  <div
    style={{
      width: `${size}px`,
      height: `${size}px`,
      background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
      borderRadius: `${size * 0.28}px`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: `${size * 0.5}px`,
      flexShrink: 0,
    }}
  >
    📈
  </div>
);

export default CrestLogo;
