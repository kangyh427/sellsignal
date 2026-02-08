'use client';
// ============================================
// CrestLogo - 로고 SVG 컴포넌트
// 경로: src/components/CrestLogo.tsx
// ============================================

import React from 'react';

interface CrestLogoProps {
  size?: number;
}

const CrestLogo: React.FC<CrestLogoProps> = ({ size = 32 }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
    <rect width="40" height="40" rx="10" fill="linear-gradient(135deg, #1e293b, #0f172a)" />
    <path d="M10 28 L16 14 L20 22 L24 12 L30 28" stroke="#3b82f6" strokeWidth="2.5"
      fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M10 28 L16 14 L20 22 L24 12 L30 28" fill="url(#logoGrad)" opacity="0.15" />
    <circle cx="24" cy="12" r="3" fill="#10b981" />
    <defs>
      <linearGradient id="logoGrad" x1="10" y1="28" x2="30" y2="12">
        <stop offset="0%" stopColor="#3b82f6" />
        <stop offset="100%" stopColor="#10b981" />
      </linearGradient>
    </defs>
  </svg>
);

export default CrestLogo;
